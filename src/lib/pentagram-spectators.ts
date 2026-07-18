import {
  HAZBIN_DIRECTORY_PROFILES,
  type HazbinDirectoryProfile,
} from '../data/hazbin-directory';
import type { TimelineState } from '../types';
import {
  getCharacterSpriteAsset,
  type CharacterSpriteAsset,
} from './character-sprites';
import { isHazbinDirectoryProfileVisible } from './hazbin-arena-fighters';
import type { PentagramStageId } from './pentagram-stages';

export type PentagramSpectatorDepth = 'far' | 'mid';
export type PentagramSpectatorFacing = 'left' | 'right';

export interface PentagramSpectatorSlot {
  x: number;
  bottom: number;
  scale: number;
  parallax: number;
  depth: PentagramSpectatorDepth;
  facing: PentagramSpectatorFacing;
}

export interface PentagramStageSpectator {
  id: string;
  name: string;
  sprite: CharacterSpriteAsset;
  slot: PentagramSpectatorSlot;
}

export interface PentagramStageSpectatorPool {
  count: number;
  candidateIds: readonly string[];
}

/*
 * These are venue crowds, not canon fight records. Pools stay location-aware,
 * while timeline/spoiler checks decide which identities can be shown. Every
 * illustrated profile has at least one explicit home; historical, future and
 * pilot-era identities remain Simulation AU projections when their timeline
 * makes them visible.
 */
export const PENTAGRAM_STAGE_SPECTATOR_POOLS = {
  'hotel-lobby': {
    count: 4,
    candidateIds: [
      'charlie',
      'vaggie',
      'angeldust',
      'alastor',
      'husk',
      'niffty',
      'sirpentious',
      'lucifer',
      'baxter',
      'sim_applicant_marlow',
      'sim_applicant_ember',
      'hz_lilith',
      'hz_mimzy',
      'hz_keekee',
      'hz_fat_nuggets',
      'hz_frank_egg_boi',
      'hz_razzle',
      'hz_dazzle',
      'hz_la_catrina_sinner',
      'hz_eel_sinner',
      'hz_egyptian_sinner',
      'hz_ant_sinner',
      'hz_fangirl_goat',
      'hz_fangirl_apple_tree',
      'hz_conjoined_twins',
      'hz_western_sinner',
      'hz_goth_bird_sinner',
      'hz_rose_sinner',
      'hz_egg_boiz',
      'hz_gator_sinner',
      'cherribomb',
    ],
  },
  'hotel-bar': {
    count: 4,
    candidateIds: [
      'husk',
      'hz_mimzy',
      'angeldust',
      'cherribomb',
      'niffty',
      'hz_travis',
      'hz_fat_nuggets',
      'baxter',
      'sim_applicant_marlow',
      'sim_applicant_ember',
      'hz_la_catrina_sinner',
      'hz_eel_sinner',
      'hz_egyptian_sinner',
      'hz_ant_sinner',
      'hz_fangirl_goat',
      'hz_fangirl_apple_tree',
      'hz_conjoined_twins',
      'hz_western_sinner',
      'hz_goth_bird_sinner',
      'hz_rose_sinner',
      'hz_huskette_cat',
      'hz_huskette_spider',
      'hz_huskette_imp',
      'hz_prick',
      'hz_hatchet',
      'hz_arackniss',
      'hz_angel_father',
    ],
  },
  'hotel-exterior': {
    count: 4,
    candidateIds: [
      'charlie',
      'vaggie',
      'angeldust',
      'cherribomb',
      'lucifer',
      'hz_lilith',
      'hz_razzle',
      'hz_dazzle',
      'hz_egg_boiz',
      'hz_travis',
      'hz_gator_sinner',
      'hz_cactus_sinner',
      'hz_shark_gang_leader',
      'hz_orphan_imp',
      'hz_roadkill_sinner',
      'hz_rooster',
      'hz_ethan',
      'hz_salina',
      'hz_zack_rabbit',
      'hz_man_meat',
      'hz_buddy_mcsluggy',
      'hz_bryrin',
      'hz_rocky',
      'hz_crymini',
      'hz_villa',
      'hz_hellsa_von_eldritch',
      'hz_seviathan_von_eldritch',
      'hz_frederick_von_eldritch',
      'hz_bethesda_von_eldritch',
      'hz_roo',
      'hz_eve',
      'hz_british_gentleman',
      'hz_female_victim',
      'hz_the_killer',
      'hz_human_hunter',
      'hz_harry',
      'hz_carrie',
      'hz_larry',
      'hz_robert_bob_sinclaire',
    ],
  },
  'pentagram-rooftops': {
    count: 4,
    candidateIds: [
      'alastor',
      'lucifer',
      'vox',
      'valentino',
      'velvette',
      'carmilla',
      'rosie',
      'zestial',
      'zeezi',
      'hz_huskette_cat',
      'hz_huskette_spider',
      'hz_huskette_imp',
      'hz_prick',
      'hz_hatchet',
      'hz_arackniss',
      'hz_angel_father',
      'hz_goldfish_sinner',
      'hz_myk_mic_guy',
      'hz_dia',
      'hz_summer',
      'hz_cactus_sinner',
      'hz_jack_in_box_sinner',
      'hz_top_hat_demon',
      'hz_maestro',
      'hz_rooster',
      'hz_ethan',
      'hz_salina',
      'hz_zack_rabbit',
      'hz_man_meat',
      'hz_buddy_mcsluggy',
      'hz_bryrin',
      'hz_rocky',
      'hz_crymini',
      'hz_villa',
      'hz_hellsa_von_eldritch',
      'hz_seviathan_von_eldritch',
      'hz_frederick_von_eldritch',
      'hz_bethesda_von_eldritch',
      'hz_roo',
      'hz_eve',
      'hz_british_gentleman',
      'hz_female_victim',
      'hz_the_killer',
      'hz_human_hunter',
      'hz_harry',
      'hz_carrie',
      'hz_larry',
      'hz_robert_bob_sinclaire',
      'hz_shark_gang_leader',
      'hz_orphan_imp',
      'hz_roadkill_sinner',
    ],
  },
  'cannibal-town-square': {
    count: 3,
    candidateIds: [
      'rosie',
      'hz_susan',
      'alastor',
      'charlie',
      'vaggie',
    ],
  },
  'carmine-industries': {
    count: 3,
    candidateIds: [
      'carmilla',
      'hz_clara_carmine',
      'hz_odette_carmine',
      'zestial',
      'zeezi',
      'rosie',
      'hz_maestro',
    ],
  },
  'vee-broadcast-studio': {
    count: 4,
    candidateIds: [
      'vox',
      'valentino',
      'velvette',
      'hz_kitty',
      'hz_melissa',
      'hz_katie_killjoy',
      'hz_tom_trench',
      'hz_reporter_demon',
      'hz_velvette_assistant',
      'hz_shok_wav',
      'hz_gator_sinner',
      'hz_goldfish_sinner',
      'hz_myk_mic_guy',
      'hz_dia',
      'hz_summer',
      'hz_cactus_sinner',
      'hz_jack_in_box_sinner',
      'hz_top_hat_demon',
    ],
  },
  'heaven-embassy': {
    count: 3,
    candidateIds: [
      'emily',
      'sera',
      'adam',
      'lute',
      'hz_st_peter',
      'hz_molly',
      'abel',
      'hz_crying_exorcist',
      'hz_speaker_of_god',
    ],
  },
} as const satisfies Record<PentagramStageId, PentagramStageSpectatorPool>;

export const MAX_PENTAGRAM_STAGE_SPECTATORS = 4;
const PENTAGRAM_SPECTATOR_SLOTS: readonly PentagramSpectatorSlot[] = [
  { x: 12, bottom: 35, scale: 0.72, parallax: 0.06, depth: 'far', facing: 'right' },
  { x: 29, bottom: 23, scale: 0.88, parallax: 0.13, depth: 'mid', facing: 'right' },
  { x: 71, bottom: 23, scale: 0.88, parallax: 0.13, depth: 'mid', facing: 'left' },
  { x: 88, bottom: 35, scale: 0.72, parallax: 0.06, depth: 'far', facing: 'left' },
] as const;

const PROFILE_BY_ID = new Map<string, HazbinDirectoryProfile>(
  HAZBIN_DIRECTORY_PROFILES.map(profile => [profile.id, profile]),
);

function hashSpectatorSelectionKey(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: number): () => number {
  let state = seed || 0x6d2b79f5;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function shufflePentagramSpectatorIds(
  candidateIds: readonly string[],
  selectionKey: string,
): string[] {
  const shuffled = [...new Set(candidateIds)];
  const random = createSeededRandom(hashSpectatorSelectionKey(selectionKey));

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[targetIndex]] = [shuffled[targetIndex], shuffled[index]];
  }

  return shuffled;
}

/**
 * Exclusion happens before the limit so an active fighter is replaced by the
 * next valid venue candidate instead of leaving a hole in the audience.
 */
export function selectPentagramSpectatorIds(
  candidateIds: readonly string[],
  fighterIds: ReadonlySet<string>,
  limit: number,
): string[] {
  const selected: string[] = [];
  const seen = new Set<string>();
  const safeLimit = Math.min(
    Math.max(0, Math.trunc(limit)),
    MAX_PENTAGRAM_STAGE_SPECTATORS,
  );
  if (safeLimit === 0) return [];

  for (const candidateId of candidateIds) {
    if (fighterIds.has(candidateId) || seen.has(candidateId)) continue;
    selected.push(candidateId);
    seen.add(candidateId);
    if (selected.length === safeLimit) break;
  }

  return selected;
}

export function getPentagramStageSpectators(
  stageId: PentagramStageId,
  timeline: TimelineState,
  fighterOneId: string,
  fighterTwoId: string,
): PentagramStageSpectator[] {
  const pool = PENTAGRAM_STAGE_SPECTATOR_POOLS[stageId as keyof typeof PENTAGRAM_STAGE_SPECTATOR_POOLS];
  if (!pool) return [];

  const fighterIds = new Set([fighterOneId, fighterTwoId]);
  const visibleCandidateIds = pool.candidateIds.filter((candidateId) => {
    const profile = PROFILE_BY_ID.get(candidateId);
    return Boolean(
      profile
      && isHazbinDirectoryProfileVisible(profile, timeline)
      && getCharacterSpriteAsset(candidateId),
    );
  });
  const canonicalFighterIds = [fighterOneId, fighterTwoId].sort();
  const shuffledCandidateIds = shufflePentagramSpectatorIds(
    visibleCandidateIds,
    [
      stageId,
      timeline.current,
      timeline.spoilerLevel,
      ...canonicalFighterIds,
    ].join('|'),
  );
  const spectatorIds = selectPentagramSpectatorIds(
    shuffledCandidateIds,
    fighterIds,
    Math.min(
      pool.count,
      PENTAGRAM_SPECTATOR_SLOTS.length,
      MAX_PENTAGRAM_STAGE_SPECTATORS,
    ),
  );

  return spectatorIds.flatMap((spectatorId, index) => {
    const profile = PROFILE_BY_ID.get(spectatorId);
    const sprite = getCharacterSpriteAsset(spectatorId);
    const slot = PENTAGRAM_SPECTATOR_SLOTS[index];
    if (!profile || !sprite || !slot || fighterIds.has(spectatorId)) return [];
    return [{ id: spectatorId, name: profile.name, sprite, slot }];
  });
}
