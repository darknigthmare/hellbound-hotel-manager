import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { db } from './db/localDb';
import { Sidebar, ViewType } from './components/Sidebar';
import { GlobalSearchResult, Topbar } from './components/Topbar';
import { LoreValidation } from './lib/lore-validation';
import { RulesEngine } from './lib/rules-engine';
import {
  HELLUVA_CHARACTERS,
  HELLUVA_CONTRACTS,
  HELLUVA_LORE,
} from './expansions/helluva-boss/data';
import {
  HELLUVA_BOSS_SPOILER_SCOPE_COPY,
  isHelluvaBossSpoilerVisible,
} from './expansions/helluva-boss/spoilers';
import './styles/theme.css';

const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Characters = lazy(() => import('./pages/Characters').then(module => ({ default: module.Characters })));
const Rooms = lazy(() => import('./pages/Rooms').then(module => ({ default: module.Rooms })));
const Rehabilitation = lazy(() => import('./pages/Rehabilitation').then(module => ({ default: module.Rehabilitation })));
const Incidents = lazy(() => import('./pages/Incidents').then(module => ({ default: module.Incidents })));
const Staff = lazy(() => import('./pages/Staff').then(module => ({ default: module.Staff })));
const Reputation = lazy(() => import('./pages/Reputation').then(module => ({ default: module.Reputation })));
const Timeline = lazy(() => import('./pages/Timeline').then(module => ({ default: module.Timeline })));
const LoreCodex = lazy(() => import('./pages/LoreCodex').then(module => ({ default: module.LoreCodex })));
const Relations = lazy(() => import('./pages/Relations').then(module => ({ default: module.Relations })));
const Resources = lazy(() => import('./pages/Resources').then(module => ({ default: module.Resources })));
const PentagramArena = lazy(() => import('./pages/PentagramArena').then(module => ({ default: module.PentagramArena })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const Extensions = lazy(() => import('./pages/Extensions').then(module => ({ default: module.Extensions })));
const HelluvaBoss = lazy(() => import('./pages/HelluvaBoss').then(module => ({ default: module.HelluvaBoss })));

export const App: React.FC = () => {
  // Navigation active view
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnnouncement, setSearchAnnouncement] = useState('');
  const [pendingSearchTarget, setPendingSearchTarget] = useState<{ result: GlobalSearchResult; sequence: number } | null>(null);
  const searchSequenceRef = useRef(0);

  // Responsive navigation state. Desktop layout remains permanently visible.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pageScrollRef = useRef<HTMLElement>(null);

  // Nav target character ID (transfers character contexts to rehab plans page)
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  // Core database state hook
  const [dbState, setDbState] = useState(() => db.getFullState());
  const helluvaState = dbState.extensions.helluvaBoss;
  const helluvaEnabled = Boolean(helluvaState?.enabled);
  const isHelluvaView = currentView === 'helluva';
  const helluvaSpoilerCopy = HELLUVA_BOSS_SPOILER_SCOPE_COPY[
    helluvaState?.spoilerScope ?? 'season_1'
  ];

  const handleRefreshState = () => {
    setDbState(db.getFullState());
  };

  const handleNavigateWithId = (view: ViewType, charId?: string) => {
    if (charId) {
      setSelectedCharacterId(charId);
    }
    setCurrentView(view === 'helluva' && !helluvaEnabled ? 'extensions' : view);
    setIsSidebarOpen(false);
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view === 'helluva' && !helluvaEnabled ? 'extensions' : view);
    setIsSidebarOpen(false);
  };

  // Every screen starts at its own top instead of inheriting the previous view scroll.
  useEffect(() => {
    pageScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentView]);

  useEffect(() => {
    document.documentElement.dataset.theme = dbState.settings?.theme || 'default-artdeco';
  }, [dbState.settings?.theme]);

  useEffect(() => {
    if (!pendingSearchTarget) return;

    let highlightTimer: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      const { result } = pendingSearchTarget;
      const page = pageScrollRef.current;
      if (!page) return;

      let target = result.targetId ? document.getElementById(result.targetId) : null;
      if (!target) {
        const normalizedLabel = result.label.trim().toLocaleLowerCase();
        const labelNode = Array.from(page.querySelectorAll<HTMLElement>('h2, h3, h4, strong, td, span'))
          .find((element) => element.textContent?.trim().toLocaleLowerCase() === normalizedLabel);
        target = labelNode?.closest<HTMLElement>('tr') ?? labelNode ?? null;
      }

      if (!target) {
        setSearchAnnouncement(`${result.label} is shown in the ${result.view} section.`);
        return;
      }

      if (!target.matches('button, [href], input, select, textarea, [tabindex]')) target.tabIndex = -1;
      target.classList.add('global-search-target');
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      target.focus({ preventScroll: true });
      setSearchAnnouncement(`${result.label} selected in the ${result.view} section.`);
      highlightTimer = window.setTimeout(() => target?.classList.remove('global-search-target'), 2600);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (highlightTimer !== undefined) window.clearTimeout(highlightTimer);
    };
  }, [currentView, pendingSearchTarget]);

  // Calculate budget balance
  const totalExpenses = (dbState.resourceLedger ?? [])
    .filter(l => l.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = (dbState.resourceLedger ?? [])
    .filter(l => l.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);
  const budgetBalance = totalIncome - totalExpenses;

  const globalSearchResults = useMemo<GlobalSearchResult[]>(() => {
    const normalized = searchQuery.trim().toLocaleLowerCase();
    if (normalized.length < 2) return [];

    const includes = (...values: Array<string | number | null | undefined>) =>
      values.some((value) => String(value ?? '').toLocaleLowerCase().includes(normalized));

    const results: GlobalSearchResult[] = [];

    (dbState.characters ?? []).forEach((character) => {
      const projection = dbState.timeline.current === 'custom'
        ? undefined
        : character.timelineStates?.[dbState.timeline.current];
      const projectedCharacter = { ...character, ...projection };
      const hasProjection = Boolean(projection);
      if (!hasProjection && !LoreValidation.isAvailableAtTimeline(character.timelineScope, dbState.timeline.current)) return;
      if (!RulesEngine.isContentVisible(projectedCharacter, dbState.timeline)) return;

      if (includes(projectedCharacter.name, projectedCharacter.alias, projectedCharacter.role, projectedCharacter.status, projectedCharacter.description)) {
        results.push({
          id: `character-${projectedCharacter.id}`,
          label: projectedCharacter.name,
          meta: `Character • ${projectedCharacter.role} • ${projectedCharacter.status}`,
          view: 'characters',
          searchTerm: projectedCharacter.name,
          targetId: `character-card-${projectedCharacter.id}`,
        });
      }
    });

    (dbState.loreCodex ?? []).forEach((entry) => {
      if (!LoreValidation.isAvailableAtTimeline(entry.timelineScope, dbState.timeline.current)) return;
      if (!RulesEngine.isContentVisible(entry, dbState.timeline)) return;
      if (includes(entry.title, entry.entityName, entry.description, entry.sourceRef)) {
        results.push({
          id: `lore-${entry.id}`,
          label: entry.title,
          meta: `Lore • ${entry.canonStatus} • ${entry.sourceRef || 'no source'}`,
          view: 'lore',
          searchTerm: entry.title,
          targetId: `lore-card-${entry.id}`,
        });
      }
    });

    (dbState.rooms ?? []).forEach((room) => {
      if (includes(room.number, room.type, room.status, room.maintenanceNotes)) {
        results.push({
          id: `room-${room.number}`,
          label: `Room ${room.number}`,
          meta: `Rooms • ${room.type} • ${room.status}`,
          view: 'rooms',
          searchTerm: `Room ${room.number}`,
          targetId: `room-card-${room.number}`,
        });
      }
    });

    (dbState.incidents ?? []).forEach((incident) => {
      const linkedLore = incident.loreLink
        ? dbState.loreCodex.find((entry) => entry.id === incident.loreLink)
        : undefined;
      if (linkedLore && (
        !LoreValidation.isAvailableAtTimeline(linkedLore.timelineScope, dbState.timeline.current)
        || !RulesEngine.isContentVisible(linkedLore, dbState.timeline)
      )) return;
      if (includes(incident.location, incident.summary, incident.type, incident.status)) {
        results.push({
          id: `incident-${incident.id}`,
          label: incident.summary || `Incident at ${incident.location}`,
          meta: `Incident • ${incident.severity} • ${incident.status}`,
          view: 'incidents',
          searchTerm: incident.summary || incident.location,
          targetId: `incident-card-${incident.id}`,
        });
      }
    });

    (dbState.staffTasks ?? []).forEach((task) => {
      if (includes(task.title, task.type, task.status, task.notes)) {
        results.push({
          id: `task-${task.id}`,
          label: task.title,
          meta: `Staff task • ${task.status}`,
          view: 'staff',
          searchTerm: task.title,
          targetId: `task-card-${task.id}`,
        });
      }
    });

    (dbState.factions ?? []).forEach((faction) => {
      if (includes(faction.name, faction.description)) {
        results.push({
          id: `faction-${faction.id}`,
          label: faction.name,
          meta: `Faction • influence ${faction.influence}%`,
          view: 'relations',
          searchTerm: faction.name,
        });
      }
    });

    (dbState.resourceLedger ?? []).forEach((entry) => {
      if (includes(entry.description, entry.category, entry.type, entry.amount)) {
        results.push({
          id: `ledger-${entry.id}`,
          label: entry.description,
          meta: `Ledger • ${entry.type} • ${entry.amount} HN`,
          view: 'resources',
          searchTerm: entry.description,
          targetId: `ledger-row-${entry.id}`,
        });
      }
    });

    if (helluvaEnabled && helluvaState) {
      HELLUVA_CHARACTERS.forEach((character) => {
        if (!isHelluvaBossSpoilerVisible(helluvaState.spoilerScope, character.spoilerScope)) return;
        if (includes(character.name, character.alias, character.species, character.role, character.affiliation, character.description)) {
          results.push({
            id: `helluva-character-${character.id}`,
            label: character.name,
            meta: `Helluva Boss • ${character.role} • ${character.affiliation}`,
            view: 'helluva',
            searchTerm: character.name,
            targetId: `helluva-character-${character.id}`,
          });
        }
      });

      HELLUVA_CONTRACTS.forEach((contract) => {
        if (includes(contract.title, contract.client, contract.location, contract.difficulty, contract.summary)) {
          results.push({
            id: `helluva-contract-${contract.id}`,
            label: contract.title,
            meta: `I.M.P. Simulation AU contract • Chapter ${contract.chapter} • ${contract.difficulty}`,
            view: 'helluva',
            searchTerm: contract.title,
            targetId: `helluva-contract-${contract.id}`,
          });
        }
      });

      HELLUVA_LORE.forEach((entry) => {
        if (!isHelluvaBossSpoilerVisible(helluvaState.spoilerScope, entry.spoilerScope)) return;
        if (includes(entry.title, entry.category, entry.description, entry.sourceRef)) {
          results.push({
            id: `helluva-lore-${entry.id}`,
            label: entry.title,
            meta: `Helluva lore • ${entry.category} • ${entry.sourceRef}`,
            view: 'helluva',
            searchTerm: entry.title,
            targetId: `helluva-lore-${entry.id}`,
          });
        }
      });
    }

    if (isHelluvaView) {
      return results.filter((result) => result.view === 'helluva').slice(0, 12);
    }
    return results.slice(0, 12);
  }, [dbState, helluvaEnabled, helluvaState, isHelluvaView, searchQuery]);

  const handleSelectSearchResult = (result: GlobalSearchResult) => {
    setCurrentView(result.view === 'helluva' && !helluvaEnabled ? 'extensions' : result.view);
    setSearchQuery(result.searchTerm ?? result.label);
    searchSequenceRef.current += 1;
    setPendingSearchTarget({ result, sequence: searchSequenceRef.current });
    setSearchAnnouncement(`Opening ${result.label}.`);
    setIsSidebarOpen(false);
  };

  // Page Routing dispatcher
  const renderActivePage = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            state={dbState} 
            onStateChange={handleRefreshState} 
            onNavigate={handleNavigateWithId}
          />
        );
      case 'characters':
        return (
          <Characters 
            state={dbState} 
            onStateChange={handleRefreshState} 
            searchQuery={searchQuery}
            onNavigate={handleNavigateWithId}
          />
        );
      case 'rooms':
        return (
          <Rooms 
            state={dbState} 
            onStateChange={handleRefreshState} 
            searchQuery={searchQuery}
          />
        );
      case 'rehab':
        return (
          <Rehabilitation 
            state={dbState} 
            onStateChange={handleRefreshState} 
            targetCharacterId={selectedCharacterId}
            onClearTargetId={() => setSelectedCharacterId(null)}
          />
        );
      case 'incidents':
        return (
          <Incidents 
            state={dbState} 
            onStateChange={handleRefreshState} 
            searchQuery={searchQuery}
          />
        );
      case 'staff':
        return (
          <Staff 
            state={dbState} 
            onStateChange={handleRefreshState} 
            searchQuery={searchQuery}
          />
        );
      case 'reputation':
        return (
          <Reputation 
            state={dbState} 
            onStateChange={handleRefreshState} 
          />
        );
      case 'timeline':
        return (
          <Timeline 
            state={dbState} 
            onStateChange={handleRefreshState} 
          />
        );
      case 'lore':
        return (
          <LoreCodex 
            state={dbState} 
            onStateChange={handleRefreshState} 
            searchQuery={searchQuery}
          />
        );
      case 'relations':
        return (
          <Relations 
            state={dbState} 
            onStateChange={handleRefreshState} 
          />
        );
      case 'resources':
        return (
          <Resources 
            state={dbState} 
            onStateChange={handleRefreshState} 
            searchQuery={searchQuery}
          />
        );
      case 'arena':
        return <PentagramArena state={dbState} />;
      case 'extensions':
        return (
          <Extensions
            state={dbState}
            onStateChange={handleRefreshState}
            onOpenHelluva={() => handleViewChange('helluva')}
          />
        );
      case 'helluva':
        return (
          <HelluvaBoss
            state={dbState}
            onStateChange={handleRefreshState}
            onManageExtensions={() => handleViewChange('extensions')}
          />
        );
      case 'settings':
        return (
          <Settings 
            state={dbState} 
            onStateChange={handleRefreshState} 
          />
        );
      default:
        return (
          <Dashboard 
            state={dbState} 
            onStateChange={handleRefreshState} 
            onNavigate={handleNavigateWithId}
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView} 
        onViewChange={handleViewChange}
        appName={dbState.settings.appName}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        helluvaEnabled={helluvaEnabled}
      />

      {/* Main Panel */}
      <div className="main-content">
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{searchAnnouncement}</div>
        {/* Header Bar */}
        <Topbar 
          currentView={currentView}
          timelineScope={dbState.timeline.current}
          hideSpoilers={isHelluvaView ? helluvaState?.spoilerScope !== 'specials' : dbState.timeline.hideSpoilers}
          spoilerLevel={dbState.timeline.spoilerLevel}
          budget={isHelluvaView ? helluvaState?.funds ?? 0 : budgetBalance}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onNavigateToTimeline={isHelluvaView ? undefined : () => setCurrentView('timeline')}
          onMenuToggle={() => setIsSidebarOpen((open) => !open)}
          isSidebarOpen={isSidebarOpen}
          searchResults={globalSearchResults}
          onSelectSearchResult={handleSelectSearchResult}
          context={isHelluvaView ? {
            currencyUnit: 'cr',
            budgetTitle: 'I.M.P. operational funds (Simulation AU credits)',
            timelineLabel: helluvaSpoilerCopy.timelineLabel,
            timelineTitle: 'Helluva Boss spoiler scope is managed on this page',
            spoilerLabel: helluvaSpoilerCopy.spoilerLabel,
            spoilerTitle: 'Helluva Boss reference visibility; campaign contracts remain Simulation AU',
            searchLabel: 'Search I.M.P. contracts, characters and lore',
            searchPlaceholder: 'Search I.M.P. contracts, cast, lore…',
            resultScope: 'I.M.P. records',
          } : undefined}
        />

        {/* Dynamic Page mount */}
        <main className="app-page-scroll" ref={pageScrollRef} tabIndex={-1}>
          <Suspense fallback={<div className="page-loading" role="status">Loading hotel recordsâ€¦</div>}>
            {renderActivePage()}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;
