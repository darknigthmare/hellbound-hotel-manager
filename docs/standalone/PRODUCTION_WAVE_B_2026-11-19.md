# Infernal Versus — vague B du 19 novembre 2026

Cette vague poursuit la [PR nº 3](https://github.com/darknigthmare/hellbound-hotel-manager/pull/3). Sa base distante est `1f026b7303d3be06193095b376054705d00c43e9`, dont l’arbre `6f03ce8a524e0fed4bb417db52a3dc2907df53de` est identique au précédent commit local `59b0839`. Le lot précédent est donc conservé intégralement.

## Livraison

**24 nouveaux dessins**, **11 sources retrouvées** et **12 variantes d’export préservées** forment **74 fichiers d’image supplémentaires**. Les masters, exports et vignettes d’un même dessin ne sont pas comptés comme plusieurs œuvres. Les douze anciens WebP constituent des variantes d’export, pas douze nouveaux dessins.

| Domaine | Production de cette vague | Intégration |
| --- | --- | --- |
| Combattants | Lucifer et Moxxie : attente, garde distincte, contact léger et réaction ; huit PNG individuels | Huit exports reliés aux états du combat. Les autres actions conservent les banques existantes. |
| Costume | Moxxie, tenue du festival des moissons : repos, léger, lourd, réaction, accroupissement et saut | Six poses en format portrait ; sélectionnable dans la garde-robe. |
| Décors | Sept calques indépendants pour Cannibal Town, Hotel Front Steps, Pentagram Rooftops et Heaven Embassy | Les quatorze arènes ont maintenant un fond, un plan médian et un avant-plan enregistrés. |
| Fond hôtel | Nouvelle façade Hazbin, avec références visuelles de la bande-annonce officielle de saison 1 | Remplace le fond « Scarlet Cabaret » dans le combat ; l’ancien fichier demeure conservé. |
| Parties séparées | Chapeau de Lucifer et queue de Moxxie, sur transparence | Masters et exports disponibles ; ces éléments ne sont pas assemblés en rig jouable. |
| Histoire | Deux illustrations retrouvées, exportées sans perte | Introduction de Lucifer et épilogue de Blitzø ; textes de campagne conservés. |
| Archives retrouvées | Quatre poses Stolas humain, trois poses Lucifer, deux scènes et deux fonds ; douze WebP antérieurs | Sources et variantes conservées sous des chemins distincts, avec empreintes et provenance. |

Le registre de livraison distingue **24 nouveaux masters**, **27 exports publics et vignette**, et **23 fichiers d’archives retrouvés**. Parmi les nouveaux fichiers publics, **25 sont référencés par le jeu** et **2 sont des composants préparés pour la production**.

Voir la [galerie de cette vague](ASSET_GALLERY_WAVE_B_2026-11-19.md), le [manifeste complet](../../art/infernal-versus/production/delivery-wave-b-2026-11-19.json) et le [rapport de récupération](RECOVERY_WAVE_B_2026-11-19.md).

## Couverture réelle après intégration

| Registre | État mesuré | Reste à produire pour les 36 combattants |
| --- | ---: | ---: |
| Attentes individuelles | 10 | 26 |
| Gardes individuelles distinctes | 3 | 33 |
| Contacts légers individuels | 5 | 31 |
| Réactions individuelles | 4 | 32 |
| Costumes alternatifs | 4 familles / 24 poses | 32 combattants sans variante enregistrée ; chaque tenue reste à définir |
| Poses clés de finition | 5 | 31 |
| Affectations narratives illustrées | 26 / 108 | 82 affectations |
| Dessins narratifs distincts | 22 | Certaines illustrations peuvent couvrir plusieurs affectations |
| Arènes à trois plans | 14 / 14 | 0 pour ce critère de profondeur |

L’[audit runtime](ASSET_COVERAGE.json) relève **254 chemins d’assets distincts**, tous présents. La présence d’une pose ou de trois calques ne mesure pas la complétude d’un cycle animé. Les entre-deux, déplacements, transitions, longues finitions, rigs et validations des proportions restent des chantiers distincts.

## Références et fidélité

Les silhouettes ordinaires de Lucifer et Moxxie réutilisent les portraits du dépôt comme références, puis un dessin d’attente commun pour chaque famille. La nouvelle façade s’appuie sur les vues publiques de la bande-annonce officielle Prime Video aux instants 00:16 et 00:18. La composition du parvis et les nouveaux props sont adaptés à une arène latérale.

Le costume de Moxxie suit des captures inspectées de *The Harvest Moon Festival*, republiées par des sources secondaires. La page officielle de l’épisode est identifiée ; la lecture de la vidéo officielle n’a pas abouti pendant cette session. Les références exactes et les prompts figurent dans les manifestes de production. Une comparaison canonique plan par plan reste ouverte : **aucune fidélité 1:1 certifiée n’est annoncée**.

Les illustrations narratives sont des créations pour les scénarios originaux d’Infernal Versus. Les pièces séparées ne constituent pas un rig assemblé. Les variantes de Stolas retrouvées sont conservées comme sources ; elles ne remplacent pas les six poses actives précédentes.

## Intégration et contrôles

Le rendu distingue maintenant les costumes portrait des costumes paysage sur les deux combattants. Les tests du composant couvrent la sélection de ce format, l’accroupissement et le saut. Les nouvelles gardes de Lucifer et Moxxie conservent leur format pendant une garde maintenue.

L’auvent de Cannibal Town masquait la tête du personnage gauche dans la composition statique de contrôle. Sa hauteur est maintenant limitée à 28 % de l’arène, avec une largeur maximale de 40 %. Le recalcul ciblé en 1100 × 520 et 390 × 300 montre le visage dégagé.

| Contrôle | Résultat |
| --- | --- |
| TypeScript et ESLint | Réussis |
| Suite complète Vitest | 313 tests, 41 suites, aucun échec |
| Builds application et standalone | Réussis |
| Distribution standalone | 850 fichiers / empreintes vérifiés ; 482.6 Mio |
| Références d’assets | 254 chemins, aucun fichier absent |
| Alpha et exports | Transparence native des sprites et props contrôlée ; masters conservés ; exports sans perte, vignette réduite séparément |
| Inspection visuelle | Images individuelles et compositions statiques ; aucune capture navigateur revendiquée |
| Classeur | Bible V2 régénérée depuis les registres ; voir [rapport du classeur](QA_WORKBOOK_WAVE_B_2026-11-19.json) |

Pour la recette du jeu, Chromium local n’a pas pu démarrer à cause d’un refus de socket, et la connexion au navigateur partagé a échoué à l’initialisation. Une autre session a pu ouvrir la page officielle de référence du costume, sans parvenir à lire la vidéo. Les compositions statiques ne valident ni l’exécution visuelle du jeu dans un navigateur ni la fluidité. Le cadrage vertical de l’enseigne de l’hôtel avec `background-size: cover` doit être revu sur les écrans larges lors de cette prochaine recette.

Les résultats détaillés sont dans [QA_WAVE_B_2026-11-19.json](QA_WAVE_B_2026-11-19.json). Le commit de cette vague est destiné à la PR existante ; une fusion ou un déploiement de production ne sont pas inclus dans ce rapport.
