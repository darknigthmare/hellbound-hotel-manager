# Audit complémentaire Hellaverse — 19 novembre 2026

## Portée et état
Inventaire de production à comparer aux annuaires `src/data/hazbin-directory.ts`, `src/expansions/helluva-boss/data.ts` et au roster `src/standalone/roster.ts`.
**Attention :** ces lignes sont des candidats à valider, non des sprites générés, des personnages jouables ni une preuve de fidélité 1:1. Les surnoms de production et de fandom doivent être distingués des noms canoniques.

## Helluva Boss — nouveaux personnages à contrôler (priorité P0)
| Source | Identités candidates | Travail |
| --- | --- | --- |
| Saison 3 épisode 1 | Jordie Jordan; Homie Joey | captures, proportions, fiche, sprite individuel |
| Saison 3 épisode 2 | Cassity; Winston Wackford; Willow Wackford; Wendy Wackford | captures, fiches, tenues |
| Saison 3 épisode 3 | Alejandro; Ricardo; Darcy; sinner crocodile australien (désignation descriptive) | identité et apparence à vérifier |
| Saison 3 épisode 4 | Judge Jiner | capture, fiche, sprite |
| Saison 3 épisode 5 | Sitri | capture, fiche, sprite |

## Helluva Boss — personnages secondaires à vérifier (P1)
- Personnel d'Ozzie's : Robin, Hen, Crane.
- Mafia de Crimson : Cleo, Crunch, Giancarlo, Nickel, Titus, Butch, Marcella, Stu, Stacks, Murello.
- Cirque de Cash : Abby, Banarcle, Eenie, Egg, Jonesy, Meenie, Microwave, Minee, Ribs, Shoelace.
- Harvest Moon Festival : Belle, Cake, Curry, Ice Cube, Kitti, Opal, Ox, Paper Plates, Shrimp, Spur, Square.
- Robo Fizz et publicités : Iggy, Jude, Roxy.
- Personnel et figurants : stagiaires I.M.P., frères de Millie, clients d'Ozzie's, autres silhouettes individualisables.
- Vérifier que Mortimer et Mister Butler ne désignent pas la même identité avant tout ajout.

## Hazbin Hotel — manques à contrôler (P0/P1)
- Biodémons de Baxter (petit et grand) et sac-crabe vivant.
- Egg Boiz angéliques, séparés des Egg Boiz de Sir Pentious.
- Enfant épargné par Vaggie.
- Barman Drinky Bird, barman de Magic Kat, démon ptérodactyle.
- Membres individualisables des usuriers de Mimzy, des gangs requins, des exorcistes et des employés Vees.
- Démons cobra et hibou du studio de Valentino.
- Serviteurs d'ombre d'Alastor et requins électriques de Vox : traiter comme entités de combat/invocations, pas automatiquement comme combattants.
- Figurants de Cannibal Town, 666 News, Heaven et Magic Kat à indexer par épisode et plan.

## Politique de fidélité 1:1
Pour chaque entrée : (1) épisode et timecode, (2) source visuelle autorisée, (3) palette et proportions, (4) silhouettes avant/profil/arrière lorsque visibles, (5) pièces séparées si nécessaires, (6) sprite isolé transparent, (7) poses idle/walk/attack/hit/KO uniquement si pertinentes, (8) comparaison visuelle documentée. Ne pas inventer de face cachée sous l'étiquette canonique. Les movesets, dégâts et finishers créés pour le jeu doivent être marqués `simulation_au`.

## Séparation des statuts
`candidate` -> `source_verified` -> `reference_captured` -> `sprite_generated` -> `integrated` -> `visually_verified`.

## Sources de vérification
- https://hazbinhotel.fandom.com/wiki/Minor_Characters/Hazbin_Hotel
- https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Imps
- https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Demons
- Épisodes originaux et génériques (référence finale obligatoire).

## Priorité d'intégration
1. Corriger et dédoublonner les identités.
2. Ajouter les fiches validées sans déclarer d'assets fictifs.
3. Générer les personnages un par un et contrôler le cadrage.
4. Relier les portraits/atlases et ajouter les movesets seulement après validation.
5. Exécuter `npm run qa` et effectuer une revue visuelle dans le jeu.
