import { describe, expect, it } from 'vitest';
import {
  HOTEL_PROLOGUE,
  HOTEL_PROLOGUE_CHAPTERS,
  HOTEL_PROLOGUE_COPY_MAX_WORDS,
  HOTEL_PROLOGUE_SCENES,
  HOTEL_PROLOGUE_SPEAKERS,
  HOTEL_PROLOGUE_VISUAL_PATHS,
  getHotelPrologueProgress,
  getHotelPrologueScene,
  getNextHotelPrologueScene,
} from '../lib/hotel-prologue';

function wordCount(copy: string): number {
  return copy.trim().split(/\s+/).filter(Boolean).length;
}

describe('Hotel first-arrival prologue structure', () => {
  it('provides a substantial four-chapter, sixteen-scene first-run journey', () => {
    expect(HOTEL_PROLOGUE_CHAPTERS).toHaveLength(4);
    expect(HOTEL_PROLOGUE_SCENES).toHaveLength(16);
    expect(HOTEL_PROLOGUE_SCENES.filter(scene => scene.kind === 'cinematic')).toHaveLength(4);
    expect(HOTEL_PROLOGUE_SCENES.filter(scene => scene.kind !== 'cinematic').length).toBeGreaterThanOrEqual(10);

    const estimatedDurationMs = HOTEL_PROLOGUE_SCENES.reduce(
      (total, scene) => total + scene.estimatedDurationMs,
      0,
    );
    expect(estimatedDurationMs).toBeGreaterThanOrEqual(14 * 60_000);
  });

  it('keeps every screen readable instead of producing a wall of text', () => {
    for (const scene of HOTEL_PROLOGUE_SCENES) {
      expect(scene.screens.length, scene.id).toBeGreaterThanOrEqual(2);
      expect(scene.estimatedDurationMs, scene.id).toBeGreaterThan(0);
      expect(scene.objective.instruction, scene.id).not.toHaveLength(0);
      expect(scene.tutorial.prompt, scene.id).not.toHaveLength(0);

      for (const screen of scene.screens) {
        expect(screen.copy.trim(), screen.id).not.toHaveLength(0);
        expect(wordCount(screen.copy), screen.id).toBeLessThanOrEqual(
          HOTEL_PROLOGUE_COPY_MAX_WORDS,
        );
        expect(screen.durationMs, screen.id).toBeGreaterThanOrEqual(3_000);
      }
    }
  });

  it('uses only registered project visuals and speaker portraits', () => {
    const visualPaths = new Set<string>(HOTEL_PROLOGUE_VISUAL_PATHS);
    for (const scene of HOTEL_PROLOGUE_SCENES) {
      expect(visualPaths.has(scene.backgroundPath), scene.id).toBe(true);
      for (const screen of scene.screens) {
        expect(HOTEL_PROLOGUE_SPEAKERS[screen.speakerId], screen.id).toBeDefined();
      }
    }

    for (const speaker of Object.values(HOTEL_PROLOGUE_SPEAKERS)) {
      if (speaker.continuity === 'interface') {
        expect(speaker.portraitPath).toBeNull();
      } else {
        expect(speaker.portraitPath).toMatch(/^\/assets\/sprites\/portraits\/.+\.png$/);
      }
    }
  });

  it('gives Charlie, Vaggie, Husk, and Niffty meaningful guided dialogue', () => {
    const guidedSpeakerIds = new Set(
      HOTEL_PROLOGUE_SCENES
        .filter(scene => scene.kind !== 'cinematic')
        .flatMap(scene => scene.screens.map(screen => screen.speakerId)),
    );

    for (const staffId of ['charlie', 'vaggie', 'husk', 'niffty'] as const) {
      expect(guidedSpeakerIds.has(staffId), staffId).toBe(true);
    }
  });

  it('introduces Marlow as a Simulation AU applicant through consent-led play', () => {
    expect(HOTEL_PROLOGUE.continuity).toBe('simulation_au');
    expect(HOTEL_PROLOGUE.candidateId).toBe('sim_applicant_marlow');
    expect(HOTEL_PROLOGUE_SPEAKERS.sim_applicant_marlow.continuity).toBe('simulation_au');

    const arrivalIndex = HOTEL_PROLOGUE_SCENES.findIndex(scene => (
      scene.focusCharacterIds.includes('sim_applicant_marlow')
    ));
    expect(arrivalIndex).toBeGreaterThanOrEqual(8);
    expect(HOTEL_PROLOGUE_SCENES.slice(arrivalIndex).filter(scene => (
      scene.focusCharacterIds.includes('sim_applicant_marlow')
    )).length).toBeGreaterThanOrEqual(6);

    const allNarrativeCopy = [
      HOTEL_PROLOGUE.disclaimer,
      ...HOTEL_PROLOGUE_SCENES.flatMap(scene => (
        scene.screens.map(screen => screen.copy)
      )),
    ].join(' ');
    expect(allNarrativeCopy).toContain('Simulation AU');
    expect(allNarrativeCopy).toContain('consent-led');
    expect(allNarrativeCopy).not.toMatch(/confirm(?:s|ed)? celestial redemption/i);
    expect(allNarrativeCopy).not.toMatch(/administrative ascension/i);
    expect(allNarrativeCopy).not.toMatch(/changes? (?:his|a|the) soul/i);
  });

  it('teaches active play before unlocking the live campaign', () => {
    const mechanics = HOTEL_PROLOGUE_SCENES.map(scene => scene.tutorial.mechanic);
    for (const mechanic of [
      'move',
      'jump',
      'collect',
      'inspect',
      'dash',
      'avoid_pressure',
      'interact',
      'follow',
      'stabilize',
      'prepare_room',
      'mission_loop',
    ] as const) {
      expect(mechanics).toContain(mechanic);
    }

    const finale = HOTEL_PROLOGUE_SCENES.at(-1);
    expect(finale).toMatchObject({
      kind: 'mission',
      completionFlag: 'hotel-prologue:finale-16',
      tutorial: { mechanic: 'mission_loop' },
    });
    expect(HOTEL_PROLOGUE.firstMissionUnlockFlag).toBe('hotel-shift:campaign-unlocked');
  });
});

describe('Hotel first-arrival prologue progression', () => {
  it('looks up scenes and follows their authored order', () => {
    const first = HOTEL_PROLOGUE_SCENES[0]!;
    const second = HOTEL_PROLOGUE_SCENES[1]!;
    const final = HOTEL_PROLOGUE_SCENES.at(-1)!;

    expect(getHotelPrologueScene(first.id)).toBe(first);
    expect(getNextHotelPrologueScene(first.id)).toBe(second);
    expect(getNextHotelPrologueScene(final.id)).toBeUndefined();
    expect(getHotelPrologueScene('missing-scene')).toBeUndefined();
  });

  it('counts only contiguous flags so a malformed save cannot skip the tutorial', () => {
    const [first, second, third] = HOTEL_PROLOGUE_SCENES;
    if (!first || !second || !third) throw new Error('The prologue needs three scenes.');

    const skipped = getHotelPrologueProgress([
      first.completionFlag,
      third.completionFlag,
    ]);
    expect(skipped).toMatchObject({
      completedSceneCount: 1,
      totalSceneCount: 16,
      currentScene: second,
    });

    const complete = getHotelPrologueProgress(
      HOTEL_PROLOGUE_SCENES.map(scene => scene.completionFlag),
    );
    expect(complete.completedSceneCount).toBe(16);
    expect(complete.ratio).toBe(1);
    expect(complete.isComplete).toBe(true);
    expect(complete.currentScene).toBeNull();
    expect(complete.currentChapter).toBeNull();
  });
});
