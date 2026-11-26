// @vitest-environment jsdom

import { act, cleanup, render } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PentagramLiveFight } from '../components/PentagramLiveFight';
import { getCombatSpriteAsset } from '../lib/character-sprites';
import { getInfernalCostume } from '../lib/infernal-appearances';
import { buildCombatantDefinition } from '../lib/pentagram-fighters';
import { getPentagramStage } from '../lib/pentagram-stages';
import { getStandaloneFighter, STANDALONE_TIMELINE } from '../standalone/roster';

const BLITZO_COSTUME = 'hb_blitzo-flashback-ghostfuckers-s2';
const MOXXIE_COSTUME = 'hb_moxxie-dress-disguise-training-short';
const MILLIE_COSTUME = 'hb_millie-dress-disguise-training-short';
const BULLET = '/assets/vfx/infernal-versus/moxxie-bullet.webp';
let images: HTMLImageElement[] = [];
let decoded: string[] = [];

beforeEach(() => {
  images = [];
  decoded = [];
  vi.useFakeTimers();
  // Exercise the real preload effect without advancing combat simulation.
  vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  vi.spyOn(window, 'Image').mockImplementation(function () {
    const image = document.createElement('img');
    image.decode = vi.fn(async () => {
      decoded.push(image.getAttribute('src') ?? '');
    });
    images.push(image);
    return image;
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function props(oneId: string, twoId: string, overrides: Partial<ComponentProps<typeof PentagramLiveFight>> = {}): ComponentProps<typeof PentagramLiveFight> {
  const one = getStandaloneFighter(oneId)!;
  const two = getStandaloneFighter(twoId)!;
  return {
    fighterOne: one.character,
    fighterTwo: two.character,
    fighterOneDefinition: buildCombatantDefinition(one.character, one.profile),
    fighterTwoDefinition: buildCombatantDefinition(two.character, two.profile),
    // The V14 venue has no spectator banks, so requests belong to the fighters.
    matchMode: 'local', aiDifficulty: 'standard', stage: getPentagramStage('full-moon-shop-s2'),
    timeline: STANDALONE_TIMELINE, infernalRules: true,
    soundtrackEnabled: false, soundtrackStatus: 'idle',
    onSoundtrackToggle: vi.fn(), onSoundtrackPause: vi.fn(), onSoundtrackResume: vi.fn(), onExit: vi.fn(),
    ...overrides,
  };
}

function requested() {
  return images.map(image => image.getAttribute('src'));
}

function finishPreloading() {
  act(() => { vi.advanceTimersByTime(900); });
  // Every observed Image.src assignment reaches the preload decoder exactly once.
  expect(decoded).toEqual(requested());
  images.forEach(image => expect(image.decode).toHaveBeenCalledTimes(1));
}

function expectNormalBanks(fighterId: string) {
  const sprite = getCombatSpriteAsset(fighterId)!;
  for (const url of new Set([...Object.values(sprite.animationSheets), ...Object.values(sprite.cinematicSheets)])) {
    expect(requested()).toContain(url);
  }
}

describe('Combat image preloading for static costumes', () => {
  it('requests only the two READY images and shared attack effect when both sides are static', () => {
    render(<PentagramLiveFight {...props('hb_blitzo', 'hb_moxxie', {
      costumeOne: BLITZO_COSTUME, costumeTwo: MOXXIE_COSTUME,
    })} />);
    const readyOne = getInfernalCostume('hb_blitzo', BLITZO_COSTUME)!.ready;
    const readyTwo = getInfernalCostume('hb_moxxie', MOXXIE_COSTUME)!.ready;
    expect(new Set(requested())).toEqual(new Set([readyOne, readyTwo, BULLET]));
    expect(images).toHaveLength(3);
    expect(document.querySelector('.arena-combatant.is-one > img')?.getAttribute('src')).toBe(readyOne);
    expect(document.querySelector('.arena-combatant.is-two > img')?.getAttribute('src')).toBe(readyTwo);
    finishPreloading();
    expect(images).toHaveLength(3);
  });

  it('keeps the normal opponent and detached finish prop without loading the static side’s banks', () => {
    render(<PentagramLiveFight {...props('hb_moxxie', 'lucifer', { costumeOne: MOXXIE_COSTUME })} />);
    expect(requested()).toContain(getInfernalCostume('hb_moxxie', MOXXIE_COSTUME)!.ready);
    expect(requested()).toContain(BULLET);
    expect(requested()).toContain('/assets/sprites/parts/lucifer-apple-cane.webp');
    const beforeDeferred = images.length;
    act(() => { vi.advanceTimersByTime(899); });
    expect(images).toHaveLength(beforeDeferred);
    finishPreloading();
    expectNormalBanks('lucifer');
    expect(images.length).toBeGreaterThan(beforeDeferred);
    expect(requested().some(url => url?.includes('helluva-core'))).toBe(false);
    expect(requested().some(url => url?.includes('/individual/hb_moxxie-'))).toBe(false);
  });

  it('preserves shared banks for normal Blitzø while skipping Moxxie’s unused base poses on the other side', () => {
    render(<PentagramLiveFight {...props('hb_blitzo', 'hb_moxxie', { costumeTwo: MOXXIE_COSTUME })} />);
    finishPreloading();
    expectNormalBanks('hb_blitzo');
    for (const pose of ['ready', 'guard', 'strike', 'recoil']) {
      expect(requested()).toContain(`/assets/sprites/individual/hb_blitzo-${pose}.webp`);
      expect(requested()).not.toContain(`/assets/sprites/individual/hb_moxxie-${pose}.webp`);
    }
    expect(requested()).toContain('/assets/sprites/finishers/hb_blitzo.webp');
    expect(requested().filter(url => url === BULLET)).toHaveLength(1);
  });

  it('retains all shared banks and base poses in a static-versus-normal mirror match', () => {
    render(<PentagramLiveFight {...props('hb_blitzo', 'hb_blitzo', { costumeOne: BLITZO_COSTUME })} />);
    finishPreloading();
    expectNormalBanks('hb_blitzo');
    for (const pose of ['ready', 'guard', 'strike', 'recoil']) {
      expect(requested().filter(url => url === `/assets/sprites/individual/hb_blitzo-${pose}.webp`)).toHaveLength(1);
    }
    expect(requested()).toContain(getInfernalCostume('hb_blitzo', BLITZO_COSTUME)!.ready);
    expect(requested()).toContain('/assets/sprites/finishers/hb_blitzo.webp');
  });

  it('keeps existing multi-pose costumes and their banks intact', () => {
    const costumeId = 'hb_moxxie-harvest-festival';
    render(<PentagramLiveFight {...props('hb_moxxie', 'hb_millie', {
      costumeOne: costumeId, costumeTwo: MILLIE_COSTUME,
    })} />);
    finishPreloading();
    expectNormalBanks('hb_moxxie');
    const outfit = getInfernalCostume('hb_moxxie', costumeId)!;
    if (outfit.staticReadyOnly) throw Error('This regression requires the existing multi-pose costume.');
    for (const url of [outfit.ready, outfit.strike, outfit.heavy, outfit.recoil, outfit.jump, outfit.crouch]) {
      if (url) expect(requested()).toContain(url);
    }
    expect(requested()).toContain(getInfernalCostume('hb_millie', MILLIE_COSTUME)!.ready);
    expect(requested()).not.toContain('/assets/sprites/individual/hb_millie-ready.webp');
    expect(requested()).not.toContain('/assets/sprites/individual/hb_millie-strike.webp');
  });

  it('ignores costume preload restrictions outside infernal rules', () => {
    render(<PentagramLiveFight {...props('hb_blitzo', 'hb_moxxie', {
      infernalRules: false, costumeOne: BLITZO_COSTUME, costumeTwo: MOXXIE_COSTUME,
    })} />);
    finishPreloading();
    expectNormalBanks('hb_blitzo');
    expect(requested().every(url => url?.endsWith('.png'))).toBe(true);
    expect(requested()).not.toContain(getInfernalCostume('hb_blitzo', BLITZO_COSTUME)!.ready);
    expect(requested()).not.toContain(getInfernalCostume('hb_moxxie', MOXXIE_COSTUME)!.ready);
    expect(requested()).not.toContain(BULLET);
  });
});
