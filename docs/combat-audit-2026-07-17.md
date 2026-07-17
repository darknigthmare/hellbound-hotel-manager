# Audit complet â€” Pentagram Arena

Date : 17 juillet 2026
Surface : sÃ©lection des combattants, combat CPU, combat local, clavier, tactile, responsive et accessibilitÃ©
Viewports contrÃ´lÃ©s : 1440Ã—900 et 390Ã—844

## Verdict

Le mode est jouable, sans crash ni dÃ©bordement horizontal, et les deux combattants restent correctement orientÃ©s. Le moteur gÃ¨re les impacts actifs, la garde, le hitstop, les rounds et trois niveaux dâ€™IA. Les dÃ©fauts bloquants trouvÃ©s pendant lâ€™audit â€” entrÃ©e de round, tension sur les coups ratÃ©s, cadence basse, time-over, contrÃ´les accessibles, tactile multi-pointeurs et sÃ©lecteur trop dense â€” ont Ã©tÃ© corrigÃ©s et couverts par tests. Les modes entraÃ®nement, tournoi, gamepad, saut et routes aÃ©riennes restent des extensions de profondeur, pas des rÃ©gressions du combat actuel.

## Correctifs appliquÃ©s aprÃ¨s la capture

- La tension ne monte plus sur un coup ratÃ© ni sur une garde hors portÃ©e.
- Le moteur avance par sous-pas dâ€™au plus 16 ms dans une enveloppe visible maximale dâ€™une seconde ; impacts, fin dâ€™action, hitstop et time-over bornent encore chaque sous-pas Ã  leur instant exact.
- Aucun coup ne peut toucher aprÃ¨s la fin du timer et une mÃªme sÃ©quence produit dÃ©sormais le mÃªme rÃ©sultat malgrÃ© un dÃ©coupage irrÃ©gulier des frames.
- Chaque round commence par `READY / FIGHT`; la perte de focus ou le masquage de lâ€™onglet met le combat en pause.
- Des boutons visibles gÃ¨rent pause, reprise, sortie, round suivant et rematch, avec le raccourci `P` en complÃ©ment.
- Le cancel light vers heavy fonctionne de la mÃªme faÃ§on au clavier et au tactile.
- Les pointeurs tactiles sont suivis indÃ©pendamment et une perte de capture libÃ¨re direction/garde sans laisser dâ€™entrÃ©e bloquÃ©e.
- Les deux grilles dupliquÃ©es ont Ã©tÃ© remplacÃ©es par un roster unique recherchable et paginÃ© de 12 combattants, avec choix P1/P2 et statistiques de combat rÃ©elles.
- Vingt-deux nouveaux profils Hazbin Ã©ligibles rejoignent automatiquement le roster lorsque leur art est validÃ©, sans entrer dans la sauvegarde opÃ©rationnelle et avec des kits explicitement Simulation AU.
- Prick et Hatchet sont corrigÃ©s comme Overlords disponibles dÃ¨s la timeline S1, donc le sÃ©lecteur Season 1 affiche dÃ©sormais 26 combattants au total, dont 6 ajouts Hazbin art-ready.
- L'IA avance maintenant ses dÃ©cisions en sous-pas synchronisÃ©s au moteur ; une frame visible longue ne lui donne plus une dÃ©cision appliquÃ©e rÃ©troactivement Ã  tout l'intervalle.
- Les boutons incrustÃ©s dans l'overlay de K.O. ne crÃ©ent plus de tracker tactile de scÃ¨ne, ce qui Ã©vite qu'un tap sur `Next round` soit interprÃ©tÃ© comme une commande de sortie.
- Le validateur dâ€™atlas contrÃ´le dÃ©sormais les marges de cellules, le clipping et les portraits extraits.
- La version mobile corrigÃ©e reste sans dÃ©bordement et conserve le choix du combattant dans une zone compacte.
  Capture : [12-mobile-selector-fixed.png](../art/audits/combat-2026-07-17/12-mobile-selector-fixed.png)

## Passe finale Hazbin et navigateur

- Annuaire Hazbin : 81 profils au total, dont 57 fiches de rÃ©fÃ©rence hors sauvegarde opÃ©rationnelle.
- Assets : 20 atlas Hazbin prÃªts cÃ´tÃ© annuaire ; l'extension OpenAI ajoute 14 feuilles, 336 cellules et 56 portraits, et garde Tiffany en entrÃ©e lore-only sans design inventÃ©.
- Roster Arena : 22 nouveaux profils Hazbin deviennent Ã©ligibles selon la timeline et les spoilers. Les quatre nouveaux patrons sont limitÃ©s Ã  la Season 2 ; en Season 1 masquÃ©e, la liste reste inchangÃ©e avec Razzle, Dazzle, Clara, Odette, Prick et Hatchet disponibles aux cÃ´tÃ©s des 20 combattants dÃ©jÃ  actifs.
- Mobile 390Ã—844 : sÃ©lection, annuaire et combat live vÃ©rifiÃ©s sans overflow ; le combat dÃ©marre directement Ã  la place du sÃ©lecteur.
- Desktop 1440Ã—900 : annuaire, sÃ©lection paginÃ©e et combat Clara Carmine vs Dazzle vÃ©rifiÃ©s ; aprÃ¨s lancement, le sÃ©lecteur disparaÃ®t bien.
- Orientation : P1 expose `data-facing="right"` et P2 `data-facing="left"`, avec transform miroir uniquement cÃ´tÃ© P2.
- Pause/reprise/sortie : Pause passe en `paused`, Continue revient Ã  `ready`, Quit rend le sÃ©lecteur.
- Console navigateur : uniquement les messages Vite/React attendus, aucune erreur runtime.

Captures : [13-mobile-hazbin-directory.png](../art/audits/combat-2026-07-17/13-mobile-hazbin-directory.png), [14-mobile-hazbin-fight.png](../art/audits/combat-2026-07-17/14-mobile-hazbin-fight.png), [15-mobile-hazbin-live.png](../art/audits/combat-2026-07-17/15-mobile-hazbin-live.png)

## Parcours vÃ©rifiÃ©

1. **EntrÃ©e depuis le tableau de bord â€” saine.** Le mode est identifiable dans la navigation et reste sÃ©parÃ© des opÃ©rations canon de lâ€™hÃ´tel.
   Capture : [01-dashboard-entry.png](../art/audits/combat-2026-07-17/01-dashboard-entry.png)
2. **SÃ©lecteur initial â€” fonctionnel, mais trÃ¨s haut.** Les portraits, fiches, rÃ¨gles Simulation AU et deux sÃ©lecteurs sont prÃ©sents.
   Capture : [02-fighter-select.png](../art/audits/combat-2026-07-17/02-fighter-select.png)
3. **Changement de matchup â€” fonctionnel.** Lucifer contre Adam a Ã©tÃ© sÃ©lectionnÃ© sans incohÃ©rence ni doublon. Les 44 raccourcis visibles crÃ©ent cependant une forte densitÃ© et des noms tronquÃ©s.
   Capture : [03-fighter-change.png](../art/audits/combat-2026-07-17/03-fighter-change.png)
4. **Options et lancement â€” fonctionnels, trop Ã©loignÃ©s du choix.** Le bouton de lancement se trouve aprÃ¨s deux longues grilles de roster.
   Capture : [04-match-options.png](../art/audits/combat-2026-07-17/04-match-options.png)
5. **Combat CPU â€” jouable, rythme initial injuste.** Le CPU peut attaquer immÃ©diatement pendant que le joueur dÃ©couvre encore les commandes.
   Capture : [05-live-fight.png](../art/audits/combat-2026-07-17/05-live-fight.png)
6. **Fin de round â€” lisible, mais contrÃ´le uniquement implicite.** Le rÃ©sultat est clair, mais continuer, quitter ou relancer dÃ©pend de touches ou de zones tactiles sans boutons visibles.
   Capture : [07-round-result.png](../art/audits/combat-2026-07-17/07-round-result.png)
7. **SÃ©lection mobile â€” sans overflow, beaucoup trop longue.** Une seule carte occupe presque tout lâ€™Ã©cran avant mÃªme les raccourcis et le second combattant.
   Capture : [09-mobile-selector-closed.png](../art/audits/combat-2026-07-17/09-mobile-selector-closed.png)
8. **Combat mobile â€” sain.** HUD, scÃ¨ne et sprites restent lisibles Ã  390 px ; la page ne dÃ©borde pas horizontalement.
   Capture : [10-mobile-live-fight.png](../art/audits/combat-2026-07-17/10-mobile-live-fight.png)
9. **Combat local mobile â€” sain.** Les deux joueurs restent visibles et les commandes tactiles dÃ©clenchent bien une attaque.
   Capture : [11-mobile-local-fight.png](../art/audits/combat-2026-07-17/11-mobile-local-fight.png)

## Constats enregistrÃ©s avant correction

### P1 â€” moteur et Ã©quitÃ©

- Un coup ratÃ© donne de la tension Ã  lâ€™attaquant et peut en donner au dÃ©fenseur qui garde hors portÃ©e. Cela permet de charger un spÃ©cial sans interaction.
- Le delta moteur est limitÃ© Ã  100 ms tandis que lâ€™IA et les animations CSS continuent sur le temps rÃ©el. Ã€ bas FPS, lâ€™impact arrive aprÃ¨s la fin visuelle du coup.
- Aucun compte Ã  rebours `READY / FIGHT` ne protÃ¨ge lâ€™entrÃ©e de round.
- La perte de focus vide les touches mais ne suspend pas le CPU ; un joueur peut subir des dÃ©gÃ¢ts pendant quâ€™il change de fenÃªtre.
- Les neuf Ã©tats de combat rÃ©utilisent trop peu de poses : idle, marche et garde partagent une cellule ; hit et K.O. partagent une cellule.
- Le validateur dâ€™atlas vÃ©rifie la quantitÃ© de pixels, pas les silhouettes qui touchent les bordures de cellule.

### P1 â€” UX et accessibilitÃ©

- Le sÃ©lecteur actuel rend deux fois la liste complÃ¨te. Avec 22 combattants, il contient dÃ©jÃ  44 boutons ; lâ€™extension Hazbin le rendrait impraticable.
- Continuer, quitter, pause et rematch nâ€™ont pas de boutons accessibles dÃ©diÃ©s.
- La zone tactile principale utilise `touch-action: none`, ce qui bloque les gestes de navigation dans cette rÃ©gion.
- Les commandes sont affichÃ©es sous la scÃ¨ne : le joueur doit comprendre le jeu aprÃ¨s que le CPU a dÃ©jÃ  commencÃ© Ã  agir.

### P2 â€” profondeur et robustesse

- Pas de buffer dâ€™entrÃ©e, pause, gamepad, remapping, entraÃ®nement, saut, lancer ou garde cassable.
- Le cancel light â†’ heavy existe au tactile, mais pas au clavier.
- Le compteur prÃ©sentÃ© comme menace narrative ne montre pas les vraies statistiques de combat.
- Une feuille dâ€™atlas chargÃ©e en background nâ€™a pas de fallback portrait si son URL Ã©choue.
- Les portraits du sÃ©lecteur ne sont pas diffÃ©rÃ©s et le composant de combat est rerendu Ã  chaque frame.
- Les annonces `aria-live` peuvent devenir trop frÃ©quentes pendant une sÃ©quence dâ€™attaques.

## Points solides

- Pas de crash ni dâ€™overlay dâ€™erreur durant le parcours.
- Pas de dÃ©bordement horizontal Ã  390 px.
- Les orientations P1 droite / P2 gauche sont cohÃ©rentes.
- Les collisions, limites de terrain, fenÃªtres dâ€™impact, hitstop, garde Ã  lâ€™impact, double K.O., rounds et rematch sont couverts par le moteur.
- Le combat local et lâ€™attaque tactile fonctionnent.
- Les rÃ¨gles indiquent clairement que les rÃ©sultats sont une Simulation AU sans effet sur le canon ou la sauvegarde de lâ€™hÃ´tel.

## Validation automatisÃ©e finale du moteur

- 27 tests ciblÃ©s combat, entrÃ©es live et accessibilitÃ© rÃ©ussis.
- 50 000 transitions alÃ©atoires sans rupture des invariants HP, tension, timer, positions, rounds ou victoire.
- 10 000 partitions de frames comparÃ©es sans divergence de rÃ©sultat.
- TypeScript et ESLint ciblÃ© rÃ©ussis.

## Limites de preuve

Les captures permettent de confirmer le rendu, le responsive et les interactions visibles, mais pas une conformitÃ© WCAG complÃ¨te. Les lecteurs dâ€™Ã©cran rÃ©els, le zoom 200 %, les gamepads et les frÃ©quences 5â€“120 FPS nÃ©cessitent des tests dÃ©diÃ©s. Les dÃ©fauts moteur ont Ã©tÃ© confirmÃ©s par lecture du code et tests automatisÃ©s ciblÃ©s.
