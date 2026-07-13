import React, { useEffect, useRef, useState } from 'react';
import { HeartHandshake, Plus, Award, ShieldAlert, Sparkles, Smile, AlertCircle } from 'lucide-react';
import { db } from '../db/localDb';
import { RulesEngine } from '../lib/rules-engine';
import { RehabilitationPlan, RehabilitationSession, Character, Incident, DatabaseState } from '../types';

interface RehabilitationProps {
  state: DatabaseState;
  onStateChange: () => void;
  targetCharacterId?: string | null;
  onClearTargetId: () => void;
}

const MAX_DAILY_SESSIONS = 2;

const REHAB_PLAN_TEMPLATES = [
  {
    id: 'safety_stabilization',
    name: 'Simulation AU · Safety & Stabilization',
    description: 'Trauma-informed intake centered on consent, boundaries, and resident-chosen support.',
    goals: ['Name two resident-chosen safety boundaries', 'Build a voluntary support contact plan', 'Complete one trust-building check-in'],
    obstacles: ['Low trust in institutions', 'Difficulty feeling safe during structured activities'],
    triggers: ['Unexpected physical proximity', 'Loss of control over a conversation']
  },
  {
    id: 'coping_regulation',
    name: 'Simulation AU · Coping & Regulation',
    description: 'Practical rehearsal for stress escalation, routines, and safer replacement behaviors.',
    goals: ['Rehearse a three-step coping plan', 'Identify two early warning signs', 'Complete one supported high-pressure task'],
    obstacles: ['Impulsive responses under stress', 'Difficulty maintaining predictable routines'],
    triggers: ['Public embarrassment', 'Sudden schedule changes']
  },
  {
    id: 'restorative_repair',
    name: 'Simulation AU · Restorative Repair',
    description: 'Separates harm suffered from harm chosen and focuses only on specific, consent-based repair.',
    goals: ['Name one specific harm personally caused', 'Ask what repair the affected person would accept', 'Complete an agreed repair without demanding forgiveness'],
    obstacles: ['Defensiveness when discussing chosen actions', 'Fear that accountability means accepting blame for victimization'],
    triggers: ['Broad blame statements', 'Conversations that mix abuse suffered with harm caused']
  },
  {
    id: 'community_belonging',
    name: 'Simulation AU · Community & Belonging',
    description: 'Strength-based plan for applicants who need connection and a bounded role in hotel life.',
    goals: ['Choose one safe group activity', 'Complete one time-limited hotel contribution', 'Identify two reciprocal support connections'],
    obstacles: ['Isolation', 'Overcommitting to gain approval'],
    triggers: ['Social rejection', 'Unclear expectations']
  }
] as const;

export const Rehabilitation: React.FC<RehabilitationProps> = ({ 
  state, 
  onStateChange, 
  targetCharacterId, 
  onClearTargetId 
}) => {
  const { characters, rehabilitationPlans, rehabilitationSessions, incidents, relationships } = state;

  // Active resident selector
  const residents = characters.filter((c: Character) => c.status === 'resident' || c.status === 'applicant');
  
  // Staff members who can conduct sessions
  const staffMembers = characters.filter((c: Character) => c.status === 'staff');
  
  const [activeCharId, setActiveCharId] = useState<string>(
    targetCharacterId || (residents[0]?.id || '')
  );

  // Clear target ID from navigation so we can select freely
  useEffect(() => {
    if (!targetCharacterId) return;
    const timer = window.setTimeout(() => {
      setActiveCharId(targetCharacterId);
      onClearTargetId();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [targetCharacterId, onClearTargetId]);

  // Selected plan and session logs
  const selectedChar = characters.find((c: Character) => c.id === activeCharId);
  const selectableProfiles = selectedChar?.status === 'redeemed' && !residents.some((c: Character) => c.id === selectedChar.id)
    ? [...residents, selectedChar]
    : residents;
  const selectedPlan = rehabilitationPlans.find((p: RehabilitationPlan) => p.characterId === activeCharId);
  const sessions = selectedPlan 
    ? rehabilitationSessions.filter((s: RehabilitationSession) => s.planId === selectedPlan.id)
    : [];
  const gameplayMeta = state.gameplayMeta || db.getGameplayMeta();
  const campaignDay = gameplayMeta.campaignDay;
  const sessionCounterKey = selectedPlan ? `${campaignDay}:${selectedPlan.id}` : '';
  const sessionsToday = sessionCounterKey ? (gameplayMeta.dailySessionCounts[sessionCounterKey] || 0) : 0;
  const dailySessionLimitReached = sessionsToday >= MAX_DAILY_SESSIONS;

  const baseRedemptionEligibility = selectedPlan
    ? RulesEngine.evaluateRedemptionEligibility(selectedPlan, sessions)
    : null;
  const hasBlockingIncident = selectedChar
    ? incidents.some((incident: Incident) => (
        (incident.status === 'open' || incident.status === 'contained')
        && (
          incident.type === 'heaven_threat'
          || (
            incident.residentsInvolved.includes(selectedChar.id)
            && (
              incident.severity === 'high'
              || incident.severity === 'crisis'
              || incident.type === 'relapse'
              || incident.type === 'violence'
              || incident.type === 'deal_contract'
            )
          )
        )
      ))
    : false;
  const hasBindingRelationship = selectedChar
    ? relationships.some(relationship => relationship.type === 'contract_bound'
      && (relationship.charAId === selectedChar.id || relationship.charBId === selectedChar.id))
    : false;
  const redemptionReasons = [
    ...(baseRedemptionEligibility?.reasons || []),
    ...(selectedPlan?.isRedeemedConfirmed && selectedChar?.status !== 'redeemed' ? ['This plan is already marked as redeemed and needs an administrative state review.'] : []),
    ...(selectedChar && selectedChar.status !== 'resident' ? ['Only an admitted active resident can be considered for redemption.'] : []),
    ...(selectedChar && selectedChar.type !== 'sinner' ? ['Only a sinner soul is eligible for the hotel redemption protocol.'] : []),
    ...(selectedChar?.contracts.length ? ['Resolve all active binding contracts before celestial confirmation.'] : []),
    ...(hasBindingRelationship ? ['Resolve all contract-bound relationship records before celestial confirmation.'] : []),
    ...(hasBlockingIncident ? ['Resolve the active Heaven alert or all high-risk, violent, relapse, and contract incidents involving this resident.'] : [])
  ];
  const canConfirmRedemption = Boolean(
    selectedPlan
    && selectedChar
    && selectedChar.status === 'resident'
    && selectedChar.type === 'sinner'
    && selectedChar.contracts.length === 0
    && !hasBindingRelationship
    && baseRedemptionEligibility?.isEligible
    && !hasBlockingIncident
  );

  // Form: Create Plan state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [goalsInput, setGoalsInput] = useState('');
  const [obstaclesInput, setObstaclesInput] = useState('');
  const [triggersInput, setTriggersInput] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Form: Log Session state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionStep, setSessionStep] = useState<number>(1);
  const [selectedDialoguePath, setSelectedDialoguePath] = useState<string | null>(null);
  const [dialogueLog, setDialogueLog] = useState<{ charSpeech: string, residentSpeech: string } | null>(null);

  const [sessionSummary, setSessionSummary] = useState('');
  const [sessionConductedBy, setSessionConductedBy] = useState('charlie');
  const [deltaEmpathy, setDeltaEmpathy] = useState(0);
  const [deltaAccountability, setDeltaAccountability] = useState(0);
  const [deltaImpulse, setDeltaImpulse] = useState(0);
  const [deltaCooperation, setDeltaCooperation] = useState(0);
  const rehabGoalsRef = useRef<HTMLTextAreaElement>(null);
  const sessionConductorRef = useRef<HTMLSelectElement>(null);

  const openCreatePlan = () => {
    setSelectedTemplateId('');
    setGoalsInput('');
    setObstaclesInput('');
    setTriggersInput('');
    setIsCreateModalOpen(true);
  };

  const applyPlanTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = REHAB_PLAN_TEMPLATES.find(candidate => candidate.id === templateId);
    if (!template) return;
    setGoalsInput(template.goals.join('\n'));
    setObstaclesInput(template.obstacles.join('\n'));
    setTriggersInput(template.triggers.join('\n'));
  };

  useEffect(() => {
    if (!isCreateModalOpen && !isSessionModalOpen) return;
    if (isCreateModalOpen) rehabGoalsRef.current?.focus();
    if (isSessionModalOpen) sessionConductorRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsCreateModalOpen(false);
      setIsSessionModalOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isCreateModalOpen, isSessionModalOpen]);

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
      if (!db.saveRehabilitationPlan(updatedPlan)) {
        window.alert(db.getStorageStatus().lastError?.message || 'Notes could not be saved.');
        return;
      }
      setIsNotesEditing(false);
      onStateChange();
    }
  };

  const handleOpenSessionModal = () => {
    if (!selectedPlan || !selectedChar) return;
    if (selectedChar.status === 'redeemed' || selectedPlan.isRedeemedConfirmed) {
      window.alert('Redeemed records are read-only.');
      return;
    }
    if (dailySessionLimitReached) {
      window.alert(`Daily curriculum limit reached (${sessionsToday}/${MAX_DAILY_SESSIONS}).`);
      return;
    }
    setSessionStep(1);
    setSelectedDialoguePath(null);
    setDialogueLog(null);
    setIsSessionModalOpen(true);
  };

  // Create new Plan
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCharId) return;

    const goals = goalsInput.split('\n').map(g => g.trim()).filter(g => g.length > 0);
    if (goals.length < 2) {
      window.alert('A durable rehabilitation plan requires at least two concrete goals.');
      return;
    }

    const newPlan: RehabilitationPlan = {
      id: 'plan_' + activeCharId,
      characterId: activeCharId,
      goals,
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

    const saved = db.transaction('REHAB_PLAN_CREATE', (draft) => {
      if (draft.rehabilitationPlans.some(plan => plan.characterId === activeCharId)) {
        throw new Error('This resident already has a rehabilitation plan.');
      }
      const character = draft.characters.find(item => item.id === activeCharId);
      if (!character || (character.status !== 'resident' && character.status !== 'applicant')) {
        throw new Error('Only a resident or applicant can enter rehabilitation.');
      }
      draft.rehabilitationPlans.push(newPlan);
      character.rehabProgress = 30;
      character.rehabTracked = true;
    }, {
      action: 'REHAB_PLAN_CREATE',
      details: `Initialized a structured rehabilitation plan for ${selectedChar?.name || activeCharId}.`
    });
    if (!saved) {
      window.alert(db.getStorageStatus().lastError?.message || 'The rehabilitation plan could not be created.');
      return;
    }

    setIsCreateModalOpen(false);
    onStateChange();
  };

  // Log session
  const handleLogSession = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPlan || !selectedChar) return;

    if (selectedChar.status === 'redeemed' || selectedPlan.isRedeemedConfirmed) {
      window.alert('This resident is already redeemed. Their rehabilitation record is now read-only.');
      return;
    }

    if (sessionsToday >= MAX_DAILY_SESSIONS) {
      window.alert(`Daily curriculum limit reached (${MAX_DAILY_SESSIONS} sessions). Continue on the next day.`);
      return;
    }

    const approach = selectedDialoguePath
      ? RulesEngine.getCounselingApproaches(selectedChar, sessionConductedBy)
        .find(candidate => candidate.id === selectedDialoguePath)
      : undefined;
    if (!approach || approach.conductorId !== sessionConductedBy) {
      window.alert('Choose a valid counseling approach for the selected staff member.');
      return;
    }
    const supplyKind = sessionConductedBy === 'husk' ? 'bar' : 'food';
    const supplyName = sessionConductedBy === 'husk' ? 'bar supplies' : 'food and workshop supplies';
    const recorded = db.transaction('REHABILITATION_SESSION', (draft, inventory) => {
      const plan = draft.rehabilitationPlans.find(item => item.id === selectedPlan.id);
      const character = draft.characters.find(item => item.id === selectedChar.id);
      const conductor = draft.characters.find(item => item.id === sessionConductedBy && item.status === 'staff');
      if (!plan || !character || plan.isRedeemedConfirmed || character.status === 'redeemed') {
        throw new Error('The rehabilitation record is no longer active.');
      }
      if (!conductor) throw new Error('The selected counselor is no longer on active staff duty.');
      const meta = draft.gameplayMeta!;
      const counterKey = `${meta.campaignDay}:${plan.id}`;
      if ((meta.dailySessionCounts[counterKey] || 0) >= MAX_DAILY_SESSIONS) {
        throw new Error(`Daily curriculum limit reached for Campaign Day ${meta.campaignDay}.`);
      }
      const workload = draft.staffTasks
        .filter(task => task.assignedTo === sessionConductedBy && task.status !== 'completed' && task.status !== 'cancelled')
        .reduce((total, task) => total + task.mentalWorkload, meta.staffFatigue[sessionConductedBy] || 0);
      if (workload >= 10) throw new Error('The selected staff member is overloaded or fatigued.');
      if (inventory[supplyKind] < 1) throw new Error(`Insufficient ${supplyName}.`);

      inventory[supplyKind] -= 1;
      const sessionId = `sess_day${meta.campaignDay}_${plan.id}_${approach.id}`;
      if (draft.rehabilitationSessions.some(existing => existing.id === sessionId)) {
        throw new Error('This counseling session was already recorded.');
      }
      const session: RehabilitationSession = {
        id: sessionId,
        planId: plan.id,
        date: `Campaign Day ${meta.campaignDay}`,
        campaignDay: meta.campaignDay,
        approachId: selectedDialoguePath || undefined,
        type: approach.type,
        summary: sessionSummary.trim()
          ? `${sessionSummary.trim()} - ${approach.logText}`
          : approach.logText,
        empathyDelta: approach.deltas.empathy,
        accountabilityDelta: approach.deltas.accountability,
        impulseControlDelta: approach.deltas.impulse,
        cooperationDelta: approach.deltas.cooperation,
        conductedBy: sessionConductedBy
      };
      draft.rehabilitationSessions.push(session);
      plan.empathyScore = Math.min(100, plan.empathyScore + approach.deltas.empathy);
      plan.accountabilityScore = Math.min(100, plan.accountabilityScore + approach.deltas.accountability);
      plan.impulseControlScore = Math.min(100, plan.impulseControlScore + approach.deltas.impulse);
      plan.cooperationScore = Math.min(100, plan.cooperationScore + approach.deltas.cooperation);
      character.rehabProgress = RulesEngine.calculateRehabilitationProgress(plan);
      meta.dailySessionCounts[counterKey] = (meta.dailySessionCounts[counterKey] || 0) + 1;
      meta.staffFatigue[sessionConductedBy] = Math.min(100, (meta.staffFatigue[sessionConductedBy] || 0) + 1);
    }, {
      action: 'REHABILITATION_SESSION',
      details: `Completed ${approach.type} for ${selectedChar.name}; consumed 1 unit of ${supplyName}.`
    });
    if (!recorded) {
      window.alert(db.getStorageStatus().lastError?.message || 'The session could not be recorded atomically.');
      return;
    }

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

  const handleDeleteSession = () => {
    window.alert('Session records are immutable because their metric changes have already been applied. Add a corrective session instead of deleting history.');
  };

  // REDEMPTION TRIGGER
  const handleConfirmRedemption = () => {
    if (!selectedPlan || !selectedChar) return;

    if (!canConfirmRedemption) {
      window.alert(`Redemption requirements are not met:\n- ${redemptionReasons.join('\n- ')}`);
      return;
    }

    const consent = window.confirm(`CONFIRM CELESTIAL REDEMPTION: Are you sure you want to mark '${selectedChar.name}' as fully redeemed? Under the hotel protocols, this will update their status to 'redeemed', remove them from room registers, and trigger a public ascension event.`);
    if (!consent) return;

    const confirmed = db.transaction('SOUL_REDEMPTION', (draft) => {
      const character = draft.characters.find(item => item.id === selectedChar.id);
      const plan = draft.rehabilitationPlans.find(item => item.id === selectedPlan.id);
      if (!character || !plan || character.status !== 'resident' || character.type !== 'sinner' || character.contracts.length > 0) {
        throw new Error('The resident status or contract state changed before confirmation.');
      }
      const residentSessions = draft.rehabilitationSessions.filter(session => session.planId === plan.id);
      const eligibility = RulesEngine.evaluateRedemptionEligibility(plan, residentSessions);
      const blockingIncident = draft.incidents.some(incident => (
        (incident.status === 'open' || incident.status === 'contained')
        && (
          incident.type === 'heaven_threat'
          || (
            incident.residentsInvolved.includes(character.id)
            && (incident.severity === 'high' || incident.severity === 'crisis' || incident.type === 'relapse' || incident.type === 'violence' || incident.type === 'deal_contract')
          )
        )
      ));
      const bindingRelationship = draft.relationships.some(relationship => relationship.type === 'contract_bound'
        && (relationship.charAId === character.id || relationship.charBId === character.id));
      if (!eligibility.isEligible || blockingIncident || bindingRelationship) throw new Error('Redemption requirements are no longer satisfied.');
      const meta = draft.gameplayMeta!;
      if (meta.rewardedRedemptionIds.includes(character.id)) throw new Error('This redemption reward was already applied.');

      character.type = 'redeemed_soul';
      character.status = 'redeemed';
      character.role = 'external';
      character.riskLevel = 'low';
      character.rehabProgress = RulesEngine.calculateRehabilitationProgress(plan);
      character.rehabTracked = false;
      plan.isRedeemedConfirmed = true;
      draft.rooms = draft.rooms.map(room => {
        const occupantIds = room.occupantIds?.filter(id => id !== character.id);
        return {
          ...room,
          ...(room.occupantIds ? { occupantIds } : {}),
          occupantId: room.occupantId === character.id ? occupantIds?.[0] || null : room.occupantId
        };
      });
      draft.reputation = RulesEngine.calculateReputationEvent('proof_of_redemption', draft.reputation);
      meta.rewardedRedemptionIds.push(character.id);
      meta.completedMilestones.push(`redemption:${character.id}`);
    }, {
      action: 'SOUL_REDEMPTION',
      details: `Sinner '${selectedChar.name}' achieved celestial redemption; the exactly-once ascension reward was applied.`
    });
    if (!confirmed) {
      window.alert(db.getStorageStatus().lastError?.message || 'Redemption could not be confirmed atomically.');
      return;
    }
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
            {selectableProfiles.map((c: Character) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status === 'redeemed' ? 'redeemed record' : `${c.role} - Rehab: ${c.rehabProgress}%`})
              </option>
            ))}
          </select>
        </div>
        {activeCharId && !selectedPlan && selectedChar && (
          <button 
            className="btn btn-primary" 
            style={{ alignSelf: 'flex-end' }} 
            onClick={() => {
              openCreatePlan();
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
            onClick={openCreatePlan}
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
                  <button
                    className="btn btn-gold"
                    onClick={handleConfirmRedemption}
                    id="confirm-redemption-btn"
                    disabled={!canConfirmRedemption}
                    title={canConfirmRedemption ? 'All redemption requirements are met.' : redemptionReasons.join(' ')}
                  >
                    <Award size={16} />
                    Confirm Redemption
                  </button>
                ) : (
                  <span style={{ color: '#4ce06c', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} /> REDEEMED SOUL
                  </span>
                )}
              </div>

              {selectedChar.status !== 'redeemed' && redemptionReasons.length > 0 && (
                <div style={{ marginBottom: '16px', padding: '10px 12px', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '6px', backgroundColor: 'rgba(212,175,55,0.06)', fontSize: '0.75rem' }}>
                  <strong style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '4px' }}>Redemption review pending</strong>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--color-text-muted)' }}>
                    {redemptionReasons.map(reason => <li key={reason}>{reason}</li>)}
                  </ul>
                </div>
              )}

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
                onClick={handleOpenSessionModal}
                id="log-session-btn"
                disabled={selectedChar.status === 'redeemed' || dailySessionLimitReached}
                title={dailySessionLimitReached ? `Daily limit reached (${sessionsToday}/${MAX_DAILY_SESSIONS})` : 'Start a documented rehabilitation session'}
              >
                <Plus size={16} />
                Log Rehabilitation Session
              </button>
              <span style={{ display: 'block', marginTop: '6px', fontSize: '0.68rem', color: dailySessionLimitReached ? '#ff6b7a' : 'var(--color-text-muted)', textAlign: 'center' }}>
                Daily curriculum: {sessionsToday}/{MAX_DAILY_SESSIONS}. Sessions consume facility supplies and require available staff.
              </span>

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
                          onClick={handleDeleteSession}
                          style={{ background: 'none', border: 'none', color: '#ff6b7a', cursor: 'pointer' }}
                          title="Session history is immutable"
                          id={`delete-sess-${sess.id}`}
                        >
                          <ShieldAlert size={12} />
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
        <div onMouseDown={(event) => { if (event.target === event.currentTarget) setIsCreateModalOpen(false); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel art-deco-border" role="dialog" aria-modal="true" aria-labelledby="rehab-plan-dialog-title" style={{ width: '90%', maxWidth: '480px', padding: '24px' }}>
            <h2 id="rehab-plan-dialog-title" style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px' }}>
              Initiate Rehabilitation
            </h2>
            <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Initialize rehabilitation parameters for <strong>{selectedChar.name}</strong>. Core metrics will start at 30% baseline.
              </p>

              <div>
                <label htmlFor="rehab-template">Simulation AU Plan Template</label>
                <select
                  id="rehab-template"
                  value={selectedTemplateId}
                  onChange={(event) => applyPlanTemplate(event.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Write a custom plan</option>
                  {REHAB_PLAN_TEMPLATES.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
                <span style={{ display: 'block', marginTop: '4px', color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                  {REHAB_PLAN_TEMPLATES.find(template => template.id === selectedTemplateId)?.description
                    || 'Templates are non-canon starting points. Every field remains editable for a new applicant.'}
                </span>
              </div>
              
              <div>
                <label htmlFor="rehab-goals">Personal Goals / Milestones (One per line)</label>
                <textarea 
                  ref={rehabGoalsRef}
                  id="rehab-goals" 
                  rows={2} 
                  value={goalsInput} 
                  onChange={(e) => setGoalsInput(e.target.value)} 
                  style={{ width: '100%' }} 
                  placeholder="e.g. Name one support boundary&#10;Choose a manageable community contribution..."
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
        <div onMouseDown={(event) => { if (event.target === event.currentTarget) setIsSessionModalOpen(false); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel art-deco-border" role="dialog" aria-modal="true" aria-labelledby="rehab-session-dialog-title" style={{ width: '90%', maxWidth: '620px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <h2 id="rehab-session-dialog-title" style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    <label htmlFor="sess-derived-type">Recorded Session Category</label>
                    <input
                      id="sess-derived-type"
                      value={sessionConductedBy === 'husk' ? 'Bar check-in (derived)' : 'Derived from the dialogue focus'}
                      readOnly
                      aria-describedby="sess-derived-help"
                      style={{ width: '100%' }}
                    />
                    <span id="sess-derived-help" style={{ display: 'block', marginTop: '4px', fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                      The stored category and metric deltas are locked to the counseling choice, not typed manually.
                    </span>
                  </div>

                  <div>
                    <label htmlFor="sess-conducted">Conducted By</label>
                    <select 
                      ref={sessionConductorRef}
                      id="sess-conducted" 
                      value={sessionConductedBy} 
                      onChange={(e) => {
                        setSessionConductedBy(e.target.value);
                        setSelectedDialoguePath(null);
                        setDialogueLog(null);
                        setDeltaEmpathy(0);
                        setDeltaAccountability(0);
                        setDeltaImpulse(0);
                        setDeltaCooperation(0);
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
                    These dialogue trees are Simulation AU coaching scenarios, not canon scenes. Choose a trauma-informed or restorative approach and preview its gameplay effects.
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
                        setSessionSummary(`Documented check-in conducted by ${characters.find((c: Character) => c.id === sessionConductedBy)?.name || sessionConductedBy}`);
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
                      {RulesEngine.getCounselingApproaches(selectedChar, sessionConductedBy).map(approach => (
                        <button
                          key={approach.id}
                          type="button"
                          className="btn btn-secondary"
                          style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.85rem' }}
                          onClick={() => {
                            setSelectedDialoguePath(approach.id);
                            setDialogueLog({
                              charSpeech: approach.counselorSpeech,
                              residentSpeech: approach.residentSpeech
                            });
                            setDeltaEmpathy(approach.deltas.empathy);
                            setDeltaAccountability(approach.deltas.accountability);
                            setDeltaImpulse(approach.deltas.impulse);
                            setDeltaCooperation(approach.deltas.cooperation);
                          }}
                        >
                          {approach.label}
                        </button>
                      ))}
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
