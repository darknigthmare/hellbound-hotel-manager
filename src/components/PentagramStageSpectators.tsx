import {
  useEffect,
  useMemo,
  type CSSProperties,
} from 'react';
import {
  getCharacterSpriteSheet,
} from '../lib/character-sprites';
import {
  getPentagramStageSpectators,
} from '../lib/pentagram-spectators';
import type { PentagramStageId } from '../lib/pentagram-stages';
import type { TimelineState } from '../types';

interface PentagramStageSpectatorsProps {
  stageId: PentagramStageId;
  timeline: TimelineState;
  fighterOneId: string;
  fighterTwoId: string;
  cameraFocus: number;
}

export function PentagramStageSpectators({
  stageId,
  timeline,
  fighterOneId,
  fighterTwoId,
  cameraFocus,
}: PentagramStageSpectatorsProps) {
  const spectators = useMemo(
    () => getPentagramStageSpectators(
      stageId,
      timeline,
      fighterOneId,
      fighterTwoId,
    ),
    [fighterOneId, fighterTwoId, stageId, timeline],
  );
  const movementSheets = useMemo(
    () => [...new Set(spectators.map(({ sprite }) => (
      getCharacterSpriteSheet(sprite, 'movement')
    )))],
    [spectators],
  );

  useEffect(() => {
    if (typeof window.Image !== 'function') return;
    movementSheets.forEach((url) => {
      const preload = new window.Image();
      preload.src = url;
    });
  }, [movementSheets]);

  if (spectators.length === 0) return null;

  const cameraDelta = 50 - cameraFocus;

  return (
    <div
      className="arena-stage-spectators"
      data-stage-spectator-count={spectators.length}
      aria-hidden="true"
    >
      {spectators.map(({ id, name, sprite, slot }, index) => {
        const spectatorStyle = {
          '--arena-spectator-x': `${slot.x + cameraDelta * slot.parallax}%`,
          '--arena-spectator-bottom': `${slot.bottom}%`,
          '--arena-spectator-scale': slot.scale,
          '--arena-spectator-facing': slot.facing === 'left' ? -1 : 1,
        } as CSSProperties;
        const spriteStyle = {
          '--arena-spectator-row': `${sprite.row * (100 / 3)}%`,
          backgroundImage: `url("${getCharacterSpriteSheet(sprite, 'movement')}")`,
          animationDelay: `${index * -190}ms`,
        } as CSSProperties;

        return (
          <span
            key={id}
            className={`arena-stage-spectator is-${slot.depth}`}
            style={spectatorStyle}
            data-stage-spectator-id={id}
            data-stage-spectator-name={name}
            data-parallax-layer={slot.depth}
            data-facing={slot.facing}
            data-action="idle"
            data-animation-bank="movement"
            aria-hidden="true"
          >
            <span
              className="arena-stage-spectator__sprite"
              style={spriteStyle}
            />
          </span>
        );
      })}
    </div>
  );
}
