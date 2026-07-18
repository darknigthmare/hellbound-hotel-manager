import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  MapPin,
  Music,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react';
import { PentagramLiveFight } from '../components/PentagramLiveFight';
import { usePentagramCombatSoundtrack } from '../components/usePentagramCombatSoundtrack';
import { getCharacterSpriteAsset } from '../lib/character-sprites';
import { getHazbinArenaFighters } from '../lib/hazbin-arena-fighters';
import {
  COMBAT_AI_DIFFICULTY_LABELS,
  type CombatAiDifficulty,
} from '../lib/pentagram-ai';
import {
  buildCombatantDefinition,
  FIGHTER_KIT_EVIDENCE_LABELS,
  getFighterProfile,
} from '../lib/pentagram-fighters';
import {
  DEFAULT_PENTAGRAM_STAGE,
  getPentagramStage,
  getPentagramStageVisualProperties,
  PENTAGRAM_STAGES,
  type PentagramStageId,
} from '../lib/pentagram-stages';
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
  blockedFighterId?: string;
  onSelect: (fighterId: string) => void;
}

interface ArenaPortraitProps {
  src?: string;
  fallback: string;
}

type ArenaPhase = 'select' | 'fight';
type ArenaMatchMode = 'ai' | 'local';
type ArenaPickerSlot = 'one' | 'two';

const ROSTER_PAGE_SIZE = 12;

const RISK_PROFILE: Record<RiskLevel, { label: string; value: number }> = {
  low: { label: 'Controlled', value: 32 },
  medium: { label: 'Volatile', value: 54 },
  high: { label: 'Dangerous', value: 76 },
  catastrophic: { label: 'Extreme threat', value: 96 },
};

const ROADMAP = [
  ['Roster complete', 'Every sprite-backed fighter has an explicit Simulation AU kit.'],
  ['Four-bank animation', 'Each illustrated identity now has 18 supplementary movement, offense and reaction poses.'],
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

function ArenaPortrait({ src, fallback }: ArenaPortraitProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <span>{fallback}</span>;

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
    />
  );
}

function getArenaFighters(state: DatabaseState): Character[] {
  const operationalFighters = state.characters.flatMap((source) => {
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
  const operationalIds = new Set(operationalFighters.map(({ id }) => id));
  const directoryFighters = getHazbinArenaFighters(state.timeline)
    .filter(fighter => (
      !operationalIds.has(fighter.id)
      && Boolean(getCharacterSpriteAsset(fighter.id))
      && Boolean(getFighterProfile(fighter))
    ));

  return [...operationalFighters, ...directoryFighters];
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
  const profile = getFighterProfile(fighter);
  const titleId = `${selectId}-title`;

  return (
    <article className="arena-fighter" aria-labelledby={titleId}>
      <div className="arena-fighter__slot">{label}</div>
      <div className="arena-fighter__portrait" aria-hidden="true">
        <ArenaPortrait
          key={sprite?.portrait ?? fighter?.id ?? 'empty-fighter'}
          src={sprite?.portrait}
          fallback={fighter ? getInitials(fighter.name) : '?'}
        />
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
          <dl className="arena-combat-stats" aria-label={`${fighter.name} combat statistics`}>
            {([
              ['Power', profile.power],
              ['Range', profile.range],
              ['Speed', profile.speed],
              ['Guard', profile.guard],
            ] as const).map(([stat, value]) => {
              const meterValue = stat === 'Power' ? Math.min(100, value * 5) : value;
              return (
                <div key={stat}>
                  <dt>{stat}</dt>
                  <dd>
                    <span aria-hidden="true"><i style={{ width: `${meterValue}%` }} /></span>
                    <strong>{value}</strong>
                  </dd>
                </div>
              );
            })}
          </dl>
        </>
      )}
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
  const [pickerSlot, setPickerSlot] = useState<ArenaPickerSlot>('one');
  const [rosterQuery, setRosterQuery] = useState('');
  const [rosterPage, setRosterPage] = useState(0);
  const [stageId, setStageId] = useState<PentagramStageId>(DEFAULT_PENTAGRAM_STAGE.id);
  const [soundtrackEnabled, setSoundtrackEnabled] = useState(true);
  const shouldRestoreFocusRef = useRef(false);
  const {
    status: soundtrackStatus,
    start: startSoundtrack,
    stop: stopSoundtrack,
    release: releaseSoundtrack,
    pause: pauseSoundtrack,
    resume: resumeSoundtrack,
  } = usePentagramCombatSoundtrack();

  const fighterOne = fighters.find(fighter => fighter.id === fighterOneId) ?? fighters[0];
  const fighterTwo = fighters.find(
    fighter => fighter.id === fighterTwoId && fighter.id !== fighterOne?.id,
  ) ?? fighters.find(fighter => fighter.id !== fighterOne?.id);
  const fighterOneProfile = getFighterProfile(fighterOne);
  const fighterTwoProfile = getFighterProfile(fighterTwo);
  const selectedStage = getPentagramStage(stageId);
  const selectedStageStyle = getPentagramStageVisualProperties(selectedStage) as CSSProperties;
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
  const filteredFighters = useMemo(() => {
    const query = rosterQuery.trim().toLocaleLowerCase();
    if (!query) return fighters;
    return fighters.filter((fighter) => {
      const profile = getFighterProfile(fighter);
      return [fighter.name, fighter.role, fighter.type, profile?.style, profile?.archetype]
        .filter(Boolean)
        .some(value => String(value).toLocaleLowerCase().includes(query));
    });
  }, [fighters, rosterQuery]);
  const rosterPageCount = Math.max(1, Math.ceil(filteredFighters.length / ROSTER_PAGE_SIZE));
  const safeRosterPage = Math.min(rosterPage, rosterPageCount - 1);
  const visibleFighters = filteredFighters.slice(
    safeRosterPage * ROSTER_PAGE_SIZE,
    (safeRosterPage + 1) * ROSTER_PAGE_SIZE,
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
    if (!matchupReady) return;
    if (soundtrackEnabled) {
      void startSoundtrack(selectedStage.soundtrack)
        .then(result => {
          if (result === 'unavailable') setSoundtrackEnabled(false);
        });
    }
    setPhase('fight');
  };

  const selectFromRoster = (fighterId: string) => {
    if (pickerSlot === 'one') selectFighterOne(fighterId);
    else selectFighterTwo(fighterId);
  };

  const exitMatch = () => {
    releaseSoundtrack();
    shouldRestoreFocusRef.current = true;
    setPhase('select');
  };

  const pauseArenaSoundtrack = useCallback(() => {
    pauseSoundtrack();
  }, [pauseSoundtrack]);

  const resumeArenaSoundtrack = useCallback(() => {
    resumeSoundtrack();
  }, [resumeSoundtrack]);

  const toggleArenaSoundtrack = useCallback((startPaused: boolean) => {
    if (soundtrackEnabled) {
      setSoundtrackEnabled(false);
      stopSoundtrack();
      return;
    }

    setSoundtrackEnabled(true);
    void startSoundtrack(selectedStage.soundtrack, { paused: startPaused })
      .then(result => {
        if (result === 'unavailable') setSoundtrackEnabled(false);
      });
  }, [
    selectedStage.soundtrack,
    soundtrackEnabled,
    startSoundtrack,
    stopSoundtrack,
  ]);

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
          <strong>{fighters.length} fighters · 24 poses each</strong>
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
            stage={selectedStage}
            timeline={state.timeline}
            soundtrackEnabled={soundtrackEnabled}
            soundtrackStatus={soundtrackStatus}
            onSoundtrackToggle={toggleArenaSoundtrack}
            onSoundtrackPause={pauseArenaSoundtrack}
            onSoundtrackResume={resumeArenaSoundtrack}
            onExit={exitMatch}
          />
        ) : (
          <>
            <section className="arena-roster-picker glass-panel" aria-labelledby="arena-roster-title">
              <div className="arena-roster-picker__header">
                <div>
                  <span>Guilty Gear-style roster</span>
                  <h2 id="arena-roster-title">Choose a side, then a fighter</h2>
                </div>
                <div className="arena-roster-picker__slots" role="group" aria-label="Fighter slot to edit">
                  <button
                    type="button"
                    className={pickerSlot === 'one' ? 'is-active' : undefined}
                    aria-pressed={pickerSlot === 'one'}
                    onClick={() => {
                      setPickerSlot('one');
                      setRosterPage(0);
                    }}
                  >
                    P1 · {fighterOne?.name ?? 'Choose'}
                  </button>
                  <button
                    type="button"
                    className={pickerSlot === 'two' ? 'is-active' : undefined}
                    aria-pressed={pickerSlot === 'two'}
                    onClick={() => {
                      setPickerSlot('two');
                      setRosterPage(0);
                    }}
                  >
                    P2 · {fighterTwo?.name ?? 'Choose'}
                  </button>
                </div>
                <label className="arena-roster-search">
                  <span className="sr-only">Search fighter roster</span>
                  <Search size={16} aria-hidden="true" />
                  <input
                    type="search"
                    value={rosterQuery}
                    placeholder="Search name, role or style"
                    onChange={(event) => {
                      setRosterQuery(event.target.value);
                      setRosterPage(0);
                    }}
                  />
                </label>
              </div>

              <div className="arena-mini-roster" role="group" aria-label={`Quick select fighter ${pickerSlot}`}>
                {visibleFighters.map((candidate) => {
                  const candidateSprite = getCharacterSpriteAsset(candidate.id);
                  const selectedId = pickerSlot === 'one' ? fighterOne?.id : fighterTwo?.id;
                  const blockedId = pickerSlot === 'one' ? fighterTwo?.id : fighterOne?.id;
                  const isBlocked = candidate.id === blockedId;
                  const isSelected = candidate.id === selectedId;

                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      className={`arena-roster-tile${isSelected ? ' is-selected' : ''}`}
                      onClick={() => selectFromRoster(candidate.id)}
                      disabled={isBlocked}
                      aria-pressed={isSelected}
                      aria-label={candidate.name}
                      title={candidate.name}
                    >
                      <ArenaPortrait
                        key={candidateSprite?.portrait ?? candidate.id}
                        src={candidateSprite?.portrait}
                        fallback={getInitials(candidate.name)}
                      />
                      <small>{candidate.name}</small>
                    </button>
                  );
                })}
                {visibleFighters.length === 0 && (
                  <p className="arena-roster-empty">No fighter matches “{rosterQuery.trim()}”.</p>
                )}
              </div>

              <div className="arena-roster-pagination" aria-label="Fighter roster pages">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={safeRosterPage === 0}
                  aria-label="Previous fighter page"
                  onClick={() => setRosterPage(page => Math.max(0, page - 1))}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <span aria-live="polite">
                  {filteredFighters.length === 0
                    ? '0 fighters'
                    : `${safeRosterPage * ROSTER_PAGE_SIZE + 1}–${Math.min((safeRosterPage + 1) * ROSTER_PAGE_SIZE, filteredFighters.length)} of ${filteredFighters.length}`}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={safeRosterPage >= rosterPageCount - 1}
                  aria-label="Next fighter page"
                  onClick={() => setRosterPage(Math.min(rosterPageCount - 1, safeRosterPage + 1))}
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </section>

            <section className="arena-stage-picker glass-panel" aria-labelledby="arena-stage-picker-title">
              <div className="arena-stage-picker__header">
                <div>
                  <span><MapPin size={15} aria-hidden="true" /> Simulation stages</span>
                  <h2 id="arena-stage-picker-title">Choose the exhibition venue</h2>
                </div>
                <p>
                  Lore-based locations are reconstructed for gameplay only. They do not imply a canon fight.
                </p>
              </div>

              <div className="arena-stage-grid" role="group" aria-label="Combat stage">
                {PENTAGRAM_STAGES.map(stage => {
                  const isSelected = stage.id === selectedStage.id;
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      className={`arena-stage-choice${isSelected ? ' is-selected' : ''}`}
                      style={getPentagramStageVisualProperties(stage, 'thumbnail') as CSSProperties}
                      aria-pressed={isSelected}
                      aria-label={`Select stage ${stage.name}`}
                      aria-describedby={`arena-stage-${stage.id}-description`}
                      onClick={() => setStageId(stage.id)}
                    >
                      <span className="arena-stage-choice__district">{stage.district}</span>
                      <span className="arena-stage-choice__copy">
                        <strong>{stage.name}</strong>
                        <small id={`arena-stage-${stage.id}-description`}>{stage.description}</small>
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="arena-stage-lore-note">
                <ShieldCheck size={16} aria-hidden="true" />
                <span><strong>Lore basis:</strong> {selectedStage.loreBasis} Combat remains a Simulation AU reconstruction.</span>
              </p>

              <div className="arena-soundtrack-option">
                <Music size={20} aria-hidden="true" />
                <div>
                  <strong>{selectedStage.soundtrack.title}</strong>
                  <span>
                    Original procedural cabaret/jazz-electro · {selectedStage.soundtrack.bpm} BPM · no franchise samples
                  </span>
                </div>
                <label>
                  <input
                    type="checkbox"
                    checked={soundtrackEnabled}
                    onChange={(event) => {
                      setSoundtrackEnabled(event.target.checked);
                      if (!event.target.checked) stopSoundtrack();
                    }}
                  />
                  <span>{soundtrackEnabled ? 'Soundtrack on' : 'Start in silence'}</span>
                </label>
              </div>
            </section>

            <section
              className="arena-stage art-deco-border"
              style={selectedStageStyle}
              data-stage={selectedStage.id}
              aria-labelledby="arena-stage-title"
            >
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
                    ? `${selectedStage.name} · ${matchMode === 'ai' ? 'CPU sparring' : 'Local versus'} · first to two rounds. Results stay inside this page.`
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
            <li key={title} className={index <= 3 ? 'is-ready' : undefined}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{title}</strong><p>{description}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
