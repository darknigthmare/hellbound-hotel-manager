import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Author only the V11 additions. The existing OOXML packer retains all 52
// historical worksheets, their relationships and tables byte for byte.
const args = process.argv.slice(2);
const option = (name, fallback) => {
  if (!args.includes(name)) return fallback;
  const value = args[args.indexOf(name) + 1];
  assert(value && !value.startsWith('--'), `Missing value for ${name}`);
  return value;
};
const modes = ['--inspect-baseline', '--validate', '--prepare', '--final'].filter(flag => args.includes(flag));
assert.equal(modes.length, 1, 'Choose --inspect-baseline, --validate, --prepare or --final.');
const mode = modes[0], final = mode === '--final';
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(option('--repo', path.join(here, '../../..')));
const workDir = path.resolve(option('--work-dir', path.join(os.tmpdir(), 'infernal-v11/workbook')));
const outputDir = path.resolve(option('--output-dir', path.join(os.tmpdir(), 'infernal-v11/workbook/output')));
const registerPath = path.resolve(option('--register', path.join(here, 'delivery-register.json')));
const baselinePath = path.join(repo, 'docs/standalone/INFERNAL_VERSUS_BIBLE_V10.xlsx');
const sourcePath = file => {
  assert(typeof file === 'string' && !path.isAbsolute(file), `Expected a repository-relative file: ${file}`);
  const resolved = path.resolve(repo, file);
  assert(resolved.startsWith(repo + path.sep), `File is outside repository: ${file}`);
  return resolved;
};
const hash = data => createHash('sha256').update(data).digest('hex');
const json = data => JSON.stringify(data, null, 2) + '\n';
const plain = value => value == null ? '' : Array.isArray(value) ? value.map(plain).filter(Boolean).join('\n') : typeof value === 'object' ? Object.entries(value).map(([key, item]) => `${key}: ${plain(item)}`).join('\n') : String(value);
const distinct = values => [...new Set(values.map(plain).filter(Boolean))];
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const checkpoint = phase => {
  const memory = process.memoryUsage();
  console.log(JSON.stringify({ phase, rssMiB: Math.round(memory.rss / 1048576), heapUsedMiB: Math.round(memory.heapUsed / 1048576) }));
};
const baseKinds = new Set(['character_base', 'support_base', 'enemy_base']);
const baselineCommit = '40c0ab9d12cdae867a131c59c25fd55da85dbafd';
const equivalentLocalBaselineCommit = '40c0ab9d12cdae867a131c59c25fd55da85dbafd';
const baselineWorkbookSha256 = 'f116bf8d5324b2a543852fb14d8c191882684647e73a04b14f9fbc14ce37737a';
assert.equal(hash(await fs.readFile(baselinePath)), baselineWorkbookSha256, 'The historical V10 workbook changed. Reconcile the baseline before authoring.');

let register, assets, checks, newBases, newlyCoveredCatalogueIds, newDrawings, revisions;
if (mode !== '--inspect-baseline') {
  register = await readJson(registerPath);
  assert.equal(register.edition, 'V11');
  assert.equal(register.baselineCommit, baselineCommit, 'V11 must identify the verified local V10 checkpoint.');
  assert.equal(register.equivalentLocalBaselineCommit, equivalentLocalBaselineCommit, 'V11 must identify the local V10 baseline.');
  assert.equal(register.fidelityOneToOneCertified, false, 'Do not certify visual fidelity through workbook generation.');
  if (final) assert.equal(register.status, 'final_production_register');
  assets = register.assets;
  assert(Array.isArray(assets) && assets.length, 'At least one accepted real asset is required.');
  assert.equal(new Set(assets.map(asset => asset.id)).size, assets.length, 'Duplicate delivery ID.');
  assert.equal(new Set(assets.map(asset => asset.masterSha256)).size, assets.length, 'Duplicate master pixels counted as drawings.');
  const previous = await readJson(path.join(repo, 'docs/standalone/production-v10/delivery-register.json'));
  for (const [key, value] of Object.entries(previous.cumulativeCounts)) {
    assert.equal(register.baseline[key], value, `V11 baseline differs from V10: ${key}`);
  }
  for (const asset of assets) {
    assert.equal(typeof asset.addsStandaloneBase, 'boolean', `Explicit full-base delta is required: ${asset.id}`);
    if (asset.addsStandaloneBase) {
      assert(baseKinds.has(asset.category), `Only a new autonomous character/support/enemy base may increase the base total: ${asset.id}`);
      assert.equal(asset.frameCoverage, 'full_body', `A bust or crop cannot close a full-base gap: ${asset.id}`);
    }
  }
  const newBaseAssets = assets.filter(asset => asset.addsStandaloneBase);
  for (const asset of newBaseAssets) {
    assert(typeof asset.sourceIdentityId === 'string' && asset.sourceIdentityId.trim(), `A new base needs its catalogue identity: ${asset.id}`);
    assert(typeof asset.productionIdentityId === 'string' && asset.productionIdentityId.trim(), `A new base needs its canonical production identity: ${asset.id}`);
    assert(Array.isArray(asset.newlyCoveredCatalogueIds) && asset.newlyCoveredCatalogueIds.includes(asset.sourceIdentityId), `A new base must enumerate the catalogue IDs actually covered: ${asset.id}`);
  }
  assert.equal(new Set(newBaseAssets.map(asset => asset.productionIdentityId)).size, newBaseAssets.length, 'Several drawings or aliases of the same identity cannot be counted as several new bases.');
  newlyCoveredCatalogueIds = newBaseAssets.flatMap(asset => asset.newlyCoveredCatalogueIds);
  assert.equal(new Set(newlyCoveredCatalogueIds).size, newlyCoveredCatalogueIds.length, 'A catalogue gap cannot be closed twice.');
  newBases = newBaseAssets.length;
  revisions = assets.filter(asset => asset.category === 'revision').length;
  newDrawings = assets.length - revisions;
  for (const asset of assets.filter(asset => asset.category === 'revision')) {
    assert(asset.replacesAssetId && asset.id !== asset.replacesAssetId, `Revision predecessor is required: ${asset.id}`);
  }
  const counts = register.counts, current = register.cumulativeCounts;
  assert.equal(counts.distinctDrawings, assets.length);
  assert.equal(counts.newDrawings ?? newDrawings, newDrawings);
  assert.equal(counts.revisedDrawings ?? revisions, revisions);
  assert.equal(counts.newStandaloneBases ?? newBases, newBases);
  assert.equal(counts.newlyCoveredCatalogueIds, newlyCoveredCatalogueIds.length);
  assert.equal(counts.masterPng, assets.length);
  assert.equal(counts.losslessWebp, assets.length);
  assert.equal(counts.thumbnails, assets.filter(asset => asset.thumbnail).length);
  assert.equal(counts.deliveredImageFiles, assets.reduce((sum, asset) => sum + 2 + Number(Boolean(asset.thumbnail)), 0));
  assert.equal(counts.newAnimationCycles, 0, 'This continuation covers static art.');
  assert.equal(counts.newPlayableKits, 0, 'A reserve base or costume does not create a playable kit.');
  assert.equal(current.activeFighters, register.baseline.activeFighters);
  assert.equal(current.standaloneBases, register.baseline.standaloneBases + newBases);
  const identityDelta = current.distinctProductionIdentitiesAfterKnownAlias - register.baseline.distinctProductionIdentitiesAfterKnownAlias;
  assert(Number.isInteger(identityDelta), 'Distinct-identity delta must be an integer.');
  assert.equal(current.distinctProductionIdentitiesWithoutStandaloneBase, register.baseline.distinctProductionIdentitiesWithoutStandaloneBase + identityDelta - newBases);
  assert.equal(current.catalogueIdsWithoutStandaloneBase, register.baseline.catalogueIdsWithoutStandaloneBase + current.catalogueIds - register.baseline.catalogueIds - newlyCoveredCatalogueIds.length, 'Catalogue gaps must account for aliases independently of distinct identities.');
  assert.equal(current.activeStandaloneBases + current.reserveStandaloneBases, current.standaloneBases, 'Active and reserve base totals do not reconcile.');
  assert(current.distinctProductionIdentitiesWithoutStandaloneBase >= 0, 'Missing-base count cannot be negative.');
  checks = [];
  for (const asset of assets) {
    assert(asset.accepted, `Unaccepted asset: ${asset.id}`);
    assert.notEqual(asset.fidelityOneToOneCertified, true, `Workbook generation does not certify fidelity: ${asset.id}`);
    assert.equal(asset.newAnimationCycles ?? asset.animationCycles ?? 0, 0, `Animation cannot be counted in this static continuation: ${asset.id}`);
    assert.equal(asset.pixelExactExport, true, `Missing lossless export evidence: ${asset.id}`);
    assert(asset.visualReview || asset.fidelityNotes?.length, `Missing review: ${asset.id}`);
    assert(Array.isArray(asset.referenceUrls) && asset.referenceUrls.length, `Missing source list: ${asset.id}`);
    for (const [file, expected] of [[asset.master, asset.masterSha256], [asset.export, asset.exportSha256], ...(asset.thumbnail ? [[asset.thumbnail.path, asset.thumbnail.sha256]] : [])]) {
      assert(file && /^[a-f\d]{64}$/.test(expected), `Missing file/hash: ${asset.id}`);
      const bytes = await fs.readFile(sourcePath(file));
      assert.equal(hash(bytes), expected, `File changed: ${file}`);
      checks.push({ path: file, sha256: expected, bytes: bytes.length });
    }
  }
  if (counts.deliveredImageBytes !== undefined) assert.equal(counts.deliveredImageBytes, checks.reduce((sum, item) => sum + item.bytes, 0));
  if (final) {
    assert.equal(register.qa?.status, 'passed');
    assert.equal(register.qa?.inGameChecked, true);
    assert(assets.every(asset => asset.inGameChecked), 'Every delivered asset needs explicit current browser coverage.');
  }
  for (const source of register.sourceFiles ?? []) {
    assert.equal(hash(await fs.readFile(sourcePath(source.path))), source.sha256, `Source changed: ${source.path}`);
  }
  if (mode === '--validate') {
    console.log(json({ status: 'register_files_verified', drawings: assets.length, imageFiles: checks.length, newBases, register: registerPath }));
    process.exit(0);
  }
}

assert(process.env.CODEX_PRIMARY_RUNTIME_NODE && path.resolve(process.execPath) === path.resolve(process.env.CODEX_PRIMARY_RUNTIME_NODE), 'Use CODEX_PRIMARY_RUNTIME_NODE.');
assert(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'CODEX_PRIMARY_RUNTIME_NODE_MODULES is required.');
assert(!workDir.startsWith(repo + path.sep), 'Authoring work directory must be outside the repository.');
assert(!outputDir.startsWith(repo + path.sep), 'Intermediate workbook output must be outside the repository.');
await fs.mkdir(workDir, { recursive: true });
try { await fs.lstat(path.join(workDir, 'node_modules')); }
catch { await fs.symlink(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, path.join(workDir, 'node_modules'), 'dir'); }
const require = createRequire(path.join(workDir, 'runtime-entry.mjs'));
const { FileBlob, SpreadsheetFile, Workbook } = await import(pathToFileURL(require.resolve('@oai/artifact-tool')).href);
if (mode === '--inspect-baseline') {
  const book = await SpreadsheetFile.importXlsx(await FileBlob.load(baselinePath));
  const inspected = await book.inspect({ kind: 'region', sheetId: 'Production V10', range: 'A1:E26', maxChars: 9000, tableMaxRows: 26, tableMaxCols: 5 });
  await fs.writeFile(path.join(workDir, 'baseline-inspection.ndjson'), inspected.ndjson);
  const preview = await book.render({ sheetName: 'Production V10', range: 'A1:E26', scale: 1, format: 'png' });
  await fs.writeFile(path.join(workDir, 'baseline-production-v10.png'), new Uint8Array(await preview.arrayBuffer()));
  console.log(json({ status: 'baseline_rendered', source: baselinePath, preview: path.join(workDir, 'baseline-production-v10.png') }));
  process.exit(0);
}

const palette = { ink: '#292332', burgundy: '#54233F', muted: '#665C68', gold: '#B38839', pale: '#F8F3F6' };
const names = ['Production V11', 'Cibles V11'];
const workbook = Workbook.create();
for (const name of names) workbook.worksheets.add(name);
const letter = index => String.fromCharCode(65 + index);
function sheet(name, title, subtitle, widths, end, headingColumns = widths.length) {
  const result = workbook.worksheets.getItem(name), last = letter(widths.length - 1), headingLast = letter(headingColumns - 1);
  result.showGridLines = false;
  result.getRange(`A1:${last}${end}`).format.font = { name: 'Arial', size: 11, color: palette.ink };
  widths.forEach((width, index) => { result.getRange(`${letter(index)}1:${letter(index)}${end}`).format.columnWidth = width; });
  result.getRange('A1').format.rowHeight = 12;
  result.getRange(`A2:${headingLast}2`).merge(); result.getRange('A2').values = [[title]];
  result.getRange(`A2:${headingLast}2`).format = { rowHeight: 31, font: { name: 'Arial', size: 16, bold: true, color: palette.burgundy } };
  result.getRange(`A3:${headingLast}3`).format = { rowHeight: 6, borders: { bottom: { style: 'thin', color: palette.gold } } };
  result.getRange(`A4:${headingLast}4`).merge(); result.getRange('A4').values = [[subtitle]];
  result.getRange(`A4:${headingLast}4`).format = { rowHeight: 33, wrapText: true, font: { name: 'Arial', size: 11, italic: true, color: palette.muted } };
  return result;
}
function table(target, start, headers, rows, widths, name) {
  assert(rows.length, `Empty table: ${name}`);
  const end = start + rows.length, last = letter(headers.length - 1);
  target.getRange(`A${start}:${last}${end}`).values = [headers, ...rows];
  const result = target.tables.add(`A${start}:${last}${end}`, true, name);
  result.style = 'TableStyleLight1'; result.showFilterButton = true;
  target.getRange(`A${start}:${last}${start}`).format = { fill: palette.burgundy, font: { name: 'Arial', size: 11, bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center', verticalAlignment: 'center', rowHeight: 34, wrapText: true };
  target.getRange(`A${start + 1}:${last}${end}`).format.wrapText = true;
  target.getRange(`A${start + 1}:${last}${end}`).format.verticalAlignment = 'top';
  for (const [index, row] of rows.entries()) {
    const lines = Math.max(...row.map((value, col) => plain(value).split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / (widths[col] * 1.25))), 0)));
    const height = Math.max(31, 14 * lines + 10);
    assert(height <= 409, `${name}: split long row ${index + 1} before export (${height}pt).`);
    const range = target.getRange(`A${start + index + 1}:${last}${start + index + 1}`);
    range.format.rowHeight = height;
    if (index % 2 === 0) range.format.fill = palette.pale;
  }
  return end;
}
const limits = asset => distinct([...(asset.visualReview?.limits ?? []), ...(asset.visualReview?.limitations ?? []), ...(asset.fidelityNotes ?? []), typeof asset.visualReview === 'string' ? asset.visualReview : '']).join('\n');
const deliveries = assets.map(asset => [
  `${asset.name}\n${asset.id}`, asset.category, 2 + Number(Boolean(asset.thumbnail)), Number(asset.addsStandaloneBase),
  distinct([asset.frameCoverage ? `Cadrage : ${asset.frameCoverage}` : '', asset.runtimeUsage, asset.continuity, asset.incarnation, asset.master, asset.export, asset.thumbnail?.path]).join('\n'),
  distinct([asset.referenceUrls.join('\n'), ...(asset.sourceReferences ?? asset.references ?? []).map(source => distinct([source.kind, source.publisher ?? source.title, source.role, source.nativeFrameDimensions ? `Source native : ${source.nativeFrameDimensions.join(' × ')}` : '']).join(' · '))]).join('\n'), limits(asset), `${asset.masterSha256}\n${asset.exportSha256}${asset.thumbnail ? '\n' + asset.thumbnail.sha256 : ''}`,
]);
const current = register.cumulativeCounts, previous = register.baseline, count = register.counts;
const summaryRows = [
  ['Dessins livrés', null, 'Nouveaux dessins et révisions, un master retenu par dessin.'],
  ['Nouveaux dessins', null, 'Les révisions restent comptées séparément.'],
  ['Révisions', null, 'Le fichier historique reste conservé.'],
  ['Fichiers image livrés', null, 'Masters PNG, exports WebP sans perte et miniatures.'],
  ['Nouvelles bases autonomes', null, 'Première silhouette complète d’une identité de production. Un buste ou une incarnation supplémentaire ne comble pas une base manquante.'],
  ['Bases au terme de V10', previous.standaloneBases, 'Point de départ vérifié dans le registre V10.'],
  ['Bases autonomes disponibles', null, 'Cumul des bases actives et en réserve.'],
  ['IDs du catalogue', current.catalogueIds, 'Individus, groupes, pilote, AU et entrées futures.'],
  ['IDs sans base autonome', current.catalogueIdsWithoutStandaloneBase, 'État courant issu du registre de production.'],
  ['Identités sans base après alias', current.distinctProductionIdentitiesWithoutStandaloneBase, 'Les alias connus ne deviennent pas de nouvelles identités.'],
  ['Galerie de réserve', current.reserveGalleryEntries, 'Éléments effectivement enregistrés, distincts des kits jouables.'],
  ['Arènes enregistrées', current.activeStages, 'Catalogue actif du standalone.'],
  ['Combattants actifs', current.activeFighters, 'Kits réellement jouables.'],
  ['Familles de costumes actives', current.runtimeCostumeFamilies, 'Familles sélectionnables en jeu.'],
  ['Scènes personnelles illustrées', current.illustratedPersonalScenes, `Sur ${current.personalScenes} scènes personnelles.`],
  ['Scènes globales illustrées', current.illustratedGlobalScenes, `Sur ${current.globalScenesIncludingBookends}, ouverture et fin comprises.`],
  ['Nouveaux cycles animés', count.newAnimationCycles, 'Lot de production statique.'],
  ['Refus de génération V11', count.generatorRefused ?? 0, 'Aucun fichier fictif n’est compté.'],
  ['Validation technique', register.qa?.status ?? 'Non exécutée', plain(register.qa?.summary ?? register.qa?.command ?? 'Résultats détaillés dans le registre V11.')],
  ['Contrôle visuel en jeu', register.qa?.inGameChecked === true ? 'Exécuté, voir la portée' : 'Non confirmé', plain(register.qa?.browserStatus ?? 'Aucune nouvelle validation navigateur documentée.')],
  ['Fidélité 1:1', 'Non certifiée', 'La provenance des références et les écarts de chaque dessin restent explicites.'],
];
const deliveryStart = 29, deliveryEnd = deliveryStart + deliveries.length;
const deliveryWidths = [39, 23, 14, 12, 78, 78, 100, 68];
const production = sheet(names[0], 'Infernal Versus — production statique V11', `${register.date}. ${final ? 'Registre final' : 'Préparation'}. Les 52 feuilles historiques V10 sont conservées.`, deliveryWidths, deliveryEnd, 5);
// Presentation cells, not a native table: the description spans C:E while
// the source delivery table below keeps its independent column headings.
production.getRange('A5:C26').values = [['Indicateur', 'Quantité / état', 'Portée'], ...summaryRows];
for (let row = 5; row <= 26; row++) {
  production.getRange(`C${row}:E${row}`).merge();
  const summary = summaryRows[row - 6];
  const summaryWidths = [deliveryWidths[0], deliveryWidths[1], deliveryWidths.slice(2, 5).reduce((sum, width) => sum + width, 0)];
  const summaryLines = summary ? Math.max(...summary.map((value, col) => plain(value).split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / (summaryWidths[col] * 1.25))), 0))) : 1;
  production.getRange(`A${row}:E${row}`).format = { wrapText: true, verticalAlignment: 'center', rowHeight: row === 5 ? 34 : Math.max(40, 14 * summaryLines + 10) };
  if (row > 5 && row % 2 === 0) production.getRange(`A${row}:E${row}`).format.fill = palette.pale;
}
production.getRange('A5:E5').format = { fill: palette.burgundy, font: { name: 'Arial', size: 11, bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center' };
production.getRange('A28:H28').merge(); production.getRange('A28').values = [['Livraisons V11 et références']];
production.getRange('A28').format = { font: { name: 'Arial', size: 13, bold: true, color: palette.burgundy }, rowHeight: 29 };
table(production, deliveryStart, ['Dessin', 'Nature', 'Fichiers', 'Bases +', 'Usage et chemins', 'Références qualifiées', 'Limites de la revue', 'SHA-256'], deliveries, deliveryWidths, 'StaticV11Deliveries');
production.tabColor = palette.burgundy;
const first = deliveryStart + 1;
const formulas = {
  B6: `=COUNTA(A${first}:A${deliveryEnd})`,
  B7: '=B6-B8',
  B8: `=COUNTIF(B${first}:B${deliveryEnd},"revision")`,
  B9: `=SUM(C${first}:C${deliveryEnd})`,
  B10: `=SUM(D${first}:D${deliveryEnd})`,
  B12: '=SUM(B10:B11)',
};
for (const [cell, formula] of Object.entries(formulas)) production.getRange(cell).formulas = [[formula]];
production.getRange('B6:B23').setNumberFormat('0');
production.getRange('B6:B23').format.horizontalAlignment = 'center';
production.getRange(`C${first}:D${deliveryEnd}`).setNumberFormat('0');
production.getRange(`C${first}:D${deliveryEnd}`).format.horizontalAlignment = 'center';

const targetRows = [];
for (const candidate of register.candidateStates ?? []) targetRows.push([candidate.sourceIdentityId ?? candidate.id, candidate.name ?? candidate.franchise ?? 'Identité', candidate.status, plain(candidate.notes), plain(candidate.referenceUrls)]);
for (const variant of register.variantStates ?? []) targetRows.push([variant.id, 'Variante', variant.status, plain(variant.notes), plain(variant.referenceUrls)]);
for (const stage of register.stageReconciliation ?? []) targetRows.push([
  stage.planId, 'Arène documentée', 'Partiel · décor statique',
  `${stage.currentStaticCoverage}\nRuntime : ${(stage.runtimeStageIds ?? []).join(', ')}.`,
  (stage.referenceUrls ?? []).join('\n'),
]);
const remaining = register.remaining ?? {};
for (const item of remaining.environmentQualification ?? []) targetRows.push([item.id, item.category ?? 'Environnement', item.status, distinct([item.notes, item.nextEvidence]).join('\n'), plain(item.referenceUrls)]);
const known = new Set(targetRows.map(row => row[0]));
for (const [field, category] of [['technicalReferenceGaps', 'Objet technique'], ['stageReferenceGaps', 'Décor'], ['personalIllustrations', 'Illustration'], ['runtimeValidationGaps', 'Vérification']]) {
  for (const id of remaining[field] ?? []) if (!known.has(id)) {
    targetRows.push([id, category, field === 'personalIllustrations' ? remaining.personalIllustrationsStatus ?? 'Non livré' : 'À compléter', 'État transmis par le registre V11.', path.relative(repo, registerPath)]);
    known.add(id);
  }
}
if (!targetRows.length) targetRows.push(['Aucune cible renseignée', '', 'Non évalué', 'Le registre ne fournit pas de liste de cibles. Ce n’est pas une preuve de complétude du catalogue.', path.relative(repo, registerPath)]);
const targetWidths = [36, 28, 44, 110, 90], targetEnd = targetRows.length + 5;
const targets = sheet(names[1], 'Cibles V11 — état et prochaines preuves', 'Les états et références viennent du registre V11. Une fiche ou une référence ne signifie pas qu’un dessin est livré ou qu’une mécanique est jouable.', targetWidths, targetEnd);
table(targets, 5, ['ID', 'Identité / catégorie', 'État du registre', 'Résultat ou action précise', 'Références'], targetRows, targetWidths, 'StaticV11Targets');
targets.freezePanes.freezeRows(5); targets.freezePanes.freezeColumns(1);

workbook.recalculate();
const expected = [assets.length, newDrawings, revisions, count.deliveredImageFiles, newBases, previous.standaloneBases, current.standaloneBases];
assert.deepEqual(production.getRange('B6:B12').values.flat(), expected);
const originalCategory = production.getRange(`B${first}`).values[0][0];
const originalFiles = production.getRange(`C${first}`).values[0][0];
const originalBaseDelta = production.getRange(`D${first}`).values[0][0];
production.getRange(`C${first}`).values = [[originalFiles + 1]]; workbook.recalculate();
assert.equal(production.getRange('B9').values[0][0], count.deliveredImageFiles + 1);
production.getRange(`C${first}`).values = [[originalFiles]];
production.getRange(`B${first}`).values = [['revision']]; workbook.recalculate();
assert.equal(production.getRange('B8').values[0][0], revisions + Number(originalCategory !== 'revision'));
production.getRange(`B${first}`).values = [[originalCategory]]; workbook.recalculate();
production.getRange(`D${first}`).values = [[originalBaseDelta + 1]]; workbook.recalculate();
assert.equal(production.getRange('B10').values[0][0], newBases + 1);
assert.equal(production.getRange('B12').values[0][0], current.standaloneBases + 1);
production.getRange(`D${first}`).values = [[originalBaseDelta]]; workbook.recalculate();
assert.deepEqual(production.getRange('B6:B12').values.flat(), expected);
const finalInspection = await workbook.inspect({ kind: 'region', sheetId: names[0], range: 'A5:C26', maxChars: 9000, tableMaxRows: 22, tableMaxCols: 3 });
await fs.writeFile(path.join(workDir, 'production-v11-inspection.ndjson'), finalInspection.ndjson);
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 100 }, maxChars: 5000 });
await fs.writeFile(path.join(workDir, 'formula-errors.ndjson'), errors.ndjson);
for (const [name, range] of [[names[0], `A1:H${deliveryEnd}`], [names[1], `A1:E${targetEnd}`]]) {
  assert(!workbook.worksheets.getItem(name).getRange(range).values.flat().some(value => typeof value === 'string' && /^#(?:REF!|DIV\/0!|VALUE!|NAME\?|N\/A|NUM!|NULL!|SPILL!|CALC!)/.test(value)), `Formula error in ${name}`);
}
const additions = path.join(workDir, 'infernal-v11-additions.xlsx');
checkpoint('exporting_v11_additions');
await (await SpreadsheetFile.exportXlsx(workbook)).save(additions);
checkpoint('reimporting_v11_additions');
const reimported = await SpreadsheetFile.importXlsx(await FileBlob.load(additions));
assert.deepEqual(reimported.worksheets.getItem(names[0]).getRange('B6:B12').values.flat(), expected);
const previews = path.join(workDir, 'previews'); await fs.mkdir(previews, { recursive: true });
const views = [{ sheetName: names[0], range: 'A1:E26', label: 'production' }];
for (let row = deliveryStart, part = 0; row <= deliveryEnd; row += 6, part++) {
  views.push({ sheetName: names[0], range: `A${row}:E${Math.min(row + 5, deliveryEnd)}`, label: `livraisons-usage-${part}` });
  views.push({ sheetName: names[0], range: `F${row}:H${Math.min(row + 5, deliveryEnd)}`, label: `livraisons-preuves-${part}` });
}
for (let row = 5, part = 0; row <= targetEnd; row += 6, part++) views.push({ sheetName: names[1], range: `A${part === 0 ? 1 : row}:E${Math.min(row + 5, targetEnd)}`, label: `cibles-${part}` });
for (const view of views) {
  checkpoint(`rendering_${view.label}`);
  const image = await reimported.render({ sheetName: view.sheetName, range: view.range, scale: 1, format: 'png' });
  view.file = path.join(previews, view.label + '.png');
  await fs.writeFile(view.file, new Uint8Array(await image.arrayBuffer()));
}
let output = additions, packaging = null;
if (final) {
  await fs.mkdir(outputDir, { recursive: true });
  output = path.join(outputDir, 'INFERNAL_VERSUS_BIBLE_V11.xlsx');
  const packageReport = path.join(here, 'workbook-package-report.json');
  const packaged = spawnSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON ?? 'python3', [path.join(repo, 'docs/standalone/append-production-workbook.py'), baselinePath, additions, output, packageReport, '52', names[0], 'rProductionV11'], { encoding: 'utf8' });
  assert.equal(packaged.status, 0, packaged.stderr || packaged.stdout);
  packaging = await readJson(packageReport);
  assert.equal(packaging.finalSheetCount, 54);
  assert.equal(packaging.preservedWorksheetXmlParts, 52);
  assert.equal(packaging.preservedTableXmlParts, 61);
  assert.deepEqual(packaging.originalPartsChangedUnexpectedly, []);
  assert.deepEqual(packaging.addedSheets, names);
  packaging.baseline = path.relative(repo, baselinePath);
  packaging.output = 'docs/standalone/INFERNAL_VERSUS_BIBLE_V11.xlsx';
  await fs.writeFile(packageReport, json(packaging));
  checkpoint('reimporting_final_v11_workbook');
  const finalBook = await SpreadsheetFile.importXlsx(await FileBlob.load(output));
  assert.deepEqual(finalBook.worksheets.getItem(names[0]).getRange('B6:B12').values.flat(), expected);
  await fs.copyFile(output, path.join(repo, 'docs/standalone/INFERNAL_VERSUS_BIBLE_V11.xlsx'));
}
const report = {
  schemaVersion: 1, edition: 'V11', date: register.date,
  builderSha256: hash(await fs.readFile(fileURLToPath(import.meta.url))),
  status: final ? 'final_workbook_exported_pending_visual_review' : 'draft_prepared_not_published',
  registerPath: path.relative(repo, registerPath), registerSha256: hash(await fs.readFile(registerPath)),
  inputRegisterStatus: register.status, deliveredImageFilesChecked: checks.length,
  deliveredImageSha256: checks, recalculation: 'Artifact Tool', inputChangeCheck: 'passed_change_recalculate_restore',
  formulaErrorCells: 0, formulaErrorScope: names, exportedAdditionsReimport: 'passed',
  nativeExcelRecalculation: 'not_run', historicalWorkbookAuthoring: 'none', packaging,
  renderedViews: views.map(({ file, ...view }) => ({ ...view, authoringPreviewRelativePath: path.relative(workDir, file) })),
  baseCounting: { source: 'Explicit addsStandaloneBase flags; full_body, unique canonical productionIdentityId and newlyCoveredCatalogueIds required for every true flag.', newStandaloneBases: newBases, newlyCoveredCatalogueIds, bustsNeverCloseFullBaseGaps: true, distinctIdentityDelta: current.distinctProductionIdentitiesAfterKnownAlias - previous.distinctProductionIdentitiesAfterKnownAlias },
  baselineCommit, equivalentLocalBaselineCommit, baselineWorkbookSha256,
  visualReview: 'pending_inspection_of_rendered_views',
  fidelityOneToOneCertified: false,
  output: final ? 'docs/standalone/INFERNAL_VERSUS_BIBLE_V11.xlsx' : path.relative(workDir, output),
};
await fs.writeFile(path.join(final ? here : workDir, 'workbook-qa.json'), json(report));
console.log(json({ status: report.status, output, drawings: assets.length, files: checks.length, renderedViews: views.length, preservedSheets: packaging?.preservedWorksheetXmlParts ?? null }));
