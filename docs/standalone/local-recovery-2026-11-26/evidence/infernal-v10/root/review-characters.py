from pathlib import Path
import json,hashlib,shutil,copy
from PIL import Image
root=Path('/workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager');here=root/'docs/standalone/production-v10';tmp=Path('/tmp/infernal-v10/characters')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def ref(name,url,role):
 p=root/'production/v10/characters/references'/name
 if not p.exists():
  p=root/'production/v10/references'/name
  if not p.exists():shutil.copy2(tmp/name,p)
 return {'path':str(p.relative_to(root)),'sha256':sha(p),'dimensions':list(Image.open(p).size),'url':url,'kind':'official_video_public_storyboard','role':role,'viewed':True,'method':'Native public preview cell; no recovered HD detail is claimed.'}
items=[
 ('hz_melissa-model-s1-base','hz_melissa','ed6f0996b6caa7d8fc3ca5c146f690ee54f39512133466f6c247453d48e36e58',[
 ref('melissa-official-short-37s.png','https://www.youtube.com/watch?v=tB5nUTSSqG4&t=37s','Prime Video — tenue de mannequin complète'),
 ref('melissa-official-285s.png','https://www.youtube.com/watch?v=GIp3E_O_1DA&t=285s','Prime Video — même tenue complète dans la scène de Velvette')],
 ['Chevelure bleu-gris à queue haute, deux pointes noires, grands yeux clairs et silhouette élancée cohérents avec les plans.','Tenue rouge sans manches, ourlet clair, jambes noires et deux pieds pointus entièrement présents.','Composite gris réellement vu : alpha propre, sans fond résiduel visible.'],
 ['Cette première base représente uniquement la tenue de mannequin S1 observée ; elle ne valide pas le tee-shirt rouge/pantalon violet de l’ancien cutout.','La résolution des sources ne certifie pas les petits détails des mains, du décolleté ou des chaussures. Marge basse étroite sans coupure.']),
 ('hb_loo_loo-park-s1-base','hb_loo_loo','bbfe97eb99f391df20310493774cd0f371f9617da22bad8610ef4bc552eb7a35',[
 ref('loo-loo-official-056s.png','https://www.youtube.com/watch?v=2KlyodO-VlY&t=56s','Prime Video — mascotte entière au parc'),
 ref('loo-loo-official-072s.png','https://www.youtube.com/watch?v=2KlyodO-VlY&t=72s','Prime Video — tête et torse de la même mascotte')],
 ['Corps-pomme rouge, coiffe/feuille verte, chapeau noir à bande rouge et sourire à une dent manquante conservés.','Deux bras noirs gantés de rouge, deux jambes noires et deux chaussures rouges entières.','Le petit nez rouge ajouté au premier essai a été retiré ; composite gris et master final inspectés.'],
 ['Jambes et chaussures reposent sur un plan large de faible résolution ; les coutures des chaussures sont une simplification de jeu.','La pose de salut est adaptée, les mains ne reprennent pas exactement le geste de la cellule72s. Fidélité 1:1 non certifiée.']),
 ('hz_crymini-legacy-2017-base','hz_crymini','4a7bf397a3d4915d492ffa4a1286c61d17b350730175750e18a8f270e808f987',[
 ref('crymini-official-590s.png','https://www.youtube.com/watch?v=ga5qslLwkZo&t=590s','Vivziepop — SPEED DRAW Teenager, modèle de conception2017 entier'),
 ref('crymini-official-595s.png','https://www.youtube.com/watch?v=ga5qslLwkZo&t=595s','Vivziepop — deuxième vue du même dessin de conception')],
 ['Chevelure crème/magenta, oreilles, tenue au motif de crâne, bras croisés, grande queue magenta à pointe crème conservés.','Asymétrie des jambes sombre/claire avec bandes et taches conservée ; deux pieds entièrement visibles.','Master et composite gris inspectés ; silhouette isolée propre et sans élément du logiciel de dessin source.'],
 ['Conception historique2017, pas une apparence S1/S2 ni une promesse d’apparition future.','Source320×180 incluant l’interface du logiciel ; proportions, taches et petits traits sont redessinés.','spoilerScope season_1 sert seulement au plafond des filtres ; continuity legacy_concept_2017 indique la provenance réelle.'])]
assets=[]
for aid,identity,expected,refs,obs,limits in items:
 p=root/f'production/v10/characters/masters/{aid}.png';assert sha(p)==expected;im=Image.open(p).convert('RGBA');a=im.getchannel('A');bbox=a.point(lambda v:255 if v>=16 else 0).getbbox()
 assets.append({'id':aid,'sourceIdentityId':identity,'reviewer':'root (independent of generating agent)','acceptedForIntegration':True,'status':'accepted_with_documented_limits','nativeMasterPath':str(p.relative_to(root)),'masterSha256':expected,'dimensions':list(im.size),'alphaExtrema':list(a.getextrema()),'visibleBBoxAlpha16':list(bbox),'sourceReferences':refs,'observations':obs,'limitations':limits,'addsStandaloneBase':True,'frameCoverage':'full_body','fidelityOneToOneCertified':False,'runtimeValidated':False,'animationValidated':False})
review={'edition':'V10','date':'2026-11-26','reviewer':'root','assets':assets,'scope':'Comparaison visuelle réelle des3 masters entiers aux références primaires et composites alpha.','fidelityOneToOneCertified':False}
(here/'characters-independent-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
central=json.loads((here/'independent-review-root.json').read_text());central['assets']=[a for a in central['assets'] if a['id'] not in {b['id'] for b in assets}]+assets;central['status']='independent_visual_review_complete';central['acceptedDrawings']=len(central['assets']);assert len(central['assets'])==11;assert len({a['masterSha256'] for a in central['assets']})==11
(here/'independent-review-root.json').write_text(json.dumps(central,ensure_ascii=False,indent=2)+'\n')
print('11 independent reviews complete; final character master hashes confirmed.')
