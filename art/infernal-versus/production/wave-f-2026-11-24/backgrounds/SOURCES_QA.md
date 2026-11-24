# Vague F — décors et composants de décor

Date : 24 novembre 2026.

## Production

Trois masters de décor ont été générés séparément avec le générateur d’images intégré, puis six composants de décor séparés ont été dérivés visuellement avec ce même générateur. Chaque fichier contient une scène unique ou un seul objet / groupe cohérent. Les PNG originaux sont conservés sans retouche.

| Master | Dimensions | Référence principale |
| --- | --- | --- |
| `stage_imp_office_exterior_wave_f.png` | 1672 × 941, RGB | [Murder Family — S1E1](https://www.youtube.com/watch?v=el_PChGfJN8), plan d’entrée vers 02:05 |
| `stage_oops_warehouse_wave_f.png` | 1672 × 941, RGB | [Oops — S2E6](https://www.youtube.com/watch?v=y1sF6ZeASU0), espace entrepôt vers 18:00 et cage vers 13:20 |
| `stage_blitzo_balcony_sinsmas_wave_f.png` | 1672 × 941, RGB | [Sinsmas — S2E12](https://www.youtube.com/watch?v=GisSNuVpbkM), balcon vers 25:30–27:10 |

Les temps désignent les plages des planches de prévisualisation officielles inspectées, pas une certification image par image. Les scripts temporaires ont seulement téléchargé et lu ces références ; ils n’ont pas dessiné les livrables.

## Références visuelles consultées

- Les planches de prévisualisation ont été obtenues directement depuis les métadonnées publiques des trois épisodes officiels YouTube. Architecture et palettes ont été inspectées visuellement.
- I.M.P. : plan d’entrée de Murder Family, planche officielle 2, case ligne 3 colonne 2. Référence complémentaire de ciel / ville : [frame Imp City reproduite dans cet article](https://hemmy-jam.hatenablog.com/entry/2024/02/14/173208). Celle-ci sert uniquement à la palette et ne certifie pas le détail de la façade.
- Oops : planche officielle 12, case supérieure gauche (espace dégagé et cartons), plus planche 8 et [frame HD diffusée sur IMDb](https://www.imdb.com/title/tt27860177/) pour les barreaux de la cage et la couleur des parois.
- Sinsmas : planches officielles 17 et 18, plus [reproduction HD du plan de balcon](https://www.pinterest.com/pin/476607573085457002/). La scène est confirmée visuellement par les planches de la source officielle.
- [Kircy Jong, artiste de décors, décrit les palettes de Oops](https://www.linkedin.com/posts/kircy-jong_last-month-spindlehorse-toons-released-helluva-activity-7121991961271574528-KxJ7). La publication évoque des verts fluorescents, des jaunes citron et des violets. Cette source complète l’observation, sans remplacer la référence à l’épisode.

## QA effectuée

- Les trois masters montrent une scène vide, sans personnage, sans UI ni collage.
- La bande inférieure de sol est horizontale et dégagée.
- Le cadre graphique 2D animé, les silhouettes architecturales observables et les rôles de palette ont été comparés aux références.
- Les six props mesurent 1254 × 1254 pixels, RGBA, avec une plage alpha de 0 à 255.
- L’objet principal de chaque prop reste entièrement à l’intérieur du cadre lorsque l’alpha est mesuré à partir de 16/255.
- Du bruit alpha très faible existe hors silhouettes. Exemple contrôlé : les petits pixels rouges visibles dans certains aperçus de la cage n’excèdent pas 7/255 d’alpha ; aucun pixel rouge de ce type n’a un alpha supérieur ou égal à 16. Les originaux restent intacts.
- Dimensions, empreintes SHA-256, bornes alpha et statuts sont dans `background_qa.json` et `props_qa.json`.

## Composants transparents

| Fichier | Sujet |
| --- | --- |
| `props/imp-exterior-mid.png` | Module de six fenêtres roses et cadre métal |
| `props/imp-exterior-near.png` | Groupe de deux avis muraux usés |
| `props/oops-warehouse-mid.png` | Pile de cinq cartons |
| `props/oops-warehouse-near.png` | Cage métallique vide |
| `props/sinsmas-balcony-mid.png` | Section simple de garde-corps |
| `props/sinsmas-balcony-near.png` | Guirlande multicolore avec nœud central |

Ces composants sont distincts et ne sont pas des copies du fond complet avec une opacité réduite. Certains motifs restent déjà présents dans le master aplati : éviter de superposer le même objet à sa propre occurrence. Les utiliser comme variantes de composition, à un emplacement additionnel cohérent, ou après retrait par édition de l’occurrence intégrée au master.

## Limites conservées

Statut : **candidats de production / adaptation de gameplay**, non **fidélité 1:1 certifiée**.

Le cadrage a été élargi et le sol dégagé pour une arène de combat. La disposition exacte des cartons, des modules de façade et de certains éléments reconstruits n’est pas certifiée comme géométrie canonique. Les poses de caméra et le placement parallaxe sont des adaptations de gameplay.

Chaque master est actuellement une seule image opaque composite. Les six props fournissent de vraies images isolées, mais leur intégration et la séparation propre des plans du décor demandent encore une inspection en jeu. Aucune validation en jeu n’a été faite par l’agent producteur.

Les prompts exacts sont dans `prompts.json` et `props-prompts.json`. Sources d’IP : SpindleHorse / Vivienne Medrano, Helluva Boss. Livrables : images générées pour le fan-game ; aucune licence officielle sur la franchise n’est revendiquée.
