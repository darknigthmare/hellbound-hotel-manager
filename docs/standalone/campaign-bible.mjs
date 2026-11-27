import assert from 'node:assert/strict';

const moments = {intro: 'Introduction', rival: 'Rivalité', ending: 'Épilogue'};
const loreLabels = {canon: 'Canon', unknown: 'Non établi', pilot_legacy: 'Pilote historique'};
const scopeLabels = {custom: 'Simulation AU', season_1_start: 'S1 avant le final', season_1_end: 'Fin de S1', season_2: 'Saison 2', pilot_legacy: 'Pilote historique'};
const spoilerLabels = {none: 'aucun', season_1: 'saison 1', season_2: 'saison 2'};
const actions = {light: 'Léger', heavy: 'Lourd', special: 'Spécial', signature: 'Signature'};
const relations = {canon_relationship: 'Lien établi ; duel AU', original_au_encounter: 'Rencontre originale AU'};
const implementation = {existing_compatible_proposal: 'Compatible avec le socle, à intégrer', requires_new_mechanic: 'Nouvelle mécanique à développer'};
const evidence = {source_grounded_adaptation: 'Adaptation d’un motif sourcé', limited_evidence_adaptation: 'Adaptation à preuves limitées'};
const refs = ids => ids.join(', ');
const bullets = items => items.join('\n');
const text = (value, at) => assert(typeof value === 'string' && value.trim(), 'Texte manquant : ' + at);
const textList = (value, min, max, at) => {
  assert(Array.isArray(value), 'Liste de textes attendue : ' + at);
  assert(value.length >= min && value.length <= max, 'Nombre de textes invalide : ' + at);
  value.forEach((item, i) => text(item, at + '[' + i + ']'));
};

/** Structural validation is deliberately separate from the review of source support. */
export function validateCampaignBible(data, fighterIds, stageIds) {
  assert.equal(data.schemaVersion, 1);
  const roster = new Set(fighterIds), stages = new Set(stageIds);
  assert.equal(data.fighters.length, roster.size, 'Une fiche est requise pour chaque combattant actif.');
  assert.equal(new Set(data.fighters.map(f => f.fighterId)).size, roster.size, 'Identifiant de fiche dupliqué.');
  const sourceIds = new Set();
  for (const source of data.sources) {
    assert(!sourceIds.has(source.id), 'Identifiant de source dupliqué : ' + source.id);
    sourceIds.add(source.id);
    for (const key of ['id','title','url','publisher','kind','scope','verification','supports']) text(source[key], source.id + '.' + key);
    assert(['official_episode','official_clip','official_page','historical_project'].includes(source.kind), 'Type de source invalide : ' + source.id);
    assert(/^https:\/\//.test(source.url), 'Source sans URL HTTPS : ' + source.id);
  }
  const sourceList = (ids, at) => {
    assert(Array.isArray(ids) && ids.length, 'Source requise : ' + at);
    for (const id of ids) assert(sourceIds.has(id), 'Source inconnue : ' + id + ' dans ' + at);
  };
  let anchors = 0, newMechanics = 0, limitedEvidenceMoves = 0;
  for (const f of data.fighters) {
    const id = f.fighterId;
    assert(roster.has(id), 'Combattant absent du jeu : ' + id);
    for (const key of ['name','franchise']) text(f[key], id + '.' + key);
    for (const key of ['scope','incarnation','spoilerTier']) text(f.continuity[key], id + '.continuity.' + key);
    textList(f.continuity.guardrails, 2, Infinity, id + '.continuity.guardrails');
    assert(f.loreAnchors.length >= 2 && f.loreAnchors.length <= 4, 'Repères de lore attendus : ' + id);
    for (const anchor of f.loreAnchors) {
      text(anchor.claim, id + '.lore');
      assert(['canon','unknown','pilot_legacy'].includes(anchor.status), 'Statut lore invalide : ' + id);
      sourceList(anchor.sourceIds, id + '.lore');
      anchors++;
    }
    const c = f.campaign;
    assert.equal(c.status, 'simulation_au_proposal');
    for (const key of ['title','premise','motivation','stakes','intro','ending','nextHook']) text(c[key], id + '.campaign.' + key);
    assert.equal(c.chapters.length, 3, 'Trois chapitres attendus : ' + id);
    for (const [i, chapter] of c.chapters.entries()) {
      assert.equal(chapter.index, i + 1);
      assert(roster.has(chapter.opponentId) && chapter.opponentId !== id, 'Adversaire invalide : ' + id);
      assert(stages.has(chapter.stageId), 'Arène invalide : ' + id + '/' + chapter.stageId);
      assert(relations[chapter.relationshipBasis], 'Relation sans statut : ' + id);
      for (const key of ['title','scene','dramaticPurpose']) text(chapter[key], id + '.chapter.' + key);
      sourceList(chapter.sourceIds, id + '.chapter');
    }
    assert.equal(c.rival.fighterId, c.chapters[2].opponentId, 'Le rival doit conclure les chapitres : ' + id);
    assert(relations[c.rival.relationshipStatus], 'Statut rival invalide : ' + id);
    text(c.rival.canonRelationship, id + '.rival.relationship');
    text(c.rival.dramaticReason, id + '.rival.reason');
    sourceList(c.rival.sourceIds, id + '.rival');
    assert.equal(f.illustrations.length, 3);
    assert.deepEqual(new Set(f.illustrations.map(i => i.kind)), new Set(Object.keys(moments)));
    for (const image of f.illustrations) {
      for (const key of ['title','shot','composition','action','lighting','palette','incarnation']) text(image[key], id + '.illustration.' + key);
      textList(image.continuityAnchors, 1, Infinity, id + '.illustration.continuityAnchors');
      textList(image.avoid, 1, Infinity, id + '.illustration.avoid');
      sourceList(image.sourceIds, id + '.illustration');
    }
    assert.equal(f.moves.length, 4);
    assert.deepEqual(new Set(f.moves.map(m => m.slot)), new Set(Object.keys(actions)));
    for (const move of f.moves) {
      for (const key of ['name','canonMotif','role','execution','telegraph','counterplay','guardrail']) text(move[key], id + '.move.' + key);
      assert(implementation[move.implementation] && evidence[move.loreStatus], 'Statut de coup invalide : ' + id);
      sourceList(move.sourceIds, id + '.move');
      newMechanics += Number(move.implementation === 'requires_new_mechanic');
      limitedEvidenceMoves += Number(move.loreStatus === 'limited_evidence_adaptation');
    }
    const finish = f.finisher;
    assert.equal(finish.systemName, 'Dernier Acte');
    assert.equal(finish.canonicalTerm, false);
    assert.equal(finish.status, 'storyboard_proposal');
    textList(finish.beats, 3, 3, id + '.finisher.beats');
    textList(finish.requiredAssets, 2, 4, id + '.finisher.requiredAssets');
    for (const key of ['title','motif','setup','lastImage','outcome','continuityGuardrail','reducedMotion']) text(finish[key], id + '.finisher.' + key);
    sourceList(finish.sourceIds, id + '.finisher');
    textList(f.productionNotes, 2, 4, id + '.productionNotes');
  }
  return {fighters: roster.size, campaigns: roster.size, chapters: roster.size * 3,
    illustrationBriefs: roster.size * 3, introEndingBriefs: roster.size * 2,
    moveProposals: roster.size * 4, finisherStoryboards: roster.size,
    loreAnchors: anchors, sources: sourceIds.size, newMechanics, limitedEvidenceMoves};
}

export function campaignDesignTables(data, fighters, stages, storyIllustration, runtimeMoveCount, currentRoutes) {
  const names = new Map(fighters.map(f => [f.character.id, f.character.name]));
  const metrics = validateCampaignBible(data, names.keys(), stages.keys());
  const campaigns = [], chapters = [], pictures = [], moves = [], finishes = [], continuity = [];
  for (const f of data.fighters) {
    const c = f.campaign, finish = f.finisher;
    campaigns.push([f.name, f.franchise, c.title, c.premise, c.motivation + '\nEnjeu : ' + c.stakes, c.intro,
      names.get(c.rival.fighterId) + '\n' + c.rival.dramaticReason, c.ending, c.nextHook]);
    for (const chapter of c.chapters) chapters.push([f.name, chapter.index, chapter.title,
      names.get(chapter.opponentId), stages.get(chapter.stageId).name,
      relations[chapter.relationshipBasis] + (chapter.index === 3 ? '\n' + c.rival.canonRelationship : ''),
      chapter.scene, chapter.dramaticPurpose, refs(chapter.sourceIds)]);
    for (const picture of f.illustrations) {
      const current = storyIllustration(f.fighterId, picture.kind);
      const previousRival = currentRoutes[f.fighterId].chapters[2].opponent;
      const castingNote = current && picture.kind === 'rival' && previousRival !== c.rival.fighterId
        ? 'Le parcours actuel oppose ' + names.get(previousRival) + ' ; ce brief vise ' + names.get(c.rival.fighterId) + '. Vérifier le casting de l’image avant réemploi.' : '';
      pictures.push([f.name, moments[picture.kind], picture.title,
        picture.shot + '\n' + picture.composition, picture.action,
        picture.lighting + '\nPalette : ' + picture.palette,
        picture.incarnation + '\n' + bullets(picture.continuityAnchors), bullets([...picture.avoid, ...(castingNote ? [castingNote] : [])]),
        current ?? '', current ? 'Image actuelle à revalider pour ce brief' : 'Image à produire', refs(picture.sourceIds)]);
    }
    for (const move of f.moves) moves.push([f.name, actions[move.slot], move.name,
      move.role + '\n' + move.execution,
      'Annonce : ' + move.telegraph + '\nRéponse : ' + move.counterplay,
      move.canonMotif + '\n' + evidence[move.loreStatus], move.guardrail,
      implementation[move.implementation], refs(move.sourceIds)]);
    finishes.push([f.name, finish.title, finish.motif + '\n' + finish.setup,
      ...finish.beats, finish.lastImage + '\nIssue : ' + finish.outcome,
      finish.continuityGuardrail, finish.reducedMotion, bullets(finish.requiredAssets), refs(finish.sourceIds)]);
    continuity.push([f.name, (scopeLabels[f.continuity.scope] ?? f.continuity.scope) + '\nSpoilers : ' + (spoilerLabels[f.continuity.spoilerTier] ?? f.continuity.spoilerTier),
      f.continuity.incarnation,
      f.loreAnchors.map(a => loreLabels[a.status] + ' : ' + a.claim + ' [' + refs(a.sourceIds) + ']').join('\n'),
      bullets(f.continuity.guardrails), bullets(f.productionNotes)]);
  }
  const sets = [
    ['Campagnes V3','Campagnes individuelles proposées','Fictions originales AU. Les routes actuellement jouables figurent dans Histoires. Les sources étayent les motifs, pas ces nouveaux événements.',
      ['Combattant','Univers','Titre','Point de départ','Motivation et enjeu','Introduction','Rival et conflit','Épilogue','Relance'],
      [26,20,34,52,57,67,53,67,48],campaigns],
    ['Chapitres V3','Trois chapitres et un rival motivé','Chaque parcours conduit à son rival au chapitre 3. Les arènes et adversaires sont disponibles ; leur assemblage et leurs scènes sont proposés.',
      ['Protagoniste','Chapitre','Titre','Adversaire','Arène','Lien établi ou rencontre AU','Scène','Fonction dramatique','Sources des motifs'],
      [26,12,36,26,32,57,70,55,34],chapters],
    ['Illustrations V3','Direction des introductions, rivalités et épilogues','Une image statique 16:9 par brief, sans texte incrusté, bords réservés à l’interface. Une image actuelle exige une revue avant réemploi dans ces nouvelles scènes.',
      ['Combattant','Moment','Titre de l’image','Caméra et composition','Action','Lumière et palette','Incarnation et repères','À éviter','Image actuellement affectée','Travail restant','Sources des motifs'],
      [26,19,34,72,56,48,64,56,58,37,35],pictures],
    ['Movesets V3','Quatre techniques proposées par combattant','Ces concepts ne remplacent pas les ' + runtimeMoveCount + ' attaques de Données moteur. Les valeurs de dégâts et de temps doivent être prototypées ; aucune valeur canonique n’est inventée.',
      ['Combattant','Entrée','Technique','Rôle et exécution','Annonce et réponse adverse','Motif et portée de preuve','Limite de lore','Intégration proposée','Sources du motif'],
      [26,16,33,66,68,63,57,37,34],moves],
    ['Derniers Actes','Dernier Acte : finitions individuelles','Nom de système original du jeu. Les ' + metrics.finisherStoryboards + ' storyboards restent à produire. La finition jouable garde sa fenêtre de 3,2 s et sa mise en scène de 1,5 s.',
      ['Combattant','Titre du Dernier Acte','Motif et amorce','Temps 1','Temps 2','Temps 3','Dernier plan et issue','Limite de continuité','Mouvements réduits','Besoins de production','Sources du motif'],
      [26,36,56,49,49,49,65,60,54,57,34],finishes],
    ['Continuité V3','Incarnations, preuves et dépendances','Canon désigne uniquement les repères sourcés. Non établi signale une limite de preuve. Les campagnes, coups et storyboards sont des propositions de jeu.',
      ['Combattant','Périmètre et spoilers','Incarnation de référence','Repères de lore et sources','Contraintes de continuité','Dépendances de production'],
      [26,32,62,83,80,78],continuity],
  ];
  const sources = data.sources.map(s => ['Bible V3 · ' + s.id, s.title,
    s.publisher + '\nPérimètre : ' + s.scope + '\nVérification : ' + s.verification + '\nÉtaie : ' + s.supports, s.url]);
  return {sets, sources, metrics};
}

const md = value => String(value).replaceAll('|', '\\|');
export function renderCampaignBibleMarkdown(data) {
  const sourceMap = new Map(data.sources.map(s => [s.id, s]));
  const cite = ids => ids.map(id => '[' + id + '](' + sourceMap.get(id).url + ')').join(', ');
  const names = new Map(data.fighters.map(f => [f.fighterId, f.name]));
  const total = data.fighters.length;
  const hazbin = data.fighters.filter(f => f.franchise === 'Hazbin Hotel').length;
  const helluva = data.fighters.filter(f => f.franchise === 'Helluva Boss').length;
  const lines = [
    '# Infernal Versus — Bible des campagnes V3', '',
    `Édition du 25 novembre 2026. Périmètre : ${total} combattants actuellement jouables, soit ${hazbin} Hazbin Hotel et ${helluva} Helluva Boss.`, '',
    `Cette bible développe ${total} campagnes originales, ${total * 3} chapitres, ${total * 3} briefs d’illustration, ${total * 4} propositions de techniques et ${total} finitions individuelles. Les routes, valeurs et images actuellement intégrées restent décrites séparément dans le classeur et le registre runtime.`, '',
    '## Dernier Acte', '',
    '**Dernier Acte** est le nouveau nom original du système de finition du jeu. Il reprend le vocabulaire théâtral des séries sans être présenté comme un terme officiel du lore. Le titre visible du système est adopté dans l’interface ; les storyboards individuels ci-dessous constituent une prochaine étape de production.', '',
    'Le déclenchement actuel reste celui du K.-O. décisif : commande pendant 3,2 secondes, puis séquence de 1,5 seconde. Les trois temps proposés ne reçoivent aucun minutage fictif. Ils doivent être prototypés avant de remplacer cette séquence. Chaque issue appartient à la simulation d’arène et ne modifie pas le destin canonique du vaincu.', '',
    '## Règles pour les illustrations', '',
    '- Une illustration statique 16:9 par introduction, rivalité et épilogue ; aucun texte incorporé.',
    '- Conserver le premier plan, le plan des personnages et le fond indiqués. Réserver les bords aux sous-titres et contrôles.',
    '- Utiliser l’incarnation de la fiche pour le costume, les membres, les armes et les transformations. Comparer le dessin final aux références officielles avant validation.',
    '- Les images déjà présentes dans le jeu sont des candidates au réemploi. Une affectation existante ne valide pas automatiquement le nouveau brief.',
    '- Les sources étayent les repères canoniques et les motifs visuels. Les rencontres et techniques de la simulation restent des créations AU.', '',
    '## Sommaire', '',
    ...data.fighters.map(f => '- [' + f.name + '](#' + f.fighterId + ')'), '',
  ];
  for (const f of data.fighters) {
    const c = f.campaign, finish = f.finisher;
    lines.push('<a id="' + f.fighterId + '"></a>', '', '## ' + f.name, '',
      '**' + f.franchise + ' — ' + c.title + '**', '',
      '**Incarnation.** ' + f.continuity.incarnation + ' Périmètre : ' + (scopeLabels[f.continuity.scope] ?? f.continuity.scope) + '. Spoilers : ' + (spoilerLabels[f.continuity.spoilerTier] ?? f.continuity.spoilerTier) + '.', '',
      '### Repères de lore', '', ...f.loreAnchors.map(a => '- **' + loreLabels[a.status] + '.** ' + a.claim + ' (' + cite(a.sourceIds) + ')'), '',
      '**Contraintes.** ' + f.continuity.guardrails.join(' '), '',
      '### Campagne proposée', '', '**Point de départ.** ' + c.premise, '', '**Motivation.** ' + c.motivation, '', '**Enjeu.** ' + c.stakes, '',
      '**Introduction.** ' + c.intro, '',
      '| Chapitre | Adversaire et lieu | Scène et fonction dramatique |', '| --- | --- | --- |',
      ...c.chapters.map(ch => '| ' + ch.index + '. ' + md(ch.title) + ' | ' + md(names.get(ch.opponentId)) + ' · `' + ch.stageId + '` | ' + md(ch.scene + ' ' + ch.dramaticPurpose) + ' ' + relations[ch.relationshipBasis] + '. Sources des motifs : ' + cite(ch.sourceIds) + ' |'), '',
      '**Rival final : ' + names.get(c.rival.fighterId) + '.** ' + c.rival.canonRelationship + ' ' + c.rival.dramaticReason + ' Statut : ' + relations[c.rival.relationshipStatus] + '. (' + cite(c.rival.sourceIds) + ')', '',
      '**Épilogue.** ' + c.ending, '', '**Relance.** ' + c.nextHook, '', '### Briefs des illustrations', '');
    for (const image of f.illustrations) lines.push('#### ' + moments[image.kind] + ' — ' + image.title, '',
      '**Cadrage et composition.** ' + image.shot + ' ' + image.composition, '', '**Action.** ' + image.action, '',
      '**Lumière et palette.** ' + image.lighting + ' ' + image.palette, '', '**Incarnation.** ' + image.incarnation, '',
      '**Repères à conserver.** ' + image.continuityAnchors.join(' '), '', '**À éviter.** ' + image.avoid.join(' '), '',
      'Références des motifs : ' + cite(image.sourceIds) + '.', '');
    lines.push('### Moveset proposé', '');
    for (const move of f.moves) lines.push('#### ' + actions[move.slot] + ' — ' + move.name, '',
      '**Motif.** ' + move.canonMotif + ' ' + evidence[move.loreStatus] + '. (' + cite(move.sourceIds) + ')', '',
      '**Rôle et exécution.** ' + move.role + ' ' + move.execution, '', '**Annonce.** ' + move.telegraph, '',
      '**Réponse adverse.** ' + move.counterplay, '', '**Intégration.** ' + implementation[move.implementation] + '.', '',
      '**Limite.** ' + move.guardrail, '');
    lines.push('### Dernier Acte — ' + finish.title, '', '**Motif et amorce.** ' + finish.motif + ' ' + finish.setup, '',
      ...finish.beats.map((beat,i) => (i + 1) + '. ' + beat), '', '**Dernier plan.** ' + finish.lastImage, '',
      '**Issue.** ' + finish.outcome, '', '**Continuité.** ' + finish.continuityGuardrail, '',
      '**Mouvements réduits.** ' + finish.reducedMotion, '', '**Besoins de production.**', '',
      ...finish.requiredAssets.map(a => '- ' + a), '', 'Références du motif : ' + cite(finish.sourceIds) + '.', '',
      '### Dépendances de la fiche', '', ...f.productionNotes.map(n => '- ' + n), '');
  }
  lines.push('## Registre des sources', '',
    'La colonne de vérification décrit ce qui a effectivement été accessible. Une page officielle ou son résumé ne remplace pas une comparaison image par image des costumes et gestes.', '',
    '| ID | Source | Périmètre et vérification | Ce que la source étaye |', '| --- | --- | --- | --- |',
    ...data.sources.map(s => '| ' + s.id + ' | [' + md(s.title) + '](' + s.url + ') — ' + md(s.publisher) + ' | ' + md(s.scope + ' ' + s.verification) + ' | ' + md(s.supports) + ' |'), '');
  return lines.join('\n');
}
