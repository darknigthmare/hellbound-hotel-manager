import React from 'react';
import { Hourglass, Shield, ShieldOff, AlertTriangle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { db } from '../db/localDb';
import { TimelineScope, SpoilerLevel, Character, Room } from '../types';

interface TimelineProps {
  state: any;
  onStateChange: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({ state, onStateChange }) => {
  const { timeline, characters, rooms } = state;

  const handleUpdateTimeline = (scope: TimelineScope) => {
    let hotelState: 'original' | 'damaged' | 'rebuilt' = 'original';
    
    // Determine hotel condition based on timeline
    if (scope === 'season_1_end') {
      hotelState = 'damaged';
    } else if (scope === 'season_2') {
      hotelState = 'rebuilt';
    }

    const updatedTimeline = {
      ...timeline,
      current: scope,
      hotelState
    };

    // Save timeline state
    db.saveTimeline(updatedTimeline);

    // Apply lore constraints based on timeline scope
    const chars: Character[] = db.getCharacters();
    const rms: Room[] = db.getRooms();

    // 1. Sir Pentious status
    const pentious = chars.find(c => c.id === 'sirpentious');
    if (pentious) {
      const updatedPentious = { ...pentious };
      if (scope === 'pilot_legacy') {
        updatedPentious.role = 'antagonist';
        updatedPentious.status = 'external';
        updatedPentious.riskLevel = 'medium';
        updatedPentious.rehabProgress = 0;
      } else if (scope === 'season_1_start') {
        updatedPentious.role = 'resident';
        updatedPentious.status = 'applicant';
        updatedPentious.riskLevel = 'medium';
        updatedPentious.rehabProgress = 10;
      } else if (scope === 'season_1_end') {
        updatedPentious.role = 'resident';
        updatedPentious.status = 'resident';
        updatedPentious.riskLevel = 'low';
        updatedPentious.rehabProgress = 70;
      } else if (scope === 'season_2') {
        updatedPentious.role = 'external';
        updatedPentious.status = 'redeemed'; // officially redeemed!
        updatedPentious.riskLevel = 'low';
        updatedPentious.rehabProgress = 100;
      }
      db.saveCharacter(updatedPentious);

      // If redeemed under Season 2, vacate their room
      if (scope === 'season_2') {
        const room = rms.find(r => r.occupantId === 'sirpentious');
        if (room) {
          db.saveRoom({ ...room, occupantId: null });
        }
      }
    }

    // 2. Adjust rooms structural state based on hotel status
    if (scope === 'season_1_end') {
      // Mark more rooms as damaged
      rms.forEach(r => {
        if (r.number === '404' || r.number === '102') {
          db.saveRoom({
            ...r,
            status: 'damaged',
            repairCost: r.repairCost > 0 ? r.repairCost : 400
          });
        }
      });
    } else if (scope === 'season_2') {
      // Repair rooms
      rms.forEach(r => {
        if (r.status === 'damaged') {
          db.saveRoom({
            ...r,
            status: 'clean',
            repairCost: 0
          });
        }
      });
    }

    onStateChange();
  };

  const handleToggleHideSpoilers = (hide: boolean) => {
    db.saveTimeline({
      ...timeline,
      hideSpoilers: hide
    });
    db.logAction('CONFIG_CHANGE', `Spoiler protection setting changed: ${hide ? 'HIDDEN' : 'VISIBLE'}.`);
    onStateChange();
  };

  const handleSelectSpoilerLevel = (level: SpoilerLevel) => {
    db.saveTimeline({
      ...timeline,
      spoilerLevel: level
    });
    db.logAction('CONFIG_CHANGE', `Spoiler boundary set to: ${level.toUpperCase()}.`);
    onStateChange();
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Timeline Selector</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Set the operational time frame of the hotel. Changing the timeline applies canonical updates to guest rosters and room conditions.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Left Side: Timeline Cards */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '20px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
            Select Active Timeline Scope
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                id: 'pilot_legacy',
                title: 'Pilot Legacy',
                desc: 'Initial hotel setup. Sir Pentious acts as a low-level urban antagonist deployable in brawls. Hotel structure intact.',
                badge: 'original state'
              },
              {
                id: 'season_1_start',
                title: 'Season 1 Start',
                desc: 'Charlie launches the official curriculum. Sir Pentious joins as an applicant. Exorcists purges follow active timers.',
                badge: 'intake active'
              },
              {
                id: 'season_1_end',
                title: 'Season 1 End',
                desc: 'Post-battle conditions. Hotel is structurally damaged. Sir Pentious is an active resident with high moral score.',
                badge: 'damaged structure'
              },
              {
                id: 'season_2',
                title: 'Season 2 Active',
                desc: 'Hotel is fully rebuilt. Sir Pentious is officially cataloged as redeemed and residing in Heaven. Celestial eyes alert.',
                badge: 'ascended state'
              }
            ].map((t) => {
              const isActive = timeline.current === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => handleUpdateTimeline(t.id as TimelineScope)}
                  style={{
                    padding: '16px',
                    backgroundColor: isActive ? 'rgba(168, 32, 42, 0.12)' : 'rgba(0,0,0,0.15)',
                    border: isActive ? '1px solid var(--color-gold)' : '1px solid var(--color-primary-light)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    position: 'relative'
                  }}
                  className="timeline-card-option"
                  id={`timeline-card-${t.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <h4 style={{ color: isActive ? 'var(--color-gold)' : 'var(--color-text-main)', fontSize: '1rem' }}>
                      {t.title}
                    </h4>
                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '3px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {t.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {t.desc}
                  </p>
                  {isActive && (
                    <div style={{ position: 'absolute', bottom: '6px', right: '10px', fontSize: '0.65rem', color: 'var(--color-gold)', fontWeight: 600 }}>
                      ✦ ACTIVE CONFIGURATION
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Spoiler Protection settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px' }}>
              Spoiler Protection Settings
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Toggle button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {timeline.hideSpoilers ? (
                    <EyeOff size={18} style={{ color: '#4ce06c' }} />
                  ) : (
                    <Eye size={18} style={{ color: '#ff6b7a' }} />
                  )}
                  <div>
                    <strong style={{ fontSize: '0.85rem', display: 'block' }}>Redact Narrative Spoilers</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      Hide characters and codex entries above the threshold.
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleHideSpoilers(!timeline.hideSpoilers)}
                  style={{
                    backgroundColor: timeline.hideSpoilers ? '#28a745' : 'var(--color-primary-light)',
                    border: '1px solid var(--color-gold-dark)',
                    color: 'var(--color-text-main)',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 'bold',
                    transition: 'all var(--transition-fast)'
                  }}
                  id="spoiler-toggle-btn"
                >
                  {timeline.hideSpoilers ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              {/* Threshold level */}
              {timeline.hideSpoilers && (
                <div style={{ backgroundColor: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '4px' }}>
                  <label htmlFor="spoiler-level-select">Spoiler Threshold Level</label>
                  <select
                    id="spoiler-level-select"
                    value={timeline.spoilerLevel}
                    onChange={(e) => handleSelectSpoilerLevel(e.target.value as SpoilerLevel)}
                    style={{ width: '100%', marginTop: '6px' }}
                  >
                    <option value="none">No Spoilers (Pilot / Episode 1 only)</option>
                    <option value="season_1">Allow Season 1 Spoilers</option>
                    <option value="season_2">Allow Season 2 Spoilers</option>
                    <option value="future">Allow Future Season Speculation</option>
                  </select>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '6px' }}>
                    Records matching spoiler levels higher than this selected option will be redacted from codex grids.
                  </span>
                </div>
              )}

              {/* Warning box */}
              <div style={{ display: 'flex', gap: '8px', padding: '12px', border: '1px solid rgba(253,126,20,0.2)', backgroundColor: 'rgba(253,126,20,0.06)', borderRadius: '4px', fontSize: '0.75rem', color: '#fca34d', lineHeight: 1.5 }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Lore Protection:</strong> By default, this fan-made registry respects the viewer's place in the lore. Hide Spoilers prevents accidental reveals of Vaggie's background or Sir Pentious' ascension.
                </span>
              </div>

            </div>
          </div>

          {/* Hotel Condition Summary */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Hotel Structural Status
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Hourglass size={18} style={{ color: 'var(--color-gold)' }} />
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', color: 'var(--color-text-main)' }}>
                  State: {timeline.hotelState.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  {timeline.hotelState === 'original' && 'Standard rooms active. Normal maintenance overhead.'}
                  {timeline.hotelState === 'damaged' && 'Severe repair overhead. Multiple rooms damaged post-battle.'}
                  {timeline.hotelState === 'rebuilt' && 'Reconstructed facilities. Golden wards active. High defense rating.'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
