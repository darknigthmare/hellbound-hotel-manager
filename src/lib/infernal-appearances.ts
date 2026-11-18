import type { CombatAction } from './pentagram-combat';
import type { PentagramCinematicKind } from './pentagram-cinematics';

export const INFERNAL_STANCES: Readonly<Record<string, string>> = {
  charlie: '/assets/sprites/stances/charlie.webp',
  vaggie: '/assets/sprites/stances/vaggie.webp',
  alastor: '/assets/sprites/stances/alastor.webp',
  hb_loona: '/assets/sprites/stances/hb_loona.webp',
};

export interface InfernalCostume {
  id: string;
  name: string;
  appearance: string;
  ready: string;
  strike: string;
  recoil: string;
  heavy: string;
}
function costume(id: string, name: string, appearance: string): InfernalCostume {
  const base = '/assets/sprites/costumes/' + id;
  return { id, name, appearance, ready: base + '.webp', strike: base + '-strike.webp', recoil: base + '-recoil.webp', heavy: base + '-heavy.webp' };
}

export const INFERNAL_COSTUMES: Readonly<Record<string, readonly InfernalCostume[]>> = {
  vaggie: [costume('vaggie-exorcist', 'Uniforme d’exorciste', 'Hazbin Hotel · Welcome to Heaven, saison 1, épisode 6')],
  hb_loona: [costume('hb_loona-human-disguise', 'Apparence humaine', 'Helluva Boss · Spring Broken, saison 1, épisode 3')],
};
export const getInfernalCostume = (fighterId: string, costumeId?: string) =>
  INFERNAL_COSTUMES[fighterId]?.find(entry => entry.id === costumeId);

export function costumePose(outfit: InfernalCostume, action: CombatAction, cinematic: PentagramCinematicKind | null, isFinishing: boolean): string {
  if (isFinishing) return outfit.heavy;
  if (action === 'ko' || action === 'hit') return outfit.recoil;
  if (cinematic) return outfit.ready;
  if (action === 'heavy' || action === 'special' || action === 'signature') return outfit.heavy;
  if (action === 'light') return outfit.strike;
  return outfit.ready;
}
