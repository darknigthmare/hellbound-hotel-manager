# Infernal Versus — livraison statique V8

26 novembre 2026. Continuation de la branche `feat/infernal-versus-assets-20261124`, PR nº 8, depuis `daae49839972f31a1d55cbbe2942c1b0c7abe304`.

## Résultat

**18 nouveaux dessins retenus**, chacun dans son image individuelle, sont intégrés au jeu. Ils donnent **38 fichiers d’image** : 18 PNG maîtres natifs, 18 WebP sans perte et 2 miniatures de sélection. Les variantes initiales écartées et les références restent dans les dossiers de production ; elles ne sont pas comptées comme livraisons acceptées.

| Catégorie | Dessins | Intégration |
| --- | ---: | --- |
| Tenues Helluva Boss | 9 | Vestiaire des combattants existants ; une seule image reste visible pendant toutes les actions |
| Incarnations Hazbin Hotel | 4 | Galerie uniquement ; aucun kit de combat ajouté |
| Fonds d’arène | 2 | Sélection et parcours du jeu autonome |
| Accessoires de décor | 3 | Couches séparées dans les arènes et consultation dans la galerie |

### Tenues

- **Loo Loo Land** : Blitzø, Moxxie et Millie en gardes du corps ; Stolas en touriste.
- **Ghostf\*\*kers** : Millie en tenue STAFF.
- **The Harvest Moon Festival** : Blitzø et Millie. La version retenue de Blitzø corrige les marques du visage et des manches présentes dans la première tentative.
- **Apology Tour** : Stolas vampire et Blitzø fantôme. Le drap du fantôme masque les membres dans la référence ; aucune anatomie cachée n’a été ajoutée.

### Incarnations et lieux

Alastor humain, Vox humain en présentateur météo, Vox humain en animateur de talk-show et Emily aux six ailes déployées rejoignent les archives de saison 2. Elles restent distinctes des bases et techniques existantes.

L’extérieur d’**Ozzie’s**, avec sa rue et sa barrière de file, forme une arène distincte de l’intérieur du cabaret. Le **couloir du refuge des hellhounds** reçoit un fond, une enseigne et un dossier séparés. L’enseigne et le dossier suivent la même parallaxe que le mur pour conserver leur point d’attache. Les premiers plans sont adaptés au combat ; les musiques existantes sont réutilisées.

## Comptage après intégration

| Indicateur | V7 | V8 |
| --- | ---: | ---: |
| Combattants avec kit actif | 43 | 43 |
| Bases autonomes | 109 | 109 |
| Entrées de galerie | 84 | 100 |
| Tenues alternatives sélectionnables | 11 | 20 |
| Arènes du standalone | 40 | 42 |
| Arènes du manager | 8 | 8 |
| Nouveaux cycles animés dans cette livraison | — | 0 |

Les 209 IDs du catalogue restent conservés. **100 IDs, soit 99 identités après l’alias connu, restent sans base autonome.** Les costumes et formes de personnages déjà recensés ne réduisent pas ce nombre.

Le plan d’extension ajoute 13 fiches de variantes et 2 exigences de lieux. Neuf exigences historiques de costumes ont été rapprochées de 24 fichiers déjà existants : ce rattrapage de documentation ajoute zéro dessin. Les états restent partiels lorsque les autres poses, transitions ou formes demandées ne sont pas couvertes.

## Vérification et provenance

Le [registre de livraison](delivery-register.json) associe chaque dessin à ses références, empreintes SHA-256, dimensions, usage et limites. Les [revues indépendantes](independent-visual-review.json) comparent les images complètes aux sources retenues. Les WebP des 18 dessins ont les mêmes octets RGBA décodés que leurs PNG, y compris les couleurs invisibles sous la transparence. Cette égalité technique ne mesure pas la fidélité au modèle de la série.

Les détails d’exécution des tests et builds figurent dans [validation.json](validation.json), avec leur log. Le contrôle navigateur, lorsqu’il est disponible, est décrit séparément et limité aux écrans réellement examinés. Aucun contrôle d’image local ne vaut à lui seul validation visuelle en jeu.

La bible V8 ajoute **Production V8** et **Cibles V8** aux 46 feuilles de la V7. Le rapport `workbook-qa.json` décrit le recalcul, le réimport, la conservation des composants historiques et la revue des rendus. Les instructions de reconstruction se trouvent dans [README.md](README.md).

## Limites conservées

**La fidélité 1:1 n’est pas certifiée.** Certaines références officielles disponibles sont de petits aperçus vidéo ; les contours fins, proportions, coutures et plis restent des adaptations documentées. Les fonds réorganisent la perspective du premier plan pour le jeu.

- **Lute avec prothèse, saison 2** : une tentative refusée par le générateur, sans relance et sans fichier livré.
- **Blitzø Bethany** : tentative conservée hors livraison ; le bas du costume et les bottes n’ont pas été suffisamment corroborés. Aucun branchement au vestiaire.
- **Lilith et Molly** : nouvelles sources officielles repérées, mais leurs images n’ont pas pu être récupérées ; les manques antérieurs restent ouverts.
- **Vox, projection ailée et tuxedo humain tardif** : détails du bas du corps encore masqués ou insuffisamment lisibles ; aucune silhouette inventée.

Les autres lacunes de V7, dont deux illustrations personnelles manquantes, restent explicitement transmises par le registre. Cette livraison n’est pas présentée comme l’achèvement de tout le catalogue.
