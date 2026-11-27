import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const read = async name => JSON.parse(await fs.readFile(path.join(here, name), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const final = process.argv.includes('--final');
const qualification = await read('qualification-audit.json');
const references = await read('references.json');
const supplementalReferences = await read('references-supplement.json');
const independentReview = await read('independent-visual-review.json');
const rootGeneration = await read('root-generation.json');
const helluvaGeneration = await read('helluva-generation.json');
const imageQA = await read('root-image-qa.json');
const catalogue = JSON.parse(await fs.readFile(path.join(root, 'art/infernal-versus/production/reserve-assets.json'), 'utf8'));
const attempts = [...rootGeneration.attempts, ...helluvaGeneration.attempts];
assert.equal(new Set(attempts.map(a => a.id)).size, attempts.length, 'Duplicate attempted subjects.');
if (final) assert(attempts.every(a => !/in_progress|pending|generating/.test(a.status)), 'Generation or review still pending.');

const rootDefinitions = {
  'dhorks-portal-ring': {
    name: 'D.H.O.R.K.S. · Anneau de la machine-portail', category: 'machine', kind: 'machine', continuity: 'season_2',
    runtimeUsage: 'Galerie de réserve', referenceUrls: ['https://www.youtube.com/watch?v=Fj9YRsV1pEw'],
    visualReview: 'Anneau entier, deux pieds et ouverture transparente. Relief supérieur, facettes, joints et précision des voyants restent une reconstruction depuis une référence 320 × 180.',
  },
  'hellaverse-training': {
    name: 'Annexe infernale · Entraînement', category: 'stage', kind: 'stage', continuity: 'simulation_au',
    runtimeUsage: 'Arène sélectionnable', referenceUrls: ['https://github.com/darknigthmare/hellbound-hotel-manager/blob/feat/infernal-versus-assets-20261124/docs/standalone/extension-plan.json'],
    visualReview: 'Une seule salle statique, piste continue dégagée, sorties latérales cohérentes, mobilier en retrait. Décor original AU.',
  },
  'vox-office-s2': {
    name: 'Vox · Bureau S2', category: 'stage', kind: 'stage', continuity: 'season_2',
    runtimeUsage: 'Arène sélectionnable',
    referenceUrls: ['https://www.youtube.com/watch?v=PNqlp9t7ies', 'https://www.edenhunter.com.au/product/50-60-vox-s-office-common-foil-2nd-edition-hazbin-hotel-trading-card/ATQDJQVSKLJETES676CTNNOQ'],
    visualReview: 'Bureau angulaire, grand V, trois sièges, panneaux cyan et aquarium repris depuis le clip officiel. Caméra abaissée et piste élargie pour le combat ; panneaux et sièges simplifiés. La carte photographiée ne sert qu’à corroborer la géométrie. Ni façade de tour, ni détail HD ou fidélité 1:1 revendiqué.',
  },
};
const assets = imageQA.filter(qa => rootGeneration.attempts.some(a => a.id === qa.id && a.accepted === true)).map(qa => ({
  ...qa, ...rootDefinitions[qa.id],
  sourceIdentityId: null,
  status: 'accepted_static_candidate', accepted: true,
  newAnimationCycles: 0, fidelityOneToOneCertified: false,
}));

for (const a of helluvaGeneration.attempts.filter(a => a.accepted === true)) {
  const q = a.qa;
  assert(q?.decodedPixelsEqual, 'Unverified lossless export: ' + a.id);
  assets.push({
    id: a.id, name: a.name, sourceIdentityId: a.sourceIdentityId,
    category: 'character_base', kind: 'character_base',
    status: 'accepted_static_candidate', accepted: true, continuity: 'season_1',
    master: a.masterPath, export: a.exportPath, dimensions: q.dimensions,
    masterSha256: q.masterSha256, exportSha256: q.exportSha256,
    masterBytes: q.masterBytes, exportBytes: q.exportBytes,
    pixelExactExport: q.decodedPixelsEqual, alphaBounds16: q.alphaBounds16, alphaExtrema: q.alphaRange,
    runtimeUsage: 'Galerie de réserve',
    referenceUrls: ['https://twitter.com/CalisDraws/status/1355948687814520837', 'https://www.youtube.com/watch?v=RghsgkZKedg', 'https://www.zerochan.net/3210579'],
    visualReview: a.visualReview ?? a.review ?? a.visualReviewNotes ?? 'Revue visuelle documentée dans helluva-generation.json.',
    fidelityNotes: [...a.visualReview.fidelityNotes, 'Planche de production attribuée à CalisDraws ; bitmap récupéré sur un hébergeur secondaire, recoupe partielle avec Spring Broken.', 'Fond alpha nul et pixels du master conservés sans retouche dans le WebP ; égalité technique distincte de la fidélité artistique.'],
    newAnimationCycles: 0, fidelityOneToOneCertified: false,
  });
}

assert.equal(new Set(assets.map(a => a.id)).size, assets.length);
assert.equal(new Set(assets.map(a => a.masterSha256)).size, assets.length, 'Duplicate drawing hashes.');
for (const a of assets) {
  for (const [file, expected] of [[a.master, a.masterSha256], [a.export, a.exportSha256]]) {
    assert(file && expected, 'Missing path/hash: ' + a.id);
    assert.equal(hash(await fs.readFile(path.join(root, file))), expected, 'Image differs: ' + file);
  }
  if (a.thumbnail) assert.equal(hash(await fs.readFile(path.join(root, a.thumbnail.path))), a.thumbnail.sha256);
  if (final && a.category !== 'stage') assert(catalogue.assets.some(r => r.id === a.id && r.export === a.export), 'Missing runtime gallery entry: ' + a.id);
}

const acceptedIds = new Set(assets.map(a => a.id));
const attemptedById = new Map(attempts.map(a => [a.id, a]));
const candidateStates = qualification.candidates.map(c => {
  const a = attemptedById.get(c.proposedAssetId);
  return {
    sourceIdentityId: c.sourceIdentityId, assetId: c.proposedAssetId, name: c.name,
    category: c.kind, franchise: c.franchise, continuity: c.continuity,
    status: acceptedIds.has(c.proposedAssetId) ? 'accepted_static_candidate' : a?.status ?? 'reference_incomplete',
    accepted: acceptedIds.has(c.proposedAssetId),
    notes: a?.status === 'generator_refused' ? 'Refus automatique du générateur ; aucun fichier livré, aucune relance.' : !a ? 'Vue entière et détails encore insuffisants ; aucun dessin compté.' : 'Voir le registre et la revue visuelle de cette tentative.',
  };
});

const addedBases = assets.filter(a => a.sourceIdentityId && ['character_base', 'enemy_base', 'support_base'].includes(a.category));
const counts = {
  distinctDrawings: assets.length,
  masterPng: assets.length,
  losslessWebp: assets.length,
  thumbnails: assets.filter(a => a.thumbnail).length,
  deliveredImageFiles: assets.length * 2 + assets.filter(a => a.thumbnail).length,
  characterBases: assets.filter(a => a.category === 'character_base').length,
  supportBases: assets.filter(a => a.category === 'support_base').length,
  machines: assets.filter(a => a.category === 'machine').length,
  stages: assets.filter(a => a.category === 'stage').length,
  generatorRefused: attempts.filter(a => a.status === 'generator_refused').length,
  candidatesAwaitingReference: candidateStates.filter(c => c.status === 'reference_incomplete').length,
  newAnimationCycles: 0,
};
const baseline = qualification.baseline;
const cumulativeCounts = {
  ...baseline,
  standaloneBases: baseline.standaloneBases + addedBases.length,
  reserveStandaloneBases: baseline.reserveStandaloneBases + addedBases.length,
  catalogueIdsWithoutStandaloneBase: baseline.catalogueIdsWithoutStandaloneBase - addedBases.length,
  distinctProductionIdentitiesWithoutStandaloneBase: baseline.distinctProductionIdentitiesWithoutStandaloneBase - addedBases.length,
  reserveGalleryEntries: catalogue.assets.length,
  activeStages: baseline.activeStages + counts.stages,
};
const remaining = {
  personalIllustrations: ['personal:husk:3:rival', 'personal:sirpentious:3:intro'],
  personalIllustrationsStatus: 'historical_policy_refusal_no_retry',
  technicalReferenceGaps: ['pentious-airship-pilot', 'cherub-golden-arrow', 'dhorks-shuriken'],
  stageReferenceGaps: ['extermination-roof'],
  partiallyCoveredPlannedStages: ['vox-tower', 'sloth-hospital'],
  refusedThisWave: attempts.filter(a => a.status === 'generator_refused').map(a => a.id),
  characterReferenceGaps: candidateStates.filter(c => c.status === 'reference_incomplete').map(c => c.sourceIdentityId),
  limitations: ['Le catalogue inclut groupes, pilote, AU et entrées futures ; ses 209 IDs ne sont pas 209 individus canoniques distincts.', 'Les nouvelles bases en réserve ne deviennent pas des kits jouables.', 'Aucune animation, nouvelle technique ou finition n’est ajoutée par cette vague.', 'Le décor d’entraînement est original AU ; aucun décor canonique 1:1 n’est revendiqué pour cette pièce.'],
};
const sourceFiles = [];
for (const file of ['qualification-audit.json', 'references.json', 'references-supplement.json', 'independent-visual-review.json', 'root-generation.json', 'helluva-generation.json', 'root-image-qa.json']) sourceFiles.push({ path: 'docs/standalone/production-v6/' + file, sha256: hash(await fs.readFile(path.join(here, file))) });
let qa = { status: 'final_runtime_review_pending' };
try { qa = await read('validation.json'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const result = {
  schemaVersion: 1, edition: 'V6', date: '2026-11-25', status: final ? 'final_production_register' : 'draft_production_register',
  repository: 'darknigthmare/hellbound-hotel-manager', branch: 'feat/infernal-versus-assets-20261124', prNumber: 8,
  baselineCommit: qualification.baselineCommit, baseline, counts, cumulativeCounts,
  assets, candidateStates,
  attempts: attempts.map(a => {
    const entry = { ...a, promptRegister: a.id.startsWith('hb_') ? 'helluva-generation.json' : 'root-generation.json' };
    delete entry.prompt;
    delete entry.outputHint;
    return entry;
  }),
  remaining, qa, sourceFiles,
  referenceSourceCount: new Set([...references.sources, ...supplementalReferences.sources].map(source => source.url)).size,
  independentReview: { path: 'docs/standalone/production-v6/independent-visual-review.json', finalVersionStatus: independentReview.finalVersion?.status ?? 'review_in_progress' },
  fidelityOneToOneCertified: false,
};
await fs.writeFile(path.join(here, 'delivery-register.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, counts, cumulativeCounts }, null, 2));
