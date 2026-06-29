import React, { useState } from 'react';
import { Network, Plus, ShieldAlert, Edit2, Trash2, HelpCircle, Users, Link2, Info } from 'lucide-react';
import { db } from '../db/localDb';
import { Relationship, Character, Faction, RelationshipType } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface RelationsProps {
  state: any;
  onStateChange: () => void;
}

export const Relations: React.FC<RelationsProps> = ({ state, onStateChange }) => {
  const { relationships, characters, factions } = state;

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRel, setEditingRel] = useState<Relationship | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Confirm delete modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form Fields
  const [formCharA, setFormCharA] = useState('');
  const [formCharB, setFormCharB] = useState('');
  const [formType, setFormType] = useState<RelationshipType>('ally');
  const [formNotes, setFormNotes] = useState('');

  // Handle Edit click
  const handleEdit = (rel: Relationship) => {
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

    if (formCharA === formCharB) {
      setValidationError('Cannot establish a relationship link between a character and themselves.');
      return;
    }

    const newRel: Relationship = {
      id: editingRel ? editingRel.id : 'rel_' + Date.now(),
      charAId: formCharA,
      charBId: formCharB,
      type: formType,
      notes: formNotes.trim()
    };

    db.saveRelationship(newRel);
    setIsModalOpen(false);
    onStateChange();
  };

  // Handle Delete
  const handleDeleteTrigger = (id: string) => {
    setDeleteTargetId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      db.deleteRelationship(deleteTargetId);
      setIsConfirmOpen(false);
      setDeleteTargetId(null);
      onStateChange();
    }
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
        <button className="btn btn-primary" onClick={handleCreate} id="add-relationship-btn">
          <Plus size={16} />
          Log Relationship Link
        </button>
      </div>

      {/* Main Grid: Factions List & Contract Warnings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Left Side: Faction Influence Tracker */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '6px' }}>
            Faction Influence (Pentagram Hegemony)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {factions.map((f: Faction) => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, width: '150px', flexShrink: 0 }}>{f.name}</span>
                <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${f.influence}%`, backgroundColor: f.id === 'hotel' ? 'var(--color-primary)' : 'var(--color-gold-dark)' }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, width: '35px', textAlign: 'right' }}>{f.influence}%</span>
              </div>
            ))}
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

      {/* Bottom Block: Relationships List Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-primary-light)', paddingBottom: '8px' }}>
          Registered Bonds & Deal Ledger
        </h3>

        {relationships.length === 0 ? (
          <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            <Info size={32} style={{ color: 'var(--color-gold-dark)', marginBottom: '8px' }} />
            <p>No social connections registered in the database.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-primary-light)', color: 'var(--color-gold)' }}>
                  <th style={{ padding: '10px' }}>Character A</th>
                  <th style={{ padding: '10px' }}>Link Type</th>
                  <th style={{ padding: '10px' }}>Character B</th>
                  <th style={{ padding: '10px' }}>Diagnostic Notes</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {relationships.map((rel: Relationship) => {
                  const charA = characters.find((c: Character) => c.id === rel.charAId);
                  const charB = characters.find((c: Character) => c.id === rel.charBId);

                  return (
                    <tr key={rel.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }} className="rel-table-row">
                      <td style={{ padding: '10px', fontWeight: 600 }}>{charA?.name || rel.charAId}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          padding: '2px 6px', 
                          borderRadius: '3px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          backgroundColor: 
                            rel.type === 'romantic' ? 'rgba(168,32,42,0.15)' :
                            rel.type === 'contract_bound' ? 'rgba(220,53,69,0.15)' :
                            rel.type === 'ally' ? 'rgba(40,167,69,0.15)' :
                            'rgba(255,255,255,0.05)',
                          color:
                            rel.type === 'romantic' ? '#ff6b7a' :
                            rel.type === 'contract_bound' ? '#ff808b' :
                            rel.type === 'ally' ? '#4ce06c' :
                            'var(--color-text-muted)'
                        }}>
                          {rel.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{charB?.name || rel.charBId}</td>
                      <td style={{ padding: '10px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{rel.notes}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => handleEdit(rel)} id={`edit-rel-${rel.id}`}>
                            <Edit2 size={12} />
                          </button>
                          <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => handleDeleteTrigger(rel.id)} id={`delete-rel-${rel.id}`}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Link Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel art-deco-border" style={{ width: '90%', maxWidth: '440px', padding: '24px' }}>
            <h2 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px' }}>
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
