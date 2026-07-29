import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import {
  FastForward,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  HOTEL_PROLOGUE,
  HOTEL_PROLOGUE_CHAPTERS,
  HOTEL_PROLOGUE_SCENES,
  HOTEL_PROLOGUE_SPEAKERS,
  type HotelPrologueScene,
} from '../lib/hotel-prologue';
import type { OnboardingPhase, OnboardingState } from '../types';
import '../styles/hotel-opening.css';

interface HotelOpeningProps {
  onboarding: OnboardingState;
  showTitle: boolean;
  onContinueCampaign: () => void;
  onBeginStory: () => void;
  onReplayStory: () => void;
  onAdvanceScene: (
    sceneId: string,
    nextSceneId: string | null,
    nextPhase: OnboardingPhase,
  ) => void;
  onBeginTutorial: (sceneId: string) => void;
  onSkipStory: () => void;
}

type OpeningStyle = CSSProperties & Record<`--opening-${string}`, string | number>;

const OPENING_SCENES = HOTEL_PROLOGUE_SCENES.filter(
  scene => scene.kind === 'cinematic',
);

function nextIncompleteOpeningScene(
  onboarding: OnboardingState,
): HotelPrologueScene {
  return OPENING_SCENES.find(
    scene => !onboarding.completedSceneIds.includes(scene.id),
  ) ?? OPENING_SCENES[0]!;
}

function titleActionLabel(onboarding: OnboardingState): string {
  if (onboarding.phase === 'complete') return 'Continue campaign';
  if (onboarding.status === 'in_progress') return 'Resume prologue';
  return 'Begin a new story';
}

export function HotelOpening({
  onboarding,
  showTitle,
  onContinueCampaign,
  onBeginStory,
  onReplayStory,
  onAdvanceScene,
  onBeginTutorial,
  onSkipStory,
}: HotelOpeningProps) {
  const activeScene = useMemo(
    () => nextIncompleteOpeningScene(onboarding),
    [onboarding],
  );
  const [screenIndex, setScreenIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const screen = activeScene.screens[screenIndex] ?? activeScene.screens[0]!;
  const speaker = HOTEL_PROLOGUE_SPEAKERS[screen.speakerId];
  const chapter = HOTEL_PROLOGUE_CHAPTERS.find(
    candidate => candidate.id === activeScene.chapterId,
  );
  const sceneIndex = OPENING_SCENES.findIndex(scene => scene.id === activeScene.id);
  const overallBeat = OPENING_SCENES
    .slice(0, sceneIndex)
    .reduce((total, scene) => total + scene.screens.length, 0) + screenIndex;
  const overallBeatCount = OPENING_SCENES.reduce(
    (total, scene) => total + scene.screens.length,
    0,
  );

  useEffect(() => {
    if (showTitle || paused) return;
    const timer = window.setTimeout(() => {
      const isLastScreen = screenIndex >= activeScene.screens.length - 1;
      if (!isLastScreen) {
        setScreenIndex(index => index + 1);
        return;
      }
      const nextScene = OPENING_SCENES[sceneIndex + 1] ?? null;
      if (!nextScene) {
        onBeginTutorial(activeScene.id);
        return;
      }
      onAdvanceScene(
        activeScene.id,
        nextScene.id,
        nextScene.order >= 2 ? 'prologue' : 'intro',
      );
    }, screen.durationMs);
    return () => window.clearTimeout(timer);
  }, [
    activeScene,
    onAdvanceScene,
    onBeginTutorial,
    paused,
    sceneIndex,
    screen.durationMs,
    screenIndex,
    showTitle,
  ]);

  useEffect(() => {
    if (showTitle) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape') {
        setPaused(value => !value);
        return;
      }
      if (
        event.code !== 'Enter'
        && event.code !== 'Space'
        && event.code !== 'ArrowRight'
      ) return;
      event.preventDefault();
      const isLastScreen = screenIndex >= activeScene.screens.length - 1;
      if (!isLastScreen) {
        setScreenIndex(index => index + 1);
        return;
      }
      const nextScene = OPENING_SCENES[sceneIndex + 1] ?? null;
      if (!nextScene) {
        onBeginTutorial(activeScene.id);
        return;
      }
      onAdvanceScene(
        activeScene.id,
        nextScene.id,
        nextScene.order >= 2 ? 'prologue' : 'intro',
      );
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeScene,
    onAdvanceScene,
    onBeginTutorial,
    sceneIndex,
    screenIndex,
    showTitle,
  ]);

  if (showTitle) {
    const continueStory = onboarding.phase === 'complete'
      ? onContinueCampaign
      : onBeginStory;

    return (
      <main className="hotel-title-screen">
        <div className="hotel-title-screen__city" aria-hidden="true" />
        <div className="hotel-title-screen__hotel" aria-hidden="true" />
        <section className="hotel-title-card" aria-labelledby="hotel-game-title">
          <span className="hotel-title-card__eyebrow">
            <Sparkles size={15} aria-hidden="true" />
            A playable Simulation AU
          </span>
          <h1 id="hotel-game-title">Hellbound <span>Hotel Manager</span></h1>
          <p className="hotel-title-card__promise">
            Keep one impossible promise alive, one shift and one willing resident
            at a time.
          </p>
          <div className="hotel-title-card__actions">
            <button
              type="button"
              className="hotel-opening-action is-primary"
              onClick={continueStory}
            >
              <Play size={18} fill="currentColor" aria-hidden="true" />
              {titleActionLabel(onboarding)}
            </button>
            {onboarding.phase === 'complete' && (
              <button
                type="button"
                className="hotel-opening-action"
                onClick={onReplayStory}
              >
                <RotateCcw size={17} aria-hidden="true" />
                Replay intro and tutorial
              </button>
            )}
          </div>
          <small>
            {HOTEL_PROLOGUE.disclaimer}
          </small>
        </section>
        <span className="hotel-title-screen__version">Local-first campaign · v0.1</span>
      </main>
    );
  }

  const backgroundStyle = {
    '--opening-background': `url("${activeScene.backgroundPath}")`,
    '--opening-duration': `${screen.durationMs}ms`,
    '--opening-progress': `${((overallBeat + 1) / overallBeatCount) * 100}%`,
  } as OpeningStyle;

  return (
    <main
      className="hotel-opening"
      style={backgroundStyle}
      data-scene-id={activeScene.id}
      data-screen-id={screen.id}
    >
      <div className="hotel-opening__backdrop" aria-hidden="true" />
      <header className="hotel-opening__header">
        <div>
          <span>{onboarding.phase === 'intro' ? 'Introduction' : 'Prologue'}</span>
          <strong>{chapter?.title} · {activeScene.title}</strong>
        </div>
        <div className="hotel-opening__scene-count">
          Scene {sceneIndex + 1}/{OPENING_SCENES.length}
        </div>
      </header>

      <div className="hotel-opening__progress" aria-hidden="true">
        <i />
      </div>

      <section
        className={`hotel-opening__dialogue${speaker.portraitPath ? ' has-portrait' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {speaker.portraitPath && (
          <img src={speaker.portraitPath} alt="" aria-hidden="true" />
        )}
        <div className="hotel-opening__copy">
          <span>{speaker.name}</span>
          <p>{screen.copy}</p>
          <small>Enter, Space or → to continue</small>
        </div>
      </section>

      <footer className="hotel-opening__controls">
        <button
          type="button"
          onClick={() => setPaused(value => !value)}
          aria-pressed={paused}
        >
          {paused
            ? <Play size={16} fill="currentColor" aria-hidden="true" />
            : <Pause size={16} fill="currentColor" aria-hidden="true" />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" onClick={onSkipStory}>
          <FastForward size={16} aria-hidden="true" />
          Skip to playable tutorial
        </button>
      </footer>

      {paused && (
        <div className="hotel-opening__paused" role="status">
          <span>Story paused</span>
          <strong>The hotel door will still be here.</strong>
        </div>
      )}
    </main>
  );
}
