// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { db } from '../db/localDb';
import { getSeedData } from '../db/seed';
import { createHelluvaBossSaveState } from '../expansions/helluva-boss/engine';
import {
  HELLUVA_BOSS_SPOILER_SCOPES,
  HELLUVA_BOSS_SPOILER_SCOPE_COPY,
  isHelluvaBossSpoilerVisible,
} from '../expansions/helluva-boss/spoilers';
import { ExportImport } from '../lib/export-import';
import { HelluvaBoss } from '../pages/HelluvaBoss';
import type { DatabaseState, HelluvaBossSpoilerScope } from '../types';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function createState(spoilerScope: HelluvaBossSpoilerScope): DatabaseState {
  const state = getSeedData();
  return {
    ...state,
    extensions: {
      helluvaBoss: {
        ...createHelluvaBossSaveState(true),
        spoilerScope,
      },
    },
  };
}

describe('Helluva Boss spoiler scopes', () => {
  it('orders Season 1, Season 2 and Shorts without leaking later references', () => {
    expect(HELLUVA_BOSS_SPOILER_SCOPES).toEqual(['season_1', 'season_2', 'specials']);

    expect(isHelluvaBossSpoilerVisible('season_1', 'season_1')).toBe(true);
    expect(isHelluvaBossSpoilerVisible('season_1', 'season_2')).toBe(false);
    expect(isHelluvaBossSpoilerVisible('season_1', 'specials')).toBe(false);
    expect(isHelluvaBossSpoilerVisible('season_2', 'season_1')).toBe(true);
    expect(isHelluvaBossSpoilerVisible('season_2', 'season_2')).toBe(true);
    expect(isHelluvaBossSpoilerVisible('season_2', 'specials')).toBe(false);
    expect(isHelluvaBossSpoilerVisible('specials', 'season_1')).toBe(true);
    expect(isHelluvaBossSpoilerVisible('specials', 'season_2')).toBe(true);
    expect(isHelluvaBossSpoilerVisible('specials', 'specials')).toBe(true);
  });

  it('round-trips the Shorts scope through the versioned backup schema', () => {
    const json = ExportImport.exportToJson(createState('specials'));
    const result = ExportImport.validateBackup(json, { requireInventory: true });

    expect(result).toMatchObject({ isValid: true, migrated: false });
    expect(result.parsedState?.extensions.helluvaBoss?.spoilerScope).toBe('specials');
  });

  it('still rejects unknown spoiler scopes at the import boundary', () => {
    const backup = JSON.parse(ExportImport.exportToJson(createState('specials'))) as {
      extensions: { helluvaBoss: { spoilerScope: string } };
    };
    backup.extensions.helluvaBoss.spoilerScope = 'season_3';

    const result = ExportImport.validateBackup(JSON.stringify(backup), { requireInventory: true });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('extensions.helluvaBoss.spoilerScope contains an unsupported value');
  });

  it('offers the Shorts setting and persists it with unambiguous feedback', async () => {
    const saveScope = vi.spyOn(db, 'setHelluvaBossSpoilers').mockReturnValue(true);
    const onStateChange = vi.fn();
    const user = userEvent.setup();

    render(
      <HelluvaBoss
        state={createState('season_2')}
        onStateChange={onStateChange}
        onManageExtensions={vi.fn()}
      />,
    );

    const select = screen.getByLabelText('Reference visibility') as HTMLSelectElement;
    expect(Array.from(select.options).map(({ value, text }) => ({ value, text }))).toEqual(
      HELLUVA_BOSS_SPOILER_SCOPES.map((scope) => ({
        value: scope,
        text: HELLUVA_BOSS_SPOILER_SCOPE_COPY[scope].selectorLabel,
      })),
    );

    await user.selectOptions(select, 'specials');

    expect(saveScope).toHaveBeenCalledWith('specials');
    expect(onStateChange).toHaveBeenCalledOnce();
    expect(screen.getByRole('status').textContent).toBe(
      HELLUVA_BOSS_SPOILER_SCOPE_COPY.specials.changeNotice,
    );
  });
});
