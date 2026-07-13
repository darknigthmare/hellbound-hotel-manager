import React, { useEffect, useRef, useState } from 'react';
import {
  BedDouble,
  BookOpen,
  CalendarRange,
  Coins,
  HeartHandshake,
  Hourglass,
  LayoutDashboard,
  Network,
  Radio,
  Settings,
  ShieldAlert,
  Users,
  X,
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
  isOpen: boolean;
  onClose: () => void;
}

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

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  appName,
  isOpen,
  onClose,
}) => {
  const sidebarRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 860px)');
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (sidebarRef.current) sidebarRef.current.inert = isMobile && !isOpen;
  }, [isMobile, isOpen]);

  useEffect(() => {
    if (!isMobile || !isOpen || !sidebarRef.current) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    sidebarRef.current.querySelector<HTMLButtonElement>('.sidebar-close')?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !sidebarRef.current) return;
      const focusable = Array.from(sidebarRef.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isMobile, isOpen]);

  return (
    <>
    <button
      type="button"
      className={`sidebar-scrim${isOpen ? ' is-visible' : ''}`}
      aria-label="Close navigation"
      onClick={onClose}
      tabIndex={isOpen ? 0 : -1}
    />

    <aside
      ref={sidebarRef}
      className={`app-sidebar${isOpen ? ' is-open' : ''}`}
      aria-label="Main navigation"
      aria-hidden={isMobile && !isOpen ? true : undefined}
    >
      <div className="sidebar-brand">
        <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close navigation">
          <X size={20} aria-hidden="true" />
        </button>
        <h2>{appName}</h2>
        <span>Hotel Safehouse Operations</span>
      </div>

      <nav className="sidebar-navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`sidebar-link-btn${isActive ? ' is-active' : ''}`}
              id={`nav-${item.id}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span>Local-first session</span>
        <strong>Cloud backup is optional</strong>
      </div>
    </aside>
    </>
  );
};
