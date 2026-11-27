import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Rebuild the V8 wardrobe and gallery entries from accepted delivery records.
// Re-running this script replaces this batch without duplicating prior drawings.
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const read = async file => JSON.parse(await fs.readFile(path.join(repo, file), 'utf8'));
const write = async (file, value) => fs.writeFile(path.join(repo, file), JSON.stringify(value, null, 2) + '\n');
const register = await read('docs/standalone/production-v8/delivery-register.json');
const batchId = `static-v8-${register.date}`;
const gallery = await read('art/infernal-versus/production/reserve-assets.json');
const outfits = {};
const allowedFighters = new Set(['hb_blitzo', 'hb_moxxie', 'hb_millie', 'hb_stolas']);

for (const asset of register.assets.filter(asset => asset.eligibility === 'wearable')) {
  assert(asset.accepted && asset.category === 'costume' && asset.staticReadyOnly, `Invalid static costume ${asset.id}`);
  assert(allowedFighters.has(asset.fighterId), `Add a wardrobe slot for ${asset.fighterId} before integration.`);
  assert(['season_1', 'season_2'].includes(asset.spoilerScope));
  (outfits[asset.fighterId] ??= []).push({
    id: asset.costumeId ?? asset.id,
    name: asset.name.replace(/^.+? — /, '') + ' · illustration statique',
    appearance: `${asset.incarnation}. La même illustration reste affichée pendant toutes les actions ; les techniques de combat restent celles du personnage.`,
    spoilerTier: asset.spoilerScope,
    layout: asset.layout,
    ready: '/' + asset.export.replace(/^public\//, ''),
    staticReadyOnly: true,
  });
}
await fs.writeFile(path.join(repo, 'src/lib/infernal-costumes-v8.ts'),
  "import type { InfernalCostume } from './infernal-appearances';\n\n" +
  '// Generated from accepted V8 deliveries by docs/standalone/production-v8/sync-runtime.mjs.\n' +
  `export const INFERNAL_V8_COSTUMES: Readonly<Record<string, readonly InfernalCostume[]>> = ${JSON.stringify(outfits, null, 2)};\n`);

gallery.assets = gallery.assets.filter(asset => asset.batchId !== batchId);
const reconciliation = await read('docs/standalone/production-v8/existing-variant-reconciliation.json');
const selectableExports = new Set(reconciliation.variants.filter(variant => variant.runtimeSelectable).map(variant => variant.currentExport));
for (const asset of gallery.assets) {
  if (asset.kind === 'costume_base' && selectableExports.has(asset.export)) asset.runtimeStatus = 'selectable_costume';
}
const ids = new Set(gallery.assets.map(asset => asset.id));
for (const asset of register.assets.filter(asset => asset.category !== 'stage')) {
  assert(asset.accepted && !ids.has(asset.id), `Duplicate or unaccepted gallery entry ${asset.id}`);
  ids.add(asset.id);
  const kind = asset.category === 'stage_layer' ? 'prop' : asset.eligibility === 'wearable' ? 'costume_base' : 'narrative_archive';
  gallery.assets.push({
    id: asset.id, name: asset.name, kind, franchise: asset.franchise,
    sourceIdentityId: asset.sourceIdentityId ?? null,
    spoilerScope: asset.spoilerScope ?? asset.continuity,
    frameCoverage: asset.category === 'stage_layer' ? undefined : 'full_body',
    runtimeStatus: asset.eligibility === 'wearable' ? 'selectable_costume' : asset.category === 'stage_layer' ? 'stage_scenery' : 'reserve',
    runtimeStageId: asset.runtimeStageId,
    master: asset.master, export: asset.export, dimensions: asset.dimensions,
    masterSha256: asset.masterSha256, exportSha256: asset.exportSha256,
    pixelExactExport: true, fidelityOneToOneCertified: false, inGameChecked: false,
    batchId, animationCycles: 0,
    reference: asset.incarnation ?? asset.name,
    references: asset.references ?? asset.referenceUrls.map(url => ({ url, kind: 'official_episode_or_clip', title: asset.referenceTitle ?? asset.incarnation ?? asset.name })),
    intendedRole: asset.runtimeUsage,
    visualReview: 'docs/standalone/production-v8/independent-visual-review.json',
    fidelityNotes: asset.fidelityNotes,
  });
}
gallery.date = register.date;
gallery.sourceBatches = [...new Set([...gallery.sourceBatches, batchId])];
gallery.scope = 'Static production gallery, including reserve art, selectable static outfits and integrated scenery; each entry states its runtime use.';
await write('art/infernal-versus/production/reserve-assets.json', gallery);
console.log(JSON.stringify({ wardrobeAdditions: Object.values(outfits).flat().length, galleryEntries: gallery.assets.length }));
