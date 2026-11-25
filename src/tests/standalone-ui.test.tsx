// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STANDALONE_FIGHTER_IDS } from '../standalone/roster';
import { GLOBAL_CAMPAIGN } from '../standalone/campaign-global';
import type { PentagramStage } from '../lib/pentagram-stages';
import type { CombatState } from '../lib/pentagram-combat';
import type { Character, TimelineState } from '../types';
import { InfernalVersus } from '../standalone/InfernalVersus';
import { buildRun, createDefaultSave, STANDALONE_STORAGE_KEY, type StandaloneSave } from '../standalone/progression';

interface LiveProps {
  fighterOne: Character;
  fighterTwo: Character;
  timeline: TimelineState;
  matchMode: 'ai' | 'local';
  training?: boolean;
  stage: PentagramStage;
  stagePresentation?: 'alive' | 'static' | 'reduced';
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

describe('playable stories and elimination cups', () => {
  function press(label: string | RegExp) {
    fireEvent.click(screen.getByText(label, { selector: 'button, .iv-mode .iv-eyebrow' }));
  }

  it('loads the Charlie prologue, saves each duel, presents Adam as rival and reopens the ending', () => {
    const initial = render(<InfernalVersus />);
    press(/HISTOIRE/);
    press('Démarrer le parcours');
    expect(screen.getByRole('heading', { name: 'Une chambre, un choix' })).toBeTruthy();
    expect(screen.getByText(/PROLOGUE · Charlie/)).toBeTruthy();
    press('Entrer en combat');
    expect(runtime.last!.fighterTwo.id).toBe('vaggie');
    press('Fixture win');
    press('Fixture next');
    expect(screen.getByText(/INTERLUDE · Charlie/)).toBeTruthy();
    initial.unmount();
    render(<InfernalVersus />);
    press('Continuer');
    press('Entrer en combat');
    expect(runtime.last!.fighterTwo.id).toBe('velvette');
    expect(runtime.last!.stage.id).toBe('vee-broadcast-studio');
    press('Fixture win');
    press('Fixture next');
    expect(screen.getByRole('heading', { name: 'Rival · Adam' })).toBeTruthy();
    press('Entrer en combat');
    press('Fixture win');
    press('Fixture next');
    expect(screen.getByText(/ÉPILOGUE · Charlie/)).toBeTruthy();
    press('Retour aux modes');
    press('Revoir l’épilogue');
    expect(saved().stats.matches).toBe(3);
    expect(screen.getByText(/ÉPILOGUE · Charlie/)).toBeTruthy();
    press('Retour aux modes');
    press('ARCADE');
    press('Démarrer le parcours');
    press('Fixture quit');
    press('Combattants');
    const entry = screen.getByText('Charlie Morningstar · Une chambre, un choix');
    fireEvent.click(entry);
    expect(entry.closest('details')?.open).toBe(true);
    expect(screen.getByText(/Charlie laisse la clé à portée/)).toBeTruthy();
  }, 30_000);

  it('keeps a drawn cup through reload, shows CPU results and ends the cup on defeat', () => {
    const first = render(<InfernalVersus />);
    press(/TOURNOI/);
    press('Démarrer le parcours');
    expect(screen.getAllByText('À déterminer')).toHaveLength(6);
    const opponents = saved().run!.opponentIds;
    press('Disputer le match');
    press('Fixture win');
    first.unmount();
    render(<InfernalVersus />);
    press('Continuer');
    expect(screen.getByRole('heading', { name: 'Demi-finales', level: 1 })).toBeTruthy();
    expect(screen.getAllByLabelText('Victoire')).toHaveLength(4);
    press('Disputer le match');
    expect(runtime.last!.fighterTwo.id).toBe(opponents[1]);
    press('Fixture loss');
    press('Fixture next');
    expect(screen.getByRole('heading', { name: 'Palmarès du tournoi' })).toBeTruthy();
    expect(screen.getAllByLabelText('Victoire')).toHaveLength(7);
    press('Retour aux modes');
    expect(screen.queryByRole('button', { name: 'Réessayer le duel' })).toBeNull();
    press('Voir le tableau final');
    expect(screen.getByRole('heading', { name: 'Palmarès du tournoi' })).toBeTruthy();
  }, 30_000);
});

describe('guide integration and narrative compatibility', () => {
  it('plays nine campaign chapters with changing actors, a retry, reload and a permanent epilogue', () => {
    let view = render(<InfernalVersus />);
    click(/CAMPAGNE/);
    click('Commencer la campagne');
    expect(screen.getByRole('heading', { name: 'Une invitation sans petites lignes' })).toBeTruthy();
    const actors: string[] = [];
    for (let index = 0; index < 9; index++) {
      if (index === 2) {
        view.unmount();
        view = render(<InfernalVersus />);
        click('Continuer');
      }
      click('Entrer en combat');
      actors.push(runtime.last!.fighterOne.id);
      expect(runtime.last!.fighterTwo.id).toBe(GLOBAL_CAMPAIGN.chapters[index].opponentId);
      expect(runtime.last!.stage.id).toBe(GLOBAL_CAMPAIGN.chapters[index].stageId);
      if (index === 1) {
        click('Fixture loss');
        click('Fixture next');
        click('Réessayer le duel');
        click('Entrer en combat');
        expect(runtime.last!.fighterOne.id).toBe('hb_blitzo');
      }
      click('Fixture win');
      click('Fixture win');
      click('Fixture next');
    }
    expect(actors).toEqual(['charlie', 'hb_blitzo', 'angeldust', 'hb_loona', 'vaggie', 'hb_millie', 'hb_fizzarolli', 'alastor', 'charlie']);
    expect(saved().run?.status).toBe('complete');
    expect(saved().stats).toMatchObject({ matches: 10, wins: 9, losses: 1 });
    expect(saved().campaignEndings).toEqual(['signal-libre:1']);
    expect(screen.getByText(/ÉPILOGUE · CAMPAGNE GLOBALE/)).toBeTruthy();
    click('Retour aux modes');
    click('Clore le parcours');
    click('Combattants');
    expect(screen.getByText('Campagne globale · La nuit du signal libre')).toBeTruthy();
    expect(localStorage.getItem('hellbound_hotel_db_state')).toBe('hotel-save-sentinel');
  }, 30_000);

  it('resumes a pre-guide route with its original rival, scenery, pictures and archived ending', () => {
    const run = buildRun('story', 'charlie', STANDALONE_FIGHTER_IDS, [], 71, 1);
    delete run.routeVersion;
    const legacy = {
      version: 1,
      options: { soundtrack: true, reducedMotion: false, difficulty: 'standard' },
      stats: createDefaultSave().stats,
      storyEndings: [], recentResults: [], processedResultIds: [], run,
    };
    localStorage.setItem(STANDALONE_STORAGE_KEY, JSON.stringify(legacy));
    render(<InfernalVersus />);
    click('Continuer');
    expect(screen.getByRole('heading', { name: 'Une place à la table' })).toBeTruthy();
    for (const opponent of ['vaggie', 'alastor', 'adam']) {
      click('Entrer en combat');
      expect(runtime.last!.fighterTwo.id).toBe(opponent);
      click('Fixture win');
      click('Fixture next');
    }
    expect(saved().storyCompletions).toEqual([{ fighterId: 'charlie', routeVersion: 1 }]);
    click('Retour aux modes');
    click('Combattants');
    expect(screen.getByText('Charlie Morningstar · Une place à la table · Archive')).toBeTruthy();
    expect(screen.queryByText('Charlie Morningstar · Une chambre, un choix')).toBeNull();
  });

  it('does not retain a hidden season-two fighter when a filtered story list is empty', () => {
    render(<InfernalVersus />);
    click(/HISTOIRE/);
    fireEvent.change(screen.getByLabelText('Univers'), { target: { value: 'Helluva Boss' } });
    click(/Mammon\s*HELLUVA/);
    fireEvent.change(screen.getByLabelText('Contenu'), { target: { value: 'season_1' } });
    expect(screen.getByRole('button', { name: 'Démarrer le parcours' }).hasAttribute('disabled')).toBe(true);
    expect(screen.queryByRole('heading', { name: 'Mammon' })).toBeNull();
    click('Modes de jeu');
    click(/VERSUS CPU/);
    click('Lancer le combat');
    expect(runtime.last!.fighterOne.id).not.toBe('hb_mammon');
    expect(runtime.last!.timeline.spoilerLevel).toBe('season_1');
    click('Fixture quit');
    click(/CAMPAGNE/);
    expect(screen.queryByRole('button', { name: 'Commencer la campagne' })).toBeNull();
    expect(screen.queryByText(GLOBAL_CAMPAIGN.intro)).toBeNull();
  });

  it('filters reserve art without changing the roster and keeps scene preferences after reload', () => {
    const view = render(<InfernalVersus />);
    click('Galerie');
    expect(document.querySelectorAll('.iv-reserve-card')).toHaveLength(22);
    fireEvent.change(screen.getByLabelText('Catégorie'), { target: { value: 'projectile' } });
    const dart = screen.getByRole('button', { name: /Fléchette tranquillisante/ });
    fireEvent.click(dart);
    expect(document.activeElement).toBe(screen.getByRole('heading', { name: /Fléchette tranquillisante/ }));
    click('Refermer l’aperçu');
    expect(document.activeElement).toBe(dart);
    fireEvent.change(screen.getByLabelText('Contenu de la galerie'), { target: { value: 'season_1' } });
    expect(document.querySelectorAll('.iv-reserve-card')).toHaveLength(0);
    click('Options');
    fireEvent.change(screen.getByLabelText('Présentation des décors'), { target: { value: 'static' } });
    view.unmount();
    render(<InfernalVersus />);
    expect(screen.getByText('43', { selector: 'strong' })).toBeTruthy();
    click(/VERSUS CPU/);
    click('Lancer le combat');
    expect(runtime.last!.stagePresentation).toBe('static');
  });
});
