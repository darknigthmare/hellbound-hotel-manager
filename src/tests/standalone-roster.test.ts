import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { HAZBIN_DIRECTORY_PROFILES } from '../data/hazbin-directory';
import { HELLUVA_CHARACTERS } from '../expansions/helluva-boss/data';
import { getCharacterSpriteAsset, getCombatSpriteAsset, HAZBIN_SUPPLEMENTAL_ANIMATION_BANKS } from '../lib/character-sprites';
import { STANDALONE_BOSS_IDS, STANDALONE_FIGHTER_IDS, STANDALONE_ROSTER, HELLUVA_COMBAT_PROFILES } from '../standalone/roster';

const hazbinIds = ['charlie', 'vaggie', 'angeldust', 'alastor', 'husk', 'niffty', 'sirpentious', 'lucifer', 'cherribomb', 'vox', 'valentino', 'velvette', 'adam', 'emily', 'sera', 'lute', 'carmilla', 'rosie', 'zestial', 'zeezi', 'baxter', 'abel'];
const helluvaIds = ['hb_blitzo', 'hb_moxxie', 'hb_millie', 'hb_loona', 'hb_stolas', 'hb_striker', 'hb_verosika', 'hb_fizzarolli', 'hb_asmodeus', 'hb_beelzebub', 'hb_crimson', 'hb_andrealphus'];

describe('standalone exhibition roster', () => {
  it('offers exactly 22 existing Hazbin and 12 explicitly authored Helluva kits', () => {
    expect(STANDALONE_ROSTER.filter(fighter => fighter.franchise === 'Hazbin Hotel').map(fighter => fighter.character.id).sort()).toEqual([...hazbinIds].sort());
    expect(STANDALONE_ROSTER.filter(fighter => fighter.franchise === 'Helluva Boss').map(fighter => fighter.character.id).sort()).toEqual([...helluvaIds].sort());
    expect(new Set(STANDALONE_FIGHTER_IDS).size).toBe(34);
    expect(Object.keys(HELLUVA_COMBAT_PROFILES).sort()).toEqual([...helluvaIds].sort());
    for (const fighter of STANDALONE_ROSTER) {
      const source = fighter.franchise === 'Hazbin Hotel'
        ? HAZBIN_DIRECTORY_PROFILES.find(profile => profile.id === fighter.character.id)
        : HELLUVA_CHARACTERS.find(profile => profile.id === fighter.character.id);
      expect(fighter.character.name).toBe(source?.name);
      expect(fighter.profile.id).toBe(fighter.character.id);
      expect(fighter.source.length).toBeGreaterThan(0);
      expect(fighter.character.operationalDataStatus).toBe('simulation_au');
      expect(fighter.character.rehabTracked).toBe(false);
      for (const value of [fighter.profile.power, fighter.profile.range, fighter.profile.speed, fighter.profile.guard, fighter.profile.tensionGain]) expect(Number.isFinite(value)).toBe(true);
      for (const value of [fighter.profile.basicMove, fighter.profile.heavyMove, fighter.profile.specialMove]) expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it('resolves all portraits and eight authored combat banks to actual PNGs', () => {
    const checked = new Set<string>();
    for (const fighter of STANDALONE_ROSTER) {
      const sprite = getCombatSpriteAsset(fighter.character.id)!;
      expect(sprite.animationSetId).toBe('eight-bank-combat-v4');
      expect(sprite.row).toBeGreaterThanOrEqual(0);
      expect(sprite.row).toBeLessThan(4);
      const paths = [sprite.sheet, ...HAZBIN_SUPPLEMENTAL_ANIMATION_BANKS.map(bank => sprite.animationSheets[bank])];
      expect(new Set(paths).size).toBe(8);
      for (const path of [sprite.portrait, ...paths]) {
        if (checked.has(path)) continue;
        checked.add(path);
        const local = resolve(process.cwd(), 'public', path.replace(/^\//, ''));
        expect(existsSync(local), local).toBe(true);
        const data = readFileSync(local);
        expect(data.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
        if (paths.includes(path)) expect([data.readUInt32BE(16), data.readUInt32BE(20)]).toEqual([1536, 1024]);
      }
    }
  });

  it('uses honest, stable Helluva cinematic fallbacks without altering the hotel registry', () => {
    for (const id of helluvaIds) {
      const sprite = getCombatSpriteAsset(id)!;
      expect(getCombatSpriteAsset(id)).toBe(sprite);
      expect(sprite.cinematicFallback).toBe(true);
      expect(sprite.cinematicSheets).toEqual({ intro: sprite.sheet, victory: sprite.sheet, draw: sprite.sheet });
      expect(getCharacterSpriteAsset(id)).toBeUndefined();
    }
    expect(getCombatSpriteAsset('charlie')).toBe(getCharacterSpriteAsset('charlie'));
    expect(getCombatSpriteAsset('not-a-fighter')).toBeUndefined();
  });

  it('keeps support identities, children and simulation originals outside the standalone roster', () => {
    for (const id of ['hb_octavia', 'hz_keekee', 'hz_fat_nuggets', 'hz_frank_egg_boi', 'sim_applicant_marlow', 'sim_applicant_ember']) expect(STANDALONE_FIGHTER_IDS).not.toContain(id);
    for (const id of STANDALONE_BOSS_IDS) expect(STANDALONE_FIGHTER_IDS).toContain(id);
  });

  it('has no runtime import path into hotel persistence or cloud account code', () => {
    const visited = new Set<string>();
    function inspect(path: string) {
      if (visited.has(path)) return;
      visited.add(path);
      expect(path).not.toMatch(/(?:\/db\/|cloudAccount|\/standalone\/progression)/);
      const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
      for (const statement of source.statements) {
        if (!ts.isImportDeclaration(statement) || statement.importClause?.isTypeOnly || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
        const imported = statement.moduleSpecifier.text;
        if (!imported.startsWith('.')) continue;
        const stem = resolve(dirname(path), imported);
        const target = [stem + '.ts', stem + '.tsx', resolve(stem, 'index.ts')].find(existsSync);
        if (target) inspect(target);
      }
    }
    inspect(resolve(process.cwd(), 'src/standalone/roster.ts'));
    expect(visited.size).toBeGreaterThan(5);
  });
});
