// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CombatState } from '../lib/pentagram-combat';
import type { Character, TimelineState } from '../types';
import { InfernalVersus } from '../standalone/InfernalVersus';
import { createDefaultSave, STANDALONE_STORAGE_KEY, type StandaloneSave } from '../standalone/progression';

interface LiveProps {
  fighterOne: Character;
  fighterTwo: Character;
  timeline: TimelineState;
  matchMode: 'ai' | 'local';
  training?: boolean;
  onMatchComplete?: (result: CombatState) => void;
  onNextMatch?: () => void;
  onExit: () => void;
}
const runtime = vi.hoisted(() => ({ last: null as LiveProps | null }));
vi.mock('../components/PentagramLiveFight', () => ({
  PentagramLiveFight: (props: LiveProps) => {
    runtime.last = props;
    return <section aria-label="Mock combat">
      <p>{props.fighterOne.name} vs {props.fighterTwo.name}</p>
      <button onClick={() => props.onMatchComplete?.({ matchWinner: 'one' } as CombatState)}>Fixture win</button>
      <button onClick={() => props.onMatchComplete?.({ matchWinner: 'two' } as CombatState)}>Fixture loss</button>
      <button onClick={() => props.onNextMatch?.()}>Fixture next</button>
      <button onClick={props.onExit}>Fixture quit</button>
    </section>;
  },
}));
const audio = vi.hoisted(() => ({
  start: vi.fn(async () => 'started'),
  stop: vi.fn(), release: vi.fn(), pause: vi.fn(), resume: vi.fn(),
}));
vi.mock('../components/usePentagramCombatSoundtrack', () => ({
  usePentagramCombatSoundtrack: () => ({ status: 'idle', ...audio }),
}));

function saved(): StandaloneSave {
  const raw = localStorage.getItem(STANDALONE_STORAGE_KEY);
  if (!raw) throw new Error('Expected a standalone save');
  return JSON.parse(raw) as StandaloneSave;
}
function click(name: string | RegExp) { fireEvent.click(screen.getByRole('button', { name })); }
function startArcade() { click(/ARCADE/); click('Démarrer le parcours'); }
function upload(text: string) {
  const file = new File([text], 'save.json', { type: 'application/json' });
  Object.defineProperty(file, 'text', { value: async () => text });
  const input = document.querySelector<HTMLInputElement>('input[type=file]');
  if (!input) throw new Error('Import input missing');
  fireEvent.change(input, { target: { files: [file] } });
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('hellbound_hotel_db_state', 'hotel-save-sentinel');
  localStorage.setItem('h_inv_supplies', '1234');
  runtime.last = null;
  vi.clearAllMocks();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('Infernal Versus application flow', () => {
  it('completes five Arcade matches, deduplicates callbacks and resumes the route after reload', () => {
    const first = render(<InfernalVersus />);
    startArcade();
    const route = saved().run!.opponentIds;
    click('Fixture win');
    click('Fixture win');
    expect(saved().stats.matches).toBe(1);
    expect(saved().run!.index).toBe(1);
    expect(screen.getByText(/Duel 1 \/ 5/)).toBeTruthy();
    click('Fixture next');
    expect(runtime.last?.fighterTwo.id).toBe(route[1]);
    click('Fixture win');
    first.unmount();
    render(<InfernalVersus />);
    click('Continuer');
    expect(runtime.last?.fighterTwo.id).toBe(route[2]);
    for (let index = 2; index < 5; index += 1) {
      click('Fixture win');
      click('Fixture next');
    }
    expect(saved().run!.status).toBe('complete');
    expect(saved().stats.matches).toBe(5);
    expect(saved().stats.completedArcades).toBe(1);
    expect(screen.getByText(/5\/5 victoires · terminé/)).toBeTruthy();
    expect(localStorage.getItem('hellbound_hotel_db_state')).toBe('hotel-save-sentinel');
    expect(localStorage.getItem('h_inv_supplies')).toBe('1234');
  });

  it('records a defeat at duel one, preserves the opponent and requires explicit retry after reload', () => {
    const first = render(<InfernalVersus />);
    startArcade();
    const opponent = runtime.last!.fighterTwo.id;
    click('Fixture loss');
    expect(screen.getByText(/Duel 1 \/ 5/)).toBeTruthy();
    expect(saved().run!.status).toBe('failed');
    first.unmount();
    render(<InfernalVersus />);
    expect(screen.queryByRole('button', { name: 'Continuer' })).toBeNull();
    click('Réessayer le duel');
    expect(runtime.last!.fighterTwo.id).toBe(opponent);
    expect(saved().run!.status).toBe('active');
    expect(saved().run!.retries).toBe(1);
    click('Fixture win');
    expect(saved().run!.index).toBe(1);
    expect(saved().stats.losses).toBe(1);
  });

  it('preserves an existing run until another run is actually launched', () => {
    render(<InfernalVersus />);
    startArcade();
    click('Fixture quit');
    const previous = saved().run;
    click(/SURVIE/);
    expect(saved().run).toEqual(previous);
    expect(screen.getByText(/Démarrer remplacera le parcours en cours/)).toBeTruthy();
    click('Démarrer le parcours');
    expect(saved().run!.mode).toBe('survival');
    expect(saved().run!.opponentIds).toHaveLength(20);
  });

  it('passes the season-one scope to the audience and preserves it when resuming a run', () => {
    const first = render(<InfernalVersus />);
    click(/ARCADE/);
    expect(screen.getByRole('button', { name: /Baxter\s*HAZBIN/ })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Contenu'), { target: { value: 'season_1' } });
    expect(screen.queryByRole('button', { name: /Baxter\s*HAZBIN/ })).toBeNull();
    click('Démarrer le parcours');
    expect(runtime.last!.timeline.hideSpoilers).toBe(true);
    expect(runtime.last!.timeline.spoilerLevel).toBe('season_1');
    expect(runtime.last!.timeline.current).toBe('season_1_end');
    first.unmount();
    render(<InfernalVersus />);
    click('Continuer');
    expect(runtime.last!.timeline.hideSpoilers).toBe(true);
    expect(runtime.last!.timeline.spoilerLevel).toBe('season_1');
  });

  it('supports local mirror matches and counts separate rematches only once each', () => {
    render(<InfernalVersus />);
    click(/2 JOUEURS/);
    click(/J2 · Blitzø/);
    click(/Charlie Morningstar\s*HAZBIN/);
    click('Lancer le combat');
    expect(runtime.last!.matchMode).toBe('local');
    expect(runtime.last!.fighterOne.id).toBe(runtime.last!.fighterTwo.id);
    click('Fixture win');
    click('Fixture win');
    expect(saved().stats.matches).toBe(1);
    const firstId = saved().recentResults[0].id;
    click('Fixture next');
    click('Fixture loss');
    expect(saved().stats.matches).toBe(2);
    expect(saved().recentResults[0].id).not.toBe(firstId);
  });

  it('validates imports before confirmation, keeps unrelated saves, and applies options only on confirmation', async () => {
    localStorage.setItem(STANDALONE_STORAGE_KEY, JSON.stringify(createDefaultSave()));
    render(<InfernalVersus />);
    click('Options');
    const before = localStorage.getItem(STANDALONE_STORAGE_KEY);
    upload('{broken');
    await screen.findByRole('status');
    expect(screen.queryByRole('button', { name: 'Confirmer l’import' })).toBeNull();
    expect(localStorage.getItem(STANDALONE_STORAGE_KEY)).toBe(before);
    const incoming = createDefaultSave();
    incoming.options.difficulty = 'overlord';
    upload(JSON.stringify(incoming));
    await screen.findByRole('button', { name: 'Confirmer l’import' });
    expect(localStorage.getItem(STANDALONE_STORAGE_KEY)).toBe(before);
    click('Confirmer l’import');
    expect(saved().options.difficulty).toBe('overlord');
    expect((screen.getByLabelText('Difficulté par défaut') as HTMLSelectElement).value).toBe('overlord');
    expect(localStorage.getItem('hellbound_hotel_db_state')).toBe('hotel-save-sentinel');
    expect(localStorage.getItem('h_inv_supplies')).toBe('1234');
  });

  it('preserves corrupt save bytes while browsing and presents recovery before any mutation', () => {
    localStorage.setItem(STANDALONE_STORAGE_KEY, 'corrupt-original-bytes');
    render(<InfernalVersus />);
    click('Combattants');
    click('Options');
    expect(localStorage.getItem(STANDALONE_STORAGE_KEY)).toBe('corrupt-original-bytes');
    expect(screen.getByRole('button', { name: 'Exporter la donnée à récupérer' })).toBeTruthy();
  });

  it('provides keyboard navigation, focuses each screen title and leaves training outside statistics', async () => {
    const user = userEvent.setup();
    render(<InfernalVersus />);
    screen.getByRole('button', { name: 'Options' }).focus();
    await user.keyboard('{Enter}');
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: 'Options & progression' }));
    click('Jouer');
    click(/DOJO/);
    click('Lancer le combat');
    expect(runtime.last!.training).toBe(true);
    click('Fixture win');
    expect(saved().stats.matches).toBe(0);
  });
});
