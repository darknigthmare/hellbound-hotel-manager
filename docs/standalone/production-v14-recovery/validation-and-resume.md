# V14 — état des validations et reprise

Date de la reprise documentaire : 26 novembre 2026. Les faits de cette note proviennent des observations consignées pendant la session, avant la perte du système d'exécution. Les rapports locaux mentionnés ci-dessous ne sont pas automatiquement inclus dans cette sauvegarde.

## État exact des validations

| Périmètre | Dernier résultat connu | Limite |
| --- | --- | --- |
| Sept dessins natifs | Générés, examinés contre les références, acceptés avec limites | Les rapports détaillés étaient locaux ; les PNG récupérés sont vérifiés par SHA-256 contre les masters acceptés |
| Exports WebP | Les sept exports lossless avaient une égalité RGBA complète avec leurs PNG | Les WebP et les deux miniatures ne sont pas récupérés dans ce checkpoint |
| Première passe technique V14 | 413 tests / 47 suites ; TypeScript, ESLint, builds manager et standalone, emballage et intégrité réussis | Résultat antérieur au correctif de préchargement |
| Couverture de la première passe | 735 chemins actifs, aucun cassé ; 1 339 empreintes de distribution ; 207 fichiers d'entrée stables | Empreinte runtime `ca3c1a332dc73948242883555a48a0799f280ceef45ff6a4a4a2a23b9ea6013b` ; manifeste `5808603285ebaef26f73a371f6adcd8b6169c9c13c2113510ed1276322b57886` |
| Correctif de préchargement | Six nouveaux tests ciblés réussis dans une suite, 1,46 s | Tests du véritable effet React via Image.src/decode instrumentés sous jsdom ; pas de décodage natif ni de mesure RSS |
| Nouvelle passe technique après correctif | Lancée, résultat non lu avant la coupure | Statut INCONNU ; ne pas transposer la passe précédente aux sources modifiées |
| Navigateur | Aucun des huit segments prévus n'a complètement réussi | Deux crashs natifs à l'entrée en combat, galerie bloquée au clic, essai mobile interrompu |
| Registre final | Non assemblé | Le mode final exige des preuves techniques et navigateur courantes |
| Bible V14 | Aucun fichier XLSX V14 produit | La bible Drive est restée V13 |
| Publication V14 | Aucune publication finale | La PR 8 est restée sur le commit V13 |

La première passe réussie utilisait les commandes équivalentes séquentielles du superviseur Python. Elle ne doit pas être décrite comme une exécution monolithique de `npm run qa`.

## Correctif de préchargement conservé

L'effet de préchargement de `PentagramLiveFight.tsx` ne charge désormais que l'image READY d'un costume marqué `staticReadyOnly` pour ce combattant. L'adversaire conserve les banques et les poses dont il a besoin, y compris lorsque les deux combattants partagent la même banque. Les accessoires de fin et les effets d'attaque demeurent chargés. Les costumes multiposes et le fonctionnement hors des règles Infernal sont préservés.

Les six tests couvrent les deux côtés statiques, un adversaire normal avec accessoire séparé, la conservation d'une banque partagée, un miroir Blitzø statique/normal, un ancien costume multipose et le mode hors Infernal.

Les fichiers sauvegardés du composant et de cette nouvelle suite ont exactement les SHA-256 observés après le succès des tests ciblés. Cela ne remplace pas la nouvelle passe technique complète.

Une banque helluva-core de huit PNG 1536 × 1024 représente 48 Mio de pixels RGBA théoriques. Une pose 1024 × 1536 représente 6 Mio. Il s'agit de tailles théoriques, pas de mesures mémoire. Un miroir Blitzø statique/normal ne supprime aucune ressource unique nécessaire à l'adversaire. Ce correctif ne prouve donc pas la cause des crashs constatés.

## Observations navigateur avant la coupure

Le harnais prévu comprend huit segments : bureau 1440 × 1000 et mobile 390 × 844, chacun pour Blitzø/boutique, Moxxie/salle à manger, Millie/boutique et galerie. Navigation par l'interface réelle, sans injection d'état de jeu ni clic forcé.

- Bureau Blitzø/boutique : 17 contrôles réussis puis deux échecs liés à la session/crash ; quatre captures. Crash natif à l'entrée en combat.
- Bureau Moxxie/salle à manger : 15 contrôles réussis puis deux échecs ; trois captures. Crash natif à l'entrée en combat.
- Galerie bureau : compteur de 138 créations observé, recherche saisie ; le clic attendait une carte visible, activée et stable puis a expiré. Aucune vue détaillée ni validation des filtres S1 n'a été obtenue.
- Mobile Blitzø/boutique : interrompu sur demande interne, code de sortie 130, quatre captures ; aucune réussite de segment revendiquée.

L'affichage de certains dessins dans le vestiaire et certaines miniatures a été examiné. Ces observations partielles ne valident ni les combats complets ni toute la galerie. Aucun essai physique sur téléphone, écoute audio, essai multi-navigateur ou validation du déploiement n'a été achevé.

Le seul binaire utilisable observé était Chromium headless shell 143.0.7499.4, avec GPU désactivé. Le wrapper `/usr/bin/chromium` pointait vers un binaire absent. Le partage mémoire avait environ 5 Go disponibles ; il n'est pas établi qu'un manque de /dev/shm causait les crashs.

Les archives initiales étaient sous `docs/standalone/production-v14/browser-harness/failed-segments/`. Leur existence actuelle n'a pas pu être revérifiée. Une instrumentation bornée RSS/stderr du harnais était en cours au moment de la coupure ; l'application de ce patch n'est pas confirmée. Aucun essai après correctif n'a été exécuté.

## Reprendre lorsque l'exécution redevient disponible

1. Examiner le travail local existant avant tout remplacement. La perte d'accès ne prouve pas la perte des fichiers. Ne pas régénérer les sept dessins récupérés.
2. Vérifier les SHA-256 des PNG et des sources conservées. Les six autres copies de sources sont des reconstitutions des changements consignés : les comparer aux fichiers locaux s'ils existent.
3. Récupérer les exports WebP, miniatures, références, prompts, handoffs, registres provisoires, scripts QA et archives locales. S'ils manquent, produire les dérivés à partir des PNG immuables, documenter cette reconstruction et refaire les contrôles RGBA. Ne pas prétendre retrouver un ancien fichier à l'octet près sans comparaison de son empreinte.
4. Vérifier l'état réel du harnais et de sa recette, puis relancer la passe technique complète sur des sources figées. Conserver les journaux des échecs.
5. Exécuter d'abord un seul essai navigateur bureau Moxxie/salle à manger avec les mesures prévues. En cas d'échec, traiter le résultat avant d'enchaîner les autres segments. Si cet essai réussit, achever les huit segments et la revue des captures.
6. Assembler le registre final uniquement après validation des entrées et des preuves courantes. Préserver les 133 anciennes fiches de galerie.
7. Générer la bible V14 à partir de la V13, vérifier les éléments OOXML historiques et les nouvelles feuilles, puis remplacer le même fichier Drive et contrôler le téléchargement après écriture.
8. Publier la V14 validée dans la PR existante, vérifier CI et aperçu. Ne pas fusionner la PR ni modifier les protections Vercel.

## Réglages de la première passe réussie

Le superviseur `verify-runtime.py` lançait TypeScript, ESLint et Vitest séparément, avec journaux et calculs d'empreinte en flux. Les deux builds Vite s'exécutaient également séparément. Les variables `ROLLDOWN_WORKER_THREADS=2` et `RAYON_NUM_THREADS=2` avaient permis aux builds de terminer dans cet environnement. Des tentatives précédentes avaient fini par SIGKILL ou manque de heap V8 ; cela ne démontre pas une cause unique.

L'option de reprise du superviseur exigeait les mêmes sources, commandes et limites de processus. Ne pas réutiliser un résultat réussi antérieur après modification des fichiers sans la vérification prévue.

## Portée de ce checkpoint

Les sources applicatives actives de la branche de récupération restent celles de la V13. Les copies V14 sont des fichiers texte documentaires sous `source/`. Les PNG sont conservés dans leurs chemins de masters, mais les exports runtime V14 ne sont pas livrés ici. Un éventuel résultat CI de cette branche de récupération ne validerait donc pas la version jouable V14.
