import type { CombatAction } from './pentagram-combat';

export type CombatPoseColumn = 0 | 2 | 3 | 4 | 5;

export function getCombatPoseColumn(action: CombatAction, remainingMs: number): CombatPoseColumn {
  const ms = Math.max(0, remainingMs);

  if (action === 'walk' || action === 'guard') return 2;
  if (action === 'hit' || action === 'ko') return 4;
  if (action === 'victory') return 5;

  if (action === 'light') {
    return ms > 110 ? 3 : 4;
  }

  if (action === 'heavy') {
    if (ms > 330) return 2;
    return ms > 140 ? 3 : 4;
  }

  if (action === 'special') {
    if (ms > 520) return 2;
    return ms > 180 ? 3 : 4;
  }

  return 0;
}
