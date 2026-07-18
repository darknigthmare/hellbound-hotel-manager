// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PentagramLiveFight } from '../components/PentagramLiveFight';
import { getSeedData } from '../db/seed';
import { buildCombatantDefinition, getFighterProfile } from '../lib/pentagram-fighters';
import { DEFAULT_PENTAGRAM_STAGE } from '../lib/pentagram-stages';

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
    const onSoundtrackToggle = vi.fn();
    const onSoundtrackPause = vi.fn();
    const onSoundtrackResume = vi.fn();
    render(
      <PentagramLiveFight
        fighterOne={fighterOne}
        fighterTwo={fighterTwo}
        fighterOneDefinition={buildCombatantDefinition(fighterOne, fighterOneProfile)}
        fighterTwoDefinition={buildCombatantDefinition(fighterTwo, fighterTwoProfile)}
        matchMode="ai"
        aiDifficulty="standard"
        stage={DEFAULT_PENTAGRAM_STAGE}
        timeline={state.timeline}
        soundtrackEnabled
        soundtrackStatus="playing"
        onSoundtrackToggle={onSoundtrackToggle}
        onSoundtrackPause={onSoundtrackPause}
        onSoundtrackResume={onSoundtrackResume}
        onExit={vi.fn()}
      />,
    );

    const stage = screen.getByRole('region', { name: /Live combat/i });
    const spectatorNodes = Array.from(
      stage.querySelectorAll<HTMLElement>('[data-stage-spectator-id]'),
    );
    const spectatorIds = spectatorNodes.map(node => node.dataset.stageSpectatorId);
    expect(spectatorNodes).toHaveLength(4);
    expect(spectatorIds).not.toContain(fighterOne.id);
    expect(spectatorIds).not.toContain(fighterTwo.id);
    expect(new Set(spectatorIds).size).toBe(spectatorIds.length);
    expect(new Set(spectatorNodes.map(node => node.dataset.parallaxLayer)).size)
      .toBeGreaterThan(1);
    spectatorNodes.forEach((node) => {
      expect(node.dataset.action).toBe('idle');
      expect(node.dataset.animationBank).toBe('movement');
      expect(node.getAttribute('aria-hidden')).toBe('true');
      expect(
        node.querySelector<HTMLElement>('.arena-stage-spectator__sprite')
          ?.style.backgroundImage,
      ).toContain('/assets/sprites/hazbin/animation/v1/movement/');
    });
    await waitFor(() => expect(stage.dataset.phase).toBe('running'), { timeout: 2_000 });

    const pauseButton = screen.getByRole('button', { name: 'Pause' });
    pauseButton.focus();
    await user.keyboard('{Enter}');
    expect(stage.dataset.phase).toBe('paused');
    expect(onSoundtrackPause).toHaveBeenCalledTimes(1);

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    continueButton.focus();
    await user.keyboard('{Enter}');
    expect(stage.dataset.phase).toBe('running');
    expect(onSoundtrackResume).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Turn off original soundtrack' }));
    expect(onSoundtrackToggle).toHaveBeenCalledTimes(1);
    expect(onSoundtrackToggle).toHaveBeenCalledWith(false);

    const fighterOneNode = document.querySelector<HTMLElement>('.arena-combatant.is-one');
    const fighterOneFrame = fighterOneNode?.querySelector<HTMLElement>('.arena-sprite-frame');
    expect(fighterOneNode?.dataset.animationBank).toBe('movement');
    expect(fighterOneFrame?.style.backgroundImage)
      .toContain('/assets/sprites/hazbin/animation/v1/movement/core-a-movement.png');
    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 20, clientY: 100 });
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 70, clientY: 100 });
    await waitFor(() => {
      expect(fighterOneNode?.dataset.action).toBe('walk');
      expect(fighterOneNode?.dataset.animationBank).toBe('movement');
    });

    fireEvent.pointerDown(stage, { pointerId: 2, clientX: 30, clientY: 100 });
    await waitFor(() => {
      expect(fighterOneNode?.dataset.action).toBe('guard');
      expect(fighterOneNode?.dataset.animationBank).toBe('reaction');
      expect(fighterOneFrame?.style.backgroundImage)
        .toContain('/assets/sprites/hazbin/animation/v1/reaction/core-a-reaction.png');
    });

    fireEvent.pointerCancel(stage, { pointerId: 2, clientX: 30, clientY: 100 });
    await waitFor(() => expect(fighterOneNode?.dataset.action).toBe('walk'));

    fireEvent.lostPointerCapture(stage, { pointerId: 1, clientX: 70, clientY: 100 });
    await waitFor(() => expect(fighterOneNode?.dataset.action).toBe('idle'));
  });

  it('requests an atomic paused soundtrack start when music is enabled from pause', async () => {
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

    const onSoundtrackToggle = vi.fn();
    const onSoundtrackPause = vi.fn();
    render(
      <PentagramLiveFight
        fighterOne={fighterOne}
        fighterTwo={fighterTwo}
        fighterOneDefinition={buildCombatantDefinition(fighterOne, fighterOneProfile)}
        fighterTwoDefinition={buildCombatantDefinition(fighterTwo, fighterTwoProfile)}
        matchMode="ai"
        aiDifficulty="standard"
        stage={DEFAULT_PENTAGRAM_STAGE}
        timeline={state.timeline}
        soundtrackEnabled={false}
        soundtrackStatus="idle"
        onSoundtrackToggle={onSoundtrackToggle}
        onSoundtrackPause={onSoundtrackPause}
        onSoundtrackResume={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    const stage = screen.getByRole('region', { name: /Live combat/i });
    await waitFor(() => expect(stage.dataset.phase).toBe('running'), { timeout: 2_000 });
    await userEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(stage.dataset.phase).toBe('paused');

    await userEvent.click(screen.getByRole('button', { name: 'Turn on original soundtrack' }));
    expect(onSoundtrackToggle).toHaveBeenCalledWith(true);
    expect(onSoundtrackPause).toHaveBeenCalledTimes(1);
  });

  it('offers accessible P1 touch controls in CPU mode and releases held inputs', async () => {
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

    render(
      <PentagramLiveFight
        fighterOne={fighterOne}
        fighterTwo={fighterTwo}
        fighterOneDefinition={buildCombatantDefinition(fighterOne, fighterOneProfile)}
        fighterTwoDefinition={buildCombatantDefinition(fighterTwo, fighterTwoProfile)}
        matchMode="ai"
        aiDifficulty="standard"
        stage={DEFAULT_PENTAGRAM_STAGE}
        timeline={state.timeline}
        soundtrackEnabled={false}
        soundtrackStatus="idle"
        onSoundtrackToggle={vi.fn()}
        onSoundtrackPause={vi.fn()}
        onSoundtrackResume={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByRole('group', { name: /P1 tactile controls/i })).toBeTruthy();
    expect(screen.queryByRole('group', { name: /P2 tactile controls/i })).toBeNull();
    expect(screen.getAllByRole('button', { name: /^P1 /i })).toHaveLength(6);

    const stage = screen.getByRole('region', { name: /Live combat/i });
    await waitFor(() => expect(stage.dataset.phase).toBe('running'), { timeout: 2_000 });
    const fighterOneNode = document.querySelector<HTMLElement>('.arena-combatant.is-one');
    const moveRight = screen.getByRole('button', { name: 'P1 move right' });

    fireEvent.pointerDown(moveRight, { pointerId: 41 });
    await waitFor(() => {
      expect(moveRight.getAttribute('aria-pressed')).toBe('true');
      expect(fighterOneNode?.dataset.action).toBe('walk');
    });
    fireEvent.pointerUp(moveRight, { pointerId: 41 });
    await waitFor(() => {
      expect(moveRight.getAttribute('aria-pressed')).toBe('false');
      expect(fighterOneNode?.dataset.action).toBe('idle');
    });

    const guard = screen.getByRole('button', { name: 'P1 guard' });
    fireEvent.pointerDown(guard, { pointerId: 42 });
    await waitFor(() => expect(fighterOneNode?.dataset.action).toBe('guard'));
    fireEvent.pointerCancel(guard, { pointerId: 42 });
    await waitFor(() => expect(fighterOneNode?.dataset.action).toBe('idle'));

    fireEvent.keyDown(moveRight, { key: 'Enter' });
    await waitFor(() => {
      expect(moveRight.getAttribute('aria-pressed')).toBe('true');
      expect(fighterOneNode?.dataset.action).toBe('walk');
    });
    fireEvent.keyUp(moveRight, { key: 'Enter' });
    await waitFor(() => {
      expect(moveRight.getAttribute('aria-pressed')).toBe('false');
      expect(fighterOneNode?.dataset.action).toBe('idle');
    });

    await userEvent.click(screen.getByRole('button', { name: 'P1 light attack' }));
    await waitFor(() => {
      expect(fighterOneNode?.dataset.action).toBe('light');
      expect(fighterOneNode?.dataset.animationBank).toBe('offense');
      expect(fighterOneNode?.querySelector<HTMLElement>('.arena-sprite-frame')?.style.backgroundImage)
        .toContain('/assets/sprites/hazbin/animation/v1/offense/core-a-offense.png');
    });
  });

  it('exposes independent P2 touch controls locally and clears them on pause', async () => {
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

    render(
      <PentagramLiveFight
        fighterOne={fighterOne}
        fighterTwo={fighterTwo}
        fighterOneDefinition={buildCombatantDefinition(fighterOne, fighterOneProfile)}
        fighterTwoDefinition={buildCombatantDefinition(fighterTwo, fighterTwoProfile)}
        matchMode="local"
        aiDifficulty="standard"
        stage={DEFAULT_PENTAGRAM_STAGE}
        timeline={state.timeline}
        soundtrackEnabled={false}
        soundtrackStatus="idle"
        onSoundtrackToggle={vi.fn()}
        onSoundtrackPause={vi.fn()}
        onSoundtrackResume={vi.fn()}
        onExit={vi.fn()}
      />,
    );

    expect(screen.getByRole('group', { name: /P1 tactile controls/i })).toBeTruthy();
    expect(screen.getByRole('group', { name: /P2 tactile controls/i })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^P2 /i })).toHaveLength(6);

    const stage = screen.getByRole('region', { name: /Live combat/i });
    await waitFor(() => expect(stage.dataset.phase).toBe('running'), { timeout: 2_000 });
    const fighterTwoNode = document.querySelector<HTMLElement>('.arena-combatant.is-two');
    const moveLeft = screen.getByRole('button', { name: 'P2 move left' });

    fireEvent.pointerDown(moveLeft, { pointerId: 51 });
    await waitFor(() => expect(fighterTwoNode?.dataset.action).toBe('walk'));
    await userEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(stage.dataset.phase).toBe('paused');
    expect(moveLeft.getAttribute('aria-pressed')).toBe('false');
    expect((moveLeft as HTMLButtonElement).disabled).toBe(true);

    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await userEvent.click(screen.getByRole('button', { name: 'P2 heavy attack' }));
    await waitFor(() => expect(fighterTwoNode?.dataset.action).toBe('heavy'));
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
        stage={DEFAULT_PENTAGRAM_STAGE}
        timeline={state.timeline}
        soundtrackEnabled={false}
        soundtrackStatus="idle"
        onSoundtrackToggle={vi.fn()}
        onSoundtrackPause={vi.fn()}
        onSoundtrackResume={vi.fn()}
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
