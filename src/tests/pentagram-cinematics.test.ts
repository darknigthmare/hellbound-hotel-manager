import { describe, expect, it } from 'vitest';
import {
  getPentagramCinematicDuration,
  getPentagramCinematicFrame,
  PENTAGRAM_CINEMATIC_BANKS,
  PENTAGRAM_CINEMATIC_CLIPS,
} from '../lib/pentagram-cinematics';

describe('Pentagram match cinematics', () => {
  it('gives intro, victory and draw six dedicated authored frames each', () => {
    expect(PENTAGRAM_CINEMATIC_BANKS).toEqual(['intro', 'victory', 'draw']);

    for (const kind of PENTAGRAM_CINEMATIC_BANKS) {
      const clip = PENTAGRAM_CINEMATIC_CLIPS[kind];
      expect(clip.frames).toHaveLength(6);
      expect(clip.frames.map(({ column }) => column)).toEqual([0, 1, 2, 3, 4, 5]);
      expect(clip.frames.every(({ durationMs }) => durationMs > 0)).toBe(true);
      expect(getPentagramCinematicDuration(kind)).toBeGreaterThan(1_800);
    }
  });

  it('advances through the authored sequence and holds its final frame', () => {
    expect(getPentagramCinematicFrame('intro', 0)).toEqual({
      kind: 'intro',
      frameIndex: 0,
      column: 0,
    });
    expect(getPentagramCinematicFrame('intro', 280)).toEqual({
      kind: 'intro',
      frameIndex: 1,
      column: 1,
    });
    expect(getPentagramCinematicFrame('victory', Number.POSITIVE_INFINITY)).toEqual({
      kind: 'victory',
      frameIndex: 5,
      column: 5,
    });
    expect(
      getPentagramCinematicFrame(
        'draw',
        getPentagramCinematicDuration('draw') + 10_000,
      ),
    ).toEqual({
      kind: 'draw',
      frameIndex: 5,
      column: 5,
    });
  });
});
