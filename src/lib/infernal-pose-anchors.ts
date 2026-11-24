export interface InfernalPoseGroundAnchor {
  readonly canvasHeight: number;
  /** Lower edge, in source pixels, of the visually checked boot contact. */
  readonly groundContactY: number;
  readonly readyPose: string;
  /** Omitted for default appearances; those must have no costume selected. */
  readonly costumeId?: string;
}

const LUTE_READY = '/assets/sprites/individual/lute-ready.webp';
const VOX_READY = '/assets/sprites/individual/vox-ready.webp';
const VELVETTE_READY = '/assets/sprites/individual/velvette-ready.webp';
const CARMILLA_READY = '/assets/sprites/individual/carmilla-ready.webp';

/**
 * Alpha >= 16 bounds visually checked against Lute S1 and the default Vox,
 * Velvette and Carmilla poses. These lower edges belong to grounded footwear.
 * Measurements use the exclusive bottom edge (last visible row + 1); source
 * assets are documented in the costumes/poses-main-wave-c-2026-11-24 manifests.
 *
 * Jump intentionally has no ground anchor. This only corrects transparent
 * bottom padding relative to READY; it does not normalize size, horizontal
 * pivots or animation cycles, and is not a browser/fidelity certification.
 */
export const INFERNAL_POSE_ANCHORS: Readonly<Record<string, InfernalPoseGroundAnchor>> = {
  [LUTE_READY]: { canvasHeight: 1536, groundContactY: 1517, readyPose: LUTE_READY, costumeId: 'lute-pre-injury' },
  '/assets/sprites/costumes/lute-pre-injury-strike.webp': { canvasHeight: 1536, groundContactY: 1501, readyPose: LUTE_READY, costumeId: 'lute-pre-injury' },
  '/assets/sprites/costumes/lute-pre-injury-recoil.webp': { canvasHeight: 1536, groundContactY: 1497, readyPose: LUTE_READY, costumeId: 'lute-pre-injury' },
  '/assets/sprites/costumes/lute-pre-injury-heavy.webp': { canvasHeight: 1536, groundContactY: 1445, readyPose: LUTE_READY, costumeId: 'lute-pre-injury' },
  '/assets/sprites/costumes/lute-pre-injury-crouch.webp': { canvasHeight: 1536, groundContactY: 1503, readyPose: LUTE_READY, costumeId: 'lute-pre-injury' },
  [VOX_READY]: { canvasHeight: 1536, groundContactY: 1473, readyPose: VOX_READY },
  '/assets/sprites/individual/vox-guard.webp': { canvasHeight: 1536, groundContactY: 1469, readyPose: VOX_READY },
  '/assets/sprites/individual/vox-strike.webp': { canvasHeight: 1536, groundContactY: 1454, readyPose: VOX_READY },
  '/assets/sprites/individual/vox-recoil.webp': { canvasHeight: 1536, groundContactY: 1465, readyPose: VOX_READY },
  [VELVETTE_READY]: { canvasHeight: 1536, groundContactY: 1506, readyPose: VELVETTE_READY },
  '/assets/sprites/individual/velvette-guard.webp': { canvasHeight: 1536, groundContactY: 1484, readyPose: VELVETTE_READY },
  '/assets/sprites/individual/velvette-strike.webp': { canvasHeight: 1536, groundContactY: 1444, readyPose: VELVETTE_READY },
  '/assets/sprites/individual/velvette-recoil.webp': { canvasHeight: 1536, groundContactY: 1484, readyPose: VELVETTE_READY },
  [CARMILLA_READY]: { canvasHeight: 1536, groundContactY: 1498, readyPose: CARMILLA_READY },
  '/assets/sprites/individual/carmilla-guard.webp': { canvasHeight: 1536, groundContactY: 1496, readyPose: CARMILLA_READY },
  '/assets/sprites/individual/carmilla-strike.webp': { canvasHeight: 1536, groundContactY: 1493, readyPose: CARMILLA_READY },
  '/assets/sprites/individual/carmilla-recoil.webp': { canvasHeight: 1536, groundContactY: 1492, readyPose: CARMILLA_READY },
};

/** Positive percentages move down by a fraction of the rendered image height. */
export function getInfernalPoseGroundOffsetPercent(
  costumeId: string | undefined,
  poseUrl: string | undefined,
): number | undefined {
  if (!poseUrl || !Object.hasOwn(INFERNAL_POSE_ANCHORS, poseUrl)) {
    return undefined;
  }
  const anchor = INFERNAL_POSE_ANCHORS[poseUrl];
  if (anchor.costumeId !== costumeId) return undefined;
  const baseline = INFERNAL_POSE_ANCHORS[anchor.readyPose];
  return 100 * (baseline.groundContactY / baseline.canvasHeight - anchor.groundContactY / anchor.canvasHeight);
}
