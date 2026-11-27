import type { CSSProperties } from 'react';
import type { PentagramStage } from '../lib/pentagram-stages';

export function InfernalStageLayers({ stage, offset }: { stage: PentagramStage; offset: number }) {
  if (!stage.scenery) return null;
  const shift = (ratio: number): CSSProperties => ({ transform: `translateX(${offset * ratio}px)` });
  return <>
    <div className="infernal-room-plane" aria-hidden="true" style={{ ...shift(0.20), backgroundPosition: stage.imagePosition, backgroundImage: `url("${stage.imagePath}")` }} />
    {stage.scenery.middle && <img className="infernal-desk-plane" src={stage.scenery.middle} alt="" aria-hidden="true" style={shift(stage.sceneryParallax?.middle ?? 0.65)} draggable={false} />}
    {stage.scenery.near && <img className="infernal-near-plane" src={stage.scenery.near} alt="" aria-hidden="true" style={shift(stage.sceneryParallax?.near ?? 1.2)} draggable={false} />}
  </>;
}
