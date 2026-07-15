import { HelluvaBossSaveState, HelluvaBossSpoilerScope } from '../../types';
import {
  HELLUVA_BOSS_DATA_VERSION,
  HELLUVA_CONTRACTS,
  HELLUVA_CREW_IDS,
  getHelluvaApproachesForContract,
  HelluvaChoiceEffects,
  HelluvaContractDefinition
} from './data';

export type HelluvaContractStatus = 'locked' | 'available' | 'active' | 'completed';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const cloneState = (state: HelluvaBossSaveState): HelluvaBossSaveState => (
  JSON.parse(JSON.stringify(state)) as HelluvaBossSaveState
);

export function createHelluvaBossSaveState(enabled = false): HelluvaBossSaveState {
  return {
    enabled,
    dataVersion: HELLUVA_BOSS_DATA_VERSION,
    spoilerScope: 'season_1',
    campaignDay: 1,
    status: 'active',
    activeContractId: null,
    activePhaseIndex: 0,
    completedContractIds: [],
    selectedChoiceIds: [],
    funds: 2500,
    heat: 25,
    cohesion: 62,
    discretion: 55,
    reputation: 30,
    crewFatigue: Object.fromEntries(HELLUVA_CREW_IDS.map(id => [id, 0])),
    operationLog: ['Day 1 · Helluva Boss Simulation AU campaign installed. I.M.P. records remain separate from hotel operations.']
  };
}

export function setHelluvaBossEnabled(
  state: HelluvaBossSaveState | undefined,
  enabled: boolean
): HelluvaBossSaveState {
  return { ...(state ? cloneState(state) : createHelluvaBossSaveState(enabled)), enabled };
}

export function setHelluvaBossSpoilerScope(
  state: HelluvaBossSaveState,
  spoilerScope: HelluvaBossSpoilerScope
): HelluvaBossSaveState {
  return { ...cloneState(state), spoilerScope };
}

export function getHelluvaContractStatus(
  state: HelluvaBossSaveState,
  contract: HelluvaContractDefinition
): HelluvaContractStatus {
  if (state.completedContractIds.includes(contract.id)) return 'completed';
  if (state.activeContractId === contract.id) return 'active';
  if (state.activeContractId !== null) return 'locked';
  if (contract.prerequisiteId && !state.completedContractIds.includes(contract.prerequisiteId)) return 'locked';
  return state.status === 'active' ? 'available' : 'locked';
}

export function startHelluvaContract(
  state: HelluvaBossSaveState,
  contractId: string
): HelluvaBossSaveState {
  if (!state.enabled) throw new Error('Enable the Helluva Boss extension before starting a contract.');
  if (state.status !== 'active') throw new Error('This Helluva Boss campaign has already reached an ending.');
  if (state.activeContractId) throw new Error('Finish the active contract before accepting another one.');

  const contract = HELLUVA_CONTRACTS.find(candidate => candidate.id === contractId);
  if (!contract) throw new Error(`Unknown Helluva Boss contract '${contractId}'.`);
  if (getHelluvaContractStatus(state, contract) !== 'available') {
    throw new Error('This contract is still locked or has already been completed.');
  }
  const next = cloneState(state);
  next.funds -= contract.entryCost;
  next.activeContractId = contract.id;
  next.activePhaseIndex = 0;
  next.operationLog = [
    `Day ${next.campaignDay} · Accepted “${contract.title}”; ${contract.entryCost} credits committed to preparation.`,
    ...next.operationLog
  ].slice(0, 60);
  return next;
}

function applyEffects(state: HelluvaBossSaveState, effects: HelluvaChoiceEffects) {
  state.funds += effects.funds || 0;
  state.heat = clampPercent(state.heat + (effects.heat || 0));
  state.cohesion = clampPercent(state.cohesion + (effects.cohesion || 0));
  state.discretion = clampPercent(state.discretion + (effects.discretion || 0));
  state.reputation = clampPercent(state.reputation + (effects.reputation || 0));
  if (effects.fatigue) {
    for (const crewId of HELLUVA_CREW_IDS) {
      state.crewFatigue[crewId] = clampPercent((state.crewFatigue[crewId] || 0) + effects.fatigue);
    }
  }
}

function getAverageCrewFatigue(state: HelluvaBossSaveState): number {
  return HELLUVA_CREW_IDS.reduce(
    (total, crewId) => total + (state.crewFatigue[crewId] || 0),
    0
  ) / HELLUVA_CREW_IDS.length;
}

function describeFinalExtraction(state: HelluvaBossSaveState): string {
  const averageFatigue = Math.round(getAverageCrewFatigue(state));
  const extractionShape = state.discretion >= 75 && state.heat <= 35
    ? 'a quiet, evidence-controlled corridor'
    : state.reputation >= 70
      ? 'a reputation-backed diversion with a narrow exit window'
      : state.cohesion >= 85
        ? 'a crew-linked relay that keeps everyone moving together'
        : 'a costly emergency withdrawal built around the weakest remaining metric';

  return `Cumulative metrics shaped the final extraction into ${extractionShape}: ${state.funds} credits, ${state.heat} heat, ${state.cohesion} cohesion, ${state.discretion} discretion, ${state.reputation} reputation and ${averageFatigue} average fatigue.`;
}

function evaluateHelluvaOutcome(state: HelluvaBossSaveState) {
  const averageFatigue = getAverageCrewFatigue(state);

  if (state.heat >= 100 || state.cohesion <= 0 || state.funds <= -500 || averageFatigue >= 100) {
    state.status = 'collapse';
    state.activeContractId = null;
    state.activePhaseIndex = 0;
    state.operationLog = [
      `Day ${state.campaignDay} · Campaign collapse: I.M.P. suspended operations without changing any character's canon fate.`,
      ...state.operationLog
    ].slice(0, 60);
    return;
  }

  if (state.completedContractIds.length === HELLUVA_CONTRACTS.length) {
    state.status = 'victory';
    state.operationLog = [
      `Day ${state.campaignDay} · Campaign complete: I.M.P. survived all ${HELLUVA_CONTRACTS.length} Simulation AU contracts.`,
      ...state.operationLog
    ].slice(0, 60);
  }
}

export interface HelluvaChoiceResult {
  state: HelluvaBossSaveState;
  summary: string;
  contractCompleted: boolean;
}

export function resolveHelluvaChoice(
  state: HelluvaBossSaveState,
  choiceId: string
): HelluvaChoiceResult {
  if (!state.enabled) throw new Error('The Helluva Boss extension is disabled.');
  if (state.status !== 'active') throw new Error('This Helluva Boss campaign has already reached an ending.');
  if (!state.activeContractId) throw new Error('Accept a contract before selecting an approach.');

  const contract = HELLUVA_CONTRACTS.find(candidate => candidate.id === state.activeContractId);
  if (!contract) throw new Error('The active Helluva Boss contract is not available in this data version.');
  const phaseIndex = state.activePhaseIndex as 0 | 1 | 2;
  const choice = getHelluvaApproachesForContract(contract.id, phaseIndex)
    .find(candidate => candidate.id === choiceId);
  if (!choice) throw new Error('This approach is not available during the current contract phase.');

  const uniqueChoiceId = `${contract.id}:${state.activePhaseIndex}:${choice.id}`;
  if (state.selectedChoiceIds.includes(uniqueChoiceId)) {
    throw new Error('This contract choice was already applied.');
  }

  const next = cloneState(state);
  applyEffects(next, choice.effects);
  next.selectedChoiceIds.push(uniqueChoiceId);
  const phaseName = ['Briefing', 'Field operation', 'Debrief'][next.activePhaseIndex];
  let summary = `${phaseName} · ${choice.label}`;
  let contractCompleted = false;

  if (next.activePhaseIndex < 2) {
    next.activePhaseIndex += 1;
  } else {
    contractCompleted = true;
    next.completedContractIds.push(contract.id);
    next.funds += contract.reward;
    next.heat = clampPercent(next.heat + contract.completionHeat);
    next.campaignDay += 1;
    next.activeContractId = null;
    next.activePhaseIndex = 0;
    for (const crewId of HELLUVA_CREW_IDS) {
      next.crewFatigue[crewId] = clampPercent((next.crewFatigue[crewId] || 0) - 2);
    }
    summary = `${summary}; “${contract.title}” completed for ${contract.reward} credits.`;
    if (contract.id === HELLUVA_CONTRACTS[HELLUVA_CONTRACTS.length - 1]?.id) {
      summary = `${summary} ${describeFinalExtraction(next)}`;
    }
  }

  next.operationLog = [`Day ${next.campaignDay} · ${summary}`, ...next.operationLog].slice(0, 60);
  evaluateHelluvaOutcome(next);
  return { state: next, summary, contractCompleted };
}

export function getHelluvaOutcome(state: HelluvaBossSaveState): {
  title: string;
  summary: string;
} {
  if (state.status === 'victory') {
    const extraction = describeFinalExtraction(state);
    if (state.cohesion >= 85 && state.reputation < 70) {
      return {
        title: 'Victory · Dysfunctional, Still a Family',
        summary: `The team completed the campaign with exceptional cohesion while every canon character kept their established identity. ${extraction}`
      };
    }
    if (state.discretion >= 75 && state.heat <= 35) {
      return {
        title: 'Victory · Infernal Professionals',
        summary: `I.M.P. finished the contract chain solvent, reliable and unusually difficult for the living world to trace. ${extraction}`
      };
    }
    if (state.reputation >= 70) {
      return {
        title: 'Victory · Chaotic Legends',
        summary: `I.M.P. converted a formidable reputation into nerve, leverage and one barely contained final exit. ${extraction}`
      };
    }
    return {
      title: 'Victory · Scrappy Survivors',
      summary: `I.M.P. completed the chain without enough reputation to become legends, surviving through an improvised extraction and hard-earned restraint. ${extraction}`
    };
  }
  if (state.status === 'collapse') {
    if (state.heat >= 100) return { title: 'Defeat · Exposed to the Living World', summary: 'Mortal exposure forced I.M.P. to suspend portal operations.' };
    if (state.cohesion <= 0) return { title: 'Defeat · Crew Split', summary: 'The team dispersed until trust and safe working conditions can be rebuilt.' };
    if (state.funds <= -500) return { title: 'Defeat · Insolvent Office', summary: 'I.M.P. closed the campaign after its operational debt became unsustainable.' };
    return { title: 'Defeat · Mandatory Recovery', summary: 'Accumulated fatigue forced a non-lethal shutdown and extended recovery period.' };
  }
  return {
    title: `Active I.M.P. Campaign · Day ${state.campaignDay}`,
    summary: `${state.completedContractIds.length}/${HELLUVA_CONTRACTS.length} story contracts complete. Every mission is an original Simulation AU operation.`
  };
}

export function describeHelluvaEffects(effects: HelluvaChoiceEffects): string[] {
  const labels: Array<[keyof HelluvaChoiceEffects, string]> = [
    ['funds', 'credits'],
    ['heat', 'heat'],
    ['cohesion', 'cohesion'],
    ['discretion', 'discretion'],
    ['reputation', 'reputation'],
    ['fatigue', 'crew fatigue']
  ];
  return labels.flatMap(([key, label]) => {
    const value = effects[key];
    if (!value) return [];
    return [`${value > 0 ? '+' : ''}${value} ${label}`];
  });
}
