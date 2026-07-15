import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { getCharacterSpriteAsset } from '../lib/character-sprites';
import { getCombatPoseColumn } from '../lib/pentagram-animation';
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
  isCombatAttackAction,
  releaseCombatGuard,
  resolveCombatAttack,
  stepCombat,
  type CombatAction,
  type CombatAttack,
  type CombatInputs,
  type CombatantDefinition,
  type PlayerSide,
} from '../lib/pentagram-combat';
import type { Character } from '../types';

interface PentagramLiveFightProps {
  fighterOne: Character;
  fighterTwo: Character;
  fighterOneDefinition: CombatantDefinition;
  fighterTwoDefinition: CombatantDefinition;
  matchMode: 'ai' | 'local';
  aiDifficulty: CombatAiDifficulty;
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

const MANAGED_CODES = new Set([
  'KeyA',
  'KeyQ',
  'KeyD',
  'KeyS',
  'KeyF',
  'KeyG',
  'KeyH',
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'KeyJ',
  'KeyK',
  'KeyL',
  'Enter',
  'Escape',
]);

const ATTACK_CODES: Readonly<Record<string, readonly [PlayerSide, CombatAttack]>> = {
  KeyF: ['one', 'light'],
  KeyG: ['one', 'heavy'],
  KeyH: ['one', 'special'],
  KeyJ: ['two', 'light'],
  KeyK: ['two', 'heavy'],
  KeyL: ['two', 'special'],
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(target.tagName);
}

function getActionLabel(action: CombatAction): string {
  if (action === 'light') return 'Light attack';
  if (action === 'heavy') return 'Heavy attack';
  if (action === 'special') return 'Special attack';
  if (action === 'hit') return 'Hit stun';
  if (action === 'ko') return 'K.O.';
  if (action === 'victory') return 'Victory';
  if (action === 'walk') return 'Moving';
  if (action === 'guard') return 'Guard';
  return 'Ready';
}

function getKeyboardInputs(codes: ReadonlySet<string>): CombatInputs {
  return {
    one: {
      left: codes.has('KeyQ') || codes.has('KeyA'),
      right: codes.has('KeyD'),
      guard: codes.has('KeyS'),
    },
    two: {
      left: codes.has('ArrowLeft'),
      right: codes.has('ArrowRight'),
      guard: codes.has('ArrowDown'),
    },
  };
}

function mergeInputs(keyboard: CombatInputs, pointer: CombatInputs): CombatInputs {
  return {
    one: {
      left: keyboard.one.left || pointer.one.left,
      right: keyboard.one.right || pointer.one.right,
      guard: keyboard.one.guard || pointer.one.guard,
    },
    two: {
      left: keyboard.two.left || pointer.two.left,
      right: keyboard.two.right || pointer.two.right,
      guard: keyboard.two.guard || pointer.two.guard,
    },
  };
}

function createEmptyInputs(): CombatInputs {
  return {
    one: { left: false, right: false, guard: false },
    two: { left: false, right: false, guard: false },
  };
}

export function PentagramLiveFight({
  fighterOne,
  fighterTwo,
  fighterOneDefinition,
  fighterTwoDefinition,
  matchMode,
  aiDifficulty,
  onExit,
}: PentagramLiveFightProps) {
  const [combat, setCombat] = useState(() => createCombatState(
    fighterOneDefinition,
    fighterTwoDefinition,
  ));
  const stageRef = useRef<HTMLDivElement>(null);
  const pressedCodesRef = useRef<Set<string>>(new Set());
  const pointerInputsRef = useRef<CombatInputs>(createEmptyInputs());
  const pointerTrackersRef = useRef<Map<number, PointerTracker>>(new Map());
  const lastTapRef = useRef<Record<PlayerSide, number>>({ one: 0, two: 0 });
  const aiInputRef = useRef(createEmptyInputs().two);
  const aiThinkMsRef = useRef(0);

  const readInputs = useCallback(() => {
    const humanInputs = mergeInputs(
      getKeyboardInputs(pressedCodesRef.current),
      pointerInputsRef.current,
    );
    return matchMode === 'ai'
      ? { ...humanInputs, two: aiInputRef.current }
      : humanInputs;
  }, [matchMode]);

  const applyInputSnapshot = useCallback(() => {
    setCombat(current => stepCombat(
      current,
      readInputs(),
      0,
      fighterOneDefinition,
      fighterTwoDefinition,
    ));
  }, [fighterOneDefinition, fighterTwoDefinition, readInputs]);

  const performAttack = useCallback((
    side: PlayerSide,
    attack: CombatAttack,
    allowLightCancel = false,
  ) => {
    if (matchMode === 'ai' && side === 'two') return;
    setCombat(current => resolveCombatAttack(
      current,
      side,
      attack,
      fighterOneDefinition,
      fighterTwoDefinition,
      allowLightCancel,
    ));
  }, [fighterOneDefinition, fighterTwoDefinition, matchMode]);

  const clearLiveInputs = useCallback(() => {
    pressedCodesRef.current.clear();
    pointerInputsRef.current = createEmptyInputs();
    pointerTrackersRef.current.clear();
    aiInputRef.current = createEmptyInputs().two;
    aiThinkMsRef.current = 0;
    setCombat(current => releaseCombatGuard(current));
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
      const elapsedMs = now - previousTime;
      previousTime = now;
      setCombat((current) => {
        let next = current;
        if (matchMode === 'ai' && current.active) {
          aiThinkMsRef.current -= elapsedMs;
          if (aiThinkMsRef.current <= 0) {
            const decision = decideCombatAi(
              current,
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
          }
        } else if (matchMode === 'ai') {
          aiInputRef.current = createEmptyInputs().two;
        }

        return stepCombat(
          next,
          readInputs(),
          elapsedMs,
          fighterOneDefinition,
          fighterTwoDefinition,
        );
      });
      frameId = requestFrame(runFrame);
    };

    frameId = requestFrame(runFrame);
    return () => cancelFrame(frameId);
  }, [aiDifficulty, fighterOneDefinition, fighterTwoDefinition, matchMode, readInputs]);

  useEffect(() => {
    const pressedCodes = pressedCodesRef.current;
    const pointerTrackers = pointerTrackersRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!MANAGED_CODES.has(event.code) || isEditableTarget(event.target)) return;
      event.preventDefault();

      if (event.code === 'Escape') {
        clearLiveInputs();
        onExit();
        return;
      }

      if (event.code === 'Enter') {
        if (!event.repeat) {
          aiThinkMsRef.current = 0;
          setCombat(current => current.active
            ? current
            : createNextCombatRound(current, fighterOneDefinition, fighterTwoDefinition));
        }
        return;
      }

      pressedCodesRef.current.add(event.code);
      const attackBinding = ATTACK_CODES[event.code];
      if (attackBinding && !event.repeat) performAttack(attackBinding[0], attackBinding[1]);
      else applyInputSnapshot();
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!MANAGED_CODES.has(event.code)) return;
      if (!isEditableTarget(event.target)) event.preventDefault();
      pressedCodesRef.current.delete(event.code);
      applyInputSnapshot();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') clearLiveInputs();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearLiveInputs);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearLiveInputs);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      pressedCodes.clear();
      pointerTrackers.clear();
    };
  }, [applyInputSnapshot, clearLiveInputs, fighterOneDefinition, fighterTwoDefinition, onExit, performAttack]);

  const setPointerDirection = (side: PlayerSide, deltaX: number, guarding: boolean) => {
    if (matchMode === 'ai' && side === 'two') return;
    const nextSide = {
      left: deltaX < -14,
      right: deltaX > 14,
      guard: guarding,
    };
    pointerInputsRef.current = {
      ...pointerInputsRef.current,
      [side]: nextSide,
    };
    applyInputSnapshot();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
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
    setPointerDirection(side, 0, true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const tracker = pointerTrackersRef.current.get(event.pointerId);
    if (!tracker) return;
    tracker.lastX = event.clientX;
    tracker.lastY = event.clientY;
    const deltaX = event.clientX - tracker.startX;
    const deltaY = event.clientY - tracker.startY;
    tracker.moved = tracker.moved || Math.abs(deltaX) > 14 || Math.abs(deltaY) > 20;
    const guarding = !tracker.moved;
    setPointerDirection(tracker.side, deltaX, guarding);
  };

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    const tracker = pointerTrackersRef.current.get(event.pointerId);
    if (!tracker) return;
    pointerTrackersRef.current.delete(event.pointerId);
    setPointerDirection(tracker.side, 0, false);
    if (cancelled) return;

    const deltaY = tracker.startY - tracker.lastY;
    const elapsedMs = window.performance.now() - tracker.startedAt;
    if (!combat.active) {
      if (tracker.side === 'one') {
        aiThinkMsRef.current = 0;
        setCombat(createNextCombatRound(combat, fighterOneDefinition, fighterTwoDefinition));
      } else {
        clearLiveInputs();
        onExit();
      }
      return;
    }
    if (deltaY < -44) {
      clearLiveInputs();
      onExit();
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
  const fighterOnePose = getCombatPoseColumn(combat.actionOne, combat.actionMsOne);
  const fighterTwoPose = getCombatPoseColumn(combat.actionTwo, combat.actionMsTwo);
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
  const fighterOneStyle = {
    '--arena-x': `${combat.positionOne}%`,
    '--arena-action-ms': isCombatAttackAction(combat.actionOne)
      ? `${getCombatAttackDuration(fighterOneDefinition, combat.actionOne)}ms`
      : '340ms',
  } as CSSProperties;
  const fighterTwoStyle = {
    '--arena-x': `${combat.positionTwo}%`,
    '--arena-action-ms': isCombatAttackAction(combat.actionTwo)
      ? `${getCombatAttackDuration(fighterTwoDefinition, combat.actionTwo)}ms`
      : '340ms',
  } as CSSProperties;
  const fighterOneSpriteStyle: CSSProperties | undefined = fighterOneSprite ? {
    backgroundImage: `url("${fighterOneSprite.sheet}")`,
    backgroundPosition: `${fighterOnePose * 20}% ${fighterOneSprite.row * (100 / 3)}%`,
  } : undefined;
  const fighterTwoSpriteStyle: CSSProperties | undefined = fighterTwoSprite ? {
    backgroundImage: `url("${fighterTwoSprite.sheet}")`,
    backgroundPosition: `${fighterTwoPose * 20}% ${fighterTwoSprite.row * (100 / 3)}%`,
  } : undefined;

  return (
    <section className="arena-fight-panel arena-live-shell art-deco-border" aria-labelledby="arena-fight-title">
      <div className="arena-fight-panel__top">
        <div>
          <span className="arena-live-kicker">
            {matchMode === 'ai'
              ? `CPU sparring · ${COMBAT_AI_DIFFICULTY_LABELS[aiDifficulty]}`
              : 'Two-player local exhibition'}
          </span>
          <h2 id="arena-fight-title">2.5D combat — {fighterOne.name} vs {fighterTwo.name}</h2>
        </div>
        <div className="arena-round-counter">
          <span>Round {combat.round} · first to 2</span>
          <strong aria-label={`${timerSeconds} seconds remaining`}>{timerSeconds}</strong>
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
        role="region"
        tabIndex={0}
        aria-label={`Live combat: ${fighterOne.name} versus ${fighterTwo.name}`}
        aria-describedby="arena-live-instructions"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => finishPointer(event)}
        onPointerCancel={(event) => finishPointer(event, true)}
      >
        <div className="arena-stage__glow" aria-hidden="true" />
        <div className="arena-lane-grid" aria-hidden="true" />
        <div className="arena-crowd-lights" aria-hidden="true" />

        <div
          className={`arena-combatant is-one is-${combat.actionOne}`}
          style={fighterOneStyle}
          data-position={combat.positionOne.toFixed(2)}
          data-action={combat.actionOne}
          data-pose-column={fighterOnePose}
          aria-hidden="true"
        >
          <span className="arena-guard-badge">{getActionLabel(combat.actionOne)}</span>
          <span className="arena-fighter-shadow" />
          <span className="arena-action-trail" />
          {combat.impactMsOne > 0 && <span className="arena-hit-spark" />}
          {fighterOneSpriteStyle ? (
            <span className="arena-sprite-frame" style={fighterOneSpriteStyle} />
          ) : fighterOneSprite ? (
            <img src={fighterOneSprite.portrait} alt="" />
          ) : (
            <strong>{fighterOne.name.slice(0, 2).toUpperCase()}</strong>
          )}
        </div>

        <div
          className={`arena-combatant is-two is-${combat.actionTwo}`}
          style={fighterTwoStyle}
          data-position={combat.positionTwo.toFixed(2)}
          data-action={combat.actionTwo}
          data-pose-column={fighterTwoPose}
          aria-hidden="true"
        >
          <span className="arena-guard-badge">{getActionLabel(combat.actionTwo)}</span>
          <span className="arena-fighter-shadow" />
          <span className="arena-action-trail" />
          {combat.impactMsTwo > 0 && <span className="arena-hit-spark" />}
          {fighterTwoSpriteStyle ? (
            <span className="arena-sprite-frame" style={fighterTwoSpriteStyle} />
          ) : fighterTwoSprite ? (
            <img src={fighterTwoSprite.portrait} alt="" />
          ) : (
            <strong>{fighterTwo.name.slice(0, 2).toUpperCase()}</strong>
          )}
        </div>

        {!combat.active && (
          <div className="arena-ko" role="status">
            <strong>{resultTitle}</strong>
            <span>Press Enter for {nextFightLabel} · Escape for fighter select</span>
            <span>Touch: tap the left half for {nextFightLabel} · tap the right half for fighter select</span>
          </div>
        )}
      </div>

      <div id="arena-live-instructions" className="arena-live-instructions">
        <div className="arena-keymap" aria-label={`${fighterOne.name} controls`}>
          <strong>P1 · {fighterOne.name}</strong>
          <span><kbd>Q</kbd>/<kbd>A</kbd> <kbd>D</kbd> move · <kbd>S</kbd> guard</span>
          <span><kbd>F</kbd> light · <kbd>G</kbd> heavy · <kbd>H</kbd> special</span>
        </div>
        <p>
          The fight runs live while keys are held. <kbd>Esc</kbd> returns to fighter select;
          <kbd>Enter</kbd> continues the best-of-three set after a round.
          <small>
            Touch: drag to move, hold to guard, tap for light, double-tap for a heavy cancel,
            swipe up for special, swipe down for fighter select.
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
              <span><kbd>←</kbd> <kbd>→</kbd> move · <kbd>↓</kbd> guard</span>
              <span><kbd>J</kbd> light · <kbd>K</kbd> heavy · <kbd>L</kbd> special</span>
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
