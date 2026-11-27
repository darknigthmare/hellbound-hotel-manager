# Contrôles de la vague I — 25 novembre 2026

## Classeur et conception

Les 29 captures de plages du classeur V3 sont des rendus Artifact Tool. Elles couvrent les 18 onglets courants, dont les six nouveaux onglets de conception et les colonnes longues de texte. Les deux vues du guide ont été inspectées par l’agent principal ; les 27 autres par deux relectures parallèles. Aucun chevauchement, texte coupé ou retour à la ligne défectueux n’a été relevé dans ces plages. Le classeur complet n’a pas été rasterisé cellule par cellule.

- [Rapport visuel et empreintes des captures](workbook-visual-qa.json)
- [Plages rendues](workbook-render-specs.json)
- [Audit indépendant des données et formules](../QA_WORKBOOK_WAVE_I_2026-11-25.json)
- [Revue de conception](../QA_DESIGN_WAVE_I_2026-11-25.json)
- [48 corrections de champs après comparaison avec le moteur](campaign-engine-corrections.json)

L’audit contrôle 11 577 cellules courantes et 222 caches de formule sans écart. Les onze feuilles historiques sont identiques à l’octet aux feuilles V1 ; elles ne sont pas rerendues.

## Assets et transparence

Les deux compositions sur damier concernent Rolando et Dennis. Elles vérifient le RGBA complet : l’aspect gris d’un aperçu RGB seul ne représentait pas leur transparence effective. Les statistiques du contour figurent dans [alpha-compositing-qa.json](alpha-compositing-qa.json). Ces images ne certifient pas la fidélité canonique 1:1 ni les échelles relatives en jeu.

Le dossier contient **31 PNG de diagnostic : 29 vues de classeur et 2 compositions alpha**. Ils sont exclus des six dessins et douze fichiers de production de la vague I.

## Projet

Les fichiers `typecheck.txt`, `lint.txt`, `tests.txt`, `build-manager.txt`, `build-standalone.txt` et `check-standalone.txt` conservent les sorties des six phases exécutées avec succès. Voir le [rapport runtime](../QA_RUNTIME_WAVE_I_2026-11-25.json). Aucun nouveau navigateur ni capture du jeu n’est revendiqué pour I.
