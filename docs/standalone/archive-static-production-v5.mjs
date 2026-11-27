import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// Package reviewed JSON evidence only. Third-party captures and rejected
// generated bitmaps are deliberately not copied into the public repository.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const args = process.argv.slice(2);
const arg = (key, fallback) => args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const sourceDir = path.resolve(arg('--source-dir', path.join(root, '../production-next')));
const inventoryPath = arg('--inventory', null);
const recipesDir = arg('--recipes-dir', null);
const baselineTree = arg('--baseline-tree', null);
assert(inventoryPath && recipesDir, '--inventory and --recipes-dir are required when archiving a new production snapshot.');
const destination = path.join(here, 'production-v5');
const read = async filename => JSON.parse(await fs.readFile(filename, 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const inventory = await read(inventoryPath);
const included = [];
async function copyJson(source, relative, role) {
  const bytes = await fs.readFile(source);
  assert(!bytes.toString('utf8').includes('data:image/'), `Embedded image payload excluded: ${source}`);
  JSON.parse(bytes.toString('utf8'));
  const target = path.join(destination, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
  included.push({ sourceFile: path.basename(source), historicalSourcePath: source, repositoryPath: path.relative(root, target), bytes: bytes.length, sha256: hash(bytes), role });
}
for (const item of inventory.files) {
  const folders = { 'include-source-ledger': 'source-ledgers', 'include-evidence': 'evidence', 'include-reference-index': 'reference-indexes' };
  const folder = folders[item.recommendedAction];
  if (folder && item.path.endsWith('.json')) await copyJson(item.path, `${folder}/${path.basename(item.path)}`, item.recommendedAction);
}
for (const name of ['qa-runtime-final.json', 'qa-filtered-build-final.json', 'runtime-final-narrative-coverage.json']) {
  if (!included.some(f => f.sourceFile === name)) await copyJson(path.join(sourceDir, name), `evidence/${name}`, 'include-evidence');
}
for (const name of ['process-personal-output.py', 'sync-narrative-registry.py', 'RECIPE_NOTES.md']) {
  const bytes = await fs.readFile(path.join(recipesDir, name));
  const target = path.join(destination, 'recipes', name);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
  included.push({ sourceFile: name, repositoryPath: path.relative(root, target), bytes: bytes.length, sha256: hash(bytes), role: 'portable-recipe' });
}
if (baselineTree) await copyJson(path.resolve(baselineTree), 'inputs/remote-tree-cf323521.json', 'baseline-tree-evidence');

const outputMappings = new Map();
for (const file of included.filter(f => f.role === 'include-source-ledger' && f.sourceFile.endsWith('generated-assets.json'))) {
  for (const asset of (await read(path.join(root, file.repositoryPath))).assets ?? []) {
    if (asset.status !== 'accepted') continue;
    const generatedSource = asset.sourcePath ?? asset.generatedSource;
    if (!generatedSource) continue;
    const source = await fs.readFile(generatedSource);
    assert.equal(hash(source), asset.masterSha256, `Generated source is not identical to approved master: ${asset.assetId}`);
    outputMappings.set(generatedSource, { historicalSourcePath: generatedSource, repositoryPath: asset.masterPath, sha256: asset.masterSha256, disposition: 'byte_identical_accepted_output', role: 'output-only mapping' });
  }
}
const references = inventory.externalImageDependencies.map(item => {
  const accepted = outputMappings.get(item.path);
  const rejectedInput = item.recommendedAction === 'historical-input-do-not-remap';
  const official = ['metadata-only-third-party-reference', 'preserve-used-reference-or-index'].includes(item.recommendedAction);
  const auditBoard = item.recommendedAction === 'preserve-audit-reference-optional';
  return {
    historicalPath: item.path, bytes: item.bytes ?? null, sha256: item.sha256 ?? null,
    uses: item.uses,
    disposition: rejectedInput ? 'excluded_intermediate_input_not_replaced' : official ? 'third_party_reference_metadata_only' : auditBoard ? 'historical_qualification_board_metadata_only' : accepted ? 'byte_identical_accepted_output' : 'historical_generated_output_metadata_only',
    repositoryPath: !rejectedInput && accepted ? accepted.repositoryPath : null,
    sourceEvidence: official || auditBoard ? 'Source IDs, source URLs, approximate timestamps and resolution limits are preserved in the archived JSON files at the listed uses/pointers and reference-indexes.' : null,
    limitation: rejectedInput ? 'This input preceded a corrective edit. Its file name and SHA are preserved, but its bitmap is excluded. It is never substituted by the final approved image.' : official || auditBoard ? 'The consulted preview is not redistributed. The current workbook and catalogue do not require its image bytes.' : null,
  };
});
const index = {
  schemaVersion: 1, edition: 'V5', date: '2026-11-25',
  historicalRepositoryRoot: root, historicalSourceDirectory: sourceDir,
  purpose: 'Rebuild the consolidated catalogue, workbook and runtime assignments from the repository. This does not promise deterministic replay of image generation.',
  sources: included, acceptedOutputMappings: [...outputMappings.values()], externalReferenceMetadata: references,
  copiedThirdPartyBitmaps: 0, copiedRejectedGenerationBitmaps: 0,
  sourceLedgerCount: included.filter(f => f.sourceFile.endsWith('generated-assets.json')).length,
  metadataOnlyOfficialReferences: references.filter(r => r.disposition === 'third_party_reference_metadata_only').length,
  metadataOnlyQualificationBoards: references.filter(r => r.disposition === 'historical_qualification_board_metadata_only').length,
  omittedIntermediateInputs: references.filter(r => r.disposition === 'excluded_intermediate_input_not_replaced').length,
  buildDependencies: ['Archived source-ledgers JSON files', 'Versioned PNG masters and WebP exports', 'Versioned runtime TypeScript tables', 'INFERNAL_VERSUS_BIBLE_V4.xlsx', 'Primary document runtime for workbook authoring'],
  limits: ['Historical absolute paths are retained as provenance only. Portable output mappings and relative repository paths identify the retained artifacts.', 'Third-party preview and rejected edit-input pixels are not distributed. Their checksums and source pointers document the original review boundaries.'],
};
await fs.writeFile(path.join(destination, 'archive-index.json'), JSON.stringify(index, null, 2) + '\n');
const readme = `# Sources de production V5

Cette archive conserve les huit registres acceptés, leurs prompts/files de génération, les notes de revue, les audits et les preuves techniques. Les JSON source sont copiés à l’octet ; leur ancien chemin de travail est une provenance historique. Les chemins relatifs des fichiers conservés et leurs SHA-256 figurent dans [l’index](archive-index.json).

Les masters PNG, exports WebP et modèles du projet sont déjà dans le dépôt. Les sources de sortie sont remappées vers un master uniquement après comparaison de SHA-256. Les captures officielles consultées sont documentées par URL, source, temps approximatif, résolution et empreinte dans les index ; aucun de leurs bitmaps n’est publié ici. Les quinze entrées d’images intermédiaires utilisées avant correction restent identifiées comme exclues, et ne sont jamais remplacées silencieusement par le master final.

## Régénérer les données et la bible

Depuis la racine du dépôt, la consolidation ne nécessite plus l’ancien dossier de travail :

\`\`\`bash
node docs/standalone/consolidate-static-production-v5.mjs
python docs/standalone/production-v5/recipes/sync-narrative-registry.py --all-reviewed-ledgers --dry-run
\`\`\`

La seconde recette est un script Python : l’exécuter avec Python pour consulter l’aide ou reconstruire les affectations avec \`--all-reviewed-ledgers --dry-run\`. Les options \`--root\` et \`--source-dir\` permettent un contrôle sur une copie isolée. La recette d’export possède également un mode de vérification sans écriture.

Le builder \`build-static-production-v5.mjs --prepare\` utilise les deux JSON consolidés pour produire un relevé sans classeur. Avec le runtime documentaire principal, \`--final --output <dossier>\` vérifie les images, conserve les 34 feuilles V4 et ajoute les six vues V5. L’édition finale préserve les propositions de lore et les preuves des versions antérieures.

Cette reproductibilité concerne le suivi, le classeur, les associations et les fichiers acceptés. Une génération d’image est stochastique ; les prompts et références ne sont pas présentés comme un moyen de retrouver exactement les mêmes pixels. Les deux refus conservés ne sont pas inclus dans une file de relance.
`;
await fs.writeFile(path.join(destination, 'README.md'), readme);
await fs.copyFile(path.join(sourceDir, 'qa-runtime-final.json'), path.join(here, 'QA_RUNTIME_STATIC_V5_2026-11-25.json'));
await fs.copyFile(path.join(sourceDir, 'qa-filtered-build-final.json'), path.join(here, 'QA_FILTERED_BUILD_V5_2026-11-25.json'));
console.log(JSON.stringify({ archive: destination, files: included.length + 2, acceptedLedgers: index.sourceLedgerCount, metadataReferences: references.length, thirdPartyBitmaps: 0, rejectedBitmaps: 0 }));
