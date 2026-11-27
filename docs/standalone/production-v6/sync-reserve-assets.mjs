import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Reconcile accepted drawings with the existing reserve gallery. No playable kit
// or animation is created here, and pre-V6 catalogue entries are left intact.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const cataloguePath = path.join(root, 'art/infernal-versus/production/reserve-assets.json');
const catalogue = JSON.parse(await fs.readFile(cataloguePath, 'utf8'));
const generation = JSON.parse(await fs.readFile(path.join(here, 'helluva-generation.json'), 'utf8'));
const accepted = generation.attempts.filter(attempt => attempt.accepted === true);

for (const attempt of accepted) {
  assert(!/pending|generating/.test(attempt.status), `Review is incomplete: ${attempt.id}`);
  assert(attempt.qa.decodedPixelsEqual, `Lossless export not verified: ${attempt.id}`);
  const qa = attempt.qa;
  const asset = {
    id: attempt.id,
    name: `${attempt.name} — Spring Broken S1E3`,
    franchise: 'Helluva Boss',
    kind: 'character_base',
    pose: 'ready',
    runtimeStatus: 'reserve',
    sourceIdentityId: attempt.sourceIdentityId,
    spoilerScope: 'season_1',
    master: attempt.masterPath,
    export: attempt.exportPath,
    dimensions: qa.dimensions,
    alphaBounds16: qa.alphaBounds16,
    alphaRange: qa.alphaRange,
    masterSha256: qa.masterSha256,
    exportSha256: qa.exportSha256,
    pixelExactExport: qa.decodedPixelsEqual,
    fidelityOneToOneCertified: false,
    inGameChecked: false,
    batchId: 'wave-k-2026-11-25',
    animationCycles: 0,
    visualReview: 'Master inspecté avec la planche de production ; silhouette entière, un seul sujet et alpha vérifiés. Revue indépendante documentée dans production-v6. Contrôle navigateur non exécuté.',
    reference: 'Spring Broken S1E3 · planche de production CalisDraws',
    references: [
      {
        url: 'https://twitter.com/CalisDraws/status/1355948687814520837',
        kind: 'official_production_artist',
        title: 'CalisDraws · planche des designs de Spring Broken',
        method: 'Attribution et date recoupées par X oEmbed ; bitmap inspecté sur une copie secondaire documentée.',
      },
      {
        url: 'https://www.youtube.com/watch?v=RghsgkZKedg',
        kind: 'official_episode',
        episode: 'Spring Broken S1E3',
        method: 'Recoupe partielle des prévisualisations officielles ; aucune prétention à six vues démon complètes dans cet épisode.',
      },
      {
        url: 'https://www.zerochan.net/3210579',
        kind: 'secondary_bitmap_host',
        title: 'Copie de la planche attribuée à CalisDraws',
      },
    ],
    intendedRole: 'Base statique dans la galerie de réserve ; aucun kit jouable ou cycle animé supplémentaire.',
    fidelityNotes: [
      ...attempt.visualReview.fidelityNotes,
      'Pose neutre adaptée au jeu ; fidélité artistique 1:1 non certifiée.',
      'Pixels du master conservés dans le WebP sans perte ; cette égalité technique ne mesure pas la fidélité au modèle de référence.',
    ],
  };
  const index = catalogue.assets.findIndex(existing => existing.id === asset.id);
  if (index === -1) catalogue.assets.push(asset);
  else catalogue.assets[index] = asset;
}

if (!catalogue.sourceBatches.includes('wave-k-2026-11-25')) catalogue.sourceBatches.push('wave-k-2026-11-25');
catalogue.date = '2026-11-25';
assert.equal(new Set(catalogue.assets.map(asset => asset.id)).size, catalogue.assets.length);
await fs.writeFile(cataloguePath, JSON.stringify(catalogue, null, 2) + '\n');
console.log(JSON.stringify({ acceptedBases: accepted.length, galleryEntries: catalogue.assets.length }));
