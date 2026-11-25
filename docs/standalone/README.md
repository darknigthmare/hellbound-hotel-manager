# Hellbound — Infernal Versus

Mode combat autonome de Hellbound Hotel Manager. Depuis Pentagram Arena, ouvrez **Infernal Versus**. L’entrée Web directe est `/combat.html`.

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

## Reprise actuelle — 25 novembre 2026, production statique V6

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
