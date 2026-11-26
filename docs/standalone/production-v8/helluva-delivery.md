# Helluva Boss — livraison statique V8

## Résultat

**9 costumes statiques sélectionnés et exportés**, rattachables à quatre combattants existants. Cette vague ne crée aucune nouvelle identité, aucune animation et aucun kit de combat. Chaque costume contient une seule image READY, à conserver pendant les différentes actions avec `staticReadyOnly: true`.

| Combattant | Costume | Continuité | Identifiant |
|---|---|---|---|
| Blitzø | Garde du corps, Loo Loo Land | S1E2 | `hb_blitzo-bodyguard-looloo` |
| Moxxie | Garde du corps, Loo Loo Land | S1E2 | `hb_moxxie-bodyguard-looloo` |
| Millie | Garde du corps, Loo Loo Land | S1E2 | `hb_millie-bodyguard-looloo` |
| Stolas | Touriste, Loo Loo Land | S1E2 | `hb_stolas-tourist-looloo` |
| Millie | Assistante STAFF, Ghostf**kers | S2E10 | `hb_millie-staff-ghostfuckers` |
| Blitzø | Harvest Moon Festival | S1E5 | `hb_blitzo-harvest-festival` |
| Millie | Harvest Moon Festival | S1E5 | `hb_millie-harvest-festival` |
| Stolas | Vampire, Apology Tour | S2E9 | `hb_stolas-vampire-apology-tour` |
| Blitzø | Fantôme, Apology Tour | S2E9 | `hb_blitzo-ghost-apology-tour` |

Les anciennes familles déjà livrées ont été vérifiées avant génération : Moxxine, Millerd, les apparences humaines de Loona, Stolas, Barbie et Vortex, Stolas déchu, Fizz casual, Moxxie Harvest, Millie du passé et les archives V7 ne sont pas produites une seconde fois.

## Fichiers et traçabilité

- `helluva-delivery.json` : les neuf assets, leurs propriétaires, IDs de costume, saisons, dimensions, SHA-256, export, maître, notes de fidélité et couverture du cadre.
- `helluva-generation.json` : prompts exacts des dix candidats initiaux et de la correction native ciblée.
- `helluva-reference-index.json` : 24 références effectivement inspectées, captures, URLs d’épisodes, timecodes, rectangles de découpe, sources de storyboard et empreintes.
- `helluva-qualification.json` : sélection, doublons évités, références encore insuffisantes et refus historiques conservés sans relance.
- Maîtres PNG : `production/v8/helluva/masters/<id>.png`.
- Exports WebP : `public/assets/production/v8/helluva/<id>.webp`.
- Candidats originaux et correction : `production/v8/helluva/candidates/`.

Les dessins utilisent exclusivement l’outil natif `image_gen.imagegen`, avec transparence demandée. Les captures de référence sont des images publiques primaires des épisodes officiels ; les images de la boutique officielle corroborent certains détails de tenue. Les captures vidéo ont une résolution native de 320 × 180 par cellule. Elles n’ont pas été agrandies par IA pour prétendre révéler des détails absents.

## Contrôle visuel et technique

Les neuf maîtres ont été comparés aux sources, puis revus indépendamment. Les neuf WebP conservent exactement les pixels RGBA des PNG sélectionnés, vérifiés par une seconde comparaison indépendante. Aucune suppression de fond, correction de pixels ou modification d’alpha n’a été effectuée par script. La seule correction visuelle est une édition native ciblée du costume Harvest de Blitzø, avec conservation de la première proposition et du prompt exact : suppression de croix rouges non corroborées dans la zone blanche du visage et de marques rouges ajoutées sur le tissu des manches.

Huit PNG mesurent 1024 × 1536 et conservent leur alpha natif 0–254. Le fantôme de Blitzø mesure nativement 1052 × 1495 et conserve un alpha 0–255. Les neuf utilisent un cadrage portrait. Les marges de certains sujets sont faibles, sans extrémité visiblement coupée ; les boîtes de contenu à alpha ≥ 128 figurent dans le manifest.

Le fantôme correspond à une **silhouette costumière entière** : le drap masque réellement les cornes, le corps, les jambes, les pieds et la queue dans la vue primaire extérieure à 1220 secondes. L’ourlet entier est présent. Aucun membre caché n’a été reconstruit pour ce rendu.

Ces dessins sont des adaptations statiques documentées. Les poses neutres, proportions, coutures, plis, motifs et courbures sont parfois recomposés. Le panneau diagonal de Moxxie sous le nœud rouge, la casquette et la queue du Stolas touriste, ainsi que certains détails fins des chaussures ne permettent pas une certification 1:1. Les réserves précises sont attachées à chaque asset. Le contrôle en jeu et le branchement runtime appartiennent à l’intégration du lot global.

## Candidat conservé hors livraison

`hb_blitzo-bethany-ghostfuckers` reste conservé comme tentative bloquée par un manque de référence. Le haut, la perruque et le chapeau sont corroborés, mais l’asymétrie des jambes et les grandes bottes à talon du rendu ne le sont pas suffisamment. Il n’a ni export public ni raccordement runtime dans ce sous-lot et ne compte pas parmi les neuf costumes livrés.

Les autres pistes examinées — Fizzarolli en tenue de pause de Full Moon, Verosika humaine de Spring Broken et une tenue de rendez-vous de Stolas — n’ont pas déclenché de génération faute de vue entière assez précise ou de famille manquante distincte. Les identités historiquement refusées, notamment Stella, Loopty Goopty et Deerie, n’ont pas été relancées.

## Règle de comptage

Cette production comprend dix sorties candidates initiales et une sortie native de correction. **Neuf dessins de costume sont sélectionnés.** Les neuf PNG maîtres et leurs neuf WebP sont deux encodages des mêmes dessins. Bethany et la première version remplacée de Blitzø Harvest ne sont pas des livraisons supplémentaires.
