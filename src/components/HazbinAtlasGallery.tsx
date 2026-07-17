import { useState } from 'react';
import { ChevronDown, EyeOff, Images, Sparkles } from 'lucide-react';
import type { HazbinSpriteSheet } from '../data/hazbin-directory';

interface HazbinAtlasGalleryProps {
  sheets: readonly HazbinSpriteSheet[];
  hiddenSheetCount?: number;
}

const ATLAS_GROUP_SIZE = 4;
const GROUP_LABELS = [
  'Distribution principale déjà illustrée',
  'Pouvoirs établis et premières extensions',
  'Saison 2 et habitants de Pentagram City',
  'Familles, héritage et continuités séparées',
  'Histoire humaine et rôles transversaux',
] as const;

const createGroups = (sheets: readonly HazbinSpriteSheet[]) => Array.from(
  { length: Math.ceil(sheets.length / ATLAS_GROUP_SIZE) },
  (_, index) => ({
    id: `hazbin-atlas-volume-${index + 1}`,
    label: GROUP_LABELS[index] || `Archives Hazbin ${index + 1}`,
    sheets: sheets.slice(index * ATLAS_GROUP_SIZE, (index + 1) * ATLAS_GROUP_SIZE),
  }),
);

export function HazbinAtlasGallery({ sheets, hiddenSheetCount = 0 }: HazbinAtlasGalleryProps) {
  const [openGroupId, setOpenGroupId] = useState<string | null>('hazbin-atlas-volume-1');
  const [failedSheetIds, setFailedSheetIds] = useState<Set<string>>(() => new Set());
  const groups = createGroups(sheets);
  const readyCount = sheets.filter(({ assetStatus }) => assetStatus === 'ready').length;
  const plannedCount = sheets.length - readyCount;

  const markSheetFailed = (sheetId: string) => {
    setFailedSheetIds((current) => {
      if (current.has(sheetId)) return current;
      const next = new Set(current);
      next.add(sheetId);
      return next;
    });
  };

  return (
    <section className="hazbin-directory-section" aria-labelledby="hazbin-atlases-title">
      <div className="hazbin-section-header">
        <div>
          <span>Pipeline d’illustrations OpenAI</span>
          <h2 id="hazbin-atlases-title">Atlas de sprites Hazbin</h2>
          <p>
            {plannedCount > 0
              ? `${readyCount} atlas disponibles et ${plannedCount} planche${plannedCount > 1 ? 's' : ''} encore planifiée${plannedCount > 1 ? 's' : ''}.`
              : `${readyCount} atlas disponibles dans ce filtre, avec portraits et poses de combat publiés.`}
          </p>
        </div>
        {hiddenSheetCount > 0 ? (
          <span className="hazbin-directory-count">
            <EyeOff size={13} aria-hidden="true" /> {hiddenSheetCount} atlas masqués par le filtre spoilers
          </span>
        ) : (
          <Images size={28} aria-hidden="true" />
        )}
      </div>

      <div className="hazbin-atlas-accordion">
        {groups.map((group) => {
          const isOpen = openGroupId === group.id;
          const buttonId = `${group.id}-button`;
          const panelId = `${group.id}-panel`;
          const plannedCount = group.sheets.filter(({ assetStatus }) => assetStatus === 'planned').length;

          return (
            <section key={group.id} className="hazbin-atlas-group glass-panel">
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenGroupId((current) => current === group.id ? null : group.id)}
                >
                  <span>
                    {group.label}
                    <small>
                      {group.sheets.length} atlas
                      {plannedCount > 0 ? ` · ${plannedCount} planifié${plannedCount > 1 ? 's' : ''}` : ' · disponibles'}
                    </small>
                  </span>
                  <ChevronDown size={20} aria-hidden="true" />
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
                {isOpen && (
                  <div className="hazbin-sprite-grid">
                    {group.sheets.map((sheet) => (
                      <figure key={sheet.id} className="hazbin-sprite-sheet">
                        {sheet.assetStatus === 'ready' && !failedSheetIds.has(sheet.id) ? (
                          <img
                            src={sheet.path}
                            alt={`Atlas de sprites : ${sheet.characters.join(', ')}`}
                            loading="lazy"
                            decoding="async"
                            width={1536}
                            height={1024}
                            onError={() => markSheetFailed(sheet.id)}
                          />
                        ) : (
                          <div
                            className="hazbin-sprite-sheet__fallback"
                            role="img"
                            aria-label={sheet.assetStatus === 'ready'
                              ? `Aperçu indisponible pour ${sheet.characters.join(', ')}`
                              : `Atlas planifié pour ${sheet.characters.join(', ')}`}
                          >
                            <Sparkles size={30} aria-hidden="true" />
                            <span>
                              {sheet.assetStatus === 'ready'
                                ? 'L’atlas publié n’a pas pu être chargé'
                                : 'Atlas prêt pour génération'}
                            </span>
                          </div>
                        )}
                        <figcaption>
                          <div>
                            <strong>{sheet.title}</strong>
                            <span>{sheet.characters.join(' · ')}</span>
                          </div>
                          <small className={`is-${sheet.assetStatus}`}>
                            {sheet.assetStatus === 'ready' ? 'Disponible' : 'Planifié'}
                          </small>
                        </figcaption>
                        <p>{sheet.continuity}</p>
                      </figure>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
