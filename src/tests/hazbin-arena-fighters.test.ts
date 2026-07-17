import { describe, expect, it } from 'vitest';
import {
  HAZBIN_DIRECTORY_PROFILES,
  type HazbinDirectoryProfile,
} from '../data/hazbin-directory';
import {
  buildHazbinDirectorySpriteAssets,
  CHARACTER_SPRITES,
  getCharacterSpriteAsset,
} from '../lib/character-sprites';
import { DEFAULT_SPRITE_ANIMATION_SET_ID } from '../lib/sprite-animation-registry';
import {
  getHazbinArenaFighters,
  isHazbinDirectoryFighterVisible,
  toHazbinArenaCharacter,
} from '../lib/hazbin-arena-fighters';
import { FIGHTER_PROFILES, getFighterProfile } from '../lib/pentagram-fighters';
import type { TimelineState } from '../types';

const allExpansionArtReady = HAZBIN_DIRECTORY_PROFILES.map((profile): HazbinDirectoryProfile => (
  profile.existingOperationalProfile || profile.assetStatus === 'reference_unavailable'
    ? profile
    : { ...profile, assetStatus: 'ready' }
));

const seasonOneTimeline: TimelineState = {
  current: 'season_1_start',
  hideSpoilers: true,
  spoilerLevel: 'season_1',
  hotelState: 'original',
};

describe('Hazbin Arena directory adapter', () => {
  it('projects every art-ready eligible expansion profile without duplicating the 24 operational fighters', () => {
    const expectedIds = allExpansionArtReady
      .filter(({ existingOperationalProfile, fighterEligible, assetStatus }) => (
        !existingOperationalProfile && fighterEligible && assetStatus === 'ready'
      ))
      .map(({ id }) => id)
      .sort();
    const fighters = getHazbinArenaFighters(
      { ...seasonOneTimeline, current: 'custom', hideSpoilers: false, spoilerLevel: 'future' },
      allExpansionArtReady,
    );

    expect(fighters.map(({ id }) => id).sort()).toEqual(expectedIds);
    expect(fighters).toHaveLength(34);
    expect(fighters.every(({ id }) => id.startsWith('hz_'))).toBe(true);
    expect(fighters.every(({ operationalDataStatus }) => operationalDataStatus === 'simulation_au')).toBe(true);
  });

  it('keeps planned art, incompatible timelines and hidden spoilers outside the selector', () => {
    const razzle = HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_razzle');
    const lilith = HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_lilith');
    const crymini = HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_crymini');
    const laCatrina = HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_la_catrina_sinner');
    expect(razzle && lilith && crymini && laCatrina).toBeTruthy();

    expect(isHazbinDirectoryFighterVisible({ ...razzle!, assetStatus: 'planned' }, seasonOneTimeline)).toBe(false);
    expect(isHazbinDirectoryFighterVisible({ ...razzle!, assetStatus: 'ready' }, seasonOneTimeline)).toBe(true);
    expect(isHazbinDirectoryFighterVisible({ ...lilith!, assetStatus: 'ready' }, seasonOneTimeline)).toBe(false);
    expect(isHazbinDirectoryFighterVisible({ ...crymini!, assetStatus: 'ready' }, seasonOneTimeline)).toBe(false);
    expect(isHazbinDirectoryFighterVisible({ ...laCatrina!, assetStatus: 'ready' }, seasonOneTimeline)).toBe(false);
    expect(isHazbinDirectoryFighterVisible(
      { ...laCatrina!, assetStatus: 'ready' },
      { ...seasonOneTimeline, current: 'custom', hideSpoilers: false, spoilerLevel: 'season_2' },
    )).toBe(true);
    expect(getHazbinArenaFighters(
      { ...seasonOneTimeline, spoilerLevel: 'none' },
      allExpansionArtReady,
    )).toEqual([]);
  });

  it('uses a clearly labelled generic Simulation AU kit when no established combat kit exists', () => {
    const razzle = HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_razzle');
    expect(razzle).toBeTruthy();
    const fighter = toHazbinArenaCharacter({ ...razzle!, assetStatus: 'ready' });
    const profile = getFighterProfile(fighter);

    expect(FIGHTER_PROFILES[fighter.id]).toBeUndefined();
    expect(profile?.evidence).toBe('simulation');
    expect(profile?.style).toMatch(/Simulation AU/i);
    expect(profile?.archetype).toMatch(/Limited-evidence/i);
    expect(fighter.notes).toMatch(/does not assert a canon matchup, power set or outcome/i);
  });

  it('does not promote pilot-legacy identities to current-series canon', () => {
    const crymini = HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_crymini');
    expect(crymini).toBeTruthy();
    const fighter = toHazbinArenaCharacter({ ...crymini!, assetStatus: 'ready' });
    expect(fighter.timelineScope).toBe('pilot_legacy');
    expect(fighter.canonStatus).toBe('semi_canon');
  });

  it('does not project Prick or Hatchet as angels after lore correction', () => {
    const fighters = getHazbinArenaFighters(seasonOneTimeline, allExpansionArtReady);
    const prick = fighters.find(({ id }) => id === 'hz_prick');
    const hatchet = fighters.find(({ id }) => id === 'hz_hatchet');
    const kitty = fighters.find(({ id }) => id === 'hz_kitty');

    expect(prick?.type).toBe('unknown');
    expect(prick?.timelineScope).toBe('season_1_start');
    expect(prick?.sourceRef).toMatch(/S1E03/i);
    expect(hatchet?.type).toBe('unknown');
    expect(hatchet?.timelineScope).toBe('season_1_start');
    expect(kitty?.type).toBe('unknown');
    expect(kitty?.timelineScope).toBe('season_1_start');
    expect(kitty?.sourceRef).toMatch(/S1E02/i);
    expect(kitty?.operationalDataStatus).toBe('simulation_au');
    expect(fighters.map(({ id }) => id).sort()).toEqual([
      'hz_clara_carmine',
      'hz_dazzle',
      'hz_hatchet',
      'hz_kitty',
      'hz_odette_carmine',
      'hz_prick',
      'hz_razzle',
    ]);
  });

  it('keeps the original sprite registry intact and registers only directory art marked ready', () => {
    const readyDirectoryProfiles = HAZBIN_DIRECTORY_PROFILES.filter(({ existingOperationalProfile, assetStatus }) => (
      !existingOperationalProfile && assetStatus === 'ready'
    ));

    expect(Object.keys(CHARACTER_SPRITES)).toHaveLength(24 + readyDirectoryProfiles.length);
    expect(getCharacterSpriteAsset('charlie')?.portrait).toBe('/assets/sprites/portraits/charlie.png');
    for (const profile of readyDirectoryProfiles) {
      expect(getCharacterSpriteAsset(profile.id)).toEqual({
        portrait: profile.portrait,
        sheet: profile.sheetPath,
        row: profile.sheetRow,
        animationSetId: DEFAULT_SPRITE_ANIMATION_SET_ID,
      });
    }

    const allReadySprites = buildHazbinDirectorySpriteAssets(allExpansionArtReady);
    const allReadyFighterProfiles = allExpansionArtReady.filter(({ existingOperationalProfile, fighterEligible }) => (
      !existingOperationalProfile && fighterEligible
    ));
    expect(allReadyFighterProfiles).toHaveLength(34);
    for (const profile of allReadyFighterProfiles) {
      expect(allReadySprites[profile.id]).toEqual({
        portrait: profile.portrait,
        sheet: profile.sheetPath,
        row: profile.sheetRow,
        animationSetId: DEFAULT_SPRITE_ANIMATION_SET_ID,
      });
    }
  });
});
