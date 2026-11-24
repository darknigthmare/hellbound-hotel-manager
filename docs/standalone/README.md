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

## Contenu de cette version — 24 novembre 2026, vague D

- **40 combattants jouables** : 25 de *Hazbin Hotel* et 15 de *Helluva Boss*. Katie Killjoy, Tom Trench, Stella et Mammon rejoignent le standalone avec trois coups, une route de trois duels et une finition à effet partagé. Ces kits sont des créations d’Exhibition fondées sur leurs motifs ; leurs techniques signatures restent des propositions à prototyper.
- **124 attaques paramétrées** : 120 légers, lourds et spéciaux, plus les quatre signatures de Vaggie, Blitzø, Mimzy et Sallie May. Le carnet expose les commandes, les temps, la portée et le coût en tension.
- **Six costumes et 35 poses de costume** : Vaggie exorciste, Loona humaine, Stolas humain, Moxxie au festival des moissons, Carmilla cheveux lâchés et Lute avant sa blessure de fin de saison 1. Carmilla utilise sa pose de repos en accroupissement, faute de dessin dédié.
- **37 poses individuelles d’attente, 13 gardes distinctes, 15 contacts légers et 14 réactions.** Katie, Tom et Mammon disposent chacun de quatre nouveaux dessins. Mammon utilise une échelle uniforme et un placement des pieds mesuré. Ce sont des poses clés ; les cycles complets restent un chantier séparé.
- **22 arènes à trois plans**. La mine de Striker (*Western Energy*), le tribunal infernal (*Mastermind*) et les portes du Paradis (*Welcome to Heaven*) ajoutent neuf couches illustrées et trois miniatures. Leur fond reste entier, avec des bandes teintées selon le format. Le manager conserve ses huit arènes.
- **11 images VFX pour 24 associations d’attaques, sur 14 combattants** : cartes de Husk, lumière d’Adam, portail de Stolas, fumée d’Asmodeus et ruban lumineux de Bee ajoutés aux effets existants. Angel Dust, Blitzø et Striker réemploient le tir de Moxxie. Ces effets visuels suivent les coups existants, sans collision ou dégâts supplémentaires.
- Histoire, Tournoi, Versus CPU, Versus local, Entraînement, Arcade, Survie et Boss Rush. Le Boss Rush tire parmi neuf adversaires possibles, puis retire le combattant du joueur s’il appartient à ce groupe. Une sauvegarde déjà créée conserve son propre parcours.
- L’Histoire propose **40 routes et 120 duels écrits**. Chaque troisième rencontre conclut une rivalité ; l’épilogue se retrouve dans le Codex. Les quatre nouvelles routes sont des histoires AU. Les filtres de saison et d’univers déterminent les routes accessibles.
- Le Tournoi construit un tableau reproductible de huit, quatre ou deux participants suivant l’effectif disponible. Le joueur dispute ses matchs ; les CPU sont simulés et une défaite élimine le joueur.
- Un lourd touchant sans garde peut être suivi d’un spécial dès la fin de l’arrêt sur impact, pendant sa récupération. Cet enchaînement consomme 50 de tension.
- Un K.-O. décisif ouvre une fenêtre de 3,2 secondes : H pour J1, L pour J2 ou **Fatalité**. La finition dure 1,5 seconde ; **Passer** rejoint directement la victoire. La canne à pomme de Lucifer reste une pièce séparée intégrée.
- Trois difficultés, recherche et filtres d’univers/saison ; clavier partagé et contrôles tactiles ; pause et relâchement des commandes lors d’une perte de focus ; réduction des mouvements et des flashes.

L’entraînement propose un mannequin immobile ou en garde, une jauge illimitée et une réinitialisation, sans enregistrer de résultat. Les parcours reprennent le duel en cours depuis son début après une sortie. Les PV sont restaurés entre les rencontres, y compris en Survie. Les autres modes de parcours proposent une reprise explicite après une défaite ; les réessais sont mémorisés.

## Sauvegarde séparée

La seule clé écrite par le standalone est `hellbound_infernal_versus_v1`. Les données d'hôtel et d'inventaire sont exclues. Les imports vérifient version, champs, identifiants, options, compteurs, historique et parcours. Un chargement corrompu ne remplace pas automatiquement les octets existants. Si le stockage est indisponible, le jeu reste utilisable pour la session et affiche l'état d'enregistrement.

Chaque résultat porte un identifiant unique, empêchant les doubles récompenses. L'historique affichable conserve trente résultats; le registre de déduplication reste borné à dix mille matchs. Une limite atteinte produit une erreur explicite.

## Portée de la fidélité

Les identités, incarnations et motifs sont rattachés aux sources indiquées dans les manifestes. Statistiques, timings, postures de combat, déplacements d’accessoires et affrontements sont des adaptations pour le jeu. Les épisodes officiels, portfolios de production, produits sous licence et captures republiées sont distingués dans la [revue de la vague D](REVIEW_ASSETS_WAVE_D_2026-11-24.md).

Katie et Tom utilisent les repères de la série principale en saison 1, sans mélange avec le pilote. Leurs références inspectées montrent surtout le haut du corps : leurs silhouettes complètes incluent donc une reconstruction. Mammon correspond à sa forme habituelle à quatre bras, sans transformation géante. Stella reste jouable avec son portrait historique intact utilisé comme repli provisoire ; sa nouvelle READY a été refusée par le générateur, sans relance ni nouvelle pose déclarée. Le projectile de flamme de Lucifer reste différé faute de référence suffisamment lisible.

Les finitions comprennent 40 titres et huit traitements partagés ; cinq personnages disposent d’une pose de finition dédiée. Les variantes longues de la bible restent à animer. Les illustrations narratives couvrent 26 affectations avec 22 dessins distincts ; les autres scènes associent décor et portraits. Le réseau avec rollback, les replays déterministes, le relais et les boss multiphases restent à produire.

**La fidélité exacte 1:1 n’est pas certifiée.** Les images ont été inspectées individuellement et en compositions statiques. Le lancement local de Chromium échoue sur `socket() EPERM`, avant toute page : les tests de composants et les montages ne constituent pas une recette navigateur. Les transitions, tailles relatives, occultations et lisibilité sur appareil restent à vérifier.

## Couverture des assets — vague D

Le [relevé runtime](ASSET_COVERAGE.json) contient **377 chemins distincts, tous présents**. Les apparences habituelles et les costumes sont comptés séparément.

| Élément | Disponible | Reste pour couvrir les 40 combattants |
| --- | ---: | ---: |
| Pose individuelle d’attente | 37 | 3 |
| Garde individuelle distincte | 13 | 27 |
| Pose de contact léger | 15 | 25 |
| Pose individuelle de réaction | 14 | 26 |
| Pose clé de finition | 5 | 35 |
| Illustrations d’introduction, rivalité et épilogue | 26 sur 120 | 94 affectations |

Katie, Tom et Mammon utilisent leurs nouvelles poses comme repli statique pour les actions encore non redessinées ; Stella utilise son portrait historique. Les anciennes banques de ces quatre personnages contiennent des cellules tronquées ou contaminées et ne sont plus affichées dans le standalone. Les poses de repli ne sont pas comptées comme des dessins supplémentaires.

Les **22 arènes possèdent trois plans**. Les six costumes utilisent 35 poses clés ; les atlas et banques historiques restent disponibles comme ressources. La présence d’une pose ou d’un atlas ne prouve pas un cycle fluide ni une fidélité intégrale.

La vague D apporte **26 dessins retenus et 55 fichiers d’image** : 12 poses de personnages, neuf plans de décors, cinq images VFX, leurs PNG et WebP, et trois miniatures. Les masters sont préservés à l’octet ; les WebP sont sans perte, avec réduction proportionnelle des six props carrés. Les détails, empreintes et limites figurent dans le [manifeste](../../art/infernal-versus/production/delivery-wave-d-2026-11-24.json) et le [rapport de livraison](DELIVERY_WAVE_D_2026-11-24.md).

Les pièces de réserve — vêtements, chapeau, queue, canne, lance et variantes de décor — restent conservées avec leur statut hors rig ou hors scène active. Elles ne sont pas comptées comme nouveaux éléments jouables.

## Bible de production

[Ouvrir le classeur V2](INFERNAL_VERSUS_BIBLE_V2.xlsx). Ses **23 feuilles** conservent les onze onglets V1 historiques et ajoutent douze onglets V2, calculés à partir du jeu actuel : routes, duels, coups, techniques, tenues, finitions, plans, illustrations, atelier et sources. Les prototypes sont distingués des techniques jouables.

Le registre est `extension-plan.json`. Le bloc `meta.currentRuntime` et les tables V2 décrivent l’état courant ; `meta.implementation` et les onze feuilles V1 restent historiques. La génération est indépendante des builds du jeu : `node docs/standalone/build-production-bible.mjs`, avec les dépendances d’auteur. Le [rapport du classeur](QA_WORKBOOK_WAVE_D_2026-11-24.json) vérifie données, formules et préservation des anciennes feuilles.

## Excel et sources du premier lot

`HAZBIN_HELLUVA_COMBAT_EXTENSION_V1.xlsx` contient onze onglets : Synthèse, Chantiers, Parité CQC, Personnages, Kits combat, Variantes, Techniques, Arènes, Parcours, Recette et Sources.

Les statuts distinguent Existant, Ajout PR, Partiel, À produire et À vérifier. « Ajout PR » décrit le lot de code soumis dans la [PR #1](https://github.com/darknigthmare/hellbound-hotel-manager/pull/1), dans son état à la livraison initiale. Le code et le classeur sont publiés sur la [branche GitHub](https://github.com/darknigthmare/hellbound-hotel-manager/tree/feat/infernal-versus-standalone-20261021). Le [commit de livraison `907af4a`](https://github.com/darknigthmare/hellbound-hotel-manager/commit/907af4a1e6a209862eebdc93db684955cb548b9d) a été vérifié par comparaison exacte de son arbre avec le lot local validé; les mises à jour de cette documentation peuvent être postérieures à ce commit.

Le [classeur Excel sur Google Drive](https://docs.google.com/spreadsheets/d/16kAZgcsTuPPq1DALMuVxZ4j7cymVk34_/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) a été téléversé au format `.xlsx` et ses métadonnées ont été vérifiées. Il est rangé dans le [dossier Infernal Versus](https://drive.google.com/drive/folders/1iU5o5IO2L6T9L1hLzqqFtHoYn95CKose).

Le registre V1 historique recense 118 chantiers, 40 axes CQC, 209 fiches de personnages, 36 kits (34 accessibles), 37 variantes, 108 actions (102 accessibles), 34 arènes actuelles/proposées, 68 parcours/archives et 42 scénarios de recette. Une fiche ou un sprite ne constitue pas à lui seul un combattant complet.

Les données structurées sont dans `extension-plan.json`. Le builder `build-workbook.mjs` utilise `@oai/artifact-tool` du runtime de création de documents; ce n'est pas une dépendance du jeu. Il accepte le JSON source et le dossier de sortie en arguments. La génération de l'Excel est indépendante de `npm run build`.

Référence CQC : `darknigthmare/shadow-codec-ops/public/cqc`, head `42279c1c884769873e66bbda0b6fe849bcd2f1a2`; arbre identique au lot P39 `bdcc11a5136e944b1eaa0b1adb357ddd3f3fa1ef`. Les modules CQC ont servi de référence d'architecture et de périmètre, sans modifier ce dépôt.

## Vérifications

`npm run qa` exécute TypeScript, ESLint, Vitest, les deux builds et la vérification SHA-256 de la distribution. La vague D passe **44 suites et 363 tests**, deux builds et **961 empreintes** ; les **1114 fichiers sources** hachés sont inchangés pendant le run. Le [rapport de QA de la vague D](QA_RUNTIME_WAVE_D_2026-11-24.json) et son [journal](QA_RUNTIME_WAVE_D_2026-11-24.log) donnent le résultat exact et les empreintes des sources contrôlées. La [revue visuelle](REVIEW_ASSETS_WAVE_D_2026-11-24.md) précise le périmètre statique et les références ; le [rapport de livraison](DELIVERY_WAVE_D_2026-11-24.md) relie les ajouts, contrôles et limites.

Cette vague est destinée à la [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8), avec les lots précédents du 24 novembre. Les [preuves de la vague C](QA_RUNTIME_WAVE_C_2026-11-24.json), le [rapport de la vague B](PRODUCTION_WAVE_B_2026-11-19.md), sa [galerie](ASSET_GALLERY_WAVE_B_2026-11-19.md) et le [rapport antérieur](PRODUCTION_2026-11-19.md) restent des archives datées ; leurs chiffres ne décrivent pas la version courante.
