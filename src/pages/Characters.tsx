import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Trash2, HeartHandshake, ShieldAlert, FileText, UserPlus, Info, Images, X } from 'lucide-react';
import { db } from '../db/localDb';
import { RulesEngine } from '../lib/rules-engine';
import { LoreValidation } from '../lib/lore-validation';
import { Character, CharacterType, CharacterRank, CharacterRole, CharacterStatus, RiskLevel, CanonStatus, SpoilerLevel, TimelineScope, DatabaseState } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { CanonBadge } from '../components/CanonBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ViewType } from '../components/Sidebar';
import { useDialogFocus } from '../components/useDialogFocus';
import { getCharacterSpriteAsset, SPRITE_SHEETS } from '../lib/character-sprites';

interface CharactersProps {
  state: DatabaseState;
  onStateChange: () => void;
  searchQuery: string;
  onNavigate: (view: ViewType, targetId?: string) => void;
}

const getCharacterInitials = (name: string) => name
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map((part) => part[0] ?? '')
  .join('')
  .toUpperCase() || '?';

export const Characters: React.FC<CharactersProps> = ({ state, onStateChange, searchQuery, onNavigate }) => {
  const { characters, timeline } = state;

  // Filter states
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChar, setEditingChar] = useState<Character | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Confirm Delete Dialog state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSpriteGalleryOpen, setIsSpriteGalleryOpen] = useState(false);
  const [failedSpriteIds, setFailedSpriteIds] = useState<Set<string>>(() => new Set());
  const modalRef = useDialogFocus(isModalOpen, () => setIsModalOpen(false), '#char-name');
  const spriteGalleryRef = useDialogFocus(
    isSpriteGalleryOpen,
    () => setIsSpriteGalleryOpen(false),
    '#close-sprite-gallery'
  );

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formAlias, setFormAlias] = useState('');
  const [formType, setFormType] = useState<CharacterType>('sinner');
  const [formRank, setFormRank] = useState<CharacterRank>('none');
  const [formRole, setFormRole] = useState<CharacterRole>('resident');
  const [formStatus, setFormStatus] = useState<CharacterStatus>('resident');
  const [formRisk, setFormRisk] = useState<RiskLevel>('medium');
  const [formTrust, setFormTrust] = useState(50);
  const [formProgress, setFormProgress] = useState(10);
  const [formRehabTracked, setFormRehabTracked] = useState(true);
  const [formContracts, setFormContracts] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formCanonStatus, setFormCanonStatus] = useState<CanonStatus>('canon');
  const [formSourceRef, setFormSourceRef] = useState('');
  const [formSpoiler, setFormSpoiler] = useState<SpoilerLevel>('none');
  const [formTimeline, setFormTimeline] = useState<TimelineScope>('season_1_start');
  const [formDesc, setFormDesc] = useState('');

  // Handle Edit click
  const handleEdit = (char: Character) => {
    const source = characters.find((candidate: Character) => candidate.id === char.id) ?? char;
    setEditingChar(source);
    setFormName(source.name);
    setFormAlias(source.alias);
    setFormType(source.type === 'overlord' ? 'sinner' : source.type);
    setFormRank(source.rank ?? (source.type === 'overlord' ? 'overlord' : 'none'));
    setFormRole(source.role);
    setFormStatus(source.status);
    setFormRisk(source.riskLevel);
    setFormTrust(source.charlieTrust);
    setFormProgress(source.rehabProgress);
    setFormRehabTracked(source.rehabTracked ?? (source.status === 'resident' || source.status === 'applicant'));
    setFormContracts(source.contracts.join('\n'));
    setFormNotes(source.notes);
    setFormCanonStatus(source.canonStatus);
    setFormSourceRef(source.sourceRef);
    setFormSpoiler(source.spoilerLevel);
    setFormTimeline(source.timelineScope);
    setFormDesc(source.description);
    setValidationError(null);
    setIsModalOpen(true);
  };

  // Handle Create click
  const handleCreate = () => {
    setEditingChar(null);
    setFormName('');
    setFormAlias('');
    setFormType('sinner');
    setFormRank('none');
    setFormRole('resident');
    setFormStatus('resident');
    setFormRisk('medium');
    setFormTrust(50);
    setFormProgress(0);
    setFormRehabTracked(true);
    setFormContracts('');
    setFormNotes('');
    setFormCanonStatus('simulation_au');
    setFormSourceRef('');
    setFormSpoiler('none');
    setFormTimeline(timeline.current);
    setFormDesc('');
    setValidationError(null);
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim()) {
      setValidationError('Character name is required.');
      return;
    }

    const contractsArray = formContracts
      .split('\n')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    let sequence = characters.length + 1;
    let generatedId = `char_user_${sequence}`;
    while (characters.some((character: Character) => character.id === generatedId)) {
      sequence += 1;
      generatedId = `char_user_${sequence}`;
    }
    const characterData: Character = {
      ...(editingChar ?? {} as Character),
      id: editingChar ? editingChar.id : generatedId,
      name: formName.trim(),
      alias: formAlias.trim(),
      type: formType,
      rank: formRank,
      role: formRole,
      status: formStatus,
      riskLevel: formRisk,
      charlieTrust: formTrust,
      rehabProgress: formRehabTracked ? formProgress : 0,
      rehabTracked: formRehabTracked,
      operationalDataStatus: editingChar?.operationalDataStatus ?? 'simulation_au',
      contracts: contractsArray,
      notes: formNotes.trim(),
      canonStatus: formCanonStatus,
      sourceRef: formSourceRef.trim(),
      spoilerLevel: formSpoiler,
      timelineScope: formTimeline,
      description: formDesc.trim()
    };

    // 1. Redeemed Validation check
    const redeemedCheck = RulesEngine.validateRedeemedStatus(characterData, false);
    if (!redeemedCheck.isValid) {
      setValidationError(redeemedCheck.message || 'Validation error: Redeemed characters cannot be residents.');
      return;
    }

    // 2. Lore metadata format and timeline/spoiler coherence
    const metadataErrors = LoreValidation.validateCharacterMetadata(
      characterData.canonStatus,
      characterData.sourceRef,
      characterData.timelineScope,
      characterData.spoilerLevel
    );
    if (metadataErrors.length > 0) {
      setValidationError(metadataErrors.join(' '));
      return;
    }

    if (formStatus === 'redeemed' && editingChar?.status !== 'redeemed') {
      setValidationError('Redemption is a protected gameplay transition. Confirm it from the Rehabilitation Center.');
      return;
    }
    if ((formStatus === 'resident' || formStatus === 'applicant') && formRole !== 'resident') {
      setValidationError('Residents and applicants must use the operational resident role.');
      return;
    }

    // Save and close
    if (!db.saveCharacter(characterData)) {
      setValidationError(db.getStorageStatus().lastError?.message || 'The character could not be saved.');
      return;
    }
    setIsModalOpen(false);
    onStateChange();
  };

  // Handle Delete confirm
  const handleDeleteTrigger = (id: string) => {
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      db.deleteCharacter(deleteTargetId);
      setIsConfirmOpen(false);
      setDeleteTargetId(null);
      onStateChange();
    }
  };

  const markSpriteFailed = (characterId: string) => {
    setFailedSpriteIds((current) => {
      if (current.has(characterId)) return current;
      const next = new Set(current);
      next.add(characterId);
      return next;
    });
  };

  // Filter logic
  const projectedCharacters = characters.map((char: Character) => ({
    ...char,
    ...(timeline.current !== 'custom' ? char.timelineStates?.[timeline.current as Exclude<TimelineScope, 'custom'>] : undefined)
  }));

  const filteredCharacters = projectedCharacters.filter((char: Character) => {
    // Global search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchSearch = 
        char.name.toLowerCase().includes(query) || 
        char.alias.toLowerCase().includes(query) || 
        char.description.toLowerCase().includes(query);
      if (!matchSearch) return false;
    }

    // Role filter
    if (roleFilter !== 'all' && char.role !== roleFilter) return false;
    // Status filter
    if (statusFilter !== 'all' && char.status !== statusFilter) return false;
    // Risk filter
    if (riskFilter !== 'all' && char.riskLevel !== riskFilter) return false;

    const hasExplicitProjection = timeline.current !== 'custom' && Boolean(char.timelineStates?.[timeline.current as Exclude<TimelineScope, 'custom'>]);
    if (!hasExplicitProjection && !LoreValidation.isAvailableAtTimeline(char.timelineScope, timeline.current)) return false;

    // Spoiler check filter
    const visible = RulesEngine.isContentVisible(char, timeline);
    if (!visible) return false;

    return true;
  });

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Residents & Staff Directory</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Register new sinners, organize security levels, and track redemption plans.
          </p>
        </div>
        <div className="character-directory-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setIsSpriteGalleryOpen(true)} id="open-sprite-gallery">
            <Images size={16} aria-hidden="true" />
            Sprite Atlases
          </button>
          <button className="btn btn-primary" onClick={handleCreate} id="add-character-btn">
            <UserPlus size={16} aria-hidden="true" />
            Register Guest/Staff
          </button>
        </div>
      </div>

      {/* Filter Bar */}
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
          <label htmlFor="filter-role">Role Filter</label>
          <select 
            id="filter-role" 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="all">All Roles</option>
            <option value="founder">Founder</option>
            <option value="manager">Manager</option>
            <option value="resident">Resident</option>
            <option value="bartender">Bartender</option>
            <option value="housekeeper">Housekeeper</option>
            <option value="sponsor">Sponsor/Patron</option>
            <option value="security">Security Staff</option>
            <option value="antagonist">Antagonist</option>
            <option value="ally">External Ally</option>
            <option value="external">External Authority</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label htmlFor="filter-status">Hotel Status</label>
          <select 
            id="filter-status" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="all">All Statuses</option>
            <option value="staff">Staff</option>
            <option value="resident">Active Resident</option>
            <option value="applicant">Applicant</option>
            <option value="banned">Banned</option>
            <option value="redeemed">Redeemed Souls</option>
            <option value="external">External Only</option>
            <option value="deceased">Deceased</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label htmlFor="filter-risk">Risk Level</label>
          <select 
            id="filter-risk" 
            value={riskFilter} 
            onChange={(e) => setRiskFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="catastrophic">Catastrophic Threat</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {filteredCharacters.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Info size={40} style={{ color: 'var(--color-gold-dark)', marginBottom: '12px' }} />
          <h3>No profiles match the filter criteria.</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Try clearing your search or filter inputs.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredCharacters.map((char: Character) => {
            const hasRehabPlan = state.rehabilitationPlans.some((plan) => plan.characterId === char.id);
            const isResidentType = char.status === 'resident' || char.status === 'applicant';
            const spriteAsset = getCharacterSpriteAsset(char.id);
            const hasSpritePortrait = Boolean(spriteAsset) && !failedSpriteIds.has(char.id);

            return (
              <div 
                key={char.id} 
                id={`character-card-${char.id}`}
                className="glass-panel animate-fade-in" 
                style={{ 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  borderTop: char.status === 'staff' ? '3px solid var(--color-gold)' : '1px solid var(--color-primary-light)',
                  boxShadow: char.riskLevel === 'catastrophic' ? '0 0 10px rgba(168, 32, 42, 0.25)' : 'none'
                }}
              >
                <div>
                  {/* Header row */}
                  <div className="character-profile-header">
                    <div className="character-profile-identity">
                      <div className="character-sprite-frame" aria-hidden="true">
                        <span className="character-sprite-fallback">{getCharacterInitials(char.name)}</span>
                        {spriteAsset && hasSpritePortrait && (
                          <img
                            className="character-sprite-portrait"
                            src={spriteAsset.portrait}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            width={512}
                            height={512}
                            onError={() => markSpriteFailed(char.id)}
                          />
                        )}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>{char.name}</h3>
                        {char.alias && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontStyle: 'italic' }}>
                            "{char.alias}"
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                      <RiskBadge level={char.riskLevel} />
                      <CanonBadge status={char.canonStatus} sourceRef={char.sourceRef} />
                    </div>
                  </div>

                  {/* Badges/Types info */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0 12px 0' }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '3px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-text-main)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Species: {char.type === 'overlord' ? 'sinner (legacy)' : char.type}
                    </span>
                    {char.rank && char.rank !== 'none' && (
                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '3px', backgroundColor: 'rgba(212,175,55,0.1)', color: 'var(--color-gold)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Rank: {char.rank.replace('_', ' ')}
                      </span>
                    )}
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Role: {char.role}
                    </span>
                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '3px', backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Status: {char.status}
                    </span>
                    {char.operationalDataStatus === 'simulation_au' && (
                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '3px', backgroundColor: 'rgba(255,145,0,0.1)', color: '#ffb454', textTransform: 'uppercase', fontWeight: 600 }}>
                        Metrics: Simulation AU
                      </span>
                    )}
                  </div>

                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '14px', lineHeight: 1.5 }}>
                    {char.description}
                  </p>

                  {/* Progress logs (Charlie Trust & Rehab Progress) */}
                  {isResidentType && char.rehabTracked !== false && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                          <span>Trust in Charlie</span>
                          <span style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{char.charlieTrust}%</span>
                        </div>
                        <div style={{ height: '4px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${char.charlieTrust}%`, backgroundColor: 'var(--color-gold)' }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                          <span>Rehabilitation Score</span>
                          <span style={{ fontWeight: 600, color: '#4ce06c' }}>{char.rehabProgress}%</span>
                        </div>
                        <div style={{ height: '4px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${char.rehabProgress}%`, backgroundColor: '#28a745' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contracts & Dealing terms */}
                  {char.contracts.length > 0 && (
                    <div style={{ marginBottom: '14px', fontSize: '0.75rem', backgroundColor: 'rgba(168, 32, 42, 0.08)', padding: '8px', borderRadius: '4px', border: '1px dashed rgba(168, 32, 42, 0.3)' }}>
                      <span style={{ fontWeight: 'bold', color: '#ff6b7a', display: 'block', marginBottom: '2px', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                        Active Binding Contracts
                      </span>
                      {char.contracts.map((c, i) => (
                        <div key={i} style={{ color: 'var(--color-text-main)' }}>• {c}</div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => handleEdit(char)} title="Edit profile information" aria-label={`Edit ${char.name}`} id={`edit-${char.id}`}>
                      <Edit2 size={12} aria-hidden="true" />
                    </button>
                    <button type="button" className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleDeleteTrigger(char.id)} title="Delete character profile" aria-label={`Delete ${char.name}`} id={`delete-${char.id}`}>
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </div>
                  {isResidentType && char.rehabTracked !== false && (
                    <button 
                      className="btn btn-gold" 
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }} 
                      onClick={() => onNavigate('rehab', char.id)}
                      id={`rehab-${char.id}`}
                    >
                      <HeartHandshake size={12} />
                      {hasRehabPlan ? 'Plan Progress' : 'Initiate Plan'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isSpriteGalleryOpen && createPortal(
        <div
          className="sprite-gallery-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsSpriteGalleryOpen(false);
          }}
        >
          <div
            ref={spriteGalleryRef}
            tabIndex={-1}
            className="glass-panel art-deco-border sprite-gallery-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sprite-gallery-title"
            aria-describedby="sprite-gallery-description"
          >
            <div className="sprite-gallery-heading">
              <div>
                <h2 id="sprite-gallery-title">Character Sprite Atlases</h2>
                <p id="sprite-gallery-description">
                  OpenAI-generated animation poses based on full-body series references. Canon designs and Simulation AU originals remain explicitly separated.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary sprite-gallery-close"
                id="close-sprite-gallery"
                onClick={() => setIsSpriteGalleryOpen(false)}
                aria-label="Close sprite atlas gallery"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="sprite-atlas-grid">
              {SPRITE_SHEETS.map((sheet) => (
                <figure className="sprite-atlas-card" key={sheet.id}>
                  <div className="sprite-transparency-grid">
                    <img
                      src={sheet.path}
                      alt={`${sheet.title}: ${sheet.characters.join(', ')}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <figcaption>
                    <strong>{sheet.title}</strong>
                    <span>{sheet.characters.join(' · ')}</span>
                    <small>{sheet.continuity}</small>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div onMouseDown={(event) => { if (event.target === event.currentTarget) setIsModalOpen(false); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div ref={modalRef} tabIndex={-1} className="glass-panel art-deco-border" role="dialog" aria-modal="true" aria-labelledby="character-dialog-title" style={{ width: '90%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <h2 id="character-dialog-title" style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px' }}>
              {editingChar ? `Edit Profile: ${editingChar.name}` : 'Register New Character'}
            </h2>

            {validationError && (
              <div role="alert" style={{ backgroundColor: 'rgba(220, 53, 69, 0.15)', border: '1px solid var(--status-high)', color: '#ff6b7a', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                {validationError}
              </div>
            )}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="char-name">Character Name *</label>
                  <input type="text" id="char-name" value={formName} onChange={(e) => setFormName(e.target.value)} style={{ width: '100%' }} placeholder="Charlie Morningstar" />
                </div>
                <div>
                  <label htmlFor="char-alias">Alias / Title</label>
                  <input type="text" id="char-alias" value={formAlias} onChange={(e) => setFormAlias(e.target.value)} style={{ width: '100%' }} placeholder="Princess of Hell" />
                </div>

                <div>
                  <label htmlFor="char-type">Species / Origin</label>
                  <select id="char-type" value={formType} onChange={(e) => setFormType(e.target.value as CharacterType)} disabled={editingChar?.status === 'redeemed'} style={{ width: '100%' }}>
                    <option value="sinner">Sinner (Damned Soul)</option>
                    <option value="hellborn">Hellborn</option>
                    <option value="angel">Angel</option>
                    <option value="fallen_angel">Fallen Angel</option>
                    {editingChar?.status === 'redeemed' && <option value="redeemed_soul">Redeemed Soul (workflow confirmed)</option>}
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="char-rank">Social / Celestial Rank</label>
                  <select id="char-rank" value={formRank} onChange={(e) => setFormRank(e.target.value as CharacterRank)} style={{ width: '100%' }}>
                    <option value="none">No confirmed rank</option>
                    <option value="royalty">Royalty</option>
                    <option value="overlord">Overlord</option>
                    <option value="former_overlord">Former Overlord</option>
                    <option value="seraph">Seraph</option>
                    <option value="exorcist">Exorcist</option>
                    <option value="former_exorcist">Former Exorcist</option>
                    <option value="exorcist_commander">Exorcist Commander</option>
                    <option value="unknown">Unknown / Unconfirmed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="char-role">Operational Role</label>
                  <select id="char-role" value={formRole} onChange={(e) => setFormRole(e.target.value as CharacterRole)} disabled={editingChar?.status === 'redeemed'} style={{ width: '100%' }}>
                    <option value="founder">Founder</option>
                    <option value="manager">Manager</option>
                    <option value="resident">Resident</option>
                    <option value="bartender">Bartender</option>
                    <option value="housekeeper">Housekeeper</option>
                    <option value="sponsor">Sponsor / Patron</option>
                    <option value="security">Security</option>
                    <option value="antagonist">Antagonist</option>
                    <option value="ally">External Ally</option>
                    <option value="external">External Authority</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="char-status">Hotel Status</label>
                  <select id="char-status" value={formStatus} onChange={(e) => setFormStatus(e.target.value as CharacterStatus)} disabled={editingChar?.status === 'redeemed'} style={{ width: '100%' }}>
                    <option value="staff">Hotel Staff</option>
                    <option value="resident">Active Resident</option>
                    <option value="applicant">Applicant</option>
                    <option value="banned">Banned</option>
                    {editingChar?.status === 'redeemed' && <option value="redeemed">Redeemed (confirmed, read-only)</option>}
                    <option value="external">External</option>
                    <option value="deceased">Deceased</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="char-risk">Risk / Danger Rating</label>
                  <select id="char-risk" value={formRisk} onChange={(e) => setFormRisk(e.target.value as RiskLevel)} disabled={editingChar?.status === 'redeemed'} style={{ width: '100%' }}>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                    <option value="catastrophic">Catastrophic Threat</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="char-trust">Trust in Charlie (0-100)%</label>
                  <input type="number" id="char-trust" min="0" max="100" value={formTrust} onChange={(e) => setFormTrust(parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
                </div>

                <div>
                  <label htmlFor="char-progress">Rehabilitation Progress (0-100)%</label>
                  <input type="number" id="char-progress" min="0" max="100" value={formProgress} readOnly disabled style={{ width: '100%' }} />
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>Derived from the four rehabilitation plan scores.</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input id="char-rehab-tracked" type="checkbox" checked={formRehabTracked} onChange={(e) => setFormRehabTracked(e.target.checked)} disabled={Boolean(editingChar && state.rehabilitationPlans.some((plan: { characterId: string }) => plan.characterId === editingChar.id))} />
                <label htmlFor="char-rehab-tracked" style={{ margin: 0 }}>
                  Track rehabilitation as Simulation AU gameplay data
                </label>
              </div>

              <div>
                <label htmlFor="char-desc">Brief Description (Non-copyrighted, clinical) *</label>
                <textarea id="char-desc" rows={2} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} style={{ width: '100%', resize: 'vertical' }} placeholder="Provide a brief clinical summary of the resident's situation..." />
              </div>

              <div>
                <label htmlFor="char-contracts">Active Binding Deals / Contracts (One per line)</label>
                <textarea id="char-contracts" rows={2} value={formContracts} onChange={(e) => setFormContracts(e.target.value)} style={{ width: '100%', resize: 'vertical' }} placeholder="e.g. Soul contract bound to Valentino..." />
              </div>

              {/* Lore Verification fields */}
              <div style={{ padding: '12px', border: '1px dashed var(--color-gold-dark)', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.15)', marginTop: '8px' }}>
                <h4 style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} />
                  Lore Verification Metadata
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label htmlFor="char-canon">Canon Status</label>
                    <select id="char-canon" value={formCanonStatus} onChange={(e) => setFormCanonStatus(e.target.value as CanonStatus)} style={{ width: '100%', fontSize: '0.8rem' }}>
                      <option value="canon">Canon Verified</option>
                      <option value="semi_canon">Semi-Canon (Creator State)</option>
                      <option value="simulation_au">Simulation AU (Gameplay)</option>
                      <option value="headcanon">Headcanon</option>
                      <option value="user_note">User Log / Custom</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="char-source">Source Reference (Required for Canon)</label>
                    <input type="text" id="char-source" value={formSourceRef} onChange={(e) => setFormSourceRef(e.target.value)} style={{ width: '100%', fontSize: '0.8rem' }} placeholder="e.g. S1E04, S1E08" />
                  </div>
                  <div>
                    <label htmlFor="char-spoiler">Spoiler Filter Level</label>
                    <select id="char-spoiler" value={formSpoiler} onChange={(e) => setFormSpoiler(e.target.value as SpoilerLevel)} style={{ width: '100%', fontSize: '0.8rem' }}>
                      <option value="none">No Spoilers (Pilot/Ep 1)</option>
                      <option value="season_1">Season 1 Spoilers</option>
                      <option value="season_2">Season 2 Spoilers</option>
                      <option value="future">Future Season Speculation</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="char-timeline">Timeline Scope</label>
                    <select id="char-timeline" value={formTimeline} onChange={(e) => setFormTimeline(e.target.value as TimelineScope)} style={{ width: '100%', fontSize: '0.8rem' }}>
                      <option value="pilot_legacy">Pilot Legacy</option>
                      <option value="season_1_start">Season 1 Opening / Mid-season</option>
                      <option value="season_1_end">Season 1 Finale</option>
                      <option value="season_2">Season 2 Active</option>
                      <option value="custom">Custom Timeline</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="char-notes">Private Notes / Diagnostics</label>
                <textarea id="char-notes" rows={2} value={formNotes} onChange={(e) => setFormNotes(e.target.value)} style={{ width: '100%', resize: 'vertical' }} placeholder="Notes on mental stability, reactions to group sessions, or threat monitoring..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} id="cancel-char-modal-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-char-modal-btn">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        title="Purge Character Profile?" 
        message="Warning: This action will permanently delete this character profile and break any room assignments or task logs associated with them. This cannot be undone." 
        onConfirm={confirmDelete} 
        onCancel={() => setIsConfirmOpen(false)} 
      />
    </div>
  );
};
