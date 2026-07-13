// @vitest-environment jsdom

import { useState } from 'react';
import axe from 'axe-core';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { GlobalSearchResult, Topbar } from '../components/Topbar';

afterEach(() => cleanup());

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
});
