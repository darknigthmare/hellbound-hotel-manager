# Production V14 — trois costumes, deux arènes et deux accessoires

La V14 poursuit la V13 publiée dans la [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8), à partir du commit `0ce3b069e738bbcae50b268806396ca2e65c1bad`. La portée artistique est figée à **7 nouveaux dessins acceptés**, soit **16 fichiers image et 16 890 823 octets** : sept masters PNG natifs, sept exports WebP sans perte et deux miniatures d’arène. Les références et les diagnostics ne sont pas inclus dans ce total. Le [registre de livraison](delivery-register.json) donne les chemins, dimensions, empreintes et limites de chaque fichier.

**État de ce bilan : les dessins et leur revue artistique sont acceptés ; la validation technique complète, les parcours navigateur, la bible V14 et la publication V14 restent en attente.** Les usages décrits ci-dessous correspondent à l’intégration préparée et au [périmètre verrouillé](integration-spec.json). Ils ne constituent pas encore une preuve de fonctionnement en jeu.

## Les sept dessins

| Dessin | Usage prévu | Source et limite principale |
|---|---|---|
| [Blitzø · tenue du flashback, Ghostf\*\*kers](../../../public/assets/production/v14/characters/hb_blitzo-flashback-ghostfuckers-s2.webp) | Costume statique sélectionnable de `hb_blitzo` | Standee officiel entier ; identité et tenue corroborées dans S2E10 à 930 s. Cornes, queue et deux bottes visibles. Marges haute et basse de 13 et 9 px ; proportions et détails redessinés. |
| [Millie · robe et ombrelle, IMP Training Video](../../../public/assets/production/v14/characters/hb_millie-dress-disguise-training-short.webp) | Costume statique sélectionnable de `hb_millie` | Porte-clés officiel entier et court officiel à 140 s. La pose avec ombrelle ouverte vient du produit ; le court montre une ombrelle fermée. Les pieds restent cachés par la robe. |
| [Moxxie · robe et ombrelle, IMP Training Video](../../../public/assets/production/v14/characters/hb_moxxie-dress-disguise-training-short.webp) | Costume statique sélectionnable de `hb_moxxie` | Autre face du même porte-clés, corroborée dans le court à 130 s. Cheveux blancs et pose distincte de Millie. Silhouette complète jusqu’à l’ourlet, sans reconstruction des jambes cachées. |
| [The Full Moon · Boutique gothique](../../../public/assets/production/v14/environment/full-moon-shop-s2-room.webp) | Arène S2 `full-moon-shop-s2`, à un plan | Peinture `208_00003` de Jasper Luu et cellule officielle de S2E8 à 710 s. Deux rangées de huit ogives ; le carrelage avant est prolongé pour le duel. |
| [Crimson · Salle à manger](../../../public/assets/production/v14/environment/crimson-dining-room-s2-room.webp) | Arène S2 `crimson-dining-room-s2`, à un plan | Peinture `206.jpg` de Jasper Luu et cellules officielles de S2E3 à 580, 630 et 670 s. Premier plan adapté au combat ; le petit support du lustre est coupé au bord supérieur du fond. |
| [Sloth · distributeur mural au nuage](../../../public/assets/production/v14/props/sloth-cloud-dispenser-s2.webp) | Accessoire statique de réserve, visible dans la galerie | Peintures `1.jpeg` et `3.jpeg` de Jasper Luu, contexte Western Energy S2E4. Le contour entier vient de la vue sans robinet devant le papier. Détails natifs limités à 115 × 163 et 167 × 219 px. |
| [Crimson · lustre vert](../../../public/assets/production/v14/props/crimson-green-chandelier-s2.webp) | Accessoire statique de réserve, visible dans la galerie | Objet entier isolé depuis la peinture `206.jpg`, détail natif de 410 × 320 px. Quatre ouvertures ovales visibles en deux groupes chevauchés ; aucun volume arrière caché reconstitué. |

Les trois costumes sont rattachés à des combattants existants avec le statut `selectable_costume`. Leur illustration reste statique pendant les actions. Ils n’ajoutent aucune identité, base autonome de personnage, mécanique de combat ou animation.

Les deux arènes utilisent chacune un fond entier et une miniature dédiée. Leur présentation prévue conserve les proportions du fond, avec un seul plan visuel. Les deux accessoires demeurent des objets de galerie : aucune surimpression dans une arène, distribution de papier, lumière dynamique ou autre interaction n’est ajoutée. Les cinq nouvelles fiches de galerie correspondent aux trois costumes et aux deux accessoires ; les arènes sont comptées séparément.

## Continuité et provenance

### Épisodes de saison 2

Le costume de Blitzø est attribué au flashback de [Ghostf\*\*kers, S2E10](https://www.youtube.com/watch?v=5DV4IIKwqRI&t=930s). Le [standee officiel](https://sharkrobot.com/products/flashback-blitz-standee), dont le dessin est crédité à MistMistly pour SpindleHorse, fournit la silhouette complète. La cellule de l’épisode confirme le personnage et la tenue ; elle ne sert pas à inventer des parties hors champ.

Les décors et accessoires s’appuient sur les peintures publiées par [Jasper Luu dans son portfolio de production](https://jasperluu.com/helluvaboss). Les cellules officielles de [The Full Moon, S2E8](https://www.youtube.com/watch?v=Fj9YRsV1pEw&t=710s) et [Exes and Oohs, S2E3](https://www.youtube.com/watch?v=j1BfO7VlIw4&t=630s) corroborent les lieux et le mobilier. Le contexte du distributeur de Sloth reprend la qualification publiée en V11 pour [Western Energy, S2E4](https://www.youtube.com/watch?v=KJy7T24rhg0&t=630s). Cette réutilisation ne prétend pas à un nouveau visionnage intégral de l’épisode.

### Court officiel publié en 2026

Les robes de Millie et Moxxie appartiennent à [HELLUVA SHORTS 12 — IMP TRAINING VIDEO](https://www.youtube.com/watch?v=4kJXWQWW-og), publié le **13 juin 2026**. La date provient de la fiche YouTube officielle indexée ; cette provenance est consignée dans les [métadonnées primaires conservées](../../../production/v14/characters/references/training-primary-metadata.json). Elle n’est pas présentée comme une date extraite d’une capture locale qui ne la contenait pas.

Ces deux costumes portent la continuité **`official_short_2026`** et le badge **« COURT OFFICIEL · 2026 »**. Leur valeur `spoilerScope: season_2` est uniquement un niveau conservateur du filtre. Elle ne les attribue à aucune saison numérotée et l’année 2026 ne les classe pas en saison 3.

Le [porte-clés officiel Moxxie & Millie — Dress Disguise](https://sharkrobot.com/products/moxxie-millie-dress-disguise-keychain), crédité à Darius pour SpindleHorse, fournit les deux poses entières et les ombrelles ouvertes. Les cellules natives du court à 130 et 140 s confirment les identités et les tenues avec les ombrelles fermées. Les illustrations livrées ne sont donc pas décrites comme des reproductions exactes de ces plans. Les robes masquent naturellement jambes et pieds ; aucun membre caché n’a été ajouté sous les ourlets.

### Adaptations pour le jeu

Le sol avant des deux décors est étendu pour accueillir le duel dans la simulation AU. Le passage aux fonds de 1 672 × 941 px modifie le cadrage des peintures de production. Architecture, silhouettes et accessoires sont redessinés ; **aucune fidélité canonique ou géométrique 1:1 n’est certifiée**. La V14 n’ajoute aucune incarnation de pilote ou d’ancien concept.

## Comptes cumulés

Les valeurs V14 proviennent du [registre courant](delivery-register.json) et de l’[audit du catalogue et du plan](catalogue-plan-qa.json). Elles décrivent l’intégration préparée ; sa validation technique finale reste ouverte.

| Indicateur | V13 publiée | V14 préparée |
|---|---:|---:|
| IDs du catalogue | 209 | **209** |
| Identités distinctes après rapprochement de l’alias connu | 208 | **208** |
| Bases entières autonomes | 114 | **114** |
| Bases actives / en réserve | 40 / 74 | **40 / 74** |
| IDs sans base entière | 95 | **95** |
| Identités distinctes sans base entière | 94 | **94** |
| Fiches de galerie | 133 | **138** |
| Familles de costumes | 24 | **27** |
| Arènes | 49 | **51** |
| Kits jouables | 43 | **43** |
| Scènes personnelles illustrées / prévues | 127 / 129 | **127 / 129** |
| Scènes globales illustrées / prévues | 11 / 11 | **11 / 11** |

Les 133 anciennes fiches de galerie sont préservées, ainsi que les 43 lignes historiques d’arènes du plan et ses 52 lignes de variantes. Le nombre de lignes du plan ne correspond pas nécessairement au nombre de vues d’arènes utilisables. Cette vague ajoute **zéro portrait, zéro base autonome, zéro kit et zéro cycle d’animation** ; elle ne réduit pas le nombre de personnages encore sans base entière.

## Production et contrôle artistique

Chaque livrable provient d’une génération native distincte. Les masters PNG sont conservés sans réencodage. Les sept WebP ont été comparés à leur PNG décodé : tous leurs pixels RGBA sont identiques, y compris les couleurs sous les pixels transparents. Cette égalité valide l’export, pas une fidélité à la référence. Les deux miniatures sont des dérivés d’affichage et ne sont pas comptées comme deux dessins supplémentaires.

Les costumes et accessoires possèdent un véritable canal alpha. Leurs compositions sur fonds clair et sombre ont été inspectées. Les pixels de bord et l’alpha natif sont conservés, avec leurs limites documentées ; les fonds d’arène restent opaques. Les sources ont été inspectées avant génération, avec leurs dimensions réelles et les coordonnées de recadrage conservées.

La [revue artistique indépendante](independent-visual-review.json) accepte les **sept dessins avec leurs limites**, sans correction demandée. La revue complémentaire des [deux robes](characters-independent-environment-review.json) distingue les deux personnages et confirme les silhouettes jusqu’à l’ourlet. Elle ne certifie aucun rendu en jeu.

Deux imprécisions des descriptions préparatoires restent visibles dans les preuves : la boutique comporte huit ogives par rangée, et le lustre montre quatre ouvertures ovales réparties en deux groupes. Le prompt historique du lustre parlant de « deux globes » est conservé intégralement ; le nom livré est « lustre vert » et la revue prend la source visuelle comme référence. Le support supérieur du lustre est coupé uniquement dans le fond de la salle à manger ; l’accessoire isolé est entier. Les marges de certains dessins sont inférieures à celles demandées dans leurs prompts, sans coupe des silhouettes acceptées.

**Aucun nouveau refus du générateur n’est enregistré.** Les 28 cibles historiques de la liste `noRetryTargetIds` demeurent exclues. Les sources inaccessibles et les références partielles restent différées, sans reprise d’un refus ni contournement d’accès.

## État des vérifications finales

| Volet | État documenté à ce stade | Preuve disponible |
|---|---|---|
| Dessins, transparence et conversions | Acceptés avec limites ; sept exports RGBA identiques | [QA personnages](characters-qa.json), [QA environnements](environment-qa.json), [QA accessoires](root-image-qa.json) |
| Revue artistique indépendante | Sept dessins acceptés ; zéro correction requise | [Revue consolidée](independent-visual-review.json) |
| Catalogue, plan et portée | Intégration préparée ; portée verrouillée à sept dessins | [Audit catalogue et plan](catalogue-plan-qa.json), [contrat d’intégration](integration-spec.json) |
| Typage, tests, lint, builds et distribution | **En attente d’une passe complète réussie.** Le premier typecheck a été tué avec le code 137 avant de produire un diagnostic TypeScript. | [Rapport technique courant](runtime-qa.json), [première tentative archivée](technical-attempts/typecheck-resource-killed/README.md) |
| Parcours navigateur et affichage en combat | **En attente.** Aucune preuve finale de parcours sur ordinateur ou mobile n’est présente dans ce bilan. | [Recette préparée](browser-harness/recipe.json) ; le rapport final `browser-qa.json` reste à produire. |
| Bible V14 | **En attente de génération, contrôle et relecture.** Seule la bible V13 de référence a été vérifiée. | [Audit de la bible de référence](workbook-baseline-audit.json), [bible V13](../INFERNAL_VERSUS_BIBLE_V13.xlsx). Fichier V14 attendu : `../INFERNAL_VERSUS_BIBLE_V14.xlsx`. |
| Publication GitHub, CI, déploiement et remplacement de la bible Drive | **En attente des preuves V14.** Les réussites et publications V13 ne valident pas cette nouvelle vague. | [Bilan de publication V13](../production-v13/README.md) et [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8) pour le contexte historique. |

L’arrêt du premier typecheck est conservé comme une tentative interrompue. Il ne prouve ni une erreur TypeScript ni une réussite de validation. Les sections ci-dessus doivent être mises à jour uniquement à partir des rapports finaux et des preuves de publication correspondantes.

## Cibles encore ouvertes

Les bases manquantes du catalogue et les deux illustrations personnelles encore absentes restent ouvertes. Les pistes V14 écartées comprennent des pins partiels, les costumes d’Antarctique dont les membres inférieurs sont masqués, la robe de mariage de Moxxie avec chevauchement de Millie et des vues d’Ozzie’s trop petites ou occultées. Les [références des personnages](characters-references.json) précisent ce qui a été vu et pourquoi aucun dessin supplémentaire n’a été lancé.

Le poste de radio de Sloth demeure masqué par le comptoir ; le pot de la plante bleue de Crimson est coupé au bord inférieur. Ces deux objets restent différés dans le [registre des cibles examinées](root-deferred-targets.json). Les refus historiques et les limites de source restent conservés. Cette livraison ne clôt pas la production globale du jeu.

## Dossiers de preuve

- [Registre de livraison et inventaire exact](delivery-register.json)
- [Portée acceptée, usages et cibles à ne pas relancer](integration-spec.json)
- [Handoff des trois costumes](characters-handoff.json), [références](characters-references.json) et [prompts intégraux](characters-prompts.json)
- [Handoff des deux arènes](environment-handoff.json), [références](environment-references.json), [qualification](environment-qualification.json) et [prompts](environment-prompts.json)
- [Handoff des deux accessoires](root-handoff.json), [références](root-references.json) et [prompts intégraux](root-prompts.json)
- [Revue artistique indépendante consolidée](independent-visual-review.json), [revue des accessoires](props-independent-review.json) et [revue complémentaire des robes](characters-independent-environment-review.json)
- [QA technique courante](runtime-qa.json) et [historique de la première tentative](technical-attempts/typecheck-resource-killed/README.md)
- [Registre des refus](refused-attempts.json), [cibles différées](root-deferred-targets.json) et [plan global de production](../extension-plan.json)
- [Audit de la bible de référence](workbook-baseline-audit.json) et [bible V13 — fichier Excel](../INFERNAL_VERSUS_BIBLE_V13.xlsx)

Les handoffs figés décrivent les dessins acceptés avant validation en jeu. Le registre courant est encore un registre de préparation ; les futurs rapports techniques, navigateur, classeur et publication établiront l’état final livré.
