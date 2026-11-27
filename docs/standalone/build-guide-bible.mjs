import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire, registerHooks } from 'node:module';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  GUIDE_EDITION, GUIDE_DATE, BASELINE_COMMIT, GUIDE_SHA256, statusDefinitions,
  decisions, requirementRows, transitionDesign, validationCases, makeReferenceCards,
} from './guide-bible-data.mjs';

// Run from an isolated temporary authoring directory with the primary runtime.
// All worksheet content is authored by Artifact Tool. The packaging helper only
// appends these authored OOXML parts, preserving the 29 historical V3 sheets.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const outputDir = path.resolve(process.argv[2] ?? path.join(root, '../outputs/infernal-guide-v4'));
const require = createRequire(import.meta.url);
const runtimeNode = process.env.CODEX_PRIMARY_RUNTIME_NODE;
assert(runtimeNode && path.resolve(process.execPath) === path.resolve(runtimeNode), 'Run with CODEX_PRIMARY_RUNTIME_NODE.');
const artifactPath = require.resolve('@oai/artifact-tool', { paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES] });
const { Workbook, SpreadsheetFile, FileBlob } = await import(pathToFileURL(artifactPath).href);
await fs.mkdir(outputDir, { recursive: true });

const guidePath = path.join(here, 'references/Combat_Games_Guide_General_v1.0.txt');
const guideBytes = await fs.readFile(guidePath);
assert.equal(createHash('sha256').update(guideBytes).digest('hex'), GUIDE_SHA256, 'Original guide changed.');
assert.equal(guideBytes.length, 55172);
const campaignDesign = JSON.parse(await fs.readFile(path.join(here, 'campaign-design-v3.json'), 'utf8'));
const reserves = JSON.parse(await fs.readFile(path.join(root, 'art/infernal-versus/production/reserve-assets.json'), 'utf8'));

async function collectRuntime() {
  const ts = require('typescript');
  const sourceRoot = pathToFileURL(path.join(root, 'src') + path.sep).href;
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (context.parentURL?.startsWith(sourceRoot) && specifier.startsWith('.') && !path.extname(specifier)) {
        const file = new URL(specifier + '.ts', context.parentURL);
        return next(existsSync(file) ? file.href : specifier + '/index.ts', context);
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith(sourceRoot) || !url.endsWith('.ts')) return next(url, context);
      return {
        format: 'module',
        source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
          compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
        }).outputText,
        shortCircuit: true,
      };
    },
  });
  try {
    return Object.assign({}, ...await Promise.all([
      'standalone/roster', 'standalone/campaign', 'standalone/campaign-global',
      'lib/pentagram-fighters', 'lib/pentagram-combat', 'lib/pentagram-stages',
      'lib/infernal-finishers',
    ].map(module => import(sourceRoot + module + '.ts'))));
  } finally { hooks.deregister(); }
}
const runtime = await collectRuntime();
const roster = runtime.STANDALONE_ROSTER;
const fighterNames = new Map(roster.map(f => [f.character.id, f.character.name]));
const stageNames = new Map(runtime.STANDALONE_STAGES.map(s => [s.id, s.name]));
assert.equal(roster.length, 43);
assert.equal(runtime.STANDALONE_STAGES.length, 30);
assert.equal(Object.keys(runtime.STORY_ROUTES).length, 43);
assert.equal(runtime.GLOBAL_CAMPAIGN.chapters.length, 9);
const narratives = campaignDesign.fighters.map(fighter => {
  const route = runtime.STORY_ROUTES[fighter.fighterId];
  assert(route, 'Missing route ' + fighter.fighterId);
  assert.equal(route.title, fighter.campaign.title);
  assert.equal(route.intro, fighter.campaign.intro);
  assert.equal(route.ending, fighter.campaign.ending);
  assert.equal(route.chapters.length, 3);
  fighter.campaign.chapters.forEach((chapter, index) => {
    assert.equal(route.chapters[index].opponent, chapter.opponentId);
    assert.equal(route.chapters[index].stage, chapter.stageId);
    assert(fighterNames.has(chapter.opponentId));
    assert(stageNames.has(chapter.stageId));
  });
  return { fighterId: fighter.fighterId, name: fighter.name, title: route.title, routeVersion: 3, chapterCount: 3 };
});
const requirements = requirementRows.map(([section,title,priority,decision,implementation,present,remaining,criterion,evidence]) => ({
  id: 'IV-G' + String(section).padStart(2, '0'), section, title, priority, decision,
  design: 'Documentée', implementation, present, remaining, criterion, evidence,
  validation: 'Voir les résultats datés du lot ; cette matrice décrit le périmètre et ses critères.',
}));
assert.deepEqual(requirements.map(r => r.section), Array.from({length: 30}, (_, i) => i));
const sourceReferences = new Set();
for (const row of requirements) for (const file of row.evidence) {
  sourceReferences.add(file);
  // Generated references are verified after they have been written below.
  if (!['docs/standalone/guide-integration-v4.json', 'docs/standalone/INFERNAL_VERSUS_GUIDE_V4.md'].includes(file)) {
    assert(existsSync(path.join(root, file)), 'Missing evidence path: ' + file);
  }
}
const cards = makeReferenceCards(runtime, campaignDesign, reserves);
assert.deepEqual(cards.map(card => card.letter), [...'ABCDEFGHIJ']);
assert(cards.every(card => card.fields.every(field => field.label.trim() && field.value.trim())));
for (const link of transitionDesign) {
  assert(stageNames.has(link.from) && stageNames.has(link.to), 'Missing transition destination.');
}
for (const chapter of runtime.GLOBAL_CAMPAIGN.chapters) {
  assert(fighterNames.has(chapter.fighterId) && fighterNames.has(chapter.opponentId));
  assert(stageNames.has(chapter.stageId));
  assert(chapter.dialogue.every(d => fighterNames.has(d.speakerId)));
}
const countsByKind = Object.fromEntries(['character_base', 'enemy_base', 'projectile'].map(kind => [kind, reserves.assets.filter(a => a.kind === kind).length]));
assert.deepEqual(countsByKind, { character_base: 13, enemy_base: 8, projectile: 1 });
const metrics = {
  playableFighters: roster.length,
  hazbinFighters: roster.filter(f => f.franchise === 'Hazbin Hotel').length,
  helluvaFighters: roster.filter(f => f.franchise === 'Helluva Boss').length,
  stages: runtime.STANDALONE_STAGES.length,
  personalRoutesV3: narratives.length,
  personalChaptersV3: narratives.reduce((total, row) => total + row.chapterCount, 0),
  globalCampaigns: 1,
  globalChapters: runtime.GLOBAL_CAMPAIGN.chapters.length,
  globalPlayableIdentities: new Set(runtime.GLOBAL_CAMPAIGN.chapters.map(c => c.fighterId)).size,
  baseAttacks: roster.length * 3,
  signatures: roster.filter(f => f.profile.signature).length,
  attackCount: roster.reduce((total, f) => total + 3 + Number(Boolean(f.profile.signature)), 0),
  illustrationBriefsV3: campaignDesign.fighters.reduce((total,f) => total + f.illustrations.length, 0),
  moveProposalsV3: campaignDesign.fighters.reduce((total,f) => total + f.moves.length, 0),
  proposalsRequiringNewMechanic: campaignDesign.fighters.flatMap(f => f.moves).filter(m => m.implementation === 'requires_new_mechanic').length,
  finisherStoryboardsV3: campaignDesign.fighters.length,
  reserves: reserves.assets.length,
  reserveCharacters: countsByKind.character_base,
  reserveEnemies: countsByKind.enemy_base,
  reserveProjectiles: countsByKind.projectile,
  guideSections: requirements.length,
  referenceCards: cards.length,
  transitionProposals: transitionDesign.length,
  newDrawingsInV4: 0,
  newAnimationCyclesInV4: 0,
  fidelityOneToOneCertified: false,
};
assert.equal(metrics.attackCount, 133);
assert.equal(metrics.proposalsRequiringNewMechanic, 67);
const data = {
  schemaVersion: 1, edition: GUIDE_EDITION, date: GUIDE_DATE,
  baselineCommit: BASELINE_COMMIT,
  sourceGuide: { path: 'docs/standalone/references/Combat_Games_Guide_General_v1.0.txt', sha256: GUIDE_SHA256, bytes: guideBytes.length, preservedVerbatim: true },
  statusDefinitions, decisions: decisions.map(([id,topic,decision]) => ({id,topic,decision})),
  metrics, requirements, referenceCards: cards, individualRouteAssociation: narratives,
  globalCampaign: runtime.GLOBAL_CAMPAIGN, transitionDesign,
  reserveAssociation: reserves.assets.map(a => ({
    id: a.id, name: a.name, kind: a.kind, identityId: a.sourceIdentityId,
    master: a.master, export: a.export, dimensions: a.dimensions,
    masterSha256: a.masterSha256, exportSha256: a.exportSha256,
    usageV4: 'Galerie de réserve ; kit ou collision absents',
    originalRuntimeStatus: a.runtimeStatus,
    fidelityOneToOneCertified: a.fidelityOneToOneCertified,
    originalInGameChecked: a.inGameChecked,
    fidelityNotes: a.fidelityNotes, references: a.references,
  })),
  validationCases: validationCases.map(([id,requirements,title,scenario,expected,type]) => ({id, requirements: requirements.split(' '),title,scenario,expected,type,status: 'Critère prévu ; résultat à lire dans le rapport daté'})),
  historicalWorkbook: {file: 'docs/standalone/INFERNAL_VERSUS_BIBLE_V3.xlsx', preservedSheets: 29, snapshot: 'Vague I / bible V3 ; ses tableaux décrivent cet état historique, pas un inventaire courant V4.'},
};
await fs.writeFile(path.join(here, 'guide-integration-v4.json'), JSON.stringify(data, null, 2) + '\n');

function markdown() {
  const out = [
    '# Infernal Versus — Guide intégré V4', '',
    `**État du ${GUIDE_DATE}.** Le guide général de Darknigthmare est associé aux règles, récits et fichiers d’Infernal Versus. Cette édition accompagne la reprise de la PR #8 depuis le commit [2738bfd](https://github.com/darknigthmare/hellbound-hotel-manager/commit/${BASELINE_COMMIT}).`, '',
    'Le [guide original](references/Combat_Games_Guide_General_v1.0.txt) est conservé sans modification. Son empreinte SHA-256 est `' + GUIDE_SHA256 + '` (55 172 octets). Les propositions générales sont contextualisées ci-dessous ; elles ne deviennent pas toutes des fonctions livrées.', '',
    'Le [classeur V4](INFERNAL_VERSUS_BIBLE_V4.xlsx) ajoute cinq vues aux 29 feuilles V3 conservées. Le [registre structuré](guide-integration-v4.json) associe les 30 rubriques, les dix fiches, les routes, la campagne, les réserves et les critères. Les feuilles V3 décrivent l’état de leur lot historique. Les vues V4 donnent la correspondance actuelle.', '',
    '## Périmètre mesuré', '',
    '| Catégorie | Quantité | Sens du nombre |', '| --- | ---: | --- |',
    `| Combattants jouables | ${metrics.playableFighters} | ${metrics.hazbinFighters} Hazbin et ${metrics.helluvaFighters} Helluva |`,
    `| Arènes enregistrées | ${metrics.stages} | Trois plans par arène dans le socle |`,
    `| Attaques paramétrées | ${metrics.attackCount} | ${metrics.baseAttacks} actions de base et ${metrics.signatures} signatures |`,
    `| Routes personnelles V3 | ${metrics.personalRoutesV3} | ${metrics.personalChaptersV3} duels, anciennes routes V1 préservées |`,
    `| Campagne globale | 1 | ${metrics.globalChapters} chapitres et ${metrics.globalPlayableIdentities} identités jouées |`,
    `| Illustrations V3 | ${metrics.illustrationBriefsV3} briefs | Les briefs ne sont pas des dessins produits |`,
    `| Techniques V3 | ${metrics.moveProposalsV3} concepts | ${metrics.proposalsRequiringNewMechanic} demandent une mécanique nouvelle |`,
    `| Derniers Actes V3 | ${metrics.finisherStoryboardsV3} storyboards | Les variantes longues restent à produire |`,
    `| Dessins de réserve | ${metrics.reserves} | ${metrics.reserveCharacters} bases de personnages, ${metrics.reserveEnemies} ennemis, ${metrics.reserveProjectiles} projectile |`,
    '| Nouveaux dessins ou cycles dans V4 | 0 | Ce lot termine l’intégration des contenus et de la bible |', '',
    'Ces unités ne s’additionnent pas en un pourcentage global. La complétude de tout l’univers reste ouverte. Les 26 anciennes affectations narratives appartiennent aux routes V1 ; aucune n’est certifiée automatiquement conforme aux nouveaux briefs V3.', '',
    '## Décisions du projet', '',
    ...decisions.map(([id,topic,decision]) => `- **${id} — ${topic}.** ${decision}`), '',
    '## 30 rubriques associées', '',
    '« Intégrée » décrit le raccordement de la portée indiquée, et non une certification de chaque extension de la rubrique. Les rapports datés portent les résultats des tests. « Documentée » et « Différée » restent des états de conception.', '',
  ];
  for (const row of requirements) out.push(
    `### ${String(row.section).padStart(2,'0')}. ${row.title}`, '',
    `**${row.id} · ${row.priority} · ${row.decision} · ${row.implementation}**`, '',
    `**Présent :** ${row.present}`, '', `**Suite :** ${row.remaining}`, '',
    `**Critère :** ${row.criterion}`, '',
    '**Références du projet :** ' + row.evidence.map(file => `[${file}](../../${file})`).join(' · ') + '.', '',
  );
  out.push('## Dix fiches de référence', '',
    'Ces dix fiches remplissent les modèles A–J pour des sujets concrets. Elles complètent les 43 fiches de personnage et de campagne V3. Une fiche de transition conçue n’est pas une transition active. Les valeurs non fixées sont désignées explicitement.', '');
  for (const card of cards) {
    out.push(`### Fiche ${card.letter} — ${card.title}`, '', `**${card.id} · ${card.subject}**`, '', `État : ${card.status}.`, '');
    for (const field of card.fields) out.push(`**${field.label}.** ${field.value}`, '');
  }
  out.push('## Campagne globale — La nuit du signal libre', '', runtime.GLOBAL_CAMPAIGN.continuity, '',
    '**Intrigue.** ' + runtime.GLOBAL_CAMPAIGN.premise, '', '**Prologue.** ' + runtime.GLOBAL_CAMPAIGN.intro, '');
  runtime.GLOBAL_CAMPAIGN.chapters.forEach((chapter,index) => {
    out.push(`### Chapitre ${index+1} — ${chapter.title}`, '',
      `**${chapter.id}** · ${fighterNames.get(chapter.fighterId)} contre ${fighterNames.get(chapter.opponentId)} · ${stageNames.get(chapter.stageId)}`, '',
      chapter.scene, '', '**Objectif.** ' + chapter.objective, '',
      ...chapter.dialogue.map(d => `> **${fighterNames.get(d.speakerId)} :** ${d.line}`), '',
      '**Après victoire.** ' + chapter.afterVictory, '', '**Après défaite.** ' + chapter.retry, '');
  });
  out.push('### Épilogue global', '', runtime.GLOBAL_CAMPAIGN.ending, '', '**Prolongement.** ' + runtime.GLOBAL_CAMPAIGN.nextHook, '',
    'La progression est un enchaînement de duels avec scènes et objectifs. Exploration, coopération, chapitres à embranchements, inventaire et bonus RPG ne sont pas revendiqués. Une défaite conserve les chapitres déjà gagnés et exige un réessai explicite.', '',
    '## Liaisons entre arènes — conception', '',
    'Les trois destinations sont déjà des arènes du catalogue. Les liaisons restent désactivées tant que leur simulation, leurs annonces, leurs assets et leur recette ne sont pas intégrés.', '');
  for (const link of transitionDesign) out.push(
    `### ${link.id} — ${link.title}`, '', `**${link.from} → ${link.to}.** ${link.rationale}`, '',
    '**Déclencheur.** ' + link.trigger, '', '**Règles.** ' + link.rules, '', '**Arrivée.** ' + link.arrival, '',
    '**Réponse.** ' + link.response, '', '**Présentation.** ' + link.presentation, '', '**Cas limites.** ' + link.edgeCases, '',
    '**Dépendances.** ' + link.dependencies.join(', ') + '.', '',
  );
  out.push('## 22 réserves reliées à la galerie', '',
    'Le catalogue d’origine garde ses empreintes, ses références et ses incertitudes. V4 donne un accès de consultation ; les identités restent hors du roster et la fléchette reste sans objet simulé.', '',
    '| ID | Catégorie | Identité | Format | Export |', '| --- | --- | --- | --- | --- |');
  for (const a of reserves.assets) out.push(`| ${a.id} | ${{character_base:'Personnage',enemy_base:'Ennemi',projectile:'Projectile'}[a.kind]} | ${a.name} | ${a.dimensions.join(' × ')} | [WebP](../../${a.export}) |`);
  out.push('', '## Recette prévue', '',
    'Cette liste définit ce qui doit être vérifié. Les résultats exécutés sont consignés séparément dans le rapport de lot, avec les limites de la comparaison visuelle.', '',
    '| ID | Scénario | Résultat attendu | Type |', '| --- | --- | --- | --- |',
    ...data.validationCases.map(test => `| ${test.id} | ${test.title} — ${test.scenario} | ${test.expected} | ${test.type} |`), '',
    '## Instruction pour la prochaine reprise', '',
    'Lire `AGENTS.md`, la présente matrice, `extension-plan.json`, `campaign-design-v3.json` et les derniers rapports de livraison. Réconcilier les fichiers avec la branche de la PR avant de produire. Choisir un lot cohérent parmi les éléments manquants, conserver l’incarnation et la référence de chaque sujet, et garder un sujet exploitable par sprite autonome. Les réserves ne deviennent jouables qu’après une fiche de rôle, un kit, des réactions et des tests. Les évolutions narratives conservent leur identité de route afin de reprendre les anciennes sauvegardes. Mettre à jour la matrice et les preuves du lot, puis publier dans la PR autorisée.', '',
    '## Régénération et preuves du classeur', '',
    'Lancer `build-guide-bible.mjs` avec le Node du runtime de documents depuis un dossier temporaire isolé. Le script extrait les tables TypeScript, contrôle les associations, génère la version lisible et le JSON, crée cinq feuilles avec Artifact Tool, recalcule et rend leurs plages, puis assemble les parties OOXML sans réécrire les 29 feuilles V3. Le classeur V3 demeure archivé. Les rapports `QA_GUIDE_DATA_V4_2026-11-25.json` et `QA_GUIDE_WORKBOOK_V4_2026-11-25.json` décrivent les contrôles effectivement effectués.', '',
    'Le contrôle structurel et le rendu des feuilles ne prouvent pas la fidélité visuelle au lore, le fonctionnement du combat en navigateur ou le recalcul dans Microsoft Excel natif. Ces preuves demandent leurs vérifications propres.', '',
  );
  return out.join('\n');
}
await fs.writeFile(path.join(here, 'INFERNAL_VERSUS_GUIDE_V4.md'), markdown());
for (const file of sourceReferences) assert(existsSync(path.join(root,file)), 'Generated reference missing: ' + file);

// First inspect and render the historical reference; it is never re-exported.
const baselinePath = path.join(here,'INFERNAL_VERSUS_BIBLE_V3.xlsx');
const baseline = await SpreadsheetFile.importXlsx(await FileBlob.load(baselinePath));
const baselineSummary = await baseline.inspect({kind:'sheet', include:'id,name', maxChars: 5000});
await fs.writeFile(path.join(outputDir,'baseline-sheets.ndjson'), baselineSummary.ndjson);
const baselineView = await baseline.render({sheetName:'Guide V3',range:'A1:D11',scale:1,format:'png'});
await fs.writeFile(path.join(outputDir,'baseline-v3-guide.png'),new Uint8Array(await baselineView.arrayBuffer()));
if (process.argv.includes('--inspect-only')) {
  console.log(JSON.stringify({baselinePreview:path.join(outputDir,'baseline-v3-guide.png'),metrics}));
  process.exit(0);
}

const wb = Workbook.create();
for (const name of ['Guide V4','Fiches V4','Campagne globale','Réserves V4','Recette V4']) wb.worksheets.add(name);
const palette={burgundy:'#54233F',ink:'#292332',muted:'#665C68',gold:'#B38839',pale:'#F8F3F6',line:'#DCC9D4'};
const col=n=>String.fromCharCode(65+n);
const sheetSpecs=[];
function table(name,title,note,headers,widths,rows,tableName,start=5){
  const sheet=wb.worksheets.getItem(name),last=col(headers.length-1),end=start+rows.length;
  sheet.showGridLines=false;
  const full=sheet.getRange(`A1:${last}${end}`);
  full.format.font={name:'Arial',size:10,color:palette.ink};
  sheet.getRange(`A2:${last}2`).merge();
  sheet.getRange('A2').values=[[title]];
  sheet.getRange('A2').format.font={name:'Arial',size:16,bold:true,color:palette.burgundy};
  sheet.getRange(`A2:${last}2`).format.rowHeight=30;
  sheet.getRange(`A3:${last}3`).format.rowHeight=6;
  sheet.getRange(`A3:${last}3`).format.borders={bottom:{style:'thin',color:palette.gold}};
  sheet.getRange(`A4:${last}4`).merge();
  sheet.getRange('A4').values=[[note]];
  sheet.getRange('A4').format.font={name:'Arial',size:10,italic:true,color:palette.muted};
  sheet.getRange(`A4:${last}4`).format.rowHeight=30;
  sheet.getRange(`A${start}:${last}${end}`).values=[headers,...rows];
  const t=sheet.tables.add(`A${start}:${last}${end}`,true,tableName);t.style='TableStyleLight1';t.showFilterButton=true;
  sheet.getRange(`A${start}:${last}${start}`).format={fill:palette.burgundy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},horizontalAlignment:'center',verticalAlignment:'center',wrapText:true,rowHeight:36};
  sheet.getRange(`A${start+1}:${last}${end}`).format.wrapText=true;
  sheet.getRange(`A${start+1}:${last}${end}`).format.verticalAlignment='top';
  widths.forEach((width,i)=>sheet.getRange(`${col(i)}1:${col(i)}${end}`).format.columnWidth=width);
  rows.forEach((row,i)=>{
    const lines=Math.max(...row.map((value,j)=>String(value??'').split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/(widths[j]*0.82))),0)));
    const range=sheet.getRange(`A${start+1+i}:${last}${start+1+i}`);
    range.format.rowHeight=Math.max(29,15*lines+13);
    if(i%2===0)range.format.fill=palette.pale;
  });
  sheet.freezePanes.freezeRows(start);
  sheet.freezePanes.freezeColumns(1);
  sheetSpecs.push({name,title,headers,rows,start,end,last});
  return sheet;
}
const guideRows=requirements.map(r=>[r.id,r.title,r.priority,r.decision,r.implementation,r.present,r.remaining,r.criterion,r.evidence.join('\n')]);
const guide=table('Guide V4','Infernal Versus · Guide intégré V4','25 novembre 2026. Les 29 feuilles V3 restent des archives ; cette matrice définit la portée actuelle et les suites.',
  ['ID','Rubrique','Priorité','Décision','État','Présent dans le périmètre','Suite à réaliser','Critère de validation','Références du projet'],
  [13,34,10,23,19,64,64,62,55],guideRows,'GuideV4Requirements',16);
guide.tabColor=palette.burgundy;
guide.getRange('A6:B6').merge();guide.getRange('A6').values=[['Rubriques associées']];
guide.getRange('C6').formulas=[['=COUNTA(A17:A46)']];
guide.getRange('D6:E6').merge();guide.getRange('D6').values=[['Campagne globale']];
guide.getRange('F6').values=[['Neuf chapitres, histoire AU distincte']];
guide.getRange('A7:B7').merge();guide.getRange('A7').values=[['Fiches A–J']];
guide.getRange('D7:E7').merge();guide.getRange('D7').values=[['Routes personnelles']];
guide.getRange('F7').values=[[`${metrics.personalRoutesV3} routes V3, ${metrics.personalChaptersV3} duels ; anciennes V1 préservées`]];
guide.getRange('A8:B8').merge();guide.getRange('A8').values=[['Dessins de réserve']];
guide.getRange('C8').formulas=[['=COUNTA(\'Réserves V4\'!$A$6:$A$27)']];
guide.getRange('D8:E8').merge();guide.getRange('D8').values=[['Production V4']];
guide.getRange('F8').values=[['Aucun nouveau dessin ni cycle d’animation']];
guide.getRange('A9:B9').merge();guide.getRange('A9').values=[['Critères de recette']];
guide.getRange('C9').formulas=[['=COUNTA(\'Recette V4\'!$A$6:$A$25)']];
guide.getRange('D9:E9').merge();guide.getRange('D9').values=[['Fidélité 1:1']];
guide.getRange('F9').values=[['Objectif de production ; certification globale absente']];
guide.getRange('A11:B11').merge();guide.getRange('A11').values=[['État de la rubrique']];
guide.getRange('C11').values=[['Nombre']];
const implementationStates=['Intégrée','Partielle','Documentée','Différée'];
for(const [i,state] of implementationStates.entries()){
  const row=12+i;guide.getRange(`A${row}:B${row}`).merge();guide.getRange(`A${row}`).values=[[state]];
  guide.getRange(`C${row}`).formulas=[[`=COUNTIFS($E$17:$E$46,A${row})`]];
}
guide.getRange('A6:F15').format.rowHeight=24;
guide.getRange('C6:C15').setNumberFormat('0');
guide.getRange('C6:C15').format.horizontalAlignment='right';
guide.getRange('A11:C11').format.fill=palette.pale;
guide.getRange('A11:C11').format.font.bold=true;
guide.getRange('E17:E46').dataValidation={rule:{type:'list',values:implementationStates}};
guide.getRange('E17:E46').conditionalFormats.add('containsText',{text:'Différée',format:{fill:'#FFF0D4',font:{color:'#7D4C00'}}});
guide.getRange('E17:E46').conditionalFormats.add('containsText',{text:'Partielle',format:{fill:'#F9E4EB',font:{color:palette.burgundy}}});

const cardRows=cards.flatMap(card=>card.fields.map((field,index)=>[card.id,card.letter+' · '+card.subject,field.label,field.value,index===0?card.status:null]));
table('Fiches V4','Dix fiches de référence A–J','Exemples concrets reliés au moteur et à la bible V3. Les champs non réalisés restent explicites.',
  ['ID','Sujet','Champ','Contenu','État de la fiche'],[21,38,43,130,35],cardRows,'GuideV4Cards');
const campaignRows=[
  [0,runtime.GLOBAL_CAMPAIGN.title,'Continuité',runtime.GLOBAL_CAMPAIGN.continuity],
  [0,runtime.GLOBAL_CAMPAIGN.title,'Prologue',runtime.GLOBAL_CAMPAIGN.intro],
];
runtime.GLOBAL_CAMPAIGN.chapters.forEach((chapter,index)=>{
  for(const [field,value] of [
    ['Identifiant',chapter.id],['Héros',fighterNames.get(chapter.fighterId)],['Adversaire',fighterNames.get(chapter.opponentId)],
    ['Arène',stageNames.get(chapter.stageId)],['Objectif',chapter.objective],['Scène',chapter.scene],
    ['Dialogue',chapter.dialogue.map(d=>`${fighterNames.get(d.speakerId)} : ${d.line}`).join('\n')],
    ['Après victoire',chapter.afterVictory],['Après défaite',chapter.retry],
  ])campaignRows.push([index+1,chapter.title,field,value]);
});
campaignRows.push([10,'Épilogue global','Conclusion',runtime.GLOBAL_CAMPAIGN.ending],[10,'Épilogue global','Prolongement',runtime.GLOBAL_CAMPAIGN.nextHook]);
table('Campagne globale','La nuit du signal libre','Campagne AU en neuf chapitres. Les scènes réemploient décors et portraits ; illustrations dédiées à produire.',
  ['Ordre','Chapitre','Champ','Texte et règle'],[10,43,25,145],campaignRows,'GuideV4GlobalCampaign');
const kindLabels={character_base:'Personnage',enemy_base:'Ennemi',projectile:'Projectile'};
const reserveRows=reserves.assets.map(a=>[a.id,kindLabels[a.kind],a.name,a.dimensions[0],a.dimensions[1],
  'Galerie ; hors combat',a.fidelityNotes.join('\n'),a.master,a.export,a.references.map(r=>r.url).join('\n')]);
table('Réserves V4','22 dessins de réserve','Fichiers issus des vagues G, H et I. Références et limites conservées. Aucun nouveau kit activé par la galerie.',
  ['ID','Catégorie','Identité / incarnation','Largeur px','Hauteur px','Usage V4','Écarts / limites','Master','Export','Références'],
  [32,18,48,13,13,25,85,68,68,70],reserveRows,'GuideV4ReserveAssets');
const validationRows=data.validationCases.map(t=>[t.id,t.requirements.join(', '),t.title,t.scenario,t.expected,t.type,'Recette prévue']);
table('Recette V4','Recette de l’intégration V4','Critères à exécuter sur la révision livrée. Les preuves obtenues restent dans les rapports datés du lot.',
  ['ID','Rubriques','Scénario','Exécution','Résultat attendu','Type','État de cette liste'],
  [16,25,38,78,78,25,22],validationRows,'GuideV4Acceptance');
// Count one nonempty state cell for each distinct card.
guide.getRange('C7').formulas=[[`=COUNTA('Fiches V4'!$E$6:$E$${cardRows.length+5})`]];
guide.getRange('G6:H6').merge();guide.getRange('G6').values=[['Chapitres globaux']];
guide.getRange('I6').formulas=[[`=COUNTIFS('Campagne globale'!$C$6:$C$${campaignRows.length+5},"Héros")`]];
guide.getRange('G7:H7').merge();guide.getRange('G7').values=[['Personnages de réserve']];
guide.getRange('I7').formulas=[['=COUNTIFS(\'Réserves V4\'!$B$6:$B$27,"Personnage")']];
guide.getRange('G8:H8').merge();guide.getRange('G8').values=[['Ennemis de réserve']];
guide.getRange('I8').formulas=[['=COUNTIFS(\'Réserves V4\'!$B$6:$B$27,"Ennemi")']];
guide.getRange('G9:H9').merge();guide.getRange('G9').values=[['Projectiles de réserve']];
guide.getRange('I9').formulas=[['=COUNTIFS(\'Réserves V4\'!$B$6:$B$27,"Projectile")']];
guide.getRange('G6:I9').format.rowHeight=24;
guide.getRange('I6:I9').setNumberFormat('0');
guide.getRange('I6:I9').format.horizontalAlignment='right';
wb.recalculate();
const summaryActual={sections:guide.getRange('C6').values[0][0],cards:guide.getRange('C7').values[0][0],reserves:guide.getRange('C8').values[0][0],cases:guide.getRange('C9').values[0][0],chapters:guide.getRange('I6').values[0][0],characters:guide.getRange('I7').values[0][0],enemies:guide.getRange('I8').values[0][0],projectiles:guide.getRange('I9').values[0][0]};
assert.deepEqual(summaryActual,{sections:30,cards:10,reserves:22,cases:20,chapters:9,characters:13,enemies:8,projectiles:1});
const statusCounts=implementationStates.map((state,i)=>({state,expected:requirements.filter(r=>r.implementation===state).length,actual:guide.getRange(`C${12+i}`).values[0][0]}));
assert(statusCounts.every(x=>x.expected===x.actual));
// A small reversible edit verifies that the summary really follows editable statuses.
const originalState=guide.getRange('E17').values[0][0];
guide.getRange('E17').values=[['Différée']];
assert.equal(guide.getRange('C15').values[0][0],requirements.filter(r=>r.implementation==='Différée').length+1);
guide.getRange('E17').values=[[originalState]];
wb.recalculate();
assert.equal(guide.getRange('C15').values[0][0],requirements.filter(r=>r.implementation==='Différée').length);
const inspected=await wb.inspect({kind:'table',range:'Guide V4!A6:I15',include:'values,formulas',tableMaxRows:10,tableMaxCols:9,maxChars:7000});
await fs.writeFile(path.join(outputDir,'summary-inspection.ndjson'),inspected.ndjson);
const errors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'New V4 sheets formula-error scan',maxChars:4000});
await fs.writeFile(path.join(outputDir,'formula-errors.ndjson'),errors.ndjson);
const additionsPath=path.join(process.cwd(),'infernal-guide-v4-additions.xlsx');
await (await SpreadsheetFile.exportXlsx(wb)).save(additionsPath);
const finalPath=path.join(outputDir,'INFERNAL_VERSUS_BIBLE_V4.xlsx');
const packageReport=path.join(outputDir,'workbook-package-report.json');
const packaged=spawnSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON??'python3',[path.join(here,'append-guide-workbook.py'),baselinePath,additionsPath,finalPath,packageReport],{encoding:'utf8'});
assert.equal(packaged.status,0,packaged.stderr||packaged.stdout);
console.log(packaged.stdout.trim());
const packaging=JSON.parse(await fs.readFile(packageReport,'utf8'));
assert.equal(packaging.finalSheetCount,34);
assert.equal(packaging.preservedWorksheetXmlParts,29);
assert.equal(packaging.newFormulaErrorCells,0);

const finalBook=await SpreadsheetFile.importXlsx(await FileBlob.load(finalPath));
const previewRanges=[
  ['Guide V4','A1:I20','guide-summary'],['Guide V4','F16:I20','guide-detail'],['Guide V4','A37:E46','guide-final-sections'],
  ['Fiches V4','A1:E11','cards-project'],['Fiches V4','A42:E49','cards-action'],['Fiches V4',`A${cardRows.length-2}:E${cardRows.length+5}`,'cards-asset'],
  ['Campagne globale','A1:D10','campaign-opening'],['Campagne globale','A43:D50','campaign-middle'],['Campagne globale',`A${campaignRows.length}:D${campaignRows.length+5}`,'campaign-ending'],
  ['Réserves V4','A1:J12','reserves-catalogue'],['Réserves V4','G15:J18','reserves-limits'],['Réserves V4','A20:F27','reserves-last'],
  ['Recette V4','A1:G10','acceptance-opening'],['Recette V4','A20:G25','acceptance-last'],
];
const rendered=[];
for(const [sheetName,range,label] of previewRanges){
  const preview=await finalBook.render({sheetName,range,scale:1,format:'png'});
  const file=path.join(outputDir,label+'.png');await fs.writeFile(file,new Uint8Array(await preview.arrayBuffer()));
  rendered.push({sheetName,range,file});
}
const dataReport={
  date:GUIDE_DATE,edition:GUIDE_EDITION,baselineCommit:BASELINE_COMMIT,
  sourceGuide:{bytes:guideBytes.length,sha256:GUIDE_SHA256,unchanged:true},
  requirements:requirements.length,templates:cards.length,templateFields:cards.reduce((sum,c)=>sum+c.fields.length,0),
  verifiedProjectReferences:sourceReferences.size,individualRoutesCompared:narratives.length,individualChaptersCompared:metrics.personalChaptersV3,
  globalChapterReferencesChecked:metrics.globalChapters,reserveRecords:reserves.assets.length,transitionDestinationsChecked:transitionDesign.length,
  metrics,validation:'passed',fidelityOneToOneCertified:false,
  limitations:['Structural association only. Gameplay, browser and fidelity tests are reported separately.','No new drawing or animation generated by this documentation build.'],
};
const workbookReport={
  ...packaging,date:GUIDE_DATE,edition:GUIDE_EDITION,summaryActual,statusCounts,
  recalculation:'Artifact Tool; status edit/recalculate/restore verified',
  renderedViews:rendered,visualReview:'pending human/agent image inspection',
  baselineRender:path.join(outputDir,'baseline-v3-guide.png'),
  finalFileBytes:(await fs.stat(finalPath)).size,
  nativeExcelRecalculation:'not_run',
};
await fs.writeFile(path.join(here,'QA_GUIDE_DATA_V4_2026-11-25.json'),JSON.stringify(dataReport,null,2)+'\n');
await fs.writeFile(path.join(here,'QA_GUIDE_WORKBOOK_V4_2026-11-25.json'),JSON.stringify(workbookReport,null,2)+'\n');
await fs.copyFile(finalPath,path.join(here,'INFERNAL_VERSUS_BIBLE_V4.xlsx'));
console.log(JSON.stringify({output:finalPath,metrics,summaryActual,statusCounts,views:rendered.length}));
