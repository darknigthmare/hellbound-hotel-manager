# Production statique V9 — sources et reconstruction

Ce dossier décrit **7 dessins retenus / 15 fichiers d’image / 14 294 928 octets**. Le [rapport de livraison](../DELIVERY_STATIC_V9_2026-11-26.md) présente le contenu et ses limites ; le [registre final](delivery-register.json) porte les chemins, empreintes et comptes. Les vérifications techniques et navigateur sont achevées. La [bible V9](../INFERNAL_VERSUS_BIBLE_V9.xlsx) est générée et contrôlée : **50 feuilles et 59 tableaux**.

## Périmètre

| Lot | Dessins | Usage |
| --- | ---: | --- |
| Lute après le final S1 | 1 | Tenue statique sélectionnable ; même image pendant les actions, kit existant conservé |
| Mère de Moxxie | 1 | Portrait narratif à la taille ; base entière toujours manquante |
| Grimoire fermé et peluche THING? | 2 | Objets isolés consultables en galerie |
| Salon du bar de Beelzebub | 3 | Fond d’arène, tabouret et cloison séparés |

Chaque dessin possède un master PNG et un export WebP sans perte. Une miniature dérivée du salon complète le total de 15 fichiers. Les trois tentatives remplacées de la cloison, les références et les diagnostics ne sont pas comptés parmi les dessins retenus.

Le catalogue courant compte **43 combattants, 43 arènes, 21 familles de costumes, 106 entrées de galerie et 109 bases autonomes**. Les bases restent réparties entre 40 actives et 69 en réserve ; 100 identifiants de catalogue, correspondant à 99 identités après l’alias connu, restent sans base autonome. Aucun nouveau kit ni cycle animé n’est ajouté.

## Sources faisant autorité pour ce lot

| Fichier | Contenu et portée |
| --- | --- |
| [root-generation.json](root-generation.json) | Prompts, références, usages et limites du grimoire, du portrait, de Lute et de THING |
| [root-image-qa.json](root-image-qa.json) | Dimensions, empreintes et comparaison des quatre couples PNG/WebP principaux |
| [environment-handoff.json](environment-handoff.json) | Salon, tabouret, exclusions du fond, intentions d’ancrage et historique complet des quatre tentatives de cloison |
| [independent-review-root.json](independent-review-root.json) | Sept décisions d’acceptation, hashes des masters, limites des sources et diagnostic alpha |
| [divider-corrections.json](divider-corrections.json) | Deux dernières sorties de cloison : huit rangées sans marge basse, puis cadrage complet accepté |
| [refused-attempts.json](refused-attempts.json) | Refus Leviathan et Belphegor, sans fichiers livrés ni relance |
| [browser-qa.json](browser-qa.json) | Recette Chromium locale, 99 contrôles réussis et sept identifiants V9 explicitement couverts |
| [active-asset-coverage.json](active-asset-coverage.json) | 687 chemins actifs vérifiés, sans référence cassée ; comptage du catalogue courant |
| [workbook-qa.json](workbook-qa.json) | Classeur final, neuf rendus relus et six formules des nouveaux onglets contrôlées |
| [workbook-ooxml-review.json](workbook-ooxml-review.json) | Préservation vérifiée des 48 feuilles, 57 tableaux et 47 relations de feuilles historiques |
| [drive-publication.json](drive-publication.json) | Mise à jour du même fichier Drive, métadonnées relues et téléchargement comparé octet par octet |
| [delivery-register.json](delivery-register.json) | Registre assemblé depuis les fichiers réels et les rapports disponibles |

Les masters sont conservés dans `production/v9/{hazbin,helluva,props,environment}/masters/`. Les exports utilisés par l’application sont dans `public/assets/production/v9/`. L’assembleur conserve aussi les références inspectées dans `production/v9/references/` et vérifie leurs empreintes.

Le [catalogue de galerie](../../../art/infernal-versus/production/reserve-assets.json) et le [plan d’extension](../extension-plan.json) décrivent le raccordement courant. Ils conservent explicitement le portrait de la mère comme `bust` et Lute comme costume de l’identité existante, avec `addsStandaloneBase: false`.

## Limites à conserver dans les exports et la bible

La fidélité artistique exacte **1:1 n’est pas certifiée**. Les références de Lute sont des images natives de 320 × 180 issues d’un clip officiel : elles établissent la scène S1 et la silhouette, avec une précision limitée pour les détails. La variante S2 à prothèse dorée reste dans le refus V8.

Le portrait de la mère de Moxxie n’atteste ni jambes ni chaussures. Les pointes des cornes sont partiellement masquées dans le pin source. Le grimoire reprend le dessin de couverture d’un carnet officiel spiralé ; sa reliure rigide et son bloc de pages sont une adaptation de volume. La peluche THING? reprend le dessin complet du produit officiel, après retrait du support acrylique et de son attache.

La cloison finale conserve **3 × 8 + 2 × 7 = 38 ouvertures**, un contour inférieur complet et 190 pixels de marge basse visible. Le fond du salon garde sa cloison gauche ; les tabourets et la cloison droite ont été retirés pour l’intégration en couches séparées. Le sol est adapté au combat AU. Le placement des couches doit être contrôlé dans le jeu, séparément de la revue des images.

Les couleurs du RGB brut peuvent inclure des halos sous alpha nul. Les diagnostics RGBA de Lute et de la cloison montrent leur transparence réelle. Les exports doivent préserver ce canal ; la comparaison PNG/WebP porte sur tous les octets RGBA décodés, y compris les couleurs invisibles.

## État de la validation

<!-- V9_QA_STATUS_START -->
Le [rapport navigateur final](browser-qa.json) indique **`passed` : 99 contrôles réussis**, sept `checkedAssetIds` et six nouvelles entrées de galerie examinées. Les parcours couvrent la tenue de Lute, le salon avec ses deux objets, les aperçus de galerie et les filtres S1/S2. Ils utilisent Chromium sur Vite local, en bureau 1440 × 1000 et en émulation tactile 390 × 844 ; aucun appareil physique ou déploiement de production n’est certifié. Le rapport consigne 26 captures, 17 revues visuellement, et aucun débordement horizontal, asset manquant, échec réseau ou erreur JavaScript observé.

Le [relevé de couverture](active-asset-coverage.json) vérifie **687 chemins actifs sans référence cassée**. Cette vérification des fichiers couvre le catalogue enregistré ; la recette navigateur reste limitée aux identifiants et parcours déclarés dans son rapport.

Le [rapport technique final](runtime-qa.json) indique **`passed`** : TypeScript, ESLint, **413 tests dans 47 suites**, builds manager et standalone, packaging et **1 291 empreintes vérifiées**. Le registre est `final_production_register`. Son statut navigateur par asset est rattaché aux `checkedAssetIds` et aux preuves déclarées dans le rapport navigateur.
<!-- V9_QA_STATUS_END -->

Le script [verify-runtime.mjs](verify-runtime.mjs) exécute TypeScript, ESLint, Vitest, les builds manager et standalone et le contrôle d’intégrité de la distribution. Les fichiers publics sont assemblés par liens physiques après compilation avec `copyPublicDir: false`, afin de limiter les copies disque. La commande unique `npm run qa` n’a pas été exécutée ; le rapport conserve `standardQaScriptPassed: false` et décrit la méthode utilisée.

## Commandes de reconstruction

Depuis la racine du dépôt, actualiser le relevé des chemins actifs, puis assembler un registre de travail à partir des images acceptées :

```bash
node docs/standalone/production-v9/audit-runtime-coverage.mjs
python docs/standalone/production-v9/assemble-register.py
```

L’assembleur contrôle l’acceptation par hash, l’égalité RGBA des exports, les références et la concordance du catalogue. Exécuter les vérifications techniques avec :

```bash
node docs/standalone/production-v9/verify-runtime.mjs
```

Le contrôle navigateur produit ensuite son propre rapport, avec ses parcours, ses preuves et ses identifiants d’assets. Une fois les rapports relus et leur portée confirmée, finaliser le registre :

```bash
python docs/standalone/production-v9/assemble-register.py --final
```

La génération de la bible utilise le runtime d’auteur et le [builder V9](build-bible-v9.mjs). Les modes sont explicites :

```bash
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v9/build-bible-v9.mjs --inspect-baseline
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v9/build-bible-v9.mjs --validate
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v9/build-bible-v9.mjs --prepare
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v9/build-bible-v9.mjs --final
```

Le résultat est [INFERNAL_VERSUS_BIBLE_V9.xlsx](../INFERNAL_VERSUS_BIBLE_V9.xlsx), **50 feuilles et 59 tableaux**, pour **602 294 octets**. Les nouveaux onglets sont **Production V9** et **Cibles V9**. Le [rapport de packaging](workbook-package-report.json) et la [revue OOXML](workbook-ooxml-review.json) confirment la préservation à l’octet des 48 XML de feuilles, 57 XML de tableaux et 47 relations de feuilles historiques V8.

La [QA du classeur](workbook-qa.json) contrôle les 15 fichiers d’image, neuf vues rendues et six formules recalculées/testées dans les ajouts V9, sans erreur de formule dans ces deux nouveaux onglets. Le recalcul est effectué avec Artifact Tool ; Excel natif n’a pas été exécuté. Le builder contrôle aussi que les portraits partiels et les costumes n’augmentent pas artificiellement les bases autonomes.

Le [classeur Drive](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) utilise toujours l’identifiant `10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU`. La [preuve de publication](drive-publication.json) confirme le nom V9, **602 294 octets** et la comparaison binaire du téléchargement stocké avec le fichier local, avec le SHA-256 `305f4e152e252128d29551059de0b2ce240b1d1ef7f84ea15cc4be22e80d1798`.

## Continuité et traçabilité

La V8 récupérée et publiée constitue le point de départ : [18 dessins / 38 fichiers](../production-v8/delivery-register.json), 42 arènes, 20 familles de costumes et 100 entrées de galerie. Son classeur et ses rapports restent des archives distinctes.

Les sept masters V9 acceptés, leurs exports et les rapports de validation déterminent la livraison courante. Une génération remplacée ou refusée n’ajoute pas un dessin au total. Les modifications de code, images, rapports et classeur doivent être rattachées au registre correspondant avant publication de cette édition.
