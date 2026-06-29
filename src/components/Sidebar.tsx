import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BedDouble, 
  HeartHandshake, 
  ShieldAlert, 
  CalendarRange, 
  Radio, 
  Hourglass, 
  BookOpen, 
  Network, 
  Coins, 
  Settings 
} from 'lucide-react';

export type ViewType = 
  | 'dashboard'
  | 'characters'
  | 'rooms'
  | 'rehab'
  | 'incidents'
  | 'staff'
  | 'reputation'
  | 'timeline'
  | 'lore'
  | 'relations'
  | 'resources'
  | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  appName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, appName }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'characters', label: 'Residents & Staff', icon: Users },
    { id: 'rooms', label: 'Rooms Registry', icon: BedDouble },
    { id: 'rehab', label: 'Rehabilitation', icon: HeartHandshake },
    { id: 'incidents', label: 'Security Incidents', icon: ShieldAlert },
    { id: 'staff', label: 'Staff Scheduler', icon: CalendarRange },
    { id: 'reputation', label: 'Reputation & PR', icon: Radio },
    { id: 'timeline', label: 'Timeline Selector', icon: Hourglass },
    { id: 'lore', label: 'Lore Codex', icon: BookOpen },
    { id: 'relations', label: 'Factions Graph', icon: Network },
    { id: 'resources', label: 'Ledger & Supplies', icon: Coins },
    { id: 'settings', label: 'Settings & Data', icon: Settings },
  ] as const;

  return (
    <div
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: 'var(--border-gold)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: 'var(--shadow-gold)',
        zIndex: 10,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 16px',
          borderBottom: 'var(--border-crimson)',
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(168, 32, 42, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-title)',
            fontSize: '1.2rem',
            color: 'var(--color-gold)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
            marginBottom: '4px',
          }}
        >
          {appName}
        </h2>
        <span
          style={{
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'var(--color-text-muted)',
            fontWeight: 700,
          }}
        >
          Hotel Safehouse Operations
        </span>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          flex: 1,
          padding: '16px 8px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 16px',
                background: isActive 
                  ? 'linear-gradient(90deg, rgba(168, 32, 42, 0.25) 0%, rgba(168, 32, 42, 0.05) 100%)' 
                  : 'transparent',
                border: 'none',
                borderLeft: isActive 
                  ? '3px solid var(--color-gold)' 
                  : '3px solid transparent',
                borderRadius: '0 4px 4px 0',
                color: isActive ? 'var(--color-gold)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                transition: 'all var(--transition-fast)',
                outline: 'none',
              }}
              className="sidebar-link-btn"
              id={`nav-${item.id}`}
            >
              <Icon 
                size={18} 
                style={{ 
                  color: isActive ? 'var(--color-gold)' : 'var(--color-text-muted)',
                  transition: 'color var(--transition-fast)' 
                }} 
              />
              <span style={{ letterSpacing: '0.03em' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div
        style={{
          padding: '12px',
          borderTop: 'var(--border-crimson)',
          textAlign: 'center',
          backgroundColor: 'rgba(0,0,0,0.15)',
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            color: 'var(--color-text-muted)',
            display: 'block',
          }}
        >
          Offline Session (Private)
        </span>
        <span
          style={{
            fontSize: '0.6rem',
            color: 'var(--color-primary-hover)',
            fontWeight: '600',
            marginTop: '2px',
            display: 'block',
          }}
        >
          No Telemetry Active
        </span>
      </div>
    </div>
  );
};
