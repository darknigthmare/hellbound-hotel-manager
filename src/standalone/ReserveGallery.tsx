import { useEffect, useRef, useState, type Ref } from 'react';
import reserveCatalogue from '../../art/infernal-versus/production/reserve-assets.json';
import { HELLUVA_CHARACTERS } from '../expansions/helluva-boss/data';
import './reserve-gallery.css';

type ReserveKind = 'character_base' | 'support_base' | 'enemy_base' | 'costume_base' | 'narrative_archive' | 'projectile' | 'prop' | 'machine';
interface ReserveAsset {
  id: string;
  name: string;
  kind: ReserveKind;
  franchise?: 'Hazbin Hotel' | 'Helluva Boss';
  continuity?: 'simulation_au';
  spoilerScope?: 'season_1' | 'season_2' | 'season_3';
  frameCoverage?: 'bust' | 'full_body';
  runtimeStatus?: 'reserve' | 'selectable_costume' | 'stage_scenery';
  sourceIdentityId?: string | null;
  reference: string;
  export: string;
  dimensions: number[];
  references: { url: string; kind: string; episode?: string; title?: string }[];
  fidelityNotes: string[];
}
const KINDS: Record<ReserveKind, string> = {
  character_base: 'Personnages', support_base: 'Soutiens', enemy_base: 'Ennemis',
  costume_base: 'Tenues', narrative_archive: 'Archives', projectile: 'Projectiles', prop: 'Accessoires', machine: 'Machines',
};
const STATUS: Record<ReserveKind, string> = {
  character_base: 'Base de personnage en réserve', support_base: 'Personnage de soutien en réserve',
  enemy_base: 'Base d’ennemi en réserve', costume_base: 'Tenue statique en réserve',
  narrative_archive: 'Archive narrative statique', projectile: 'Projectile visuel en réserve', prop: 'Accessoire statique en réserve', machine: 'Machine statique en réserve',
};
const assets = reserveCatalogue.assets as ReserveAsset[];
const assetStatus = (asset: ReserveAsset) => asset.runtimeStatus === 'selectable_costume'
  ? 'Tenue statique disponible dans le vestiaire'
  : asset.runtimeStatus === 'stage_scenery' ? 'Accessoire intégré au décor' : STATUS[asset.kind];

/** Incarnation-specific evidence takes priority over a character's first appearance. */
function spoilerScope(asset: ReserveAsset): 'season_1' | 'season_2' | 'season_3' {
  if (asset.spoilerScope) return asset.spoilerScope;
  const evidence = [asset.reference, ...asset.references.map(reference => reference.episode ?? reference.title ?? '')].join(' ');
  if (/\bS3(?:\s*E\d+)?\b|\b(?:saison|season)\s*3\b/i.test(evidence)) return 'season_3';
  if (/\bS2\s*E|\b(?:saison|season)\s*2\b/i.test(evidence)) return 'season_2';
  if (/\bS1\s*E|\b(?:saison|season)\s*1\b/i.test(evidence)) return 'season_1';
  const character = HELLUVA_CHARACTERS.find(candidate => candidate.id === asset.sourceIdentityId);
  if (character) return character.spoilerScope === 'season_1' ? 'season_1' : 'season_2';
  // Unknown chronology is hidden by the stricter content filter.
  return 'season_2';
}

export function ReserveGallery({ titleRef, allowSeasonTwo, allowSeasonThree, onScopeChange, onSeasonThreeChange }: {
  titleRef: Ref<HTMLHeadingElement>;
  allowSeasonTwo: boolean;
  allowSeasonThree: boolean;
  onScopeChange: (allow: boolean) => void;
  onSeasonThreeChange: (allow: boolean) => void;
}) {
  const [kind, setKind] = useState<ReserveKind | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailTitleRef = useRef<HTMLHeadingElement>(null);
  const selectedCardRef = useRef<HTMLButtonElement | null>(null);
  const eligible = assets.filter(asset => {
    const scope = spoilerScope(asset);
    return scope === 'season_1' || (allowSeasonTwo && (scope !== 'season_3' || allowSeasonThree));
  });
  const visible = eligible.filter(asset => (kind === 'all' || asset.kind === kind)
    && asset.name.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()));
  const selected = visible.find(asset => asset.id === selectedId);
  useEffect(() => {
    if (selected) {
      detailTitleRef.current?.focus();
      detailTitleRef.current?.scrollIntoView?.({ block: 'start' });
    }
  }, [selected]);
  return <section className="iv-reserve-gallery">
    <p className="iv-eyebrow">BASES VISUELLES & OBJETS</p>
    <h1 ref={titleRef} tabIndex={-1}>La galerie des créations</h1>
    <p className="iv-lead">{assets.length} dessins à explorer en plein cadre. Les fiches indiquent leur usage dans le jeu, leurs références et les détails encore à valider.</p>
    <div className="iv-filter-row">
      <label>Catégorie<select value={kind} onChange={event => { setSelectedId(null); setKind(event.target.value as ReserveKind | 'all'); }}><option value="all">Toutes les créations</option>{Object.entries(KINDS).filter(([value]) => assets.some(asset => asset.kind === value)).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Contenu de la galerie<select value={allowSeasonTwo ? (allowSeasonThree ? 'season_3' : 'all') : 'season_1'} onChange={event => { setSelectedId(null); onScopeChange(event.target.value !== 'season_1'); onSeasonThreeChange(event.target.value === 'season_3'); }}><option value="season_1">Saison 1 uniquement</option><option value="all">Saisons 1 et 2</option><option value="season_3">Saisons 1, 2 et 3 — spoilers autorisés</option></select></label>
      <label>Rechercher une création<input value={query} onChange={event => { setSelectedId(null); setQuery(event.target.value); }} placeholder="Personnage, tenue, accessoire…" /></label>
    </div>
    <p className="iv-small" role="status">{visible.length} dessin{visible.length > 1 ? 's' : ''} affiché{visible.length > 1 ? 's' : ''} sur {eligible.length} disponible{eligible.length > 1 ? 's' : ''} avec ce contenu.</p>
    {selected && <article className="iv-panel iv-reserve-detail" aria-label={`Détail de ${selected.name}`}>
      <img src={`/${selected.export.replace(/^public\//, '')}`} alt={selected.name} />
      <div><p className="iv-eyebrow">{KINDS[selected.kind]}{selected.continuity === 'simulation_au' ? ' · CRÉATION ORIGINALE AU' : ''}{spoilerScope(selected) === 'season_3' ? ' · SAISON 3' : ''}</p><h2 ref={detailTitleRef} tabIndex={-1}>{selected.name}</h2><p>{assetStatus(selected)}{selected.frameCoverage === 'bust' ? ' · Buste' : selected.frameCoverage === 'full_body' ? ' · Silhouette entière' : ''} · {selected.dimensions.join(' × ')} pixels.</p><p className="iv-small">{selected.continuity === 'simulation_au' ? 'Personnage original créé pour la simulation du projet. Il ne fait pas partie des séries.' : 'Dessin candidat inspiré des références de la série. La conformité exacte de chaque détail reste à valider.'}</p>
        <details><summary>Références et détails du dessin</summary><ul>{selected.references.filter(reference => reference.kind.startsWith('official_') || reference.kind === 'project_design').map((reference, index) => <li key={index}><a href={reference.url} target="_blank" rel="noreferrer">{reference.episode ?? reference.title ?? (reference.kind === 'project_design' ? 'Design original du projet' : 'Référence officielle')}</a></li>)}</ul><ul>{selected.fidelityNotes.map((note, index) => <li key={index}>{note}</li>)}</ul></details>
        <button className="iv-secondary" onClick={() => { setSelectedId(null); selectedCardRef.current?.focus(); }}>Refermer l’aperçu</button>
      </div>
    </article>}
    <div className="iv-reserve-grid">{visible.map(asset => <button className="iv-reserve-card" key={asset.id} aria-pressed={selectedId === asset.id} onClick={event => { selectedCardRef.current = event.currentTarget; setSelectedId(asset.id); }}>
      <span className={`iv-reserve-image is-${asset.kind}`}><img src={`/${asset.export.replace(/^public\//, '')}`} alt="" loading="lazy" /></span>
      <span className="iv-eyebrow">{KINDS[asset.kind]} · {asset.continuity === 'simulation_au' ? 'CRÉATION ORIGINALE AU' : (asset.franchise ?? 'Helluva Boss').toLocaleUpperCase()}{spoilerScope(asset) === 'season_3' ? ' · SAISON 3' : ''}</span><strong>{asset.name}</strong><small>Voir le dessin</small>
    </button>)}</div>
    {visible.length === 0 && <p className="iv-empty">Aucune création ne correspond à ces filtres.</p>}
  </section>;
}
