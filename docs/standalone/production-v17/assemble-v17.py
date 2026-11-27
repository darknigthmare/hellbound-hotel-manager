"""Reconcile four new static props without changing historical catalogue entries."""
from pathlib import Path
import copy, hashlib, json
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
HERE = ROOT / 'docs/standalone/production-v17'
BATCH = 'static-v17-2026-11-27'
BASE = '28c98cf1fa67fa02c7f7565a231059d57f872d50'
def read(path): return json.loads((ROOT / path).read_text())
def write(path, value): (ROOT / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def digest(path): return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()
def evidence(path, url, author):
    f = ROOT / path
    im = Image.open(f)
    return {'path': path, 'sha256': digest(path), 'bytes': f.stat().st_size,
            'dimensions': list(im.size), 'mode': im.mode, 'url': url,
            'author': author, 'primary': True, 'viewed': True,
            'kind': 'official_production_artist_portfolio_image'}

prior = read('docs/standalone/production-v16/delivery-register.json')
handoff = read('docs/standalone/production-v17/props-handoff.json')
prompts = read('docs/standalone/production-v17/root-prompts.json')
assets = []
review = read('docs/standalone/production-v17/independent-visual-review.json')
review_assets = {item['id']: item for item in review['assets']}
for item in handoff['assets']:
    prim = item['primary']; context = item['context']
    notes = ['Objet isolé redessiné depuis un fond de production primaire. Les détails fins et proportions sont adaptés, sans certification 1:1.',
             'La datation du décor est héritée du dossier de sources antérieur ; aucune nouvelle relecture intégrale de l’épisode.',
             'Alpha natif conservé, y compris les pixels très faibles dans les marges. Export WebP identique en RGBA au PNG.']
    assets.append({'id': item['id'], 'name': 'Spring Broken · Canette bleue' if 'can-' in item['id'] else 'Crimson · Trophée mural à cornes',
        'continuity': 'season_1' if item['id'].endswith('s1') else 'season_2',
        'reference': context['episodeTitle'] + ' ; fond de production ' + prim['imageTitle'] + ' — ' + prim['creator'],
        'sourceReferences': [evidence(prim['reference']['path'], prim['imageUrl'], prim['creator'])],
        'references': [{'url': prim['portfolioUrl'], 'kind': 'official_production_artist_portfolio', 'title': prim['creator'] + ' · fond de production'},
                       {'url': prim['imageUrl'], 'kind': 'official_production_artist_portfolio_image', 'title': prim['imageTitle']},
                       {'url': context['episodeUrl'], 'kind': 'official_episode_or_clip', 'title': context['episodeTitle'] + ' · contexte hérité'}],
        'fidelityNotes': notes, 'generation': item['generation'], 'operatorVisualReview': item['visualReview']})

root_definitions = [
    ('unhappy-campers-outboard-motor-s2', 'Unhappy Campers · Moteur hors-bord', 'jasper-boathouse-21.jpg',
     'https://images.squarespace-cdn.com/content/v1/600b2d56a47f4b27bcd130c7/2aa9fc40-b5d7-4586-8fac-80ba40db8d48/02.jpeg',
     'Unhappy Campers S2E5 · fond du hangar à bateaux', 'https://www.youtube.com/watch?v=lYu1ysDULwA&t=1030s',
     'Carter, grille, bouton, arbre et hélice visibles dans la peinture. Le moteur est séparé du bateau, sans inventer son revers. Les facettes et proportions fines sont régularisées.'),
    ('crimson-fanged-jaw-wall-trophy-s2', 'Crimson · Trophée mural à mâchoire', 'jasper-crimson-204.jpg',
     'https://images.squarespace-cdn.com/content/v1/600b2d56a47f4b27bcd130c7/52d86334-637e-4d47-9e4a-5e1128f674c0/204.jpg',
     'Exes and Oohs S2E3 · salle à manger de Crimson', 'https://www.youtube.com/watch?v=j1BfO7VlIw4',
     'Mâchoire décorative horizontale à droite du trophée à cornes sur le mur du fond. La courbe, le nombre/profil exact des dents et les ombres sont adaptés depuis un petit motif. Aucune espèce ni anatomie attribuée.')
]
for id, name, filename, url, title, episode, limitation in root_definitions:
    prompt = next(p for p in prompts if p['id'] == id)
    assets.append({'id': id, 'name': name, 'continuity': 'season_2',
        'reference': title + ' ; peinture de production de Jasper Luu',
        'sourceReferences': [evidence('production/v17/props/references/' + filename, url, 'Jasper Luu')],
        'references': [{'url': 'https://jasperluu.com/helluvaboss', 'kind': 'official_production_artist_portfolio', 'title': 'Jasper Luu · fond de production'},
                       {'url': url, 'kind': 'official_production_artist_portfolio_image', 'title': title},
                       {'url': episode, 'kind': 'official_episode_or_clip', 'title': title + ' · contexte hérité'}],
        'fidelityNotes': [limitation, 'Un objet par image. Redessin statique isolé ; aucune certification 1:1.',
                          'Export WebP sans perte, RGBA identique au PNG natif ; aucune modification de l’alpha.'],
        'generation': {'tool': 'image_gen.imagegen', 'prompt': prompt['prompt'], 'referencedImagePaths': [prompt['ref'].split('hellbound-hotel-manager/')[-1]], 'transparentBackground': True, 'attempts': 1},
        'operatorVisualReview': {'status': 'accepted_with_documented_limits', 'wholeContourVisible': True, 'sourceInspected': True}})

for a in assets:
    visual = review_assets[a['id']]
    assert visual['acceptedForIntegration'], 'Visual correction required: ' + a['id']
    master = visual['master']
    export = visual['export']
    assert digest(master) == visual['masterSha256'] and digest(export) == visual['exportSha256']
    im = Image.open(ROOT / master).convert('RGBA'); web = Image.open(ROOT / export).convert('RGBA')
    assert im.size == web.size and im.tobytes() == web.tobytes(), a['id']
    alpha = im.getchannel('A')
    bounds = alpha.point(lambda v: 255 if v >= 16 else 0).getbbox()
    assert bounds and bounds[0] > 0 and bounds[1] > 0 and bounds[2] < im.width and bounds[3] < im.height
    a.update({'category': 'prop', 'kind': 'prop', 'subtype': 'static_scenery_prop',
        'franchise': 'Helluva Boss', 'spoilerScope': a['continuity'], 'frameCoverage': 'full_object',
        'runtimeStatus': 'reserve', 'runtimeUsage': 'Consultation statique dans la galerie ; aucun objet interactif ou véhicule pilotable.',
        'sourceIdentityId': None, 'productionIdentityId': None, 'addsStandaloneBase': False,
        'newlyCoveredCatalogueIds': [], 'newAnimationCycles': 0, 'newPlayableKits': 0,
        'master': master, 'export': export, 'masterSha256': digest(master), 'exportSha256': digest(export),
        'masterBytes': (ROOT/master).stat().st_size, 'exportBytes': (ROOT/export).stat().st_size,
        'dimensions': list(im.size), 'mode': 'RGBA', 'pixelExactExport': True,
        'rgbaPixelSha256': hashlib.sha256(im.tobytes()).hexdigest(), 'alphaExtrema': list(alpha.getextrema()),
        'alphaBounds16': list(bounds), 'referenceUrls': [r['url'] for r in a['references']],
        'accepted': True, 'status': 'accepted_with_documented_limits', 'batchId': BATCH,
        'visualReview': 'docs/standalone/production-v17/independent-visual-review.json',
        'inGameChecked': False, 'fidelityOneToOneCertified': False})
    a['fidelityNotes'].extend(visual.get('limitations', []))
    if '-v2.' in master:
        a['generation']['attempts'] = 2
        a['generation']['correctionRecord'] = 'docs/standalone/production-v17/trophy-corrections.json'

catalogue_path = 'art/infernal-versus/production/reserve-assets.json'
catalogue = read(catalogue_path)
historical = [a for a in catalogue['assets'] if a.get('batchId') != BATCH]
assert len(historical) == 145
assert not set(a['id'] for a in historical).intersection(a['id'] for a in assets)
catalogue['assets'] = historical + assets
for batch in ['static-v16-2026-11-27', BATCH]:
    if batch not in catalogue['sourceBatches']: catalogue['sourceBatches'].append(batch)
write(catalogue_path, catalogue)

baseline = copy.deepcopy(prior['cumulativeCounts']); current = copy.deepcopy(baseline)
current['reserveGalleryEntries'] += len(assets)
counts = {'distinctDrawings': len(assets), 'newDrawings': len(assets), 'revisedDrawings': 0,
    'newGenerationThisTask': len(assets), 'generationAttemptsThisResume': sum(a['generation']['attempts'] for a in assets), 'generatorRefused': 0,
    'masterPng': len(assets), 'losslessWebp': len(assets), 'thumbnails': 0,
    'deliveredImageFiles': len(assets)*2, 'deliveredImageBytes': sum(a['masterBytes']+a['exportBytes'] for a in assets),
    'newStandaloneBases': 0, 'newCharacterBases': 0, 'newlyCoveredCatalogueIds': 0,
    'newPlayableKits': 0, 'newAnimationCycles': 0, 'newStaticCostumes': 0, 'newStages': 0,
    'newPortraits': 0, 'newNarrativeIncarnations': 0, 'newSceneryProps': 0, 'newReserveProps': len(assets),
    'newReserveProjectiles': 0, 'newReserveMachines': 0}
files = [{'path': a[k], 'sha256': a[k+'Sha256'], 'bytes': a[k+'Bytes']} for a in assets for k in ['master','export']]
source_files = list({r['path']: r for a in assets for r in a['sourceReferences']}.values())
qa = {'status': 'pending_runtime_validation', 'inGameChecked': False, 'galleryChecked': False,
      'runtimeReport': 'docs/standalone/production-v17/runtime-qa.json',
      'browserReport': 'docs/standalone/production-v17/browser-gallery-qa.json',
      'independentArtReview': 'docs/standalone/production-v17/independent-visual-review.json',
      'testsPassed': None, 'testSuites': None, 'managerBuild': 'pending', 'standaloneBuild': 'pending',
      'standardQaScriptPassed': False, 'referencedAssets': 746,
      'referencedAssetsBasis': '742 V16 paths preserved; 4 new gallery exports verified locally. Full build QA pending.',
      'checkedAssetIds': [], 'browserChecks': 0, 'screenshots': 0,
      'limitations': ['La vague ajoute des images de galerie, sans nouvelle mécanique ni animation.']}
register = {'schemaVersion': 1, 'edition': 'V17', 'date': '2026-11-27', 'status': 'awaiting_runtime_validation',
    'repository': 'darknigthmare/hellbound-hotel-manager', 'branch': 'feat/infernal-versus-assets-20261124', 'prNumber': 8,
    'baselineCommit': BASE, 'equivalentLocalBaselineCommit': BASE, 'baselineTree': '96f5ae4697132119a802a1b4b3df728d42766157',
    'baseline': baseline, 'counts': counts, 'cumulativeCounts': current, 'assets': assets,
    'files': files, 'sourceFiles': source_files, 'candidateStates': copy.deepcopy(prior['candidateStates']),
    'variantStates': copy.deepcopy(prior.get('variantStates', [])), 'remaining': copy.deepcopy(prior['remaining']),
    'inheritedGapsBasis': 'V16 candidate and no-retry ledger preserved; this prop wave closes no full-body character gap.',
    'qa': qa, 'fidelityOneToOneCertified': False}
register['discardedCandidateCount'] = 2
register['discardedCandidates'] = [{'id': a['id'], 'status': 'superseded_geometry_mismatch',
    'master': 'production/v17/props/masters/' + a['id'] + '.png',
    'reason': 'Incorrect plaque geometry; replaced by the separately reviewed v2, not counted as an extra delivered drawing.'}
    for a in assets if '-v2.' in a['master']]
write('docs/standalone/production-v17/delivery-register.json', register)
write('docs/standalone/production-v17/image-qa.json', {'edition': 'V17', 'status': 'passed', 'drawings': len(assets),
    'rgbaParity': True, 'nativeMastersPreserved': True, 'assets': [{k:a[k] for k in ['id','dimensions','masterSha256','exportSha256','rgbaPixelSha256','alphaExtrema','alphaBounds16']} for a in assets]})
print(json.dumps({'assets': len(assets), 'gallery': len(catalogue['assets']), 'imageBytes': counts['deliveredImageBytes'], 'state': register['status']}))
