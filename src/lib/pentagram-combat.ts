export type PlayerSide = 'one' | 'two';

export type CombatWinner = PlayerSide | 'draw' | null;

export type CombatAction =
  | 'idle'
  | 'walk'
  | 'guard'
  | 'light'
  | 'heavy'
  | 'special'
  | 'hit'
  | 'ko'
  | 'victory';

export type CombatAttack = 'light' | 'heavy' | 'special';

export interface CombatantDefinition {
  name: string;
  power: number;
  range: number;
  speed: number;
  guard: number;
  tensionGain: number;
  basicMove: string;
  heavyMove: string;
  specialMove: string;
}

export interface CombatDirectionalInput {
  left: boolean;
  right: boolean;
  guard: boolean;
}

export interface CombatInputs {
  one: CombatDirectionalInput;
  two: CombatDirectionalInput;
}

export interface CombatLogEntry {
  id: number;
  text: string;
}

export interface CombatState {
  active: boolean;
  hpOne: number;
  hpTwo: number;
  tensionOne: number;
  tensionTwo: number;
  guardOne: boolean;
  guardTwo: boolean;
  positionOne: number;
  positionTwo: number;
  timerMs: number;
  round: number;
  actionOne: CombatAction;
  actionTwo: CombatAction;
  actionMsOne: number;
  actionMsTwo: number;
  cooldownMsOne: number;
  cooldownMsTwo: number;
  log: CombatLogEntry[];
  nextLogId: number;
  winner: CombatWinner;
}

const STAGE_MIN = 7;
const STAGE_MAX = 93;
const MIN_FIGHTER_GAP = 7;
const MAX_PHYSICS_FRAME_MS = 64;

const ATTACK_DATA: Record<CombatAttack, {
  actionMs: number;
  cooldownMs: number;
  hitstunMs: number;
  reachBonus: number;
  damageBonus: number;
  knockback: number;
  tensionCost: number;
}> = {
  light: {
    actionMs: 340,
    cooldownMs: 360,
    hitstunMs: 210,
    reachBonus: 0,
    damageBonus: 0,
    knockback: 1.8,
    tensionCost: 0,
  },
  heavy: {
    actionMs: 460,
    cooldownMs: 640,
    hitstunMs: 330,
    reachBonus: 1.8,
    damageBonus: 8,
    knockback: 3.2,
    tensionCost: 0,
  },
  special: {
    actionMs: 700,
    cooldownMs: 940,
    hitstunMs: 470,
    reachBonus: 8,
    damageBonus: 17,
    knockback: 5,
    tensionCost: 50,
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function appendLog(state: CombatState, text: string): Pick<CombatState, 'log' | 'nextLogId'> {
  return {
    log: [{ id: state.nextLogId, text }, ...state.log].slice(0, 6),
    nextLogId: state.nextLogId + 1,
  };
}

function getMoveSpeed(definition: CombatantDefinition): number {
  return 11 + definition.speed * 0.13;
}

function getAttackReach(definition: CombatantDefinition, attack: CombatAttack): number {
  return Math.max(
    MIN_FIGHTER_GAP + 0.5,
    4.5 + definition.range / 18 + ATTACK_DATA[attack].reachBonus,
  );
}

function isLockedAction(action: CombatAction, actionMs: number): boolean {
  return actionMs > 0 && (
    action === 'light'
    || action === 'heavy'
    || action === 'special'
    || action === 'hit'
  );
}

function getIdleAction(guarding: boolean, direction: number): CombatAction {
  if (guarding) return 'guard';
  return direction === 0 ? 'idle' : 'walk';
}

function resolveWinnerByTime(
  state: CombatState,
  fighterOne: CombatantDefinition,
  fighterTwo: CombatantDefinition,
): CombatState {
  const winner: CombatWinner = state.hpOne === state.hpTwo
    ? 'draw'
    : state.hpOne > state.hpTwo ? 'one' : 'two';
  const result = winner === 'draw'
    ? 'Time over: the Simulation AU exhibition ends in a draw.'
    : `${winner === 'one' ? fighterOne.name : fighterTwo.name} wins the Simulation AU round by HP lead.`;
  const nextLog = appendLog(state, result);

  return {
    ...state,
    active: false,
    timerMs: 0,
    winner,
    actionOne: winner === 'one' ? 'victory' : winner === 'two' ? 'ko' : 'idle',
    actionTwo: winner === 'two' ? 'victory' : winner === 'one' ? 'ko' : 'idle',
    actionMsOne: 0,
    actionMsTwo: 0,
    ...nextLog,
  };
}

export function createCombatState(
  fighterOne: CombatantDefinition,
  fighterTwo: CombatantDefinition,
  round = 1,
): CombatState {
  return {
    active: true,
    hpOne: 100,
    hpTwo: 100,
    tensionOne: 0,
    tensionTwo: 0,
    guardOne: false,
    guardTwo: false,
    positionOne: 22,
    positionTwo: 78,
    timerMs: 99_000,
    round,
    actionOne: 'idle',
    actionTwo: 'idle',
    actionMsOne: 0,
    actionMsTwo: 0,
    cooldownMsOne: 0,
    cooldownMsTwo: 0,
    log: [{ id: 0, text: `Round ${round} live: ${fighterOne.name} vs ${fighterTwo.name}.` }],
    nextLogId: 1,
    winner: null,
  };
}

export function releaseCombatGuard(state: CombatState): CombatState {
  if (!state.guardOne && !state.guardTwo) return state;
  return {
    ...state,
    guardOne: false,
    guardTwo: false,
    actionOne: state.actionOne === 'guard' ? 'idle' : state.actionOne,
    actionTwo: state.actionTwo === 'guard' ? 'idle' : state.actionTwo,
  };
}

export function stepCombat(
  state: CombatState,
  inputs: CombatInputs,
  elapsedMs: number,
  fighterOne: CombatantDefinition,
  fighterTwo: CombatantDefinition,
): CombatState {
  if (!state.active) return state;

  const realElapsedMs = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  const physicsFrameMs = Math.min(realElapsedMs, MAX_PHYSICS_FRAME_MS);
  const frameSeconds = physicsFrameMs / 1000;
  const actionMsOne = Math.max(0, state.actionMsOne - realElapsedMs);
  const actionMsTwo = Math.max(0, state.actionMsTwo - realElapsedMs);
  const cooldownMsOne = Math.max(0, state.cooldownMsOne - realElapsedMs);
  const cooldownMsTwo = Math.max(0, state.cooldownMsTwo - realElapsedMs);
  const lockedOne = isLockedAction(state.actionOne, actionMsOne);
  const lockedTwo = isLockedAction(state.actionTwo, actionMsTwo);
  const directionOne = lockedOne || inputs.one.guard
    ? 0
    : Number(inputs.one.right) - Number(inputs.one.left);
  const directionTwo = lockedTwo || inputs.two.guard
    ? 0
    : Number(inputs.two.right) - Number(inputs.two.left);
  const guardOne = inputs.one.guard && !lockedOne;
  const guardTwo = inputs.two.guard && !lockedTwo;

  let positionOne = clamp(
    state.positionOne + directionOne * getMoveSpeed(fighterOne) * frameSeconds,
    STAGE_MIN,
    STAGE_MAX,
  );
  let positionTwo = clamp(
    state.positionTwo + directionTwo * getMoveSpeed(fighterTwo) * frameSeconds,
    STAGE_MIN,
    STAGE_MAX,
  );

  const overlap = MIN_FIGHTER_GAP - (positionTwo - positionOne);
  if (overlap > 0) {
    const oneAdvanced = positionOne > state.positionOne;
    const twoAdvanced = positionTwo < state.positionTwo;
    if (oneAdvanced && twoAdvanced) {
      positionOne -= overlap / 2;
      positionTwo += overlap / 2;
    } else if (oneAdvanced) {
      positionOne -= overlap;
    } else {
      positionTwo += overlap;
    }
    positionOne = clamp(positionOne, STAGE_MIN, STAGE_MAX - MIN_FIGHTER_GAP);
    positionTwo = clamp(positionTwo, positionOne + MIN_FIGHTER_GAP, STAGE_MAX);
  }

  const timerMs = Math.max(0, state.timerMs - realElapsedMs);
  const next: CombatState = {
    ...state,
    timerMs,
    positionOne,
    positionTwo,
    guardOne,
    guardTwo,
    actionMsOne,
    actionMsTwo,
    cooldownMsOne,
    cooldownMsTwo,
    actionOne: lockedOne ? state.actionOne : getIdleAction(guardOne, directionOne),
    actionTwo: lockedTwo ? state.actionTwo : getIdleAction(guardTwo, directionTwo),
  };

  return timerMs <= 0 ? resolveWinnerByTime(next, fighterOne, fighterTwo) : next;
}

export function resolveCombatAttack(
  state: CombatState,
  side: PlayerSide,
  attack: CombatAttack,
  fighterOne: CombatantDefinition,
  fighterTwo: CombatantDefinition,
  allowLightCancel = false,
): CombatState {
  if (!state.active) return state;

  const attacker = side === 'one' ? fighterOne : fighterTwo;
  const defender = side === 'one' ? fighterTwo : fighterOne;
  const cooldown = side === 'one' ? state.cooldownMsOne : state.cooldownMsTwo;
  const action = side === 'one' ? state.actionOne : state.actionTwo;
  const actionMs = side === 'one' ? state.actionMsOne : state.actionMsTwo;
  const tension = side === 'one' ? state.tensionOne : state.tensionTwo;
  const attackData = ATTACK_DATA[attack];
  const canCancelLight = allowLightCancel
    && attack === 'heavy'
    && action === 'light'
    && actionMs > 0;

  if (!canCancelLight && (cooldown > 0 || isLockedAction(action, actionMs))) return state;

  if (tension < attackData.tensionCost) {
    const nextLog = appendLog(
      state,
      `${attacker.name} needs ${attackData.tensionCost} tension before ${attacker.specialMove}.`,
    );
    return { ...state, ...nextLog };
  }

  const moveName = attack === 'light'
    ? attacker.basicMove
    : attack === 'heavy' ? attacker.heavyMove : attacker.specialMove;
  const distance = Math.abs(state.positionTwo - state.positionOne);
  const inRange = distance <= getAttackReach(attacker, attack);
  const defenderGuarding = side === 'one' ? state.guardTwo : state.guardOne;
  const baseDamage = attacker.power
    + attackData.damageBonus
    + (attack === 'light' ? Math.round(attacker.speed / 24) : Math.round(attacker.range / 22));
  const guardMultiplier = clamp(0.42 - defender.guard * 0.0022, 0.18, 0.34);
  const damage = !inRange
    ? 0
    : defenderGuarding ? Math.max(2, Math.round(baseDamage * guardMultiplier)) : baseDamage;
  const nextAttackerTension = clamp(
    tension - attackData.tensionCost + (attack === 'special' ? 2 : attacker.tensionGain),
    0,
    100,
  );
  const defenderTension = side === 'one' ? state.tensionTwo : state.tensionOne;
  const nextDefenderTension = clamp(defenderTension + (defenderGuarding ? 10 : damage > 0 ? 5 : 0), 0, 100);
  const next: CombatState = {
    ...state,
    guardOne: side === 'one' ? false : defenderGuarding,
    guardTwo: side === 'two' ? false : defenderGuarding,
    actionOne: side === 'one' ? attack : damage > 0 && !defenderGuarding ? 'hit' : state.actionOne,
    actionTwo: side === 'two' ? attack : damage > 0 && !defenderGuarding ? 'hit' : state.actionTwo,
    actionMsOne: side === 'one'
      ? attackData.actionMs
      : damage > 0 && !defenderGuarding ? attackData.hitstunMs : state.actionMsOne,
    actionMsTwo: side === 'two'
      ? attackData.actionMs
      : damage > 0 && !defenderGuarding ? attackData.hitstunMs : state.actionMsTwo,
    cooldownMsOne: side === 'one' ? attackData.cooldownMs : state.cooldownMsOne,
    cooldownMsTwo: side === 'two' ? attackData.cooldownMs : state.cooldownMsTwo,
    tensionOne: side === 'one' ? nextAttackerTension : nextDefenderTension,
    tensionTwo: side === 'two' ? nextAttackerTension : nextDefenderTension,
  };

  if (side === 'one') {
    next.hpTwo = clamp(next.hpTwo - damage, 0, 100);
    if (damage > 0) next.positionTwo = clamp(next.positionTwo + attackData.knockback, next.positionOne + MIN_FIGHTER_GAP, STAGE_MAX);
  } else {
    next.hpOne = clamp(next.hpOne - damage, 0, 100);
    if (damage > 0) next.positionOne = clamp(next.positionOne - attackData.knockback, STAGE_MIN, next.positionTwo - MIN_FIGHTER_GAP);
  }

  const resultText = !inRange
    ? `${attacker.name} whiffs ${moveName}; ${defender.name} is outside range.`
    : `${attacker.name} lands ${moveName} for ${damage} damage${defenderGuarding ? ' through guard' : ''}.`;
  const nextLog = appendLog(next, resultText);
  next.log = nextLog.log;
  next.nextLogId = nextLog.nextLogId;

  const winner: CombatWinner = next.hpOne <= 0 ? 'two' : next.hpTwo <= 0 ? 'one' : null;
  if (!winner) return next;

  const winnerName = winner === 'one' ? fighterOne.name : fighterTwo.name;
  const winnerLog = appendLog(next, `${winnerName} wins the Simulation AU round by K.O.`);
  return {
    ...next,
    active: false,
    winner,
    guardOne: false,
    guardTwo: false,
    actionOne: winner === 'one' ? 'victory' : 'ko',
    actionTwo: winner === 'two' ? 'victory' : 'ko',
    actionMsOne: 0,
    actionMsTwo: 0,
    ...winnerLog,
  };
}
