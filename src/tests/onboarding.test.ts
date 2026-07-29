import { describe, expect, it } from 'vitest';
import { LocalDb } from '../db/localDb';
import { getSeedData } from '../db/seed';
import {
  BACKUP_SCHEMA_VERSION,
  DEFAULT_GAMEPLAY_META,
  ExportImport,
  type StorageLike
} from '../lib/export-import';
import {
  advanceOnboardingScene,
  beginOnboardingTutorial,
  completeOnboardingObjective,
  createCompletedOnboardingState,
  createFreshOnboardingState,
  FIRST_SHIFT_OBJECTIVE_IDS,
  getOnboardingProgress,
  restartOnboarding,
  skipOnboarding,
  startOnboarding
} from '../lib/onboarding';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>();

  public get length() { return this.values.size; }
  public clear() { this.values.clear(); }
  public getItem(key: string) { return this.values.get(key) ?? null; }
  public key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  public removeItem(key: string) { this.values.delete(key); }
  public setItem(key: string, value: string) { this.values.set(key, value); }
}

function currentState() {
  const seed = getSeedData();
  const gameplayMeta = clone(DEFAULT_GAMEPLAY_META);
  gameplayMeta.appliedTaskIds = seed.staffTasks
    .filter(task => task.status === 'completed')
    .map(task => task.id);
  gameplayMeta.resolvedIncidentIds = seed.incidents
    .filter(incident => incident.status === 'resolved' || incident.status === 'archived')
    .map(incident => incident.id);
  gameplayMeta.rewardedRedemptionIds = seed.rehabilitationPlans
    .filter(plan => plan.isRedeemedConfirmed)
    .map(plan => plan.characterId);
  return { schemaVersion: BACKUP_SCHEMA_VERSION, ...seed, gameplayMeta };
}

describe('durable first-arrival onboarding', () => {
  it('starts new games at the intro without inventing completed progress', () => {
    expect(createFreshOnboardingState()).toEqual({
      dataVersion: 1,
      phase: 'intro',
      status: 'not_started',
      currentSceneId: null,
      completedSceneIds: [],
      activeObjectiveId: null,
      completedObjectiveIds: [],
      startedCampaignDay: null,
      completedCampaignDay: null,
      completionReason: null
    });
    expect(DEFAULT_GAMEPLAY_META.onboarding).toEqual(createFreshOnboardingState());
  });

  it('resumes narrative scenes and transitions into ordered live objectives', () => {
    let state = startOnboarding(createFreshOnboardingState(), 'intro:arrival-01', 1);
    expect(state).toMatchObject({
      phase: 'intro',
      status: 'in_progress',
      currentSceneId: 'intro:arrival-01',
      startedCampaignDay: 1
    });

    state = advanceOnboardingScene(state, 'intro:arrival-01', {
      nextPhase: 'prologue',
      nextSceneId: 'prologue:lobby-01'
    });
    expect(state.completedSceneIds).toEqual(['intro:arrival-01']);
    expect(state).toMatchObject({
      phase: 'prologue',
      currentSceneId: 'prologue:lobby-01',
      activeObjectiveId: null
    });

    state = advanceOnboardingScene(state, 'prologue:lobby-01', {
      nextPhase: 'tutorial'
    });
    expect(state).toMatchObject({
      phase: 'tutorial',
      currentSceneId: null,
      activeObjectiveId: 'move'
    });

    for (const objectiveId of FIRST_SHIFT_OBJECTIVE_IDS) {
      state = completeOnboardingObjective(state, objectiveId);
    }
    expect(state).toMatchObject({
      phase: 'complete',
      status: 'completed',
      activeObjectiveId: null,
      completedCampaignDay: 1,
      completionReason: 'played'
    });
    expect(state.completedObjectiveIds).toEqual(FIRST_SHIFT_OBJECTIVE_IDS);
    expect(getOnboardingProgress(state)).toMatchObject({
      completedObjectives: FIRST_SHIFT_OBJECTIVE_IDS.length,
      totalObjectives: FIRST_SHIFT_OBJECTIVE_IDS.length,
      percent: 100,
      isComplete: true
    });
  });

  it('ignores repeated and out-of-order gameplay events', () => {
    const tutorial = beginOnboardingTutorial(createFreshOnboardingState());
    const outOfOrder = completeOnboardingObjective(tutorial, 'jump');
    expect(outOfOrder).toEqual(tutorial);

    const moved = completeOnboardingObjective(tutorial, 'move');
    const repeated = completeOnboardingObjective(moved, 'move');
    expect(repeated).toEqual(moved);
    expect(moved.completedObjectiveIds).toEqual(['move']);
    expect(moved.activeObjectiveId).toBe('jump');
  });

  it('supports an explicit skip and a clean replay without resetting the campaign', () => {
    const started = startOnboarding(createFreshOnboardingState(), 'intro:arrival-01', 7);
    const skipped = skipOnboarding(started, 7);
    expect(skipped).toMatchObject({
      phase: 'complete',
      status: 'completed',
      completionReason: 'skipped',
      completedCampaignDay: 7
    });

    const replay = restartOnboarding(7, 'intro:arrival-01');
    expect(replay).toMatchObject({
      phase: 'intro',
      status: 'in_progress',
      currentSceneId: 'intro:arrival-01',
      startedCampaignDay: 7,
      completionReason: null
    });
    expect(replay.completedSceneIds).toEqual([]);
    expect(replay.completedObjectiveIds).toEqual([]);
  });

  it('marks pre-onboarding saves complete so established players are not interrupted', () => {
    const legacy = currentState();
    delete (legacy.gameplayMeta as Partial<typeof legacy.gameplayMeta>).onboarding;

    const result = ExportImport.validateState(legacy);

    expect(result).toMatchObject({ isValid: true, migrated: true });
    expect(result.parsedState?.gameplayMeta?.onboarding).toEqual(
      createCompletedOnboardingState(1, 'legacy_save')
    );
  });

  it('persists migration while new games and database resets return to the intro', () => {
    const freshDatabase = new LocalDb(new MemoryStorage());
    expect(freshDatabase.getGameplayMeta().onboarding).toEqual(
      createFreshOnboardingState()
    );
    expect(freshDatabase.transaction('ONBOARDING_SKIP_TEST', draft => {
      draft.gameplayMeta!.onboarding = skipOnboarding(
        draft.gameplayMeta!.onboarding,
        draft.gameplayMeta!.campaignDay
      );
    })).toBe(true);
    expect(freshDatabase.getGameplayMeta().onboarding.phase).toBe('complete');
    expect(freshDatabase.resetToSeed()).toBe(true);
    expect(freshDatabase.getGameplayMeta().onboarding).toEqual(
      createFreshOnboardingState()
    );

    const storage = new MemoryStorage();
    const legacy = currentState();
    delete (legacy.gameplayMeta as Partial<typeof legacy.gameplayMeta>).onboarding;
    storage.setItem('hellbound_hotel_db_state', JSON.stringify(legacy));

    const migratedDatabase = new LocalDb(storage);
    expect(migratedDatabase.getGameplayMeta().onboarding).toEqual(
      createCompletedOnboardingState(1, 'legacy_save')
    );
    expect(JSON.parse(storage.getItem('hellbound_hotel_db_state') || '{}'))
      .toHaveProperty('gameplayMeta.onboarding.completionReason', 'legacy_save');
  });

  it('round-trips current onboarding progress through the backup boundary', () => {
    const input = currentState();
    input.gameplayMeta.onboarding = advanceOnboardingScene(
      startOnboarding(createFreshOnboardingState(), 'intro:arrival-01'),
      'intro:arrival-01',
      {
        nextPhase: 'prologue',
        nextSceneId: 'prologue:lobby-01'
      }
    );

    const result = ExportImport.validateState(input);

    expect(result.isValid).toBe(true);
    expect(result.parsedState?.gameplayMeta?.onboarding).toEqual(
      input.gameplayMeta.onboarding
    );
  });

  it('rejects malformed or internally inconsistent onboarding data', () => {
    const futureVersion = currentState();
    futureVersion.gameplayMeta.onboarding.dataVersion = 99;
    expect(ExportImport.validateState(futureVersion).error)
      .toContain('unsupported data version');

    const invalidCompletion = currentState();
    invalidCompletion.gameplayMeta.onboarding = {
      ...createFreshOnboardingState(),
      phase: 'complete'
    };
    expect(ExportImport.validateState(invalidCompletion).error)
      .toContain('inconsistent not-started progress');

    const duplicateObjective = currentState();
    duplicateObjective.gameplayMeta.onboarding = {
      ...beginOnboardingTutorial(createFreshOnboardingState()),
      completedObjectiveIds: ['move', 'move']
    };
    expect(ExportImport.validateState(duplicateObjective).error)
      .toContain('completedObjectiveIds must not contain duplicates');
  });
});
