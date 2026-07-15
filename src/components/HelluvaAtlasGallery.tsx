import { useState } from 'react';
import { ChevronDown, EyeOff, Images } from 'lucide-react';
import type { HelluvaSpriteSheet } from '../expansions/helluva-boss/data';
import { isHelluvaBossSpoilerVisible } from '../expansions/helluva-boss/spoilers';
import type { HelluvaBossSpoilerScope } from '../types';

interface HelluvaAtlasGalleryProps {
  sheets: readonly HelluvaSpriteSheet[];
  spoilerScope: HelluvaBossSpoilerScope;
  hiddenContentLabel: string | null;
}

const ATLAS_GROUP_SIZE = 4;
const ATLAS_GROUP_LABELS = [
  'Core cast & first encounters',
  'Origins, rivals & operatives',
  'Powers, legacies & underworld',
  'Secondary encounters',
] as const;

const createAtlasGroups = (sheets: readonly HelluvaSpriteSheet[]) => Array.from(
  { length: Math.ceil(sheets.length / ATLAS_GROUP_SIZE) },
  (_, index) => ({
    id: `helluva-atlas-volume-${index + 1}`,
    label: ATLAS_GROUP_LABELS[index] || `Atlas archive ${index + 1}`,
    sheets: sheets.slice(index * ATLAS_GROUP_SIZE, (index + 1) * ATLAS_GROUP_SIZE),
  }),
);

export function HelluvaAtlasGallery({
  sheets,
  spoilerScope,
  hiddenContentLabel,
}: HelluvaAtlasGalleryProps) {
  const [openGroupId, setOpenGroupId] = useState<string | null>('helluva-atlas-volume-1');
  const [failedSheetIds, setFailedSheetIds] = useState<Set<string>>(() => new Set());
  const visibleSheets = sheets.filter((sheet) => (
    isHelluvaBossSpoilerVisible(spoilerScope, sheet.spoilerScope)
  ));
  const visibleSheetIds = new Set(visibleSheets.map(({ id }) => id));
  const visibleGroups = createAtlasGroups(sheets)
    .map((group) => ({
      ...group,
      sheets: group.sheets.filter(({ id }) => visibleSheetIds.has(id)),
    }))
    .filter((group) => group.sheets.length > 0);
  const hiddenSheetCount = sheets.length - visibleSheets.length;

  const markSheetFailed = (sheetId: string) => {
    setFailedSheetIds((current) => new Set(current).add(sheetId));
  };

  return (
    <section aria-labelledby="helluva-sprites-title">
      <div className="helluva-section-header">
        <div>
          <span>OpenAI-generated gameplay art</span>
          <h2 id="helluva-sprites-title">Sprite atlases</h2>
          <p>{visibleSheets.length} visible sheets cover the current reference profiles across six gameplay poses each.</p>
        </div>
        {hiddenSheetCount > 0 ? (
          <span className="helluva-hidden-count">
            <EyeOff size={14} aria-hidden="true" /> {hiddenSheetCount} {hiddenContentLabel || 'spoiler-hidden'} {hiddenSheetCount === 1 ? 'atlas' : 'atlases'} hidden
          </span>
        ) : (
          <Images size={28} aria-hidden="true" />
        )}
      </div>

      <div className="helluva-atlas-accordion">
        {visibleGroups.map((group) => {
          const isOpen = openGroupId === group.id;
          const buttonId = `${group.id}-button`;
          const panelId = `${group.id}-panel`;
          return (
            <section key={group.id} className="helluva-atlas-group glass-panel">
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
                    <small>{group.sheets.length} {group.sheets.length === 1 ? 'atlas' : 'atlases'}</small>
                  </span>
                  <ChevronDown size={20} aria-hidden="true" />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
              >
                {isOpen && (
                  <div className="helluva-sprite-grid">
                    {group.sheets.map((sheet) => (
                      <figure key={sheet.id} className="helluva-sprite-sheet">
                        {!failedSheetIds.has(sheet.id) ? (
                          <img
                            src={sheet.path}
                            alt={`OpenAI sprite atlas featuring ${sheet.characters.join(', ')}`}
                            loading="lazy"
                            decoding="async"
                            width={1536}
                            height={1024}
                            onError={() => markSheetFailed(sheet.id)}
                          />
                        ) : (
                          <div className="helluva-sprite-sheet__fallback" role="img" aria-label={`Sprite atlas pending for ${sheet.characters.join(', ')}`}>
                            <Images size={30} aria-hidden="true" />
                            <span>Atlas asset pending</span>
                          </div>
                        )}
                        <figcaption>
                          <strong>{sheet.characters.join(' · ')}</strong>
                          <span>6 poses per character</span>
                        </figcaption>
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
