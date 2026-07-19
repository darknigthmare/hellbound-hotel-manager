import {
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  readSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  HELLUVA_CHARACTERS,
  HELLUVA_SPRITE_SHEETS,
} from '../expansions/helluva-boss/data';
import {
  HAZBIN_SUPPLEMENTAL_ANIMATION_BANKS,
  HELLUVA_CHARACTER_SPRITES,
} from '../lib/character-sprites';
import {
  EIGHT_BANK_COMBAT_ANIMATION_SET,
  EIGHT_BANK_COMBAT_ANIMATION_SET_ID,
  type SupplementalSpriteAnimationBankId,
} from '../lib/sprite-animation-registry';

interface HelluvaAnimationBankManifest {
  schemaVersion: number;
  status: string;
  atomic: boolean;
  animationContractId: string;
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
  new URL('../../art/sprite-sheets/helluva-animation-banks-manifest.json', import.meta.url),
  'utf8',
)) as HelluvaAnimationBankManifest;

function readPngMetadata(publicPath: string) {
  const absolutePath = resolve(process.cwd(), 'public', publicPath.replace(/^\//, ''));
  expect(existsSync(absolutePath), `missing published Helluva animation: ${absolutePath}`)
    .toBe(true);
  const descriptor = openSync(absolutePath, 'r');
  const header = Buffer.alloc(26);
  try {
    expect(readSync(descriptor, header, 0, header.length, 0)).toBe(header.length);
  } finally {
    closeSync(descriptor);
  }
  expect(header.subarray(0, 8).toString('hex'), absolutePath).toBe('89504e470d0a1a0a');
  return {
    width: header.readUInt32BE(16),
    height: header.readUInt32BE(20),
    colorType: header[25],
  };
}

describe('Helluva Boss supplementary animation banks', () => {
  it('maps 27 DLC atlases and seven banks to all 108 identities', () => {
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.status).toBe('art_ready');
    expect(manifest.atomic).toBe(true);
    expect(manifest.animationContractId).toBe(EIGHT_BANK_COMBAT_ANIMATION_SET_ID);
    expect(manifest.canvas).toEqual({
      width: 1536,
      height: 1024,
      columns: 6,
      rows: 4,
      cellWidth: 256,
      cellHeight: 256,
      minimumAlphaMargin: 6,
    });
    expect(manifest.baseAtlases).toHaveLength(27);
    expect(manifest.banks.map(({ id }) => id))
      .toEqual(HAZBIN_SUPPLEMENTAL_ANIMATION_BANKS);

    const profileIds = HELLUVA_CHARACTERS.map(({ id }) => id);
    const rowIds = manifest.baseAtlases.flatMap(({ rows }) => rows);
    expect(rowIds).toHaveLength(108);
    expect(new Set(rowIds).size).toBe(108);
    expect([...rowIds].sort()).toEqual([...profileIds].sort());
    expect(Object.keys(HELLUVA_CHARACTER_SPRITES)).toHaveLength(108);
    expect(manifest.baseAtlases.map(({ baseSheet }) => baseSheet).sort())
      .toEqual(HELLUVA_SPRITE_SHEETS.map(({ path }) => path).sort());

    const publishedPaths = new Set<string>();
    for (const atlas of manifest.baseAtlases) {
      expect(atlas.rows).toHaveLength(4);
      atlas.rows.forEach((characterId, row) => {
        const sprite = HELLUVA_CHARACTER_SPRITES[characterId];
        expect(sprite, `missing Helluva animation sprite for ${characterId}`).toBeDefined();
        expect(sprite.sheet).toBe(atlas.baseSheet);
        expect(sprite.row).toBe(row);
        expect(sprite.animationSetId).toBe(EIGHT_BANK_COMBAT_ANIMATION_SET_ID);

        for (const bank of HAZBIN_SUPPLEMENTAL_ANIMATION_BANKS) {
          const publicPath = `/assets/sprites/helluva/animation/v1/${bank}/${atlas.stem}-${bank}.png`;
          expect(sprite.animationSheets[bank]).toBe(publicPath);
          publishedPaths.add(publicPath);
        }
      });
    }

    expect(publishedPaths).toHaveLength(189);
    for (const publicPath of publishedPaths) {
      expect(readPngMetadata(publicPath)).toEqual({
        width: 1536,
        height: 1024,
        colorType: 6,
      });
    }
  });

  it('keeps every DLC bank role identical to the shared runtime contract', () => {
    for (const bank of manifest.banks) {
      expect(bank.columnRoles)
        .toEqual(EIGHT_BANK_COMBAT_ANIMATION_SET.bankColumnRoles?.[bank.id]);
    }
  });
});
