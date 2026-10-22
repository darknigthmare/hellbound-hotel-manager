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
  });

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
