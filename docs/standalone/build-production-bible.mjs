import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire, registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { campaignDesignTables, renderCampaignBibleMarkdown } from './campaign-bible.mjs';

// Run with CODEX_PRIMARY_RUNTIME_NODE from an isolated authoring directory.
// The game checkout supplies TypeScript; the primary runtime supplies Artifact Tool.
// The optional argument sets the output directory, outside the tracked source tree.
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const outputDir = path.resolve(process.argv[2] ?? path.join(root, '..', 'outputs', 'infernal-bible'));
const require = createRequire(import.meta.url);
const artifactPath = require.resolve('@oai/artifact-tool', {
  paths: [process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean),
});

const design = JSON.parse(await fs.readFile(path.join(here, 'extension-plan.json'), 'utf8')).productionBible;
const campaignData = JSON.parse(await fs.readFile(path.join(root, design.campaignDesign.data), 'utf8'));
async function collectRuntimeTables(){
  // Read the exact TypeScript tables without starting a Vite server or loading
  // assets. The project compiler removes type-only imports, including legacy
  // syntax still present in the shared Helluva data.
  const ts = require('typescript');
  const src = pathToFileURL(path.join(root, 'src') + path.sep).href;
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (context.parentURL?.startsWith(src) && specifier.startsWith('.') && !path.extname(specifier)) {
        const file = new URL(specifier + '.ts', context.parentURL);
        return next(existsSync(file) ? file.href : specifier + '/index.ts', context);
      }
      return next(specifier, context);
    },
    load(url, context, next) {
      if (!url.startsWith(src) || !url.endsWith('.ts')) return next(url, context);
      const text = readFileSync(new URL(url), 'utf8');
      const result = ts.transpileModule(text, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      });
      return { format: 'module', source: result.outputText, shortCircuit: true };
    },
  });
  let runtime;
  try {
    const modules = await Promise.all([
      'standalone/roster', 'standalone/campaign', 'lib/pentagram-fighters',
      'lib/pentagram-combat', 'lib/pentagram-stages', 'lib/infernal-finishers',
      'lib/infernal-appearances', 'lib/character-sprites', 'lib/infernal-attack-effects',
    ].map(module => import(src + module + '.ts')));
    runtime = Object.assign({}, ...modules);
  } finally {
    hooks.deregister();
  }
  const fighters = runtime.STANDALONE_ROSTER;
  const stages = new Map(runtime.STANDALONE_STAGES.map(stage => [stage.id, stage]));
  const names = new Map(fighters.map(fighter => [fighter.character.id, fighter.character.name]));
  const actions = { light: 'Léger', heavy: 'Lourd', special: 'Spécial' };
  const inputs = { light: 'F / J', heavy: 'G / K', special: 'H / L', signature: 'T / I' };
  const kinds = { intro: 'Prologue', rival: 'Rivalité', ending: 'Épilogue' };
  const effects = { radio:'Radio', signal:'Signal vidéo', halo:'Halo', embers:'Braises', blade:'Lame', frost:'Givre', curtain:'Rideau', shadow:'Ombre' };
  const routes = [], chapters = [], moves = [], signatures = [], finishes = [], pictures = [], appearances = [];
  const assetPaths = new Set();
  for (const stage of stages.values()) {
    assert(design.stageDesign.some(entry => entry.id === stage.id), 'Arène absente du registre : ' + stage.id);
    for (const file of [stage.imagePath, stage.thumbnailPath, stage.scenery?.middle, stage.scenery?.near]) {
      if (file) assetPaths.add(file);
    }
  }
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
    const technique = definition.signature && runtime.INFERNAL_SIGNATURES[definition.signature];
    const commands = technique ? {...actions, signature: 'Signature'} : actions;
    for (const [action, label] of Object.entries(commands)) {
      const spec = runtime.getCombatMoveInfo(definition, action);
      moves.push([name, label, spec.name, inputs[action], spec.startupMs, null, spec.actionMs, spec.recoveryMs, spec.cooldownMs, spec.hitstunMs, spec.reach, spec.tensionCost]);
    }
    signatures.push([name, technique?.name ?? card.signature, technique ? inputs.signature : card.input,
      technique?.description ?? card.effect, card.counter, technique ? 'Jouable' : 'À prototyper']);
    const finish = runtime.INFERNAL_FINISHES[id];
    if (finish.impactSprite) assetPaths.add(finish.impactSprite);
    if (finish.detachedProp) assetPaths.add(finish.detachedProp);
    finishes.push([name, finish.title, effects[finish.effect], card.finisher, card.storyboard, card.lastImage, 'Storyboard proposé', finish.impactSprite ?? '', finish.detachedProp ?? '']);
    const sprite = runtime.getCombatSpriteAsset(id);
    const portrait = runtime.getStandalonePortrait(id);
    const poses = runtime.INFERNAL_ACTION_POSES[id];
    const stance = poses?.ready ?? runtime.INFERNAL_STANCES[id];
    assetPaths.add(sprite.portrait);
    assetPaths.add(portrait);
    assetPaths.add(sprite.sheet);
    for (const file of Object.values(sprite.animationSheets ?? {})) if (file) assetPaths.add(file);
    if (stance) assetPaths.add(stance);
    if (poses) for (const file of [poses.ready, poses.guard, poses.strike, poses.recoil]) if (file) assetPaths.add(file);
    appearances.push([name, 'Habituelle', fighter.source, portrait, stance ?? '', sprite.sheet, poses?.strike ?? '', '', poses?.recoil ?? '', '', '', poses?.guard ?? '']);
    for (const outfit of runtime.INFERNAL_COSTUMES[id] ?? []) {
      for (const file of [outfit.ready, outfit.strike, outfit.heavy, outfit.recoil, outfit.crouch, outfit.jump]) if (file) assetPaths.add(file);
      appearances.push([name, outfit.name, outfit.appearance, outfit.ready, outfit.ready, '', outfit.strike, outfit.heavy, outfit.recoil, outfit.crouch ?? '', outfit.jump, '']);
    }
    for (const [kind, label] of Object.entries(kinds)) {
      const image = runtime.storyIllustration(id, kind);
      if (image) assetPaths.add(image);
      const brief = kind === 'intro' ? intro : kind === 'rival' ? route.chapters[2].scene : ending;
      pictures.push([name, label, kind === 'rival' ? rival : name, brief, image ? 'Illustration dédiée' : 'Décor et portraits', image ?? '']);
    }
  }
  const vfxRows = [], vfxImages = new Map();
  const vfxKinds = { projectile: 'Projectile visuel', beam: 'Rayon visuel', sweep: 'Balayage visuel' };
  for (const [fighterId, effect] of runtime.getInfernalAttackEffectEntries()) {
    const name = names.get(fighterId);
    assert(name && effect.canonStatus === 'simulation_au', 'VFX sans combattant ou périmètre AU : ' + fighterId);
    assetPaths.add(effect.image);
    let image = vfxImages.get(effect.image);
    if (!image) {
      image = { id: effect.id, users: new Set(), kinds: new Set() };
      vfxImages.set(effect.image, image);
    }
    image.users.add(name);
    image.kinds.add(vfxKinds[effect.kind]);
    for (const attack of effect.attacks) {
      const move = moves.find(row => row[0] === name && row[1] === actions[attack]);
      assert(move, 'Association VFX sans attaque : ' + fighterId + '/' + attack);
      const start = Math.max(0, move[4] - effect.leadMs);
      const end = Math.min(move[6], move[4] + effect.lingerMs);
      vfxRows.push([
        'VFX d’attaque', name + ' · ' + actions[attack], 'Habillage AU intégré',
        move[2] + ' · ' + vfxKinds[effect.kind] + '\n' + effect.image + '\nFenêtre ' + start + '–' + end + ' ms depuis le départ ; impact à ' + move[4] + ' ms.',
        'Effet visuel synchronisé au coup existant, sans collision ni dégâts autonomes ni portée supplémentaire. Vérifier les deux orientations, pause, K.-O., arrêt sur impact, expiration et mouvement réduit.',
      ]);
    }
  }
  const vfxImageRows = [...vfxImages].map(([file, image]) => [
    'Image VFX', image.id,
    [...image.users].join(', ') + ' · ' + [...image.kinds].join(', ') + '. Adaptation AU des coups existants ; fidélité 1:1 non certifiée.',
    'public' + file,
  ]);
  await Promise.all([...assetPaths].map(file => fs.access(path.join(root, 'public', file))));
  assert.equal(assetPaths.size, design.assetBatch.runtime.referencedAssets, 'Le registre de production doit refléter les références runtime actuelles.');
  // Preserved components are checked separately: they are not loaded by the game.
  for (const component of design.assetBatch.retainedComponents) {
    for (const file of [component.master, component.export].filter(Boolean)) await fs.access(path.join(root, file));
  }
  const reserve = JSON.parse(await fs.readFile(path.join(root, design.assetBatch.reserveManifest), 'utf8'));
  const reserveKinds = { character_base: 'Base de personnage', enemy_base: 'Base d’ennemi', projectile: 'Projectile en réserve' };
  const reserveRows = [], reserveReferences = [];
  for (const asset of reserve.assets) {
    assert.equal(asset.runtimeStatus, 'reserve', 'Base annoncée active dans le catalogue de réserve : ' + asset.id);
    for (const file of [asset.master, asset.export]) await fs.access(path.join(root, file));
    const batchLabel = asset.batchId?.match(/^wave-([a-z])-/)?.[1]?.toUpperCase() ?? 'G';
    reserveRows.push([reserveKinds[asset.kind], asset.name, 'Réserve statique · vague ' + batchLabel,
      asset.reference + '\n' + asset.export + '\n' + (asset.pose === 'ready' ? 'Une base READY. Aucun kit jouable ni cycle ajouté.' : 'Un projectile isolé. Aucune affectation à une attaque ni physique ajoutée.'),
      asset.fidelityNotes.join(' ')]);
    reserveReferences.push(['Réserve vague ' + batchLabel, asset.name,
      asset.reference + ' ' + asset.fidelityNotes.join(' '), asset.references.map(reference => reference.url).join('\n')]);
  }
  const sets = [
    ['Modes V2', 'Règles des modes de jeu', 'Les modes proposés constituent une spécification. Les filtres et le choix du combattant déterminent les parcours accessibles.', ['Mode','État','Sélection','Règles et déroulé','Progression','Critère de recette'], [24,24,44,58,46,65], design.modeDesign.map(r=>[r.name,r.status,r.selection,r.rules,r.progress,r.check])],
    ['Histoires', 'Histoires des combattants', 'Texte du jeu. Chaque parcours est une fiction originale d’Infernal Versus.', ['Combattant','Univers','Titre du parcours','Prologue','Rival final','Épilogue'], [27,21,38,62,25,62], routes],
    ['Duels de campagne','Déroulé des confrontations','Les rencontres apparaissent dans leur ordre de jeu. Le troisième duel conclut la rivalité.', ['Protagoniste','Duel','Rencontre','Adversaire','Arène','Mise en scène jouable'],[27,12,16,26,35,72],chapters],
    ['Données moteur','Temps, portée et tension des attaques','Le moteur mesure en millisecondes. L’équivalent à 60 Hz est arrondi au supérieur. L’impact est évalué une fois. La portée est un pourcentage de la largeur de l’arène.', ['Combattant','Attaque','Nom en jeu','Touche J1 / J2','Départ → impact (ms)','Impact à 60 Hz (images)','Action totale (ms)','Après impact (ms)','Recharge depuis départ (ms)','Étourdissement (ms)','Portée (% de largeur)','Coût tension'],[26,15,33,18,19,22,18,18,23,22,17,16],moves],
    ['Techniques signatures','Techniques signatures des combattants','Les techniques jouables utilisent les touches J1 / J2. Les commandes des prototypes sont proposées en directions relatives au combattant.', ['Combattant','Technique','Commande','Effet et rôle','Indice visuel et réponse','État'],[27,33,31,68,67,19],signatures],
    ['Tenues et gardes','Apparences en sélection et en duel','Une ligne par apparence. Les poses absentes utilisent les banques existantes. La garde active distincte est séparée du repos. Chemins relatifs au dossier public.', ['Combattant','Tenue','Référence ou incarnation','Visuel de sélection','Repos individuel','Planche de base','Pose légère','Pose lourde','Pose de réaction','Pose accroupie','Pose de saut','Garde active distincte'],[26,29,48,56,55,58,56,56,56,56,56,56],appearances],
    ['Finitions','Finitions en jeu et storyboards individuels','K.-O. décisif. Fenêtre de commande ' + runtime.FINISH_INPUT_MS + ' ms, mise en scène ' + runtime.FINISH_CINEMATIC_MS + ' ms. Les colonnes D à G détaillent une variante longue à produire.', ['Combattant','Finition en jeu','Effet en jeu','Variante longue proposée','Découpage proposé','Dernier plan proposé','État variante','Pose clé dédiée disponible','Pièce séparée en jeu'],[27,37,21,38,65,52,19,48,56],finishes],
    ['Plans des arènes','Arènes et profondeur de champ','Les fichiers existants sont relevés dans le registre des arènes. Les compositions de plans sont des indications pour la production.', ['Arène','État en jeu','Fond · direction','Médian · direction','Avant-plan / sol · direction','Animation proposée','Composition du duel','Repérage critique','Ressources en jeu'],[27,29,42,42,44,44,55,56,65],design.stageDesign.map(r=>{
      const stage=stages.get(r.id);
      const scenery=stage?.scenery;
      const layers=[scenery?.middle,scenery?.near].filter(Boolean).length;
      const status=!stage?'À produire':layers===2?'Trois plans en jeu':layers===1?'Deux plans en jeu':'Fond en jeu, calques à produire';
      return [r.name,status,r.back,r.middle,r.floor,r.ambient,r.composition,r.reference,stage?[stage.imagePath,scenery?.middle,scenery?.near].filter(Boolean).join('\n'):''];
    })],
    ['Illustrations','Couverture des illustrations de campagne','Une ligne par affectation. Un même dessin de rivalité peut servir aux deux adversaires. Les images dédiées attendent une validation visuelle sur référence.', ['Combattant','Moment','Sujet / adversaire','Brief issu de la scène en jeu','Présentation dans le jeu','Fichier dédié'],[27,18,27,74,31,58],pictures],
    ['Atelier et recette','Systèmes, production et recette','Les réserves statiques sont séparées des VFX actifs. Leur fichier existe ; elles ne constituent pas un kit jouable ou une animation.', ['Domaine','Sujet','État','Spécification','Contrôle à effectuer'],[23,36,26,77,79],[...design.workshop.map(r=>[r.type,r.subject,r.status,r.spec,r.acceptance]),...vfxRows,...reserveRows]],
    ['Références V3','Références et périmètre de preuve','Les URL officielles servent au repérage. Les scènes, affrontements et valeurs de combat sont des créations de jeu.', ['Origine','Référence','Usage dans le classeur','Lien ou chemin'],[23,37,70,86],[...design.sources,...vfxImageRows,...reserveReferences]],
  ];

  const campaign = campaignDesignTables(campaignData, fighters, stages, runtime.storyIllustration, moves.length, runtime.STORY_ROUTES);
  sets.push(...campaign.sets);
  sets.find(([name]) => name === 'Références V3')[5].push(...campaign.sources);
  return {sets, campaignMetrics: campaign.metrics, fighterCount:fighters.length, stageCount:stages.size, threePlanCount:[...stages.values()].filter(stage=>stage.scenery?.middle && stage.scenery?.near).length, twoPlanCount:[...stages.values()].filter(stage=>Number(Boolean(stage.scenery?.middle))+Number(Boolean(stage.scenery?.near))===1).length, onePlanCount:[...stages.values()].filter(stage=>!stage.scenery?.middle && !stage.scenery?.near).length, detachedPropCount:finishes.filter(row=>row[8]).length, guardPoseCount:appearances.filter(row=>row[11]).length, costumePoseCount:appearances.filter(row=>row[1]!=='Habituelle').reduce((sum,row)=>sum+[row[4],...row.slice(6,11)].filter(Boolean).length,0), vfxImageCount:vfxImages.size, vfxAttackCount:vfxRows.length, referencedAssetCount:assetPaths.size, signatureCount:signatures.filter(row => row[5] === 'Jouable').length, expectedFrames:Math.ceil(moves.at(-1)[4]*60/1000)};
}
if(process.argv[2]==='--read-game'){
  const payload=JSON.stringify(await collectRuntimeTables());
  await new Promise(resolve=>process.stdout.write(payload,resolve));
  process.exit(0);
}
const child=spawnSync(process.execPath,[fileURLToPath(import.meta.url),'--read-game'],{encoding:'utf8',maxBuffer:4*1024*1024});
if(child.status!==0)throw Error(child.stderr||'Lecture du code interrompue.');
const {sets,campaignMetrics,fighterCount,stageCount,threePlanCount,twoPlanCount,onePlanCount,detachedPropCount,guardPoseCount,costumePoseCount,vfxImageCount,vfxAttackCount,referencedAssetCount,signatureCount,expectedFrames}=JSON.parse(child.stdout);
process.env.DOTNET_PROCESSOR_COUNT ??= '2';
process.env.COMPlus_gcServer ??= '0';
process.env.DOTNET_GCHeapHardLimit ??= '20000000';
const moves=sets.find(([name])=>name==='Données moteur')[5],pictures=sets.find(([name])=>name==='Illustrations')[5];
const {Workbook,SpreadsheetFile}=await import(pathToFileURL(artifactPath));
const working=await fs.mkdtemp(path.join(os.tmpdir(),'infernal-bible-'));
const baseline=path.join(here,'HAZBIN_HELLUVA_COMBAT_EXTENSION_V1.xlsx');
const wb=Workbook.create();
const guide=wb.worksheets.add('Guide V3');
const sheets=new Map(sets.map(([name])=>[name,wb.worksheets.add(name)]));
const palette={burgundy:'#54233F',ink:'#292332',muted:'#665C68',gold:'#B38839',pale:'#F8F3F6',line:'#DCC9D4'};
const column=n=>String.fromCharCode(65+n);
function drawnTable(sheet, title, note, headers, widths, rows, tableName) {
  const last=column(headers.length-1), end=rows.length+5;
  sheet.showGridLines=false;
  sheet.getRange('A1:'+last+end).format.font={name:'Arial',size:10,color:palette.ink};
  sheet.getRange('A2:'+last+'2').merge();
  sheet.getRange('A2').values=[[title]];
  sheet.getRange('A2').format.font={name:'Arial',size:16,bold:true,color:palette.burgundy};
  sheet.getRange('A2:'+last+'2').format.rowHeight=30;
  sheet.getRange('A3:'+last+'3').format.rowHeight=6;
  sheet.getRange('A3:'+last+'3').format.borders={bottom:{style:'thin',color:palette.gold}};
  sheet.getRange('A4:'+last+'4').merge();
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
  ['Campagnes V3','Campagnes V3 proposées',null,'Lire les motivations, l’enjeu, le prologue, le rival et l’épilogue. Ces récits restent des propositions AU.'],
  ['Chapitres V3','Chapitres V3 proposés',null,'Trois confrontations causales par héros, avec statut de la relation, arène et fonction dramatique.'],
  ['Illustrations V3','Briefs d’illustration V3',null,'Cadrage, composition, action, lumière, palette, incarnation et exclusions pour chaque image statique.'],
  ['Illustrations V3','Briefs introduction et épilogue',null,'Deux briefs par héros. La rivalité possède un troisième brief séparé.'],
  ['Illustrations V3','Images actuelles à revalider',null,'Un fichier est déjà affecté à ce moment dans le jeu. Sa conformité à la nouvelle scène reste à vérifier.'],
  ['Illustrations V3','Images V3 à produire',null,'Aucun fichier dédié n’est actuellement affecté à ce moment. Un brief ne compte pas comme un dessin produit.'],
  ['Movesets V3','Techniques V3 proposées',null,`Quatre concepts par héros. Les ${moves.length} attaques effectivement paramétrées restent dans Données moteur.`],
  ['Movesets V3','Techniques avec nouvelle mécanique',null,'La colonne Intégration identifie les idées qui nécessitent une extension du moteur.'],
  ['Derniers Actes','Derniers Actes proposés',null,'Un titre individuel et trois temps de storyboard. Dernier Acte est le nom original du système, adopté dans l’interface.'],
  ['Continuité V3','Fiches de continuité V3',null,'Vérifier les repères sourcés, l’incarnation choisie et les inconnues avant de produire les visuels ou d’intégrer les coups.'],
  ['Modes V2','Modes décrits',null,'Lire en priorité « État ». Les modes d’extension sont identifiés parmi les modes de l’édition de référence et les chantiers.'],
  ['Histoires','Routes scénarisées',null,'Lire le prologue et l’épilogue, puis consulter les trois rencontres dans Duels de campagne.'],
  ['Duels de campagne','Confrontations',null,'Trier par protagoniste et numéro. Le rival occupe le dernier chapitre.'],
  ['Données moteur','Attaques paramétrées',null,'Contrôler départ, contact, récupération et recharge. La simulation utilise des millisecondes.'],
  ['Techniques signatures','Signatures jouables',null,'Retrouver chaque commande et la réaction propre au coup. Les valeurs de combat figurent dans Données moteur.'],
  ['Techniques signatures','Signatures à prototyper',null,'Le prototype décrit la commande envisagée, son rôle et la réponse adverse à tester.'],
  ['Tenues et gardes','Tenues alternatives',null,'Une ligne par tenue sélectionnable. Les colonnes E et G à K recensent les poses disponibles : repos, léger, lourd, réaction, accroupissement et saut.'],
  ['Tenues et gardes','Poses des tenues alternatives',null,'Chemins renseignés : Lute S1 possède six clés, dont un READY réutilisé. Carmilla cheveux lâchés reste à 5/6 après refus de l’accroupissement. Le repli sur le repos ne compte pas une nouvelle image.'],
  ['Tenues et gardes','Gardes actives distinctes',null,'La colonne L recense uniquement une image de garde distincte du repos. Une cellule vide conserve le comportement existant.'],
  ['Finitions','Variantes longues à dessiner',null,'Les colonnes B et C identifient l’effet en jeu ; D à G décrivent la séquence longue proposée. H et I indiquent les fichiers dédiés.'],
  ['Plans des arènes','Lieux détaillés',null,'Les fichiers en jeu et le travail de découpe artistique sont renseignés pour chaque lieu.'],
  ['Plans des arènes','Arènes à trois plans jouables',null,'Les fichiers de fond et les deux plans détourés sont chargés par le jeu.'],
  ['Plans des arènes','Arènes à deux plans jouables',null,'Un fond et un calque détouré sont intégrés. Le deuxième calque reste à produire.'],
  ['Plans des arènes','Arènes avec fond seul',null,'Le fond est intégré ; les deux calques indépendants restent à produire.'],
  ['Finitions','Pièces séparées intégrées',null,'Un fichier indépendant est utilisé pendant la finition. Une pièce isolée ne constitue pas une animation complète.'],
  ['Illustrations','Affectations de scène',null,'Compter les affectations des prologues, rivalités et épilogues. Une illustration partagée apparaît sur plusieurs lignes.'],
  ['Illustrations','Affectations dédiées',null,'Une image dédiée existe. La revue du dessin, de la saison et du costume reste une étape distincte.'],
  ['Illustrations','Affectations à illustrer',null,'Le jeu compose actuellement un décor et les portraits existants pour ces scènes.'],
  ['Atelier et recette','Fiches de travail',null,'Faire valider silhouettes, pieds, plans d’arène, effets de fin et lisibilité sur téléphone.'],
  ['Références V3','Sources de travail',null,'Associer toute décision de fidélité à une scène et à une incarnation. Les scénarios de tournoi et de campagne sont originaux.'],
  ['Références V3','Sprites VFX uniques',null,'Images distinctes du registre actif, y compris les réemplois entre combattants. Adaptations AU ; sources, prompts et contrôles alpha dans les manifestes projectiles du 24 novembre.'],
  ['Atelier et recette','Attaques avec VFX',null,'Une ligne par association entre combattant, attaque et image. Les effets suivent le contact existant ; ils n’ajoutent ni collision autonome, ni dégâts, ni portée.'],
  ['Atelier et recette','Bases de personnages en réserve',null,'Bases statiques du catalogue cumulatif. Chaque vague, fichier et incarnation est renseigné dans Atelier et recette ; aucun kit jouable ajouté.'],
  ['Atelier et recette','Bases d’ennemis en réserve',null,'Une image READY par ennemi du catalogue de réserve. Aucun comportement, coup ou cycle d’animation ajouté.'],
  ['Atelier et recette','Projectiles en réserve',null,'Objets isolés du catalogue de réserve. Le compteur exclut les VFX déjà affectés aux attaques jouables.'],
];
drawnTable(guide,'Infernal Versus · Guide de la V3',`${design.edition} · Les onze derniers onglets conservent intégralement les registres de la V1.`, ['Onglet','Mesure','Nombre','Mode de lecture'],[28,35,15,92],guideRows,'ProdV2Guide');
guide.tabColor=palette.burgundy;
const guideFilters = {
  'Images actuelles à revalider': ['J', 'Image actuelle à revalider pour ce brief'],
  'Images V3 à produire': ['J', 'Image à produire'],
  'Techniques avec nouvelle mécanique': ['H', 'Nouvelle mécanique à développer'],
  'Signatures jouables': ['F', 'Jouable'],
  'Signatures à prototyper': ['F', 'À prototyper'],
  'Tenues alternatives': ['B', '<>Habituelle'],
  'Arènes à trois plans jouables': ['B', 'Trois plans en jeu'],
  'Arènes à deux plans jouables': ['B', 'Deux plans en jeu'],
  'Arènes avec fond seul': ['B', 'Fond en jeu, calques à produire'],
  'Affectations dédiées': ['E', 'Illustration dédiée'],
  'Affectations à illustrer': ['E', 'Décor et portraits'],
  'Sprites VFX uniques': ['A', 'Image VFX'],
  'Attaques avec VFX': ['A', 'VFX d’attaque'],
  'Bases de personnages en réserve': ['A', 'Base de personnage'],
  'Bases d’ennemis en réserve': ['A', 'Base d’ennemi'],
  'Projectiles en réserve': ['A', 'Projectile en réserve'],
};
for(const [i,row] of guideRows.entries()){
  const filter = guideFilters[row[1]];
  const rowCount=sets.find(([name])=>name===row[0])[5].length;
  const end=rowCount+5;
  const nonEmptyColumn = row[1] === 'Pièces séparées intégrées' ? 'I' : row[1] === 'Gardes actives distinctes' ? 'L' : null;
  const formula = row[1] === 'Briefs introduction et épilogue'
    ? `=COUNTIFS('${row[0]}'!$B$6:$B${end},"Introduction")+COUNTIFS('${row[0]}'!$B$6:$B${end},"Épilogue")`
    : nonEmptyColumn
    ? `=ROWS('${row[0]}'!$${nonEmptyColumn}$6:$${nonEmptyColumn}${end})-COUNTBLANK('${row[0]}'!$${nonEmptyColumn}$6:$${nonEmptyColumn}${end})`
    : row[1] === 'Poses des tenues alternatives'
    ? '=' + ['E','G','H','I','J','K'].map(column => `SUMPRODUCT(('${row[0]}'!$B$6:$B${end}<>"Habituelle")*('${row[0]}'!$${column}$6:$${column}${end}<>""))`).join('+')
    : filter
    ? `=${row[0].endsWith(' V3') ? 'COUNTIFS' : 'COUNTIF'}('${row[0]}'!$${filter[0]}$6:$${filter[0]}${end},"${filter[1]}")`
    : `=COUNTA('${row[0]}'!$A$6:$A${end})`;
  guide.getCell(i+5,2).formulas=[[formula]];
}
console.log('Recalcul.');
wb.recalculate();
const summaryCount = label => guide.getCell(guideRows.findIndex(row => row[1] === label) + 5, 2).values[0][0];
assert.equal(summaryCount('Campagnes V3 proposées'),campaignMetrics.campaigns);
assert.equal(summaryCount('Chapitres V3 proposés'),campaignMetrics.chapters);
assert.equal(summaryCount('Briefs d’illustration V3'),campaignMetrics.illustrationBriefs);
assert.equal(summaryCount('Briefs introduction et épilogue'),campaignMetrics.introEndingBriefs);
assert.equal(summaryCount('Techniques V3 proposées'),campaignMetrics.moveProposals);
assert.equal(summaryCount('Techniques avec nouvelle mécanique'),campaignMetrics.newMechanics);
assert.equal(summaryCount('Derniers Actes proposés'),campaignMetrics.finisherStoryboards);
assert.equal(summaryCount('Fiches de continuité V3'),fighterCount);
assert.equal(summaryCount('Images actuelles à revalider') + summaryCount('Images V3 à produire'),campaignMetrics.illustrationBriefs);
assert.equal(summaryCount('Routes scénarisées'),fighterCount);
assert.equal(summaryCount('Attaques paramétrées'),fighterCount*3 + signatureCount);
assert.equal(summaryCount('Signatures jouables'),signatureCount);
assert.equal(summaryCount('Signatures à prototyper') + signatureCount,fighterCount);
assert.equal(summaryCount('Tenues alternatives'),sets.find(([name]) => name === 'Tenues et gardes')[5].length - fighterCount);
assert.equal(summaryCount('Arènes à trois plans jouables'),threePlanCount);
assert.equal(summaryCount('Arènes à deux plans jouables'),twoPlanCount);
assert.equal(summaryCount('Arènes avec fond seul'),onePlanCount);
assert.equal(summaryCount('Pièces séparées intégrées'),detachedPropCount);
assert.equal(summaryCount('Gardes actives distinctes'),guardPoseCount);
assert.equal(summaryCount('Poses des tenues alternatives'),costumePoseCount);
assert.equal(summaryCount('Sprites VFX uniques'),vfxImageCount);
assert.equal(summaryCount('Attaques avec VFX'),vfxAttackCount);
assert.equal(summaryCount('Bases de personnages en réserve'),design.assetBatch.reserves.characterBases);
assert.equal(summaryCount('Bases d’ennemis en réserve'),design.assetBatch.reserves.enemyBases);
assert.equal(summaryCount('Projectiles en réserve'),design.assetBatch.reserves.projectileImages);
assert.equal(referencedAssetCount,design.assetBatch.runtime.referencedAssets);
assert(summaryCount('Lieux détaillés')>=stageCount);
assert.equal(summaryCount('Affectations dédiées') + summaryCount('Affectations à illustrer'),pictures.length);

assert.equal(dataSheet.getRange('F'+(moves.length+5)).values[0][0],expectedFrames);
console.log('Inspection.');
const issues=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:60},summary:'Vérification des cellules'});
if (issues.ndjson.includes('"kind":"match"')) throw Error('Erreur de formule : '+issues.ndjson);
console.log((await wb.inspect({kind:'region',sheetId:'Guide V3',range:'A6:C'+(guideRows.length+5),maxChars:3200})).ndjson);
await fs.mkdir(outputDir,{recursive:true});
if(global.gc)global.gc();
console.log('Export Excel',Math.round(process.memoryUsage().rss/1024/1024)+' Mio');
const blob=await SpreadsheetFile.exportXlsx(wb);
const generated=path.join(working,'generated.xlsx');
await blob.save(generated);
const joined=spawnSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON ?? 'python3',[path.join(here,'attach-legacy-registers.py'),baseline,generated,path.join(outputDir,'INFERNAL_VERSUS_BIBLE_V3.xlsx')],{encoding:'utf8'});
if(joined.status!==0) throw Error(joined.stderr);

await fs.writeFile(path.join(outputDir,'INFERNAL_VERSUS_CAMPAIGNS_V3.md'),renderCampaignBibleMarkdown(campaignData));
await fs.writeFile(path.join(outputDir,'campaign-design-metrics.json'),JSON.stringify(campaignMetrics,null,2)+'\n');
await fs.rm(working,{recursive:true,force:true});
