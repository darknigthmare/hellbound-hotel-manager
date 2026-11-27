/** Run the existing gates with disk-efficient, byte-identical public assets.
 * Bundles use the normal Vite configuration. Only public copying is replaced
 * by hard links on the same filesystem, avoiding two extra copies of the art.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stripVTControlCharacters } from 'node:util';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
process.chdir(root);
const startedAt = new Date().toISOString();
const gates = [];
const fingerprint = async file => createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex');
async function walk(directory, prefix = '') {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path.join(directory, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort();
}
async function runtimeInputs() {
  return [
    ...(await walk(path.join(root, 'src'))).map(file => `src/${file}`),
    ...(await walk(path.join(root, 'public/assets/production/v10'))).map(file => `public/assets/production/v10/${file}`),
    ...(await walk(path.join(root, 'public/assets/production/v11'))).map(file => `public/assets/production/v11/${file}`),
    'art/infernal-versus/production/reserve-assets.json', 'package.json', 'package-lock.json',
    'vite.config.ts', 'eslint.config.js', 'tsconfig.json',
    'scripts/finalize-standalone.mjs', 'scripts/check-standalone.mjs',
  ].sort();
}
const inputs = await runtimeInputs();
const before = await Promise.all(inputs.map(async file => ({ path: file, sha256: await fingerprint(file) })));

function run(command, arguments_, gate) {
  // Bound each gate's heap while retaining the existing npm commands,
  // single test worker and test isolation settings.
  const gateEnv = { ...process.env, NODE_OPTIONS: '--max-old-space-size=512' };
  const result = spawnSync(command, arguments_, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, env: gateEnv });
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  gates.push({ gate, command: [command, ...arguments_].join(' '), exitCode: result.status, nodeOptions: gateEnv.NODE_OPTIONS ?? null });
  if (result.status !== 0) throw new Error(`${gate} failed: ${result.error ?? result.status}`);
  return stripVTControlCharacters(`${result.stdout ?? ''}\n${result.stderr ?? ''}`);
}

async function linkPublic(output) {
  const files = await walk(path.join(root, 'public'));
  for (const file of files) {
    const target = path.join(root, output, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    try { await fs.link(path.join(root, 'public', file), target); }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const same = (await fs.stat(path.join(root, 'public', file))).ino === (await fs.stat(target)).ino;
      if (!same) throw new Error(`Unexpected existing public destination: ${target}`, { cause: error });
    }
  }
  return files.length;
}

try {
  run('npm', ['run', 'typecheck'], 'typecheck');
  run('npm', ['run', 'lint'], 'lint');
  const tests = run('npm', ['test'], 'tests');
  const testSuites = Number(tests.match(/Test Files\s+(\d+) passed/)?.[1]);
  const testsPassed = Number(tests.match(/Tests\s+(\d+) passed/)?.[1]);
  if (!testSuites || !testsPassed) throw new Error('Cannot determine actual Vitest results.');
  // Load the bundler only when its gates start, after the compiler and tests exit.
  const { build } = await import('vite');
  await build({ build: { copyPublicDir: false } });
  const managerPublicFiles = await linkPublic('dist');
  gates.push({ gate: 'manager-build', status: 'passed', publicFilesLinked: managerPublicFiles });
  await build({ mode: 'standalone', build: { copyPublicDir: false } });
  const standalonePublicFiles = await linkPublic('dist-combat');
  gates.push({ gate: 'standalone-build', status: 'passed', publicFilesLinked: standalonePublicFiles });
  run(process.execPath, ['scripts/finalize-standalone.mjs'], 'standalone-packaging');
  const integrityOutput = run(process.execPath, ['scripts/check-standalone.mjs'], 'standalone-integrity');
  const manifestFile = (await walk(path.join(root, 'dist-combat'))).find(file => /manifest.*\.json$/.test(file) && !file.includes('/'));
  const after = await Promise.all((await runtimeInputs()).map(async file => ({ path: file, sha256: await fingerprint(file) })));
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Runtime inputs changed during verification; rerun required.');
  const report = {
    edition: 'V11', status: 'passed', startedAt, completedAt: new Date().toISOString(),
    summary: `${testsPassed} tests dans ${testSuites} suites ; typecheck, lint, builds manager et standalone puis contrôle d’intégrité de la distribution.`,
    command: 'NODE_OPTIONS=--max-old-space-size=512 node docs/standalone/production-v11/verify-runtime.mjs',
    standardQaScriptPassed: false,
    resourcePolicy: 'Sequential gates; 512 MiB Node heap limit per process and deferred bundler import. Existing tests, worker count and isolation are unchanged.',
    buildMethod: 'Configuration Vite normale ; copyPublicDir:false, puis liens physiques vers chaque fichier public sur le même système de fichiers. Le contenu et le packaging final sont vérifiés. npm run qa standard non exécuté comme commande unique.',
    testsPassed, testSuites, validatedAcceptedDrawings: JSON.parse(await fs.readFile(path.join(here, 'delivery-register.json'), 'utf8')).assets.length,
    managerBuild: 'passed', standaloneBuild: 'passed', gates,
    standaloneIntegrityOutput: integrityOutput.trim(),
    standaloneManifest: manifestFile ? `dist-combat/${manifestFile}` : null,
    standaloneManifestSha256: manifestFile ? await fingerprint(`dist-combat/${manifestFile}`) : null,
    runtimeInputFiles: after,
    runtimeInputFingerprint: createHash('sha256').update(JSON.stringify(after)).digest('hex'),
    log: 'docs/standalone/production-v11/qa-runtime.log',
  };
  await fs.writeFile(path.join(here, 'runtime-qa.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, testsPassed, testSuites, managerPublicFiles, standalonePublicFiles }));
} catch (error) {
  await fs.writeFile(path.join(here, 'runtime-qa.json'), JSON.stringify({ edition: 'V11', status: 'failed', startedAt, completedAt: new Date().toISOString(), gates, error: String(error) }, null, 2) + '\n');
  console.error(error);
  process.exitCode = 1;
}
