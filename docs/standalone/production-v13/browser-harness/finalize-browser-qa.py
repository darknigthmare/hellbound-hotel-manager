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
assert len(run['evidenceIntegrityChecks']) == 16 and all(c['passed'] for c in run['evidenceIntegrityChecks'])
assert run['evidenceType'] == 'targeted_aggregate_of_completed_segments'
for source in run['sourceRuns']:
    assert digest(ROOT / source['path']) == source['sha256']
for item in run['rootRuntimeFreezeEvidence']['files']:
    assert digest(ROOT / item['path']) == item['sha256'], item['path']
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
for source in run['sourceRuns']:
    folder = (ROOT / source['path']).parent
    for name in ['browser-harness-output.log', 'browser-output.log', 'static-server-log.txt']:
        original = folder / name
        if original.exists():
            run['executionLogs'].append({'path': str(original.relative_to(ROOT)), 'sha256': digest(original), 'sourceId': source['sourceId'], 'originalRunStatus': source['originalStatus']})
run['executionHistoryEvidence'] = {'path': str((harness_dir / 'execution-history.json').relative_to(ROOT)), 'sha256': digest(harness_dir / 'execution-history.json')}
source_manifest_path = harness_dir / 'executed-harness-sources.json'
source_manifest = json.loads(source_manifest_path.read_text())
for source in source_manifest['entries']:
    assert digest(ROOT / source['archivedPath']) == source['sha256']
    if 'correctedActivePath' in source:
        assert digest(ROOT / source['correctedActivePath']) == source['correctedActiveSha256']
run['executedHarnessSourcesEvidence'] = {'path': str(source_manifest_path.relative_to(ROOT)), 'sha256': digest(source_manifest_path), 'preservedSources': len(source_manifest['entries']), 'assertionsChanged': False, 'browserRerun': False}
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
    'evidenceIntegrityChecks': len(run['evidenceIntegrityChecks']),
    'sourceRuns': len(run['sourceRuns']),
    'targetedAggregate': True,
    'archivedFailedBrowserAttempts': 7,
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
    'rootRuntimeFreezeFiles': len(run['rootRuntimeFreezeEvidence']['files']),
    'servedBuildFingerprintFiles': len(run['servedBuildAfter']['files']),
    'servedManifestFiles': run['servedBuildAfter']['manifestFileCount'],
    'consoleErrors': 0, 'pageErrors': 0, 'httpErrors': 0, 'failedRequests': 0,
}
run['summary'] = f"Validation ciblée de {len(assets)} dessins V13 : agrégation documentée de {len(run['checks'])} assertions d’interaction et de {len(run['evidenceIntegrityChecks'])} contrôles d’intégrité, issus de six segments Chromium achevés sur le même bundle livré. Les 56 captures sélectionnées ont toutes été relues sur ordinateur 1440×1000 et mobile tactile émulé 390×844. Les deux nouvelles arènes et leurs vignettes ont été observées dans quatre combats d’entraînement ; les fonds restent entiers avant et après déplacement, sans prop superposé. Les cinq nouvelles fiches et leurs références sont lisibles. Vikki et Tilla restent des bustes statiques ; le badge PRODUIT OFFICIEL de Tilla et son apparition en épisode non confirmée sont explicites. Les trois objets restent en réserve. Les filtres de saison sont vérifiés pour chaque fiche, avec Tilla absente en S1 et présente en S1+S2. Crymini 2017 et le costume existant de Loona sont conservés. Aucun échec d’assertion, crash ni erreur réseau ou console dans les segments retenus ; empreintes des sources et du bundle inchangées. Les sept essais antérieurs incomplets restent archivés comme échecs. Cette qualification ne certifie ni une longue session continue ni le défilement prolongé des 133 fiches."
run['visualReview'] = {**review, 'reviewedCaptures': [by_label[label] for label in review['reviewedLabels']]}
run['limitations'] = ['This report is a targeted aggregate of six completed segments from three hash-bound source reports, not a single continuous browser run. Original failed statuses and incomplete coverage assertions remain preserved and are excluded from the accepted interaction count.', 'The validated dist-combat package was served locally by Python http.server. Its manifest, index, bundles and V13 exports match all selected sources and the current package; no deployed-preview visual test is implied.', 'Retained desktop combats use default headless Chromium; desktop gallery and all mobile segments use --disable-gpu. GPU acceleration compatibility and a definitive cause of prior native failures are not established.', 'Seven prior browser attempts failed at native rendering or transition steps, including a Crymini opening before full-catalogue restoration. Audio and native-memory diagnostics did not establish a cause. The success of selected segments is not a general crash-resolution claim.', 'Full unfiltered expansion and prolonged scrolling of all 133 gallery entries, and long multi-combat sessions, remain unvalidated. Targeted Tilla absent/present captures retain every individual season-scope assertion for the five new entries.', 'The default soundtrack option remains enabled in all retained segments. Audio playback quality was not listened to or certified.', 'Full backgrounds are contained with viewport-dependent solid-color margins. Foreground floor/quay extensions are explicit gameplay adaptations, not exact canonical level geometry.', 'Mobile coverage is Chromium touch emulation at 390×844, not physical-device or cross-browser validation.', 'Four training fights use existing fighters and Loona’s existing costume. No new combat kit, standalone full-body base or animation cycle is delivered.', 'Vikki and Tilla are static archive busts. Tilla is adapted from official merchandise; its conservative season 2 filter ceiling does not establish an episode appearance.', 'Three new objects remain reserve props. The red button painted into the control-room background is not an independently placed copy of the reserve prop.', 'Geometry is checked at observed initial and post-movement states. Exhaustive camera, collision, mode and long-session behavior are outside scope.', 'Reference-link text and href values are checked locally; external destinations were not opened during these browser observations.', 'The inherited S1/S2 selector filters gallery, roster and costumes; arenas retain a separate S3 gate. The default home counter excludes two S3 stages from the total inventory of 49.', 'Exact canonical fidelity is not certified by browser rendering; native PNG and export RGBA parity are recorded separately.']
run['finalizedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
target = OUT / 'browser-qa.json'
target.write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
placement = {
    'edition': 'V13', 'status': 'browser_verified_with_documented_limits',
    'stages': [{'stageId': stage['id'], 'backgroundAssetId': stage['roomId'], 'planes': ['room'], 'placements': [], 'roomDimensions': [1672, 941]} for stage in recipe['stages']],
    'sceneryNote': 'Empty scenery sets enable contained background planes. No gallery reserve prop is independently placed in either arena.',
    'browserEvidence': {'path': str(target.relative_to(ROOT)), 'sha256': digest(target), 'checksPassed': len(run['checks']), 'checksFailed': 0, 'evidenceIntegrityChecks': len(run['evidenceIntegrityChecks']), 'evidenceType': run['evidenceType'], 'continuousRunCertified': False, 'viewports': run['viewports']},
    'limits': ['Source-guided gameplay floor/framing adaptations, not exact canonical geometry.', 'Full backgrounds contained with viewport-dependent solid-color margins.']
}
(OUT / 'runtime-placement.json').write_text(json.dumps(placement, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'path': str(target), 'status': run['status'], 'checks': len(run['checks']), 'checkedAssetIds': run['checkedAssetIds'], 'sha256': digest(target), 'bytes': target.stat().st_size}, ensure_ascii=False, indent=2))
