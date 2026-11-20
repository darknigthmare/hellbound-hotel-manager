import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { costumePose, getInfernalCostume, infernalActionPose, INFERNAL_ACTION_POSES, INFERNAL_COSTUMES } from '../lib/infernal-appearances';
import { INFERNAL_FINISHES } from '../lib/infernal-finishers';
import { getCombatMoveInfo } from '../lib/pentagram-combat';
import { buildCombatantDefinition } from '../lib/pentagram-fighters';
import { getStandaloneFighter } from '../standalone/roster';

describe('authored poses in Infernal Versus', () => {
  it('keeps authored contacts at the engine startup boundary and preserves missing-action fallbacks', () => {
    for (const id of Object.keys(INFERNAL_ACTION_POSES)) {
      const fighter = getStandaloneFighter(id)!;
      const move = getCombatMoveInfo(buildCombatantDefinition(fighter.character, fighter.profile), 'light');
      const poses = INFERNAL_ACTION_POSES[id];
      expect(infernalActionPose(id, 'idle', null)).toBe(poses.ready);
      expect(infernalActionPose(id, 'guard', null)).toBe(poses.guard ?? poses.ready);
      expect(infernalActionPose(id, 'light', null, move.startupMs - 1, move.startupMs)).toBe(poses.strike ? poses.ready : undefined);
      expect(infernalActionPose(id, 'light', null, move.startupMs, move.startupMs)).toBe(poses.strike);
      expect(infernalActionPose(id, 'light', null, move.startupMs + 110, move.startupMs)).toBe(poses.strike ? poses.ready : undefined);
      expect(infernalActionPose(id, 'hit', null)).toBe(poses.recoil);
      expect(infernalActionPose(id, 'idle', 'intro')).toBeUndefined();
      for (const action of ['walk', 'heavy', 'special', 'jump', 'crouch', 'ko', 'victory'] as const) {
        expect(infernalActionPose(id, action, null)).toBeUndefined();
      }
    }
  });

  it('uses distinct crouch and jump costumes while respecting cinematics and finish priority', () => {
    for (const id of Object.keys(INFERNAL_COSTUMES)) {
      const outfit = INFERNAL_COSTUMES[id][0];
      expect(getInfernalCostume(id, outfit.id)).toBe(outfit);
      expect(costumePose(outfit, 'crouch', null, false)).toBe(outfit.crouch);
      expect(costumePose(outfit, 'jump', null, false)).toBe(outfit.jump);
      expect(costumePose(outfit, 'jump', 'intro', false)).toBe(outfit.ready);
      expect(costumePose(outfit, 'jump', null, true)).toBe(outfit.heavy);
      expect(getInfernalCostume(id, 'unknown')).toBeUndefined();
    }
  });

  it('ships every newly registered pose and separated finish prop', () => {
    const paths = [
      ...Object.values(INFERNAL_ACTION_POSES).flatMap(poses => [poses.ready, poses.guard, poses.strike, poses.recoil].filter((path): path is string => Boolean(path))),
      ...Object.values(INFERNAL_COSTUMES).flatMap(outfits => outfits.flatMap(outfit => [outfit.ready, outfit.strike, outfit.heavy, outfit.recoil, outfit.crouch, outfit.jump])),
      ...Object.values(INFERNAL_FINISHES).flatMap(finish => finish.detachedProp ? [finish.detachedProp] : []),
    ];
    for (const path of paths) expect(existsSync(join(process.cwd(), 'public', path)), path).toBe(true);
  });
});
