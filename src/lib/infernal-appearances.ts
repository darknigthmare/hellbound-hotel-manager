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
}

function actionPoses(id: string): InfernalActionPoses {
  const base = '/assets/sprites/individual/' + id;
  return { ready: base + '-ready.webp', strike: base + '-strike.webp', recoil: base + '-recoil.webp', layout: 'portrait' };
}

function readyPose(id: string): InfernalActionPoses {
  return { ready: '/assets/sprites/individual/' + id + '-ready.webp', layout: 'portrait' };
}

/** Individual key poses supplement the existing animation banks. */
export const INFERNAL_ACTION_POSES: Readonly<Record<string, InfernalActionPoses>> = {
  niffty: readyPose('niffty'),
  sirpentious: readyPose('sirpentious'),
  vox: readyPose('vox'),
  valentino: readyPose('valentino'),
  velvette: readyPose('velvette'),
  adam: readyPose('adam'),
  emily: readyPose('emily'),
  sera: readyPose('sera'),
  // Lute's S1 ready candidate has two normal arms. Keep it outside the active
  // registry until the older gold-arm animation banks are harmonized with it.
  carmilla: readyPose('carmilla'),
  rosie: readyPose('rosie'),
  zestial: readyPose('zestial'),
  zeezi: readyPose('zeezi'),
  baxter: readyPose('baxter'),
  abel: readyPose('abel'),
  hz_mimzy: readyPose('hz_mimzy'),
  hb_blitzo: readyPose('hb_blitzo'),
  hb_stolas: readyPose('hb_stolas'),
  hb_verosika: readyPose('hb_verosika'),
  hb_fizzarolli: readyPose('hb_fizzarolli'),
  hb_asmodeus: readyPose('hb_asmodeus'),
  hb_beelzebub: readyPose('hb_beelzebub'),
  hb_crimson: readyPose('hb_crimson'),
  hb_sallie_may: readyPose('hb_sallie_may'),
  hb_andrealphus: readyPose('hb_andrealphus'),
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

export interface InfernalCostume {
  id: string;
  name: string;
  appearance: string;
  layout?: 'portrait' | 'landscape';
  ready: string;
  strike: string;
  recoil: string;
  heavy: string;
  crouch?: string;
  jump: string;
}
function costume(id: string, name: string, appearance: string): InfernalCostume {
  const base = '/assets/sprites/costumes/' + id;
  return { id, name, appearance, ready: base + '.webp', strike: base + '-strike.webp', recoil: base + '-recoil.webp', heavy: base + '-heavy.webp', crouch: base + '-crouch.webp', jump: base + '-jump.webp' };
}

export const INFERNAL_COSTUMES: Readonly<Record<string, readonly InfernalCostume[]>> = {
  carmilla: [{
    ...costume('carmilla-loose-hair', 'Cheveux lâchés', 'Hazbin Hotel · Hello Rosie! / Out for Love, saison 1, épisode 7'),
    // The crouch drawing remains unavailable; a ready fallback is not a new pose.
    crouch: undefined,
    layout: 'portrait',
  }],
  vaggie: [costume('vaggie-exorcist', 'Uniforme d’exorciste', 'Hazbin Hotel · Welcome to Heaven, saison 1, épisode 6')],
  hb_loona: [costume('hb_loona-human-disguise', 'Apparence humaine', 'Helluva Boss · Spring Broken, saison 1, épisode 3')],
  hb_stolas: [costume('hb_stolas-human-disguise', 'Apparence humaine', 'Helluva Boss · Seeing Stars, saison 2, épisode 2')],
  hb_moxxie: [{
    ...costume('hb_moxxie-harvest-festival', 'Tenue du festival des moissons', 'Helluva Boss · The Harvest Moon Festival, saison 1, épisode 5'),
    layout: 'portrait',
  }],
};
export const getInfernalCostume = (fighterId: string, costumeId?: string) =>
  INFERNAL_COSTUMES[fighterId]?.find(entry => entry.id === costumeId);

export function costumePose(outfit: InfernalCostume, action: CombatAction, cinematic: PentagramCinematicKind | null, isFinishing: boolean): string {
  if (isFinishing) return outfit.heavy;
  if (action === 'ko' || action === 'hit') return outfit.recoil;
  if (cinematic) return outfit.ready;
  if (action === 'crouch') return outfit.crouch ?? outfit.ready;
  if (action === 'jump') return outfit.jump;
  if (action === 'heavy' || action === 'special' || action === 'signature') return outfit.heavy;
  if (action === 'light') return outfit.strike;
  return outfit.ready;
}
