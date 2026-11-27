"""Recover V15 static art and build its auditable catalogue records, without editing pixels."""
from pathlib import Path
from datetime import datetime, timezone
from hashlib import sha256
import json

ROOT = Path(__file__).resolve().parents[3]
DOCS = ROOT / 'docs/standalone/production-v15'
REFERENCE = 'production/v15/characters/references/'
QA = {a['id']: a for a in json.loads((DOCS / 'image-qa.json').read_text())}
RECOVERED = json.loads((DOCS / 'recovered-portrait-handoff.json').read_text())
ROO = json.loads((DOCS / 'roo-handoff.json').read_text())
QUEEF = json.loads((DOCS / 'queef-independent-review.json').read_text())
DATE = '2026-11-27'


def dump(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def source(name, url, kind, title, primary=True):
    file = ROOT / REFERENCE / name
    return {'path': REFERENCE + name, 'sha256': sha256(file.read_bytes()).hexdigest(), 'bytes': file.stat().st_size, 'url': url, 'kind': kind, 'title': title, 'primary': primary, 'visuallyInspected': True}


sources = {
    'hb_queef-creator-collection': [
        source('queef-official-creator-collection.png', 'https://www.stylishoccult.com/products/fizz-oversized-dog-t-shirt-blue', 'official_merchandise', 'Creator Collection, Amanda Heard · Fizz Oversized Quieve T-Shirt'),
    ],
    'hz_roo-creator-concept-2019-portrait': [
        source('roo-creator-concept-2019-secondary-reproduction.jpg', 'https://comicbook.com/tv-shows/news/hazbin-hotel-creator-teases-a-long-awaited-big-bad-that-sets-up-a-huge-change/', 'secondary_reproduction_of_attributed_creator_art', 'Reproduction secondaire du concept attribué à Vivienne Medrano, 2019', primary=False),
    ],
    'hz_top_hat_demon-pilot-portrait': [
        source('top-hat-demon-official-680s.png', 'https://www.youtube.com/watch?v=Zlmswo0S0e0&t=680s', 'official_episode_or_clip', 'Vivziepop · Hazbin Hotel PILOT · séquence 666 News, 680 s'),
    ],
    'hz_eve-storybook-seated-silhouette': [
        source('eve-official-uk-55s.png', 'https://www.youtube.com/watch?v=mmO6WN6-6s8&t=55s', 'official_episode_or_clip', 'Prime Video UK & IE · ouverture S1, 55 s'),
        source('eve-official-56s.png', 'https://www.youtube.com/watch?v=I0tobM9b_9I&t=56s', 'official_episode_or_clip', 'Prime Video · The First 2 Minutes, 56 s'),
        source('eve-existing-cutout-secondary.png', 'https://github.com/darknigthmare/hellbound-hotel-manager/blob/0ce3b069e738/public/assets/sprites/hazbin/portraits/hz_eve.png', 'historical_repository_cutout', 'Découpe historique du dépôt, origine détaillée non revérifiée', primary=False),
    ],
    'hz_lilith-storybook-standing-silhouette': [
        source('lilith-adam-official-uk-40s.png', 'https://www.youtube.com/watch?v=mmO6WN6-6s8&t=40s', 'official_episode_or_clip', 'Prime Video UK & IE · ouverture S1, Lilith à droite, 40 s'),
        source('lilith-adam-official-40s.png', 'https://www.youtube.com/watch?v=I0tobM9b_9I&t=40s', 'official_episode_or_clip', 'Prime Video · The First 2 Minutes, Lilith à droite, 40 s'),
        source('lilith-adam-official-42s.png', 'https://www.youtube.com/watch?v=I0tobM9b_9I&t=42s', 'official_episode_or_clip', 'Prime Video · The First 2 Minutes, Lilith à droite, 42 s'),
    ],
}

metadata = {
    'hb_queef-creator-collection': dict(name='Queef · Creator Collection, Amanda Heard', identity='hb_queef', franchise='Helluva Boss', kind='support_base', subtype='support_base', continuity='official_merchandise_undated', scope='season_2', frame='full_body', adds=True, reference='Motif entier du produit officiel Creator Collection d’Amanda Heard ; incarnation graphique de produit dérivé, non modèle d’épisode.', notes=QUEEF['limits'] + ['Le produit et son attribution Amanda Heard ont été revérifiés sur la page officielle le 27 novembre 2026.'], observations=QUEEF['identityAndSilhouette']['observations']),
    'hz_roo-creator-concept-2019-portrait': dict(name='Roo · concept 2019 · portrait', identity='hz_roo', franchise='Hazbin Hotel', kind='narrative_archive', subtype='character_portrait', continuity='legacy_concept_2019', scope='season_2', frame='bust', adds=False, reference='Concept attribué à Vivienne Medrano, 2019 ; reproduction secondaire inspectée. Le rôle de Roo dans la série et les théories sur Eve/Lilith ne sont pas établis par cette image.', notes=ROO['fidelityNotes'], observations=['Visage pâle incliné, grand chapeau à damier, chevelure rouge, langue ramifiée et grands rameaux noirs correspondent à la composition du concept inspecté.', 'Portrait complet du haut du corps, sans jambes ajoutées ; aucune attribution à une saison numérotée.']),
    'hz_top_hat_demon-pilot-portrait': dict(name='Top Hat Demon · pilote 2019 · portrait', identity='hz_top_hat_demon', franchise='Hazbin Hotel', kind='narrative_archive', subtype='character_portrait', continuity='pilot_legacy', scope='season_1', frame='bust', adds=False, reference='Hazbin Hotel PILOT, séquence 666 News vers 680 s : cyclope à tête compacte, épaules grises, gants blancs et geste pointé.', notes=RECOVERED['assets'][0]['visualQa']['limits'], observations=['La tête compacte, le très grand œil blanc, les touffes blanches, la petite marque magenta, le sourire, les épaules grises et le doigt pointé reprennent le personnage de la scène officielle.', 'Premier candidat à tête trop haute archivé ; le portrait corrigé est seul livré et compté.']),
    'hz_eve-storybook-seated-silhouette': dict(name='Eve · silhouette assise du récit S1', identity='hz_eve', franchise='Hazbin Hotel', kind='narrative_archive', subtype='narrative_silhouette', continuity='season_1_storybook', scope='season_1', frame='full_body', adds=False, reference='The Story of Hell, ouverture S1 : silhouette assise d’Eve à gauche de l’arbre. La scène officielle atteste cette incarnation narrative, sans établir de modèle détaillé actuel.', notes=RECOVERED['assets'][1]['visualQa']['limits'] + ['Qualification finale : archive narrative. Cette silhouette entière n’est pas comptée comme base détaillée autonome et ne ferme pas le manque de modèle de combat d’Eve.'], observations=['Pose assise entière, cheveux noirs et sous-couche grise déployée vers la gauche, bras près des genoux ; pas de face détaillée ni costume inventé.', 'Les deux scènes officielles et la découpe historique secondaire ont été comparées au master.']),
    'hz_lilith-storybook-standing-silhouette': dict(name='Lilith · silhouette debout du récit S1', identity='hz_lilith', franchise='Hazbin Hotel', kind='narrative_archive', subtype='narrative_silhouette', continuity='season_1_storybook', scope='season_1', frame='full_body', adds=False, reference='The Story of Hell, ouverture S1 à 40–42 s : silhouette debout de Lilith à droite d’Adam. Seule Lilith est reproduite.', notes=['Sources primaires natives 320 × 180 et 159 × 90 pixels : contours, angles du visage, proportions et extrémités redessinés, sans certification 1:1.', 'Silhouette narrative noire et grise seulement. Aucune robe, couronne, apparence actuelle détaillée ou pouvoir extrapolé.', 'Les mains, la pose et la pointe de chevelure restent des adaptations depuis la petite source ; une légère texture de génération persiste.', 'Une seule silhouette entière, avec marges significatives 180/43/179/29 pixels au seuil alpha 16 ; la marge verticale demandée de 10 % n’est pas atteinte.', 'Aucune base détaillée de Lilith n’est présente dans le registre V14, mais cette archive ne clôt pas le manque du modèle détaillé. addsStandaloneBase reste false.', 'Aucun kit, costume sélectionnable ni cycle animé ; consultation en galerie uniquement.'], observations=['Le profil vers la gauche, la grande chevelure grise en lame derrière le corps, le bras gauche plié et la posture debout reprennent la silhouette de droite dans la référence.', 'Adam et le fond de la scène sont absents ; tête, cheveux, mains et pieds simplifiés sont entièrement dans le cadre.']),
}

assets=[]
reviews=[]
for ident, info in metadata.items():
    a=dict(QA[ident])
    a.update(id=ident, name=info['name'], sourceIdentityId=info['identity'], productionIdentityId=info['identity'], franchise=info['franchise'], category=info['kind'], kind=info['kind'], subtype=info['subtype'], continuity=info['continuity'], spoilerScope=info['scope'], frameCoverage=info['frame'], accepted=True, status='accepted_with_documented_limits', runtimeStatus='reserve', eligibility='galleryOnly', runtimeUsage='Consultation statique dans la galerie ; aucun kit jouable ni cycle animé.', reference=info['reference'], references=[{k:s[k] for k in ['url','kind','title']} for s in sources[ident]], referenceUrls=list(dict.fromkeys(s['url'] for s in sources[ident])), sourceReferences=sources[ident], fidelityNotes=info['notes'], visualReview='docs/standalone/production-v15/characters-visual-review.json', imageQa='docs/standalone/production-v15/image-qa.json', addsStandaloneBase=info['adds'], newlyCoveredCatalogueIds=[info['identity']] if info['adds'] else [], newIdentity=False, newPlayableKits=0, newAnimationCycles=0, animationCycles=0, inGameChecked=False, fidelityOneToOneCertified=False, batchId='static-v15-2026-11-27', exportUrl='/' + QA[ident]['export'].removeprefix('public/'))
    if ident=='hz_roo-creator-concept-2019-portrait':
        a['references'].append({'url':'https://twitter.com/VivziePop/status/1185376557419782144','kind':'creator_primary_source_unavailable','title':'Publication originale attribuée à la créatrice · accès non obtenu'})
        a['referenceUrls'].append('https://twitter.com/VivziePop/status/1185376557419782144')
    a['reviewStatus']='operator_review_accepted' if ident=='hz_lilith-storybook-standing-silhouette' else 'independent_review_accepted'
    a['independentReviewPending']=ident=='hz_lilith-storybook-standing-silhouette'
    assets.append(a)
    reviews.append({'id':ident,'masterSha256':a['masterSha256'],'status':'accepted_with_documented_limits','reviewer':'/root/continue_characters','reviewType':'operator_review' if a['independentReviewPending'] else 'independent_recovery_review','referencePaths':[s['path'] for s in sources[ident]],'diagnostic':'docs/standalone/production-v15/diagnostics/'+ident+'.png','nativeAlphaBackgroundsInspected':['light','gray','dark'],'observations':info['observations'],'limits':info['notes'],'fidelityOneToOneCertified':False,'inGameChecked':False})

catalogue_path=ROOT/'art/infernal-versus/production/reserve-assets.json'
catalogue=json.loads(catalogue_path.read_text())
ids={a['id'] for a in assets}
previous=[a for a in catalogue['assets'] if a['id'] not in ids]
assert len(previous)==138, f'Unexpected V14 baseline gallery size: {len(previous)}'
assert all(a.get('sourceIdentityId') not in {'hb_queef','hz_eve','hz_lilith','hz_roo','hz_top_hat_demon'} for a in previous), 'Reconcile pre-existing production entry before adding V15.'
for a in assets:
    a['intendedRole']=a['runtimeUsage']
catalogue['assets']=previous+assets
if 'static-v15-2026-11-27' not in catalogue['sourceBatches']:catalogue['sourceBatches'].append('static-v15-2026-11-27')
catalogue['date']=DATE
dump(catalogue_path,catalogue)

previous_register=json.loads((ROOT/'docs/standalone/production-v14/delivery-register.json').read_text())
missing=previous_register['baseCoverageReconciliation'].get('missingCatalogueIdsAfter', [])
handoff={'schemaVersion':1,'edition':'V15','date':DATE,'status':'assets_prepared_runtime_browser_qa_pending','baselineLocalCommit':'93c2b130535a0c85973a9944b5cf635fc847b6f8','baseline':previous_register['cumulativeCounts'],'counts':{'distinctDrawings':len(assets),'recoveredDrawings':4,'newGenerationThisTurn':1,'newStandaloneBases':1,'newlyCoveredCatalogueIds':1,'narrativeArchives':4,'narrativeSilhouettes':2,'characterPortraits':2,'masterPng':5,'losslessWebp':5,'deliveredImageFiles':10,'deliveredImageBytes':sum(a['masterBytes']+a['exportBytes'] for a in assets),'newAnimationCycles':0,'newPlayableKits':0},'proposedCumulativeCounts':{**previous_register['cumulativeCounts'],'standaloneBases':115,'reserveStandaloneBases':75,'catalogueIdsWithoutStandaloneBase':94,'distinctProductionIdentitiesWithoutStandaloneBase':93,'reserveGalleryEntries':143},'assets':assets,'countingDecision':{'reason':'Les silhouettes Eve et Lilith documentent le récit S1 ; elles ne ferment pas le manque de modèle détaillé autonome. Les portraits Roo/Top Hat ne sont pas des corps entiers. Queef fournit le seul nouvel objet personnage entier autonome de soutien.','newBaseIds':['hb_queef'],'remainingFullBaseGapsAmongThisWave':['hz_eve','hz_lilith','hz_roo','hz_top_hat_demon'],'historicalEveProvisionalAddsStandaloneBaseSuperseded':True,'source':'docs/standalone/production-v15/recovered-portrait-handoff.json'},'refused':RECOVERED['refused'],'noRetryTargetIdsAdded':RECOVERED['noRetryTargetIdsAdded'],'candidateStates':[{'id':'queef-creator-collection-candidate01','status':'superseded_by_candidate02','counted':False},{'id':'hz_top_hat_demon-pilot-portrait-attempt-1','status':'head_proportion_rejected','counted':False}],'qa':{'pixelExactExports':True,'nativeAlphaThreeBackgroundsInspected':True,'inGameChecked':False,'standaloneBuildNotRunByThisAgent':True,'pending':['Parent independent review of newly generated Lilith','Current runtime gallery browser verification']},'fidelityOneToOneCertified':False}
dump(DOCS/'characters-handoff.json',handoff)
dump(DOCS/'characters-visual-review.json',{'schemaVersion':1,'date':DATE,'reviews':reviews,'fidelityOneToOneCertified':False})
dump(DOCS/'characters-references.json',{'schemaVersion':1,'date':DATE,'assets':[{'id':i,'references':s} for i,s in sources.items()],'webReverified':['https://www.stylishoccult.com/collections/creator-collection-amanda','https://www.stylishoccult.com/products/fizz-oversized-dog-t-shirt-blue'],'primaryVideoMetadata':'production/v15/characters/references/story-of-hell-uk-metadata.json'})
prompts=[json.loads((DOCS/'queef-prompt.json').read_text()),json.loads((DOCS/'roo-prompt.json').read_text()),*RECOVERED['prompts'],json.loads((DOCS/'lilith-prompt.json').read_text())]
dump(DOCS/'characters-prompts.json',{'schemaVersion':1,'date':DATE,'tool':'image_gen.imagegen','prompts':prompts})
print(json.dumps({'status':handoff['status'],'accepted':len(assets),'newStandaloneBases':1,'narrativeArchives':4,'galleryEntries':len(catalogue['assets']),'deliveredImageBytes':handoff['counts']['deliveredImageBytes']},ensure_ascii=False))
