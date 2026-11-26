# Production statique V11 — 26 novembre 2026

La V11 prolonge la V10 dans la [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8). Elle livre **7 dessins distincts**, chacun conservé en PNG natif et exporté en WebP sans perte, avec une miniature d’arène : **15 fichiers d’image, 14 006 984 octets**. Les références et les composites de contrôle sont conservés séparément de ce décompte.

## Contenu et usages

| Dessin | Dimensions du master | Usage |
| --- | --- | --- |
| Molly — modèle historique 2015 | 1312 × 1199 | Portrait partiel de galerie, daté explicitement |
| Mister Butler — The Circus | 1182 × 1331 | Portrait partiel du grand majordome moustachu |
| Better Than Blitzo Guy — Apology Tour | 1536 × 1024 | Portrait partiel de galerie |
| Salle de consultation de Sloth — Western Energy | 1672 × 941 | Nouvelle arène sélectionnable et miniature 480 × 270 |
| Conteneur de la salle de consultation | 1317 × 1194 | Élément transparent séparé du plan intermédiaire |
| BOZO AWARD — vitrine d’Oops | 1024 × 1536 | Accessoire de réserve en galerie |
| Trophée au masque de clown — vitrine d’Oops | 963 × 1633 | Second accessoire distinct de réserve en galerie |

Le catalogue compte désormais **46 arènes et 121 entrées de galerie**. Les trois portraits ne complètent aucune base entière : le cumul reste à **112 bases autonomes**, dont 40 actives et 72 en réserve. **97 identifiants**, soit **96 identités distinctes après l’alias connu**, restent sans base entière. Les 43 kits, 24 familles de costumes, 127/129 illustrations personnelles et 11/11 illustrations globales restent au même niveau que la V10.

## Sources et limites artistiques

Molly provient du dessin historique publié par Vivziepop en 2015. Le champ `legacy_concept_2015` produit un libellé historique daté sur la carte et la fiche ; il ne désigne pas le modèle angélique de la série actuelle. Le plafond de filtre `season_1` autorise simplement l’accès à ce dessin historique. Crymini conserve séparément son année 2017. Le composant de galerie affiche maintenant l’année associée à chaque conception historique.

Les portraits de Mister Butler et de Better Than Blitzo Guy reposent sur des vues partielles des vidéos officielles. Le cadrage s’arrête aux portions visibles, sans ajouter un bas de corps absent des références. Les prévisualisations natives de 320 × 180 pixels qualifient la silhouette et l’incarnation ; elles ne permettent pas de certifier les détails fins à l’identique. Le portrait de Better Than Blitzo Guy a été corrigé avant acceptation pour terminer proprement le contour inférieur. Le premier candidat reste un diagnostic historique.

Le grand Mister Butler de *The Circus* est distinct du petit majordome de la famille de Stolas. Une tentative de correction de ce dernier a été refusée par le générateur. Ce refus est inscrit au registre et la cible n’a pas été relancée ; aucun fichier correspondant n’est compté parmi les sept dessins retenus.

La salle de consultation et les objets reposent sur le portfolio professionnel de Jasper Luu. La salle est recoupée avec *Western Energy*, S2E4 ; elle est distincte de la salle d’attente déjà présente au jeu. Le conteneur est placé près du meuble de droite, dans le même cadre et avec le même mouvement de caméra que le fond. Sa mise à l’échelle est uniforme. Les seringues et leurs espacements sont redessinés ; leur décompte exact n’est pas certifié.

Les deux trophées sont deux objets différents d’une même vitrine. Le BOZO AWARD correspond à l’objet de droite ; le trophée au masque de clown correspond à l’objet central. Ce dernier nom est descriptif et n’attribue pas de cérémonie inventée. Leurs contours sont complets malgré des marges inférieures à la consigne initiale de 8 %. La référence vidéo d’Oops établit le contexte de la pièce ; le détail des trophées repose sur le portfolio, sans prétendre que le minutage vidéo montre leur gros plan.

Les sept WebP principaux restituent exactement les pixels RGBA de leurs PNG natifs. Cette égalité de conversion ne certifie pas une fidélité artistique 1:1 aux références. Aucun nouveau cycle d’animation, costume ou kit jouable n’est créé en V11. Les deux trophées sont consultables en galerie ; ils ne sont pas affectés arbitrairement à une arène.

## Preuves de production

- [Registre de livraison](delivery-register.json), [raccordement du catalogue et du plan](catalogue-plan-qa.json), [refus de génération](refused-attempts.json).
- Personnages : [livraison](characters-handoff.json), [prompts](characters-prompts.json), [contrôle des images](characters-image-qa.json).
- Environnement retrouvé : [livraison et références](environment-handoff.json), [contrôle des images](environment-image-qa.json), [prompts](root-prompts.json).
- [Trophée supplémentaire : génération, références et revue finale](continuation-environment-handoff.json).
- [Revue indépendante des six premiers dessins](independent-visual-review.json) ; les empreintes des versions examinées sont conservées. Le septième dessin possède sa revue dans son propre fichier de livraison.
- [Références de décors](../../../production/v11/environment/references/sources.json), masters sous `production/v11/` et exports sous `public/assets/production/v11/`.
- [Placement du conteneur](runtime-placement.json), [couverture des fichiers actifs](active-asset-coverage.json), [validation technique](runtime-qa.json), [journal technique](qa-runtime.log).

<!-- V11_VALIDATION_START -->
## État des validations

Les validations techniques passent **413 tests dans 47 suites**, TypeScript, ESLint et les deux builds. Le contrôle des références actives vérifie **708 chemins sans fichier manquant** ; le package standalone passe le contrôle de **1 312 empreintes**. Les 180 empreintes suivies par le gate technique correspondent au runtime livré. Les avertissements Vite sur la taille des chunks restent visibles dans le journal ; aucun budget de performance exhaustif n’est certifié.

La [recette navigateur finale](browser-qa.json) passe **170 contrôles sur 170** pour les sept dessins, sur ordinateur 1440 × 1000 et mobile tactile émulé 390 × 844. Elle couvre deux combats, le déplacement et le retour au repos, six fiches de galerie, douze groupes de liens de référence, les trois mentions Buste et les années historiques distinctes de Molly et Crymini. Les **48 captures finales ont été inspectées**, dont cinq également rouvertes en résolution native. Aucune image manquante, erreur réseau, exception JavaScript, erreur console ou débordement horizontal n’a été observé dans ces parcours. Les 175 empreintes du périmètre navigateur sont inchangées.

Le [résultat brut](browser-harness/final-browser-qa-run.json), la [revue visuelle](browser-harness/visual-review.json), les [essais antérieurs](browser-qa-history.json) et l’[historique de validation](validation-history.json) sont conservés. Les deux premiers essais ont révélé des erreurs de recette : un sélecteur de libellé trop strict, puis une attente incorrecte concernant le filtre des arènes. Le filtre S1/S2 s’applique aux fiches, au roster et aux costumes ; les arènes conservent leur réglage S3 distinct. Aucun changement runtime n’a été nécessaire entre ces essais. Les trois scripts CJS archivés passent aussi la vérification de syntaxe et ESLint ciblé.

Sur mobile, le fond reste entièrement contenu et laisse une bande unie supérieure ; sur ordinateur, il conserve des marges unies latérales. Les liens de référence affichés sont vérifiés, mais leurs destinations externes n’ont pas été ouvertes par cette recette. La couverture concerne Chromium local et une émulation mobile ; elle ne constitue pas un essai sur appareil physique ou une validation exhaustive de tous les modes.

La [Bible V11](../INFERNAL_VERSUS_BIBLE_V11.xlsx) contient **54 feuilles et 63 tableaux**, pour **638 528 octets**. Elle ajoute Production V11 et Cibles V11. La comparaison des parties OOXML conserve exactement **52 feuilles, 51 relations et 61 tableaux V10** ; les styles et chaînes partagées historiques sont préservés. Les neuf vues rendues ont été relues, sans description coupée. Six nouvelles formules ont été contrôlées par recalcul, modification puis restauration des entrées et réimport ; aucune erreur de formule n’est relevée. Excel natif n’a pas été exécuté. Voir la [QA du classeur](workbook-qa.json), la [revue OOXML](workbook-ooxml-review.json), le [rapport de packaging](workbook-package-report.json), la [revue visuelle](workbook-visual-review.json) et les [tentatives d’export](workbook-attempts.json).

Le [même fichier Drive](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true) a été remplacé directement de V9 à V11, au même identifiant et dans le même dossier. Le téléchargement complet après mise à jour correspond octet par octet au classeur local ; son SHA-256 est `c5ce2434fe38ceeb9d627d0ce511573bc4e7a2b7c7da8db0928e044b912612c0`. La [preuve Drive](drive-publication.json) conserve les métadonnées relues et le résultat de cette comparaison.
<!-- V11_VALIDATION_END -->

## Reconstruction

Depuis la racine du dépôt :

```bash
python docs/standalone/production-v11/assemble-register.py --check-inputs
python docs/standalone/production-v11/assemble-register.py --integrate
node docs/standalone/production-v11/audit-runtime-coverage.mjs
NODE_OPTIONS=--max-old-space-size=512 node docs/standalone/production-v11/verify-runtime.mjs
```

L’intégration est idempotente et conserve les 115 fiches historiques. Les gates techniques utilisent les commandes du projet, puis les configurations Vite habituelles avec `copyPublicDir: false`. Les fichiers publics sont assemblés par liens physiques pour limiter la duplication locale, puis la distribution est finalisée et ses empreintes sont vérifiées. Cette procédure n’est pas présentée comme l’exécution locale de la commande unique `npm run qa`.

La [recette navigateur](browser-harness/recipe.json), le [harness](browser-harness/run-browser-qa.cjs) et le [finaliseur](browser-harness/finalize-browser-qa.py) décrivent le parcours à exécuter sur le runtime figé. Adapter leurs chemins de session, de Chromium et de Playwright avant une nouvelle exécution. La navigation utilise les contrôles de l’interface, puis les entrées de combat au clavier ou au pointeur.

Après validation des rapports techniques et navigateur :

```bash
python docs/standalone/production-v11/assemble-register.py --final
NODE_OPTIONS=--max-old-space-size=1024 "$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v11/build-bible-v11.mjs --final
```

Le builder dépend du runtime de feuilles de calcul fourni par l’environnement. Après chaque export, inspecter les vues rendues et consigner la revue dans `workbook-qa.json` avant de lancer `python docs/standalone/production-v11/assemble-register.py --workbook-metadata`. Un nouvel export remet cette revue à l’état d’attente ; il ne réutilise pas silencieusement une validation visuelle antérieure.

Le registre final vérifie les empreintes des fichiers contrôlés. La bible ajoute deux onglets au classeur V10 et conserve les parties OOXML historiques. Le remplacement Drive s’effectue sur le même identifiant de fichier, avec comparaison des octets téléchargés après publication.
