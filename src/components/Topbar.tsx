import React from 'react';
import { Search, Coins, Calendar, EyeOff, ShieldCheck } from 'lucide-react';
import { TimelineScope, SpoilerLevel } from '../types';

interface TopbarProps {
  timelineScope: TimelineScope;
  hideSpoilers: boolean;
  spoilerLevel: SpoilerLevel;
  budget: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigateToTimeline: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  timelineScope,
  hideSpoilers,
  spoilerLevel,
  budget,
  searchQuery,
  onSearchChange,
  onNavigateToTimeline,
}) => {
  const getTimelineLabel = (scope: TimelineScope) => {
    switch (scope) {
      case 'pilot_legacy':
        return 'Pilot Legacy';
      case 'season_1_start':
        return 'Season 1 Start';
      case 'season_1_end':
        return 'Season 1 End';
      case 'season_2':
        return 'Season 2 Active';
      case 'custom':
        return 'Custom timeline';
      default:
        return scope;
    }
  };

  return (
    <div
      style={{
        height: '64px',
        backgroundColor: 'var(--bg-sidebar)',
        borderBottom: 'var(--border-crimson)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 5,
        boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
      }}
    >
      {/* Search Bar */}
      <div style={{ position: 'relative', width: '320px' }}>
        <input
          type="text"
          placeholder="Search records, lore, guests..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--color-primary-light)',
            color: 'var(--color-text-main)',
            padding: '8px 12px 8px 36px',
            borderRadius: '20px',
            fontSize: '0.85rem',
          }}
          id="global-search-input"
        />
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
          }}
        />
      </div>

      {/* Stats and Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Budget ledger metric */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}
          title="Total Cash Balance (Hellbound Nobles)"
        >
          <Coins size={16} style={{ color: 'var(--color-gold)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {budget.toLocaleString()} HN
          </span>
        </div>

        {/* Timeline trigger */}
        <button
          onClick={onNavigateToTimeline}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(168, 32, 42, 0.1)',
            border: '1px solid var(--color-primary-light)',
            color: 'var(--color-text-main)',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-body)',
            transition: 'all var(--transition-fast)'
          }}
          title="Click to change active season timeline settings"
          className="topbar-timeline-btn"
        >
          <Calendar size={16} style={{ color: 'var(--color-gold)' }} />
          <span style={{ fontWeight: 500 }}>
            Timeline: <strong style={{ color: 'var(--color-gold)' }}>{getTimelineLabel(timelineScope)}</strong>
          </span>
        </button>

        {/* Spoiler Redaction indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: hideSpoilers ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
            border: hideSpoilers 
              ? '1px solid rgba(40, 167, 69, 0.3)' 
              : '1px solid rgba(220, 53, 69, 0.3)',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: hideSpoilers ? '#4ce06c' : '#ff6b7a'
          }}
        >
          {hideSpoilers ? (
            <>
              <EyeOff size={14} />
              <span>SPOILERS HIDDEN ({spoilerLevel.toUpperCase()})</span>
            </>
          ) : (
            <>
              <ShieldCheck size={14} style={{ color: '#ff6b7a' }} />
              <span>SPOILERS VISIBLE</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
