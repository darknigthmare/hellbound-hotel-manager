import fs from 'node:fs';
import path from 'node:path';
import { createRequire, registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = pathToFileURL(path.join(root, 'src') + path.sep).href;
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
    const output = ts.transpileModule(fs.readFileSync(new URL(url), 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
    });
    return { format: 'module', source: output.outputText, shortCircuit: true };
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
function asset(url) {
  if (!url) return null;
  paths.add(url);
  if (!fs.existsSync(path.join(root, 'public', url))) missing.add(url);
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
  referencedAssets: paths.size,
  brokenReferences: [...missing],
};

const globalIllustrations = runtime.CAMPAIGN_ILLUSTRATIONS_V4.filter(entry => entry.scope === 'global');
for (const illustration of globalIllustrations) asset(illustration.src);
const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'art/infernal-versus/production/reserve-assets.json'), 'utf8'));
for (const entry of catalogue.assets) asset(entry.export.replace(/^public/, ''));
summary.globalIllustrations = globalIllustrations.length;
summary.reserveGalleryEntries = catalogue.assets.length;
summary.referencedAssets = paths.size;
summary.brokenReferences = [...missing];
const report = {
  schemaVersion: 1,
  scope: 'Current registered fighter/stage/effect, V3 personal and global illustration, and reserve-gallery export paths. Historical V1 narrative artwork is preserved separately and not reassigned to V3.',
  summary,
  stages,
  missingPersonalIllustrations: fighters.flatMap(fighter => Object.entries(fighter.story).filter(([, value]) => !value).map(([beat]) => ({ fighterId: fighter.id, beat }))),
  fidelityOneToOneCertified: false,
  browserReview: 'Scoped V12 browser observations are recorded separately in production-v12/browser-qa.json; this path audit does not certify rendering.',
};
fs.writeFileSync(path.join(root, 'docs/standalone/production-v12/active-asset-coverage.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
if (missing.size) process.exitCode = 1;
