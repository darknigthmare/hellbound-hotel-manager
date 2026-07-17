import { describe, expect, it } from 'vitest';
import { getSeedData } from '../db/seed';
import { CHARACTER_SPRITES } from '../lib/character-sprites';
import {
  buildCombatantDefinition,
  FIGHTER_PROFILES,
  getFighterProfile,
} from '../lib/pentagram-fighters';

describe('Pentagram Arena fighter kits', () => {
  it('defines an explicit kit for every sprite-backed Hazbin combatant', () => {
    const charactersById = new Map(getSeedData().characters.map(character => [character.id, character]));
    const spriteIds = Object.keys(CHARACTER_SPRITES)
      .filter(fighterId => charactersById.has(fighterId))
      .sort();
    const profileIds = Object.keys(FIGHTER_PROFILES).sort();

    expect(profileIds).toEqual(spriteIds);
    expect(profileIds).toHaveLength(24);
    for (const fighterId of spriteIds) {
      const fighter = charactersById.get(fighterId);
      expect(fighter, `Missing seed character ${fighterId}`).toBeTruthy();
      expect(getFighterProfile(fighter)).toBeTruthy();
    }
  });

  it('keeps combat balance independent from narrative risk changes', () => {
    const adam = getSeedData().characters.find(character => character.id === 'adam');
    const profile = getFighterProfile(adam);

    expect(adam).toBeTruthy();
    expect(profile?.power).toBe(18);
    if (!adam || !profile) throw new Error('Adam fixture is unavailable');

    const postFinaleProjection = { ...adam, riskLevel: 'low' as const };
    expect(buildCombatantDefinition(postFinaleProjection, profile).power).toBe(18);
  });

  it('labels limited-evidence fighters instead of silently using a generic fallback', () => {
    expect(FIGHTER_PROFILES.emily.evidence).toBe('simulation');
    expect(FIGHTER_PROFILES.zestial.evidence).toBe('simulation');
    expect(FIGHTER_PROFILES.abel.evidence).toBe('simulation');
    expect(FIGHTER_PROFILES.lucifer.basicMove).not.toBe(FIGHTER_PROFILES.vox.basicMove);
    expect(FIGHTER_PROFILES.cherribomb.specialMove).not.toBe(FIGHTER_PROFILES.zeezi.specialMove);
  });
});
