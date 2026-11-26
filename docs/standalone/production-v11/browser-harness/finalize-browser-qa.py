from pathlib import Path
import json, hashlib, shutil, datetime

ROOT = Path('/workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager')
TMP = Path('/tmp/infernal-v11/browser')
OUT = ROOT / 'docs/standalone/production-v11'
run_path = TMP / 'browser-qa-run.json'
run = json.loads(run_path.read_text())
review = json.loads((TMP / 'visual-review.json').read_text())
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

assert run['status'] == 'passed_automated_browser_checks_pending_visual_review'
assert all(c['passed'] for c in run['checks'])
assert all(not run[k] for k in ['consoleErrors', 'pageErrors', 'failedRequests', 'httpErrors'])
assert run['runtimeFilesBefore'] == run['runtimeFilesAfter']
assert set(run['checkedAssetIds']) == set(run['expectedAssetIds'])
assert len(run['checkedAssetIds']) == 7
assert review['status'] == 'passed'
assert review['sourceRunSha256'] == digest(run_path)
for item in run['runtimeFilesAfter']:
    assert digest(ROOT / item['path']) == item['sha256'], item['path']

captures = OUT / 'browser-captures'
captures.mkdir(parents=True, exist_ok=True)
by_label = {item['label']: item for item in run['screenshots']}
assert len(by_label) == len(run['screenshots'])
assert len(set(review['reviewedLabels'])) == len(review['reviewedLabels'])
for label in review['reviewedLabels']:
    assert label in by_label, label
for item in run['screenshots']:
    original = Path(item['internalPath'])
    assert digest(original) == item['sha256']
    target = captures / original.name
    shutil.copy2(original, target)
    item['path'] = str(target.relative_to(ROOT))
    item['visuallyReviewed'] = item['label'] in review['reviewedLabels']

observations = run['assetEvidence']
run['assetObservations'] = observations
run['assetEvidence'] = []
for ident in run['checkedAssetIds']:
    records = [x for x in observations if x['id'] == ident]
    assert records and all(x['passed'] for x in records)
    run['assetEvidence'].append({'id': ident, 'viewports': sorted({x['viewport'] for x in records}), 'observedIn': sorted({x['observedIn'] for x in records}), 'result': 'passed'})

harness_dir = OUT / 'browser-harness'
harness_dir.mkdir(parents=True, exist_ok=True)
raw_target = harness_dir / 'final-browser-qa-run.json'
shutil.copy2(run_path, raw_target)
run['sourceRunEvidence'] = {'path': str(raw_target.relative_to(ROOT)), 'internalPath': str(run_path), 'sha256': digest(run_path), 'runtimeFingerprintMatchAtFinalization': True}
history_path = TMP / 'attempt-history.json'
if history_path.exists():
    history = json.loads(history_path.read_text())
    archive = harness_dir / 'history'
    archive.mkdir(parents=True, exist_ok=True)
    for attempt in history['attempts']:
        for source_key, hash_key, target_key in [
            ('rawInternalPath', 'rawSha256', 'rawPath'),
            ('harnessInternalPath', 'harnessSha256', 'harnessPath'),
            ('diagnosticCaptureInternalPath', 'diagnosticCaptureSha256', 'diagnosticCapturePath'),
        ]:
            if source_key not in attempt:
                continue
            source = Path(attempt[source_key])
            assert digest(source) == attempt[hash_key]
            target = archive / (attempt['id'] + '-' + source.name)
            shutil.copy2(source, target)
            attempt[target_key] = str(target.relative_to(ROOT))
        log = Path(attempt['rawInternalPath']).parent / 'vite-log.txt'
        if log.exists():
            target = archive / (attempt['id'] + '-vite-log.txt')
            shutil.copy2(log, target)
            attempt['viteLog'] = {'path': str(target.relative_to(ROOT)), 'sha256': digest(target)}
    history['status'] = 'resolved_by_harness_corrections_final_pass_completed'
    history['finalPass'] = {'rawPath': str(raw_target.relative_to(ROOT)), 'rawSha256': digest(raw_target), 'checks': len(run['checks']), 'failedChecks': 0, 'checkedAssetIds': run['checkedAssetIds'], 'harnessSha256': run['harness']['sha256']}
    history['archivePolicy'] = 'The raw failed runs, exact harness versions, server logs and first failure capture are preserved in the repository. The second attempt’s complete screenshots remain in its scratch archive; the final pass captures are preserved separately under browser-captures.'
    target = OUT / 'browser-qa-history.json'
    target.write_text(json.dumps(history, ensure_ascii=False, indent=2) + '\n')
    run['attemptHistory'] = {'path': str(target.relative_to(ROOT)), 'sha256': digest(target), 'attemptCountIncludingFinal': len(history['attempts']) + 1, 'runtimeEditsForTheseCorrections': False}
run['status'] = 'passed'
run['counts'] = {
    'automatedChecks': len(run['checks']), 'failedChecks': 0,
    'checkedAssetIds': len(run['checkedAssetIds']), 'newGalleryEntries': 6,
    'galleryEntriesReported': run['galleryCountExpected'],
    'newStageBackgrounds': 1, 'newStageSceneryProps': 1,
    'newNarrativeBustArchives': 3, 'newReserveProps': 2,
    'newPlayableKits': 0, 'newStandaloneBases': 0, 'newAnimationCycles': 0,
    'combatSessions': len(run['viewports']),
    'screenshots': len(run['screenshots']), 'visuallyReviewedCaptures': len(review['reviewedLabels']),
    'officialReferenceLinkGroups': len(run['referenceLinkGroups']),
    'runtimeFingerprintFiles': len(run['runtimeFilesBefore']),
    'consoleErrors': 0, 'pageErrors': 0, 'httpErrors': 0, 'failedRequests': 0,
}
run['summary'] = f"{len(run['checks'])} contrôles navigateur réussis sur Chromium : sept assets V11 vérifiés sur ordinateur 1440×1000 et mobile tactile émulé 390×844. Le nouveau décor de consultation de Sloth, sa vignette et son conteneur séparé ont été observés dans deux combats d’entraînement ; proportions, ancrage et parallaxe commune restent cohérents avant et après déplacement. Six fiches de galerie et leurs références sont présentes, les trois portraits sont explicitement des bustes, Molly conserve la provenance historique 2015 et Crymini celle de 2017. Les six fiches respectent leur filtre S1/S2 applicable ; la disponibilité des arènes conserve son réglage S3 distinct. Aucune erreur réseau, exception, console.error, image manquante ou débordement horizontal observé. Empreintes runtime inchangées."
run['visualReview'] = {**review, 'reviewedCaptures': [by_label[label] for label in review['reviewedLabels']]}
run['limitations'] = [
    'Local Vite development server; no production deployment or packaged-build browser validation is implied.',
    'The wide stage background is rendered with its complete aspect ratio: solid-color side margins remain on desktop and a solid-color upper band remains in the tall mobile arena. The scene and container are not cropped or stretched to fill those areas.',
    'Mobile coverage is Chromium touch emulation at 390×844, not a physical device or cross-browser test.',
    'The two training fights use an existing fighter and costume solely to exercise the new arena and scenery; no new combat kit or animation cycle is delivered.',
    'The three new character drawings are intentionally partial portrait archives; browser validation does not close their missing full-body base gaps.',
    'Legacy concepts 2015 and 2017 retain their historical identity. season_1 is a filter ceiling, not a claim that these concepts belong to season 1 of the current series.',
    'Scenery geometry is checked at the observed initial and post-movement states; every camera boundary, collision, game mode and long-session behavior is outside this scope.',
    'Reference link text and qualified href values are verified locally. The external destination pages are not opened during this browser pass.',
    'The inherited S1/S2 selector filters gallery, roster and costumes; it does not hide S2 arenas. Arena availability uses a separate S3 gate. The initial contrary recipe assertion was removed after DOM/source diagnosis and explicit confirmation by root; no runtime change was made for it.',
    'Exact canonical fidelity and per-pixel production parity are covered by separate asset audits, not certified by browser rendering.',
]
run['finalizedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
target = OUT / 'browser-qa.json'
target.write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'path': str(target), 'status': run['status'], 'checks': len(run['checks']), 'checkedAssetIds': run['checkedAssetIds'], 'sha256': digest(target), 'bytes': target.stat().st_size}, ensure_ascii=False, indent=2))
