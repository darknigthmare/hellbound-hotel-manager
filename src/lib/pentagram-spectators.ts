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
 * while timeline/spoiler checks decide which identities can be shown.
 * Rooftops and the hotel exterior intentionally remain crowd-free so their
 * open lanes keep a distinct silhouette.
 */
export const PENTAGRAM_STAGE_SPECTATOR_POOLS = {
  'hotel-lobby': {
    count: 4,
    candidateIds: [
      'charlie',
      'vaggie',
      'hz_keekee',
      'hz_fat_nuggets',
      'hz_frank_egg_boi',
      'hz_mimzy',
      'niffty',
      'husk',
      'sirpentious',
      'angeldust',
      'cherribomb',
      'alastor',
    ],
  },
  'hotel-bar': {
    count: 3,
    candidateIds: [
      'husk',
      'hz_mimzy',
      'angeldust',
      'cherribomb',
      'niffty',
      'hz_travis',
      'hz_fat_nuggets',
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
    ],
  },
} as const satisfies Partial<Record<PentagramStageId, PentagramStageSpectatorPool>>;

const PENTAGRAM_SPECTATOR_SLOTS: readonly PentagramSpectatorSlot[] = [
  { x: 12, bottom: 35, scale: 0.72, parallax: 0.06, depth: 'far', facing: 'right' },
  { x: 29, bottom: 23, scale: 0.88, parallax: 0.13, depth: 'mid', facing: 'right' },
  { x: 71, bottom: 23, scale: 0.88, parallax: 0.13, depth: 'mid', facing: 'left' },
  { x: 88, bottom: 35, scale: 0.72, parallax: 0.06, depth: 'far', facing: 'left' },
] as const;

const PROFILE_BY_ID = new Map<string, HazbinDirectoryProfile>(
  HAZBIN_DIRECTORY_PROFILES.map(profile => [profile.id, profile]),
);

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

  for (const candidateId of candidateIds) {
    if (fighterIds.has(candidateId) || seen.has(candidateId)) continue;
    selected.push(candidateId);
    seen.add(candidateId);
    if (selected.length === limit) break;
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
  const spectatorIds = selectPentagramSpectatorIds(
    visibleCandidateIds,
    fighterIds,
    Math.min(pool.count, PENTAGRAM_SPECTATOR_SLOTS.length),
  );

  return spectatorIds.flatMap((spectatorId, index) => {
    const profile = PROFILE_BY_ID.get(spectatorId);
    const sprite = getCharacterSpriteAsset(spectatorId);
    const slot = PENTAGRAM_SPECTATOR_SLOTS[index];
    if (!profile || !sprite || !slot || fighterIds.has(spectatorId)) return [];
    return [{ id: spectatorId, name: profile.name, sprite, slot }];
  });
}
