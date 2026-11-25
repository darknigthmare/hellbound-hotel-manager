import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire, registerHooks } from 'node:module';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

// Run with the primary document runtime, from an isolated temporary directory.
// --prepare validates source data and writes a draft snapshot without a workbook.
// --final writes the approved V5 addition after production has been frozen.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const workspace = path.dirname(root);
const args = process.argv.slice(2);
const arg = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const isFinal = args.includes('--final');
const outputDir = path.resolve(arg('--output', path.join(workspace, 'outputs/infernal-static-v5')));
const auditPath = path.resolve(arg('--audit', path.join(here, 'production-v5-audit.json')));
const deliveryPath = path.resolve(arg('--delivery', path.join(here, 'production-v5-register.json')));
const supplementPath = arg('--supplement', null);
const runtimeNode = process.env.CODEX_PRIMARY_RUNTIME_NODE;
assert(runtimeNode && path.resolve(process.execPath) === path.resolve(runtimeNode), 'Run with CODEX_PRIMARY_RUNTIME_NODE.');
assert(args.includes('--prepare') || isFinal, 'Choose --prepare or --final. Final counts must come from a frozen production register.');
const require = createRequire(import.meta.url);
const artifactPath = require.resolve('@oai/artifact-tool', { paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES] });
const { Workbook, SpreadsheetFile, FileBlob } = await import(pathToFileURL(artifactPath).href);
await fs.mkdir(outputDir, { recursive: true });
const read = async filename => JSON.parse(await fs.readFile(filename, 'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceProof = async filename => ({ path: path.relative(root, filename), sha256: digest(await fs.readFile(filename)) });
const audit = await read(auditPath);
const delivery = await read(deliveryPath);
const supplement = supplementPath ? await read(path.resolve(supplementPath)) : { requirements: [], notes: [] };
const campaign = await read(path.join(here, 'campaign-design-v3.json'));
const guide = await read(path.join(here, 'guide-integration-v4.json'));
const runtimeQA = await read(path.join(here, 'QA_RUNTIME_STATIC_V5_2026-11-25.json'));
const filteredQA = await read(path.join(here, 'QA_FILTERED_BUILD_V5_2026-11-25.json'));
const currentReserves = await read(path.join(root, 'art/infernal-versus/production/reserve-assets.json'));
assert.equal(audit.identityInventory.length, 209);
assert.equal(audit.variantReconciliation.length, 37);

async function collectRuntime() {
  const ts = require('typescript');
  const prefix = pathToFileURL(path.join(root, 'src') + path.sep).href;
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (context.parentURL?.startsWith(prefix) && specifier.startsWith('.') && !path.extname(specifier)) {
        const file = new URL(specifier + '.ts', context.parentURL);
        return next(existsSync(file) ? file.href : specifier + '/index.ts', context);
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith(prefix) || !url.endsWith('.ts')) return next(url, context);
      return { format: 'module', source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText, shortCircuit: true };
    },
  });
  try {
    return Object.assign({}, ...await Promise.all(['standalone/roster', 'standalone/campaign-global', 'standalone/campaign-illustrations-v4', 'lib/infernal-appearances', 'lib/pentagram-stages'].map(f => import(pathToFileURL(path.join(root, 'src', f + '.ts')).href))));
  } finally { hooks.deregister(); }
}
const runtime = await collectRuntime();
const ready = { ...runtime.INFERNAL_STANCES, ...Object.fromEntries(Object.entries(runtime.INFERNAL_ACTION_POSES).filter(([, value]) => value.ready).map(([id, value]) => [id, value.ready])) };
const activeIds = new Set(runtime.STANDALONE_ROSTER.map(f => f.character.id));
const currentCostumes = Object.entries(runtime.INFERNAL_COSTUMES).flatMap(([identityId, values]) => values.map(value => ({ identityId, ...value })));
const reserveById = new Map(currentReserves.assets.map(a => [a.id, a]));
const artById = new Map((runtime.CAMPAIGN_ILLUSTRATIONS_V4 ?? []).map(a => [a.scope === 'personal' ? `personal:${a.fighterId}:${a.routeVersion}:${a.beat}` : a.id, a]));
const candidatesById = new Map([...audit.priorityCandidates, ...(audit.additionalQualifiedCandidates ?? [])].map(a => [a.id, a]));
const qualificationById = new Map((audit.consolidatedQualification?.rows ?? []).map(row => [row.id, row]));
const remainingPersonalById = new Map((delivery.remainingPersonal ?? []).map(row => [row.assetId, row]));

const newAssets = [];
for (const a of delivery.assets ?? []) {
  const id = a.id ?? a.assetId;
  assert(id, 'Each delivery needs a stable id.');
  const candidate = candidatesById.get(id);
  const master = a.masterPath ?? a.master;
  const exported = a.exportPath ?? a.export ?? a.runtimeExport ?? a.runtime;
  const accepted = ['accepted', 'accepted_static', 'produced_accepted'].includes(a.status);
  const normalized = {
    id, assetId: a.assetId ?? id, sourceIdentityId: a.sourceIdentityId ?? candidate?.sourceIdentityId ?? null,
    category: a.category ?? a.kind ?? candidate?.kind ?? 'unclassified', name: a.name ?? candidate?.name ?? id,
    incarnation: a.incarnation ?? candidate?.incarnation ?? 'Scène AU ou décor défini dans le manifeste de production',
    status: accepted ? 'Accepté' : a.status ?? 'État manquant', accepted,
    master, export: exported, width: a.width ?? a.dimensions?.[0] ?? null, height: a.height ?? a.dimensions?.[1] ?? null,
    masterSha256: a.masterSha256 ?? null, exportSha256: a.exportSha256 ?? null,
    pixelExactExport: a.pixelExactExport === true, animationCycles: a.animationCycles ?? 0,
    fidelityOneToOneCertified: false,
    referenceUrls: [...new Set([...(candidate?.primaryReferences ?? []).map(r => r.sourceUrl), ...(a.references ?? []).filter(r => typeof r === 'object' && r.url).map(r => r.url)])],
    limits: [...(candidate?.referenceLimitations ?? []), ...(Array.isArray(a.fidelityNotes ?? a.notes) ? (a.fidelityNotes ?? a.notes) : (a.fidelityNotes ?? a.notes) ? [a.fidelityNotes ?? a.notes] : [])].filter(x => typeof x === 'string'),
    visualReview: a.visualReview ?? a.visualReviewNotes ?? 'Revue non renseignée',
    prompt: a.prompt ?? null, sourceJsonPointer: a.sourceJsonPointer ?? null,
    ledgerSource: a.ledgerSource ?? null, sourceAssetId: a.sourceAssetId ?? a.assetId ?? id,
  };
  if (accepted) {
    assert(master && exported, 'Accepted drawing lacks a master or export path: ' + id);
    for (const [file, expected] of [[master, normalized.masterSha256], [exported, normalized.exportSha256]]) {
      assert(existsSync(path.join(root, file)), 'Accepted file not present: ' + file);
      if (expected) assert.equal(digest(await fs.readFile(path.join(root, file))), expected, 'SHA mismatch: ' + file);
    }
    if (isFinal) {
      assert(normalized.masterSha256 && normalized.exportSha256, 'Final accepted artwork needs both checksums: ' + id);
      assert(normalized.pixelExactExport, 'Final accepted artwork needs verified lossless export: ' + id);
      assert(normalized.visualReview !== 'Revue non renseignée', 'Final accepted artwork needs a recorded visual review: ' + id);
    }
  }
  const art = artById.get(normalized.assetId);
  const stage = runtime.STANDALONE_STAGES.find(s => [s.imagePath, s.thumbnailPath, s.scenery?.middle, s.scenery?.near].includes(exported?.replace(/^public/, '')));
  normalized.runtimeUsage = art ? `Illustration ${art.scope}, identité/version explicites` : reserveById.has(id) ? 'Galerie de réserve' : currentCostumes.some(c => c.id === id) ? 'Costume sélectionnable' : stage ? `Arène ${stage.name}` : a.runtimeUsage ?? 'Fichier produit ; intégration non établie';
  newAssets.push(normalized);
}
assert.equal(new Set(newAssets.map(a => a.id)).size, newAssets.length, 'Duplicate delivery ids.');
assert(newAssets.every(a => a.animationCycles === 0), 'This batch excludes animation cycles.');
const acceptedById = new Map(newAssets.filter(a => a.accepted).map(a => [a.id, a]));
const acceptedByAssetId = new Map(newAssets.filter(a => a.accepted).map(a => [a.assetId, a]));

const identities = audit.identityInventory.map(row => {
  const added = acceptedById.get(row.id + '-ready');
  const reserve = currentReserves.assets.find(a => a.sourceIdentityId === row.id && ['character_base', 'enemy_base', 'support_base'].includes(a.kind));
  const basePath = added?.export ?? (ready[row.id] ? 'public' + ready[row.id] : reserve?.export ?? row.standaloneBase?.path ?? null);
  const state = basePath ? activeIds.has(row.id) ? 'Base active' : reserve ? 'Base en réserve' : 'Base produite' : 'Base autonome absente';
  const excluded = ['future', 'pilot_legacy', 'simulation_au'].includes(row.continuityInPlan);
  const qualification = qualificationById.get(row.id);
  if (basePath) assert(existsSync(path.join(root, basePath)), 'Catalogue base missing locally: ' + basePath);
  return { ...row, qualificationStatus: qualification?.qualificationStatus ?? null,
    qualificationReason: qualification?.reason ?? null, productionIdentityId: qualification?.productionIdentityId ?? row.id,
    currentBasePath: basePath, baseAvailable: Number(Boolean(basePath)), currentState: state,
    currentRuntimePlayable: activeIds.has(row.id), newAssetId: added?.id ?? null,
    nextAction: basePath ? activeIds.has(row.id) ? 'Conserver la séparation des costumes et des poses.' : 'Rôle narratif, support ou kit à qualifier séparément.' : row.historicalRefusals.length ? 'Conserver le refus historique. Aucune nouvelle tentative planifiée.' : qualification?.nextAction ?? (excluded ? 'Qualifier la continuité avant de commander une base.' : 'Référence primaire et incarnation à préciser, puis base statique à produire.'),
  };
});
const variants = audit.variantReconciliation.map(row => {
  const id = row.matchedAssetOrCandidateId;
  const added = acceptedById.get(id);
  const existing = currentCostumes.find(c => c.id === id);
  return { ...row, currentState: added ? 'Costume statique produit' : existing ? 'Costume actif existant' : row.reconciledState,
    currentExport: added?.export ?? (existing ? 'public' + existing.ready : ''), newAssetId: added?.id ?? null };
});

const illustrations = [];
const addIllustration = row => {
  const produced = acceptedByAssetId.get(row.assetId);
  const integrated = artById.get(row.assetId);
  // A runtime assignment counts only when the referenced local file exists.
  const local = integrated && existsSync(path.join(root, 'public' + integrated.src));
  const remaining = remainingPersonalById.get(row.assetId);
  const unproducedState = remaining?.productionState === 'historical_policy_refusal_no_retry' ? 'Refus générateur conservé, sans relance' : remaining?.productionState === 'generated_pending_visual_review' ? 'Sortie existante, revue à terminer' : 'À produire';
  illustrations.push({ ...row, produced: Number(Boolean(produced || local)), integrated: Number(Boolean(local)),
    status: produced || local ? local ? 'Produite et intégrée' : 'Produite, intégration à vérifier' : unproducedState,
    remainingProductionState: remaining?.productionState ?? null,
    export: produced?.export ?? (local ? 'public' + integrated.src : ''),
    source: row.scope === 'personal' ? 'docs/standalone/campaign-design-v3.json' : 'src/standalone/campaign-global.ts' });
};
for (const f of campaign.fighters) for (const image of f.illustrations) addIllustration({
  assetId: `personal:${f.fighterId}:3:${image.kind}`, scope: 'personal', subject: f.name, moment: image.kind, title: image.title,
  brief: `${image.action} ${image.composition}`, incarnation: image.incarnation,
});
for (const [i, chapter] of runtime.GLOBAL_CAMPAIGN.chapters.entries()) addIllustration({
  assetId: `global:${runtime.GLOBAL_CAMPAIGN.id}:${runtime.GLOBAL_CAMPAIGN.version}:${chapter.id}`,
  scope: 'global', subject: runtime.GLOBAL_CAMPAIGN.title, moment: `Chapitre ${i + 1}`, title: chapter.title,
  brief: chapter.scene, incarnation: 'Campagne AU originale, modèles série',
});
for (const moment of ['intro', 'ending']) addIllustration({
  assetId: `global:${runtime.GLOBAL_CAMPAIGN.id}:${runtime.GLOBAL_CAMPAIGN.version}:${moment}`,
  scope: 'global', subject: runtime.GLOBAL_CAMPAIGN.title, moment,
  title: moment === 'intro' ? 'Ouverture de la campagne globale' : 'Épilogue de la campagne globale',
  brief: runtime.GLOBAL_CAMPAIGN[moment], incarnation: 'Campagne AU originale, modèles série',
  optionalBookend: true,
});
assert.equal(illustrations.filter(r => r.scope === 'personal').length, 129);
assert.equal(new Set(illustrations.map(r => r.assetId)).size, illustrations.length);

const otherRequirements = [...(delivery.environmentRequirements ?? []).map(r => ({ ...r, id: 'ENV-' + r.id })), ...(supplement.requirements ?? [])].map(r => ({
  id: r.id, category: r.category ?? 'Autre', subject: r.subject ?? r.name ?? r.id, requirement: r.requirement ?? r.description ?? '',
  status: r.status ?? 'À qualifier', evidence: r.evidence ?? '', nextAction: r.nextAction ?? '',
}));
// Keep non-art guide gaps visible without interpreting concepts as deliveries.
for (const r of guide.requirements) otherRequirements.push({ id: r.id, category: 'Guide général', subject: r.title,
  requirement: r.remaining, status: r.implementation === 'Intégrée' ? 'Portée V4 intégrée ; extensions listées' : r.implementation,
  evidence: r.evidence.join('\n'), nextAction: r.criterion });
assert.equal(new Set(otherRequirements.map(r => r.id)).size, otherRequirements.length, 'Duplicate additional requirement ids.');

let imageValidation = null;
const stagePlanes = runtime.STANDALONE_STAGES.map(s => ({ id: s.id, planes: [s.imagePath, s.scenery?.middle, s.scenery?.near].filter(Boolean).length }));
if (isFinal) {
  const verified = spawnSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON ?? 'python3', [path.join(here, 'verify-static-production-v5.py'), '--register', deliveryPath], { encoding: 'utf8' });
  assert.equal(verified.status, 0, verified.stderr || verified.stdout);
  imageValidation = await read(path.join(here, 'QA_STATIC_IMAGES_V5_2026-11-25.json'));
  assert.equal(imageValidation.registerSha256, digest(await fs.readFile(deliveryPath)));
  assert.equal(imageValidation.acceptedAssignmentsChecked, newAssets.filter(a => a.accepted).length);

  const previousIntegration = campaign.runtimeIntegration ?? {};
  const historicalV4 = previousIntegration.historicalV4 ?? (previousIntegration.edition === 'V4' ? { ...previousIntegration } : null);
  campaign.runtimeIntegration = {
    ...previousIntegration, edition: 'V5', date: '2026-11-25',
    illustrationAssignmentsV3: illustrations.filter(a => a.scope === 'personal' && a.integrated).length,
    globalIllustrationAssignments: illustrations.filter(a => a.scope === 'global' && a.integrated).length,
    illustrationRegistry: 'src/standalone/campaign-illustrations-v4.ts',
    productionRegister: 'docs/standalone/production-v5-register.json',
    ...(historicalV4 ? { historicalV4 } : {}),
  };
  for (const f of campaign.fighters) for (const image of f.illustrations) {
    const row = illustrations.find(a => a.assetId === `personal:${f.fighterId}:3:${image.kind}`);
    image.productionV5 = { assetId: row.assetId, status: row.status, produced: Boolean(row.produced), integrated: Boolean(row.integrated), export: row.export || null };
  }
  await fs.writeFile(path.join(here, 'campaign-design-v3.json'), JSON.stringify(campaign, null, 2) + '\n');
  const plan = await read(path.join(here, 'extension-plan.json'));
  const previousRuntime = plan.meta.currentRuntime ?? {};
  if (previousRuntime.batchId !== 'static-v5-2026-11-25') {
    plan.meta.runtimeHistory = [...(plan.meta.runtimeHistory ?? []), { ...previousRuntime }];
  }
  plan.meta.currentRuntime = {
    ...previousRuntime, date: '2026-11-25', batchId: 'static-v5-2026-11-25',
    baseCommit: delivery.baselineCommit ?? audit.baseline.latestVerifiedCommitPrefix,
    fighters: activeIds.size, stages: runtime.STANDALONE_STAGES.length,
    threePlaneStages: stagePlanes.filter(s => s.planes === 3).length,
    onePlaneStages: stagePlanes.filter(s => s.planes === 1).length,
    twoPlaneStages: stagePlanes.filter(s => s.planes === 2).length,
    reserveGalleryDrawings: currentReserves.assets.length,
    costumeFamilies: currentCostumes.length,
    illustrationAssignmentsV3: illustrations.filter(a => a.scope === 'personal' && a.integrated).length,
    globalIllustrationAssignments: illustrations.filter(a => a.scope === 'global' && a.integrated).length,
    productionRegister: 'docs/standalone/production-v5-register.json',
    note: 'V5 raccorde des dessins statiques et leurs références. Le roster, les règles de combat et les propositions de techniques/finition restent distincts de cette production. Les versions V3/V4 du classeur restent des archives.',
  };
  await fs.writeFile(path.join(here, 'extension-plan.json'), JSON.stringify(plan, null, 2) + '\n');
}
const sourceFiles = await Promise.all([
  auditPath, deliveryPath, path.join(here, 'campaign-design-v3.json'), path.join(here, 'extension-plan.json'), path.join(here, 'guide-integration-v4.json'),
  path.join(root, 'src/standalone/campaign-illustrations-v4.ts'), path.join(root, 'src/lib/infernal-appearances.ts'), path.join(root, 'src/lib/pentagram-stages.ts'),
  path.join(root, 'art/infernal-versus/production/reserve-assets.json'), ...(supplementPath ? [path.resolve(supplementPath)] : []),
].map(sourceProof));
const data = {
  schemaVersion: 1, edition: 'V5', date: '2026-11-25', status: isFinal ? 'frozen_production_snapshot' : 'draft_production_in_progress',
  baseline: audit.baseline, sourceFiles, newAssets, identities, variants, illustrations, otherRequirements,
  technicalEvidence: { runtimeReport: 'docs/standalone/QA_RUNTIME_STATIC_V5_2026-11-25.json', filteredBuildReport: 'docs/standalone/QA_FILTERED_BUILD_V5_2026-11-25.json', browserReport: 'docs/standalone/QA_BROWSER_V5_2026-11-25.json', testsPassed: runtimeQA.checks.testsPassed, testFilesPassed: runtimeQA.checks.testFilesPassed, standaloneHashFiles: runtimeQA.checks.standaloneManifestFiles, filteredBuildStatus: filteredQA.status, browserScope: 'See the independently maintained browser report for the observed commit and views; no full gameplay or 1:1 certification.' },
  imageValidation: imageValidation ? { report: 'docs/standalone/QA_STATIC_IMAGES_V5_2026-11-25.json', acceptedAssignmentsChecked: imageValidation.acceptedAssignmentsChecked, productionFilesChecked: imageValidation.productionFilesChecked, decodedPixelEquality: imageValidation.decodedPixelEquality } : null,
  metrics: { catalogueIds: identities.length, activeFighters: activeIds.size, currentStandaloneBases: identities.filter(r => r.baseAvailable).length,
    catalogueWithoutStandaloneBase: identities.filter(r => !r.baseAvailable).length,
    acceptedNewDrawings: new Set(newAssets.filter(a => a.accepted).map(a => a.masterSha256)).size,
    acceptedAssetAssignments: newAssets.filter(a => a.accepted).length,
    productionMasterExportFiles: delivery.metrics.masterAndExportFiles,
    productionThumbnailFiles: delivery.metrics.thumbnailFiles,
    productionImageFiles: delivery.metrics.filesVerified,
    acceptedByCategory: Object.fromEntries([...new Set(newAssets.map(a => a.category))].map(c => [c, newAssets.filter(a => a.accepted && a.category === c).length])),
    currentRuntimeCostumeFamilies: currentCostumes.length, currentReserveEntries: currentReserves.assets.length,
    activeStages: runtime.STANDALONE_STAGES.length,
    stagesByPlaneCount: Object.fromEntries([1,2,3].map(n => [n, stagePlanes.filter(s => s.planes === n).length])),
    personalIllustrationRequirements: 129, globalChapterIllustrationRequirements: runtime.GLOBAL_CAMPAIGN.chapters.length,
    globalOptionalBookends: 2, plannedIllustrationsIncludingBookends: illustrations.length,
    personalIllustrationsProduced: illustrations.filter(r => r.scope === 'personal' && r.produced).length,
    personalIllustrationsIntegrated: illustrations.filter(r => r.scope === 'personal' && r.integrated).length,
    globalIllustrationsProduced: illustrations.filter(r => r.scope === 'global' && r.produced).length,
    globalIllustrationsIntegrated: illustrations.filter(r => r.scope === 'global' && r.integrated).length,
    personalRemainingByState: delivery.metrics?.personalRemainingByState ?? {},
    illustrationsProduced: illustrations.filter(r => r.produced).length, illustrationsIntegrated: illustrations.filter(r => r.integrated).length,
    historicalRefusalIds: audit.historicalRefusalsExcludedFromNewQueue.length,
    currentNarrativeRefusals: (delivery.remainingPersonal ?? []).filter(a => a.productionState === 'historical_policy_refusal_no_retry').length,
    newAnimationCycles: 0,
  },
  limits: ['Les 209 IDs comprennent groupes, AU, pilote et entrées futures ; ils ne constituent pas 209 personnages canoniques confirmés.',
    'Un dessin statique ne livre ni cycle d’animation, ni mécanique, ni kit de combat.',
    'Les affectations anciennes V1 ne sont pas assimilées aux 129 briefs V3.',
    'Les 34 feuilles V4 sont conservées comme état historique ; les feuilles V5 décrivent le présent lot.',
    'Le suivi est exhaustif dans les catalogues audités. Les inventions futures non décrites ne forment pas un dénominateur fermé.',
    'La fidélité 1:1 n’est pas certifiée. Le navigateur réel et Microsoft Excel natif requièrent des vérifications séparées.',
    'Les 140 scènes suivies comprennent 129 briefs personnels, neuf chapitres globaux et deux images supplémentaires d’ouverture et de fin globales.',
    ...(supplement.notes ?? [])],
};
const dataPath = path.join(outputDir, isFinal ? 'production-static-v5.json' : 'production-static-v5-draft.json');
await fs.writeFile(dataPath, JSON.stringify(data, null, 2) + '\n');
const markdownCell = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const categoryNames = { story: 'Illustrations de campagne', character: 'Bases de personnages et soutien', enemy: 'Bases d’ennemis', costume: 'Costumes statiques', stage: 'Décors', prop: 'Accessoires séparés' };
const personalMissing = illustrations.filter(a => a.scope === 'personal' && !a.produced);
const stageDrawings = newAssets.filter(a => a.category === 'stage');
const costumeDrawings = newAssets.filter(a => a.category === 'costume');
const baseDrawings = newAssets.filter(a => ['character', 'enemy'].includes(a.category));
const narrativeLines = campaign.fighters.map(f => {
  const cells = f.illustrations.map(image => {
    const a = illustrations.find(row => row.assetId === `personal:${f.fighterId}:3:${image.kind}`);
    return a.produced ? a.integrated ? 'Produite et intégrée' : 'Produite' : a.remainingProductionState === 'historical_policy_refusal_no_retry' ? 'Refus conservé' : 'À produire';
  });
  return `| ${markdownCell(f.name)} | ${cells.map(markdownCell).join(' | ')} |`;
});
const deliveryReport = `# Infernal Versus — production statique V5

Date : 25 novembre 2026. État : **${isFinal ? 'lot figé après vérification des fichiers' : 'instantané de production en cours'}**. Base de comparaison : \`${delivery.baselineCommit ?? audit.baseline.latestVerifiedCommitPrefix}\`.

La reprise conserve les deux univers Hazbin Hotel et Helluva Boss, les 43 combattants et leurs règles de combat. Les dessins de ce lot complètent les campagnes, les décors, les costumes et les réserves. Aucun cycle d’animation n’est ajouté.

## Dessins présents

| Domaine du lot V5 | Dessins distincts |
| --- | ---: |
${Object.entries(data.metrics.acceptedByCategory).map(([category, count]) => `| ${categoryNames[category] ?? markdownCell(category)} | ${count} |`).join('\n')}
| **Total du lot** | **${data.metrics.acceptedNewDrawings}** |

Un dessin correspond à un master PNG et un export WebP. Le lot comprend ${data.metrics.productionMasterExportFiles} fichiers master/export et ${data.metrics.productionThumbnailFiles} miniatures de décors, soit ${data.metrics.productionImageFiles} fichiers image. Les miniatures, copies et essais remplacés ne créent pas de dessin supplémentaire. Le [registre de production](production-v5-register.json) conserve les identifiants, les prompts, les références, les dimensions, les empreintes et les notes de revue. Les anciennes vagues restent des archives distinctes.

## État du jeu et des illustrations

| Élément | État observé |
| --- | --- |
| Combattants sélectionnables | ${data.metrics.activeFighters} |
| Arènes | ${data.metrics.activeStages}, dont ${data.metrics.stagesByPlaneCount[3]} à trois plans et ${data.metrics.stagesByPlaneCount[1]} nouveaux fonds simples |
| Costumes sélectionnables | ${data.metrics.currentRuntimeCostumeFamilies} familles |
| Catalogue de réserve | ${data.metrics.currentReserveEntries} éléments, hors compteur des combattants |
| Scènes personnelles V3 | ${data.metrics.personalIllustrationsProduced}/129 produites, ${data.metrics.personalIllustrationsIntegrated} affectées au runtime |
| Campagne La nuit du signal libre | ${data.metrics.globalIllustrationsProduced}/11 images produites, ${data.metrics.globalIllustrationsIntegrated} affectées au runtime |
| Catalogue de bases autonomes | ${data.metrics.currentStandaloneBases}/209 IDs disposent d’une base séparée |
| Scènes personnelles restant ouvertes | ${personalMissing.length}, dont ${data.metrics.currentNarrativeRefusals} refus conservés sans relance |

Les 209 IDs comprennent des individus, des groupes, des originaux AU, des versions du pilote et des entrées futures. Ils ne constituent pas 209 personnages canoniques confirmés. Les portraits historiques et les bases autonomes sont suivis séparément. Cherri Bomb, Lute et Stella utilisent encore leur représentation historique par défaut dans le roster ; un portrait existant ne ferme pas artificiellement le besoin d’une base autonome.

### Nouveaux décors

${stageDrawings.map(a => `- **${a.name}** — ${a.incarnation}`).join('\n')}

Ces cinq décors sont des images fixes. Les trente arènes antérieures conservent leurs plans existants. Les nouveaux lieux ne sont pas assimilés à des transitions jouables, des dangers ou des activités de fond supplémentaires.

### Bases et costumes

Les ${baseDrawings.length} nouvelles bases concernent ${baseDrawings.map(a => a.name).join(', ')}. Leurs rôles et leur continuité restent explicites dans le registre. Marlow Glass et Ember Vale sont des créations AU du projet. Une base de réserve ne livre pas à elle seule un kit de combat.

| Nouveau costume | Usage constaté |
| --- | --- |
${costumeDrawings.map(a => `| ${markdownCell(a.name)} | ${markdownCell(a.runtimeUsage)} |`).join('\n')}

## Couverture des routes personnelles

Chaque image conserve le lien avec son personnage, sa version de route et son moment. Les images V1 ne sont pas attribuées automatiquement aux briefs V3. Les rencontres, les dialogues et les issues des campagnes sont des créations de Simulation AU.

| Personnage | Introduction | Rivalité | Épilogue |
| --- | --- | --- | --- |
${narrativeLines.join('\n')}

## Manques encore qualifiés

L’[audit de catalogue](production-v5-audit.json) conserve l’examen des 209 IDs et la réconciliation des 37 variantes. ${data.metrics.catalogueWithoutStandaloneBase} IDs n’ont pas de base autonome. Les identités sans référence primaire suffisante, celles du pilote ou futures, les alias et les refus historiques restent distingués ; ils ne sont pas transformés en nouvelles commandes sans preuve de modèle.

Les deux machines ciblées (anneau du portail D.H.O.R.K.S. et dirigeable pilote de Pentious) et les deux projectiles ciblés (flèche C.H.E.R.U.B. et shuriken D.H.O.R.K.S.) restent à qualifier dans les références de silhouette ou d’incarnation. Les VFX et la fléchette déjà livrés dans les vagues précédentes sont conservés. Les 172 propositions de techniques, les 43 storyboards de Dernier Acte et les exigences du guide restent à leur niveau réel d’implémentation.

## Vérifications et limites

${isFinal ? `Les ${imageValidation.acceptedAssignmentsChecked} affectations de dessin et leurs ${imageValidation.productionFilesChecked} fichiers PNG/WebP ont été vérifiés par empreinte. Les pixels RGBA décodés des couples master/export, leurs dimensions et leur alpha concordent. Voir [le rapport des images](QA_STATIC_IMAGES_V5_2026-11-25.json).` : 'Les empreintes des sorties acceptées ont été rapprochées des fichiers présents. Le contrôle final des pixels et du classeur sera exécuté au gel du lot.'}

La [bible V5](INFERNAL_VERSUS_BIBLE_V5.xlsx) ajoute six vues de production aux 34 feuilles historiques V4. La préservation des feuilles et tables anciennes, les formules de synthèse et les vues des nouveaux onglets sont contrôlées dans le [rapport du classeur](QA_STATIC_WORKBOOK_V5_2026-11-25.json).

La [QA automatisée](QA_RUNTIME_STATIC_V5_2026-11-25.json) passe ${runtimeQA.checks.testsPassed} tests répartis dans ${runtimeQA.checks.testFilesPassed} fichiers, le contrôle TypeScript, ESLint et les deux builds. Les ${runtimeQA.checks.standaloneManifestFiles} fichiers du manifeste standalone passent le contrôle d’empreintes. La [copie filtrée pour publication](QA_FILTERED_BUILD_V5_2026-11-25.json) passe également les builds manager et standalone ainsi que leur contrôle, avec des assets publiés identiques aux sources. Les avertissements de taille du bundle et de configuration npm sont conservés dans ces preuves.

Le [contrôle navigateur](QA_BROWSER_V5_2026-11-25.json) précise le commit publié et les vues effectivement observées : accueil, galerie et aperçu de campagne. Il vérifie l’affichage et le chargement des images échantillonnées. Il ne vaut pas validation de tous les combats, chapitres ou personnages, et ne certifie pas la fidélité canonique.

**La fidélité 1:1 reste un objectif, elle n’est pas certifiée par ces contrôles.** Les références de certains détails sont limitées aux prévisualisations officielles et aux modèles historiques du projet. Les poses statiques, raccords de décor et mises en scène de campagne comportent des adaptations déclarées. Les dessins conservent leurs dimensions natives ; aucune résolution supérieure n’est revendiquée par agrandissement.

## Reproduire la consolidation

Les [sources archivées](production-v5/README.md) rendent la consolidation indépendante de l’ancien dossier de travail : huit registres, prompts, historiques, audits, index des références et recettes portables. Aucun bitmap tiers ni sortie rejetée n’est redistribué. Les chemins historiques, empreintes et limites de référence restent traçables.

Le script \`consolidate-static-production-v5.mjs\` utilise cette archive par défaut, accepte \`--source-dir\` et ne modifie pas les registres source. Il sélectionne les révisions dont les deux empreintes correspondent aux fichiers présents. \`build-static-production-v5.mjs --prepare\` contrôle l’inventaire sans publier de classeur. \`--final\` vérifie les images, actualise les liens documentaires et ajoute les six vues V5 à la bible V4. Le builder utilise le runtime documentaire principal et accepte \`--output\` pour la destination.
`;
await fs.writeFile(path.join(outputDir, isFinal ? 'DELIVERY_STATIC_V5_2026-11-25.md' : 'STATIC_PRODUCTION_V5_DRAFT.md'), deliveryReport);
if (!isFinal) {
  console.log(JSON.stringify({ status: data.status, output: dataPath, metrics: data.metrics }));
  process.exit(0);
}

const baselinePath = path.join(here, 'INFERNAL_VERSUS_BIBLE_V4.xlsx');
const baseline = await SpreadsheetFile.importXlsx(await FileBlob.load(baselinePath));
const baselinePreview = await baseline.render({ sheetName: 'Guide V4', range: 'A1:I15', scale: 1, format: 'png' });
await fs.writeFile(path.join(outputDir, 'baseline-v4.png'), new Uint8Array(await baselinePreview.arrayBuffer()));
const wb = Workbook.create();
const names = ['Production V5', 'Catalogue V5', 'Variantes V5', 'Illustrations V5', 'Livraisons V5', 'Suites V5'];
for (const name of names) wb.worksheets.add(name);
const palette = { burgundy: '#54233F', ink: '#292332', muted: '#665C68', gold: '#B38839', pale: '#F8F3F6' };
const col = n => String.fromCharCode(65 + n);
const sheetSpecs = [];
function table(name, title, note, headers, widths, rows, tableName, start = 5) {
  const sheet = wb.worksheets.getItem(name), last = col(headers.length - 1), end = start + rows.length;
  sheet.showGridLines = false;
  sheet.getRange(`A1:${last}${end}`).format.font = { name: 'Arial', size: 10, color: palette.ink };
  sheet.getRange(`A2:${last}2`).merge(); sheet.getRange('A2').values = [[title]];
  sheet.getRange('A2').format.font = { name: 'Arial', size: 16, bold: true, color: palette.burgundy };
  sheet.getRange(`A2:${last}2`).format.rowHeight = 30;
  sheet.getRange(`A3:${last}3`).format.rowHeight = 6;
  sheet.getRange(`A3:${last}3`).format.borders = { bottom: { style: 'thin', color: palette.gold } };
  sheet.getRange(`A4:${last}4`).merge(); sheet.getRange('A4').values = [[note]];
  sheet.getRange('A4').format.font = { name: 'Arial', size: 10, italic: true, color: palette.muted };
  sheet.getRange(`A4:${last}4`).format.rowHeight = 30;
  sheet.getRange(`A${start}:${last}${end}`).values = [headers, ...rows];
  const t = sheet.tables.add(`A${start}:${last}${end}`, true, tableName); t.style = 'TableStyleLight1'; t.showFilterButton = true;
  sheet.getRange(`A${start}:${last}${start}`).format = { fill: palette.burgundy, font: { name: 'Arial', size: 10, bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true, rowHeight: 36 };
  sheet.getRange(`A${start + 1}:${last}${end}`).format.wrapText = true;
  sheet.getRange(`A${start + 1}:${last}${end}`).format.verticalAlignment = 'top';
  widths.forEach((width, i) => sheet.getRange(`${col(i)}1:${col(i)}${end}`).format.columnWidth = width);
  rows.forEach((row, i) => {
    const lines = Math.max(...row.map((value, j) => String(value ?? '').split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / (widths[j] * 0.82))), 0)));
    const range = sheet.getRange(`A${start + i + 1}:${last}${start + i + 1}`);
    range.format.rowHeight = Math.max(29, 15 * lines + 13); if (i % 2 === 0) range.format.fill = palette.pale;
  });
  sheet.freezePanes.freezeRows(start); sheet.freezePanes.freezeColumns(1);
  sheetSpecs.push({ name, last, end, start });
  return sheet;
}
table('Catalogue V5', 'Catalogue et bases statiques', '209 IDs. Portrait historique, base autonome et combattant actif sont des états distincts.',
  ['ID', 'Identité', 'Continuité du plan', 'Combattant actif', 'État courant', 'Base disponible', 'Export de base', 'Suite', 'Référence'],
  [30,31,20,16,30,16,72,72,55], identities.map(r => [r.id,r.name,r.continuityInPlan,r.currentRuntimePlayable?'Oui':'Non',r.currentState,r.baseAvailable,r.currentBasePath??'',r.nextAction,r.source]), 'StaticV5Catalogue');
table('Variantes V5', 'Costumes et incarnations', '37 exigences réconciliées. Les poses existantes ne sont pas recomptées comme nouvelles productions.',
  ['ID','Identité','Incarnation','État courant','Export','Écart et suite','Référence primaire prévue'],
  [14,28,40,48,70,95,35],variants.map(r=>[r.id,r.fighter,r.name,r.currentState,r.currentExport,r.auditNote,r.reference]),'StaticV5Variants');
table('Illustrations V5', 'Illustrations de campagne', '129 briefs personnels V3, neuf chapitres globaux et deux images d’ouverture/fin. Les anciennes images V1 restent indépendantes.',
  ['Identité/version','Portée','Sujet','Moment','Titre','Brief','État','Produite','Intégrée','Export'],
  [46,14,34,18,40,90,36,12,12,75],illustrations.map(r=>[r.assetId,r.scope,r.subject,r.moment,r.title,r.brief,r.status,r.produced,r.integrated,r.export]),'StaticV5Illustrations');
table('Livraisons V5', 'Nouveaux dessins du lot', 'Un dessin accepté correspond à un master et un export vérifiés. Les miniatures et copies ne créent pas de nouveau dessin.',
  ['ID','Catégorie','Identité/incarnation','Statut','Usage observé','Largeur px','Hauteur px','Cycles','Master','Export','Limites','Sources primaires'],
  [39,19,68,20,47,14,14,12,76,76,95,65],newAssets.map(a=>[a.id,a.category,`${a.name} — ${a.incarnation}`,a.status,a.runtimeUsage,a.width,a.height,a.animationCycles,a.master??'',a.export??'',a.limits.join('\n'),a.referenceUrls.join('\n')]),'StaticV5Deliveries');
table('Suites V5', 'Suites et exigences transversales', 'État documenté du guide et compléments de production. Aucune conception n’est transformée en fonction livrée.',
  ['ID','Catégorie','Sujet','Reste à réaliser','État','Preuves','Critère ou prochaine action'],
  [18,24,37,95,39,70,90],otherRequirements.map(r=>[r.id,r.category,r.subject,r.requirement,r.status,Array.isArray(r.evidence)?r.evidence.join('\n'):r.evidence,r.nextAction]),'StaticV5Remaining');

const summary = table('Production V5', 'Infernal Versus · Production statique V5', '25 novembre 2026. Compter les dessins réels, leurs usages et les éléments encore absents.',
  ['Indicateur','Quantité','Portée'],[49,18,100], [
    ['Nouveaux dessins acceptés',null,'Master et export présents, statut accepté dans le registre du lot.'],
    ['Cycles d’animation nouveaux',null,'Cette vague produit uniquement des images fixes.'],
    ['IDs de catalogue suivis',null,'Individus, groupes, AU, pilote et entrées futures restent étiquetés.'],
    ['Bases autonomes disponibles',null,'Bases actives ou de réserve, une par ID catalogue.'],
    ['Entrées sans base autonome',null,'Inclut les entrées à qualifier ; ce n’est pas un engagement à toutes les rendre jouables.'],
    ['Illustrations prévues',null,'129 briefs personnels, neuf chapitres globaux et deux images d’ouverture/fin globales.'],
    ['Illustrations produites',null,'Images dédiées au bon identifiant et à la bonne version.'],
    ['Illustrations intégrées',null,'Affectation runtime explicite et fichier présent.'],
    ['Illustrations restant à produire',null,'Les anciennes illustrations V1 ne réduisent pas ce nombre.'],
    ['Combattants actifs',activeIds.size,'Le dessin d’un PNJ ne l’ajoute pas au roster.'],
    ['Costumes actifs',currentCostumes.length,'Familles sélectionnables dans les données runtime actuelles.'],
    ['Entrées de réserve',currentReserves.assets.length,'Catalogue de réserve courant, projectile compris.'],
    ['Refus historiques conservés',audit.historicalRefusalsExcludedFromNewQueue.length,'Aucune nouvelle tentative de ces requêtes dans l’audit.'],
    ['Refus narratifs conservés',data.metrics.currentNarrativeRefusals,'Scènes non livrées après refus du générateur. Elles restent exclues des relances.'],
    ['Arènes actives',runtime.STANDALONE_STAGES.length,'Arènes enregistrées dans le catalogue du standalone.'],
    ['Scènes personnelles produites',data.metrics.personalIllustrationsProduced,'Sur 129 briefs V3 ; les illustrations historiques V1 ne sont pas recomptées.'],
    ['Scènes globales produites',data.metrics.globalIllustrationsProduced,'Neuf chapitres et deux images d’ouverture/fin.'],
  ],'StaticV5Summary');
summary.tabColor = palette.burgundy;
const deliveryEnd = 5 + newAssets.length, catalogueEnd = 5 + identities.length, illustrationEnd = 5 + illustrations.length;
const formulas = [
  `=COUNTIFS('Livraisons V5'!$D$6:$D$${deliveryEnd},"Accepté")`,
  `=SUM('Livraisons V5'!$H$6:$H$${deliveryEnd})`,
  `=COUNTA('Catalogue V5'!$A$6:$A$${catalogueEnd})`,
  `=SUM('Catalogue V5'!$F$6:$F$${catalogueEnd})`, '=B8-B9',
  `=COUNTA('Illustrations V5'!$A$6:$A$${illustrationEnd})`,
  `=SUM('Illustrations V5'!$H$6:$H$${illustrationEnd})`,
  `=SUM('Illustrations V5'!$I$6:$I$${illustrationEnd})`, '=B11-B12',
];
formulas.forEach((formula,i)=>summary.getRange(`B${i+6}`).formulas=[[formula]]);
summary.getRange('B6:B22').setNumberFormat('0'); summary.getRange('B6:B22').format.horizontalAlignment='right';
wb.worksheets.getItem('Catalogue V5').getRange(`F6:F${catalogueEnd}`).setNumberFormat('0');
wb.worksheets.getItem('Illustrations V5').getRange(`H6:I${illustrationEnd}`).setNumberFormat('0');
wb.recalculate();
const expected = [data.metrics.acceptedNewDrawings,0,209,data.metrics.currentStandaloneBases,data.metrics.catalogueWithoutStandaloneBase,illustrations.length,data.metrics.illustrationsProduced,data.metrics.illustrationsIntegrated,illustrations.length-data.metrics.illustrationsProduced];
const actual = summary.getRange('B6:B14').values.flat(); assert.deepEqual(actual,expected);
// Verify one actual input change and restore it before export.
const illustrationSheet = wb.worksheets.getItem('Illustrations V5');
const previous = illustrationSheet.getRange('H6').values[0][0];
illustrationSheet.getRange('H6').values=[[previous?0:1]];
assert.equal(summary.getRange('B12').values[0][0],data.metrics.illustrationsProduced+(previous?-1:1));
illustrationSheet.getRange('H6').values=[[previous]]; wb.recalculate();
assert.deepEqual(summary.getRange('B6:B14').values.flat(),expected);
const inspection = await wb.inspect({kind:'table',range:'Production V5!A5:C22',include:'values,formulas',tableMaxRows:18,tableMaxCols:3,maxChars:6000});
await fs.writeFile(path.join(outputDir,'summary-inspection.ndjson'),inspection.ndjson);
const errorScan = await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},maxChars:4000});
await fs.writeFile(path.join(outputDir,'formula-errors.ndjson'),errorScan.ndjson);
const additionsPath=path.join(process.cwd(),'infernal-static-v5-additions.xlsx');
await(await SpreadsheetFile.exportXlsx(wb)).save(additionsPath);
const finalPath=path.join(outputDir,'INFERNAL_VERSUS_BIBLE_V5.xlsx');
const reportPath=path.join(outputDir,'workbook-package-report.json');
const packaged=spawnSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON??'python3',[path.join(here,'append-production-workbook.py'),baselinePath,additionsPath,finalPath,reportPath],{encoding:'utf8'});
assert.equal(packaged.status,0,packaged.stderr||packaged.stdout);
const packaging=await read(reportPath);assert.equal(packaging.finalSheetCount,40);assert.equal(packaging.preservedWorksheetXmlParts,34);
const finalBook=await SpreadsheetFile.importXlsx(await FileBlob.load(finalPath));
assert.deepEqual(finalBook.worksheets.getItem('Production V5').getRange('B6:B14').values.flat(), expected, 'Saved workbook summary differs after reimport.');
const rendered=[];
for(const spec of sheetSpecs){
  const ranges=spec.name==='Production V5'?[`A1:${spec.last}${spec.end}`]:[`A1:${spec.last}${Math.min(spec.end,10)}`,`A${Math.max(5,spec.end-3)}:${spec.last}${spec.end}`];
  for(const [i,range] of ranges.entries()){
    const preview=await finalBook.render({sheetName:spec.name,range,scale:1,format:'png'});
    const file=path.join(outputDir,spec.name.replaceAll(' ','-')+'-'+i+'.png');
    await fs.writeFile(file,new Uint8Array(await preview.arrayBuffer()));rendered.push({sheetName:spec.name,range,file});
  }
}
const report={...packaging,date:data.date,metrics:data.metrics,summaryActual:actual,recalculation:'Artifact Tool; input change/recalculate/restore checked',renderedViews:rendered,visualReview:'pending image inspection',nativeExcelRecalculation:'not_run',browserValidation:'reported separately by runtime owner'};
await fs.writeFile(path.join(outputDir,'QA_STATIC_WORKBOOK_V5_2026-11-25.json'),JSON.stringify(report,null,2)+'\n');
await fs.copyFile(finalPath,path.join(here,'INFERNAL_VERSUS_BIBLE_V5.xlsx'));
await fs.copyFile(dataPath,path.join(here,'production-static-v5.json'));
await fs.copyFile(path.join(outputDir,'QA_STATIC_WORKBOOK_V5_2026-11-25.json'),path.join(here,'QA_STATIC_WORKBOOK_V5_2026-11-25.json'));
await fs.copyFile(path.join(outputDir,'DELIVERY_STATIC_V5_2026-11-25.md'),path.join(here,'DELIVERY_STATIC_V5_2026-11-25.md'));
const readmePath = path.join(here, 'README.md');
let readme = await fs.readFile(readmePath, 'utf8');
const currentSection = `## Reprise actuelle — 25 novembre 2026, production statique V5

La [bible V5](INFERNAL_VERSUS_BIBLE_V5.xlsx) conserve les 34 feuilles V4 et ajoute six vues : production, catalogue, variantes, illustrations, livraisons et suites. Le [rapport de livraison](DELIVERY_STATIC_V5_2026-11-25.md), le [registre vérifié](production-v5-register.json) et le [relevé courant](production-static-v5.json) décrivent ce lot de **${data.metrics.acceptedNewDrawings} dessins statiques**.

Le jeu propose **${data.metrics.activeFighters} combattants**, **${data.metrics.activeStages} arènes**, **${data.metrics.currentRuntimeCostumeFamilies} costumes sélectionnables** et **${data.metrics.currentReserveEntries} éléments en galerie de réserve**. Les campagnes personnelles V3 disposent de **${data.metrics.personalIllustrationsProduced}/129 images produites**, dont ${data.metrics.personalIllustrationsIntegrated} affectées au jeu. La campagne globale possède **${data.metrics.globalIllustrationsProduced}/11 images**, dont ${data.metrics.globalIllustrationsIntegrated} affectées. ${data.metrics.currentNarrativeRefusals} scènes restent marquées comme refusées par le générateur, sans relance. Aucun nouveau cycle d’animation n’est ajouté.

Les 43 kits, les mouvements existants et les limites de fidélité restent explicitement séparés de ces dessins. Les [contrôles des images](QA_STATIC_IMAGES_V5_2026-11-25.json) comparent les pixels PNG/WebP et leurs empreintes. Le [contrôle du classeur](QA_STATIC_WORKBOOK_V5_2026-11-25.json) documente la préservation des anciennes feuilles et la vérification des vues V5. La fidélité 1:1 n’est pas certifiée.

La [QA automatisée](QA_RUNTIME_STATIC_V5_2026-11-25.json) passe ${runtimeQA.checks.testsPassed} tests et contrôle les ${runtimeQA.checks.standaloneManifestFiles} empreintes du standalone. Les [builds filtrés](QA_FILTERED_BUILD_V5_2026-11-25.json) passent. Le [rapport navigateur](QA_BROWSER_V5_2026-11-25.json) décrit les vues observées sur le commit publié. Les [sources de production archivées](production-v5/README.md) permettent de reconstruire ce suivi depuis le dépôt.

`;
const oldCurrent = '## Reprise actuelle — 25 novembre 2026, guide intégré V4';
const historicalV4Heading = '## Contenu conservé — 25 novembre 2026, guide V4 (historique)';
if (readme.includes(oldCurrent)) readme = readme.replace(oldCurrent, currentSection + historicalV4Heading);
else if (readme.includes('## Reprise actuelle — 25 novembre 2026, production statique V5')) {
  const start = readme.indexOf('## Reprise actuelle — 25 novembre 2026, production statique V5');
  const end = readme.indexOf(historicalV4Heading, start);
  assert(end > start, 'Historical V4 section is required to update the V5 README.');
  readme = readme.slice(0, start) + currentSection + readme.slice(end);
}
await fs.writeFile(readmePath, readme);
console.log(JSON.stringify({output:finalPath,metrics:data.metrics,renderedViews:rendered.length,visualReview:report.visualReview}));
