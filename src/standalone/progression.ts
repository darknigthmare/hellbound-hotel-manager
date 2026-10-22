import type { CombatAiDifficulty } from '../lib/pentagram-ai';

/** Pure progression. Browser storage is injected; hotel data is never imported. */
export type StandaloneMode = 'versus' | 'local' | 'training' | 'arcade' | 'survival' | 'boss-rush';
export type RunMode = Extract<StandaloneMode, 'arcade' | 'survival' | 'boss-rush'>;
export type MatchOutcome = 'won' | 'lost' | 'draw';

export const STANDALONE_STORAGE_KEY = 'hellbound_infernal_versus_v1';
export const MAX_SAVED_MATCHES = 10_000;
export const MAX_IMPORT_LENGTH = 1_500_000;
const MAX_ROSTER_SIZE = 512;
const RECENT_LIMIT = 30;
const MODES: readonly StandaloneMode[] = ['versus', 'local', 'training', 'arcade', 'survival', 'boss-rush'];
const RUN_MODES: readonly RunMode[] = ['arcade', 'survival', 'boss-rush'];
const DIFFICULTIES: readonly CombatAiDifficulty[] = ['rookie', 'standard', 'overlord'];

export interface StandaloneOptions {
  soundtrack: boolean;
  reducedMotion: boolean;
  difficulty: CombatAiDifficulty;
}

export interface StandaloneStats {
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  bestStreak: number;
  bestSurvival: number;
  completedArcades: number;
}

/** index is the next opponent; a completed run has index === opponentIds.length. */
export interface StandaloneRun {
  mode: RunMode;
  fighterId: string;
  seed: number;
  rosterIds: string[];
  bossIds: string[];
  opponentIds: string[];
  index: number;
  wins: number;
  retries: number;
  status: 'active' | 'complete' | 'failed';
}

/** A new id is required for every played match, including retries and rematches. */
export interface StandaloneMatchResult {
  id: string;
  mode: StandaloneMode;
  fighterId: string;
  opponentId: string;
  outcome: MatchOutcome;
  playedAt: number;
}

export interface StandaloneSave {
  version: 1;
  options: StandaloneOptions;
  stats: StandaloneStats;
  /** Newest first; complete duplicate protection is kept in the separate ledger. */
  recentResults: StandaloneMatchResult[];
  /** Oldest first; never silently evicted. */
  processedResultIds: string[];
  run: StandaloneRun | null;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface LoadSaveResult {
  save: StandaloneSave;
  status: 'ok' | 'empty' | 'invalid' | 'unavailable';
  message?: string;
}

export interface SaveWriteResult { ok: boolean; message?: string }

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,99}$/.test(value);
}

function integer(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum && value <= maximum;
}

function record(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
  ensure(value !== null && typeof value === 'object' && !Array.isArray(value), `${label} invalide.`);
  const result = value as Record<string, unknown>;
  const actual = Object.keys(result);
  ensure(actual.length === keys.length && actual.every(key => keys.includes(key)), `${label} : champs incompatibles.`);
  return result;
}

function ids(value: unknown, maximum: number, label: string): string[] {
  ensure(Array.isArray(value) && value.length <= maximum && value.every(validId), `${label} invalide.`);
  return value as string[];
}

function uniqueIds(value: unknown, maximum: number, label: string): string[] {
  const result = ids(value, maximum, label);
  ensure(new Set(result).size === result.length, `${label} contient des doublons.`);
  return result;
}

function equalIds(first: readonly string[], second: readonly string[]): boolean {
  return first.length === second.length && first.every((id, index) => id === second[index]);
}

function randomSource(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function shuffled(source: readonly string[], random: () => number): string[] {
  const result = [...source];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

export function createDefaultSave(): StandaloneSave {
  return {
    version: 1,
    options: { soundtrack: true, reducedMotion: false, difficulty: 'standard' },
    stats: { matches: 0, wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, bestSurvival: 0, completedArcades: 0 },
    recentResults: [], processedResultIds: [], run: null,
  };
}

/** Candidate ordering does not change a seeded route. Small pools may repeat. */
export function buildRun(mode: RunMode, fighterId: string, candidateIds: readonly string[], bossIds: readonly string[], seed: number): StandaloneRun {
  ensure(RUN_MODES.includes(mode), 'Mode de parcours inconnu.');
  ensure(validId(fighterId), 'Combattant du parcours invalide.');
  ensure(integer(seed, 0, 0xffffffff), 'La seed doit être un entier non signé de 32 bits.');
  const candidates = ids(candidateIds, MAX_ROSTER_SIZE, 'Catalogue');
  const requestedBosses = ids(bossIds, MAX_ROSTER_SIZE, 'Boss');
  const rosterIds = [...new Set([...candidates, fighterId])].sort();
  ensure(rosterIds.length <= MAX_ROSTER_SIZE, 'Catalogue trop grand.');
  const availableBosses = [...new Set(requestedBosses)].filter(id => rosterIds.includes(id)).sort();
  const pool = (mode === 'boss-rush' ? availableBosses : rosterIds).filter(id => id !== fighterId);
  ensure(pool.length > 0, 'Aucun adversaire compatible disponible pour ce parcours.');
  const random = randomSource(seed);
  const length = mode === 'arcade' ? 5 : mode === 'survival' ? 20 : pool.length;
  const opponentIds: string[] = [];
  while (opponentIds.length < length) {
    const deck = shuffled(pool, random);
    if (deck.length > 1 && deck[0] === opponentIds[opponentIds.length - 1]) [deck[0], deck[1]] = [deck[1], deck[0]];
    opponentIds.push(...deck.slice(0, length - opponentIds.length));
  }
  return { mode, fighterId, seed, rosterIds, bossIds: availableBosses, opponentIds, index: 0, wins: 0, retries: 0, status: 'active' };
}

export function advanceRun(run: StandaloneRun, outcome: MatchOutcome): StandaloneRun {
  ensure(['won', 'lost', 'draw'].includes(outcome), 'Résultat du duel invalide.');
  if (run.status !== 'active' || outcome === 'draw') return run;
  if (outcome === 'lost') return { ...run, status: 'failed' };
  const index = run.index + 1;
  return { ...run, index, wins: run.wins + 1, status: index === run.opponentIds.length ? 'complete' : 'active' };
}

export function retryRun(run: StandaloneRun): StandaloneRun {
  ensure(run.status === 'failed', 'Seul un duel interrompu peut être repris.');
  ensure(run.retries < MAX_SAVED_MATCHES, 'Limite de reprises atteinte.');
  return { ...run, status: 'active', retries: run.retries + 1 };
}

function parseResult(value: unknown): StandaloneMatchResult {
  const result = record(value, ['id', 'mode', 'fighterId', 'opponentId', 'outcome', 'playedAt'], 'Résultat');
  ensure(validId(result.id) && validId(result.fighterId) && validId(result.opponentId), 'Identifiant du résultat invalide.');
  ensure(MODES.includes(result.mode as StandaloneMode), 'Mode du résultat invalide.');
  ensure(['won', 'lost', 'draw'].includes(result.outcome as string), 'Issue du résultat invalide.');
  ensure(integer(result.playedAt, 0, 8_640_000_000_000_000), 'Date du résultat invalide.');
  return { ...result } as unknown as StandaloneMatchResult;
}

/** Updates result, route and records atomically. Duplicate callbacks are harmless. */
export function applyMatchResult(save: StandaloneSave, value: StandaloneMatchResult): StandaloneSave {
  const result = parseResult(value);
  if (result.mode === 'training' || save.processedResultIds.includes(result.id)) return save;
  ensure(save.processedResultIds.length < MAX_SAVED_MATCHES, 'Limite de 10 000 duels atteinte. Exportez votre progression avant de démarrer un nouveau profil.');
  let run = save.run;
  if (RUN_MODES.includes(result.mode as RunMode)) {
    ensure(run?.status === 'active' && run.mode === result.mode && run.fighterId === result.fighterId && run.opponentIds[run.index] === result.opponentId, 'Ce résultat ne correspond pas au duel courant du parcours.');
    run = advanceRun(run, result.outcome);
  }
  const won = result.outcome === 'won';
  const streak = won ? save.stats.streak + 1 : 0;
  const stats: StandaloneStats = {
    ...save.stats,
    matches: save.stats.matches + 1,
    wins: save.stats.wins + Number(won),
    losses: save.stats.losses + Number(result.outcome === 'lost'),
    draws: save.stats.draws + Number(result.outcome === 'draw'),
    streak,
    bestStreak: Math.max(save.stats.bestStreak, streak),
    bestSurvival: result.mode === 'survival' && won && run ? Math.max(save.stats.bestSurvival, run.wins) : save.stats.bestSurvival,
    completedArcades: save.stats.completedArcades + Number(result.mode === 'arcade' && won && run?.status === 'complete'),
  };
  return { ...save, stats, run, recentResults: [result, ...save.recentResults].slice(0, RECENT_LIMIT), processedResultIds: [...save.processedResultIds, result.id] };
}

function parseRun(value: unknown, knownIds: ReadonlySet<string>, stats: StandaloneStats): StandaloneRun | null {
  if (value === null) return null;
  const entry = record(value, ['mode', 'fighterId', 'seed', 'rosterIds', 'bossIds', 'opponentIds', 'index', 'wins', 'retries', 'status'], 'Parcours');
  ensure(RUN_MODES.includes(entry.mode as RunMode) && validId(entry.fighterId) && knownIds.has(entry.fighterId), 'Identité du parcours invalide.');
  ensure(integer(entry.seed, 0, 0xffffffff), 'Seed du parcours invalide.');
  const rosterIds = uniqueIds(entry.rosterIds, MAX_ROSTER_SIZE, 'Catalogue du parcours');
  const bossIds = uniqueIds(entry.bossIds, MAX_ROSTER_SIZE, 'Boss du parcours');
  const opponentIds = ids(entry.opponentIds, MAX_ROSTER_SIZE, 'Adversaires');
  ensure(rosterIds.every(id => knownIds.has(id)), 'Le parcours contient un personnage inconnu.');
  const expected = buildRun(entry.mode as RunMode, entry.fighterId, rosterIds, bossIds, entry.seed);
  ensure(equalIds(rosterIds, expected.rosterIds) && equalIds(bossIds, expected.bossIds) && equalIds(opponentIds, expected.opponentIds), 'Parcours incompatible avec sa seed ou son catalogue.');
  ensure(integer(entry.index, 0, opponentIds.length) && entry.wins === entry.index, 'Avancée du parcours incohérente.');
  ensure(integer(entry.retries, 0, MAX_SAVED_MATCHES) && ['active', 'complete', 'failed'].includes(entry.status as string), 'État du parcours invalide.');
  ensure((entry.status === 'complete') === (entry.index === opponentIds.length), 'État final du parcours incohérent.');
  ensure(entry.wins <= stats.wins && entry.retries <= stats.losses, 'Parcours sans résultats correspondants.');
  if (entry.status === 'failed') ensure(stats.losses > entry.retries, 'Échec sans défaite enregistrée.');
  if (entry.mode === 'survival') ensure(entry.wins <= stats.bestSurvival, 'Record de survie incohérent.');
  if (entry.mode === 'arcade' && entry.status === 'complete') ensure(stats.completedArcades > 0, 'Parcours Arcade non comptabilisé.');
  return { ...expected, index: entry.index, wins: entry.wins, retries: entry.retries, status: entry.status as StandaloneRun['status'] };
}

/** Strict schema and bounded data; this is validation, not anti-cheat signing. */
export function validateSave(value: unknown, rosterIds: readonly string[]): StandaloneSave {
  const entry = record(value, ['version', 'options', 'stats', 'recentResults', 'processedResultIds', 'run'], 'Sauvegarde');
  ensure(entry.version === 1, 'Version de sauvegarde incompatible.');
  const knownIds = new Set(uniqueIds(rosterIds, MAX_ROSTER_SIZE, 'Catalogue connu'));
  const options = record(entry.options, ['soundtrack', 'reducedMotion', 'difficulty'], 'Options');
  ensure(typeof options.soundtrack === 'boolean' && typeof options.reducedMotion === 'boolean' && DIFFICULTIES.includes(options.difficulty as CombatAiDifficulty), 'Options incompatibles.');
  const counters = record(entry.stats, ['matches', 'wins', 'losses', 'draws', 'streak', 'bestStreak', 'bestSurvival', 'completedArcades'], 'Statistiques');
  ensure(Object.values(counters).every(value => integer(value, 0, MAX_SAVED_MATCHES)), 'Compteurs invalides.');
  const stats = { ...counters } as unknown as StandaloneStats;
  ensure(stats.matches === stats.wins + stats.losses + stats.draws && stats.streak <= stats.bestStreak && stats.bestStreak <= stats.wins && stats.bestSurvival <= Math.min(20, stats.wins) && stats.completedArcades * 5 <= stats.wins, 'Compteurs incohérents.');
  const processedResultIds = uniqueIds(entry.processedResultIds, MAX_SAVED_MATCHES, 'Journal des résultats');
  ensure(processedResultIds.length === stats.matches, 'Journal incomplet.');
  ensure(Array.isArray(entry.recentResults) && entry.recentResults.length === Math.min(stats.matches, RECENT_LIMIT), 'Historique incomplet.');
  const recentResults = entry.recentResults.map(parseResult);
  ensure(recentResults.every(result => result.mode !== 'training' && knownIds.has(result.fighterId) && knownIds.has(result.opponentId)), 'Historique avec personnage ou mode inconnu.');
  ensure(equalIds(recentResults.map(result => result.id), processedResultIds.slice(-RECENT_LIMIT).reverse()), 'Historique et journal divergent.');
  for (const [outcome, count] of [['won', stats.wins], ['lost', stats.losses], ['draw', stats.draws]] as const) {
    ensure(recentResults.filter(result => result.outcome === outcome).length <= count, 'Historique incompatible avec les compteurs.');
  }
  const firstNonWin = recentResults.findIndex(result => result.outcome !== 'won');
  const recentStreak = firstNonWin < 0 ? recentResults.length : firstNonWin;
  ensure(firstNonWin >= 0 || recentResults.length === stats.matches
    ? stats.streak === recentStreak
    : stats.streak >= recentStreak, 'Série de victoires incompatible avec l’historique.');
  return {
    version: 1,
    options: { soundtrack: options.soundtrack, reducedMotion: options.reducedMotion, difficulty: options.difficulty as CombatAiDifficulty },
    stats, recentResults, processedResultIds: [...processedResultIds], run: parseRun(entry.run, knownIds, stats),
  };
}

export function importSave(text: string, rosterIds: readonly string[]): StandaloneSave {
  ensure(typeof text === 'string' && text.length <= MAX_IMPORT_LENGTH, 'Sauvegarde trop volumineuse.');
  return validateSave(JSON.parse(text), rosterIds);
}

export function exportSave(save: StandaloneSave, rosterIds: readonly string[]): string {
  const text = JSON.stringify(validateSave(save, rosterIds), null, 2);
  ensure(text.length <= MAX_IMPORT_LENGTH, 'Sauvegarde trop volumineuse.');
  return text;
}

export function loadSave(storage: StorageLike | null | undefined, rosterIds: readonly string[]): LoadSaveResult {
  if (!storage) return { save: createDefaultSave(), status: 'unavailable', message: 'Stockage indisponible : progression conservée pour cette session seulement.' };
  let raw: string | null;
  try { raw = storage.getItem(STANDALONE_STORAGE_KEY); }
  catch { return { save: createDefaultSave(), status: 'unavailable', message: 'Lecture du stockage impossible : mode session.' }; }
  if (raw === null) return { save: createDefaultSave(), status: 'empty' };
  try { return { save: importSave(raw, rosterIds), status: 'ok' }; }
  catch { return { save: createDefaultSave(), status: 'invalid', message: 'Sauvegarde incompatible ou endommagée. La donnée existante reste intacte.' }; }
}

export function saveProgress(storage: StorageLike | null | undefined, save: StandaloneSave, rosterIds: readonly string[]): SaveWriteResult {
  if (!storage) return { ok: false, message: 'Stockage indisponible : progression conservée pour cette session seulement.' };
  try { storage.setItem(STANDALONE_STORAGE_KEY, exportSave(save, rosterIds)); return { ok: true }; }
  catch (error) { return { ok: false, message: `Sauvegarde impossible : ${error instanceof Error ? error.message : 'stockage indisponible'}` }; }
}
