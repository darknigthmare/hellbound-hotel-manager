import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Artifact Tool authors only the three V7 sheets. The OOXML packer preserves
// every historical worksheet payload from the 43-sheet V6 reference workbook.
const args = process.argv.slice(2);
const arg = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(arg('--repo', path.join(here, '../../..')));
const workDir = path.resolve(arg('--work-dir', '/tmp/bible-v7-builder'));
const isFinal = args.includes('--final');
assert(process.env.CODEX_PRIMARY_RUNTIME_NODE && path.resolve(process.execPath) === path.resolve(process.env.CODEX_PRIMARY_RUNTIME_NODE), 'Use CODEX_PRIMARY_RUNTIME_NODE.');
assert(args.includes('--prepare') || isFinal || args.includes('--inspect-baseline'), 'Choose --prepare, --final or --inspect-baseline.');
assert(!(isFinal && args.includes('--prepare')), 'Choose one build mode.');
await fs.mkdir(workDir, { recursive: true });
const nodeModules = path.join(workDir, 'node_modules');
try { await fs.lstat(nodeModules); } catch { await fs.symlink(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, nodeModules, 'dir'); }
const require = createRequire(path.join(workDir, 'runtime-entry.mjs'));
const { FileBlob, SpreadsheetFile, Workbook } = await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
const sourceDir = path.join(repo, 'docs/standalone/production-v7');
const baselinePath = path.join(repo, 'docs/standalone/INFERNAL_VERSUS_BIBLE_V6.xlsx');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const json = value => JSON.stringify(value, null, 2) + '\n';
const plain = value => value == null ? '' : Array.isArray(value) ? value.map(plain).filter(Boolean).join('\n') : typeof value === 'object' ? Object.entries(value).map(([key, item]) => `${key}: ${plain(item)}`).join('\n') : String(value);
const unique = values => [...new Set(values.map(plain).filter(Boolean))];
if (args.includes('--inspect-baseline')) {
  const book = await SpreadsheetFile.importXlsx(await FileBlob.load(baselinePath));
  const inspected = await book.inspect({ kind: 'region', sheetId: 'Production V6', range: 'A1:C29', maxChars: 7000, tableMaxRows: 29, tableMaxCols: 3 });
  await fs.writeFile(path.join(workDir, 'baseline-inspection.ndjson'), inspected.ndjson);
  const preview = await book.render({ sheetName: 'Production V6', range: 'A1:C29', scale: 1, format: 'png' });
  await fs.writeFile(path.join(workDir, 'baseline-production-v6.png'), new Uint8Array(await preview.arrayBuffer()));
  console.log(json({ status: 'baseline_rendered', source: baselinePath }));
  process.exit(0);
}

const registerPath = path.join(sourceDir, 'delivery-register.json');
const registerBytes = await fs.readFile(registerPath), register = JSON.parse(registerBytes);
const audit = await readJson(path.join(sourceDir, 'catalogue-audit.json'));
const browser = await readJson(path.join(sourceDir, 'browser-qa.json'));
const references = await readJson(path.join(sourceDir, 'references.json'));
assert.equal(register.edition, 'V7');
assert.equal(register.fidelityOneToOneCertified, false);
if (isFinal) assert.equal(register.status, 'final_production_register');
const assets = register.assets;
assert(assets.length > 0, 'At least one real delivery is required.');
assert.equal(new Set(assets.map(asset => asset.id)).size, assets.length);
assert.equal(new Set(assets.map(asset => asset.masterSha256)).size, assets.length);
const baseCategories = new Set(['character_base', 'support_base', 'enemy_base']);
const newBases = assets.filter(asset => baseCategories.has(asset.category)).length;
const revisedDrawings = assets.filter(asset => asset.category === 'revision').length;
const newDrawings = assets.length - revisedDrawings;
const current = register.cumulativeCounts, baseline = register.baseline, counts = register.counts;
assert.equal(assets.length, counts.distinctDrawings);
assert.equal(counts.newDrawings ?? newDrawings, newDrawings);
assert.equal(counts.revisedDrawings ?? revisedDrawings, revisedDrawings);
for (const asset of assets.filter(asset => asset.category === 'revision')) assert(asset.replacesAssetId && asset.id !== asset.replacesAssetId, `Revision must retain its historical predecessor: ${asset.id}`);
assert.equal(counts.masterPng, assets.length);
assert.equal(counts.losslessWebp, assets.length);
assert.equal(counts.thumbnails, assets.filter(asset => asset.thumbnail).length);
assert.equal(counts.deliveredImageFiles, assets.reduce((sum, asset) => sum + 2 + Number(Boolean(asset.thumbnail)), 0));
assert.equal(counts.newAnimationCycles, 0);
assert.equal(current.standaloneBases, baseline.standaloneBases + newBases);
const fileChecks = [];
for (const asset of assets) {
  assert(asset.accepted, `Unaccepted asset: ${asset.id}`);
  assert.equal(asset.pixelExactExport, true, `Lossless pixels not verified: ${asset.id}`);
  assert(asset.visualReview || asset.fidelityNotes?.length, `Missing visual review: ${asset.id}`);
  for (const [file, expected] of [[asset.master, asset.masterSha256], [asset.export, asset.exportSha256], ...(asset.thumbnail ? [[asset.thumbnail.path, asset.thumbnail.sha256]] : [])]) {
    assert(file && expected, `Missing file/hash: ${asset.id}`);
    const actual = hash(await fs.readFile(path.join(repo, file)));
    assert.equal(actual, expected, `File changed: ${file}`);
    fileChecks.push({ path: file, sha256: actual });
  }
}
if (isFinal) {
  for (const source of register.sourceFiles) assert.equal(hash(await fs.readFile(path.join(repo, source.path))), source.sha256, `Frozen source changed: ${source.path}`);
  const reserve = await readJson(path.join(repo, 'art/infernal-versus/production/reserve-assets.json'));
  assert.equal(reserve.assets.length, current.reserveGalleryEntries);
}

const categoryLabel = category => ({ character_base: 'Base de personnage', support_base: 'Base de soutien', enemy_base: 'Base ennemie', narrative_archive: 'Archive narrative statique', machine: 'Machine', stage: 'Arène', stage_layer: 'Plan de décor', costume: 'Costume statique', projectile: 'Projectile statique', prop: 'Accessoire', revision: 'Révision de dessin' }[category] ?? category);
const continuityLabel = value => ({ season_1: 'Saison 1', season_2: 'Saison 2', season_3: 'Saison 3', simulation_au: 'Original AU', pilot_legacy: 'Pilote 2019', specials: 'Épisode spécial', future: 'Entrée future à qualifier' }[value] ?? value);
const statusLabel = status => ({
  accepted_static_candidate: 'Intégré', accepted: 'Intégré', generator_refused: 'Refus du générateur V7',
  reference_incomplete: 'Référence insuffisante', primary_scene_required: 'Référence à qualifier',
  historical_refusal_no_retry: 'Refus historique conservé', historical_policy_refusal_no_retry: 'Refus historique conservé',
  incarnation_definition_required_existing_pre_injury_base: 'Incarnation à préciser',
  mentioned_only_no_canonical_visual: 'Identité citée sans visuel', future_or_semi_canon_visual_unqualified: 'Future / semi-canon à qualifier',
  legacy_pilot_reference_required: 'Référence pilote à qualifier', known_reference_gap: 'Référence insuffisante',
  shared_identity_alias: 'Alias à rapprocher', generated_pending_review: 'À contrôler',
  planned_not_evidenced_as_delivered: 'Incarnation à qualifier', historical_delivery_to_locate_before_generation: 'Livraison ancienne à retrouver',
  partially_authored_pose_reference: 'Dessin existant à comparer', ambiguous_overlap_with_default: 'Différence avec la base à établir',
  composite_not_separate_identity: 'Composition de sujets existants', existing_default_incarnation: 'Incarnation de base existante',
  partially_covered_static_variant: 'Incarnation couverte en partie',
  primary_full_body_reference_required: 'Vue entière à qualifier',
  primary_details_obscured: 'Détails primaires masqués',
  deferred_insufficient_whole_animatronic_reference: 'Animatronique entier à qualifier',
  historical_delivery_not_found_after_repository_search: 'Ancienne livraison non retrouvée',
  crowd_identity_unresolved: 'Identité dans la foule à établir',
  episode_scope_not_covered_by_inspected_clips: 'Épisode hors extraits inspectés',
  exact_intro_scene_not_in_selected_song_clip: 'Scène d’introduction à examiner',
  finale_scene_not_in_selected_weapon_clip: 'Scène finale à examiner',
  group_view_not_resolved: 'Groupe à identifier',
  historical_portrait_incarnation_mismatch_unresolved: 'Portrait et incarnation à vérifier',
  identity_not_resolved_in_full_body_scene: 'Identité en pied à confirmer',
  incarnation_and_occlusion_gap: 'Incarnation et zones masquées',
  incarnation_clothing_conflict: 'Tenue de l’incarnation à clarifier',
  inherited_specific_reference_gap: 'Lacune de référence conservée',
  not_located_in_selected_primary_clips: 'Non situé dans les clips inspectés',
  press_group_identity_unresolved: 'Groupe de presse à identifier',
  primary_bed_occlusion: 'Corps masqué par le lit',
  primary_body_occluded_in_group: 'Corps masqué dans le groupe',
  primary_child_lower_body_occluded: 'Bas du corps masqué',
  primary_counter_occlusion: 'Corps masqué par le comptoir',
  primary_desk_occlusion: 'Corps masqué par le bureau',
  primary_details_resolution_gap: 'Détails trop peu résolus',
  primary_feet_cropped: 'Pieds hors cadre',
  primary_hem_and_edges_unresolved: 'Ourlet et contours à préciser',
  primary_identity_confirmed_lower_body_missing: 'Identité établie · corps partiel',
  primary_lower_body_cropped: 'Bas du corps hors cadre',
  primary_lower_body_occluded: 'Bas du corps masqué',
  primary_photo_cropped: 'Photographie cadrée partiellement',
  primary_subject_not_resolved: 'Sujet à identifier',
  primary_table_occlusion: 'Corps masqué par la table',
  primary_vehicle_occlusion: 'Corps masqué par le véhicule',
  reporter_identity_outfit_unresolved: 'Reporter et tenue à identifier',
  shared_alias_owned_by_root: 'Alias à rapprocher',
  staff_art_lower_body_gap: 'Dessin de l’équipe · corps partiel',
  wide_shot_identity_not_resolved: 'Identité en plan large à confirmer',
  variant_scope_undefined: 'Liste des incarnations à définir',
  primary_silhouette_incomplete: 'Silhouette primaire incomplète',
}[status] ?? status);
const reviewText = asset => {
  // The independently inspected limits are the readable workbook summary.
  // Full matched features, hashes and author notes remain in the traced register.
  const review = asset.visualReview;
  const limits = review?.limits?.length ? review.limits
    : review?.fidelityNotes?.length ? review.fidelityNotes
      : asset.fidelityNotes?.length ? asset.fidelityNotes
        : typeof review === 'string' ? [review] : [];
  return unique([review?.status ? 'Revue indépendante : adaptation statique avec limites.' : null, ...limits]).join('\n');
};
const sourceMap = new Map();
for (const source of references.sources ?? []) sourceMap.set(source.id, source);
for (const additional of register.referenceSources ?? []) if (!sourceMap.has(additional.id)) sourceMap.set(additional.id, additional);
const sources = [...sourceMap.values()];
const refByAsset = new Map((references.assets ?? []).map(asset => [asset.id, asset]));
const currentStates = new Map((register.candidateStates ?? []).map(candidate => [candidate.sourceIdentityId ?? candidate.id, candidate]));
const assetsByIdentity = new Map();
for (const asset of assets.filter(asset => baseCategories.has(asset.category))) {
  for (const id of unique([asset.sourceIdentityId, ...(asset.sourceIdentityIds ?? [])])) assetsByIdentity.set(id, asset);
}
const countedProductionIdentities = new Set();
const candidateData = audit.candidates.map(candidate => {
  const latest = currentStates.get(candidate.id), asset = assetsByIdentity.get(candidate.id);
  const covered = Boolean(asset || latest?.accepted);
  let state = statusLabel(latest?.status ?? candidate.qualificationStatus);
  if (covered) {
    state = countedProductionIdentities.has(candidate.productionIdentityId) ? 'Alias couvert' : 'Intégré';
    countedProductionIdentities.add(candidate.productionIdentityId);
  }
  const ref = refByAsset.get(candidate.id), urls = unique([...(asset?.referenceUrls ?? []), ...(latest?.referenceUrls ?? []), ...(ref?.sourceIds ?? []).map(id => sourceMap.get(id)?.url)]);
  return {
    id: candidate.id, state,
    row: [ `${candidate.name}\n${candidate.id}`, `${candidate.franchise}\n${continuityLabel(asset?.continuity ?? latest?.continuity ?? candidate.continuityInPlan)}`, state,
      unique(asset ? [asset.runtimeUsage, latest?.notes, reviewText(asset)] : [latest?.notes ?? candidate.qualificationReason]).join('\n'),
      unique([...(ref?.sourceIds ?? []), ...urls, ref?.limits, ref?.description]).join('\n') || 'Qualification documentaire du catalogue ; référence visuelle encore requise.' ],
  };
});
assert.equal(candidateData.filter(candidate => candidate.state === 'Intégré').length, newBases, 'Each new base must map to one previously missing production identity.');
assert.equal(candidateData.filter(candidate => !['Intégré', 'Alias couvert'].includes(candidate.state)).length, current.catalogueIdsWithoutStandaloneBase);
const variantState = new Map((register.variantStates ?? []).map(variant => [variant.id, variant]));
const variantRows = audit.variants.map(variant => {
  const delivered = assets.find(asset => (asset.variantRequirementIds ?? []).includes(variant.id));
  const latest = variantState.get(variant.id);
  const state = latest?.status === 'partially_covered_static_variant' ? statusLabel(latest.status)
    : delivered?.category === 'narrative_archive' ? (delivered.frameCoverage === 'bust' ? 'Archive livrée · buste' : 'Archive statique livrée')
      : delivered ? 'Incarnation statique livrée' : statusLabel(latest?.status ?? variant.currentState);
  return [variant.id, `${variant.fighter}\n${variant.name}`, state,
    unique([latest?.notes, delivered ? `${delivered.export}\n${reviewText(delivered)}`
      : [variant.reference, ...(latest?.referenceUrls ?? []), latest?.notes ? null : variant.auditNote].filter(Boolean).join('\n')]).join('\n')];
});
const sourceRows = sources.map(source => [
  `${source.id}${source.title ? '\n' + source.title : ''}`,
  `${source.kind ?? source.type ?? 'Référence'}\n${source.viewed || source.viewedFiles?.length || source.verifiedViews?.length ? 'Visuel inspecté' : 'Inspection détaillée dans le registre source'}`,
  unique([source.observations, source.evidence, source.limits, source.provenance, source.description, source.verified, source.confidence]).join('\n'), source.url,
]);
const knownUrls = new Set(sources.map(source => source.url));
for (const asset of assets) for (const url of asset.referenceUrls ?? []) if (!knownUrls.has(url)) {
  knownUrls.add(url);
  sourceRows.push([`livraison:${asset.id}`, 'Référence de la livraison', 'Portée et limites détaillées dans le registre de production.', url]);
}
if (!sourceRows.length) sourceRows.push(['Registre de production', 'Source du projet', 'Aucune URL de référence externe renseignée.', 'delivery-register.json']);
const plannedStageDetails = new Map((register.remaining.partiallyCoveredPlannedStageDetails ?? []).map(stage => [stage.id, stage]));
const remainingRows = [
  ...(register.remaining.technicalReferenceGaps ?? []).map(id => [id, 'Objet technique', 'Référence / production restant à compléter', 'delivery-register.json#remaining']),
  ...(register.remaining.stageReferenceGaps ?? []).map(id => [id, 'Décor', 'Référence du lieu restant à compléter', 'delivery-register.json#remaining']),
  ...(register.remaining.partiallyCoveredPlannedStages ?? []).map(id => [id, plannedStageDetails.get(id)?.visualStatus === 'interior_and_exterior_delivered' ? 'Décor livré · QA restante' : 'Décor partiel', plannedStageDetails.get(id)?.notes ?? 'Une vue existante ne couvre pas tout le lieu prévu.', 'delivery-register.json#remaining']),
  ...(register.remaining.personalIllustrations ?? []).map(id => [id, 'Illustration personnelle', 'Refus historique conservé ; aucune relance.', 'delivery-register.json#remaining']),
];
const proofPaths = unique(['docs/standalone/production-v7/delivery-register.json', 'docs/standalone/production-v7/catalogue-audit.json', 'docs/standalone/production-v7/references.json', 'docs/standalone/production-v7/browser-qa.json', ...register.sourceFiles.map(source => source.path), 'docs/standalone/INFERNAL_VERSUS_BIBLE_V6.xlsx']);
const sourceProofs = await Promise.all(proofPaths.map(async file => ({ path: file, sha256: hash(await fs.readFile(path.join(repo, file))) })));
assert.equal(sourceProofs[0].sha256, hash(registerBytes));
const traceRows = sourceProofs.map(source => [path.basename(source.path), source.path.endsWith('.xlsx') ? '43 feuilles historiques conservées' : 'Données de cette édition', source.path, source.sha256]);

const wb = Workbook.create(), sheetNames = ['Production V7', 'Cibles V7', 'Repères V7'];
for (const name of sheetNames) wb.worksheets.add(name);
const palette = { burgundy: '#54233F', ink: '#292332', muted: '#665C68', gold: '#B38839', pale: '#F8F3F6' };
const column = index => String.fromCharCode(65 + index), specs = [];
function beginSheet(name, title, note, widths, end) {
  const sheet = wb.worksheets.getItem(name), last = column(widths.length - 1);
  sheet.showGridLines = false;
  sheet.getRange(`A1:${last}${end}`).format.font = { name: 'Arial', size: 11, color: palette.ink };
  widths.forEach((width, index) => sheet.getRange(`${column(index)}1:${column(index)}${end}`).format.columnWidth = width);
  sheet.getRange(`A1:${last}1`).format.rowHeight = 12;
  sheet.getRange(`A2:${last}2`).merge(); sheet.getRange('A2').values = [[title]];
  sheet.getRange('A2').format.font = { name: 'Arial', size: 16, bold: true, color: palette.burgundy };
  sheet.getRange(`A2:${last}2`).format.rowHeight = 31;
  sheet.getRange(`A3:${last}3`).format.rowHeight = 6;
  sheet.getRange(`A3:${last}3`).format.borders = { bottom: { style: 'thin', color: palette.gold } };
  sheet.getRange(`A4:${last}4`).merge(); sheet.getRange('A4').values = [[note]];
  sheet.getRange(`A4:${last}4`).format = { font: { name: 'Arial', size: 11, italic: true, color: palette.muted }, wrapText: true, rowHeight: 34, verticalAlignment: 'center' };
  specs.push({ name, last, end }); return sheet;
}
function addTable(sheet, start, headers, rows, widths, name) {
  assert(rows.length, `Empty table: ${name}`);
  const last = column(headers.length - 1), end = start + rows.length;
  sheet.getRange(`A${start}:${last}${end}`).values = [headers, ...rows];
  const table = sheet.tables.add(`A${start}:${last}${end}`, true, name);
  table.style = 'TableStyleLight1'; table.showFilterButton = true;
  sheet.getRange(`A${start}:${last}${start}`).format = { fill: palette.burgundy, font: { name: 'Arial', size: 11, bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true, rowHeight: 34 };
  sheet.getRange(`A${start + 1}:${last}${end}`).format.wrapText = true;
  sheet.getRange(`A${start + 1}:${last}${end}`).format.verticalAlignment = 'top';
  for (const [index, row] of rows.entries()) {
    const lines = Math.max(...row.map((value, col) => plain(value).split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / (widths[col] * 0.76))), 0)));
    const height = Math.max(31, 16 * lines + 12);
    assert(height <= 409, `Text needs a separate row: ${name} row ${start + index + 1}, ${height}pt`);
    const range = sheet.getRange(`A${start + index + 1}:${last}${start + index + 1}`);
    range.format.rowHeight = height; if (index % 2 === 0) range.format.fill = palette.pale;
  }
  return end;
}
function heading(sheet, row, last, text) {
  sheet.getRange(`A${row}:${last}${row}`).merge(); sheet.getRange(`A${row}`).values = [[text]];
  sheet.getRange(`A${row}:${last}${row}`).format = { font: { name: 'Arial', size: 13, bold: true, color: palette.burgundy }, rowHeight: 29 };
}
const candidateWidths = [31, 24, 31, 100, 93], candidateEnd = candidateData.length + 5;
const candidates = beginSheet('Cibles V7', 'Cibles V7 — état des identités sans base au départ', 'Les 126 IDs initiaux restent visibles. Une référence « à qualifier » ne signifie pas qu’une inspection visuelle vient d’être réalisée. Les variantes distinctes figurent dans Repères V7.', candidateWidths, candidateEnd);
addTable(candidates, 5, ['Identité', 'Portée du catalogue', 'État courant', 'Résultat ou action précise', 'Références et limites'], candidateData.map(candidate => candidate.row), candidateWidths, 'StaticV7Candidates');
candidates.freezePanes.freezeRows(5); candidates.freezePanes.freezeColumns(1);
const deliveryRows = assets.map(asset => [ `${asset.name}\n${asset.id}`, 2 + Number(Boolean(asset.thumbnail)), `${categoryLabel(asset.category)} · ${continuityLabel(asset.continuity)} · ${asset.dimensions.join(' × ')} px\n${asset.runtimeUsage ?? ''}\nMaster : ${asset.master}\nExport : ${asset.export}${asset.thumbnail ? '\nMiniature : ' + asset.thumbnail.path : ''}\n${reviewText(asset)}` ]);
const summaryWidths = [48, 20, 118], deliveryStart = 35, deliveryEnd = deliveryStart + deliveryRows.length;
const summary = beginSheet('Production V7', 'Infernal Versus — production statique V7', `${register.date}. ${isFinal ? 'Registre final' : 'Brouillon non publié'}. Les 43 feuilles V6 restent archivées à l’identique.`, summaryWidths, deliveryEnd);
const summaryRows = [
  ['Dessins livrés dans cette continuation', null, 'Nouveaux dessins et révisions acceptées, chacun compté une fois. Les versions historiques restent archivées.'],
  ['Fichiers image livrés', null, 'PNG, WebP sans perte et éventuelles miniatures.'],
  ['Nouvelles bases de personnages', null, 'Un dessin par identité de production. Une couverture d’alias ne double pas ce nombre.'],
  ['Bases disponibles au terme de V6', baseline.standaloneBases, 'Point de départ de cette continuation.'],
  ['Bases autonomes disponibles', null, 'Cumul des bases actives et en réserve. Les costumes restent séparés.'],
  ['IDs du catalogue', current.catalogueIds, 'Individus, groupes, pilote, AU et entrées futures.'],
  ['IDs sans base autonome', null, 'Compte des lignes encore non couvertes dans Cibles V7.'],
  ['Identités après alias connu', current.distinctProductionIdentitiesAfterKnownAlias, 'Deux IDs Travis peuvent désigner une même identité ; incarnation à vérifier.'],
  ['Identités sans base après alias', null, 'Décompte distinct des IDs bruts du catalogue.'],
  ['Éléments de la galerie de réserve', current.reserveGalleryEntries, 'Bases, costumes, accessoires, projectiles et machines enregistrés.'],
  ['Arènes du catalogue', current.activeStages, 'Décors runtime ; ceux de saison 3 nécessitent une activation explicite dans les options.'],
  ['Combattants actifs', current.activeFighters, 'Kits jouables, distincts des illustrations en réserve.'],
  ['Familles de costumes actives', current.runtimeCostumeFamilies, 'Familles sélectionnables dans le jeu.'],
  ['Scènes personnelles illustrées', current.illustratedPersonalScenes, `Sur ${current.personalScenes} briefs personnels.`],
  ['Scènes globales illustrées', current.illustratedGlobalScenes, `Sur ${current.globalScenesIncludingBookends}, ouverture et fin comprises.`],
  ['IDs sans base au départ de V7', null, 'Les 126 fiches restent visibles dans Cibles V7.'],
  ['Refus du générateur dans V7', counts.generatorRefused ?? 0, 'Aucun fichier livré pour une demande refusée. Les refus précédents restent archivés.'],
  ['Refus identitaires historiques', null, 'Demandes identitaires déjà refusées avant cette continuation, conservées sans relance.'],
  ['Nouveaux cycles d’animation', counts.newAnimationCycles, 'Production statique uniquement.'],
  ['Objets techniques encore différés', register.remaining.technicalReferenceGaps?.length ?? 0, (register.remaining.technicalReferenceGaps ?? []).join(' · ')],
  ['Refus narratifs historiques', register.remaining.personalIllustrations?.length ?? 0, (register.remaining.personalIllustrations ?? []).join(' · ')],
  ['Contrôle visuel navigateur', browser.status === 'blocked_before_browser_launch' ? 'Bloqué' : browser.status, 'Chromium reste absent. Aucun duel desktop/mobile ni parcours de galerie observé. Voir browser-qa.json.'],
  ['Fidélité 1:1', 'Non certifiée', 'Les références, adaptations et écarts connus sont déclarés pour chaque livraison.'],
  ['Validation automatisée', isFinal && register.qa?.status === 'passed' ? 'Réussie' : 'À finaliser', isFinal && register.qa?.status === 'passed' ? `${register.qa.testsPassed} tests dans ${register.qa.testSuites} suites ; TypeScript et ESLint validés. ${register.qa.standardBuildStatus === 'environment_resource_failure_exit_137' ? 'Deux compilations réussies avec assemblage équivalent par liens physiques ; deux interruptions 137 du build standard sont conservées. Le script npm run qa standard entier n’est pas validé localement.' : 'Les deux builds sont réussis.'} Voir validation.json.` : 'Résultats courants dans le registre ; les contrôles de fichiers et de navigateur restent distincts.'],
  ['Nouveaux dessins', null, 'Nouveaux sujets, accessoires, costumes et plans de décor ; les révisions sont décomptées séparément.'],
  ['Dessins historiques révisés', null, 'Corrections dans de nouveaux fichiers. Aucune base ni entrée de galerie supplémentaire pour une révision.'],
  ['Archives narratives statiques', null, 'Incarnations destinées à la narration, en buste ou en pied. Elles restent séparées des nouvelles bases autonomes.'],
  ['Costumes statiques livrés', null, 'Incarnations alternatives produites dans cette continuation ; les familles sélectionnables en jeu sont comptées séparément.'],
];
addTable(summary, 5, ['Indicateur', 'Quantité / état', 'Portée'], summaryRows, summaryWidths, 'StaticV7Summary');
summary.tabColor = palette.burgundy; heading(summary, 34, 'C', 'Livraisons V7 — fichiers et usage');
addTable(summary, deliveryStart, ['Dessin', 'Fichiers', 'Usage, fichiers et revue visuelle'], deliveryRows, summaryWidths, 'StaticV7Deliveries');
const countCategoryRows = category => {
  const cells = assets.flatMap((asset, index) => asset.category === category ? [`A${deliveryStart + index + 1}`] : []);
  return cells.length ? `=COUNTA(${cells.join(',')})` : '=0';
};
const formulas = {
  B6: `=COUNTA(A${deliveryStart + 1}:A${deliveryEnd})`, B7: `=SUM(B${deliveryStart + 1}:B${deliveryEnd})`,
  B8: `=COUNTIFS('Cibles V7'!$C$6:$C$${candidateEnd},"Intégré")`, B10: '=SUM(B8:B9)',
  B12: `=COUNTIFS('Cibles V7'!$C$6:$C$${candidateEnd},"<>Intégré",'Cibles V7'!$C$6:$C$${candidateEnd},"<>Alias couvert")`,
  B14: '=B13-B10', B21: `=COUNTA('Cibles V7'!$A$6:$A$${candidateEnd})`,
  B23: `=COUNTIFS('Cibles V7'!$C$6:$C$${candidateEnd},"Refus historique conservé")`,
  B30: '=B6-B31', B31: countCategoryRows('revision'),
  B32: countCategoryRows('narrative_archive'),
  B33: countCategoryRows('costume'),
};
for (const [cell, formula] of Object.entries(formulas)) summary.getRange(cell).formulas = [[formula]];
summary.getRange('B6:B26').setNumberFormat('0"   "'); summary.getRange('B6:B26').format.horizontalAlignment = 'right';
summary.getRange('B30:B33').setNumberFormat('0"   "'); summary.getRange('B30:B33').format.horizontalAlignment = 'right';
summary.getRange(`B${deliveryStart + 1}:B${deliveryEnd}`).setNumberFormat('0"   "');
summary.getRange(`B${deliveryStart + 1}:B${deliveryEnd}`).format.horizontalAlignment = 'right';

const referenceWidths = [38, 34, 100, 93];
// Long documentary notes continue on a clearly labelled row. Keep the full
// text readable without exceeding Excel's 409-point row-height limit.
const sourceDisplayRows = sourceRows.flatMap(row => {
  const characters = Math.floor(referenceWidths[2] * 0.76);
  const lines = plain(row[2]).split('\n').flatMap(paragraph => {
    const result = []; let line = '';
    for (const word of paragraph.split(' ')) {
      if (line && line.length + word.length + 1 > characters) { result.push(line); line = word; }
      else line = line ? line + ' ' + word : word;
    }
    result.push(line); return result;
  });
  const parts = []; let part = [], used = 0;
  for (const line of lines) {
    const weight = Math.max(1, Math.ceil(line.length / (referenceWidths[2] * 0.76)));
    if (part.length && used + weight > 22) { parts.push(part.join('\n')); part = []; used = 0; }
    part.push(line); used += weight;
  }
  if (part.length) parts.push(part.join('\n'));
  return parts.map((note, index) => [`${row[0]}${index ? '\n(suite)' : ''}`, row[1], note, row[3]]);
});
const sections = [
  { title: null, name: 'StaticV7Sources', headers: ['Code / titre', 'Nature / inspection', 'Observations et limites', 'URL'], rows: sourceDisplayRows },
  { title: 'Variantes — incarnations statiques et limites', name: 'StaticV7Variants', headers: ['Exigence', 'Identité / variante', 'État actuel', 'Référence / résultat'], rows: variantRows },
  ...(remainingRows.length ? [{ title: 'Éléments encore différés', name: 'StaticV7Remaining', headers: ['ID', 'Catégorie', 'État courant', 'Preuve'], rows: remainingRows }] : []),
  { title: 'Traçabilité de cette édition', name: 'StaticV7Trace', headers: ['Fichier', 'Rôle', 'Chemin dans le dépôt', 'SHA-256'], rows: traceRows },
];
let cursor = 5;
for (const section of sections) { section.start = cursor; section.end = cursor + section.rows.length; cursor = section.end + 3; }
const repere = beginSheet('Repères V7', 'Repères V7 — références et incarnations', `${new Set(sources.map(source => source.url)).size} URL de référence et ${sourceMap.size} codes source. Les statuts historiques sont rapprochés des livraisons actuelles.`, referenceWidths, sections.at(-1).end);
for (const section of sections) {
  if (section.title) heading(repere, section.start - 1, 'D', section.title);
  addTable(repere, section.start, section.headers, section.rows, referenceWidths, section.name);
}
repere.freezePanes.freezeRows(5); repere.freezePanes.freezeColumns(1);

wb.recalculate();
const expected = [counts.distinctDrawings, counts.deliveredImageFiles, newBases, baseline.standaloneBases, current.standaloneBases, current.catalogueIds, current.catalogueIdsWithoutStandaloneBase, current.distinctProductionIdentitiesAfterKnownAlias, current.distinctProductionIdentitiesWithoutStandaloneBase, current.reserveGalleryEntries, current.activeStages, current.activeFighters, current.runtimeCostumeFamilies, current.illustratedPersonalScenes, current.illustratedGlobalScenes, audit.candidates.length, counts.generatorRefused ?? 0, candidateData.filter(candidate => candidate.state === 'Refus historique conservé').length, 0, register.remaining.technicalReferenceGaps?.length ?? 0, register.remaining.personalIllustrations?.length ?? 0];
assert.deepEqual(summary.getRange('B6:B26').values.flat(), expected, 'Summary differs from the production register.');
const drawingKindsExpected = [newDrawings, revisedDrawings, assets.filter(asset => asset.category === 'narrative_archive').length, assets.filter(asset => asset.category === 'costume').length];
assert.deepEqual(summary.getRange('B30:B33').values.flat(), drawingKindsExpected, 'New, revised, archive or costume counts differ.');
const changed = candidateData.findIndex(candidate => candidate.state === 'Intégré');
let inputChangeCheck = 'not_applicable_no_new_identity_base';
if (changed >= 0) {
  const cell = candidates.getRange(`C${changed + 6}`), before = cell.values[0][0];
  cell.values = [['À contrôler']]; wb.recalculate();
  assert.equal(summary.getRange('B8').values[0][0], newBases - 1);
  assert.equal(summary.getRange('B10').values[0][0], current.standaloneBases - 1);
  assert.equal(summary.getRange('B12').values[0][0], current.catalogueIdsWithoutStandaloneBase + 1);
  cell.values = [[before]]; wb.recalculate();
  assert.deepEqual(summary.getRange('B6:B26').values.flat(), expected);
  inputChangeCheck = 'passed_candidate_change_recalculate_restore';
}
for (const spec of specs) {
  const values = wb.worksheets.getItem(spec.name).getRange(`A1:${spec.last}${spec.end}`).values.flat();
  assert(!values.some(value => typeof value === 'string' && /^#(?:REF!|DIV\/0!|VALUE!|NAME\?|N\/A|NUM!|NULL!|SPILL!|CALC!)/.test(value)), `Formula error: ${spec.name}`);
}
const inspection = await wb.inspect({ kind: 'region', sheetId: 'Production V7', range: 'A5:C33', maxChars: 17000, tableMaxRows: 29, tableMaxCols: 3 });
await fs.writeFile(path.join(workDir, 'summary-inspection.ndjson'), inspection.ndjson);
const errorScan = await wb.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 100 }, maxChars: 4000 });
await fs.writeFile(path.join(workDir, 'formula-errors.ndjson'), errorScan.ndjson);
const additionsPath = path.join(workDir, isFinal ? 'infernal-v7-additions.xlsx' : 'infernal-v7-draft-additions.xlsx');
await (await SpreadsheetFile.exportXlsx(wb)).save(additionsPath);
let renderBook = await SpreadsheetFile.importXlsx(await FileBlob.load(additionsPath));
assert.deepEqual(renderBook.worksheets.getItem('Production V7').getRange('B6:B26').values.flat(), expected);
assert.deepEqual(renderBook.worksheets.getItem('Production V7').getRange('B30:B33').values.flat(), drawingKindsExpected);
let finalPath = null, packaging = null;
if (isFinal) {
  finalPath = path.join(repo, 'docs/standalone/INFERNAL_VERSUS_BIBLE_V7.xlsx');
  const packagingPath = path.join(sourceDir, 'workbook-package-report.json');
  const result = spawnSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON ?? 'python3', [path.join(repo, 'docs/standalone/append-production-workbook.py'), baselinePath, additionsPath, finalPath, packagingPath, '43', 'Production V7', 'rProductionV7'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  packaging = await readJson(packagingPath);
  assert.equal(packaging.finalSheetCount, 46); assert.equal(packaging.preservedWorksheetXmlParts, 43);
  assert.equal(Object.keys(packaging.preservedWorksheetSha256).length, 43);
  assert.deepEqual(packaging.addedSheets, sheetNames); assert.deepEqual(packaging.originalPartsChangedUnexpectedly, []);
  renderBook = await SpreadsheetFile.importXlsx(await FileBlob.load(finalPath));
  assert.deepEqual(renderBook.worksheets.getItem('Production V7').getRange('B6:B26').values.flat(), expected);
  assert.deepEqual(renderBook.worksheets.getItem('Production V7').getRange('B30:B33').values.flat(), drawingKindsExpected);
}
const previewDir = path.join(workDir, isFinal ? 'previews-final' : 'previews-draft');
await fs.mkdir(previewDir, { recursive: true });
const renderSpecs = [{ name: 'Production V7', range: 'A1:C33', label: 'production' }];
const addViews = (name, start, end, last, prefix, firstRow = start) => {
  for (let row = start, part = 0; row <= end; row += 7, part++) renderSpecs.push({ name, range: `A${part ? row : firstRow}:${last}${Math.min(row + 6, end)}`, label: `${prefix}-${part}` });
};
addViews('Production V7', deliveryStart, deliveryEnd, 'C', 'livraisons', 34);
addViews('Cibles V7', 5, candidateEnd, 'E', 'cibles', 1);
for (const section of sections) addViews('Repères V7', section.start, section.end, 'D', section.name, section.start === 5 ? 1 : section.start - 1);
const rendered = [];
for (const spec of renderSpecs) {
  const file = path.join(previewDir, spec.label + '.png');
  const image = await renderBook.render({ sheetName: spec.name, range: spec.range, scale: 1, format: 'png' });
  await fs.writeFile(file, new Uint8Array(await image.arrayBuffer()));
  rendered.push({ sheet: spec.name, range: spec.range, file });
}
const report = {
  schemaVersion: 1, date: register.date, status: isFinal ? 'final_workbook_exported_pending_visual_review' : 'draft_prepared_not_published',
  registerStatus: register.status, registerSha256: hash(registerBytes), inputSources: sourceProofs,
  newSheetNames: sheetNames, metrics: { ...counts, ...current }, summaryValues: expected,
  deliveredImageFilesChecked: fileChecks.length, deliveredImageSha256: fileChecks,
  recalculation: 'Artifact Tool', inputChangeCheck, nativeExcelRecalculation: 'not_run', formulaErrorCells: 0, formulaErrorScope: sheetNames,
  exportedAdditionsReimport: 'passed', historicalWorkbookAuthoring: 'none', packaging,
  renderedViews: rendered, visualReview: 'pending_inspection_of_rendered_views',
  browserValidation: { status: browser.status, report: 'docs/standalone/production-v7/browser-qa.json' },
  fidelityOneToOneCertified: false, output: finalPath ?? additionsPath,
};
await fs.writeFile(path.join(workDir, isFinal ? 'workbook-qa-final.json' : 'workbook-qa-draft.json'), json(report));
if (isFinal) await fs.writeFile(path.join(sourceDir, 'workbook-qa.json'), json(report));
console.log(json({ status: report.status, output: report.output, drawings: counts.distinctDrawings, files: counts.deliveredImageFiles, renderedViews: rendered.length, preservedSheets: packaging?.preservedWorksheetXmlParts ?? null }));
