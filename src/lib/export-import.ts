import { DatabaseState, GameplayMeta, HelluvaBossSaveState } from '../types';
import { getSeedData } from '../db/seed';
import {
  HELLUVA_APPROACHES,
  HELLUVA_BOSS_DATA_VERSION,
  HELLUVA_CONTRACTS,
  HELLUVA_CREW_IDS
} from '../expansions/helluva-boss/data';

export const BACKUP_SCHEMA_VERSION = 4;
export const INVENTORY_MAX = 50;
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

export const DEFAULT_GAMEPLAY_META: GameplayMeta = {
  campaignDay: 1,
  cooldowns: {},
  completedMilestones: [],
  appliedTaskIds: [],
  resolvedIncidentIds: [],
  rewardedRedemptionIds: [],
  broadcastRedemptionIds: [],
  narrativeFlags: [],
  dailySessionCounts: {},
  dailyDonationAmounts: {},
  staffFatigue: {}
};

export const INVENTORY_KEYS = {
  bar: 'h_inv_bar',
  clean: 'h_inv_clean',
  food: 'h_inv_food'
} as const;

export const DEFAULT_INVENTORY: InventoryBackup = {
  bar: 12,
  clean: 8,
  food: 15
};

export interface InventoryBackup {
  bar: number;
  clean: number;
  food: number;
}

export interface StorageLike {
  readonly length: number;
  clear(): void;
  getItem(key: string): string | null;
  key(index: number): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}

export type DatabaseBackupState = DatabaseState & {
  schemaVersion?: number;
  inventory?: InventoryBackup;
};

export interface BackupValidationResult {
  isValid: boolean;
  parsedState?: DatabaseBackupState;
  error?: string;
  migrated?: boolean;
  warnings?: string[];
}

export interface BackupValidationOptions {
  /** Full user backups must carry inventory; database-only cloud/local records do not. */
  requireInventory?: boolean;
}

type UnknownRecord = Record<string, unknown>;

const LEGACY_REQUIRED_ARRAYS: (keyof DatabaseState)[] = [
  'characters',
  'rooms',
  'rehabilitationPlans',
  'loreCodex',
  'factions',
  'relationships'
];

const LEGACY_REQUIRED_OBJECTS: (keyof DatabaseState)[] = ['reputation', 'timeline', 'settings'];

const OPTIONAL_LEGACY_ARRAYS: (keyof DatabaseState)[] = [
  'rehabilitationSessions',
  'incidents',
  'staffTasks',
  'resourceLedger',
  'auditLogs'
];

const CHARACTER_TYPES = new Set(['sinner', 'hellborn', 'angel', 'fallen_angel', 'overlord', 'redeemed_soul', 'unknown']);
const CHARACTER_RANKS = new Set(['none', 'royalty', 'overlord', 'former_overlord', 'seraph', 'exorcist', 'former_exorcist', 'exorcist_commander', 'unknown']);
const CHARACTER_ROLES = new Set(['founder', 'manager', 'resident', 'bartender', 'housekeeper', 'sponsor', 'security', 'antagonist', 'ally', 'external']);
const CHARACTER_STATUSES = new Set(['staff', 'resident', 'applicant', 'banned', 'redeemed', 'external', 'deceased', 'unknown']);
const RISK_LEVELS = new Set(['low', 'medium', 'high', 'catastrophic']);
const CANON_STATUSES = new Set(['canon', 'semi_canon', 'simulation_au', 'user_note', 'headcanon', 'unknown']);
const SPOILER_LEVELS = new Set(['none', 'season_1', 'season_2', 'future']);
const TIMELINE_SCOPES = new Set(['pilot_legacy', 'season_1_start', 'season_1_end', 'season_2', 'custom']);
const ROOM_TYPES = new Set(['standard', 'suite', 'staff_room', 'secured_room', 'damaged_room', 'restricted']);
const ROOM_STATUSES = new Set(['clean', 'messy', 'damaged', 'cursed', 'under_repair', 'locked']);
const SESSION_TYPES = new Set(['accountability_session', 'empathy_workshop', 'conflict_resolution', 'trust_building', 'public_apology', 'group_activity', 'hotel_service', 'therapy_like_checkin', 'custom']);
const INCIDENT_TYPES = new Set(['violence', 'property_damage', 'media_scandal', 'deal_contract', 'heaven_threat', 'overlord_interference', 'staff_conflict', 'relapse', 'sabotage', 'unknown']);
const INCIDENT_SEVERITIES = new Set(['low', 'medium', 'high', 'crisis']);
const INCIDENT_STATUSES = new Set(['open', 'contained', 'resolved', 'archived']);
const TASK_TYPES = new Set(['new_sinner_intake', 'room_inspection', 'conflict_resolution', 'repair_work', 'rehab_prep', 'media_response', 'heaven_watch', 'vees_watch', 'staff_briefing', 'custom']);
const TASK_STATUSES = new Set(['pending', 'in_progress', 'completed', 'cancelled']);
const SOURCE_TYPES = new Set(['episode', 'official_pilot', 'official_page', 'creator_statement', 'user_manual_note', 'other']);
const LORE_CATEGORIES = new Set(['character', 'faction', 'location', 'event', 'world_rule', 'relation', 'contract', 'media_piece', 'item', 'threat']);
const RELATIONSHIP_TYPES = new Set(['ally', 'enemy', 'contract_bound', 'family', 'romantic', 'staff', 'resident', 'manipulative', 'unknown']);
const RESOURCE_CATEGORIES = new Set(['repair', 'food_beverage', 'bar_stock', 'cleaning_supplies', 'security', 'donation', 'reconstruction', 'incident', 'custom']);

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function requireString(record: UnknownRecord, key: string, context: string): string | null {
  return typeof record[key] === 'string' ? null : `${context}.${key} must be a string.`;
}

function requireNullableString(record: UnknownRecord, key: string, context: string): string | null {
  return record[key] === null || typeof record[key] === 'string' ? null : `${context}.${key} must be a string or null.`;
}

function requireBoolean(record: UnknownRecord, key: string, context: string): string | null {
  return typeof record[key] === 'boolean' ? null : `${context}.${key} must be a boolean.`;
}

function requireNumber(record: UnknownRecord, key: string, context: string, min?: number, max?: number): string | null {
  const value = record[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) return `${context}.${key} must be a finite number.`;
  if (min !== undefined && value < min) return `${context}.${key} must be at least ${min}.`;
  if (max !== undefined && value > max) return `${context}.${key} must be at most ${max}.`;
  return null;
}

function requireStringArray(record: UnknownRecord, key: string, context: string): string | null {
  const value = record[key];
  return Array.isArray(value) && value.every(item => typeof item === 'string')
    ? null
    : `${context}.${key} must be a list of strings.`;
}

function requireOptionalString(record: UnknownRecord, key: string, context: string): string | null {
  return record[key] === undefined || record[key] === null || typeof record[key] === 'string'
    ? null
    : `${context}.${key} must be a string, null, or omitted.`;
}

function requireOptionalNumber(record: UnknownRecord, key: string, context: string, min?: number): string | null {
  if (record[key] === undefined) return null;
  return requireNumber(record, key, context, min);
}

function requireOptionalInteger(record: UnknownRecord, key: string, context: string, min?: number): string | null {
  if (record[key] === undefined) return null;
  const error = requireNumber(record, key, context, min);
  if (error) return error;
  return Number.isInteger(record[key]) ? null : `${context}.${key} must be an integer.`;
}

function requireOptionalBoolean(record: UnknownRecord, key: string, context: string): string | null {
  return record[key] === undefined || typeof record[key] === 'boolean' ? null : `${context}.${key} must be a boolean or omitted.`;
}

function requireOptionalEnum(record: UnknownRecord, key: string, allowed: Set<string>, context: string): string | null {
  return record[key] === undefined ? null : requireEnum(record, key, allowed, context);
}

function validateTimelineStates(value: unknown, context: string): string | null {
  if (value === undefined) return null;
  if (!isRecord(value)) return `${context}.timelineStates must be an object or omitted.`;
  const allowedScopes = new Set(['pilot_legacy', 'season_1_start', 'season_1_end', 'season_2']);
  const allowedFields = new Set(['type', 'role', 'status', 'riskLevel', 'rehabProgress', 'rehabTracked']);
  for (const [scope, snapshot] of Object.entries(value)) {
    if (!allowedScopes.has(scope) || !isRecord(snapshot)) return `${context}.timelineStates.${scope} is invalid.`;
    if (Object.keys(snapshot).some(key => !allowedFields.has(key))) return `${context}.timelineStates.${scope} contains an unsupported field.`;
    const error = firstError([
      requireOptionalEnum(snapshot, 'type', CHARACTER_TYPES, `${context}.timelineStates.${scope}`),
      requireOptionalEnum(snapshot, 'role', CHARACTER_ROLES, `${context}.timelineStates.${scope}`),
      requireOptionalEnum(snapshot, 'status', CHARACTER_STATUSES, `${context}.timelineStates.${scope}`),
      requireOptionalEnum(snapshot, 'riskLevel', RISK_LEVELS, `${context}.timelineStates.${scope}`),
      requireOptionalNumber(snapshot, 'rehabProgress', `${context}.timelineStates.${scope}`, 0),
      requireOptionalBoolean(snapshot, 'rehabTracked', `${context}.timelineStates.${scope}`)
    ]);
    if (error) return error;
    if (typeof snapshot.rehabProgress === 'number' && snapshot.rehabProgress > 100) return `${context}.timelineStates.${scope}.rehabProgress must be at most 100.`;
  }
  return null;
}

function requireEnum(record: UnknownRecord, key: string, allowed: Set<string>, context: string): string | null {
  const value = record[key];
  return typeof value === 'string' && allowed.has(value) ? null : `${context}.${key} contains an unsupported value.`;
}

function firstError(checks: Array<string | null>): string | null {
  return checks.find((value): value is string => value !== null) || null;
}

function validateCharacter(value: unknown, index: number): string | null {
  const context = `characters[${index}]`;
  if (!isRecord(value)) return `${context} must be an object.`;
  return firstError([
    ...['id', 'name', 'alias', 'notes', 'sourceRef', 'description'].map(key => requireString(value, key, context)),
    requireEnum(value, 'type', CHARACTER_TYPES, context),
    requireOptionalEnum(value, 'rank', CHARACTER_RANKS, context),
    requireEnum(value, 'role', CHARACTER_ROLES, context),
    requireEnum(value, 'status', CHARACTER_STATUSES, context),
    requireEnum(value, 'riskLevel', RISK_LEVELS, context),
    requireNumber(value, 'charlieTrust', context, 0, 100),
    requireNumber(value, 'rehabProgress', context, 0, 100),
    requireOptionalBoolean(value, 'rehabTracked', context),
    requireOptionalEnum(value, 'operationalDataStatus', new Set(['simulation_au', 'user_note']), context),
    validateTimelineStates(value.timelineStates, context),
    requireStringArray(value, 'contracts', context),
    requireEnum(value, 'canonStatus', CANON_STATUSES, context),
    requireEnum(value, 'timelineScope', TIMELINE_SCOPES, context),
    requireEnum(value, 'spoilerLevel', SPOILER_LEVELS, context)
  ]);
}

function validateRoom(value: unknown, index: number): string | null {
  const context = `rooms[${index}]`;
  if (!isRecord(value)) return `${context} must be an object.`;
  const occupantIdsError = value.occupantIds === undefined
    ? null
    : requireStringArray(value, 'occupantIds', context);
  return firstError([
    requireString(value, 'number', context),
    requireNumber(value, 'floor', context),
    requireEnum(value, 'type', ROOM_TYPES, context),
    requireNullableString(value, 'occupantId', context),
    occupantIdsError,
    requireNumber(value, 'capacity', context, 1),
    requireEnum(value, 'status', ROOM_STATUSES, context),
    requireEnum(value, 'dangerLevel', RISK_LEVELS, context),
    requireStringArray(value, 'restrictions', context),
    requireString(value, 'maintenanceNotes', context),
    requireNumber(value, 'repairCost', context, 0),
    requireString(value, 'lastInspectionDate', context),
    requireNullableString(value, 'lastInspectedBy', context)
  ]);
}

function validatePlan(value: unknown, index: number): string | null {
  const context = `rehabilitationPlans[${index}]`;
  if (!isRecord(value)) return `${context} must be an object.`;
  return firstError([
    requireString(value, 'id', context),
    requireString(value, 'characterId', context),
    requireStringArray(value, 'goals', context),
    requireStringArray(value, 'obstacles', context),
    requireStringArray(value, 'triggers', context),
    ...['empathyScore', 'accountabilityScore', 'impulseControlScore', 'cooperationScore'].map(key => requireNumber(value, key, context, 0, 100)),
    ...['charlieNotes', 'vaggieNotes', 'staffPrivateNotes'].map(key => requireString(value, key, context)),
    requireBoolean(value, 'isRedeemedConfirmed', context)
  ]);
}

function validateSession(value: unknown, index: number): string | null {
  const context = `rehabilitationSessions[${index}]`;
  if (!isRecord(value)) return `${context} must be an object.`;
  return firstError([
    ...['id', 'planId', 'date', 'summary', 'conductedBy'].map(key => requireString(value, key, context)),
    requireEnum(value, 'type', SESSION_TYPES, context),
    ...['empathyDelta', 'accountabilityDelta', 'impulseControlDelta', 'cooperationDelta'].map(key => requireNumber(value, key, context, -100, 100)),
    requireOptionalString(value, 'approachId', context),
    requireOptionalInteger(value, 'campaignDay', context, 1)
  ]);
}

function validateIncident(value: unknown, index: number): string | null {
  const context = `incidents[${index}]`;
  if (!isRecord(value)) return `${context} must be an object.`;
  return firstError([
    ...['id', 'date', 'location', 'summary', 'consequences', 'actionTaken'].map(key => requireString(value, key, context)),
    requireStringArray(value, 'residentsInvolved', context),
    requireEnum(value, 'type', INCIDENT_TYPES, context),
    requireEnum(value, 'severity', INCIDENT_SEVERITIES, context),
    requireNumber(value, 'repairCost', context, 0),
    requireNumber(value, 'reputationImpact', context, -100, 100),
    requireNumber(value, 'trustImpact', context, -100, 100),
    requireEnum(value, 'status', INCIDENT_STATUSES, context),
    requireNullableString(value, 'loreLink', context),
    requireStringArray(value, 'tags', context),
    requireOptionalInteger(value, 'resolvedDay', context, 1)
  ]);
}

function validateTask(value: unknown, index: number): string | null {
  const context = `staffTasks[${index}]`;
  if (!isRecord(value)) return `${context} must be an object.`;
  return firstError([
    ...['id', 'date', 'title', 'assignedTo', 'notes'].map(key => requireString(value, key, context)),
    requireEnum(value, 'type', TASK_TYPES, context),
    requireNumber(value, 'mentalWorkload', context, 1, 10),
    requireEnum(value, 'status', TASK_STATUSES, context),
    requireOptionalString(value, 'targetId', context),
    requireOptionalInteger(value, 'createdDay', context, 1),
    requireOptionalInteger(value, 'availableOnDay', context, 1)
  ]);
}

function validateLore(value: unknown, index: number): string | null {
  const context = `loreCodex[${index}]`;
  if (!isRecord(value)) return `${context} must be an object.`;
  return firstError([
    ...['id', 'title', 'entityName', 'description', 'sourceRef'].map(key => requireString(value, key, context)),
    requireEnum(value, 'category', LORE_CATEGORIES, context),
    requireEnum(value, 'canonStatus', CANON_STATUSES, context),
    requireEnum(value, 'sourceType', SOURCE_TYPES, context),
    requireEnum(value, 'spoilerLevel', SPOILER_LEVELS, context),
    requireEnum(value, 'timelineScope', TIMELINE_SCOPES, context),
    requireBoolean(value, 'isLocked', context)
  ]);
}

function validateFaction(value: unknown, index: number): string | null {
  const context = `factions[${index}]`;
  if (!isRecord(value)) return `${context} must be an object.`;
  return firstError([
    requireString(value, 'id', context),
    requireString(value, 'name', context),
    requireString(value, 'description', context),
    requireNumber(value, 'influence', context, 0, 100)
  ]);
}

function validateRelationship(value: unknown, index: number): string | null {
  const context = `relationships[${index}]`;
  if (!isRecord(value)) return `${context} must be an object.`;
  return firstError([
    ...['id', 'charAId', 'charBId', 'notes'].map(key => requireString(value, key, context)),
    requireEnum(value, 'type', RELATIONSHIP_TYPES, context)
  ]);
}

function validateLedger(value: unknown, index: number): string | null {
  const context = `resourceLedger[${index}]`;
  if (!isRecord(value)) return `${context} must be an object.`;
  return firstError([
    ...['id', 'date', 'description'].map(key => requireString(value, key, context)),
    requireEnum(value, 'type', new Set(['income', 'expense']), context),
    requireEnum(value, 'category', RESOURCE_CATEGORIES, context),
    requireNumber(value, 'amount', context, 0)
  ]);
}

function validateAuditLog(value: unknown, index: number): string | null {
  const context = `auditLogs[${index}]`;
  if (!isRecord(value)) return `${context} must be an object.`;
  return firstError(['id', 'timestamp', 'action', 'details'].map(key => requireString(value, key, context)));
}

function validateArray(name: string, value: unknown[], validator: (entry: unknown, index: number) => string | null): string | null {
  for (let index = 0; index < value.length; index += 1) {
    const error = validator(value[index], index);
    if (error) return `Invalid backup field '${name}': ${error}`;
  }
  return null;
}

function duplicateValue(values: string[]): string | null {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) return value;
    seen.add(value);
  }
  return null;
}

function parseInventory(value: unknown): { inventory?: InventoryBackup; error?: string } {
  if (value === undefined) return {};
  if (!isRecord(value)) return { error: 'Invalid backup inventory: expected an object.' };
  const inventory: InventoryBackup = { ...DEFAULT_INVENTORY };
  for (const key of Object.keys(INVENTORY_KEYS) as Array<keyof InventoryBackup>) {
    const amount = value[key];
    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 0 || amount > INVENTORY_MAX) {
      return { error: `Invalid backup inventory: '${key}' must be an integer between 0 and ${INVENTORY_MAX}.` };
    }
    inventory[key] = amount;
  }
  return { inventory };
}

function parseIntegerRecord(value: unknown, context: string, max = Number.MAX_SAFE_INTEGER): { value?: Record<string, number>; error?: string } {
  if (!isRecord(value)) return { error: `${context} must be an object.` };
  const parsed: Record<string, number> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (!Number.isInteger(entry) || Number(entry) < 0 || Number(entry) > max) {
      return { error: `${context}.${key} must be a non-negative integer.` };
    }
    parsed[key] = Number(entry);
  }
  return { value: parsed };
}

function parseGameplayMeta(value: unknown): { value?: GameplayMeta; error?: string; migrated: boolean } {
  if (value === undefined) return { value: cloneJson(DEFAULT_GAMEPLAY_META), migrated: true };
  if (!isRecord(value)) return { error: 'gameplayMeta must be an object.', migrated: false };
  if (!Number.isInteger(value.campaignDay) || Number(value.campaignDay) < 1) {
    return { error: 'gameplayMeta.campaignDay must be a positive integer.', migrated: false };
  }

  const listKeys: Array<keyof Pick<GameplayMeta,
    'completedMilestones' | 'appliedTaskIds' | 'resolvedIncidentIds' | 'rewardedRedemptionIds' | 'broadcastRedemptionIds' | 'narrativeFlags'>> = [
      'completedMilestones', 'appliedTaskIds', 'resolvedIncidentIds', 'rewardedRedemptionIds', 'broadcastRedemptionIds', 'narrativeFlags'
    ];
  for (const key of listKeys) {
    if (!Array.isArray(value[key]) || !(value[key] as unknown[]).every(entry => typeof entry === 'string')) {
      return { error: `gameplayMeta.${key} must be a list of strings.`, migrated: false };
    }
    if (duplicateValue(value[key] as string[]) !== null) {
      return { error: `gameplayMeta.${key} must not contain duplicates.`, migrated: false };
    }
  }

  const cooldowns = parseIntegerRecord(value.cooldowns, 'gameplayMeta.cooldowns');
  const dailySessionCounts = parseIntegerRecord(value.dailySessionCounts, 'gameplayMeta.dailySessionCounts');
  const dailyDonationAmounts = parseIntegerRecord(value.dailyDonationAmounts, 'gameplayMeta.dailyDonationAmounts');
  const staffFatigue = parseIntegerRecord(value.staffFatigue, 'gameplayMeta.staffFatigue', 100);
  const error = cooldowns.error || dailySessionCounts.error || dailyDonationAmounts.error || staffFatigue.error;
  if (error) return { error, migrated: false };

  return {
    value: {
      campaignDay: Number(value.campaignDay),
      cooldowns: cooldowns.value!,
      completedMilestones: [...value.completedMilestones as string[]],
      appliedTaskIds: [...value.appliedTaskIds as string[]],
      resolvedIncidentIds: [...value.resolvedIncidentIds as string[]],
      rewardedRedemptionIds: [...value.rewardedRedemptionIds as string[]],
      broadcastRedemptionIds: [...value.broadcastRedemptionIds as string[]],
      narrativeFlags: [...value.narrativeFlags as string[]],
      dailySessionCounts: dailySessionCounts.value!,
      dailyDonationAmounts: dailyDonationAmounts.value!,
      staffFatigue: staffFatigue.value!
    },
    migrated: false
  };
}

function parseHelluvaBossState(value: unknown): { value?: HelluvaBossSaveState; error?: string } {
  if (!isRecord(value)) return { error: 'extensions.helluvaBoss must be an object.' };
  if (!Number.isInteger(value.dataVersion) || Number(value.dataVersion) < 1) {
    return { error: 'extensions.helluvaBoss.dataVersion must be a positive integer.' };
  }
  if (Number(value.dataVersion) > HELLUVA_BOSS_DATA_VERSION) {
    return { error: `extensions.helluvaBoss uses unsupported data version ${value.dataVersion}.` };
  }

  const context = 'extensions.helluvaBoss';
  const scalarError = firstError([
    requireBoolean(value, 'enabled', context),
    requireEnum(value, 'spoilerScope', new Set(['season_1', 'season_2']), context),
    requireNumber(value, 'campaignDay', context, 1),
    requireEnum(value, 'status', new Set(['active', 'victory', 'collapse']), context),
    requireNullableString(value, 'activeContractId', context),
    requireNumber(value, 'activePhaseIndex', context, 0, 2),
    requireNumber(value, 'funds', context, -100000, 1000000),
    requireNumber(value, 'heat', context, 0, 100),
    requireNumber(value, 'cohesion', context, 0, 100),
    requireNumber(value, 'discretion', context, 0, 100),
    requireNumber(value, 'reputation', context, 0, 100),
    requireStringArray(value, 'completedContractIds', context),
    requireStringArray(value, 'selectedChoiceIds', context),
    requireStringArray(value, 'operationLog', context)
  ]);
  if (scalarError) return { error: scalarError };
  const integerFields = [
    'campaignDay',
    'activePhaseIndex',
    'funds',
    'heat',
    'cohesion',
    'discretion',
    'reputation'
  ];
  const nonIntegerField = integerFields.find(key => !Number.isInteger(value[key]));
  if (nonIntegerField) {
    return { error: `${context}.${nonIntegerField} must be an integer.` };
  }

  const completedContractIds = value.completedContractIds as string[];
  const selectedChoiceIds = value.selectedChoiceIds as string[];
  if (duplicateValue(completedContractIds) !== null) return { error: `${context}.completedContractIds must not contain duplicates.` };
  if (duplicateValue(selectedChoiceIds) !== null) return { error: `${context}.selectedChoiceIds must not contain duplicates.` };

  const orderedContractIds = HELLUVA_CONTRACTS.map(contract => contract.id);
  if (completedContractIds.length > orderedContractIds.length
    || completedContractIds.some((id, index) => id !== orderedContractIds[index])) {
    return { error: `${context}.completedContractIds must be the exact ordered prefix of the contract chain.` };
  }
  const expectedCampaignDay = completedContractIds.length + 1;
  if (Number(value.campaignDay) !== expectedCampaignDay) {
    return { error: `${context}.campaignDay must equal completedContractIds.length + 1 (${expectedCampaignDay}).` };
  }

  const activeContractId = value.activeContractId as string | null;
  if (activeContractId !== null) {
    const expectedActiveContractId = orderedContractIds[completedContractIds.length];
    if (!expectedActiveContractId) {
      return { error: `${context} cannot keep an active contract after all contracts are completed.` };
    }
    if (activeContractId !== expectedActiveContractId) {
      return { error: `${context}.activeContractId must be the next uncompleted contract '${expectedActiveContractId}'.` };
    }
  }
  if (activeContractId === null && Number(value.activePhaseIndex) !== 0) {
    return { error: `${context}.activePhaseIndex must be 0 when no contract is active.` };
  }
  if (value.status !== 'active' && activeContractId !== null) {
    return { error: `${context} cannot keep an active contract after an ending.` };
  }
  if (value.status === 'victory' && completedContractIds.length !== orderedContractIds.length) {
    return { error: `${context}.status victory requires all ${orderedContractIds.length} contracts to be completed.` };
  }
  if (value.status === 'active' && completedContractIds.length === orderedContractIds.length) {
    return { error: `${context}.status cannot remain active after all contracts are completed.` };
  }

  const crewFatigue = parseIntegerRecord(value.crewFatigue, `${context}.crewFatigue`, 100);
  if (crewFatigue.error) return { error: crewFatigue.error };
  const fatigueIds = Object.keys(crewFatigue.value!);
  if (fatigueIds.length !== HELLUVA_CREW_IDS.length
    || HELLUVA_CREW_IDS.some(crewId => !Object.prototype.hasOwnProperty.call(crewFatigue.value!, crewId))) {
    return { error: `${context}.crewFatigue must contain exactly the four stable I.M.P. crew IDs.` };
  }
  const averageFatigue = HELLUVA_CREW_IDS.reduce(
    (total, crewId) => total + crewFatigue.value![crewId],
    0
  ) / HELLUVA_CREW_IDS.length;
  const collapseThresholdReached = Number(value.heat) >= 100
    || Number(value.cohesion) <= 0
    || Number(value.funds) <= -500
    || averageFatigue >= 100;
  if (value.status === 'collapse' && !collapseThresholdReached) {
    return { error: `${context}.status collapse requires a terminal heat, cohesion, funds, or fatigue threshold.` };
  }
  if (value.status !== 'collapse' && collapseThresholdReached) {
    return { error: `${context} terminal heat, cohesion, funds, or fatigue requires status collapse.` };
  }

  const approachById = new Map(HELLUVA_APPROACHES.map(approach => [approach.id, approach]));
  const expectedResolvedPhases = new Set<string>();
  for (const contractId of completedContractIds) {
    for (const phaseIndex of [0, 1, 2]) expectedResolvedPhases.add(`${contractId}:${phaseIndex}`);
  }
  if (activeContractId !== null) {
    for (let phaseIndex = 0; phaseIndex < Number(value.activePhaseIndex); phaseIndex += 1) {
      expectedResolvedPhases.add(`${activeContractId}:${phaseIndex}`);
    }
  }

  const resolvedPhases = new Set<string>();
  const resolvedPhaseDetails: Array<{ contractId: string; phaseIndex: number; phaseKey: string }> = [];
  for (const selectedChoiceId of selectedChoiceIds) {
    const parts = selectedChoiceId.split(':');
    if (parts.length !== 3 || !/^(0|1|2)$/.test(parts[1])) {
      return { error: `${context}.selectedChoiceIds contains malformed choice '${selectedChoiceId}'.` };
    }
    const [contractId, phaseText, choiceId] = parts;
    const phaseIndex = Number(phaseText);
    const approach = approachById.get(choiceId);
    if (!approach || approach.phaseIndex !== phaseIndex) {
      return { error: `${context}.selectedChoiceIds contains choice '${choiceId}' for the wrong or unsupported phase.` };
    }
    const phaseKey = `${contractId}:${phaseIndex}`;
    if (resolvedPhases.has(phaseKey)) {
      return { error: `${context}.selectedChoiceIds must contain exactly one choice per resolved phase.` };
    }
    resolvedPhases.add(phaseKey);
    resolvedPhaseDetails.push({ contractId, phaseIndex, phaseKey });
  }

  if (value.status === 'collapse') {
    const partialCollapsePhases = resolvedPhaseDetails.filter(({ phaseKey }) => !expectedResolvedPhases.has(phaseKey));
    if (partialCollapsePhases.length > 0) {
      const nextContractId = orderedContractIds[completedContractIds.length];
      const isStrictPartialPrefix = Boolean(nextContractId)
        && partialCollapsePhases.length <= 2
        && partialCollapsePhases.every(({ contractId }) => contractId === nextContractId)
        && Array.from({ length: partialCollapsePhases.length }, (_, phaseIndex) => (
          resolvedPhases.has(`${nextContractId}:${phaseIndex}`)
        )).every(Boolean);
      if (!isStrictPartialPrefix) {
        return { error: `${context}.selectedChoiceIds may only retain the phase prefix of the next contract that triggered collapse.` };
      }
      for (let phaseIndex = 0; phaseIndex < partialCollapsePhases.length; phaseIndex += 1) {
        expectedResolvedPhases.add(`${nextContractId}:${phaseIndex}`);
      }
    }
  }

  const unexpectedResolvedPhase = resolvedPhaseDetails.find(({ phaseKey }) => !expectedResolvedPhases.has(phaseKey));
  if (unexpectedResolvedPhase) {
    return { error: `${context}.selectedChoiceIds contains unresolved or out-of-sequence phase '${unexpectedResolvedPhase.phaseKey}'.` };
  }
  const missingResolvedPhase = [...expectedResolvedPhases].find(phaseKey => !resolvedPhases.has(phaseKey));
  if (missingResolvedPhase) {
    return { error: `${context}.selectedChoiceIds is missing resolved phase '${missingResolvedPhase}'.` };
  }

  return {
    value: {
      enabled: Boolean(value.enabled),
      dataVersion: Number(value.dataVersion),
      spoilerScope: value.spoilerScope as HelluvaBossSaveState['spoilerScope'],
      campaignDay: Number(value.campaignDay),
      status: value.status as HelluvaBossSaveState['status'],
      activeContractId,
      activePhaseIndex: Number(value.activePhaseIndex),
      completedContractIds: [...completedContractIds],
      selectedChoiceIds: [...selectedChoiceIds],
      funds: Number(value.funds),
      heat: Number(value.heat),
      cohesion: Number(value.cohesion),
      discretion: Number(value.discretion),
      reputation: Number(value.reputation),
      crewFatigue: crewFatigue.value!,
      operationLog: [...value.operationLog as string[]].slice(0, 60)
    }
  };
}

function parseExtensions(
  value: unknown,
  isLegacy: boolean
): { value?: DatabaseState['extensions']; error?: string; migrated: boolean } {
  if (value === undefined) {
    return isLegacy
      ? { value: {}, migrated: true }
      : { error: `Invalid schema v${BACKUP_SCHEMA_VERSION} backup: missing required structure field 'extensions'.`, migrated: false };
  }
  if (!isRecord(value)) return { error: 'Invalid backup: extensions must be an object.', migrated: false };
  if (value.helluvaBoss === undefined) return { value: {}, migrated: false };
  const helluvaBoss = parseHelluvaBossState(value.helluvaBoss);
  if (helluvaBoss.error || !helluvaBoss.value) return { error: `Invalid backup: ${helluvaBoss.error || 'Helluva Boss extension state is invalid.'}`, migrated: false };
  return { value: { helluvaBoss: helluvaBoss.value }, migrated: false };
}

function resolveStorage(storage?: StorageLike): StorageLike | undefined {
  if (storage) return storage;
  return typeof localStorage !== 'undefined' ? localStorage : undefined;
}

export class ExportImport {
  public static readInventory(storage?: StorageLike): InventoryBackup {
    const inventory = { ...DEFAULT_INVENTORY };
    const target = resolveStorage(storage);
    if (!target) {
      throw new Error('Browser storage is unavailable; inventory cannot be read safely.');
    }
    for (const key of Object.keys(INVENTORY_KEYS) as Array<keyof InventoryBackup>) {
      const storageKey = INVENTORY_KEYS[key];
      const raw = target.getItem(storageKey);
      if (raw === null) {
        inventory[key] = DEFAULT_INVENTORY[key];
        continue;
      }
      const value = Number(raw);
      if (raw.trim() === '' || !Number.isInteger(value) || value < 0 || value > INVENTORY_MAX) {
        throw new Error(`Stored inventory '${storageKey}' must be an integer between 0 and ${INVENTORY_MAX}; found '${raw}'.`);
      }
      inventory[key] = value;
    }
    return inventory;
  }

  public static inventoryEntries(inventory: InventoryBackup): Array<[string, string]> {
    return (Object.keys(INVENTORY_KEYS) as Array<keyof InventoryBackup>)
      .map(key => [INVENTORY_KEYS[key], String(inventory[key])]);
  }

  /** Serializes a complete, versioned backup including the separately stored inventory. */
  public static exportToJson(state: DatabaseState, storage?: StorageLike): string {
    const normalized = this.validateState(state);
    if (!normalized.isValid || !normalized.parsedState) {
      throw new Error(normalized.error || 'The current database cannot be exported safely.');
    }
    const backup: DatabaseBackupState = {
      schemaVersion: BACKUP_SCHEMA_VERSION,
      ...this.databaseStateOnly(normalized.parsedState),
      inventory: this.readInventory(storage)
    };
    return JSON.stringify(backup, null, 2);
  }

  /** Validates and migrates a parsed state without trusting TypeScript casts at runtime. */
  public static validateState(input: unknown, options: BackupValidationOptions = {}): BackupValidationResult {
    if (!isRecord(input)) {
      return { isValid: false, error: 'Invalid JSON backup: root element must be an object.' };
    }

    const rawVersion = input.schemaVersion;
    if (rawVersion !== undefined && (!Number.isInteger(rawVersion) || Number(rawVersion) < 1)) {
      return { isValid: false, error: 'Invalid backup: schemaVersion must be a positive integer.' };
    }
    if (typeof rawVersion === 'number' && rawVersion > BACKUP_SCHEMA_VERSION) {
      return { isValid: false, error: `This backup uses unsupported schema version ${rawVersion}.` };
    }

    const isLegacy = rawVersion === undefined || Number(rawVersion) < BACKUP_SCHEMA_VERSION;

    for (const key of LEGACY_REQUIRED_ARRAYS) {
      if (!Array.isArray(input[key])) {
        return { isValid: false, error: `Invalid backup: missing list field '${key}'.` };
      }
    }
    for (const key of LEGACY_REQUIRED_OBJECTS) {
      if (!isRecord(input[key])) {
        return { isValid: false, error: `Invalid backup: missing structure field '${key}'.` };
      }
    }

    const warnings: string[] = [];
    let migrated = rawVersion !== BACKUP_SCHEMA_VERSION;
    const optionalArrays: Partial<Record<keyof DatabaseState, unknown[]>> = {};
    for (const key of OPTIONAL_LEGACY_ARRAYS) {
      if (input[key] === undefined) {
        if (!isLegacy) {
          return { isValid: false, error: `Invalid schema v${BACKUP_SCHEMA_VERSION} backup: missing required list field '${key}'.` };
        }
        optionalArrays[key] = [];
        migrated = true;
        warnings.push(`Legacy field '${key}' was missing and was initialized as an empty list.`);
      } else if (!Array.isArray(input[key])) {
        return { isValid: false, error: `Invalid backup: field '${key}' must be a list.` };
      } else {
        optionalArrays[key] = input[key] as unknown[];
      }
    }

    const seed = getSeedData();
    if (!isLegacy && input.gameplayMeta === undefined) {
      return { isValid: false, error: `Invalid schema v${BACKUP_SCHEMA_VERSION} backup: missing required structure field 'gameplayMeta'.` };
    }
    const gameplayMetaResult = parseGameplayMeta(input.gameplayMeta);
    if (gameplayMetaResult.error || !gameplayMetaResult.value) {
      return { isValid: false, error: `Invalid backup: ${gameplayMetaResult.error || 'gameplayMeta is invalid.'}` };
    }
    if (gameplayMetaResult.migrated) {
      migrated = true;
      warnings.push('Legacy gameplay cooldowns and milestones were initialized in durable gameplayMeta state.');
    }
    const extensionsResult = parseExtensions(input.extensions, isLegacy);
    if (extensionsResult.error || !extensionsResult.value) {
      return { isValid: false, error: extensionsResult.error || 'Invalid backup: extensions are invalid.' };
    }
    if (extensionsResult.migrated) {
      migrated = true;
      warnings.push('Legacy backup migrated with optional content extensions disabled and no core data loss.');
    }
    const state: DatabaseState = {
      characters: cloneJson(input.characters as DatabaseState['characters']),
      rooms: cloneJson(input.rooms as DatabaseState['rooms']),
      rehabilitationPlans: cloneJson(input.rehabilitationPlans as DatabaseState['rehabilitationPlans']),
      rehabilitationSessions: cloneJson((optionalArrays.rehabilitationSessions || []) as DatabaseState['rehabilitationSessions']),
      incidents: cloneJson((optionalArrays.incidents || []) as DatabaseState['incidents']),
      staffTasks: cloneJson((optionalArrays.staffTasks || []) as DatabaseState['staffTasks']),
      reputation: isLegacy
        ? { ...seed.reputation, ...(input.reputation as Partial<DatabaseState['reputation']>) }
        : cloneJson(input.reputation as DatabaseState['reputation']),
      timeline: isLegacy
        ? { ...seed.timeline, ...(input.timeline as Partial<DatabaseState['timeline']>) }
        : cloneJson(input.timeline as DatabaseState['timeline']),
      loreCodex: cloneJson(input.loreCodex as DatabaseState['loreCodex']),
      factions: cloneJson(input.factions as DatabaseState['factions']),
      relationships: cloneJson(input.relationships as DatabaseState['relationships']),
      resourceLedger: cloneJson((optionalArrays.resourceLedger || []) as DatabaseState['resourceLedger']),
      auditLogs: cloneJson((optionalArrays.auditLogs || []) as DatabaseState['auditLogs']),
      settings: isLegacy
        ? { ...seed.settings, ...(input.settings as Partial<DatabaseState['settings']>) }
        : cloneJson(input.settings as DatabaseState['settings']),
      extensions: cloneJson(extensionsResult.value),
      gameplayMeta: gameplayMetaResult.value
    };
    if (gameplayMetaResult.migrated) {
      state.gameplayMeta!.appliedTaskIds = state.staffTasks.filter(task => task.status === 'completed').map(task => task.id);
      state.gameplayMeta!.resolvedIncidentIds = state.incidents
        .filter(incident => incident.status === 'resolved' || incident.status === 'archived')
        .map(incident => incident.id);
      const confirmedCharacterIds = new Set(state.rehabilitationPlans.filter(plan => plan.isRedeemedConfirmed).map(plan => plan.characterId));
      state.gameplayMeta!.rewardedRedemptionIds = state.characters
        .filter(character => character.status === 'redeemed' && confirmedCharacterIds.has(character.id))
        .map(character => character.id);
    }

    const arrayError = firstError([
      validateArray('characters', state.characters, validateCharacter),
      validateArray('rooms', state.rooms, validateRoom),
      validateArray('rehabilitationPlans', state.rehabilitationPlans, validatePlan),
      validateArray('rehabilitationSessions', state.rehabilitationSessions, validateSession),
      validateArray('incidents', state.incidents, validateIncident),
      validateArray('staffTasks', state.staffTasks, validateTask),
      validateArray('loreCodex', state.loreCodex, validateLore),
      validateArray('factions', state.factions, validateFaction),
      validateArray('relationships', state.relationships, validateRelationship),
      validateArray('resourceLedger', state.resourceLedger, validateLedger),
      validateArray('auditLogs', state.auditLogs, validateAuditLog)
    ]);
    if (arrayError) return { isValid: false, error: arrayError };

    const singletonError = firstError([
      ...['sinnerReputation', 'redemptionCredibility', 'internalTrust', 'heavenAttention', 'overlordHostility', 'veesInfluence', 'mediaChaos']
        .map(key => requireNumber(state.reputation as unknown as UnknownRecord, key, 'reputation', 0, 100)),
      requireEnum(state.timeline as unknown as UnknownRecord, 'current', TIMELINE_SCOPES, 'timeline'),
      requireBoolean(state.timeline as unknown as UnknownRecord, 'hideSpoilers', 'timeline'),
      requireEnum(state.timeline as unknown as UnknownRecord, 'spoilerLevel', SPOILER_LEVELS, 'timeline'),
      requireEnum(state.timeline as unknown as UnknownRecord, 'hotelState', new Set(['original', 'damaged', 'rebuilt']), 'timeline'),
      requireString(state.settings as unknown as UnknownRecord, 'appName', 'settings'),
      requireBoolean(state.settings as unknown as UnknownRecord, 'randomEventsEnabled', 'settings'),
      requireString(state.settings as unknown as UnknownRecord, 'theme', 'settings')
    ]);
    if (singletonError) return { isValid: false, error: `Invalid backup: ${singletonError}` };

    const uniqueCollections: Array<[string, string[]]> = [
      ['character id', state.characters.map(item => item.id)],
      ['room number', state.rooms.map(item => item.number)],
      ['rehabilitation plan id', state.rehabilitationPlans.map(item => item.id)],
      ['rehabilitation session id', state.rehabilitationSessions.map(item => item.id)],
      ['incident id', state.incidents.map(item => item.id)],
      ['staff task id', state.staffTasks.map(item => item.id)],
      ['lore id', state.loreCodex.map(item => item.id)],
      ['faction id', state.factions.map(item => item.id)],
      ['relationship id', state.relationships.map(item => item.id)],
      ['ledger id', state.resourceLedger.map(item => item.id)],
      ['audit log id', state.auditLogs.map(item => item.id)]
    ];
    for (const [label, values] of uniqueCollections) {
      const duplicate = duplicateValue(values);
      if (duplicate !== null) return { isValid: false, error: `Invalid backup: duplicate ${label} '${duplicate}'.` };
    }
    const duplicatePlanCharacter = duplicateValue(state.rehabilitationPlans.map(item => item.characterId));
    if (duplicatePlanCharacter !== null) {
      return { isValid: false, error: `Invalid backup: multiple rehabilitation plans reference '${duplicatePlanCharacter}'.` };
    }

    const characterIds = new Set(state.characters.map(item => item.id));
    const planIds = new Set(state.rehabilitationPlans.map(item => item.id));
    const roomNumbers = new Set(state.rooms.map(item => item.number));
    const loreIds = new Set(state.loreCodex.map(item => item.id));
    const occupiedIds = state.rooms.flatMap(room => {
      const sharedOccupants = room.occupantIds || [];
      return Array.from(new Set([...(room.occupantId ? [room.occupantId] : []), ...sharedOccupants]));
    });
    const duplicateOccupant = duplicateValue(occupiedIds);
    if (duplicateOccupant !== null) return { isValid: false, error: `Invalid backup: character '${duplicateOccupant}' occupies multiple rooms.` };

    for (const room of state.rooms) {
      if (room.occupantId && !characterIds.has(room.occupantId)) return { isValid: false, error: `Invalid backup: room '${room.number}' references missing occupant '${room.occupantId}'.` };
      if (room.occupantIds) {
        const duplicateSharedOccupant = duplicateValue(room.occupantIds);
        if (duplicateSharedOccupant !== null) return { isValid: false, error: `Invalid backup: room '${room.number}' repeats occupant '${duplicateSharedOccupant}'.` };
        const missingSharedOccupant = room.occupantIds.find(id => !characterIds.has(id));
        if (missingSharedOccupant) return { isValid: false, error: `Invalid backup: room '${room.number}' references missing occupant '${missingSharedOccupant}'.` };
        if (room.occupantIds.length > room.capacity) return { isValid: false, error: `Invalid backup: room '${room.number}' exceeds its capacity.` };
        if (room.occupantIds.length > 0 && !room.occupantId) return { isValid: false, error: `Invalid backup: room '${room.number}' has shared occupants but no primary occupant.` };
        if (room.occupantId && !room.occupantIds.includes(room.occupantId)) return { isValid: false, error: `Invalid backup: room '${room.number}' primary occupant is absent from occupantIds.` };
      }
      if (room.lastInspectedBy && !characterIds.has(room.lastInspectedBy)) return { isValid: false, error: `Invalid backup: room '${room.number}' references missing inspector '${room.lastInspectedBy}'.` };
    }
    for (const plan of state.rehabilitationPlans) {
      if (!characterIds.has(plan.characterId)) return { isValid: false, error: `Invalid backup: plan '${plan.id}' references missing character '${plan.characterId}'.` };
      const character = state.characters.find(candidate => candidate.id === plan.characterId)!;
      if (plan.isRedeemedConfirmed && (character.status !== 'redeemed' || character.type !== 'redeemed_soul')) {
        return { isValid: false, error: `Invalid backup: confirmed plan '${plan.id}' does not reference a redeemed soul.` };
      }
    }
    for (const session of state.rehabilitationSessions) {
      if (!planIds.has(session.planId)) return { isValid: false, error: `Invalid backup: session '${session.id}' references missing plan '${session.planId}'.` };
      if (!characterIds.has(session.conductedBy)) return { isValid: false, error: `Invalid backup: session '${session.id}' references missing conductor '${session.conductedBy}'.` };
      if (session.campaignDay !== undefined && session.campaignDay > state.gameplayMeta!.campaignDay) return { isValid: false, error: `Invalid backup: session '${session.id}' occurs after the current campaign day.` };
    }
    for (const incident of state.incidents) {
      const missingResident = incident.residentsInvolved.find(id => !characterIds.has(id));
      if (missingResident) return { isValid: false, error: `Invalid backup: incident '${incident.id}' references missing character '${missingResident}'.` };
      if (incident.loreLink && !loreIds.has(incident.loreLink)) return { isValid: false, error: `Invalid backup: incident '${incident.id}' references missing lore '${incident.loreLink}'.` };
      if (incident.resolvedDay !== undefined && incident.resolvedDay > state.gameplayMeta!.campaignDay) return { isValid: false, error: `Invalid backup: incident '${incident.id}' resolves after the current campaign day.` };
    }
    for (const task of state.staffTasks) {
      if (!characterIds.has(task.assignedTo)) return { isValid: false, error: `Invalid backup: task '${task.id}' references missing assignee '${task.assignedTo}'.` };
      const assignee = state.characters.find(character => character.id === task.assignedTo)!;
      if ((task.status === 'pending' || task.status === 'in_progress') && assignee.status !== 'staff') return { isValid: false, error: `Invalid backup: active task '${task.id}' is not assigned to active staff.` };
      if (task.createdDay !== undefined && task.createdDay > state.gameplayMeta!.campaignDay) return { isValid: false, error: `Invalid backup: task '${task.id}' was created after the current campaign day.` };
      if (task.createdDay !== undefined && task.availableOnDay !== undefined && task.availableOnDay < task.createdDay) return { isValid: false, error: `Invalid backup: task '${task.id}' is available before it was created.` };
      const isActive = task.status === 'pending' || task.status === 'in_progress';
      if (isActive && (task.type === 'room_inspection' || task.type === 'repair_work') && task.targetId && !roomNumbers.has(task.targetId)) return { isValid: false, error: `Invalid backup: task '${task.id}' references missing room target '${task.targetId}'.` };
      if (isActive && task.type === 'rehab_prep' && task.targetId && !planIds.has(task.targetId)) return { isValid: false, error: `Invalid backup: task '${task.id}' references missing plan target '${task.targetId}'.` };
      if (isActive && task.type === 'new_sinner_intake' && task.targetId && !characterIds.has(task.targetId)) return { isValid: false, error: `Invalid backup: task '${task.id}' references missing applicant target '${task.targetId}'.` };
    }
    for (const relationship of state.relationships) {
      if (!characterIds.has(relationship.charAId) || !characterIds.has(relationship.charBId)) {
        return { isValid: false, error: `Invalid backup: relationship '${relationship.id}' references a missing character.` };
      }
      if (relationship.charAId === relationship.charBId) {
        return { isValid: false, error: `Invalid backup: relationship '${relationship.id}' cannot reference the same character twice.` };
      }
    }

    const confirmedPlanByCharacter = new Map(state.rehabilitationPlans.map(plan => [plan.characterId, plan]));
    for (const character of state.characters) {
      if ((character.type === 'redeemed_soul') !== (character.status === 'redeemed')) {
        return { isValid: false, error: `Invalid backup: character '${character.id}' has inconsistent redeemed type and status.` };
      }
      if (character.status === 'redeemed' && !confirmedPlanByCharacter.get(character.id)?.isRedeemedConfirmed) {
        return { isValid: false, error: `Invalid backup: redeemed character '${character.id}' lacks a confirmed rehabilitation plan.` };
      }
    }

    const taskIds = new Set(state.staffTasks.map(task => task.id));
    const incidentIds = new Set(state.incidents.map(incident => incident.id));
    for (const taskId of state.gameplayMeta!.appliedTaskIds) {
      const task = state.staffTasks.find(candidate => candidate.id === taskId);
      if (!taskIds.has(taskId) || task?.status !== 'completed') return { isValid: false, error: `Invalid backup: applied task marker '${taskId}' is inconsistent.` };
    }
    if (state.staffTasks.some(task => task.status === 'completed' && !state.gameplayMeta!.appliedTaskIds.includes(task.id))) {
      return { isValid: false, error: 'Invalid backup: a completed task lacks its exactly-once marker.' };
    }
    for (const incidentId of state.gameplayMeta!.resolvedIncidentIds) {
      const incident = state.incidents.find(candidate => candidate.id === incidentId);
      if (!incidentIds.has(incidentId) || (incident?.status !== 'resolved' && incident?.status !== 'archived')) return { isValid: false, error: `Invalid backup: resolved incident marker '${incidentId}' is inconsistent.` };
    }
    if (state.incidents.some(incident => (incident.status === 'resolved' || incident.status === 'archived') && !state.gameplayMeta!.resolvedIncidentIds.includes(incident.id))) {
      return { isValid: false, error: 'Invalid backup: a resolved incident lacks its exactly-once marker.' };
    }
    for (const characterId of state.gameplayMeta!.rewardedRedemptionIds) {
      const character = state.characters.find(candidate => candidate.id === characterId);
      if (!character || character.status !== 'redeemed') return { isValid: false, error: `Invalid backup: redemption reward marker '${characterId}' is inconsistent.` };
    }
    if (state.characters.some(character => character.status === 'redeemed' && !state.gameplayMeta!.rewardedRedemptionIds.includes(character.id))) {
      return { isValid: false, error: 'Invalid backup: a redeemed soul lacks its exactly-once reward marker.' };
    }
    if (state.gameplayMeta!.broadcastRedemptionIds.some(characterId => !state.gameplayMeta!.rewardedRedemptionIds.includes(characterId))) {
      return { isValid: false, error: 'Invalid backup: a redemption broadcast marker lacks its workflow reward marker.' };
    }

    if (!isLegacy && options.requireInventory && input.inventory === undefined) {
      return { isValid: false, error: `Invalid schema v${BACKUP_SCHEMA_VERSION} backup: missing required structure field 'inventory'.` };
    }
    const inventoryResult = parseInventory(input.inventory);
    if (inventoryResult.error) return { isValid: false, error: inventoryResult.error };

    const inventory = inventoryResult.inventory
      || (isLegacy && options.requireInventory ? cloneJson(DEFAULT_INVENTORY) : undefined);
    if (isLegacy && options.requireInventory && !inventoryResult.inventory) {
      migrated = true;
      warnings.push('Legacy inventory was missing and was initialized with safe default stock values.');
    }

    const parsedState: DatabaseBackupState = {
      ...state,
      schemaVersion: BACKUP_SCHEMA_VERSION,
      ...(inventory ? { inventory } : {})
    };
    return { isValid: true, parsedState, migrated, warnings };
  }

  /** Parses, validates and migrates a plaintext JSON backup. */
  public static validateBackup(jsonText: string, options: BackupValidationOptions = {}): BackupValidationResult {
    if (jsonText.length > MAX_BACKUP_BYTES
      || (typeof TextEncoder !== 'undefined' && new TextEncoder().encode(jsonText).byteLength > MAX_BACKUP_BYTES)) {
      return { isValid: false, error: 'Backup exceeds the 2 MiB import limit.' };
    }
    try {
      return this.validateState(JSON.parse(jsonText), options);
    } catch {
      return { isValid: false, error: 'Failed to parse file as JSON. Please ensure it is a valid plaintext JSON backup file.' };
    }
  }

  public static databaseStateOnly(state: DatabaseBackupState): DatabaseState {
    return {
      characters: cloneJson(state.characters),
      rooms: cloneJson(state.rooms),
      rehabilitationPlans: cloneJson(state.rehabilitationPlans),
      rehabilitationSessions: cloneJson(state.rehabilitationSessions),
      incidents: cloneJson(state.incidents),
      staffTasks: cloneJson(state.staffTasks),
      reputation: cloneJson(state.reputation),
      timeline: cloneJson(state.timeline),
      loreCodex: cloneJson(state.loreCodex),
      factions: cloneJson(state.factions),
      relationships: cloneJson(state.relationships),
      resourceLedger: cloneJson(state.resourceLedger),
      auditLogs: cloneJson(state.auditLogs),
      settings: cloneJson(state.settings),
      extensions: cloneJson(state.extensions),
      gameplayMeta: cloneJson(state.gameplayMeta || DEFAULT_GAMEPLAY_META)
    };
  }
}
