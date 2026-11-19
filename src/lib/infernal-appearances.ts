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

/** Individual key poses supplement the existing animation banks. */
export const INFERNAL_ACTION_POSES: Readonly<Record<string, InfernalActionPoses>> = {
  angeldust: actionPoses('angeldust'),
  hb_striker: actionPoses('hb_striker'),
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
  ready: string;
  strike: string;
  recoil: string;
  heavy: string;
  crouch: string;
  jump: string;
}
function costume(id: string, name: string, appearance: string): InfernalCostume {
  const base = '/assets/sprites/costumes/' + id;
  return { id, name, appearance, ready: base + '.webp', strike: base + '-strike.webp', recoil: base + '-recoil.webp', heavy: base + '-heavy.webp', crouch: base + '-crouch.webp', jump: base + '-jump.webp' };
}

export const INFERNAL_COSTUMES: Readonly<Record<string, readonly InfernalCostume[]>> = {
  vaggie: [costume('vaggie-exorcist', 'Uniforme d’exorciste', 'Hazbin Hotel · Welcome to Heaven, saison 1, épisode 6')],
  hb_loona: [costume('hb_loona-human-disguise', 'Apparence humaine', 'Helluva Boss · Spring Broken, saison 1, épisode 3')],
  hb_stolas: [costume('hb_stolas-human-disguise', 'Apparence humaine', 'Helluva Boss · Seeing Stars, saison 2, épisode 2')],
};
export const getInfernalCostume = (fighterId: string, costumeId?: string) =>
  INFERNAL_COSTUMES[fighterId]?.find(entry => entry.id === costumeId);

export function costumePose(outfit: InfernalCostume, action: CombatAction, cinematic: PentagramCinematicKind | null, isFinishing: boolean): string {
  if (isFinishing) return outfit.heavy;
  if (action === 'ko' || action === 'hit') return outfit.recoil;
  if (cinematic) return outfit.ready;
  if (action === 'crouch') return outfit.crouch;
  if (action === 'jump') return outfit.jump;
  if (action === 'heavy' || action === 'special' || action === 'signature') return outfit.heavy;
  if (action === 'light') return outfit.strike;
  return outfit.ready;
}
