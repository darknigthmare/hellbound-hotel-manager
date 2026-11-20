import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getPentagramStage, STANDALONE_STAGES } from '../lib/pentagram-stages';
import { canOfferFinish, INFERNAL_FINISHES } from '../lib/infernal-finishers';
import { createCombatState } from '../lib/pentagram-combat';
import { buildCombatantDefinition } from '../lib/pentagram-fighters';
import { STORY_ROUTES, storyIllustration } from '../standalone/campaign';
import { STANDALONE_FIGHTER_IDS, STANDALONE_ROSTER } from '../standalone/roster';

describe('Infernal Versus production assets', () => {
  it('resolves every published story illustration and all three I.M.P. planes', () => {
    const paths = new Set<string>();
    for (const id of Object.keys(STORY_ROUTES)) {
      for (const kind of ['intro','rival','ending'] as const) {
        const art = storyIllustration(id, kind);
        if (art) paths.add(art);
      }
    }
    expect(paths.size).toBeGreaterThanOrEqual(5);
    const room = getPentagramStage('imp-reception');
    expect(STANDALONE_STAGES).toContain(room);
    const { middle, near } = room.scenery!;
    for (const path of [...paths, room.imagePath, room.thumbnailPath, middle!, near!]) {
      expect(existsSync(join(process.cwd(), 'public', path)), path).toBe(true);
    }
  });
  it('has an individual finish for every eligible fighter, only after a deciding KO', () => {
    expect(Object.keys(INFERNAL_FINISHES).sort()).toEqual([...STANDALONE_FIGHTER_IDS].sort());
    for (const finish of Object.values(INFERNAL_FINISHES)) {
      if (finish.impactSprite) expect(existsSync(join(process.cwd(), 'public', finish.impactSprite))).toBe(true);
    }
    const fighter = STANDALONE_ROSTER[0];
    const def = buildCombatantDefinition(fighter.character, fighter.profile);
    const state = { ...createCombatState(def, def), active: false, winner: 'one' as const, hpTwo: 0 };
    expect(canOfferFinish(state)).toBe(false);
    expect(canOfferFinish({ ...state, matchWinner: 'one' })).toBe(true);
    expect(canOfferFinish({ ...state, matchWinner: 'one', hpTwo: 5, timerMs: 0 })).toBe(false);
    expect(canOfferFinish({ ...state, matchWinner: 'one', hpOne: 0, winner: 'draw' })).toBe(false);
  });
});
