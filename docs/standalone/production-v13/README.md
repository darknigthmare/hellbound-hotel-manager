# Production V13 — sept dessins statiques

Cette vague poursuit la V12 publiée dans la PR nº 8. Elle apporte **7 dessins acceptés**, soit **16 fichiers image et 13 863 846 octets** : sept masters PNG natifs, sept exports WebP sans perte et deux miniatures d’arène. La parité des pixels RGBA est vérifiée pour les sept exports. Les références, les diagnostics et les deux essais Tilla écartés sont comptés séparément.

## Livraison

| Dessin | Usage | Source et limite principale |
|---|---|---|
| Vikki · Queen Bee S1 | Portrait narratif de réserve | Plan officiel de S1E8 à 90 s, natif 320 × 180 px. Buste volontaire ; détails fins adaptés et marge basse de 2 px. |
| Tilla · Nightmare | Portrait narratif de réserve | Produit officiel illustré par Kain. L’incarnation exacte dans un épisode n’est pas établie ; aucune base entière reconstruite. |
| D.H.O.R.K.S. · Salle de surveillance | Nouvelle arène S1 à un plan | Peinture TS_HB6_261B de Rebecca Reynolds. Le sol avant est prolongé pour le cadrage de combat. |
| Unhappy Campers · Hangar à bateaux | Nouvelle arène S2 à un plan | Peintures 02/03 de Jasper Luu et plans officiels de S2E5. Le quai avant devient une bande de combat continue, adaptation AU explicitée. |
| Spring Broken · Gobelet rouge renversé | Accessoire de réserve | Gobelet entier dans HB4_166 de Rebecca Reynolds ; détail natif de 74 × 61 px, proportions et ombrage adaptés. |
| D.H.O.R.K.S. · Panneau du bouton rouge | Accessoire de réserve | Panneau complet de TS_HB6_261B ; libellé « RED BUTTON » conservé. Aucune interaction ajoutée. |
| Asmodeus · Carafe de la chambre | Accessoire de réserve | Objet complet de 206 Paint 00007 de Jasper Luu ; couvercle, bec et anse inclus. Aucun placement ajouté au décor existant. |

Les neuf sorties natives de cette vague comprennent sept dessins retenus et deux essais précédents de Tilla archivés dans `production/v13/characters/discarded/`. Les retouches ont d’abord supprimé une corne et une extension ajoutées, puis ramené la marque blanche haute à une petite zone partielle visible sur la photographie du pin. Les retouches natives ne sont pas présentées comme des modifications pixel-identiques hors de leur zone cible. **Aucun nouveau refus du générateur et aucune relance d’une cible historiquement refusée.**

## Intégration

Les deux arènes utilisent leurs fonds entiers en affichage contenu, avec une miniature dédiée. Elles restent à un seul plan : aucun accessoire de réserve n’est superposé. La salle de surveillance se distingue de la cellule d’interrogatoire et de la chambre du portail déjà présentes. Dans le hangar, la barque et l’eau restent derrière le quai de combat.

Les deux portraits et les trois accessoires ajoutent cinq fiches à la galerie. Les portraits n’augmentent pas le nombre de bases entières. Tilla porte le badge **« PRODUIT OFFICIEL »** et une note qui précise que son apparition exacte dans un épisode n’est pas confirmée. Sa continuité est `official_merchandise_undated` ; `season_2` constitue un plafond conservateur du filtre, sans dater le produit ni certifier un modèle de saison 2. Tilla reste un personnage d’archive, sans statut jouable, recrutable ou ressuscité.

## Comptes et historique

| Indicateur | Après V12 | Après V13 |
|---|---:|---:|
| Bases entières | 114 | **114** |
| Bases actives / en réserve | 40 / 74 | **40 / 74** |
| IDs sans base entière | 95 | **95** |
| Identités distinctes sans base entière | 94 | **94** |
| Fiches de galerie | 128 | **133** |
| Arènes | 47 | **49** |
| Kits jouables | 43 | **43** |
| Familles de costumes | 24 | **24** |

Les 128 anciennes fiches sont préservées. Le plan ajoute les deux vues d’arènes et les portraits sans effacer les anciennes qualifications. Le registre V13 réconcilie aussi le résumé de refus V12 qui contenait `null` : l’identifiant exact `blitzo-sniper-production` provient du refus original, conservé sans modification.

## Vérifications

La revue artistique indépendante accepte les sept masters avec leurs limites. Les sept exports sont identiques à leur PNG décodé en RGBA ; cela certifie la conversion, pas une fidélité canonique 1:1. L’audit courant recense **726 chemins actifs sans référence cassée**.

La validation technique réussit : **413 tests dans 47 suites**, typage, lint, builds manager et standalone, packaging et **1 330 empreintes** de la distribution autonome. Les **198 fichiers d’entrée** restent inchangés pendant la passe complète. Chaque build Vite s’exécute dans un processus distinct ; les fichiers publics sont liés physiquement pour éviter les copies inutiles, avec contrôle d’intégrité final. La commande standard `npm run qa` n’a pas été exécutée comme commande unique en local.

Deux interruptions de processus sont conservées dans l’historique : la première pendant les tests, la deuxième pendant le build standalone après réussite des 413 tests et du build manager. La troisième passe complète a réussi avec des processus de build séparés et des checkpoints persistants. Les tests, leur worker unique et leur isolation restent inchangés.

Le lint final des **15 scripts JavaScript auxiliaires** passe sans erreur ni avertissement. Il a conduit à déplacer la remontée d’une erreur de fermeture hors du bloc `finally` des helpers navigateur. Les sources réellement exécutées sont conservées octet pour octet comme données historiques, avec un manifeste qui les relie aux anciennes recettes. Les observations, captures et 198 entrées runtime de la validation restent identiques.

La validation ciblée dans Chromium rassemble **six segments terminés**, sur ordinateur (1440 × 1000) et mobile émulé (390 × 844). Elle comprend **184 assertions d’interaction**, **16 contrôles d’intégrité supplémentaires** et **56 captures relues individuellement**. Les sept créations sont couvertes sur les deux formats : quatre combats d’entraînement avec déplacement réel et pause/reprise, cinq nouvelles fiches de galerie, liens de référence, provenance de Tilla et filtres S1/S2. Le costume Loona Queen Bee et la provenance historique Crymini 2017 servent aussi de contrôles de régression.

Cette preuve agrège des segments indépendants ; elle ne certifie pas une session continue. La galerie sur ordinateur et les parcours mobiles retenus ont été exécutés avec l’accélération GPU désactivée. Les échecs natifs du navigateur lors des tentatives précédentes restent archivés, et leur cause n’est pas établie. Les sessions prolongées de galerie, le défilement intégral des 133 fiches, les appareils physiques et les autres navigateurs ne sont pas validés par cette passe. La musique est activée dans les options, sans certification d’écoute ni de stabilité audio.

La bible V13 contient **58 feuilles et 67 tables**. Le contrôle OOXML confirme que **178 composants historiques**, dont les **56 feuilles et 65 tables** de la V12, restent identiques octet pour octet. Les six formules contrôlées donnent les valeurs attendues. Les dix vues nouvelles ont été relues sans texte coupé ni erreur visible ; les sources, limites, comptes et cibles différées figurent dans les deux nouvelles feuilles.

Deux plages représentatives rendues depuis le classeur complet produisent les mêmes PNG que les aperçus déjà relus. Microsoft Excel natif n’a pas été exécuté. Le fichier final de **674 412 octets** a remplacé la V12 dans le **même fichier Drive**, avec conservation de son dossier parent. Le téléchargement intégral après publication est identique octet pour octet au XLSX relu : SHA-256 `5a365b5483c40641670dd4b5520dbab42389f4769488b137e4aedbcd563f098b`.

## Cibles encore ouvertes

Les bases entières de Vikki et Tilla restent à produire à partir de références complètes qualifiées. Les trois modèles d’accessoires Erin Frost étudiés dans cette vague sont différés après l’échec d’accès à la première source native ; aucun dessin n’a été généré depuis une planche non vue. Le fût de plage est également différé, car sa partie basse est masquée par la glacière. Le premier crop de la carafe coupait le sommet du couvercle : il a été remplacé avant la génération et n’est pas utilisé comme référence livrée.

Les lacunes et refus historiques restent dans le registre. Cette vague n’ajoute aucun kit ni cycle d’animation et ne clôt pas la production globale du jeu.

## Documents de preuve

- [Registre de livraison](delivery-register.json)
- [Revue artistique indépendante](independent-visual-review.json)
- [Audit des ressources actives](active-asset-coverage.json)
- [QA technique](runtime-qa.json)
- [Lint final des scripts auxiliaires](harness-lint-qa.json)
- [QA navigateur et portée de la validation](browser-qa.json)
- [Placement et intégration vérifiés](runtime-placement.json)
- [Sources exactes des scripts navigateur exécutés](browser-harness/executed-harness-sources.json)
- [Historique de validation](validation-history.json)
- [Références des personnages](characters-references.json)
- [Références des accessoires](root-references.json)
- [Qualification des environnements](environment-qualification.json)
- [Plan global de production](../extension-plan.json)
- [Bible V13 — fichier Excel](../INFERNAL_VERSUS_BIBLE_V13.xlsx)
- [Vérification du classeur](workbook-qa.json)
- [Publication Drive et comparaison du téléchargement](drive-publication.json)
- [Bible — même fichier Drive](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit)
- [Publication dans la PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8)

Les handoffs décrivent l’état accepté avant intégration. Le registre final et les rapports de QA documentent l’état livré ; les limites des références et les éléments encore incomplets restent explicites.
