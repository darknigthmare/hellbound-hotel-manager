// @vitest-environment jsdom

import axe from 'axe-core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { HelluvaAtlasGallery } from '../components/HelluvaAtlasGallery';
import { HELLUVA_ROSTER_PAGE_SIZE, HelluvaRoster } from '../components/HelluvaRoster';
import {
  HELLUVA_CHARACTERS,
  HELLUVA_SPRITE_SHEETS,
} from '../expansions/helluva-boss/data';
import { isHelluvaBossSpoilerVisible } from '../expansions/helluva-boss/spoilers';
import type { HelluvaBossSpoilerScope } from '../types';

afterEach(cleanup);

const visibleCharacters = (spoilerScope: HelluvaBossSpoilerScope) => HELLUVA_CHARACTERS.filter(
  (profile) => isHelluvaBossSpoilerVisible(spoilerScope, profile.spoilerScope),
);

async function expectNoSeriousAccessibilityViolation(container: HTMLElement) {
  const result = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  const blocking = result.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical');
  expect(blocking.map(({ id, nodes }) => ({ id, nodes: nodes.length }))).toEqual([]);
}

describe('Helluva character directory scaling', () => {
  it('assigns the requested primary, supporting and secondary tiers', () => {
    const primaryProfiles = HELLUVA_CHARACTERS.filter(({ rosterTier }) => rosterTier === 'primary');
    const supportingProfiles = HELLUVA_CHARACTERS.filter(({ rosterTier }) => rosterTier === 'supporting');
    const secondaryProfiles = HELLUVA_CHARACTERS.filter(({ rosterTier }) => rosterTier === 'secondary');

    expect(HELLUVA_CHARACTERS).toHaveLength(108);
    expect(primaryProfiles.map(({ id }) => id)).toEqual([
      'hb_blitzo',
      'hb_moxxie',
      'hb_millie',
      'hb_loona',
      'hb_stolas',
    ]);
    expect(supportingProfiles).toHaveLength(39);
    expect(secondaryProfiles.map(({ id }) => id)).toEqual([
      'hb_alessio',
      'hb_arick_burnz',
      'hb_counselor_jimmy',
      'hb_yogirt',
      'hb_emberlynn_pinkle',
      'hb_kendra',
      'hb_rita',
      'hb_better_than_blitzo_guy',
      'hb_loo_loo',
      'hb_jesse',
      'hb_miles',
      'hb_bombproof',
      'hb_muffy',
      'hb_dr_somna',
      'hb_vikki',
      'hb_gigi',
      'hb_russ',
      'hb_dennis',
      'hb_ralphie',
      'hb_catfish_monster',
      'hb_elder_jaws',
      'hb_bethany_ghostfucker',
      'hb_karen_client',
      'hb_toledo_the_igor',
      'hb_brennon_ragers',
      'hb_uggie',
      'hb_skips',
      'hb_queef',
      'hb_ace',
      'hb_gerardo_velazquez',
      'hb_frank_mctickly_wrigglers',
      'hb_driveso',
      'hb_joe_smoe',
      'hb_paulie_paesano',
      'hb_luigi_paesano',
      'hb_william_diddle',
      'hb_adrian',
      'hb_mr_mayor',
      'hb_gerald',
      'hb_rick',
      'hb_coco',
      'hb_apple',
      'hb_kat',
      'hb_milky',
      'hb_kiki',
      'hb_josh',
      'hb_stolas_family_butler',
      'hb_mister_butler',
      'hb_marthas_daughter',
      'hb_marthas_son',
      'hb_harold_patriot',
      'hb_dolores',
      'hb_hellhound_adoption_lady',
      'hb_travis',
      'hb_tour_guide_guy',
      'hb_big_woobly',
      'hb_gerardos_wife',
      'hb_diddle_secretary',
      'hb_bigfoot_waiter',
      'hb_gorilla_suit_guy',
      'hb_rachel_cherub',
      'hb_bea_cherub',
      'hb_beau_cherub',
      'hb_honey_cherub',
    ]);
  });

  it('caps pages at twelve cards and resets page one for filters and spoiler scope', async () => {
    const allCharacters = visibleCharacters('specials');
    const { container, rerender } = render(
      <HelluvaRoster
        key="specials"
        characters={allCharacters}
        totalProfileCount={HELLUVA_CHARACTERS.length}
        hiddenProfileCount={0}
        hiddenContentLabel={null}
      />,
    );
    const user = userEvent.setup();

    expect(screen.getAllByRole('article')).toHaveLength(HELLUVA_ROSTER_PAGE_SIZE);
    expect(screen.getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe('page');

    await user.click(screen.getByRole('button', { name: /Secondaires: 64 profiles/ }));
    expect(screen.getAllByRole('article')).toHaveLength(HELLUVA_ROSTER_PAGE_SIZE);
    await user.click(screen.getByRole('button', { name: 'Page 6' }));
    expect(screen.getAllByRole('article')).toHaveLength(4);
    expect(container.querySelector('.helluva-roster-status')?.textContent).toContain('Showing 61–64 of 64 profiles.');

    await user.click(screen.getByRole('button', { name: /Soutien: 39 profiles/ }));
    expect(screen.getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getAllByRole('article')).toHaveLength(HELLUVA_ROSTER_PAGE_SIZE);

    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(screen.getByRole('button', { name: 'Page 2' }).getAttribute('aria-current')).toBe('page');
    const seasonOneCharacters = visibleCharacters('season_1');
    rerender(
      <HelluvaRoster
        key="season_1"
        characters={seasonOneCharacters}
        totalProfileCount={HELLUVA_CHARACTERS.length}
        hiddenProfileCount={HELLUVA_CHARACTERS.length - seasonOneCharacters.length}
        hiddenContentLabel="Season 2 and Helluva Shorts"
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe('page');
    });
    expect(screen.getAllByRole('article').length).toBeLessThanOrEqual(HELLUVA_ROSTER_PAGE_SIZE);
    await expectNoSeriousAccessibilityViolation(container);
  });
});

describe('Helluva sprite atlas accordion', () => {
  it('mounts images only for the open group and keeps native button semantics', async () => {
    const { container } = render(
      <HelluvaAtlasGallery
        sheets={HELLUVA_SPRITE_SHEETS}
        spoilerScope="specials"
        hiddenContentLabel={null}
      />,
    );
    const user = userEvent.setup();
    const firstGroup = screen.getByRole('button', { name: /Core cast & first encounters/ });
    const secondGroup = screen.getByRole('button', { name: /Origins, rivals & operatives/ });
    expect(screen.getByRole('button', { name: /Ghosts, strays & Shorts targets/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Locals, performers & families/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Turning points, witnesses & cherubs/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Atlas archive/ })).toBeNull();

    expect(firstGroup.getAttribute('aria-expanded')).toBe('true');
    expect(secondGroup.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getAllByRole('img')).toHaveLength(4);
    for (const image of screen.getAllByRole('img')) {
      expect(image.getAttribute('loading')).toBe('lazy');
      expect(image.getAttribute('decoding')).toBe('async');
    }

    await user.click(firstGroup);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
    expect(firstGroup.getAttribute('aria-expanded')).toBe('false');

    await user.click(secondGroup);
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(secondGroup.getAttribute('aria-expanded')).toBe('true');
    expect(firstGroup.getAttribute('aria-expanded')).toBe('false');
    await expectNoSeriousAccessibilityViolation(container);
  });
});
