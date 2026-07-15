import {
  canStartCombatAttack,
  getCombatAttackReach,
  isCombatActionLocked,
  type CombatAttack,
  type CombatDirectionalInput,
  type CombatState,
  type CombatantDefinition,
  type PlayerSide,
} from './pentagram-combat';

export type CombatAiDifficulty = 'rookie' | 'standard' | 'overlord';

export const COMBAT_AI_DIFFICULTY_LABELS: Readonly<Record<CombatAiDifficulty, string>> = {
  rookie: 'Rookie',
  standard: 'Standard',
  overlord: 'Overlord',
};

export interface CombatAiDecision {
  input: CombatDirectionalInput;
  attack: CombatAttack | null;
}

interface CombatAiTuning {
  thinkIntervalMs: number;
  guardChance: number;
  heavyChance: number;
  specialChance: number;
  retreatChance: number;
  idleChance: number;
}

const AI_TUNING: Readonly<Record<CombatAiDifficulty, CombatAiTuning>> = {
  rookie: {
    thinkIntervalMs: 430,
    guardChance: 0.22,
    heavyChance: 0.25,
    specialChance: 0.24,
    retreatChance: 0.08,
    idleChance: 0.28,
  },
  standard: {
    thinkIntervalMs: 260,
    guardChance: 0.52,
    heavyChance: 0.48,
    specialChance: 0.58,
    retreatChance: 0.18,
    idleChance: 0.1,
  },
  overlord: {
    thinkIntervalMs: 150,
    guardChance: 0.76,
    heavyChance: 0.64,
    specialChance: 0.82,
    retreatChance: 0.28,
    idleChance: 0.03,
  },
};

const IDLE_INPUT: CombatDirectionalInput = {
  left: false,
  right: false,
  guard: false,
};

export function getCombatAiThinkInterval(difficulty: CombatAiDifficulty): number {
  return AI_TUNING[difficulty].thinkIntervalMs;
}

export function decideCombatAi(
  state: CombatState,
  side: PlayerSide,
  fighterOne: CombatantDefinition,
  fighterTwo: CombatantDefinition,
  difficulty: CombatAiDifficulty,
  random: () => number = Math.random,
): CombatAiDecision {
  if (!state.active || state.hitstopMs > 0) return { input: IDLE_INPUT, attack: null };

  const tuning = AI_TUNING[difficulty];
  const fighter = side === 'one' ? fighterOne : fighterTwo;
  const opponent = side === 'one' ? fighterTwo : fighterOne;
  const action = side === 'one' ? state.actionOne : state.actionTwo;
  const actionMs = side === 'one' ? state.actionMsOne : state.actionMsTwo;
  const opponentAction = side === 'one' ? state.actionTwo : state.actionOne;
  const opponentActionMs = side === 'one' ? state.actionMsTwo : state.actionMsOne;
  const distance = Math.abs(state.positionTwo - state.positionOne);
  const opponentThreatening = (
    opponentAction === 'light'
    || opponentAction === 'heavy'
    || opponentAction === 'special'
  ) && opponentActionMs > 0;

  if (isCombatActionLocked(action, actionMs)) {
    return { input: IDLE_INPUT, attack: null };
  }

  if (
    opponentThreatening
    && distance <= getCombatAttackReach(opponent, opponentAction) + 1.5
    && random() < tuning.guardChance
  ) {
    return {
      input: { left: false, right: false, guard: true },
      attack: null,
    };
  }

  const towardOpponent: CombatDirectionalInput = side === 'one'
    ? { left: false, right: true, guard: false }
    : { left: true, right: false, guard: false };
  const awayFromOpponent: CombatDirectionalInput = side === 'one'
    ? { left: true, right: false, guard: false }
    : { left: false, right: true, guard: false };
  const lightReach = getCombatAttackReach(fighter, 'light');
  const heavyReach = getCombatAttackReach(fighter, 'heavy');
  const specialReach = getCombatAttackReach(fighter, 'special');

  if (distance > Math.max(heavyReach + 1.5, lightReach + 2.5)) {
    return { input: towardOpponent, attack: null };
  }

  if (distance <= 8.2 && random() < tuning.retreatChance) {
    return { input: awayFromOpponent, attack: null };
  }

  if (
    distance <= specialReach
    && canStartCombatAttack(state, side, 'special', fighterOne, fighterTwo)
    && random() < tuning.specialChance
  ) {
    return { input: IDLE_INPUT, attack: 'special' };
  }

  if (
    distance <= heavyReach
    && canStartCombatAttack(state, side, 'heavy', fighterOne, fighterTwo)
    && random() < tuning.heavyChance
  ) {
    return { input: IDLE_INPUT, attack: 'heavy' };
  }

  if (
    distance <= lightReach
    && canStartCombatAttack(state, side, 'light', fighterOne, fighterTwo)
    && random() >= tuning.idleChance
  ) {
    return { input: IDLE_INPUT, attack: 'light' };
  }

  return {
    input: distance > lightReach ? towardOpponent : IDLE_INPUT,
    attack: null,
  };
}
