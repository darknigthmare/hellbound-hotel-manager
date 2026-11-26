# Livraison statique V7 — 26 novembre 2026

La production statique V7 livre **45 dessins distincts** : 44 nouveaux dessins et 1 correction d’un dessin existant. Les fichiers livrables comprennent **45 masters PNG, 45 exports WebP sans perte et 3 miniatures**, soit **93 fichiers d’image** (80 143 856 octets). Chaque personnage, objet, machine, fond et élément de décor possède son fichier séparé. Aucun cycle animé n’est ajouté.

Sources de suivi : [registre vérifié](production-v7/delivery-register.json), [revue indépendante](production-v7/reviews-v7.md), [références](production-v7/references.json), [bible V7](INFERNAL_VERSUS_BIBLE_V7.xlsx), [PR nº8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8). Base de cette continuation : `b0e76e35edfda695ec788bce67823073980d9217`.

## Productions livrées

| Catégorie | Dessins V7 | Portée |
|---|---:|---|
| Bases de personnages | 24 | Une identité et une incarnation statique par image |
| Bases de soutien | 2 | Huskettes féline et imp, séparées |
| Incarnations / costumes | 2 | Millie avec queue de cheval ; Loona quadrupède |
| Archives narratives | 2 | Loona au refuge en buste ; Fizz avant accident en entier |
| Machines / constructions | 4 | Trois mechas C.H.E.R.U.B. ; construction de glace initiale d’Andrealphus |
| Accessoire | 1 | Money Shot de Valentino |
| Fonds d’arène | 3 | Sloth extérieur ; désert australien S3 ; hall vitré des enchères S3 |
| Éléments de décor séparés | 6 | Deux éléments indépendants pour chaque nouvelle arène |
| Correction | 1 | Motif du mollet d’Apple ; ancienne version conservée |

**Hazbin Hotel — nouvelles bases :** St. Peter, Susan, Maestro, Prick, Hatchet, Huskette féline, Huskette imp.

**Helluva Boss — nouvelles bases :** Ace, Emberlynn Pinkle, Frank McTickly Wrigglers, Paulie Paesano, Luigi Paesano, Gerardo Velazquez, Gerardo's Wife, Mr. Mayor, Bigfoot Waiter, Gorilla Suit Guy — costume before attack, Arick “Burnie” Burnz, Rita, Bethany, Jesse, Karen — cliente de Sinsmas, Kendra, Responsable du refuge des hellhounds, Uggie, Fils de Martha.

Les variantes et archives n’ajoutent aucune identité autonome aux compteurs. Le buste de Loona ne vaut pas livraison d’un corps entier. Les jeunes personnages des archives restent dans la galerie narrative ; aucun kit de combat n’est créé. La construction de glace à une tête ne couvre pas la forme multi-têtes complète. Les trois fichiers du premier candidat de hall rejeté sont conservés à titre d’historique, hors des 93 fichiers livrables et hors des 45 dessins retenus.

## Intégration effective

| Indicateur | Avant V7 | Après V7 |
|---|---:|---:|
| Combattants jouables | 43 | 43 |
| Bases autonomes | 83 | 109 |
| Bases actives / en réserve | 40 / 43 | 40 / 69 |
| Entrées de galerie | 49 | 84 |
| Arènes du catalogue | 37 | 40 |
| Familles de costumes jouables | 11 | 11 |
| Images personnelles affectées | 127/129 | 127/129 |
| Images globales affectées | 11/11 | 11/11 |

Les dessins hors décor sont consultables dans la galerie. Apple conserve son identifiant d’entrée ; son image courante est remplacée par le master V7, avec conservation des anciens chemins et empreintes dans l’historique. Les arènes utilisent les nouveaux fonds et les six éléments séparés. Le manager conserve ses huit arènes.

Les deux arènes S3 sont masquées par défaut. L’option explicite **Autoriser les décors et créations de saison 3** est conservée dans la sauvegarde et partagée par le choix d’arène, la rotation des parcours et la galerie. Une ancienne sauvegarde sans ce champ conserve la valeur false. La révocation remplace une sélection S3 devenue indisponible par une arène autorisée, sans effacer le parcours ni les résultats. Le catalogue contient 40 arènes, dont 38 disponibles sans cette option.

## Contrôles réalisés

47 suites et 413 tests passent. TypeScript, ESLint, les builds manager et standalone, et le contrôle de 1 263 fichiers de distribution passent. Deux essais de build standard ont été interrompus avec le code 137 pendant la copie des images. La validation locale utilise ensuite une compilation équivalente avec copie publique désactivée temporairement et fichiers publics assemblés par liens physiques ; les empreintes et le contrôle standalone sont vérifiés. Cette procédure ne constitue pas une réussite locale de la commande npm run qa standard.

Le [relevé runtime](production-v7/active-asset-coverage.json) vérifie **659 chemins d’assets**, sans référence cassée. Le [contrôle d’images](production-v7/image-file-qa.json) compare les pixels décodés des PNG et WebP : export sans perte à la taille native. Cette égalité technique ne certifie pas la fidélité au dessin de référence.

Les 45 masters sont liés par leur empreinte SHA-256 à une revue indépendante. Les silhouettes, le cadrage et l’alpha sont inspectés ; les nouveaux décors font aussi l’objet de compositions statiques selon leurs paramètres CSS. Ces montages ne sont pas des captures du jeu en navigateur.

**La validation visuelle en navigateur et la mesure des performances mobiles ne sont pas exécutées.** Le [rapport navigateur](production-v7/browser-qa.json) documente l’absence du binaire Chromium. Le statut inGameChecked reste false. La conformité artistique 1:1 n’est pas certifiée : détails fins, poses de présentation et parties reconstituées sont explicités dans chaque fiche.

## Bible et conservation

Le classeur V7 conserve les **43 feuilles historiques V6** et ajoute **Production V7, Cibles V7 et Repères V7**, pour **46 feuilles**. Les anciennes bibles et leurs registres restent conservés. Le contrôle du classeur vérifie l’intégrité des feuilles historiques, le rendu des nouvelles tables, le recalcul et la réouverture de l’export.

Le fichier de suivi Drive garde son identifiant : [INFERNAL_VERSUS_BIBLE_V7.xlsx](https://drive.google.com/file/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU). Le remplacement porte sur un fichier XLSX ; il ne convertit pas le document en Google Sheets natif.

## Manquants et limites explicites

Le catalogue contient 209 IDs, soit 208 identités de production après l’alias connu de Travis. Il reste **100 IDs sans base autonome**, correspondant à **99 identités distinctes**. Les groupes, personnages de pilote, mentions sans modèle, entrées futures et incarnations à définir ne sont pas transformés en personnages inventés. Le tableau individuel du registre conserve le statut et la preuve requise pour chaque cible.

9 demandes V7 ont été refusées par le générateur. Aucun fichier n’est compté pour ces sorties, aucune relance n’a été effectuée après ces refus :

- `hz_speaker_of_god-ready` — voir journal de génération.
- `hz_rooster-ready` — voir journal de génération.
- `hz_ant_sinner-ready` — voir journal de génération.
- `hz_eel_sinner-ready` — voir journal de génération.
- `hz_salina-ready` — voir journal de génération.
- `hz_shok_wav-ready` — Shok.wav.
- `hz_huskette_spider-ready` — Huskette arachnéenne.
- `sirpentious-redeemed-ready` — Sir Pentious — racheté au Paradis.
- `pentious-airship-s1` — voir journal de génération.

Les refus historiques, notamment les deux scènes personnelles encore absentes, restent conservés. Le refus de l’aéronef S1 ne ferme pas la lacune distincte du dirigeable du pilote. VAR-010, Pentious racheté, reste sans fichier vérifiable après recherche historique et refus de génération V7.

- **vox-tower** : Bureau de Vox S2 livré en V6 ; ne vaut pas reconstitution de toute la tour.
- **sloth-hospital** : Salle d’attente V5 conservée et façade/parvis V7 effectivement livrés séparément. La lacune visuelle de façade est résolue. Vérification navigateur et performances mobiles encore manquantes.
- **hb-australia** : Fond désert et deux objets V7 livrés. Le reste du lieu n’est pas reconstitué ; composition adaptée au combat, QA navigateur/mobile non exécutée.
- **hb-auction** : Un hall vitré cyan livré avec banc et ornement séparés ; ni salle de vente complète ni carte globale. QA navigateur/mobile non exécutée.
- **hb-ice-palace** : Le pavillon/jardin glacé S2E12 est déjà couvert par sinsmas-frozen-pavilion ; aucun second palais identique n’est ajouté. Le dragon initial à une tête est livré en V7. La construction multi-têtes entière et les piliers spécifiques du boss restent hors de la couverture statique qualifiée.

L’[audit environnement](production-v7/environment-audit.md) détaille aussi la flèche C.H.E.R.U.B., le shuriken D.H.O.R.K.S., le toit de l’ancien hôtel, l’arme des Vees et son site, la forme de glace multi-têtes, la salle principale des enchères et Big Woobly. Les qualifications [Helluva](production-v7/helluva-qualification.md) et [Hazbin](production-v7/hazbin-qualification.md) distinguent les identités réellement documentées de celles dont la vue entière, les contours ou les détails restent insuffisants.

## Inventaire des dessins retenus

Les empreintes complètes, dimensions, octets, références, prompts et limites sont dans le registre et les journaux. Chaque ligne ci-dessous correspond à un dessin réel retenu ; une miniature ou une correction technique ne crée pas de nouvelle identité.

| ID | Catégorie | Dimensions | Master | Export |
|---|---|---|---|---|
| hz_st_peter-ready | Base de personnage | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hz_st_peter-ready.png) | [WebP](../../public/assets/sprites/reserve/hz_st_peter-ready.webp) |
| hz_susan-ready | Base de personnage | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hz_susan-ready.png) | [WebP](../../public/assets/sprites/reserve/hz_susan-ready.webp) |
| hz_maestro-ready | Base de personnage | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hz_maestro-ready.png) | [WebP](../../public/assets/sprites/reserve/hz_maestro-ready.webp) |
| hz_prick-ready | Base de personnage | 1086 × 1448 | [PNG](../../art/infernal-versus/masters/base/hz_prick-ready.png) | [WebP](../../public/assets/sprites/reserve/hz_prick-ready.webp) |
| hz_hatchet-ready | Base de personnage | 1145 × 1374 | [PNG](../../art/infernal-versus/masters/base/hz_hatchet-ready.png) | [WebP](../../public/assets/sprites/reserve/hz_hatchet-ready.webp) |
| hz_huskette_cat-ready | Base de soutien | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hz_huskette_cat-ready.png) | [WebP](../../public/assets/sprites/reserve/hz_huskette_cat-ready.webp) |
| hz_huskette_imp-ready | Base de soutien | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hz_huskette_imp-ready.png) | [WebP](../../public/assets/sprites/reserve/hz_huskette_imp-ready.webp) |
| hb_ace-ready | Base de personnage | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hb_ace-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_ace-ready.webp) |
| hb_emberlynn_pinkle-ready | Base de personnage | 1199 × 1312 | [PNG](../../art/infernal-versus/masters/base/hb_emberlynn_pinkle-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_emberlynn_pinkle-ready.webp) |
| hb_frank_mctickly_wrigglers-ready | Base de personnage | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hb_frank_mctickly_wrigglers-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_frank_mctickly_wrigglers-ready.webp) |
| hb_paulie_paesano-ready | Base de personnage | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hb_paulie_paesano-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_paulie_paesano-ready.webp) |
| hb_luigi_paesano-ready | Base de personnage | 1086 × 1448 | [PNG](../../art/infernal-versus/masters/base/hb_luigi_paesano-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_luigi_paesano-ready.webp) |
| hb_gerardo_velazquez-ready | Base de personnage | 1199 × 1312 | [PNG](../../art/infernal-versus/masters/base/hb_gerardo_velazquez-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_gerardo_velazquez-ready.webp) |
| hb_gerardos_wife-ready | Base de personnage | 1199 × 1312 | [PNG](../../art/infernal-versus/masters/base/hb_gerardos_wife-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_gerardos_wife-ready.webp) |
| hb_mr_mayor-ready | Base de personnage | 1199 × 1312 | [PNG](../../art/infernal-versus/masters/base/hb_mr_mayor-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_mr_mayor-ready.webp) |
| hb_bigfoot_waiter-ready | Base de personnage | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hb_bigfoot_waiter-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_bigfoot_waiter-ready.webp) |
| hb_gorilla_suit_guy-ready | Base de personnage | 1199 × 1312 | [PNG](../../art/infernal-versus/masters/base/hb_gorilla_suit_guy-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_gorilla_suit_guy-ready.webp) |
| hb_arick_burnz-ready | Base de personnage | 1199 × 1312 | [PNG](../../art/infernal-versus/masters/base/hb_arick_burnz-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_arick_burnz-ready.webp) |
| hb_rita-ready | Base de personnage | 1199 × 1312 | [PNG](../../art/infernal-versus/masters/base/hb_rita-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_rita-ready.webp) |
| hb_bethany_ghostfucker-ready | Base de personnage | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hb_bethany_ghostfucker-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_bethany_ghostfucker-ready.webp) |
| hb_jesse-ready | Base de personnage | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hb_jesse-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_jesse-ready.webp) |
| hb_millie_past_ponytail-ready | Incarnation statique | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hb_millie_past_ponytail-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_millie_past_ponytail-ready.webp) |
| hb_loona_quadruped-ready | Incarnation statique | 1921 × 819 | [PNG](../../art/infernal-versus/masters/base/hb_loona_quadruped-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_loona_quadruped-ready.webp) |
| hb_karen_client-ready | Base de personnage | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hb_karen_client-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_karen_client-ready.webp) |
| hb_kendra-ready | Base de personnage | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hb_kendra-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_kendra-ready.webp) |
| hb_hellhound_adoption_lady-ready | Base de personnage | 1142 × 1378 | [PNG](../../art/infernal-versus/masters/base/hb_hellhound_adoption_lady-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_hellhound_adoption_lady-ready.webp) |
| hb_uggie-ready | Base de personnage | 1254 × 1254 | [PNG](../../art/infernal-versus/masters/base/hb_uggie-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_uggie-ready.webp) |
| hb_marthas_son-ready | Base de personnage | 1199 × 1312 | [PNG](../../art/infernal-versus/masters/base/hb_marthas_son-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_marthas_son-ready.webp) |
| hb_loona_shelter_archive-ready | Archive narrative | 1312 × 1199 | [PNG](../../art/infernal-versus/masters/base/hb_loona_shelter_archive-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_loona_shelter_archive-ready.webp) |
| hb_fizzarolli_before_accident-ready | Archive narrative | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hb_fizzarolli_before_accident-ready.png) | [WebP](../../public/assets/sprites/reserve/hb_fizzarolli_before_accident-ready.webp) |
| valentino-money-shot-s1 | Accessoire | 2172 × 724 | [PNG](../../art/infernal-versus/masters/props/valentino-money-shot-s1.png) | [WebP](../../public/assets/props/infernal-versus/valentino-money-shot-s1.webp) |
| sloth-hospital-exterior-room | Fond d’arène | 1672 × 941 | [PNG](../../art/infernal-versus/masters/stages/sloth-hospital-exterior-room.png) | [WebP](../../public/assets/stages/helluva/sloth-hospital-exterior/room.webp) |
| sloth-hospital-exterior-bench | Élément séparé d’arène | 1774 × 887 | [PNG](../../art/infernal-versus/masters/stages/sloth-hospital-exterior-bench.png) | [WebP](../../public/assets/stages/helluva/sloth-hospital-exterior/prop-middle.webp) |
| sloth-hospital-exterior-lamp | Élément séparé d’arène | 724 × 2172 | [PNG](../../art/infernal-versus/masters/stages/sloth-hospital-exterior-lamp.png) | [WebP](../../public/assets/stages/helluva/sloth-hospital-exterior/prop-near.webp) |
| cherub-cletus-mech-s2 | Machine / construction | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/machines/cherub-cletus-mech-s2.png) | [WebP](../../public/assets/machines/infernal-versus/cherub-cletus-mech-s2.webp) |
| cherub-collin-mech-s2 | Machine / construction | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/machines/cherub-collin-mech-s2.png) | [WebP](../../public/assets/machines/infernal-versus/cherub-collin-mech-s2.webp) |
| cherub-keenie-mech-s2 | Machine / construction | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/machines/cherub-keenie-mech-s2.png) | [WebP](../../public/assets/machines/infernal-versus/cherub-keenie-mech-s2.webp) |
| andrealphus-ice-dragon-s2 | Machine / construction | 1536 × 1024 | [PNG](../../art/infernal-versus/masters/machines/andrealphus-ice-dragon-s2.png) | [WebP](../../public/assets/machines/infernal-versus/andrealphus-ice-dragon-s2.webp) |
| australia-desert-s3-room | Fond d’arène | 1672 × 941 | [PNG](../../art/infernal-versus/masters/stages/australia-desert-s3-room.png) | [WebP](../../public/assets/stages/helluva/australia-desert-s3/room.webp) |
| australia-desert-s3-rock | Élément séparé d’arène | 2172 × 724 | [PNG](../../art/infernal-versus/masters/stages/australia-desert-s3-rock.png) | [WebP](../../public/assets/stages/helluva/australia-desert-s3/prop-middle.webp) |
| australia-desert-s3-grass | Élément séparé d’arène | 1774 × 887 | [PNG](../../art/infernal-versus/masters/stages/australia-desert-s3-grass.png) | [WebP](../../public/assets/stages/helluva/australia-desert-s3/prop-near.webp) |
| auction-glass-hall-s3-room | Fond d’arène | 1672 × 941 | [PNG](../../art/infernal-versus/masters/stages/auction-glass-hall-s3-room.png) | [WebP](../../public/assets/stages/helluva/auction-glass-hall-s3/room.webp) |
| auction-glass-hall-s3-bench | Élément séparé d’arène | 1774 × 887 | [PNG](../../art/infernal-versus/masters/stages/auction-glass-hall-s3-bench.png) | [WebP](../../public/assets/stages/helluva/auction-glass-hall-s3/prop-middle.webp) |
| auction-glass-hall-s3-ornament | Élément séparé d’arène | 887 × 1774 | [PNG](../../art/infernal-versus/masters/stages/auction-glass-hall-s3-ornament.png) | [WebP](../../public/assets/stages/helluva/auction-glass-hall-s3/prop-near.webp) |
| hb_apple-ready-v7 | Correction d’un dessin existant | 1024 × 1536 | [PNG](../../art/infernal-versus/masters/base/hb_apple-ready-v7.png) | [WebP](../../public/assets/sprites/reserve/hb_apple-ready-v7.webp) |
