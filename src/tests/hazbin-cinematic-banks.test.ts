import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CHARACTER_SPRITES } from '../lib/character-sprites';
import {
  PENTAGRAM_CINEMATIC_BANKS,
  PENTAGRAM_CINEMATIC_CLIPS,
  PENTAGRAM_CINEMATIC_CONTRACT_ID,
} from '../lib/pentagram-cinematics';

interface IdentityManifest {
  baseAtlases: Array<{
    stem: string;
    rows: string[];
  }>;
}

interface CinematicManifest {
  schemaVersion: number;
  status: string;
  atomic: boolean;
  animationContractId: string;
  identityManifest: string;
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
    id: 'intro' | 'victory' | 'draw';
    columnRoles: string[];
  }>;
}

const cinematicManifest = JSON.parse(readFileSync(
  new URL('../../art/sprite-sheets/hazbin-cinematic-banks-manifest.json', import.meta.url),
  'utf8',
)) as CinematicManifest;

const identityManifest = JSON.parse(readFileSync(
  new URL('../../art/sprite-sheets/hazbin-animation-banks-manifest.json', import.meta.url),
  'utf8',
)) as IdentityManifest;

describe('Hazbin match-cinematic banks', () => {
  it('publishes three dedicated six-frame banks for all 100 illustrated identities', () => {
    expect(cinematicManifest).toMatchObject({
      schemaVersion: 1,
      status: 'art_ready',
      atomic: true,
      animationContractId: PENTAGRAM_CINEMATIC_CONTRACT_ID,
      identityManifest: 'hazbin-animation-banks-manifest.json',
      canvas: {
        width: 1536,
        height: 1024,
        columns: 6,
        rows: 4,
        cellWidth: 256,
        cellHeight: 256,
        minimumAlphaMargin: 6,
      },
    });
    expect(cinematicManifest.banks.map(({ id }) => id))
      .toEqual(PENTAGRAM_CINEMATIC_BANKS);
    expect(identityManifest.baseAtlases).toHaveLength(25);

    const characterIds = identityManifest.baseAtlases.flatMap(({ rows }) => rows);
    expect(characterIds).toHaveLength(100);
    expect(new Set(characterIds).size).toBe(100);

    for (const atlas of identityManifest.baseAtlases) {
      expect(atlas.rows).toHaveLength(4);
      for (const bank of PENTAGRAM_CINEMATIC_BANKS) {
        const publicPath = `/assets/sprites/hazbin/cinematics/v1/${bank}/${atlas.stem}-${bank}.png`;
        expect(existsSync(resolve(
          process.cwd(),
          'public',
          publicPath.replace(/^\//, ''),
        ))).toBe(true);

        atlas.rows.forEach((characterId) => {
          expect(CHARACTER_SPRITES[characterId].cinematicSheets[bank])
            .toBe(publicPath);
        });
      }
    }
  });

  it('keeps every cinematic role aligned with one unique authored column', () => {
    for (const bank of cinematicManifest.banks) {
      expect(bank.columnRoles).toHaveLength(6);
      expect(new Set(bank.columnRoles).size).toBe(6);
      expect(PENTAGRAM_CINEMATIC_CLIPS[bank.id].frames.map(({ column }) => column))
        .toEqual([0, 1, 2, 3, 4, 5]);
    }
  });
});
