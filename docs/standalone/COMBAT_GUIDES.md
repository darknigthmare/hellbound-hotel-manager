# Infernal Versus — Guide de combat et extensions

**Mise à jour : 27 novembre 2026.** Les trois fichiers originaux de Darknigthmare sont conservés dans `references/`. Le guide général était déjà intégré depuis V4 ; les deux extensions prolongent maintenant sa matrice dans une annexe contextualisée pour Hazbin Hotel et Helluva Boss.

| Document | Sections | Intégration au projet |
| --- | --- | --- |
| [Guide général v1.0](references/Combat_Games_Guide_General_v1.0.txt) | 00–29 | [Guide V4](INFERNAL_VERSUS_GUIDE_V4.md) et [matrice V4](guide-integration-v4.json), inchangés |
| [Extension 01 — Personnalité, équipes et bonus](references/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt) | 30–49 | [Annexe des extensions](guide-extensions-20261127/INFERNAL_VERSUS_EXTENSIONS_01_02.md) |
| [Extension 02 — Slots, déblocages et abonnés](references/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt) | 50–67 | [Annexe des extensions](guide-extensions-20261127/INFERNAL_VERSUS_EXTENSIONS_01_02.md) |

La couverture documentaire comprend les **68 sections**, dix fiches générales préexistantes et **16 nouvelles fiches** adaptées au projet. L’annexe ajoute huit duos prioritaires, dix concepts de bonus, les règles d’un espace d’archives original et 40 cas d’acceptation à vérifier selon les systèmes effectivement implémentés.

Les taunts, animations de sélection/désélection, assistances, relais, supers collectives, fins dramatiques, clashes, entités persistantes, bonus et déblocages ont chacun leur décision, leur état réel et leur recette. Un élément documenté n’est pas automatiquement animé, jouable ou testé. Les personnages de réserve conservent leur statut de production.

La première intégration locale de déblocages comprend **sept règles sur des contenus existants** : Lucifer, Stolas, les tenues Bodyguard de Blitzø et Moxxie, les Portes célestes, la Cour des Goetia et Boss Rush. Ce parcours optionnel est désactivé par défaut. Son [rapport d’intégration](guide-extensions-20261127/runtime-integration.json) consigne 48 tests ciblés, 28 contrôles dans Chromium et huit captures inspectées, avec les conditions exactes et les limites restantes. La reprise de parcours déjà engagés est explicite et les tenues restent figées pendant chaque duel.

Le soutien Patreon ou équivalent reste une conception à raccorder à un service de confiance ; aucune offre ni intégration commerciale active n’est annoncée. Les 40 cas de recette documentaire couvrent aussi des systèmes futurs : les preuves ciblées du lot ne valident pas l’ensemble de cette matrice.

## Données et classeur

- [Sources et empreintes](guide-extensions-20261127/source-manifest.json) : trois originaux vérifiés à l’identique, tailles et liens Drive.
- [Registre structuré](guide-extensions-20261127/integration.json) : 38 nouvelles correspondances, fiches, duos, bonus et recette.
- [Bible V15](INFERNAL_VERSUS_BIBLE_V15.xlsx) : 68 feuilles et 77 tableaux, dont les 60 feuilles et 69 tableaux de V14 conservés à l’identique. Les deux feuilles de production V15 sont suivies des six feuilles d’extensions.
- [Données des six feuilles d’extensions](guide-extensions-20261127/workbook-sheets.json) : sources, 38 correspondances, 16 fiches, duos et bonus, recette, puis preuves de l’intégration locale.
- [Validation documentaire](guide-extensions-20261127/document-validation.json) : contrôle des empreintes, identifiants, liens locaux et décomptes ; ce rapport ne valide pas le gameplay.

Pour régénérer les données et l’annexe depuis les originaux : `python docs/standalone/guide-extensions-20261127/build-integration.py`. Le fichier `runtime-integration.json` apporte l’incrément de code et ses preuves ; la matrice distingue le constat initial, l’état après intégration et le travail restant. La construction du classeur et les contrôles de conservation sont décrits dans [la procédure V15](production-v15/workbook-build.md).
