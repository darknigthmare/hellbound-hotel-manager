// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getSeedData } from '../db/seed';
import { Dashboard } from '../pages/Dashboard';

afterEach(cleanup);

describe('Dashboard hotel hero', () => {
  it('uses the OpenAI hotel exterior as an accessible decorative backdrop', () => {
    const state = getSeedData();
    render(
      <Dashboard
        state={state}
        onStateChange={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    const hero = screen.getByRole('region', { name: state.settings.appName });
    expect(hero.style.backgroundImage)
      .toContain('/assets/openai/dashboard-hotel-exterior.webp');
    expect(hero.style.backgroundImage).not.toContain('/assets/hotel_exterior.png');
    expect(screen.getByRole('heading', { level: 2, name: state.settings.appName })).toBeTruthy();
    expect(hero.querySelector('img')).toBeNull();
  });
});
