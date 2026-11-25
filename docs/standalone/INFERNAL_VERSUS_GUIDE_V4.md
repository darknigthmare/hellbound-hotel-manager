# Infernal Versus — Guide intégré V4

**État du 2026-11-25.** Le guide général de Darknigthmare est associé aux règles, récits et fichiers d’Infernal Versus. Cette édition accompagne la reprise de la PR #8 depuis le commit [2738bfd](https://github.com/darknigthmare/hellbound-hotel-manager/commit/2738bfdcc95a0a7d65cc79a4b7b38be9d0343145).

Le [guide original](references/Combat_Games_Guide_General_v1.0.txt) est conservé sans modification. Son empreinte SHA-256 est `4844584616072ac0d52d37c2fab4365e1ec489240f17a721ee216e223b0355b7` (55 172 octets). Les propositions générales sont contextualisées ci-dessous ; elles ne deviennent pas toutes des fonctions livrées.

Le [classeur V4](INFERNAL_VERSUS_BIBLE_V4.xlsx) ajoute cinq vues aux 29 feuilles V3 conservées. Le [registre structuré](guide-integration-v4.json) associe les 30 rubriques, les dix fiches, les routes, la campagne, les réserves et les critères. Les feuilles V3 décrivent l’état de leur lot historique. Les vues V4 donnent la correspondance actuelle.

## Périmètre mesuré

| Catégorie | Quantité | Sens du nombre |
| --- | ---: | --- |
| Combattants jouables | 43 | 25 Hazbin et 18 Helluva |
| Arènes enregistrées | 30 | Trois plans par arène dans le socle |
| Attaques paramétrées | 133 | 129 actions de base et 4 signatures |
| Routes personnelles V3 | 43 | 129 duels, anciennes routes V1 préservées |
| Campagne globale | 1 | 9 chapitres et 8 identités jouées |
| Illustrations V3 | 129 briefs | Les briefs ne sont pas des dessins produits |
| Techniques V3 | 172 concepts | 67 demandent une mécanique nouvelle |
| Derniers Actes V3 | 43 storyboards | Les variantes longues restent à produire |
| Dessins de réserve | 22 | 13 bases de personnages, 8 ennemis, 1 projectile |
| Nouveaux dessins ou cycles dans V4 | 0 | Ce lot termine l’intégration des contenus et de la bible |

Ces unités ne s’additionnent pas en un pourcentage global. La complétude de tout l’univers reste ouverte. Les 26 anciennes affectations narratives appartiennent aux routes V1 ; aucune n’est certifiée automatiquement conforme aux nouveaux briefs V3.

## Décisions du projet

- **IV-D01 — Périmètre.** Duel latéral 2D, React/TypeScript/Vite, entrée combat.html et sauvegarde isolée du manager.
- **IV-D02 — Univers.** Hazbin Hotel et Helluva Boss. Le pilote reste une continuité séparée. Une œuvre non auditée ne devient pas vérifiée par sa date de publication.
- **IV-D03 — Narration.** 43 routes personnelles V3 et une campagne globale originale de neuf chapitres. Les rencontres et dialogues inventés sont des simulations AU.
- **IV-D04 — Production.** Le présent lot raccorde les contenus existants. Il ne produit pas de nouveau cycle d’animation ni de nouveau kit à partir d’une seule pose.
- **IV-D05 — Fidélité.** Objectif 1:1 portant sur l’identité et l’incarnation. Aucune certification globale. Références et écarts restent visibles dans chaque fiche.
- **IV-D06 — Finitions.** Dernier Acte est le nom original du système. Les 43 storyboards V3 restent à réaliser. La finition actuelle conserve son effet court.
- **IV-D07 — Arènes.** Présentation vivante, réduite et statique séparée des règles. Les dangers, interactions et transitions restent des chantiers distincts.
- **IV-D08 — Sauvegardes.** Les routes anciennes conservent leur identité de contenu V1. Une victoire ancienne ne débloque pas silencieusement une fin réécrite V3.
- **IV-D09 — Multijoueur.** Duel local au clavier et tactile. Manette, remappage complet, rollback et replays ne sont pas déclarés livrés.
- **IV-D10 — Mesures.** Compter séparément combattants, attaques, dessins, fichiers, briefs et affectations. Le catalogue de réserve ne gonfle pas le roster jouable.

## 30 rubriques associées

« Intégrée » décrit le raccordement de la portée indiquée, et non une certification de chaque extension de la rubrique. Les rapports datés portent les résultats des tests. « Documentée » et « Différée » restent des états de conception.

### 00. Utilisation du guide et priorités

**IV-G00 · P0 · Retenue · Documentée**

**Présent :** Le guide source est archivé à l’identique. Les 30 rubriques sont associées au projet et aux fiches A–J.

**Suite :** Actualiser la matrice et ses preuves à chaque lot. Les fonctions différées restent visibles.

**Critère :** 30 identifiants uniques, source inchangée, décision et critère pour chaque rubrique.

**Références du projet :** [docs/standalone/references/Combat_Games_Guide_General_v1.0.txt](../../docs/standalone/references/Combat_Games_Guide_General_v1.0.txt) · [docs/standalone/guide-integration-v4.json](../../docs/standalone/guide-integration-v4.json).

### 01. Identité du projet et périmètre

**IV-G01 · P0 · Retenue · Intégrée**

**Présent :** Infernal Versus est un standalone 2D de Hazbin/Helluva, séparé du manager. 43 combattants, 30 arènes, clavier et tactile.

**Suite :** Mesurer les performances sur une machine et un téléphone identifiés. Aucune promesse de 60 images/s universelles.

**Critère :** Le build autonome démarre sans importer les données de gestion et ouvre combat.html.

**Références du projet :** [src/standalone/main.tsx](../../src/standalone/main.tsx) · [src/standalone/roster.ts](../../src/standalone/roster.ts) · [vite.config.ts](../../vite.config.ts) · [scripts/check-standalone.mjs](../../scripts/check-standalone.mjs).

### 02. Fidélité au lore et sources

**IV-G02 · P0 · Retenue · Partielle**

**Présent :** Gouvernance canon/AU, incarnation et spoiler par fiche. 109 repères et 27 sources de conception V3 conservés.

**Suite :** Comparer les images en taille de jeu à des références précises. Compléter les références trop petites et les capacités incertaines.

**Critère :** Aucune création AU présentée comme un événement d’épisode. Chaque affirmation canonique possède une référence vérifiable.

**Références du projet :** [docs/lore-governance.md](../../docs/lore-governance.md) · [docs/standalone/campaign-design-v3.json](../../docs/standalone/campaign-design-v3.json) · [art/infernal-versus/production/reserve-assets.json](../../art/infernal-versus/production/reserve-assets.json).

### 03. Roster, variantes et costumes

**IV-G03 · P1 · Retenue · Partielle**

**Présent :** 43 kits jouables et six costumes. La galerie expose 13 bases de personnages, huit bases d’ennemis et un projectile en réserve.

**Suite :** Les réserves demandent une décision de rôle, des kits et des réactions avant activation. Étendre les incarnations et costumes vérifiés.

**Critère :** Sélection et filtres n’activent que les kits complets. Une réserve reste identifiée comme non jouable.

**Références du projet :** [src/standalone/roster.ts](../../src/standalone/roster.ts) · [src/lib/infernal-appearances.ts](../../src/lib/infernal-appearances.ts) · [art/infernal-versus/production/reserve-assets.json](../../art/infernal-versus/production/reserve-assets.json).

### 04. Fondations du combat

**IV-G04 · P0 · Retenue · Partielle**

**Présent :** 100 PV, 99 s, deux manches gagnantes, tension 0–100, garde, déplacement, poses saut/accroupissement et contact différé.

**Suite :** Projections, garde haute/basse, vrais échanges aériens et changement de côté demandent un contrat moteur dédié.

**Critère :** KO, temps écoulé, égalité, pause, perte de focus et résultat unique conservent les règles communes.

**Références du projet :** [src/lib/pentagram-combat.ts](../../src/lib/pentagram-combat.ts) · [src/components/PentagramLiveFight.tsx](../../src/components/PentagramLiveFight.tsx) · [src/tests/pentagram-combat.test.ts](../../src/tests/pentagram-combat.test.ts).

### 05. Movesets et ressources

**IV-G05 · P1 · Retenue · Partielle**

**Présent :** 133 attaques paramétrées, dont quatre signatures. Carnet des durées/portées/coûts. 172 concepts V3 documentés séparément.

**Suite :** 67 concepts exigent une mécanique nouvelle. Les 105 autres restent des propositions à régler et à tester, pas des coups déjà remplacés.

**Critère :** Toute nouvelle action spécifie départ, contact, récupération, garde, ressources, interruption et contre-jeu compatible avec le moteur.

**Références du projet :** [src/lib/pentagram-combat.ts](../../src/lib/pentagram-combat.ts) · [src/lib/pentagram-fighters.ts](../../src/lib/pentagram-fighters.ts) · [docs/standalone/campaign-design-v3.json](../../docs/standalone/campaign-design-v3.json).

### 06. Ultimes, finishers et conclusions

**IV-G06 · P1 · Retenue · Partielle**

**Présent :** Dernier Acte : fenêtre 3,2 s après KO décisif, séquence 1,5 s, passage vers victoire. 43 storyboards longs sont écrits.

**Suite :** Réaliser les storyboards, réactions et solutions par morphologie. Distinguer spécial, finisher, victoire et épilogue.

**Critère :** Aucun effet de finition ne change le résultat, le contrat d’âme ou la rédemption. La séquence peut être passée.

**Références du projet :** [src/lib/infernal-finishers.ts](../../src/lib/infernal-finishers.ts) · [src/components/PentagramLiveFight.tsx](../../src/components/PentagramLiveFight.tsx) · [docs/standalone/campaign-design-v3.json](../../docs/standalone/campaign-design-v3.json).

### 07. Présentation et relations

**IV-G07 · P1 · Retenue · Partielle**

**Présent :** Entrées et victoires existantes, 43 rivaux motivés et relations classées dans V3. Les rencontres croisées sont AU.

**Suite :** Échanges spécifiques par paire, voix et poses personnalisées restent à produire et à vérifier par incarnation.

**Critère :** Le texte différencie relation attestée et rencontre inventée. Aucun personnage ne connaît un fait hors de sa période.

**Références du projet :** [src/lib/pentagram-cinematics.ts](../../src/lib/pentagram-cinematics.ts) · [src/standalone/campaign-v3.ts](../../src/standalone/campaign-v3.ts) · [docs/standalone/campaign-design-v3.json](../../docs/standalone/campaign-design-v3.json).

### 08. Histoires individuelles

**IV-G08 · P1 · Retenue · Intégrée**

**Présent :** 43 routes V3 : motivation, enjeu, prologue, trois duels, rival et épilogue. Les anciennes routes V1 restent reprenables.

**Suite :** Produire et associer les 129 briefs d’illustration à leur scène exacte. Les embranchements restent différés.

**Critère :** Chaque route atteint sa conclusion après ses trois victoires, reprend le duel interrompu et respecte les filtres narratifs.

**Références du projet :** [src/standalone/campaign.ts](../../src/standalone/campaign.ts) · [src/standalone/campaign-v3.ts](../../src/standalone/campaign-v3.ts) · [src/standalone/campaign-legacy.ts](../../src/standalone/campaign-legacy.ts) · [src/standalone/progression.ts](../../src/standalone/progression.ts).

### 09. Campagne globale distincte

**IV-G09 · P1 · Retenue · Intégrée**

**Présent :** La nuit du signal libre : neuf chapitres, héros alternés, objectifs, dialogues, conséquences et épilogue AU propres.

**Suite :** Illustrations dédiées, exploration et branches ne sont pas dans ce lot. La campagne utilise décors et portraits du jeu.

**Critère :** Neuf victoires ordonnées conduisent à la fin, avec héros/adversaire/arène du chapitre et sauvegarde entre les duels.

**Références du projet :** [src/standalone/campaign-global.ts](../../src/standalone/campaign-global.ts) · [src/standalone/progression.ts](../../src/standalone/progression.ts) · [src/standalone/RunInterlude.tsx](../../src/standalone/RunInterlude.tsx).

### 10. Illustrations et cinématiques

**IV-G10 · P1 · Retenue · Partielle**

**Présent :** 129 briefs V3 détaillés. Les anciennes images restent attachées à la version de leur route ; V3 utilise une composition de repli.

**Suite :** Revalider les 26 anciennes affectations pour les nouveaux briefs. Aucun dessin réaffecté sans contrôle du casting et de la continuité.

**Critère :** Intro, rivalité et outro expriment des fonctions différentes. Le texte est séparé de l’image et reste lisible en petit écran.

**Références du projet :** [docs/standalone/campaign-design-v3.json](../../docs/standalone/campaign-design-v3.json) · [src/standalone/campaign.ts](../../src/standalone/campaign.ts) · [src/standalone/RunInterlude.tsx](../../src/standalone/RunInterlude.tsx).

### 11. Boss, machines et Boss Rush

**IV-G11 · P1 · Retenue · Partielle**

**Présent :** Boss Rush sur neuf candidats de duel. Le héros est retiré du pool. Les PV sont restaurés à chaque rencontre.

**Suite :** Phases, bosses géants, machines à points faibles et écran Boss Combat dédié sont à développer. Le versus permet déjà un duel libre avec un boss.

**Critère :** Un boss reste affrontable par chaque style prévu, avec résultat/reprise corrects et aucune phase annoncée sans implémentation.

**Références du projet :** [src/standalone/roster.ts](../../src/standalone/roster.ts) · [src/standalone/progression.ts](../../src/standalone/progression.ts) · [src/lib/pentagram-ai.ts](../../src/lib/pentagram-ai.ts).

### 12. Modes de jeu

**IV-G12 · P1 · Retenue · Partielle**

**Présent :** Neuf modes jouables : CPU, local, entraînement, histoire, campagne, tournoi, arcade, survie et Boss Rush. Galerie accessible.

**Suite :** Tag, assistances, coopération, GG Boost, avatar, exploration, réseau et replays restent différés.

**Critère :** Chaque mode possède entrée, sélection, partie, résultat, sortie et reprise cohérents ; un simple bouton ne vaut pas livraison.

**Références du projet :** [src/standalone/InfernalVersus.tsx](../../src/standalone/InfernalVersus.tsx) · [src/standalone/progression.ts](../../src/standalone/progression.ts) · [src/tests/standalone-ui.test.tsx](../../src/tests/standalone-ui.test.tsx).

### 13. Arènes et lisibilité

**IV-G13 · P1 · Retenue · Partielle**

**Présent :** 30 arènes à trois plans enregistrés, reconstruits pour le jeu. Le standalone conserve tous les lieux, le manager ses huit lieux.

**Suite :** Vérifier les proportions, l’ancrage, les avant-plans et les différences d’incarnation sur les plateformes visées.

**Critère :** Terrain et informations de combat visibles aux formats testés, fichiers existants, aucun accessoire masquant les combattants.

**Références du projet :** [src/lib/pentagram-stages.ts](../../src/lib/pentagram-stages.ts) · [src/components/PentagramLiveFight.tsx](../../src/components/PentagramLiveFight.tsx) · [docs/standalone/extension-plan.json](../../docs/standalone/extension-plan.json).

### 14. Arènes vivantes, statiques et événements

**IV-G14 · P1 · Retenue · Partielle**

**Présent :** Sélecteur vivant/statique/réduit pour la présentation. Parallaxe et réactions visuelles existantes restent sans impact mécanique.

**Suite :** Événements de travail des PNJ et variations propres à chaque scène demandent assets et scénarios. Dangers séparés et différés.

**Critère :** Changer la présentation ne change ni terrain, PV, chrono ni ressources. Le mode statique conserve les repères utiles.

**Références du projet :** [src/standalone/progression.ts](../../src/standalone/progression.ts) · [src/standalone/InfernalVersus.tsx](../../src/standalone/InfernalVersus.tsx) · [src/components/PentagramLiveFight.tsx](../../src/components/PentagramLiveFight.tsx).

### 15. Arènes connectées et interactions

**IV-G15 · P1 · Retenue · Différée**

**Présent :** Trois liaisons de conception entre lieux déjà enregistrés : hôtel extérieur→hall, hall→bar, I.M.P. extérieur→réception.

**Suite :** Déclencheurs, géométrie, caméra, chargement et réinitialisation à implémenter. Aucune transition active ni objet utilisable annoncé.

**Critère :** Une liaison rejoint un terrain existant, conserve les ressources définies et empêche double déclenchement, boucle abusive et KO perdu.

**Références du projet :** [docs/standalone/guide-integration-v4.json](../../docs/standalone/guide-integration-v4.json) · [src/lib/pentagram-stages.ts](../../src/lib/pentagram-stages.ts) · [src/lib/pentagram-combat.ts](../../src/lib/pentagram-combat.ts).

### 16. Ennemis, soutiens et projectiles

**IV-G16 · P1 · Retenue · Partielle**

**Présent :** Huit bases d’ennemis et une fléchette en galerie. 14 VFX associés à 28 attaques du roster. Les effets suivent le contact existant.

**Suite :** La fléchette n’a ni trajectoire ni collision. Les bases n’ont pas d’IA de campagne. Assistances, machines et projectiles autonomes sont différés.

**Critère :** Chaque usage distingue image, effet visuel et objet simulé. Aucun nombre de kits gonflé par des réserves.

**Références du projet :** [art/infernal-versus/production/reserve-assets.json](../../art/infernal-versus/production/reserve-assets.json) · [src/lib/infernal-attack-effects.ts](../../src/lib/infernal-attack-effects.ts) · [src/lib/pentagram-combat.ts](../../src/lib/pentagram-combat.ts).

### 17. Direction artistique et production

**IV-G17 · P0 · Retenue · Partielle**

**Présent :** Masters individuels PNG, exports WebP sans perte, dimensions, références et empreintes documentés. Un sujet par sprite autonome.

**Suite :** Terminer les bases manquantes avec comparaison des silhouettes, accessoires, asymétries et alpha. Éviter de compter un atlas comme un sujet neuf.

**Critère :** Un master est conservé, l’export est exploitable et la validation 1:1 est justifiée élément par élément.

**Références du projet :** [art/infernal-versus/production/reserve-assets.json](../../art/infernal-versus/production/reserve-assets.json) · [docs/standalone/ASSET_COVERAGE.json](../../docs/standalone/ASSET_COVERAGE.json) · [docs/standalone/DELIVERY_WAVE_I_2026-11-25.md](../../docs/standalone/DELIVERY_WAVE_I_2026-11-25.md).

### 18. Animations, VFX, son et caméra

**IV-G18 · P1 · Retenue · Partielle**

**Présent :** Banques d’animation existantes, hit-stop de 58 ms, poses clés, effets d’impact et musiques originales du projet.

**Suite :** Cycles dédiés et voix restent à produire lors de leur phase. Aucun nouveau cycle n’est ajouté par V4.

**Critère :** Le contact, la pose et les effets restent synchronisés ; l’option de confort ne modifie pas les timings de simulation.

**Références du projet :** [src/lib/pentagram-animation.ts](../../src/lib/pentagram-animation.ts) · [src/lib/pentagram-combat.ts](../../src/lib/pentagram-combat.ts) · [src/lib/pentagram-stages.ts](../../src/lib/pentagram-stages.ts) · [src/components/usePentagramCombatSoundtrack.ts](../../src/components/usePentagramCombatSoundtrack.ts).

### 19. Interface et expérience utilisateur

**IV-G19 · P0 · Retenue · Partielle**

**Présent :** Modes, sélection, carnet, garde-robe, résultat, reprise, galeries et options. Narration lisible et scènes passables.

**Suite :** Remappage complet et navigation manette à développer. La cible actuelle garantit uniquement les périphériques effectivement testés.

**Critère :** Un joueur peut entrer, combattre, revenir, reprendre et relire une fin sans perdre son filtre ou lancer un mauvais personnage.

**Références du projet :** [src/standalone/InfernalVersus.tsx](../../src/standalone/InfernalVersus.tsx) · [src/standalone/RunInterlude.tsx](../../src/standalone/RunInterlude.tsx) · [src/tests/standalone-ui.test.tsx](../../src/tests/standalone-ui.test.tsx).

### 20. Tutoriels et entraînement

**IV-G20 · P0 · Retenue · Partielle**

**Présent :** Mannequin immobile ou en garde, tension illimitée, remise à zéro, commandes et durées dans le carnet.

**Suite :** Défis guidés, enregistrement du mannequin, répétitions et affichage des hitboxes restent à développer.

**Critère :** L’entraînement ne modifie pas les statistiques de victoire ; sa réinitialisation remet un état jouable et les commandes sont explicites.

**Références du projet :** [src/components/PentagramLiveFight.tsx](../../src/components/PentagramLiveFight.tsx) · [src/standalone/InfernalVersus.tsx](../../src/standalone/InfernalVersus.tsx) · [src/tests/standalone-live-fight.test.tsx](../../src/tests/standalone-live-fight.test.tsx).

### 21. IA et difficulté

**IV-G21 · P0 · Retenue · Partielle**

**Présent :** Trois difficultés : Rookie, Standard, Overlord. Réflexion 430/260/150 ms, garde, recul, gestion de portée et ressources.

**Suite :** Personnalités propres à chaque kit, nouvelles interactions et boss à phases demanderont des règles dédiées.

**Critère :** L’IA utilise les conditions d’attaque du moteur, ne frappe pas hors état autorisé et les tests fixent les tirages aléatoires.

**Références du projet :** [src/lib/pentagram-ai.ts](../../src/lib/pentagram-ai.ts) · [src/tests/pentagram-ai.test.ts](../../src/tests/pentagram-ai.test.ts) · [src/lib/pentagram-combat.ts](../../src/lib/pentagram-combat.ts).

### 22. Équilibrage et accessibilité

**IV-G22 · P0 · Retenue · Partielle**

**Présent :** Attaques différées, enchaînement lourd→spécial, pause, focus relâché et réduction de mouvement. Aucun bonus RPG importé dans le duel.

**Suite :** Matrice exhaustive des confrontations, réglages séparés de volume, remappage et tests manette restent ouverts.

**Critère :** Pas de victoire automatique liée au rang de lore. Aucune boucle ne retire indéfiniment le contrôle. Les informations restent lisibles sans animation.

**Références du projet :** [src/lib/pentagram-combat.ts](../../src/lib/pentagram-combat.ts) · [src/components/PentagramLiveFight.tsx](../../src/components/PentagramLiveFight.tsx) · [src/tests/accessibility.test.tsx](../../src/tests/accessibility.test.tsx).

### 23. Multijoueur, réseau et replays

**IV-G23 · P2 · Partiellement retenue · Partielle**

**Présent :** Duel local à deux sur clavier partagé ou commandes tactiles. Les mêmes règles s’appliquent aux deux côtés.

**Suite :** Réseau, rollback, salons, matchmaking, classement, crossplay et replays sont différés. Aucun service en ligne requis pour jouer.

**Critère :** Deux côtés indépendants, pause cohérente et revanche correcte. Une future version réseau devra conserver état et commandes de simulation.

**Références du projet :** [src/components/PentagramLiveFight.tsx](../../src/components/PentagramLiveFight.tsx) · [src/standalone/InfernalVersus.tsx](../../src/standalone/InfernalVersus.tsx) · [src/tests/pentagram-live-inputs.test.tsx](../../src/tests/pentagram-live-inputs.test.tsx).

### 24. Progression et sauvegardes

**IV-G24 · P0 · Retenue · Intégrée**

**Présent :** Sauvegarde du parcours, statistiques, tenues et options ; version de route 1/3, fins versionnées et campagne identifiée.

**Suite :** Branches narratives et profils multiples restent différés. Une importation invalide doit laisser la sauvegarde existante intacte.

**Critère :** Chargement ancien→reprise identique ; nouvelle route→fin V3 ; pertes/égalités/réessais et doublons ne falsifient pas la progression.

**Références du projet :** [src/standalone/progression.ts](../../src/standalone/progression.ts) · [src/tests/standalone-progression.test.ts](../../src/tests/standalone-progression.test.ts) · [src/tests/standalone-campaign-cup.test.ts](../../src/tests/standalone-campaign-cup.test.ts).

### 25. Inventaires et statistiques

**IV-G25 · P0 · Retenue · Intégrée**

**Présent :** Registres JSON, bible V4 et catalogue de réserve reliés aux identifiants. Historique V3 conservé avec sa date de référence.

**Suite :** Le dénominateur de tout l’univers reste ouvert. Les chiffres annoncés décrivent uniquement les périmètres nommés.

**Critère :** Les 43 combattants, 129 briefs, 22 réserves et 30 arènes ne sont jamais additionnés comme une complétude unique.

**Références du projet :** [docs/standalone/extension-plan.json](../../docs/standalone/extension-plan.json) · [docs/standalone/guide-integration-v4.json](../../docs/standalone/guide-integration-v4.json) · [art/infernal-versus/production/reserve-assets.json](../../art/infernal-versus/production/reserve-assets.json).

### 26. Validation et ordre de production

**IV-G26 · P0 · Retenue · Documentée**

**Présent :** Recette dédiée aux routes V3, campagne, réserves, sauvegardes et présentation. Les preuves de lot sont séparées des critères prévus.

**Suite :** Exécuter les scénarios sur la révision publiée et compléter la revue visuelle par incarnation. Le rendu Excel ne valide pas le jeu.

**Critère :** Aucune réussite annoncée sans résultat exécuté ; chaque blocage garde son prochain test et son périmètre.

**Références du projet :** [docs/standalone/guide-integration-v4.json](../../docs/standalone/guide-integration-v4.json) · [package.json](../../package.json) · [scripts/check-standalone.mjs](../../scripts/check-standalone.mjs).

### 27. Fiches types A–J

**IV-G27 · P1 · Retenue · Documentée**

**Présent :** Dix fiches contextualisées et renseignées : projet, personnage, action, finition, route, scène, arène, liaison, boss et asset.

**Suite :** Étendre les fiches de référence à chaque futur élément. Les capacités proposées et les valeurs non fixées restent explicitement ouvertes.

**Critère :** Aucun champ absent masqué. Chaque fiche désigne son sujet, son statut, ses dépendances et sa recette.

**Références du projet :** [docs/standalone/INFERNAL_VERSUS_GUIDE_V4.md](../../docs/standalone/INFERNAL_VERSUS_GUIDE_V4.md) · [docs/standalone/guide-integration-v4.json](../../docs/standalone/guide-integration-v4.json).

### 28. Instruction propre au projet

**IV-G28 · P0 · Retenue · Documentée**

**Présent :** Ordre de travail adapté : lire les registres, réutiliser le socle, traiter les manquants, préserver les identités de sauvegarde et publier des preuves.

**Suite :** Poursuivre les lots selon les exigences réellement applicables et les références disponibles.

**Critère :** Les prochaines reprises partent de cette matrice, sans présenter les projets différés comme terminés.

**Références du projet :** [AGENTS.md](../../AGENTS.md) · [docs/development/GAMEDEV_GUIDANCE.md](../../docs/development/GAMEDEV_GUIDANCE.md) · [docs/standalone/INFERNAL_VERSUS_GUIDE_V4.md](../../docs/standalone/INFERNAL_VERSUS_GUIDE_V4.md).

### 29. Références et vocabulaire

**IV-G29 · P0 · Retenue · Documentée**

**Présent :** Les cinq références du guide et son vocabulaire sont conservés avec la source exacte. Les liens de lore V3 gardent leur provenance.

**Suite :** Les pages externes du guide ne sont pas requalifiées comme audit nouveau par cette intégration. Employer des titres précis.

**Critère :** Une inspiration de mode n’est ni une preuve de lore ni la preuve que tous les jeux cités possèdent la même fonction.

**Références du projet :** [docs/standalone/references/Combat_Games_Guide_General_v1.0.txt](../../docs/standalone/references/Combat_Games_Guide_General_v1.0.txt) · [docs/standalone/campaign-design-v3.json](../../docs/standalone/campaign-design-v3.json).

## Dix fiches de référence

Ces dix fiches remplissent les modèles A–J pour des sujets concrets. Elles complètent les 43 fiches de personnage et de campagne V3. Une fiche de transition conçue n’est pas une transition active. Les valeurs non fixées sont désignées explicitement.

### Fiche A — Projet

**IV-FICHE-A · Infernal Versus V4**

État : Socle intégré, extensions précisées.

**ID / titre / version.** infernal-versus / Hellbound — Infernal Versus / V4 de la bible ; application 0.1.0.

**Univers / continuité / période.** Hazbin Hotel et Helluva Boss selon les sources V3. Expositions et campagne dans une continuité AU. Pilote isolé, incarnations séparées.

**Piliers.** Identité reconnaissable ; combat lisible ; personnages motivés ; récits distincts ; preuves de production consultables.

**Format / commandes.** Duel latéral 2D. Clavier Q/A–D, F/G/H et signature T pour J1 ; flèches, J/K/L et I pour J2. Garde, pose saut, accroupissement, provocation et tactile.

**Plateformes / performances.** Navigateur desktop et mobile. Simulation découpée en pas de 16 ms. Objectif de fluidité à mesurer sur matériel identifié ; pas de certificat 60 Hz.

**Modes.** CPU, local, entraînement, histoire, campagne, tournoi, arcade, survie, Boss Rush. Extensions tag, exploration, coopération et réseau différées.

**Roster.** 43 combattants actifs (25 Hazbin, 18 Helluva), 30 arènes. 22 dessins de réserve consultables sans ajouter de kit.

**Direction artistique.** Illustration 2D fidèle aux incarnations retenues ; sprites autonomes détourés, composition d’arène latérale et plans indépendants.

**Règles communes.** 100 PV, 99 s, deux manches gagnantes, tension 0–100. Les paramètres de duel ne modifient ni rang canonique ni état du manager.

**Phase.** Intégration des routes, galerie et guide. Production d’animations nouvelles hors lot.

**Incertitudes.** Fidélité exacte non certifiée ; références de certaines réserves limitées ; règles aériennes, transitions et boss géants à développer.

**Livraison.** Contenu associé à des identifiants, parcours complets testés, anciennes sauvegardes reprises et PR vérifiée après publication.

### Fiche B — Personnage

**IV-FICHE-B · Charlie Morningstar — série S1**

État : Jouable ; concepts V3 distincts du kit actuel.

**ID / incarnation.** charlie — modèle de la série S1. Tenue finale de combat uniquement dans la scène qui la justifie.

**Univers / rôle.** Hazbin Hotel. Combattante du roster ; protagoniste de sa route et des chapitres 1 et 9 de la campagne globale AU.

**Sources.** Fiche V3 charlie : hh-i-cast, hh-i-s1. Ces identifiants renvoient au registre sources V3 conservé.

**Silhouette / asymétries.** Conserver silhouette, coiffure, cornes éventuelles et tenue de l’incarnation choisie. Échelle de jeu à comparer visuellement ; aucun détail absent de la source inventé comme canon.

**Personnalité / motivation.** Obtenir une chance réelle pour les résidents, sans les réduire à des exemples publicitaires.

**Relations.** Adam est l’interlocuteur antagoniste de Charlie dans la confrontation avec le Paradis en S1. Les affrontements de cette route sont des mises en scène AU.

**Rôle / réponses.** Kit actuel de contrôle accessible ; approcher, garder puis punir la récupération. Les quatre concepts V3 ne remplacent pas les paramètres actuels.

**Mouvement / défense / ressource.** Règles communes, garde et tension 0–100. Aucune ressource de purification ou propriété d’âme.

**Normaux / projections.** Trois attaques de base du moteur. Pas de projection simulée, pas de série de normaux aériens propre à Charlie.

**Spéciaux / finisher.** Spécial moteur coût 50 ; Dernier Acte actuel Le rideau de l’aube. La seconde clé est son storyboard V3 encore à produire.

**Armes / états.** Ne pas confondre tenue, transformation et pouvoir. Le piège Porte ouverte demeure un concept AU non implémenté.

**Présentation.** Entrée et victoire existantes. Nouvelles provocations et réactions fidèles à concevoir en phase animation.

**Route / campagne.** Une chambre, un choix : Vaggie → Velvette → Adam. Campagne La nuit du signal libre : protège le seuil, ouvre une soirée sans imposer un rôle.

**Costumes.** Aucun nouveau costume ajouté par V4. Comparer toute tenue finale à sa référence avant production.

**Assets.** Portrait/atlas/READY existants ; trois briefs V3 La clé encore chaude, Deux conceptions du salut, La place libre. Images dédiées à revalider/produire.

**Adaptations.** Dégâts, durées et noms de coups conçus pour le jeu. Les duels ne produisent pas de rédemption automatique.

**À confirmer.** Correspondance image/brief exacte et détails de la tenue finale en jeu.

**Statuts.** Lore : repères sourcés ; conception : documentée ; assets : partiels ; kit : intégré ; route V3 : intégrée, recette datée séparée.

**Recette.** Parcours jusqu’à l’épilogue, filtre de saison, sauvegarde V1/V3, cadrage petit écran, contrôle des accessoires et de la palette.

### Fiche C — Action

**IV-FICHE-C · Vaggie — Ligne de défense**

État : Signature jouable ; valeurs extraites du moteur.

**ID / nom / propriétaire.** line-guard / Ligne de défense / vaggie. Nom original du projet, pas nom canonique certifié.

**Source / motif.** Motif de protection à la lance ; source du personnage dans roster.ts et fiche V3. Chorégraphie et équilibrage sont adaptés.

**Commande / rôle.** T pour J1, I pour J2 ou touche Signature. Estocade de portée contrôlée ; tension suffisante et état autorisé requis.

**Départ / contact / récupération.** 160 ms de démarrage ; résolution d’un contact unique à la fin du démarrage ; 280 ms de récupération ; 440 ms d’action totale.

**Recharge / immobilisation.** 600 ms de recharge et 155 ms d’immobilisation après touche hors garde. Ne pas traduire ces valeurs en 60 frames comme mesure moteur native.

**Portée / collision.** 12.277777777777779 unités normalisées calculées par le moteur. Test de distance au contact ; aucune hurtbox animée autonome revendiquée.

**Dégâts / ressources / garde.** Coût 20 de tension. Dégâts calculés par puissance, bonus, portée et GLOBAL_DAMAGE_SCALE=0.66. La garde réduit selon le défenseur ; pas de valeur universelle fixe.

**Touche / garde / raté.** Une touche non gardée protège automatiquement la récupération de Vaggie. Sur garde ou raté, sa récupération reste ouverte.

**Avantage temporel.** Il dépend des états restants, du hit-stop et de la garde automatique. Aucune valeur universelle on-block attribuée au coup.

**Annulations.** Cette signature ne possède pas l’annulation signature→léger de Mimzy. Les règles communes lourd→spécial restent distinctes.

**Trajectoire / durée de vie.** Sans objet projectile. Un contact frontal différé ; aucun suivi ou réflexion.

**Décor / autres actions.** Aucune interaction mécanique de stage ou transition. La touche peut interrompre l’action adverse selon les règles communes.

**Image / son / caméra.** Pose de frappe et effets existants synchronisés au contact, hit-stop 58 ms. Aucun nouveau dessin V4.

**Restrictions.** Pas de garantie d’invulnérabilité au démarrage. La protection propre au coup n’est accordée qu’après touche sans garde.

**Recette.** Tester touche, garde, raté, tension insuffisante, interruption avant contact et expiration de récupération.

### Fiche D — Finisher

**IV-FICHE-D · Charlie — La seconde clé**

État : Storyboard V3 proposé, non remplacé en combat.

**ID / nom / statut.** IV-FIN-CHARLIE-V3 / Dernier Acte : La seconde clé. Noms originaux du projet.

**Justification.** Une victoire qui conserve le choix. Références de personnalité hh-i-cast et hh-i-s1.

**Intention / résultat.** Défaite d’arène non létale ; l’adversaire conserve son autonomie.

**Conditions / modes.** Le système actuel propose une finition après un KO décisif avec vainqueur encore vivant. Cette nouvelle variante doit respecter la même règle avant intégration.

**Cibles.** Humanoïdes compatibles avec contact de bras. Versions armée et désarmée distinctes ; ne pas créer une arme dans la main d’une cible désarmée.

**Déroulement.** 1. Elle bloque le dernier assaut et détourne l’arme équipée hors du cadre ; face à une cible désarmée, elle écarte son avant-bras sans lui retirer le choix de reculer.
2. Elle fait glisser une clé devant l’adversaire immobilisé.
3. Elle ouvre la porte et lui laisse deux directions possibles.

**Durée / caméra.** Durée du storyboard non fixée. Le runtime actuel dure 1,5 s, fenêtre 3,2 s ; ces durées ne valident pas trois nouveaux plans.

**Décor / ancrage.** Seuil et comptoir de l’hôtel proposés. Fallback non spécifique requis si le duel se déroule ailleurs.

**Assets / effets / dialogue.** Clé isolée de l’hôtel, sans lettrage
Illustration finale du seuil avec deux issues lisibles
Variante de cible armée et désarmée, sans ajout d’arme à une incarnation qui n’en porte pas
Aucune voix ni réplique nouvelle enregistrée.

**Cible incompatible.** Proposition : salut à distance et plan sur la clé, sans contact anatomique. À concevoir et tester pour géant, machine ou entité.

**Conséquences.** Aucune rédemption, aucun pardon forcé ni admission automatique à l’hôtel.

**Retour / confort.** Trois images fixes correspondant aux trois temps, transitions douces sans flash plein écran ; conserver l’image finale et le résultat du match. Conserver le bouton Passer et le résultat déjà calculé.

**Validation.** Storyboard documenté. Les images, transitions, cibles et lecture dans chaque arène restent à produire/tester.

### Fiche E — Route individuelle

**IV-FICHE-E · Charlie — Une chambre, un choix**

État : Route V3 intégrée.

**ID / version.** story:charlie:3. Simulation AU, séparée des événements diffusés. La route V1 reste archivée pour les sauvegardes.

**Situation / motivation.** Une journée de portes ouvertes est détournée en démonstration de force ; Charlie doit en reprendre le sens. Obtenir une chance réelle pour les résidents, sans les réduire à des exemples publicitaires.

**Déclencheur.** Charlie prépare une chambre pour un visiteur qui ne croit pas à l’hôtel. Une campagne hostile transforme son invitation en défi public. Pour protéger l’accueil, elle accepte des duels limités, puis découvre que gagner ne suffira pas à convaincre.

**Rival / relations.** Adam, rival principal ; Vaggie partenaire, Velvette antagoniste d’une rencontre inventée. Les relations sourcées ne rendent pas chaque duel canonique.

**Combats ordonnés.** 1. vaggie à hotel-lobby : Vaggie transforme la répétition de l’accueil en exercice de protection du seuil.
2. velvette à vee-broadcast-studio : Velvette propose de réduire le projet à une image de victoire ; Charlie refuse cette condition.
3. adam à heaven-embassy : Une confrontation d’archives oppose l’argument de Charlie au refus d’Adam.

**Revers.** La proposition de Velvette réduit l’hôtel à une image de victoire. Charlie choisit le droit de parole plutôt que l’audience.

**Confrontation finale.** Adam à heaven-embassy, confrontation d’archives AU. Sa présence ne ressuscite pas le personnage dans la continuité série.

**Outro.** Charlie laisse la clé à portée du visiteur et se retire pour qu’il puisse choisir. L’équipe rouvre la porte malgré la mauvaise couverture médiatique. L’image finale montre une place libre, pas une âme transformée.

**Illustrations.** intro : La clé encore chaude. Plan moyen à hauteur humaine ; illustration fixe 16:9
rival : Deux conceptions du salut. Plan large frontal ; illustration fixe 16:9
ending : La place libre. Plan large intérieur calme ; illustration fixe 16:9

**Embranchements.** Aucun embranchement dans ce lot. Trois duels en ordre fixe, réessai du duel courant.

**Campagne globale.** Même thème de choix et d’hospitalité ; récit distinct. Terminer cette route n’accomplit pas automatiquement les neuf chapitres globaux.

**Sauvegarde / récompense.** RouteVersion=3, index du duel et fin versionnée. Les fins V1 restent consultables dans leur version.

**Recette.** Nouvelle partie, perte, égalité, fermeture au duel 2, victoire finale et relecture du bon épilogue.

### Fiche F — Chapitre et scène

**IV-FICHE-F · La nuit du signal libre — Seuil ouvert**

État : Chapitre intégré ; illustration dédiée proposée.

**ID / ordre.** signal-libre:1 / seuil-ouvert / chapitre 1 sur 9.

**Époque / lieu.** Continuité AU du crossover. Hall reconstitué hotel-lobby. Aucun événement série remplacé.

**Objectifs.** Faire comprendre que la porte doit permettre de repartir. Jeu : gagner l’exercice de protection contre Vaggie.

**Jouable / acteurs.** Charlie jouable, Vaggie adverse. Angel recherche une référence au dos de l’affiche dans le récit. Modèles du jeu existants.

**Résumé / émotion.** Une affiche promet une démonstration de rédemption en direct et porte le nom de l’hôtel. Charlie n’a autorisé qu’une visite. Avant de chercher le responsable, Vaggie exige de sécuriser le hall : si une foule arrive, la porte devra rester une sortie aussi bien qu’une entrée. Elles répètent un duel de protection, sans public, pendant qu’Angel compare l’affiche à l’invitation originale.

**Combat / conséquences.** Le hall est prêt. Angel repère un numéro de livraison au dos de l’affiche ; le même numéro figure sur une mission reçue par I.M.P.

**Dialogues.** charlie : Je veux qu’ils puissent entrer. Je veux aussi qu’ils puissent changer d’avis.
vaggie : Alors on commence par garder ce passage.

**Découpage proposé.** Plan 1 : affiche sur le comptoir, noms sans texte brûlé dans l’image. Plan 2 : Charlie et Vaggie dégagent le seuil. Plan 3 : porte libre avant le duel.

**Cadrage / tenue.** Plan moyen latéral, Charlie à gauche et Vaggie à droite. Les mains et la lance restent lisibles. Réserver les bords pour le texte séparé.

**Lumière / palette.** Rouge carmin, crème et lumière chaude du hall. Le seuil reste distinct du fond et des portraits.

**Continuité.** Exercice entre alliées. Aucune arme improvisée dans les mains de Charlie, aucun halo de rédemption.

**Son / effets.** Thème original de l’arène, pas de chanson de série transcrite. Les trois plans n’existent pas encore comme nouvelle animation.

**Entrée / sortie.** Prologue → objectif/dialogues → duel → conséquence → chapitre 2. Défaite : réessai du même chapitre.

**Sources / original.** Personnages et lieu liés aux sources V3 ; intrigue, affiche et dialogue originaux AU.

**Assets / validation.** Runtime : décor + portraits existants. Illustration dédiée à produire. Vérifier le bon héros, l’adversaire, le stage, le passage de scène et la sauvegarde.

### Fiche G — Arène

**IV-FICHE-G · Hazbin Hotel Lobby**

État : Trois plans intégrés ; liaisons différées.

**ID / univers.** hotel-lobby / Hazbin Hotel Lobby / Hazbin Hotel.

**Lieu / statut.** Lieu inspiré de l’hôtel, reconstitution spatiale AU de combat. La géométrie jouable n’est pas une mesure canonique.

**Références.** Registre d’arènes extension-plan.json et sources de l’hôtel V3. Comparer les détails de décor à l’incarnation avant tout nouveau dessin.

**Plan / limites.** Couloir latéral normalisé x=7 à 93, écart minimal 7 unités, départ à 22/78. Aucune collision propre aux accessoires de cette scène.

**Composition.** Fond entier avec ratio conservé, chariot intermédiaire et valance au premier plan. Les combattants restent devant les plans décoratifs.

**Ambiance / musique.** Red Velvet Rumble, thème original du projet à 128 BPM.

**Activité.** Parallaxe et présentation existantes. Les PNJ de travail ou événements narratifs spécifiques restent à concevoir.

**Événements.** Aucun danger ou bonus de gameplay. Les variations visuelles ne changent ni portée, ni dégâts, ni chronomètre.

**Interactions.** Chariot et valance décoratifs ; aucun bouton d’interaction actuellement livré.

**Liaisons.** IV-LINK-01 depuis l’extérieur ; IV-LINK-02 vers le bar. Conception uniquement, destinations déjà cataloguées.

**Présentation.** Vivant, statique ou réduit selon option. Le terrain et les repères utiles doivent rester identiques.

**Règles de référence.** Aucun danger/objet interactif/transition activés. La campagne réutilise ce terrain sans modifier ses statistiques.

**Fichiers.** /assets/stages/hazbin/hotel-lobby.webp
/assets/stages/hazbin/hotel-lobby/luggage-cart.webp
/assets/stages/hazbin/hotel-lobby/valance.webp
/assets/stages/hazbin/thumbs/hotel-lobby.webp

**Recette.** Ratio, pieds, avant-plans, mobile, option de confort, absence d’asset manquant. Fidélité fine distincte des tests de chargement.

### Fiche H — Transition

**IV-FICHE-H · IV-LINK-01 — Du perron au hall**

État : Conception uniquement.

**ID / type / origine.** IV-LINK-01 / passage entre arènes / hotel-exterior.

**Destination.** hotel-lobby, déjà présente comme arène. Le seuil exact reste à définir dans une géométrie AU.

**Déclencheur / conditions.** Proposition : attaque lourde touchant près du seuil droit, après annonce du seuil actif. La projection générique n’existe pas encore.

**Annonce / réponse.** Marque de seuil visible avant le contact. Garde du lourd ou éloignement de la zone. Le déclenchement ne doit jamais suivre un coup bloqué.

**Durée / caméra.** Cible proposée 1,2 s maximum, non validée. Option réduite : fondu bref et nom de lieu. Aucun déplacement de caméra livré.

**PV / ressources / chrono / combo.** Une fois par match, pas de dégâts bonus, PV et tension conservés, compteur de combo clôturé, chrono suspendu pendant la présentation.

**Arrivée.** Positions normalisées 22 et 78, joueurs conservant leur côté, aucune attaque en attente, 500 ms de contrôle commun suspendu.

**Usage / reset.** Une fois par match, remise à zéro au nouveau match. Pas de boucle aller-retour ; changement de manche ne doit pas dupliquer le déclenchement.

**Décor après usage.** Porte franchie ; pas de destruction permanente du manager. Définir la variante visuelle au prototype.

**Simultané / KO / interruption.** KO ou fin du chrono prime sur la transition. Un seul événement arbitré par pas. Quitter avant validation ne consomme pas la liaison.

**Version fixe.** Porte et déplacement de caméra à produire. En mode réduit/statique : fondu bref avec destination écrite.

**Synchronisation.** Si replay/réseau sont retenus plus tard, sérialiser la liaison et son résultat dans l’état de match. Aucun réseau dans ce lot.

**Assets / recette.** état de liaison par match, seuil logique dans le moteur, préchargement de destination, caméra de transition, réinitialisation des entrées. Tester les 43 kits, pause, coin, KO et échec de chargement avant activation.

### Fiche I — Boss

**IV-FICHE-I · Adam — duel d’archives AU**

État : Boss de duel intégré, phases différées.

**ID / version / source.** adam / incarnation de la série S1, références hh-i-cast et hh-i-s1. Le duel d’archives n’est pas une résurrection canonique.

**Type.** Boss au format duel standard. Aucune mécanique de géant, phase destructible ou machine.

**Rôle / échelle / arène.** Rival final de Charlie V3 à heaven-embassy. Échelle du sprite de duel et mêmes bornes de terrain.

**Phases.** Deux manches gagnantes selon les règles communes. Aucun changement de comportement indexé sur un seuil de PV.

**Attaques / annonce.** Trois attaques paramétrées dans HAZBIN_EXHIBITION_PROFILES. Poses et contact différé du moteur ; aucun rayon autonome ajouté par son nom.

**Vulnérabilités.** Portée, démarrage et récupération. Garde et punition après attaque ratée. Aucun rang divin rendant le duel impossible.

**Compatibilité.** Tester courte/longue portée et signatures. Les projections et géants étant absents, leur compatibilité n’est pas déclarée.

**Victoire / échec.** Deux manches gagnées ; défaite peut être réessayée dans la route/Boss Rush selon progression. Dernier Acte selon KO décisif.

**Difficulté / récompense.** Rookie, Standard, Overlord. La route Charlie déverrouille sa propre fin V3, pas un changement d’état du monde.

**Boss Rush.** Un des neuf candidats. L’ordre suit la seed et le roster disponible, le héros est retiré. PV remis à 100 au nouveau duel ; pas d’attrition.

**Version jouable.** Le même kit appartient au roster. Les valeurs sont du jeu et ne mesurent pas la puissance canonique.

**Assets / recette.** Portrait, atlas et arène existants. Réactions dédiées et phases nouvelles restent à produire ; tester victoire, perte, rechargement et exclusion de doublon.

### Fiche J — Asset et suivi

**IV-FICHE-J · D.H.O.R.K.S. · Fléchette tranquillisante**

État : Image produite ; galerie, pas de projectile simulé.

**ID / catégorie.** dhorks-dart / projectile en réserve / D.H.O.R.K.S.

**Description / référence.** The Full Moon S2E8 · fléchette visible derrière le cou de Cletus, vers 04:40.

**Format / dimensions.** 1774 × 887 px, master PNG avec alpha et export WebP sans perte. Un seul projectile.

**Ancrage / marges / orientation.** Boîte alpha déclarée à seuil 16 : 234, 343, 1539, 566. Pivot d’émission et échelle de combat non définis.

**Master.** art/infernal-versus/masters/projectiles/dhorks-dart.png

**Export.** public/assets/vfx/infernal/reserve/dhorks-dart.webp

**Dépendances / usages.** Galerie de réserve. Pour un futur tir : propriétaire, animation d’émission, trajectoire, collision, impact et règles de garde à spécifier.

**Statuts.** Lore : référence limitée ; conception : description d’objet ; production : réalisée ; contrôle : historique ; intégration : galerie ; gameplay : absent.

**Vérification.** Master SHA-256 878442de4a5cac7793826c188857df5b5a5897c9758d1cd2cd72e5bc55ed5cba. Export SHA-256 1282ebe8fb6819831f25f1aef3118edd8106eb780ce5e8d74583921299d6acdb. Comparaison sans perte déclarée dans le manifeste d’origine, pas nouvel audit de fidélité.

**Publication.** Produit vague G, conservé par la PR #8 au head de base 2738bfd. Le raccordement galerie appartient au lot V4.

**Écart / prochaine action.** La pointe était masquée dans la référence ; sa terminaison simple est reconstruite. Détails de très petite taille dans la prévisualisation officielle. Fidélité 1:1 non certifiée. Sprite en réserve, sans collision, animation ou affectation d’attaque. Définir le propriétaire et le comportement avant toute activation en combat.

## Campagne globale — La nuit du signal libre

Simulation AU originale inspirée des personnages des deux séries. Les rencontres inter-séries, le montage publicitaire et leurs conséquences sont inventés. Les lieux sont des reconstitutions de jeu. Les contrats d’âme et la rédemption ne sont jamais réglés par une victoire d’arène.

**Intrigue.** Une invitation falsifiée transforme les portes ouvertes de l’hôtel en spectacle sous contrat. L’équipe de Charlie et I.M.P. suivent séparément les copies de l’accord, puis choisissent de rendre la parole à ceux que la publicité voulait exposer.

**Prologue.** Charlie prépare une soirée où chacun peut venir, parler ou repartir. À l’autre bout de Pride, I.M.P. reçoit une mission de récupération : retrouver la caisse contenant les autorisations de tournage. Quand Angel découvre son nom sur une affiche qu’il n’a jamais approuvée, la même question relie les deux équipes : qui a signé pour les absents ? Cette rencontre entre les séries, ses contrats et tous ses duels appartiennent à une continuité AU originale.

### Chapitre 1 — Une invitation sans petites lignes

**seuil-ouvert** · Charlie Morningstar contre Vaggie · Hazbin Hotel Lobby

Une affiche promet une démonstration de rédemption en direct et porte le nom de l’hôtel. Charlie n’a autorisé qu’une visite. Avant de chercher le responsable, Vaggie exige de sécuriser le hall : si une foule arrive, la porte devra rester une sortie aussi bien qu’une entrée. Elles répètent un duel de protection, sans public, pendant qu’Angel compare l’affiche à l’invitation originale.

**Objectif.** Tenir le seuil pendant l’exercice de Vaggie et préparer une sortie libre.

> **Charlie Morningstar :** Je veux qu’ils puissent entrer. Je veux aussi qu’ils puissent changer d’avis.
> **Vaggie :** Alors on commence par garder ce passage.

**Après victoire.** Le hall est prêt. Angel repère un numéro de livraison au dos de l’affiche ; le même numéro figure sur une mission reçue par I.M.P.

**Après défaite.** Vaggie interrompt la répétition. Le passage est remis en place ; Charlie peut reprendre le même exercice.

### Chapitre 2 — Le nom au bas du reçu

**caisse-imp** · Blitzø contre Moxxie · I.M.P. · Réception

Le client a payé pour récupérer une caisse, sans dire à qui appartiennent les papiers qu’elle contient. Blitzø veut partir immédiatement ; Moxxie refuse de traiter une liste de noms comme une liste de cibles. Il lui propose une répétition de l’extraction dans le bureau, avec une consigne claire : rapporter les documents et laisser leurs propriétaires en vie. Le duel met leur coordination à l’épreuve avant le départ.

**Objectif.** Terminer l’exercice d’extraction et accepter une mission de récupération précise.

> **Moxxie :** Une adresse de livraison ne nous dit pas qui a consenti.
> **Blitzø :** D’accord. On ramène la caisse. Les petites lignes, tu me les lis en route.

**Après victoire.** Le reçu mène au matériel d’un plateau des Vees. Loona appelle le numéro de retour : Angel répond depuis le studio.

**Après défaite.** Moxxie marque une pause avant le départ. La caisse factice reste au même endroit et la répétition reprend sans perdre les informations trouvées.

### Chapitre 3 — La prise que personne ne signe

**prise-originale** · Angel Dust contre Valentino · Vee Broadcast Studio

Angel retrouve l’invitation utilisée comme accessoire de tournage. Valentino veut conserver son image dans la bande promotionnelle. Angel ne prétend pas annuler son contrat en remportant un duel ; il veut seulement atteindre la sortie avec une copie du montage et choisir s’il participe à cette soirée. Un affrontement d’arène ouvre un passage pendant que Husk l’attend au téléphone.

**Objectif.** Gagner le passage jusqu’à la copie du montage et quitter le plateau.

> **Angel Dust :** Mon nom sur ton affiche ne dit pas ce que je ferai ce soir.
> **Valentino :** Tu crois pouvoir décider du moment où le spectacle s’arrête ?

**Après victoire.** Angel emporte une copie, pas une libération magique. Le numéro du transporteur permet à Loona de vérifier où la caisse a été détournée.

**Après défaite.** Angel recule avant que la confrontation ne se referme. Le soutien de Husk reste disponible ; le duel de ce chapitre peut être retenté.

### Chapitre 4 — Reconnaître celui qui passe

**bon-passage** · Loona contre Vortex · I.M.P. · Rue des bureaux

Vortex a accompagné un convoi portant le même numéro, sans prendre part au contrat publicitaire. Il ne remettra pas son double à quelqu’un qui se contente d’agiter un badge. Loona lui expose ce qu’Angel a trouvé. Ils règlent ensuite, par un exercice convenu, le passage à tenir si l’équipe revient avec des personnes poursuivies. La confiance vient de cette conversation ; le duel vérifie leur préparation.

**Objectif.** Passer le contrôle de Vortex pendant l’exercice et sécuriser le point de rendez-vous.

> **Vortex :** Je peux reconnaître un badge. Je préfère savoir qui je laisse entrer.
> **Loona :** Alors garde mon numéro. Je préviendrai avant qu’on revienne.

**Après victoire.** Vortex confie le double du bordereau. Une partie du matériel doit passer par un dépôt de Carmilla ; l’autre a quitté Pride avec Striker.

**Après défaite.** Vortex suspend l’exercice. Le bordereau reste à l’abri et Loona peut recommencer le passage.

### Chapitre 5 — Ce que l’atelier laisse sortir

**chargement-ferme** · Vaggie contre Carmilla Carmine · Carmine Industries

Le dépôt de Carmilla contient une caisse d’équipements ordinaires destinés au plateau. Vaggie demande qu’elle soit retenue le temps de comparer les bons. Carmilla refuse que son quai devienne un champ de bataille improvisé : elle teste la discipline de Vaggie dans une confrontation encadrée. Les résidents de l’hôtel restent à Pentagram City tandis que l’équipe hellborn poursuit la seconde livraison.

**Objectif.** Achever l’épreuve de Carmilla pour organiser le retrait du matériel sans exposer le quai.

> **Carmilla Carmine :** Tu protèges une porte. Pense aussi à ceux qui travaillent derrière.
> **Vaggie :** Personne ici ne servira de diversion.

**Après victoire.** Les deux bons portent des clauses différentes. Vaggie garde le premier à Pride ; Millie suit le second jusqu’au repaire de Striker.

**Après défaite.** Carmilla arrête l’épreuve avant la zone de chargement. Vaggie reprend au début de ce duel ; les copies déjà trouvées sont conservées.

### Chapitre 6 — Le prix de la seconde copie

**seconde-copie** · Millie contre Striker · Repaire de Striker · Mine

Striker a détourné la caisse afin de revendre la signature qui permettrait de remettre le spectacle en route. Millie retrouve les papiers dans son repaire. Elle ne négocie pas le nom de ses collègues : le duel lui permet de dégager la caisse, puis de la rapporter à Moxxie. Cette mission et ce marché sont propres à cette fiction AU.

**Objectif.** Récupérer la seconde copie et quitter le repaire avec les papiers intacts.

> **Striker :** Quelqu’un finira par payer pour récupérer ces noms.
> **Millie :** Tu peux garder ton prix. Je prends la caisse.

**Après victoire.** Le document révèle un achat de droits promotionnels par Mammon. Fizz accepte d’examiner la campagne dont son visage fait aussi partie.

**Après défaite.** Millie se replie au bord du repaire. La tentative suivante recommence ce duel, avec les cinq chapitres précédents déjà validés.

### Chapitre 7 — Un rappel à son nom

**rappel-refuse** · Fizzarolli contre Mammon · Concours de Mammon · Scène

Mammon a réservé une séquence promotionnelle pour vendre la soirée comme un nouveau numéro. Fizz monte sur le plateau avec une copie de l’affiche. Il refuse d’y jouer le rôle qu’on lui a choisi et transforme le duel d’exhibition prévu en occasion de faire entendre ce refus. La victoire coupe le numéro de ce soir ; elle ne réécrit ni le passé ni les rapports de pouvoir.

**Objectif.** Terminer le duel du plateau et interrompre le rappel publicitaire annoncé sans accord.

> **Mammon :** Le public a déjà vu l’affiche. Ça compte comme une promesse !
> **Fizzarolli :** Alors il va m’entendre la corriger.

**Après victoire.** Le refus de Fizz est enregistré. Avec les deux copies du contrat, il peut maintenant être diffusé sans les coupes prévues par la régie de Vox.

**Après défaite.** Fizz quitte momentanément la marque centrale. Il peut revenir jouer le même duel ; aucune signature supplémentaire n’est créée par une défaite.

### Chapitre 8 — Un silence dans la régie

**frequence-vide** · Alastor contre Vox · Vee Broadcast Studio

Alastor n’offre aucune aide désintéressée : il veut priver Vox de l’exclusivité du récit. Charlie accepte qu’il ouvre une fenêtre d’émission, sans lui céder l’accueil de l’hôtel. Dans le studio, leur rivalité devient un duel pour le contrôle momentané de la diffusion. Pendant cet intervalle, les copies et le refus de Fizz sont rendus publics ; leur existence ne dépendra plus d’un seul écran.

**Objectif.** Gagner l’intervalle de diffusion nécessaire à la publication des copies.

> **Vox :** Sans mon signal, ton petit scandale reste une conversation de couloir.
> **Alastor :** Les couloirs ont parfois une excellente acoustique.

**Après victoire.** Les copies circulent. Velvette se rend à l’hôtel avec une dernière proposition : reprendre l’ouverture sous une image contrôlée, en échange de la fin de la campagne hostile.

**Après défaite.** La fenêtre de diffusion se referme. Les documents restent copiés ; Alastor peut disputer à nouveau ce même contrôle de régie.

### Chapitre 9 — La porte sans caméra

**porte-sans-camera** · Charlie Morningstar contre Velvette · Hotel Front Steps

Velvette propose à Charlie une image impeccable : une victoire, un sourire et des invités qui suivent le conducteur. Charlie refuse de faire de leur accueil la récompense d’un spectacle. Lorsque Velvette impose un dernier duel sur le perron, l’équipe garde les sorties ouvertes. Charlie défend l’accès à l’hôtel, puis doit tenir sa promesse après la victoire : laisser chacun décider, même si personne ne reste.

**Objectif.** Défendre le seuil et ouvrir la soirée sans imposer de rôle aux invités.

> **Velvette :** Une bonne image peut leur faire oublier toute cette histoire.
> **Charlie Morningstar :** Je ne veux pas qu’ils oublient. Je veux qu’ils puissent choisir.

**Après victoire.** Le perron se vide de ses caméras. Charlie rentre la première, déplace une chaise et laisse la porte ouverte.

**Après défaite.** L’équipe protège toujours les sorties. Charlie peut reprendre le dernier duel sans rejouer les huit chapitres validés.

### Épilogue global

Le dernier écran s’éteint, mais les copies du document continuent de circuler. Charlie ouvre sans caméra. Angel décide de rester au bar et n’a pas à expliquer pourquoi ; son contrat n’a pas disparu, et son choix de ce soir lui appartient. Loona conserve le numéro de la réception, Moxxie classe le reçu et Blitzø réclame le paiement de la récupération, sans ajouter de nom à la liste. Fizz retourne à sa scène avec son propre texte. Alastor laisse sa fréquence vide juste assez longtemps pour que l’on entende les conversations dans le hall. Aucun adversaire n’a changé de nature, aucune âme n’a été déclarée sauvée. La première invitée franchit le seuil, regarde les chaises et choisit celle qui lui plaît.

**Prolongement.** Au matin, l’hôtel garde une copie vierge de l’invitation. La prochaine signature devra venir de la personne qu’elle engage.

La progression est un enchaînement de duels avec scènes et objectifs. Exploration, coopération, chapitres à embranchements, inventaire et bonus RPG ne sont pas revendiqués. Une défaite conserve les chapitres déjà gagnés et exige un réessai explicite.

## Liaisons entre arènes — conception

Les trois destinations sont déjà des arènes du catalogue. Les liaisons restent désactivées tant que leur simulation, leurs annonces, leurs assets et leur recette ne sont pas intégrés.

### IV-LINK-01 — Du perron au hall

**hotel-exterior → hotel-lobby.** Connexion spatiale originale entre deux reconstitutions de l’hôtel. Aucun mur destructible canonique n’est revendiqué.

**Déclencheur.** Proposition : attaque lourde touchant près du seuil droit, après annonce du seuil actif. La projection générique n’existe pas encore.

**Règles.** Une fois par match, pas de dégâts bonus, PV et tension conservés, compteur de combo clôturé, chrono suspendu pendant la présentation.

**Arrivée.** Positions normalisées 22 et 78, joueurs conservant leur côté, aucune attaque en attente, 500 ms de contrôle commun suspendu.

**Réponse.** Garde du lourd ou éloignement de la zone. Le déclenchement ne doit jamais suivre un coup bloqué.

**Présentation.** Porte et déplacement de caméra à produire. En mode réduit/statique : fondu bref avec destination écrite.

**Cas limites.** KO ou fin du chrono prime sur la transition. Un seul événement arbitré par pas. Quitter avant validation ne consomme pas la liaison.

**Dépendances.** état de liaison par match, seuil logique dans le moteur, préchargement de destination, caméra de transition, réinitialisation des entrées.

### IV-LINK-02 — L’accès au bar

**hotel-lobby → hotel-bar.** Passage AU entre les pièces représentées. Conserver le bar comme lieu de rencontre plutôt qu’arme létale automatique.

**Déclencheur.** Proposition : interaction volontaire au seuil latéral quand les deux combattants sont hors stun. Commande à définir après remappage.

**Règles.** Transition consentie par la règle du match, sans bonus de ressource, usage unique, aucun aller-retour pendant le même duel.

**Arrivée.** Positions centrales identiques pour tous les kits. Les accessoires restent décoratifs.

**Réponse.** Repositionnement avant l’action d’interaction. Aucun effet caché lié au costume ou à la taille.

**Présentation.** Séquence d’entrée à produire ; le fallback affiche le nouveau lieu sans flash.

**Cas limites.** Annuler au KO, à la pause avant confirmation ou si la destination est indisponible. Un échec de chargement garde l’arène source jouable.

**Dépendances.** action d’interaction, règle de match commune, état de chargement, brief de porte.

### IV-LINK-03 — Du palier à la réception I.M.P.

**imp-exterior → imp-reception.** Liaison originale entre extérieur et bureau. La scène ne confirme pas une géométrie exacte absente des références.

**Déclencheur.** Proposition : action de seuil après un recul suffisamment fort et une annonce claire. Valeur à prototyper.

**Règles.** Désactivée en duel de référence jusqu’à validation. PV/tension conservés, aucune munition ou ressource inventée.

**Arrivée.** J1 à 22, J2 à 78 ; la caisse narrative ne crée pas de collision.

**Réponse.** Éviter le seuil ou bloquer l’attaque. Aucun téléportage imposé depuis le centre de l’écran.

**Présentation.** Passage de porte avec caméra courte, version fixe avec les mêmes informations.

**Cas limites.** Tester attaque simultanée, pause, défaite, résultat déjà traité et retour au menu sans perte de sauvegarde.

**Dépendances.** mécanique de seuil validée, repères d’entrée/sortie, recette tous styles.

## 22 réserves reliées à la galerie

Le catalogue d’origine garde ses empreintes, ses références et ses incertitudes. V4 donne un accès de consultation ; les identités restent hors du roster et la fléchette reste sans objet simulé.

| ID | Catégorie | Identité | Format | Export |
| --- | --- | --- | --- | --- |
| hb_vassago-ready | Personnage | Vassago — tenue du tribunal de Mastermind | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_vassago-ready.webp) |
| hb_wally_wackford-ready | Personnage | Wally Wackford — costume commercial C.H.E.R.U.B. | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_wally_wackford-ready.webp) |
| hb_barbie_wire-ready | Personnage | Barbie Wire — forme imp Unhappy Campers | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_barbie_wire-ready.webp) |
| hb_martha-ready | Personnage | Martha — forme sinner Apology Tour | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_martha-ready.webp) |
| hb_mrs_mayberry-ready | Personnage | Mrs Mayberry — forme sinner cliente Murder Family | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_mrs_mayberry-ready.webp) |
| hb_agent_one-ready | Ennemi | Agent One | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_agent_one-ready.webp) |
| hb_agent_two-ready | Ennemi | Agent Two | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_agent_two-ready.webp) |
| hb_cletus-ready | Ennemi | Cletus | 1254 × 1254 | [WebP](../../public/assets/sprites/reserve/hb_cletus-ready.webp) |
| hb_collin-ready | Ennemi | Collin | 1254 × 1254 | [WebP](../../public/assets/sprites/reserve/hb_collin-ready.webp) |
| hb_keenie-ready | Ennemi | Keenie | 1254 × 1254 | [WebP](../../public/assets/sprites/reserve/hb_keenie-ready.webp) |
| hb_robo_fizz-ready | Ennemi | Robo Fizz | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_robo_fizz-ready.webp) |
| dhorks-dart | Projectile | D.H.O.R.K.S. · Fléchette tranquillisante | 1774 × 887 | [WebP](../../public/assets/vfx/infernal/reserve/dhorks-dart.webp) |
| hb_paimon-ready | Personnage | Paimon | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_paimon-ready.webp) |
| hb_cash_buckzo-ready | Personnage | Cash Buckzo | 1225 × 1284 | [WebP](../../public/assets/sprites/reserve/hb_cash_buckzo-ready.webp) |
| hb_joe-ready | Personnage | Joe | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_joe-ready.webp) |
| hb_lin-ready | Personnage | Lin | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_lin-ready.webp) |
| hb_chazwick_thurman-ready | Personnage | Chazwick Thurman | 1199 × 1312 | [WebP](../../public/assets/sprites/reserve/hb_chazwick_thurman-ready.webp) |
| hb_alessio-ready | Ennemi | Alessio | 1214 × 1295 | [WebP](../../public/assets/sprites/reserve/hb_alessio-ready.webp) |
| hb_elder_jaws-ready | Personnage | Elder Jaws | 1199 × 1312 | [WebP](../../public/assets/sprites/reserve/hb_elder_jaws-ready.webp) |
| hb_rolando-ready | Ennemi | Rolando | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_rolando-ready.webp) |
| hb_dennis-ready | Personnage | Dennis | 1024 × 1536 | [WebP](../../public/assets/sprites/reserve/hb_dennis-ready.webp) |
| hb_toledo_the_igor-ready | Personnage | Toledo the Igor | 1254 × 1254 | [WebP](../../public/assets/sprites/reserve/hb_toledo_the_igor-ready.webp) |

## Recette prévue

Cette liste définit ce qui doit être vérifié. Les résultats exécutés sont consignés séparément dans le rapport de lot, avec les limites de la comparaison visuelle.

| ID | Scénario | Résultat attendu | Type |
| --- | --- | --- | --- |
| IV-Q01 | Préservation du guide — Comparer SHA-256 et octets avec la pièce jointe d’origine. | 55 172 octets et SHA-256 documenté identiques. | Contrôle de données |
| IV-Q02 | Couverture de la matrice — Contrôler sections 00–29, modèles A–J et identifiants. | 30 rubriques uniques et dix modèles renseignés. | Contrôle de données |
| IV-Q03 | Couverture narrative — Comparer les routes runtime V3 aux 43 fiches de la bible. | 43 héros et 129 chapitres associés aux adversaires/arènes existants. | Test logique |
| IV-Q04 | Ancien parcours — Importer une sauvegarde antérieure sans routeVersion au duel 2. | La route V1 et ses adversaires restent identiques. Aucun reset silencieux. | Test logique |
| IV-Q05 | Ancienne fin débloquée — Charger storyEndings antérieur puis ouvrir la galerie des fins. | Le déblocage V1 n’autorise pas une fin V3 non gagnée. | Test logique/UI |
| IV-Q06 | Nouvelle histoire — Commencer Charlie puis gagner ses trois duels. | Prologue V3, rival Adam et épilogue V3. Résultats comptés une seule fois. | Test logique/UI |
| IV-Q07 | Campagne complète — Gagner les neuf chapitres de La nuit du signal libre. | Héros, adversaire et stage changent selon le chapitre ; la fin est débloquée. | Test logique/UI |
| IV-Q08 | Défaite et reprise de campagne — Perdre au chapitre 6, quitter puis recharger et réessayer. | Cinq chapitres restent validés, le sixième reprend sans usurper son héros. | Test logique/UI |
| IV-Q09 | Campagne après match nul — Produire une égalité puis un résultat dupliqué. | Aucun saut de chapitre, aucune double statistique ou récompense. | Test logique |
| IV-Q10 | Filtres d’univers et saison — Masquer les saisons ou l’un des univers après une sauvegarde. | Les contenus non autorisés restent indisponibles sans effacer leur progression. | Test logique/UI |
| IV-Q11 | Import invalide — Importer version inconnue, héros incohérent ou route corrompue. | Message explicite et sauvegarde courante préservée. | Test logique/UI |
| IV-Q12 | Présentation d’arène — Même duel en vivant, réduit et statique avec les mêmes entrées. | État de combat identique ; animation de présentation seule affectée. | Test logique/UI |
| IV-Q13 | Galerie de réserves — Ouvrir chaque catégorie et rechercher une identité. | 22 dessins : 13 personnages, huit ennemis, un projectile. Aucun sélectionnable comme kit. | Test UI |
| IV-Q14 | Fichiers de réserve — Comparer les 44 chemins master/export au manifeste. | Tous présents, empreintes conformes ; l’existence ne vaut pas fidélité 1:1. | Contrôle de fichiers |
| IV-Q15 | Lecture responsive — Consulter prologue, chapitre, épilogue et galerie sur desktop/mobile. | Image non rognée, texte lisible, focus visible, commandes atteignables. | Revue visuelle |
| IV-Q16 | Fin de combat — KO décisif, chrono, passage de finition, pause et retour au menu. | Un seul résultat, bonne récompense et reprise jouable. | Test logique/UI |
| IV-Q17 | Entraînement — Attaquer, réinitialiser, quitter et relire les statistiques. | Aucun résultat d’entraînement ajouté au registre. | Test logique/UI |
| IV-Q18 | Préservation du classeur — Comparer les parties OOXML historiques V3 après assemblage. | 29 feuilles conservées à l’octet, cinq ajouts, formules nouvelles sans erreur. | Contrôle du classeur |
| IV-Q19 | Build autonome — Construire manager et standalone puis vérifier les chemins/empreintes. | Aucun asset référencé manquant ni import interdit du manager. | Build et vérification |
| IV-Q20 | Revue de fidélité — Comparer chaque nouveau visuel à son incarnation et sa référence. | Statut conservé à vérifier tant qu’une comparaison réelle n’est pas consignée. | Revue artistique |

## Instruction pour la prochaine reprise

Lire `AGENTS.md`, la présente matrice, `extension-plan.json`, `campaign-design-v3.json` et les derniers rapports de livraison. Réconcilier les fichiers avec la branche de la PR avant de produire. Choisir un lot cohérent parmi les éléments manquants, conserver l’incarnation et la référence de chaque sujet, et garder un sujet exploitable par sprite autonome. Les réserves ne deviennent jouables qu’après une fiche de rôle, un kit, des réactions et des tests. Les évolutions narratives conservent leur identité de route afin de reprendre les anciennes sauvegardes. Mettre à jour la matrice et les preuves du lot, puis publier dans la PR autorisée.

## Régénération et preuves du classeur

Lancer `build-guide-bible.mjs` avec le Node du runtime de documents depuis un dossier temporaire isolé. Le script extrait les tables TypeScript, contrôle les associations, génère la version lisible et le JSON, crée cinq feuilles avec Artifact Tool, recalcule et rend leurs plages, puis assemble les parties OOXML sans réécrire les 29 feuilles V3. Le classeur V3 demeure archivé. Les rapports `QA_GUIDE_DATA_V4_2026-11-25.json` et `QA_GUIDE_WORKBOOK_V4_2026-11-25.json` décrivent les contrôles effectivement effectués.

Le contrôle structurel et le rendu des feuilles ne prouvent pas la fidélité visuelle au lore, le fonctionnement du combat en navigateur ou le recalcul dans Microsoft Excel natif. Ces preuves demandent leurs vérifications propres.
