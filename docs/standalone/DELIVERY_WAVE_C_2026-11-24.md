# Infernal Versus — vague C du 24 novembre 2026

## Livraison et base

Cette vague ajoute **35 dessins retenus**, leurs exports et trois miniatures à la PR #8 existante. Elle part du commit `02ce6a48bc0913e52885de5603745f466d6ae7f9`, déjà publié sur `feat/infernal-versus-assets-20261124`. Le lot précédent de 42 œuvres reste un instantané distinct ; ses rapports et manifestes ne sont pas réécrits.

Le cadre de production reste le même : un personnage entier ou un élément de décor par génération, PNG source conservé, export WebP lossless, alpha pour les sprites et accessoires. Les adaptations de combat et de composition sont classées `simulation_au`.

## Dessins et fichiers

| Catégorie | Dessins nouveaux | Contenu |
|---|---:|---|
| Poses d’action Hazbin | 9 | Vox, Velvette et Carmilla : garde, contact léger, réaction |
| Poses d’action Helluva | 12 | Blitzø, Stolas, Fizzarolli et Asmodeus : garde, contact léger, réaction |
| Costume Lute avant blessure | 5 | Contact léger, réaction, lourd, accroupissement, saut |
| Fonds d’arène | 3 | D.H.O.R.K.S., salon de Crimson, concours de Mammon |
| Éléments de profondeur | 6 | Un médian et un avant-plan indépendants par arène |
| **Total retenu** | **35** | **35 PNG + 35 WebP + 3 miniatures WebP** |

Les **73 nouveaux fichiers image** représentent **71 997 821 octets** : 44 084 233 pour les masters et 27 913 588 pour les exports et miniatures. Les couples PNG/WebP ne sont pas comptés comme deux dessins. Tous les 38 nouveaux fichiers publics sont référencés par le jeu.

Le READY de Lute publié lors du lot précédent est réutilisé directement, sans copie ni nouvelle génération. Son activation ajoute une référence runtime existante ; elle ne gonfle pas le nombre de nouveaux dessins ou fichiers.

Les 26 nouveaux sprites de personnage sont en 1024 × 1536. Les trois fonds sont en 1536 × 1024. Les six props conservent leurs masters natifs de 1254 × 1254 et sont exportés en 1024 × 1024 ; les miniatures sont en 384 × 256. Pour les images redimensionnées, le contrôle lossless compare les pixels à l’intermédiaire d’export attendu. Les autres WebP reproduisent exactement le RGBA du master.

Au total, 37 appels de génération ont été effectués : 36 sorties obtenues, dont une première version de frappe Stolas remplacée après correction de cadrage, et un refus pour la garde de Rosie. Les 35 dessins retenus constituent l’inventaire livré ; la première version Stolas et le refus sont tracés dans leurs manifestes, sans compter la correction comme une pose supplémentaire.

## Comportement dans le jeu

### Sept ensembles de poses d’action

Les sept combattants ci-dessus disposent désormais d’une garde distincte, d’un contact léger et d’une réaction. Le contact léger suit la fenêtre du moteur déjà en place : il apparaît au démarrage effectif du coup pendant 110 ms, avec retour au READY hors de cette fenêtre. Les autres actions gardent les banques existantes. Les dégâts, portées, hitboxes et règles de combat ne sont pas modifiés.

Leurs images reprennent les READY publiés comme références d’identité et de proportions. Les frappes sont des poses de jeu : par exemple le jab de Vox, la feinte de Velvette et le coup de pied de précision de Carmilla. Le prop de la frappe « Coup de crosse » de Blitzø est documenté comme adaptation AU ; le READY de référence n’en possédait pas.

### Lute S1 sélectionnable comme costume

Le costume `lute-pre-injury` associe les cinq nouvelles poses au READY existant. Les six images conservent les deux bras ordinaires et le même uniforme. Lorsqu’il est sélectionné, le rendu du costume fournit les images pour les actions et les cinématiques, ce qui évite de réintroduire ponctuellement une banque au bras doré pendant le duel.

Ce choix rend l’incarnation S1 utilisable comme costume optionnel. Le portrait et les banques de l’incarnation par défaut restent distincts. Aucune transition chronologique animée ni harmonisation de toutes les représentations historiques de Lute n’est revendiquée.

### Correction ciblée des marges verticales

Les comparaisons sur fond neutre ont mis en évidence des marges basses différentes : jusqu’à 72 pixels source sur le lourd de Lute et 62 sur la frappe de Velvette. Un registre de contacts de bottes et chaussures aligne les poses au sol sur leur propre READY avec une translation CSS proportionnelle à la hauteur affichée.

La correction concerne seulement Lute S1 et les nouveaux ensembles Vox, Velvette et Carmilla. Le saut de Lute reste volontairement sans ancre ; les autres costumes et images ne reçoivent pas de correction. Aucun pixel n’est déplacé dans les PNG, aucune silhouette n’est redimensionnée. L’orientation et le mouvement de respiration conservent leurs transformations existantes.

Cette correction compense les marges transparentes verticales. Elle ne constitue pas une normalisation du pivot horizontal, de la taille relative, du cycle d’animation ou des contacts animés en moteur.

### Trois arènes supplémentaires

| Arène | État de référence | Médian | Avant-plan |
|---|---|---|---|
| D.H.O.R.K.S. | Salle intacte de *Truth Seekers*, S1E6 | Chaise métallique | Caméra en hauteur |
| Demeure de Crimson | Salon ordinaire de *Exes and Oohs*, S2E3 | Fauteuil haut capitonné | Table et lampe à franges |
| Concours de Mammon | Théâtre du concours, S2E7 | Tour d’enceintes | Treillis et projecteur |

Les pièces sont vidées et élargies pour les duels. La caméra extérieure de D.H.O.R.K.S. est relocalisée à l’intérieur ; les ornements de Mammon et l’assemblage du projecteur sont adaptés. Les sources officielles, portfolios de production et captures republiées sont distingués dans le manifeste. Aucun plan exact d’épisode n’est annoncé.

Chaque arène comporte fond, médian, avant-plan, miniature et partition procédurale originale. Aucune chanson d’épisode n’est transcrite. Le registre du manager reste à huit lieux ; le standalone passe à dix-neuf arènes.

## Couverture mesurée

| Indicateur | Avant la vague C | Après la vague C |
|---|---:|---:|
| Combattants | 36 | 36 |
| Repos individuels actifs | 34 | 34 |
| Gardes individuelles distinctes | 3 | 10 |
| Contacts légers individuels | 5 | 12 |
| Réactions individuelles | 4 | 11 |
| Costumes sélectionnables | 5 | 6 |
| Images de pose de costume | 29 | 35 |
| Arènes à trois plans | 16 | 19 |
| Références d’assets | 297 | 336 |
| Références absentes | 0 | 0 |

Les cinq finitions, l’accessoire de finition séparé, les six images VFX pour treize attaques et la couverture narrative de 26 affectations sur 108, avec 22 images distinctes, sont conservés. Cette vague n’ajoute pas de physique autonome de projectile ni de nouveau chapitre illustré.

Le registre de production et le classeur sont réconciliés avec ces fichiers. Les alias de plan `imp-office` / `imp-reception` et `ozzies` / `ozzies-cabaret` désignent des arènes déjà existantes, sans créer de doublons dans le total. Le READY Lute quitte les réserves courantes ; son ancien statut reste lisible dans l’historique du lot précédent.

## Vérifications

Le contrôle consolidé vérifie la conservation octet pour octet des 35 PNG retenus, les pixels des 35 exports, les 38 nouveaux chemins publics et les empreintes de l’inventaire. L’audit runtime trouve 336 références et zéro fichier absent.

Pour les décors, 54 projections statiques combinent six props, trois dimensions d’arène et trois offsets de parallaxe. Les contours alpha ≥ 16 restent dans les limites, avec une marge minimale de 3,516 pixels. De faibles franges alpha 1–15 peuvent atteindre les bords et sont conservées sans retouche. Ces contrôles et les composites sur fond neutre ne sont pas des captures du navigateur.

- `npm run qa` : **sortie 0**, TypeScript et ESLint validés, **44 suites / 341 tests réussis**.
- Les deux builds réussissent ; **932 fichiers et 932 empreintes** du standalone sont contrôlés, pour **542,0 Mio**.
- Les **1083 fichiers source** hachés avant et après la QA sont inchangés. Le journal et son empreinte sont conservés.
- Bible : **23 onglets**, **188 formules avec résultats sans erreur**, **4685 cellules runtime** réconciliées, huit perturbations de recalcul restaurées et onze vues inspectées. Les onze registres historiques V1 sont préservés.
- Une revue indépendante confirme les chemins des sept sets, la priorité du costume Lute, les dix-sept ancrages mesurés et l’absence d’ancre sur le saut.

La revue interactive reste indisponible : le lancement local de Chromium a été confirmé bloqué par `socket EPERM`. Aucun rendu navigateur, mesure sur appareil réel ni certification artistique 1:1 n’est revendiqué.

## Absences et travail restant

La garde de Rosie a été refusée par le service de génération et n’a pas été relancée. Sa frappe et sa réaction n’ont pas été tentées dans cette vague ; ses ressources précédentes restent actives. Les quatre demandes refusées au lot précédent — READY Cherri Bomb, gardes Niffty et Sir Pentious, accroupissement Carmilla cheveux lâchés — n’ont pas été retentées.

Les nouveaux dessins sont des poses clés. Les cycles longs, pivots horizontaux, échelles entre personnages et transitions doivent encore être travaillés et vérifiés en jeu. Les archives historiques non retrouvées ne sont toujours pas comptées comme restaurées.

## Références de livraison

- `art/infernal-versus/production/delivery-wave-c-2026-11-24.json` : inventaire consolidé, empreintes et compteurs avant/après.
- `poses-main-wave-c-2026-11-24.json` : neuf poses Hazbin, mesures et refus Rosie.
- `poses-helluva-wave-c-2026-11-24.json` : douze poses Helluva et correction de cadrage Stolas.
- `costumes-wave-c-2026-11-24.json` : cinq poses nouvelles de Lute et READY réutilisé.
- `stages-wave-c-2026-11-24.json` : neuf couches, trois miniatures, sources et QA géométrique.
- `docs/standalone/ASSET_COVERAGE.json` : état exact des références runtime.
- `docs/standalone/extension-plan.json` : registre actualisé avec historique conservé.
- `docs/standalone/INFERNAL_VERSUS_BIBLE_V2.xlsx` : bible de production.
- `docs/standalone/QA_RUNTIME_WAVE_C_2026-11-24.json` et journal `.log` : QA automatisée et empreintes des sources.
- `docs/standalone/QA_WORKBOOK_WAVE_C_2026-11-24.json` : contrôles du classeur.
- `docs/standalone/REVIEW_ASSETS_WAVE_C_2026-11-24.md` : revue indépendante et limites.
