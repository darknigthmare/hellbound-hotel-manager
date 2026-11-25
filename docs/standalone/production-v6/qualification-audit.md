# Infernal Versus — audit de concordance V6

**État de qualification avant nouvelle production — 25 novembre 2026.**

Référence : PR #8, commit `8d34176aa08dbd566230e5a4742487d64d731cd9`. Cet audit ajoute une vue actuelle des manques. Les fichiers V5 et leurs chiffres historiques restent inchangés. Les quatorze fiches ci-dessous sont des demandes de qualification : **aucun nouveau dessin n’est compté comme livré par cet audit**.

## 1. Les nombres à utiliser

| Périmètre | État vérifié dans V5 |
| --- | ---: |
| IDs du catalogue | 209 |
| Identités de production après l’alias Travis connu | 208 |
| Combattants jouables | 43 |
| Bases autonomes explicitement disponibles | 77 |
| Bases actives / bases en réserve | 40 / 37 |
| IDs sans base autonome | 132 |
| Identités de production sans base après l’alias connu | 131 |
| Entrées de galerie, toutes catégories | 42 |
| Familles de costumes runtime | 11 |
| Arènes actives | 35 |
| Scènes personnelles illustrées | 127 / 129 |
| Campagne globale, chapitres et encadrements illustrés | 11 / 11 |

Les 209 IDs comprennent des personnes, groupes, créations AU, références au pilote et entrées futures. Ils ne désignent pas 209 personnages canoniques distincts. Les 42 entrées de galerie incluent d’autres objets que les 37 bases en réserve.

Pour décider si une base manque, utiliser `baseAvailable`, `currentBasePath` et `currentState` dans `production-static-v5.json`. `actualStaticState` décrit le point de départ de V5 : une ligne peut encore y être marquée « portrait seulement » tout en possédant depuis un master accepté.

**Projection, pas livraison :** si les 14 identités distinctes proposées obtiennent chacune un dessin accepté, les bases autonomes passeront de 77 à 91 et les IDs sans base de 132 à 118. Tant que les fichiers et la revue n’existent pas, les compteurs restent 77 et 132.

## 2. Corrections de lecture démontrées

### Bases et incarnations

Les 16 bases de personnages ou ennemis de V5 sont déjà produites : Octavia, Satan, Yogirt, Bombproof, Lyle Lipton, Counselor Jimmy, Muffy, Dr. Somna, Rachel, Beau, Bea, Honey, Marlow Glass, Ember Vale, Ralphie et Catfish Monster. Les deux créations Marlow/Ember restent explicitement AU. Les anciennes files de génération ne constituent plus une liste de manques.

Lute possède déjà sa pose `public/assets/sprites/individual/lute-ready.webp` dans la tenue facultative avant blessure. Son absence de base par défaut ne justifie pas de régénérer cette même tenue : une autre incarnation doit être définie et référencée séparément. Stella et Cherri Bomb conservent leurs limites et refus historiques.

### Costumes

| ID | Sujet | Statut du plan historique | État V5 à retenir |
| --- | --- | --- | --- |
| VAR-003 | Exorciste — archive | À produire | Costume actif existant |
| VAR-009 | Pécheur — inventeur | À produire | existing_default_incarnation |
| VAR-013 | Avant / après final S1 | Partiel | Costume actif existant |
| VAR-014 | Cheveux lâchés — entraînement | Partiel | Costume actif existant |
| VAR-018 | Moxxine — camping | À produire | Costume statique produit |
| VAR-019 | Millerd — camping | À produire | Costume statique produit |
| VAR-021 | Déguisement humain | À produire | Costume actif existant |
| VAR-024 | Prince — pouvoirs conservés | À produire | existing_default_incarnation |
| VAR-025 | Déchu — après Mastermind | À produire | Costume statique produit |
| VAR-026 | Déguisement humain | À produire | Costume actif existant |
| VAR-030 | Scène / tenue de repos | À produire | Costume statique produit |
| VAR-032 | Déguisement humain | À produire | Costume statique produit |
| VAR-033 | Déguisement humain | À produire | Costume statique produit |

Les six costumes statiques V5 ne deviennent pas des banques d’animation. La tenue humaine de Barbie Wire reste une réserve ; les costumes équipables suivent leur registre runtime. Les états de combat composites, par exemple Striker monté sur Bombproof, restent distincts d’une nouvelle identité.

### Lieux et alias

| Entrée du plan | ID du jeu | Décision de concordance |
| --- | --- | --- |
| `imp-office` | `imp-reception` | Réception I.M.P. déjà couverte ; conserver l’alias. |
| `ozzies` | `ozzies-cabaret` | Même lieu au runtime ; ne pas compter un nouveau décor manquant. |
| `human-beach` | `spring-broken-beach` | Plage de Spring Broken déjà livrée. |
| `sloth-hospital` | `sloth-hospital` | Décor livré par V5 malgré l’ancien statut « À produire ». |
| `hb-ice-palace` | `sinsmas-frozen-pavilion` | Recouvrement possible : établir un lieu ou point de vue distinct avant production. |
| `hb-australia`, `hb-auction` | Aucun rattachement établi | Les mentions S3 du plan ne sont pas une preuve d’épisode ; vérifier une source primaire avant création canonique. |

Le pavillon gelé ne prouve pas que chaque pièce d’un domaine est couverte. Inversement, un ancien nom large ne prouve pas qu’un second dessin identique manque.

### Campagnes

Les 127 scènes personnelles et les 11 scènes globales sont déjà raccordées. Les formulations IV-G08 et IV-G09 issues de V4 décrivent l’ancien état de production ; elles ne doivent plus faire recompter ces images comme absentes.

Les seules scènes personnelles encore sans nouvel asset dans ce périmètre sont `personal:husk:3:rival` et `personal:sirpentious:3:intro`, toutes deux `historical_policy_refusal_no_retry`. Leur affichage de secours est conservé. Cet audit ne planifie pas de relance.

## 3. Quatorze fiches de qualification

Chaque fiche vise **un seul sujet entier, en pose neutre statique, sur fond transparent**, sans nouveau cycle ni kit jouable implicite. Le portrait du dépôt sert à retrouver l’identité ; il ne remplace pas une référence canonique. Les pages officielles Helluva ci-dessous ont été rouvertes pour contrôler leur titre, sans inspection nouvelle de plans certifiée par cet audit.

| Priorité | ID | Sujet | Source primaire à inspecter |
| --- | --- | --- | --- |
| 1 | `hz_keekee` | KeeKee | [Hazbin Hotel S1](https://www.primevideo.com/detail/0HZWTBZYQQXYW48YBANMDM2MZE) |
| 2 | `hz_fat_nuggets` | Fat Nuggets | [Hazbin Hotel S1](https://www.primevideo.com/detail/0HZWTBZYQQXYW48YBANMDM2MZE) |
| 3 | `hz_razzle` | Razzle | [Hazbin Hotel S1](https://www.primevideo.com/detail/0HZWTBZYQQXYW48YBANMDM2MZE) |
| 4 | `hz_dazzle` | Dazzle | [Hazbin Hotel S1](https://www.primevideo.com/detail/0HZWTBZYQQXYW48YBANMDM2MZE) |
| 5 | `hz_frank_egg_boi` | Frank | [Hazbin Hotel S1](https://www.primevideo.com/detail/0HZWTBZYQQXYW48YBANMDM2MZE) |
| 6 | `hb_coco` | Coco | [Helluva Boss — Spring Broken S1E3](https://www.youtube.com/watch?v=RghsgkZKedg) |
| 7 | `hb_apple` | Apple | [Helluva Boss — Spring Broken S1E3](https://www.youtube.com/watch?v=RghsgkZKedg) |
| 8 | `hb_kat` | Kat | [Helluva Boss — Spring Broken S1E3](https://www.youtube.com/watch?v=RghsgkZKedg) |
| 9 | `hb_milky` | Milky | [Helluva Boss — Spring Broken S1E3](https://www.youtube.com/watch?v=RghsgkZKedg) |
| 10 | `hb_kiki` | Kiki | [Helluva Boss — Spring Broken S1E3](https://www.youtube.com/watch?v=RghsgkZKedg) |
| 11 | `hb_josh` | Josh | [Helluva Boss — Spring Broken S1E3](https://www.youtube.com/watch?v=RghsgkZKedg) |
| 12 | `hb_vikki` | Vikki | [Helluva Boss — Queen Bee S1E8](https://www.youtube.com/watch?v=D-2799Y07Zc) |
| 13 | `hb_gigi` | Gigi | [Helluva Boss — Queen Bee S1E8](https://www.youtube.com/watch?v=D-2799Y07Zc) |
| 14 | `hb_russ` | Russ | [Helluva Boss — Queen Bee S1E8](https://www.youtube.com/watch?v=D-2799Y07Zc) |

### 1. KeeKee — hz_keekee

- **Portée :** Hazbin Hotel, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hz_keekee` — Hazbin Hotel Season 1.
- **Source à inspecter :** [Hazbin Hotel S1](https://www.primevideo.com/detail/0HZWTBZYQQXYW48YBANMDM2MZE). Existence et périmètre de la saison ; ne constitue pas une référence visuelle de ce personnage.
- **Portrait interne :** `public/assets/sprites/hazbin/portraits/hz_keekee.png`.
- **Points à verrouiller :** Incarnation féline de la série S1 ; la forme de clé est un accessoire/une incarnation distincte. Contrôler œil, palette, marques, queue et quatre pattes dans une référence de la même incarnation.
- **Sorties proposées :** `art/infernal-versus/masters/base/hz_keekee-ready.png` et `public/assets/sprites/reserve/hz_keekee-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 2. Fat Nuggets — hz_fat_nuggets

- **Portée :** Hazbin Hotel, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hz_fat_nuggets` — Hazbin Hotel Season 1.
- **Source à inspecter :** [Hazbin Hotel S1](https://www.primevideo.com/detail/0HZWTBZYQQXYW48YBANMDM2MZE). Existence et périmètre de la saison ; ne constitue pas une référence visuelle de ce personnage.
- **Portrait interne :** `public/assets/sprites/hazbin/portraits/hz_fat_nuggets.png`.
- **Points à verrouiller :** Familier porcin d’Angel, modèle série S1 ; ne pas importer silencieusement une variante pilote/clip. Contrôler oreilles, cornes/marques visibles, proportions et sabot de chaque patte.
- **Sorties proposées :** `art/infernal-versus/masters/base/hz_fat_nuggets-ready.png` et `public/assets/sprites/reserve/hz_fat_nuggets-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 3. Razzle — hz_razzle

- **Portée :** Hazbin Hotel, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hz_razzle` — Hazbin Hotel Season 1.
- **Source à inspecter :** [Hazbin Hotel S1](https://www.primevideo.com/detail/0HZWTBZYQQXYW48YBANMDM2MZE). Existence et périmètre de la saison ; ne constitue pas une référence visuelle de ce personnage.
- **Portrait interne :** `public/assets/sprites/hazbin/portraits/hz_razzle.png`.
- **Points à verrouiller :** Individu distinct de Dazzle ; petite forme compagnon uniquement dans cette fiche. Comparer couleurs, visage, cornes et ailes entre les deux individus ; une grande forme demanderait sa propre fiche.
- **Sorties proposées :** `art/infernal-versus/masters/base/hz_razzle-ready.png` et `public/assets/sprites/reserve/hz_razzle-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 4. Dazzle — hz_dazzle

- **Portée :** Hazbin Hotel, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hz_dazzle` — Hazbin Hotel S1E08.
- **Source à inspecter :** [Hazbin Hotel S1](https://www.primevideo.com/detail/0HZWTBZYQQXYW48YBANMDM2MZE). Existence et périmètre de la saison ; ne constitue pas une référence visuelle de ce personnage.
- **Portrait interne :** `public/assets/sprites/hazbin/portraits/hz_dazzle.png`.
- **Points à verrouiller :** Individu distinct de Razzle ; petite forme compagnon uniquement dans cette fiche. Préserver l’incarnation et sa période ; ne pas utiliser une grande forme ou un état final comme base générale.
- **Sorties proposées :** `art/infernal-versus/masters/base/hz_dazzle-ready.png` et `public/assets/sprites/reserve/hz_dazzle-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 5. Frank — hz_frank_egg_boi

- **Portée :** Hazbin Hotel, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hz_frank_egg_boi` — Hazbin Hotel Season 1.
- **Source à inspecter :** [Hazbin Hotel S1](https://www.primevideo.com/detail/0HZWTBZYQQXYW48YBANMDM2MZE). Existence et périmètre de la saison ; ne constitue pas une référence visuelle de ce personnage.
- **Portrait interne :** `public/assets/sprites/hazbin/portraits/hz_frank_egg_boi.png`.
- **Points à verrouiller :** Individu nommé, distinct de l’entrée collective hz_egg_boiz. Contrôler numéro/marque et tenue sur un plan attribuable ; le portrait interne ne confirme pas seul l’identité.
- **Sorties proposées :** `art/infernal-versus/masters/base/hz_frank_egg_boi-ready.png` et `public/assets/sprites/reserve/hz_frank_egg_boi-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 6. Coco — hb_coco

- **Portée :** Helluva Boss, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hb_coco` — Helluva Boss S1E3.
- **Source à inspecter :** [Helluva Boss — Spring Broken S1E3](https://www.youtube.com/watch?v=RghsgkZKedg). Cible d’inspection visuelle ; le titre de la page a été relu, aucun plan nouveau certifié.
- **Portrait interne :** `public/assets/sprites/helluva/portraits/hb_coco.png`.
- **Points à verrouiller :** Membre du groupe de Spring Broken ; distinguer la silhouette et la tenue des cinq autres fiches. Nom tiré du catalogue, à rapprocher du plan primaire ; ne pas fusionner plusieurs silhouettes.
- **Sorties proposées :** `art/infernal-versus/masters/base/hb_coco-ready.png` et `public/assets/sprites/reserve/hb_coco-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 7. Apple — hb_apple

- **Portée :** Helluva Boss, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hb_apple` — Helluva Boss S1E3.
- **Source à inspecter :** [Helluva Boss — Spring Broken S1E3](https://www.youtube.com/watch?v=RghsgkZKedg). Cible d’inspection visuelle ; le titre de la page a été relu, aucun plan nouveau certifié.
- **Portrait interne :** `public/assets/sprites/helluva/portraits/hb_apple.png`.
- **Points à verrouiller :** Membre du groupe de Spring Broken ; distinguer la silhouette et la tenue des cinq autres fiches. Nom tiré du catalogue, à rapprocher du plan primaire ; conserver les éventuelles asymétries.
- **Sorties proposées :** `art/infernal-versus/masters/base/hb_apple-ready.png` et `public/assets/sprites/reserve/hb_apple-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 8. Kat — hb_kat

- **Portée :** Helluva Boss, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hb_kat` — Helluva Boss S1E3.
- **Source à inspecter :** [Helluva Boss — Spring Broken S1E3](https://www.youtube.com/watch?v=RghsgkZKedg). Cible d’inspection visuelle ; le titre de la page a été relu, aucun plan nouveau certifié.
- **Portrait interne :** `public/assets/sprites/helluva/portraits/hb_kat.png`.
- **Points à verrouiller :** Membre du groupe de Spring Broken ; distinguer la silhouette et la tenue des cinq autres fiches. Nom tiré du catalogue, à rapprocher du plan primaire ; costume fixé sur un moment unique.
- **Sorties proposées :** `art/infernal-versus/masters/base/hb_kat-ready.png` et `public/assets/sprites/reserve/hb_kat-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 9. Milky — hb_milky

- **Portée :** Helluva Boss, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hb_milky` — Helluva Boss S1E3.
- **Source à inspecter :** [Helluva Boss — Spring Broken S1E3](https://www.youtube.com/watch?v=RghsgkZKedg). Cible d’inspection visuelle ; le titre de la page a été relu, aucun plan nouveau certifié.
- **Portrait interne :** `public/assets/sprites/helluva/portraits/hb_milky.png`.
- **Points à verrouiller :** Membre du groupe de Spring Broken ; distinguer la silhouette et la tenue des cinq autres fiches. Nom tiré du catalogue, à rapprocher du plan primaire ; aucun accessoire absent des références.
- **Sorties proposées :** `art/infernal-versus/masters/base/hb_milky-ready.png` et `public/assets/sprites/reserve/hb_milky-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 10. Kiki — hb_kiki

- **Portée :** Helluva Boss, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hb_kiki` — Helluva Boss S1E3.
- **Source à inspecter :** [Helluva Boss — Spring Broken S1E3](https://www.youtube.com/watch?v=RghsgkZKedg). Cible d’inspection visuelle ; le titre de la page a été relu, aucun plan nouveau certifié.
- **Portrait interne :** `public/assets/sprites/helluva/portraits/hb_kiki.png`.
- **Points à verrouiller :** Membre du groupe de Spring Broken ; distinguer la silhouette et la tenue des cinq autres fiches. Nom tiré du catalogue, à rapprocher du plan primaire ; une seule incarnation.
- **Sorties proposées :** `art/infernal-versus/masters/base/hb_kiki-ready.png` et `public/assets/sprites/reserve/hb_kiki-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 11. Josh — hb_josh

- **Portée :** Helluva Boss, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hb_josh` — Helluva Boss S1E3.
- **Source à inspecter :** [Helluva Boss — Spring Broken S1E3](https://www.youtube.com/watch?v=RghsgkZKedg). Cible d’inspection visuelle ; le titre de la page a été relu, aucun plan nouveau certifié.
- **Portrait interne :** `public/assets/sprites/helluva/portraits/hb_josh.png`.
- **Points à verrouiller :** Membre du groupe de Spring Broken ; distinguer la silhouette et la tenue des cinq autres fiches. Nom tiré du catalogue, à rapprocher du plan primaire ; une seule silhouette entière.
- **Sorties proposées :** `art/infernal-versus/masters/base/hb_josh-ready.png` et `public/assets/sprites/reserve/hb_josh-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 12. Vikki — hb_vikki

- **Portée :** Helluva Boss, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hb_vikki` — Helluva Boss S1E8.
- **Source à inspecter :** [Helluva Boss — Queen Bee S1E8](https://www.youtube.com/watch?v=D-2799Y07Zc). Cible d’inspection visuelle ; le titre de la page a été relu, aucun plan nouveau certifié.
- **Portrait interne :** `public/assets/sprites/helluva/portraits/hb_vikki.png`.
- **Points à verrouiller :** Invité de Queen Bee ; contrôler l’appariement nom/portrait/silhouette avant production. Une pose neutre autonome ne livre ni capacité de combat ni kit jouable.
- **Sorties proposées :** `art/infernal-versus/masters/base/hb_vikki-ready.png` et `public/assets/sprites/reserve/hb_vikki-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 13. Gigi — hb_gigi

- **Portée :** Helluva Boss, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hb_gigi` — Helluva Boss S1E8.
- **Source à inspecter :** [Helluva Boss — Queen Bee S1E8](https://www.youtube.com/watch?v=D-2799Y07Zc). Cible d’inspection visuelle ; le titre de la page a été relu, aucun plan nouveau certifié.
- **Portrait interne :** `public/assets/sprites/helluva/portraits/hb_gigi.png`.
- **Points à verrouiller :** Invité de Queen Bee ; contrôler l’appariement nom/portrait/silhouette avant production. Une pose neutre autonome ne livre ni capacité de combat ni kit jouable.
- **Sorties proposées :** `art/infernal-versus/masters/base/hb_gigi-ready.png` et `public/assets/sprites/reserve/hb_gigi-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### 14. Russ — hb_russ

- **Portée :** Helluva Boss, season_1. Soutien/codex/galerie statique ; rôle combattant non déduit.
- **État :** base absente à la référence V5 ; qualification primaire encore requise.
- **Source catalogue :** `docs/standalone/extension-plan.json#roster/hb_russ` — Helluva Boss S1E8.
- **Source à inspecter :** [Helluva Boss — Queen Bee S1E8](https://www.youtube.com/watch?v=D-2799Y07Zc). Cible d’inspection visuelle ; le titre de la page a été relu, aucun plan nouveau certifié.
- **Portrait interne :** `public/assets/sprites/helluva/portraits/hb_russ.png`.
- **Points à verrouiller :** Invité de Queen Bee ; contrôler l’appariement nom/portrait/silhouette avant production. Une pose neutre autonome ne livre ni capacité de combat ni kit jouable.
- **Sorties proposées :** `art/infernal-versus/masters/base/hb_russ-ready.png` et `public/assets/sprites/reserve/hb_russ-ready.webp`. Aucun de ces chemins n’est une preuve de livraison tant que le dessin accepté n’existe pas.

### Recette commune avant acceptation

1. Retrouver un plan ou modèle officiel attribuable à la même incarnation, avec une silhouette lisible.
2. Enregistrer source, épisode, minutage réel et limites d’occultation ; conserver le fichier de référence et son empreinte lorsqu’il est disponible.
3. Vérifier palette, proportions, costume, asymétries et extrémités. Résoudre les différences entre le portrait interne et la référence primaire avant génération.
4. Produire un seul PNG RGBA ; revoir le sujet entier, la séparation des membres et l’absence de décor ou de deuxième sujet.
5. Conserver le master, créer un export WebP sans perte et comparer les pixels RGBA décodés. Raccorder uniquement le dessin accepté à la galerie et au registre de livraison.

La conformité technique d’un export ne certifie pas la fidélité artistique 1:1. Une nouvelle pose neutre est une adaptation de production à comparer au modèle.

## 4. Identités à séparer

- `hz_razzle` et `hz_dazzle` sont deux individus : deux fiches et deux bases distinctes.
- `hz_frank_egg_boi` désigne Frank ; `hz_egg_boiz` désigne un groupe. Un dessin de Frank ne clôt pas automatiquement l’entrée collective.
- `hz_travis` et `hb_travis` partagent une identité de production déclarée. Une base commune n’est réutilisable que si l’incarnation est identique ; conserver deux affectations de catalogue et un seul dessin.
- Les designs pilote, série, futurs et AU restent des portées séparées. Un rôle mentionné sans apparence publiée n’autorise pas à inventer une silhouette canonique.

## 5. Machines et projectiles encore différés

| Sujet | Pièce de preuve encore nécessaire |
| --- | --- |
| `dhorks-portal-ring` | Vue primaire où le cercle inférieur, les supports et le socle entiers apparaissent simultanément sans occultation ; ou modèle de production officiel de cette machine S2E8. |
| `pentious-airship-pilot` | Choisir explicitement pilote 2019 ou saison Prime, puis fournir une vue d’ensemble primaire assez nette pour les proportions, appendices et armements de cette incarnation. |
| `cherub-golden-arrow` | Une image primaire montrant la flèche entière sans main ni corps devant : pointe, hampe, empennage et couleurs. L’arc seul ou une lueur ne résout pas le modèle. |
| `dhorks-shuriken` | Une image primaire assez nette pour compter les pointes, voir le contour du trou central s’il existe et mesurer les proportions hors flou de mouvement. |

L’anneau D.H.O.R.K.S. apparaît déjà dans `dhorks-portal-chamber`. Cela ne livre pas une machine entière isolée. Le shuriken ne doit pas être remplacé par une étoile générique ; une lueur de C.H.E.R.U.B. ne suffit pas à définir la flèche entière. Les quatre reports sont des lacunes de référence documentées ; aucun appel de génération n’a été effectué pour eux dans cet audit.

## 6. Raccordement prévu après production

| Usage | Registre consommé par le jeu |
| --- | --- |
| Bases, soutiens, ennemis, accessoires et machines de réserve | `art/infernal-versus/production/reserve-assets.json` puis `src/standalone/ReserveGallery.tsx` |
| Poses et costumes statiques | `src/lib/infernal-appearances.ts` |
| Arènes | `src/lib/pentagram-stages.ts` |
| Illustrations de campagne | `src/standalone/campaign-illustrations-v4.ts` |
| Effets de coups | `src/lib/infernal-attack-effects.ts` |

Les effets de coups existants sont des visuels synchronisés au moteur, sans nouvelles entités de projectile ni collisions autonomes. L’ajout d’un PNG de réserve ne change ni IA, ni dégâts, ni trajectoire.

## 7. Traçabilité et limites

Le JSON adjacent contient les SHA des blobs sources, les 14 fiches, la concordance des variantes, les alias et la projection de comptage. Les données de référence ont été lues à la tête publiée ; aucun test runtime ni contrôle visuel nouveau en jeu n’est revendiqué par ce document. L’audit peut servir de base à un registre V6 de production réelle, sans réécrire les rapports V5.

Sources internes : `production-static-v5.json`, `production-v5-register.json`, `extension-plan.json`, `reserve-assets.json`, `infernal-appearances.ts`, `pentagram-stages.ts`, `ReserveGallery.tsx` ; règles `AGENTS.md`, `docs/development/GAMEDEV_GUIDANCE.md`, `docs/lore-governance.md`.
