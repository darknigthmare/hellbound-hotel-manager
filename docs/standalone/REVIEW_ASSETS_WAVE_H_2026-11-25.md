# Revue artistique — vague H du 25 novembre 2026

## Périmètre livré

Cette vague complète uniquement des images statiques réellement absentes : **quatre bases de personnages, deux fonds d’arène et quatre accessoires séparés**. Chaque dessin possède son propre PNG et son WebP sans perte. Les deux fonds possèdent aussi une miniature dérivée. Cela représente **10 dessins et 22 fichiers de production**, hors images de contrôle.

Les personnages restent en réserve : aucune nouvelle identité n’est ajoutée aux 43 combattants jouables. Aucun cycle d’animation, pose d’attaque, kit de combat, histoire, affectation de projectile ou contenu audio n’est créé. Les deux décors utilisent des partitions originales déjà présentes dans le projet.

## Bases de personnages

| Base | Repérage officiel | Détails observés et limites |
| --- | --- | --- |
| Paimon | [The Circus, S2E1](https://www.youtube.com/watch?v=_spuxXnul0U), aperçus vers 01:30–02:10 | Couronne, masque facial, haute silhouette, col, cape bordeaux et doublure dorée. Les pieds et des détails inférieurs s’appuient aussi sur le portrait historique du projet. |
| Cash Buckzo | The Circus, aperçus et portrait historique renseignés dans le manifeste | Masse des cornes, chevelure, gilet et silhouette. Extrémité de queue et petits détails de costume partiellement renseignés par le portrait historique. |
| Joe | The Harvest Moon Festival, S1E5 ; URL et repères exacts dans le manifeste | Cornes rayées, cheveux et moustache blancs, visage, vêtement de travail et motif du bras. Une seule base neutre, sans mouvement. |
| Lin | The Harvest Moon Festival, S1E5 ; URL et repères exacts dans le manifeste | Cornes, cheveux gris, chemise, foulard, pantalon et marques claires. Proportions et détails fins contrôlés avec le portrait historique. |

Les quatre silhouettes sont entières. Leurs bords ne contiennent aucun pixel d’alpha supérieur à 16. Les canevas et leur alpha d’origine sont conservés ; aucun redessin, détourage automatique, changement de couleur ou recadrage de master n’est réalisé pendant l’export.

Ces poses sont proches d’un trois-quarts frontal. Elles ne constituent pas des banques de déplacement ni une validation de leur future orientation en combat. L’échelle relative des personnages de la planche de contrôle est illustrative ; elle ne fixe pas leur taille dans le moteur.

## One Star Wonder · Couloir

Référence : [Ghostf**kers, S2E10](https://www.youtube.com/watch?v=5DV4IIKwqRI), aperçus publics officiels vers **08:10, 09:10 et 10:00**.

Le fond reprend le papier peint bordeaux, les lambris olive, la porte entrouverte, le groupe de cadres et la moquette. Le chariot de linge et l’applique crème sont fournis dans deux images transparentes distinctes, puis positionnés dans le repère du fond. Ils ne sont pas également peints dans celui-ci.

La perspective est aplanie et la largeur du couloir augmentée pour laisser une piste de duel. Les motifs fins du tapis, le contenu des tableaux, les plis du linge et certaines dimensions de l’applique sont reconstruits depuis des aperçus de faible définition. Il s’agit d’une adaptation du lieu pour le jeu.

## Apology Tour · Salle de fête

Référence : [Apology Tour, S2E9](https://www.youtube.com/watch?v=tLD-OUkYtk4), aperçus publics officiels vers **12:40, 13:10, 13:20 et 17:30**.

Le décor représente la salle réelle avec scène, rideaux roses, galerie et éclairage violet. Le néon fantôme est placé à droite ; la boule à facettes cyan est suspendue à gauche. Les deux accessoires restent indépendants du fond. Le décor imaginaire du numéro musical n’est pas utilisé comme référence de lieu.

La salle est vidée et le sol devant la scène élargi. La symétrie, les marches et certains petits motifs sont adaptés. Les sources permettent d’identifier le lieu et ses éléments distinctifs, mais pas de certifier la géométrie de chaque détail.

## Références et fidélité

Les prévisualisations officielles inspectées mesurent **320 × 180 pixels par cadre**. Les URL, repères temporels approximatifs et empreintes des fichiers examinés figurent dans les manifestes. Les portraits historiques du dépôt sont explicitement identifiés comme compléments dont la provenance officielle n’est pas certifiée.

**La fidélité 1:1 reste l’objectif artistique ; elle n’est pas certifiée pour cette livraison.** Une pose neutre reconstruite, des zones cachées et le cadrage élargi d’une arène ne permettent pas de prétendre à une copie exacte du plan animé. Les différences connues sont documentées par asset.

## Demandes bloquées et éléments différés

Le générateur a refusé **Clara Carmine, Odette Carmine, Deerie et Loopty Goopty**. Pour chaque identité, une requête a retourné `moderation_blocked` en sortie, catégorie `other`, sans motif plus précis. Aucun fichier n’a été produit et aucune requête n’a été relancée après le refus. Les identifiants de requête et prompts originaux sont conservés dans le manifeste personnages et son registre de prompts.

Le dé de Husk et la grenade I.M.P. ont fait l’objet d’un repérage supplémentaire. Les vues inspectées ne résolvent pas suffisamment leur contour isolé ; aucune génération n’a été demandée. Le dard DHORKS livré avec la vague G reste l’unique projectile de la réserve cumulative.

## Contrôles visuels et limites de rendu

- Dix exports WebP vérifiés identiques aux masters, canal alpha compris.
- Huit images détourées contrôlées sur fonds contrastés ; silhouettes visibles entières.
- Six compositions statiques des arènes : ordinateur, portrait et paysage.
- Douze placements d’accessoires sur douze contenus dans le fond, en coordonnées exactes et après rasterisation.
- Absence visuelle de doublon entre les quatre accessoires isolés et les deux fonds.

Le rendu est une reconstruction statique à partir du CSS et des exports. **Aucun navigateur n’a été exécuté.** Les interfaces, collisions, déplacements, chargements réseau et performances mobile ne sont pas couverts. Le lanceur Chromium est présent, mais son exécutable est absent.

Le cadrage complet à proportions conservées garde les limites héritées : bande supérieure de 125,53 pixels dans le scénario portrait ; une partie des silhouettes de contrôle se trouve sur les bandes latérales dans le scénario paysage. Les accessoires restent à l’intérieur du dessin. Ces mesures sont détaillées dans le [rapport des compositions](qa-wave-h-2026-11-25/README.md).

## Preuves

- [Manifeste de livraison](../../art/infernal-versus/production/delivery-wave-h-2026-11-25.json)
- [Personnages et refus](../../art/infernal-versus/production/characters-wave-h-2026-11-25.json)
- [Décors, repères et adaptations](../../art/infernal-versus/production/stages-wave-h-2026-11-25.json)
- [Catalogue cumulatif des réserves](../../art/infernal-versus/production/reserve-assets.json)
- [Contrôle indépendant des dix exports](qa-wave-h-2026-11-25/static-asset-measurements.json)
- [Planche des dix dessins](qa-wave-h-2026-11-25/static-asset-overview.png)
- [Compositions aux trois formats](qa-wave-h-2026-11-25/static-stage-contact-sheet.png)
