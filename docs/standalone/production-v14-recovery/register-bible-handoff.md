# Infernal Versus V14 — handoff de reprise du registre et de la bible

## Provenance et portée

**[MÉMOIRE]** Cette note est rédigée par /root/v14_register_bible depuis son historique de conversation après la déconnexion du backend OS. Les contrôles et empreintes ci-dessous décrivent leurs derniers résultats observés avant cette panne. Aucun fichier local n’a été relu pendant la rédaction de cette note.

**[NON RÉCUPÉRÉ PAR CET AGENT]** Les JSON, scripts, aperçus et rapports V14 cités ici ne sont pas disponibles sous forme de contenus exacts dans les stores de cet agent. Leur existence antérieure est attestée par l’historique des appels, mais cette note ne constitue pas leur récupération ni une nouvelle preuve QA.

**[INSTRUCTION ROOT DE REPRISE]** Root prépare une branche indépendante recovery/infernal-v14-20261126, avec pour parent 0ce3b069e738bbcae50b268806396ca2e65c1bad. Ce handoff n’autorise et n’effectue aucune modification de PR8, de Drive ou du registre. Root rapporte séparément la récupération des sept PNG natifs ; cette récupération n’est pas vérifiée par cet agent.

**[MÉMOIRE] Aucun XLSX V14 n’a été produit, même provisoire. Le registre est resté draft.**

## 1. Baseline réellement vérifiée avant la panne

Toutes les lignes de ce tableau sont **[MÉMOIRE — contrôle antérieur, non répété lors de la reprise]**.

| Élément | Dernier état observé |
| --- | --- |
| Dépôt | darknigthmare/hellbound-hotel-manager |
| Branche de production | feat/infernal-versus-assets-20261124 |
| PR existante | https://github.com/darknigthmare/hellbound-hotel-manager/pull/8 |
| Commit V13 publié | 0ce3b069e738bbcae50b268806396ca2e65c1bad |
| Arbre V13 | 7c0138b8bde5fea9566e37248502356944741862 |
| Bible V13 | docs/standalone/INFERNAL_VERSUS_BIBLE_V13.xlsx |
| Taille et SHA-256 V13 | 674412 octets ; 5a365b5483c40641670dd4b5520dbab42389f4769488b137e4aedbcd563f098b |
| Structure XLSX V13 | 58 feuilles, 67 tables |
| Vérification de la baseline | Le fichier local V13 était identique octet pour octet au blob du commit publié |
| Galerie V13 | 133 fiches |
| Catalogue / bases | 209 IDs, 208 identités distinctes ; 114 bases = 40 actives + 74 réserves ; 95 IDs / 94 identités sans base complète |
| Runtime V13 | 43 kits, 49 stages, 24 familles de costumes |
| Registre V13 | docs/standalone/production-v13/delivery-register.json ; SHA-256 5b91dbfcd5489be01ac2cdc72a3b6f1e353dbd2bea2fe0ce55fb3b13a5c7781d |

**[MÉMOIRE]** La vue Production V13!A1:E26 a été ouverte avant adaptation des scripts. Le rendu existant /tmp/infernal-v13/workbook/previews/final-production.png correspondait au rapport final V13. Ce rendu temporaire est **[NON RÉCUPÉRÉ PAR CET AGENT]**. L’audit V14 qui consignait ce contrôle, docs/standalone/production-v14/workbook-baseline-audit.json, est également **[NON RÉCUPÉRÉ PAR CET AGENT]** ; son SHA n’a pas été conservé dans l’historique.

## 2. État V14 réellement atteint

**[MÉMOIRE]** Les commandes --check-inputs puis --integrate de l’assembleur ont réussi après autorisation explicite de root et vérification des SHA fournis. Le builder a ensuite réussi --validate en lecture seule, avant son import d’Artifact Tool. Aucun mode --prepare, --final ou --render-final du builder n’a été exécuté.

**[MÉMOIRE]** Le registre draft résultant comptait 7 dessins retenus, 7 PNG, 7 WebP et 2 miniatures : 16 fichiers image pour 16890823 octets. Trois costumes statiques, deux stages et deux props de réserve ; zéro nouveau kit, zéro nouvelle base, zéro animation, zéro refus de générateur V14. Ces chiffres ne remplacent pas une vérification des fichiers récupérés.

**[MÉMOIRE]** Le cumul intégré était 138 fiches, 51 stages et 27 familles de costumes, avec 114 bases inchangées. L’assembleur a vérifié la préservation des 133 anciennes fiches et la réconciliation des alias du catalogue. Les nouveaux costumes ne ferment aucune lacune de base complète.

Les sept identifiants ci-dessous sont **[MÉMOIRE]** ; leurs masters, exports et miniatures ne sont pas récupérés par ce handoff.

| ID | Qualification intégrée |
| --- | --- |
| hb_blitzo-flashback-ghostfuckers-s2 | Costume statique sélectionnable de hb_blitzo |
| hb_millie-dress-disguise-training-short | Costume statique sélectionnable de hb_millie |
| hb_moxxie-dress-disguise-training-short | Costume statique sélectionnable de hb_moxxie |
| full-moon-shop-s2-room | Stage full-moon-shop-s2 |
| crimson-dining-room-s2-room | Stage crimson-dining-room-s2 |
| sloth-cloud-dispenser-s2 | Prop de réserve |
| crimson-green-chandelier-s2 | Prop de réserve |

**[MÉMOIRE]** Millie et Moxxie portent continuity=official_short_2026. Leur pose à ombrelle ouverte provient du produit officiel ; le court corrobore la tenue. Le filtre season_2 est un plafond prudent, pas une attribution du court à un épisode S2. Le fond Crimson documente un support plafonnier coupé par son cadrage ; le prop isolé conserve le contour entier. Le prompt du lustre disait deux globes alors que la revue a observé quatre ouvertures visibles en deux groupes chevauchés : le prompt a été conservé, avec le nom livré neutre « Crimson · lustre vert ». Toutes ces qualifications devront être retrouvées dans les sources et handoffs récupérés.

## 3. Chemins et empreintes des checkpoints

**[MÉMOIRE]** Les noms courts integration-spec.json, characters-handoff.json, environment-handoff.json, root-handoff.json, independent-visual-review.json et refused-attempts.json désignent bien des fichiers sous docs/standalone/production-v14/. Ce chemin est confirmé par le script exécuté et les lectures de l’historique.

Chaque ligne du tableau est **[MÉMOIRE]** et chaque artefact V14 listé est **[NON RÉCUPÉRÉ PAR CET AGENT]**. Les empreintes sont les dernières observées ; elles ne certifient pas l’état d’une copie reconstruite.

| Chemin relatif au dépôt | SHA-256 mémorisé |
| --- | --- |
| docs/standalone/production-v14/integration-spec.json | ff3636ddfcfc02fc6f031ea3e7f9ce30f9c2fab281f27bce46b75e4f8c539ff3 |
| docs/standalone/production-v14/independent-visual-review.json | 4d3f9341a9e782c6cfcee259465f67e9f33852858708add7e769cbeed5e51b06 |
| docs/standalone/production-v14/characters-handoff.json | e0de20e683ad2ceb037b99389ef4b550e2b536d9f38f13dcf68cc47d712e52a6 |
| docs/standalone/production-v14/delivery-register.json | c7efa014f6128e9837110d493ed4f2ef5900e5371f49d0f8a7c768c376283b5a |
| docs/standalone/production-v14/catalogue-plan-qa.json | dfeb81a7b8df9462724f1818a075b72afd61f60da9ef1cce4b977dec28bce442 |
| art/infernal-versus/production/reserve-assets.json | 26bea49d2bddc42c45c53d47d4245fe6f046be1c4dbbad6e94ab9fe2bf2ffe5f |
| docs/standalone/extension-plan.json | 81ecc954a14613b0b713bb7c82ab1f630b1e0c4ace00ecc0fda9d1cb9f28771d |
| docs/standalone/production-v14/props-reference-review.json | f48cc4be90313e7688d9a4fd275749c29f28f4bbebef02342ef6989c17b514cf |
| docs/standalone/production-v14/props-independent-review.json | 8282cb8d79caf7464e4b6242e2924d7998aadf627a6c8c7efba2cf3b30694c66 |
| docs/standalone/production-v14/wardrobe-initial-supplementary-review.json | ac9262f392ca137bc6064e5d9819db94c0c8f07a68f1d7cd96516ca8aefb2204 |

**[MÉMOIRE / NON RÉCUPÉRÉS PAR CET AGENT]** environment-handoff.json, root-handoff.json et refused-attempts.json existaient sous ce même dossier. Leurs SHA complets n’ont pas été conservés par cet agent. Le dernier contenu connu de refused-attempts.json était une liste vide. Il faut récupérer les fichiers exacts ou documenter leur reconstruction ; ne pas fabriquer un rapport historique « passé » à partir de cette seule note.

**[MÉMOIRE / NON RÉCUPÉRÉS PAR CET AGENT]** Les scripts assemble-register.py, build-bible-v14.mjs et workbook-ooxml-check.py avaient été créés sous docs/standalone/production-v14/. Leurs syntaxes avaient été vérifiées. Leurs SHA V14 ne sont pas connus de cet agent.

## 4. Contrat de l’assembleur à restaurer

Les points de cette section sont **[MÉMOIRE DU CODE LU ET EXÉCUTÉ]**, à contrôler sur le script récupéré ou reconstruit avant toute exécution.

- La baseline est le commit V13 publié ci-dessus ; la galerie de baseline contient 133 fiches.
- La spec doit avoir edition=V14, status=accepted_scope_locked, baselineCommit égal à V13 et integrationAuthorizedBy=/root pour les écritures.
- Les handoffs, la revue indépendante et refused-attempts.json sont des entrées réelles, complètes et hachées. Le manifeste accepté doit correspondre exactement aux assets.
- Les 28 cibles no-retry de production-v13/integration-spec.json doivent rester explicitement présentes dans la spec V14. Les éventuels nouveaux refus sont comptés séparément et interdisent aussi leurs IDs de source ou de tentative. Aucune relance d’une cible refusée.
- Masters, exports, miniatures, références et crops sont vérifiés par SHA. Le WebP doit être égal au PNG après décodage RGBA complet. Les crops déclarés exacts sont comparés aux pixels du parent.
- Les bases sont comptées par identité de production et alias, depuis l’audit V7 puis les registres V7 à V13. Les portraits, costumes et props ne deviennent pas de nouvelles bases.
- L’assembleur compare les fichiers partagés à la baseline ou aux lastWrittenHashes de catalogue-plan-qa.json. Un écart non réconcilié bloque l’écriture.
- --final exige active-asset-coverage.json courant, runtime-qa.json avec status=passed, browser-qa.json avec status=passed et une couverture explicite de tous les assets livrés. Les empreintes runtime techniques et navigateur doivent encore correspondre aux fichiers actuels ; les empreintes avant/après navigateur doivent être égales lorsqu’elles sont enregistrées.
- --final ne peut pas changer la galerie : celle-ci doit déjà être égale au résultat de --integrate. Il finalise le registre et le plan.
- --workbook-metadata intervient après export et revue du XLSX. Il met à jour le plan et catalogue-plan-qa.json, sans modifier le registre ni la galerie. Il exige notamment le SHA du registre utilisé pour le classeur, la revue visuelle acceptée et des SHA de workbook cohérents avec le rapport de packaging.

**[MÉMOIRE — commandes déjà réussies dans l’ancien environnement]** Depuis la racine du dépôt :

~~~sh
"$CODEX_PRIMARY_RUNTIME_PYTHON" docs/standalone/production-v14/assemble-register.py --check-inputs
"$CODEX_PRIMARY_RUNTIME_PYTHON" docs/standalone/production-v14/assemble-register.py --integrate
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v14/build-bible-v14.mjs --validate
~~~

**[CONSIGNE DE REPRISE]** Ne pas relancer --integrate aveuglément sur des JSON partiellement récupérés. Réconcilier la baseline, les fichiers partagés et le fichier de preuve d’écriture avant reprise. Le mode --validate appartient au builder JS ; l’assembleur Python n’a pas de mode --validate.

## 5. Export et préservation OOXML à reprendre

Les caractéristiques suivantes sont **[MÉMOIRE DES SCRIPTS PRÉPARÉS]**, pas des résultats obtenus sur un XLSX V14.

- Artifact Tool, importé depuis le runtime primaire, devait authorer uniquement Production V14 et Cibles V14. Aucune réécriture des feuilles historiques.
- Le packer existant docs/standalone/append-production-workbook.py devait ajouter ces deux feuilles à la bible V13.
- Attendus à vérifier sur les fichiers réels : 58 feuilles et 67 tables historiques conservées ; total 60 feuilles et 69 tables ; feuille d’ouverture Production V14, index 58.
- Les nouvelles feuilles OOXML étaient attendues en sheet59.xml et sheet60.xml. Les anciens XML de feuilles, relations de feuilles et tables doivent rester identiques octet pour octet.
- Seuls les conteneurs nécessaires à l’ajout peuvent évoluer : xl/styles.xml, xl/sharedStrings.xml, xl/workbook.xml, xl/_rels/workbook.xml.rels, [Content_Types].xml et docProps/app.xml. Anciens styles et chaînes partagées conservés en préfixe ; ordre et attributs des anciennes feuilles et definedNames préservés ; IDs et noms de tables uniques.
- Les six formules de Production V14 devaient produire, depuis le registre final, B6=7, B7=7, B8=0, B9=16, B10=0 et B12=114 si le lot accepté reste identique. Ce sont des attentes issues du draft, pas des valeurs déjà calculées dans un XLSX V14.
- Le builder prévoyait recalcul, modification d’entrées/recalcul/restauration, recherche d’erreurs et réimport des additions. Tous les nouveaux rendus doivent être réellement ouverts et relus.
- --render-final a été ajouté pour importer le classeur complet dans un nouveau processus et comparer deux plages représentatives aux rendus des additions. Ce mode n’a jamais été exécuté.
- Les contrôles en Microsoft Excel natif n’avaient pas été exécutés ; ne pas les certifier lors d’une simple vérification Artifact Tool.

**[MÉMOIRE / NON RÉCUPÉRÉ PAR CET AGENT]** Un contrôle de contenu sans Artifact Tool avait estimé les sept lignes de livraison à 122–318 points, sous la limite Excel de 409 points. /tmp/infernal-v14/workbook/content-review.json n’est pas récupéré. Cette estimation ne vaut pas rendu visuel et ne couvre pas le futur texte de QA navigateur.

**[CONSIGNE DE REPRISE — commandes prévues, jamais exécutées pour V14]** Seulement après restauration des sources et approbation d’une QA technique et navigateur actuelle :

~~~sh
"$CODEX_PRIMARY_RUNTIME_PYTHON" docs/standalone/production-v14/assemble-register.py --final
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v14/build-bible-v14.mjs --validate
NODE_OPTIONS=--max-old-space-size=1024 "$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v14/build-bible-v14.mjs --final
"$CODEX_PRIMARY_RUNTIME_NODE" docs/standalone/production-v14/build-bible-v14.mjs --render-final
"$CODEX_PRIMARY_RUNTIME_PYTHON" docs/standalone/production-v14/workbook-ooxml-check.py
~~~

**[CONSIGNE DE REPRISE]** Ouvrir les rendus et rédiger les vraies revues avant la dernière commande :

~~~sh
"$CODEX_PRIMARY_RUNTIME_PYTHON" docs/standalone/production-v14/assemble-register.py --workbook-metadata
~~~

**[MÉMOIRE DES CHEMINS PRÉPARÉS]** Le répertoire de travail par défaut était /tmp/infernal-v14/workbook ; la sortie intermédiaire par défaut était /workspace/scratch/b07af32d1b2c/outputs/infernal-v14/INFERNAL_VERSUS_BIBLE_V14.xlsx ; la copie finale prévue était docs/standalone/INFERNAL_VERSUS_BIBLE_V14.xlsx. Aucun de ces XLSX V14 n’a été créé. Le vérificateur OOXML contenait le chemin temporaire absolu pour comparer les deux copies. Dans un nouvel environnement, remapper ce chemin et l’option --output-dir de manière cohérente et explicite.

**[CONSIGNE DE REPRISE]** Éviter les exports et rendus lourds pendant les builds ou sessions Chromium. Conserver les aperçus dans le répertoire temporaire. Préserver les échecs éventuels comme de nouveaux essais, sans convertir des attentes en résultats.

## 6. Blocage QA au moment de la panne

**[MÉMOIRE — message root]** Un premier passage technique avait validé 413 tests / 47 suites, 735 chemins sans référence cassée, 1339 hashes de distribution et 207 fichiers d’entrée. Root a ensuite entrepris une modification du préchargement des poses. Ce premier passage ne valide donc pas la version modifiée.

**[MÉMOIRE — ledger initial lu]** Aucune session navigateur initiale n’était complète : deux crashs à l’entrée de combat, un timeout de galerie avant son premier détail et une session mobile interrompue sur demande root. Les quatre crops de vestiaire relus par cet agent ne prouvaient que les silhouettes et sélections visibles de Blitzø et Moxxie. Aucun combat, badge de galerie, filtre final, vue Millie ou mobile validé n’en a été déduit.

**[NON RÉCUPÉRÉS PAR CET AGENT]** runtime-qa.json, active-asset-coverage.json, browser-harness/initial-attempts.json, les rapports et captures des failed-segments ainsi que wardrobe-initial-supplementary-review.json doivent être récupérés séparément. Aucun browser-qa.json final approuvé ni registre final V14 n’avait été observé par cet agent avant l’indisponibilité.

**[CONSIGNE DE REPRISE]** Après restauration et nouveau gel runtime : relancer les contrôles nécessaires, faire approuver la portée réelle du navigateur, puis seulement finaliser le registre et le XLSX. Ne pas recréer des rapports PASS depuis les compteurs mémorisés. La correction du préchargement ne démontre pas, à elle seule, la cause ni la résolution des crashs.

## 7. Drive et publication

Toutes les informations de ce paragraphe sont **[MÉMOIRE — dernier état fourni par root, non revérifié ici]**. Le fichier Drive existant reste V13, ID 10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU, parent 1iU5o5IO2L6T9L1hLzqqFtHoYn95CKose. Son lien est https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit. L’édition V13 connue a le SHA et la taille indiqués en section 1. Cet agent n’a effectué aucune écriture Drive et n’a publié aucun fichier V14 sur PR8.

**[CONSIGNE DE REPRISE]** Root conserve la responsabilité de la publication. Une future mise à jour du même fichier Drive n’intervient qu’après validation du XLSX réel, puis relecture complète des octets téléchargés pour comparaison. La branche de récupération et ce blob de handoff ne constituent pas une publication de V14 sur PR8 ni une mise à jour de Drive.

## 8. Aide à la reconstruction des helpers, sans prétention byte-exact

**[MÉMOIRE]** Les V14 helpers dérivaient de production-v13/assemble-register.py, production-v13/build-bible-v13.mjs et production-v13/workbook-ooxml-check.py. Les SHA V13 connus étaient respectivement 58d1d4b6f27532856dadad665f5d9a71097bec90370d4331bd9a1423d4d3f086 pour l’assembleur et c8368bca3e8691db8226f82c2cddfe7e0ba140d1956f4ab57f50d5697698b916 pour le builder.

**[MÉMOIRE DES MODIFICATIONS]** Adapter édition et baseline ; inclure les registres V7 à V13 ; attendre 133 fiches initiales ; conserver la réconciliation historique refusalIdentityReconciliationV13 du refus V12 ; ajouter inheritedRefusedV13 et noRetryTargetIdsV14 ; exiger la liste historique no-retry ; vérifier les nouveaux refus sans doublons ; ajouter --render-final en processus frais ; contrôler le SHA du XLSX dans --workbook-metadata. Mettre à jour les seules constantes de structure 58/67 vers 60/69. String.fromCharCode(65 + index) doit rester à 65 : ne pas modifier cette constante ASCII par remplacement global.

**[NON RÉCUPÉRÉS PAR CET AGENT]** Aucun helper V14 original complet, JSON original complet ou image du projet n’est présent dans les stores de cet agent. Les contenus exacts encore en store avant cette note sont uniquement le skill Spreadsheets, son workflow d’édition, API_QUICK_START.md et style_guidelines.md. Ils ne contiennent pas les preuves QA du projet.

**[CONSIGNE DE REPRISE]** Si les helpers doivent être reconstruits depuis V13, l’indiquer comme reconstruction et produire de nouvelles empreintes. Si une source ou preuve manque, la qualifier comme manquante. Ne pas attribuer le SHA d’un ancien fichier à une reconstruction non identique.
