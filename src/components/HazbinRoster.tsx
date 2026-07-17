import { useState } from 'react';
import { EyeOff, Swords } from 'lucide-react';
import type {
  HazbinCanonStatus,
  HazbinDirectoryCategory,
  HazbinDirectoryProfile,
  HazbinRosterTier,
} from '../data/hazbin-directory';

export const HAZBIN_ROSTER_PAGE_SIZE = 12;

type HazbinTierFilter = 'all' | HazbinRosterTier;
type HazbinCategoryFilter = 'all' | HazbinDirectoryCategory;
type HazbinCanonFilter = 'all' | HazbinCanonStatus;

interface HazbinRosterProps {
  profiles: readonly HazbinDirectoryProfile[];
  searchQuery?: string;
  totalProfileCount?: number;
  hiddenProfileCount?: number;
}

const TIER_OPTIONS = [
  { id: 'all', label: 'Tous' },
  { id: 'primary', label: 'Principaux' },
  { id: 'supporting', label: 'Soutien' },
  { id: 'secondary', label: 'Secondaires' },
] as const satisfies readonly { id: HazbinTierFilter; label: string }[];

const CATEGORY_LABELS: Record<HazbinDirectoryCategory, string> = {
  hotel: 'Hôtel',
  hell: 'Habitants de l’Enfer',
  heaven: 'Paradis',
  overlord: 'Overlords',
  family: 'Familles',
  legacy: 'Héritage',
  human: 'Histoire humaine',
  simulation_au: 'Simulation AU',
};

const CANON_LABELS: Record<HazbinCanonStatus, string> = {
  canon: 'Canon',
  semi_canon: 'Semi-canon',
  pilot_legacy: 'Héritage pilote',
  simulation_au: 'Simulation AU',
};

const TIER_LABELS: Record<HazbinRosterTier, string> = {
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

const normalize = (value: string) => value.trim().toLocaleLowerCase('fr');

export function HazbinRoster({
  profiles,
  searchQuery = '',
  totalProfileCount = profiles.length,
  hiddenProfileCount = 0,
}: HazbinRosterProps) {
  const [tierFilter, setTierFilter] = useState<HazbinTierFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<HazbinCategoryFilter>('all');
  const [canonFilter, setCanonFilter] = useState<HazbinCanonFilter>('all');
  const [pagination, setPagination] = useState({ page: 1, searchQuery });
  const [failedPortraitIds, setFailedPortraitIds] = useState<Set<string>>(() => new Set());
  const page = pagination.searchQuery === searchQuery ? pagination.page : 1;
  const setPage = (nextPage: number) => setPagination({ page: nextPage, searchQuery });

  const tierCounts: Record<HazbinTierFilter, number> = {
    all: profiles.length,
    primary: profiles.filter(({ rosterTier }) => rosterTier === 'primary').length,
    supporting: profiles.filter(({ rosterTier }) => rosterTier === 'supporting').length,
    secondary: profiles.filter(({ rosterTier }) => rosterTier === 'secondary').length,
  };
  const query = normalize(searchQuery);
  const filteredProfiles = profiles.filter((entry) => {
    if (tierFilter !== 'all' && entry.rosterTier !== tierFilter) return false;
    if (categoryFilter !== 'all' && entry.category !== categoryFilter) return false;
    if (canonFilter !== 'all' && entry.canonStatus !== canonFilter) return false;
    if (!query) return true;
    return [entry.name, entry.alias, entry.role, entry.bio, entry.sourceLabel]
      .some((value) => normalize(value).includes(query));
  });
  const pageCount = Math.max(1, Math.ceil(filteredProfiles.length / HAZBIN_ROSTER_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const firstVisibleIndex = (currentPage - 1) * HAZBIN_ROSTER_PAGE_SIZE;
  const pageProfiles = filteredProfiles.slice(
    firstVisibleIndex,
    firstVisibleIndex + HAZBIN_ROSTER_PAGE_SIZE,
  );
  const firstVisibleNumber = filteredProfiles.length === 0 ? 0 : firstVisibleIndex + 1;
  const lastVisibleNumber = firstVisibleIndex + pageProfiles.length;

  const resetPage = () => setPage(1);

  const markPortraitFailed = (profileId: string) => {
    setFailedPortraitIds((current) => {
      if (current.has(profileId)) return current;
      const next = new Set(current);
      next.add(profileId);
      return next;
    });
  };

  return (
    <section className="hazbin-directory-section" aria-labelledby="hazbin-roster-title">
      <div className="hazbin-section-header">
        <div>
          <span>Répertoire de référence séparé</span>
          <h2 id="hazbin-roster-title">Annuaire Hazbin · {totalProfileCount} profils</h2>
          <p>Les fiches documentaires n’ajoutent aucun résident, contrat ou score à votre sauvegarde.</p>
        </div>
        <span className="hazbin-directory-count">
          {profiles.filter(({ fighterEligible }) => fighterEligible).length} profils éligibles au combat
          {hiddenProfileCount > 0 && (
            <><EyeOff size={13} aria-hidden="true" /> {hiddenProfileCount} masqués par le filtre spoilers</>
          )}
        </span>
      </div>

      <div className="hazbin-roster-toolbar glass-panel">
        <div className="hazbin-roster-filters" role="group" aria-label="Filtrer l’annuaire par importance">
          {TIER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={tierFilter === option.id ? 'is-active' : undefined}
              aria-pressed={tierFilter === option.id}
              aria-label={`${option.label} : ${tierCounts[option.id]} profils`}
              onClick={() => {
                setTierFilter(option.id);
                resetPage();
              }}
            >
              {option.label}<span aria-hidden="true">{tierCounts[option.id]}</span>
            </button>
          ))}
        </div>

        <div className="hazbin-roster-selects">
          <div>
            <label htmlFor="hazbin-category-filter">Catégorie</label>
            <select
              id="hazbin-category-filter"
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value as HazbinCategoryFilter);
                resetPage();
              }}
            >
              <option value="all">Toutes les catégories</option>
              {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="hazbin-canon-filter">Continuité</label>
            <select
              id="hazbin-canon-filter"
              value={canonFilter}
              onChange={(event) => {
                setCanonFilter(event.target.value as HazbinCanonFilter);
                resetPage();
              }}
            >
              <option value="all">Toutes les continuités</option>
              {Object.entries(CANON_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="hazbin-roster-status" aria-live="polite" aria-atomic="true">
          {filteredProfiles.length === 0
            ? 'Aucun profil ne correspond à ces filtres.'
            : `Profils ${firstVisibleNumber}–${lastVisibleNumber} sur ${filteredProfiles.length}.`}
        </p>
      </div>

      {pageProfiles.length > 0 ? (
        <div className="hazbin-character-grid" aria-label="Résultats de l’annuaire Hazbin">
          {pageProfiles.map((entry) => (
            <article
              key={entry.id}
              id={`hazbin-profile-${entry.id}`}
              className="hazbin-character glass-panel"
              aria-labelledby={`hazbin-profile-name-${entry.id}`}
            >
              <div className="hazbin-character__portrait">
                <span aria-hidden="true">{getInitials(entry.name)}</span>
                {entry.assetStatus === 'ready' && !failedPortraitIds.has(entry.id) && (
                  <img
                    src={entry.portrait}
                    alt={`Portrait de référence de ${entry.name}`}
                    loading="lazy"
                    decoding="async"
                    width={512}
                    height={512}
                    onError={() => markPortraitFailed(entry.id)}
                  />
                )}
                {entry.assetStatus === 'planned' && (
                  <small className="hazbin-character__asset-state">Illustration planifiée</small>
                )}
                {entry.assetStatus === 'reference_unavailable' && (
                  <small className="hazbin-character__asset-state is-unavailable">
                    Aucun design canon publié
                  </small>
                )}
              </div>
              <div className="hazbin-character__body">
                <div className="hazbin-character__heading">
                  <div>
                    <h3 id={`hazbin-profile-name-${entry.id}`}>{entry.name}</h3>
                    <span>{entry.alias}</span>
                  </div>
                  <div className="hazbin-character__badges">
                    <span className={`hazbin-roster-tier is-${entry.rosterTier}`}>
                      {TIER_LABELS[entry.rosterTier]}
                    </span>
                    <span className={`hazbin-canon-badge is-${entry.canonStatus}`}>
                      {CANON_LABELS[entry.canonStatus]}
                    </span>
                  </div>
                </div>
                <p>{entry.bio}</p>
                <dl>
                  <div><dt>Catégorie</dt><dd>{CATEGORY_LABELS[entry.category]}</dd></div>
                  <div><dt>Rôle</dt><dd>{entry.role}</dd></div>
                  <div><dt>Repère</dt><dd>{entry.timeline.replace('_', ' ')}</dd></div>
                </dl>
                <div className="hazbin-character__source">
                  <strong>Source / périmètre</strong>
                  <small>{entry.sourceLabel}</small>
                </div>
                {entry.fighterEligible && (
                  <span className="hazbin-fighter-eligibility">
                    <Swords size={13} aria-hidden="true" /> Combat prévu
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="hazbin-roster-empty glass-panel">Aucune fiche visible dans cette sélection.</div>
      )}

      {pageCount > 1 && (
        <nav className="hazbin-roster-pagination" aria-label="Pages de l’annuaire Hazbin">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setPage(Math.max(1, currentPage - 1))}
          >
            Précédent
          </button>
          <div aria-label={`Page ${currentPage} sur ${pageCount}`}>
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
            Suivant
          </button>
        </nav>
      )}
    </section>
  );
}
