import json, hashlib, shutil
from pathlib import Path
from PIL import Image
ROOT=Path('/workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager')
SCRATCH=Path('/tmp/infernal-v10/characters')
DOC=ROOT/'docs/standalone/production-v10'
REF=ROOT/'production/v10/characters/references'
MAST=ROOT/'production/v10/characters/masters'
EXP=ROOT/'public/assets/production/v10/characters'
for p in [DOC,REF,MAST,EXP]:p.mkdir(parents=True,exist_ok=True)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def stat(p):
    p=Path(p)
    with Image.open(p) as im:return {'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size,'dimensions':list(im.size),'mode':im.mode}
def save_json(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def visual(native,export):
    with Image.open(native) as src, Image.open(export) as dst:
        a=src.convert('RGBA');b=dst.convert('RGBA');al=a.getchannel('A');bb=al.point(lambda v:255 if v>=128 else 0).getbbox();hist=al.histogram();equal=a.tobytes()==b.tobytes()
        assert equal
        assert bb and bb[0]>0 and bb[1]>0 and bb[2]<a.width and bb[3]<a.height
        return {'viewedNative':True,'viewedAlphaComposite':True,'completeFigure':True,'transparentAlpha':True,'alphaRange':list(al.getextrema()),'transparentPixels':hist[0],'threshold128Bbox':list(bb),'threshold128Margins':{'left':bb[0],'top':bb[1],'right':a.width-bb[2],'bottom':a.height-bb[3]},'webpDecodedRgbaEqualsMaster':equal,'renderingNote':'La prévisualisation RGB brute peut afficher des couleurs sous alpha 0 ; la composition RGBA a été vérifiée.'}
# Preserve native artwork byte for byte. WebP is only a lossless format export.
cry_native=Path('/workspace/scratch/b07af32d1b2c/generated_images/exec-f3dbebcb-d363-470c-b4ff-064a2ca6eb29.png')
cry_id='hz_crymini-legacy-2017-base'
cry_master=MAST/(cry_id+'.png');cry_export=EXP/(cry_id+'.webp')
shutil.copyfile(cry_native,cry_master)
with Image.open(cry_master) as im:im.save(cry_export,'WEBP',lossless=True,quality=100,method=6,exact=True)
assert sha(cry_native)==sha(cry_master)
for name in ['crymini-official-590s.png','crymini-official-595s.png']:shutil.copyfile(SCRATCH/name,REF/name)
shutil.copyfile(ROOT/'public/assets/sprites/hazbin/portraits/hz_crymini.png',REF/'crymini-historical-detail.png')
D=json.loads((DOC/'characters-handoff.json').read_text())
cry_meta=json.loads((SCRATCH/'viv-teenager-meta.json').read_text())
cry_source={k:v for k,v in cry_meta.items() if k not in ['urls','thumbnailUrl','description']}
cry_source['descriptionPrintLink']='https://sharkrobot.com/products/teenager'
cry_source['descriptionPrintLinkStatus']='404 au contrôle V10 ; provenance secondaire dans la description officielle, pas de référence image récupérée à ce lien.'
cry={
 'assetId':cry_id,'characterId':'hz_crymini','sourceIdentityId':'hz_crymini','name':'Crymini · modèle historique 2017','franchise':'hazbin','kind':'complete-static-character-base','continuity':'legacy_concept_2017',
 'canonicalContext':'Concept historique peint par Vivziepop dans Teenager, vidéo officielle publiée le 28 mai 2017 ; aucune attribution de cette tenue aux épisodes S1/S2.',
 'nativeOutputPath':str(cry_native),'masterPath':str(cry_master.relative_to(ROOT)),'runtimePath':str(cry_export.relative_to(ROOT)),
 'files':[stat(cry_master),stat(cry_export)],'newDrawingCount':1,'newBaseCount':1,'newPlayableKitCount':0,'newAnimationCycleCount':0,'primaryWholeBodyReferenceQualified':True,'fidelityOneToOneCertified':False,
 'references':[dict(stat(REF/name),viewed=True) for name in ['crymini-official-595s.png','crymini-official-590s.png','crymini-historical-detail.png']],
 'primarySources':[cry_source],
 'limitations':[
  'Incarnation legacy_concept_2017 uniquement ; cette base ne certifie ni sa présence ni son modèle dans la série actuelle.',
  'spoilerScope=season_1 sert uniquement de plafond compatible avec les filtres existants ; il ne date pas le concept en saison 1.',
  'Les frames officielles natives 320×180 qualifient la silhouette entière, la tenue et la queue ; les détails fins des vêtements et du visage sont adaptés, sans certification 1:1.',
  'Le cutout historique sert de repère complémentaire de détail concordant. La qualification du corps entier vient des frames officielles à 595 et 590 s.',
  'Une seule oreille reste nettement visible dans la pose ; la seconde est masquée par la chevelure. La queue conserve les deux touffes claires lisibles dans le tableau de 2017.'
 ],'visualReview':visual(cry_master,cry_export)
}
D['assets']=[a for a in D['assets'] if a['assetId']!=cry_id]+[cry]
melissa_prompt="""Create ONE isolated full-body static 2D character cutout of Melissa from Hazbin Hotel, specifically the adult studio worker/model in the final outfit shown by the first two attached official Season 1 scene references. This is a clean non-sexual character asset for an illustrated character gallery, a single figure, no animation, no sprite sheet. Reproduce only the slim pale grey woman standing centered in the dressing alcove in references 1 and 2; do not draw Vox, Velvette, the alcove, subtitles, logos, or any other objects. Reference 3 is a historical face-only detail to clarify the same recognizable face and hairstyle; it is not the outfit reference. Preserve the tall, very slender overall silhouette; small angular pale grey head; two very large pale yellow round eyes with tiny warm red pupils and thin black brows; slightly worried neutral expression; tiny angular nose; dark slate-blue short hair framing the cheeks and a single very high ponytail bound by a little red band, long angular ponytail sweeping to the viewer's left. Keep the exact final scene clothing silhouette: simple dark red sleeveless long fitted top with thin shoulder straps and rounded neckline, a narrow pale white ruffled layer showing below its hem, extremely slim fully covered black legs, small black pointed ankle boots. Two slim bare pale grey arms hang naturally by her sides with small pointed fingers. Keep shoulders, hands, both legs, both boot tips, and the entire ponytail plainly separate and visible. Pose nearly front-facing with a slight three-quarter turn as in the official references, standing neutrally; no attack, no weapon, no invented accessories or body markings. Crisp dark outline, restrained flat cel colors, light minimal cel shading, consistent clean 2D cartoon line quality. Use a portrait 2:3 canvas with genuinely transparent alpha background. Center the complete silhouette and leave at least 10 percent empty transparent margin on every side, especially below both shoes and above the highest ponytail. No floor, no cast shadow, no glow, no background color, no frame, no text."""
loo_initial="""Draw ONE complete isolated static 2D cutout of Loo Loo, the red apple-costumed theme park mascot from Helluva Boss, strictly based on the mascot in these three official episode reference frames. Reference 1 is the high wide shot that shows the entire mascot including both red shoes. References 2 and 3 show his face, leaf, hat, arms, glove construction and black legs more clearly. Isolate ONLY this mascot; no other characters, no park, no text, no logo, no platform. A nearly round tall RED APPLE forms the whole body and face; there is no separate human torso and no neck. Bright green scalloped apple-cap across the crown, a short dark stem, a single bright green leaf, and the small black top hat with a red band seen behind the leaf. Two huge round black eyes with pale yellow surrounds and small wedge highlights, round red cheeks, a very broad pale yellow grinning mouth with thin black stitched-looking tooth separators and a prominent black missing upper tooth. Short thin flexible black arms emerge from each side of the apple, red four-fingered padded mascot gloves with darker red round cuffs. Two thin BLACK legs extend below the apple and end in simple RED rounded mascot shoes, as in the official wide shot. Do not add green boots or white socks. Friendly slightly awkward neutral standing stance, both legs planted visibly apart, one gloved hand relaxed at side and one held in a small welcoming wave. Preserve the compact round silhouette and face construction from the attached official source. Clean bold dark outline and restrained flat cel shading, crisp readable cartoon game asset. Use a portrait canvas, scale the complete figure to about 76 percent of canvas height with at least 10 percent empty transparent margin above the leaf and below both soles and around both hands. GENUINE transparent alpha background, no floor, no cast shadow, no ambient glow, no smoke, no border, no lettering. Single full-body drawing only, not an animation or sprite sheet."""
loo_corrected="""Correct this single Loo Loo mascot cutout using the official episode frames supplied as references 2–4. Keep the one complete apple mascot, its green scalloped crown, one leaf and small black top hat with red band, two black thin arms with red padded four-finger gloves, two thin black legs and red rounded shoes, welcoming standing pose, clean flat outlined cartoon style, and transparent background. Essential facial correction: REMOVE the outlined red oval nose currently beneath the left eye. This mascot in the official frames has NO separate nose shape: the space immediately below and between the circular eyes and above the grin is simply the continuous red surface of the apple. Make that area plain red with no oval, no bump, no extra contour. Keep the two red cheek circles toward the sides and the broad pale yellow grin with its black missing tooth and simple thin tooth-divider marks, following the face construction in references 2 and 3. Preserve the overall complete silhouette. Center it slightly smaller on the canvas so the leaf tip, raised fingertips, and both shoe soles each have at least 10 percent empty margin. The entire character must be visible with genuine transparent alpha; no background, halo, shadow, checkerboard, scene, lettering, or other object. One isolated static character drawing only."""
cry_prompt="""Create ONE complete isolated static 2D cutout of Crymini, specifically the 2017 early Hazbin Hotel concept incarnation shown on the RIGHT of the first two attached images from Vivziepop's official Teenager speedpainting. This is an archive character illustration of that exact legacy concept, not a modern series redesign. Reference 3 is the historical project cutout of the same concept, to make the silhouette and concordant small details easier to see. Use references 1 and 2 to fix the complete body, outfit and tail. Draw only Crymini; remove the other character, railing, room, painting software, captions and background. She is a compact anthropomorphic hyena-like cartoon girl with a pale cream pointed muzzle and cheek fur, small black nose, yellow eyes with warm red pupils and heavy dark eye shapes, three small freckles near the muzzle, a mildly unimpressed expression. Two pointed animal ears, NOT horns; large swept cream-white hair with saturated crimson-magenta lower sections, the huge swept bang partly across the forehead, and the large back mass in the reference. Keep the black studded collar and the red-and-black punk tunic top with its small white skull graphic, crossed arms with black forearm gloves and pale small hands. Preserve the distinctive asymmetrical legs exactly as shown: viewer-left leg dark black with pale diagonal slashes at the upper thigh, viewer-right leg pale cream with a column of dark magenta spots, slim pointed dark foot tips. Keep the large bushy crimson-magenta tail sweeping outward to viewer-right with the cream pointed tip tufts visible in the source, attached naturally behind her hips. No invented wings, jewelry, weapons or markings. Her pose is neutral standing with arms crossed, both feet separated and fully visible, fully clothed and non-sexual, matching the reference attitude. Crisp dark outlines and flat 2D cel colors with very restrained shading. Full figure including all hair, ear tips, tail tip and both feet, centered on a portrait canvas, occupying no more than 78 percent of canvas height with generous clear margins. TRUE transparent alpha background. No floor, shadow, glow, scene, border, text, logo or additional figures. One single static drawing, no animation and no sprite sheet."""
prompts={'hz_melissa-model-s1-base':melissa_prompt,'hb_loo_loo-park-s1-base':loo_corrected,cry_id:cry_prompt}
source_mapping={
'melissa-official-285s.png':('https://www.youtube.com/watch?v=GIp3E_O_1DA',285,'official_episode_storyboard_frame','Full-body final outfit; native public preview frame.'),
'melissa-official-short-37s.png':('https://www.youtube.com/watch?v=tB5nUTSSqG4',37,'official_episode_storyboard_frame','Same full-body final outfit; portrait clip native frame.'),
'loo-loo-official-056s.png':('https://www.youtube.com/watch?v=2KlyodO-VlY',56,'official_episode_storyboard_frame','Wide overhead view, complete mascot; approximately 50px tall in native image.'),
'loo-loo-official-072s.png':('https://www.youtube.com/watch?v=2KlyodO-VlY',72,'official_episode_storyboard_frame','Front face and glove construction; lower shoe edges cropped.'),
'loo-loo-official-090s.png':('https://www.youtube.com/watch?v=2KlyodO-VlY',90,'official_episode_storyboard_frame','Front face and leg colors; feet partially cropped.'),
'crymini-official-595s.png':('https://www.youtube.com/watch?v=ga5qslLwkZo',595,'official_creator_speedpaint_storyboard_frame','Complete 2017 painted concept on the right; governing full-body reference.'),
'crymini-official-590s.png':('https://www.youtube.com/watch?v=ga5qslLwkZo',590,'official_creator_speedpaint_storyboard_frame','Same final painted concept, slightly larger; hair very near upper image boundary.')}
for a in D['assets']:
    if a['assetId']!=cry_id:
        a['canonicalContext']=a['continuity'];a['continuity']='season_1'
    a.update(id=a['assetId'],franchise='Hazbin Hotel' if a['franchise']=='hazbin' else 'Helluva Boss',category='character_base',spoilerScope='season_1',frameCoverage='full_body',runtimeStatus='reserve',addsStandaloneBase=True,newIdentity=False,accepted=True,status='accepted_candidate',inGameChecked=False,generationTool='image_gen.imagegen',prompt=prompts[a['assetId']])
    a['master']=a['masterPath'];a['export']=a['runtimePath'];a['runtime']='/'+a['runtimePath'].removeprefix('public/')
    a['files']=[stat(ROOT/a['master']),stat(ROOT/a['export'])]
    a['masterSha256']=a['files'][0]['sha256'];a['exportSha256']=a['files'][1]['sha256'];a['masterBytes']=a['files'][0]['bytes'];a['exportBytes']=a['files'][1]['bytes'];a['dimensions']=a['files'][0]['dimensions'];a['nativeMode']=a['files'][0]['mode'];a['nativeMasterPreservedByteForByte']=sha(a['nativeOutputPath'])==a['masterSha256'];assert a['nativeMasterPreservedByteForByte']
    a['visualReview']=visual(ROOT/a['master'],ROOT/a['export'])
    a['pixelExactExport']=a['visualReview']['webpDecodedRgbaEqualsMaster']
    a['fidelityNotes']=a['limitations']
    a['referenceUrls']=[s['url'] for s in a['primarySources']]
    a['sourceReferences']=[]
    for r in a['references']:
        rr=dict(r);n=Path(r['path']).name
        if n in source_mapping:
            u,t,k,note=source_mapping[n];rr.update(url=u+'&t='+str(t)+'s',sourceUrl=u,timeSeconds=t,kind=k,primary=True,coverage=note,transform='Native public storyboard cell crop only; no retouching, enhancement or invented pixels.')
        else:
            orig='public/assets/sprites/hazbin/portraits/'+('hz_melissa.png' if a['characterId']=='hz_melissa' else 'hz_crymini.png')
            rr.update(url=None,kind='historical_project_detail',primary=False,originalPath=orig,originalSha256=sha(ROOT/orig),coverage='Historical face-only detail, no body qualification.' if a['characterId']=='hz_melissa' else 'Concordant detail supplement; full body independently corroborated by the official 2017 speedpaint.',transform='Native face-only crop.' if a['characterId']=='hz_melissa' else 'Unmodified historical project cutout.')
        a['sourceReferences'].append(rr)
    a['independentReview']={'reviewer':'/root','status':'accepted_candidate','scope':'Qualified primary frames and final alpha composite visually checked; central SHA-bound report prepared by root after this handoff.','confirmation':'No obvious blocking mismatch reported by root on 2026-11-26.'}
D['status']='final_handoff'
D['counts']={'acceptedCandidates':len(D['assets']),'newCharacterBases':3,'newCoveredCatalogueIdentities':3,'newCatalogueIdentities':0,'newDrawings':3,'deliverableImageFiles':6,'deliverableImageBytes':sum(f['bytes'] for a in D['assets'] for f in a['files']),'newAnimationCycles':0,'newPlayableKits':0}
D['baseline']={'edition':'V9','standaloneBases':109,'idsWithoutBase':100,'identitiesWithoutBase':99,'source':'docs/standalone/production-v9/delivery-register.json'}
D['scope']='Trois nouvelles bases statiques entières pour des identités déjà présentes au catalogue. Exports prêts pour réserve ; runtime, galerie globale, bible et commits gérés hors de ce handoff.'
D['countingNotes']=['Les références et les tentatives écartées ne sont pas des dessins livrés.','Aucune animation ni kit jouable ajouté.','Crymini compte comme base complète de son incarnation historique 2017, sans qualification de son modèle dans les épisodes.','Le filtre season_1 de Crymini représente uniquement un plafond de spoilers compatible avec la galerie.']
D['newRefusals']=[];D['historicalRefusalsRetried']=[]
D['relatedReports']={'sourceAudit':'docs/standalone/production-v10/characters-reference-audit.json','imageQa':'docs/standalone/production-v10/characters-qa.json','prompts':'docs/standalone/production-v10/characters-prompts.json'}
D['discardedAttempts'][0]['prompt']=loo_initial
D['discardedAttempts'][0]['referencePaths']=[str((REF/n).relative_to(ROOT)) for n in ['loo-loo-official-056s.png','loo-loo-official-072s.png','loo-loo-official-090s.png']]
# Record public metadata without keeping unrelated playlist/storyboard downloads in the repository.
provenance=[]
for fn in ['hh-ep2-preview-meta.json','melissa-velvette-meta.json','prime-looloo-date-meta.json','viv-teenager-meta.json']:
    p=SCRATCH/fn
    if p.exists():
        meta=json.loads(p.read_text());provenance.append({'sourceMetadataFilename':fn,'sourceMetadataSha256':sha(p),'metadata':meta})
save_json(REF/'primary-video-metadata.json',{'retrievedDate':'2026-11-26','method':'Public YouTube watch page ytInitialPlayerResponse metadata and playerStoryboardSpecRenderer, without authentication bypass.','videos':provenance})
D['provenanceMetadata']={'path':str((REF/'primary-video-metadata.json').relative_to(ROOT)),'sha256':sha(REF/'primary-video-metadata.json')}
qa={'edition':'V10','scope':'Character asset native preservation, alpha, framing, exact lossless WebP export, and own/independent visual review; excludes runtime/browser tests.','status':'passed','newBases':3,'imageFiles':6,'imageBytes':D['counts']['deliverableImageBytes'],'assets':[{'id':a['id'],'masterSha256':a['masterSha256'],'exportSha256':a['exportSha256'],'nativeMasterPreservedByteForByte':a['nativeMasterPreservedByteForByte'],'visualReview':a['visualReview'],'limitations':a['limitations']} for a in D['assets']],'testsRun':[],'testsNote':'No implementation unit tests added for static asset exports. All three master/export pairs decoded and compared as exact RGBA pixels.','fidelityOneToOneCertified':False}
save_json(DOC/'characters-qa.json',qa)
save_json(DOC/'characters-prompts.json',{'edition':'V10','tool':'image_gen.imagegen','transparent_background':True,'accepted':[{'id':a['id'],'nativeOutputPath':a['nativeOutputPath'],'sha256':a['masterSha256'],'prompt':a['prompt'],'referencePaths':[r['path'] for r in a['sourceReferences']],'note':'Loo Loo final is a correction: first input was the discarded native cutout, followed by official frames 72s, 90s, 56s.' if a['characterId']=='hb_loo_loo' else None} for a in D['assets']],'discarded':D['discardedAttempts']})
save_json(DOC/'characters-handoff.json',D)
print(json.dumps({'status':D['status'],'counts':D['counts'],'assets':[{'id':a['id'],'sha256':a['masterSha256'],'exportSha256':a['exportSha256'],'bytes':sum(f['bytes'] for f in a['files'])} for a in D['assets']]},ensure_ascii=False,indent=2))
