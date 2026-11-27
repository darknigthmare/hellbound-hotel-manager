# Bible V15 — génération et contrôle

La V15 ajoute **Production V15**, **Cibles V15** et les six feuilles des extensions du guide de combat à la bible V14 vérifiée. Le générateur lit les livraisons réelles dans `delivery-register.json` ; aucun personnage ni nombre de dessins n’est codé en dur. L’assemblage conserve les 60 feuilles et 69 tableaux historiques, pour un total attendu de **68 feuilles et 77 tableaux**.

Le registre suit le schéma de la V14. Il précise le commit V14 publié dans `baselineCommit`, ses comptes cumulés dans `baseline`, les comptes V15, les assets acceptés et leurs empreintes, les sources, les états des cibles et les preuves QA. Un ajout de base exige `addsStandaloneBase: true`, `frameCoverage: full_body`, une identité de production unique et la liste des identifiants du catalogue réellement couverts. Un portrait ou une variante ne ferme pas automatiquement une base entière manquante.

Les références de personnages encore incomplètes et les refus de cette vague sont ajoutés à **Cibles V15** depuis `remaining.characterReferenceGaps` et `remaining.refusedThisWave`. Les cibles déjà présentes ne sont pas dupliquées. Les livraisons, les refus et les références partielles conservent leurs états distincts.

Les six autres feuilles reprennent les données de `guide-extensions-20261127/workbook-sheets.json` : **Guides_Sources_20261127**, **Extensions_01_02**, **Ext_Fiches**, **Ext_Duos_Bonus**, **Ext_Recette** et **Ext_Runtime**. Elles couvrent les trois sources originales, les 38 nouvelles rubriques, 16 fiches, huit duos, dix bonus et 40 cas d’acceptation. La feuille de preuves locales détaille chaque champ du rapport `runtime-integration.json`, sans condenser toutes les règles dans une seule cellule. Les états initiaux et les incréments vérifiés restent distincts.

Exécuter avec les runtimes primaires, depuis le dépôt. Choisir un répertoire temporaire propre à la session pour la construction et un dossier de sortie absolu sous `outputs/` dans l’espace de travail. Régénérer les données documentaires après finalisation de `runtime-integration.json`, puis construire :

```bash
"$CODEX_PRIMARY_RUNTIME_PYTHON" docs/standalone/guide-extensions-20261127/build-integration.py
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v15/build-bible-v15.mjs --final --work-dir "$task_work_dir" --output-dir "$task_output_dir"
"$CODEX_PRIMARY_RUNTIME_PYTHON" docs/standalone/production-v15/workbook-ooxml-check.py --output-copy "$task_output_dir/INFERNAL_VERSUS_BIBLE_V15.xlsx"
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v15/build-bible-v15.mjs --render-final --work-dir "$task_work_dir" --output-dir "$task_output_dir"
```

Le mode `--final` exige un registre final, une QA réussie et un contrôle en jeu explicite de chaque dessin. Le mode facultatif `--prepare` permet une première construction avant finalisation sans publier le classeur dans le dépôt. Les aperçus doivent être inspectés et leur revue enregistrée. Le mode `--render-final` compare une plage représentative de chacune des huit nouvelles feuilles du classeur complet avec son aperçu de création. L’option facultative `--baseline-commit` vérifie en plus que le registre cite le commit V14 attendu.

La vérification OOXML confirme l’intégrité de l’archive, les 68 feuilles et 77 tableaux, l’unicité des identifiants, la préservation des feuilles, relations et tableaux historiques, les valeurs recalculées des six formules V15 et la correspondance de toutes les cellules d’en-tête et de données des six feuilles d’extensions avec leur source. Aucun contenu historique n’est réécrit pour produire cette édition.

La vérification des formules et de l’export ne certifie ni une exécution dans Microsoft Excel natif ni une fidélité visuelle canonique 1:1.

## Export validé du 27 novembre 2026

Le classeur livré contient **68 feuilles et 77 tableaux**, pour **764 746 octets**. Son SHA-256 est `b98174db5b2c641e8f088cf3b3919e34ff7da581b693c4ee93679fa135c71450`. La base publiée est le commit V14 `d03434054739e2995ccdc86617fb2ca3a1ea56bf`.

Les contrôles ont confirmé les 60 feuilles, 69 tableaux et 190 parties historiques inchangés, les six formules recalculées sans erreur, ainsi que les **1 863 cellules d’en-tête et de données des extensions** identiques aux sources. Huit plages représentatives du classeur complet produisent des PNG identiques aux aperçus de création. La [revue visuelle](workbook-visual-review.json) consigne les 19 plages effectivement inspectées sur les 44 produites ; elles couvrent les huit nouvelles feuilles. Les aperçus et les rapports [OOXML](workbook-ooxml-review.json), [rendu complet](workbook-final-render-check.json) et [QA](workbook-qa.json) sont conservés avec cette édition.
