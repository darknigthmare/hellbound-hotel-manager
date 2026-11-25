# Vague G — livraison des bases, décors et projectile

Date : **25 novembre 2026**. Projet : **Infernal Versus / Hazbin Hotel × Helluva Boss**.

**Le lot G comprend 21 dessins retenus et 45 fichiers images de production.** Il ajoute onze bases READY et une fléchette en réserve, ainsi que trois arènes sélectionnables et leurs six accessoires indépendants. Aucune animation, pose d’attaque, histoire ou nouveau kit jouable n’est ajouté.

La publication est destinée à la branche existante `feat/infernal-versus-assets-20261124`, dans la [PR #8 ouverte](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8). La base de comparaison de G est `5f50431ebac6b4e60e13d92d0958127122cd0141`. Ce document décrit les fichiers et contrôles préparés pour cette publication ; il n’attribue aucun SHA à un commit futur et n’annonce aucun résultat de CI G sur GitHub.

## Contenu livré et mode de comptage

| Groupe | Dessins retenus | Statut | Fichiers de production |
| --- | ---: | --- | ---: |
| Bases READY de personnages | 5 | Réserve, hors roster jouable | 5 PNG + 5 WebP |
| Bases READY d’ennemis | 6 | Réserve, sans comportement ni kit | 6 PNG + 6 WebP |
| Fléchette D.H.O.R.K.S. | 1 | Réserve, sans affectation d’attaque | 1 PNG + 1 WebP |
| Fonds d’arènes | 3 | Sélectionnables | 3 PNG + 3 WebP + 3 miniatures |
| Accessoires de décor indépendants | 6 | Deux par nouvelle arène | 6 PNG + 6 WebP |
| **Total G** | **21** | **12 dessins en réserve, 9 dessins de décor actifs** | **21 PNG + 21 WebP + 3 miniatures = 45** |

Les 21 PNG correspondent aux sorties finales retenues, conservées sans transformation par l’exporteur. Les 21 WebP plein format sont identiques en pixels à leurs masters ; les trois miniatures WebP sont des dérivés et sont comptées séparément. Les planches de contrôle, captures de référence, variantes non retenues et documents de preuve ne sont pas ajoutés à ces 45 fichiers. Voir le [manifeste d’export G](../../art/infernal-versus/production/export-wave-g-2026-11-25.json).

### Onze bases READY en réserve

| Identité | Incarnation retenue | Source documentée |
| --- | --- | --- |
| Vassago | Tenue du tribunal | *Mastermind*, S2E11 |
| Wally Wackford | Costume commercial avec haut-de-forme | *C.H.E.R.U.B.*, S1E4 |
| Barbie Wire | Forme imp | *Unhappy Campers*, S2E5 |
| Martha | Forme sinner | *Apology Tour*, S2E9 |
| Mrs Mayberry | Forme sinner cliente | *Murder Family*, S1E1 |
| Agent One | Tenue d’agent D.H.O.R.K.S. | *Truth Seekers*, S1E6 |
| Agent Two | Tenue d’agent D.H.O.R.K.S. | *Truth Seekers*, S1E6 |
| Cletus | Apparence C.H.E.R.U.B. | *C.H.E.R.U.B.*, S1E4 |
| Collin | Apparence C.H.E.R.U.B. | *C.H.E.R.U.B.*, S1E4 |
| Keenie | Apparence C.H.E.R.U.B. | *C.H.E.R.U.B.*, S1E4 |
| Robo Fizz | Apparence de Loo Loo Land | *Loo Loo Land*, S1E2 |

Chaque identité possède une seule nouvelle image de présentation. Les masters sont dans `art/infernal-versus/masters/base/` et les exports dans `public/assets/sprites/reserve/`. Ces bases n’augmentent ni le nombre de combattants jouables, ni les compteurs de poses actives. Les identités, sources, limites, empreintes et chemins exacts figurent dans le [catalogue des réserves](../../art/infernal-versus/production/reserve-assets-wave-g-2026-11-25.json), le [manifeste des personnages](../../art/infernal-versus/production/characters-wave-g-2026-11-25.json) et les [prompts conservés](../../art/infernal-versus/production/character-prompts-wave-g-2026-11-25.json).

### Trois arènes et six accessoires

| Arène | Fond | Accessoire médian | Accessoire proche |
| --- | --- | --- | --- |
| `spring-broken-beach` | Plage et promenade de *Spring Broken* | Deux planches de surf réunies dans un sprite | Parasol gris-lavande |
| `murder-family-house` | Maison et clairière nocturne de *Murder Family* | Jardinière sous la fenêtre | Feuillage bleu |
| `cash-circus` | Piste du cirque de Cash, *The Circus* | Balustrade à fanions rouges | Fragment d’arche à ampoules |

Les trois fonds ont des dimensions natives de **1672 × 941 pixels**. Le CSS conserve l’image entière en `contain`, alignée au centre et en bas. Les accessoires gardent leur ratio natif et utilisent le même repère que l’image contenue ; leurs marges transparentes sont intégrées au calcul de placement. Ils sont rendus derrière les combattants. La jardinière peinte dans un candidat précédent a été retirée du fond final de la maison : une seule jardinière indépendante apparaît dans les compositions de contrôle.

Les sources, adaptations de composition et fichiers retenus sont décrits dans le [manifeste des décors](../../art/infernal-versus/production/stages-wave-g-2026-11-25.json) et les [prompts des décors](../../art/infernal-versus/production/stage-prompts-wave-g-2026-11-25.json). L’enregistrement des arènes est dans [pentagram-stages.ts](../../src/lib/pentagram-stages.ts) et leur placement dans [pentagram-arena.css](../../src/styles/pentagram-arena.css).

### Un projectile isolé en réserve

La fléchette tranquillisante D.H.O.R.K.S. provient d’un aperçu officiel de *The Full Moon*, S2E8, vers **04:40**, où elle est visible derrière le cou de Cletus. Le dessin est stocké sous `art/infernal-versus/masters/projectiles/dhorks-dart.png`, avec son export `public/assets/vfx/infernal/reserve/dhorks-dart.webp`. Il n’ajoute aucune collision autonome, animation, portée, attaque ou affectation VFX. La terminaison masquée dans la référence est une reconstruction simple, explicitement documentée.

La flèche dorée C.H.E.R.U.B. et le shuriken D.H.O.R.K.S. restent **différés faute de contour suffisamment lisible**. La recherche et ses limites sont conservées dans le [manifeste des projectiles G](../../art/infernal-versus/production/projectiles-wave-g-2026-11-25.json), avec le prompt de la seule image retenue. Aucun projectile générique n’a été produit pour remplacer ces références insuffisantes.

## État du jeu et séparation des réserves

| Mesure | État après G |
| --- | ---: |
| Combattants jouables | 43 |
| Arènes sélectionnables à trois plans | 28 |
| Références de fichiers actives | 420 |
| Références actives manquantes | 0 |
| Images VFX actives | 14 |
| Affectations d’images VFX à des attaques | 28 |
| Nouveaux kits, histoires et animations dans G | 0 |
| Réserves G | 12 dessins / 24 fichiers |

Les 43 combattants, leurs registres de poses et les effets actifs sont conservés. Les trois arènes ajoutent douze références publiques actives : neuf images de décor et trois miniatures. Les douze exports de réserve sont comptés séparément. Les détails sont recalculés dans [ASSET_COVERAGE.json](ASSET_COVERAGE.json) par [audit-infernal-assets.mjs](../../scripts/audit-infernal-assets.mjs).

## Vérifications effectuées

**La commande locale `npm run qa` s’est terminée avec le code 0.** Les 44 suites et 376 tests, le contrôle de types, le lint et les builds manager et standalone ont réussi. Le paquet standalone contient **1 013 fichiers**, dont **1 013 empreintes vérifiées**, pour **615 498 785 octets**. Le [rapport QA runtime G](QA_RUNTIME_WAVE_G_2026-11-25.json) et le [journal de commande](qa-wave-g-2026-11-25/runtime-command-output.txt) constituent les preuves de ces résultats locaux.

La [bible V2](INFERNAL_VERSUS_BIBLE_V2.xlsx) comprend **23 feuilles**. Les XML des onze feuilles historiques V1 sont inchangés, les **212 formules et leurs valeurs mises en cache** ont été vérifiées indépendamment et **6 017 cellules des tables courantes** ont été comparées aux données. Les douze réserves et leurs vingt-quatre fichiers sont séparés du roster et des attaques. Empreinte SHA-256 du classeur contrôlé :

`09e94c83a17c868ca3438f57c5d2078bd2a38b59159ece832ce9b1fee8228e6d`

Voir le [rapport QA du classeur](QA_WORKBOOK_WAVE_G_2026-11-25.json). Quatre vues ciblées ont aussi été rendues avec Artifact Tool et inspectées : compteurs, nouvelles arènes, réserves et sources. Aucun rendu ni recalcul dans Excel ou LibreOffice n’est revendiqué.

## Contrôle visuel statique et limites

Neuf compositions ont été produites à partir des images et des règles CSS : trois arènes dans trois formats. À parallaxe nulle, **18 boîtes visibles d’accessoires sur 18** sont contenues dans l’illustration du décor. La jardinière est unique et alignée sous la fenêtre. Ces images sont des reconstructions statiques, sans mesure DOM et sans capture de navigateur. Voir la [revue détaillée G](REVIEW_ASSETS_WAVE_G_2026-11-25.md), le [rapport des compositions](qa-wave-g-2026-11-25/STATIC_STAGE_QA.md), la [planche des neuf cas](qa-wave-g-2026-11-25/static-stage-contact-sheet.png) et les [mesures](qa-wave-g-2026-11-25/static-stage-measurements.json).

Deux limites de présentation sont conservées : dans le cas paysage **730 × 242**, les silhouettes de référence débordent de l’illustration de **52,16 px à gauche** et **46,53 px à droite**, sur les bandes unies de l’arène ; dans le cas portrait **330 × 300**, une bande unie de **125,53 px** reste au-dessus du fond. Le choix `contain` préserve le cadrage complet des masters. Son rendu dans l’interface interactive reste à contrôler.

Le contrôle navigateur G n’a pas pu s’exécuter : le lanceur système pointe vers **`/usr/lib/chromium/chromium` absent**, et le binaire fourni par Playwright est également absent. Aucune page, capture de jeu ou mesure DOM n’a été obtenue. Le [constat navigateur](qa-wave-g-2026-11-25/browser-review.json) est conservé ; les résultats de la QA locale ne sont pas présentés comme une recette interactive ni comme une réussite CI G.

**La fidélité canonique 1:1 n’est pas certifiée.** Les références principales sont des aperçus officiels de 320 × 180 pixels, avec des repères temporels approximatifs. Les poses neutres, les cadrages et l’espace de duel sont adaptés au jeu. Le bas du corps de Martha et de Mrs Mayberry est partiellement renseigné par les anciens portraits du projet ; la pointe de la fléchette est partiellement reconstruite. Les manifestes distinguent ces limites des éléments effectivement observés.

## Cumul des lots de la PR

| Lot | Dessins retenus | PNG masters | WebP plein format | Miniatures | Fichiers images |
| --- | ---: | ---: | ---: | ---: | ---: |
| [Initial](../../art/infernal-versus/production/delivery-2026-11-24.json) | 42 | 42 | 42 | 2 | 86 |
| [C](../../art/infernal-versus/production/delivery-wave-c-2026-11-24.json) | 35 | 35 | 35 | 3 | 73 |
| [D](../../art/infernal-versus/production/delivery-wave-d-2026-11-24.json) | 26 | 26 | 26 | 3 | 55 |
| [F](../../art/infernal-versus/production/delivery-wave-f-2026-11-24.json) | 25 | 25 | 25 | 3 | 53 |
| [G](../../art/infernal-versus/production/export-wave-g-2026-11-25.json) | 21 | 21 | 21 | 3 | 45 |
| **Cumul PR** | **149** | **149** | **149** | **14** | **312** |

Ces totaux décrivent les dessins retenus et leurs fichiers de production. Les contrôles et résultats CI des anciens lots conservent leur portée historique ; ils ne sont pas utilisés comme preuve d’une CI G.
