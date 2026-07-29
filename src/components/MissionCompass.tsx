import React from 'react';
import { ChevronDown, Compass, Play } from 'lucide-react';
import type { DatabaseState } from '../types';
import {
  deriveMissionCompass,
  type MissionCompassDestination,
} from '../lib/mission-compass';
import '../styles/mission-compass.css';

interface MissionCompassProps {
  state: DatabaseState;
  onNavigate: (view: MissionCompassDestination, targetId?: string) => void;
  initiallyOpen?: boolean;
}

/**
 * A compact objective anchor for record-heavy screens. The summary remains
 * useful while collapsed; opening it reveals only the next playable action.
 */
export const MissionCompass: React.FC<MissionCompassProps> = ({
  state,
  onNavigate,
  initiallyOpen = false,
}) => {
  const mission = deriveMissionCompass(state);

  return (
    <details
      className={`mission-compass mission-compass--${mission.status}`}
      open={initiallyOpen}
    >
      <summary className="mission-compass__summary">
        <span className="mission-compass__icon" aria-hidden="true">
          <Compass size={18} />
        </span>
        <span className="mission-compass__summary-copy">
          <small>{mission.eyebrow}</small>
          <strong>{mission.title}</strong>
        </span>
        <span className="mission-compass__percent" aria-hidden="true">
          {mission.progressValue}%
        </span>
        <ChevronDown className="mission-compass__chevron" size={18} aria-hidden="true" />
      </summary>

      <div className="mission-compass__body">
        <div className="mission-compass__progress">
          <div className="mission-compass__progress-label">
            <span>Campaign proof</span>
            <span>{mission.progressLabel}</span>
          </div>
          <progress
            value={mission.progressValue}
            max={mission.progressMax}
            aria-label={`Campaign progression: ${mission.progressValue} percent`}
          />
        </div>

        <p>{mission.nextAction}</p>

        <div className="mission-compass__footer">
          <span>Simulation AU · Player choices never rewrite series canon.</span>
          <button
            type="button"
            className="mission-compass__action"
            onClick={() => onNavigate(mission.destination, mission.targetId)}
          >
            <Play size={15} aria-hidden="true" />
            {mission.actionLabel}
          </button>
        </div>
      </div>
    </details>
  );
};
