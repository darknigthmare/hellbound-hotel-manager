import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { INFERNAL_ATTACK_EFFECTS, getInfernalAttackEffectFrame } from '../lib/infernal-attack-effects';
import {
  createCombatState, getCombatMoveInfo, resolveCombatAttack, stepCombat,
  type CombatAttack, type CombatInputs, type CombatState, type PlayerSide,
} from '../lib/pentagram-combat';
import { buildCombatantDefinition } from '../lib/pentagram-fighters';
import { getStandaloneFighter } from '../standalone/roster';

const idle: CombatInputs = {
  one: { left: false, right: false, guard: false },
  two: { left: false, right: false, guard: false },
};

function attack(fighterId: string, side: PlayerSide = 'one', action: CombatAttack = 'heavy', close = false) {
  const hero = getStandaloneFighter(fighterId)!;
  const rival = getStandaloneFighter('charlie')!;
  const definition = buildCombatantDefinition(hero.character, hero.profile);
  const opponent = buildCombatantDefinition(rival.character, rival.profile);
  const one = side === 'one' ? definition : opponent;
  const two = side === 'two' ? definition : opponent;
  const base = {
    ...createCombatState(one, two), tensionOne: 100, tensionTwo: 100,
    ...(close ? { positionOne: 44, positionTwo: 51 } : {}),
  };
  const started = resolveCombatAttack(base, side, action, one, two);
  const move = getCombatMoveInfo(definition, action);
  const tick = (state: CombatState, elapsed: number) => stepCombat(state, idle, elapsed, one, two);
  const frame = (state: CombatState, reducedMotion = false) => getInfernalAttackEffectFrame({
    fighterId, definition, side, combat: state, running: true, reducedMotion,
  });
  return { started, move, definition, frame, tick };
}

describe('Infernal attack artwork synchronized with existing combat', () => {
  it.each(Object.entries(INFERNAL_ATTACK_EFFECTS))('assigns %s artwork only to supported moves of a real fighter', (id, effect) => {
    expect(getStandaloneFighter(id)).toBeDefined();
    expect(effect.canonStatus).toBe('simulation_au');
    expect(existsSync(join(process.cwd(), 'public', effect.image)), effect.image).toBe(true);
    for (const action of effect.attacks) {
      const scene = attack(id, 'one', action);
      expect(scene.frame(scene.tick(scene.started, scene.move.startupMs))?.id).toBe(effect.id);
    }
  });

  it('reaches the real style-scaled impact boundary and expires during recovery', () => {
    const scene = attack('hb_moxxie');
    const launch = scene.move.startupMs - INFERNAL_ATTACK_EFFECTS.hb_moxxie.leadMs;
    expect(scene.move.startupMs).toBe(229);
    expect(scene.frame(scene.tick(scene.started, launch - 1))).toBeNull();
    const approach = scene.frame(scene.tick(scene.started, launch));
    const released = scene.frame(scene.tick(scene.started, scene.move.startupMs));
    expect(approach?.phase).toBe('approach');
    expect(released?.phase).toBe('release');
    expect(released!.x).toBeGreaterThan(approach!.x);
    expect(released!.x + released!.width / 2).toBeCloseTo(22 + scene.move.reach, 8);
    expect(scene.frame(scene.tick(scene.started, scene.move.startupMs + 100))).toBeNull();
  });

  it('mirrors both players and keeps every image inside its actual reach and the viewport', () => {
    for (const [id, effect] of Object.entries(INFERNAL_ATTACK_EFFECTS)) {
      for (const action of effect.attacks) {
        const one = attack(id, 'one', action);
        const two = attack(id, 'two', action);
        const first = one.frame(one.tick(one.started, one.move.startupMs))!;
        const second = two.frame(two.tick(two.started, two.move.startupMs))!;
        expect(first.facing).toBe(1);
        expect(second.facing).toBe(-1);
        expect(first.x + second.x).toBeCloseTo(100, 8);
        expect(first.x + first.width / 2).toBeLessThanOrEqual(first.rangeEndX + 0.00001);
        expect(second.x - second.width / 2).toBeGreaterThanOrEqual(second.rangeEndX - 0.00001);
        const atRightWall = one.frame(one.tick({ ...one.started, positionOne: 86, positionTwo: 93 }, one.move.startupMs))!;
        expect(atRightWall.x + atRightWall.width / 2).toBeLessThanOrEqual(100);
        const atLeftWall = two.frame(two.tick({ ...two.started, positionOne: 7, positionTwo: 14 }, two.move.startupMs))!;
        expect(atLeftWall.x - atLeftWall.width / 2).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('freezes during the engine hit-stop and never mutates health or action state', () => {
    const scene = attack('hb_moxxie', 'one', 'heavy', true);
    const impact = scene.tick(scene.started, scene.move.startupMs);
    const original = structuredClone(impact);
    expect(impact.hpTwo).toBeLessThan(100);
    expect(impact.hitstopMs).toBe(58);
    const image = scene.frame(impact);
    for (let i = 0; i < 20; i += 1) scene.frame(impact);
    expect(impact).toEqual(original);
    expect(scene.frame(scene.tick(impact, 30))).toEqual(image);
    expect(scene.tick(impact, 600).hpTwo).toBe(impact.hpTwo);
  });

  it('disappears immediately when the attacking fighter is interrupted', () => {
    const scene = attack('hb_moxxie', 'one', 'heavy', true);
    const preparing = scene.tick(scene.started, 150);
    expect(scene.frame(preparing)).not.toBeNull();
    expect(scene.frame({ ...preparing, actionOne: 'hit', pendingAttackOne: null })).toBeNull();
    expect(scene.frame({ ...preparing, actionOne: 'guard', pendingAttackOne: null })).toBeNull();
    expect(scene.frame({ ...preparing, actionOne: 'signature', pendingAttackOne: 'signature' })).toBeNull();
  });

  it('hides outside live combat and on KO, time-over or a completed round', () => {
    const scene = attack('vox');
    const released = scene.tick(scene.started, scene.move.startupMs);
    for (const state of [
      { ...released, active: false },
      { ...released, winner: 'draw' as const },
      { ...released, matchWinner: 'one' as const },
      { ...released, hpOne: 0 },
      { ...released, hpTwo: 0 },
      { ...released, timerMs: 0 },
      { ...released, actionOne: 'ko' as const },
    ]) expect(scene.frame(state)).toBeNull();
    expect(getInfernalAttackEffectFrame({
      fighterId: 'vox', definition: scene.definition, side: 'one', combat: released, running: false,
    })).toBeNull();
  });

  it('uses simulation time consistently across large and small render frames', () => {
    const scene = attack('vox', 'one', 'special', true);
    const large = scene.tick(scene.started, 430);
    let small = scene.started;
    for (let i = 0; i < 43; i += 1) small = scene.tick(small, 10);
    expect(scene.frame(large)).toEqual(scene.frame(small));
    expect(scene.frame(scene.tick(scene.started, 1000))).toBeNull();
  });

  it('keeps reduced-motion artwork fixed and only shows it at release', () => {
    const scene = attack('cherribomb');
    expect(scene.frame(scene.tick(scene.started, scene.move.startupMs - 1), true)).toBeNull();
    const first = scene.frame(scene.tick(scene.started, scene.move.startupMs), true)!;
    const later = scene.frame(scene.tick(scene.started, scene.move.startupMs + 60), true)!;
    expect(first).toEqual(later);
    expect(first.elevation).toBe(INFERNAL_ATTACK_EFFECTS.cherribomb.elevation);
    expect(first.opacity).toBe(0.65);
  });

  it('does not invent artwork for unsupported fighters or misleading move motifs', () => {
    const charlie = attack('charlie');
    expect(charlie.frame(charlie.tick(charlie.started, charlie.move.startupMs))).toBeNull();
    // The ray belongs to Clockwork launcher, not the separate Egg Boiz barrage.
    const pentious = attack('sirpentious', 'one', 'special');
    expect(pentious.frame(pentious.tick(pentious.started, pentious.move.startupMs))).toBeNull();
    // Cards do not replace Wing rake; borrowed gunfire does not decorate
    // jabs, knife strikes or Blitzø's separate movement signature.
    for (const [fighterId, action] of [
      ['husk', 'heavy'], ['angeldust', 'light'], ['hb_blitzo', 'light'],
      ['hb_blitzo', 'signature'], ['hb_striker', 'light'], ['hb_striker', 'special'],
      ['adam', 'light'], ['adam', 'special'], ['hb_stolas', 'special'],
      ['hb_asmodeus', 'heavy'], ['hb_beelzebub', 'special'], ['lucifer', 'special'],
    ] as const) {
      const scene = attack(fighterId, 'one', action);
      expect(scene.frame(scene.tick(scene.started, scene.move.startupMs)), `${fighterId}/${action}`).toBeNull();
    }
  });

  it('reuses one existing bullet image for ordinary gunfire without a duplicate export', () => {
    const original = INFERNAL_ATTACK_EFFECTS.hb_moxxie;
    for (const fighterId of ['angeldust', 'hb_blitzo', 'hb_striker']) {
      const scene = attack(fighterId);
      const released = scene.frame(scene.tick(scene.started, scene.move.startupMs));
      expect(released).toMatchObject({ id: original.id, image: original.image });
    }
  });
});
