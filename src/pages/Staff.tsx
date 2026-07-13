import React, { useState } from 'react';
import { Plus, CheckCircle, Calendar, Trash2, ShieldAlert, Smile, Play } from 'lucide-react';
import { db } from '../db/localDb';
import { RulesEngine } from '../lib/rules-engine';
import { StaffTask, Character, TaskType, TaskStatus, DatabaseState } from '../types';
import { InventoryBackup } from '../lib/export-import';
import { useDialogFocus } from '../components/useDialogFocus';

interface StaffProps {
  state: DatabaseState;
  onStateChange: () => void;
  searchQuery: string;
}

const GLOBAL_EFFECT_TASK_TYPES = new Set<TaskType>([
  'conflict_resolution',
  'media_response',
  'heaven_watch',
  'vees_watch',
  'staff_briefing'
]);

export const Staff: React.FC<StaffProps> = ({ state, onStateChange, searchQuery }) => {
  const { staffTasks, characters } = state;

  // Filter staff members
  const staffRoster = characters.filter((c: Character) => c.status === 'staff');

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<TaskType>('room_inspection');
  const [formAssignedTo, setFormAssignedTo] = useState(staffRoster[0]?.id || '');
  const [formWorkload, setFormWorkload] = useState(3);
  const [formStatus, setFormStatus] = useState<TaskStatus>('pending');
  const [formNotes, setFormNotes] = useState('');
  const [formTargetId, setFormTargetId] = useState('');
  const modalRef = useDialogFocus(isModalOpen, () => setIsModalOpen(false), '#task-title');

  // Handle Save Task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setValidationError('Task title is required.');
      return;
    }
    if (!formAssignedTo) {
      setValidationError('A staff member must be assigned to this duty.');
      return;
    }
    const targetedTypes: TaskType[] = ['new_sinner_intake', 'room_inspection', 'repair_work', 'rehab_prep'];
    if (targetedTypes.includes(formType) && !formTargetId) {
      setValidationError('Choose a specific resident, room, or plan target for this duty.');
      return;
    }
    const projectedWorkload = getStaffOperationalLoad(formAssignedTo) + formWorkload;
    if (projectedWorkload > 10) {
      setValidationError(`Dispatch blocked: this would raise the staff workload to ${projectedWorkload}/10.`);
      return;
    }

    const campaignDay = (state.gameplayMeta || db.getGameplayMeta()).campaignDay;
    const durationDays = Math.max(1, Math.ceil(formWorkload / 4));
    const newTask: StaffTask = {
      id: '',
      date: `Campaign Day ${campaignDay}`,
      title: formTitle.trim(),
      type: formType,
      assignedTo: formAssignedTo,
      mentalWorkload: formWorkload,
      status: formStatus,
      notes: formNotes.trim(),
      targetId: formTargetId || null,
      createdDay: campaignDay,
      availableOnDay: campaignDay + durationDays
    };

    const saved = db.transaction('STAFF_TASK_CREATE', (draft) => {
      const meta = draft.gameplayMeta!;
      const assignee = draft.characters.find(character => character.id === formAssignedTo && character.status === 'staff');
      if (!assignee) throw new Error('The selected assignee is no longer an active staff member.');
      const targetStillValid = formType === 'new_sinner_intake'
        ? draft.characters.some(character => character.id === formTargetId && character.status === 'applicant' && character.type === 'sinner')
        : formType === 'room_inspection'
          ? draft.rooms.some(room => room.number === formTargetId && room.status === 'messy')
          : formType === 'repair_work'
            ? draft.rooms.some(room => room.number === formTargetId && room.status === 'damaged')
            : formType === 'rehab_prep'
              ? draft.rehabilitationPlans.some(plan => plan.id === formTargetId && !plan.isRedeemedConfirmed)
              : true;
      if (targetedTypes.includes(formType) && !targetStillValid) throw new Error('The selected duty target is no longer valid.');
      const currentLoad = draft.staffTasks
        .filter(task => task.assignedTo === formAssignedTo && task.status !== 'completed' && task.status !== 'cancelled')
        .reduce((sum, task) => sum + task.mentalWorkload, meta.staffFatigue[formAssignedTo] || 0);
      if (currentLoad + formWorkload > 10) throw new Error('Staff workload changed; dispatch would exceed 10/10.');
      if (GLOBAL_EFFECT_TASK_TYPES.has(formType)) {
        const cooldownKey = `task-create:${formType}`;
        if ((meta.cooldowns[cooldownKey] || 0) > meta.campaignDay
          || draft.staffTasks.some(task => task.type === formType && task.status !== 'completed' && task.status !== 'cancelled')) {
          throw new Error('Only one active duty of this strategic type may be scheduled per campaign day.');
        }
        meta.cooldowns[cooldownKey] = meta.campaignDay + 1;
      }
      newTask.date = `Campaign Day ${meta.campaignDay}`;
      newTask.createdDay = meta.campaignDay;
      newTask.availableOnDay = meta.campaignDay + durationDays;
      let sequence = draft.staffTasks.length + 1;
      do {
        newTask.id = `task_${meta.campaignDay}_${sequence}`;
        sequence += 1;
      } while (draft.staffTasks.some(task => task.id === newTask.id));
      draft.staffTasks.push(newTask);
    }, {
      action: 'STAFF_TASK_CREATE',
      details: `Scheduled "${newTask.title}" for Day ${newTask.availableOnDay}.`
    });
    if (!saved) {
      setValidationError(db.getStorageStatus().lastError?.message || 'Task could not be scheduled.');
      return;
    }
    setIsModalOpen(false);
    onStateChange();
  };

  const applyTaskCompletionEffect = (task: StaffTask, draft: DatabaseState, inventory: InventoryBackup): { ok: boolean; message: string } => {
    const staffName = draft.characters.find((character: Character) => character.id === task.assignedTo)?.name || task.assignedTo;

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
  };

  // Toggle Task Status
  const handleToggleTaskStatus = (task: StaffTask, newStatus: TaskStatus) => {
    let completionMessage = '';
    const saved = db.transaction(newStatus === 'completed' ? 'TASK_COMPLETED' : 'TASK_STATUS_CHANGE', (draft, inventory) => {
      const current = draft.staffTasks.find(candidate => candidate.id === task.id);
      if (!current) throw new Error('Task no longer exists.');
      if (newStatus === 'in_progress') {
        if (current.status !== 'pending') throw new Error('Only a pending task can be started.');
        current.status = 'in_progress';
        return;
      }
      if (newStatus === 'completed') {
        const meta = draft.gameplayMeta!;
        if (current.status !== 'in_progress') throw new Error('Start the duty before completing it.');
        if (!draft.characters.some(character => character.id === current.assignedTo && character.status === 'staff')) {
          throw new Error('The assigned character is no longer active hotel staff.');
        }
        if ((current.availableOnDay || meta.campaignDay) > meta.campaignDay) {
          throw new Error(`This duty requires work until Campaign Day ${current.availableOnDay}.`);
        }
        if (meta.appliedTaskIds.includes(current.id)) throw new Error('This task effect was already applied.');
        const effect = applyTaskCompletionEffect(current, draft, inventory);
        if (!effect.ok) throw new Error(effect.message);
        completionMessage = effect.message;
        meta.appliedTaskIds.push(current.id);
        meta.staffFatigue[current.assignedTo] = Math.min(100, (meta.staffFatigue[current.assignedTo] || 0) + Math.max(1, Math.ceil(current.mentalWorkload / 3)));
        current.status = 'completed';
      }
    }, {
      action: newStatus === 'completed' ? 'TASK_COMPLETED' : 'TASK_STARTED',
      details: newStatus === 'completed' ? `Staff task "${task.title}" completed with its exactly-once effect.` : `Staff task "${task.title}" started.`
    });
    if (!saved) {
      const message = db.getStorageStatus().lastError?.message || 'Task status change failed.';
      setValidationError(message);
      window.alert(message);
      return;
    }
    if (completionMessage) setValidationError(null);
    onStateChange();
  };

  // Cancellation preserves history and cannot erase an applied effect.
  const handleDeleteTask = (taskId: string) => {
    const cancelled = db.transaction('TASK_CANCELLED', (draft) => {
      const task = draft.staffTasks.find(candidate => candidate.id === taskId);
      if (!task || task.status === 'completed') throw new Error('Completed duties cannot be removed or cancelled.');
      task.status = 'cancelled';
    }, { action: 'TASK_CANCELLED', details: `Cancelled staff task ${taskId}; historical record retained.` });
    if (!cancelled) {
      window.alert(db.getStorageStatus().lastError?.message || 'Task could not be cancelled.');
      return;
    }
    onStateChange();
  };

  // Get tasks assigned to a specific staff member
  const getStaffTasks = (staffId: string) => {
    return staffTasks.filter((t: StaffTask) => t.assignedTo === staffId && t.status !== 'completed' && t.status !== 'cancelled');
  };

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
  const taskMatchesSearch = (task: StaffTask) => {
    if (!normalizedSearch) return true;
    const assignee = characters.find((character: Character) => character.id === task.assignedTo)?.name ?? task.assignedTo;
    return `${task.title} ${task.type} ${task.status} ${task.notes} ${assignee}`.toLocaleLowerCase().includes(normalizedSearch);
  };

  // Get total workload for a specific staff member
  const getStaffWorkload = (staffId: string) => {
    const activeTasks = getStaffTasks(staffId);
    return activeTasks.reduce((sum: number, t: StaffTask) => sum + t.mentalWorkload, 0);
  };

  const getStaffOperationalLoad = (staffId: string) => (
    getStaffWorkload(staffId) + ((state.gameplayMeta || db.getGameplayMeta()).staffFatigue[staffId] || 0)
  );

  const taskTargetOptions = formType === 'new_sinner_intake'
    ? characters.filter(character => character.status === 'applicant' && character.type === 'sinner').map(character => ({ id: character.id, label: character.name }))
    : formType === 'room_inspection'
      ? state.rooms.filter(room => room.status === 'messy').map(room => ({ id: room.number, label: `Room ${room.number}` }))
      : formType === 'repair_work'
        ? state.rooms.filter(room => room.status === 'damaged').map(room => ({ id: room.number, label: `Room ${room.number} (${room.repairCost} HN)` }))
        : formType === 'rehab_prep'
          ? state.rehabilitationPlans.filter(plan => !plan.isRedeemedConfirmed).map(plan => ({
              id: plan.id,
              label: characters.find(character => character.id === plan.characterId)?.name || plan.characterId
            }))
          : [];

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Staff & Operations Scheduler</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Dispatch tasks, balance workloads, and track staff performance ratings.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setFormTitle('');
          setFormType('room_inspection');
          setFormAssignedTo(staffRoster[0]?.id || '');
          setFormWorkload(3);
          setFormStatus('pending');
          setFormNotes('');
          setFormTargetId('');
          setValidationError(null);
          setIsModalOpen(true);
        }} id="dispatch-task-btn">
          <Plus size={16} />
          Dispatch Shift Task
        </button>
      </div>

      {/* Staff Workload overview grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {staffRoster.map((staff: Character) => {
          const workload = getStaffOperationalLoad(staff.id);
          const activeCount = getStaffTasks(staff.id).length;
          const isOverloaded = workload >= 8;

          return (
            <div 
              key={staff.id} 
              className="glass-panel" 
              style={{ 
                padding: '16px',
                borderTop: isOverloaded ? '3px solid var(--status-high)' : '3px solid var(--color-gold)',
                boxShadow: isOverloaded ? '0 0 10px rgba(114, 28, 36, 0.15)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-text-main)' }}>{staff.name}</h3>
                <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}>
                  {staff.role}
                </span>
              </div>
              
              <div style={{ margin: '12px 0 8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span>Workload Rating</span>
                  <strong style={{ color: isOverloaded ? '#ff6b7a' : 'var(--color-gold)' }}>
                    {workload} / 10
                  </strong>
                </div>
                <div style={{ height: '5px', backgroundColor: 'var(--bg-main)', borderRadius: '2.5px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${Math.min(100, (workload / 10) * 100)}%`, 
                      backgroundColor: isOverloaded ? 'var(--status-high)' : 'var(--color-gold)' 
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  {activeCount} Active Task(s)
                </span>
                {isOverloaded && (
                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '3px', backgroundColor: 'rgba(220,53,69,0.15)', color: '#ff6b7a', fontWeight: 'bold', border: '1px solid rgba(220,53,69,0.3)' }}>
                    BURNOUT RISK
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main tasks list and calendar layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Left column: Active Tasks Ledger */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: 8 }}>
            Active Duty Roster
          </h3>

          {staffTasks.filter((t: StaffTask) => t.status !== 'completed' && t.status !== 'cancelled' && taskMatchesSearch(t)).length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              <Smile size={32} style={{ color: 'var(--color-gold-dark)', marginBottom: '8px' }} />
              <p>No active shift tasks scheduled. All staff members are available.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {staffTasks.filter((t: StaffTask) => t.status !== 'completed' && t.status !== 'cancelled' && taskMatchesSearch(t)).map((task: StaffTask) => {
                const assignedStaff = characters.find((c: Character) => c.id === task.assignedTo);
                const isWorkloadHigh = task.mentalWorkload >= 7;

                return (
                  <div 
                    key={task.id} 
                    id={`task-card-${task.id}`}
                    style={{ 
                      padding: '12px 16px', 
                      backgroundColor: 'rgba(0,0,0,0.18)', 
                      border: '1px solid rgba(255,255,255,0.03)', 
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: isWorkloadHigh ? '3px solid var(--status-high)' : '3px solid var(--color-gold-dark)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '0.95rem', color: 'var(--color-text-main)' }}>{task.title}</h4>
                        <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-text-main)', textTransform: 'uppercase' }}>
                          {task.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {task.date}
                        </span>
                        <span>Assigned to: <strong style={{ color: 'var(--color-gold)' }}>{assignedStaff?.name || task.assignedTo}</strong></span>
                        <span style={{ color: isWorkloadHigh ? '#ff6b7a' : 'var(--color-text-muted)' }}>
                          Stress: {task.mentalWorkload}/10
                        </span>
                      </div>
                      {task.notes && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '6px' }}>
                          "{task.notes}"
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {task.status === 'pending' ? (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.7rem' }}
                          onClick={() => handleToggleTaskStatus(task, 'in_progress')}
                          id={`start-${task.id}`}
                        >
                          <Play size={10} /> Start
                        </button>
                      ) : (
                        <button 
                          className="btn btn-gold" 
                          style={{ padding: '6px 12px', fontSize: '0.7rem' }}
                          onClick={() => handleToggleTaskStatus(task, 'completed')}
                          id={`complete-${task.id}`}
                          disabled={(task.availableOnDay || (state.gameplayMeta || db.getGameplayMeta()).campaignDay) > (state.gameplayMeta || db.getGameplayMeta()).campaignDay}
                          title={`Available on Campaign Day ${task.availableOnDay || (state.gameplayMeta || db.getGameplayMeta()).campaignDay}`}
                        >
                          <CheckCircle size={10} /> Complete
                        </button>
                      )}
                      <button 
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#ff6b7a', cursor: 'pointer', padding: '4px' }}
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete task log"
                        aria-label={`Cancel task ${task.title}`}
                        id={`delete-task-${task.id}`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Completed tasks ledger */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--color-text-muted)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: 8, fontSize: '0.95rem' }}>
            Historical Shift Archive
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
            {staffTasks.filter((t: StaffTask) => (t.status === 'completed' || t.status === 'cancelled') && taskMatchesSearch(t)).length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                No completed records in active register.
              </p>
            ) : (
              staffTasks.filter((t: StaffTask) => (t.status === 'completed' || t.status === 'cancelled') && taskMatchesSearch(t)).map((task: StaffTask) => (
                <div key={task.id} id={`task-card-${task.id}`} style={{ backgroundColor: 'rgba(0,0,0,0.12)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2px' }}>
                    <span style={{ color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>{task.title}</span>
                    <span style={{ fontSize: '0.65rem', color: task.status === 'completed' ? '#4ce06c' : '#a39395' }}>
                      {task.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                    <span>By: {characters.find((c: Character) => c.id === task.assignedTo)?.name || task.assignedTo}</span>
                    <span>{task.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Dispatch Modal */}
      {isModalOpen && (
        <div onMouseDown={(event) => { if (event.target === event.currentTarget) setIsModalOpen(false); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div ref={modalRef} tabIndex={-1} className="glass-panel art-deco-border" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title" style={{ width: '90%', maxWidth: '460px', padding: '24px' }}>
            <h2 id="task-dialog-title" style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px' }}>
              Dispatch Operational Duty
            </h2>

            {validationError && (
              <div role="alert" style={{ backgroundColor: 'rgba(220, 53, 69, 0.15)', border: '1px solid var(--status-high)', color: '#ff6b7a', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                {validationError}
              </div>
            )}

            <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label htmlFor="task-title">Duty Title *</label>
                <input 
                  type="text" 
                  id="task-title" 
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)} 
                  style={{ width: '100%' }}
                  placeholder="e.g. Inspect Floor 1 guest rooms"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="task-type">Task Type</label>
                  <select 
                    id="task-type" 
                    value={formType} 
                    onChange={(e) => {
                      setFormType(e.target.value as TaskType);
                      setFormTargetId('');
                    }}
                    style={{ width: '100%' }}
                  >
                    <option value="room_inspection">Room Inspection</option>
                    <option value="new_sinner_intake">Sinner Intake Interview</option>
                    <option value="conflict_resolution">Bar Conflict Mediation</option>
                    <option value="repair_work">Facility Structural Repair</option>
                    <option value="rehab_prep">Rehabilitation Prep</option>
                    <option value="media_response">Reputation PR Response</option>
                    <option value="heaven_watch">Heaven Patrol Monitoring</option>
                    <option value="vees_watch">Vees Signal Patrol</option>
                    <option value="staff_briefing">Staff Briefing</option>
                    <option value="custom">Custom Operations</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="task-assign">Assign Staff Member</label>
                  <select 
                    id="task-assign" 
                    value={formAssignedTo} 
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {staffRoster.map((s: Character) => (
                      <option key={s.id} value={s.id}>{s.name} (Operational load: {getStaffOperationalLoad(s.id)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="task-workload">Mental Workload Rating (1 = Minor, 10 = Severe stress) *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="range" 
                    id="task-workload" 
                    min="1" 
                    max="10" 
                    value={formWorkload} 
                    onChange={(e) => setFormWorkload(parseInt(e.target.value) || 1)}
                    style={{ flex: 1 }} 
                  />
                  <strong style={{ fontSize: '1.1rem', color: formWorkload >= 7 ? '#ff6b7a' : 'var(--color-gold)', minWidth: '20px' }}>
                    {formWorkload}
                  </strong>
                </div>
              </div>

              <div>
                <label htmlFor="task-status">Initial Status</label>
                <select 
                  id="task-status" 
                  value={formStatus} 
                  onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                  style={{ width: '100%' }}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">Active / In Progress</option>
                </select>
                <span style={{ display: 'block', marginTop: '4px', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                  Completion applies the selected duty's room, resource, rehabilitation, or reputation effect.
                </span>
              </div>

              {taskTargetOptions.length > 0 && (
                <div>
                  <label htmlFor="task-target">Specific Duty Target *</label>
                  <select id="task-target" value={formTargetId} onChange={(e) => setFormTargetId(e.target.value)} style={{ width: '100%' }}>
                    <option value="">-- Choose target --</option>
                    {taskTargetOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>
                  <span style={{ display: 'block', marginTop: '4px', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                    The target is locked into the task so completion cannot affect an unrelated future entity.
                  </span>
                </div>
              )}

              <div>
                <label htmlFor="task-notes">Brief Instructions</label>
                <textarea 
                  id="task-notes" 
                  rows={2} 
                  value={formNotes} 
                  onChange={(e) => setFormNotes(e.target.value)} 
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} id="cancel-task-modal-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-task-modal-btn">
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
