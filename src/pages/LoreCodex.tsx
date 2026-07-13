import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ShieldAlert, Lock, Unlock, Info, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import { db } from '../db/localDb';
import { LoreValidation, LoreGap } from '../lib/lore-validation';
import { LoreEntry, CanonStatus, SourceType, SpoilerLevel, TimelineScope, LoreCategory, DatabaseState } from '../types';
import { CanonBadge } from '../components/CanonBadge';
import { SpoilerBadge } from '../components/SpoilerBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useDialogFocus } from '../components/useDialogFocus';

interface LoreCodexProps {
  state: DatabaseState;
  onStateChange: () => void;
  searchQuery: string;
}

export const LoreCodex: React.FC<LoreCodexProps> = ({ state, onStateChange, searchQuery }) => {
  const { loreCodex, timeline } = state;

  // Tabs: 'directory' | 'validation'
  const [activeTab, setActiveTab] = useState<'directory' | 'validation'>('directory');

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [canonFilter, setCanonFilter] = useState<string>('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LoreEntry | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Confirm delete modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formEntity, setFormEntity] = useState('');
  const [formCategory, setFormCategory] = useState<LoreCategory>('character');
  const [formDesc, setFormDesc] = useState('');
  const [formCanon, setFormCanon] = useState<CanonStatus>('canon');
  const [formSourceType, setFormSourceType] = useState<SourceType>('episode');
  const [formSourceRef, setFormSourceRef] = useState('');
  const [formSpoiler, setFormSpoiler] = useState<SpoilerLevel>('none');
  const [formTimeline, setFormTimeline] = useState<TimelineScope>('season_1_start');
  const [formLocked, setFormLocked] = useState(false);
  const modalRef = useDialogFocus(isModalOpen, () => setIsModalOpen(false), '#lore-title');

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentTab: 'directory' | 'validation',
  ) => {
    const tabs = ['directory', 'validation'] as const;
    const currentIndex = tabs.indexOf(currentTab);
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextTab = tabs[nextIndex];
    setActiveTab(nextTab);
    document.getElementById(`tab-lore-${nextTab}`)?.focus();
  };

  const timelineVisibleEntries = loreCodex.filter((entry: LoreEntry) => {
    if (!LoreValidation.isAvailableAtTimeline(entry.timelineScope, timeline.current)) return false;
    const spoilerRanks: Record<SpoilerLevel, number> = { none: 0, season_1: 1, season_2: 2, future: 3 };
    return !timeline.hideSpoilers || spoilerRanks[entry.spoilerLevel] <= spoilerRanks[timeline.spoilerLevel];
  });

  // Validation follows the active spoiler boundary so hidden titles never leak.
  const validationGaps = LoreValidation.validateLoreEntries(timelineVisibleEntries);

  const handleEdit = (entry: LoreEntry) => {
    setEditingEntry(entry);
    setFormTitle(entry.title);
    setFormEntity(entry.entityName);
    setFormCategory(entry.category);
    setFormDesc(entry.description);
    setFormCanon(entry.canonStatus);
    setFormSourceType(entry.sourceType);
    setFormSourceRef(entry.sourceRef);
    setFormSpoiler(entry.spoilerLevel);
    setFormTimeline(entry.timelineScope);
    setFormLocked(entry.isLocked);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingEntry(null);
    setFormTitle('');
    setFormEntity('');
    setFormCategory('world_rule');
    setFormDesc('');
    setFormCanon('headcanon');
    setFormSourceType('user_manual_note');
    setFormSourceRef('');
    setFormSpoiler('none');
    setFormTimeline('season_1_start');
    setFormLocked(false);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      setValidationError('Entry title is required.');
      return;
    }
    if (!formEntity.trim()) {
      setValidationError('Entity name is required.');
      return;
    }
    if (!formDesc.trim()) {
      setValidationError('Lore description details are required.');
      return;
    }

    const newEntry: LoreEntry = {
      id: editingEntry ? editingEntry.id : 'lore_' + Date.now(),
      title: formTitle.trim(),
      entityName: formEntity.trim(),
      category: formCategory,
      description: formDesc.trim(),
      canonStatus: formCanon,
      sourceType: formSourceType,
      sourceRef: formSourceRef.trim(),
      spoilerLevel: formSpoiler,
      timelineScope: formTimeline,
      isLocked: formLocked
    };

    const candidateEntries = [
      ...loreCodex.filter((entry: LoreEntry) => entry.id !== newEntry.id),
      newEntry
    ];
    const entryErrors = LoreValidation.validateLoreEntries(candidateEntries)
      .filter((gap) => gap.entryId === newEntry.id && gap.severity === 'error');
    if (entryErrors.length > 0) {
      setValidationError(entryErrors.map((gap) => gap.message).join(' '));
      return;
    }

    if (!db.saveLoreEntry(newEntry)) {
      setValidationError(db.getStorageStatus().lastError?.message || 'The lore entry could not be saved.');
      return;
    }
    setIsModalOpen(false);
    onStateChange();
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      if (db.deleteLoreEntry(deleteTargetId)) {
        setIsConfirmOpen(false);
        setDeleteTargetId(null);
        onStateChange();
      }
    }
  };

  // Toggle locked status (locks/unlocks database entries)
  const handleToggleLock = (entry: LoreEntry) => {
    const success = db.saveLoreEntry({
      ...entry,
      isLocked: !entry.isLocked
    });
    if (success) onStateChange();
  };

  // Filter listings
  const filteredEntries = timelineVisibleEntries.filter((entry: LoreEntry) => {
    // Global search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match = 
        entry.title.toLowerCase().includes(q) || 
        entry.entityName.toLowerCase().includes(q) || 
        entry.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Dropdowns filters
    if (categoryFilter !== 'all' && entry.category !== categoryFilter) return false;
    if (canonFilter !== 'all' && entry.canonStatus !== canonFilter) return false;

    return true;
  });

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Lore Codex & Library</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Store canon rules, review factions, verify facts, and isolate narrative spoilers.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleCreate} id="add-lore-btn">
          <Plus size={16} />
          Add Lore Entry
        </button>
      </div>

      {/* Tabs Row */}
      <div role="tablist" aria-label="Lore Codex views" style={{ display: 'flex', borderBottom: '1px solid var(--color-primary-light)', marginBottom: '20px', gap: '8px' }}>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'directory'}
          aria-controls="lore-panel-directory"
          tabIndex={activeTab === 'directory' ? 0 : -1}
          onClick={() => setActiveTab('directory')}
          onKeyDown={(event) => handleTabKeyDown(event, 'directory')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'directory' ? 'rgba(168, 32, 42, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'directory' ? '2px solid var(--color-gold)' : '2px solid transparent',
            color: activeTab === 'directory' ? 'var(--color-gold)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            fontWeight: 600,
            fontFamily: 'var(--font-title)'
          }}
          id="tab-lore-directory"
        >
          Codex Library
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'validation'}
          aria-controls="lore-panel-validation"
          tabIndex={activeTab === 'validation' ? 0 : -1}
          onClick={() => setActiveTab('validation')}
          onKeyDown={(event) => handleTabKeyDown(event, 'validation')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'validation' ? 'rgba(168, 32, 42, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'validation' ? '2px solid var(--color-gold)' : '2px solid transparent',
            color: activeTab === 'validation' ? 'var(--color-gold)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            fontWeight: 600,
            fontFamily: 'var(--font-title)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          id="tab-lore-validation"
        >
          Canon Validation Logs
          {validationGaps.length > 0 && (
            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--color-primary)', color: 'var(--color-text-main)' }}>
              {validationGaps.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'directory' ? (
        <div id="lore-panel-directory" role="tabpanel" aria-labelledby="tab-lore-directory" tabIndex={0}>
          {/* Filters Bar */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '16px', 
              marginBottom: '20px', 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '16px',
              alignItems: 'center',
              backgroundColor: 'rgba(28, 17, 19, 0.4)'
            }}
          >
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label htmlFor="codex-cat-filter">Filter Category</label>
              <select 
                id="codex-cat-filter" 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="all">All Categories</option>
                <option value="character">Characters</option>
                <option value="faction">Factions</option>
                <option value="location">Locations</option>
                <option value="event">Historical Events</option>
                <option value="world_rule">World Rules / Magic</option>
                <option value="relation">Factions Relationships</option>
                <option value="contract">Demon Deals / Contracts</option>
                <option value="media_piece">Media / Broadcast Pieces</option>
                <option value="item">Key Items</option>
                <option value="threat">External Threats</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
              <label htmlFor="codex-canon-filter">Filter Verification Status</label>
              <select 
                id="codex-canon-filter" 
                value={canonFilter} 
                onChange={(e) => setCanonFilter(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="all">All Statuses</option>
                <option value="canon">Canon Verified</option>
                <option value="semi_canon">Semi-Canon</option>
                <option value="simulation_au">Simulation AU</option>
                <option value="headcanon">Headcanon</option>
                <option value="user_note">User Log / Custom</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {filteredEntries.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Info size={40} style={{ color: 'var(--color-gold-dark)', marginBottom: '12px' }} />
              <h3>No codex entries match criteria.</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredEntries.map((entry: LoreEntry) => (
                <div 
                  key={entry.id} 
                  id={`lore-card-${entry.id}`}
                  className="glass-panel animate-fade-in" 
                  style={{ 
                    padding: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-crimson)'
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', color: 'var(--color-gold)' }}>{entry.title}</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                          Target: {entry.entityName}
                        </span>
                      </div>
                      <CanonBadge status={entry.canonStatus} sourceRef={entry.sourceRef} />
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '6px 0 12px 0' }}>
                      <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-text-main)', textTransform: 'uppercase', fontWeight: 600 }}>
                        {entry.category.replace('_', ' ')}
                      </span>
                      {entry.spoilerLevel !== 'none' && (
                        <SpoilerBadge level={entry.spoilerLevel} />
                      )}
                      {entry.sourceRef && (
                        <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}>
                          Ref: {entry.sourceRef}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', lineHeight: 1.5, marginBottom: '12px' }}>
                      {entry.description}
                    </p>
                  </div>

                  {/* Actions footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleLock(entry)}
                      aria-label={`${entry.isLocked ? 'Unlock' : 'Lock'} ${entry.title}`}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                      id={`lock-toggle-${entry.id}`}
                    >
                      {entry.isLocked ? (
                        <>
                          <Lock size={12} style={{ color: 'var(--color-gold)' }} />
                          <span style={{ color: 'var(--color-gold)' }}>Locked</span>
                        </>
                      ) : (
                        <>
                          <Unlock size={12} />
                          <span>Unlocked</span>
                        </>
                      )}
                    </button>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        type="button"
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                        onClick={() => handleEdit(entry)}
                        disabled={entry.isLocked}
                        aria-label={`Edit ${entry.title}`}
                        title={`Edit ${entry.title}`}
                        id={`edit-lore-${entry.id}`}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        type="button"
                        className="btn btn-danger" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }} 
                        onClick={() => handleDeleteTrigger(entry.id)}
                        disabled={entry.isLocked}
                        aria-label={`Delete ${entry.title}`}
                        title={`Delete ${entry.title}`}
                        id={`delete-lore-${entry.id}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Validation Logs tab */
        <div id="lore-panel-validation" role="tabpanel" aria-labelledby="tab-lore-validation" tabIndex={0} className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '12px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px' }}>
            Lore Metadata Diagnostic
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
            This scanner checks the currently visible codex entries for source-reference format, canon/simulation separation, duplicates and timeline/spoiler contradictions. It cannot prove that a citation supports a claim or audit characters, factions and relationships. Fixes remain manual.
          </p>

          {validationGaps.length === 0 ? (
            <div style={{ padding: '24px', backgroundColor: 'rgba(40,167,69,0.08)', border: '1px solid rgba(40,167,69,0.3)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', color: '#4ce06c' }}>
              <CheckCircle size={24} />
              <div>
                <strong style={{ display: 'block' }}>Visible metadata checks passed</strong>
                <span style={{ fontSize: '0.8rem' }}>No structural issue was detected in the visible codex entries. Source truth still requires human review.</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {validationGaps.map((gap: LoreGap, i) => (
                <div 
                  key={i} 
                  style={{ 
                    padding: '12px 16px', 
                    backgroundColor: gap.severity === 'error' ? 'rgba(220,53,69,0.08)' : 'rgba(253,126,20,0.08)',
                    border: gap.severity === 'error' ? '1px solid rgba(220,53,69,0.3)' : '1px solid rgba(253,126,20,0.3)',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {gap.severity === 'error' ? (
                      <ShieldAlert size={20} style={{ color: '#ff6b7a', flexShrink: 0 }} />
                    ) : (
                      <AlertCircle size={20} style={{ color: '#fca34d', flexShrink: 0 }} />
                    )}
                    <div>
                      <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--color-text-main)' }}>
                        {gap.entryTitle} ({gap.issue.replace('_', ' ')})
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {gap.message}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-gold" 
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => {
                      const entry = loreCodex.find((e: LoreEntry) => e.id === gap.entryId);
                      if (entry) handleEdit(entry);
                    }}
                    id={`fix-gap-${gap.entryId}`}
                  >
                    Fix Entry
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Entry Modal */}
      {isModalOpen && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsModalOpen(false);
          }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}
        >
          <div ref={modalRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="lore-dialog-title" className="glass-panel art-deco-border" style={{ width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', margin: 'auto' }}>
            <h2 id="lore-dialog-title" style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px' }}>
              {editingEntry ? `Edit Codex Entry` : 'Create Codex Record'}
            </h2>

            {validationError && (
              <div role="alert" style={{ backgroundColor: 'rgba(220, 53, 69, 0.15)', border: '1px solid var(--status-high)', color: '#ff6b7a', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                {validationError}
              </div>
            )}

            <form onSubmit={handleSaveEntry} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="lore-title">Record Title *</label>
                  <input type="text" id="lore-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} style={{ width: '100%' }} placeholder="e.g. Alastor Radio broadcasts" />
                </div>
                <div>
                  <label htmlFor="lore-entity">Subject Entity *</label>
                  <input type="text" id="lore-entity" value={formEntity} onChange={(e) => setFormEntity(e.target.value)} style={{ width: '100%' }} placeholder="e.g. Alastor" />
                </div>

                <div>
                  <label htmlFor="lore-category">Record Category</label>
                  <select id="lore-category" value={formCategory} onChange={(e) => setFormCategory(e.target.value as LoreCategory)} style={{ width: '100%' }}>
                    <option value="character">Character details</option>
                    <option value="faction">Factions</option>
                    <option value="location">Locations</option>
                    <option value="event">Historical Events</option>
                    <option value="world_rule">World Rules / Magic</option>
                    <option value="relation">Factions Relations</option>
                    <option value="contract">Demon Deals / Contracts</option>
                    <option value="media_piece">Media / Broadcast Pieces</option>
                    <option value="item">Key Items</option>
                    <option value="threat">External Threats</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="lore-canon">Verification Status</label>
                  <select id="lore-canon" value={formCanon} onChange={(e) => setFormCanon(e.target.value as CanonStatus)} style={{ width: '100%' }}>
                    <option value="canon">Canon (Episode source)</option>
                    <option value="semi_canon">Semi-Canon (Creator State)</option>
                    <option value="simulation_au">Simulation AU (Gameplay only)</option>
                    <option value="headcanon">Headcanon (Speculative)</option>
                    <option value="user_note">User Log / Custom</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="lore-desc">Description details *</label>
                <textarea id="lore-desc" rows={4} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} style={{ width: '100%', resize: 'vertical' }} placeholder="Provide brief details. Keep it non-copyrighted and informational..." />
              </div>

              {/* Source citations */}
              <div style={{ padding: '12px', border: '1px dashed var(--color-gold-dark)', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.15)', marginTop: '8px' }}>
                <h4 style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} />
                  Citation Details (Episode / Reference)
                </h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label htmlFor="lore-source-type">Source Category</label>
                    <select id="lore-source-type" value={formSourceType} onChange={(e) => setFormSourceType(e.target.value as SourceType)} style={{ width: '100%', fontSize: '0.8rem' }}>
                      <option value="episode">Episode (Season 1/2)</option>
                      <option value="official_pilot">Official 2019 Pilot</option>
                      <option value="official_page">Official Page / Media</option>
                      <option value="creator_statement">Creator Q&A Statement</option>
                      <option value="user_manual_note">User Notes</option>
                      <option value="other">Other reference</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="lore-source-ref">Source Reference (Required for Canon)</label>
                    <input type="text" id="lore-source-ref" value={formSourceRef} onChange={(e) => setFormSourceRef(e.target.value)} style={{ width: '100%', fontSize: '0.8rem' }} placeholder="S1E04; S2E01; PILOT-2019; official URL" />
                  </div>

                  <div>
                    <label htmlFor="lore-spoiler">Spoiler Filter Level</label>
                    <select id="lore-spoiler" value={formSpoiler} onChange={(e) => setFormSpoiler(e.target.value as SpoilerLevel)} style={{ width: '100%', fontSize: '0.8rem' }}>
                      <option value="none">No Spoilers (Pilot/Ep 1)</option>
                      <option value="season_1">Season 1 spoilers</option>
                      <option value="season_2">Season 2 spoilers</option>
                      <option value="future">Future Season Speculation</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="lore-scope">Timeline Scope</label>
                    <select id="lore-scope" value={formTimeline} onChange={(e) => setFormTimeline(e.target.value as TimelineScope)} style={{ width: '100%', fontSize: '0.8rem' }}>
                      <option value="pilot_legacy">Pilot Legacy</option>
                      <option value="season_1_start">Season 1 Opening / Mid-season</option>
                      <option value="season_1_end">Season 1 Finale</option>
                      <option value="season_2">Season 2 Active</option>
                      <option value="custom">Custom Timeline</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Locked checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input 
                  type="checkbox" 
                  id="lore-lock" 
                  checked={formLocked} 
                  onChange={(e) => setFormLocked(e.target.checked)} 
                />
                <label htmlFor="lore-lock" style={{ margin: 0, cursor: 'pointer' }}>
                  Lock entry (Prevents deletion from catalog)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} id="cancel-lore-modal-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-lore-modal-btn">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        title="Purge Codex Entry?" 
        message="Warning: This action will permanently remove this record from the Lore Codex. Core locked entries cannot be deleted." 
        onConfirm={confirmDelete} 
        onCancel={() => setIsConfirmOpen(false)} 
      />

    </div>
  );
};
