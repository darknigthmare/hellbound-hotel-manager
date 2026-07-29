import { describe, expect, it } from 'vitest';
import {
  advanceFirstArrivalTutorial,
  applyFirstArrivalCompletion,
  createFirstArrivalTutorialProgress,
  FIRST_ARRIVAL_MISSION,
  getFirstArrivalLesson,
  getFirstArrivalTutorialPercent,
  type FirstArrivalTutorialProgress,
} from '../lib/first-arrival-tutorial';
import { getSeedData } from '../db/seed';
import { DEFAULT_GAMEPLAY_META } from '../lib/export-import';
import {
  createHotelShiftGameState,
  type HotelShiftGameState,
  type HotelShiftInput,
} from '../lib/hotel-shift';

const IDLE_INPUT: HotelShiftInput = {
  left: false,
  right: false,
  dash: false,
  jumpPressed: false,
  interactPressed: false,
};

function state(
  overrides: Partial<HotelShiftGameState> = {},
): HotelShiftGameState {
  return {
    ...createHotelShiftGameState(FIRST_ARRIVAL_MISSION),
    ...overrides,
  };
}

describe('first arrival tutorial', () => {
  it('starts with one clear movement objective', () => {
    const progress = createFirstArrivalTutorialProgress();

    expect(getFirstArrivalLesson(progress)).toMatchObject({
      id: 'move',
      objective: 'Cross the first part of the lobby.',
    });
    expect(getFirstArrivalTutorialPercent(progress)).toBe(0);
  });

  it('advances only after the active mechanic has been performed', () => {
    let progress = createFirstArrivalTutorialProgress();
    const start = state();

    progress = advanceFirstArrivalTutorial(
      progress,
      start,
      state({ playerX: 17.1 }),
      { ...IDLE_INPUT, right: true },
    );
    expect(getFirstArrivalLesson(progress).id).toBe('jump');

    progress = advanceFirstArrivalTutorial(
      progress,
      state({ playerX: 17.1 }),
      state({ playerX: 17.1, playerY: 40 }),
      { ...IDLE_INPUT, jumpPressed: true },
    );
    expect(getFirstArrivalLesson(progress).id).toBe('markers');

    progress = advanceFirstArrivalTutorial(
      progress,
      state({ playerY: 40 }),
      state({
        pickups: state().pickups.map(marker => ({ ...marker, collected: true })),
      }),
      IDLE_INPUT,
    );
    expect(getFirstArrivalLesson(progress).id).toBe('dash');
  });

  it('requires markers, contact and a completed stabilization in order', () => {
    let progress: FirstArrivalTutorialProgress = {
      lessonIndex: 2,
      completedLessonIds: ['move', 'jump'],
    };
    const base = state();
    const allMarkers = base.pickups.map(marker => ({ ...marker, collected: true }));

    progress = advanceFirstArrivalTutorial(
      progress,
      base,
      state({ pickups: allMarkers }),
      IDLE_INPUT,
    );
    expect(getFirstArrivalLesson(progress).id).toBe('dash');

    progress = advanceFirstArrivalTutorial(
      progress,
      state({ pickups: allMarkers }),
      state({ pickups: allMarkers, velocityX: 20 }),
      { ...IDLE_INPUT, right: true, dash: true },
    );
    expect(getFirstArrivalLesson(progress).id).toBe('contact');

    progress = advanceFirstArrivalTutorial(
      progress,
      state({ pickups: allMarkers }),
      state({ pickups: allMarkers, phase: 'intervention' }),
      { ...IDLE_INPUT, interactPressed: true },
    );
    expect(getFirstArrivalLesson(progress).id).toBe('stabilize');

    progress = advanceFirstArrivalTutorial(
      progress,
      state({ phase: 'intervention' }),
      state({ phase: 'success' }),
      IDLE_INPUT,
    );
    expect(getFirstArrivalLesson(progress).id).toBe('complete');
    expect(getFirstArrivalTutorialPercent(progress)).toBe(100);
  });

  it('commits the consent-led arrival as an idempotent Simulation AU operation', () => {
    const saved = {
      ...getSeedData(),
      gameplayMeta: JSON.parse(JSON.stringify(DEFAULT_GAMEPLAY_META)),
    };

    applyFirstArrivalCompletion(saved);
    applyFirstArrivalCompletion(saved);

    expect(saved.characters.find(character => (
      character.id === 'sim_applicant_marlow'
    ))).toMatchObject({
      role: 'resident',
      status: 'resident',
      canonStatus: 'simulation_au',
      charlieTrust: 35,
    });
    expect(saved.rooms.find(room => room.number === '102')?.occupantId)
      .toBe('sim_applicant_marlow');
    expect(saved.staffTasks.find(task => task.id === 't3')?.status)
      .toBe('completed');
    expect(saved.gameplayMeta.completedMilestones)
      .toContain('first-arrival:sim_applicant_marlow');
    expect(
      saved.characters
        .find(character => character.id === 'sim_applicant_marlow')
        ?.notes.match(/Chose room 102/g),
    ).toHaveLength(1);
  });
});
