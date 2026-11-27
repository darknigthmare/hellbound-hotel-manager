// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { STANDALONE_STAGES } from '../lib/pentagram-stages';
import { STANDALONE_FIGHTER_IDS } from '../standalone/roster';
import {
  applyMatchResult, buildRun, createDefaultSave, exportSave, getAvailableStandaloneStages,
  getRunEncounter, importSave, loadSave, validateSave, type StandaloneSave,
} from '../standalone/progression';
import { ReserveGallery } from '../standalone/ReserveGallery';

vi.mock('../../art/infernal-versus/production/reserve-assets.json', () => {
  const common = { kind: 'prop', dimensions: [512, 512], references: [], fidelityNotes: [] };
  return { default: { assets: [
    { ...common, id: 'early', name: 'Early prop', reference: 'S1E1', spoilerScope: 'season_1', export: 'public/early.webp' },
    { ...common, id: 'later', name: 'Later prop', reference: 'S2E1', spoilerScope: 'season_2', export: 'public/later.webp' },
    { ...common, id: 'future', name: 'Future prop', reference: 'S3E1', spoilerScope: 'season_3', export: 'public/future.webp' },
    { ...common, id: 'legacy-future', name: 'Legacy future prop', reference: 'Saison 3', export: 'public/legacy-future.webp' },
  ] } };
});

afterEach(cleanup);

describe('season-three opt-in and saved progression', () => {
  it('migrates legacy saves without writing storage and accepts only an explicit boolean', () => {
    const legacy = createDefaultSave();
    delete legacy.options.allowSeasonThree;
    const raw = JSON.stringify(legacy);
    const storage = { getItem: () => raw, setItem: vi.fn() };
    const loaded = loadSave(storage, STANDALONE_FIGHTER_IDS);
    expect(loaded.status).toBe('ok');
    expect(loaded.save.options.allowSeasonThree).toBe(false);
    expect(createDefaultSave().options.allowSeasonThree).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(JSON.stringify(legacy)).toBe(raw);
    for (const value of [null, 'true', 1, {}, []]) {
      expect(() => validateSave({ ...legacy, options: { ...legacy.options, allowSeasonThree: value } }, STANDALONE_FIGHTER_IDS)).toThrow(/saison 3/);
    }
    const enabled = { ...loaded.save, options: { ...loaded.save.options, allowSeasonThree: true } };
    expect(importSave(exportSave(enabled, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS)).toEqual(enabled);
  });

  it('gates automatic rotation after a resumed long route without changing opponents or results', () => {
    let save: StandaloneSave = {
      ...createDefaultSave(),
      run: buildRun('boss-rush', 'charlie', STANDALONE_FIGHTER_IDS, STANDALONE_FIGHTER_IDS, 427),
    };
    const australiaIndex = STANDALONE_STAGES.findIndex(stage => stage.id === 'australia-desert-s3');
    expect(australiaIndex).toBeGreaterThan(0);
    expect(save.run!.opponentIds.length).toBeGreaterThan(australiaIndex);
    for (let index = 0; index < australiaIndex; index += 1) {
      const encounter = getRunEncounter(save.run!, save.options);
      save = applyMatchResult(save, {
        id: `s3-route-${index}`, mode: 'boss-rush', fighterId: encounter.fighterId,
        opponentId: encounter.opponentId, outcome: 'won', playedAt: index,
      });
    }
    save = importSave(exportSave(save, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS);
    const originalRun = structuredClone(save.run);
    const originalStats = { ...save.stats };
    const hidden = new Set(STANDALONE_STAGES.filter(stage => stage.spoilerTier === 'season_3').map(stage => stage.id));
    expect(hidden.has(getRunEncounter(save.run!, save.options).stageId)).toBe(false);
    expect(getAvailableStandaloneStages().some(stage => hidden.has(stage.id))).toBe(false);
    save = { ...save, options: { ...save.options, allowSeasonThree: true } };
    save = importSave(exportSave(save, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS);
    expect(getRunEncounter(save.run!, save.options).stageId).toBe('australia-desert-s3');
    expect(getAvailableStandaloneStages(save.options)).toEqual(STANDALONE_STAGES);
    save = { ...save, options: { ...save.options, allowSeasonThree: false } };
    expect(hidden.has(getRunEncounter(save.run!, save.options).stageId)).toBe(false);
    expect(save.run).toEqual(originalRun);
    expect(save.stats).toEqual(originalStats);
  });
});

function GalleryWithScope() {
  const [allowSeasonTwo, setSeasonTwo] = useState(true);
  const [allowSeasonThree, setSeasonThree] = useState(false);
  return <ReserveGallery titleRef={null} allowSeasonTwo={allowSeasonTwo} allowSeasonThree={allowSeasonThree} onScopeChange={setSeasonTwo} onSeasonThreeChange={setSeasonThree} />;
}

describe('season-three gallery content', () => {
  it('reveals season-three artwork only after opt-in and clears a hidden detail when scope changes', () => {
    render(<GalleryWithScope />);
    expect(screen.getByRole('button', { name: /Early prop/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Later prop/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /future prop/i })).toBeNull();
    expect(document.querySelector('img[src="/future.webp"]')).toBeNull();
    fireEvent.change(screen.getByLabelText('Contenu de la galerie'), { target: { value: 'season_3' } });
    expect(screen.getByRole('button', { name: /Legacy future prop/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /SAISON 3\s*Future prop/ }));
    expect(screen.getByRole('heading', { name: 'Future prop' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Contenu de la galerie'), { target: { value: 'all' } });
    expect(screen.queryByRole('heading', { name: 'Future prop' })).toBeNull();
    expect(screen.queryByRole('button', { name: /future prop/i })).toBeNull();
    expect(document.querySelector('img[src="/future.webp"]')).toBeNull();
  });

  it('keeps season-one-only scope strict even if the saved season-three preference is enabled', () => {
    render(<ReserveGallery titleRef={null} allowSeasonTwo={false} allowSeasonThree={true} onScopeChange={vi.fn()} onSeasonThreeChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Early prop/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Later prop/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /future prop/i })).toBeNull();
  });
});
