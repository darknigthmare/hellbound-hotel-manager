// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MissionCompass } from '../components/MissionCompass';
import { getSeedData } from '../db/seed';
import { DEFAULT_GAMEPLAY_META } from '../lib/export-import';
import { deriveMissionCompass } from '../lib/mission-compass';
import type { DatabaseState } from '../types';

afterEach(cleanup);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function controlledState(): DatabaseState {
  const state = clone(getSeedData());
  state.gameplayMeta = clone(DEFAULT_GAMEPLAY_META);
  return state;
}

describe('mission compass derivation', () => {
  it('turns the highest-priority live operation into one playable next action', () => {
    const state = controlledState();
    const model = deriveMissionCompass(state);

    expect(model).toMatchObject({
      id: 'incident:inc2',
      status: 'active',
      destination: 'shift',
      actionLabel: 'Play current objective',
    });
    expect(model.title).toContain('Contain');
    expect(model.nextAction).toContain('Enter Hotel Shift.');
    expect(model.progressValue).toBeGreaterThanOrEqual(0);
    expect(model.progressValue).toBeLessThanOrEqual(100);
    expect(model.progressLabel).toContain('Evidence dossiers 0/3');
  });

  it('reports campaign progression from durable goals without claiming a soul was redeemed', () => {
    const state = controlledState();
    state.gameplayMeta!.campaignDay = 10;
    state.rehabilitationPlans[0]!.isRedeemedConfirmed = true;
    state.reputation.redemptionCredibility = 60;

    const model = deriveMissionCompass(state);

    expect(model.progressLabel).toBe('Day 10/15 · Evidence dossiers 1/3');
    expect(model.nextAction.toLowerCase()).not.toContain('soul redeemed');
    expect(model.progressValue).toBeGreaterThan(30);
  });

  it('redirects a finalized Simulation AU record to its outcome review', () => {
    const state = controlledState();
    state.gameplayMeta!.narrativeFlags.push(
      'campaign_ended:victory:redemption_program_proven',
    );

    expect(deriveMissionCompass(state)).toMatchObject({
      id: 'campaign-ended:redemption_program_proven',
      status: 'complete',
      destination: 'dashboard',
      progressValue: 100,
      actionLabel: 'Review outcome',
    });
  });
});

describe('MissionCompass', () => {
  it('stays compact by default and reveals a single accessible action on demand', () => {
    const state = controlledState();
    const onNavigate = vi.fn();
    const { container } = render(
      <MissionCompass state={state} onNavigate={onNavigate} />,
    );

    const details = container.querySelector('details');
    expect(details?.open).toBe(false);
    expect(screen.getByText(/Current objective/)).toBeTruthy();

    fireEvent.click(screen.getByText(/Current objective/));
    expect(details?.open).toBe(true);
    expect(screen.getByRole('progressbar', { name: /Campaign progression/ })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Play current objective' }));
    expect(onNavigate).toHaveBeenCalledWith('shift', undefined);
  });

  it('labels all displayed guidance as Simulation AU', () => {
    render(
      <MissionCompass
        state={controlledState()}
        onNavigate={vi.fn()}
        initiallyOpen
      />,
    );

    expect(screen.getByText(/Player choices never rewrite series canon/)).toBeTruthy();
  });
});
