import { getInfernalCostume } from '../lib/infernal-appearances';
import { CURRENT_STORY_ROUTE_VERSION, getStoryRoute, storyAvailable, type StoryRouteVersion } from './campaign';
import { GLOBAL_CAMPAIGN, GLOBAL_CAMPAIGN_ENDING_ID, campaignAvailable } from './campaign-global';
import type { CombatAiDifficulty } from '../lib/pentagram-ai';
import { STANDALONE_STAGES, type PentagramStageId } from '../lib/pentagram-stages';

/** Pure progression. Browser storage is injected; hotel data is never imported. */
export type StandaloneMode = 'versus' | 'local' | 'training' | 'arcade' | 'survival' | 'boss-rush' | 'story' | 'campaign' | 'tournament';
export type RunMode = Extract<StandaloneMode, 'arcade' | 'survival' | 'boss-rush' | 'story' | 'campaign' | 'tournament'>;
export type MatchOutcome = 'won' | 'lost' | 'draw';

export const STANDALONE_STORAGE_KEY = 'hellbound_infernal_versus_v1';
export const MAX_SAVED_MATCHES = 10_000;
export const MAX_IMPORT_LENGTH = 1_500_000;
const MAX_ROSTER_SIZE = 512;
const RECENT_LIMIT = 30;
const MODES: readonly StandaloneMode[] = ['versus', 'local', 'training', 'arcade', 'survival', 'boss-rush', 'story', 'campaign', 'tournament'];
const RUN_MODES: readonly RunMode[] = ['arcade', 'survival', 'boss-rush', 'story', 'campaign', 'tournament'];
const DIFFICULTIES: readonly CombatAiDifficulty[] = ['rookie', 'standard', 'overlord'];
const STAGE_PRESENTATIONS = ['alive', 'static', 'reduced'] as const;

export interface StandaloneOptions {
  soundtrack: boolean;
  reducedMotion: boolean;
  difficulty: CombatAiDifficulty;
  stagePresentation?: 'alive' | 'static' | 'reduced';
  /** Later-season scenery and reserve art require a separate, explicit opt-in. */
  allowSeasonThree?: boolean;
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
  /** Absent in pre-V3 saves; those stories always resume the version-1 route. */
  routeVersion?: StoryRouteVersion;
  campaignId?: typeof GLOBAL_CAMPAIGN.id;
  campaignVersion?: typeof GLOBAL_CAMPAIGN.version;
}

export interface StoryCompletion {
  fighterId: string;
  routeVersion: StoryRouteVersion;
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
  wardrobe?: Partial<Record<'one' | 'two', Record<string, string>>>;
  options: StandaloneOptions;
  stats: StandaloneStats;
  /** Completed story routes, retained after the current run is replaced. */
  storyEndings: string[];
  /** Versioned unlocks prevent old victories from unlocking rewritten endings. */
  storyCompletions: StoryCompletion[];
  campaignEndings: string[];
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


export interface TournamentBout {
  left: string;
  right: string;
  winner: string;
}

export interface TournamentTable {
  rounds: TournamentBout[][];
  opponentIds: string[];
  champion: string;
}

/** A seeded draw keeps the same entrants, CPU winners and bracket after a reload. */
export function tournamentTable(fighterId: string, rosterIds: readonly string[], seed: number, eliminatedAt?: number): TournamentTable {
  const random = randomSource(seed);
  const rivals = [...new Set(rosterIds)].filter(id => id !== fighterId).sort();
  ensure(rivals.length > 0, 'Le tournoi demande au moins deux participants.');
  const size = rivals.length >= 7 ? 8 : rivals.length >= 3 ? 4 : 2;
  let entrants = shuffled([fighterId, ...shuffled(rivals, random).slice(0, size - 1)], random);
  const rounds: TournamentBout[][] = [];
  const opponentIds: string[] = [];
  while (entrants.length > 1) {
    const bouts: TournamentBout[] = [];
    for (let index = 0; index < entrants.length; index += 2) {
      const left = entrants[index];
      const right = entrants[index + 1];
      // Reserve one roll for every bout. Other branches remain stable after a player defeat.
      const cpuWinner = random() < 0.5 ? left : right;
      const playerBout = left === fighterId || right === fighterId;
      const rival = left === fighterId ? right : left;
      if (playerBout) opponentIds.push(rival);
      const winner = playerBout ? (rounds.length === eliminatedAt ? rival : fighterId) : cpuWinner;
      bouts.push({ left, right, winner });
    }
    rounds.push(bouts);
    entrants = bouts.map(bout => bout.winner);
  }
  return { rounds, opponentIds, champion: entrants[0] };
}

export function createDefaultSave(): StandaloneSave {
  return {
    version: 1,
    options: { soundtrack: true, reducedMotion: false, difficulty: 'standard', stagePresentation: 'alive', allowSeasonThree: false },
    stats: { matches: 0, wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0, bestSurvival: 0, completedArcades: 0 },
    storyEndings: [], storyCompletions: [], campaignEndings: [], recentResults: [], processedResultIds: [], run: null,
  };
}

/** Candidate ordering does not change a seeded route. Small pools may repeat. */
export function buildRun(mode: RunMode, fighterId: string, candidateIds: readonly string[], bossIds: readonly string[], seed: number, routeVersion: StoryRouteVersion = CURRENT_STORY_ROUTE_VERSION): StandaloneRun {
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
  let opponentIds: string[];
  if (mode === 'story') {
    ensure(routeVersion === 1 || routeVersion === 3, 'Version du récit inconnue.');
    ensure(storyAvailable(fighterId, rosterIds, { routeVersion }), 'Cette histoire demande des adversaires absents des filtres sélectionnés.');
    opponentIds = getStoryRoute(fighterId, routeVersion)!.chapters.map(chapter => chapter.opponent);
  } else if (mode === 'campaign') {
    ensure(fighterId === GLOBAL_CAMPAIGN.chapters[0].fighterId, 'La campagne commence avec Charlie.');
    ensure(campaignAvailable(rosterIds), 'La campagne demande des acteurs absents des filtres sélectionnés.');
    opponentIds = GLOBAL_CAMPAIGN.chapters.map(chapter => chapter.opponentId);
  } else if (mode === 'tournament') {
    opponentIds = tournamentTable(fighterId, rosterIds, seed).opponentIds;
  } else {
    const random = randomSource(seed);
    const length = mode === 'arcade' ? 5 : mode === 'survival' ? 20 : pool.length;
    opponentIds = [];
    while (opponentIds.length < length) {
      const deck = shuffled(pool, random);
      if (deck.length > 1 && deck[0] === opponentIds[opponentIds.length - 1]) [deck[0], deck[1]] = [deck[1], deck[0]];
      opponentIds.push(...deck.slice(0, length - opponentIds.length));
    }
  }
  return {
    mode, fighterId, seed, rosterIds, bossIds: availableBosses, opponentIds, index: 0, wins: 0, retries: 0, status: 'active',
    ...(mode === 'story' ? { routeVersion } : {}),
    ...(mode === 'campaign' ? { campaignId: GLOBAL_CAMPAIGN.id, campaignVersion: GLOBAL_CAMPAIGN.version } : {}),
  };
}

export function buildCampaignRun(candidateIds: readonly string[], seed: number): StandaloneRun {
  ensure(campaignAvailable(candidateIds), 'La campagne demande des acteurs absents des filtres sélectionnés.');
  return buildRun('campaign', GLOBAL_CAMPAIGN.chapters[0].fighterId, candidateIds, [], seed);
}

export function getRunStory(run: StandaloneRun) {
  return run.mode === 'story' ? getStoryRoute(run.fighterId, run.routeVersion ?? 1) : undefined;
}

/** Completion belongs to one authored route; a legacy ending never unlocks V3. */
export function storyEndingUnlocked(save: StandaloneSave, fighterId: string, routeVersion: StoryRouteVersion = CURRENT_STORY_ROUTE_VERSION): boolean {
  return save.storyCompletions.some(entry => entry.fighterId === fighterId && entry.routeVersion === routeVersion);
}

/** Selection and automatic arena rotation share the same explicit S3 gate. */
export function getAvailableStandaloneStages(options: Pick<StandaloneOptions, 'allowSeasonThree'> = {}) {
  return STANDALONE_STAGES.filter(stage => stage.spoilerTier !== 'season_3' || options.allowSeasonThree === true);
}

/** The active actor may change by chapter; results must match this exact encounter. */
export function getRunEncounter(run: StandaloneRun, options: Pick<StandaloneOptions, 'allowSeasonThree'> = {}): { fighterId: string; opponentId: string; stageId: PentagramStageId } {
  ensure(run.status !== 'complete' && integer(run.index, 0, run.opponentIds.length - 1), 'Ce parcours est déjà terminé.');
  if (run.mode === 'campaign') {
    const chapter = GLOBAL_CAMPAIGN.chapters[run.index];
    return { fighterId: chapter.fighterId, opponentId: chapter.opponentId, stageId: chapter.stageId };
  }
  const chapter = getRunStory(run)?.chapters[run.index];
  const stages = getAvailableStandaloneStages(options);
  return {
    fighterId: run.fighterId,
    opponentId: run.opponentIds[run.index],
    stageId: chapter?.stage ?? stages[run.index % stages.length].id,
  };
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
  ensure(run.mode !== 'tournament', 'Une élimination clôt le tournoi.');
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
    ensure(run?.status === 'active' && run.mode === result.mode, 'Ce résultat ne correspond pas au duel courant du parcours.');
    const encounter = getRunEncounter(run, save.options);
    ensure(encounter.fighterId === result.fighterId && encounter.opponentId === result.opponentId, 'Ce résultat ne correspond pas au duel courant du parcours.');
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
  const unlockEnding = result.mode === 'story' && won && run?.status === 'complete' && !save.storyEndings.includes(result.fighterId);
  const storyEndings = unlockEnding ? [...save.storyEndings, result.fighterId] : save.storyEndings;
  const routeVersion = run?.routeVersion ?? 1;
  const unlockStoryVersion = result.mode === 'story' && won && run?.status === 'complete'
    && !storyEndingUnlocked(save, result.fighterId, routeVersion);
  const storyCompletions = unlockStoryVersion ? [...save.storyCompletions, { fighterId: result.fighterId, routeVersion }] : save.storyCompletions;
  const unlockCampaign = result.mode === 'campaign' && won && run?.status === 'complete' && !save.campaignEndings.includes(GLOBAL_CAMPAIGN_ENDING_ID);
  const campaignEndings = unlockCampaign ? [...save.campaignEndings, GLOBAL_CAMPAIGN_ENDING_ID] : save.campaignEndings;
  return { ...save, stats, run, storyEndings, storyCompletions, campaignEndings, recentResults: [result, ...save.recentResults].slice(0, RECENT_LIMIT), processedResultIds: [...save.processedResultIds, result.id] };
}

function parseRun(value: unknown, knownIds: ReadonlySet<string>, stats: StandaloneStats): StandaloneRun | null {
  if (value === null) return null;
  const keys = ['mode', 'fighterId', 'seed', 'rosterIds', 'bossIds', 'opponentIds', 'index', 'wins', 'retries', 'status'];
  // Only old personal stories may omit the version. Campaigns were introduced versioned.
  if (value && typeof value === 'object' && 'mode' in value) {
    if (value.mode === 'story' && Object.hasOwn(value, 'routeVersion')) keys.push('routeVersion');
    if (value.mode === 'campaign') keys.push('campaignId', 'campaignVersion');
  }
  const entry = record(value, keys, 'Parcours');
  ensure(RUN_MODES.includes(entry.mode as RunMode) && validId(entry.fighterId) && knownIds.has(entry.fighterId), 'Identité du parcours invalide.');
  ensure(integer(entry.seed, 0, 0xffffffff), 'Seed du parcours invalide.');
  const rosterIds = uniqueIds(entry.rosterIds, MAX_ROSTER_SIZE, 'Catalogue du parcours');
  const bossIds = uniqueIds(entry.bossIds, MAX_ROSTER_SIZE, 'Boss du parcours');
  const opponentIds = ids(entry.opponentIds, MAX_ROSTER_SIZE, 'Adversaires');
  ensure(rosterIds.every(id => knownIds.has(id)), 'Le parcours contient un personnage inconnu.');
  const routeVersion = entry.routeVersion ?? 1;
  if (entry.mode === 'story') ensure(routeVersion === 1 || routeVersion === 3, 'Version du récit incompatible.');
  if (entry.mode === 'campaign') ensure(entry.campaignId === GLOBAL_CAMPAIGN.id && entry.campaignVersion === GLOBAL_CAMPAIGN.version, 'Version de campagne incompatible.');
  const expected = buildRun(entry.mode as RunMode, entry.fighterId, rosterIds, bossIds, entry.seed, routeVersion as StoryRouteVersion);
  ensure(equalIds(rosterIds, expected.rosterIds) && equalIds(bossIds, expected.bossIds) && equalIds(opponentIds, expected.opponentIds), 'Parcours incompatible avec sa seed ou son catalogue.');
  ensure(integer(entry.index, 0, opponentIds.length) && entry.wins === entry.index, 'Avancée du parcours incohérente.');
  ensure(integer(entry.retries, 0, MAX_SAVED_MATCHES) && ['active', 'complete', 'failed'].includes(entry.status as string), 'État du parcours invalide.');
  ensure((entry.status === 'complete') === (entry.index === opponentIds.length), 'État final du parcours incohérent.');
  ensure(entry.wins <= stats.wins && entry.retries <= stats.losses, 'Parcours sans résultats correspondants.');
  if (entry.status === 'failed') ensure(stats.losses > entry.retries, 'Échec sans défaite enregistrée.');
  if (entry.mode === 'tournament') ensure(entry.retries === 0, 'Un participant éliminé ne peut pas reprendre le tournoi.');
  if (entry.mode === 'survival') ensure(entry.wins <= stats.bestSurvival, 'Record de survie incohérent.');
  if (entry.mode === 'arcade' && entry.status === 'complete') ensure(stats.completedArcades > 0, 'Parcours Arcade non comptabilisé.');
  return { ...expected, index: entry.index, wins: entry.wins, retries: entry.retries, status: entry.status as StandaloneRun['status'] };
}

/** Strict schema and bounded data; this is validation, not anti-cheat signing. */
export function validateSave(value: unknown, rosterIds: readonly string[]): StandaloneSave {
  const keys = ['version', 'options', 'stats', 'recentResults', 'processedResultIds', 'run'];
  // Additive migration keeps both the original storage key and the old route content.
  for (const optional of ['storyEndings', 'storyCompletions', 'campaignEndings', 'wardrobe']) {
    if (value && typeof value === 'object' && Object.hasOwn(value, optional)) keys.push(optional);
  }
  const entry = record(value, keys, 'Sauvegarde');
  ensure(entry.version === 1, 'Version de sauvegarde incompatible.');
  const knownIds = new Set(uniqueIds(rosterIds, MAX_ROSTER_SIZE, 'Catalogue connu'));
  let wardrobe: StandaloneSave['wardrobe'];
  if (entry.wardrobe !== undefined) {
    ensure(entry.wardrobe && typeof entry.wardrobe === 'object' && !Array.isArray(entry.wardrobe), 'Vestiaire invalide.');
    wardrobe = {};
    for (const [side, selections] of Object.entries(entry.wardrobe)) {
      ensure((side === 'one' || side === 'two') && selections && typeof selections === 'object' && !Array.isArray(selections), 'Sélection de tenues invalide.');
      const outfits = Object.entries(selections);
      ensure(outfits.length <= knownIds.size, 'Trop de tenues enregistrées.');
      const validated: Record<string, string> = {};
      for (const [id, choice] of outfits) {
        ensure(knownIds.has(id) && typeof choice === 'string' && getInfernalCostume(id, choice), 'Tenue inconnue.');
        validated[id] = choice;
      }
      wardrobe[side] = validated;
    }
  }
  const optionKeys = ['soundtrack', 'reducedMotion', 'difficulty'];
  if (entry.options && typeof entry.options === 'object' && Object.hasOwn(entry.options, 'stagePresentation')) optionKeys.push('stagePresentation');
  if (entry.options && typeof entry.options === 'object' && Object.hasOwn(entry.options, 'allowSeasonThree')) optionKeys.push('allowSeasonThree');
  const options = record(entry.options, optionKeys, 'Options');
  ensure(typeof options.soundtrack === 'boolean' && typeof options.reducedMotion === 'boolean' && DIFFICULTIES.includes(options.difficulty as CombatAiDifficulty), 'Options incompatibles.');
  // Old reduced-motion saves keep a reduced stage presentation on first load.
  const stagePresentation = options.stagePresentation ?? (options.reducedMotion ? 'reduced' : 'alive');
  ensure(STAGE_PRESENTATIONS.includes(stagePresentation as typeof STAGE_PRESENTATIONS[number]), 'Présentation du décor incompatible.');
  // Absence in a legacy save never unlocks newer-season artwork.
  const allowSeasonThree = Object.hasOwn(options, 'allowSeasonThree') ? options.allowSeasonThree : false;
  ensure(typeof allowSeasonThree === 'boolean', 'Option de saison 3 incompatible.');
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
  const run = parseRun(entry.run, knownIds, stats);
  const completedStory = run?.mode === 'story' && run.status === 'complete' ? run : null;
  const legacyEndings = completedStory && completedStory.routeVersion === 1 ? [completedStory.fighterId] : [];
  const storyEndings = entry.storyEndings === undefined ? legacyEndings : uniqueIds(entry.storyEndings, MAX_ROSTER_SIZE, 'Épilogues');
  ensure(storyEndings.every(id => knownIds.has(id) && (getStoryRoute(id, 1) || getStoryRoute(id, 3))), 'Épilogue inconnu.');

  let storyCompletions: StoryCompletion[];
  if (entry.storyCompletions === undefined) {
    // Before this update all gallery unlocks referred to version 1, even when
    // another mode had already replaced the completed story in the current run.
    storyCompletions = storyEndings.map(fighterId => ({ fighterId, routeVersion: 1 }));
  } else {
    ensure(Array.isArray(entry.storyCompletions) && entry.storyCompletions.length <= MAX_ROSTER_SIZE * 2, 'Épilogues versionnés invalides.');
    storyCompletions = entry.storyCompletions.map(value => {
      const completion = record(value, ['fighterId', 'routeVersion'], 'Épilogue versionné');
      ensure(validId(completion.fighterId) && knownIds.has(completion.fighterId)
        && (completion.routeVersion === 1 || completion.routeVersion === 3)
        && getStoryRoute(completion.fighterId, completion.routeVersion), 'Version d’épilogue inconnue.');
      return { fighterId: completion.fighterId, routeVersion: completion.routeVersion } as StoryCompletion;
    });
    ensure(new Set(storyCompletions.map(item => `${item.fighterId}:${item.routeVersion}`)).size === storyCompletions.length, 'Épilogue versionné en double.');
  }
  ensure(equalIds([...storyEndings].sort(), [...new Set(storyCompletions.map(item => item.fighterId))].sort()), 'Collection d’épilogues incohérente.');
  ensure(!completedStory || storyCompletions.some(item => item.fighterId === completedStory.fighterId && item.routeVersion === completedStory.routeVersion), 'Épilogue du parcours terminé absent.');

  const campaignEndings = entry.campaignEndings === undefined ? [] : uniqueIds(entry.campaignEndings, 1, 'Épilogues de campagne');
  ensure(campaignEndings.every(id => id === GLOBAL_CAMPAIGN_ENDING_ID), 'Épilogue de campagne inconnu.');
  ensure(run?.mode !== 'campaign' || run.status !== 'complete' || campaignEndings.includes(GLOBAL_CAMPAIGN_ENDING_ID), 'Épilogue de campagne terminée absent.');
  ensure(storyCompletions.length * 3 + campaignEndings.length * GLOBAL_CAMPAIGN.chapters.length + stats.completedArcades * 5 <= stats.wins, 'Épilogues sans les victoires correspondantes.');
  return {
    version: 1,
    options: { soundtrack: options.soundtrack, reducedMotion: options.reducedMotion, difficulty: options.difficulty as CombatAiDifficulty, stagePresentation: stagePresentation as StandaloneOptions['stagePresentation'], allowSeasonThree },
    ...(wardrobe ? { wardrobe } : {}),
    stats, storyEndings: [...storyEndings], storyCompletions, campaignEndings: [...campaignEndings], recentResults, processedResultIds: [...processedResultIds], run,
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
