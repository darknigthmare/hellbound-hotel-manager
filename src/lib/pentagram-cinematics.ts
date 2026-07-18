import type { SpriteAtlasColumn } from './sprite-animation-registry';

export const PENTAGRAM_CINEMATIC_CONTRACT_ID = 'three-bank-cinematics-v1' as const;

export const PENTAGRAM_CINEMATIC_BANKS = [
  'intro',
  'victory',
  'draw',
] as const;

export type PentagramCinematicKind = typeof PENTAGRAM_CINEMATIC_BANKS[number];

interface PentagramCinematicFrameDefinition {
  column: SpriteAtlasColumn;
  durationMs: number;
}

interface PentagramCinematicClipDefinition {
  frames: readonly PentagramCinematicFrameDefinition[];
}

export interface PentagramCinematicFrame {
  kind: PentagramCinematicKind;
  frameIndex: number;
  column: SpriteAtlasColumn;
}

export const PENTAGRAM_CINEMATIC_CLIPS: Readonly<
  Record<PentagramCinematicKind, PentagramCinematicClipDefinition>
> = {
  intro: {
    frames: [
      { column: 0, durationMs: 280 },
      { column: 1, durationMs: 240 },
      { column: 2, durationMs: 300 },
      { column: 3, durationMs: 380 },
      { column: 4, durationMs: 280 },
      { column: 5, durationMs: 460 },
    ],
  },
  victory: {
    frames: [
      { column: 0, durationMs: 300 },
      { column: 1, durationMs: 320 },
      { column: 2, durationMs: 360 },
      { column: 3, durationMs: 480 },
      { column: 4, durationMs: 540 },
      { column: 5, durationMs: 680 },
    ],
  },
  draw: {
    frames: [
      { column: 0, durationMs: 320 },
      { column: 1, durationMs: 340 },
      { column: 2, durationMs: 380 },
      { column: 3, durationMs: 460 },
      { column: 4, durationMs: 420 },
      { column: 5, durationMs: 620 },
    ],
  },
};

export function getPentagramCinematicDuration(kind: PentagramCinematicKind): number {
  return PENTAGRAM_CINEMATIC_CLIPS[kind].frames
    .reduce((total, frame) => total + frame.durationMs, 0);
}

export function getPentagramCinematicFrame(
  kind: PentagramCinematicKind,
  elapsedMs: number,
): PentagramCinematicFrame {
  const frames = PENTAGRAM_CINEMATIC_CLIPS[kind].frames;
  const safeElapsedMs = Number.isNaN(elapsedMs) || elapsedMs < 0
    ? 0
    : elapsedMs;
  let boundaryMs = 0;

  for (let frameIndex = 0; frameIndex < frames.length; frameIndex += 1) {
    boundaryMs += frames[frameIndex].durationMs;
    if (safeElapsedMs < boundaryMs) {
      return {
        kind,
        frameIndex,
        column: frames[frameIndex].column,
      };
    }
  }

  return {
    kind,
    frameIndex: frames.length - 1,
    column: frames[frames.length - 1].column,
  };
}
