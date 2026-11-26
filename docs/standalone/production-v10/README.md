# Reprise V10 — images sauvegardées, finalisation interrompue

Le 26 novembre 2026, l’environnement d’exécution est devenu indisponible pendant la validation. Cette branche sauvegarde les **11 dessins acceptés**, leurs **24 fichiers livrables** et **27 fichiers de référence**, ainsi que les informations de reprise récupérables. Les 51 fichiers d’image représentent 26 529 119 octets ; les 24 livrables seuls représentent **19 950 095 octets**.

## Dessins accessibles

| Master PNG natif | Dimensions | Export sans perte |
| --- | --- | --- |
| [Loona — robe de soirée, Queen Bee](../../../production/v10/costumes/masters/hb_loona-party-queen-bee.png) | 1160 × 1355 | [WebP](../../../public/assets/production/v10/costumes/hb_loona-party-queen-bee.webp) |
| [Moxxie — hallucination, Truth Seekers](../../../production/v10/costumes/masters/hb_moxxie-hallucination-truth-seekers.png) | 1199 × 1312 | [WebP](../../../public/assets/production/v10/costumes/hb_moxxie-hallucination-truth-seekers.webp) |
| [Charlie — transformation du combat final S1](../../../production/v10/costumes/masters/charlie-demon-battle-s1-ready.png) | 1024 × 1536 | [WebP](../../../public/assets/production/v10/costumes/charlie-demon-battle-s1-ready.webp) |
| [Melissa — tenue de mannequin S1](../../../production/v10/characters/masters/hz_melissa-model-s1-base.png) | 1024 × 1536 | [WebP](../../../public/assets/production/v10/characters/hz_melissa-model-s1-base.webp) |
| [Loo Loo — mascotte S1](../../../production/v10/characters/masters/hb_loo_loo-park-s1-base.png) | 1182 × 1330 | [WebP](../../../public/assets/production/v10/characters/hb_loo_loo-park-s1-base.webp) |
| [Crymini — modèle historique 2017](../../../production/v10/characters/masters/hz_crymini-legacy-2017-base.png) | 1024 × 1536 | [WebP](../../../public/assets/production/v10/characters/hz_crymini-legacy-2017-base.webp) |
| [Chambre d’Asmodeus — Oops](../../../production/v10/environment/masters/asmodeus-bedroom-s2-room.png) | 1602 × 982 | [WebP](../../../public/assets/production/v10/environment/asmodeus-bedroom-s2-room.webp) |
| [Console de la chambre d’Asmodeus](../../../production/v10/environment/masters/asmodeus-bedroom-console.png) | 1540 × 1021 | [WebP](../../../public/assets/production/v10/environment/asmodeus-bedroom-console.webp) |
| [Candélabre de la chambre d’Asmodeus](../../../production/v10/environment/masters/asmodeus-bedroom-candelabrum.png) | 1024 × 1536 | [WebP](../../../public/assets/production/v10/environment/asmodeus-bedroom-candelabrum.webp) |
| [Noël imaginé par Blitzø — Sinsmas](../../../production/v10/environment/masters/blitz-sinsmas-dream-s2-room.png) | 1648 × 954 | [WebP](../../../public/assets/production/v10/environment/blitz-sinsmas-dream-s2-room.webp) |
| [Boule à neige au sapin](../../../production/v10/environment/masters/blitz-sinsmas-tree-snowglobe.png) | 1341 × 1173 | [WebP](../../../public/assets/production/v10/environment/blitz-sinsmas-tree-snowglobe.webp) |

Les deux miniatures sont conservées avec les exports d’environnement. Chaque image et fichier de référence possède un SHA Git et un SHA-256 dans l’[inventaire vérifié](github-immutable-blobs.json).

## État réel

Les images ont été générées, exportées et revues visuellement. Trois corrections ont été effectuées avant acceptation : doublure de Moxxie, bras transformé de Charlie et nez de Loo Loo. Les candidats remplacés ne sont pas comptés comme dessins supplémentaires.

L’intégration locale préparée portait le catalogue à **112 bases autonomes**, **24 familles de costumes**, **45 arènes** et **115 entrées de galerie**. Elle conservait **43 kits**. Ces compteurs décrivent les modifications locales préparées, qui ne sont pas encore publiées comme application V10 sur la PR nº 8. Il reste **97 identifiants** de catalogue sans base entière, soit **96 identités distinctes** après l’alias connu.

La vérification locale de 700 chemins d’images ne trouvait aucun lien cassé. Un test d’interface ambigu sur le nombre 43 a été précisé et son exécution ciblée a réussi. **La suite complète V10, les builds, la vérification navigateur et le classeur V10 ne sont pas terminés.** Aucun contrôle d’asset dans le navigateur n’est déclaré réussi. Le dernier classeur Drive reste la V9.

Cette branche contient les assets et les notes de reprise au-dessus du code publié V9. Les scripts récupérés ne constituent pas une preuve d’exécution. La [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8) conserve son état publié V9, au commit `241d43ad6b95c7a10fe05155f35c0990c165b771`.

## Fidélité et périmètre

Crymini représente le **modèle de conception de 2017** ; cette base ne prouve pas une incarnation des saisons récentes. Le Noël de Blitzø est une vision familiale. Les costumes sont des poses statiques ; les trois nouvelles bases restent des dessins de réserve. Les deux exigences de Charlie utilisent le même dessin, compté une fois. Aucun nouveau kit, cycle d’animation ou refus du générateur n’est enregistré. Aucun refus historique n’a été relancé. Les références basse résolution limitent la certitude sur les petits détails : **fidélité 1:1 non certifiée**.

## Reprendre le travail

Lire [recovery-state.json](recovery-state.json) pour les comptes, sources officielles, empreintes, modifications locales à récupérer et étapes encore requises. Le répertoire de travail était `/workspace/scratch/57c1b6f2d64f/hellbound-hotel-manager`. Si l’exécuteur revient, récupérer d’abord ses modifications locales ; le code V9 de cette branche ne doit pas les écraser.

Il reste à restaurer ces modifications, relancer les validations en série, finaliser le registre, produire et vérifier la bible V10, remplacer le même fichier Drive, puis publier la V10 complète sur la branche de la PR avec contrôle de son commit courant.

## Autres éléments récupérés

- [État du catalogue, du plan et du classeur](recovery-catalogue-plan-bible.json).
- [Prompts exacts des trois bases, avec la correction de Loo Loo](recovery/characters-prompts-recovered.json), récupérés du contexte d’auteur.
- [Harness navigateur](recovery/run-browser-qa.cjs) et [finaliseur de rapport](recovery/finalize-browser-qa.py), conservés comme scripts préparés à restaurer. Leur présence ne signifie pas que la recette navigateur a réussi.
