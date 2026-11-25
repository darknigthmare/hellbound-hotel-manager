# Vague G — compositions statiques des décors

Date : 25 novembre 2026. **Ce contrôle reconstitue la géométrie CSS avec Pillow. Les images produites ne sont pas des captures du navigateur et ne prouvent pas le rendu du jeu.** Aucun master, export runtime ou fichier CSS n’a été modifié pour cette QA.

## Résultat

Les neuf compositions ont été produites puis inspectées visuellement : trois décors × trois formats. Les **18 boîtes visibles des props, définies par un alpha ≥16/255, restent intégralement dans l’image du décor** à parallaxe zéro. Le résultat est identique pour les calculs géométriques exacts et pour les images raster avec arrondis. Ce seuil concerne l’opacité des pixels, pas une taille minimale de 16 pixels.

Les fonds et accessoires conservent leurs proportions natives. Les six accessoires sont composés au niveau 1, avant les combattants au niveau 2. Ils ne masquent donc pas les silhouettes des combattants dans ces compositions. Les fenêtres, le parasol, la végétation, la barrière et l’arceau ne sont pas étirés.

La jardinière est centrée sous la fenêtre rectangulaire de la maison dans les trois formats. Les fleurs recouvrent naturellement le bas des vitres et le bac est sous le rebord. Une seule jardinière apparaît : le WebP du fond correspond au master final sans jardinière peinte dans la région native `[845,530,1065,615]` (écart RGB absolu moyen 0, contre 31,55 avec l’ancien fond). Le détail devient nécessairement petit en portrait : sa boîte visible mesure environ 35,1 × 10,2 pixels, sans erreur d’alignement constatée.

## Observation à conserver

Au format 730 × 242, le fond en `contain` occupe horizontalement x=150,00 à x=580,00. Les combattants restent positionnés à 22 % et 78 % de toute l’arène : une partie de Vortex dépasse de 52,16 pixels à gauche de l’illustration et une partie de Glitz de 46,53 pixels à droite. Ils sont donc partiellement sur les bandes latérales unies. C’est une conséquence visible de ces deux repères différents ; les props restent entièrement dans l’illustration. Aucun ajustement de CSS n’a été appliqué ici.

En portrait, `contain` laisse une bande unie de 125,53 pixels au-dessus du fond. Les combattants et les props restent dans la partie illustrée. Ces bandes préservent le cadrage intégral des masters ; leur présentation dans l’interface complète reste à évaluer en navigateur.

## Repères et hypothèses

| Cas | Boîte de contenu supposée | Viewport supposé pour les règles `vw` | Image du décor, x / y / largeur / hauteur |
|---|---:|---:|---:|
| Desktop | 1200 × 520 | 1440 × 900 | 138,02 / 0 / 923,95 / 520 |
| Portrait | 330 × 300 | 390 × 844 | 10 / 125,53 / 310 / 174,47 |
| Paysage court | 730 × 242 | 844 × 390 | 150,00 / 0 / 429,99 / 242 |

Les dimensions demandées sont traitées comme des boîtes de contenu, sans mesure DOM ni bordure extérieure. Les unités de conteneur sont supposées disponibles. Le cas paysage arrondit à 242 pixels la hauteur `62svh` de 241,8 pixels. La parallaxe vaut zéro.

Le script reprend les dernières déclarations G du CSS et les marges alpha natives des exports WebP. Il calcule `artWidth = min(W−20, H×1672/941)`, `artHeight = min(H, (W−20)×941/1672)`, puis applique les largeurs, ancrages latéraux et corrections de marge alpha propres à chaque prop. Le fond est aligné au centre en bas et sa luminosité de 0,83 est reproduite.

Vortex READY et Glitz READY sont aux positions 22 % et 78 %, Glitz orientée vers la gauche. Leurs cadres suivent les règles responsive de largeur de combattant : 310, 148,2 et 168,8 pixels selon les trois cas. Les images utilisent le cadre `width:150%`, `aspect-ratio:3/2`, `object-fit:contain`, avec mise à l’échelle uniforme et ancrages `canvas-bottom`/`groundY`. Le plan d’appui est à 91 % de la hauteur. Leurs ratios natifs sont préservés.

Le HUD, les ombres CSS, les figurants supplémentaires, les effets d’attaque et les transformations animées sont exclus. Ni les collisions, ni les interactions, ni les requêtes réseau, ni les erreurs console ne sont vérifiées par ces images. Aucune certification de fidélité canonique 1:1 n’en découle.

## Livrables et reproduction

- [Planche des neuf compositions](static-stage-contact-sheet.png).
- [Détails de la jardinière](static-planter-alignment.png).
- [Mesures exactes, mesures raster, sources et empreintes SHA-256](static-stage-measurements.json).
- [Script de reproduction](static-stage-qa.py), à lancer avec `python docs/standalone/qa-wave-g-2026-11-25/static-stage-qa.py` depuis la racine du dépôt, avec Python, Pillow et NumPy installés. Les neuf compositions utilisent les fichiers du dépôt, dont le master versionné `art/infernal-versus/masters/stages/murder-family-house-room-wave-g.png`. La commande régénère les sorties de ce dossier ; pour préserver la QA publiée, utiliser une copie du dépôt. La comparaison historique avec l’ancien fond est facultative via `--archived-planter-candidate /chemin/vers/ancien-fond.png` : si aucun fichier existant n’est fourni, ses résultats sont `null` et le contrôle est marqué non effectué. Le candidat ancien n’est pas distribué avec le dépôt.
- Neuf images individuelles nommées `<stage-id>-<desktop|portrait|landscape>-static.png` dans ce dossier.

CSS observé : `src/styles/pentagram-arena.css`, SHA-256 `f9aab00a0d9560d1b25a1c9c91d7cf6ed620b3305cdea89f6f3c06b386a8af47`. L’empreinte était encore identique après l’inspection des compositions.
