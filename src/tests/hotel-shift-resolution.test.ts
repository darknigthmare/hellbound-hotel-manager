import { describe, expect, it } from 'vitest';
import { getSeedData } from '../db/seed';
import {
  DEFAULT_GAMEPLAY_META,
  DEFAULT_INVENTORY,
  type InventoryBackup,
} from '../lib/export-import';
import {
  applyHotelShiftFailure,
  applyHotelShiftMissionCompletion,
  hotelShiftCompletionMarker,
  hotelShiftFailureMarker,
} from '../lib/hotel-shift-resolution';
import type { HotelShiftMission } from '../lib/hotel-shift';
import type { DatabaseState, Incident, StaffTask } from '../types';

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

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
    staffFatigue: {},
  };
  return state;
}

function createInventory(
  overrides: Partial<InventoryBackup> = {},
): InventoryBackup {
  return {
    ...DEFAULT_INVENTORY,
    ...overrides,
  };
}

function createMission(
  kind: HotelShiftMission['kind'],
  overrides: Partial<HotelShiftMission> = {},
): HotelShiftMission {
  return {
    id: `test:${kind}`,
    kind,
    sourceId: null,
    title: 'Test active objective',
    briefing: 'Simulation AU test briefing.',
    objective: 'Complete the active objective.',
    interventionLabel: 'Hold the safe intervention window.',
    rewardSummary: 'Apply the documented operational consequence.',
    playerId: 'vaggie',
    partnerId: 'charlie',
    targetLabel: 'Hotel lobby',
    targetX: 85,
    durationMs: 75_000,
    interventionRequiredMs: 3_000,
    hazardCount: 2,
    ...overrides,
  };
}

function canonAndRoomProjection(state: DatabaseState) {
  return {
    timeline: cloneJson(state.timeline),
    characters: state.characters.map(character => ({
      id: character.id,
      type: character.type,
      status: character.status,
      timelineScope: character.timelineScope,
      timelineStates: character.timelineStates
        ? cloneJson(character.timelineStates)
        : undefined,
    })),
    rooms: cloneJson(state.rooms),
  };
}

function canonProjection(state: DatabaseState) {
  const projection = canonAndRoomProjection(state);
  return {
    timeline: projection.timeline,
    characters: projection.characters,
  };
}

function markerCount(state: DatabaseState, marker: string): number {
  return state.gameplayMeta!.completedMilestones.filter(
    candidate => candidate === marker,
  ).length;
}

describe('Hotel Shift durable resolution', () => {
  it('applies an incident consequence exactly once without mutating canon or rooms', () => {
    const state = createState();
    const inventory = createInventory();
    const incident: Incident = {
      id: 'test_active_incident',
      date: 'Campaign Day 7',
      location: 'Hotel lobby',
      residentsInvolved: ['angeldust'],
      type: 'staff_conflict',
      severity: 'high',
      summary: 'A resident dispute needs active containment.',
      consequences: 'Hotel operations are disrupted.',
      repairCost: 0,
      reputationImpact: -5,
      trustImpact: -4,
      actionTaken: '',
      status: 'open',
      loreLink: null,
      tags: ['simulation_au'],
    };
    state.incidents = [incident];
    state.reputation.internalTrust = 50;
    state.reputation.mediaChaos = 20;
    const mission = createMission('incident', {
      id: `incident:${incident.id}`,
      sourceId: incident.id,
    });
    const immutableBefore = canonAndRoomProjection(state);

    const first = applyHotelShiftMissionCompletion(mission, state, inventory);

    expect(first.ok).toBe(true);
    expect(incident).toMatchObject({
      status: 'resolved',
      resolvedDay: 7,
    });
    expect(incident.actionTaken).toContain(mission.playerId);
    expect(state.reputation).toMatchObject({
      internalTrust: 53,
      mediaChaos: 16,
    });
    expect(state.gameplayMeta!.resolvedIncidentIds).toEqual([incident.id]);
    expect(markerCount(state, hotelShiftCompletionMarker(mission))).toBe(1);
    expect(canonAndRoomProjection(state)).toEqual(immutableBefore);
    expect(inventory).toEqual(DEFAULT_INVENTORY);

    const afterFirst = cloneJson({ state, inventory });
    const second = applyHotelShiftMissionCompletion(mission, state, inventory);

    expect(second.ok).toBe(false);
    expect({ state, inventory }).toEqual(afterFirst);
    expect(state.gameplayMeta!.resolvedIncidentIds).toEqual([incident.id]);
    expect(markerCount(state, hotelShiftCompletionMarker(mission))).toBe(1);
  });

  it('applies a task effect, inventory cost and fatigue exactly once', () => {
    const state = createState();
    const inventory = createInventory({ bar: 1 });
    const task: StaffTask = {
      id: 'test_conflict_mediation',
      date: 'Campaign Day 7',
      title: 'Mediate a bar conflict',
      type: 'conflict_resolution',
      assignedTo: 'husk',
      mentalWorkload: 5,
      status: 'in_progress',
      notes: 'Simulation AU operational duty.',
      createdDay: 7,
      availableOnDay: 7,
    };
    state.staffTasks = [task];
    state.reputation.internalTrust = 40;
    state.reputation.mediaChaos = 12;
    const mission = createMission('task', {
      id: `task:${task.id}`,
      sourceId: task.id,
      playerId: task.assignedTo,
    });
    const immutableBefore = canonAndRoomProjection(state);

    const first = applyHotelShiftMissionCompletion(mission, state, inventory);

    expect(first.ok).toBe(true);
    expect(task.status).toBe('completed');
    expect(inventory.bar).toBe(0);
    expect(state.reputation).toMatchObject({
      internalTrust: 44,
      mediaChaos: 10,
    });
    expect(state.gameplayMeta!.staffFatigue.husk).toBe(2);
    expect(state.gameplayMeta!.appliedTaskIds).toEqual([task.id]);
    expect(markerCount(state, hotelShiftCompletionMarker(mission))).toBe(1);
    expect(canonAndRoomProjection(state)).toEqual(immutableBefore);

    const afterFirst = cloneJson({ state, inventory });
    const second = applyHotelShiftMissionCompletion(mission, state, inventory);

    expect(second.ok).toBe(false);
    expect({ state, inventory }).toEqual(afterFirst);
    expect(state.gameplayMeta!.appliedTaskIds).toEqual([task.id]);
    expect(markerCount(state, hotelShiftCompletionMarker(mission))).toBe(1);
  });

  it('does not leave partial success state when a task effect is rejected', () => {
    const state = createState();
    const inventory = createInventory({ bar: 0 });
    const task: StaffTask = {
      id: 'test_blocked_mediation',
      date: 'Campaign Day 7',
      title: 'Blocked mediation',
      type: 'conflict_resolution',
      assignedTo: 'husk',
      mentalWorkload: 5,
      status: 'in_progress',
      notes: '',
      availableOnDay: 7,
    };
    state.staffTasks = [task];
    const mission = createMission('task', {
      id: `task:${task.id}`,
      sourceId: task.id,
      playerId: task.assignedTo,
    });
    const before = cloneJson({ state, inventory });

    const result = applyHotelShiftMissionCompletion(mission, state, inventory);

    expect(result.ok).toBe(false);
    expect({ state, inventory }).toEqual(before);
    expect(task.status).toBe('in_progress');
    expect(state.gameplayMeta!.appliedTaskIds).toEqual([]);
    expect(markerCount(state, hotelShiftCompletionMarker(mission))).toBe(0);
  });

  it('advances a patrol day as one exactly-once campaign operation', () => {
    const state = createState();
    const inventory = createInventory();
    state.incidents = [];
    state.relationships = [];
    state.reputation = {
      sinnerReputation: 40,
      redemptionCredibility: 45,
      internalTrust: 50,
      heavenAttention: 40,
      overlordHostility: 40,
      veesInfluence: 40,
      mediaChaos: 40,
    };
    state.gameplayMeta!.staffFatigue.charlie = 4;
    const mission = createMission('patrol', {
      id: 'patrol:campaign-day-7',
      playerId: 'charlie',
    });
    const immutableBefore = canonAndRoomProjection(state);
    const ledgerLengthBefore = state.resourceLedger.length;

    const first = applyHotelShiftMissionCompletion(mission, state, inventory);

    expect(first.ok).toBe(true);
    expect(state.gameplayMeta!.campaignDay).toBe(8);
    expect(state.gameplayMeta!.staffFatigue.charlie).toBe(2);
    expect(state.reputation).toMatchObject({
      internalTrust: 52,
      redemptionCredibility: 46,
    });
    expect(state.resourceLedger).toHaveLength(ledgerLengthBefore + 1);
    expect(state.resourceLedger.at(-1)).toMatchObject({
      id: 'daily_upkeep_8',
      date: 'Campaign Day 8',
      type: 'expense',
      category: 'food_beverage',
    });
    expect(markerCount(state, 'hotel-shift:patrol:7')).toBe(1);
    expect(markerCount(state, hotelShiftCompletionMarker(mission))).toBe(1);
    expect(canonAndRoomProjection(state)).toEqual(immutableBefore);
    expect(inventory).toEqual(DEFAULT_INVENTORY);

    const afterFirst = cloneJson({ state, inventory });
    const second = applyHotelShiftMissionCompletion(mission, state, inventory);

    expect(second.ok).toBe(false);
    expect({ state, inventory }).toEqual(afterFirst);
    expect(state.gameplayMeta!.campaignDay).toBe(8);
    expect(state.resourceLedger.filter(entry => entry.id === 'daily_upkeep_8')).toHaveLength(1);
  });

  it('bounds and records a failure once per mission and campaign day', () => {
    const state = createState();
    state.gameplayMeta!.staffFatigue.husk = 99;
    state.reputation.internalTrust = 0;
    const sourceIncident = cloneJson(state.incidents[0]);
    const mission = createMission('incident', {
      id: 'incident:failed-objective',
      sourceId: sourceIncident?.id ?? null,
      playerId: 'husk',
    });
    const immutableBefore = canonAndRoomProjection(state);
    const marker = hotelShiftFailureMarker(mission, 7);

    const first = applyHotelShiftFailure(mission, state);

    expect(first.ok).toBe(true);
    expect(state.gameplayMeta!.staffFatigue.husk).toBe(100);
    expect(state.reputation.internalTrust).toBe(0);
    expect(markerCount(state, marker)).toBe(1);
    expect(canonAndRoomProjection(state)).toEqual(immutableBefore);
    expect(state.incidents[0]).toEqual(sourceIncident);

    const afterFirst = cloneJson(state);
    const second = applyHotelShiftFailure(mission, state);

    expect(second.ok).toBe(true);
    expect(second.message).toContain('already recorded');
    expect(state).toEqual(afterFirst);
    expect(markerCount(state, marker)).toBe(1);
  });

  it('changes only the targeted room during a room mission', () => {
    const state = createState();
    const inventory = createInventory({ clean: 2 });
    const targetRoom = state.rooms.find(room => room.number === '101')!;
    targetRoom.status = 'messy';
    const mission = createMission('room', {
      id: `room:${targetRoom.number}:messy`,
      sourceId: targetRoom.number,
      playerId: 'niffty',
    });
    const canonBefore = canonProjection(state);
    const unrelatedRoomsBefore = cloneJson(
      state.rooms.filter(room => room.number !== targetRoom.number),
    );

    const first = applyHotelShiftMissionCompletion(mission, state, inventory);

    expect(first.ok).toBe(true);
    expect(targetRoom).toMatchObject({
      status: 'clean',
      lastInspectionDate: 'Campaign Day 7',
      lastInspectedBy: 'niffty',
    });
    expect(inventory.clean).toBe(1);
    expect(canonProjection(state)).toEqual(canonBefore);
    expect(state.rooms.filter(room => room.number !== targetRoom.number))
      .toEqual(unrelatedRoomsBefore);

    const afterFirst = cloneJson({ state, inventory });
    const second = applyHotelShiftMissionCompletion(mission, state, inventory);

    expect(second.ok).toBe(false);
    expect({ state, inventory }).toEqual(afterFirst);
    expect(markerCount(state, hotelShiftCompletionMarker(mission))).toBe(1);
  });
});
