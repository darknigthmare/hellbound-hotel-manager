import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { newVariantRequirements } from './variant-requirements.mjs';

// Explicit --apply is required. Default execution prepares a reviewable JSON
// preview and never changes the current extension plan or historical books.
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const args = process.argv.slice(2);
const registerPath = args.includes('--register') ? path.resolve(args[args.indexOf('--register') + 1]) : path.join(here, 'delivery-register.json');
const planPath = path.join(repo, 'docs/standalone/extension-plan.json');
const read = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const plan = await read(planPath), register = await read(registerPath);
assert.equal(register.edition, 'V8');
assert.equal(register.fidelityOneToOneCertified, false);
const batchId = `static-v8-${register.date}`;
const registerRelative = path.relative(repo, registerPath);
const assets = new Map(register.assets.map(asset => [asset.id, asset]));
assert.equal(assets.size, register.assets.length, 'Duplicate delivered asset ID.');
const changed = { bases: [], qualifications: [], variants: [], existingVariants: [], addedVariants: [], stages: [], addedStages: [] };
function preserve(row) {
  if (row.coverageBeforeStaticV8) return;
  row.coverageBeforeStaticV8 = Object.fromEntries(['status', 'asset', 'continuity', 'currentStaticCoverage', 'staticProduction', 'runtimeStageId', 'runtimeStageIds'].filter(key => row[key] !== undefined).map(key => [key, structuredClone(row[key])]));
}
function production(asset, extra = {}) {
  return { batchId, assetId: asset.id, master: asset.master, export: asset.export,
    masterSha256: asset.masterSha256, exportSha256: asset.exportSha256,
    continuity: asset.continuity, incarnation: asset.incarnation,
    references: asset.referenceUrls, register: registerRelative,
    animationCycles: 0, fidelityOneToOneCertified: false, ...extra };
}
for (const asset of register.assets.filter(item => ['character_base', 'support_base', 'enemy_base'].includes(item.category))) {
  assert(asset.accepted, `Unaccepted base: ${asset.id}`);
  for (const id of new Set([asset.sourceIdentityId, ...(asset.sourceIdentityIds ?? [])].filter(Boolean))) {
    const row = plan.roster.find(item => item.id === id);
    assert(row, `Unknown planned identity: ${id}`);
    preserve(row); row.asset = asset.export;
    row.staticProduction = production(asset, { runtimeStatus: 'reserve', runtimePlayable: false });
    changed.bases.push(id);
  }
}
for (const candidate of register.candidateStates ?? []) {
  const id = candidate.sourceIdentityId ?? candidate.id;
  const row = plan.roster.find(item => item.id === id);
  assert(row, `Unknown qualification identity: ${id}`);
  row.qualificationV8 = { status: candidate.status, notes: candidate.notes, references: candidate.referenceUrls ?? [], register: registerRelative };
  if (candidate.continuity && candidate.continuity !== row.continuity) { preserve(row); row.continuity = candidate.continuity; }
  changed.qualifications.push(id);
}
for (const variant of register.variantStates ?? []) {
  const row = plan.variants.find(item => item.id === variant.id);
  assert(row, `Unknown planned variant: ${variant.id}`);
  row.qualificationV8 = { status: variant.status, notes: variant.notes, references: variant.referenceUrls ?? [], register: registerRelative };
  if (!variant.assetId) continue;
  const asset = assets.get(variant.assetId);
  assert(asset?.accepted, `Variant must name an accepted delivered asset: ${variant.id}`);
  preserve(row); row.status = 'Partiel'; row.currentStaticCoverage = variant.notes;
  row.staticProduction = production(asset, { coverage: asset.frameCoverage === 'bust' ? 'narrative_bust_only' : asset.variantCoverage ?? 'one_static_incarnation', frameCoverage: asset.frameCoverage, runtimePlayable: false });
  changed.variants.push(variant.id);
}
const reconciliationPath = path.join(here, 'existing-variant-reconciliation.json');
try {
  const reconciliation = await read(reconciliationPath);
  assert.equal(reconciliation.status, 'verified_existing_variant_mapping');
  for (const existing of reconciliation.variants) {
    const row = plan.variants.find(item => item.id === existing.requirementId);
    assert(row, `Unknown reconciled requirement: ${existing.requirementId}`);
    assert(!changed.variants.includes(row.id), `Existing and new delivery mapping overlap: ${row.id}`);
    preserve(row); row.status = existing.proposedStatus; row.asset = existing.currentExport;
    row.currentStaticCoverage = existing.notes;
    row.qualificationV8 = { status: 'existing_delivery_reconciled', notes: existing.notes, references: existing.referenceUrls, register: 'docs/standalone/production-v8/existing-variant-reconciliation.json' };
    row.staticProduction = {
      batchId: `historical-${existing.historicalDeliveryEdition}`, assetId: existing.assetId,
      export: existing.currentExport, exportSha256: existing.files.find(file => file.path === existing.currentExport)?.sha256,
      historicalDeliveryEdition: existing.historicalDeliveryEdition,
      runtimeStatus: existing.runtime, runtimeSelectable: existing.runtimeSelectable,
      distinctPoseFiles: existing.distinctPoseFiles, staticReadyOnly: existing.staticReadyOnly,
      register: existing.sourceRegister, reconciliation: 'docs/standalone/production-v8/existing-variant-reconciliation.json',
      references: existing.referenceUrls, newDrawings: 0, animationCycles: 0, fidelityOneToOneCertified: false,
    };
    changed.existingVariants.push(row.id);
  }
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const addedVariants = newVariantRequirements(register);
for (const variant of addedVariants) {
  const asset = assets.get(variant.assetId);
  assert(plan.roster.some(item => item.id === variant.sourceIdentityId), `Unknown costume identity: ${variant.sourceIdentityId}`);
  let row = plan.variants.find(item => item.id === variant.id);
  if (row) {
    assert.equal(row.staticProduction?.assetId, variant.assetId, `Variant ID collision: ${variant.id}`);
    preserve(row);
  } else { row = { id: variant.id, createdByStaticV8: true }; plan.variants.push(row); }
  Object.assign(row, {
    fighter: variant.sourceIdentityId, name: variant.name, franchise: variant.franchise,
    continuity: variant.continuity, type: variant.type, reference: variant.referenceUrls.join(' ; '),
    requirements: variant.requirements, canonEvidence: 'Références et écarts documentés dans le registre V8 ; fidélité 1:1 non certifiée.',
    status: 'Partiel', priority: 'P2', lot: 'V3', source: 'SRC-DESIGN', asset: asset.export,
    acceptance: variant.runtimeSelectable ? 'Pose statique sélectionnable ; autres poses, cycles et transitions restent un périmètre distinct. Contrôle en jeu selon le rapport QA.' : 'Archive ou forme statique documentée en galerie uniquement ; aucune aptitude au combat ni transition jouable déduite.',
    currentStaticCoverage: variant.notes,
    qualificationV8: { status: 'accepted_static_variant', notes: variant.notes, references: variant.referenceUrls, register: registerRelative },
    staticProduction: production(asset, { coverage: 'one_static_incarnation', frameCoverage: asset.frameCoverage,
      runtimeStatus: variant.runtimeSelectable ? 'selectable_static_costume' : 'reserve_gallery',
      runtimeSelectable: variant.runtimeSelectable, gameplayEligibility: variant.eligibility,
      runtimePlayable: false, staticReadyOnly: true, newIdentity: false }),
  });
  changed.addedVariants.push(row.id);
}
const blitzVariants = addedVariants.filter(variant => variant.sourceIdentityId === 'hb_blitzo');
if (blitzVariants.length) {
  const umbrella = plan.variants.find(item => item.id === 'VAR-017');
  assert(umbrella, 'Missing Blitzø disguise umbrella requirement.');
  preserve(umbrella); umbrella.status = 'Partiel';
  umbrella.currentStaticCoverage = 'Tenues documentées individuellement dans les exigences V8 liées. Collection de déguisements encore ouverte ; aucun dessin supplémentaire compté pour cette fiche agrégée.';
  umbrella.qualificationV8 = { status: 'partial_collection_with_individual_requirements',
    variantRequirementIds: blitzVariants.map(variant => variant.id),
    notes: umbrella.currentStaticCoverage, register: registerRelative, newDrawings: 0 };
}
// Two reference-backed locations can be added explicitly by the V8 register.
// They are separate requirements, never aliases for the Ozzie's interior.
const stageAdditions = {
  'ozzies-exterior-s1': {
    id: 'ozzies-exterior-s1', name: 'Ozzie’s — extérieur et rue de Lust',
    franchise: 'Helluva Boss', place: 'Lust — rue extérieure', continuity: 'season_1',
    priority: 'P2', lot: 'V3', source: 'SRC-DESIGN',
    requiredBackdropId: 'ozzies-exterior-s1-room',
    primaryReference: 'https://backgroundart.net/art/helluva07.jpg',
    design: 'Façade extérieure en cœur et rue nocturne documentées. Premier plan élargi horizontalement pour le combat ; cordon de file d’attente séparé.',
    registryNote: 'Nouvelle exigence extérieure distincte de ozzies / ozzies-cabaret, qui désigne la salle intérieure existante.',
  },
  'hellhound-adoption-s2': {
    id: 'hellhound-adoption-s2', name: 'Refuge Hellhound — couloir d’adoption',
    franchise: 'Helluva Boss', place: 'Refuge d’adoption — couloir', continuity: 'season_2',
    priority: 'P2', lot: 'V3', source: 'SRC-DESIGN',
    requiredBackdropId: 'hellhound-adoption-s2-room',
    primaryReference: 'https://backgroundart.net/art/helluva03.jpg',
    design: 'Couloir de cages et éclairage cyan documentés. Sol élargi pour le combat ; enseigne et dossier proche séparés du fond.',
    registryNote: 'Nouvelle exigence de lieu, rattachée uniquement au couloir du refuge documenté.',
  },
};
// Every update or addition still requires explicit delivery IDs and runtime IDs
// in stageReconciliation; matching a similar name does not create coverage.
for (const stage of register.stageReconciliation ?? []) {
  assert(stage.currentStaticCoverage && Array.isArray(stage.assetIds));
  for (const id of stage.assetIds) assert(assets.get(id)?.accepted, `Stage mapping names an undelivered asset: ${id}`);
  let row = plan.stages.find(item => item.id === stage.planId);
  if (!row) {
    const template = stageAdditions[stage.planId];
    assert(template, `Unknown stage requirement: ${stage.planId}`);
    assert.deepEqual(stage.runtimeStageIds, [stage.planId], 'New location must name its own runtime stage explicitly.');
    assert(stage.assetIds.includes(template.requiredBackdropId), `Missing documented backdrop for ${stage.planId}`);
    assert(stage.referenceUrls?.includes(template.primaryReference), `Missing production-art reference for ${stage.planId}`);
    const fields = Object.fromEntries(Object.entries(template).filter(([key]) => !['requiredBackdropId', 'primaryReference'].includes(key)));
    row = { ...fields, status: 'Partiel', runtimeId: stage.planId, runtimeStageId: stage.planId,
      reference: stage.referenceUrls.join(' ; '), createdByStaticV8: true,
      acceptance: 'Décor et calques enregistrés ; recadrage, appuis, parallaxe, lisibilité en duel et performance mobile à valider selon le rapport QA. Fidélité 1:1 non certifiée.' };
    plan.stages.push(row); changed.addedStages.push(row.id);
  } else preserve(row);
  row.status = 'Partiel'; row.currentStaticCoverage = stage.currentStaticCoverage;
  if (stage.runtimeStageIds) row.runtimeStageIds = stage.runtimeStageIds;
  const backdrop = stage.assetIds.map(id => assets.get(id)).find(asset => ['stage', 'stage_background'].includes(asset.category));
  if (backdrop) row.asset = backdrop.export;
  row.staticProduction = { batchId, assetIds: stage.assetIds, runtimeStageIds: stage.runtimeStageIds ?? [], register: registerRelative, references: stage.referenceUrls ?? [], animationCycles: 0, fidelityOneToOneCertified: false };
  changed.stages.push(row.id);
}
const current = register.cumulativeCounts;
if (plan.meta.currentRuntime.batchId !== batchId) {
  plan.meta.runtimeHistory ??= [];
  if (!plan.meta.runtimeHistory.some(item => item.batchId === plan.meta.currentRuntime.batchId)) plan.meta.runtimeHistory.push(structuredClone(plan.meta.currentRuntime));
}
plan.meta.currentRuntime = { ...plan.meta.currentRuntime, ...(register.runtimeSummary ?? {}),
  date: register.date, batchId, baseCommit: register.baselineCommit,
  fighters: current.activeFighters, stages: current.activeStages,
  reserveGalleryDrawings: current.reserveGalleryEntries, costumeFamilies: current.runtimeCostumeFamilies,
  illustrationAssignmentsV3: current.illustratedPersonalScenes, globalIllustrationAssignments: current.illustratedGlobalScenes,
  productionRegister: registerRelative,
  note: 'V8 actualise la production statique et les rapprochements de livraisons historiques. Les kits, techniques, cycles animés et contrôles visuels restent des périmètres distincts. Fidélité 1:1 non certifiée.',
};
plan.meta.latestStaticDelivery = { date: register.date, batchId, baseCommit: register.baselineCommit,
  branch: register.branch, prNumber: register.prNumber, register: registerRelative, status: register.status,
  counts: register.counts, scope: 'Dessins statiques, intégration et rapprochements documentés dans le registre V8. Aucun nouveau cycle animé.' };
plan.meta.latestProductionBible = { edition: 'V8', date: register.date,
  workbook: 'docs/standalone/INFERNAL_VERSUS_BIBLE_V8.xlsx', previousWorkbook: 'docs/standalone/INFERNAL_VERSUS_BIBLE_V7.xlsx',
  historicalSheetsPreserved: 46, appendedSheets: 2, register: registerRelative };
const output = args.includes('--apply') ? planPath : path.join(here, 'extension-plan-preview.json');
await fs.writeFile(output, JSON.stringify(plan, null, 2) + '\n');
console.log(JSON.stringify({ status: args.includes('--apply') ? 'extension_plan_updated' : 'preview_only', output, changed }, null, 2));
