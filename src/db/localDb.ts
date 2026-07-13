import {
  DatabaseState,
  Character,
  Room,
  RehabilitationPlan,
  StaffTask,
  ReputationState,
  LoreEntry,
  AuditLog,
  AppSettings,
  GameplayMeta
} from '../types';
import { getSeedData } from './seed';
import {
  BACKUP_SCHEMA_VERSION,
  DEFAULT_GAMEPLAY_META,
  DEFAULT_INVENTORY,
  DatabaseBackupState,
  ExportImport,
  InventoryBackup,
  StorageLike
} from '../lib/export-import';

const STORAGE_KEY = 'hellbound_hotel_db_state';
const RECOVERY_PREFIX = `${STORAGE_KEY}_recovery_`;
const MAX_RECOVERY_SNAPSHOTS = 5;

export interface StorageErrorInfo {
  operation: string;
  message: string;
  timestamp: string;
}

export interface StorageStatus {
  ok: boolean;
  persistent: boolean;
  lastError: StorageErrorInfo | null;
  lastRecoveryKey: string | null;
}

type AuditDescriptor = { action: string; details: string };
type StorageErrorListener = (error: StorageErrorInfo) => void;
export type GameplayTransaction = (draft: DatabaseState, inventory: InventoryBackup) => void;

class EphemeralStorage implements StorageLike {
  private values = new Map<string, string>();

  public get length() { return this.values.size; }
  public clear() { this.values.clear(); }
  public getItem(key: string) { return this.values.get(key) ?? null; }
  public key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  public removeItem(key: string) { this.values.delete(key); }
  public setItem(key: string, value: string) { this.values.set(key, value); }
}

function resolveStorage(): { storage: StorageLike; persistent: boolean } {
  try {
    if (typeof localStorage !== 'undefined') return { storage: localStorage, persistent: true };
  } catch {
    // Privacy/security settings can deny even reading the localStorage handle.
  }
  return { storage: new EphemeralStorage(), persistent: false };
}

function cloneState(state: DatabaseState): DatabaseState {
  return JSON.parse(JSON.stringify(state)) as DatabaseState;
}

function freshGameplayMeta(): GameplayMeta {
  return JSON.parse(JSON.stringify(DEFAULT_GAMEPLAY_META)) as GameplayMeta;
}

function normalizedSeed(): DatabaseState {
  const seed = getSeedData();
  const gameplayMeta = freshGameplayMeta();
  gameplayMeta.appliedTaskIds = seed.staffTasks.filter(task => task.status === 'completed').map(task => task.id);
  gameplayMeta.resolvedIncidentIds = seed.incidents
    .filter(incident => incident.status === 'resolved' || incident.status === 'archived')
    .map(incident => incident.id);
  const confirmedCharacterIds = new Set(seed.rehabilitationPlans.filter(plan => plan.isRedeemedConfirmed).map(plan => plan.characterId));
  gameplayMeta.rewardedRedemptionIds = seed.characters
    .filter(character => character.status === 'redeemed' && confirmedCharacterIds.has(character.id))
    .map(character => character.id);
  return { ...seed, gameplayMeta };
}

function loreContent(entry: LoreEntry): Omit<LoreEntry, 'isLocked'> {
  const { isLocked, ...content } = entry;
  void isLocked;
  return content;
}

export class LocalDb {
  private state: DatabaseState;
  private readonly storage: StorageLike;
  private readonly persistentStorage: boolean;
  private lastStorageError: StorageErrorInfo | null = null;
  private lastRecoveryKey: string | null = null;
  private readonly storageErrorListeners = new Set<StorageErrorListener>();

  public constructor(storage?: StorageLike) {
    const resolved = storage
      ? { storage, persistent: true }
      : resolveStorage();
    this.storage = resolved.storage;
    this.persistentStorage = resolved.persistent;
    this.state = this.loadState();
    try {
      ExportImport.readInventory(this.storage);
    } catch (error) {
      this.reportError('INVENTORY_READ', error);
    }
  }

  private reportError(operation: string, error: unknown) {
    const info: StorageErrorInfo = {
      operation,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
    this.lastStorageError = info;
    console.error(`[LocalDb:${operation}] ${info.message}`, error);
    this.storageErrorListeners.forEach(listener => listener(info));

    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent<StorageErrorInfo>('hellbound-storage-error', { detail: info }));
    }
  }

  private serializeState(state: DatabaseState): string {
    return JSON.stringify({ schemaVersion: BACKUP_SCHEMA_VERSION, ...state });
  }

  private createAuditLog(action: string, details: string): AuditLog {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date().toISOString(),
      action,
      details
    };
  }

  private withAudit(state: DatabaseState, audit?: AuditDescriptor): DatabaseState {
    const next = cloneState(state);
    if (!audit) return next;
    next.auditLogs = [this.createAuditLog(audit.action, audit.details), ...next.auditLogs].slice(0, 100);
    return next;
  }

  private normalizeForWrite(input: unknown, operation: string): DatabaseState | null {
    const validation = ExportImport.validateState(input);
    if (!validation.isValid || !validation.parsedState) {
      this.reportError(operation, new Error(validation.error || 'Database state validation failed.'));
      return null;
    }
    return ExportImport.databaseStateOnly(validation.parsedState);
  }

  private writeState(state: DatabaseState, operation: string, inventory?: InventoryBackup): boolean {
    let validationInventory = inventory;
    if (!validationInventory) {
      try {
        validationInventory = ExportImport.readInventory(this.storage);
      } catch (error) {
        this.reportError(`${operation}_INVENTORY_READ`, error);
        return false;
      }
    }
    const normalized = this.normalizeForWrite({
      schemaVersion: BACKUP_SCHEMA_VERSION,
      ...state,
      inventory: validationInventory
    }, operation);
    if (!normalized) return false;

    const keys = [STORAGE_KEY, ...(inventory ? ExportImport.inventoryEntries(inventory).map(([key]) => key) : [])];
    let previous: Map<string, string | null>;
    try {
      previous = new Map(keys.map(key => [key, this.storage.getItem(key)]));
    } catch (error) {
      this.reportError(operation, error);
      return false;
    }

    try {
      this.storage.setItem(STORAGE_KEY, this.serializeState(normalized));
      if (inventory) {
        ExportImport.inventoryEntries(inventory).forEach(([key, value]) => this.storage.setItem(key, value));
      }
      this.state = normalized;
      this.lastStorageError = null;
      return true;
    } catch (error) {
      let rollbackError: unknown = null;
      try {
        previous.forEach((value, key) => {
          if (value === null) this.storage.removeItem(key);
          else this.storage.setItem(key, value);
        });
      } catch (caught) {
        rollbackError = caught;
      }
      const message = rollbackError
        ? `${error instanceof Error ? error.message : String(error)}; rollback also failed: ${rollbackError instanceof Error ? rollbackError.message : String(rollbackError)}`
        : error;
      this.reportError(operation, message);
      return false;
    }
  }

  private commit(nextState: DatabaseState, operation: string, audit?: AuditDescriptor): boolean {
    return this.writeState(this.withAudit(nextState, audit), operation);
  }

  private preserveForRecovery(raw: string, reason: string): boolean {
    const key = `${RECOVERY_PREFIX}${Date.now()}`;
    try {
      this.storage.setItem(key, raw);
      this.lastRecoveryKey = key;
      const recoveryKeys: string[] = [];
      for (let index = 0; index < this.storage.length; index += 1) {
        const candidate = this.storage.key(index);
        if (candidate?.startsWith(RECOVERY_PREFIX)) recoveryKeys.push(candidate);
      }
      recoveryKeys.sort().reverse().slice(MAX_RECOVERY_SNAPSHOTS).forEach(candidate => this.storage.removeItem(candidate));
      return true;
    } catch (error) {
      this.reportError('RECOVERY_BACKUP', new Error(`${reason} Original data could not be copied to a recovery slot: ${error instanceof Error ? error.message : String(error)}`));
      return false;
    }
  }

  private loadState(): DatabaseState {
    let raw: string | null;
    try {
      raw = this.storage.getItem(STORAGE_KEY);
    } catch (error) {
      this.reportError('DATABASE_READ', error);
      return normalizedSeed();
    }

    if (raw) {
      const validation = ExportImport.validateBackup(raw);
      if (validation.isValid && validation.parsedState) {
        const normalized = ExportImport.databaseStateOnly(validation.parsedState);
        if (validation.migrated) {
          if (this.preserveForRecovery(raw, 'Legacy state migration was required.')) {
            this.writeState(normalized, 'DATABASE_MIGRATION', validation.parsedState.inventory);
          }
        }
        return normalized;
      }

      const preserved = this.preserveForRecovery(raw, validation.error || 'Stored database is invalid.');
      const seed = normalizedSeed();
      if (preserved) this.writeState(seed, 'DATABASE_RECOVERY', DEFAULT_INVENTORY);
      return seed;
    }

    const seed = normalizedSeed();
    this.writeState(seed, 'DATABASE_INITIALIZATION', DEFAULT_INVENTORY);
    return seed;
  }

  public getStorageStatus(): StorageStatus {
    return {
      ok: this.lastStorageError === null,
      persistent: this.persistentStorage,
      lastError: this.lastStorageError ? { ...this.lastStorageError } : null,
      lastRecoveryKey: this.lastRecoveryKey
    };
  }

  public subscribeToStorageErrors(listener: StorageErrorListener): () => void {
    this.storageErrorListeners.add(listener);
    return () => this.storageErrorListeners.delete(listener);
  }

  public getRecoveryKeys(): string[] {
    try {
      const keys: string[] = [];
      for (let index = 0; index < this.storage.length; index += 1) {
        const key = this.storage.key(index);
        if (key?.startsWith(RECOVERY_PREFIX)) keys.push(key);
      }
      return keys.sort().reverse().slice(0, MAX_RECOVERY_SNAPSHOTS);
    } catch (error) {
      this.reportError('RECOVERY_LIST', error);
      return [];
    }
  }

  /** Returns the untouched recovery payload so the user can download it even when validation fails. */
  public getRecoverySnapshot(recoveryKey: string): string | null {
    if (!recoveryKey.startsWith(RECOVERY_PREFIX)) {
      this.reportError('RECOVERY_READ', new Error('Recovery key is outside the application recovery namespace.'));
      return null;
    }
    try {
      const raw = this.storage.getItem(recoveryKey);
      if (raw === null) this.reportError('RECOVERY_READ', new Error('Recovery snapshot no longer exists.'));
      return raw;
    } catch (error) {
      this.reportError('RECOVERY_READ', error);
      return null;
    }
  }

  public restoreRecovery(recoveryKey: string): boolean {
    const raw = this.getRecoverySnapshot(recoveryKey);
    if (!raw) return false;
    const validation = ExportImport.validateBackup(raw);
    if (!validation.isValid || !validation.parsedState) {
      this.reportError('RECOVERY_RESTORE', new Error(validation.error || 'Recovery backup is invalid.'));
      return false;
    }
    return this.importState(validation.parsedState);
  }

  public getFullState(): DatabaseState {
    return cloneState(this.state);
  }

  public getGameplayMeta(): GameplayMeta {
    return cloneState({ ...this.state, gameplayMeta: this.state.gameplayMeta || freshGameplayMeta() }).gameplayMeta!;
  }

  public getInventory(): InventoryBackup {
    try {
      return ExportImport.readInventory(this.storage);
    } catch (error) {
      this.reportError('INVENTORY_READ', error);
      return { ...DEFAULT_INVENTORY };
    }
  }

  /** Commits database, inventory and audit changes in one rollback-safe write. */
  public transaction(operation: string, mutate: GameplayTransaction, audit?: AuditDescriptor): boolean {
    const draft = cloneState(this.state);
    draft.gameplayMeta = draft.gameplayMeta || freshGameplayMeta();
    let inventory: InventoryBackup;
    try {
      inventory = ExportImport.readInventory(this.storage);
    } catch (error) {
      this.reportError(`${operation}_INVENTORY_READ`, error);
      return false;
    }
    try {
      mutate(draft, inventory);
    } catch (error) {
      this.reportError(operation, error);
      return false;
    }
    return this.writeState(this.withAudit(draft, audit), operation, inventory);
  }

  /** Advances the explicit campaign clock and applies recurring pressure. */
  public advanceCampaignDay(): boolean {
    const nextDay = this.getGameplayMeta().campaignDay + 1;
    return this.transaction('CAMPAIGN_DAY_ADVANCE', (draft) => {
      const meta = draft.gameplayMeta!;
      meta.campaignDay = nextDay;
      const oldestRetainedDay = Math.max(1, nextDay - 30);
      for (const key of Object.keys(meta.dailyDonationAmounts)) {
        if (Number(key) < oldestRetainedDay) delete meta.dailyDonationAmounts[key];
      }
      for (const key of Object.keys(meta.dailySessionCounts)) {
        const day = Number(key.split(':', 1)[0]);
        if (Number.isInteger(day) && day < oldestRetainedDay) delete meta.dailySessionCounts[key];
      }
      for (const [staffId, fatigue] of Object.entries(meta.staffFatigue)) {
        meta.staffFatigue[staffId] = Math.max(0, fatigue - 2);
      }

      const activeResidents = draft.characters.filter(character => character.status === 'resident').length;
      const occupiedBeds = draft.rooms.reduce((total, room) => total + (room.occupantIds?.length ?? (room.occupantId ? 1 : 0)), 0);
      const upkeep = 40 + activeResidents * 12 + occupiedBeds * 4;
      draft.resourceLedger.push({
        id: `daily_upkeep_${nextDay}`,
        date: `Campaign Day ${nextDay}`,
        type: 'expense',
        category: 'food_beverage',
        amount: upkeep,
        description: `Day ${nextDay} wages, utilities, meals, and occupied-room upkeep.`
      });

      if (draft.reputation.veesInfluence >= 70 || draft.reputation.mediaChaos >= 70) {
        draft.reputation.sinnerReputation = Math.max(0, draft.reputation.sinnerReputation - 8);
        draft.reputation.internalTrust = Math.max(0, draft.reputation.internalTrust - 3);
      }
      if (draft.reputation.overlordHostility >= 70) {
        draft.reputation.internalTrust = Math.max(0, draft.reputation.internalTrust - 4);
        draft.resourceLedger.push({
          id: `overlord_security_${nextDay}`,
          date: `Campaign Day ${nextDay}`,
          type: 'expense',
          category: 'security',
          amount: 120,
          description: 'Emergency wards and patrols caused by high Overlord hostility.'
        });
      }
      const activeResidentIds = new Set(draft.characters.filter(character => character.status === 'resident').map(character => character.id));
      const bindingContracts = draft.relationships.filter(relationship => relationship.type === 'contract_bound'
        && (activeResidentIds.has(relationship.charAId) || activeResidentIds.has(relationship.charBId))).length;
      if (bindingContracts > 0) {
        draft.reputation.overlordHostility = Math.min(100, draft.reputation.overlordHostility + Math.min(5, bindingContracts));
        draft.reputation.internalTrust = Math.max(0, draft.reputation.internalTrust - Math.min(3, bindingContracts));
      }
      if (draft.reputation.heavenAttention >= 80
        && !draft.incidents.some(incident => incident.type === 'heaven_threat' && (incident.status === 'open' || incident.status === 'contained'))) {
        draft.incidents.push({
          id: `auto_heaven_${nextDay}`,
          date: `Campaign Day ${nextDay}`,
          location: 'Hotel airspace',
          residentsInvolved: [],
          type: 'heaven_threat',
          severity: draft.reputation.heavenAttention >= 95 ? 'crisis' : 'high',
          summary: 'Celestial surveillance escalated after sustained Heaven attention.',
          consequences: 'Operations are under direct observation; redemption confirmations are blocked until resolved.',
          repairCost: 0,
          reputationImpact: -10,
          trustImpact: -8,
          actionTaken: '',
          status: 'open',
          loreLink: null,
          tags: ['simulation_au', 'campaign_pressure']
        });
        draft.reputation.internalTrust = Math.max(0, draft.reputation.internalTrust - 8);
      }
      if (draft.reputation.internalTrust <= 25) {
        for (const staff of draft.characters.filter(character => character.status === 'staff')) {
          meta.staffFatigue[staff.id] = Math.min(100, (meta.staffFatigue[staff.id] || 0) + 2);
        }
      }
    }, {
      action: 'CAMPAIGN_DAY_ADVANCED',
      details: `Advanced operations to Campaign Day ${nextDay}; upkeep and threat thresholds were processed.`
    });
  }

  public importState(newState: DatabaseState): boolean {
    const validation = ExportImport.validateState(newState as DatabaseBackupState);
    if (!validation.isValid || !validation.parsedState) {
      this.reportError('DATABASE_IMPORT', new Error(validation.error || 'Database import validation failed.'));
      return false;
    }

    const imported = ExportImport.databaseStateOnly(validation.parsedState);
    for (const locked of this.state.loreCodex.filter(entry => entry.isLocked)) {
      const candidate = imported.loreCodex.find(entry => entry.id === locked.id);
      if (!candidate || JSON.stringify(candidate) !== JSON.stringify(locked)) {
        this.reportError('DATABASE_IMPORT', new Error(`Locked lore entry '${locked.id}' cannot be removed or changed by import.`));
        return false;
      }
    }

    const audited = this.withAudit(imported, {
      action: 'DATABASE_IMPORT',
      details: validation.migrated
        ? 'Database restored from a JSON backup and migrated to the current schema.'
        : 'Database restored from JSON backup.'
    });
    return this.writeState(audited, 'DATABASE_IMPORT', validation.parsedState.inventory);
  }

  public resetToSeed(): boolean {
    const seed = this.withAudit(normalizedSeed(), {
      action: 'DATABASE_RESET',
      details: 'Database and facility inventory reset to default seed data.'
    });
    return this.writeState(seed, 'DATABASE_RESET', DEFAULT_INVENTORY);
  }

  public logAction(action: string, details: string): boolean {
    return this.commit(this.state, 'AUDIT_LOG_WRITE', { action, details });
  }

  public clearAuditLogs(): boolean {
    return this.commit({ ...this.state, auditLogs: [] }, 'AUDIT_LOG_CLEAR', {
      action: 'AUDIT_LOGS_CLEARED',
      details: 'All historical audit logs purged.'
    });
  }

  public getCharacters(): Character[] {
    return cloneState(this.state).characters;
  }

  public getCharacter(id: string): Character | undefined {
    return this.getCharacters().find(character => character.id === id);
  }

  public saveCharacter(character: Character): boolean {
    const previous = this.state.characters.find(item => item.id === character.id);
    if ((character.type === 'redeemed_soul') !== (character.status === 'redeemed')) {
      this.reportError('CHARACTER_SAVE', new Error('Redeemed soul type and redeemed status must be granted together by the rehabilitation workflow.'));
      return false;
    }
    if ((!previous || previous.status !== 'redeemed') && character.status === 'redeemed') {
      this.reportError('CHARACTER_SAVE', new Error('Redemption can only be granted through the rehabilitation confirmation workflow.'));
      return false;
    }
    if (previous?.status === 'redeemed' && character.status !== 'redeemed') {
      this.reportError('CHARACTER_SAVE', new Error('A confirmed redeemed soul cannot be reverted from the profile editor.'));
      return false;
    }
    const plan = this.state.rehabilitationPlans.find(item => item.characterId === character.id);
    const statusNormalizedCharacter: Character = character.status === 'redeemed'
      ? { ...character, type: 'redeemed_soul', role: 'external', riskLevel: 'low', rehabTracked: false }
      : character;
    const normalizedCharacter = plan && statusNormalizedCharacter.rehabTracked && statusNormalizedCharacter.status !== 'redeemed'
      ? {
          ...statusNormalizedCharacter,
          rehabProgress: Math.round((plan.empathyScore + plan.accountabilityScore + plan.impulseControlScore + plan.cooperationScore) / 4)
        }
      : statusNormalizedCharacter;
    const exists = Boolean(previous);
    const characters = exists
      ? this.state.characters.map(item => item.id === character.id ? normalizedCharacter : item)
      : [...this.state.characters, normalizedCharacter];
    return this.commit({ ...this.state, characters }, 'CHARACTER_SAVE', {
      action: exists ? 'CHARACTER_UPDATE' : 'CHARACTER_CREATE',
      details: `${exists ? 'Updated' : 'Registered'} character ${character.name} (${character.role}).`
    });
  }

  public deleteCharacter(id: string): boolean {
    const character = this.state.characters.find(item => item.id === id);
    if (!character) return false;

    const removedPlanIds = new Set(this.state.rehabilitationPlans.filter(plan => plan.characterId === id).map(plan => plan.id));
    const taskMustBeRemoved = (task: StaffTask) => task.assignedTo === id
      || ((task.status === 'pending' || task.status === 'in_progress') && (task.targetId === id || (task.targetId ? removedPlanIds.has(task.targetId) : false)));
    const removedTaskIds = new Set(this.state.staffTasks.filter(taskMustBeRemoved).map(task => task.id));
    const gameplayMeta = this.getGameplayMeta();
    gameplayMeta.appliedTaskIds = gameplayMeta.appliedTaskIds.filter(taskId => !removedTaskIds.has(taskId));
    gameplayMeta.rewardedRedemptionIds = gameplayMeta.rewardedRedemptionIds.filter(characterId => characterId !== id);
    gameplayMeta.broadcastRedemptionIds = gameplayMeta.broadcastRedemptionIds.filter(characterId => characterId !== id);
    gameplayMeta.completedMilestones = gameplayMeta.completedMilestones.filter(marker => marker !== `redemption:${id}` && !marker.startsWith(`rehab:${id}:`));
    delete gameplayMeta.staffFatigue[id];
    for (const key of Object.keys(gameplayMeta.dailySessionCounts)) {
      if (Array.from(removedPlanIds).some(planId => key.endsWith(`:${planId}`))) delete gameplayMeta.dailySessionCounts[key];
    }
    const next: DatabaseState = {
      ...this.state,
      characters: this.state.characters.filter(item => item.id !== id),
      rooms: this.state.rooms.map(room => {
        const occupantIds = room.occupantIds?.filter(characterId => characterId !== id);
        return {
          ...room,
          ...(room.occupantIds ? { occupantIds } : {}),
          occupantId: room.occupantId === id ? occupantIds?.[0] || null : room.occupantId,
          lastInspectedBy: room.lastInspectedBy === id ? null : room.lastInspectedBy
        };
      }),
      rehabilitationPlans: this.state.rehabilitationPlans.filter(plan => plan.characterId !== id),
      rehabilitationSessions: this.state.rehabilitationSessions.filter(session => !removedPlanIds.has(session.planId) && session.conductedBy !== id),
      incidents: this.state.incidents.map(incident => ({
        ...incident,
        residentsInvolved: incident.residentsInvolved.filter(characterId => characterId !== id)
      })),
      staffTasks: this.state.staffTasks.filter(task => !taskMustBeRemoved(task)),
      relationships: this.state.relationships.filter(relationship => relationship.charAId !== id && relationship.charBId !== id),
      gameplayMeta
    };
    return this.commit(next, 'CHARACTER_DELETE', {
      action: 'CHARACTER_DELETE',
      details: `Deleted character ${character.name} and cascaded rooms, plans, sessions, incidents, tasks, and relationships.`
    });
  }

  public getRooms(): Room[] {
    return cloneState(this.state).rooms;
  }

  public saveRehabilitationPlan(plan: RehabilitationPlan): boolean {
    const exists = this.state.rehabilitationPlans.some(item => item.id === plan.id);
    const plans = exists
      ? this.state.rehabilitationPlans.map(item => item.id === plan.id ? plan : item)
      : [...this.state.rehabilitationPlans, plan];
    const name = this.state.characters.find(character => character.id === plan.characterId)?.name || plan.characterId;
    const progress = Math.round((plan.empathyScore + plan.accountabilityScore + plan.impulseControlScore + plan.cooperationScore) / 4);
    const characters = this.state.characters.map(character => character.id === plan.characterId && character.status !== 'redeemed'
      ? { ...character, rehabProgress: progress, rehabTracked: true }
      : character);
    return this.commit({ ...this.state, rehabilitationPlans: plans, characters }, 'REHAB_PLAN_SAVE', {
      action: exists ? 'REHAB_PLAN_UPDATE' : 'REHAB_PLAN_CREATE',
      details: `${exists ? 'Updated' : 'Initialized'} rehabilitation plan for ${name}.`
    });
  }

  public getReputation(): ReputationState {
    return cloneState(this.state).reputation;
  }

  public saveReputation(reputation: ReputationState): boolean {
    return this.commit({ ...this.state, reputation }, 'REPUTATION_SAVE');
  }

  public getLoreCodex(): LoreEntry[] {
    return cloneState(this.state).loreCodex;
  }

  public saveLoreEntry(entry: LoreEntry): boolean {
    const existing = this.state.loreCodex.find(item => item.id === entry.id);
    if (existing?.isLocked && JSON.stringify(loreContent(existing)) !== JSON.stringify(loreContent(entry))) {
      this.reportError('LORE_SAVE', new Error(`Locked lore entry '${entry.id}' must be unlocked before its content can change.`));
      return false;
    }

    const loreCodex = existing
      ? this.state.loreCodex.map(item => item.id === entry.id ? entry : item)
      : [...this.state.loreCodex, entry];
    return this.commit({ ...this.state, loreCodex }, 'LORE_SAVE', {
      action: existing ? 'LORE_UPDATE' : 'LORE_CREATE',
      details: `${existing ? 'Updated' : 'Added'} codex entry "${entry.title}" (${entry.canonStatus}).`
    });
  }

  public deleteLoreEntry(id: string): boolean {
    const entry = this.state.loreCodex.find(item => item.id === id);
    if (!entry || entry.isLocked) return false;
    return this.commit({
      ...this.state,
      loreCodex: this.state.loreCodex.filter(item => item.id !== id),
      incidents: this.state.incidents.map(incident => incident.loreLink === id ? { ...incident, loreLink: null } : incident)
    }, 'LORE_DELETE', {
      action: 'LORE_DELETE',
      details: `Deleted lore codex entry "${entry.title}" and cleared incident links.`
    });
  }

  public saveSettings(settings: AppSettings): boolean {
    return this.commit({ ...this.state, settings }, 'SETTINGS_SAVE');
  }
}

export const db = new LocalDb();
