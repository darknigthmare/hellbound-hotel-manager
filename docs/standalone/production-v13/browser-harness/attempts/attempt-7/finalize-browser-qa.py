from pathlib import Path
import json, hashlib, shutil, datetime

ROOT = Path(__file__).resolve().parents[4]
TMP = Path('/tmp/infernal-v13/browser')
OUT = ROOT / 'docs/standalone/production-v13'
run_path = TMP / 'browser-qa-run.json'
run = json.loads(run_path.read_text())
review = json.loads((TMP / 'visual-review.json').read_text())
register = json.loads((OUT / 'delivery-register.json').read_text())
recipe = json.loads((OUT / 'browser-harness/recipe.json').read_text())
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

assert run['status'] == 'passed_automated_browser_checks_pending_visual_review'
assert all(c['passed'] for c in run['checks'])
assert all(not run[k] for k in ['consoleErrors', 'pageErrors', 'failedRequests', 'httpErrors'])
assert run['runtimeFilesBefore'] == run['runtimeFilesAfter']
assert run['servedBuildBefore'] == run['servedBuildAfter']
assert not run.get('rendererLifecycle')
for item in run['servedBuildAfter']['files']:
    assert digest(ROOT / run['servedBuildAfter']['root'] / item['path']) == item['sha256'], item['path']
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
run['sourceRunEvidence'] = {'path': str(raw_target.relative_to(ROOT)), 'sha256': digest(run_path), 'runtimeFingerprintMatchAtFinalization': True, 'servedBuildFingerprintMatchAtFinalization': True}
run['executionLogs'] = []
for name in ['browser-harness-output.log', 'static-server-log.txt']:
    original = TMP / name
    target = harness_dir / name
    shutil.copy2(original, target)
    run['executionLogs'].append({'path': str(target.relative_to(ROOT)), 'sha256': digest(target)})
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
    'combatSessions': len(run['viewports']) * len(recipe['stages']),
    'isolatedBrowserSessions': len(run['browserSessions']),
    'continuousLongSessionCertified': False,
    'screenshots': len(run['screenshots']), 'visuallyReviewedCaptures': len(review['reviewedLabels']),
    'officialReferenceLinkGroups': len(run['referenceLinkGroups']),
    'runtimeFingerprintFiles': len(run['runtimeFilesBefore']),
    'servedBuildFingerprintFiles': len(run['servedBuildAfter']['files']),
    'servedManifestFiles': run['servedBuildAfter']['manifestFileCount'],
    'consoleErrors': 0, 'pageErrors': 0, 'httpErrors': 0, 'failedRequests': 0,
}
run['summary'] = f"{len(run['checks'])} contrôles navigateur réussis sur six sessions Chromium isolées du bundle livré : {len(assets)} dessins V13 vérifiés sur ordinateur 1440×1000 et mobile tactile émulé 390×844. Les deux nouvelles arènes, salle de surveillance D.H.O.R.K.S. et hangar d’Unhappy Campers, et leurs vignettes ont été observées dans quatre combats d’entraînement ; chaque fond entier reste contenu avant et après déplacement, sans prop superposé. Les {len(gallery)} nouvelles fiches de galerie et leurs références sont présentes ; Vikki et Tilla sont libellées comme bustes de réserve. Le badge PRODUIT OFFICIEL de Tilla et son apparition en épisode non confirmée restent explicites. Les filtres respectent la portée de chaque fiche. Crymini 2017 et le costume existant de Loona sont conservés. Aucune erreur réseau, exception, console.error, image manquante ou débordement horizontal observé. Empreintes des sources et du bundle inchangées. Cette passe ne certifie ni une longue session continue ni le défilement prolongé du catalogue complet de 133 fiches."
run['visualReview'] = {**review, 'reviewedCaptures': [by_label[label] for label in review['reviewedLabels']]}
run['limitations'] = [
    'The validated dist-combat production package was served locally by Python http.server; its index, manifest, JS/CSS bundles and V13 exports remained hash-stable. No deployed-preview or remote-host visual test is implied.',
    'Four archived development-server attempts had transition timeouts or Chromium renderer crashes. A fifth attempt on the production bundle completed both desktop fights, then timed out opening the gallery. The final pass uses six fresh browsers, one per arena combat or gallery and per viewport. It does not certify a continuous long session or development-server stability.',
    'A sixth segmented attempt completed desktop combat and all five new gallery details but its renderer crashed when the search was cleared to restore the full catalogue. Final season-filter captures target Tilla absent/present and retain all per-asset scope assertions. Full unfiltered 133-entry expansion and prolonged catalogue scrolling remain unvalidated.',
    'The default soundtrack remains enabled in every final segment. An isolated soundtrack-off diagnostic completed its UI steps but a later optional performance-metrics request timed out; this does not establish an audio defect or a definitive cause of the earlier failures.',
    'Full backgrounds are contained: viewport-dependent solid-color margins remain visible; no stretching or cropping to fill them.',
    'Mobile coverage is Chromium touch emulation at 390×844, not physical-device or cross-browser validation.',
    'Four training fights use existing fighters and Loona’s existing costume to exercise the two new arenas; no new combat kit or animation cycle is delivered.',
    'Vikki and Tilla are static reserve busts, not complete bases. Browser verification does not resolve incomplete character references.',
    'Tilla derives from official merchandise. The conservative season 2 filter ceiling does not establish an episode appearance.',
    'Three new objects remain gallery reserve props. The red button visible in the control-room painting is part of its original single background, not a separately placed reserve prop.',
    'The boathouse foreground quay is extended for a continuous game floor; canonical level geometry is not claimed. The control-room foreground floor is expanded for 16:9 framing.',
    'Geometry is checked at observed initial and post-movement states; exhaustive camera, collision, mode and long-session behavior is outside scope.',
    'Reference link text and qualified href values are verified locally. External destinations are not opened during this browser pass.',
    'The inherited S1/S2 selector filters gallery, roster and costumes; arenas retain their separate S3 gate.',
    'Exact canonical fidelity is not certified by browser rendering; native PNG/export RGBA parity is recorded separately.',
]
run['finalizedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
target = OUT / 'browser-qa.json'
target.write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
placement = {
    'edition': 'V13', 'status': 'browser_verified_with_documented_limits',
    'stages': [{'stageId': stage['id'], 'backgroundAssetId': stage['roomId'], 'planes': ['room'], 'placements': [], 'roomDimensions': [1672, 941]} for stage in recipe['stages']],
    'sceneryNote': 'Empty scenery sets enable contained background planes. No gallery reserve prop is independently placed in either arena.',
    'browserEvidence': {'path': str(target.relative_to(ROOT)), 'sha256': digest(target), 'checksPassed': len(run['checks']), 'checksFailed': 0, 'viewports': run['viewports']},
    'limits': ['Source-guided gameplay floor/framing adaptations, not exact canonical geometry.', 'Full backgrounds contained with viewport-dependent solid-color margins.']
}
(OUT / 'runtime-placement.json').write_text(json.dumps(placement, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'path': str(target), 'status': run['status'], 'checks': len(run['checks']), 'checkedAssetIds': run['checkedAssetIds'], 'sha256': digest(target), 'bytes': target.stat().st_size}, ensure_ascii=False, indent=2))
