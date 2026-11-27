# V17 — quatre accessoires statiques de galerie

**État : production, CI, transfert, recette navigateur et Bible V17 vérifiés ; remplacement Drive contrôlé à l’identique.** Cette reprise part du commit [`28c98cf1fa67fa02c7f7565a231059d57f872d50`](https://github.com/darknigthmare/hellbound-hotel-manager/commit/28c98cf1fa67fa02c7f7565a231059d57f872d50), publié dans la [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8).

Quatre objets sont raccordés au catalogue de la galerie dans le commit runtime [`2a7c956ceedfb4f3a845af67c621290f7fd41654`](https://github.com/darknigthmare/hellbound-hotel-manager/commit/2a7c956ceedfb4f3a845af67c621290f7fd41654). Leurs silhouettes complètes, références et exports ont été relus, puis leur affichage a été contrôlé dans le bundle réel. La preuve technique principale porte sur `d56202b178d1ecd8cab7e3a4a876aa50501be815`, qui conserve ces sources et modifie seulement le packaging du workflow.

## Les quatre dessins retenus

| Dessin | Source visuelle inspectée | Usage |
| --- | --- | --- |
| [Spring Broken · Canette bleue](../../../public/assets/production/v17/props/spring-broken-blue-can-s1.webp) | Canette du premier plan de `HB4_166.png`, [Rebecca Reynolds](https://rebeccareynolds.me/portfolio/backgrounds). | Accessoire entier, statique, classé S1 dans la galerie. |
| [Crimson · Trophée mural à cornes, V2](../../../public/assets/production/v17/props/crimson-horned-wall-trophy-s2-v2.webp) | Plaque frontale de `204.jpg`, [Jasper Luu](https://jasperluu.com/helluvaboss). | Accessoire entier, statique, classé S2 ; contour de la plaque corrigé. |
| [Unhappy Campers · Moteur hors-bord](../../../public/assets/production/v17/props/unhappy-campers-outboard-motor-s2.webp) | Petit moteur visible devant la coque dans le fond du hangar, Jasper Luu ; copie de référence `jasper-boathouse-21.jpg`. | Accessoire de galerie S2, sans bateau, fonctionnement ou animation. |
| [Crimson · Trophée mural à mâchoire, V2](../../../public/assets/production/v17/props/crimson-fanged-jaw-wall-trophy-s2-v2.webp) | Plaque à droite du trophée à cornes dans `204.jpg`, Jasper Luu. | Accessoire entier, statique, classé S2 ; proportions, contour et dents corrigés. |

Les sources principales sont des peintures de production publiées dans les portfolios des artistes. Les associations aux épisodes proviennent des dossiers de référence antérieurs et restent indiquées comme contexte hérité ; cette vague ne revendique pas une nouvelle vérification intégrale de ces épisodes. Les objets restent en réserve dans la galerie : aucun placement dans une arène ou mécanisme de décor supplémentaire n’est livré.

## Production, corrections et fichiers

**Six générations ont produit quatre dessins retenus et deux candidats écartés.** Chaque appel produit un objet isolé. Le lot accepté contient **4 PNG natifs et 4 WebP sans perte**, soit **8 fichiers image et 4 672 320 octets**. Les quatre exports décodés sont identiques en RGBA à leurs masters.

La première revue a rejeté les deux trophées :

- La plaque à cornes inventait une pointe centrale basse et une forme d’écusson. La V2 rétablit le panneau plus rectangulaire et son bord inférieur presque horizontal.
- La mâchoire était trop large, avec un cimier pointu et des dents régulières espacées. La V2 rétablit la plaque verticale festonnée et le groupement irrégulier des dents.

Les masters V1 restent conservés et les exports V1 sont archivés hors du dossier public, dans `production/v17/props/rejected-exports/`. Ils ne comptent pas comme dessins livrés. Les seuls exports publics V17 retenus sont les quatre fichiers du tableau.

La [revue visuelle](independent-visual-review.json) conserve les décisions initiales et les limites des candidats actuels. Le dossier [des corrections](trophy-corrections.json) conserve les prompts exacts, les chemins natifs et les recadrages de référence sans retouche. La revue V1 était indépendante de la génération ; son auteur a exécuté et relu les corrections V2, puis le coordinateur a effectué une seconde lecture des deux composites corrigés par rapport aux sources.

## Comptes après raccordement au catalogue

| Indicateur | V16 publiée | V17 vérifiée |
| --- | ---: | ---: |
| Fiches de galerie | 145 | **149** |
| Bases autonomes | 115 | **115** |
| Kits jouables | 43 | **43** |
| Arènes | 51 | **51** |
| Familles de costumes | 27 | **27** |
| Identifiants sans base entière | 94 | **94** |
| Identités distinctes sans base entière | 93 | **93** |

Les 209 identifiants du roster, les campagnes, les costumes et les arènes existants sont conservés. Ces quatre objets ne ferment aucun manque de personnage entier et n’ajoutent aucun projectile jouable, cycle animé ou pouvoir.

## Validation sur le bundle réel

- **Art et exports : vérifiés avec limites.** Les quatre PNG natifs, leurs compositions sur fonds clair et sombre et les WebP ont été inspectés. Les quatre conversions conservent exactement les pixels RGBA des masters.
- **Références actives : 746 sur 746 conformes.** L’[audit de couverture](active-asset-coverage.json) contrôle les fichiers réellement extraits du bundle : aucune référence cassée, aucune absence du manifeste et aucune divergence de taille ou de SHA-256. Il consigne séparément l’évaluation des déclarations sources et ne vaut pas une observation visuelle.
- **CI principale : réussie.** Le [run Quality gate nº 103](https://github.com/darknigthmare/hellbound-hotel-manager/actions/runs/45948785155) passe `npm run qa` : **439 tests dans 51 suites**, TypeScript, ESLint, builds manager et standalone, puis **1 350 empreintes de distribution**. Le [rapport technique](runtime-qa.json) rattache cette preuve à `d56202b178d1ecd8cab7e3a4a876aa50501be815`, au merge `7454b9d2b2a7ab87564b8320cb2f04a015211b52` et à leur arbre commun `e6b31f4e5ae9a92a207bd60b478a27fbea77f341`. La [CI initiale nº 102](runtime-qa-initial.json) reste archivée.

### Transfert du bundle CI

L’[échec de téléchargement initial](browser-artifact-transfer-initial-limit.json) est conservé : l’artifact unique du run nº 102, de **963 249 821 octets**, dépasse la limite de **512 MiB / 536 870 912 octets** du connecteur. Cette tentative n’avait matérialisé aucun octet.

Le commit `d56202b178d1ecd8cab7e3a4a876aa50501be815` adapte uniquement le packaging du workflow. Après la QA, le dossier complet `dist-combat/` est archivé dans `standalone.tar`, accompagné de `SHA256SUMS`, puis fractionné en morceaux de **480 MiB maximum**. Le run nº 103 a publié `infernal-versus-standalone-part-00` et `infernal-versus-standalone-part-01` ; le workflow prévoit aussi un `part-02` conditionnel. Les artifacts sont conservés sept jours.

Le [transfert vérifié](browser-artifact-transfer.json) reconstitue une archive de **964 085 760 octets**, dont le SHA-256 est `26bb4a74c4cff7b8cc4db8294fed6d05f65d007d0411b19ddc98852b6a1828f8`. Les ZIP, les morceaux, l’archive complète, le manifeste et ses **1 350 fichiers** ont été vérifiés. Le dossier servi au navigateur provient de cette archive intacte. L’[audit de couverture](audit-runtime-coverage.mjs) utilise le dossier extrait via `--bundle-dir`, sans recours au dossier public du checkout partiel.

### Recette navigateur et revue des captures

| Preuve | Origine exacte |
| --- | --- |
| Bundle compilé et testé | **Quality gate nº 103**, run `45948785155`, commit **`d56202b178d1ecd8cab7e3a4a876aa50501be815`**. |
| Exécution de la recette | **[Gallery V17 acceptance nº 3](https://github.com/darknigthmare/hellbound-hotel-manager/actions/runs/45952367618)**, run `45952367618`, job `140350918733`, tête du workflow **`8c0f9953ac798838f354399c029c79e1d139ffd7`**, checkout du merge `5985ecbb43e2bed360a234b932f8d9473d808534`. |

La [recette réelle](browser-gallery-qa.json) passe **14 contrôles** dans Chromium sur un runner GitHub Actions : recherche, catégorie Accessoires, ouverture des quatre fiches, décodage et image entière, liens de référence visibles, fermeture et retour du focus, exclusion des trois objets S2 sous le filtre S1, maintien de la canette S1 et restauration du contenu. Elle couvre **1440 × 1000 sur ordinateur** et **390 × 844 en mobile émulé**. Aucune erreur de page, de console, de réponse HTTP locale ou de requête échouée n’est observée.

Les **20 captures originales**, dix par format, ont toutes été ouvertes et inspectées dans la [revue visuelle](browser-visual-review.json). Les quatre contours solides sont entiers dans les vues de détail ; aucun halo parasite, chevauchement ou débordement horizontal bloquant n’a été constaté. Les captures de références montrent une portion normale du défilement vertical : les longues notes peuvent continuer sous le viewport et l’image se trouver au-dessus. La capture du filtre S1 montre une carte de canette partielle en bas d’écran ; sa vue de détail séparée prouve l’image entière. Le [reçu des preuves](browser-evidence-transfer.json) vérifie l’archive et les empreintes des captures. Les rapports bruts et les images de CI restent inchangés.

Les liens externes ont été contrôlés comme éléments visibles et URL enregistrées ; leurs destinations et les épisodes complets n’ont pas été revisités. Aucun appareil physique, combat, animation ou mécanisme de moteur n’est couvert. Les couleurs, proportions et détails fins restent des adaptations de sources de petite taille. **La fidélité artistique 1:1 n’est pas certifiée.**

### Tentatives conservées

| Tentative | Résultat réel et preuve conservée |
| --- | --- |
| Navigateur local | Exécutable Chromium absent ; aucune page créée, aucune capture. [Rapport de lancement](browser-gallery-qa-attempt-01-launch-failure.json) et [revue bloquée](browser-visual-review-attempt-01-local-blocked.json). |
| Workflow Gallery nº 1 | Rejet avant tout job : `runner.temp` utilisé dans un contexte de job non autorisé. [Preuve de validation](browser-workflow-attempt-01-validation-failure.json). |
| Workflow Gallery nº 2 | Bundle et Chromium réels chargés, puis échec d’un sélecteur du harness ; aucun contrôle métier accompli. Le sélecteur a été corrigé sans modification du jeu. [Reçu](browser-harness-attempt-02-selector-failure.json) et [dossier intact](browser-attempt-02-selector-failure/). |

### Finalisation des métadonnées

Après cette recette, les quatre champs `inGameChecked` du catalogue sont passés de `false` à `true`, avec une [comparaison exacte](catalogue-finalization.json). Tout le reste du contenu JSON est identique. La [revue des consommateurs](metadata-scope-review.json) confirme que la galerie ne lit pas ce champ : les images, textes, filtres et règles utilisés par l’interface sont inchangés. Le JSON étant importé par l’application, cette modification peut néanmoins changer les octets du JavaScript compilé ; **aucune identité des bundles compilés n’est revendiquée**. La recette demeure celle du bundle nº 103.

Le workflow de recette temporaire est retiré de `.github/workflows/` ; sa [copie exécutée](browser-workflow-executed.yml) et sa [copie documentaire](browser-gallery-workflow.yml) restent conservées.

## Bible et guides

La [Bible V17](../INFERNAL_VERSUS_BIBLE_V17.xlsx) est vérifiée : **72 feuilles et 81 tableaux**, **809 356 octets**, SHA-256 `d7e00ef9529d28e8df61ee78a043809418074f4478275c1a60069a5e91295bff`. Elle ajoute **Production V17** avec quatre livraisons et **Cibles V17** avec 111 lignes de suivi. Les **220 parties historiques gelées**, dont les **70 feuilles et 79 tableaux V16**, restent identiques à l’octet. Les six feuilles des extensions de guides sont héritées sans duplication.

La [QA du classeur](workbook-qa.json) et sa [revue visuelle](workbook-visual-review.json) contrôlent les rendus, les valeurs après réimport, les six nouvelles formules et la conservation OOXML. Les deux feuilles ajoutées ne présentent aucune cellule d’erreur de formule. Le calcul a été contrôlé avec Artifact Tool, y compris changement de valeur, recalcul et restauration ; **aucun recalcul dans Excel natif n’a été exécuté**.

Le [classeur partagé](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) a été remplacé en V17 au **même identifiant Drive et dans le même dossier**, le 27 novembre 2026 à 06:42:26 UTC. Le téléchargement après remplacement est identique octet par octet au fichier du dépôt et à la copie de livraison : **809 356 octets**, même SHA-256. La [preuve Drive](drive-publication.json) conserve les métadonnées et la comparaison. La [Bible V16](../INFERNAL_VERSUS_BIBLE_V16.xlsx) reste une archive de référence.

Le [guide général et les deux extensions](../COMBAT_GUIDES.md), leurs 68 rubriques et les sept déblocages optionnels V15 sont conservés. Cette production d’objets n’implémente pas les assistances, relais, techniques collectives ou nouveaux bonus décrits dans ces guides.

## Traçabilité

- [Registre V17 et statut de validation](delivery-register.json).
- [Handoff des deux premiers objets](props-handoff.json).
- [Prompts du moteur et de la première mâchoire](root-prompts.json).
- [Prompts, sources et résultats des corrections](trophy-corrections.json).
- [Revue des candidats et dessins retenus](independent-visual-review.json).
- [Plan d’extension actualisé](../extension-plan.json).

Les preuves techniques et navigateur sont rattachées à leurs origines exactes. Les fichiers historiques V14–V16 restent des preuves de leurs propres livraisons.

