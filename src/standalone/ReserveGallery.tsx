import { useEffect, useRef, useState, type Ref } from 'react';
import reserveCatalogue from '../../art/infernal-versus/production/reserve-assets.json';
import { HELLUVA_CHARACTERS } from '../expansions/helluva-boss/data';
import './reserve-gallery.css';

type ReserveKind = 'character_base' | 'enemy_base' | 'projectile';
interface ReserveAsset {
  id: string;
  name: string;
  kind: ReserveKind;
  sourceIdentityId?: string | null;
  reference: string;
  export: string;
  dimensions: number[];
  references: { url: string; kind: string; episode?: string }[];
  fidelityNotes: string[];
}
const KINDS: Record<ReserveKind, string> = { character_base: 'Personnages', enemy_base: 'Ennemis', projectile: 'Projectiles' };
const assets = reserveCatalogue.assets as ReserveAsset[];

/** Incarnation-specific evidence takes priority over a character's first appearance. */
function includesSeasonTwo(asset: ReserveAsset): boolean {
  if (/\bS2E/i.test(asset.reference) || asset.references.some(reference => /\bS2E/i.test(reference.episode ?? ''))) return true;
  const character = HELLUVA_CHARACTERS.find(candidate => candidate.id === asset.sourceIdentityId);
  if (character) return character.spoilerScope !== 'season_1';
  // Unknown chronology is hidden by the stricter content filter.
  return true;
}

export function ReserveGallery({ titleRef, allowSeasonTwo, onScopeChange }: {
  titleRef: Ref<HTMLHeadingElement>;
  allowSeasonTwo: boolean;
  onScopeChange: (allow: boolean) => void;
}) {
  const [kind, setKind] = useState<ReserveKind | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailTitleRef = useRef<HTMLHeadingElement>(null);
  const selectedCardRef = useRef<HTMLButtonElement | null>(null);
  const eligible = assets.filter(asset => allowSeasonTwo || !includesSeasonTwo(asset));
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
    <p className="iv-eyebrow">PERSONNAGES, ENNEMIS & PROJECTILES</p>
    <h1 ref={titleRef} tabIndex={-1}>La galerie des créations</h1>
    <p className="iv-lead">{assets.length} dessins à explorer en plein cadre. Ces bases visuelles préparent de futurs combattants, adversaires et effets ; elles ne sont pas encore des kits jouables.</p>
    <div className="iv-filter-row">
      <label>Catégorie<select value={kind} onChange={event => { setSelectedId(null); setKind(event.target.value as ReserveKind | 'all'); }}><option value="all">Toutes les créations</option>{Object.entries(KINDS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Contenu de la galerie<select value={allowSeasonTwo ? 'all' : 'season_1'} onChange={event => { setSelectedId(null); onScopeChange(event.target.value === 'all'); }}><option value="all">Saisons 1 et 2</option><option value="season_1">Saison 1 uniquement</option></select></label>
      <label>Rechercher une création<input value={query} onChange={event => { setSelectedId(null); setQuery(event.target.value); }} placeholder="Personnage, ennemi, projectile…" /></label>
    </div>
    <p className="iv-small" role="status">{visible.length} dessin{visible.length > 1 ? 's' : ''} affiché{visible.length > 1 ? 's' : ''} sur {eligible.length} disponible{eligible.length > 1 ? 's' : ''} avec ce contenu.</p>
    {selected && <article className="iv-panel iv-reserve-detail" aria-label={`Détail de ${selected.name}`}>
      <img src={`/${selected.export.replace(/^public\//, '')}`} alt={selected.name} />
      <div><p className="iv-eyebrow">{KINDS[selected.kind]}</p><h2 ref={detailTitleRef} tabIndex={-1}>{selected.name}</h2><p>Illustration statique · {selected.dimensions.join(' × ')} pixels.</p><p className="iv-small">Dessin candidat inspiré des références de la série. La conformité exacte de chaque détail reste à valider.</p>
        <details><summary>Références et détails du dessin</summary><ul>{selected.references.filter(reference => reference.kind === 'official_episode').map((reference, index) => <li key={index}><a href={reference.url} target="_blank" rel="noreferrer">{reference.episode ?? 'Épisode officiel de référence'}</a></li>)}</ul><ul>{selected.fidelityNotes.map((note, index) => <li key={index}>{note}</li>)}</ul></details>
        <button className="iv-secondary" onClick={() => { setSelectedId(null); selectedCardRef.current?.focus(); }}>Refermer l’aperçu</button>
      </div>
    </article>}
    <div className="iv-reserve-grid">{visible.map(asset => <button className="iv-reserve-card" key={asset.id} aria-pressed={selectedId === asset.id} onClick={event => { selectedCardRef.current = event.currentTarget; setSelectedId(asset.id); }}>
      <span className={`iv-reserve-image is-${asset.kind}`}><img src={`/${asset.export.replace(/^public\//, '')}`} alt="" loading="lazy" /></span>
      <span className="iv-eyebrow">{KINDS[asset.kind]} · HELLUVA BOSS</span><strong>{asset.name}</strong><small>Voir le dessin</small>
    </button>)}</div>
    {visible.length === 0 && <p className="iv-empty">Aucune création ne correspond à ces filtres.</p>}
  </section>;
}
