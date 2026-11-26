import json, hashlib, datetime
from pathlib import Path
repo=Path('/workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager')
run=Path('/tmp/infernal-v9/browser/browser-qa-run.json')
r=json.loads(run.read_text())
assert r['status']=='passed_automated_browser_checks_pending_visual_review'
assert len(r['checks'])==99, len(r['checks'])
assert all(c['passed'] for c in r['checks'])
assert not any(r[k] for k in ['consoleErrors','pageErrors','failedRequests','httpErrors'])
assert r['runtimeFilesBefore']==r['runtimeFilesAfter']
for item in r['runtimeFilesAfter']:
    assert hashlib.sha256((repo/item['path']).read_bytes()).hexdigest()==item['sha256'], item['path']
assets=[
    ('lute-post-finale-s1-ready',['wardrobe selection','training combat','gallery preview'], 'season_1'),
    ('stolas-grimoire-closed',['gallery preview'], 'season_1'),
    ('hb_moxxies_mother-portrait-s2',['gallery preview'], 'season_2'),
    ('loo-loo-thing-plush',['gallery preview'], 'season_1'),
    ('bee-lounge-bar-stool',['training arena prop','gallery preview'], 'season_1'),
    ('bee-lounge-honeycomb-divider',['training arena prop','gallery preview'], 'season_1'),
    ('bee-lounge-s1-room',['arena selection thumbnail','training arena background'], 'season_1'),
]
reviewed=['desktop-bee-stage','mobile-fight']+[f'desktop-gallery-{i}' for i in range(6)]+[f'mobile-gallery-{i}' for i in range(6)]+['mobile-gallery-art-0','mobile-gallery-art-1','mobile-gallery-art-5']
by_label={s['label']:s for s in r['screenshots']}
visual=[]
for label in reviewed:
    s=by_label[label]
    p=Path(s['internalPath'])
    visual.append({**s,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
r['schemaVersion']=1
r['status']='passed'
r['summary']='99 contrôles navigateur réussis sur Chromium réel : sélection de Lute et du salon de Beelzebub, tenue statique pendant les actions observées, fond et deux accessoires actifs, six aperçus galerie et filtrage S1/S2 sur desktop et mobile émulé. Aucun débordement horizontal, asset manquant, échec réseau, message console.error ou exception JavaScript observé. Revue visuelle des captures effectuée ; fichiers runtime stables pendant le passage.'
r['checkedAssetIds']=[a[0] for a in assets]
r['assetEvidence']=[{'id':id,'observedIn':scenes,'viewports':['desktop','mobile'],'spoilerScope':scope,'result':'passed'} for id,scenes,scope in assets]
r['viewports']=[{'name':'desktop','width':1440,'height':1000,'deviceScaleFactor':1,'isMobile':False,'hasTouch':False},{'name':'mobile','width':390,'height':844,'deviceScaleFactor':1,'isMobile':True,'hasTouch':True,'physicalDevice':False}]
r['counts']={'automatedChecks':len(r['checks']),'failedChecks':0,'checkedAssetIds':len(assets),'newGalleryEntries':6,'galleryEntriesReported':106,'screenshots':len(r['screenshots']),'visuallyReviewedCaptures':len(visual),'consoleErrors':0,'pageErrors':0,'httpErrors':0,'failedRequests':0}
r['visualReview']={'status':'passed','reviewer':'QA agent, manual inspection of browser captures','reviewedCaptures':visual,'observations':['Les six nouveaux dessins sont affichés sur fond sombre dans la galerie, avec titre et bouton de fermeture lisibles aux deux formats.','Les captures mobiles de l’article complet peuvent inclure le bandeau fixe ; les captures ciblées supplémentaires confirment que Lute, le grimoire et la cloison sont affichés entièrement après défilement.','Lute conserve sa pose statique pendant les actions ; ses ailes, son bras manquant et l’anneau porté restent visibles. Aucune nouvelle animation n’est revendiquée.','Le tabouret est décalé à gauche et vers le haut ; les deux cloisons du décor restent cadrées. La cloison détourée montre huit rangées et 38 ouvertures.','Les boutons Réinitialiser, Music, Pause et Quit se répartissent sur plusieurs lignes en mobile et restent à l’intérieur de la largeur disponible.','Le décor conserve l’illustration entière avec le mode contain existant. Les bandes assorties autour du fond, plus visibles en mobile, sont intentionnelles.']}
r['responsiveCorrection']={'file':'src/styles/pentagram-arena.css','selector':'@media (max-width: 700px) .arena-fight-actions','change':'Enable flex-wrap and min-width:0 on the control row; use flex:1 1 120px and min-width:0 on its buttons.','result':'Every fight action button fits within the 390px viewport; document horizontal overflow remains zero.'}
r['limitations']=['Local Vite development runtime only; this is not a production-deployment verification.','The mobile pass uses Chromium touch emulation at 390×844, not physical-device testing.','Coverage is the seven V9 delivered assets, their six gallery entries, season filtering and the described training flow; the full historical catalogue and all game modes were not revalidated.','No frame animation, performance profiling, exhaustive combat balance test, or exact canon-fidelity certification is implied.']
r['harness']={'internalPath':'/tmp/infernal-v9/browser/run-browser-qa.cjs','sha256':hashlib.sha256(Path('/tmp/infernal-v9/browser/run-browser-qa.cjs').read_bytes()).hexdigest(),'interactions':'UI navigation, keyboard input and touch input only; no game-state injection. Input checks wait through recovery before the next requested action.'}
r['finalizedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
out=repo/'docs/standalone/production-v9/browser-qa.json'
out.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'path':str(out),'status':r['status'],'checks':len(r['checks']),'checkedAssetIds':r['checkedAssetIds'],'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()},ensure_ascii=False,indent=2))
