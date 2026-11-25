# Production statique V6 — 25 novembre 2026

Ce dossier décrit la reprise de la PR nº 8 depuis `8d34176aa08dbd566230e5a4742487d64d731cd9`. Le [registre de livraison](delivery-register.json) est l’état courant ; l’[audit de qualification](qualification-audit.json) est volontairement le relevé **antérieur** à la production.

## Livraison et intégration

Le lot contient **9 dessins sélectionnés**, soit **9 masters PNG, 9 exports WebP sans perte et 2 miniatures**. Les six nouvelles bases Helluva et la machine D.H.O.R.K.S. sont enregistrées dans la galerie de réserve. Les deux nouveaux décors sont sélectionnables dans le standalone : `hellaverse-training` et `vox-office-s2`. Aucun kit jouable ou cycle d’animation n’est créé.

Les retouches d’Apple, de Milky et du bureau de Vox remplacent les premières sorties. Elles ne doublent ni les dessins ni les fichiers livrés. Les empreintes des versions initiales et les prompts de correction restent dans les journaux ; les fichiers intermédiaires ne sont pas des livrables du dépôt.

| Fichier | Fonction |
| --- | --- |
| [delivery-register.json](delivery-register.json) | Registre final, comptes, chemins, empreintes et périmètre intégré |
| [qualification-audit.json](qualification-audit.json) | État initial : 77 bases et 132 IDs sans base, alias et cibles |
| [references.json](references.json) | Recherche initiale, provenance et limites des références |
| [references-supplement.json](references-supplement.json) | Bureau de Vox, toit et trois objets techniques encore différés |
| [helluva-generation.json](helluva-generation.json) | Six créations, deux retouches, prompts, alpha, pixels et SHA |
| [root-generation.json](root-generation.json) | Machine, décors, correction du bureau et cinq refus sans fichier |
| [root-image-qa.json](root-image-qa.json) | Empreintes et égalité PNG/WebP de la machine et des deux décors |
| [independent-visual-review.md](independent-visual-review.md) | Revue comparative lisible, réserves et corrections |
| [independent-visual-review.json](independent-visual-review.json) | Versions comparées, SHA des images inspectées et conclusions détaillées |
| [active-asset-coverage.json](active-asset-coverage.json) | Chemins utilisés par les personnages, arènes, effets, récits V3 et galerie |
| [validation.json](validation.json) | Exécution réelle de la QA, tentatives et limites |
| [browser-qa.json](browser-qa.json) | Contrôle navigateur non exécuté, avec raison du blocage |
| [workbook-qa.json](workbook-qa.json) | Formules, réimport, rendus et contrôle du classeur V6 |
| [workbook-package-report.json](workbook-package-report.json) | Empreintes des 40 feuilles historiques préservées |

## Reconstruction du suivi

Depuis la racine du dépôt, après restauration des fichiers d’image sélectionnés :

```bash
node docs/standalone/production-v6/sync-reserve-assets.mjs
node docs/standalone/production-v6/audit-runtime-coverage.mjs --sync-plan
npm run qa
node docs/standalone/production-v6/build-register.mjs --final
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v6/build-bible-v6.mjs --final
```

`npm run qa` exécute TypeScript, ESLint, Vitest, le build manager, le build standalone puis la vérification de ses empreintes. Le résultat conservé dans `validation.json` doit correspondre à l’exécution réellement observée. Le constructeur de registre vérifie les fichiers sélectionnés et refuse une génération ou une revue encore en cours ; il ne fabrique aucune image.

Le constructeur de bible utilise `@oai/artifact-tool` du runtime documentaire principal. Il conserve les 40 feuilles V5 puis ajoute **Production V6**, **Cibles V6** et **Repères V6**. Le conditionnement OOXML est assuré par `../append-production-workbook.py`, avec un contrôle de préservation des feuilles antérieures. Les rendus et classeurs intermédiaires vont dans le répertoire de travail temporaire ; le classeur final est `../INFERNAL_VERSUS_BIBLE_V6.xlsx`.

## Limites du lot

La fidélité 1:1 n’est pas certifiée. Le motif du mollet d’Apple reste différent ; Josh, Coco et Kiki conservent des écarts de détail. Le décor d’entraînement est original AU. Le bureau de Vox est un intérieur S2 adapté au combat, sans façade de tour. La machine-portail est un élément statique de galerie.

KeeKee, Razzle, Dazzle, Fat Nuggets et Frank n’ont fourni aucun fichier après refus du générateur ; ils ne sont pas comptés comme produits et n’ont pas été relancés. Les deux refus narratifs historiques ne sont pas relancés non plus. Les cibles Vikki, Gigi, Russ, le toit du final S1, l’aéronef du pilote, la flèche C.H.E.R.U.B. et le shuriken D.H.O.R.K.S. restent documentés comme incomplets en références.

Les aperçus d’épisodes sont identifiés avec leur résolution native et leurs horodatages approximatifs. Une planche de production réhébergée et une photo de carte ne sont jamais présentées comme un visionnage intégral des épisodes ou comme des fichiers de production HD officiels. Les références téléchargées ne sont pas incorporées aux images livrées.
