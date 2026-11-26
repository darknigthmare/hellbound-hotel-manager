from pathlib import Path
import json,copy,hashlib,shutil
from PIL import Image
root=Path('/workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager');here=root/'docs/standalone/production-v10'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def save(p,d):p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
review=json.loads((here/'costumes-independent-review.json').read_text());jobs=json.loads((here/'root-generation.json').read_text());byhash={a['masterSha256']:a for a in jobs};dest=root/'production/v10/references';dest.mkdir(parents=True,exist_ok=True)
for a in review['assets']:
 a['id']=byhash[a['masterSha256']]['id'];a['nativeMasterPath']=byhash[a['masterSha256']]['master']
 for ref in a['sourceReferences']:
  orig=Path(ref['path']);orig=orig if orig.is_absolute() else root/orig;target=dest/orig.name
  if target.exists():assert sha(target)==sha(orig)
  else:shutil.copy2(orig,target)
  assert ref['sha256']==sha(target);ref['path']=str(target.relative_to(root))
save(here/'costumes-independent-review.json',review)
observations={
'asmodeus-bedroom-s2-room':(['Lit circulaire rose à gauche, cheminée cyan, portes capitonnées bleues et miroir en flamme conservés.','Console et candélabre retirés du fond pour former deux couches indépendantes.','Contexte des appartements confirmé par le plan officiel Oops à 10 s.'],['Perspective et petits motifs redessinés. Le combat et les déplacements sont une adaptation AU.']),
'asmodeus-bedroom-console':(['Plateau ondulé sombre, trois tiroirs à bordure rose/cuivrée et trois pieds recourbés visibles.','Le détail frontal des tiroirs est corroboré par la seconde planche du même décor.','Le vrai composite alpha sur fond gris est propre ; tous les pieds et bords sont entiers.'],['La perspective est simplifiée pour isoler le meuble ; échelle et raccord au candélabre à contrôler en jeu.']),
'asmodeus-bedroom-candelabrum':(['Trois bougies violettes non allumées : centrale haute, gauche intermédiaire, droite basse.','Pied et branches asymétriques rouges conservés ; contour entier.','Le vrai composite alpha sur fond gris est propre, sans halo visible.'],['Reflets, épaisseur des branches et contour des bougies redessinés ; placement sur le plateau à vérifier en jeu.']),
'blitz-sinsmas-dream-s2-room':(['Cheminée et fauteuils latéraux, quatre bas S/V/B/L et souvenirs familiaux présents.','La scène officielle à 850 s confirme la vision familiale de Blitzø, avec Stolas, Octavia et Loona.','Le globe au sapin a été retiré du fond ; son emplacement reste libre sur le manteau.'],['Ce lieu est une vision imaginée, pas un domicile réel établi. Lumière et ornements redessinés.']),
'blitz-sinsmas-tree-snowglobe':(['Globe ambré, petit sapin vert, cadeaux rouges et socle rouge conservés.','Le contour entier et le vrai composite alpha sur fond gris ont été inspectés.'],['Les ornements internes sont interprétés depuis un détail de 120×105 pixels. Reflets et forme des cadeaux ne sont pas certifiables 1:1. Le verre ambré est peint, sans réfraction dynamique.'])}
viewed={'jasper-206-paint-00007.jpg','jasper-206-paint-00003.jpg','jasper-212-00005.jpg','asmodeus-candelabrum-crop.png','sinsmas-tree-snowglobe-crop.png','oops-official-10s.png','sinsmas-official-850s.png'}
env=json.loads((here/'environment-handoff.json').read_text());envreviews=[]
for a in env['assets']:
 p=root/a['master'];im=Image.open(p).convert('RGBA');al=im.getchannel('A');refs=[]
 for rr in a['sourceReferences']:
  if Path(rr['path']).name not in viewed:continue
  rr=copy.deepcopy(rr);assert sha(root/rr['path'])==rr['sha256'];rr['viewed']=True;refs.append(rr)
 assert refs,a['id'];obs,limits=observations[a['id']]
 envreviews.append({'id':a['id'],'reviewer':'root (independent of generating agent)','status':'accepted_with_documented_limits','acceptedForIntegration':True,'nativeMasterPath':a['master'],'masterSha256':sha(p),'dimensions':list(im.size),'mode':Image.open(p).mode,'alphaExtrema':list(al.getextrema()),'visibleBBoxAlpha16':list(al.point(lambda v:255 if v>=16 else 0).getbbox()),'sourceReferences':refs,'observations':obs,'limitations':limits+['Fidélité 1:1 non certifiée. La revue visuelle ne valide pas encore le placement et le comportement dans le jeu.'],'fidelityOneToOneCertified':False,'addsStandaloneBase':False,'runtimeValidated':False,'animationValidated':False})
envout={'edition':'V10','date':'2026-11-26','reviewer':'root','assets':envreviews,'sourceHandoffSha256':sha(here/'environment-handoff.json'),'scope':'Comparaison visuelle réelle des cinq masters aux planches primaires, cellules officielles et composites alpha.','fidelityOneToOneCertified':False}
save(here/'environment-independent-review.json',envout)
central={'edition':'V10','date':'2026-11-26','status':'awaiting_character_handoff','scope':'Revues croisées par empreinte des masters réellement inspectés.','assets':review['assets']+envreviews,'rejectedCandidates':review['rejectedCandidates'],'fidelityOneToOneCertified':False}
save(here/'independent-review-root.json',central)
print('8 independently reviewed assets recorded; costume references persisted.')
