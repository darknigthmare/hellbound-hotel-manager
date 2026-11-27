# Décors, accessoires et projectiles : reprise après V7

État de référence : commit `daae498`, registre `production-v7/delivery-register.json`, audit `production-v7/environment-audit.json` et couverture `production-v7/active-asset-coverage.json`. Ce document résume les preuves du dépôt ; il ne constitue pas une nouvelle inspection des épisodes.

## Intégrations possibles avec des fichiers déjà livrés

| Arène à un seul plan en V7 | Ressource existante | Action précise |
|---|---|---|
| `sloth-hospital` | `public/assets/props/infernal-versus/sloth-hospital-chair.webp` | Vérifier la chaise dans le fond, puis choisir son placement de profondeur sans duplication visible ni obstruction des pieds. |
| `cherub-opera-stage` | `public/assets/props/infernal-versus/cherub-opera-spotlight.webp` | Vérifier l’accroche et la profondeur du projecteur avant de le référencer dans l’arène. |
| `dhorks-portal-chamber` | `public/assets/machines/infernal-versus/dhorks-portal-ring.webp` | Comparer l’anneau séparé au fond existant. Éviter d’afficher deux portails si la machine y est déjà peinte. |
| `sinsmas-frozen-pavilion` | Dragon initial à une tête livré dans V7 | Le dragon est une machine, pas automatiquement un accessoire de parallaxe. Les piliers propres au combat restent à qualifier. |
| `seeing-stars-overlook` | Fond et miniature présents | Qualifier des objets réellement visibles du belvédère avant de produire des plans indépendants. |
| `vox-office-s2` | Fond et miniature présents | Qualifier séparément câbles et écrans. La façade complète de la tour reste une autre cible. |
| `hellaverse-training` | Fond AU et miniature présents | Des accessoires originaux peuvent compléter la profondeur en gardant la piste dégagée ; aucune provenance canonique à revendiquer. |

Le portail D.H.O.R.K.S., la chaise Sloth, le projecteur d’opéra, le cristal asmodéen, le bureau de Vox, le pavillon gelé et l’extérieur de l’hôpital ne doivent pas être redessinés seulement pour combler un ancien statut du plan. Le fond Sloth extérieur V7 et le hall vitré des enchères V7 possèdent déjà trois plans.

## Productions attendant une référence supplémentaire

| Cible | Preuve qui manque |
|---|---|
| Flèche dorée C.H.E.R.U.B. | Vue primaire de la pointe, de la hampe et de l’empennage entiers et lisibles. |
| Shuriken D.H.O.R.K.S. | Nombre et forme des pointes, contour intérieur éventuel, sans flou. |
| Toit de l’Extermination S1 | Sol, rebords et accès de l’ancien hôtel dégagés ; conserver la période S1. |
| Façade VoxTek | Vue entière distincte du bureau S2 ; références propres aux câbles et écrans. |
| Arme des Vees S2 | Machine entière, extrémité, support arrière et socle simultanément lisibles. |
| Site de l’arme des Vees S2 | Architecture et limites du sol visibles sans foule, arme ou effets masquants. |
| Salle principale des enchères S3 | Sol et disposition de la salle de vente, séparés du hall cyan et des flash-backs. |
| Construction de glace multi-têtes | Configuration intacte entière, avec corps, pattes et queue ; la forme à une tête existe déjà. |
| Big Woobly | Corps entier de l’animatronique avec pieds, jambes, bras et guitare identifiables. |
| Aéronef du pilote 2019 | Silhouette et appendices entiers dans une référence primaire nette. |

L’aéronef de Sir Pentious S1 est une incarnation différente : sa référence a été qualifiée mais la génération V7 a été refusée. Le refus reste consigné dans le registre. Aucune relance n’est incluse dans ce processus.

## Réconciliation du plan

Les exigences `sloth-hospital` et `hb-australia` ont une vue statique livrée avec QA navigateur/mobile encore distincte. `hb-auction` couvre le hall vitré, `vox-tower` le bureau S2 et `hb-ice-palace` le pavillon existant avec le dragon initial. Un statut partiel doit nommer le manque réel, au lieu de faire croire que le dessin déjà livré reste absent.
