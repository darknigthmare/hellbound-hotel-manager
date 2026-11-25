# Infernal Versus — livraison statique V6

**25 novembre 2026 · PR nº 8 · reprise depuis `8d34176aa08dbd566230e5a4742487d64d731cd9`**

Cette reprise livre **9 dessins distincts et 20 fichiers d’image**, raccordés au jeu et au suivi de production. Elle complète six bases de personnages Helluva, isole la machine-portail D.H.O.R.K.S. et ajoute deux décors. Les nouvelles bases sont consultables dans la galerie ; les deux décors sont sélectionnables comme arènes. Les 43 kits jouables et les règles de combat restent le périmètre existant.

Le [registre final](production-v6/delivery-register.json) contient les chemins, dimensions, empreintes, statuts, sources et contrôles. Les [journaux de production](production-v6/README.md) distinguent les sorties sélectionnées, les versions remplacées et les refus sans fichier.

## Les neuf dessins livrés

| Dessin | Dimensions du master | Continuité | Intégration |
| --- | --- | --- | --- |
| Josh | 1 024 × 1 536 | Helluva S1 | Base statique en galerie de réserve |
| Coco | 1 024 × 1 536 | Helluva S1 | Base statique en galerie de réserve |
| Apple | 1 024 × 1 536 | Helluva S1 | Base corrigée, réserve sur le motif du mollet |
| Kat | 887 × 1 774 | Helluva S1 | Base statique en galerie de réserve |
| Milky | 1 105 × 1 423 | Helluva S1 | Base corrigée, haut à une seule manche |
| Kiki | 1 024 × 1 536 | Helluva S1 | Base statique en galerie de réserve |
| Anneau de la machine-portail D.H.O.R.K.S. | 1 345 × 1 170 | Helluva S2 | Machine isolée en galerie, avec ouverture transparente |
| Annexe infernale · Entraînement | 1 672 × 941 | Création originale AU | Arène `hellaverse-training` |
| Vox · Bureau S2 | 1 671 × 941 | Hazbin S2, adaptation de combat | Arène `vox-office-s2` |

Les livrables comprennent **9 PNG maîtres, 9 WebP sans perte et 2 miniatures de 480 × 270**. Ils totalisent **16 969 392 octets**. Chaque paire PNG/WebP conserve exactement les pixels RGBA de la sortie sélectionnée. Cette égalité technique ne constitue pas une certification de fidélité artistique à la référence.

Trois corrections ciblées remplacent leurs versions initiales : Apple, Milky et la disposition des sièges du bureau de Vox. Elles ne sont pas comptées comme trois dessins supplémentaires. Les prompts, empreintes et conclusions de ces révisions sont conservés dans [le journal Helluva](production-v6/helluva-generation.json) et [le journal principal](production-v6/root-generation.json).

## Ce qui est raccordé au jeu

Les six bases et la machine sont ajoutées au catalogue cumulatif de réserve, sous le lot `wave-k-2026-11-25`. Les bases portent le marqueur S1 ; la machine porte le marqueur S2 utilisé par le filtre de contenu de la galerie. Ces images ne créent ni nouveaux kits, ni IA de combat, ni téléportation.

Les deux fonds disposent d’une définition d’arène, d’une miniature et de couleurs de présentation. Les sélecteurs CSS conservent leur image entière avec `contain` et masquent les grilles et lumières génériques superposées. Ils réutilisent des compositions audio originales déjà présentes. **Aucun cycle d’animation, effet animé ou morceau audio n’est ajouté.** Le contrôle visuel sur appareil reste non exécuté, comme indiqué ci-dessous.

L’annexe d’entraînement est un lieu original AU. Le bureau de Vox reprend un intérieur montré dans le clip officiel *The Vees Meeting* ; sa caméra et son sol sont adaptés à la lisibilité du combat. Il ne livre pas la façade ou l’architecture complète de la tour, ni des câblages séparés ou des écrans réglables. Le plan d’extension conserve donc `vox-tower` en couverture partielle.

L’audit a aussi rapproché les IDs de planning des décors déjà présents : I.M.P., Ozzie’s et la plage de *Spring Broken*. La chambre d’hôpital de V5 couvre un intérieur ; la façade et la cour prévues restent une autre demande. Ces rapprochements ne sont pas comptés comme de nouvelles images.

## État cumulé après V6

| Indicateur | Avant V6 | Après V6 |
| --- | ---: | ---: |
| Combattants jouables | 43 | 43 |
| Arènes sélectionnables | 35 | **37** |
| Éléments de galerie de réserve | 42 | **49** |
| Bases autonomes explicites | 77 | **83** |
| Dont bases actives / en réserve | 40 / 37 | **40 / 43** |
| IDs du catalogue sans base autonome | 132 | **126** |
| Identités de production sans base, après l’alias Travis connu | 131 | **125** |
| Familles de costumes sélectionnables | 11 | 11 |
| Illustrations personnelles V3 | 127 / 129 | 127 / 129 |
| Illustrations de campagne globale | 11 / 11 | 11 / 11 |
| Modes de jeu | 9 | 9 |

Le catalogue de 209 IDs inclut des groupes, des incarnations du pilote, des variantes AU et des entrées futures. Il ne représente pas 209 individus canoniques distincts. L’[audit de qualification](production-v6/qualification-audit.json) reste un instantané avant production ; le registre V6 et `meta.currentRuntime` du plan décrivent l’état courant.

## Références et fidélité

Les six bases Helluva utilisent la planche nommée attribuée à CalisDraws / Cécilia Goncalves. Le texte public de l’artiste a été recoupé par X oEmbed ; le bitmap inspecté provient d’un hébergement secondaire, déclaré comme tel. Des aperçus officiels de *Spring Broken* complètent cette attribution sans constituer une vérification exhaustive des six silhouettes dans l’épisode.

La [revue indépendante](production-v6/independent-visual-review.md) conserve les observations initiales et finales, avec les empreintes des images effectivement inspectées :

- **Apple :** bracelets et branches noires de la queue rétablis ; le motif du mollet reste différent de la planche. Ce détail demeure à corriger.
- **Milky :** la manche indue a été retirée du bras situé à gauche de l’image ; la manche opposée est conservée.
- **Josh, Coco et Kiki :** les attributs principaux sont conservés, avec des écarts de détail consignés pour la bouche et les cheveux, le short, les ailes, les cornes ou les coutures.
- **Kat :** aucun écart majeur identifié parmi les attributs contrôlés ; la pose neutre reste une adaptation.
- **Bureau de Vox :** le fauteuil de Vox a été replacé du côté de la caméra et les deux visiteurs de l’autre côté du bureau. Les panneaux et les sièges sont simplifiés ; le cadrage et le sol restent adaptés au combat.
- **Machine D.H.O.R.K.S. :** anneau entier, deux pieds et centre transparent contrôlés. La référence native de 320 × 180 ne permet pas de certifier les joints, les facettes ou l’espacement exact des voyants.

Les journaux regroupent **22 URL distinctes de référence**. La photo de carte utilisée pour le bureau corrobore sa géométrie ; son effet foil ne sert pas de référence de texture ou de couleur. **Aucune fidélité artistique 1:1 n’est certifiée.**

## Refus et références encore insuffisantes

Les tentatives de **KeeKee, Razzle, Dazzle, Fat Nuggets et Frank** ont été refusées par le générateur. Elles n’ont livré aucun fichier et n’ont pas été relancées. Elles restent hors des neuf dessins comptés.

Les deux scènes personnelles historiquement refusées — rivalité de Husk et introduction de Sir Pentious — restent à leur statut antérieur, sans nouvelle tentative. Les trois personnages **Vikki, Gigi et Russ**, le **toit du final S1**, l’**aéronef de Pentious du pilote**, la **flèche C.H.E.R.U.B.** et le **shuriken D.H.O.R.K.S.** restent différés faute de références complètes. Le [supplément de recherche](production-v6/references-supplement.json) décrit les vues retrouvées et leurs limites.

## Validation technique

La commande complète **`npm run qa` a réussi en 98,868 secondes** : TypeScript, ESLint, **46 suites / 408 tests**, build manager, build standalone et **1 215 empreintes de distribution vérifiées**. Les sources contrôlées sont restées stables pendant cette exécution. Le lot contient **1 211 fichiers dans `public/`** ; le [contrôle des références actives](production-v6/active-asset-coverage.json) vérifie **612 chemins utilisés**, sans référence cassée.

Le [rapport de validation](production-v6/validation.json) conserve aussi les deux tentatives préalables : un arrêt pour manque de mémoire, puis une erreur ESLint dans le nouveau constructeur documentaire, corrigée avant l’exécution réussie. Les trois logs sont archivés. La sortie manager reproductible a été retirée après sa validation pour libérer la mémoire ; le standalone vérifié est conservé dans l’environnement de travail.

**Le contrôle réel du jeu en navigateur n’a pas été exécuté.** Chromium est absent ; son téléchargement officiel par Playwright a reçu HTTP 403. Il n’existe donc aucune nouvelle capture desktop/mobile ou mesure de performance mobile pour V6. Les tests JSDOM, les contrôles des fichiers et les revues d’images ne sont pas présentés comme une session de jeu. Voir [browser-qa.json](production-v6/browser-qa.json).

## Bible et sources livrées

La [bible V6](INFERNAL_VERSUS_BIBLE_V6.xlsx) conserve les **40 feuilles historiques** et ajoute **Production V6**, **Cibles V6** et **Repères V6**, soit **43 feuilles**. Les formules de synthèse s’appuient sur les lignes de livraison et de qualification. Les contrôles portent sur leur recalcul, une modification de cible puis restauration, l’export et le réimport, ainsi que les rendus des nouvelles vues.

Le [rapport du classeur](production-v6/workbook-qa.json) et le [contrôle d’assemblage](production-v6/workbook-package-report.json) consignent les résultats, les empreintes des 40 feuilles préservées et les chemins de rendu. Le [README de production](production-v6/README.md) donne les scripts et l’ordre de reconstruction. Les versions V1–V5 restent historiques ; elles ne sont pas réécrites pour afficher les chiffres V6.
