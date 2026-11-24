import { describe, expect, it } from 'vitest';
import { getInfernalPoseGroundOffsetPercent, getInfernalPosePlacement } from '../lib/infernal-pose-anchors';

const costume = 'lute-pre-injury';
// Independently inspected lower edges of the boots at alpha >= 16.
const groundedContacts = [
  ['/assets/sprites/individual/lute-ready.webp', 1517],
  ['/assets/sprites/costumes/lute-pre-injury-strike.webp', 1501],
  ['/assets/sprites/costumes/lute-pre-injury-recoil.webp', 1497],
  ['/assets/sprites/costumes/lute-pre-injury-heavy.webp', 1445],
  ['/assets/sprites/costumes/lute-pre-injury-crouch.webp', 1503],
] as const;

describe('Lute S1 ground contacts', () => {
  it.each([168, 310, 460])('keeps all grounded boots on the READY line at image height %i', renderedHeight => {
    const readyLine = 1517 / 1536 * renderedHeight;
    for (const [url, sourceContact] of groundedContacts) {
      const offset = getInfernalPoseGroundOffsetPercent(costume, url);
      expect(offset).toBeDefined();
      const correctedLine = sourceContact / 1536 * renderedHeight + offset! / 100 * renderedHeight;
      expect(correctedLine, url).toBeCloseTo(readyLine, 10);
    }
  });

  it('leaves the airborne jump and unknown artwork without a ground correction', () => {
    expect(getInfernalPoseGroundOffsetPercent(costume, '/assets/sprites/costumes/lute-pre-injury-jump.webp')).toBeUndefined();
    expect(getInfernalPoseGroundOffsetPercent(costume, '/assets/sprites/costumes/carmilla-loose-hair.webp')).toBeUndefined();
    expect(getInfernalPoseGroundOffsetPercent(costume, undefined)).toBeUndefined();
  });

  it('does not anchor the same URL outside the explicitly selected Lute costume', () => {
    for (const [url] of groundedContacts) {
      expect(getInfernalPoseGroundOffsetPercent(undefined, url)).toBeUndefined();
      expect(getInfernalPoseGroundOffsetPercent('another-costume', url)).toBeUndefined();
    }
  });
});

describe('Mammon wide portraits', () => {
  // Foot contacts measured on each PNG, rather than inferred from pose names.
  const contacts = { ready: 1351, guard: 1351, strike: 1352, recoil: 1353 };
  it.each([168, 250, 310])('meets the atlas floor at combatant width %i without stretching', width => {
    for (const [pose, contact] of Object.entries(contacts)) {
      const placement = getInfernalPosePlacement(undefined, `/assets/sprites/individual/hb_mammon-${pose}.webp`)!;
      expect(placement.groundReference).toBe('canvas-bottom');
      const renderedWidth = width * 2 / 3 * placement.renderScale;
      const renderedHeight = renderedWidth * 1536 / 1024;
      const bottomGap = renderedHeight * (1536 - contact) / 1536;
      const correction = renderedHeight * placement.groundOffsetPercent / 100;
      expect(correction - bottomGap).toBeCloseTo(0, 10);
      // READY silhouette is ~94% of the legacy combatant width, rather than
      // the ~67% produced by applying the narrow portrait defaults unchanged.
      if (pose === 'ready') expect(renderedHeight * (1351 - 315) / 1536 / width).toBeCloseTo(0.94427, 4);
    }
  });

  it('does not transfer wide placement to a costume or an unauthored action', () => {
    expect(getInfernalPosePlacement('another-costume', '/assets/sprites/individual/hb_mammon-ready.webp')).toBeUndefined();
    expect(getInfernalPosePlacement(undefined, '/assets/sprites/individual/hb_mammon-jump.webp')).toBeUndefined();
    expect(getInfernalPosePlacement(undefined, '/assets/sprites/helluva/portraits/hb_mammon.png')).toBeUndefined();
  });
});

// Independent alpha >= 16 contacts, visually checked on the main comparison sheet.
const mainContacts = [
  { id: 'vox', ready: 1473, guard: 1469, strike: 1454, recoil: 1465 },
  { id: 'velvette', ready: 1506, guard: 1484, strike: 1444, recoil: 1484 },
  { id: 'carmilla', ready: 1498, guard: 1496, strike: 1493, recoil: 1492 },
] as const;

describe('default Vox, Velvette and Carmilla ground contacts', () => {
  it.each([168, 310, 460])('keeps each set on its own READY line at image height %i', renderedHeight => {
    for (const contacts of mainContacts) {
      const readyLine = contacts.ready / 1536 * renderedHeight;
      for (const pose of ['ready', 'guard', 'strike', 'recoil'] as const) {
        const url = `/assets/sprites/individual/${contacts.id}-${pose}.webp`;
        const offset = getInfernalPoseGroundOffsetPercent(undefined, url);
        expect(offset).toBeDefined();
        const correctedLine = contacts[pose] / 1536 * renderedHeight + offset! / 100 * renderedHeight;
        expect(correctedLine, url).toBeCloseTo(readyLine, 10);
      }
    }
  });

  it('does not anchor default artwork while any costume is selected', () => {
    for (const contacts of mainContacts) {
      for (const pose of ['ready', 'guard', 'strike', 'recoil'] as const) {
        const url = `/assets/sprites/individual/${contacts.id}-${pose}.webp`;
        for (const selectedCostume of ['lute-pre-injury', 'carmilla-loose-hair', 'unknown-costume']) {
          expect(getInfernalPoseGroundOffsetPercent(selectedCostume, url)).toBeUndefined();
        }
      }
    }
  });

  it('leaves jumps, other characters and unrelated artwork unmodified', () => {
    for (const contacts of mainContacts) {
      expect(getInfernalPoseGroundOffsetPercent(undefined, `/assets/sprites/individual/${contacts.id}-jump.webp`)).toBeUndefined();
    }
    expect(getInfernalPoseGroundOffsetPercent(undefined, '/assets/sprites/individual/rosie-ready.webp')).toBeUndefined();
    expect(getInfernalPoseGroundOffsetPercent(undefined, '/assets/sprites/costumes/carmilla-loose-hair.webp')).toBeUndefined();
    expect(getInfernalPoseGroundOffsetPercent(undefined, '/assets/sprites/finishes/vox.webp')).toBeUndefined();
  });
});
