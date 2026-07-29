import { describe, expect, it } from 'vitest';
import { getSeedData } from '../db/seed';
import { applyCampaignDayAdvance } from '../lib/campaign-day';
import { DEFAULT_GAMEPLAY_META } from '../lib/export-import';
import type { DatabaseState } from '../types';

function campaignState(): DatabaseState {
  return {
    ...getSeedData(),
    gameplayMeta: JSON.parse(JSON.stringify(DEFAULT_GAMEPLAY_META)),
  };
}

describe('pure campaign-day advancement', () => {
  it('advances one transaction draft, charges exact upkeep and recovers staff fatigue', () => {
    const draft = campaignState();
    draft.gameplayMeta!.staffFatigue = { charlie: 10, vaggie: 1 };
    const activeResidents = draft.characters.filter(character => character.status === 'resident').length;
    const occupiedBeds = draft.rooms.reduce(
      (total, room) => total + (room.occupantIds?.length ?? (room.occupantId ? 1 : 0)),
      0,
    );

    const appliedDay = applyCampaignDayAdvance(draft);

    expect(appliedDay).toBe(2);
    expect(draft.gameplayMeta?.campaignDay).toBe(2);
    expect(draft.gameplayMeta?.staffFatigue).toMatchObject({ charlie: 8, vaggie: 0 });
    expect(draft.resourceLedger).toContainEqual(expect.objectContaining({
      id: 'daily_upkeep_2',
      date: 'Campaign Day 2',
      type: 'expense',
      category: 'food_beverage',
      amount: 40 + activeResidents * 12 + occupiedBeds * 4,
    }));
  });

  it('creates one lore-safe Heaven threat at the threshold and never duplicates an active threat', () => {
    const draft = campaignState();
    draft.relationships = draft.relationships.filter(relationship => relationship.type !== 'contract_bound');
    draft.reputation = {
      ...draft.reputation,
      heavenAttention: 85,
      internalTrust: 100,
      veesInfluence: 0,
      mediaChaos: 0,
      overlordHostility: 0,
    };

    const firstAppliedDay = applyCampaignDayAdvance(draft);
    const threat = draft.incidents.find(incident => incident.id === 'auto_heaven_2');

    expect(firstAppliedDay).toBe(2);
    expect(threat).toMatchObject({
      date: 'Campaign Day 2',
      location: 'Hotel airspace',
      type: 'heaven_threat',
      severity: 'high',
      status: 'open',
      tags: ['simulation_au', 'campaign_pressure'],
    });
    expect(draft.reputation.internalTrust).toBe(92);

    const secondAppliedDay = applyCampaignDayAdvance(draft, 3);
    expect(secondAppliedDay).toBe(3);
    expect(draft.gameplayMeta?.campaignDay).toBe(3);
    expect(draft.incidents.filter(incident => incident.type === 'heaven_threat'
      && (incident.status === 'open' || incident.status === 'contained'))).toHaveLength(1);
  });
});
