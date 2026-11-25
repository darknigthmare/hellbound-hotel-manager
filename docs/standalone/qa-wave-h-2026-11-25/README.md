# Vague H — contrôle statique des deux décors

Date : **25 novembre 2026**.

## Résultat

Les six compositions ont été produites et inspectées : **deux décors × trois formats**. Les **12 boîtes visibles d’accessoires sur 12** restent dans les limites de l’image du fond, à la fois dans le calcul avec décimales et après rastérisation. Les **6 exports WebP sur 6** sont identiques en pixels RGBA décodés à leurs masters PNG ; les quatre accessoires possèdent une transparence réelle et aucun pixel d’alpha supérieur à 16 ne touche leur bord de canevas.

| Décor | Accessoire médian | Accessoire proche | Statut visuel statique |
| --- | --- | --- | --- |
| One Star Wonder · Couloir | Un chariot de linge, à gauche | Une applique jaune, au mur à droite | Objets uniques et complets ; chariot derrière les combattants |
| Apology Tour · Salle de fête | Un grand fantôme en néon, en haut à droite | Une boule cyan, en haut à gauche | Objets uniques ; sol central dégagé |

Les quatre accessoires sont absents de leurs fonds respectifs avant assemblage. Il n’y a pas de second chariot, de seconde applique identique, de boule cyan ou de fantôme peints dans les fonds H. Les petites appliques roses structurelles de la salle de fête sont des éléments distincts de ces deux accessoires. Ce contrôle de doublon est une inspection visuelle des masters et des compositions, pas une détection automatique de tous les objets.

## Fichiers

- [Planche des six cas](static-stage-contact-sheet.png).
- [Mesures, règles CSS et empreintes](static-stage-measurements.json).
- [Script reproductible](static-stage-qa.py).
- Couloir : [desktop](ghost-hotel-desktop-static.png), [portrait](ghost-hotel-portrait-static.png), [paysage](ghost-hotel-landscape-static.png).
- Salle de fête : [desktop](apology-party-desktop-static.png), [portrait](apology-party-portrait-static.png), [paysage](apology-party-landscape-static.png).

Ces sept PNG sont des **images de diagnostic**, hors des six dessins de production de ce sous-lot.

## Méthode

La commande exécutée depuis la racine du dépôt :

```bash
python docs/standalone/qa-wave-h-2026-11-25/static-stage-qa.py
```

Le script lit directement les règles H présentes dans `src/styles/pentagram-arena.css`, les exports publics et les paramètres de fond du registre des stages. Il reconstruit le cadrage `contain` et les boîtes alpha à parallaxe nulle. Les proportions natives sont conservées par un facteur d’échelle uniforme. Chaque règle de placement tient compte des marges transparentes de l’image.

La largeur du fond est `min(W - 20, H × 1672 / 941)`, sa hauteur est `min(H, (W - 20) × 941 / 1672)`. Le fond est aligné au centre et en bas. Les bornes visibles sont calculées à partir des pixels d’alpha supérieur à 16, puis comparées avec les bornes après arrondi et redimensionnement pour le diagnostic raster.

| Cas | Boîte d’arène supposée | Viewport supposé | Accessoires contenus |
| --- | --- | --- | --- |
| Desktop | 1 200 × 520 | 1 440 × 900 | 4 / 4 pour les deux décors |
| Portrait | 330 × 300 | 390 × 844 | 4 / 4 pour les deux décors |
| Paysage | 730 × 242 | 844 × 390 | 4 / 4 pour les deux décors |

Les silhouettes READY existantes de Vortex et Glitz sont placées à 22 % et 78 %, avec leurs appuis conservés et les accessoires derrière elles. Les nouvelles images H n’ajoutent aucun dessin de personnage à ces diagnostics.

Empreinte SHA-256 du CSS effectivement utilisé :

`320f4edc4347f87b22c0571be7f7e640282b2b1b47d17d772681becf6105479a`

Le script vérifie aussi que le CSS n’a pas changé pendant son exécution. Les empreintes des images et des fichiers de paramètres sont conservées dans le JSON.

## Limites observées

Le cadrage complet du fond est préservé dans les trois formats. Comme pour les décors G utilisant les mêmes règles :

- En portrait, une bande unie de **125,53 px** reste au-dessus du fond.
- En paysage, aux positions 22 % et 78 %, la silhouette de Vortex dépasse l’illustration de **52,16 px à gauche** et celle de Glitz de **46,53 px à droite**, sur les bandes latérales unies de l’arène. Les accessoires restent tous dans le fond et les silhouettes restent dans le canevas de diagnostic.

Ces mesures ne sont pas des mesures DOM. Les tailles d’arène et de viewport sont des hypothèses explicites. Les unités de conteneur CSS sont supposées prises en charge. La luminosité du fond à 0,83 est reproduite ; les ombres CSS, le HUD, les effets d’attaque, la foule, les mouvements et les transitions ne sont pas simulés.

**Aucun navigateur ni jeu interactif n’a été exécuté pour cette revue.** Les images portent la mention « STATIQUE / HORS NAVIGATEUR ». Ce contrôle ne certifie ni la parallaxe en mouvement, ni le comportement de tous les appareils, ni une fidélité canonique 1:1.

