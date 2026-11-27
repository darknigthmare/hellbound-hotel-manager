# V16 — Gerald et Rick · Barbie’s Bad Day

Deux portraits statiques sont intégrés à la galerie. Chaque dessin représente un seul personnage, avec son PNG natif et un WebP sans perte dont le décodage RGBA est identique. Les deux bases entières restent manquantes ; aucun combattant, cycle animé ou pouvoir supplémentaire n’est livré.

| Dessin | Dimensions natives | Portée |
|---|---:|---|
| Gerald · Barbie’s Bad Day · portrait | 1230 × 1278 | Portrait du haut du torse |
| Rick · Barbie’s Bad Day · portrait | 1312 × 1199 | Portrait du haut du torse |

## Sources et datation

Le court officiel [HELLUVA SHORTS 11 — Barbie’s Bad Day](https://www.youtube.com/watch?v=PyICIy6fkDo), publié par Vivziepop, est daté du **25 avril 2026**. Les champs primaires `publishDate` et `uploadDate` valent `2026-04-25T10:00:36-07:00` dans le microformat de la page YouTube. La preuve exacte est conservée dans `production/v16/characters/references/barbie-bad-day-publication-metadata.json`.

Gerald utilise les previews officielles à [20 s](https://www.youtube.com/watch?v=PyICIy6fkDo&t=20s) et [60 s](https://www.youtube.com/watch?v=PyICIy6fkDo&t=60s). Rick utilise la vue de face à [160 s](https://www.youtube.com/watch?v=PyICIy6fkDo&t=160s) et la vue arrière à [165 s](https://www.youtube.com/watch?v=PyICIy6fkDo&t=165s), qui corrobore ses deux cornes et sa casquette. Son ancien portrait de dépôt est un appui secondaire explicitement déclaré. Les cellules primaires mesurent 320 × 180 pixels ; les timecodes sont calculés sur un intervalle de 5 secondes.

## Comptage et limites

Le lot contient **2 dessins, 2 PNG et 2 WebP**, pour **2 474 716 octets**. La galerie passe de **143 à 145 entrées** ; les 143 objets antérieurs sont conservés strictement. Le catalogue reste à **209 identifiants**, dont **94 sans base entière** (93 identités distinctes après alias). Le total demeure **115 bases autonomes**, **43 kits actifs**, **51 stages** et **27 familles de costumes**.

Les proportions fines, couleurs, contours et détails sont adaptés depuis de petites sources. L’alpha natif est conservé, y compris des pixels très faibles autour de Gerald ; aucun nettoyage par seuil n’est appliqué. Les deux portraits ont été inspectés sur trois fonds et acceptés avec ces limites. **Aucune fidélité 1:1 n’est certifiée.**

## Vérifications

Le registre final lie les empreintes des dessins, références, sources de publication et rapports. La QA courante compte **439 tests dans 51 suites**, avec builds manager et standalone réussis. La galerie a été vérifiée sur Chromium desktop et mobile émulé : **4 captures**, deux par portrait, avec illustrations entières visibles. Aucun appareil physique ni nouveau comportement de combat n’est couvert par cette recette.

Consulter `delivery-register.json`, `runtime-qa.json`, `browser-gallery-qa.json`, `independent-visual-review.json` et `browser-visual-review.json`. Les prompts exacts sont conservés dans `characters-prompts.json`. L’historique V15 et ses deux extensions de guide sont préservés.

## Bible V16 livrée

Le classeur [INFERNAL_VERSUS_BIBLE_V16.xlsx](../INFERNAL_VERSUS_BIBLE_V16.xlsx) contient **70 feuilles et 79 tableaux**. Les feuilles `Production V16` et `Cibles V16` sont ajoutées aux **68 feuilles et 77 tableaux historiques**. La comparaison OOXML confirme la conservation octet pour octet des 214 parties V15 figées, dont les feuilles des extensions de guide.

L’export mesure **786 503 octets**, avec l’empreinte SHA-256 `5a4c82a521c4bfb90bf91485a2c531e0cb047ded7d8535e0f798cd0ad109c704`. Il provient du registre final `9723e5e491ec548bbf42f8069a9ef9d746bc3bc05b7f710643e340d5f7e2ff00`, resté inchangé pendant la construction et les vérifications.

Les 584 cellules d’en-tête et de données des deux nouveaux tableaux ont été comparées après export et réimport. Le recalcul par Artifact Tool ne signale aucune cellule de formule en erreur dans les deux nouvelles feuilles. La revue visuelle couvre ces deux feuilles sur six des 22 plages produites ; des vues représentatives ont également été rendues après import du classeur final complet. Microsoft Excel natif n’a pas été exécuté, et les feuilles historiques conservées ne font pas l’objet d’un nouvel audit de contenu.

Les preuves sont conservées dans [workbook-qa.json](workbook-qa.json), [workbook-ooxml-review.json](workbook-ooxml-review.json), [workbook-final-render-check.json](workbook-final-render-check.json) et [workbook-visual-review.json](workbook-visual-review.json). Le plan référence désormais cette bible V16 avec son empreinte, sa taille et le statut `verified`.

## Reproduction

La base publiée du PR #8 est `68007b81bce0307a9c54cb3e42ef8bdf231087d6`, équivalente au commit local `eca07c70d20fc1f03e52d84b97b45050f0c82308` et à l’arbre `4c5c4fbf079836bb0551a0357822f70ebe34b463`. `assemble-register.py --final --baseline-commit 68007b81bce0307a9c54cb3e42ef8bdf231087d6 --write-plan` refuse les preuves absentes, périmées ou incomplètes. Après construction et recette de la bible V16, `--workbook-metadata --write-plan` vérifie 70 feuilles et 79 tables, dont 68 feuilles et 77 tables historiques conservées.
