import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const here = path.dirname(fileURLToPath(import.meta.url));
const docs = path.resolve(here, '..');
const read = async name => JSON.parse(await fs.readFile(path.join(here, name), 'utf8'));
const register = await read('delivery-register.json');
const coverage = await read('active-asset-coverage.json');
const qa = register.qa;
const c = register.counts;
const total = register.cumulativeCounts;
const clean = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
const format = value => { assert(Number.isFinite(value), 'Missing numeric validation metadata.'); return value.toLocaleString('fr-FR'); };
const kindNames = { character_base: 'Base de personnage', support_base: 'Base de soutien', enemy_base: 'Base d’ennemi', costume: 'Incarnation statique', narrative_archive: 'Archive narrative', machine: 'Machine / construction', prop: 'Accessoire', projectile: 'Projectile', stage: 'Fond d’arène', stage_layer: 'Élément séparé d’arène', revision: 'Correction d’un dessin existant' };
const baseNames = franchise => register.assets.filter(asset => ['character_base', 'support_base', 'enemy_base'].includes(asset.category) && asset.franchise === franchise).map(asset => asset.name).join(', ');
const refused = register.attempts.filter(attempt => /refus|moderation_blocked/.test(attempt.status ?? ''));
const qaSentence = qa.status === 'passed' ? `${qa.testSuites} suites et ${qa.testsPassed} tests passent. TypeScript, ESLint, les builds manager et standalone, et le contrôle de ${format(qa.standaloneFilesVerified)} fichiers de distribution passent.${qa.standardBuildStatus === 'environment_resource_failure_exit_137' ? ' Deux essais de build standard ont été interrompus avec le code 137 pendant la copie des images. La validation locale utilise ensuite une compilation équivalente avec copie publique désactivée temporairement et fichiers publics assemblés par liens physiques ; les empreintes et le contrôle standalone sont vérifiés. Cette procédure ne constitue pas une réussite locale de la commande npm run qa standard.' : ''}` : 'Validation finale en cours ; ne pas utiliser ce document comme attestation de publication.';
const summary = `La production statique V7 livre **${c.distinctDrawings} dessins distincts** : ${c.newDrawings} nouveaux dessins et ${c.revisedDrawings} correction d’un dessin existant. Les fichiers livrables comprennent **${c.masterPng} masters PNG, ${c.losslessWebp} exports WebP sans perte et ${c.thumbnails} miniatures**, soit **${c.deliveredImageFiles} fichiers d’image** (${format(c.deliveredImageBytes)} octets). Chaque personnage, objet, machine, fond et élément de décor possède son fichier séparé. Aucun cycle animé n’est ajouté.`;

const report = `# Livraison statique V7 — 26 novembre 2026

${summary}

Sources de suivi : [registre vérifié](production-v7/delivery-register.json), [revue indépendante](production-v7/reviews-v7.md), [références](production-v7/references.json), [bible V7](INFERNAL_VERSUS_BIBLE_V7.xlsx), [PR nº8](https://github.com/darknigthmare/hellbound-hotel-manager/pull/8). Base de cette continuation : \`${register.baselineCommit}\`.

## Productions livrées

| Catégorie | Dessins V7 | Portée |
|---|---:|---|
| Bases de personnages | ${c.characterBases} | Une identité et une incarnation statique par image |
| Bases de soutien | ${c.supportBases} | Huskettes féline et imp, séparées |
| Incarnations / costumes | ${c.costumes} | Millie avec queue de cheval ; Loona quadrupède |
| Archives narratives | ${c.narrativeArchives} | Loona au refuge en buste ; Fizz avant accident en entier |
| Machines / constructions | ${c.machines} | Trois mechas C.H.E.R.U.B. ; construction de glace initiale d’Andrealphus |
| Accessoire | ${c.props} | Money Shot de Valentino |
| Fonds d’arène | ${c.stages} | Sloth extérieur ; désert australien S3 ; hall vitré des enchères S3 |
| Éléments de décor séparés | ${c.stageLayers} | Deux éléments indépendants pour chaque nouvelle arène |
| Correction | ${c.revisedDrawings} | Motif du mollet d’Apple ; ancienne version conservée |

**Hazbin Hotel — nouvelles bases :** ${baseNames('Hazbin Hotel')}.

**Helluva Boss — nouvelles bases :** ${baseNames('Helluva Boss')}.

Les variantes et archives n’ajoutent aucune identité autonome aux compteurs. Le buste de Loona ne vaut pas livraison d’un corps entier. Les jeunes personnages des archives restent dans la galerie narrative ; aucun kit de combat n’est créé. La construction de glace à une tête ne couvre pas la forme multi-têtes complète. Les trois fichiers du premier candidat de hall rejeté sont conservés à titre d’historique, hors des ${c.deliveredImageFiles} fichiers livrables et hors des ${c.distinctDrawings} dessins retenus.

## Intégration effective

| Indicateur | Avant V7 | Après V7 |
|---|---:|---:|
| Combattants jouables | ${register.baseline.activeFighters} | ${total.activeFighters} |
| Bases autonomes | ${register.baseline.standaloneBases} | ${total.standaloneBases} |
| Bases actives / en réserve | ${register.baseline.activeStandaloneBases} / ${register.baseline.reserveStandaloneBases} | ${total.activeStandaloneBases} / ${total.reserveStandaloneBases} |
| Entrées de galerie | ${register.baseline.reserveGalleryEntries} | ${total.reserveGalleryEntries} |
| Arènes du catalogue | ${register.baseline.activeStages} | ${total.activeStages} |
| Familles de costumes jouables | ${register.baseline.runtimeCostumeFamilies} | ${total.runtimeCostumeFamilies} |
| Images personnelles affectées | ${total.illustratedPersonalScenes}/${total.personalScenes} | ${total.illustratedPersonalScenes}/${total.personalScenes} |
| Images globales affectées | ${total.illustratedGlobalScenes}/${total.globalScenesIncludingBookends} | ${total.illustratedGlobalScenes}/${total.globalScenesIncludingBookends} |

Les dessins hors décor sont consultables dans la galerie. Apple conserve son identifiant d’entrée ; son image courante est remplacée par le master V7, avec conservation des anciens chemins et empreintes dans l’historique. Les arènes utilisent les nouveaux fonds et les six éléments séparés. Le manager conserve ses huit arènes.

Les deux arènes S3 sont masquées par défaut. L’option explicite **Autoriser les décors et créations de saison 3** est conservée dans la sauvegarde et partagée par le choix d’arène, la rotation des parcours et la galerie. Une ancienne sauvegarde sans ce champ conserve la valeur false. La révocation remplace une sélection S3 devenue indisponible par une arène autorisée, sans effacer le parcours ni les résultats. Le catalogue contient ${total.activeStages} arènes, dont ${total.activeStages - 2} disponibles sans cette option.

## Contrôles réalisés

${qaSentence}

Le [relevé runtime](production-v7/active-asset-coverage.json) vérifie **${coverage.summary.referencedAssets} chemins d’assets**, sans référence cassée. Le [contrôle d’images](production-v7/image-file-qa.json) compare les pixels décodés des PNG et WebP : export sans perte à la taille native. Cette égalité technique ne certifie pas la fidélité au dessin de référence.

Les ${c.distinctDrawings} masters sont liés par leur empreinte SHA-256 à une revue indépendante. Les silhouettes, le cadrage et l’alpha sont inspectés ; les nouveaux décors font aussi l’objet de compositions statiques selon leurs paramètres CSS. Ces montages ne sont pas des captures du jeu en navigateur.

**La validation visuelle en navigateur et la mesure des performances mobiles ne sont pas exécutées.** Le [rapport navigateur](production-v7/browser-qa.json) documente l’absence du binaire Chromium. Le statut inGameChecked reste false. La conformité artistique 1:1 n’est pas certifiée : détails fins, poses de présentation et parties reconstituées sont explicités dans chaque fiche.

## Bible et conservation

Le classeur V7 conserve les **43 feuilles historiques V6** et ajoute **Production V7, Cibles V7 et Repères V7**, pour **46 feuilles**. Les anciennes bibles et leurs registres restent conservés. Le contrôle du classeur vérifie l’intégrité des feuilles historiques, le rendu des nouvelles tables, le recalcul et la réouverture de l’export.

Le fichier de suivi Drive garde son identifiant : [INFERNAL_VERSUS_BIBLE_V7.xlsx](https://drive.google.com/file/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU). Le remplacement porte sur un fichier XLSX ; il ne convertit pas le document en Google Sheets natif.

## Manquants et limites explicites

Le catalogue contient ${total.catalogueIds} IDs, soit ${total.distinctProductionIdentitiesAfterKnownAlias} identités de production après l’alias connu de Travis. Il reste **${total.catalogueIdsWithoutStandaloneBase} IDs sans base autonome**, correspondant à **${total.distinctProductionIdentitiesWithoutStandaloneBase} identités distinctes**. Les groupes, personnages de pilote, mentions sans modèle, entrées futures et incarnations à définir ne sont pas transformés en personnages inventés. Le tableau individuel du registre conserve le statut et la preuve requise pour chaque cible.

${c.generatorRefused} demandes V7 ont été refusées par le générateur. Aucun fichier n’est compté pour ces sorties, aucune relance n’a été effectuée après ces refus :

${refused.map(attempt => `- \`${attempt.id}\` — ${clean(attempt.name ?? attempt.label ?? attempt.sourceIdentityId ?? 'voir journal de génération')}.`).join('\n')}

Les refus historiques, notamment les deux scènes personnelles encore absentes, restent conservés. Le refus de l’aéronef S1 ne ferme pas la lacune distincte du dirigeable du pilote. VAR-010, Pentious racheté, reste sans fichier vérifiable après recherche historique et refus de génération V7.

${register.remaining.partiallyCoveredPlannedStageDetails.map(row => `- **${row.id}** : ${row.notes}`).join('\n')}

L’[audit environnement](production-v7/environment-audit.md) détaille aussi la flèche C.H.E.R.U.B., le shuriken D.H.O.R.K.S., le toit de l’ancien hôtel, l’arme des Vees et son site, la forme de glace multi-têtes, la salle principale des enchères et Big Woobly. Les qualifications [Helluva](production-v7/helluva-qualification.md) et [Hazbin](production-v7/hazbin-qualification.md) distinguent les identités réellement documentées de celles dont la vue entière, les contours ou les détails restent insuffisants.

## Inventaire des dessins retenus

Les empreintes complètes, dimensions, octets, références, prompts et limites sont dans le registre et les journaux. Chaque ligne ci-dessous correspond à un dessin réel retenu ; une miniature ou une correction technique ne crée pas de nouvelle identité.

| ID | Catégorie | Dimensions | Master | Export |
|---|---|---|---|---|
${register.assets.map(asset => `| ${clean(asset.id)} | ${kindNames[asset.category] ?? clean(asset.category)} | ${asset.dimensions.join(' × ')} | [PNG](../../${asset.master}) | [WebP](../../${asset.export}) |`).join('\n')}
`;
await fs.writeFile(path.join(docs, 'DELIVERY_STATIC_V7_2026-11-26.md'), report);

const readme = `# Sources de production statique V7

${summary}

Le [rapport de livraison](../DELIVERY_STATIC_V7_2026-11-26.md) décrit les résultats et limites. Le [registre](delivery-register.json) est calculé depuis les fichiers présents, leurs empreintes et les [revues indépendantes](reviews-v7.json). Les anciennes livraisons V5/V6 ne sont pas réécrites.

## Reproduire la consolidation

Depuis la racine du dépôt, avec Node et les dépendances du projet :

\`\`\`bash
node docs/standalone/production-v7/build-register.mjs
node docs/standalone/production-v7/sync-reserve-assets.mjs
node docs/standalone/production-v7/sync-extension-plan.mjs
node docs/standalone/production-v7/audit-runtime-coverage.mjs --sync-plan
npm run qa
node docs/standalone/production-v7/build-register.mjs --final
node docs/standalone/production-v7/build-delivery-docs.mjs
\`\`\`

La validation finale exige validation.json au statut passed, tous les masters acceptés avec le même hash, aucune tentative de génération en attente, tous les exports intégrés et aucun chemin d’asset cassé. Les commandes de QA doivent être enregistrées par l’opérateur ; le script de consolidation ne fabrique pas un succès de test.

## Journaux et qualification

- hazbin-generation.json, helluva-generation.json, environment-generation.json et corrections-generation.json : prompts, résultats, refus, fichiers et limites.
- catalogue-audit.json : état initial immuable des 126 IDs sans base au commit de départ.
- hazbin-qualification.json, hazbin-qualification-extra.json et hazbin-variant-qualification.json : qualification primaire, ambiguïtés et corrections de continuité.
- helluva-qualification.json et helluva-reference-index.json : contrôles individuels, variantes et empreintes des références inspectées.
- environment-references.json et environment-audit.json : sources, reports individuels et distinction entre couverture visuelle et validation navigateur/mobile.
- image-file-qa.json, validation.json, active-asset-coverage.json et browser-qa.json : vérifications techniques et contrôles non exécutés.

## Classeur

build-bible-v7.mjs utilise @oai/artifact-tool, importe la bible V6, préserve ses 43 feuilles et ajoute trois vues V7. Les modes --prepare, --inspect-baseline et --final servent respectivement à préparer, inspecter la base et finaliser le classeur. Le runtime de documents doit exposer les dépendances via CODEX_PRIMARY_RUNTIME_NODE_MODULES. La recette rend les nouvelles feuilles, contrôle un recalcul puis réimporte l’export et compare les feuilles historiques. Les résultats sont archivés dans les fichiers de QA du classeur.

## Règles de comptage

Un master natif retenu compte comme un dessin. Son WebP sans perte et sa miniature sont des fichiers dérivés, pas des dessins supplémentaires. Les costumes, archives et machines n’augmentent pas les bases d’identité. Apple remplace l’image d’une entrée existante sans augmenter la galerie. Les trois fichiers du premier candidat du hall sont archivés hors des totaux livrables. La fidélité 1:1 et le rendu en navigateur ne sont pas certifiés par l’égalité PNG/WebP ou les tests unitaires.
`;
await fs.writeFile(path.join(here, 'README.md'), readme);

const mainPath = path.join(docs, 'README.md');
let main = await fs.readFile(mainPath, 'utf8');
main = main.replace(/<!-- V7_CURRENT_START -->[\s\S]*?<!-- V7_CURRENT_END -->\n\n/g, '');
main = main.replace('## Reprise actuelle — 25 novembre 2026, production statique V6', '## Contenu conservé — 25 novembre 2026, production statique V6 (historique)');
const section = `<!-- V7_CURRENT_START -->
## Reprise actuelle — 26 novembre 2026, production statique V7

${summary}

La [bible V7](INFERNAL_VERSUS_BIBLE_V7.xlsx), le [rapport de livraison](DELIVERY_STATIC_V7_2026-11-26.md) et le [registre](production-v7/delivery-register.json) décrivent ${total.standaloneBases} bases autonomes (${total.activeStandaloneBases} actives et ${total.reserveStandaloneBases} en réserve), ${total.reserveGalleryEntries} entrées de galerie et ${total.activeStages} arènes. Le roster conserve ses ${total.activeFighters} kits. Les deux arènes S3 nécessitent une activation explicite ; les anciennes sauvegardes les gardent masquées.

Apple utilise sa correction V7 sans nouvelle entrée. Les archives Loona/Fizz restent narratives. Les trois nouvelles arènes comportent chacune un fond et deux éléments séparés. Les ${c.generatorRefused} refus V7 ne fournissent aucun fichier. ${total.catalogueIdsWithoutStandaloneBase} IDs (${total.distinctProductionIdentitiesWithoutStandaloneBase} identités distinctes) restent sans base, avec leur motif individuel. Aucun nouveau cycle animé n’est ajouté.

${qaSentence} Le [contrôle runtime](production-v7/active-asset-coverage.json) trouve ${coverage.summary.referencedAssets} chemins valides. La revue statique est documentée, mais le [contrôle navigateur](production-v7/browser-qa.json) et les performances mobiles ne sont pas exécutés ; fidélité 1:1 non certifiée. Les 43 feuilles historiques sont conservées et trois feuilles V7 ajoutées. Le [classeur Drive](https://drive.google.com/file/d/10Yj1iCApht1WkmkI2ZpAZfsznSRoMjZU) garde le même identifiant.
<!-- V7_CURRENT_END -->

`;
main = main.replace('## Contenu conservé — 25 novembre 2026, production statique V6 (historique)', section + '## Contenu conservé — 25 novembre 2026, production statique V6 (historique)');
await fs.writeFile(mainPath, main);
console.log(JSON.stringify({ report: 'docs/standalone/DELIVERY_STATIC_V7_2026-11-26.md', drawings: c.distinctDrawings, imageFiles: c.deliveredImageFiles, qa: qa.status }));
