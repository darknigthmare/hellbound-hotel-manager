import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const planPath = path.join(root, 'docs/standalone/extension-plan.json');
const plan = JSON.parse(await fs.readFile(planPath, 'utf8'));
const register = JSON.parse(await fs.readFile(path.join(here, 'delivery-register.json'), 'utf8'));
const environmentAudit = JSON.parse(await fs.readFile(path.join(here, 'environment-audit.json'), 'utf8'));
const batchId = 'static-v7-2026-11-26';
const registerPath = 'docs/standalone/production-v7/delivery-register.json';

// The original design proposals remain proposals. Attach the verifiable static
// delivery without treating a drawing as a new playable kit or animation.
for (const asset of register.assets.filter(asset => ['character_base', 'support_base', 'enemy_base'].includes(asset.category))) {
  for (const id of [asset.sourceIdentityId, ...(asset.sourceIdentityIds ?? [])].filter(Boolean)) {
    const row = plan.roster.find(candidate => candidate.id === id);
    assert(row, 'Unknown planned identity: ' + id);
    if (!row.assetBeforeStaticV7) row.assetBeforeStaticV7 = row.asset;
    row.asset = asset.export;
    row.staticProduction = {
      batchId, assetId: asset.id, master: asset.master, export: asset.export,
      masterSha256: asset.masterSha256, exportSha256: asset.exportSha256,
      continuity: asset.continuity, incarnation: asset.incarnation,
      runtimeStatus: 'reserve', runtimePlayable: false, animationCycles: 0,
      references: asset.referenceUrls, register: registerPath,
      fidelityOneToOneCertified: false,
    };
  }
}
for (const candidate of register.candidateStates) {
  const row = plan.roster.find(item => item.id === candidate.sourceIdentityId);
  assert(row, 'Unknown qualification identity: ' + candidate.sourceIdentityId);
  row.qualificationV7 = { status: candidate.status, notes: candidate.notes, references: candidate.referenceUrls, register: registerPath };
  if (candidate.continuity && row.continuity !== candidate.continuity) {
    if (!row.continuityBeforeStaticV7) row.continuityBeforeStaticV7 = row.continuity;
    row.continuity = candidate.continuity;
  }
}
for (const variant of register.variantStates) {
  const row = plan.variants.find(candidate => candidate.id === variant.id);
  assert(row, 'Unknown planned variant: ' + variant.id);
  row.qualificationV7 = { status: variant.status, notes: variant.notes, references: variant.referenceUrls ?? [], register: registerPath };
  if (!variant.assetId) continue;
  const asset = register.assets.find(candidate => candidate.id === variant.assetId);
  row.status = 'Partiel';
  row.currentStaticCoverage = variant.notes;
  row.staticProduction = { batchId, assetId: asset.id, master: asset.master, export: asset.export,
    coverage: asset.frameCoverage === 'bust' ? 'narrative_bust_only' : asset.variantCoverage ?? 'one_static_incarnation',
    ...(asset.frameCoverage ? { frameCoverage: asset.frameCoverage } : {}), references: asset.referenceUrls,
    register: registerPath, animationCycles: 0, runtimePlayable: false, fidelityOneToOneCertified: false };
}

const icePalace = environmentAudit.planReconciliation.find(row => row.id === 'hb-ice-palace');
if (icePalace) {
  const row = plan.stages.find(stage => stage.id === icePalace.id);
  assert(row);
  if (!row.coverageBeforeStaticV7) row.coverageBeforeStaticV7 = { reference: row.reference, asset: row.asset, status: row.status };
  row.status = 'Partiel';
  row.asset = 'public/assets/stages/helluva/sinsmas-frozen-pavilion/room.webp';
  row.runtimeStageIds = icePalace.runtimeStageIds;
  row.currentStaticCoverage = icePalace.notes;
  row.qualificationV7 = { status: icePalace.status, notes: icePalace.notes, references: icePalace.referenceUrls, register: registerPath };
  row.staticProduction = { batchId, assetIds: icePalace.coveredAssetIds, inheritedStageEdition: 'V5',
    coverage: 'existing_pavilion_and_single_headed_construction', remainingTargetIds: icePalace.remainingTargetIds,
    register: registerPath, animationCycles: 0, fidelityOneToOneCertified: false };
}

const newStages = register.assets.filter(asset => asset.category === 'stage');
const sloth = newStages.find(asset => asset.runtimeStageId === 'sloth-hospital-exterior');
if (sloth) {
  const row = plan.stages.find(stage => stage.id === 'sloth-hospital');
  assert(row);
  if (!row.coverageBeforeStaticV7) row.coverageBeforeStaticV7 = { reference: row.reference, asset: row.asset, currentStaticCoverage: row.currentStaticCoverage };
  row.status = 'Partiel';
  row.reference = 'Western Energy S2E4 : intérieur V5 conservé ; façade et parvis V7 dans une arène séparée. Sources et adaptations dans le registre V7.';
  row.currentStaticCoverage = 'Salle d’attente V5 et façade/parvis V7 livrés séparément. V7 : fond, banc et lampadaire indépendants. Vérification navigateur et performances mobiles non exécutées.';
  row.runtimeStageIds = ['sloth-hospital', 'sloth-hospital-exterior'];
  row.staticProduction = { batchId, assetIds: register.assets.filter(asset => asset.runtimeStageId === 'sloth-hospital-exterior').map(asset => asset.id), register: registerPath, references: sloth.referenceUrls, fidelityOneToOneCertified: false };
}
for (const asset of newStages.filter(stage => stage.continuity === 'season_3')) {
  const stageRequirements = {
    'australia-desert-s3': { planId: 'hb-australia', coverage: 'Une arène statique du désert australien S3, fond et deux objets indépendants. Composition adaptée au combat ; contrôle navigateur et performances mobiles restent à vérifier.' },
    'auction-glass-hall-s3': { planId: 'hb-auction', coverage: 'Une vue du hall vitré de la séquence des enchères S3 : fond, banc et ornement cyan indépendants. La salle de vente complète et les autres espaces ne sont pas livrés. Composition adaptée au combat ; contrôle navigateur et performances mobiles restent à vérifier.' },
  };
  const requirement = stageRequirements[asset.runtimeStageId];
  assert(requirement, 'Unknown S3 planned stage: ' + asset.runtimeStageId);
  const row = plan.stages.find(stage => stage.id === requirement.planId);
  assert(row, 'Missing planned S3 stage: ' + requirement.planId);
  if (!row.coverageBeforeStaticV7) row.coverageBeforeStaticV7 = { reference: row.reference, asset: row.asset, status: row.status };
  row.status = 'Partiel';
  row.asset = asset.export;
  row.runtimeStageId = asset.runtimeStageId;
  row.continuity = 'season_3';
  row.currentStaticCoverage = requirement.coverage;
  row.reference = asset.referenceUrls.join(' ; ');
  row.staticProduction = { batchId, assetIds: register.assets.filter(candidate => candidate.runtimeStageId === asset.runtimeStageId).map(candidate => candidate.id), register: registerPath, fidelityOneToOneCertified: false };
}

plan.meta.latestStaticDelivery = { date: '2026-11-26', batchId, baseCommit: register.baselineCommit,
  branch: register.branch, prNumber: register.prNumber, register: registerPath,
  status: register.status, counts: register.counts,
  scope: 'Productions statiques séparées, correction Apple et arènes intégrées. Aucun cycle animé ni nouveau kit jouable. Références, refus et limites tracés dans la bible V7.' };
plan.meta.latestProductionBible = { edition: 'V7', date: '2026-11-26',
  workbook: 'docs/standalone/INFERNAL_VERSUS_BIBLE_V7.xlsx',
  previousWorkbook: 'docs/standalone/INFERNAL_VERSUS_BIBLE_V6.xlsx',
  historicalSheetsPreserved: 43, appendedSheets: 3, register: registerPath };
await fs.writeFile(planPath, JSON.stringify(plan, null, 2) + '\n');
console.log(JSON.stringify({ identities: register.assets.filter(asset => asset.category.endsWith('_base')).length, variants: register.variantStates.filter(variant => variant.assetId).length, stages: newStages.length }));
