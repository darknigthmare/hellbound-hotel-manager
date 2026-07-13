import React from 'react';
import { Hourglass, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { db } from '../db/localDb';
import { DatabaseState, TimelineScope, SpoilerLevel } from '../types';

interface TimelineProps {
  state: DatabaseState;
  onStateChange: () => void;
}

export const Timeline: React.FC<TimelineProps> = ({ state, onStateChange }) => {
  const { timeline } = state;

  const commitTimeline = (
    operation: string,
    nextTimeline: DatabaseState['timeline'],
    action: string,
    details: string
  ) => {
    const committed = db.transaction(operation, (draft) => {
      draft.timeline = nextTimeline;
    }, { action, details });
    if (committed) onStateChange();
  };

  const handleUpdateTimeline = (scope: TimelineScope) => {
    const hotelState: 'original' | 'damaged' | 'rebuilt' = scope === 'custom'
      ? timeline.hotelState
      : scope === 'season_1_end' || scope === 'season_2' ? 'rebuilt' : 'original';

    commitTimeline('TIMELINE_VIEW_CHANGE', {
      ...timeline,
      current: scope,
      hotelState
    }, 'TIMELINE_VIEW_CHANGE', `Lore view changed to ${scope}; operational rosters, rooms and costs were not modified.`);
  };

  const handleToggleHideSpoilers = (hide: boolean) => {
    commitTimeline('SPOILER_VISIBILITY_CHANGE', {
      ...timeline,
      hideSpoilers: hide
    }, 'CONFIG_CHANGE', `Spoiler protection setting changed: ${hide ? 'HIDDEN' : 'VISIBLE'}.`);
  };

  const handleSelectSpoilerLevel = (level: SpoilerLevel) => {
    commitTimeline('SPOILER_BOUNDARY_CHANGE', {
      ...timeline,
      spoilerLevel: level
    }, 'CONFIG_CHANGE', `Spoiler boundary set to: ${level.toUpperCase()}.`);
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Timeline Selector</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Select a lore snapshot. This filter is reversible and never rewrites rooms, costs, incidents or gameplay progress.
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
                desc: '2019 pilot continuity only. Pilot claims stay isolated unless the Prime Video series independently confirms them.',
                badge: 'legacy source'
              },
              {
                id: 'season_1_start',
                title: 'Season 1 — Episodes 1–7',
                desc: 'Charlie opens the series-era hotel. Sir Pentious arrives in Episode 2; Adam remains alive and commands the exorcists.',
                badge: 'series opening'
              },
              {
                id: 'season_1_end',
                title: 'Season 1 — After Episode 8',
                desc: 'The original building is destroyed and its replacement is completed. Pentious appears redeemed in Heaven; Adam is deceased.',
                badge: 'finale state'
              },
              {
                id: 'season_2',
                title: 'Season 2',
                desc: 'The rebuilt hotel receives new arrivals. Pentious\' redemption affects Heaven while Vox escalates his campaign.',
                badge: 'current canon'
              },
              {
                id: 'custom',
                title: 'Simulation AU / Custom',
                desc: 'Shows every operational and user-authored record. Scores, budgets, risks and player outcomes remain simulation data, not canon claims.',
                badge: 'gameplay layer'
              }
            ].map((t) => {
              const isActive = timeline.current === t.id;

              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => handleUpdateTimeline(t.id as TimelineScope)}
                  style={{
                    padding: '16px',
                    backgroundColor: isActive ? 'rgba(168, 32, 42, 0.12)' : 'rgba(0,0,0,0.15)',
                    border: isActive ? '1px solid var(--color-gold)' : '1px solid var(--color-primary-light)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    position: 'relative',
                    width: '100%',
                    textAlign: 'left',
                    color: 'inherit'
                  }}
                  className="timeline-card-option"
                  id={`timeline-card-${t.id}`}
                  aria-pressed={isActive}
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
                </button>
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
                  type="button"
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
              Canonical Building Snapshot
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Hourglass size={18} style={{ color: 'var(--color-gold)' }} />
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', color: 'var(--color-text-main)' }}>
                  State: {timeline.hotelState.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  {timeline.hotelState === 'original' && 'Original series-era building; operational room records remain player-managed.'}
                  {timeline.hotelState === 'damaged' && 'Transitional damage snapshot; no room or ledger mutation is performed.'}
                  {timeline.hotelState === 'rebuilt' && 'Replacement hotel shown by the finale and used in Season 2.'}
                </span>
              </div>
            </div>
            <p style={{ marginTop: '10px', fontSize: '0.7rem', color: '#fca34d', lineHeight: 1.45 }}>
              Lore selection never grants free repairs or clears repair costs. Use the Rooms and Resources gameplay systems for operational changes.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
