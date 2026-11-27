export interface InfernalPoseGroundAnchor {
  readonly canvasHeight: number;
  /** Lower edge, in source pixels, of the visually checked boot contact. */
  readonly groundContactY: number;
  readonly readyPose: string;
  /** Omitted for default appearances; those must have no costume selected. */
  readonly costumeId?: string;
  /** A wide portrait may need to meet the atlas floor instead of its READY padding. */
  readonly groundReference?: 'canvas-bottom';
  readonly renderScale?: number;
}

const LUTE_READY = '/assets/sprites/individual/lute-ready.webp';
const VOX_READY = '/assets/sprites/individual/vox-ready.webp';
const VELVETTE_READY = '/assets/sprites/individual/velvette-ready.webp';
const CARMILLA_READY = '/assets/sprites/individual/carmilla-ready.webp';
const MAMMON_READY = '/assets/sprites/individual/hb_mammon-ready.webp';
const VORTEX_READY = '/assets/sprites/individual/hb_vortex-ready.webp';
const GLITZ_READY = '/assets/sprites/individual/hb_glitz-ready.webp';
const GLAM_READY = '/assets/sprites/individual/hb_glam-ready.webp';
const ALASTOR_READY = '/assets/sprites/stances/alastor.webp';
const MOXXINE_READY = '/assets/sprites/costumes/hb_moxxie-moxxine.webp';
const MILLERD_READY = '/assets/sprites/costumes/hb_millie-millerd.webp';
const VORTEX_HUMAN_READY = '/assets/sprites/costumes/hb_vortex-human-disguise.webp';
const FIZZ_CASUAL_READY = '/assets/sprites/costumes/hb_fizzarolli-casual-oops.webp';
const STOLAS_SINSMAS_READY = '/assets/sprites/costumes/hb_stolas-deposed-sinsmas.webp';

/**
 * Alpha >= 16 bounds visually checked against Lute S1 and the default Vox,
 * Velvette and Carmilla poses. These lower edges belong to grounded footwear.
 * Measurements use the exclusive bottom edge (last visible row + 1); source
 * assets are documented in the costumes/poses-main-wave-c-2026-11-24 manifests.
 *
 * Those legacy sets only correct bottom padding relative to READY. Mammon's
 * four wide portraits additionally use the explicit placement below. Jump has
 * no ground anchor. Horizontal pivots and animation cycles remain untouched;
 * these measured placements are not a browser/fidelity certification.
 */
export const INFERNAL_POSE_ANCHORS: Readonly<Record<string, InfernalPoseGroundAnchor>> = {
  // These outfits keep one static READY through all actions. Their measured
  // footwear meets the canvas floor while the native image and soft alpha stay intact.
  [MOXXINE_READY]: { canvasHeight: 1536, groundContactY: 1488, readyPose: MOXXINE_READY, costumeId: 'hb_moxxie-moxxine', groundReference: 'canvas-bottom' },
  [MILLERD_READY]: { canvasHeight: 1536, groundContactY: 1485, readyPose: MILLERD_READY, costumeId: 'hb_millie-millerd', groundReference: 'canvas-bottom' },
  [VORTEX_HUMAN_READY]: { canvasHeight: 1536, groundContactY: 1510, readyPose: VORTEX_HUMAN_READY, costumeId: 'hb_vortex-human-disguise', groundReference: 'canvas-bottom' },
  [FIZZ_CASUAL_READY]: { canvasHeight: 1312, groundContactY: 1296, readyPose: FIZZ_CASUAL_READY, costumeId: 'hb_fizzarolli-casual-oops', groundReference: 'canvas-bottom' },
  [STOLAS_SINSMAS_READY]: { canvasHeight: 1536, groundContactY: 1522, readyPose: STOLAS_SINSMAS_READY, costumeId: 'hb_stolas-deposed-sinsmas', groundReference: 'canvas-bottom' },
  // Native canvases are preserved. A contain frame fits these near-square
  // Vortex images by height, so each measured foot line meets the same floor.
  [VORTEX_READY]: { canvasHeight: 1310, groundContactY: 1268, readyPose: VORTEX_READY, groundReference: 'canvas-bottom' },
  '/assets/sprites/individual/hb_vortex-guard.webp': { canvasHeight: 1419, groundContactY: 1376, readyPose: VORTEX_READY, groundReference: 'canvas-bottom' },
  '/assets/sprites/individual/hb_vortex-strike.webp': { canvasHeight: 1419, groundContactY: 1367, readyPose: VORTEX_READY, groundReference: 'canvas-bottom' },
  '/assets/sprites/individual/hb_vortex-recoil.webp': { canvasHeight: 1419, groundContactY: 1387, readyPose: VORTEX_READY, groundReference: 'canvas-bottom' },
  [GLITZ_READY]: { canvasHeight: 1380, groundContactY: 1301, readyPose: GLITZ_READY, groundReference: 'canvas-bottom' },
  '/assets/sprites/individual/hb_glitz-guard.webp': { canvasHeight: 1456, groundContactY: 1371, readyPose: GLITZ_READY, groundReference: 'canvas-bottom' },
  '/assets/sprites/individual/hb_glitz-strike.webp': { canvasHeight: 1380, groundContactY: 1298, readyPose: GLITZ_READY, groundReference: 'canvas-bottom' },
  '/assets/sprites/individual/hb_glitz-recoil.webp': { canvasHeight: 1380, groundContactY: 1288, readyPose: GLITZ_READY, groundReference: 'canvas-bottom' },
  [GLAM_READY]: { canvasHeight: 1312, groundContactY: 1226, readyPose: GLAM_READY, groundReference: 'canvas-bottom' },
  '/assets/sprites/individual/hb_glam-guard.webp': { canvasHeight: 1420, groundContactY: 1341, readyPose: GLAM_READY, groundReference: 'canvas-bottom' },
  '/assets/sprites/individual/hb_glam-recoil.webp': { canvasHeight: 1312, groundContactY: 1220, readyPose: GLAM_READY, groundReference: 'canvas-bottom' },
  // Alastor retains the original landscape READY and its existing ground line.
  [ALASTOR_READY]: { canvasHeight: 1024, groundContactY: 990, readyPose: ALASTOR_READY },
  '/assets/sprites/individual/alastor-guard.webp': { canvasHeight: 1024, groundContactY: 992, readyPose: ALASTOR_READY },
  '/assets/sprites/individual/alastor-recoil.webp': { canvasHeight: 1024, groundContactY: 990, readyPose: ALASTOR_READY },
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
  // Mammon's width leaves substantial portrait padding. A uniform 1.4 scale
  // keeps his visible height close to the existing square atlas (~94% of the
  // combatant width); canvas-bottom removes the 183–185px transparent foot gap.
  // This is an explicit four-image placement, not a canonical size assertion.
  [MAMMON_READY]: { canvasHeight: 1536, groundContactY: 1351, readyPose: MAMMON_READY, groundReference: 'canvas-bottom', renderScale: 1.4 },
  '/assets/sprites/individual/hb_mammon-guard.webp': { canvasHeight: 1536, groundContactY: 1351, readyPose: MAMMON_READY, groundReference: 'canvas-bottom', renderScale: 1.4 },
  '/assets/sprites/individual/hb_mammon-strike.webp': { canvasHeight: 1536, groundContactY: 1352, readyPose: MAMMON_READY, groundReference: 'canvas-bottom', renderScale: 1.4 },
  '/assets/sprites/individual/hb_mammon-recoil.webp': { canvasHeight: 1536, groundContactY: 1353, readyPose: MAMMON_READY, groundReference: 'canvas-bottom', renderScale: 1.4 },
};

export interface InfernalPosePlacement {
  readonly groundOffsetPercent: number;
  readonly groundReference: 'ready-relative' | 'canvas-bottom';
  readonly renderScale: number;
}

export function getInfernalPosePlacement(
  costumeId: string | undefined,
  poseUrl: string | undefined,
): InfernalPosePlacement | undefined {
  if (!poseUrl || !Object.hasOwn(INFERNAL_POSE_ANCHORS, poseUrl)) {
    return undefined;
  }
  const anchor = INFERNAL_POSE_ANCHORS[poseUrl];
  if (anchor.costumeId !== costumeId) return undefined;
  const baseline = INFERNAL_POSE_ANCHORS[anchor.readyPose];
  const reference = anchor.groundReference === 'canvas-bottom'
    ? 1 : baseline.groundContactY / baseline.canvasHeight;
  return {
    groundOffsetPercent: 100 * (reference - anchor.groundContactY / anchor.canvasHeight),
    groundReference: anchor.groundReference ?? 'ready-relative',
    renderScale: anchor.renderScale ?? 1,
  };
}

/** Positive percentages move down by a fraction of the rendered image height. */
export function getInfernalPoseGroundOffsetPercent(
  costumeId: string | undefined,
  poseUrl: string | undefined,
): number | undefined {
  return getInfernalPosePlacement(costumeId, poseUrl)?.groundOffsetPercent;
}
