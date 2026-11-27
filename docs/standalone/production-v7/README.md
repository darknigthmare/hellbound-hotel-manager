# Sources de production statique V7

La production statique V7 livre **45 dessins distincts** : 44 nouveaux dessins et 1 correction d’un dessin existant. Les fichiers livrables comprennent **45 masters PNG, 45 exports WebP sans perte et 3 miniatures**, soit **93 fichiers d’image** (80 143 856 octets). Chaque personnage, objet, machine, fond et élément de décor possède son fichier séparé. Aucun cycle animé n’est ajouté.

Le [rapport de livraison](../DELIVERY_STATIC_V7_2026-11-26.md) décrit les résultats et limites. Le [registre](delivery-register.json) est calculé depuis les fichiers présents, leurs empreintes et les [revues indépendantes](reviews-v7.json). Les anciennes livraisons V5/V6 ne sont pas réécrites.

## Reproduire la consolidation

Depuis la racine du dépôt, avec Node et les dépendances du projet :

```bash
node docs/standalone/production-v7/build-register.mjs
node docs/standalone/production-v7/sync-reserve-assets.mjs
node docs/standalone/production-v7/sync-extension-plan.mjs
node docs/standalone/production-v7/audit-runtime-coverage.mjs --sync-plan
npm run qa
node docs/standalone/production-v7/build-register.mjs --final
node docs/standalone/production-v7/build-delivery-docs.mjs
```

La validation finale exige validation.json au statut passed, tous les masters acceptés avec le même hash, aucune tentative de génération en attente, tous les exports intégrés et aucun chemin d’asset cassé. Les commandes de QA doivent être enregistrées par l’opérateur ; le script de consolidation ne fabrique pas un succès de test.

## Journaux et qualification

- hazbin-generation.json, helluva-generation.json, environment-generation.json et corrections-generation.json : prompts, résultats, refus, fichiers et limites.
- catalogue-audit.json : état initial immuable des 126 IDs sans base au commit de départ.
- hazbin-qualification.json, hazbin-qualification-extra.json et hazbin-variant-qualification.json : qualification primaire, ambiguïtés et corrections de continuité.
- helluva-qualification.json et helluva-reference-index.json : contrôles individuels, variantes et empreintes des références inspectées.
- environment-references.json et environment-audit.json : sources, reports individuels et distinction entre couverture visuelle et validation navigateur/mobile.
- image-file-qa.json, validation.json, active-asset-coverage.json et browser-qa.json : vérifications techniques et contrôles non exécutés.

## Classeur

build-bible-v7.mjs utilise @oai/artifact-tool, importe la bible V6, préserve ses 43 feuilles et ajoute trois vues V7. Les modes --prepare, --inspect-baseline et --final servent respectivement à préparer, inspecter la base et finaliser le classeur. Le runtime de documents doit exposer les dépendances via CODEX_PRIMARY_RUNTIME_NODE_MODULES. La recette rend les nouvelles feuilles, contrôle un recalcul puis réimporte l’export et compare les feuilles historiques. Les résultats sont archivés dans les fichiers de QA du classeur.

## Règles de comptage

Un master natif retenu compte comme un dessin. Son WebP sans perte et sa miniature sont des fichiers dérivés, pas des dessins supplémentaires. Les costumes, archives et machines n’augmentent pas les bases d’identité. Apple remplace l’image d’une entrée existante sans augmenter la galerie. Les trois fichiers du premier candidat du hall sont archivés hors des totaux livrables. La fidélité 1:1 et le rendu en navigateur ne sont pas certifiés par l’égalité PNG/WebP ou les tests unitaires.
