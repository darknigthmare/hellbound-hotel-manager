import type { Ref } from 'react';
import { ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import { getCombatSpriteAsset } from '../lib/character-sprites';
import { getPentagramStage } from '../lib/pentagram-stages';
import { STORY_ROUTES, storyIllustration } from './campaign';
import { tournamentTable, type StandaloneRun } from './progression';
import { getStandaloneFighter } from './roster';
import './run-interlude.css';

function name(id: string) {
  return getStandaloneFighter(id)?.character.name ?? id;
}

function tournamentRoundName(matches: number): string {
  if (matches === 4) return 'Quarts de finale';
  if (matches === 2) return 'Demi-finales';
  return 'Finale';
}

interface RunInterludeProps {
  run: StandaloneRun;
  titleRef: Ref<HTMLHeadingElement>;
  onFight: () => void;
  onHome: () => void;
}

export function RunInterlude({ run, titleRef, onFight, onHome }: RunInterludeProps) {
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

  const story = STORY_ROUTES[run.fighterId];
  const ending = run.status === 'complete';
  const chapter = story.chapters[Math.min(run.index, story.chapters.length - 1)];
  const rival = run.index === story.chapters.length - 1 && !ending;
  const first = run.index === 0;
  const stage = getPentagramStage(chapter.stage);
  const beat = ending ? 'ending' : first ? 'intro' : rival ? 'rival' : undefined;
  const illustration = beat && storyIllustration(run.fighterId, beat);
  return <article className="iv-story">
    <button className="iv-back" onClick={onHome}><ArrowLeft size={16} /> Accueil</button>
    <div className="iv-story-layout">
      <div className="iv-story-art">
        <img className="iv-story-location" src={illustration ?? stage.imagePath} alt="" />
        {!illustration && <div className="iv-story-cast" aria-hidden="true">
          {(ending ? [run.fighterId] : [run.fighterId, chapter.opponent]).map(id =>
            <img key={id} src={getCombatSpriteAsset(id)?.portrait} alt="" />)}
        </div>}
      </div>
      <div className="iv-story-copy">
        <p className="iv-eyebrow">{ending ? 'ÉPILOGUE' : first ? 'PROLOGUE' : rival ? 'RIVALITÉ' : 'INTERLUDE'} · {name(run.fighterId)}</p>
        <h1 tabIndex={-1} ref={titleRef}>{story.title}</h1>
        {first && <p className="iv-story-prologue">{story.intro}</p>}
        {ending ? <p>{story.ending}</p> : <>
          <h2>{rival ? 'Rival' : `Duel ${run.index + 1}`} · {name(chapter.opponent)}</h2>
          <p>{chapter.scene}</p><p className="iv-story-stage">{stage.name}</p>
        </>}
        <p className="iv-small">Histoire originale du mode Exhibition.</p>
        <button className="iv-primary" onClick={ending ? onHome : onFight}>{ending ? 'Retour aux modes' : 'Entrer en combat'} <ArrowRight size={18} /></button>
      </div>
    </div>
  </article>;
}
