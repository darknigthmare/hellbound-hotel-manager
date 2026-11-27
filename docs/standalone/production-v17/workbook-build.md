# Construction de la Bible V17

La V17 ajoute les feuilles `Production V17` et `Cibles V17` à la Bible V16. Le contenu historique, y compris les six feuilles des extensions de combat, est conservé par le packer OOXML déjà utilisé dans le projet. Les cellules, styles, tableaux et formules des deux nouvelles feuilles sont créés avec Artifact Tool.

## Source figée

- Classeur : `docs/standalone/INFERNAL_VERSUS_BIBLE_V16.xlsx`.
- SHA-256 : `5a4c82a521c4bfb90bf91485a2c531e0cb047ded7d8535e0f798cd0ad109c704`.
- Structure : 70 feuilles et 79 tableaux.
- Commit de publication V16 : `28c98cf1fa67fa02c7f7565a231059d57f872d50`.

Le constructeur refuse une source dont l’empreinte a changé. L’inspection initiale a importé la V16 et rendu `Production V16!A1:E26` avant de reprendre sa mise en page.

## Entrée V17

`delivery-register.json` doit décrire les vrais fichiers retenus, leurs empreintes, leurs sources, les comptes avant/après et les contrôles effectivement exécutés. Le lot V17 préparé ici porte sur des accessoires statiques entiers en galerie : chaque dessin ajoute une fiche, aucun ne ferme une lacune de corps entier ou n’ajoute un kit jouable.

Les champs de validation technique et navigateur restent ceux du registre. Un contrôle ancien ne valide pas la nouvelle livraison. Les modes d’export final exigent le registre final, les fichiers réellement présents et une vérification en jeu explicite de chaque dessin. Le constructeur ne produit jamais une certification de fidélité 1:1.

## Commandes

Exécuter depuis la racine du dépôt avec les runtimes primaires. Le répertoire de travail est temporaire, hors dépôt. `task_output_dir` est un chemin absolu sous `outputs/infernal-v17/` dans l’espace de travail de la conversation.

```bash
task_work_dir=/workspace/scratch/3ca8c3f75b61/workbook-work-v17
task_output_dir=/workspace/scratch/3ca8c3f75b61/outputs/infernal-v17
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v17/build-bible-v17.mjs --inspect-baseline --work-dir "$task_work_dir" --output-dir "$task_output_dir"
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v17/build-bible-v17.mjs --validate --baseline-commit 28c98cf1fa67fa02c7f7565a231059d57f872d50
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v17/build-bible-v17.mjs --final --work-dir "$task_work_dir" --output-dir "$task_output_dir" --baseline-commit 28c98cf1fa67fa02c7f7565a231059d57f872d50
"$CODEX_PRIMARY_RUNTIME_PYTHON" docs/standalone/production-v17/workbook-ooxml-check.py --output-copy "$task_output_dir/INFERNAL_VERSUS_BIBLE_V17.xlsx"
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v17/build-bible-v17.mjs --render-final --work-dir "$task_work_dir" --output-dir "$task_output_dir"
```

L’export est copié dans `docs/standalone/INFERNAL_VERSUS_BIBLE_V17.xlsx` seulement après réussite des contrôles de calcul et de conservation. Les 70 feuilles et 79 tableaux historiques sont préservés ; le résultat compte 72 feuilles et 81 tableaux.

Le constructeur recalcule les six formules de synthèse, change des entrées représentatives puis les restaure, vérifie toutes les valeurs des deux nouveaux tableaux après export/réimport et rend leurs vues. La commande `--render-final` réimporte le classeur complet dans un nouveau processus et compare les vues représentatives avec les rendus des ajouts. Les PNG doivent être inspectés avant de déclarer la revue visuelle réussie.

Les rapports `workbook-qa.json`, `workbook-package-report.json`, `workbook-final-render-check.json` et la revue visuelle constituent la preuve de la V17 une fois produits. Une simple préparation du constructeur ne constitue pas une livraison du classeur. Microsoft Excel natif n’est pas utilisé par ce processus.

## Export exécuté le 27 novembre 2026

Le registre final consommé a pour SHA-256 `2ace657cfdc6ce57727740fc81b5a134e723d440fb4dba997520c7f48c5843b0`. Il décrit quatre accessoires, huit fichiers image et 149 entrées de galerie. Les quatre livraisons sont comptées sans ajout de base autonome, kit jouable ou cycle animé. Le constructeur ayant produit cet export a pour SHA-256 `75eb109621940f306f108aceb13d91fe34399a76da0fcd62aa9d0b9dd208b671`.

Le classeur `docs/standalone/INFERNAL_VERSUS_BIBLE_V17.xlsx` et sa copie dans `outputs/infernal-v17/` sont identiques : **809 356 octets**, SHA-256 **`d7e00ef9529d28e8df61ee78a043809418074f4478275c1a60069a5e91295bff`**. Il contient **72 feuilles et 81 tableaux natifs**. `Production V17` occupe `A1:H33`, avec quatre livraisons dans `StaticV17Deliveries` (`A29:H33`). `Cibles V17` occupe `A1:E116`, avec 111 lignes de données dans `StaticV17Targets` (`A5:E116`).

Le contrôle indépendant OOXML a conservé octet pour octet les **220 parties historiques gelées**, dont 70 feuilles, 69 fichiers de relations de feuilles et 79 tableaux. L’ordre et les attributs des feuilles, les noms définis et les entrées de styles historiques sont préservés. Les manifestes, styles et chaînes partagés sont étendus pour accueillir les ajouts ; le classeur complet n’est donc pas une copie octet pour octet de V16. Les six feuilles historiques des extensions restent présentes sans duplication.

Les six formules de synthèse ont été recalculées par Artifact Tool. Leur cache final contient respectivement 4 dessins, 4 nouveaux dessins, 0 révision, 8 fichiers, 0 nouvelle base et 115 bases cumulées. Le contrôle modification/recalcul/restauration a réussi, ainsi que la comparaison de tous les en-têtes et de toutes les valeurs des deux nouveaux tableaux après export/réimport. Aucune cellule d’erreur de formule n’a été trouvée dans les deux nouvelles feuilles.

Les **22 vues des ajouts** ont été rendues puis réellement ouvertes et inspectées : les trois vues de production par l’agent du classeur, et les 19 tranches des cibles par un second agent. Deux vues représentatives ont ensuite été rendues depuis le classeur final complet dans un nouveau processus puis inspectées : les PNG `final-production.png` et `final-cibles-0.png` sont identiques octet pour octet à leurs vues d’origine. Aucun texte coupé, débordement sur une ligne voisine ou défaut de hauteur de ligne n’a été observé. Les larges vues des cibles nécessitent un zoom lorsque l’aperçu est réduit. Les images se trouvent dans `workbook-previews/`, avec la vue de référence V16 conservée séparément. Le résultat et le périmètre exact de cette inspection visuelle par les agents sont consignés dans `workbook-visual-review.json`.

La QA technique et la recette navigateur présentées dans le classeur proviennent du registre final et de leurs rapports dédiés. La vérification du classeur ne constitue ni une nouvelle recette du jeu, ni une certification de fidélité 1:1. L’ouverture, le rendu et le recalcul dans Microsoft Excel natif n’ont pas été exécutés.
