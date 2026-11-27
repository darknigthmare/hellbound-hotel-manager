import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// Consolidate actual accepted files. Historical V5/V6 records remain immutable.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const final = process.argv.includes('--final');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const read = async name => JSON.parse(await fs.readFile(path.join(here, name), 'utf8'));
async function optional(name, fallback) {
  try { return await read(name); } catch (error) { if (error.code !== 'ENOENT') throw error; return fallback; }
}
const audit = await read('catalogue-audit.json');
const previous = JSON.parse(await fs.readFile(path.join(root, 'docs/standalone/production-v6/delivery-register.json'), 'utf8'));
const baseline = { ...previous.cumulativeCounts };
const reviewFile = await read('reviews-v7.json');
const reviewMap = new Map(reviewFile.reviews.map(review => [review.id, review]));
const ledgers = [];
for (const file of ['hazbin-generation.json', 'helluva-generation.json', 'environment-generation.json', 'corrections-generation.json']) {
  const data = await optional(file, null); if (data) ledgers.push({ file, data });
}
const attempts = ledgers.flatMap(({ file, data }) => (data.attempts ?? []).map(attempt => ({ ...attempt, id: attempt.id ?? attempt.assetId, promptRegister: file })));
const allGenerated = [];
for (const { file, data } of ledgers) {
  const rows = data.assets ?? (data.attempts ?? []).filter(attempt => attempt.master && attempt.export);
  for (const raw of rows) {
    const attempt = [...(data.attempts ?? [])].reverse().find(item => (item.id ?? item.assetId) === raw.id && !/refus|requested|pending_generation/.test(item.status ?? '')) ?? raw;
    const review = reviewMap.get(raw.id);
    const outputs = attempt.outputs ?? [];
    const master = raw.master ?? attempt.master;
    const exportPath = raw.export ?? attempt.export;
    const dimensions = raw.dimensions ?? attempt.dimensions ?? [raw.width, raw.height];
    const kind = raw.category ?? raw.kind ?? 'character_base';
    const category = ({ stage_background: 'stage', stage_prop: 'stage_layer', costume_base: 'costume', machine_variant: 'machine', constructed_entity: 'machine', archive: 'narrative_archive', narrative_portrait: 'narrative_archive' })[kind] ?? kind;
    const sourceIdentityId = raw.sourceIdentityId ?? null;
    const continuity = raw.continuity ?? raw.spoilerTier ?? raw.spoilerScope ?? raw.timelineScope ?? (sourceIdentityId?.startsWith('hb_') ? 'season_2' : 'season_1');
    const referenceUrls = [...new Set(raw.referenceUrls ?? attempt.referenceUrls ?? attempt.sourceUrls ?? [])];
    const fidelityNotes = [...new Set([...(raw.fidelityNotes ?? raw.limits ?? attempt.limits ?? []), ...(review?.limits ?? []), ...(raw.sourceNote || attempt.sourceNote ? [raw.sourceNote ?? attempt.sourceNote] : [])])];
    const accepted = Boolean(review && review.status.startsWith('accepted_') && !review.requestedCorrection);
    const asset = {
      id: raw.id, name: raw.name ?? raw.label ?? attempt.name ?? raw.id,
      sourceIdentityId, ...(raw.sourceIdentityIds ? { sourceIdentityIds: raw.sourceIdentityIds } : {}),
      ...(raw.replacesAssetId ? { replacesAssetId: raw.replacesAssetId } : {}),
      category, kind: category === 'costume' ? 'costume_base' : category,
      franchise: raw.franchise ?? (sourceIdentityId?.startsWith('hb_') ? 'Helluva Boss' : 'Hazbin Hotel'),
      continuity, incarnation: raw.incarnation ?? raw.sourceNote ?? attempt.sourceNote ?? raw.label ?? raw.name,
      status: accepted ? 'accepted_static_candidate' : 'generated_pending_review', accepted,
      master, export: exportPath, dimensions,
      masterSha256: raw.masterSha256 ?? attempt.masterSha256 ?? outputs.find(output => output.path === master)?.sha256,
      exportSha256: raw.exportSha256 ?? attempt.exportSha256 ?? outputs.find(output => output.path === exportPath)?.sha256,
      masterBytes: raw.masterBytes ?? attempt.masterBytes ?? outputs.find(output => output.path === master)?.bytes,
      exportBytes: raw.exportBytes ?? attempt.exportBytes ?? outputs.find(output => output.path === exportPath)?.bytes,
      pixelExactExport: raw.pixelExactExport ?? attempt.pixelExactExport ?? attempt.decodedRgbaEqual,
      alphaExtrema: raw.alphaExtrema ?? attempt.alphaExtrema,
      ...(raw.alphaBounds16 ?? attempt.alphaBounds16 ? { alphaBounds16: raw.alphaBounds16 ?? attempt.alphaBounds16 } : {}),
      ...(raw.visibleBBoxAlpha50 ? { visibleBBoxAlpha50: raw.visibleBBoxAlpha50 } : {}),
      ...(attempt.alphaBoundingBox ? { alphaBoundingBox: attempt.alphaBoundingBox } : {}),
      runtimeUsage: category === 'stage' ? 'Arène sélectionnable' : category === 'stage_layer' ? 'Plan indépendant de l’arène' : category === 'revision' ? 'Correction d’une entrée existante de la galerie' : 'Galerie de réserve',
      ...(raw.runtimeStageId ? { runtimeStageId: raw.runtimeStageId } : {}),
      ...(raw.variantRequirementIds ? { variantRequirementIds: raw.variantRequirementIds } : {}),
      ...(raw.variantCoverage ? { variantCoverage: raw.variantCoverage } : {}),
      ...(raw.frameCoverage ? { frameCoverage: raw.frameCoverage } : {}),
      ...(raw.planRequirementIds ? { planRequirementIds: raw.planRequirementIds } : {}),
      ...(raw.planCoverage ? { planCoverage: raw.planCoverage } : {}),
      referenceUrls, referenceIds: raw.referenceIds ?? [], promptRegister: file,
      visualReview: review ? { status: review.status, matched: review.matched, limits: review.limits, subjectComplete: review.subjectComplete, masterSha256: review.masterSha256 } : raw.visualReview ?? null, fidelityNotes,
      newAnimationCycles: 0, fidelityOneToOneCertified: false, inGameChecked: false,
    };
    if (raw.thumbnail) {
      const thumbPath = typeof raw.thumbnail === 'string' ? raw.thumbnail : raw.thumbnail.path;
      const bytes = await fs.readFile(path.join(root, thumbPath));
      asset.thumbnail = { path: thumbPath, sha256: sha(bytes), bytes: bytes.length };
    }
    assert(master && exportPath && dimensions.every(Number.isFinite), 'Incomplete file metadata: ' + raw.id);
    for (const [filePath, expected] of [[master, asset.masterSha256], [exportPath, asset.exportSha256]]) {
      assert(expected, 'Missing expected image hash: ' + filePath);
      assert.equal(sha(await fs.readFile(path.join(root, filePath))), expected, 'Changed image: ' + filePath);
    }
    assert.equal(asset.pixelExactExport, true, 'Unverified lossless export: ' + raw.id);
    if (accepted) assert.equal(review.masterSha256, asset.masterSha256, 'Review is for an older master: ' + raw.id);
    allGenerated.push(asset);
  }
}
assert.equal(new Set(allGenerated.map(asset => asset.id)).size, allGenerated.length, 'Duplicate generated asset IDs.');
if (final) assert(allGenerated.every(asset => asset.accepted), 'Independent visual review remains pending.');
if (final) assert(!attempts.some(attempt => /^(?:pending_generation|requested|generation_running)$/.test(attempt.status ?? '')), 'A generation attempt remains unresolved.');
const assets = allGenerated.filter(asset => asset.accepted);
assert.equal(new Set(assets.map(asset => asset.masterSha256)).size, assets.length, 'Do not count one drawing twice.');
const baseCategories = new Set(['character_base', 'support_base', 'enemy_base']);
const bases = assets.filter(asset => baseCategories.has(asset.category));
const coverageByIdentity = new Map();
for (const asset of bases) for (const id of [asset.sourceIdentityId, ...(asset.sourceIdentityIds ?? [])].filter(Boolean)) coverageByIdentity.set(id, asset);
const qualificationRows = [];
for (const file of ['hazbin-qualification.json', 'hazbin-qualification-extra.json', 'hazbin-variant-qualification.json', 'helluva-qualification.json', 'environment-references.json']) {
  const data = await optional(file, {});
  const sourceById = new Map((data.sources ?? []).map(source => [source.id, source]));
  for (const row of [...(data.candidates ?? []), ...(data.targets ?? []), ...(data.identities ?? []), ...(data.variants ?? [])]) {
    const limits = Array.isArray(row.limits) ? row.limits : row.limits ? [row.limits] : [];
    const detailedNotes = [row.evidence, ...limits].filter(Boolean).join(' ');
    const referencedSources = [...(row.primarySourceIds ?? []), ...(row.referenceIds ?? [])].map(id => sourceById.get(id)).filter(Boolean);
    qualificationRows.push({ ...row,
      notes: row.notes ?? row.reason ?? (detailedNotes || undefined),
      referenceUrls: row.referenceUrls ?? row.sourceUrls ?? [...new Set(referencedSources.flatMap(source => source.url ? [source.url] : source.urls ?? []))],
    });
  }
}
for (const { data } of ledgers) qualificationRows.push(...(data.candidates ?? []));
const qualificationById = new Map(qualificationRows.map(row => [row.id?.startsWith('VAR-') ? row.id : row.sourceIdentityId ?? row.id, row]));
const refused = attempts.filter(attempt => /refus|moderation_blocked/.test(attempt.status ?? ''));
const candidateStates = audit.candidates.map(candidate => {
  const asset = coverageByIdentity.get(candidate.id);
  const latest = qualificationById.get(candidate.id);
  const refusal = refused.find(attempt => (attempt.sourceIdentityId ?? attempt.id?.replace(/-ready$/, '')) === candidate.id);
  return {
    sourceIdentityId: candidate.id, productionIdentityId: candidate.productionIdentityId, name: candidate.name,
    franchise: candidate.franchise, continuity: asset?.continuity ?? latest?.continuity ?? candidate.continuityInPlan,
    status: asset ? 'accepted_static_candidate' : refusal ? 'generator_refused' : latest?.status ?? candidate.qualificationStatus,
    accepted: Boolean(asset), assetId: asset?.id ?? null,
    notes: asset ? `Base réelle livrée : ${asset.export}. ${asset.incarnation ?? ''}` : refusal ? 'Refus du générateur V7 ; aucun fichier livré, aucune relance.' : latest?.notes ?? latest?.reason ?? candidate.qualificationReason,
    referenceUrls: asset?.referenceUrls ?? latest?.referenceUrls ?? latest?.sourceUrls ?? [],
  };
});
const missing = candidateStates.filter(candidate => !candidate.accepted);
const uniqueNewStages = new Set(assets.filter(asset => asset.category === 'stage').map(asset => asset.runtimeStageId ?? asset.id));
const addedGallery = assets.filter(asset => !['stage', 'stage_layer', 'revision'].includes(asset.category));
const counts = {
  distinctDrawings: assets.length, newDrawings: assets.filter(asset => asset.category !== 'revision').length,
  revisedDrawings: assets.filter(asset => asset.category === 'revision').length,
  masterPng: assets.length, losslessWebp: assets.length,
  thumbnails: assets.filter(asset => asset.thumbnail).length,
  deliveredImageFiles: assets.reduce((sum, asset) => sum + 2 + Number(Boolean(asset.thumbnail)), 0),
  deliveredImageBytes: assets.reduce((sum, asset) => sum + asset.masterBytes + asset.exportBytes + (asset.thumbnail?.bytes ?? 0), 0),
  characterBases: assets.filter(asset => asset.category === 'character_base').length,
  enemyBases: assets.filter(asset => asset.category === 'enemy_base').length,
  supportBases: assets.filter(asset => asset.category === 'support_base').length,
  props: assets.filter(asset => asset.category === 'prop').length,
  projectiles: assets.filter(asset => asset.category === 'projectile').length,
  machines: assets.filter(asset => asset.category === 'machine').length,
  costumes: assets.filter(asset => asset.category === 'costume').length,
  narrativeArchives: assets.filter(asset => asset.category === 'narrative_archive').length,
  stages: uniqueNewStages.size, stageLayers: assets.filter(asset => asset.category === 'stage_layer').length,
  newGalleryEntries: addedGallery.length, generatorRefused: refused.length,
  generatedAwaitingReview: allGenerated.length - assets.length, newAnimationCycles: 0,
};
const cumulativeCounts = {
  ...baseline,
  standaloneBases: baseline.standaloneBases + bases.length,
  reserveStandaloneBases: baseline.reserveStandaloneBases + bases.length,
  catalogueIdsWithoutStandaloneBase: missing.length,
  distinctProductionIdentitiesWithoutStandaloneBase: new Set(missing.map(candidate => candidate.productionIdentityId)).size,
  reserveGalleryEntries: baseline.reserveGalleryEntries + addedGallery.length,
  activeStages: baseline.activeStages + uniqueNewStages.size,
};
const referenceSources = [];
for (const file of ['environment-references.json', 'hazbin-qualification.json', 'hazbin-qualification-extra.json', 'hazbin-variant-qualification.json', 'helluva-qualification.json']) {
  const data = await optional(file, {}); referenceSources.push(...(data.sources ?? []));
}
const knownUrls = new Set(referenceSources.map(source => source.url));
for (const url of [...new Set([...attempts.flatMap(attempt => attempt.referenceUrls ?? attempt.sourceUrls ?? []), ...qualificationRows.flatMap(row => row.referenceUrls ?? row.sourceUrls ?? [])])]) {
  if (knownUrls.has(url)) continue;
  knownUrls.add(url);
  referenceSources.push({ id: `V7-REF-${String(referenceSources.length + 1).padStart(3, '0')}`, url,
    kind: /youtube\.com/.test(url) ? 'official_episode_or_clip' : /twitter\.com\/CalisDraws/.test(url) ? 'official_production_artist' : 'supporting_reference',
    title: url, method: 'Voir les captures, l’attribution, les limites et le prompt dans le journal de génération correspondant.' });
}
// Hazbin and correction journals keep their references on asset rows.
for (const asset of assets) for (const url of asset.referenceUrls) {
  if (knownUrls.has(url)) continue; knownUrls.add(url);
  referenceSources.push({ id: `V7-REF-${String(referenceSources.length + 1).padStart(3, '0')}`, url,
    kind: /youtube\.com/.test(url) ? 'official_episode_or_clip' : /twitter\.com\/CalisDraws/.test(url) ? 'official_production_artist' : 'supporting_reference', title: url,
    method: 'Référence associée au master ; limites dans les journaux et la revue indépendante.' });
}
const references = { schemaVersion: 1, edition: 'V7', date: '2026-11-26', sources: referenceSources,
  assets: assets.map(asset => ({ id: asset.id, sourceIds: referenceSources.filter(source => asset.referenceUrls.includes(source.url)).map(source => source.id), remainingLimits: asset.fidelityNotes })) };
assert.equal(new Set(referenceSources.map(source => source.id)).size, referenceSources.length, 'Duplicate reference IDs.');
await fs.writeFile(path.join(here, 'references.json'), json(references));
const sourceFiles = [];
for (const file of ['catalogue-audit.json', ...ledgers.map(ledger => ledger.file), 'reviews-v7.json', 'references.json', 'environment-references.json', 'environment-audit.json', 'hazbin-qualification.json', 'hazbin-qualification-extra.json', 'hazbin-variant-qualification.json', 'helluva-qualification.json', 'helluva-reference-index.json']) {
  try { sourceFiles.push({ path: 'docs/standalone/production-v7/' + file, sha256: sha(await fs.readFile(path.join(here, file))) }); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const qa = await optional('validation.json', { status: 'final_validation_pending' });
const refusedVariantIds = new Set(refused.flatMap(attempt => attempt.variantRequirementIds ?? []));
const deliveredVariantIds = new Set(assets.flatMap(asset => asset.variantRequirementIds ?? []));
const variantStates = [
  ...(!assets.some(asset => asset.variantRequirementIds?.includes('VAR-010')) && !refusedVariantIds.has('VAR-010') ? [{ id: 'VAR-010', status: 'historical_delivery_not_found_after_repository_search', notes: 'Aucun fichier de costume racheté retrouvé dans les arbres HEAD b0e76e35, PR3 eaa8c6e2, standalone 2c4242d7 ou recovery ddb96484, ni les chemins locaux propres. Le souvenir de livraison ne constitue pas un asset vérifiable.' }] : []),
  ...[...refusedVariantIds].map(id => ({ id, status: 'generator_refused', notes: qualificationById.get(id)?.notes ?? 'Tentative statique V7 refusée ; aucun fichier livré, aucune relance.' })),
  ...[...qualificationById].filter(([id]) => id?.startsWith('VAR-') && id !== 'VAR-010' && !refusedVariantIds.has(id) && !deliveredVariantIds.has(id)).map(([id, row]) => ({ id, status: row.status, notes: row.notes ?? row.reason, referenceUrls: row.referenceUrls ?? [] })),
  ...assets.flatMap(asset => (asset.variantRequirementIds ?? []).map(id => ({ id, status: asset.variantCoverage === 'partial' ? 'partially_covered_static_variant' : 'accepted_static_candidate', notes: `Un dessin statique ${asset.id} ; aucun cycle ni kit ajouté.${asset.frameCoverage === 'bust' ? ' Buste narratif uniquement ; aucun corps entier livré.' : ''}${asset.variantCoverage === 'partial' ? ' Une seule forme qualifiée ; les autres phases ou formes restent manquantes.' : ''}`, assetId: asset.id, ...(asset.frameCoverage ? { frameCoverage: asset.frameCoverage } : {}), referenceUrls: asset.referenceUrls }))),
];
const environmentAudit = await optional('environment-audit.json', { deferrals: [] });
const remaining = {
  personalIllustrations: previous.remaining.personalIllustrations,
  personalIllustrationsStatus: previous.remaining.personalIllustrationsStatus,
  technicalReferenceGaps: [...new Set([...previous.remaining.technicalReferenceGaps, ...environmentAudit.deferrals.filter(row => ['machine', 'projectile'].includes(row.category) && !/refusal/.test(row.status)).map(row => row.id)])],
  stageReferenceGaps: [...new Set([...previous.remaining.stageReferenceGaps, ...environmentAudit.deferrals.filter(row => row.category === 'stage').map(row => row.id)])],
  partiallyCoveredPlannedStages: [...new Set([...previous.remaining.partiallyCoveredPlannedStages, ...assets.filter(asset => asset.category === 'stage').flatMap(asset => asset.planRequirementIds ?? []), ...(environmentAudit.planReconciliation ?? []).filter(row => row.category === 'stage_requirement' && row.acceptedVisualCoverage).map(row => row.id)])],
  partiallyCoveredPlannedStageDetails: [
    { id: 'vox-tower', visualStatus: 'specific_rooms_delivered', notes: 'Bureau de Vox S2 livré en V6 ; ne vaut pas reconstitution de toute la tour.' },
    ...(assets.some(asset => asset.runtimeStageId === 'sloth-hospital-exterior') ? [{ id: 'sloth-hospital', visualStatus: 'interior_and_exterior_delivered', notes: 'Salle d’attente V5 conservée et façade/parvis V7 effectivement livrés séparément. La lacune visuelle de façade est résolue. Vérification navigateur et performances mobiles encore manquantes.' }] : []),
    ...(assets.some(asset => asset.runtimeStageId === 'australia-desert-s3') ? [{ id: 'hb-australia', visualStatus: 'specific_desert_view_delivered', notes: 'Fond désert et deux objets V7 livrés. Le reste du lieu n’est pas reconstitué ; composition adaptée au combat, QA navigateur/mobile non exécutée.' }] : []),
    ...(assets.some(asset => asset.runtimeStageId === 'auction-glass-hall-s3') ? [{ id: 'hb-auction', visualStatus: 'partial_specific_hall_view', notes: 'Un hall vitré cyan livré avec banc et ornement séparés ; ni salle de vente complète ni carte globale. QA navigateur/mobile non exécutée.' }] : []),
    ...(environmentAudit.planReconciliation ?? []).filter(row => row.id === 'hb-ice-palace').map(row => ({ id: row.id, visualStatus: row.status, notes: row.notes })),
  ],
  environmentQualification: environmentAudit.deferrals,
  runtimeValidationGaps: ['browser_visual_gameplay_check', 'mobile_performance_check'],
  refusedThisWave: refused.map(attempt => attempt.id),
  characterReferenceGaps: missing.map(candidate => ({ id: candidate.sourceIdentityId, name: candidate.name, status: candidate.status, notes: candidate.notes })),
  limitations: ['Les 209 IDs incluent individus, groupes, pilote, AU et entrées futures.', 'Nouvelles réserves distinctes des 43 kits jouables.', 'Aucun nouveau cycle animé.', 'Les détails redessinés et les limites de chaque référence sont consignés. Fidélité 1:1 non certifiée.', 'Le navigateur reste indisponible ; voir browser-qa.json.'],
};
const result = { schemaVersion: 1, edition: 'V7', date: '2026-11-26', status: final ? 'final_production_register' : 'draft_production_register',
  repository: 'darknigthmare/hellbound-hotel-manager', branch: 'feat/infernal-versus-assets-20261124', prNumber: 8,
  baselineCommit: audit.baselineCommit, baseline, counts, cumulativeCounts, assets, candidateStates, variantStates,
  attempts: attempts.map(attempt => { const row = { ...attempt }; delete row.prompt; delete row.outputHint; return row; }),
  remaining, qa, sourceFiles, referenceSourceCount: knownUrls.size,
  independentReview: { path: 'docs/standalone/production-v7/reviews-v7.json', status: reviewFile.status }, fidelityOneToOneCertified: false,
};
if (final) {
  assert.equal(qa.status, 'passed', 'Final QA is not passed.');
  const catalogue = JSON.parse(await fs.readFile(path.join(root, 'art/infernal-versus/production/reserve-assets.json'), 'utf8'));
  assert.equal(catalogue.assets.length, cumulativeCounts.reserveGalleryEntries);
  for (const asset of assets.filter(asset => !['stage', 'stage_layer'].includes(asset.category))) {
    const entry = catalogue.assets.find(item => item.id === (asset.replacesAssetId ?? asset.id));
    assert.equal(entry?.export, asset.export, 'Unintegrated gallery asset: ' + asset.id);
  }
  const coverage = await read('active-asset-coverage.json');
  assert.equal(coverage.summary.stages, cumulativeCounts.activeStages);
  assert.equal(coverage.summary.brokenReferences.length, 0);
}
await fs.writeFile(path.join(here, 'delivery-register.json'), json(result));
console.log(json({ status: result.status, counts, cumulativeCounts }));
