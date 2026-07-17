import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { getSeedData } from '../db/seed';
import { LocalDb } from '../db/localDb';
import {
  BACKUP_SCHEMA_VERSION,
  DEFAULT_INVENTORY,
  ExportImport,
  StorageLike
} from '../lib/export-import';
import {
  buildSupabaseHeaders,
  captureSnapshot,
  restoreSnapshot,
  shouldCaptureKey
} from '../cloudAccount';
import { CHARACTER_SPRITES, SPRITE_SHEETS } from '../lib/character-sprites';
import {
  SPRITE_ANIMATION_SETS,
  SPRITE_ATLAS_COLUMN_COUNT,
} from '../lib/sprite-animation-registry';
import { HAZBIN_DIRECTORY_PROFILES } from '../data/hazbin-directory';

class MemoryStorage implements StorageLike {
  protected values = new Map<string, string>();

  public get length() { return this.values.size; }
  public clear() { this.values.clear(); }
  public getItem(key: string) { return this.values.get(key) ?? null; }
  public key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  public removeItem(key: string) { this.values.delete(key); }
  public setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

class FailingStorage extends MemoryStorage {
  public failNextWrite = false;

  public override setItem(key: string, value: string) {
    if (this.failNextWrite) {
      this.failNextWrite = false;
      throw new Error('simulated quota failure');
    }
    super.setItem(key, value);
  }
}

function runtimeDatabaseJson(): string {
  const storage = new MemoryStorage();
  new LocalDb(storage);
  return storage.getItem('hellbound_hotel_db_state')!;
}

function readPngMetadata(publicPath: string) {
  const absolutePath = resolve(process.cwd(), 'public', publicPath.replace(/^\//, ''));
  const png = readFileSync(absolutePath);
  expect(png.subarray(0, 8).toString('hex'), absolutePath).toBe('89504e470d0a1a0a');
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
    colorType: png[25]
  };
}

describe('generated character sprite coverage', () => {
  it('maps every seeded character to one portrait and one documented atlas row', () => {
    const seed = getSeedData();
    const sheetPaths = new Set(SPRITE_SHEETS.map((sheet) => sheet.path));

    const readyDirectorySpriteCount = HAZBIN_DIRECTORY_PROFILES.filter(({ existingOperationalProfile, assetStatus }) => (
      !existingOperationalProfile && assetStatus === 'ready'
    )).length;

    expect(Object.keys(CHARACTER_SPRITES)).toHaveLength(seed.characters.length + readyDirectorySpriteCount);
    for (const character of seed.characters) {
      const sprite = CHARACTER_SPRITES[character.id];
      expect(sprite, `missing sprite mapping for ${character.id}`).toBeDefined();
      expect(sprite.portrait).toBe(`/assets/sprites/portraits/${character.id}.png`);
      expect(sheetPaths.has(sprite.sheet)).toBe(true);
      expect(sprite.row).toBeGreaterThanOrEqual(0);
      expect(sprite.row).toBeLessThan(4);
      expect(SPRITE_ANIMATION_SETS[sprite.animationSetId]).toBeDefined();
    }
  });

  it('keeps atlas rows unique and every published PNG present at its contract size', () => {
    const rowKeys = new Set<string>();
    expect(SPRITE_SHEETS).toHaveLength(6);

    for (const sheet of SPRITE_SHEETS) {
      expect(sheet.characters).toHaveLength(4);
      expect(readPngMetadata(sheet.path)).toEqual({
        width: 1536,
        height: 1024,
        colorType: 6
      });
    }

    for (const [characterId, sprite] of Object.entries(CHARACTER_SPRITES)) {
      const rowKey = `${sprite.sheet}:${sprite.row}`;
      expect(rowKeys.has(rowKey), `duplicate atlas row for ${characterId}`).toBe(false);
      rowKeys.add(rowKey);
      expect(readPngMetadata(sprite.portrait)).toEqual({
        width: 512,
        height: 512,
        colorType: 6
      });
      expect(SPRITE_ANIMATION_SETS[sprite.animationSetId].columnRoles)
        .toHaveLength(SPRITE_ATLAS_COLUMN_COUNT);
    }

    expect(rowKeys).toHaveLength(Object.keys(CHARACTER_SPRITES).length);
  });
});

describe('versioned backup integrity', () => {
  it('exports the complete database and separately stored inventory', () => {
    const storage = new MemoryStorage();
    storage.setItem('h_inv_bar', '31');
    storage.setItem('h_inv_clean', '7');
    storage.setItem('h_inv_food', '19');

    const exported = JSON.parse(ExportImport.exportToJson(getSeedData(), storage));
    expect(exported.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);
    expect(exported.inventory).toEqual({ bar: 31, clean: 7, food: 19 });
    expect(exported.characters.length).toBeGreaterThan(0);
    expect(exported.gameplayMeta).toBeDefined();
    expect(ExportImport.validateBackup(JSON.stringify(exported), { requireInventory: true }).isValid).toBe(true);
  });

  it('requires every schema-v4 section while migrating only older backups', () => {
    const storage = new MemoryStorage();
    const complete = JSON.parse(ExportImport.exportToJson(getSeedData(), storage)) as Record<string, unknown>;

    const missingList = { ...complete };
    delete missingList.incidents;
    expect(ExportImport.validateBackup(JSON.stringify(missingList), { requireInventory: true }).error)
      .toContain("missing required list field 'incidents'");

    const missingMeta = { ...complete };
    delete missingMeta.gameplayMeta;
    expect(ExportImport.validateBackup(JSON.stringify(missingMeta), { requireInventory: true }).error)
      .toContain("missing required structure field 'gameplayMeta'");

    const missingExtensions = { ...complete };
    delete missingExtensions.extensions;
    expect(ExportImport.validateBackup(JSON.stringify(missingExtensions), { requireInventory: true }).error)
      .toContain("missing required structure field 'extensions'");

    const missingInventory = { ...complete };
    delete missingInventory.inventory;
    expect(ExportImport.validateBackup(JSON.stringify(missingInventory), { requireInventory: true }).error)
      .toContain("missing required structure field 'inventory'");

    const incompleteReputation = {
      ...complete,
      reputation: { ...(complete.reputation as Record<string, unknown>) }
    };
    delete (incompleteReputation.reputation as Record<string, unknown>).internalTrust;
    expect(ExportImport.validateBackup(JSON.stringify(incompleteReputation), { requireInventory: true }).error)
      .toContain('reputation.internalTrust');

    const legacyV3: Record<string, unknown> = { ...complete, schemaVersion: 3 };
    delete legacyV3.extensions;
    const legacyResult = ExportImport.validateBackup(JSON.stringify(legacyV3), { requireInventory: true });
    expect(legacyResult.isValid).toBe(true);
    expect(legacyResult.migrated).toBe(true);
    expect(legacyResult.parsedState?.extensions).toEqual({});
    expect(legacyResult.warnings).toContain(
      'Legacy backup migrated with optional content extensions disabled and no core data loss.'
    );

    const legacyV2: Record<string, unknown> = { ...complete, schemaVersion: 2 };
    delete legacyV2.extensions;
    delete legacyV2.gameplayMeta;
    delete legacyV2.inventory;
    delete legacyV2.incidents;
    const olderLegacyResult = ExportImport.validateBackup(JSON.stringify(legacyV2), { requireInventory: true });
    expect(olderLegacyResult.isValid).toBe(true);
    expect(olderLegacyResult.migrated).toBe(true);
    expect(olderLegacyResult.parsedState?.inventory).toEqual(DEFAULT_INVENTORY);
  });

  it('surfaces malformed stored inventory instead of silently using defaults', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const storage = new MemoryStorage();
    storage.setItem('hellbound_hotel_db_state', runtimeDatabaseJson());
    storage.setItem('h_inv_bar', 'not-a-number');
    expect(() => ExportImport.readInventory(storage)).toThrow("Stored inventory 'h_inv_bar'");
    const database = new LocalDb(storage);
    expect(database.getStorageStatus()).toMatchObject({
      ok: false,
      persistent: true,
      lastError: { operation: 'INVENTORY_READ' }
    });
    expect(database.saveSettings({ ...database.getFullState().settings, theme: 'high-contrast' })).toBe(false);
    expect(database.getStorageStatus().lastError?.operation).toBe('SETTINGS_SAVE_INVENTORY_READ');
    consoleError.mockRestore();
  });

  it('migrates recognized legacy backups without accepting dangling references', () => {
    const legacy = { ...getSeedData() } as Record<string, unknown>;
    delete legacy.rehabilitationSessions;
    delete legacy.incidents;
    delete legacy.staffTasks;
    delete legacy.resourceLedger;
    delete legacy.auditLogs;

    const migrated = ExportImport.validateBackup(JSON.stringify(legacy));
    expect(migrated.isValid).toBe(true);
    expect(migrated.migrated).toBe(true);
    expect(migrated.parsedState?.rehabilitationSessions).toEqual([]);

    const corrupt = getSeedData();
    corrupt.rooms[0] = { ...corrupt.rooms[0], occupantId: 'missing_character' };
    const rejected = ExportImport.validateBackup(JSON.stringify(corrupt));
    expect(rejected.isValid).toBe(false);
    expect(rejected.error).toContain('missing occupant');
  });
});

describe('LocalDb recovery and referential integrity', () => {
  it('preserves invalid raw storage in a recovery slot before reseeding', () => {
    const storage = new MemoryStorage();
    storage.setItem('hellbound_hotel_db_state', '{broken-json');

    const database = new LocalDb(storage);
    const recoveryKey = database.getRecoveryKeys()[0];
    expect(recoveryKey).toMatch(/^hellbound_hotel_db_state_recovery_/);
    expect(storage.getItem(recoveryKey)).toBe('{broken-json');
    expect(database.getRecoverySnapshot(recoveryKey)).toBe('{broken-json');
    expect(database.getFullState().characters.length).toBeGreaterThan(0);
  });

  it('commits timeline state and its audit entry together', () => {
    const storage = new FailingStorage();
    const database = new LocalDb(storage);
    const original = database.getFullState();

    expect(database.transaction('TIMELINE_VIEW_CHANGE', (draft) => {
      draft.timeline = { ...draft.timeline, current: 'season_2', hotelState: 'rebuilt' };
    }, {
      action: 'TIMELINE_VIEW_CHANGE',
      details: 'Atomic timeline test.'
    })).toBe(true);
    expect(database.getFullState().timeline.current).toBe('season_2');
    expect(database.getFullState().auditLogs[0].details).toBe('Atomic timeline test.');

    const beforeFailure = database.getFullState();
    storage.failNextWrite = true;
    expect(database.transaction('TIMELINE_VIEW_CHANGE', (draft) => {
      draft.timeline = original.timeline;
    }, {
      action: 'TIMELINE_VIEW_CHANGE',
      details: 'Must roll back.'
    })).toBe(false);
    expect(database.getFullState()).toEqual(beforeFailure);
  });

  it('rolls back failed writes and exposes the storage error through the API', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const storage = new FailingStorage();
    const database = new LocalDb(storage);
    const before = database.getReputation();
    storage.failNextWrite = true;

    const saved = database.saveReputation({ ...before, internalTrust: before.internalTrust - 1 });
    expect(saved).toBe(false);
    expect(database.getReputation()).toEqual(before);
    expect(database.getStorageStatus().lastError?.message).toContain('simulated quota failure');
    consoleError.mockRestore();
  });

  it('imports a migrated legacy backup without persisting a partial broken shape', () => {
    const storage = new MemoryStorage();
    const database = new LocalDb(storage);
    const legacy = { ...getSeedData() } as Record<string, unknown>;
    delete legacy.rehabilitationSessions;
    delete legacy.incidents;
    delete legacy.staffTasks;
    delete legacy.resourceLedger;
    delete legacy.auditLogs;
    const validation = ExportImport.validateBackup(JSON.stringify(legacy));

    expect(validation.isValid).toBe(true);
    expect(database.importState(validation.parsedState!)).toBe(true);
    const restored = database.getFullState();
    expect(restored.rehabilitationSessions).toEqual([]);
    expect(restored.auditLogs[0].action).toBe('DATABASE_IMPORT');
    expect(ExportImport.validateBackup(storage.getItem('hellbound_hotel_db_state')!).isValid).toBe(true);
  });

  it('cascades character deletion across every character reference', () => {
    const database = new LocalDb(new MemoryStorage());
    expect(database.deleteCharacter('angeldust')).toBe(true);
    const state = database.getFullState();

    expect(state.characters.some(character => character.id === 'angeldust')).toBe(false);
    expect(state.rooms.some(room => room.occupantId === 'angeldust' || room.occupantIds?.includes('angeldust') || room.lastInspectedBy === 'angeldust')).toBe(false);
    expect(state.rehabilitationPlans.some(plan => plan.characterId === 'angeldust')).toBe(false);
    expect(state.rehabilitationSessions.some(session => session.planId === 'plan_angeldust' || session.conductedBy === 'angeldust')).toBe(false);
    expect(state.incidents.some(incident => incident.residentsInvolved.includes('angeldust'))).toBe(false);
    expect(state.staffTasks.some(task => task.assignedTo === 'angeldust')).toBe(false);
    expect(state.relationships.some(relation => relation.charAId === 'angeldust' || relation.charBId === 'angeldust')).toBe(false);
  });

  it('promotes the remaining resident when a shared room primary occupant is deleted', () => {
    const database = new LocalDb(new MemoryStorage());
    expect(database.deleteCharacter('charlie')).toBe(true);
    const sharedRoom = database.getRooms().find(room => room.occupantIds?.includes('vaggie'));
    expect(sharedRoom?.occupantIds).toEqual(['vaggie']);
    expect(sharedRoom?.occupantId).toBe('vaggie');
  });

  it('protects locked lore content while allowing an explicit unlock', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const database = new LocalDb(new MemoryStorage());
    const locked = database.getLoreCodex().find(entry => entry.isLocked)!;

    expect(database.saveLoreEntry({ ...locked, description: 'tampered' })).toBe(false);
    expect(database.getLoreCodex().find(entry => entry.id === locked.id)?.description).toBe(locked.description);
    expect(database.saveLoreEntry({ ...locked, isLocked: false })).toBe(true);
    consoleError.mockRestore();
  });

  it('resets all separate inventory keys with the database', () => {
    const storage = new MemoryStorage();
    const database = new LocalDb(storage);
    storage.setItem('h_inv_bar', '99');
    storage.setItem('h_inv_clean', '98');
    storage.setItem('h_inv_food', '97');

    expect(database.resetToSeed()).toBe(true);
    expect(ExportImport.readInventory(storage)).toEqual(DEFAULT_INVENTORY);
  });
});

describe('cloud snapshot isolation', () => {
  it('uses the publishable key only as apikey until a user JWT exists', () => {
    const anonymous = buildSupabaseHeaders();
    expect(anonymous.has('apikey')).toBe(true);
    expect(anonymous.has('Authorization')).toBe(false);

    const authenticated = buildSupabaseHeaders({}, 'user.jwt.token');
    expect(authenticated.get('Authorization')).toBe('Bearer user.jwt.token');
  });

  it('captures only Hellbound/inventory keys and restores an exact snapshot', () => {
    expect(shouldCaptureKey('hellbound_hotel_db_state', 'session')).toBe(true);
    expect(shouldCaptureKey('h_inv_bar', 'session')).toBe(true);
    expect(shouldCaptureKey('jigsaw_progress', 'session')).toBe(false);

    const storage = new MemoryStorage();
    storage.setItem('hellbound_hotel_db_state', runtimeDatabaseJson());
    storage.setItem('hellbound_stale_key', 'remove-me');
    storage.setItem('h_inv_bar', '88');
    storage.setItem('h_inv_clean', '77');
    storage.setItem('unrelated_key', 'preserve-me');

    const payload = captureSnapshot(storage, 'test_app');
    delete payload.entries.hellbound_stale_key;
    delete payload.entries.h_inv_clean;
    payload.entries.h_inv_bar = '5';
    restoreSnapshot(payload, storage, 'test_app');

    expect(storage.getItem('hellbound_stale_key')).toBe('remove-me');
    expect(storage.getItem('h_inv_clean')).toBeNull();
    expect(storage.getItem('h_inv_bar')).toBe('5');
    expect(storage.getItem('unrelated_key')).toBe('preserve-me');
  });

  it('rejects cloud payloads that attempt to include unrelated storage keys', () => {
    const storage = new MemoryStorage();
    storage.setItem('hellbound_hotel_db_state', runtimeDatabaseJson());
    const payload = captureSnapshot(storage, 'test_app');
    payload.entries.unrelated_key = 'must-not-be-restored';

    expect(() => restoreSnapshot(payload, storage, 'test_app')).toThrow('hors perimetre');
    expect(storage.getItem('unrelated_key')).toBeNull();
  });

  it('rolls back every app key when cloud restoration cannot finish', () => {
    const storage = new FailingStorage();
    const originalDatabase = runtimeDatabaseJson();
    storage.setItem('hellbound_hotel_db_state', originalDatabase);
    storage.setItem('h_inv_bar', '9');
    const payload = captureSnapshot(storage, 'test_app');
    payload.entries.h_inv_bar = '2';
    storage.failNextWrite = true;

    expect(() => restoreSnapshot(payload, storage, 'test_app')).toThrow('simulated quota failure');
    expect(storage.getItem('hellbound_hotel_db_state')).toBe(originalDatabase);
    expect(storage.getItem('h_inv_bar')).toBe('9');
  });
});
