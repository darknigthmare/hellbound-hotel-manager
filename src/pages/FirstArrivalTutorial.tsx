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
  Check,
  ChevronRight,
  Gauge,
  MapPin,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { usePentagramCombatSoundtrack } from '../components/usePentagramCombatSoundtrack';
import { db } from '../db/localDb';
import {
  getCharacterSpriteAsset,
  getCharacterSpriteSheet,
  type CharacterSpriteAsset,
} from '../lib/character-sprites';
import {
  advanceFirstArrivalTutorial,
  applyFirstArrivalCompletion,
  FIRST_ARRIVAL_LESSONS,
  FIRST_ARRIVAL_MISSION,
  getFirstArrivalLesson,
  getFirstArrivalTutorialPercent,
  type FirstArrivalLessonId,
  type FirstArrivalTutorialProgress,
} from '../lib/first-arrival-tutorial';
import {
  createHotelShiftGameState,
  getHotelShiftCollectedCount,
  getHotelShiftInput,
  stepHotelShift,
  type HotelShiftGameState,
  type HotelShiftInput,
} from '../lib/hotel-shift';
import {
  HOTEL_PROLOGUE_SCENES,
  HOTEL_PROLOGUE_SPEAKERS,
  type HotelPrologueScreen,
} from '../lib/hotel-prologue';
import {
  completeOnboardingObjective,
  FIRST_SHIFT_OBJECTIVE_IDS,
} from '../lib/onboarding';
import { getCombatAnimationFrame } from '../lib/pentagram-animation';
import { getPentagramStageSpectators } from '../lib/pentagram-spectators';
import { getPentagramStage } from '../lib/pentagram-stages';
import type { CombatAnimationFrame } from '../lib/pentagram-animation';
import type { DatabaseState } from '../types';
import '../styles/hotel-shift.css';
import '../styles/first-arrival-tutorial.css';

interface FirstArrivalTutorialProps {
  state: DatabaseState;
  onStateChange: () => void;
  onComplete: () => void;
}

type TutorialStyle = CSSProperties & Record<`--shift-${string}`, string | number>;

const GAME_CODES = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'KeyA',
  'KeyD',
  'KeyE',
  'KeyF',
  'KeyQ',
  'KeyW',
  'KeyZ',
  'ShiftLeft',
  'ShiftRight',
  'Space',
]);

const SCENES_BY_LESSON: Readonly<
  Record<FirstArrivalLessonId, readonly string[]>
> = {
  move: ['tutorial-05-find-charlie'],
  jump: ['tutorial-06-cross-the-luggage'],
  markers: ['tutorial-07-niffty-supplies', 'tutorial-08-husk-reads-room'],
  dash: ['arrival-09-knock-at-door', 'arrival-10-safe-approach'],
  contact: ['arrival-11-charlie-offers-choice', 'arrival-12-recover-intake-kit'],
  stabilize: ['intake-13-walk-the-route', 'intake-14-husk-makes-space'],
  complete: ['intake-15-room-chosen', 'finale-16-first-shift'],
};

function dialogueForLesson(
  lessonId: FirstArrivalLessonId,
): readonly HotelPrologueScreen[] {
  const sceneIds = SCENES_BY_LESSON[lessonId];
  return sceneIds.flatMap(sceneId => (
    HOTEL_PROLOGUE_SCENES.find(scene => scene.id === sceneId)?.screens ?? []
  ));
}

function progressFromSave(state: DatabaseState): FirstArrivalTutorialProgress {
  const onboarding = state.gameplayMeta?.onboarding;
  const activeId = onboarding?.activeObjectiveId;
  const activeIndex = FIRST_ARRIVAL_LESSONS.findIndex(
    lesson => lesson.id === activeId,
  );
  if (activeIndex >= 0) {
    return {
      lessonIndex: activeIndex,
      completedLessonIds: FIRST_ARRIVAL_LESSONS
        .slice(0, activeIndex)
        .map(lesson => lesson.id),
    };
  }
  return {
    lessonIndex: 0,
    completedLessonIds: [],
  };
}

function gameFromSave(state: DatabaseState): HotelShiftGameState {
  const onboarding = state.gameplayMeta?.onboarding;
  const completed = new Set(onboarding?.completedObjectiveIds ?? []);
  const active = onboarding?.activeObjectiveId;
  let game = createHotelShiftGameState(FIRST_ARRIVAL_MISSION);

  if (
    completed.has('markers')
    || active === 'dash'
    || active === 'contact'
    || active === 'stabilize'
    || active === 'complete'
  ) {
    game = {
      ...game,
      playerX: active === 'dash' ? 66 : FIRST_ARRIVAL_MISSION.targetX,
      pickups: game.pickups.map(marker => ({ ...marker, collected: true })),
    };
  }
  if (completed.has('contact') || active === 'stabilize') {
    game = { ...game, phase: 'intervention' };
  }
  if (completed.has('stabilize') || active === 'complete') {
    game = {
      ...game,
      phase: 'success',
      interventionProgressMs: FIRST_ARRIVAL_MISSION.interventionRequiredMs,
    };
  }
  return game;
}

function getTutorialAction(game: HotelShiftGameState) {
  if (game.phase === 'success') return 'victory' as const;
  if (game.invulnerableMs > 0) return 'hit' as const;
  if (game.playerY > 1) return 'jump' as const;
  if (Math.abs(game.velocityX) > 1) return 'walk' as const;
  return 'idle' as const;
}

function getTutorialFrame(
  game: HotelShiftGameState,
  sprite: CharacterSpriteAsset,
): CombatAnimationFrame {
  if (game.playerY > 1) {
    const column = game.velocityY > 240
      ? 1
      : game.velocityY > 40
        ? 2
        : game.velocityY > -190
          ? 3
          : 4;
    return { clip: 'jump', frameIndex: column, bank: 'jump', column };
  }
  const action = getTutorialAction(game);
  return getCombatAnimationFrame(action, game.elapsedMs, {
    animationSetId: sprite.animationSetId,
    actionDurationMs: action === 'hit' ? 900 : undefined,
    loopElapsedMs: game.elapsedMs,
  });
}

function spriteFrameStyle(
  sprite: CharacterSpriteAsset,
  frame: CombatAnimationFrame,
): TutorialStyle {
  return {
    '--shift-sprite-column': `${frame.column * 20}%`,
    '--shift-sprite-row': `${sprite.row * (100 / 3)}%`,
    backgroundImage: `url("${getCharacterSpriteSheet(sprite, frame.bank)}")`,
  };
}

function idleSpriteStyle(
  sprite: CharacterSpriteAsset,
  elapsedMs: number,
): TutorialStyle {
  return {
    '--shift-sprite-column': `${(Math.floor(elapsedMs / 520) % 2) * 20}%`,
    '--shift-sprite-row': `${sprite.row * (100 / 3)}%`,
    backgroundImage: `url("${getCharacterSpriteSheet(sprite, 'movement')}")`,
  };
}

export function FirstArrivalTutorial({
  state,
  onStateChange,
  onComplete,
}: FirstArrivalTutorialProps) {
  const onboarding = state.gameplayMeta?.onboarding;
  const [game, setGame] = useState(() => gameFromSave(state));
  const gameRef = useRef(game);
  const [progress, setProgress] = useState(() => progressFromSave(state));
  const progressRef = useRef(progress);
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pressedCodesRef = useRef(new Set<string>());
  const pulsesRef = useRef({ jumpPressed: false, interactPressed: false });
  const touchDirectionRef = useRef<-1 | 0 | 1>(0);
  const touchDashRef = useRef(false);
  const touchPointerRef = useRef<number | null>(null);
  const lastTouchAtRef = useRef(0);
  const worldRef = useRef<HTMLDivElement>(null);
  const soundtrackArmedRef = useRef(false);
  const stage = getPentagramStage('hotel-lobby');
  const lesson = getFirstArrivalLesson(progress);
  const dialogue = useMemo(
    () => dialogueForLesson(lesson.id),
    [lesson.id],
  );
  const dialogueScreen = dialogue[dialogueIndex] ?? null;
  const dialogueSpeaker = dialogueScreen
    ? HOTEL_PROLOGUE_SPEAKERS[dialogueScreen.speakerId]
    : null;
  const dialogueVisible = dialogueScreen !== null;
  const isEnding = lesson.id === 'complete' && !dialogueVisible;
  const collectedCount = getHotelShiftCollectedCount(game);
  const atTarget = Math.abs(game.playerX - FIRST_ARRIVAL_MISSION.targetX) <= 5;
  const playerSprite = getCharacterSpriteAsset('charlie')!;
  const partnerSprite = getCharacterSpriteAsset('sim_applicant_marlow')
    ?? getCharacterSpriteAsset('vaggie')!;
  const playerFrame = getTutorialFrame(game, playerSprite);
  const ambientCharacters = useMemo(
    () => getPentagramStageSpectators(
      'hotel-lobby',
      state.timeline,
      'charlie',
      'sim_applicant_marlow',
    ).slice(0, 2),
    [state.timeline],
  );
  const {
    status: soundtrackStatus,
    start: startSoundtrack,
    pause: pauseSoundtrack,
    resume: resumeSoundtrack,
    stop: stopSoundtrack,
  } = usePentagramCombatSoundtrack();

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

  const advanceDialogue = useCallback(() => {
    setDialogueIndex(index => Math.min(index + 1, dialogue.length));
  }, [dialogue.length]);

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

  useEffect(() => () => stopSoundtrack(), [stopSoundtrack]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement
        && target.matches('button, input, textarea, select, [contenteditable="true"]')
      ) return;
      if (
        dialogueVisible
        && (event.code === 'Enter' || event.code === 'Space' || event.code === 'ArrowRight')
      ) {
        event.preventDefault();
        advanceDialogue();
        return;
      }
      if (event.code === 'Escape') {
        event.preventDefault();
        setPaused(value => !value);
        return;
      }
      if (dialogueVisible || isEnding || paused || !GAME_CODES.has(event.code)) return;
      event.preventDefault();
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
      if (!event.repeat && (event.code === 'KeyE' || event.code === 'KeyF')) {
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
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      clearInputs();
    };
  }, [
    advanceDialogue,
    clearInputs,
    dialogueVisible,
    ensureSoundtrack,
    isEnding,
    paused,
  ]);

  useEffect(() => {
    if (dialogueVisible || isEnding || paused) return;
    let animationFrame = 0;
    let previousTime = window.performance.now();
    const runFrame = (now: number) => {
      const deltaMs = Math.min(160, Math.max(0, now - previousTime));
      previousTime = now;
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
      const previousGame = gameRef.current;
      const nextGame = stepHotelShift(
        previousGame,
        FIRST_ARRIVAL_MISSION,
        input,
        deltaMs,
      );
      gameRef.current = nextGame;
      setGame(nextGame);
      const nextProgress = advanceFirstArrivalTutorial(
        progressRef.current,
        previousGame,
        nextGame,
        input,
      );
      if (nextProgress !== progressRef.current) {
        progressRef.current = nextProgress;
        setProgress(nextProgress);
        setDialogueIndex(0);
      }
      animationFrame = window.requestAnimationFrame(runFrame);
    };
    animationFrame = window.requestAnimationFrame(runFrame);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [dialogueVisible, isEnding, paused]);

  useEffect(() => {
    if (progress.lessonIndex <= 0 || !onboarding) return;
    const completedLesson = FIRST_ARRIVAL_LESSONS[progress.lessonIndex - 1];
    if (!completedLesson || completedLesson.id === 'complete') return;
    if (onboarding.completedObjectiveIds.includes(completedLesson.id)) return;

    const saved = db.transaction('ONBOARDING_OBJECTIVE_COMPLETED', (draft) => {
      if (!draft.gameplayMeta) throw new Error('Gameplay metadata is unavailable.');
      draft.gameplayMeta.onboarding = completeOnboardingObjective(
        draft.gameplayMeta.onboarding,
        completedLesson.id,
        FIRST_SHIFT_OBJECTIVE_IDS,
        draft.gameplayMeta.campaignDay,
      );
    }, {
      action: 'ONBOARDING_OBJECTIVE_COMPLETED',
      details: `First-arrival lesson completed through active play: ${completedLesson.id}.`,
    });
    if (saved) onStateChange();
  }, [onStateChange, onboarding, progress.lessonIndex]);

  const finishTutorial = () => {
    const saved = db.transaction('ONBOARDING_COMPLETED', (draft) => {
      if (!draft.gameplayMeta) throw new Error('Gameplay metadata is unavailable.');
      const current = draft.gameplayMeta.onboarding;
      current.completedSceneIds = [
        ...new Set([
          ...current.completedSceneIds,
          ...HOTEL_PROLOGUE_SCENES.map(scene => scene.id),
        ]),
      ];
      draft.gameplayMeta.onboarding = completeOnboardingObjective(
        current,
        'complete',
        FIRST_SHIFT_OBJECTIVE_IDS,
        draft.gameplayMeta.campaignDay,
      );
      applyFirstArrivalCompletion(draft);
    }, {
      action: 'ONBOARDING_COMPLETED',
      details: 'The full first-arrival prologue was completed through guided play.',
    });
    if (!saved) return;
    onStateChange();
    onComplete();
  };

  const retryTutorial = () => {
    const restoredGame = gameFromSave(state);
    gameRef.current = restoredGame;
    setGame(restoredGame);
    setPaused(false);
    clearInputs();
  };

  const updateTouchDirection = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width;
    touchDirectionRef.current = relativeX < 0.44 ? -1 : relativeX > 0.56 ? 1 : 0;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dialogueVisible || isEnding || paused || touchPointerRef.current !== null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
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
    if (touchPointerRef.current === event.pointerId) updateTouchDirection(event);
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (touchPointerRef.current !== event.pointerId) return;
    touchPointerRef.current = null;
    touchDirectionRef.current = 0;
    touchDashRef.current = false;
  };

  const stageStyle = {
    '--shift-stage-art': `url("${stage.imagePath}")`,
    '--shift-stage-position': stage.imagePosition,
    '--shift-stage-accent': stage.accent,
    '--shift-stage-floor': stage.floor,
  } as TutorialStyle;
  const playerStyle = {
    '--shift-player-x': `${game.playerX}%`,
    '--shift-player-y': `${game.playerY}px`,
    '--shift-player-facing': game.facing === 'left' ? -1 : 1,
    ...spriteFrameStyle(playerSprite, playerFrame),
  } as TutorialStyle;
  const partnerStyle = {
    '--shift-partner-x': `${FIRST_ARRIVAL_MISSION.targetX}%`,
    '--shift-partner-facing': -1,
    ...idleSpriteStyle(partnerSprite, game.elapsedMs),
  } as TutorialStyle;
  const interventionStyle = {
    '--shift-balance': `${(game.interventionBalance + 1) * 50}%`,
    '--shift-balance-target': `${(game.interventionTarget + 1) * 50}%`,
    '--shift-intervention-progress': `${
      (game.interventionProgressMs / FIRST_ARRIVAL_MISSION.interventionRequiredMs) * 100
    }%`,
  } as TutorialStyle;

  return (
    <main className="first-arrival-page" aria-labelledby="first-arrival-title">
      <header className="first-arrival-heading">
        <div>
          <span>Playable prologue · Chapter {Math.min(progress.lessonIndex + 1, 7)}/7</span>
          <h1 id="first-arrival-title">The First Knock</h1>
        </div>
        <button type="button" onClick={() => setPaused(value => !value)}>
          {paused ? 'Resume' : 'Pause'} <kbd>Esc</kbd>
        </button>
      </header>

      <article className="hotel-shift-shell first-arrival-shell">
        <header className="first-arrival-hud">
          <div className="first-arrival-hud__objective">
            <Sparkles size={19} aria-hidden="true" />
            <div>
              <span>{lesson.eyebrow}</span>
              <strong>{lesson.objective}</strong>
            </div>
          </div>
          <div>
            <Gauge size={17} aria-hidden="true" />
            <span>Resolve</span>
            <strong>{Math.ceil(game.resolve)}</strong>
          </div>
          <div>
            <Search size={17} aria-hidden="true" />
            <span>Welcome kit</span>
            <strong>{collectedCount}/3</strong>
          </div>
          <div>
            <Check size={17} aria-hidden="true" />
            <span>Training</span>
            <strong>{getFirstArrivalTutorialPercent(progress)}%</strong>
          </div>
        </header>

        <div
          ref={worldRef}
          className={`hotel-shift-world first-arrival-world${game.invulnerableMs > 0 ? ' is-hit' : ''}`}
          style={stageStyle}
          tabIndex={0}
          role="region"
          aria-label="Playable hotel arrival tutorial"
          data-game-phase={paused ? 'paused' : game.phase}
          data-tutorial-lesson={lesson.id}
          data-player-x={game.playerX.toFixed(2)}
          data-player-y={game.playerY.toFixed(2)}
          data-marker-count={collectedCount}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div className="hotel-shift-world__parallax is-far" aria-hidden="true" />
          <div className="hotel-shift-world__parallax is-mid" aria-hidden="true" />
          <div className="hotel-shift-world__floor" aria-hidden="true" />

          {ambientCharacters.map(({ id, name, sprite }, index) => (
            <span
              className={`hotel-shift-ambient is-${index === 0 ? 'far' : 'mid'}`}
              key={id}
              style={{
                '--shift-ambient-x': `${index === 0 ? 25 : 59}%`,
                '--shift-ambient-facing': index === 0 ? 1 : -1,
                ...idleSpriteStyle(sprite, game.elapsedMs + index * 210),
              } as TutorialStyle}
              title={name}
              data-ambient-id={id}
              aria-hidden="true"
            />
          ))}

          {game.pickups.filter(marker => !marker.collected).map(marker => (
            <span
              className="hotel-shift-pickup"
              key={marker.id}
              style={{
                '--shift-object-x': `${marker.x}%`,
                '--shift-object-y': `${marker.y}px`,
              } as TutorialStyle}
              aria-hidden="true"
            >
              <Search size={24} />
            </span>
          ))}

          {game.hazards.map(hazard => (
            <span
              className="hotel-shift-hazard"
              key={hazard.id}
              style={{ '--shift-object-x': `${hazard.x}%` } as TutorialStyle}
              aria-hidden="true"
            >
              <ShieldAlert size={27} />
            </span>
          ))}

          <span
            className={`hotel-shift-target${atTarget ? ' is-near' : ''}`}
            style={{ '--shift-object-x': `${FIRST_ARRIVAL_MISSION.targetX}%` } as TutorialStyle}
            aria-hidden="true"
          >
            <MapPin size={28} />
            <strong>Front desk</strong>
          </span>

          <span className="hotel-shift-partner" style={partnerStyle} aria-hidden="true">
            <span className="hotel-shift-sprite-frame" />
            <strong>Marlow</strong>
          </span>

          <span
            className="hotel-shift-player"
            style={playerStyle}
            data-facing={game.facing}
            data-action={getTutorialAction(game)}
            aria-hidden="true"
          >
            <span className="hotel-shift-player__shadow" />
            <span className="hotel-shift-sprite-frame" />
            <strong>Charlie</strong>
          </span>

          {!dialogueVisible && !isEnding && game.phase !== 'failure' && (
            <aside className="first-arrival-lesson" aria-live="polite">
              <span>{lesson.eyebrow}</span>
              <strong>{lesson.instruction}</strong>
            </aside>
          )}

          {game.phase === 'intervention' && !dialogueVisible && (
            <div className="hotel-shift-intervention" style={interventionStyle}>
              <span>ACTIVE LISTENING · HOLD LEFT / RIGHT</span>
              <strong>{FIRST_ARRIVAL_MISSION.interventionLabel}</strong>
              <div className="hotel-shift-balance" aria-hidden="true">
                <i className="hotel-shift-balance__window" />
                <i className="hotel-shift-balance__needle" />
              </div>
              <div className="hotel-shift-progress" aria-hidden="true"><i /></div>
            </div>
          )}

          {dialogueVisible && dialogueSpeaker && (
            <section className="first-arrival-dialogue" aria-live="polite">
              {dialogueSpeaker.portraitPath && (
                <img src={dialogueSpeaker.portraitPath} alt="" aria-hidden="true" />
              )}
              <div>
                <span>{dialogueSpeaker.name}</span>
                <p>{dialogueScreen.copy}</p>
                <button type="button" onClick={advanceDialogue}>
                  Continue <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </section>
          )}

          {isEnding && (
            <section className="first-arrival-ending">
              <span>Prologue complete</span>
              <h2>The door stays open.</h2>
              <p>
                Marlow chose a safe room. The live campaign now turns hotel
                needs into playable shifts, with one clear objective at a time.
              </p>
              <button type="button" onClick={finishTutorial}>
                Open the hotel <ChevronRight size={17} aria-hidden="true" />
              </button>
            </section>
          )}

          {game.phase === 'failure' && (
            <section className="first-arrival-ending">
              <span>Safe reset</span>
              <h2>Try that lesson again.</h2>
              <p>No story consequence was recorded. The tutorial restores the current checkpoint.</p>
              <button type="button" onClick={retryTutorial}>Retry checkpoint</button>
            </section>
          )}

          {paused && !dialogueVisible && (
            <div className="hotel-shift-state-banner is-paused">
              <span>Tutorial paused</span>
              <strong>Press Escape or use Resume to continue.</strong>
            </div>
          )}
        </div>

        <footer className="first-arrival-footer">
          <span><kbd>Q</kbd>/<kbd>A</kbd> <kbd>D</kbd> move</span>
          <span><kbd>Z</kbd>/<kbd>W</kbd>/<kbd>Space</kbd> jump</span>
          <span><kbd>Shift</kbd> dash</span>
          <span><kbd>E</kbd>/<kbd>F</kbd> interact</span>
          <span>Audio: {soundtrackStatus === 'idle' ? 'starts on first move' : soundtrackStatus}</span>
        </footer>
      </article>
    </main>
  );
}
