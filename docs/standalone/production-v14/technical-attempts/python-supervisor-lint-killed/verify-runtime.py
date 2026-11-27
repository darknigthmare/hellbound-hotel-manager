"""Run unchanged project gates with a small supervisor and streamed input hashes.

The earlier Node supervisor was killed while TypeScript ran. A directly invoked
384 MiB TypeScript process passed. This supervisor keeps only small text reports
in memory and preserves all project compiler, lint, test and bundler arguments.
Public art is hard-linked after normal Vite builds to fit the workspace disk.
"""
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
os.chdir(ROOT)
NODE = os.environ.get('CODEX_PRIMARY_RUNTIME_NODE', 'node')
START = datetime.datetime.now(datetime.timezone.utc).isoformat()
GATES = []
REPORT = HERE / 'runtime-qa.json'


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def sha(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        while chunk := stream.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def walk(directory):
    return sorted(path for path in Path(directory).rglob('*') if path.is_file())


def inputs():
    paths = walk(ROOT / 'src')
    for edition in range(10, 15):
        paths += walk(ROOT / f'public/assets/production/v{edition}')
    paths += [ROOT / name for name in [
        'art/infernal-versus/production/reserve-assets.json', 'package.json', 'package-lock.json',
        'vite.config.ts', 'eslint.config.js', 'tsconfig.json',
        'scripts/finalize-standalone.mjs', 'scripts/check-standalone.mjs',
    ]]
    return [{'path': str(path.relative_to(ROOT)), 'sha256': sha(path)} for path in sorted(paths)]


BEFORE = inputs()


def save(data):
    REPORT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def checkpoint(gate):
    save({'edition': 'V14', 'status': 'running', 'startedAt': START, 'updatedAt': now(),
          'activeGate': gate, 'gates': GATES, 'runtimeInputFilesBefore': BEFORE,
          'log': 'docs/standalone/production-v14/qa-runtime.log'})


def run(arguments, gate):
    checkpoint(gate)
    env = os.environ.copy()
    semi = 4 if gate == 'typecheck' else 8
    env['NODE_OPTIONS'] = f'--max-old-space-size=384 --max-semi-space-size={semi}'
    began = time.monotonic()
    print(f'\n=== {gate}: {" ".join(map(str, arguments))} ===', flush=True)
    result = subprocess.run(list(map(str, arguments)), cwd=ROOT, env=env,
                            text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(result.stdout, end='', flush=True)
    GATES.append({'gate': gate, 'command': ' '.join(map(str, arguments)),
                  'exitCode': result.returncode, 'nodeOptions': env['NODE_OPTIONS'],
                  'durationSeconds': round(time.monotonic() - began, 3)})
    checkpoint(gate + '-finished')
    if result.returncode != 0:
        raise RuntimeError(f'{gate} failed with return code {result.returncode}')
    return re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', result.stdout)


def link_public(destination):
    files = walk(ROOT / 'public')
    for source in files:
        target = ROOT / destination / source.relative_to(ROOT / 'public')
        target.parent.mkdir(parents=True, exist_ok=True)
        try:
            os.link(source, target)
        except FileExistsError:
            if source.stat().st_ino != target.stat().st_ino or source.stat().st_dev != target.stat().st_dev:
                raise RuntimeError(f'Unexpected existing public destination: {target}')
    return len(files)


try:
    run([NODE, 'node_modules/typescript/bin/tsc', '--noEmit'], 'typecheck')
    run([NODE, 'node_modules/eslint/bin/eslint.js', '.', '--max-warnings=0'], 'lint')
    tests = run([NODE, 'node_modules/vitest/vitest.mjs', 'run', '--maxWorkers=1'], 'tests')
    suites = int(re.search(r'Test Files\s+(\d+) passed', tests)[1])
    passed = int(re.search(r'Tests\s+(\d+) passed', tests)[1])
    run([NODE, HERE / 'build-runtime.mjs', 'manager'], 'manager-build')
    manager_files = link_public('dist')
    GATES[-1]['publicFilesLinked'] = manager_files
    checkpoint('manager-public-linked')
    run([NODE, HERE / 'build-runtime.mjs', 'standalone'], 'standalone-build')
    standalone_files = link_public('dist-combat')
    GATES[-1]['publicFilesLinked'] = standalone_files
    checkpoint('standalone-public-linked')
    run([NODE, 'scripts/finalize-standalone.mjs'], 'standalone-packaging')
    integrity = run([NODE, 'scripts/check-standalone.mjs'], 'standalone-integrity')
    after = inputs()
    assert BEFORE == after, 'Runtime input files changed during verification.'
    manifests = sorted(p for p in (ROOT / 'dist-combat').iterdir() if p.is_file() and 'manifest' in p.name and p.suffix == '.json')
    assert len(manifests) == 1, f'A single standalone manifest is required: {manifests}'
    manifest = manifests[0]
    report = {
        'edition': 'V14', 'status': 'passed', 'startedAt': START, 'completedAt': now(),
        'summary': f'{passed} tests dans {suites} suites ; typecheck, lint, builds manager et standalone puis contrôle d’intégrité de la distribution.',
        'command': 'python docs/standalone/production-v14/verify-runtime.py',
        'standardQaScriptPassed': False,
        'resourcePolicy': 'Small Python supervisor; sequential streamed input hashes. TypeScript, ESLint and Vitest use the exact package script arguments without an npm supervisor. Each Node process has 384 MiB old-space; TypeScript has 4 MiB semi-space and other gates 8 MiB. Existing tests, one worker and isolation are unchanged. Each Vite build runs in a fresh process.',
        'buildMethod': 'Configuration Vite normale ; copyPublicDir:false puis liens physiques vers les fichiers public sur le même système de fichiers. Contenu et packaging final vérifiés. npm run qa standard non exécuté comme commande unique.',
        'testsPassed': passed, 'testSuites': suites,
        'validatedAcceptedDrawings': len(json.loads((HERE / 'delivery-register.json').read_text())['assets']),
        'managerBuild': 'passed', 'standaloneBuild': 'passed', 'gates': GATES,
        'standaloneIntegrityOutput': integrity.strip(),
        'standaloneManifest': str(manifest.relative_to(ROOT)), 'standaloneManifestSha256': sha(manifest),
        'runtimeInputFiles': after,
        'runtimeInputFingerprint': hashlib.sha256(json.dumps(after, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest(),
        'log': 'docs/standalone/production-v14/qa-runtime.log',
        'priorLocalAttempts': 'docs/standalone/production-v14/technical-attempts/',
        'supervisorImplementation': {'path': str(Path(__file__).relative_to(ROOT)), 'sha256': sha(Path(__file__))},
    }
    save(report)
    print(json.dumps({'status': 'passed', 'testsPassed': passed, 'testSuites': suites,
                      'managerPublicFiles': manager_files, 'standalonePublicFiles': standalone_files}), flush=True)
except BaseException as error:
    save({'edition': 'V14', 'status': 'failed', 'startedAt': START, 'completedAt': now(),
          'gates': GATES, 'runtimeInputFilesBefore': BEFORE, 'error': str(error),
          'log': 'docs/standalone/production-v14/qa-runtime.log'})
    print(str(error), file=sys.stderr, flush=True)
    raise
