import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LocalDb } from '../db/localDb';
import { getSeedData } from '../db/seed';
import {
  HELLUVA_APPROACHES,
  HELLUVA_BOSS_DATA_VERSION,
  HELLUVA_CHARACTERS,
  HELLUVA_CONTRACTS,
  HELLUVA_CREW_IDS,
  HELLUVA_SPRITE_SHEETS,
  getHelluvaApproachesForContract
} from '../expansions/helluva-boss/data';
import {
  createHelluvaBossSaveState,
  getHelluvaContractStatus,
  getHelluvaOutcome,
  resolveHelluvaChoice,
  startHelluvaContract
} from '../expansions/helluva-boss/engine';
import {
  BACKUP_SCHEMA_VERSION,
  ExportImport,
  StorageLike
} from '../lib/export-import';
import { DatabaseState, HelluvaBossSaveState } from '../types';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  public get length() { return this.values.size; }
  public clear() { this.values.clear(); }
  public getItem(key: string) { return this.values.get(key) ?? null; }
  public key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  public removeItem(key: string) { this.values.delete(key); }
  public setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

function exportedBackup(storage = new MemoryStorage()) {
  return JSON.parse(ExportImport.exportToJson(getSeedData(), storage)) as Record<string, unknown>;
}

function publishedAsset(publicPath: string) {
  const absolutePath = resolve(process.cwd(), 'public', publicPath.replace(/^\//, ''));
  expect(existsSync(absolutePath), `missing published Helluva asset: ${absolutePath}`).toBe(true);
  const png = readFileSync(absolutePath);
  expect(png.subarray(0, 8).toString('hex'), absolutePath).toBe('89504e470d0a1a0a');
  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
    colorType: png[25]
  };
}

function hotelStateOnly(state: DatabaseState) {
  return Object.fromEntries(
    Object.entries(state).filter(([key]) => key !== 'auditLogs' && key !== 'extensions')
  );
}

const SAFE_HELLUVA_CHOICES = ['crew_briefing', 'silent_entry', 'paid_recovery'] as const;

function completeHelluvaContracts(count: number): HelluvaBossSaveState {
  let state = createHelluvaBossSaveState(true);
  for (const contract of HELLUVA_CONTRACTS.slice(0, count)) {
    state = startHelluvaContract(state, contract.id);
    for (const choiceId of SAFE_HELLUVA_CHOICES) {
      state = resolveHelluvaChoice(state, choiceId).state;
    }
  }
  return state;
}

function followHelluvaPath(choiceIds: readonly string[]): HelluvaBossSaveState {
  let state = createHelluvaBossSaveState(true);
  for (const contract of HELLUVA_CONTRACTS) {
    if (state.status !== 'active') break;
    state = startHelluvaContract(state, contract.id);
    for (const choiceId of choiceIds) {
      state = resolveHelluvaChoice(state, choiceId).state;
      if (state.status !== 'active') break;
    }
  }
  return state;
}

function followHelluvaPathInDatabase(choiceIds: readonly string[]) {
  const storage = new MemoryStorage();
  const database = new LocalDb(storage);
  expect(database.toggleHelluvaBossExtension(true)).toBe(true);

  for (const contract of HELLUVA_CONTRACTS) {
    expect(database.startHelluvaBossContract(contract.id)).toBe(true);
    for (const choiceId of choiceIds) {
      expect(database.resolveHelluvaBossChoice(choiceId)).toBe(true);
      if (database.getFullState().extensions.helluvaBoss?.status !== 'active') {
        return { database, storage };
      }
    }
  }

  return { database, storage };
}

function helluvaBackup(state: HelluvaBossSaveState) {
  const backup = exportedBackup();
  backup.extensions = { helluvaBoss: state };
  return backup;
}

function expectHelluvaStateRejected(state: HelluvaBossSaveState, expectedError: string) {
  const result = ExportImport.validateBackup(JSON.stringify(helluvaBackup(state)), { requireInventory: true });
  expect(result.isValid).toBe(false);
  expect(result.error).toContain(expectedError);
}

describe('Helluva Boss backup schema', () => {
  it('exports schema v4 and migrates a v3 backup with the extension disabled', () => {
    expect(BACKUP_SCHEMA_VERSION).toBe(4);
    const v3 = exportedBackup();
    v3.schemaVersion = 3;
    delete v3.extensions;

    const result = ExportImport.validateBackup(JSON.stringify(v3), { requireInventory: true });

    expect(result).toMatchObject({ isValid: true, migrated: true });
    expect(result.parsedState?.schemaVersion).toBe(4);
    expect(result.parsedState?.extensions).toEqual({});
    expect(result.warnings).toContain(
      'Legacy backup migrated with optional content extensions disabled and no core data loss.'
    );
  });

  it('rejects extension save data from a future unsupported data version', () => {
    const backup = exportedBackup();
    backup.extensions = {
      helluvaBoss: {
        ...createHelluvaBossSaveState(true),
        dataVersion: HELLUVA_BOSS_DATA_VERSION + 1
      }
    };

    const result = ExportImport.validateBackup(JSON.stringify(backup), { requireInventory: true });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`unsupported data version ${HELLUVA_BOSS_DATA_VERSION + 1}`);
  });

  it('accepts fresh, partially resolved and fully completed engine states', () => {
    const fresh = createHelluvaBossSaveState(true);
    let partial = startHelluvaContract(fresh, HELLUVA_CONTRACTS[0].id);
    partial = resolveHelluvaChoice(partial, 'crew_briefing').state;
    const victory = completeHelluvaContracts(HELLUVA_CONTRACTS.length);

    for (const state of [fresh, partial, victory]) {
      expect(ExportImport.validateBackup(JSON.stringify(helluvaBackup(state)), { requireInventory: true }))
        .toMatchObject({ isValid: true });
    }
  });

  it('rejects completed contracts unless they are the exact ordered chain prefix', () => {
    const skippedFirstContract = createHelluvaBossSaveState(true);
    skippedFirstContract.completedContractIds = [HELLUVA_CONTRACTS[1].id];
    skippedFirstContract.campaignDay = 2;

    expectHelluvaStateRejected(skippedFirstContract, 'exact ordered prefix');

    const reorderedContracts = completeHelluvaContracts(2);
    reorderedContracts.completedContractIds.reverse();
    expectHelluvaStateRejected(reorderedContracts, 'exact ordered prefix');
  });

  it('requires the active contract to be exactly the next uncompleted contract', () => {
    const skippedActiveContract = createHelluvaBossSaveState(true);
    skippedActiveContract.activeContractId = HELLUVA_CONTRACTS[1].id;
    expectHelluvaStateRejected(skippedActiveContract, `next uncompleted contract '${HELLUVA_CONTRACTS[0].id}'`);

    const alreadyCompletedActiveContract = completeHelluvaContracts(1);
    alreadyCompletedActiveContract.status = 'active';
    alreadyCompletedActiveContract.activeContractId = HELLUVA_CONTRACTS[0].id;
    expectHelluvaStateRejected(alreadyCompletedActiveContract, `next uncompleted contract '${HELLUVA_CONTRACTS[1].id}'`);
  });

  it('keeps active phase, resolved choices and the active contract synchronized', () => {
    const noActiveContract = createHelluvaBossSaveState(true);
    noActiveContract.activePhaseIndex = 1;
    expectHelluvaStateRejected(noActiveContract, 'activePhaseIndex must be 0 when no contract is active');

    let missingPriorPhase = startHelluvaContract(createHelluvaBossSaveState(true), HELLUVA_CONTRACTS[0].id);
    missingPriorPhase = resolveHelluvaChoice(missingPriorPhase, 'crew_briefing').state;
    missingPriorPhase.activePhaseIndex = 2;
    expectHelluvaStateRejected(missingPriorPhase, 'is missing resolved phase');

    const completedButMissingChoice = completeHelluvaContracts(1);
    completedButMissingChoice.selectedChoiceIds.pop();
    expectHelluvaStateRejected(completedButMissingChoice, 'is missing resolved phase');
  });

  it('requires terminal and complete campaign states to agree', () => {
    const prematureVictory = createHelluvaBossSaveState(true);
    prematureVictory.status = 'victory';
    expectHelluvaStateRejected(prematureVictory, `victory requires all ${HELLUVA_CONTRACTS.length} contracts`);

    const stillActiveAfterCompletion = completeHelluvaContracts(HELLUVA_CONTRACTS.length);
    stillActiveAfterCompletion.status = 'active';
    expectHelluvaStateRejected(stillActiveAfterCompletion, 'cannot remain active after all contracts are completed');

    const activeContractAfterCompletion = completeHelluvaContracts(HELLUVA_CONTRACTS.length);
    activeContractAfterCompletion.status = 'active';
    activeContractAfterCompletion.activeContractId = HELLUVA_CONTRACTS.at(-1)!.id;
    expectHelluvaStateRejected(activeContractAfterCompletion, 'cannot keep an active contract after all contracts are completed');
  });

  it('rejects malformed, phase-incompatible and unknown selected choice IDs', () => {
    const contractId = HELLUVA_CONTRACTS[0].id;
    const cases: Array<[string, string]> = [
      [`${contractId}:0`, 'malformed choice'],
      [`${contractId}:0:silent_entry`, 'wrong or unsupported phase'],
      [`${contractId}:0:not_a_stable_choice`, 'wrong or unsupported phase']
    ];

    for (const [choice, error] of cases) {
      let state = startHelluvaContract(createHelluvaBossSaveState(true), contractId);
      state = resolveHelluvaChoice(state, 'crew_briefing').state;
      state.selectedChoiceIds = [choice];
      expectHelluvaStateRejected(state, error);
    }
  });

  it('allows exactly one choice for each resolved in-sequence phase', () => {
    const contractId = HELLUVA_CONTRACTS[0].id;
    let duplicatePhase = startHelluvaContract(createHelluvaBossSaveState(true), contractId);
    duplicatePhase = resolveHelluvaChoice(duplicatePhase, 'crew_briefing').state;
    duplicatePhase.selectedChoiceIds.push(`${contractId}:0:verified_intel`);
    expectHelluvaStateRejected(duplicatePhase, 'exactly one choice per resolved phase');

    const outOfSequencePhase = createHelluvaBossSaveState(true);
    outOfSequencePhase.selectedChoiceIds = [`${contractId}:0:crew_briefing`];
    expectHelluvaStateRejected(outOfSequencePhase, 'unresolved or out-of-sequence phase');
  });

  it('accepts only a strict partial prefix of the next contract when it triggered collapse', () => {
    const collapsed = followHelluvaPath(['wing_it', 'full_spectacle', 'erase_trail']);
    const nextContractId = HELLUVA_CONTRACTS[collapsed.completedContractIds.length].id;
    const validResult = ExportImport.validateBackup(
      JSON.stringify(helluvaBackup(collapsed)),
      { requireInventory: true }
    );
    expect(validResult).toMatchObject({ isValid: true });
    expect(collapsed.selectedChoiceIds.at(-1)).toBe(`${nextContractId}:0:wing_it`);

    const missingFirstPhase = structuredClone(collapsed);
    missingFirstPhase.selectedChoiceIds[missingFirstPhase.selectedChoiceIds.length - 1]
      = `${nextContractId}:1:full_spectacle`;
    expectHelluvaStateRejected(missingFirstPhase, 'phase prefix of the next contract');

    const impossibleThirdPhase = structuredClone(collapsed);
    impossibleThirdPhase.selectedChoiceIds.push(`${nextContractId}:2:erase_trail`);
    expectHelluvaStateRejected(impossibleThirdPhase, 'phase prefix of the next contract');

    const futureContract = structuredClone(collapsed);
    futureContract.selectedChoiceIds[futureContract.selectedChoiceIds.length - 1]
      = `${HELLUVA_CONTRACTS[collapsed.completedContractIds.length + 1].id}:0:wing_it`;
    expectHelluvaStateRejected(futureContract, 'phase prefix of the next contract');
  });

  it('requires a real terminal metric before accepting a collapsed partial contract', () => {
    const fakeCollapse = followHelluvaPath(['wing_it', 'full_spectacle', 'erase_trail']);
    fakeCollapse.cohesion = 1;

    expectHelluvaStateRejected(fakeCollapse, 'status collapse requires a terminal');
  });

  it('requires active and victory states with any terminal metric to be collapse', () => {
    const terminalActiveStates = [
      Object.assign(createHelluvaBossSaveState(true), { heat: 100 }),
      Object.assign(createHelluvaBossSaveState(true), { cohesion: 0 }),
      Object.assign(createHelluvaBossSaveState(true), { funds: -500 }),
      Object.assign(createHelluvaBossSaveState(true), {
        crewFatigue: Object.fromEntries(HELLUVA_CREW_IDS.map(crewId => [crewId, 100]))
      })
    ];
    for (const state of terminalActiveStates) {
      expectHelluvaStateRejected(state, 'requires status collapse');
    }

    const terminalVictory = completeHelluvaContracts(HELLUVA_CONTRACTS.length);
    terminalVictory.heat = 100;
    expectHelluvaStateRejected(terminalVictory, 'requires status collapse');
  });

  it('requires exactly the four stable crew fatigue IDs with integer values from 0 to 100', () => {
    const missingCrew = createHelluvaBossSaveState(true);
    delete missingCrew.crewFatigue[HELLUVA_CREW_IDS[0]];
    expectHelluvaStateRejected(missingCrew, 'exactly the four stable I.M.P. crew IDs');

    const extraCrew = createHelluvaBossSaveState(true);
    extraCrew.crewFatigue.hb_unstable_extra = 0;
    expectHelluvaStateRejected(extraCrew, 'exactly the four stable I.M.P. crew IDs');

    const fractionalFatigue = createHelluvaBossSaveState(true);
    fractionalFatigue.crewFatigue[HELLUVA_CREW_IDS[0]] = 12.5;
    expectHelluvaStateRejected(fractionalFatigue, 'crewFatigue.hb_blitzo must be a non-negative integer');

    const excessiveFatigue = createHelluvaBossSaveState(true);
    excessiveFatigue.crewFatigue[HELLUVA_CREW_IDS[0]] = 101;
    expectHelluvaStateRejected(excessiveFatigue, 'crewFatigue.hb_blitzo must be a non-negative integer');
  });

  it('derives campaignDay from completed contracts and requires integer funds and metrics', () => {
    const invalidDay = completeHelluvaContracts(1);
    invalidDay.campaignDay = 1;
    expectHelluvaStateRejected(invalidDay, 'campaignDay must equal completedContractIds.length + 1 (2)');

    for (const field of ['funds', 'heat', 'cohesion', 'discretion', 'reputation'] as const) {
      const state = createHelluvaBossSaveState(true);
      Object.assign(state, { [field]: 12.5 });
      expectHelluvaStateRejected(state, `${field} must be an integer`);
    }
  });
});

describe('Helluva Boss campaign durability', () => {
  it('preserves progress when the pack is disabled and after LocalDb reload', () => {
    const storage = new MemoryStorage();
    const database = new LocalDb(storage);

    expect(database.toggleHelluvaBossExtension(true)).toBe(true);
    expect(database.startHelluvaBossContract(HELLUVA_CONTRACTS[0].id)).toBe(true);
    expect(database.resolveHelluvaBossChoice('crew_briefing')).toBe(true);
    const beforeDisable = database.getFullState().extensions.helluvaBoss!;
    expect(beforeDisable.activeContractId).toBe(HELLUVA_CONTRACTS[0].id);
    expect(beforeDisable.activePhaseIndex).toBe(1);

    expect(database.toggleHelluvaBossExtension(false)).toBe(true);
    const reloaded = new LocalDb(storage).getFullState().extensions.helluvaBoss!;

    expect(reloaded.enabled).toBe(false);
    expect(reloaded.activeContractId).toBe(beforeDisable.activeContractId);
    expect(reloaded.activePhaseIndex).toBe(beforeDisable.activePhaseIndex);
    expect(reloaded.selectedChoiceIds).toEqual(beforeDisable.selectedChoiceIds);
    expect(reloaded.funds).toBe(beforeDisable.funds);
  });

  it('completes the 12 sequential contracts through exactly 36 phase choices', () => {
    let state = createHelluvaBossSaveState(true);
    let finalSummary = '';

    for (const [contractIndex, contract] of HELLUVA_CONTRACTS.entries()) {
      expect(getHelluvaContractStatus(state, contract)).toBe('available');
      state = startHelluvaContract(state, contract.id);

      for (const [phaseIndex, choiceId] of SAFE_HELLUVA_CHOICES.entries()) {
        expect(state.activePhaseIndex).toBe(phaseIndex);
        const result = resolveHelluvaChoice(state, choiceId);
        expect(result.contractCompleted).toBe(phaseIndex === 2);
        finalSummary = result.summary;
        state = result.state;
      }

      expect(state.completedContractIds).toEqual(
        HELLUVA_CONTRACTS.slice(0, contractIndex + 1).map(item => item.id)
      );
    }

    expect(state.status).toBe('victory');
    expect(state.activeContractId).toBeNull();
    expect(state.activePhaseIndex).toBe(0);
    expect(state.campaignDay).toBe(13);
    expect(state.completedContractIds).toHaveLength(12);
    expect(state.selectedChoiceIds).toHaveLength(36);
    expect(new Set(state.selectedChoiceIds).size).toBe(36);
    expect(state.funds).toBeGreaterThan(-500);
    expect(state.heat).toBeLessThan(100);
    expect(state.cohesion).toBeGreaterThan(0);
    expect(Math.max(...Object.values(state.crewFatigue))).toBeLessThan(100);
    expect(finalSummary).toContain('Cumulative metrics shaped the final extraction');
    expect(getHelluvaOutcome(state).title).toBe('Victory · Dysfunctional, Still a Family');
  });

  it.each([
    {
      route: 'maximum exposure',
      choices: ['wing_it', 'full_spectacle', 'calling_card'],
      outcome: 'Defeat · Exposed to the Living World',
      reached: (state: HelluvaBossSaveState) => state.heat >= 100
    },
    {
      route: 'crew breakdown',
      choices: ['wing_it', 'full_spectacle', 'erase_trail'],
      outcome: 'Defeat · Crew Split',
      reached: (state: HelluvaBossSaveState) => state.cohesion <= 0
    },
    {
      route: 'unsustainable spending',
      choices: ['verified_intel', 'precision_team', 'paid_recovery'],
      outcome: 'Defeat · Insolvent Office',
      reached: (state: HelluvaBossSaveState) => state.funds <= -500
    },
    {
      route: 'accumulated exhaustion',
      choices: ['verified_intel', 'silent_entry', 'erase_trail'],
      outcome: 'Defeat · Mandatory Recovery',
      reached: (state: HelluvaBossSaveState) => (
        Object.values(state.crewFatigue).reduce((total, fatigue) => total + fatigue, 0)
          / HELLUVA_CREW_IDS.length >= 100
      )
    }
  ])('reaches the $outcome ending through the normal $route choices', ({ choices, outcome, reached }) => {
    const state = followHelluvaPath(choices);

    expect(state.status).toBe('collapse');
    expect(state.completedContractIds.length).toBeLessThan(HELLUVA_CONTRACTS.length);
    expect(state.activeContractId).toBeNull();
    expect(state.selectedChoiceIds.length).toBeGreaterThan(0);
    expect(reached(state)).toBe(true);
    expect(getHelluvaOutcome(state).title).toBe(outcome);
  });

  it.each([
    ['crew breakdown', ['wing_it', 'full_spectacle', 'erase_trail']],
    ['unsustainable spending', ['verified_intel', 'precision_team', 'paid_recovery']],
    ['accumulated exhaustion', ['verified_intel', 'silent_entry', 'erase_trail']]
  ] as const)('persists and reloads a mid-contract collapse from %s', (_route, choices) => {
    const { database, storage } = followHelluvaPathInDatabase(choices);
    const collapsed = database.getFullState().extensions.helluvaBoss!;
    const partialChoiceCount = collapsed.selectedChoiceIds.length - (collapsed.completedContractIds.length * 3);

    expect(collapsed.status).toBe('collapse');
    expect(collapsed.activeContractId).toBeNull();
    expect(partialChoiceCount).toBeGreaterThanOrEqual(1);
    expect(partialChoiceCount).toBeLessThanOrEqual(2);

    const reloaded = new LocalDb(storage).getFullState().extensions.helluvaBoss!;
    expect(reloaded).toEqual(collapsed);
  });

  it('keeps Hazbin hotel data and inventory isolated from I.M.P. progression', () => {
    const storage = new MemoryStorage();
    const database = new LocalDb(storage);
    const beforeHotel = hotelStateOnly(database.getFullState());
    const beforeInventory = database.getInventory();

    expect(database.toggleHelluvaBossExtension(true)).toBe(true);
    for (const contract of HELLUVA_CONTRACTS) {
      expect(database.startHelluvaBossContract(contract.id)).toBe(true);
      expect(database.resolveHelluvaBossChoice('crew_briefing')).toBe(true);
      expect(database.resolveHelluvaBossChoice('silent_entry')).toBe(true);
      expect(database.resolveHelluvaBossChoice('paid_recovery')).toBe(true);
    }

    const after = database.getFullState();
    expect(after.extensions.helluvaBoss?.status).toBe('victory');
    expect(hotelStateOnly(after)).toEqual(beforeHotel);
    expect(database.getInventory()).toEqual(beforeInventory);
  });
});

describe('Helluva Boss static content integrity', () => {
  it('defines 28 isolated, uniquely mapped profiles and all nine phase approaches', () => {
    const profileIds = HELLUVA_CHARACTERS.map(profile => profile.id);
    const profileNames = HELLUVA_CHARACTERS.map(profile => profile.name);
    const portraitPaths = HELLUVA_CHARACTERS.map(profile => profile.portrait);
    const sheetNames = HELLUVA_SPRITE_SHEETS.flatMap(sheet => sheet.characters);
    const coreCharacterIds = new Set(getSeedData().characters.map(character => character.id));

    expect(HELLUVA_CHARACTERS).toHaveLength(28);
    expect(new Set(profileIds).size).toBe(28);
    expect(new Set(profileNames).size).toBe(28);
    expect(new Set(portraitPaths).size).toBe(28);
    expect(profileIds.every(id => id.startsWith('hb_'))).toBe(true);
    expect(profileIds.every(id => !coreCharacterIds.has(id))).toBe(true);
    expect(portraitPaths).toEqual(profileIds.map(id => `/assets/sprites/helluva/portraits/${id}.png`));
    expect(sheetNames).toEqual(profileNames);
    expect(HELLUVA_SPRITE_SHEETS.slice(-3)).toEqual([
      {
        id: 'helluva-origins',
        path: '/assets/sprites/helluva/sheets/helluva-origins.png',
        spoilerScope: 'season_2',
        characters: ['Paimon', 'Barbie Wire', 'Cash Buckzo', 'Wally Wackford']
      },
      {
        id: 'helluva-rivals',
        path: '/assets/sprites/helluva/sheets/helluva-rivals.png',
        spoilerScope: 'season_2',
        characters: ['Mammon', 'Chazwick Thurman', 'Glitz', 'Glam']
      },
      {
        id: 'helluva-celestial',
        path: '/assets/sprites/helluva/sheets/helluva-celestial.png',
        spoilerScope: 'season_2',
        characters: ['Cletus', 'Collin', 'Keenie', 'Vassago']
      }
    ]);
    expect(HELLUVA_CHARACTERS.filter(profile => profile.playable).map(profile => profile.id))
      .toEqual([...HELLUVA_CREW_IDS]);
    expect(profileIds).toEqual(expect.arrayContaining([
      'hb_paimon',
      'hb_barbie_wire',
      'hb_cash_buckzo',
      'hb_wally_wackford',
      'hb_mammon',
      'hb_chazwick_thurman',
      'hb_glitz',
      'hb_glam',
      'hb_cletus',
      'hb_collin',
      'hb_keenie',
      'hb_vassago'
    ]));

    expect(HELLUVA_APPROACHES).toHaveLength(9);
    for (const phaseIndex of [0, 1, 2]) {
      expect(HELLUVA_APPROACHES.filter(choice => choice.phaseIndex === phaseIndex)).toHaveLength(3);
    }
  });

  it('publishes seven 6x4 atlases and one transparent portrait per profile', () => {
    expect(HELLUVA_SPRITE_SHEETS).toHaveLength(7);
    for (const sheet of HELLUVA_SPRITE_SHEETS) {
      expect(sheet.characters).toHaveLength(4);
      expect(publishedAsset(sheet.path)).toEqual({
        width: 1536,
        height: 1024,
        colorType: 6
      });
    }

    for (const profile of HELLUVA_CHARACTERS) {
      expect(publishedAsset(profile.portrait)).toEqual({
        width: 512,
        height: 512,
        colorType: 6
      });
    }
  });

  it('keeps the contract chain complete, ordered and internally referential', () => {
    const profileIds = HELLUVA_CHARACTERS.map(profile => profile.id);
    const knownProfileIds = new Set(profileIds);
    const allFeaturedIds = HELLUVA_CONTRACTS.flatMap(contract => contract.featuredCharacterIds);

    expect(HELLUVA_CONTRACTS).toHaveLength(12);
    expect(new Set(HELLUVA_CONTRACTS.map(contract => contract.id)).size).toBe(12);
    for (const [index, contract] of HELLUVA_CONTRACTS.entries()) {
      expect(contract.order).toBe(index + 1);
      expect(contract.phaseBriefs).toHaveLength(3);
      expect(contract.prerequisiteId).toBe(index === 0 ? null : HELLUVA_CONTRACTS[index - 1].id);
      expect(contract.featuredCharacterIds.length).toBeGreaterThan(0);
      expect(new Set(contract.featuredCharacterIds).size).toBe(contract.featuredCharacterIds.length);
      expect(contract.featuredCharacterIds.every(characterId => knownProfileIds.has(characterId))).toBe(true);
    }

    expect([...new Set(allFeaturedIds)].sort()).toEqual([...profileIds].sort());
  });

  it('gives every contract and phase three unique narrative tactics with stable choice IDs', () => {
    const tacticIds = HELLUVA_CONTRACTS.flatMap(contract => contract.tactics.map(tactic => tactic.id));
    const allLabels: string[] = [];
    const allDescriptions: string[] = [];

    expect(tacticIds).toHaveLength(36);
    expect(new Set(tacticIds).size).toBe(36);

    for (const contract of HELLUVA_CONTRACTS) {
      expect(contract.tactics).toHaveLength(3);
      expect(new Set(contract.tactics.map(tactic => tactic.label)).size).toBe(3);
      expect(new Set(contract.tactics.map(tactic => tactic.description)).size).toBe(3);

      for (const phaseIndex of [0, 1, 2] as const) {
        const approaches = getHelluvaApproachesForContract(contract.id, phaseIndex);
        const stablePhaseIds = HELLUVA_APPROACHES
          .filter(approach => approach.phaseIndex === phaseIndex)
          .map(approach => approach.id);

        expect(approaches).toHaveLength(3);
        expect(approaches.map(approach => approach.id)).toEqual(stablePhaseIds);
        expect(new Set(approaches.map(approach => approach.label)).size).toBe(3);
        expect(new Set(approaches.map(approach => approach.description)).size).toBe(3);
        allLabels.push(...approaches.map(approach => approach.label));
        allDescriptions.push(...approaches.map(approach => approach.description));
      }
    }

    expect(allLabels).toHaveLength(108);
    expect(new Set(allLabels).size).toBe(108);
    expect(new Set(allDescriptions).size).toBe(108);
  });
});
