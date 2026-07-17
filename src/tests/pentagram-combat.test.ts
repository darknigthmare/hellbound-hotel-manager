import { describe, expect, it } from 'vitest';
import {
  getCombatAnimationFrame,
  getCombatPoseColumn,
} from '../lib/pentagram-animation';
import {
  DEFAULT_SPRITE_ANIMATION_SET_ID,
  SIX_POSE_COMBAT_ANIMATION_SET,
} from '../lib/sprite-animation-registry';
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
    const guardedWhiff = advance(startedWhiff, {
      ...idleInputs,
      two: { left: false, right: false, guard: true },
    }, 8);

    expect(whiff.hpTwo).toBe(100);
    expect(whiff.tensionOne).toBe(0);
    expect(whiff.tensionTwo).toBe(0);
    expect(guardedWhiff.tensionOne).toBe(0);
    expect(guardedWhiff.tensionTwo).toBe(0);
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

  it('ends on time and retains a visible one-second low-FPS frame', () => {
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

    expect(afterSuspendedFrame.timerMs).toBe(98_000);
    expect(afterSuspendedFrame.positionOne - initial.positionOne).toBeGreaterThan(10);
    expect(afterSuspendedFrame.positionOne).toBeLessThan(afterSuspendedFrame.positionTwo);
  });

  it('stops exactly at time-over instead of granting a late low-FPS impact', () => {
    const inRange = {
      ...createCombatState(fighterOne, fighterTwo),
      positionOne: 44,
      positionTwo: 51,
    };
    const started = resolveCombatAttack(inRange, 'one', 'light', fighterOne, fighterTwo);
    const justBeforeImpact = advance(started, idleInputs, 7);
    const oneMillisecondLeft = { ...justBeforeImpact, timerMs: 1 };
    const timedOut = stepCombat(oneMillisecondLeft, idleInputs, 480, fighterOne, fighterTwo);

    expect(timedOut.active).toBe(false);
    expect(timedOut.timerMs).toBe(0);
    expect(timedOut.hpTwo).toBe(100);
    expect(timedOut.tensionOne).toBe(0);
    expect(timedOut.winner).toBe('draw');
    expect(timedOut.log[0].text).toMatch(/time over/i);
  });

  it('produces the same active-frame result at low and high render cadence', () => {
    const inRange = {
      ...createCombatState(fighterOne, fighterTwo),
      positionOne: 44,
      positionTwo: 51,
    };
    const started = resolveCombatAttack(inRange, 'one', 'light', fighterOne, fighterTwo);
    const primed = advance(started, idleInputs, 2);
    const lowFpsStep = stepCombat(primed, idleInputs, 96, fighterOne, fighterTwo);
    const highFpsSteps = advance(primed, idleInputs, 6);

    expect(lowFpsStep.hpTwo).toBe(highFpsSteps.hpTwo);
    expect(lowFpsStep.tensionOne).toBe(highFpsSteps.tensionOne);
    expect(lowFpsStep.tensionTwo).toBe(highFpsSteps.tensionTwo);
    expect(lowFpsStep.actionMsOne).toBe(highFpsSteps.actionMsOne);
    expect(lowFpsStep.hitstopMs).toBe(highFpsSteps.hitstopMs);
    expect(lowFpsStep.log[0].text).toBe(highFpsSteps.log[0].text);
  });

  it('unlocks hit stun at the same instant across uneven render partitions', () => {
    const recovering: CombatState = {
      ...createCombatState(fighterOne, fighterTwo),
      actionOne: 'hit',
      actionMsOne: 21,
    };
    const movingInputs: CombatInputs = {
      ...idleInputs,
      one: { left: false, right: true, guard: false },
    };
    const singleFrame = stepCombat(recovering, movingInputs, 32, fighterOne, fighterTwo);
    const firstPartition = stepCombat(recovering, movingInputs, 10, fighterOne, fighterTwo);
    const unevenFrames = stepCombat(firstPartition, movingInputs, 22, fighterOne, fighterTwo);

    expect(singleFrame.positionOne).toBeCloseTo(unevenFrames.positionOne, 8);
    expect(singleFrame.actionMsOne).toBe(0);
    expect(unevenFrames.actionMsOne).toBe(0);
    expect(singleFrame.actionOne).toBe('walk');
    expect(unevenFrames.actionOne).toBe('walk');
  });

  it('keeps a complete attack synchronized across a 480 ms render frame', () => {
    const inRange = {
      ...createCombatState(fighterOne, fighterTwo),
      positionOne: 44,
      positionTwo: 51,
    };
    const started = resolveCombatAttack(inRange, 'one', 'light', fighterOne, fighterTwo);
    const lowFpsStep = stepCombat(started, idleInputs, 480, fighterOne, fighterTwo);
    const highFpsSteps = advance(started, idleInputs, 30);

    expect(lowFpsStep.hpTwo).toBe(highFpsSteps.hpTwo);
    expect(lowFpsStep.tensionOne).toBe(highFpsSteps.tensionOne);
    expect(lowFpsStep.tensionTwo).toBe(highFpsSteps.tensionTwo);
    expect(lowFpsStep.actionMsOne).toBe(highFpsSteps.actionMsOne);
    expect(lowFpsStep.cooldownMsOne).toBe(highFpsSteps.cooldownMsOne);
    expect(lowFpsStep.log.map(({ text }) => text)).toEqual(highFpsSteps.log.map(({ text }) => text));
  });

  it('maps attacks through readable anticipation, strike and recovery sprite poses', () => {
    expect(getCombatPoseColumn('idle', 0)).toBe(2);
    expect(getCombatPoseColumn('walk', 0)).toBe(2);
    expect(getCombatPoseColumn('light', 340)).toBe(2);
    expect(getCombatPoseColumn('light', 221)).toBe(3);
    expect(getCombatPoseColumn('light', 220)).toBe(4);
    expect(getCombatPoseColumn('light', 120)).toBe(2);
    expect(getCombatPoseColumn('heavy', 460)).toBe(2);
    expect(getCombatPoseColumn('heavy', 241)).toBe(3);
    expect(getCombatPoseColumn('heavy', 240)).toBe(4);
    expect(getCombatPoseColumn('heavy', 100)).toBe(5);
    expect(getCombatPoseColumn('special', 700)).toBe(2);
    expect(getCombatPoseColumn('special', 341)).toBe(3);
    expect(getCombatPoseColumn('special', 340)).toBe(4);
    expect(getCombatPoseColumn('special', 160)).toBe(5);
    expect(getCombatPoseColumn('light', 20)).toBe(2);
    expect(getCombatPoseColumn('heavy', 20)).toBe(5);
    expect(getCombatPoseColumn('special', 20)).toBe(5);
    expect(getCombatPoseColumn('victory', 0)).toBe(5);
  });

  it('normalizes authored impact boundaries to style-scaled action durations', () => {
    expect(getCombatPoseColumn('light', 199, { actionDurationMs: 306 })).toBe(3);
    expect(getCombatPoseColumn('light', 198, { actionDurationMs: 306 })).toBe(4);

    expect(getCombatPoseColumn('heavy', 265, { actionDurationMs: 506 })).toBe(3);
    expect(getCombatPoseColumn('heavy', 264, { actionDurationMs: 506 })).toBe(4);

    // 1.04 scaling rounds the 700 ms action to 728 ms and its 360 ms startup
    // to 374 ms. This is the case where linear normalization drifts early.
    expect(getCombatPoseColumn('special', 355, { actionDurationMs: 728 })).toBe(3);
    expect(getCombatPoseColumn('special', 354, { actionDurationMs: 728 })).toBe(4);
  });

  it('resolves every combat state through the shared versioned animation registry', () => {
    expect(SIX_POSE_COMBAT_ANIMATION_SET.id).toBe(DEFAULT_SPRITE_ANIMATION_SET_ID);
    expect(DEFAULT_SPRITE_ANIMATION_SET_ID).toBe('six-pose-combat-v2');
    expect(Object.keys(SIX_POSE_COMBAT_ANIMATION_SET.clips).sort()).toEqual([
      'guard',
      'heavy',
      'hit',
      'idle',
      'ko',
      'light',
      'special',
      'victory',
      'walk',
    ]);
    expect(getCombatAnimationFrame('light', 220)).toEqual({
      clip: 'light',
      frameIndex: 2,
      column: 4,
    });
    expect(getCombatAnimationFrame('heavy', 20)).toEqual({
      clip: 'heavy',
      frameIndex: 3,
      column: 5,
    });

    const attackBoundaries = Object.fromEntries(
      (['light', 'heavy', 'special'] as const).map((clipName) => {
        const clip = SIX_POSE_COMBAT_ANIMATION_SET.clips[clipName];
        const impactIndex = clip.frames.findIndex(({ column }) => column === 4);
        return [clipName, {
          totalMs: clip.frames.reduce((total, frame) => total + frame.durationMs, 0),
          impactStartMs: clip.frames
            .slice(0, impactIndex)
            .reduce((total, frame) => total + frame.durationMs, 0),
        }];
      }),
    );
    expect(attackBoundaries).toEqual({
      light: { totalMs: 340, impactStartMs: 120 },
      heavy: { totalMs: 460, impactStartMs: 220 },
      special: { totalMs: 700, impactStartMs: 360 },
    });
  });
});
