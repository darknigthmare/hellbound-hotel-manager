from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil

ROOT = Path('/mnt/data/hellbound-hotel-manager')
HERE = ROOT / 'docs/standalone/production-v14'
EVIDENCE = HERE / 'browser-final-20261127'
WORK = Path('/mnt/data/browser-v14-harness')
KEYS = ['desktop-blitzo-shop', 'desktop-moxxie-dining', 'desktop-millie-shop', 'desktop-gallery', 'mobile-blitzo-shop', 'mobile-gallery']

def digest(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def meta(p):
    return {'path': Path(p).relative_to(ROOT).as_posix(), 'sha256': digest(p), 'bytes': Path(p).stat().st_size}

recipe = json.loads((WORK / 'recipe.json').read_text())
runs = [json.loads((EVIDENCE / key / 'browser-qa-run.json').read_text()) for key in KEYS]
base = runs[0]
checks = [{**check, 'sourceSegment': key} for key, run in zip(KEYS, runs) for check in run['checks']]
integrity = []
for key, run in zip(KEYS, runs):
    integrity.append({'name': f'{key}: successful bounded execution', 'passed': run['status'] == 'passed_targeted_segment_checks_pending_visual_review' and not run.get('executionError')})
    integrity.append({'name': f'{key}: current unchanged harness and recipe', 'passed': run['harness']['sha256'] == digest(Path(run['harness']['internalPath'])) and run['recipe']['sha256'] == digest(WORK / 'recipe.json')})
for field in ['runtimeFilesBefore', 'runtimeFilesAfter', 'servedBuildBefore', 'servedBuildAfter']:
    integrity.append({'name': f'All six sessions agree on {field}', 'passed': all(run[field] == base[field] for run in runs)})

screenshots = []
for key, run in zip(KEYS, runs):
    for shot in run['screenshots']:
        p = Path(shot['internalPath'])
        integrity.append({'name': f'{key}: capture hash {p.name}', 'passed': digest(p) == shot['sha256']})
        screenshots.append({'label': shot['label'], 'sourceSegment': key, 'viewport': run['viewports'][0]['name'], **meta(p)})

fields = ['screens', 'sceneryMeasurements', 'movementSamples', 'assetEvidence', 'referenceLinkGroups', 'browserSessions', 'soundtrackObservations', 'trainingControlDiagnostics', 'stageFilterObservations', 'chromiumPerformance', 'rendererLifecycle', 'consoleErrors', 'pageErrors', 'failedRequests', 'httpErrors', 'assetResponses']
combined = {field: [{**item, 'sourceSegment': key} for key, run in zip(KEYS, runs) for item in run.get(field, [])] for field in fields}
checked = []
for asset_id in recipe['expectedAssetIds']:
    observed = any(item['id'] == asset_id and item['passed'] for item in combined['assetEvidence'])
    integrity.append({'name': f'{asset_id}: observed in targeted actual runtime', 'passed': observed})
    if observed:
        checked.append(asset_id)

visual = json.loads((WORK / 'visual-observations.json').read_text())
expected_shots = {item['path']: item['sha256'] for item in screenshots}
observed_shots = {item['path']: item['sha256'] for item in visual['captureEvidence']}
visual_passed = visual['status'] == 'accepted_with_limits' and expected_shots == observed_shots
integrity.append({'name': 'Every retained proof screenshot was visually inspected at its exact hash', 'passed': visual_passed})
passed = all(item['passed'] for item in checks + integrity)

shutil.copyfile(WORK / 'run-segment.cjs', EVIDENCE / 'run-segment.executed.cjs.txt')
shutil.copyfile(WORK / 'run-segment.mobile-proof.cjs', EVIDENCE / 'run-segment.mobile-proof.executed.cjs.txt')
shutil.copyfile(WORK / 'recipe.json', EVIDENCE / 'recipe.json')
shutil.copyfile(WORK / 'visual-observations.json', EVIDENCE / 'visual-review.json')
shutil.copyfile(__file__, EVIDENCE / 'assemble-final.py')
for key in KEYS:
    shutil.copyfile(WORK / f'{key}.log', EVIDENCE / key / 'execution.log')

counts = {
    'automatedChecks': len(checks), 'failedChecks': sum(not item['passed'] for item in checks),
    'evidenceIntegrityChecks': len(integrity), 'sourceRuns': len(runs), 'targetedAggregate': True,
    'checkedAssetIds': len(checked), 'newGalleryEntries': 5, 'galleryEntriesReported': recipe['expectedGalleryCount'],
    'newStageBackgrounds': 2, 'newStageSceneryProps': 0, 'newReserveProps': 2, 'newSelectableCostumes': 3,
    'newPlayableKits': 0, 'newStandaloneBases': 0, 'newAnimationCycles': 0,
    'combatSessions': 4, 'isolatedBrowserSessions': 6, 'supersededCaptureAttempts': 2,
    'browserSessionsExecutedIncludingCaptureCorrections': 8, 'continuousLongSessionCertified': False,
    'screenshots': len(screenshots), 'visuallyReviewedCaptures': len(visual['captureEvidence']),
    'officialReferenceLinkGroups': len(combined['referenceLinkGroups']),
    'runtimeFingerprintFiles': len(base['runtimeFilesBefore']),
    'servedBuildFingerprintFiles': len(base['servedBuildBefore']['files']),
    'servedManifestFiles': base['servedBuildBefore']['manifestFileCount'],
    **{field: len(combined[field]) for field in ['consoleErrors', 'pageErrors', 'httpErrors', 'failedRequests']},
}
limits = [
    'Local software-rendered Chromium 142.0.7444.162 desktop and mobile touch emulation, not a physical phone or deployed site test. Browser version is also recorded directly from the launched process.',
    'Three costumes and two venues were checked in desktop training; the mobile combat journey covered Blitzø and the Full Moon shop. The five gallery entries and content/provenance filters were checked in both viewports.',
    'Six bounded independent sessions; no continuous long-session or full-gallery performance certification.',
    'The contained single-plane backgrounds retain viewport-dependent solid-color margins. This is expected framing, not a missing texture.',
    'The Crimson background keeps the already documented cropped ceiling mount; the separate chandelier gallery prop is whole.',
    'Every supplied costume is static during movement and attacks. No new animation or playable kit is claimed.',
    'Browser rendering checks do not certify canonical 1:1 fidelity or explain the historical renderer crashes.',
]
limits[0] = f"Local software-rendered Chromium {base['browserVersion']} desktop and mobile touch emulation, not a physical phone or deployed site test."
report = {
    'edition': 'V14', 'schemaVersion': 1, 'status': 'passed' if passed else 'findings',
    'evidenceType': 'targeted_aggregate_of_six_completed_independent_segments',
    'continuousRunCertified': False,
    'scope': 'Seven V14 drawings: three selectable static costumes and two stages in desktop training, one full mobile touch combat journey, and five gallery entries including two props at both viewport sizes.',
    'server': base['server'], 'viewports': recipe['viewports'],
    'expectedAssetIds': recipe['expectedAssetIds'], 'checkedAssetIds': checked,
    'regressionAssetIds': ['hz_crymini-legacy-2017-base'], 'galleryCountExpected': recipe['expectedGalleryCount'],
    'checks': checks, 'evidenceIntegrityChecks': integrity,
    'sourceRuns': [{'segment': key, **meta(EVIDENCE / key / 'browser-qa-run.json'), 'status': run['status'], 'checkCount': len(run['checks']), 'screenshotCount': len(run['screenshots'])} for key, run in zip(KEYS, runs)],
    'screenshots': screenshots, **combined,
    'recipe': meta(EVIDENCE / 'recipe.json'),
    'runtimeFilesBefore': base['runtimeFilesBefore'], 'runtimeFilesAfter': base['runtimeFilesAfter'],
    'servedBuildBefore': base['servedBuildBefore'], 'servedBuildAfter': base['servedBuildAfter'],
    'rootRuntimeFreezeEvidence': recipe['authorization'], 'browserVersion': base['browserVersion'],
    'browserLaunch': base['browserLaunch'],
    'startedAt': min(run['startedAt'] for run in runs), 'finishedAt': max(run['finishedAt'] for run in runs),
    'assembledAt': datetime.now(timezone.utc).isoformat(),
    'harness': meta(EVIDENCE / 'run-segment.executed.cjs.txt'),
    'harnessVariants': [meta(EVIDENCE / 'run-segment.executed.cjs.txt'), meta(EVIDENCE / 'run-segment.mobile-proof.executed.cjs.txt')],
    'harnessVariation': 'Only the final mobile gallery screenshot method changed: capture the whole image after scrolling its actual .iv-main container so that the fixed header cannot obscure it. Text/provenance is separately checked in the same mobile UI and shown in desktop evidence. Assertions, runtime and interactions are unchanged.',
    'visualReview': meta(EVIDENCE / 'visual-review.json'), 'counts': counts, 'limits': limits,
    'initialV14AttemptsExcludedFromSuccessCounts': True,
    'supersededCaptureAttempts': meta(EVIDENCE / 'superseded-capture-attempts.json'),
    'fidelityOneToOneCertified': False,
    'summary': f"Sept dessins V14 contrôlés dans le jeu : {len(checks)} assertions d’interaction et {len(integrity)} contrôles d’intégrité, issus de six sessions Chromium indépendantes. Trois costumes et deux arènes en combat desktop ; parcours Blitzø/Full Moon complet en émulation tactile mobile ; cinq fiches galerie, provenance des courts 2026 et filtres de contenu sur les deux formats. Dix captures inspectées. Aucun cycle d’animation ni kit supplémentaire.",
}
(HERE / 'browser-qa.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'status': report['status'], 'counts': counts, 'failedIntegrity': [item for item in integrity if not item['passed']], 'report': str(HERE / 'browser-qa.json')}, ensure_ascii=False))
