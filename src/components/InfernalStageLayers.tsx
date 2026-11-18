import type { CSSProperties } from 'react';
import type { PentagramStage } from '../lib/pentagram-stages';

export function InfernalStageLayers({ stage, offset }: { stage: PentagramStage; offset: number }) {
  if (!stage.scenery) return null;
  const shift = (ratio: number): CSSProperties => ({ transform: `translateX(${offset * ratio}px)` });
  return <>
    <div className="infernal-room-plane" aria-hidden="true" style={{ ...shift(0.20), backgroundImage: `url("${stage.imagePath}")` }} />
    <img className="infernal-desk-plane" src={stage.scenery.middle} alt="" aria-hidden="true" style={shift(0.65)} draggable={false} />
    <img className="infernal-near-plane" src={stage.scenery.near} alt="" aria-hidden="true" style={shift(1.2)} draggable={false} />
  </>;
}
