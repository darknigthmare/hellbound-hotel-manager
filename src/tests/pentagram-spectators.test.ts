import { describe, expect, it } from 'vitest';
import { HAZBIN_DIRECTORY_PROFILES } from '../data/hazbin-directory';
import { getCharacterSpriteAsset } from '../lib/character-sprites';
import {
  getPentagramStageSpectators,
  MAX_PENTAGRAM_STAGE_SPECTATORS,
  PENTAGRAM_STAGE_SPECTATOR_POOLS,
  selectPentagramSpectatorIds,
  shufflePentagramSpectatorIds,
} from '../lib/pentagram-spectators';
import {
  PENTAGRAM_STAGES,
  type PentagramStageId,
} from '../lib/pentagram-stages';
import type { TimelineState } from '../types';

const SEASON_ONE_TIMELINE: TimelineState = {
  current: 'season_1_start',
  hideSpoilers: false,
  spoilerLevel: 'season_1',
  hotelState: 'original',
};

const CUSTOM_TIMELINE: TimelineState = {
  current: 'custom',
  hideSpoilers: false,
  spoilerLevel: 'future',
  hotelState: 'rebuilt',
};

describe('Pentagram Arena stage spectators', () => {
  it('excludes both active fighters before filling the available slots and caps the crowd', () => {
    expect(selectPentagramSpectatorIds(
      ['charlie', 'vaggie', 'husk', 'niffty', 'alastor'],
      new Set(['charlie', 'vaggie']),
      3,
    )).toEqual(['husk', 'niffty', 'alastor']);
    expect(selectPentagramSpectatorIds(
      ['charlie', 'vaggie', 'husk', 'niffty', 'alastor'],
      new Set(),
      99,
    )).toHaveLength(MAX_PENTAGRAM_STAGE_SPECTATORS);
    expect(selectPentagramSpectatorIds(
      ['charlie', 'vaggie'],
      new Set(),
      0,
    )).toEqual([]);
    expect(selectPentagramSpectatorIds(
      ['charlie', 'vaggie'],
      new Set(),
      -2,
    )).toEqual([]);
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

  it('configures all eight stages while retaining spoiler filtering', () => {
    expect(Object.keys(PENTAGRAM_STAGE_SPECTATOR_POOLS).sort())
      .toEqual(PENTAGRAM_STAGES.map(({ id }) => id).sort());
    expect(getPentagramStageSpectators(
      'pentagram-rooftops',
      SEASON_ONE_TIMELINE,
      'charlie',
      'vaggie',
    )).toHaveLength(4);
    expect(getPentagramStageSpectators(
      'hotel-exterior',
      SEASON_ONE_TIMELINE,
      'charlie',
      'vaggie',
    )).toHaveLength(4);
    expect(getPentagramStageSpectators(
      'cannibal-town-square',
      { ...SEASON_ONE_TIMELINE, hideSpoilers: true, spoilerLevel: 'none' },
      'charlie',
      'vaggie',
    )).toEqual([]);
  });

  it('only references ready sprite identities in each venue pool', () => {
    for (const pool of Object.values(PENTAGRAM_STAGE_SPECTATOR_POOLS)) {
      expect(pool.count).toBeLessThanOrEqual(MAX_PENTAGRAM_STAGE_SPECTATORS);
      expect(new Set(pool.candidateIds).size).toBe(pool.candidateIds.length);
      pool.candidateIds.forEach((candidateId) => {
        expect(getCharacterSpriteAsset(candidateId), candidateId).toBeTruthy();
      });
    }
  });

  it('assigns every illustrated identity to at least one lore-labelled venue', () => {
    const illustratedIds = HAZBIN_DIRECTORY_PROFILES
      .filter(({ assetStatus }) => assetStatus === 'ready')
      .map(({ id }) => id)
      .sort();
    const assignedIds = [...new Set(
      Object.values(PENTAGRAM_STAGE_SPECTATOR_POOLS)
        .flatMap(({ candidateIds }) => candidateIds),
    )].sort();

    expect(illustratedIds).toHaveLength(100);
    expect(assignedIds).toEqual(illustratedIds);
    expect(assignedIds).not.toContain('hz_tiffany_titfucker');
  });

  it('rotates reproducibly by canonical matchup instead of starving late candidates', () => {
    const candidates = PENTAGRAM_STAGE_SPECTATOR_POOLS['hotel-exterior'].candidateIds;
    expect(shufflePentagramSpectatorIds(candidates, 'hotel-exterior|charlie|vaggie'))
      .toEqual(shufflePentagramSpectatorIds(candidates, 'hotel-exterior|charlie|vaggie'));
    expect(shufflePentagramSpectatorIds(candidates, 'hotel-exterior|charlie|vaggie'))
      .not.toEqual(shufflePentagramSpectatorIds(candidates, 'hotel-exterior|vox|valentino'));

    const first = getPentagramStageSpectators(
      'hotel-exterior',
      CUSTOM_TIMELINE,
      'charlie',
      'vaggie',
    ).map(({ id }) => id);
    const swapped = getPentagramStageSpectators(
      'hotel-exterior',
      CUSTOM_TIMELINE,
      'vaggie',
      'charlie',
    ).map(({ id }) => id);
    const differentMatch = getPentagramStageSpectators(
      'hotel-exterior',
      CUSTOM_TIMELINE,
      'vox',
      'valentino',
    ).map(({ id }) => id);

    expect(swapped).toEqual(first);
    expect(differentMatch).not.toEqual(first);
  });

  it('makes every assigned candidate reachable across deterministic custom-timeline matchups', () => {
    const illustratedIds = HAZBIN_DIRECTORY_PROFILES
      .filter(({ assetStatus, fighterEligible }) => assetStatus === 'ready' && fighterEligible)
      .map(({ id }) => id);

    for (const [stageId, pool] of Object.entries(PENTAGRAM_STAGE_SPECTATOR_POOLS)) {
      const reached = new Set<string>();

      matchupSearch:
      for (let oneIndex = 0; oneIndex < illustratedIds.length; oneIndex += 1) {
        for (let twoIndex = oneIndex + 1; twoIndex < illustratedIds.length; twoIndex += 1) {
          getPentagramStageSpectators(
            stageId as PentagramStageId,
            CUSTOM_TIMELINE,
            illustratedIds[oneIndex],
            illustratedIds[twoIndex],
          ).forEach(({ id }) => reached.add(id));
          if (reached.size === pool.candidateIds.length) break matchupSearch;
        }
      }

      expect(
        [...reached].sort(),
        `unreachable spectators for ${stageId}`,
      ).toEqual([...pool.candidateIds].sort());
    }
  });
});
