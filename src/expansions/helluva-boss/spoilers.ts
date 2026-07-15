import type { HelluvaBossSpoilerScope } from '../../types';

export const HELLUVA_BOSS_SPOILER_SCOPES = [
  'season_1',
  'season_2',
  'specials',
] as const satisfies readonly HelluvaBossSpoilerScope[];

const HELLUVA_BOSS_SPOILER_RANK: Record<HelluvaBossSpoilerScope, number> = {
  season_1: 0,
  season_2: 1,
  specials: 2,
};

interface HelluvaBossSpoilerScopeCopy {
  selectorLabel: string;
  timelineLabel: string;
  spoilerLabel: string;
  changeNotice: string;
  hiddenContentLabel: string | null;
}

export const HELLUVA_BOSS_SPOILER_SCOPE_COPY: Record<
  HelluvaBossSpoilerScope,
  HelluvaBossSpoilerScopeCopy
> = {
  season_1: {
    selectorLabel: 'Season 1 only',
    timelineLabel: 'Helluva Season 1',
    spoilerLabel: 'Season 2 + Shorts hidden',
    changeNotice: 'Season 2 and Helluva Shorts profiles and lore are now hidden.',
    hiddenContentLabel: 'Season 2 and Helluva Shorts',
  },
  season_2: {
    selectorLabel: 'Seasons 1 + 2',
    timelineLabel: 'Helluva Seasons 1–2',
    spoilerLabel: 'Helluva Shorts hidden',
    changeNotice: 'Season 2 profiles and lore are visible; Helluva Shorts remain hidden.',
    hiddenContentLabel: 'Helluva Shorts',
  },
  specials: {
    selectorLabel: 'Seasons 1 + 2 + Helluva Shorts',
    timelineLabel: 'Helluva Seasons 1–2 + Shorts',
    spoilerLabel: 'Helluva Shorts visible',
    changeNotice: 'Season 2 and Helluva Shorts profiles and lore are now visible.',
    hiddenContentLabel: null,
  },
};

export function isHelluvaBossSpoilerVisible(
  selectedScope: HelluvaBossSpoilerScope,
  contentScope: HelluvaBossSpoilerScope,
): boolean {
  return HELLUVA_BOSS_SPOILER_RANK[contentScope] <= HELLUVA_BOSS_SPOILER_RANK[selectedScope];
}
