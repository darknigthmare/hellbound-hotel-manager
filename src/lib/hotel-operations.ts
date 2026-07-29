import type { InventoryBackup } from './export-import';
import { RulesEngine } from './rules-engine';
import type { DatabaseState, StaffTask } from '../types';

export interface TaskCompletionEffect {
  ok: boolean;
  message: string;
}

export function applyTaskCompletionEffect(
  task: StaffTask,
  draft: DatabaseState,
  inventory: InventoryBackup
): TaskCompletionEffect {
  const staffName = draft.characters.find(character => character.id === task.assignedTo)?.name || task.assignedTo;

  switch (task.type) {
    case 'room_inspection': {
      const room = draft.rooms.find(candidate => candidate.number === task.targetId && candidate.status === 'messy')
        || (!task.targetId ? draft.rooms.find(candidate => candidate.status === 'messy') : undefined);
      if (!room) return { ok: true, message: `${staffName} completed an inspection; no messy room required cleaning.` };
      if (inventory.clean < 1) {
        return { ok: false, message: 'Cleaning supplies are depleted. Restock before completing this inspection.' };
      }
      inventory.clean -= 1;
      room.status = 'clean';
      room.lastInspectionDate = `Campaign Day ${draft.gameplayMeta!.campaignDay}`;
      room.lastInspectedBy = task.assignedTo;
      room.maintenanceNotes = `${room.maintenanceNotes}\nCleaned during staff task ${task.id}.`;
      return { ok: true, message: `${staffName} inspected and cleaned Room ${room.number}; 1 cleaning supply consumed.` };
    }
    case 'repair_work': {
      const room = draft.rooms.find(candidate => candidate.number === task.targetId && candidate.status === 'damaged')
        || (!task.targetId ? draft.rooms.find(candidate => candidate.status === 'damaged') : undefined);
      if (!room) return { ok: true, message: `${staffName} verified that no damaged room required repair.` };
      const balance = draft.resourceLedger.reduce((sum, entry) => sum + (entry.type === 'income' ? entry.amount : -entry.amount), 0);
      if (balance < room.repairCost) {
        return { ok: false, message: `Repair requires ${room.repairCost} HN, but only ${balance} HN is available.` };
      }
      if (room.repairCost > 0) {
        draft.resourceLedger.push({
          id: `task_repair_${task.id}`,
          date: `Campaign Day ${draft.gameplayMeta!.campaignDay}`,
          type: 'expense',
          category: 'repair',
          amount: room.repairCost,
          description: `Staff repair task completed for Room ${room.number}.`
        });
      }
      room.status = 'clean';
      room.repairCost = 0;
      room.maintenanceNotes = `${room.maintenanceNotes}\nRepaired by ${staffName} under task ${task.id}.`;
      return { ok: true, message: `${staffName} repaired Room ${room.number}.` };
    }
    case 'rehab_prep': {
      const plan = draft.rehabilitationPlans.find(candidate => candidate.id === task.targetId && !candidate.isRedeemedConfirmed)
        || (!task.targetId ? draft.rehabilitationPlans.filter(candidate => !candidate.isRedeemedConfirmed)
          .sort((a, b) => RulesEngine.calculateRehabilitationProgress(a) - RulesEngine.calculateRehabilitationProgress(b))[0] : undefined);
      if (!plan) return { ok: true, message: `${staffName} prepared curriculum files; no active plan needed assistance.` };
      if (inventory.food < 1) {
        return { ok: false, message: 'Workshop supplies are depleted. Restock food/workshop inventory first.' };
      }
      inventory.food -= 1;
      plan.cooperationScore = Math.min(100, plan.cooperationScore + 2);
      const resident = draft.characters.find(character => character.id === plan.characterId);
      if (resident) {
        resident.rehabProgress = RulesEngine.calculateRehabilitationProgress(plan);
      }
      return { ok: true, message: `${staffName} prepared ${resident?.name || plan.characterId}'s curriculum; cooperation +2 and 1 workshop supply consumed.` };
    }
    case 'media_response': {
      draft.reputation.sinnerReputation = Math.min(100, draft.reputation.sinnerReputation + 2);
      draft.reputation.mediaChaos = Math.max(0, draft.reputation.mediaChaos - 5);
      draft.reputation.veesInfluence = Math.max(0, draft.reputation.veesInfluence - 2);
      return { ok: true, message: `${staffName} issued a media response: sinner reputation +2, chaos -5, Vees influence -2.` };
    }
    case 'heaven_watch': {
      draft.reputation.heavenAttention = Math.max(0, draft.reputation.heavenAttention - 3);
      draft.reputation.internalTrust = Math.min(100, draft.reputation.internalTrust + 1);
      return { ok: true, message: `${staffName} completed counter-surveillance: Heaven attention -3, internal trust +1.` };
    }
    case 'vees_watch': {
      draft.reputation.veesInfluence = Math.max(0, draft.reputation.veesInfluence - 4);
      return { ok: true, message: `${staffName} disrupted a Vees signal relay: influence -4.` };
    }
    case 'conflict_resolution': {
      if (inventory.bar < 1) {
        return { ok: false, message: 'Bar supplies are depleted. Restock before running conflict mediation.' };
      }
      inventory.bar -= 1;
      draft.reputation.internalTrust = Math.min(100, draft.reputation.internalTrust + 4);
      draft.reputation.mediaChaos = Math.max(0, draft.reputation.mediaChaos - 2);
      return { ok: true, message: `${staffName} mediated a bar conflict: internal trust +4, media chaos -2, 1 bar supply consumed.` };
    }
    case 'new_sinner_intake': {
      const applicant = draft.characters.find(character => character.id === task.targetId && character.status === 'applicant' && character.type === 'sinner')
        || (!task.targetId ? draft.characters.find(character => character.status === 'applicant' && character.type === 'sinner') : undefined);
      if (!applicant) return { ok: false, message: 'No applicant is waiting for an intake interview.' };
      const housed = draft.rooms.some(room => room.occupantId === applicant.id || room.occupantIds?.includes(applicant.id));
      if (!housed) {
        const room = draft.rooms.find(candidate => {
          const occupants = candidate.occupantIds?.length ?? (candidate.occupantId ? 1 : 0);
          return occupants < candidate.capacity && candidate.status === 'clean'
            && !candidate.restrictions.includes('staff_only') && !candidate.restrictions.includes('no_entry');
        });
        if (!room) return { ok: false, message: 'Admission blocked: no safe bed is available for this applicant.' };
        const occupants = room.occupantIds ? [...room.occupantIds] : (room.occupantId ? [room.occupantId] : []);
        occupants.push(applicant.id);
        room.occupantIds = occupants;
        room.occupantId = room.occupantId || applicant.id;
      }
      applicant.status = 'resident';
      applicant.role = 'resident';
      applicant.charlieTrust = Math.min(100, applicant.charlieTrust + 5);
      return { ok: true, message: `${staffName} admitted ${applicant.name} as an active resident; Charlie trust +5.` };
    }
    case 'staff_briefing': {
      draft.reputation.internalTrust = Math.min(100, draft.reputation.internalTrust + 3);
      return { ok: true, message: `${staffName} completed the briefing; internal trust +3.` };
    }
    case 'custom':
      return { ok: true, message: `${staffName} completed the documented custom duty.` };
    default:
      return { ok: true, message: `${staffName} completed the assigned duty.` };
  }
}
