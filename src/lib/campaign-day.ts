import type { DatabaseState } from '../types';

/**
 * Applies recurring campaign-day rules to an isolated transaction draft.
 *
 * This deterministic domain helper performs no storage or audit I/O, allowing a
 * larger gameplay operation to combine its own mutations and day advancement
 * inside one LocalDb transaction. It returns the campaign day it applied.
 */
export function applyCampaignDayAdvance(
  draft: DatabaseState,
  nextDay: number = (draft.gameplayMeta?.campaignDay ?? 0) + 1,
): number {
  if (!draft.gameplayMeta) {
    throw new Error('Campaign day advancement requires normalized gameplay metadata.');
  }
  if (!Number.isInteger(nextDay) || nextDay <= draft.gameplayMeta.campaignDay) {
    throw new Error('Campaign day advancement requires a future positive integer day.');
  }

  const meta = draft.gameplayMeta;
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
  const occupiedBeds = draft.rooms.reduce(
    (total, room) => total + (room.occupantIds?.length ?? (room.occupantId ? 1 : 0)),
    0,
  );
  const upkeep = 40 + activeResidents * 12 + occupiedBeds * 4;
  draft.resourceLedger.push({
    id: `daily_upkeep_${nextDay}`,
    date: `Campaign Day ${nextDay}`,
    type: 'expense',
    category: 'food_beverage',
    amount: upkeep,
    description: `Day ${nextDay} wages, utilities, meals, and occupied-room upkeep.`,
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
      description: 'Emergency wards and patrols caused by high Overlord hostility.',
    });
  }

  const activeResidentIds = new Set(
    draft.characters
      .filter(character => character.status === 'resident')
      .map(character => character.id),
  );
  const bindingContracts = draft.relationships.filter(
    relationship => relationship.type === 'contract_bound'
      && (activeResidentIds.has(relationship.charAId) || activeResidentIds.has(relationship.charBId)),
  ).length;
  if (bindingContracts > 0) {
    draft.reputation.overlordHostility = Math.min(
      100,
      draft.reputation.overlordHostility + Math.min(5, bindingContracts),
    );
    draft.reputation.internalTrust = Math.max(
      0,
      draft.reputation.internalTrust - Math.min(3, bindingContracts),
    );
  }

  if (
    draft.reputation.heavenAttention >= 80
    && !draft.incidents.some(
      incident => incident.type === 'heaven_threat'
        && (incident.status === 'open' || incident.status === 'contained'),
    )
  ) {
    draft.incidents.push({
      id: `auto_heaven_${nextDay}`,
      date: `Campaign Day ${nextDay}`,
      location: 'Hotel airspace',
      residentsInvolved: [],
      type: 'heaven_threat',
      severity: draft.reputation.heavenAttention >= 95 ? 'crisis' : 'high',
      summary: 'Celestial surveillance escalated after sustained Heaven attention.',
      consequences: 'Operations are under direct observation; Simulation AU evidence-dossier finalization is blocked until resolved.',
      repairCost: 0,
      reputationImpact: -10,
      trustImpact: -8,
      actionTaken: '',
      status: 'open',
      loreLink: null,
      tags: ['simulation_au', 'campaign_pressure'],
    });
    draft.reputation.internalTrust = Math.max(0, draft.reputation.internalTrust - 8);
  }

  if (draft.reputation.internalTrust <= 25) {
    for (const staff of draft.characters.filter(character => character.status === 'staff')) {
      meta.staffFatigue[staff.id] = Math.min(100, (meta.staffFatigue[staff.id] || 0) + 2);
    }
  }

  return nextDay;
}
