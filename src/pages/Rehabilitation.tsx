import React, { useState } from 'react';
import { HeartHandshake, Plus, Award, Trash2, ShieldAlert, Sparkles, Smile, MessageSquare, AlertCircle } from 'lucide-react';
import { db } from '../db/localDb';
import { RulesEngine } from '../lib/rules-engine';
import { RehabilitationPlan, RehabilitationSession, Character, SessionType } from '../types';

interface RehabilitationProps {
  state: any;
  onStateChange: () => void;
  targetCharacterId?: string | null;
  onClearTargetId: () => void;
}

export const Rehabilitation: React.FC<RehabilitationProps> = ({ 
  state, 
  onStateChange, 
  targetCharacterId, 
  onClearTargetId 
}) => {
  const { characters, rehabilitationPlans, rehabilitationSessions } = state;

  // Active resident selector
  const residents = characters.filter((c: Character) => c.status === 'resident' || c.status === 'applicant');
  
  // Staff members who can conduct sessions
  const staffMembers = characters.filter((c: Character) => c.status === 'staff');
  
  const [activeCharId, setActiveCharId] = useState<string>(
    targetCharacterId || (residents[0]?.id || '')
  );

  // Clear target ID from navigation so we can select freely
  React.useEffect(() => {
    if (targetCharacterId) {
      setActiveCharId(targetCharacterId);
      onClearTargetId();
    }
  }, [targetCharacterId]);

  // Selected plan and session logs
  const selectedPlan = rehabilitationPlans.find((p: RehabilitationPlan) => p.characterId === activeCharId);
  const selectedChar = characters.find((c: Character) => c.id === activeCharId);
  const sessions = selectedPlan 
    ? rehabilitationSessions.filter((s: RehabilitationSession) => s.planId === selectedPlan.id)
    : [];

  // Form: Create Plan state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [goalsInput, setGoalsInput] = useState('');
  const [obstaclesInput, setObstaclesInput] = useState('');
  const [triggersInput, setTriggersInput] = useState('');

  // Form: Log Session state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionStep, setSessionStep] = useState<number>(1);
  const [selectedDialoguePath, setSelectedDialoguePath] = useState<string | null>(null);
  const [dialogueLog, setDialogueLog] = useState<{ charSpeech: string, residentSpeech: string } | null>(null);

  const [sessionType, setSessionType] = useState<SessionType>('empathy_workshop');
  const [sessionSummary, setSessionSummary] = useState('');
  const [sessionConductedBy, setSessionConductedBy] = useState('charlie');
  const [deltaEmpathy, setDeltaEmpathy] = useState(0);
  const [deltaAccountability, setDeltaAccountability] = useState(0);
  const [deltaImpulse, setDeltaImpulse] = useState(0);
  const [deltaCooperation, setDeltaCooperation] = useState(0);

  // Form: Edit Notes state
  const [charlieNotes, setCharlieNotes] = useState('');
  const [vaggieNotes, setVaggieNotes] = useState('');
  const [staffPrivateNotes, setStaffPrivateNotes] = useState('');
  const [isNotesEditing, setIsNotesEditing] = useState(false);

  const handleOpenNotesEdit = () => {
    if (selectedPlan) {
      setCharlieNotes(selectedPlan.charlieNotes);
      setVaggieNotes(selectedPlan.vaggieNotes);
      setStaffPrivateNotes(selectedPlan.staffPrivateNotes);
      setIsNotesEditing(true);
    }
  };

  const handleSaveNotes = () => {
    if (selectedPlan) {
      const updatedPlan: RehabilitationPlan = {
        ...selectedPlan,
        charlieNotes,
        vaggieNotes,
        staffPrivateNotes
      };
      db.saveRehabilitationPlan(updatedPlan);
      setIsNotesEditing(false);
      onStateChange();
    }
  };

  // Create new Plan
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCharId) return;

    const newPlan: RehabilitationPlan = {
      id: 'plan_' + activeCharId,
      characterId: activeCharId,
      goals: goalsInput.split('\n').map(g => g.trim()).filter(g => g.length > 0),
      obstacles: obstaclesInput.split('\n').map(o => o.trim()).filter(o => o.length > 0),
      triggers: triggersInput.split('\n').map(t => t.trim()).filter(t => t.length > 0),
      empathyScore: 30,
      accountabilityScore: 30,
      impulseControlScore: 30,
      cooperationScore: 30,
      charlieNotes: 'Initial intake complete. Ready to schedule first workshops.',
      vaggieNotes: 'Monitoring boundaries and safety levels.',
      staffPrivateNotes: 'Keep records protected.',
      isRedeemedConfirmed: false
    };

    db.saveRehabilitationPlan(newPlan);
    
    // Update character rehab score representation
    if (selectedChar) {
      db.saveCharacter({
        ...selectedChar,
        rehabProgress: 30
      });
    }

    setIsCreateModalOpen(false);
    onStateChange();
  };

  // Log session
  const handleLogSession = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPlan || !selectedChar) return;

    const session: RehabilitationSession = {
      id: 'sess_' + Date.now(),
      planId: selectedPlan.id,
      date: new Date().toISOString().split('T')[0],
      type: sessionType,
      summary: sessionSummary.trim(),
      empathyDelta: deltaEmpathy,
      accountabilityDelta: deltaAccountability,
      impulseControlDelta: deltaImpulse,
      cooperationDelta: deltaCooperation,
      conductedBy: sessionConductedBy
    };

    // 1. Save session record
    db.saveRehabilitationSession(session);

    // 2. Adjust scores on the plan
    const newEmp = Math.min(100, Math.max(0, selectedPlan.empathyScore + deltaEmpathy));
    const newAcc = Math.min(100, Math.max(0, selectedPlan.accountabilityScore + deltaAccountability));
    const newImp = Math.min(100, Math.max(0, selectedPlan.impulseControlScore + deltaImpulse));
    const newCoop = Math.min(100, Math.max(0, selectedPlan.cooperationScore + deltaCooperation));

    // Average of scores defines character rehab progress
    const averageProgress = Math.round((newEmp + newAcc + newImp + newCoop) / 4);

    db.saveRehabilitationPlan({
      ...selectedPlan,
      empathyScore: newEmp,
      accountabilityScore: newAcc,
      impulseControlScore: newImp,
      cooperationScore: newCoop
    });

    // 3. Save character overall progress
    db.saveCharacter({
      ...selectedChar,
      rehabProgress: averageProgress
    });

    setIsSessionModalOpen(false);
    setSessionStep(1);
    setSelectedDialoguePath(null);
    setDialogueLog(null);
    setSessionSummary('');
    setDeltaEmpathy(0);
    setDeltaAccountability(0);
    setDeltaImpulse(0);
    setDeltaCooperation(0);
    onStateChange();
  };

  const handleDeleteSession = (sessId: string) => {
    db.deleteRehabilitationSession(sessId);
    onStateChange();
  };

  // REDEMPTION TRIGGER
  const handleConfirmRedemption = () => {
    if (!selectedPlan || !selectedChar) return;

    const consent = window.confirm(`CONFIRM CELESTIAL REDEMPTION: Are you sure you want to mark '${selectedChar.name}' as fully redeemed? Under the hotel protocols, this will update their status to 'redeemed', remove them from room registers, and trigger a public ascension event.`);
    if (!consent) return;

    // 1. Update character status
    const updatedChar: Character = {
      ...selectedChar,
      status: 'redeemed',
      role: 'external',
      riskLevel: 'low',
      rehabProgress: 100
    };
    db.saveCharacter(updatedChar);

    // 2. Update Plan status
    db.saveRehabilitationPlan({
      ...selectedPlan,
      isRedeemedConfirmed: true,
      empathyScore: 100,
      accountabilityScore: 100,
      impulseControlScore: 100,
      cooperationScore: 100
    });

    // 3. Clear occupied room if any
    const occupiedRoom = db.getRooms().find(r => r.occupantId === selectedChar.id);
    if (occupiedRoom) {
      db.saveRoom({
        ...occupiedRoom,
        occupantId: null
      });
    }

    // 4. Update Reputation
    const currentRep = db.getReputation();
    const updatedRep = RulesEngine.calculateReputationEvent('proof_of_redemption', currentRep);
    db.saveReputation(updatedRep);

    // 5. Audit Log
    db.logAction('SOUL_REDEMPTION', `Sinner '${selectedChar.name}' successfully achieved celestial redemption and ascended.`);
    onStateChange();
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Rehabilitation Center</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Initiate, review, and audit rehabilitation progress logs for local sinners.
          </p>
        </div>
      </div>

      {/* Select resident selector bar */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '16px', 
          marginBottom: '20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          backgroundColor: 'rgba(28, 17, 19, 0.4)'
        }}
      >
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <label htmlFor="rehab-character-select">Select Sinner Profile</label>
          <select 
            id="rehab-character-select"
            value={activeCharId} 
            onChange={(e) => setActiveCharId(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="" disabled>-- Select resident --</option>
            {residents.map((c: Character) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.role} - Rehab: {c.rehabProgress}%)
              </option>
            ))}
          </select>
        </div>
        {activeCharId && !selectedPlan && selectedChar && (
          <button 
            className="btn btn-primary" 
            style={{ alignSelf: 'flex-end' }} 
            onClick={() => {
              setGoalsInput('');
              setObstaclesInput('');
              setTriggersInput('');
              setIsCreateModalOpen(true);
            }}
            id="initiate-rehab-btn"
          >
            <HeartHandshake size={16} />
            Initiate Rehabilitation Plan
          </button>
        )}
      </div>

      {/* No Plan State */}
      {(!activeCharId || !selectedChar) && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Smile size={40} style={{ color: 'var(--color-gold-dark)', marginBottom: '12px' }} />
          <h3>No resident selected.</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Select an active sinner from the register above to inspect or initiate plans.</p>
        </div>
      )}

      {selectedChar && activeCharId && !selectedPlan && (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <AlertCircle size={40} style={{ color: 'var(--color-gold-dark)', marginBottom: '12px' }} />
          <h3>No Active Rehabilitation Plan</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '6px', marginBottom: '16px' }}>
            Sinner '{selectedChar.name}' is registered, but no rehabilitation curriculum has been initiated.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Initiate Plan
          </button>
        </div>
      )}

      {/* Plan Details Display */}
      {selectedPlan && selectedChar && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          
          {/* LEFT COLUMN: Main Metrics, Goals & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Plan Metrics Overview */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
                <div>
                  <h3 style={{ color: 'var(--color-gold)' }}>Rehab Metrics: {selectedChar.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Curriculum active. Overall rehabilitation score: <strong>{selectedChar.rehabProgress}%</strong>
                  </span>
                </div>
                {selectedChar.status !== 'redeemed' ? (
                  <button className="btn btn-gold" onClick={handleConfirmRedemption} id="confirm-redemption-btn">
                    <Award size={16} />
                    Confirm Redemption
                  </button>
                ) : (
                  <span style={{ color: '#4ce06c', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} /> REDEEMED SOUL
                  </span>
                )}
              </div>

              {/* Progress bars Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { label: 'Empathy Score', val: selectedPlan.empathyScore, desc: 'Ability to understand and care for others.' },
                  { label: 'Accountability Score', val: selectedPlan.accountabilityScore, desc: 'Taking responsibility for historical actions.' },
                  { label: 'Impulse Control', val: selectedPlan.impulseControlScore, desc: 'Suppressing destructive and chemical urges.' },
                  { label: 'Cooperation Rate', val: selectedPlan.cooperationScore, desc: 'Active participation in hotel life and tasks.' }
                ].map((metric, idx) => (
                  <div key={idx} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 600 }}>{metric.label}</span>
                      <strong style={{ color: 'var(--color-gold)' }}>{metric.val}%</strong>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                      <div style={{ height: '100%', width: `${metric.val}%`, backgroundColor: 'var(--color-primary)' }} />
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block' }}>{metric.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals, Obstacles & Triggers grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '16px' }}>
                <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  Goals / Objectives
                </h4>
                <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--color-text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedPlan.goals.map((g: string, i: number) => <li key={i}>{g}</li>)}
                </ul>
              </div>

              <div className="glass-panel" style={{ padding: '16px' }}>
                <h4 style={{ color: '#ff6b7a', marginBottom: '8px', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  Key Obstacles
                </h4>
                <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--color-text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedPlan.obstacles.map((o: string, i: number) => <li key={i}>{o}</li>)}
                </ul>
              </div>

              <div className="glass-panel" style={{ padding: '16px' }}>
                <h4 style={{ color: '#fd7e14', marginBottom: '8px', fontSize: '0.9rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                  Relapse Triggers
                </h4>
                <ul style={{ paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--color-text-main)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedPlan.triggers.map((t: string, i: number) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            </div>

            {/* Diagnostic Diaries */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
                <h4 style={{ color: 'var(--color-text-main)' }}>Diagnostic Diaries & Observations</h4>
                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={handleOpenNotesEdit} id="edit-rehab-notes-btn">
                  Edit Notebooks
                </button>
              </div>

              {isNotesEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label>Charlie's Counseling Notebook</label>
                    <textarea rows={2} style={{ width: '100%' }} value={charlieNotes} onChange={(e) => setCharlieNotes(e.target.value)} />
                  </div>
                  <div>
                    <label>Vaggie's Security & Compliance Log</label>
                    <textarea rows={2} style={{ width: '100%' }} value={vaggieNotes} onChange={(e) => setVaggieNotes(e.target.value)} />
                  </div>
                  <div>
                    <label>Staff Private Diagnostic Notes</label>
                    <textarea rows={2} style={{ width: '100%' }} value={staffPrivateNotes} onChange={(e) => setStaffPrivateNotes(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button className="btn btn-secondary" onClick={() => setIsNotesEditing(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSaveNotes}>Save Notes</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '4px' }}>
                    <strong style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '4px' }}>✦ Charlie Morningstar:</strong>
                    <p style={{ fontStyle: 'italic', lineHeight: 1.4 }}>{selectedPlan.charlieNotes}</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '4px' }}>
                    <strong style={{ color: 'var(--color-primary-hover)', display: 'block', marginBottom: '4px' }}>✦ Vaggie (Operations & Safety):</strong>
                    <p style={{ fontStyle: 'italic', lineHeight: 1.4 }}>{selectedPlan.vaggieNotes}</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(168, 32, 42, 0.05)', padding: '10px', borderRadius: '4px', borderLeft: '3px solid var(--color-primary)' }}>
                    <strong style={{ color: '#ff6b7a', display: 'block', marginBottom: '4px' }}>✦ Staff Private Diagnostics:</strong>
                    <p style={{ fontStyle: 'italic', lineHeight: 1.4 }}>{selectedPlan.staffPrivateNotes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sessions Log & Session Launcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Session launcher trigger */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px', fontSize: '1rem', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px' }}>
                Rehab Sessions
              </h3>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }} 
                onClick={() => setIsSessionModalOpen(true)}
                id="log-session-btn"
              >
                <Plus size={16} />
                Log Rehabilitation Session
              </button>

              {/* Sessions List */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.05em' }}>
                  Session History ({sessions.length})
                </span>
                
                {sessions.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                    No sessions logged. Initiate a check-in or empathy workshop.
                  </p>
                ) : (
                  sessions.map((sess: RehabilitationSession) => (
                    <div key={sess.id} style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-gold)' }}>{sess.type.replace('_', ' ')}</span>
                        <button 
                          onClick={() => handleDeleteSession(sess.id)}
                          style={{ background: 'none', border: 'none', color: '#ff6b7a', cursor: 'pointer' }}
                          title="Delete session log"
                          id={`delete-sess-${sess.id}`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-main)', marginBottom: '6px', fontStyle: 'italic' }}>
                        "{sess.summary}"
                      </p>
                      
                      {/* Delta changes */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '0.65rem' }}>
                        {sess.empathyDelta !== 0 && (
                          <span style={{ color: sess.empathyDelta > 0 ? '#4ce06c' : '#ff6b7a' }}>
                            Emp: {sess.empathyDelta > 0 ? `+${sess.empathyDelta}` : sess.empathyDelta}
                          </span>
                        )}
                        {sess.accountabilityDelta !== 0 && (
                          <span style={{ color: sess.accountabilityDelta > 0 ? '#4ce06c' : '#ff6b7a' }}>
                            Acc: {sess.accountabilityDelta > 0 ? `+${sess.accountabilityDelta}` : sess.accountabilityDelta}
                          </span>
                        )}
                        {sess.impulseControlDelta !== 0 && (
                          <span style={{ color: sess.impulseControlDelta > 0 ? '#4ce06c' : '#ff6b7a' }}>
                            Imp: {sess.impulseControlDelta > 0 ? `+${sess.impulseControlDelta}` : sess.impulseControlDelta}
                          </span>
                        )}
                        {sess.cooperationDelta !== 0 && (
                          <span style={{ color: sess.cooperationDelta > 0 ? '#4ce06c' : '#ff6b7a' }}>
                            Coop: {sess.cooperationDelta > 0 ? `+${sess.cooperationDelta}` : sess.cooperationDelta}
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '4px' }}>
                        <span>Staff: {characters.find((c: Character) => c.id === sess.conductedBy)?.name || sess.conductedBy}</span>
                        <span>{sess.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initiate Plan Modal */}
      {isCreateModalOpen && selectedChar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel art-deco-border" style={{ width: '90%', maxWidth: '480px', padding: '24px' }}>
            <h2 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px' }}>
              Initiate Rehabilitation
            </h2>
            <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Initialize rehabilitation parameters for <strong>{selectedChar.name}</strong>. Core metrics will start at 30% baseline.
              </p>
              
              <div>
                <label htmlFor="rehab-goals">Personal Goals / Milestones (One per line)</label>
                <textarea 
                  id="rehab-goals" 
                  rows={2} 
                  value={goalsInput} 
                  onChange={(e) => setGoalsInput(e.target.value)} 
                  style={{ width: '100%' }} 
                  placeholder="e.g. Apologize to Husk&#10;Reduce substance intake..."
                />
              </div>

              <div>
                <label htmlFor="rehab-obstacles">Core Obstacles / Challenges (One per line)</label>
                <textarea 
                  id="rehab-obstacles" 
                  rows={2} 
                  value={obstaclesInput} 
                  onChange={(e) => setObstaclesInput(e.target.value)} 
                  style={{ width: '100%' }} 
                  placeholder="e.g. Coercive contracts with Overlords&#10;Insecurity..."
                />
              </div>

              <div>
                <label htmlFor="rehab-triggers">Relapse Triggers (One per line)</label>
                <textarea 
                  id="rehab-triggers" 
                  rows={2} 
                  value={triggersInput} 
                  onChange={(e) => setTriggersInput(e.target.value)} 
                  style={{ width: '100%' }} 
                  placeholder="e.g. Mentions of Valentino&#10;Physical threats..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)} id="cancel-rehab-init-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-rehab-init-btn">
                  Launch Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Session Modal (Dialogue Simulator Wizard) */}
      {isSessionModalOpen && selectedPlan && selectedChar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel art-deco-border" style={{ width: '90%', maxWidth: '620px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <h2 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Log Session: {selectedChar.name}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Step {sessionStep} of 2
              </span>
            </h2>

            {/* STEP 1: INITIAL DETAILS SETUP */}
            {sessionStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label htmlFor="sess-type">Session Category</label>
                    <select 
                      id="sess-type" 
                      value={sessionType} 
                      onChange={(e) => setSessionType(e.target.value as SessionType)}
                      style={{ width: '100%' }}
                    >
                      <option value="empathy_workshop">Empathy Workshop</option>
                      <option value="accountability_session">Accountability Session</option>
                      <option value="conflict_resolution">Conflict Resolution</option>
                      <option value="trust_building">Trust Building Exercise</option>
                      <option value="public_apology">Public Apology</option>
                      <option value="group_activity">Group Activity</option>
                      <option value="hotel_service">Hotel Duty / Service</option>
                      <option value="therapy_like_checkin">Bar Check-in (Diagnostics)</option>
                      <option value="custom">Custom Session</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sess-conducted">Conducted By</label>
                    <select 
                      id="sess-conducted" 
                      value={sessionConductedBy} 
                      onChange={(e) => {
                        setSessionConductedBy(e.target.value);
                        // Auto switch type to bar checkin if Husk is chosen
                        if (e.target.value === 'husk') {
                          setSessionType('therapy_like_checkin');
                        }
                      }}
                      style={{ width: '100%' }}
                    >
                      {staffMembers.map((staff: Character) => (
                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="sess-summary">Pre-Session Context (Optional Notes)</label>
                  <textarea 
                    id="sess-summary" 
                    rows={2} 
                    value={sessionSummary} 
                    onChange={(e) => setSessionSummary(e.target.value)} 
                    style={{ width: '100%' }} 
                    placeholder="e.g. Session planned after incident. Focus will be on accountability."
                  />
                </div>

                <div style={{ padding: '16px', backgroundColor: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '6px' }}>
                  <h4 style={{ color: 'var(--color-gold)', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                    Visual Check-in Simulator
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Proceeding will launch the dialogue tree window. You will choose Charlie's or Husk's check-in responses, and watch the resident's stats update in real-time.
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsSessionModalOpen(false)}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => {
                      if (!sessionSummary) {
                        setSessionSummary(`${sessionType.replace('_', ' ')} conducted by ${characters.find((c: Character) => c.id === sessionConductedBy)?.name || sessionConductedBy}`);
                      }
                      setSessionStep(2);
                    }}
                  >
                    Launch Check-in Simulation →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DIALOGUE WORKSHOP SIMULATION */}
            {sessionStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Visual Backdrop Frame */}
                <div 
                  style={{
                    height: '240px',
                    backgroundImage: `linear-gradient(rgba(12, 8, 9, 0.2), rgba(12, 8, 9, 0.95)), url(${sessionConductedBy === 'husk' ? "'/assets/hotel_bar.png'" : "'/assets/hotel_lobby.png'"})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid var(--border-gold-dark)',
                    borderRadius: 'var(--radius-md)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '16px'
                  }}
                >
                  {/* Counselor Crest & Dialogue */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div className="crest-avatar" style={{ width: '32px', height: '32px', flexShrink: 0, border: '2px solid var(--color-gold)' }}>
                      {sessionConductedBy === 'charlie' ? 'CM' : sessionConductedBy === 'husk' ? 'HK' : 'SF'}
                    </div>
                    <div className="dialogue-bubble" style={{ fontSize: '0.8rem', padding: '8px 12px', flex: 1, backgroundColor: 'rgba(28, 17, 19, 0.9)' }}>
                      {dialogueLog ? dialogueLog.charSpeech : `Hi, ${selectedChar.name}! Let's talk about your progress. I want to discuss something important.`}
                    </div>
                  </div>

                  {/* Resident Crest & Response */}
                  {dialogueLog && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', alignSelf: 'flex-end', width: '80%' }}>
                      <div className="dialogue-bubble" style={{ fontSize: '0.8rem', padding: '8px 12px', flex: 1, backgroundColor: 'rgba(20, 13, 14, 0.95)', border: '1px solid var(--color-gold)' }}>
                        {dialogueLog.residentSpeech}
                      </div>
                      <div className="crest-avatar" style={{ width: '32px', height: '32px', flexShrink: 0, backgroundColor: 'var(--color-primary-dark)', color: 'var(--color-gold)', border: '2px solid var(--color-primary)' }}>
                        {selectedChar.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Choices Row / Conclude Pane */}
                {!selectedDialoguePath ? (
                  <div>
                    <label style={{ marginBottom: '8px' }}>Select Counseling Dialogue Focus:</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(() => {
                        // Options generator
                        const getOpts = (resId: string, cond: string) => {
                          const isAngel = resId === 'angeldust';
                          const isPentious = resId === 'sirpentious';

                          if (cond === 'husk') {
                            return [
                              {
                                id: 'bar_therapy',
                                label: 'Husk Check-in: "Listen kid, you don\'t have to keep drinking the poison."',
                                charSpeech: "Look, I've lost my soul, you've lost yours. We're all in the dirt. But you don't have to keep drinking the poison. Let's dump the junk.",
                                responseText: isAngel 
                                  ? "Husk... you actually get it. No fake smiles. Fine, I'll dump the pills for tonight. Give me a Shirley Temple." 
                                  : isPentious
                                  ? "You think a simple bartender can understand my villainy?! ...Wait, this mocktail tastes like... victory? Refill, please!"
                                  : "Thanks, bartender. Sometimes a quiet drink and a real conversation is all a sinner needs.",
                                deltas: { empathy: 5, accountability: 5, impulse: 15, cooperation: 5 },
                                logText: "Husk served mocktails. Resident relaxed and shared coping notes."
                              }
                            ];
                          } else {
                            return [
                              {
                                id: 'empathy',
                                label: 'Charlie Empathy Focus: "Let\'s share our feelings and trust each other!"',
                                charSpeech: "I know it's scary to open up, but sharing our feelings makes us stronger. How do you feel about those you've hurt?",
                                responseText: isAngel
                                  ? "Feelings? Honey, I get paid to look good, not to feel. But... I guess Vaggie has a point sometimes. She doesn't take my crap."
                                  : isPentious
                                  ? "Feelings?! I am a creature of cold, steel malice! But... if you insist, I do feel slightly bad when my egg bois get squished..."
                                  : "It's difficult to say. Groundwork is hard, but talking helps, I suppose.",
                                deltas: { empathy: 12, accountability: 4, impulse: 0, cooperation: 8 },
                                logText: "Charlie conducted an empathy check-in. Resident showed moral remorse."
                              },
                              {
                                id: 'accountability',
                                label: 'Charlie Accountability Focus: "Actions have consequences. We must face them."',
                                charSpeech: "Every deal we make binds us. We have to take responsibility for our actions to redeem ourselves.",
                                responseText: isAngel
                                  ? "Responsibility? Val owns my soul, Charlie. Taking responsibility just gets me beaten. But I'll follow hotel rules..."
                                  : isPentious
                                  ? "A mastermind always takes credit for his misdeeds! I did construct that death laser, and I shall build the repair beams next!"
                                  : "I understand. Rules are rules for a reason. I'll make sure to follow the guidelines.",
                                deltas: { empathy: 4, accountability: 12, impulse: 5, cooperation: 8 },
                                logText: "Charlie pushed accountability rules. Resident confirmed guidelines compliance."
                              }
                            ];
                          }
                        };

                        const options = getOpts(selectedChar.id, sessionConductedBy);

                        return options.map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            className="btn btn-secondary"
                            style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.85rem' }}
                            onClick={() => {
                              setSelectedDialoguePath(opt.id);
                              setDialogueLog({
                                charSpeech: opt.charSpeech,
                                residentSpeech: opt.responseText
                              });
                              setDeltaEmpathy(opt.deltas.empathy);
                              setDeltaAccountability(opt.deltas.accountability);
                              setDeltaImpulse(opt.deltas.impulse);
                              setDeltaCooperation(opt.deltas.cooperation);
                              setSessionSummary(prev => prev + (prev ? ' - ' : '') + opt.logText);
                            }}
                          >
                            {opt.label}
                          </button>
                        ));
                      })()}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px', border: '1px dashed var(--color-gold-dark)', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <h4 style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} />
                      Moral Parameter Changes Applied
                    </h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', fontSize: '0.8rem', textAlign: 'center', marginBottom: '12px' }}>
                      <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.7rem' }}>Empathy</span>
                        <strong style={{ color: '#4ce06c', fontSize: '1.1rem' }}>+{deltaEmpathy}</strong>
                      </div>
                      <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.7rem' }}>Accountability</span>
                        <strong style={{ color: '#4ce06c', fontSize: '1.1rem' }}>+{deltaAccountability}</strong>
                      </div>
                      <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.7rem' }}>Impulse Control</span>
                        <strong style={{ color: '#4ce06c', fontSize: '1.1rem' }}>+{deltaImpulse}</strong>
                      </div>
                      <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.7rem' }}>Cooperation</span>
                        <strong style={{ color: '#4ce06c', fontSize: '1.1rem' }}>+{deltaCooperation}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => {
                          setSelectedDialoguePath(null);
                          setDialogueLog(null);
                          setDeltaEmpathy(0);
                          setDeltaAccountability(0);
                          setDeltaImpulse(0);
                          setDeltaCooperation(0);
                        }}
                      >
                        ← Back to Themes
                      </button>
                      
                      <button 
                        type="button" 
                        className="btn btn-primary" 
                        style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                        onClick={() => handleLogSession()}
                      >
                        Conclude & Record Session Log
                      </button>
                    </div>
                  </div>
                )}

                {/* Conclude Actions for step 2 footer if not choice made */}
                {!selectedDialoguePath && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '4px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setSessionStep(1)}>
                      ← Back to Setup
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsSessionModalOpen(false)}>
                      Cancel
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
