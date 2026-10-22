import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Download, Flame, Gamepad2, Settings, Shield, Skull, Sparkles, Swords, Trophy, Upload, Users } from 'lucide-react';
import { PentagramLiveFight } from '../components/PentagramLiveFight';
import { usePentagramCombatSoundtrack } from '../components/usePentagramCombatSoundtrack';
import { getCombatSpriteAsset } from '../lib/character-sprites';
import { buildCombatantDefinition } from '../lib/pentagram-fighters';
import { PENTAGRAM_STAGES, getPentagramStage, type PentagramStageId } from '../lib/pentagram-stages';
import type { CombatState } from '../lib/pentagram-combat';
import { STANDALONE_BOSS_IDS, STANDALONE_FIGHTER_IDS, STANDALONE_ROSTER, STANDALONE_TIMELINE, getStandaloneFighter } from './roster';
import { applyMatchResult, buildRun, exportSave, importSave, loadSave, retryRun, saveProgress, MAX_IMPORT_LENGTH, type RunMode, type StandaloneMode, type StandaloneOptions, type StandaloneRun, type StandaloneSave } from './progression';
import '../styles/theme.css';
import '../styles/pentagram-arena.css';
import './infernal-versus.css';

type Screen = 'home' | 'setup' | 'fight' | 'codex' | 'options';
interface Match { id: string; one: string; two: string; mode: StandaloneMode; stageId: PentagramStageId; allowSeasonTwo: boolean; runIndex?: number }
const MODES = [
  { id: 'versus', title: 'Duel infernal', label: 'VERSUS CPU', description: 'Choisissez librement les deux combattants et votre arène.', icon: Swords },
  { id: 'local', title: 'Rivalité locale', label: '2 JOUEURS', description: 'Deux joueurs, un écran. Clavier partagé ou commandes tactiles.', icon: Users },
  { id: 'training', title: 'Salle d’entraînement', label: 'DOJO', description: 'Travaillez les distances, la garde et vos trois attaques.', icon: Shield },
  { id: 'arcade', title: 'Les cinq épreuves', label: 'ARCADE', description: 'Cinq duels pour traverser un parcours tiré au sort.', icon: Flame },
  { id: 'survival', title: 'Dernier debout', label: 'SURVIE', description: 'Une série de vingt duels. Chaque défaite interrompt le parcours.', icon: Trophy },
  { id: 'boss-rush', title: 'Le cercle des puissants', label: 'BOSS RUSH', description: 'Affrontez successivement les boss du roster disponible.', icon: Skull },
] as const;
const DIFFICULTIES = { rookie: 'Découverte', standard: 'Standard', overlord: 'Overlord' } as const;
const modeTitle = (id: StandaloneMode) => MODES.find(mode => mode.id === id)?.title ?? id;
const isRunMode = (mode: StandaloneMode): mode is RunMode => ['arcade', 'survival', 'boss-rush'].includes(mode);
function browserStorage() { try { return window.localStorage; } catch { return null; } }
function identifier() { return globalThis.crypto?.randomUUID?.() ?? `match-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function randomSeed() { return globalThis.crypto?.getRandomValues(new Uint32Array(1))[0] ?? Date.now() >>> 0; }

function Portrait({ id, className = '' }: { id: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const src = getCombatSpriteAsset(id)?.portrait;
  return src && !failed
    ? <img className={className} src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
    : <span className={`iv-portrait-fallback ${className}`} aria-hidden="true">{getStandaloneFighter(id)?.character.name.slice(0, 2) ?? '?'}</span>;
}

export function InfernalVersus() {
  const [initial] = useState(() => loadSave(browserStorage(), STANDALONE_FIGHTER_IDS));
  const [save, setSave] = useState(initial.save);
  const saveRef = useRef(save);
  const [canPersist, setCanPersist] = useState(initial.status === 'ok');
  const [storageNotice, setStorageNotice] = useState(initial.message ?? '');
  const [screen, setScreen] = useState<Screen>('home');
  const [mode, setMode] = useState<StandaloneMode>('versus');
  const [oneId, setOneId] = useState('charlie');
  const [twoId, setTwoId] = useState('hb_blitzo');
  const [slot, setSlot] = useState<'one' | 'two'>('one');
  const [franchise, setFranchise] = useState('all');
  const [scope, setScope] = useState('all');
  const [query, setQuery] = useState('');
  const [stageId, setStageId] = useState<PentagramStageId>('hotel-lobby');
  const [match, setMatch] = useState<Match | null>(null);
  const [trainingGuard, setTrainingGuard] = useState(false);
  const [notice, setNotice] = useState('');
  const [pendingImport, setPendingImport] = useState<StandaloneSave | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const soundtrack = usePentagramCombatSoundtrack();
  const eligibleRoster = STANDALONE_ROSTER.filter(fighter => (franchise === 'all' || fighter.franchise === franchise) && (scope === 'all' || fighter.spoiler === 'season_1'));
  const displayedRoster = eligibleRoster.filter(fighter => `${fighter.character.name} ${fighter.profile.style}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const selectedOne = getStandaloneFighter(oneId)!;
  const selectedTwo = getStandaloneFighter(twoId)!;
  const stage = getPentagramStage(match?.stageId ?? stageId);
  const combatants = useMemo(() => {
    if (!match) return null;
    const one = getStandaloneFighter(match.one);
    const two = getStandaloneFighter(match.two);
    if (!one || !two) return null;
    return { one, two, oneDefinition: buildCombatantDefinition(one.character, one.profile), twoDefinition: buildCombatantDefinition(two.character, two.profile) };
  }, [match]);

  useEffect(() => {
    mainRef.current?.scrollTo?.({ top: 0 });
    if (screen !== 'fight') titleRef.current?.focus();
  }, [screen]);

  const updateSave = useCallback((next: StandaloneSave) => {
    saveRef.current = next;
    setSave(next);
    setCanPersist(true);
    const result = saveProgress(browserStorage(), next, STANDALONE_FIGHTER_IDS);
    setStorageNotice(result.ok ? '' : result.message ?? 'Progression conservée pour cette session seulement.');
  }, []);
  const changeOption = <K extends keyof StandaloneOptions>(key: K, value: StandaloneOptions[K]) => updateSave({ ...saveRef.current, options: { ...saveRef.current.options, [key]: value } });
  const launch = (next: Match) => {
    setNotice('');
    setMatch(next);
    setScreen('fight');
    if (saveRef.current.options.soundtrack) void soundtrack.start(getPentagramStage(next.stageId).soundtrack);
  };
  const launchRun = (run: StandaloneRun) => {
    if (run.status !== 'active') return;
    launch({ id: identifier(), one: run.fighterId, two: run.opponentIds[run.index], mode: run.mode, stageId: PENTAGRAM_STAGES[run.index % PENTAGRAM_STAGES.length].id, runIndex: run.index, allowSeasonTwo: run.rosterIds.some(id => getStandaloneFighter(id)?.spoiler === 'season_2') });
  };
  const startMatch = () => {
    try {
      if (isRunMode(mode)) {
        const run = buildRun(mode, oneId, eligibleRoster.map(fighter => fighter.character.id), STANDALONE_BOSS_IDS, randomSeed());
        updateSave({ ...saveRef.current, run });
        launchRun(run);
      } else {
        updateSave(saveRef.current);
        launch({ id: identifier(), one: oneId, two: twoId, mode, stageId, allowSeasonTwo: scope === 'all' });
      }
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Le duel ne peut pas démarrer.'); }
  };
  const onMatchComplete = useCallback((result: CombatState) => {
    if (!match || match.mode === 'training' || !result.matchWinner) return;
    try {
      updateSave(applyMatchResult(saveRef.current, { id: match.id, mode: match.mode, fighterId: match.one, opponentId: match.two, outcome: result.matchWinner === 'one' ? 'won' : 'lost', playedAt: Date.now() }));
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Résultat non enregistré.'); }
  }, [match, updateSave]);
  const exitMatch = () => {
    soundtrack.release();
    setScreen('home');
    setMatch(null);
  };
  const nextMatch = () => {
    soundtrack.release();
    if (match && isRunMode(match.mode)) {
      if (saveRef.current.run?.status === 'active') launchRun(saveRef.current.run);
      else exitMatch();
    } else if (match) launch({ ...match, id: identifier() });
  };
  const toggleSoundtrack = (paused: boolean) => {
    const enabled = !saveRef.current.options.soundtrack;
    changeOption('soundtrack', enabled);
    if (enabled) void soundtrack.start(stage.soundtrack, { paused });
    else soundtrack.stop();
  };
  const openSetup = (nextMode: StandaloneMode) => { setMode(nextMode); setNotice(''); setScreen('setup'); };
  const updateFranchise = (value: string, nextScope = scope) => {
    setFranchise(value);
    setScope(nextScope);
    const valid = STANDALONE_ROSTER.filter(fighter => (value === 'all' || fighter.franchise === value) && (nextScope === 'all' || fighter.spoiler === 'season_1'));
    if (!valid.some(fighter => fighter.character.id === oneId)) setOneId(valid[0].character.id);
    if (!valid.some(fighter => fighter.character.id === twoId)) setTwoId((valid[1] ?? valid[0]).character.id);
  };
  const downloadSave = () => {
    try {
      const url = URL.createObjectURL(new Blob([exportSave(save, STANDALONE_FIGHTER_IDS)], { type: 'application/json' }));
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'infernal-versus-save.json'; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('Sauvegarde exportée.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Export impossible.'); }
  };
  const prepareImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    try {
      if (file.size > MAX_IMPORT_LENGTH) throw new Error('Fichier trop volumineux.');
      setPendingImport(importSave(await file.text(), STANDALONE_FIGHTER_IDS));
      setNotice('Sauvegarde vérifiée. Confirmez son import ci-dessous.');
    } catch (error) { setPendingImport(null); setNotice(error instanceof Error ? error.message : 'Sauvegarde incompatible.'); }
  };
  const run = save.run;

  return <div className="iv-app" data-reduced-motion={save.options.reducedMotion}>
    <a className="iv-skip" href="#infernal-main">Aller au contenu</a>
    <header className="iv-header">
      <button className="iv-brand" onClick={() => setScreen('home')} disabled={screen === 'fight'} aria-label="Hellbound, accueil">
        <span className="iv-brand-mark" aria-hidden="true">H<span>✦</span></span>
        <span>HELLBOUND<small>INFERNAL VERSUS</small></span>
      </button>
      {screen !== 'fight' && <nav aria-label="Navigation principale">
        <button aria-current={screen === 'home' || screen === 'setup' ? 'page' : undefined} onClick={() => setScreen('home')}><Gamepad2 size={17} /> Jouer</button>
        <button aria-current={screen === 'codex' ? 'page' : undefined} onClick={() => setScreen('codex')}><BookOpen size={17} /> Combattants</button>
        <button aria-current={screen === 'options' ? 'page' : undefined} onClick={() => setScreen('options')}><Settings size={17} /> Options</button>
      </nav>}
      <span className="iv-header-note">HAZBIN HOTEL <i>×</i> HELLUVA BOSS</span>
    </header>
    <main id="infernal-main" className="iv-main" ref={mainRef}>
      {storageNotice && <div className="iv-notice" role="status">{storageNotice} {initial.status === 'invalid' && !canPersist && 'L’ancienne donnée reste intacte jusqu’à votre prochaine sauvegarde. Vous pouvez l’exporter depuis Options.'}</div>}
      {notice && <div className="iv-notice" role="status">{notice}</div>}

      {screen === 'home' && <>
        <section className="iv-hero">
          <div className="iv-hero-content">
            <p className="iv-eyebrow"><Sparkles size={15} /> LE RING N’ATTEND PLUS QUE VOUS</p>
            <h1 ref={titleRef} tabIndex={-1}>Tous les démons<br /><em>ont leurs rivaux.</em></h1>
            <p className="iv-hero-copy">Les résidents de l’hôtel et les figures de Helluva Boss se retrouvent dans l’arène. Choisissez votre camp. Faites monter la tension.</p>
            <button className="iv-primary" onClick={() => openSetup('versus')}>Entrer dans l’arène <ArrowRight size={18} /></button>
            <div className="iv-hero-facts"><span><strong>{STANDALONE_ROSTER.length}</strong> combattants</span><span><strong>{PENTAGRAM_STAGES.length}</strong> arènes</span><span><strong>6</strong> modes</span></div>
          </div>
          <div className="iv-hero-cast" aria-hidden="true"><Portrait id="charlie" /><Portrait id="hb_blitzo" /><span>LET’S MAKE<br />A SCENE.</span></div>
        </section>
        <div className="iv-section-heading"><div><p className="iv-eyebrow">À VOUS DE CHOISIR</p><h2>Votre prochaine confrontation</h2></div><span>Clavier & commandes tactiles</span></div>
        <section className="iv-mode-grid" aria-label="Modes de jeu">{MODES.map(item => <button className="iv-mode" key={item.id} onClick={() => openSetup(item.id)}><item.icon size={24} /><span className="iv-eyebrow">{item.label}</span><strong>{item.title}</strong><p>{item.description}</p><ArrowRight className="iv-mode-arrow" size={18} /></button>)}</section>
        <section className="iv-bottom-grid">
          <article className="iv-panel"><p className="iv-eyebrow">VOTRE PARCOURS</p><h2>{run ? modeTitle(run.mode) : 'Une nouvelle histoire de rivalité'}</h2>{run ? <><p>{getStandaloneFighter(run.fighterId)?.character.name} · {run.wins}/{run.opponentIds.length} victoires · {run.status === 'active' ? 'en cours' : run.status === 'complete' ? 'terminé' : 'interrompu'}</p><div className="iv-inline-actions">{run.status === 'active' && <button className="iv-primary" onClick={() => launchRun(run)}>Continuer <ArrowRight size={16} /></button>}{run.status === 'failed' && <button className="iv-primary" onClick={() => { const next = retryRun(run); updateSave({ ...save, run: next }); launchRun(next); }}>Réessayer le duel</button>}<button className="iv-secondary" onClick={() => updateSave({ ...save, run: null })}>Clore le parcours</button></div><small>Reprise au début du duel en cours. Les PV sont restaurés à chaque nouveau duel.</small></> : <p>Arcade, Survie et Boss Rush mémorisent votre avancée entre les combats.</p>}</article>
          <article className="iv-panel"><p className="iv-eyebrow">VOTRE PALMARÈS</p><div className="iv-records"><div><strong>{save.stats.matches}</strong><span>duels joués</span></div><div><strong>{save.stats.wins}</strong><span>victoires J1</span></div><div><strong>{save.stats.bestStreak}</strong><span>meilleure série</span></div></div><small>Le dojo ne modifie pas le palmarès.</small></article>
        </section>
      </>}

      {screen === 'setup' && <>
        <button className="iv-back" onClick={() => setScreen('home')}><ArrowLeft size={16} /> Modes de jeu</button>
        <div className="iv-section-heading"><div><p className="iv-eyebrow">PRÉPAREZ LA RENCONTRE</p><h1 ref={titleRef} tabIndex={-1}>{modeTitle(mode)}</h1></div><span>Exhibition • 2 manches gagnantes</span></div>
        <div className="iv-setup-layout">
          <section className="iv-picker"><div className="iv-filter-row"><label>Univers<select value={franchise} onChange={event => updateFranchise(event.target.value)}><option value="all">Les deux univers</option><option>Hazbin Hotel</option><option>Helluva Boss</option></select></label><label>Contenu<select value={scope} onChange={event => updateFranchise(franchise, event.target.value)}><option value="all">Saisons 1 et 2</option><option value="season_1">Saison 1 uniquement</option></select></label><label>Rechercher<input value={query} onChange={event => setQuery(event.target.value)} placeholder="Nom, style…" /></label></div>
            <div className="iv-slot-switch" role="group" aria-label="Côté à sélectionner"><button aria-pressed={slot === 'one'} onClick={() => setSlot('one')}>J1 · {selectedOne.character.name}</button>{!isRunMode(mode) && <button aria-pressed={slot === 'two'} onClick={() => setSlot('two')}>{mode === 'local' ? 'J2' : mode === 'training' ? 'Mannequin' : 'CPU'} · {selectedTwo.character.name}</button>}</div>
            <div className="iv-roster-grid" aria-label="Choix du combattant">{displayedRoster.map(fighter => <button className={`iv-fighter-tile ${fighter.character.id === oneId ? 'is-one' : ''} ${!isRunMode(mode) && fighter.character.id === twoId ? 'is-two' : ''}`} key={fighter.character.id} onClick={() => slot === 'one' || isRunMode(mode) ? setOneId(fighter.character.id) : setTwoId(fighter.character.id)} aria-pressed={fighter.character.id === (slot === 'one' || isRunMode(mode) ? oneId : twoId)}><Portrait id={fighter.character.id} /><strong>{fighter.character.name}</strong><small>{fighter.franchise === 'Hazbin Hotel' ? 'HAZBIN' : 'HELLUVA'}</small></button>)}</div>
            {displayedRoster.length === 0 && <p className="iv-empty">Aucun combattant ne correspond à cette recherche.</p>}
          </section>
          <aside className="iv-panel iv-match-card"><p className="iv-eyebrow">VOTRE COMBATTANT</p><Portrait id={oneId} key={oneId} className="iv-selected-portrait" /><h2>{selectedOne.character.name}</h2><p>{selectedOne.profile.style}</p><dl className="iv-kit"><div><dt>Léger</dt><dd>{selectedOne.profile.basicMove}</dd></div><div><dt>Lourd</dt><dd>{selectedOne.profile.heavyMove}</dd></div><div><dt>Spécial</dt><dd>{selectedOne.profile.specialMove}</dd></div></dl>
            {mode !== 'local' && mode !== 'training' && <label>Difficulté<select value={save.options.difficulty} onChange={event => changeOption('difficulty', event.target.value as StandaloneOptions['difficulty'])}>{Object.entries(DIFFICULTIES).map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select></label>}
            {mode === 'training' && <label>Mannequin<select value={trainingGuard ? 'guard' : 'idle'} onChange={event => setTrainingGuard(event.target.value === 'guard')}><option value="idle">Immobile</option><option value="guard">Garde permanente</option></select></label>}
            {isRunMode(mode) && <p className="iv-small">Le parcours utilise le filtre d’univers et alterne les arènes. {run?.status === 'active' && 'Démarrer remplacera le parcours en cours.'}</p>}
            <button className="iv-primary" onClick={startMatch}>{isRunMode(mode) ? 'Démarrer le parcours' : 'Lancer le combat'} <Swords size={18} /></button>
          </aside>
        </div>
        {!isRunMode(mode) && <section className="iv-stage-section"><div className="iv-section-heading"><h2>Choisissez votre arène</h2><span>{getPentagramStage(stageId).name}</span></div><div className="iv-stage-grid">{PENTAGRAM_STAGES.map(arena => <button key={arena.id} onClick={() => setStageId(arena.id)} aria-pressed={stageId === arena.id}><img src={arena.thumbnailPath} alt="" loading="lazy" /><span>{arena.name}</span></button>)}</div></section>}
      </>}

      {screen === 'fight' && match && combatants && <div className="iv-live-wrap">
        {isRunMode(match.mode) && run && <div className="iv-run-strip"><strong>{modeTitle(match.mode)}</strong><span>Duel {Math.min((match.runIndex ?? 0) + 1, run.opponentIds.length)} / {run.opponentIds.length} · {run.wins} victoires</span></div>}
        {match.mode === 'training' && <p className="iv-practice-note">Mannequin {trainingGuard ? 'en garde' : 'immobile'} · tension illimitée · récupération après K.O. · aucun score enregistré</p>}
        <PentagramLiveFight key={match.id} fighterOne={combatants.one.character} fighterTwo={combatants.two.character} fighterOneDefinition={combatants.oneDefinition} fighterTwoDefinition={combatants.twoDefinition} matchMode={match.mode === 'local' ? 'local' : 'ai'} aiDifficulty={save.options.difficulty} stage={stage} timeline={match.allowSeasonTwo ? STANDALONE_TIMELINE : { ...STANDALONE_TIMELINE, current: 'season_1_end', hideSpoilers: true, spoilerLevel: 'season_1' }} soundtrackEnabled={save.options.soundtrack} soundtrackStatus={soundtrack.status} onSoundtrackToggle={toggleSoundtrack} onSoundtrackPause={soundtrack.pause} onSoundtrackResume={soundtrack.resume} onExit={exitMatch} training={match.mode === 'training'} trainingGuard={trainingGuard} reducedMotion={save.options.reducedMotion} onMatchComplete={onMatchComplete} onNextMatch={nextMatch} nextMatchLabel={isRunMode(match.mode) ? run?.status === 'active' ? 'Combat suivant' : 'Bilan du parcours' : 'Revanche'} />
      </div>}

      {screen === 'codex' && <>
        <p className="iv-eyebrow">IDENTITÉS & TECHNIQUES</p><h1 ref={titleRef} tabIndex={-1}>Les combattants</h1><p className="iv-lead">{STANDALONE_ROSTER.length} profils sélectionnables. Les techniques, statistiques et confrontations sont des adaptations d’exhibition.</p>
        <div className="iv-codex-grid">{STANDALONE_ROSTER.map(fighter => <article className="iv-panel iv-dossier" key={fighter.character.id}><Portrait id={fighter.character.id} /><div><p className="iv-eyebrow">{fighter.franchise}</p><h2>{fighter.character.name}</h2><p>{fighter.profile.style}</p><ul><li>{fighter.profile.basicMove}</li><li>{fighter.profile.heavyMove}</li><li>{fighter.profile.specialMove}</li></ul><small>{fighter.profile.evidence === 'onscreen' ? 'Gestes inspirés de l’écran' : fighter.profile.evidence === 'motif' ? 'Kit inspiré des motifs du personnage' : 'Kit de simulation, capacités peu documentées'}. Référence : {fighter.source}. {fighter.character.id === 'hb_stolas' && 'Incarnation avant Mastermind.'}</small></div></article>)}</div>
      </>}

      {screen === 'options' && <>
        <p className="iv-eyebrow">À VOTRE MESURE</p><h1 ref={titleRef} tabIndex={-1}>Options & progression</h1>
        <div className="iv-options-grid"><section className="iv-panel"><h2>Confort de jeu</h2><label className="iv-check"><input type="checkbox" checked={save.options.soundtrack} onChange={event => changeOption('soundtrack', event.target.checked)} /> Musique originale des arènes</label><label className="iv-check"><input type="checkbox" checked={save.options.reducedMotion} onChange={event => changeOption('reducedMotion', event.target.checked)} /> Réduire mouvements et flashes</label><label>Difficulté par défaut<select value={save.options.difficulty} onChange={event => changeOption('difficulty', event.target.value as StandaloneOptions['difficulty'])}>{Object.entries(DIFFICULTIES).map(([value, title]) => <option key={value} value={value}>{title}</option>)}</select></label><p className="iv-small">Les réglages de réduction des mouvements du système sont également respectés.</p></section>
          <section className="iv-panel"><h2>Sauvegarde</h2><p>Votre palmarès, vos options et le parcours en cours sont enregistrés automatiquement sur cet appareil.</p><div className="iv-inline-actions"><button className="iv-secondary" onClick={downloadSave}><Download size={16} /> Exporter</button><label className="iv-file-label"><Upload size={16} /> Importer<input type="file" accept=".json,application/json" onChange={event => void prepareImport(event)} /></label></div>{initial.status === 'invalid' && !canPersist && <button className="iv-secondary" onClick={() => { const raw = browserStorage()?.getItem('hellbound_infernal_versus_v1'); if (raw) { const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'infernal-versus-recovery.json'; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); } }}>Exporter la donnée à récupérer</button>}{pendingImport && <div className="iv-import-confirm" role="group" aria-label="Confirmer l’import"><p>{pendingImport.stats.matches} duels · {pendingImport.stats.wins} victoires. Cette sauvegarde remplacera votre progression Infernal Versus.</p><button className="iv-primary" onClick={() => { updateSave(pendingImport); setPendingImport(null); setNotice('Sauvegarde importée.'); }}>Confirmer l’import</button><button className="iv-secondary" onClick={() => setPendingImport(null)}>Annuler</button></div>}</section>
          <section className="iv-panel iv-controls"><h2>Commandes</h2><table><thead><tr><th>Action</th><th>Joueur 1</th><th>Joueur 2</th></tr></thead><tbody><tr><td>Déplacement</td><td>Q / A · D</td><td>← · →</td></tr><tr><td>Garde / accroupi</td><td>E · S</td><td>Maj. droite · ↓</td></tr><tr><td>Saut / provocation</td><td>Z / W · R</td><td>↑ · U</td></tr><tr><td>Léger / lourd / spécial</td><td>F · G · H</td><td>J · K · L</td></tr><tr><td>Pause / quitter</td><td colSpan={2}>P · Échap</td></tr><tr><td>Manche suivante</td><td colSpan={2}>Entrée</td></tr></tbody></table><p className="iv-small">Les boutons tactiles sont disponibles pendant chaque combat. Le spécial consomme la jauge de tension.</p></section>
          <section className="iv-panel"><h2>Derniers duels</h2>{save.recentResults.length === 0 ? <p>Aucun résultat enregistré.</p> : <ol className="iv-history">{save.recentResults.slice(0, 8).map(result => <li key={result.id}><span>{getStandaloneFighter(result.fighterId)?.character.name} / {getStandaloneFighter(result.opponentId)?.character.name}</span><strong>{result.outcome === 'won' ? 'Victoire J1' : result.outcome === 'lost' ? 'Défaite J1' : 'Égalité'}</strong></li>)}</ol>}</section>
        </div>
      </>}
      {screen !== 'fight' && <footer className="iv-footer"><span>HELLBOUND <i>—</i> INFERNAL VERSUS</span><p>Exhibitions libres • Personnages des saisons 1–2 • Projet de fans</p></footer>}
    </main>
  </div>;
}
