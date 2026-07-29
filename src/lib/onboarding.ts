import type {
  OnboardingCompletionReason,
  OnboardingPhase,
  OnboardingState
} from '../types';

export const ONBOARDING_DATA_VERSION = 1;

/**
 * Stable gameplay event IDs used by the guided first shift. Screens may supply
 * a different ordered list to completeOnboardingObjective for future chapters.
 */
export const FIRST_SHIFT_OBJECTIVE_IDS = [
  'move',
  'jump',
  'markers',
  'dash',
  'contact',
  'stabilize',
  'complete'
] as const;

export type FirstShiftObjectiveId = typeof FIRST_SHIFT_OBJECTIVE_IDS[number];

export interface AdvanceOnboardingSceneOptions {
  nextSceneId?: string | null;
  nextPhase?: OnboardingPhase;
  firstObjectiveId?: string;
  campaignDay?: number;
}

export interface OnboardingProgress {
  phase: OnboardingPhase;
  activeObjectiveId: string | null;
  completedObjectives: number;
  totalObjectives: number;
  percent: number;
  isComplete: boolean;
}

function assertCampaignDay(campaignDay: number): void {
  if (!Number.isInteger(campaignDay) || campaignDay < 1) {
    throw new Error('Onboarding campaign day must be a positive integer.');
  }
}

function assertStableId(id: string, label: string): void {
  if (id.trim().length === 0) throw new Error(`${label} must not be empty.`);
}

function appendUnique(values: string[], value: string): string[] {
  return values.includes(value) ? [...values] : [...values, value];
}

function inProgress(state: OnboardingState, campaignDay: number): OnboardingState {
  assertCampaignDay(campaignDay);
  return {
    ...state,
    status: 'in_progress',
    startedCampaignDay: state.startedCampaignDay ?? campaignDay,
    completedCampaignDay: null,
    completionReason: null
  };
}

export function createFreshOnboardingState(): OnboardingState {
  return {
    dataVersion: ONBOARDING_DATA_VERSION,
    phase: 'intro',
    status: 'not_started',
    currentSceneId: null,
    completedSceneIds: [],
    activeObjectiveId: null,
    completedObjectiveIds: [],
    startedCampaignDay: null,
    completedCampaignDay: null,
    completionReason: null
  };
}

/**
 * Migration state for saves made before onboarding existed. It deliberately
 * avoids forcing established players through a first-arrival sequence.
 */
export function createCompletedOnboardingState(
  campaignDay: number,
  reason: Exclude<OnboardingCompletionReason, null> = 'legacy_save'
): OnboardingState {
  assertCampaignDay(campaignDay);
  return {
    dataVersion: ONBOARDING_DATA_VERSION,
    phase: 'complete',
    status: 'completed',
    currentSceneId: null,
    completedSceneIds: [],
    activeObjectiveId: null,
    completedObjectiveIds: [],
    startedCampaignDay: campaignDay,
    completedCampaignDay: campaignDay,
    completionReason: reason
  };
}

export function startOnboarding(
  state: OnboardingState,
  firstSceneId: string,
  campaignDay = 1
): OnboardingState {
  if (state.phase === 'complete') return state;
  assertStableId(firstSceneId, 'Onboarding scene ID');
  const started = inProgress(state, campaignDay);
  return {
    ...started,
    phase: 'intro',
    currentSceneId: firstSceneId,
    activeObjectiveId: null
  };
}

/**
 * Records a viewed scene and points at the next narrative beat. Entering the
 * tutorial arms its first live objective without coupling save data to a page.
 */
export function advanceOnboardingScene(
  state: OnboardingState,
  completedSceneId: string,
  options: AdvanceOnboardingSceneOptions = {}
): OnboardingState {
  if (state.phase === 'complete') return state;
  assertStableId(completedSceneId, 'Completed onboarding scene ID');
  const campaignDay = options.campaignDay ?? state.startedCampaignDay ?? 1;
  const nextPhase = options.nextPhase ?? state.phase;

  if (nextPhase === 'complete') {
    return completeOnboarding({
      ...state,
      completedSceneIds: appendUnique(state.completedSceneIds, completedSceneId)
    }, campaignDay);
  }

  const started = inProgress(state, campaignDay);
  const firstObjectiveId = options.firstObjectiveId ?? FIRST_SHIFT_OBJECTIVE_IDS[0];
  if (nextPhase === 'tutorial') assertStableId(firstObjectiveId, 'Tutorial objective ID');
  if (options.nextSceneId !== undefined && options.nextSceneId !== null) {
    assertStableId(options.nextSceneId, 'Next onboarding scene ID');
  }

  return {
    ...started,
    phase: nextPhase,
    currentSceneId: options.nextSceneId ?? null,
    completedSceneIds: appendUnique(state.completedSceneIds, completedSceneId),
    activeObjectiveId: nextPhase === 'tutorial' ? firstObjectiveId : null
  };
}

export function beginOnboardingTutorial(
  state: OnboardingState,
  campaignDay = state.startedCampaignDay ?? 1,
  firstObjectiveId: string = FIRST_SHIFT_OBJECTIVE_IDS[0]
): OnboardingState {
  if (state.phase === 'complete') return state;
  assertStableId(firstObjectiveId, 'Tutorial objective ID');
  const started = inProgress(state, campaignDay);
  return {
    ...started,
    phase: 'tutorial',
    currentSceneId: null,
    activeObjectiveId: firstObjectiveId
  };
}

/**
 * Consumes only the active objective, making repeated or out-of-order gameplay
 * events harmless. The last required objective completes onboarding.
 */
export function completeOnboardingObjective(
  state: OnboardingState,
  objectiveId: string,
  objectiveOrder: readonly string[] = FIRST_SHIFT_OBJECTIVE_IDS,
  campaignDay = state.startedCampaignDay ?? 1
): OnboardingState {
  if (state.phase !== 'tutorial' || state.status !== 'in_progress') return state;
  assertStableId(objectiveId, 'Completed tutorial objective ID');
  if (objectiveId !== state.activeObjectiveId) return state;

  const uniqueOrder = [...new Set(objectiveOrder)];
  if (uniqueOrder.length === 0 || uniqueOrder.some(id => id.trim().length === 0)) {
    throw new Error('Tutorial objective order must contain stable, non-empty IDs.');
  }
  const currentIndex = uniqueOrder.indexOf(objectiveId);
  if (currentIndex < 0) {
    throw new Error(`Active tutorial objective '${objectiveId}' is absent from the objective order.`);
  }

  const completedObjectiveIds = appendUnique(state.completedObjectiveIds, objectiveId);
  const nextObjectiveId = uniqueOrder[currentIndex + 1] ?? null;
  if (!nextObjectiveId) {
    return completeOnboarding({
      ...state,
      completedObjectiveIds
    }, campaignDay);
  }

  return {
    ...state,
    completedObjectiveIds,
    activeObjectiveId: nextObjectiveId
  };
}

export function completeOnboarding(
  state: OnboardingState,
  campaignDay = state.startedCampaignDay ?? 1
): OnboardingState {
  assertCampaignDay(campaignDay);
  return {
    ...state,
    phase: 'complete',
    status: 'completed',
    currentSceneId: null,
    activeObjectiveId: null,
    startedCampaignDay: state.startedCampaignDay ?? campaignDay,
    completedCampaignDay: campaignDay,
    completionReason: 'played'
  };
}

export function skipOnboarding(
  state: OnboardingState,
  campaignDay = state.startedCampaignDay ?? 1
): OnboardingState {
  if (state.phase === 'complete') return state;
  return {
    ...completeOnboarding(state, campaignDay),
    completionReason: 'skipped'
  };
}

/**
 * Clean replay path used from Settings: all prior scene/objective markers are
 * discarded while the campaign itself remains untouched.
 */
export function restartOnboarding(
  campaignDay = 1,
  firstSceneId: string | null = null
): OnboardingState {
  assertCampaignDay(campaignDay);
  const fresh = createFreshOnboardingState();
  return firstSceneId === null
    ? fresh
    : startOnboarding(fresh, firstSceneId, campaignDay);
}

export function isOnboardingComplete(state: OnboardingState | undefined): boolean {
  return state?.phase === 'complete' && state.status === 'completed';
}

export function getOnboardingProgress(
  state: OnboardingState,
  objectiveOrder: readonly string[] = FIRST_SHIFT_OBJECTIVE_IDS
): OnboardingProgress {
  const uniqueObjectives = [...new Set(objectiveOrder)];
  const completed = uniqueObjectives.filter(id => state.completedObjectiveIds.includes(id)).length;
  const isComplete = isOnboardingComplete(state);
  return {
    phase: state.phase,
    activeObjectiveId: state.activeObjectiveId,
    completedObjectives: completed,
    totalObjectives: uniqueObjectives.length,
    percent: isComplete
      ? 100
      : uniqueObjectives.length === 0
        ? 0
        : Math.round((completed / uniqueObjectives.length) * 100),
    isComplete
  };
}
