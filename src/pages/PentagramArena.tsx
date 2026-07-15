import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Gamepad2, ShieldCheck, Sparkles, Swords, Trophy } from 'lucide-react';
import { PentagramLiveFight } from '../components/PentagramLiveFight';
import { getCharacterSpriteAsset } from '../lib/character-sprites';
import {
  COMBAT_AI_DIFFICULTY_LABELS,
  type CombatAiDifficulty,
} from '../lib/pentagram-ai';
import {
  buildCombatantDefinition,
  FIGHTER_KIT_EVIDENCE_LABELS,
  getFighterProfile,
} from '../lib/pentagram-fighters';
import { LoreValidation } from '../lib/lore-validation';
import { RulesEngine } from '../lib/rules-engine';
import type { Character, DatabaseState, RiskLevel, TimelineScope } from '../types';
import '../styles/pentagram-arena.css';

interface PentagramArenaProps {
  state: DatabaseState;
}

interface FighterCardProps {
  fighter: Character | undefined;
  label: string;
  selectId: string;
  fighters: Character[];
  activeFighterId: string;
  blockedFighterId?: string;
  onSelect: (fighterId: string) => void;
}

type ArenaPhase = 'select' | 'fight';
type ArenaMatchMode = 'ai' | 'local';

const RISK_PROFILE: Record<RiskLevel, { label: string; value: number }> = {
  low: { label: 'Controlled', value: 32 },
  medium: { label: 'Volatile', value: 54 },
  high: { label: 'Dangerous', value: 76 },
  catastrophic: { label: 'Extreme threat', value: 96 },
};

const ROADMAP = [
  ['Roster complete', 'Every sprite-backed fighter has an explicit Simulation AU kit.'],
  ['Active-frame combat', 'Damage lands on the animated impact window with hitstop and guard checks.'],
  ['Sparring sets', 'CPU difficulty and best-of-three scoring are playable now.'],
  ['Long modes', 'Tournament brackets, training data and air routes remain the next expansion layer.'],
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
    if (!getCharacterSpriteAsset(fighter.id) || !getFighterProfile(fighter)) return [];
    return [fighter];
  });
}

function FighterCard({
  fighter,
  label,
  selectId,
  fighters,
  activeFighterId,
  blockedFighterId,
  onSelect,
}: FighterCardProps) {
  const sprite = fighter ? getCharacterSpriteAsset(fighter.id) : undefined;
  const risk = fighter ? RISK_PROFILE[fighter.riskLevel] : RISK_PROFILE.low;
  const profile = getFighterProfile(fighter);
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
        <p>{profile ? `${profile.style} · ${profile.archetype}` : 'Select a combatant'}</p>
      </div>

      {fighter && profile && (
        <>
          <dl className="arena-fighter__facts">
            <div><dt>Role</dt><dd>{formatLabel(fighter.role)}</dd></div>
            <div><dt>Origin</dt><dd>{formatLabel(fighter.type)}</dd></div>
            <div><dt>Threat</dt><dd>{risk.label}</dd></div>
          </dl>
          <div className="arena-fighter__moves">
            <span>{profile.basicMove}</span>
            <strong>{profile.specialMove}</strong>
          </div>
          <small className={`arena-kit-evidence is-${profile.evidence}`}>
            {FIGHTER_KIT_EVIDENCE_LABELS[profile.evidence]}
          </small>
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

      <div className="arena-mini-roster" role="group" aria-label={`${label} quick select`}>
        {fighters.map((candidate) => {
          const candidateSprite = getCharacterSpriteAsset(candidate.id);
          const isBlocked = candidate.id === blockedFighterId;
          const isSelected = candidate.id === activeFighterId;

          return (
            <button
              key={candidate.id}
              type="button"
              className={`arena-roster-tile${isSelected ? ' is-selected' : ''}`}
              onClick={() => onSelect(candidate.id)}
              disabled={isBlocked}
              aria-pressed={isSelected}
              title={candidate.name}
            >
              <span>{getInitials(candidate.name)}</span>
              {candidateSprite && <img src={candidateSprite.portrait} alt="" />}
              <small>{candidate.name}</small>
            </button>
          );
        })}
      </div>
    </article>
  );
}

export function PentagramArena({ state }: PentagramArenaProps) {
  const fighters = useMemo(() => getArenaFighters(state), [state]);
  const [fighterOneId, setFighterOneId] = useState(() => fighters[0]?.id ?? '');
  const [fighterTwoId, setFighterTwoId] = useState(() => fighters[1]?.id ?? '');
  const [phase, setPhase] = useState<ArenaPhase>('select');
  const [matchMode, setMatchMode] = useState<ArenaMatchMode>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<CombatAiDifficulty>('standard');
  const shouldRestoreFocusRef = useRef(false);

  const fighterOne = fighters.find(fighter => fighter.id === fighterOneId) ?? fighters[0];
  const fighterTwo = fighters.find(
    fighter => fighter.id === fighterTwoId && fighter.id !== fighterOne?.id,
  ) ?? fighters.find(fighter => fighter.id !== fighterOne?.id);
  const fighterOneProfile = getFighterProfile(fighterOne);
  const fighterTwoProfile = getFighterProfile(fighterTwo);
  const matchupReady = Boolean(fighterOne && fighterTwo && fighterOneProfile && fighterTwoProfile);
  const fighterOneDefinition = useMemo(
    () => fighterOne && fighterOneProfile
      ? buildCombatantDefinition(fighterOne, fighterOneProfile)
      : undefined,
    [fighterOne, fighterOneProfile],
  );
  const fighterTwoDefinition = useMemo(
    () => fighterTwo && fighterTwoProfile
      ? buildCombatantDefinition(fighterTwo, fighterTwoProfile)
      : undefined,
    [fighterTwo, fighterTwoProfile],
  );

  useEffect(() => {
    if (phase !== 'select' || !shouldRestoreFocusRef.current) return;
    shouldRestoreFocusRef.current = false;
    document.getElementById('arena-fighter-one')?.focus();
  }, [phase]);

  const selectFighterOne = (fighterId: string) => {
    const nextTwo = fighterTwo?.id !== fighterId
      ? fighterTwo
      : fighters.find(fighter => fighter.id !== fighterId);
    setFighterOneId(fighterId);
    setFighterTwoId(nextTwo?.id ?? '');
  };

  const selectFighterTwo = (fighterId: string) => {
    const nextOne = fighterOne?.id !== fighterId
      ? fighterOne
      : fighters.find(fighter => fighter.id !== fighterId);
    setFighterTwoId(fighterId);
    setFighterOneId(nextOne?.id ?? '');
  };

  const startMatch = () => {
    if (matchupReady) setPhase('fight');
  };

  const exitMatch = () => {
    shouldRestoreFocusRef.current = true;
    setPhase('select');
  };

  return (
    <div className="page-container arena-page animate-fade-in">
      <header className="arena-hero">
        <div>
          <div className="arena-kicker"><Swords size={16} aria-hidden="true" /> Simulation AU combat lab</div>
          <h1>Pentagram Arena</h1>
          <p>
            Build a 2.5D exhibition match with timeline-visible fighters, fighter-card selection and
            active-frame combat inspired by anime fighting games.
          </p>
        </div>
        <div className="arena-status" aria-label="Development status">
          <span>Playable combat beta</span>
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

      {phase === 'fight'
        && fighterOne
        && fighterTwo
        && fighterOneDefinition
        && fighterTwoDefinition ? (
          <PentagramLiveFight
            fighterOne={fighterOne}
            fighterTwo={fighterTwo}
            fighterOneDefinition={fighterOneDefinition}
            fighterTwoDefinition={fighterTwoDefinition}
            matchMode={matchMode}
            aiDifficulty={aiDifficulty}
            onExit={exitMatch}
          />
        ) : (
          <>
            <section className="arena-stage art-deco-border" aria-labelledby="arena-stage-title">
        <h2 id="arena-stage-title" className="sr-only">Exhibition matchup setup</h2>
        <div className="arena-stage__glow" aria-hidden="true" />
        <FighterCard
          fighter={fighterOne}
          label="Fighter one"
          selectId="arena-fighter-one"
          fighters={fighters}
          activeFighterId={fighterOne?.id ?? ''}
          blockedFighterId={fighterTwo?.id}
          onSelect={selectFighterOne}
        />
        <div className="arena-versus" aria-hidden="true"><span>VS</span></div>
        <FighterCard
          fighter={fighterTwo}
          label="Fighter two"
          selectId="arena-fighter-two"
          fighters={fighters}
          activeFighterId={fighterTwo?.id ?? ''}
          blockedFighterId={fighterOne?.id}
          onSelect={selectFighterTwo}
        />
            </section>

            <div className="arena-action-row">
              <div>
                <strong>{fighterOne?.name ?? 'Fighter one'} vs {fighterTwo?.name ?? 'Fighter two'}</strong>
                <span id="arena-launch-note">
                  {matchupReady
                    ? `${matchMode === 'ai' ? 'CPU sparring' : 'Local versus'} · first to two rounds. Results stay inside this page.`
                    : 'At least two timeline-eligible sprite fighters are required to prepare a matchup.'}
                </span>
              </div>
              <div className="arena-match-options">
                <label>
                  Match mode
                  <select
                    value={matchMode}
                    onChange={(event) => setMatchMode(event.target.value as ArenaMatchMode)}
                  >
                    <option value="ai">Sparring vs CPU</option>
                    <option value="local">Two-player local</option>
                  </select>
                </label>
                {matchMode === 'ai' && (
                  <label>
                    CPU difficulty
                    <select
                      value={aiDifficulty}
                      onChange={(event) => setAiDifficulty(event.target.value as CombatAiDifficulty)}
                    >
                      {(Object.entries(COMBAT_AI_DIFFICULTY_LABELS) as [CombatAiDifficulty, string][])
                        .map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                )}
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!matchupReady}
                aria-describedby="arena-launch-note"
                onClick={startMatch}
              >
                <Gamepad2 size={17} aria-hidden="true" /> Start exhibition
              </button>
            </div>

          </>
        )}

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
            <p>Side-on readability with spacing, guard, tension and stage position already represented.</p>
          </article>
          <article>
            <Trophy size={22} aria-hidden="true" />
            <h3>Exhibition first</h3>
            <p>CPU sparring and local versus now run as scored best-of-three sets.</p>
          </article>
          <article>
            <ShieldCheck size={22} aria-hidden="true" />
            <h3>Safe progression</h3>
            <p>Combat balance remains separate from canon facts, rehabilitation and campaign saves.</p>
          </article>
        </div>
      </section>

      <section className="arena-roadmap glass-panel" aria-labelledby="arena-roadmap-title">
        <div className="arena-section-heading">
          <div>
            <span>Production path</span>
            <h2 id="arena-roadmap-title">From roster to full fighting game</h2>
          </div>
        </div>
        <ol>
          {ROADMAP.map(([title, description], index) => (
            <li key={title} className={index <= 2 ? 'is-ready' : undefined}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
