import type { CSSProperties } from 'react';
import { getInfernalAttackEffectFrame } from '../lib/infernal-attack-effects';
import type { CombatState, CombatantDefinition } from '../lib/pentagram-combat';
import '../styles/infernal-attack-effects.css';

interface InfernalAttackEffectsProps {
  combat: CombatState;
  fighterOneId: string;
  fighterTwoId: string;
  fighterOneDefinition: CombatantDefinition;
  fighterTwoDefinition: CombatantDefinition;
  running: boolean;
  reducedMotion: boolean;
}

export function InfernalAttackEffects({
  combat, fighterOneId, fighterTwoId, fighterOneDefinition, fighterTwoDefinition,
  running, reducedMotion,
}: InfernalAttackEffectsProps) {
  const frames = (['one', 'two'] as const).flatMap(side => {
    const frame = getInfernalAttackEffectFrame({
      fighterId: side === 'one' ? fighterOneId : fighterTwoId,
      definition: side === 'one' ? fighterOneDefinition : fighterTwoDefinition,
      side, combat, running, reducedMotion,
    });
    return frame ? [frame] : [];
  });
  if (!frames.length) return null;
  return (
    <div className="infernal-attack-effects" aria-hidden="true" data-reduced-motion={reducedMotion}>
      {frames.map(frame => (
        <img
          key={`${frame.side}-${frame.id}`}
          className="infernal-attack-effect"
          src={frame.image}
          alt=""
          draggable={false}
          data-effect={frame.id}
          data-side={frame.side}
          data-facing={frame.facing === 1 ? 'right' : 'left'}
          data-effect-phase={frame.phase}
          data-range-end={frame.rangeEndX.toFixed(3)}
          style={{
            left: `${frame.x}%`, width: `${frame.width}%`, opacity: frame.opacity,
            '--infernal-effect-facing': frame.facing,
            '--infernal-effect-height': frame.height,
            '--infernal-effect-elevation': frame.elevation,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
