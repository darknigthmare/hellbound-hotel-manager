# Characters — wave F — 24 November 2026

Mode: built-in image generation. One adult character and one READY pose per image, transparent background, facing right. These are newly generated game adaptations and require visual comparison; no claim of certified 1:1 fidelity.

## Source provenance

Existing project identity portraits were inspected at Git commit `3be94943f5315bbe8e7af996ff6ac7f8678a2fa3` in `darknigthmare/hellbound-hotel-manager`: `public/assets/sprites/helluva/portraits/hb_vortex.png`, `hb_glitz.png` and `hb_glam.png`. These existing images are supplementary project references; their presence alone does not certify official provenance or 1:1 production fidelity. Official episode URLs below were verified as source pointers, but no complete frame-by-frame episode comparison was performed in this batch.

- Vortex: official episode, https://www.youtube.com/watch?v=RghsgkZKedg ; official episode, https://www.youtube.com/watch?v=D-2799Y07Zc . Licensed supplementary visual reference: https://youtooz.com/products/vortex (TM and copyright SpindleHorse), downloaded image https://youtooz.com/cdn/shop/files/675r3a7l3p.png?v=1790806579 . The 2D box artwork is an identity reference; the vinyl proportions are not a production model sheet.
- Glitz and Glam: official episode, https://www.youtube.com/watch?v=rRymSi8SmqA . Official merchandise confirmation: https://sharkrobot.com/products/helluva-boss-hanging-keychain-glitz-glam (vendor SpindleHorse, design Calis). Secondary appearance cross-check: https://hazbinhotel.fandom.com/wiki/Glitz_and_Glam . Secondary Glitz visual reference: https://static.wikia.nocookie.net/hazbinhotel/images/5/5f/Glitz_render.png/revision/latest/scale-to-width-down/1200?cb=20250421180544 . Do not treat fan redraws or merchandise as verified animation model sheets.

## Glitz prompt

Use case: stylized-concept.
Asset type: a single full-body READY battle stance sprite for a 2D side-view fighting game.
Input image: the attached Glitz render and existing project portrait are identity, costume, palette and silhouette references, not poses to copy.
Subject: GLITZ, the adult aquatic circus performer from Helluva Boss. Draw only Glitz. Preserve the reference's narrow angular face, spiky teal crest, fin-shaped turquoise eyelashes, black-tipped horns, long fin-like high ponytail, pale blue skin, cyan eyes with dark sclera, pointed dark lips, navy stage outfit, teal asymmetric patterns, and pom-pom accents. Preserve the precise identity and costume from the supplied reference.
Pose: ready stance facing screen-right, lateral three-quarter view suited to a fighting game; feet separated at one ground line, knees softly bent, hands open in a balanced acrobat's guard, confident playful expression. Entire ponytail, horns, hands and feet visible.
Style: the original show's crisp 2D animation linework and flat cel colors, clean polished game sprite. No redesign, no realistic rendering, no 3D.
Composition: one complete character centered in a portrait canvas with generous transparent margins on every side, including the high hair arc. Keep the entire silhouette at least 8 percent inside the canvas. High resolution, sharp small details.
Background: genuine transparent alpha, no white fill, no checkerboard drawing, no scenery, no ground, no cast shadow, no text, no border, no logo, no second character.

## Glam prompt

Use case: stylized-concept.
Asset type: a single full-body READY battle stance sprite for a 2D side-view fighting game.
Input image: existing project portrait of Glam, an identity, costume, palette and silhouette reference, not a pose to copy.
Subject: GLAM, the adult aquatic circus performer from Helluva Boss, in her canonical Mammon pageant stage costume. Draw only Glam, not her twin Glitz. Preserve her pale blue skin and angular face, long smooth teal fringe, black slender eyelashes ending in small round dots, black-tipped horns, huge mostly dark navy fin-like high ponytail with teal edge and two cyan sparkle motifs, cyan irises and dark sclera. Her outfit has a deep teal high collar, canonical inverted-heart chest cutout, navy asymmetric sleeves, teal gloves and a seafoam jester-skirt of triangular points tipped with balls. Her dark leggings have a teal stripe on her anatomical right leg and three cyan diamonds on her anatomical left leg, with cyan pom-poms on the feet. Preserve the precise costume details from the supplied reference.
Pose: ready stance facing screen-right, lateral three-quarter view suited to a fighting game; feet separated on one ground line, knees softly bent, composed acrobat's guard with open hands, serious confident expression. Entire ponytail, horns, hands and feet visible.
Style: exact original-show 2D linework and flat cel palette; clear animation shapes, no redesign, no added armor or weapons, no realistic rendering, no 3D. Nonsexual presentation, ordinary stage attire.
Composition: one complete character centered in a portrait canvas with generous transparent margins on every side; keep the whole silhouette at least 8 percent inside the canvas. High resolution, sharp small details.
Background: genuine transparent alpha, no white fill, no checkerboard drawing, no scenery, no ground, no cast shadow, no text, no border, no logo, no second character.

## Vortex prompt

Use case: stylized-concept.
Asset type: a single full-body READY battle stance sprite for a 2D side-view fighting game.
Input images: existing project Vortex full-body portrait and official licensed Vortex packaging. Match the full-body portrait. Use the 2D cartoon artwork on the package only as an additional identity and color reference; do not draw the box or use the vinyl toy's proportions.
Subject: VORTEX, the adult muscular wolf hellhound bodyguard from Helluva Boss, in his normal demon form and canonical dark torn sleeveless outfit. Tall broad shoulders and heavy muscular arms, dark gray wolf fur with lighter muzzle and chest tuft, battered pointed ears, thick eyebrows, a scar over the blind anatomical left eye and red sclera with white iris on his right eye, long canine muzzle with a dark nose and two visible upper fangs. Keep the red spikes on his short shoulder panels, dark undershirt, torn dark pants, thick wolf tail, large clawed wolf feet and the skull marking on his anatomical left upper arm shown in the full-body reference.
Pose: grounded READY stance facing screen-right, lateral three-quarter view suited to a fighting game; feet separated on the same ground line, knees slightly flexed, fists raised defensively with elbows down, confident calm face. Complete body, ears, claws and tail visible.
Style: accurate clean original-show 2D animation design and flat cel colors, polished game sprite, no photorealism, no 3D, no chibi, no toy proportions, no redesign.
Composition: one complete character centered in a portrait canvas with at least 8 percent transparent margins around his entire silhouette. High resolution with crisp outlines and exact facial landmarks.
Background: genuine transparent alpha, no scenery, no floor, no cast shadow, no white matte, no drawn checkerboard, no typography, no logos, no border, no second character.

## Follow-up output

- `CORRECTION_PROMPTS.json` records two targeted corrections: Vortex eye/scar laterality and Glam costume details.
- `POSE_PROMPTS.json` records the six attempted guard, light-strike and recoil poses for Glitz/Glam. These gestures are gameplay choreography, not claims of canonical powers or depicted attacks.
- `QA_FINAL.json` is the authoritative selection and measurement report. Eight PNGs were selected. Glam light-strike returned no image after an output safety block and remains missing.
- `*-candidate-v1.png` files and the `references/` folder are process material and should not be added to runtime as final new assets.
