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

## Contenu de cette version

- 36 combattants jouables, dont 23 de *Hazbin Hotel* et 13 de *Helluva Boss*. Mimzy et Sallie May rejoignent la sélection avec leurs trois attaques, leur technique signature, leur campagne et leur finition.
- 112 attaques nommées, dont 108 légers, lourds et spéciaux et quatre signatures. La touche T pour J1 ou I pour J2 utilise la technique du personnage disponible. Le carnet indique le coût en tension, les temps et la portée.
- Vaggie se couvre après une estocade qui touche. Blitzø recule puis revient au contact. Mimzy peut enchaîner un léger après son coup de talon. Sallie May gagne du terrain lorsque son coup d’épaule est bloqué.
- La garde-robe de la sélection propose quatre costumes : l’uniforme d’exorciste de Vaggie, les apparences humaines de Loona et de Stolas, et la tenue du festival des moissons de Moxxie. Chacun dispose de six poses individuelles : attente/garde, léger, lourd, réaction, accroupissement et saut, soit 24 images de costume. Le costume de Moxxie utilise un format portrait déclaré, conservé sur les deux combattants et pendant ses poses.
- Les poses individuelles d’Angel Dust et de Striker couvrent l’attente, le contact du léger et la réaction. Millie dispose de l’attente et du contact léger; Husk, de l’attente et d’une garde distincte. Lucifer et Moxxie disposent chacun d’une attente, d’une garde distincte, d’un contact léger et d’une réaction. Ces images complètent les banques d’animation existantes des 36 combattants.
- Quatorze arènes, dont Wrath Ranch, Heaven Court, Pentious Workshop et Loo Loo Land. Toutes utilisent trois plans illustrés. Cannibal Town, Hotel Front Steps, Pentagram Rooftops et Heaven Embassy disposent désormais de leurs calques manquants; la façade de l’hôtel utilise une nouvelle illustration Hazbin. Le lobby dispose d’un chariot et d’une valance; le bar utilise sa salle retrouvée avec tabouret et lampe; Carmine Industries possède une salle, un râtelier et une caisse. La réduction des mouvements fixe la caméra.
- Histoire, Tournoi, Versus CPU, Versus local, Entraînement, Arcade, Survie et Boss Rush.
- Histoire propose une route par combattant. Le prologue introduit trois rencontres écrites, dont un rival au troisième duel. La victoire finale débloque un épilogue à revoir dans le Codex. Les filtres de saison et d’univers déterminent les routes disponibles.
- En tournoi, le joueur dispute les matchs de son combattant. Le tirage reproductible remplit un tableau de huit, quatre ou deux participants selon l’effectif disponible. Les duels CPU sont simulés et une défaite élimine le joueur.
- Le carnet de coups détaille touches, démarrage, récupération, délai entre attaques, portée et tension. Un lourd touchant sans garde peut être suivi d’un spécial dès la fin de l’arrêt sur impact, pendant sa récupération. Il consomme 50 de tension.
- Un K.-O. décisif ouvre une fenêtre de 3,2 secondes. Le vainqueur presse H (J1), L (J2) ou le bouton **Fatalité**. La finition dure 1,5 seconde avant la pose de victoire. **Passer** enchaîne directement sur la victoire. La canne à pomme de Lucifer est un objet séparé utilisé pendant sa finition. Le chrono, le double K.-O. et le dojo suivent leurs règles habituelles.
- Trois difficultés; sélection des deux univers ou d'un seul; recherche; filtre Saison 1/Saisons 1–2 appliqué également aux spectateurs.
- Palmarès, parcours reproductibles à partir d'une seed, reprise entre combats, export/import validés et confirmation avant remplacement.
- Clavier partagé et contrôles tactiles, pause, relâchement des commandes lors d'une perte de focus, réduction des mouvements et flashes.

L'entraînement propose un mannequin immobile ou en garde, une jauge illimitée et une réinitialisation. Il n'enregistre aucun résultat. Les parcours mémorisent le prochain adversaire; quitter pendant un duel fait reprendre ce duel depuis son début. Les PV sont restaurés entre les duels, y compris en Survie. Une défaite en tournoi élimine le joueur. Les autres parcours proposent une reprise explicite. Les réessais sont enregistrés dans le parcours.

## Sauvegarde séparée

La seule clé écrite par le standalone est `hellbound_infernal_versus_v1`. Les données d'hôtel et d'inventaire sont exclues. Les imports vérifient version, champs, identifiants, options, compteurs, historique et parcours. Un chargement corrompu ne remplace pas automatiquement les octets existants. Si le stockage est indisponible, le jeu reste utilisable pour la session et affiche l'état d'enregistrement.

Chaque résultat porte un identifiant unique, empêchant les doubles récompenses. L'historique affichable conserve trente résultats; le registre de déduplication reste borné à dix mille matchs. Une limite atteinte produit une erreur explicite.

## Portée de la fidélité

Les noms et motifs des personnages proviennent des sources du projet. Les statistiques, les timings et les confrontations ont été conçus pour le jeu. Les trois attaques de base utilisent les règles de portée et d’impact du moteur. Les quatre signatures disposent en plus de leurs propriétés de déplacement, de garde ou d’enchaînement.

Les kits Fizzarolli, Verosika, Crimson et certaines figures puissantes sont signalés comme interprétations de leurs motifs. Stolas correspond à une incarnation avant *Mastermind*. Les états chronologiques alternatifs sont des chantiers distincts du classeur.

Les onglets **Illustrations** et **Tenues et gardes** donnent le fichier exact utilisé pour chaque scène et apparence. Les scènes encore à illustrer associent les portraits au décor de la rencontre. Les finitions disposent de 36 titres et de huit traitements visuels partagés. Les storyboards de leur version longue se trouvent dans **Finitions**. Les campagnes et les duels sont des histoires originales d’Exhibition. Le réseau avec rollback, les replays déterministes, le relais et les boss multiphases restent à produire.

La référence de décor pour I.M.P. est *Murder Family*, saison 1 de Helluva Boss. La composition jouable élargit la réception pour laisser la piste libre. [Épisode officiel](https://www.youtube.com/watch?v=el_PChGfJN8)

## Couverture des assets au 19 novembre 2026 — vague B

Le relevé issu des registres contient **254 chemins d’assets distincts**, tous présents. Les détails par personnage et par arène se trouvent dans [ASSET_COVERAGE.json](ASSET_COVERAGE.json). Les poses individuelles ci-dessous concernent l’apparence habituelle ; les **24 poses des quatre costumes** sont comptées séparément.

| Élément | Disponible | Complément à produire pour couvrir les 36 combattants |
| --- | ---: | ---: |
| Pose individuelle d’attente | 10 | 26 |
| Pose individuelle de garde distincte | 3 | 33 |
| Pose individuelle de contact léger | 5 | 31 |
| Pose individuelle de réaction | 4 | 32 |
| Pose clé de finition | 5 | 31 |
| Illustrations affectées aux introductions, rivalités et épilogues | 26 sur 108 | 82 affectations |

Les 26 affectations narratives utilisent **22 illustrations distinctes**. Les autres scènes utilisent encore décor et portraits. Les 36 combattants restent jouables grâce à leurs atlas et banques d’animation ; une pose clé disponible ne constitue pas un cycle animé complet. Les quatorze arènes disposent toutes de trois plans enregistrés.

Le haut de Millie, le nœud papillon de Moxxie, la lance de Vaggie et la canne microphone d’Alastor sont conservés comme pièces de production. Le chapeau de Lucifer et la queue de Moxxie rejoignent cette réserve, sans assemblage articulé en jeu. La lanterne de Wrath et les variantes Carmine restent disponibles comme alternatives.

Le [rapport de la vague B](PRODUCTION_WAVE_B_2026-11-19.md) recense **24 nouveaux dessins, 11 sources retrouvées et 12 variantes d’export préservées**, soit **74 fichiers d’image supplémentaires**. Ses 27 nouveaux fichiers publics comprennent 25 références du jeu et deux composants préparés. La [galerie de la vague B](ASSET_GALLERY_WAVE_B_2026-11-19.md) permet de parcourir les fichiers individuels ; les dimensions, empreintes et statuts figurent dans le [manifeste de livraison](../../art/infernal-versus/production/delivery-wave-b-2026-11-19.json).

Le [rapport du lot précédent](PRODUCTION_2026-11-19.md) conserve son bilan historique de 49 œuvres et 117 fichiers. Les variantes retrouvées ne remplacent pas les poses de Stolas déjà intégrées.

Les dessins sont des adaptations pour le jeu. La fidélité à une référence, la fluidité des transitions et l’alignement des points d’appui restent à vérifier dans le jeu. Les contrôles visuels de cette vague portent sur des images individuelles et des compositions statiques ; la recette navigateur est restée indisponible.

## Bible de production

[Ouvrir le classeur V2](INFERNAL_VERSUS_BIBLE_V2.xlsx). Ses 23 feuilles rassemblent les routes et leurs combats, les valeurs des coups issues du moteur, les finitions, les stages, les illustrations et les propositions à produire. Le registre de conception est dans `extension-plan.json`. Pour reconstruire le classeur avec les dépendances d’auteur, exécuter `node docs/standalone/build-production-bible.mjs` à la racine du projet.

## Excel et sources du premier lot

`HAZBIN_HELLUVA_COMBAT_EXTENSION_V1.xlsx` contient onze onglets : Synthèse, Chantiers, Parité CQC, Personnages, Kits combat, Variantes, Techniques, Arènes, Parcours, Recette et Sources.

Les statuts distinguent Existant, Ajout PR, Partiel, À produire et À vérifier. « Ajout PR » décrit le lot de code soumis dans la [PR #1](https://github.com/darknigthmare/hellbound-hotel-manager/pull/1), dans son état à la livraison initiale. Le code et le classeur sont publiés sur la [branche GitHub](https://github.com/darknigthmare/hellbound-hotel-manager/tree/feat/infernal-versus-standalone-20261021). Le [commit de livraison `907af4a`](https://github.com/darknigthmare/hellbound-hotel-manager/commit/907af4a1e6a209862eebdc93db684955cb548b9d) a été vérifié par comparaison exacte de son arbre avec le lot local validé; les mises à jour de cette documentation peuvent être postérieures à ce commit.

Le [classeur Excel sur Google Drive](https://docs.google.com/spreadsheets/d/16kAZgcsTuPPq1DALMuVxZ4j7cymVk34_/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) a été téléversé au format `.xlsx` et ses métadonnées ont été vérifiées. Il est rangé dans le [dossier Infernal Versus](https://drive.google.com/drive/folders/1iU5o5IO2L6T9L1hLzqqFtHoYn95CKose).

Le classeur recense 118 chantiers, 40 axes CQC, 209 fiches de personnages, 36 kits (34 accessibles), 37 variantes, 108 actions (102 accessibles), 34 arènes actuelles/proposées, 68 parcours/archives et 42 scénarios de recette. Une fiche ou un sprite ne constitue pas à lui seul un combattant complet.

Les données structurées sont dans `extension-plan.json`. Le builder `build-workbook.mjs` utilise `@oai/artifact-tool` du runtime de création de documents; ce n'est pas une dépendance du jeu. Il accepte le JSON source et le dossier de sortie en arguments. La génération de l'Excel est indépendante de `npm run build`.

Référence CQC : `darknigthmare/shadow-codec-ops/public/cqc`, head `42279c1c884769873e66bbda0b6fe849bcd2f1a2`; arbre identique au lot P39 `bdcc11a5136e944b1eaa0b1adb357ddd3f3fa1ef`. Les modules CQC ont servi de référence d'architecture et de périmètre, sans modifier ce dépôt.

## Vérifications

`npm run qa` exécute TypeScript, ESLint, Vitest, les deux builds et la vérification SHA-256 de la distribution. La vague B du 19 novembre 2026 a réussi : **41 suites et 313 tests**, deux builds et **850 empreintes SHA-256**. Le relevé runtime trouve **254 chemins d’assets**, tous présents.

Le [rapport de la vague B](PRODUCTION_WAVE_B_2026-11-19.md), sa [galerie](ASSET_GALLERY_WAVE_B_2026-11-19.md) et son [manifeste de livraison](../../art/infernal-versus/production/delivery-wave-b-2026-11-19.json) détaillent les nouveaux dessins, fichiers retrouvés, intégrations et manques. La recette du jeu dans le navigateur est restée indisponible : les images ont été examinées individuellement et dans des compositions statiques, sans validation dynamique ni certification de fidélité 1:1.

Le [rapport du lot précédent](PRODUCTION_2026-11-19.md) et `QA_RESULTS.json` sont conservés comme preuves historiques. Les nouveaux fichiers du classeur et des assets sont destinés à la [PR nº 3](https://github.com/darknigthmare/hellbound-hotel-manager/pull/3).
