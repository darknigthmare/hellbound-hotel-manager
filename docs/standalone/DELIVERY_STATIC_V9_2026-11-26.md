# Infernal Versus — livraison statique V9, 26 novembre 2026

La V9 contient **7 dessins retenus et 15 fichiers d’image de production**, pour **14 294 928 octets** : 7 masters PNG, 7 exports WebP sans perte et une miniature d’arène. La revue indépendante accepte les sept masters, la recette navigateur passe 99 vérifications et la validation technique passe 413 tests dans 47 suites. Le registre V9 est finalisé et la [bible V9](INFERNAL_VERSUS_BIBLE_V9.xlsx) est disponible avec **50 feuilles vérifiées**.

Les chiffres proviennent du [registre V9](production-v9/delivery-register.json). Les [instructions de production](production-v9/README.md) relient les métadonnées, les références, la revue et les commandes de reconstruction. La livraison prolonge la [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8), sur `feat/infernal-versus-assets-20261124`.

## Reprise de V8 et périmètre V9

La V8 récupérée a été publiée avant cette continuation. Son [registre final](production-v8/delivery-register.json) conserve **18 dessins et 38 fichiers d’image**, soit 18 masters, 18 exports et deux miniatures. Elle avait porté le catalogue à 42 arènes, 20 familles de costumes et 100 entrées de galerie, avec 43 combattants et 109 bases autonomes. Ses sources et ses résultats restent documentés dans le [dossier V8](production-v8/README.md).

La V9 ajoute une tenue statique, un portrait narratif, deux objets de réserve et un salon composé d’un fond et de deux accessoires séparés. Aucun nouveau kit, personnage jouable, cycle animé ou mécanisme de projectile n’est livré. Les références, diagnostics et tentatives écartées sont tracés séparément des 15 fichiers de production retenus.

## Les sept dessins retenus

| Identifiant | Dessin et usage | Dimensions natives |
| --- | --- | ---: |
| `lute-post-finale-s1-ready` | Lute après le final S1 ; tenue statique sélectionnable du personnage existant | 1024 × 1536 |
| `hb_moxxies_mother-portrait-s2` | Mère de Moxxie avec rose ; portrait narratif jusqu’à la taille, en galerie | 1254 × 1254 |
| `stolas-grimoire-closed` | Grimoire fermé de Stolas ; accessoire isolé de réserve | 1086 × 1448 |
| `loo-loo-thing-plush` | Peluche THING? de Loo Loo Land ; accessoire isolé de réserve | 1254 × 1254 |
| `bee-lounge-s1-room` | Salon du bar de Beelzebub ; fond de l’arène `bee-lounge-s1` | 1672 × 941 |
| `bee-lounge-bar-stool` | Tabouret cyan ; objet séparé du salon et entrée de galerie | 1122 × 1402 |
| `bee-lounge-honeycomb-divider` | Cloison à alvéoles ; objet séparé du salon et entrée de galerie | 1024 × 1536 |

La miniature du salon mesure **480 × 270**. Elle dérive du fond et ne constitue pas un huitième dessin. Les chemins, tailles de fichiers et empreintes de chaque master, export et miniature figurent dans le registre.

### Lute : incarnation après le final S1

Le dessin conserve le bras gauche absent, la main droite portant le halo d’Adam, les deux ailes et les marques du visage visibles dans le [clip officiel Prime Video Brasil](https://www.youtube.com/watch?v=q9lzr9zsUT4). Il représente la scène finale de la saison 1. L’incarnation S2 à prothèse dorée, refusée en V8, reste consignée dans son lot historique.

La tenue s’applique à Lute existante. **Une même image statique est utilisée pendant les actions** ; le kit existant reste actif. La base par défaut et les poses historiques pré-blessure sont conservées. Le nouveau dessin n’augmente donc ni les bases autonomes, ni les identités, ni les kits, ni les cycles d’animation.

Les références entières sont des prévisualisations natives de **320 × 180**. Elles permettent de reconnaître l’incarnation et sa silhouette ; les détails des plumes, des vêtements et des pieds restent redessinés. La lueur visible dans le RGB brut du master provient principalement de couleurs sous alpha nul : la composition RGBA inspectée présente une silhouette isolée propre. Le canal alpha doit rester conservé lors des exports et du rendu.

### Mère de Moxxie : portrait partiel

Le portrait reprend la chevelure, les boucles d’oreilles, les points blancs des joues, la robe bleue, les gants et la rose du [pin officiel SpindleHorse](https://sharkrobot.com/products/exes-and-oohs-moxxies-mom-enamel-pin). Le cadre du produit a été retiré.

**Le dessin s’arrête à la taille.** Il n’apporte aucune preuve sur les jambes ou les chaussures et ne comble pas la base entière manquante de cette identité. Les pointes des cornes, partiellement masquées par le cadre dans la référence, restent également une limite de fidélité. Le catalogue conserve `frameCoverage: bust`, `fullBodyBaseStillMissing: true` et un usage narratif en galerie.

### Grimoire et peluche THING?

Le [produit officiel du grimoire](https://sharkrobot.com/products/stolas-grimoire-sticker-book) sert de référence à la **couverture** : bleu nuit, bordures dorées, étoiles, croissant et sceau. Le produit photographié est spiralé. La reliure rigide et le bloc de pages du dessin sont une adaptation de volume pour représenter un livre fermé ; ils ne sont pas corroborés par cette seule photographie. La géométrie fine du sceau n’est pas certifiée à l’identique.

La peluche suit le dessin complet du [porte-clés officiel THING?](https://sharkrobot.com/products/loo-loo-land-thing-plush-acrylic-keychain), avec cornes annelées, bec jaune, salopette rose, boutons X, cœur et étiquette. L’attache métallique et le support acrylique ont été retirés. Ces deux objets sont consultables en galerie ; aucune nouvelle capacité de combat ne leur est attribuée.

### Salon du bar de Beelzebub

Le fond s’appuie sur le [décor publié par Greg Bartlett](https://backgroundart.net/art/helluva05.jpg), dans son [portfolio Helluva Boss](https://backgroundart.net/helluvaboss.html). Il conserve le bar courbe, le plafond à alvéoles, les colonnes, la banquette turquoise, la table et le tapis. Le premier plan est adapté pour offrir une piste de duel dégagée.

L’arène `bee-lounge-s1` représente le salon latéral, distinct de la grande salle `bee-party`. Les tabourets et la cloison droite ont été retirés du fond afin de placer le tabouret et la cloison dans des couches séparées. La cloison gauche reste intégrée au fond. Échelle, ancrage, parallaxe, lisibilité des combattants et affichage mobile relèvent du contrôle du jeu décrit plus bas.

## Revue de la cloison et intégrité des images

La [revue indépendante](production-v9/independent-review-root.json) valide la cloison finale à **8 rangées principales et 38 ouvertures** : trois colonnes de huit grandes alvéoles et deux colonnes intercalaires de sept ouvertures. Le décompte visuel est corroboré par 38 régions transparentes encloses dans le canal alpha.

La silhouette finale dispose de marges visibles de **181 / 161 / 181 / 190 pixels** à gauche, en haut, à droite et en bas. Le contour inférieur est complet. L’[historique complet des quatre tentatives](production-v9/environment-handoff.json) conserve les trois candidats écartés : neuf rangées, six rangées, puis huit rangées sans marge basse. Ils ne sont pas comptés comme dessins livrés. Le [registre de correction du cadrage](production-v9/divider-corrections.json) détaille les deux dernières sorties, avant et après rétablissement de la marge basse.

Les sept masters conservent leur taille native. L’assembleur compare les octets RGBA décodés de chaque PNG et WebP, y compris les couleurs sous les pixels transparents. Cette vérification établit la conservation des pixels entre formats ; la fidélité artistique exacte **1:1 n’est pas certifiée**.

## Couverture cumulée après intégration V9

| Indicateur | Cumul |
| --- | ---: |
| Combattants / kits actifs | 43 |
| Arènes | 43 |
| Familles de costumes sélectionnables | 21 |
| Entrées de galerie de production | 106 |
| Bases autonomes | 109 — 40 actives et 69 en réserve |
| Identifiants de catalogue sans base autonome | 100 — 99 identités après l’alias connu |
| Illustrations personnelles | 127 / 129 |
| Illustrations globales | 11 / 11 |
| Nouveaux cycles d’animation V9 | 0 |

Le [catalogue de réserve](../../art/infernal-versus/production/reserve-assets.json) et le [plan d’extension](extension-plan.json) indiquent le rôle de chaque image. Le portrait partiel de la mère et le costume de Lute ne réduisent pas le nombre de bases autonomes manquantes.

Les demandes Leviathan et Belphegor ont été refusées par le générateur. Le [registre des refus V9](production-v9/refused-attempts.json) ne leur attribue aucun fichier livré et conserve leur statut sans relance.

## État des vérifications

<!-- V9_QA_STATUS_START -->
**Contrôle navigateur réussi : 99 vérifications sur 99**, d’après le [rapport final navigateur](production-v9/browser-qa.json). Les sept identifiants V9 sont explicitement couverts : sélection de Lute et du salon, tenue statique pendant les actions observées, fond et deux accessoires actifs, six aperçus de galerie et filtrage S1/S2. Le passage utilise Chromium réel sur le serveur Vite local, en 1440 × 1000 et en émulation tactile 390 × 844. Aucun débordement horizontal, chargement d’image manquant, échec réseau, message `console.error` ou exception JavaScript n’a été observé. Le rapport comporte 26 captures, dont 17 relues visuellement.

Le [relevé des chemins actifs](production-v9/active-asset-coverage.json) confirme **687 chemins référencés présents, sans référence cassée**, ainsi que les comptes de 43 combattants, 43 arènes, 21 familles de costumes et 106 entrées de galerie. Ce contrôle de fichiers et le passage navigateur ont des portées distinctes : les parcours navigateur couvrent les ajouts V9 et l’entraînement décrit, sans nouvelle validation exhaustive de tout le catalogue, des modes de jeu ou des appareils physiques. Aucun profilage de performances ni certificat de fidélité canonique n’est déduit de ces résultats.

**Vérification technique complète réussie**, d’après le [rapport final](production-v9/runtime-qa.json) : TypeScript, ESLint, **413 tests dans 47 suites**, builds manager et standalone, packaging et **1 291 empreintes de distribution vérifiées**. Le contrôle confirme aussi la présence des fichiers d’amorçage et l’exclusion de la persistance hôtel/cloud du standalone. Le [registre V9](production-v9/delivery-register.json) est désormais `final_production_register` ; les observations navigateur y sont rattachées aux identifiants effectivement contrôlés.
<!-- V9_QA_STATUS_END -->

La procédure [verify-runtime.mjs](production-v9/verify-runtime.mjs) a exécuté TypeScript, ESLint, les tests, les builds manager et standalone puis le contrôle d’intégrité. Pour économiser l’espace disque, les builds utilisent la configuration Vite normale avec `copyPublicDir: false` et assemblage des fichiers publics par liens physiques. Cette procédure possède son propre rapport ; la commande unique `npm run qa` n’a pas été exécutée et `standardQaScriptPassed` reste `false`.

## Bible V9 et pièces de livraison

La [bible V9](INFERNAL_VERSUS_BIBLE_V9.xlsx) contient **50 feuilles et 59 tableaux**, pour **602 294 octets**. Elle ajoute **Production V9** et **Cibles V9** aux 48 feuilles historiques de la [bible V8](INFERNAL_VERSUS_BIBLE_V8.xlsx). Les XML des 48 feuilles, 57 tableaux et 47 relations de feuilles historiques sont conservés strictement à l’identique, d’après la [revue OOXML indépendante](production-v9/workbook-ooxml-review.json) et le [rapport de packaging](production-v9/workbook-package-report.json).

La [QA du classeur](production-v9/workbook-qa.json) confirme les 15 fichiers d’image et leurs empreintes, neuf rendus relus, ainsi que six formules des ajouts V9 recalculées et testées par modification puis restauration d’une entrée. Aucune erreur de formule n’est détectée dans les deux nouveaux onglets. Le recalcul utilise Artifact Tool ; un recalcul dans Excel natif n’a pas été exécuté. Le portrait partiel de la mère et le costume de Lute conservent un apport nul aux nouvelles bases.

Le [classeur de suivi sur Google Drive](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) a été mis à jour au **même identifiant** avec `INFERNAL_VERSUS_BIBLE_V9.xlsx`. Les métadonnées ont été relues, puis le fichier stocké a été téléchargé et comparé octet par octet au classeur final local : **602 294 octets**, SHA-256 `305f4e152e252128d29551059de0b2ce240b1d1ef7f84ea15cc4be22e80d1798`. La [preuve de publication Drive](production-v9/drive-publication.json) consigne cette vérification.

- [Registre des sept dessins et fichiers](production-v9/delivery-register.json)
- [Revue visuelle indépendante](production-v9/independent-review-root.json)
- [Métadonnées des quatre images principales](production-v9/root-generation.json)
- [Métadonnées du salon et de ses objets](production-v9/environment-handoff.json)
- [Deux dernières sorties de correction du cadrage](production-v9/divider-corrections.json)
- [Contrôle des quatre couples PNG/WebP principaux](production-v9/root-image-qa.json)
- [Rapport navigateur et ses sept identifiants vérifiés](production-v9/browser-qa.json)
- [Relevé des 687 chemins actifs](production-v9/active-asset-coverage.json)
- [Bible V9 et ses 50 feuilles](INFERNAL_VERSUS_BIBLE_V9.xlsx)
- [QA du classeur final](production-v9/workbook-qa.json)
- [Publication Drive et comparaison binaire](production-v9/drive-publication.json)
- [Refus de génération](production-v9/refused-attempts.json)
- [Sources, commandes et périmètre des vérifications](production-v9/README.md)
