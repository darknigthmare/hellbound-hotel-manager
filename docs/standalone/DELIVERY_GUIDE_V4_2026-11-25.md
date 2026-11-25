# Infernal Versus — guide général, bible V4 et campagnes jouables

Date : 25 novembre 2026. Base vérifiée : `2738bfdcc95a0a7d65cc79a4b7b38be9d0343145` (vague I).
Branche de livraison : `feat/infernal-versus-assets-20261124`, [PR #8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8).

## Résultat de cette reprise

Le guide général de jeux de combat est associé aux règles, personnages, modes et limites réels d’Infernal Versus. Les 43 campagnes V3 auparavant réservées à la bible alimentent désormais les chroniques jouables. Une campagne globale distincte, **La nuit du signal libre**, relie neuf chapitres avec changement de personnage contrôlé. La galerie donne accès aux 22 dessins des réserves G/H/I.

Cette édition raccorde des récits et des illustrations existants ; elle ne produit aucun nouveau dessin ni cycle d’animation et ne transforme pas les réserves en combattants sélectionnables.

| Contenu | État après intégration |
| --- | --- |
| Combattants sélectionnables | 43, inchangés |
| Modes | 9, dont la nouvelle campagne globale |
| Chroniques personnelles V3 | 43 routes, 129 duels |
| Chroniques historiques | 43 routes conservées pour les sauvegardes antérieures |
| Campagne globale | 1 récit, 9 chapitres |
| Arènes | 30, avec rotation standalone conservée |
| Galerie des réserves | 22 dessins : 13 personnages, 8 ennemis, 1 projectile |
| Présentation des décors | Vivant, ambiance réduite, statique |
| Illustrations dédiées aux nouveaux briefs V3 | 0 affectation validée ; composition décor et portraits utilisée |
| Illustrations historiques | 26 affectations, 22 dessins conservés pour V1 |

## Accès dans le jeu

### Chroniques infernales

Le mode **Histoire** utilise la motivation, les confrontations, le rival et l’épilogue de la bible V3. Les lieux et adversaires affichés avant le duel correspondent à ceux envoyés au moteur. Les fiches du carnet présentent les motivations et les confrontations sans révéler un épilogue qui n’a pas encore été gagné.

Une sauvegarde antérieure à cette édition conserve la première version de son récit. Son second adversaire, son arène et son illustration ne changent pas au milieu du parcours. Un ancien épilogue reste identifié comme une archive ; il ne déverrouille pas la nouvelle fin V3. Le format importé reste validé et les résultats répétés ne sont comptés qu’une fois.

### La nuit du signal libre

La campagne globale est une fiction originale en univers alternatif, distincte des événements des séries et des 43 histoires individuelles. Les neuf duels font jouer successivement **Charlie, Blitzø, Angel Dust, Loona, Vaggie, Millie, Fizzarolli, Alastor puis Charlie**.

Chaque chapitre fournit une scène, un objectif, un échange de dialogue, un lieu et un adversaire. Après une victoire, l’interlude suivant rappelle la conséquence du chapitre précédent. Après une défaite, la reprise concerne le même duel ; les chapitres terminés restent enregistrés. Le neuvième succès débloque l’épilogue dans la collection, même après clôture du parcours.

Les filtres exigent les deux univers et leur contenu des saisons 1 et 2 avant d’afficher l’aperçu. Une victoire ne supprime aucun contrat d’âme et ne confère pas automatiquement la rédemption.

### Galerie et décors

La navigation **Galerie** affiche les réserves avec recherche, catégories, filtre de saison et aperçu en plein cadre. Le projectile reste une illustration sans nouvelle collision ou attaque. Les identités restent hors du compteur de 43 combattants. Les références et les réserves sur la fidélité des dessins restent consultables.

Dans **Options**, « Décor vivant » conserve les mouvements de caméra et les figurants existants. « Ambiance réduite » fixe la caméra et ralentit les figurants. « Décor statique » immobilise la présentation du décor et ses figurants. Les mouvements, timings et dégâts du combat restent identiques ; le réglage de réduction des mouvements du système prend priorité sur la présentation vivante.

## Vérification réalisée

La commande complète `npm run qa` a terminé avec un code de sortie 0 :

- TypeScript et ESLint : réussis.
- **45 suites, 395 tests réussis**, aucun échec.
- Builds manager et standalone : réussis.
- **1 031 fichiers** du standalone vérifiés par empreinte SHA-256, avec contrôle de séparation des sauvegardes du manager.
- **1 027 fichiers publics** récupérés et comparés aux SHA Git du commit de base ; aucun écart.
- Vérifications nouvelles : compatibilité V1/V3, neuf chapitres et changements d’acteur, défaite/reprise/rechargement, anti-doublon, filtres de contenu, galerie, options de décor et rotation après le huitième duel.

Le [rapport machine](QA_RUNTIME_GUIDE_V4_2026-11-25.json) distingue tests JSDOM, tests du moteur et vérification du build.

**La vérification visuelle dans un vrai navigateur n’a pas pu être exécutée.** Le wrapper Chromium existe dans l’environnement mais son binaire cible est absent ; le téléchargement officiel Playwright a répondu HTTP 403. Aucun résultat visuel, capture de jeu ou essai sur matériel de manette n’est annoncé pour cette édition.

## Ce qui reste à produire

Les **129 briefs d’illustration personnelle**, les illustrations propres à la campagne globale, les techniques V3 nécessitant de nouvelles mécaniques et les storyboards individuels du « Dernier Acte » restent des travaux de production. Les personnages de réserve demandent encore un kit cohérent, un équilibrage et des contrôles en jeu avant de devenir jouables. Les transitions entre arènes, dangers, boss géants, réseau et replays restent indiqués à leur niveau réel dans la matrice du guide.

L’objectif artistique reste la fidélité aux références. Cette reprise ne certifie pas une fidélité 1:1 : les histoires et les statistiques sont des adaptations de jeu, et les limites de comparaison visuelle déjà relevées sur les dessins restent valables.

## Conservation

Le guide original est conservé à l’octet dans `references/`. La V4 ajoute ses feuilles au classeur V3 sans réécrire ses 29 feuilles historiques. Le registre et les rapports de la vague I demeurent des instantanés datés ; les nouveaux états sont séparés de ces preuves antérieures. Le dépôt conserve la V3 et la nouvelle V4.
