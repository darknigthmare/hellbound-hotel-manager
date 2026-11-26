# Production V12 — huit dessins statiques

Cette vague poursuit la V11 publiée dans la PR nº 8. Elle apporte **8 dessins acceptés**, soit **17 fichiers image et 12 046 957 octets** : huit masters PNG natifs, huit exports WebP lossless et une miniature d’arène. La parité des pixels RGBA est vérifiée pour chacun des huit exports. Les références et les images de diagnostic sont comptées séparément.

## Livraison

| Dessin | Usage | Source et limite principale |
|---|---|---|
| Gigi — Queen Bee | Base entière de soutien en réserve | Cellules officielles S1E8 à 560/620 s ; silhouette et pieds visibles, détails fins adaptés depuis une faible résolution. |
| Russ — Queen Bee | Base entière de soutien en réserve | Cellules officielles S1E8 à 460/560/620 s ; motif du tee-shirt non transcrit, marge haute faible mais silhouette entière. |
| Mammon — couloir des coulisses | Nouvelle arène S2 à un seul plan | Peinture de production Jasper Luu 207_SHOT_269 ; cadrage adapté au duel. |
| Mammon — caisse cubique | Accessoire de réserve | Vues de stockage 207_SHOT_242/245 ; aucun placement ajouté au couloir. |
| Mammon — caisse basse | Accessoire de réserve | Même zone de stockage ; prolongement des faces planes masquées consigné. |
| Blitzø — briquet fermé | Accessoire de réserve | Planche primaire complète d’Erin Frost ; apparition précise dans un épisode non confirmée. |
| Millie — couteau | Accessoire de réserve | Planche primaire complète d’Erin Frost ; apparition précise dans un épisode non confirmée. |
| Moxxie — fusil à lunette | Accessoire de réserve | Planche primaire complète d’Erin Frost ; motif musical conservé, bipied séparé exclu, marges horizontales réduites. |

Le **fusil de Blitzø** est exclu : la génération a été refusée, requête `2e209257-088e-48e3-b15c-47f716d0a09a`. Aucun master, aucun export et aucune nouvelle tentative pour cette cible. Les refus antérieurs restent préservés.

## Intégration

L’arène `mammon-backstage-corridor-s2` utilise le fond entier en mode contenu. Une configuration de décor vide active le plan de fond sans ajouter de meuble. Le mouvement de caméra, la sélection, la vignette et les combats de contrôle utilisent les mécanismes existants. Le couloir reste distinct de `mammon-show`.

Les sept autres dessins apparaissent dans la galerie. Gigi et Russ sont des **bases statiques de soutien en réserve** ; aucun nouveau kit jouable ou cycle animé n’est livré. Les cinq accessoires sont également en réserve.

Les trois accessoires issus des planches d’Erin Frost portent la continuité `production_model_undated`, un badge « Planche de production » et une note indiquant que l’épisode reste à confirmer. Leur portée de filtre `season_2` constitue un plafond conservateur ; elle ne date pas le modèle et ne l’attribue pas à la saison 2. L’échantillonnage de S1E1 est documenté comme un contrôle non concluant, pas comme une référence de génération ou une preuve d’absence de l’épisode.

## Comptes et historique

| Indicateur | Après V11 | Après V12 |
|---|---:|---:|
| Bases entières | 112 | **114** |
| Bases actives / en réserve | 40 / 72 | **40 / 74** |
| IDs sans base entière | 97 | **95** |
| Identités distinctes sans base entière | 96 | **94** |
| Fiches de galerie | 121 | **128** |
| Arènes | 46 | **47** |
| Kits jouables | 43 | **43** |
| Familles de costumes | 24 | **24** |

Les 121 anciennes fiches de galerie restent identiques. Les anciennes descriptions V7 de Gigi et Russ, qui désignaient d’autres figurants, sont conservées en historique avec leur correction V12. Le filtre des lacunes compare désormais le champ `id` des objets : les anciennes lacunes déjà résolues sont archivées avec leurs preuves au lieu de rester actives.

## Vérifications

- **Art** : huit masters, sources primaires et composites contrôlés par une revue indépendante ; aucune fidélité canonique 1:1 certifiée.
- **Ressources** : 717 chemins actifs, aucune référence cassée.
- **Technique** : 413 tests dans 47 suites ; typage, lint, builds manager et standalone réussis ; 1 321 empreintes de fichiers de la distribution autonome vérifiées.
- **Stabilité** : 189 fichiers d’entrée inchangés pendant la vérification technique.
- **Navigateur** : 171 contrôles automatisés réussis sur ordinateur 1440 × 1000 et mobile tactile émulé 390 × 844 ; huit dessins observés dans les deux formats, deux combats d’entraînement, 54 captures. Les 54 captures ont toutes été relues individuellement ; les 184 empreintes runtime restent inchangées.
- **Classeur** : 56 feuilles et 65 tableaux ; 54 feuilles et 63 tableaux historiques préservés octet pour octet, six formules recalculées et dix plages rendues inspectées. Les nouveaux onglets sont « Production V12 » et « Cibles V12 ». Le fichier final de 656 556 octets est publié dans le même fichier Drive et son téléchargement brut est identique à l’export local.

La première tentative technique s’est arrêtée au lint car le nouveau harnais CommonJS n’était pas encore dans la portée Node/navigateur existante. La configuration V12 a été ajoutée avec les mêmes règles que V10/V11 et une variable inutilisée a été retirée. La seconde passe complète a réussi ; les preuves de la première tentative restent dans `validation-history/`.

## Documents de preuve

- [Registre de livraison](delivery-register.json)
- [Revue artistique indépendante](independent-visual-review.json)
- [Audit des ressources actives](active-asset-coverage.json)
- [QA technique](runtime-qa.json)
- [Rapport navigateur et revue des 54 captures](browser-qa.json)
- [Placement du décor](runtime-placement.json)
- [Historique de validation](validation-history.json)
- [Bible V12](../INFERNAL_VERSUS_BIBLE_V12.xlsx)
- [QA du classeur](workbook-qa.json)
- [Publication Drive vérifiée](drive-publication.json)
- [Qualification des personnages](characters-references.json)
- [Qualification des accessoires de production](root-props-episode-corroboration.json)
- [Plan global de production](../extension-plan.json)

Les handoffs décrivent l’état avant intégration. Le registre final et les rapports de QA sont les preuves de l’état livré. Les limites des références, les refus et les éléments encore incomplets restent distincts des dessins acceptés.

## Accès à la bible et à la PR

- [Bible — même fichier Drive](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit)
- [Suivi de publication et contrôles CI dans la PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8)

SHA-256 du classeur : `f3a454dd6e87171336c6741997bb81ac5d9d96d544127d381b4aef60c693e2bd`. Le classeur a été contrôlé par rendu, recalcul et inspection OOXML ; aucune ouverture dans Excel natif n’est revendiquée.

Une erreur de classification dans la première synthèse navigateur comptait le décor comme une huitième fiche de galerie. Le finaliseur utilise désormais l’appartenance réelle au catalogue : sept fiches et un fond. Les 171 contrôles bruts, les captures et les fichiers runtime n’ont pas changé ; le registre et le classeur final reprennent la synthèse corrigée.
