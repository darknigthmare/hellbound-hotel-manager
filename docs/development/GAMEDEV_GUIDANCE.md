# Guides gamedev pour Hellbound / Infernal Versus

Source : https://github.com/gamedev-skills/awesome-gamedev-agent-skills (révision 19d93f97c9c1ea0f8b306e77aa81e0d3e352d3e9, consultée le 29/10/2026).

## Pile et périmètre
Ce dépôt utilise React, TypeScript et Vite, avec une logique de combat personnalisée. Les exemples Godot/Unity des guides ne sont pas des instructions de migration. Charger uniquement les guides pertinents, à leur révision épinglée.

## Guides à utiliser
- `router` : identifier le travail et choisir les disciplines.
- `create-game-assets` : sprites, costumes, pivots, proportions, transparence et contrôles en jeu.
- `input-systems` : commandes, joueurs locaux, relâchement sur perte de focus et accessibilité.
- `physics-tuning` : pas de simulation, collisions, déplacements et stabilité.
- `game-feel` : hit-stop, recul, VFX, feedback d'impact.
- `game-ui-ux` : menus, HUD, focus clavier/manette et écrans adaptatifs.
- `game-ai` : comportement des adversaires.
- `level-design` et `camera-systems` : limites des arènes, lisibilité et cadrage.
- `audio-design` : mixage, transitions et effets.
- `save-systems` : progression, imports et isolation des sauvegardes.
- `performance-optimization` : mesurer avant d'optimiser.

Chaque guide est disponible sous `skills/disciplines/<nom>/SKILL.md` dans le dépôt amont épinglé ; le routeur est sous `router/SKILL.md`.

## Règles propres au combat
Avant de modifier le combat, lire `src/lib/pentagram-combat.ts`, `pentagram-animation.ts`, `pentagram-ai.ts`, `pentagram-stages.ts` et les tests correspondants. Le moteur possède déjà des timings, états, réactions et hit-stop : étendre plutôt que réinventer. Pour tout nouveau coup, préciser startup, contact, récupération, portée, dégâts, recul, garde, interruption et répétition des contacts. Tester KO, fin de manche, pause, retour des cinématiques et unicité du résultat.

## Fidélité et production
Conserver la séparation canon / simulation AU définie dans `docs/lore-governance.md`. Chaque revendication de fidélité 1:1 (personnage, costume, stage, animation, intro/outro/finisher) exige une référence vérifiable et une comparaison visuelle en jeu. Les coups, dégâts et timings inventés sont des adaptations, pas des faits canoniques. Pour le contenu du standalone, maintenir `docs/standalone/extension-plan.json` et régénérer l'Excel via son processus documenté ; distinguer prévu, intégré, testé et vérifié visuellement.

## Validation
Les suites utiles sont `src/tests/pentagram-combat.test.ts`, `pentagram-live-inputs.test.tsx`, `pentagram-ai.test.ts`, `pentagram-stages.test.ts`, `pentagram-cinematics.test.ts`, `standalone-progression.test.ts` et `standalone-live-fight.test.tsx`. La commande complète du dépôt est `npm run qa`. Une lecture statique ne prouve ni la fidélité visuelle ni la fluidité. Décrire les tests réellement exécutés et ne pas reprendre les résultats d'une ancienne version comme preuves du changement courant.

Ces guides sont des références de travail, non des dépendances installées ou du code gameplay supplémentaire.
