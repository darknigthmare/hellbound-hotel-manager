import {
  getCombatMoveInfo,
  isCombatAttackAction,
  type CombatAttack,
  type CombatState,
  type CombatantDefinition,
  type PlayerSide,
} from './pentagram-combat';

export type InfernalAttackEffectId =
  | 'cherri-bomb'
  | 'moxxie-bullet'
  | 'andrealphus-ice'
  | 'vox-electric'
  | 'sirpentious-ray'
  | 'alastor-shadow'
  | 'husk-card'
  | 'adam-light'
  | 'stolas-portal'
  | 'asmodeus-smoke'
  | 'beelzebub-ribbon'
  | 'velvette-arrow'
  | 'striker-lasso'
  | 'valentino-smoke';

export interface InfernalAttackEffectDefinition {
  id: InfernalAttackEffectId;
  image: string;
  attacks: readonly Exclude<CombatAttack, 'signature'>[];
  kind: 'projectile' | 'beam' | 'sweep';
  /** Visual approach ends at the engine's existing impact boundary. */
  leadMs: number;
  lingerMs: number;
  /** Percentage of the arena width; beams use the existing move reach. */
  width: number;
  /** Height and elevation are relative to the rendered fighter width. */
  height: number;
  elevation: number;
  arc?: number;
  canonStatus: 'simulation_au';
}

const effectImage = (id: InfernalAttackEffectId) => `/assets/vfx/infernal-versus/${id}.webp`;

/**
 * Original visual adaptations of the existing moves. These images are not
 * independent projectile entities: they add no collision, damage, homing,
 * status effect, or extra reach. The combat engine remains authoritative.
 */
export const INFERNAL_ATTACK_EFFECTS: Readonly<Record<string, InfernalAttackEffectDefinition>> = {
  cherribomb: {
    id: 'cherri-bomb', image: effectImage('cherri-bomb'), attacks: ['heavy', 'special'],
    kind: 'projectile', leadMs: 150, lingerMs: 130, width: 5, height: 0.25,
    elevation: 0.48, arc: 0.14, canonStatus: 'simulation_au',
  },
  hb_moxxie: {
    id: 'moxxie-bullet', image: effectImage('moxxie-bullet'), attacks: ['light', 'heavy', 'special'],
    kind: 'projectile', leadMs: 85, lingerMs: 100, width: 7, height: 0.18,
    elevation: 0.46, canonStatus: 'simulation_au',
  },
  hb_andrealphus: {
    id: 'andrealphus-ice', image: effectImage('andrealphus-ice'), attacks: ['light', 'heavy', 'special'],
    kind: 'projectile', leadMs: 120, lingerMs: 145, width: 8, height: 0.26,
    elevation: 0.5, canonStatus: 'simulation_au',
  },
  vox: {
    id: 'vox-electric', image: effectImage('vox-electric'), attacks: ['heavy', 'special'],
    kind: 'beam', leadMs: 110, lingerMs: 150, width: 0, height: 0.3,
    elevation: 0.54, canonStatus: 'simulation_au',
  },
  sirpentious: {
    id: 'sirpentious-ray', image: effectImage('sirpentious-ray'), attacks: ['heavy'],
    kind: 'beam', leadMs: 130, lingerMs: 150, width: 0, height: 0.28,
    elevation: 0.42, canonStatus: 'simulation_au',
  },
  alastor: {
    id: 'alastor-shadow', image: effectImage('alastor-shadow'), attacks: ['heavy', 'special'],
    kind: 'sweep', leadMs: 135, lingerMs: 160, width: 0, height: 0.4,
    elevation: 0.2, canonStatus: 'simulation_au',
  },
  // Source frames and the observed-motif/AU distinction are recorded in
  // art/infernal-versus/production/projectiles-wave-d-2026-11-24.json.
  husk: {
    id: 'husk-card', image: effectImage('husk-card'), attacks: ['light', 'special'],
    kind: 'projectile', leadMs: 105, lingerMs: 120, width: 9, height: 0.3,
    elevation: 0.48, arc: 0.04, canonStatus: 'simulation_au',
  },
  adam: {
    id: 'adam-light', image: effectImage('adam-light'), attacks: ['heavy'],
    kind: 'beam', leadMs: 110, lingerMs: 140, width: 0, height: 0.24,
    elevation: 0.53, canonStatus: 'simulation_au',
  },
  hb_stolas: {
    id: 'stolas-portal', image: effectImage('stolas-portal'), attacks: ['heavy'],
    kind: 'sweep', leadMs: 130, lingerMs: 160, width: 0, height: 0.75,
    elevation: 0.48, canonStatus: 'simulation_au',
  },
  hb_asmodeus: {
    id: 'asmodeus-smoke', image: effectImage('asmodeus-smoke'), attacks: ['special'],
    kind: 'sweep', leadMs: 140, lingerMs: 180, width: 0, height: 0.45,
    elevation: 0.28, canonStatus: 'simulation_au',
  },
  hb_beelzebub: {
    id: 'beelzebub-ribbon', image: effectImage('beelzebub-ribbon'), attacks: ['heavy'],
    kind: 'sweep', leadMs: 125, lingerMs: 150, width: 0, height: 0.42,
    elevation: 0.45, canonStatus: 'simulation_au',
  },
  velvette: {
    id: 'velvette-arrow', image: effectImage('velvette-arrow'), attacks: ['heavy', 'special'],
    kind: 'projectile', leadMs: 110, lingerMs: 140, width: 9, height: 0.28,
    elevation: 0.52, canonStatus: 'simulation_au',
  },
  valentino: {
    id: 'valentino-smoke', image: effectImage('valentino-smoke'), attacks: ['special'],
    kind: 'sweep', leadMs: 140, lingerMs: 180, width: 0, height: 0.46,
    elevation: 0.5, canonStatus: 'simulation_au',
  },
  // Ordinary gunfire reuses the existing AU bullet. This does not assert a
  // character-specific canonical ammunition shape or an angelic bullet design.
  angeldust: {
    id: 'moxxie-bullet', image: effectImage('moxxie-bullet'), attacks: ['heavy', 'special'],
    kind: 'projectile', leadMs: 85, lingerMs: 100, width: 7, height: 0.18,
    elevation: 0.52, canonStatus: 'simulation_au',
  },
  hb_blitzo: {
    id: 'moxxie-bullet', image: effectImage('moxxie-bullet'), attacks: ['heavy', 'special'],
    kind: 'projectile', leadMs: 85, lingerMs: 100, width: 7, height: 0.18,
    elevation: 0.46, canonStatus: 'simulation_au',
  },
  hb_striker: {
    id: 'moxxie-bullet', image: effectImage('moxxie-bullet'), attacks: ['heavy'],
    kind: 'projectile', leadMs: 85, lingerMs: 100, width: 7, height: 0.18,
    elevation: 0.52, canonStatus: 'simulation_au',
  },
};

/** A distinct move may use another motif without replacing its fighter's gunfire. */
const INFERNAL_ATTACK_EFFECT_VARIANTS: Readonly<Record<string, readonly InfernalAttackEffectDefinition[]>> = {
  hb_striker: [{
    id: 'striker-lasso', image: effectImage('striker-lasso'), attacks: ['special'],
    kind: 'sweep', leadMs: 130, lingerMs: 170, width: 0, height: 0.4,
    elevation: 0.48, canonStatus: 'simulation_au',
  }],
};

/** Complete inventory for asset audits, including alternate effects by move. */
export function getInfernalAttackEffectEntries(): readonly (readonly [string, InfernalAttackEffectDefinition])[] {
  return [
    ...Object.entries(INFERNAL_ATTACK_EFFECTS),
    ...Object.entries(INFERNAL_ATTACK_EFFECT_VARIANTS)
      .flatMap(([fighter, effects]) => effects.map(effect => [fighter, effect] as const)),
  ];
}

export interface InfernalAttackEffectFrame {
  id: InfernalAttackEffectId;
  image: string;
  side: PlayerSide;
  facing: 1 | -1;
  phase: 'approach' | 'release';
  x: number;
  width: number;
  height: number;
  elevation: number;
  opacity: number;
  rangeEndX: number;
}

interface InfernalAttackEffectInput {
  fighterId: string;
  definition: CombatantDefinition;
  side: PlayerSide;
  combat: CombatState;
  running: boolean;
  reducedMotion?: boolean;
}

/**
 * Derive the complete presentation from simulation time, never a CSS clock or
 * timeout. Hit-stop freezes the frame; pause/cinematics unmount it. Cancellation,
 * hit stun, KO, recovery and round transitions cannot leave a stale effect alive.
 */
export function getInfernalAttackEffectFrame({
  fighterId, definition, side, combat, running, reducedMotion = false,
}: InfernalAttackEffectInput): InfernalAttackEffectFrame | null {
  if (!running || !combat.active || combat.winner !== null || combat.matchWinner !== null
    || combat.hpOne <= 0 || combat.hpTwo <= 0 || combat.timerMs <= 0) return null;
  const isOne = side === 'one';
  const action = isOne ? combat.actionOne : combat.actionTwo;
  if (!isCombatAttackAction(action) || action === 'signature') return null;
  const primary = INFERNAL_ATTACK_EFFECTS[fighterId];
  const effect = primary?.attacks.includes(action) ? primary
    : INFERNAL_ATTACK_EFFECT_VARIANTS[fighterId]?.find(candidate => candidate.attacks.includes(action));
  if (!effect) return null;

  const duration = isOne ? combat.actionDurationMsOne : combat.actionDurationMsTwo;
  const remaining = isOne ? combat.actionMsOne : combat.actionMsTwo;
  const origin = isOne ? combat.positionOne : combat.positionTwo;
  if (![duration, remaining, origin].every(Number.isFinite)
    || duration <= 0 || remaining <= 0 || remaining > duration) return null;

  const elapsed = duration - remaining;
  const move = getCombatMoveInfo(definition, action);
  const start = Math.max(0, move.startupMs - effect.leadMs);
  const end = Math.min(duration, move.startupMs + effect.lingerMs);
  if (elapsed < start || elapsed >= end) return null;
  const released = elapsed >= move.startupMs;
  const pending = isOne ? combat.pendingAttackOne : combat.pendingAttackTwo;
  if ((!released && pending !== action) || (reducedMotion && !released)) return null;

  const facing = isOne ? 1 : -1;
  // Stop at the move's real reach even on a whiff. Never draw a shot through a
  // distant opponent whom the underlying attack cannot hit.
  const reach = Math.min(move.reach, isOne ? 100 - origin : origin);
  if (!Number.isFinite(reach) || reach <= 0) return null;
  const progress = released ? 1 : (elapsed - start) / Math.max(1, move.startupMs - start);
  const width = effect.kind === 'projectile'
    ? Math.min(effect.width, reach)
    : (reach - Math.min(1.6, reach / 3)) * (0.12 + 0.88 * progress);
  const offset = effect.kind === 'projectile'
    ? width / 2 + (reach - width) * progress
    : Math.min(1.6, reach / 3) + width / 2;
  return {
    id: effect.id, image: effect.image, side, facing,
    phase: released ? 'release' : 'approach',
    x: Math.min(100 - width / 2, Math.max(width / 2, origin + facing * offset)),
    width, height: effect.height,
    elevation: effect.elevation + (reducedMotion ? 0 : (effect.arc ?? 0) * Math.sin(Math.PI * progress)),
    opacity: reducedMotion ? 0.65 : released
      ? Math.max(0, 1 - (elapsed - move.startupMs) / effect.lingerMs)
      : 0.65 + 0.35 * progress,
    rangeEndX: origin + facing * reach,
  };
}
