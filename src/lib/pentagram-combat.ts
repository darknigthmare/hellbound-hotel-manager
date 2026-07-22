export type PlayerSide = 'one' | 'two';

export type CombatWinner = PlayerSide | 'draw' | null;

export type CombatAction =
  | 'idle'
  | 'walk'
  | 'guard'
  | 'crouch'
  | 'jump'
  | 'taunt'
  | 'light'
  | 'heavy'
  | 'special'
  | 'hit'
  | 'ko'
  | 'victory';

export type CombatAttack = 'light' | 'heavy' | 'special';
export type CombatPoseAction = 'jump' | 'taunt';

export type CombatStyle =
  | 'balanced'
  | 'rushdown'
  | 'duelist'
  | 'zoner'
  | 'bruiser'
  | 'trickster'
  | 'guardian'
  | 'boss';

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
  style?: CombatStyle;
}

export interface CombatDirectionalInput {
  left: boolean;
  right: boolean;
  guard: boolean;
  crouch?: boolean;
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
  roundWinsOne: number;
  roundWinsTwo: number;
  matchWinner: PlayerSide | null;
  actionOne: CombatAction;
  actionTwo: CombatAction;
  actionMsOne: number;
  actionMsTwo: number;
  actionDurationMsOne: number;
  actionDurationMsTwo: number;
  lastHitAttackOne: CombatAttack | null;
  lastHitAttackTwo: CombatAttack | null;
  cooldownMsOne: number;
  cooldownMsTwo: number;
  pendingAttackOne: CombatAttack | null;
  pendingAttackTwo: CombatAttack | null;
  impactMsOne: number;
  impactMsTwo: number;
  hitstopMs: number;
  log: CombatLogEntry[];
  nextLogId: number;
  winner: CombatWinner;
}

interface CombatAttackData {
  actionMs: number;
  startupMs: number;
  cooldownMs: number;
  hitstunMs: number;
  reachBonus: number;
  damageBonus: number;
  knockback: number;
  tensionCost: number;
}

interface CombatStyleTuning {
  moveSpeedScale: number;
  actionScale: number;
  cooldownScale: number;
  guardScale: number;
  tensionBonus: number;
  damageBonus: Partial<Record<CombatAttack, number>>;
  reachBonus: Partial<Record<CombatAttack, number>>;
  knockbackScale: number;
}

const STAGE_MIN = 7;
const STAGE_MAX = 93;
const MIN_FIGHTER_GAP = 7;
const MAX_GAME_FRAME_MS = 1_000;
const COMBAT_SIMULATION_STEP_MS = 16;
const IMPACT_EFFECT_MS = 220;
const HITSTOP_MS = 58;
const GLOBAL_DAMAGE_SCALE = 0.66;
const POSE_ACTION_DURATION_MS: Readonly<Record<CombatPoseAction, number>> = {
  jump: 680,
  taunt: 1_000,
};
const POSE_ACTION_COOLDOWN_MS: Readonly<Record<CombatPoseAction, number>> = {
  jump: 420,
  taunt: 1_250,
};

export const COMBAT_MATCH_WINS_REQUIRED = 2;

const ATTACK_DATA: Record<CombatAttack, CombatAttackData> = {
  light: {
    actionMs: 340,
    startupMs: 120,
    cooldownMs: 360,
    hitstunMs: 210,
    reachBonus: 0,
    damageBonus: 0,
    knockback: 1.8,
    tensionCost: 0,
  },
  heavy: {
    actionMs: 460,
    startupMs: 220,
    cooldownMs: 640,
    hitstunMs: 330,
    reachBonus: 1.8,
    damageBonus: 8,
    knockback: 3.2,
    tensionCost: 0,
  },
  special: {
    actionMs: 700,
    startupMs: 360,
    cooldownMs: 940,
    hitstunMs: 470,
    reachBonus: 8,
    damageBonus: 17,
    knockback: 5,
    tensionCost: 50,
  },
};

const DEFAULT_STYLE_TUNING: CombatStyleTuning = {
  moveSpeedScale: 1,
  actionScale: 1,
  cooldownScale: 1,
  guardScale: 1,
  tensionBonus: 0,
  damageBonus: {},
  reachBonus: {},
  knockbackScale: 1,
};

const STYLE_TUNING: Record<CombatStyle, CombatStyleTuning> = {
  balanced: DEFAULT_STYLE_TUNING,
  rushdown: {
    ...DEFAULT_STYLE_TUNING,
    moveSpeedScale: 1.08,
    actionScale: 0.9,
    cooldownScale: 0.88,
    reachBonus: { light: -0.4, heavy: -0.3 },
  },
  duelist: {
    ...DEFAULT_STYLE_TUNING,
    moveSpeedScale: 1.03,
    guardScale: 0.9,
    damageBonus: { heavy: 2 },
    reachBonus: { light: 0.8, heavy: 1.5 },
  },
  zoner: {
    ...DEFAULT_STYLE_TUNING,
    moveSpeedScale: 0.94,
    actionScale: 1.04,
    reachBonus: { light: 1, heavy: 3, special: 5 },
  },
  bruiser: {
    ...DEFAULT_STYLE_TUNING,
    moveSpeedScale: 0.9,
    actionScale: 1.1,
    cooldownScale: 1.08,
    damageBonus: { light: 2, heavy: 5, special: 7 },
    knockbackScale: 1.2,
  },
  trickster: {
    ...DEFAULT_STYLE_TUNING,
    moveSpeedScale: 1.05,
    cooldownScale: 0.94,
    tensionBonus: 3,
    reachBonus: { special: 2 },
  },
  guardian: {
    ...DEFAULT_STYLE_TUNING,
    moveSpeedScale: 0.96,
    guardScale: 0.78,
    tensionBonus: 1,
    reachBonus: { heavy: 1 },
  },
  boss: {
    ...DEFAULT_STYLE_TUNING,
    moveSpeedScale: 0.97,
    actionScale: 1.04,
    guardScale: 0.88,
    damageBonus: { light: 1, heavy: 3, special: 4 },
    reachBonus: { heavy: 1, special: 2 },
    knockbackScale: 1.08,
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function appendLog(state: CombatState, text: string): Pick<CombatState, 'log' | 'nextLogId'> {
  return {
    log: [{ id: state.nextLogId, text }, ...state.log].slice(0, 7),
    nextLogId: state.nextLogId + 1,
  };
}

function getStyleTuning(definition: CombatantDefinition): CombatStyleTuning {
  return STYLE_TUNING[definition.style ?? 'balanced'];
}

function getAttackData(definition: CombatantDefinition, attack: CombatAttack): CombatAttackData {
  const base = ATTACK_DATA[attack];
  const tuning = getStyleTuning(definition);
  return {
    ...base,
    actionMs: Math.round(base.actionMs * tuning.actionScale),
    startupMs: Math.round(base.startupMs * tuning.actionScale),
    cooldownMs: Math.round(base.cooldownMs * tuning.cooldownScale),
    reachBonus: base.reachBonus + (tuning.reachBonus[attack] ?? 0),
    damageBonus: base.damageBonus + (tuning.damageBonus[attack] ?? 0),
    knockback: base.knockback * tuning.knockbackScale,
  };
}

function getMoveSpeed(definition: CombatantDefinition): number {
  return (11 + definition.speed * 0.13) * getStyleTuning(definition).moveSpeedScale;
}

export function getCombatAttackReach(
  definition: CombatantDefinition,
  attack: CombatAttack,
): number {
  return Math.max(
    MIN_FIGHTER_GAP + 0.5,
    4.5 + definition.range / 18 + getAttackData(definition, attack).reachBonus,
  );
}

export function getCombatAttackDuration(
  definition: CombatantDefinition,
  attack: CombatAttack,
): number {
  return getAttackData(definition, attack).actionMs;
}

export function getCombatPoseActionDuration(action: CombatPoseAction): number {
  return POSE_ACTION_DURATION_MS[action];
}

export function isCombatAttackAction(action: CombatAction): action is CombatAttack {
  return action === 'light' || action === 'heavy' || action === 'special';
}

export function isCombatPoseAction(action: CombatAction): action is CombatPoseAction {
  return action === 'jump' || action === 'taunt';
}

export function isCombatActionLocked(action: CombatAction, actionMs: number): boolean {
  return actionMs > 0 && (
    isCombatAttackAction(action)
    || action === 'hit'
    || isCombatPoseAction(action)
  );
}

function getIdleAction(
  guarding: boolean,
  crouching: boolean,
  direction: number,
): CombatAction {
  if (guarding) return 'guard';
  if (crouching) return 'crouch';
  return direction === 0 ? 'idle' : 'walk';
}

function getMoveName(definition: CombatantDefinition, attack: CombatAttack): string {
  if (attack === 'light') return definition.basicMove;
  return attack === 'heavy' ? definition.heavyMove : definition.specialMove;
}

function finishRound(
  state: CombatState,
  winner: CombatWinner,
  result: string,
  winnerName?: string,
): CombatState {
  const roundWinsOne = state.roundWinsOne + Number(winner === 'one');
  const roundWinsTwo = state.roundWinsTwo + Number(winner === 'two');
  const matchWinner = roundWinsOne >= COMBAT_MATCH_WINS_REQUIRED
    ? 'one'
    : roundWinsTwo >= COMBAT_MATCH_WINS_REQUIRED ? 'two' : null;
  const roundLog = appendLog(state, result);
  const nextWithRoundLog = { ...state, ...roundLog };
  const matchLog = matchWinner
    ? appendLog(
      nextWithRoundLog,
      `${winnerName ?? (matchWinner === 'one' ? 'Player one' : 'Player two')} claims the best-of-three exhibition.`,
    )
    : roundLog;

  return {
    ...state,
    active: false,
    roundWinsOne,
    roundWinsTwo,
    matchWinner,
    winner,
    guardOne: false,
    guardTwo: false,
    actionOne: winner === 'one' ? 'victory' : winner === 'two' ? 'ko' : 'idle',
    actionTwo: winner === 'two' ? 'victory' : winner === 'one' ? 'ko' : 'idle',
    actionMsOne: 0,
    actionMsTwo: 0,
    actionDurationMsOne: 0,
    actionDurationMsTwo: 0,
    lastHitAttackOne: null,
    lastHitAttackTwo: null,
    cooldownMsOne: 0,
    cooldownMsTwo: 0,
    pendingAttackOne: null,
    pendingAttackTwo: null,
    hitstopMs: 0,
    ...matchLog,
  };
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
    ? 'Time over: the Simulation AU round ends in a draw.'
    : `${winner === 'one' ? fighterOne.name : fighterTwo.name} wins round ${state.round} by HP lead.`;

  return finishRound(
    { ...state, timerMs: 0 },
    winner,
    result,
    winner === 'one' ? fighterOne.name : winner === 'two' ? fighterTwo.name : undefined,
  );
}

export function createCombatState(
  fighterOne: CombatantDefinition,
  fighterTwo: CombatantDefinition,
  round = 1,
  roundWinsOne = 0,
  roundWinsTwo = 0,
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
    roundWinsOne,
    roundWinsTwo,
    matchWinner: null,
    actionOne: 'idle',
    actionTwo: 'idle',
    actionMsOne: 0,
    actionMsTwo: 0,
    actionDurationMsOne: 0,
    actionDurationMsTwo: 0,
    lastHitAttackOne: null,
    lastHitAttackTwo: null,
    cooldownMsOne: 0,
    cooldownMsTwo: 0,
    pendingAttackOne: null,
    pendingAttackTwo: null,
    impactMsOne: 0,
    impactMsTwo: 0,
    hitstopMs: 0,
    log: [{ id: 0, text: `Round ${round} live: ${fighterOne.name} vs ${fighterTwo.name}.` }],
    nextLogId: 1,
    winner: null,
  };
}

export function createNextCombatRound(
  state: CombatState,
  fighterOne: CombatantDefinition,
  fighterTwo: CombatantDefinition,
): CombatState {
  if (state.active) return state;
  if (state.matchWinner) return createCombatState(fighterOne, fighterTwo);
  return createCombatState(
    fighterOne,
    fighterTwo,
    state.round + 1,
    state.roundWinsOne,
    state.roundWinsTwo,
  );
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

export function resolveCombatPoseAction(
  state: CombatState,
  side: PlayerSide,
  action: CombatPoseAction,
  fighterOne: CombatantDefinition,
  fighterTwo: CombatantDefinition,
): CombatState {
  if (!state.active || state.hitstopMs > 0) return state;

  const currentAction = side === 'one' ? state.actionOne : state.actionTwo;
  const currentActionMs = side === 'one' ? state.actionMsOne : state.actionMsTwo;
  const cooldownMs = side === 'one' ? state.cooldownMsOne : state.cooldownMsTwo;
  if (cooldownMs > 0 || isCombatActionLocked(currentAction, currentActionMs)) {
    return state;
  }

  const fighter = side === 'one' ? fighterOne : fighterTwo;
  const durationMs = POSE_ACTION_DURATION_MS[action];
  const cooldown = POSE_ACTION_COOLDOWN_MS[action];
  const tensionGain = action === 'taunt' ? 8 : 0;
  const actionLog = appendLog(
    state,
    action === 'taunt'
      ? `${fighter.name} taunts and builds 8 tension.`
      : `${fighter.name} jumps clear of the floor.`,
  );

  return {
    ...state,
    guardOne: side === 'one' ? false : state.guardOne,
    guardTwo: side === 'two' ? false : state.guardTwo,
    actionOne: side === 'one' ? action : state.actionOne,
    actionTwo: side === 'two' ? action : state.actionTwo,
    actionMsOne: side === 'one' ? durationMs : state.actionMsOne,
    actionMsTwo: side === 'two' ? durationMs : state.actionMsTwo,
    actionDurationMsOne: side === 'one' ? durationMs : state.actionDurationMsOne,
    actionDurationMsTwo: side === 'two' ? durationMs : state.actionDurationMsTwo,
    cooldownMsOne: side === 'one' ? cooldown : state.cooldownMsOne,
    cooldownMsTwo: side === 'two' ? cooldown : state.cooldownMsTwo,
    pendingAttackOne: side === 'one' ? null : state.pendingAttackOne,
    pendingAttackTwo: side === 'two' ? null : state.pendingAttackTwo,
    tensionOne: side === 'one'
      ? clamp(state.tensionOne + tensionGain, 0, 100)
      : state.tensionOne,
    tensionTwo: side === 'two'
      ? clamp(state.tensionTwo + tensionGain, 0, 100)
      : state.tensionTwo,
    ...actionLog,
  };
}

export function canStartCombatAttack(
  state: CombatState,
  side: PlayerSide,
  attack: CombatAttack,
  fighterOne: CombatantDefinition,
  fighterTwo: CombatantDefinition,
  allowLightCancel = false,
): boolean {
  if (!state.active || state.hitstopMs > 0) return false;
  const definition = side === 'one' ? fighterOne : fighterTwo;
  const cooldown = side === 'one' ? state.cooldownMsOne : state.cooldownMsTwo;
  const action = side === 'one' ? state.actionOne : state.actionTwo;
  const actionMs = side === 'one' ? state.actionMsOne : state.actionMsTwo;
  const tension = side === 'one' ? state.tensionOne : state.tensionTwo;
  const canCancelLight = allowLightCancel
    && attack === 'heavy'
    && action === 'light'
    && actionMs > 0;

  return tension >= getAttackData(definition, attack).tensionCost
    && (canCancelLight || (cooldown <= 0 && !isCombatActionLocked(action, actionMs)));
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
  const action = side === 'one' ? state.actionOne : state.actionTwo;
  const actionMs = side === 'one' ? state.actionMsOne : state.actionMsTwo;
  const canCancelLight = allowLightCancel
    && attack === 'heavy'
    && action === 'light'
    && actionMs > 0;
  const attackData = getAttackData(attacker, attack);
  const tension = side === 'one' ? state.tensionOne : state.tensionTwo;

  if (tension < attackData.tensionCost) {
    const nextLog = appendLog(
      state,
      `${attacker.name} needs ${attackData.tensionCost} tension before ${attacker.specialMove}.`,
    );
    return { ...state, ...nextLog };
  }

  if (!canStartCombatAttack(
    state,
    side,
    attack,
    fighterOne,
    fighterTwo,
    allowLightCancel,
  )) return state;

  const moveName = getMoveName(attacker, attack);
  const launchLog = appendLog(
    state,
    canCancelLight
      ? `${attacker.name} cancels into ${moveName}.`
      : `${attacker.name} starts ${moveName}.`,
  );

  return {
    ...state,
    guardOne: side === 'one' ? false : state.guardOne,
    guardTwo: side === 'two' ? false : state.guardTwo,
    actionOne: side === 'one' ? attack : state.actionOne,
    actionTwo: side === 'two' ? attack : state.actionTwo,
    actionMsOne: side === 'one' ? attackData.actionMs : state.actionMsOne,
    actionMsTwo: side === 'two' ? attackData.actionMs : state.actionMsTwo,
    actionDurationMsOne: side === 'one' ? attackData.actionMs : state.actionDurationMsOne,
    actionDurationMsTwo: side === 'two' ? attackData.actionMs : state.actionDurationMsTwo,
    cooldownMsOne: side === 'one' ? attackData.cooldownMs : state.cooldownMsOne,
    cooldownMsTwo: side === 'two' ? attackData.cooldownMs : state.cooldownMsTwo,
    pendingAttackOne: side === 'one' ? attack : state.pendingAttackOne,
    pendingAttackTwo: side === 'two' ? attack : state.pendingAttackTwo,
    tensionOne: side === 'one' ? tension - attackData.tensionCost : state.tensionOne,
    tensionTwo: side === 'two' ? tension - attackData.tensionCost : state.tensionTwo,
    ...launchLog,
  };
}

function hasReachedImpact(
  previousActionMs: number,
  nextActionMs: number,
  definition: CombatantDefinition,
  attack: CombatAttack | null,
): attack is CombatAttack {
  if (!attack) return false;
  const attackData = getAttackData(definition, attack);
  const activeAtRemainingMs = attackData.actionMs - attackData.startupMs;
  return previousActionMs > activeAtRemainingMs && nextActionMs <= activeAtRemainingMs;
}

function getTimeToPendingImpact(
  actionMs: number,
  definition: CombatantDefinition,
  attack: CombatAttack | null,
): number {
  if (!attack) return Number.POSITIVE_INFINITY;
  const attackData = getAttackData(definition, attack);
  const activeAtRemainingMs = attackData.actionMs - attackData.startupMs;
  return actionMs > activeAtRemainingMs
    ? actionMs - activeAtRemainingMs
    : Number.POSITIVE_INFINITY;
}

function applyAttackImpact(
  state: CombatState,
  side: PlayerSide,
  attack: CombatAttack,
  fighterOne: CombatantDefinition,
  fighterTwo: CombatantDefinition,
  impactDistance: number,
  defenderGuardingAtImpact: boolean,
): CombatState {
  const attacker = side === 'one' ? fighterOne : fighterTwo;
  const defender = side === 'one' ? fighterTwo : fighterOne;
  const attackData = getAttackData(attacker, attack);
  const moveName = getMoveName(attacker, attack);
  const inRange = impactDistance <= getCombatAttackReach(attacker, attack);
  const defenderTuning = getStyleTuning(defender);
  const baseDamage = Math.max(1, Math.round((
    attacker.power
    + attackData.damageBonus
    + (attack === 'light' ? Math.round(attacker.speed / 24) : Math.round(attacker.range / 22))
  ) * GLOBAL_DAMAGE_SCALE));
  const guardMultiplier = clamp(
    (0.42 - defender.guard * 0.0022) * defenderTuning.guardScale,
    0.14,
    0.34,
  );
  const damage = !inRange
    ? 0
    : defenderGuardingAtImpact
      ? Math.max(2, Math.round(baseDamage * guardMultiplier))
      : baseDamage;
  const attackerTuning = getStyleTuning(attacker);
  // Tension is earned through contact, never by swinging or guarding in empty space.
  const attackerTensionGain = inRange
    ? attacker.tensionGain + attackerTuning.tensionBonus
    : 0;
  const defenderTensionGain = inRange
    ? defenderGuardingAtImpact ? 10 : damage > 0 ? 5 : 0
    : 0;
  const next: CombatState = {
    ...state,
    pendingAttackOne: side === 'one' ? null : state.pendingAttackOne,
    pendingAttackTwo: side === 'two' ? null : state.pendingAttackTwo,
    tensionOne: side === 'one'
      ? clamp(state.tensionOne + attackerTensionGain, 0, 100)
      : clamp(state.tensionOne + defenderTensionGain, 0, 100),
    tensionTwo: side === 'two'
      ? clamp(state.tensionTwo + attackerTensionGain, 0, 100)
      : clamp(state.tensionTwo + defenderTensionGain, 0, 100),
    impactMsOne: side === 'two' && inRange ? IMPACT_EFFECT_MS : state.impactMsOne,
    impactMsTwo: side === 'one' && inRange ? IMPACT_EFFECT_MS : state.impactMsTwo,
    hitstopMs: inRange ? HITSTOP_MS : state.hitstopMs,
  };

  if (side === 'one') {
    next.hpTwo = clamp(next.hpTwo - damage, 0, 100);
    if (damage > 0) {
      next.positionTwo = clamp(
        next.positionTwo + attackData.knockback,
        next.positionOne + MIN_FIGHTER_GAP,
        STAGE_MAX,
      );
    }
    if (damage > 0 && !defenderGuardingAtImpact) {
      next.actionTwo = 'hit';
      next.actionMsTwo = attackData.hitstunMs;
      next.actionDurationMsTwo = attackData.hitstunMs;
      next.lastHitAttackTwo = attack;
      next.pendingAttackTwo = null;
      next.guardTwo = false;
    }
  } else {
    next.hpOne = clamp(next.hpOne - damage, 0, 100);
    if (damage > 0) {
      next.positionOne = clamp(
        next.positionOne - attackData.knockback,
        STAGE_MIN,
        next.positionTwo - MIN_FIGHTER_GAP,
      );
    }
    if (damage > 0 && !defenderGuardingAtImpact) {
      next.actionOne = 'hit';
      next.actionMsOne = attackData.hitstunMs;
      next.actionDurationMsOne = attackData.hitstunMs;
      next.lastHitAttackOne = attack;
      next.pendingAttackOne = null;
      next.guardOne = false;
    }
  }

  const resultText = !inRange
    ? `${attacker.name} whiffs ${moveName}; ${defender.name} escaped before impact.`
    : `${attacker.name} lands ${moveName} for ${damage} damage${defenderGuardingAtImpact ? ' through guard' : ''}.`;
  return { ...next, ...appendLog(next, resultText) };
}

function stepCombatSlice(
  state: CombatState,
  inputs: CombatInputs,
  elapsedMs: number,
  fighterOne: CombatantDefinition,
  fighterTwo: CombatantDefinition,
): CombatState {
  if (!state.active) return state;

  const gameElapsedMs = Math.max(0, elapsedMs);
  if (state.hitstopMs > 0 && gameElapsedMs > 0) {
    return {
      ...state,
      hitstopMs: Math.max(0, state.hitstopMs - gameElapsedMs),
    };
  }

  const frameSeconds = gameElapsedMs / 1000;
  const actionMsOne = Math.max(0, state.actionMsOne - gameElapsedMs);
  const actionMsTwo = Math.max(0, state.actionMsTwo - gameElapsedMs);
  const cooldownMsOne = Math.max(0, state.cooldownMsOne - gameElapsedMs);
  const cooldownMsTwo = Math.max(0, state.cooldownMsTwo - gameElapsedMs);
  const lockedOneBeforeSlice = isCombatActionLocked(state.actionOne, state.actionMsOne);
  const lockedTwoBeforeSlice = isCombatActionLocked(state.actionTwo, state.actionMsTwo);
  const lockedOneAfterSlice = isCombatActionLocked(state.actionOne, actionMsOne);
  const lockedTwoAfterSlice = isCombatActionLocked(state.actionTwo, actionMsTwo);
  const crouchOne = Boolean(inputs.one.crouch) && !lockedOneAfterSlice;
  const crouchTwo = Boolean(inputs.two.crouch) && !lockedTwoAfterSlice;
  const directionOne = lockedOneBeforeSlice || inputs.one.guard || crouchOne
    ? 0
    : Number(inputs.one.right) - Number(inputs.one.left);
  const directionTwo = lockedTwoBeforeSlice || inputs.two.guard || crouchTwo
    ? 0
    : Number(inputs.two.right) - Number(inputs.two.left);
  const guardOne = inputs.one.guard && !lockedOneAfterSlice;
  const guardTwo = inputs.two.guard && !lockedTwoAfterSlice;

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

  const timerMs = Math.max(0, state.timerMs - gameElapsedMs);
  const impactDistance = Math.abs(positionTwo - positionOne);
  const attackOneAtImpact = hasReachedImpact(
    state.actionMsOne,
    actionMsOne,
    fighterOne,
    state.pendingAttackOne,
  ) ? state.pendingAttackOne : null;
  const attackTwoAtImpact = hasReachedImpact(
    state.actionMsTwo,
    actionMsTwo,
    fighterTwo,
    state.pendingAttackTwo,
  ) ? state.pendingAttackTwo : null;
  let next: CombatState = {
    ...state,
    timerMs,
    positionOne,
    positionTwo,
    guardOne,
    guardTwo,
    actionMsOne,
    actionMsTwo,
    actionDurationMsOne: lockedOneAfterSlice ? state.actionDurationMsOne : 0,
    actionDurationMsTwo: lockedTwoAfterSlice ? state.actionDurationMsTwo : 0,
    lastHitAttackOne: lockedOneAfterSlice && state.actionOne === 'hit'
      ? state.lastHitAttackOne
      : null,
    lastHitAttackTwo: lockedTwoAfterSlice && state.actionTwo === 'hit'
      ? state.lastHitAttackTwo
      : null,
    cooldownMsOne,
    cooldownMsTwo,
    impactMsOne: Math.max(0, state.impactMsOne - gameElapsedMs),
    impactMsTwo: Math.max(0, state.impactMsTwo - gameElapsedMs),
    actionOne: lockedOneAfterSlice
      ? state.actionOne
      : getIdleAction(guardOne, crouchOne, directionOne),
    actionTwo: lockedTwoAfterSlice
      ? state.actionTwo
      : getIdleAction(guardTwo, crouchTwo, directionTwo),
    pendingAttackOne: actionMsOne > 0 ? state.pendingAttackOne : null,
    pendingAttackTwo: actionMsTwo > 0 ? state.pendingAttackTwo : null,
  };

  if (attackOneAtImpact) {
    next = applyAttackImpact(
      next,
      'one',
      attackOneAtImpact,
      fighterOne,
      fighterTwo,
      impactDistance,
      guardTwo,
    );
  }
  if (attackTwoAtImpact) {
    next = applyAttackImpact(
      next,
      'two',
      attackTwoAtImpact,
      fighterOne,
      fighterTwo,
      impactDistance,
      guardOne,
    );
  }

  const knockedOutOne = next.hpOne <= 0;
  const knockedOutTwo = next.hpTwo <= 0;
  if (knockedOutOne || knockedOutTwo) {
    const winner: CombatWinner = knockedOutOne && knockedOutTwo
      ? 'draw'
      : knockedOutOne ? 'two' : 'one';
    const result = winner === 'draw'
      ? `Round ${next.round} ends in a double K.O.`
      : `${winner === 'one' ? fighterOne.name : fighterTwo.name} wins round ${next.round} by K.O.`;
    return finishRound(
      next,
      winner,
      result,
      winner === 'one' ? fighterOne.name : winner === 'two' ? fighterTwo.name : undefined,
    );
  }

  return timerMs <= 0 ? resolveWinnerByTime(next, fighterOne, fighterTwo) : next;
}

export function stepCombat(
  state: CombatState,
  inputs: CombatInputs,
  elapsedMs: number,
  fighterOne: CombatantDefinition,
  fighterTwo: CombatantDefinition,
): CombatState {
  const requestedElapsedMs = Number.isFinite(elapsedMs) ? Math.max(0, elapsedMs) : 0;
  let remainingMs = Math.min(requestedElapsedMs, MAX_GAME_FRAME_MS);

  // A zero-time snapshot still updates held movement/guard state immediately.
  if (remainingMs === 0) {
    return stepCombatSlice(state, inputs, 0, fighterOne, fighterTwo);
  }

  let next = state;
  while (remainingMs > 0.0001 && next.active) {
    // Fixed-size slices keep movement, startup windows and hitstop deterministic
    // when requestAnimationFrame falls from 60 fps to a much lower cadence.
    const hitstopSlice = next.hitstopMs > 0 ? next.hitstopMs : Number.POSITIVE_INFINITY;
    // Never simulate movement or an active frame past time-over. Without this
    // boundary, a 16 ms slice could let an attack due in 8 ms land even when
    // only 1 ms remained on the round clock.
    const timerSlice = next.hitstopMs > 0
      ? Number.POSITIVE_INFINITY
      : Math.max(0, next.timerMs);
    if (timerSlice === 0) {
      next = stepCombatSlice(next, inputs, 0, fighterOne, fighterTwo);
      continue;
    }
    const actionSliceOne = isCombatActionLocked(next.actionOne, next.actionMsOne)
      ? next.actionMsOne
      : Number.POSITIVE_INFINITY;
    const actionSliceTwo = isCombatActionLocked(next.actionTwo, next.actionMsTwo)
      ? next.actionMsTwo
      : Number.POSITIVE_INFINITY;
    const impactSliceOne = getTimeToPendingImpact(
      next.actionMsOne,
      fighterOne,
      next.pendingAttackOne,
    );
    const impactSliceTwo = getTimeToPendingImpact(
      next.actionMsTwo,
      fighterTwo,
      next.pendingAttackTwo,
    );
    const sliceMs = Math.min(
      COMBAT_SIMULATION_STEP_MS,
      remainingMs,
      hitstopSlice,
      timerSlice,
      actionSliceOne,
      actionSliceTwo,
      impactSliceOne,
      impactSliceTwo,
    );
    next = stepCombatSlice(next, inputs, sliceMs, fighterOne, fighterTwo);
    remainingMs -= sliceMs;
  }

  return next;
}
