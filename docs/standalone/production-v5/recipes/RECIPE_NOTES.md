# Recettes portables de production V5

Destination prévue : `docs/standalone/production-v5/recipes/`. Les données source se trouvent dans le dossier voisin `source-ledgers/`. La racine du dépôt est calculée depuis cet emplacement ; les options `--root` et `--source-dir` permettent de travailler sur un autre checkout ou une autre archive.

Ces recettes reproduisent les exports et les affectations à partir de sorties acceptées. Elles ne régénèrent pas les illustrations et ne promettent pas de rejouer à l’identique une génération stochastique.

## Contrôler un couple de fichiers accepté

```sh
python docs/standalone/production-v5/recipes/process-personal-output.py \
  --queue docs/standalone/production-v5/source-ledgers/audit-continuation-generation-queue.json \
  --records docs/standalone/production-v5/source-ledgers/audit-continuation-generation-records.json \
  --ledger docs/standalone/production-v5/source-ledgers/audit-continuation-generated-assets.json \
  --dry-run verify v3:vox:ending
```

Le mode `verify` vérifie les empreintes du master et de l’export, les formats, les dimensions, l’opacité et l’égalité exacte des pixels RGBA décodés. Il n’écrit aucun fichier. `--dry-run` rend également les autres actions purement consultatives ; il ne crée ni répertoire ni verrou.

Les actions d’écriture historiques sont conservées : `start`, `export`, `accept`, `failure`, `reject`. `export` refuse d’écraser un master ou un export existant. Les sorties restent dans le dépôt désigné, avec des chemins relatifs contrôlés. Pour enregistrer un nouveau travail, utiliser des registres de travail explicites ; les archives V5 restent des preuves de l’état livré.

## Contrôler les affectations narratives

```sh
python docs/standalone/production-v5/recipes/sync-narrative-registry.py \
  --all-reviewed-ledgers --dry-run
```

Cette commande lit les huit ledgers, les briefs et les fichiers du dépôt. Elle conserve les affectations déjà acceptées et contrôle les identités, versions, scènes, décors et dimensions. Avec `--dry-run`, elle ne modifie pas le registre TypeScript. Sans cette option, elle remplace seulement son bloc d’affectations validées, de façon atomique.

## Validation de la portabilité

Les deux copies ont été exécutées en lecture seule contre le dépôt de travail : le couple corrigé Vox ending a passé les vérifications d’empreinte et de pixels ; la synchronisation a trouvé 138 scènes déjà enregistrées, soit 127 personnelles et 11 globales, sans nouvelle affectation à ajouter. Aucune mutation du dépôt n’a été effectuée pour cette validation.

Les anciennes références de génération omises restent identifiées par leur nom, leur source et leur empreinte. Une référence d’entrée ayant servi à une retouche ne doit pas être remplacée silencieusement par le master final d’un contenu différent.
