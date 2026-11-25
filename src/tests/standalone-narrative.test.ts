import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { STANDALONE_STAGES } from '../lib/pentagram-stages';
import { getStoryRoute, STORY_ROUTES, storyAvailable, storyIllustration } from '../standalone/campaign';
import { campaignAvailable, GLOBAL_CAMPAIGN, GLOBAL_CAMPAIGN_CAST, GLOBAL_CAMPAIGN_ENDING_ID } from '../standalone/campaign-global';
import {
  applyMatchResult, buildCampaignRun, buildRun, createDefaultSave, exportSave, getRunEncounter,
  getRunStory, importSave, loadSave, retryRun, storyEndingUnlocked, validateSave,
  type MatchOutcome, type StandaloneSave,
} from '../standalone/progression';
import { STANDALONE_FIGHTER_IDS } from '../standalone/roster';

// Snapshot of the pre-V3 format and Charlie route, rather than a fixture built
// with the new createDefaultSave/buildRun implementation being tested.
function oldSave() {
  return {
    version: 1,
    options: { soundtrack: false, reducedMotion: true, difficulty: 'rookie' },
    stats: { matches: 1, wins: 1, losses: 0, draws: 0, streak: 1, bestStreak: 1, bestSurvival: 0, completedArcades: 0 },
    storyEndings: [],
    recentResults: [{ id: 'before-v3-1', mode: 'story', fighterId: 'charlie', opponentId: 'vaggie', outcome: 'won', playedAt: 1_000 }],
    processedResultIds: ['before-v3-1'],
    run: {
      mode: 'story', fighterId: 'charlie', seed: 42,
      rosterIds: ['adam', 'alastor', 'charlie', 'vaggie'], bossIds: [],
      opponentIds: ['vaggie', 'alastor', 'adam'], index: 1, wins: 1, retries: 0, status: 'active',
    },
  };
}

function finishEncounter(save: StandaloneSave, id: string, outcome: MatchOutcome = 'won'): StandaloneSave {
  const run = save.run!;
  const encounter = getRunEncounter(run);
  return applyMatchResult(save, { id, mode: run.mode, fighterId: encounter.fighterId, opponentId: encounter.opponentId, outcome, playedAt: 2_000 });
}

describe('versioned narrative and save compatibility', () => {
  it('projects all 43 bible campaigns without importing move or illustration proposals as implementations', () => {
    const design = JSON.parse(readFileSync('docs/standalone/campaign-design-v3.json', 'utf8'));
    const projected = Object.fromEntries(design.fighters.map((fighter: any) => {
      const { campaign, continuity } = fighter;
      const { status: _status, ...story } = campaign;
      void _status;
      return [fighter.fighterId, {
        ...story,
        chapters: campaign.chapters.map(({ opponentId, stageId, index: _index, ...chapter }: any) => {
          void _index;
          return { ...chapter, opponent: opponentId, stage: stageId };
        }),
        continuity,
      }];
    }));
    expect(Object.keys(projected)).toHaveLength(43);
    expect(STORY_ROUTES).toEqual(projected);
    for (const fighterId of STANDALONE_FIGHTER_IDS) {
      for (const beat of ['intro', 'rival', 'ending'] as const) expect(storyIllustration(fighterId, beat, 3)).toBeUndefined();
    }
    expect(storyIllustration('charlie', 'intro', 1)).toBe('/assets/story/infernal-versus/charlie-intro.webp');
  });

  it('resumes an old mid-story save with the exact old opponent and stage without rewriting storage', () => {
    const old = oldSave();
    const raw = JSON.stringify(old);
    const storage = { getItem: () => raw, setItem: vi.fn() };
    const loaded = loadSave(storage, STANDALONE_FIGHTER_IDS);
    expect(loaded.status).toBe('ok');
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(loaded.save.options).toEqual({ ...old.options, stagePresentation: 'reduced' });
    expect(loaded.save.run).toEqual({ ...old.run, routeVersion: 1 });
    expect(getRunStory(loaded.save.run!)?.title).toBe('Une place à la table');
    expect(getRunEncounter(loaded.save.run!)).toEqual({ fighterId: 'charlie', opponentId: 'alastor', stageId: 'hotel-bar' });
    expect(importSave(exportSave(loaded.save, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS)).toEqual(loaded.save);
    expect(JSON.stringify(old)).toBe(raw);
  });

  it('preserves legacy unlocks and earns the rewritten ending separately', () => {
    let save = importSave(JSON.stringify(oldSave()), STANDALONE_FIGHTER_IDS);
    save = finishEncounter(save, 'legacy-2');
    save = finishEncounter(save, 'legacy-3');
    expect(storyEndingUnlocked(save, 'charlie', 1)).toBe(true);
    expect(storyEndingUnlocked(save, 'charlie')).toBe(false);
    expect(save.storyCompletions).toEqual([{ fighterId: 'charlie', routeVersion: 1 }]);
    save = { ...save, run: buildRun('story', 'charlie', STANDALONE_FIGHTER_IDS, [], 42) };
    expect(getRunStory(save.run!)?.title).toBe('Une chambre, un choix');
    save = finishEncounter(save, 'v3-1');
    expect(getRunEncounter(save.run!)).toEqual({ fighterId: 'charlie', opponentId: 'velvette', stageId: 'vee-broadcast-studio' });
    save = finishEncounter(save, 'v3-2');
    save = finishEncounter(save, 'v3-3');
    save = importSave(exportSave(save, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS);
    expect(save.storyEndings).toEqual(['charlie']);
    expect(save.storyCompletions).toEqual([{ fighterId: 'charlie', routeVersion: 1 }, { fighterId: 'charlie', routeVersion: 3 }]);
    expect(storyEndingUnlocked(save, 'charlie')).toBe(true);
    expect(save.stats.wins).toBe(6);
  });

  it('migrates both pre-gallery completed runs and gallery unlocks after the current run was replaced', () => {
    const legacy = oldSave();
    legacy.run.index = 3;
    legacy.run.wins = 3;
    legacy.run.status = 'complete';
    legacy.stats = { ...legacy.stats, matches: 3, wins: 3, streak: 3, bestStreak: 3 };
    legacy.processedResultIds = ['before-v3-1', 'before-v3-2', 'before-v3-3'];
    legacy.recentResults = ['adam', 'alastor', 'vaggie'].map((opponentId, i) => ({ ...legacy.recentResults[0], id: `before-v3-${3 - i}`, opponentId }));
    const { storyEndings: _endings, ...beforeGallery } = legacy;
    void _endings;
    expect(importSave(JSON.stringify(beforeGallery), STANDALONE_FIGHTER_IDS).storyCompletions).toEqual([{ fighterId: 'charlie', routeVersion: 1 }]);
    const afterReplacement = { ...legacy, storyEndings: ['charlie'], run: null };
    const migrated = importSave(JSON.stringify(afterReplacement), STANDALONE_FIGHTER_IDS);
    expect(storyEndingUnlocked(migrated, 'charlie', 1)).toBe(true);
    expect(storyEndingUnlocked(migrated, 'charlie', 3)).toBe(false);
  });

  it('rejects future narrative versions, mixed route contents and unearned versioned unlocks', () => {
    const legacy = oldSave();
    expect(() => validateSave({ ...legacy, run: { ...legacy.run, routeVersion: 4 } }, STANDALONE_FIGHTER_IDS)).toThrow(/Version du récit/);
    expect(() => validateSave({ ...legacy, run: { ...legacy.run, routeVersion: 3 } }, STANDALONE_FIGHTER_IDS)).toThrow();
    const empty = createDefaultSave();
    expect(() => validateSave({ ...empty, storyEndings: ['charlie'], storyCompletions: [{ fighterId: 'charlie', routeVersion: 3 }] }, STANDALONE_FIGHTER_IDS)).toThrow(/victoires/);
    expect(() => validateSave({ ...empty, storyCompletions: [{ fighterId: 'charlie', routeVersion: 99 }] }, STANDALONE_FIGHTER_IDS)).toThrow(/Version d’épilogue/);
    const migrated = importSave(JSON.stringify(legacy), STANDALONE_FIGHTER_IDS);
    expect(() => validateSave({ ...migrated, storyEndings: ['charlie'] }, STANDALONE_FIGHTER_IDS)).toThrow(/Collection/);
  });

  it('honors route-level spoilers even when the selected fighter is available', () => {
    const seasonTwo = Object.entries(STORY_ROUTES).filter(([, route]) => route.continuity?.spoilerTier === 'season_2');
    expect(seasonTwo.length).toBeGreaterThan(0);
    for (const [fighterId] of seasonTwo) {
      expect(storyAvailable(fighterId, STANDALONE_FIGHTER_IDS, { allowSeasonTwo: false })).toBe(false);
      expect(storyAvailable(fighterId, STANDALONE_FIGHTER_IDS, { allowSeasonTwo: true })).toBe(true);
    }
    expect(storyAvailable('charlie', STANDALONE_FIGHTER_IDS, { allowSeasonTwo: false })).toBe(true);
    expect(getStoryRoute('toString')).toBeUndefined();
    expect(storyAvailable('toString', [...STANDALONE_FIGHTER_IDS, 'toString'])).toBe(false);
  });

  it('round-trips presentation choices and rejects unknown presentation states', () => {
    for (const stagePresentation of ['alive', 'static', 'reduced'] as const) {
      const save = createDefaultSave();
      save.options.stagePresentation = stagePresentation;
      expect(importSave(exportSave(save, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS).options.stagePresentation).toBe(stagePresentation);
    }
    const save = createDefaultSave();
    expect(() => validateSave({ ...save, options: { ...save.options, stagePresentation: 'hidden' } }, STANDALONE_FIGHTER_IDS)).toThrow(/Présentation/);
    expect(() => validateSave({ ...save, options: { ...save.options, other: true } }, STANDALONE_FIGHTER_IDS)).toThrow(/champs/);
  });
});

describe('global campaign progression', () => {
  it('requires its whole cast and spoiler scope, with a distinct authored sequence', () => {
    expect(GLOBAL_CAMPAIGN.chapters).toHaveLength(9);
    expect(campaignAvailable(STANDALONE_FIGHTER_IDS)).toBe(true);
    expect(campaignAvailable(STANDALONE_FIGHTER_IDS, { allowSeasonTwo: false })).toBe(false);
    expect(campaignAvailable(STANDALONE_FIGHTER_IDS, { allowSeasonTwo: true })).toBe(true);
    expect(new Set(GLOBAL_CAMPAIGN.chapters.map(chapter => chapter.id)).size).toBe(9);
    for (const fighterId of GLOBAL_CAMPAIGN_CAST) {
      const incomplete = STANDALONE_FIGHTER_IDS.filter(id => id !== fighterId);
      expect(campaignAvailable(incomplete)).toBe(false);
      expect(() => buildCampaignRun(incomplete, 1)).toThrow();
    }
    for (const chapter of GLOBAL_CAMPAIGN.chapters) {
      expect(chapter.fighterId).not.toBe(chapter.opponentId);
      expect(STANDALONE_STAGES.some(stage => stage.id === chapter.stageId)).toBe(true);
    }
    expect(buildCampaignRun(STANDALONE_FIGHTER_IDS, 12)).toEqual(buildCampaignRun([...STANDALONE_FIGHTER_IDS].reverse(), 12));
  });

  it('saves every chapter, switches to the assigned fighter, retries defeats and unlocks only after the ninth victory', () => {
    let save = { ...createDefaultSave(), run: buildCampaignRun(STANDALONE_FIGHTER_IDS, 12) } as StandaloneSave;
    for (const [index, chapter] of GLOBAL_CAMPAIGN.chapters.entries()) {
      expect(getRunEncounter(save.run!)).toEqual({ fighterId: chapter.fighterId, opponentId: chapter.opponentId, stageId: chapter.stageId });
      expect(save.campaignEndings).toEqual([]);
      if (index === 1) {
        const before = JSON.stringify(save);
        expect(() => applyMatchResult(save, { id: 'wrong-actor', mode: 'campaign', fighterId: 'charlie', opponentId: chapter.opponentId, outcome: 'won', playedAt: 1 })).toThrow(/courant/);
        expect(JSON.stringify(save)).toBe(before);
        save = finishEncounter(save, 'campaign-draw', 'draw');
        expect(save.run?.index).toBe(index);
        save = finishEncounter(save, 'campaign-defeat', 'lost');
        save = importSave(exportSave(save, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS);
        expect(save.run?.status).toBe('failed');
        save = { ...save, run: retryRun(save.run!) };
        expect(getRunEncounter(save.run!)).toEqual({ fighterId: chapter.fighterId, opponentId: chapter.opponentId, stageId: chapter.stageId });
      }
      save = finishEncounter(save, `campaign-${index}`);
      const duplicate = save.recentResults[0];
      expect(applyMatchResult(save, duplicate)).toBe(save);
      save = importSave(exportSave(save, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS);
    }
    expect(save.run).toMatchObject({ index: 9, status: 'complete', wins: 9, retries: 1 });
    expect(save.stats).toMatchObject({ wins: 9, draws: 1, losses: 1, matches: 11, completedArcades: 0 });
    expect(save.campaignEndings).toEqual([GLOBAL_CAMPAIGN_ENDING_ID]);
    expect(save.storyEndings).toEqual([]);
    expect(save.storyCompletions).toEqual([]);
    expect(() => getRunEncounter(save.run!)).toThrow(/terminé/);
    expect(() => validateSave({ ...save, campaignEndings: [] }, STANDALONE_FIGHTER_IDS)).toThrow(/terminée absent/);
    save = { ...save, run: buildRun('arcade', 'husk', STANDALONE_FIGHTER_IDS, [], 10) };
    expect(importSave(exportSave(save, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS).campaignEndings).toEqual([GLOBAL_CAMPAIGN_ENDING_ID]);
  });

  it('rejects unknown campaign identities and forged completion data', () => {
    const save = { ...createDefaultSave(), run: buildCampaignRun(STANDALONE_FIGHTER_IDS, 12) };
    expect(() => validateSave({ ...save, run: { ...save.run, campaignVersion: 2 } }, STANDALONE_FIGHTER_IDS)).toThrow(/Version de campagne/);
    expect(() => validateSave({ ...save, run: { ...save.run, campaignId: 'other' } }, STANDALONE_FIGHTER_IDS)).toThrow(/Version de campagne/);
    expect(() => validateSave({ ...save, run: { ...save.run, opponentIds: [...save.run.opponentIds].reverse() } }, STANDALONE_FIGHTER_IDS)).toThrow(/seed/);
    expect(() => validateSave({ ...save, campaignEndings: [GLOBAL_CAMPAIGN_ENDING_ID] }, STANDALONE_FIGHTER_IDS)).toThrow(/victoires/);
    expect(() => validateSave({ ...save, campaignEndings: ['signal-libre:2'] }, STANDALONE_FIGHTER_IDS)).toThrow(/inconnu/);
  });
});
