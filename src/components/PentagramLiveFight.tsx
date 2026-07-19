import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import {
  getCharacterCinematicSpriteSheet,
  getCharacterSpriteAsset,
  getCharacterSpriteSheet,
} from '../lib/character-sprites';
import { getCombatAnimationFrame } from '../lib/pentagram-animation';
import {
  getPentagramCinematicDuration,
  getPentagramCinematicFrame,
  type PentagramCinematicKind,
} from '../lib/pentagram-cinematics';
import {
  COMBAT_AI_DIFFICULTY_LABELS,
  decideCombatAi,
  getCombatAiThinkInterval,
  type CombatAiDifficulty,
} from '../lib/pentagram-ai';
import {
  createCombatState,
  createNextCombatRound,
  getCombatAttackDuration,
  getCombatPoseActionDuration,
  isCombatAttackAction,
  isCombatPoseAction,
  releaseCombatGuard,
  resolveCombatAttack,
  resolveCombatPoseAction,
  stepCombat,
  type CombatAction,
  type CombatAttack,
  type CombatInputs,
  type CombatPoseAction,
  type CombatState,
  type CombatantDefinition,
  type PlayerSide,
} from '../lib/pentagram-combat';
import {
  getPentagramStageVisualProperties,
  type PentagramStage,
} from '../lib/pentagram-stages';
import type { Character, TimelineState } from '../types';
import { PentagramStageSpectators } from './PentagramStageSpectators';
import type { PentagramSoundtrackStatus } from './usePentagramCombatSoundtrack';

interface PentagramLiveFightProps {
  fighterOne: Character;
  fighterTwo: Character;
  fighterOneDefinition: CombatantDefinition;
  fighterTwoDefinition: CombatantDefinition;
  matchMode: 'ai' | 'local';
  aiDifficulty: CombatAiDifficulty;
  stage: PentagramStage;
  timeline: TimelineState;
  soundtrackEnabled: boolean;
  soundtrackStatus: PentagramSoundtrackStatus;
  onSoundtrackToggle: (startPaused: boolean) => void;
  onSoundtrackPause: () => void;
  onSoundtrackResume: () => void;
  onExit: () => void;
}

interface PointerTracker {
  side: PlayerSide;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  startedAt: number;
  moved: boolean;
}

type FightPhase = 'intro' | 'ready' | 'fight' | 'running' | 'paused' | 'outro' | 'results';
type HeldCombatInput = keyof CombatInputs['one'];

const HELD_TOUCH_CONTROLS: readonly {
  input: HeldCombatInput;
  label: string;
  glyph: string;
}[] = [
  { input: 'left', label: 'move left', glyph: '←' },
  { input: 'crouch', label: 'crouch', glyph: '▼' },
  { input: 'guard', label: 'guard', glyph: '◆' },
  { input: 'right', label: 'move right', glyph: '→' },
];

const ATTACK_TOUCH_CONTROLS: readonly {
  attack: CombatAttack;
  label: string;
  glyph: string;
}[] = [
  { attack: 'light', label: 'light attack', glyph: 'L' },
  { attack: 'heavy', label: 'heavy attack', glyph: 'H' },
  { attack: 'special', label: 'special attack', glyph: 'S' },
];

const POSE_TOUCH_CONTROLS: readonly {
  action: CombatPoseAction;
  label: string;
  glyph: string;
}[] = [
  { action: 'jump', label: 'jump', glyph: '▲' },
  { action: 'taunt', label: 'taunt', glyph: 'T' },
];

const READY_COUNTDOWN_MS = 800;
const FIGHT_COUNTDOWN_MS = 450;
// Hidden/blurred tabs pause explicitly. While visible, retain up to one second
// so 5–10 FPS devices do not leave the simulation behind the CSS animation.
const MAX_UI_FRAME_MS = 1_000;

const MANAGED_CODES = new Set([
  'KeyA',
  'KeyQ',
  'KeyD',
  'KeyS',
  'KeyE',
  'KeyW',
  'KeyZ',
  'KeyR',
  'KeyF',
  'KeyG',
  'KeyH',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Slash',
  'ShiftRight',
  'KeyJ',
  'KeyK',
  'KeyL',
  'KeyU',
  'Enter',
  'Escape',
  'KeyP',
]);

const ATTACK_CODES: Readonly<Record<string, readonly [PlayerSide, CombatAttack]>> = {
  KeyF: ['one', 'light'],
  KeyG: ['one', 'heavy'],
  KeyH: ['one', 'special'],
  KeyJ: ['two', 'light'],
  KeyK: ['two', 'heavy'],
  KeyL: ['two', 'special'],
};

const POSE_ACTION_CODES: Readonly<
  Record<string, readonly [PlayerSide, CombatPoseAction]>
> = {
  KeyW: ['one', 'jump'],
  KeyZ: ['one', 'jump'],
  KeyR: ['one', 'taunt'],
  ArrowUp: ['two', 'jump'],
  KeyU: ['two', 'taunt'],
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(target.tagName);
}

function isInteractivePointerTarget(target: EventTarget | null): boolean {
  return target instanceof Element
    && Boolean(target.closest('button, a, input, select, textarea, [role="button"]'));
}

function getActionLabel(action: CombatAction): string {
  if (action === 'light') return 'Light attack';
  if (action === 'heavy') return 'Heavy attack';
  if (action === 'special') return 'Special attack';
  if (action === 'hit') return 'Hit stun';
  if (action === 'ko') return 'K.O.';
  if (action === 'victory') return 'Victory';
  if (action === 'jump') return 'Jumping';
  if (action === 'crouch') return 'Crouching';
  if (action === 'taunt') return 'Taunting';
  if (action === 'walk') return 'Moving';
  if (action === 'guard') return 'Guard';
  return 'Ready';
}

function getKeyboardInputs(codes: ReadonlySet<string>): CombatInputs {
  return {
    one: {
      left: codes.has('KeyQ') || codes.has('KeyA'),
      right: codes.has('KeyD'),
      crouch: codes.has('KeyS'),
      guard: codes.has('KeyE'),
    },
    two: {
      left: codes.has('ArrowLeft'),
      right: codes.has('ArrowRight'),
      crouch: codes.has('ArrowDown'),
      guard: codes.has('Slash') || codes.has('ShiftRight'),
    },
  };
}

function mergeInputs(keyboard: CombatInputs, pointer: CombatInputs): CombatInputs {
  return {
    one: {
      left: keyboard.one.left || pointer.one.left,
      right: keyboard.one.right || pointer.one.right,
      guard: keyboard.one.guard || pointer.one.guard,
      crouch: keyboard.one.crouch || pointer.one.crouch,
    },
    two: {
      left: keyboard.two.left || pointer.two.left,
      right: keyboard.two.right || pointer.two.right,
      guard: keyboard.two.guard || pointer.two.guard,
      crouch: keyboard.two.crouch || pointer.two.crouch,
    },
  };
}

function createEmptyInputs(): CombatInputs {
  return {
    one: { left: false, right: false, guard: false, crouch: false },
    two: { left: false, right: false, guard: false, crouch: false },
  };
}

export function PentagramLiveFight({
  fighterOne,
  fighterTwo,
  fighterOneDefinition,
  fighterTwoDefinition,
  matchMode,
  aiDifficulty,
  stage,
  timeline,
  soundtrackEnabled,
  soundtrackStatus,
  onSoundtrackToggle,
  onSoundtrackPause,
  onSoundtrackResume,
  onExit,
}: PentagramLiveFightProps) {
  const [combat, setCombat] = useState(() => createCombatState(
    fighterOneDefinition,
    fighterTwoDefinition,
  ));
  const [fightPhase, setFightPhaseState] = useState<FightPhase>('intro');
  const [activeCinematic, setActiveCinematic] = useState<PentagramCinematicKind>('intro');
  const [animationClockMs, setAnimationClockMs] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const combatRef = useRef(combat);
  const fightPhaseRef = useRef<FightPhase>('intro');
  const resumePhaseRef = useRef<Exclude<FightPhase, 'paused'>>('intro');
  const countdownMsRef = useRef(READY_COUNTDOWN_MS);
  const cinematicMsRef = useRef(0);
  const pressedCodesRef = useRef<Set<string>>(new Set());
  const pointerInputsRef = useRef<CombatInputs>(createEmptyInputs());
  const touchInputsRef = useRef<CombatInputs>(createEmptyInputs());
  const touchKeyboardClicksRef = useRef<Set<string>>(new Set());
  const [touchInputs, setTouchInputs] = useState<CombatInputs>(() => createEmptyInputs());
  const pointerTrackersRef = useRef<Map<number, PointerTracker>>(new Map());
  const lastTapRef = useRef<Record<PlayerSide, number>>({ one: 0, two: 0 });
  const aiInputRef = useRef(createEmptyInputs().two);
  const aiThinkMsRef = useRef(0);

  const commitCombat = useCallback((nextCombat: CombatState) => {
    combatRef.current = nextCombat;
    setCombat(nextCombat);
  }, []);

  const setFightPhase = useCallback((phase: FightPhase) => {
    fightPhaseRef.current = phase;
    setFightPhaseState(phase);
  }, []);

  const beginCinematic = useCallback((kind: PentagramCinematicKind) => {
    cinematicMsRef.current = 0;
    resumePhaseRef.current = kind === 'intro' ? 'intro' : 'outro';
    setAnimationClockMs(0);
    setActiveCinematic(kind);
    setFightPhase(kind === 'intro' ? 'intro' : 'outro');
  }, [setFightPhase]);

  const finishCombatIfNeeded = useCallback((
    previousCombat: CombatState,
    nextCombat: CombatState,
  ) => {
    if (!previousCombat.active || nextCombat.active) return;
    if (nextCombat.matchWinner !== null) {
      beginCinematic('victory');
    } else if (nextCombat.winner === 'draw') {
      beginCinematic('draw');
    } else {
      setFightPhase('results');
    }
  }, [beginCinematic, setFightPhase]);

  const readInputs = useCallback(() => {
    const humanInputs = mergeInputs(
      mergeInputs(
        getKeyboardInputs(pressedCodesRef.current),
        pointerInputsRef.current,
      ),
      touchInputsRef.current,
    );
    return matchMode === 'ai'
      ? { ...humanInputs, two: aiInputRef.current }
      : humanInputs;
  }, [matchMode]);

  const applyInputSnapshot = useCallback(() => {
    if (fightPhaseRef.current !== 'running') return;
    const current = combatRef.current;
    const next = stepCombat(
      current,
      readInputs(),
      0,
      fighterOneDefinition,
      fighterTwoDefinition,
    );
    commitCombat(next);
    finishCombatIfNeeded(current, next);
  }, [
    commitCombat,
    fighterOneDefinition,
    fighterTwoDefinition,
    finishCombatIfNeeded,
    readInputs,
  ]);

  const performAttack = useCallback((
    side: PlayerSide,
    attack: CombatAttack,
    allowLightCancel = false,
  ) => {
    if (fightPhaseRef.current !== 'running') return;
    if (matchMode === 'ai' && side === 'two') return;
    const current = combatRef.current;
    const next = resolveCombatAttack(
      current,
      side,
      attack,
      fighterOneDefinition,
      fighterTwoDefinition,
      allowLightCancel,
    );
    commitCombat(next);
    finishCombatIfNeeded(current, next);
  }, [
    commitCombat,
    fighterOneDefinition,
    fighterTwoDefinition,
    finishCombatIfNeeded,
    matchMode,
  ]);

  const performPoseAction = useCallback((
    side: PlayerSide,
    action: CombatPoseAction,
  ) => {
    if (fightPhaseRef.current !== 'running') return;
    if (matchMode === 'ai' && side === 'two') return;
    const current = combatRef.current;
    const next = resolveCombatPoseAction(
      current,
      side,
      action,
      fighterOneDefinition,
      fighterTwoDefinition,
    );
    commitCombat(next);
    finishCombatIfNeeded(current, next);
  }, [
    commitCombat,
    fighterOneDefinition,
    fighterTwoDefinition,
    finishCombatIfNeeded,
    matchMode,
  ]);

  const clearLiveInputs = useCallback(() => {
    pressedCodesRef.current.clear();
    pointerInputsRef.current = createEmptyInputs();
    const clearedTouchInputs = createEmptyInputs();
    touchInputsRef.current = clearedTouchInputs;
    touchKeyboardClicksRef.current.clear();
    setTouchInputs(clearedTouchInputs);
    pointerTrackersRef.current.clear();
    aiInputRef.current = createEmptyInputs().two;
    aiThinkMsRef.current = 0;
    commitCombat(releaseCombatGuard(combatRef.current));
  }, [commitCombat]);

  const beginRoundCountdown = useCallback(() => {
    countdownMsRef.current = READY_COUNTDOWN_MS;
    resumePhaseRef.current = 'ready';
    setAnimationClockMs(0);
    setFightPhase('ready');
  }, [setFightPhase]);

  const quitFight = useCallback(() => {
    clearLiveInputs();
    onExit();
  }, [clearLiveInputs, onExit]);

  const pauseFight = useCallback(() => {
    const currentPhase = fightPhaseRef.current;
    if (!combatRef.current.active || currentPhase === 'paused') return;
    resumePhaseRef.current = currentPhase;
    clearLiveInputs();
    setFightPhase('paused');
    onSoundtrackPause();
  }, [clearLiveInputs, onSoundtrackPause, setFightPhase]);

  const continueFight = useCallback(() => {
    if (fightPhaseRef.current !== 'paused') return;
    setFightPhase(resumePhaseRef.current);
    onSoundtrackResume();
    stageRef.current?.focus({ preventScroll: true });
  }, [onSoundtrackResume, setFightPhase]);

  const continueRound = useCallback(() => {
    const startsNewMatch = combatRef.current.matchWinner !== null;
    clearLiveInputs();
    aiThinkMsRef.current = 0;
    commitCombat(createNextCombatRound(
      combatRef.current,
      fighterOneDefinition,
      fighterTwoDefinition,
    ));
    if (startsNewMatch) beginCinematic('intro');
    else beginRoundCountdown();
    stageRef.current?.focus({ preventScroll: true });
  }, [
    beginCinematic,
    beginRoundCountdown,
    clearLiveInputs,
    commitCombat,
    fighterOneDefinition,
    fighterTwoDefinition,
  ]);

  useEffect(() => {
    const hasAnimationFrame = typeof window.requestAnimationFrame === 'function';
    const requestFrame = (callback: FrameRequestCallback) => (
      hasAnimationFrame
        ? window.requestAnimationFrame(callback)
        : window.setTimeout(() => callback(window.performance.now()), 16)
    );
    const cancelFrame = (frameId: number) => {
      if (hasAnimationFrame) window.cancelAnimationFrame(frameId);
      else window.clearTimeout(frameId);
    };

    const focusFrame = requestFrame(() => stageRef.current?.focus({ preventScroll: true }));
    return () => cancelFrame(focusFrame);
  }, []);

  useEffect(() => {
    const hasAnimationFrame = typeof window.requestAnimationFrame === 'function';
    const requestFrame = (callback: FrameRequestCallback) => (
      hasAnimationFrame
        ? window.requestAnimationFrame(callback)
        : window.setTimeout(() => callback(window.performance.now()), 16)
    );
    const cancelFrame = (frameId: number) => {
      if (hasAnimationFrame) window.cancelAnimationFrame(frameId);
      else window.clearTimeout(frameId);
    };
    let previousTime = window.performance.now();
    let frameId = 0;

    const runFrame = (now: number) => {
      const elapsedMs = Math.min(Math.max(0, now - previousTime), MAX_UI_FRAME_MS);
      previousTime = now;

      const currentPhase = fightPhaseRef.current;
      if (currentPhase !== 'paused' && combatRef.current.hitstopMs <= 0) {
        setAnimationClockMs(current => current + elapsedMs);
      }
      if (currentPhase === 'intro' || currentPhase === 'outro') {
        cinematicMsRef.current = Math.min(
          getPentagramCinematicDuration(activeCinematic),
          cinematicMsRef.current + elapsedMs,
        );
        if (
          cinematicMsRef.current
          >= getPentagramCinematicDuration(activeCinematic)
        ) {
          if (currentPhase === 'intro') beginRoundCountdown();
          else setFightPhase('results');
        }
        frameId = requestFrame(runFrame);
        return;
      }
      if (currentPhase === 'ready' || currentPhase === 'fight') {
        countdownMsRef.current = Math.max(0, countdownMsRef.current - elapsedMs);
        if (countdownMsRef.current === 0) {
          if (currentPhase === 'ready') {
            countdownMsRef.current = FIGHT_COUNTDOWN_MS;
            resumePhaseRef.current = 'fight';
            setFightPhase('fight');
          } else {
            resumePhaseRef.current = 'running';
            setFightPhase('running');
          }
        }
        frameId = requestFrame(runFrame);
        return;
      }

      if (currentPhase !== 'running') {
        frameId = requestFrame(runFrame);
        return;
      }

      const currentCombat = combatRef.current;
      let nextCombat: CombatState;
      if (matchMode === 'ai' && currentCombat.active) {
        let next = currentCombat;
        let remainingMs = elapsedMs;
        while (remainingMs > 0 && next.active) {
          if (aiThinkMsRef.current <= 0) {
            const decision = decideCombatAi(
              next,
              'two',
              fighterOneDefinition,
              fighterTwoDefinition,
              aiDifficulty,
            );
            aiInputRef.current = decision.input;
            aiThinkMsRef.current = getCombatAiThinkInterval(aiDifficulty);
            if (decision.attack) {
              next = resolveCombatAttack(
                next,
                'two',
                decision.attack,
                fighterOneDefinition,
                fighterTwoDefinition,
              );
            }
            continue;
          }

          const stepMs = Math.min(remainingMs, aiThinkMsRef.current);
          next = stepCombat(
            next,
            readInputs(),
            stepMs,
            fighterOneDefinition,
            fighterTwoDefinition,
          );
          remainingMs -= stepMs;
          aiThinkMsRef.current = Math.max(0, aiThinkMsRef.current - stepMs);
        }
        nextCombat = next;
      } else {
        if (matchMode === 'ai') {
          aiInputRef.current = createEmptyInputs().two;
        }
        nextCombat = stepCombat(
          currentCombat,
          readInputs(),
          elapsedMs,
          fighterOneDefinition,
          fighterTwoDefinition,
        );
      }
      commitCombat(nextCombat);
      finishCombatIfNeeded(currentCombat, nextCombat);
      frameId = requestFrame(runFrame);
    };

    frameId = requestFrame(runFrame);
    return () => cancelFrame(frameId);
  }, [
    activeCinematic,
    aiDifficulty,
    beginRoundCountdown,
    commitCombat,
    fighterOneDefinition,
    fighterTwoDefinition,
    finishCombatIfNeeded,
    matchMode,
    readInputs,
    setFightPhase,
  ]);

  useEffect(() => {
    const pressedCodes = pressedCodesRef.current;
    const pointerTrackers = pointerTrackersRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!MANAGED_CODES.has(event.code)) return;

      const isGlobalFightCommand = ['Escape', 'KeyP', 'Enter'].includes(event.code);
      const editableTarget = isEditableTarget(event.target);
      // Keep the browser's native Enter activation for Pause, Continue and
      // Quit. P and Escape remain global even when a fight button has focus.
      if (editableTarget && (!isGlobalFightCommand || event.code === 'Enter')) return;
      event.preventDefault();

      if (event.code === 'Escape') {
        quitFight();
        return;
      }

      if (event.code === 'KeyP') {
        if (!event.repeat) {
          if (fightPhaseRef.current === 'paused') continueFight();
          else pauseFight();
        }
        return;
      }

      if (event.code === 'Enter') {
        if (!event.repeat) {
          if (fightPhaseRef.current === 'paused') continueFight();
          else if (
            !combatRef.current.active
            && fightPhaseRef.current === 'results'
          ) {
            continueRound();
          }
        }
        return;
      }

      pressedCodesRef.current.add(event.code);
      const poseBinding = POSE_ACTION_CODES[event.code];
      const attackBinding = ATTACK_CODES[event.code];
      if (poseBinding && !event.repeat) {
        performPoseAction(poseBinding[0], poseBinding[1]);
      }
      else if (attackBinding && !event.repeat) {
        performAttack(
          attackBinding[0],
          attackBinding[1],
          attackBinding[1] === 'heavy',
        );
      }
      else applyInputSnapshot();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!MANAGED_CODES.has(event.code)) return;
      if (!isEditableTarget(event.target)) event.preventDefault();
      pressedCodesRef.current.delete(event.code);
      applyInputSnapshot();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') pauseFight();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', pauseFight);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', pauseFight);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      pressedCodes.clear();
      pointerTrackers.clear();
    };
  }, [
    applyInputSnapshot,
    continueFight,
    continueRound,
    pauseFight,
    performAttack,
    performPoseAction,
    quitFight,
  ]);

  const setTouchInput = useCallback((
    side: PlayerSide,
    input: HeldCombatInput,
    active: boolean,
  ) => {
    if (matchMode === 'ai' && side === 'two') return;
    if (touchInputsRef.current[side][input] === active) return;

    const nextInputs = {
      ...touchInputsRef.current,
      [side]: {
        ...touchInputsRef.current[side],
        [input]: active,
      },
    };
    touchInputsRef.current = nextInputs;
    setTouchInputs(nextInputs);
    applyInputSnapshot();
  }, [applyInputSnapshot, matchMode]);

  const setPointerDirection = (side: PlayerSide, deltaX: number, guarding: boolean) => {
    if (matchMode === 'ai' && side === 'two') return;
    const nextSide = {
      left: deltaX < -14,
      right: deltaX > 14,
      guard: guarding,
      crouch: false,
    };
    pointerInputsRef.current = {
      ...pointerInputsRef.current,
      [side]: nextSide,
    };
    applyInputSnapshot();
  };

  const refreshPointerSide = (side: PlayerSide) => {
    const activeTrackers = [...pointerTrackersRef.current.values()]
      .filter((tracker) => tracker.side === side);
    if (activeTrackers.length === 0) {
      setPointerDirection(side, 0, false);
      return;
    }

    const strongestDirection = activeTrackers.reduce((strongest, tracker) => {
      const deltaX = tracker.lastX - tracker.startX;
      return Math.abs(deltaX) > Math.abs(strongest) ? deltaX : strongest;
    }, 0);
    setPointerDirection(
      side,
      strongestDirection,
      activeTrackers.some(({ moved }) => !moved),
    );
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isInteractivePointerTarget(event.target)) return;
    if (combat.active && fightPhaseRef.current !== 'running') return;
    if (!combat.active && fightPhaseRef.current !== 'results') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerHalf: PlayerSide = event.clientX - bounds.left < bounds.width / 2 ? 'one' : 'two';
    const side: PlayerSide = matchMode === 'ai' && combat.active ? 'one' : pointerHalf;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pointerTrackersRef.current.set(event.pointerId, {
      side,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      startedAt: window.performance.now(),
      moved: false,
    });
    refreshPointerSide(side);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const tracker = pointerTrackersRef.current.get(event.pointerId);
    if (!tracker) return;
    tracker.lastX = event.clientX;
    tracker.lastY = event.clientY;
    const deltaX = event.clientX - tracker.startX;
    const deltaY = event.clientY - tracker.startY;
    tracker.moved = tracker.moved || Math.abs(deltaX) > 14 || Math.abs(deltaY) > 20;
    refreshPointerSide(tracker.side);
  };

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const tracker = pointerTrackersRef.current.get(event.pointerId);
    if (!tracker) return;
    pointerTrackersRef.current.delete(event.pointerId);
    refreshPointerSide(tracker.side);
    if (cancelled) return;
    if (combat.active && fightPhaseRef.current !== 'running') return;
    if (!combat.active && fightPhaseRef.current !== 'results') return;

    const deltaY = tracker.startY - tracker.lastY;
    const elapsedMs = window.performance.now() - tracker.startedAt;
    if (!combat.active) {
      if (tracker.side === 'one') {
        continueRound();
      } else {
        quitFight();
      }
      return;
    }
    if (deltaY < -44) {
      quitFight();
      return;
    }
    if (deltaY > 44) {
      performAttack(tracker.side, 'special');
      return;
    }
    if (!tracker.moved && elapsedMs < 320) {
      const now = window.performance.now();
      const previousTap = lastTapRef.current[tracker.side];
      const isDoubleTap = previousTap > 0 && now - previousTap < 330;
      lastTapRef.current[tracker.side] = now;
      performAttack(tracker.side, isDoubleTap ? 'heavy' : 'light', isDoubleTap);
    }
  };

  const fighterOneSprite = getCharacterSpriteAsset(fighterOne.id);
  const fighterTwoSprite = getCharacterSpriteAsset(fighterTwo.id);
  useEffect(() => {
    if (typeof window.Image !== 'function') return;
    const animationUrls = [fighterOneSprite, fighterTwoSprite].flatMap(sprite => (
      sprite
        ? [
            ...Object.values(sprite.animationSheets),
            ...Object.values(sprite.cinematicSheets),
          ]
        : []
    ));
    animationUrls.forEach((url) => {
      const preload = new window.Image();
      preload.src = url;
    });
  }, [fighterOneSprite, fighterTwoSprite]);

  const fighterOneActionDurationMs = isCombatAttackAction(combat.actionOne)
    ? getCombatAttackDuration(fighterOneDefinition, combat.actionOne)
    : isCombatPoseAction(combat.actionOne)
      ? getCombatPoseActionDuration(combat.actionOne)
      : undefined;
  const fighterTwoActionDurationMs = isCombatAttackAction(combat.actionTwo)
    ? getCombatAttackDuration(fighterTwoDefinition, combat.actionTwo)
    : isCombatPoseAction(combat.actionTwo)
      ? getCombatPoseActionDuration(combat.actionTwo)
      : undefined;
  const fighterOneCombatFrame = getCombatAnimationFrame(combat.actionOne, combat.actionMsOne, {
    animationSetId: fighterOneSprite?.animationSetId,
    actionDurationMs: fighterOneActionDurationMs,
    loopElapsedMs: animationClockMs,
  });
  const fighterTwoCombatFrame = getCombatAnimationFrame(combat.actionTwo, combat.actionMsTwo, {
    animationSetId: fighterTwoSprite?.animationSetId,
    actionDurationMs: fighterTwoActionDurationMs,
    loopElapsedMs: animationClockMs,
  });
  const timerSeconds = Math.ceil(combat.timerMs / 1000);
  const winnerName = combat.winner === 'one'
    ? fighterOne.name
    : combat.winner === 'two' ? fighterTwo.name : null;
  const matchWinnerName = combat.matchWinner === 'one'
    ? fighterOne.name
    : combat.matchWinner === 'two' ? fighterTwo.name : null;
  const resultTitle = matchWinnerName
    ? `${matchWinnerName} wins the match`
    : winnerName ? `${winnerName} wins round ${combat.round}` : 'Round draw';
  const nextFightLabel = matchWinnerName ? 'rematch' : 'next round';
  const latestEvent = combat.log[0]?.text ?? '';
  const cinematicFrame = getPentagramCinematicFrame(
    activeCinematic,
    animationClockMs,
  );
  const fighterOneCinematicKind: PentagramCinematicKind | null = fightPhase === 'intro'
    ? 'intro'
    : fightPhase === 'outro' && activeCinematic === 'draw'
      ? 'draw'
      : fightPhase === 'outro' && combat.matchWinner === 'one'
        ? 'victory'
        : null;
  const fighterTwoCinematicKind: PentagramCinematicKind | null = fightPhase === 'intro'
    ? 'intro'
    : fightPhase === 'outro' && activeCinematic === 'draw'
      ? 'draw'
      : fightPhase === 'outro' && combat.matchWinner === 'two'
        ? 'victory'
        : null;
  const fighterOneBank = fighterOneCinematicKind ?? fighterOneCombatFrame.bank;
  const fighterTwoBank = fighterTwoCinematicKind ?? fighterTwoCombatFrame.bank;
  const fighterOneFrameIndex = fighterOneCinematicKind
    ? cinematicFrame.frameIndex
    : fighterOneCombatFrame.frameIndex;
  const fighterTwoFrameIndex = fighterTwoCinematicKind
    ? cinematicFrame.frameIndex
    : fighterTwoCombatFrame.frameIndex;
  const fighterOneColumn = fighterOneCinematicKind
    ? cinematicFrame.column
    : fighterOneCombatFrame.column;
  const fighterTwoColumn = fighterTwoCinematicKind
    ? cinematicFrame.column
    : fighterTwoCombatFrame.column;
  const fighterOneAction = fighterOneCinematicKind ?? combat.actionOne;
  const fighterTwoAction = fighterTwoCinematicKind ?? combat.actionTwo;
  const phaseLabel = fightPhase === 'ready'
    ? 'Ready'
    : fightPhase === 'fight' ? 'Fight!' : fightPhase === 'paused' ? 'Paused' : null;
  const fighterOneStyle = {
    '--arena-x': `${combat.positionOne}%`,
    '--arena-action-ms': fighterOneActionDurationMs !== undefined
      ? `${fighterOneActionDurationMs}ms`
      : '340ms',
  } as CSSProperties;
  const fighterTwoStyle = {
    '--arena-x': `${combat.positionTwo}%`,
    '--arena-action-ms': fighterTwoActionDurationMs !== undefined
      ? `${fighterTwoActionDurationMs}ms`
      : '340ms',
  } as CSSProperties;
  const fighterOneSpriteStyle: CSSProperties | undefined = fighterOneSprite ? {
    backgroundImage: `url("${
      fighterOneCinematicKind
        ? getCharacterCinematicSpriteSheet(fighterOneSprite, fighterOneCinematicKind)
        : getCharacterSpriteSheet(fighterOneSprite, fighterOneCombatFrame.bank)
    }")`,
    backgroundPosition: `${fighterOneColumn * 20}% ${fighterOneSprite.row * (100 / 3)}%`,
  } : undefined;
  const fighterTwoSpriteStyle: CSSProperties | undefined = fighterTwoSprite ? {
    backgroundImage: `url("${
      fighterTwoCinematicKind
        ? getCharacterCinematicSpriteSheet(fighterTwoSprite, fighterTwoCinematicKind)
        : getCharacterSpriteSheet(fighterTwoSprite, fighterTwoCombatFrame.bank)
    }")`,
    backgroundPosition: `${fighterTwoColumn * 20}% ${fighterTwoSprite.row * (100 / 3)}%`,
  } : undefined;
  const stageStyle = getPentagramStageVisualProperties(stage) as CSSProperties;
  const soundtrackUnavailable = soundtrackStatus === 'unavailable';
  const soundtrackButtonLabel = soundtrackUnavailable
    ? 'Original soundtrack unavailable'
    : soundtrackEnabled ? 'Turn off original soundtrack' : 'Turn on original soundtrack';
  const touchControlsDisabled = fightPhase !== 'running' || !combat.active;
  const touchControlPlayers: readonly {
    side: PlayerSide;
    shortLabel: 'P1' | 'P2';
    fighterName: string;
  }[] = matchMode === 'local'
    ? [
        { side: 'one', shortLabel: 'P1', fighterName: fighterOne.name },
        { side: 'two', shortLabel: 'P2', fighterName: fighterTwo.name },
      ]
    : [{ side: 'one', shortLabel: 'P1', fighterName: fighterOne.name }];

  return (
    <section className="arena-fight-panel arena-live-shell art-deco-border" aria-labelledby="arena-fight-title">
      <div className="arena-fight-panel__top">
        <div>
          <span className="arena-live-kicker">
            {matchMode === 'ai'
              ? `CPU sparring · ${COMBAT_AI_DIFFICULTY_LABELS[aiDifficulty]}`
              : 'Two-player local exhibition'}
            {' · '}{stage.name}
          </span>
          <h2 id="arena-fight-title">2.5D combat — {fighterOne.name} vs {fighterTwo.name}</h2>
        </div>
        <div className="arena-fight-toolbar">
          <div className="arena-round-counter">
            <span>Round {combat.round} · first to 2</span>
            <strong aria-label={`${timerSeconds} seconds remaining`}>{timerSeconds}</strong>
          </div>
          <div className="arena-fight-actions" aria-label="Fight controls">
            <button
              type="button"
              className="btn btn-secondary arena-soundtrack-toggle"
              aria-label={soundtrackButtonLabel}
              aria-pressed={soundtrackEnabled && !soundtrackUnavailable}
              disabled={soundtrackUnavailable}
              onClick={() => onSoundtrackToggle(fightPhase === 'paused')}
            >
              {soundtrackEnabled && !soundtrackUnavailable
                ? <Volume2 size={15} aria-hidden="true" />
                : <VolumeX size={15} aria-hidden="true" />}
              {soundtrackUnavailable
                ? 'Music unavailable'
                : soundtrackStatus === 'paused' ? 'Music paused' : soundtrackEnabled ? 'Music on' : 'Music off'}
            </button>
            {combat.active && (
              fightPhase === 'paused' ? (
                <button type="button" className="btn btn-primary" onClick={continueFight}>
                  Continue
                </button>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={pauseFight}>
                  Pause
                </button>
              )
            )}
            <button type="button" className="btn btn-secondary" onClick={quitFight}>
              Quit
            </button>
          </div>
        </div>
      </div>

      <div className="arena-hud" aria-label="Combat status">
        <div className="arena-hud__fighter">
          <strong>{fighterOne.name}</strong>
          <span
            className="arena-round-wins"
            role="img"
            aria-label={`${fighterOne.name} has ${combat.roundWinsOne} round wins`}
          >
            {[0, 1].map(index => (
              <i key={index} className={index < combat.roundWinsOne ? 'is-earned' : undefined} />
            ))}
          </span>
          <span
            className="arena-health"
            role="progressbar"
            aria-label={`${fighterOne.name} health`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={combat.hpOne}
          >
            <span style={{ width: `${combat.hpOne}%` }} />
          </span>
          <span
            className="arena-tension"
            role="meter"
            aria-label={`${fighterOne.name} tension`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={combat.tensionOne}
          >
            <span style={{ width: `${combat.tensionOne}%` }} />
          </span>
          <small>HP {combat.hpOne} · Tension {combat.tensionOne} · {getActionLabel(combat.actionOne)}</small>
        </div>
        <div className="arena-hud__fighter is-p2">
          <strong>{fighterTwo.name}</strong>
          <span
            className="arena-round-wins is-p2"
            role="img"
            aria-label={`${fighterTwo.name} has ${combat.roundWinsTwo} round wins`}
          >
            {[0, 1].map(index => (
              <i key={index} className={index < combat.roundWinsTwo ? 'is-earned' : undefined} />
            ))}
          </span>
          <span
            className="arena-health is-p2"
            role="progressbar"
            aria-label={`${fighterTwo.name} health`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={combat.hpTwo}
          >
            <span style={{ width: `${combat.hpTwo}%` }} />
          </span>
          <span
            className="arena-tension is-p2"
            role="meter"
            aria-label={`${fighterTwo.name} tension`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={combat.tensionTwo}
          >
            <span style={{ width: `${combat.tensionTwo}%` }} />
          </span>
          <small>HP {combat.hpTwo} · Tension {combat.tensionTwo} · {getActionLabel(combat.actionTwo)}</small>
        </div>
      </div>

      <div
        ref={stageRef}
        className={`arena-combat-stage${combat.hitstopMs > 0 ? ' is-hitstop' : ''}`}
        style={stageStyle}
        data-stage={stage.id}
        data-phase={fightPhase}
        role="region"
        tabIndex={0}
        aria-label={`Live combat: ${fighterOne.name} versus ${fighterTwo.name} at ${stage.name}`}
        aria-describedby="arena-live-instructions"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => finishPointer(event)}
        onPointerCancel={(event) => finishPointer(event, true)}
        onLostPointerCapture={(event) => finishPointer(event, true)}
      >
        <div className="arena-stage__glow" aria-hidden="true" />
        <div className="arena-lane-grid" aria-hidden="true" />
        <div className="arena-crowd-lights" aria-hidden="true" />
        <PentagramStageSpectators
          stageId={stage.id}
          timeline={timeline}
          fighterOneId={fighterOne.id}
          fighterTwoId={fighterTwo.id}
          cameraFocus={(combat.positionOne + combat.positionTwo) / 2}
        />

        {combat.active && phaseLabel && (
          <div className={`arena-fight-state is-${fightPhase}`} role="status" aria-live="assertive">
            <strong>{phaseLabel}</strong>
            <span>
              {fightPhase === 'paused'
                ? 'Combat paused. Press Continue, Enter or P to resume.'
                : fightPhase === 'ready' ? 'Take your position.' : 'The round is live.'}
            </span>
          </div>
        )}

        {fightPhase === 'intro' && (
          <div className="arena-cinematic-overlay is-intro" role="status" aria-live="assertive">
            <span>Exhibition intro</span>
            <strong>
              <b>{fighterOne.name}</b>
              <i>VS</i>
              <b>{fighterTwo.name}</b>
            </strong>
            <small>{stage.name}</small>
          </div>
        )}

        {fightPhase === 'outro' && (
          <div
            className={`arena-cinematic-overlay is-${activeCinematic}`}
            role="status"
            aria-live="assertive"
          >
            <span>{activeCinematic === 'victory' ? 'Final victory' : 'Stalemate'}</span>
            <strong>{resultTitle}</strong>
          </div>
        )}

        <div
          className={`arena-combatant is-one is-${fighterOneAction}${fighterOneCinematicKind ? ' is-cinematic' : ''}`}
          style={fighterOneStyle}
          data-position={combat.positionOne.toFixed(2)}
          data-facing="right"
          data-action={fighterOneAction}
          data-animation-bank={fighterOneBank}
          data-frame-index={fighterOneFrameIndex}
          data-pose-column={fighterOneColumn}
          aria-hidden="true"
        >
          <span className="arena-guard-badge">{getActionLabel(combat.actionOne)}</span>
          <span className="arena-fighter-shadow" />
          {!fighterOneCinematicKind && <span className="arena-action-trail" />}
          {!fighterOneCinematicKind && combat.impactMsOne > 0 && <span className="arena-hit-spark" />}
          {fighterOneSpriteStyle ? (
            <span className="arena-sprite-frame" style={fighterOneSpriteStyle} />
          ) : fighterOneSprite ? (
            <img src={fighterOneSprite.portrait} alt="" />
          ) : (
            <strong>{fighterOne.name.slice(0, 2).toUpperCase()}</strong>
          )}
        </div>

        <div
          className={`arena-combatant is-two is-${fighterTwoAction}${fighterTwoCinematicKind ? ' is-cinematic' : ''}`}
          style={fighterTwoStyle}
          data-position={combat.positionTwo.toFixed(2)}
          data-facing="left"
          data-action={fighterTwoAction}
          data-animation-bank={fighterTwoBank}
          data-frame-index={fighterTwoFrameIndex}
          data-pose-column={fighterTwoColumn}
          aria-hidden="true"
        >
          <span className="arena-guard-badge">{getActionLabel(combat.actionTwo)}</span>
          <span className="arena-fighter-shadow" />
          {!fighterTwoCinematicKind && <span className="arena-action-trail" />}
          {!fighterTwoCinematicKind && combat.impactMsTwo > 0 && <span className="arena-hit-spark" />}
          {fighterTwoSpriteStyle ? (
            <span className="arena-sprite-frame" style={fighterTwoSpriteStyle} />
          ) : fighterTwoSprite ? (
            <img src={fighterTwoSprite.portrait} alt="" />
          ) : (
            <strong>{fighterTwo.name.slice(0, 2).toUpperCase()}</strong>
          )}
        </div>

        {!combat.active && fightPhase === 'results' && (
          <div className="arena-ko" role="status">
            <strong>{resultTitle}</strong>
            <span>Press Enter for {nextFightLabel} · Escape for fighter select</span>
            <span>Touch: tap the left half for {nextFightLabel} · tap the right half for fighter select</span>
            <button type="button" className="btn btn-primary" onClick={continueRound}>
              {matchWinnerName ? 'Rematch' : 'Next round'}
            </button>
          </div>
        )}
      </div>

      <div
        className={`arena-touch-controls${matchMode === 'ai' ? ' is-solo' : ''}`}
        aria-label="On-screen combat controls"
      >
        {touchControlPlayers.map(({ side, shortLabel, fighterName }) => (
          <div
            key={side}
            className={`arena-touch-controls__player is-${side}`}
            role="group"
            aria-label={`${shortLabel} tactile controls for ${fighterName}`}
          >
            <div className="arena-touch-controls__header">
              <strong>{shortLabel} · {fighterName}</strong>
              <span>Hold movement, crouch or guard · tap actions</span>
            </div>
            <div className="arena-touch-controls__grid">
              {HELD_TOUCH_CONTROLS.map(({ input, label, glyph }) => (
                <button
                  key={input}
                  type="button"
                  className="arena-touch-button is-held"
                  aria-label={`${shortLabel} ${label}`}
                  aria-pressed={touchInputs[side][input]}
                  disabled={touchControlsDisabled}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture?.(event.pointerId);
                    setTouchInput(side, input, true);
                  }}
                  onPointerUp={() => setTouchInput(side, input, false)}
                  onPointerCancel={() => setTouchInput(side, input, false)}
                  onLostPointerCapture={() => setTouchInput(side, input, false)}
                  onKeyDown={(event) => {
                    if (![' ', 'Enter'].includes(event.key) || event.repeat) return;
                    event.preventDefault();
                    touchKeyboardClicksRef.current.add(`${side}:${input}`);
                    setTouchInput(side, input, true);
                  }}
                  onKeyUp={(event) => {
                    if (![' ', 'Enter'].includes(event.key)) return;
                    event.preventDefault();
                    setTouchInput(side, input, false);
                  }}
                  onClick={(event) => {
                    if (touchKeyboardClicksRef.current.delete(`${side}:${input}`)) return;
                    // Keyboard and assistive-technology activation has no
                    // pointer click detail: toggle in that case so the same
                    // control remains usable without a held pointer.
                    if (event.detail === 0) {
                      setTouchInput(side, input, !touchInputsRef.current[side][input]);
                    }
                  }}
                >
                  <span aria-hidden="true">{glyph}</span>
                  <small>{label}</small>
                </button>
              ))}
              {ATTACK_TOUCH_CONTROLS.map(({ attack, label, glyph }) => (
                <button
                  key={attack}
                  type="button"
                  className="arena-touch-button is-attack"
                  aria-label={`${shortLabel} ${label}`}
                  disabled={touchControlsDisabled}
                  onClick={() => performAttack(side, attack, attack === 'heavy')}
                >
                  <span aria-hidden="true">{glyph}</span>
                  <small>{label}</small>
                </button>
              ))}
              {POSE_TOUCH_CONTROLS.map(({ action, label, glyph }) => (
                <button
                  key={action}
                  type="button"
                  className="arena-touch-button is-pose"
                  aria-label={`${shortLabel} ${label}`}
                  disabled={touchControlsDisabled}
                  onClick={() => performPoseAction(side, action)}
                >
                  <span aria-hidden="true">{glyph}</span>
                  <small>{label}</small>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div id="arena-live-instructions" className="arena-live-instructions">
        <div className="arena-keymap" aria-label={`${fighterOne.name} controls`}>
          <strong>P1 · {fighterOne.name}</strong>
          <span><kbd>Q</kbd>/<kbd>A</kbd> <kbd>D</kbd> move · <kbd>S</kbd> crouch · <kbd>E</kbd> guard</span>
          <span><kbd>F</kbd> light · <kbd>G</kbd> heavy · <kbd>H</kbd> special</span>
          <span><kbd>Z</kbd>/<kbd>W</kbd> jump · <kbd>R</kbd> taunt</span>
        </div>
        <p>
          The fight runs live while keys are held. <kbd>Esc</kbd> returns to fighter select;
          <kbd>P</kbd> pauses; <kbd>Enter</kbd> resumes or continues after a round.
          <small>
            Touch: use the explicit controls above, or drag to move, hold the stage to guard,
            tap for light, double-tap for a heavy cancel, swipe up for special, and swipe down
            for fighter select. Keyboard heavy also cancels an active light.
          </small>
        </p>
        <div
          className="arena-keymap is-p2"
          aria-label={matchMode === 'ai' ? `${fighterTwo.name} CPU status` : `${fighterTwo.name} controls`}
        >
          <strong>{matchMode === 'ai' ? 'CPU' : 'P2'} · {fighterTwo.name}</strong>
          {matchMode === 'ai' ? (
            <>
              <span>{COMBAT_AI_DIFFICULTY_LABELS[aiDifficulty]} reaction model</span>
              <span>The CPU approaches, guards and spends tension without reading future input.</span>
            </>
          ) : (
            <>
              <span><kbd>←</kbd> <kbd>→</kbd> move · <kbd>↓</kbd> crouch · <kbd>/</kbd> guard</span>
              <span><kbd>J</kbd> light · <kbd>K</kbd> heavy · <kbd>L</kbd> special</span>
              <span><kbd>↑</kbd> jump · <kbd>U</kbd> taunt</span>
            </>
          )}
        </div>
      </div>

      <p className="arena-live-event" aria-live="polite" aria-atomic="true">{latestEvent}</p>
      <ol className="arena-combat-log" aria-label="Recent combat events">
        {combat.log.map(entry => <li key={entry.id}>{entry.text}</li>)}
      </ol>
    </section>
  );
}
