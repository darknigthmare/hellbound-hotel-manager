# Production statique V8

Le processus V8 réutilise les registres et l’assembleur de classeur existants. Il attend un `delivery-register.json` contenant des livraisons réelles. Aucun registre de livraison ni dessin ne sont fabriqués par les scripts de documentation.

## Préparer et vérifier

`reconcile-existing-variants.mjs` vérifie les fichiers de neuf exigences de costumes dont le statut « À produire » est devenu obsolète. Il confronte les preuves V5/V7 au registre actif et crée uniquement `existing-variant-reconciliation.json`. Ce rapprochement ne produit aucun nouveau dessin.

```bash
node docs/standalone/production-v8/reconcile-existing-variants.mjs
node docs/standalone/production-v8/build-bible-v8.mjs --validate
node docs/standalone/production-v8/sync-extension-plan.mjs
```

La dernière commande écrit un aperçu du plan. Seul `--apply` remplace `docs/standalone/extension-plan.json`, après lecture du registre courant. Les données anciennes modifiées sont retenues sous `coverageBeforeStaticV8`. Les incarnations déjà livrées restent reliées à leur ancien registre et ne sont pas recomptées dans V8.

Le registre V8 reprend les champs de V7 : `edition`, `date`, `status`, `baseline`, `cumulativeCounts`, `counts`, `assets`, `candidateStates`, `variantStates`, `remaining`, `qa` et `sourceFiles`. Les chemins d’image et les SHA-256 sont obligatoires pour les éléments livrés. `baseline` doit correspondre aux comptes cumulés du registre V7.

Chaque asset de catégorie `costume` qui n’est pas déjà rattaché par `variantStates` crée sa propre fiche `VAR-V8-<asset.id>`. Le module partagé `variant-requirements.mjs` fournit les mêmes fiches au plan et au classeur. Les champs `sourceIdentityId`, `name`, `franchise`, `continuity`, `referenceUrls` et `eligibility` sont requis. `eligibility` vaut `wearable` ou `galleryOnly` ; `gameplayEligibility` est accepté comme alias, puis `runtimeSelectable` comme indicateur explicite de secours. Une liste `newVariantRequirements` peut préciser les champs d’une fiche en indiquant son `assetId`.

Ces fiches gardent le statut **Partiel** et ne remplacent jamais la base du personnage. Les humains Vox et Alastor sont des incarnations documentées distinctes, sans nouvelle identité ; Emily peut rester limitée à la galerie. La fiche agrégée VAR-017 de Blitzø pointe les déguisements détaillés, sans ajouter une livraison ni un dessin aux comptes.

Pour associer des décors nouveaux à une exigence existante, renseigner explicitement `stageReconciliation` avec `planId`, `assetIds`, `runtimeStageIds`, `currentStaticCoverage` et `referenceUrls`. Le script ne déduit pas ces associations depuis la ressemblance des noms. `runtimeSummary`, lorsqu’il est fourni, doit venir de l’audit du code courant.

Deux lieux documentés peuvent créer une nouvelle exigence via cette même liste. Leur `runtimeStageIds` doit contenir uniquement le nouvel ID indiqué, leur fond doit être livré et accepté, et la référence de production doit être présente. Aucun ajout n’est fait en l’absence de cette association explicite dans le registre.

| Nouvel ID de plan et de runtime | Fond requis | Référence primaire |
| --- | --- | --- |
| `ozzies-exterior-s1` | `ozzies-exterior-s1-room` | `https://backgroundart.net/art/helluva07.jpg` |
| `hellhound-adoption-s2` | `hellhound-adoption-s2-room` | `https://backgroundart.net/art/helluva03.jpg` |

L’extérieur d’Ozzie’s est distinct de l’exigence historique `ozzies` et de son arène intérieure `ozzies-cabaret`. Les exigences de décor ajoutées gardent le statut **Partiel** pour rendre visibles les contrôles de jeu et limites de fidélité restants. Les neuf rapprochements de costumes historiques figurent aussi dans **Cibles V8**, sans augmenter les comptes de dessins.

## Classeur

Lire puis examiner le rendu de la bible V7 avant toute génération V8. Le runtime de documents fournit `CODEX_PRIMARY_RUNTIME_NODE`, `CODEX_PRIMARY_RUNTIME_NODE_MODULES` et `CODEX_PRIMARY_RUNTIME_PYTHON`.

```bash
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v8/build-bible-v8.mjs --inspect-baseline
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v8/build-bible-v8.mjs --prepare
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v8/build-bible-v8.mjs --final
```

`--register`, `--repo`, `--work-dir` et `--output-dir` acceptent des chemins explicites. Le répertoire de travail reste temporaire et extérieur au dépôt. Le mode final exige le statut `final_production_register`, vérifie les empreintes des images et des sources puis réutilise `append-production-workbook.py`.

Le classeur final ajoute **Production V8** et **Cibles V8** aux **46 feuilles V7**, sans réécrire les anciennes feuilles ni leurs tableaux. Les deux nouvelles vues résument les livraisons et leurs références, puis les qualifications et manques transmis par le registre. Les contrôles vérifient les comptes, un changement d’entrée suivi d’un recalcul et d’une restauration, l’export/réimport et la conservation des composants historiques. Les PNG de revue restent dans le répertoire temporaire.

La réussite du script signifie que les contrôles programmés sont passés. La revue visuelle de ses rendus doit encore être effectuée et enregistrée dans `workbook-qa.json`. Aucun succès de tests du jeu, comparaison canonique ni contrôle navigateur n’est inventé par ce processus.

## Portée du rapprochement de costumes

Les neuf exigences sont VAR-003, VAR-018, VAR-019, VAR-021, VAR-025, VAR-026, VAR-030, VAR-032 et VAR-033. Huit familles sont sélectionnables et une reste en galerie de réserve. Leur couverture reste **Partiel** : une image statique ou six poses clés ne couvrent pas les transitions, animations et mécaniques éventuellement demandées par la fiche.
