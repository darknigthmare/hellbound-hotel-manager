import React, { useState } from 'react';
import { ShieldAlert, Plus, Calendar, Users, Info, CheckCircle } from 'lucide-react';
import { db } from '../db/localDb';
import { RulesEngine } from '../lib/rules-engine';
import { Incident, Character, Room, IncidentType, IncidentSeverity, IncidentStatus, DatabaseState } from '../types';
import { useDialogFocus } from '../components/useDialogFocus';

interface IncidentsProps {
  state: DatabaseState;
  onStateChange: () => void;
  searchQuery: string;
}

const INCIDENT_RECORDED_IMPACTS: Record<IncidentSeverity, { reputation: number; trust: number }> = {
  low: { reputation: -2, trust: -1 },
  medium: { reputation: -5, trust: -5 },
  high: { reputation: -10, trust: -10 },
  crisis: { reputation: -25, trust: -20 }
};

export const Incidents: React.FC<IncidentsProps> = ({ state, onStateChange, searchQuery }) => {
  const { incidents, characters, rooms } = state;

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form Fields
  const [formLocation, setFormLocation] = useState('');
  const [formInvolved, setFormInvolved] = useState<string[]>([]);
  const [formType, setFormType] = useState<IncidentType>('violence');
  const [formSeverity, setFormSeverity] = useState<IncidentSeverity>('medium');
  const [formSummary, setFormSummary] = useState('');
  const [formConsequences, setFormConsequences] = useState('');
  const [formRepairCost, setFormRepairCost] = useState(0);
  const [formActionTaken, setFormActionTaken] = useState('');
  const [formStatus, setFormStatus] = useState<IncidentStatus>('open');
  const [linkedRoomNumber, setLinkedRoomNumber] = useState('');
  const modalRef = useDialogFocus(isModalOpen, () => setIsModalOpen(false), '#inc-location');

  // Handle Multi-select characters
  const handleInvolvedToggle = (charId: string) => {
    if (formInvolved.includes(charId)) {
      setFormInvolved(formInvolved.filter(id => id !== charId));
    } else {
      setFormInvolved([...formInvolved, charId]);
    }
  };

  // Handle Save
  const handleSaveIncident = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formLocation.trim()) {
      setValidationError('Incident location is required.');
      return;
    }
    if (!formSummary.trim()) {
      setValidationError('Brief summary description is required.');
      return;
    }

    const recordedImpact = INCIDENT_RECORDED_IMPACTS[formSeverity];
    const normalizedRepairCost = Math.max(0, formRepairCost);
    const newIncident: Incident = {
      id: `inc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: `Campaign Day ${(state.gameplayMeta || db.getGameplayMeta()).campaignDay}`,
      location: formLocation.trim(),
      residentsInvolved: formInvolved,
      type: formType,
      severity: formSeverity,
      summary: formSummary.trim(),
      consequences: formConsequences.trim(),
      repairCost: normalizedRepairCost,
      reputationImpact: recordedImpact.reputation,
      trustImpact: recordedImpact.trust,
      actionTaken: formActionTaken.trim(),
      status: formStatus,
      loreLink: null,
      tags: [formType, formSeverity]
    };

    const saved = db.transaction('INCIDENT_REPORTED', (draft) => {
      if (draft.incidents.some(incident => incident.id === newIncident.id)) throw new Error('Incident identifier collision.');
      draft.reputation = RulesEngine.calculateIncidentImpact(newIncident, draft.reputation);
      if (linkedRoomNumber !== '') {
        const room = draft.rooms.find(candidate => candidate.number === linkedRoomNumber);
        if (!room) throw new Error('Linked room no longer exists.');
        room.status = 'damaged';
        room.repairCost += normalizedRepairCost;
        room.maintenanceNotes = `${room.maintenanceNotes}\nDAMAGED in incident on ${newIncident.date}. Summary: ${newIncident.summary}`;
      } else if (normalizedRepairCost > 0) {
        draft.resourceLedger.push({
          id: `inc_rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          date: newIncident.date,
          type: 'expense',
          category: 'incident',
          amount: normalizedRepairCost,
          description: `Immediate security/structural response for incident at ${newIncident.location}`
        });
      }
      if (formType === 'relapse' || formType === 'violence') {
        for (const characterId of formInvolved) {
          const plan = draft.rehabilitationPlans.find(candidate => candidate.characterId === characterId);
          const character = draft.characters.find(candidate => candidate.id === characterId);
          if (!plan || !character || plan.isRedeemedConfirmed) continue;
          plan.impulseControlScore = Math.max(0, plan.impulseControlScore - (formType === 'relapse' ? 8 : 5));
          plan.cooperationScore = Math.max(0, plan.cooperationScore - (formType === 'relapse' ? 3 : 1));
          character.rehabProgress = RulesEngine.calculateRehabilitationProgress(plan);
        }
      }
      draft.incidents.push(newIncident);
    }, {
      action: 'INCIDENT_REPORTED',
      details: `${formSeverity.toUpperCase()} ${formType} incident logged at ${newIncident.location}.`
    });
    if (!saved) {
      setValidationError(db.getStorageStatus().lastError?.message || 'Incident could not be recorded atomically.');
      return;
    }
    setIsModalOpen(false);
    onStateChange();
  };

  const handleResolveIncident = (inc: Incident, resolutionDetails: string) => {
    const actionTaken = resolutionDetails.trim() || 'Resolved by staff.';
    const resolved = db.transaction('INCIDENT_RESOLVED', (draft) => {
      const current = draft.incidents.find(candidate => candidate.id === inc.id);
      if (!current || current.status === 'resolved' || current.status === 'archived' || draft.gameplayMeta!.resolvedIncidentIds.includes(inc.id)) {
        throw new Error('This incident was already resolved; recovery cannot be applied twice.');
      }
      current.status = 'resolved';
      current.actionTaken = actionTaken;
      current.resolvedDay = draft.gameplayMeta!.campaignDay;
      draft.reputation = RulesEngine.calculateIncidentResolutionImpact(current, draft.reputation);
      draft.gameplayMeta!.resolvedIncidentIds.push(current.id);
    }, {
      action: 'INCIDENT_RESOLVED',
      details: `Incident ${inc.id} resolved: ${actionTaken}`
    });
    if (!resolved) {
      window.alert(db.getStorageStatus().lastError?.message || 'Incident resolution failed.');
      return;
    }
    onStateChange();
  };

  // Filter list
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
  const filteredIncidents = incidents.filter((inc: Incident) => {
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && inc.type !== typeFilter) return false;
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    const involvedNames = inc.residentsInvolved
      .map((id) => characters.find((character: Character) => character.id === id)?.name ?? id)
      .join(' ');
    if (normalizedSearch && !`${inc.location} ${inc.summary} ${inc.type} ${inc.status} ${inc.severity} ${inc.consequences} ${inc.actionTaken} ${involvedNames}`.toLocaleLowerCase().includes(normalizedSearch)) return false;
    return true;
  });

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Security Incident Center</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Document containment events, property damages, relapses, and media smear campaigns.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setFormLocation('');
          setFormInvolved([]);
          setFormType('violence');
          setFormSeverity('medium');
          setFormSummary('');
          setFormConsequences('');
          setFormRepairCost(0);
          setFormActionTaken('');
          setFormStatus('open');
          setLinkedRoomNumber('');
          setValidationError(null);
          setIsModalOpen(true);
        }} id="log-incident-btn">
          <Plus size={16} />
          Report Security Incident
        </button>
      </div>

      {/* Filter Row */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '16px', 
          marginBottom: '20px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '16px',
          alignItems: 'center',
          backgroundColor: 'rgba(28, 17, 19, 0.4)'
        }}
      >
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label htmlFor="inc-sev-filter">Filter Severity</label>
          <select 
            id="inc-sev-filter" 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="all">All Severities</option>
            <option value="low">Low Impact</option>
            <option value="medium">Medium</option>
            <option value="high">High Alert</option>
            <option value="crisis">Crisis / Breach</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label htmlFor="inc-type-filter">Filter Category</label>
          <select 
            id="inc-type-filter" 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="all">All Categories</option>
            <option value="violence">Violence / Brawls</option>
            <option value="property_damage">Property Damage</option>
            <option value="media_scandal">Media Scandal</option>
            <option value="deal_contract">Soul Deal Interferences</option>
            <option value="heaven_threat">Heaven Threats</option>
            <option value="overlord_interference">Overlord Interferences</option>
            <option value="staff_conflict">Internal Staff Conflict</option>
            <option value="relapse">Relapses</option>
            <option value="sabotage">Sabotage</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label htmlFor="inc-status-filter">Incident Status</label>
          <select 
            id="inc-status-filter" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open / Uncontrolled</option>
            <option value="contained">Contained</option>
            <option value="resolved">Resolved</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Incident List */}
      {filteredIncidents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Info size={40} style={{ color: 'var(--color-gold-dark)', marginBottom: '12px' }} />
          <h3>No incident reports found matching criteria.</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredIncidents.map((inc: Incident) => {
            const involvedNames = inc.residentsInvolved
              .map(id => characters.find((c: Character) => c.id === id)?.name || id)
              .join(', ');

            const isResolved = inc.status === 'resolved' || inc.status === 'archived';

            return (
              <div 
                key={inc.id} 
                id={`incident-card-${inc.id}`}
                className="glass-panel animate-fade-in"
                style={{ 
                  padding: '20px',
                  borderLeft: `5px solid ${
                    inc.severity === 'crisis' ? 'var(--status-catastrophic)' :
                    inc.severity === 'high' ? 'var(--status-high)' :
                    inc.severity === 'medium' ? 'var(--status-medium)' :
                    'var(--status-low)'
                  }`
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-gold)' }}>
                      Incident in {inc.location}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {inc.date}
                      </span>
                      <span>•</span>
                      <span style={{ textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-primary-hover)' }}>
                        Category: {inc.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '3px 8px', 
                      borderRadius: '3px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'var(--color-text-main)'
                    }}>
                      Severity: {inc.severity}
                    </span>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      padding: '3px 8px', 
                      borderRadius: '3px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      backgroundColor: isResolved ? 'rgba(40,167,69,0.15)' : 'rgba(253,126,20,0.15)',
                      color: isResolved ? '#4ce06c' : '#fca34d'
                    }}>
                      {inc.status}
                    </span>
                  </div>
                </div>

                {/* Details layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px', margin: '12px 0', fontSize: '0.85rem' }}>
                  <div>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: 1.5, marginBottom: '8px' }}>
                      <strong>Summary:</strong> {inc.summary}
                    </p>
                    {inc.consequences && (
                      <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '8px' }}>
                        <strong>Consequences:</strong> {inc.consequences}
                      </p>
                    )}
                    {inc.actionTaken && (
                      <p style={{ color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                        <strong>Staff Action Log:</strong> <span style={{ color: 'var(--color-gold)' }}>{inc.actionTaken}</span>
                      </p>
                    )}
                  </div>

                  <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '8px', height: 'fit-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <Users size={14} />
                      <span>Involved Parties:</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-main)', fontWeight: 600 }}>
                      {involvedNames || 'None logged'}
                    </span>

                    {inc.repairCost > 0 && (
                      <div style={{ marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Repair Cost:</span>
                        <span style={{ fontSize: '0.85rem', color: '#ff6b7a', fontWeight: 'bold' }}>{inc.repairCost} HN</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action button if open */}
                {!isResolved && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '10px' }}>
                    <button 
                      className="btn btn-gold" 
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      onClick={() => {
                        const action = window.prompt(`Log incident resolution action for ${inc.location}:`);
                        if (action !== null) {
                          handleResolveIncident(inc, action);
                        }
                      }}
                      id={`resolve-${inc.id}`}
                    >
                      <CheckCircle size={12} />
                      Log Containment & Resolve
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Report Incident Modal */}
      {isModalOpen && (
        <div onMouseDown={(event) => { if (event.target === event.currentTarget) setIsModalOpen(false); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div ref={modalRef} tabIndex={-1} className="glass-panel art-deco-border" role="dialog" aria-modal="true" aria-labelledby="incident-dialog-title" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', margin: 'auto' }}>
            <h2 id="incident-dialog-title" style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px' }}>
              Report Security Breach / Incident
            </h2>

            {validationError && (
              <div role="alert" style={{ backgroundColor: 'rgba(220, 53, 69, 0.15)', border: '1px solid var(--status-high)', color: '#ff6b7a', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                {validationError}
              </div>
            )}

            <form onSubmit={handleSaveIncident} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="inc-location">Location *</label>
                  <input 
                    type="text" 
                    id="inc-location" 
                    value={formLocation} 
                    onChange={(e) => setFormLocation(e.target.value)} 
                    style={{ width: '100%' }} 
                    placeholder="e.g. Lobby gates, Front Courtyard" 
                  />
                </div>

                <div>
                  <label htmlFor="inc-type">Incident Category</label>
                  <select 
                    id="inc-type" 
                    value={formType} 
                    onChange={(e) => setFormType(e.target.value as IncidentType)}
                    style={{ width: '100%' }}
                  >
                    <option value="violence">Violence / Brawl</option>
                    <option value="property_damage">Property Damage</option>
                    <option value="media_scandal">Media Scandal / Smear</option>
                    <option value="deal_contract">Soul Deal Interference</option>
                    <option value="heaven_threat">Heaven Extermination Watch</option>
                    <option value="overlord_interference">Overlord Infringement</option>
                    <option value="staff_conflict">Staff Infidelity / Conflict</option>
                    <option value="relapse">Resident Relapse</option>
                    <option value="sabotage">Sabotage</option>
                    <option value="unknown">Unknown / Anomaly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="inc-severity">Severity Rating</label>
                  <select 
                    id="inc-severity" 
                    value={formSeverity} 
                    onChange={(e) => setFormSeverity(e.target.value as IncidentSeverity)}
                    style={{ width: '100%' }}
                  >
                    <option value="low">Low Impact (Minor scuffle)</option>
                    <option value="medium">Medium (Lobby damages)</option>
                    <option value="high">High Alert (Exorcist surveillance)</option>
                    <option value="crisis">Crisis / Breach (Overlord attack)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="inc-status">Containment Status</label>
                  <select 
                    id="inc-status" 
                    value={formStatus} 
                    onChange={(e) => setFormStatus(e.target.value as IncidentStatus)}
                    style={{ width: '100%' }}
                  >
                    <option value="open">Open / Active</option>
                    <option value="contained">Contained</option>
                  </select>
                </div>
              </div>

              {/* Linked room damage */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="link-room">Link to Room (For Property Damage)</label>
                  <select 
                    id="link-room" 
                    value={linkedRoomNumber} 
                    onChange={(e) => setLinkedRoomNumber(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="">No room linked</option>
                    {rooms.map((r: Room) => (
                      <option key={r.number} value={r.number}>
                        Ward {r.number} ({r.type} - Status: {r.status})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="inc-repair">Immediate Repair Costs (HN)</label>
                  <input 
                    type="number" 
                    id="inc-repair" 
                    min="0"
                    value={formRepairCost} 
                    onChange={(e) => setFormRepairCost(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width: '100%' }} 
                  />
                </div>
              </div>

              <div>
                <label>Involved Characters (Select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '100px', overflowY: 'auto', padding: '8px', border: '1px solid var(--color-primary-light)', borderRadius: '4px', backgroundColor: 'var(--bg-main)' }}>
                  {characters.map((c: Character) => (
                    <button 
                      key={c.id} 
                      type="button"
                      onClick={() => handleInvolvedToggle(c.id)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        borderRadius: '3px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: formInvolved.includes(c.id) ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                        color: formInvolved.includes(c.id) ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                        transition: 'all var(--transition-fast)'
                      }}
                      className="involved-char-pill"
                      id={`pill-${c.id}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="inc-summary">Brief Summary (Clinical / Admin style) *</label>
                <textarea 
                  id="inc-summary" 
                  rows={2} 
                  value={formSummary} 
                  onChange={(e) => setFormSummary(e.target.value)} 
                  style={{ width: '100%', resize: 'vertical' }} 
                  placeholder="Provide a brief admin description of the incident events..." 
                />
              </div>

              <div>
                <label htmlFor="inc-consequence">Consequences & Damages</label>
                <textarea 
                  id="inc-consequence" 
                  rows={2} 
                  value={formConsequences} 
                  onChange={(e) => setFormConsequences(e.target.value)} 
                  style={{ width: '100%', resize: 'vertical' }} 
                  placeholder="Describe immediate structural, PR, or logistical damages..." 
                />
              </div>

              <div>
                <label htmlFor="inc-action">Staff Containment / Actions Taken</label>
                <textarea 
                  id="inc-action" 
                  rows={2} 
                  value={formActionTaken} 
                  onChange={(e) => setFormActionTaken(e.target.value)} 
                  style={{ width: '100%', resize: 'vertical' }} 
                  placeholder="Details of actions taken by Vaggie, Husk, or other staff to resolve the breach..." 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} id="cancel-inc-modal-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-inc-modal-btn">
                  Log Incident report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
