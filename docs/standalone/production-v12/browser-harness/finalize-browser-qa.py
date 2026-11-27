from pathlib import Path
import json, hashlib, shutil, datetime

ROOT = Path(__file__).resolve().parents[4]
TMP = Path('/tmp/infernal-v12/browser')
OUT = ROOT / 'docs/standalone/production-v12'
run_path = TMP / 'browser-qa-run.json'
run = json.loads(run_path.read_text())
review = json.loads((TMP / 'visual-review.json').read_text())
register = json.loads((OUT / 'delivery-register.json').read_text())
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

assert run['status'] == 'passed_automated_browser_checks_pending_visual_review'
assert all(c['passed'] for c in run['checks'])
assert all(not run[k] for k in ['consoleErrors', 'pageErrors', 'failedRequests', 'httpErrors'])
assert run['runtimeFilesBefore'] == run['runtimeFilesAfter']
assert set(run['checkedAssetIds']) == set(run['expectedAssetIds'])
assert review['status'] == 'passed'
assert review['sourceRunSha256'] == digest(run_path)
for item in run['runtimeFilesAfter']:
    assert digest(ROOT / item['path']) == item['sha256'], item['path']

captures = OUT / 'browser-captures'
captures.mkdir(parents=True, exist_ok=True)
by_label = {item['label']: item for item in run['screenshots']}
assert len(by_label) == len(run['screenshots'])
assert set(review['reviewedLabels']) == set(by_label), 'Every final capture requires a visual review'
assert len(set(review['reviewedLabels'])) == len(review['reviewedLabels'])
for item in run['screenshots']:
    original = Path(item['internalPath'])
    assert digest(original) == item['sha256']
    target = captures / original.name
    shutil.copy2(original, target)
    item['path'] = str(target.relative_to(ROOT))
    item['visuallyReviewed'] = True

observations = run['assetEvidence']
run['assetObservations'] = observations
run['assetEvidence'] = []
for ident in run['checkedAssetIds']:
    records = [x for x in observations if x['id'] == ident]
    assert records and all(x['passed'] for x in records)
    run['assetEvidence'].append({'id': ident, 'viewports': sorted({x['viewport'] for x in records}), 'observedIn': sorted({x['observedIn'] for x in records}), 'result': 'passed'})

harness_dir = OUT / 'browser-harness'
raw_target = harness_dir / 'final-browser-qa-run.json'
shutil.copy2(run_path, raw_target)
run['sourceRunEvidence'] = {'path': str(raw_target.relative_to(ROOT)), 'sha256': digest(run_path), 'runtimeFingerprintMatchAtFinalization': True}
assets = register['assets']
assert {a['id'] for a in assets} == set(run['checkedAssetIds'])
catalogue = json.loads((ROOT / 'art/infernal-versus/production/reserve-assets.json').read_text())
gallery_ids = {a['id'] for a in catalogue['assets']}
gallery = [a for a in assets if a['id'] in gallery_ids]
stage_backgrounds = [a for a in assets if a.get('runtimeStatus') == 'selectable_stage']
assert len(gallery) + len(stage_backgrounds) == len(assets)
assert not {a['id'] for a in stage_backgrounds}.intersection(gallery_ids)
run['status'] = 'passed'
run['counts'] = {
    'automatedChecks': len(run['checks']), 'failedChecks': 0,
    'checkedAssetIds': len(run['checkedAssetIds']), 'newGalleryEntries': len(gallery),
    'galleryEntriesReported': run['galleryCountExpected'],
    'newStageBackgrounds': len(stage_backgrounds),
    'newStageSceneryProps': sum(a.get('runtimeStatus') == 'stage_scenery' for a in assets),
    'newReserveProps': sum(a['category'] == 'prop' and a.get('runtimeStatus') == 'reserve' for a in assets),
    'newPlayableKits': 0, 'newStandaloneBases': sum(bool(a.get('addsStandaloneBase')) for a in assets), 'newAnimationCycles': 0,
    'combatSessions': len(run['viewports']),
    'screenshots': len(run['screenshots']), 'visuallyReviewedCaptures': len(review['reviewedLabels']),
    'officialReferenceLinkGroups': len(run['referenceLinkGroups']),
    'runtimeFingerprintFiles': len(run['runtimeFilesBefore']),
    'consoleErrors': 0, 'pageErrors': 0, 'httpErrors': 0, 'failedRequests': 0,
}
run['summary'] = f"{len(run['checks'])} contrôles navigateur réussis sur Chromium : {len(assets)} dessins V12 vérifiés sur ordinateur 1440×1000 et mobile tactile émulé 390×844. Le couloir des coulisses de Mammon et sa vignette ont été observés dans deux combats d’entraînement ; le fond entier reste contenu avant et après déplacement, sans prop ajouté. Les {len(gallery)} nouvelles fiches de galerie et leurs références sont présentes ; les deux personnages sont libellés comme silhouettes entières de réserve. Les filtres respectent la portée explicite des fiches, sans attribuer un épisode aux planches de production non datées. Aucune erreur réseau, exception, console.error, image manquante ou débordement horizontal observé. Empreintes runtime inchangées."
run['visualReview'] = {**review, 'reviewedCaptures': [by_label[label] for label in review['reviewedLabels']]}
run['limitations'] = [
    'Local Vite development server; no production-deployment or packaged-build browser validation is implied.',
    'The complete wide background is contained: solid-color side margins on desktop and an upper band in the tall mobile arena remain visible; no stretching or cropping to fill them.',
    'Mobile coverage is Chromium touch emulation at 390×844, not a physical-device or cross-browser test.',
    'The two training fights use an existing fighter and costume to exercise the new arena; no new combat kit or animation cycle is delivered.',
    'Gigi and Russ are static reserve support bases. The browser pass verifies presentation, not playable integration or fidelity to unresolved low-resolution details.',
    'Any production_model_undated prop retains an explicit unconfirmed-episode note. Its season_2 filter ceiling does not assign the model to season 2.',
    'The two separate Mammon cases remain gallery reserve props, not scenery added to the empty corridor.',
    'Geometry is checked at the observed initial and post-movement states; exhaustive camera, collision, game-mode and long-session behavior is outside this scope.',
    'Reference link text and qualified href values are verified locally. External destination pages are not opened during this browser pass.',
    'The inherited S1/S2 selector filters gallery, roster and costumes; arena availability retains its separate S3 gate.',
    'Exact canonical fidelity is not certified by browser rendering; native PNG/export RGBA parity is recorded separately.',
]
run['finalizedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
target = OUT / 'browser-qa.json'
target.write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
placement = {
    'edition': 'V12', 'status': 'browser_verified_with_documented_limits',
    'stageId': 'mammon-backstage-corridor-s2', 'backgroundAssetId': 'mammon-backstage-corridor-s2-room',
    'planes': ['room'], 'placements': [], 'roomDimensions': [1672, 941],
    'sceneryNote': 'Empty scenery set enables the contained background plane; neither storage case is placed in this corridor.',
    'browserEvidence': {'path': str(target.relative_to(ROOT)), 'sha256': digest(target), 'checksPassed': len(run['checks']), 'checksFailed': 0, 'viewports': run['viewports']},
    'limits': ['Source-guided game framing, not pixel-identical canonical geometry.', 'Full background contained with solid-color margins dictated by viewport proportions.']
}
(OUT / 'runtime-placement.json').write_text(json.dumps(placement, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'path': str(target), 'status': run['status'], 'checks': len(run['checks']), 'checkedAssetIds': run['checkedAssetIds'], 'sha256': digest(target), 'bytes': target.stat().st_size}, ensure_ascii=False, indent=2))
