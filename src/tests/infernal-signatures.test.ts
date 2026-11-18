import { describe, expect, it } from 'vitest';
import {
  canStartCombatAttack, createCombatState, getCombatMoveInfo, releaseCombatGuard,
  resolveCombatAttack, stepCombat, type CombatInputs,
} from '../lib/pentagram-combat';
import { getCombatAnimationFrame } from '../lib/pentagram-animation';
import { decideCombatAi } from '../lib/pentagram-ai';
import { buildCombatantDefinition } from '../lib/pentagram-fighters';
import { getStandaloneFighter } from '../standalone/roster';

function definition(id: string) {
  const { character, profile } = getStandaloneFighter(id)!;
  return buildCombatantDefinition(character, profile);
}

const vaggie = definition('vaggie');
const blitzo = definition('hb_blitzo');
const husk = definition('husk');
const still = { left: false, right: false, guard: false };
const idle: CombatInputs = { one: still, two: still };

function ready(one = vaggie, two = blitzo) {
  return { ...createCombatState(one, two), positionOne: 42, positionTwo: 51, tensionOne: 100, tensionTwo: 100 };
}

describe('exhibition signature commands', () => {
  it('checks the actual fighter and resource before starting a command', () => {
    const state = ready(husk, blitzo);
    expect(canStartCombatAttack(state, 'one', 'signature', husk, blitzo)).toBe(false);
    expect(resolveCombatAttack(state, 'one', 'signature', husk, blitzo)).toBe(state);
    const short = { ...state, tensionTwo: 24 };
    const failed = resolveCombatAttack(short, 'two', 'signature', husk, blitzo);
    expect(failed.actionTwo).toBe('idle');
    expect(failed.positionTwo).toBe(short.positionTwo);
    expect(failed.log[0]?.text).toContain('Sortie de service');
    expect(getCombatMoveInfo(vaggie, 'signature')).toMatchObject({ name: 'Ligne de défense', startupMs: 160, recoveryMs: 280, tensionCost: 20 });
  });

  it('arms the recovery guard only after Vaggie lands a clean hit and releases it at recovery end', () => {
    const start = resolveCombatAttack(ready(), 'one', 'signature', vaggie, blitzo);
    expect(start.tensionOne).toBe(80);
    expect(stepCombat(start, idle, 159, vaggie, blitzo).guardOne).toBe(false);
    const contact = stepCombat(start, idle, 160, vaggie, blitzo);
    expect(contact.hpTwo).toBeLessThan(100);
    expect(contact.guardOne).toBe(true);
    expect(releaseCombatGuard(contact).guardOne).toBe(true);
    expect(stepCombat(contact, idle, 337, vaggie, blitzo).guardOne).toBe(true);
    expect(stepCombat(contact, idle, 338, vaggie, blitzo).guardOne).toBe(false);
    expect(stepCombat(start, { one: still, two: { ...still, guard: true } }, 220, vaggie, blitzo).guardOne).toBe(false);
    expect(stepCombat({ ...start, positionTwo: 84 }, idle, 220, vaggie, blitzo).guardOne).toBe(false);
    const counter = stepCombat(contact, idle, 213, vaggie, blitzo);
    const strike = resolveCombatAttack(counter, 'two', 'light', vaggie, blitzo);
    const attempted = stepCombat(strike, idle, 120, vaggie, blitzo);
    expect(attempted.actionOne).toBe('signature');
  });

  it('retreats then lunges from either side, respects walls and resolves one contact per launch', () => {
    const state = { ...ready(blitzo, blitzo), positionOne: 40, positionTwo: 53 };
    for (const side of ['one', 'two'] as const) {
      const start = resolveCombatAttack(state, side, 'signature', blitzo, blitzo);
      const before = stepCombat(start, idle, 110, blitzo, blitzo);
      const result = stepCombat(start, idle, 270, blitzo, blitzo);
      expect(side === 'one' ? before.positionOne : before.positionTwo).toBe(side === 'one' ? 37 : 56);
      expect(side === 'one' ? result.positionOne : result.positionTwo).toBeCloseTo(side === 'one' ? 45 : 48);
      expect(side === 'one' ? result.hpTwo : result.hpOne).toBeLessThan(100);
      const later = stepCombat(result, idle, 800, blitzo, blitzo);
      expect([later.hpOne, later.hpTwo]).toEqual([result.hpOne, result.hpTwo]);
      const split = stepCombat(before, idle, 160, blitzo, blitzo);
      expect(split.positionTwo).toBeCloseTo(result.positionTwo);
    }
    const corner = resolveCombatAttack({ ...state, positionOne: 7, positionTwo: 14 }, 'one', 'signature', blitzo, blitzo);
    expect(corner.positionOne).toBe(7);
    expect(stepCombat(corner, idle, 269, blitzo, blitzo).positionOne).toBe(7);
  });

  it('interrupts a service exit before contact and lets AI choose it at its effective reach', () => {
    const attacker = { ...husk, range: 300 };
    const start = resolveCombatAttack(ready(attacker, blitzo), 'two', 'signature', attacker, blitzo);
    const jab = resolveCombatAttack(start, 'one', 'light', attacker, blitzo);
    const result = stepCombat(jab, idle, 450, attacker, blitzo);
    expect(result.pendingAttackTwo).toBeNull();
    expect(result.hpOne).toBe(100);
    expect(result.hpTwo).toBeLessThan(100);
    for (const [positionOne, positionTwo, canLand] of [[40, 53, true], [40, 54, false], [78, 93, true]] as const) {
      const state = { ...ready(), positionOne, positionTwo };
      const ai = decideCombatAi(state, 'two', vaggie, blitzo, 'overlord', () => 0);
      expect(ai.attack === 'signature').toBe(canLand);
      const strike = resolveCombatAttack(state, 'two', 'signature', vaggie, blitzo);
      expect(stepCombat(strike, idle, 270, vaggie, blitzo).hpOne < 100).toBe(canLand);
    }
  });

  it('links Mimzy’s heel into a light only on a clean contact after hitstop', () => {
    const mimzy = definition('hz_mimzy');
    const start = resolveCombatAttack({ ...ready(mimzy, husk), positionTwo: 49 }, 'one', 'signature', mimzy, husk);
    const canLink = (s: typeof start) => canStartCombatAttack(s, 'one', 'light', mimzy, husk, true);
    expect(canLink(start)).toBe(false);
    const contact = stepCombat(start, idle, 190, mimzy, husk);
    expect(canLink(contact)).toBe(false);
    const clean = stepCombat(contact, idle, 58, mimzy, husk);
    expect(canLink(clean)).toBe(true);
    expect(resolveCombatAttack(clean, 'one', 'light', mimzy, husk, true).actionOne).toBe('light');
    expect(decideCombatAi(clean, 'one', mimzy, husk, 'overlord', () => 0).attack).toBe('light');
    expect(canLink(stepCombat(start, { one: still, two: { ...still, guard: true } }, 250, mimzy, husk))).toBe(false);
    expect(canLink(stepCombat({ ...start, positionTwo: 85 }, idle, 250, mimzy, husk))).toBe(false);
  });

  it('pushes farther on block with Sallie May, from either side, within the wall', () => {
    const sallie = definition('hb_sallie_may');
    const launch = (side: 'one' | 'two', positionOne: number, positionTwo: number) =>
      resolveCombatAttack({ ...ready(sallie, sallie), positionOne, positionTwo }, side, 'signature', sallie, sallie);
    const bothGuard = { one: { ...still, guard: true }, two: { ...still, guard: true } };
    const left = launch('one', 40, 47);
    const blocked = stepCombat(left, bothGuard, 240, sallie, sallie);
    const clean = stepCombat(left, idle, 240, sallie, sallie);
    expect(blocked.positionTwo).toBe(53);
    expect(clean.positionTwo).toBeCloseTo(48.8);
    expect(blocked.hpTwo).toBeGreaterThan(clean.hpTwo);
    expect(stepCombat(launch('two', 9, 16), bothGuard, 240, sallie, sallie).positionOne).toBe(7);
  });

  it('enters the authored impact cell at the real startup time for all signatures', () => {
    for (const fighter of [vaggie, blitzo, definition('hz_mimzy'), definition('hb_sallie_may')]) {
      const move = getCombatMoveInfo(fighter, 'signature');
      const options = { animationSetId: 'eight-bank-combat-v4', actionDurationMs: move.actionMs, impactAtMs: move.startupMs } as const;
      const before = getCombatAnimationFrame('signature', move.recoveryMs + 1, options);
      const contact = getCombatAnimationFrame('signature', move.recoveryMs, options);
      expect([before.bank, before.column]).not.toEqual([contact.bank, contact.column]);
    }
  });
});
