import { useMemo, useState } from 'react';
import { Box, Gamepad2, ShieldCheck, Sparkles, Swords, Trophy } from 'lucide-react';
import { PentagramLiveFight } from '../components/PentagramLiveFight';
import { getCharacterSpriteAsset } from '../lib/character-sprites';
import { LoreValidation } from '../lib/lore-validation';
import type { CombatantDefinition } from '../lib/pentagram-combat';
import { RulesEngine } from '../lib/rules-engine';
import type { Character, DatabaseState, RiskLevel, TimelineScope } from '../types';
import '../styles/pentagram-arena.css';

interface PentagramArenaProps {
  state: DatabaseState;
}

interface FighterProfile {
  id: string;
  style: string;
  archetype: string;
  range: number;
  speed: number;
  guard: number;
  tensionGain: number;
  basicMove: string;
  heavyMove: string;
  specialMove: string;
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

const RISK_PROFILE: Record<RiskLevel, { label: string; value: number; power: number }> = {
  low: { label: 'Controlled', value: 32, power: 8 },
  medium: { label: 'Volatile', value: 54, power: 11 },
  high: { label: 'Dangerous', value: 76, power: 14 },
  catastrophic: { label: 'Overlord-class', value: 96, power: 18 },
};

const FIGHTER_PROFILES: Record<string, FighterProfile> = {
  charlie: {
    id: 'charlie',
    style: 'Hope rushdown',
    archetype: 'Balanced morale pressure',
    range: 58,
    speed: 68,
    guard: 64,
    tensionGain: 16,
    basicMove: 'Royal jab string',
    heavyMove: 'Hellborn roundhouse',
    specialMove: 'Happy Hotel rally',
  },
  vaggie: {
    id: 'vaggie',
    style: 'Discipline duelist',
    archetype: 'Counter-hit security',
    range: 66,
    speed: 72,
    guard: 76,
    tensionGain: 14,
    basicMove: 'Spear-line feint',
    heavyMove: 'Spear-breaker arc',
    specialMove: 'Guardian intercept',
  },
  angeldust: {
    id: 'angeldust',
    style: 'Trickster pressure',
    archetype: 'Multi-angle mixup',
    range: 74,
    speed: 78,
    guard: 44,
    tensionGain: 18,
    basicMove: 'Web kick chain',
    heavyMove: 'Crossfire heel',
    specialMove: 'Stage-wire flourish',
  },
  alastor: {
    id: 'alastor',
    style: 'Radio zoner',
    archetype: 'Space control boss',
    range: 92,
    speed: 54,
    guard: 72,
    tensionGain: 12,
    basicMove: 'Static cane snap',
    heavyMove: 'Shadow cane sweep',
    specialMove: 'Broadcast blackout',
  },
  husk: {
    id: 'husk',
    style: 'Grit grappler',
    archetype: 'Brawler with reads',
    range: 48,
    speed: 56,
    guard: 70,
    tensionGain: 17,
    basicMove: 'Bar-counter hook',
    heavyMove: 'House-edge uppercut',
    specialMove: 'Loaded dice punish',
  },
  niffty: {
    id: 'niffty',
    style: 'Tiny blender',
    archetype: 'High-speed nuisance',
    range: 36,
    speed: 92,
    guard: 38,
    tensionGain: 20,
    basicMove: 'Needle dash',
    heavyMove: 'Needlewheel rush',
    specialMove: 'Spotless frenzy',
  },
  sirpentious: {
    id: 'sirpentious',
    style: 'Gadget setplay',
    archetype: 'Trap inventor',
    range: 70,
    speed: 42,
    guard: 58,
    tensionGain: 15,
    basicMove: 'Clockwork poke',
    heavyMove: 'Coil launcher',
    specialMove: 'Egg-boi barrage',
  },
  baxter: {
    id: 'baxter',
    style: 'Lab control',
    archetype: 'Projectile setup',
    range: 76,
    speed: 48,
    guard: 54,
    tensionGain: 16,
    basicMove: 'Volt probe',
    heavyMove: 'Pressure pulse',
    specialMove: 'Tank discharge',
  },
  sim_applicant_marlow: {
    id: 'sim_applicant_marlow',
    style: 'Defensive footsies',
    archetype: 'Starter-safe trainee',
    range: 52,
    speed: 52,
    guard: 66,
    tensionGain: 14,
    basicMove: 'Glass-step strike',
    heavyMove: 'Mirror shoulder',
    specialMove: 'Composure break',
  },
  sim_applicant_ember: {
    id: 'sim_applicant_ember',
    style: 'Flare rush',
    archetype: 'Momentum trainee',
    range: 50,
    speed: 70,
    guard: 48,
    tensionGain: 19,
    basicMove: 'Spark lunge',
    heavyMove: 'Flashpoint hook',
    specialMove: 'Cinder burst',
  },
};

const DEFAULT_PROFILE: FighterProfile = {
  id: 'default',
  style: 'Simulation custom',
  archetype: 'Adaptive exhibition kit',
  range: 52,
  speed: 52,
  guard: 52,
  tensionGain: 14,
  basicMove: 'Training strike',
  heavyMove: 'Training breaker',
  specialMove: 'Limit rehearsal',
};

const ROADMAP = [
  ['Roster shell', 'Fighter selection, timeline filtering and portrait support are ready.'],
  ['Playable prototype', 'Local exhibition uses HP, guard, spacing, tension and Simulation AU moves.'],
  ['Character kits', 'Next pass can add unique animations, hitboxes, cancels and air routes.'],
  ['Long modes', 'Training AI, best-of-three sets and tournament brackets after the core loop is stable.'],
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

function getProfile(fighter: Character | undefined): FighterProfile {
  return fighter ? FIGHTER_PROFILES[fighter.id] ?? DEFAULT_PROFILE : DEFAULT_PROFILE;
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
    if (!getCharacterSpriteAsset(fighter.id)) return [];
    return [fighter];
  });
}

function buildCombatantDefinition(fighter: Character, profile: FighterProfile): CombatantDefinition {
  return {
    name: fighter.name,
    power: RISK_PROFILE[fighter.riskLevel].power,
    range: profile.range,
    speed: profile.speed,
    guard: profile.guard,
    tensionGain: profile.tensionGain,
    basicMove: profile.basicMove,
    heavyMove: profile.heavyMove,
    specialMove: profile.specialMove,
  };
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
  const profile = getProfile(fighter);
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
        <p>{profile.style} · {profile.archetype}</p>
      </div>

      {fighter && (
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

  const fighterOne = fighters.find(fighter => fighter.id === fighterOneId) ?? fighters[0];
  const fighterTwo = fighters.find(
    fighter => fighter.id === fighterTwoId && fighter.id !== fighterOne?.id,
  ) ?? fighters.find(fighter => fighter.id !== fighterOne?.id);
  const matchupReady = Boolean(fighterOne && fighterTwo);
  const fighterOneProfile = getProfile(fighterOne);
  const fighterTwoProfile = getProfile(fighterTwo);
  const fighterOneDefinition = useMemo(
    () => fighterOne ? buildCombatantDefinition(fighterOne, fighterOneProfile) : undefined,
    [fighterOne, fighterOneProfile],
  );
  const fighterTwoDefinition = useMemo(
    () => fighterTwo ? buildCombatantDefinition(fighterTwo, fighterTwoProfile) : undefined,
    [fighterTwo, fighterTwoProfile],
  );

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

  return (
    <div className="page-container arena-page animate-fade-in">
      <header className="arena-hero">
        <div>
          <div className="arena-kicker"><Swords size={16} aria-hidden="true" /> Simulation AU combat lab</div>
          <h1>Pentagram Arena</h1>
          <p>
            Build a 2.5D exhibition match with timeline-visible fighters, fighter-card selection and
            a local prototype loop inspired by anime fighting games.
          </p>
        </div>
        <div className="arena-status" aria-label="Development status">
          <span>Playable prototype</span>
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
            onExit={() => setPhase('select')}
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
                    ? 'Matchup ready for a live local exhibition. Results stay inside this page.'
                    : 'At least two timeline-eligible sprite fighters are required to prepare a matchup.'}
                </span>
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
            <p>Local match loop first; AI sparring and longer tournament structures can layer on top.</p>
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
            <li key={title} className={index <= 1 ? 'is-ready' : undefined}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
