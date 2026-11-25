import type { CombatAction } from './pentagram-combat';
import type { PentagramCinematicKind } from './pentagram-cinematics';

export const INFERNAL_STANCES: Readonly<Record<string, string>> = {
  charlie: '/assets/sprites/stances/charlie.webp',
  vaggie: '/assets/sprites/stances/vaggie.webp',
  alastor: '/assets/sprites/stances/alastor.webp',
  hb_loona: '/assets/sprites/stances/hb_loona.webp',
};

export interface InfernalActionPoses {
  ready: string;
  guard?: string;
  strike?: string;
  recoil?: string;
  layout: 'portrait' | 'landscape';
  /** Temporary static rendering while dedicated animation cycles remain unavailable. */
  fallbackToKeyPoses?: boolean;
}

function actionPoses(id: string): InfernalActionPoses {
  const base = '/assets/sprites/individual/' + id;
  return { ready: base + '-ready.webp', strike: base + '-strike.webp', recoil: base + '-recoil.webp', layout: 'portrait' };
}

function readyPose(id: string): InfernalActionPoses {
  return { ready: '/assets/sprites/individual/' + id + '-ready.webp', layout: 'portrait' };
}

function guardedActionPoses(id: string): InfernalActionPoses {
  return { ...actionPoses(id), guard: '/assets/sprites/individual/' + id + '-guard.webp' };
}

/** Individual key poses supplement the existing animation banks. */
export const INFERNAL_ACTION_POSES: Readonly<Record<string, InfernalActionPoses>> = {
  alastor: {
    ready: INFERNAL_STANCES.alastor,
    guard: '/assets/sprites/individual/alastor-guard.webp',
    recoil: '/assets/sprites/individual/alastor-recoil.webp',
    layout: 'landscape',
  },
  niffty: readyPose('niffty'),
  sirpentious: readyPose('sirpentious'),
  vox: guardedActionPoses('vox'),
  valentino: readyPose('valentino'),
  velvette: guardedActionPoses('velvette'),
  adam: readyPose('adam'),
  emily: readyPose('emily'),
  sera: readyPose('sera'),
  // Lute's two-arm S1 poses are available as one complete optional costume.
  // Her default animation banks retain their existing incarnation.
  carmilla: guardedActionPoses('carmilla'),
  rosie: readyPose('rosie'),
  zestial: readyPose('zestial'),
  zeezi: readyPose('zeezi'),
  baxter: readyPose('baxter'),
  abel: readyPose('abel'),
  hz_mimzy: readyPose('hz_mimzy'),
  hz_katie_killjoy: { ...guardedActionPoses('hz_katie_killjoy'), fallbackToKeyPoses: true },
  hz_tom_trench: { ...guardedActionPoses('hz_tom_trench'), fallbackToKeyPoses: true },
  hb_blitzo: guardedActionPoses('hb_blitzo'),
  hb_stolas: guardedActionPoses('hb_stolas'),
  hb_verosika: readyPose('hb_verosika'),
  hb_fizzarolli: guardedActionPoses('hb_fizzarolli'),
  hb_asmodeus: guardedActionPoses('hb_asmodeus'),
  hb_beelzebub: readyPose('hb_beelzebub'),
  hb_crimson: readyPose('hb_crimson'),
  hb_sallie_may: readyPose('hb_sallie_may'),
  hb_andrealphus: readyPose('hb_andrealphus'),
  hb_mammon: { ...guardedActionPoses('hb_mammon'), fallbackToKeyPoses: true },
  // These independent key poses are not newly authored animation banks.
  // Their near-square native canvases fit the existing contain frame by height.
  hb_vortex: { ...guardedActionPoses('hb_vortex'), layout: 'landscape', fallbackToKeyPoses: true },
  hb_glitz: { ...guardedActionPoses('hb_glitz'), layout: 'landscape', fallbackToKeyPoses: true },
  hb_glam: {
    ...readyPose('hb_glam'),
    guard: '/assets/sprites/individual/hb_glam-guard.webp',
    recoil: '/assets/sprites/individual/hb_glam-recoil.webp',
    layout: 'landscape', fallbackToKeyPoses: true,
  },
  angeldust: actionPoses('angeldust'),
  hb_striker: actionPoses('hb_striker'),
  lucifer: { ...actionPoses('lucifer'), guard: '/assets/sprites/individual/lucifer-guard.webp' },
  hb_moxxie: { ...actionPoses('hb_moxxie'), guard: '/assets/sprites/individual/hb_moxxie-guard.webp' },
  hb_millie: {
    ready: '/assets/sprites/individual/hb_millie-ready.webp',
    strike: '/assets/sprites/individual/hb_millie-strike.webp',
    layout: 'portrait',
  },
  husk: {
    ready: '/assets/sprites/individual/husk-ready.webp',
    guard: '/assets/sprites/individual/husk-guard.webp',
    layout: 'landscape',
  },
};

export function infernalActionPose(
  fighterId: string,
  action: CombatAction,
  cinematic: PentagramCinematicKind | null,
  elapsedMs = 0,
  startupMs = 0,
): string | undefined {
  const poses = INFERNAL_ACTION_POSES[fighterId];
  if (!poses || cinematic) return undefined;
  if (action === 'idle') return poses.ready;
  if (action === 'guard') return poses.guard ?? poses.ready;
  if (action === 'hit') return poses.recoil;
  if (action === 'light' && poses.strike) {
    // Keep the drawn contact aligned with the engine, including during hit-stop.
    // Other actions keep their authored multi-bank animations.
    return elapsedMs >= startupMs && elapsedMs < startupMs + 110 ? poses.strike : poses.ready;
  }
  return undefined;
}

/**
 * Fighters explicitly using authored poses keep that artwork between actions.
 * READY-only sets deliberately remain static until their own cycles are authored.
 * Stella has no accepted new drawing and uses her intact historical portrait.
 */
export function infernalFallbackPose(
  fighterId: string,
  action: CombatAction,
  cinematic: PentagramCinematicKind | null,
  elapsedMs = 0,
  startupMs = 0,
): string | undefined {
  if (fighterId === 'hb_stella') return '/assets/sprites/helluva/portraits/hb_stella.png';
  const poses = INFERNAL_ACTION_POSES[fighterId];
  if (!poses?.fallbackToKeyPoses) return undefined;
  if (cinematic) return poses.ready;
  if (action === 'ko' || action === 'hit') return poses.recoil ?? poses.ready;
  if (action === 'guard' || action === 'crouch') return poses.guard ?? poses.ready;
  if (action === 'light' || action === 'heavy' || action === 'special' || action === 'signature') {
    return elapsedMs >= startupMs && elapsedMs < startupMs + 110
      ? poses.strike ?? poses.ready : poses.ready;
  }
  return poses.ready;
}

interface InfernalCostumeBase {
  id: string;
  name: string;
  appearance: string;
  spoilerTier?: 'season_1' | 'season_2';
  layout?: 'portrait' | 'landscape';
  ready: string;
}
export type InfernalCostume = InfernalCostumeBase & ({
  /** One supplied READY image remains visible through every combat phase. */
  staticReadyOnly: true;
  strike?: never;
  recoil?: never;
  heavy?: never;
  crouch?: never;
  jump?: never;
} | {
  staticReadyOnly?: false;
  strike: string;
  recoil: string;
  heavy: string;
  crouch?: string;
  jump: string;
});
function costume(id: string, name: string, appearance: string, spoilerTier: 'season_1' | 'season_2' = 'season_1'): InfernalCostume {
  const base = '/assets/sprites/costumes/' + id;
  return { id, name, appearance, spoilerTier, ready: base + '.webp', strike: base + '-strike.webp', recoil: base + '-recoil.webp', heavy: base + '-heavy.webp', crouch: base + '-crouch.webp', jump: base + '-jump.webp' };
}

export const INFERNAL_COSTUMES: Readonly<Record<string, readonly InfernalCostume[]>> = {
  lute: [{
    ...costume('lute-pre-injury', 'Avant la blessure · saison 1', 'Hazbin Hotel · uniforme d’exorciste, incarnation avant la blessure du final S1'),
    // Reuse the published two-arm READY without duplicating the artwork.
    ready: '/assets/sprites/individual/lute-ready.webp',
    layout: 'portrait',
  }],
  carmilla: [{
    ...costume('carmilla-loose-hair', 'Cheveux lâchés', 'Hazbin Hotel · Hello Rosie! / Out for Love, saison 1, épisode 7'),
    // The crouch drawing remains unavailable; a ready fallback is not a new pose.
    crouch: undefined,
    layout: 'portrait',
  }],
  vaggie: [costume('vaggie-exorcist', 'Uniforme d’exorciste', 'Hazbin Hotel · Welcome to Heaven, saison 1, épisode 6')],
  hb_loona: [costume('hb_loona-human-disguise', 'Apparence humaine', 'Helluva Boss · Spring Broken, saison 1, épisode 3')],
  hb_stolas: [costume('hb_stolas-human-disguise', 'Apparence humaine', 'Helluva Boss · Seeing Stars, saison 2, épisode 2', 'season_2'), {
    id: 'hb_stolas-deposed-sinsmas',
    name: 'Stolas déchu · illustration statique',
    spoilerTier: 'season_2',
    appearance: 'Helluva Boss · Sinsmas, saison 2, épisode 12. Tenue narrative sans changement des techniques du jeu ; la même illustration reste affichée pendant toutes les actions.',
    ready: '/assets/sprites/costumes/hb_stolas-deposed-sinsmas.webp',
    layout: 'portrait',
    staticReadyOnly: true,
  }],
  hb_moxxie: [{
    ...costume('hb_moxxie-harvest-festival', 'Tenue du festival des moissons', 'Helluva Boss · The Harvest Moon Festival, saison 1, épisode 5'),
    layout: 'portrait',
  }, {
    id: 'hb_moxxie-moxxine',
    name: 'Moxxine · illustration statique',
    spoilerTier: 'season_2',
    appearance: 'Helluva Boss · Unhappy Campers, saison 2, épisode 5. Déguisement vestimentaire ; la même illustration reste affichée pendant toutes les actions.',
    ready: '/assets/sprites/costumes/hb_moxxie-moxxine.webp',
    layout: 'portrait',
    staticReadyOnly: true,
  }],
  hb_millie: [{
    id: 'hb_millie-millerd',
    name: 'Millerd · illustration statique',
    spoilerTier: 'season_2',
    appearance: 'Helluva Boss · Unhappy Campers, saison 2, épisode 5. Déguisement vestimentaire ; la même illustration reste affichée pendant toutes les actions.',
    ready: '/assets/sprites/costumes/hb_millie-millerd.webp',
    layout: 'portrait',
    staticReadyOnly: true,
  }],
  hb_vortex: [{
    id: 'hb_vortex-human-disguise',
    name: 'Apparence humaine · illustration statique',
    spoilerTier: 'season_1',
    appearance: 'Helluva Boss · Spring Broken, saison 1, épisode 3. La même illustration humaine reste affichée pendant toutes les actions.',
    ready: '/assets/sprites/costumes/hb_vortex-human-disguise.webp',
    layout: 'portrait',
    staticReadyOnly: true,
  }],
  hb_fizzarolli: [{
    id: 'hb_fizzarolli-casual-oops',
    name: 'Tenue décontractée · illustration statique',
    spoilerTier: 'season_2',
    appearance: 'Helluva Boss · Oops, saison 2, épisode 6. Tenue domestique de l’ouverture ; la même illustration reste affichée pendant toutes les actions.',
    ready: '/assets/sprites/costumes/hb_fizzarolli-casual-oops.webp',
    // This near-square canvas fits the existing landscape contain frame by height.
    layout: 'landscape',
    staticReadyOnly: true,
  }],
};
export const getInfernalCostume = (fighterId: string, costumeId?: string) =>
  INFERNAL_COSTUMES[fighterId]?.find(entry => entry.id === costumeId);

export function costumePose(outfit: InfernalCostume, action: CombatAction, cinematic: PentagramCinematicKind | null, isFinishing: boolean): string {
  if (outfit.staticReadyOnly) return outfit.ready;
  if (isFinishing) return outfit.heavy;
  if (action === 'ko' || action === 'hit') return outfit.recoil;
  if (cinematic) return outfit.ready;
  if (action === 'crouch') return outfit.crouch ?? outfit.ready;
  if (action === 'jump') return outfit.jump;
  if (action === 'heavy' || action === 'special' || action === 'signature') return outfit.heavy;
  if (action === 'light') return outfit.strike;
  return outfit.ready;
}
