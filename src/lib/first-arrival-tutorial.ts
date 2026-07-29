import {
  getHotelShiftCollectedCount,
  type HotelShiftGameState,
  type HotelShiftInput,
  type HotelShiftMission,
} from './hotel-shift';
import type { DatabaseState } from '../types';

export type FirstArrivalLessonId =
  | 'move'
  | 'jump'
  | 'dash'
  | 'markers'
  | 'contact'
  | 'stabilize'
  | 'complete';

export interface FirstArrivalLesson {
  id: FirstArrivalLessonId;
  eyebrow: string;
  objective: string;
  instruction: string;
}

export interface FirstArrivalTutorialProgress {
  lessonIndex: number;
  completedLessonIds: readonly FirstArrivalLessonId[];
}

export const FIRST_ARRIVAL_MISSION: HotelShiftMission = {
  id: 'tutorial:first-arrival:marlow',
  kind: 'practice',
  sourceId: 'sim_applicant_marlow',
  title: 'A Light at the Door',
  briefing: 'Charlie crosses the lobby to welcome a first arrival without making promises Heaven has not confirmed.',
  objective: 'Reach Marlow, gather the three welcome markers and steady the intake conversation.',
  interventionLabel: 'Keep the conversation inside Marlow’s comfort window.',
  rewardSummary: 'Marlow is safe, heard and ready for a formal intake.',
  playerId: 'charlie',
  partnerId: 'sim_applicant_marlow',
  targetLabel: 'Front desk',
  targetX: 87,
  durationMs: 10 * 60 * 1_000,
  interventionRequiredMs: 2_800,
  hazardCount: 1,
};

export const FIRST_ARRIVAL_LESSONS: readonly FirstArrivalLesson[] = [
  {
    id: 'move',
    eyebrow: '01 · Take the lead',
    objective: 'Cross the first part of the lobby.',
    instruction: 'Move with Q or A and D. On touch, hold the left or right edge.',
  },
  {
    id: 'jump',
    eyebrow: '02 · Clear the luggage',
    objective: 'Jump once without leaving Marlow waiting.',
    instruction: 'Press Z, W or Space. On touch, tap the upper half of the lobby.',
  },
  {
    id: 'markers',
    eyebrow: '03 · Prepare the welcome',
    objective: 'Collect all three glowing welcome markers.',
    instruction: 'Walk or jump through each marker. They represent a room key, water and the intake form.',
  },
  {
    id: 'dash',
    eyebrow: '04 · Move with purpose',
    objective: 'Dash toward the front desk.',
    instruction: 'Hold Shift while moving. On touch, double-tap an edge.',
  },
  {
    id: 'contact',
    eyebrow: '05 · Ask before acting',
    objective: 'Reach Marlow and begin the conversation.',
    instruction: 'Stand by the front desk, then press E or F. On touch, tap the center.',
  },
  {
    id: 'stabilize',
    eyebrow: '06 · Listen, do not promise',
    objective: 'Keep the balance needle inside the moving comfort window.',
    instruction: 'Use left and right. Progress rises while your response stays close to Marlow’s pace.',
  },
  {
    id: 'complete',
    eyebrow: 'Arrival complete',
    objective: 'Marlow is ready for a formal intake.',
    instruction: 'The hotel is now open. Your next objective will remain visible in the mission compass.',
  },
];

export function createFirstArrivalTutorialProgress(): FirstArrivalTutorialProgress {
  return {
    lessonIndex: 0,
    completedLessonIds: [],
  };
}

export function getFirstArrivalLesson(
  progress: FirstArrivalTutorialProgress,
): FirstArrivalLesson {
  return FIRST_ARRIVAL_LESSONS[
    Math.min(progress.lessonIndex, FIRST_ARRIVAL_LESSONS.length - 1)
  ];
}

function lessonIsComplete(
  lessonId: FirstArrivalLessonId,
  previousGame: HotelShiftGameState,
  game: HotelShiftGameState,
  input: HotelShiftInput,
): boolean {
  switch (lessonId) {
    case 'move':
      return Math.abs(game.playerX - 9) >= 8;
    case 'jump':
      return game.playerY >= 34 || previousGame.playerY >= 34;
    case 'dash':
      return input.dash && (input.left || input.right);
    case 'markers':
      return getHotelShiftCollectedCount(game) === game.pickups.length;
    case 'contact':
      return game.phase === 'intervention' || game.phase === 'success';
    case 'stabilize':
      return game.phase === 'success';
    case 'complete':
      return false;
  }
}

export function advanceFirstArrivalTutorial(
  progress: FirstArrivalTutorialProgress,
  previousGame: HotelShiftGameState,
  game: HotelShiftGameState,
  input: HotelShiftInput,
): FirstArrivalTutorialProgress {
  const lesson = getFirstArrivalLesson(progress);
  if (!lessonIsComplete(lesson.id, previousGame, game, input)) return progress;
  if (progress.lessonIndex >= FIRST_ARRIVAL_LESSONS.length - 1) return progress;

  return {
    lessonIndex: progress.lessonIndex + 1,
    completedLessonIds: [...progress.completedLessonIds, lesson.id],
  };
}

export function getFirstArrivalTutorialPercent(
  progress: FirstArrivalTutorialProgress,
): number {
  return Math.round(
    (Math.min(progress.lessonIndex, FIRST_ARRIVAL_LESSONS.length - 1)
      / (FIRST_ARRIVAL_LESSONS.length - 1))
      * 100,
  );
}

/**
 * Commits only Simulation AU hotel operations. It admits Marlow to the room he
 * explicitly chose during play; it does not assert redemption or alter canon.
 */
export function applyFirstArrivalCompletion(state: DatabaseState): void {
  if (!state.gameplayMeta) {
    throw new Error('Gameplay metadata is unavailable.');
  }
  state.gameplayMeta.narrativeFlags = [
    ...new Set([
      ...state.gameplayMeta.narrativeFlags,
      'hotel-prologue:complete',
      'hotel-shift:campaign-unlocked',
    ]),
  ];
  state.gameplayMeta.completedMilestones = [
    ...new Set([
      ...state.gameplayMeta.completedMilestones,
      'first-arrival:sim_applicant_marlow',
    ]),
  ];

  const marlow = state.characters.find(
    character => character.id === 'sim_applicant_marlow',
  );
  if (marlow) {
    marlow.role = 'resident';
    marlow.status = 'resident';
    marlow.charlieTrust = Math.max(marlow.charlieTrust, 35);
    const arrivalNote = 'Chose room 102 after the consent-led first-arrival tutorial.';
    if (!marlow.notes.includes(arrivalNote)) {
      marlow.notes = `${marlow.notes} ${arrivalNote}`;
    }
  }

  const room = state.rooms.find(candidate => candidate.number === '102');
  if (room && (!room.occupantId || room.occupantId === 'sim_applicant_marlow')) {
    room.occupantId = 'sim_applicant_marlow';
    room.occupantIds = ['sim_applicant_marlow'];
    room.maintenanceNotes = 'Prepared and chosen by Marlow during the Simulation AU first-arrival tutorial.';
  }

  const intakeTask = state.staffTasks.find(task => task.id === 't3');
  if (intakeTask) {
    intakeTask.status = 'completed';
    intakeTask.notes = 'Completed through the consent-led first-arrival playable tutorial.';
    state.gameplayMeta.appliedTaskIds = [
      ...new Set([...state.gameplayMeta.appliedTaskIds, intakeTask.id]),
    ];
  }
}
