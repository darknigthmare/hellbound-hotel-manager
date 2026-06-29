import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Users, 
  Bed, 
  TrendingUp, 
  Tv, 
  ShieldAlert, 
  Eye, 
  Play, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { db } from '../db/localDb';
import { RulesEngine } from '../lib/rules-engine';
import { DatabaseState, ReputationState } from '../types';

interface DashboardProps {
  state: DatabaseState;
  onStateChange: () => void;
  onNavigate: (view: any, targetId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, onStateChange, onNavigate }) => {
  const [tickerMessage, setTickerMessage] = useState<string>('All systems operational. Redeeming process active.');
  const [warnings, setWarnings] = useState<string[]>([]);

  // Destructure state
  const { characters, rooms, incidents, staffTasks, reputation, settings } = state;

  // Run security checks
  useEffect(() => {
    const safetyWarnings: string[] = [];
    
    // Check rooms for high-risk occupancy
    rooms.forEach(room => {
      if (room.occupantId) {
        const guest = characters.find(c => c.id === room.occupantId);
        if (guest) {
          const check = RulesEngine.validateRoomAssignment(room, guest);
          if (!check.isSafe && check.warning) {
            safetyWarnings.push(check.warning);
          }
        }
      }
    });

    // Check budget
    const totalExpenses = state.resourceLedger
      .filter(l => l.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = state.resourceLedger
      .filter(l => l.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    const currentBalance = totalIncome - totalExpenses;

    if (currentBalance < 0) {
      safetyWarnings.push('FINANCIAL CRISIS: Hotel bank ledger shows a negative balance. Secure emergency donations.');
    }

    // Check staff workload
    const activeStaff = characters.filter(c => c.status === 'staff');
    activeStaff.forEach(staff => {
      const staffTasksCount = staffTasks.filter(t => t.assignedTo === staff.id && t.status !== 'completed' && t.status !== 'cancelled').length;
      if (staffTasksCount >= 4) {
        safetyWarnings.push(`STAFF OVERLOAD: ${staff.name} is assigned to ${staffTasksCount} concurrent tasks. Mental load threshold exceeded.`);
      }
    });

    setWarnings(safetyWarnings);
  }, [rooms, characters, staffTasks, state.resourceLedger]);

  // Calculations
  const activeResidents = characters.filter(c => c.status === 'resident').length;
  const totalRoomsCount = rooms.length;
  const occupiedRoomsCount = rooms.filter(r => r.occupantId !== null).length;
  const occupancyRate = totalRoomsCount > 0 ? (occupiedRoomsCount / totalRoomsCount) * 100 : 0;
  
  const damagedRoomsCount = rooms.filter(r => r.status === 'damaged').length;
  const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'contained').length;
  const pendingTasks = staffTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;

  // Narrative event pool
  const triggerNarrativeEvent = () => {
    const events = [
      {
        title: 'New Sinner Intake',
        message: 'A chaotic sinner arrives at the lobby requesting a standard suite and promising to try "the trust exercises".',
        apply: (rep: ReputationState) => {
          rep.sinnerReputation = Math.min(100, rep.sinnerReputation + 5);
          rep.mediaChaos = Math.min(100, rep.mediaChaos + 3);
          return { text: 'New sinner arrived. Public interest increased.', rep };
        }
      },
      {
        title: 'Voxtek Smear Campaign',
        message: 'Vox coordinates a prime-time television broadcast claiming the hotel is a shell company for soul exploitation.',
        apply: (rep: ReputationState) => {
          const updated = RulesEngine.calculateReputationEvent('vox_propaganda', rep);
          return { text: 'Vox launched a television broadcast smearing our credibility.', rep: updated };
        }
      },
      {
        title: 'Bar Talk De-escalation',
        message: 'Husk listens to Angel Dust venting about Valentino. Angel Dust gains +5 rehab control. Husk remains slightly annoyed.',
        apply: (rep: ReputationState) => {
          rep.internalTrust = Math.min(100, rep.internalTrust + 5);
          return { text: 'Husk held a de-escalation conversation at the bar. Internal trust improved.', rep };
        }
      },
      {
        title: 'Heavenly Eye Patrol',
        message: 'An Exorcist scout ship approaches the Pride Ring skies. Exorcist attention levels spike.',
        apply: (rep: ReputationState) => {
          rep.heavenAttention = Math.min(100, rep.heavenAttention + 15);
          return { text: 'A Heavenly scout eye was detected in the perimeter sky.', rep };
        }
      },
      {
        title: 'Alastor\'s Dark Assistance',
        message: 'Alastor shadows fix a broken door instantly, but whispers a minor riddle regarding future favors.',
        apply: (rep: ReputationState) => {
          rep.internalTrust = Math.max(0, rep.internalTrust - 5);
          rep.overlordHostility = Math.min(100, rep.overlordHostility + 5);
          return { text: 'Alastor deployed shadow magic for structural repairs. Staff caution levels increased.', rep };
        }
      },
      {
        title: 'Redemption Proof Broadcast',
        message: 'A sinner successfully exhibits advanced moral control, sparking celestial reaction.',
        apply: (rep: ReputationState) => {
          const updated = RulesEngine.calculateReputationEvent('proof_of_redemption', rep);
          return { text: 'Proof of moral redemption broadcasted to celestial spectators.', rep: updated };
        }
      }
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    // Apply changes
    const currentRep = { ...db.getReputation() };
    const { text, rep: updatedRep } = randomEvent.apply(currentRep);
    
    db.saveReputation(updatedRep);
    db.logAction('NARRATIVE_EVENT', `[${randomEvent.title}] ${randomEvent.message}`);
    setTickerMessage(`[EVENT TRIGGERED] ${randomEvent.title}: ${randomEvent.message}`);
    
    onStateChange();
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Hotel Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Active Operations Overseer — Management of residents, security, and redemption paths.
          </p>
        </div>
        <button className="btn btn-gold" onClick={triggerNarrativeEvent} id="trigger-narrative-event-btn">
          <Play size={16} />
          Trigger Narrative Event
        </button>
      </div>

      {/* Narrative event ticker */}
      <div
        className="glass-panel art-deco-border"
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(90deg, rgba(168, 32, 42, 0.15) 0%, rgba(20, 10, 12, 0.5) 100%)',
          color: 'var(--color-gold)',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderLeft: '4px solid var(--color-gold)'
        }}
      >
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary-hover)' }}>[TICKER]</span>
        <span style={{ color: 'var(--color-text-main)' }}>{tickerMessage}</span>
      </div>

      {/* Alerts Panel */}
      {warnings.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '16px',
            border: '1px solid rgba(220, 53, 69, 0.4)',
            backgroundColor: 'rgba(114, 28, 36, 0.15)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b7a', fontWeight: 'bold' }}>
            <AlertTriangle size={18} />
            <span>OPERATIONAL ALERTS ({warnings.length})</span>
          </div>
          <ul style={{ paddingLeft: '24px', margin: 0, color: 'var(--color-text-main)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {warnings.map((warn, i) => (
              <li key={i} style={{ listStyleType: 'square' }}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => onNavigate('characters')}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', borderRadius: '8px', color: 'var(--color-gold)' }}>
            <Users size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Active Residents</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{activeResidents}</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => onNavigate('rooms')}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', borderRadius: '8px', color: 'var(--color-gold)' }}>
            <Bed size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Room Occupancy</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {occupancyRate.toFixed(1)}%
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500, marginLeft: '6px' }}>
                ({occupiedRoomsCount}/{totalRoomsCount})
              </span>
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => onNavigate('incidents')}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', borderRadius: '8px', color: '#ff6b7a' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Open Incidents</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {openIncidents}
              {damagedRoomsCount > 0 && (
                <span style={{ fontSize: '0.75rem', color: '#ff6b7a', display: 'block', fontWeight: 500 }}>
                  {damagedRoomsCount} Room(s) Damaged
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => onNavigate('staff')}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-primary-light)', borderRadius: '8px', color: 'var(--color-gold)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Active Tasks</h4>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{pendingTasks}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Reputation & Threats */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left Side: Reputation Indicators */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--color-gold)', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
            Hotel Reputation Metrics
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Sinner Reputation (Hell Groundwork)', val: reputation.sinnerReputation, color: 'var(--color-primary)' },
              { label: 'Redemption Credibility (Heavenly Eyes)', val: reputation.redemptionCredibility, color: '#eec247' },
              { label: 'Internal Trust & Cohesion', val: reputation.internalTrust, color: '#28a745' },
              { label: 'Media Chaos & Smear Press', val: reputation.mediaChaos, color: '#fd7e14' }
            ].map((m, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>{m.label}</span>
                  <span style={{ fontWeight: 700, color: m.color }}>{m.val}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ height: '100%', width: `${m.val}%`, backgroundColor: m.color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Threats and Security Attention */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ color: 'var(--color-gold)', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
            External Threats
          </h3>
          
          {/* Heaven Attention */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Eye size={16} style={{ color: '#ffd700' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Heaven Attention Level</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ height: '100%', width: `${reputation.heavenAttention}%`, backgroundColor: '#ffd700', transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '35px', textAlign: 'right' }}>{reputation.heavenAttention}%</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
              Triggers countdown acceleration and celestial inspections.
            </span>
          </div>

          {/* Vees Hostility */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Tv size={16} style={{ color: '#a8202a' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Vees Influence / Hostility</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ height: '100%', width: `${reputation.veesInfluence}%`, backgroundColor: 'var(--color-primary)', transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '35px', textAlign: 'right' }}>{reputation.veesInfluence}%</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
              Spurs cyber attack events, gossip, and media smear projects.
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Panel: Incidents & Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Incidents list */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
            <h4 style={{ color: 'var(--color-text-main)' }}>Open Incidents</h4>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => onNavigate('incidents')}>
              View All
            </button>
          </div>
          {incidents.filter(i => i.status === 'open' || i.status === 'contained').length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '12px 0' }}>
              No active security incidents logged. Front gates secure.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incidents.filter(i => i.status === 'open' || i.status === 'contained').slice(0, 3).map(inc => (
                <div 
                  key={inc.id} 
                  style={{ 
                    padding: '10px', 
                    backgroundColor: 'rgba(0,0,0,0.2)', 
                    borderRadius: '4px',
                    borderLeft: `3px solid ${inc.severity === 'crisis' ? '#721c24' : inc.severity === 'high' ? '#dc3545' : '#fd7e14'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{inc.location}</span>
                    <span style={{ fontSize: '0.7rem', color: '#ff6b7a', textTransform: 'uppercase', fontWeight: 700 }}>{inc.severity}</span>
                  </div>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {inc.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current tasks */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
            <h4 style={{ color: 'var(--color-text-main)' }}>Current Tasks</h4>
            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }} onClick={() => onNavigate('staff')}>
              View Scheduler
            </button>
          </div>
          {staffTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '12px 0' }}>
              All staff tasks cleared. Planning next exercises.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {staffTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').slice(0, 3).map(task => (
                <div key={task.id} style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginBottom: '2px' }}>{task.title}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      Assigned: {characters.find(c => c.id === task.assignedTo)?.name || task.assignedTo}
                    </span>
                  </div>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '3px 8px', 
                    borderRadius: '3px', 
                    backgroundColor: task.status === 'in_progress' ? 'rgba(253, 126, 20, 0.1)' : 'rgba(163, 147, 149, 0.1)',
                    color: task.status === 'in_progress' ? '#fd7e14' : '#a39395',
                    border: task.status === 'in_progress' ? '1px solid rgba(253, 126, 20, 0.3)' : '1px solid rgba(163, 147, 149, 0.2)'
                  }}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
