import React from 'react';
import { Radio, Tv, Eye, ShieldAlert, Award, AlertTriangle, Play, HelpCircle, History } from 'lucide-react';
import { db } from '../db/localDb';
import { RulesEngine } from '../lib/rules-engine';
import { ReputationState } from '../types';

interface ReputationProps {
  state: any;
  onStateChange: () => void;
}

export const Reputation: React.FC<ReputationProps> = ({ state, onStateChange }) => {
  const { reputation, auditLogs } = state;

  const handleTriggerEvent = (eventType: string) => {
    const updated = RulesEngine.calculateReputationEvent(eventType, reputation);
    db.saveReputation(updated);
    
    // Log details in audit logs
    let eventName = eventType;
    let desc = '';
    switch (eventType) {
      case 'interview':
        eventName = 'Charlie Public Radio Broadcast';
        desc = 'Charlie Morningstar conducted a live interview detailing rehabilitation goals, improving sinner interest.';
        break;
      case 'vox_propaganda':
        eventName = 'Voxtek TV Propaganda smear';
        desc = 'Voxtek television networks aired a targeted smear campaign discrediting the rehabilitation methodology.';
        break;
      case 'resident_success':
        eventName = 'Resident Moral Success Milestone';
        desc = 'Published certified logs of a resident showing major progress in impulse control and accountability.';
        break;
      case 'proof_of_redemption':
        eventName = 'Certified Redemption Event';
        desc = 'A resident officially ascended, proving to heavenly observers that sinner redemption is possible.';
        break;
      case 'public_brawl':
        eventName = 'Public Street Brawl Scandal';
        desc = 'A dispute between residents overflowed into the public street, causing property damages and bad press.';
        break;
    }

    db.logAction('REPUTATION_EVENT', `[${eventName}] - ${desc}`);
    onStateChange();
  };

  // Filter reputation events from audit logs
  const mediaEvents = auditLogs.filter((log: any) => 
    log.action === 'REPUTATION_EVENT' || log.action === 'NARRATIVE_EVENT'
  );

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Reputation & Public Relations</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Coordinate media responses, manage public credibility in Hell, and monitor Voxtek smear press.
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        
        {/* Left Side: Meters details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Internal and External Credibility */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px' }}>
              Credibility Ratings
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Sinner Trust (Public interest in Hell)</span>
                  <strong style={{ color: 'var(--color-primary)' }}>{reputation.sinnerReputation}%</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${reputation.sinnerReputation}%`, backgroundColor: 'var(--color-primary)' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                  Governs the rate of new resident applicants. Higher values represent broader sinner interest.
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Moral Credibility (Celestial Recognition)</span>
                  <strong style={{ color: '#eec247' }}>{reputation.redemptionCredibility}%</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${reputation.redemptionCredibility}%`, backgroundColor: '#eec247' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                  Governs celestial negotiations. High values show that Heaven takes the redemption program seriously.
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Internal Staff Trust & Cohesion</span>
                  <strong style={{ color: '#28a745' }}>{reputation.internalTrust}%</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${reputation.internalTrust}%`, backgroundColor: '#28a745' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                  Represents the level of teamwork and belief in Charlie's vision among active staff.
                </span>
              </div>
            </div>
          </div>

          {/* Media Hostility */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px' }}>
              Media Resistance & Press Threat
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Media Chaos (Smear Campaigns)</span>
                  <strong style={{ color: '#fd7e14' }}>{reputation.mediaChaos}%</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${reputation.mediaChaos}%`, backgroundColor: '#fd7e14' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                  Represents active rumors, gossip, and public confusion. High values reduce sinner trust.
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Vees Cartel Tech Surveillance</span>
                  <strong style={{ color: '#dc3545' }}>{reputation.veesInfluence}%</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${reputation.veesInfluence}%`, backgroundColor: '#dc3545' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                  Represents electronic spying and local news smear coordination from Voxtek.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Event Dispatcher & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Actions panel */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px' }}>
              Media Actions & Campaigns
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn btn-primary" 
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() => handleTriggerEvent('interview')}
                id="pr-interview-btn"
              >
                <Radio size={16} />
                Conduct Charlie Broadcast Interview
              </button>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '-8px', paddingLeft: '28px' }}>
                Charlie goes on public radio. Increases sinner trust (+8), decreases media chaos (-5).
              </span>

              <button 
                className="btn btn-gold" 
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() => handleTriggerEvent('resident_success')}
                id="pr-success-btn"
              >
                <Award size={16} />
                Publish Sinner Success story
              </button>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '-8px', paddingLeft: '28px' }}>
                Broadcast logs showing resident rehabilitation milestones. Improves credibility (+10), internal trust (+10).
              </span>

              <button 
                className="btn btn-danger" 
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() => handleTriggerEvent('vox_propaganda')}
                id="pr-smear-btn"
              >
                <Tv size={16} />
                Simulate Voxtek TV Smear Campaign
              </button>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '-8px', paddingLeft: '28px' }}>
                Vox launches smear ads. Reduces sinner trust (-12), increases media chaos (+20), Vees influence (+10).
              </span>

              <button 
                className="btn btn-secondary" 
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() => handleTriggerEvent('public_brawl')}
                id="pr-brawl-btn"
              >
                <AlertTriangle size={16} style={{ color: '#fd7e14' }} />
                Simulate Public Street Brawl Scandal
              </button>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '-8px', paddingLeft: '28px' }}>
                Fight leaks to the public. Reduces sinner trust (-8), increases media chaos (+12).
              </span>
            </div>
          </div>

          {/* Media History */}
          <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
            <h3 style={{ color: 'var(--color-text-muted)', marginBottom: '12px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={16} />
              Recent Media & Propaganda Log
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
              {mediaEvents.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                  No media events logged in current database.
                </p>
              ) : (
                mediaEvents.map((log: any) => (
                  <div key={log.id} style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gold)', marginBottom: '4px' }}>
                      <span>{log.action}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
                        {log.timestamp.split('T')[0]}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-main)', lineHeight: 1.4 }}>
                      {log.details}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
