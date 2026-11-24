// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { PentagramLiveFight } from '../components/PentagramLiveFight';
import { buildCombatantDefinition } from '../lib/pentagram-fighters';
import { DEFAULT_PENTAGRAM_STAGE } from '../lib/pentagram-stages';
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
    const delta = Math.min(50, remaining);
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
  const fighter = getStandaloneFighter('hb_moxxie')!;
  const definition = buildCombatantDefinition(fighter.character, fighter.profile);
  return {
    fighterOne: fighter.character, fighterTwo: fighter.character,
    fighterOneDefinition: definition, fighterTwoDefinition: definition,
    matchMode: 'local', aiDifficulty: 'standard', stage: DEFAULT_PENTAGRAM_STAGE,
    timeline: STANDALONE_TIMELINE, infernalRules: true,
    soundtrackEnabled: false, soundtrackStatus: 'idle',
    onSoundtrackToggle: vi.fn(), onSoundtrackPause: vi.fn(), onSoundtrackResume: vi.fn(), onExit: vi.fn(),
    onMatchComplete: vi.fn(), ...overrides,
  };
}
function stage() { return screen.getByRole('region', { name: /Live combat/i }); }
function key(code: string) { fireEvent.keyDown(stage(), { code }); fireEvent.keyUp(stage(), { code }); }
function effect(side: 'one' | 'two' = 'one') {
  return document.querySelector<HTMLImageElement>(`.infernal-attack-effect[data-side="${side}"]`);
}
function start() { advance(4000); expect(stage().dataset.phase).toBe('running'); }

describe('Infernal attack artwork in the live arena', () => {
  it('renders both players independently and resumes the same frame after pause', () => {
    render(<PentagramLiveFight {...props()} />);
    expect(effect()).toBeNull();
    start();
    key('KeyG'); key('KeyK');
    advance(180);
    expect(effect('one')?.src).toContain('/vfx/infernal-versus/moxxie-bullet.webp');
    expect(effect('two')?.src).toContain('/vfx/infernal-versus/moxxie-bullet.webp');
    expect(effect('one')?.dataset.facing).toBe('right');
    expect(effect('two')?.dataset.facing).toBe('left');
    expect(effect('one')?.closest('[aria-hidden="true"]')).not.toBeNull();
    const leftOne = effect('one')!.style.left;
    const leftTwo = effect('two')!.style.left;
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(effect('one')).toBeNull();
    expect(effect('two')).toBeNull();
    advance(1000);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(effect('one')!.style.left).toBe(leftOne);
    expect(effect('two')!.style.left).toBe(leftTwo);
    advance(250);
    expect(effect('one')).toBeNull();
    expect(effect('two')).toBeNull();
  });

  it('clears artwork on both round KOs, finish selection, finisher and results', () => {
    const base = props();
    const input = props({ fighterOneDefinition: { ...base.fighterOneDefinition, power: 1000, range: 1000 } });
    render(<PentagramLiveFight {...input} />);
    start();
    key('KeyG'); advance(180);
    expect(effect()).not.toBeNull();
    advance(100);
    expect(stage().dataset.phase).toBe('outro');
    expect(effect()).toBeNull();
    advance(3000);
    fireEvent.click(screen.getByRole('button', { name: 'Next round' }));
    advance(1500);
    key('KeyG'); advance(180);
    expect(effect()).not.toBeNull();
    advance(100);
    expect(stage().dataset.phase).toBe('finish-window');
    expect(effect()).toBeNull();
    key('KeyH');
    expect(stage().dataset.phase).toBe('finisher');
    expect(effect()).toBeNull();
    advance(5000);
    expect(stage().dataset.phase).toBe('results');
    expect(effect()).toBeNull();
    expect(input.onMatchComplete).toHaveBeenCalledTimes(1);
  });

  it('renders fixed low-motion release art without a moving anticipation', () => {
    render(<PentagramLiveFight {...props({ reducedMotion: true })} />);
    start(); key('KeyG'); advance(180);
    expect(effect()).toBeNull();
    advance(49);
    expect(effect()!.dataset.effectPhase).toBe('release');
    const position = effect()!.style.left;
    const opacity = effect()!.style.opacity;
    advance(50);
    expect(effect()!.style.left).toBe(position);
    expect(effect()!.style.opacity).toBe(opacity);
    advance(60);
    expect(effect()).toBeNull();
  });

  it('keeps the existing manager rules free of standalone-only effects', () => {
    render(<PentagramLiveFight {...props({ infernalRules: false })} />);
    start(); key('KeyG'); advance(180);
    expect(document.querySelector('.arena-combatant.is-one')?.getAttribute('data-action')).toBe('heavy');
    expect(effect()).toBeNull();
  });
});
