"""Aggregate only completed V14 browser segments; no browser execution here."""
from pathlib import Path
import datetime
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
OUT = HERE.parent
TMP = Path('/tmp/infernal-v14/browser')
RECIPE_PATH = HERE / 'recipe.json'
recipe = json.loads(RECIPE_PATH.read_text())
if recipe['status'] != 'runtime_frozen_execution_authorized':
    raise RuntimeError('Root runtime freeze is required before evidence assembly.')

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def meta(path):
    p = Path(path)
    return {'path': str(p.relative_to(ROOT)), 'sha256': digest(p), 'bytes': p.stat().st_size}

segments = [c['id'] for c in recipe['combats']] + ['gallery']
runs = []
seen_pairs = set()
expected_pairs = {(v['name'], segment) for v in recipe['viewports'] for segment in segments}
if len(expected_pairs) != 8:
    raise RuntimeError('Exactly eight distinct viewport/segment pairs are required.')
source_runs = []
seen_pairs = set()
expected_pairs = {(v['name'], segment) for v in recipe['viewports'] for segment in segments}
if len(expected_pairs) != 8:
    raise RuntimeError('Exactly eight distinct viewport/segment pairs are required.')
shots = []
checks = []
integrity = []
for viewport in recipe['viewports']:
    for segment in segments:
        key = f"{viewport['name']}-{segment}"
        src = TMP / key / 'browser-qa-run.json'
        run = json.loads(src.read_text())
        pair = (viewport['name'], segment)
        if pair in seen_pairs or run.get('requestedSegment') != segment or run.get('viewports') != [viewport]:
            raise RuntimeError(f'Segment or viewport identity mismatch: {key}')
        sessions = run.get('browserSessions', [])
        if len(sessions) != 1 or sessions[0].get('viewport') != viewport['name'] or sessions[0].get('segment') != segment or sessions[0].get('status') != 'completed' or sessions[0].get('cleanup', {}).get('method') != 'graceful':
            raise RuntimeError(f'Expected one completed, closed browser session for {key}')
        if run.get('harness', {}).get('sha256') != digest(HERE / 'run-segment.cjs'):
            raise RuntimeError(f'Executed harness differs from published source for {key}')
        seen_pairs.add(pair)
        if run['status'] != 'passed_targeted_segment_checks_pending_visual_review':
            raise RuntimeError(f'Segment is not passed: {key}: {run["status"]}')
        if run.get('executionError') or not all(c['passed'] for c in run['checks']):
            raise RuntimeError(f'Failed checks in {key}')
        if run['recipe']['sha256'] != digest(RECIPE_PATH):
            raise RuntimeError(f'Recipe changed for {key}')
        dest = HERE / 'segments' / f'{key}.json'
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest)
        source_runs.append({'segment': key, **meta(dest), 'originalPath': str(src), 'status': run['status'], 'checkCount': len(run['checks']), 'screenshotCount': len(run['screenshots'])})
        checks.extend({**c, 'sourceSegment': key} for c in run['checks'])
        integrity.append({'name': f'{key}: source and packaged artifact stable', 'passed': run['runtimeFilesBefore'] == run['runtimeFilesAfter'] and run['servedBuildBefore'] == run['servedBuildAfter']})
        for shot in run['screenshots']:
            source_image = Path(shot['internalPath'])
            if digest(source_image) != shot['sha256']:
                raise RuntimeError(f'Capture hash mismatch: {source_image}')
            capture_dir = OUT / 'browser-captures' / key
            capture_dir.mkdir(parents=True, exist_ok=True)
            target = capture_dir / source_image.name
            shutil.copyfile(source_image, target)
            shots.append({'label': shot['label'], 'sourceSegment': key, 'viewport': viewport['name'], 'path': str(target.relative_to(ROOT)), 'sha256': digest(target), 'bytes': target.stat().st_size, 'originalPath': str(source_image)})
        runs.append(run)

if seen_pairs != expected_pairs:
    raise RuntimeError('The eight distinct viewport/segment pairs are incomplete.')
base = runs[0]
for key in ['runtimeFilesBefore', 'runtimeFilesAfter', 'servedBuildBefore', 'servedBuildAfter']:
    integrity.append({'name': f'All eight segments agree on {key}', 'passed': all(r[key] == base[key] for r in runs)})
integrity.append({'name': 'All segments use the same executed harness bytes', 'passed': len({r['harness']['sha256'] for r in runs}) == 1})
integrity.append({'name': 'All segments disable GPU acceleration and keep default soundtrack', 'passed': all('--disable-gpu' in r['browserLaunch']['args'] and all(o['checked'] and not o['modified'] for o in r['soundtrackObservations']) for r in runs)})
if not all(c['passed'] for c in integrity):
    raise RuntimeError('Aggregate evidence integrity finding.')
fields = ['screens', 'sceneryMeasurements', 'movementSamples', 'assetEvidence', 'referenceLinkGroups', 'browserSessions', 'soundtrackObservations', 'trainingControlDiagnostics', 'stageFilterObservations', 'chromiumPerformance', 'rendererLifecycle', 'consoleErrors', 'pageErrors', 'failedRequests', 'httpErrors', 'assetResponses']
combined = {key: [{**item, 'sourceSegment': f"{r['viewports'][0]['name']}-{r['requestedSegment']}"} for r in runs for item in r.get(key, [])] for key in fields}
covered = []
for aid in recipe['expectedAssetIds']:
    passes = all(any(e['id'] == aid and e['viewport'] == v['name'] and e['passed'] for e in combined['assetEvidence']) for v in recipe['viewports'])
    integrity.append({'name': f'{aid}: observed in both viewports', 'passed': passes})
    if passes:
        covered.append(aid)
if covered != recipe['expectedAssetIds']:
    raise RuntimeError('Not all accepted drawings have both viewport observations.')
visual_path = HERE / 'visual-review.json'
visual = json.loads(visual_path.read_text()) if visual_path.exists() else None
expected_capture_hashes = {shot['path']: shot['sha256'] for shot in shots}
reviewed_capture_hashes = {entry['path']: entry['sha256'] for entry in visual.get('captureEvidence', [])} if visual else {}
visual_passed = bool(visual and visual.get('status') == 'accepted_with_limits'
    and set(visual.get('reviewedCapturePaths', [])) == set(expected_capture_hashes)
    and reviewed_capture_hashes == expected_capture_hashes
    and len(visual.get('captureEvidence', [])) == len(expected_capture_hashes)
    and visual.get('recipeSha256') == digest(RECIPE_PATH)
    and visual.get('executedHarnessSha256') == digest(HERE / 'run-segment.cjs'))
counts = {
    'automatedChecks': len(checks), 'failedChecks': sum(not c['passed'] for c in checks),
    'evidenceIntegrityChecks': len(integrity), 'sourceRuns': len(runs), 'targetedAggregate': True,
    'checkedAssetIds': len(covered), 'newGalleryEntries': 5, 'galleryEntriesReported': recipe['expectedGalleryCount'],
    'newStageBackgrounds': 2, 'newStageSceneryProps': 0, 'newReserveProps': 2, 'newSelectableCostumes': 3,
    'newPlayableKits': 0, 'newStandaloneBases': 0, 'newAnimationCycles': 0,
    'combatSessions': sum(r['requestedSegment'] != 'gallery' for r in runs), 'isolatedBrowserSessions': len(runs),
    'continuousLongSessionCertified': False, 'screenshots': len(shots),
    'visuallyReviewedCaptures': len(visual.get('reviewedCapturePaths', [])) if visual else 0,
    'officialReferenceLinkGroups': len(combined['referenceLinkGroups']),
    'runtimeFingerprintFiles': len(base['runtimeFilesBefore']), 'servedBuildFingerprintFiles': len(base['servedBuildBefore']['files']),
    'servedManifestFiles': base['servedBuildBefore']['manifestFileCount'],
    **{field: len(combined[field]) for field in ['consoleErrors', 'pageErrors', 'httpErrors', 'failedRequests']},
}
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
report = {
    'edition': 'V14', 'schemaVersion': 1, 'status': 'passed' if visual_passed else 'passed_automated_browser_checks_pending_visual_review',
    'evidenceType': 'targeted_aggregate_of_eight_completed_independent_segments', 'continuousRunCertified': False,
    'scope': 'Seven accepted V14 drawings: three selectable static costumes, two reserve props and two new backgrounds, on desktop and mobile touch emulation.',
    'server': base['server'], 'viewports': recipe['viewports'], 'expectedAssetIds': recipe['expectedAssetIds'],
    'regressionAssetIds': ['hz_crymini-legacy-2017-base'], 'galleryCountExpected': recipe['expectedGalleryCount'], 'checkedAssetIds': covered,
    'checks': checks, 'evidenceIntegrityChecks': integrity, 'sourceRuns': source_runs, 'screenshots': shots, **combined,
    'recipe': meta(RECIPE_PATH), 'runtimeFilesBefore': base['runtimeFilesBefore'], 'runtimeFilesAfter': base['runtimeFilesAfter'],
    'servedBuildBefore': base['servedBuildBefore'], 'servedBuildAfter': base['servedBuildAfter'], 'rootRuntimeFreezeEvidence': recipe['authorization'],
    'browserVersion': base['browserVersion'], 'browserLaunch': base['browserLaunch'],
    'startedAt': min(r['startedAt'] for r in runs), 'finishedAt': max(r['finishedAt'] for r in runs), 'assembledAt': now,
    'harness': meta(HERE / 'run-segment.cjs'), 'counts': counts,
    'limits': recipe['limits'], 'priorVersionLimitEvidence': meta(ROOT / 'docs/standalone/production-v13/browser-qa.json'),
    'priorV14AttemptEvidence': meta(HERE / 'initial-attempts.json') if (HERE / 'initial-attempts.json').exists() else None,
    'initialV14AttemptsExcludedFromSuccessCounts': True,
    'visualReview': meta(visual_path) if visual else {'status': 'pending'},
    'fidelityOneToOneCertified': False,
    'summary': f"Validation ciblée de sept dessins V14 : {len(checks)} assertions d’interaction et {len(integrity)} contrôles d’intégrité issus de huit sessions Chromium indépendantes. Trois tenues contrôlées dans le vestiaire et en combat statique sur chaque viewport ; deux nouveaux fonds et cinq nouvelles fiches observés. Revue visuelle {'acceptée avec limites' if visual_passed else 'en attente'}. Aucune certification de session longue ou de cause résolue pour les anciennes instabilités.",
}
(OUT / 'browser-qa.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
placement = {
    'edition': 'V14', 'status': 'browser_verified_with_documented_limits' if visual_passed else 'automated_browser_verified_pending_visual_review',
    'stages': [{'id': s['id'], 'roomId': s['roomId'], 'measurements': [m for m in combined['sceneryMeasurements'] if m['stageId'] == s['id']], 'accepted': visual_passed} for s in recipe['stages']],
    'sceneryNote': 'One opaque image per new arena. Zero independent scenery props; the chandelier remains a separate reserve gallery item.',
    'browserEvidence': meta(OUT / 'browser-qa.json'),
    'limits': ['Source-guided gameplay floor/framing adaptations, not exact canonical geometry.', 'Contained backgrounds may retain viewport-dependent solid-color margins.', 'Crimson ceiling mount is clipped in the authored background; separate chandelier prop is whole.'],
}
(OUT / 'runtime-placement.json').write_text(json.dumps(placement, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'status': report['status'], 'counts': counts, 'captureBytes': sum(s['bytes'] for s in shots)}, ensure_ascii=False))
