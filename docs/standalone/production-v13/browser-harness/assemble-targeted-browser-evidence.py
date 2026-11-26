from pathlib import Path
import copy, datetime, hashlib, json, shutil

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / 'docs/standalone/production-v13/browser-harness'
TMP = Path('/tmp/infernal-v13/browser')
digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
read = lambda path: json.loads(path.read_text())
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()

mobile_dir = OUT / 'mobile-final-segments'
mobile_dir.mkdir(parents=True, exist_ok=True)
mobile_tmp = TMP / 'mobile-final'
mobile = read(mobile_tmp / 'browser-qa-run.json')
assert mobile['status'] == 'passed_targeted_mobile_checks_pending_visual_review'
assert all(check['passed'] for check in mobile['checks'])
for name in ['browser-qa-run.json', 'static-server-log.txt']:
    shutil.copy2(mobile_tmp / name, mobile_dir / name)
shutil.copy2(TMP / 'mobile-final-output.log', mobile_dir / 'browser-output.log')
for shot in mobile['screenshots']:
    original = Path(shot['internalPath'])
    assert digest(original) == shot['sha256']
    shutil.copy2(original, mobile_dir / original.name)

source_specs = [
    {'id': 'desktop-combats', 'path': OUT / 'attempts/attempt-7/browser-qa-run.json', 'sha256': '6ee39f535ce7bcbcb11049a05d26b411bea0a95769f63fa931144f614ea1a3f7', 'viewport': 'desktop', 'segments': ['dhorks-control-room-s1', 'unhappy-campers-boathouse-s2']},
    {'id': 'desktop-gallery', 'path': OUT / 'gallery-software-diagnostic/browser-qa-run.json', 'sha256': 'fab41e074140115baede872278bf22fe56fb82067916415b2dcbd0579374c811', 'viewport': 'desktop', 'segments': ['gallery']},
    {'id': 'mobile-segments', 'path': mobile_dir / 'browser-qa-run.json', 'sha256': 'a1d85c3d0ef4dfa6a83832ff75dbbf08b6e00e9358cb7f4e13b2e2a851f0c422', 'viewport': 'mobile', 'segments': ['dhorks-control-room-s1', 'unhappy-campers-boathouse-s2', 'gallery']},
]
recipe = read(OUT / 'recipe.json')
stage_ids = [stage['id'] for stage in recipe['stages']]
stage_asset_ids = {stage['roomId'] for stage in recipe['stages']}
expected_ids = recipe['expectedAssetIds']
aggregate = {
    'edition': 'V13', 'schemaVersion': 2,
    'status': 'passed_automated_browser_checks_pending_visual_review',
    'evidenceType': 'targeted_aggregate_of_completed_segments',
    'continuousRunCertified': False,
    'scope': 'Targeted qualification of seven V13 creations, assembled from six completed independent browser segments on an identical production package. This is not one continuous browser pass. Previous failed runs retain their original status.',
    'server': 'http://127.0.0.1:5180/index.html',
    'viewports': recipe['viewports'], 'expectedAssetIds': expected_ids,
    'regressionAssetIds': ['hz_crymini-legacy-2017-base', 'hb_loona-party-queen-bee'],
    'galleryCountExpected': 133, 'checkedAssetIds': [], 'checks': [],
    'evidenceIntegrityChecks': [], 'sourceRuns': [], 'screenshots': [],
    'screens': [], 'sceneryMeasurements': [], 'movementSamples': [],
    'assetEvidence': [], 'referenceLinkGroups': [], 'browserSessions': [],
    'soundtrackObservations': [], 'trainingControlDiagnostics': [],
    'stageFilterObservations': [], 'chromiumPerformance': [],
    'rendererLifecycle': [], 'consoleErrors': [], 'pageErrors': [],
    'failedRequests': [], 'httpErrors': [], 'assetResponses': [],
    'recipe': {'path': str((OUT / 'recipe.json').relative_to(ROOT)), 'sha256': digest(OUT / 'recipe.json')},
}

def integrity(name, passed, detail=None):
    assert passed, name
    aggregate['evidenceIntegrityChecks'].append({'name': name, 'passed': True, **({'detail': detail} if detail is not None else {})})

for spec in source_specs:
    assert digest(spec['path']) == spec['sha256']
    source = read(spec['path'])
    evidence = {'sourceId': spec['id'], 'path': str(spec['path'].relative_to(ROOT)), 'sha256': spec['sha256'], 'originalStatus': source['status']}
    sessions = [session for session in source['browserSessions'] if session['viewport'] == spec['viewport'] and session['segment'] in spec['segments']]
    assert len(sessions) == len(spec['segments'])
    assert all(session['status'] == 'completed' and session['cleanup']['method'] == 'graceful' for session in sessions)
    assert source['runtimeFilesBefore'] == source['runtimeFilesAfter']
    assert source['servedBuildBefore'] == source['servedBuildAfter']
    if 'runtimeFilesBefore' not in aggregate:
        aggregate['runtimeFilesBefore'] = source['runtimeFilesBefore']
        aggregate['runtimeFilesAfter'] = source['runtimeFilesAfter']
        aggregate['servedBuildBefore'] = source['servedBuildBefore']
        aggregate['servedBuildAfter'] = source['servedBuildAfter']
    else:
        assert aggregate['runtimeFilesBefore'] == source['runtimeFilesBefore']
        assert aggregate['servedBuildBefore'] == source['servedBuildBefore']

    if spec['id'] == 'desktop-combats':
        indices = [index for index, check in enumerate(source['checks']) if check['name'].startswith('desktop home:') or any(check['name'].startswith(f'desktop {stage}') for stage in stage_ids)]
        shots = [shot for shot in source['screenshots'] if shot['label'] == 'desktop-home' or any(shot['label'].startswith(f'desktop-{stage}-') for stage in stage_ids)]
        assert len(indices) == 34 and len(shots) == 9
        observations = [item for item in source['assetEvidence'] if item['id'] in stage_asset_ids]
        screens = [item for item in source['screens'] if item['name'] == 'desktop home' or any(item['name'].startswith(f'desktop {stage}') for stage in stage_ids)]
        link_groups = []
    else:
        prefix = spec['viewport']
        indices = [index for index, check in enumerate(source['checks']) if check['name'].startswith(prefix)]
        shots = source['screenshots']
        observations = source['assetEvidence']
        screens = source['screens']
        link_groups = source['referenceLinkGroups']
        assert len(indices) == (58 if spec['id'] == 'desktop-gallery' else 92)
        assert len(shots) == (19 if spec['id'] == 'desktop-gallery' else 28)

    selected_crashes = [event for event in source.get('rendererLifecycle', []) if any(session['startedAt'] <= event['at'] <= session['finishedAt'] for session in sessions)]
    assert not selected_crashes
    # Every source has no web/page/request/HTTP error, including the archived failed run.
    for field in ['consoleErrors', 'pageErrors', 'failedRequests', 'httpErrors']:
        assert not source[field]
    for index in indices:
        check = copy.deepcopy(source['checks'][index])
        assert check['passed']
        check['sourceEvidence'] = {**evidence, 'checkIndex': index}
        aggregate['checks'].append(check)
    for shot in shots:
        preserved = spec['path'].parent / Path(shot['internalPath']).name
        assert preserved.exists() and digest(preserved) == shot['sha256'], shot['label']
        aggregate['screenshots'].append({**shot, 'originalInternalPath': shot['internalPath'], 'internalPath': str(preserved), 'sourceEvidence': evidence})
    for session in sessions:
        aggregate['browserSessions'].append({**session, 'sourceEvidence': evidence, 'launch': source['browserLaunch']})
    for item in observations:
        assert item['passed']
        aggregate['assetEvidence'].append({**item, 'sourceEvidence': evidence})
    for field, values in [('screens', screens), ('referenceLinkGroups', link_groups)]:
        aggregate[field].extend({**item, 'sourceEvidence': evidence} for item in values)
    for field in ['sceneryMeasurements', 'movementSamples', 'trainingControlDiagnostics', 'stageFilterObservations', 'chromiumPerformance']:
        values = source.get(field, [])
        if spec['id'] == 'desktop-gallery':
            values = []
        aggregate[field].extend({**item, 'sourceEvidence': evidence} for item in values)
    soundtrack = [item for item in source.get('soundtrackObservations', []) if item['segment'] in spec['segments']]
    assert all(item['checked'] and not item['modified'] for item in soundtrack)
    aggregate['soundtrackObservations'].extend({**item, 'sourceEvidence': evidence} for item in soundtrack)
    responses = source.get('assetResponses', [])
    if spec['id'] == 'desktop-combats':
        responses = [item for item in responses if '/assets/production/v13/environment/' in item['url']]
    aggregate['assetResponses'].extend({**item, 'sourceEvidence': evidence} for item in responses)
    aggregate['sourceRuns'].append({
        **evidence, 'selectedSegments': spec['segments'], 'selectedCheckIndices': indices,
        'selectedAssertions': len(indices), 'selectedCaptureLabels': [shot['label'] for shot in shots],
        'originalChecks': len(source['checks']), 'originalFailedChecks': [check for check in source['checks'] if not check['passed']],
        'originalExecutionError': source.get('executionError'), 'originalRendererEvents': source.get('rendererLifecycle', []),
        'excludedErrorsRemainFailures': True,
    })

labels = [shot['label'] for shot in aggregate['screenshots']]
integrity('56 unique capture labels and immutable source hashes', len(labels) == len(set(labels)) == 56)
integrity('28 selected captures per viewport', all(sum(label.startswith(viewport['name'] + '-') for label in labels) == 28 for viewport in recipe['viewports']))
integrity('184 actual browser assertions retained once', len(aggregate['checks']) == 184 and len({check['name'] for check in aggregate['checks']}) == 184)
integrity('Six completed source sessions retained', len(aggregate['browserSessions']) == 6)
integrity('No native crash within any selected session interval', not aggregate['rendererLifecycle'])
integrity('Default soundtrack enabled in all six selected sessions', len(aggregate['soundtrackObservations']) == 6 and all(item['checked'] for item in aggregate['soundtrackObservations']))
for ident in expected_ids:
    covered = all(any(item['id'] == ident and item['viewport'] == viewport['name'] and item['passed'] for item in aggregate['assetEvidence']) for viewport in recipe['viewports'])
    integrity(f'{ident}: independently observed on both viewports', covered)
    aggregate['checkedAssetIds'].append(ident)
for item in aggregate['runtimeFilesAfter']:
    assert digest(ROOT / item['path']) == item['sha256']
integrity('193 browser-fingerprinted runtime files match across all three sources and current tree', len(aggregate['runtimeFilesAfter']) == 193)
for item in aggregate['servedBuildAfter']['files']:
    assert digest(ROOT / 'dist-combat' / item['path']) == item['sha256']
    assert item['path'] == 'standalone-manifest.json' or item['sha256'] == item['manifestSha256']
integrity('Served index, manifest, bundles and V13 exports match all source runs and current package', True)
root_files = []
for folder in ['src', 'public/assets/production/v10', 'public/assets/production/v11', 'public/assets/production/v12', 'public/assets/production/v13']:
    root_files.extend(str(path.relative_to(ROOT)) for path in (ROOT / folder).rglob('*') if path.is_file())
root_files += ['art/infernal-versus/production/reserve-assets.json', 'package.json', 'package-lock.json', 'vite.config.ts', 'eslint.config.js', 'tsconfig.json', 'scripts/finalize-standalone.mjs', 'scripts/check-standalone.mjs']
root_inputs = [{'path': path, 'sha256': digest(ROOT / path)} for path in sorted(root_files)]
root_fingerprint = hashlib.sha256(json.dumps(root_inputs, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
integrity('Root technical freeze of 198 inputs remains unchanged', len(root_inputs) == 198 and root_fingerprint == recipe['authorization']['rootRuntimeFingerprint'])
aggregate['rootRuntimeFreezeEvidence'] = {'files': root_inputs, 'fingerprint': root_fingerprint, 'expectedFingerprint': recipe['authorization']['rootRuntimeFingerprint']}
aggregate['browserVersion'] = '143.0.7499.4'
aggregate['browserLaunch'] = {'strategy': 'fresh owned browsers', 'desktopCombats': 'Headless Chromium with native /dev/shm', 'desktopGalleryAndMobile': 'Headless Chromium with native /dev/shm and --disable-gpu', 'defaultSoundtrack': 'enabled through unchanged UI option', 'renderingBackendCauseEstablished': False}
aggregate['startedAt'] = min(session['startedAt'] for session in aggregate['browserSessions'])
aggregate['finishedAt'] = max(session['finishedAt'] for session in aggregate['browserSessions'])
aggregate['assembledAt'] = now()
aggregate['harness'] = {'internalPath': str(Path(__file__)), 'sha256': digest(Path(__file__)), 'method': 'Evidence aggregation only; no browser rerun or alteration of source reports/capture pixels.'}
aggregate['evidenceCounts'] = {'selectedBrowserAssertions': 184, 'integrityChecks': len(aggregate['evidenceIntegrityChecks']), 'selectedCaptures': 56, 'selectedSessions': 6, 'sourceRuns': 3}
aggregate['limits'] = [
    'This is a targeted aggregate of completed segments; it is not one continuous pass.',
    'Seven earlier failed browser attempts and two unsuccessful diagnostic runs remain archived. Their incomplete coverage assertions and renderer errors are not counted as successful observations.',
    'Native renderer failures also occurred before restoring the whole catalogue; their cause is undetermined and is not attributed conclusively to GPU, audio, memory or asset content.',
    'The retained desktop-gallery and mobile segments disable GPU acceleration. Default soundtrack remains enabled.',
    'Long continuous sessions, full unfiltered 133-entry expansion/prolonged scrolling, physical devices and cross-browser behavior are not certified.',
]
target = TMP / 'browser-qa-run.json'
target.write_text(json.dumps(aggregate, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'path': str(target), 'sha256': digest(target), 'status': aggregate['status'], 'counts': aggregate['evidenceCounts'], 'rootRuntimeFingerprint': root_fingerprint}, ensure_ascii=False, indent=2))
