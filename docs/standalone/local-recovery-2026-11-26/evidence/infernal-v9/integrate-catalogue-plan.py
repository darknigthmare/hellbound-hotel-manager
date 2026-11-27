from pathlib import Path
from copy import deepcopy
from hashlib import sha256
import json

ROOT = Path('/workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager')
BASE = ROOT / 'docs/standalone/production-v9'
BATCH = 'static-v9-2026-11-26'
REGISTER = 'docs/standalone/production-v9/delivery-register.json'
REVIEW = 'docs/standalone/production-v9/independent-review-root.json'

def read(path):
    return json.loads((ROOT / path).read_text())

def unique(items):
    return list(dict.fromkeys(items))

gallery_path = ROOT / 'art/infernal-versus/production/reserve-assets.json'
plan_path = ROOT / 'docs/standalone/extension-plan.json'
gallery = json.loads(gallery_path.read_text())
plan = json.loads(plan_path.read_text())
old_gallery, old_plan = deepcopy(gallery), deepcopy(plan)
assert len(gallery['assets']) == 100
assert BATCH not in gallery['sourceBatches']
raw = read('docs/standalone/production-v9/root-generation.json')
qa = read('docs/standalone/production-v9/root-image-qa.json')
environment = read('docs/standalone/production-v9/environment-handoff.json')
review = {item['id']: item for item in read(REVIEW)['assets']}
metrics = {item['path']: item for item in qa['files']}
new_assets = []

for source in raw:
    item = deepcopy(source)
    item['export'] = item['runtime']
    master, export = metrics[item['master']], metrics[item['export']]
    assert export['pixelExactToMaster']
    item.update(masterSha256=master['sha256'], exportSha256=export['sha256'], dimensions=master['dimensions'], alphaBounds16=master['alphaBounds16'])
    item['kind'] = 'costume_base' if item['id'] == 'lute-post-finale-s1-ready' else item['kind']
    item['runtimeStatus'] = 'selectable_costume' if item['id'] == 'lute-post-finale-s1-ready' else 'reserve'
    new_assets.append(item)
new_assets.extend(deepcopy(item) for item in environment['assets'] if item['category'] == 'prop')

for source in new_assets:
    asset_id = source['id']
    prop = source.get('kind', source['category']) == 'prop'
    frame = source.get('frameCoverage', 'whole_object' if prop else 'full_body')
    notes = unique(source.get('fidelityNotes', []) + review[asset_id].get('limitations', []))
    if asset_id == 'bee-lounge-honeycomb-divider':
        notes = [
            'Métadonnées provisoires du master à six rangées ; correction native à huit rangées en cours avant validation finale.',
            'La source comporte 38 ouvertures : trois colonnes de huit grandes alvéoles et deux colonnes de sept interstices.',
            'Aucune fidélité 1:1 certifiée ; hashes et dimensions seront remplacés après revue du nouveau master.',
        ]
    role = ('Tenue sélectionnable de Lute existante ; une seule image statique pour cette incarnation S1, aucun nouveau kit.'
        if source['runtimeStatus'] == 'selectable_costume' else
        'Objet séparé intégré aux couches de bee-lounge-s1 et consultable dans la galerie.'
        if source['runtimeStatus'] == 'stage_scenery' else
        'Portrait narratif en buste ; aucune base de combat complète ni kit ajouté.'
        if frame == 'bust' else 'Accessoire statique de réserve ; aucune capacité ni utilisation en combat déduite.')
    entry = {
        'id': asset_id, 'name': source['name'], 'kind': source.get('kind', source['category']),
        'franchise': source['franchise'], 'sourceIdentityId': source.get('sourceIdentityId'),
        'spoilerScope': source['spoilerScope'], 'continuity': source['continuity'], 'frameCoverage': frame,
        'runtimeStatus': source['runtimeStatus'], 'master': source['master'], 'export': source['export'],
        'dimensions': source['dimensions'], 'alphaBounds16': source['alphaBounds16'],
        'masterSha256': source['masterSha256'], 'exportSha256': source['exportSha256'],
        'pixelExactExport': True, 'fidelityOneToOneCertified': False, 'inGameChecked': False,
        'batchId': BATCH, 'animationCycles': 0, 'addsStandaloneBase': False, 'newIdentity': False,
        'reference': source['name'], 'references': source['references'],
        'intendedRole': role, 'visualReview': REVIEW, 'fidelityNotes': notes,
        'reviewStatus': 'correction_pending' if asset_id == 'bee-lounge-honeycomb-divider' else 'independent_review_accepted',
    }
    if source['runtimeStatus'] == 'stage_scenery':
        entry['runtimeStageId'] = 'bee-lounge-s1'
    if asset_id == 'bee-lounge-honeycomb-divider':
        entry['provisionalMetadata'] = {'reason': 'pending_eight_row_native_correction', 'sourceMainRows': 8, 'sourceOpenings': 38}
    if frame == 'bust':
        entry['fullBodyBaseStillMissing'] = True
    for key in ('master', 'export'):
        assert (ROOT / entry[key]).is_file()
        assert sha256((ROOT / entry[key]).read_bytes()).hexdigest() == entry[key + 'Sha256']
    gallery['assets'].append(entry)
gallery['sourceBatches'].append(BATCH)
gallery['date'] = '2026-11-26'

def preserve(row):
    if 'coverageBeforeStaticV9' not in row:
        row['coverageBeforeStaticV9'] = deepcopy({k: v for k, v in row.items() if not k.startswith('coverageBefore')})

by_id = {item['id']: item for item in gallery['assets'] if item['batchId'] == BATCH}
def production(asset_id, **extra):
    item = by_id[asset_id]
    return dict(batchId=BATCH, assetId=asset_id, master=item['master'], export=item['export'],
        masterSha256=item['masterSha256'], exportSha256=item['exportSha256'],
        frameCoverage=item['frameCoverage'], runtimeStatus=item['runtimeStatus'],
        references=[ref['url'] for ref in item['references']], register=REGISTER,
        animationCycles=0, addsStandaloneBase=False, newIdentity=False, fidelityOneToOneCertified=False, **extra)

lute_note = 'La forme après le final S1 est maintenant illustrée par une pose entière statique sélectionnable, bras gauche absent et sans prothèse. La tenue pré-blessure et le défaut historiques restent distincts. Aucun cycle, nouveau kit ou nouvelle base d’identité compté ; l’incarnation S2 prothétique reste refusée en V8, sans relance.'
mother_note = 'Portrait avec rose livré jusqu’à la taille d’après un produit officiel. Le buste ne couvre ni jambes ni chaussures et ne comble pas la base entière manquante.'
for identity, asset_id, note, status in [
    ('lute', 'lute-post-finale-s1-ready', lute_note, 'accepted_static_s1_post_finale_incarnation'),
    ('hb_moxxies_mother', 'hb_moxxies_mother-portrait-s2', mother_note, 'accepted_bust_full_body_gap_remains'),
]:
    row = next(item for item in plan['roster'] if item['id'] == identity)
    preserve(row)
    row['qualificationV9'] = {'status': status, 'notes': note, 'assetId': asset_id, 'references': [ref['url'] for ref in by_id[asset_id]['references']], 'register': REGISTER}
    row['currentStaticCoverage'] = note
    if identity == 'lute':
        row.setdefault('staticIncarnations', []).append(production(asset_id, coverage='one_static_incarnation', runtimeSelectable=True, staticReadyOnly=True, defaultBaseUnchanged=True))
    else:
        row['staticProduction'] = production(asset_id, coverage='narrative_bust_only', runtimePlayable=False, fullBodyBaseStillMissing=True)

for attempt in read('docs/standalone/production-v9/refused-attempts.json'):
    row = next(item for item in plan['roster'] if item['id'] == attempt['sourceIdentityId'])
    preserve(row)
    row['qualificationV9'] = {'status': attempt['status'], 'notes': 'Génération native refusée ; aucun nouveau dessin ni fichier livré, aucune relance. La base entière reste manquante.', 'assetId': None, 'attemptId': attempt['id'], 'requestId': attempt['requestId'], 'register': REGISTER, 'attemptRegister': 'docs/standalone/production-v9/refused-attempts.json'}

variant = next(item for item in plan['variants'] if item['id'] == 'VAR-013')
preserve(variant)
variant['status'] = 'Partiel'
variant['currentStaticCoverage'] = lute_note
variant['qualificationV9'] = {'status': 'partial_static_s1_incarnation_delivered', 'notes': lute_note, 'assetId': 'lute-post-finale-s1-ready', 'references': [ref['url'] for ref in by_id['lute-post-finale-s1-ready']['references']], 'register': REGISTER}
variant['staticProduction'] = production('lute-post-finale-s1-ready', coverage='one_static_incarnation', runtimeSelectable=True, gameplayEligibility='wearable', staticReadyOnly=True, defaultBaseUnchanged=True)
variant['acceptanceV9'] = 'Le READY S1 après final est sélectionnable. Les six images historiques pré-blessure sont conservées ; aucun cycle de cette nouvelle incarnation, transition chronologique ou prothèse S2 n’est livré. Contrôle visuel en jeu à documenter séparément.'

task = next(item for item in plan['tasks'] if item['id'] == 'LOR-10')
preserve(task)
task['staticProductionV9'] = production('stolas-grimoire-closed', coverage='closed_prop_only', runtimePlayable=False)
task['currentStaticCoverage'] = 'Grimoire fermé livré comme accessoire de réserve. Conditions d’accès, ouverture, portails et attribution par incarnation restent à vérifier ; aucun pouvoir implémenté par ce dessin.'

assert not any(item['id'] == 'bee-lounge-s1' for item in plan['stages'])
plan['stages'].append({
    'id': 'bee-lounge-s1', 'name': 'Beelzebub — salon du bar', 'franchise': 'Helluva Boss',
    'place': 'Gluttony — salon latéral', 'continuity': 'season_1', 'priority': 'P2', 'lot': 'V3',
    'source': 'SRC-V9-BEE-LOUNGE', 'reference': 'https://backgroundart.net/art/helluva05.jpg',
    'design': 'Salon latéral documenté : bar courbe, banquette turquoise, plafond alvéolé et tapis. Sol avant dégagé ; tabouret et cloison droite séparés.',
    'registryNote': 'Nouvelle arène du salon latéral, distincte de bee-party qui reste la grande salle de réception. Aucun alias ni remplacement de bee-party.',
    'createdByStaticV9': True, 'status': 'Partiel', 'runtimeId': 'bee-lounge-s1', 'runtimeStageId': 'bee-lounge-s1', 'runtimeStageIds': ['bee-lounge-s1'],
    'asset': 'public/assets/production/v9/environment/bee-lounge-s1-room.webp',
    'currentStaticCoverage': 'Fond et miniature du salon, tabouret et cloison droite isolés. Décor statique de simulation AU ; correction finale de la cloison en cours.',
    'acceptance': 'Recadrage, échelle des objets, maintien de la cloison sur son mur, contraste des combattants et performance mobile à valider en jeu. Fidélité 1:1 non certifiée.',
    'staticProduction': {'batchId': BATCH, 'assetIds': ['bee-lounge-s1-room', 'bee-lounge-bar-stool', 'bee-lounge-honeycomb-divider'], 'runtimeStageIds': ['bee-lounge-s1'], 'register': REGISTER, 'references': ['https://backgroundart.net/helluvaboss.html', 'https://backgroundart.net/art/helluva05.jpg'], 'animationCycles': 0, 'fidelityOneToOneCertified': False, 'productionStatus': 'pending_divider_revision'},
})

sources = [
    ['SRC-STATIC-V9', 'Dépôt / production', 'Production statique V9', '2026-11-26', 'Sept dessins statiques, cadrages, limites et refus ; aucune nouvelle base ni animation.', REGISTER],
    ['SRC-V9-GRIMOIRE', 'Produit officiel sous licence', 'Stolas Grimoire Sticker Book — Spindlehorse', '2026-11-26', 'Motifs de couverture uniquement ; reliure du livre de jeu adaptée.', 'https://sharkrobot.com/products/stolas-grimoire-sticker-book'],
    ['SRC-V9-MOTHER', 'Produit officiel sous licence', "Exes and Oohs Moxxie's Mom Enamel Pin — Spindlehorse", '2026-11-26', 'Portrait avec rose ; aucune preuve des jambes ou des chaussures.', 'https://sharkrobot.com/products/exes-and-oohs-moxxies-mom-enamel-pin'],
    ['SRC-V9-LUTE', 'Extrait officiel', 'Prime Video Brasil — Lute après final S1', '2026-11-26', 'Cellules natives de prévisualisation 320×180 ; forme entière S1, aucune prothèse S2.', 'https://www.youtube.com/watch?v=q9lzr9zsUT4'],
    ['SRC-V9-THING', 'Produit officiel sous licence', 'Loo Loo Land Thing Plush Acrylic Keychain — Spindlehorse', '2026-11-26', 'Objet peluche isolé ; contour de porte-clés retiré.', 'https://sharkrobot.com/products/loo-loo-land-thing-plush-acrylic-keychain'],
    ['SRC-V9-BEE-LOUNGE', 'Portfolio de production', 'Greg Bartlett — salon de Beelzebub', '2026-11-26', 'Layout et peinture de production, salon latéral distinct de la grande salle ; https://backgroundart.net/helluvaboss.html.', 'https://backgroundart.net/art/helluva05.jpg'],
]
assert not set(item[0] for item in sources) & set(item[0] for item in plan['sources'])
plan['sources'].extend(sources)

meta = plan['meta']
meta.setdefault('runtimeHistory', []).append(deepcopy(meta['currentRuntime']))
meta.setdefault('staticDeliveryHistory', []).append(deepcopy(meta['latestStaticDelivery']))
meta['currentRuntime'].update(date='2026-11-26', batchId=BATCH, baseCommit='751432195e2e618f2a617ae2c58595a5a0b5b47a', fighters=43, runtimeKits=43,
    stages=43, threePlaneStages=35, twoPlaneStages=1, onePlaneStages=7, reserveGalleryDrawings=106, costumeFamilies=21,
    standaloneBases=109, catalogueIdsWithoutStandaloneBase=100, distinctProductionIdentitiesWithoutStandaloneBase=99,
    referencedAssets=None, referencedAssetsStatus='awaiting_final_v9_runtime_path_audit', productionRegister=REGISTER,
    note='V9 ajoute une incarnation S1 de Lute, un buste narratif, quatre accessoires et un salon distinct. Les 43 kits et 109 bases restent inchangés ; aucun nouveau cycle animé. Revue finale de la cloison et validation en jeu documentées séparément.')
meta['latestStaticDelivery'] = {'date': '2026-11-26', 'batchId': BATCH, 'baseCommit': '751432195e2e618f2a617ae2c58595a5a0b5b47a', 'branch': 'feat/infernal-versus-assets-20261124', 'prNumber': 8,
    'register': REGISTER, 'status': 'integration_pending_final_register', 'counts': {'distinctDrawings': 7, 'newDrawings': 7, 'revisedDrawings': 0, 'masterPng': 7, 'losslessWebp': 7, 'thumbnails': 1, 'deliveredImageFiles': 15, 'newStandaloneBases': 0, 'newCharacterBases': 0, 'newPlayableKits': 0, 'newStaticCostumes': 1, 'newNarrativeIncarnations': 1, 'newStages': 1, 'newSceneryProps': 2, 'newReserveProps': 2, 'newAnimationCycles': 0, 'generatorRefused': 2},
    'scope': 'Sept dessins statiques et intégration V9. La cloison attend sa correction finale ; aucun nouveau cycle, kit ou base entière.', 'pendingAssetIds': ['bee-lounge-honeycomb-divider']}
meta['pendingProductionBible'] = {'edition': 'V9', 'workbook': 'docs/standalone/INFERNAL_VERSUS_BIBLE_V9.xlsx', 'previousWorkbook': 'docs/standalone/INFERNAL_VERSUS_BIBLE_V8.xlsx', 'historicalSheetsPreserved': 48, 'appendedSheets': 2, 'expectedFinalSheets': 50, 'status': 'awaiting_final_register_and_export', 'register': REGISTER}

assert gallery['assets'][:100] == old_gallery['assets']
assert len(gallery['assets']) == 106
assert len({item['id'] for item in gallery['assets']}) == 106
assert gallery['sourceBatches'][:-1] == old_gallery['sourceBatches']
assert plan['stages'][:-1] == old_plan['stages']
assert plan['sources'][:-len(sources)] == old_plan['sources']
assert plan['productionBible'] == old_plan['productionBible']
assert plan['meta']['runtimeHistory'][:-1] == old_plan['meta']['runtimeHistory']
for key, changed in [('roster', {'lute', 'hb_moxxies_mother', 'hb_leviathan', 'hb_belphegor'}), ('variants', {'VAR-013'}), ('tasks', {'LOR-10'})]:
    for before, after in zip(old_plan[key], plan[key]):
        if before['id'] not in changed:
            assert before == after, (key, before['id'])
        else:
            for prop in ('qualificationV7', 'qualificationV8'):
                if prop in before:
                    assert after[prop] == before[prop]
for key in ('parity', 'techniques', 'campaigns', 'qa', 'kits'):
    assert plan[key] == old_plan[key]

gallery_path.write_text(json.dumps(gallery, ensure_ascii=False, indent=2) + '\n')
plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n')
report = {'status': 'catalogue_and_plan_integrated_pending_final_divider_and_register', 'galleryCount': 106, 'newGalleryIds': list(by_id), 'historicalGalleryEntriesPreserved': 100,
    'historicalPlanStagesPreserved': len(old_plan['stages']), 'historicalPlanVariantsPreserved': len(old_plan['variants']), 'newStage': 'bee-lounge-s1', 'variantStillPartial': 'VAR-013',
    'runtimeCounts': {'fighters': 43, 'standaloneBases': 109, 'gallery': 106, 'costumeFamilies': 21, 'stages': 43, 'stagePlanes': {'one': 7, 'two': 1, 'three': 35}},
    'pending': ['divider final metadata', 'runtime referenced paths recount', 'final delivery register', 'workbook V9 export'], 'modifiedFiles': [str(gallery_path.relative_to(ROOT)), str(plan_path.relative_to(ROOT))]}
(Path('/tmp/infernal-v9') / 'catalogue-plan-qa.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False, indent=2))
