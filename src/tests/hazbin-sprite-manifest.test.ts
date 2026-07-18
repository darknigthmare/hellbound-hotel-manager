import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  HAZBIN_DIRECTORY_PROFILES,
  HAZBIN_SPRITE_SHEETS,
} from '../data/hazbin-directory';
import {
  DEFAULT_SPRITE_ANIMATION_SET_ID,
  SIX_POSE_COMBAT_ANIMATION_SET,
} from '../lib/sprite-animation-registry';

interface HazbinExpansionManifest {
  schemaVersion: number;
  animationContract: {
    id: string;
    facing: string;
    columnRoles: string[];
    clips: Record<string, {
      loop: boolean;
      frames: Array<{ column: number; durationMs: number }>;
    }>;
  };
  atlases: Array<{
    id: string;
    filename: string;
    rows: Array<{ id: string; name: string }>;
  }>;
}

interface HazbinReferenceIndex {
  references: Array<{
    id: string;
    name: string;
    sourcePage: string;
    imageUrl: string;
    file: string;
  }>;
}

const manifest = JSON.parse(readFileSync(
  new URL('../../art/sprite-sheets/hazbin-expansion-manifest.json', import.meta.url),
  'utf8',
)) as HazbinExpansionManifest;

const referenceIndex = JSON.parse(readFileSync(
  new URL('../../art/sprite-sheets/references/hazbin/references.json', import.meta.url),
  'utf8',
)) as HazbinReferenceIndex;

describe('Hazbin expansion manifest parity', () => {
  it('publishes the same versioned six-pose animation contract as the runtime registry', () => {
    expect(manifest.schemaVersion).toBe(2);
    expect(manifest.animationContract).toEqual(SIX_POSE_COMBAT_ANIMATION_SET);
    expect(manifest.animationContract.id).toBe(DEFAULT_SPRITE_ANIMATION_SET_ID);
    expect(manifest.animationContract.id).toBe('six-pose-combat-v2');
  });

  it('maps the same 19 atlases and 76 art-capable profiles as the TypeScript directory', () => {
    expect(manifest.atlases).toHaveLength(19);
    const manifestRows = manifest.atlases.flatMap(({ rows }) => rows);
    expect(manifestRows).toHaveLength(76);
    expect(new Set(manifestRows.map(({ id }) => id)).size).toBe(76);

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

    expect(manifest.atlases.find(({ id }) => id === 'hotel-patrons')?.rows).toEqual([
      { id: 'hz_la_catrina_sinner', name: 'La Catrina sinner' },
      { id: 'hz_eel_sinner', name: 'Eel sinner' },
      { id: 'hz_egyptian_sinner', name: 'Egyptian sinner' },
      { id: 'hz_ant_sinner', name: 'Ant sinner' },
    ]);
    expect(manifest.atlases.find(({ id }) => id === 'vees-casino')?.rows).toEqual([
      { id: 'hz_kitty', name: 'Kitty' },
      { id: 'hz_huskette_cat', name: 'Huskette cat-like waitress' },
      { id: 'hz_huskette_spider', name: 'Huskette spider-like waitress' },
      { id: 'hz_huskette_imp', name: 'Huskette imp-like waitress' },
    ]);
    expect(manifest.atlases.find(({ id }) => id === 'season2-voiced-locals')?.rows).toEqual([
      { id: 'hz_reporter_demon', name: 'Reporter demon' },
      { id: 'hz_goldfish_sinner', name: 'Goldfish sinner' },
      { id: 'hz_fangirl_goat', name: 'Goat-like fangirl sinner' },
      { id: 'hz_fangirl_apple_tree', name: 'Apple-tree fangirl sinner' },
    ]);
    expect(manifest.atlases.find(({ id }) => id === 'recurring-patrons-ii')?.rows).toEqual([
      { id: 'hz_conjoined_twins', name: 'Conjoined Twin sinners' },
      { id: 'hz_western_sinner', name: 'Western sinner' },
      { id: 'hz_goth_bird_sinner', name: 'Goth bird-like sinner' },
      { id: 'hz_rose_sinner', name: 'Rose-like sinner' },
    ]);
    expect(manifest.atlases.find(({ id }) => id === 'tertiary-locals-a')?.rows).toEqual([
      { id: 'hz_gator_sinner', name: 'Gator sinner' },
      { id: 'hz_velvette_assistant', name: "Velvette's assistant" },
      { id: 'hz_shark_gang_leader', name: 'Shark Gang Leader' },
      { id: 'hz_cactus_sinner', name: 'Cactus sinner' },
    ]);
    expect(manifest.atlases.find(({ id }) => id === 'tertiary-locals-b')?.rows).toEqual([
      { id: 'hz_jack_in_box_sinner', name: 'Jack-in-the-box sinner' },
      { id: 'hz_orphan_imp', name: 'Orphan Imp' },
      { id: 'hz_top_hat_demon', name: 'Top Hat Demon' },
      { id: 'hz_roadkill_sinner', name: 'Roadkill sinner' },
    ]);
  });

  it('keeps Tiffany out of the art manifest because she has no published design', () => {
    expect(manifest.atlases.flatMap(({ rows }) => rows)
      .some(({ id }) => id === 'hz_tiffany_titfucker')).toBe(false);
    expect(HAZBIN_DIRECTORY_PROFILES.find(({ id }) => id === 'hz_tiffany_titfucker')?.assetStatus)
      .toBe('reference_unavailable');
  });

  it('keeps one sourced visual reference per art-capable expansion profile', () => {
    const manifestRows = manifest.atlases.flatMap(({ rows }) => rows);
    expect(referenceIndex.references).toHaveLength(76);
    expect(new Set(referenceIndex.references.map(({ id }) => id)).size).toBe(76);
    expect(referenceIndex.references.map(({ id }) => id).sort())
      .toEqual(manifestRows.map(({ id }) => id).sort());

    for (const reference of referenceIndex.references) {
      const manifestRow = manifestRows.find(({ id }) => id === reference.id);
      expect(reference.name).toBe(manifestRow?.name);
      expect(reference.sourcePage).toMatch(/^https:\/\/hazbinhotel\.fandom\.com\/wiki\//);
      expect(reference.imageUrl).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/hazbinhotel\/images\//);
      expect(reference.file).toMatch(new RegExp(`^${reference.id}\\.(jpe?g|png|webp)$`));
    }

    for (const id of [
      'hz_kitty',
      'hz_huskette_cat',
      'hz_huskette_spider',
      'hz_huskette_imp',
      'hz_reporter_demon',
      'hz_goldfish_sinner',
      'hz_fangirl_goat',
      'hz_fangirl_apple_tree',
      'hz_conjoined_twins',
      'hz_western_sinner',
      'hz_goth_bird_sinner',
      'hz_rose_sinner',
    ]) {
      expect(referenceIndex.references.find((reference) => reference.id === id)?.file)
        .toBe(`${id}.png`);
    }

    const tertiaryReferenceFiles = {
      hz_gator_sinner: 'hz_gator_sinner.jpeg',
      hz_velvette_assistant: 'hz_velvette_assistant.jpeg',
      hz_shark_gang_leader: 'hz_shark_gang_leader.jpeg',
      hz_cactus_sinner: 'hz_cactus_sinner.png',
      hz_jack_in_box_sinner: 'hz_jack_in_box_sinner.png',
      hz_orphan_imp: 'hz_orphan_imp.png',
      hz_top_hat_demon: 'hz_top_hat_demon.jpg',
      hz_roadkill_sinner: 'hz_roadkill_sinner.png',
    } as const;
    for (const [id, filename] of Object.entries(tertiaryReferenceFiles)) {
      expect(referenceIndex.references.find((reference) => reference.id === id)?.file)
        .toBe(filename);
    }
  });
});
