import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// Consolidate accepted outputs without rewriting the production source ledgers.
// An accepted revision must match the actual master AND export checksums.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const args = process.argv.slice(2);
const arg = (flag, fallback) => args.includes(flag) ? args[args.indexOf(flag) + 1] : fallback;
const sourceDir = path.resolve(arg('--source-dir', path.join(here, 'production-v5/source-ledgers')));
const output = path.resolve(arg('--output', path.join(here, 'production-v5-register.json')));
const auditOutput = path.resolve(arg('--audit-output', path.join(here, 'production-v5-audit.json')));
const read = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const acceptedStates = new Set(['accepted', 'accepted_static', 'produced_accepted']);
const assetId = value => {
  const parts = String(value).split(':');
  return parts[0] === 'v3' && parts.length === 3 ? `personal:${parts[1]}:3:${parts[2]}` : String(value);
};
const sources = [];
async function source(name) {
  const file = path.join(sourceDir, name);
  const bytes = await fs.readFile(file);
  sources.push({ name, sha256: sha256(bytes), bytes: bytes.length });
  return JSON.parse(bytes.toString('utf8'));
}
const characters = await source('characters-audit.json');
const qualification = await source('characters-full-qualification.json');
const environment = await source('environment-audit.json');
const narrative = await source('narrative-audit.json');
let archiveIndex = null;
try { archiveIndex = await read(path.join(sourceDir, '../archive-index.json')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const outputMappings = new Map((archiveIndex?.acceptedOutputMappings ?? []).map(row => [row.historicalSourcePath, row]));
const referenceMetadata = new Map((archiveIndex?.externalReferenceMetadata ?? []).map(row => [row.historicalPath, row]));
const historicalRoot = archiveIndex?.historicalRepositoryRoot ?? root;
const portableReference = value => referenceMetadata.get(value)?.disposition === 'excluded_intermediate_input_not_replaced' ? null : typeof value === 'string' && value.startsWith(historicalRoot + '/') ? value.slice(historicalRoot.length + 1) : outputMappings.get(value)?.repositoryPath ?? null;
const campaign = await read(path.join(here, 'campaign-design-v3.json'));
const candidates = new Map([...characters.priorityCandidates, ...(characters.additionalQualifiedCandidates ?? [])].map(a => [a.id, a]));
const sourceRegistry = new Map([...(narrative.sourceRegistry ?? []), ...(campaign.sources ?? [])].map(s => [s.id, s]));
const names = await fs.readdir(sourceDir);
const manifests = names.filter(n => n.endsWith('generated-assets.json')).sort();
const queues = names.filter(n => n.endsWith('generation-queue.json')).sort();
const recordFiles = names.filter(n => n.endsWith('generation-records.json')).sort();
const jobs = new Map();
for (const job of [...(narrative.globalCampaign?.chapters ?? []), ...(narrative.globalCampaign?.optionalBookends ?? [])]) {
  jobs.set(assetId(job.assetId ?? job.id), { ...job, queueSource: 'narrative-audit.json' });
}
for (const filename of queues) {
  const data = await source(filename);
  for (const job of data.jobs ?? []) jobs.set(assetId(job.assetId ?? job.id), { ...job, queueSource: filename });
}
const approved = new Map();
for (const filename of manifests) {
  const data = await source(filename);
  for (const entry of data.assets ?? []) {
    if (!acceptedStates.has(entry.status)) continue;
    const id = assetId(entry.assetId ?? entry.id);
    assert(id && id !== 'undefined', `Missing asset ID in ${filename}`);
    const rows = approved.get(id) ?? [];
    rows.push({ ...entry, ledgerSource: filename, sourceAssetId: entry.assetId ?? entry.id, assetId: id });
    approved.set(id, rows);
  }
}
const fileChecks = new Map();
async function checkedFile(filename) {
  assert(filename && !path.isAbsolute(filename) && !filename.split('/').includes('..'), `Invalid repository asset path: ${filename}`);
  if (!fileChecks.has(filename)) {
    const bytes = await fs.readFile(path.join(root, filename));
    fileChecks.set(filename, { path: filename, bytes: bytes.length, sha256: sha256(bytes) });
  }
  return fileChecks.get(filename);
}
const assets = [];
const superseded = [];
const envAssetIds = new Map([
  ['prop-asmodian-crystal', 'asmodean-crystal-full-moon'],
  ['prop-sloth-hospital-chair', 'sloth-hospital-chair'],
  ['prop-cherub-opera-spotlight', 'cherub-opera-spotlight'],
]);
for (const [id, revisions] of approved) {
  const matching = [];
  for (const revision of revisions) {
    const masterPath = revision.masterPath ?? revision.master;
    const exportPath = revision.exportPath ?? revision.export ?? revision.runtimeExport;
    const master = await checkedFile(masterPath);
    const exported = await checkedFile(exportPath);
    const expectedMaster = revision.masterSha256 ?? revision.hashes?.masterSha256;
    const expectedExport = revision.exportSha256 ?? revision.hashes?.exportSha256;
    if (master.sha256 === expectedMaster && exported.sha256 === expectedExport) matching.push({ ...revision, masterPath, exportPath, masterSha256: master.sha256, exportSha256: exported.sha256, masterBytes: master.bytes, exportBytes: exported.bytes });
    else superseded.push({ assetId: id, ledgerSource: revision.ledgerSource, attemptId: revision.attemptId ?? null, masterSha256: expectedMaster, exportSha256: expectedExport, reason: 'Superseded revision; checksum differs from current files.' });
  }
  assert(matching.length, `No accepted revision matches both current files for ${id}`);
  matching.sort((a, b) => String(a.reviewedAt ?? a.generatedAt ?? '').localeCompare(String(b.reviewedAt ?? b.generatedAt ?? '')));
  const current = matching.at(-1);
  const candidate = candidates.get(current.id) ?? candidates.get(id);
  const job = jobs.get(id);
  const target = environment.targets.find(t => t.id === (envAssetIds.get(id) ?? id.replace(/^stage-/, '')));
  const visualReview = current.visualReview ?? current.visualReviewNotes;
  assert(typeof visualReview === 'string' && visualReview.trim(), `Missing visual review for ${id}`);
  assert(current.pixelExactExport === true, `Unverified lossless export for ${id}`);
  assert((current.animationCycles ?? 0) === 0, `Animation cycles are excluded from V5: ${id}`);
  const references = [
    ...(candidate?.primaryReferences ?? []).map(r => ({ url: r.sourceUrl, title: r.id, limitations: r.method ?? '' })),
    ...(current.references ?? []).filter(r => r && typeof r === 'object' && r.url),
    ...[...(current.sourceIds ?? []), ...(job?.sourceIds ?? [])].map(key => sourceRegistry.get(key)).filter(Boolean),
    ...(target?.references?.url ? [{ url: target.references.url, title: target.label, limitations: target.references.resolutionLimit }] : []),
  ].filter(r => typeof r.url === 'string');
  const uniqueReferences = [...new Map(references.map(r => [r.url, r])).values()];
  const notes = [
    ...(candidate?.referenceLimitations ?? []), ...(target?.limitations ?? []),
    ...(Array.isArray(current.fidelityNotes ?? current.notes) ? (current.fidelityNotes ?? current.notes) : (current.fidelityNotes ?? current.notes) ? [current.fidelityNotes ?? current.notes] : []),
  ];
  const category = candidate?.kind === 'enemy_base' ? 'enemy' : current.category ?? current.kind ?? 'unclassified';
  const inputReferences = [...new Set([...(current.refs ?? []), ...(current.references ?? []).filter(r => typeof r === 'string'), ...(current.referencedImagePaths ?? []), ...(job?.referencedImagePaths ?? [])])];
  if (current.thumbnailPath) {
    const thumbnail = await checkedFile(current.thumbnailPath);
    assert.equal(thumbnail.sha256, current.thumbnailSha256, `Thumbnail checksum mismatch: ${id}`);
  }
  assets.push({
    ...current, id, assetId: id, category,
    historicalGeneratedSource: current.sourcePath ?? current.generatedSource ?? null,
    sourcePath: current.masterPath, generatedSource: current.masterPath,
    refs: inputReferences.map(portableReference).filter(Boolean),
    historicalInputReferences: inputReferences.map(ref => ({ historicalPath: ref, repositoryPath: portableReference(ref), sha256: referenceMetadata.get(ref)?.sha256 ?? null, disposition: referenceMetadata.get(ref)?.disposition ?? (portableReference(ref) ? 'relative_repository_reference' : 'external_or_intermediate_reference_metadata_only') })),
    primaryCreationReferencePaths: (job?.referencedImagePaths ?? []).map(portableReference).filter(Boolean),
    name: current.name ?? candidate?.name ?? job?.title ?? target?.label ?? id,
    sourceIdentityId: current.sourceIdentityId ?? candidate?.sourceIdentityId ?? current.fighterId ?? null,
    incarnation: current.incarnation ?? candidate?.incarnation ?? job?.sourceBriefVerbatim?.incarnation ?? job?.sourceIllustration?.incarnation ?? target?.incarnation ?? (id.startsWith('global:') ? 'Scène originale de Simulation AU, campagne La nuit du signal libre.' : 'Incarnation définie dans les références et le prompt conservés.'),
    references: uniqueReferences,
    referenceIds: job?.referenceIds ?? [],
    sourceJsonPointer: job?.sourceJsonPointer ?? null,
    animationCycles: 0, fidelityOneToOneCertified: false,
    visualReview, fidelityNotes: [...new Set(notes)],
    prompt: current.prompt ?? job?.prompt ?? job?.generationPrompt ?? candidate?.precisePrompt ?? target?.productionPrompt ?? null,
    matchingLedgerSources: [...new Set(matching.map(r => r.ledgerSource))],
  });
}
assets.sort((a, b) => a.assetId.localeCompare(b.assetId));
const acceptedIds = new Set(assets.map(a => a.assetId));
const attempts = [];
for (const filename of recordFiles) {
  const data = await source(filename);
  const records = Array.isArray(data) ? data : data.attempts ?? data.records ?? [];
  for (const record of records) {
    const rawId = record.assetId ?? record.id;
    if (!rawId) continue;
    const id = assetId(rawId);
    const error = record.error ?? '';
    const policyBlocked = /moderation_blocked|safety system|output safety|policy refusal/i.test(error);
    if (record.status === 'accepted' || (!record.status && !error)) continue;
    attempts.push({
      assetId: id, attemptId: record.attemptId ?? null, ledgerSource: filename,
      status: record.status ?? 'not_recorded', policyBlocked,
      startedAt: record.startedAt ?? null, finishedAt: record.finishedAt ?? record.reviewedAt ?? null,
      currentAcceptedAssetExists: acceptedIds.has(id),
      review: record.visualReviewNotes ?? record.reviewNotes ?? null,
      reason: error || record.reason || record.rejectionReason || null,
      generatedSourceFile: record.sourcePath ? path.basename(record.sourcePath) : null,
    });
  }
}
const blocked = new Set(attempts.filter(a => a.policyBlocked && !a.currentAcceptedAssetExists).map(a => a.assetId));
const pending = new Set(attempts.filter(a => a.status === 'generated_pending_visual_review' && !a.currentAcceptedAssetExists).map(a => a.assetId));
const remainingPersonal = campaign.fighters.flatMap(f => f.illustrations.map(i => ({
  assetId: `personal:${f.fighterId}:3:${i.kind}`, fighterId: f.fighterId, name: f.name, beat: i.kind, title: i.title,
}))).filter(row => !acceptedIds.has(row.assetId)).map(row => ({ ...row,
  productionState: blocked.has(row.assetId) ? 'historical_policy_refusal_no_retry' : pending.has(row.assetId) ? 'generated_pending_visual_review' : jobs.has(row.assetId) ? 'brief_ready_not_delivered' : 'brief_missing',
  queueSource: jobs.get(row.assetId)?.queueSource ?? null,
}));
const environmentRequirements = environment.targets.map(target => {
  const added = assets.find(a => (envAssetIds.get(a.id) ?? a.id.replace(/^stage-/, '')) === target.id);
  return { id: target.id, category: target.category, subject: target.label ?? target.id,
    requirement: target.incarnation ?? target.productionPrompt ?? '',
    status: added ? 'Dessin produit' : target.status,
    evidence: added ? added.exportPath : target.references?.url ?? '',
    nextAction: added ? 'Suivre son intégration et la comparaison visuelle dans le jeu.' : (target.limitations ?? []).join(' '),
    source: target.references ?? null, assetId: added?.assetId ?? null, delivered: Boolean(added),
  };
});
const byCategory = Object.fromEntries([...new Set(assets.map(a => a.category))].map(c => [c, assets.filter(a => a.category === c).length]));
const register = {
  schemaVersion: 2, edition: 'V5', date: '2026-11-25', baselineCommit: characters.baseline.latestVerifiedCommitPrefix,
  status: 'consolidated_verified_files', method: 'Each accepted assignment is selected by master and export SHA-256. Repeated IDs and revised attempts are reconciled against current files. Distinct drawings are counted by master SHA-256.',
  sourceLedgers: sources.map(s => ({ ...s, repositoryPath: path.relative(root, path.join(sourceDir, s.name)) })),
  archiveIndex: archiveIndex ? path.relative(root, path.join(sourceDir, '../archive-index.json')) : null,
  assets, supersededAcceptedRevisions: superseded,
  attemptsWithoutAcceptedOutput: attempts.filter(a => !a.currentAcceptedAssetExists),
  reviewedRejectedAttemptsSuperseded: attempts.filter(a => a.currentAcceptedAssetExists),
  remainingPersonal, environmentRequirements, sourceRegistry: [...sourceRegistry.values()],
  metrics: {
    acceptedAssetAssignments: assets.length, distinctNewDrawings: new Set(assets.map(a => a.masterSha256)).size,
    filesVerified: fileChecks.size, masterAndExportFiles: assets.length * 2, thumbnailFiles: assets.filter(a => a.thumbnailPath).length, acceptedByCategory: byCategory,
    personalScenesProduced: assets.filter(a => a.assetId.startsWith('personal:')).length,
    globalScenesProduced: assets.filter(a => a.assetId.startsWith('global:')).length,
    personalScenesRemaining: remainingPersonal.length,
    personalRemainingByState: Object.fromEntries([...new Set(remainingPersonal.map(a => a.productionState))].map(s => [s, remainingPersonal.filter(a => a.productionState === s).length])),
    newAnimationCycles: 0,
  },
  limits: [
    'Les scènes narratives sont des créations AU. Les sources officielles ancrent les identités et le lore, elles ne prouvent pas les événements inventés de ces campagnes.',
    'Les contrôles de SHA-256 prouvent l’identité des fichiers présents avec les sorties acceptées. Les notes de revue visuelle sont conservées, elles ne constituent pas une certification 1:1.',
    'Les fichiers démarrés sans sortie et les sorties non relues ne sont pas comptés comme dessins livrés. Les refus de sécurité restent exclus des relances.',
  ],
};
await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, JSON.stringify(register, null, 2) + '\n');
await fs.writeFile(auditOutput, JSON.stringify({ ...characters, consolidatedQualification: qualification, sourceChecksums: sources.filter(s => ['characters-audit.json', 'characters-full-qualification.json'].includes(s.name)) }, null, 2) + '\n');
console.log(JSON.stringify({ output, auditOutput, metrics: register.metrics }));
