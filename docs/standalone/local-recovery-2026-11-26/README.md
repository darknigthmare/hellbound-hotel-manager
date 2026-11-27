# Récupération des fichiers locaux — 26 novembre 2026

Cette archive sauvegarde les productions, références, scripts et preuves accessibles des sessions V8 à V10 qui n'étaient pas encore conservés dans le dépôt. Elle n'ajoute aucun asset aux catalogues du jeu. Les six candidats rejetés restent exclus des dessins acceptés et de toute intégration en jeu.

Le [manifeste](manifest.json) associe chaque chemin source à une destination relative au dépôt, avec son SHA-256, sa taille, sa catégorie et la raison de sa conservation. Les chemins absolus `/tmp/…` et `/workspace/…` servent uniquement à documenter la provenance ; après clonage, utiliser la propriété `destination`.

## Bilan vérifié

| Contrôle | Résultat |
| --- | ---: |
| Fichiers du dépôt indexés pour déduplication | 2 256 |
| Fichiers sources considérés, hors répertoires exclus | 595 |
| Sources suivies dans le manifeste | 582 |
| Sources déjà présentes dans le commit local V9 | 61 |
| Sources déjà présentes dans le worktree en cours de livraison | 51 |
| Fichiers uniques récupérés dans cette archive | **456** |
| Doublons rattachés à une autre copie de cette archive | 14 |
| Taille logique des 456 fichiers récupérés | **62 039 035 octets** |
| Candidats rejetés conservés parmi ces fichiers | 6 |
| Fichiers de cache ou transport écartés avec motif | 13 |
| Répertoires de dépendances ou caches écartés | 4 |
| Dossiers sources absents ou inaccessibles dans ce périmètre | 0 |
| Correspondances source/destination vérifiées par SHA-256 et taille | **582 / 582** |

Ces comptes couvrent les données récupérées. Le présent README, le manifeste et le script de récupération sont trois fichiers d'accompagnement supplémentaires.

Les 456 fichiers récupérés se répartissent en 353 références de recherche, 89 preuves/scripts/diagnostics historiques, huit diagnostics visuels V9 et six images candidates remplacées. Les classeurs V7, V8 et V9 des dossiers de sortie sont des doublons exacts des classeurs déjà présents dans `docs/standalone/` ; le manifeste les rattache à ces fichiers sans créer une copie supplémentaire.

## Contenu

- `evidence/` : captures navigateur V9, rendus de classeur, audits OOXML, scripts de recette, diagnostics alpha, preuves de publication et traces des tentatives V10. Les rapports en échec conservent leur statut d'origine.
- `research/` : références visuelles, planches, métadonnées de provenance et prompts utiles à la poursuite de la production. Leur présence ne certifie pas un personnage, une incarnation ni une fidélité graphique exacte.
- `rejected-candidates/v9/` : trois anciennes cloisons du salon de Beelzebub, remplacées pour nombre d'ouvertures incorrect ou bord inférieur trop serré.
- `rejected-candidates/v10/` : première version de Loo Loo au nez incorrect, Moxxie avec doublure non corroborée et Charlie au bras démoniaque incomplet. Les masters corrigés se trouvent déjà dans `production/v10/`.

## Portée des preuves

Les images de recette et les rapports sont des instantanés historiques. Ils ne prouvent pas que la version actuellement modifiée passe ses tests. Les résultats finaux de la livraison doivent être lus dans le dossier `production-v10` ou celui de la version concernée. Cette archive ne remplace ni les tests courants, ni le contrôle visuel en jeu, ni la vérification des références officielles.

Les sources ont été examinées dans les deux espaces de travail accessibles `57c1b6f2d64f` et `b07af32d1b2c`, puis dans `/tmp/infernal-v9`, `/tmp/infernal-v9-reference-audit` et `/tmp/infernal-v10`. Aucun dossier absent n'a été détecté dans cette liste. Les sessions disparues et les stockages distants ne font pas partie de cet audit.

Les dépendances `node_modules`, les caches Python et les réponses brutes de transport ne sont pas archivés. Les pages HTML brutes et la réponse complète du lecteur vidéo sont écartées ; les références qualifiées et leurs métadonnées utiles sont conservées. Aucun secret ni script de transport d'authentification n'est ajouté.

Git enregistre le contenu complet de chaque fichier récupéré lors de la publication. Le manifeste a été contrôlé sur les destinations archivées ; les déplacements ultérieurs de caches de la session n'en modifient pas le contenu.

## Reproductibilité

Le script [recover-local-evidence.py](recover-local-evidence.py) décrit le périmètre, les exclusions et la déduplication. Il nécessite les dossiers originaux de cette session ; un clone peut contrôler directement les destinations avec le manifeste. Tous les fichiers récupérés sont de simples données de traçabilité, sans raccordement au runtime du jeu.
