"""Run the repository's unchanged complete QA command and record current inputs."""
from datetime import datetime, timezone
from hashlib import sha256
import json
import os
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent


def inputs():
    paths = list((ROOT / 'src').rglob('*')) + list((ROOT / 'public').rglob('*'))
    paths += [ROOT / name for name in [
        'art/infernal-versus/production/reserve-assets.json', 'package.json',
        'package-lock.json', 'eslint.config.js', 'vite.config.ts', 'tsconfig.json',
        'scripts/finalize-standalone.mjs', 'scripts/check-standalone.mjs',
    ]]
    return [{'path': str(path.relative_to(ROOT)), 'sha256': sha256(path.read_bytes()).hexdigest()}
            for path in sorted(paths) if path.is_file()]


def now():
    return datetime.now(timezone.utc).isoformat()


before = inputs()
report = {
    'edition': 'V16', 'status': 'running', 'startedAt': now(),
    'command': 'npm run qa', 'runtimeInputFilesBefore': before,
    'log': 'docs/standalone/production-v16/qa-runtime.log',
}
def save():
    (HERE / 'runtime-qa.json').write_text(json.dumps(report, indent=2) + '\n')


save()
env = os.environ.copy()
env.update(ROLLDOWN_WORKER_THREADS='2', RAYON_NUM_THREADS='2')
with (HERE / 'qa-runtime.log').open('w') as log:
    process = subprocess.run(['npm', 'run', 'qa'], cwd=ROOT, env=env, stdout=log, stderr=subprocess.STDOUT)
after = inputs()
text = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', (HERE / 'qa-runtime.log').read_text())
tests = re.search(r'\bTests\s+(\d+) passed', text)
suites = re.search(r'Test Files\s+(\d+) passed', text)
report.update(
    status='passed' if process.returncode == 0 and before == after else 'failed',
    completedAt=now(), exitCode=process.returncode, runtimeInputFilesAfter=after,
    standardQaScriptPassed=process.returncode == 0,
    testsPassed=int(tests[1]) if tests else 0, testSuites=int(suites[1]) if suites else 0,
    managerBuild='passed' if process.returncode == 0 else 'see_log',
    standaloneBuild='passed' if process.returncode == 0 else 'see_log',
    logSha256=sha256((HERE / 'qa-runtime.log').read_bytes()).hexdigest(),
    nativeConcurrencyLimits={'ROLLDOWN_WORKER_THREADS': '2', 'RAYON_NUM_THREADS': '2'},
    buildMethod='Unchanged standard npm run qa; two native bundler workers. No test, compiler, lint or packaging gate skipped.',
    limitations=['Browser and artistic fidelity checks are recorded separately.', 'Vite chunk-size warnings do not certify a performance budget.'],
)
save()
print(json.dumps({key: report[key] for key in ['status', 'exitCode', 'testsPassed', 'testSuites', 'standardQaScriptPassed']}))
raise SystemExit(0 if report['status'] == 'passed' else 1)
