import React, { useState } from 'react';
import { Plus, Calendar, Trash2, ShieldAlert, Smile, Play } from 'lucide-react';
import { db } from '../db/localDb';
import { StaffTask, Character, TaskType, TaskStatus, DatabaseState } from '../types';
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

  // Starting a duty is administrative preparation. Its effect can only be
  // earned by completing the corresponding active Hotel Shift mission.
  const handleStartTask = (task: StaffTask) => {
    const saved = db.transaction('TASK_STATUS_CHANGE', (draft) => {
      const current = draft.staffTasks.find(candidate => candidate.id === task.id);
      if (!current) throw new Error('Task no longer exists.');
      if (current.status !== 'pending') throw new Error('Only a pending task can be started.');
      current.status = 'in_progress';
    }, {
      action: 'TASK_STARTED',
      details: `Staff task "${task.title}" started; active completion remains in Hotel Shift.`
    });
    if (!saved) {
      const message = db.getStorageStatus().lastError?.message || 'Task status change failed.';
      setValidationError(message);
      window.alert(message);
      return;
    }
    setValidationError(null);
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
            Dispatch and assign duties here, then complete their active work through Hotel Shift gameplay.
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
                          onClick={() => handleStartTask(task)}
                          id={`start-${task.id}`}
                        >
                          <Play size={10} /> Start
                        </button>
                      ) : (
                        <span
                          id={`hotel-shift-required-${task.id}`}
                          role="status"
                          style={{ padding: '6px 10px', fontSize: '0.7rem', color: 'var(--color-gold)', border: '1px solid var(--color-gold-dark)', borderRadius: '4px' }}
                          title={`Active completion is available in Hotel Shift on Campaign Day ${task.availableOnDay || (state.gameplayMeta || db.getGameplayMeta()).campaignDay}.`}
                        >
                          À accomplir dans Hotel Shift
                        </span>
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
                  Hotel Shift gameplay applies the duty's room, resource, rehabilitation, or reputation effect exactly once.
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
