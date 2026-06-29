import { LoreEntry } from '../types';

export interface LoreGap {
  entryId: string;
  entryTitle: string;
  issue: 'missing_source_ref' | 'unconfirmed_status' | 'needs_timeline_review' | 'empty_description';
  message: string;
  severity: 'warning' | 'error';
}

export class LoreValidation {
  /**
   * Scans all lore entries and returns a list of verification gaps or incomplete logs.
   */
  public static validateLoreEntries(entries: LoreEntry[]): LoreGap[] {
    const gaps: LoreGap[] = [];

    for (const entry of entries) {
      // 1. Check for empty descriptions
      if (!entry.description || entry.description.trim() === '') {
        gaps.push({
          entryId: entry.id,
          entryTitle: entry.title,
          issue: 'empty_description',
          message: `The entry '${entry.title}' exists but lacks details/description.`,
          severity: 'warning'
        });
      }

      // 2. Check for unknown status
      if (entry.canonStatus === 'unknown') {
        gaps.push({
          entryId: entry.id,
          entryTitle: entry.title,
          issue: 'unconfirmed_status',
          message: `The entry '${entry.title}' is marked as 'unknown' verification status.`,
          severity: 'warning'
        });
      }

      // 3. Canon/Semi-canon entries MUST have a source reference
      const isAssertedCanon = entry.canonStatus === 'canon' || entry.canonStatus === 'semi_canon';
      const hasSourceRef = entry.sourceRef && entry.sourceRef.trim() !== '';

      if (isAssertedCanon && !hasSourceRef) {
        gaps.push({
          entryId: entry.id,
          entryTitle: entry.title,
          issue: 'missing_source_ref',
          message: `The entry '${entry.title}' is marked as '${entry.canonStatus}' but is missing a source reference.`,
          severity: 'error'
        });
      }
    }

    return gaps;
  }
}
