import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Read-only reconciliation of previously delivered artwork. This script writes
// its own report only; the V8 synchronizer later attaches it to extension-plan.
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');
const read = async relative => JSON.parse(await fs.readFile(path.join(repo, relative), 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const plan = await read('docs/standalone/extension-plan.json');
const catalogue = await read('docs/standalone/production-v7/catalogue-audit.json');
const v5 = await read('docs/standalone/production-v5-register.json');
const runtime = await fs.readFile(path.join(repo, 'src/lib/infernal-appearances.ts'), 'utf8');
const reserve = await read('art/infernal-versus/production/reserve-assets.json');
const definitions = [
  { requirementId: 'VAR-003', assetId: 'vaggie-exorcist', runtime: 'six_key_poses', notes: 'Uniforme d’exorciste déjà sélectionnable avec six poses clés. Les transitions animées restent distinctes.' },
  { requirementId: 'VAR-018', assetId: 'hb_moxxie-moxxine', runtime: 'static_ready_only', notes: 'Déguisement Moxxine V5 déjà sélectionnable. Une illustration reste affichée dans toutes les actions ; aucun cycle nouveau.' },
  { requirementId: 'VAR-019', assetId: 'hb_millie-millerd', runtime: 'static_ready_only', notes: 'Déguisement Millerd V5 déjà sélectionnable. Une illustration reste affichée dans toutes les actions ; aucun cycle nouveau.' },
  { requirementId: 'VAR-021', assetId: 'hb_loona-human-disguise', runtime: 'six_key_poses', notes: 'Apparence humaine déjà sélectionnable avec six poses clés. Ne pas la produire de nouveau à partir du statut ancien.' },
  { requirementId: 'VAR-025', assetId: 'hb_stolas-deposed-sinsmas', runtime: 'static_ready_only', notes: 'Tenue bordeaux de Sinsmas V5 déjà sélectionnable. Le costume ne modifie pas les techniques : la perte canonique des pouvoirs reste un périmètre mécanique distinct.' },
  { requirementId: 'VAR-026', assetId: 'hb_stolas-human-disguise', runtime: 'six_key_poses', notes: 'Apparence humaine de Seeing Stars déjà sélectionnable avec six poses clés. Aucun nouveau dessin ni changement mécanique.' },
  { requirementId: 'VAR-030', assetId: 'hb_fizzarolli-casual-oops', runtime: 'static_ready_only', notes: 'Tenue domestique Oops V5 déjà sélectionnable en illustration unique. La famille de scène existe séparément ; les autres variantes éventuelles ne sont pas déclarées complètes.' },
  { requirementId: 'VAR-032', assetId: 'hb_barbie_wire-human-disguise', runtime: 'reserve_gallery', notes: 'Déguisement humain V5 déjà livré en galerie de réserve. Barbie reste un personnage sans kit jouable ; aucun effet de cristal ni transformation animée ajouté.' },
  { requirementId: 'VAR-033', assetId: 'hb_vortex-human-disguise', runtime: 'static_ready_only', notes: 'Apparence humaine V5 déjà sélectionnable en illustration unique. La même image couvre les actions ; aucun cycle nouveau.' },
];
const rows = [];
for (const definition of definitions) {
  const row = plan.variants.find(item => item.id === definition.requirementId);
  const audit = catalogue.variants.find(item => item.id === definition.requirementId);
  assert(row && audit && audit.currentExport, `Missing historical variant: ${definition.requirementId}`);
  const accepted = v5.assets.find(item => item.id === definition.assetId);
  const runtimeSelectable = definition.runtime !== 'reserve_gallery';
  if (runtimeSelectable) assert(runtime.includes(`'${definition.assetId}'`), `Costume not registered: ${definition.assetId}`);
  else assert(reserve.assets.some(item => item.id === definition.assetId), `Reserve entry not found: ${definition.assetId}`);
  const publicFiles = definition.runtime === 'six_key_poses'
    ? ['', '-strike', '-recoil', '-heavy', '-crouch', '-jump'].map(suffix => `public/assets/sprites/costumes/${definition.assetId}${suffix}.webp`)
    : [audit.currentExport];
  const files = [];
  for (const relative of publicFiles) {
    const bytes = await fs.readFile(path.join(repo, relative));
    const sha256 = hash(bytes);
    if (accepted?.exportPath === relative) assert.equal(sha256, accepted.exportSha256, `Historical export changed: ${relative}`);
    files.push({ path: relative, bytes: bytes.length, sha256 });
  }
  rows.push({
    ...definition, fighter: row.fighter, name: row.name,
    previousStatus: row.coverageBeforeStaticV8?.status ?? row.status,
    proposedStatus: 'Partiel',
    currentExport: audit.currentExport,
    historicalDeliveryEdition: accepted ? 'V5' : 'Pre-V7 (see catalogue audit)',
    runtimeSelectable, staticReadyOnly: definition.runtime === 'static_ready_only',
    distinctPoseFiles: publicFiles.length,
    referenceUrls: [...new Set((accepted?.references ?? []).map(item => item.url).filter(Boolean))],
    sourceRegister: accepted ? 'docs/standalone/production-v5-register.json' : 'docs/standalone/production-v7/catalogue-audit.json',
    files, newDrawings: 0, newAnimationCycles: 0,
    fidelityOneToOneCertified: false,
    verificationScope: 'Existing file bytes and runtime registry. No new image review or browser execution asserted.',
  });
}
const report = {
  schemaVersion: 1, edition: 'V8', date: '2026-11-26',
  status: 'verified_existing_variant_mapping',
  variants: rows, counts: { reconciledRequirements: rows.length, runtimeSelectable: rows.filter(row => row.runtimeSelectable).length, reserveOnly: rows.filter(row => !row.runtimeSelectable).length, verifiedPublicImageFiles: rows.reduce((sum, row) => sum + row.files.length, 0), newDrawings: 0, newAnimationCycles: 0 },
  sourceFiles: [],
};
for (const relative of ['docs/standalone/production-v7/catalogue-audit.json', 'docs/standalone/production-v5-register.json', 'src/lib/infernal-appearances.ts', 'art/infernal-versus/production/reserve-assets.json']) {
  report.sourceFiles.push({ path: relative, sha256: hash(await fs.readFile(path.join(repo, relative))) });
}
const output = path.join(here, 'existing-variant-reconciliation.json');
await fs.writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ output, ...report.counts }, null, 2));
