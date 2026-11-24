# Revue ciblée des assets — 24 novembre 2026

## Périmètre

Lecture du diff d’intégration, du sélecteur de poses, des styles de combat, des registres et des métadonnées alpha. Inspection des deux composites statiques de décors dans `qa/` et de l’atlas `public/assets/sprites/sheets/heaven.png`. Aucun navigateur ni capture du jeu n’a été utilisé pour cette revue.

## Problèmes corrigés

### Accessoires de Beelzebub et Stolas

Les deux nouveaux stages héritaient des positions génériques de `src/styles/pentagram-arena.css`. Le tabouret de Beelzebub recevait notamment `top: 1%; left: -4%`, ce qui le suspendait en haut à gauche.

Des règles dédiées ont été ajoutées dans ce seul fichier CSS :

- Stolas : balustrade au fond à gauche ; bannière suspendue près du bord droit.
- Beelzebub : sculpture à trois anneaux au fond à gauche ; tabouret au sol à droite.
- Les props médians sont à `z-index: 1`, derrière les combattants (`2`) ; les accessoires proches restent devant (`3`).
- Les dimensions sont contraintes avec `object-fit: contain`. Les marges transparentes des PNG sont prises en compte dans les positions au sol.
- La grille et les lumières génériques sont masquées pour ces deux environnements déjà illustrés.

Le calcul des bornes visibles, pour des arènes de 300 × 300, 720 × 430 et 1200 × 520 pixels, place les bases des props médians à environ 81 % de la hauteur et le pied du tabouret à 96–98 %. La bannière reste dans la partie haute droite. Ce calcul vérifie la géométrie CSS ; il ne remplace pas une observation du jeu.

La marge minimale droite du tabouret a été portée de 28 à 32 pixels pour corriger sa coupure à petite largeur. À 300 pixels de largeur et au déplacement maximal de parallaxe de 47,4 pixels, son bord visible droit atteint 297,74 pixels : il reste donc 2,26 pixels dans le cadre. La marge calculée atteint 30,02 pixels pour une arène de 720 × 430 et 62,69 pixels pour 1200 × 520. Toutes les bornes visibles calculées restent contenues aux dimensions examinées.

### Continuité de Lute

La nouvelle attente montre Lute S1, non masquée, avec deux bras normaux. L’atlas historique `heaven.png`, dernière ligne, conserve un bras doré dans plusieurs cellules. Or `infernalActionPose` retombe sur les banques historiques pendant les actions sans dessin individuel : activer cette nouvelle attente aurait fait alterner les apparences pendant le combat.

Lute a été retirée du registre actif par l’intégrateur. Le PNG et le WebP restent livrés comme candidat non branché ; le manifeste support comporte un champ `integration` qui explique cette décision. L’absence de Lute dans les appels actifs à `readyPose` a été vérifiée.

## Limite visuelle restante : ancrage vertical des personnages

La règle portrait de `src/styles/infernal-authored-poses.css` contient correctement l’image entière et son sélecteur est plus spécifique que la règle paysage. Aucun recadrage interne des portraits n’est introduit.

En revanche, le pivot reste le bas du **canevas**, avec un décalage commun de `bottom: -3%`, et non le bas de la silhouette. Les marges transparentes inférieures diffèrent : environ 9,1 % pour Emily contre 1,0 % pour Zestial et Rosie. À une hauteur d’image de 310 pixels, cela représente environ **25 pixels d’écart entre les bas visibles** malgré une même ligne de combat.

Il reste donc un risque concret de pieds ou de robes qui paraissent flotter, et de saut d’ancrage au passage vers une banque d’animation. Aucun correctif global d’ancrage n’a été appliqué dans cette revue ; une validation en jeu doit déterminer les éventuels ajustements par asset.

## Registres et fichiers

Les deux IDs sont présents dans `STANDALONE_STAGES`, dans le type de stage et dans le parcours utilisé par le sélecteur standalone. Les huit fichiers déclarés pour ces deux stages — fonds, deux props et miniatures — existent. Les 24 appels actifs à `readyPose` examinés pointent tous vers un WebP existant.

Les miniatures utilisent le cadrage `cover` déjà prévu par le sélecteur ; leurs chemins correspondent aux exports fournis. Aucun lien manquant ni inversion de couche n’a été trouvé sur ce périmètre.

`git diff --check -- src/styles/pentagram-arena.css` réussit. Les tests globaux et la validation réelle en jeu relèvent de l’étape d’intégration.
