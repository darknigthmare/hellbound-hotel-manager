import { HAZBIN_DIRECTORY_PROFILES } from '../data/hazbin-directory';
import { HELLUVA_CHARACTERS } from '../expansions/helluva-boss/data';
import { getCombatSpriteAsset } from '../lib/character-sprites';
import { toHazbinArenaCharacter } from '../lib/hazbin-arena-fighters';
import { FIGHTER_PROFILES, type FighterProfile } from '../lib/pentagram-fighters';
import type { Character, TimelineState } from '../types';

export interface StandaloneFighter {
  character: Character;
  profile: FighterProfile;
  franchise: 'Hazbin Hotel' | 'Helluva Boss';
  source: string;
  spoiler: 'season_1' | 'season_2';
}

// These are original, balanced exhibition kits. Names and motifs refer to the
// series; damage, range, timing and match outcomes are game-design adaptations.
export const HELLUVA_COMBAT_PROFILES: Readonly<Record<string, FighterProfile>> = {
  hb_blitzo: { id: 'hb_blitzo', style: 'Improvisation I.M.P.', archetype: 'Pression polyvalente', combatStyle: 'balanced', evidence: 'onscreen', power: 13, range: 68, speed: 78, guard: 54, tensionGain: 16, basicMove: 'Coup de crosse', heavyMove: 'Rafale de couverture', specialMove: 'Assaut I.M.P.' },
  hb_moxxie: { id: 'hb_moxxie', style: 'Arsenal de précision', archetype: 'Contrôle à distance', combatStyle: 'zoner', evidence: 'onscreen', power: 12, range: 88, speed: 54, guard: 62, tensionGain: 16, basicMove: 'Riposte au pistolet', heavyMove: 'Tir de précision', specialMove: 'Plan de tir croisé' },
  hb_millie: { id: 'hb_millie', style: 'Fureur de Wrath', archetype: 'Combat rapproché', combatStyle: 'rushdown', evidence: 'onscreen', power: 15, range: 48, speed: 88, guard: 52, tensionGain: 18, basicMove: 'Taille rapide', heavyMove: 'Revers de hache', specialMove: 'Déchaînement de Wrath' },
  hb_loona: { id: 'hb_loona', style: 'Poursuite hellhound', archetype: 'Mobilité et griffes', combatStyle: 'rushdown', evidence: 'onscreen', power: 14, range: 52, speed: 90, guard: 48, tensionGain: 17, basicMove: 'Griffe courte', heavyMove: 'Bond prédateur', specialMove: 'Traque hellhound' },
  hb_stolas: { id: 'hb_stolas', style: 'Arts de la Goetia', archetype: 'Contrôle magique', combatStyle: 'zoner', evidence: 'onscreen', power: 16, range: 92, speed: 44, guard: 62, tensionGain: 12, basicMove: 'Geste astral', heavyMove: 'Sceau de passage', specialMove: 'Manifestation Goetia' },
  hb_striker: { id: 'hb_striker', style: 'Chasseur de primes', archetype: 'Duelliste à longue portée', combatStyle: 'duelist', evidence: 'onscreen', power: 15, range: 80, speed: 72, guard: 66, tensionGain: 13, basicMove: 'Frappe de couteau', heavyMove: 'Ligne de mire', specialMove: 'Contrat du chasseur' },
  hb_verosika: { id: 'hb_verosika', style: 'Présence de scène', archetype: 'Feintes et pression', combatStyle: 'trickster', evidence: 'motif', power: 11, range: 70, speed: 78, guard: 54, tensionGain: 19, basicMove: 'Pas de scène', heavyMove: 'Revers de micro', specialMove: 'Rappel de la vedette' },
  hb_fizzarolli: { id: 'hb_fizzarolli', style: 'Acrobatie mécanique', archetype: 'Allonge et feintes', combatStyle: 'trickster', evidence: 'motif', power: 10, range: 90, speed: 84, guard: 42, tensionGain: 19, basicMove: 'Revers articulé', heavyMove: 'Extension acrobatique', specialMove: 'Dernier tour de piste' },
  hb_asmodeus: { id: 'hb_asmodeus', style: 'Maître du cabaret', archetype: 'Pression de boss', combatStyle: 'boss', evidence: 'motif', power: 18, range: 80, speed: 48, guard: 78, tensionGain: 12, basicMove: 'Balayage royal', heavyMove: 'Entrée théâtrale', specialMove: 'Rideau d’Ozzie' },
  hb_beelzebub: { id: 'hb_beelzebub', style: 'Reine de la fête', archetype: 'Mobilité de boss', combatStyle: 'boss', evidence: 'motif', power: 16, range: 74, speed: 76, guard: 58, tensionGain: 14, basicMove: 'Élan festif', heavyMove: 'Tourbillon royal', specialMove: 'Apogée de la fête' },
  hb_crimson: { id: 'hb_crimson', style: 'Patron de Greed', archetype: 'Pression méthodique', combatStyle: 'bruiser', evidence: 'motif', power: 15, range: 66, speed: 44, guard: 76, tensionGain: 14, basicMove: 'Coup d’intimidation', heavyMove: 'Revers du parrain', specialMove: 'Embuscade de Greed' },
  hb_andrealphus: { id: 'hb_andrealphus', style: 'Noblesse de glace', archetype: 'Contrôle de boss', combatStyle: 'zoner', evidence: 'onscreen', power: 17, range: 88, speed: 50, guard: 68, tensionGain: 12, basicMove: 'Pointe de glace', heavyMove: 'Arche de givre', specialMove: 'Domaine gelé' },
};

function helluvaCharacter(id: string): Character {
  const source = HELLUVA_CHARACTERS.find(character => character.id === id);
  if (!source) throw new Error(`Missing Helluva combat source: ${id}`);
  return {
    id, name: source.name, alias: source.alias, type: 'hellborn', rank: 'unknown',
    role: 'external', status: 'external', riskLevel: 'high', charlieTrust: 0,
    rehabProgress: 0, rehabTracked: false, operationalDataStatus: 'simulation_au',
    contracts: [], notes: 'Standalone exhibition; not part of the hotel save.',
    canonStatus: 'canon', timelineScope: 'custom', sourceRef: source.sourceRef,
    spoilerLevel: source.spoilerScope === 'season_1' ? 'season_1' : 'season_2',
    description: source.description,
  };
}

export const STANDALONE_ROSTER: readonly StandaloneFighter[] = [
  ...HAZBIN_DIRECTORY_PROFILES
    .filter(source => source.fighterEligible && source.assetStatus === 'ready' && source.id in FIGHTER_PROFILES && !source.id.startsWith('sim_'))
    .map(source => ({
      character: toHazbinArenaCharacter(source), profile: FIGHTER_PROFILES[source.id],
      franchise: 'Hazbin Hotel' as const, source: source.sourceLabel,
      spoiler: source.timeline === 'season_2' ? 'season_2' as const : 'season_1' as const,
    })),
  ...Object.values(HELLUVA_COMBAT_PROFILES).map(profile => {
    const character = helluvaCharacter(profile.id);
    return { character, profile, franchise: 'Helluva Boss' as const, source: character.sourceRef ?? '', spoiler: character.spoilerLevel === 'season_2' ? 'season_2' as const : 'season_1' as const };
  }),
].filter(fighter => Boolean(getCombatSpriteAsset(fighter.character.id)));

export const STANDALONE_FIGHTER_IDS = STANDALONE_ROSTER.map(fighter => fighter.character.id);
export const STANDALONE_BOSS_IDS = ['alastor', 'lucifer', 'adam', 'vox', 'hb_striker', 'hb_asmodeus', 'hb_beelzebub', 'hb_andrealphus'];
export const STANDALONE_TIMELINE: TimelineState = { current: 'custom', hideSpoilers: false, spoilerLevel: 'season_2', hotelState: 'rebuilt' };
export function getStandaloneFighter(id: string): StandaloneFighter | undefined {
  return STANDALONE_ROSTER.find(fighter => fighter.character.id === id);
}
