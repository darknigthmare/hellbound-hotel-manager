import { describe, expect, it } from 'vitest';
import {
  decideCombatAi,
  getCombatAiThinkInterval,
} from '../lib/pentagram-ai';
import {
  createCombatState,
  type CombatantDefinition,
} from '../lib/pentagram-combat';

const fighterOne: CombatantDefinition = {
  name: 'Charlie Morningstar',
  power: 11,
  range: 58,
  speed: 68,
  guard: 64,
  tensionGain: 16,
  basicMove: 'Royal jab',
  heavyMove: 'Morningstar sweep',
  specialMove: 'Morningstar rally',
  style: 'balanced',
};

const fighterTwo: CombatantDefinition = {
  name: 'Vaggie',
  power: 13,
  range: 68,
  speed: 72,
  guard: 78,
  tensionGain: 14,
  basicMove: 'Spear thrust',
  heavyMove: 'Spear-breaker arc',
  specialMove: 'Guardian intercept',
  style: 'duelist',
};

describe('Pentagram Arena CPU sparring', () => {
  it('closes distance without teleporting or attacking from across the stage', () => {
    const state = createCombatState(fighterOne, fighterTwo);
    const decision = decideCombatAi(
      state,
      'two',
      fighterOne,
      fighterTwo,
      'standard',
      () => 0.5,
    );

    expect(decision.input.left).toBe(true);
    expect(decision.input.right).toBe(false);
    expect(decision.attack).toBeNull();
  });

  it('can reactively guard a visible incoming attack at close range', () => {
    const threatened = {
      ...createCombatState(fighterOne, fighterTwo),
      positionOne: 44,
      positionTwo: 51,
      actionOne: 'heavy' as const,
      actionMsOne: 360,
      pendingAttackOne: 'heavy' as const,
    };
    const decision = decideCombatAi(
      threatened,
      'two',
      fighterOne,
      fighterTwo,
      'standard',
      () => 0,
    );

    expect(decision.input.guard).toBe(true);
    expect(decision.attack).toBeNull();
  });

  it('spends a charged special at range but never invents missing tension', () => {
    const close = {
      ...createCombatState(fighterOne, fighterTwo),
      positionOne: 42,
      positionTwo: 51,
    };
    const charged = { ...close, tensionTwo: 50 };
    const chargedDecision = decideCombatAi(
      charged,
      'two',
      fighterOne,
      fighterTwo,
      'overlord',
      () => 0,
    );
    const emptyDecision = decideCombatAi(
      close,
      'two',
      fighterOne,
      fighterTwo,
      'overlord',
      () => 0,
    );

    expect(chargedDecision.attack).toBe('special');
    expect(emptyDecision.attack).not.toBe('special');
  });

  it('does nothing while locked, during hitstop or after the round', () => {
    const base = createCombatState(fighterOne, fighterTwo);
    const locked = { ...base, actionTwo: 'hit' as const, actionMsTwo: 200 };
    const hitstop = { ...base, hitstopMs: 50 };
    const stopped = { ...base, active: false };

    for (const state of [locked, hitstop, stopped]) {
      const decision = decideCombatAi(
        state,
        'two',
        fighterOne,
        fighterTwo,
        'overlord',
        () => 0,
      );
      expect(decision.attack).toBeNull();
      expect(decision.input).toEqual({ left: false, right: false, guard: false });
    }
  });

  it('uses slower reaction intervals at lower difficulties', () => {
    expect(getCombatAiThinkInterval('rookie')).toBeGreaterThan(
      getCombatAiThinkInterval('standard'),
    );
    expect(getCombatAiThinkInterval('standard')).toBeGreaterThan(
      getCombatAiThinkInterval('overlord'),
    );
  });
});
