import {
  Character,
  Room,
  Incident,
  ReputationState,
  TimelineState,
  SpoilerLevel,
  RehabilitationPlan,
  RehabilitationSession,
  SessionType,
  DatabaseState,
  CampaignEndingId,
  CampaignOutcome,
  CampaignResult,
  Faction,
  RelationshipType
} from '../types';

export interface RedemptionEligibility {
  isEligible: boolean;
  averageScore: number;
  reasons: string[];
}

export interface CounselingApproach {
  id: string;
  conductorId: string;
  type: SessionType;
  label: string;
  counselorSpeech: string;
  residentSpeech: string;
  deltas: {
    empathy: number;
    accountability: number;
    impulse: number;
    cooperation: number;
  };
  logText: string;
}

export interface OperationalConsequence {
  reputation: ReputationState;
  factions: Faction[];
  summary: string;
}

export interface FactionOperation {
  title: string;
  summary: string;
  reputationDelta: Partial<Record<keyof ReputationState, number>>;
  factionDelta: Record<string, number>;
}

const CAMPAIGN_ENDINGS: Record<CampaignEndingId, { result: CampaignResult; title: string; summary: string }> = {
  redemption_program_proven: {
    result: 'victory',
    title: 'Victory Ready: Redemption Program Proven',
    summary: 'The simulation has sustained three confirmed redemptions while preserving trust and public credibility.'
  },
  celestial_shutdown: {
    result: 'defeat',
    title: 'Defeat: Celestial Shutdown',
    summary: 'Maximum Heaven attention and an unresolved celestial crisis have made hotel operations untenable.'
  },
  staff_walkout: {
    result: 'defeat',
    title: 'Defeat: Staff Walkout',
    summary: 'Internal trust reached zero, leaving the hotel without a functioning operations team.'
  },
  public_collapse: {
    result: 'defeat',
    title: 'Defeat: Public Credibility Collapse',
    summary: 'The hotel lost all sinner support while its redemption claim and media response collapsed.'
  },
  insolvent_hotel: {
    result: 'defeat',
    title: 'Defeat: Insolvent Hotel',
    summary: 'Sustained operating losses passed the campaign insolvency threshold after the opening phase.'
  }
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

function applyOperationalDeltas(
  current: ReputationState,
  factions: Faction[],
  reputationDelta: Partial<Record<keyof ReputationState, number>>,
  factionDelta: Record<string, number>
): { reputation: ReputationState; factions: Faction[] } {
  const reputation = { ...current };
  (Object.keys(reputationDelta) as Array<keyof ReputationState>).forEach((metric) => {
    reputation[metric] = clampPercent(reputation[metric] + (reputationDelta[metric] || 0));
  });
  return {
    reputation,
    factions: factions.map((faction) => ({
      ...faction,
      influence: clampPercent(faction.influence + (factionDelta[faction.id] || 0))
    }))
  };
}

// Spoiler level ranking for safety calculations
export const SPOILER_RANKS: Record<SpoilerLevel, number> = {
  none: 0,
  season_1: 1,
  season_2: 2,
  future: 3
};

export class RulesEngine {
  /**
   * Returns non-canon Simulation AU counseling choices. Angel's options use a
   * trauma-informed safety and agency frame: abuse suffered never grants an
   * accountability increase.
   */
  public static getCounselingApproaches(
    resident: Pick<Character, 'id' | 'name'>,
    conductorId: string
  ): CounselingApproach[] {
    const isAngel = resident.id === 'angeldust';
    const isPentious = resident.id === 'sirpentious';

    if (conductorId === 'husk') {
      return [
        {
          id: 'grounded_listening',
          conductorId: 'husk',
          type: 'therapy_like_checkin',
          label: 'Simulation AU · Grounded listening and a safer next step',
          counselorSpeech: isAngel
            ? "What Valentino does to you isn't your fault. You choose what you want to share. Want company while we plan one safer step for tonight?"
            : "No performance needed here. Tell me what is making tonight harder, and we'll pick one next step you can actually control.",
          residentSpeech: isAngel
            ? "Thanks for not turning it into a lecture. Stay with me while I call the hotel, then help me lock down a quiet room."
            : isPentious
              ? 'No performance? Very well. I shall admit the death-ray schedule is overwhelming and request a less explosive evening plan.'
              : `All right. One honest conversation and one manageable step sounds possible for ${resident.name}.`,
          deltas: { empathy: 6, accountability: 0, impulse: 10, cooperation: 8 },
          logText: 'Simulation AU: Husk used grounded listening, affirmed resident agency, and documented one resident-chosen safety step.'
        },
        {
          id: 'coping_rehearsal',
          conductorId: 'husk',
          type: 'trust_building',
          label: 'Simulation AU · Rehearse a coping and support plan',
          counselorSpeech: 'Let us rehearse what you will do when the pressure spikes: where you go, who you call, and which exit stays open.',
          residentSpeech: isAngel
            ? "No blame, just an exit plan? Fine. I'll text you and Charlie before I disappear, and I pick the safe word."
            : isPentious
              ? 'A tactical retreat protocol! At last, therapy with diagrams. I shall identify three allies and zero secret death tunnels.'
              : 'A clear support plan feels less intimidating than improvising during a crisis.',
          deltas: { empathy: 2, accountability: isAngel ? 0 : 2, impulse: 12, cooperation: 9 },
          logText: 'Simulation AU: resident rehearsed a voluntary coping plan, support contact, and exit route.'
        }
      ];
    }

    if (conductorId !== 'charlie') {
      return [
        {
          id: 'staff_structured_checkin',
          conductorId,
          type: 'trust_building',
          label: 'Simulation AU · Structured staff check-in',
          counselorSpeech: 'We can keep this short and predictable: one concern, one support request, and one next step you choose.',
          residentSpeech: `That structure works for ${resident.name}. I can name one concern without turning this into a full performance.`,
          deltas: { empathy: 4, accountability: 0, impulse: 5, cooperation: 8 },
          logText: 'Simulation AU: staff completed a brief, resident-paced check-in with a voluntary next step.'
        },
        {
          id: 'staff_skill_contribution',
          conductorId,
          type: 'hotel_service',
          label: 'Simulation AU · Supervised skill contribution',
          counselorSpeech: 'Choose a skill, a time limit, and a stop condition. The task should support the hotel without taking away your agency.',
          residentSpeech: 'I can agree to one bounded task if the expectations and stopping point stay clear.',
          deltas: { empathy: 2, accountability: 3, impulse: 3, cooperation: 10 },
          logText: 'Simulation AU: resident chose a supervised, time-limited contribution with a clear stop condition.'
        }
      ];
    }

    const safetyChoice: CounselingApproach = {
      id: 'safety_and_choice',
      conductorId: 'charlie',
      type: 'therapy_like_checkin',
      label: 'Simulation AU · Safety, consent, and choice',
      counselorSpeech: isAngel
        ? "What happened to you isn't your fault. You decide what feels safe to discuss. What support or boundary would help you today?"
        : 'You control how much you share. Before we discuss change, what would help this room and this conversation feel safer?',
      residentSpeech: isAngel
        ? "Okay... start by believing me, don't call Val, and let me choose who stays in the room. Then we can make a plan."
        : isPentious
          ? 'I choose two exits, no surprise shouting, and permission to pause. Under those conditions, I can attempt honesty.'
          : 'Having a choice helps. I can name one boundary and one kind of support I am willing to accept.',
      deltas: { empathy: 9, accountability: 0, impulse: 5, cooperation: 9 },
      logText: 'Simulation AU: Charlie affirmed consent and agency, then documented a resident-chosen boundary and support request.'
    };

    if (isAngel) {
      return [
        safetyChoice,
        {
          id: 'boundary_agency',
          conductorId: 'charlie',
          type: 'trust_building',
          label: 'Simulation AU · Boundary and agency rehearsal',
          counselorSpeech: "You are not responsible for someone else's abuse. We can practice a boundary without judging you if using it is unsafe. Which words and backup would you choose?",
          residentSpeech: "I choose the words, you back me up, and nobody calls it failure if survival means I can't say them yet. Deal?",
          deltas: { empathy: 7, accountability: 0, impulse: 7, cooperation: 11 },
          logText: 'Simulation AU: Angel practiced a voluntary boundary with a backup plan; no accountability score was awarded for abuse suffered.'
        },
        {
          id: 'support_network',
          conductorId: 'charlie',
          type: 'group_activity',
          label: 'Simulation AU · Build a resident-chosen support network',
          counselorSpeech: 'You decide who earns a place on your support list. We can map safe contacts, warning signs, and how each person should respond.',
          residentSpeech: "Husk listens, Cherri distracts, and you keep the door open. Write that down without making me anybody's project.",
          deltas: { empathy: 6, accountability: 0, impulse: 5, cooperation: 12 },
          logText: 'Simulation AU: Angel selected a support network and defined how staff should respond without blame or coercion.'
        }
      ];
    }

    return [
      safetyChoice,
      {
        id: 'restorative_ownership',
        conductorId: 'charlie',
        type: 'accountability_session',
        label: 'Simulation AU · Restorative ownership of harm caused',
        counselorSpeech: 'Let us separate what was done to you from harm you chose to cause. Which specific action can you own, and what repair would the affected person accept?',
        residentSpeech: isPentious
          ? 'I did fire the death ray. I shall ask the lobby crew what repair they need, then build that instead of another weapon.'
          : 'I can name one action I chose, listen to the person affected, and offer repair without demanding forgiveness.',
        deltas: { empathy: 5, accountability: 12, impulse: 3, cooperation: 8 },
        logText: 'Simulation AU: resident separated victimization from chosen harm and proposed a concrete, consent-based repair.'
      },
      {
        id: 'community_contribution',
        conductorId: 'charlie',
        type: 'hotel_service',
        label: 'Simulation AU · Strength-based community contribution',
        counselorSpeech: 'What skill can you contribute without giving up your boundaries? We will agree on a small role, a time limit, and a way to stop.',
        residentSpeech: isPentious
          ? 'A supervised repair shift with absolutely no weaponizing! My engineering brilliance can manage that.'
          : 'A small, clearly bounded job sounds fair. I can help without promising more than I can sustain.',
        deltas: { empathy: 4, accountability: 4, impulse: 4, cooperation: 13 },
        logText: 'Simulation AU: resident chose a bounded hotel contribution matched to their strengths.'
      }
    ];
  }

  /** Derives explicit, deterministic campaign victory/defeat/end states. */
  public static evaluateCampaignOutcome(state: Pick<DatabaseState,
    'reputation' | 'incidents' | 'resourceLedger' | 'gameplayMeta'
  >): CampaignOutcome {
    const meta = state.gameplayMeta;
    const completedFlag = meta?.narrativeFlags.find(flag => flag.startsWith('campaign_ended:'));
    if (completedFlag) {
      const [, result, endingId] = completedFlag.split(':');
      const ending = CAMPAIGN_ENDINGS[endingId as CampaignEndingId];
      if (ending && ending.result === result) {
        return {
          phase: 'ended',
          result: ending.result,
          endingId: endingId as CampaignEndingId,
          title: `Campaign Ended · ${ending.result === 'victory' ? 'Victory' : 'Defeat'}`,
          summary: ending.summary,
          requirements: []
        };
      }
    }

    const day = meta?.campaignDay || 1;
    const hasCelestialCrisis = state.incidents.some(incident => incident.type === 'heaven_threat'
      && incident.severity === 'crisis'
      && (incident.status === 'open' || incident.status === 'contained'));
    const balance = state.resourceLedger.reduce((total, entry) => (
      total + (entry.type === 'income' ? entry.amount : -entry.amount)
    ), 0);

    let endingId: CampaignEndingId | null = null;
    if (state.reputation.heavenAttention >= 100 && hasCelestialCrisis) endingId = 'celestial_shutdown';
    else if (state.reputation.internalTrust <= 0) endingId = 'staff_walkout';
    else if (day >= 10 && balance <= -3000) endingId = 'insolvent_hotel';
    else if (state.reputation.sinnerReputation <= 0
      && state.reputation.redemptionCredibility <= 10
      && state.reputation.mediaChaos >= 90) endingId = 'public_collapse';

    if (endingId) {
      const ending = CAMPAIGN_ENDINGS[endingId];
      return {
        phase: 'defeat',
        result: 'defeat',
        endingId,
        title: ending.title,
        summary: ending.summary,
        requirements: ['Finalize this outcome to close the Simulation AU campaign.']
      };
    }

    const confirmedRedemptions = meta?.rewardedRedemptionIds.length || 0;
    const victoryRequirements = [
      `Reach Campaign Day 15 (${Math.min(day, 15)}/15).`,
      `Confirm 3 distinct redemptions (${Math.min(confirmedRedemptions, 3)}/3).`,
      `Reach 85 redemption credibility (${state.reputation.redemptionCredibility}/85).`,
      `Maintain 60 internal trust (${state.reputation.internalTrust}/60).`,
      `Maintain 55 sinner reputation (${state.reputation.sinnerReputation}/55).`
    ];
    const victoryReady = day >= 15
      && confirmedRedemptions >= 3
      && state.reputation.redemptionCredibility >= 85
      && state.reputation.internalTrust >= 60
      && state.reputation.sinnerReputation >= 55;
    if (victoryReady) {
      const ending = CAMPAIGN_ENDINGS.redemption_program_proven;
      return {
        phase: 'victory',
        result: 'victory',
        endingId: 'redemption_program_proven',
        title: ending.title,
        summary: ending.summary,
        requirements: ['Finalize this outcome to close the Simulation AU campaign.']
      };
    }

    return {
      phase: 'active',
      result: null,
      endingId: null,
      title: `Active Simulation AU Campaign · Day ${day}`,
      summary: 'Keep the hotel solvent, preserve trust, manage faction pressure, and build sustained evidence for redemption.',
      requirements: victoryRequirements
    };
  }

  /** Applies one simulation consequence for establishing or breaking a link. */
  public static applyRelationshipConsequence(
    current: ReputationState,
    factions: Faction[],
    type: RelationshipType,
    action: 'establish' | 'remove'
  ): OperationalConsequence {
    const establishEffects: Record<RelationshipType, {
      reputation: Partial<Record<keyof ReputationState, number>>;
      factions: Record<string, number>;
      summary: string;
    }> = {
      ally: { reputation: { internalTrust: 3 }, factions: { hotel: 1 }, summary: 'An allied bond strengthened hotel cohesion.' },
      family: { reputation: { internalTrust: 2 }, factions: { morningstar: 1 }, summary: 'A documented family support link improved stability.' },
      romantic: { reputation: { internalTrust: 2 }, factions: {}, summary: 'A consensual support bond improved internal trust.' },
      staff: { reputation: { internalTrust: 2 }, factions: { hotel: 1 }, summary: 'A staff link improved operational coordination.' },
      resident: { reputation: { internalTrust: 1 }, factions: { hotel: 1 }, summary: 'A resident connection strengthened the hotel network.' },
      contract_bound: { reputation: { internalTrust: -5, overlordHostility: 5 }, factions: { overlords: 2 }, summary: 'A binding contract increased Overlord leverage and reduced trust.' },
      manipulative: { reputation: { internalTrust: -4, overlordHostility: 3, mediaChaos: 2 }, factions: { vees: 1 }, summary: 'Manipulative influence increased pressure and mistrust.' },
      enemy: { reputation: { internalTrust: -2, mediaChaos: 3 }, factions: {}, summary: 'An active rivalry increased operational instability.' },
      unknown: { reputation: {}, factions: {}, summary: 'The unknown link was logged without an immediate metric effect.' }
    };
    const removeEffects: typeof establishEffects = {
      ally: { reputation: { internalTrust: -2 }, factions: { hotel: -1 }, summary: 'Breaking an alliance reduced hotel cohesion.' },
      family: { reputation: { internalTrust: -2 }, factions: {}, summary: 'Removing a family support link reduced stability.' },
      romantic: { reputation: { internalTrust: -3 }, factions: {}, summary: 'Breaking a close support link reduced internal trust.' },
      staff: { reputation: { internalTrust: -2 }, factions: { hotel: -1 }, summary: 'Breaking a staff link weakened coordination.' },
      resident: { reputation: { internalTrust: -1 }, factions: { hotel: -1 }, summary: 'Breaking a resident link weakened the support network.' },
      contract_bound: { reputation: { internalTrust: 4, overlordHostility: -4 }, factions: { overlords: -1 }, summary: 'Ending a binding contract reduced Overlord leverage and restored trust.' },
      manipulative: { reputation: { internalTrust: 3, overlordHostility: -2, mediaChaos: -1 }, factions: { vees: -1 }, summary: 'Removing manipulative influence relieved pressure.' },
      enemy: { reputation: { internalTrust: 1, mediaChaos: -2 }, factions: {}, summary: 'Ending an active rivalry reduced instability.' },
      unknown: { reputation: {}, factions: {}, summary: 'The unknown link was removed without an immediate metric effect.' }
    };
    const effect = (action === 'establish' ? establishEffects : removeEffects)[type];
    return {
      ...applyOperationalDeltas(current, factions, effect.reputation, effect.factions),
      summary: effect.summary
    };
  }

  /** Defines repeatable, cooldown-gated Simulation AU faction operations. */
  public static getFactionOperation(factionId: string): FactionOperation | null {
    const operations: Record<string, FactionOperation> = {
      hotel: {
        title: 'Host a Community Open House',
        summary: 'Hotel influence and sinner support rise, but media scrutiny also increases.',
        reputationDelta: { sinnerReputation: 4, internalTrust: 2, mediaChaos: 2 },
        factionDelta: { hotel: 4 }
      },
      heaven: {
        title: 'Submit a Transparency Dossier',
        summary: 'Documented evidence improves credibility and reduces immediate attention.',
        reputationDelta: { redemptionCredibility: 4, heavenAttention: -4 },
        factionDelta: {}
      },
      exorcists: {
        title: 'Reinforce Civilian Shelters',
        summary: 'Prepared defenses reduce Exorcist leverage and reassure hotel staff.',
        reputationDelta: { internalTrust: 3, heavenAttention: 2 },
        factionDelta: { exorcists: -3, hotel: 1 }
      },
      vees: {
        title: 'Run a Counter-Messaging Campaign',
        summary: 'The hotel reduces Vees reach and media chaos at a small trust cost.',
        reputationDelta: { mediaChaos: -6, veesInfluence: -4, internalTrust: -1 },
        factionDelta: { vees: -4, hotel: 1 }
      },
      overlords: {
        title: 'Open Neutral Mediation',
        summary: 'A cautious negotiation reduces hostility but gives Overlords a little public visibility.',
        reputationDelta: { overlordHostility: -5, sinnerReputation: 1 },
        factionDelta: { overlords: 1 }
      },
      morningstar: {
        title: 'Request Royal Logistics Support',
        summary: 'Royal backing strengthens hotel influence while drawing some celestial attention.',
        reputationDelta: { internalTrust: 3, heavenAttention: 2 },
        factionDelta: { morningstar: 1, hotel: 2 }
      }
    };
    return operations[factionId] || null;
  }

  public static applyFactionOperation(
    current: ReputationState,
    factions: Faction[],
    operation: FactionOperation
  ): OperationalConsequence {
    return {
      ...applyOperationalDeltas(current, factions, operation.reputationDelta, operation.factionDelta),
      summary: operation.summary
    };
  }

  /**
   * Keeps the four rehabilitation metrics and their public aggregate consistent.
   */
  public static calculateRehabilitationProgress(plan: Pick<RehabilitationPlan, 'empathyScore' | 'accountabilityScore' | 'impulseControlScore' | 'cooperationScore'>): number {
    return Math.round((
      plan.empathyScore
      + plan.accountabilityScore
      + plan.impulseControlScore
      + plan.cooperationScore
    ) / 4);
  }

  /**
   * Redemption is a campaign milestone, not an administrative shortcut.
   * A resident needs sustained, varied work and no critically weak metric.
   */
  public static evaluateRedemptionEligibility(
    plan: RehabilitationPlan,
    sessions: RehabilitationSession[]
  ): RedemptionEligibility {
    const scores = [
      plan.empathyScore,
      plan.accountabilityScore,
      plan.impulseControlScore,
      plan.cooperationScore
    ];
    const averageScore = RulesEngine.calculateRehabilitationProgress(plan);
    const reasons: string[] = [];

    if (plan.isRedeemedConfirmed) {
      reasons.push('Redemption is already confirmed for this rehabilitation plan.');
    }

    if (sessions.length < 4) {
      reasons.push(`Complete at least 4 documented sessions (${sessions.length}/4).`);
    }

    if (plan.goals.length < 2) {
      reasons.push(`Document at least 2 concrete rehabilitation goals (${plan.goals.length}/2).`);
    }

    const distinctDays = new Set(sessions.map(session => session.campaignDay ?? session.date)).size;
    if (distinctDays < 3) {
      reasons.push(`Demonstrate stability across at least 3 campaign days (${distinctDays}/3).`);
    }

    const distinctSessionTypes = new Set(sessions.map(session => session.type)).size;
    if (distinctSessionTypes < 2) {
      reasons.push(`Use at least 2 different session formats (${distinctSessionTypes}/2).`);
    }

    if (Math.min(...scores) < 70) {
      reasons.push('Raise every rehabilitation metric to at least 70%.');
    }

    if (averageScore < 80) {
      reasons.push(`Reach an overall rehabilitation score of 80% (${averageScore}/80).`);
    }

    return {
      isEligible: reasons.length === 0,
      averageScore,
      reasons
    };
  }

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
   * Resolving an incident restores a small portion of confidence without erasing
   * the original consequences, so creating incidents can never farm reputation.
   */
  public static calculateIncidentResolutionImpact(incident: Incident, current: ReputationState): ReputationState {
    const updated = { ...current };
    const recoveryBySeverity = {
      low: { trust: 1, chaos: 1 },
      medium: { trust: 2, chaos: 2 },
      high: { trust: 3, chaos: 4 },
      crisis: { trust: 5, chaos: 6 }
    } as const;
    const recovery = recoveryBySeverity[incident.severity];

    updated.internalTrust = Math.min(100, updated.internalTrust + recovery.trust);
    updated.mediaChaos = Math.max(0, updated.mediaChaos - recovery.chaos);
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
