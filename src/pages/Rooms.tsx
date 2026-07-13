import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { db } from '../db/localDb';
import { RulesEngine } from '../lib/rules-engine';
import { Room, Character, RoomType, RoomStatus, RiskLevel, DatabaseState } from '../types';
import { useDialogFocus } from '../components/useDialogFocus';

interface RoomsProps {
  state: DatabaseState;
  onStateChange: () => void;
  searchQuery: string;
}

export const Rooms: React.FC<RoomsProps> = ({ state, onStateChange, searchQuery }) => {
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
  const modalRef = useDialogFocus(isAssignModalOpen, () => setIsAssignModalOpen(false), '#assign-tenant');

  // Filter characters who can occupy rooms
  const eligibleTenants = characters.filter((c: Character) => 
    c.status === 'resident' || c.status === 'staff' || c.status === 'applicant'
  );

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
      repairCost: Math.max(0, formRepairCost)
    };

    if (updatedRoom.occupantId === null) {
      updatedRoom.occupantIds = [];
    } else if (selectedRoom.occupantIds?.includes(updatedRoom.occupantId)) {
      updatedRoom.occupantIds = [updatedRoom.occupantId, ...selectedRoom.occupantIds.filter(id => id !== updatedRoom.occupantId)];
    } else {
      updatedRoom.occupantIds = [updatedRoom.occupantId];
    }

    const occupant = characters.find((character: Character) => character.id === updatedRoom.occupantId);
    if (occupant) {
      if (updatedRoom.status === 'damaged' || updatedRoom.status === 'under_repair' || updatedRoom.status === 'locked') {
        window.alert('Residents cannot be assigned to damaged, under-repair, or locked rooms.');
        return;
      }

      if (updatedRoom.restrictions.includes('staff_only') && occupant.status !== 'staff') {
        window.alert(`Room ${updatedRoom.number} is staff-only. ${occupant.name} is not registered as staff.`);
        return;
      }

      if (updatedRoom.restrictions.includes('no_entry')) {
        window.alert(`Room ${updatedRoom.number} is marked no-entry and cannot receive an occupant until that restriction is removed.`);
        return;
      }

      const safetyCheck = RulesEngine.validateRoomAssignment(updatedRoom, occupant);
      if (!safetyCheck.isSafe) {
        window.alert(safetyCheck.warning || 'Unsafe room assignment blocked.');
        return;
      }

      const previousRoom = rooms.find((room: Room) => (room.occupantId === occupant.id || room.occupantIds?.includes(occupant.id)) && room.number !== updatedRoom.number);
      if (previousRoom) {
        const shouldMove = window.confirm(`${occupant.name} already occupies Room ${previousRoom.number}. Move them to Room ${updatedRoom.number}?`);
        if (!shouldMove) return;
      }
    }

    const saved = db.transaction('ROOM_CONFIGURATION', (draft) => {
      const roomIndex = draft.rooms.findIndex(room => room.number === updatedRoom.number);
      if (roomIndex < 0) throw new Error('Room no longer exists.');
      if (occupant) {
        draft.rooms = draft.rooms.map(room => {
          if (room.number === updatedRoom.number) return room;
          const occupantIds = room.occupantIds?.filter(id => id !== occupant.id);
          return {
            ...room,
            ...(room.occupantIds ? { occupantIds } : {}),
            occupantId: room.occupantId === occupant.id ? occupantIds?.[0] || null : room.occupantId
          };
        });
      }
      const targetIndex = draft.rooms.findIndex(room => room.number === updatedRoom.number);
      draft.rooms[targetIndex] = updatedRoom;
    }, {
      action: 'ROOM_CONFIGURATION',
      details: `Room ${updatedRoom.number} saved${occupant ? ` with ${occupant.name} assigned` : ' as vacant'}.`
    });
    if (!saved) {
      window.alert(db.getStorageStatus().lastError?.message || 'Room assignment failed atomically.');
      return;
    }
    setIsAssignModalOpen(false);
    onStateChange();
  };

  // Quick Action: Clean Room
  const handleCleanRoom = (room: Room, cleanerId: string) => {
    if (room.status === 'damaged' || room.status === 'under_repair') {
      // Cannot clean damaged room directly without repairing it
      return;
    }
    if (room.status === 'cursed' || room.status === 'locked') {
      window.alert(`Room ${room.number} requires security clearance before normal cleaning can begin.`);
      return;
    }

    const cleaningStock = db.getInventory().clean;
    if (cleaningStock < 1) {
      window.alert('Cleaning supplies are depleted. Restock them in Ledger & Facility Supplies before sending Niffty.');
      return;
    }

    // Set cleaning status to trigger animation overlay
    setCleaningRooms(prev => ({ ...prev, [room.number]: true }));

    setTimeout(() => {
      const cleaned = db.transaction('ROOM_CLEAN', (draft, inventory) => {
        const target = draft.rooms.find(candidate => candidate.number === room.number);
        if (!target || target.status === 'damaged' || target.status === 'under_repair' || target.status === 'locked' || target.status === 'cursed') {
          throw new Error('Room condition changed before cleaning completed.');
        }
        if (inventory.clean < 1) throw new Error('Cleaning supplies were consumed by another operation.');
        inventory.clean -= 1;
        target.status = 'clean';
        target.lastInspectionDate = `Campaign Day ${draft.gameplayMeta!.campaignDay}`;
        target.lastInspectedBy = cleanerId;
        target.maintenanceNotes = `${target.maintenanceNotes}\nInspected & cleaned by staff.`;
      }, {
        action: 'ROOM_CLEAN',
        details: `Staff inspected/cleaned room ${room.number}; consumed 1 cleaning supply.`
      });
      setCleaningRooms(prev => ({ ...prev, [room.number]: false }));
      if (!cleaned) {
        window.alert(db.getStorageStatus().lastError?.message || 'Cleaning failed atomically.');
        return;
      }
      onStateChange();
    }, 1200);
  };

  // Quick Action: Repair Room
  const handleRepairRoom = (room: Room) => {
    // 1. Calculate budget impact
    const totalExpenses = state.resourceLedger
      .filter(l => l.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = state.resourceLedger
      .filter(l => l.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    const currentBalance = totalIncome - totalExpenses;

    if (currentBalance < room.repairCost) {
      alert(`Ledger Alert: Insufficient hotel budget to repair Room ${room.number}. Cost is ${room.repairCost} HN; available is ${currentBalance} HN.`);
      return;
    }

    const repaired = db.transaction('ROOM_REPAIR', (draft) => {
      const target = draft.rooms.find(candidate => candidate.number === room.number);
      if (!target || target.status !== 'damaged') throw new Error('This room is no longer awaiting repair.');
      const freshBalance = draft.resourceLedger.reduce((sum, entry) => sum + (entry.type === 'income' ? entry.amount : -entry.amount), 0);
      if (freshBalance < target.repairCost) throw new Error(`Only ${freshBalance} HN remains for a ${target.repairCost} HN repair.`);
      const chargedCost = target.repairCost;
      if (chargedCost > 0) {
        draft.resourceLedger.push({
          id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          date: `Campaign Day ${draft.gameplayMeta!.campaignDay}`,
          type: 'expense',
          category: 'repair',
          amount: chargedCost,
          description: `Structural repairs conducted on Room ${room.number}.`
        });
      }
      target.status = 'clean';
      target.repairCost = 0;
      target.maintenanceNotes = `${target.maintenanceNotes}\nStructural repairs completed. Cleaned and set to active.`;
    }, {
      action: 'ROOM_REPAIR',
      details: `Completed structural repairs on room ${room.number} for ${room.repairCost} HN.`
    });
    if (!repaired) {
      alert(db.getStorageStatus().lastError?.message || 'Repair failed atomically.');
      return;
    }
    onStateChange();
  };

  // Quick Action: Vacate Room
  const handleVacateRoom = (room: Room) => {
    const vacated = db.transaction('ROOM_VACATE', (draft) => {
      const target = draft.rooms.find(candidate => candidate.number === room.number);
      if (!target) throw new Error('Room no longer exists.');
      target.occupantId = null;
      target.occupantIds = [];
    }, {
      action: 'ROOM_VACATE',
      details: `All occupants vacated Room ${room.number}.`
    });
    if (!vacated) {
      window.alert(db.getStorageStatus().lastError?.message || 'Room could not be vacated.');
      return;
    }
    onStateChange();
  };

  // Filter grid
  const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
  const filteredRooms = rooms.filter((r: Room) => {
    if (typeFilter !== 'all' && r.type !== typeFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (normalizedSearch) {
      const occupantNames = (r.occupantIds ?? (r.occupantId ? [r.occupantId] : []))
        .map((id) => characters.find((character: Character) => character.id === id)?.name ?? '')
        .join(' ');
      const searchable = `room ${r.number} ward ${r.number} ${r.type} ${r.status} ${r.maintenanceNotes} ${r.restrictions.join(' ')} ${occupantNames}`.toLocaleLowerCase();
      if (!searchable.includes(normalizedSearch)) return false;
    }
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
          { label: 'Occupied', val: rooms.filter((r: Room) => Boolean(r.occupantId || r.occupantIds?.length)).length },
          { label: 'Damaged & Cursed', val: rooms.filter((r: Room) => r.status === 'damaged' || r.status === 'cursed').length },
          { label: 'Available', val: rooms.filter((r: Room) => {
            const occupants = r.occupantIds?.length ?? (r.occupantId ? 1 : 0);
            return occupants < r.capacity && r.status === 'clean' && !r.restrictions.includes('no_entry');
          }).length }
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
                  const occupantIds = room.occupantIds?.length ? room.occupantIds : (room.occupantId ? [room.occupantId] : []);
                  const tenant = characters.find((c: Character) => c.id === room.occupantId) || characters.find((c: Character) => c.id === occupantIds[0]);
                  const isMatchingFilter = filteredRooms.some((f: Room) => f.number === room.number);
                  const safetyCheck = RulesEngine.validateRoomAssignment(room, tenant);
                  
                  const isDamaged = room.status === 'damaged';
                  const isClean = room.status === 'clean';
                  const isCleaning = cleaningRooms[room.number];
                  const hasTenant = occupantIds.length > 0;

                  // Get initials
                  const initials = tenant ? tenant.name.split(' ').map((n: string) => n[0]).join('') : '';

                  return (
                    <div 
                      key={room.number}
                      id={`room-card-${room.number}`}
                      className={`blueprint-room-slot ${room.status}`}
                      role="button"
                      tabIndex={isCleaning ? -1 : 0}
                      aria-label={`Configure Ward ${room.number}, ${tenant?.name || 'vacant'}, status ${room.status}`}
                      aria-disabled={isCleaning}
                      onClick={() => handleOpenAssign(room)}
                      onKeyDown={(event) => {
                        if (event.target !== event.currentTarget || isCleaning || (event.key !== 'Enter' && event.key !== ' ')) return;
                        event.preventDefault();
                        handleOpenAssign(room);
                      }}
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
                          {hasTenant && (
                            <button
                              onClick={() => handleVacateRoom(room)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}
                              title={`Vacate ${tenant?.name || 'occupant'} from Room ${room.number}`}
                              aria-label={`Vacate Room ${room.number}`}
                            >
                              Vacate
                            </button>
                          )}
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
        <div onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAssignModalOpen(false); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div ref={modalRef} tabIndex={-1} className="glass-panel art-deco-border" role="dialog" aria-modal="true" aria-labelledby="room-dialog-title" style={{ width: '90%', maxWidth: '500px', padding: '24px' }}>
            <h2 id="room-dialog-title" style={{ color: 'var(--color-gold)', marginBottom: '16px', borderBottom: '1px solid var(--color-gold-dark)', paddingBottom: '8px' }}>
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
                  min="0"
                  onChange={(e) => setFormRepairCost(Math.max(0, parseInt(e.target.value) || 0))}
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
