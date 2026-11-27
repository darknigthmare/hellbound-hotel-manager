from pathlib import Path
import json, hashlib, shutil, datetime

ROOT = Path('/workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager')
TMP = Path('/tmp/infernal-v10/browser')
OUT = ROOT / 'docs/standalone/production-v10'
run = json.loads((TMP / 'browser-qa-run.json').read_text())
review = json.loads((TMP / 'visual-review.json').read_text())
assert run['status'] == 'passed_automated_browser_checks_pending_visual_review', run['status']
assert all(c['passed'] for c in run['checks'])
assert all(not run[k] for k in ['consoleErrors', 'pageErrors', 'failedRequests', 'httpErrors'])
assert run['runtimeFilesBefore'] == run['runtimeFilesAfter']
assert len(run['checkedAssetIds']) == 11
assert set(run['checkedAssetIds']) == set(run['expectedAssetIds'])
assert review['status'] == 'passed'
for r in run['runtimeFilesAfter']:
    assert hashlib.sha256((ROOT / r['path']).read_bytes()).hexdigest() == r['sha256'], r['path']

captures = OUT / 'browser-captures'
captures.mkdir(parents=True, exist_ok=True)
by_label = {r['label']: r for r in run['screenshots']}
for label in review['reviewedLabels']:
    assert label in by_label, label
for r in run['screenshots']:
    source = Path(r['internalPath'])
    target = captures / source.name
    assert hashlib.sha256(source.read_bytes()).hexdigest() == r['sha256']
    shutil.copy2(source, target)
    r['path'] = str(target.relative_to(ROOT))
    r['visuallyReviewed'] = r['label'] in review['reviewedLabels']

catalogue = json.loads((ROOT / 'art/infernal-versus/production/reserve-assets.json').read_text())
new_gallery = {a['id']: a for a in catalogue['assets'] if a.get('export', '').startswith('public/assets/production/v10/')}
raw = run['assetEvidence']
run['assetObservations'] = raw
run['assetEvidence'] = []
for ident in run['checkedAssetIds']:
    observations = [x for x in raw if x['id'] == ident]
    run['assetEvidence'].append({'id': ident, 'observedIn': sorted({x['observedIn'] for x in observations}), 'viewports': sorted({x['viewport'] for x in observations}), 'spoilerScope': new_gallery.get(ident, {}).get('spoilerScope', 'season_2'), 'result': 'passed' if all(x['passed'] for x in observations) else 'findings'})
assert all(e['result'] == 'passed' for e in run['assetEvidence'])
run['status'] = 'passed'
run['summary'] = f"{len(run['checks'])} contrôles navigateur réussis sur Chromium réel : trois tenues V10 sélectionnées et observées en combat, deux nouveaux décors et trois accessoires vérifiés avec proportions et ancrages conservés pendant un déplacement, neuf fiches galerie inspectées, badge et provenance historique de Crymini visibles. Formats ordinateur 1440×1000 et mobile émulé 390×844. Aucun débordement horizontal, asset manquant, 404, exception ou console.error observé. Empreintes runtime identiques avant/après."
run['counts'] = {'automatedChecks': len(run['checks']), 'failedChecks': 0, 'checkedAssetIds': 11, 'costumesInCombat': 3, 'newStages': 2, 'newSceneryProps': 3, 'newGalleryEntries': len(new_gallery), 'galleryEntriesReported': run['galleryCountExpected'], 'screenshots': len(run['screenshots']), 'visuallyReviewedCaptures': len(review['reviewedLabels']), 'consoleErrors': 0, 'pageErrors': 0, 'httpErrors': 0, 'failedRequests': 0, 'runtimeFingerprintFiles': len(run['runtimeFilesBefore'])}
run['visualReview'] = {**review, 'reviewedCaptures': [by_label[label] for label in review['reviewedLabels']]}
run['limitations'] = [
    'Local Vite development runtime; this is not a production deployment or packaged-build browser verification.',
    'Mobile coverage is Chromium touch emulation at 390×844 and deviceScaleFactor 1, not physical phones or cross-browser testing.',
    'The three new costumes keep one static illustration during sampled movement and attacks; no new frame cycles or animation coverage are implied.',
    'Scenery anchoring and shared parallax were checked at the observed initial and post-movement positions; this is not exhaustive camera-boundary or long-session testing.',
    'Coverage is the eleven V10 assets and described training/gallery flows; full historical game modes, balance and performance were not revalidated.',
    'Browser rendering checks do not certify exact canonical fidelity; historical and imagined incarnations retain their displayed provenance.',
]
initial_attempt = TMP / 'attempt-01-infrastructure.json'
if initial_attempt.exists():
    earlier = json.loads(initial_attempt.read_text())
    run['priorInfrastructureAttempts'] = [{'internalPath': str(initial_attempt), 'sha256': hashlib.sha256(initial_attempt.read_bytes()).hexdigest(), 'startedAt': earlier['startedAt'], 'result': 'Stopped before loading the application: localhost connection refused after Vite announced readiness. No asset coverage claimed.', 'correction': 'Waited for parallel technical QA to finish; added successful HTTP GET checks before Chromium launch and navigation, plus Vite exit-code/signal recording. Runtime and asset files were not modified.'}]
run['finalizedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
target = OUT / 'browser-qa.json'
target.write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'path': str(target), 'status': run['status'], 'checks': len(run['checks']), 'checkedAssetIds': run['checkedAssetIds'], 'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'bytes': target.stat().st_size}, ensure_ascii=False, indent=2))
