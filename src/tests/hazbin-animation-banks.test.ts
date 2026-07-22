import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { HAZBIN_DIRECTORY_PROFILES } from '../data/hazbin-directory';
import {
  CHARACTER_SPRITES,
  HAZBIN_SUPPLEMENTAL_ANIMATION_BANKS,
} from '../lib/character-sprites';
import {
  EIGHT_BANK_COMBAT_ANIMATION_SET,
  EIGHT_BANK_COMBAT_ANIMATION_SET_ID,
  type SupplementalSpriteAnimationBankId,
} from '../lib/sprite-animation-registry';

interface AnimationBankManifest {
  schemaVersion: number;
  status: string;
  atomic: boolean;
  animationContractId: string;
  imageGenAnchorBanks: Record<string, SupplementalSpriteAnimationBankId[]>;
  canvas: {
    width: number;
    height: number;
    columns: number;
    rows: number;
    cellWidth: number;
    cellHeight: number;
    minimumAlphaMargin: number;
  };
  banks: Array<{
    id: SupplementalSpriteAnimationBankId;
    columnRoles: string[];
  }>;
  baseAtlases: Array<{
    stem: string;
    baseSheet: string;
    rows: string[];
  }>;
}

const manifest = JSON.parse(readFileSync(
  new URL('../../art/sprite-sheets/hazbin-animation-banks-manifest.json', import.meta.url),
  'utf8',
)) as AnimationBankManifest;

describe('Hazbin supplementary animation banks', () => {
  it('maps 25 base atlases and seven banks to all 100 illustrated identities', () => {
    expect(manifest.schemaVersion).toBe(2);
    expect(manifest.status).toBe('art_ready');
    expect(manifest.atomic).toBe(true);
    expect(manifest.animationContractId).toBe(EIGHT_BANK_COMBAT_ANIMATION_SET_ID);
    expect(manifest.imageGenAnchorBanks).toEqual({
      'core-a': ['taunt', 'jump', 'crouch', 'recoil'],
      'hell-antagonists': ['taunt', 'crouch'],
      overlords: ['recoil'],
      'hazbin-companions': ['taunt'],
    });
    expect(manifest.canvas).toEqual({
      width: 1536,
      height: 1024,
      columns: 6,
      rows: 4,
      cellWidth: 256,
      cellHeight: 256,
      minimumAlphaMargin: 6,
    });
    expect(manifest.baseAtlases).toHaveLength(25);
    expect(manifest.banks.map(({ id }) => id))
      .toEqual(HAZBIN_SUPPLEMENTAL_ANIMATION_BANKS);

    const rows = manifest.baseAtlases.flatMap(({ rows }) => rows);
    const illustratedProfileIds = HAZBIN_DIRECTORY_PROFILES
      .filter(({ assetStatus }) => assetStatus === 'ready')
      .map(({ id }) => id);
    expect(rows).toHaveLength(100);
    expect(new Set(rows).size).toBe(100);
    expect([...rows].sort()).toEqual([...illustratedProfileIds].sort());
    expect(new Set(manifest.baseAtlases.map(({ stem }) => stem)).size).toBe(25);
    expect(Object.keys(CHARACTER_SPRITES)).toHaveLength(100);

    for (const atlas of manifest.baseAtlases) {
      expect(atlas.rows).toHaveLength(4);
      atlas.rows.forEach((characterId, row) => {
        const sprite = CHARACTER_SPRITES[characterId];
        expect(sprite, `missing animation sprite for ${characterId}`).toBeDefined();
        expect(sprite.sheet).toBe(atlas.baseSheet);
        expect(sprite.row).toBe(row);
        expect(sprite.animationSetId).toBe(EIGHT_BANK_COMBAT_ANIMATION_SET_ID);

        for (const bank of HAZBIN_SUPPLEMENTAL_ANIMATION_BANKS) {
          const publicPath = `/assets/sprites/hazbin/animation/v1/${bank}/${atlas.stem}-${bank}.png`;
          expect(sprite.animationSheets[bank]).toBe(publicPath);
          expect(existsSync(resolve(
            process.cwd(),
            'public',
            publicPath.replace(/^\//, ''),
          ))).toBe(true);
        }
      });
    }
  });

  it('keeps all seven manifest roles identical to the runtime v4 animation set', () => {
    for (const bank of manifest.banks) {
      expect(bank.columnRoles)
        .toEqual(EIGHT_BANK_COMBAT_ANIMATION_SET.bankColumnRoles?.[bank.id]);
    }
    expect(Object.keys(EIGHT_BANK_COMBAT_ANIMATION_SET.clips).sort()).toEqual([
      'crouch',
      'guard',
      'heavy',
      'hit',
      'idle',
      'jump',
      'ko',
      'light',
      'special',
      'taunt',
      'victory',
      'walk',
    ]);
  });

  it('does not invent art for Tiffany while her design remains unavailable', () => {
    const tiffany = HAZBIN_DIRECTORY_PROFILES.find(
      ({ id }) => id === 'hz_tiffany_titfucker',
    );
    expect(tiffany?.assetStatus).toBe('reference_unavailable');
    expect(CHARACTER_SPRITES.hz_tiffany_titfucker).toBeUndefined();
    expect(manifest.baseAtlases.some(
      ({ rows }) => rows.includes('hz_tiffany_titfucker'),
    )).toBe(false);
  });
});
