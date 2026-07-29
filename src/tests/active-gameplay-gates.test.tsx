// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSeedData } from '../db/seed';
import { DEFAULT_GAMEPLAY_META } from '../lib/export-import';
import { selectHotelShiftMission } from '../lib/hotel-shift';
import { Incidents } from '../pages/Incidents';
import { Rooms } from '../pages/Rooms';
import { Staff } from '../pages/Staff';
import type { DatabaseState, Incident, StaffTask } from '../types';

afterEach(cleanup);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function controlledState(): DatabaseState {
  const state = clone(getSeedData());
  state.gameplayMeta = clone(DEFAULT_GAMEPLAY_META);
  state.gameplayMeta.campaignDay = 7;
  state.incidents = [];
  state.staffTasks = [];
  state.rooms = state.rooms.map(room => ({
    ...room,
    status: 'clean',
    repairCost: 0,
  }));
  return state;
}

function task(id: string, status: StaffTask['status']): StaffTask {
  return {
    id,
    date: 'Campaign Day 7',
    title: `Duty ${id}`,
    type: 'staff_briefing',
    assignedTo: 'husk',
    mentalWorkload: 2,
    status,
    notes: 'Controlled administrative preparation',
    targetId: null,
    createdDay: 7,
    availableOnDay: 7,
  };
}

function incident(id: string): Incident {
  return {
    id,
    date: 'Campaign Day 7',
    location: 'Hotel lobby',
    residentsInvolved: [],
    type: 'sabotage',
    severity: 'high',
    summary: 'A controlled Simulation AU security incident.',
    consequences: 'Hotel operations remain disrupted.',
    repairCost: 0,
    reputationImpact: -10,
    trustImpact: -10,
    actionTaken: 'Vaggie prepared a safe perimeter.',
    status: 'open',
    loreLink: null,
    tags: ['simulation_au'],
  };
}

describe('active gameplay gates', () => {
  it('keeps staff dispatch and start controls while reserving completion for Hotel Shift', () => {
    const state = controlledState();
    state.staffTasks = [
      task('task_pending', 'pending'),
      task('task_active', 'in_progress'),
    ];

    render(<Staff state={state} onStateChange={vi.fn()} searchQuery="" />);

    expect(screen.getByRole('button', { name: 'Dispatch Shift Task' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /complete/i })).toBeNull();
    expect(screen.getByText('À accomplir dans Hotel Shift')).toBeTruthy();
    expect(selectHotelShiftMission(state)).toMatchObject({
      kind: 'task',
      sourceId: 'task_active',
    });
  });

  it('keeps incident reporting while reserving active resolution for Hotel Shift', () => {
    const state = controlledState();
    state.incidents = [incident('incident_active')];

    render(<Incidents state={state} onStateChange={vi.fn()} searchQuery="" />);

    expect(screen.getByRole('button', { name: 'Report Security Incident' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /resolve/i })).toBeNull();
    expect(screen.getByText('À accomplir dans Hotel Shift')).toBeTruthy();
    expect(selectHotelShiftMission(state)).toMatchObject({
      kind: 'incident',
      sourceId: 'incident_active',
    });
  });

  it('keeps room configuration while reserving cleaning and repair for Hotel Shift', () => {
    const state = controlledState();
    const room = state.rooms[0]!;
    room.status = 'messy';

    render(<Rooms state={state} onStateChange={vi.fn()} searchQuery="" />);

    expect(screen.queryByRole('button', { name: /^clean$/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /^repair$/i })).toBeNull();
    expect(screen.getByText('Hotel Shift')).toBeTruthy();
    expect(selectHotelShiftMission(state)).toMatchObject({
      kind: 'room',
      sourceId: room.number,
    });
  });
});
