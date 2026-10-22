import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

// Usage: primary-runtime-node build-workbook.mjs extension-plan.json output-directory
// Authoring dependency: @oai/artifact-tool from the Codex primary runtime.
const dataset=process.argv[2]||path.join(path.dirname(fileURLToPath(import.meta.url)),'extension-plan.json');
const outputDir=process.argv[3]||path.dirname(dataset);
const d=JSON.parse(await fs.readFile(dataset,'utf8'));
await fs.mkdir(outputDir,{recursive:true});
const wb=Workbook.create();
const palette={ink:'#26212B',burgundy:'#54233F',red:'#8E2946',gold:'#B38839',muted:'#68616E',line:'#DCD5DC',pale:'#F7F3F6',amber:'#FFF1CB'};
const statuses=['Existant','Ajout PR','Partiel','À produire','À vérifier'];
const configs=[
 {name:'Chantiers',key:'tasks',title:'Chantiers de production',note:'Priorités et lots proposés. Modifier le statut uniquement avec une preuve; S/M/L/XL sont des tailles relatives, pas des délais.',freeze:3,columns:[['ID','id',16],['Domaine','domain',19],['Chantier','title',35],['Contenu','detail',66],['Priorité','priority',11],['Statut','status',16],['Lot','lot',10],['Effort','effort',11],['Dépendances','depends',28],['Critère de recette','acceptance',76],['Sources','source',32],['Preuve code','path',42]]},
 {name:'Parité CQC',key:'parity',title:'Correspondance avec CQC',note:'Référence CQC inspectée par lecture de code et menus. Les tests CQC historiques ne sont pas repris comme résultats de cette PR.',freeze:2,columns:[['ID','id',16],['Système CQC','system',31],['Preuve CQC','cqcEvidence',60],['Adaptation Hazbin / Helluva','hazbinProposal',64],['Priorité','priority',11],['Statut','status',16],['État et limites','hazbinState',66],['Critère de recette','acceptance',65],['Source','sourceId',22]]},
 {name:'Personnages',key:'roster',title:'Personnages et rôle dans le jeu',note:'209 fiches du dépôt. Le statut porte sur leur intégration au combat; une fiche ou un atlas ne vaut pas kit complet. Les concepts restent des adaptations.',freeze:3,columns:[['ID dépôt','id',31],['Univers','franchise',20],['Personnage','name',31],['Importance','tier',16],['Cible','target',35],['Statut','status',16],['Fiche / assets','asset',25],['Kit actuel','kit',37],['Continuité','continuity',21],['Statut lore du dépôt','canon',26],['Faits documentés','loreFacts',64],['Concept de combat proposé','proposedKit',64],['Prochaine action','next',74],['Niveau de preuve','loreEvidence',62],['Référence du dépôt','reference',58],['Sources','source',38]]},
 {name:'Kits combat',key:'kits',title:'Valeurs des kits de combat',note:'36 kits du code, dont 34 accessibles en V1. Les scores sont des réglages de gameplay, pas des puissances canon ni des dégâts finaux. Éditer ce fichier ne modifie pas automatiquement le jeu.',freeze:3,columns:[['ID','id',30],['Personnage','name',31],['Univers','franchise',20],['Style','style',34],['Archétype','archetype',35],['Statut','status',16],['Dans le roster V1','runtime',29],['Puissance (score)','power',18],['Portée (score)','range',18],['Vitesse (score)','speed',18],['Garde (score)','guard',18],['Tension de base','tensionGain',18],['Inspiration','evidence',24],['Sources','source',26]]},
 {name:'Variantes',key:'variants',title:'Costumes, formes et incarnations',note:'Variantes proposées à produire. Les designs et épisodes doivent être comparés visuellement avant tout engagement de fidélité 1:1.',freeze:2,columns:[['ID','id',16],['Personnage ID','fighter',30],['Variante','name',43],['Type','type',21],['Référence','reference',27],['Statut','status',16],['Priorité','priority',11],['Lot','lot',10],['Exigences visuelles','requirements',71],['Preuve canon','canonEvidence',42],['Critère de recette','acceptance',74],['Sources','source',27]]},
 {name:'Techniques',key:'techniques',title:'Techniques et kits nommés',note:'108 actions du code, dont 102 en V1 et 6 issues des deux kits AU. Portée en unités du moteur; durée totale en ms. Noms et valeurs sont des adaptations.',freeze:2,columns:[['ID','id',38],['Personnage ID','fighter',30],['Technique','name',36],['Action','slot',19],['Style','style',32],['Statut','status',16],['Inspiration','evidence',24],['Dans le roster V1','runtime',29],['Portée moteur','reach',18],['Durée totale (ms)','durationMs',20],['Référence','reference',62],['Prochaine action','next',73],['Sources','source',26]]},
 {name:'Arènes',key:'stages',title:'Arènes actuelles et extensions',note:'Huit arènes du moteur existant. Les autres lignes sont des projets de lieux avec géométrie de gameplay à produire.',freeze:2,columns:[['ID','id',30],['Arène','name',34],['Univers','franchise',20],['Lieu','place',30],['Priorité','priority',11],['Statut','status',16],['Lot','lot',10],['Référence et limite','reference',72],['Composition proposée','design',68],['Asset existant','asset',61],['Critère de recette','acceptance',76],['Sources','source',32]]},
 {name:'Parcours',key:'campaigns',title:'Parcours, contrats et archives',note:'Les contrats du manager existent comme contenu de gestion. Leur adaptation en niveaux de combat et les archives d’épisodes restent à produire.',freeze:2,columns:[['ID','id',33],['Parcours','title',45],['Univers','franchise',20],['Format','kind',24],['Priorité','priority',11],['Statut','status',16],['Lot','lot',10],['Casting / contenu','cast',64],['Contexte / publication','context',53],['Adaptation proposée','design',78],['Critère de recette','acceptance',78],['Sources','source',29]]},
 {name:'Recette',key:'qa',title:'Recette et preuves attendues',note:'Un scénario planifié ne constitue pas un test passé. Renseigner résultat et preuve après l’exécution sur la version indiquée.',freeze:2,columns:[['ID','id',16],['Domaine','domain',20],['Scénario','scenario',35],['Étapes','steps',68],['Priorité','priority',11],['Statut','status',16],['Résultat attendu','expected',73],['Méthode','method',37],['Preuve / résultat','evidence',69],['Sources','source',26]]},
];
const sheets=new Map([['Synthèse',wb.worksheets.add('Synthèse')],...configs.map(c=>[c.name,wb.worksheets.add(c.name)]),['Sources',wb.worksheets.add('Sources')]]);
function col(n){let s='';for(let q=n+1;q;q=Math.floor((q-1)/26))s=String.fromCharCode(65+(q-1)%26)+s;return s;}
function baseSheet(s,title,note,lastCol,endRow){
  s.showGridLines=false;
  s.getRange(`A1:${lastCol}${endRow}`).format.font={name:'Arial',size:11,color:palette.ink};
  s.getRange(`A1:${lastCol}${endRow}`).format.verticalAlignment='center';
  s.getRange('A2').values=[[title]];s.getRange('A2').format.font={name:'Arial',size:16,bold:true,color:palette.burgundy};
  s.getRange(`A2:${lastCol}2`).format.rowHeight=27;
  s.getRange(`A3:${lastCol}3`).format.borders={bottom:{style:'thin',color:palette.gold}};
  s.getRange('A4').values=[[note]];s.getRange('A4').format.font={name:'Arial',size:11,italic:true,color:palette.muted};
  s.getRange(`A4:${lastCol}4`).format.rowHeight=23;
}
function cfStatus(range,column,start){
  const fills={'Existant':['#E7F1E9','#285C39'],'Ajout PR':['#E6EEF9','#214C7E'],'Partiel':['#FFF0C6','#775016'],'À produire':['#F2EDF2','#625368'],'À vérifier':['#FBE4E4','#883333']};
  for(const [state,[fill,color]]of Object.entries(fills))range.conditionalFormats.addCustom(`=$${column}${start}="${state}"`,{fill,font:{color,bold:true}});
}
const summaryMeta=[];
for(const cfg of configs){
  const s=sheets.get(cfg.name),rows=d[cfg.key],last=col(cfg.columns.length-1),end=rows.length+5;
  baseSheet(s,cfg.title,cfg.note,last,end);
  const matrix=[cfg.columns.map(c=>c[0]),...rows.map(row=>cfg.columns.map(c=>row[c[1]]??''))];
  s.getRange(`A5:${last}${end}`).values=matrix;
  const table=s.tables.add(`A5:${last}${end}`,true,`Tbl${cfg.key}`);table.style='TableStyleLight1';table.showFilterButton=true;
  s.getRange(`A5:${last}5`).format={fill:palette.burgundy,font:{name:'Arial',size:11,bold:true,color:'#FFFFFF'},wrapText:true,horizontalAlignment:'center',verticalAlignment:'center',rowHeight:32};
  s.getRange(`A6:${last}${end}`).format.wrapText=true;s.getRange(`A6:${last}${end}`).format.verticalAlignment='top';
  cfg.columns.forEach((c,i)=>s.getRange(`${col(i)}1:${col(i)}${end}`).format.columnWidth=c[2]);
  for(let i=0;i<rows.length;i++){
    const r=i+6;const maxLines=Math.max(...cfg.columns.map((c,j)=>Math.max(1,...String(matrix[i+1][j]).split('\n').map(x=>Math.ceil(x.length/Math.max(8,c[2]-3))))));
    s.getRange(`A${r}:${last}${r}`).format.rowHeight=Math.max(29,maxLines*14+8);
  }
  const statusIndex=cfg.columns.findIndex(c=>c[1]==='status'),statusColumn=col(statusIndex);
  s.getRange(`${statusColumn}6:${statusColumn}${end}`).dataValidation={rule:{type:'list',values:statuses}};
  cfStatus(s.getRange(`${statusColumn}6:${statusColumn}${end}`),statusColumn,6);
  const p=cfg.columns.findIndex(c=>c[1]==='priority');if(p>=0){const r=s.getRange(`${col(p)}6:${col(p)}${end}`);r.dataValidation={rule:{type:'list',values:['P0','P1','P2','P3']}};r.conditionalFormats.addCustom(`=$${col(p)}6="P0"`,{fill:'#FBE6EA',font:{color:palette.red,bold:true}});}
  const lot=cfg.columns.findIndex(c=>c[1]==='lot');if(lot>=0)s.getRange(`${col(lot)}6:${col(lot)}${end}`).dataValidation={rule:{type:'list',values:['V1','V2','V3','V4']}};
  const effort=cfg.columns.findIndex(c=>c[1]==='effort');if(effort>=0)s.getRange(`${col(effort)}6:${col(effort)}${end}`).dataValidation={rule:{type:'list',values:['S','M','L','XL']}};
  for(const key of ['power','range','speed','guard','tensionGain','durationMs']){const n=cfg.columns.findIndex(c=>c[1]===key);if(n>=0)s.getRange(`${col(n)}6:${col(n)}${end}`).setNumberFormat('#,##0');}
  const reach=cfg.columns.findIndex(c=>c[1]==='reach');if(reach>=0)s.getRange(`${col(reach)}6:${col(reach)}${end}`).setNumberFormat('0.0');
  s.freezePanes.freezeRows(5);s.freezePanes.freezeColumns(cfg.freeze);
  summaryMeta.push({name:cfg.name,key:cfg.key,statusColumn,count:rows.length});
}

const ss=sheets.get('Sources');
baseSheet(ss,'Sources et versions','Source primaire = publication officielle. Les wikis sont des repères de scène; les fichiers GitHub prouvent l’état de code décrit.','F',d.sources.length+13);
ss.getRange('A5:F5').values=[['ID','Type','Source','Référence / chemin','Portée et limite','URL']];
ss.getRange(`A6:F${d.sources.length+5}`).values=d.sources;
const st=ss.tables.add(`A5:F${d.sources.length+5}`,true,'TblSources');st.style='TableStyleLight1';st.showFilterButton=true;
ss.getRange('A5:F5').format={fill:palette.burgundy,font:{name:'Arial',size:11,bold:true,color:'#FFFFFF'},wrapText:true,horizontalAlignment:'center',rowHeight:32};
[24,24,64,62,89,98].forEach((w,i)=>ss.getRange(`${col(i)}1:${col(i)}${d.sources.length+5}`).format.columnWidth=w);
ss.getRange(`A6:F${d.sources.length+5}`).format.wrapText=true;
ss.getRange(`A6:F${d.sources.length+5}`).format.verticalAlignment='top';
for(let i=0;i<d.sources.length;i++){const row=i+6,max=Math.max(...d.sources[i].map((x,j)=>Math.ceil(String(x).length/([24,24,64,62,89,98][j]-3))));ss.getRange(`A${row}:F${row}`).format.rowHeight=Math.max(42,max*14+8);}
ss.freezePanes.freezeRows(5);ss.freezePanes.freezeColumns(1);
const versionRow=d.sources.length+8;
ss.getRange(`A${versionRow}`).values=[['Versions de référence']];
ss.getRange(`A${versionRow}`).format.font={name:'Arial',size:12,bold:true,color:palette.burgundy};
const versions=[
 ['Base Hazbin',d.meta.baseRepository,d.meta.baseCommit,'Fichiers existants liés au commit immuable.'],
 ['Ajouts de cette PR',d.meta.implementation.branch,'Entrée '+d.meta.implementation.entryPath,'Les liens de branche suivent les mises à jour de la PR.'],
 ['CQC le plus récent',d.meta.cqcBranch,d.meta.cqcCommit,'Dernière tête parmi les sept branches inspectées.'],
 ['CQC code inspecté',d.meta.cqcRepository,d.meta.cqcInspectedCommit,'Arbre identique à la tête fusionnée; tests CQC non rejoués.'],
];
ss.getRange(`A${versionRow+1}:D${versionRow+4}`).values=versions;
ss.getRange(`A${versionRow+1}:D${versionRow+4}`).format.wrapText=true;
ss.getRange(`A${versionRow+1}:F${versionRow+4}`).format.rowHeight=48;

const s=sheets.get('Synthèse');
baseSheet(s,'Hellbound — Infernal Versus','Plan d’extension Hazbin Hotel et Helluva Boss. État de référence : 21 octobre 2026.','H',43);
s.tabColor=palette.burgundy;
[29,13,13,13,13,15,15,4].forEach((w,i)=>s.getRange(`${col(i)}1:${col(i)}42`).format.columnWidth=w);
s.getRange('A5:G5').values=[['Registre','Lignes','Existant','Ajout PR','Partiel','À produire','À vérifier']];
s.getRange('A5:G5').format={fill:palette.burgundy,font:{name:'Arial',size:11,bold:true,color:'#FFFFFF'},horizontalAlignment:'center',wrapText:true,rowHeight:33};
summaryMeta.forEach((m,i)=>{const row=i+6;s.getRange(`A${row}`).values=[[m.name]];s.getRange(`B${row}`).formulas=[[`=COUNTA('${m.name}'!$A$6:$A$5000)`]];s.getRange(`C${row}:G${row}`).formulas=[[...statuses.map((_,j)=>`=COUNTIFS('${m.name}'!$${m.statusColumn}$6:$${m.statusColumn}$5000,${col(j+2)}$5)`)]];s.getRange(`A${row}:G${row}`).format.rowHeight=29;if(i%2===0)s.getRange(`A${row}:G${row}`).format.fill=palette.pale;});
s.getRange('B6:G14').setNumberFormat('#,##0');
s.getRange('A16').values=[['Lecture des statuts']];s.getRange('A16').format.font={name:'Arial',size:12,bold:true,color:palette.burgundy};
Object.entries(d.meta.definition).forEach(([key,value],i)=>{s.getRange(`A${17+i}`).values=[[key]];s.getRange(`B${17+i}`).values=[[value]];s.getRange(`A${17+i}:G${17+i}`).format.rowHeight=32;});
s.getRange('B17:B21').format.wrapText=false;
s.getRange('A23').values=[['Périmètre de cette version']];s.getRange('A23').format.font={name:'Arial',size:12,bold:true,color:palette.burgundy};
const scope=[
 'Entrée autonome /combat.html et build:standalone. Le moteur Pentagram est partagé.',
 `${d.meta.implementation.verified?'V1 ajoutée dans la PR':'Cible V1'} : 22 kits Hazbin + 12 kits Helluva, 8 arènes, 6 modes. Voir les preuves.`,
 'Les 209 fiches de personnages comprennent supports, figurants et originaux AU.',
 'Costumes, chroniques, arènes Helluva, relais, tournoi et online restent des chantiers distincts.',
 'Les comptes par registre se recouvrent. Ils ne s’additionnent pas en nombre de fonctionnalités.',
];
scope.forEach((v,i)=>{s.getRange(`A${24+i}`).values=[[v]];s.getRange(`A${24+i}:G${24+i}`).format.rowHeight=25;});
s.getRange('A30').values=[['Ordre de production proposé']];s.getRange('A30').format.font={name:'Arial',size:12,bold:true,color:palette.burgundy};
Object.entries(d.meta.lots).forEach(([key,value],i)=>{s.getRange(`A${31+i}`).values=[[key]];s.getRange(`B${31+i}`).values=[[value]];s.getRange(`A${31+i}:G${31+i}`).format.rowHeight=25;});
s.getRange('A36').values=[['Mise à jour du suivi']];s.getRange('A36').format.font={name:'Arial',size:12,bold:true,color:palette.burgundy};
[
 'Changer les statuts via les listes. Ajouter un ID stable et une preuve pour toute nouvelle ligne.',
 'Les comptes lisent les lignes 6 à 5000. Étendre le tableau filtrable lors d’un ajout dans Excel.',
 'Effort S/M/L/XL : petite tâche / plusieurs composants / sous-système / production transverse.',
 'P0 : socle ou blocage. P1 : prochaine priorité. P2 : enrichissement. P3 : recherche ultérieure.',
 'Référence Hazbin : '+d.meta.baseCommit.slice(0,12)+'. Référence CQC : '+d.meta.cqcCommit.slice(0,12)+'.',
].forEach((v,i)=>{s.getRange(`A${37+i}`).values=[[v]];s.getRange(`A${37+i}:G${37+i}`).format.rowHeight=25;});

wb.recalculate();
const checks=[];
for(let i=0;i<summaryMeta.length;i++){
  const m=summaryMeta[i],r=i+6,values=s.getRange(`B${r}:G${r}`).values[0];
  const independent=[m.count,...statuses.map(st=>d[m.key].filter(x=>x.status===st).length)];
  if(JSON.stringify(values)!==JSON.stringify(independent))throw Error(`Summary mismatch ${m.name}: ${JSON.stringify(values)} != ${JSON.stringify(independent)}`);
  checks.push({sheet:m.name,count:m.count,counts:values});
}
// Representative edit/recalculate/restore proves the summary reads editable status inputs.
const taskSheet=sheets.get('Chantiers');const original=taskSheet.getRange('F6').values[0][0];
const before=s.getRange('C6').values[0][0];taskSheet.getRange('F6').values=[['Existant']];wb.recalculate();
if(s.getRange('C6').values[0][0]!==before+(original==='Existant'?0:1))throw Error('Status update did not recalculate');
taskSheet.getRange('F6').values=[[original]];
const nextRow=d.tasks.length+6;taskSheet.getRange(`A${nextRow}`).values=[['TEST-NEXT-ROW']];taskSheet.getRange(`F${nextRow}`).values=[['À produire']];wb.recalculate();
if(s.getRange('B6').values[0][0]!==d.tasks.length+1)throw Error('Next-row count failed');
taskSheet.getRange(`A${nextRow}`).clear({applyTo:'contents'});taskSheet.getRange(`F${nextRow}`).clear({applyTo:'contents'});
wb.recalculate();
const formulaErrors=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'Formula error scan',maxChars:3000});
await fs.writeFile(path.join(outputDir,'formula-check.json'),JSON.stringify({checks,formulaErrorScan:formulaErrors.ndjson,statusEditRecalculation:true,nextRowRecalculation:true,engine:'Artifact Tool; Excel desktop non exécuté'},null,2));
await fs.writeFile(path.join(outputDir,'summary-inspection.ndjson'),(await wb.inspect({kind:'table',range:'Synthèse!A5:G14',include:'values,formulas',tableMaxRows:11,tableMaxCols:8,maxChars:6000})).ndjson);
for(const [name]of sheets){const slug=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll(' ','-');const range=name==='Synthèse'?'A1:G42':name==='Sources'?'A1:E10':name==='Kits combat'?'A1:M12':'A1:H10';const preview=await wb.render({sheetName:name,range,scale:1.5,format:'png'});await fs.writeFile(path.join(outputDir,`${slug}.png`),new Uint8Array(await preview.arrayBuffer()));}
for(const [name,range,file]of [['Techniques','A74:J85','Techniques-Helluva'],['Personnages','A104:H115','Personnages-Helluva'],['Sources',`A${versionRow}:D${versionRow+4}`,'Versions']]){const preview=await wb.render({sheetName:name,range,scale:1.5,format:'png'});await fs.writeFile(path.join(outputDir,`${file}.png`),new Uint8Array(await preview.arrayBuffer()));}
const out=await SpreadsheetFile.exportXlsx(wb);const file=path.join(outputDir,'HAZBIN_HELLUVA_COMBAT_EXTENSION_V1.xlsx');await out.save(file);
await fs.writeFile(path.join(outputDir,'workbook-manifest.json'),JSON.stringify({file:path.basename(file),sheets:['Synthèse',...configs.map(c=>c.name),'Sources'],records:checks,date:d.meta.date,implementationVerified:!!d.meta.implementation.verified},null,2));
console.log(JSON.stringify({file,sheets:sheets.size,checks,formulaErrors:formulaErrors.ndjson}));
