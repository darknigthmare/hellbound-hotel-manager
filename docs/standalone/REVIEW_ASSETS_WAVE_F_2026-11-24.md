# Vague F — état du contrôle navigateur et QA statique

Date : 24 novembre 2026. Projet : Infernal Versus / Hazbin Hotel × Helluva Boss.

## Statut du contrôle navigateur

**Le contrôle dans un vrai navigateur n'a pas pu être exécuté.** Aucune capture de jeu, action clavier/tactile, trace de console ni trace de requêtes du navigateur n'a été obtenue dans cette tâche.

Le premier lancement Playwright n'a pas trouvé son exécutable Chromium en cache. Le lancement suivant avec l'exécutable système `/usr/bin/chromium` a été bloqué par l'environnement : `socket() failed: Operation not permitted (1)` dans `process_singleton_posix.cc`, puis `ptrace: Operation not permitted`. La tentative de demander l'autorisation d'exécuter ce contrôle local hors du bac à sable a été **rejetée automatiquement** : la politique d'approbation indiquait `sandbox_approval: false` et interdisait la demande de permissions élevées. Aucun contournement ni lancement CUA n'a été utilisé.

Le contrôle HTTP local `curl -I --max-time 3 http://127.0.0.1:4173/combat.html` a également échoué avec le code 7, connexion refusée. Ce résultat ne permet d'affirmer ni une réponse HTTP 200 ni l'absence de 404 sur les assets. Les fichiers ont été lus directement sur disque.

Restent donc **non vérifiés dans le jeu** : sélection des trois arènes et des combattants, coup léger, garde, réaction au coup, changement de pose, déplacements, parallax en mouvement, effets au moment de l'impact, collisions avec le HUD, retour des commandes tactiles, consoles et requêtes réseau. Le contrôle statique ci-dessous ne remplace pas ces vérifications.

## Contrôles statiques effectivement réalisés

Les WebP exportés ont été ouverts avec Pillow. Leurs dimensions, modes de couleur, minima/maxima d'alpha et boîtes du contenu visible à alpha ≥ 16 ont été mesurés. Les silhouettes ont été affichées sur un fond uni, puis dans les deux orientations. Les règles de dimensions, de containment, de profondeur et d'ancrage ont été relues dans les fichiers source.

Inventaire contrôlé à cet instant : **26 exports**, comprenant 3 fonds, 3 miniatures, 6 props, 11 poses et 3 VFX. Les 20 images attendues avec transparence ont toutes une vraie couche alpha allant de 0 à 255. Aucune boîte de contenu visible à alpha ≥ 16 ne touche un bord du fichier.

| Groupe | Dimensions natives | Résultat statique |
| --- | --- | --- |
| Fonds `imp-exterior`, `oops-warehouse`, `sinsmas-balcony` | 1672 × 941, RGB | Image complète, ratio identique sur les trois fonds |
| Miniatures des trois fonds | 480 × 270, RGB | Fichiers présents et décodables |
| Six props des trois décors | 1254 × 1254, RGBA | Détourage effectif ; marges transparentes importantes à prendre en compte dans le CSS |
| Vortex : ready, guard, strike, recoil | 1200 × 1310 ou 1109 × 1419, RGBA | Sujets dans le cadre, proportions natives préservées dans le test statique |
| Glitz : ready, guard, strike, recoil | 1140 × 1380 ou 1080 × 1456, RGBA | Sujets dans le cadre, proportions natives préservées dans le test statique |
| Glam : ready, guard, recoil | 1199 × 1312 ou 1108 × 1420, RGBA | Trois poses présentes ; aucune pose strike dédiée exportée au moment du contrôle |
| Velvette arrow, Striker lasso, Valentino smoke | 2172 × 724, RGBA | Effets isolés, transparents, cadrés ; lecture dans les deux orientations inspectée |

Les trois combattants utilisent un cadre CSS 3:2 avec `object-fit: contain`. Leurs ratios natifs sont inférieurs à 3:2 : l'image est donc limitée par la hauteur du cadre, sans changement du rapport largeur/hauteur. La correction `canvas-bottom` utilise la ligne mesurée de l'alpha pour amener le bas visible à la même ligne de sol. Les calculs statiques correspondent à un appui à 91 % de la hauteur de l'arène, à l'arrondi raster près. Cela valide le calcul de placement, pas sa stabilité au cours d'une animation exécutée.

Les VFX sont classés `simulation_au` dans le code. Leur rendu image a été vérifié ; leur déclenchement, portée visuelle, durée, pause et disparition n'ont pas été exécutés dans un navigateur par cet agent.

## Méthode des compositions de décor

Les compositions sont des **reconstructions statiques des règles CSS et des assets**, explicitement titrées comme telles. Elles ne sont pas des captures du navigateur. Aucun HUD, texte de résultat de partie ou état interactif n'a été simulé pour faire croire à une partie exécutée.

Trois tailles représentatives ont été étudiées :

| Cas | Canvas d'arène choisi | Largeur d'écran supposée pour les règles `vw` |
| --- | --- | --- |
| Bureau | 1200 × 520 | 1440 px |
| Mobile portrait | 330 × 300 | 390 px |
| Mobile paysage | 730 × 242 | 844 px, hauteur d'écran 390 px |

Ces tailles ont été choisies pour éprouver les rapports du CSS ; elles ne proviennent pas d'une mesure DOM. Le décalage du parallax est fixé à zéro. Le premier diagnostic archivé utilise les positions de contrôle 28 % / 72 %. Les neuf compositions finales utilisent les positions de départ relues dans le code, 22 % / 78 %. Les filtres d'ombre, le HUD, les transformations d'animation et les interpolations de l'anticrénelage du navigateur ne sont pas reproduits.

Le fond utilise `contain`, une origine de fond tenant compte des 20 px de padding latéral et un alignement en bas. Il reste entier ; ce choix produit des bandes de couleur lorsque le ratio du canvas diffère de celui du master. Sur le canvas portrait 330 × 300, le fond occupe environ x = 10 à 320 et y = 125,5 à 300. Sur le canvas paysage 730 × 242, il occupe environ x = 150 à 580 sur toute la hauteur.

## Défauts de placement détectés avant réalignement

1. Les fenêtres et affiches I.M.P., ancrées à `top: 12%` et `top: 18%`, se trouvaient entièrement dans la bande unie supérieure en portrait : alpha visible y ≈ 59–100 et 65–122, alors que le décor commence à y ≈ 125,5. Une correction vers un ancrage inférieur a été signalée et appliquée par l'intégrateur ; son contrôle final est indiqué ci-dessous.
2. La guirlande du balcon, avec `top: -20%` et `max-height: 60%`, se trouvait à y ≈ 18–48 en portrait, également au-dessus du décor. La grande marge transparente du fichier carré explique pourquoi placer le rectangle de l'image ne place pas directement la guirlande.
3. La cage au premier plan de l'entrepôt recouvrait le combattant de droite dans les compositions portrait et paysage. Avec les positions de départ du moteur 22 % / 78 %, le cas portrait donne une silhouette Glitz à x ≈ 217–306 et une cage à x ≈ 198–277 : un recouvrement horizontal d'environ 60 px. La proposition a été de rendre cette cage derrière les combattants ou de la déplacer/réduire nettement.
4. Les ancrages latéraux fondés uniquement sur le canvas placent partiellement certaines fenêtres, caisses ou rambardes dans les bandes latérales lorsque le fond contenu est plus étroit. Un repère commun basé sur les dimensions du fond contenu a été recommandé.

Les masters comportent déjà certains motifs architecturaux repris par les props. Ajouter les props constitue une mise en scène de jeu ; cela ne démontre pas une correspondance architecturale 1:1 avec une image canonique.

## Révision CSS finale

Le bloc Wave F de `src/styles/pentagram-arena.css` a été corrigé et les **neuf compositions finales** ont été recalculées, puis inspectées. Les trois décors utilisent désormais les dimensions réelles du fond contenu pour placer les props. Le calcul tient compte du ratio 1672/941, de la largeur utile du fond et de la marge alpha propre à chaque objet. Les six props sont au niveau `z-index: 1`, derrière les combattants à `z-index: 2`.

Résultat statique aux trois tailles choisies et au décalage de parallax nul : **18 boîtes de contenu de props sur 18 sont entièrement dans l'image du décor**, à l'arrondi raster près. La cage ne peint plus par-dessus les combattants. La guirlande est dans le haut du décor, y ≈ 31–127 au bureau, 136–169 en portrait, 14–60 en paysage. Les fenêtres et affiches I.M.P. restent également dans le décor : en portrait, y ≈ 195–223 et 199–230.

Le risque d'effondrement lié à `container-type: size` a été traité explicitement : `height` **et** `min-height` reprennent les dimensions responsives existantes. Elles donnent 520 px dans le cas bureau, 300 px dans le cas portrait et 62 % de la petite hauteur d'écran dans le cas paysage (241,8 px pour 390 px, arrondi à 242 dans la composition). Ces dimensions restent définies même lorsque les enfants sont tous positionnés en absolu. Un repli `vh` existe si `svh` n'est pas reconnu. C'est une vérification des règles et de leur calcul ; ce n'est pas une mesure DOM.

Sans prise en charge des unités de conteneur, le fond complet demeure affiché et les props additionnels restent masqués. Le fallback conserve ainsi la composition complète sans laisser des éléments flotter dans les bandes de couleur. Les motifs principaux des props sont déjà représentés dans les masters.

Le CSS a été analysé avec PostCSS sans erreur de syntaxe, et `git diff --check` n'a pas signalé d'erreur d'espacement. Aucun autre lancement de navigateur ni demande d'approbation n'a été fait.

Limites conservées : `contain` laisse les bandes de couleur attendues lorsque les ratios diffèrent ; sur le cas paysage, les silhouettes placées à 22 % / 78 % débordent partiellement sur ces bandes. Le contrôle des 18 boîtes ne couvre que le décalage neutre, pas les valeurs extrêmes du parallax en mouvement. Les comportements runtime et l'absence d'obstruction par le HUD restent non vérifiés.

## Fichiers de diagnostic locaux

- `/tmp/hellbound-wave-f-browser/static-export-audit.json` : mesures et empreintes des 26 exports.
- `/tmp/hellbound-wave-f-browser/static-fighter-contact-sheet.png` : poses Vortex, Glitz, Glam, deux orientations.
- `/tmp/hellbound-wave-f-browser/static-vfx-contact-sheet.png` : trois effets et leurs orientations inversées.
- `/tmp/hellbound-wave-f-browser/before_css_alignment/static-stage-contact-sheet.png` : composition de diagnostic avant réalignement.
- `/tmp/hellbound-wave-f-browser/before_css_alignment/static-stage-metrics.json` : coordonnées de ce premier diagnostic.
- `/tmp/hellbound-wave-f-browser/static-stage-contact-sheet.png` : neuf compositions finales aux positions 22 % / 78 %.
- `/tmp/hellbound-wave-f-browser/static-stage-metrics.json` : coordonnées finales, profondeur des props et résultat du contrôle de containment.
- `/tmp/hellbound-wave-f-browser/static-check-context.json` : empreinte du CSS vérifié et limites du contrôle.
- `/tmp/hellbound-wave-f-browser/static_qa.py` : script local de reconstruction des règles retenues.

Ces fichiers sont des diagnostics temporaires locaux et n'ont pas été publiés par cet agent.

## Statut de fidélité

Les sources visuelles et les prompts des décors sont documentés dans `backgrounds/SOURCES_QA.md`, `backgrounds/prompts.json` et `backgrounds/props-prompts.json`. Les images sont des **candidats d'adaptation**, avec placement de jeu `simulation_au`. Aucun statut « fidélité 1:1 certifiée » n'est attribué. La comparaison finale source canonique / jeu réellement exécuté reste à faire.

## Pièces de revue conservées avec la livraison

Les trois planches de contact et les trois JSON de mesures sont copiés dans `docs/standalone/qa-wave-f-2026-11-24/`. Les chemins `/tmp/` ci-dessus décrivent leur emplacement de travail initial. Les planches sont des diagnostics statiques, distincts des 53 fichiers de production.
