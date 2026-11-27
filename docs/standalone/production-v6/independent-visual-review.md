# Revue visuelle indépendante — six bases Helluva Boss V6

## Conclusion initiale

Les six PNG ont des silhouettes complètes et reconnaissables par rapport à la planche nommée de CalisDraws. Deux bases nécessitent des corrections ciblées : **Apple** et **Milky**. Josh, Coco et Kiki présentent de petits écarts de détail ; aucun écart majeur n’a été identifié parmi les attributs contrôlés de Kat. **Aucune des six bases n’est certifiée fidèle 1:1.**

La validation de silhouette et de transparence est distincte de la fidélité au dessin. Cette revue n’inclut pas de validation en jeu ni de nouvelle capture de navigateur.

## Référence et méthode

La source d’identité est la planche nommée attribuée à [CalisDraws](https://twitter.com/CalisDraws/status/1355948687814520837), dont le texte de publication est confirmé par l’[oEmbed public](https://publish.twitter.com/oembed?url=https://twitter.com/CalisDraws/status/1355948687814520837). Le bitmap de travail est une [copie secondaire](https://static.zerochan.net/Helluva.Boss.full.3210579.jpg). Les silhouettes correspondent de gauche à droite à Josh, Coco, Apple, Kat, Milky, Kiki, puis Ace. Les limites de provenance et les SHA-256 sont consignés dans le JSON associé.

Chaque PNG a été comparé à la planche sur fond gris neutre, après application de son alpha. Ce procédé rend les ailes et autres détails noirs visibles. Les halos de couleur des aperçus RGB bruts disparaissent à la composition alpha. Les corps ont des valeurs alpha 253–254 déjà signalées par le producteur ; aucun fichier image n’a été modifié par cette revue.

## Écarts observés dans la version initiale

| Base | Attributs principaux contrôlés | Écarts concrets | État initial |
| --- | --- | --- | --- |
| Josh | Cheveux asymétriques, cornes, croix, T-shirt imprimé, ailes, queue rouge et noire, pantalon et pieds | Petit croc absent de la bouche fermée ; côté rasé quadrillé au lieu de hachures simples | Réserve mineure |
| Coco | Afro, petites cornes, crâne du haut violet, résille, short bleu, bottines, ailes et queue | Short avec poches et ourlets ajoutés ; taille presque droite au lieu de découpe en V ; ailes plus arquées | Réserves mineures |
| Apple | Cheveux blonds, cornes roses/noires, salopette grise, pendentif, ailes, talons, mollet marqué | Bracelets du poignet omis ; pointe de queue simplifiée et privées de ses prolongements noirs ; motif du mollet réinterprété en deux ronds clairs et boucle noire | **Correction ciblée requise** |
| Kat | Cheveux sombres hauts, cornes noires, haut à capuche, pantalon à revers, queue noire, ailes et pieds | Pose neutre bras baissés à la place d’une main sur la hanche ; aucun écart majeur identifié sur les attributs vérifiés | Pas d’écart majeur identifié, sans certificat 1:1 |
| Milky | Silhouette courte et ronde, cheveux et cornes noirs, haut asymétrique, short déchiré, cuissardes, queue | Manche noire ajoutée sur le bras gauche de l’image alors que ce bras est nu sur la planche | **Correction ciblée requise** |
| Kiki | Cheveux bleu gris, croix, résille et cœurs noirs, taille haute, bottes asymétriques, queue rose/noire | Petits marquages noirs aux bases roses des cornes simplifiés ; découpe et coutures basses du short/corset légèrement différentes | Réserves mineures |

Aucun membre, corne, aile ou bout de queue n’est visuellement coupé dans les six fichiers inspectés. Les limites de silhouette à alpha ≥ 16 restent à l’intérieur des cadres. Ce contrôle ne transforme pas les réserves de détail en validation canonique.

## Version finale des personnages

Les deux retouches natives ont été inspectées séparément puis comparées par SHA-256 aux masters intégrés. Les fichiers intégrés sont identiques octet pour octet aux sorties examinées. Les quatre autres masters sont inchangés par rapport à la revue initiale.

| Base retouchée | Correction constatée | Réserve restante |
| --- | --- | --- |
| Apple | Bracelets ajoutés au bon poignet et prolongements noirs de la pointe de queue rétablis | **Le motif du mollet reste différent** : deux ronds clairs et boucle noire au lieu du motif irrégulier de la planche. La base est améliorée, sans fidélité 1:1 certifiée. |
| Milky | Bras gauche de l’image nu et rouge ; manche droite conservée | L’écart ciblé est corrigé. Aucune régression majeure observée sur les éléments contrôlés ; aucune certification 1:1. |

Les réserves mineures de Josh, Coco et Kiki restent présentes. Kat demeure sans écart majeur identifié parmi les attributs contrôlés. Les six silhouettes restent complètes ; ce constat est distinct d’une validation canonique ou d’une validation en jeu.

## Bureau de Vox S2 — revue supplémentaire

La première sortie conserve le V mural, le bureau cyan angulaire, les panneaux électroniques et l’aquarium avec coraux. Elle ne reprend ni le foil ni le cadre de la carte de référence. Elle inverse toutefois les places : le fauteuil Vox est derrière le bureau et les visiteurs devant, alors que la vue officielle depuis l’aquarium place le fauteuil Vox côté caméra, vu de dos. Cette inversion fait l’objet de la retouche décrite ci-dessous.

Le cadrage horizontal, le grand sol libre et son carrelage sont des adaptations pour le combat. Les panneaux de fond uniformisés et les chaises visiteurs plus angulaires constituent des simplifications. Cette scène devra rester qualifiée de **bureau intérieur S2 adapté pour le combat**, sans certification 1:1 de l’architecture entière de la tour.

### Version finale du décor

La sortie corrigée place maintenant le fauteuil pointu de Vox côté caméra, vu de dos, avec les deux chaises visiteurs de l’autre côté du bureau. **L’inversion de disposition est corrigée.** Le V mural, les bords cyan du bureau, les panneaux électroniques et l’aquarium avec coraux sont conservés.

Le master intégré est identique octet pour octet à la sortie inspectée, SHA-256 `7bb2f5860c76ccf3bbb660aa7cb312ea7a5681b47e49ee3bc358f645a8f7644b`. Les adaptations de caméra, de sol et de détail décrites ci-dessus restent explicites. La scène est retenue comme **adaptation de combat du bureau intérieur de Vox en saison 2**, sans fidélité 1:1 certifiée et sans prétendre documenter toute la tour.

Les preuves des versions initiales et finales sont conservées dans le JSON associé. La revue de cet agent est terminée ; aucun master ni export image n’a été modifié par l’agent de revue.
