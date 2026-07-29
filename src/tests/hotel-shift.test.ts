import { describe, expect, it } from 'vitest';
import { getSeedData } from '../db/seed';
import { DEFAULT_GAMEPLAY_META } from '../lib/export-import';
import {
  createHotelShiftGameState,
  getHotelShiftCollectedCount,
  getHotelShiftInput,
  hashHotelShiftSeed,
  selectHotelShiftMission,
  stepHotelShift,
  type HotelShiftGameState,
  type HotelShiftInput,
  type HotelShiftMission,
} from '../lib/hotel-shift';
import type {
  Character,
  DatabaseState,
  Incident,
  StaffTask,
} from '../types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function controlledState(): DatabaseState {
  const state = clone(getSeedData());
  state.incidents = [];
  state.staffTasks = [];
  state.rooms = state.rooms.map(room => ({
    ...room,
    status: 'clean',
    repairCost: 0,
  }));
  state.gameplayMeta = clone(DEFAULT_GAMEPLAY_META);
  state.gameplayMeta.campaignDay = 7;
  return state;
}

function incident(
  id: string,
  severity: Incident['severity'],
  status: Incident['status'] = 'open',
): Incident {
  return {
    id,
    date: 'Campaign Day 7',
    location: `Checkpoint ${id}`,
    residentsInvolved: [],
    type: 'sabotage',
    severity,
    summary: `${severity} controlled incident`,
    consequences: 'Operational pressure',
    repairCost: 0,
    reputationImpact: -1,
    trustImpact: -1,
    actionTaken: '',
    status,
    loreLink: null,
    tags: ['simulation_au'],
  };
}

function task(
  id: string,
  status: StaffTask['status'] = 'pending',
  availableOnDay = 7,
): StaffTask {
  return {
    id,
    date: 'Campaign Day 7',
    title: `Duty ${id}`,
    type: 'staff_briefing',
    assignedTo: 'husk',
    mentalWorkload: 2,
    status,
    notes: 'Controlled active-shift duty',
    targetId: null,
    createdDay: 6,
    availableOnDay,
  };
}

function mission(
  overrides: Partial<HotelShiftMission> = {},
): HotelShiftMission {
  return {
    id: 'test:hotel-shift',
    kind: 'patrol',
    sourceId: null,
    title: 'Controlled hotel shift',
    briefing: 'Controlled Simulation AU test shift.',
    objective: 'Collect every marker and stabilize the checkpoint.',
    interventionLabel: 'Keep the operation stable.',
    rewardSummary: 'The controlled objective is complete.',
    playerId: 'charlie',
    partnerId: 'vaggie',
    targetLabel: 'Reception',
    targetX: 86,
    durationMs: 10_000,
    interventionRequiredMs: 3_000,
    hazardCount: 0,
    ...overrides,
  };
}

function character(state: DatabaseState, id: string): Character {
  const result = state.characters.find(candidate => candidate.id === id);
  if (!result) throw new Error(`Missing controlled character '${id}'.`);
  return result;
}

const IDLE_INPUT: HotelShiftInput = {
  left: false,
  right: false,
  dash: false,
  jumpPressed: false,
  interactPressed: false,
};

describe('Hotel Shift mission selection', () => {
  it('applies the complete source priority and deterministic tie breakers', () => {
    const state = controlledState();
    state.incidents = [
      incident('incident_z', 'crisis'),
      incident('incident_high', 'high'),
      incident('incident_a', 'crisis'),
      incident('incident_medium', 'medium'),
    ];
    state.staffTasks = [
      task('task_pending_a', 'pending', 4),
      task('task_running_z', 'in_progress', 7),
    ];

    const urgentMission = selectHotelShiftMission(state);
    expect(urgentMission).toMatchObject({
      id: 'incident:incident_a',
      kind: 'incident',
      sourceId: 'incident_a',
      playerId: 'vaggie',
    });

    const reordered = clone(state);
    reordered.incidents.reverse();
    reordered.staffTasks.reverse();
    expect(selectHotelShiftMission(reordered)).toEqual(urgentMission);

    state.incidents = [incident('incident_medium', 'medium')];
    expect(selectHotelShiftMission(state)).toMatchObject({
      id: 'task:task_running_z',
      kind: 'task',
    });

    state.gameplayMeta!.appliedTaskIds = [
      'task_pending_a',
      'task_running_z',
    ];
    expect(selectHotelShiftMission(state)).toMatchObject({
      id: 'incident:incident_medium',
      kind: 'incident',
    });

    state.incidents = [];
    const [firstRoom, secondRoom] = state.rooms;
    if (!firstRoom || !secondRoom) throw new Error('The controlled seed needs two rooms.');
    firstRoom.status = 'messy';
    secondRoom.status = 'damaged';
    expect(selectHotelShiftMission(state)).toMatchObject({
      id: `room:${secondRoom.number}:damaged`,
      kind: 'room',
      playerId: 'vaggie',
    });

    firstRoom.status = 'clean';
    secondRoom.status = 'clean';
    expect(selectHotelShiftMission(state)).toMatchObject({
      id: 'patrol:7',
      kind: 'patrol',
      playerId: 'charlie',
    });

    state.gameplayMeta!.completedMilestones.push('hotel-shift:patrol:7');
    expect(selectHotelShiftMission(state)).toMatchObject({
      id: 'practice:7',
      kind: 'practice',
    });
  });

  it('projects avatar and partner status to the selected timeline', () => {
    const state = controlledState();
    state.timeline.current = 'season_1_end';
    const husk = character(state, 'husk');
    const angel = character(state, 'angeldust');
    husk.status = 'external';
    husk.timelineStates = {
      ...husk.timelineStates,
      season_1_end: { status: 'staff' },
    };
    angel.status = 'resident';
    angel.timelineStates = {
      ...angel.timelineStates,
      season_1_end: { status: 'redeemed' },
    };
    state.staffTasks = [{
      ...task('task_projection', 'in_progress'),
      assignedTo: husk.id,
      type: 'rehab_prep',
      targetId: angel.id,
    }];

    const projectedMission = selectHotelShiftMission(state);
    expect(projectedMission).toMatchObject({
      playerId: 'husk',
      partnerId: 'charlie',
      targetLabel: angel.name,
    });
    expect(husk.status).toBe('external');
    expect(angel.status).toBe('resident');

    const customTimeline = clone(state);
    customTimeline.timeline.current = 'custom';
    expect(selectHotelShiftMission(customTimeline)).toMatchObject({
      playerId: 'vaggie',
      partnerId: 'angeldust',
    });
  });
});

describe('Hotel Shift movement and world interaction', () => {
  it('maps QWERTY and AZERTY movement to the same deterministic motion', () => {
    const selectedMission = mission();
    const base = {
      ...createHotelShiftGameState(selectedMission),
      playerX: 50,
      pickups: [],
      hazards: [],
    };
    const azertyInput = getHotelShiftInput(new Set(['KeyQ', 'ShiftLeft']));
    const qwertyInput = getHotelShiftInput(new Set(['KeyA', 'ShiftLeft']));
    const rightInput = getHotelShiftInput(new Set(['KeyD']));

    expect(azertyInput).toEqual(qwertyInput);
    expect(azertyInput).toMatchObject({
      left: true,
      right: false,
      dash: true,
    });

    const azerty = stepHotelShift(base, selectedMission, azertyInput, 160);
    const qwerty = stepHotelShift(base, selectedMission, qwertyInput, 160);
    const right = stepHotelShift(base, selectedMission, rightInput, 160);
    expect(azerty).toEqual(qwerty);
    expect(azerty.playerX).toBeLessThan(base.playerX);
    expect(azerty.facing).toBe('left');
    expect(right.playerX).toBeGreaterThan(base.playerX);
    expect(right.facing).toBe('right');
  });

  it('consumes a jump pulse once and returns the avatar safely to ground', () => {
    const selectedMission = mission();
    const base = {
      ...createHotelShiftGameState(selectedMission),
      playerX: 50,
      pickups: [],
      hazards: [],
    };
    const jumpInput = getHotelShiftInput(new Set(['KeyD']), {
      jumpPressed: true,
      interactPressed: false,
    });

    const airborne = stepHotelShift(base, selectedMission, jumpInput, 16);
    expect(airborne.playerY).toBeGreaterThan(0);
    expect(airborne.velocityY).toBeGreaterThan(0);

    const batched = stepHotelShift(base, selectedMission, jumpInput, 160);
    let partitioned = airborne;
    for (let index = 1; index < 10; index += 1) {
      partitioned = stepHotelShift(
        partitioned,
        selectedMission,
        { ...jumpInput, jumpPressed: false },
        16,
      );
    }
    expect(batched).toEqual(partitioned);

    let landed = partitioned;
    for (let index = 0; index < 80; index += 1) {
      landed = stepHotelShift(landed, selectedMission, IDLE_INPUT, 16);
    }
    expect(landed.playerY).toBe(0);
    expect(landed.velocityY).toBe(0);
  });

  it('collects each operation marker only once', () => {
    const selectedMission = mission();
    const base = {
      ...createHotelShiftGameState(selectedMission),
      hazards: [],
    };
    const firstPickup = base.pickups[0];
    if (!firstPickup) throw new Error('The controlled mission needs a pickup.');
    const atPickup = {
      ...base,
      playerX: firstPickup.x,
      playerY: firstPickup.y,
      score: 0,
    };

    const collected = stepHotelShift(
      atPickup,
      selectedMission,
      IDLE_INPUT,
      1,
    );
    expect(getHotelShiftCollectedCount(collected)).toBe(1);
    expect(collected.pickups[0]?.collected).toBe(true);
    expect(collected.score).toBe(250);
    expect(collected.message).toBe('Operation marker secured.');

    const repeated = stepHotelShift(
      collected,
      selectedMission,
      IDLE_INPUT,
      1,
    );
    expect(getHotelShiftCollectedCount(repeated)).toBe(1);
    expect(repeated.score).toBe(250);
  });

  it('refuses checkpoint interaction until every marker is collected', () => {
    const selectedMission = mission();
    const base = {
      ...createHotelShiftGameState(selectedMission),
      playerX: selectedMission.targetX,
      hazards: [],
    };
    const interaction = {
      ...IDLE_INPUT,
      interactPressed: true,
    };

    const refused = stepHotelShift(
      base,
      selectedMission,
      interaction,
      1,
    );
    expect(refused.phase).toBe('playing');
    expect(refused.message).toContain('marker first (0/3)');

    const ready = {
      ...base,
      pickups: base.pickups.map(pickup => ({
        ...pickup,
        collected: true,
      })),
    };
    const intervention = stepHotelShift(
      ready,
      selectedMission,
      interaction,
      1,
    );
    expect(intervention.phase).toBe('intervention');
    expect(intervention.velocityX).toBe(0);
    expect(intervention.message).toBe(selectedMission.interventionLabel);
  });
});

describe('Hotel Shift intervention challenge', () => {
  it('reaches success when the balance remains inside the stable window', () => {
    const selectedMission = mission({
      id: 'test:challenge-success',
      interventionRequiredMs: 16,
    });
    const seedPhase = (
      hashHotelShiftSeed(selectedMission.id) % 628
    ) / 100;
    const predictedTarget = Math.sin(16 / 760 + seedPhase) * 0.58;
    const predictedDrift = Math.sin(16 / 390 + seedPhase * 0.5) * 0.22;
    const base = {
      ...createHotelShiftGameState(selectedMission),
      phase: 'intervention' as const,
      interventionBalance: predictedTarget - predictedDrift * 0.016,
      pickups: [],
      hazards: [],
    };

    const success = stepHotelShift(
      base,
      selectedMission,
      IDLE_INPUT,
      16,
    );
    expect(success.phase).toBe('success');
    expect(success.interventionProgressMs).toBe(16);
    expect(success.score).toBeGreaterThan(0);
    expect(success.message).toContain(selectedMission.rewardSummary);
  });

  it('fails safely when time or composure is depleted', () => {
    const selectedMission = mission({ kind: 'incident' });
    const base = {
      ...createHotelShiftGameState(selectedMission),
      playerX: 50,
      pickups: [],
      hazards: [],
    };

    const timedOut = stepHotelShift(
      { ...base, timeLeftMs: 8 },
      selectedMission,
      IDLE_INPUT,
      16,
    );
    expect(timedOut.phase).toBe('failure');
    expect(timedOut.timeLeftMs).toBe(0);
    expect(timedOut.message).toContain('window expired');

    const composureLost = stepHotelShift(
      {
        ...base,
        resolve: 1,
        hazards: [{
          id: 'controlled-pressure',
          x: base.playerX,
          direction: 1,
          speed: 0,
        }],
      },
      selectedMission,
      IDLE_INPUT,
      1,
    );
    expect(composureLost.phase).toBe('failure');
    expect(composureLost.resolve).toBe(0);
    expect(composureLost.message).toContain('Composure depleted');
  });

  it('is invariant between a batched frame and fixed-step partitions', () => {
    const selectedMission = mission({
      id: 'test:partition-invariance',
      interventionRequiredMs: 10_000,
      hazardCount: 2,
    });
    const worldState = {
      ...createHotelShiftGameState(selectedMission),
      playerX: 50,
    };
    const movementInput = {
      ...IDLE_INPUT,
      right: true,
      dash: true,
    };

    const batchedWorld = stepHotelShift(
      worldState,
      selectedMission,
      movementInput,
      160,
    );
    let partitionedWorld: HotelShiftGameState = worldState;
    for (let index = 0; index < 10; index += 1) {
      partitionedWorld = stepHotelShift(
        partitionedWorld,
        selectedMission,
        movementInput,
        16,
      );
    }
    expect(partitionedWorld).toEqual(batchedWorld);

    const interventionState = {
      ...worldState,
      phase: 'intervention' as const,
      interventionBalance: -0.25,
      hazards: [],
    };
    const challengeInput = {
      ...IDLE_INPUT,
      right: true,
    };
    const batchedChallenge = stepHotelShift(
      interventionState,
      selectedMission,
      challengeInput,
      160,
    );
    let partitionedChallenge: HotelShiftGameState = interventionState;
    for (let index = 0; index < 10; index += 1) {
      partitionedChallenge = stepHotelShift(
        partitionedChallenge,
        selectedMission,
        challengeInput,
        16,
      );
    }
    expect(partitionedChallenge).toEqual(batchedChallenge);
  });
});
