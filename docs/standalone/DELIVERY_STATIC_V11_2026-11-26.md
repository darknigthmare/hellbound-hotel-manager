# Infernal Versus — livraison statique V11

Date : 26 novembre 2026. Branche : `feat/infernal-versus-assets-20261124`. [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8).

La V11 ajoute **7 dessins retenus** : trois portraits partiels, un fond d’arène et trois objets séparés. Les livrables comprennent **7 masters PNG natifs, 7 exports WebP sans perte et une miniature**, soit **15 fichiers d’image pour 14 006 984 octets**. Le [registre de livraison](production-v11/delivery-register.json) relie chaque dessin à ses références, ses empreintes et sa validation.

Depuis la V9 déjà publiée, les lots V10 et V11 représentent ensemble **18 dessins distincts, 39 fichiers d’image et 33 957 079 octets**. Le [rapport V10](DELIVERY_STATIC_V10_2026-11-26.md) conserve le détail des trois nouvelles bases, des trois costumes, des deux autres arènes et de leurs objets.

## Ajouts V11

| Dessin | Dimensions du PNG natif | Résultat accessible |
| --- | --- | --- |
| Molly — modèle historique 2015 | 1312 × 1199 | Portrait en galerie, explicitement daté |
| Mister Butler — The Circus | 1182 × 1331 | Portrait du grand majordome moustachu |
| Better Than Blitzo Guy — Apology Tour | 1536 × 1024 | Portrait partiel en galerie |
| Salle de consultation de Sloth — Western Energy | 1672 × 941 | Nouvelle arène ; miniature 480 × 270 |
| Conteneur de la salle de consultation | 1317 × 1194 | Décor transparent sur un plan séparé, également en galerie |
| BOZO AWARD — Oops | 1024 × 1536 | Trophée de réserve en galerie |
| Trophée au masque de clown — Oops | 963 × 1633 | Second trophée de réserve en galerie |

Les deux trophées sont isolés de la même vitrine du portfolio de Jasper Luu. Le trophée central conserve son masque, ses ornements cyan, sa tige et son socle ; il est distingué du BOZO AWARD situé à droite. La salle de consultation possède son propre fond et un conteneur séparé, avec une échelle uniforme et un ancrage dans le cadre du fond. Le combat dans ce lieu reste une adaptation AU.

## Progression du catalogue

| Mesure | V9 publiée | V10 | V11 |
| --- | ---: | ---: | ---: |
| Bases autonomes | 109 | 112 | **112** |
| Bases actives / réserve | 40 / 69 | 40 / 72 | **40 / 72** |
| Identifiants sans base entière | 100 | 97 | **97** |
| Identités distinctes sans base, après l’alias connu | 99 | 96 | **96** |
| Combattants et kits actifs | 43 | 43 | **43** |
| Familles de costumes | 21 | 24 | **24** |
| Arènes | 43 | 45 | **46** |
| Entrées de galerie | 106 | 115 | **121** |
| Illustrations personnelles | 127 / 129 | 127 / 129 | **127 / 129** |
| Illustrations globales | 11 / 11 | 11 / 11 | **11 / 11** |

Les trois portraits n’ajoutent aucune base autonome. Les références montrent seulement une partie de leurs corps ; leurs fiches conservent l’état de base entière manquante. Molly est une conception historique de 2015, distincte du modèle angélique actuel. Crymini conserve séparément son attribution historique à 2017. Les 115 entrées de galerie antérieures à la V11 sont préservées.

## Références et décisions

Les [sources et limites de production](production-v11/README.md) détaillent les vidéos officielles et le portfolio utilisés. Les petites cellules vidéo de 320 × 180 pixels limitent la précision des détails redessinés. Les sept exports principaux sont sans perte et identiques pixel par pixel à leurs masters PNG ; **la fidélité artistique 1:1 aux sources n’est pas certifiée**.

Une tentative de correction du petit majordome de la famille de Stolas a été refusée. Elle est consignée dans les [refus V11](production-v11/refused-attempts.json) et n’a pas été relancée. Cette cible est distincte du grand Mister Butler accepté. Aucun refus historique n’est contourné, et aucun dessin refusé ou candidat remplacé n’est inclus dans les sept livrables.

Aucun nouveau kit, costume ou cycle animé n’est livré en V11. Les trophées sont des objets de galerie sans mécanique ajoutée. Les limites de cadrage, d’alpha et de mise à l’échelle sont indiquées dans les revues liées aux empreintes exactes des fichiers.

<!-- V11_VALIDATION_START -->
## Validation et bible

Les [contrôles techniques](production-v11/runtime-qa.json) passent **413 tests / 47 suites**, TypeScript, ESLint, les builds manager et standalone, puis **1 312 empreintes de distribution**. Le [contrôle des références](production-v11/active-asset-coverage.json) vérifie **708 chemins actifs sans référence cassée**. La compilation utilise les configurations ordinaires avec copie publique désactivée, puis assemble les mêmes fichiers par liens physiques ; elle ne revendique pas l’exécution locale de la commande unique `npm run qa`.

La [recette navigateur](production-v11/browser-qa.json) passe **170 contrôles sur 170**, avec les **sept dessins explicitement couverts** et **48 captures finales inspectées**. Les deux combats et les six fiches sont observés sur ordinateur 1440 × 1000 et mobile tactile émulé 390 × 844. Proportions, ancrage et déplacement du conteneur sont contrôlés. Les mentions Buste, les années historiques et les liens de référence sont présents. Aucune erreur réseau ou JavaScript, image manquante ou débordement horizontal n’est relevé dans les parcours testés. L’[historique](production-v11/browser-qa-history.json) conserve les deux corrections de recette préalables ; les empreintes du runtime restent identiques.

Le fond conserve ses marges latérales sur ordinateur et une bande unie supérieure en portrait mobile. Les fiches, le roster et les costumes suivent le filtre S1/S2 ; les arènes gardent leur réglage S3 distinct. Les destinations des liens externes n’ont pas été ouvertes pendant cette recette. Cette couverture locale n’équivaut pas à un essai sur téléphone physique ou à une validation exhaustive des performances et de tous les modes.

La [Bible V11](INFERNAL_VERSUS_BIBLE_V11.xlsx) contient **54 feuilles et 63 tableaux** et pèse **638 528 octets**. Les 52 feuilles, 51 relations et 61 tableaux historiques V10 sont préservés octet par octet. Les neuf vues rendues sont inspectées sans texte coupé ; six nouvelles formules passent les vérifications de recalcul et de réimport, sans erreur de formule. La [QA du classeur](production-v11/workbook-qa.json), la [revue OOXML](production-v11/workbook-ooxml-review.json) et la [revue visuelle](production-v11/workbook-visual-review.json) précisent les preuves et les limites, dont l’absence d’exécution d’Excel natif.

Le [classeur Drive existant](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) est mis à jour en V11 au même identifiant et dans le même dossier. Les métadonnées sont relues et le téléchargement complet est identique au fichier local. Son SHA-256 est `c5ce2434fe38ceeb9d627d0ce511573bc4e7a2b7c7da8db0928e044b912612c0` ; la [preuve de publication](production-v11/drive-publication.json) conserve ce contrôle. La bible V10 reste conservée dans le dépôt, sans remplacement Drive intermédiaire.
<!-- V11_VALIDATION_END -->

## Conservation de l’historique

La [V10](production-v10/README.md) conserve ses onze dessins, ses validations et sa bible. L’[archive de reprise locale](local-recovery-2026-11-26/README.md) conserve **456 fichiers uniques de recherche et de preuve**, plus trois fichiers d’accompagnement, pour **582 correspondances de source à destination vérifiées**. Les candidats remplacés y restent explicitement exclus des assets acceptés.

Les étapes de production et les compteurs sont séparés par édition. Les références archivées, les copies d’un même dessin, les miniatures et les composites de contrôle ne sont pas comptés comme de nouveaux dessins. Les cibles encore ouvertes restent détaillées dans le registre V11 et le [plan d’extension](extension-plan.json).
