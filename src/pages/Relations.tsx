import React, { useEffect, useRef, useState } from 'react';
import { Network, Plus, ShieldAlert } from 'lucide-react';
import { db } from '../db/localDb';
import { LoreValidation } from '../lib/lore-validation';
import { RulesEngine } from '../lib/rules-engine';
import { Relationship, Character, DatabaseState, Faction, RelationshipType, TimelineScope } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface RelationsProps {
  state: DatabaseState;
  onStateChange: () => void;
}

export const Relations: React.FC<RelationsProps> = ({ state, onStateChange }) => {
  const { relationships: allRelationships, characters: allCharacters, factions, timeline } = state;
  const gameplayMeta = state.gameplayMeta || db.getGameplayMeta();
  const campaignOutcome = RulesEngine.evaluateCampaignOutcome(state);
  const campaignLocked = campaignOutcome.phase !== 'active';
  const characters = allCharacters
    .map((character: Character) => ({
      ...character,
      ...(timeline.current !== 'custom'
        ? character.timelineStates?.[timeline.current as Exclude<TimelineScope, 'custom'>]
        : undefined)
    }))
    .filter((character: Character) => {
      const source = allCharacters.find((candidate: Character) => candidate.id === character.id) || character;
      const hasProjection = timeline.current !== 'custom'
        && Boolean(source.timelineStates?.[timeline.current as Exclude<TimelineScope, 'custom'>]);
      return (hasProjection || LoreValidation.isAvailableAtTimeline(source.timelineScope, timeline.current))
        && RulesEngine.isContentVisible(source, timeline);
    });
  const visibleCharacterIds = new Set(characters.map((character: Character) => character.id));
  const relationships = allRelationships.filter((relationship: Relationship) => (
    visibleCharacterIds.has(relationship.charAId) && visibleCharacterIds.has(relationship.charBId)
  ));

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRel, setEditingRel] = useState<Relationship | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [operationMessage, setOperationMessage] = useState<string | null>(null);

  // Confirm delete modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Network graph selection state
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  // Form Fields
  const [formCharA, setFormCharA] = useState('');
  const [formCharB, setFormCharB] = useState('');
  const [formType, setFormType] = useState<RelationshipType>('ally');
  const [formNotes, setFormNotes] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    modalRef.current?.querySelector<HTMLElement>('select, textarea, button')?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsModalOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      previouslyFocused?.focus();
    };
  }, [isModalOpen]);

  // Handle Edit click
  const handleEdit = (rel: Relationship) => {
    if (campaignLocked) {
      setOperationMessage('The Simulation AU campaign outcome is ready or finalized; relationship operations are locked.');
      return;
    }
    setEditingRel(rel);
    setFormCharA(rel.charAId);
    setFormCharB(rel.charBId);
    setFormType(rel.type);
    setFormNotes(rel.notes);
    setValidationError(null);
    setIsModalOpen(true);
  };

  // Handle Create click
  const handleCreate = () => {
    if (campaignLocked) {
      setOperationMessage('The Simulation AU campaign outcome is ready or finalized; relationship operations are locked.');
      return;
    }
    setEditingRel(null);
    setFormCharA(characters[0]?.id || '');
    setFormCharB(characters[1]?.id || '');
    setFormType('ally');
    setFormNotes('');
    setValidationError(null);
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSaveRel = (e: React.FormEvent) => {
    e.preventDefault();

    if (!characters.some((character) => character.id === formCharA) || !characters.some((character) => character.id === formCharB)) {
      setValidationError('Choose two valid characters.');
      return;
    }

    if (formCharA === formCharB) {
      setValidationError('Cannot establish a relationship link between a character and themselves.');
      return;
    }

    const duplicate = allRelationships.some((relationship) =>
      relationship.id !== editingRel?.id
      && ((relationship.charAId === formCharA && relationship.charBId === formCharB)
        || (relationship.charAId === formCharB && relationship.charBId === formCharA))
      && relationship.type === formType
    );
    if (duplicate) {
      setValidationError('This relationship type is already logged for that pair.');
      return;
    }

    let sequence = allRelationships.length + 1;
    let generatedId = `rel_user_${sequence}`;
    while (allRelationships.some(relationship => relationship.id === generatedId)) {
      sequence += 1;
      generatedId = `rel_user_${sequence}`;
    }
    const newRel: Relationship = {
      id: editingRel ? editingRel.id : generatedId,
      charAId: formCharA,
      charBId: formCharB,
      type: formType,
      notes: formNotes.trim()
    };

    let consequenceSummary = '';
    const saved = db.transaction('RELATION_SAVE', (draft) => {
      const hasValidA = draft.characters.some(character => character.id === newRel.charAId);
      const hasValidB = draft.characters.some(character => character.id === newRel.charBId);
      if (!hasValidA || !hasValidB || newRel.charAId === newRel.charBId) {
        throw new Error('The relationship endpoints are no longer valid.');
      }
      const hasDuplicate = draft.relationships.some(relationship => relationship.id !== newRel.id
        && ((relationship.charAId === newRel.charAId && relationship.charBId === newRel.charBId)
          || (relationship.charAId === newRel.charBId && relationship.charBId === newRel.charAId))
        && relationship.type === newRel.type);
      if (hasDuplicate) throw new Error('This relationship type is already logged for that pair.');

      const existingIndex = draft.relationships.findIndex(relationship => relationship.id === newRel.id);
      if (existingIndex >= 0) draft.relationships[existingIndex] = newRel;
      else draft.relationships.push(newRel);

      const marker = `relationship-effect:${newRel.id}:${newRel.type}`;
      if (!draft.gameplayMeta!.completedMilestones.includes(marker)) {
        const consequence = RulesEngine.applyRelationshipConsequence(
          draft.reputation,
          draft.factions,
          newRel.type,
          'establish'
        );
        draft.reputation = consequence.reputation;
        draft.factions = consequence.factions;
        draft.gameplayMeta!.completedMilestones.push(marker);
        consequenceSummary = consequence.summary;
      }
    }, {
      action: editingRel ? 'RELATION_UPDATE' : 'RELATION_CREATE',
      details: `${editingRel ? 'Updated' : 'Logged'} a ${newRel.type} Simulation AU operational relationship.`
    });
    if (!saved) {
      setValidationError(db.getStorageStatus().lastError?.message || 'The relationship could not be saved.');
      return;
    }
    setIsModalOpen(false);
    setOperationMessage(consequenceSummary || 'Relationship saved. Its one-time operational consequence was already applied earlier.');
    onStateChange();
  };

  // Handle Delete
  const handleDeleteTrigger = (id: string) => {
    if (campaignLocked) {
      setOperationMessage('The Simulation AU campaign outcome is ready or finalized; relationship operations are locked.');
      return;
    }
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      let consequenceSummary = '';
      const removed = db.transaction('RELATION_DELETE', (draft) => {
        const relationship = draft.relationships.find(candidate => candidate.id === deleteTargetId);
        if (!relationship) throw new Error('The relationship no longer exists.');
        const marker = `relationship-remove:${relationship.id}:${relationship.type}`;
        if (!draft.gameplayMeta!.completedMilestones.includes(marker)) {
          const consequence = RulesEngine.applyRelationshipConsequence(
            draft.reputation,
            draft.factions,
            relationship.type,
            'remove'
          );
          draft.reputation = consequence.reputation;
          draft.factions = consequence.factions;
          draft.gameplayMeta!.completedMilestones.push(marker);
          consequenceSummary = consequence.summary;
        }
        draft.relationships = draft.relationships.filter(candidate => candidate.id !== relationship.id);
      }, {
        action: 'RELATION_DELETE',
        details: 'Removed a Simulation AU operational relationship and applied its one-time consequence.'
      });
      if (removed) {
        setIsConfirmOpen(false);
        setDeleteTargetId(null);
        setOperationMessage(consequenceSummary || 'Relationship removed. Its one-time operational consequence was already applied earlier.');
        onStateChange();
      }
    }
  };

  const handleFactionOperation = (faction: Faction) => {
    const operation = RulesEngine.getFactionOperation(faction.id);
    if (!operation || campaignLocked) {
      setOperationMessage(campaignLocked
        ? 'The Simulation AU campaign outcome is ready or finalized; faction operations are locked.'
        : 'No operational action is defined for this faction.');
      return;
    }
    const cooldownKey = `faction:${faction.id}`;
    const nextAvailableDay = gameplayMeta.cooldowns[cooldownKey] || 0;
    if (nextAvailableDay > gameplayMeta.campaignDay) {
      setOperationMessage(`${operation.title} is available again on Campaign Day ${nextAvailableDay}.`);
      return;
    }

    const applied = db.transaction(`FACTION_OPERATION:${faction.id}`, (draft) => {
      const meta = draft.gameplayMeta!;
      if (RulesEngine.evaluateCampaignOutcome(draft).phase !== 'active') {
        throw new Error('The campaign outcome now locks faction operations.');
      }
      if ((meta.cooldowns[cooldownKey] || 0) > meta.campaignDay) {
        throw new Error(`This faction operation is on cooldown until Campaign Day ${meta.cooldowns[cooldownKey]}.`);
      }
      if (!draft.factions.some(candidate => candidate.id === faction.id)) {
        throw new Error('The faction is no longer present.');
      }
      const consequence = RulesEngine.applyFactionOperation(draft.reputation, draft.factions, operation);
      draft.reputation = consequence.reputation;
      draft.factions = consequence.factions;
      meta.cooldowns[cooldownKey] = meta.campaignDay + 3;
    }, {
      action: `FACTION_OPERATION:${faction.id}`,
      details: `${operation.title}. ${operation.summary}`
    });
    if (!applied) {
      setOperationMessage(db.getStorageStatus().lastError?.message || 'The faction operation failed atomically.');
      return;
    }
    setOperationMessage(`${operation.title}: ${operation.summary} Cooldown: 3 campaign days.`);
    onStateChange();
  };

  // Find contract-bound threats
  const contractThreats = relationships.filter((r: Relationship) => 
    r.type === 'contract_bound'
  );

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Factions & Relationships</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Map out political alignments in Hell, trace demonic contracts, and review social connections.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleCreate} id="add-relationship-btn" disabled={characters.length < 2 || campaignLocked}>
          <Plus size={16} />
          Log Relationship Link
        </button>
      </div>

      {(operationMessage || campaignLocked) && (
        <div
          className="glass-panel"
          role="status"
          style={{ padding: '12px 16px', marginBottom: '20px', borderLeft: `4px solid ${campaignLocked ? 'var(--status-high)' : 'var(--color-gold)'}` }}
        >
          <strong style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '3px' }}>
            Simulation AU operational consequences
          </strong>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            {operationMessage || `${campaignOutcome.title}. Relationship and faction actions are locked until the campaign is finalized.`}
          </span>
        </div>
      )}

      {/* Main Grid: Factions List & Contract Warnings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left Side: Faction Influence Tracker */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px' }}>
            Simulation Faction Influence
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {factions.map((f: Faction) => {
              const operation = RulesEngine.getFactionOperation(f.id);
              const nextAvailableDay = gameplayMeta.cooldowns[`faction:${f.id}`] || 0;
              const isCoolingDown = nextAvailableDay > gameplayMeta.campaignDay;
              return (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, width: '150px', flexShrink: 0 }}>{f.name}</span>
                  <div style={{ flex: 1, minWidth: '120px', height: '6px', backgroundColor: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${f.influence}%`, backgroundColor: f.id === 'hotel' ? 'var(--color-primary)' : 'var(--color-gold-dark)' }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, width: '35px', textAlign: 'right' }}>{f.influence}%</span>
                  {operation && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.68rem' }}
                      onClick={() => handleFactionOperation(f)}
                      disabled={campaignLocked || isCoolingDown}
                      title={isCoolingDown ? `Available on Campaign Day ${nextAvailableDay}` : operation.summary}
                    >
                      {isCoolingDown ? `Day ${nextAvailableDay}` : operation.title}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Contract warning board */}
        <div className="glass-panel" style={{ padding: '20px', backgroundColor: 'rgba(114, 28, 36, 0.12)', border: '1px solid rgba(168, 32, 42, 0.3)' }}>
          <h3 style={{ color: '#ff6b7a', marginBottom: '12px', borderBottom: '1px solid rgba(168, 32, 42, 0.4)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} />
            Contract Alerts (Vulnerabilities)
          </h3>

          {contractThreats.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
              No contract-bound vulnerabilities logged in relationship directories.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
              {contractThreats.map((rel: Relationship) => {
                const charA = characters.find((c: Character) => c.id === rel.charAId);
                const charB = characters.find((c: Character) => c.id === rel.charBId);

                return (
                  <div key={rel.id} style={{ padding: '8px 12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '4px', borderLeft: '3px solid var(--status-high)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '2px' }}>
                      {charA?.name} ⬌ {charB?.name}
                    </div>
                    <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                      "{rel.notes}"
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Visual Relationship Network Block */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
          Interactive Relationship Network & Deal Ledger
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          
          {/* Left Column: Interactive SVG Graph */}
          <div className="svg-graph-container" style={{ position: 'relative', height: '480px', border: '1px solid var(--border-gold-dark)' }}>
            
            {/* SVG Canvas */}
            <svg viewBox="0 0 500 460" style={{ width: '100%', height: '100%', backgroundColor: 'rgba(12, 8, 9, 0.6)' }}>
              
              {/* Definitions for arrow markers / special fills */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-gold-dark)" />
                </marker>
              </defs>

              {/* 1. Draw Links */}
              {relationships.map((rel: Relationship) => {
                const charA = characters.find((c: Character) => c.id === rel.charAId);
                const charB = characters.find((c: Character) => c.id === rel.charBId);
                if (!charA || !charB) return null;

                // Position maps
                const nodePositions: Record<string, { x: number; y: number }> = {
                  charlie: { x: 250, y: 70 },
                  vaggie: { x: 140, y: 150 },
                  alastor: { x: 360, y: 150 },
                  angeldust: { x: 90, y: 270 },
                  husk: { x: 250, y: 270 },
                  niffty: { x: 410, y: 270 },
                  sirpentious: { x: 250, y: 390 }
                };

                const getPos = (charId: string) => {
                  if (nodePositions[charId]) return nodePositions[charId];
                  // If custom sinner, place in circular arc at the bottom
                  const index = characters.filter((c: Character) => !nodePositions[c.id]).findIndex((c: Character) => c.id === charId);
                  const total = characters.filter((c: Character) => !nodePositions[c.id]).length;
                  const angle = (index / Math.max(1, total)) * Math.PI + Math.PI * 0.1;
                  return {
                    x: 250 + 180 * Math.cos(angle),
                    y: 270 + 130 * Math.sin(angle)
                  };
                };

                const posA = getPos(rel.charAId);
                const posB = getPos(rel.charBId);

                // Highlight state
                const isHighlighted = selectedCharId === null || rel.charAId === selectedCharId || rel.charBId === selectedCharId;
                
                // Styling based on relation type
                let strokeColor = 'rgba(255,255,255,0.2)';
                let strokeWidth = 1.5;
                let strokeDash = '';
                let filterGlow = '';

                if (rel.type === 'romantic') {
                  strokeColor = '#ff6b7a';
                  strokeWidth = 3;
                  filterGlow = 'drop-shadow(0 0 2px rgba(255, 107, 122, 0.8))';
                } else if (rel.type === 'contract_bound') {
                  strokeColor = '#28a745'; // Glowing contract green
                  strokeWidth = 4;
                  strokeDash = '6, 3'; // Chain link design
                  filterGlow = 'drop-shadow(0 0 3px rgba(40, 167, 69, 0.8))';
                } else if (rel.type === 'ally') {
                  strokeColor = '#4ce06c';
                  strokeDash = '4, 4';
                } else if (rel.type === 'enemy') {
                  strokeColor = '#ff3b30';
                  strokeWidth = 2;
                  strokeDash = '2, 1';
                } else if (rel.type === 'manipulative') {
                  strokeColor = '#fd7e14';
                  strokeDash = '5, 2';
                }

                return (
                  <g key={rel.id} style={{ opacity: isHighlighted ? 1 : 0.1, transition: 'opacity 0.3s ease' }}>
                    {/* Visual Line */}
                    <line
                      x1={posA.x}
                      y1={posA.y}
                      x2={posB.x}
                      y2={posB.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDash}
                      style={{ filter: filterGlow }}
                    />
                    
                    {/* Small visual icon centered on the link */}
                    <circle
                      cx={(posA.x + posB.x) / 2}
                      cy={(posA.y + posB.y) / 2}
                      r={7}
                      fill="var(--bg-main)"
                      stroke={strokeColor}
                      strokeWidth={1}
                    />
                    <text
                      x={(posA.x + posB.x) / 2}
                      y={(posA.y + posB.y) / 2 + 3}
                      textAnchor="middle"
                      fill={strokeColor}
                      fontSize="8px"
                      fontWeight="bold"
                    >
                      {rel.type === 'romantic' ? '♥' : rel.type === 'contract_bound' ? '⛓' : '⚡'}
                    </text>
                  </g>
                );
              })}

              {/* 2. Draw Nodes */}
              {characters.map((char: Character) => {
                const nodePositions: Record<string, { x: number; y: number }> = {
                  charlie: { x: 250, y: 70 },
                  vaggie: { x: 140, y: 150 },
                  alastor: { x: 360, y: 150 },
                  angeldust: { x: 90, y: 270 },
                  husk: { x: 250, y: 270 },
                  niffty: { x: 410, y: 270 },
                  sirpentious: { x: 250, y: 390 }
                };

                const getPos = (charId: string) => {
                  if (nodePositions[charId]) return nodePositions[charId];
                  const index = characters.filter((c: Character) => !nodePositions[c.id]).findIndex((c: Character) => c.id === charId);
                  const total = characters.filter((c: Character) => !nodePositions[c.id]).length;
                  const angle = (index / Math.max(1, total)) * Math.PI + Math.PI * 0.1;
                  return {
                    x: 250 + 180 * Math.cos(angle),
                    y: 270 + 130 * Math.sin(angle)
                  };
                };

                const pos = getPos(char.id);
                const isSelected = selectedCharId === char.id;
                
                // Highlight state
                const isRelated = selectedCharId === null || 
                                  char.id === selectedCharId || 
                                  relationships.some((r: Relationship) => 
                                    (r.charAId === selectedCharId && r.charBId === char.id) ||
                                    (r.charBId === selectedCharId && r.charAId === char.id)
                                  );

                const initials = char.name.split(' ').map((n: string) => n[0]).join('');

                return (
                  <g 
                    key={char.id} 
                    className="graph-node"
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect ${char.name}'s relationships`}
                    onClick={() => setSelectedCharId(isSelected ? null : char.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setSelectedCharId(isSelected ? null : char.id);
                      }
                    }}
                    style={{ 
                      opacity: isRelated ? 1 : 0.2, 
                      transition: 'opacity 0.3s ease, transform 0.2s ease'
                    }}
                  >
                    {/* Outer Crest Ring */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={20}
                      fill="var(--bg-main)"
                      stroke={isSelected ? 'var(--color-gold)' : 'var(--color-primary-light)'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      style={{ filter: isSelected ? 'drop-shadow(0 0 6px var(--color-gold))' : 'none' }}
                    />
                    
                    {/* Initials Text */}
                    <text
                      x={pos.x}
                      y={pos.y + 4}
                      textAnchor="middle"
                      className="graph-node-avatar-text"
                      style={{ fill: isSelected ? 'var(--color-gold)' : 'var(--color-text-main)' }}
                    >
                      {initials}
                    </text>

                    {/* Small Tag for name hover */}
                    <title>{char.name} ({char.type})</title>
                  </g>
                );
              })}

            </svg>
            
            {/* Graph Legend Overlay */}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(12,8,9,0.9)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '3px', backgroundColor: '#ff6b7a' }} />
                <span>Romance</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '3px', borderTop: '2px dashed #28a745' }} />
                <span>Soul Deal Contract</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '3px', borderTop: '2px dashed #4ce06c' }} />
                <span>Allies</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '3px', borderTop: '2px dotted #ff3b30' }} />
                <span>Enemies / Rivals</span>
              </div>
            </div>

            {/* Clear Button */}
            {selectedCharId && (
              <button 
                type="button"
                className="btn btn-secondary" 
                style={{ position: 'absolute', top: '12px', right: '12px', padding: '4px 8px', fontSize: '0.7rem' }}
                onClick={() => setSelectedCharId(null)}
              >
                Reset Network Focus
              </button>
            )}
          </div>

          {/* Right Column: Dynamic Detail Panel */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.15)', height: '480px', overflowY: 'auto' }}>
            
            {!selectedCharId ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-muted)', padding: '20px' }}>
                <Network size={40} style={{ color: 'var(--color-gold-dark)', marginBottom: '12px', opacity: 0.5 }} />
                <h4>Demonic Relationship Graph</h4>
                <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                  Click on any node in the network to inspect active deals, contracts, and romantic connections of that entity.
                </p>
              </div>
            ) : (() => {
              const char = characters.find((c: Character) => c.id === selectedCharId);
              if (!char) return null;
              
              const activeLinks = relationships.filter((r: Relationship) => 
                r.charAId === selectedCharId || r.charBId === selectedCharId
              );

              return (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    {/* Header */}
                    <div style={{ borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px', marginBottom: '12px' }}>
                      <h4 style={{ color: 'var(--color-gold)', fontSize: '1.2rem' }}>{char.name}</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        {char.type}{char.rank && char.rank !== 'none' ? ` • ${char.rank}` : ''} ({char.role}) — {char.riskLevel} simulation risk
                      </span>
                    </div>

                    {/* Active Links list */}
                    <h5 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Connected Bonds ({activeLinks.length})
                    </h5>

                    {activeLinks.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
                        No social connections registered for this entity.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                        {activeLinks.map((rel: Relationship) => {
                          const otherChar = characters.find((c: Character) => c.id === (rel.charAId === selectedCharId ? rel.charBId : rel.charAId));
                          const isContract = rel.type === 'contract_bound';

                          return (
                            <div 
                              key={rel.id} 
                              style={{ 
                                padding: '10px', 
                                backgroundColor: isContract ? 'rgba(40,167,69,0.06)' : 'rgba(255,255,255,0.03)', 
                                border: isContract ? '1px solid rgba(40,167,69,0.2)' : '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '4px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                                  {otherChar?.name || 'Unknown'}
                                </strong>
                                <span style={{ 
                                  fontSize: '0.65rem', 
                                  padding: '1px 5px', 
                                  borderRadius: '3px',
                                  textTransform: 'uppercase',
                                  fontWeight: 'bold',
                                  backgroundColor: 
                                    rel.type === 'romantic' ? 'rgba(168,32,42,0.2)' :
                                    rel.type === 'contract_bound' ? 'rgba(40,167,69,0.2)' :
                                    'rgba(255,255,255,0.08)',
                                  color: 
                                    rel.type === 'romantic' ? '#ff6b7a' :
                                    rel.type === 'contract_bound' ? '#4ce06c' :
                                    'var(--color-text-muted)'
                                }}>
                                  {rel.type.replace('_', ' ')}
                                </span>
                              </div>
                              {rel.notes && (
                                <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--color-text-muted)', margin: 0 }}>
                                  "{rel.notes}"
                                </p>
                              )}
                              
                              {/* Edit / Delete quick buttons */}
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                                <button type="button" className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.65rem' }} onClick={() => handleEdit(rel)}>
                                  Edit Link
                                </button>
                                <button type="button" className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '0.65rem' }} onClick={() => handleDeleteTrigger(rel.id)}>
                                  Break Link
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Add Connection Launcher */}
                  <button 
                    type="button"
                    className="btn btn-gold" 
                    style={{ width: '100%', marginTop: '12px' }}
                    onClick={() => {
                      setFormCharA(selectedCharId);
                      const other = characters.find((c: Character) => c.id !== selectedCharId);
                      setFormCharB(other?.id || '');
                      setFormType('ally');
                      setFormNotes('');
                      setValidationError(null);
                      setEditingRel(null);
                      setIsModalOpen(true);
                    }}
                  >
                    + Establish New Connection for {char.name.split(' ')[0]}
                  </button>
                </div>
              );
            })()}

          </div>
        </div>
      </div>

      {/* Add / Edit Link Modal */}
      {isModalOpen && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsModalOpen(false);
          }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}
        >
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="relationship-dialog-title" className="glass-panel art-deco-border" style={{ width: '90%', maxWidth: '440px', padding: '24px' }}>
            <h2 id="relationship-dialog-title" style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px' }}>
              {editingRel ? 'Edit Relationship Link' : 'Register Relationship Connection'}
            </h2>

            {validationError && (
              <div style={{ backgroundColor: 'rgba(220, 53, 69, 0.15)', border: '1px solid var(--status-high)', color: '#ff6b7a', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                <ShieldAlert size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
                {validationError}
              </div>
            )}

            <form onSubmit={handleSaveRel} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label htmlFor="rel-char-a">Character A</label>
                <select 
                  id="rel-char-a" 
                  value={formCharA} 
                  onChange={(e) => setFormCharA(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {characters.map((c: Character) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="rel-type">Link Type</label>
                <select 
                  id="rel-type" 
                  value={formType} 
                  onChange={(e) => setFormType(e.target.value as RelationshipType)}
                  style={{ width: '100%' }}
                >
                  <option value="ally">Ally / Protective</option>
                  <option value="romantic">Romantic Partner</option>
                  <option value="family">Family relation</option>
                  <option value="staff">Staff colleague</option>
                  <option value="resident">Resident associate</option>
                  <option value="contract_bound">Contract Bound (Soul Debt)</option>
                  <option value="manipulative">Manipulative influence</option>
                  <option value="enemy">Enemy / Hostile rival</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label htmlFor="rel-char-b">Character B</label>
                <select 
                  id="rel-char-b" 
                  value={formCharB} 
                  onChange={(e) => setFormCharB(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {characters.map((c: Character) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="rel-notes">Diagnostic Notes / Relationship Summary</label>
                <textarea 
                  id="rel-notes" 
                  rows={3} 
                  value={formNotes} 
                  onChange={(e) => setFormNotes(e.target.value)} 
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="e.g. Soul contract bound. Charlie seeking ways to dissolve this bargain..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} id="cancel-rel-modal-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-rel-modal-btn">
                  Save Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={isConfirmOpen} 
        title="Remove Connection Link?" 
        message="Warning: This action will permanently remove this relationship connection record from the database." 
        onConfirm={confirmDelete} 
        onCancel={() => setIsConfirmOpen(false)} 
      />
    </div>
  );
};
