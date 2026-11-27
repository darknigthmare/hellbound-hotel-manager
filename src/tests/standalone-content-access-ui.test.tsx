// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InfernalVersus } from '../standalone/InfernalVersus';
import { buildRun, createDefaultSave, STANDALONE_STORAGE_KEY, type StandaloneSave } from '../standalone/progression';
import { STANDALONE_BOSS_IDS, STANDALONE_FIGHTER_IDS } from '../standalone/roster';

const runtime = vi.hoisted(() => ({ last: null as any }));
vi.mock('../components/PentagramLiveFight', () => ({
  PentagramLiveFight: (props: any) => {
    runtime.last = props;
    return <section aria-label="Test duel">
      <button onClick={() => props.onMatchComplete({ matchWinner: 'one' })}>Win</button>
      <button onClick={() => props.onNextMatch()}>Next</button>
      <button onClick={props.onExit}>Exit</button>
    </section>;
  },
}));
vi.mock('../components/usePentagramCombatSoundtrack', () => ({
  usePentagramCombatSoundtrack: () => ({ status: 'idle', start: vi.fn(), stop: vi.fn(), release: vi.fn(), pause: vi.fn(), resume: vi.fn() }),
}));
function click(name: string | RegExp) { fireEvent.click(screen.getByRole('button', { name })); }
function saved(): StandaloneSave { return JSON.parse(localStorage.getItem(STANDALONE_STORAGE_KEY)!); }
function initialSave() {
  const save = createDefaultSave();
  save.options.progressionEnabled = true;
  save.options.soundtrack = false;
  return save;
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(STANDALONE_STORAGE_KEY, JSON.stringify(initialSave()));
  runtime.last = null;
});
afterEach(cleanup);

describe('content access from selection to match', () => {
  it('keeps locked slots focusable, explains their condition and rejects their selection', () => {
    render(<InfernalVersus />);
    click(/VERSUS CPU/);
    const lucifer = screen.getByRole('button', { name: /Lucifer.*HAZBIN.*À débloquer/ });
    lucifer.focus();
    expect(document.activeElement).toBe(lucifer);
    expect(lucifer.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(lucifer);
    expect(screen.getByRole('status').textContent).toContain('Terminer la chronique de Charlie');
    const gates = screen.getByRole('button', { name: /Portes célestes.*À débloquer/ });
    fireEvent.click(gates);
    expect(screen.getByRole('status').textContent).toContain('5 duels');
    click('Lancer le combat');
    expect(runtime.last.fighterOne.id).toBe('charlie');
    expect(runtime.last.stage.id).toBe('hotel-lobby');
  });

  it('lets the dojo borrow locked fighters and stages without awarding access', () => {
    render(<InfernalVersus />);
    click(/DOJO/);
    click(/Lucifer.*HAZBIN/);
    click('Paradis · Portes célestes');
    click('Lancer le combat');
    expect(runtime.last.fighterOne.id).toBe('lucifer');
    expect(runtime.last.stage.id).toBe('hh-heaven-gates');
    click('Win');
    click('Exit');
    expect(saved().stats.wins).toBe(0);
    click(/VERSUS CPU/);
    expect(screen.getByRole('button', { name: /Lucifer.*HAZBIN.*À débloquer/ }).getAttribute('aria-disabled')).toBe('true');
    click('Lancer le combat');
    expect(runtime.last.fighterOne.id).not.toBe('lucifer');
    expect(runtime.last.stage.id).not.toBe('hh-heaven-gates');
  });

  it('keeps a locked equipped costume in the save, falls back, then restores it after a win and reload', () => {
    const save = initialSave();
    save.wardrobe = { one: { hb_blitzo: 'hb_blitzo-bodyguard-looloo' } };
    localStorage.setItem(STANDALONE_STORAGE_KEY, JSON.stringify(save));
    const view = render(<InfernalVersus />);
    click(/VERSUS CPU/);
    click(/Blitzø\s*HELLUVA/);
    expect(screen.getByText(/Votre tenue préférée reste enregistrée/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Bodyguard.*À débloquer/ }).getAttribute('aria-disabled')).toBe('true');
    click('Lancer le combat');
    expect(runtime.last.costumeOne).toBeUndefined();
    expect(saved().wardrobe?.one?.hb_blitzo).toBe('hb_blitzo-bodyguard-looloo');
    click('Win');
    expect(screen.getByRole('status').textContent).toContain('1 récompense acquise');
    expect(runtime.last.costumeOne).toBeUndefined();
    click('Next');
    expect(runtime.last.costumeOne).toBe('hb_blitzo-bodyguard-looloo');
    view.unmount();
    render(<InfernalVersus />);
    click(/VERSUS CPU/);
    click(/Blitzø\s*HELLUVA/);
    click('Lancer le combat');
    expect(runtime.last.costumeOne).toBe('hb_blitzo-bodyguard-looloo');
  });

  it('opens Boss Rush only after an Arcade completion and preserves the progression option', () => {
    render(<InfernalVersus />);
    const rush = screen.getByRole('button', { name: /BOSS RUSH/ });
    expect(rush.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(rush);
    expect(screen.queryByRole('button', { name: 'Démarrer le parcours' })).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('Terminer 1 parcours Arcade');
    click(/ARCADE/);
    click('Démarrer le parcours');
    for (let index = 0; index < 5; index++) { click('Win'); click('Next'); }
    expect(saved().stats.completedArcades).toBe(1);
    expect(saved().options.progressionEnabled).toBe(true);
    expect(screen.getByRole('button', { name: /BOSS RUSH/ }).getAttribute('aria-disabled')).toBeNull();
    click(/BOSS RUSH/);
    click('Démarrer le parcours');
    expect(saved().run?.mode).toBe('boss-rush');
  });

  it.each(['arcade', 'boss-rush'] as const)('resumes an established %s route after locks are enabled without unlocking new selections', mode => {
    const save = initialSave();
    save.run = buildRun(mode, 'lucifer', STANDALONE_FIGHTER_IDS, STANDALONE_BOSS_IDS, 1234);
    localStorage.setItem(STANDALONE_STORAGE_KEY, JSON.stringify(save));
    render(<InfernalVersus />);
    expect(screen.getByRole('button', { name: /BOSS RUSH/ }).getAttribute('aria-disabled')).toBe('true');
    click('Continuer');
    expect(runtime.last.fighterOne.id).toBe('lucifer');
    expect(saved().run?.fighterId).toBe('lucifer');
    click('Exit');
    expect(saved().stats.wins).toBe(0);
    expect(screen.getByRole('button', { name: /BOSS RUSH/ }).getAttribute('aria-disabled')).toBe('true');
    click(/VERSUS CPU/);
    expect(screen.getByRole('button', { name: /Lucifer.*HAZBIN.*À débloquer/ }).getAttribute('aria-disabled')).toBe('true');
    click('Lancer le combat');
    expect(runtime.last.fighterOne.id).toBe('charlie');
  });
});
