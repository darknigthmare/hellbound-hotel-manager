"""Reconcile the recovered V15 artwork with current, independently checked evidence.

Handoffs and historical editions are immutable inputs. The current register and
extension plan are derived from the exact V14 baseline, so reruns do not append
duplicate history. No absent historical file is deleted by this process.
"""
import argparse
import copy
import hashlib
import json
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
BASE_COMMIT = 'd03434054739e2995ccdc86617fb2ca3a1ea56bf'
LOCAL_BASE = '93c2b130535a0c85973a9944b5cf635fc847b6f8'
BASE_TREE = 'e4e79ad91c46464619b7827824fac514aaf9c3e8'
BATCH = 'static-v15-2026-11-27'
REGISTER = 'docs/standalone/production-v15/delivery-register.json'
PLAN = 'docs/standalone/extension-plan.json'
GALLERY = 'art/infernal-versus/production/reserve-assets.json'


def read(path):
    return json.loads(Path(path).read_text())


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def baseline(path):
    return json.loads(subprocess.check_output(['git', 'show', f'{LOCAL_BASE}:{path}'], cwd=ROOT))


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--final', action='store_true')
parser.add_argument('--workbook-metadata', action='store_true')
args = parser.parse_args()
assert subprocess.check_output(['git', 'rev-parse', LOCAL_BASE + '^{tree}'], cwd=ROOT, text=True).strip() == BASE_TREE

if args.workbook_metadata:
    register = read(ROOT / REGISTER)
    qa = read(HERE / 'workbook-qa.json')
    package = qa['packaging']
    workbook = ROOT / 'docs/standalone/INFERNAL_VERSUS_BIBLE_V15.xlsx'
    assert register['status'] == 'final_production_register'
    assert qa['registerSha256'] == digest(ROOT / REGISTER)
    assert qa['visualReview'] in ['passed', 'passed_with_documented_limits']
    assert package['finalSheetCount'] == 68
    assert package['preservedWorksheetXmlParts'] == 60
    assert package['preservedTableXmlParts'] == 69
    assert package['originalPartsChangedUnexpectedly'] == []
    assert package['outputSha256'] == digest(workbook)
    old = baseline(PLAN)['meta']['latestProductionBible']
    plan = read(ROOT / PLAN)
    history = baseline(PLAN)['meta'].get('productionBibleHistory', [])
    plan['meta']['productionBibleHistory'] = history + [old]
    plan['meta']['latestProductionBible'] = {
        'edition': 'V15', 'date': '2026-11-27',
        'workbook': str(workbook.relative_to(ROOT)), 'previousWorkbook': old['workbook'],
        'historicalSheetsPreserved': 60, 'historicalTablesPreserved': 69,
        'appendedSheets': 8, 'finalSheets': 68, 'finalTables': 77,
        'sha256': digest(workbook), 'bytes': workbook.stat().st_size,
        'register': REGISTER, 'qa': 'docs/standalone/production-v15/workbook-qa.json',
        'status': 'verified',
    }
    plan['meta'].pop('pendingProductionBible', None)
    write(ROOT / PLAN, plan)
    print(json.dumps(plan['meta']['latestProductionBible'], ensure_ascii=False))
    raise SystemExit(0)

previous = read(HERE.parent / 'production-v14/delivery-register.json')
handoff = read(HERE / 'characters-handoff.json')
assets = copy.deepcopy(handoff['assets'])
gallery = read(ROOT / GALLERY)
old_gallery = baseline(GALLERY)
old_plan = baseline(PLAN)
old_ids = {asset['id'] for asset in old_gallery['assets']}
assert len(old_ids) == 138
assert len(gallery['assets']) == 143
assert [a for a in gallery['assets'] if a['id'] in old_ids] == old_gallery['assets']
assert {a['id'] for a in gallery['assets']} - old_ids == {a['id'] for a in assets}
assert len({asset['masterSha256'] for asset in assets}) == len(assets) == 5

files = []
for asset in assets:
    assert asset['accepted'] and asset['fidelityOneToOneCertified'] is False
    assert asset['newAnimationCycles'] == asset['newPlayableKits'] == 0
    for field in ['master', 'export']:
        path = ROOT / asset[field]
        assert digest(path) == asset[field + 'Sha256'], str(path)
        files.append({'path': asset[field], 'sha256': digest(path), 'bytes': path.stat().st_size})
    with Image.open(ROOT / asset['master']) as master, Image.open(ROOT / asset['export']) as export:
        assert master.size == export.size == tuple(asset['dimensions'])
        assert master.convert('RGBA').tobytes() == export.convert('RGBA').tobytes(), asset['id']
    for source in asset['sourceReferences']:
        assert digest(ROOT / source['path']) == source['sha256'], source['path']
    asset['inGameChecked'] = False

new_bases = [asset for asset in assets if asset['addsStandaloneBase']]
assert [asset['sourceIdentityId'] for asset in new_bases] == ['hb_queef']
assert all(asset['frameCoverage'] == 'full_body' for asset in new_bases)
counts = {
    **handoff['counts'], 'newDrawings': 5, 'revisedDrawings': 0, 'thumbnails': 0,
    'newCharacterBases': 1, 'newStaticCostumes': 0, 'newStages': 0,
    'newPortraits': 2, 'newNarrativeIncarnations': 2,
    'newSceneryProps': 0, 'newReserveProps': 0, 'newReserveProjectiles': 0,
    'newReserveMachines': 0, 'generatorRefused': len(handoff['refused']),
    'generationAttemptsThisResume': 0,
}
counts.pop('newGenerationThisTurn', None)
counts.pop('recoveredDrawings', None)
counts['recoveredDrawingsThisResume'] = 5
assert counts['deliveredImageBytes'] == sum(file['bytes'] for file in files)

remaining = copy.deepcopy(previous['remaining'])
gaps = remaining['characterReferenceGaps']
assert sum(row.get('id') == 'hb_queef' for row in gaps) == 1
remaining['characterReferenceGaps'] = [row for row in gaps if row.get('id') != 'hb_queef']
assert len(remaining['characterReferenceGaps']) == 94
remaining['inheritedFrom'] = 'docs/standalone/production-v14/delivery-register.json'
remaining['refusedThisWave'] = copy.deepcopy(handoff['refused'])
remaining['resolvedFullBodyIdentitiesV15'] = ['hb_queef']
remaining['noRetryTargetIdsV15'] = sorted(set(remaining['noRetryTargetIdsV14']) | set(handoff['noRetryTargetIdsAdded']))
remaining['v15PartialCharacterCoverage'] = [
    {'id': asset['sourceIdentityId'], 'assetId': asset['id'], 'frameCoverage': asset['frameCoverage'],
     'status': 'narrative_archive_full_detailed_base_still_missing'}
    for asset in assets if not asset['addsStandaloneBase']
]
remaining['provenanceReconciliationV15'] = {
    'recoveredLilithMaster': 'production/v15/characters/masters/hz_lilith-storybook-standing-silhouette.png',
    'historicalRefusalPreserved': True, 'newGenerationInThisResume': False,
    'note': 'Le handoff antérieur conserve à la fois un refus et un master Lilith distinct. Cette reprise récupère le master existant sans effectuer de nouvelle génération ; elle ne réécrit pas la chronologie antérieure.',
}
remaining['limitations'] = list(dict.fromkeys(remaining['limitations'] + [
    'Roo et Top Hat Demon sont des portraits ; Eve et Lilith sont des silhouettes narratives. Ces quatre dessins ne ferment pas de manque de base détaillée autonome.',
    'Queef suit le produit officiel Creator Collection ; son apparence exacte dans un épisode reste à corroborer.',
    'Les modules taunts/tag/bonus sont documentés. Le code de déblocage local ne met pas en service un abonnement Patreon ni un droit commercial distant.',
]))

reconciliation = copy.deepcopy(previous['baseCoverageReconciliation'])
reconciliation['historicalRegisterEditions'] += ['V14']
reconciliation['coveredProductionIdentitiesBefore'] = reconciliation['coveredProductionIdentitiesAfter']
reconciliation['coveredProductionIdentitiesAfter'] = sorted(reconciliation['coveredProductionIdentitiesBefore'] + ['hb_queef'])
reconciliation['newlyCoveredCatalogueIds'] = ['hb_queef']
reconciliation['newStandaloneBaseIdentities'] = ['hb_queef']

qa = {'status': 'pending', 'inGameChecked': False,
      'runtimeReport': 'docs/standalone/production-v15/runtime-qa.json',
      'browserReport': 'docs/standalone/production-v15/browser-gallery-qa.json',
      'activeAssetCoverage': 'docs/standalone/production-v15/active-asset-coverage.json'}
review_path = HERE / 'independent-final-visual-review.json'
if args.final:
    technical = read(HERE / 'runtime-qa.json')
    browser = read(HERE / 'browser-gallery-qa.json')
    coverage = read(HERE / 'active-asset-coverage.json')
    review = read(review_path)
    assert technical['status'] == browser['status'] == 'passed'
    assert technical['runtimeInputFilesBefore'] == technical['runtimeInputFilesAfter']
    for row in technical['runtimeInputFilesAfter']:
        assert digest(ROOT / row['path']) == row['sha256'], row['path']
    assert not coverage['summary']['brokenReferences']
    assert not browser['consoleErrors'] and not browser['pageErrors']
    assert review['counts']['visuallyAcceptedAssets'] == 5 and review['counts']['visuallyRejectedAssets'] == 0
    assert review['counts']['desktopArtworkCompleteCaptures'] == review['counts']['mobileArtworkCompleteCaptures'] == 5
    assert review['currentBrowserEvidence']['sha256'] == digest(HERE / 'browser-gallery-qa.json')
    assert {row['id'] for row in review['reviews'] if row['accepted'] and row['mobileCompleteFramingEstablished']} == {row['id'] for row in assets}
    for path, sha in browser['sourceHashes'].items():
        assert digest(ROOT / path) == sha, f'Browser source changed: {path}'
    for asset in assets:
        checks = [row for row in browser['checks'] if row.get('assetId') == asset['id']]
        assert {row['viewport'] for row in checks if row['passed']} == {'desktop', 'mobile'}
        assert all(row['masterSha256'] == asset['masterSha256'] and row['exportSha256'] == asset['exportSha256'] for row in checks)
        asset['inGameChecked'] = True
        asset['browserReview'] = qa['browserReport']
        asset['independentReview'] = 'docs/standalone/production-v15/independent-final-visual-review.json'
    qa.update(status='passed', inGameChecked=True, testsPassed=technical['testsPassed'],
              testSuites=technical['testSuites'], managerBuild='passed', standaloneBuild='passed',
              standardQaScriptPassed=technical['standardQaScriptPassed'],
              referencedAssets=coverage['summary']['referencedAssets'],
              checkedAssetIds=[asset['id'] for asset in assets],
              browserScope=browser['scope'], browserChecks=len(browser['checks']),
              limitations=['Chromium local et émulation tactile ; aucun test sur téléphone physique.',
                           'Les cinq dessins sont des éléments de galerie statiques, sans nouveau kit animé.'])

source_paths = {source['path'] for asset in assets for source in asset['sourceReferences']}
source_paths.update('docs/standalone/production-v15/' + name for name in [
    'characters-handoff.json', 'characters-references.json', 'characters-prompts.json',
    'image-qa.json', 'characters-visual-review.json',
])
if args.final:
    source_paths.update('docs/standalone/production-v15/' + name for name in [
        'independent-final-visual-review.json', 'runtime-qa.json', 'browser-gallery-qa.json', 'active-asset-coverage.json'])
register = {
    'schemaVersion': 1, 'edition': 'V15', 'date': '2026-11-27',
    'status': 'final_production_register' if args.final else 'prepared_register_qa_pending',
    'repository': 'darknigthmare/hellbound-hotel-manager', 'branch': 'feat/infernal-versus-assets-20261124', 'prNumber': 8,
    'baselineCommit': BASE_COMMIT, 'equivalentLocalBaselineCommit': LOCAL_BASE, 'baselineTree': BASE_TREE,
    'baselinePublicationStatus': 'published_on_existing_pr_8',
    'baseline': previous['cumulativeCounts'], 'counts': counts,
    'cumulativeCounts': handoff['proposedCumulativeCounts'],
    'baseCoverageReconciliation': reconciliation, 'assets': assets, 'files': files,
    'candidateStates': handoff['candidateStates'], 'variantStates': [],
    'remaining': remaining, 'qa': qa,
    'sourceFiles': [{'path': path, 'sha256': digest(ROOT / path), 'bytes': (ROOT / path).stat().st_size} for path in sorted(source_paths)],
    'independentReview': 'docs/standalone/production-v15/independent-final-visual-review.json',
    'fidelityOneToOneCertified': False,
}
write(ROOT / REGISTER, register)

plan = copy.deepcopy(old_plan)
for key, history in [('currentRuntime', 'runtimeHistory'), ('latestStaticDelivery', 'staticDeliveryHistory')]:
    plan['meta'][history] = copy.deepcopy(old_plan['meta'].get(history, [])) + [copy.deepcopy(old_plan['meta'][key])]
current = plan['meta']['currentRuntime']
current.update(date='2026-11-27', batchId=BATCH, baseCommit=BASE_COMMIT,
               note='V15 : cinq dessins statiques de galerie, dont une base de soutien Queef ; deux portraits et deux silhouettes narratives. Aucun nouveau kit ni cycle animé.',
               reserveGalleryDrawings=143, standaloneBases=115, catalogueIdsWithoutStandaloneBase=94,
               distinctProductionIdentitiesWithoutStandaloneBase=93, productionRegister=REGISTER,
               assetCoverageReport=qa['activeAssetCoverage'], referencedAssets=qa.get('referencedAssets'),
               referencedAssetsStatus='verified_current_v15_paths' if args.final else 'awaiting_current_v15_audit',
               technicalReview={key: qa.get(key) for key in ['status', 'testsPassed', 'testSuites', 'managerBuild', 'standaloneBuild', 'standardQaScriptPassed']},
               browserReview={'status': qa['status'], 'report': qa['browserReport'], 'scope': qa.get('browserScope'), 'checkedAssetIds': qa.get('checkedAssetIds', [])})
plan['meta']['latestStaticDelivery'] = {
    'date': '2026-11-27', 'batchId': BATCH, 'baseCommit': BASE_COMMIT,
    'branch': register['branch'], 'prNumber': 8, 'register': REGISTER,
    'counts': counts, 'cumulativeCounts': register['cumulativeCounts'],
    'verification': qa,
}
plan['meta']['latestIntegration'] = {
    'date': '2026-11-27', 'batchId': 'combat-guide-extensions-01-02',
    'guide': 'docs/standalone/COMBAT_GUIDES.md',
    'matrix': 'docs/standalone/guide-extensions-20261127/integration.json',
    'runtime': 'docs/standalone/guide-extensions-20261127/runtime-integration.json',
    'scope': 'Guide général et deux extensions contextualisés ; déblocages locaux optionnels. Taunts, assistances, relais, supers collectives et bonus restent des conceptions tant que leur implémentation n’est pas attestée.',
}
plan['meta']['pendingProductionBible'] = {'edition': 'V15', 'workbook': 'docs/standalone/INFERNAL_VERSUS_BIBLE_V15.xlsx', 'preserveHistoricalSheets': 60, 'appendSheets': 8}
for asset in assets:
    row = next(row for row in plan['roster'] if row['id'] == asset['sourceIdentityId'])
    row['productionV15'] = {
        'assetId': asset['id'], 'export': asset['export'], 'register': REGISTER,
        'continuity': asset['continuity'], 'frameCoverage': asset['frameCoverage'],
        'addsStandaloneBase': asset['addsStandaloneBase'], 'status': 'verified_gallery_static' if args.final else 'prepared_gallery_static',
        'reference': asset['reference'], 'fullDetailedCombatModelStillMissing': not asset['addsStandaloneBase'],
    }
    if asset['sourceIdentityId'] == 'hb_queef':
        row['asset'] = 'Base entière de soutien en réserve · modèle du produit officiel Creator Collection'
        row['next'] = 'Définir l’usage de soutien selon preuves ; modèle d’épisode et kit jouable non livrés.'
assert len(plan['roster']) == 209 and plan['productionBible'] == old_plan['productionBible']
write(ROOT / PLAN, plan)
write(HERE / 'catalogue-plan-qa.json', {
    'edition': 'V15', 'status': 'passed' if args.final else 'prepared',
    'historicalGalleryEntriesPreserved': 138, 'galleryEntries': 143, 'newAssetIds': [a['id'] for a in assets],
    'historicalRosterRowsPreserved': 209, 'newStandaloneBases': 1,
    'missingCatalogueIds': 94, 'missingDistinctIdentities': 93, 'deletedHistoricalFiles': 0,
    'planSha256': digest(ROOT / PLAN), 'registerSha256': digest(ROOT / REGISTER),
})
print(json.dumps({'status': register['status'], 'drawings': 5, 'gallery': 143, 'bases': 115, 'remainingIds': 94, 'baselineCommit': BASE_COMMIT}, ensure_ascii=False))
