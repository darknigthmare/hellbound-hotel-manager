"""Assemble V16 from immutable V15 and portrait inputs.

The default prepares only the delivery register. --write-plan explicitly opts
into updating extension-plan.json from the pinned V15 baseline. --final requires
current runtime, browser and independent visual evidence plus the published
baseline SHA. Handoffs, historical editions and runtime files are never written.
"""
import argparse
import copy
import hashlib
import json
import re
import subprocess
import zipfile
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
LOCAL_BASE = 'eca07c70d20fc1f03e52d84b97b45050f0c82308'
BASE_TREE = '4c5c4fbf079836bb0551a0357822f70ebe34b463'
PUBLISHED_BASE = '68007b81bce0307a9c54cb3e42ef8bdf231087d6'
BATCH = 'static-v16-2026-11-27'
PREFIX = 'docs/standalone/production-v16/'
REGISTER = PREFIX + 'delivery-register.json'
PLAN = 'docs/standalone/extension-plan.json'
GALLERY = 'art/infernal-versus/production/reserve-assets.json'
PREVIOUS_REGISTER = 'docs/standalone/production-v15/delivery-register.json'
TARGET_IDS = {'hb_gerald-barbie-bad-day-portrait', 'hb_rick-barbie-bad-day-portrait'}
EXPECTED_BASELINE = {
    'catalogueIds': 209, 'distinctProductionIdentitiesAfterKnownAlias': 208,
    'activeFighters': 43, 'standaloneBases': 115, 'activeStandaloneBases': 40,
    'reserveStandaloneBases': 75, 'catalogueIdsWithoutStandaloneBase': 94,
    'distinctProductionIdentitiesWithoutStandaloneBase': 93,
    'reserveGalleryEntries': 143, 'runtimeCostumeFamilies': 27, 'activeStages': 51,
    'illustratedPersonalScenes': 127, 'personalScenes': 129,
    'illustratedGlobalScenes': 11, 'globalScenesIncludingBookends': 11,
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def local(path):
    resolved = (ROOT / path).resolve()
    require(resolved.is_relative_to(ROOT), f'Path outside repository: {path}')
    return resolved


def read(path):
    return json.loads(local(path).read_text())


def digest(path):
    return hashlib.sha256(local(path).read_bytes()).hexdigest()


def serialized(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


def write(path, value):
    local(path).write_text(serialized(value))


def baseline(path):
    return json.loads(subprocess.check_output(['git', 'show', f'{LOCAL_BASE}:{path}'], cwd=ROOT))


def file_record(path):
    return {'path': path, 'sha256': digest(path), 'bytes': local(path).stat().st_size}


def verify_reference(row):
    require(digest(row['path']) == row['sha256'], f'Input hash changed: {row["path"]}')


def stable_reference_paths():
    catalogue = read(PREFIX + 'characters-references.json')
    evidence = list(catalogue['references']) + list(catalogue['sourceBoards'])
    evidence.extend(catalogue['source'][key] for key in ['metadata', 'additionalMetadata', 'publicationEvidence'])
    image_qa = read(PREFIX + 'image-qa.json')
    evidence.extend(row['nativeAlphaDiagnostic'] for row in image_qa['assets'])
    for row in evidence:
        verify_reference(row)
    return {row['path'] for row in evidence}


def validate_baseline(remote_commit, final=False):
    tree = subprocess.check_output(['git', 'rev-parse', LOCAL_BASE + '^{tree}'], cwd=ROOT, text=True).strip()
    require(tree == BASE_TREE, 'Pinned local V15 tree does not match')
    if remote_commit:
        require(re.fullmatch(r'[0-9a-f]{40}', remote_commit) is not None, 'Expected a full Git commit SHA')
        require(remote_commit == PUBLISHED_BASE, 'Published V15 baseline SHA does not match the verified publication')
    if final:
        require(remote_commit == PUBLISHED_BASE, '--final requires --baseline-commit with the published V15 SHA')


def inputs():
    previous = baseline(PREVIOUS_REGISTER)
    require(previous['status'] == 'final_production_register', 'V15 baseline register is not final')
    require(previous['cumulativeCounts'] == EXPECTED_BASELINE, 'Unexpected V15 cumulative counts')
    integration = read(PREFIX + 'integration-assets.json')
    verify_reference(integration['sourceHandoff'])
    verify_reference(integration['independentReview'])
    verify_reference(integration['publicationEvidence'])
    handoff = read(integration['sourceHandoff']['path'])
    assets = copy.deepcopy(integration['assets'])
    require(len(assets) == 2 and {a['id'] for a in assets} == TARGET_IDS, 'V16 must contain exactly Gerald and Rick portraits')
    require(len({a['masterSha256'] for a in assets}) == 2, 'Portrait masters must be distinct')
    old_gallery = baseline(GALLERY)
    gallery = read(GALLERY)
    old_ids = {a['id'] for a in old_gallery['assets']}
    require(len(old_ids) == 143 and len(gallery['assets']) == 145, 'Gallery count mismatch')
    require(len({a['id'] for a in gallery['assets']}) == 145, 'Duplicate gallery IDs')
    require([a for a in gallery['assets'] if a['id'] in old_ids] == old_gallery['assets'], 'Historical gallery objects changed')
    require({a['id'] for a in gallery['assets']} - old_ids == TARGET_IDS, 'Unexpected gallery additions')
    source_assets = {a['id']: a for a in handoff['assets']}
    gallery_assets = {a['id']: a for a in gallery['assets']}
    files = []
    for asset in assets:
        source = source_assets[asset['id']]
        require(asset['accepted'] and asset['fidelityOneToOneCertified'] is False, 'Unsupported art acceptance claim')
        require(asset['addsStandaloneBase'] is False and asset['frameCoverage'] == 'bust', 'Portrait cannot close a full-base gap')
        require(asset['kind'] == 'narrative_archive' and asset['subtype'] == 'character_portrait', 'Unexpected portrait category')
        require(asset['newAnimationCycles'] == asset['newPlayableKits'] == 0, 'Unexpected gameplay additions')
        require(asset['continuity'] == 'official_short_2026' and asset['publicationDate'] == '2026-04-25', 'Short chronology mismatch')
        require(asset['runtimeStatus'] == 'reserve', 'Expected static reserve gallery use')
        require(asset['export'].startswith('public/assets/production/v16/characters/'), 'Final export must be under public')
        for field in ['master', 'export']:
            row = file_record(asset[field])
            require(row['sha256'] == asset[field + 'Sha256'] == source[field + 'Sha256'], f'{field} bytes changed')
            require(row['bytes'] == asset[field + 'Bytes'], f'{field} byte count mismatch')
            files.append(row)
        ga = gallery_assets[asset['id']]
        require(ga['export'] == asset['export'] and ga['exportSha256'] == asset['exportSha256'], 'Gallery export mismatch')
        require(ga['addsStandaloneBase'] is False, 'Gallery must not count portrait as full base')
        with Image.open(local(asset['master'])) as master, Image.open(local(asset['export'])) as export:
            require(master.size == export.size == tuple(asset['dimensions']), 'Image dimensions changed')
            require(master.convert('RGBA').tobytes() == export.convert('RGBA').tobytes(), 'Lossless export is not pixel exact')
        for source_ref in asset['sourceReferences']:
            verify_reference(source_ref)
        verify_reference(asset['publicationEvidence'])
        asset['inGameChecked'] = False
        asset['galleryChecked'] = False
        asset['combatPlayChecked'] = False
    require(len(files) == 4 and sum(f['bytes'] for f in files) == 2474716, 'Expected four delivered image files totalling 2,474,716 bytes')
    require(handoff['counts']['deliveredImageBytes'] == 2474716, 'Handoff image byte count differs')
    return previous, integration, handoff, assets, files


def final_evidence(assets):
    technical = read(PREFIX + 'runtime-qa.json')
    browser = read(PREFIX + 'browser-gallery-qa.json')
    coverage = read(PREFIX + 'active-asset-coverage.json')
    review = read(PREFIX + 'independent-visual-review.json')
    visual = read(PREFIX + 'browser-visual-review.json')
    require(technical['status'] == browser['status'] == 'passed', 'Current runtime and browser QA must pass')
    require(technical.get('exitCode') == 0 and technical.get('standardQaScriptPassed') is True, 'Full standard QA was not completed')
    require(technical.get('managerBuild') == technical.get('standaloneBuild') == 'passed', 'Both builds must pass')
    require(technical['runtimeInputFilesBefore'] == technical['runtimeInputFilesAfter'], 'Runtime inputs changed during QA')
    require(bool(technical['runtimeInputFilesAfter']), 'Runtime input snapshot is empty')
    for row in technical['runtimeInputFilesAfter']:
        verify_reference(row)
    if technical.get('log') and technical.get('logSha256'):
        require(digest(technical['log']) == technical['logSha256'], 'Runtime QA log changed')
    summary = coverage['summary']
    require(not summary['brokenReferences'], 'Broken runtime asset references')
    for key, expected in [('fighters', 43), ('costumes', 27), ('stages', 51), ('reserveGalleryEntries', 145)]:
        require(summary[key] == expected, f'Runtime coverage mismatch: {key}')
    require(not browser['consoleErrors'] and not browser['pageErrors'], 'Browser reports errors')
    require(bool(browser['sourceHashes']), 'Browser source snapshot missing')
    for path, sha in browser['sourceHashes'].items():
        require(digest(path) == sha, f'Browser source changed: {path}')
    require(all(c.get('passed') is True for c in browser['checks']), 'A browser check failed')
    require(len(browser['screenshots']) == 4, 'Exactly four V16 viewport screenshots are required')
    shot_pairs = {(s['assetId'], s['viewport']) for s in browser['screenshots']}
    expected_pairs = {(a['id'], v) for a in assets for v in ['desktop', 'mobile']}
    require(shot_pairs == expected_pairs, 'Missing portrait viewport screenshot')
    for shot in browser['screenshots']:
        verify_reference(shot)
    require(review['status'] == 'accepted_with_documented_limits', 'Independent portrait review is not accepted')
    require(review['summary']['acceptedDrawings'] == 2 and review['summary']['rejectedDrawings'] == 0, 'Independent portrait review count mismatch')
    reviewed = {r['id']: r for r in review['assets']}
    require(visual['status'] in ['passed', 'accepted', 'accepted_with_documented_limits'], 'Independent gallery visual review is not accepted')
    verify_reference(visual['browserReport'])
    require(visual['browserReport']['path'] == PREFIX + 'browser-gallery-qa.json', 'Visual review cites another browser report')
    require(len(visual['screenshots']) == 4, 'Four independently viewed screenshots required')
    visual_shots = {s['path']: s for s in visual['screenshots']}
    for shot in browser['screenshots']:
        require(shot['path'] in visual_shots and visual_shots[shot['path']]['reviewed'] is True, 'Screenshot lacks independent visual review')
        require(visual_shots[shot['path']]['sha256'] == shot['sha256'], 'Visual screenshot hash mismatch')
    for asset in assets:
        ar = reviewed[asset['id']]
        require(ar['acceptedForIntegration'] is True and not ar['correctionRequired'], 'Portrait art still requires correction')
        require(ar['masterSha256'] == asset['masterSha256'] and ar['exportSha256'] == asset['exportSha256'], 'Independent art review is stale')
        checks = [c for c in browser['checks'] if c.get('assetId') == asset['id']]
        require(len(checks) == 2 and {c['viewport'] for c in checks} == {'desktop', 'mobile'}, 'Both portrait viewport checks are required')
        for check in checks:
            require(check['decodedImage']['entireImageVisible'] is True, 'Portrait is not completely visible')
            require(check['masterSha256'] == asset['masterSha256'] and check['exportSha256'] == asset['exportSha256'], 'Browser image hash mismatch')
        asset.update(inGameChecked=True, galleryChecked=True, combatPlayChecked=False,
                     browserReview=PREFIX + 'browser-gallery-qa.json',
                     independentReview=PREFIX + 'independent-visual-review.json',
                     galleryVisualReview=PREFIX + 'browser-visual-review.json')
    return technical, browser, coverage


def assemble(args):
    previous, integration, handoff, assets, files = inputs()
    old_plan = baseline(PLAN)
    counts = {
        **handoff['counts'], 'newDrawings': len(assets), 'revisedDrawings': 0,
        'thumbnails': 0, 'newCharacterBases': 0, 'newStaticCostumes': 0,
        'newStages': 0, 'newPortraits': len(assets), 'newNarrativeIncarnations': 0,
        'narrativeSilhouettes': 0, 'newSceneryProps': 0, 'newReserveProps': 0,
        'newReserveProjectiles': 0, 'newReserveMachines': 0,
        'generatorRefused': len(handoff['refused']), 'generationAttemptsThisResume': 2,
    }
    cumulative = copy.deepcopy(previous['cumulativeCounts'])
    cumulative['reserveGalleryEntries'] += len(assets)
    remaining = copy.deepcopy(previous['remaining'])
    require(len(remaining['characterReferenceGaps']) == 94, 'Expected 94 remaining catalogue ID gaps')
    gap_ids = {r['id'] for r in remaining['characterReferenceGaps']}
    require({'hb_gerald', 'hb_rick'}.issubset(gap_ids), 'Both full-base gaps must remain')
    remaining.update(inheritedFrom=PREVIOUS_REGISTER,
                     inheritedRefusedV15=copy.deepcopy(previous['remaining']['refusedThisWave']),
                     refusedThisWave=copy.deepcopy(handoff['refused']),
                     resolvedFullBodyIdentitiesV16=[],
                     noRetryTargetIdsV16=sorted(set(remaining['noRetryTargetIdsV15']) | set(handoff['noRetryTargetIdsAdded'])))
    remaining['v16PartialCharacterCoverage'] = [
        {'id': a['sourceIdentityId'], 'assetId': a['id'], 'frameCoverage': 'bust',
         'status': 'narrative_archive_full_detailed_base_still_missing'} for a in assets
    ]
    remaining['limitations'] = list(dict.fromkeys(remaining['limitations'] + [
        'Gerald et Rick V16 sont deux portraits du court Barbie’s Bad Day ; les deux bases entières restent manquantes.',
        'Le court officiel est daté du 25 avril 2026 par son microformat YouTube. Les références visuelles sont des previews de 320 × 180 pixels.',
    ]))
    reconciliation = copy.deepcopy(previous['baseCoverageReconciliation'])
    reconciliation['historicalRegisterEditions'] = list(dict.fromkeys(reconciliation['historicalRegisterEditions'] + ['V15']))
    reconciliation['coveredProductionIdentitiesBefore'] = copy.deepcopy(reconciliation['coveredProductionIdentitiesAfter'])
    reconciliation['newlyCoveredCatalogueIds'] = []
    reconciliation['newStandaloneBaseIdentities'] = []
    qa = {'status': 'pending', 'inGameChecked': False, 'galleryChecked': False,
          'runtimeReport': PREFIX + 'runtime-qa.json', 'browserReport': PREFIX + 'browser-gallery-qa.json',
          'activeAssetCoverage': PREFIX + 'active-asset-coverage.json',
          'independentArtReview': PREFIX + 'independent-visual-review.json',
          'independentGalleryReview': PREFIX + 'browser-visual-review.json'}
    if args.final:
        technical, browser, coverage = final_evidence(assets)
        qa.update(status='passed', inGameChecked=True, galleryChecked=True,
                  testsPassed=technical['testsPassed'], testSuites=technical['testSuites'],
                  managerBuild='passed', standaloneBuild='passed', standardQaScriptPassed=True,
                  referencedAssets=coverage['summary']['referencedAssets'],
                  checkedAssetIds=[a['id'] for a in assets], browserScope=browser['scope'],
                  browserChecks=len(browser['checks']), screenshots=4,
                  limitations=['Galerie statique dans Chromium local et mobile tactile émulé ; aucun appareil physique testé.',
                               'Les portraits n’ajoutent aucun combattant jouable, animation ou modèle entier.'])
    source_paths = {s['path'] for a in assets for s in a['sourceReferences']}
    source_paths.update(stable_reference_paths())
    source_paths.add(integration['publicationEvidence']['path'])
    source_paths.update(PREFIX + n for n in [
        'assemble-register.py', 'integration-assets.json', 'characters-handoff.json',
        'characters-references.json', 'characters-prompts.json', 'image-qa.json', 'independent-visual-review.json',
    ])
    if args.final:
        source_paths.update(PREFIX + n for n in [
            'runtime-qa.json', 'browser-gallery-qa.json', 'active-asset-coverage.json', 'browser-visual-review.json',
        ])
        source_paths.update(s['path'] for s in read(PREFIX + 'browser-gallery-qa.json')['screenshots'])
    register = {
        'schemaVersion': 1, 'edition': 'V16', 'date': '2026-11-27',
        'status': 'final_production_register' if args.final else 'prepared_register_qa_pending',
        'repository': 'darknigthmare/hellbound-hotel-manager', 'branch': 'feat/infernal-versus-assets-20261124', 'prNumber': 8,
        'baselineCommit': args.baseline_commit, 'equivalentLocalBaselineCommit': LOCAL_BASE, 'baselineTree': BASE_TREE,
        'baselinePublicationStatus': 'published_on_existing_pr_8' if args.baseline_commit else 'published_sha_not_supplied',
        'baseline': previous['cumulativeCounts'], 'counts': counts, 'cumulativeCounts': cumulative,
        'baseCoverageReconciliation': reconciliation, 'assets': assets, 'files': files,
        'candidateStates': [], 'variantStates': [], 'remaining': remaining, 'qa': qa,
        'sourceFiles': [file_record(p) for p in sorted(source_paths)],
        'publicationEvidence': integration['publicationEvidence'],
        'independentReview': PREFIX + 'independent-visual-review.json',
        'cataloguePlanChecks': {'historicalGalleryEntriesPreserved': 143, 'galleryEntries': 145,
                                'historicalRosterRows': 209, 'newStandaloneBases': 0,
                                'missingCatalogueIds': 94, 'missingDistinctIdentities': 93,
                                'deletedHistoricalFiles': 0},
        'fidelityOneToOneCertified': False,
    }
    plan = copy.deepcopy(old_plan)
    for key, history in [('currentRuntime', 'runtimeHistory'), ('latestStaticDelivery', 'staticDeliveryHistory')]:
        plan['meta'][history] = copy.deepcopy(old_plan['meta'].get(history, [])) + [copy.deepcopy(old_plan['meta'][key])]
    plan['meta']['currentRuntime'].update(
        date='2026-11-27', batchId=BATCH, baseCommit=args.baseline_commit,
        note='V16 : portraits de Gerald et Rick, issus du court Barbie’s Bad Day. Deux bustes de galerie ; aucune base entière, aucun kit ou cycle animé supplémentaire.',
        reserveGalleryDrawings=145, standaloneBases=115, catalogueIdsWithoutStandaloneBase=94,
        distinctProductionIdentitiesWithoutStandaloneBase=93, productionRegister=REGISTER,
        assetCoverageReport=qa['activeAssetCoverage'], referencedAssets=qa.get('referencedAssets'),
        referencedAssetsStatus='verified_current_v16_paths' if args.final else 'awaiting_current_v16_audit',
        technicalReview={k: qa.get(k) for k in ['status', 'testsPassed', 'testSuites', 'managerBuild', 'standaloneBuild', 'standardQaScriptPassed']},
        browserReview={'status': qa['status'], 'report': qa['browserReport'], 'scope': qa.get('browserScope'), 'checkedAssetIds': qa.get('checkedAssetIds', [])})
    plan['meta']['latestStaticDelivery'] = {
        'date': '2026-11-27', 'batchId': BATCH, 'baseCommit': args.baseline_commit,
        'branch': register['branch'], 'prNumber': 8, 'register': REGISTER,
        'counts': counts, 'cumulativeCounts': cumulative, 'verification': qa,
    }
    plan['meta']['pendingProductionBible'] = {
        'edition': 'V16', 'workbook': 'docs/standalone/INFERNAL_VERSUS_BIBLE_V16.xlsx',
        'preserveHistoricalSheets': 68, 'preserveHistoricalTables': 77, 'appendSheets': 2,
    }
    for asset in assets:
        row = next(r for r in plan['roster'] if r['id'] == asset['sourceIdentityId'])
        row['productionV16'] = {
            'assetId': asset['id'], 'export': asset['export'], 'register': REGISTER,
            'continuity': asset['continuity'], 'publicationDate': asset['publicationDate'],
            'publicationEvidence': asset['publicationEvidence'], 'frameCoverage': 'bust',
            'addsStandaloneBase': False, 'status': 'verified_gallery_static' if args.final else 'prepared_gallery_static',
            'reference': asset['reference'], 'fullDetailedCombatModelStillMissing': True,
        }
    require(len(plan['roster']) == 209 and plan['productionBible'] == old_plan['productionBible'], 'Historical bible or roster changed unexpectedly')
    require(plan['meta'].get('latestIntegration') == old_plan['meta'].get('latestIntegration'), 'Guide extension integration history changed')
    for old, new in zip(old_plan['roster'], plan['roster']):
        stripped = {k: v for k, v in new.items() if k != 'productionV16'}
        require(stripped == old, f'Historical roster row changed: {old["id"]}')
    # Idempotent final reruns preserve an already verified V16 workbook annotation.
    existing = read(PLAN)
    if args.final and existing['meta'].get('latestProductionBible', {}).get('edition') == 'V16':
        workbook_qa = read(PREFIX + 'workbook-qa.json')
        require(workbook_qa['registerSha256'] == hashlib.sha256(serialized(register).encode()).hexdigest(), 'Verified workbook belongs to a different final register')
        for key in ['latestProductionBible', 'productionBibleHistory']:
            plan['meta'][key] = copy.deepcopy(existing['meta'][key])
        plan['meta'].pop('pendingProductionBible', None)
    return register, plan


def workbook_metadata(args):
    require(args.write_plan, '--workbook-metadata requires --write-plan')
    register = read(REGISTER)
    require(register['status'] == 'final_production_register', 'Workbook metadata requires final register')
    require(register['baselineCommit'] == PUBLISHED_BASE, 'Final register lacks published V15 baseline')
    qa = read(PREFIX + 'workbook-qa.json')
    package = qa['packaging']
    workbook = 'docs/standalone/INFERNAL_VERSUS_BIBLE_V16.xlsx'
    require(qa['registerSha256'] == digest(REGISTER), 'Workbook was built against another register')
    require(qa['visualReview'] in ['passed', 'passed_with_documented_limits'], 'Workbook visual review has not passed')
    require(package['finalSheetCount'] == 70, 'Expected 70 workbook sheets')
    require(package['preservedWorksheetXmlParts'] == 68 and package['preservedTableXmlParts'] == 77, 'Historical workbook parts not preserved')
    require(package['originalPartsChangedUnexpectedly'] == [], 'Historical workbook parts were changed')
    require(package['outputSha256'] == digest(workbook), 'Workbook hash differs from checked output')
    with zipfile.ZipFile(local(workbook)) as archive:
        names = archive.namelist()
        require(sum(bool(re.fullmatch(r'xl/worksheets/sheet\d+\.xml', n)) for n in names) == 70, 'OOXML worksheet count mismatch')
        require(sum(bool(re.fullmatch(r'xl/tables/table\d+\.xml', n)) for n in names) == 79, 'OOXML table count mismatch')
    old = baseline(PLAN)['meta']['latestProductionBible']
    require(old['edition'] == 'V15' and old['finalSheets'] == 68 and old['finalTables'] == 77, 'Wrong workbook baseline')
    plan = read(PLAN)
    require(plan['meta']['latestStaticDelivery']['batchId'] == BATCH, 'Plan has not been updated to V16')
    plan['meta']['productionBibleHistory'] = baseline(PLAN)['meta'].get('productionBibleHistory', []) + [old]
    plan['meta']['latestProductionBible'] = {
        'edition': 'V16', 'date': '2026-11-27', 'workbook': workbook, 'previousWorkbook': old['workbook'],
        'historicalSheetsPreserved': 68, 'historicalTablesPreserved': 77,
        'appendedSheets': 2, 'finalSheets': 70, 'finalTables': 79,
        'sha256': digest(workbook), 'bytes': local(workbook).stat().st_size,
        'register': REGISTER, 'qa': PREFIX + 'workbook-qa.json', 'status': 'verified',
    }
    plan['meta'].pop('pendingProductionBible', None)
    write(PLAN, plan)
    print(serialized(plan['meta']['latestProductionBible']).strip())


def readme(register):
    qa = register['qa']
    require(register['status'] == 'final_production_register' and qa['status'] == 'passed', 'README requires final evidence')
    rows = '\n'.join(f'| {a["name"]} | {a["dimensions"][0]} × {a["dimensions"][1]} | Portrait du haut du torse |' for a in register['assets'])
    return f'''# V16 — Gerald et Rick · Barbie’s Bad Day

Deux portraits statiques sont intégrés à la galerie. Chaque dessin représente un seul personnage, avec son PNG natif et un WebP sans perte dont le décodage RGBA est identique. Les deux bases entières restent manquantes ; aucun combattant, cycle animé ou pouvoir supplémentaire n’est livré.

| Dessin | Dimensions natives | Portée |
|---|---:|---|
{rows}

## Sources et datation

Le court officiel [HELLUVA SHORTS 11 — Barbie’s Bad Day](https://www.youtube.com/watch?v=PyICIy6fkDo), publié par Vivziepop, est daté du **25 avril 2026**. Les champs primaires `publishDate` et `uploadDate` valent `2026-04-25T10:00:36-07:00` dans le microformat de la page YouTube. La preuve exacte est conservée dans `production/v16/characters/references/barbie-bad-day-publication-metadata.json`.

Gerald utilise les previews officielles à [20 s](https://www.youtube.com/watch?v=PyICIy6fkDo&t=20s) et [60 s](https://www.youtube.com/watch?v=PyICIy6fkDo&t=60s). Rick utilise la vue de face à [160 s](https://www.youtube.com/watch?v=PyICIy6fkDo&t=160s) et la vue arrière à [165 s](https://www.youtube.com/watch?v=PyICIy6fkDo&t=165s), qui corrobore ses deux cornes et sa casquette. Son ancien portrait de dépôt est un appui secondaire explicitement déclaré. Les cellules primaires mesurent 320 × 180 pixels ; les timecodes sont calculés sur un intervalle de 5 secondes.

## Comptage et limites

Le lot contient **2 dessins, 2 PNG et 2 WebP**, pour **2 474 716 octets**. La galerie passe de **143 à 145 entrées** ; les 143 objets antérieurs sont conservés strictement. Le catalogue reste à **209 identifiants**, dont **94 sans base entière** (93 identités distinctes après alias). Le total demeure **115 bases autonomes**, **43 kits actifs**, **51 stages** et **27 familles de costumes**.

Les proportions fines, couleurs, contours et détails sont adaptés depuis de petites sources. L’alpha natif est conservé, y compris des pixels très faibles autour de Gerald ; aucun nettoyage par seuil n’est appliqué. Les deux portraits ont été inspectés sur trois fonds et acceptés avec ces limites. **Aucune fidélité 1:1 n’est certifiée.**

## Vérifications

Le registre final lie les empreintes des dessins, références, sources de publication et rapports. La QA courante compte **{qa['testsPassed']} tests dans {qa['testSuites']} suites**, avec builds manager et standalone réussis. La galerie a été vérifiée sur Chromium desktop et mobile émulé : **4 captures**, deux par portrait, avec illustrations entières visibles. Aucun appareil physique ni nouveau comportement de combat n’est couvert par cette recette.

Consulter `delivery-register.json`, `runtime-qa.json`, `browser-gallery-qa.json`, `independent-visual-review.json` et `browser-visual-review.json`. Les prompts exacts sont conservés dans `characters-prompts.json`. L’historique V15 et ses deux extensions de guide sont préservés.

## Reproduction

La base publiée du PR #8 est `{register['baselineCommit']}`, équivalente au commit local `{LOCAL_BASE}` et à l’arbre `{BASE_TREE}`. `assemble-register.py --final --baseline-commit {register['baselineCommit']} --write-plan` refuse les preuves absentes, périmées ou incomplètes. Après construction et recette de la bible V16, `--workbook-metadata --write-plan` vérifie 70 feuilles et 79 tables, dont 68 feuilles et 77 tables historiques conservées.
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--final', action='store_true')
    mode.add_argument('--workbook-metadata', action='store_true')
    parser.add_argument('--baseline-commit', help='Published V15 commit SHA; explicitly required for --final')
    parser.add_argument('--write-plan', action='store_true', help='Explicitly update extension-plan.json after coordinator authorization')
    args = parser.parse_args()
    validate_baseline(args.baseline_commit, final=args.final)
    if args.workbook_metadata:
        workbook_metadata(args)
        return
    register, plan = assemble(args)
    write(REGISTER, register)
    if args.write_plan:
        write(PLAN, plan)
    if args.final:
        local(PREFIX + 'README.md').write_text(readme(register))
    print(serialized({'status': register['status'], 'drawings': 2, 'gallery': 145,
                      'bases': 115, 'remainingIds': 94, 'planWritten': args.write_plan,
                      'baselineCommit': args.baseline_commit}).strip())


if __name__ == '__main__':
    main()
