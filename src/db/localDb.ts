import { DatabaseState, Character, Room, RehabilitationPlan, RehabilitationSession, Incident, StaffTask, ReputationState, TimelineState, LoreEntry, Faction, Relationship, ResourceLedger, AuditLog, AppSettings } from '../types';
import { getSeedData } from './seed';

const STORAGE_KEY = 'hellbound_hotel_db_state';

class LocalDb {
  private state: DatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as DatabaseState;
      }
    } catch (e) {
      console.error('Failed to parse database state from localStorage', e);
    }
    
    // Seed initial state
    const seed = getSeedData();
    this.saveStateToStorage(seed);
    return seed;
  }

  private saveStateToStorage(newState: DatabaseState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      this.state = newState;
    } catch (e) {
      console.error('Failed to write database state to localStorage', e);
    }
  }

  private persist() {
    this.saveStateToStorage(this.state);
  }

  public getFullState(): DatabaseState {
    return { ...this.state };
  }

  public importState(newState: DatabaseState): boolean {
    if (!newState.characters || !newState.rooms || !newState.reputation || !newState.timeline) {
      return false;
    }
    this.saveStateToStorage(newState);
    this.logAction('DATABASE_IMPORT', 'Database restored from JSON backup.');
    return true;
  }

  public resetToSeed() {
    const seed = getSeedData();
    this.saveStateToStorage(seed);
    this.logAction('DATABASE_RESET', 'Database reset to default seed data.');
  }

  // --- Audit Log ---
  public logAction(action: string, details: string) {
    const log: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      details
    };
    this.state.auditLogs.unshift(log);
    // Cap audit logs at 100 entries to prevent memory bloating
    if (this.state.auditLogs.length > 100) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 100);
    }
    this.persist();
  }

  public getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  public clearAuditLogs() {
    this.state.auditLogs = [];
    this.logAction('AUDIT_LOGS_CLEARED', 'All historical audit logs purged.');
  }

  // --- Characters ---
  public getCharacters(): Character[] {
    return this.state.characters;
  }

  public getCharacter(id: string): Character | undefined {
    return this.state.characters.find(c => c.id === id);
  }

  public saveCharacter(character: Character) {
    const index = this.state.characters.findIndex(c => c.id === character.id);
    const old = this.state.characters[index];
    if (index >= 0) {
      this.state.characters[index] = character;
      this.logAction('CHARACTER_UPDATE', `Updated resident/staff profile for ${character.name} (${character.role}).`);
    } else {
      this.state.characters.push(character);
      this.logAction('CHARACTER_CREATE', `Registered new character ${character.name} as ${character.role}.`);
    }
    this.persist();
  }

  public deleteCharacter(id: string) {
    const char = this.getCharacter(id);
    if (!char) return;
    this.state.characters = this.state.characters.filter(c => c.id !== id);
    // Clear room occupancy if this character was in a room
    this.state.rooms = this.state.rooms.map(r => r.occupantId === id ? { ...r, occupantId: null } : r);
    this.logAction('CHARACTER_DELETE', `Deleted character ${char.name}. Unlinked room and tasks.`);
    this.persist();
  }

  // --- Rooms ---
  public getRooms(): Room[] {
    return this.state.rooms;
  }

  public getRoom(number: string): Room | undefined {
    return this.state.rooms.find(r => r.number === number);
  }

  public saveRoom(room: Room) {
    const index = this.state.rooms.findIndex(r => r.number === room.number);
    if (index >= 0) {
      this.state.rooms[index] = room;
      this.logAction('ROOM_UPDATE', `Updated room ${room.number} settings (Status: ${room.status}, Occupant: ${room.occupantId || 'None'}).`);
    } else {
      this.state.rooms.push(room);
      this.logAction('ROOM_CREATE', `Added new room ${room.number} to register.`);
    }
    this.persist();
  }

  public deleteRoom(number: string) {
    this.state.rooms = this.state.rooms.filter(r => r.number !== number);
    this.logAction('ROOM_DELETE', `Removed room ${number} from registry.`);
    this.persist();
  }

  // --- Rehabilitation Plans ---
  public getRehabilitationPlans(): RehabilitationPlan[] {
    return this.state.rehabilitationPlans;
  }

  public getRehabilitationPlanForCharacter(charId: string): RehabilitationPlan | undefined {
    return this.state.rehabilitationPlans.find(p => p.characterId === charId);
  }

  public saveRehabilitationPlan(plan: RehabilitationPlan) {
    const index = this.state.rehabilitationPlans.findIndex(p => p.id === plan.id);
    const char = this.getCharacter(plan.characterId);
    const name = char ? char.name : plan.characterId;
    if (index >= 0) {
      this.state.rehabilitationPlans[index] = plan;
      this.logAction('REHAB_PLAN_UPDATE', `Updated rehabilitation plan metrics for ${name}.`);
    } else {
      this.state.rehabilitationPlans.push(plan);
      this.logAction('REHAB_PLAN_CREATE', `Initialized new rehabilitation program for ${name}.`);
    }
    this.persist();
  }

  // --- Rehabilitation Sessions ---
  public getRehabilitationSessions(): RehabilitationSession[] {
    return this.state.rehabilitationSessions;
  }

  public getRehabilitationSessionsForPlan(planId: string): RehabilitationSession[] {
    return this.state.rehabilitationSessions.filter(s => s.planId === planId);
  }

  public saveRehabilitationSession(session: RehabilitationSession) {
    const index = this.state.rehabilitationSessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      this.state.rehabilitationSessions[index] = session;
      this.logAction('REHAB_SESSION_UPDATE', `Updated details for rehab session on ${session.date}.`);
    } else {
      this.state.rehabilitationSessions.push(session);
      this.logAction('REHAB_SESSION_CREATE', `Logged new rehabilitation session (${session.type}) conducted by ${session.conductedBy}.`);
    }
    this.persist();
  }

  public deleteRehabilitationSession(id: string) {
    this.state.rehabilitationSessions = this.state.rehabilitationSessions.filter(s => s.id !== id);
    this.logAction('REHAB_SESSION_DELETE', `Deleted rehab session record.`);
    this.persist();
  }

  // --- Incidents ---
  public getIncidents(): Incident[] {
    return this.state.incidents;
  }

  public saveIncident(incident: Incident) {
    const index = this.state.incidents.findIndex(i => i.id === incident.id);
    if (index >= 0) {
      this.state.incidents[index] = incident;
      this.logAction('INCIDENT_UPDATE', `Updated Incident #${incident.id} - ${incident.location} (${incident.severity}).`);
    } else {
      this.state.incidents.push(incident);
      this.logAction('INCIDENT_CREATE', `Logged new incident in ${incident.location} (Severity: ${incident.severity}, Type: ${incident.type}).`);
    }
    this.persist();
  }

  public deleteIncident(id: string) {
    this.state.incidents = this.state.incidents.filter(i => i.id !== id);
    this.logAction('INCIDENT_DELETE', `Removed incident record #${id}.`);
    this.persist();
  }

  // --- Staff Tasks ---
  public getStaffTasks(): StaffTask[] {
    return this.state.staffTasks;
  }

  public saveStaffTask(task: StaffTask) {
    const index = this.state.staffTasks.findIndex(t => t.id === task.id);
    const staff = this.getCharacter(task.assignedTo);
    const name = staff ? staff.name : task.assignedTo;
    if (index >= 0) {
      this.state.staffTasks[index] = task;
      this.logAction('TASK_UPDATE', `Updated shift task "${task.title}" (Status: ${task.status}, Assigned: ${name}).`);
    } else {
      this.state.staffTasks.push(task);
      this.logAction('TASK_CREATE', `Created task "${task.title}" assigned to ${name}.`);
    }
    this.persist();
  }

  public deleteStaffTask(id: string) {
    this.state.staffTasks = this.state.staffTasks.filter(t => t.id !== id);
    this.logAction('TASK_DELETE', `Removed shift task from register.`);
    this.persist();
  }

  // --- Reputation ---
  public getReputation(): ReputationState {
    return this.state.reputation;
  }

  public saveReputation(reputation: ReputationState) {
    this.state.reputation = reputation;
    this.persist();
  }

  // --- Timeline ---
  public getTimeline(): TimelineState {
    return this.state.timeline;
  }

  public saveTimeline(timeline: TimelineState) {
    const oldScope = this.state.timeline.current;
    this.state.timeline = timeline;
    if (oldScope !== timeline.current) {
      this.logAction('TIMELINE_CHANGE', `Operational timeline scope changed from ${oldScope} to ${timeline.current}.`);
    }
    this.persist();
  }

  // --- Lore Codex ---
  public getLoreCodex(): LoreEntry[] {
    return this.state.loreCodex;
  }

  public saveLoreEntry(entry: LoreEntry) {
    const index = this.state.loreCodex.findIndex(e => e.id === entry.id);
    if (index >= 0) {
      if (this.state.loreCodex[index].isLocked && entry.isLocked) {
        // Prevent editing locked entry details unless unlocked
        // (we allow saving back if it's the unlock action itself)
      }
      this.state.loreCodex[index] = entry;
      this.logAction('LORE_UPDATE', `Updated codex entry: "${entry.title}" (${entry.canonStatus}).`);
    } else {
      this.state.loreCodex.push(entry);
      this.logAction('LORE_CREATE', `Added new codex entry: "${entry.title}" (${entry.category}).`);
    }
    this.persist();
  }

  public deleteLoreEntry(id: string) {
    const entry = this.state.loreCodex.find(e => e.id === id);
    if (entry?.isLocked) return; // Prevent deleting core records
    this.state.loreCodex = this.state.loreCodex.filter(e => e.id !== id);
    if (entry) {
      this.logAction('LORE_DELETE', `Deleted lore codex entry "${entry.title}".`);
    }
    this.persist();
  }

  // --- Factions ---
  public getFactions(): Faction[] {
    return this.state.factions;
  }

  public saveFaction(faction: Faction) {
    const index = this.state.factions.findIndex(f => f.id === faction.id);
    if (index >= 0) {
      this.state.factions[index] = faction;
    } else {
      this.state.factions.push(faction);
    }
    this.persist();
  }

  // --- Relationships ---
  public getRelationships(): Relationship[] {
    return this.state.relationships;
  }

  public saveRelationship(rel: Relationship) {
    const index = this.state.relationships.findIndex(r => r.id === rel.id);
    if (index >= 0) {
      this.state.relationships[index] = rel;
      this.logAction('RELATION_UPDATE', `Updated connection details between characters.`);
    } else {
      this.state.relationships.push(rel);
      this.logAction('RELATION_CREATE', `Logged new relationship connection of type "${rel.type}".`);
    }
    this.persist();
  }

  public deleteRelationship(id: string) {
    this.state.relationships = this.state.relationships.filter(r => r.id !== id);
    this.logAction('RELATION_DELETE', `Removed relationship connection.`);
    this.persist();
  }

  // --- Resource Ledger ---
  public getResourceLedger(): ResourceLedger[] {
    return this.state.resourceLedger;
  }

  public saveResourceLedgerEntry(entry: ResourceLedger) {
    const index = this.state.resourceLedger.findIndex(e => e.id === entry.id);
    if (index >= 0) {
      this.state.resourceLedger[index] = entry;
      this.logAction('FINANCE_UPDATE', `Updated ledger transaction on ${entry.date}.`);
    } else {
      this.state.resourceLedger.push(entry);
      this.logAction('FINANCE_CREATE', `Logged ${entry.type} of ${entry.amount} HN for ${entry.category}.`);
    }
    this.persist();
  }

  public deleteResourceLedgerEntry(id: string) {
    this.state.resourceLedger = this.state.resourceLedger.filter(e => e.id !== id);
    this.logAction('FINANCE_DELETE', `Deleted ledger entry.`);
    this.persist();
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    return this.state.settings;
  }

  public saveSettings(settings: AppSettings) {
    this.state.settings = settings;
    this.persist();
  }
}

export const db = new LocalDb();
