export const SPRITE_ATLAS_COLUMN_COUNT = 6 as const;

export type SpriteAtlasColumn = 0 | 1 | 2 | 3 | 4 | 5;
export type SpriteAnimationBankId = 'base' | 'movement' | 'offense' | 'reaction';
export type SupplementalSpriteAnimationBankId = Exclude<SpriteAnimationBankId, 'base'>;

export type CombatSpriteClipName =
  | 'idle'
  | 'walk'
  | 'guard'
  | 'light'
  | 'heavy'
  | 'special'
  | 'hit'
  | 'ko'
  | 'victory';

export interface SpriteAnimationFrame {
  /** Omitted by the legacy v2 contract, where every frame lives in `base`. */
  bank?: SpriteAnimationBankId;
  column: SpriteAtlasColumn;
  durationMs: number;
}

export interface SpriteAnimationClip {
  loop: boolean;
  /**
   * Index of the first damaging/contact frame. This keeps combat timing
   * independent from which bank and column contains the authored impact pose.
   */
  impactFrameIndex?: number;
  frames: readonly SpriteAnimationFrame[];
}

export interface SpriteAnimationSetDefinition {
  id: SpriteAnimationSetId;
  facing: 'screen_right';
  columnRoles?: readonly [
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  bankColumnRoles?: Readonly<
    Partial<Record<SpriteAnimationBankId, readonly [
      string,
      string,
      string,
      string,
      string,
      string,
    ]>>
  >;
  clips: Readonly<Record<CombatSpriteClipName, SpriteAnimationClip>>;
}

export type SpriteAnimationSetId = 'six-pose-combat-v2' | 'four-bank-combat-v3';

export const DEFAULT_SPRITE_ANIMATION_SET_ID: SpriteAnimationSetId = 'six-pose-combat-v2';
export const HAZBIN_FOUR_BANK_ANIMATION_SET_ID: SpriteAnimationSetId = 'four-bank-combat-v3';

/**
 * Backwards-compatible animation contract for every current 6x4 atlas.
 *
 * The source art contains six reviewed key poses rather than a dedicated
 * multi-frame strip for every action. Idle, walk and guard therefore retain
 * the direction-safe combat stance while CSS supplies breathing, locomotion
 * and guard feedback. Attacks sequence the authored startup, impact and
 * recovery poses without inventing intermediate artwork. Version 2 aligns the
 * first impact pose with the combat engine's real startup boundary.
 */
export const SIX_POSE_COMBAT_ANIMATION_SET: SpriteAnimationSetDefinition = {
  id: DEFAULT_SPRITE_ANIMATION_SET_ID,
  facing: 'screen_right',
  columnRoles: [
    'portrait_idle',
    'expression',
    'combat_ready',
    'attack_startup',
    'attack_impact',
    'victory_recovery',
  ],
  clips: {
    idle: {
      loop: true,
      frames: [{ column: 2, durationMs: 800 }],
    },
    walk: {
      loop: true,
      frames: [{ column: 2, durationMs: 210 }],
    },
    guard: {
      loop: true,
      frames: [{ column: 2, durationMs: 250 }],
    },
    light: {
      loop: false,
      frames: [
        { column: 2, durationMs: 40 },
        { column: 3, durationMs: 80 },
        { column: 4, durationMs: 100 },
        { column: 2, durationMs: 120 },
      ],
    },
    heavy: {
      loop: false,
      frames: [
        { column: 2, durationMs: 80 },
        { column: 3, durationMs: 140 },
        { column: 4, durationMs: 140 },
        { column: 5, durationMs: 100 },
      ],
    },
    special: {
      loop: false,
      frames: [
        { column: 2, durationMs: 140 },
        { column: 3, durationMs: 220 },
        { column: 4, durationMs: 180 },
        { column: 5, durationMs: 160 },
      ],
    },
    hit: {
      loop: false,
      frames: [{ column: 4, durationMs: 210 }],
    },
    ko: {
      loop: false,
      frames: [{ column: 4, durationMs: 1_000 }],
    },
    victory: {
      loop: true,
      frames: [{ column: 5, durationMs: 900 }],
    },
  },
};

/**
 * Hazbin's authored four-bank contract. The original atlas remains the source
 * for portraits and victory poses; three supplementary atlases provide
 * eighteen real movement, attack and reaction keyframes per character.
 */
export const FOUR_BANK_COMBAT_ANIMATION_SET: SpriteAnimationSetDefinition = {
  id: HAZBIN_FOUR_BANK_ANIMATION_SET_ID,
  facing: 'screen_right',
  bankColumnRoles: {
    base: [
      'portrait_idle',
      'expression',
      'combat_ready',
      'attack_startup',
      'attack_impact',
      'victory_recovery',
    ],
    movement: [
      'idle_stable',
      'idle_weight_shift',
      'walk_contact_a',
      'walk_passing',
      'walk_contact_b',
      'dash_brake',
    ],
    offense: [
      'light_startup',
      'light_contact',
      'light_recovery',
      'heavy_startup',
      'heavy_contact',
      'heavy_recovery',
    ],
    reaction: [
      'guard_entry',
      'guard_impact',
      'light_hit',
      'heavy_hit',
      'knockdown',
      'ko_disabled',
    ],
  },
  clips: {
    idle: {
      loop: true,
      frames: [
        { bank: 'movement', column: 0, durationMs: 520 },
        { bank: 'movement', column: 1, durationMs: 420 },
      ],
    },
    walk: {
      loop: true,
      frames: [
        { bank: 'movement', column: 2, durationMs: 115 },
        { bank: 'movement', column: 3, durationMs: 105 },
        { bank: 'movement', column: 4, durationMs: 115 },
        { bank: 'movement', column: 3, durationMs: 105 },
      ],
    },
    guard: {
      loop: true,
      frames: [
        { bank: 'reaction', column: 0, durationMs: 150 },
        { bank: 'reaction', column: 1, durationMs: 220 },
        { bank: 'reaction', column: 0, durationMs: 190 },
      ],
    },
    light: {
      loop: false,
      impactFrameIndex: 1,
      frames: [
        { bank: 'offense', column: 0, durationMs: 120 },
        { bank: 'offense', column: 1, durationMs: 100 },
        { bank: 'offense', column: 2, durationMs: 120 },
      ],
    },
    heavy: {
      loop: false,
      impactFrameIndex: 1,
      frames: [
        { bank: 'offense', column: 3, durationMs: 220 },
        { bank: 'offense', column: 4, durationMs: 140 },
        { bank: 'offense', column: 5, durationMs: 100 },
      ],
    },
    special: {
      loop: false,
      impactFrameIndex: 1,
      frames: [
        { bank: 'offense', column: 3, durationMs: 360 },
        { bank: 'offense', column: 4, durationMs: 180 },
        { bank: 'offense', column: 5, durationMs: 160 },
      ],
    },
    hit: {
      loop: false,
      frames: [
        { bank: 'reaction', column: 2, durationMs: 95 },
        { bank: 'reaction', column: 3, durationMs: 115 },
      ],
    },
    ko: {
      loop: false,
      frames: [
        { bank: 'reaction', column: 4, durationMs: 260 },
        { bank: 'reaction', column: 5, durationMs: 1_000 },
      ],
    },
    victory: {
      loop: true,
      frames: [
        { bank: 'base', column: 5, durationMs: 720 },
        { bank: 'movement', column: 1, durationMs: 260 },
      ],
    },
  },
};

export const SPRITE_ANIMATION_SETS: Readonly<
  Record<SpriteAnimationSetId, SpriteAnimationSetDefinition>
> = {
  [DEFAULT_SPRITE_ANIMATION_SET_ID]: SIX_POSE_COMBAT_ANIMATION_SET,
  [HAZBIN_FOUR_BANK_ANIMATION_SET_ID]: FOUR_BANK_COMBAT_ANIMATION_SET,
};

export function getSpriteAnimationSet(
  animationSetId: SpriteAnimationSetId = DEFAULT_SPRITE_ANIMATION_SET_ID,
): SpriteAnimationSetDefinition {
  return SPRITE_ANIMATION_SETS[animationSetId];
}
