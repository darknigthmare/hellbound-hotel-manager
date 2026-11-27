"""Reference index and qualification summary; no asset pixels are modified."""
from pathlib import Path
from PIL import Image
import hashlib
import json

ROOT = Path(__file__).resolve().parents[3]
WORK = ROOT / 'production/v8/helluva'
DOCS = ROOT / 'docs/standalone/production-v8'
manifest = json.loads((DOCS/'helluva-delivery.json').read_text())
jobs = json.loads((DOCS/'helluva-generation.json').read_text())['jobs']
captures = {}
for asset in manifest['assets']:
    for ref in asset['referenceCaptures']:
        captures[Path(ref['path']).name] = dict(ref)

held_sources = {
    'ghosts-blitz-millie-whole-scene.png':('official_episode_storyboard','https://www.youtube.com/watch?v=5DV4IIKwqRI',610),
    'blitz-ghosts-official-pin-1.png':('licensed_merchandise_corroboration','https://sharkrobot.com/products/blitz-ghost-fckrs-lenticular-pin',None),
}
for name,(kind,url,time) in held_sources.items():
    f=WORK/'references'/name
    captures[name]={'path':str(f.relative_to(ROOT)), 'sourceKind':kind, 'sourceUrl':url,
                    'timeSeconds':time, 'inspected':True}
by_ref={}
for job in jobs:
    for name in job['refs']:
        by_ref.setdefault(name,[]).append(job['id'])
refs=[]
for name,ids in by_ref.items():
    f=WORK/'references'/name
    r=captures[name]
    with Image.open(f) as im:
        dims=list(im.size)
    r.update({'id':'hb-v8-'+Path(name).stem, 'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),
              'dimensions':dims, 'bytes':f.stat().st_size, 'usedByCandidateIds':ids})
    if r['sourceKind']=='official_episode_storyboard':
        video=name.split('-')[0]
        meta=json.loads((WORK/f'references/{video}-metadata.json').read_text())
        boards=json.loads((WORK/f'references/{video}-boards.json').read_text())
        if '-board-' in name:
            board=int(Path(name).stem.split('-')[-1])
            r.update({'timeRangeSeconds':[board*90,board*90+80], 'captureKind':'whole_storyboard'})
        else:
            t=r['timeSeconds'];board=t//90;cell=(t%90)//10
            r.update({'cellIndexZeroBased':cell,'cropRect':[cell%3*320,cell//3*180,(cell%3+1)*320,(cell//3+1)*180], 'captureKind':'exact_native_cell_crop'})
        r.update({'boardPath':f'production/v8/helluva/references/{video}-board-{board}.jpg',
                  'boardUrl':boards[board]['url'], 'episodeUrl':meta['url'],
                  'title':meta['title'],'author':meta.get('author'),
                  'resolutionNote':'Native public YouTube storyboard cells 320×180, no AI upscaling.'})
    else:
        r['resolutionNote']='Official storefront image, detail corroboration only; episode frames establish the costume incarnation.'
    refs.append(r)
(DOCS/'helluva-reference-index.json').write_text(json.dumps({
    'schemaVersion':1,'edition':'V8 Helluva','date':'2026-11-26','captureCount':len(refs),
    'references':refs,'fidelityOneToOneCertified':False,
    'method':'Public official episode storyboards inspected visually; exact native crops retained. Official storefront images corroborate details. Reference captures are evidence, not delivered game assets.',
},ensure_ascii=False,indent=2)+'\n')

qualification={
    'schemaVersion':1,'edition':'V8 Helluva','date':'2026-11-26','status':'complete',
    'baselineCommit':manifest['baselineCommit'],
    'scope':'Missing official static costume families only. No new identity base qualified from the examined sources.',
    'counts':manifest['counts'],
    'deliveredCostumes':[{'id':a['id'],'fighterId':a['fighterId'],
        'episode':next(j['episode'] for j in jobs if j['id']==a['id']),
        'status':'accepted_static_adaptation','newIdentity':False,'wearable':True,
        'staticReadyOnly':True,'fidelityOneToOneCertified':False} for a in manifest['assets']],
    'historicalRefusalsPreservedWithoutRetry':[
        {'id':'hb_stella','priorAttempt':'hb_stella-ready'},
        {'id':'hb_loopty_goopty','priorAttempt':'hb_loopty_goopty-ready'},
        {'id':'hb_deerie','priorAttempt':'hb_deerie-ready'},
    ],
    'alreadyDeliveredFamiliesSkipped':[
        'Moxxine camping','Millerd camping','Loona human disguise','Stolas human disguise',
        'Stolas deposed Sinsmas','Barbie human disguise','Vortex human disguise',
        'Fizzarolli casual Oops','Moxxie Harvest Festival','Millie past ponytail',
        'Loona quadruped','Loona shelter archive','Fizz pre-accident archive',
    ],
    'newReferenceGaps':[
        {'target':'Fizzarolli — Full Moon breaktime outfit','status':'not_generated',
         'reason':'Distinct costume identified in official Full Moon boards8–9; full legs and feet insufficiently legible for a new standing sprite.'},
        {'target':'Verosika — human disguise Spring Broken','status':'not_generated',
         'reason':'Human costume torso visible in official Spring Broken board6; lower legs/feet not resolved by the inspected sequence.'},
        {'target':'Stolas — Ozzie’s date','status':'not_generated',
         'reason':'Inspected scenes do not establish a sufficiently distinct complete missing costume family.'},
    ],
    'heldCandidates':manifest['heldCandidates'],
    'newCharacterBases':0,'newAnimationCycles':0,'fidelityOneToOneCertified':False,
    'independentReview':'docs/standalone/production-v8/independent-visual-review.json',
    'countingRule':'9 selected costume drawings. PNG masters and lossless WebP are two encodings of each drawing, not additional art. 10 initial native candidate outputs plus 1 native correction. Bethany and the superseded first Harvest Blitz are not delivered as extra assets.',
}
(DOCS/'helluva-qualification.json').write_text(json.dumps(qualification,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'references':len(refs),'accepted':len(manifest['assets']),'qualification':'complete'}))
