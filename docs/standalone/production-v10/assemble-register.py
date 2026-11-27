"""Integrate the reviewed V10 delivery, then finalize only after current QA.

--check-inputs is read-only. --integrate appends the gallery and plan and writes
a draft register. --final requires passing technical and browser evidence and
does not change the runtime gallery. --workbook-metadata records an independently
inspected V10 workbook after its final export. No image pixels are edited here.
"""
import argparse
import copy
import hashlib
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
LOCAL_BASE = '29b21d219c435225638fc47a5cd7959b6c1c8586'
REMOTE_BASE = '241d43ad6b95c7a10fe05155f35c0990c165b771'
BATCH = 'static-v10-2026-11-26'
DATE = '2026-11-26'
REGISTER = 'docs/standalone/production-v10/delivery-register.json'
REVIEW = 'docs/standalone/production-v10/independent-review-root.json'
GALLERY = 'art/infernal-versus/production/reserve-assets.json'
PLAN = 'docs/standalone/extension-plan.json'
BASE_KINDS = {'character_base', 'support_base', 'enemy_base'}
PROOF = HERE / 'catalogue-plan-qa.json'
parser = argparse.ArgumentParser(description=__doc__)
mode = parser.add_mutually_exclusive_group()
mode.add_argument('--check-inputs', action='store_true')
mode.add_argument('--integrate', action='store_true')
mode.add_argument('--final', action='store_true')
mode.add_argument('--workbook-metadata', action='store_true')
args = parser.parse_args()


def read(path):
    return json.loads(Path(path).read_text())


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def rel(path):
    return str(Path(path).resolve().relative_to(ROOT))


def source_path(value):
    path = Path(value)
    if not path.is_absolute():
        path = ROOT / path
    path = path.resolve()
    assert path.is_relative_to(ROOT), f'Reference must be persisted inside the repository first: {value}'
    assert path.is_file(), f'Missing source file: {path}'
    return path


def write(path, value):
    text = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    path = Path(path)
    if not path.exists() or path.read_text() != text:
        temporary = path.with_suffix(path.suffix + '.tmp')
        temporary.write_text(text)
        temporary.replace(path)


def unique(items):
    return list(dict.fromkeys(item for item in items if item))


def baseline_file(path):
    result = subprocess.run(['git', 'show', f'{LOCAL_BASE}:{path}'], cwd=ROOT,
                            text=True, capture_output=True, check=True)
    return json.loads(result.stdout)


baseline_gallery = baseline_file(GALLERY)
baseline_plan = baseline_file(PLAN)
previous = read(HERE.parent / 'production-v9/delivery-register.json')
baseline = copy.deepcopy(previous['cumulativeCounts'])
assert len(baseline_gallery['assets']) == baseline['reserveGalleryEntries'] == 106
assert len(baseline_plan['roster']) == baseline['catalogueIds'] == 209


def assert_owned_file(path, original):
    current = read(ROOT / path)
    if current == original:
        return
    proof = read(PROOF) if PROOF.exists() else {}
    expected = proof.get('lastWrittenHashes', {}).get(path)
    assert expected and sha(ROOT / path) == expected, f'Unreconciled concurrent edit: {path}'


if args.workbook_metadata:
    assert_owned_file(PLAN, baseline_plan)
    register = read(ROOT / REGISTER)
    qa = read(HERE / 'workbook-qa.json')
    package = qa.get('packaging') or {}
    assert register['status'] == 'final_production_register'
    assert qa['registerSha256'] == sha(ROOT / REGISTER), 'Workbook was built from a different register.'
    assert qa.get('visualReview') in ['passed', 'passed_with_documented_limits'], 'Inspect the rendered workbook views first.'
    assert package.get('finalSheetCount') == 52
    assert package.get('preservedWorksheetXmlParts') == 50
    assert package.get('preservedTableXmlParts') == 59
    assert package.get('originalPartsChangedUnexpectedly') == []
    workbook = ROOT / 'docs/standalone/INFERNAL_VERSUS_BIBLE_V10.xlsx'
    with __import__('zipfile').ZipFile(workbook) as archive:
        table_count = len([name for name in archive.namelist() if re.fullmatch(r'xl/tables/table[^/]+\.xml', name)])
    assert table_count == 61
    plan = read(ROOT / PLAN)
    meta = plan['meta']
    old_bible = copy.deepcopy(baseline_plan['meta']['latestProductionBible'])
    history = copy.deepcopy(baseline_plan['meta'].get('productionBibleHistory', []))
    history.append(old_bible)
    meta['productionBibleHistory'] = history
    meta['latestProductionBible'] = {
        'edition': 'V10', 'date': DATE, 'workbook': rel(workbook),
        'previousWorkbook': old_bible['workbook'], 'historicalSheetsPreserved': 50,
        'historicalTablesPreserved': 59, 'appendedSheets': 2,
        'finalSheets': 52, 'finalTables': 61, 'sha256': sha(workbook),
        'bytes': workbook.stat().st_size, 'register': REGISTER,
        'qa': rel(HERE / 'workbook-qa.json'), 'status': 'verified',
    }
    meta.pop('pendingProductionBible', None)
    meta['latestStaticDelivery'].setdefault('verification', {})['workbookReport'] = rel(HERE / 'workbook-qa.json')
    assert plan['productionBible'] == baseline_plan['productionBible']
    write(ROOT / PLAN, plan)
    proof = read(PROOF)
    proof['lastWrittenHashes'][PLAN] = sha(ROOT / PLAN)
    proof['workbook'] = copy.deepcopy(meta['latestProductionBible'])
    write(PROOF, proof)
    print(json.dumps({'status': 'workbook_metadata_recorded', 'workbook': meta['latestProductionBible']}, ensure_ascii=False))
    raise SystemExit(0)


input_names = ['root-generation.json', 'environment-handoff.json', 'characters-handoff.json',
               'independent-review-root.json', 'refused-attempts.json']
input_hashes = {name: sha(HERE / name) for name in input_names}
jobs = read(HERE / 'root-generation.json')
environment = read(HERE / 'environment-handoff.json')
characters = read(HERE / 'characters-handoff.json')
for handoff in [environment, characters]:
    assert handoff.get('status') not in [None, 'in_progress', 'pending'], 'Wait for a completed handoff.'
review = read(ROOT / REVIEW)
refused = read(HERE / 'refused-attempts.json')
assert isinstance(refused, list)
reviewed_hashes = [item['masterSha256'] for item in review['assets']]
assert len(reviewed_hashes) == len(set(reviewed_hashes)), 'Duplicate independent review master.'
reviews_by_hash = {item['masterSha256']: item for item in review['assets']}
assets = []

for raw in jobs + environment['assets'] + characters['assets']:
    job = copy.deepcopy(raw)
    asset_id = job.get('id', job.get('assetId'))
    master = source_path(job.get('master', job.get('masterPath')))
    export = source_path(job.get('export', job.get('runtime', job.get('runtimePath'))))
    assert export.is_relative_to(ROOT / 'public'), asset_id
    master_hash, export_hash = sha(master), sha(export)
    if job.get('masterSha256'):
        assert job['masterSha256'] == master_hash, f'Changed handoff master: {asset_id}'
    if job.get('exportSha256'):
        assert job['exportSha256'] == export_hash, f'Changed handoff export: {asset_id}'
    for file in job.get('files', []):
        assert sha(source_path(file['path'])) == file['sha256'], f'Changed file: {file["path"]}'
    assert master_hash in reviews_by_hash, f'Waiting for independent review of current master: {asset_id}'
    inspected = copy.deepcopy(reviews_by_hash[master_hash])
    assert inspected['acceptedForIntegration'] is True, f'Unaccepted master: {asset_id}'
    assert inspected.get('correctionRequired', False) is False, f'Correction pending: {asset_id}'
    refs = []
    for source in inspected.get('sourceReferences', []):
        item = copy.deepcopy(source)
        path = source_path(source['path'])
        assert source.get('sha256') == sha(path), f'Reference changed: {path}'
        dimensions = list(Image.open(path).size)
        if item.get('dimensions'):
            assert item['dimensions'] == dimensions, f'Reference dimensions differ: {path}'
        item.update(path=rel(path), sha256=sha(path), dimensions=dimensions,
                    nativeFrameDimensions=dimensions,
                    kind=item.get('kind', 'visually_inspected_reference'))
        if job.get('runtimeStatus') == 'selectable_costume':
            reference_url = urlparse(item.get('url', ''))
            video_id = parse_qs(reference_url.query).get('v', [None])[0]
            if reference_url.hostname == 'www.youtube.com' and video_id in ['D-2799Y07Zc', 'yXErLiSbxXQ', '7OIa6bri7aE']:
                item['kind'] = 'official_video_public_storyboard'
            elif reference_url.hostname == 'sharkrobot.com' and reference_url.path in [
                    '/products/queen-bee-party-dress-loona-enamel-pin',
                    '/products/truth-seekers-hallucination-moxxie-enamel-pin']:
                item['kind'] = 'official_licensed_product'
            else:
                raise AssertionError(f'Unqualified costume reference type: {item.get("url")}')
        refs.append(item)
    assert refs, f'No inspected source reference: {asset_id}'
    native, runtime = Image.open(master).convert('RGBA'), Image.open(export).convert('RGBA')
    assert native.size == runtime.size and native.tobytes() == runtime.tobytes(), f'Non-exact RGBA export: {asset_id}'
    if inspected.get('nativeDimensions'):
        assert inspected['nativeDimensions'] == list(native.size), f'Review dimensions differ: {asset_id}'
    alpha = native.getchannel('A')
    hist = alpha.histogram()
    bounds = alpha.point(lambda value: 255 if value > 16 else 0).getbbox()
    assert bounds, f'Empty master: {asset_id}'
    assert isinstance(job.get('addsStandaloneBase'), bool), f'Explicit addsStandaloneBase required: {asset_id}'
    assert job.get('newIdentity', False) is False, 'This continuation adds art for existing catalogue identities.'
    category = job['category']
    status = job['runtimeStatus']
    assert status in ['reserve', 'selectable_costume', 'selectable_stage', 'stage_scenery']
    assert status != 'selectable_costume' or category == 'costume'
    assert status != 'selectable_stage' or category == 'stage'
    assert not job['addsStandaloneBase'] or (category in BASE_KINDS and job['frameCoverage'] == 'full_body' and status == 'reserve')
    frame = job.get('frameCoverage', 'complete_scene' if category == 'stage' else 'complete_object')
    franchise = {'hazbin': 'Hazbin Hotel', 'helluva': 'Helluva Boss'}.get(job['franchise'], job['franchise'])
    spoiler = job['spoilerScope']
    assert spoiler in ['season_1', 'season_2', 'season_3']
    notes = unique(job.get('fidelityNotes', []) + job.get('limitations', []) + inspected.get('limitations', []) + inspected.get('limits', []))
    urls = unique(job.get('referenceUrls', []) + [x['url'] for x in job.get('primarySources', [])] + [x.get('url') for x in refs])
    assert urls, f'Missing reference URLs: {asset_id}'
    usage = {
        'selectable_costume': 'Costume statique sélectionnable du combattant existant ; même image pendant les actions, aucun nouveau kit ni cycle.',
        'selectable_stage': f'Arène sélectionnable {job.get("stageId")} : fond, miniature et objets séparés ; mise en scène de combat AU.',
        'stage_scenery': f'Objet séparé du décor {job.get("stageId")}, également consultable dans la galerie.',
        'reserve': 'Base entière consultable dans la galerie ; première silhouette qualifiée de cette identité, sans kit jouable.' if job['addsStandaloneBase'] else 'Illustration de réserve ; aucune nouvelle mécanique ni base entière déduite.',
    }[status]
    asset = {
        'id': asset_id, 'name': job['name'], 'sourceIdentityId': job.get('sourceIdentityId', job.get('characterId')),
        'category': category, 'kind': 'costume_base' if category == 'costume' else category,
        'franchise': franchise, 'incarnation': job.get('incarnation', job['name']),
        'continuity': job['continuity'], 'spoilerTier': spoiler, 'spoilerScope': spoiler,
        'accepted': True, 'status': 'independent_review_accepted', 'runtimeStatus': status,
        'eligibility': 'wearable' if status == 'selectable_costume' else 'stage' if status in ['selectable_stage', 'stage_scenery'] else 'galleryOnly',
        'runtimeUsage': usage, 'frameCoverage': frame,
        'master': rel(master), 'export': rel(export), 'exportUrl': '/' + str(export.relative_to(ROOT / 'public')),
        'dimensions': list(native.size), 'width': native.width, 'height': native.height,
        'alphaExtrema': list(alpha.getextrema()), 'alphaZeroPixels': hist[0], 'alphaFullPixels': hist[255],
        'visibleBBoxAlpha16': list(bounds), 'pixelExactExport': True,
        'masterSha256': master_hash, 'exportSha256': export_hash,
        'masterBytes': master.stat().st_size, 'exportBytes': export.stat().st_size,
        'referenceUrls': urls, 'sourceReferences': refs, 'fidelityNotes': notes, 'limits': notes,
        'visualReview': inspected, 'independentReview': REVIEW,
        'addsStandaloneBase': job['addsStandaloneBase'], 'newIdentity': False,
        'newAnimationCycles': 0, 'animationCycles': 0, 'poseCount': 1,
        'staticReadyOnly': status == 'selectable_costume',
        'fidelityOneToOneCertified': False, 'inGameChecked': False,
    }
    if job.get('stageId'):
        asset['stageId'] = job['stageId']
    if job.get('canonicalState'):
        asset['canonicalState'] = job['canonicalState']
    if job.get('thumbnail'):
        thumb = copy.deepcopy(job['thumbnail'])
        if isinstance(thumb, str):
            thumb = {'path': thumb}
        path = source_path(thumb['path'])
        assert not thumb.get('sha256') or thumb['sha256'] == sha(path)
        thumb.update(path=rel(path), sha256=sha(path), bytes=path.stat().st_size,
                     dimensions=list(Image.open(path).size))
        asset['thumbnail'] = thumb
    if category == 'stage':
        assert asset.get('stageId') and asset.get('thumbnail'), f'Complete stage metadata required: {asset_id}'
    assets.append(asset)

assert len(assets) == len({item['id'] for item in assets}) == len({item['masterSha256'] for item in assets})
assert set(item['masterSha256'] for item in assets).issubset(reviews_by_hash)
inventory = read(HERE.parent / 'production-v7/catalogue-audit.json')
identity_map = {row['id']: row['productionIdentityId'] for row in inventory['identities']}
assert set(identity_map) == {row['id'] for row in baseline_plan['roster']}
covered_before = {row['productionIdentityId'] for row in inventory['identities'] if row['baseAvailable']}
for edition in [7, 8, 9]:
    old = read(HERE.parent / f'production-v{edition}/delivery-register.json')
    for item in old['assets']:
        if item.get('accepted') and item.get('category') in BASE_KINDS and item.get('addsStandaloneBase', True):
            covered_before.add(identity_map[item['sourceIdentityId']])
assert len(covered_before) == baseline['standaloneBases'] == 109
assert sum(value not in covered_before for value in identity_map.values()) == baseline['catalogueIdsWithoutStandaloneBase']
assert len(set(identity_map.values()) - covered_before) == baseline['distinctProductionIdentitiesWithoutStandaloneBase']
covered = set(covered_before)
for asset in assets:
    if asset['sourceIdentityId']:
        assert asset['sourceIdentityId'] in identity_map, asset['id']
        asset['productionIdentityId'] = identity_map[asset['sourceIdentityId']]
    if asset['addsStandaloneBase']:
        production_id = asset['productionIdentityId']
        assert production_id not in covered, f'Existing base or alias counted twice: {asset["id"]}'
        covered.add(production_id)
        asset['newlyCoveredCatalogueIds'] = sorted(key for key, value in identity_map.items() if value == production_id)
    else:
        asset['newlyCoveredCatalogueIds'] = []

gallery_assets = [asset for asset in assets if asset['category'] != 'stage']
base_assets = [asset for asset in assets if asset['addsStandaloneBase']]
costumes = [asset for asset in assets if asset['runtimeStatus'] == 'selectable_costume']
rooms = [asset for asset in assets if asset['runtimeStatus'] == 'selectable_stage']
old_stages = read(HERE.parent / 'production-v9/active-asset-coverage.json')['stages']
old_stage_ids = {stage['id'] for stage in old_stages}
assert len({room['stageId'] for room in rooms}) == len(rooms)
assert not old_stage_ids.intersection(room['stageId'] for room in rooms), 'Existing stage counted as new.'
assert not {asset['id'] for asset in assets}.intersection(item['id'] for item in baseline_gallery['assets'])
assert {asset['id'] for asset in costumes} == {'hb_loona-party-queen-bee', 'hb_moxxie-hallucination-truth-seekers', 'charlie-demon-battle-s1-ready'}
assert {room['stageId'] for room in rooms} == {'asmodeus-bedroom-s2', 'blitz-sinsmas-dream-s2'}
current = {**baseline,
    'standaloneBases': len(covered), 'reserveStandaloneBases': baseline['reserveStandaloneBases'] + len(base_assets),
    'catalogueIdsWithoutStandaloneBase': sum(value not in covered for value in identity_map.values()),
    'distinctProductionIdentitiesWithoutStandaloneBase': len(set(identity_map.values()) - covered),
    'reserveGalleryEntries': baseline['reserveGalleryEntries'] + len(gallery_assets),
    'runtimeCostumeFamilies': baseline['runtimeCostumeFamilies'] + len(costumes),
    'activeStages': baseline['activeStages'] + len(rooms),
}
assert current['activeStandaloneBases'] + current['reserveStandaloneBases'] == current['standaloneBases']
counts = {
    'distinctDrawings': len(assets), 'newDrawings': len(assets), 'revisedDrawings': 0,
    'masterPng': len(assets), 'losslessWebp': len(assets), 'thumbnails': sum('thumbnail' in asset for asset in assets),
    'deliveredImageFiles': sum(2 + ('thumbnail' in asset) for asset in assets),
    'deliveredImageBytes': sum(asset['masterBytes'] + asset['exportBytes'] + asset.get('thumbnail', {}).get('bytes', 0) for asset in assets),
    'newStandaloneBases': len(base_assets), 'newCharacterBases': sum(asset['category'] == 'character_base' for asset in base_assets),
    'newlyCoveredCatalogueIds': sum(len(asset['newlyCoveredCatalogueIds']) for asset in base_assets),
    'newPlayableKits': 0, 'newStaticCostumes': len(costumes),
    'newNarrativeIncarnations': sum(asset['category'] == 'narrative_archive' for asset in assets),
    'newStages': len(rooms), 'newSceneryProps': sum(asset['runtimeStatus'] == 'stage_scenery' for asset in assets),
    'newReserveProps': sum(asset['category'] == 'prop' and asset['runtimeStatus'] == 'reserve' for asset in assets),
    'newAnimationCycles': 0, 'generatorRefused': len(refused),
    'historicalVariantRequirementsReconciled': 0, 'historicalVariantRequirementsPartiallyCovered': 2,
}
if args.check_inputs:
    print(json.dumps({'status': 'reviewed_inputs_verified_no_writes', 'counts': counts, 'cumulativeCounts': current}, ensure_ascii=False))
    raise SystemExit(0)


coverage_path, qa_path, browser_path = [HERE / name for name in ['active-asset-coverage.json', 'runtime-qa.json', 'browser-qa.json']]
coverage = read(coverage_path) if coverage_path.exists() else None
qa = read(qa_path) if qa_path.exists() else {'status': 'pending', 'summary': 'Vérifications techniques V10 non exécutées.'}
browser = read(browser_path) if browser_path.exists() else None
expected_coverage = {'fighters': current['activeFighters'], 'costumes': current['runtimeCostumeFamilies'],
                     'stages': current['activeStages'], 'reserveGalleryEntries': current['reserveGalleryEntries'],
                     'illustratedStoryAssignments': current['illustratedPersonalScenes'], 'globalIllustrations': current['illustratedGlobalScenes']}
coverage_pending = []
if coverage:
    coverage_pending = [key for key, expected in expected_coverage.items() if coverage['summary'].get(key) != expected]
    if coverage_pending and not args.final:
        coverage = None
if not coverage and qa.get('status') == 'passed':
    qa.update(status='pending', priorRecordedTechnicalStatus='passed',
              summary='Le contrôle de chemins doit être relancé après intégration de la galerie V10 ; résultat technique précédent non repris comme preuve finale.')
if coverage:
    assert coverage['summary']['brokenReferences'] == []
    for key, expected in expected_coverage.items():
        assert coverage['summary'][key] == expected, f'Runtime coverage does not match delivery: {key}'
    stage_lookup = {stage['id']: stage for stage in coverage['stages']}
    for room in rooms:
        stage = stage_lookup[room['stageId']]
        expected_planes = {asset['exportUrl'] for asset in assets if asset.get('stageId') == room['stageId']}
        assert set(stage['planes']) == expected_planes, f'Unexpected stage planes: {room["stageId"]}'
        assert stage['thumbnail'] == '/' + str(Path(room['thumbnail']['path']).relative_to('public'))
    qa['activeAssetCoverage'] = rel(coverage_path)
    qa['referencedAssets'] = coverage['summary']['referencedAssets']
checked = set(browser.get('checkedAssetIds', [])) if browser and browser.get('status') == 'passed' else set()
qa.update(inGameChecked=bool(checked), checkedAssetIds=sorted(checked), browserReport=rel(browser_path),
          browserStatus=browser.get('summary', 'Voir la portée du rapport navigateur.') if browser else 'Non exécuté.')
if qa.get('log'):
    qa['logSha256'] = sha(source_path(qa['log']))
match = re.search(r'Standalone verified: (\d+) hashes', qa.get('standaloneIntegrityOutput', ''))
if match:
    qa['standaloneFilesVerified'] = int(match.group(1))
for asset in assets:
    asset['inGameChecked'] = asset['id'] in checked
    if asset['inGameChecked']:
        asset['runtimeVerification'] = rel(browser_path)


def verify_recorded_hashes(values):
    if isinstance(values, dict):
        values = [{'path': path, 'sha256': value if isinstance(value, str) else value['sha256']} for path, value in values.items()]
    for item in values:
        assert sha(source_path(item['path'])) == item['sha256'], f'QA input changed: {item["path"]}'


if args.final:
    assert coverage, 'Final register requires the current runtime coverage audit.'
    assert qa.get('status') == 'passed', 'Final register requires current passing technical QA.'
    assert browser and browser.get('status') == 'passed', 'Final register requires current passing browser QA.'
    assert all(asset['inGameChecked'] for asset in assets), 'Every delivered asset needs explicit browser coverage.'
    assert qa.get('runtimeInputFiles'), 'Technical QA must record its current input hashes.'
    verify_recorded_hashes(qa['runtimeInputFiles'])
    if browser.get('runtimeFilesBefore'):
        assert browser['runtimeFilesBefore'] == browser['runtimeFilesAfter'], 'Runtime files changed during browser QA.'
        verify_recorded_hashes(browser['runtimeFilesAfter'])

gallery = copy.deepcopy(baseline_gallery)
for asset in gallery_assets:
    entry = {key: copy.deepcopy(asset[key]) for key in ['id', 'name', 'kind', 'franchise', 'sourceIdentityId', 'spoilerScope',
        'continuity', 'frameCoverage', 'runtimeStatus', 'master', 'export', 'dimensions', 'masterSha256', 'exportSha256',
        'pixelExactExport', 'fidelityOneToOneCertified', 'animationCycles', 'addsStandaloneBase', 'newIdentity']}
    entry.update(alphaBounds16=asset['visibleBBoxAlpha16'], batchId=BATCH, reference=asset['name'],
                 references=[{'url': ref['url'], 'kind': ref['kind'], 'title': ref.get('title', ref.get('role', asset['name']))} for ref in asset['sourceReferences'] if ref.get('url')],
                 intendedRole=asset['runtimeUsage'], visualReview=REVIEW, fidelityNotes=asset['fidelityNotes'],
                 reviewStatus='independent_review_accepted', inGameChecked=False)
    if asset['runtimeStatus'] == 'stage_scenery':
        entry['runtimeStageId'] = asset['stageId']
    if asset['runtimeStatus'] == 'selectable_costume':
        entry.update(runtimeSelectable=True, staticReadyOnly=True)
    if asset['frameCoverage'] == 'bust':
        entry['fullBodyBaseStillMissing'] = True
    if asset.get('productionIdentityId'):
        entry['productionIdentityId'] = asset['productionIdentityId']
    gallery['assets'].append(entry)
gallery['sourceBatches'].append(BATCH)
gallery['date'] = DATE
assert gallery['assets'][:len(baseline_gallery['assets'])] == baseline_gallery['assets']
assert len(gallery['assets']) == len({asset['id'] for asset in gallery['assets']}) == current['reserveGalleryEntries']

plan = copy.deepcopy(baseline_plan)


def preserve(row):
    assert 'coverageBeforeStaticV10' not in row
    row['coverageBeforeStaticV10'] = copy.deepcopy({key: value for key, value in row.items() if not key.startswith('coverageBefore')})


def production(asset, **extra):
    keys = ['id', 'master', 'export', 'masterSha256', 'exportSha256', 'frameCoverage', 'runtimeStatus', 'addsStandaloneBase', 'newIdentity', 'continuity']
    item = {key: copy.deepcopy(asset[key]) for key in keys}
    item['assetId'] = item.pop('id')
    item.update(batchId=BATCH, references=asset['referenceUrls'], register=REGISTER, animationCycles=0,
                fidelityOneToOneCertified=False, runtimePlayable=False, **extra)
    return item


candidate_states = []
roster = {row['id']: row for row in plan['roster']}
for asset in [*base_assets, *costumes, *[item for item in assets if item['category'] == 'narrative_archive']]:
    row = roster[asset['sourceIdentityId']]
    preserve(row)
    is_base = asset['addsStandaloneBase']
    note = ('Première silhouette entière qualifiée de cette identité de production, conservée en galerie de réserve. '
            'L’incarnation et ses limites restent explicites ; aucun kit jouable, cycle ni validation 1:1 ajouté.' if is_base else
            'Une incarnation entière statique sélectionnable ; même pose pendant toutes les actions du kit existant. '
            'Aucune nouvelle base d’identité, mécanique ou animation.' if asset['runtimeStatus'] == 'selectable_costume' else
            'Illustration narrative partielle ; aucune base entière supplémentaire comptée.')
    note += ' ' + ' '.join(asset['fidelityNotes'])
    state = 'full_body_reserve_base_delivered' if is_base else 'static_costume_delivered' if asset['runtimeStatus'] == 'selectable_costume' else 'partial_narrative_illustration_delivered'
    row['qualificationV10'] = {'status': state, 'assetId': asset['id'], 'notes': note, 'references': asset['referenceUrls'], 'register': REGISTER}
    row['currentStaticCoverage'] = note
    if is_base:
        row['staticProduction'] = production(asset, coverage='one_full_body_reserve_base', runtimeSelectable=False,
                                             primaryIncarnation=asset['incarnation'], sourceIdentityId=asset['sourceIdentityId'])
    elif asset['runtimeStatus'] == 'selectable_costume':
        row.setdefault('staticIncarnations', []).append(production(asset, coverage='one_static_incarnation', runtimeSelectable=True,
                                                                 staticReadyOnly=True, defaultBaseUnchanged=True))
    else:
        row['staticProduction'] = production(asset, coverage='narrative_bust_only', fullBodyBaseStillMissing=True)
    candidate_states.append({'id': asset['sourceIdentityId'], 'sourceIdentityId': asset['sourceIdentityId'], 'name': asset['name'],
                             'status': state, 'accepted': True, 'assetId': asset['id'], 'notes': note, 'referenceUrls': asset['referenceUrls']})

variant_states = []
variant_map = {row['id']: row for row in plan['variants']}
for asset in costumes:
    variant_ids = ['VAR-001', 'VAR-002'] if asset['sourceIdentityId'] == 'charlie' else ['VAR-V10-' + asset['id']]
    note = ('Une seule illustration combine tenue du combat final S1 et transformation partielle (cornes, queue, bras gauche rouge agrandi). '
            'VAR-001 et VAR-002 pointent vers ce même dessin, compté une seule fois.' if asset['sourceIdentityId'] == 'charlie' else
            'Tenue entière statique distincte des costumes historiques de cette identité, sélectionnable avec son kit actuel.')
    note += ' Une pose READY est réutilisée pour les actions ; atlas animé, transitions et exigences complémentaires restent à produire.'
    for variant_id in variant_ids:
        if variant_id in variant_map:
            row = variant_map[variant_id]
            preserve(row)
        else:
            row = {'id': variant_id, 'fighter': asset['sourceIdentityId'], 'name': asset['name'], 'type': 'Costume',
                   'reference': '; '.join(asset['referenceUrls']), 'requirements': 'Costume complet et cycles dédiés à qualifier.',
                   'canonEvidence': 'Sources primaires visibles répertoriées ; détails fins non certifiés.',
                   'priority': 'P2', 'lot': 'V3', 'source': 'SRC-STATIC-V10', 'createdByStaticV10': True}
            plan['variants'].append(row)
        row.update(status='Partiel', currentStaticCoverage=note,
                   qualificationV10={'status': 'partial_static_incarnation_delivered', 'assetId': asset['id'], 'notes': note,
                                     'references': asset['referenceUrls'], 'register': REGISTER},
                   staticProduction=production(asset, coverage='one_static_incarnation', runtimeSelectable=True,
                                               staticReadyOnly=True, defaultBaseUnchanged=True, gameplayEligibility='wearable'),
                   acceptanceV10='Pose statique sélectionnable ; aucune animation de transition, nouveau cycle, kit ou certification 1:1 livré.')
        variant_states.append({'id': variant_id, 'status': 'Partiel', 'assetId': asset['id'], 'notes': note, 'referenceUrls': asset['referenceUrls']})

stage_reconciliation = []
stage_suggestions = {item['id']: item for item in environment.get('stageSuggestions', [])}
for room in rooms:
    stage_id = room['stageId']
    assert stage_id not in {row['id'] for row in plan['stages']}
    associated = [asset for asset in assets if asset.get('stageId') == stage_id]
    suggestion = stage_suggestions.get(stage_id, {})
    note = ('Chambre d’Asmodeus documentée dans Oops, distincte du cabaret Ozzie’s ; fond, miniature, console et candélabre séparés.'
            if stage_id == 'asmodeus-bedroom-s2' else
            'Scène de Noël imaginée par Blitzø dans Sinsmas : fond, miniature et boule à neige séparée. Vision explicite, pas un domicile réel établi.')
    note += ' Décor statique ; sol et présentation du duel adaptés à la simulation AU, aucun nouvel audio commercial.'
    source_id = 'SRC-V10-' + stage_id.upper()
    plan['stages'].append({'id': stage_id, 'name': suggestion.get('name', room['name']), 'franchise': room['franchise'],
        'place': 'Chambre d’Asmodeus' if stage_id == 'asmodeus-bedroom-s2' else 'Vision de Noël de Blitzø',
        'continuity': room['continuity'], 'canonicalState': suggestion.get('canonicalState', 'episode_location'),
        'priority': 'P2', 'lot': 'V3', 'source': source_id, 'reference': '; '.join(room['referenceUrls']),
        'design': note, 'registryNote': 'Nouvelle arène distincte ; aucune lacune d’un ancien lieu n’est résolue par substitution.',
        'createdByStaticV10': True, 'status': 'Partiel', 'runtimeId': stage_id, 'runtimeStageId': stage_id, 'runtimeStageIds': [stage_id],
        'asset': room['export'], 'currentStaticCoverage': note,
        'acceptance': 'Composition et échelle adaptées ; validation en jeu limitée aux rapports V10. Fidélité 1:1 non certifiée.',
        'staticProduction': {'batchId': BATCH, 'assetIds': [asset['id'] for asset in associated], 'runtimeStageIds': [stage_id],
                             'register': REGISTER, 'references': unique(url for asset in associated for url in asset['referenceUrls']),
                             'animationCycles': 0, 'fidelityOneToOneCertified': False, 'productionStatus': 'independent_review_accepted'}})
    stage_reconciliation.append({'planId': stage_id, 'runtimeStageIds': [stage_id], 'assetIds': [asset['id'] for asset in associated],
                                 'currentStaticCoverage': note, 'referenceUrls': unique(url for asset in associated for url in asset['referenceUrls'])})
    plan['sources'].append([source_id, 'Référence primaire documentée', suggestion.get('name', room['name']), DATE,
                            'Lieu et objets inspectés ; arène de combat statique adaptée, aucune fidélité 1:1 certifiée.', room['referenceUrls'][0]])
plan['sources'].append(['SRC-STATIC-V10', 'Dépôt / production', 'Production statique V10', DATE,
                        'Livraisons, nouvelles bases entières, costumes, décors, limites et preuves de QA.', REGISTER])
assert len({row[0] for row in plan['sources']}) == len(plan['sources'])

remaining = copy.deepcopy(previous['remaining'])
remaining['inheritedFrom'] = 'docs/standalone/production-v9/delivery-register.json'
remaining['inheritedRefusedV9'] = copy.deepcopy(previous['remaining'].get('refusedThisWave', []))
remaining['refusedThisWave'] = [item.get('sourceIdentityId', item.get('id')) for item in refused]
remaining['resolvedFullBodyIdentitiesV10'] = [asset['sourceIdentityId'] for asset in base_assets]
remaining['characterReferenceGaps'] = [identity for identity in remaining.get('characterReferenceGaps', []) if identity not in remaining['resolvedFullBodyIdentitiesV10']]
remaining['limitations'] = unique(remaining.get('limitations', []) + [
    f'V10 ajoute {len(base_assets)} premières silhouettes entières : {current["catalogueIdsWithoutStandaloneBase"]} IDs et {current["distinctProductionIdentitiesWithoutStandaloneBase"]} identités après alias restent sans base autonome.',
    'Un costume, un buste, un accessoire ou un lieu ne réduit pas les identités sans base entière. Les deux variantes Charlie partagent un seul dessin.',
    'Les deux arènes V10 ne résolvent pas les lacunes historiques d’autres lieux ; Noël est une vision de Blitzø.',
    'Les contrôles V10 concernent les assets et parcours explicitement consignés ; aucune validation rétrospective de tout le catalogue.',
])
for item in refused:
    candidate_states.append({'id': item['id'], 'sourceIdentityId': item.get('sourceIdentityId'),
                             'status': item['status'], 'accepted': False, 'assetId': None,
                             'notes': 'Sortie refusée ; aucun fichier livré et aucune relance de cette cible.', 'referenceUrls': item.get('referenceUrls', [])})

meta = plan['meta']
meta.setdefault('runtimeHistory', []).append(copy.deepcopy(baseline_plan['meta']['currentRuntime']))
meta.setdefault('staticDeliveryHistory', []).append(copy.deepcopy(baseline_plan['meta']['latestStaticDelivery']))
runtime_meta = meta['currentRuntime']
runtime_meta.update(date=DATE, batchId=BATCH, baseCommit=LOCAL_BASE, fighters=current['activeFighters'],
                    runtimeKits=current['activeFighters'], stages=current['activeStages'], reserveGalleryDrawings=current['reserveGalleryEntries'],
                    costumeFamilies=current['runtimeCostumeFamilies'], standaloneBases=current['standaloneBases'],
                    catalogueIdsWithoutStandaloneBase=current['catalogueIdsWithoutStandaloneBase'],
                    distinctProductionIdentitiesWithoutStandaloneBase=current['distinctProductionIdentitiesWithoutStandaloneBase'],
                    productionRegister=REGISTER, assetCoverageReport=rel(coverage_path),
                    referencedAssets=coverage['summary']['referencedAssets'] if coverage else None,
                    note=f'V10 : {len(assets)} dessins retenus, {len(base_assets)} nouvelles bases entières en réserve, {len(costumes)} costumes statiques et {len(rooms)} arènes. Aucun kit ni cycle animé nouveau.')
for key in ['browserReview', 'technicalReview']:
    runtime_meta.pop(key, None)
for key in ['onePlaneStages', 'twoPlaneStages', 'threePlaneStages']:
    runtime_meta[key] = coverage['summary'][key] if coverage else None
runtime_meta['referencedAssetsStatus'] = 'verified_current_v10_paths' if coverage else 'awaiting_current_v10_path_audit'
if browser:
    runtime_meta['browserReview'] = {'status': browser['status'], 'report': rel(browser_path), 'checkedAssetIds': sorted(checked),
                                    'scope': browser.get('scope'), 'summary': browser.get('summary')}
if qa_path.exists():
    runtime_meta['technicalReview'] = {key: qa.get(key) for key in ['status', 'testsPassed', 'testSuites', 'managerBuild', 'standaloneBuild', 'standardQaScriptPassed', 'buildMethod']}
    runtime_meta['technicalReview']['report'] = rel(qa_path)
meta['latestStaticDelivery'] = {'date': DATE, 'batchId': BATCH, 'baseCommit': LOCAL_BASE,
    'branch': 'feat/infernal-versus-assets-20261124', 'prNumber': 8, 'register': REGISTER,
    'status': 'final_production_register' if args.final else 'integration_pending_final_register', 'counts': counts,
    'scope': runtime_meta['note'], 'verification': {'technicalReport': rel(qa_path), 'browserReport': rel(browser_path)}}
meta['pendingProductionBible'] = {'edition': 'V10', 'workbook': 'docs/standalone/INFERNAL_VERSUS_BIBLE_V10.xlsx',
    'previousWorkbook': 'docs/standalone/INFERNAL_VERSUS_BIBLE_V9.xlsx', 'historicalSheetsPreserved': 50,
    'historicalTablesPreserved': 59, 'appendedSheets': 2, 'expectedFinalSheets': 52, 'expectedFinalTables': 61,
    'status': 'awaiting_final_register_and_export', 'register': REGISTER}
assert plan['productionBible'] == baseline_plan['productionBible']
assert plan['stages'][:len(baseline_plan['stages'])] == baseline_plan['stages']
assert plan['sources'][:len(baseline_plan['sources'])] == baseline_plan['sources']
changed_roster = {asset['sourceIdentityId'] for asset in [*base_assets, *costumes, *[item for item in assets if item['category'] == 'narrative_archive']]}
for before, after in zip(baseline_plan['roster'], plan['roster']):
    if before['id'] not in changed_roster:
        assert before == after
    else:
        for key, value in before.items():
            if key.startswith('qualificationV') or key.startswith('coverageBefore'):
                assert after[key] == value
for before, after in zip(baseline_plan['variants'], plan['variants']):
    assert before['id'] == after['id']
    if before['id'] not in ['VAR-001', 'VAR-002']:
        assert before == after
for key in ['tasks', 'parity', 'techniques', 'campaigns', 'qa', 'kits']:
    assert plan[key] == baseline_plan[key]

assert_owned_file(GALLERY, baseline_gallery)
assert_owned_file(PLAN, baseline_plan)
if not args.integrate:
    assert read(ROOT / GALLERY) == gallery, 'Run --integrate before QA; finalization cannot change the runtime gallery.'
source_paths = [HERE / name for name in input_names]
source_paths += [path for path in [HERE / 'root-image-qa.json', HERE / 'environment-image-qa.json', coverage_path, qa_path, browser_path] if path.exists()]
source_paths += [source_path(ref['path']) for asset in assets for ref in asset['sourceReferences']]
source_paths = list(dict.fromkeys(source_paths))
register = {
    'schemaVersion': 1, 'edition': 'V10', 'date': DATE,
    'status': 'final_production_register' if args.final else 'draft_production_register',
    'repository': 'darknigthmare/hellbound-hotel-manager', 'branch': 'feat/infernal-versus-assets-20261124', 'prNumber': 8,
    'baselineCommit': REMOTE_BASE, 'equivalentLocalBaselineCommit': LOCAL_BASE,
    'baseline': baseline, 'counts': counts, 'cumulativeCounts': current,
    'baseCoverageReconciliation': {'sourceAudit': 'docs/standalone/production-v7/catalogue-audit.json',
        'historicalRegisterEditions': ['V7', 'V8', 'V9'], 'knownAliases': inventory['sharedAliases'],
        'coveredProductionIdentitiesBefore': sorted(covered_before), 'coveredProductionIdentitiesAfter': sorted(covered),
        'newlyCoveredCatalogueIds': sorted(identity for asset in base_assets for identity in asset['newlyCoveredCatalogueIds']),
        'newStandaloneBaseIdentities': sorted(asset['productionIdentityId'] for asset in base_assets)},
    'assets': assets, 'candidateStates': candidate_states, 'variantStates': variant_states,
    'stageReconciliation': stage_reconciliation,
    'attemptRegisters': [rel(HERE / name) for name in ['root-generation.json', 'environment-handoff.json', 'characters-handoff.json', 'refused-attempts.json']],
    'remaining': remaining, 'qa': qa, 'sourceFiles': [{'path': rel(path), 'sha256': sha(path)} for path in source_paths],
    'independentReview': REVIEW, 'fidelityOneToOneCertified': False,
}
assert {name: sha(HERE / name) for name in input_names} == input_hashes, 'Handoff changed during assembly.'
if args.integrate:
    write(ROOT / GALLERY, gallery)
write(ROOT / PLAN, plan)
write(ROOT / REGISTER, register)
proof = {
    'edition': 'V10', 'status': 'final_register_and_plan_verified' if args.final else 'draft_catalogue_plan_integrated',
    'baselineCommit': LOCAL_BASE, 'historicalGalleryEntriesPreserved': len(baseline_gallery['assets']),
    'historicalPlanStagesPreserved': len(baseline_plan['stages']), 'historicalPlanVariantRowsPreserved': len(baseline_plan['variants']),
    'historicalVariantRowsExtendedWithoutRemovingFields': ['VAR-001', 'VAR-002'],
    'newGalleryIds': [asset['id'] for asset in gallery_assets], 'newStageIds': [room['stageId'] for room in rooms],
    'newStandaloneBaseIdentities': sorted(asset['productionIdentityId'] for asset in base_assets),
    'counts': counts, 'cumulativeCounts': current,
    'lastWrittenHashes': {path: sha(ROOT / path) for path in [GALLERY, PLAN]},
    'limits': ['Gallery metadata remains stable after QA; per-asset browser observations live in the final register.',
               'No new kits, animation cycles or fidelity certification. Historical workbook content untouched.'],
}
write(PROOF, proof)
print(json.dumps({'register': REGISTER, 'status': register['status'], 'counts': counts, 'cumulativeCounts': current}, ensure_ascii=False))
