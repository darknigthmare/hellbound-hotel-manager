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

export const CHARACTER_SPRITES: Readonly<Record<string, CharacterSpriteAsset>> = Object.fromEntries(
  CHARACTER_ROWS.map(([characterId, sheet, row]) => [
    characterId,
    {
      portrait: `/assets/sprites/portraits/${characterId}.png`,
      sheet: `/assets/sprites/sheets/${sheet}.png`,
      row
    }
  ])
);

export function getCharacterSpriteAsset(characterId: string): CharacterSpriteAsset | undefined {
  return CHARACTER_SPRITES[characterId];
}
