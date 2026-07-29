import { describe, expect, it } from 'vitest';
import { getSeedData } from '../db/seed';
import { DEFAULT_GAMEPLAY_META, DEFAULT_INVENTORY } from '../lib/export-import';
import { applyTaskCompletionEffect } from '../lib/hotel-operations';
import type { DatabaseState, StaffTask, TaskType } from '../types';

function createState(): DatabaseState {
  const state = getSeedData();
  state.gameplayMeta = {
    ...DEFAULT_GAMEPLAY_META,
    campaignDay: 7,
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
  return state;
}

function createTask(type: TaskType, overrides: Partial<StaffTask> = {}): StaffTask {
  return {
    id: `test_${type}`,
    date: 'Campaign Day 7',
    title: 'Test duty',
    type,
    assignedTo: 'niffty',
    mentalWorkload: 2,
    status: 'in_progress',
    notes: '',
    ...overrides
  };
}

describe('shared hotel task completion effects', () => {
  it('cleans the targeted room and consumes exactly one cleaning supply', () => {
    const state = createState();
    const inventory = { ...DEFAULT_INVENTORY };
    const task = createTask('room_inspection', { targetId: '101' });

    expect(applyTaskCompletionEffect(task, state, inventory)).toEqual({
      ok: true,
      message: 'Niffty inspected and cleaned Room 101; 1 cleaning supply consumed.'
    });
    expect(inventory.clean).toBe(DEFAULT_INVENTORY.clean - 1);
    expect(state.rooms.find(room => room.number === '101')).toMatchObject({
      status: 'clean',
      lastInspectionDate: 'Campaign Day 7',
      lastInspectedBy: 'niffty'
    });
  });

  it('leaves the room untouched when cleaning inventory is depleted', () => {
    const state = createState();
    const inventory = { ...DEFAULT_INVENTORY, clean: 0 };
    const room = state.rooms.find(candidate => candidate.number === '101')!;
    const previousNotes = room.maintenanceNotes;

    expect(applyTaskCompletionEffect(
      createTask('room_inspection', { targetId: room.number }),
      state,
      inventory
    )).toEqual({
      ok: false,
      message: 'Cleaning supplies are depleted. Restock before completing this inspection.'
    });
    expect(room).toMatchObject({ status: 'messy', maintenanceNotes: previousNotes });
    expect(inventory.clean).toBe(0);
  });

  it('charges a successful structural repair to the resource ledger', () => {
    const state = createState();
    const inventory = { ...DEFAULT_INVENTORY };
    const room = state.rooms.find(candidate => candidate.number === '102')!;
    room.status = 'damaged';
    room.repairCost = 300;

    expect(applyTaskCompletionEffect(
      createTask('repair_work', { id: 'repair_102', targetId: room.number }),
      state,
      inventory
    )).toEqual({ ok: true, message: 'Niffty repaired Room 102.' });
    expect(room).toMatchObject({ status: 'clean', repairCost: 0 });
    expect(state.resourceLedger.at(-1)).toEqual({
      id: 'task_repair_repair_102',
      date: 'Campaign Day 7',
      type: 'expense',
      category: 'repair',
      amount: 300,
      description: 'Staff repair task completed for Room 102.'
    });
  });

  it('prepares rehabilitation curriculum and synchronizes resident progress', () => {
    const state = createState();
    const inventory = { ...DEFAULT_INVENTORY };
    const plan = state.rehabilitationPlans.find(candidate => candidate.id === 'plan_angeldust')!;
    const previousCooperation = plan.cooperationScore;

    const effect = applyTaskCompletionEffect(
      createTask('rehab_prep', { assignedTo: 'charlie', targetId: plan.id }),
      state,
      inventory
    );

    expect(effect).toEqual({
      ok: true,
      message: "Charlie Morningstar prepared Angel Dust's curriculum; cooperation +2 and 1 workshop supply consumed."
    });
    expect(plan.cooperationScore).toBe(previousCooperation + 2);
    expect(inventory.food).toBe(DEFAULT_INVENTORY.food - 1);
    expect(state.characters.find(character => character.id === 'angeldust')?.rehabProgress).toBeGreaterThan(0);
  });

  it('admits a targeted sinner only into an eligible clean room', () => {
    const state = createState();
    const inventory = { ...DEFAULT_INVENTORY };
    const applicant = state.characters.find(character => character.id === 'sim_applicant_marlow')!;
    const previousTrust = applicant.charlieTrust;

    expect(applyTaskCompletionEffect(
      createTask('new_sinner_intake', { assignedTo: 'charlie', targetId: applicant.id }),
      state,
      inventory
    )).toEqual({
      ok: true,
      message: 'Charlie Morningstar admitted Marlow Glass as an active resident; Charlie trust +5.'
    });
    expect(applicant).toMatchObject({
      status: 'resident',
      role: 'resident',
      charlieTrust: previousTrust + 5
    });
    expect(state.rooms.some(room => room.occupantIds?.includes(applicant.id))).toBe(true);
  });

  it('applies strategic reputation duties with their existing caps and costs', () => {
    const state = createState();
    const inventory = { ...DEFAULT_INVENTORY };

    expect(applyTaskCompletionEffect(createTask('media_response'), state, inventory).message)
      .toBe('Niffty issued a media response: sinner reputation +2, chaos -5, Vees influence -2.');
    expect(applyTaskCompletionEffect(createTask('heaven_watch'), state, inventory).message)
      .toBe('Niffty completed counter-surveillance: Heaven attention -3, internal trust +1.');
    expect(applyTaskCompletionEffect(createTask('vees_watch'), state, inventory).message)
      .toBe('Niffty disrupted a Vees signal relay: influence -4.');
    expect(applyTaskCompletionEffect(createTask('conflict_resolution'), state, inventory).message)
      .toBe('Niffty mediated a bar conflict: internal trust +4, media chaos -2, 1 bar supply consumed.');
    expect(applyTaskCompletionEffect(createTask('staff_briefing'), state, inventory).message)
      .toBe('Niffty completed the briefing; internal trust +3.');

    expect(state.reputation).toMatchObject({
      sinnerReputation: 17,
      mediaChaos: 33,
      veesInfluence: 64,
      heavenAttention: 32,
      internalTrust: 68
    });
    expect(inventory.bar).toBe(DEFAULT_INVENTORY.bar - 1);
  });
});
