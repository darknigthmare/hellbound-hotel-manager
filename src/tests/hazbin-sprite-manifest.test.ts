import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  HAZBIN_DIRECTORY_PROFILES,
  HAZBIN_SPRITE_SHEETS,
} from '../data/hazbin-directory';

interface HazbinExpansionManifest {
  atlases: Array<{
    id: string;
    filename: string;
    rows: Array<{ id: string; name: string }>;
  }>;
}

const manifest = JSON.parse(readFileSync(
  new URL('../../art/sprite-sheets/hazbin-expansion-manifest.json', import.meta.url),
  'utf8',
)) as HazbinExpansionManifest;

describe('Hazbin expansion manifest parity', () => {
  it('maps the same 13 atlases and 52 art-capable profiles as the TypeScript directory', () => {
    expect(manifest.atlases).toHaveLength(13);
    const manifestRows = manifest.atlases.flatMap(({ rows }) => rows);
    expect(manifestRows).toHaveLength(52);
    expect(new Set(manifestRows.map(({ id }) => id)).size).toBe(52);

    for (const atlas of manifest.atlases) {
      const directorySheet = HAZBIN_SPRITE_SHEETS.find(({ id }) => id === atlas.id);
      expect(directorySheet?.path).toBe(`/assets/sprites/hazbin/sheets/${atlas.filename}`);
      expect(directorySheet?.characters).toEqual(atlas.rows.map(({ name }) => name));

      const directoryRows = HAZBIN_DIRECTORY_PROFILES
        .filter(({ spriteSheetId }) => spriteSheetId === atlas.id)
        .sort((left, right) => left.sheetRow - right.sheetRow);
      expect(directoryRows.map(({ id, name }) => ({ id, name }))).toEqual(atlas.rows);
      expect(directoryRows.every(({ assetStatus }) => assetStatus !== 'reference_unavailable')).toBe(true);
    }
  });

  it('keeps Tiffany out of the art manifest because she has no published design', () => {
    expect(manifest.atlases.flatMap(({ rows }) => rows)
      .some(({ id }) => id === 'hz_tiffany_titfucker')).toBe(false);
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_tiffany_titfucker')?.assetStatus)
      .toBe('reference_unavailable');
  });
});
