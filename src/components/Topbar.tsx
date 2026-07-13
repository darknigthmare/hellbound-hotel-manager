import React, { useState } from 'react';
import { Calendar, Coins, EyeOff, Menu, Search, ShieldCheck, X } from 'lucide-react';
import { SpoilerLevel, TimelineScope } from '../types';
import { ViewType } from './Sidebar';

export interface GlobalSearchResult {
  id: string;
  label: string;
  meta: string;
  view: ViewType;
  searchTerm?: string;
  targetId?: string;
}

interface TopbarProps {
  currentView: ViewType;
  timelineScope: TimelineScope;
  hideSpoilers: boolean;
  spoilerLevel: SpoilerLevel;
  budget: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigateToTimeline: () => void;
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  searchResults: GlobalSearchResult[];
  onSelectSearchResult: (result: GlobalSearchResult) => void;
}

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

export const Topbar: React.FC<TopbarProps> = ({
  currentView,
  timelineScope,
  hideSpoilers,
  spoilerLevel,
  budget,
  searchQuery,
  onSearchChange,
  onNavigateToTimeline,
  onMenuToggle,
  isSidebarOpen,
  searchResults,
  onSelectSearchResult,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const showSearchPanel = isSearchOpen && searchQuery.trim().length >= 2;
  const effectiveActiveResultIndex = searchResults.length === 0
    ? -1
    : Math.min(activeResultIndex, searchResults.length - 1);

  return (
    <header className="app-topbar">
      <button
        type="button"
        className="topbar-menu-button"
        onClick={onMenuToggle}
        aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isSidebarOpen}
      >
        {isSidebarOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      <div
        className="global-search-wrap"
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsSearchOpen(false);
        }}
      >
        <label className="sr-only" htmlFor="global-search-input">
          Search all hotel records
        </label>
        <Search className="global-search-icon" size={16} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search guests, lore, rooms, incidents…"
          value={searchQuery}
          onChange={(event) => {
            onSearchChange(event.target.value);
            setIsSearchOpen(true);
            setActiveResultIndex(0);
          }}
          onFocus={() => setIsSearchOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsSearchOpen(false);
              onSearchChange('');
            }
            if (event.key === 'ArrowDown' && searchResults.length > 0) {
              event.preventDefault();
              setActiveResultIndex((index) => Math.min(index + 1, searchResults.length - 1));
            }
            if (event.key === 'ArrowUp' && searchResults.length > 0) {
              event.preventDefault();
              setActiveResultIndex((index) => Math.max(index - 1, 0));
            }
            const activeResult = searchResults[effectiveActiveResultIndex] ?? searchResults[0];
            if (event.key === 'Enter' && activeResult) {
              setIsSearchOpen(false);
              onSelectSearchResult(activeResult);
            }
          }}
          id="global-search-input"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-controls="global-search-results"
          aria-activedescendant={showSearchPanel && effectiveActiveResultIndex >= 0 ? `global-search-result-${effectiveActiveResultIndex}` : undefined}
          aria-expanded={showSearchPanel}
          autoComplete="off"
        />

        {showSearchPanel && (
          <div className="global-search-results" id="global-search-results" role="listbox">
            <div className="global-search-summary" role="presentation">
              {searchResults.length > 0
                ? `${searchResults.length} result${searchResults.length === 1 ? '' : 's'} across hotel records`
                : 'No matching hotel record'}
            </div>
            {searchResults.map((result, index) => (
              <button
                key={result.id}
                id={`global-search-result-${index}`}
                type="button"
                role="option"
                aria-selected={effectiveActiveResultIndex === index}
                onMouseEnter={() => setActiveResultIndex(index)}
                onClick={() => {
                  setIsSearchOpen(false);
                  onSelectSearchResult(result);
                }}
              >
                <strong>{result.label}</strong>
                <span>{result.meta}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-controls">
        <div className="topbar-budget" title="Total Cash Balance (Hellbound Notes)">
          <Coins size={16} aria-hidden="true" />
          <span>{budget.toLocaleString()} HN</span>
        </div>

        <button
          type="button"
          onClick={onNavigateToTimeline}
          title="Change active timeline settings"
          className={`topbar-timeline-btn${currentView === 'timeline' ? ' is-active' : ''}`}
        >
          <Calendar size={16} aria-hidden="true" />
          <span>
            Timeline: <strong>{getTimelineLabel(timelineScope)}</strong>
          </span>
        </button>

        <div
          className={`topbar-spoiler-state${hideSpoilers ? ' is-safe' : ' is-visible'}`}
          title={hideSpoilers ? `Spoilers hidden through ${spoilerLevel}` : 'All spoilers visible'}
        >
          {hideSpoilers ? <EyeOff size={14} aria-hidden="true" /> : <ShieldCheck size={14} aria-hidden="true" />}
          <span>{hideSpoilers ? `Hidden: ${spoilerLevel}` : 'Spoilers visible'}</span>
        </div>
      </div>
    </header>
  );
};
