import React, { useState } from 'react';
import { Radio, Tv, Award, AlertTriangle, History } from 'lucide-react';
import { db } from '../db/localDb';
import { RulesEngine } from '../lib/rules-engine';
import { Character, DatabaseState, RehabilitationPlan } from '../types';

interface ReputationProps {
  state: DatabaseState;
  onStateChange: () => void;
}

type ReputationEventType = 'interview' | 'vox_propaganda' | 'resident_success' | 'public_brawl';
export const Reputation: React.FC<ReputationProps> = ({ state, onStateChange }) => {
  const { reputation, auditLogs, rehabilitationPlans, characters } = state;
  const gameplayMeta = state.gameplayMeta || db.getGameplayMeta();
  const campaignDay = gameplayMeta.campaignDay;
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const milestoneResident = rehabilitationPlans
    .map((plan: RehabilitationPlan) => ({
      plan,
      character: characters.find((character: Character) => character.id === plan.characterId),
      threshold: Math.floor(RulesEngine.calculateRehabilitationProgress(plan) / 10) * 10
    }))
    .find(({ plan, character, threshold }: { plan: RehabilitationPlan; character?: Character; threshold: number }) => (
      Boolean(character)
      && character?.status === 'resident'
      && !plan.isRedeemedConfirmed
      && threshold >= 60
      && !gameplayMeta.completedMilestones.includes(`rehab:${character?.id}:${threshold}`)
    ));

  const getActionBlockReason = (eventType: ReputationEventType): string | null => {
    const availableDay = gameplayMeta.cooldowns[`pr:${eventType}`] || 0;
    if (availableDay > campaignDay) {
      return `Campaign cooldown: available on Day ${availableDay}.`;
    }

    if (eventType === 'resident_success') {
      if (!milestoneResident) {
        return 'Requires an active resident with at least 60% overall rehabilitation progress.';
      }
    }

    if (eventType === 'interview' && reputation.sinnerReputation >= 100 && reputation.mediaChaos <= 0) {
      return 'Public trust is already at maximum and media chaos is fully contained.';
    }

    return null;
  };

  const handleTriggerEvent = (eventType: ReputationEventType) => {
    const blockReason = getActionBlockReason(eventType);
    if (blockReason) {
      setActionMessage(blockReason);
      return;
    }

    // Log details in audit logs
    let eventName: string = eventType;
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
      case 'public_brawl':
        eventName = 'Public Street Brawl Scandal';
        desc = 'A dispute between residents overflowed into the public street, causing property damages and bad press.';
        break;
    }

    const milestoneKey = eventType === 'resident_success' && milestoneResident?.character
      ? `rehab:${milestoneResident.character.id}:${milestoneResident.threshold}`
      : null;
    const completed = db.transaction(`REPUTATION_EVENT:${eventType}`, (draft) => {
      const meta = draft.gameplayMeta!;
      const cooldownKey = `pr:${eventType}`;
      if ((meta.cooldowns[cooldownKey] || 0) > meta.campaignDay) throw new Error('This campaign action is still on cooldown.');
      if (eventType === 'resident_success') {
        if (!milestoneResident?.character || !milestoneKey) throw new Error('No verified resident milestone is available.');
        const freshPlan = draft.rehabilitationPlans.find(plan => plan.id === milestoneResident.plan.id);
        const freshCharacter = draft.characters.find(character => character.id === milestoneResident.character?.id);
        const freshThreshold = freshPlan ? Math.floor(RulesEngine.calculateRehabilitationProgress(freshPlan) / 10) * 10 : 0;
        const freshKey = freshCharacter ? `rehab:${freshCharacter.id}:${freshThreshold}` : '';
        if (!freshPlan || !freshCharacter || freshCharacter.status !== 'resident' || freshPlan.isRedeemedConfirmed || freshThreshold < 60 || freshKey !== milestoneKey) {
          throw new Error('The selected rehabilitation milestone is no longer valid.');
        }
        if (meta.completedMilestones.includes(milestoneKey)) throw new Error('This resident milestone was already published.');
        meta.completedMilestones.push(milestoneKey);
      }
      draft.reputation = RulesEngine.calculateReputationEvent(eventType, draft.reputation);
      meta.cooldowns[cooldownKey] = meta.campaignDay + 1;
    }, {
      action: `REPUTATION_EVENT:${eventType}`,
      details: `[${eventName}] - ${desc}${milestoneKey ? ` [milestone:${milestoneKey}]` : ''}`
    });
    if (!completed) {
      setActionMessage(db.getStorageStatus().lastError?.message || 'Campaign action failed.');
      return;
    }
    setActionMessage(`${eventName} completed. This campaign is available again next operational day.`);
    onStateChange();
  };

  // Filter reputation events from audit logs
  const mediaEvents = auditLogs.filter(log =>
    log.action.startsWith('REPUTATION_EVENT') || log.action.startsWith('NARRATIVE_EVENT')
  );

  const interviewBlockReason = getActionBlockReason('interview');
  const successBlockReason = getActionBlockReason('resident_success');
  const smearBlockReason = getActionBlockReason('vox_propaganda');
  const brawlBlockReason = getActionBlockReason('public_brawl');

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
              {actionMessage && (
                <div role="status" style={{ padding: '9px 10px', borderRadius: '4px', backgroundColor: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                  {actionMessage}
                </div>
              )}
              <button 
                className="btn btn-primary" 
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() => handleTriggerEvent('interview')}
                id="pr-interview-btn"
                disabled={Boolean(interviewBlockReason)}
                title={interviewBlockReason || 'Conduct a monitored public interview'}
              >
                <Radio size={16} />
                Conduct Charlie Broadcast Interview
              </button>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '-8px', paddingLeft: '28px' }}>
                Sinner trust +8, media chaos -5, Vees surveillance +4. Once per campaign day.
              </span>

              <button 
                className="btn btn-gold" 
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() => handleTriggerEvent('resident_success')}
                id="pr-success-btn"
                disabled={Boolean(successBlockReason)}
                title={successBlockReason || `Publish ${milestoneResident?.character?.name || 'resident'}'s verified milestone`}
              >
                <Award size={16} />
                Publish Sinner Success story
              </button>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '-8px', paddingLeft: '28px' }}>
                Requires a real 60% resident milestone. Credibility +10, internal trust +10, sinner trust +5.
              </span>

              <button 
                className="btn btn-danger" 
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() => handleTriggerEvent('vox_propaganda')}
                id="pr-smear-btn"
                disabled={Boolean(smearBlockReason)}
                title={smearBlockReason || 'Run a hostile-media response drill'}
              >
                <Tv size={16} />
                Simulate Voxtek TV Smear Campaign
              </button>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '-8px', paddingLeft: '28px' }}>
                Sinner trust -12, credibility -5, media chaos +20, Vees influence +10.
              </span>

              <button 
                className="btn btn-secondary" 
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() => handleTriggerEvent('public_brawl')}
                id="pr-brawl-btn"
                disabled={Boolean(brawlBlockReason)}
                title={brawlBlockReason || 'Run a public-scandal response drill'}
              >
                <AlertTriangle size={16} style={{ color: '#fd7e14' }} />
                Simulate Public Street Brawl Scandal
              </button>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '-8px', paddingLeft: '28px' }}>
                Sinner trust -8 and media chaos +12. Once per campaign day.
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
                mediaEvents.map(log => (
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
