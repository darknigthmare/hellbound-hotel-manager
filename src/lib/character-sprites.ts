import { HAZBIN_DIRECTORY_PROFILES } from '../data/hazbin-directory';
import {
  HELLUVA_CHARACTERS,
  HELLUVA_SPRITE_SHEETS,
} from '../expansions/helluva-boss/data';
import {
  EIGHT_BANK_COMBAT_ANIMATION_SET_ID,
  type SpriteAnimationBankId,
  type SpriteAnimationSetId,
  type SupplementalSpriteAnimationBankId,
} from './sprite-animation-registry';
import {
  PENTAGRAM_CINEMATIC_BANKS,
  type PentagramCinematicKind,
} from './pentagram-cinematics';

export interface SpriteSheetDefinition {
  id: string;
  title: string;
  path: string;
  characters: readonly string[];
  continuity: string;
}

export interface CharacterSpriteAsset {
  portrait: string;
  sheet: string;
  row: number;
  animationSheets: Readonly<Record<SupplementalSpriteAnimationBankId, string>>;
  cinematicSheets: Readonly<Record<PentagramCinematicKind, string>>;
  animationSetId: SpriteAnimationSetId;
}

export interface HelluvaCharacterSpriteAsset {
  portrait: string;
  sheet: string;
  row: number;
  animationSheets: Readonly<Record<SupplementalSpriteAnimationBankId, string>>;
  animationSetId: SpriteAnimationSetId;
}

export const HAZBIN_SUPPLEMENTAL_ANIMATION_BANKS = [
  'movement',
  'offense',
  'reaction',
  'taunt',
  'jump',
  'crouch',
  'recoil',
] as const satisfies readonly SupplementalSpriteAnimationBankId[];

function getSheetStem(sheetPath: string): string {
  const filename = sheetPath.split('/').at(-1);
  if (!filename?.endsWith('.png')) {
    throw new Error(`Hazbin sprite sheet must be a PNG path: ${sheetPath}`);
  }
  return filename.slice(0, -4);
}

export function buildHazbinAnimationSheetPaths(
  baseSheetPath: string,
): Readonly<Record<SupplementalSpriteAnimationBankId, string>> {
  return buildSupplementalAnimationSheetPaths(baseSheetPath, 'hazbin');
}

export function buildHelluvaAnimationSheetPaths(
  baseSheetPath: string,
): Readonly<Record<SupplementalSpriteAnimationBankId, string>> {
  return buildSupplementalAnimationSheetPaths(baseSheetPath, 'helluva');
}

function buildSupplementalAnimationSheetPaths(
  baseSheetPath: string,
  collection: 'hazbin' | 'helluva',
): Readonly<Record<SupplementalSpriteAnimationBankId, string>> {
  const stem = getSheetStem(baseSheetPath);
  return Object.fromEntries(
    HAZBIN_SUPPLEMENTAL_ANIMATION_BANKS.map(bank => [
      bank,
      `/assets/sprites/${collection}/animation/v1/${bank}/${stem}-${bank}.png`,
    ]),
  ) as Readonly<Record<SupplementalSpriteAnimationBankId, string>>;
}

export function buildHazbinCinematicSheetPaths(
  baseSheetPath: string,
): Readonly<Record<PentagramCinematicKind, string>> {
  const stem = getSheetStem(baseSheetPath);
  return Object.fromEntries(
    PENTAGRAM_CINEMATIC_BANKS.map(bank => [
      bank,
      `/assets/sprites/hazbin/cinematics/v1/${bank}/${stem}-${bank}.png`,
    ]),
  ) as Readonly<Record<PentagramCinematicKind, string>>;
}

export function getCharacterSpriteSheet(
  sprite: CharacterSpriteAsset,
  bank: SpriteAnimationBankId,
): string {
  return bank === 'base' ? sprite.sheet : sprite.animationSheets[bank];
}

export function getCharacterCinematicSpriteSheet(
  sprite: CharacterSpriteAsset,
  kind: PentagramCinematicKind,
): string {
  return sprite.cinematicSheets[kind];
}

export const SPRITE_SHEETS: readonly SpriteSheetDefinition[] = [
  {
    id: 'core-a',
    title: 'Hotel founders and residents I',
    path: '/assets/sprites/sheets/core-a.png',
    characters: ['Charlie Morningstar', 'Vaggie', 'Angel Dust', 'Alastor'],
    continuity: 'Season 1 reference designs'
  },
  {
    id: 'core-b',
    title: 'Hotel founders and residents II',
    path: '/assets/sprites/sheets/core-b.png',
    characters: ['Husk', 'Niffty', 'Sir Pentious', 'Lucifer Morningstar'],
    continuity: 'Season 1 reference designs'
  },
  {
    id: 'hell-antagonists',
    title: 'Allies and the Vees',
    path: '/assets/sprites/sheets/hell-antagonists.png',
    characters: ['Cherri Bomb', 'Vox', 'Valentino', 'Velvette'],
    continuity: 'Main-series reference designs'
  },
  {
    id: 'heaven',
    title: 'Heaven delegation',
    path: '/assets/sprites/sheets/heaven.png',
    characters: ['Adam', 'Emily', 'Sera', 'Lute'],
    continuity: 'Season 1 continuity'
  },
  {
    id: 'overlords',
    title: 'Overlords and external powers',
    path: '/assets/sprites/sheets/overlords.png',
    characters: ['Carmilla Carmine', 'Rosie', 'Zestial', 'Zeezi'],
    continuity: 'Main-series reference designs'
  },
  {
    id: 'season2-au',
    title: 'Season 2 and Simulation AU',
    path: '/assets/sprites/sheets/season2-au.png',
    characters: ['Baxter', 'Abel', 'Marlow Glass', 'Ember Vale'],
    continuity: 'Baxter and Abel: Season 2 designs · Marlow and Ember: non-canon Simulation AU originals'
  }
] as const;

const CHARACTER_ROWS: readonly (readonly [string, string, number])[] = [
  ['charlie', 'core-a', 0],
  ['vaggie', 'core-a', 1],
  ['angeldust', 'core-a', 2],
  ['alastor', 'core-a', 3],
  ['husk', 'core-b', 0],
  ['niffty', 'core-b', 1],
  ['sirpentious', 'core-b', 2],
  ['lucifer', 'core-b', 3],
  ['cherribomb', 'hell-antagonists', 0],
  ['vox', 'hell-antagonists', 1],
  ['valentino', 'hell-antagonists', 2],
  ['velvette', 'hell-antagonists', 3],
  ['adam', 'heaven', 0],
  ['emily', 'heaven', 1],
  ['sera', 'heaven', 2],
  ['lute', 'heaven', 3],
  ['carmilla', 'overlords', 0],
  ['rosie', 'overlords', 1],
  ['zestial', 'overlords', 2],
  ['zeezi', 'overlords', 3],
  ['baxter', 'season2-au', 0],
  ['abel', 'season2-au', 1],
  ['sim_applicant_marlow', 'season2-au', 2],
  ['sim_applicant_ember', 'season2-au', 3]
] as const;

const OPERATIONAL_CHARACTER_SPRITES = Object.fromEntries(
  CHARACTER_ROWS.map(([characterId, sheet, row]) => [
    characterId,
    {
      portrait: `/assets/sprites/portraits/${characterId}.png`,
      sheet: `/assets/sprites/sheets/${sheet}.png`,
      row,
      animationSheets: buildHazbinAnimationSheetPaths(
        `/assets/sprites/sheets/${sheet}.png`,
      ),
      cinematicSheets: buildHazbinCinematicSheetPaths(
        `/assets/sprites/sheets/${sheet}.png`,
      ),
      animationSetId: EIGHT_BANK_COMBAT_ANIMATION_SET_ID,
    }
  ])
) as Readonly<Record<string, CharacterSpriteAsset>>;

export function buildHazbinDirectorySpriteAssets(
  profiles = HAZBIN_DIRECTORY_PROFILES,
): Readonly<Record<string, CharacterSpriteAsset>> {
  return Object.fromEntries(
    profiles
    .filter(({ existingOperationalProfile, assetStatus }) => !existingOperationalProfile && assetStatus === 'ready')
    .map(({ id, portrait, sheetPath, sheetRow }) => [
      id,
      {
        portrait,
        sheet: sheetPath,
        row: sheetRow,
        animationSheets: buildHazbinAnimationSheetPaths(sheetPath),
        cinematicSheets: buildHazbinCinematicSheetPaths(sheetPath),
        animationSetId: EIGHT_BANK_COMBAT_ANIMATION_SET_ID,
      },
    ]),
  ) as Readonly<Record<string, CharacterSpriteAsset>>;
}

const DIRECTORY_CHARACTER_SPRITES = buildHazbinDirectorySpriteAssets();

export const CHARACTER_SPRITES: Readonly<Record<string, CharacterSpriteAsset>> = {
  ...OPERATIONAL_CHARACTER_SPRITES,
  ...DIRECTORY_CHARACTER_SPRITES,
};

export function getCharacterSpriteAsset(characterId: string): CharacterSpriteAsset | undefined {
  return CHARACTER_SPRITES[characterId];
}

export function buildHelluvaCharacterSpriteAssets(
  profiles = HELLUVA_CHARACTERS,
  sheets = HELLUVA_SPRITE_SHEETS,
): Readonly<Record<string, HelluvaCharacterSpriteAsset>> {
  const profilesByName = new Map(profiles.map(profile => [profile.name, profile]));
  return Object.fromEntries(
    sheets.flatMap(sheet => sheet.characters.map((characterName, row) => {
      const profile = profilesByName.get(characterName);
      if (!profile) {
        throw new Error(
          `Helluva sprite sheet ${sheet.id} references unknown profile ${characterName}`,
        );
      }
      return [
        profile.id,
        {
          portrait: profile.portrait,
          sheet: sheet.path,
          row,
          animationSheets: buildHelluvaAnimationSheetPaths(sheet.path),
          animationSetId: EIGHT_BANK_COMBAT_ANIMATION_SET_ID,
        },
      ] as const;
    })),
  ) as Readonly<Record<string, HelluvaCharacterSpriteAsset>>;
}

export const HELLUVA_CHARACTER_SPRITES = buildHelluvaCharacterSpriteAssets();

export function getHelluvaCharacterSpriteAsset(
  characterId: string,
): HelluvaCharacterSpriteAsset | undefined {
  return HELLUVA_CHARACTER_SPRITES[characterId];
}
