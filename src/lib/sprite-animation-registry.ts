export const SPRITE_ATLAS_COLUMN_COUNT = 6 as const;

export type SpriteAtlasColumn = 0 | 1 | 2 | 3 | 4 | 5;

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
  column: SpriteAtlasColumn;
  durationMs: number;
}

export interface SpriteAnimationClip {
  loop: boolean;
  frames: readonly SpriteAnimationFrame[];
}

export interface SpriteAnimationSetDefinition {
  id: SpriteAnimationSetId;
  facing: 'screen_right';
  columnRoles: readonly [
    'portrait_idle',
    'expression',
    'combat_ready',
    'attack_startup',
    'attack_impact',
    'victory_recovery',
  ];
  clips: Readonly<Record<CombatSpriteClipName, SpriteAnimationClip>>;
}

export type SpriteAnimationSetId = 'six-pose-combat-v2';

export const DEFAULT_SPRITE_ANIMATION_SET_ID: SpriteAnimationSetId = 'six-pose-combat-v2';

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

export const SPRITE_ANIMATION_SETS: Readonly<
  Record<SpriteAnimationSetId, SpriteAnimationSetDefinition>
> = {
  [DEFAULT_SPRITE_ANIMATION_SET_ID]: SIX_POSE_COMBAT_ANIMATION_SET,
};

export function getSpriteAnimationSet(
  animationSetId: SpriteAnimationSetId = DEFAULT_SPRITE_ANIMATION_SET_ID,
): SpriteAnimationSetDefinition {
  return SPRITE_ANIMATION_SETS[animationSetId];
}
