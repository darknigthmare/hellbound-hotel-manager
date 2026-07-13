import { describe, expect, it, vi } from 'vitest';
import { LocalDb } from '../db/localDb';
import { getSeedData } from '../db/seed';
import {
  BACKUP_SCHEMA_VERSION,
  DEFAULT_GAMEPLAY_META,
  ExportImport,
  MAX_BACKUP_BYTES,
  StorageLike
} from '../lib/export-import';
import { RulesEngine } from '../lib/rules-engine';
import { RehabilitationPlan, RehabilitationSession } from '../types';

class MemoryStorage implements StorageLike {
  protected values = new Map<string, string>();

  public get length() { return this.values.size; }
  public clear() { this.values.clear(); }
  public getItem(key: string) { return this.values.get(key) ?? null; }
  public key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  public removeItem(key: string) { this.values.delete(key); }
  public setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

class FailingKeyStorage extends MemoryStorage {
  public failKey: string | null = null;

  public override setItem(key: string, value: string) {
    if (key === this.failKey) {
      this.failKey = null;
      throw new Error(`simulated failure for ${key}`);
    }
    super.setItem(key, value);
  }
}

class FragileStorage extends MemoryStorage {
  public failLengthRead = false;

  public override get length() {
    if (this.failLengthRead) throw new Error('simulated recovery listing denial');
    return super.length;
  }
}

describe('durable gameplay safety', () => {
  it('rejects a manual redeemed status outside the rehabilitation workflow', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const database = new LocalDb(new MemoryStorage());
    const resident = database.getCharacters().find(character => character.status === 'resident')!;

    expect(database.saveCharacter({ ...resident, status: 'redeemed', type: 'redeemed_soul' })).toBe(false);
    expect(database.getCharacter(resident.id)?.status).toBe('resident');
    expect(database.getStorageStatus().lastError?.message).toContain('rehabilitation confirmation workflow');
    consoleError.mockRestore();
  });

  it('rolls database and inventory back together when an inventory write fails', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const storage = new FailingKeyStorage();
    const database = new LocalDb(storage);
    const beforeState = database.getFullState();
    const beforeInventory = database.getInventory();
    storage.failKey = 'h_inv_clean';

    const committed = database.transaction('TEST_ATOMIC_ROLLBACK', (draft, inventory) => {
      draft.reputation.internalTrust -= 7;
      inventory.bar -= 2;
      inventory.clean -= 2;
    });

    expect(committed).toBe(false);
    expect(database.getFullState()).toEqual(beforeState);
    expect(database.getInventory()).toEqual(beforeInventory);
    consoleError.mockRestore();
  });

  it('keeps cooldowns and exactly-once markers when audit history is purged', () => {
    const database = new LocalDb(new MemoryStorage());
    expect(database.transaction('TEST_META', (draft) => {
      draft.gameplayMeta!.cooldowns.narrative = 8;
      draft.gameplayMeta!.completedMilestones.push('rehab:test:80');
      const task = draft.staffTasks.find(candidate => candidate.id === 't1')!;
      task.status = 'completed';
      draft.gameplayMeta!.appliedTaskIds.push(task.id);
    })).toBe(true);

    expect(database.clearAuditLogs()).toBe(true);
    expect(database.getGameplayMeta()).toMatchObject({
      cooldowns: { narrative: 8 },
      completedMilestones: ['rehab:test:80'],
      appliedTaskIds: ['t1']
    });
  });

  it('clears a previous storage error after the next successful write', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const storage = new FailingKeyStorage();
    const database = new LocalDb(storage);
    const reputation = database.getReputation();
    storage.failKey = 'hellbound_hotel_db_state';

    expect(database.saveReputation({ ...reputation, internalTrust: reputation.internalTrust - 1 })).toBe(false);
    expect(database.getStorageStatus().ok).toBe(false);
    expect(database.saveReputation({ ...reputation, internalTrust: reputation.internalTrust + 1 })).toBe(true);
    expect(database.getStorageStatus()).toMatchObject({ ok: true, lastError: null });
    consoleError.mockRestore();
  });

  it('bounds recovery snapshots and handles a denied recovery listing', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const storage = new FragileStorage();
    for (let index = 0; index < 8; index += 1) {
      storage.setItem(`hellbound_hotel_db_state_recovery_000${index}`, '{"legacy":true}');
    }
    storage.setItem('hellbound_hotel_db_state', '{broken-json');
    const database = new LocalDb(storage);
    expect(database.getRecoveryKeys()).toHaveLength(5);

    storage.failLengthRead = true;
    expect(database.getRecoveryKeys()).toEqual([]);
    expect(database.getStorageStatus().lastError?.operation).toBe('RECOVERY_LIST');
    consoleError.mockRestore();
  });

  it('advances campaign pressure with upkeep, fatigue recovery, and threat consequences', () => {
    const database = new LocalDb(new MemoryStorage());
    const staffId = database.getCharacters().find(character => character.status === 'staff')!.id;
    expect(database.transaction('TEST_PRESSURE_SETUP', (draft) => {
      draft.reputation = {
        ...draft.reputation,
        sinnerReputation: 60,
        internalTrust: 100,
        veesInfluence: 80,
        mediaChaos: 80,
        overlordHostility: 80,
        heavenAttention: 85
      };
      draft.gameplayMeta!.staffFatigue[staffId] = 10;
    })).toBe(true);

    expect(database.advanceCampaignDay()).toBe(true);
    const state = database.getFullState();
    expect(state.gameplayMeta?.campaignDay).toBe(2);
    expect(state.gameplayMeta?.staffFatigue[staffId]).toBe(8);
    expect(state.resourceLedger).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'daily_upkeep_2', type: 'expense' }),
      expect.objectContaining({ id: 'overlord_security_2', category: 'security' })
    ]));
    expect(state.incidents).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'auto_heaven_2', type: 'heaven_threat', status: 'open' })
    ]));
    expect(state.reputation.sinnerReputation).toBe(52);
    expect(state.reputation.internalTrust).toBeLessThan(100);
  });
});

describe('backup gameplay validation', () => {
  const currentState = () => {
    const seed = getSeedData();
    const gameplayMeta = JSON.parse(JSON.stringify(DEFAULT_GAMEPLAY_META));
    gameplayMeta.appliedTaskIds = seed.staffTasks.filter(task => task.status === 'completed').map(task => task.id);
    gameplayMeta.resolvedIncidentIds = seed.incidents
      .filter(incident => incident.status === 'resolved' || incident.status === 'archived')
      .map(incident => incident.id);
    return { schemaVersion: BACKUP_SCHEMA_VERSION, ...seed, gameplayMeta };
  };

  it('enforces the shared inventory capacity of 50', () => {
    const result = ExportImport.validateState({
      ...currentState(),
      inventory: { bar: 51, clean: 8, food: 15 }
    });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("inventory: 'bar'");
  });

  it('rejects oversized JSON before parsing it', () => {
    const result = ExportImport.validateBackup(' '.repeat(MAX_BACKUP_BYTES + 1));
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('2 MiB');
  });

  it('rejects malformed character operational and timeline fields', () => {
    const invalidRank = currentState();
    invalidRank.characters[0] = { ...invalidRank.characters[0], rank: 42 as never };
    expect(ExportImport.validateState(invalidRank).error).toContain('rank');

    const invalidOperationalStatus = currentState();
    invalidOperationalStatus.characters[0] = {
      ...invalidOperationalStatus.characters[0],
      operationalDataStatus: 'canon' as never
    };
    expect(ExportImport.validateState(invalidOperationalStatus).error).toContain('operationalDataStatus');

    const invalidTimeline = currentState();
    invalidTimeline.characters[0] = {
      ...invalidTimeline.characters[0],
      timelineStates: { season_1_start: { status: 'redeemed_early' as never } }
    };
    expect(ExportImport.validateState(invalidTimeline).error).toContain('timelineStates.season_1_start.status');
  });
});

describe('redemption pacing', () => {
  it('requires qualifying sessions across at least three campaign days', () => {
    const plan: RehabilitationPlan = {
      id: 'plan_pacing',
      characterId: 'resident_pacing',
      goals: ['Accept responsibility', 'Repair a harmed relationship'],
      obstacles: [],
      triggers: [],
      empathyScore: 85,
      accountabilityScore: 85,
      impulseControlScore: 85,
      cooperationScore: 85,
      charlieNotes: '',
      vaggieNotes: '',
      staffPrivateNotes: '',
      isRedeemedConfirmed: false
    };
    const sessions: RehabilitationSession[] = [
      'empathy_workshop',
      'accountability_session',
      'empathy_workshop',
      'accountability_session'
    ].map((type, index) => ({
      id: `same_day_${index}`,
      planId: plan.id,
      date: `Campaign Day 1`,
      campaignDay: 1,
      type: type as RehabilitationSession['type'],
      summary: 'Documented work',
      empathyDelta: 1,
      accountabilityDelta: 1,
      impulseControlDelta: 1,
      cooperationDelta: 1,
      conductedBy: 'charlie'
    }));

    const result = RulesEngine.evaluateRedemptionEligibility(plan, sessions);
    expect(result.isEligible).toBe(false);
    expect(result.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining('at least 3 campaign days')
    ]));
  });
});
