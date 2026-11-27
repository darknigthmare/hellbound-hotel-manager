import { useState, type Ref } from 'react';
import { ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import { getPentagramStage, type PentagramStage } from '../lib/pentagram-stages';
import { storyIllustration } from './campaign';
import { GLOBAL_CAMPAIGN } from './campaign-global';
import { globalCampaignIllustration, personalCampaignIllustration, type CampaignIllustration } from './campaign-illustrations-v4';
import { getRunStory, tournamentTable, type StandaloneRun } from './progression';
import { getStandaloneFighter, getStandalonePortrait } from './roster';
import './run-interlude.css';

function name(id: string) {
  return getStandaloneFighter(id)?.character.name ?? id;
}

function tournamentRoundName(matches: number): string {
  if (matches === 4) return 'Quarts de finale';
  if (matches === 2) return 'Demi-finales';
  return 'Finale';
}

export function NarrativeArt({ illustration, legacyIllustration, stage, cast, showStageName = false }: {
  illustration?: CampaignIllustration;
  legacyIllustration?: string;
  stage: PentagramStage;
  cast: readonly string[];
  showStageName?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  const artwork = illustration?.src !== failedSource ? illustration : undefined;
  const hasIllustration = Boolean(artwork || legacyIllustration);
  return <div className="iv-story-art" style={artwork ? { aspectRatio: `${artwork.width} / ${artwork.height}` } : undefined}>
    <img
      className="iv-story-location"
      src={artwork?.src ?? legacyIllustration ?? stage.imagePath}
      alt={artwork?.alt ?? ''}
      width={artwork?.width}
      height={artwork?.height}
      style={artwork ? { objectFit: 'contain', display: 'block' } : undefined}
      onError={artwork ? () => setFailedSource(artwork.src) : undefined}
    />
    {!hasIllustration && <div className="iv-story-cast" aria-hidden="true">
      {cast.map(id => <img key={id} src={getStandalonePortrait(id)} alt="" />)}
    </div>}
    {showStageName && <span className="iv-story-art-label">{artwork ? getPentagramStage(artwork.stageId).name : stage.name}</span>}
  </div>;
}

interface RunInterludeProps {
  run: StandaloneRun;
  allowSeasonTwo?: boolean;
  titleRef: Ref<HTMLHeadingElement>;
  onFight: () => void;
  onHome: () => void;
}

export function RunInterlude({ run, allowSeasonTwo = true, titleRef, onFight, onHome }: RunInterludeProps) {
  const active = run.status === 'active';
  if (run.mode === 'tournament') {
    const table = tournamentTable(run.fighterId, run.rosterIds, run.seed, run.status === 'failed' ? run.index : undefined);
    return <section className="iv-tableau" aria-label="Tableau du tournoi">
      <button className="iv-back" onClick={onHome}><ArrowLeft size={16} /> Accueil</button>
      <p className="iv-eyebrow">TOURNOI · ÉLIMINATION DIRECTE</p>
      <h1 tabIndex={-1} ref={titleRef}>{active ? tournamentRoundName(table.rounds[run.index].length) : 'Palmarès du tournoi'}</h1>
      <p className="iv-lead">{active
        ? `Vous jouez ${name(run.fighterId)}. Vous affrontez ${name(run.opponentIds[run.index])} au prochain tour.`
        : `${name(table.champion)} remporte le tournoi. ${run.wins} victoire${run.wins > 1 ? 's' : ''} pour votre combattant.`}</p>
      <div className="iv-bracket">{table.rounds.map((round, roundIndex) => {
        const revealed = !active || roundIndex < run.index;
        const seeded = revealed || roundIndex === run.index;
        return <section key={roundIndex} className="iv-bracket-round">
          <h2>{tournamentRoundName(round.length)}</h2>
          {round.map((bout, index) => <div key={index} className="iv-bracket-bout">
            {[bout.left, bout.right].map((fighter, side) => <div key={side} className={seeded && fighter === run.fighterId ? 'iv-player-seed' : undefined}>
              <span>{seeded ? name(fighter) : 'À déterminer'}</span>
              {revealed && fighter === bout.winner && <span role="img" aria-label="Victoire"><Trophy aria-hidden="true" size={16} /></span>}
            </div>)}
          </div>)}
        </section>;
      })}</div>
      <p className="iv-small">Vous disputez chaque match de votre combattant. Les rencontres entre adversaires sont simulées à la fin du tour.</p>
      <button className="iv-primary" onClick={active ? onFight : onHome}>{active ? 'Disputer le match' : 'Retour aux modes'} <ArrowRight size={18} /></button>
    </section>;
  }

  if (run.mode === 'campaign') {
    const ending = run.status === 'complete';
    const chapter = GLOBAL_CAMPAIGN.chapters[Math.min(run.index, GLOBAL_CAMPAIGN.chapters.length - 1)];
    const previous = run.index > 0 ? GLOBAL_CAMPAIGN.chapters[run.index - 1] : undefined;
    const stage = getPentagramStage(chapter.stageId);
    const illustration = globalCampaignIllustration(run.campaignId, run.campaignVersion, ending ? 'ending' : chapter.id, { allowSeasonTwo });
    return <article className="iv-story iv-global-story" aria-label="Campagne globale">
      <button className="iv-back" onClick={onHome}><ArrowLeft size={16} /> Accueil</button>
      <div className="iv-story-layout">
        <NarrativeArt illustration={illustration} stage={stage} cast={ending ? ['charlie', 'hb_blitzo'] : [chapter.fighterId, chapter.opponentId]} showStageName />
        <div className="iv-story-copy">
          <p className="iv-eyebrow">{ending ? 'ÉPILOGUE' : `CHAPITRE ${run.index + 1} / ${GLOBAL_CAMPAIGN.chapters.length}`} · CAMPAGNE GLOBALE</p>
          <h1 tabIndex={-1} ref={titleRef}>{ending ? GLOBAL_CAMPAIGN.title : chapter.title}</h1>
          {ending ? <><p>{GLOBAL_CAMPAIGN.ending}</p><p className="iv-story-hook">{GLOBAL_CAMPAIGN.nextHook}</p></> : <>
            {run.index === 0 && <details className="iv-story-recap"><summary>Au début de cette nuit…</summary><p>{GLOBAL_CAMPAIGN.intro}</p></details>}
            {previous && <aside className="iv-story-recap"><h2>Précédemment</h2><p>{previous.afterVictory}</p></aside>}
            <p>{chapter.scene}</p>
            <dl className="iv-chapter-brief"><div><dt>Vous jouez</dt><dd>{name(chapter.fighterId)}</dd></div><div><dt>Adversaire</dt><dd>{name(chapter.opponentId)}</dd></div><div><dt>Objectif</dt><dd>{chapter.objective}</dd></div></dl>
            <div className="iv-dialogue">{chapter.dialogue.map((line, index) => <blockquote key={index}><cite>{name(line.speakerId)}</cite><p>« {line.line} »</p></blockquote>)}</div>
          </>}
          <p className="iv-small">Histoire originale dans un univers alternatif. Ces rencontres ne sont pas des événements des séries.</p>
          <button className="iv-primary" onClick={ending ? onHome : onFight}>{ending ? 'Retour aux modes' : 'Entrer en combat'} <ArrowRight size={18} /></button>
        </div>
      </div>
      <ol className="iv-chapter-track" aria-label="Progression des chapitres">{GLOBAL_CAMPAIGN.chapters.map((item, index) => <li key={item.id} aria-current={active && index === run.index ? 'step' : undefined} data-complete={index < run.index}>
        <span>{String(index + 1).padStart(2, '0')}</span><strong>{index <= run.index || ending ? item.title : 'À découvrir'}</strong><small>{index < run.index ? 'Terminé' : index === run.index ? 'En cours' : 'À venir'}</small>
      </li>)}</ol>
    </article>;
  }

  const story = getRunStory(run);
  if (!story) return <section className="iv-panel"><h1 ref={titleRef} tabIndex={-1}>Récit indisponible</h1><button className="iv-primary" onClick={onHome}>Retour aux modes</button></section>;
  const ending = run.status === 'complete';
  const chapter = story.chapters[Math.min(run.index, story.chapters.length - 1)];
  const rival = !ending && (story.rival ? chapter.opponent === story.rival.fighterId : run.index === story.chapters.length - 1);
  const first = run.index === 0;
  const stage = getPentagramStage(chapter.stage);
  const beat = ending ? 'ending' : first ? 'intro' : rival ? 'rival' : undefined;
  const illustration = beat ? personalCampaignIllustration(run.fighterId, run.routeVersion ?? 1, beat, { allowSeasonTwo }) : undefined;
  const legacyIllustration = beat ? storyIllustration(run.fighterId, beat, run.routeVersion ?? 1) : undefined;
  return <article className="iv-story">
    <button className="iv-back" onClick={onHome}><ArrowLeft size={16} /> Accueil</button>
    <div className="iv-story-layout">
      <NarrativeArt illustration={illustration} legacyIllustration={legacyIllustration} stage={stage} cast={ending ? [run.fighterId] : [run.fighterId, chapter.opponent]} />
      <div className="iv-story-copy">
        <p className="iv-eyebrow">{ending ? 'ÉPILOGUE' : first ? 'PROLOGUE' : rival ? 'RIVALITÉ' : 'INTERLUDE'} · {name(run.fighterId)}</p>
        <h1 tabIndex={-1} ref={titleRef}>{story.title}</h1>
        {first && <p className="iv-story-prologue">{story.intro}</p>}
        {ending ? <p>{story.ending}</p> : <>
          <h2>{rival ? 'Rival' : `Duel ${run.index + 1}`} · {name(chapter.opponent)}</h2>
          {chapter.title && <p className="iv-story-chapter-title">{chapter.title}</p>}
          <p>{chapter.scene}</p><p className="iv-story-stage">{stage.name}</p>
        </>}
        {ending && story.nextHook && <p className="iv-story-hook">{story.nextHook}</p>}
        <p className="iv-small">{run.routeVersion === 1 ? 'Archive de la première chronique.' : 'Chronique originale dans un univers alternatif.'} {story.continuity?.incarnation}</p>
        <button className="iv-primary" onClick={ending ? onHome : onFight}>{ending ? 'Retour aux modes' : 'Entrer en combat'} <ArrowRight size={18} /></button>
      </div>
    </div>
  </article>;
}
