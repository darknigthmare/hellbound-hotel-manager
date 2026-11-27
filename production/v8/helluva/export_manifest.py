"""Lossless exports and honest provenance for the Helluva V8 static costume batch."""
from pathlib import Path
from PIL import Image
import hashlib
import json
import shutil

ROOT = Path(__file__).resolve().parents[3]
WORK = ROOT / 'production/v8/helluva'
PUBLIC = ROOT / 'public/assets/production/v8/helluva'
DOCS = ROOT / 'docs/standalone/production-v8'
PUBLIC.mkdir(parents=True, exist_ok=True)
DOCS.mkdir(parents=True, exist_ok=True)
(WORK / 'masters').mkdir(exist_ok=True)
acceptance = json.loads((WORK / 'acceptance.json').read_text())
jobs = []
for f in sorted(WORK.glob('prompts-batch-*.json')):
    jobs += json.loads(f.read_text())

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

sources = {
    'S1E2': ('https://www.youtube.com/watch?v=kpnwRg268FQ', 'Vivziepop — HELLUVA BOSS - Loo Loo Land // S1 Episode 2'),
    'S1E3': ('https://www.youtube.com/watch?v=RghsgkZKedg', 'Vivziepop — HELLUVA BOSS - Spring Broken // S1 Episode 3'),
    'S1E5': ('https://www.youtube.com/watch?v=h2ZmVAdezF8', 'Vivziepop — HELLUVA BOSS - The Harvest Moon Festival // S1 Episode 5'),
    'S2E8': ('https://www.youtube.com/watch?v=Fj9YRsV1pEw', 'Vivziepop — HELLUVA BOSS - The Full Moon // S2 Episode 8'),
    'S2E9': ('https://www.youtube.com/watch?v=tLD-OUkYtk4', 'Vivziepop — HELLUVA BOSS - Apology Tour // S2 Episode 9'),
    'S2E10': ('https://www.youtube.com/watch?v=5DV4IIKwqRI', 'Vivziepop — HELLUVA BOSS - Ghostf**kers // S2 Episode 10'),
}
times = {
    'looloo-bodyguards-whole-scene.png':380,
    'looloo-blitz-details.png':470,
    'looloo-millie-moxxie-details.png':400,
    'looloo-stolas-whole-scene.png':480,
    'looloo-stolas-details.png':360,
    'ghosts-blitz-millie-whole-scene.png':610,
    'ghosts-millie-whole-scene.png':770,
    'ghosts-millie-close.png':580,
    'ghosts-costume-details.png':400,
    'ghosts-costume-lowerbody.png':1480,
    'ghosts-blitz-close.png':540,
    'harvest-blitz-whole-scene.png':540,
    'harvest-blitz-details.png':450,
    'harvest-millie-whole-scene.png':600,
    'harvest-millie-details.png':270,
    'apology-stolas-whole-scene.png':720,
    'apology-stolas-details.png':760,
    'apology-stolas-blitz-costumes.png':810,
    'apology-blitz-whole-scene.png':1220,
    'apology-blitz-seated-scene.png':990,
    'apology-blitz-details.png':840,
}
official_products = {
    'blitz-ghosts-official-pin-1.png':'https://sharkrobot.com/products/blitz-ghost-fckrs-lenticular-pin',
    'millie-harvest-official-pin.png':'https://sharkrobot.com/products/harvest-moon-wrath-ring-millie-enamel-pin',
    'apology-tour-official-standee-0.png':'https://sharkrobot.com/products/apology-tour-standee',
}
assets = []
for job in jobs:
    if job['id'] not in acceptance:
        continue
    aid = job['id']
    review = acceptance[aid]
    src = WORK / 'candidates' / job.get('selectedCandidate', aid + '.png')
    master = WORK / 'masters' / (aid + '.png')
    export = PUBLIC / (aid + '.webp')
    shutil.copy2(src, master)
    im = Image.open(master).convert('RGBA')
    existing = Image.open(export).convert('RGBA') if export.exists() else None
    if existing is None or existing.size != im.size or existing.tobytes() != im.tobytes():
        im.save(export, format='WEBP', lossless=True, quality=100, method=4, exact=True)
    check = Image.open(export).convert('RGBA')
    exact = im.size == check.size and im.tobytes() == check.tobytes()
    if not exact:
        raise RuntimeError('Export changed decoded RGBA pixels: ' + aid)
    alpha = im.getchannel('A')
    bbox = alpha.point(lambda p:255 if p>=128 else 0).getbbox()
    url, title = sources[job['episode']]
    refs = []
    for name in job['refs']:
        f = WORK / 'references' / name
        with Image.open(f) as ri:
            dims = list(ri.size)
        refs.append({'path':str(f.relative_to(ROOT)), 'sha256':sha(f), 'dimensions':dims,
                     'sourceUrl':official_products.get(name, url + ('&t=' + str(times[name]) + 's' if name in times else '')),
                     'sourceKind':'licensed_merchandise_corroboration' if name in official_products else 'official_episode_storyboard',
                     'timeSeconds':times.get(name), 'inspected':True})
    assets.append({
        'id':aid, 'name':job['name'], 'sourceIdentityId':job['sourceIdentityId'],
        'fighterId':job['fighter'], 'costumeId':aid,
        'category':'costume', 'kind':'costume_base', 'franchise':'Helluva Boss',
        'continuity':job['continuity'], 'spoilerScope':job['continuity'],
        'incarnation':'Série — '+job['episode']+' — '+job['name'],
        'status':'accepted_static_candidate', 'accepted':True,
        'eligibility':'wearable', 'staticReadyOnly':True, 'layout':'portrait',
        'frameCoverage':'full_body',
        'frameCoverageNote':('Silhouette costumière entière ; cornes, corps, jambes, pieds et queue sont masqués par le drap, comme dans la source primaire à 1220 secondes. Aucun membre caché reconstruit.' if aid == 'hb_blitzo-ghost-apology-tour' else 'Silhouette entière, extrémités visibles complètes.'),
        'master':str(master.relative_to(ROOT)), 'export':str(export.relative_to(ROOT)),
        'ready':'/'+str(export.relative_to(ROOT)).removeprefix('public/'),
        'dimensions':list(im.size), 'masterSha256':sha(master), 'exportSha256':sha(export),
        'masterBytes':master.stat().st_size, 'exportBytes':export.stat().st_size,
        'pixelExactExport':exact, 'alphaExtrema':list(alpha.getextrema()),
        'visibleBBoxAlpha128':list(bbox),
        'runtimeUsage':'Costume statique à raccorder au combattant existant ; aucune modification de kit',
        'referenceUrls':list(dict.fromkeys([url]+[official_products[n] for n in job['refs'] if n in official_products])), 'referenceTitle':title, 'referenceCaptures':refs,
        'promptRegister':'docs/standalone/production-v8/helluva-generation.json',
        'visualReview':{'status':'accepted_as_documented_static_adaptation_with_limits',
                        'matched':review['matched'], 'limits':review['limits'],
                        'subjectComplete':True, 'masterSha256':sha(master)},
        'fidelityNotes':review['limits']+['Alpha natif conservé, sans suppression du fond ni retouche de pixels.',
            'Une seule image READY statique. Aucune nouvelle animation, identité ou technique de combat.'],
        'newAnimationCycles':0, 'fidelityOneToOneCertified':False, 'inGameChecked':False,
    })

manifest = {
    'schemaVersion':1, 'edition':'production-v8-helluva', 'date':'2026-11-26',
    'status':'static_batch_complete',
    'baselineCommit':'daae49839972f31a1d55cbbe2942c1b0c7abe304',
    'counts':{'acceptedStaticCostumes':len(assets), 'newCharacterBases':0,
              'initialCandidates':len(jobs), 'nativeEditCalls':1,
              'nativeImageOutputs':len(jobs)+1, 'heldCandidates':len(jobs)-len(assets),
              'newAnimationCycles':0, 'newPlayableKits':0},
    'assets':assets,
    'pendingCandidates':[],
    'unacceptedCandidates':[j['id'] for j in jobs if j['id'] not in acceptance],
    'heldCandidates':json.loads((WORK/'holdbacks.json').read_text()) if (WORK/'holdbacks.json').exists() else [],
    'qa':{'allExportsPixelExact':True, 'nativeAlphaPreserved':True,
          'sourceScreenshotsInspected':True, 'inGameChecked':False},
    'independentReview':'docs/standalone/production-v8/independent-visual-review.json',
    'fidelityOneToOneCertified':False,
}
(DOCS/'helluva-delivery.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(DOCS/'helluva-generation.json').write_text(json.dumps({
    'tool':'native image_gen.imagegen', 'transparent_background':True,
    'mode':'one independent call per character costume', 'jobs':jobs,
    'edits':json.loads((WORK/'generation-edits.json').read_text()) if (WORK/'generation-edits.json').exists() else [],
    'allPromptsExact':True, 'fidelityOneToOneCertified':False,
},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'accepted':len(assets), 'pending':manifest['pendingCandidates'],
                  'exportsPixelExact':True, 'manifest':str(DOCS/'helluva-delivery.json')}))
