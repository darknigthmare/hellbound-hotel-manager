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

  // Niffty sweep animation states
  const [cleaningRooms, setCleaningRooms] = useState<Record<string, boolean>>({});

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

    // Set cleaning status to trigger animation overlay
    setCleaningRooms(prev => ({ ...prev, [room.number]: true }));

    setTimeout(() => {
      const updated: Room = {
        ...room,
        status: 'clean',
        lastInspectionDate: new Date().toISOString().split('T')[0],
        lastInspectedBy: cleanerId,
        maintenanceNotes: `${room.maintenanceNotes}\nInspected & cleaned by staff.`
      };
      
      db.saveRoom(updated);
      db.logAction('ROOM_CLEAN', `Staff inspected/cleaned room ${room.number}.`);
      setCleaningRooms(prev => ({ ...prev, [room.number]: false }));
      onStateChange();
    }, 1200);
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

      {/* Stacked 2D Floor Map Blueprint */}
      <div className="blueprint-hotel" style={{ marginBottom: '24px' }}>
        <div className="blueprint-roof">HELLBOUND REDEMPTION HOTEL蓝图</div>
        
        {[4, 3, 2, 1, 0].map(floorNum => {
          const floorRooms = rooms.filter((r: Room) => r.floor === floorNum);
          
          return (
            <div key={floorNum} className="blueprint-floor">
              <div className="blueprint-floor-label">
                Floor {floorNum}
              </div>
              <div className="blueprint-rooms-row">
                {floorRooms.map((room: Room) => {
                  const tenant = characters.find((c: Character) => c.id === room.occupantId);
                  const isMatchingFilter = filteredRooms.some((f: Room) => f.number === room.number);
                  const safetyCheck = RulesEngine.validateRoomAssignment(room, tenant);
                  
                  const isDamaged = room.status === 'damaged';
                  const isClean = room.status === 'clean';
                  const isCleaning = cleaningRooms[room.number];
                  const hasTenant = room.occupantId !== null;

                  // Get initials
                  const initials = tenant ? tenant.name.split(' ').map((n: string) => n[0]).join('') : '';

                  return (
                    <div 
                      key={room.number}
                      className={`blueprint-room-slot ${room.status}`}
                      onClick={() => handleOpenAssign(room)}
                      style={{ 
                        opacity: isMatchingFilter ? 1 : 0.25,
                        boxShadow: isCleaning ? '0 0 15px rgba(212, 175, 55, 0.6)' : 'var(--shadow-card)',
                        pointerEvents: isCleaning ? 'none' : 'auto'
                      }}
                    >
                      {/* Cleaning Overlay */}
                      {isCleaning && (
                        <div className="sweep-overlay">
                          <span className="niffty-broom-sweep" style={{ fontSize: '1.2rem', marginRight: '4px' }}>🧹</span>
                          <span>Sweeping...</span>
                        </div>
                      )}

                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--color-gold)' }}>
                          Ward {room.number}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {!safetyCheck.isSafe && (
                            <span title="Risk alert: high threat guest in unsecured room" style={{ display: 'inline-flex' }}>
                              <ShieldAlert size={12} style={{ color: '#ff6b7a' }} />
                            </span>
                          )}
                          <span style={{ fontSize: '0.6rem', opacity: 0.8, textTransform: 'uppercase' }}>
                            {room.type === 'staff_room' ? 'staff' : room.type === 'secured_room' ? 'secure' : room.type}
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {tenant ? (
                          <>
                            <div className="crest-avatar" title={tenant.name}>
                              {initials}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>
                              {tenant.name}
                            </span>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            Vacant
                          </span>
                        )}
                      </div>

                      {/* Footer Actions / Info */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          Status: {room.status}
                        </span>
                        
                        {/* Quick clean/repair hooks */}
                        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '4px' }}>
                          {isDamaged ? (
                            <button 
                              onClick={() => handleRepairRoom(room)} 
                              style={{ background: 'none', border: 'none', color: '#ff6b7a', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                              title={`Repair room for ${room.repairCost} HN`}
                            >
                              Repair
                            </button>
                          ) : (
                            !isClean && (
                              <button 
                                onClick={() => handleCleanRoom(room, 'niffty')} 
                                style={{ background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', padding: 0 }}
                                title="Send Niffty to clean room"
                              >
                                Clean
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

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
