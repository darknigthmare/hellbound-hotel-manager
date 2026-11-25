# Vague G — revue des images, du placement et des preuves

Date : **25 novembre 2026**. Périmètre : **21 dessins retenus, 45 fichiers images de production**, avec trois arènes sélectionnables et douze dessins en réserve. Cette revue accompagne la [livraison G](DELIVERY_WAVE_G_2026-11-25.md) sur la branche existante `feat/infernal-versus-assets-20261124`, dans la [PR #8 encore ouverte](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8).

**Les contrôles de fichiers, de données et de géométrie statique sont concluants dans leur périmètre. Aucun défaut P1/P2 n’a été relevé lors de la revue indépendante du code et de l’inventaire G. Le contrôle dans un navigateur n’a pas été exécuté et la fidélité 1:1 n’est pas certifiée.**

## 1. Périmètre exact et absence de nouveau gameplay

Le lot contient cinq bases de personnages, six bases d’ennemis, une fléchette isolée, trois fonds d’arènes et six accessoires. Chaque base est une seule image READY. Aucune pose d’attaque, animation, histoire, technique, finisher ou nouveau kit jouable n’a été ajouté dans G.

| Registre | Résultat vérifié | Preuve |
| --- | --- | --- |
| Catalogue des réserves | 12 identifiants uniques ; 5 bases de personnages, 6 bases d’ennemis, 1 projectile | [Catalogue G](../../art/infernal-versus/production/reserve-assets-wave-g-2026-11-25.json) |
| Fichiers des réserves | 12 PNG et 12 WebP présents ; empreintes, dimensions et bornes alpha cohérentes | [Export G](../../art/infernal-versus/production/export-wave-g-2026-11-25.json) |
| Ressources actives | 420 références présentes ; aucune référence manquante | [Couverture](ASSET_COVERAGE.json) |
| Combattants et VFX actifs | 43 jouables, 14 images VFX et 28 affectations ; registres conservés par rapport à la base G | [QA runtime G](QA_RUNTIME_WAVE_G_2026-11-25.json) |
| Arènes | 25 anciennes conservées et 3 ajoutées, soit 28 arènes à trois plans | [Registre des arènes](../../src/lib/pentagram-stages.ts) |

Les identités `hb_vassago`, `hb_wally_wackford`, `hb_barbie_wire`, `hb_martha`, `hb_mrs_mayberry`, `hb_agent_one`, `hb_agent_two`, `hb_cletus`, `hb_collin`, `hb_keenie` et `hb_robo_fizz` correspondent aux identités existantes du projet. Les nouveaux exports de réserve ne sont pas utilisés par le roster actif. La fléchette n’est associée à aucune attaque. Le script d’audit maintient ces réserves dans un compteur séparé des actifs.

## 2. Images, transparence et exports

Les **21 masters PNG finaux** sont conservés sans transformation au stade de l’export. Les **21 WebP plein format** reproduisent leurs pixels, et les **trois miniatures** sont des dérivés distincts. Le manifeste donne les dimensions, modes de couleur, empreintes SHA-256, bornes alpha et statuts de chaque fichier. Les 45 empreintes ont été comparées aux fichiers présents lors de la revue indépendante ; les douze paires de réserve ont également été comparées directement pixel par pixel.

Les trois fonds sont des images RGB de **1672 × 941**. Les onze bases, les six accessoires et la fléchette possèdent une vraie couche alpha. Le seuil **alpha ≥ 16/255** sert à mesurer le contenu visible et ses marges ; il ne désigne pas une taille minimale de seize pixels. Les dimensions natives et marges transparentes sont conservées. Le faible bruit alpha périphérique documenté sur certaines sorties reste présent dans les pixels originaux.

Les [bases de personnages](qa-wave-g-2026-11-25/static-character-bases.png), [bases d’ennemis](qa-wave-g-2026-11-25/static-enemy-bases.png) et [accessoires](qa-wave-g-2026-11-25/static-props.png) sont disponibles sous forme de planches statiques de contrôle. Ces planches ne sont ni de nouveaux dessins de production ni des captures du jeu.

## 3. Sources, incarnations et limites de fidélité

Les [preuves des personnages](../../art/infernal-versus/production/characters-wave-g-2026-11-25.json), [des décors](../../art/infernal-versus/production/stages-wave-g-2026-11-25.json) et [du projectile](../../art/infernal-versus/production/projectiles-wave-g-2026-11-25.json) conservent les URL officielles, les repères temporels, les prompts et les limites. Les références principales sont des vignettes publiques de prévisualisation issues des épisodes officiels, inspectées à **320 × 180 pixels**. Les repères temporels sont approximatifs et ne constituent pas une analyse image par image de l’épisode intégral.

Les incarnations retenues sont distinguées : Barbie Wire en forme imp de *Unhappy Campers*, Martha en forme sinner d’*Apology Tour*, Mrs Mayberry en forme sinner cliente de *Murder Family*. Les anciens portraits du projet sont identifiés comme références complémentaires dont la provenance officielle n’est pas certifiée. Les sources complémentaires autorisées ou secondaires restent qualifiées comme telles dans le catalogue.

| Élément | Limite documentée |
| --- | --- |
| Bases READY | Poses neutres de présentation adaptées au jeu ; détails fins reconstruits depuis de petits aperçus |
| Martha et Mrs Mayberry | Jambes, pieds ou bas de vêtement partiellement renseignés par les portraits historiques du projet |
| Fléchette D.H.O.R.K.S. | Objet visible vers 04:40 de *The Full Moon* ; pointe masquée dans la référence, terminaison simple reconstruite |
| Trois arènes | Caméra frontale, espace de duel élargi, accessoires détachés et repositionnés pour la simulation AU |
| Flèche C.H.E.R.U.B. et shuriken D.H.O.R.K.S. | Reportés : contour précis non établi ; aucune génération générique de remplacement |

Les images retenues sont des adaptations fondées sur des références. Les observations précédentes ne certifient ni une correspondance trait pour trait, ni une échelle canonique, ni une fidélité animée dans le jeu.

## 4. Revue CSS et reconstruction des décors

Le [CSS d’arène](../../src/styles/pentagram-arena.css) conserve les masters entiers avec `background-size: contain` et un alignement au centre en bas. Les règles G sont limitées aux trois nouveaux identifiants et à leur ajout dans le groupe de cadrage existant de F. Les valeurs appliquées aux anciens décors n’ont pas changé. Les six corrections de marge basse correspondent aux dimensions et bornes alpha des fichiers exportés.

Les accessoires utilisent un repère commun fondé sur les dimensions réelles de l’image contenue. La hauteur du conteneur reste définie, et les accessoires sont placés au niveau 1, avant les combattants au niveau 2. Leur ratio natif n’est pas modifié. Sans les unités de conteneur requises, le fond complet reste le repli prévu et les couches additionnelles sont masquées ; ce comportement n’a pas été exécuté dans un navigateur pendant G.

L’agent de contrôle a reconstitué les règles avec Pillow à trois tailles. Les dimensions ci-dessous sont des **hypothèses de boîtes de contenu**, sans mesure DOM. Les unités de conteneur sont supposées disponibles et la parallaxe vaut zéro.

| Cas | Boîte d’arène supposée | Viewport supposé | Fond contenu : x / y / largeur / hauteur |
| --- | --- | --- | --- |
| Bureau | 1200 × 520 | 1440 × 900 | 138,02 / 0 / 923,95 / 520 |
| Portrait | 330 × 300 | 390 × 844 | 10 / 125,53 / 310 / 174,47 |
| Paysage court | 730 × 242 | 844 × 390 | 150,00 / 0 / 429,99 / 242 |

**Neuf compositions ont été inspectées ; 18 boîtes visibles d’accessoires sur 18 restent entièrement dans l’illustration du décor.** Les calculs exacts et les images raster arrondies concordent. Les accessoires se trouvent derrière les silhouettes, sans déformation de leurs ratios. Les [neuf compositions réunies](qa-wave-g-2026-11-25/static-stage-contact-sheet.png), le [rapport détaillé](qa-wave-g-2026-11-25/STATIC_STAGE_QA.md), les [mesures et empreintes](qa-wave-g-2026-11-25/static-stage-measurements.json) et le [script de reproduction](qa-wave-g-2026-11-25/static-stage-qa.py) permettent d’examiner ce résultat.

### Jardinière de la maison

La jardinière indépendante est centrée sous la fenêtre rectangulaire dans les trois formats. Les fleurs recouvrent le bas des vitres et le bac se place sous le rebord. Le fond final n’a plus de jardinière peinte dans la zone contrôlée : **une seule jardinière est visible**. La comparaison locale du WebP avec le master final donne un écart RGB absolu moyen nul dans cette zone. En portrait, la boîte visible de l’objet mesure environ **35,1 × 10,2 px** ; sa petite taille est documentée, sans erreur d’alignement observée. Voir les [détails de placement](qa-wave-g-2026-11-25/static-planter-alignment.png).

### Limites de présentation observées

Dans le cas paysage **730 × 242**, l’illustration s’étend approximativement de x = 150 à x = 580. Les combattants de référence, Vortex et Glitz, restent ancrés à **22 % et 78 % de toute l’arène**. Leurs silhouettes dépassent donc de l’illustration de **52,16 px à gauche** et **46,53 px à droite**, sur les bandes latérales unies. Les accessoires restent dans l’illustration. Ce décalage entre le repère du fond et celui des combattants est une limite constatée ; aucun ajustement supplémentaire n’est déclaré dans cette revue.

Dans le cas portrait **330 × 300**, une bande unie de **125,53 px** subsiste au-dessus du fond. Les combattants et les accessoires restent dans la partie illustrée. Ces bandes résultent du cadrage complet par `contain` et leur présentation dans l’interface entière reste à évaluer.

Les compositions ne couvrent pas les extrêmes de parallaxe, les transitions, le HUD, les commandes tactiles, les ombres CSS, les effets d’attaque ou les transformations animées. Elles ne prouvent ni le déroulement d’un combat ni l’absence de chevauchement avec l’interface.

## 5. QA locale du code et du paquet

Le [rapport runtime G](QA_RUNTIME_WAVE_G_2026-11-25.json) et le [journal brut](qa-wave-g-2026-11-25/runtime-command-output.txt) indiquent :

- `npm run qa` : code de sortie **0** ;
- **44 suites, 376 tests** réussis ;
- contrôle de types et lint réussis ;
- builds manager et standalone réussis ;
- **1 013 fichiers standalone et 1 013 empreintes vérifiées**, total **615 498 785 octets** ;
- **420 références actives présentes**, sans référence manquante, et **12 réserves / 24 fichiers** vérifiés séparément.

La revue indépendante a confirmé l’absence de modification des registres de combattants, d’attaques et de poses, la conservation des anciennes arènes et l’isolation des règles CSS G. `git diff --check` n’a signalé aucune erreur. Ces résultats sont des contrôles locaux ; aucun succès de CI G sur la PR n’est affirmé.

## 6. Vérification de la bible de production

Le [rapport du classeur](QA_WORKBOOK_WAVE_G_2026-11-25.json) valide les données de [la bible V2](INFERNAL_VERSUS_BIBLE_V2.xlsx) :

- **23 feuilles**, dont les onze feuilles historiques V1 conservées dans leur ordre ; leurs XML et cellules décodées sont inchangés ;
- **212 formules**, toutes dotées d’un cache, avec **212 résultats contrôlés indépendamment** et aucune divergence relevée ;
- **6 017 cellules** des tables courantes comparées aux données du jeu et des réserves ;
- douze réserves distinctes, vingt-quatre fichiers présents, aucune nouvelle identité de réserve dans les histoires ou le roster actif ;
- trois nouvelles lignes d’arènes et des totaux actifs cohérents avec la couverture.

SHA-256 du classeur audité : `09e94c83a17c868ca3438f57c5d2078bd2a38b59159ece832ce9b1fee8228e6d`.

Le contrôle indépendant lit les données et les XML, et évalue les formules présentes. Une revue visuelle complémentaire a rendu et inspecté quatre plages avec Artifact Tool : [compteurs](qa-wave-g-2026-11-25/bible-guide.png), [trois arènes](qa-wave-g-2026-11-25/bible-stages.png), [réserves](qa-wave-g-2026-11-25/bible-reserves.png) et [sources](qa-wave-g-2026-11-25/bible-sources.png). Elle ne prétend pas couvrir visuellement toutes les cellules. Aucun recalcul dans Excel ou LibreOffice n’a été exécuté. Les onze registres V1 restent des données historiques et ne remplacent pas les compteurs actuels.

## 7. Contrôle navigateur non exécuté

Le lanceur `/usr/bin/chromium` vise **`/usr/lib/chromium/chromium`, absent de l’environnement**. Le binaire Chromium du bundle Playwright est également absent. Aucune page ou serveur HTTP local n’a été lancé pour cette recette ; aucune capture de jeu ni mesure DOM n’a été obtenue. Le [rapport navigateur G](qa-wave-g-2026-11-25/browser-review.json) conserve l’échec de lancement, et le [rapport runtime](QA_RUNTIME_WAVE_G_2026-11-25.json) le distingue de la QA automatisée réussie.

Les listes vides de requêtes, d’erreurs console ou de contrôles d’arène dans ce constat signifient **absence d’exécution**, pas absence démontrée d’erreurs. Restent à contrôler dans un navigateur fonctionnel : la sélection des trois arènes, leur composition dans l’interface complète, les bandes de ratio, les déplacements et la parallaxe, le HUD, les commandes, les requêtes d’assets et la console.

Le résultat de cette revue est donc une validation de l’inventaire, des exports, des données et des neuf compositions statiques dans les hypothèses exposées. La recette interactive et la certification de fidélité canonique 1:1 restent non établies.
