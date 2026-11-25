import type { PentagramStageId } from '../lib/pentagram-stages';
import { LEGACY_STORY_ROUTES, legacyStoryIllustration } from './campaign-legacy';
import { V3_STORY_ROUTES } from './campaign-v3';

/** A route version is content identity, independent of the storage schema. */
export type StoryRouteVersion = 1 | 3;
export const CURRENT_STORY_ROUTE_VERSION: StoryRouteVersion = 3;

export interface StoryChapter {
  opponent: string;
  stage: PentagramStageId;
  scene: string;
  title?: string;
  dramaticPurpose?: string;
  relationshipBasis?: string;
  sourceIds?: readonly string[];
}

export interface StoryRoute {
  title: string;
  intro: string;
  chapters: readonly [StoryChapter, StoryChapter, StoryChapter];
  ending: string;
  premise?: string;
  motivation?: string;
  stakes?: string;
  nextHook?: string;
  rival?: {
    fighterId: string;
    canonRelationship: string;
    dramaticReason: string;
    relationshipStatus: string;
    sourceIds: readonly string[];
  };
  continuity?: {
    scope: string;
    incarnation: string;
    spoilerTier: 'season_1' | 'season_2';
    guardrails: readonly string[];
  };
}

/** New routes use the V3 bible. Legacy routes are kept verbatim for old saves. */
export const STORY_ROUTES: Readonly<Record<string, StoryRoute>> = V3_STORY_ROUTES;
export { LEGACY_STORY_ROUTES };

export function getStoryRoute(fighterId: string, routeVersion: StoryRouteVersion = CURRENT_STORY_ROUTE_VERSION): StoryRoute | undefined {
  const routes = routeVersion === 1 ? LEGACY_STORY_ROUTES : routeVersion === 3 ? STORY_ROUTES : undefined;
  return routes && Object.hasOwn(routes, fighterId) ? routes[fighterId] : undefined;
}

export interface NarrativeFilters {
  allowSeasonTwo?: boolean;
  routeVersion?: StoryRouteVersion;
}

export function storyAvailable(fighterId: string, rosterIds: readonly string[], filters: NarrativeFilters = {}): boolean {
  const route = getStoryRoute(fighterId, filters.routeVersion);
  return Boolean(route && rosterIds.includes(fighterId)
    && !(filters.allowSeasonTwo === false && route.continuity?.spoilerTier === 'season_2')
    && route.chapters.every(chapter => rosterIds.includes(chapter.opponent)));
}

export type StoryBeat = 'intro' | 'rival' | 'ending';

/** No V3 illustration has been matched to its new brief; render stage + portraits. */
export function storyIllustration(fighterId: string, kind: StoryBeat, routeVersion: StoryRouteVersion = CURRENT_STORY_ROUTE_VERSION): string | undefined {
  return routeVersion === 1 ? legacyStoryIllustration(fighterId, kind) : undefined;
}
