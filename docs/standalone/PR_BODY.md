## Pourquoi

Le combat Pentagram Arena était accessible dans l'application de gestion. Une entrée indépendante permet de jouer et de distribuer le combat séparément, avec une progression propre, et de préparer son extension à Hazbin Hotel et Helluva Boss en prenant le CQC du projet Metal Gear comme référence.

## Changements

- Ajoute `combat.html`, une interface Infernal Versus et un build séparé `dist-combat/index.html`, ainsi qu'un accès depuis Pentagram Arena.
- Propose 34 combattants : 22 kits Hazbin existants et 12 kits Helluva, avec 102 actions nommées et huit arènes existantes.
- Ajoute Versus CPU, Versus local, entraînement, Arcade cinq duels, Survie vingt duels et Boss Rush, avec sélection de difficulté, univers, saison et arène.
- Isole la sauvegarde dans `hellbound_infernal_versus_v1` : palmarès, reprise entre duels, imports validés et export. Les sauvegardes du manager ne sont pas utilisées.
- Prévoit clavier, tactile, pause, perte de focus et réduction des mouvements ; le dojo propose un mannequin immobile ou en garde et ne comptabilise aucun résultat.
- Ajoute l'Excel `docs/standalone/HAZBIN_HELLUVA_COMBAT_EXTENSION_V1.xlsx`, ses données et son builder : onze onglets, 118 chantiers, 40 axes de comparaison CQC et 209 fiches de personnages. Les contenus jouables et les propositions de production portent des statuts distincts.

Le même [classeur Excel est disponible sur Google Drive](https://docs.google.com/spreadsheets/d/16kAZgcsTuPPq1DALMuVxZ4j7cymVk34_/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true), au format `.xlsx`, dans le [dossier Infernal Versus](https://drive.google.com/drive/folders/1iU5o5IO2L6T9L1hLzqqFtHoYn95CKose). Son téléversement et ses métadonnées ont été vérifiés.

## Validation

`npm run qa` réussit : TypeScript, ESLint, 263 tests dans 37 suites, les deux builds et le contrôle SHA-256 de 722 fichiers. Les quatre nouvelles suites incluent 33 tests dédiés au standalone. Un contrôle du build compilé dans Chromium couvre les écrans bureau/mobile, les commandes, la pause, l'entraînement et la préservation des sauvegardes du manager. Résultats : `docs/standalone/QA_RESULTS.json` et `QA_LOG.txt`.

L'Excel a été contrôlé dans le moteur Artifact Tool et par inspection du paquet XLSX : onze onglets, 54 formules calculées, aucune cellule d'erreur et recalcul des statuts vérifié. Excel Desktop n'a pas été exécuté.

## Limites du lot

Le moteur reste une adaptation à trois attaques par combattant. Les cinématiques Helluva utilisent des poses des atlas existants ; les huit arènes proviennent du projet Hazbin. Les PV sont restaurés entre les duels, y compris en Survie. Réseau, rollback, replays déterministes, équipes relais, nouvelles arènes Helluva, boss multiphases et grandes campagnes figurent dans le plan d'extension.

Le build indépendant copie les assets existants, environ 441 Mio avant compression. Il doit être servi par HTTP à la racine du site.

Base de travail : `2c19dd42a4f7cdfad7a7b93a06df01c636d8e578`. Référence CQC : `darknigthmare/shadow-codec-ops/public/cqc`, commit `42279c1c884769873e66bbda0b6fe849bcd2f1a2`. Aucun changement n'est apporté au dépôt Metal Gear.
