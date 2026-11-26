import { INFERNAL_ACTION_POSES, INFERNAL_STANCES, costumePose, getInfernalCostume, infernalActionPose, infernalFallbackPose } from '../lib/infernal-appearances';
import { getInfernalPosePlacement } from '../lib/infernal-pose-anchors';
import '../styles/infernal-authored-poses.css';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { canOfferFinish, INFERNAL_FINISHES, FINISH_CINEMATIC_MS, FINISH_INPUT_MS } from '../lib/infernal-finishers';
import { InfernalMoveList } from './InfernalMoveList';
import { InfernalStageLayers } from './InfernalStageLayers';
import { InfernalAttackEffects } from './InfernalAttackEffects';
import { getInfernalAttackEffectEntries } from '../lib/infernal-attack-effects';
import { Volume2, VolumeX } from 'lucide-react';
import {
  getCharacterCinematicSpriteSheet,
  getCombatSpriteAsset,
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
  INFERNAL_SIGNATURES,
  createCombatState,
  createNextCombatRound,
  getCombatMoveInfo,
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
  infernalRules?: boolean;
  costumeOne?: string;
  costumeTwo?: string;
  training?: boolean;
  trainingGuard?: boolean;
  reducedMotion?: boolean;
  /** Presentation only: combat timing, damage and collisions remain identical. */
  stagePresentation?: 'alive' | 'static' | 'reduced';
  onMatchComplete?: (result: CombatState) => void;
  onNextMatch?: () => void;
  nextMatchLabel?: string;
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

type FightPhase = 'intro' | 'ready' | 'fight' | 'running' | 'paused' | 'finish-window' | 'finisher' | 'outro' | 'results';
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
  'KeyT',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Slash',
  'ShiftRight',
  'KeyJ',
  'KeyK',
  'KeyL',
  'KeyI',
  'KeyU',
  'Enter',
  'Escape',
  'KeyP',
]);

const ATTACK_CODES: Readonly<Record<string, readonly [PlayerSide, CombatAttack]>> = {
  KeyF: ['one', 'light'],
  KeyG: ['one', 'heavy'],
  KeyH: ['one', 'special'],
  KeyT: ['one', 'signature'],
  KeyJ: ['two', 'light'],
  KeyK: ['two', 'heavy'],
  KeyL: ['two', 'special'],
  KeyI: ['two', 'signature'],
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
  if (action === 'signature') return 'Technique signature';
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
  infernalRules = false,
  costumeOne,
  costumeTwo,
  training = false,
  trainingGuard = false,
  reducedMotion = false,
  stagePresentation = 'alive',
  onMatchComplete,
  onNextMatch,
  nextMatchLabel,
}: PentagramLiveFightProps) {
  const [combat, setCombat] = useState(() => createCombatState(
    fighterOneDefinition,
    fighterTwoDefinition,
  ));
  const [fightPhase, setFightPhaseState] = useState<FightPhase>('intro');
  const [pausedPhase, setPausedPhase] = useState<Exclude<FightPhase, 'paused'>>('intro');
  const [activeCinematic, setActiveCinematic] = useState<PentagramCinematicKind>('intro');
  const [animationClockMs, setAnimationClockMs] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => (
    typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
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
  const reportedMatchRef = useRef(false);

  const commitCombat = useCallback((nextCombat: CombatState) => {
    let next = nextCombat;
    if (training) {
      if (!next.active) {
        next = { ...createCombatState(fighterOneDefinition, fighterTwoDefinition), log: next.log, nextLogId: next.nextLogId };
      }
      next = { ...next, timerMs: 60_000, tensionOne: 100, tensionTwo: 100, hpOne: 100 };
    }
    combatRef.current = next;
    setCombat(next);
  }, [fighterOneDefinition, fighterTwoDefinition, training]);

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

  const beginFinish = useCallback(() => {
    if (fightPhaseRef.current !== 'finish-window') return;
    cinematicMsRef.current = 0;
    setAnimationClockMs(0);
    setFightPhase('finisher');
  }, [setFightPhase]);

  const finishCombatIfNeeded = useCallback((
    previousCombat: CombatState,
    nextCombat: CombatState,
  ) => {
    if (training) return;
    if (!previousCombat.active || nextCombat.active) return;
    if (infernalRules && canOfferFinish(nextCombat)) {
      cinematicMsRef.current = 0;
      setAnimationClockMs(0);
      setFightPhase('finish-window');
    } else if (nextCombat.winner === 'one' || nextCombat.winner === 'two') {
      beginCinematic('victory');
    } else if (nextCombat.winner === 'draw') {
      beginCinematic('draw');
    } else {
      setFightPhase('results');
    }
  }, [beginCinematic, infernalRules, setFightPhase, training]);

  useEffect(() => {
    if (!training && combat.matchWinner && !reportedMatchRef.current) {
      reportedMatchRef.current = true;
      onMatchComplete?.(combat);
    }
  }, [combat, onMatchComplete, training]);

  const readInputs = useCallback(() => {
    const humanInputs = mergeInputs(
      mergeInputs(
        getKeyboardInputs(pressedCodesRef.current),
        pointerInputsRef.current,
      ),
      touchInputsRef.current,
    );
    if (training) return { ...humanInputs, two: { left: false, right: false, crouch: false, guard: trainingGuard } };
    return matchMode === 'ai'
      ? { ...humanInputs, two: aiInputRef.current }
      : humanInputs;
  }, [matchMode, training, trainingGuard]);

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
    if (attack === 'signature' && !infernalRules) return;
    const current = combatRef.current;
    const next = resolveCombatAttack(
      current,
      side,
      attack,
      fighterOneDefinition,
      fighterTwoDefinition,
      allowLightCancel || (infernalRules && (attack === 'special' || attack === 'light')),
    );
    commitCombat(next);
    finishCombatIfNeeded(current, next);
  }, [
    commitCombat,
    fighterOneDefinition,
    fighterTwoDefinition,
    finishCombatIfNeeded,
    matchMode,
    infernalRules,
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
    if (currentPhase === 'paused' || currentPhase === 'results') return;
    if (!combatRef.current.active && currentPhase !== 'finisher' && currentPhase !== 'finish-window') return;
    resumePhaseRef.current = currentPhase;
    setPausedPhase(currentPhase);
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
    if (startsNewMatch && onNextMatch) {
      clearLiveInputs();
      onNextMatch();
      return;
    }
    if (startsNewMatch) reportedMatchRef.current = false;
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
    onNextMatch,
  ]);

  const resetTraining = useCallback(() => {
    clearLiveInputs();
    commitCombat(createCombatState(fighterOneDefinition, fighterTwoDefinition));
    beginRoundCountdown();
    onSoundtrackResume();
    stageRef.current?.focus({ preventScroll: true });
  }, [beginRoundCountdown, clearLiveInputs, commitCombat, fighterOneDefinition, fighterTwoDefinition, onSoundtrackResume]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
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
      if (
        !prefersReducedMotion && !reducedMotion
        && currentPhase !== 'paused'
        && currentPhase !== 'results'
        && combatRef.current.hitstopMs <= 0
      ) {
        setAnimationClockMs(current => current + elapsedMs);
      }
      if (currentPhase === 'finish-window' || currentPhase === 'finisher') {
        cinematicMsRef.current += elapsedMs;
        const cpuWon = matchMode === 'ai' && combatRef.current.matchWinner === 'two';
        if (currentPhase === 'finish-window' && cpuWon && cinematicMsRef.current >= 850) {
          beginFinish();
        } else if (cinematicMsRef.current >= (currentPhase === 'finisher' ? FINISH_CINEMATIC_MS : FINISH_INPUT_MS)) {
          beginCinematic('victory');
        }
        frameId = requestFrame(runFrame);
        return;
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
      if (matchMode === 'ai' && !training && currentCombat.active) {
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
                infernalRules && decision.attack === 'light',
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
    beginCinematic,
    beginFinish,
    infernalRules,
    matchMode,
    prefersReducedMotion,
    reducedMotion,
    training,
    readInputs,
    setFightPhase,
  ]);

  useEffect(() => {
    const pressedCodes = pressedCodesRef.current;
    const pointerTrackers = pointerTrackersRef.current;
    const acceptsCode = (code: string) => {
      if (code === 'KeyT') return infernalRules && Boolean(fighterOneDefinition.signature);
      if (code === 'KeyI') return infernalRules && matchMode === 'local' && Boolean(fighterTwoDefinition.signature);
      return MANAGED_CODES.has(code);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!acceptsCode(event.code)) return;

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

      if (fightPhaseRef.current === 'finish-window') {
        const winner = combatRef.current.matchWinner;
        if (!event.repeat && ((winner === 'one' && event.code === 'KeyH')
          || (winner === 'two' && matchMode === 'local' && event.code === 'KeyL'))) beginFinish();
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
      if (!acceptsCode(event.code)) return;
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
    fighterOneDefinition.signature,
    fighterTwoDefinition.signature,
    infernalRules,
    beginFinish,
    matchMode,
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

  const fighterOneSprite = getCombatSpriteAsset(fighterOne.id);
  const fighterTwoSprite = getCombatSpriteAsset(fighterTwo.id);
  useEffect(() => {
    if (typeof window.Image !== 'function') return;
    const activeSprites = [fighterOneSprite, fighterTwoSprite].filter(
      (sprite): sprite is NonNullable<typeof sprite> => sprite !== undefined,
    );
    const priorityUrls = new Set(activeSprites.flatMap(sprite => (
      [
        sprite.animationSheets.movement,
        sprite.animationSheets.offense,
        sprite.animationSheets.recoil,
        sprite.cinematicSheets.intro,
        sprite.cinematicSheets.victory,
      ]
    )));
    const deferredUrls = new Set(activeSprites.flatMap(sprite => [
      sprite.animationSheets.reaction,
      sprite.animationSheets.taunt,
      sprite.animationSheets.jump,
      sprite.animationSheets.crouch,
      sprite.cinematicSheets.draw,
    ]));
    if (infernalRules) {
      for (const [fighterId, costumeId] of [[fighterOne.id, costumeOne], [fighterTwo.id, costumeTwo]]) {
        const poses = INFERNAL_ACTION_POSES[fighterId!];
        const outfit = getInfernalCostume(fighterId!, costumeId);
        const finish = INFERNAL_FINISHES[fighterId!];
        const urls = [INFERNAL_STANCES[fighterId!], poses?.ready, poses?.guard, poses?.strike, poses?.recoil,
          outfit?.ready, outfit?.strike, outfit?.heavy, outfit?.recoil, outfit?.crouch, outfit?.jump,
          finish?.impactSprite, finish?.detachedProp,
          ...getInfernalAttackEffectEntries().filter(([id]) => id === fighterId).map(([, effect]) => effect.image)];
        for (const url of urls) if (url) priorityUrls.add(url);
      }
    }
    const preload = (urls: ReadonlySet<string>) => urls.forEach((url) => {
      const preload = new window.Image();
      preload.src = url;
      if (typeof preload.decode === 'function') void preload.decode().catch(() => undefined);
    });
    preload(priorityUrls);
    const deferredPreload = window.setTimeout(() => preload(deferredUrls), 900);
    return () => window.clearTimeout(deferredPreload);
  }, [fighterOneSprite, fighterTwoSprite, fighterOne.id, fighterTwo.id, infernalRules, costumeOne, costumeTwo]);

  const fighterOneActionDurationMs = combat.actionDurationMsOne > 0
    ? combat.actionDurationMsOne
    : undefined;
  const fighterTwoActionDurationMs = combat.actionDurationMsTwo > 0
    ? combat.actionDurationMsTwo
    : undefined;
  const motionReduced = prefersReducedMotion || reducedMotion;
  const stageMotion = motionReduced ? 'static' : stagePresentation;
  const stageCameraFixed = stageMotion !== 'alive';
  const displayingFinish = fightPhase === 'finisher' || (fightPhase === 'paused' && pausedPhase === 'finisher');
  const finishWinner = displayingFinish ? combat.matchWinner : null;
  const finishFrameMs = motionReduced ? FINISH_CINEMATIC_MS / 2 : Math.max(0, FINISH_CINEMATIC_MS - animationClockMs);
  const finishId = combat.matchWinner === 'two' ? fighterTwo.id : fighterOne.id;
  const finish = INFERNAL_FINISHES[finishId];
  const impactPose = finishWinner && (motionReduced || (animationClockMs >= 350 && animationClockMs <= 1150))
    ? finish?.impactSprite : undefined;
  const fighterOneCombatFrame = getCombatAnimationFrame(finishWinner === 'one' ? 'special' : combat.actionOne, finishWinner === 'one' ? finishFrameMs : combat.actionMsOne, {
    animationSetId: fighterOneSprite?.animationSetId,
    actionDurationMs: finishWinner === 'one' ? FINISH_CINEMATIC_MS : fighterOneActionDurationMs,
    impactAtMs: !finishWinner && combat.actionOne === 'signature' && fighterOneDefinition.signature
      ? INFERNAL_SIGNATURES[fighterOneDefinition.signature].startupMs : undefined,
    hitAttack: combat.lastHitAttackOne ?? undefined,
    loopElapsedMs: animationClockMs,
  });
  const fighterTwoCombatFrame = getCombatAnimationFrame(finishWinner === 'two' ? 'special' : combat.actionTwo, finishWinner === 'two' ? finishFrameMs : combat.actionMsTwo, {
    animationSetId: fighterTwoSprite?.animationSetId,
    actionDurationMs: finishWinner === 'two' ? FINISH_CINEMATIC_MS : fighterTwoActionDurationMs,
    impactAtMs: !finishWinner && combat.actionTwo === 'signature' && fighterTwoDefinition.signature
      ? INFERNAL_SIGNATURES[fighterTwoDefinition.signature].startupMs : undefined,
    hitAttack: combat.lastHitAttackTwo ?? undefined,
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
  const nextFightLabel = matchWinnerName ? nextMatchLabel ?? 'rematch' : 'next round';
  const latestEvent = combat.log[0]?.text ?? '';
  const cinematicFrame = getPentagramCinematicFrame(
    activeCinematic,
    animationClockMs,
  );
  const fighterOneCinematicKind: PentagramCinematicKind | null = fightPhase === 'intro'
    ? 'intro'
    : fightPhase === 'outro' && activeCinematic === 'draw'
      ? 'draw'
      : fightPhase === 'outro' && combat.winner === 'one'
        ? 'victory'
        : null;
  const fighterTwoCinematicKind: PentagramCinematicKind | null = fightPhase === 'intro'
    ? 'intro'
    : fightPhase === 'outro' && activeCinematic === 'draw'
      ? 'draw'
      : fightPhase === 'outro' && combat.winner === 'two'
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
    ? fighterOneSprite?.cinematicFallback ? fighterOneCinematicKind === 'victory' ? 5 : 2 : cinematicFrame.column
    : fighterOneCombatFrame.column;
  const fighterTwoColumn = fighterTwoCinematicKind
    ? fighterTwoSprite?.cinematicFallback ? fighterTwoCinematicKind === 'victory' ? 5 : 2 : cinematicFrame.column
    : fighterTwoCombatFrame.column;
  const fighterOneAction = fighterOneCinematicKind ?? combat.actionOne;
  const fighterTwoAction = fighterTwoCinematicKind ?? combat.actionTwo;
  const phaseLabel = fightPhase === 'ready'
    ? 'Ready'
    : fightPhase === 'fight' ? 'Fight!' : fightPhase === 'paused' ? 'Paused' : null;
  // Use the last attack that hit this defender to select its impact shape.
  const impactOneKind = combat.guardOne ? 'guard' : combat.lastHitAttackOne ?? 'light';
  const impactTwoKind = combat.guardTwo ? 'guard' : combat.lastHitAttackTwo ?? 'light';
  const impactOneTheme = fighterTwoDefinition.style === 'zoner' ? 'arcane' : 'physical';
  const impactTwoTheme = fighterOneDefinition.style === 'zoner' ? 'arcane' : 'physical';
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
  function individualPose(side: PlayerSide, fighterId: string, action: CombatAction, cinematic: PentagramCinematicKind | null) {
    if (!infernalRules) return undefined;
    const outfit = getInfernalCostume(fighterId, side === 'one' ? costumeOne : costumeTwo);
    if (outfit) return costumePose(outfit, action, cinematic, finishWinner === side && displayingFinish);
    if (finishWinner === side && impactPose) return impactPose;
    if (finishWinner === side) return infernalFallbackPose(fighterId, 'victory', cinematic);
    if (INFERNAL_ACTION_POSES[fighterId]) {
      const definition = side === 'one' ? fighterOneDefinition : fighterTwoDefinition;
      const duration = side === 'one' ? combat.actionDurationMsOne : combat.actionDurationMsTwo;
      const remaining = side === 'one' ? combat.actionMsOne : combat.actionMsTwo;
      const elapsed = duration - remaining;
      const fallbackStartup = action === 'heavy' || action === 'special' || action === 'signature'
        ? getCombatMoveInfo(definition, action).startupMs : 0;
      const authored = infernalActionPose(fighterId, action, cinematic, elapsed, getCombatMoveInfo(definition, 'light').startupMs)
        ?? infernalFallbackPose(fighterId, action, cinematic, elapsed, fallbackStartup);
      if (authored) return authored;
    }
    return infernalFallbackPose(fighterId, action, cinematic)
      ?? (!cinematic && action === 'idle' ? INFERNAL_STANCES[fighterId] : undefined);
  }
  const poseOne = individualPose('one', fighterOne.id, combat.actionOne, fighterOneCinematicKind);
  const poseTwo = individualPose('two', fighterTwo.id, combat.actionTwo, fighterTwoCinematicKind);
  const outfitOne = getInfernalCostume(fighterOne.id, costumeOne);
  const outfitTwo = getInfernalCostume(fighterTwo.id, costumeTwo);
  const portraitPoseOne = outfitOne?.layout === 'portrait'
    || (poseOne?.includes('/individual/') && INFERNAL_ACTION_POSES[fighterOne.id]?.layout === 'portrait');
  const portraitPoseTwo = outfitTwo?.layout === 'portrait'
    || (poseTwo?.includes('/individual/') && INFERNAL_ACTION_POSES[fighterTwo.id]?.layout === 'portrait');
  const poseOnePlacement = getInfernalPosePlacement(costumeOne, poseOne);
  const poseTwoPlacement = getInfernalPosePlacement(costumeTwo, poseTwo);
  const poseOneAnchorStyle = !poseOnePlacement ? undefined : {
    '--infernal-pose-ground-offset': `${poseOnePlacement.groundOffsetPercent}%`,
    '--infernal-pose-width': `${200 / 3 * poseOnePlacement.renderScale}%`,
  } as CSSProperties;
  const poseTwoAnchorStyle = !poseTwoPlacement ? undefined : {
    '--infernal-pose-ground-offset': `${poseTwoPlacement.groundOffsetPercent}%`,
    '--infernal-pose-width': `${200 / 3 * poseTwoPlacement.renderScale}%`,
  } as CSSProperties;
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
    <section className="arena-fight-panel arena-live-shell art-deco-border" aria-labelledby="arena-fight-title" data-reduced-motion={prefersReducedMotion || reducedMotion}>
      <div className="arena-fight-panel__top">
        <div>
          <span className="arena-live-kicker">
            {training ? 'Entraînement · mannequin' : matchMode === 'ai'
              ? `CPU sparring · ${COMBAT_AI_DIFFICULTY_LABELS[aiDifficulty]}`
              : 'Two-player local exhibition'}
            {' · '}{stage.name}
          </span>
          <h2 id="arena-fight-title">2.5D combat — {fighterOne.name} vs {fighterTwo.name}</h2>
        </div>
        <div className="arena-fight-toolbar">
          <div className="arena-round-counter">
            <span>{training ? 'Entraînement libre' : `Round ${combat.round} · first to 2`}</span>
            <strong aria-label={training ? 'Unlimited training time' : `${timerSeconds} seconds remaining`}>{training ? '∞' : timerSeconds}</strong>
          </div>
          <div className="arena-fight-actions" aria-label="Fight controls">
            {training && <button type="button" className="btn btn-secondary" onClick={resetTraining}>Réinitialiser l’entraînement</button>}
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
            {(combat.active || ['finisher', 'finish-window', 'paused'].includes(fightPhase)) && (
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
          {combat.active && combat.comboOne >= 2 && <strong className="arena-combo-count" aria-label={`${fighterOne.name}: ${combat.comboOne} hit combo`}>
            {combat.comboOne} HIT COMBO
          </strong>}
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
          {combat.active && combat.comboTwo >= 2 && <strong className="arena-combo-count" aria-label={`${fighterTwo.name}: ${combat.comboTwo} hit combo`}>
            {combat.comboTwo} HIT COMBO
          </strong>}
        </div>
      </div>

      <div
        ref={stageRef}
        className={`arena-combat-stage${combat.hitstopMs > 0 ? ' is-hitstop' : ''}`}
        style={stageStyle}
        data-stage={stage.id}
        data-stage-presentation={stageMotion}
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
        <InfernalStageLayers stage={stage} offset={stageCameraFixed ? 0 : 50 - (combat.positionOne + combat.positionTwo) / 2} />
        <div className="arena-stage__glow" aria-hidden="true" />
        <div className="arena-lane-grid" aria-hidden="true" />
        <div className="arena-crowd-lights" aria-hidden="true" />
        <PentagramStageSpectators
          stageId={stage.id}
          timeline={timeline}
          fighterOneId={fighterOne.id}
          fighterTwoId={fighterTwo.id}
          cameraFocus={stageCameraFixed ? 50 : (combat.positionOne + combat.positionTwo) / 2}
        />
        <InfernalAttackEffects
          combat={combat}
          fighterOneId={fighterOne.id}
          fighterTwoId={fighterTwo.id}
          fighterOneDefinition={fighterOneDefinition}
          fighterTwoDefinition={fighterTwoDefinition}
          running={infernalRules && fightPhase === 'running'}
          reducedMotion={motionReduced}
        />

        {phaseLabel && (
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

        {fightPhase === 'finish-window' && (
          <div className="infernal-finish-choice">
            <span>K.-O. décisif · {winnerName}</span>
            {matchMode === 'ai' && combat.matchWinner === 'two'
              ? <strong>Dernier Acte adverse</strong>
              : <button className="btn btn-primary" type="button" onClick={beginFinish}>Dernier Acte · {combat.matchWinner === 'one' ? 'H' : 'L'}</button>}
            <button className="btn btn-secondary" type="button" onClick={() => beginCinematic('victory')}>Passer</button>
          </div>
        )}
        {displayingFinish && finish && (
          <>
            <div className={`infernal-finish-effect fx-${finish.effect}`} aria-hidden="true" style={{ '--impact-x': `${combat.matchWinner === 'one' ? combat.positionTwo : combat.positionOne}%` } as CSSProperties} />
            {finish.detachedProp && <img className="infernal-detached-prop" src={finish.detachedProp} alt="" aria-hidden="true" style={{ '--prop-x': `${combat.matchWinner === 'one' ? combat.positionOne : combat.positionTwo}%`, '--prop-facing': combat.matchWinner === 'one' ? 1 : -1 } as CSSProperties} />}
            <div className="arena-cinematic-overlay" role="status"><span>Dernier Acte · {winnerName}</span><strong>{finish.title}</strong></div>
          </>
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
          {!fighterOneCinematicKind && combat.impactMsOne > 0 && <span className={`arena-hit-spark is-${impactOneKind} is-${impactOneTheme}`} />}
          {poseOne ? (
            <img
              className={`infernal-individual-pose${portraitPoseOne ? ' infernal-individual-pose--portrait' : ''}`}
              src={poseOne}
              style={poseOneAnchorStyle}
              data-ground-anchor={poseOnePlacement?.groundReference}
              alt=""
            />
          ) : fighterOneSpriteStyle ? (
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
          {!fighterTwoCinematicKind && combat.impactMsTwo > 0 && <span className={`arena-hit-spark is-${impactTwoKind} is-${impactTwoTheme}`} />}
          {poseTwo ? (
            <img
              className={`infernal-individual-pose${portraitPoseTwo ? ' infernal-individual-pose--portrait' : ''}`}
              src={poseTwo}
              style={poseTwoAnchorStyle}
              data-ground-anchor={poseTwoPlacement?.groundReference}
              alt=""
            />
          ) : fighterTwoSpriteStyle ? (
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
              {matchWinnerName ? nextMatchLabel ?? 'Rematch' : 'Next round'}
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
                    // A touch can also end with a trusted click whose detail
                    // is zero. Its pointerup has already released this control;
                    // only keyboard/assistive activation should toggle it.
                    const pointerType = 'pointerType' in event.nativeEvent
                      ? event.nativeEvent.pointerType : '';
                    if (event.detail === 0 && !pointerType) {
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
              {infernalRules && (side === 'one' ? fighterOneDefinition.signature : fighterTwoDefinition.signature) && (
                <button type="button" className="arena-touch-button is-attack"
                  aria-label={`${shortLabel} technique signature`} disabled={touchControlsDisabled}
                  onClick={() => performAttack(side, 'signature')}>
                  <span aria-hidden="true">{side === 'one' ? 'T' : 'I'}</span>
                  <small>Technique</small>
                </button>
              )}
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

      {infernalRules && <InfernalMoveList one={fighterOneDefinition} two={fighterTwoDefinition} />}
      <p className="arena-live-event" aria-live="polite" aria-atomic="true">{latestEvent}</p>
      <ol className="arena-combat-log" aria-label="Recent combat events">
        {combat.log.map(entry => <li key={entry.id}>{entry.text}</li>)}
      </ol>
    </section>
  );
}
