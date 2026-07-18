import { describe, expect, it } from 'vitest';
import { getCharacterSpriteAsset } from '../lib/character-sprites';
import {
  getPentagramStageSpectators,
  PENTAGRAM_STAGE_SPECTATOR_POOLS,
  selectPentagramSpectatorIds,
} from '../lib/pentagram-spectators';
import type { PentagramStageId } from '../lib/pentagram-stages';
import type { TimelineState } from '../types';

const SEASON_ONE_TIMELINE: TimelineState = {
  current: 'season_1_start',
  hideSpoilers: false,
  spoilerLevel: 'season_1',
  hotelState: 'original',
};

describe('Pentagram Arena stage spectators', () => {
  it('excludes both active fighters before filling the available slots', () => {
    expect(selectPentagramSpectatorIds(
      ['charlie', 'vaggie', 'husk', 'niffty', 'alastor'],
      new Set(['charlie', 'vaggie']),
      3,
    )).toEqual(['husk', 'niffty', 'alastor']);
  });

  it('keeps every configured crowd deterministic, unique and disjoint from the matchup', () => {
    const stageIds = Object.keys(PENTAGRAM_STAGE_SPECTATOR_POOLS) as PentagramStageId[];

    for (const stageId of stageIds) {
      const pool = PENTAGRAM_STAGE_SPECTATOR_POOLS[
        stageId as keyof typeof PENTAGRAM_STAGE_SPECTATOR_POOLS
      ];
      const fighterOneId = pool.candidateIds[0];
      const fighterTwoId = pool.candidateIds[1];
      const first = getPentagramStageSpectators(
        stageId,
        SEASON_ONE_TIMELINE,
        fighterOneId,
        fighterTwoId,
      );
      const second = getPentagramStageSpectators(
        stageId,
        SEASON_ONE_TIMELINE,
        fighterTwoId,
        fighterOneId,
      );
      const ids = first.map(({ id }) => id);

      expect(ids).toEqual(second.map(({ id }) => id));
      expect(first).toHaveLength(pool.count);
      expect(ids).not.toContain(fighterOneId);
      expect(ids).not.toContain(fighterTwoId);
      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(first.map(({ slot }) => slot.depth)).size).toBeGreaterThan(1);
      first.forEach(({ id, slot, sprite }) => {
        expect(getCharacterSpriteAsset(id)).toBe(sprite);
        expect(slot.x).toBeGreaterThanOrEqual(0);
        expect(slot.x).toBeLessThanOrEqual(100);
        expect(slot.bottom).toBeGreaterThanOrEqual(0);
        expect(slot.bottom).toBeLessThanOrEqual(100);
      });
    }
  });

  it('returns no crowd for unconfigured or spoiler-hidden venues', () => {
    expect(getPentagramStageSpectators(
      'pentagram-rooftops',
      SEASON_ONE_TIMELINE,
      'charlie',
      'vaggie',
    )).toEqual([]);
    expect(getPentagramStageSpectators(
      'hotel-exterior',
      SEASON_ONE_TIMELINE,
      'charlie',
      'vaggie',
    )).toEqual([]);
    expect(getPentagramStageSpectators(
      'hotel-lobby',
      { ...SEASON_ONE_TIMELINE, hideSpoilers: true, spoilerLevel: 'none' },
      'charlie',
      'vaggie',
    )).toEqual([]);
  });

  it('only references ready sprite identities in each venue pool', () => {
    for (const pool of Object.values(PENTAGRAM_STAGE_SPECTATOR_POOLS)) {
      expect(new Set(pool.candidateIds).size).toBe(pool.candidateIds.length);
      pool.candidateIds.forEach((candidateId) => {
        expect(getCharacterSpriteAsset(candidateId), candidateId).toBeTruthy();
      });
    }
  });
});
