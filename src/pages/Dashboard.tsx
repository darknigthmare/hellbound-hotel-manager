import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Users, 
  Bed, 
  TrendingUp, 
  ShieldAlert, 
  Play
} from 'lucide-react';
import { db } from '../db/localDb';
import { RulesEngine } from '../lib/rules-engine';
import { Character, DatabaseState } from '../types';
import { INVENTORY_MAX, InventoryBackup } from '../lib/export-import';
import type { ViewType } from '../components/Sidebar';

interface DashboardProps {
  state: DatabaseState;
  onStateChange: () => void;
  onNavigate: (view: ViewType, targetId?: string) => void;
}

interface NarrativeEvent {
  id: string;
  title: string;
  message: string;
  cooldownDays: number;
  isAvailable: () => boolean;
  apply: (draft: DatabaseState, inventory: InventoryBackup) => string;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onStateChange, onNavigate }) => {
  const [tickerMessage, setTickerMessage] = useState<string>('All systems operational. Redeeming process active.');

  // Destructure state
  const { characters, rooms, incidents, staffTasks, reputation, settings } = state;
  const gameplayMeta = state.gameplayMeta || db.getGameplayMeta();
  const campaignOutcome = RulesEngine.evaluateCampaignOutcome(state);
  const campaignLocked = campaignOutcome.phase !== 'active';

  // Run security checks
  const warnings = (() => {
    const safetyWarnings: string[] = [];
    
    // Check rooms for high-risk occupancy
    rooms.forEach(room => {
      const occupantIds = room.occupantIds?.length ? room.occupantIds : (room.occupantId ? [room.occupantId] : []);
      occupantIds.forEach(occupantId => {
        const guest = characters.find(c => c.id === occupantId);
        if (guest) {
          const check = RulesEngine.validateRoomAssignment(room, guest);
          if (!check.isSafe && check.warning) {
            safetyWarnings.push(check.warning);
          }
        }
      });
    });

    // Check budget
    const totalExpenses = state.resourceLedger
      .filter(l => l.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = state.resourceLedger
      .filter(l => l.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    const currentBalance = totalIncome - totalExpenses;

    if (currentBalance < 0) {
      safetyWarnings.push('FINANCIAL CRISIS: Hotel bank ledger shows a negative balance. Secure emergency donations.');
    }

    // Check staff workload
    const activeStaff = characters.filter(c => c.status === 'staff');
    activeStaff.forEach(staff => {
      const workload = staffTasks
        .filter(t => t.assignedTo === staff.id && t.status !== 'completed' && t.status !== 'cancelled')
        .reduce((sum, task) => sum + task.mentalWorkload, gameplayMeta.staffFatigue[staff.id] || 0);
      if (workload >= 8) {
        safetyWarnings.push(`STAFF OVERLOAD: ${staff.name} has ${workload}/10 combined task load and fatigue.`);
      }
    });

    if (reputation.heavenAttention >= 80) safetyWarnings.push('CELESTIAL PRESSURE: advancing the campaign may create an active Heaven threat incident.');
    if (reputation.veesInfluence >= 70 || reputation.mediaChaos >= 70) safetyWarnings.push('MEDIA PRESSURE: the next day will reduce sinner reputation and internal trust.');
    if (reputation.overlordHostility >= 70) safetyWarnings.push('OVERLORD PRESSURE: the next day will incur emergency security costs.');
    if (reputation.internalTrust <= 25) safetyWarnings.push('STAFF COHESION CRISIS: low trust increases fatigue on the next day.');

    return safetyWarnings;
  })();

  // Calculations
  const activeResidents = characters.filter(c => c.status === 'resident').length;
  const totalRoomsCount = rooms.length;
  const occupiedRoomsCount = rooms.filter(r => Boolean(r.occupantId || r.occupantIds?.length)).length;
  const occupancyRate = totalRoomsCount > 0 ? (occupiedRoomsCount / totalRoomsCount) * 100 : 0;
  
  const damagedRoomsCount = rooms.filter(r => r.status === 'damaged').length;
  const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'contained').length;
  const pendingTasks = staffTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;

  // Narrative event pool
  const triggerNarrativeEvent = () => {
    if (campaignLocked) {
      setTickerMessage(`${campaignOutcome.title}. Finalize the outcome before leaving the campaign.`);
      return;
    }
    if (!settings.randomEventsEnabled) {
      setTickerMessage('Narrative events are disabled in the current application settings.');
      return;
    }

    const availableDay = gameplayMeta.cooldowns.narrative || 0;
    if (availableDay > gameplayMeta.campaignDay) {
      setTickerMessage(`Operations need time to settle. Next narrative event is available on Campaign Day ${availableDay}.`);
      return;
    }

    const availableRooms = rooms.filter(room => {
      const occupants = room.occupantIds?.length ?? (room.occupantId ? 1 : 0);
      return occupants < room.capacity && room.status === 'clean'
        && !room.restrictions.includes('staff_only') && !room.restrictions.includes('no_entry');
    }).length;
    const activeApplicants = characters.filter(character => character.status === 'applicant').length;
    const angelPlan = state.rehabilitationPlans.find(plan => plan.characterId === 'angeldust');
    const angel = characters.find(character => character.id === 'angeldust');
    const damagedRoom = rooms.find(room => room.status === 'damaged');
    const unbroadcastRedeemedCharacter = characters.find(character => (
      character.status === 'redeemed'
      && !gameplayMeta.broadcastRedemptionIds.includes(character.id)
    ));
    const barSessionKey = angelPlan ? `${gameplayMeta.campaignDay}:${angelPlan.id}` : '';
    const inventory = db.getInventory();
    const activeResidentIds = new Set(characters
      .filter(character => character.status === 'resident' || character.status === 'applicant')
      .map(character => character.id));
    const contractLink = state.relationships.find(relationship => relationship.type === 'contract_bound'
      && (activeResidentIds.has(relationship.charAId) || activeResidentIds.has(relationship.charBId)));
    const supportiveLinkCount = state.relationships.filter(relationship => (
      relationship.type === 'ally'
      || relationship.type === 'family'
      || relationship.type === 'staff'
      || relationship.type === 'romantic'
    )).length;
    const veesCharacterIds = new Set(['vox', 'valentino', 'velvette']);
    const hostileVeesLink = state.relationships.some(relationship => (
      relationship.type === 'enemy' || relationship.type === 'manipulative'
    ) && (veesCharacterIds.has(relationship.charAId) || veesCharacterIds.has(relationship.charBId)));
    const totalStaffFatigue = Object.values(gameplayMeta.staffFatigue).reduce((total, fatigue) => total + fatigue, 0);
    const factionInfluence = (id: string) => state.factions.find(faction => faction.id === id)?.influence || 0;

    const events: NarrativeEvent[] = [
      {
        id: 'new_sinner_intake',
        title: 'New Sinner Intake',
        message: 'A chaotic sinner arrives at the lobby requesting a standard suite and promising to try "the trust exercises".',
        cooldownDays: 4,
        isAvailable: () => reputation.sinnerReputation >= 30 && availableRooms > 0 && activeApplicants < 3,
        apply: (draft) => {
          if (draft.reputation.sinnerReputation < 30 || draft.characters.filter(character => character.status === 'applicant').length >= 3) {
            throw new Error('The hotel is not currently eligible for another walk-in applicant.');
          }
          const applicantIndex = draft.characters.filter(character => character.id.startsWith('walkin_')).length + 1;
          const applicantId = `walkin_day${draft.gameplayMeta!.campaignDay}_${applicantIndex}`;
          if (draft.characters.some(character => character.id === applicantId)) throw new Error('This campaign-day intake was already registered.');
          const applicant: Character = {
            id: applicantId,
            name: `Walk-in Applicant ${applicantIndex}`,
            alias: 'Unverified Hotel Applicant',
            type: 'sinner',
            role: 'resident',
            status: 'applicant',
            riskLevel: 'medium',
            charlieTrust: 20,
            rehabProgress: 0,
            contracts: [],
            notes: 'Procedural intake generated by hotel operations. Requires interview, room review, and a custom rehabilitation plan.',
            canonStatus: 'simulation_au',
            operationalDataStatus: 'simulation_au',
            timelineScope: draft.timeline.current,
            sourceRef: '',
            spoilerLevel: 'none',
            description: 'A non-canon walk-in applicant generated for the local management campaign.'
          };
          const room = draft.rooms.find(candidate => {
            const occupants = candidate.occupantIds?.length ?? (candidate.occupantId ? 1 : 0);
            return occupants < candidate.capacity && candidate.status === 'clean'
              && !candidate.restrictions.includes('staff_only') && !candidate.restrictions.includes('no_entry');
          });
          if (!room) throw new Error('No bed remains available for intake.');
          const occupants = room.occupantIds ? [...room.occupantIds] : (room.occupantId ? [room.occupantId] : []);
          occupants.push(applicant.id);
          room.occupantIds = occupants;
          room.occupantId = room.occupantId || applicant.id;
          draft.characters.push(applicant);
          draft.reputation.sinnerReputation = Math.min(100, draft.reputation.sinnerReputation + 5);
          draft.reputation.mediaChaos = Math.min(100, draft.reputation.mediaChaos + 3);
          return `${applicant.name} was registered and assigned to Room ${room.number}.`;
        }
      },
      {
        id: 'voxtek_smear',
        title: 'Voxtek Smear Campaign',
        message: 'Vox coordinates a prime-time television broadcast claiming the hotel is a shell company for soul exploitation.',
        cooldownDays: 3,
        isAvailable: () => reputation.mediaChaos < 100 || reputation.sinnerReputation > 0,
        apply: (draft) => {
          draft.reputation = RulesEngine.calculateReputationEvent('vox_propaganda', draft.reputation);
          return 'Vox launched a television broadcast smearing our credibility.';
        }
      },
      {
        id: 'bar_deescalation',
        title: 'Bar Talk De-escalation',
        message: 'Husk listens to Angel Dust venting about Valentino. Angel Dust gains +5 rehab control. Husk remains slightly annoyed.',
        cooldownDays: 2,
        isAvailable: () => Boolean(angel && angelPlan && !angelPlan.isRedeemedConfirmed && angelPlan.impulseControlScore < 100
          && inventory.bar > 0 && (gameplayMeta.dailySessionCounts[barSessionKey] || 0) < 2),
        apply: (draft, supplies) => {
          const plan = draft.rehabilitationPlans.find(candidate => candidate.id === angelPlan?.id);
          const resident = draft.characters.find(candidate => candidate.id === angel?.id);
          const husk = draft.characters.find(candidate => candidate.id === 'husk' && candidate.status === 'staff');
          if (!plan || !resident || resident.status !== 'resident' || plan.isRedeemedConfirmed || !husk || supplies.bar < 1 || plan.impulseControlScore >= 100) {
            throw new Error('Bar de-escalation requirements are no longer met.');
          }
          const meta = draft.gameplayMeta!;
          const key = `${meta.campaignDay}:${plan.id}`;
          if ((meta.dailySessionCounts[key] || 0) >= 2) throw new Error('Angel has reached the daily session limit.');
          const huskLoad = draft.staffTasks
            .filter(task => task.assignedTo === 'husk' && task.status !== 'completed' && task.status !== 'cancelled')
            .reduce((sum, task) => sum + task.mentalWorkload, meta.staffFatigue.husk || 0);
          if (huskLoad >= 10) throw new Error('Husk is overloaded or too fatigued for a bar check-in.');
          supplies.bar -= 1;
          const sessionSequence = (meta.dailySessionCounts[key] || 0) + 1;
          const sessionId = `sess_bar_day${meta.campaignDay}_${plan.id}_${sessionSequence}`;
          if (draft.rehabilitationSessions.some(session => session.id === sessionId)) throw new Error('This de-escalation session was already recorded.');
          draft.rehabilitationSessions.push({
            id: sessionId,
            planId: plan.id,
            date: `Campaign Day ${meta.campaignDay}`,
            campaignDay: meta.campaignDay,
            approachId: 'narrative_bar_deescalation',
            type: 'therapy_like_checkin',
            summary: 'Husk conducted a documented de-escalation check-in at the hotel bar.',
            empathyDelta: 0,
            accountabilityDelta: 0,
            impulseControlDelta: 5,
            cooperationDelta: 0,
            conductedBy: 'husk'
          });
          plan.impulseControlScore = Math.min(100, plan.impulseControlScore + 5);
          resident.rehabProgress = RulesEngine.calculateRehabilitationProgress(plan);
          meta.dailySessionCounts[key] = (meta.dailySessionCounts[key] || 0) + 1;
          meta.staffFatigue.husk = Math.min(100, (meta.staffFatigue.husk || 0) + 1);
          draft.reputation.internalTrust = Math.min(100, draft.reputation.internalTrust + 3);
          return 'Husk completed a documented de-escalation session; 1 bar supply was consumed.';
        }
      },
      {
        id: 'heaven_patrol',
        title: 'Heavenly Eye Patrol',
        message: 'An Exorcist scout ship approaches the Pride Ring skies. Exorcist attention levels spike.',
        cooldownDays: 4,
        isAvailable: () => reputation.heavenAttention < 100,
        apply: (draft) => {
          draft.reputation.heavenAttention = Math.min(100, draft.reputation.heavenAttention + 15);
          return 'A Heavenly scout eye was detected; Heaven attention increased by 15.';
        }
      },
      {
        id: 'alastor_assistance',
        title: 'Alastor\'s Dark Assistance',
        message: 'Alastor shadows fix a broken door instantly, but whispers a minor riddle regarding future favors.',
        cooldownDays: 30,
        isAvailable: () => Boolean(damagedRoom && !gameplayMeta.narrativeFlags.includes('alastor_emergency_favor_used')),
        apply: (draft) => {
          const room = draft.rooms.find(candidate => candidate.status === 'damaged');
          if (!room || draft.gameplayMeta!.narrativeFlags.includes('alastor_emergency_favor_used')) throw new Error('The emergency favor is unavailable.');
          room.status = 'clean';
          room.repairCost = 0;
          room.maintenanceNotes = `${room.maintenanceNotes}\nSimulation AU: one-time emergency shadow repair accepted; a future favor is owed.`;
          draft.gameplayMeta!.narrativeFlags.push('alastor_emergency_favor_used');
          draft.reputation.internalTrust = Math.max(0, draft.reputation.internalTrust - 10);
          draft.reputation.overlordHostility = Math.min(100, draft.reputation.overlordHostility + 15);
          return `Alastor repaired Room ${room.number}; the one-time favor created substantial long-term hostility.`;
        }
      },
      {
        id: 'contract_enforcement',
        title: 'Contract Enforcement Notice',
        message: 'A binding-contract holder sends collectors to pressure a hotel resident. This is a Simulation AU operational event.',
        cooldownDays: 5,
        isAvailable: () => Boolean(contractLink),
        apply: (draft) => {
          const meta = draft.gameplayMeta!;
          const residents = new Set(draft.characters
            .filter(character => character.status === 'resident' || character.status === 'applicant')
            .map(character => character.id));
          const link = draft.relationships.find(relationship => relationship.type === 'contract_bound'
            && (residents.has(relationship.charAId) || residents.has(relationship.charBId)));
          if (!link) throw new Error('No active resident contract remains to enforce.');
          const involved = [link.charAId, link.charBId].filter(id => residents.has(id));
          draft.incidents.push({
            id: `contract_pressure_${meta.campaignDay}_${link.id}`,
            date: `Campaign Day ${meta.campaignDay}`,
            location: 'Hotel perimeter',
            residentsInvolved: involved,
            type: 'deal_contract',
            severity: 'medium',
            summary: 'Simulation AU: contract collectors attempted to pressure a protected hotel resident.',
            consequences: 'The unresolved binding relationship increased Overlord leverage and staff stress.',
            repairCost: 0,
            reputationImpact: -3,
            trustImpact: -4,
            actionTaken: '',
            status: 'open',
            loreLink: null,
            tags: ['simulation_au', 'relationship_consequence', `relationship:${link.id}`]
          });
          draft.reputation.internalTrust = Math.max(0, draft.reputation.internalTrust - 4);
          draft.reputation.overlordHostility = Math.min(100, draft.reputation.overlordHostility + 6);
          draft.factions = draft.factions.map(faction => faction.id === 'overlords'
            ? { ...faction, influence: Math.min(100, faction.influence + 2) }
            : faction);
          return `Collectors targeted ${involved.length || 1} resident record; a contract-pressure incident is now open.`;
        }
      },
      {
        id: 'allied_supply_drive',
        title: 'Allied Supply Drive',
        message: 'The hotel support network organizes a non-canon mutual-aid delivery.',
        cooldownDays: 4,
        isAvailable: () => supportiveLinkCount >= 4 && (inventory.food < INVENTORY_MAX || inventory.clean < INVENTORY_MAX),
        apply: (draft, supplies) => {
          const links = draft.relationships.filter(relationship => (
            relationship.type === 'ally'
            || relationship.type === 'family'
            || relationship.type === 'staff'
            || relationship.type === 'romantic'
          )).length;
          if (links < 4 || (supplies.food >= INVENTORY_MAX && supplies.clean >= INVENTORY_MAX)) {
            throw new Error('The support network or storage capacity no longer qualifies for a supply drive.');
          }
          supplies.food = Math.min(INVENTORY_MAX, supplies.food + 5);
          supplies.clean = Math.min(INVENTORY_MAX, supplies.clean + 3);
          draft.reputation.internalTrust = Math.min(100, draft.reputation.internalTrust + 3);
          draft.factions = draft.factions.map(faction => faction.id === 'hotel'
            ? { ...faction, influence: Math.min(100, faction.influence + 2) }
            : faction);
          return 'Allies delivered up to 5 food and 3 cleaning supplies; hotel cohesion and influence improved.';
        }
      },
      {
        id: 'staff_recovery_circle',
        title: 'Staff Recovery Circle',
        message: 'A high-fatigue team schedules a protected recovery shift instead of adding more duties.',
        cooldownDays: 3,
        isAvailable: () => totalStaffFatigue >= 12 && inventory.food >= 2,
        apply: (draft, supplies) => {
          const meta = draft.gameplayMeta!;
          const fatigue = Object.values(meta.staffFatigue).reduce((total, value) => total + value, 0);
          if (fatigue < 12 || supplies.food < 2) throw new Error('Recovery-circle requirements are no longer met.');
          supplies.food -= 2;
          Object.keys(meta.staffFatigue).forEach(staffId => {
            meta.staffFatigue[staffId] = Math.max(0, meta.staffFatigue[staffId] - 3);
          });
          draft.reputation.internalTrust = Math.min(100, draft.reputation.internalTrust + 4);
          return 'The staff consumed 2 food supplies, recovered fatigue, and rebuilt internal trust.';
        }
      },
      {
        id: 'vees_data_leak',
        title: 'Vees Data Leak',
        message: 'A hostile or manipulative Vees connection exposes fragments of hotel operations.',
        cooldownDays: 4,
        isAvailable: () => hostileVeesLink || factionInfluence('vees') >= 70,
        apply: (draft) => {
          const stillExposed = draft.relationships.some(relationship => (
            relationship.type === 'enemy' || relationship.type === 'manipulative'
          ) && (veesCharacterIds.has(relationship.charAId) || veesCharacterIds.has(relationship.charBId)))
            || (draft.factions.find(faction => faction.id === 'vees')?.influence || 0) >= 70;
          if (!stillExposed) throw new Error('Vees exposure is no longer high enough for this event.');
          draft.reputation.mediaChaos = Math.min(100, draft.reputation.mediaChaos + 10);
          draft.reputation.sinnerReputation = Math.max(0, draft.reputation.sinnerReputation - 5);
          draft.reputation.veesInfluence = Math.min(100, draft.reputation.veesInfluence + 5);
          draft.factions = draft.factions.map(faction => faction.id === 'vees'
            ? { ...faction, influence: Math.min(100, faction.influence + 2) }
            : faction);
          return 'The leak increased media chaos and Vees leverage; counter-messaging is now more valuable.';
        }
      },
      {
        id: 'resident_testimony',
        title: 'Resident Testimony Night',
        message: 'Residents voluntarily share progress with local guests in a Simulation AU community event.',
        cooldownDays: 5,
        isAvailable: () => factionInfluence('hotel') >= 25 && reputation.redemptionCredibility >= 30 && activeResidents >= 2,
        apply: (draft) => {
          const hotelInfluence = draft.factions.find(faction => faction.id === 'hotel')?.influence || 0;
          const residentCount = draft.characters.filter(character => character.status === 'resident').length;
          if (hotelInfluence < 25 || draft.reputation.redemptionCredibility < 30 || residentCount < 2) {
            throw new Error('Resident testimony requirements are no longer met.');
          }
          draft.reputation.redemptionCredibility = Math.min(100, draft.reputation.redemptionCredibility + 5);
          draft.reputation.sinnerReputation = Math.min(100, draft.reputation.sinnerReputation + 4);
          draft.reputation.heavenAttention = Math.min(100, draft.reputation.heavenAttention + 2);
          draft.factions = draft.factions.map(faction => faction.id === 'hotel'
            ? { ...faction, influence: Math.min(100, faction.influence + 2) }
            : faction);
          return 'Voluntary testimony improved credibility and support while drawing limited celestial attention.';
        }
      },
      {
        id: 'celestial_dossier_review',
        title: 'Celestial Dossier Review',
        message: 'A documented Simulation AU evidence packet reaches a cautious celestial review desk.',
        cooldownDays: 6,
        isAvailable: () => reputation.redemptionCredibility >= 50
          && reputation.heavenAttention >= 35
          && reputation.heavenAttention <= 85,
        apply: (draft) => {
          if (draft.reputation.redemptionCredibility < 50
            || draft.reputation.heavenAttention < 35
            || draft.reputation.heavenAttention > 85) {
            throw new Error('Celestial review conditions are no longer met.');
          }
          draft.reputation.redemptionCredibility = Math.min(100, draft.reputation.redemptionCredibility + 3);
          draft.reputation.heavenAttention = Math.max(0, draft.reputation.heavenAttention - 5);
          draft.factions = draft.factions.map(faction => faction.id === 'exorcists'
            ? { ...faction, influence: Math.max(0, faction.influence - 2) }
            : faction);
          return 'The review reduced immediate Heaven attention and slightly weakened Exorcist leverage.';
        }
      },
      {
        id: 'redemption_broadcast',
        title: 'Redemption Proof Broadcast',
        message: `${unbroadcastRedeemedCharacter?.name || 'A redeemed soul'} is presented as verified proof of Charlie's program.`,
        cooldownDays: 5,
        isAvailable: () => Boolean(unbroadcastRedeemedCharacter),
        apply: (draft) => {
          const character = draft.characters.find(candidate => candidate.id === unbroadcastRedeemedCharacter?.id);
          if (!character || character.status !== 'redeemed'
            || !draft.gameplayMeta!.rewardedRedemptionIds.includes(character.id)
            || draft.gameplayMeta!.broadcastRedemptionIds.includes(character.id)) {
            throw new Error('This redemption is not an unbroadcast, workflow-confirmed result.');
          }
          draft.gameplayMeta!.broadcastRedemptionIds.push(character.id);
          draft.reputation.sinnerReputation = Math.min(100, draft.reputation.sinnerReputation + 3);
          draft.reputation.mediaChaos = Math.max(0, draft.reputation.mediaChaos - 8);
          draft.reputation.heavenAttention = Math.min(100, draft.reputation.heavenAttention + 5);
          draft.reputation.veesInfluence = Math.min(100, draft.reputation.veesInfluence + 5);
          return `The already-rewarded redemption of ${character.name} was broadcast once without duplicating the ascension reward.`;
        }
      }
    ];

    const availableEvents = events.filter(event => event.isAvailable()
      && (gameplayMeta.cooldowns[`event:${event.id}`] || 0) <= gameplayMeta.campaignDay);
    if (availableEvents.length === 0) {
      setTickerMessage('No coherent narrative event is currently available. Context requirements or per-event cooldowns must change first.');
      return;
    }

    // Stable campaign-day rotation makes the same save choose the same event.
    const selectedEvent = availableEvents[gameplayMeta.campaignDay % availableEvents.length];
    
    let resultText = '';
    const applied = db.transaction(`NARRATIVE_EVENT:${selectedEvent.id}`, (draft, supplies) => {
      const meta = draft.gameplayMeta!;
      if (RulesEngine.evaluateCampaignOutcome(draft).phase !== 'active') throw new Error('The campaign outcome locks narrative events.');
      if ((meta.cooldowns.narrative || 0) > meta.campaignDay) throw new Error('Narrative event cooldown is active.');
      const eventCooldownKey = `event:${selectedEvent.id}`;
      if ((meta.cooldowns[eventCooldownKey] || 0) > meta.campaignDay) throw new Error('This contextual event is still on cooldown.');
      resultText = selectedEvent.apply(draft, supplies);
      meta.cooldowns.narrative = meta.campaignDay + 1;
      meta.cooldowns[eventCooldownKey] = meta.campaignDay + selectedEvent.cooldownDays;
    }, {
      action: `NARRATIVE_EVENT:${selectedEvent.id}`,
      details: `[Simulation AU · ${selectedEvent.title}] ${selectedEvent.message}`
    });
    if (!applied) {
      setTickerMessage(db.getStorageStatus().lastError?.message || 'Narrative event failed atomically.');
      return;
    }
    setTickerMessage(`[SIMULATION AU EVENT] ${selectedEvent.title}: ${resultText} Repeats no earlier than Day ${gameplayMeta.campaignDay + selectedEvent.cooldownDays}.`);
    onStateChange();
  };

  const advanceCampaignDay = () => {
    if (campaignLocked) {
      setTickerMessage(`${campaignOutcome.title}. Campaign time is locked pending finalization.`);
      return;
    }
    if (!db.advanceCampaignDay()) {
      setTickerMessage(db.getStorageStatus().lastError?.message || 'Campaign day could not advance.');
      return;
    }
    setTickerMessage(`Campaign Day ${gameplayMeta.campaignDay + 1} started. Upkeep, fatigue recovery, and threat thresholds were processed.`);
    onStateChange();
  };

  const finalizeCampaignOutcome = () => {
    if ((campaignOutcome.phase !== 'victory' && campaignOutcome.phase !== 'defeat')
      || !campaignOutcome.result
      || !campaignOutcome.endingId) return;
    const endingMarker = `campaign_ended:${campaignOutcome.result}:${campaignOutcome.endingId}`;
    const finalized = db.transaction('CAMPAIGN_FINALIZE', (draft) => {
      const freshOutcome = RulesEngine.evaluateCampaignOutcome(draft);
      if (freshOutcome.phase !== campaignOutcome.phase
        || freshOutcome.result !== campaignOutcome.result
        || freshOutcome.endingId !== campaignOutcome.endingId) {
        throw new Error('Campaign outcome conditions changed before finalization.');
      }
      const existingEnding = draft.gameplayMeta!.narrativeFlags.find(flag => flag.startsWith('campaign_ended:'));
      if (existingEnding && existingEnding !== endingMarker) throw new Error('A different campaign ending is already finalized.');
      if (!draft.gameplayMeta!.narrativeFlags.includes(endingMarker)) {
        draft.gameplayMeta!.narrativeFlags.push(endingMarker);
      }
      const milestone = `campaign:${campaignOutcome.result}:${campaignOutcome.endingId}`;
      if (!draft.gameplayMeta!.completedMilestones.includes(milestone)) {
        draft.gameplayMeta!.completedMilestones.push(milestone);
      }
    }, {
      action: 'CAMPAIGN_FINALIZED',
      details: `Finalized Simulation AU ${campaignOutcome.result}: ${campaignOutcome.endingId}.`
    });
    if (!finalized) {
      setTickerMessage(db.getStorageStatus().lastError?.message || 'The campaign outcome could not be finalized.');
      return;
    }
    setTickerMessage(`Campaign finalized: ${campaignOutcome.title}.`);
    onStateChange();
  };

  const handleStatCardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, view: ViewType) => {
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onNavigate(view);
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Hotel Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Active Operations Overseer — Management of residents, security, and redemption paths.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <strong style={{ color: 'var(--color-gold)', fontSize: '0.8rem' }}>Day {gameplayMeta.campaignDay}</strong>
          <button type="button" className="btn btn-secondary" onClick={advanceCampaignDay} id="advance-campaign-day-btn" disabled={campaignLocked}>
            Advance Day
          </button>
          <button
            type="button"
            className="btn btn-gold"
            onClick={triggerNarrativeEvent}
            id="trigger-narrative-event-btn"
            disabled={campaignLocked || !settings.randomEventsEnabled || (gameplayMeta.cooldowns.narrative || 0) > gameplayMeta.campaignDay}
            title={settings.randomEventsEnabled ? 'Trigger one currently valid narrative event' : 'Narrative events are disabled in Settings'}
          >
            <Play size={16} />
            Trigger Narrative Event
          </button>
          {(campaignOutcome.phase === 'victory' || campaignOutcome.phase === 'defeat') && (
            <button type="button" className="btn btn-primary" onClick={finalizeCampaignOutcome} id="finalize-campaign-btn">
              Finalize {campaignOutcome.result === 'victory' ? 'Victory' : 'Defeat'}
            </button>
          )}
        </div>
      </div>

      <section
        className="glass-panel"
        aria-labelledby="campaign-status-title"
        style={{ padding: '14px 16px', borderLeft: `4px solid ${campaignOutcome.phase === 'active' ? 'var(--color-gold)' : campaignOutcome.result === 'victory' ? '#4ce06c' : 'var(--status-high)'}` }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <strong id="campaign-status-title" style={{ color: 'var(--color-gold)', display: 'block' }}>{campaignOutcome.title}</strong>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{campaignOutcome.summary}</span>
          </div>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Non-canon Simulation AU</span>
        </div>
        {campaignOutcome.requirements.length > 0 && (
          <ul style={{ margin: '8px 0 0', paddingLeft: '18px', color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'grid', gap: '3px' }}>
            {campaignOutcome.requirements.map(requirement => <li key={requirement}>{requirement}</li>)}
          </ul>
        )}
      </section>

      {/* Visual Hotel Banner */}
      <div 
        className="glass-panel art-deco-border"
        style={{
          height: '220px',
          backgroundImage: "linear-gradient(to bottom, rgba(12, 8, 9, 0.2), rgba(12, 8, 9, 0.95)), url('/assets/hotel_exterior.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '20px',
          boxShadow: 'var(--shadow-gold)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-title)', color: 'var(--color-gold)', textShadow: '0 2px 10px rgba(0,0,0,0.95)' }}>
          {settings.appName}
        </h2>
        <p style={{ color: 'var(--color-text-main)', textShadow: '0 1px 6px rgba(0,0,0,0.95)', maxWidth: '550px', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '4px' }}>
          "Where a second chance isn't a dream... it's a structural hazard."
        </p>
      </div>

      {/* Narrative event ticker */}
      <div
        className="glass-panel art-deco-border"
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(90deg, rgba(168, 32, 42, 0.15) 0%, rgba(20, 10, 12, 0.5) 100%)',
          color: 'var(--color-gold)',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderLeft: '4px solid var(--color-gold)'
        }}
      >
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-hover)' }}>[TICKER]</span>
        <span style={{ color: 'var(--color-text-main)' }}>{tickerMessage}</span>
      </div>

      {/* Alerts Panel */}
      {warnings.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            border: '1px solid rgba(220, 53, 69, 0.4)',
            backgroundColor: 'rgba(114, 28, 36, 0.15)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b7a', fontWeight: 'bold' }}>
            <AlertTriangle size={18} />
            <span>OPERATIONAL ALERTS ({warnings.length})</span>
          </div>
          <ul style={{ paddingLeft: '24px', margin: 0, color: 'var(--color-text-main)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {warnings.map((warn, i) => (
              <li key={i} style={{ listStyleType: 'square' }}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" role="button" tabIndex={0} aria-label={`Open residents: ${activeResidents} active`} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => onNavigate('characters')} onKeyDown={(event) => handleStatCardKeyDown(event, 'characters')}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', borderRadius: '8px', color: 'var(--color-gold)' }}>
            <Users size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Active Residents</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{activeResidents}</p>
          </div>
        </div>

        <div className="glass-panel" role="button" tabIndex={0} aria-label={`Open rooms: ${occupancyRate.toFixed(1)} percent occupied`} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => onNavigate('rooms')} onKeyDown={(event) => handleStatCardKeyDown(event, 'rooms')}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', borderRadius: '8px', color: 'var(--color-gold)' }}>
            <Bed size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Room Occupancy</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {occupancyRate.toFixed(1)}%
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500, marginLeft: '6px' }}>
                ({occupiedRoomsCount}/{totalRoomsCount})
              </span>
            </p>
          </div>
        </div>

        <div className="glass-panel" role="button" tabIndex={0} aria-label={`Open incidents: ${openIncidents} unresolved`} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => onNavigate('incidents')} onKeyDown={(event) => handleStatCardKeyDown(event, 'incidents')}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', borderRadius: '8px', color: '#ff6b7a' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Open Incidents</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {openIncidents}
              {damagedRoomsCount > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#ff6b7a', display: 'block', fontWeight: 500 }}>
                  {damagedRoomsCount} Room(s) Damaged
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="glass-panel" role="button" tabIndex={0} aria-label={`Open staff duties: ${pendingTasks} active`} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => onNavigate('staff')} onKeyDown={(event) => handleStatCardKeyDown(event, 'staff')}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', borderRadius: '8px', color: 'var(--color-gold)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Active Tasks</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{pendingTasks}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Reputation & Threats */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left Side: Reputation Indicators */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--color-gold)', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
            Hotel Reputation Metrics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Sinner Reputation (Hell Groundwork)', val: reputation.sinnerReputation, color: 'var(--color-primary)' },
              { label: 'Redemption Credibility (Heavenly Eyes)', val: reputation.redemptionCredibility, color: '#eec247' },
              { label: 'Internal Trust & Cohesion', val: reputation.internalTrust, color: '#28a745' },
              { label: 'Media Chaos & Smear Press', val: reputation.mediaChaos, color: '#fd7e14' }
            ].map((m, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>{m.label}</span>
                  <span style={{ fontWeight: 700, color: m.color }}>{m.val}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '100%', width: `${m.val}%`, backgroundColor: m.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Threats and Security Attention */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ color: 'var(--color-gold)', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
            External Threats
          </h3>
          
          <div className="brass-gauge-container" style={{ display: 'flex', justifyContent: 'space-around', gap: '16px', padding: '10px 0' }}>
            {/* Heaven Attention Dial */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ffd700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Heaven Attention
              </span>
              <div className="brass-dial" title={`Heaven Attention: ${reputation.heavenAttention}%`}>
                <div 
                  className="brass-dial-needle" 
                  style={{ transform: `rotate(${(reputation.heavenAttention / 100) * 180 - 90}deg)` }}
                />
                <strong style={{ fontSize: '1.2rem', color: '#ffd700', zIndex: 2, marginTop: '24px' }}>
                  {reputation.heavenAttention}%
                </strong>
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                Extermination countdown
              </span>
            </div>

            {/* Vees Hostility Dial */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ff6b7a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Vees Influence
              </span>
              <div className="brass-dial" title={`Vees Hostility: ${reputation.veesInfluence}%`}>
                <div 
                  className="brass-dial-needle" 
                  style={{ transform: `rotate(${(reputation.veesInfluence / 100) * 180 - 90}deg)` }}
                />
                <strong style={{ fontSize: '1.2rem', color: '#ff6b7a', zIndex: 2, marginTop: '24px' }}>
                  {reputation.veesInfluence}%
                </strong>
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                Smear signals level
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Panel: Incidents & Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Incidents list */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
            <h4 style={{ color: 'var(--color-text-main)' }}>Open Incidents</h4>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => onNavigate('incidents')}>
              View All
            </button>
          </div>
          {incidents.filter(i => i.status === 'open' || i.status === 'contained').length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '12px 0' }}>
              No active security incidents logged. Front gates secure.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incidents.filter(i => i.status === 'open' || i.status === 'contained').slice(0, 3).map(inc => (
                <div 
                  key={inc.id} 
                  style={{ 
                    padding: '10px', 
                    backgroundColor: 'rgba(0,0,0,0.2)', 
                    borderRadius: '4px',
                    borderLeft: `3px solid ${inc.severity === 'crisis' ? '#721c24' : inc.severity === 'high' ? '#dc3545' : '#fd7e14'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{inc.location}</span>
                    <span style={{ fontSize: '0.7rem', color: '#ff6b7a', textTransform: 'uppercase', fontWeight: 700 }}>{inc.severity}</span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {inc.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current tasks */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
            <h4 style={{ color: 'var(--color-text-main)' }}>Current Tasks</h4>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => onNavigate('staff')}>
              View Scheduler
            </button>
          </div>
          {staffTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '12px 0' }}>
              All staff tasks cleared. Planning next exercises.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {staffTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').slice(0, 3).map(task => (
                <div key={task.id} style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginBottom: '2px' }}>{task.title}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      Assigned: {characters.find(c => c.id === task.assignedTo)?.name || task.assignedTo}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '3px 8px', 
                    borderRadius: '3px', 
                    backgroundColor: task.status === 'in_progress' ? 'rgba(253, 126, 20, 0.1)' : 'rgba(163, 147, 149, 0.1)',
                    color: task.status === 'in_progress' ? '#fd7e14' : '#a39395',
                    border: task.status === 'in_progress' ? '1px solid rgba(253, 126, 20, 0.3)' : '1px solid rgba(163, 147, 149, 0.2)'
                  }}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
