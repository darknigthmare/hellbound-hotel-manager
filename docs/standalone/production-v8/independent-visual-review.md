# Revue visuelle indépendante — Production V8

Cette revue compare des images statiques locales aux références indiquées dans les registres de production. Elle ne certifie ni une fidélité 1:1 ni le fonctionnement en jeu. Les vérifications ci-dessous ont été effectuées indépendamment de la génération.

## Ozzie’s — extérieur, saison 1

**Décision : accepté comme décor statique adapté au combat, sous réserve de la vérification en jeu.**

Image examinée : `production/v8/environment/masters/ozzies-exterior-s1-room.png`, 1672 × 941 pixels natifs. Référence examinée : `reference-work/helluva07.jpg`, 1920 × 1177, décor attribué à Greg Bartlett dans le registre de génération ([portfolio](https://backgroundart.net/helluvaboss.html), [image source](https://backgroundart.net/art/helluva07.jpg)). Les empreintes des deux fichiers figurent dans le JSON compagnon.

L’identité du lieu est bien reconnaissable : façade à droite, entrée monumentale en cœur, enseigne OZZIE’S lisible, lanternon, colonnes prune, vitrages orange, draperies rouges et or, rue bordée de néons à gauche, ciel violet/bleu et reflets de chaussée mouillée. Aucun personnage ni véhicule n’est intégré au fond.

| Point | Observation et portée |
| --- | --- |
| Cadrage et perspective | La composition est reformée en 16:9. Les dimensions de la façade, l’espacement des devantures et les fuyantes diffèrent du décor source. |
| Sol de combat | Le cinquième inférieur devient une large bande de pavés mouillés horizontale. La rue de la référence fuyait plus fortement vers le bas de l’image. C’est une adaptation de jeu explicite. |
| Bornes et cordes | Les potelets et cordons de file d’attente de la référence ont été retirés. Le futur calque séparé doit encore être examiné. |
| Détails architecturaux | Porte, marches, courbure de façade, lanternon et colonnes sont redessinés avec des proportions différentes. Les petits néons et commerces lointains sont simplifiés. |
| Rendu | Reflets et saturation sont parfois renforcés ; le résultat est plus lisse. La scène demeure cohérente comme illustration statique. |
| Définition | 1672 × 941 natifs, en deçà des 2560 × 1440 souhaités dans le prompt. Aucun master supérieur ni agrandissement de détail n’est revendiqué. |

L’entrée, la palette et les principaux repères suffisent pour qualifier ce décor comme une adaptation documentée du lieu. La comparaison ne permet pas de le présenter comme une reproduction exacte de la série. Restent à contrôler dans le jeu : contraste des combattants, hauteur du sol, recadrage, alignement des éventuels plans de profondeur et position du futur cordon.

## Costumes Helluva — Loo Loo Land

**Décision : quatre candidats statiques acceptables avec réserves de fidélité documentées.** Les PNG natifs et leur planche de contrôle sur fond gris ont été examinés, puis comparés aux vues de l’épisode [Loo Loo Land](https://www.youtube.com/watch?v=kpnwRg268FQ) conservées dans `production/v8/helluva/references/`. Les références natives ne font que 320 × 180 pixels ; elles permettent de vérifier les tenues générales, sans garantir les détails fins.

| Candidat | Correspondances vérifiées | Écarts et limites visibles |
| --- | --- | --- |
| Blitzø, bodyguard | Cornes annelées, visage rouge/blanc, lunettes, casquette souvenir, manteau sombre ; silhouette entière. | Motif/contour de casquette, pans de manteau et queue réinterprétés. Marges visibles de 23 px en haut et 16 en bas. |
| Moxxie, bodyguard | Cheveux blancs, cornes annelées, lunettes, taches faciales, nœud rouge, ceinture grise. | Panneau diagonal noir/blanc sous le nœud pouvant se lire comme une cravate ajoutée ; détail non certifiable depuis les petites références. Proportions et pose adaptées. |
| Millie, bodyguard | Coiffure noire, fines cornes, costume sombre, col/cravate, ceinture grise, silhouette complète. | Lunettes confirmées par le panneau supérieur gauche du storyboard complémentaire. Coiffure et coupe du vêtement redessinées. |
| Stolas, touriste | Chemise fleurie blanche/rouge, short rouge, casquette rouge, longues jambes et pieds aviaires. | Motif de casquette et queue agrandis, fleurs redistribuées. Marge basse de 8 px, sans coupe observée. |

Les quatre images sont des PNG RGBA de 1024 × 1536 ; l’alpha va de 0 à 254. Les fonds de couleur apparents lors d’un affichage brut ne sont pas des décors opaques : la planche de contrôle sur fond gris montre bien des silhouettes isolées. Les marges ci-dessus utilisent les pixels d’alpha au moins égal à 128, car des résidus quasi invisibles existent dans les marges. Aucun cycle d’animation ni test runtime n’est établi par cette inspection.

## Alastor humain — saison 2

**Décision : candidat statique accepté pour l’archive/incarnation existante, sans nouvelle identité.** Les trois références de contrôle (corps 2 s, visage 4 s, tenue 20 s) et une vue complémentaire des jambes à 68 s ont été examinées. Source : [clip Prime Video](https://www.youtube.com/watch?v=BqhHYxM2sQo). La sortie a été examinée sur fond blanc pour contrôler son contour transparent.

Chevelure bouclée, lunettes, sourire angulaire, teint humain, gilet bordeaux, cravate rouge et garrots de manches rendent l’incarnation identifiable. Cheveux, mains et chaussures sont entiers ; aucun attribut démoniaque n’a été ajouté. La pose, les proportions du visage/de la main et les petits détails du gilet sont adaptés. Les références sont limitées à 320 × 180 pixels.

Le PNG natif mesure 1024 × 1536, avec un alpha de 0 à 254. Les marges visibles sont de 32 pixels au-dessus et 26 en dessous : elles ne remplissent pas la marge de 7 % demandée, sans coupe observée. Aucun cycle, kit de combat ou contrôle en jeu n’a été validé par cette revue.

## Refuge Hellhound et objets des nouveaux décors

**Décision : couloir et trois objets acceptables comme illustrations statiques documentées.** Références ouvertes : les décors de production attribués à Greg Bartlett, [couloir du refuge](https://backgroundart.net/art/helluva03.jpg) et [extérieur d’Ozzie’s](https://backgroundart.net/art/helluva07.jpg).

| Image | Correspondances vérifiées | Écarts et contrôle d’intégration |
| --- | --- | --- |
| Couloir du refuge | Deux rangées de cages, néons cyan, plâtre fissuré, conduites, porte lointaine et flaques ; scène vide. | Cadrage et voie basse élargis, barreaux/conduites/reflets recomposés ; petit matériel d’entretien au fond omis. Enseigne et clipboard proche volontairement retirés. |
| Cordon Ozzie’s | Deux potelets gris à boule, bases circulaires, corde bordeaux et reflets magenta ; objet complet. | Éléments plus épais et brillants que la référence, vue plus frontale. À une échelle contenue, vérifier le contact des bases au sol et l’accord de style. |
| Enseigne du refuge | HELLHOUND ADOPTION correctement écrit sur deux lignes, empreinte jaune à quatre doigts, panneau usé et deux chaînes complets. | Lettrage, entailles et chaînes redessinés ; accrocher au plafond sans glissement relatif en parallaxe. |
| Clipboard du refuge | Support brun, pince grise, papier clair, bloc jaune et note orange oblique ; objet entier isolé. | Pince/proportions simplifiées, texte remplacé par traits ; l’accroche à la grille doit suivre le même mouvement que le mur. |

Ces objets ne sont pas des équipements jouables : leur fonction examinée est celle de plans de décor. Aucun comportement ni alignement en mouvement n’a été certifié ici.

## Vox humain — deux tenues de saison 2

**Décision : deux candidats statiques acceptés, une même identité Vox.** Les références de [Brighter](https://www.youtube.com/watch?v=GJQpBUcKhTk) ont été examinées aux instants 14/12/10 secondes pour la météo et 58/62/66 secondes pour le talk-show, puis comparées aux sorties sur fond blanc.

La version météo conserve le costume brun, la chemise claire, la cravate sombre et la petite broche. Le talk-show conserve la veste bleu-vert claire, les revers et le pantalon plus foncés, le nœud papillon et les boutons noirs. Les deux montrent une chevelure sombre à mèche claire, des lunettes rectangulaires, une silhouette humaine complète et des chaussures lisibles.

Pose, proportions de la chevelure/du visage et coupe fine des vêtements sont des adaptations. Les sources natives 320 × 180 ne permettent pas de certifier petits contours, broche ou boutons. Les marges verticales sont serrées, sans coupe visible. Les données alpha et empreintes sont conservées dans le JSON ; aucune nouvelle identité, animation ou validation de kit de combat n’est déduite de ces deux illustrations.

## Millie — STAFF, Ghostf**kers

**Décision : candidate de costume statique acceptable, contrôle en jeu restant à effectuer.** Les plans de l’épisode [Ghostf**kers](https://www.youtube.com/watch?v=5DV4IIKwqRI) à 400/580/770/1480 secondes ont été comparés à la sortie sur fond gris. Bonnet violet à revers jaune, cheveux noirs, visage rouge aux yeux jaunes, haut court STAFF, pantalon violet à revers jaunes et bottines sombres rendent la tenue identifiable. STAFF est lisible, la silhouette est complète, aucune corne supplémentaire n’est sortie du bonnet.

Pose, largeur du pantalon et petits détails du bonnet/visage sont adaptés. Les références natives 320 × 180 ne suffisent pas à certifier les détails fins. Une pose entière n’équivaut pas à un cycle animé.

## Emily — six ailes déployées, saison 2

**Décision : variante statique de galerie acceptable, hors sélection de costume de combat.** Les trois vues de contrôle [à 200, 195 et 235 secondes](https://www.youtube.com/watch?v=c56SWmqnU5E&t=200s) ont été comparées à la sortie sur fond blanc.

Six ailes se distinguent effectivement en trois paires. Halo, chevelure, visage, robe courte et motif du bas correspondent à la forme documentée. Une seule silhouette complète est représentée en suspension ; mains, pointes des ailes et pieds sont visibles. Les plumes, proportions, ourlet et geste sont redessinés ; les marges supérieures sont serrées. Les petites références ne permettent pas de certifier chaque plume ou contour.

Cette forme est rattachée à Emily, sans nouvelle identité. La posture en vol et l’envergure ne constituent pas une validation de son alignement ni de ses collisions en combat.

## Candidat retenu hors livraison — Bethany

**Décision : ne pas exporter ni rendre équipable en l’état.** Le haut du costume, la perruque tressée et le chapeau sont reconnaissables. En revanche, les deux jambes à répartition lilas/rouge asymétrique et les grandes bottes de la sortie ne sont pas suffisamment établies par les preuves examinées. La vue entière de l’épisode est petite et en mouvement ; le plan assis tardif coupe les pieds ; la référence de produit dérivé est un gros plan du haut.

Le PNG candidat reste disponible pour reprise, mais il ne compte pas parmi les dessins livrés. Une vue primaire complète et plus lisible du bas de cette même tenue doit être comparée avant de qualifier le costume entier. Ce constat est une lacune de référence, distincte d’un refus du générateur.

## Vérification des pixels et sources

Les exports d’Alastor humain, des deux Vox humains, d’Emily six ailes et de Millie STAFF ont été ouverts avec leurs PNG natifs. Tous les octets RGBA décodés sont identiques, y compris les canaux RGB masqués par un alpha nul. Les dimensions et les empreintes des exports contrôlés sont enregistrées dans le JSON. Les références locales des candidats acceptés disposent également de dimensions et empreintes enregistrées ; aucun fichier source n’a été modifié par cette revue.

## Derniers costumes — Harvest Moon Festival et Apology Tour

**Décision : quatre costumes statiques acceptables, dont la version corrigée de Blitzø Harvest.** Les références de [Harvest Moon Festival](https://www.youtube.com/watch?v=h2ZmVAdezF8) et [Apology Tour](https://www.youtube.com/watch?v=tLD-OUkYtk4) ont été ouvertes et comparées aux sorties. Les produits dérivés cités dans les registres servent de corroboration de costume ; ils ne remplacent pas les plans de l’épisode.

| Costume | Revue et limites |
| --- | --- |
| Blitzø, Harvest | Version corrigée examinée : croix rouges ajoutées au visage et marques sur les manches retirées. Chemise retroussée, bretelles, pantalon, chaussures, cornes et queue cohérents. Marques de peau et proportions fines adaptées. Le premier essai ne compte pas comme un dessin supplémentaire. |
| Millie, Harvest | Bandana, haut noir, short et bottines reconnaissables ; figure complète sans chapeau ni pantalon long ajouté. La pose assise de l’épisode est adaptée en station debout ; le pin corrobore uniquement le haut. |
| Stolas, vampire | Haut-de-forme à motif doré, petits yeux supérieurs, col/cape bordeaux, gemme et jabot cohérents ; jambes, pieds et queue entiers, corroborés par le standee. Plumes et ouverture de cape redessinées. |
| Blitzø, fantôme | Drap blanc taché de rouge, ouverture et visage identifiables, ourlet entier. Cornes, jambes, pieds et queue restent cachés sous le costume comme dans la source. Plis et taches recomposés. |

Les neuf costumes Helluva acceptés ont désormais été contrôlés sur leurs exports finaux : dimensions identiques et égalité de tous les octets RGBA décodés avec les PNG natifs, y compris les RGB invisibles. Les sources d’épisode restent majoritairement des images 320 × 180 ; aucune correspondance exacte de contour ni animation n’est certifiée.
