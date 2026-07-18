import {
  HAZBIN_DIRECTORY_PROFILES,
  isHazbinSpoilerVisible,
  type HazbinDirectoryProfile,
} from '../data/hazbin-directory';
import type {
  CanonStatus,
  Character,
  CharacterType,
  RiskLevel,
  TimelineScope,
  TimelineState,
} from '../types';
import { LoreValidation } from './lore-validation';

const DIRECTORY_TIMELINE_SCOPE: Readonly<Record<HazbinDirectoryProfile['timeline'], TimelineScope>> = {
  pilot_legacy: 'pilot_legacy',
  season_1: 'season_1_start',
  season_2: 'season_2',
  future: 'custom',
  simulation_au: 'season_1_start',
};

const DIRECTORY_CANON_STATUS: Readonly<Record<HazbinDirectoryProfile['canonStatus'], CanonStatus>> = {
  canon: 'canon',
  semi_canon: 'semi_canon',
  pilot_legacy: 'semi_canon',
  simulation_au: 'simulation_au',
};

const DIRECTORY_RISK_LEVEL: Readonly<Record<HazbinDirectoryProfile['rosterTier'], RiskLevel>> = {
  primary: 'catastrophic',
  supporting: 'high',
  secondary: 'medium',
};

function getDirectoryCharacterType(category: HazbinDirectoryProfile['category']): CharacterType {
  return category === 'heaven' ? 'angel' : 'unknown';
}

export function isHazbinDirectoryFighterVisible(
  profile: HazbinDirectoryProfile,
  timeline: TimelineState,
): boolean {
  if (profile.existingOperationalProfile || !profile.fighterEligible || profile.assetStatus !== 'ready') {
    return false;
  }

  return isHazbinDirectoryProfileVisible(profile, timeline);
}

export function isHazbinDirectoryProfileVisible(
  profile: HazbinDirectoryProfile,
  timeline: TimelineState,
): boolean {
  if (profile.assetStatus !== 'ready') return false;

  const timelineScope = DIRECTORY_TIMELINE_SCOPE[profile.timeline];
  return LoreValidation.isAvailableAtTimeline(timelineScope, timeline.current)
    && isHazbinSpoilerVisible(timeline.hideSpoilers, timeline.spoilerLevel, profile.spoilerLevel);
}

/**
 * Arena-only projection. It never enters the mutable hotel save and all
 * operational values remain explicitly classified as Simulation AU data.
 */
export function toHazbinArenaCharacter(profile: HazbinDirectoryProfile): Character {
  return {
    id: profile.id,
    name: profile.name,
    alias: profile.alias,
    type: getDirectoryCharacterType(profile.category),
    rank: 'unknown',
    role: 'external',
    status: 'external',
    riskLevel: DIRECTORY_RISK_LEVEL[profile.rosterTier],
    charlieTrust: 0,
    rehabProgress: 0,
    rehabTracked: false,
    operationalDataStatus: 'simulation_au',
    contracts: [],
    notes: 'Arena-only Simulation AU projection; it does not assert a canon matchup, power set or outcome.',
    canonStatus: DIRECTORY_CANON_STATUS[profile.canonStatus],
    timelineScope: DIRECTORY_TIMELINE_SCOPE[profile.timeline],
    sourceRef: profile.sourceLabel,
    spoilerLevel: profile.spoilerLevel,
    description: profile.bio,
  };
}

export function getHazbinArenaFighters(
  timeline: TimelineState,
  profiles: readonly HazbinDirectoryProfile[] = HAZBIN_DIRECTORY_PROFILES,
): Character[] {
  return profiles
    .filter(profile => isHazbinDirectoryFighterVisible(profile, timeline))
    .map(toHazbinArenaCharacter);
}
