import { describe, expect, it } from 'vitest';
import { INFERNAL_COSTUMES } from '../lib/infernal-appearances';
import { STANDALONE_STAGES } from '../lib/pentagram-stages';
import { CONTENT_UNLOCK_RULES, contentAccessPresentation, evaluateUnlockCondition, getContentAccess, newlyEarnedContent } from '../standalone/content-access';
import { applyMatchResult, buildRun, createDefaultSave, exportSave, getRunEncounter, importSave, validateSave, type StandaloneSave } from '../standalone/progression';
import { STANDALONE_BOSS_IDS, STANDALONE_FIGHTER_IDS } from '../standalone/roster';

function profile() {
  const save = createDefaultSave();
  save.options.progressionEnabled = true;
  return save;
}
function win(save: StandaloneSave, id: string): StandaloneSave {
  return applyMatchResult(save, { id, mode: 'versus', fighterId: 'charlie', opponentId: 'hb_blitzo', outcome: 'won', playedAt: 100 });
}
function storyVictory(save: StandaloneSave, fighterId: string, routeVersion: 1 | 3): StandaloneSave {
  let current = { ...save, run: buildRun('story', fighterId, STANDALONE_FIGHTER_IDS, STANDALONE_BOSS_IDS, 1234, routeVersion) };
  for (let index = 0; index < 3; index++) {
    const encounter = getRunEncounter(current.run);
    current = applyMatchResult(current, { id: `${fighterId}-${routeVersion}-${index}`, mode: 'story', fighterId: encounter.fighterId, opponentId: encounter.opponentId, outcome: 'won', playedAt: 100 + index }) as typeof current;
  }
  return current;
}

describe('optional exhibition content progression', () => {
  it('gates only existing playable content and retains the old free-selection policy', () => {
    for (const rule of CONTENT_UNLOCK_RULES) {
      if (rule.category === 'fighter') expect(STANDALONE_FIGHTER_IDS).toContain(rule.contentId);
      if (rule.category === 'stage') expect(STANDALONE_STAGES.some(stage => stage.id === rule.contentId)).toBe(true);
      if (rule.category === 'costume') expect(INFERNAL_COSTUMES[rule.ownerId!].some(outfit => outfit.id === rule.contentId)).toBe(true);
      expect(getContentAccess(createDefaultSave(), rule.category, rule.contentId).selectable).toBe(true);
      expect(getContentAccess(profile(), rule.category, rule.contentId).selectable).toBe(false);
    }
    expect(new Set(CONTENT_UNLOCK_RULES.map(rule => rule.id)).size).toBe(CONTENT_UNLOCK_RULES.length);
  });

  it('awards once from real results, survives import and never counts dojo practice', () => {
    const before = profile();
    const training = applyMatchResult(before, { id: 'practice', mode: 'training', fighterId: 'charlie', opponentId: 'hb_blitzo', outcome: 'won', playedAt: 1 });
    expect(newlyEarnedContent(before, training)).toEqual([]);
    const after = win(before, 'first');
    expect(newlyEarnedContent(before, after).map(rule => rule.contentId)).toEqual(['hb_blitzo-bodyguard-looloo']);
    const restored = importSave(exportSave(after, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS);
    expect(getContentAccess(restored, 'costume', 'hb_blitzo-bodyguard-looloo').entitlement).toBe('permanent');
    expect(newlyEarnedContent(restored, win(restored, 'first'))).toEqual([]);
    expect(restored.options.progressionEnabled).toBe(true);
  });

  it('uses versioned story rewards OR cumulative wins without consuming either route', () => {
    const legacy = storyVictory(profile(), 'charlie', 1);
    expect(getContentAccess(legacy, 'fighter', 'lucifer').selectable).toBe(false);
    const current = storyVictory(profile(), 'charlie', 3);
    expect(getContentAccess(current, 'fighter', 'lucifer').entitlement).toBe('permanent');
    expect(getContentAccess(current, 'stage', 'hh-heaven-gates').selectable).toBe(true);
    expect(getContentAccess(current, 'fighter', 'hb_stolas').selectable).toBe(false);
    let alternative = profile();
    for (let index = 0; index < 10; index++) alternative = win(alternative, `alternative-${index}`);
    const reloaded = validateSave(alternative, STANDALONE_FIGHTER_IDS);
    expect(getContentAccess(reloaded, 'fighter', 'lucifer').selectable).toBe(true);
    expect(getContentAccess(reloaded, 'fighter', 'hb_stolas').selectable).toBe(true);
    expect(getContentAccess(reloaded, 'mode', 'boss-rush').selectable).toBe(false);
  });

  it('keeps acquisition independent from installed files, match compatibility and contextual loans', () => {
    const save = win(profile(), 'first');
    const costume = 'hb_blitzo-bodyguard-looloo';
    expect(getContentAccess(save, 'costume', costume, { technical: 'missing' })).toMatchObject({ entitlement: 'permanent', selectable: false, label: 'Installation nécessaire' });
    expect(getContentAccess(save, 'costume', costume, { compatible: false })).toMatchObject({ entitlement: 'permanent', selectable: false, label: 'Indisponible dans ce mode' });
    expect(getContentAccess(save, 'fighter', 'lucifer', { mode: 'training' })).toMatchObject({ entitlement: 'loan', selectable: true, earned: false });
    expect(getContentAccess(save, 'stage', 'goetia-court', { narrativeLoan: true })).toMatchObject({ entitlement: 'loan', selectable: true });
    expect(getContentAccess(save, 'fighter', 'lucifer')).toMatchObject({ entitlement: 'none', selectable: false });
    expect(getContentAccess(save, 'costume', 'hb_moxxie-bodyguard-looloo', { narrativeLoan: true }).selectable).toBe(false);
  });

  it('preserves wardrobe choices through policy changes and migrates old saves without new locks', () => {
    const save = profile();
    save.wardrobe = { one: { hb_blitzo: 'hb_blitzo-bodyguard-looloo' } };
    const imported = importSave(exportSave(save, STANDALONE_FIGHTER_IDS), STANDALONE_FIGHTER_IDS);
    expect(imported.wardrobe).toEqual(save.wardrobe);
    expect(getContentAccess(imported, 'costume', 'hb_blitzo-bodyguard-looloo').selectable).toBe(false);
    delete imported.options.progressionEnabled;
    const legacy = validateSave(imported, STANDALONE_FIGHTER_IDS);
    expect(legacy.options.progressionEnabled).toBe(false);
    expect(getContentAccess(legacy, 'costume', 'hb_blitzo-bodyguard-looloo').selectable).toBe(true);
    expect(() => validateSave({ ...save, options: { ...save.options, progressionEnabled: 'true' } }, STANDALONE_FIGHTER_IDS)).toThrow(/déblocage/);
  });

  it('evaluates nested AND / OR requirements and never awards an empty requirement group', () => {
    const condition = { kind: 'all', conditions: [
      { kind: 'wins', count: 1 },
      { kind: 'any', conditions: [{ kind: 'wins', count: 3 }, { kind: 'arcades', count: 1 }] },
    ] } as const;
    let save = win(profile(), 'one');
    expect(evaluateUnlockCondition(condition, save).fulfilled).toBe(false);
    save = win(win(save, 'two'), 'three');
    expect(evaluateUnlockCondition(condition, save).fulfilled).toBe(true);
    expect(evaluateUnlockCondition(condition, save).text).toContain(' ET ');
    expect(evaluateUnlockCondition(condition, save).text).toContain(' OU ');
    expect(evaluateUnlockCondition({ kind: 'all', conditions: [] }, save).fulfilled).toBe(false);
    expect(evaluateUnlockCondition({ kind: 'any', conditions: [] }, save).fulfilled).toBe(false);
  });

  it('has a neutral secret presentation that omits names, silhouettes and detailed hints', () => {
    const access = { ...getContentAccess(profile(), 'fighter', 'lucifer'), discovery: 'secret' as const };
    const presentation = contentAccessPresentation(access, 'Lucifer Morningstar');
    expect(presentation.showImage).toBe(false);
    expect(presentation.silhouette).toBe(false);
    expect(JSON.stringify(presentation)).not.toMatch(/Lucifer|Charlie|V3|10/);
  });
});
