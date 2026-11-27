# Bible V16 — génération et contrôle

**État : classeur V16 exporté et vérifié le 27 novembre 2026.** Le lot comprend deux portraits d’archives, Gerald et Rick. Ils ajoutent deux entrées de galerie, portant celle-ci à 145, et ne ferment aucune base autonome manquante : le total reste de 115 bases. Le registre final et la validation en jeu de ces deux dessins sont exigés par tous les modes d’export, y compris `--prepare`.

## Historique conservé

La source figée est `docs/standalone/INFERNAL_VERSUS_BIBLE_V15.xlsx`, SHA-256 `b98174db5b2c641e8f088cf3b3919e34ff7da581b693c4ee93679fa135c71450`, publiée dans le commit `68007b81bce0307a9c54cb3e42ef8bdf231087d6`. Elle contient 68 feuilles et 77 tableaux. Le générateur ajoute exclusivement **Production V16** et **Cibles V16**, soit **70 feuilles et 79 tableaux**. Les six feuilles des extensions de combat restent dans leur position historique ; elles ne sont ni réécrites ni dupliquées.

Le registre `delivery-register.json` fournit `edition: V16`, le vrai commit V15 publié dans `baselineCommit`, les comptes cumulés V15 dans `baseline`, les deux livraisons acceptées, leurs chemins et empreintes, les sources et la recette finale. Le générateur refuse une base nouvelle, un cadrage autre que portrait (`bust`), un compte de galerie différent de 145, un fichier dont l’empreinte diffère ou une livraison non contrôlée en jeu. Il conserve les limites de fidélité et les états des cibles tels que le registre les documente.

## Construction après validation du registre

Depuis le dépôt, choisir un répertoire temporaire pour la création et un dossier de sortie absolu sous `outputs/` dans l’espace de travail. Exécuter avec les runtimes primaires :

```bash
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v16/build-bible-v16.mjs --inspect-baseline --work-dir "$task_work_dir" --output-dir "$task_output_dir"
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v16/build-bible-v16.mjs --validate --baseline-commit "$published_v15_commit"
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v16/build-bible-v16.mjs --final --work-dir "$task_work_dir" --output-dir "$task_output_dir" --baseline-commit "$published_v15_commit"
"$CODEX_PRIMARY_RUNTIME_PYTHON" docs/standalone/production-v16/workbook-ooxml-check.py --output-copy "$task_output_dir/INFERNAL_VERSUS_BIBLE_V16.xlsx"
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v16/build-bible-v16.mjs --render-final --work-dir "$task_work_dir" --output-dir "$task_output_dir"
```

Le mode `--inspect-baseline` lit uniquement V15 et produit son aperçu. `--validate` vérifie les métadonnées et les fichiers sans créer de classeur. Les modes d’export exigent `final_production_register`, `qa.status: passed` et `inGameChecked: true` pour le lot et chaque dessin.

La recette comprend le recalcul des six formules, un changement d’entrée suivi d’une restauration, la comparaison de toutes les valeurs des deux nouveaux tableaux après réimport, la préservation OOXML des 68 feuilles et 77 tableaux V15 et deux rendus représentatifs du classeur complet. Les aperçus sont inspectés et la revue consignée avant d’annoncer la Bible V16 validée. Aucun contrôle dans Microsoft Excel natif ni aucune certification de fidélité 1:1 n’est annoncé par ce générateur.

## Export validé

Le classeur livré contient **70 feuilles et 79 tableaux**, pour **786 503 octets**. Son SHA-256 est `5a4c82a521c4bfb90bf91485a2c531e0cb047ded7d8535e0f798cd0ad109c704`. Le registre source est resté figé à l’empreinte `9723e5e491ec548bbf42f8069a9ef9d746bc3bc05b7f710643e340d5f7e2ff00`.

Les **214 parties historiques** contrôlées sont identiques à V15. Les six formules sont recalculées sans erreur et les **584 cellules d’en-tête et de données** des deux nouveaux tableaux sont identiques avant et après export. Les deux plages représentatives réimportées depuis le classeur complet produisent des PNG identiques aux aperçus de création. La [revue visuelle](workbook-visual-review.json) consigne six plages effectivement inspectées sur les 22 produites, couvrant les deux feuilles, les deux livraisons et les limites de leurs bases entières.

Les rapports [OOXML](workbook-ooxml-review.json), [rendu complet](workbook-final-render-check.json) et [QA](workbook-qa.json), ainsi que 25 PNG comprenant l’aperçu V15 de référence, sont conservés avec cette édition. La synthèse reprend les preuves du registre : 439 tests dans 51 suites, 742 assets référencés et huit contrôles de galerie. Cette dernière portée demeure celle de portraits statiques dans Chromium local, sans nouveau kit de combat ni animation.
