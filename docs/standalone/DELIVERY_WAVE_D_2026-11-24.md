# Infernal Versus — livraison de la vague D

Date : **24 novembre 2026**. Base comparée : `3db6dce417e8c597baaee8f23dbe85b8d40e0a39`. Branche : `feat/infernal-versus-assets-20261124`, [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8).

## Résultat livré

Cette vague ajoute **quatre combattants au standalone, 26 dessins retenus et 55 fichiers d’image**. Le jeu compte désormais **40 combattants, 22 arènes à trois plans, 40 routes et 120 duels scénarisés**. Les 377 chemins d’assets du registre existent. Les profils et les huit arènes du manager restent distincts.

Le lot comprend 12 poses de personnages, trois fonds, six accessoires de scène et cinq images d’effets. Chacun possède son PNG master et son export WebP ; trois miniatures de scène complètent le lot. Les 29 nouveaux fichiers publics sont tous enregistrés dans le runtime. L’inventaire détaillé et ses empreintes sont dans le [manifeste de livraison](../../art/infernal-versus/production/delivery-wave-d-2026-11-24.json).

La fidélité exacte 1:1 n’est pas certifiée. Les références inspectées, leurs limites et les adaptations nécessaires au jeu sont précisées dans la [revue visuelle](REVIEW_ASSETS_WAVE_D_2026-11-24.md) et les trois manifestes de spécialité.

## Personnages et routes

| Nouveau combattant | Dessins nouveaux | Route originale | Rendu actuel |
| --- | --- | --- | --- |
| Katie Killjoy | Repos, garde, contact léger, réaction | Le dernier mot | Quatre poses propres, également utilisées comme repli provisoire |
| Tom Trench | Repos, garde, contact léger, réaction | Trente secondes de direct | Quatre poses propres, également utilisées comme repli provisoire |
| Stella | Aucun dessin accepté | Le carton sans nom | Portrait historique intact utilisé provisoirement |
| Mammon | Repos, garde, contact léger, réaction | Les frais du rappel | Quatre poses propres avec placement explicite, utilisées comme repli provisoire |

Chacun reçoit trois attaques de base et une finition utilisant un effet partagé. Les valeurs, noms de coups et récits sont des créations d’Exhibition. Les signatures et finitions longues proposées dans la bible ne sont pas présentées comme de nouvelles commandes ou animations disponibles. Mammon rejoint le groupe des neuf adversaires possibles du Boss Rush ; le combattant du joueur en est retiré si nécessaire. Les parcours déjà sauvegardés conservent leur liste propre.

Les nouvelles READY de Katie, Tom et Mammon servent aussi en sélection, au Codex et dans les interludes. Katie et Tom suivent les repères de la série principale en saison 1, sans mélange avec le pilote ; leurs parties basses sont reconstruites depuis des références qui montrent surtout le haut du corps. Mammon garde sa forme habituelle large à quatre bras.

### Correction des anciennes banques

Une revue indépendante a découvert des cellules tronquées, des fragments de personnages voisins et des aplats magenta dans les banques historiques des quatre nouveaux jouables. Les afficher entre deux nouvelles poses réintroduisait un défaut visible.

Le standalone évite désormais ces banques : Katie, Tom et Mammon réemploient leurs dessins propres ; Stella utilise son portrait historique intact. Ce repli couvre les actions non redessinées, les introductions, l’égalité, le K.-O., la victoire et les finitions sans image d’impact dédiée. Costumes et images d’impact gardent leur priorité. La marche déplace toujours le combattant et les règles de combat restent actives, mais les silhouettes de repli sont statiques : **aucun nouveau cycle complet n’est compté**. Les atlas historiques sont conservés comme ressources et leur comportement dans le manager n’est pas modifié.

Mammon reçoit une échelle uniforme de **1,4**, avec un ancrage au bas du canvas pour ses quatre images. Ses appuis sont mesurés aux bords exclusifs 1351, 1351, 1352 et 1353 sur un canvas de 1536 pixels de haut. Cette correction réduit le vide sous les pieds et conserve les proportions ; elle ne certifie ni sa taille canonique relative ni le rendu en mouvement.

Le [manifeste personnages](../../art/infernal-versus/production/characters-wave-d-2026-11-24.json) recense 14 appels, 13 sorties et 12 dessins retenus. Une première orientation de Tom est remplacée pour raison de qualité. La READY de Stella a été refusée par le générateur : **aucune relance**, et aucune de ses trois poses dérivées n’a été tentée.

## Décors

| Arène ajoutée | État de référence | Plan médian | Avant-plan |
| --- | --- | --- | --- |
| Mine de Striker | *Western Energy*, S2E4, avant le crash du van | Radiocassette gris et rose | Court tronçon de rail |
| Tribunal infernal | *Mastermind*, S2E11, salle intacte et vidée | Tribune flottante du témoin | Balustrade à pommes et serpent |
| Portes du Paradis | *Welcome to Heaven*, S1E6, portes fermées et intactes | Pupitre bleu facetté | Segment de grille dorée |

Les neuf images sont séparées en trois plans par scène. Le cadrage `contain`, centré en bas, conserve l’architecture entière et son ratio ; des bandes teintées apparaissent suivant la forme de l’arène. La réserve horizontale de 10 px protège le fond contre le décalage maximal de parallaxe de 7,9 px.

Les pistes frontales, l’extraction et le placement des props sont des adaptations AU. L’ID `goetia-court` est conservé pour la stabilité du registre, mais le lieu est décrit comme le tribunal infernal de *Mastermind*, sans en faire une institution réservée aux Goetia. Trois partitions procédurales originales accompagnent les scènes.

Les [mesures et sources des décors](../../art/infernal-versus/production/stages-wave-d-2026-11-24.json) documentent **54 projections de props et 27 cadrages de fonds**, sur trois formats et trois décalages de parallaxe. La marge minimale du contour à alpha ≥16 est de **2,659 px**. Ce sont des calculs et compositions statiques ; les occultations pendant un duel restent à vérifier dans le navigateur.

## Projectiles et effets

| Image nouvelle | Association au jeu | Portée de l’interprétation |
| --- | --- | --- |
| Carte de Husk | Léger et spécial | Carte rouge/noire fondée sur les repères inspectés |
| Lumière d’Adam | Lourd | Rayon lumineux blanc et jaune |
| Portail de Stolas | Lourd | Bord violet et lavande, centre transparent |
| Fumée d’Asmodeus | Spécial | Fumée cyan/menthe/violette |
| Ruban de Beelzebub | Lourd | Ruban fluide doré, sans substance affirmée |

Le tir de Moxxie est réemployé pour les lourds et spéciaux d’Angel Dust et de Blitzø, ainsi que le lourd de Striker. Cela ajoute cinq associations sans nouvelle image de balle. Au total, les cinq nouveaux dessins et ces réemplois apportent **11 associations supplémentaires**, pour **11 images uniques / 24 associations / 14 combattants** dans le registre.

Les effets restent synchronisés aux coups du moteur. Ils n’ajoutent ni physique balistique autonome, ni collision, ni dégâts, ni portée. Le projectile de flamme de Lucifer reste différé, sans génération tentée, faute de référence isolée suffisamment lisible. Les [sources et contrôles VFX](../../art/infernal-versus/production/projectiles-wave-d-2026-11-24.json) distinguent observations et adaptations.

## Couverture mesurée

| Indicateur | Avant cette vague | Après cette vague |
| --- | ---: | ---: |
| Combattants accessibles | 36 | 40 |
| Poses d’attente individuelles | 34 | 37 |
| Gardes individuelles distinctes | 10 | 13 |
| Contacts légers individuels | 12 | 15 |
| Réactions individuelles | 11 | 14 |
| Costumes / poses de costume | 6 / 35 | 6 / 35 |
| Poses clés de finition | 5 | 5 |
| Routes / duels | 36 / 108 | 40 / 120 |
| Affectations narratives illustrées | 26 / 108 | 26 / 120 |
| Arènes à trois plans | 19 | 22 |
| Images VFX / associations | 6 / 13 | 11 / 24 |
| Chemins d’assets référencés | 336 | 377 |
| Références manquantes | 0 | 0 |

Les 26 affectations narratives utilisent toujours 22 illustrations distinctes. Aucune nouvelle illustration de campagne ou de finition n’est comptée. Le portrait de Stella est un repli existant, pas une nouvelle READY dédiée. Les poses de Lute avant blessure restent dans son costume distinct ; les statistiques de l’apparence habituelle ne les confondent pas avec l’incarnation par défaut.

## Validation finale

- **`npm run qa` : sortie 0, 44 suites et 363 tests.** TypeScript et ESLint réussis, builds du manager et du standalone réussis.
- **961 fichiers / 961 empreintes SHA-256 vérifiées** dans le standalone, soit 586 517 302 octets (559,35 Mio).
- **1114 fichiers sources hachés** avant et après la vérification, sans mutation pendant le run.
- **377 références runtime, zéro absente**, selon [ASSET_COVERAGE.json](ASSET_COVERAGE.json).
- Régressions du repli testées sur les quatre personnages et les deux joueurs : introduction, déplacement réel, accroupissement et attaque. K.-O., finition partagée et victoire Katie/Tom testés ; revue indépendante du chemin de rendu effectuée.
- **26 PNG masters identiques à leurs sorties originales** ; 26 WebP comparés après décodage RGBA, et trois miniatures dérivées comparées. Les six props carrés sont réduits proportionnellement de 1254² à 1024² ; aucun étirement de ratio.
- **23 feuilles dans la bible**, dont onze historiques V1 préservées à l’octet ; **200 formules sans erreur, 5361 cellules runtime comparées, huit essais de recalcul restaurés et 21 vues inspectées**. Les chiffres détaillés, recalculs et aperçus figurent dans [QA_WORKBOOK_WAVE_D_2026-11-24.json](QA_WORKBOOK_WAVE_D_2026-11-24.json).

Le [rapport runtime](QA_RUNTIME_WAVE_D_2026-11-24.json) et son [journal](QA_RUNTIME_WAVE_D_2026-11-24.log) décrivent le dernier état, après le correctif des banques. Le premier run réussi précédait ce correctif et n’est pas utilisé comme validation finale.

**Recette navigateur non effectuée :** une tentative normale de lancement Chromium a échoué avant la création de page, sur `socket() EPERM`. Aucun contournement n’a été tenté. Les planches statiques et les tests DOM ne sont pas présentés comme des captures du jeu.

## Éléments encore à produire ou à vérifier

Les états non redessinés des quatre nouveaux personnages nécessitent des cycles complets. Les autres familles conservent une couverture inégale : 27 gardes distinctes, 25 contacts légers et 26 réactions manquent encore pour couvrir les 40 apparences habituelles. Trois READY dédiées manquent dans ces apparences, en distinguant le costume S1 de Lute.

Les 94 affectations narratives sans illustration dédiée utilisent décor et portraits. Les tailles relatives, points d’émission, retournements, contacts au sol et transitions doivent être examinés sur appareil. Les demandes déjà refusées restent sans nouvelle tentative ; aucun fichier fictif n’est compté comme livré.

Avec les deux lots précédents de la PR, le cumul atteint **103 dessins retenus et 214 nouveaux fichiers d’image**, dont huit miniatures pour les huit nouvelles arènes. Les manifestes et rapports précédents restent datés et inchangés ; les anciens chiffres d’archives non retrouvées ne sont pas repris comme état réel.
