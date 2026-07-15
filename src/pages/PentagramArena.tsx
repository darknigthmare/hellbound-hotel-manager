import { useMemo, useState } from 'react';
import { Box, Gamepad2, ShieldCheck, Sparkles, Swords, Trophy } from 'lucide-react';
import { getCharacterSpriteAsset } from '../lib/character-sprites';
import { LoreValidation } from '../lib/lore-validation';
import { RulesEngine } from '../lib/rules-engine';
import type { Character, CharacterStatus, DatabaseState, RiskLevel, TimelineScope } from '../types';
import '../styles/pentagram-arena.css';

interface PentagramArenaProps {
  state: DatabaseState;
}

interface FighterCardProps {
  fighter: Character | undefined;
  label: string;
  selectId: string;
  fighters: Character[];
  blockedFighterId?: string;
  onSelect: (fighterId: string) => void;
}

const ARENA_STATUSES = new Set<CharacterStatus>(['staff', 'resident', 'applicant']);

const RISK_PROFILE: Record<RiskLevel, { label: string; value: number }> = {
  low: { label: 'Controlled', value: 32 },
  medium: { label: 'Volatile', value: 54 },
  high: { label: 'Dangerous', value: 76 },
  catastrophic: { label: 'Overlord-class', value: 96 },
};

const ROADMAP = [
  ['Roster shell', 'Fighter selection, timeline filtering and portrait support are ready.'],
  ['Combat foundation', '2.5D movement, collision lanes, hitboxes and camera framing.'],
  ['Character kits', 'Canon-inspired silhouettes with Simulation AU attacks and balanced counters.'],
  ['Playable modes', 'Local versus first, then training AI and tournament brackets.'],
] as const;

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function getArenaFighters(state: DatabaseState): Character[] {
  return state.characters.flatMap((source) => {
    const snapshot = state.timeline.current !== 'custom'
      ? source.timelineStates?.[state.timeline.current as Exclude<TimelineScope, 'custom'>]
      : undefined;
    const fighter: Character = { ...source, ...snapshot };
    const availableAtTimeline = Boolean(snapshot)
      || LoreValidation.isAvailableAtTimeline(source.timelineScope, state.timeline.current);

    if (!availableAtTimeline || !RulesEngine.isContentVisible(source, state.timeline)) return [];
    if (!ARENA_STATUSES.has(fighter.status)) return [];
    return [fighter];
  });
}

function FighterCard({
  fighter,
  label,
  selectId,
  fighters,
  blockedFighterId,
  onSelect,
}: FighterCardProps) {
  const sprite = fighter ? getCharacterSpriteAsset(fighter.id) : undefined;
  const risk = fighter ? RISK_PROFILE[fighter.riskLevel] : RISK_PROFILE.low;
  const titleId = `${selectId}-title`;

  return (
    <article className="arena-fighter" aria-labelledby={titleId}>
      <div className="arena-fighter__slot">{label}</div>
      <div className="arena-fighter__portrait" aria-hidden="true">
        <span>{fighter ? getInitials(fighter.name) : '?'}</span>
        {sprite && (
          <img
            src={sprite.portrait}
            alt=""
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
          />
        )}
      </div>

      <label htmlFor={selectId}>Choose {label.toLowerCase()}</label>
      <select
        id={selectId}
        value={fighter?.id ?? ''}
        onChange={(event) => onSelect(event.target.value)}
      >
        {!fighter && (
          <option value="" disabled>
            {fighters.length > 0 ? 'Choose an available fighter' : 'No eligible fighters'}
          </option>
        )}
        {fighters.map((candidate) => (
          <option
            key={candidate.id}
            value={candidate.id}
            disabled={candidate.id === blockedFighterId}
          >
            {candidate.name}
          </option>
        ))}
      </select>

      <div className="arena-fighter__identity">
        <h2 id={titleId}>{fighter?.name ?? 'Roster pending'}</h2>
        <p>{fighter?.alias ?? 'No eligible combat profile'}</p>
      </div>

      {fighter && (
        <>
          <dl className="arena-fighter__facts">
            <div><dt>Role</dt><dd>{formatLabel(fighter.role)}</dd></div>
            <div><dt>Origin</dt><dd>{formatLabel(fighter.type)}</dd></div>
            <div><dt>Threat class</dt><dd>{risk.label}</dd></div>
          </dl>
          <div
            className="arena-threat-meter"
            role="meter"
            aria-label={`${fighter.name} Simulation AU threat class`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={risk.value}
          >
            <span style={{ width: `${risk.value}%` }} />
          </div>
        </>
      )}
    </article>
  );
}

export function PentagramArena({ state }: PentagramArenaProps) {
  const fighters = useMemo(() => getArenaFighters(state), [state]);
  const [fighterOneId, setFighterOneId] = useState(() => fighters[0]?.id ?? '');
  const [fighterTwoId, setFighterTwoId] = useState(() => fighters[1]?.id ?? '');

  const fighterOne = fighters.find(fighter => fighter.id === fighterOneId) ?? fighters[0];
  const fighterTwo = fighters.find(
    fighter => fighter.id === fighterTwoId && fighter.id !== fighterOne?.id,
  ) ?? fighters.find(fighter => fighter.id !== fighterOne?.id);
  const matchupReady = Boolean(fighterOne && fighterTwo);

  const selectFighterOne = (fighterId: string) => {
    setFighterOneId(fighterId);
    setFighterTwoId(fighterTwo?.id ?? fighters.find(fighter => fighter.id !== fighterId)?.id ?? '');
  };

  const selectFighterTwo = (fighterId: string) => {
    setFighterTwoId(fighterId);
    setFighterOneId(fighterOne?.id ?? fighters.find(fighter => fighter.id !== fighterId)?.id ?? '');
  };

  return (
    <div className="page-container arena-page animate-fade-in">
      <header className="arena-hero">
        <div>
          <div className="arena-kicker"><Swords size={16} aria-hidden="true" /> Simulation AU combat lab</div>
          <h1>Pentagram Arena</h1>
          <p>
            Prepare hotel inhabitants for a future 2.5D fighting game set inside a controlled
            Pentagram City-inspired simulation.
          </p>
        </div>
        <div className="arena-status" aria-label="Development status">
          <span>Pre-production</span>
          <strong>{fighters.length} fighters indexed</strong>
        </div>
      </header>

      <section className="arena-lore-notice" aria-labelledby="arena-lore-title">
        <ShieldCheck size={22} aria-hidden="true" />
        <div>
          <h2 id="arena-lore-title">Lore-safe exhibition rules</h2>
          <p>
            Matchups, attacks and outcomes are gameplay-only Simulation AU records. They never
            claim that these residents fought in canon and they do not alter hotel progress.
          </p>
        </div>
      </section>

      <section className="arena-stage art-deco-border" aria-labelledby="arena-stage-title">
        <h2 id="arena-stage-title" className="sr-only">Exhibition matchup setup</h2>
        <div className="arena-stage__glow" aria-hidden="true" />
        <FighterCard
          fighter={fighterOne}
          label="Fighter one"
          selectId="arena-fighter-one"
          fighters={fighters}
          blockedFighterId={fighterTwo?.id}
          onSelect={selectFighterOne}
        />
        <div className="arena-versus" aria-hidden="true"><span>VS</span></div>
        <FighterCard
          fighter={fighterTwo}
          label="Fighter two"
          selectId="arena-fighter-two"
          fighters={fighters}
          blockedFighterId={fighterOne?.id}
          onSelect={selectFighterTwo}
        />
      </section>

      <div className="arena-action-row">
        <div>
          <strong>{fighterOne?.name ?? 'Fighter one'} vs {fighterTwo?.name ?? 'Fighter two'}</strong>
          <span id="arena-launch-note">
            {matchupReady
              ? 'The matchup is ready; the combat runtime will be added in the next development phase.'
              : 'At least two timeline-eligible hotel inhabitants are required to prepare a matchup.'}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          disabled
          aria-describedby="arena-launch-note"
        >
          <Gamepad2 size={17} aria-hidden="true" /> Combat engine coming next
        </button>
      </div>

      <section className="arena-blueprint" aria-labelledby="arena-blueprint-title">
        <div className="arena-section-heading">
          <div>
            <span>Design foundation</span>
            <h2 id="arena-blueprint-title">2.5D combat blueprint</h2>
          </div>
          <Sparkles size={24} aria-hidden="true" />
        </div>
        <div className="arena-blueprint__grid">
          <article>
            <Box size={22} aria-hidden="true" />
            <h3>2.5D stage lane</h3>
            <p>3D depth and camera framing with readable side-on attacks, dodges and knockback.</p>
          </article>
          <article>
            <Trophy size={22} aria-hidden="true" />
            <h3>Exhibition first</h3>
            <p>Best-of-three local matches before AI sparring and longer tournament structures.</p>
          </article>
          <article>
            <ShieldCheck size={22} aria-hidden="true" />
            <h3>Safe progression</h3>
            <p>Combat balance will remain separate from canon facts, rehabilitation and campaign saves.</p>
          </article>
        </div>
      </section>

      <section className="arena-roadmap glass-panel" aria-labelledby="arena-roadmap-title">
        <div className="arena-section-heading">
          <div>
            <span>Production path</span>
            <h2 id="arena-roadmap-title">From roster to playable fight</h2>
          </div>
        </div>
        <ol>
          {ROADMAP.map(([title, description], index) => (
            <li key={title} className={index === 0 ? 'is-ready' : undefined}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
