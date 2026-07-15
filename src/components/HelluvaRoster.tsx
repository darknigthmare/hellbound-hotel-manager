import { useState } from 'react';
import { EyeOff } from 'lucide-react';
import type {
  HelluvaCharacterProfile,
  HelluvaRosterTier,
} from '../expansions/helluva-boss/data';

export const HELLUVA_ROSTER_PAGE_SIZE = 12;

type HelluvaRosterFilter = 'all' | HelluvaRosterTier;

interface HelluvaRosterProps {
  characters: readonly HelluvaCharacterProfile[];
  totalProfileCount: number;
  hiddenProfileCount: number;
  hiddenContentLabel: string | null;
}

const FILTER_OPTIONS = [
  { id: 'all', label: 'Tous' },
  { id: 'primary', label: 'Principaux' },
  { id: 'supporting', label: 'Soutien' },
  { id: 'secondary', label: 'Secondaires' },
] as const satisfies readonly { id: HelluvaRosterFilter; label: string }[];

const TIER_LABELS: Record<HelluvaRosterTier, string> = {
  primary: 'Principal',
  supporting: 'Soutien',
  secondary: 'Secondaire',
};

const getInitials = (name: string) => name
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map((part) => part[0] || '')
  .join('')
  .toUpperCase() || '?';

export function HelluvaRoster({
  characters,
  totalProfileCount,
  hiddenProfileCount,
  hiddenContentLabel,
}: HelluvaRosterProps) {
  const [activeFilter, setActiveFilter] = useState<HelluvaRosterFilter>('all');
  const [page, setPage] = useState(1);
  const [failedPortraitIds, setFailedPortraitIds] = useState<Set<string>>(() => new Set());

  const tierCounts: Record<HelluvaRosterTier, number> = {
    primary: characters.filter(({ rosterTier }) => rosterTier === 'primary').length,
    supporting: characters.filter(({ rosterTier }) => rosterTier === 'supporting').length,
    secondary: characters.filter(({ rosterTier }) => rosterTier === 'secondary').length,
  };
  const filterCounts: Record<HelluvaRosterFilter, number> = {
    all: characters.length,
    ...tierCounts,
  };
  const filteredCharacters = activeFilter === 'all'
    ? characters
    : characters.filter(({ rosterTier }) => rosterTier === activeFilter);
  const pageCount = Math.max(1, Math.ceil(filteredCharacters.length / HELLUVA_ROSTER_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const firstVisibleIndex = (currentPage - 1) * HELLUVA_ROSTER_PAGE_SIZE;
  const pageCharacters = filteredCharacters.slice(
    firstVisibleIndex,
    firstVisibleIndex + HELLUVA_ROSTER_PAGE_SIZE,
  );
  const firstVisibleNumber = filteredCharacters.length === 0 ? 0 : firstVisibleIndex + 1;
  const lastVisibleNumber = firstVisibleIndex + pageCharacters.length;

  const changeFilter = (nextFilter: HelluvaRosterFilter) => {
    setActiveFilter(nextFilter);
    setPage(1);
  };

  const markPortraitFailed = (characterId: string) => {
    setFailedPortraitIds((current) => new Set(current).add(characterId));
  };

  return (
    <section aria-labelledby="helluva-roster-title">
      <div className="helluva-section-header">
        <div>
          <span>Canon reference directory</span>
          <h2 id="helluva-roster-title">Character profiles · {characters.length}/{totalProfileCount}</h2>
          <p>{totalProfileCount} gameplay portraits keep the extension visual without registering anyone as a hotel resident.</p>
        </div>
        {hiddenProfileCount > 0 && (
          <span className="helluva-hidden-count">
            <EyeOff size={14} aria-hidden="true" /> {hiddenProfileCount} {hiddenContentLabel || 'spoiler-hidden'} profiles hidden
          </span>
        )}
      </div>

      <div className="helluva-roster-toolbar">
        <div className="helluva-roster-filters" role="group" aria-label="Filter character roster">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={activeFilter === option.id ? 'is-active' : undefined}
              aria-pressed={activeFilter === option.id}
              aria-label={`${option.label}: ${filterCounts[option.id]} profiles`}
              onClick={() => changeFilter(option.id)}
            >
              {option.label}<span aria-hidden="true">{filterCounts[option.id]}</span>
            </button>
          ))}
        </div>
        <p className="helluva-roster-status" aria-live="polite" aria-atomic="true">
          {filteredCharacters.length === 0
            ? 'No profiles match this filter.'
            : `Showing ${firstVisibleNumber}–${lastVisibleNumber} of ${filteredCharacters.length} profiles.`}
        </p>
      </div>

      {pageCharacters.length > 0 ? (
        <div className="helluva-character-grid" aria-label="Character profile results">
          {pageCharacters.map((character) => (
            <article
              key={character.id}
              id={`helluva-character-${character.id}`}
              className="helluva-character glass-panel"
              aria-labelledby={`${character.id}-name`}
            >
              <div className="helluva-character__portrait">
                <span aria-hidden="true">{getInitials(character.name)}</span>
                {!failedPortraitIds.has(character.id) && (
                  <img
                    src={character.portrait}
                    alt={`OpenAI gameplay portrait of ${character.name}`}
                    loading="lazy"
                    decoding="async"
                    width={512}
                    height={512}
                    onError={() => markPortraitFailed(character.id)}
                  />
                )}
              </div>
              <div className="helluva-character__body">
                <div className="helluva-character__heading">
                  <div>
                    <h3 id={`${character.id}-name`}>{character.name}</h3>
                    <span>{character.alias}</span>
                  </div>
                  <div className="helluva-character__badges">
                    <span className={`helluva-roster-tier is-${character.rosterTier}`}>
                      {TIER_LABELS[character.rosterTier]}
                    </span>
                    <span className="helluva-canon-badge">Canon reference</span>
                  </div>
                </div>
                <p>{character.description}</p>
                <dl>
                  <div><dt>Demon type / rank</dt><dd>{character.species}</dd></div>
                  <div><dt>Role</dt><dd>{character.role}</dd></div>
                  <div><dt>Affiliation</dt><dd>{character.affiliation}</dd></div>
                </dl>
                <div className="helluva-character__note">
                  <strong>Continuity note</strong>
                  <p>{character.canonNote}</p>
                  <small>{character.sourceRef}</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="helluva-roster-empty glass-panel">No visible profile is assigned to this category.</div>
      )}

      {pageCount > 1 && (
        <nav className="helluva-roster-pagination" aria-label="Character roster pages">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setPage(Math.max(1, currentPage - 1))}
          >
            Previous
          </button>
          <div aria-label={`Page ${currentPage} of ${pageCount}`}>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                className={pageNumber === currentPage ? 'is-active' : undefined}
                aria-label={`Page ${pageNumber}`}
                aria-current={pageNumber === currentPage ? 'page' : undefined}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={currentPage === pageCount}
            onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
