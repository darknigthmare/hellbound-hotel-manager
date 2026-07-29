// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HotelOpening } from '../components/HotelOpening';
import { getSeedData } from '../db/seed';
import { DEFAULT_GAMEPLAY_META } from '../lib/export-import';
import {
  beginOnboardingTutorial,
  createFreshOnboardingState,
  startOnboarding,
} from '../lib/onboarding';
import { FirstArrivalTutorial } from '../pages/FirstArrivalTutorial';
import type { DatabaseState, OnboardingState } from '../types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function openingProps(onboarding: OnboardingState, showTitle: boolean) {
  return {
    onboarding,
    showTitle,
    onContinueCampaign: vi.fn(),
    onBeginStory: vi.fn(),
    onReplayStory: vi.fn(),
    onAdvanceScene: vi.fn(),
    onBeginTutorial: vi.fn(),
    onSkipStory: vi.fn(),
  };
}

function tutorialState(): DatabaseState {
  const state = getSeedData();
  const gameplayMeta = clone(DEFAULT_GAMEPLAY_META);
  gameplayMeta.onboarding = beginOnboardingTutorial(
    createFreshOnboardingState(),
    gameplayMeta.campaignDay,
  );
  return { ...state, gameplayMeta };
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('first-player onboarding UI', () => {
  it('opens on a game title screen with one primary way forward', async () => {
    const props = openingProps(createFreshOnboardingState(), true);
    render(<HotelOpening {...props} />);

    expect(screen.getByRole('heading', { name: /Hellbound Hotel Manager/i })).toBeTruthy();
    const start = screen.getByRole('button', { name: 'Begin a new story' });
    await userEvent.click(start);
    expect(props.onBeginStory).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /Replay intro/i })).toBeNull();
  });

  it('delivers the introduction one cinematic line at a time', () => {
    const onboarding = startOnboarding(
      createFreshOnboardingState(),
      'intro-01-city-after-dark',
    );
    const props = openingProps(onboarding, false);
    render(<HotelOpening {...props} />);

    expect(screen.getByText(/Pentagram City never truly quiets/i)).toBeTruthy();
    expect(screen.queryByText(/Deals, grudges, and spectacle/i)).toBeNull();
    fireEvent.keyDown(window, { code: 'Enter' });
    expect(screen.getByText(/Deals, grudges, and spectacle/i)).toBeTruthy();
    expect(screen.queryByText(/Pentagram City never truly quiets/i)).toBeNull();
  });

  it('hands control to a live tutorial and keeps Charlie and Marlow out of the crowd', async () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    const state = tutorialState();
    const { container } = render(
      <FirstArrivalTutorial
        state={state}
        onStateChange={vi.fn()}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'The First Knock' })).toBeTruthy();
    expect(screen.getByText(/nobody expects perfection on your first shift/i)).toBeTruthy();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await user.click(screen.getByRole('button', { name: /Continue/i }));
    await waitFor(() => {
      expect(screen.getByText(/Move with Q or A and D/i)).toBeTruthy();
    });

    const world = screen.getByRole('region', { name: 'Playable hotel arrival tutorial' });
    expect(world.getAttribute('data-tutorial-lesson')).toBe('move');
    const ambientIds = Array.from(
      container.querySelectorAll<HTMLElement>('[data-ambient-id]'),
      element => element.dataset.ambientId,
    );
    expect(ambientIds.length).toBeGreaterThan(0);
    expect(ambientIds).not.toContain('charlie');
    expect(ambientIds).not.toContain('sim_applicant_marlow');
  });
});
