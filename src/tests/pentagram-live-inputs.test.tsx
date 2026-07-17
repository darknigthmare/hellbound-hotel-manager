// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PentagramLiveFight } from '../components/PentagramLiveFight';
import { getSeedData } from '../db/seed';
import { buildCombatantDefinition, getFighterProfile } from '../lib/pentagram-fighters';

afterEach(() => cleanup());

describe('Pentagram Arena live input lifecycle', () => {
  it('keeps native Enter controls and releases each pointer independently', async () => {
    const state = getSeedData();
    const fighterOne = state.characters.find(({ id }) => id === 'angeldust');
    const fighterTwo = state.characters.find(({ id }) => id === 'vaggie');
    const fighterOneProfile = getFighterProfile(fighterOne);
    const fighterTwoProfile = getFighterProfile(fighterTwo);
    expect(fighterOne).toBeTruthy();
    expect(fighterTwo).toBeTruthy();
    expect(fighterOneProfile).toBeTruthy();
    expect(fighterTwoProfile).toBeTruthy();
    if (!fighterOne || !fighterTwo || !fighterOneProfile || !fighterTwoProfile) return;

    const user = userEvent.setup();
    render(
      <PentagramLiveFight
        fighterOne={fighterOne}
        fighterTwo={fighterTwo}
        fighterOneDefinition={buildCombatantDefinition(fighterOne, fighterOneProfile)}
        fighterTwoDefinition={buildCombatantDefinition(fighterTwo, fighterTwoProfile)}
        matchMode="ai"
        aiDifficulty="standard"
        onExit={vi.fn()}
      />,
    );

    const stage = screen.getByRole('region', { name: /Live combat/i });
    await waitFor(() => expect(stage.dataset.phase).toBe('running'), { timeout: 2_000 });

    const pauseButton = screen.getByRole('button', { name: 'Pause' });
    pauseButton.focus();
    await user.keyboard('{Enter}');
    expect(stage.dataset.phase).toBe('paused');

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    continueButton.focus();
    await user.keyboard('{Enter}');
    expect(stage.dataset.phase).toBe('running');

    const fighterOneNode = document.querySelector<HTMLElement>('.arena-combatant.is-one');
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 20, clientY: 100 });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 70, clientY: 100 });
    await waitFor(() => expect(fighterOneNode?.dataset.action).toBe('walk'));

    fireEvent.pointerDown(stage, { pointerId: 2, clientX: 30, clientY: 100 });
    await waitFor(() => expect(fighterOneNode?.dataset.action).toBe('guard'));

    fireEvent.pointerCancel(stage, { pointerId: 2, clientX: 30, clientY: 100 });
    await waitFor(() => expect(fighterOneNode?.dataset.action).toBe('walk'));

    fireEvent.lostPointerCapture(stage, { pointerId: 1, clientX: 70, clientY: 100 });
    await waitFor(() => expect(fighterOneNode?.dataset.action).toBe('idle'));
  });

  it('does not treat KO overlay button taps as arena swipe commands', async () => {
    const state = getSeedData();
    const fighterOne = state.characters.find(({ id }) => id === 'angeldust');
    const fighterTwo = state.characters.find(({ id }) => id === 'vaggie');
    const fighterOneProfile = getFighterProfile(fighterOne);
    const fighterTwoProfile = getFighterProfile(fighterTwo);
    expect(fighterOne).toBeTruthy();
    expect(fighterTwo).toBeTruthy();
    expect(fighterOneProfile).toBeTruthy();
    expect(fighterTwoProfile).toBeTruthy();
    if (!fighterOne || !fighterTwo || !fighterOneProfile || !fighterTwoProfile) return;

    const onExit = vi.fn();
    render(
      <PentagramLiveFight
        fighterOne={fighterOne}
        fighterTwo={fighterTwo}
        fighterOneDefinition={{
          ...buildCombatantDefinition(fighterOne, fighterOneProfile),
          power: 1_000,
          range: 1_000,
          speed: 1_000,
        }}
        fighterTwoDefinition={buildCombatantDefinition(fighterTwo, fighterTwoProfile)}
        matchMode="local"
        aiDifficulty="standard"
        onExit={onExit}
      />,
    );

    const stage = screen.getByRole('region', { name: /Live combat/i });
    await waitFor(() => expect(stage.dataset.phase).toBe('running'), { timeout: 2_000 });

    fireEvent.keyDown(window, { code: 'KeyF' });
    const nextRoundButton = await screen.findByRole('button', { name: 'Next round' });
    expect(stage.dataset.phase).toBe('finished');

    fireEvent.pointerDown(nextRoundButton, { pointerId: 31, clientX: 8, clientY: 8 });
    fireEvent.pointerUp(nextRoundButton, { pointerId: 31, clientX: 8, clientY: 8 });
    expect(onExit).not.toHaveBeenCalled();

    await userEvent.click(nextRoundButton);
    await waitFor(() => expect(stage.dataset.phase).toBe('ready'));
    expect(onExit).not.toHaveBeenCalled();
  });
});
