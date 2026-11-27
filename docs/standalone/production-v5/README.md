# Sources de production V5

Cette archive conserve les huit registres acceptés, leurs prompts/files de génération, les notes de revue, les audits et les preuves techniques. Les JSON source sont copiés à l’octet ; leur ancien chemin de travail est une provenance historique. Les chemins relatifs des fichiers conservés et leurs SHA-256 figurent dans [l’index](archive-index.json).

Les masters PNG, exports WebP et modèles du projet sont déjà dans le dépôt. Les sources de sortie sont remappées vers un master uniquement après comparaison de SHA-256. Les captures officielles consultées sont documentées par URL, source, temps approximatif, résolution et empreinte dans les index ; aucun de leurs bitmaps n’est publié ici. Les quinze entrées d’images intermédiaires utilisées avant correction restent identifiées comme exclues, et ne sont jamais remplacées silencieusement par le master final.

## Régénérer les données et la bible

Depuis la racine du dépôt, la consolidation ne nécessite plus l’ancien dossier de travail :

```bash
node docs/standalone/consolidate-static-production-v5.mjs
python docs/standalone/production-v5/recipes/sync-narrative-registry.py --all-reviewed-ledgers --dry-run
```

La seconde recette est un script Python : l’exécuter avec Python pour consulter l’aide ou reconstruire les affectations avec `--all-reviewed-ledgers --dry-run`. Les options `--root` et `--source-dir` permettent un contrôle sur une copie isolée. La recette d’export possède également un mode de vérification sans écriture.

Le builder `build-static-production-v5.mjs --prepare` utilise les deux JSON consolidés pour produire un relevé sans classeur. Avec le runtime documentaire principal, `--final --output <dossier>` vérifie les images, conserve les 34 feuilles V4 et ajoute les six vues V5. L’édition finale préserve les propositions de lore et les preuves des versions antérieures.

Cette reproductibilité concerne le suivi, le classeur, les associations et les fichiers acceptés. Une génération d’image est stochastique ; les prompts et références ne sont pas présentés comme un moyen de retrouver exactement les mêmes pixels. Les deux refus conservés ne sont pas inclus dans une file de relance.
