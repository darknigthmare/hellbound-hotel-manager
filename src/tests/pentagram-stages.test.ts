import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PENTAGRAM_STAGE,
  getPentagramStage,
  getPentagramStageVisualProperties,
  PENTAGRAM_STAGES,
} from '../lib/pentagram-stages';
import { renderPentagramScore } from '../lib/pentagram-soundtrack';

describe('Pentagram Arena stages and original soundtrack', () => {
  it('keeps a unique, lore-labelled and asset-addressable stage registry', () => {
    expect(PENTAGRAM_STAGES).toHaveLength(8);
    expect(new Set(PENTAGRAM_STAGES.map(stage => stage.id)).size).toBe(PENTAGRAM_STAGES.length);
    expect(new Set(PENTAGRAM_STAGES.map(stage => stage.imagePath)).size)
      .toBe(PENTAGRAM_STAGES.length);
    expect(new Set(PENTAGRAM_STAGES.map(stage => stage.thumbnailPath)).size)
      .toBe(PENTAGRAM_STAGES.length);
    expect(new Set(PENTAGRAM_STAGES.map(stage => stage.soundtrack.id)).size)
      .toBe(PENTAGRAM_STAGES.length);

    for (const stage of PENTAGRAM_STAGES) {
      expect(stage.imagePath).toMatch(/^\/assets\//);
      expect(stage.thumbnailPath)
        .toBe(`/assets/stages/hazbin/thumbs/${stage.id}.webp`);
      expect(
        existsSync(resolve(process.cwd(), 'public', stage.imagePath.replace(/^\//, ''))),
        stage.imagePath,
      ).toBe(true);
      expect(stage.loreBasis.length).toBeGreaterThan(20);
      expect(stage.soundtrack.title.length).toBeGreaterThan(4);
      expect(stage.soundtrack.bpm).toBeGreaterThanOrEqual(100);
      expect(stage.soundtrack.bpm).toBeLessThanOrEqual(160);
      expect(stage.soundtrack.chordProgression.length).toBeGreaterThanOrEqual(4);
      expect(stage.soundtrack.bassPattern.length).toBeGreaterThan(0);
      expect(stage.soundtrack.leadPattern.length).toBeGreaterThan(0);

      const visualProperties = getPentagramStageVisualProperties(stage);
      expect(visualProperties['--arena-stage-art']).toContain(stage.imagePath);
      expect(visualProperties['--arena-stage-accent']).toBe(stage.accent);
      expect(getPentagramStageVisualProperties(stage, 'thumbnail')['--arena-stage-art'])
        .toContain(stage.thumbnailPath);
    }

    expect(getPentagramStage('missing-stage')).toBe(DEFAULT_PENTAGRAM_STAGE);
    expect(DEFAULT_PENTAGRAM_STAGE.imagePath)
      .toBe('/assets/stages/hazbin/hotel-lobby.webp');
    expect(getPentagramStage('carmine-industries')).toMatchObject({
      name: 'Carmine Industries',
      imagePath: '/assets/stages/hazbin/carmine-industries.webp',
    });
    expect(getPentagramStage('heaven-embassy')).toMatchObject({
      name: 'Heaven Embassy & Clock Tower',
      imagePath: '/assets/stages/hazbin/heaven-embassy.webp',
    });
  });

  it('renders a deterministic stereo loop from generated synthesis only', () => {
    const first = renderPentagramScore(DEFAULT_PENTAGRAM_STAGE.soundtrack, 4_000);
    const second = renderPentagramScore(DEFAULT_PENTAGRAM_STAGE.soundtrack, 4_000);
    const checkpoints = [0, 127, 2_048, first.left.length - 1];
    const peak = first.left.reduce(
      (largest, sample) => Math.max(largest, Math.abs(sample)),
      0,
    );

    expect(first.sampleRate).toBe(4_000);
    expect(first.durationSeconds).toBeGreaterThan(10);
    expect(first.left).toHaveLength(first.right.length);
    expect(first.left.length).toBeGreaterThan(40_000);
    expect(peak).toBeGreaterThan(0.05);
    expect(peak).toBeLessThanOrEqual(1);
    expect(checkpoints.map(index => first.left[index]))
      .toEqual(checkpoints.map(index => second.left[index]));
    expect(first.left.some((sample, index) => sample !== first.right[index])).toBe(true);
  });

  it('renders a distinct original motif for every stage', () => {
    const checkpoints = [997, 3_011, 8_033, 15_001, 33_001];
    const fingerprints = PENTAGRAM_STAGES.map(({ soundtrack }) => {
      const rendered = renderPentagramScore(soundtrack, 4_000);
      return checkpoints
        .flatMap(index => [rendered.left[index], rendered.right[index]])
        .map(sample => sample.toFixed(7))
        .join(':');
    });

    expect(new Set(fingerprints).size).toBe(PENTAGRAM_STAGES.length);
  });

  it('rejects unusable synthesis rates', () => {
    expect(() => renderPentagramScore(DEFAULT_PENTAGRAM_STAGE.soundtrack, 2_000))
      .toThrow(/sample rate/i);
  });
});
