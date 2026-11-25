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

## Contenu de cette version — 25 novembre 2026, vague G

- **43 combattants jouables** : 25 de *Hazbin Hotel* et 18 de *Helluva Boss*. Vortex, Glitz et Glam ont rejoint le standalone avec la vague F. La vague G complète les dessins de base en réserve.
- **133 attaques paramétrées** : 129 légers, lourds et spéciaux, plus les quatre signatures de Vaggie, Blitzø, Mimzy et Sallie May. Le carnet expose commandes, temps, portée et tension.
- **Six costumes et 35 poses de costume** : Vaggie exorciste, Loona humaine, Stolas humain, Moxxie au festival des moissons, Carmilla cheveux lâchés et Lute avant sa blessure de fin de saison 1.
- **40 poses individuelles d’attente, 17 gardes distinctes, 17 contacts légers et 18 réactions** pour le roster actif. Ces poses clés ne constituent pas des cycles complets. Aucun dessin d’animation n’est ajouté par G.
- **28 arènes à trois plans**. La plage de *Spring Broken*, la maison de *Murder Family* et le cirque de Cash ajoutent trois fonds, six accessoires séparés et trois miniatures. Les fonds conservent leur ratio natif entier. Le manager conserve ses huit arènes.
- **14 images VFX pour 28 associations d’attaques**. Leurs affectations restent identiques à F. Les effets suivent les coups existants, sans collision ou dégâts supplémentaires.
- **11 nouvelles bases en réserve** : Vassago, Wally Wackford, Barbie Wire, Martha, Mrs Mayberry, Agent One, Agent Two, Cletus, Collin, Keenie et Robo Fizz. Une image READY par identité, avec ses références et ses limites ; aucun nouveau kit ou récit.
- **Une fléchette D.H.O.R.K.S. isolée en réserve**. La flèche C.H.E.R.U.B. et le shuriken sont différés faute de contour suffisamment net dans les références inspectées.
- Histoire, Tournoi, Versus CPU, Versus local, Entraînement, Arcade, Survie et Boss Rush. Le Boss Rush tire parmi neuf adversaires possibles, puis retire le combattant du joueur s’il appartient à ce groupe.
- L’Histoire propose **43 routes et 129 duels écrits**. Les scénarios sont des créations AU. Les filtres de saison et d’univers déterminent les routes accessibles.
- Le Tournoi construit un tableau reproductible de huit, quatre ou deux participants suivant l’effectif disponible. Une défaite élimine le joueur.
- Un lourd touchant sans garde peut être suivi d’un spécial dès la fin de l’arrêt sur impact, pendant sa récupération. Cet enchaînement consomme 50 de tension.
- Un K.-O. décisif ouvre une fenêtre de 3,2 secondes : H pour J1, L pour J2 ou **Fatalité**. La finition dure 1,5 seconde ; **Passer** rejoint directement la victoire.
- Trois difficultés, recherche et filtres d’univers/saison ; clavier partagé et contrôles tactiles ; pause et relâchement des commandes lors d’une perte de focus ; réduction des mouvements et des flashes.

L’entraînement propose un mannequin immobile ou en garde, une jauge illimitée et une réinitialisation, sans enregistrer de résultat. Les parcours reprennent le duel en cours depuis son début après une sortie. Les PV sont restaurés entre les rencontres, y compris en Survie. Les autres modes de parcours proposent une reprise explicite après une défaite ; les réessais sont mémorisés.

## Sauvegarde séparée

La seule clé écrite par le standalone est `hellbound_infernal_versus_v1`. Les données d'hôtel et d'inventaire sont exclues. Les imports vérifient version, champs, identifiants, options, compteurs, historique et parcours. Un chargement corrompu ne remplace pas automatiquement les octets existants. Si le stockage est indisponible, le jeu reste utilisable pour la session et affiche l'état d'enregistrement.

Chaque résultat porte un identifiant unique, empêchant les doubles récompenses. L'historique affichable conserve trente résultats; le registre de déduplication reste borné à dix mille matchs. Une limite atteinte produit une erreur explicite.

## Portée de la fidélité

Les identités, incarnations et motifs sont rattachés aux sources des manifestes. Les nouveaux personnages suivent une incarnation précise : Barbie en imp, Martha et Mayberry en sinner, Vassago en tenue du tribunal. Les épisodes officiels, produits sous licence et portraits historiques d’appoint sont distingués dans la [revue G](REVIEW_ASSETS_WAVE_G_2026-11-25.md).

**La fidélité exacte 1:1 n’est pas certifiée.** Les références officielles de G sont principalement des prévisualisations de 320 × 180. Les parties basses de Martha et Mayberry, certains petits détails et la pointe cachée de la fléchette restent des reconstructions. Les poses neutres, pistes de duel et placements d’accessoires sont des adaptations de présentation. Les PNG sont conservés à l’octet et les WebP de production sont sans perte, à leur taille native.

Les finitions comprennent 43 titres et des traitements partagés ; cinq personnages disposent d’une pose de finition dédiée. Les illustrations narratives couvrent 26 affectations avec 22 dessins distincts. Les anciennes demandes refusées restent consignées dans leurs lots, sans nouvelle tentative dans G.

Le lancement du navigateur G a échoué parce que le binaire Chromium était absent. Les compositions statiques et les contrôles de fichiers ne certifient pas les transitions, les tailles canoniques relatives ou le rendu sur appareil. Les détails figurent dans le [rapport de revue](REVIEW_ASSETS_WAVE_G_2026-11-25.md).

## Couverture des assets — vague G

Le [relevé](ASSET_COVERAGE.json) distingue **420 chemins actifs présents** et **12 nouveaux dessins en réserve / 24 fichiers présents**. Les réserves G ne sont ajoutées ni aux compteurs de combattants ni aux affectations d’effets.

| Élément actif | Disponible | Reste pour couvrir les 43 combattants |
| --- | ---: | ---: |
| Pose individuelle d’attente | 40 | 3 |
| Garde individuelle distincte | 17 | 26 |
| Pose de contact léger | 17 | 26 |
| Pose individuelle de réaction | 18 | 25 |
| Pose clé de finition | 5 | 38 |
| Illustrations d’introduction, rivalité et épilogue | 26 sur 129 | 103 affectations |

Les **28 arènes possèdent trois plans enregistrés**. Les nouveaux fonds restent entiers en `contain` ; leurs accessoires suivent le même repère et restent derrière les combattants. Sans unités CSS de conteneur, les accessoires ajoutés sont masqués et le fond reste visible.

La vague G apporte **21 dessins retenus et 45 fichiers d’image de production** : 11 bases, trois fonds, six accessoires et une fléchette, avec leurs masters PNG, exports WebP et trois miniatures. Les images de diagnostic sont comptées séparément. Consulter le [manifeste G](../../art/infernal-versus/production/delivery-wave-g-2026-11-25.json), le [catalogue de réserve](../../art/infernal-versus/production/reserve-assets-wave-g-2026-11-25.json) et le [rapport de livraison](DELIVERY_WAVE_G_2026-11-25.md).

Les pièces de réserve des lots antérieurs — vêtements, chapeau, queue, canne, lance et variantes de décor — restent conservées avec leur propre statut. Le catalogue G porte uniquement sur les nouveaux dessins de cette vague.

## Bible de production

[Ouvrir le classeur V2](INFERNAL_VERSUS_BIBLE_V2.xlsx). Ses **23 feuilles** conservent les onze onglets V1 historiques et ajoutent douze onglets V2, calculés à partir du jeu actuel : routes, duels, coups, techniques, tenues, finitions, plans, illustrations, atelier et sources. Les prototypes sont distingués des techniques jouables.

Le registre est `extension-plan.json`. Le bloc `meta.currentRuntime` et les tables V2 décrivent l’état courant ; `meta.implementation` et les onze feuilles V1 restent historiques. La génération est indépendante des builds du jeu : `node docs/standalone/build-production-bible.mjs`, avec les dépendances d’auteur. Le [rapport du classeur](QA_WORKBOOK_WAVE_G_2026-11-25.json) vérifie données, formules et préservation des anciennes feuilles.

## Excel et sources du premier lot

`HAZBIN_HELLUVA_COMBAT_EXTENSION_V1.xlsx` contient onze onglets : Synthèse, Chantiers, Parité CQC, Personnages, Kits combat, Variantes, Techniques, Arènes, Parcours, Recette et Sources.

Les statuts distinguent Existant, Ajout PR, Partiel, À produire et À vérifier. « Ajout PR » décrit le lot de code soumis dans la [PR #1](https://github.com/darknigthmare/hellbound-hotel-manager/pull/1), dans son état à la livraison initiale. Le code et le classeur sont publiés sur la [branche GitHub](https://github.com/darknigthmare/hellbound-hotel-manager/tree/feat/infernal-versus-standalone-20261021). Le [commit de livraison `907af4a`](https://github.com/darknigthmare/hellbound-hotel-manager/commit/907af4a1e6a209862eebdc93db684955cb548b9d) a été vérifié par comparaison exacte de son arbre avec le lot local validé; les mises à jour de cette documentation peuvent être postérieures à ce commit.

Le [classeur Excel sur Google Drive](https://docs.google.com/spreadsheets/d/16kAZgcsTuPPq1DALMuVxZ4j7cymVk34_/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) a été téléversé au format `.xlsx` et ses métadonnées ont été vérifiées. Il est rangé dans le [dossier Infernal Versus](https://drive.google.com/drive/folders/1iU5o5IO2L6T9L1hLzqqFtHoYn95CKose).

Le registre V1 historique recense 118 chantiers, 40 axes CQC, 209 fiches de personnages, 36 kits (34 accessibles), 37 variantes, 108 actions (102 accessibles), 34 arènes actuelles/proposées, 68 parcours/archives et 42 scénarios de recette. Une fiche ou un sprite ne constitue pas à lui seul un combattant complet.

Les données structurées sont dans `extension-plan.json`. Le builder `build-workbook.mjs` utilise `@oai/artifact-tool` du runtime de création de documents; ce n'est pas une dépendance du jeu. Il accepte le JSON source et le dossier de sortie en arguments. La génération de l'Excel est indépendante de `npm run build`.

Référence CQC : `darknigthmare/shadow-codec-ops/public/cqc`, head `42279c1c884769873e66bbda0b6fe849bcd2f1a2`; arbre identique au lot P39 `bdcc11a5136e944b1eaa0b1adb357ddd3f3fa1ef`. Les modules CQC ont servi de référence d'architecture et de périmètre, sans modifier ce dépôt.

## Vérifications

`npm run qa` exécute TypeScript, ESLint, Vitest, les deux builds et la vérification SHA-256 du standalone. Les résultats de G figurent dans [QA_RUNTIME_WAVE_G_2026-11-25.json](QA_RUNTIME_WAVE_G_2026-11-25.json). Le classeur contient 23 feuilles, dont les onze historiques conservées intégralement. Les compteurs de réserves sont calculés séparément dans le guide.

La livraison prolonge la [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8). Les rapports [F](DELIVERY_WAVE_F_2026-11-24.md), [D](DELIVERY_WAVE_D_2026-11-24.md), [C](DELIVERY_WAVE_C_2026-11-24.md) et des lots antérieurs restent des archives datées. Leurs chiffres ne décrivent pas la version courante.
