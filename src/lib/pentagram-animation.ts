import type { CombatAction } from './pentagram-combat';
import {
  DEFAULT_SPRITE_ANIMATION_SET_ID,
  getSpriteAnimationSet,
  type CombatSpriteClipName,
  type SpriteAnimationBankId,
  type SpriteAnimationClip,
  type SpriteAnimationSetId,
  type SpriteAtlasColumn,
} from './sprite-animation-registry';

export type CombatPoseColumn = SpriteAtlasColumn;

export interface CombatAnimationFrame {
  clip: CombatSpriteClipName;
  frameIndex: number;
  bank: SpriteAnimationBankId;
  column: CombatPoseColumn;
}

export interface CombatAnimationOptions {
  animationSetId?: SpriteAnimationSetId;
  /**
   * Real engine duration after fighter-style scaling. Non-looping clips are
   * normalized against this duration so authored key poses retain their
   * semantic startup/impact boundaries for every combat style.
   */
  actionDurationMs?: number;
  loopElapsedMs?: number;
}

const ACTION_CLIPS: Readonly<Record<CombatAction, CombatSpriteClipName>> = {
  idle: 'idle',
  walk: 'walk',
  guard: 'guard',
  crouch: 'crouch',
  jump: 'jump',
  taunt: 'taunt',
  light: 'light',
  heavy: 'heavy',
  special: 'special',
  hit: 'hit',
  ko: 'ko',
  victory: 'victory',
};

function getClipDuration(clip: SpriteAnimationClip): number {
  return clip.frames.reduce((total, frame) => total + frame.durationMs, 0);
}

function getFrameAtElapsedMs(
  clipName: CombatSpriteClipName,
  clip: SpriteAnimationClip,
  elapsedMs: number,
): CombatAnimationFrame {
  const durationMs = getClipDuration(clip);
  const safeElapsedMs = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const localElapsedMs = clip.loop && durationMs > 0
    ? safeElapsedMs % durationMs
    : Math.min(safeElapsedMs, durationMs);
  let boundaryMs = 0;

  for (let frameIndex = 0; frameIndex < clip.frames.length; frameIndex += 1) {
    boundaryMs += clip.frames[frameIndex].durationMs;
    if (localElapsedMs < boundaryMs) {
      return {
        clip: clipName,
        frameIndex,
        bank: clip.frames[frameIndex].bank ?? 'base',
        column: clip.frames[frameIndex].column,
      };
    }
  }

  const frameIndex = clip.frames.length - 1;
  return {
    clip: clipName,
    frameIndex,
    bank: clip.frames[frameIndex].bank ?? 'base',
    column: clip.frames[frameIndex].column,
  };
}

function getFrameStartMs(
  clip: SpriteAnimationClip,
  targetFrameIndex: number,
): number | undefined {
  let elapsedMs = 0;
  for (let frameIndex = 0; frameIndex < clip.frames.length; frameIndex += 1) {
    if (frameIndex === targetFrameIndex) return elapsedMs;
    elapsedMs += clip.frames[frameIndex].durationMs;
  }
  return undefined;
}

function getNormalizedActionElapsedMs(
  clip: SpriteAnimationClip,
  clipDurationMs: number,
  remainingMs: number,
  actionDurationMs: number | undefined,
  impactFrameIndex: number | undefined,
): number {
  const durationMs = Number.isFinite(actionDurationMs) && (actionDurationMs ?? 0) > 0
    ? actionDurationMs as number
    : clipDurationMs;
  const safeRemainingMs = Number.isFinite(remainingMs)
    ? Math.min(durationMs, Math.max(0, remainingMs))
    : 0;
  const elapsedMs = durationMs - safeRemainingMs;
  if (durationMs === clipDurationMs) return elapsedMs;

  const clipImpactStartMs = impactFrameIndex === undefined
    ? undefined
    : getFrameStartMs(clip, impactFrameIndex);
  if (
    clipImpactStartMs === undefined
    || clipImpactStartMs <= 0
    || clipImpactStartMs >= clipDurationMs
  ) {
    return (elapsedMs / durationMs) * clipDurationMs;
  }

  // The engine rounds scaled action and startup durations independently.
  // Mapping the two phases around the rounded impact boundary keeps column 4
  // entering on the exact damage frame instead of drifting by one render tick.
  const actionImpactStartMs = Math.round(
    (clipImpactStartMs / clipDurationMs) * durationMs,
  );
  if (elapsedMs < actionImpactStartMs) {
    return (elapsedMs / actionImpactStartMs) * clipImpactStartMs;
  }

  const actionRecoveryMs = durationMs - actionImpactStartMs;
  if (actionRecoveryMs <= 0) return clipImpactStartMs;
  return clipImpactStartMs
    + ((elapsedMs - actionImpactStartMs) / actionRecoveryMs)
      * (clipDurationMs - clipImpactStartMs);
}

export function getCombatAnimationFrame(
  action: CombatAction,
  remainingMs: number,
  options: CombatAnimationOptions = {},
): CombatAnimationFrame {
  const clipName = ACTION_CLIPS[action];
  const animationSet = getSpriteAnimationSet(
    options.animationSetId ?? DEFAULT_SPRITE_ANIMATION_SET_ID,
  );
  const clip = animationSet.clips[clipName];
  const clipDurationMs = getClipDuration(clip);
  const legacyImpactColumn = animationSet.columnRoles?.indexOf('attack_impact');
  const legacyImpactFrameIndex = legacyImpactColumn === undefined
    ? undefined
    : clip.frames.findIndex(frame => (
        (frame.bank === undefined || frame.bank === 'base')
        && frame.column === legacyImpactColumn
      ));
  const impactFrameIndex = clip.impactFrameIndex
    ?? (legacyImpactFrameIndex !== undefined && legacyImpactFrameIndex >= 0
      ? legacyImpactFrameIndex
      : undefined);
  const elapsedMs = clip.loop
    ? options.loopElapsedMs ?? 0
    : getNormalizedActionElapsedMs(
        clip,
        clipDurationMs,
        remainingMs,
        options.actionDurationMs,
        impactFrameIndex,
      );

  return getFrameAtElapsedMs(clipName, clip, elapsedMs);
}

/**
 * Retains the historical two-argument API used by the live fight while the
 * registry allows future per-character animation sets through `options`.
 */
export function getCombatPoseColumn(
  action: CombatAction,
  remainingMs: number,
  options?: CombatAnimationOptions,
): CombatPoseColumn {
  return getCombatAnimationFrame(action, remainingMs, options).column;
}
