import { useState } from 'react';
import { GLOBAL_CAMPAIGN, GLOBAL_CAMPAIGN_ENDING_ID } from './campaign-global';
import { getStoryRoute, STORY_ROUTES, storyIllustration } from './campaign';
import { globalCampaignIllustration, personalCampaignIllustration } from './campaign-illustrations-v4';
import { getStandaloneFighter } from './roster';
import type { StandaloneSave } from './progression';

function EpilogueArt({ src, alt, width, height }: { src: string; alt: string; width?: number; height?: number }) {
  const [failed, setFailed] = useState(false);
  return failed ? null : <img src={src} alt={alt} width={width} height={height} loading="lazy" onError={() => setFailed(true)} />;
}

export function NarrativeCollection({ save, allowSeasonTwo }: { save: StandaloneSave; allowSeasonTwo: boolean }) {
  const visible = save.storyCompletions.filter(completion => {
    const route = getStoryRoute(completion.fighterId, completion.routeVersion);
    const fighter = getStandaloneFighter(completion.fighterId);
    return route && fighter && (allowSeasonTwo || (fighter.spoiler === 'season_1' && route.continuity?.spoilerTier !== 'season_2'));
  });
  const currentCount = save.storyCompletions.filter(completion => completion.routeVersion === 3).length;
  const globalEndingUnlocked = allowSeasonTwo && save.campaignEndings.includes(GLOBAL_CAMPAIGN_ENDING_ID);
  const globalEndingArt = globalEndingUnlocked
    ? globalCampaignIllustration(GLOBAL_CAMPAIGN.id, GLOBAL_CAMPAIGN.version, 'ending', { allowSeasonTwo }) : undefined;
  return <section className="iv-panel iv-gallery" aria-label="Galerie des épilogues">
    <h2>Galerie des épilogues</h2>
    <p>{currentCount} / {Object.keys(STORY_ROUTES).length} chroniques actuelles terminées</p>
    <p className="iv-small">Les premières chroniques restent dans vos archives. Chaque nouvelle histoire débloque son propre épilogue après ses trois duels.</p>
    {visible.length === 0 && <p>Aucun épilogue disponible avec ce filtre. Terminez une chronique pour la retrouver ici.</p>}
    {visible.map(completion => {
      const story = getStoryRoute(completion.fighterId, completion.routeVersion)!;
      const illustration = personalCampaignIllustration(completion.fighterId, completion.routeVersion, 'ending', { allowSeasonTwo });
      const legacyIllustration = completion.routeVersion === 1 ? storyIllustration(completion.fighterId, 'ending', 1) : undefined;
      return <details key={`${completion.fighterId}:${completion.routeVersion}`}>
        <summary>{getStandaloneFighter(completion.fighterId)?.character.name} · {story.title}{completion.routeVersion === 1 ? ' · Archive' : ''}</summary>
        {illustration ? <EpilogueArt key={illustration.src} src={illustration.src} alt={illustration.alt} width={illustration.width} height={illustration.height} />
          : legacyIllustration && <EpilogueArt key={legacyIllustration} src={legacyIllustration} alt="Illustration de l’épilogue archivé" />}
        <p>{story.ending}</p>
        {story.nextHook && <p className="iv-story-hook">{story.nextHook}</p>}
      </details>;
    })}
    {globalEndingUnlocked && <details>
      <summary>Campagne globale · {GLOBAL_CAMPAIGN.title}</summary>
      {globalEndingArt && <EpilogueArt key={globalEndingArt.src} src={globalEndingArt.src} alt={globalEndingArt.alt} width={globalEndingArt.width} height={globalEndingArt.height} />}
      <p>{GLOBAL_CAMPAIGN.ending}</p><p className="iv-story-hook">{GLOBAL_CAMPAIGN.nextHook}</p>
    </details>}
  </section>;
}

/** The dossier reveals the premise and confrontations, never an unearned ending. */
export function StoryDossier({ fighterId, allowSeasonTwo }: { fighterId: string; allowSeasonTwo: boolean }) {
  const route = getStoryRoute(fighterId);
  if (!route) return null;
  if (!allowSeasonTwo && route.continuity?.spoilerTier === 'season_2') return <p className="iv-small">Cette chronique contient des éléments de la saison 2.</p>;
  return <details className="iv-route-preview">
    <summary>Sa chronique · {route.title}</summary>
    {route.motivation && <p><strong>Motivation.</strong> {route.motivation}</p>}
    {route.stakes && <p><strong>Enjeu.</strong> {route.stakes}</p>}
    <p>{route.intro}</p>
    {route.rival && <p><strong>Rival : {getStandaloneFighter(route.rival.fighterId)?.character.name}.</strong> {route.rival.dramaticReason}</p>}
    <ol>{route.chapters.map((chapter, index) => <li key={index}><strong>{chapter.title ?? `Duel ${index + 1}`}</strong> · {getStandaloneFighter(chapter.opponent)?.character.name}</li>)}</ol>
    <p className="iv-small">Histoire originale en univers alternatif. {route.continuity?.incarnation}</p>
  </details>;
}
