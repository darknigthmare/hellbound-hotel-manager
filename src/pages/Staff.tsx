import React, { useState } from 'react';
import { Users, Plus, CheckCircle, Calendar, Trash2, ShieldAlert, Award, Smile, Info, Play } from 'lucide-react';
import { db } from '../db/localDb';
import { StaffTask, Character, TaskType, TaskStatus } from '../types';

interface StaffProps {
  state: any;
  onStateChange: () => void;
}

export const Staff: React.FC<StaffProps> = ({ state, onStateChange }) => {
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

  // Handle Save Task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setValidationError('Task title is required.');
      return;
    }

    const newTask: StaffTask = {
      id: 'task_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      title: formTitle.trim(),
      type: formType,
      assignedTo: formAssignedTo,
      mentalWorkload: formWorkload,
      status: formStatus,
      notes: formNotes.trim()
    };

    db.saveStaffTask(newTask);
    setIsModalOpen(false);
    onStateChange();
  };

  // Toggle Task Status
  const handleToggleTaskStatus = (task: StaffTask, newStatus: TaskStatus) => {
    const updated: StaffTask = {
      ...task,
      status: newStatus
    };
    db.saveStaffTask(updated);
    if (newStatus === 'completed') {
      db.logAction('TASK_COMPLETED', `Staff task "${task.title}" completed by ${characters.find((c: Character) => c.id === task.assignedTo)?.name || task.assignedTo}.`);
    }
    onStateChange();
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    db.deleteStaffTask(taskId);
    onStateChange();
  };

  // Get tasks assigned to a specific staff member
  const getStaffTasks = (staffId: string) => {
    return staffTasks.filter((t: StaffTask) => t.assignedTo === staffId && t.status !== 'completed' && t.status !== 'cancelled');
  };

  // Get total workload for a specific staff member
  const getStaffWorkload = (staffId: string) => {
    const activeTasks = getStaffTasks(staffId);
    return activeTasks.reduce((sum: number, t: StaffTask) => sum + t.mentalWorkload, 0);
  };

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
          const workload = getStaffWorkload(staff.id);
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

          {staffTasks.filter((t: StaffTask) => t.status !== 'completed' && t.status !== 'cancelled').length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              <Smile size={32} style={{ color: 'var(--color-gold-dark)', marginBottom: '8px' }} />
              <p>No active shift tasks scheduled. All staff members are available.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {staffTasks.filter((t: StaffTask) => t.status !== 'completed' && t.status !== 'cancelled').map((task: StaffTask) => {
                const assignedStaff = characters.find((c: Character) => c.id === task.assignedTo);
                const isWorkloadHigh = task.mentalWorkload >= 7;

                return (
                  <div 
                    key={task.id} 
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
                        >
                          <CheckCircle size={10} /> Complete
                        </button>
                      )}
                      <button 
                        style={{ background: 'none', border: 'none', color: '#ff6b7a', cursor: 'pointer', padding: '4px' }}
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete task log"
                        id={`delete-task-${task.id}`}
                      >
                        <Trash2 size={14} />
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
            {staffTasks.filter((t: StaffTask) => t.status === 'completed' || t.status === 'cancelled').length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                No completed records in active register.
              </p>
            ) : (
              staffTasks.filter((t: StaffTask) => t.status === 'completed' || t.status === 'cancelled').map((task: StaffTask) => (
                <div key={task.id} style={{ backgroundColor: 'rgba(0,0,0,0.12)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel art-deco-border" style={{ width: '90%', maxWidth: '460px', padding: '24px' }}>
            <h2 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px' }}>
              Dispatch Operational Duty
            </h2>

            {validationError && (
              <div style={{ backgroundColor: 'rgba(220, 53, 69, 0.15)', border: '1px solid var(--status-high)', color: '#ff6b7a', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
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
                    onChange={(e) => setFormType(e.target.value as TaskType)}
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
                      <option key={s.id} value={s.id}>{s.name} (Load: {getStaffWorkload(s.id)})</option>
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
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

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
