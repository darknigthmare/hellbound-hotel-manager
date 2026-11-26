# Hazbin — production V8

Date : 26 novembre 2026. Base examinée : `daae49839972f31a1d55cbbe2942c1b0c7abe304`.

## Livraison

Quatre dessins statiques individuels sont livrés et acceptés par la revue visuelle indépendante. Ils sont destinés à la galerie. Ils ajoutent **zéro identité, zéro base de personnage, zéro kit et zéro cycle d’animation**.

| Asset | Incarnation documentée | Source primaire | Export |
|---|---|---|---|
| `alastor-human-s2-ready` | Alastor humain, gilet bordeaux | Prime Video, *Alastor’s Backstory*, 2 / 4 / 20 s | `public/assets/production/v8/hazbin/alastor-human-s2-ready.webp` |
| `vox-human-weather-s2-ready` | Vox humain, présentateur météo en costume brun | Prime Video, *Brighter*, 14 / 12 / 10 s | `public/assets/production/v8/hazbin/vox-human-weather-s2-ready.webp` |
| `vox-human-talkshow-s2-ready` | Vox humain, costume vert du talk-show | Prime Video, *Brighter*, 58 / 62 / 66 s | `public/assets/production/v8/hazbin/vox-human-talkshow-s2-ready.webp` |
| `emily-six-wings-s2-ready` | Emily, trois paires d’ailes déployées | Prime Video, *Cracked Up: The Best of the Egg Boiz*, 200 / 195 / 235 s | `public/assets/production/v8/hazbin/emily-six-wings-s2-ready.webp` |

Les trois premières images font 1024 × 1536 pixels. Emily fait 1536 × 1024 pixels. Chaque PNG natif est conservé sans retouche dans `production/v8/hazbin/native/`. Les exports WebP sont sans perte et préservent exactement les quatre canaux RGBA du natif, y compris les couleurs invisibles sous l’alpha nul.

Le registre d’intégration est `docs/standalone/production-v8/hazbin-generation.json`. Il contient les prompts exacts, les chemins d’entrée, les URL horodatées, les empreintes SHA-256, les dimensions, les mesures d’alpha, les limites et les statuts de livraison. Les fiches individuelles `*-attempt.json` conservent également chaque tentative.

## Qualification et comparaison

La recherche préalable a confronté le registre V7, le catalogue de réserve, les exports et le plan d’extension. Aucun sprite autonome des deux incarnations humaines d’Alastor/Vox n’a été trouvé dans ces fichiers ; leurs identités de base existent déjà. Emily dispose d’une base avec ailes repliées, distincte de l’éventail de six ailes de la nouvelle image.

Les références sont des miniatures de lecture publiques natives de 320 × 180 pixels issues des clips officiels. Les métadonnées publiques identifient Prime Video comme auteur. Les planches reçues et les découpes inspectées sont conservées dans `references/`, avec métadonnées et empreintes par planche. Aucun épisode privé, fichier sous authentification ou accès payant n’a été utilisé.

La comparaison a porté sur la silhouette entière, le visage, la coiffure, les lunettes, les vêtements, les pieds et, pour Emily, le nombre d’ailes. Des compositions sur blanc et gris servent exclusivement à la QA. L’alpha natif va de 0 à 254 ; le dégradé visible dans certains aperçus bruts appartient aux couleurs cachées sous la transparence et n’est pas un fond visible en composition.

Les poses sont des adaptations statiques pour la galerie. Les références réduites ne permettent pas de certifier les petits détails, les proportions exactes ou chaque plume. Les marges supérieures et inférieures sont parfois plus étroites que la consigne du prompt, mais aucune coupe visible de la silhouette n’a été constatée. **Aucune certification de fidélité 1:1 n’est revendiquée.**

La revue indépendante est consignée séparément dans `docs/standalone/production-v8/independent-visual-review.json`. Le présent lot n’a modifié aucun code ni exécuté de contrôle navigateur.

## Refus conservé

La nouvelle incarnation de **Lute en saison 2**, bras gauche prothétique doré et halo d’Adam au poignet, a été qualifiée à partir du clip officiel *Gravity*. Une seule tentative native a été effectuée.

- Statut : `moderation_refusal_no_retry`.
- Refus à la sortie, catégorie `other`.
- Requête : `c5deebc5-74ed-428d-aa7e-ac6bd38ea204`.
- Aucun fichier produit ou livré ; aucune relance.
- Le prompt exact et les références sont dans `lute-attempt.json`.

Les refus historiques V7 restent inchangés. En particulier, aucun Egg Boi générique ou renommé n’a été créé pour remplacer Frank.

## Manques préservés

| Cible | Constat de cette passe | Résultat |
|---|---|---|
| Lilith | Clip officiel Prime Video Brasil identifié (`q9lzr9zsUT4`), mais récupération publique limitée par HTTP 429. Portrait familial fourni par A24/Prime dans VFX Voice identifié, mais téléchargement local HTTP 403. | Pas de corps entier inspecté exploitable ; aucune génération. |
| Molly | Nouveau clip officiel Heaven identifié (`ZE2GuxyfQls`), mais HTTP 429. Le manque V7 du bas du corps n’est pas levé. | Aucune génération. |
| Vox, projection ailée | *Brighter* montre la projection et les ailes, mais cache le bas du corps derrière la tour de téléviseurs. | Aucun bas du corps inventé. |
| Vox humain, tuxedo tardif | Haut et visage sans lunettes visibles ; scènes au piano et sous lumière rouge trop petites ou occultées pour qualifier les jambes/chaussures avec confiance. | Aucun troisième costume humain Vox fabriqué. |
| Sir Pentious en uniforme de finale | Une courte vue dans la compilation montre l’uniforme, sans détail entier exploitable de la silhouette. | Aucune nouvelle variante fabriquée. |
| Egg Boiz | Compilation inspectée pour qualifier les sources ; refus historique de Frank conservé. | Aucun contournement par changement de nom. |

Les autres états de manque du registre V7 ne sont pas déclarés résolus par ce lot.

## Sources

- https://www.youtube.com/watch?v=BqhHYxM2sQo — *Alastor’s Backstory*, Prime Video.
- https://www.youtube.com/watch?v=GJQpBUcKhTk — *Brighter*, Prime Video.
- https://www.youtube.com/watch?v=c56SWmqnU5E — *Cracked Up: The Best of the Egg Boiz*, Prime Video.
- https://www.youtube.com/watch?v=5eZonu8XsEs — *Gravity*, Prime Video.
- https://www.youtube.com/watch?v=q9lzr9zsUT4 — *Primeira aparição de Lilith em Hazbin Hotel*, Prime Video Brasil, source identifiée mais captures non reçues.
- https://vfxvoice.com/checking-into-hazbin-hotel-to-check-out-the-animation/ — production visuelle fournie par Prime Video et A24 ; portrait familial identifié, fichier local non reçu.
