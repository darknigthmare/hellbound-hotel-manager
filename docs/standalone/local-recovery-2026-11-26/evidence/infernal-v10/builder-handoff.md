# Préparation de la Bible V10

Le builder est préparé dans `/tmp/infernal-v10/build-bible-v10.mjs`. Aucun registre ni classeur V10 de livraison n’a été fabriqué à ce stade.

## Reprise vérifiée

- PR 8 ouverte, tête distante `241d43ad6b95c7a10fe05155f35c0990c165b771`.
- Local V9 `29b21d219c435225638fc47a5cd7959b6c1c8586` ; arbre local et distant identique `7e21f39032470c4bed35ac043f9bbc02ed468542`.
- Base et branche par défaut `master`, tête `0c63b5635d05c9ed9b42e5e2fc58359f60d25a67`.
- Comparaison distante : 18 commits d’avance, aucun retard, merge-base égal à master. L’historique local est partiel et ne suffit pas à contrôler l’ascendance.
- La future publication partira du parent distant V9 et du diff local depuis le commit V9 équivalent. Une nouvelle lecture distante sera faite juste avant publication.

## Historique du classeur

La Bible V9 comporte 50 feuilles et 59 tableaux. Son SHA-256 est `305f4e152e252128d29551059de0b2ce240b1d1ef7f84ea15cc4be22e80d1798`.

Le builder ajoutera `Production V10` et `Cibles V10`, chacune avec un tableau. Le résultat attendu est de 52 feuilles et 61 tableaux. Le packer existant conserve les anciennes feuilles, leurs relations et tableaux octet pour octet. Le builder vérifie le hash V9 avant chaque exécution et les contrôles de préservation à l’assemblage final.

Le relevé des 158 parties historiques de feuilles, relations et tableaux se trouve dans `baseline-workbook-audit.json`. Le rendu de référence V9 a été inspecté dans `workbook/baseline-production-v9.png`.

## Contrat du registre V10

Conserver la structure du registre V9, avec `edition: "V10"`, `baselineCommit` égal au commit distant V9 ci-dessus et `equivalentLocalBaselineCommit` égal au commit local V9. `baseline` reprend exactement les `cumulativeCounts` V9.

Les assets doivent être réellement acceptés, référencés et exportés sans perte. Le builder vérifie les hashes des masters, exports, miniatures et fichiers sources. Il n’introduit ni asset de démonstration, ni nombre de dessins attendu.

Chaque asset déclare `addsStandaloneBase` explicitement. Un `true` exige une catégorie `character_base`, `support_base` ou `enemy_base`, un cadrage `full_body` et un `sourceIdentityId` non vide et unique dans les nouvelles bases. Un buste, un costume, une incarnation supplémentaire ou une révision ne ferme pas une lacune de base complète. La revue de production reste responsable de vérifier qu’il s’agit bien de la première base de cette identité.

Le total des bases augmente du nombre de ces flags valides. Le nombre d’identités distinctes sans base est réconcilié avec ce delta et un éventuel changement du nombre d’identités du catalogue. Les bases actives et en réserve doivent se réconcilier avec le total. Les autres cumuls viennent du registre courant ; aucune hypothèse de quantité V10 n’est codée dans le builder.

## Exécution future

Le builder utilise `CODEX_PRIMARY_RUNTIME_NODE` et Artifact Tool. Il conserve les modes `--inspect-baseline`, `--validate`, `--prepare` et `--final` du builder V9.

Après disponibilité du vrai registre :

```bash
"$CODEX_PRIMARY_RUNTIME_NODE" /tmp/infernal-v10/build-bible-v10.mjs --validate --repo /workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager --register /workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager/docs/standalone/production-v10/delivery-register.json
```

Le mode `--prepare` calcule les deux nouvelles feuilles, teste les changements d’entrée, exporte et réimporte les ajouts, puis produit les rendus sous `/tmp/infernal-v10/workbook`. La vérification visuelle des nouveaux rendus reste à effectuer avec les données réelles.

Installer ensuite ce même builder dans `docs/standalone/production-v10/` avant son exécution finale autorisée, afin que les rapports finaux soient écrits à côté du registre. Le mode `--final` exige `final_production_register`, assemble la Bible, vérifie les parties historiques, puis copie le classeur final dans le dépôt. Aucun mode final n’a été lancé durant cette préparation.

## Vérifications déjà exécutées

- Syntaxe du builder avec le runtime Node principal.
- Import, inspection et rendu de la vraie feuille `Production V9` avec Artifact Tool.
- Lecture OOXML des comptes et empreintes de la Bible V9.
- Comparaison distante des commits et arbres, sans modification de branche.

Les nouvelles formules, les livraisons V10, les nouveaux rendus et l’assemblage final seront vérifiés lorsque les assets et le registre réels seront prêts. Aucune recalculation native Excel n’est revendiquée.
