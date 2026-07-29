import type {
  Character,
  DatabaseState,
  Incident,
  StaffTask,
} from '../types';

export type HotelShiftMissionKind =
  | 'incident'
  | 'task'
  | 'room'
  | 'patrol'
  | 'practice';

export type HotelShiftPhase =
  | 'playing'
  | 'intervention'
  | 'success'
  | 'failure';

export type HotelShiftFacing = 'left' | 'right';

export interface HotelShiftMission {
  id: string;
  kind: HotelShiftMissionKind;
  sourceId: string | null;
  title: string;
  briefing: string;
  objective: string;
  interventionLabel: string;
  rewardSummary: string;
  playerId: string;
  partnerId: string;
  targetLabel: string;
  targetX: number;
  durationMs: number;
  interventionRequiredMs: number;
  hazardCount: number;
}

export interface HotelShiftInput {
  left: boolean;
  right: boolean;
  dash: boolean;
  jumpPressed: boolean;
  interactPressed: boolean;
}

export interface HotelShiftPickup {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface HotelShiftHazard {
  id: string;
  x: number;
  direction: -1 | 1;
  speed: number;
}

export interface HotelShiftGameState {
  missionId: string;
  phase: HotelShiftPhase;
  elapsedMs: number;
  timeLeftMs: number;
  playerX: number;
  playerY: number;
  velocityX: number;
  velocityY: number;
  facing: HotelShiftFacing;
  stamina: number;
  resolve: number;
  score: number;
  pickups: readonly HotelShiftPickup[];
  hazards: readonly HotelShiftHazard[];
  interventionElapsedMs: number;
  interventionBalance: number;
  interventionTarget: number;
  interventionProgressMs: number;
  invulnerableMs: number;
  message: string;
  messageMs: number;
}

const EMPTY_INPUT: HotelShiftInput = {
  left: false,
  right: false,
  dash: false,
  jumpPressed: false,
  interactPressed: false,
};

const INCIDENT_PRIORITY: Readonly<Record<Incident['severity'], number>> = {
  low: 0,
  medium: 1,
  high: 2,
  crisis: 3,
};

const FIXED_STEP_MS = 16;
const PLAYER_MIN_X = 6;
const PLAYER_MAX_X = 94;
const GROUND_Y = 0;
const GRAVITY = 1_120;
const JUMP_VELOCITY = 520;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function approach(value: number, target: number, maximumDelta: number): number {
  if (value < target) return Math.min(target, value + maximumDelta);
  if (value > target) return Math.max(target, value - maximumDelta);
  return value;
}

export function hashHotelShiftSeed(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function projectedCharacter(
  state: DatabaseState,
  characterId: string,
): Character | undefined {
  const character = state.characters.find(candidate => candidate.id === characterId);
  if (!character || state.timeline.current === 'custom') return character;
  const projection = character.timelineStates?.[state.timeline.current];
  return projection ? { ...character, ...projection } : character;
}

function isOperationalCharacter(
  state: DatabaseState,
  characterId: string,
): boolean {
  const character = projectedCharacter(state, characterId);
  return Boolean(
    character
    && !['banned', 'deceased', 'external', 'redeemed', 'unknown'].includes(character.status),
  );
}

function missionPartner(
  state: DatabaseState,
  playerId: string,
  candidates: readonly (string | null | undefined)[],
): string {
  const candidate = candidates.find(characterId => (
    Boolean(characterId)
    && characterId !== playerId
    && isOperationalCharacter(state, characterId!)
  ));
  if (candidate) return candidate;
  if (playerId !== 'charlie' && isOperationalCharacter(state, 'charlie')) return 'charlie';
  return 'vaggie';
}

function taskTargetCharacterId(
  state: DatabaseState,
  task: StaffTask,
): string | null {
  if (!task.targetId) return null;
  if (state.characters.some(character => character.id === task.targetId)) return task.targetId;
  const plan = state.rehabilitationPlans.find(candidate => candidate.id === task.targetId);
  if (plan) return plan.characterId;
  const room = state.rooms.find(candidate => candidate.number === task.targetId);
  return room?.occupantIds?.[0] ?? room?.occupantId ?? null;
}

function taskObjective(task: StaffTask): {
  objective: string;
  interventionLabel: string;
  rewardSummary: string;
} {
  switch (task.type) {
    case 'room_inspection':
      return {
        objective: 'Recover the three inspection markers, then secure the room checkpoint.',
        interventionLabel: 'Keep the cleaning pass inside the safe rhythm.',
        rewardSummary: 'The assigned room is inspected and cleaned; one cleaning supply is consumed.',
      };
    case 'repair_work':
      return {
        objective: 'Recover the three toolkit markers, then reach the damaged-room checkpoint.',
        interventionLabel: 'Balance the repair load while the structure shifts.',
        rewardSummary: 'The repair is completed and its ledger cost is charged exactly once.',
      };
    case 'new_sinner_intake':
      return {
        objective: 'Recover the three intake records, then escort the applicant through reception.',
        interventionLabel: 'Keep the welcome process calm and resident-paced.',
        rewardSummary: 'The applicant is admitted only if a safe bed remains available.',
      };
    case 'conflict_resolution':
      return {
        objective: 'Recover the three context clues, then reach the mediation zone.',
        interventionLabel: 'Hold the conversation inside the de-escalation window.',
        rewardSummary: 'Internal trust improves and one bar supply is consumed.',
      };
    case 'media_response':
      return {
        objective: 'Recover the three broadcast traces, then reach the hotel transmitter.',
        interventionLabel: 'Keep the response on-message despite hostile signal drift.',
        rewardSummary: 'Media chaos and Vees influence are reduced.',
      };
    case 'heaven_watch':
      return {
        objective: 'Recover the three observation logs, then reach the security post.',
        interventionLabel: 'Track the observation pattern without escalating it.',
        rewardSummary: 'Heaven attention is reduced without inventing a canon confrontation.',
      };
    case 'vees_watch':
      return {
        objective: 'Recover the three signal fragments, then reach the relay checkpoint.',
        interventionLabel: 'Keep the counter-signal aligned until the relay drops.',
        rewardSummary: 'Vees operational influence is reduced.',
      };
    case 'rehab_prep':
      return {
        objective: 'Recover the three workshop notes, then meet the resident at reception.',
        interventionLabel: 'Keep the preparation resident-paced and voluntary.',
        rewardSummary: 'Cooperation improves slightly; this never grants redemption.',
      };
    case 'staff_briefing':
      return {
        objective: 'Recover the three status reports, then regroup at reception.',
        interventionLabel: 'Keep the team briefing focused while pressure shifts.',
        rewardSummary: 'Internal trust improves.',
      };
    default:
      return {
        objective: 'Recover the three operation markers, then reach the highlighted checkpoint.',
        interventionLabel: 'Keep the operation inside the stable window.',
        rewardSummary: 'The documented hotel duty is completed.',
      };
  }
}

function buildTaskMission(
  state: DatabaseState,
  task: StaffTask,
): HotelShiftMission {
  const projectedAssignee = projectedCharacter(state, task.assignedTo);
  const playerId = projectedAssignee?.status === 'staff' ? task.assignedTo : 'vaggie';
  const targetCharacterId = taskTargetCharacterId(state, task);
  const targetLabel = state.characters.find(character => character.id === targetCharacterId)?.name
    ?? (task.targetId ? `Checkpoint ${task.targetId}` : 'Hotel operations checkpoint');
  const semantics = taskObjective(task);
  const seed = hashHotelShiftSeed(task.id);
  return {
    id: `task:${task.id}`,
    kind: 'task',
    sourceId: task.id,
    title: task.title,
    briefing: `${projectedAssignee?.name ?? 'Hotel staff'} must complete this Simulation AU duty through active field work.`,
    objective: semantics.objective,
    interventionLabel: semantics.interventionLabel,
    rewardSummary: semantics.rewardSummary,
    playerId,
    partnerId: missionPartner(state, playerId, [targetCharacterId]),
    targetLabel,
    targetX: 82 + (seed % 7),
    durationMs: 82_000,
    interventionRequiredMs: 3_200,
    hazardCount: task.type === 'heaven_watch' || task.type === 'vees_watch' ? 3 : 2,
  };
}

function buildIncidentMission(
  state: DatabaseState,
  incident: Incident,
): HotelShiftMission {
  const playerId = 'vaggie';
  const seed = hashHotelShiftSeed(incident.id);
  return {
    id: `incident:${incident.id}`,
    kind: 'incident',
    sourceId: incident.id,
    title: `Contain ${incident.type.replaceAll('_', ' ')}`,
    briefing: `${incident.summary} This is an operational Simulation AU incident, not a new canon event.`,
    objective: 'Recover the three situation markers, avoid pressure waves, then reach the containment zone.',
    interventionLabel: 'Keep the response inside the non-lethal containment window.',
    rewardSummary: 'The incident is resolved through the existing recovery rules exactly once.',
    playerId,
    partnerId: missionPartner(state, playerId, incident.residentsInvolved),
    targetLabel: incident.location,
    targetX: 83 + (seed % 6),
    durationMs: incident.severity === 'crisis' ? 68_000 : 76_000,
    interventionRequiredMs: incident.severity === 'crisis' ? 4_400 : 3_800,
    hazardCount: incident.severity === 'crisis' ? 4 : incident.severity === 'high' ? 3 : 2,
  };
}

function buildRoomMission(
  state: DatabaseState,
  roomNumber: string,
): HotelShiftMission {
  const room = state.rooms.find(candidate => candidate.number === roomNumber)!;
  const isRepair = room.status === 'damaged';
  const playerId = isRepair ? 'vaggie' : 'niffty';
  const seed = hashHotelShiftSeed(room.number);
  return {
    id: `room:${room.number}:${room.status}`,
    kind: 'room',
    sourceId: room.number,
    title: isRepair ? `Stabilize Room ${room.number}` : `Inspect Room ${room.number}`,
    briefing: isRepair
      ? 'Coordinate a safe structural repair without exposing residents to the damaged area.'
      : 'Niffty can clear this operational mess during the active hotel shift.',
    objective: `Recover three ${isRepair ? 'toolkit' : 'inspection'} markers, then reach Room ${room.number}.`,
    interventionLabel: isRepair
      ? 'Balance the repair load until the structure stabilizes.'
      : 'Keep the cleaning sweep inside the safe rhythm.',
    rewardSummary: isRepair
      ? 'The room is repaired and its current ledger cost is charged.'
      : 'The room is cleaned and one cleaning supply is consumed.',
    playerId,
    partnerId: missionPartner(state, playerId, [
      room.occupantIds?.[0],
      room.occupantId,
      isRepair ? 'niffty' : 'charlie',
    ]),
    targetLabel: `Room ${room.number}`,
    targetX: 83 + (seed % 6),
    durationMs: 78_000,
    interventionRequiredMs: isRepair ? 3_900 : 2_900,
    hazardCount: isRepair ? 3 : 2,
  };
}

/**
 * Builds one deterministic active objective from the durable hotel save.
 * Crisis incidents outrank duties; completed sources disappear naturally on
 * the next state refresh. Canon profiles are projected to the selected
 * reference timeline before they can appear as an avatar or partner.
 */
export function selectHotelShiftMission(state: DatabaseState): HotelShiftMission {
  const meta = state.gameplayMeta;
  const day = meta?.campaignDay ?? 1;
  const unresolvedIncidents = state.incidents
    .filter(incident => (
      (incident.status === 'open' || incident.status === 'contained')
      && !meta?.resolvedIncidentIds.includes(incident.id)
    ))
    .sort((left, right) => (
      INCIDENT_PRIORITY[right.severity] - INCIDENT_PRIORITY[left.severity]
      || left.id.localeCompare(right.id)
    ));
  const urgentIncident = unresolvedIncidents.find(incident => (
    incident.severity === 'crisis' || incident.severity === 'high'
  ));
  if (urgentIncident) return buildIncidentMission(state, urgentIncident);

  const eligibleTasks = state.staffTasks
    .filter(task => (
      task.status === 'in_progress'
      && (task.availableOnDay ?? day) <= day
      && !meta?.appliedTaskIds.includes(task.id)
    ))
    .sort((left, right) => (
      (left.availableOnDay ?? day) - (right.availableOnDay ?? day)
      || left.id.localeCompare(right.id)
    ));
  if (eligibleTasks[0]) return buildTaskMission(state, eligibleTasks[0]);
  if (unresolvedIncidents[0]) return buildIncidentMission(state, unresolvedIncidents[0]);

  const operationalRoom = state.rooms
    .filter(room => room.status === 'damaged' || room.status === 'messy')
    .sort((left, right) => (
      Number(right.status === 'damaged') - Number(left.status === 'damaged')
      || left.number.localeCompare(right.number)
    ))[0];
  if (operationalRoom) return buildRoomMission(state, operationalRoom.number);

  const patrolMarker = `hotel-shift:patrol:${day}`;
  const patrolComplete = meta?.completedMilestones.includes(patrolMarker);
  const playerId = 'charlie';
  const preferredResident = ['angeldust', 'sirpentious']
    .find(characterId => isOperationalCharacter(state, characterId));
  if (patrolComplete) {
    return {
      id: `practice:${day}`,
      kind: 'practice',
      sourceId: null,
      title: 'Free Hotel Rehearsal',
      briefing: 'Today’s required operations are complete. Keep moving through a repeatable, consequence-free training reconstruction.',
      objective: 'Recover three rehearsal markers and complete one stabilization pass.',
      interventionLabel: 'Keep the rehearsal inside the highlighted window.',
      rewardSummary: 'Practice improves the run score but never changes canon or campaign state.',
      playerId,
      partnerId: missionPartner(state, playerId, [preferredResident]),
      targetLabel: 'Reception rehearsal zone',
      targetX: 86,
      durationMs: 90_000,
      interventionRequiredMs: 3_000,
      hazardCount: 2,
    };
  }

  return {
    id: `patrol:${day}`,
    kind: 'patrol',
    sourceId: null,
    title: 'Resident Support Patrol',
    briefing: 'Charlie checks the shared hotel space and offers a voluntary next step. This is operational Simulation AU play.',
    objective: 'Recover three resident requests, then meet the highlighted resident at reception.',
    interventionLabel: 'Keep the check-in calm and resident-paced.',
    rewardSummary: 'Internal trust and redemption credibility improve slightly; no soul is declared redeemed.',
    playerId,
    partnerId: missionPartner(state, playerId, [preferredResident]),
    targetLabel: 'Resident check-in',
    targetX: 86,
    durationMs: 86_000,
    interventionRequiredMs: 3_600,
    hazardCount: 2,
  };
}

function seededWorldPositions(mission: HotelShiftMission): {
  pickups: readonly HotelShiftPickup[];
  hazards: readonly HotelShiftHazard[];
} {
  const seed = hashHotelShiftSeed(mission.id);
  const pickupOffset = (seed % 9) - 4;
  const pickups: readonly HotelShiftPickup[] = [
    { id: `${mission.id}:marker:1`, x: 20 + pickupOffset * 0.35, y: 0, collected: false },
    { id: `${mission.id}:marker:2`, x: 43 - pickupOffset * 0.25, y: 82, collected: false },
    { id: `${mission.id}:marker:3`, x: 65 + pickupOffset * 0.2, y: 0, collected: false },
  ];
  const hazardAnchors = [31, 51, 69, 77];
  const hazards = hazardAnchors.slice(0, mission.hazardCount).map((anchor, index) => ({
    id: `${mission.id}:pressure:${index + 1}`,
    x: anchor + ((seed >>> (index * 3)) % 7) - 3,
    direction: (index % 2 === 0 ? 1 : -1) as -1 | 1,
    speed: 5.5 + ((seed >>> (index * 4)) % 4),
  }));
  return { pickups, hazards };
}

export function createHotelShiftGameState(
  mission: HotelShiftMission,
): HotelShiftGameState {
  const world = seededWorldPositions(mission);
  return {
    missionId: mission.id,
    phase: 'playing',
    elapsedMs: 0,
    timeLeftMs: mission.durationMs,
    playerX: 9,
    playerY: GROUND_Y,
    velocityX: 0,
    velocityY: 0,
    facing: 'right',
    stamina: 100,
    resolve: 100,
    score: 0,
    pickups: world.pickups,
    hazards: world.hazards,
    interventionElapsedMs: 0,
    interventionBalance: 0,
    interventionTarget: 0,
    interventionProgressMs: 0,
    invulnerableMs: 0,
    message: mission.briefing,
    messageMs: 4_800,
  };
}

function withMessage(
  state: HotelShiftGameState,
  message: string,
  messageMs = 1_700,
): HotelShiftGameState {
  return { ...state, message, messageMs };
}

function stepPlayingWorld(
  state: HotelShiftGameState,
  mission: HotelShiftMission,
  input: HotelShiftInput,
  deltaMs: number,
): HotelShiftGameState {
  const deltaSeconds = deltaMs / 1_000;
  const horizontal = Number(input.right) - Number(input.left);
  const canDash = input.dash && horizontal !== 0 && state.stamina > 0;
  const targetSpeed = horizontal * (canDash ? 34 : 20);
  const acceleration = horizontal === 0 ? 92 : 74;
  let velocityX = approach(
    state.velocityX,
    targetSpeed,
    acceleration * deltaSeconds,
  );
  let velocityY = state.velocityY;
  let playerY = state.playerY;
  if (input.jumpPressed && playerY <= GROUND_Y + 0.01) {
    velocityY = JUMP_VELOCITY;
  }
  playerY += velocityY * deltaSeconds;
  velocityY -= GRAVITY * deltaSeconds;
  if (playerY <= GROUND_Y) {
    playerY = GROUND_Y;
    velocityY = 0;
  }

  let playerX = clamp(
    state.playerX + velocityX * deltaSeconds,
    PLAYER_MIN_X,
    PLAYER_MAX_X,
  );
  if (playerX === PLAYER_MIN_X || playerX === PLAYER_MAX_X) velocityX = 0;
  const facing = horizontal < 0 ? 'left' : horizontal > 0 ? 'right' : state.facing;
  const stamina = clamp(
    state.stamina + (canDash ? -42 : 23) * deltaSeconds,
    0,
    100,
  );

  let score = state.score;
  let pickups = state.pickups;
  let next = {
    ...state,
    playerX,
    playerY,
    velocityX,
    velocityY,
    facing,
    stamina,
  };

  pickups = pickups.map((pickup) => {
    if (
      pickup.collected
      || Math.abs(pickup.x - playerX) > 3.6
      || Math.abs(pickup.y - playerY) > 58
    ) return pickup;
    score += 250;
    next = withMessage(next, 'Operation marker secured.');
    return { ...pickup, collected: true };
  });

  const hazards = state.hazards.map((hazard) => {
    let x = hazard.x + hazard.direction * hazard.speed * deltaSeconds;
    let direction = hazard.direction;
    if (x <= 13 || x >= 79) {
      x = clamp(x, 13, 79);
      direction = (direction * -1) as -1 | 1;
    }
    return { ...hazard, x, direction };
  });

  let resolve = state.resolve;
  let invulnerableMs = Math.max(0, state.invulnerableMs - deltaMs);
  if (invulnerableMs <= 0 && playerY < 48) {
    const collidingHazard = hazards.find(hazard => (
      Math.abs(hazard.x - playerX) < 2.5
    ));
    if (collidingHazard) {
      resolve = Math.max(0, resolve - (mission.kind === 'incident' ? 24 : 18));
      invulnerableMs = 900;
      playerX = clamp(
        playerX + (playerX <= collidingHazard.x ? -4.5 : 4.5),
        PLAYER_MIN_X,
        PLAYER_MAX_X,
      );
      velocityX = 0;
      next = withMessage(next, 'Pressure wave interrupted the shift. Reposition and continue.');
    }
  }

  const collectedCount = pickups.filter(pickup => pickup.collected).length;
  const atTarget = Math.abs(playerX - mission.targetX) <= 5;
  let phase = state.phase;
  if (input.interactPressed) {
    if (collectedCount < pickups.length) {
      next = withMessage(
        next,
        `Secure every operation marker first (${collectedCount}/${pickups.length}).`,
      );
    } else if (!atTarget) {
      next = withMessage(next, `Move closer to ${mission.targetLabel}.`);
    } else {
      phase = 'intervention';
      velocityX = 0;
      next = withMessage(next, mission.interventionLabel, 3_000);
    }
  }

  return {
    ...next,
    phase,
    playerX,
    velocityX,
    resolve,
    score,
    stamina,
    pickups,
    hazards,
    invulnerableMs,
  };
}

function stepIntervention(
  state: HotelShiftGameState,
  mission: HotelShiftMission,
  input: HotelShiftInput,
  deltaMs: number,
): HotelShiftGameState {
  const deltaSeconds = deltaMs / 1_000;
  const horizontal = Number(input.right) - Number(input.left);
  const interventionElapsedMs = state.interventionElapsedMs + deltaMs;
  const seedPhase = (hashHotelShiftSeed(mission.id) % 628) / 100;
  const interventionTarget = Math.sin(
    interventionElapsedMs / 760 + seedPhase,
  ) * 0.58;
  const pressureDrift = Math.sin(
    interventionElapsedMs / 390 + seedPhase * 0.5,
  ) * 0.22;
  const interventionBalance = clamp(
    state.interventionBalance
      + horizontal * deltaSeconds * 1.32
      + pressureDrift * deltaSeconds,
    -1,
    1,
  );
  const distance = Math.abs(interventionBalance - interventionTarget);
  const insideWindow = distance <= 0.22;
  const interventionProgressMs = clamp(
    state.interventionProgressMs + deltaMs * (insideWindow ? 1 : -0.62),
    0,
    mission.interventionRequiredMs,
  );
  const resolve = clamp(
    state.resolve - (distance > 0.72 ? deltaSeconds * 4.2 : 0),
    0,
    100,
  );
  const score = state.score + (insideWindow ? Math.round(deltaMs * 0.08) : 0);
  const phase = interventionProgressMs >= mission.interventionRequiredMs
    ? 'success'
    : state.phase;

  return {
    ...state,
    phase,
    interventionElapsedMs,
    interventionTarget,
    interventionBalance,
    interventionProgressMs,
    resolve,
    score,
    message: phase === 'success'
      ? `Shift objective complete. ${mission.rewardSummary}`
      : state.message,
    messageMs: phase === 'success' ? 4_000 : state.messageMs,
  };
}

function stepHotelShiftSlice(
  state: HotelShiftGameState,
  mission: HotelShiftMission,
  input: HotelShiftInput,
  deltaMs: number,
): HotelShiftGameState {
  if (state.phase === 'success' || state.phase === 'failure') return state;
  let next = {
    ...state,
    elapsedMs: state.elapsedMs + deltaMs,
    timeLeftMs: Math.max(0, state.timeLeftMs - deltaMs),
    messageMs: Math.max(0, state.messageMs - deltaMs),
  };
  next = state.phase === 'intervention'
    ? stepIntervention(next, mission, input, deltaMs)
    : stepPlayingWorld(next, mission, input, deltaMs);

  if (next.resolve <= 0 || next.timeLeftMs <= 0) {
    return {
      ...next,
      phase: 'failure',
      velocityX: 0,
      message: next.resolve <= 0
        ? 'Composure depleted. The team retreats safely and the operation remains unresolved.'
        : 'Shift window expired. The operation remains unresolved for the next attempt.',
      messageMs: 4_000,
    };
  }
  return next;
}

/**
 * Fixed substeps make movement, collision and challenge progress stable when
 * the browser alternates between 16 ms and slower frames. Edge-triggered
 * actions are consumed only by the first substep.
 */
export function stepHotelShift(
  state: HotelShiftGameState,
  mission: HotelShiftMission,
  input: HotelShiftInput,
  deltaMs: number,
): HotelShiftGameState {
  if (state.missionId !== mission.id) return createHotelShiftGameState(mission);
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return state;
  let remainingMs = Math.min(deltaMs, 160);
  let next = state;
  let firstSlice = true;
  while (remainingMs > 0 && next.phase !== 'success' && next.phase !== 'failure') {
    const sliceMs = Math.min(FIXED_STEP_MS, remainingMs);
    next = stepHotelShiftSlice(
      next,
      mission,
      firstSlice
        ? input
        : {
            ...input,
            jumpPressed: false,
            interactPressed: false,
          },
      sliceMs,
    );
    remainingMs -= sliceMs;
    firstSlice = false;
  }
  return next;
}

export function getHotelShiftCollectedCount(
  state: HotelShiftGameState,
): number {
  return state.pickups.filter(pickup => pickup.collected).length;
}

export function getHotelShiftInput(
  pressedCodes: ReadonlySet<string>,
  pulses: Pick<HotelShiftInput, 'jumpPressed' | 'interactPressed'> = EMPTY_INPUT,
): HotelShiftInput {
  return {
    left: pressedCodes.has('ArrowLeft')
      || pressedCodes.has('KeyA')
      || pressedCodes.has('KeyQ'),
    right: pressedCodes.has('ArrowRight') || pressedCodes.has('KeyD'),
    dash: pressedCodes.has('ShiftLeft') || pressedCodes.has('ShiftRight'),
    jumpPressed: pulses.jumpPressed,
    interactPressed: pulses.interactPressed,
  };
}
