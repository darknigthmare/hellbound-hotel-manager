import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  Crosshair,
  Footprints,
  Gauge,
  HeartPulse,
  MapPin,
  PackageCheck,
  RadioTower,
  Search,
  ShieldAlert,
  Timer,
  Zap,
} from 'lucide-react';
import { usePentagramCombatSoundtrack } from '../components/usePentagramCombatSoundtrack';
import { db } from '../db/localDb';
import {
  getCharacterSpriteAsset,
  getCharacterSpriteSheet,
  type CharacterSpriteAsset,
} from '../lib/character-sprites';
import {
  createHotelShiftGameState,
  getHotelShiftCollectedCount,
  getHotelShiftInput,
  selectHotelShiftMission,
  stepHotelShift,
  type HotelShiftGameState,
  type HotelShiftInput,
  type HotelShiftMission,
} from '../lib/hotel-shift';
import {
  applyHotelShiftFailure,
  applyHotelShiftMissionCompletion,
} from '../lib/hotel-shift-resolution';
import { getCombatAnimationFrame } from '../lib/pentagram-animation';
import { getPentagramStageSpectators } from '../lib/pentagram-spectators';
import {
  getPentagramStage,
  type PentagramStageId,
} from '../lib/pentagram-stages';
import type { CombatAnimationFrame } from '../lib/pentagram-animation';
import type { CombatAction } from '../lib/pentagram-combat';
import type { DatabaseState, TaskType } from '../types';
import '../styles/hotel-shift.css';

interface HotelShiftProps {
  state: DatabaseState;
  onStateChange: () => void;
}

type ShiftStyle = CSSProperties & Record<`--shift-${string}`, string | number>;

const GAME_CODES = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'KeyA',
  'KeyD',
  'KeyE',
  'KeyF',
  'KeyP',
  'KeyQ',
  'KeyW',
  'KeyZ',
  'ShiftLeft',
  'ShiftRight',
  'Space',
]);

function stageForTaskType(taskType: TaskType | undefined): PentagramStageId {
  if (taskType === 'conflict_resolution' || taskType === 'rehab_prep') return 'hotel-bar';
  if (
    taskType === 'media_response'
    || taskType === 'heaven_watch'
    || taskType === 'vees_watch'
  ) return 'hotel-exterior';
  return 'hotel-lobby';
}

function stageForMission(
  state: DatabaseState,
  mission: HotelShiftMission,
): PentagramStageId {
  if (mission.kind === 'incident') {
    const incident = state.incidents.find(candidate => candidate.id === mission.sourceId);
    if (
      incident?.type === 'staff_conflict'
      || incident?.type === 'relapse'
      || incident?.type === 'violence'
    ) return 'hotel-bar';
    return 'hotel-exterior';
  }
  if (mission.kind === 'task') {
    return stageForTaskType(
      state.staffTasks.find(candidate => candidate.id === mission.sourceId)?.type,
    );
  }
  return 'hotel-lobby';
}

function getShiftAction(game: HotelShiftGameState): CombatAction {
  if (game.phase === 'success') return 'victory';
  if (game.invulnerableMs > 0) return 'hit';
  if (game.playerY > 1) return 'jump';
  if (Math.abs(game.velocityX) > 1) return 'walk';
  return 'idle';
}

function getShiftAnimationFrame(
  game: HotelShiftGameState,
  sprite: CharacterSpriteAsset,
): CombatAnimationFrame {
  const action = getShiftAction(game);
  if (action === 'jump') {
    const column = game.velocityY > 240
      ? 1
      : game.velocityY > 40
        ? 2
        : game.velocityY > -190
          ? 3
          : 4;
    return { clip: 'jump', frameIndex: column, bank: 'jump', column };
  }
  return getCombatAnimationFrame(
    action,
    action === 'hit' ? game.invulnerableMs : 0,
    {
      animationSetId: sprite.animationSetId,
      actionDurationMs: action === 'hit' ? 900 : undefined,
      loopElapsedMs: game.elapsedMs,
    },
  );
}

function spriteFrameStyle(
  sprite: CharacterSpriteAsset,
  frame: CombatAnimationFrame,
): ShiftStyle {
  return {
    '--shift-sprite-column': `${frame.column * 20}%`,
    '--shift-sprite-row': `${sprite.row * (100 / 3)}%`,
    backgroundImage: `url("${getCharacterSpriteSheet(sprite, frame.bank)}")`,
  };
}

function idleSpriteStyle(
  sprite: CharacterSpriteAsset,
  elapsedMs: number,
): ShiftStyle {
  const column = Math.floor(elapsedMs / 520) % 2;
  return {
    '--shift-sprite-column': `${column * 20}%`,
    '--shift-sprite-row': `${sprite.row * (100 / 3)}%`,
    backgroundImage: `url("${getCharacterSpriteSheet(sprite, 'movement')}")`,
  };
}

function renderMissionMarkerIcon(mission: HotelShiftMission) {
  if (mission.kind === 'room') return <PackageCheck size={17} aria-hidden="true" />;
  if (mission.kind === 'incident') return <ShieldAlert size={17} aria-hidden="true" />;
  if (mission.kind === 'patrol') return <HeartPulse size={17} aria-hidden="true" />;
  if (mission.kind === 'practice') return <Footprints size={17} aria-hidden="true" />;
  return <Search size={17} aria-hidden="true" />;
}

function formatSeconds(milliseconds: number): string {
  return String(Math.max(0, Math.ceil(milliseconds / 1_000))).padStart(2, '0');
}

export function HotelShift({ state, onStateChange }: HotelShiftProps) {
  const mission = useMemo(() => selectHotelShiftMission(state), [state]);
  const stageId = useMemo(
    () => stageForMission(state, mission),
    [mission, state],
  );
  const stage = useMemo(() => getPentagramStage(stageId), [stageId]);
  const [game, setGame] = useState(() => createHotelShiftGameState(mission));
  const [paused, setPaused] = useState(false);
  const pressedCodesRef = useRef(new Set<string>());
  const pulsesRef = useRef({
    jumpPressed: false,
    interactPressed: false,
  });
  const touchDirectionRef = useRef<-1 | 0 | 1>(0);
  const touchDashRef = useRef(false);
  const touchPointerRef = useRef<number | null>(null);
  const lastTouchAtRef = useRef(0);
  const handledOutcomeRef = useRef('');
  const activeMissionIdRef = useRef(mission.id);
  const worldRef = useRef<HTMLDivElement>(null);
  const soundtrackArmedRef = useRef(false);
  const {
    status: soundtrackStatus,
    start: startSoundtrack,
    stop: stopSoundtrack,
    pause: pauseSoundtrack,
    resume: resumeSoundtrack,
  } = usePentagramCombatSoundtrack();

  const playerSprite = getCharacterSpriteAsset(mission.playerId)
    ?? getCharacterSpriteAsset('vaggie')!;
  const partnerSprite = getCharacterSpriteAsset(mission.partnerId)
    ?? getCharacterSpriteAsset('charlie')!;
  const playerCharacter = state.characters.find(character => (
    character.id === mission.playerId
  ));
  const partnerCharacter = state.characters.find(character => (
    character.id === mission.partnerId
  ));
  const playerName = playerCharacter?.name ?? mission.playerId;
  const partnerName = partnerCharacter?.name ?? mission.partnerId;
  const playerFrame = getShiftAnimationFrame(game, playerSprite);
  const collectedCount = getHotelShiftCollectedCount(game);
  const atTarget = Math.abs(game.playerX - mission.targetX) <= 5;
  const ambientCharacters = useMemo(
    () => getPentagramStageSpectators(
      stageId,
      state.timeline,
      mission.playerId,
      mission.partnerId,
    ).slice(0, 2),
    [mission.partnerId, mission.playerId, stageId, state.timeline],
  );

  const stageStyle = {
    '--shift-stage-art': `url("${stage.imagePath}")`,
    '--shift-stage-position': stage.imagePosition,
    '--shift-stage-accent': stage.accent,
    '--shift-stage-floor': stage.floor,
  } as ShiftStyle;
  const playerStyle = {
    '--shift-player-x': `${game.playerX}%`,
    '--shift-player-y': `${game.playerY}px`,
    '--shift-player-facing': game.facing === 'left' ? -1 : 1,
    ...spriteFrameStyle(playerSprite, playerFrame),
  } as ShiftStyle;
  const partnerStyle = {
    '--shift-partner-x': `${mission.targetX}%`,
    '--shift-partner-facing': mission.targetX < 50 ? 1 : -1,
    ...idleSpriteStyle(partnerSprite, game.elapsedMs),
  } as ShiftStyle;

  const clearInputs = useCallback(() => {
    pressedCodesRef.current.clear();
    touchDirectionRef.current = 0;
    touchDashRef.current = false;
    touchPointerRef.current = null;
    pulsesRef.current.jumpPressed = false;
    pulsesRef.current.interactPressed = false;
  }, []);

  const ensureSoundtrack = useCallback(() => {
    if (soundtrackArmedRef.current) return;
    soundtrackArmedRef.current = true;
    void startSoundtrack(stage.soundtrack, { paused });
  }, [paused, stage.soundtrack, startSoundtrack]);

  useEffect(() => {
    if (activeMissionIdRef.current === mission.id) return;
    activeMissionIdRef.current = mission.id;
    setGame(createHotelShiftGameState(mission));
    handledOutcomeRef.current = '';
    clearInputs();
    setPaused(false);
    worldRef.current?.focus({ preventScroll: true });
  }, [clearInputs, mission]);

  useEffect(() => {
    worldRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    soundtrackArmedRef.current = false;
    stopSoundtrack();
  }, [stage.id, stopSoundtrack]);

  useEffect(() => {
    if (paused) {
      pauseSoundtrack();
      clearInputs();
    } else if (soundtrackStatus === 'paused') {
      resumeSoundtrack();
    }
  }, [
    clearInputs,
    pauseSoundtrack,
    paused,
    resumeSoundtrack,
    soundtrackStatus,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement
        && target.matches('input, textarea, select, [contenteditable="true"]')
      ) return;
      if (!GAME_CODES.has(event.code)) return;
      event.preventDefault();
      worldRef.current?.focus({ preventScroll: true });
      if (event.code === 'KeyP' && !event.repeat) {
        ensureSoundtrack();
        setPaused(value => !value);
        return;
      }
      if (paused) return;
      ensureSoundtrack();
      pressedCodesRef.current.add(event.code);
      if (!event.repeat && (
        event.code === 'Space'
        || event.code === 'ArrowUp'
        || event.code === 'KeyW'
        || event.code === 'KeyZ'
      )) {
        pulsesRef.current.jumpPressed = true;
      }
      if (!event.repeat && (
        event.code === 'KeyE'
        || event.code === 'KeyF'
      )) {
        pulsesRef.current.interactPressed = true;
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      pressedCodesRef.current.delete(event.code);
    };
    const handleBlur = () => {
      clearInputs();
      setPaused(true);
    };
    const handleVisibility = () => {
      if (document.hidden) handleBlur();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInputs();
    };
  }, [clearInputs, ensureSoundtrack, paused]);

  useEffect(() => {
    let animationFrame = 0;
    let previousTime = window.performance.now();
    const runFrame = (now: number) => {
      const deltaMs = Math.min(160, Math.max(0, now - previousTime));
      previousTime = now;
      if (!paused) {
        const keyboardInput = getHotelShiftInput(
          pressedCodesRef.current,
          pulsesRef.current,
        );
        const touchDirection = touchDirectionRef.current;
        const input: HotelShiftInput = {
          ...keyboardInput,
          left: keyboardInput.left || touchDirection < 0,
          right: keyboardInput.right || touchDirection > 0,
          dash: keyboardInput.dash || touchDashRef.current,
        };
        pulsesRef.current.jumpPressed = false;
        pulsesRef.current.interactPressed = false;
        setGame(current => stepHotelShift(current, mission, input, deltaMs));
      }
      animationFrame = window.requestAnimationFrame(runFrame);
    };
    animationFrame = window.requestAnimationFrame(runFrame);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [mission, paused]);

  useEffect(() => {
    if (game.phase === 'success') {
      const outcomeKey = `success:${mission.id}`;
      if (handledOutcomeRef.current) return;
      handledOutcomeRef.current = outcomeKey;
      if (mission.kind === 'practice') {
        const practiceTimer = window.setTimeout(() => {
          handledOutcomeRef.current = '';
          setGame(createHotelShiftGameState(mission));
        }, 2_200);
        return () => window.clearTimeout(practiceTimer);
      }

      const saved = db.transaction('HOTEL_SHIFT_OBJECTIVE_COMPLETED', (draft, inventory) => {
        const resolution = applyHotelShiftMissionCompletion(mission, draft, inventory);
        if (!resolution.ok) throw new Error(resolution.message);
      }, {
        action: 'HOTEL_SHIFT_OBJECTIVE_COMPLETED',
        details: `${mission.id} completed through active play with score ${game.score}.`,
      });
      if (!saved) {
        handledOutcomeRef.current = `commit-error:${mission.id}`;
        const commitFailureTimer = window.setTimeout(() => {
          setGame(current => ({
            ...current,
            phase: 'failure',
            message: db.getStorageStatus().lastError?.message
              ?? 'The active objective could not be committed safely.',
            messageMs: 4_000,
          }));
        }, 0);
        return () => window.clearTimeout(commitFailureTimer);
      }
      const refreshTimer = window.setTimeout(onStateChange, 2_300);
      return () => window.clearTimeout(refreshTimer);
    }

    if (game.phase !== 'failure') return;

    const isCommitError = handledOutcomeRef.current.startsWith('commit-error:');
    if (!handledOutcomeRef.current) {
      handledOutcomeRef.current = `failure:${mission.id}`;
      db.transaction('HOTEL_SHIFT_OBJECTIVE_FAILED', (draft) => {
        const resolution = applyHotelShiftFailure(mission, draft);
        if (!resolution.ok) throw new Error(resolution.message);
      }, {
        action: 'HOTEL_SHIFT_OBJECTIVE_FAILED',
        details: `${mission.id} ended in a safe operational retreat.`,
      });
      onStateChange();
    }

    const retryTimer = window.setTimeout(() => {
      handledOutcomeRef.current = '';
      setGame(createHotelShiftGameState(mission));
    }, isCommitError ? 3_600 : 2_800);
    return () => window.clearTimeout(retryTimer);
  }, [game.phase, game.score, mission, onStateChange]);

  useEffect(() => {
    if (typeof window.Image !== 'function') return;
    const urls = new Set([
      getCharacterSpriteSheet(playerSprite, 'movement'),
      getCharacterSpriteSheet(playerSprite, 'jump'),
      getCharacterSpriteSheet(playerSprite, 'recoil'),
      getCharacterSpriteSheet(partnerSprite, 'movement'),
    ]);
    ambientCharacters.forEach(({ sprite }) => {
      urls.add(getCharacterSpriteSheet(sprite, 'movement'));
    });
    urls.forEach((url) => {
      const preload = new window.Image();
      preload.src = url;
    });
  }, [ambientCharacters, partnerSprite, playerSprite]);

  const updateTouchDirection = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width;
    touchDirectionRef.current = relativeX < 0.44 ? -1 : relativeX > 0.56 ? 1 : 0;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (paused || touchPointerRef.current !== null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    worldRef.current?.focus({ preventScroll: true });
    touchPointerRef.current = event.pointerId;
    ensureSoundtrack();
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeY = (event.clientY - bounds.top) / bounds.height;
    const relativeX = (event.clientX - bounds.left) / bounds.width;
    if (game.phase === 'intervention') {
      touchDirectionRef.current = relativeX < 0.5 ? -1 : 1;
      return;
    }
    if (relativeY < 0.48) {
      pulsesRef.current.jumpPressed = true;
      return;
    }
    if (relativeX >= 0.44 && relativeX <= 0.56) {
      pulsesRef.current.interactPressed = true;
      return;
    }
    const now = window.performance.now();
    touchDashRef.current = now - lastTouchAtRef.current < 320;
    lastTouchAtRef.current = now;
    updateTouchDirection(event);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (touchPointerRef.current !== event.pointerId) return;
    updateTouchDirection(event);
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (touchPointerRef.current !== event.pointerId) return;
    touchPointerRef.current = null;
    touchDirectionRef.current = 0;
    touchDashRef.current = false;
  };

  const interventionStyle = {
    '--shift-balance': `${(game.interventionBalance + 1) * 50}%`,
    '--shift-balance-target': `${(game.interventionTarget + 1) * 50}%`,
    '--shift-intervention-progress': `${
      (game.interventionProgressMs / mission.interventionRequiredMs) * 100
    }%`,
  } as ShiftStyle;

  return (
    <section className="page-container hotel-shift-page" aria-labelledby="hotel-shift-title">
      <div className="hotel-shift-heading">
        <div>
          <span className="hotel-shift-kicker">MAIN PLAYABLE CAMPAIGN · SIMULATION AU</span>
          <h1 id="hotel-shift-title">Hotel Shift</h1>
          <p>{mission.title} · {stage.name}</p>
        </div>
        <div className="hotel-shift-controls-copy" aria-label="Game controls">
          <span><kbd>Q</kbd>/<kbd>A</kbd> <kbd>D</kbd> move</span>
          <span><kbd>Z</kbd>/<kbd>W</kbd>/<kbd>Space</kbd> jump</span>
          <span><kbd>Shift</kbd> dash · <kbd>E</kbd>/<kbd>F</kbd> interact</span>
          <span><kbd>P</kbd> pause</span>
        </div>
      </div>

      <div className="hotel-shift-lore-guard" role="note">
        <ShieldAlert size={18} aria-hidden="true" />
        <div>
          <strong>Lore-safe campaign reconstruction</strong>
          <span>
            Field outcomes change only operational Simulation AU data. They never rewrite
            an episode, declare a soul redeemed or invent a canon death.
          </span>
        </div>
      </div>

      <article className="hotel-shift-shell">
        <header className="hotel-shift-hud">
          <div className="hotel-shift-hud__mission">
            <Crosshair size={18} aria-hidden="true" />
            <div>
              <span>ACTIVE OBJECTIVE</span>
              <strong>{mission.objective}</strong>
            </div>
          </div>
          <div className="hotel-shift-hud__stat is-time">
            <Timer size={17} aria-hidden="true" />
            <span>SHIFT</span>
            <strong>{formatSeconds(game.timeLeftMs)}</strong>
          </div>
          <div className="hotel-shift-hud__stat is-resolve">
            <Gauge size={17} aria-hidden="true" />
            <span>RESOLVE</span>
            <strong>{Math.ceil(game.resolve)}</strong>
          </div>
          <div className="hotel-shift-hud__stat is-stamina">
            <Zap size={17} aria-hidden="true" />
            <span>STAMINA</span>
            <strong>{Math.ceil(game.stamina)}</strong>
          </div>
          <div className="hotel-shift-hud__stat is-markers">
            {renderMissionMarkerIcon(mission)}
            <span>MARKERS</span>
            <strong>{collectedCount}/3</strong>
          </div>
          <div className="hotel-shift-hud__stat is-score">
            <span>SCORE</span>
            <strong>{game.score.toLocaleString()}</strong>
          </div>
        </header>

        <div
          ref={worldRef}
          className={`hotel-shift-world${game.invulnerableMs > 0 ? ' is-hit' : ''}`}
          style={stageStyle}
          tabIndex={0}
          role="region"
          aria-label={`Playable ${stage.name}. Move with Q or A and D, jump with Z, W or Space, interact with E or F.`}
          data-game-phase={paused ? 'paused' : game.phase}
          data-mission-id={mission.id}
          data-player-id={mission.playerId}
          data-partner-id={mission.partnerId}
          data-stage-id={stage.id}
          data-player-x={game.playerX.toFixed(2)}
          data-player-y={game.playerY.toFixed(2)}
          data-marker-count={collectedCount}
          data-resolve={Math.ceil(game.resolve)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div className="hotel-shift-world__parallax is-far" aria-hidden="true" />
          <div className="hotel-shift-world__parallax is-mid" aria-hidden="true" />
          <div className="hotel-shift-world__floor" aria-hidden="true" />

          {ambientCharacters.map(({ id, name, sprite, slot }, index) => (
            <span
              className={`hotel-shift-ambient is-${index === 0 ? 'far' : 'mid'}`}
              key={id}
              style={{
                '--shift-ambient-x': `${index === 0 ? 24 : 62}%`,
                '--shift-ambient-facing': slot.facing === 'left' ? -1 : 1,
                ...idleSpriteStyle(sprite, game.elapsedMs + index * 190),
              } as ShiftStyle}
              title={name}
              data-ambient-id={id}
              aria-hidden="true"
            />
          ))}

          {game.pickups.filter(pickup => !pickup.collected).map(pickup => (
            <span
              className="hotel-shift-pickup"
              key={pickup.id}
              style={{
                '--shift-object-x': `${pickup.x}%`,
                '--shift-object-y': `${pickup.y}px`,
              } as ShiftStyle}
              aria-hidden="true"
            >
              <Search size={24} />
            </span>
          ))}

          {game.hazards.map((hazard, index) => (
            <span
              className="hotel-shift-hazard"
              key={hazard.id}
              style={{ '--shift-object-x': `${hazard.x}%` } as ShiftStyle}
              aria-hidden="true"
            >
              {stageId === 'hotel-exterior'
                ? <RadioTower size={27} />
                : <ShieldAlert size={27} />}
              <i>{index + 1}</i>
            </span>
          ))}

          <span
            className={`hotel-shift-target${atTarget ? ' is-near' : ''}`}
            style={{ '--shift-object-x': `${mission.targetX}%` } as ShiftStyle}
            aria-hidden="true"
          >
            <MapPin size={28} />
            <strong>{mission.targetLabel}</strong>
          </span>

          <span className="hotel-shift-partner" style={partnerStyle} aria-hidden="true">
            <span className="hotel-shift-sprite-frame" />
            <strong>{partnerName}</strong>
          </span>

          <span
            className="hotel-shift-player"
            style={playerStyle}
            data-facing={game.facing}
            data-action={getShiftAction(game)}
            data-animation-bank={playerFrame.bank}
            data-animation-column={playerFrame.column}
            aria-hidden="true"
          >
            <span className="hotel-shift-player__shadow" />
            <span className="hotel-shift-sprite-frame" />
            <strong>{playerName}</strong>
          </span>

          {game.phase === 'intervention' && (
            <div className="hotel-shift-intervention" style={interventionStyle}>
              <span>ACTIVE STABILIZATION · HOLD LEFT / RIGHT</span>
              <strong>{mission.interventionLabel}</strong>
              <div className="hotel-shift-balance" aria-hidden="true">
                <i className="hotel-shift-balance__window" />
                <i className="hotel-shift-balance__needle" />
              </div>
              <div className="hotel-shift-progress" aria-hidden="true"><i /></div>
            </div>
          )}

          {(paused || game.phase === 'success' || game.phase === 'failure') && (
            <div className={`hotel-shift-state-banner is-${paused ? 'paused' : game.phase}`}>
              <span>{paused ? 'SHIFT PAUSED' : game.phase === 'success' ? 'OBJECTIVE COMPLETE' : 'SAFE RETREAT'}</span>
              <strong>
                {paused
                  ? 'Press P to resume.'
                  : game.phase === 'success'
                    ? mission.rewardSummary
                    : game.message}
              </strong>
            </div>
          )}

          <div className="hotel-shift-message" aria-live="polite" aria-atomic="true">
            {game.messageMs > 0 ? game.message : ''}
          </div>
          <div className="hotel-shift-touch-hint" aria-hidden="true">
            HOLD LEFT / RIGHT EDGE · TAP UPPER FIELD TO JUMP · TAP CENTER TO INTERACT
          </div>
        </div>

        <footer className="hotel-shift-footer">
          <div>
            <span>FIELD LEAD</span>
            <strong>{playerName}</strong>
          </div>
          <div>
            <span>CONTACT</span>
            <strong>{partnerName}</strong>
          </div>
          <div>
            <span>VENUE BASIS</span>
            <strong>{stage.loreBasis}</strong>
          </div>
          <div>
            <span>AUDIO</span>
            <strong>{soundtrackStatus === 'idle' ? 'Starts on first movement' : soundtrackStatus}</strong>
          </div>
        </footer>
      </article>
    </section>
  );
}
