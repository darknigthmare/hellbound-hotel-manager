import { describe, it, expect } from 'vitest';
import { RulesEngine } from '../lib/rules-engine';
import { LoreValidation } from '../lib/lore-validation';
import { DEFAULT_GAMEPLAY_META, ExportImport } from '../lib/export-import';
import { getSeedData } from '../db/seed';
import {
  Character,
  Incident,
  LoreEntry,
  RehabilitationPlan,
  RehabilitationSession,
  ReputationState,
  Room,
  TimelineState
} from '../types';

describe('Rules Engine Tests', () => {
  
  // 1. Redeemed resident rules
  it('should reject assigning a redeemed soul as a resident by default', () => {
    const redeemedChar: Character = {
      id: 'sirpentious',
      name: 'Sir Pentious',
      alias: 'Snake',
      type: 'sinner',
      role: 'resident',
      status: 'redeemed', // redeemed status
      riskLevel: 'low',
      charlieTrust: 100,
      rehabProgress: 100,
      contracts: [],
      notes: '',
      canonStatus: 'canon',
      timelineScope: 'season_2',
      sourceRef: 'S1E08',
      spoilerLevel: 'season_1',
      description: ''
    };

    const validation = RulesEngine.validateRedeemedStatus(redeemedChar, false);
    expect(validation.isValid).toBe(false);
    expect(validation.message).toContain('cannot be assigned as an active resident');

    // Override should allow it
    const validationOverride = RulesEngine.validateRedeemedStatus(redeemedChar, true);
    expect(validationOverride.isValid).toBe(true);
  });

  // 2. Room assignment checks based on risk levels
  it('should flag alerts when assigning high risk guest to unsecured rooms', () => {
    const highRiskGuest: Character = {
      id: 'angeldust',
      name: 'Angel Dust',
      alias: 'Angel',
      type: 'sinner',
      role: 'resident',
      status: 'resident',
      riskLevel: 'high', // High Risk
      charlieTrust: 40,
      rehabProgress: 20,
      contracts: [],
      notes: '',
      canonStatus: 'canon',
      timelineScope: 'season_1_start',
      sourceRef: 'S1E01',
      spoilerLevel: 'none',
      description: ''
    };

    const standardRoom: Room = {
      number: '101',
      floor: 1,
      type: 'standard', // Unsecured room
      occupantId: null,
      capacity: 1,
      status: 'clean',
      dangerLevel: 'low',
      restrictions: [],
      maintenanceNotes: '',
      repairCost: 0,
      lastInspectionDate: '',
      lastInspectedBy: null
    };

    const securedRoom: Room = {
      number: '202',
      floor: 2,
      type: 'secured_room', // Secured room
      occupantId: null,
      capacity: 1,
      status: 'clean',
      dangerLevel: 'low',
      restrictions: [],
      maintenanceNotes: '',
      repairCost: 0,
      lastInspectionDate: '',
      lastInspectedBy: null
    };

    const checkStandard = RulesEngine.validateRoomAssignment(standardRoom, highRiskGuest);
    expect(checkStandard.isSafe).toBe(false);
    expect(checkStandard.warning).toContain('SAFETY WARNING');

    const checkSecured = RulesEngine.validateRoomAssignment(securedRoom, highRiskGuest);
    expect(checkSecured.isSafe).toBe(true);
  });

  // 3. Canon status source references check
  it('should reject canon labels if source references are missing', () => {
    const entryWithoutSource = {
      canonStatus: 'canon' as const,
      sourceRef: ''
    };

    const entryWithSource = {
      canonStatus: 'canon' as const,
      sourceRef: 'S1E04'
    };

    const headcanonWithoutSource = {
      canonStatus: 'headcanon' as const,
      sourceRef: ''
    };

    expect(RulesEngine.validateLoreSource(entryWithoutSource.canonStatus, entryWithoutSource.sourceRef)).toBe(false);
    expect(RulesEngine.validateLoreSource(entryWithSource.canonStatus, entryWithSource.sourceRef)).toBe(true);
    expect(RulesEngine.validateLoreSource(headcanonWithoutSource.canonStatus, headcanonWithoutSource.sourceRef)).toBe(true);
  });

  // 4. Incident reputation penalties
  it('should apply correct penalties to reputation and trust based on incident severity', () => {
    const startRep: ReputationState = {
      sinnerReputation: 50,
      redemptionCredibility: 20,
      internalTrust: 60,
      heavenAttention: 30,
      overlordHostility: 20,
      veesInfluence: 40,
      mediaChaos: 10
    };

    const mediumIncident: Incident = {
      id: 'i1',
      date: '2026-06-29',
      location: 'Lobby',
      residentsInvolved: [],
      type: 'property_damage',
      severity: 'medium', // Medium severity
      summary: '',
      consequences: '',
      repairCost: 100,
      reputationImpact: 5,
      trustImpact: 5,
      actionTaken: '',
      status: 'open',
      loreLink: null,
      tags: []
    };

    const crisisIncident: Incident = {
      id: 'i2',
      date: '2026-06-29',
      location: 'Front Gates',
      residentsInvolved: [],
      type: 'violence',
      severity: 'crisis', // Crisis severity
      summary: '',
      consequences: '',
      repairCost: 500,
      reputationImpact: 25,
      trustImpact: 20,
      actionTaken: '',
      status: 'open',
      loreLink: null,
      tags: []
    };

    const repAfterMedium = RulesEngine.calculateIncidentImpact(mediumIncident, startRep);
    expect(repAfterMedium.sinnerReputation).toBe(45); // 50 - 5
    expect(repAfterMedium.internalTrust).toBe(55); // 60 - 5

    const repAfterCrisis = RulesEngine.calculateIncidentImpact(crisisIncident, startRep);
    expect(repAfterCrisis.sinnerReputation).toBe(25); // 50 - 25
    expect(repAfterCrisis.internalTrust).toBe(40); // 60 - 20
    expect(repAfterCrisis.heavenAttention).toBe(45); // 30 + 15
    expect(repAfterCrisis.veesInfluence).toBe(55); // 40 + 15
  });

  it('should require sustained and varied rehabilitation before redemption', () => {
    const plan: RehabilitationPlan = {
      id: 'plan_test',
      characterId: 'resident_test',
      goals: ['Own past harm', 'Help another resident'],
      obstacles: [],
      triggers: [],
      empathyScore: 85,
      accountabilityScore: 82,
      impulseControlScore: 80,
      cooperationScore: 86,
      charlieNotes: '',
      vaggieNotes: '',
      staffPrivateNotes: '',
      isRedeemedConfirmed: false
    };
    const makeSession = (index: number, type: RehabilitationSession['type']): RehabilitationSession => ({
      id: `session_${index}`,
      planId: plan.id,
      date: `2026-07-${String(index + 1).padStart(2, '0')}`,
      type,
      summary: 'Documented work',
      empathyDelta: 1,
      accountabilityDelta: 1,
      impulseControlDelta: 1,
      cooperationDelta: 1,
      conductedBy: 'charlie'
    });

    const insufficient = RulesEngine.evaluateRedemptionEligibility(plan, [
      makeSession(0, 'empathy_workshop'),
      makeSession(1, 'empathy_workshop'),
      makeSession(2, 'empathy_workshop')
    ]);
    expect(insufficient.isEligible).toBe(false);
    expect(insufficient.reasons).toEqual(expect.arrayContaining([
      expect.stringContaining('4 documented sessions'),
      expect.stringContaining('2 different session formats')
    ]));

    const eligible = RulesEngine.evaluateRedemptionEligibility(plan, [
      makeSession(0, 'empathy_workshop'),
      makeSession(1, 'accountability_session'),
      makeSession(2, 'empathy_workshop'),
      makeSession(3, 'accountability_session')
    ]);
    expect(eligible).toMatchObject({ isEligible: true, averageScore: 83 });

    const completed = RulesEngine.evaluateRedemptionEligibility({ ...plan, isRedeemedConfirmed: true }, [
      makeSession(0, 'empathy_workshop'),
      makeSession(1, 'accountability_session'),
      makeSession(2, 'empathy_workshop'),
      makeSession(3, 'accountability_session')
    ]);
    expect(completed.isEligible).toBe(false);
    expect(completed.reasons[0]).toContain('already confirmed');
  });

  it('should restore only part of incident damage when an incident is resolved', () => {
    const start: ReputationState = {
      sinnerReputation: 50,
      redemptionCredibility: 50,
      internalTrust: 50,
      heavenAttention: 20,
      overlordHostility: 20,
      veesInfluence: 20,
      mediaChaos: 10
    };
    const incident: Incident = {
      id: 'incident_recovery',
      date: '2026-07-13',
      location: 'Lobby',
      residentsInvolved: [],
      type: 'property_damage',
      severity: 'high',
      summary: 'Damage',
      consequences: 'Repairs required',
      repairCost: 200,
      reputationImpact: 10,
      trustImpact: 10,
      actionTaken: '',
      status: 'open',
      loreLink: null,
      tags: []
    };

    const damaged = RulesEngine.calculateIncidentImpact(incident, start);
    const resolved = RulesEngine.calculateIncidentResolutionImpact(incident, damaged);
    expect(resolved.internalTrust).toBe(43);
    expect(resolved.mediaChaos).toBe(21);
    expect(resolved.sinnerReputation).toBe(40);
  });

  it('should keep Angel trauma-informed dialogue free of accountability rewards for abuse suffered', () => {
    const angel = { id: 'angeldust', name: 'Angel Dust' };
    const charlieApproaches = RulesEngine.getCounselingApproaches(angel, 'charlie');
    const huskApproaches = RulesEngine.getCounselingApproaches(angel, 'husk');

    expect(charlieApproaches.length).toBeGreaterThanOrEqual(3);
    expect(huskApproaches.length).toBeGreaterThanOrEqual(2);
    expect([...charlieApproaches, ...huskApproaches].every(approach => approach.deltas.accountability === 0)).toBe(true);
    expect(charlieApproaches.map(approach => approach.counselorSpeech).join(' ')).toContain("isn't your fault");
    expect(charlieApproaches.map(approach => approach.logText).join(' ')).toContain('no accountability score');
  });

  it('should offer generic Simulation AU approaches including consent, repair, and contribution', () => {
    const approaches = RulesEngine.getCounselingApproaches({ id: 'walkin_test', name: 'New Applicant' }, 'charlie');
    expect(approaches.map(approach => approach.id)).toEqual([
      'safety_and_choice',
      'restorative_ownership',
      'community_contribution'
    ]);
    expect(approaches.find(approach => approach.id === 'safety_and_choice')?.deltas.accountability).toBe(0);
    expect(approaches.find(approach => approach.id === 'restorative_ownership')?.deltas.accountability).toBeGreaterThan(0);
    expect(approaches.every(approach => approach.label.includes('Simulation AU'))).toBe(true);
  });

  it('should derive explicit victory, defeat, and finalized campaign states deterministically', () => {
    const active = getSeedData();
    active.gameplayMeta = JSON.parse(JSON.stringify(DEFAULT_GAMEPLAY_META));
    expect(RulesEngine.evaluateCampaignOutcome(active).phase).toBe('active');

    const victory = getSeedData();
    victory.gameplayMeta = JSON.parse(JSON.stringify(DEFAULT_GAMEPLAY_META));
    victory.gameplayMeta!.campaignDay = 15;
    victory.gameplayMeta!.rewardedRedemptionIds = ['redeemed_a', 'redeemed_b', 'redeemed_c'];
    victory.reputation.redemptionCredibility = 90;
    victory.reputation.internalTrust = 70;
    victory.reputation.sinnerReputation = 65;
    expect(RulesEngine.evaluateCampaignOutcome(victory)).toMatchObject({
      phase: 'victory',
      result: 'victory',
      endingId: 'redemption_program_proven'
    });

    const defeat = getSeedData();
    defeat.gameplayMeta = JSON.parse(JSON.stringify(DEFAULT_GAMEPLAY_META));
    defeat.reputation.internalTrust = 0;
    expect(RulesEngine.evaluateCampaignOutcome(defeat)).toMatchObject({
      phase: 'defeat',
      result: 'defeat',
      endingId: 'staff_walkout'
    });
    defeat.gameplayMeta!.narrativeFlags.push('campaign_ended:defeat:staff_walkout');
    expect(RulesEngine.evaluateCampaignOutcome(defeat)).toMatchObject({
      phase: 'ended',
      result: 'defeat',
      endingId: 'staff_walkout'
    });
  });

  it('should turn relationships and faction operations into bounded simulation consequences', () => {
    const seed = getSeedData();
    const contract = RulesEngine.applyRelationshipConsequence(seed.reputation, seed.factions, 'contract_bound', 'establish');
    expect(contract.reputation.internalTrust).toBe(seed.reputation.internalTrust - 5);
    expect(contract.reputation.overlordHostility).toBe(seed.reputation.overlordHostility + 5);
    expect(contract.factions.find(faction => faction.id === 'overlords')?.influence)
      .toBe((seed.factions.find(faction => faction.id === 'overlords')?.influence || 0) + 2);

    const removal = RulesEngine.applyRelationshipConsequence(contract.reputation, contract.factions, 'contract_bound', 'remove');
    expect(removal.reputation.internalTrust).toBe(contract.reputation.internalTrust + 4);
    expect(removal.reputation.overlordHostility).toBe(contract.reputation.overlordHostility - 4);

    const veesOperation = RulesEngine.getFactionOperation('vees');
    expect(veesOperation).not.toBeNull();
    const countered = RulesEngine.applyFactionOperation(
      { ...seed.reputation, mediaChaos: 3, veesInfluence: 2 },
      seed.factions.map(faction => faction.id === 'vees' ? { ...faction, influence: 2 } : faction),
      veesOperation!
    );
    expect(countered.reputation.mediaChaos).toBe(0);
    expect(countered.reputation.veesInfluence).toBe(0);
    expect(countered.factions.find(faction => faction.id === 'vees')?.influence).toBe(0);
  });

  // 5. Spoiler check calculations
  it('should filter visibility based on active spoiler configurations', () => {
    const entryS2: LoreEntry = {
      id: 'e1',
      title: 'S2 Event details',
      entityName: 'Vox',
      category: 'event',
      description: '',
      canonStatus: 'canon',
      sourceType: 'episode',
      sourceRef: 'S2E01',
      spoilerLevel: 'season_2', // Season 2 spoiler
      timelineScope: 'season_2',
      isLocked: false
    };

    const entryS1: LoreEntry = {
      id: 'e2',
      title: 'S1 Event details',
      entityName: 'Alastor',
      category: 'event',
      description: '',
      canonStatus: 'canon',
      sourceType: 'episode',
      sourceRef: 'S1E04',
      spoilerLevel: 'season_1', // Season 1 spoiler
      timelineScope: 'season_1_start',
      isLocked: false
    };

    const timelineHideS2: TimelineState = {
      current: 'season_1_start',
      hideSpoilers: true,
      spoilerLevel: 'season_1', // Only show up to Season 1
      hotelState: 'original'
    };

    const timelineShowAll: TimelineState = {
      current: 'season_1_start',
      hideSpoilers: false, // Show all
      spoilerLevel: 'none',
      hotelState: 'original'
    };

    // With hideSpoilers=true and level=season_1, S2 should be hidden, S1 shown
    expect(RulesEngine.isContentVisible(entryS2, timelineHideS2)).toBe(false);
    expect(RulesEngine.isContentVisible(entryS1, timelineHideS2)).toBe(true);

    // With hideSpoilers=false, both should be shown
    expect(RulesEngine.isContentVisible(entryS2, timelineShowAll)).toBe(true);
    expect(RulesEngine.isContentVisible(entryS1, timelineShowAll)).toBe(true);
  });

  // 6. JSON Backups validations
  it('should validate standard JSON database imports and reject invalid backups', () => {
    const validJsonBackup = JSON.stringify({
      characters: [],
      rooms: [],
      rehabilitationPlans: [],
      rehabilitationSessions: [],
      incidents: [],
      staffTasks: [],
      reputation: {},
      timeline: {},
      loreCodex: [],
      factions: [],
      relationships: [],
      resourceLedger: [],
      auditLogs: [],
      settings: {}
    });

    const invalidJsonBackup = JSON.stringify({
      characters: [],
      rooms: []
      // missing other fields
    });

    const checkValid = ExportImport.validateBackup(validJsonBackup);
    expect(checkValid.isValid).toBe(true);
    expect(checkValid.parsedState).toBeDefined();

    const checkInvalid = ExportImport.validateBackup(invalidJsonBackup);
    expect(checkInvalid.isValid).toBe(false);
    expect(checkInvalid.error).toContain('missing list field');

    const checkCorrupted = ExportImport.validateBackup('{"broken_json": ');
    expect(checkCorrupted.isValid).toBe(false);
    expect(checkCorrupted.error).toContain('Failed to parse file');
  });

  // 7. Lore Codex Validation diagnostics gaps scanner
  it('should log gap warnings for lore entries without descriptions or citations', () => {
    const incompleteEntries: LoreEntry[] = [
      {
        id: 'l1',
        title: 'Empty entry description',
        entityName: 'Husk',
        category: 'character',
        description: '', // Empty description
        canonStatus: 'user_note',
        sourceType: 'user_manual_note',
        sourceRef: '',
        spoilerLevel: 'none',
        timelineScope: 'season_1_start',
        isLocked: false
      },
      {
        id: 'l2',
        title: 'Canon entry without citation',
        entityName: 'Lucifer',
        category: 'character',
        description: 'Charlie\'s father.',
        canonStatus: 'canon', // Canon status
        sourceType: 'episode',
        sourceRef: '', // Missing sourceRef
        spoilerLevel: 'season_1',
        timelineScope: 'season_1_start',
        isLocked: false
      }
    ];

    const gaps = LoreValidation.validateLoreEntries(incompleteEntries);
    expect(gaps.length).toBe(2);

    const emptyDescGap = gaps.find(g => g.issue === 'empty_description');
    expect(emptyDescGap).toBeDefined();
    expect(emptyDescGap?.severity).toBe('warning');

    const missingSourceGap = gaps.find(g => g.issue === 'missing_source_ref');
    expect(missingSourceGap).toBeDefined();
    expect(missingSourceGap?.severity).toBe('error');
  });

});
