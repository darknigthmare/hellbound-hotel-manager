# Livraison — Hellbound : Infernal Versus V1

Le code et le classeur Excel ont été publiés sur la [branche GitHub `feat/infernal-versus-standalone-20261021`](https://github.com/darknigthmare/hellbound-hotel-manager/tree/feat/infernal-versus-standalone-20261021). La [PR #1](https://github.com/darknigthmare/hellbound-hotel-manager/pull/1), créée le 22 octobre 2026 à 06:56:12 UTC, est ouverte, prête à relire et non fusionnée. Le [classeur Excel sur Google Drive](https://docs.google.com/spreadsheets/d/16kAZgcsTuPPq1DALMuVxZ4j7cymVk34_/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) a également été téléversé et ses métadonnées vérifiées.

Le [commit de livraison du code `907af4a`](https://github.com/darknigthmare/hellbound-hotel-manager/commit/907af4a1e6a209862eebdc93db684955cb548b9d) contient 35 fichiers modifiés ou ajoutés. Son arbre GitHub a été comparé exactement à l'arbre local validé (`a95339dbb8958277f11374d697f762114f736c90`). Ce commit identifie le lot de code vérifié; les mises à jour ultérieures du statut dans la documentation peuvent former des commits supplémentaires.

Le fichier Excel se trouve dans le [dossier Hazbin Hotel — Infernal Versus](https://drive.google.com/drive/folders/1iU5o5IO2L6T9L1hLzqqFtHoYn95CKose).

## Fichiers

- `INFERNAL_VERSUS_V1_PATCH_EXCEL.zip` : patch Git complet, classeur Excel, documentation, description de PR et preuves de validation.
- `INFERNAL_VERSUS_STANDALONE_V1.zip` : jeu navigateur déjà compilé avec ses assets. Environ 441 Mio avant compression ; ce n'est pas un exécutable Windows.
- `INFERNAL_VERSUS_V1.patch` : toutes les modifications de code et de documentation, y compris le classeur et les captures.
- `HAZBIN_HELLUVA_COMBAT_EXTENSION_V1.xlsx` : plan d'extension de onze onglets.

## Essayer le jeu compilé

Décompresser l'archive du standalone, puis ouvrir un terminal dans son dossier `INFERNAL_VERSUS_STANDALONE_V1`. Avec Python 3 installé :

```bash
python -m http.server 8080 --bind 127.0.0.1 --directory jeu
```

Ouvrir ensuite `http://localhost:8080/`. Sur les systèmes où Python 3 est nommé `python3`, remplacer `python` par `python3`. Servir le dossier `jeu` comme racine HTTP : le double-clic sur `index.html` et un sous-chemin arbitraire ne sont pas pris en charge.

## Récupérer la branche publiée

Pour récupérer directement le code et l'Excel de la PR dans un nouveau dossier :

```bash
git clone --branch feat/infernal-versus-standalone-20261021 --single-branch https://github.com/darknigthmare/hellbound-hotel-manager.git hellbound-infernal-versus
cd hellbound-infernal-versus
npm ci
npm run qa
```

La PR vise `master`; elle n'est pas fusionnée. Le classeur versionné se trouve à `docs/standalone/HAZBIN_HELLUVA_COMBAT_EXTENSION_V1.xlsx`.

## Appliquer le patch dans une copie de la base

Base exacte utilisée : dépôt `darknigthmare/hellbound-hotel-manager`, branche `master`, commit `2c19dd42a4f7cdfad7a7b93a06df01c636d8e578`.

Dans une copie propre du dépôt contenant ce commit :

```bash
git switch -c feat/infernal-versus-standalone-20261021 2c19dd42a4f7cdfad7a7b93a06df01c636d8e578
git apply --check /chemin/vers/INFERNAL_VERSUS_V1.patch
git apply /chemin/vers/INFERNAL_VERSUS_V1.patch
npm ci
npm run qa
```

Le chemin `/chemin/vers/INFERNAL_VERSUS_V1.patch` doit désigner le patch extrait. Cette procédure suppose un espace de travail propre. Si la branche cible a évolué depuis la base indiquée, réconcilier ces évolutions avant publication.

Après application, le classeur se trouve à `docs/standalone/HAZBIN_HELLUVA_COMBAT_EXTENSION_V1.xlsx`. `docs/standalone/PR_BODY.md` contient la description du lot soumis dans la PR vers `master`. Le même fichier Excel est disponible sur Google Drive, au format `.xlsx`, sans conversion en Google Sheets.

## Validation obtenue

- TypeScript et ESLint : réussis.
- Vitest : 263 tests réussis dans 37 suites, dont 33 tests dédiés au standalone.
- Build du manager et build séparé : réussis.
- Distribution autonome : 722 fichiers contrôlés par SHA-256.
- Navigateur bureau et mobile : lancement, combat, commandes, pause et entraînement vérifiés ; aucune erreur collectée ; sauvegardes hôtel et inventaire préservées.
- Excel : onze onglets, 54 formules avec résultats calculés, aucune cellule d'erreur détectée ; recalcul après modification d'un statut et ajout de ligne vérifié. Excel Desktop n'a pas été exécuté.

`QA_RESULTS.json` et `QA_LOG.txt` consignent les résultats finaux. Le détail du périmètre jouable et des extensions encore à produire se trouve dans `README.md` et dans le classeur.
