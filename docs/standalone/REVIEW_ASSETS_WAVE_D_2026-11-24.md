# Revue de fidélité des assets — vague D, 24 novembre 2026

## Portée et conclusion

Cette revue porte sur les trois manifestes figés, les planches statiques de la vague D et le repli d’intégration documenté après la découverte de cellules défectueuses dans les anciennes banques. Les dessins retenus constituent des **candidats `simulation_au` documentés** : les identités, palettes et motifs observables sont étayés à des degrés différents, tandis que les poses de jeu, certains volumes et les compositions d’arène restent des adaptations. **Aucune fidélité 1:1, aucun cycle d’animation complet et aucune recette visuelle en navigateur ne sont certifiés.**

| Lot | Livré dans cette vague | Limite de complétude |
| --- | --- | --- |
| Personnages | 12 dessins sélectionnés : READY, garde, frappe et recul pour Katie, Tom et Mammon ; 12 masters PNG et 12 WebP | Les quatre poses demandées de Stella sont absentes. Quatre poses clés ne constituent pas un cycle complet. |
| Décors | Trois arènes, chacune avec un fond et deux props : neuf masters, neuf couches WebP et trois miniatures dérivées | Composition, piste de combat et placement des props adaptés au jeu. |
| VFX | Cinq nouveaux dessins, cinq masters PNG et cinq WebP ; un asset existant réemployé | Aucun dessin supplémentaire pour les réemplois. Effet de Lucifer différé sans génération. |

Sources de traçabilité : [personnages](../../art/infernal-versus/production/characters-wave-d-2026-11-24.json), [décors](../../art/infernal-versus/production/stages-wave-d-2026-11-24.json) et [VFX](../../art/infernal-versus/production/projectiles-wave-d-2026-11-24.json). Les prompts, chemins, références et mesures détaillées restent dans ces manifestes. Cette revue n’a lancé aucun nouveau test ni aucune génération et n’a modifié aucun asset, registre ou style. La QA globale chiffrée relève du rapport de livraison.

## Personnages : preuves et écarts

### Katie Killjoy et Tom Trench

La référence exploitable est une [photographie de cartes publiée par un vendeur](https://www.ebay.com/itm/196417285564), dont les identités et numéros sont corroborés par la [checklist officielle](https://hazbinhotel.com/products/hazbin-hotel-trading-cards-official-checklist) : Katie 24/50 et Tom 43/50. La photographie reste une source visuelle hébergée secondairement ; la checklist n’apporte pas de modèle entier. Les échantillons du clip officiel *Stayed Gone* examinés lors de la production n’ont pas fourni de détail positif supplémentaire de ces personnages et ne sont pas présentés comme cette preuve.

Les planches retenues conservent les repères principaux visibles : coiffure blonde, yeux rouges, long cou, bijoux et veste rose-rouge de Katie ; coiffure blonde, construction du masque à gaz, veste bleu-gris et cravate rouge de Tom. La silhouette et la tenue restent reconnaissables d’une pose à l’autre. Les mains, expressions et gestes changent pour les besoins du jeu.

**Le bas du corps des deux personnages est reconstruit.** La jupe, la longueur et la forme des jambes, les chaussures de Katie, ainsi que le pantalon et les chaussures de Tom ne sont pas établis par cette référence partielle. Les proportions exactes, détails de coupe et couleurs de ces zones ne peuvent donc pas être validés comme canoniques. Une photographie de carte ne suffit pas non plus à certifier la palette au pixel près.

Tom a reçu une correction de qualité pour orienter le personnage entier vers la droite. Le premier candidat orienté vers la gauche est consigné comme remplacé et n’est pas l’export retenu ; cette correction n’est pas une reprise après refus de sécurité. La petite pochette rouge visible sur la carte n’est pas visible sur le READY sélectionné, et les trois variantes suivent ce même dessin de base. C’est une différence de détail qui demeure, même si la cohérence interne du set est bonne.

Les anciens portraits ont servi à comparer l’existant, pas à justifier les nouveaux modèles : leurs défauts connus ne constituent pas une autorité visuelle. Une référence primaire entière de la version série reste nécessaire pour fermer la reconstruction des deux modèles.

### Mammon : forme normale et placement

Le [standee officiel SpindleHorse/Shark Robot](https://sharkrobot.com/products/mammon-standee-2) fournit une référence entière, corroborée par des images échantillonnées de [*Mammon’s Magnificent Musical Mid-Season Special*, S2E7](https://www.youtube.com/watch?v=rRymSi8SmqA). La version retenue est sa **forme normale contemporaine, large, à quatre bras**, avec costume étagé vert/noir/or, courtes jambes pâles et coiffe à trois pointes. La forme démoniaque allongée et la silhouette mince de flashback ne sont pas les modèles de cette vague.

La planche des quatre poses conserve ces repères et montre quatre bras dans chaque dessin. Les accessoires de présentation du standee et son socle ne sont pas repris ; les gestes et positions des mains sont des adaptations. Le dessin du costume, la répartition des motifs et les expressions ne font pas l’objet d’une correspondance image par image avec l’épisode.

La planche de placement montre une mise à l’échelle **uniforme de 1,4**, qui préserve la largeur du corps. Dans cette reconstruction statique, les contacts des chaussures rejoignent la ligne de sol après correction, alors que l’image précédente flottait. Le manifeste consigne un écart de 26,54 px avant et de 0 px après dans cette composition précise. Cela ne prouve pas le contact pendant toutes les animations ou dans tous les formats du rendu réel.

Le personnage reste très large : les mesures consignées indiquent des marges natives visibles d’au moins 4 px au seuil alpha retenu. Les poses inspectées ne présentent pas de contour coupé dans leur fichier. Les débordements au bord de l’arène, le chevauchement avec un adversaire et le contact des pieds en transition restent à vérifier dans le jeu.

### Stella : absence explicite

La production disposait d’un [standee officiel](https://sharkrobot.com/products/stella-standee-1) et d’images échantillonnées de [*The Circus*, S2E1](https://www.youtube.com/watch?v=_spuxXnul0U). L’unique tentative READY a subi un refus de modération en sortie, catégorie générique `other`. Le manifeste ne permet pas d’en déduire une cause plus précise.

**Aucune reprise n’a été effectuée.** Garde, frappe et recul n’ont pas été tentés après ce refus. Le bilan est donc **un appel refusé et quatre poses demandées non livrées**, sans image candidate produite pour Stella dans cette vague. Le rendu standalone utilise désormais son **portrait historique intact à titre provisoire**, sans le compter comme une nouvelle READY dédiée. Ce repli ne ferme pas l’absence des quatre poses.

### Anciennes banques défectueuses et repli provisoire

La revue indépendante des anciennes banques a signalé les défauts suivants à l’intégrateur. Les indices de lignes et de colonnes ci-dessous commencent à zéro ; ils identifient les cellules historiques concernées et ne décrivent pas les nouveaux fichiers individuels.

| Personnage | Banque et ligne | Défauts signalés |
| --- | --- | --- |
| Stella | `helluva-powers`, ligne 3 | Cellules contaminées ou tronquées : `movement` C0, C1, C3, C5 ; `offense` C0, C2, C4, C5 ; `reaction` C0 à C5. |
| Mammon | `helluva-rivals`, ligne 0 | Cellules contaminées ou tronquées : `movement` C0, C1, C3, C5 ; `offense` C0, C2, C4, C5 ; `reaction` C0 à C5. |
| Katie et Tom | `family-media`, lignes 2 et 3 respectivement | Proportions courtes, aplats magenta et tête tronquée ou débordante dans les anciennes banques. |

Le rendu standalone a été corrigé pour éviter de réafficher ces cellules entre les poses propres. Pour Katie, Tom et Mammon, les états non couverts se replient provisoirement sur les quatre poses individuelles disponibles ; les intros et finitions utilisent leur READY. Stella se replie sur `/assets/sprites/helluva/portraits/hb_stella.png`. La sélection est explicitée dans [infernal-appearances.ts](../../src/lib/infernal-appearances.ts) et appelée avant le recours aux banques dans [PentagramLiveFight.tsx](../../src/components/PentagramLiveFight.tsx).

**Ce correctif ne produit aucune image ni aucun cycle supplémentaire.** Déplacements, sauts et états cinématiques peuvent afficher une silhouette fixe déplacée par le moteur ; les réactions et attaques réemploient les quelques poses disponibles. Le portrait de Stella reste une présentation statique. Ce repli écarte les cellules historiques connues comme défectueuses sans certifier la fluidité, le détail de chaque mouvement ou la fidélité intégrale des quatre personnages. Les banques sources n’ont pas été redessinées par ce correctif.

Les registres demeurent à **37 READY dédiées, 40 jouables, 22 arènes et 377 références**. Le portrait provisoire de Stella ne s’ajoute pas aux READY dédiées et les réemplois de poses n’augmentent pas le nombre de dessins produits. Ces comptes décrivent l’inventaire annoncé par l’intégrateur, pas un nouveau résultat de test.

## Trois arènes : état retenu et adaptations

| Arène | Référence et état | Composition retenue et limites |
| --- | --- | --- |
| `western-lair` | [*Western Energy*, S2E4](https://www.youtube.com/watch?v=KJy7T24rhg0), repaire intact avant l’accident du van. Les images inspectées sont des reprises de plans de l’épisode, notamment [Cartoon Base](https://x.com/TheCartoonBase/status/1792726254031982700) et [IMDb](https://www.imdb.com/title/tt27786887/), et non des fichiers de production primaires. | Roches anguleuses bleu-gris, parois mauves, rails sur traverses rouges et petits points lumineux cyan. Le fond réserve un large sol frontal ajouté pour le combat. Prop médian : radiocassette gris/rose, dont les petits contrôles sont interprétés depuis une référence réduite. Prop proche : section finie de rails, redressée, isolée et déplacée. L’absence des occupants, chaînes, statue et dégâts est un choix de composition. |
| `goetia-court` | [*Mastermind*, S2E11](https://www.youtube.com/watch?v=IoVB5Hn2m_k) et fonds `211_00004`, `211_00005`, `211_00006` du [portfolio de production de Jasper Luu](https://jasperluu.com/helluvaboss). | Tribunal infernal, sans implication qu’il appartiendrait exclusivement aux Goetia malgré l’identifiant interne. Gradins cramoisis/violets, trônes, yeux à fente, braseros suspendus et gouffre orange reprennent les motifs observés. Une large terrasse de combat est ajoutée au premier plan. Prop médian : tribune flottante pointue ; prop proche : balustrade à deux panneaux, avec motifs pomme/serpent simplifiés. Échelle, séparation et emplacement sont AU. |
| `hh-heaven-gates` | [Clip officiel Prime Video Philippines](https://www.youtube.com/watch?v=RFiEU6ZXyWg), *Welcome to Heaven*, S1E6 ; [colorkey publié avec crédit Prime Video/A24 par VFX Voice](https://vfxvoice.com/checking-into-hazbin-hotel-to-check-out-the-animation/). Portes intactes et fermées avant l’entrée, sans reprise d’un état de saison 2. | Double portail doré, éventails/plumes, ovales, emblèmes oculaires, piliers solaires et nuages pastel. L’approche réfléchissante est élargie pour le jeu. Prop médian : pupitre bleu pâle facetté à couronne dorée ; prop proche : clôture courte à cinq pointes. Les facettes, le nombre d’arcs, les épaisseurs et le placement sont interprétés. Le colorkey est une référence de production, pas une preuve que chaque détail a été conservé dans le plan diffusé. |

Les compositions statiques 1200 × 520 et 300 × 300 ont été inspectées ; le cadrage final a également été accepté par l’intégrateur. Le sol reste lisible et les props sont éloignés du centre. Le pupitre du Paradis a été réduit pour préserver cette lecture. Les six props sont carrés et leur réduction proportionnelle conserve leur forme.

Le choix `contain`, ancré en bas et au centre, conserve les motifs d’architecture entiers. Il produit des **bandes latérales teintées dans les formats larges et une bande supérieure dans les formats étroits**. Ces bandes sont un compromis de cadrage explicite. Les plans ne reproduisent pas exactement la caméra ou la géographie des épisodes.

La projection numérique consignée couvre trois tailles et trois positions de parallaxe. Elle place les silhouettes des props dans le cadre au seuil alpha 16, avec une marge minimale mesurée de 2,659 px. Les franges alpha 1 à 15 sont conservées et peuvent dépasser cette silhouette mesurée. Le plan médian reste derrière les combattants ; le plan proche passe devant eux et peut donc les masquer près des bords. Ni toutes les occlusions pendant le combat ni l’ancrage des pieds des personnages ne sont certifiés par cette revue de décors.

## Cinq VFX et réemplois

Les cinq effets sont lisibles sur la planche à fonds sombre et clair. Le portail garde un centre transparent ; le rayon conserve une silhouette fine, et les fumées/rubans restent des formes isolées. Cette inspection ne valide ni leurs attaches aux personnages ni leur rythme dans le jeu.

| Nouveau dessin | Preuve visuelle utilisée | Adaptation et limite |
| --- | --- | --- |
| `husk-card` | [*Loser, Baby*, vers 128 s](https://www.youtube.com/watch?v=9sVoglgJjRg&t=128s) : carte rouge à bord sombre et trèfles noirs ; [combat, vers 182 s](https://www.youtube.com/watch?v=eGlaDpnbCPM&t=182s) : petites cartes rectangulaires lancées. | Motif musical appliqué à une carte isolée en vol de trois quarts pour `light` et `special`. La face exacte de toutes les cartes lancées, leur rang et leur enseigne ne sont pas établis. |
| `adam-light` | [Combat Adam/Lucifer, vers 270 s](https://www.youtube.com/watch?v=U3Q9MEsqnkY&t=270s) : rayon droit, cœur blanc, bord jaune. | Rayon rendu horizontal avec extrémité arrondie pour `heavy`. Longueur, orientation et durée suivent le coup du jeu. |
| `stolas-portal` | [*Truth Seekers*, vers 1230 s](https://www.youtube.com/watch?v=yXErLiSbxXQ&t=1230s) : lobes lavande/blanc, bords violet/bleu, petites lumières ; aucune rune visible dans l’échantillon. | Pourtour ovale complet reconstruit, centre transparent, effet de `heavy`. Aucun déplacement par téléportation n’est ajouté. |
| `asmodeus-smoke` | [*Ozzie’s*, vers 580 s](https://www.youtube.com/watch?v=8zyGQquL8VM&t=580s) : nuages d’entrée cyan, contours menthe, ombres violettes. | Fumée de scène condensée en une plume pour `special`. Son emploi comme accent d’attaque, sa taille et son mouvement sont AU ; la source n’établit pas un projectile de flammes. |
| `beelzebub-ribbon` | [*Queen Bee*, vers 300 s](https://www.youtube.com/watch?v=D-2799Y07Zc&t=300s) : rubans dorés/jaunes à extrémités arrondies. | Courbe isolée utilisée pour `heavy`. La matière n’est pas déduite du seul plan ; l’effet ne prouve pas l’existence d’un projectile de miel infligeant des dégâts. |

Les références vidéo de VFX sont des images échantillonnées, généralement à 320 × 180. Elles soutiennent les motifs décrits, sans examen continu de l’animation. Les effets sont des surcouches des coups existants : portée, dégâts, collisions et fenêtres temporelles restent ceux du moteur. Aucune entité projectile indépendante n’est créée par ce lot.

Le fichier existant `moxxie-bullet.webp` est réemployé pour Angel Dust (`heavy`, `special`), Blitzø (`heavy`, `special`) et Striker (`heavy`) : **un fichier partagé, cinq associations de coups, zéro nouveau dessin**. Les références de [combat d’Angel Dust](https://www.youtube.com/watch?v=eGlaDpnbCPM&t=186s), de [*Truth Seekers*](https://www.youtube.com/watch?v=yXErLiSbxXQ) et de [*The Harvest Moon Festival*](https://www.youtube.com/watch?v=h2ZmVAdezF8&t=820s) étayent l’usage d’armes à feu. Elles ne résolvent pas une silhouette propre à chaque munition. Le fusil décoré de Striker ne justifie pas, à lui seul, une couleur ou une forme spéciale de balle angélique. Ce partage reste une convention visuelle AU.

### Lucifer différé

`lucifer-flame` n’a fait l’objet d’aucune tentative de génération. Les trois références officielles échantillonnées ([première](https://www.youtube.com/watch?v=U3Q9MEsqnkY&t=295s), [deuxième](https://www.youtube.com/watch?v=1Sd5OhC916I&t=410s), [troisième](https://www.youtube.com/watch?v=yzLnk2W0qN4&t=8s)) montrent, selon l’audit consigné, une flamme de couronne, une flamme fugace près d’un poing et du feu de scène. Elles ne résolvent pas assez nettement un effet autonome séparé. Aucun sixième dessin n’a été fabriqué ou compté. Une référence primaire plus précise de l’effet recherché reste nécessaire.

## Ce qui reste à vérifier

1. **Modèles de Katie et Tom :** obtenir une référence primaire entière de la version série, confronter jambes, chaussures et proportions, puis trancher les détails de tenue encore différents, dont la pochette de Tom.
2. **Absences :** conserver Stella comme quatre poses non livrées et Lucifer comme effet différé. Cette revue ne demande aucune reprise automatique du refus et ne substitue aucun asset générique à ces manques.
3. **Rendu réel :** vérifier le repli statique des quatre nouveaux jouables pendant les déplacements, sauts, intros et finitions, puis Mammon aux bords et dans les transitions, les contacts des pieds, le retournement des poses, les occlusions des props et les bandes de cadrage dans les formats effectifs. Les cellules historiques défectueuses restent à remplacer par de vrais cycles si une animation complète est visée. Les compositions consultées sont des reconstructions statiques, jamais des captures navigateur.
4. **Effets en action :** examiner les points d’émission, les directions, la durée et la lisibilité des cinq nouveaux VFX et des réemplois, en regard des collisions déjà présentes. La cohérence d’un fichier isolé ne garantit pas celle du coup animé.
5. **Fidélité restante :** comparer les détails de costumes, les motifs architecturaux et les effets à des références plus définies. Les gestes, sols, placements et dimensions adaptés au combat restent explicitement AU, même après une éventuelle validation technique.

Les manifestes consignent la préservation des PNG et les comparaisons de pixels des WebP. Pour les props de scène, l’égalité porte sur la cible redimensionnée proportionnellement ; les miniatures sont des dérivés. Ces contrôles établissent l’intégrité des exports, pas leur fidélité canonique. Ils n’ont pas été relancés pour ce rapport.

## Planches consultées

Dans `/workspace/scratch/eed3bf2e772a/qa-infernal-wave-d-20261124/` :

- `characters/hz_katie_killjoy-four-poses-review.jpg`, `characters/hz_tom_trench-four-poses-review.jpg`, `characters/hb_mammon-four-poses-review.jpg` ; comparaison avec la photographie de cartes et le standee officiel de Mammon.
- `mammon-placement-review.jpg` : comparaison géométrique avant/après.
- `stage-composites-review.png`, `props-alpha-review.png`, `hh-heaven-gates-1200x520-static.png` et `hh-heaven-gates-300x300-static.png` : compositions finales et transparence des props.

La planche VFX consultée est `/tmp/infernal-wave-d-projectiles/projectiles-alpha-preview.jpg`. Ces fichiers de travail situent l’inspection ; ils ne constituent pas une recette du rendu en navigateur.
