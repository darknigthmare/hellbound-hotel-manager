import { describe, expect, it } from 'vitest';
import { getCombatPoseColumn } from '../lib/pentagram-animation';
import {
  createCombatState,
  createNextCombatRound,
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
  basicMove: 'Acrobat jab',
  heavyMove: 'Crossfire sweep',
  specialMove: 'Multi-angle barrage',
};

const fighterTwo: CombatantDefinition = {
  name: 'Vaggie',
  power: 14,
  range: 66,
  speed: 72,
  guard: 76,
  tensionGain: 14,
  basicMove: 'Spear thrust',
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
  definitionOne = fighterOne,
  definitionTwo = fighterTwo,
): CombatState {
  let next = state;
  for (let frame = 0; frame < frames; frame += 1) {
    next = stepCombat(next, inputs, elapsedMs, definitionOne, definitionTwo);
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

  it('applies damage only when the animation reaches its active impact window', () => {
    const inRange = {
      ...createCombatState(fighterOne, fighterTwo),
      positionOne: 44,
      positionTwo: 51,
    };
    const started = resolveCombatAttack(inRange, 'one', 'light', fighterOne, fighterTwo);
    const beforeImpact = advance(started, idleInputs, 7);
    const atImpact = advance(beforeImpact, idleInputs, 1);

    expect(started.hpTwo).toBe(100);
    expect(started.pendingAttackOne).toBe('light');
    expect(beforeImpact.hpTwo).toBe(100);
    expect(atImpact.hpTwo).toBeLessThan(100);
    expect(atImpact.pendingAttackOne).toBeNull();
    expect(atImpact.log[0].text).toMatch(/lands Acrobat jab/i);
    expect(atImpact.impactMsTwo).toBeGreaterThan(0);
    expect(atImpact.hitstopMs).toBeGreaterThan(0);
  });

  it('checks range at impact and cannot deal repeated damage from key repeat', () => {
    const initial = createCombatState(fighterOne, fighterTwo);
    const startedWhiff = resolveCombatAttack(initial, 'one', 'light', fighterOne, fighterTwo);
    const whiff = advance(startedWhiff, idleInputs, 8);

    expect(whiff.hpTwo).toBe(100);
    expect(whiff.log[0].text).toMatch(/escaped before impact/i);

    const inRange = { ...initial, positionOne: 44, positionTwo: 51 };
    const firstStart = resolveCombatAttack(inRange, 'one', 'light', fighterOne, fighterTwo);
    const repeatedStart = resolveCombatAttack(firstStart, 'one', 'light', fighterOne, fighterTwo);
    const firstHit = advance(repeatedStart, idleInputs, 8);
    const afterRecovery = advance(firstHit, idleInputs, 40);

    expect(repeatedStart.nextLogId).toBe(firstStart.nextLogId);
    expect(firstHit.hpTwo).toBeLessThan(100);
    expect(afterRecovery.hpTwo).toBe(firstHit.hpTwo);
  });

  it('lets short-range fighters connect at the minimum collision gap', () => {
    const niffty: CombatantDefinition = {
      ...fighterOne,
      name: 'Niffty',
      range: 36,
      speed: 94,
      basicMove: 'Cleaning dash',
      style: 'rushdown',
    };
    const touching = { ...createCombatState(niffty, fighterTwo), positionOne: 44, positionTwo: 51 };
    const started = resolveCombatAttack(touching, 'one', 'light', niffty, fighterTwo);
    const hit = advance(started, idleInputs, 8, 16, niffty, fighterTwo);

    expect(hit.hpTwo).toBeLessThan(100);
  });

  it('supports a deliberate light-to-heavy cancel and cancels the pending light impact', () => {
    const inRange = {
      ...createCombatState(fighterOne, fighterTwo),
      positionOne: 44,
      positionTwo: 51,
      guardOne: true,
      actionOne: 'guard' as const,
    };
    const light = resolveCombatAttack(inRange, 'one', 'light', fighterOne, fighterTwo);
    const heavyCancel = resolveCombatAttack(
      light,
      'one',
      'heavy',
      fighterOne,
      fighterTwo,
      true,
    );
    const heavyImpact = advance(heavyCancel, idleInputs, 14);

    expect(light.guardOne).toBe(false);
    expect(heavyCancel.hpTwo).toBe(100);
    expect(heavyCancel.pendingAttackOne).toBe('heavy');
    expect(heavyCancel.log[0].text).toMatch(/cancels into Crossfire sweep/i);
    expect(heavyImpact.hpTwo).toBeLessThan(100);
  });

  it('uses the defender guard state at impact instead of at button press', () => {
    const inRange = { ...createCombatState(fighterOne, fighterTwo), positionOne: 44, positionTwo: 51 };
    const guardingInputs: CombatInputs = {
      ...idleInputs,
      two: { left: false, right: false, guard: true },
    };
    const guardedStart = resolveCombatAttack(inRange, 'one', 'heavy', fighterOne, fighterTwo);
    const openStart = resolveCombatAttack(inRange, 'one', 'heavy', fighterOne, fighterTwo);
    const guardedHit = advance(guardedStart, guardingInputs, 14);
    const openHit = advance(openStart, idleInputs, 14);

    expect(guardedHit.guardTwo).toBe(true);
    expect(guardedHit.hpTwo).toBeGreaterThan(openHit.hpTwo);
    expect(guardedHit.tensionTwo).toBeGreaterThan(0);
    expect(guardedHit.log[0].text).toMatch(/through guard/i);
  });

  it('requires and spends special tension on launch, then damages on impact', () => {
    const inRange = { ...createCombatState(fighterOne, fighterTwo), positionOne: 42, positionTwo: 51 };
    const denied = resolveCombatAttack(inRange, 'one', 'special', fighterOne, fighterTwo);

    expect(denied.hpTwo).toBe(100);
    expect(denied.log[0].text).toMatch(/needs 50 tension/i);

    const charged = { ...inRange, tensionOne: 50 };
    const specialStart = resolveCombatAttack(charged, 'one', 'special', fighterOne, fighterTwo);
    const specialImpact = advance(specialStart, idleInputs, 23);

    expect(specialStart.hpTwo).toBe(100);
    expect(specialStart.tensionOne).toBe(0);
    expect(specialStart.actionOne).toBe('special');
    expect(specialImpact.hpTwo).toBeLessThan(100);
    expect(specialImpact.tensionOne).toBeGreaterThan(0);
  });

  it('resolves simultaneous active frames as a double K.O. trade', () => {
    const vulnerable = {
      ...createCombatState(fighterOne, fighterTwo),
      positionOne: 44,
      positionTwo: 51,
      hpOne: 3,
      hpTwo: 3,
    };
    const oneStarted = resolveCombatAttack(vulnerable, 'one', 'light', fighterOne, fighterTwo);
    const bothStarted = resolveCombatAttack(oneStarted, 'two', 'light', fighterOne, fighterTwo);
    const trade = advance(bothStarted, idleInputs, 8);

    expect(trade.active).toBe(false);
    expect(trade.hpOne).toBe(0);
    expect(trade.hpTwo).toBe(0);
    expect(trade.winner).toBe('draw');
    expect(trade.log[0].text).toMatch(/double K\.O\./i);
  });

  it('tracks a best-of-three set and resets cleanly for a rematch', () => {
    const firstVulnerable = {
      ...createCombatState(fighterOne, fighterTwo),
      positionOne: 44,
      positionTwo: 51,
      hpTwo: 3,
    };
    const firstStart = resolveCombatAttack(firstVulnerable, 'one', 'light', fighterOne, fighterTwo);
    const firstWin = advance(firstStart, idleInputs, 8);
    const secondRound = createNextCombatRound(firstWin, fighterOne, fighterTwo);
    const secondVulnerable = { ...secondRound, positionOne: 44, positionTwo: 51, hpTwo: 3 };
    const secondStart = resolveCombatAttack(secondVulnerable, 'one', 'light', fighterOne, fighterTwo);
    const matchWin = advance(secondStart, idleInputs, 8);
    const rematch = createNextCombatRound(matchWin, fighterOne, fighterTwo);

    expect(firstWin.roundWinsOne).toBe(1);
    expect(firstWin.matchWinner).toBeNull();
    expect(secondRound.round).toBe(2);
    expect(secondRound.roundWinsOne).toBe(1);
    expect(secondRound.hpOne).toBe(100);
    expect(matchWin.roundWinsOne).toBe(2);
    expect(matchWin.matchWinner).toBe('one');
    expect(rematch.round).toBe(1);
    expect(rematch.roundWinsOne).toBe(0);
    expect(rematch.roundWinsTwo).toBe(0);
  });

  it('ends on time and clamps long suspended frames for fair play', () => {
    const almostTimedOut = { ...createCombatState(fighterOne, fighterTwo), timerMs: 32 };
    const timedOut = stepCombat(almostTimedOut, idleInputs, 64, fighterOne, fighterTwo);
    expect(timedOut.active).toBe(false);
    expect(timedOut.winner).toBe('draw');

    const initial = createCombatState(fighterOne, fighterTwo);
    const movingInputs: CombatInputs = {
      ...idleInputs,
      one: { left: false, right: true, guard: false },
    };
    const afterSuspendedFrame = stepCombat(initial, movingInputs, 1_000, fighterOne, fighterTwo);

    expect(afterSuspendedFrame.timerMs).toBe(98_900);
    expect(afterSuspendedFrame.positionOne - initial.positionOne).toBeLessThan(3);
  });

  it('maps attacks through readable anticipation, strike and recovery sprite poses', () => {
    expect(getCombatPoseColumn('idle', 0)).toBe(2);
    expect(getCombatPoseColumn('walk', 0)).toBe(2);
    expect(getCombatPoseColumn('light', 340)).toBe(2);
    expect(getCombatPoseColumn('light', 220)).toBe(3);
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
