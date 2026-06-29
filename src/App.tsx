import React, { useState } from 'react';
import { db } from './db/localDb';
import { Sidebar, ViewType } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './pages/Dashboard';
import { Characters } from './pages/Characters';
import { Rooms } from './pages/Rooms';
import { Rehabilitation } from './pages/Rehabilitation';
import { Incidents } from './pages/Incidents';
import { Staff } from './pages/Staff';
import { Reputation } from './pages/Reputation';
import { Timeline } from './pages/Timeline';
import { LoreCodex } from './pages/LoreCodex';
import { Relations } from './pages/Relations';
import { Resources } from './pages/Resources';
import { Settings } from './pages/Settings';
import './styles/theme.css';

export const App: React.FC = () => {
  // Navigation active view
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Nav target character ID (transfers character contexts to rehab plans page)
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  // Core database state hook
  const [dbState, setDbState] = useState(() => db.getFullState());

  const handleRefreshState = () => {
    setDbState(db.getFullState());
  };

  const handleNavigateWithId = (view: ViewType, charId?: string) => {
    if (charId) {
      setSelectedCharacterId(charId);
    }
    setCurrentView(view);
  };

  // Calculate budget balance
  const totalExpenses = dbState.resourceLedger
    .filter(l => l.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = dbState.resourceLedger
    .filter(l => l.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);
  const budgetBalance = totalIncome - totalExpenses;

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
          />
        );
      case 'staff':
        return (
          <Staff 
            state={dbState} 
            onStateChange={handleRefreshState} 
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
        onViewChange={(view) => setCurrentView(view)} 
        appName={dbState.settings.appName}
      />

      {/* Main Panel */}
      <div className="main-content">
        {/* Header Bar */}
        <Topbar 
          timelineScope={dbState.timeline.current}
          hideSpoilers={dbState.timeline.hideSpoilers}
          spoilerLevel={dbState.timeline.spoilerLevel}
          budget={budgetBalance}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onNavigateToTimeline={() => setCurrentView('timeline')}
        />

        {/* Dynamic Page mount */}
        <main className="page-container" style={{ flex: 1, overflowY: 'auto' }}>
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default App;
