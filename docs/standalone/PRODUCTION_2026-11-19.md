# Infernal Versus — production du 19 novembre 2026

Ce lot rassemble la récupération des fichiers accessibles, la conservation du checkpoint distant retrouvé et la production des images encore nécessaires à l’intégration immédiate. Il porte sur la [PR #3](https://github.com/darknigthmare/hellbound-hotel-manager/pull/3), branche `feat/infernal-versus-story-tournament`.

Le bilan du lot est de **46 masters PNG, 49 œuvres et 117 fichiers d’image ajoutés ou modifiés par rapport à la base**. Les registres actifs décrivent **36 combattants, 14 arènes, trois costumes avec six poses chacun et 231 chemins d’assets distincts présents**. Ces comptes décrivent des fichiers et des branchements dans le jeu; ils ne certifient ni des animations complètes, ni une fidélité visuelle à l’identique.

## Base et préservation du checkpoint distant

La base de travail est [`06f960ffbf62618b4068d3513978ab9d9de716e1`](https://github.com/darknigthmare/hellbound-hotel-manager/commit/06f960ffbf62618b4068d3513978ab9d9de716e1). Après la première intégration locale, le checkpoint distant [`e260968b27f1192a86e31aab585b197276f39b8c`](https://github.com/darknigthmare/hellbound-hotel-manager/commit/e260968b27f1192a86e31aab585b197276f39b8c), lui aussi issu de cette base, a été retrouvé. Il conserve 34 images et un rapport de récupération, sans changement de code.

La fusion `7bcb83b` conserve ce checkpoint et les changements d’intégration. Les exports différents ont été archivés avant résolution des collisions. La caisse Carmine issue de la nouvelle génération et celle du checkpoint sont des dessins distincts; leurs masters et exports ont été conservés sous des chemins distincts. Les révisions de livraison figurent dans [l’historique de la PR](https://github.com/darknigthmare/hellbound-hotel-manager/pull/3/commits). [Rapprochement des versions et empreintes](../../art/infernal-versus/production/upstream-reconciliation-2026-11-19.json).

## Comptage des œuvres et des fichiers

Une œuvre correspond ici à un dessin source distinct. Son master, son export pour le jeu et sa vignette ne comptent pas comme trois œuvres. Les 14 variantes d’export archivées ne sont pas ajoutées au compte des œuvres.

| Provenance | Masters PNG ajoutés au lot | Description |
| --- | ---: | --- |
| Originaux récupérés par leur SHA Git | 12 | Éléments de décor : auvent, cristal, pupitre, lampe, tabouret, chariot, stand, fanions, établi, palan, foin et guirlande. |
| Nouvelles générations du lot initial | 18 | Six poses Angel Dust/Striker, quatre poses de costumes Vaggie/Loona, quatre fonds d’arène, salle/râtelier/caisse Carmine et canne à pomme de Lucifer. |
| Masters antérieurs retrouvés dans `e260968` | 12 | Quatre poses Husk/Millie, deux pièces de costumes, deux accessoires de finition, deux éléments Carmine et deux poses du costume humain de Stolas. |
| Nouvelles poses de Stolas | 4 | Attente, contact léger, lourd et réaction; complètent l’accroupissement et le saut retrouvés. |
| **Total des masters du lot** | **46** | Les fichiers de la base antérieure sont exclus de ce total. |

Le checkpoint contient 13 masters PNG, dont l’auvent de Cannibal Town déjà compté parmi les 12 originaux récupérés. Il apporte donc **12 masters supplémentaires**, sans double comptage. Ses trois autres œuvres récupérées uniquement en WebP portent le total à **49 œuvres**.

| Fichiers d’image dans le diff de la base et le lot local | Nombre |
| --- | ---: |
| Masters PNG sous `art/infernal-versus/masters/` | 46 |
| Exports WebP sous `public/`, vignettes comprises | 57 |
| Variantes WebP conservées sous `art/infernal-versus/recovered-exports/` | 14 |
| **Total** | **117** |

Ce total inclut les fichiers ajoutés et les vignettes modifiées; il ne correspond pas au nombre total d’images du dépôt. Le [manifeste final de livraison](../../art/infernal-versus/production/delivery-2026-11-19.json) réconcilie les 49 œuvres et les 117 fichiers, avec leurs dimensions, empreintes et statuts. Parmi les 57 exports publics, **50 fichiers sont branchés dans les registres**, vignettes comprises, et **sept restent des ressources préparées**.

Le [manifeste initial](../../art/infernal-versus/production/2026-11-19.json) conserve le périmètre initial de 30 œuvres : 12 récupérées et 18 nouvelles. Les [manifestes de production](../../art/infernal-versus/production/) et le [rapport du checkpoint](recovery-status-2026-11-19.json) complètent cette provenance. Le nombre 30 du manifeste initial ne représente donc pas le cumul final. La [galerie du lot](ASSET_GALLERY_2026-11-19.md) présente les images pour revue.

### Trois œuvres retrouvées uniquement en WebP

Ces exports existent et sont préservés à l’identique. Leur master PNG d’origine reste indisponible.

| Fichier | SHA du blob Git | Utilisation |
| --- | --- | --- |
| `public/assets/stages/hazbin/hotel-bar/room.webp` | `a13c35e9250613aa5d243449aae5c41872b987f1` | Fond actif de Hotel Bar. |
| `public/assets/stages/hazbin/hotel-lobby/valance.webp` | `391b2368dceb88b5ac58da4d06dc4783b5f9e5aa` | Avant-plan du lobby, avec le chariot au plan médian. |
| `public/assets/stages/helluva/wrath-ranch/lantern.webp` | `f07a08d1473464f282e1b5d5c7ee0e39e1babeb9` | Alternative conservée; le ranch utilise actuellement le foin et la guirlande. |

### Quatorze variantes d’export archivées

Le dossier [`art/infernal-versus/recovered-exports/2026-11-19/`](../../art/infernal-versus/recovered-exports/2026-11-19/) contient dix exports de props et quatre vignettes provenant du checkpoint. Les différences portent notamment sur le cadrage, la taille et la compression des exports. Les quatre anciennes vignettes de Wrath Ranch, Heaven Court, Pentious Workshop et Loo Loo Land sont préservées comme variantes : le jeu conserve les vignettes correspondant aux quatre nouveaux fonds. Les correspondances et empreintes SHA-256 sont enregistrées dans le [manifeste de rapprochement](../../art/infernal-versus/production/upstream-reconciliation-2026-11-19.json).

## Contenu effectivement branché dans le jeu

Les données de cette section proviennent des registres de [personnages](../../src/standalone/roster.ts), d’[apparences](../../src/lib/infernal-appearances.ts), de [finitions](../../src/lib/infernal-finishers.ts), de [campagnes](../../src/standalone/campaign.ts) et d’[arènes](../../src/lib/pentagram-stages.ts). Le relevé reproductible est [ASSET_COVERAGE.json](ASSET_COVERAGE.json), généré par `node scripts/audit-infernal-assets.mjs`.

### Combattants et costumes

Les 36 combattants disposent de leurs portraits, atlas et banques d’animation. Les poses individuelles ajoutent un dessin dédié pour certains états; les autres états continuent d’utiliser les banques existantes.

| Combattant | Poses individuelles ajoutées ou récupérées dans ce lot |
| --- | --- |
| Angel Dust | Attente, contact léger, réaction. |
| Striker | Attente, contact léger, réaction. |
| Millie | Attente, contact léger. |
| Husk | Attente, garde distincte. |

Le registre contient au total huit poses individuelles d’attente, en comptant celles déjà présentes de Charlie, Vaggie, Alastor et Loona. Il compte trois contacts légers, deux réactions et une garde distincte. Une pose d’attente réutilisée pendant la garde ne compte pas comme une garde dédiée.

La sélection propose trois costumes : Vaggie exorciste, Loona humaine et Stolas humain. Chacun possède six fichiers pour l’attente/garde, le léger, le lourd, la réaction, l’accroupissement et le saut : **18 poses de costume**. Les deux poses Stolas retrouvées et les quatre nouvelles poses sont toutes présentes et référencées.

### Arènes et niveaux

Le standalone compte **14 arènes**, dont quatre nouvelles entrées : `wrath-ranch`, `heaven-court`, `pentious-workshop` et `looloo-land`. Ces décors adaptent les motifs des sources à une piste de combat; leur composition élargie est une création pour le jeu.

| Profondeur illustrée active | Arènes | Nombre |
| --- | --- | ---: |
| Fond, plan médian et avant-plan | Hotel Lobby, Hotel Bar, Carmine Industries, Vee Broadcast Studio, I.M.P. Reception, Ozzie’s Cabaret, Wrath Ranch, Heaven Court, Pentious Workshop, Loo Loo Land | 10 |
| Fond et un calque indépendant | Cannibal Town Square | 1 |
| Fond seul | Hotel Front Steps, Pentagram Rooftops, Heaven Embassy & Clock Tower | 3 |

Le fond du bar retrouvé et la valance du lobby sont actifs. Les calques suivent le déplacement de caméra, avec réduction des mouvements prise en compte. Les huit arènes du manager sont conservées; l’ajout des quatre arènes au standalone n’agrandit pas ce registre du manager.

### Finitions, pièces séparées et réserves de production

Cinq combattants ont une pose clé de finition dédiée : Charlie, Alastor, Mimzy, Blitzø et Sallie May. Les autres finitions utilisent leurs traitements d’effets existants. La **canne à pomme de Lucifer** est un objet séparé branché sur sa finition; elle ne constitue pas à elle seule une animation complète de Lucifer.

Quatre autres pièces sont préservées et exportées pour la production, sans assemblage articulé actif : le haut de Millie, le nœud papillon de Moxxie, la lance d’exorciste de Vaggie et la canne microphone d’Alastor. La chaîne et la caisse alternative de Carmine, ainsi que la lanterne de Wrath Ranch, sont des ressources disponibles pour une composition ultérieure. Leur présence dans `public/` ne signifie pas qu’elles apparaissent déjà dans un duel.

## Manques mesurables après ce lot

Ces comptes concernent les poses individuelles de l’apparence habituelle, hors costumes. Ils mesurent la couverture de dessins dédiés et non le nombre de combattants jouables.

| Catégorie | Présent | Reste pour une couverture des 36 combattants |
| --- | ---: | ---: |
| Attente individuelle | 8 | 28 |
| Garde individuelle distincte | 1 | 35 |
| Contact léger individuel | 3 | 33 |
| Réaction individuelle | 2 | 34 |
| Pose clé de finition | 5 | 31 |
| Costume alternatif à six poses | 3 costumes / 18 poses | 33 combattants sans costume alternatif enregistré; les variantes à produire doivent être définies par personnage. |
| Affectations narratives illustrées | 24 sur 108 | 84 affectations sans illustration dédiée. |

Les 24 affectations narratives utilisent **20 dessins uniques**, certaines rivalités partageant une illustration. Les 84 affectations restantes ne correspondent donc pas nécessairement à 84 nouveaux dessins. Les scènes utilisent actuellement le décor et les portraits lorsqu’aucune illustration dédiée n’est enregistrée.

Pour que les 14 arènes possèdent chacune trois plans indépendants, il manque un calque à Cannibal Town et deux pour chacune des trois arènes à fond unique, soit **sept calques**. Cette cible ne garantit pas qu’ajouter partout des objets améliorerait la lisibilité; leur placement doit être revu dans le jeu.

La continuité des silhouettes, les cycles animés, l’alignement des points d’appui et les transitions entre poses restent des contrôles distincts. Les pieds des quatre nouvelles poses de Stolas diffèrent d’au plus **21 px** de la base de la pose accroupie sur le canevas de 1024 px de hauteur; leurs pivots et transitions restent à vérifier dans le jeu. Les images conservées ne constituent pas un rig complet, et aucune fidélité canonique à l’identique n’est revendiquée.

## Récupération partielle et pertes de l’ancien environnement

L’ancien environnement local a disparu lors du redémarrage. Le relevé historique mentionne 115 fichiers, dont 99 visuels, dans un ancien checkout; ces nombres décrivent l’inventaire de cette session, **pas une récupération complète du présent lot**. Les sources locales historiques du checkout et des payloads ne sont plus présentes dans le workspace actuel.

Le commit local `a8df328fea4bf58d472b688edaaed26bd4e0a436` reste introuvable par l’API GitHub. Les huit blobs de masters PNG suivants renvoient encore HTTP 404 lors de la nouvelle vérification. Les trois WebP cités plus haut ont été récupérés indépendamment de leurs masters.

| Master d’origine indisponible | SHA connu |
| --- | --- |
| `cannibal-town-square-flower-cart.png` | `501179252b0c1f35cba730d2dffab87cd94709ae` |
| `heaven-court-room.png` | `676784acbf6d8a82e48406a4f54016a2548ff9b5` |
| `hotel-bar-room.png` | `10f6bcb49cb2a6c5f226213c4c00e208bde1890e` |
| `hotel-lobby-valance.png` | `a9129acadf5e04b6390ddcb8770fcdc0b561a9e0` |
| `looloo-land-room.png` | `731f8832121b453f8690dde2a1a7ffcf3ec1c728` |
| `pentious-workshop-room.png` | `dd231fe194af0cdada6f6d10025c1746243c47a1` |
| `wrath-ranch-lantern.png` | `fa1d6151c1f50e8504c97c20519d54cd00b36917` |
| `wrath-ranch-room.png` | `07916ad839c1744f97db3d6152a9d4ee979624e9` |

Le relevé des anciens payloads Moxxie/Lucifer et des trois images de décor d’entraînement non inspectées donne des chemins et des tailles, sans SHA additionnel permettant leur récupération. Aucun fichier supplémentaire de ces payloads n’a été retrouvé. Les quatre nouveaux fonds sont des remplacements nouvellement dessinés, pas une restauration des octets des anciens fonds. [Preuve et limites du relevé historique](recovery-status-2026-11-19.json).

## Documentation et bible

La [bible de production V2](INFERNAL_VERSUS_BIBLE_V2.xlsx) rassemble 23 feuilles. Les registres du jeu alimentent les poses, finitions, arènes, illustrations et chiffres de synthèse; [extension-plan.json](extension-plan.json) conserve les propositions et les travaux à produire. Le [builder](build-production-bible.mjs) reconstruit ce classeur indépendamment du build du jeu.

Les manifestes sous [`art/infernal-versus/production/`](../../art/infernal-versus/production/) distinguent masters récupérés, générations nouvelles, exports dérivés et variantes conservées. Le contrôle de couverture vérifie les chemins référencés; il n’évalue pas le cadrage ou la qualité artistique dans le navigateur.

## Vérifications et publication

| Contrôle | Résultat constaté |
| --- | --- |
| Comptage des images par rapport à `06f960f` | 117 fichiers présents : 46 masters PNG, 57 exports publics WebP et 14 exports archivés. |
| Registres actifs après intégration Stolas | 231 chemins distincts; aucun chemin d’asset absent. |
| Tests ciblés décors, production et campagne | Trois fichiers de tests, 16 tests réussis après intégration du fond Hotel Bar et de la valance lobby. |
| QA complète du 19 novembre 2026 | `npm run qa` terminé avec code de sortie 0 : TypeScript et ESLint réussis, 41 suites / 310 tests réussis, les deux builds réussis. |
| Distribution standalone | 823 fichiers, 458,6 Mio; 823 empreintes SHA-256 vérifiées, ressources de démarrage présentes, persistance hôtel/cloud exclue. |
| Bible V2 finale | 23 feuilles; les 11 feuilles V1 et leurs 31 parties XML sont conservées octet pour octet. Recalcul, formules et neuf vues modifiées vérifiés. |
| Contrôle visuel des images sources | Images consultées pendant la récupération et la génération; cette inspection ne valide pas leur rendu en duel. |
| Validation visuelle du jeu dans le navigateur | **Non réalisée pour ce lot** : accès au serveur local et lancement du navigateur bloqués. Aucune nouvelle validation visuelle de l’interface n’est revendiquée. |

Les commandes exécutées étaient :

```bash
npm run test -- src/tests/pentagram-stages.test.ts src/tests/infernal-production.test.ts src/tests/standalone-campaign-cup.test.ts
npm run qa
```

### Publication et clôture documentaire

- **QA complète (`npm run qa`) : réussie le 19 novembre 2026**, avec les résultats détaillés ci-dessus.
- **Bible V2 régénérée et vérifiée** — 23 feuilles, 231 références, 18 poses de costumes et répartition des arènes 10/1/3 cohérentes avec les registres. Les 11 feuilles V1 et leurs 31 parties XML sont inchangées; les sept feuilles V2 sans modification de contenu conservent leurs valeurs et formules. Recalcul contrôlé par mutations temporaires puis restauration; neuf aperçus modifiés inspectés.
- **Livraison : [PR #3](https://github.com/darknigthmare/hellbound-hotel-manager/pull/3)** — son [historique de commits](https://github.com/darknigthmare/hellbound-hotel-manager/pull/3/commits) identifie les révisions publiées. Les preuves de fichiers et de tests de ce lot figurent dans [QA_2026-11-19.json](QA_2026-11-19.json) et le manifeste de livraison.
- **Navigateur : non validé pour ce lot.** Les tests automatisés ne remplacent pas ce contrôle visuel.
