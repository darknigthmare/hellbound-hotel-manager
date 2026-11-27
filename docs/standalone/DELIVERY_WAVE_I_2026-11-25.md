# Livraison I — bases statiques et bible V3

Date : 25 novembre 2026. Branche : `feat/infernal-versus-assets-20261124`. Base de comparaison : `6aeb4cf68567b6e38481591d76882c2da35e9a49`. Prolongement de la [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8).

## Résultat

Cette vague livre **6 dessins statiques / 12 fichiers de production** et une bible V3 couvrant les **43 combattants actuellement jouables**. Elle adopte le nom original **Dernier Acte** dans le carnet et l’interface de finition. Les nouvelles campagnes, techniques et mises en scène de finition restent des propositions de conception ; leurs fiches ne remplacent pas les routes ou coups du moteur.

### Six bases en réserve

| Identité | Catégorie | Livrable |
| --- | --- | --- |
| Chazwick Thurman | Personnage | READY transparent, PNG + WebP sans perte |
| Alessio | Ennemi | READY transparent, PNG + WebP sans perte |
| Elder Jaws | Personnage | READY transparent, PNG + WebP sans perte |
| Rolando, forme démoniaque | Ennemi | READY transparent, PNG + WebP sans perte |
| Dennis | Personnage | READY transparent, PNG + WebP sans perte |
| Toledo the Igor | Personnage | READY transparent, PNG + WebP sans perte |

Sept appels de génération produisent six dessins retenus, après remplacement d’une première variante de Rolando ; aucun refus dans cette vague. Les six PNG sont conservés à l’octet, les six WebP sont identiques aux pixels RGBA des masters. Aucun dessin ou cycle d’animation, nouveau kit, stage ou projectile n’est ajouté par I.

Le catalogue cumulatif de réserve compte **13 bases de personnages, 8 bases d’ennemis et 1 projectile**, soit **22 dessins / 44 fichiers présents**. Les sept lots tracés de la PR totalisent **165 dessins / 346 fichiers de production** : 165 PNG, 165 WebP et 16 miniatures. Les diagnostics ne sont pas inclus.

Voir le [manifeste et les empreintes](../../art/infernal-versus/production/delivery-wave-i-2026-11-25.json), le [catalogue cumulatif](../../art/infernal-versus/production/reserve-assets.json) et la [revue des références et dessins](REVIEW_ASSETS_WAVE_I_2026-11-25.md).

## Bible V3

| Contenu | Nombre | Détail |
| --- | ---: | --- |
| Campagnes | 43 | 25 Hazbin, 18 Helluva ; motivation, enjeu, intro, rival, fin, prolongement |
| Chapitres | 129 | Trois confrontations par héros ; adversaire, arène, scène et fonction dramatique |
| Briefs d’illustration | 129 | 43 introductions, 43 rivalités, 43 épilogues |
| Propositions de techniques | 172 | Léger, lourd, spécial et signature pour chaque héros |
| Derniers Actes | 43 | Nom individuel, motif, trois temps, dernière image, limite de continuité et assets requis |
| Repères de lore | 109 | Affirmations et inconnues reliées aux sources |
| Sources de conception | 27 | 25 entrées officielles et deux registres historiques du projet |

Chaque brief d’image détaille le cadrage, la composition, l’action, la lumière, la palette, l’incarnation et les éléments à exclure. Les 26 affectations d’images actuelles sont des candidates à revalider, particulièrement si le rival proposé change ; les 103 autres moments n’ont pas de fichier dédié. **Les 129 briefs ne sont pas 129 illustrations réalisées.**

Les campagnes sont des créations AU. Quelques exemples : Charlie — *Une chambre, un choix*, rival Adam ; Angel Dust — *Le contrat ne raconte pas tout*, rival Valentino ; Alastor — *Fréquence propriétaire*, rival Vox ; Husk — *La dernière mise*, rival Alastor. Les relations établies sont distinguées des rencontres originales du jeu.

### Cohérence des coups et finitions

**105 propositions** sont compatibles en principe avec le socle de contact existant et restent à intégrer et équilibrer. **67** demandent une mécanique nouvelle. **127** portent explicitement le statut d’adaptation à preuves limitées ; une source de motif ne prouve pas l’existence du geste exact proposé.

La relecture a corrigé 48 champs : réponses défensives compatibles avec le moteur, distinction entre appui visuel et déplacement réel, projectiles autonomes de Vox et Blitzø identifiés comme chantiers. Neuf finitions ont reçu des variantes pour adversaire désarmé. Emily fonctionne ainsi contre Sera ; aucune arme adverse inexistante n’est nécessaire.

**Dernier Acte** est un nom inventé pour le jeu, sans prétention de terme canonique. Les noms individuels, dont *La seconde clé*, *Clap de sortie* et *Fin de transmission*, sont des propositions de la bible. Le moteur conserve ses finitions courtes et leurs traitements actuels ; seul le nom du système visible a changé.

Les fiches encadrent les incarnations et les connaissances de saison. Elles ne déduisent pas de pouvoir inédit d’un costume ou d’un accessoire et n’accordent pas automatiquement une âme, une rédemption ou une mort canonique permanente après une victoire.

## Fichiers de travail

- [Bible V3 Excel](INFERNAL_VERSUS_BIBLE_V3.xlsx) : 29 feuilles, dont six nouvelles vues de conception et onze registres V1 préservés.
- [Fiches complètes en lecture continue](INFERNAL_VERSUS_CAMPAIGNS_V3.md).
- [Source structurée des 43 fiches](campaign-design-v3.json).
- [Plan d’extension et état courant](extension-plan.json).
- [Classeur V3 sur Google Drive](https://docs.google.com/spreadsheets/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU/edit?usp=drivesdk&ouid=102406458049746863092&rtpof=true&sd=true).

Le fichier Drive a été remplacé au même identifiant, renommé V3 et relu après l’écriture : format XLSX, taille 372 305 octets et dossier parent conservés. Le classeur V2 reste archivé dans Git.

## Validation

| Contrôle | Résultat |
| --- | --- |
| TypeScript et ESLint | Réussis |
| Tests | 44 suites, 376 tests réussis |
| Builds | Manager et standalone réussis |
| Intégrité standalone | 1 031 fichiers et SHA-256 vérifiés ; 626 287 158 octets |
| Couverture | 428 chemins actifs et 44 fichiers de réserve présents |
| Workbook | 29 feuilles, 222 formules vérifiées indépendamment, aucune erreur |
| Concordance | 11 577 cellules courantes comparées, aucun écart |
| Histoire du classeur | 11 feuilles V1 identiques à l’octet, dans leur ordre historique |
| Mise en page | 29 vues de contrôle rendues et inspectées |
| Exports I | 6 masters inchangés, 6 WebP sans perte identiques aux pixels |
| Conception | 43 fiches complètes et relations/source IDs/slots validés |

Les phases du contrôle qualité ont été exécutées séparément. Le contrôle des formules utilise les caches exportés par Artifact Tool et une évaluation indépendante ; aucune recalculation native Excel ou LibreOffice n’est revendiquée. Les vues de contrôle sont des échantillons de plages. Aucun nouveau navigateur ni capture du jeu n’a été réalisé pour I.

Les rapports détaillés sont [runtime](QA_RUNTIME_WAVE_I_2026-11-25.json), [workbook](QA_WORKBOOK_WAVE_I_2026-11-25.json), [conception](QA_DESIGN_WAVE_I_2026-11-25.json) et [revue visuelle](qa-wave-i-2026-11-25/README.md). Ils décrivent le lot local vérifié ; la vérification de publication et le statut CI du nouveau commit se relisent sur la PR.

## Limites de fidélité documentées

L’objectif reste de suivre au plus près les références. **Une fidélité exacte 1:1 n’est pas certifiée.** Les aperçus officiels inspectés mesurent principalement 320 × 180. Toledo ne possède pas de gros plan officiel inspecté dans ce lot, et les détails fins d’Elder Jaws dépendent surtout du portrait historique. Les poses neutres sont des adaptations. La copie sans perte garantit les pixels du dessin généré, pas son égalité avec le canon.

Les références de conception comprennent les résumés accessibles, métadonnées officielles et clips ; elles ne correspondent pas à une vérification intégrale image par image des épisodes. Les réserves n’ont ni kit de combat ni campagne active. Les 43 combattants jouables, 30 arènes à trois plans, 133 attaques, 43 routes et 129 duels du moteur restent ceux de H. Les refus et différés des lots antérieurs conservent leur statut.
