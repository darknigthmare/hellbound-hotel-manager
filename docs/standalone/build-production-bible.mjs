import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

// Run from an npm ci checkout with the Codex primary runtime, or install
// @oai/artifact-tool alongside this script. Optional second argument holds QA images.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const destination = process.argv[2] ?? here;
const previews = process.argv[3];
const require = createRequire(import.meta.url);
const artifactPath = require.resolve('@oai/artifact-tool', {
  paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, here].filter(Boolean),
});

const design = JSON.parse(await fs.readFile(path.join(here, 'extension-plan.json'), 'utf8')).productionBible;
async function collectRuntimeTables(){
const { createServer } = await import('vite');
const server = await createServer({ root, configFile: false, logLevel: 'error', appType: 'custom', server: { middlewareMode: true, hmr: false } });
let runtime;
try {
  const modules = await Promise.all([
    'standalone/roster', 'standalone/campaign', 'lib/pentagram-fighters',
    'lib/pentagram-combat', 'lib/pentagram-stages', 'lib/infernal-finishers',
  ].map(module => server.ssrLoadModule('/src/' + module + '.ts')));
  runtime = Object.assign({}, ...modules);
} finally {
  await server.close();
}
const fighters = runtime.STANDALONE_ROSTER;
const stages = new Map(runtime.STANDALONE_STAGES.map(stage => [stage.id, stage]));
const names = new Map(fighters.map(fighter => [fighter.character.id, fighter.character.name]));
const actions = { light: 'Léger', heavy: 'Lourd', special: 'Spécial' };
const inputs = { light: 'F / J', heavy: 'G / K', special: 'H / L' };
const kinds = { intro: 'Prologue', rival: 'Rivalité', ending: 'Épilogue' };
const effects = { radio:'Radio', signal:'Signal vidéo', halo:'Halo', embers:'Braises', blade:'Lame', frost:'Givre', curtain:'Rideau', shadow:'Ombre' };
const routes = [], chapters = [], moves = [], signatures = [], finishes = [], pictures = [];
for (const fighter of fighters) {
  const {character: {id, name}, profile} = fighter;
  const route = runtime.STORY_ROUTES[id];
  const card = design.fighterDesign.find(entry => entry.fighter === id);
  assert(route && card && runtime.INFERNAL_FINISHES[id], 'Fiche incomplète pour ' + id);
  const { title, intro, ending } = route;
  const rival = names.get(route.chapters[2].opponent);
  routes.push([name, fighter.franchise, title, intro, rival, ending]);
  for (const [index, chapter] of route.chapters.entries()) {
    assert(names.has(chapter.opponent) && stages.has(chapter.stage), 'Chapitre invalide pour ' + id);
    chapters.push([name, index + 1, index === 2 ? 'Rival' : 'Rencontre', names.get(chapter.opponent), stages.get(chapter.stage).name, chapter.scene]);
  }
  const definition = runtime.buildCombatantDefinition(fighter.character, profile);
  for (const [action, label] of Object.entries(actions)) {
    const spec = runtime.getCombatMoveInfo(definition, action);
    moves.push([name, label, spec.name, inputs[action], spec.startupMs, null, spec.actionMs, spec.recoveryMs, spec.cooldownMs, spec.hitstunMs, spec.reach, spec.tensionCost]);
  }
  signatures.push([name, card.signature, card.input, card.effect, card.counter, 'À prototyper']);
  const finish = runtime.INFERNAL_FINISHES[id];
  const pose='/assets/sprites/finishers/'+id+'.webp';
  const poseExists=await fs.access(path.join(root, 'public', pose)).then(()=>true,()=>false);
  finishes.push([name, finish.title, effects[finish.effect], card.finisher, card.storyboard, card.lastImage, 'À animer',poseExists?pose:'']);
  for (const [kind, label] of Object.entries(kinds)) {
    const image = runtime.storyIllustration(id, kind);
    if (image) await fs.access(path.join(root, 'public', image));
    const brief = kind === 'intro' ? intro : kind === 'rival' ? route.chapters[2].scene : ending;
    pictures.push([name, label, kind === 'rival' ? rival : name, brief, image ? 'Illustration dédiée' : 'Décor et portraits', image ?? '']);
  }
}
const sets = [
  ['Modes V2', 'Règles des modes de jeu', 'Les modes proposés constituent une spécification. Les filtres et le choix du combattant déterminent les parcours accessibles.', ['Mode','État','Sélection','Règles et déroulé','Progression','Critère de recette'], [24,24,44,58,46,65], design.modeDesign.map(r=>[r.name,r.status,r.selection,r.rules,r.progress,r.check])],
  ['Histoires', 'Histoires des combattants', 'Texte du jeu. Chaque parcours est une fiction originale d’Infernal Versus.', ['Combattant','Univers','Titre du parcours','Prologue','Rival final','Épilogue'], [27,21,38,62,25,62], routes],
  ['Duels de campagne','Déroulé des confrontations','Les rencontres apparaissent dans leur ordre de jeu. Le troisième duel conclut la rivalité.', ['Protagoniste','Duel','Rencontre','Adversaire','Arène','Mise en scène jouable'],[27,12,16,26,35,72],chapters],
  ['Données moteur','Temps, portée et tension des attaques','Le moteur mesure en millisecondes. L’équivalent à 60 Hz est arrondi au supérieur. L’impact est évalué une fois. La portée est un pourcentage de la largeur de l’arène.', ['Combattant','Attaque','Nom en jeu','Touche J1 / J2','Départ → impact (ms)','Impact à 60 Hz (images)','Action totale (ms)','Après impact (ms)','Recharge depuis départ (ms)','Étourdissement (ms)','Portée (% de largeur)','Coût tension'],[26,15,33,18,19,22,18,18,23,22,17,16],moves],
  ['Techniques à produire','Techniques signatures à prototyper','Les commandes sont des intentions de design. Avant et arrière sont relatifs au regard du combattant.', ['Combattant','Nouvelle technique','Commande proposée','Effet et rôle','Indice visuel et réponse','État'],[27,33,31,68,67,19],signatures],
  ['Finitions','Finitions en jeu et storyboards individuels','K.-O. décisif. Fenêtre de commande ' + runtime.FINISH_INPUT_MS + ' ms, mise en scène ' + runtime.FINISH_CINEMATIC_MS + ' ms. Les colonnes D à G détaillent une variante longue à produire.', ['Combattant','Finition en jeu','Effet en jeu','Variante longue proposée','Découpage proposé','Dernier plan proposé','État variante','Pose clé dédiée disponible'],[27,37,21,38,65,52,19,48],finishes],
  ['Plans des arènes','Arènes et profondeur de champ','Les fichiers existants sont relevés dans le registre des arènes. Les compositions de plans sont des indications pour la production.', ['Arène','État en jeu','Fond · direction','Médian · direction','Avant-plan / sol · direction','Animation proposée','Composition du duel','Repérage critique','Ressources en jeu'],[27,29,42,42,44,44,55,56,65],design.stageDesign.map(r=>{
    const stage=stages.get(r.id);
    const scenery=stage?.scenery;
    return [r.name,scenery?'Trois plans en jeu':stage?'Fond en jeu, calques à produire':'À produire',r.back,r.middle,r.floor,r.ambient,r.composition,r.reference,stage?[stage.imagePath,scenery?.middle,scenery?.near].filter(Boolean).join('\n'):''];
  })],
  ['Illustrations','Couverture des illustrations de campagne','Une ligne par affectation. Un même dessin de rivalité peut servir aux deux adversaires. Les images dédiées attendent une validation visuelle sur référence.', ['Combattant','Moment','Sujet / adversaire','Brief issu de la scène en jeu','Présentation dans le jeu','Fichier dédié'],[27,18,27,74,31,58],pictures],
  ['Atelier et recette','Systèmes, production et recette','Les scénarios de recette indiquent quoi tester. Les cibles d’animation et de performance doivent être mesurées dans le jeu.', ['Domaine','Sujet','État','Spécification','Contrôle à effectuer'],[23,36,26,77,79],design.workshop.map(r=>[r.type,r.subject,r.status,r.spec,r.acceptance])],
  ['Références V2','Références et périmètre de preuve','Les URL officielles servent au repérage. Les scènes, affrontements et valeurs de combat sont des créations de jeu.', ['Origine','Référence','Usage dans le classeur','Lien ou chemin'],[23,37,70,86],design.sources],
];

return {sets, fighterCount:fighters.length, expectedFrames:Math.ceil(moves.at(-1)[4]*60/1000)};
}
if(process.argv[2]==='--read-game'){
  process.stdout.write(JSON.stringify(await collectRuntimeTables()));
  process.exit(0);
}
const child=process.env.IV_BIBLE_RUNTIME_SNAPSHOT ? {status:0,stdout:await fs.readFile(process.env.IV_BIBLE_RUNTIME_SNAPSHOT,'utf8')} : spawnSync(process.execPath,[fileURLToPath(import.meta.url),'--read-game'],{encoding:'utf8',maxBuffer:4*1024*1024});
if(child.status!==0)throw Error(child.stderr||'Lecture du code interrompue.');
const {sets,fighterCount,expectedFrames}=JSON.parse(child.stdout);
process.env.DOTNET_PROCESSOR_COUNT ??= '2';
process.env.COMPlus_gcServer ??= '0';
process.env.DOTNET_GCHeapHardLimit ??= '20000000';
const moves=sets.find(([name])=>name==='Données moteur')[5],pictures=sets.find(([name])=>name==='Illustrations')[5];
const {Workbook,SpreadsheetFile}=await import(pathToFileURL(artifactPath));
const working=await fs.mkdtemp(path.join(os.tmpdir(),'infernal-bible-'));
const baseline=path.join(here,'HAZBIN_HELLUVA_COMBAT_EXTENSION_V1.xlsx');
const wb=Workbook.create();
const guide=wb.worksheets.add('Guide V2');
const sheets=new Map(sets.map(([name])=>[name,wb.worksheets.add(name)]));
const palette={burgundy:'#54233F',ink:'#292332',muted:'#665C68',gold:'#B38839',pale:'#F8F3F6',line:'#DCC9D4'};
const column=n=>String.fromCharCode(65+n);
function drawnTable(sheet, title, note, headers, widths, rows, tableName) {
  const last=column(headers.length-1), end=rows.length+5;
  sheet.showGridLines=false;
  sheet.getRange('A1:'+last+end).format.font={name:'Arial',size:10,color:palette.ink};
  sheet.getRange('A2').values=[[title]];
  sheet.getRange('A2').format.font={name:'Arial',size:16,bold:true,color:palette.burgundy};
  sheet.getRange('A2:'+last+'2').format.rowHeight=30;
  sheet.getRange('A3:'+last+'3').format.rowHeight=6;
  sheet.getRange('A3:'+last+'3').format.borders={bottom:{style:'thin',color:palette.gold}};
  sheet.getRange('A4').values=[[note]];
  sheet.getRange('A4').format.font={name:'Arial',size:10,italic:true,color:palette.muted};
  sheet.getRange('A4:'+last+'4').format.rowHeight=24;
  const matrix=[headers,...rows];
  const bounds='A5:'+last+end;
  sheet.getRange(bounds).values=matrix;
  const table=sheet.tables.add(bounds,true,tableName);
  table.style='TableStyleLight1';
  table.showFilterButton=true;
  sheet.getRange('A5:'+last+'5').format={fill:palette.burgundy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},horizontalAlignment:'center',verticalAlignment:'center',wrapText:true,rowHeight:36};
  sheet.getRange('A6:'+last+end).format.wrapText=true;
  sheet.getRange('A6:'+last+end).format.verticalAlignment='top';
  for(const [i,width] of widths.entries()) sheet.getRange(column(i)+'1:'+column(i)+end).format.columnWidth=width;
  for(const [i,row] of rows.entries()) {
    const lines=Math.max(...row.map((value,j)=>String(value??'').split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/(widths[j]*0.87))),0)));
    const range=sheet.getRange('A'+(i+6)+':'+last+(i+6));
    range.format.rowHeight=Math.max(26,15*lines+9);
    if(i%2===0)range.format.fill=palette.pale;
  }
  sheet.freezePanes.freezeRows(5);
}
for (const [i,[name,title,note,headers,widths,rows]] of sets.entries()) {
  console.log('Mise en page', name);
  drawnTable(sheets.get(name),title,note,headers,widths,rows,'ProdV2Table'+i);
}
const dataSheet=sheets.get('Données moteur');
dataSheet.getRange('F6:F'+(moves.length+5)).formulas=moves.map((_,i)=>['=ROUNDUP(E'+(i+6)+'*60/1000,0)']);
dataSheet.getRange('K6:K'+(moves.length+5)).setNumberFormat('0.00');
const guideRows=[
  ['Modes V2','Modes décrits',null,'Lire en priorité « État ». Les modes d’extension sont identifiés parmi les modes de l’édition de référence et les chantiers.'],
  ['Histoires','Routes scénarisées',null,'Lire le prologue et l’épilogue, puis consulter les trois rencontres dans Duels de campagne.'],
  ['Duels de campagne','Confrontations',null,'Trier par protagoniste et numéro. Le rival occupe le dernier chapitre.'],
  ['Données moteur','Attaques paramétrées',null,'Contrôler départ, contact, récupération et recharge. La simulation utilise des millisecondes.'],
  ['Techniques à produire','Techniques proposées',null,'Lire la commande, le rôle et le moyen de contrer la signature avant de l’animer.'],
  ['Finitions','Variantes longues à dessiner',null,'Les colonnes B et C identifient l’effet en jeu. Les autres colonnes décrivent une séquence en projet.'],
  ['Plans des arènes','Lieux détaillés',null,'Les fichiers en jeu et le travail de découpe artistique sont renseignés pour chaque lieu.'],
  ['Illustrations','Affectations de scène',null,'Compter les affectations des prologues, rivalités et épilogues. Une illustration partagée apparaît sur plusieurs lignes.'],
  ['Illustrations','Affectations dédiées',null,'Une image dédiée existe. La revue du dessin, de la saison et du costume reste une étape distincte.'],
  ['Illustrations','Affectations à illustrer',null,'Le jeu compose actuellement un décor et les portraits existants pour ces scènes.'],
  ['Atelier et recette','Fiches de travail',null,'Faire valider silhouettes, pieds, plans d’arène, effets de fin et lisibilité sur téléphone.'],
  ['Références V2','Sources de travail',null,'Associer toute décision de fidélité à une scène et à une incarnation. Les scénarios de tournoi et de campagne sont originaux.'],
];
drawnTable(guide,'Infernal Versus · Guide de la V2','18 novembre 2026 · Les onze derniers onglets conservent intégralement les registres de la V1.', ['Onglet','Mesure','Nombre','Mode de lecture'],[28,35,15,92],guideRows,'ProdV2Guide');
guide.tabColor=palette.burgundy;
for(const [i,row] of guideRows.entries()){
  const condition=i===8?'Illustration dédiée':i===9?'Décor et portraits':null;
  const rowCount=sets.find(([name])=>name===row[0])[5].length;
  const end=rowCount+5;
  const formula=condition?`=COUNTIF('Illustrations'!$E$6:$E${end},"${condition}")`:`=COUNTA('${row[0]}'!$A$6:$A${end})`;
  guide.getCell(i+5,2).formulas=[[formula]];
}
console.log('Recalcul.');
wb.recalculate();
assert.equal(guide.getRange('C7').values[0][0],fighterCount);
assert.equal(guide.getRange('C9').values[0][0],fighterCount*3);
assert.equal(guide.getRange('C14').values[0][0]+guide.getRange('C15').values[0][0],pictures.length);

assert.equal(dataSheet.getRange('F'+(moves.length+5)).values[0][0],expectedFrames);
console.log('Inspection.');
const issues=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:60},summary:'Vérification des cellules'});
if (issues.ndjson.includes('"kind":"match"')) throw Error('Erreur de formule : '+issues.ndjson);
console.log((await wb.inspect({kind:'region',sheetId:'Guide V2',range:'A6:C17',maxChars:2700})).ndjson);
await fs.mkdir(destination,{recursive:true});
if(global.gc)global.gc();
console.log('Export Excel',Math.round(process.memoryUsage().rss/1024/1024)+' Mio');
const blob=await SpreadsheetFile.exportXlsx(wb);
const generated=path.join(working,'generated.xlsx');
await blob.save(generated);
const joined=spawnSync('python3',[path.join(here,'attach-legacy-registers.py'),baseline,generated,path.join(destination,'INFERNAL_VERSUS_BIBLE_V2.xlsx')],{encoding:'utf8'});
if(joined.status!==0) throw Error(joined.stderr);

await fs.rm(working,{recursive:true,force:true});
if(previews){
  await fs.mkdir(previews,{recursive:true});
  for(const sheet of [guide,...sheets.values()]) {
    const png=await wb.render({sheetName:sheet.name,range:'A1:D9',scale:0.8});
    await fs.writeFile(path.join(previews,sheet.name+'.png'),new Uint8Array(await png.arrayBuffer()));
  }
}
