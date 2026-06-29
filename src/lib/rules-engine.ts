import { Character, Room, Incident, ReputationState, TimelineState, LoreEntry, SpoilerLevel } from '../types';

// Spoiler level ranking for safety calculations
export const SPOILER_RANKS: Record<SpoilerLevel, number> = {
  none: 0,
  season_1: 1,
  season_2: 2,
  future: 3
};

export class RulesEngine {
  /**
   * Redeemed characters cannot be active residents in the hotel unless a custom override is enabled.
   */
  public static validateRedeemedStatus(character: Character, customOverride: boolean = false): { isValid: boolean; message?: string } {
    if (character.status === 'redeemed' && character.role === 'resident' && !customOverride) {
      return {
        isValid: false,
        message: `Redeemed soul '${character.name}' cannot be assigned as an active resident. They belong to Heaven's registry.`
      };
    }
    return { isValid: true };
  }

  /**
   * Evaluates if placing a character in a specific room poses a security hazard.
   */
  public static validateRoomAssignment(room: Room, character: Character | undefined): { isSafe: boolean; warning?: string } {
    if (!character) {
      return { isSafe: true };
    }

    const isHighRisk = character.riskLevel === 'high' || character.riskLevel === 'catastrophic';
    const isUnsecuredRoom = room.type !== 'secured_room';
    const isRoomDamaged = room.status === 'damaged' || room.status === 'under_repair';

    if (isHighRisk) {
      if (isRoomDamaged) {
        return {
          isSafe: false,
          warning: `CRITICAL RISK: Assigning high-threat resident '${character.name}' to a damaged/under-repair room (${room.number}) may lead to escape, sabotage, or accidents.`
        };
      }
      if (isUnsecuredRoom) {
        return {
          isSafe: false,
          warning: `SAFETY WARNING: Sinner '${character.name}' is categorized as '${character.riskLevel}' risk. Room ${room.number} is a '${room.type}' which lacks reinforced wards.`
        };
      }
    }

    return { isSafe: true };
  }

  /**
   * Applies the reputational damage and media chaos consequences of an incident.
   */
  public static calculateIncidentImpact(incident: Incident, current: ReputationState): ReputationState {
    const updated = { ...current };

    switch (incident.severity) {
      case 'low':
        updated.sinnerReputation = Math.max(0, updated.sinnerReputation - 2);
        updated.internalTrust = Math.max(0, updated.internalTrust - 1);
        break;
      case 'medium':
        updated.sinnerReputation = Math.max(0, updated.sinnerReputation - 5);
        updated.internalTrust = Math.max(0, updated.internalTrust - 5);
        updated.mediaChaos = Math.min(100, updated.mediaChaos + 5);
        break;
      case 'high':
        updated.sinnerReputation = Math.max(0, updated.sinnerReputation - 10);
        updated.internalTrust = Math.max(0, updated.internalTrust - 10);
        updated.mediaChaos = Math.min(100, updated.mediaChaos + 15);
        updated.veesInfluence = Math.min(100, updated.veesInfluence + 5);
        break;
      case 'crisis':
        updated.sinnerReputation = Math.max(0, updated.sinnerReputation - 25);
        updated.internalTrust = Math.max(0, updated.internalTrust - 20);
        updated.mediaChaos = Math.min(100, updated.mediaChaos + 30);
        updated.heavenAttention = Math.min(100, updated.heavenAttention + 15);
        updated.veesInfluence = Math.min(100, updated.veesInfluence + 15);
        updated.overlordHostility = Math.min(100, updated.overlordHostility + 10);
        break;
    }

    return updated;
  }

  /**
   * Modifies hotel metrics based on a public relations or marketing event.
   */
  public static calculateReputationEvent(eventType: string, current: ReputationState): ReputationState {
    const updated = { ...current };

    switch (eventType) {
      case 'interview':
        // Charlie does a broadcast
        updated.sinnerReputation = Math.min(100, updated.sinnerReputation + 8);
        updated.mediaChaos = Math.max(0, updated.mediaChaos - 5);
        updated.veesInfluence = Math.min(100, updated.veesInfluence + 4); // Vees monitor and react
        break;
      case 'vox_propaganda':
        // Voxtek attempts to smear the hotel
        updated.sinnerReputation = Math.max(0, updated.sinnerReputation - 12);
        updated.redemptionCredibility = Math.max(0, updated.redemptionCredibility - 5);
        updated.mediaChaos = Math.min(100, updated.mediaChaos + 20);
        updated.veesInfluence = Math.min(100, updated.veesInfluence + 10);
        break;
      case 'resident_success':
        // A resident hits a major rehabilitation milestone
        updated.redemptionCredibility = Math.min(100, updated.redemptionCredibility + 10);
        updated.internalTrust = Math.min(100, updated.internalTrust + 10);
        updated.sinnerReputation = Math.min(100, updated.sinnerReputation + 5);
        break;
      case 'proof_of_redemption':
        // Sir Pentious ascends (or a sinner officially redeems)
        updated.redemptionCredibility = Math.min(100, updated.redemptionCredibility + 30);
        updated.sinnerReputation = Math.min(100, updated.sinnerReputation + 15);
        updated.heavenAttention = Math.min(100, updated.heavenAttention + 25);
        updated.veesInfluence = Math.min(100, updated.veesInfluence + 15);
        updated.internalTrust = Math.min(100, updated.internalTrust + 15);
        break;
      case 'public_brawl':
        // Group fight in public
        updated.sinnerReputation = Math.max(0, updated.sinnerReputation - 8);
        updated.mediaChaos = Math.min(100, updated.mediaChaos + 12);
        break;
    }

    return updated;
  }

  /**
   * A lore entry cannot be categorized as 'canon' or 'semi_canon' without a valid source reference document.
   */
  public static validateLoreSource(canonStatus: string, sourceRef: string): boolean {
    if ((canonStatus === 'canon' || canonStatus === 'semi_canon') && (!sourceRef || sourceRef.trim() === '')) {
      return false;
    }
    return true;
  }

  /**
   * Filters lore entries and characters to hide information that exceeds the user's active spoiler boundaries.
   */
  public static isContentVisible(
    content: { spoilerLevel: SpoilerLevel },
    timeline: TimelineState
  ): boolean {
    if (!timeline.hideSpoilers) {
      return true;
    }

    const contentRank = SPOILER_RANKS[content.spoilerLevel] ?? 0;
    const timelineRank = SPOILER_RANKS[timeline.spoilerLevel] ?? 0;

    return contentRank <= timelineRank;
  }
}
