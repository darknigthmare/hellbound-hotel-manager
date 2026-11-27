# Hellbound — Infernal Versus

Mode combat autonome de Hellbound Hotel Manager. Depuis Pentagram Arena, ouvrez **Infernal Versus**. L’entrée Web directe est `/combat.html`.

<!-- V17_CURRENT_START -->
## État courant — 27 novembre 2026, production statique V17

**Quatre accessoires sont intégrés à la galerie ; production, CI, transfert, recette navigateur et Bible V17 sont vérifiés. Drive est mis à jour à l’identique.** Le raccordement des images est publié au commit [`2a7c956`](https://github.com/darknigthmare/hellbound-hotel-manager/commit/2a7c956ceedfb4f3a845af67c621290f7fd41654), dans la [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8). Les sections historiques ci-dessous concernent leurs versions respectives.

La [production V17](production-v17/README.md) ajoute la **canette bleue de Spring Broken**, les **deux trophées muraux de Crimson corrigés en V2** et le **moteur hors-bord d’Unhappy Campers**. Six générations ont produit **quatre dessins retenus et deux candidats rejetés**. Le lot accepté contient **4 PNG natifs et 4 WebP sans perte**, soit **8 fichiers et 4 672 320 octets**. Les masters rejetés sont conservés ; leurs exports sont archivés hors du dossier public et exclus de la livraison.

| Indicateur courant | Total V17 |
| --- | ---: |
| Entrées de galerie | **149** |
| Bases autonomes | 115 |
| Kits jouables | 43 |
| Arènes | 51 |
| Familles de costumes | 27 |
| Identifiants sans base entière | 94 |
| Identités distinctes sans base entière | 93 |

Les objets restent des accessoires statiques de réserve. Aucun personnage, costume, kit, cycle animé, placement d’arène ou projectile jouable n’est ajouté. La [revue artistique](production-v17/independent-visual-review.json) et les [corrections](production-v17/trophy-corrections.json) conservent les écarts observés. La parité RGBA des exports est vérifiée ; **la fidélité 1:1 n’est pas certifiée**.

La [QA principale V17](production-v17/runtime-qa.json), **Quality gate nº 103**, passe `npm run qa` : **439 tests dans 51 suites**, TypeScript, ESLint, les builds manager et standalone, puis **1 350 empreintes de distribution**. Le bundle provient du commit **`d56202b178d1ecd8cab7e3a4a876aa50501be815`** ; ce commit adapte uniquement le packaging depuis le raccordement initial. La [QA nº 102](production-v17/runtime-qa-initial.json) reste archivée.

La [recette navigateur](production-v17/browser-gallery-qa.json) s’exécute séparément dans **[Gallery nº 3, run 45952367618](https://github.com/darknigthmare/hellbound-hotel-manager/actions/runs/45952367618)**, sur la tête de workflow `8c0f9953ac798838f354399c029c79e1d139ffd7`. Elle inspecte le bundle nº 103 intact, passe **14 contrôles** et produit **20 captures toutes relues**, en 1440 × 1000 et 390 × 844 émulé. Recherche, filtres, quatre images entières, références, fermeture et retour du focus sont vérifiés ; aucune erreur page, console, HTTP locale ou requête échouée n’est observée. La [revue visuelle](production-v17/browser-visual-review.json) précise les limites de défilement, de mobile émulé et de portée ; aucun nouveau combat ou cycle animé n’est validé par cette recette.

Le premier artifact unique du run nº 102 dépassait la limite de 512 MiB ; son [échec](production-v17/browser-artifact-transfer-initial-limit.json) est conservé. Le [transfert fractionné vérifié](production-v17/browser-artifact-transfer.json) du run nº 103 reconstitue l’archive complète et vérifie ses empreintes, le manifeste et ses 1 350 fichiers. L’[audit de couverture](production-v17/active-asset-coverage.json) confirme **746 références actives sur 746**, sans chemin cassé ni divergence.

Les quatre booléens `inGameChecked` ont été renseignés après cette recette. La [preuve de finalisation du catalogue](production-v17/catalogue-finalization.json) confirme que tous les autres champs sont identiques. La galerie ne lit pas ces booléens, mais leur modification dans le JSON importé peut changer les octets du JavaScript compilé : l’identité des bundles n’est pas revendiquée. Les preuves ci-dessus demeurent rattachées aux builds et exécutions indiqués.

La [Bible V17](INFERNAL_VERSUS_BIBLE_V17.xlsx) est vérifiée : **72 feuilles et 81 tableaux**, **809 356 octets**. Elle ajoute Production V17 (quatre livraisons) et Cibles V17 (111 lignes de suivi), en conservant à l’octet **220 parties historiques**, dont les **70 feuilles et 79 tableaux V16**. La [QA du classeur](production-v17/workbook-qa.json) contrôle Artifact Tool, réimport, OOXML et rendus ; aucun recalcul Excel natif n’est revendiqué. Le [même fichier Drive](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) est remplacé en V17 et son téléchargement est identique au fichier validé, selon la [preuve de publication](production-v17/drive-publication.json). Le [guide général et les deux extensions](COMBAT_GUIDES.md), leurs **68 rubriques**, et les **sept règles optionnelles de déblocage de V15** sont conservés. Les mécanismes d’équipe, extensions de taunts, nouveaux bonus et droits d’abonnement restent distingués de leur réalisation effective.
<!-- V17_CURRENT_END -->

<!-- V16_CURRENT_START -->
## Contenu conservé — 27 novembre 2026, production statique V16 (historique)

La reprise V14–V16 apporte **14 dessins distincts et 30 fichiers d’image**, pour **27 181 961 octets** : trois costumes statiques, deux arènes, deux accessoires de décor, la base entière de Queef et six archives de personnages. Les lots V14 et V15 récupèrent les productions déjà présentes ; la V16 ajoute les portraits séparés de **Gerald et Rick dans Barbie’s Bad Day**. Chaque dessin possède son master PNG et son export WebP sans perte ; les deux arènes possèdent aussi leur miniature.

| Lot | Contenu | Dessins | Fichiers d’image | Suivi |
|---|---|---:|---:|---|
| V14 | Blitzø en flashback, Millie et Moxxie en robe ; boutique de Full Moon, salle à manger de Crimson ; distributeur nuage et lustre vert | 7 | 16 | [Sources](production-v14/README.md) · [Registre](production-v14/delivery-register.json) |
| V15 | Queef en base entière ; portraits Roo et Top Hat Demon ; silhouettes narratives Eve et Lilith | 5 | 10 | [Sources](production-v15/README.md) · [Registre](production-v15/delivery-register.json) |
| V16 | Gerald et Rick, deux bustes narratifs statiques | 2 | 4 | [Sources](production-v16/README.md) · [Registre](production-v16/delivery-register.json) |

Le cumul est de **145 entrées de galerie, 51 arènes, 27 familles de costumes, 115 bases autonomes et 43 kits jouables**. Le catalogue reste à 209 identifiants et 208 identités distinctes après l’alias connu. **94 identifiants, soit 93 identités, attendent encore une base entière.** Les bustes et silhouettes restent qualifiés comme archives partielles ; aucun nouveau cycle animé ni kit jouable n’est ajouté par ces trois lots. Les références officielles, reproductions secondaires et adaptations sont distinguées dans les registres ; la fidélité 1:1 n’est pas certifiée.

Le [guide général et ses deux extensions](COMBAT_GUIDES.md) couvrent 68 rubriques, dont 38 nouvelles, avec 16 nouvelles fiches, huit duos prioritaires, dix concepts de bonus et 40 scénarios de recette. Le [socle local de déblocage](guide-extensions-20261127/runtime-integration.json) implémente sept règles optionnelles sur Lucifer, Stolas, les costumes Bodyguard de Blitzø et Moxxie, les Portes célestes, la Cour des Goetia et Boss Rush. L’option est désactivée par défaut, y compris dans les anciennes sauvegardes. Les sceaux, silhouettes, conditions textuelles et gardes de lancement sont en place. Le mode Duo, ses attaques combinées, les taunts, les nouveaux bonus et les droits d’abonnement restent documentés dans l’extension ; aucun backend de paiement n’est livré.

La [QA complète V16](production-v16/runtime-qa.json) réussit la commande standard `npm run qa` : **439 tests dans 51 suites**, TypeScript, ESLint, builds manager et standalone, et **1 346 empreintes de distribution**. Le [relevé des assets actifs](production-v16/active-asset-coverage.json) vérifie **742 chemins sans référence cassée**. La [recette de galerie V16](production-v16/browser-gallery-qa.json) passe huit contrôles et conserve [quatre captures inspectées](production-v16/browser-visual-review.json), sur ordinateur et mobile émulé. Les [déblocages](../../art/audits/unlock-slots-20261127/browser-qa.json) disposent de 28 contrôles navigateur et huit captures inspectées. Ces observations locales ne constituent pas un test sur appareil physique.

La [bible V16](INFERNAL_VERSUS_BIBLE_V16.xlsx) contient **70 feuilles et 79 tableaux**. Les 68 feuilles et 77 tableaux V15 sont préservés octet par octet ; seules Production V16 et Cibles V16 sont ajoutées. Les [preuves du classeur](production-v16/workbook-qa.json) documentent six formules contrôlées, 584 cellules comparées après réimport et la revue visuelle de six plages. Le [fichier Excel partagé](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) est mis à jour en V16 au même identifiant et dans le même dossier. Ses **786 503 octets** téléchargés sont identiques au classeur local validé, selon la [preuve de remplacement Drive](production-v16/drive-publication.json).
<!-- V16_CURRENT_END -->

<!-- V11_CURRENT_START -->
## Contenu conservé — 26 novembre 2026, production statique V11 (historique)

La V11 livre **7 dessins distincts et 15 fichiers d’image** : trois portraits partiels (Molly historique 2015, Mister Butler dans The Circus, Better Than Blitzo Guy dans Apology Tour), une salle de consultation de Sloth, son conteneur séparé et deux trophées distincts de la vitrine d’Oops. Les masters PNG natifs, les WebP sans perte et une miniature représentent **14 006 984 octets**. Voir le [rapport V11](DELIVERY_STATIC_V11_2026-11-26.md), le [registre final](production-v11/delivery-register.json) et les [sources de production](production-v11/README.md).

Le cumul atteint **46 arènes et 121 entrées de galerie**, avec **112 bases autonomes**, **24 familles de costumes** et 43 kits actifs. Les trois portraits restent partiels : **97 identifiants**, soit **96 identités distinctes après l’alias connu**, attendent toujours une base entière. Les 115 fiches historiques sont préservées. Molly conserve son année 2015 et Crymini son année 2017. Aucun cycle animé n’est ajouté ; fidélité 1:1 non certifiée. Le refus du petit majordome reste consigné et n’a pas été relancé ; il est distinct du grand Mister Butler accepté.

Les [contrôles techniques V11](production-v11/runtime-qa.json) passent **413 tests / 47 suites**, TypeScript, ESLint, les deux builds et **1 312 empreintes de distribution**. Le [relevé actif](production-v11/active-asset-coverage.json) vérifie **708 chemins sans référence cassée**. La [recette navigateur](production-v11/browser-qa.json) passe **170 contrôles**, couvre les sept dessins et conserve **48 captures inspectées** sur ordinateur et mobile émulé. Les marges du fond, les filtres et les corrections de recette sont explicités dans les preuves.

La [Bible V11](INFERNAL_VERSUS_BIBLE_V11.xlsx) contient **54 feuilles et 63 tableaux**. Elle conserve les 52 feuilles, 51 relations et 61 tableaux V10 octet par octet. Neuf vues rendues sont inspectées et les six nouvelles formules vérifiées. Le [même classeur Drive](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) est mis à jour en V11 ; les **638 528 octets** téléchargés sont identiques au fichier local final, selon la [preuve Drive](production-v11/drive-publication.json).

Les lots V10 et V11 représentent ensemble **18 dessins distincts et 39 fichiers d’image**, pour **33 957 079 octets**, depuis la V9 publiée. L’archive de reprise et les preuves historiques restent conservées avec le jalon V10.
<!-- V11_CURRENT_END -->

<!-- V10_CURRENT_START -->
## Contenu conservé — 26 novembre 2026, production statique V10 (historique)

La V10 livre **11 dessins distincts et 24 fichiers d’image** : trois bases entières de réserve (Melissa, Loo Loo et Crymini historique 2017), trois costumes statiques (Loona, Moxxie et Charlie), deux décors et trois objets séparés. Les masters PNG natifs, exports WebP sans perte et deux miniatures représentent **19 950 095 octets**. Voir le [rapport V10](DELIVERY_STATIC_V10_2026-11-26.md), le [registre](production-v10/delivery-register.json) et les [sources de production](production-v10/README.md).

Le cumul atteint **112 bases autonomes**, **24 familles de costumes**, **45 arènes** et **115 entrées de galerie**, avec 43 kits actifs. Les bases nouvelles couvrent trois identités existantes ; 97 identifiants, soit 96 identités distinctes après l’alias connu, restent sans base entière. Crymini est marquée comme conception de 2017 ; le Noël de Blitzø comme vision familiale. Les costumes gardent une seule pose statique, et les deux exigences de Charlie pointent vers un seul dessin. Fidélité 1:1 non certifiée.

La [recette navigateur](production-v10/browser-qa.json) passe **352 contrôles** pour les onze assets, sur ordinateur et mobile émulé, avec 68 captures conservées dont 51 relues. La [validation technique](production-v10/runtime-qa.json) passe **413 tests / 47 suites**, TypeScript, ESLint, les deux builds et 1 310 empreintes de distribution. Le [contrôle des chemins](production-v10/active-asset-coverage.json) vérifie 700 références sans fichier manquant. Les conditions locales, les limites mobiles et les tentatives antérieures sont documentées dans les rapports.

La [bible V10](INFERNAL_VERSUS_BIBLE_V10.xlsx) contient **52 feuilles et 61 tableaux**. Ses 50 feuilles historiques, 49 relations et 59 tableaux V9 sont préservés octet par octet. Dix vues rendues sont inspectées ; la [QA du classeur](production-v10/workbook-qa.json) consigne les formules et limites de vérification.

Les fichiers locaux historiques sont rassemblés dans l’[archive de reprise](local-recovery-2026-11-26/README.md) : **456 fichiers uniques**, plus trois fichiers d’accompagnement, avec **582 correspondances de source à destination vérifiées**. Cette archive conserve aussi les candidats remplacés, explicitement exclus des dessins retenus.
<!-- V10_CURRENT_END -->

<!-- V9_CURRENT_START -->
## Contenu conservé — 26 novembre 2026, production statique V9 (historique)

La V9 contient **7 dessins retenus et 15 fichiers d’image** : 7 masters PNG, 7 exports WebP sans perte et une miniature, pour **14 294 928 octets**. Elle ajoute Lute après le final S1 comme tenue statique sélectionnable, un portrait à la taille de la mère de Moxxie, le grimoire fermé de Stolas, la peluche THING? et le salon du bar de Beelzebub avec tabouret et cloison séparés. Le [rapport de livraison V9](DELIVERY_STATIC_V9_2026-11-26.md), le [registre](production-v9/delivery-register.json) et les [sources de production](production-v9/README.md) décrivent chaque usage.

Le cumul est de **43 combattants, 43 arènes, 21 familles de costumes, 106 entrées de galerie et 109 bases autonomes**. Le portrait de la mère reste partiel ; la tenue de Lute ne crée ni identité, ni base autonome, ni kit. Les 100 identifiants de catalogue sans base, soit 99 identités après l’alias connu, restent ouverts. Aucun cycle animé n’est ajouté.

La [revue indépendante](production-v9/independent-review-root.json) accepte les sept masters. La cloison finale possède **8 rangées principales et 38 ouvertures**, avec contour inférieur complet. Les trois essais remplacés sont exclus du décompte. Le grimoire adapte la reliure d’un produit officiel spiralé ; les références de Lute sont des prévisualisations de 320 × 180. **Fidélité 1:1 non certifiée.**

<!-- V9_QA_STATUS_START -->
Le [contrôle navigateur V9](production-v9/browser-qa.json) passe **99 vérifications sur 99**, avec les sept assets explicitement couverts en Chromium local, sur bureau et mobile émulé. Il comprend la tenue de Lute, le salon, les six aperçus de galerie et les filtres de saison. Le [relevé actif](production-v9/active-asset-coverage.json) vérifie **687 chemins sans référence cassée**. Les observations navigateur ne constituent pas une recette exhaustive de tous les modes ou un test sur appareil physique.

La [validation technique finale](production-v9/runtime-qa.json) passe **413 tests dans 47 suites**, TypeScript, ESLint, les builds manager et standalone et **1 291 empreintes de distribution**. Les builds ont utilisé `copyPublicDir: false` puis des liens physiques pour les fichiers publics ; la commande unique `npm run qa` n’a pas été exécutée. Le registre V9 est finalisé. La [bible V9](INFERNAL_VERSUS_BIBLE_V9.xlsx) contient **50 feuilles**, dont les 48 historiques V8 préservées, et 59 tableaux. La [QA du classeur](production-v9/workbook-qa.json) documente neuf rendus relus, six formules contrôlées dans les ajouts et aucune erreur de formule dans les deux nouveaux onglets.

Le [classeur de suivi Drive](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) est mis à jour en V9 au même identifiant. Les métadonnées ont été relues et les **602 294 octets** du fichier téléchargé correspondent octet par octet au classeur local final ; la [preuve de publication](production-v9/drive-publication.json) conserve son SHA-256.
<!-- V9_QA_STATUS_END -->
<!-- V9_CURRENT_END -->

## Lancer et construire

```bash
npm ci
npm run dev
# Ouvrir http://localhost:3000/combat.html
npm run build
# Application hôtel + entrée combat.html dans dist/
npm run build:standalone
npm run check:standalone
# Servir dist-combat/ comme racine d'un serveur HTTP statique.
```

Le fichier `dist-combat/index.html` est autonome vis-à-vis du manager. Aucun chargement de `App`, `localDb`, `cloudAccount` ou sauvegarde de gestion n'est nécessaire. Le build réutilise les assets du dépôt; ces images sont chargées à la demande par le navigateur. Le build s'utilise via HTTP à la racine du domaine, pas par double-clic `file://` ni sous un sous-chemin arbitraire.

## V8 récupérée et publiée — 26 novembre 2026

La production V8 a été récupérée puis publiée sur la branche de la [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8), avant la continuation V9. Son [registre final](production-v8/delivery-register.json) conserve **18 dessins distincts et 38 fichiers d’image** : 18 PNG, 18 WebP et deux miniatures. Les neuf costumes statiques, quatre incarnations narratives, deux arènes et trois accessoires de décor sont décrits dans les [sources V8](production-v8/README.md).

La [bible V8](INFERNAL_VERSUS_BIBLE_V8.xlsx) conserve 48 feuilles. À cette étape, le cumul était de 43 combattants, 42 arènes, 20 familles de costumes, 100 entrées de galerie et 109 bases autonomes. Les résultats et limites V8 restent historiques ; la validation V9 est suivie séparément dans la section courante ci-dessus.

<!-- V7_CURRENT_START -->
## Contenu conservé — 26 novembre 2026, production statique V7 (historique)

La production statique V7 livre **45 dessins distincts** : 44 nouveaux dessins et 1 correction d’un dessin existant. Les fichiers livrables comprennent **45 masters PNG, 45 exports WebP sans perte et 3 miniatures**, soit **93 fichiers d’image** (80 143 856 octets). Chaque personnage, objet, machine, fond et élément de décor possède son fichier séparé. Aucun cycle animé n’est ajouté.

La [bible V7](INFERNAL_VERSUS_BIBLE_V7.xlsx), le [rapport de livraison](DELIVERY_STATIC_V7_2026-11-26.md) et le [registre](production-v7/delivery-register.json) décrivent 109 bases autonomes (40 actives et 69 en réserve), 84 entrées de galerie et 40 arènes. Le roster conserve ses 43 kits. Les deux arènes S3 nécessitent une activation explicite ; les anciennes sauvegardes les gardent masquées.

Apple utilise sa correction V7 sans nouvelle entrée. Les archives Loona/Fizz restent narratives. Les trois nouvelles arènes comportent chacune un fond et deux éléments séparés. Les 9 refus V7 ne fournissent aucun fichier. 100 IDs (99 identités distinctes) restent sans base, avec leur motif individuel. Aucun nouveau cycle animé n’est ajouté.

47 suites et 413 tests passent. TypeScript, ESLint, les builds manager et standalone, et le contrôle de 1 263 fichiers de distribution passent. Deux essais de build standard ont été interrompus avec le code 137 pendant la copie des images. La validation locale utilise ensuite une compilation équivalente avec copie publique désactivée temporairement et fichiers publics assemblés par liens physiques ; les empreintes et le contrôle standalone sont vérifiés. Cette procédure ne constitue pas une réussite locale de la commande npm run qa standard. Le [contrôle runtime](production-v7/active-asset-coverage.json) trouve 659 chemins valides. La revue statique est documentée, mais le [contrôle navigateur](production-v7/browser-qa.json) et les performances mobiles ne sont pas exécutés ; fidélité 1:1 non certifiée. Les 43 feuilles historiques sont conservées et trois feuilles V7 ajoutées. Le [classeur Drive](https://drive.google.com/file/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU) garde le même identifiant.
<!-- V7_CURRENT_END -->

## Contenu conservé — 25 novembre 2026, production statique V6 (historique)

La [bible V6](INFERNAL_VERSUS_BIBLE_V6.xlsx) conserve les 40 feuilles V5 et ajoute **Production V6, Cibles V6 et Repères V6**. Le [rapport de livraison](DELIVERY_STATIC_V6_2026-11-25.md) et le [registre V6](production-v6/delivery-register.json) décrivent **9 dessins distincts et 20 fichiers d’image** : six bases Helluva, une machine D.H.O.R.K.S. isolée et deux fonds d’arène. Les trois retouches ciblées remplacent leurs versions initiales et ne sont pas comptées comme des dessins supplémentaires.

Le jeu expose **43 combattants**, **37 arènes**, **11 familles de costumes sélectionnables** et **49 éléments en galerie de réserve**. Il possède **83 bases autonomes explicites** : 40 actives et 43 en réserve. Les nouvelles bases Josh, Coco, Apple, Kat, Milky et Kiki restent des dessins consultables dans la galerie ; elles ne constituent pas six kits jouables.

L’annexe d’entraînement est une création originale **AU**. Le bureau de Vox S2 adapte un intérieur précisément référencé ; la façade et l’architecture complète de la tour restent hors de cette livraison. La machine-portail est une image statique séparée, sans mécanisme de téléportation. Aucun nouveau cycle d’animation n’est ajouté.

Les [références et revues visuelles](production-v6/independent-visual-review.md) consignent les écarts observés. Apple a retrouvé ses bracelets et les branches de sa queue, mais le motif du mollet reste différent. Le rendu 1:1 n’est pas certifié. Les cinq nouveaux refus du générateur ne fournissent aucun fichier et ne sont pas comptés comme livraisons ; les deux scènes narratives historiquement refusées restent à **127/129**, avec **11/11** illustrations globales.

La [validation automatisée V6](production-v6/validation.json) et le [contrôle des chemins d’images](production-v6/active-asset-coverage.json) portent sur ce lot. Le [rapport navigateur](production-v6/browser-qa.json) consigne le contrôle non exécuté : Chromium est absent et son téléchargement officiel est refusé. Les observations navigateur V5 ci-dessous restent historiques. Les [sources et commandes V6](production-v6/README.md) permettent de reconstruire le suivi et la bible.

## Contenu conservé — 25 novembre 2026, production statique V5 (historique)

La [bible V5](INFERNAL_VERSUS_BIBLE_V5.xlsx) conserve les 34 feuilles V4 et ajoute six vues : production, catalogue, variantes, illustrations, livraisons et suites. Le [rapport de livraison](DELIVERY_STATIC_V5_2026-11-25.md), le [registre vérifié](production-v5-register.json) et le [relevé courant](production-static-v5.json) décrivent ce lot de **168 dessins statiques**.

Le jeu propose **43 combattants**, **35 arènes**, **11 costumes sélectionnables** et **42 éléments en galerie de réserve**. Les campagnes personnelles V3 disposent de **127/129 images produites**, dont 127 affectées au jeu. La campagne globale possède **11/11 images**, dont 11 affectées. 2 scènes restent marquées comme refusées par le générateur, sans relance. Aucun nouveau cycle d’animation n’est ajouté.

Les 43 kits, les mouvements existants et les limites de fidélité restent explicitement séparés de ces dessins. Les [contrôles des images](QA_STATIC_IMAGES_V5_2026-11-25.json) comparent les pixels PNG/WebP et leurs empreintes. Le [contrôle du classeur](QA_STATIC_WORKBOOK_V5_2026-11-25.json) documente la préservation des anciennes feuilles et la vérification des vues V5. La fidélité 1:1 n’est pas certifiée.

La [QA automatisée](QA_RUNTIME_STATIC_V5_2026-11-25.json) passe 408 tests et contrôle les 1204 empreintes du standalone. Les [builds filtrés](QA_FILTERED_BUILD_V5_2026-11-25.json) passent. Le [rapport navigateur](QA_BROWSER_V5_2026-11-25.json) décrit les vues observées sur le commit publié. Les [sources de production archivées](production-v5/README.md) permettent de reconstruire ce suivi depuis le dépôt.

## Contenu conservé — 25 novembre 2026, guide V4 (historique)

La [bible V4](INFERNAL_VERSUS_BIBLE_V4.xlsx) et son [chapitre lisible](INFERNAL_VERSUS_GUIDE_V4.md) associent les **30 rubriques du guide général et dix fiches A–J** au jeu réel. Le [guide source](references/Combat_Games_Guide_General_v1.0.txt) est conservé à l’identique. Les **29 feuilles de la V3 restent archivées dans le classeur**, avec cinq nouvelles vues : Guide V4, Fiches V4, Campagne globale, Réserves V4 et Recette V4.

Le [fichier Excel de suivi sur Google Drive](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) a été mis à jour au même identifiant le 25 novembre 2026 : **INFERNAL_VERSUS_BIBLE_V4.xlsx**, 416 663 octets. Son nom, sa taille, son format et son dossier parent ont été relus après remplacement.

- **43 routes personnelles V3 et 129 duels** sont raccordés aux Chroniques. Les anciennes sauvegardes reprennent leur route V1, avec leur ancien ordre d’adversaires et leurs fins propres.
- **La nuit du signal libre** ajoute une campagne AU distincte de neuf chapitres, avec huit identités jouables successives, objectifs, dialogues, conséquences et reprise entre les duels.
- **La galerie de réserve expose 22 dessins** : 13 bases de personnages, huit bases d’ennemis et une fléchette. Ces images restent hors des kits et ne sont pas présentées comme des combattants ou projectiles fonctionnels.
- **Trois présentations du décor** : vivant, réduit et statique. Le mode réduit fixe la caméra et ralentit les figurants ; le mode statique fige leur présentation. La préférence système de réduction des mouvements force la présentation statique. Les règles de combat restent identiques.
- **Neuf modes** : Versus CPU, Versus local, Entraînement, Histoire, Campagne, Tournoi, Arcade, Survie et Boss Rush. Le catalogue conserve **43 combattants, 30 arènes et 133 attaques paramétrées**.
- Les **129 briefs d’illustration V3**, **172 concepts de techniques** et **43 storyboards de Dernier Acte** restent distingués de leur réalisation. **Aucune illustration ancienne n’est automatiquement attribuée à V3** : les 22 dessins narratifs existants et leurs 26 affectations restent liés aux routes V1. V3 utilise décors et portraits en attendant une association vérifiée.

Le lot V4 n’ajoute aucun dessin, cycle d’animation, kit ou mécanique de projectile. Trois liaisons entre arènes sont décrites dans la bible, mais leurs transitions restent à développer. Les champs `runtimeIntegration` de la source V3 et `meta.currentRuntime` du plan décrivent désormais le raccordement effectif ; les flags historiques du lot I sont conservés séparément.

La recette locale courante a réussi : **45 suites / 395 tests**, TypeScript, ESLint, les builds manager et standalone et **1 031 fichiers de distribution vérifiés**. Les tests d’interface utilisent JSDOM. **Aucune validation réelle en navigateur n’est revendiquée** : le binaire Chromium est absent et le téléchargement officiel Playwright a été refusé (HTTP 403). Voir le [rapport runtime V4](QA_RUNTIME_GUIDE_V4_2026-11-25.json), le [rapport de livraison](DELIVERY_GUIDE_V4_2026-11-25.md), les [associations de données](QA_GUIDE_DATA_V4_2026-11-25.json) et les [contrôles du classeur](QA_GUIDE_WORKBOOK_V4_2026-11-25.json). Les tests ne certifient pas la fidélité artistique 1:1.

## Contenu conservé — 25 novembre 2026, vague I (historique)

Les chiffres et descriptions de cette section décrivent la livraison I avant le raccordement V4 ci-dessus.

- **43 combattants jouables** : 25 de *Hazbin Hotel* et 18 de *Helluva Boss*. Vortex, Glitz et Glam ont rejoint le standalone avec la vague F. Les vagues G, H et I complètent les dessins de base en réserve.
- **133 attaques paramétrées** : 129 légers, lourds et spéciaux, plus les quatre signatures de Vaggie, Blitzø, Mimzy et Sallie May. Le carnet expose commandes, temps, portée et tension.
- **Six costumes et 35 poses de costume** : Vaggie exorciste, Loona humaine, Stolas humain, Moxxie au festival des moissons, Carmilla cheveux lâchés et Lute avant sa blessure de fin de saison 1.
- **40 poses individuelles d’attente, 17 gardes distinctes, 17 contacts légers et 18 réactions** pour le roster actif. Ces poses clés ne constituent pas des cycles complets. Aucun dessin d’animation n’est ajouté par G, H ou I.
- **30 arènes à trois plans**. Le couloir du One Star Wonder et la salle de fête d’*Apology Tour* ajoutent deux fonds, quatre accessoires séparés et deux miniatures après les trois arènes de G. Les fonds conservent leur ratio natif entier. Le manager conserve ses huit arènes.
- **14 images VFX pour 28 associations d’attaques**. Leurs affectations restent identiques à F. Les effets suivent les coups existants, sans collision ou dégâts supplémentaires.
- **21 bases en réserve** : Vassago, Wally Wackford, Barbie Wire, Martha, Mrs Mayberry, Paimon, Cash Buckzo, Joe, Lin, Agent One, Agent Two, Cletus, Collin, Keenie, Robo Fizz, Chaz, Alessio, Elder Jaws, Rolando, Dennis et Toledo. Une image READY par identité, avec ses références et ses limites ; aucun nouveau kit ou récit.
- **Une fléchette D.H.O.R.K.S. isolée en réserve**. La flèche C.H.E.R.U.B. et le shuriken sont différés faute de contour suffisamment net dans les références inspectées.
- Histoire, Tournoi, Versus CPU, Versus local, Entraînement, Arcade, Survie et Boss Rush. Le Boss Rush tire parmi neuf adversaires possibles, puis retire le combattant du joueur s’il appartient à ce groupe.
- L’Histoire propose **43 routes et 129 duels écrits**. Les scénarios sont des créations AU. Les filtres de saison et d’univers déterminent les routes accessibles.
- Le Tournoi construit un tableau reproductible de huit, quatre ou deux participants suivant l’effectif disponible. Une défaite élimine le joueur.
- Un lourd touchant sans garde peut être suivi d’un spécial dès la fin de l’arrêt sur impact, pendant sa récupération. Cet enchaînement consomme 50 de tension.
- Un K.-O. décisif ouvre une fenêtre de 3,2 secondes : H pour J1, L pour J2 ou **Dernier Acte**. La finition dure 1,5 seconde ; **Passer** rejoint directement la victoire.
- Trois difficultés, recherche et filtres d’univers/saison ; clavier partagé et contrôles tactiles ; pause et relâchement des commandes lors d’une perte de focus ; réduction des mouvements et des flashes.

L’entraînement propose un mannequin immobile ou en garde, une jauge illimitée et une réinitialisation, sans enregistrer de résultat. Les parcours reprennent le duel en cours depuis son début après une sortie. Les PV sont restaurés entre les rencontres, y compris en Survie. Les autres modes de parcours proposent une reprise explicite après une défaite ; les réessais sont mémorisés.

## Sauvegarde séparée

La seule clé écrite par le standalone est `hellbound_infernal_versus_v1`. Les données d'hôtel et d'inventaire sont exclues. Les imports vérifient version, champs, identifiants, options, compteurs, historique et parcours. Un chargement corrompu ne remplace pas automatiquement les octets existants. Si le stockage est indisponible, le jeu reste utilisable pour la session et affiche l'état d'enregistrement.

Chaque résultat porte un identifiant unique, empêchant les doubles récompenses. L'historique affichable conserve trente résultats; le registre de déduplication reste borné à dix mille matchs. Une limite atteinte produit une erreur explicite.

## Portée de la fidélité

Les identités, incarnations et motifs sont rattachés aux sources des manifestes. Les nouveaux personnages suivent une incarnation précise : Barbie en imp, Martha et Mayberry en sinner, Vassago en tenue du tribunal. Les épisodes officiels, produits sous licence et portraits historiques d’appoint sont distingués dans les revues [G](REVIEW_ASSETS_WAVE_G_2026-11-25.md) et [H](REVIEW_ASSETS_WAVE_H_2026-11-25.md). Paimon, Cash, Joe et Lin reçoivent une base neutre en H. I ajoute Chaz, Alessio, Elder Jaws, Rolando dans sa forme démoniaque, Dennis et Toledo ; voir [la revue I](REVIEW_ASSETS_WAVE_I_2026-11-25.md).

**La fidélité exacte 1:1 n’est pas certifiée.** Les références officielles de G, H et I sont principalement des prévisualisations de 320 × 180. Le plan rapproché de Toledo reste à vérifier, et les détails fins d’Elder Jaws proviennent surtout du portrait historique. Les parties basses de Martha et Mayberry, certains petits détails et la pointe cachée de la fléchette restent des reconstructions. Les poses neutres, pistes de duel et placements d’accessoires sont des adaptations de présentation. Les PNG sont conservés à l’octet et les WebP de production sont sans perte, à leur taille native.

Les finitions comprennent 43 titres et des traitements partagés ; cinq personnages disposent d’une pose de finition dédiée. Les illustrations narratives couvrent 26 affectations V1 avec 22 dessins distincts ; aucune affectation V3 n’est validée par défaut. Les anciennes demandes refusées restent consignées dans leurs lots. En H, Clara, Odette, Deerie et Loopty ont reçu chacun un refus du générateur ; aucun fichier produit ni relance après refus. I ne reçoit aucun refus et conserve six dessins, après remplacement d’un premier essai de Rolando.

Le lancement du navigateur G a échoué parce que le binaire Chromium était absent ; son absence a été confirmée en H. Les compositions statiques et les contrôles de fichiers ne certifient pas les transitions, les tailles canoniques relatives ou le rendu sur appareil. Les détails figurent dans le [rapport de revue H](REVIEW_ASSETS_WAVE_H_2026-11-25.md).

## Couverture des assets — vague I

Le [relevé](ASSET_COVERAGE.json) distingue **428 chemins actifs présents** et **22 dessins en réserve / 44 fichiers présents**. Les réserves G, H et I ne sont ajoutées ni aux compteurs de combattants ni aux affectations d’effets.

| Élément actif | Disponible | Reste pour couvrir les 43 combattants |
| --- | ---: | ---: |
| Pose individuelle d’attente | 40 | 3 |
| Garde individuelle distincte | 17 | 26 |
| Pose de contact léger | 17 | 26 |
| Pose individuelle de réaction | 18 | 25 |
| Pose clé de finition | 5 | 38 |
| Illustrations d’introduction, rivalité et épilogue | 26 sur 129 | 103 affectations |

Les **30 arènes possèdent trois plans enregistrés**. Les nouveaux fonds restent entiers en `contain` ; leurs accessoires suivent le même repère et restent derrière les combattants. Sans unités CSS de conteneur, les accessoires ajoutés sont masqués et le fond reste visible.

La vague I apporte **6 dessins retenus et 12 fichiers d’image de production** : quatre bases de personnages et deux bases d’ennemis, avec leurs masters PNG et exports WebP sans perte. Le cumul des sept lots tracés sur la PR est de **165 dessins / 346 fichiers de production**. Les images de diagnostic sont comptées séparément. Consulter le [manifeste I](../../art/infernal-versus/production/delivery-wave-i-2026-11-25.json), le [catalogue cumulatif de réserve](../../art/infernal-versus/production/reserve-assets.json) et le [rapport de livraison I](DELIVERY_WAVE_I_2026-11-25.md).

Les pièces de réserve des lots antérieurs — vêtements, chapeau, queue, canne, lance et variantes de décor — restent conservées avec leur propre statut. Le catalogue cumulatif porte uniquement sur les bases et le projectile des vagues G, H et I ; les manifestes datés restent inchangés.

## Bible de production V3 — archive historique

La V4 et son état actuel sont présentés en tête de ce document. Les descriptions suivantes conservent la provenance et le contenu de la V3 au moment de sa livraison.

[Ouvrir le classeur V3](INFERNAL_VERSUS_BIBLE_V3.xlsx) ou [lire les fiches complètes](INFERNAL_VERSUS_CAMPAIGNS_V3.md). Ses **29 feuilles** conservent les onze registres V1 historiques, les douze vues du jeu et de la production courants, puis six nouveaux onglets : Campagnes V3, Chapitres V3, Illustrations V3, Movesets V3, Derniers Actes et Continuité V3.

Le [fichier de suivi sur Google Drive](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) suit les éditions successives au même identifiant, au format `.xlsx`. La livraison V3 du 25 novembre 2026 y comptait 372 305 octets ; son nom et son dossier parent avaient été relus. L’archive V3 immuable reste le fichier du dépôt lié ci-dessus.

La V3 couvre **43 campagnes proposées, 129 chapitres, 129 briefs d’illustration (86 introductions/épilogues et 43 rivalités), 172 propositions de techniques et 43 Derniers Actes**. Elle relie 109 repères de lore à 27 sources documentées, dont deux registres historiques du projet. Chaque illustration précise caméra, composition, lumière, palette, incarnation et exclusions. Les images existantes doivent être revalidées pour leur nouveau brief et leur casting.

**Dernier Acte** est un nom original du jeu, adopté dans le carnet et les écrans de finition. Les storyboards individuels restent des propositions AU : le moteur conserve ses 133 attaques, ses 43 routes actuelles et sa séquence de finition de 1,5 seconde. Le classeur distingue les concepts compatibles en principe avec un contact simple des mécaniques nouvelles à développer. Les gestes dont les preuves directes sont limitées restent identifiés comme adaptations. Le classeur V2 précédent est conservé comme archive.

Les registres sont `extension-plan.json` pour l’état courant et `campaign-design-v3.json` pour les propositions. Le bloc `meta.currentRuntime` et les tables moteur décrivent le jeu livré ; `meta.implementation` et les onze feuilles V1 restent historiques. La génération est indépendante des builds du jeu : `node docs/standalone/build-production-bible.mjs`, avec les dépendances d’auteur. Le [rapport du classeur](QA_WORKBOOK_WAVE_I_2026-11-25.json) vérifie données, formules et préservation des anciennes feuilles. La [revue de conception](QA_DESIGN_WAVE_I_2026-11-25.json) précise les adaptations, les limites des preuves et les corrections de cohérence avec le moteur.

## Excel et sources du premier lot

`HAZBIN_HELLUVA_COMBAT_EXTENSION_V1.xlsx` contient onze onglets : Synthèse, Chantiers, Parité CQC, Personnages, Kits combat, Variantes, Techniques, Arènes, Parcours, Recette et Sources.

Les statuts distinguent Existant, Ajout PR, Partiel, À produire et À vérifier. « Ajout PR » décrit le lot de code soumis dans la [PR #1](https://github.com/darknigthmare/hellbound-hotel-manager/pull/1), dans son état à la livraison initiale. Le code et le classeur sont publiés sur la [branche GitHub](https://github.com/darknigthmare/hellbound-hotel-manager/tree/feat/infernal-versus-standalone-20261021). Le [commit de livraison `907af4a`](https://github.com/darknigthmare/hellbound-hotel-manager/commit/907af4a1e6a209862eebdc93db684955cb548b9d) a été vérifié par comparaison exacte de son arbre avec le lot local validé; les mises à jour de cette documentation peuvent être postérieures à ce commit.

Le [classeur Excel sur Google Drive](https://docs.google.com/spreadsheets/d/16kAZgcsTuPPq1DALMuVxZ4j7cymVk34_/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) a été téléversé au format `.xlsx` et ses métadonnées ont été vérifiées. Il est rangé dans le [dossier Infernal Versus](https://drive.google.com/drive/folders/1iU5o5IO2L6T9L1hLzqqFtHoYn95CKose).

Le registre V1 historique recense 118 chantiers, 40 axes CQC, 209 fiches de personnages, 36 kits (34 accessibles), 37 variantes, 108 actions (102 accessibles), 34 arènes actuelles/proposées, 68 parcours/archives et 42 scénarios de recette. Une fiche ou un sprite ne constitue pas à lui seul un combattant complet.

Les données structurées sont dans `extension-plan.json`. Le builder `build-workbook.mjs` utilise `@oai/artifact-tool` du runtime de création de documents; ce n'est pas une dépendance du jeu. Il accepte le JSON source et le dossier de sortie en arguments. La génération de l'Excel est indépendante de `npm run build`.

Référence CQC : `darknigthmare/shadow-codec-ops/public/cqc`, head `42279c1c884769873e66bbda0b6fe849bcd2f1a2`; arbre identique au lot P39 `bdcc11a5136e944b1eaa0b1adb357ddd3f3fa1ef`. Les modules CQC ont servi de référence d'architecture et de périmètre, sans modifier ce dépôt.

## Vérifications du lot I — archive historique

`npm run qa` regroupe TypeScript, ESLint, Vitest, les deux builds et la vérification SHA-256 du standalone. Pour I, ces étapes ont été exécutées séparément avec succès : **44 suites / 376 tests**, deux builds et **1 031 empreintes vérifiées**. Les sorties de build temporaires ont été retirées après validation. Les résultats figurent dans [QA_RUNTIME_WAVE_I_2026-11-25.json](QA_RUNTIME_WAVE_I_2026-11-25.json).

Le classeur V3 compte 29 feuilles ; ses formules sont recalculées et contrôlées indépendamment, et les onze feuilles historiques sont conservées à l’octet. La validation de la bible contrôle la couverture des combattants, les adversaires, arènes, références, quatre slots de moves et trois temps de chaque fin. Les contrôles de données et les revues statiques ne constituent pas une certification visuelle 1:1 en jeu.

La livraison prolonge la [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8). Les rapports [H](DELIVERY_WAVE_H_2026-11-25.md), [G](DELIVERY_WAVE_G_2026-11-25.md), [F](DELIVERY_WAVE_F_2026-11-24.md), [D](DELIVERY_WAVE_D_2026-11-24.md), [C](DELIVERY_WAVE_C_2026-11-24.md) et des lots antérieurs restent des archives datées. Leurs chiffres ne décrivent pas la version courante.
