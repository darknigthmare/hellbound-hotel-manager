# Hellbound — Infernal Versus

Standalone de combat Hazbin Hotel × Helluva Boss, préparé à partir de `darknigthmare/hellbound-hotel-manager`, branche `master`, commit `2c19dd42a4f7cdfad7a7b93a06df01c636d8e578`.

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

Le fichier `dist-combat/index.html` est autonome vis-à-vis du manager. Aucun chargement de `App`, `localDb`, `cloudAccount` ou sauvegarde de gestion n'est nécessaire. Le build réutilise les assets existants du dépôt, environ 441 Mio; ces images sont chargées à la demande par le navigateur. Le build s'utilise via HTTP à la racine du domaine, pas par double-clic `file://` ni sous un sous-chemin arbitraire.

## Contenu de cette version

- 34 combattants : 22 kits Hazbin existants et 12 nouveaux kits Helluva.
- Helluva : Blitzø, Moxxie, Millie, Loona, Stolas, Striker, Verosika, Fizzarolli, Asmodeus, Beelzebub, Crimson et Andrealphus.
- 102 actions nommées accessibles : trois attaques par combattant. Le tableau de production recense aussi les six actions des deux kits AU existants exclus de ce roster.
- 8 arènes Hazbin réutilisées, leurs musiques originales et leurs spectateurs.
- Versus CPU, Versus local, entraînement, Arcade cinq duels, Survie vingt duels et Boss Rush.
- Trois difficultés; sélection des deux univers ou d'un seul; recherche; filtre Saison 1/Saisons 1–2 appliqué également aux spectateurs.
- Palmarès, parcours reproductibles à partir d'une seed, reprise entre combats, export/import validés et confirmation avant remplacement.
- Clavier partagé et contrôles tactiles, pause, relâchement des commandes lors d'une perte de focus, réduction des mouvements et flashes.

L'entraînement propose un mannequin immobile ou en garde, une jauge illimitée et une réinitialisation. Il n'enregistre aucun résultat. Les parcours mémorisent le prochain adversaire; quitter pendant un duel fait reprendre ce duel depuis son début. Les PV sont restaurés entre les duels, y compris en Survie. Une défaite interrompt le parcours et demande une reprise explicite. Les réessais sont enregistrés dans le parcours.

## Sauvegarde séparée

La seule clé écrite par le standalone est `hellbound_infernal_versus_v1`. Les données d'hôtel et d'inventaire sont exclues. Les imports vérifient version, champs, identifiants, options, compteurs, historique et parcours. Un chargement corrompu ne remplace pas automatiquement les octets existants. Si le stockage est indisponible, le jeu reste utilisable pour la session et affiche l'état d'enregistrement.

Chaque résultat porte un identifiant unique, empêchant les doubles récompenses. L'historique affichable conserve trente résultats; le registre de déduplication reste borné à dix mille matchs. Une limite atteinte produit une erreur explicite.

## Portée de la fidélité

Les noms et motifs des personnages sont issus des sources du projet; statistiques, dégâts, timings, attaques et confrontations sont des adaptations de jeu. Les kits reposent sur le moteur existant à trois attaques : un nom de tir ou de glace ne signifie pas qu'une simulation de projectile ou une altération spécifique a été ajoutée.

Les kits Fizzarolli, Verosika, Crimson et certaines figures puissantes sont signalés comme interprétations de leurs motifs. Stolas correspond à une incarnation avant *Mastermind*. Les états chronologiques alternatifs sont des chantiers distincts du classeur.

Les cinématiques Helluva utilisent la pose de garde ou de victoire de leur atlas existant; aucune banque cinématique nouvelle n'est revendiquée. Le Boss Rush utilise les combattants définis, pas des boss géants multiphases. Le réseau, le rollback, les équipes relais, les replays déterministes, les grandes campagnes et les nouvelles arènes Helluva restent à développer.

## Excel et sources

`HAZBIN_HELLUVA_COMBAT_EXTENSION_V1.xlsx` contient onze onglets : Synthèse, Chantiers, Parité CQC, Personnages, Kits combat, Variantes, Techniques, Arènes, Parcours, Recette et Sources.

Les statuts distinguent Existant, Ajout PR, Partiel, À produire et À vérifier. « Ajout PR » décrit le lot de code soumis dans la [PR #1](https://github.com/darknigthmare/hellbound-hotel-manager/pull/1), ouverte et non fusionnée. Le code et le classeur sont publiés sur la [branche GitHub](https://github.com/darknigthmare/hellbound-hotel-manager/tree/feat/infernal-versus-standalone-20261021). Le [commit de livraison `907af4a`](https://github.com/darknigthmare/hellbound-hotel-manager/commit/907af4a1e6a209862eebdc93db684955cb548b9d) a été vérifié par comparaison exacte de son arbre avec le lot local validé; les mises à jour de cette documentation peuvent être postérieures à ce commit.

Le [classeur Excel sur Google Drive](https://docs.google.com/spreadsheets/d/16kAZgcsTuPPq1DALMuVxZ4j7cymVk34_/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) a été téléversé au format `.xlsx` et ses métadonnées ont été vérifiées. Il est rangé dans le [dossier Infernal Versus](https://drive.google.com/drive/folders/1iU5o5IO2L6T9L1hLzqqFtHoYn95CKose).

Le classeur recense 118 chantiers, 40 axes CQC, 209 fiches de personnages, 36 kits (34 accessibles), 37 variantes, 108 actions (102 accessibles), 34 arènes actuelles/proposées, 68 parcours/archives et 42 scénarios de recette. Une fiche ou un sprite ne constitue pas à lui seul un combattant complet.

Les données structurées sont dans `extension-plan.json`. Le builder `build-workbook.mjs` utilise `@oai/artifact-tool` du runtime de création de documents; ce n'est pas une dépendance du jeu. Il accepte le JSON source et le dossier de sortie en arguments. La génération de l'Excel est indépendante de `npm run build`.

Référence CQC : `darknigthmare/shadow-codec-ops/public/cqc`, head `42279c1c884769873e66bbda0b6fe849bcd2f1a2`; arbre identique au lot P39 `bdcc11a5136e944b1eaa0b1adb357ddd3f3fa1ef`. Les modules CQC ont servi de référence d'architecture et de périmètre, sans modifier ce dépôt.

## Vérifications

`npm run qa` exécute TypeScript, ESLint, Vitest, les deux builds et la vérification SHA-256 de la distribution. Les tests standalone couvrent la progression, l'isolation des sauvegardes, les imports, les assets, le dojo, les callbacks de match et les parcours d'interface. `QA_RESULTS.json` contient le résultat final réellement obtenu, distinct des scénarios planifiés dans l'Excel.
