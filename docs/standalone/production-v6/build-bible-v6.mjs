import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Use the primary document runtime. --prepare produces only a local draft.
// --final requires the frozen register and appends three sheets to the 40-sheet V5.
// Historical worksheets are packaged without being authored or re-exported.
const args = process.argv.slice(2);
const arg = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(arg('--repo', path.join(here, '../../..')));
const workDir = path.resolve(arg('--work-dir', '/tmp/bible-v6-builder'));
const isFinal = args.includes('--final');
const runtimeNode = process.env.CODEX_PRIMARY_RUNTIME_NODE;
assert(runtimeNode && path.resolve(process.execPath) === path.resolve(runtimeNode), 'Run with CODEX_PRIMARY_RUNTIME_NODE.');
assert(args.includes('--prepare') || isFinal || args.includes('--inspect-baseline'), 'Choose --prepare, --final or --inspect-baseline.');
assert(!(isFinal && args.includes('--prepare')), 'Choose one build mode.');
const require = createRequire(import.meta.url);
const artifactPath = require.resolve('@oai/artifact-tool', { paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES] });
const { FileBlob, SpreadsheetFile, Workbook } = await import(pathToFileURL(artifactPath).href);
const sourceDir = path.join(repo, 'docs/standalone/production-v6');
const baselinePath = path.join(repo, 'docs/standalone/INFERNAL_VERSUS_BIBLE_V5.xlsx');
await fs.mkdir(workDir, { recursive: true });
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = data => JSON.stringify(data, null, 2) + '\n';
const plain = value => value == null ? '' : Array.isArray(value) ? value.map(plain).filter(Boolean).join('\n') : typeof value === 'object' ? Object.entries(value).map(([key, entry]) => `${key}: ${plain(entry)}`).join('\n') : String(value);
const unique = values => [...new Set(values.filter(Boolean))];

if (args.includes('--inspect-baseline')) {
  const baseline = await SpreadsheetFile.importXlsx(await FileBlob.load(baselinePath));
  const overview = await baseline.inspect({ kind: 'region', sheetId: 'Production V5', range: 'A1:H20', maxChars: 6500, tableMaxRows: 20, tableMaxCols: 8 });
  await fs.writeFile(path.join(workDir, 'baseline-inspect.ndjson'), overview.ndjson);
  const preview = await baseline.render({ sheetName: 'Production V5', range: 'A1:H20', scale: 1, format: 'png' });
  await fs.writeFile(path.join(workDir, 'baseline-production-v5.png'), new Uint8Array(await preview.arrayBuffer()));
  console.log(json({ status: 'baseline_rendered', path: baselinePath }));
  process.exit(0);
}

const registerPath = path.join(sourceDir, 'delivery-register.json');
const registerBytes = await fs.readFile(registerPath);
const register = JSON.parse(registerBytes);
const audit = await readJson(path.join(sourceDir, 'qualification-audit.json'));
const references = await readJson(path.join(sourceDir, 'references.json'));
const hasSupplement = register.sourceFiles.some(s => s.path.endsWith('/references-supplement.json'));
const supplement = hasSupplement ? await readJson(path.join(sourceDir, 'references-supplement.json')) : { sources: [], assets: [] };
const allSources = [...references.sources, ...supplement.sources];
const referenceUrlCount = new Set(allSources.map(s => s.url)).size;
const browser = await readJson(path.join(sourceDir, 'browser-qa.json'));
assert.equal(register.edition, 'V6');
if (isFinal) assert.equal(register.status, 'final_production_register', 'Final workbook requires a frozen final production register.');
assert.equal(register.fidelityOneToOneCertified, false, 'This workbook does not certify 1:1 fidelity.');
assert.equal(register.candidateStates.length, audit.candidates.length);
assert.deepEqual(register.candidateStates.map(c => c.sourceIdentityId).sort(), audit.candidates.map(c => c.sourceIdentityId).sort());
assert.equal(new Set(register.assets.map(a => a.id)).size, register.assets.length);
assert.equal(new Set(register.assets.map(a => a.masterSha256)).size, register.assets.length, 'One new drawing per distinct master.');
assert(register.assets.every(a => a.accepted && a.status === 'accepted_static_candidate'));
assert(register.assets.every(a => a.newAnimationCycles === 0));
const assetById = new Map(register.assets.map(a => [a.id, a]));
const assetByIdentity = new Map(register.assets.filter(a => a.sourceIdentityId).map(a => [a.sourceIdentityId, a]));
const refByAsset = new Map(references.assets.map(a => [a.id, a]));
const sourceById = new Map(allSources.map(s => [s.id, s]));
const counts = register.counts;
const current = register.cumulativeCounts;
const base = register.baseline;
const newBases = register.assets.filter(a => ['character_base', 'support_base', 'enemy_base'].includes(a.category)).length;
assert.equal(register.assets.length, counts.distinctDrawings);
assert.equal(counts.masterPng, register.assets.length);
assert.equal(counts.losslessWebp, register.assets.length);
assert.equal(counts.thumbnails, register.assets.filter(a => a.thumbnail).length);
assert.equal(counts.deliveredImageFiles, register.assets.reduce((sum, a) => sum + 2 + Number(Boolean(a.thumbnail)), 0));
assert.equal(newBases, counts.characterBases + counts.supportBases);
assert.equal(current.standaloneBases, base.standaloneBases + newBases);
assert.equal(current.catalogueIdsWithoutStandaloneBase, current.catalogueIds - current.standaloneBases);
assert.equal(current.distinctProductionIdentitiesWithoutStandaloneBase, current.distinctProductionIdentitiesAfterKnownAlias - current.standaloneBases);
assert.equal(counts.generatorRefused, register.candidateStates.filter(c => c.status === 'generator_refused').length);
assert.equal(counts.candidatesAwaitingReference, register.candidateStates.filter(c => c.status === 'reference_incomplete').length);
assert.equal(hasSupplement ? referenceUrlCount : references.sources.length, register.referenceSourceCount);
assert.equal(register.candidateStates.filter(c => c.accepted).length, newBases);
for (const candidate of register.candidateStates) {
  if (candidate.accepted) assert(assetByIdentity.has(candidate.sourceIdentityId), `Accepted candidate has no delivery: ${candidate.sourceIdentityId}`);
  if (isFinal) assert(!/pending|progress/.test(candidate.status), `Unfinished final candidate: ${candidate.sourceIdentityId}`);
}
const fileChecks = [];
for (const asset of register.assets) {
  for (const [file, expected] of [[asset.master, asset.masterSha256], [asset.export, asset.exportSha256], ...(asset.thumbnail ? [[asset.thumbnail.path, asset.thumbnail.sha256]] : [])]) {
    assert(file && expected, `Missing file or hash: ${asset.id}`);
    const actual = hash(await fs.readFile(path.join(repo, file)));
    assert.equal(actual, expected, `File differs from the register: ${file}`);
    fileChecks.push({ path: file, sha256: actual });
  }
  assert.equal(asset.pixelExactExport, true, `Unverified lossless export: ${asset.id}`);
  assert(plain(asset.visualReview).trim(), `Missing visual review: ${asset.id}`);
}
if (isFinal) {
  for (const source of register.sourceFiles) assert.equal(hash(await fs.readFile(path.join(repo, source.path))), source.sha256, `Frozen source changed: ${source.path}`);
  const reserve = await readJson(path.join(repo, 'art/infernal-versus/production/reserve-assets.json'));
  assert.equal(reserve.assets.length, current.reserveGalleryEntries);
  for (const asset of register.assets.filter(a => a.category !== 'stage')) assert(reserve.assets.some(a => a.id === asset.id && a.export === asset.export), `Delivery missing from reserve: ${asset.id}`);
}

const stateLabel = status => ({ accepted_static_candidate: 'Intégré', generator_refused: 'Refus du générateur', reference_incomplete: 'Référence insuffisante', generated_pending_review: 'À contrôler' }[status] ?? status);
const categoryLabel = category => ({ character_base: 'Base de personnage', support_base: 'Base de soutien', enemy_base: 'Base ennemie', machine: 'Machine', stage: 'Arène' }[category] ?? category);
const continuityLabel = value => ({ season_1: 'Saison 1', season_2: 'Saison 2', simulation_au: 'Original AU', pilot_legacy: 'Pilote 2019' }[value] ?? value);
const referenceLabel = value => ({
  'reference-ready': 'Référence exploitable, limites indiquées',
  'reference-ready-with-eye-description': 'Silhouette documentée ; yeux décrits par le licencié',
  'specific-scene-visible-identity-attribution-partial': 'Egg Boi visible ; attribution à Frank partielle',
  'reference-ready-production-sheet-copy': 'Copie de planche attribuée ; recoupement épisode partiel',
  'partial-low-resolution': 'Image petite ou partiellement masquée',
  'improved-reference-still-limited': 'Silhouette mieux documentée ; détails limités',
  deferred: 'Production différée'
}[value] ?? value);
const sourceKind = value => ({
  'primary-official-episode': 'Épisode officiel',
  'secondary-host-episode-still': 'Photogramme, hébergeur secondaire',
  'primary-official-licensed-merchandise': 'Produit officiel sous licence',
  'primary-official-merchandise': 'Produit officiel',
  'primary-official-licensee-description': 'Description du licencié',
  'primary-official-clip': 'Extrait officiel',
  'primary-artist-production-statement': 'Déclaration de l’artiste',
  'secondary-host-copy-of-attributed-production-sheet': 'Planche attribuée, copie secondaire',
  'primary-artist-posted-episode-still': 'Image publiée par l’artiste',
  primary_official_clip: 'Extrait officiel',
  primary_official_episode: 'Épisode officiel',
  primary_official_pilot: 'Pilote officiel',
  secondary_reseller_photograph_of_licensed_trading_card: 'Carte sous licence, photo de revendeur',
  secondary_rehost_of_promotional_episode_still: 'Photogramme promotionnel, hébergeur secondaire',
  project_design: 'Conception AU du projet'
}[value] ?? value);
const reviewText = asset => {
  const review = asset.visualReview;
  const notes = review && typeof review === 'object' && !Array.isArray(review) && Array.isArray(review.fidelityNotes)
    ? review.fidelityNotes : [plain(review)];
  return unique([...notes, ...(asset.fidelityNotes ?? [])]).join('\n');
};
const candidateRows = register.candidateStates.map(c => {
  const asset = assetByIdentity.get(c.sourceIdentityId);
  const ref = refByAsset.get(c.sourceIdentityId);
  assert(ref, `Missing reference ledger entry: ${c.sourceIdentityId}`);
  for (const sourceId of ref.sourceIds) assert(sourceById.has(sourceId), `Unknown source: ${sourceId}`);
  const outcome = asset ? unique([asset.runtimeUsage, reviewText(asset)]).join('\n') : c.notes;
  return [
    `${c.name}\n${c.sourceIdentityId}`,
    `${c.franchise}\n${continuityLabel(c.continuity)}\n${categoryLabel(asset?.category ?? c.category)}`,
    stateLabel(c.status), outcome, ref.sourceIds.join('\n'),
    unique([referenceLabel(ref.status), ref.description, plain(ref.limits), ref.generationAdvice]).join('\n')
  ];
});
const sourceRows = allSources.map(s => [
  `${s.id}${s.title ? '\n' + s.title : ''}`,
  `${sourceKind(s.kind)}\n${s.viewed === false ? 'Texte seulement ; image non vue' : s.viewed || s.viewedFiles?.length || s.verifiedViews?.length ? 'Visuel inspecté' : 'Inspection non précisée'}`,
  unique([s.observations, ...(s.verifiedViews ?? []).map(v => `${v.clipSeconds} s : ${v.content}`), typeof s.viewed === 'string' ? s.viewed : null, s.limits, s.provenance, s.descriptionUse, s.verified, s.licenseEvidence, s.confidence]).join('\n'), s.url
]);
const urlsInLedger = new Set(allSources.map(s => s.url));
const extraUrls = new Map();
for (const a of register.assets) for (const url of a.referenceUrls ?? []) if (!urlsInLedger.has(url)) {
  const existing = extraUrls.get(url);
  if (existing) existing.assetIds.push(a.id);
  else extraUrls.set(url, { assetIds: [a.id], original: a.continuity === 'simulation_au' });
}
for (const [url, info] of extraUrls) sourceRows.push([
  `livraison:${info.assetIds.join(', ')}`, info.original ? 'Conception AU du projet' : 'Référence liée à la livraison',
  info.original ? 'Conception originale du projet. Cette source ne désigne pas un lieu canonique reproduit 1:1.' : 'URL inscrite au registre de livraison ; qualification détaillée dans ce registre.', url
]);
const stageRows = audit.stageReconciliation.map(s => [s.catalogueId, s.runtimeId ?? 'Aucun équivalent établi', ({
  same_location_runtime_alias: 'Même lieu, alias du catalogue : déjà couvert.',
  same_id_v5_delivered: 'Décor déjà livré en V5.',
  potential_overlap_requires_location_comparison: 'Chevauchement possible. Ne pas compter un manque avant de démontrer un lieu ou une vue distincte.',
  unverified_future_catalogue_claim: 'Entrée future non vérifiée. Référence primaire nécessaire avant production canonique.'
}[s.relation] ?? s.decision), s.evidence]);
for (const row of stageRows) if (register.remaining.partiallyCoveredPlannedStages?.includes(row[0])) row[2] += ' Cette vue ne couvre pas nécessairement tous les espaces prévus au plan.';
for (const id of unique([...(register.remaining.stageReferenceGaps ?? []), ...(register.remaining.partiallyCoveredPlannedStages ?? [])])) {
  if (stageRows.some(row => row[0] === id)) continue;
  const ref = supplement.assets.find(a => a.id === id);
  const urls = (ref?.sourceIds ?? []).map(sourceId => sourceById.get(sourceId)?.url).filter(Boolean);
  const delivered = register.assets.find(a => a.category === 'stage' && a.referenceUrls.some(url => urls.includes(url)));
  stageRows.push([id, delivered?.id ?? 'Aucun équivalent établi', delivered ? `Couverture partielle : ${delivered.name}.\n${reviewText(delivered)}` : unique([ref?.recommendation, ...(ref?.remainingLimits ?? []), !ref ? 'Référence insuffisante dans le registre courant.' : null]).join('\n'), (ref?.sourceIds ?? []).join('\n') || 'delivery-register.json#remaining']);
}
const variantRows = audit.currentVariantReconciliation.map(v => [v.id, `${v.fighter}\n${v.name}`, `${v.currentState === 'existing_default_incarnation' ? 'Incarnation de base déjà existante' : v.currentState}\nNe pas régénérer comme manque.`, unique([v.currentExport, v.evidence]).join('\n')]);
const technicalRows = audit.technicalDeferrals.map(t => {
  const asset = assetById.get(t.id);
  const ref = refByAsset.get(t.id);
  return [t.id, asset ? 'Intégré en réserve' : 'Différé', asset ? reviewText(asset) : [...t.reason, `Référence attendue : ${t.nextEvidence}`].join('\n'), ref?.sourceIds?.join('\n') ?? t.sourceUrl];
});
const identityRows = [
  ...audit.sharedAliases.map(a => [a.catalogueIds.join('\n'), a.productionIdentityId, 'Alias de production réutilisable uniquement pour la même incarnation.', 'qualification-audit.json#sharedAliases']),
  ...audit.identitiesToKeepDistinct.map(a => [a.ids.join('\n'), 'Identités distinctes', a.reason, 'qualification-audit.json#identitiesToKeepDistinct'])
];
const proofPaths = unique(['docs/standalone/production-v6/delivery-register.json', ...register.sourceFiles.map(s => s.path), 'docs/standalone/production-v6/browser-qa.json']);
const sourceProofs = await Promise.all(proofPaths.map(async file => ({ path: file, sha256: hash(await fs.readFile(path.join(repo, file))) })));
assert.equal(sourceProofs[0].sha256, hash(registerBytes), 'Register changed while preparing the workbook.');
sourceProofs.push({ path: 'docs/standalone/INFERNAL_VERSUS_BIBLE_V5.xlsx', sha256: hash(await fs.readFile(baselinePath)) });
const traceRows = sourceProofs.map(s => [path.basename(s.path), s.path.endsWith('delivery-register.json') ? (isFinal ? 'Registre final gelé' : 'Instantané provisoire') : s.path.endsWith('.xlsx') ? '40 feuilles historiques' : 'Données source', s.path, s.sha256]);

const wb = Workbook.create();
const sheetNames = ['Production V6', 'Cibles V6', 'Repères V6'];
for (const name of sheetNames) wb.worksheets.add(name);
const palette = { burgundy: '#54233F', ink: '#292332', muted: '#665C68', gold: '#B38839', pale: '#F8F3F6' };
const column = index => String.fromCharCode(65 + index);
const specs = [];
function beginSheet(name, title, note, widths, end) {
  const sheet = wb.worksheets.getItem(name), last = column(widths.length - 1);
  sheet.showGridLines = false;
  sheet.getRange(`A1:${last}${end}`).format.font = { name: 'Arial', size: 11, color: palette.ink };
  widths.forEach((width, i) => sheet.getRange(`${column(i)}1:${column(i)}${end}`).format.columnWidth = width);
  sheet.getRange(`A1:${last}1`).format.rowHeight = 12;
  sheet.getRange(`A2:${last}2`).merge();
  sheet.getRange('A2').values = [[title]];
  sheet.getRange('A2').format.font = { name: 'Arial', size: 16, bold: true, color: palette.burgundy };
  sheet.getRange(`A2:${last}2`).format.rowHeight = 31;
  sheet.getRange(`A3:${last}3`).format.rowHeight = 6;
  sheet.getRange(`A3:${last}3`).format.borders = { bottom: { style: 'thin', color: palette.gold } };
  sheet.getRange(`A4:${last}4`).merge();
  sheet.getRange('A4').values = [[note]];
  sheet.getRange(`A4:${last}4`).format = { font: { name: 'Arial', size: 11, italic: true, color: palette.muted }, wrapText: true, rowHeight: 34, verticalAlignment: 'center' };
  specs.push({ name, last, end });
  return sheet;
}
function addTable(sheet, start, headers, rows, widths, name) {
  assert(rows.length > 0, `Table must have data: ${name}`);
  const last = column(headers.length - 1), end = start + rows.length;
  sheet.getRange(`A${start}:${last}${end}`).values = [headers, ...rows];
  const t = sheet.tables.add(`A${start}:${last}${end}`, true, name);
  t.style = 'TableStyleLight1'; t.showFilterButton = true;
  sheet.getRange(`A${start}:${last}${start}`).format = { fill: palette.burgundy, font: { name: 'Arial', size: 11, bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true, rowHeight: 34 };
  sheet.getRange(`A${start + 1}:${last}${end}`).format.wrapText = true;
  sheet.getRange(`A${start + 1}:${last}${end}`).format.verticalAlignment = 'top';
  for (const [index, row] of rows.entries()) {
    const lines = Math.max(...row.map((value, i) => plain(value).split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / (widths[i] * 0.76))), 0)));
    const height = Math.max(31, 16 * lines + 12);
    assert(height <= 409, `Row exceeds Excel height limit: ${name} row ${index + start + 1}`);
    const range = sheet.getRange(`A${start + index + 1}:${last}${start + index + 1}`);
    range.format.rowHeight = height;
    if (index % 2 === 0) range.format.fill = palette.pale;
  }
  return end;
}
function sectionHeading(sheet, row, last, text) {
  sheet.getRange(`A${row}:${last}${row}`).merge();
  sheet.getRange(`A${row}`).values = [[text]];
  sheet.getRange(`A${row}:${last}${row}`).format = { font: { name: 'Arial', size: 13, bold: true, color: palette.burgundy }, rowHeight: 29 };
}

const candidateWidths = [28, 25, 25, 72, 42, 78];
const candidates = beginSheet('Cibles V6', 'Cibles V6 · identité, référence et résultat', `${register.candidateStates.length} identités. États du registre ${isFinal ? 'final' : 'provisoire'} ; les nouvelles bases restent en réserve. Les codes source renvoient à Repères V6.`, candidateWidths, 5 + candidateRows.length);
addTable(candidates, 5, ['Identité', 'Incarnation / catégorie', 'État de production', 'Résultat et écarts déclarés', 'Codes source', 'Qualification de la référence'], candidateRows, candidateWidths, 'StaticV6Candidates');
candidates.freezePanes.freezeRows(5); candidates.freezePanes.freezeColumns(1);
const candidateEnd = 5 + candidateRows.length;

const deliveryRows = register.assets.map(a => [
  `${a.name}\n${a.id}`, 2 + Number(Boolean(a.thumbnail)),
  `${categoryLabel(a.category)} · ${continuityLabel(a.continuity)} · ${a.dimensions.join(' × ')} px\n${a.runtimeUsage}\nMaster : ${a.master}\nExport : ${a.export}${a.thumbnail ? '\nMiniature : ' + a.thumbnail.path : ''}\n${reviewText(a)}`
]);
assert(deliveryRows.length > 0, 'At least one actual delivery is required for this edition.');
const deliveryStart = 32, deliveryEnd = deliveryStart + deliveryRows.length;
const summaryWidths = [48, 18, 110];
const summary = beginSheet('Production V6', 'Infernal Versus · Production statique V6', `${register.date} · ${isFinal ? 'Registre final' : 'BROUILLON — registre non gelé'}. Les 40 feuilles V5 sont conservées comme historique ; les trois vues V6 donnent l’état courant.`, summaryWidths, deliveryEnd);
const browserBlocked = browser.status === 'blocked_before_browser_launch';
const summaryRows = [
  ['Nouveaux dessins du lot', null, 'Dessins distincts dont le master PNG et l’export WebP sont présents et contrôlés.'],
  ['Fichiers image livrés', null, 'Master, export et éventuelle miniature. Une miniature ne compte pas comme un nouveau dessin.'],
  ['Nouvelles bases en réserve', null, 'Identités intégrées dans Cibles V6. Aucune ne devient un kit de combat par cette livraison.'],
  ['Bases disponibles au terme de V5', base.standaloneBases, 'Point de départ historique conservé dans la bible V5.'],
  ['Bases autonomes disponibles', null, 'Bases actives et bases en réserve, cumul après ajout des bases de cette vague.'],
  ['IDs du catalogue', current.catalogueIds, 'Le catalogue comprend individus, groupes, pilote, AU et entrées futures.'],
  ['IDs sans base autonome', null, 'Écart du catalogue ; aucune promesse de rendre toutes ces entrées jouables.'],
  ['Identités après alias connu', current.distinctProductionIdentitiesAfterKnownAlias, 'Travis : deux IDs réconciliés sous condition de même incarnation. Voir Repères V6.'],
  ['Identités sans base après alias', null, 'Décompte de production après l’alias connu ; les groupes et entrées futures restent dans ce périmètre.'],
  ['Éléments de la galerie de réserve', current.reserveGalleryEntries, 'Décompte du registre de galerie : bases, costumes, projectiles et machines.'],
  ['Arènes sélectionnables', current.activeStages, 'Catalogue runtime actuel. Les décors originaux AU sont identifiés dans les livraisons.'],
  ['Combattants actifs', current.activeFighters, 'Roster jouable courant, distinct des bases en réserve.'],
  ['Familles de costumes actives', current.runtimeCostumeFamilies, 'Familles sélectionnables déjà intégrées ; réconciliation des variantes dans Repères V6.'],
  ['Scènes personnelles illustrées', current.illustratedPersonalScenes, `Sur ${current.personalScenes} briefs personnels. Les images historiques V1 ne comblent pas les briefs V3.`],
  ['Scènes globales illustrées', current.illustratedGlobalScenes, `Sur ${current.globalScenesIncludingBookends} images, ouverture et fin comprises.`],
  ['Cibles identitaires de la vague', null, 'Liste complète dans Cibles V6, y compris les cibles refusées ou sans référence suffisante.'],
  ['Refus du générateur dans la vague', null, 'Aucun fichier livré pour ces cibles. Refus conservés, sans relance.'],
  ['Cibles avec référence insuffisante', null, 'Lacunes visibles dans Cibles V6 ; elles ne sont pas comptées comme dessins produits.'],
  ['Nouveaux cycles d’animation', counts.newAnimationCycles, 'Lot statique. Aucune nouvelle animation, technique ou finition.'],
  ['Objets techniques encore différés', register.remaining.technicalReferenceGaps.length, register.remaining.technicalReferenceGaps.join(' · ')],
  ['Refus narratifs historiques', register.remaining.personalIllustrations.length, register.remaining.personalIllustrations.join(' · ')],
  ['Contrôle visuel navigateur', browserBlocked ? 'Bloqué' : browser.status, browserBlocked ? 'Binaire Chromium absent ; téléchargement officiel Playwright refusé (HTTP 403). Aucun duel desktop/mobile observé. Voir browser-qa.json.' : 'Périmètre et résultats détaillés dans browser-qa.json.'],
  ['Fidélité 1:1', 'Non certifiée', 'Les limites de référence et les écarts visuels sont déclarés. Les contrôles de fichiers ne certifient pas une correspondance canonique exacte.'],
  ['Validation automatisée', isFinal ? (register.qa.status === 'passed' ? 'Réussie' : plain(register.qa.status)) : 'À finaliser', isFinal && register.qa.status === 'passed' ? `${register.qa.testsPassed} tests dans ${register.qa.testSuites} fichiers ; TypeScript, ESLint et les deux builds réussis. Détails dans validation.json ; contrôle navigateur séparé.` : 'Résultats et périmètre détaillés dans delivery-register.json#qa ; le contrôle navigateur reste séparé.']
];
addTable(summary, 5, ['Indicateur', 'Quantité / état', 'Portée'], summaryRows, summaryWidths, 'StaticV6Summary');
summary.tabColor = palette.burgundy;
sectionHeading(summary, 31, 'C', 'Livraisons V6 · fichiers réels et usage');
addTable(summary, deliveryStart, ['Dessin', 'Fichiers', 'Usage, fichiers et revue visuelle'], deliveryRows, summaryWidths, 'StaticV6Deliveries');
const formulas = {
  B6: `=COUNTA(A${deliveryStart + 1}:A${deliveryEnd})`, B7: `=SUM(B${deliveryStart + 1}:B${deliveryEnd})`,
  B8: `=COUNTIFS('Cibles V6'!$C$6:$C$${candidateEnd},"Intégré")`, B10: '=SUM(B8:B9)',
  B12: '=B11-B10', B14: '=B13-B10', B21: `=COUNTA('Cibles V6'!$A$6:$A$${candidateEnd})`,
  B22: `=COUNTIFS('Cibles V6'!$C$6:$C$${candidateEnd},"Refus du générateur")`,
  B23: `=COUNTIFS('Cibles V6'!$C$6:$C$${candidateEnd},"Référence insuffisante")`
};
for (const [cell, formula] of Object.entries(formulas)) summary.getRange(cell).formulas = [[formula]];
summary.getRange('B6:B26').setNumberFormat('0"   "'); summary.getRange('B6:B26').format.horizontalAlignment = 'right';
summary.getRange(`B${deliveryStart + 1}:B${deliveryEnd}`).setNumberFormat('0"   "');
summary.getRange(`B${deliveryStart + 1}:B${deliveryEnd}`).format.horizontalAlignment = 'right';

const referenceWidths = [38, 31, 100, 86];
const sections = [
  { title: null, name: 'StaticV6References', headers: ['Code / titre', 'Nature / inspection', 'Observations et limites', 'URL'], rows: sourceRows },
  { title: 'Arènes · alias et lieux à qualifier', name: 'StaticV6StageAliases', headers: ['ID du catalogue', 'ID runtime', 'Décision actuelle', 'Preuve'], rows: stageRows },
  { title: 'Variantes · exigences déjà couvertes', name: 'StaticV6Variants', headers: ['Exigence', 'Identité / variante', 'État actuel', 'Export et preuve'], rows: variantRows },
  { title: 'Objets techniques · résultat actuel', name: 'StaticV6Technical', headers: ['ID', 'État de production', 'Résultat ou référence manquante', 'Codes source'], rows: technicalRows },
  { title: 'Identités · alias et distinctions à conserver', name: 'StaticV6Identities', headers: ['IDs du catalogue', 'Identité de production', 'Règle de réconciliation', 'Preuve'], rows: identityRows },
  { title: 'Traçabilité · sources de cette édition', name: 'StaticV6Trace', headers: ['Fichier', 'Rôle', 'Chemin dans le dépôt', 'SHA-256'], rows: traceRows }
];
let cursor = 5;
for (const section of sections) {
  section.start = cursor;
  section.end = cursor + section.rows.length;
  cursor = section.end + 3;
}
const repereEnd = sections.at(-1).end;
const repere = beginSheet('Repères V6', 'Repères V6 · références, variantes et alias', `${referenceUrlCount} URL de référence, ${allSources.length} codes source et ${extraUrls.size} lien(s) de livraison. Nature et limites conservées ; les observations source gardent leur langue d’origine.`, referenceWidths, repereEnd);
for (const section of sections) {
  if (section.title) sectionHeading(repere, section.start - 1, 'D', section.title);
  addTable(repere, section.start, section.headers, section.rows, referenceWidths, section.name);
}
repere.freezePanes.freezeRows(5); repere.freezePanes.freezeColumns(1);

wb.recalculate();
const expected = [counts.distinctDrawings, counts.deliveredImageFiles, newBases, base.standaloneBases, current.standaloneBases, current.catalogueIds, current.catalogueIdsWithoutStandaloneBase, current.distinctProductionIdentitiesAfterKnownAlias, current.distinctProductionIdentitiesWithoutStandaloneBase, current.reserveGalleryEntries, current.activeStages, current.activeFighters, current.runtimeCostumeFamilies, current.illustratedPersonalScenes, current.illustratedGlobalScenes, register.candidateStates.length, counts.generatorRefused, counts.candidatesAwaitingReference, counts.newAnimationCycles, register.remaining.technicalReferenceGaps.length, register.remaining.personalIllustrations.length];
assert.deepEqual(summary.getRange('B6:B26').values.flat(), expected, 'Summary differs from the delivery register.');
const changedIndex = register.candidateStates.findIndex(c => c.accepted);
let inputChangeCheck = 'not_applicable_no_accepted_candidate_in_draft';
if (changedIndex >= 0) {
  const cell = candidates.getRange(`C${changedIndex + 6}`), previous = cell.values[0][0];
  cell.values = [['À contrôler']];
  wb.recalculate();
  assert.equal(summary.getRange('B8').values[0][0], newBases - 1);
  assert.equal(summary.getRange('B10').values[0][0], current.standaloneBases - 1);
  assert.equal(summary.getRange('B12').values[0][0], current.catalogueIdsWithoutStandaloneBase + 1);
  cell.values = [[previous]]; wb.recalculate();
  assert.deepEqual(summary.getRange('B6:B26').values.flat(), expected);
  inputChangeCheck = 'passed_changed_candidate_recalculated_and_restored';
}
for (const spec of specs) {
  const values = wb.worksheets.getItem(spec.name).getRange(`A1:${spec.last}${spec.end}`).values.flat();
  assert(!values.some(v => typeof v === 'string' && /^#(?:REF!|DIV\/0!|VALUE!|NAME\?|N\/A|NUM!|NULL!|SPILL!|CALC!)/.test(v)), `Formula error in ${spec.name}`);
}
const inspection = await wb.inspect({ kind: 'region', sheetId: 'Production V6', range: 'A5:C29', maxChars: 14000, tableMaxRows: 25, tableMaxCols: 3 });
await fs.writeFile(path.join(workDir, 'summary-inspection.ndjson'), inspection.ndjson);
const errorScan = await wb.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 100 }, maxChars: 4000 });
await fs.writeFile(path.join(workDir, 'formula-errors.ndjson'), errorScan.ndjson);
const additionsPath = path.join(workDir, isFinal ? 'infernal-v6-additions.xlsx' : 'infernal-v6-draft-additions.xlsx');
await (await SpreadsheetFile.exportXlsx(wb)).save(additionsPath);
let renderBook = await SpreadsheetFile.importXlsx(await FileBlob.load(additionsPath));
assert.deepEqual(renderBook.worksheets.getItem('Production V6').getRange('B6:B26').values.flat(), expected, 'Exported additions differ after reimport.');
let finalPath = null, packaging = null;
if (isFinal) {
  finalPath = path.join(repo, 'docs/standalone/INFERNAL_VERSUS_BIBLE_V6.xlsx');
  const packagingPath = path.join(sourceDir, 'workbook-package-report.json');
  const result = spawnSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON ?? 'python3', [path.join(repo, 'docs/standalone/append-production-workbook.py'), baselinePath, additionsPath, finalPath, packagingPath, '40', 'Production V6', 'rProductionV6'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  packaging = await readJson(packagingPath);
  assert.equal(packaging.finalSheetCount, 43);
  assert.equal(packaging.preservedWorksheetXmlParts, 40);
  assert.equal(Object.keys(packaging.preservedWorksheetSha256).length, 40);
  assert.deepEqual(packaging.addedSheets, sheetNames);
  assert.deepEqual(packaging.originalPartsChangedUnexpectedly, []);
  renderBook = await SpreadsheetFile.importXlsx(await FileBlob.load(finalPath));
  assert.deepEqual(renderBook.worksheets.getItem('Production V6').getRange('B6:B26').values.flat(), expected, 'Final summary differs after append and reimport.');
}
const previewDir = path.join(workDir, isFinal ? 'previews-final' : 'previews-draft');
await fs.mkdir(previewDir, { recursive: true });
const renderSpecs = [
  { name: 'Production V6', range: 'A1:C29', label: 'production' },
  { name: 'Production V6', range: `A31:C${deliveryEnd}`, label: 'livraisons' },
  { name: 'Cibles V6', range: `A1:F${Math.min(12, candidateEnd)}`, label: 'cibles-1' },
  ...(candidateEnd > 12 ? [{ name: 'Cibles V6', range: `A13:F${candidateEnd}`, label: 'cibles-2' }] : [])
];
for (const section of sections) {
  for (let start = section.start, part = 0; start <= section.end; start += 9, part++) {
    const first = part === 0 ? (section.start === 5 ? 1 : section.start - 1) : start;
    renderSpecs.push({ name: 'Repères V6', range: `A${first}:D${Math.min(start + 8, section.end)}`, label: `${section.name}-${part}` });
  }
}
const rendered = [];
for (const spec of renderSpecs) {
  const file = path.join(previewDir, spec.label + '.png');
  const preview = await renderBook.render({ sheetName: spec.name, range: spec.range, scale: 1, format: 'png' });
  await fs.writeFile(file, new Uint8Array(await preview.arrayBuffer()));
  rendered.push({ sheet: spec.name, range: spec.range, file });
}
const report = {
  schemaVersion: 1, date: register.date, status: isFinal ? 'final_workbook_exported_pending_visual_review' : 'draft_prepared_not_published',
  registerStatus: register.status, registerSha256: hash(registerBytes), inputSources: sourceProofs,
  newSheetNames: sheetNames, metrics: { ...counts, ...current }, summaryValues: expected,
  deliveredImageFilesChecked: fileChecks.length, deliveredImageSha256: fileChecks,
  recalculation: 'Artifact Tool', inputChangeCheck, nativeExcelRecalculation: 'not_run', formulaErrorCells: 0,
  exportedAdditionsReimport: 'passed', historicalWorkbookAuthoring: 'none',
  packaging, renderedViews: rendered, visualReview: 'pending_inspection_of_rendered_views',
  browserValidation: { status: browser.status, report: 'docs/standalone/production-v6/browser-qa.json' },
  fidelityOneToOneCertified: false, output: finalPath ?? additionsPath
};
await fs.writeFile(path.join(workDir, isFinal ? 'workbook-qa-final.json' : 'workbook-qa-draft.json'), json(report));
if (isFinal) await fs.writeFile(path.join(sourceDir, 'workbook-qa.json'), json(report));
console.log(json({ status: report.status, output: report.output, drawings: counts.distinctDrawings, files: counts.deliveredImageFiles, renderedViews: rendered.length, preservedSheets: packaging?.preservedWorksheetXmlParts ?? null }));
