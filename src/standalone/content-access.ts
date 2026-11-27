import type { StandaloneMode, StandaloneSave } from './progression';

/** Menu progression is an exhibition rule, not a claim about the series' canon. */
export type ContentCategory = 'fighter' | 'costume' | 'stage' | 'mode';
export type ContentDiscovery = 'identified' | 'silhouette' | 'secret';
export type UnlockCondition =
  | { kind: 'wins'; count: number }
  | { kind: 'arcades'; count: number }
  | { kind: 'story'; fighterId: string; routeVersion: 1 | 3; label: string }
  | { kind: 'all'; conditions: readonly UnlockCondition[] }
  | { kind: 'any'; conditions: readonly UnlockCondition[] };

export interface ContentUnlockRule {
  id: string;
  category: ContentCategory;
  contentId: string;
  ownerId?: string;
  discovery: ContentDiscovery;
  condition: UnlockCondition;
}

const charlieStory = { kind: 'story', fighterId: 'charlie', routeVersion: 3, label: 'Terminer la chronique de Charlie (édition actuelle)' } as const;
const blitzStory = { kind: 'story', fighterId: 'hb_blitzo', routeVersion: 3, label: 'Terminer la chronique de Blitzø (édition actuelle)' } as const;

/** Only installed, already playable content receives a progression rule. */
export const CONTENT_UNLOCK_RULES: readonly ContentUnlockRule[] = [
  { id: 'pact-lucifer-v1', category: 'fighter', contentId: 'lucifer', discovery: 'silhouette', condition: { kind: 'any', conditions: [charlieStory, { kind: 'wins', count: 10 }] } },
  { id: 'pact-stolas-v1', category: 'fighter', contentId: 'hb_stolas', discovery: 'silhouette', condition: { kind: 'any', conditions: [blitzStory, { kind: 'wins', count: 10 }] } },
  { id: 'pact-blitz-bodyguard-v1', category: 'costume', contentId: 'hb_blitzo-bodyguard-looloo', ownerId: 'hb_blitzo', discovery: 'silhouette', condition: { kind: 'wins', count: 1 } },
  { id: 'pact-moxxie-bodyguard-v1', category: 'costume', contentId: 'hb_moxxie-bodyguard-looloo', ownerId: 'hb_moxxie', discovery: 'silhouette', condition: { kind: 'wins', count: 3 } },
  { id: 'pact-heaven-gates-v1', category: 'stage', contentId: 'hh-heaven-gates', discovery: 'identified', condition: { kind: 'any', conditions: [charlieStory, { kind: 'wins', count: 5 }] } },
  { id: 'pact-goetia-court-v1', category: 'stage', contentId: 'goetia-court', discovery: 'identified', condition: { kind: 'any', conditions: [blitzStory, { kind: 'wins', count: 5 }] } },
  { id: 'pact-boss-rush-v1', category: 'mode', contentId: 'boss-rush', discovery: 'identified', condition: { kind: 'arcades', count: 1 } },
];

export interface ConditionProgress { fulfilled: boolean; text: string }

export function evaluateUnlockCondition(condition: UnlockCondition, save: StandaloneSave): ConditionProgress {
  if (condition.kind === 'all' || condition.kind === 'any') {
    const children = condition.conditions.map(child => evaluateUnlockCondition(child, save));
    return {
      // An empty group is a configuration error and never awards a reward.
      fulfilled: children.length > 0 && (condition.kind === 'all' ? children.every(child => child.fulfilled) : children.some(child => child.fulfilled)),
      text: children.map(child => `(${child.text})`).join(condition.kind === 'all' ? ' ET ' : ' OU '),
    };
  }
  if (condition.kind === 'story') {
    const fulfilled = save.storyCompletions.some(entry => entry.fighterId === condition.fighterId && entry.routeVersion === condition.routeVersion);
    return { fulfilled, text: `${condition.label} · ${fulfilled ? 'terminée' : 'à terminer'}` };
  }
  const current = condition.kind === 'wins' ? save.stats.wins : save.stats.completedArcades;
  return {
    fulfilled: current >= condition.count,
    text: condition.kind === 'wins'
      ? `Remporter ${condition.count} ${condition.count === 1 ? 'duel' : 'duels'} en J1 hors dojo · ${Math.min(current, condition.count)}/${condition.count}`
      : `Terminer ${condition.count} parcours Arcade · ${Math.min(current, condition.count)}/${condition.count}`,
  };
}

export interface ContentAccessContext {
  mode?: StandaloneMode;
  /** A chapter supplies its own actors and arena without awarding free selection. */
  narrativeLoan?: boolean;
  technical?: 'installed' | 'missing' | 'unavailable';
  compatible?: boolean;
}

export interface ContentAccess {
  category: ContentCategory;
  contentId: string;
  rule?: ContentUnlockRule;
  discovery: ContentDiscovery;
  entitlement: 'included' | 'permanent' | 'loan' | 'none';
  technical: 'installed' | 'missing' | 'unavailable';
  compatible: boolean;
  dependencyAvailable: boolean;
  earned: boolean;
  selectable: boolean;
  label: string;
  requirement: string;
}

/**
 * Four independent axes. External subscription rights are deliberately absent:
 * this offline profile cannot authenticate Patreon, payments or expiry events.
 * Earned rewards derive from monotonic, validated counters and versioned endings,
 * so imports/reloads and duplicate callbacks cannot duplicate or revoke awards.
 */
export function getContentAccess(save: StandaloneSave, category: ContentCategory, contentId: string, context: ContentAccessContext = {}): ContentAccess {
  const rule = CONTENT_UNLOCK_RULES.find(entry => entry.category === category && entry.contentId === contentId);
  const progress = rule ? evaluateUnlockCondition(rule.condition, save) : { fulfilled: true, text: 'Disponible dès le départ.' };
  const loan = context.mode === 'training' || (context.narrativeLoan === true && (category === 'fighter' || category === 'stage'));
  const entitlement = !rule || !save.options.progressionEnabled ? 'included' : progress.fulfilled ? 'permanent' : loan ? 'loan' : 'none';
  const technical = context.technical ?? 'installed';
  const compatible = context.compatible !== false;
  const dependencyAvailable = !rule?.ownerId || getContentAccess(save, 'fighter', rule.ownerId, context).selectable;
  const selectable = entitlement !== 'none' && technical === 'installed' && compatible && dependencyAvailable;
  const label = technical === 'missing' ? 'Installation nécessaire'
    : technical === 'unavailable' ? 'Temporairement indisponible'
    : !compatible ? 'Indisponible dans ce mode'
    : entitlement === 'none' ? 'À débloquer'
    : !dependencyAvailable ? 'Acquis — personnage à débloquer'
    : entitlement === 'permanent' ? 'Acquis'
    : entitlement === 'loan' ? 'Prêt pour cette partie' : 'Disponible';
  return {
    category, contentId, rule, discovery: entitlement === 'none' ? rule?.discovery ?? 'identified' : 'identified',
    entitlement, technical, compatible, dependencyAvailable, earned: progress.fulfilled, selectable,
    label, requirement: rule ? progress.text : '',
  };
}

/** Never place a secret's name, silhouette or detailed condition in aria/text. */
export function contentAccessPresentation(access: ContentAccess, name: string) {
  const secret = access.discovery === 'secret';
  return {
    name: secret ? 'Contenu non révélé' : name,
    showImage: !secret,
    silhouette: access.discovery === 'silhouette',
    requirement: secret ? 'Poursuivez vos chroniques et vos défis.' : access.requirement,
    description: `${secret ? 'Contenu non révélé' : name} — ${access.label}. ${secret ? 'Poursuivez vos chroniques et vos défis.' : access.requirement}`,
  };
}

export function newlyEarnedContent(previous: StandaloneSave, next: StandaloneSave): ContentUnlockRule[] {
  if (!next.options.progressionEnabled) return [];
  return CONTENT_UNLOCK_RULES.filter(rule => !evaluateUnlockCondition(rule.condition, previous).fulfilled && evaluateUnlockCondition(rule.condition, next).fulfilled);
}
