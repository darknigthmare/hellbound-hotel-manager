// @vitest-environment jsdom

import { useState } from 'react';
import axe from 'axe-core';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Sidebar } from '../components/Sidebar';
import { GlobalSearchResult, Topbar } from '../components/Topbar';
import { db } from '../db/localDb';
import { getSeedData } from '../db/seed';
import {
  createHelluvaBossSaveState,
  resolveHelluvaChoice,
  startHelluvaContract,
} from '../expansions/helluva-boss/engine';
import { Extensions } from '../pages/Extensions';
import { HelluvaBoss } from '../pages/HelluvaBoss';
import { PentagramArena } from '../pages/PentagramArena';
import { DatabaseState, HelluvaBossSpoilerScope } from '../types';

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function createHelluvaState(
  spoilerScope: HelluvaBossSpoilerScope = 'season_2',
  enabled = true,
): DatabaseState {
  const state = getSeedData();
  return {
    ...state,
    extensions: {
      helluvaBoss: {
        ...createHelluvaBossSaveState(enabled),
        spoilerScope,
      },
    },
  };
}

async function expectNoSeriousAccessibilityViolation(container: HTMLElement) {
  const result = await axe.run(container, {
    // jsdom has no canvas layout engine, so color contrast is covered by the real-browser pass.
    rules: { 'color-contrast': { enabled: false } },
  });
  const blocking = result.violations.filter(violation => (
    violation.impact === 'serious' || violation.impact === 'critical'
  ));
  expect(blocking.map(violation => ({ id: violation.id, nodes: violation.nodes.length }))).toEqual([]);
}

describe('automated accessibility contracts', () => {
  it('keeps destructive confirmation keyboard-contained and labelled', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const { container } = render(
      <ConfirmDialog
        isOpen
        title="Reset the hotel?"
        message="This action replaces the local campaign."
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    await waitFor(() => expect(document.activeElement).toBe(cancelButton));
    const user = userEvent.setup();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(confirmButton);
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
    await expectNoSeriousAccessibilityViolation(container);
  });

  it('supports a labelled global-search combobox from the keyboard', async () => {
    const selected = vi.fn();
    const results: GlobalSearchResult[] = [
      { id: 'charlie', label: 'Charlie Morningstar', meta: 'Resident', view: 'characters' },
      { id: 'lore-charlie', label: 'Charlie and the Hotel', meta: 'Lore', view: 'lore' },
    ];

    const SearchHarness = () => {
      const [query, setQuery] = useState('');
      return (
        <Topbar
          currentView="dashboard"
          timelineScope="season_1_end"
          hideSpoilers
          spoilerLevel="season_1"
          budget={5000}
          searchQuery={query}
          onSearchChange={setQuery}
          onNavigateToTimeline={vi.fn()}
          onMenuToggle={vi.fn()}
          isSidebarOpen={false}
          searchResults={query.length >= 2 ? results : []}
          onSelectSearchResult={selected}
        />
      );
    };

    const { container } = render(<SearchHarness />);
    const search = screen.getByRole('combobox', { name: 'Search all hotel records' });
    const user = userEvent.setup();
    await user.type(search, 'ch');
    expect(screen.getByRole('listbox')).toBeTruthy();
    await user.keyboard('{ArrowDown}{Enter}');
    expect(selected).toHaveBeenCalledWith(results[1]);
    await expectNoSeriousAccessibilityViolation(container);
  });

  it('shows extension navigation only when its content pack is enabled', async () => {
    const onViewChange = vi.fn();
    const { container, rerender } = render(
      <Sidebar
        currentView="dashboard"
        onViewChange={onViewChange}
        appName="Hellbound Hotel Manager"
        isOpen={false}
        onClose={vi.fn()}
        helluvaEnabled={false}
      />,
    );

    expect(screen.getByRole('button', { name: 'Manage Extensions' })).toBeTruthy();
    const arenaLink = screen.getByRole('button', { name: /Pentagram Arena.*2\.5D/ });
    expect(arenaLink).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Helluva Boss/ })).toBeNull();
    await userEvent.click(arenaLink);
    expect(onViewChange).toHaveBeenCalledWith('arena');
    await expectNoSeriousAccessibilityViolation(container);

    rerender(
      <Sidebar
        currentView="helluva"
        onViewChange={onViewChange}
        appName="Hellbound Hotel Manager"
        isOpen={false}
        onClose={vi.fn()}
        helluvaEnabled
      />,
    );

    const helluvaLink = screen.getByRole('button', { name: /Helluva Boss/ });
    expect(helluvaLink.getAttribute('aria-current')).toBe('page');
    await expectNoSeriousAccessibilityViolation(container);
  });

  it('presents Pentagram Arena as a distinct, lore-safe playable combat prototype', async () => {
    const user = userEvent.setup();
    const { container } = render(<PentagramArena state={getSeedData()} />);

    expect(screen.getByRole('heading', { name: 'Pentagram Arena' })).toBeTruthy();
    expect(screen.getByText(/gameplay-only Simulation AU records/i)).toBeTruthy();

    const fighterOne = screen.getByRole('combobox', { name: 'Choose fighter one' }) as HTMLSelectElement;
    const fighterTwo = screen.getByRole('combobox', { name: 'Choose fighter two' }) as HTMLSelectElement;
    expect(fighterOne.value).not.toBe(fighterTwo.value);
    expect(screen.getAllByRole('option', { name: 'Vox' })).toHaveLength(2);
    expect(screen.queryByRole('option', { name: 'Baxter' })).toBeNull();
    expect(fighterOne.options).toHaveLength(22);

    await user.selectOptions(fighterOne, 'angeldust');
    expect(fighterOne.selectedOptions[0]?.textContent).toBe('Angel Dust');
    expect(fighterTwo.selectedOptions[0]?.textContent).toBe('Vaggie');
    expect(screen.getByText('Angel Dust vs Vaggie')).toBeTruthy();
    expect(
      Array.from(fighterTwo.options).find(option => option.textContent === 'Angel Dust')?.disabled,
    ).toBe(true);

    const launchButton = screen.getByRole('button', { name: /Start exhibition/i }) as HTMLButtonElement;
    expect(launchButton.disabled).toBe(false);
    await user.click(launchButton);

    expect(screen.queryByRole('combobox', { name: 'Choose fighter one' })).toBeNull();
    expect(screen.queryByRole('combobox', { name: 'Choose fighter two' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Start exhibition/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Strike|Guard|Special|Step in/i })).toBeNull();

    const liveStage = screen.getByRole('region', { name: /Live combat: Angel Dust versus Vaggie/i });
    await waitFor(() => expect(document.activeElement).toBe(liveStage));
    expect(screen.getByRole('heading', { name: /2\.5D combat — Angel Dust vs Vaggie/i })).toBeTruthy();
    expect(screen.getAllByText(/Round 1 live: Angel Dust vs Vaggie/i).length).toBeGreaterThan(0);

    const angelCombatant = container.querySelector<HTMLElement>('.arena-combatant.is-one');
    const startPosition = Number(angelCombatant?.dataset.position);
    fireEvent.keyDown(window, { code: 'KeyD' });
    await waitFor(() => {
      expect(Number(angelCombatant?.dataset.position)).toBeGreaterThan(startPosition);
    });
    fireEvent.keyUp(window, { code: 'KeyD' });

    fireEvent.keyDown(window, { code: 'KeyF' });
    fireEvent.keyUp(window, { code: 'KeyF' });
    await waitFor(() => {
      expect(screen.getAllByText(/Angel Dust .*Web kick chain/i).length).toBeGreaterThan(0);
    });
    await expectNoSeriousAccessibilityViolation(container);

    fireEvent.pointerDown(liveStage, { pointerId: 1, clientX: 30, clientY: 20 });
    fireEvent.pointerMove(liveStage, { pointerId: 1, clientX: 30, clientY: 90 });
    fireEvent.pointerUp(liveStage, { pointerId: 1, clientX: 30, clientY: 90 });
    expect(screen.getByRole('combobox', { name: 'Choose fighter one' })).toBeTruthy();
  });

  it('keeps the Arena safe when no timeline-eligible fighter exists', async () => {
    const emptyState = { ...getSeedData(), characters: [] };
    const { container } = render(<PentagramArena state={emptyState} />);

    expect(screen.getByText('0 fighters indexed')).toBeTruthy();
    expect(screen.getAllByRole('option', { name: 'No eligible fighters' })).toHaveLength(2);
    expect(screen.getByText(/At least two timeline-eligible sprite fighters/i)).toBeTruthy();
    await expectNoSeriousAccessibilityViolation(container);
  });

  it('renders the extension manager with a unique, labelled content-pack switch', async () => {
    const { container } = render(
      <Extensions
        state={createHelluvaState('season_2')}
        onStateChange={vi.fn()}
        onOpenHelluva={vi.fn()}
      />,
    );

    const toggle = screen.getByRole('switch', { name: /Extension active/ }) as HTMLInputElement;
    expect(toggle.id).toBe('helluva-boss-content-pack-toggle');
    expect(toggle.checked).toBe(true);
    expect(document.getElementById('helluva-boss-content-pack-title')).toBeTruthy();
    expect((screen.getByRole('button', { name: /Open I\.M\.P\. campaign/ }) as HTMLButtonElement).disabled).toBe(false);
    await expectNoSeriousAccessibilityViolation(container);
  });

  it('keeps Season 2 profiles and mixed-spoiler sprite atlases out of Season 1 rendering', async () => {
    const { container } = render(
      <HelluvaBoss
        state={createHelluvaState('season_1')}
        onStateChange={vi.fn()}
        onManageExtensions={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: /Helluva Boss/ })).toBeTruthy();
    expect(screen.getByText(/Season 2 and Helluva Shorts atlases hidden/)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Crimson' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Andrealphus' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Paimon' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Mammon' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Vassago' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Satan' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Leviathan' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Belphegor' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Rolando' })).toBeNull();
    expect(screen.queryByRole('img', { name: /Crimson|Andrealphus|Paimon|Mammon|Vassago|Satan|Leviathan|Belphegor|Rolando/i })).toBeNull();
    expect(document.querySelectorAll('.helluva-character')).toHaveLength(12);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Wally Wackford' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Cletus' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Mrs. Mayberry' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Tilla' })).toBeTruthy();
    expect(screen.getAllByRole('figure')).toHaveLength(3);
    await expectNoSeriousAccessibilityViolation(container);
  }, 15_000);

  it('presents Simulation AU featured profiles in contract cards and the active contract', () => {
    const state = createHelluvaState('season_2');
    state.extensions.helluvaBoss = startHelluvaContract(
      state.extensions.helluvaBoss!,
      'hb_contract_01_report',
    );

    render(
      <HelluvaBoss
        state={state}
        onStateChange={vi.fn()}
        onManageExtensions={vi.fn()}
      />,
    );

    const activeContract = document.getElementById('helluva-active-contract');
    const firstContractCard = document.getElementById('helluva-contract-hb_contract_01_report');
    const dhorksContractCard = document.getElementById('helluva-contract-hb_contract_05_dhorks');
    const bountyContractCard = document.getElementById('helluva-contract-hb_contract_10_bounty');
    const goetiaContractCard = document.getElementById('helluva-contract-hb_contract_11_open_door');

    expect(activeContract?.textContent).toContain('Simulation AU featured cast');
    expect(activeContract?.textContent).toContain('Cash Buckzo');
    expect(activeContract?.textContent).toContain('Tilla');
    expect(firstContractCard?.textContent).toContain('Wally Wackford');
    expect(dhorksContractCard?.textContent).toContain('Agent One');
    expect(dhorksContractCard?.textContent).toContain('Agent Two');
    expect(bountyContractCard?.textContent).toContain('Satan');
    expect(goetiaContractCard?.textContent).toContain('Paimon');
    expect(goetiaContractCard?.textContent).toContain('Vassago');
  });

  it('keeps the insolvency route playable by allowing the next contract on credit', () => {
    const state = createHelluvaState('season_1');
    state.extensions.helluvaBoss!.funds = 0;

    render(
      <HelluvaBoss
        state={state}
        onStateChange={vi.fn()}
        onManageExtensions={vi.fn()}
      />,
    );

    const creditButton = screen.getByRole('button', { name: /^Accept on credit$/ });
    expect((creditButton as HTMLButtonElement).disabled).toBe(false);
    expect(creditButton.getAttribute('title')).toMatch(/risks insolvency/i);
  });

  it('moves keyboard focus into an accepted contract and then to its next choice', async () => {
    let currentState = createHelluvaState('season_1');
    const replaceCampaign = (campaign: NonNullable<DatabaseState['extensions']['helluvaBoss']>) => {
      currentState = {
        ...currentState,
        extensions: { ...currentState.extensions, helluvaBoss: campaign },
      };
    };

    vi.spyOn(db, 'startHelluvaBossContract').mockImplementation((contractId) => {
      replaceCampaign(startHelluvaContract(currentState.extensions.helluvaBoss!, contractId));
      return true;
    });
    vi.spyOn(db, 'resolveHelluvaBossChoice').mockImplementation((choiceId) => {
      replaceCampaign(resolveHelluvaChoice(currentState.extensions.helluvaBoss!, choiceId).state);
      return true;
    });

    const renderController: { rerender?: () => void } = {};
    const onStateChange = () => renderController.rerender?.();
    const page = () => (
      <HelluvaBoss
        state={currentState}
        onStateChange={onStateChange}
        onManageExtensions={vi.fn()}
      />
    );
    const rendered = render(page());
    renderController.rerender = () => rendered.rerender(page());

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /^Accept$/ }));
    const activeContract = document.getElementById('helluva-active-contract');
    await waitFor(() => expect(document.activeElement).toBe(activeContract));

    await user.click(screen.getByRole('button', { name: /Buy verified intelligence/i }));
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /Silent entry/i }));
    });
  });
});
