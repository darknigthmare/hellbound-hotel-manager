import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

// Run only after extracting the verified CI artifact, with its directory as the web root:
// node docs/standalone/production-v17/audit-runtime-coverage.mjs --bundle-dir /path/to/dist-combat
// This evaluates local source registrations and checks bundle bytes; it does not render the app.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const { values } = parseArgs({ options: { 'bundle-dir': { type: 'string' } }, allowPositionals: false });
if (!values['bundle-dir']) throw new Error('Required: --bundle-dir <extracted CI standalone artifact directory>. No public/ fallback is used.');
const bundleDir = fs.realpathSync(path.resolve(values['bundle-dir']));
const manifestBytes = fs.readFileSync(path.join(bundleDir, 'standalone-manifest.json'));
const manifest = JSON.parse(manifestBytes.toString('utf8'));
if (manifest.entry !== 'index.html' || !Array.isArray(manifest.files) || !manifest.files.length || !fs.existsSync(path.join(bundleDir, 'index.html'))) {
  throw new Error('Expected a complete standalone artifact with index.html and standalone-manifest.json.');
}
const manifestFiles = new Map();
for (const file of manifest.files) {
  if (!file.path || path.isAbsolute(file.path) || file.path.split('/').includes('..') || manifestFiles.has(file.path)) {
    throw new Error(`Invalid manifest path: ${file.path}`);
  }
  manifestFiles.set(file.path, file);
}
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const source = pathToFileURL(path.join(root, 'src') + path.sep).href;
const sourceFiles = new Map();
// These legacy imports contain only declared types. TypeScript normally elides them;
// Node's native transformer requires the type annotation explicitly, in memory only.
const legacyTypeOnlyImports = new Map([
  ['src/expansions/helluva-boss/data.ts', "import { HelluvaBossSpoilerScope } from '../../types';"],
  ['src/lib/lore-validation.ts', "import { CanonStatus, LoreEntry, SourceType, SpoilerLevel, TimelineScope } from '../types';"],
]);
const appliedTypeOnlyAnnotations = [];
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (context.parentURL?.startsWith(source) && specifier.startsWith('.') && !path.extname(specifier)) {
      const file = new URL(specifier + '.ts', context.parentURL);
      return next(fs.existsSync(file) ? file.href : specifier + '/index.ts', context);
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (!url.startsWith(source) || !url.endsWith('.ts')) return next(url, context);
    const code = fs.readFileSync(new URL(url), 'utf8');
    const sourcePath = path.relative(root, fileURLToPath(url));
    sourceFiles.set(sourcePath, sha256(code));
    let loaderCode = code;
    const legacyImport = legacyTypeOnlyImports.get(sourcePath);
    if (legacyImport) {
      const declarationsPath = 'src/types/index.ts';
      const declarations = fs.readFileSync(path.join(root, declarationsPath), 'utf8');
      const declaredTypes = new Set([...declarations.matchAll(/^export\s+(?:type|interface)\s+(\w+)/gm)].map(match => match[1]));
      const names = legacyImport.match(/\{([^}]+)\}/)[1].split(',').map(name => name.trim());
      if (!code.startsWith(legacyImport + '\n') || names.some(name => !declaredTypes.has(name))) {
        throw new Error(`Legacy type-only import changed; review native loader compatibility: ${sourcePath}`);
      }
      loaderCode = code.replace(legacyImport, legacyImport.replace('import {', 'import type {'));
      sourceFiles.set(declarationsPath, sha256(declarations));
      appliedTypeOnlyAnnotations.push({ path: sourcePath, types: names, declarationSource: declarationsPath });
    }
    return {
      format: 'module',
      source: stripTypeScriptTypes(loaderCode, { mode: 'transform', sourceUrl: url }),
      shortCircuit: true,
    };
  },
});
let runtime;
try {
  const modules = await Promise.all(['standalone/roster', 'standalone/campaign', 'standalone/campaign-illustrations-v4', 'lib/pentagram-stages',
    'lib/infernal-appearances', 'lib/infernal-finishers', 'lib/character-sprites', 'lib/infernal-attack-effects']
    .map(module => import(source + module + '.ts')));
  runtime = Object.assign({}, ...modules);
} finally {
  hooks.deregister();
}

const paths = new Set();
const missing = new Set();
const missingFromManifest = new Set();
const integrityMismatches = new Set();
let verifiedAssetHashes = 0;
function asset(url) {
  if (!url) return null;
  if (paths.has(url)) return url;
  paths.add(url);
  const relative = url.replace(/^\/+/, '');
  const target = path.resolve(bundleDir, relative);
  if (!target.startsWith(bundleDir + path.sep) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
    missing.add(url);
    return url;
  }
  const entry = manifestFiles.get(relative);
  if (!entry) {
    missingFromManifest.add(url);
    return url;
  }
  const bytes = fs.readFileSync(target);
  if (bytes.length !== entry.bytes || sha256(bytes) !== entry.sha256) integrityMismatches.add(url);
  else verifiedAssetHashes++;
  return url;
}
const fighters = runtime.STANDALONE_ROSTER.map(({ character, franchise }) => {
  const id = character.id;
  const sprite = runtime.getCombatSpriteAsset(id);
  const poses = runtime.INFERNAL_ACTION_POSES[id];
  const finish = runtime.INFERNAL_FINISHES[id];
  const individual = {
    ready: asset(poses?.ready ?? runtime.INFERNAL_STANCES[id]),
    guard: asset(poses?.guard),
    lightContact: asset(poses?.strike),
    hit: asset(poses?.recoil),
  };
  const costumes = (runtime.INFERNAL_COSTUMES[id] ?? []).map(outfit => ({
    id: outfit.id, name: outfit.name,
    poses: Object.fromEntries(['ready', 'strike', 'heavy', 'recoil', 'crouch', 'jump'].map(pose => [pose, asset(outfit[pose])])),
  }));
  const story = Object.fromEntries(['intro', 'rival', 'ending'].map(kind => [kind, asset(runtime.personalCampaignIllustration(id, 3, kind)?.src)]));
  return { id, name: character.name, franchise, portrait: asset(runtime.getStandalonePortrait(id)),
    fallbackPortrait: asset(sprite?.portrait), atlas: asset(sprite?.sheet),
    temporaryStaticFallback: asset(runtime.infernalFallbackPose(id, 'walk', null)),
    animationBanks: Object.fromEntries(Object.entries(sprite?.animationSheets ?? {}).map(([bank, url]) => [bank, asset(url)])),
    individual, costumes, finisherKeyPose: asset(finish?.impactSprite), separatedFinishProp: asset(finish?.detachedProp), story };
});
const stages = runtime.STANDALONE_STAGES.map(stage => {
  const planes = [asset(stage.imagePath), asset(stage.scenery?.middle), asset(stage.scenery?.near)].filter(Boolean);
  return { id: stage.id, name: stage.name, spoilerTier: stage.spoilerTier ?? null, defaultAvailable: stage.spoilerTier !== 'season_3', planes, planeCount: planes.length, thumbnail: asset(stage.thumbnailPath) };
});
const attackEffects = runtime.getInfernalAttackEffectEntries().map(([fighter, effect]) => ({
  fighter, id: effect.id, image: asset(effect.image), attacks: effect.attacks,
  canonStatus: effect.canonStatus,
  behavior: 'Visual overlay of existing attack timing and reach; no independent projectile physics or additional damage.',
}));
const summary = {
  fighters: fighters.length,
  individualReady: fighters.filter(fighter => fighter.individual.ready).length,
  individualGuard: fighters.filter(fighter => fighter.individual.guard).length,
  individualLightContact: fighters.filter(fighter => fighter.individual.lightContact).length,
  individualHit: fighters.filter(fighter => fighter.individual.hit).length,
  costumes: fighters.reduce((sum, fighter) => sum + fighter.costumes.length, 0),
  costumeKeyPoses: fighters.reduce((sum, fighter) => sum + fighter.costumes.reduce((n, outfit) => n + Object.values(outfit.poses).filter(Boolean).length, 0), 0),
  finisherKeyPoses: fighters.filter(fighter => fighter.finisherKeyPose).length,
  separatedFinishProps: fighters.filter(fighter => fighter.separatedFinishProp).length,
  storyAssignments: fighters.length * 3,
  illustratedStoryAssignments: fighters.reduce((sum, fighter) => sum + Object.values(fighter.story).filter(Boolean).length, 0),
  uniqueStoryIllustrations: new Set(fighters.flatMap(fighter => Object.values(fighter.story).filter(Boolean))).size,
  stages: stages.length,
  stagesAvailableWithoutSeasonThree: stages.filter(stage => stage.defaultAvailable).length,
  seasonThreeStagesRequiringOptIn: stages.filter(stage => !stage.defaultAvailable).length,
  threePlaneStages: stages.filter(stage => stage.planeCount === 3).length,
  twoPlaneStages: stages.filter(stage => stage.planeCount === 2).length,
  onePlaneStages: stages.filter(stage => stage.planeCount === 1).length,
  attackEffectImages: new Set(attackEffects.map(effect => effect.image)).size,
  attackEffectAssignments: attackEffects.reduce((sum, effect) => sum + effect.attacks.length, 0),
};

const globalIllustrations = runtime.CAMPAIGN_ILLUSTRATIONS_V4.filter(entry => entry.scope === 'global');
for (const illustration of globalIllustrations) asset(illustration.src);
const cataloguePath = 'art/infernal-versus/production/reserve-assets.json';
const catalogueBytes = fs.readFileSync(path.join(root, cataloguePath));
sourceFiles.set(cataloguePath, sha256(catalogueBytes));
const catalogue = JSON.parse(catalogueBytes.toString('utf8'));
for (const entry of catalogue.assets) asset(entry.export.replace(/^public/, ''));
summary.globalIllustrations = globalIllustrations.length;
summary.reserveGalleryEntries = catalogue.assets.length;
summary.referencedAssets = paths.size;
summary.verifiedAssetHashes = verifiedAssetHashes;
summary.brokenReferences = [...missing];
summary.referencesMissingFromManifest = [...missingFromManifest];
summary.assetIntegrityMismatches = [...integrityMismatches];
const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  auditType: 'local-source-registrations-against-ci-bundle',
  scope: 'Current registered fighter/stage/effect, V3 personal and global illustration, and reserve-gallery export paths. Historical V1 narrative artwork is preserved separately and not reassigned to V3.',
  sourceAudit: {
    nodeVersion: process.versions.node,
    loader: 'node:module registerHooks and stripTypeScriptTypes, transform mode; no npm TypeScript dependency',
    nativeLoaderCompatibility: {
      scope: 'Two verified legacy type-only imports are annotated in memory before native transformation. Source files remain unchanged and their original hashes are recorded.',
      appliedTypeOnlyAnnotations,
    },
    files: [...sourceFiles].sort(([a], [b]) => a.localeCompare(b)).map(([file, hash]) => ({ path: file, sha256: hash })),
    compiledApplicationExecuted: false,
    limitation: 'References are obtained from these local source files. Bundle files and manifest hashes are checked below; this does not establish source-to-commit identity or execute the compiled application.',
  },
  bundleAudit: {
    directory: bundleDir,
    manifestSha256: sha256(manifestBytes),
    manifestFiles: manifest.files.length,
    entry: manifest.entry,
    integrityScope: 'Unique active asset references only; other files in the manifest are outside this audit.',
    status: missing.size || missingFromManifest.size || integrityMismatches.size ? 'failed' : 'passed',
  },
  summary,
  stages,
  missingPersonalIllustrations: fighters.flatMap(fighter => Object.entries(fighter.story).filter(([, value]) => !value).map(([beat]) => ({ fighterId: fighter.id, beat }))),
  fidelityOneToOneCertified: false,
  browserReview: {
    status: 'not-performed-by-this-audit',
    reportPath: 'docs/standalone/production-v17/browser-gallery-qa.json',
    limitation: 'Rendering, interactions and in-game appearance require separate browser observations. Successful path and hash checks are not visual acceptance.',
  },
};
fs.writeFileSync(path.join(root, 'docs/standalone/production-v17/active-asset-coverage.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
if (missing.size || missingFromManifest.size || integrityMismatches.size) process.exitCode = 1;
