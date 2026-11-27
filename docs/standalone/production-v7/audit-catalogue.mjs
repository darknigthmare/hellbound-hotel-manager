import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// This is the immutable starting inventory, not a list of newly delivered work.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const baselineCommit = 'b0e76e35edfda695ec788bce67823073980d9217';
const sourceFiles = [];
function readBaseline(file) {
  const bytes = execFileSync('git', ['show', `${baselineCommit}:${file}`], { cwd: root, maxBuffer: 8 * 1024 * 1024 });
  sourceFiles.push({ path: file, commit: baselineCommit, sha256: createHash('sha256').update(bytes).digest('hex') });
  return JSON.parse(bytes);
}
const v5 = readBaseline('docs/standalone/production-static-v5.json');
const v6 = readBaseline('docs/standalone/production-v6/delivery-register.json');
const previousAudit = readBaseline('docs/standalone/production-v6/qualification-audit.json');
const runtime = readBaseline('docs/standalone/production-v6/active-asset-coverage.json');
const plan = readBaseline('docs/standalone/extension-plan.json');
const reserve = readBaseline('art/infernal-versus/production/reserve-assets.json');
const v6Bases = new Map(v6.assets.filter(asset => asset.sourceIdentityId).map(asset => [asset.sourceIdentityId, asset]));
const v6States = new Map(v6.candidateStates.map(candidate => [candidate.sourceIdentityId, candidate]));
const identities = v5.identities.map(identity => {
  const addition = v6Bases.get(identity.id), recent = v6States.get(identity.id);
  const available = Boolean(identity.baseAvailable || addition);
  let status = available ? 'base_available' : identity.qualificationStatus ?? 'primary_scene_required';
  let note = available ? 'Base autonome présente au terme de V6.' : identity.qualificationReason ?? identity.nextAction;
  if (!available && (identity.historicalRefusals.length || recent?.status === 'generator_refused')) {
    status = 'historical_refusal_no_retry';
    note = 'Refus de génération enregistré dans une édition précédente. Aucun nouvel essai de la même demande.';
  }
  if (identity.id === 'lute') {
    status = 'incarnation_definition_required_existing_pre_injury_base';
    note = 'La tenue pré-blessure possède déjà public/assets/sprites/individual/lute-ready.webp. Le compte historique distingue la base par défaut de ce costume. Définir une incarnation différente avant une nouvelle commande.';
  }
  return {
    id: identity.id, name: identity.name, franchise: identity.franchise,
    productionIdentityId: identity.productionIdentityId,
    canonClaimInPlan: identity.canonClaimInPlan, continuityInPlan: identity.continuityInPlan,
    plannedRole: identity.plannedRole,
    baseAvailable: available,
    currentBasePath: addition?.export ?? identity.currentBasePath,
    currentRuntimePlayable: identity.currentRuntimePlayable,
    qualificationStatus: status, qualificationReason: note,
    historicalRefusals: [...identity.historicalRefusals, ...(recent?.status === 'generator_refused' ? [identity.id + '-ready (V6)'] : [])],
    historicalPortraitPaths: identity.historicalPortraits.map(portrait => portrait.path),
    referenceScope: 'Qualification documentaire historique ; les déclarations canoniques du plan ne sont pas revérifiées par ce script.',
    source: identity.source,
  };
});
const missing = identities.filter(identity => !identity.baseAvailable);
const variants = v5.variants.map(variant => ({
  id: variant.id, fighter: variant.fighter, name: variant.name, type: variant.type,
  reference: variant.reference, currentState: variant.currentState,
  currentExport: variant.currentExport, auditNote: variant.auditNote,
  requirements: variant.requirements,
  productionScope: 'Une incarnation statique séparée uniquement. Animations, transitions et comportements restent hors de cette continuation.',
}));
const redeemed = variants.find(variant => variant.id === 'VAR-010');
redeemed.auditNote += ' Au commit b0e76e35, aucun chemin redeemed/Pentious-costume ni entrée INFERNAL_COSTUMES.sirpentious. Une livraison plus ancienne mentionnée dans le contexte doit être recherchée avant toute régénération.';
redeemed.currentState = 'historical_delivery_to_locate_before_generation';
const grouped = (rows, key) => rows.reduce((result, row) => { result[row[key] ?? 'unknown'] = (result[row[key] ?? 'unknown'] ?? 0) + 1; return result; }, {});
const counts = {
  ...v6.cumulativeCounts,
  missingByFranchise: grouped(missing, 'franchise'),
  missingByQualification: grouped(missing, 'qualificationStatus'),
  variants: variants.length,
  variantsByState: grouped(variants, 'currentState'),
  registeredRuntimeAssetPaths: runtime.summary.referencedAssets,
  missingRegisteredRuntimeAssetPaths: runtime.summary.brokenReferences.length,
};
assert.equal(identities.length, counts.catalogueIds);
assert.equal(identities.filter(identity => identity.baseAvailable).length, counts.standaloneBases);
assert.equal(missing.length, counts.catalogueIdsWithoutStandaloneBase);
assert.equal(new Set(missing.map(identity => identity.productionIdentityId)).size, counts.distinctProductionIdentitiesWithoutStandaloneBase);
assert.equal(reserve.assets.length, counts.reserveGalleryEntries);
const audit = {
  schemaVersion: 1, edition: 'V7', date: '2026-11-26', status: 'immutable_preproduction_inventory', baselineCommit,
  scope: 'Tous les IDs du catalogue, variantes et arènes planifiées, rapprochés des livraisons V5 et V6. Aucun dessin ajouté par cet audit.',
  counts, identities, candidates: missing, variants,
  stageReconciliation: previousAudit.stageReconciliation,
  plannedStages: plan.stages,
  runtimeStages: runtime.stages,
  technicalDeferrals: previousAudit.technicalDeferrals.map(item => ({ ...item, currentDelivery: v6.assets.find(asset => asset.id === item.id) ?? null })),
  remainingFromV6: v6.remaining,
  sharedAliases: previousAudit.sharedAliases,
  identitiesToKeepDistinct: previousAudit.identitiesToKeepDistinct,
  sourceFiles,
  limits: [
    'Les 209 IDs incluent individus, groupes, incarnations pilote, AU et entrées futures. Ils ne correspondent pas à 209 personnes canoniques distinctes.',
    'La présence d’un portrait historique ne garantit ni une référence officielle ni une silhouette complète.',
    'L’état « À produire » d’un ancien plan ne remplace pas le contrôle des fichiers actuels et de leur incarnation.',
    'Aucun nouveau cycle d’animation, kit combattant, mécanisme de projectile ou certification 1:1 n’est déduit de ce rapprochement.',
    'Les compteurs de bases respectent le contrat historique V6. Lute pré-blessure reste explicitement signalée comme costume déjà produit.',
  ],
};
const destination = path.join(root, 'docs/standalone/production-v7');
fs.mkdirSync(destination, { recursive: true });
fs.writeFileSync(path.join(destination, 'catalogue-audit.json'), JSON.stringify(audit, null, 2) + '\n');
const row = cells => '| ' + cells.map(cell => String(cell ?? '').replace(/\|/g, '/').replace(/\n/g, ' ')).join(' | ') + ' |';
const markdown = [
  '# Infernal Versus — inventaire de départ V7', '',
  '**26 novembre 2026.** Instantané du commit `b0e76e35edfda695ec788bce67823073980d9217`, avant les nouvelles productions V7.', '',
  '83 bases autonomes explicites, 37 arènes, 49 éléments de réserve et 43 combattants. 126 IDs restent sans base autonome, soit 125 identités après l’alias Travis connu. Aucun dessin n’est ajouté par cet inventaire.', '',
  'Le catalogue comprend des groupes, des incarnations du pilote, des éléments AU et des entrées futures. Les déclarations canoniques héritées sont des données à contrôler, pas des faits nouvellement certifiés.', '',
  '## Identités sans base autonome', '',
  row(['ID', 'Nom', 'Portée du plan', 'Qualification actuelle']), row(['---', '---', '---', '---']),
  ...missing.map(identity => row([identity.id, identity.name, identity.continuityInPlan, `${identity.qualificationStatus}. ${identity.qualificationReason}`])), '',
  '## Variantes statiques', '',
  'Les exigences d’animation historiques restent hors du périmètre courant. Une variante déjà disponible ne doit pas être régénérée sous un autre intitulé.', '',
  row(['ID', 'Personnage / variante', 'État actuel', 'Référence / action']), row(['---', '---', '---', '---']),
  ...variants.map(variant => row([variant.id, `${variant.fighter} — ${variant.name}`, variant.currentState, `${variant.reference}. ${variant.auditNote}`])), '',
  '## Arènes et objets techniques', '',
  `Le runtime V6 contient ${runtime.stages.length} arènes. Les vues existantes sont détaillées dans catalogue-audit.json#runtimeStages. Les alias I.M.P./imp-reception, Ozzie’s/ozzies-cabaret et plage/spring-broken-beach restent réconciliés. Le bureau de Vox ne couvre qu’une pièce de la tour ; l’accueil de Sloth ne couvre pas la façade ou la cour.`, '',
  `Lacunes techniques V6 : ${v6.remaining.technicalReferenceGaps.join(', ')}. Lacunes de décor : ${v6.remaining.stageReferenceGaps.join(', ')}. Les deux scènes personnelles refusées restent sans relance : ${v6.remaining.personalIllustrations.join(', ')}.`, '',
  'Les sources complètes, leurs empreintes, les 209 lignes et les 37 variantes sont conservées dans catalogue-audit.json. Reproduction : `node docs/standalone/production-v7/audit-catalogue.mjs`.', '',
];
fs.writeFileSync(path.join(destination, 'catalogue-audit.md'), markdown.join('\n'));
console.log(JSON.stringify({ status: audit.status, counts }, null, 2));
