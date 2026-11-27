# Revue de la vague C — 24 novembre 2026

## Portée et résultat

La revue indépendante du diff runtime n’a trouvé aucun défaut bloquant concret dans le branchement des sept ensembles de poses, le costume Lute S1 ou les corrections de marges verticales. Elle repose sur la lecture du code, les fichiers, les mesures alpha et les comparaisons statiques. Elle ne remplace pas une recette interactive.

## Poses, identité et transparence

Les neuf nouvelles poses Vox/Velvette/Carmilla ont été comparées à leurs READY dans une planche sur fond neutre. Les personnages sont entiers, orientés à droite, sans adversaire ni effet ajouté. Les costumes, éléments de coiffure et proportions de référence ont été contrôlés visuellement. Les bords alpha ≥ 16 sont contenus dans les images ; la marge minimale de ce sous-lot est de 8 pixels sur la frappe Velvette. Le PNG source reste intact.

Les douze poses Helluva ont reçu la même comparaison avec leur READY. Le premier contact Stolas présentait un déplacement horizontal de 109 pixels des pieds ; une correction de cadrage par imagegen, sans refus de sécurité, a ramené les mesures de ce contact à celles du READY. L’historique du prompt et des deux sorties est conservé dans le manifeste. Après correction, le sous-lot Helluva présente au maximum 30,5 pixels de différence horizontale et 5 pixels de différence verticale selon la mesure des appuis consignée. Ces nombres ne sont pas une certification de pivots en moteur.

Les cinq poses nouvelles de Lute ont été inspectées avec le READY réutilisé : même uniforme, ailes et halo visibles, deux bras ordinaires. Les six images ont des pixels distincts. Certaines marges restent étroites autour du halo ou des bottes. Les surfaces noires ou colorées visibles dans un aperçu ignorant l’alpha ne constituent pas des fonds peints opaques : la vérification porte sur le canal alpha et les composites.

Le contrôle consolidé a confirmé la conservation octet pour octet des 35 masters acceptés et l’égalité des pixels des exports, avec comparaison à l’intermédiaire redimensionné pour les six props. Les sources et les hashes sont dans `delivery-wave-c-2026-11-24.json` et les quatre manifestes associés.

## Résolution des poses dans le runtime

Les entrées Vox, Velvette, Carmilla, Blitzø, Stolas, Fizzarolli et Asmodeus possèdent quatre chemins distincts : READY, garde, contact léger et réaction. Les fichiers existent et les contacts conservent la fenêtre du moteur : démarrage du coup puis 110 ms. Les actions non couvertes gardent leur comportement précédent.

Pour Lute, la résolution du costume précède les poses individuelles, finitions et atlas de base. `costumePose` fournit toujours l’une des six images pour les actions, le K.-O. et les cinématiques. Le READY historique reçoit le rendu portrait par le costume, même sans entrée Lute dans `INFERNAL_ACTION_POSES`. Le portrait de sélection et les banques par défaut ne sont pas réinterprétés comme l’incarnation S1.

## Correction des appuis verticaux

Les 17 entrées d’ancrage correspondent aux bottes et chaussures mesurées dans les images de 1536 pixels de haut, avec le bord inférieur exclusif du contour alpha ≥ 16.

| Ensemble | READY | Garde | Léger | Réaction | Lourd | Accroupi |
|---|---:|---:|---:|---:|---:|---:|
| Lute S1 | 1517 | — | 1501 | 1497 | 1445 | 1503 |
| Vox | 1473 | 1469 | 1454 | 1465 | — | — |
| Velvette | 1506 | 1484 | 1444 | 1484 | — | — |
| Carmilla | 1498 | 1496 | 1493 | 1492 | — | — |

Le décalage vaut la différence entre le contact du READY et celui de la pose, divisée par la hauteur source. Il est appliqué à l’image par la propriété CSS indépendante `translate`. Le `transform` utilisé pour l’orientation et la respiration est préservé. Les tests vérifient les contacts reconstruits à plusieurs tailles et les exclusions.

Les ancres de Lute exigent `lute-pre-injury`. Celles de Vox, Velvette et Carmilla exigent l’absence de costume. Les autres chemins n’obtiennent ni style ni attribut d’ancrage. L’URL de saut Lute est volontairement exclue ; aucune correction ne la ramène au sol.

La translation corrige des marges transparentes relatives au READY. Aucun pivot horizontal, rapport de taille entre personnages, effet du mouvement de respiration sur les appuis ou cycle animé complet n’est certifié par ce calcul.

## Décors et profondeur

Les fonds des trois nouvelles arènes sont opaques. Les six props ont des carrés alpha et sont rendus avec leurs proportions naturelles. Les plans médians se trouvent derrière les combattants ; les plans proches sont sur les bords. Le manager conserve exactement son bloc de huit lieux, et le standalone compte dix-neuf IDs uniques.

La vérification statique couvre 54 projections : six props, trois dimensions d’arène (300 × 300, 720 × 430 et 1200 × 520), trois offsets de parallaxe (−39,5, 0 et +39,5). Les contours alpha ≥ 16 sont contenus, avec une marge minimale de 3,516 pixels. Les franges plus faibles ne sont pas supprimées et ne sont pas comprises dans cette assertion de confinement.

Les composites ont été inspectés aux deux extrêmes de parallaxe et à l’offset neutre. Le placement de la caméra, du fauteuil, de la lampe et du treillis est une adaptation de jeu documentée. Aucun contact physique des pieds des combattants ou rendu final sur téléphone n’est déduit de ces compositions calculées.

## Contrôles automatisés et limites

`npm run qa` a réussi : TypeScript, ESLint, 44 suites et 341 tests, deux builds, puis 932 empreintes du standalone contrôlées. Les 1083 fichiers hachés avant et après le run sont inchangés. L’audit des chemins trouve 336 références et zéro absence. Les résultats détaillés et le journal sont conservés dans les fichiers QA runtime de cette vague.

La garde Rosie a été refusée sans nouvelle tentative ; ses deux autres poses prévues ont été laissées non tentées. Aucun refus antérieur n’a été relancé.

Chromium local reste indisponible après un échec de lancement `socket EPERM` déjà établi. Cette revue ne fournit ni capture en jeu, ni test sur appareil réel, ni certification canonique 1:1. Les cycles longs, transitions, échelles relatives et pivots horizontaux restent à produire ou à vérifier.
