// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { PentagramLiveFight } from '../components/PentagramLiveFight';
import * as combatAi from '../lib/pentagram-ai';
import { buildCombatantDefinition } from '../lib/pentagram-fighters';
import { DEFAULT_PENTAGRAM_STAGE } from '../lib/pentagram-stages';
import { getCombatSpriteAsset } from '../lib/character-sprites';
import { getStandaloneFighter, STANDALONE_TIMELINE } from '../standalone/roster';

let clock = 0;
let serial = 0;
let callbacks = new Map<number, FrameRequestCallback>();

beforeEach(() => {
  clock = 0;
  serial = 0;
  callbacks = new Map();
  vi.spyOn(window.performance, 'now').mockImplementation(() => clock);
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    callbacks.set(++serial, callback);
    return serial;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => { callbacks.delete(id); });
});
afterEach(() => { cleanup(); callbacks.clear(); vi.restoreAllMocks(); });

function advance(milliseconds: number) {
  let remaining = milliseconds;
  while (remaining > 0) {
    const delta = Math.min(100, remaining);
    act(() => {
      clock += delta;
      const scheduled = [...callbacks.values()];
      callbacks.clear();
      scheduled.forEach(callback => callback(clock));
    });
    remaining -= delta;
  }
}

function props(overrides: Partial<ComponentProps<typeof PentagramLiveFight>> = {}): ComponentProps<typeof PentagramLiveFight> {
  const one = getStandaloneFighter('hb_blitzo')!;
  const two = getStandaloneFighter('hb_millie')!;
  return {
    fighterOne: one.character, fighterTwo: two.character,
    // Large power/range isolates match lifecycle using the actual engine.
    fighterOneDefinition: { ...buildCombatantDefinition(one.character, one.profile), power: 1_000, range: 1_000 },
    fighterTwoDefinition: buildCombatantDefinition(two.character, two.profile),
    matchMode: 'local', aiDifficulty: 'standard', stage: DEFAULT_PENTAGRAM_STAGE,
    timeline: STANDALONE_TIMELINE, soundtrackEnabled: false, soundtrackStatus: 'idle',
    onSoundtrackToggle: vi.fn(), onSoundtrackPause: vi.fn(), onSoundtrackResume: vi.fn(), onExit: vi.fn(),
    onMatchComplete: vi.fn(), onNextMatch: vi.fn(), nextMatchLabel: 'Combat suivant',
    ...overrides,
  };
}
function stage() { return screen.getByRole('region', { name: /Live combat/i }); }
function key(code: string) {
  fireEvent.keyDown(stage(), { code });
  fireEvent.keyUp(stage(), { code });
}
function start() { advance(4_000); expect(stage().getAttribute('data-phase')).toBe('running'); }
function knockOut() { key('KeyG'); advance(1_000); }

describe('standalone combat lifecycle', () => {
  it.each([
    ['husk', false, 'husk-guard'],
    ['hb_millie', true, 'hb_millie-ready'],
    ['lucifer', true, 'lucifer-guard'],
    ['hb_moxxie', true, 'hb_moxxie-guard'],
    ['hz_katie_killjoy', true, 'hz_katie_killjoy-guard'],
    ['hz_tom_trench', true, 'hz_tom_trench-guard'],
    ['hb_mammon', true, 'hb_mammon-guard'],
    ['hb_vortex', false, 'hb_vortex-guard'],
    ['hb_glitz', false, 'hb_glitz-guard'],
    ['hb_glam', false, 'hb_glam-guard'],
  ] as const)('keeps the recovered %s pose format through a held guard', (id, portrait, guardPose) => {
    const fighter = getStandaloneFighter(id)!;
    render(<PentagramLiveFight {...props({
      training: true, infernalRules: true, fighterOne: fighter.character,
      fighterOneDefinition: buildCombatantDefinition(fighter.character, fighter.profile),
    })} />);
    start();
    const combatant = document.querySelector<HTMLElement>('.arena-combatant.is-one')!;
    const idleImage = combatant.querySelector<HTMLImageElement>('img.infernal-individual-pose')!;
    expect(idleImage.getAttribute('src')).toBe(`/assets/sprites/individual/${id}-ready.webp`);
    expect(idleImage.classList.contains('infernal-individual-pose--portrait')).toBe(portrait);
    fireEvent.keyDown(stage(), { code: 'KeyE' });
    advance(100);
    expect(combatant.dataset.action).toBe('guard');
    const guardImage = combatant.querySelector<HTMLImageElement>('img.infernal-individual-pose')!;
    expect(guardImage.getAttribute('src')).toBe(`/assets/sprites/individual/${guardPose}.webp`);
    expect(guardImage.classList.contains('infernal-individual-pose--portrait')).toBe(portrait);
    fireEvent.keyUp(stage(), { code: 'KeyE' });
  });

  it('keeps a portrait costume on both fighters and through crouch and jump', () => {
    const fighter = getStandaloneFighter('hb_moxxie')!;
    const definition = buildCombatantDefinition(fighter.character, fighter.profile);
    render(<PentagramLiveFight {...props({
      training: true, infernalRules: true,
      fighterOne: fighter.character, fighterTwo: fighter.character,
      fighterOneDefinition: definition, fighterTwoDefinition: definition,
      costumeOne: 'hb_moxxie-harvest-festival', costumeTwo: 'hb_moxxie-harvest-festival',
    })} />);
    start();
    const pose = (side: 'one' | 'two') => document.querySelector<HTMLImageElement>(`.arena-combatant.is-${side} img.infernal-individual-pose`)!;
    for (const side of ['one', 'two'] as const) {
      expect(pose(side).src).toContain('/costumes/hb_moxxie-harvest-festival.webp');
      expect(pose(side).classList.contains('infernal-individual-pose--portrait')).toBe(true);
    }
    fireEvent.keyDown(stage(), { code: 'KeyS' });
    advance(100);
    expect(pose('one').src).toContain('/costumes/hb_moxxie-harvest-festival-crouch.webp');
    expect(pose('one').classList.contains('infernal-individual-pose--portrait')).toBe(true);
    fireEvent.keyUp(stage(), { code: 'KeyS' });
    advance(100);
    key('KeyW');
    advance(100);
    expect(pose('one').src).toContain('/costumes/hb_moxxie-harvest-festival-jump.webp');
    expect(pose('one').classList.contains('infernal-individual-pose--portrait')).toBe(true);
  });

  it.each(['hz_katie_killjoy', 'hz_tom_trench', 'hb_mammon', 'hb_stella', 'hb_vortex', 'hb_glitz', 'hb_glam'])(
    'keeps %s authored fallback visible through intro, movement, crouch and attack on both sides', id => {
      const fighter = getStandaloneFighter(id)!;
      const definition = buildCombatantDefinition(fighter.character, fighter.profile);
      render(<PentagramLiveFight {...props({
        infernalRules: true,
        fighterOne: fighter.character, fighterTwo: fighter.character,
        fighterOneDefinition: definition, fighterTwoDefinition: definition,
      })} />);
      const cleanPoses = id === 'hb_stella'
        ? ['/assets/sprites/helluva/portraits/hb_stella.png']
        : (id === 'hb_glam' ? ['ready', 'guard', 'recoil'] : ['ready', 'guard', 'strike', 'recoil'])
          .map(pose => `/assets/sprites/individual/${id}-${pose}.webp`);
      const assertClean = () => {
        for (const side of ['one', 'two']) {
          const fighterElement = document.querySelector<HTMLElement>(`.arena-combatant.is-${side}`)!;
          expect(fighterElement.querySelector('.arena-sprite-frame')).toBeNull();
          expect(cleanPoses).toContain(fighterElement.querySelector('img.infernal-individual-pose')?.getAttribute('src'));
        }
      };
      assertClean();
      start();
      const first = document.querySelector<HTMLElement>('.arena-combatant.is-one')!;
      const second = document.querySelector<HTMLElement>('.arena-combatant.is-two')!;
      const positions = [Number(first.dataset.position), Number(second.dataset.position)];
      fireEvent.keyDown(stage(), { code: 'KeyA' });
      fireEvent.keyDown(stage(), { code: 'ArrowRight' });
      advance(100);
      expect(first.dataset.action).toBe('walk');
      expect(second.dataset.action).toBe('walk');
      expect(Number(first.dataset.position)).toBeLessThan(positions[0]);
      expect(Number(second.dataset.position)).toBeGreaterThan(positions[1]);
      assertClean();
      fireEvent.keyUp(stage(), { code: 'KeyA' });
      fireEvent.keyUp(stage(), { code: 'ArrowRight' });
      fireEvent.keyDown(stage(), { code: 'KeyS' });
      fireEvent.keyDown(stage(), { code: 'ArrowDown' });
      advance(100);
      expect(first.dataset.action).toBe('crouch');
      expect(second.dataset.action).toBe('crouch');
      assertClean();
      fireEvent.keyUp(stage(), { code: 'KeyS' });
      fireEvent.keyUp(stage(), { code: 'ArrowDown' });
      advance(100);
      key('KeyG'); key('KeyK');
      expect(first.dataset.action).toBe('heavy');
      expect(second.dataset.action).toBe('heavy');
      assertClean();
      advance(100);
      assertClean();
    },
  );

  it('plays each authored technique with its own keyboard and touch commands', () => {
    const vaggie = getStandaloneFighter('vaggie')!;
    render(<PentagramLiveFight {...props({
      training: true, infernalRules: true, fighterTwo: vaggie.character,
      fighterTwoDefinition: buildCombatantDefinition(vaggie.character, vaggie.profile),
    })} />);
    start();
    advance(100);
    const one = document.querySelector<HTMLElement>('.arena-combatant.is-one')!;
    const two = document.querySelector<HTMLElement>('.arena-combatant.is-two')!;
    const touchOne = screen.getByRole('button', { name: 'P1 technique signature' });
    const touchTwo = screen.getByRole('button', { name: 'P2 technique signature' });
    key('KeyT');
    fireEvent.click(touchTwo);
    expect(one.dataset.action).toBe('signature');
    expect(two.dataset.action).toBe('signature');
    advance(1200);
    fireEvent.click(touchOne);
    key('KeyI');
    expect(one.dataset.action).toBe('signature');
    expect(two.dataset.action).toBe('signature');
  });

  it('renders Helluva intros on a real base stance rather than invented cinematic assets', () => {
    render(<PentagramLiveFight {...props()} />);
    const fighter = document.querySelector<HTMLElement>('.arena-combatant.is-one')!;
    const frame = fighter.querySelector<HTMLElement>('.arena-sprite-frame')!;
    expect(fighter.dataset.poseColumn).toBe('2');
    expect(frame.style.backgroundImage).toContain(getCombatSpriteAsset('hb_blitzo')!.sheet);
    expect(frame.style.backgroundImage).not.toContain('/cinematics/');
  });

  it.each([false, true])('offers an idle/guard training dummy without AI (guard=%s)', guard => {
    const decide = vi.spyOn(combatAi, 'decideCombatAi');
    const input = props({ training: true, trainingGuard: guard, matchMode: 'ai' });
    render(<PentagramLiveFight {...input} />);
    start();
    advance(300);
    const opponent = document.querySelector<HTMLElement>('.arena-combatant.is-two')!;
    expect(opponent.dataset.action).toBe(guard ? 'guard' : 'idle');
    expect(decide).not.toHaveBeenCalled();
    expect(input.onMatchComplete).not.toHaveBeenCalled();
  });

  it('resets the dojo health, tension, timer and held movement explicitly', () => {
    render(<PentagramLiveFight {...props({ training: true, matchMode: 'ai', fighterOneDefinition: { ...props().fighterOneDefinition, power: 15 } })} />);
    start();
    key('KeyG'); advance(600);
    expect(Number(screen.getByRole('progressbar', { name: 'Millie health' }).getAttribute('aria-valuenow'))).toBeLessThan(100);
    fireEvent.keyDown(stage(), { code: 'KeyD' }); advance(500);
    fireEvent.click(screen.getByRole('button', { name: 'Réinitialiser l’entraînement' }));
    advance(1_500);
    const fighter = document.querySelector<HTMLElement>('.arena-combatant.is-one')!;
    const resetPosition = fighter.dataset.position;
    advance(500);
    expect(fighter.dataset.position).toBe(resetPosition);
    expect(screen.getByRole('progressbar', { name: 'Millie health' }).getAttribute('aria-valuenow')).toBe('100');
    expect(screen.getByRole('meter', { name: 'Blitzø tension' }).getAttribute('aria-valuenow')).toBe('100');
    expect(screen.getByLabelText('Unlimited training time').textContent).toBe('∞');
  });

  it('keeps training open through repeated knockouts and more than one minute without recording results', () => {
    const input = props({ training: true, matchMode: 'ai' });
    render(<PentagramLiveFight {...input} />);
    start();
    for (let i = 0; i < 3; i += 1) { knockOut(); expect(stage().getAttribute('data-phase')).toBe('running'); }
    advance(61_000);
    expect(stage().getAttribute('data-phase')).toBe('running');
    expect(screen.getByRole('progressbar', { name: 'Millie health' }).getAttribute('aria-valuenow')).toBe('100');
    expect(input.onMatchComplete).not.toHaveBeenCalled();
    expect(input.onNextMatch).not.toHaveBeenCalled();
  }, 20_000);

  it('records one completed match after two rounds and advances only from the results action', () => {
    const input = props();
    const view = render(<PentagramLiveFight {...input} />);
    start(); knockOut();
    expect(input.onMatchComplete).not.toHaveBeenCalled();
    expect(document.querySelector<HTMLElement>('.arena-combatant.is-one')?.dataset.poseColumn).toBe('5');
    advance(3_000);
    fireEvent.click(screen.getByRole('button', { name: 'Next round' }));
    advance(1_500); knockOut();
    expect(input.onMatchComplete).toHaveBeenCalledTimes(1);
    expect(input.onNextMatch).not.toHaveBeenCalled();
    const repeatedCallback = vi.fn();
    view.rerender(<PentagramLiveFight {...input} onMatchComplete={repeatedCallback} />);
    advance(3_000);
    expect(repeatedCallback).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Combat suivant' }));
    expect(input.onNextMatch).toHaveBeenCalledTimes(1);
  });
});

describe('Infernal Versus finishing sequence', () => {
  function decisiveKo() {
    start(); knockOut(); advance(3000);
    fireEvent.click(screen.getByRole('button', { name: 'Next round' }));
    advance(1500); knockOut();
    expect(stage().dataset.phase).toBe('finish-window');
  }
  it('keeps clean Katie and Tom art during knockout, shared finisher and victory', () => {
    const katie = getStandaloneFighter('hz_katie_killjoy')!;
    const tom = getStandaloneFighter('hz_tom_trench')!;
    render(<PentagramLiveFight {...props({
      infernalRules: true, fighterOne: katie.character, fighterTwo: tom.character,
      fighterOneDefinition: { ...buildCombatantDefinition(katie.character, katie.profile), power: 1000, range: 1000 },
      fighterTwoDefinition: buildCombatantDefinition(tom.character, tom.profile),
    })} />);
    decisiveKo();
    const assertClean = () => {
      expect(stage().querySelector('.arena-sprite-frame')).toBeNull();
      expect(stage().querySelectorAll('img.infernal-individual-pose')).toHaveLength(2);
    };
    assertClean();
    key('KeyH'); advance(500);
    expect(stage().dataset.phase).toBe('finisher');
    assertClean();
    advance(1100);
    expect(stage().dataset.phase).toBe('outro');
    assertClean();
  });
  it('keeps the separated cane mounted at the same finishing frame through pause and resume', () => {
    const lucifer = getStandaloneFighter('lucifer')!;
    const input = props({ infernalRules: true, fighterOne: lucifer.character,
      fighterOneDefinition: { ...buildCombatantDefinition(lucifer.character, lucifer.profile), power: 1000, range: 1000 } });
    render(<PentagramLiveFight {...input} />);
    decisiveKo();
    key('KeyH'); advance(500);
    const cane = stage().querySelector('.infernal-detached-prop');
    expect(cane?.getAttribute('src')).toBe('/assets/sprites/parts/lucifer-apple-cane.webp');
    const frame = stage().querySelector('.is-one')?.getAttribute('data-frame-index');
    key('KeyP'); advance(4000);
    expect(stage().dataset.phase).toBe('paused');
    expect(stage().querySelector('.infernal-detached-prop')).toBe(cane);
    expect(stage().querySelector('.is-one')?.getAttribute('data-frame-index')).toBe(frame);
    key('KeyP');
    expect(stage().querySelector('.infernal-detached-prop')).toBe(cane);
    advance(1100);
    expect(stage().querySelector('.infernal-detached-prop')).toBeNull();
    expect(input.onMatchComplete).toHaveBeenCalledTimes(1);
  });
  it('allows only the local winner to trigger the finish and preserves a single result', () => {
    const input = props({ infernalRules: true });
    render(<PentagramLiveFight {...input} />);
    decisiveKo();
    expect(input.onMatchComplete).toHaveBeenCalledTimes(1);
    key('KeyL'); expect(stage().dataset.phase).toBe('finish-window');
    key('KeyP'); advance(4200); expect(stage().dataset.phase).toBe('paused');
    key('KeyP'); key('KeyH');
    expect(stage().dataset.phase).toBe('finisher');
    expect(screen.getByText('Contrat tamponné')).toBeTruthy();
    advance(550);
    expect(stage().querySelector('.is-one .infernal-individual-pose')?.getAttribute('src')).toBe('/assets/sprites/finishers/hb_blitzo.webp');
    advance(3850);
    expect(stage().dataset.phase).toBe('results');
    expect(input.onMatchComplete).toHaveBeenCalledTimes(1);
  });
  it('skips a finisher on request and continues the match normally', () => {
    render(<PentagramLiveFight {...props({ infernalRules: true, reducedMotion: true })} />);
    decisiveKo();
    fireEvent.click(screen.getByRole('button', { name: 'Passer' }));
    expect(stage().dataset.phase).toBe('outro');
    advance(3200); expect(stage().dataset.phase).toBe('results');
  });
});
