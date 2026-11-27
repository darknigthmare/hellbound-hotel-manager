# Historique des contraintes de ressources — V14

Le rapport de référence est [runtime-qa.json](../runtime-qa.json), produit par [verify-runtime.py](../verify-runtime.py). Il valide les contrôles sur les mêmes 207 fichiers d’entrée : 413 tests dans 47 suites, TypeScript, ESLint, les builds gestionnaire et autonome, le packaging et les 1 339 empreintes de la distribution. L’audit séparé relève 735 chemins d’assets et aucune référence cassée.

Les passages interrompus sont conservés et ne sont pas présentés comme des réussites :

| Passage | Observation | Preuve |
|---|---|---|
| Superviseur Node, TypeScript à 384 MiB | Processus tué, code 137, aucun diagnostic TypeScript | [Premier journal](typecheck-resource-killed/qa-runtime.log) |
| Superviseur Node, TypeScript à 320 MiB | Processus tué, code 137 ; l’échantillonnage observait encore plus de 1,3 GiB disponibles sur l’hôte | [Rapport](typecheck-320-resource-killed/runtime-qa.json), [échantillons](typecheck-320-resource-killed/technical-memory-monitor.json) |
| Superviseur Node, TypeScript direct à 256 MiB | Limite du tas V8 atteinte, erreur explicite d’allocation | [Journal](typecheck-256-heap-limit/qa-runtime.log) |
| Superviseur Node, empreintes en flux et TypeScript direct à 320 MiB | Sous-processus interrompu par SIGKILL | [Rapport](typecheck-320-streaming-direct-child-killed/runtime-qa.json) |
| Superviseur Python léger | TypeScript à 384 MiB validé ; ESLint à 384 MiB interrompu par SIGKILL | [Rapport](python-supervisor-lint-killed/runtime-qa.json) |
| Reprise avec ESLint à 320 MiB | ESLint validé, 413 tests validés ; build gestionnaire interrompu par SIGKILL après transformation des modules | [Rapport](manager-build-resource-killed/runtime-qa.json), [tests](manager-build-resource-killed/tests.log) |

Le passage final utilise un superviseur Python léger, des empreintes calculées en flux et les arguments inchangés des commandes du projet. TypeScript, ESLint et Vitest sont invoqués directement, sans processus npm supplémentaire. Les limites Node sont explicites dans chaque ligne de contrôle. Les deux builds utilisent chacun un nouveau processus, avec `ROLLDOWN_WORKER_THREADS=2` et `RAYON_NUM_THREADS=2`, réglages documentés dans le [guide officiel de Rolldown](https://rolldown.rs/guide/troubleshooting#containers-and-cpu-emulation).

La réussite avec moins de concurrence ne démontre pas à elle seule la cause des interruptions SIGKILL. Aucun diagnostic causal général n’est revendiqué. Le contrôle TypeScript à 256 MiB a, lui, effectivement émis une erreur de limite du tas.

Une étape déjà réussie peut être conservée après interruption de la suivante seulement si les empreintes de tous les fichiers runtime, la commande et les limites du processus sont identiques. Le rapport final relie chaque étape conservée à son rapport antérieur ; les journaux de sortie sont également vérifiés par SHA-256. Les étapes en échec sont exécutées à nouveau et ne sont jamais converties en réussite sans exécution.

Les configurations du jeu, les arguments du compilateur, les règles ESLint, les tests et leur isolation ne sont pas assouplis. La copie des fichiers publics est remplacée localement par des liens physiques vers les mêmes octets pour limiter l’espace disque ; le contrôle d’intégrité final porte sur la distribution obtenue. Le script `npm run qa` standard reste distinct de ce passage local et doit être attesté par la CI du commit publié.
