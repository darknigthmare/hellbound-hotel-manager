import { describe, expect, it } from 'vitest';
import { getCombatPoseColumn } from '../lib/pentagram-animation';
import {
  createCombatState,
  resolveCombatAttack,
  stepCombat,
  type CombatInputs,
  type CombatantDefinition,
  type CombatState,
} from '../lib/pentagram-combat';

const fighterOne: CombatantDefinition = {
  name: 'Angel Dust',
  power: 14,
  range: 74,
  speed: 78,
  guard: 44,
  tensionGain: 18,
  basicMove: 'Web kick chain',
  heavyMove: 'Crossfire heel',
  specialMove: 'Stage-wire flourish',
};

const fighterTwo: CombatantDefinition = {
  name: 'Vaggie',
  power: 14,
  range: 66,
  speed: 72,
  guard: 76,
  tensionGain: 14,
  basicMove: 'Spear-line feint',
  heavyMove: 'Spear-breaker arc',
  specialMove: 'Guardian intercept',
};

const idleInputs: CombatInputs = {
  one: { left: false, right: false, guard: false },
  two: { left: false, right: false, guard: false },
};

function advance(
  state: CombatState,
  inputs: CombatInputs,
  frames: number,
  elapsedMs = 16,
): CombatState {
  let next = state;
  for (let frame = 0; frame < frames; frame += 1) {
    next = stepCombat(next, inputs, elapsedMs, fighterOne, fighterTwo);
  }
  return next;
}

describe('Pentagram Arena live combat engine', () => {
  it('moves continuously, stops on release and counts down without attacks', () => {
    const initial = createCombatState(fighterOne, fighterTwo);
    const movingInputs: CombatInputs = {
      ...idleInputs,
      one: { left: false, right: true, guard: false },
    };
    const moving = advance(initial, movingInputs, 20);

    expect(moving.positionOne).toBeGreaterThan(initial.positionOne);
    expect(moving.actionOne).toBe('walk');
    expect(moving.timerMs).toBeLessThan(initial.timerMs);

    const stopped = advance(moving, idleInputs, 2);
    expect(stopped.positionOne).toBe(moving.positionOne);
    expect(stopped.actionOne).toBe('idle');
  });

  it('keeps both fighters inside the lane and prevents crossing', () => {
    const closingInputs: CombatInputs = {
      one: { left: false, right: true, guard: false },
      two: { left: true, right: false, guard: false },
    };
    const closed = advance(createCombatState(fighterOne, fighterTwo), closingInputs, 240);

    expect(closed.positionOne).toBeGreaterThanOrEqual(7);
    expect(closed.positionTwo).toBeLessThanOrEqual(93);
    expect(closed.positionTwo - closed.positionOne).toBeGreaterThanOrEqual(7);
  });

  it('uses real range and cooldown instead of applying every key repeat', () => {
    const initial = createCombatState(fighterOne, fighterTwo);
    const whiff = resolveCombatAttack(initial, 'one', 'light', fighterOne, fighterTwo);

    expect(whiff.hpTwo).toBe(100);
    expect(whiff.log[0].text).toMatch(/outside range/i);

    const inRange = { ...initial, positionOne: 44, positionTwo: 51 };
    const firstHit = resolveCombatAttack(inRange, 'one', 'light', fighterOne, fighterTwo);
    const repeatedHit = resolveCombatAttack(firstHit, 'one', 'light', fighterOne, fighterTwo);

    expect(firstHit.hpTwo).toBeLessThan(100);
    expect(repeatedHit.hpTwo).toBe(firstHit.hpTwo);
  });

  it('lets short-range fighters connect at the minimum collision gap', () => {
    const niffty: CombatantDefinition = {
      ...fighterOne,
      name: 'Niffty',
      range: 36,
      basicMove: 'Needle dash',
    };
    const touching = { ...createCombatState(niffty, fighterTwo), positionOne: 44, positionTwo: 51 };
    const hit = resolveCombatAttack(touching, 'one', 'light', niffty, fighterTwo);

    expect(hit.hpTwo).toBeLessThan(100);
  });

  it('supports a deliberate light-to-heavy touch cancel without preserving attacker guard', () => {
    const inRange = {
      ...createCombatState(fighterOne, fighterTwo),
      positionOne: 44,
      positionTwo: 51,
      guardOne: true,
      actionOne: 'guard' as const,
    };
    const light = resolveCombatAttack(inRange, 'one', 'light', fighterOne, fighterTwo);
    const nearEndOfDoubleTapWindow = stepCombat(light, idleInputs, 320, fighterOne, fighterTwo);
    const heavyCancel = resolveCombatAttack(
      nearEndOfDoubleTapWindow,
      'one',
      'heavy',
      fighterOne,
      fighterTwo,
      true,
    );

    expect(light.guardOne).toBe(false);
    expect(heavyCancel.hpTwo).toBeLessThan(nearEndOfDoubleTapWindow.hpTwo);
    expect(heavyCancel.actionOne).toBe('heavy');
  });

  it('makes held guard reduce damage and build defender tension', () => {
    const inRange = { ...createCombatState(fighterOne, fighterTwo), positionOne: 44, positionTwo: 51 };
    const guardingInputs: CombatInputs = {
      ...idleInputs,
      two: { left: false, right: false, guard: true },
    };
    const guarding = stepCombat(inRange, guardingInputs, 0, fighterOne, fighterTwo);
    const guardedHit = resolveCombatAttack(guarding, 'one', 'heavy', fighterOne, fighterTwo);
    const openHit = resolveCombatAttack(inRange, 'one', 'heavy', fighterOne, fighterTwo);

    expect(guarding.guardTwo).toBe(true);
    expect(guardedHit.hpTwo).toBeGreaterThan(openHit.hpTwo);
    expect(guardedHit.tensionTwo).toBeGreaterThan(0);
  });

  it('requires tension for specials and spends it when the move launches', () => {
    const inRange = { ...createCombatState(fighterOne, fighterTwo), positionOne: 42, positionTwo: 51 };
    const denied = resolveCombatAttack(inRange, 'one', 'special', fighterOne, fighterTwo);

    expect(denied.hpTwo).toBe(100);
    expect(denied.log[0].text).toMatch(/needs 50 tension/i);

    const charged = { ...inRange, tensionOne: 50 };
    const special = resolveCombatAttack(charged, 'one', 'special', fighterOne, fighterTwo);
    expect(special.hpTwo).toBeLessThan(100);
    expect(special.tensionOne).toBeLessThan(50);
    expect(special.actionOne).toBe('special');
  });

  it('ends the live round on K.O. or when real time expires', () => {
    const vulnerable = {
      ...createCombatState(fighterOne, fighterTwo),
      positionOne: 44,
      positionTwo: 51,
      hpTwo: 3,
    };
    const knockout = resolveCombatAttack(vulnerable, 'one', 'light', fighterOne, fighterTwo);

    expect(knockout.active).toBe(false);
    expect(knockout.winner).toBe('one');
    expect(knockout.actionOne).toBe('victory');
    expect(knockout.actionTwo).toBe('ko');

    const almostTimedOut = { ...createCombatState(fighterOne, fighterTwo), timerMs: 32 };
    const timedOut = stepCombat(almostTimedOut, idleInputs, 64, fighterOne, fighterTwo);
    expect(timedOut.active).toBe(false);
    expect(timedOut.winner).toBe('draw');
  });

  it('uses real elapsed time for the clock while clamping only physics movement', () => {
    const initial = createCombatState(fighterOne, fighterTwo);
    const movingInputs: CombatInputs = {
      ...idleInputs,
      one: { left: false, right: true, guard: false },
    };
    const afterSlowFrame = stepCombat(initial, movingInputs, 1_000, fighterOne, fighterTwo);

    expect(afterSlowFrame.timerMs).toBe(98_000);
    expect(afterSlowFrame.positionOne - initial.positionOne).toBeLessThan(2);
  });

  it('maps attacks through readable anticipation, strike and recovery sprite poses', () => {
    expect(getCombatPoseColumn('idle', 0)).toBe(0);
    expect(getCombatPoseColumn('walk', 0)).toBe(2);
    expect(getCombatPoseColumn('light', 340)).toBe(3);
    expect(getCombatPoseColumn('light', 80)).toBe(4);
    expect(getCombatPoseColumn('heavy', 460)).toBe(2);
    expect(getCombatPoseColumn('heavy', 220)).toBe(3);
    expect(getCombatPoseColumn('heavy', 80)).toBe(4);
    expect(getCombatPoseColumn('special', 700)).toBe(2);
    expect(getCombatPoseColumn('special', 340)).toBe(3);
    expect(getCombatPoseColumn('special', 100)).toBe(4);
    expect(getCombatPoseColumn('victory', 0)).toBe(5);
  });
});
