// @vitest-environment jsdom

import axe from 'axe-core';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HazbinAtlasGallery } from '../components/HazbinAtlasGallery';
import { HAZBIN_ROSTER_PAGE_SIZE, HazbinRoster } from '../components/HazbinRoster';
import {
  HAZBIN_DIRECTORY_ONLY_PROFILE_COUNT,
  HAZBIN_DIRECTORY_PROFILES,
  HAZBIN_EXISTING_PROFILE_COUNT,
  HAZBIN_PLANNED_PROFILE_COUNT,
  HAZBIN_REFERENCE_UNAVAILABLE_PROFILE_COUNT,
  HAZBIN_SPRITE_SHEETS,
  isHazbinSpoilerVisible,
} from '../data/hazbin-directory';
import { getSeedData } from '../db/seed';
import { Characters } from '../pages/Characters';

afterEach(cleanup);

async function expectNoSeriousAccessibilityViolation(container: HTMLElement) {
  const result = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  const blocking = result.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(blocking.map(({ id, nodes }) => ({ id, nodes: nodes.length }))).toEqual([]);
}

describe('Hazbin directory data boundary', () => {
  it('keeps 24 operational references and 77 new directory-only profiles', () => {
    expect(HAZBIN_DIRECTORY_PROFILES).toHaveLength(101);
    expect(HAZBIN_EXISTING_PROFILE_COUNT).toBe(24);
    expect(HAZBIN_DIRECTORY_ONLY_PROFILE_COUNT).toBe(77);
    expect(HAZBIN_PLANNED_PROFILE_COUNT).toBe(0);
    expect(HAZBIN_REFERENCE_UNAVAILABLE_PROFILE_COUNT).toBe(1);
    expect(new Set(HAZBIN_DIRECTORY_PROFILES.map(({ id }) => id)).size).toBe(101);

    const seed = getSeedData();
    expect(seed.characters).toHaveLength(24);
    expect(seed.characters.some(({ id }) => id.startsWith('hz_'))).toBe(false);
    expect(HAZBIN_DIRECTORY_PROFILES
      .filter(({ existingOperationalProfile }) => !existingOperationalProfile)
      .every(({ id }) => id.startsWith('hz_'))).toBe(true);
  });

  it('labels continuity conservatively and never invents a name for Angel Dust’s father', () => {
    const father = HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_angel_father');
    expect(father?.name).toBe('Angel Dust’s father');
    expect(father?.alias).toBe('Name unconfirmed');
    expect(`${father?.name} ${father?.alias} ${father?.bio}`).not.toMatch(/Henroin/i);

    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_roo')?.canonStatus).toBe('semi_canon');
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_crymini')?.canonStatus).toBe('pilot_legacy');
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_hellsa_von_eldritch')?.timeline).toBe('pilot_legacy');
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'abel')?.role).toMatch(/commander/i);
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_dazzle')?.bio).toMatch(/dies/i);
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_travis')?.sharedHelluvaProfileId).toBe('hb_travis');

    const prick = HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_prick');
    expect(prick?.category).toBe('overlord');
    expect(prick?.role).toMatch(/Overlord/i);
    expect(prick?.timeline).toBe('season_1');
    expect(prick?.alias).toMatch(/Cactus/i);

    const hatchet = HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_hatchet');
    expect(hatchet?.category).toBe('overlord');
    expect(hatchet?.role).toMatch(/Overlord/i);
    expect(hatchet?.timeline).toBe('season_1');

    const shokWav = HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_shok_wav');
    expect(shokWav?.alias).toMatch(/Vox/i);
    expect(shokWav?.role).toMatch(/pet/i);
    expect(shokWav?.bio).toMatch(/Baxter/i);

    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_molly')?.canonStatus).toBe('canon');
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_molly')?.timeline).toBe('season_1');
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_melissa')?.role).toMatch(/Vees employee/i);
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_melissa')?.timeline).toBe('season_1');
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_tom_trench')?.canonStatus).toBe('canon');
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_tom_trench')?.timeline).toBe('season_1');

    const hotelPatronIds = [
      'hz_la_catrina_sinner',
      'hz_eel_sinner',
      'hz_egyptian_sinner',
      'hz_ant_sinner',
    ];
    const hotelPatrons = HAZBIN_DIRECTORY_PROFILES.filter(({ id }) => hotelPatronIds.includes(id));
    expect(hotelPatrons).toHaveLength(4);
    expect(hotelPatrons.map(({ sheetRow }) => sheetRow).sort()).toEqual([0, 1, 2, 3]);
    expect(hotelPatrons.every(({ category }) => category === 'hotel')).toBe(true);
    expect(hotelPatrons.every(({ canonStatus }) => canonStatus === 'canon')).toBe(true);
    expect(hotelPatrons.every(({ timeline, spoilerLevel }) => (
      timeline === 'season_2' && spoilerLevel === 'season_2'
    ))).toBe(true);
    expect(hotelPatrons.every(({ sourceLabel }) => /Hazbin Hotel S2E0[1358]/.test(sourceLabel))).toBe(true);
    expect(hotelPatrons.every(({ bio }) => /hotel/i.test(bio))).toBe(true);

    const newWaveIds = [
      'hz_kitty',
      'hz_huskette_cat',
      'hz_huskette_spider',
      'hz_huskette_imp',
      'hz_reporter_demon',
      'hz_goldfish_sinner',
      'hz_fangirl_goat',
      'hz_fangirl_apple_tree',
      'hz_conjoined_twins',
      'hz_western_sinner',
      'hz_goth_bird_sinner',
      'hz_rose_sinner',
    ];
    const newWaveProfiles = HAZBIN_DIRECTORY_PROFILES.filter(({ id }) => newWaveIds.includes(id));
    expect(newWaveProfiles).toHaveLength(12);
    expect(newWaveProfiles.every(({ canonStatus }) => canonStatus === 'canon')).toBe(true);
    expect(newWaveProfiles.every(({ fighterEligible }) => fighterEligible)).toBe(true);
    expect(newWaveProfiles.every(({ existingOperationalProfile }) => !existingOperationalProfile)).toBe(true);
    expect(newWaveProfiles.every(({ sourceLabel }) => /Hazbin Hotel/.test(sourceLabel))).toBe(true);

    const kitty = HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_kitty');
    expect(kitty?.timeline).toBe('season_1');
    expect(kitty?.spoilerLevel).toBe('season_1');
    expect(kitty?.alias).toMatch(/Robo Fizz/i);
    expect(kitty?.sourceLabel).toMatch(/S1E02.*S2E08/);
    expect(kitty?.bio).toMatch(/distinct from.*Helluva Boss/i);
    expect(kitty?.sharedHelluvaProfileId).toBeUndefined();

    const newSeasonTwoProfiles = newWaveProfiles.filter(({ id }) => id !== 'hz_kitty');
    expect(newSeasonTwoProfiles).toHaveLength(11);
    expect(newSeasonTwoProfiles.every(({ timeline, spoilerLevel }) => (
      timeline === 'season_2' && spoilerLevel === 'season_2'
    ))).toBe(true);
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_reporter_demon')?.alias)
      .toBe('666 News reporter');
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_reporter_demon')?.bio)
      .toMatch(/production nickname rather than a confirmed personal name/i);

    const tertiaryIds = [
      'hz_gator_sinner',
      'hz_velvette_assistant',
      'hz_shark_gang_leader',
      'hz_cactus_sinner',
      'hz_jack_in_box_sinner',
      'hz_orphan_imp',
      'hz_top_hat_demon',
      'hz_roadkill_sinner',
    ];
    const tertiaryProfiles = HAZBIN_DIRECTORY_PROFILES.filter(({ id }) => tertiaryIds.includes(id));
    expect(tertiaryProfiles).toHaveLength(8);
    expect(tertiaryProfiles.map(({ sheetRow }) => sheetRow).sort()).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
    expect(tertiaryProfiles.filter(({ canonStatus }) => canonStatus === 'pilot_legacy').map(({ id }) => id).sort())
      .toEqual(['hz_roadkill_sinner', 'hz_top_hat_demon']);
    expect(tertiaryProfiles.filter(({ canonStatus }) => canonStatus === 'canon')).toHaveLength(6);

    const tiffany = HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_tiffany_titfucker');
    expect(tiffany?.assetStatus).toBe('reference_unavailable');
    expect(tiffany?.sourceLabel).toMatch(/mentioned only/i);
    expect(tiffany?.portrait).toBe('');
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_egg_boiz')?.sheetRow).toBe(0);
    expect(HAZBIN_DIRECTORY_PROFILES.every(({ sourceLabel, bio, role }) => (
      sourceLabel.length > 0 && bio.length > 0 && role.length > 0
    ))).toBe(true);
  });

  it('maps twenty-five ready four-character atlases without row collisions', () => {
    expect(HAZBIN_SPRITE_SHEETS).toHaveLength(25);
    expect(HAZBIN_SPRITE_SHEETS.filter(({ assetStatus }) => assetStatus === 'ready')).toHaveLength(25);
    expect(HAZBIN_SPRITE_SHEETS.filter(({ assetStatus }) => assetStatus === 'planned')).toHaveLength(0);

    for (const sheet of HAZBIN_SPRITE_SHEETS) {
      const profiles = HAZBIN_DIRECTORY_PROFILES.filter(({ spriteSheetId }) => spriteSheetId === sheet.id);
      expect(profiles).toHaveLength(4);
      expect(profiles.map(({ sheetRow }) => sheetRow).sort()).toEqual([0, 1, 2, 3]);
      expect(profiles.map(({ name }) => name).sort()).toEqual([...sheet.characters].sort());
    }

    for (const profile of HAZBIN_DIRECTORY_PROFILES.filter(({ existingOperationalProfile, assetStatus }) => (
      !existingOperationalProfile && assetStatus === 'ready'
    ))) {
      expect(profile.portrait).toBe(`/assets/sprites/hazbin/portraits/${profile.id}.png`);
      expect(profile.sheetPath).toBe(`/assets/sprites/hazbin/sheets/hazbin-${profile.spriteSheetId}.png`);
    }
  });

  it('keeps Season 2 and future profiles behind the global spoiler boundary', () => {
    expect(isHazbinSpoilerVisible(true, 'season_1', 'season_1')).toBe(true);
    expect(isHazbinSpoilerVisible(true, 'season_1', 'season_2')).toBe(false);
    expect(isHazbinSpoilerVisible(true, 'season_1', 'future')).toBe(false);
    expect(isHazbinSpoilerVisible(false, 'season_1', 'future')).toBe(true);

    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_lilith')?.spoilerLevel).toBe('season_2');
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_roo')?.spoilerLevel).toBe('future');
    expect(HAZBIN_SPRITE_SHEETS.find(({ id }) => id === 'family-media')?.spoilerLevel).toBe('season_2');
    expect(HAZBIN_SPRITE_SHEETS.find(({ id }) => id === 'heaven-pets')?.spoilerLevel).toBe('season_2');
  });
});

describe('Hazbin roster and atlas accessibility', () => {
  it('paginates at twelve cards and resets to page one when filters change', async () => {
    const { container } = render(<HazbinRoster profiles={HAZBIN_DIRECTORY_PROFILES} />);
    const user = userEvent.setup();

    expect(screen.getAllByRole('article')).toHaveLength(HAZBIN_ROSTER_PAGE_SIZE);
    expect(screen.getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe('page');
    const lastPage = Math.ceil(HAZBIN_DIRECTORY_PROFILES.length / HAZBIN_ROSTER_PAGE_SIZE);
    await user.click(screen.getByRole('button', { name: `Page ${lastPage}` }));
    expect(screen.getAllByRole('article')).toHaveLength(
      HAZBIN_DIRECTORY_PROFILES.length - ((lastPage - 1) * HAZBIN_ROSTER_PAGE_SIZE),
    );

    const secondaryCount = HAZBIN_DIRECTORY_PROFILES.filter(({ rosterTier }) => rosterTier === 'secondary').length;
    await user.click(screen.getByRole('button', { name: `Secondaires : ${secondaryCount} profils` }));
    expect(screen.getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe('page');

    await user.selectOptions(screen.getByLabelText('Continuité'), 'pilot_legacy');
    const visibleCards = screen.getAllByRole('article');
    expect(visibleCards.length).toBeLessThanOrEqual(HAZBIN_ROSTER_PAGE_SIZE);
    expect(visibleCards.every((card) => card.textContent?.includes('Héritage pilote'))).toBe(true);
    await expectNoSeriousAccessibilityViolation(container);
  });

  it('mounts atlas images only inside the expanded native accordion region', async () => {
    const { container } = render(<HazbinAtlasGallery sheets={HAZBIN_SPRITE_SHEETS} />);
    const user = userEvent.setup();
    const firstGroup = screen.getByRole('button', { name: /Distribution principale déjà illustrée/ });
    const secondGroup = screen.getByRole('button', { name: /Pouvoirs établis et premières extensions/ });

    expect(firstGroup.getAttribute('aria-expanded')).toBe('true');
    expect(secondGroup.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByText('25 atlas disponibles dans ce filtre, avec portraits et poses de combat publiés.')).toBeTruthy();
    expect(screen.getAllByRole('img')).toHaveLength(4);
    for (const image of screen.getAllByRole('img')) {
      expect(image.getAttribute('loading')).toBe('lazy');
      expect(image.getAttribute('decoding')).toBe('async');
    }

    fireEvent.error(screen.getAllByRole('img')[0]);
    expect(screen.getByRole('img', { name: /Aperçu indisponible/ })).toBeTruthy();
    expect(screen.getByText('L’atlas publié n’a pas pu être chargé')).toBeTruthy();

    await user.click(firstGroup);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    await user.click(secondGroup);
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(secondGroup.getAttribute('aria-expanded')).toBe('true');
    await expectNoSeriousAccessibilityViolation(container);
  });

  it('exposes separate hotel operations and Hazbin directory tabs in Characters', async () => {
    const { container } = render(
      <Characters
        state={getSeedData()}
        onStateChange={vi.fn()}
        searchQuery=""
        onNavigate={vi.fn()}
      />,
    );
    const user = userEvent.setup();
    const operationsTab = screen.getByRole('tab', { name: 'Opérations hôtel' });
    const directoryTab = screen.getByRole('tab', { name: 'Annuaire Hazbin' });

    expect(operationsTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('button', { name: 'Register Guest/Staff' })).toBeTruthy();
    operationsTab.focus();
    await user.keyboard('{ArrowRight}');
    expect(directoryTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(directoryTab);
    expect(screen.queryByRole('button', { name: 'Register Guest/Staff' })).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Annuaire Hazbin · 101 profils' })).toBeTruthy();
    expect(screen.getByText(/77 nouvelles fiches/)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Lilith Morningstar' })).toBeNull();
    expect(screen.getAllByText(/masqués par le filtre spoilers/)).toHaveLength(2);
    await expectNoSeriousAccessibilityViolation(container);
  });
});
