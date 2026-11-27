import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const read = async file => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
const register = await read('docs/standalone/production-v7/delivery-register.json');
const cataloguePath = path.join(root, 'art/infernal-versus/production/reserve-assets.json');
const catalogue = JSON.parse(await fs.readFile(cataloguePath, 'utf8'));
const sourceRows = await read('docs/standalone/production-v7/references.json');
const sourceByUrl = new Map(sourceRows.sources.map(source => [source.url, source]));
let added = 0, revised = 0;
for (const asset of register.assets.filter(asset => !['stage', 'stage_layer'].includes(asset.category))) {
  assert(asset.accepted && asset.pixelExactExport, 'Unverified asset: ' + asset.id);
  const id = asset.replacesAssetId ?? asset.id;
  const index = catalogue.assets.findIndex(existing => existing.id === id);
  const previous = index < 0 ? null : catalogue.assets[index];
  if (asset.category === 'revision') assert(previous, 'Unknown revision target: ' + id);
  if (previous && !asset.replacesAssetId) assert(previous.batchId === 'static-v7-2026-11-26', 'Refusing to replace a prior-wave asset: ' + id);
  const references = asset.referenceUrls.map(url => {
    const source = sourceByUrl.get(url);
    return { url, kind: source?.kind ?? 'supporting_reference', title: source?.title ?? url };
  });
  const entry = {
    ...(previous ?? {}), id,
    name: asset.category === 'revision' ? previous.name : asset.name,
    franchise: asset.franchise,
    kind: asset.category === 'revision' ? previous.kind : asset.kind,
    pose: asset.category === 'revision' ? previous.pose : 'ready',
    runtimeStatus: 'reserve', sourceIdentityId: asset.sourceIdentityId,
    sourceTimelineScope: asset.continuity,
    spoilerScope: asset.continuity === 'season_1' ? 'season_1' : asset.continuity === 'season_3' ? 'season_3' : 'season_2',
    master: asset.master, export: asset.export, dimensions: asset.dimensions,
    masterSha256: asset.masterSha256, exportSha256: asset.exportSha256,
    pixelExactExport: true, fidelityOneToOneCertified: false, inGameChecked: false,
    batchId: 'static-v7-2026-11-26', animationCycles: 0,
    ...(asset.frameCoverage ? { frameCoverage: asset.frameCoverage } : {}),
    reference: asset.incarnation ?? asset.name,
    references, intendedRole: 'Illustration statique dans la galerie de réserve ; aucun kit jouable ni cycle ajouté.',
    visualReview: `Comparaison indépendante du master ${asset.masterSha256} dans docs/standalone/production-v7/reviews-v7.json.`,
    fidelityNotes: [...asset.fidelityNotes, 'Pose ou présentation statique adaptée ; conformité artistique 1:1 non certifiée.', 'WebP sans perte identique aux pixels RGBA du master ; cette égalité technique ne mesure pas la fidélité au modèle.'],
  };
  for (const field of ['alphaBounds16', 'visibleBBoxAlpha50', 'alphaBoundingBox']) {
    delete entry[field]; if (asset[field]) entry[field] = asset[field];
  }
  if (asset.alphaExtrema) entry.alphaRange = asset.alphaExtrema;
  if (asset.category === 'revision') {
    const history = [...(previous.revisionHistory ?? [])];
    if (!history.some(revision => revision.masterSha256 === previous.masterSha256) && previous.masterSha256 !== asset.masterSha256) {
      history.push({ batchId: previous.batchId, master: previous.master, export: previous.export,
        masterSha256: previous.masterSha256, exportSha256: previous.exportSha256, fidelityNotes: previous.fidelityNotes });
    }
    entry.revisionHistory = history;
    entry.currentRevisionId = asset.id;
    revised++;
  }
  if (index < 0) { catalogue.assets.push(entry); added++; }
  else catalogue.assets[index] = entry;
}
if (!catalogue.sourceBatches.includes('static-v7-2026-11-26')) catalogue.sourceBatches.push('static-v7-2026-11-26');
catalogue.date = '2026-11-26';
assert.equal(new Set(catalogue.assets.map(asset => asset.id)).size, catalogue.assets.length);
await fs.writeFile(cataloguePath, JSON.stringify(catalogue, null, 2) + '\n');
console.log(JSON.stringify({ added, revised, galleryEntries: catalogue.assets.length }));
