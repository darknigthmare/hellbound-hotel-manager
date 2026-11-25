import { describe, expect, it } from 'vitest';
import { STANDALONE_STAGES } from '../lib/pentagram-stages';
import { STORY_ROUTES, storyAvailable } from '../standalone/campaign';
import { advanceRun, applyMatchResult, buildRun, createDefaultSave, exportSave, importSave, retryRun, tournamentTable } from '../standalone/progression';
import { STANDALONE_FIGHTER_IDS } from '../standalone/roster';

describe('authored stories and seeded elimination brackets', () => {
  it('gives each playable fighter a distinct story, three valid opponents and existing stages', () => {
    expect(Object.keys(STORY_ROUTES).sort()).toEqual([...STANDALONE_FIGHTER_IDS].sort());
    for (const [id, story] of Object.entries(STORY_ROUTES)) {
      const route = buildRun('story', id, STANDALONE_FIGHTER_IDS, [], 32);
      expect(story.intro.length).toBeGreaterThan(0);
      expect(story.ending.length).toBeGreaterThan(0);
      expect(new Set(route.opponentIds).size).toBe(3);
      expect(route.opponentIds).not.toContain(id);
      for (const chapter of story.chapters) {
        expect(STANDALONE_STAGES.some(stage => stage.id === chapter.stage)).toBe(true);
        expect(STANDALONE_FIGHTER_IDS).toContain(chapter.opponent);
      }
      const truncated = STANDALONE_FIGHTER_IDS.filter(fighter => fighter !== story.chapters[2].opponent);
      expect(storyAvailable(id, truncated)).toBe(false);
      expect(() => buildRun('story', id, truncated, [], 32)).toThrow();
    }
  });

  it.each([2, 3, 4, 7, 8, 20])('draws a complete elimination tree from %i eligible fighters', count => {
    const [player, ...pool] = STANDALONE_FIGHTER_IDS.slice(0, count);
    const roster = [player, ...pool];
    const table = tournamentTable(player, roster, 0xf1234567);
    expect(table).toEqual(tournamentTable(player, [...roster].reverse(), 0xf1234567));
    const participants = table.rounds[0].flatMap(bout => [bout.left, bout.right]);
    expect(new Set(participants).size).toBe(count >= 8 ? 8 : count >= 4 ? 4 : 2);
    expect(participants).toContain(player);
    expect(new Set(table.opponentIds).size).toBe(table.rounds.length);
    expect(table.champion).toBe(player);
    table.rounds.slice(1).forEach((round, index) =>
      expect(round.flatMap(bout => [bout.left, bout.right])).toEqual(table.rounds[index].map(bout => bout.winner)));
    for (let round = 0; round < table.rounds.length; round++) {
      const defeat = tournamentTable(player, roster, 0xf1234567, round);
      expect(defeat.champion).not.toBe(player);
      expect(defeat.opponentIds).toEqual(table.opponentIds.slice(0, round + 1));
    }
    const run = buildRun('tournament', player, roster, [], 0xf1234567);
    expect(run.opponentIds).toEqual(table.opponentIds);
    expect(() => retryRun(advanceRun(run, 'lost'))).toThrow();
  });

  it('restores the final and its champion after the last victory', () => {
    const player = 'hb_blitzo';
    const run = buildRun('tournament', player, STANDALONE_FIGHTER_IDS, [], 123);
    let save = { ...createDefaultSave(), run } as ReturnType<typeof createDefaultSave>;
    for (const [index, opponentId] of run.opponentIds.entries()) {
      save = applyMatchResult(save, { id: 'cup-' + index, mode: 'tournament', fighterId: player, opponentId, outcome: 'won', playedAt: 1 });
      save = importSave(exportSave(save, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS);
    }
    expect(save.run?.status).toBe('complete');
    expect(save.stats.wins).toBe(3);
  });
});

describe('story ending collection', () => {
  it('migrates the previous storage format and retains a single unlock after replays and a different run', () => {
    const legacy = {
      version: 1,
      options: { soundtrack: true, reducedMotion: false, difficulty: 'standard' },
      stats: { matches: 0, wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, bestSurvival: 0, completedArcades: 0 },
      recentResults: [], processedResultIds: [], run: null,
    };
    let save = importSave(JSON.stringify(legacy), STANDALONE_FIGHTER_IDS);
    for (let play = 0; play < 2; play++) {
      const story = buildRun('story', 'charlie', STANDALONE_FIGHTER_IDS, [], 100 + play);
      save = { ...save, run: story };
      for (const [index, opponentId] of story.opponentIds.entries()) {
        save = applyMatchResult(save, { id: `story-${play}-${index}`, mode: 'story', fighterId: 'charlie', opponentId, outcome: 'won', playedAt: 1 });
      }
    }
    save = { ...save, run: buildRun('tournament', 'hb_blitzo', STANDALONE_FIGHTER_IDS, [], 10) };
    const restored = importSave(exportSave(save, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS);
    expect(restored.storyEndings).toEqual(['charlie']);
    expect(restored.storyCompletions).toEqual([{ fighterId: 'charlie', routeVersion: 3 }]);
    expect(() => importSave(JSON.stringify({ ...legacy, storyEndings: ['charlie'] }), STANDALONE_FIGHTER_IDS)).toThrow();
  });
});
