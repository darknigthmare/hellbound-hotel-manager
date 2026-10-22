import { describe, expect, it, vi } from 'vitest';
import {
  advanceRun, applyMatchResult, buildRun, createDefaultSave, exportSave,
  importSave, loadSave, MAX_IMPORT_LENGTH, MAX_SAVED_MATCHES, retryRun,
  saveProgress, STANDALONE_STORAGE_KEY, validateSave,
  type MatchOutcome, type StandaloneMatchResult, type StandaloneSave,
} from '../standalone/progression';

const roster = ['charlie', 'vaggie', 'alastor', 'adam', 'hb_blitzo', 'hb_millie', 'hb_stolas'];
const bosses = ['alastor', 'adam', 'hb_stolas'];
function result(id: string, outcome: MatchOutcome = 'won'): StandaloneMatchResult {
  return { id, mode: 'versus', fighterId: 'charlie', opponentId: 'adam', outcome, playedAt: 1_000 };
}
function saveWithRun(mode: 'arcade' | 'survival' | 'boss-rush' = 'arcade'): StandaloneSave {
  return { ...createDefaultSave(), run: buildRun(mode, 'charlie', roster, bosses, 0xf1234567) };
}
function completeCurrent(save: StandaloneSave, id: string, outcome: MatchOutcome = 'won'): StandaloneSave {
  const run = save.run!;
  return applyMatchResult(save, { ...result(id, outcome), mode: run.mode, fighterId: run.fighterId, opponentId: run.opponentIds[run.index] });
}

describe('Infernal Versus standalone progression', () => {
  it('creates independent defaults and stable routes for unsigned 32-bit seeds', () => {
    const first = createDefaultSave();
    first.options.soundtrack = false;
    expect(createDefaultSave().options.soundtrack).toBe(true);
    const route = buildRun('arcade', 'charlie', roster, bosses, 0xf1234567);
    expect(route).toEqual(buildRun('arcade', 'charlie', [...roster].reverse(), [...bosses].reverse(), 0xf1234567));
    expect(route.opponentIds).toHaveLength(5);
    expect(new Set(route.opponentIds).size).toBe(5);
    expect(route.opponentIds).not.toContain('charlie');
    expect(() => buildRun('arcade', 'charlie', roster, bosses, -1)).toThrow();
    expect(() => buildRun('arcade', 'charlie', roster, bosses, 0x1_0000_0000)).toThrow();
  });

  it('limits Boss Rush to available bosses and excludes the player', () => {
    const route = buildRun('boss-rush', 'alastor', roster, [...bosses, 'unavailable'], 52);
    expect([...route.opponentIds].sort()).toEqual(['adam', 'hb_stolas']);
    expect(() => buildRun('boss-rush', 'alastor', ['alastor'], bosses, 52)).toThrow(/Aucun adversaire/);
  });

  it('runs twenty survival duels without immediate repeats for a two-opponent pool', () => {
    const route = buildRun('survival', 'charlie', ['charlie', 'adam', 'alastor'], bosses, 3);
    expect(route.opponentIds).toHaveLength(20);
    route.opponentIds.slice(1).forEach((id, index) => expect(id).not.toBe(route.opponentIds[index]));
    expect(buildRun('arcade', 'charlie', ['charlie', 'adam'], bosses, 3).opponentIds).toEqual(Array(5).fill('adam'));
    expect(() => buildRun('survival', 'charlie', ['charlie'], [], 3)).toThrow();
  });

  it('keeps draw and loss on the current opponent and retries explicitly', () => {
    const run = saveWithRun().run!;
    expect(advanceRun(run, 'draw')).toBe(run);
    const failed = advanceRun(run, 'lost');
    expect(failed).toMatchObject({ status: 'failed', index: 0, wins: 0 });
    expect(advanceRun(failed, 'won')).toBe(failed);
    expect(retryRun(failed)).toMatchObject({ status: 'active', index: 0, retries: 1 });
    expect(() => retryRun(run)).toThrow();
  });

  it('atomically records a complete Arcade run and survives a reload after every match', () => {
    let save = saveWithRun();
    for (let index = 0; index < 5; index += 1) {
      const previous = save;
      save = completeCurrent(save, `arcade-${index}`);
      expect(previous.run?.index).toBe(index);
      expect(save.run?.index).toBe(index + 1);
      save = importSave(exportSave(save, roster), roster);
    }
    expect(save.run).toMatchObject({ status: 'complete', wins: 5 });
    expect(save.stats).toMatchObject({ matches: 5, wins: 5, streak: 5, bestStreak: 5, completedArcades: 1 });
  });

  it('preserves the lost opponent on reload and continues after a retry', () => {
    let save = completeCurrent(saveWithRun(), 'first-win');
    const opponent = save.run!.opponentIds[1];
    save = completeCurrent(save, 'loss', 'lost');
    save = importSave(exportSave(save, roster), roster);
    expect(save.run).toMatchObject({ index: 1, wins: 1, status: 'failed' });
    save = { ...save, run: retryRun(save.run!) };
    expect(save.run?.opponentIds[save.run.index]).toBe(opponent);
    save = completeCurrent(save, 'retry-win');
    expect(validateSave(save, roster).run).toMatchObject({ index: 2, retries: 1, wins: 2 });
    expect(save.stats).toMatchObject({ wins: 2, losses: 1, streak: 1, bestStreak: 1 });
  });

  it('rejects a route result for the wrong opponent without partially changing the save', () => {
    const save = saveWithRun();
    const original = JSON.stringify(save);
    expect(() => applyMatchResult(save, { ...result('bad-result'), mode: 'arcade', opponentId: 'charlie' })).toThrow(/courant/);
    expect(JSON.stringify(save)).toBe(original);
  });

  it('ignores training and duplicate results even after the recent history rolls over', () => {
    let save = createDefaultSave();
    expect(applyMatchResult(save, { ...result('practice'), mode: 'training' })).toBe(save);
    for (let index = 0; index < 35; index += 1) save = applyMatchResult(save, result(`duel-${index}`));
    expect(save.recentResults).toHaveLength(30);
    expect(save.recentResults[0].id).toBe('duel-34');
    expect(save.processedResultIds).toHaveLength(35);
    expect(applyMatchResult(save, result('duel-0', 'lost'))).toBe(save);
    expect(validateSave(save, roster).stats.matches).toBe(35);
  });

  it('records local mirror matches, draws, and survival records with separate IDs', () => {
    let save = applyMatchResult(createDefaultSave(), { ...result('mirror'), mode: 'local', opponentId: 'charlie' });
    save = applyMatchResult(save, result('draw', 'draw'));
    expect(save.stats).toMatchObject({ matches: 2, wins: 1, draws: 1, streak: 0, bestStreak: 1 });
    save = { ...save, run: buildRun('survival', 'charlie', roster, bosses, 4) };
    save = completeCurrent(save, 'survival-win');
    expect(validateSave(save, roster).stats.bestSurvival).toBe(1);
  });

  it('rejects oversized data, future schemas, unknown keys and unknown characters', () => {
    expect(() => importSave(' '.repeat(MAX_IMPORT_LENGTH + 1), roster)).toThrow(/volumineuse/);
    expect(() => importSave('{broken', roster)).toThrow();
    expect(() => validateSave({ ...createDefaultSave(), version: 2 }, roster)).toThrow(/Version/);
    expect(() => validateSave({ ...createDefaultSave(), hotel: {} }, roster)).toThrow(/champs/);
    const save = applyMatchResult(createDefaultSave(), result('known'));
    expect(() => validateSave(save, ['charlie'])).toThrow(/inconnu/);
  });

  it('rejects forged route order, invalid counters and unsupported progress', () => {
    const save = saveWithRun();
    const route = save.run!;
    expect(() => validateSave({ ...save, run: { ...route, opponentIds: [...route.opponentIds].reverse() } }, roster)).toThrow(/seed/);
    expect(() => validateSave({ ...save, stats: { ...save.stats, matches: 2 } }, roster)).toThrow(/Compteurs/);
    expect(() => validateSave({ ...save, run: { ...route, index: 1, wins: 1 } }, roster)).toThrow(/résultats/);
    expect(() => validateSave({ ...save, run: { ...route, status: 'failed' } }, roster)).toThrow(/défaite/);
    const won = applyMatchResult(createDefaultSave(), result('won'));
    expect(() => validateSave({ ...won, stats: { ...won.stats, streak: 0 } }, roster)).toThrow(/historique/);
  });

  it('isolates its storage key and never rewrites corrupt or incompatible data during load', () => {
    const entries = new Map([['hellbound_hotel_db_state', 'untouched'], [STANDALONE_STORAGE_KEY, '{corrupt']]);
    const storage = { getItem: vi.fn((key: string) => entries.get(key) ?? null), setItem: vi.fn((key: string, value: string) => { entries.set(key, value); }) };
    expect(loadSave(storage, roster).status).toBe('invalid');
    expect(entries.get(STANDALONE_STORAGE_KEY)).toBe('{corrupt');
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(saveProgress(storage, createDefaultSave(), roster).ok).toBe(true);
    expect(loadSave(storage, roster).status).toBe('ok');
    expect(entries.get('hellbound_hotel_db_state')).toBe('untouched');
    expect(storage.getItem.mock.calls.every(([key]) => key === STANDALONE_STORAGE_KEY)).toBe(true);
    expect(storage.setItem.mock.calls.every(([key]) => key === STANDALONE_STORAGE_KEY)).toBe(true);
    expect(loadSave({ ...storage, getItem: () => null }, roster).status).toBe('empty');
  });

  it('handles unavailable or quota-limited storage without throwing or mutating the save', () => {
    const save = createDefaultSave();
    const storage = { getItem: () => { throw new Error('SecurityError'); }, setItem: () => { throw new Error('Quota exceeded'); } };
    expect(loadSave(storage, roster).status).toBe('unavailable');
    expect(loadSave(null, roster).status).toBe('unavailable');
    expect(saveProgress(storage, save, roster)).toMatchObject({ ok: false });
    expect(saveProgress(undefined, save, roster)).toMatchObject({ ok: false });
    expect(save.stats.matches).toBe(0);
  });

  it('refuses to evict the idempotence ledger at the maximum match count', () => {
    const save = createDefaultSave();
    save.processedResultIds = Array.from({ length: MAX_SAVED_MATCHES }, (_, index) => `full-${index}`);
    expect(() => applyMatchResult(save, result('next'))).toThrow(/10 000/);
    expect(save.processedResultIds).toHaveLength(MAX_SAVED_MATCHES);
  });
});
