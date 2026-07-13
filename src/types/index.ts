// Species/origin and social rank are deliberately separate. "Overlord" is a
// political rank held by some sinners, not a species.
export type CharacterType = 'sinner' | 'hellborn' | 'angel' | 'fallen_angel' | 'redeemed_soul' | 'unknown' | 'overlord';
export type CharacterRank = 'none' | 'royalty' | 'overlord' | 'former_overlord' | 'seraph' | 'exorcist' | 'former_exorcist' | 'exorcist_commander' | 'unknown';
export type CharacterRole = 'founder' | 'manager' | 'resident' | 'bartender' | 'housekeeper' | 'sponsor' | 'security' | 'antagonist' | 'ally' | 'external';
export type CharacterStatus = 'staff' | 'resident' | 'applicant' | 'banned' | 'redeemed' | 'external' | 'deceased' | 'unknown';
export type RiskLevel = 'low' | 'medium' | 'high' | 'catastrophic';
export type CanonStatus = 'canon' | 'semi_canon' | 'simulation_au' | 'user_note' | 'headcanon' | 'unknown';
export type SourceType = 'episode' | 'official_pilot' | 'official_page' | 'creator_statement' | 'user_manual_note' | 'other';
export type SpoilerLevel = 'none' | 'season_1' | 'season_2' | 'future';
export type TimelineScope = 'pilot_legacy' | 'season_1_start' | 'season_1_end' | 'season_2' | 'custom';

export type CharacterTimelineSnapshot = Partial<Pick<Character,
  'type' | 'role' | 'status' | 'riskLevel' | 'rehabProgress' | 'rehabTracked'
>>;

export interface Character {
  id: string;
  name: string;
  alias: string;
  type: CharacterType;
  rank?: CharacterRank;
  role: CharacterRole;
  status: CharacterStatus;
  riskLevel: RiskLevel;
  charlieTrust: number; // 0 to 100
  rehabProgress: number; // 0 to 100
  // False means the numeric field is not applicable, rather than a canon 0%.
  rehabTracked?: boolean;
  // Hotel roles, risk ratings and scores are gameplay data, not episode facts.
  operationalDataStatus?: 'simulation_au' | 'user_note';
  // Read-only projections used by timeline-aware views. They never mutate saves.
  timelineStates?: Partial<Record<Exclude<TimelineScope, 'custom'>, CharacterTimelineSnapshot>>;
  contracts: string[]; // brief descriptions of active contracts (e.g. soul bound)
  notes: string;
  canonStatus: CanonStatus;
  timelineScope: TimelineScope;
  sourceRef: string;
  spoilerLevel: SpoilerLevel;
  description: string;
}

export type RoomType = 'standard' | 'suite' | 'staff_room' | 'secured_room' | 'damaged_room' | 'restricted';
export type RoomStatus = 'clean' | 'messy' | 'damaged' | 'cursed' | 'under_repair' | 'locked';

export interface Room {
  number: string;
  floor: number;
  type: RoomType;
  occupantId: string | null; // references Character.id
  occupantIds?: string[]; // shared rooms; occupantId remains the primary legacy reference
  capacity: number;
  status: RoomStatus;
  dangerLevel: RiskLevel;
  restrictions: string[]; // e.g. ["no_powers", "enhanced_surveillance", "staff_only"]
  maintenanceNotes: string;
  repairCost: number;
  lastInspectionDate: string;
  lastInspectedBy: string | null; // references Character.id
}

export interface RehabilitationPlan {
  id: string;
  characterId: string; // references Character.id
  goals: string[];
  obstacles: string[];
  triggers: string[];
  empathyScore: number; // 0 to 100
  accountabilityScore: number; // 0 to 100
  impulseControlScore: number; // 0 to 100
  cooperationScore: number; // 0 to 100
  charlieNotes: string;
  vaggieNotes: string;
  staffPrivateNotes: string;
  isRedeemedConfirmed: boolean;
}

export type SessionType = 'accountability_session' | 'empathy_workshop' | 'conflict_resolution' | 'trust_building' | 'public_apology' | 'group_activity' | 'hotel_service' | 'therapy_like_checkin' | 'custom';

export interface RehabilitationSession {
  id: string;
  planId: string; // references RehabilitationPlan.id
  date: string;
  type: SessionType;
  summary: string;
  empathyDelta: number;
  accountabilityDelta: number;
  impulseControlDelta: number;
  cooperationDelta: number;
  conductedBy: string; // references Character.id
  approachId?: string; // immutable dialogue/gameplay approach used to derive the deltas
  campaignDay?: number;
}

export type IncidentType = 'violence' | 'property_damage' | 'media_scandal' | 'deal_contract' | 'heaven_threat' | 'overlord_interference' | 'staff_conflict' | 'relapse' | 'sabotage' | 'unknown';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'crisis';
export type IncidentStatus = 'open' | 'contained' | 'resolved' | 'archived';

export interface Incident {
  id: string;
  date: string;
  location: string;
  residentsInvolved: string[]; // references Character.ids
  type: IncidentType;
  severity: IncidentSeverity;
  summary: string;
  consequences: string;
  repairCost: number;
  reputationImpact: number; // impact on sinner reputation
  trustImpact: number; // impact on internal trust
  actionTaken: string;
  status: IncidentStatus;
  loreLink: string | null; // references LoreEntry.id if canon
  tags: string[];
  resolvedDay?: number;
}

export type TaskType = 'new_sinner_intake' | 'room_inspection' | 'conflict_resolution' | 'repair_work' | 'rehab_prep' | 'media_response' | 'heaven_watch' | 'vees_watch' | 'staff_briefing' | 'custom';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface StaffTask {
  id: string;
  date: string;
  title: string;
  type: TaskType;
  assignedTo: string; // references Character.id
  mentalWorkload: number; // 1 to 10
  status: TaskStatus;
  notes: string;
  targetId?: string | null;
  createdDay?: number;
  availableOnDay?: number;
}

export interface ReputationState {
  sinnerReputation: number; // 0 to 100
  redemptionCredibility: number; // 0 to 100
  internalTrust: number; // 0 to 100
  heavenAttention: number; // 0 to 100
  overlordHostility: number; // 0 to 100
  veesInfluence: number; // 0 to 100
  mediaChaos: number; // 0 to 100
}

export interface TimelineState {
  current: TimelineScope;
  hideSpoilers: boolean;
  spoilerLevel: SpoilerLevel;
  hotelState: 'original' | 'damaged' | 'rebuilt';
}

export type LoreCategory = 'character' | 'faction' | 'location' | 'event' | 'world_rule' | 'relation' | 'contract' | 'media_piece' | 'item' | 'threat';

export interface LoreEntry {
  id: string;
  title: string;
  entityName: string;
  category: LoreCategory;
  description: string;
  canonStatus: CanonStatus;
  sourceType: SourceType;
  sourceRef: string;
  spoilerLevel: SpoilerLevel;
  timelineScope: TimelineScope;
  isLocked: boolean;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  influence: number; // 0 to 100
}

export type RelationshipType = 'ally' | 'enemy' | 'contract_bound' | 'family' | 'romantic' | 'staff' | 'resident' | 'manipulative' | 'unknown';

export interface Relationship {
  id: string;
  charAId: string; // references Character.id
  charBId: string; // references Character.id
  type: RelationshipType;
  notes: string;
}

export type ResourceCategory = 'repair' | 'food_beverage' | 'bar_stock' | 'cleaning_supplies' | 'security' | 'donation' | 'reconstruction' | 'incident' | 'custom';

export interface ResourceLedger {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: ResourceCategory;
  amount: number;
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface AppSettings {
  appName: string;
  randomEventsEnabled: boolean;
  theme: string;
}

/**
 * Durable rule state. Audit logs are display history and must never be used as
 * cooldowns or exactly-once markers because the user is allowed to purge them.
 */
export interface GameplayMeta {
  campaignDay: number;
  cooldowns: Record<string, number>;
  completedMilestones: string[];
  appliedTaskIds: string[];
  resolvedIncidentIds: string[];
  rewardedRedemptionIds: string[];
  broadcastRedemptionIds: string[];
  narrativeFlags: string[];
  dailySessionCounts: Record<string, number>;
  dailyDonationAmounts: Record<string, number>;
  staffFatigue: Record<string, number>;
}

// Campaign outcomes are simulation-only management states. They are never
// presented as events from the series canon.
export type CampaignResult = 'victory' | 'defeat';
export type CampaignPhase = 'active' | 'victory' | 'defeat' | 'ended';
export type CampaignEndingId =
  | 'redemption_program_proven'
  | 'celestial_shutdown'
  | 'staff_walkout'
  | 'public_collapse'
  | 'insolvent_hotel';

export interface CampaignOutcome {
  phase: CampaignPhase;
  result: CampaignResult | null;
  endingId: CampaignEndingId | null;
  title: string;
  summary: string;
  requirements: string[];
}

export interface DatabaseState {
  characters: Character[];
  rooms: Room[];
  rehabilitationPlans: RehabilitationPlan[];
  rehabilitationSessions: RehabilitationSession[];
  incidents: Incident[];
  staffTasks: StaffTask[];
  reputation: ReputationState;
  timeline: TimelineState;
  loreCodex: LoreEntry[];
  factions: Faction[];
  relationships: Relationship[];
  resourceLedger: ResourceLedger[];
  auditLogs: AuditLog[];
  settings: AppSettings;
  /** Optional only for legacy in-memory seeds; LocalDb always normalizes it. */
  gameplayMeta?: GameplayMeta;
}
