import type { InventoryBackup } from './export-import';
import { applyCampaignDayAdvance } from './campaign-day';
import { applyTaskCompletionEffect } from './hotel-operations';
import type { HotelShiftMission } from './hotel-shift';
import { RulesEngine } from './rules-engine';
import type { DatabaseState } from '../types';

export interface HotelShiftResolution {
  ok: boolean;
  message: string;
}

export function hotelShiftCompletionMarker(
  mission: HotelShiftMission,
): string {
  return `hotel-shift:complete:${mission.id}`;
}

export function hotelShiftFailureMarker(
  mission: HotelShiftMission,
  campaignDay: number,
): string {
  return `hotel-shift:failure:${campaignDay}:${mission.id}`;
}

/**
 * Applies only a completed active objective. The caller wraps this mutation in
 * LocalDb.transaction, so inventory, campaign state and the audit entry either
 * all commit or all roll back.
 */
export function applyHotelShiftMissionCompletion(
  mission: HotelShiftMission,
  draft: DatabaseState,
  inventory: InventoryBackup,
): HotelShiftResolution {
  const meta = draft.gameplayMeta!;
  const marker = hotelShiftCompletionMarker(mission);
  if (mission.kind !== 'practice' && meta.completedMilestones.includes(marker)) {
    return { ok: false, message: 'This active hotel objective was already rewarded.' };
  }

  let result: HotelShiftResolution;
  switch (mission.kind) {
    case 'incident': {
      const incident = draft.incidents.find(candidate => candidate.id === mission.sourceId);
      if (
        !incident
        || incident.status === 'resolved'
        || incident.status === 'archived'
        || meta.resolvedIncidentIds.includes(incident.id)
      ) {
        return { ok: false, message: 'The incident is no longer available for active containment.' };
      }
      incident.status = 'resolved';
      incident.actionTaken = `Resolved during active Hotel Shift containment by ${mission.playerId}.`;
      incident.resolvedDay = meta.campaignDay;
      draft.reputation = RulesEngine.calculateIncidentResolutionImpact(
        incident,
        draft.reputation,
      );
      meta.resolvedIncidentIds.push(incident.id);
      result = {
        ok: true,
        message: `Incident at ${incident.location} resolved through active containment.`,
      };
      break;
    }
    case 'task': {
      const task = draft.staffTasks.find(candidate => candidate.id === mission.sourceId);
      if (!task || task.status !== 'in_progress') {
        return { ok: false, message: 'Start this assigned duty in Staff before active completion.' };
      }
      if ((task.availableOnDay ?? meta.campaignDay) > meta.campaignDay) {
        return {
          ok: false,
          message: `This duty remains unavailable until Campaign Day ${task.availableOnDay}.`,
        };
      }
      if (!draft.characters.some(character => (
        character.id === task.assignedTo && character.status === 'staff'
      ))) {
        return { ok: false, message: 'The assigned staff member is no longer active.' };
      }
      if (meta.appliedTaskIds.includes(task.id)) {
        return { ok: false, message: 'This duty effect was already applied.' };
      }
      const effect = applyTaskCompletionEffect(task, draft, inventory);
      if (!effect.ok) return effect;
      task.status = 'completed';
      meta.appliedTaskIds.push(task.id);
      meta.staffFatigue[task.assignedTo] = Math.min(
        100,
        (meta.staffFatigue[task.assignedTo] || 0)
          + Math.max(1, Math.ceil(task.mentalWorkload / 3)),
      );
      result = effect;
      break;
    }
    case 'room': {
      const room = draft.rooms.find(candidate => candidate.number === mission.sourceId);
      if (!room || (room.status !== 'messy' && room.status !== 'damaged')) {
        return { ok: false, message: 'The room no longer needs this operation.' };
      }
      if (room.status === 'messy') {
        if (inventory.clean < 1) {
          return {
            ok: false,
            message: 'Cleaning supplies are depleted. Restock before another shift.',
          };
        }
        inventory.clean -= 1;
        room.status = 'clean';
        room.lastInspectionDate = `Campaign Day ${meta.campaignDay}`;
        room.lastInspectedBy = mission.playerId;
        room.maintenanceNotes = `${room.maintenanceNotes}\nCleaned during active Hotel Shift.`;
        result = {
          ok: true,
          message: `Room ${room.number} inspected and cleaned; one cleaning supply consumed.`,
        };
      } else {
        const balance = draft.resourceLedger.reduce(
          (sum, entry) => sum + (entry.type === 'income' ? entry.amount : -entry.amount),
          0,
        );
        if (balance < room.repairCost) {
          return {
            ok: false,
            message: `Room ${room.number} needs ${room.repairCost} HN, but only ${balance} HN remains.`,
          };
        }
        const chargedCost = room.repairCost;
        if (chargedCost > 0) {
          draft.resourceLedger.push({
            id: `hotel_shift_repair_${meta.campaignDay}_${room.number}`,
            date: `Campaign Day ${meta.campaignDay}`,
            type: 'expense',
            category: 'repair',
            amount: chargedCost,
            description: `Active Hotel Shift repair for Room ${room.number}.`,
          });
        }
        room.status = 'clean';
        room.repairCost = 0;
        room.lastInspectionDate = `Campaign Day ${meta.campaignDay}`;
        room.lastInspectedBy = mission.playerId;
        room.maintenanceNotes = `${room.maintenanceNotes}\nStabilized during active Hotel Shift.`;
        result = {
          ok: true,
          message: `Room ${room.number} stabilized for ${chargedCost} HN.`,
        };
      }
      break;
    }
    case 'patrol': {
      const patrolMarker = `hotel-shift:patrol:${meta.campaignDay}`;
      if (meta.completedMilestones.includes(patrolMarker)) {
        return { ok: false, message: 'Today’s resident support patrol is already complete.' };
      }
      meta.completedMilestones.push(patrolMarker);
      draft.reputation.internalTrust = Math.min(
        100,
        draft.reputation.internalTrust + 2,
      );
      draft.reputation.redemptionCredibility = Math.min(
        100,
        draft.reputation.redemptionCredibility + 1,
      );
      const completedDay = meta.campaignDay;
      const nextDay = applyCampaignDayAdvance(draft);
      result = {
        ok: true,
        message: `Campaign Day ${completedDay} completed through play. Day ${nextDay} has begun.`,
      };
      break;
    }
    case 'practice':
      return {
        ok: true,
        message: 'Rehearsal complete. Practice does not alter campaign or canon state.',
      };
    default:
      return { ok: false, message: 'Unknown Hotel Shift objective.' };
  }

  meta.completedMilestones.push(marker);
  return result;
}

/**
 * Failure never punishes a resident or changes a canon fate. It records one
 * operational consequence per mission and campaign day: slight staff fatigue
 * and a bounded trust loss.
 */
export function applyHotelShiftFailure(
  mission: HotelShiftMission,
  draft: DatabaseState,
): HotelShiftResolution {
  const meta = draft.gameplayMeta!;
  const marker = hotelShiftFailureMarker(mission, meta.campaignDay);
  if (meta.completedMilestones.includes(marker)) {
    return {
      ok: true,
      message: 'Failure consequence was already recorded for this objective today.',
    };
  }
  meta.completedMilestones.push(marker);
  meta.staffFatigue[mission.playerId] = Math.min(
    100,
    (meta.staffFatigue[mission.playerId] || 0) + 2,
  );
  draft.reputation.internalTrust = Math.max(
    0,
    draft.reputation.internalTrust - 1,
  );
  return {
    ok: true,
    message: 'The team withdrew safely: staff fatigue +2 and internal trust -1.',
  };
}
