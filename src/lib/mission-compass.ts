import type { DatabaseState } from '../types';
import { selectHotelShiftMission, type HotelShiftMissionKind } from './hotel-shift';
import { RulesEngine } from './rules-engine';

export type MissionCompassDestination = 'shift' | 'dashboard';
export type MissionCompassStatus = 'active' | 'decision' | 'complete';

export interface MissionCompassModel {
  id: string;
  status: MissionCompassStatus;
  eyebrow: string;
  title: string;
  nextAction: string;
  progressValue: number;
  progressMax: number;
  progressLabel: string;
  actionLabel: string;
  destination: MissionCompassDestination;
  targetId?: string;
}

const VICTORY_DAY = 15;
const VICTORY_DOSSIERS = 3;
const VICTORY_CREDIBILITY = 85;
const VICTORY_TRUST = 60;
const VICTORY_REPUTATION = 55;

function clampRatio(value: number, target: number): number {
  if (target <= 0) return 1;
  return Math.min(1, Math.max(0, value / target));
}

function campaignProgress(state: DatabaseState): {
  value: number;
  label: string;
} {
  const day = state.gameplayMeta?.campaignDay ?? 1;
  const dossiers = state.rehabilitationPlans
    .filter(plan => plan.isRedeemedConfirmed)
    .length;
  const ratios = [
    clampRatio(day, VICTORY_DAY),
    clampRatio(dossiers, VICTORY_DOSSIERS),
    clampRatio(state.reputation.redemptionCredibility, VICTORY_CREDIBILITY),
    clampRatio(state.reputation.internalTrust, VICTORY_TRUST),
    clampRatio(state.reputation.sinnerReputation, VICTORY_REPUTATION),
  ];
  const value = Math.round(
    ratios.reduce((total, ratio) => total + ratio, 0) / ratios.length * 100,
  );

  return {
    value,
    label: `Day ${Math.min(day, VICTORY_DAY)}/${VICTORY_DAY} · Evidence dossiers ${Math.min(dossiers, VICTORY_DOSSIERS)}/${VICTORY_DOSSIERS}`,
  };
}

function missionVerb(kind: HotelShiftMissionKind): string {
  switch (kind) {
    case 'incident':
      return 'Contain';
    case 'task':
      return 'Complete';
    case 'room':
      return 'Secure';
    case 'patrol':
      return 'Begin';
    case 'practice':
      return 'Rehearse';
  }
}

/**
 * Derives one compact, deterministic objective from the durable save. This is
 * guidance only: it never mutates campaign state and never presents Simulation
 * AU progress as a canon event or celestial ruling.
 */
export function deriveMissionCompass(state: DatabaseState): MissionCompassModel {
  const outcome = RulesEngine.evaluateCampaignOutcome(state);
  if (outcome.phase === 'ended') {
    return {
      id: `campaign-ended:${outcome.endingId ?? 'unknown'}`,
      status: 'complete',
      eyebrow: 'Simulation AU campaign archived',
      title: outcome.title,
      nextAction: 'Review the recorded outcome or start a new local campaign from Settings.',
      progressValue: 100,
      progressMax: 100,
      progressLabel: 'Campaign record complete',
      actionLabel: 'Review outcome',
      destination: 'dashboard',
    };
  }

  if (outcome.phase === 'victory' || outcome.phase === 'defeat') {
    return {
      id: `campaign-decision:${outcome.endingId ?? outcome.phase}`,
      status: 'decision',
      eyebrow: 'Simulation AU decision ready',
      title: outcome.title,
      nextAction: 'Open the campaign desk to review the requirements and finalize this simulated outcome.',
      progressValue: 100,
      progressMax: 100,
      progressLabel: 'Outcome threshold reached',
      actionLabel: 'Open campaign desk',
      destination: 'dashboard',
    };
  }

  const mission = selectHotelShiftMission(state);
  const progress = campaignProgress(state);
  return {
    id: mission.id,
    status: 'active',
    eyebrow: `Current objective · Campaign Day ${state.gameplayMeta?.campaignDay ?? 1}`,
    title: `${missionVerb(mission.kind)}: ${mission.title}`,
    nextAction: `Enter Hotel Shift. ${mission.objective}`,
    progressValue: progress.value,
    progressMax: 100,
    progressLabel: progress.label,
    actionLabel: 'Play current objective',
    destination: 'shift',
  };
}
