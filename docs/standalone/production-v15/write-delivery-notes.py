"""Write the release note from the finalized production and workbook evidence."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
register = json.loads((HERE / 'delivery-register.json').read_text())
assert register['status'] == 'final_production_register'
qa = register['qa']
assert qa['status'] == 'passed'
workbook = json.loads((HERE / 'workbook-qa.json').read_text())
assert workbook['visualReview'] in ['passed', 'passed_with_documented_limits']

text = f'''# Infernal Versus V15 — personnages, guides et déblocages

Livraison du **27 novembre 2026**, dans la [PR nº 8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8).
La V14 récupérée est publiée au commit `d03434054739e2995ccdc86617fb2ca3a1ea56bf` ; son arbre contient les 249 chemins transférés sans suppression des archives historiques absentes localement.

## Cinq dessins statiques raccordés à la galerie

| Dessin | Usage et continuité | Nouvelle base entière |
| --- | --- | --- |
| Queef | Soutien entier, modèle du produit officiel Creator Collection d’Amanda Heard | Oui : une base de réserve |
| Roo | Portrait du concept 2019, connu ici par une reproduction secondaire | Non |
| Top Hat Demon | Portrait du pilote officiel de 2019 | Non |
| Eve | Silhouette assise du récit d’ouverture S1 | Non : archive narrative |
| Lilith | Silhouette debout du même récit | Non : archive narrative |

Les cinq masters préexistants sont récupérés et conservés sans retouche. Ils donnent **5 PNG natifs et 5 WebP sans perte**, soit **{register['counts']['deliveredImageBytes']:,} octets**. Les cinq exports décodés sont identiques en RGBA aux masters. Cette égalité vérifie la conversion, pas la fidélité artistique aux références.

Le détail de galerie différencie pilote, concept historique, récit de saison 1 et produit officiel. Les liens secondaires et les sources primaires inaccessibles portent leur qualification. L’ouverture d’une fiche place désormais l’illustration entière dans la zone visible, tout en donnant le focus au titre sans déplacer l’image sous l’en-tête.

Les cinq dessins ont été comparés aux références et inspectés sur fond clair, gris et sombre. Les cinq vues ordinateur et les cinq vues mobiles finales montrent les silhouettes entières. La [revue indépendante](independent-final-visual-review.json) conserve les limites de contour, de résolution, de pose et de provenance. **Aucune fidélité 1:1 certifiée, aucun nouveau kit jouable et aucun nouveau cycle animé ne sont annoncés.**

## Guide général et deux extensions

Le [point d’entrée des guides](../COMBAT_GUIDES.md) relie les trois originaux conservés à l’identique à leur contexte Hazbin Hotel / Helluva Boss. Le guide général était déjà intégré depuis V4. Les extensions couvrent les sections **30–49** et **50–67**, soit **68 sections au total** avec le guide général.

L’annexe ajoute **16 fiches adaptées**, **8 duos prioritaires**, **10 concepts de bonus** et **40 cas d’acceptation**. Taunts, sélection/désélection, assistance, relais, supers d’équipe, fins dramatiques et bonus sont documentés avec leur état réel. Les nouvelles règles de déblocage ci-dessous sont le périmètre de code effectivement livré ; elles ne rendent pas les autres propositions automatiquement jouables.

## Sept règles de déblocage optionnelles

Le réglage est désactivé par défaut, y compris au chargement des anciennes sauvegardes. Son activation utilise les compteurs locaux validés et les chroniques versionnées.

| Contenu | Condition |
| --- | --- |
| Lucifer | Chronique actuelle de Charlie terminée ou 10 victoires J1 hors dojo |
| Stolas | Chronique actuelle de Blitzø terminée ou 10 victoires J1 hors dojo |
| Blitzø — Bodyguard | 1 victoire J1 hors dojo |
| Moxxie — Bodyguard | 3 victoires J1 hors dojo |
| Portes célestes | Chronique de Charlie terminée ou 5 victoires J1 hors dojo |
| Cour des Goetia | Chronique de Blitzø terminée ou 5 victoires J1 hors dojo |
| Boss Rush | Un parcours Arcade terminé |

Les personnages et costumes verrouillés affichent une silhouette et un sceau. Les arènes affichent leur miniature assombrie. Tous expliquent leur condition et restent accessibles au focus. Le dojo prête le contenu sans attribuer de récompense. Les parcours engagés avant l’activation restent reprenables grâce à un prêt limité au parcours et aux acteurs enregistrés.

La sélection est contrôlée de nouveau au lancement. La tenue est figée pendant le duel ; un gain débloqué en fin de combat devient disponible au prochain lancement ou à la revanche. Les profils locaux ne vérifient aucun abonnement externe : l’extension concernant les abonnés reste une conception à raccorder à un service approprié.

## Comptes cumulés

| Indicateur | V14 | V15 |
| --- | ---: | ---: |
| Identifiants du catalogue | 209 | 209 |
| Identités après alias connu | 208 | 208 |
| Bases autonomes | 114 | **115** |
| Bases actives / de réserve | 40 / 74 | **40 / 75** |
| Identifiants sans base entière | 95 | **94** |
| Identités distinctes sans base | 94 | **93** |
| Entrées de galerie | 138 | **143** |
| Kits jouables | 43 | **43** |
| Arènes | 51 | **51** |
| Familles de costumes | 27 | **27** |
| Illustrations personnelles | 127 / 129 | **127 / 129** |

Les portraits et les silhouettes du récit ne ferment pas les manques de modèles entiers détaillés. Les anciennes qualifications restent préservées dans le plan et la bible.

## Vérifications et bible

- Commande standard **`npm run qa` réussie : {qa['testsPassed']} tests dans {qa['testSuites']} suites**, typage, lint, builds manager/standalone et contrôle de distribution. Les entrées runtime avant et après sont identiques ; [rapport](runtime-qa.json) et [journal](qa-runtime.log).
- **{qa['referencedAssets']} références de ressources**, aucun chemin cassé ; [couverture courante](active-asset-coverage.json).
- Galerie : **12 contrôles** et **10 captures** finales, cinq dessins dans les deux formats, zéro erreur de console ou de page ; [recette](browser-gallery-qa.json).
- Déblocages : **28 contrôles navigateur**, **8 captures inspectées** et tests de progression, menu, sauvegarde, lancement et reprise ; [preuves](../../../art/audits/unlock-slots-20261127/).
- Bible V15 : **68 feuilles et 77 tableaux**, avec les **60 feuilles et 69 tableaux V14 préservés**. Huit nouvelles feuilles couvrent la production, les cibles et les six volets des extensions ; [classeur](../INFERNAL_VERSUS_BIBLE_V15.xlsx), [contrôle](workbook-qa.json).

La première passe globale s’est arrêtée sur l’attente d’un ancien test de sauvegarde qui omettait le nouveau défaut `progressionEnabled: false`. La fixture ancienne et les contrôles de non-réécriture/route/import ont été conservés ; l’attente stricte a été complétée, puis la commande globale relancée. Les [preuves de la première passe](technical-attempts/legacy-options-expectation/) restent disponibles.

Les recettes sont réalisées dans Chromium local, en bureau et tactile émulé. Elles ne constituent pas un essai sur téléphone physique ou une certification de performance longue durée. Les contrôles distants de CI et de déploiement sont rapportés séparément sur le commit réellement publié.

## Preuves de provenance

Le [registre final](delivery-register.json) distingue les cinq dessins, leurs fichiers, empreintes, sources, rôles, limites et compteurs. Les [handoffs](characters-handoff.json) sont conservés tels que récupérés, y compris leurs statuts préparatoires antérieurs. Les [prompts](characters-prompts.json) et [références](characters-references.json) restent liés aux images.

Le handoff Lilith contient à la fois un refus antérieur et un master de reprise. Cette continuation a récupéré le master déjà présent et n’a effectué aucune nouvelle génération de Lilith. Cette discordance chronologique reste explicitement consignée ; elle n’est pas effacée par la revue visuelle.
'''
(HERE / 'README.md').write_text(text)
character_notes = HERE / 'CHARACTER_DELIVERY.md'
old = character_notes.read_text()
old = old.replace('Le statut de contrôle dans le jeu reste distinct et doit être complété après intégration.', 'Le contrôle actuel dans la galerie est terminé sur ordinateur et mobile ; le registre final et la revue indépendante consignent les preuves et leurs limites.')
character_notes.write_text(old)
print(HERE / 'README.md')
