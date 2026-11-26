# Infernal Versus — checkpoint de reprise V14

**Sauvegarde de travail après indisponibilité de l'environnement d'exécution. Cette branche ne constitue pas une version jouable V14 validée.**

La PR [#8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8) et la [bible Drive](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit) sont restées en V13. Ce checkpoint se rattache au commit V13 `0ce3b069e738bbcae50b268806396ca2e65c1bad`, sans déplacement de la branche de cette PR.

## Travail préservé

Les sept PNG natifs ont été retrouvés dans les résultats de génération conservés en mémoire. Leur SHA-256 correspond exactement au master accepté avant la coupure. Les octets natifs ont été transmis sans conversion ; les empreintes Git retournées ont également été contrôlées. Les trois costumes et les deux accessoires gardent leur véritable transparence native.

| Dessin | Destination prévue | PNG natif |
| --- | --- | --- |
| Blitzø, flashback de Ghostf**kers | Costume statique sélectionnable | [1024 × 1536](../../../production/v14/characters/masters/hb_blitzo-flashback-ghostfuckers-s2.png) |
| Millie, robe de déguisement et ombrelle | Costume statique sélectionnable | [1024 × 1536](../../../production/v14/characters/masters/hb_millie-dress-disguise-training-short.png) |
| Moxxie, robe de déguisement et ombrelle | Costume statique sélectionnable | [1024 × 1536](../../../production/v14/characters/masters/hb_moxxie-dress-disguise-training-short.png) |
| The Full Moon, boutique gothique | Arène en un seul plan | [1672 × 941](../../../production/v14/environment/masters/full-moon-shop-s2-room.png) |
| Crimson, salle à manger | Arène en un seul plan | [1672 × 941](../../../production/v14/environment/masters/crimson-dining-room-s2-room.png) |
| Sloth, distributeur mural au nuage | Accessoire de réserve dans la galerie | [1054 × 1493](../../../production/v14/props/masters/sloth-cloud-dispenser-s2.png) |
| Crimson, lustre vert | Accessoire de réserve dans la galerie | [1420 × 1108](../../../production/v14/props/masters/crimson-green-chandelier-s2.png) |

Les [métadonnées de reprise des dessins](asset-recovery.json) rassemblent les empreintes, les références primaires et les limites relevées. Elles ont été rédigées à partir des observations consignées ; elles ne remplacent pas les fichiers originaux de prompts, références et revue visuelle encore locaux.

Deux copies de sources correspondent exactement aux empreintes des fichiers figés après les six tests ciblés réussis :

- [Composant de combat et correction du préchargement](source/src/components/PentagramLiveFight.tsx.txt).
- [Suite des six tests du préchargement](source/src/tests/infernal-preload.test.tsx.txt).

Six autres copies reconstituent les changements consignés à partir des sources V13 immuables : définitions des costumes et des arènes, libellé de provenance de la galerie, sélecteurs CSS, nombre d'arènes attendu et portée ESLint du harnais. Leur identité avec les fichiers locaux inaccessibles n'est pas revendiquée. L'[index des sources](source-index.json) distingue ces deux niveaux de récupération.

Les copies V14 restent sous `source/` avec une extension documentaire `.txt`. Elles n'ont pas remplacé les sources applicatives actives de la V13 dans cette branche.

## Portée artistique et limites

Ce lot comprend trois costumes, deux décors et deux accessoires. Il n'ajoute ni identité complète, ni kit de combat, ni cycle d'animation. Les costumes utilisent les techniques existantes avec leur illustration statique.

Les robes de Millie et Moxxie sont documentées par le court officiel IMP Training Video (2026) et les porte-clés officiels. La valeur de filtre `season_2` ne constitue pas une attribution de ce court à une saison numérotée. La pose avec ombrelle ouverte vient du produit officiel. Les pieds couverts par les robes restent couverts.

Les deux décors adaptent le cadrage au combat de simulation AU. Le sol a été prolongé ; il n'y a pas de revendication de correspondance pixel pour pixel avec l'épisode. Dans la salle à manger, le haut du lustre est coupé par le cadre du décor ; le dessin isolé du lustre est complet.

Le prompt historique du lustre décrivait imparfaitement le nombre d'abat-jours : la revue a relevé quatre ouvertures visibles dans deux groupes superposés. Il faut conserver le texte du prompt initial et la note de correction, sans réécrire rétroactivement la provenance.

Les marges de Blitzø sont plus petites que les 5 % initialement demandés, mais la silhouette entière est présente. Les personnages ont gardé l'alpha natif maximal de 254, sans forçage à 255.

Les refus historiques restent exclus. Aucun refus n'a été relancé dans ce lot. Le poste radio de Sloth et la plante bleue de Crimson restent différés à cause d'une base masquée ou coupée.

## Validation : résultat connu et résultat en attente

Une première passe technique V14 avait réussi avant le dernier correctif : **413 tests dans 47 suites**, vérification TypeScript, lint, deux builds, emballage et intégrité. L'audit avait trouvé **735 chemins actifs sans référence cassée**.

Le correctif de préchargement a ensuite passé ses **six tests ciblés**. La nouvelle passe complète a été lancée, mais son résultat n'a pas été récupéré avant l'indisponibilité de l'environnement.

**Aucun segment de validation navigateur n'a complètement réussi.** Deux essais ont subi un crash natif à l'entrée en combat ; l'essai galerie a expiré au clic ; l'essai mobile a été interrompu. Quelques captures du vestiaire et de miniatures ont été examinées, ce qui reste une observation partielle.

Le registre était en brouillon. **Aucun XLSX V14 n'a été produit.** Les sept WebP lossless et les deux miniatures avaient été préparés et contrôlés localement, mais ne sont pas conservés dans ce checkpoint. Leur absence ici ne prouve pas leur perte sur le système de fichiers inaccessible.

Les comptes locaux provisoires visaient 51 arènes, 27 familles de costumes et 138 fiches de galerie, avec 43 kits jouables inchangés. Ces comptes ne décrivent pas la version publiée actuelle.

## Documents de reprise

- [Manifeste du checkpoint](recovery-checkpoint.json) : inventaire récupéré, empreintes observées et état distant.
- [Validation et séquence de reprise](validation-and-resume.md) : limites des résultats, incidents navigateur et vérifications à refaire.
- [Reprise du registre et de la bible](register-bible-handoff.md) : assemblage final, préservation OOXML et remplacement du même fichier Drive.
- [Index des copies de sources](source-index.json).
- [Métadonnées et références des sept dessins](asset-recovery.json).

À la reprise, vérifier d'abord les fichiers locaux existants et leurs empreintes. Conserver les sept masters récupérés ; aucune nouvelle génération de ces dessins n'est nécessaire. Achever ensuite les exports manquants, les vérifications techniques et navigateur, le registre, la bible et la publication dans la PR existante.

Un éventuel résultat CI de cette branche de récupération ne suffirait pas à valider la V14, puisque ses copies de code sont documentaires et que ses exports runtime ne sont pas intégrés ici.
