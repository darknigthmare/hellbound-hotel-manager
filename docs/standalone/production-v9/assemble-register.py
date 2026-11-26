"""Assemble the V9 delivery from inspected masters and actual verification reports.

No pixels are edited here. References are preserved, and native PNG versus WebP
RGBA bytes are compared, including RGB hidden beneath transparent pixels.
Run again with --final after both technical and browser QA have passed.
"""
import argparse
import copy
import hashlib
import json
import re
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--final', action='store_true')
args = parser.parse_args()


def read(path):
    return json.loads(Path(path).read_text())


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def rel(path):
    return str(Path(path).relative_to(ROOT))


def distinct(values):
    return list(dict.fromkeys(values))


previous = read(HERE.parent / 'production-v8/delivery-register.json')
jobs = read(HERE / 'root-generation.json')
environment = read(HERE / 'environment-handoff.json')
review = read(HERE / 'independent-review-root.json')
refused = read(HERE / 'refused-attempts.json')
reviews_by_hash = {item['masterSha256']: item for item in review['assets']}
reference_dir = ROOT / 'production/v9/references'
reference_dir.mkdir(parents=True, exist_ok=True)
assets = []

usage = {
    'selectable_costume': 'Tenue statique sélectionnable de Lute ; la même image couvre toutes les actions et le kit existant reste actif.',
    'selectable_stage': 'Nouvelle arène sélectionnable bee-lounge-s1, fond et miniature avec deux accessoires séparés.',
    'stage_scenery': 'Couche de décor séparée de bee-lounge-s1, ancrée dans les coordonnées du fond et avec sa parallaxe.',
    'reserve': 'Illustration consultable dans la galerie de réserve ; aucune nouvelle mécanique de combat.',
}

for job in jobs + environment['assets']:
    master = ROOT / job['master']
    export = ROOT / job.get('export', job.get('runtime', ''))
    master_hash, export_hash = sha(master), sha(export)
    reviewed = copy.deepcopy(reviews_by_hash[master_hash])
    assert reviewed['acceptedForIntegration'], f"Unaccepted master: {job['id']}"
    source_refs = []
    for source in reviewed.get('sourceReferences', []):
        item = copy.deepcopy(source)
        original = Path(source['path'])
        if not original.is_absolute():
            original = ROOT / original
        target = reference_dir / original.name
        if not original.exists() and target.exists():
            original = target
        assert original.exists(), f'Missing inspected reference: {original}'
        if target.exists():
            assert sha(target) == sha(original), f'Reference name collision: {target}'
        else:
            shutil.copy2(original, target)
        if source.get('sha256'):
            assert source['sha256'] == sha(target)
        item.update(path=rel(target), sha256=sha(target))
        item['nativeFrameDimensions'] = item.get('dimensions', list(Image.open(target).size))
        item['kind'] = item.get('kind', 'primary_reference_visually_inspected')
        source_refs.append(item)
    native, runtime = Image.open(master).convert('RGBA'), Image.open(export).convert('RGBA')
    assert native.size == runtime.size and native.tobytes() == runtime.tobytes(), job['id']
    alpha = native.getchannel('A')
    hist = alpha.histogram()
    runtime_status = job['runtimeStatus']
    notes = distinct(job.get('fidelityNotes', []) + reviewed.get('limitations', []))
    asset = {
        'id': job['id'], 'name': job['name'],
        'sourceIdentityId': job.get('sourceIdentityId'),
        'category': job['category'], 'franchise': job['franchise'],
        'incarnation': job['name'], 'continuity': job['continuity'],
        'spoilerTier': job['spoilerScope'], 'spoilerScope': job['spoilerScope'],
        'accepted': True, 'status': 'independent_review_accepted',
        'runtimeStatus': runtime_status,
        'eligibility': 'wearable' if runtime_status == 'selectable_costume' else 'stage' if runtime_status in ['selectable_stage', 'stage_scenery'] else 'galleryOnly',
        'runtimeUsage': usage[runtime_status],
        'frameCoverage': job.get('frameCoverage', 'complete_scene' if job['category'] == 'stage' else 'complete_object'),
        'master': rel(master), 'export': rel(export),
        'exportUrl': '/' + str(export.relative_to(ROOT / 'public')),
        'dimensions': list(native.size), 'width': native.width, 'height': native.height,
        'alphaExtrema': list(alpha.getextrema()), 'alphaZeroPixels': hist[0], 'alphaFullPixels': hist[255],
        'visibleBBoxAlpha16': list(alpha.point(lambda value: 255 if value >= 16 else 0).getbbox()),
        'pixelExactExport': True, 'masterSha256': master_hash, 'exportSha256': export_hash,
        'masterBytes': master.stat().st_size, 'exportBytes': export.stat().st_size,
        'referenceUrls': distinct(job['referenceUrls'] + [ref['url'] for ref in source_refs]),
        'sourceReferences': source_refs, 'fidelityNotes': notes, 'limits': notes,
        'visualReview': reviewed, 'independentReview': rel(HERE / 'independent-review-root.json'),
        'addsStandaloneBase': False, 'newIdentity': False,
        'newAnimationCycles': 0, 'animationCycles': 0, 'poseCount': 1,
        'fidelityOneToOneCertified': False, 'inGameChecked': False,
    }
    if job.get('stageId'):
        asset['stageId'] = job['stageId']
    if job.get('thumbnail'):
        thumb = copy.deepcopy(job['thumbnail'])
        thumb_path = ROOT / thumb['path']
        assert thumb['sha256'] == sha(thumb_path)
        thumb['bytes'] = thumb_path.stat().st_size
        asset['thumbnail'] = thumb
    assets.append(asset)

assert len(assets) == 7 and len({asset['masterSha256'] for asset in assets}) == 7
gallery = read(ROOT / 'art/infernal-versus/production/reserve-assets.json')
assert len(gallery['assets']) == 106
coverage = read(HERE / 'active-asset-coverage.json')
assert coverage['summary']['brokenReferences'] == []
for key, expected in {'fighters': 43, 'costumes': 21, 'stages': 43, 'reserveGalleryEntries': 106, 'illustratedStoryAssignments': 127, 'globalIllustrations': 11}.items():
    assert coverage['summary'][key] == expected, f'Runtime coverage changed: {key}'
gallery_by_id = {item['id']: item for item in gallery['assets']}
for asset in assets:
    if asset['category'] != 'stage':
        entry = gallery_by_id[asset['id']]
        assert entry['masterSha256'] == asset['masterSha256']
        assert entry['exportSha256'] == asset['exportSha256']
        assert entry['runtimeStatus'] == asset['runtimeStatus']

baseline = copy.deepcopy(previous['cumulativeCounts'])
current = {**baseline, 'reserveGalleryEntries': 106, 'runtimeCostumeFamilies': 21, 'activeStages': 43}
counts = {
    'distinctDrawings': 7, 'newDrawings': 7, 'revisedDrawings': 0,
    'masterPng': 7, 'losslessWebp': 7, 'thumbnails': 1, 'deliveredImageFiles': 15,
    'deliveredImageBytes': sum(item['masterBytes'] + item['exportBytes'] + item.get('thumbnail', {}).get('bytes', 0) for item in assets),
    'newStandaloneBases': 0, 'newCharacterBases': 0, 'newPlayableKits': 0,
    'newStaticCostumes': 1, 'newNarrativeIncarnations': 1, 'newStages': 1,
    'newSceneryProps': 2, 'newReserveProps': 2, 'newAnimationCycles': 0,
    'generatorRefused': len(refused), 'historicalVariantRequirementsReconciled': 0,
}
candidate_states = [
    {'id': 'hb_moxxies_mother', 'sourceIdentityId': 'hb_moxxies_mother', 'name': 'Mère de Moxxie',
     'status': 'portrait_delivered_full_body_still_missing', 'accepted': True,
     'assetId': 'hb_moxxies_mother-portrait-s2',
     'notes': 'Buste à la taille livré. Le bas du corps n’est pas corroboré ; aucune base entière supplémentaire comptée.',
     'referenceUrls': next(a['referenceUrls'] for a in assets if a['id'] == 'hb_moxxies_mother-portrait-s2')},
    {'id': 'lute', 'sourceIdentityId': 'lute', 'name': 'Lute après le final S1',
     'status': 's1_static_costume_delivered', 'accepted': True, 'assetId': 'lute-post-finale-s1-ready',
     'notes': 'Bras gauche absent, halo d’Adam ; incarnation distincte de la tenue pré-blessure et de la prothèse S2 refusée en V8. Une seule image pendant les actions.',
     'referenceUrls': ['https://www.youtube.com/watch?v=q9lzr9zsUT4']},
]
for attempt in refused:
    candidate_states.append({
        'id': attempt['id'], 'sourceIdentityId': attempt['sourceIdentityId'],
        'status': attempt['status'], 'accepted': False, 'assetId': None,
        'requestId': attempt['requestId'],
        'notes': 'Sortie refusée par le générateur natif ; aucun fichier livré et aucune relance de cette cible.',
        'referenceUrls': [],
    })
remaining = copy.deepcopy(previous['remaining'])
remaining['inheritedFrom'] = 'docs/standalone/production-v8/delivery-register.json'
remaining['refusedThisWave'] = [item['sourceIdentityId'] for item in refused]
remaining['inheritedRefusedV8'] = previous['remaining'].get('refusedThisWave', [])
remaining['v9PartialCharacterCoverage'] = [candidate_states[0]]
remaining['limitations'] = distinct(remaining.get('limitations', []) + [
    'V9 ne réduit pas les 100 identifiants de catalogue (99 identités après alias connu) sans base autonome par défaut.',
    'Le portrait de la mère de Moxxie n’est pas une silhouette complète ; la tenue Lute n’ajoute ni identité ni kit.',
    'Les contrôles navigateur V9 portent sur les nouveaux assets et les parcours décrits dans browser-qa.json ; ils ne valident pas rétrospectivement tout le catalogue.',
])
qa_path, browser_path = HERE / 'runtime-qa.json', HERE / 'browser-qa.json'
qa = read(qa_path) if qa_path.exists() else {'status': 'pending', 'summary': 'Vérifications techniques en cours.'}
qa['activeAssetCoverage'] = rel(HERE / 'active-asset-coverage.json')
qa['referencedAssets'] = coverage['summary']['referencedAssets']
if qa.get('log') and (ROOT / qa['log']).exists():
    qa['logSha256'] = sha(ROOT / qa['log'])
match = re.search(r'Standalone verified: (\d+) hashes', qa.get('standaloneIntegrityOutput', ''))
if match:
    qa['standaloneFilesVerified'] = int(match.group(1))
browser = read(browser_path) if browser_path.exists() else None
checked_ids = set(browser.get('checkedAssetIds', [])) if browser and browser.get('status') == 'passed' else set()
qa['inGameChecked'] = bool(browser and browser.get('status') == 'passed' and checked_ids)
qa['checkedAssetIds'] = sorted(checked_ids)
qa['browserReport'] = rel(browser_path)
qa['browserStatus'] = browser.get('summary', 'Voir la portée du rapport navigateur.') if browser else 'En cours.'
if qa['inGameChecked']:
    for asset in assets:
        asset['inGameChecked'] = asset['id'] in checked_ids
        if asset['inGameChecked']:
            asset['runtimeVerification'] = rel(browser_path)
if args.final:
    assert qa['status'] == 'passed', 'Final register requires passing current technical QA.'
    assert qa['inGameChecked'], 'Final register requires current browser verification.'
    assert all(asset['inGameChecked'] for asset in assets), 'Final register requires explicit coverage of every delivered asset.'
source_paths = [HERE / name for name in ['root-generation.json', 'root-image-qa.json', 'environment-handoff.json', 'divider-corrections.json', 'independent-review-root.json', 'refused-attempts.json', 'active-asset-coverage.json']]
source_paths += [path for path in [qa_path, browser_path] if path.exists()]
source_paths += sorted(reference_dir.iterdir())
register = {
    'schemaVersion': 1, 'edition': 'V9', 'date': '2026-11-26',
    'status': 'final_production_register' if args.final else 'draft_production_register',
    'repository': 'darknigthmare/hellbound-hotel-manager', 'branch': 'feat/infernal-versus-assets-20261124',
    'prNumber': 8, 'baselineCommit': '508923b4e9137523c1e97d5b05f6ee1e6241421a',
    'equivalentLocalBaselineCommit': '751432195e2e618f2a617ae2c58595a5a0b5b47a',
    'baseline': baseline, 'counts': counts, 'cumulativeCounts': current,
    'assets': assets, 'candidateStates': candidate_states,
    'variantStates': [{'id': 'VAR-013', 'status': 'partial_s1_after_finale_static_costume_delivered',
        'assetId': 'lute-post-finale-s1-ready',
        'notes': 'Couverture statique S1 étendue : tenue après blessure sélectionnable. La prothèse S2 refusée, les transitions et les cycles animés restent non livrés.',
        'referenceUrls': ['https://www.youtube.com/watch?v=q9lzr9zsUT4']}],
    'stageReconciliation': [{'planId': 'bee-lounge-s1', 'runtimeStageIds': ['bee-lounge-s1'],
        'assetIds': [item['id'] for item in assets if item.get('stageId') == 'bee-lounge-s1'],
        'currentStaticCoverage': 'Salon du bar distinct de bee-party : fond, miniature, tabouret et cloison à huit rangées/38 ouvertures. Composition du sol adaptée au combat AU ; musique existante réutilisée.',
        'referenceUrls': ['https://backgroundart.net/helluvaboss.html', 'https://backgroundart.net/art/helluva05.jpg']}],
    'attemptRegisters': [rel(HERE / name) for name in ['root-generation.json', 'environment-handoff.json', 'refused-attempts.json']],
    'remaining': remaining, 'qa': qa,
    'sourceFiles': [{'path': rel(path), 'sha256': sha(path)} for path in source_paths],
    'independentReview': rel(HERE / 'independent-review-root.json'),
    'fidelityOneToOneCertified': False,
}
output = HERE / 'delivery-register.json'
output.write_text(json.dumps(register, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'register': rel(output), 'status': register['status'], 'counts': counts, 'cumulativeCounts': current}, ensure_ascii=False))
