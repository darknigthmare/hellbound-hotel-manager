"""Build the project-specific guide extension annex and workbook data.

Reads immutable source guides and existing registries; does not change gameplay,
historical guide V4, production totals, or an existing workbook.
"""
from pathlib import Path
from hashlib import sha256
import json
import re

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
REF = REPO / 'docs/standalone/references'
DATE = '2026-11-27'
P = {
    'combat': 'src/lib/pentagram-combat.ts',
    'animation': 'src/lib/pentagram-animation.ts',
    'fight': 'src/components/PentagramLiveFight.tsx',
    'ui': 'src/standalone/InfernalVersus.tsx',
    'save': 'src/standalone/progression.ts',
    'roster': 'src/standalone/roster.ts',
    'costumes': 'src/lib/infernal-appearances.ts',
    'stages': 'src/lib/pentagram-stages.ts',
    'finishers': 'src/lib/infernal-finishers.ts',
    'story': 'src/standalone/campaign-v3.ts',
    'global': 'src/standalone/campaign-global.ts',
    'collection': 'src/standalone/NarrativeCollection.tsx',
    'reserve': 'art/infernal-versus/production/reserve-assets.json',
    'lore': 'docs/lore-governance.md',
    'design': 'docs/standalone/campaign-design-v3.json',
    'tests': 'src/tests/pentagram-combat.test.ts',
    'savetests': 'src/tests/standalone-progression.test.ts',
    'uitests': 'src/tests/standalone-ui.test.tsx',
}
sources = [
    ('general', 'Combat_Games_Guide_General_v1.0.txt', 55172, '4844584616072ac0d52d37c2fab4365e1ec489240f17a721ee216e223b0355b7', '14o_RrgXucs8Km-x1LQJtMK7rol6mENKy', 0, 29),
    ('extension01', 'Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt', 60589, '330fb7485a7a52b2a20f855646c940aaac0fcd9510032bc84b2e17c518edd25f', '1rYxKLIbz67L1sstmJWsga76uK7cX2mXF', 30, 49),
    ('extension02', 'Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt', 47334, '08b57ea542e83c487fef3276997a612d4657f2ee9ed4f8e46b0bf65a2778038b', '1qr8hgvvjFqdWzcGaf1DPeKromk75bBn0', 50, 67),
]
manifest = []
source_texts = {}
section_index = {}
for key, filename, size, expected, drive_id, first, last in sources:
    data = (REF / filename).read_bytes()
    assert len(data) == size and sha256(data).hexdigest() == expected, filename
    text = data.decode('utf-8-sig')
    source_texts[key] = text
    manifest.append(dict(id=key, path=str((REF / filename).relative_to(REPO)), bytes=size, sha256=expected,
                         driveId=drive_id, url=f'https://drive.google.com/file/d/{drive_id}/view',
                         preservedVerbatim=True, sectionRange=[first, last], checkedDate=DATE))
    if key != 'general':
        for line_number, line in enumerate(text.splitlines(), 1):
            match = re.match(r'^(\d{2})\.\s+(.+)$', line)
            if match and first <= int(match[1]) <= last and match[2] == match[2].upper():
                section_index.setdefault(int(match[1]), dict(title=match[2], source=key, sourceLine=line_number))
assert sorted(section_index) == list(range(30, 68))

# Runtime states here describe the inspected baseline. An independently tested
# runtime delta is recorded separately, without rewriting the original audit.
requirements = []
def req(section, decision, runtime, priority, current, adaptation, remaining, criterion, evidence, general):
    item = section_index[section]
    requirements.append(dict(
        id=f'IV-EXT-{section:02}', section=section, title=item['title'], sourceId=item['source'],
        sourceLine=item['sourceLine'], decision=decision, priority=priority,
        documentationStatus='contextualisée', runtimeBaselineStatus=runtime,
        existingBehavior=current, projectDecision=adaptation, remainingWork=remaining,
        acceptanceCriterion=criterion, evidencePaths=[P[x] for x in evidence],
        generalGuideSections=general, fidelity='adaptation jouable / création AU explicitée',
        currentRuntimeTestClaim=False,
    ))

req(30,'retenue','documentaire','P0',
    'Le guide général est archivé à l’identique ; V4 associe ses 30 sections et dix fiches. Les extensions étaient absentes des références.',
    'Conserver les trois originaux et raccorder les 38 nouvelles sections à la bible actuelle, sans réécrire les constats V4.',
    'Maintenir les liens après chaque lot ; associer les preuves de code, d’image et de recette indépendamment.',
    '68 sections couvertes par V4 + cette annexe, trois empreintes exactes, aucun contenu absent déclaré jouable.',
    ['lore','design','roster'],[0,25,26,27,28])
req(31,'adaptée','partielle','P1',
    'La provocation existe : R/U et tactile, 1 000 ms, récupération 1 250 ms, +8 tension à l’engagement, refus si action verrouillée ou hitstop.',
    'Conserver ce taunt à effet de jeu. Ajouter des fiches personnelles, entrée/pose/sortie, interruption et variantes de rival ; un taunt décoratif futur ne donnera pas de gain implicite.',
    'Produire les gestes et voix propres aux incarnations. Vérifier punition, conservation du gain déjà accordé et retour de contrôle ; les banques historiques ne valent pas certification 1:1.',
    'Une commande acceptée donne une seule fois +8, reste exposée selon les règles, se termine ou est interrompue proprement ; pas de gain pendant pause/KO.',
    ['combat','animation','fight','tests'],[5,7,18,22])
req(32,'retenue','partielle','P1',
    'Le roster possède portraits, choix des deux côtés et garde-robe. Le cycle complet de sélection/désélection n’est pas implémenté.',
    'Séparer survol, aperçu, confirmation, attente, costume, annulation et départ. Pour Blitzø : aperçu arme basse, confirmation puis retour/rangement dédié, sans inventer de téléportation.',
    'Ajouter état de présentation, annulation des voix/VFX et sprites séparés. Changer le choix immédiatement, sans attendre l’animation sortante.',
    'Dix changements rapides puis confirmation ne laissent aucun acteur/son précédent ; clavier et mouvement réduit transmettent le même choix.',
    ['ui','roster','costumes','uitests'],[3,7,17,19])
req(33,'adaptée','non implémentée','P1',
    'Le moteur oppose actuellement un combattant par côté ; aucun profil d’équipe contrôlable.',
    'Prévoir un mode Duo hybride optionnel à deux membres : vie propre, un actif, une réserve, élimination des deux, entrée gratuite du survivant après KO. Le duel actuel garde ses règles.',
    'Définir état d’équipe, sélection des deux membres, ressources par membre et règles d’unicité des incarnations. Les entités natives n’occupent pas un slot de réserve.',
    'Un partenaire engagé ne peut être appelé deux fois ; un survivant entre même si la jauge commune est vide ; premier KO ne termine pas le mode Duo.',
    ['combat','roster','save','ui'],[4,5,12,16])
req(34,'retenue','partielle','P1',
    'Déplacement, garde, coups, signature et taunt disposent de commandes. La tension 0–100 est individuelle, sans jauge d’équipe.',
    'Actions distinctes ASSISTANCE, RELAIS, SUPER_DUO, FINISHER_EQUIPE, ORDRE_ENTITE. Prototyper jauge d’équipe séparée, coût atomique et horloge de simulation ; les chiffres de la fiche C sont des hypothèses.',
    'Remappage complet, manette, affichage d’état du partenaire et arbitrage des commandes simultanées à produire.',
    'Deux commandes dans le même pas ne dépensent jamais deux fois la dernière ressource ; un refus avant engagement ne prélève aucun coût.',
    ['combat','fight','ui'],[5,19,20,22])
req(35,'retenue','non implémentée','P1',
    'Des soutiens et ennemis existent comme dessins de réserve ; cela ne constitue pas une assistance active.',
    'Premier prototype : couverture ponctuelle de Moxxie pour Millie, action adaptée de son profil existant ; arrivée, tir lisible, sortie, récupération. Partenaire vulnérable avec dégâts portés à sa propre vie.',
    'Acteur secondaire, collision, synchronisation, sortie si actif KO et recette à deux cibles. Aucune promotion automatique des bases de réserve.',
    'Interruption ou KO pendant arrivée ferme le cycle ; un coup touchant deux corps ne double pas involontairement le gain de jauge.',
    ['combat','fight','reserve','roster'],[5,12,16,21])
req(36,'retenue','non implémentée','P1',
    'Le passage entre héros de campagne se fait entre chapitres ; il n’est pas un tag en combat.',
    'Relais volontaire en état neutre ; transfert des commandes à un instant de simulation défini. Combo, secours et relais scénarisé sont trois variantes séparées à développer ensuite.',
    'Maintenir vie, tension propre, récupérations et historique de combo du sortant. Prévoir retrait sûr d’un soutien déjà engagé et secours gratuit après KO.',
    'Les commandes après le point de transfert agissent uniquement sur l’entrant ; le switch ne recharge ni munitions, ni coût, ni limites de combo.',
    ['combat','fight','global','save'],[4,5,9,12])
req(37,'retenue','non implémentée','P1',
    'Signatures individuelles et concepts de techniques V3 existent, sans super duo.',
    'Prioriser Charlie/Vaggie et Moxxie/Millie. Une ouverture confirmée déclenche la chorégraphie ; garde ou raté utilisent une résolution courte. Les noms et enchaînements ci-dessous sont créations de jeu.',
    'Mise en scène à deux, positions de retour, variantes morphologiques et disponibilité des acteurs ; équilibrer les valeurs proposées.',
    'Réserver les deux membres et la jauge une seule fois ; scène passée ou complète aboutissent au même état autorisé.',
    ['combat','design','fight'],[5,6,7,10])
req(38,'adaptée','partielle','P1',
    'Le Dernier Acte individuel et les épilogues versionnés existent. Aucune finition collective ni condition dramatique complète.',
    'Nommer le système collectif « Dernier Acte — Duo » (nom original). Priorité : fin dramatique compatible, duo, individuel, victoire normale ; résultat acquis immuable.',
    'Conditions de version, duo, stage et dernière action, repli morphologique, codex de découverte. Un partenaire KO ne revient pas pour une scène ordinaire.',
    'Une scène incompatible retombe sur une conclusion valide ; aucun second résultat ni récompense supplémentaire après passage abrégé.',
    ['finishers','fight','collection','save'],[6,7,8,10])
req(39,'adaptée','non implémentée','P2',
    'Le moteur résout des attaques et un hitstop ; aucune règle de clash/QTE dédiée.',
    'Définir des groupes d’attaques compatibles par données. En duel standard, commencer par une séparation sans QTE ; QTE seulement dans un profil spectacle ou une scène solo annoncée.',
    'Détection de contact simultané, priorité indépendante du côté, gestion des tiers, égalité/absence d’entrée et limite de fréquence.',
    'Inverser gauche/droite conserve le résultat ; un projectile tiers au même instant est résolu selon la même priorité ; zéro réponse possède une issue bornée.',
    ['combat','fight','tests'],[4,12,18,22,23])
req(40,'adaptée','non implémentée','P1',
    'Les effets associés aux attaques ne sont pas des entités natives autonomes avec commandes et durée de vie.',
    'Premier candidat : dispositif d’atelier de Sir Pentious, capacité et forme à valider dans les sources de sa fiche ; mécanisme jouable original. Propriétaire stable, budget et ordre dédiés.',
    'Créer modèle d’entité, placement, armement, destruction et réactions au KO/réserve. Ne pas transformer tout effet visuel ou compagnon en IA.',
    'Une entité n’existe qu’une fois, répond à son propriétaire et ne change pas de propriétaire pendant un tag ; les limites restent identiques en mouvement réduit.',
    ['combat','design','fight'],[5,11,16,18])
req(41,'retenue','non implémentée','P1',
    'Les VFX de tirs sont rattachés au contact d’attaque ; un dessin de projectile ne simule pas son trajet.',
    'Créer un contrat commun pour projectile : propriétaire, trajectoire, collision, nombre d’impacts, expiration, réflexion et attribution. Les pièges partagent les plafonds de combo.',
    'Simulation persistante et interactions ; geler les horloges selon la règle de pause/cinématique et remettre à zéro en nouvelle manche.',
    'Tag, KO, réflexion puis fin de manche ne dupliquent ni impact ni gain ; retirer une particule décorative ne retire jamais une menace simulée.',
    ['combat','fight','reserve'],[5,16,18,23])
req(42,'retenue','non implémentée','P1',
    'Les routes et la campagne enchaînent des duels ; le mode Survie enchaîne des adversaires, sans horde multi-acteurs.',
    'Planifier dix familles de bonus, rattachées aux lieux existants et à une insertion AU après un chapitre. Échec d’un bonus facultatif permet de continuer.',
    'Objectifs non duel, foule bornée, objets destructibles, score/records, reprise et attribution unique. Les ennemis d’élite ne deviennent pas faibles par défaut.',
    'Réussite, échec, abandon et reprise conduisent au bon chapitre ; aucun doublon de récompense ; six ennemis tests restent lisibles avant extension du budget.',
    ['story','global','save','stages'],[8,9,11,12,15,20])
req(43,'adaptée','non implémentée','P1',
    'Les galeries et épilogues sont consultables ; aucun hub exploratoire de déblocage.',
    'Créer les « Archives de l’Entre-Acte », lieu AU de présentation : vestibule, dossiers de chroniques, casiers de costumes et salle des scènes. Carte 2D compatible avec la pile actuelle.',
    'Connexions logiques, clés ciblées, registre unique des récompenses, navigation et sauvegarde des ouvertures. Les Archives ne sont pas présentées comme un lieu officiel.',
    'Chaque zone est atteignable sans dépendre de sa propre récompense ; ouvrir deux fois un casier ne consomme pas deux fois une clé.',
    ['collection','save','stages','lore'],[15,19,24,25])
req(44,'retenue','partielle','P0',
    'La bible V3 contient rivaux, continuités, relations et sources ; les récits sont explicitement AU.',
    'Étendre les relations aux duos prioritaires et séparer affiliation attestée et chorégraphie inventée. Contrôler période, état de relation et présence dans le chapitre.',
    'Ajouter source primaire précise et comparaison pour chaque capacité collective avant production visuelle ; les paires libres restent exhibition AU.',
    'Aucun costume d’une autre période ni connaissance future implicite ; 43 combattants impliquent 903 paires sans ordre, sans promettre 903 scènes exclusives.',
    ['design','story','global','lore'],[2,3,7,8,9])
req(45,'retenue','partielle','P0',
    'Masters individuels et registres de production existent ; les nouveaux cycles d’équipe ne sont pas produits.',
    'Ajouter catégories taunt, menu, assist, relais, duo, entité, bonus et révélation. Chaque source autonome garde un sujet ; storyboard collectif séparé.',
    'Produire poses puis séquences à la phase animation. Référencer pivots, mains, arme, sol, morphologie et sortie ; ne pas transformer une pose en animation comptabilisée.',
    'Chaque asset possède source, statut et consommateur ; nombre de dessins, exports et cycles séparé ; aucune ligne « animé » sans séquence réelle.',
    ['reserve','animation','costumes','design'],[17,18,25])
req(46,'adaptée','partielle','P1',
    'Clavier, tactile, réduction de mouvement et entraînement existants ; pas de réseau/rollback/replays ni remappage complet.',
    'Étendre HUD et dojo au partenaire, jauge commune, entité et raisons d’indisponibilité. Les modalités réseau restent une phase distincte.',
    'Exercices assist/relais/entité ; réglages de QTE propres au mode ; lecture accessible et navigation manette à tester avant annonce.',
    'Même règle de simulation quel que soit le confort visuel ; une aide solo n’altère pas secrètement une règle PvP.',
    ['ui','fight','save','uitests'],[19,20,21,22,23])
req(47,'retenue','documentaire','P0',
    'Des tests et registres de lot existent. Les cas des extensions n’étaient pas reliés au projet.',
    'Ajouter les 18 scénarios E01 et les 22 E02 au suivi, sans déclarer qu’ils sont exécutés. Intégrer par prototype vertical puis étendre le contenu.',
    'Rattacher chaque preuve future à un commit et au cas couvert ; garder les cas bloqués visibles avec dépendance.',
    'Aucune réussite reprise d’un ancien lot pour un système nouveau ; chaque chiffre nomme son périmètre et son unité.',
    ['tests','savetests','uitests','reserve'],[25,26])
req(48,'retenue','documentaire','P0',
    'Les dix fiches A–J du guide général sont présentes depuis V4.',
    'Renseigner les dix nouvelles fiches E01 A–J avec personnages, version, règles, assets et recette d’Infernal Versus.',
    'Étendre ces fiches à chaque contenu futur ; les exemples ci-après constituent des briefs de production, pas des actions actives.',
    'Dix fiches complètes, IDs stables, état explicite et aucune référence à un personnage absent du registre.',
    ['design','roster','stages'],[27])
req(49,'retenue','documentaire','P0',
    'Le fichier E01 original est désormais conservé sans modification et relié à cette annexe.',
    'Appliquer ses instructions selon la phase sprites fixes : conception maintenant, cycles lors de la phase animation. Conserver les références externes comme sources d’inspiration du guide.',
    'Revérifier une référence externe avant d’en faire une dépendance technique ou une affirmation nouvelle ; aucune règle d’un autre jeu attribuée au lore.',
    'L’original est identique à Drive ; tous les écarts d’adaptation sont explicités dans la matrice.',
    ['lore','design'],[0,28,29])

req(50,'adaptée','non implémentée','P0',
    'Le roster, les costumes et les modes sont accessibles selon filtres ; les épilogues ont déjà une condition de complétion.',
    'Introduire un parcours optionnel de déblocage, désactivé par défaut pour conserver l’accès existant. Récompenser du contenu déjà intégré ; les bases inachevées restent en galerie de réserve.',
    'Relier les quatre catégories de sélection à un catalogue et un évaluateur commun. Documenter séparément la politique d’abonnement future.',
    'Un fichier manquant n’est jamais présenté comme un achat ou un succès requis ; désactiver le parcours conserve les acquis et préférences.',
    ['ui','roster','costumes','collection','reserve'],[3,12,19,24])
req(51,'retenue','partielle','P0',
    'Filtres de saison, disponibilité des histoires et épilogues acquis existent, sans modèle complet de droits.',
    'Séparer découverte, acquisition, installation et compatibilité. Le nouvel évaluateur local doit exposer les quatre axes ; droit externe futur reste hors du profil local.',
    'Rendre les états secret/indice/identifié, aucun/prêt/permanent/temporaire/inconnu/expiré et leurs messages. Le moteur courant ne prouve pas un abonnement.',
    'Un contenu acquis mais indisponible conserve son acquisition ; plusieurs obstacles montrent une prochaine action utile sans écraser les autres.',
    ['save','ui','collection'],[3,19,24])
req(52,'adaptée','non implémentée','P1',
    'Le thème sombre du standalone et ses portraits sont présents ; pas de charte de verrou dédiée.',
    'Métaphore UI originale : dossier d’exhibition scellé, silhouette noire, sceau circulaire et texte. Secret complet = emblème neutre, jamais silhouette reconnaissable.',
    'Focus, refus bref, ouverture sans flash, version mouvement réduit et texte accessible ; cette métaphore ne crée aucun contrat d’âme narratif.',
    'Le statut reste compréhensible sans couleur et sans son ; le texte aria ne divulgue pas un nom protégé.',
    ['ui','lore','uitests'],[2,19,22])
req(53,'adaptée','non implémentée','P1',
    'La sélection n’active que les 43 kits existants ; les réserves n’y figurent pas.',
    'Appliquer des règles optionnelles à Lucifer et Stolas déjà jouables ; expliquer la condition au focus et à la confirmation. Le dojo et les rôles scénarisés utilisent leur politique explicite.',
    'Filtrer aléatoire et lancement par contexte ; ne pas verrouiller des entités indispensables du moveset. Les futurs partenaires auront des accès de sélection distincts si nécessaire.',
    'Aucun personnage interdit ne démarre un duel libre ; un prêt narratif ne devient pas silencieusement une acquisition globale.',
    ['roster','ui','save','global'],[3,8,9,12,19])
req(54,'adaptée','partielle','P1',
    'Garde-robe persistée par côté/personnage ; familles de costumes intégrées et filtres de contenu existants.',
    'Premières récompenses : tenues Bodyguard de Blitzø et Moxxie, si leurs IDs intégrés sont validés. Aperçu et droit d’équiper distincts ; préférence sauvegardée même en cas de repli.',
    'Présenter condition, silhouette ou aperçu autorisé ; préserver acquisition si personnage indisponible ; aucun bonus de statistiques lié à une tenue.',
    'Costume acquis avant le personnage conservé ; changement de filtre ou droits ne corrompt pas la garde-robe ni les propriétés des coups.',
    ['costumes','ui','save'],[3,17,19,22,24])
req(55,'adaptée','partielle','P1',
    '51 arènes dans le registre local V14, variantes de présentation et filtrage saison 3. Pas de droit de collection sur les stages.',
    'Parcours optionnel sur Portes célestes et Cour des Goetia ; versions vivante/statique/réduite partagent le même accès. L’accès de participation est distinct de celui de sélection.',
    'Préparer évaluateur, repli avant match et destinations liées futures. Habillage abonné éventuel = création AU clairement séparée des arènes canoniques.',
    'Une option de confort ne se monétise pas ; une partie valide ne change pas d’arène à mi-combat lors d’un changement de droit.',
    ['stages','ui','save'],[13,14,15,19])
req(56,'adaptée','non implémentée','P1',
    'Neuf modes jouables accessibles ; Boss Rush déjà implémenté comme parcours de duels.',
    'Parcours optionnel : Boss Rush après une Arcade complète. Maintenir dojo, options, accessibilité et voies d’acquisition nécessaires.',
    'Tuile focusable et condition détaillée ; reprise d’un parcours déjà commencé ; variantes avancées futures documentées individuellement.',
    'Aucun cycle Boss Rush → récompense → Boss Rush ; mode verrouillé n’empêche ni quitter, ni s’entraîner, ni reprendre une partie autorisée.',
    ['save','ui'],[12,19,20,24])
req(57,'retenue','partielle','P0',
    'Stats, résultats dédupliqués, complétions de routes versionnées et Arcade complète déjà sauvegardés.',
    'Utiliser les faits persistés pour sept récompenses locales. Écrire exactement les ET/OU ; attribuer rétroactivement seulement ce que les données présentes prouvent.',
    'ID stable de règle et contenu, compteur visible, acquisition idempotente. Pour des récompenses futures de coffre/bonus, ajouter les événements avant de promettre la rétroactivité.',
    'Une chronique V1 n’équivaut pas à une V3 ; une même victoire rejouée ne progresse pas deux fois ; voie A OU B ne devient jamais A ET B.',
    ['save','savetests','story'],[8,9,20,24,25])
req(58,'retenue','partielle','P1',
    'Les épilogues s’ouvrent après leurs routes ; aucune exploration ni coffre.',
    'Le même ID de récompense peut être accordé automatiquement par succès ou via un futur casier des Archives. Sauvegarder avant présentation ; passage abrégé conserve l’acquisition.',
    'Créer objets de révélation, transaction de coût et casier déjà ouvert. Les succès automatiques n’affichent pas un faux état « À réclamer ».',
    'Fermer l’application pendant l’ouverture puis recharger donne une seule récompense ; aucune deuxième facturation sur casier déjà traité.',
    ['collection','save','ui'],[10,15,19,24])
req(59,'retenue comme conception','non implémentée','P2',
    'Aucun catalogue abonné, paiement, compte lié ou avantage confirmé dans ce lot.',
    'Prévoir uniquement des cosmétiques/ambiances de soutien dans le premier catalogue envisagé, sans modifier dégâts ni accès de confort. Trois modèles : acquisition permanente, accès temporaire, lot par période.',
    'Choisir catalogue, conditions, autorisations des assets et texte d’offre avant lancement ; aucun niveau, prix, échéance ni avantage actif inventé.',
    'La fiche annonce modèle, durée et alternatives ; un permanent reste permanent après fin ordinaire d’abonnement.',
    ['costumes','stages','save','lore'],[3,12,19,22,24])
req(60,'différée avec contrat','non implémentée','P2',
    'Le standalone est local ; aucun backend d’identité ou adaptateur Patreon.',
    'Prévoir une liaison volontaire via un service de confiance, droits autoritatifs et secrets hors client. Le guide conserve ses références officielles ; elles devront être revérifiées lors de l’implémentation.',
    'Serveur, compte de jeu, configuration du fournisseur, vérification d’événements, réconciliation et recette. Un booléen local ne peut représenter un droit commercial.',
    'Doublons et désordre des événements ne créent pas de droits ; une panne reste « vérification indisponible », jamais « abonnement expiré » sans preuve.',
    ['save','ui'],[19,23,24])
req(61,'retenue comme conception','non implémentée','P2',
    'Les sauvegardes locales ne contiennent pas de droits temporaires ni de justificatifs externes.',
    'Séparer les sources d’accès. À expiration confirmée, retirer seulement la source temporaire ; conserver acquisitions permanentes et progression. Geler la configuration du match jusqu’au résultat.',
    'Fixer durée de justificatif et tolérance seulement après contrat fournisseur. Définir remboursement, baisse de niveau et déliaison sans prétendre un automatisme universel.',
    'Permanent OU temporaire reste utilisable après expiration du temporaire ; panne, annulation et expiration donnent des états différents.',
    ['save','ui','fight'],[19,23,24])
req(62,'adaptée','partielle','P0',
    'Le duel local, le dojo et les parcours fonctionnent ; pas de réseau ni replays.',
    'Préciser aperçu/sélection/participation/entraînement. Profil local partagé pour les récompenses locales ; dojo libre et prêts scénarisés explicites. Les parties déjà engagées gardent leur configuration.',
    'Contrôler entrée dans le match et restauration des équipes futures. Réseau et replays suivent une phase dédiée, sans annoncer leur disponibilité.',
    'Un prêt narratif ne permet pas sélection libre après la scène ; un stage choisi légalement est jouable par l’adversaire sans acquisition globale.',
    ['ui','save','fight','global'],[12,19,20,23,24])
req(63,'retenue','partielle','P0',
    'Labels, filtres de saison et options de mouvement existent, sans états détaillés de verrou.',
    'Texte court + sceau + condition détaillée. Masquer nom, portrait, voix et texte accessible selon découverte ; distinguer acquisition, installation et restriction de mode.',
    'Tester focus et lecteur d’écran sur les nouveaux contrôles ; expliquer alternatives sans redirection automatique vers un service externe.',
    'L’ARIA respecte le secret ; chaque refus propose une action utile ; un obstacle n’est pas signalé par la couleur seule.',
    ['ui','collection','uitests'],[2,19,22])
req(64,'retenue','partielle','P0',
    'Résultats dédupliqués, import strict et progression versionnée existent ; pas de registre multiorigine complet des droits.',
    'Séparer catalogue, acquisitions et disponibilité ; migrer sans perte. Les 22 cas source sont importés dans le suivi avec statuts non exécutés tant que les preuves manquent.',
    'Ajouter métriques des règles d’accès indépendantes des bases/sprites ; couvrir interruptions, doublons, sources multiples et sauvegarde corrompue.',
    'Une règle validée ne fait pas compter son contenu comme produit ; reprise et migration ne perdent ni anciens résultats ni garde-robe.',
    ['save','savetests','reserve'],[24,25,26])
req(65,'retenue','documentaire','P0',
    'Les six fiches E02 sont présentes uniquement dans le guide source nouvellement importé.',
    'Remplir A–F pour le profil local optionnel et un futur avantage de soutien, en identifiant explicitement ce dernier comme non activé.',
    'Étendre à chaque contenu et modèle d’acquisition retenu ; ajouter les preuves après intégration.',
    'Six fiches liées à leurs IDs, aucune offre fictive annoncée comme active et critères vérifiables.',
    ['roster','costumes','stages','save'],[27])
req(66,'retenue','documentaire','P0',
    'E02 est maintenant archivée et reliée aux sections 00–49.',
    'Appliquer d’abord la collection locale sur des contenus déjà intégrés ; conserver la conception abonnés comme chantier explicite. Aucun verrou de production utilisé pour un kit absent.',
    'Actualiser cette annexe au rythme des implémentations ; préserver origine des fichiers et statut de chaque mécanisme.',
    'La livraison distingue documentation complète, fonctions locales testées et service externe absent.',
    ['lore','save','reserve'],[0,25,28])
req(67,'retenue','documentaire','P0',
    'Les quatre références officielles et le vocabulaire sont conservés dans E02 sans modification.',
    'Utiliser cette source comme référence documentaire, puis reconsulter la documentation officielle au moment de construire l’adaptateur. Cette livraison ne reconfirme pas les API et règles commerciales externes.',
    'Journaliser date et version lors d’une future intégration ; distinguer recommandé par le guide et exigé par le fournisseur.',
    'Aucune règle externe sensible présentée comme validée par une simple copie du texte.',
    ['lore','save'],[2,29])

assert [x['section'] for x in requirements] == list(range(30,68))

def card(id, title, fields):
    return dict(id=id, title=title, status='brief contextualisé ; production et recette dédiées restantes', fields=fields)

cards = [
card('IV-E01-A','Taunt de Blitzø — Contrat en attente',{
    'Sujet / incarnation':'hb_blitzo, tenue habituelle de la période admise par le filtre ; nom du taunt original AU.',
    'Source et fidélité':'Profil, arme et incarnation déjà enregistrés dans roster/campaign-design-v3 ; geste à comparer à une référence primaire avant dessin. Pas une réplique officielle.',
    'Commande et contexte':'TAUNT, R/U/tactile existants ; seulement état autorisé du combat. Variante rivale non imposée.',
    'Entrée / pose / sortie':'Proposition : 200 ms de préparation, 550 ms de défi arme basse, 250 ms de retour, total 1 000 ms actuel. Découpage à valider ; pas de tir gratuit.',
    'Effet et exposition':'Conserver +8 tension à l’engagement et récupération 1 250 ms ; pas de garde pendant le taunt. Interruption par un coup selon moteur ; aucun remboursement du gain déjà inscrit.',
    'Son / VFX':'Un geste lisible, aucun flash obligatoire ; voix originale future facultative, pas de paroles d’épisode copiées. Intervalle anti-répétition à fixer après essai.',
    'Production':'Sprites entrée, pose et sortie individuels à produire lors de la phase animation ; banque historique présente, fidélité de ce geste non certifiée.',
    'Recette':'Commande double, hitstop, pause, interruption, KO et reprise ; gain unique et contrôle récupéré. Test existant de pose lu, non réexécuté par cette annexe.',
}),
card('IV-E01-B','Sélection et désélection de Charlie',{
    'Sujet / version':'charlie, incarnation du registre courant et costume compatible avec le filtre.',
    'Survol / aperçu':'Portrait stable ; apparition de la pose entière sans jouer une voix à chaque déplacement du curseur.',
    'Confirmation / attente':'Geste d’accueil original et pose de confiance ; attente courte facultative. La sélection est enregistrée immédiatement.',
    'Désélection':'Sortie dédiée où le geste se referme et Charlie reprend sa pose ; sortie abrégée en navigation rapide, jamais simple lecture inverse imposée.',
    'Costume / équipe':'Annuler l’aperçu précédent, valider les ancrages de la tenue ; validation de duo seulement lorsque le profil équipe existera.',
    'Nettoyage':'Un propriétaire de présentation par côté ; arrêter voix, particules et compagnon de l’ancien aperçu. Une promesse de chargement périmée ne remplace pas le nouveau choix.',
    'Confort / contrôle':'Mouvement réduit = pose fixe et annonce de confirmation ; deux choix simultanés, miroir et retour arrière sans blocage.',
    'Assets / recette':'Cycle non produit ; tester dix changements rapides, sélection des deux côtés, filtre et rechargement des images. Le portrait existant est un réemploi, pas une nouvelle animation.',
}),
card('IV-E01-C','Profil Duo hybride — hypothèse de prototype',{
    'Mode et composition':'Nouveau mode Duo optionnel, deux membres jouables par côté ; un actif, une réserve. Pas de même identité dans les deux slots d’une équipe au prototype.',
    'Vie et défaite':'100 PV par membre comme base de réglage, défaite après KO des deux. Pas de régénération passive de réserve dans le premier prototype.',
    'Jauges':'Tension propre conservée ; jauge d’équipe proposée 0–100, départ 50. Aucun gain passif au premier prototype, gains de combat plafonnés par séquence à déterminer.',
    'Coûts proposés':'Assistance 25, relais volontaire 20, relais de combo 40, super duo 100 ; chiffres de conception non testés, non présents dans le duel courant.',
    'Récupérations':'Hypothèse assistance 8 s après sortie, relais 3 s après transfert. Pause, cinématique et hitstop figent la même horloge d’équipe.',
    'KO / secours':'Entrée du survivant sans coût ; aucun relais de secours défensif implicite. Un partenaire engagé dans une action collective est indisponible.',
    'Entités et HUD':'Un soutien temporaire par côté ; budget d’entité distinct. Afficher actif, vie de réserve, jauge commune et motif de refus.',
    'Recette':'Deux commandes en même pas, dernier membre KO, jauge vide, assistance en sortie ; symétrie gauche/droite, historique de combo partagé.',
}),
card('IV-E01-D','Assistance de Moxxie pour Millie',{
    'Identité':'IV-ASSIST-MOX-COVER ; actif hb_millie, réserve hb_moxxie ; période et costume cohérents.',
    'Statut':'Couverture de tir proposée depuis son profil existant ; action combinée originale, pas reproduction certifiée d’un épisode.',
    'Conditions et coût':'Actif neutre, réserve disponible et vivante, jauge commune >=25 ; prélèvement atomique à appel accepté, aucune dépense si refus.',
    'Arrivée / action / sortie':'Apparition latérale annoncée, tir unique adapté, retrait. Durées de prototype 300/200/400 ms à éprouver ; récupération 8 s proposée après sortie.',
    'Vulnérabilité':'Pas d’invulnérabilité automatique. Dégâts subis affectent la réserve ; interrompre le tir avant engagement le supprime, impact engagé suit priorité commune.',
    'Touche / garde / échec':'Touche contribue au combo de l’équipe, garde donne la résolution du coup, raté n’accorde pas un tir de remplacement. Ne double pas la jauge en touchant actif et soutien.',
    'Transitions et KO':'Fermer l’intervention à fin de manche ; si actif KO, résoudre impacts simultanés puis entrée du survivant si encore valide. Aucun acteur dupliqué.',
    'Production / recette':'Sprites et acteur de support manquants ; entrée près du mur, KO à arrivée, pause et appel concurrent avec relais à tester.',
}),
card('IV-E01-E','Dernier Acte — Duo : Double sortie',{
    'Type et nom':'Finisher d’équipe original AU ; Double sortie est un nom de travail, pas une expression canonique.',
    'Participants':'Moxxie et Millie, vivants, disponibles, versions compatibles ; le joueur choisit le meneur déjà actif.',
    'Condition':'KO décisif acquis, fenêtre de Dernier Acte valide, arène compatible et cible dont les ancrages sont pris en charge ; aucune résurrection de réserve KO.',
    'Commande / coût':'FINISHER_EQUIPE ; pas de coût supplémentaire proposé après KO, disponibilité exigée. Les conditions finales seront alignées au système individuel.',
    'Déroulement':'Moxxie couvre la sortie, Millie exécute le geste conclusif chorégraphié, duo reprend sa pose ; aucune conclusion canonique imposée au récit.',
    'Caméra et morphologies':'Storyboard court, cible humanoïde au prototype ; repli individuel pour boss/morphologie incompatible. Découpage exact, voix et VFX restent à produire.',
    'Priorité et retour':'Fin dramatique spécifique compatible > duo > individuel > victoire. Conserver vainqueur, score et récompense ; passage abrégé aboutit au même écran.',
    'Recette':'Partenaire KO/engagé, mauvais costume, mauvais lieu, cible géante, double confirmation et passage abrégé sans double résultat.',
}),
card('IV-E01-F','Clash d’armes — prototype sans QTE par défaut',{
    'Groupe':'IV-CLASH-MELEE-01 : paire d’attaques explicitement inscrites après audit des armes et de leurs phases actives ; aucune activation par deux touches visuellement proches.',
    'Source / statut':'Mécanisme original inspiré des références E01 §39 ; aucun événement Hazbin/Helluva certifié.',
    'Éligibilité':'Contact des zones actives et orientation compatibles dans le même pas ; fenêtre proposée <=50 ms et une occurrence par engagement, à mesurer.',
    'Priorité':'Résoudre ensemble les contacts de ce pas, y compris projectile tiers, avant choix de clash ; aucun avantage lié à ordre des joueurs.',
    'Duel standard':'Séparation courte, pas de QTE, pas de dégâts supplémentaires de présentation ; positions bornées.',
    'Profil spectacle futur':'QTE d’un appui, fenêtre proposée 600 ms ; réussite unique avantage borné, double réussite/échec ou absence = séparation. Maintien alternatif en solo, pas avantage caché en PvP.',
    'État global':'Geler chrono, récupérations et entités de façon commune pendant séquence ; reprise synchronisée. Aucune preuve réseau dans ce lot.',
    'Recette':'Miroir, hit tiers, égalité, zéro entrée, pause, temps maximal et deux collisions du même multi-hit.',
}),
card('IV-E01-G','Dispositif placé de Sir Pentious',{
    'Sujet':'IV-ENTITY-PENTIOUS-WORKSHOP-01, propriétaire sirpentious ; forme et capacité à confirmer dans ses sources de conception V3.',
    'Fidélité':'Objet d’atelier adapté au kit ; aucun modèle inventé présenté comme machine officielle. Prototype de données avant image définitive.',
    'Création et contrôle':'Commande POSE puis ORDRE_ENTITE ; un seul dispositif par propriétaire au prototype. Seconde pose refusée tant que premier actif ; coût propre à régler.',
    'États':'Disponible, déploiement, armé, action, récupération, détruit/expiré. Position dans la piste et hors corps adverse ; signal d’armement lisible.',
    'Simultanéité':'Propriétaire peut se déplacer quand armé ; action de déploiement l’expose. Attaque adverse peut neutraliser selon points de vie à fixer.',
    'Propriété et durée':'OwnerId stable ; tir et gain attribués au propriétaire. Au tag : désactivation du prototype ; KO et fin de manche : suppression après résolution des impacts déjà engagés.',
    'Rappel / transition':'Rappel ne rembourse pas gratuitement le coût. Transition, super ou clash appliquent une règle explicite commune ; pas de persistance accidentelle.',
    'Recette et assets':'Sprite autonome et cycle non produits ; budget, deux ordres simultanés, destruction, KO et attribution de projectile à tester.',
}),
card('IV-E01-H','Bonus — Livraison à démonter',{
    'Identité / lieu':'IV-BONUS-IMP-01 ; imp-exterior, séquence originale d’entraînement I.M.P. hors événement canonique.',
    'Insertion':'Bonus facultatif entre deux duels d’une chronique I.M.P. après adaptation explicite de sa version ; ne pas réécrire silencieusement V3.',
    'Objectif':'Démonter une carcasse d’entraînement, trois zones destructibles ; temps proposé 45 s. Aucun civil dans la zone de destruction.',
    'Personnages':'Blitzø, Moxxie ou Millie ; toutes les zones accessibles en corps-à-corps et à distance, munitions gérées sans impasse.',
    'Score / état':'Vie et ressources du bonus séparées ; rang selon zones/durée. Récompense permanente identifiée par ID, attribution unique ; record améliorable sans récompense répétée.',
    'Réussite / échec':'Réussite ouvre une fiche cosmétique/archives à définir ; échec laisse poursuivre avec bilan. Aucun résultat de duel gagné artificiellement.',
    'Reprise':'Sauvegarder entrée et résultat, jamais une récompense seulement dans l’animation ; possibilité de réessayer depuis les bonus une fois débloqué.',
    'Production / recette':'Carcasse intacte/abîmée/détruite, signaux et HUD restent à produire ; hit multiple même zone, abandon, timeout et reprise à tester.',
}),
card('IV-E01-I','Archives de l’Entre-Acte',{
    'Identité':'IV-ARCHIVES-01 ; lieu original AU d’interface et d’exploration, non répertorié comme lieu canonique.',
    'Format':'Carte 2D à salles reliées : vestibule → chroniques → scènes ; vestibule → garde-robe ; garde-robe → défis. Portes placées sur limites lisibles.',
    'Avatar / navigation':'Curseur d’exploration ou protagoniste de présentation sans capacités nécessaires à toutes les portes ; clavier/tactile d’abord.',
    'Objets et conditions':'Clés de collection ciblées provenant de faits sauvegardés ; chaque coffre référence un ID unique du catalogue.',
    'Récompenses':'Costumes, illustrations, présentations et scènes. Les partenaires/jouables futurs demandent kit complet avant activation.',
    'Anti-impasse':'Aucune clé derrière la porte qu’elle ouvre ; parcours minimal gratuit et distinct du catalogue soutien futur.',
    'Sauvegarde / doublons':'Version de carte, salles découvertes et coffres ouverts ; créditer avant scène, relecture sans nouveau coût.',
    'Production / recette':'Concept et connexions documentés, aucune salle produite ici ; atteignabilité, retour arrière, fermeture pendant révélation et accessibilité à tester.',
}),
card('IV-E01-J','Récompense d’une chronique versionnée',{
    'Identité':'IV-REWARD-STORY-CHARLIE-V3, concept de règle relié à charlie et version 3.',
    'Condition':'storyCompletions contient {fighterId: charlie, routeVersion: 3}. La fiche runtime de Lucifer peut proposer cette condition OU dix victoires ; ce OU doit rester visible.',
    'Événement':'Validation idempotente du résultat final de route ; aucune victoire V1 ne se transforme implicitement en V3.',
    'Contenu':'Acquisition permanente locale et éventuelle révélation du dossier associé ; aucun fait narratif d’allégeance ajouté.',
    'Indice / affichage':'« Terminer la chronique actuelle de Charlie » ; si filtre cache les saisons nécessaires, expliquer filtre sans afficher l’épilogue.',
    'Doublons':'Relire une fin ou réimporter le même historique ne crée pas une seconde récompense ; identité de règle stable.',
    'Migration':'Rétroactivité admise seulement sur complétions V3 sauvegardées ou compteur de victoires existant ; pas sur un événement non enregistré.',
    'Recette':'V1 seule, V3, voie alternative, victoire dupliquée, interruption au résultat et restauration ; états attendus explicites.',
}),
card('IV-E02-A','Slot de Lucifer — parcours optionnel',{
    'Identité / catégorie':'lucifer ; combattant déjà jouable. Le système concerne son droit de sélection dans le parcours optionnel, pas son état de production.',
    'Univers / sources':'Hazbin Hotel, incarnation du roster ; sources existantes V3, adaptation UI originale.',
    'Découverte':'Choix proposé : identifié sous silhouette noire, nom visible si filtre le permet ; un futur personnage secret utiliserait un emblème neutre.',
    'Visuel / texte':'Dossier scellé, contour contrasté, sceau et « À débloquer ». Condition courte lisible au focus et détail sans effet d’erreur répétitif.',
    'Condition':'Chronique Charlie V3 terminée OU dix victoires admissibles du profil local ; chiffres de réglage du parcours, pas du lore.',
    'Dépendances':'Kit et portrait déjà inscrits. Si ressource indisponible, afficher disponibilité technique ; un verrou ne remplace pas un asset manquant.',
    'Contexte':'Dojo libre ; chapitre imposé = prêt narratif. Parcours désactivé par défaut : accès historique conservé.',
    'Animation / recette':'Ouverture simple et variante réduite ; aucun nouveau cycle personnage déclaré. Tester sélection, lancement, focus, ancien profil et prêt.',
}),
card('IV-E02-B','Règle locale — chronique OU victoires',{
    'ID de conception':'IV-UNLOCK-LUCIFER-01 ; règle technique pact-lucifer-v1, contenu lucifer, dans src/standalone/content-access.ts.',
    'Expression':'OR(storyCompletion(charlie,3), wins>=10). Aucun abonnement requis ; pas de transformation du OU en ET.',
    'Événements / compteurs':'Complétions versionnées et stats.wins persistés ; les résultats du dojo ne participent pas.',
    'Périmètre':'Profil de sauvegarde standalone, isolé du manager ; progression locale, non preuve commerciale.',
    'Attribution':'Automatique, permanente, sans monnaie ni action de réclamation ; réévaluation idempotente sur les faits conservés.',
    'Rétroactivité':'Oui pour les événements déjà prouvés par la sauvegarde. Pas de reconstruction de parties disparues.',
    'Interface':'Présenter les deux alternatives et le compteur utile ; le filtre narratif peut masquer les détails de la chronique sans annuler les acquis.',
    'Recette':'0/9/10 victoires, V1/V3, deux voies simultanées, doublon et sauvegarde importée ; conserver accès et garde-robe après rechargement.',
}),
card('IV-E02-C','Avantage de soutien — cahier des charges non activé',{
    'Identité / état':'IV-SUPPORT-COSMETIC-PROPOSAL-01, version de conception 1 ; aucune offre ni avantage réel actif.',
    'Fournisseur / admissibilité':'Patreon ou équivalent envisagé. Campagne et niveaux non configurés ; ne pas inventer leurs IDs, prix, dates ou justificatifs.',
    'Contenus':'Habillage de cadre/ambiance original AU, sélection finale à faire après vérification de l’autorisation d’usage des assets ; aucun bonus de combat.',
    'Modèle proposé':'Récompense permanente par lot explicitement annoncé ; catalogue temporaire possible seulement avec fiche séparée. Pas d’inclusion présumée de lots historiques.',
    'Déclencheur':'Événement confirmé par service autoritatif et règles d’avantage versionnées ; compte lié seul, email identique ou capture insuffisants.',
    'Expiration / retrait':'Fin ordinaire du soutien ne retire pas un lot permanent. Remboursement et retrait affectent seulement la source concernée selon politique définie avant lancement.',
    'Hors ligne / déliaison':'Justificatif et tolérance à établir lors du backend ; aucune durée inventée. Déliaison, annulation et suppression du compte sont distinctes.',
    'Avant activation':'Choisir offre, règles essais/cadeaux/gratuit/transfert, autorisations, compte cible, consentement, backend, textes et recette. Aucun bouton d’achat opérationnel livré.',
}),
card('IV-E02-D','Charte — dossiers scellés d’exhibition',{
    'Univers / statut':'Interface originale compatible avec la direction scénique du standalone ; pas un contrat d’âme canonique ni une magie ajoutée au récit.',
    'Personnage / costume':'Silhouette noire contrastée pour identité connue, emblème neutre pour secret ; tenue parent toujours consultable.',
    'Stage / mode':'Miniature masquée et dossier fermé ; pictogramme de mode accompagné d’une condition écrite.',
    'États':'Non révélé, À débloquer, Acquis, Installation nécessaire, Indisponible dans ce mode ; futur temporaire/inconnu/expiré ont des libellés distincts.',
    'Actions':'Focus visible, explication au clic, ouverture brève après attribution ; aucun flash obligatoire ni dialogue d’erreur en boucle.',
    'Accessibilité':'Icône + forme + texte, nom accessible filtré, tailles mobiles et clavier ; mouvement réduit transmet même état via transition simple.',
    'Confidentialité narrative':'Ne pas charger une voix de personnage secret au survol ; noms, alt, aria, infobulles et miniature suivent découverte.',
    'Recette':'Fond clair/sombre, zoom, petit écran, lecteur d’écran, interaction répétée et suppression d’animations ; revue visuelle après code.',
}),
card('IV-E02-E','Accès à un stage spécial',{
    'Premier cas local':'hh-heaven-gates, arène intégrée ; condition de parcours optionnel à relier au module. Pas d’achat actif.',
    'Sélection / participation':'Le profil doit posséder le droit de sélection dans le parcours. L’adversaire participe au match autorisé sans gagner ce droit.',
    'Installation et versions':'Vérifier les plans requis avant match ; si ressource introuvable, message technique et repli annoncé, pas faux verrou financier.',
    'Confort':'Vivante, statique et réduite suivent le même accès et la même géométrie.',
    'Dojo / narration':'Dojo libre ; destination imposée de chapitre utilise prêt explicite. Une acquisition ne change pas la chronologie du récit.',
    'Abonné futur':'Une ambiance de soutien serait un habillage original distinct. Distribution des assets et politique compétition doivent être définies avant réseau.',
    'Expiration / replay':'Une configuration de match autorisée est conservée jusqu’au résultat. Replays/réseau non livrés, aucune garantie de lecture distante.',
    'Recette':'Profil acquis/non acquis, invité local, dojo, chapitre, ressource absente et changement de droit entre deux parties.',
}),
card('IV-E02-F','Matrice de validation d’accès',{
    'Profil test':'Sauvegarde standalone sans victoire puis seuil atteint ; isoler chaque scénario sans modifier le manager.',
    'Local permanent':'Pas de droit → explication ; règle satisfaite → sélection ; deux règles satisfaites → une acquisition ; rechargement → acquis conservé.',
    'Dépendances':'Costume acquis avant personnage = droit conservé et contexte expliqué ; fichier absent = état technique.',
    'Temporaire futur':'Permanent valide OU temporaire expiré = acquis ; temporaire seul expiré = accès terminé ; service en panne = état inconnu, pas expiration.',
    'Modes':'Dojo et prêt scénarisé autorisés selon politique ; sélection libre refusée si verrouillée ; parcours commencé reprenable.',
    'Sauvegarde':'Ancien profil, import/export, résultat dupliqué et interruption pendant révélation : acquisitions et préférences sans perte.',
    'Interface':'Focus atteignable, condition complète, texte anti-spoiler, alternatives et repli annoncé.',
    'État de recette':'La présente fiche spécifie les attentes. Résultats réels dans runtime-integration.json et rapports associés lorsqu’ils existent ; pas de validation automatique par la rédaction.',
}),
]

duos = [
    ('IV-DUO-CHARLIE-VAGGIE',['charlie','vaggie'],'P1','S1, incarnation cohérente avec route','Appui commun / couverture de terrain','Le lien des personnages s’appuie sur les sources V3 ; chorégraphie et nom restent originaux.','hh-i-cast'),
    ('IV-DUO-MOXXIE-MILLIE',['hb_moxxie','hb_millie'],'P1','Helluva, même période','Couverture de tir / approche de mêlée','Respecter équipement et connaissances de chaque incarnation ; aucune arme nouvelle implicite.','project-profile'),
    ('IV-DUO-BLITZO-MOXXIE',['hb_blitzo','hb_moxxie'],'P1','Mission I.M.P. AU','Tirs alternés et retrait coordonné','Action de mission créée pour le jeu ; pas de téléportation native attribuée à un imp.','project-profile'),
    ('IV-DUO-BLITZO-MILLIE',['hb_blitzo','hb_millie'],'P1','Mission I.M.P. AU','Ouverture à distance / finition de mêlée','Le timing, les dégâts et le nom ne sont pas canoniques.','project-profile'),
    ('IV-DUO-HUSK-ANGEL',['husk','angeldust'],'P1','S1 après la relation admise par la route','Couverture mutuelle et sortie de scène','Le lien de soutien est référencé ; aucune romance ou guérison inventée présentée comme attestée.','hh-i-husk-angel'),
    ('IV-DUO-CARMILLA-VAGGIE',['carmilla','vaggie'],'P1','S1, contexte d’entraînement cohérent','Exercice de garde et contre','Inspiration de transmission, pas scène nouvelle présentée comme extrait d’épisode.','hh-i-carmilla'),
    ('IV-DUO-FIZZ-ASMODEUS',['hb_fizzarolli','hb_asmodeus'],'P2','Versions compatibles définies par leurs fiches','Relais de scène avec contribution distincte','Ne pas extrapoler les capacités scéniques en pouvoir non attesté ; audit primaire avant dessin.','project-profile'),
    ('IV-DUO-GLITZ-GLAM',['hb_glitz','hb_glam'],'P2','S2, incarnation de concours','Présentation synchronisée et relais','La pose commune et les variantes sont à produire ; ne pas fusionner les deux identités en un sprite autonome.','project-profile'),
]
duo_rows = [dict(id=x[0],members=x[1],priority=x[2],continuity=x[3],concept=x[4],guardrail=x[5],sourceAnchor=x[6],status='conception ; aucune chorégraphie exclusive produite',evidencePaths=[P['design'],P['roster']]) for x in duos]
bonuses = [
    ('destruction','Livraison à démonter','imp-exterior','hb_blitzo,hb_moxxie,hb_millie','Trois zones destructibles, 45 s proposées','Facultatif ; progression suivante même en échec'),
    ('horde','Exercice de défense de l’hôtel','hotel-exterior','charlie,vaggie','Cibles de simulation AU, plafond proposé six simultanées','Ne pas transformer un exorciste canonique en ennemi fragile sans justification'),
    ('precision','Dossiers de tir I.M.P.','imp-reception','hb_moxxie,hb_blitzo','Cibles inertes distinctes des personnes','Version mêlée équivalente pour personnages sans tir'),
    ('defense','Leçon de contre','carmine-industries','vaggie,carmilla','Assauts annoncés et fenêtres lisibles','Séquence d’entraînement AU, pas ajout d’un épisode'),
    ('mobility','Sortie d’exercice','hellaverse-training','all-tested-kits','Atteindre une issue sans pouvoir de vol obligatoire','Le moteur de mobilité doit être étendu avant validation'),
    ('protection','Dossiers à protéger','hotel-lobby','charlie,vaggie','Défendre un objet de simulation pendant une durée bornée','Pas de victime civile imposée ; objectif non duel explicite'),
    ('interaction','Couper le signal d’exercice','dhorks','hb_blitzo,hb_moxxie','Interrupteurs de jeu et cibles mécaniques','Sabotage fictif dans la simulation, aucune expertise informatique canonique inventée'),
    ('entity','Atelier de déploiement','pentious-workshop','sirpentious','Positionner une entité et activer une cible déportée','Bloqué par système d’entité et référence visuelle à valider'),
    ('team','Couverture et relais','hellaverse-training','hb_moxxie+hb_millie','Deux cibles exigeant contribution des deux membres','Bloqué par mode Duo ; pas proposé dans la campagne courante avant versionnement'),
    ('personality','Répétition de spectacle','ozzies-cabaret','hb_fizzarolli','Épreuve courte de précision scénique adaptée aux commandes','Original compatible ; pas de paroles ou numéro officiel copiés'),
]
bonus_rows = [dict(id=f'IV-BONUS-{i+1:02}',family=x[0],name=x[1],stageId=x[2],fighters=x[3].split(','),objective=x[4],restriction=x[5],status='conception ; objectif, assets et intégration manquants',rewardPolicy='ID unique, attribution permanente locale après résultat validé, pas de doublon',continuity='séquence originale AU') for i,x in enumerate(bonuses)]

def source_cases(key, start, end, prefix):
    text = source_texts[key]
    start_at = text.index(start)
    body = text[start_at:text.index(end,start_at)]
    found = re.findall(r'^\s*(\d+)\.\s+(.+)$',body,re.M)
    return [dict(id=f'{prefix}-{int(number):02}',sourceId=key,description=content,status='à tester',proof=None,
                 projectScope='profil équipe/entités/bonus futur' if key=='extension01' else 'collection locale puis adaptateur externe selon le cas') for number,content in found]
validation = source_cases('extension01','CAS DE VALIDATION PRIORITAIRES','Une fonction est validée','IV-E01-QA')
validation += source_cases('extension02',"CAS D'ACCEPTATION MINIMAUX",'Pour chaque cas, vérifier','IV-E02-QA')
assert len(validation) == 40
assert len(cards) == 16
for item in requirements:
    for file in item['evidencePaths']:
        assert (REPO/file).is_file(),file

baseline = json.loads((REPO/'docs/standalone/guide-integration-v4.json').read_text())
assert len(baseline['requirements']) == 30 and len(baseline['referenceCards']) == 10
baseline_source = baseline['sourceGuide']
assert baseline_source['sha256'] == manifest[0]['sha256']
runtime_path = HERE/'runtime-integration.json'
runtime = json.loads(runtime_path.read_text()) if runtime_path.exists() else {
    'status':'intégration locale en cours, aucune preuve ajoutée à cette annexe',
    'tested':False,'evidencePaths':[],
    'scope':'Parcours optionnel de sept récompenses ; aucun droit Patreon réel.',
}
for r in requirements:
    delta = runtime.get('sectionDeltas', {}).get(str(r['section']))
    r['currentRuntimeStatus'] = delta['status'] if delta else r['runtimeBaselineStatus']
    r['currentImplementedScope'] = delta['scope'] if delta else ''
    r['runtimeEvidencePaths'] = runtime.get('evidencePaths', []) if delta else []
    if delta:
        r['currentRuntimeTestClaim'] = runtime.get('tested', False)
        r['baselineRemainingWork'] = r['remainingWork']
        r['remainingWork'] = delta.get('remaining', r['remainingWork'])
for c in cards:
    if c['id'] in runtime.get('implementedCardScopes', {}):
        c['status'] = runtime['implementedCardScopes'][c['id']]
result = dict(schemaVersion=1,edition='Guide général + extensions 01/02 — contextualisation Infernal Versus',date=DATE,
              baselineAudit='État local V14 relu ; les chiffres de production historiques ne sont pas modifiés par cette annexe.',
              sourceManifest=manifest, generalGuide=dict(alreadyIntegrated=True,requirements=30,referenceCards=10,
              evidencePaths=['docs/standalone/INFERNAL_VERSUS_GUIDE_V4.md','docs/standalone/guide-integration-v4.json'],unchanged=True),
              statusDefinitions={'contextualisée':'Source reliée à une décision, au code existant et à une recette ; ne signifie pas mécanique livrée.',
              'partielle':'Une partie du besoin existe dans le code inspecté ; compléments identifiés.',
              'non implémentée':'Conception et dépendances explicites ; pas de boucle jouable correspondante.',
              'documentaire':'Traçabilité, fiche ou instruction ; aucune fonction de gameplay revendiquée.',
              'à tester':'Cas de recette prévu ; aucune preuve de succès associée.'},
              requirements=requirements,referenceCards=cards,priorityDuos=duo_rows,bonusDesigns=bonus_rows,
              validationCases=validation,runtimeIntegration=runtime,
              counts=dict(existingGeneralSections=30,newExtensionSections=38,totalMappedSections=68,
              existingGeneralCards=10,newExtensionCards=16,priorityDuos=8,bonusDesigns=10,plannedValidationCases=40,
              newDrawingsByThisAnnex=0,newAnimationCyclesByThisAnnex=0,newPlayableKitsByThisAnnex=0),
              fidelityOneToOneCertified=False,
              publicationNote='Les fichiers sources et cette annexe sont intégrables à la PR ; le statut de publication est vérifié par la livraison du lot, pas par ce générateur.')
def write_json(name,value):
    (HERE/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
write_json('integration.json',result)
write_json('source-manifest.json',manifest)

def sheet(name,columns,rows,widths):
    assert len(columns)==len(widths)
    assert all(len(row)==len(columns) for row in rows)
    return dict(name=name,columns=columns,rows=rows,columnWidths=widths,freezeRows=1,wrapText=True)

def runtime_rows(value, path=''):
    """Expose each runtime proof field without placing a whole JSON tree in one cell."""
    if isinstance(value, dict):
        if not value:
            return [[path, '{}']]
        return [row for key, child in value.items()
                for row in runtime_rows(child, f'{path}.{key}' if path else key)]
    if isinstance(value, list):
        if not value:
            return [[path, '[]']]
        return [row for index, child in enumerate(value, 1)
                for row in runtime_rows(child, f'{path}[{index}]')]
    if isinstance(value, bool):
        return [[path, 'true' if value else 'false']]
    return [[path, value if value is not None else '']]

workbook = [
    sheet('Guides_Sources_20261127',['Document','Fichier source','Sections','Octets','SHA-256','Drive','Vérification'],
          [[s['id'],s['path'],f"{s['sectionRange'][0]:02}–{s['sectionRange'][1]:02}",s['bytes'],s['sha256'],s['url'],'Original conservé à l’identique'] for s in manifest],[18,65,12,12,68,65,38]),
    sheet('Extensions_01_02',['ID','Section','Rubrique','Décision','Priorité','Documentation','Moteur au constat initial','Moteur après incrément','Portée locale intégrée','Présent au constat initial','Adaptation au projet','Travail restant de la rubrique','Critère','Fichiers du projet'],
          [[r['id'],r['section'],r['title'],r['decision'],r['priority'],r['documentationStatus'],r['runtimeBaselineStatus'],r['currentRuntimeStatus'],r['currentImplementedScope'],r['existingBehavior'],r['projectDecision'],r['remainingWork'],r['acceptanceCriterion'],'\n'.join(r['evidencePaths']+r['runtimeEvidencePaths'])] for r in requirements],
          [18,10,48,26,10,22,26,32,85,70,80,80,80,65]),
    sheet('Ext_Fiches',['ID','Fiche','Statut','Champ','Contenu'],
          [[c['id'],c['title'],c['status'],label,value] for c in cards for label,value in c['fields'].items()],[18,55,55,32,110]),
    sheet('Ext_Duos_Bonus',['Type','ID','Membres','Stage / période','Priorité','Concept / objectif','Limite lore','Statut'],
          [['Duo',r['id'],' / '.join(r['members']),r['continuity'],r['priority'],r['concept'],r['guardrail'],r['status']] for r in duo_rows]+
          [['Bonus',r['id'],' / '.join(r['fighters']),r['stageId'],'P1/P2',r['objective'],r['restriction'],r['status']] for r in bonus_rows],
          [12,36,45,40,12,75,75,50]),
    sheet('Ext_Recette',['Cas','Source','Scénario','Périmètre','État','Preuve'],
          [[r['id'],r['sourceId'],r['description'],r['projectScope'],r['status'],r['proof'] or 'Aucune preuve attachée'] for r in validation],[20,18,100,55,18,45]),
    sheet('Ext_Runtime',['Champ','Valeur'],runtime_rows(runtime),[55,115]),
]
write_json('workbook-sheets.json',dict(schemaVersion=1,date=DATE,sheets=workbook,
    note='Ajouter à une nouvelle édition du classeur ; préserver les feuilles historiques. Les statuts de recette ne prouvent pas une exécution.'))

lines = ['# Infernal Versus — Intégration du guide et des extensions 01/02','',
    '**Édition du 27 novembre 2026.** Le guide général était déjà associé à la bible V4 : 30 rubriques et dix fiches. Son fichier est strictement identique à l’original Drive. Les deux extensions originales sont désormais conservées et contextualisées dans cette annexe : 38 rubriques supplémentaires, 16 fiches de production, huit duos prioritaires, dix concepts de bonus et 40 scénarios d’acceptation.','',
    'Cette annexe documente les choix du projet et le code relu. Les cycles d’animation, le tag, les assistances, les entités autonomes, les bonus et le service d’abonnement conservent chacun leur état réel. Les dessins de réserve ne deviennent pas des combattants jouables par la présence d’un slot.','',
    '## Sources et vérification du guide déjà intégré','',
    '| Source | Sections | Taille | Statut |','| --- | --- | ---: | --- |']
for s in manifest:
    lines.append(f"| [{Path(s['path']).name}](../references/{Path(s['path']).name}) | {s['sectionRange'][0]:02}–{s['sectionRange'][1]:02} | {s['bytes']:,} octets | Original conservé à l’identique |")
lines += ['', 'Le registre [source-manifest.json](source-manifest.json) conserve les trois empreintes SHA-256 et les liens Drive. La vérification locale compare les octets téléchargés, pas uniquement le nom des fichiers. Les références externes incluses dans les guides restent leurs références documentaires ; aucune intégration Patreon ni nouvelle vérification des politiques du fournisseur n’est revendiquée ici.','',
    'Le raccordement initial reste consultable dans [le guide V4](../INFERNAL_VERSUS_GUIDE_V4.md) et [sa matrice](../guide-integration-v4.json). Ces documents historiques ne sont pas réécrits. La présente annexe complète leur portée.','',
    '## Décisions d’intégration','',
    '- Le duel existant garde son identité ; un futur mode Duo possède une règle distincte et une jauge commune séparée de la tension individuelle.',
    '- Les noms « Archives de l’Entre-Acte », « Dernier Acte — Duo » et les techniques ci-dessous sont des créations du projet. Leurs événements sont AU ; les capacités et silhouettes restent soumises aux références de chaque incarnation.',
    '- Le taunt existe déjà avec un effet : +8 tension, 1 000 ms d’action, 1 250 ms de récupération. Ses variantes de personnalité sont à produire et à vérifier.',
    '- Les animations de sélection et de désélection sont conçues comme des séquences distinctes. La phase actuelle de sprites fixes ne livre pas artificiellement leurs cycles.',
    '- Le parcours de déblocage local est optionnel et désactivé par défaut pour préserver l’accès précédent. Les récompenses portent sur des contenus déjà intégrés, avec dojo libre et prêts scénarisés explicites.',
    '- Le soutien Patreon ou équivalent reste un contrat de conception. Aucun compte, prix, niveau, échéance ou avantage actif n’est inventé.',
    '- Les chiffres de vie, coûts et durées du prototype Duo sont des hypothèses de réglage, clairement distinctes des valeurs déjà présentes dans le moteur.',
    '', '## Intégration locale et preuves', '',
    'Le constat initial des sections ci-dessous reste daté. Les changements de moteur de ce lot et leurs preuves sont consignés séparément ; une réussite de documentation ne vaut pas réussite de gameplay.','']
for key in ['status','scope','tested','testCommand','testResult']:
    if key in runtime:
        value = runtime[key]
        lines.append(f"- **{key} :** {json.dumps(value,ensure_ascii=False) if isinstance(value,(dict,list)) else value}")
if runtime.get('rules'):
    lines += ['', '| Récompense | Identifiant de contenu | Condition exacte |', '| --- | --- | --- |']
    for rule in runtime['rules']:
        lines.append(f"| {rule['name']} | {rule['contentId']} | {rule['conditionText']} |")
if runtime.get('limitations'):
    lines += ['', '**Limites de cette intégration :**','']
    lines += [f'- {item}' for item in runtime['limitations']]
if runtime.get('evidencePaths'):
    lines += ['', '**Preuves :** '+' · '.join(f"[{Path(p).name}](../../../{p})" for p in runtime['evidencePaths'])+'.']
lines += ['', '## Matrice complète des 38 rubriques','',
    '« Partielle » signifie qu’un socle existe dans le code inspecté. « Non implémentée » garde la fonction à construire. « Documentaire » désigne le raccordement des fichiers et fiches. Chaque rubrique est contextualisée, mais cette couverture documentaire n’est pas un pourcentage de jeu terminé.','']
for r in requirements:
    lines += [f"### {r['section']}. {r['title'].capitalize()}", '',
              f"**{r['id']} · {r['priority']} · {r['decision']} · moteur après incrément : {r['currentRuntimeStatus']}.**",'',
              f"**Constat initial.** {r['existingBehavior']}",'',f"**Adaptation.** {r['projectDecision']}",'',
              f"**À réaliser.** {r['remainingWork']}",'',f"**Critère d’acceptation.** {r['acceptanceCriterion']}",'',
              '**Ancrages du dépôt :** '+ ' · '.join(f"[{Path(p).name}](../../../{p})" for p in r['evidencePaths'])+'.','']
    if r['currentImplementedScope']:
        lines += [f"**Incrément local de ce lot.** {r['currentImplementedScope']}",'',
                  '**Preuves de code et recette :** '+' · '.join(f"[{Path(p).name}](../../../{p})" for p in r['runtimeEvidencePaths'])+'.','']
lines += ['## Fiches contextualisées — Extension 01 et Extension 02','',
    'Les 16 fiches ci-dessous sont remplies pour des cas représentatifs. Elles fournissent un contrat de production ; elles ne remplacent pas les fiches supplémentaires nécessaires pour chaque personnage, costume et mode.','']
for c in cards:
    lines += [f"### {c['id']} — {c['title']}",'',f"**État : {c['status']}.**",'']
    for label,value in c['fields'].items():
        lines += [f"**{label}.** {value}",'']
lines += ['## Duos prioritaires et volume de production','',
    'La priorité porte sur huit associations représentatives. Pour 43 combattants, 903 paires sans ordre sont mathématiquement possibles ; une couverture générique ne devient pas une scène exclusive produite. Les variantes de costumes et de meneur se planifient à part. Les sources V3 justifient uniquement la portée qu’elles décrivent, jamais des techniques inventées.','',
    '| ID | Membres | Priorité / période | Concept | État |','| --- | --- | --- | --- | --- |']
for r in duo_rows:
    lines.append(f"| {r['id']} | {' + '.join(r['members'])} | {r['priority']} · {r['continuity']} | {r['concept']} — {r['guardrail']} | {r['status']} |")
lines += ['', '## Dix familles de bonus associées aux lieux','',
    'Toutes les propositions suivantes sont des séquences AU à insérer dans une nouvelle version de route ou une campagne explicitement mise à jour. Le mode Survie actuel n’est pas assimilé à une horde simultanée. Objectifs, score, ressources, reprise et récompenses doivent être validés avant activation.','',
    '| ID / famille | Nom | Arène existante | Objectif | Limite et état |','| --- | --- | --- | --- | --- |']
for r in bonus_rows:
    lines.append(f"| {r['id']} · {r['family']} | {r['name']} | {r['stageId']} | {r['objective']} | {r['restriction']} ; {r['status']} |")
lines += ['', '## Recette à exécuter','',
    'Les 40 cas ci-dessous proviennent des deux extensions et restent **à tester** dans cette matrice de couverture complète. Une preuve ciblée de ce lot peut couvrir un sous-ensemble local dans `runtime-integration.json` ; elle ne valide pas les scénarios de réseau, abonnement, tag ou entité encore absents.','',
    '| Cas | Scénario | État |','| --- | --- | --- |']
for r in validation:
    lines.append(f"| {r['id']} | {r['description']} | {r['status']} |")
lines += ['', '## Raccordement au classeur et poursuite','',
    '[integration.json](integration.json) contient les données de référence. [workbook-sheets.json](workbook-sheets.json) expose six nouvelles feuilles, avec colonnes et lignes, à ajouter dans une nouvelle édition du classeur en préservant les feuilles historiques. La feuille Ext_Runtime distingue les preuves réelles du constat initial.','',
    'Ordre de développement retenu : (1) politique locale de découverte et accès ; (2) cycle complet de présentation d’un personnage et taunt vérifié ; (3) assistance, relais et entité représentatifs ; (4) interactions de jauge, contact et combo ; (5) super duo, conclusion conditionnelle et clash ; (6) un bonus et une salle d’Archives avec sauvegarde ; (7) extension des contenus ; (8) service d’abonnement seulement avec son backend et sa recette propres.','',
    'La présente annexe ajoute **zéro dessin, zéro cycle d’animation et zéro kit jouable** à elle seule. Les assets effectivement produits et les modifications de code appartiennent aux registres de livraison du lot. Aucune fidélité visuelle globale 1:1 n’est certifiée par la rédaction de la bible.','']
(HERE/'INFERNAL_VERSUS_EXTENSIONS_01_02.md').write_text('\n'.join(lines))
report = dict(date=DATE,status='passed_document_validation',sourceCount=3,sourceBytes=sum(s['bytes'] for s in manifest),
              hashesVerified=True,generalGuidePreviouslyIntegrated=True,existingSections=30,extensionSections=38,totalSections=68,
              completeCards=16,plannedValidationCases=40,duos=8,bonuses=10,workbookSheets=len(workbook),
              evidencePathsExist=True,gameplayTestsRunByThisScript=False,visualFidelityCertified=False,
              outputHashes={name:sha256((HERE/name).read_bytes()).hexdigest() for name in ['integration.json','source-manifest.json','workbook-sheets.json','INFERNAL_VERSUS_EXTENSIONS_01_02.md']})
write_json('document-validation.json',report)
print(json.dumps(report,ensure_ascii=False))
