/** Run the existing gates with disk-efficient, byte-identical public assets.
 * Bundles use the normal Vite configuration. Only public copying is replaced
 * by hard links on the same filesystem, avoiding two extra copies of the art.
 */
import fs from 'node:fs/promises';
import { writeFileSync, createReadStream } from 'node:fs';
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
const fingerprint = async file => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path.join(root, file))) hash.update(chunk);
  return hash.digest('hex');
};
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
    ...(await walk(path.join(root, 'public/assets/production/v12'))).map(file => `public/assets/production/v12/${file}`),
    ...(await walk(path.join(root, 'public/assets/production/v13'))).map(file => `public/assets/production/v13/${file}`),
    ...(await walk(path.join(root, 'public/assets/production/v14'))).map(file => `public/assets/production/v14/${file}`),
    'art/infernal-versus/production/reserve-assets.json', 'package.json', 'package-lock.json',
    'vite.config.ts', 'eslint.config.js', 'tsconfig.json',
    'scripts/finalize-standalone.mjs', 'scripts/check-standalone.mjs',
  ].sort();
}
const inputs = await runtimeInputs();
const before = [];
for (const file of inputs) before.push({ path: file, sha256: await fingerprint(file) });

function checkpoint(activeGate) {
  writeFileSync(path.join(here, 'runtime-qa.json'), JSON.stringify({
    edition: 'V14', status: 'running', startedAt, updatedAt: new Date().toISOString(),
    activeGate, gates, runtimeInputFilesBefore: before,
    log: 'docs/standalone/production-v14/qa-runtime.log',
  }, null, 2) + '\n');
}
checkpoint('preflight');

function run(command, arguments_, gate) {
  // Bound each gate's heap while retaining the existing npm commands,
  // single test worker and test isolation settings.
  const oldSpaceMiB = gate === 'typecheck' ? 320 : 384;
  const semiSpaceMiB = gate === 'typecheck' ? 4 : 8;
  const gateEnv = { ...process.env, NODE_OPTIONS: `--max-old-space-size=${oldSpaceMiB} --max-semi-space-size=${semiSpaceMiB}` };
  checkpoint(gate);
  const result = spawnSync(command, arguments_, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, env: gateEnv });
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  gates.push({ gate, command: [command, ...arguments_].join(' '), exitCode: result.status, signal: result.signal, nodeOptions: gateEnv.NODE_OPTIONS ?? null });
  checkpoint(gate + '-finished');
  if (result.status !== 0) throw new Error(`${gate} failed: ${result.error ?? result.signal ?? result.status}`);
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
  run(process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit'], 'typecheck');
  run(process.execPath, ['node_modules/eslint/bin/eslint.js', '.', '--max-warnings=0'], 'lint');
  const tests = run(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', '--maxWorkers=1'], 'tests');
  const testSuites = Number(tests.match(/Test Files\s+(\d+) passed/)?.[1]);
  const testsPassed = Number(tests.match(/Tests\s+(\d+) passed/)?.[1]);
  if (!testSuites || !testsPassed) throw new Error('Cannot determine actual Vitest results.');
  // A fresh process for each build releases the bundler's native allocations
  // between modes; the Vite configuration and generated files are unchanged.
  run(process.execPath, [path.join(here, 'build-runtime.mjs'), 'manager'], 'manager-build');
  const managerPublicFiles = await linkPublic('dist');
  gates.at(-1).publicFilesLinked = managerPublicFiles;
  checkpoint('manager-public-linked');
  run(process.execPath, [path.join(here, 'build-runtime.mjs'), 'standalone'], 'standalone-build');
  const standalonePublicFiles = await linkPublic('dist-combat');
  gates.at(-1).publicFilesLinked = standalonePublicFiles;
  checkpoint('standalone-public-linked');
  run(process.execPath, ['scripts/finalize-standalone.mjs'], 'standalone-packaging');
  const integrityOutput = run(process.execPath, ['scripts/check-standalone.mjs'], 'standalone-integrity');
  const manifestFile = (await walk(path.join(root, 'dist-combat'))).find(file => /manifest.*\.json$/.test(file) && !file.includes('/'));
  const after = [];
  for (const file of await runtimeInputs()) after.push({ path: file, sha256: await fingerprint(file) });
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Runtime inputs changed during verification; rerun required.');
  const report = {
    edition: 'V14', status: 'passed', startedAt, completedAt: new Date().toISOString(),
    summary: `${testsPassed} tests dans ${testSuites} suites ; typecheck, lint, builds manager et standalone puis contrôle d’intégrité de la distribution.`,
    command: `NODE_OPTIONS="${process.env.NODE_OPTIONS ?? ''}" node docs/standalone/production-v14/verify-runtime.mjs`,
    standardQaScriptPassed: false,
    resourcePolicy: 'Sequential streaming fingerprints avoid retaining all input file buffers. TypeScript, ESLint and Vitest are invoked directly with the exact arguments of their package scripts, avoiding an extra npm supervisor process. TypeScript uses 320 MiB old-space and 4 MiB semi-space; other gates use 384 MiB and 8 MiB. Each Vite build runs in a fresh child process. Existing tests, worker count and isolation are unchanged. Gate checkpoints persist before and after each subprocess.',
    buildMethod: 'Configuration Vite normale ; copyPublicDir:false, puis liens physiques vers chaque fichier public sur le même système de fichiers. Le contenu et le packaging final sont vérifiés. npm run qa standard non exécuté comme commande unique.',
    testsPassed, testSuites, validatedAcceptedDrawings: JSON.parse(await fs.readFile(path.join(here, 'delivery-register.json'), 'utf8')).assets.length,
    managerBuild: 'passed', standaloneBuild: 'passed', gates,
    standaloneIntegrityOutput: integrityOutput.trim(),
    standaloneManifest: manifestFile ? `dist-combat/${manifestFile}` : null,
    standaloneManifestSha256: manifestFile ? await fingerprint(`dist-combat/${manifestFile}`) : null,
    runtimeInputFiles: after,
    runtimeInputFingerprint: createHash('sha256').update(JSON.stringify(after)).digest('hex'),
    log: 'docs/standalone/production-v14/qa-runtime.log',
  };
  await fs.writeFile(path.join(here, 'runtime-qa.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, testsPassed, testSuites, managerPublicFiles, standalonePublicFiles }));
} catch (error) {
  await fs.writeFile(path.join(here, 'runtime-qa.json'), JSON.stringify({ edition: 'V14', status: 'failed', startedAt, completedAt: new Date().toISOString(), gates, error: String(error) }, null, 2) + '\n');
  console.error(error);
  process.exitCode = 1;
}
