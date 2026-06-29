import React, { useState } from 'react';
import { Bed, Users, ShieldAlert, Sparkles, Hammer, LogOut, CheckCircle, Info } from 'lucide-react';
import { db } from '../db/localDb';
import { RulesEngine } from '../lib/rules-engine';
import { Room, Character, RoomType, RoomStatus, RiskLevel } from '../types';

interface RoomsProps {
  state: any;
  onStateChange: () => void;
}

export const Rooms: React.FC<RoomsProps> = ({ state, onStateChange }) => {
  const { rooms, characters } = state;

  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit / Assign Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  // Form Fields
  const [formOccupant, setFormOccupant] = useState<string>('');
  const [formStatus, setFormStatus] = useState<RoomStatus>('clean');
  const [formType, setFormType] = useState<RoomType>('standard');
  const [formDanger, setFormDanger] = useState<RiskLevel>('medium');
  const [formRestrictions, setFormRestrictions] = useState<string>('');
  const [formMaintNotes, setFormMaintNotes] = useState('');
  const [formRepairCost, setFormRepairCost] = useState(0);

  // Filter characters who can occupy rooms
  const eligibleTenants = characters.filter((c: Character) => 
    c.status === 'resident' || c.status === 'staff' || c.status === 'applicant'
  );

  // Filter staff members who can conduct inspections
  const staffMembers = characters.filter((c: Character) => c.status === 'staff');

  const handleOpenAssign = (room: Room) => {
    setSelectedRoom(room);
    setFormOccupant(room.occupantId || '');
    setFormStatus(room.status);
    setFormType(room.type);
    setFormDanger(room.dangerLevel);
    setFormRestrictions(room.restrictions.join(', '));
    setFormMaintNotes(room.maintenanceNotes);
    setFormRepairCost(room.repairCost);
    setIsAssignModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const restrictionsArray = formRestrictions
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const updatedRoom: Room = {
      ...selectedRoom,
      occupantId: formOccupant === '' ? null : formOccupant,
      status: formStatus,
      type: formType,
      dangerLevel: formDanger,
      restrictions: restrictionsArray,
      maintenanceNotes: formMaintNotes.trim(),
      repairCost: formRepairCost
    };

    db.saveRoom(updatedRoom);
    setIsAssignModalOpen(false);
    onStateChange();
  };

  // Quick Action: Clean Room
  const handleCleanRoom = (room: Room, cleanerId: string) => {
    if (room.status === 'damaged' || room.status === 'under_repair') {
      // Cannot clean damaged room directly without repairing it
      return;
    }

    const updated: Room = {
      ...room,
      status: 'clean',
      lastInspectionDate: new Date().toISOString().split('T')[0],
      lastInspectedBy: cleanerId,
      maintenanceNotes: `${room.maintenanceNotes}\nInspected & cleaned by staff.`
    };
    
    db.saveRoom(updated);
    db.logAction('ROOM_CLEAN', `Staff inspected/cleaned room ${room.number}.`);
    onStateChange();
  };

  // Quick Action: Repair Room
  const handleRepairRoom = (room: Room) => {
    // 1. Calculate budget impact
    const totalExpenses = state.resourceLedger
      .filter((l: any) => l.type === 'expense')
      .reduce((sum: number, item: any) => sum + item.amount, 0);
    const totalIncome = state.resourceLedger
      .filter((l: any) => l.type === 'income')
      .reduce((sum: number, item: any) => sum + item.amount, 0);
    const currentBalance = totalIncome - totalExpenses;

    if (currentBalance < room.repairCost) {
      alert(`Ledger Alert: Insufficient hotel budget to repair Room ${room.number}. Cost is ${room.repairCost} HN; available is ${currentBalance} HN.`);
      return;
    }

    // 2. Charge expenses
    if (room.repairCost > 0) {
      db.saveResourceLedgerEntry({
        id: 'rep_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: 'repair',
        amount: room.repairCost,
        description: `Structural repairs conducted on Room ${room.number}.`
      });
    }

    const updated: Room = {
      ...room,
      status: 'clean',
      repairCost: 0,
      maintenanceNotes: `${room.maintenanceNotes}\nStructural repairs completed. Cleaned and set to active.`
    };

    db.saveRoom(updated);
    db.logAction('ROOM_REPAIR', `Completed structural repairs on room ${room.number} for ${room.repairCost} HN.`);
    onStateChange();
  };

  // Quick Action: Vacate Room
  const handleVacateRoom = (room: Room) => {
    const updated: Room = {
      ...room,
      occupantId: null
    };
    db.saveRoom(updated);
    db.logAction('ROOM_VACATE', `Guest vacated Room ${room.number}.`);
    onStateChange();
  };

  // Filter grid
  const filteredRooms = rooms.filter((r: Room) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px', borderBottom: 'none', paddingBottom: 0 }}>Rooms Registry</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Inspect structural conditions, manage guest allocations, and coordinate maintenance shifts.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { label: 'Total Rooms', val: rooms.length },
          { label: 'Occupied', val: rooms.filter((r: Room) => r.occupantId).length },
          { label: 'Damaged & Cursed', val: rooms.filter((r: Room) => r.status === 'damaged' || r.status === 'cursed').length },
          { label: 'Available', val: rooms.filter((r: Room) => !r.occupantId && r.status !== 'damaged' && r.status !== 'locked').length }
        ].map((stat, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '12px 24px', flex: 1, minWidth: '150px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
              {stat.label}
            </span>
            <strong style={{ fontSize: '1.4rem', color: 'var(--color-text-main)', display: 'block', marginTop: '2px' }}>
              {stat.val}
            </strong>
          </div>
        ))}
      </div>

      {/* Filter Row */}
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
        <div style={{ flex: 1, minWidth: '180px' }}>
          <label htmlFor="room-type-filter">Filter Type</label>
          <select 
            id="room-type-filter" 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="all">All Room Types</option>
            <option value="standard">Standard Rooms</option>
            <option value="suite">Suites</option>
            <option value="staff_room">Staff Rooms</option>
            <option value="secured_room">Secured Wards (Reinforced)</option>
            <option value="damaged_room">Damaged Wards</option>
            <option value="restricted">Restricted Access</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '180px' }}>
          <label htmlFor="room-status-filter">Filter Status</label>
          <select 
            id="room-status-filter" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="all">All Statuses</option>
            <option value="clean">Clean</option>
            <option value="messy">Messy</option>
            <option value="damaged">Damaged</option>
            <option value="cursed">Cursed</option>
            <option value="under_repair">Under Repair</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      {/* Grid Layout */}
      {filteredRooms.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Info size={40} style={{ color: 'var(--color-gold-dark)', marginBottom: '12px' }} />
          <h3>No rooms match the selected filters.</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredRooms.map((room: Room) => {
            const tenant = characters.find((c: Character) => c.id === room.occupantId);
            const safetyCheck = RulesEngine.validateRoomAssignment(room, tenant);
            
            const isDamaged = room.status === 'damaged';
            const isClean = room.status === 'clean';
            const hasTenant = room.occupantId !== null;

            return (
              <div 
                key={room.number} 
                className="glass-panel animate-fade-in"
                style={{ 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  borderTop: isDamaged ? '3px solid var(--status-high)' : '1px solid var(--border-crimson)',
                  backgroundColor: room.status === 'cursed' ? 'rgba(168, 32, 42, 0.05)' : 'rgba(28, 17, 19, 0.7)'
                }}
              >
                <div>
                  {/* Top Row: Room number & type */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--color-gold)' }}>
                        Ward {room.number}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        {room.type.replace('_', ' ')} (Floor {room.floor})
                      </span>
                    </div>
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        padding: '3px 8px', 
                        borderRadius: '3px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        backgroundColor: 
                          room.status === 'clean' ? 'rgba(40,167,69,0.15)' :
                          room.status === 'messy' ? 'rgba(253,126,20,0.15)' :
                          room.status === 'damaged' ? 'rgba(220,53,69,0.15)' :
                          'rgba(114,28,36,0.3)',
                        color:
                          room.status === 'clean' ? '#4ce06c' :
                          room.status === 'messy' ? '#fca34d' :
                          room.status === 'damaged' ? '#ff6b7a' :
                          '#ff808b',
                        border: 
                          room.status === 'clean' ? '1px solid rgba(40,167,69,0.3)' :
                          room.status === 'messy' ? '1px solid rgba(253,126,20,0.3)' :
                          room.status === 'damaged' ? '1px solid rgba(220,53,69,0.3)' :
                          '1px solid rgba(168,32,42,0.5)'
                      }}
                    >
                      {room.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Safety Warning */}
                  {!safetyCheck.isSafe && safetyCheck.warning && (
                    <div style={{ backgroundColor: 'rgba(220, 53, 69, 0.12)', border: '1px solid rgba(220,53,69,0.4)', borderRadius: '4px', padding: '8px', color: '#ff6b7a', fontSize: '0.75rem', marginBottom: '12px', display: 'flex', gap: '6px', alignItems: 'flex-start', fontWeight: 600 }}>
                      <ShieldAlert size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{safetyCheck.warning}</span>
                    </div>
                  )}

                  {/* Tenant info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '8px', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '4px' }}>
                    <Users size={16} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-main)' }}>
                      Occupant: {tenant ? <strong style={{ color: 'var(--color-gold)' }}>{tenant.name}</strong> : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Vacant</span>}
                    </span>
                  </div>

                  {/* Restrictions */}
                  {room.restrictions.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {room.restrictions.map((r, i) => (
                        <span key={i} style={{ fontSize: '0.65rem', padding: '1px 5px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', color: 'var(--color-text-muted)' }}>
                          {r}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes / Cost info */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '2px' }}>Maintenance Notes:</div>
                    <div style={{ fontStyle: 'italic', fontSize: '0.75rem' }}>{room.maintenanceNotes || 'No notes compiled.'}</div>
                  </div>

                  {isDamaged && room.repairCost > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#ff6b7a', backgroundColor: 'rgba(220,53,69,0.06)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(220,53,69,0.15)', marginBottom: '12px' }}>
                      <span>Estimated Repair Cost:</span>
                      <strong>{room.repairCost} HN</strong>
                    </div>
                  )}

                  {/* Inspection info */}
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    Last inspected: {room.lastInspectionDate || 'Unknown'} 
                    {room.lastInspectedBy && ` by ${characters.find((c: Character) => c.id === room.lastInspectedBy)?.name || room.lastInspectedBy}`}
                  </div>
                </div>

                {/* Actions row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => handleOpenAssign(room)} title="Configure Room Setting & Tenant" id={`configure-room-${room.number}`}>
                      Assign
                    </button>
                    {hasTenant && (
                      <button className="btn btn-danger" style={{ padding: '6px 10px' }} onClick={() => handleVacateRoom(room)} title="Vacate guest" id={`vacate-room-${room.number}`}>
                        <LogOut size={12} />
                      </button>
                    )}
                  </div>

                  {isDamaged ? (
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleRepairRoom(room)} id={`repair-room-${room.number}`}>
                      <Hammer size={12} />
                      Repair
                    </button>
                  ) : (
                    <button 
                      className="btn btn-gold" 
                      style={{ padding: '6px 12px', fontSize: '0.75rem', opacity: isClean ? 0.6 : 1 }} 
                      disabled={isClean}
                      onClick={() => handleCleanRoom(room, 'niffty')} // Send Niffty to clean!
                      id={`clean-room-${room.number}`}
                    >
                      <Sparkles size={12} />
                      Clean (Niffty)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign / Edit Modal */}
      {isAssignModalOpen && selectedRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div className="glass-panel art-deco-border" style={{ width: '90%', maxWidth: '500px', padding: '24px' }}>
            <h2 style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px' }}>
              Configure Ward {selectedRoom.number}
            </h2>

            <form onSubmit={handleSaveRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label htmlFor="assign-tenant">Assign Occupant</label>
                <select 
                  id="assign-tenant" 
                  value={formOccupant} 
                  onChange={(e) => setFormOccupant(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Vacant / No Occupant</option>
                  {eligibleTenants.map((c: Character) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.status} - {c.riskLevel} risk)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="room-status">Room Status</label>
                  <select 
                    id="room-status" 
                    value={formStatus} 
                    onChange={(e) => setFormStatus(e.target.value as RoomStatus)}
                    style={{ width: '100%' }}
                  >
                    <option value="clean">Clean</option>
                    <option value="messy">Messy</option>
                    <option value="damaged">Damaged</option>
                    <option value="cursed">Cursed</option>
                    <option value="under_repair">Under Repair</option>
                    <option value="locked">Locked</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="room-type">Room Type</label>
                  <select 
                    id="room-type" 
                    value={formType} 
                    onChange={(e) => setFormType(e.target.value as RoomType)}
                    style={{ width: '100%' }}
                  >
                    <option value="standard">Standard</option>
                    <option value="suite">Suite</option>
                    <option value="staff_room">Staff Room</option>
                    <option value="secured_room">Secured Room</option>
                    <option value="damaged_room">Damaged Room</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label htmlFor="room-danger">Danger Level</label>
                  <select 
                    id="room-danger" 
                    value={formDanger} 
                    onChange={(e) => setFormDanger(e.target.value as RiskLevel)}
                    style={{ width: '100%' }}
                  >
                    <option value="low">Low Danger</option>
                    <option value="medium">Medium Danger</option>
                    <option value="high">High Danger</option>
                    <option value="catastrophic">Catastrophic Danger</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="room-repair">Repair Cost (HN)</label>
                  <input 
                    type="number" 
                    id="room-repair" 
                    value={formRepairCost} 
                    onChange={(e) => setFormRepairCost(parseInt(e.target.value) || 0)}
                    style={{ width: '100%' }} 
                  />
                </div>
              </div>

              <div>
                <label htmlFor="room-restrictions">Restrictions (Comma separated)</label>
                <input 
                  type="text" 
                  id="room-restrictions" 
                  value={formRestrictions} 
                  onChange={(e) => setFormRestrictions(e.target.value)}
                  style={{ width: '100%' }}
                  placeholder="e.g. no_powers, enhanced_surveillance, staff_only"
                />
              </div>

              <div>
                <label htmlFor="room-maint">Maintenance Logs / Notes</label>
                <textarea 
                  id="room-maint" 
                  rows={3} 
                  value={formMaintNotes} 
                  onChange={(e) => setFormMaintNotes(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)} id="cancel-room-modal-btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-room-modal-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
