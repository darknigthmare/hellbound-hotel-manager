# Infernal Versus — livraison statique V10

Date : 26 novembre 2026. Branche : `feat/infernal-versus-assets-20261124`. [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8).

La V10 ajoute **11 dessins retenus** : trois bases autonomes, trois costumes, deux fonds d’arène et trois objets de décor. Les fichiers livrés comprennent **11 masters PNG natifs, 11 exports WebP sans perte et deux miniatures**, soit **24 fichiers d’image pour 19 950 095 octets**. Le [registre de production](production-v10/delivery-register.json) conserve l’empreinte de chaque fichier et relie chaque dessin à ses sources et à sa revue.

## Dessins livrés

| Dessin | Dimensions du master | Usage dans le projet |
| --- | --- | --- |
| Loona — robe de soirée, Queen Bee | 1160 × 1355 | Costume statique sélectionnable |
| Moxxie — hallucination, Truth Seekers | 1199 × 1312 | Costume statique sélectionnable |
| Charlie — transformation du combat final S1 | 1024 × 1536 | Costume statique sélectionnable ; un seul dessin pour les exigences VAR-001 et VAR-002 |
| Melissa — tenue de mannequin S1 | 1024 × 1536 | Nouvelle base entière en galerie de réserve |
| Loo Loo — mascotte S1 | 1182 × 1330 | Nouvelle base entière en galerie de réserve |
| Crymini — modèle historique 2017 | 1024 × 1536 | Nouvelle base entière en galerie, explicitement antérieure à la série |
| Chambre d’Asmodeus — Oops | 1602 × 982 | Fond d’arène et miniature |
| Console de la chambre d’Asmodeus | 1540 × 1021 | Objet transparent séparé dans le décor |
| Candélabre de la chambre d’Asmodeus | 1024 × 1536 | Objet transparent séparé dans le décor |
| Noël imaginé par Blitzø — Sinsmas | 1648 × 954 | Fond d’arène et miniature ; scène présentée comme une vision |
| Boule à neige au sapin | 1341 × 1173 | Objet transparent séparé dans cette vision |

## Progression réelle

| Mesure | V9 | V10 |
| --- | ---: | ---: |
| Bases autonomes | 109 | **112** |
| Bases actives / bases de réserve | 40 / 69 | **40 / 72** |
| Identifiants sans base autonome | 100 | **97** |
| Identités distinctes sans base, après l’alias connu | 99 | **96** |
| Combattants et kits actifs | 43 | **43** |
| Familles de costumes | 21 | **24** |
| Arènes | 43 | **45** |
| Entrées de galerie | 106 | **115** |
| Illustrations personnelles | 127 / 129 | **127 / 129** |
| Illustrations globales | 11 / 11 | **11 / 11** |

Les trois nouvelles bases couvrent des identités déjà présentes au catalogue. Les trois costumes n’ajoutent pas de nouvelle identité ou de kit. La galerie accueille les six dessins de personnage et les trois objets ; les deux fonds sont accessibles par la sélection d’arène. Les 106 entrées historiques sont préservées.

## Références, corrections et limites

Les silhouettes entières de Loona, Moxxie, Charlie, Melissa et Loo Loo sont rattachées à des vues officielles entières. Les pins officiels utilisés pour Loona et Moxxie servent uniquement aux détails du buste. Les petits aperçus vidéo restent souvent limités à 320 × 180 pixels : les proportions, doigts, coutures et petits motifs ne sont pas certifiés à l’identique.

Crymini repose sur le dessin de conception de 2017 publié par Vivziepop. La galerie affiche **« MODÈLE HISTORIQUE · 2017 »** et une note de provenance. Ce dessin ne prétend établir ni son modèle dans les saisons récentes ni une apparition future. Le filtre de saison employé par le logiciel ne change pas cette provenance.

Les intérieurs suivent les dessins de production du [portfolio de Jasper Luu](https://jasperluu.com/helluvaboss), recoupés avec les épisodes officiels. La chambre d’Asmodeus est distincte du cabaret Ozzie’s. Le Noël de Blitzø est une scène imaginée. Les éléments séparés utilisent les coordonnées du fond et le même déplacement de caméra ; leur ratio est conservé.

La [revue indépendante](production-v10/independent-review-root.json) accepte les onze masters exacts. Les trois corrections artistiques retirent la doublure rose non corroborée de Moxxie, rétablissent le bras gauche transformé de Charlie et suppriment le nez ajouté à Loo Loo. Les essais remplacés ne sont pas comptés comme livraisons. Aucun nouveau refus du générateur ni aucune relance d’un refus historique n’est enregistré. **Fidélité 1:1 non certifiée.**

## Validation

Le [contrôle des fichiers actifs](production-v10/active-asset-coverage.json) vérifie **700 chemins d’images, sans référence cassée**. La [validation technique](production-v10/runtime-qa.json) passe **413 tests dans 47 suites**, TypeScript, ESLint, les builds manager et standalone, puis **1 310 empreintes de distribution**. Les 167 fichiers suivis par les contrôles runtime et navigateur sont inchangés entre leurs vérifications. Les builds locaux utilisent la configuration Vite normale avec la copie publique remplacée par des liens physiques ; la commande unique `npm run qa` n’est pas revendiquée comme exécutée localement. Le package local contenait aussi des exports V11 en préparation, non raccordés au catalogue actif V10.

La [recette navigateur](production-v10/browser-qa.json) passe **352 contrôles** : 322 dans le passage complet, puis 30 vérifications ciblées des liens de référence et de la provenance de Crymini. Les onze assets sont explicitement couverts sur ordinateur 1440 × 1000 et mobile émulé 390 × 844. Elle conserve 68 captures, dont 51 ont été inspectées visuellement : trois costumes dans six combats, les deux fonds, les trois objets et les neuf fiches de galerie. Aucun asset manquant, débordement horizontal, 404 ou erreur JavaScript n’a été observé dans ces parcours.

La reprise a aussi corrigé un relâchement tactile : un clic tactile de détail zéro ne réactive plus la direction après la levée du doigt ; les activations clavier et d’assistance conservent leur comportement. Le test de relâchement couvre ces deux cas. L’ancien contrôle générique du nombre « 43 » a été rattaché à l’étiquette des combattants, car le catalogue possède désormais également 43 arènes sans activation de la saison 3. Les liens officiels des trois costumes sont classés précisément pour apparaître dans leur fiche.

Les limites de recette restent explicites : Chromium local en mode développement, mobile émulé, parcours ciblés et positions de caméra observées. Les longs libellés de costumes sont tronqués dans certains sélecteurs mobiles fermés, avec une description adjacente. La présentation entière des fonds peut laisser une bande unie sur écran vertical. Ces contrôles ne constituent ni un essai sur téléphone physique, ni une mesure exhaustive des performances ou de tous les modes historiques.

Les essais interrompus et les preuves antérieures à la correction tactile sont conservés séparément. Ils ne remplacent pas les résultats finaux ci-dessus.

## Sources et suivi

Le [dossier de production V10](production-v10/README.md) décrit les sources, commandes de reconstruction, décisions d’intégration et limites. Le [plan d’extension](extension-plan.json) conserve les cibles restantes et distingue les dessins statiques des exigences d’animation, de transitions et de gameplay. Les deux exigences de Charlie restent partielles et pointent vers un seul master.

La [bible V10](INFERNAL_VERSUS_BIBLE_V10.xlsx) est finalisée : **52 feuilles et 61 tableaux**, 622 318 octets, SHA-256 `f116bf8d5324b2a543852fb14d8c191882684647e73a04b14f9fbc14ce37737a`. Les 50 feuilles, 49 relations de feuilles et 59 tableaux V9 sont conservés octet par octet, soit 158 payloads historiques ; le contrôle couvre 160 parties figées au total. Dix vues ont été rendues puis inspectées, avec aucune erreur de formule ni contenu coupé observé. Le [contrôle OOXML](production-v10/workbook-ooxml-review.json) et la [revue visuelle](production-v10/workbook-visual-review.json) précisent la méthode ; Excel natif n’a pas été exécuté.

La publication du classeur Drive est suivie dans la dernière livraison finalisée ; aucune mise à jour Drive V10 intermédiaire n’est revendiquée par ce rapport.
