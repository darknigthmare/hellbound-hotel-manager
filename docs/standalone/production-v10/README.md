# Production statique V10 — 26 novembre 2026

La V10 poursuit la production sur la branche `feat/infernal-versus-assets-20261124`, dans la PR nº 8. Elle ajoute **11 dessins distincts**, chacun dans un master PNG natif et un WebP sans perte, ainsi que deux miniatures d’arène : **24 fichiers d’image, 19 950 095 octets**. Les références de production sont archivées séparément et ne sont pas comptées comme dessins livrés.

## Contenu

| Usage | Dessins | Résultat |
| --- | ---: | --- |
| Bases autonomes de réserve | 3 | Melissa en tenue de mannequin S1 ; Loo Loo en mascotte S1 ; Crymini selon le modèle historique de 2017 |
| Costumes statiques sélectionnables | 3 | Loona dans Queen Bee ; Moxxie dans l’hallucination de Truth Seekers ; Charlie transformée pendant le combat final S1 |
| Fonds d’arène | 2 | Chambre d’Asmodeus dans Oops ; Noël imaginé par Blitzø dans Sinsmas |
| Objets séparés intégrés aux décors | 3 | Console et candélabre d’Asmodeus ; boule à neige au sapin de la vision de Noël |

Les trois nouvelles bases couvrent trois identifiants de catalogue déjà existants. Le cumul atteint **112 bases autonomes**, dont 40 actives et 72 en réserve. **97 identifiants**, soit **96 identités distinctes après l’alias connu**, restent sans base autonome. Le jeu conserve 43 kits, avec 24 familles de costumes, 45 arènes et 115 entrées de galerie. Les 127/129 illustrations personnelles et 11 illustrations globales sont inchangées.

## Références et décisions artistiques

Les cellules de vidéos officielles sont souvent limitées à 320 × 180 pixels. Elles qualifient une incarnation et une silhouette ; elles ne certifient pas tous les petits détails redessinés. Les pins officiels de Loona et Moxxie complètent seulement le haut du costume. Les bas du corps reposent sur des plans entiers des vidéos. Melissa possède une première base complète dans la tenue de mannequin observée ; cette livraison ne valide pas la tenue différente de son ancien portrait partiel.

Crymini est explicitement marquée `legacy_concept_2017`. Sa source primaire est le dessin de conception publié par Vivziepop en 2017. Le plafond de filtre `season_1` permet son accès sans spoilers récents ; il ne constitue pas une attribution à la saison 1. La galerie affiche ce statut historique sur sa carte et dans sa fiche.

Les deux intérieurs s’appuient sur le portfolio de l’artiste de décors Jasper Luu, recoupé avec les vidéos officielles. Le décor de Sinsmas représente une vision familiale de Blitzø. Les objets sont positionnés dans le cadre du fond et conservent le même déplacement de caméra, avec une mise à l’échelle uniforme. La console emploie une perspective adaptée au jeu ; les détails internes de la boule à neige reposent sur une petite référence.

Trois candidats ont été corrigés avec le générateur avant acceptation : doublure de Moxxie, bras transformé de Charlie et nez ajouté à Loo Loo. Ils ne créent pas trois dessins supplémentaires. Aucun refus historique n’a été relancé. Aucun nouveau refus du générateur n’est enregistré dans ce lot. **La fidélité 1:1 n’est pas certifiée.**

## Sources de preuve

- [Registre de livraison](delivery-register.json) : comptes, fichiers, empreintes, usages, incarnations, cibles restantes et état de validation.
- [Revue indépendante des onze masters](independent-review-root.json) : décisions reliées aux SHA-256 exacts.
- [Costumes : génération](root-generation.json), [contrôle PNG/WebP](root-image-qa.json) et [revue](costumes-independent-review.json).
- [Personnages : livraison](characters-handoff.json), [sources](characters-reference-audit.json), [contrôle des images](characters-qa.json), [prompts](characters-prompts.json) et [revue](characters-independent-review.json).
- [Environnements : livraison](environment-handoff.json), [sources](environment-references.json), [contrôle des images](environment-qa.json) et [revue](environment-independent-review.json).
- [Placement des objets](runtime-placement.json) et [couverture des fichiers actifs](active-asset-coverage.json).
- [Validation technique](runtime-qa.json), [journal](qa-runtime.log) et [validation navigateur](browser-qa.json).
- [Classeur](../INFERNAL_VERSUS_BIBLE_V10.xlsx), [contrôle du classeur](workbook-qa.json) et [préservation OOXML](workbook-package-report.json). Le remplacement Drive est suivi dans la dernière livraison finalisée ; aucune mise à jour Drive V10 intermédiaire n’est revendiquée.
- [Historique des validations](validation-history.json), [passage navigateur complet](browser-harness/browser-qa-run.json) et [complément sur les liens officiels](browser-harness/source-links-run.json).

Les masters se trouvent dans `production/v10/`, les exports utilisables par le jeu dans `public/assets/production/v10/`. Les candidats remplacés sont documentés dans les registres de génération et exclus des dossiers de masters acceptés.

## Reconstruction et vérification

Depuis la racine du dépôt :

```bash
python docs/standalone/production-v10/assemble-register.py --check-inputs
python docs/standalone/production-v10/assemble-register.py --integrate
node docs/standalone/production-v10/audit-runtime-coverage.mjs
NODE_OPTIONS=--max-old-space-size=512 node docs/standalone/production-v10/verify-runtime.mjs
```

Le vérificateur lance les commandes de contrôle du projet, puis les builds Vite ordinaires avec `copyPublicDir: false`. Il assemble les assets publics par liens physiques pour éviter deux copies supplémentaires des mêmes images, puis exécute la finalisation et le contrôle d’intégrité standalone. Cette procédure locale n’est pas présentée comme l’exécution de la commande unique `npm run qa`.

La validation navigateur a été exécutée sur les fichiers runtime figés : 352 contrôles, onze assets couverts, 68 captures conservées dont 51 inspectées sur ordinateur et mobile émulé. Le registre final refuse une couverture absente ou des empreintes modifiées après contrôle. Le [harness principal](browser-harness/run-browser-qa.cjs) et le [contrôle ciblé](browser-harness/check-source-links.cjs) documentent les conditions de cette recette. Les scripts conservent leurs chemins de session dans les preuves ; adapter les chemins de travail, du navigateur et de Playwright pour une nouvelle exécution.

Les validations locales passent 413 tests dans 47 suites, TypeScript, ESLint et les deux builds. Les 1 310 empreintes du package observé incluent aussi des exports V11 présents en préparation, sans raccordement au catalogue actif V10. Une correction tactile préserve le relâchement après un clic de détail zéro ; son test maintient aussi le comportement des activations sans pointeur.

```bash
python docs/standalone/production-v10/assemble-register.py --final
node docs/standalone/production-v10/build-bible-v10.mjs --final
python docs/standalone/production-v10/assemble-register.py --workbook-metadata
```

Le classeur ajoute deux onglets à la bible V9. Son assemblage conserve les XML des feuilles, tableaux et relations historiques ; les résultats de cette comparaison sont consignés dans le rapport de packaging. Les vues rendues doivent être relues avant validation du classeur.

## Limites de cette livraison

Chaque nouveau costume utilise une seule pose statique pendant les actions du kit existant. Les bases de réserve sont consultables en galerie ; elles ne créent pas de kits. Les trois objets de décor n’ajoutent pas de collision ou de mécanique. Les scènes de combat sont des adaptations AU des lieux référencés. Les deux exigences historiques de Charlie pointent vers le même dessin et restent partiellement couvertes : elles ne sont pas comptées comme deux variantes complètes.

Les dessins manquants, les références insuffisantes et les refus historiques restent listés avec leurs états individuels dans le registre. Aucun nouveau cycle d’animation n’est livré.
