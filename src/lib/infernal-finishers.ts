import type { CombatState } from './pentagram-combat';

export type FinishEffect = 'radio' | 'signal' | 'halo' | 'embers' | 'blade' | 'frost' | 'curtain' | 'shadow';

export interface InfernalFinish {
  title: string;
  effect: FinishEffect;
  impactSprite?: string;
}

// Original exhibition endings. Titles and stage effects describe the simulation.
export const INFERNAL_FINISHES: Readonly<Record<string, InfernalFinish>> = {
  charlie: { title: 'Le rideau de l’aube', effect: 'embers', impactSprite: '/assets/sprites/finishers/charlie.webp' },
  vaggie: { title: 'La dernière sentinelle', effect: 'blade' },
  angeldust: { title: 'Salut en six temps', effect: 'curtain' },
  alastor: { title: 'Plus rien sur les ondes', effect: 'radio' },
  husk: { title: 'La banque ferme', effect: 'curtain' },
  niffty: { title: 'Dernier point de couture', effect: 'blade' },
  sirpentious: { title: 'Compte à rebours du dirigeable', effect: 'embers' },
  lucifer: { title: 'Rappel du roi', effect: 'halo' },
  cherribomb: { title: 'Bouquet de minuit', effect: 'embers' },
  vox: { title: 'Extinction du signal', effect: 'signal' },
  valentino: { title: 'Fumée de fin de bobine', effect: 'shadow' },
  velvette: { title: 'Hors tendance', effect: 'signal' },
  adam: { title: 'Accord de l’Extermination', effect: 'halo' },
  emily: { title: 'Coda du chœur', effect: 'halo' },
  sera: { title: 'Le cercle se ferme', effect: 'halo' },
  lute: { title: 'Silence des lames', effect: 'blade' },
  carmilla: { title: 'La dernière pointe', effect: 'blade' },
  rosie: { title: 'Rideau sur Cannibal Town', effect: 'curtain' },
  zestial: { title: 'Le dernier fil', effect: 'shadow' },
  zeezi: { title: 'La piste s’effondre', effect: 'embers' },
  baxter: { title: 'Fin de l’expérience', effect: 'signal' },
  abel: { title: 'Cadence de l’aube', effect: 'halo' },
  hb_blitzo: { title: 'Contrat tamponné', effect: 'embers', impactSprite: '/assets/sprites/finishers/hb_blitzo.webp' },
  hb_moxxie: { title: 'La dernière mesure', effect: 'curtain' },
  hb_millie: { title: 'Moisson de Wrath', effect: 'blade' },
  hb_loona: { title: 'Morsure au clair de lune', effect: 'shadow' },
  hb_stolas: { title: 'Éclipse du grimoire', effect: 'shadow' },
  hb_striker: { title: 'Le dernier mandat', effect: 'blade' },
  hb_verosika: { title: 'Micro coupé', effect: 'curtain' },
  hb_fizzarolli: { title: 'Dernière pirouette', effect: 'curtain' },
  hb_asmodeus: { title: 'La salle s’embrase', effect: 'embers' },
  hb_beelzebub: { title: 'Extinction des néons', effect: 'signal' },
  hb_crimson: { title: 'Ardoise soldée', effect: 'shadow' },
  hb_andrealphus: { title: 'Palais de glace', effect: 'frost' },
};

export const FINISH_INPUT_MS = 3200;
export const FINISH_CINEMATIC_MS = 1500;

export function canOfferFinish(state: CombatState): boolean {
  if (state.active || !state.matchWinner || state.winner !== state.matchWinner) return false;
  const defeatedHp = state.matchWinner === 'one' ? state.hpTwo : state.hpOne;
  return defeatedHp === 0 && (state.matchWinner === 'one' ? state.hpOne : state.hpTwo) > 0;
}
