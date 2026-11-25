// @vitest-environment jsdom
import { existsSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPentagramStage } from '../lib/pentagram-stages';
import { GLOBAL_CAMPAIGN, GLOBAL_CAMPAIGN_ENDING_ID } from '../standalone/campaign-global';
import { CAMPAIGN_ILLUSTRATIONS_V4, globalCampaignIllustration, personalCampaignIllustration } from '../standalone/campaign-illustrations-v4';
import { NarrativeCollection } from '../standalone/NarrativeCollection';
import { buildCampaignRun, buildRun, createDefaultSave, type StandaloneRun } from '../standalone/progression';
import { RunInterlude } from '../standalone/RunInterlude';
import { STANDALONE_FIGHTER_IDS } from '../standalone/roster';

afterEach(cleanup);

function interlude(run: StandaloneRun, onFight = vi.fn()) {
  return <RunInterlude run={run} titleRef={null} onFight={onFight} onHome={vi.fn()} />;
}

describe('approved narrative artwork', () => {
  it('references real public exports and selects an exact scene and version within its spoiler scope', () => {
    for (const illustration of CAMPAIGN_ILLUSTRATIONS_V4) {
      expect(existsSync(`public${illustration.src}`)).toBe(true);
      expect(illustration.width).toBeGreaterThan(0);
      expect(illustration.height).toBeGreaterThan(0);
      expect(illustration.alt).not.toBe('');
    }
    const first = globalCampaignIllustration('signal-libre', 1, 'seuil-ouvert');
    expect(first?.src).toBe('/assets/story/global/signal-libre-ch01.webp');
    expect(globalCampaignIllustration('signal-libre', 2, 'seuil-ouvert')).toBeUndefined();
    expect(globalCampaignIllustration('other-campaign', 1, 'seuil-ouvert')).toBeUndefined();
    expect(globalCampaignIllustration(undefined, undefined, 'seuil-ouvert')).toBeUndefined();
    expect(globalCampaignIllustration('signal-libre', 1, 'seuil-ouvert', { allowSeasonTwo: false })).toBeUndefined();
    expect(personalCampaignIllustration('charlie', 1, 'intro')).toBeUndefined();
  });

  it('shows the whole accepted chapter image with its native ratio and no duplicated cast', () => {
    const fight = vi.fn();
    const view = render(interlude(buildCampaignRun(STANDALONE_FIGHTER_IDS, 14), fight));
    const illustration = screen.getByRole('img', { name: /Charlie et Vaggie préparent/ });
    expect(illustration.getAttribute('src')).toBe('/assets/story/global/signal-libre-ch01.webp');
    expect(illustration.getAttribute('width')).toBe('1672');
    expect(illustration.getAttribute('height')).toBe('941');
    expect((illustration as HTMLImageElement).style.objectFit).toBe('contain');
    expect(illustration.parentElement?.style.aspectRatio).toBe('1672 / 941');
    expect(view.container.querySelector('.iv-story-cast')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Entrer en combat' }));
    expect(fight).toHaveBeenCalledOnce();
  });

  it('falls back to the chapter scenery and cast if an accepted export cannot load', () => {
    const view = render(interlude(buildCampaignRun(STANDALONE_FIGHTER_IDS, 14)));
    fireEvent.error(screen.getByRole('img', { name: /Charlie et Vaggie préparent/ }));
    expect(view.container.querySelector('.iv-story-location')?.getAttribute('src')).toBe(getPentagramStage('hotel-lobby').imagePath);
    expect(view.container.querySelectorAll('.iv-story-cast img')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Entrer en combat' })).toBeTruthy();
  });

  it('keeps each absent scene on its fallback instead of carrying the first chapter image into an ending', () => {
    const first = buildCampaignRun(STANDALONE_FIGHTER_IDS, 14);
    const view = render(interlude(first));
    const next = { ...first, index: 1, wins: 1 };
    view.rerender(interlude(next));
    const nextArt = globalCampaignIllustration('signal-libre', 1, 'caisse-imp');
    expect(view.container.querySelector('.iv-story-location')?.getAttribute('src')).toBe(nextArt?.src ?? getPentagramStage('imp-reception').imagePath);
    expect(screen.queryByRole('img', { name: /Charlie et Vaggie préparent/ })).toBeNull();
    const finished: StandaloneRun = { ...first, index: 9, wins: 9, status: 'complete' };
    view.rerender(interlude(finished));
    expect(screen.getByText(GLOBAL_CAMPAIGN.ending)).toBeTruthy();
    expect(screen.queryByRole('img', { name: /Charlie et Vaggie préparent/ })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Entrer en combat' })).toBeNull();
  });

  it('preserves an unversioned legacy image and never assigns it to the rewritten route', () => {
    const legacy = buildRun('story', 'charlie', STANDALONE_FIGHTER_IDS, [], 31, 1);
    delete legacy.routeVersion;
    const view = render(interlude(legacy));
    expect(screen.getByRole('heading', { name: 'Une place à la table' })).toBeTruthy();
    expect(view.container.querySelector('.iv-story-location')?.getAttribute('src')).toBe('/assets/story/infernal-versus/charlie-intro.webp');
    expect(view.container.querySelector('.iv-story-cast')).toBeNull();
    const current = buildRun('story', 'charlie', STANDALONE_FIGHTER_IDS, [], 31);
    view.rerender(interlude(current));
    expect(screen.getByRole('heading', { name: 'Une chambre, un choix' })).toBeTruthy();
    const currentArt = personalCampaignIllustration('charlie', 3, 'intro');
    expect(view.container.querySelector('.iv-story-location')?.getAttribute('src')).toBe(currentArt?.src ?? getPentagramStage('hotel-lobby').imagePath);
    expect(view.container.querySelector('.iv-story-location')?.getAttribute('src')).not.toBe('/assets/story/infernal-versus/charlie-intro.webp');
  });

  it('keeps the unlocked global and season-two endings hidden by the collection filter', () => {
    const save = createDefaultSave();
    save.storyEndings = ['charlie', 'hb_loona'];
    save.storyCompletions = [{ fighterId: 'charlie', routeVersion: 1 }, { fighterId: 'hb_loona', routeVersion: 3 }];
    save.campaignEndings = [GLOBAL_CAMPAIGN_ENDING_ID];
    const view = render(<NarrativeCollection save={save} allowSeasonTwo={false} />);
    expect(screen.getByText('Charlie Morningstar · Une place à la table · Archive')).toBeTruthy();
    expect(screen.queryByText(/Loona · Les numéros que l’on garde/)).toBeNull();
    expect(screen.queryByText(/Campagne globale · La nuit du signal libre/)).toBeNull();
    expect(screen.queryByText(GLOBAL_CAMPAIGN.ending)).toBeNull();
    view.rerender(<NarrativeCollection save={save} allowSeasonTwo />);
    expect(screen.getByText(/Loona · Les numéros que l’on garde/)).toBeTruthy();
    expect(screen.getByText(/Campagne globale · La nuit du signal libre/)).toBeTruthy();
  });
});
