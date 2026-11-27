"""Assemble V8 from accepted, independently reviewed native image outputs.

This script verifies files and decodes pixels. It does not create or edit artwork.
"""
import copy
import hashlib
import json
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
read = lambda path: json.loads((REPO / path).read_text())
digest = lambda path: hashlib.sha256((REPO / path).read_bytes()).hexdigest()
write = lambda path, value: (REPO / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

v7 = read('docs/standalone/production-v7/delivery-register.json')
hazbin = read('docs/standalone/production-v8/hazbin-generation.json')
helluva = read('docs/standalone/production-v8/helluva-delivery.json')
environment = read('docs/standalone/production-v8/environment-generation.json')
reviews = read('docs/standalone/production-v8/independent-visual-review.json')
review_by_id = {item['id']: item for item in reviews['assets']}

assets = []
for source in hazbin['assets'] + helluva['assets']:
    asset = copy.deepcopy(source)
    assert asset['accepted']
    asset['spoilerScope'] = asset.get('spoilerScope', asset.get('spoilerTier', asset['continuity']))
    asset['dimensions'] = asset.get('dimensions', [asset.get('width'), asset.get('height')])
    asset['eligibility'] = asset.get('eligibility', asset.get('gameplayEligibility'))
    asset['fidelityNotes'] = asset.get('fidelityNotes', asset.get('limits', []))
    asset['runtimeUsage'] = ('Tenue sélectionnable du combattant existant ; une image statique pendant toutes les actions.'
                             if asset['eligibility'] == 'wearable' else
                             'Archive visuelle dans la galerie ; incarnation distincte, aucun kit de combat ajouté.')
    assets.append(asset)

names = {
    'hellhound-adoption-s2-room': 'Refuge des hellhounds · Couloir',
    'ozzies-exterior-rope-barrier': 'Ozzie’s · Barrière de file',
    'hellhound-adoption-sign': 'Refuge · Enseigne d’adoption',
}
for source in environment['assets']:
    asset = {key: value for key, value in source.items() if key not in ['prompt', 'generatedSourcePath']}
    asset['name'] = names.get(asset['id'], asset['name'])
    asset['category'] = 'stage' if asset['kind'] == 'stage_background' else 'stage_layer'
    asset['accepted'] = True
    asset['spoilerScope'] = asset['continuity']
    asset['master'] = f"production/v8/environment/masters/{asset['id']}.png"
    asset['export'] = f"public/assets/production/v8/environment/{asset['id']}.webp"
    asset['referenceUrls'] = [item['url'] for item in asset['references']]
    asset['incarnation'] = ('Helluva Boss · Ozzie’s, saison 1, épisode 7 · extérieur du cabaret'
                            if asset['runtimeStageId'] == 'ozzies-exterior-s1' else
                            'Helluva Boss · Seeing Stars, saison 2, épisode 2 · refuge du flashback')
    asset['runtimeUsage'] = ('Arène sélectionnable, fond illustré.' if asset['category'] == 'stage' else
                             'Objet détouré intégré aux couches du décor et consultable dans la galerie.')
    asset['eligibility'] = 'stage' if asset['category'] == 'stage' else 'scenery'
    if asset['category'] == 'stage':
        asset['thumbnail'] = {'path': asset['export'].replace('-room.webp', '-thumb.webp')}
    assets.append(asset)

assert len({asset['id'] for asset in assets}) == len(assets)
image_files = []
for asset in assets:
    review = review_by_id[asset['id']]
    assert review.get('acceptedForIntegration'), f"Independent review is missing: {asset['id']}"
    assert review['masterSha256'] == digest(asset['master']), f"Reviewed pixels changed: {asset['id']}"
    asset['visualReview'] = copy.deepcopy(review)
    asset['fidelityOneToOneCertified'] = False
    asset['newAnimationCycles'] = 0
    with Image.open(REPO / asset['master']) as master, Image.open(REPO / asset['export']) as exported:
        assert master.size == exported.size
        assert master.convert('RGBA').tobytes() == exported.convert('RGBA').tobytes(), asset['id']
        asset['dimensions'] = list(master.size)
        asset['pixelExactExport'] = True
        if 'A' in master.getbands():
            asset['alphaExtrema'] = list(master.getchannel('A').getextrema())
            asset['visibleBBoxAlpha16'] = list(master.getchannel('A').point(lambda p: 255 if p > 16 else 0).getbbox())
    for field in ['master', 'export']:
        asset[field + 'Sha256'] = digest(asset[field])
        asset[field + 'Bytes'] = (REPO / asset[field]).stat().st_size
        image_files.append(asset[field])
    if 'thumbnail' in asset:
        thumb = asset['thumbnail']
        thumb['sha256'] = digest(thumb['path'])
        thumb['bytes'] = (REPO / thumb['path']).stat().st_size
        thumb['encoding'] = 'WebP quality 90, derived selector thumbnail; not a distinct drawing'
        with Image.open(REPO / thumb['path']) as image:
            thumb['dimensions'] = list(image.size)
        image_files.append(thumb['path'])

assert len({asset['masterSha256'] for asset in assets}) == len(assets)
baseline = copy.deepcopy(v7['cumulativeCounts'])
current = copy.deepcopy(baseline)
wearable = [asset for asset in assets if asset['eligibility'] == 'wearable']
stages = [asset for asset in assets if asset['category'] == 'stage']
current['reserveGalleryEntries'] += len(assets) - len(stages)
current['runtimeCostumeFamilies'] += len(wearable)
current['activeStages'] += len(stages)

remaining = copy.deepcopy(v7['remaining'])
missing_ids = {item['id'] for item in remaining['characterReferenceGaps']}
candidate_states = [item for item in hazbin['candidates'] if item.get('sourceIdentityId', item['id']) in missing_ids]
updates = {item.get('sourceIdentityId', item['id']): item for item in candidate_states}
for item in remaining['characterReferenceGaps']:
    if item['id'] in updates:
        item.update({key: value for key, value in updates[item['id']].items() if key in ['status', 'notes', 'referenceUrls']})
for candidate in hazbin['candidates']:
    if candidate not in candidate_states:
        remaining['environmentQualification'].append({**candidate, 'category': 'Variante'})
remaining['environmentQualification'].extend([
    {'id': item, 'category': 'Costume', 'status': 'not_delivered',
     'notes': 'Tentative conservée pour examen ; référence complète ou dessin conforme non qualifié. Non équipée et non comptée livrée.'}
    for item in helluva.get('pendingCandidates', [])
])
remaining['environmentQualification'].extend([
    {'id': item['id'], 'category': 'Costume', 'status': item['status'], 'notes': item['reason']}
    for item in helluva.get('heldCandidates', [])
])
remaining['limitations'] = [
    'Le catalogue inclut individus, groupes, pilote, AU et entrées futures ; 100 IDs restent sans base autonome, soit 99 identités après alias connu.',
    'Les nouvelles incarnations et tenues ne créent aucune nouvelle identité, base de personnage ou technique de combat.',
    'Chaque nouveau costume utilise une seule image statique ; aucun nouveau cycle animé.',
    'Les adaptations de composition et les limites des sources sont documentées ; fidélité 1:1 non certifiée.',
]
refused = [item for item in hazbin['attempts'] if item['status'] == 'refused']
remaining['refusedThisWave'] = [item['assetId'] for item in refused]
qa_path = HERE / 'validation.json'
qa = json.loads(qa_path.read_text()) if qa_path.exists() else {
    'status': 'pending_final_validation', 'inGameChecked': False,
    'browserStatus': 'Local browser installation blocked by HTTP 403; deployed preview review pending.',
}
remaining['runtimeValidationGaps'] = [] if qa.get('inGameChecked') else ['V8-browser-visual-review']

register = {
    'schemaVersion': 1, 'edition': 'V8', 'date': '2026-11-26',
    'status': 'final_production_register' if qa.get('status') == 'passed' and helluva['status'] != 'partial_delivery_in_progress' else 'delivery_in_progress',
    'repository': 'darknigthmare/hellbound-hotel-manager',
    'branch': 'feat/infernal-versus-assets-20261124', 'prNumber': 8,
    'baselineCommit': 'daae49839972f31a1d55cbbe2942c1b0c7abe304',
    'baseline': baseline,
    'counts': {
        'distinctDrawings': len(assets), 'newDrawings': len(assets), 'revisedDrawings': 0,
        'masterPng': len(assets), 'losslessWebp': len(assets), 'thumbnails': len(stages),
        'deliveredImageFiles': len(image_files),
        'deliveredImageBytes': sum((REPO / file).stat().st_size for file in image_files),
        'newCharacterBases': 0, 'newPlayableKits': 0,
        'newStaticCostumes': len(wearable),
        'newNarrativeIncarnations': sum(asset['eligibility'] == 'galleryOnly' for asset in assets),
        'newStages': len(stages), 'newSceneryProps': sum(asset['category'] == 'stage_layer' for asset in assets),
        'newAnimationCycles': 0, 'generatorRefused': len(refused),
        'historicalVariantRequirementsReconciled': 9,
    },
    'cumulativeCounts': current, 'assets': assets,
    'candidateStates': candidate_states,
    'variantStates': [{'id': 'VAR-013', 'status': 'prosthetic_incarnation_refused_no_retry',
                       'notes': 'Lute saison 2, bras prothétique : génération refusée, aucun nouveau dessin. La couverture historique partielle reste conservée.',
                       'referenceUrls': ['https://www.youtube.com/watch?v=5eZonu8XsEs']}],
    'stageReconciliation': [
        {'planId': stage_id, 'runtimeStageIds': [stage_id],
         'assetIds': [asset['id'] for asset in assets if asset.get('runtimeStageId') == stage_id],
         'currentStaticCoverage': note,
         'referenceUrls': [asset['referenceUrls'][-1] for asset in stages if asset['runtimeStageId'] == stage_id]}
        for stage_id, note in [
            ('ozzies-exterior-s1', 'Nouvelle arène extérieure : fond illustré, miniature et barrière séparée. Intérieur du cabaret distinct ; combat AU, musique existante réutilisée.'),
            ('hellhound-adoption-s2', 'Nouvelle arène du couloir vide du refuge : fond illustré, miniature, enseigne et dossier séparés. Aucun personnage ni événement de combat canonique ajouté.'),
        ]
    ],
    'attempts': hazbin['attempts'],
    'attemptRegisters': ['docs/standalone/production-v8/hazbin-generation.json', 'docs/standalone/production-v8/helluva-generation.json', 'docs/standalone/production-v8/environment-generation.json'],
    'remaining': remaining, 'qa': qa,
    'sourceFiles': [{'path': file, 'sha256': digest(file)} for file in [
        'docs/standalone/production-v8/hazbin-generation.json',
        'docs/standalone/production-v8/helluva-delivery.json',
        'docs/standalone/production-v8/environment-generation.json',
        'docs/standalone/production-v8/independent-visual-review.json',
    ]],
    'independentReview': 'docs/standalone/production-v8/independent-visual-review.json',
    'fidelityOneToOneCertified': False,
}
write('docs/standalone/production-v8/delivery-register.json', register)
print(json.dumps({'status': register['status'], 'counts': register['counts'], 'cumulativeCounts': current}, ensure_ascii=False))
