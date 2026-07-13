import { CanonStatus, LoreEntry, SourceType, SpoilerLevel, TimelineScope } from '../types';

export type LoreIssue =
  | 'missing_source_ref'
  | 'invalid_source_format'
  | 'source_status_contradiction'
  | 'unconfirmed_status'
  | 'timeline_spoiler_contradiction'
  | 'duplicate_id'
  | 'duplicate_entry'
  | 'empty_description';

export interface LoreGap {
  entryId: string;
  entryTitle: string;
  issue: LoreIssue;
  message: string;
  severity: 'warning' | 'error';
}

const EPISODE_REFERENCE = /^S(?:1|2)E0?[1-8](?:\s*[,;]\s*S(?:1|2)E0?[1-8])*$/i;
const PILOT_REFERENCE = /^PILOT-2019$/i;
const OFFICIAL_URL = /^https:\/\/(?:www\.)?(?:primevideo\.com|aboutamazon\.com|a24films\.com|youtube\.com|youtu\.be)\//i;

const TIMELINE_RANK: Record<TimelineScope, number> = {
  pilot_legacy: 0,
  season_1_start: 1,
  season_1_end: 2,
  season_2: 3,
  custom: 4
};

const assertedCanon = (status: CanonStatus) => status === 'canon' || status === 'semi_canon';
const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');

export class LoreValidation {
  /** Pilot-only records stay isolated from the Prime Video series timeline. */
  public static isAvailableAtTimeline(contentScope: TimelineScope, activeScope: TimelineScope): boolean {
    if (activeScope === 'custom') return true;
    if (contentScope === 'custom') return false;
    if (contentScope === 'pilot_legacy' || activeScope === 'pilot_legacy') {
      return contentScope === activeScope;
    }
    return TIMELINE_RANK[contentScope] <= TIMELINE_RANK[activeScope];
  }

  public static isValidSourceReference(sourceType: SourceType, sourceRef: string): boolean {
    const ref = sourceRef.trim();
    if (!ref) return sourceType === 'user_manual_note' || sourceType === 'other';

    switch (sourceType) {
      case 'episode':
        return EPISODE_REFERENCE.test(ref);
      case 'official_pilot':
        return PILOT_REFERENCE.test(ref) || OFFICIAL_URL.test(ref);
      case 'official_page':
      case 'creator_statement':
        return OFFICIAL_URL.test(ref);
      case 'user_manual_note':
      case 'other':
        return true;
    }
  }

  public static isValidGeneralSourceReference(sourceRef: string): boolean {
    const ref = sourceRef.trim();
    return EPISODE_REFERENCE.test(ref) || PILOT_REFERENCE.test(ref) || OFFICIAL_URL.test(ref);
  }

  public static getTimelineSpoilerError(timeline: TimelineScope, spoiler: SpoilerLevel): string | null {
    if (timeline === 'pilot_legacy' && spoiler !== 'none') {
      return 'Pilot legacy records must stay in the no-spoiler pilot tier.';
    }
    if (timeline === 'season_1_end' && spoiler === 'none') {
      return 'Season 1 finale records must be marked as Season 1 spoilers.';
    }
    if (timeline === 'season_2' && spoiler !== 'season_2' && spoiler !== 'future') {
      return 'Season 2 records must be marked as Season 2 spoilers.';
    }
    return null;
  }

  public static validateCharacterMetadata(
    canonStatus: CanonStatus,
    sourceRef: string,
    timeline: TimelineScope,
    spoiler: SpoilerLevel
  ): string[] {
    const errors: string[] = [];
    if (assertedCanon(canonStatus) && !sourceRef.trim()) {
      errors.push('Canon and semi-canon profiles require a source reference.');
    } else if (assertedCanon(canonStatus) && !this.isValidGeneralSourceReference(sourceRef)) {
      errors.push('Use S1E01-S1E08, S2E01-S2E08, PILOT-2019, or an official Prime Video/Amazon/A24 URL.');
    }
    const timelineError = this.getTimelineSpoilerError(timeline, spoiler);
    if (timelineError) errors.push(timelineError);
    if (canonStatus === 'canon' && spoiler === 'future') {
      errors.push('Future speculation cannot be labeled as episode canon.');
    }
    if (PILOT_REFERENCE.test(sourceRef.trim()) && timeline !== 'pilot_legacy') {
      errors.push('PILOT-2019 belongs only to the isolated pilot legacy scope.');
    }
    if (EPISODE_REFERENCE.test(sourceRef.trim()) && timeline === 'pilot_legacy') {
      errors.push('Prime Video episode references cannot be filed in pilot legacy scope.');
    }
    return errors;
  }

  /** Scans citations, classification, duplicates and timeline/spoiler coherence. */
  public static validateLoreEntries(entries: LoreEntry[]): LoreGap[] {
    const gaps: LoreGap[] = [];
    const ids = new Map<string, number>();
    const identities = new Map<string, number>();

    for (const entry of entries) {
      ids.set(entry.id, (ids.get(entry.id) ?? 0) + 1);
      const identity = `${normalize(entry.title)}::${normalize(entry.entityName)}`;
      identities.set(identity, (identities.get(identity) ?? 0) + 1);
    }

    for (const entry of entries) {
      const add = (issue: LoreIssue, message: string, severity: 'warning' | 'error') => gaps.push({
        entryId: entry.id,
        entryTitle: entry.title,
        issue,
        message,
        severity
      });

      if (!entry.description?.trim()) {
        add('empty_description', `The entry '${entry.title}' exists but lacks details/description.`, 'warning');
      }

      if (entry.canonStatus === 'unknown') {
        add('unconfirmed_status', `The entry '${entry.title}' is marked as an unknown verification status.`, 'warning');
      }

      const hasSourceRef = Boolean(entry.sourceRef?.trim());
      if (assertedCanon(entry.canonStatus) && !hasSourceRef) {
        add('missing_source_ref', `The entry '${entry.title}' is marked as '${entry.canonStatus}' but is missing a source reference.`, 'error');
      } else if (hasSourceRef && !this.isValidSourceReference(entry.sourceType, entry.sourceRef)) {
        add('invalid_source_format', `Source '${entry.sourceRef}' does not match the selected source type '${entry.sourceType}'.`, 'error');
      }

      const isSimulation = entry.canonStatus === 'simulation_au' || entry.canonStatus === 'headcanon' || entry.canonStatus === 'user_note';
      if (isSimulation && entry.sourceType !== 'user_manual_note') {
        add('source_status_contradiction', 'Simulation, headcanon and user notes must use the user-manual source type, not an official source type.', 'error');
      }
      if (entry.canonStatus === 'canon' && entry.sourceType === 'creator_statement') {
        add('source_status_contradiction', 'Creator statements are semi-canon unless the claim is also cited to an episode.', 'error');
      }
      if (assertedCanon(entry.canonStatus) && (entry.sourceType === 'user_manual_note' || entry.sourceType === 'other')) {
        add('source_status_contradiction', 'Canon and semi-canon claims require an official episode, pilot, page or creator-statement source.', 'error');
      }
      if (entry.canonStatus === 'semi_canon' && (entry.sourceType === 'episode' || entry.sourceType === 'official_pilot')) {
        add('source_status_contradiction', 'Episode and official-pilot evidence should be classified as canon for that continuity.', 'error');
      }
      if (entry.canonStatus === 'canon' && entry.spoilerLevel === 'future') {
        add('source_status_contradiction', 'Future speculation cannot be labeled as episode canon.', 'error');
      }

      const timelineError = this.getTimelineSpoilerError(entry.timelineScope, entry.spoilerLevel);
      if (timelineError) add('timeline_spoiler_contradiction', timelineError, 'error');

      if (entry.sourceType === 'official_pilot' && entry.timelineScope !== 'pilot_legacy') {
        add('timeline_spoiler_contradiction', 'Official pilot evidence belongs only to the isolated pilot legacy scope.', 'error');
      }
      if (entry.sourceType === 'episode' && entry.timelineScope === 'pilot_legacy') {
        add('timeline_spoiler_contradiction', 'Prime Video episode evidence cannot be filed in pilot legacy scope.', 'error');
      }

      if (/S2E0?[1-8]/i.test(entry.sourceRef) && entry.timelineScope !== 'season_2') {
        add('timeline_spoiler_contradiction', 'A Season 2 episode citation must use the Season 2 timeline scope.', 'error');
      }
      if (/S1E0?8/i.test(entry.sourceRef) && entry.timelineScope !== 'season_1_end') {
        add('timeline_spoiler_contradiction', 'A Season 1 finale citation must use the Season 1 end scope.', 'error');
      }

      if ((ids.get(entry.id) ?? 0) > 1) {
        add('duplicate_id', `Duplicate lore id '${entry.id}' would make updates ambiguous.`, 'error');
      }
      const identity = `${normalize(entry.title)}::${normalize(entry.entityName)}`;
      if ((identities.get(identity) ?? 0) > 1) {
        add('duplicate_entry', `Duplicate title/entity pair '${entry.title}' / '${entry.entityName}'.`, 'warning');
      }
    }

    return gaps;
  }
}
