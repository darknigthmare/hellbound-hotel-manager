import { describe, expect, it } from 'vitest';
import { getInfernalPoseGroundOffsetPercent } from '../lib/infernal-pose-anchors';

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
