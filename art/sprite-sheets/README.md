# Character sprite atlases

The runtime art catalogue contains 491 validated 6×4 atlases covering 100 illustrated Hazbin profiles and 108 optional Helluva Boss profiles: 11,784 animation cells and 208 extracted portraits in total. Hazbin has 25 identity/base atlases, 175 supplementary combat atlases and 75 intro/victory/draw cinematic atlases. Helluva Boss has 27 identity/base atlases and 189 supplementary combat atlases. Every Hazbin identity therefore has 48 combat poses plus 18 cinematic poses; every Helluva identity has 48 combat poses. Existing Hazbin finals live in `public/assets/sprites/sheets/`; the expanded Hazbin roster publishes under `public/assets/sprites/hazbin/`; the isolated Helluva Boss finals live under `public/assets/sprites/helluva/`. Every final atlas is a transparent 1536×1024 PNG. Only neutral poses from base atlases are extracted by `scripts/build_sprite_assets.py`; supplementary banks never create duplicate portraits.

The chroma-key generation masters are retained in `chroma/`. Local third-party visual reference files remain ignored under `references/`, while the tracked provenance index in `references/hazbin/references.json` records the source pages and image URLs used to guide the original generated assets.

## Continuity rules

- The app starts at `season_1_start`, so Charlie, Vaggie, Angel Dust, Alastor, Husk, Niffty, Sir Pentious, Lucifer, Adam, Emily, Sera and Lute use Season 1 continuity.
- Baxter and Abel use their official Season 2 designs and remain spoiler-scoped in the database.
- Marlow Glass and Ember Vale are original, non-canon `Simulation AU` applicants. Their designs must never be presented as series canon.
- Generated poses are original gameplay animation poses; the references anchor identity, silhouette, palette and costume.
- Helluva Boss profiles never enter the hotel resident database. Their twenty-seven atlases and 108 portraits belong only to the optional I.M.P. Simulation AU campaign.
- Helluva coverage stops at published Seasons 1–2 and released Shorts. Unreleased Season 3 material, pilot-only characters, artist personas and anonymous decorative crowds are excluded.
- The expanded Hazbin roster intentionally mixes series, pilot/legacy, historical-human and named-background scopes. Its directory metadata must preserve those distinctions; inclusion in an atlas never upgrades a profile to series canon.

## Extended Hazbin roster (published)

This collection is all-or-nothing. Final atlases publish to `/assets/sprites/hazbin/sheets/<atlas>.png`; the row IDs below publish as `/assets/sprites/hazbin/portraits/<id>.png`. The `hz_` prefix keeps this directory roster separate from the 24 historical database IDs.

The machine-readable generation contract is [`hazbin-expansion-manifest.json`](./hazbin-expansion-manifest.json). It fixes canvas geometry, pose semantics, row order, IDs, names and public destinations for every ImageGen pass.

## Base six-pose compatibility contract

Every base atlas remains compatible with the versioned
`six-pose-combat-v2` animation set. The legacy contract keeps the existing
atlas URLs and row indices stable for galleries, portrait extraction and
collections that do not yet have supplementary art.

The six authored atlas columns retain their reviewed meaning:

| Column | Key-pose role |
| --- | --- |
| 0 | Neutral portrait / idle source used by directory portraits |
| 1 | Expressive conversation |
| 2 | Directional combat-ready stance facing screen-right |
| 3 | Attack startup or light strike |
| 4 | Attack impact or hit reaction |
| 5 | Victory or recovery |

The runtime composes those key poses into coherent clips:

| Clip | Column sequence | Total sprite timing |
| --- | --- | --- |
| `idle` | 2 | 800 ms loop; CSS supplies the breathing motion |
| `walk` | 2 | 210 ms loop; stage movement and CSS supply locomotion |
| `guard` | 2 | 250 ms loop with the existing guard feedback |
| `light` | 2 → 3 → 4 → 2 | 340 ms total; column 4 begins after the engine's 120 ms startup |
| `heavy` | 2 → 3 → 4 → 5 | 460 ms total; column 4 begins after the engine's 220 ms startup |
| `special` | 2 → 3 → 4 → 5 | 700 ms total; column 4 begins after the engine's 360 ms startup |

Hit and K.O. reuse column 4, while victory reuses column 5. Columns 0 and 1
remain outside the live fight because they are not consistently directional;
using them there can make a fighter appear to look away from the opponent.
This is deliberately honest about the current art: idle, walk and guard are
single-key-pose sprite clips augmented by motion effects, not invented
multi-frame drawings.

## Shared eight-bank combat contract

All 100 illustrated Hazbin identities and all 108 Helluva Boss DLC identities
select `eight-bank-combat-v4`. The machine-readable contracts are
[`hazbin-animation-banks-manifest.json`](./hazbin-animation-banks-manifest.json)
and
[`helluva-animation-banks-manifest.json`](./helluva-animation-banks-manifest.json).
The 52 authoritative identity atlases multiplied by seven supplementary banks
produce 364 files and 8,736 new cells: 175 Hazbin atlases (4,200 cells) and
189 Helluva atlases (4,536 cells). Each character receives 42 supplementary
poses, for 48 authored combat poses when the six base cells are included.

| Bank | Six authored columns |
| --- | --- |
| `movement` | Stable idle; weight shift; walk contact A; walk passing; walk contact B; dash/brake |
| `offense` | Light startup; light contact; light recovery; heavy/signature startup; heavy/signature contact; heavy/signature recovery |
| `reaction` | Guard entry; guard impact; light hit; heavy hit; knockdown; K.O./disabled |
| `taunt` | Entry; gesture; flourish; peak; settle; return |
| `jump` | Takeoff; launch; rise; apex; descent; landing |
| `crouch` | Transition; idle A; idle B; guard; attack-ready; stand |
| `recoil` | Impact; snap; stagger; airborne; skid; recovery |

The live renderer changes both bank and column while preserving the base
atlas row. It preloads only the seven banks belonging to the two active
fighters, deduplicates shared atlases, and stages the less frequent poses after
the movement/offense/recoil set to avoid a single decode spike. Loop time comes from the paused, hitstop-aware round clock, so real
idle, walk, crouch and guard frames advance without continuing in a paused tab.
Fighter two still mirrors a source pose authored facing screen-right, keeping
both opponents oriented toward each other.

ImageGen chroma masters live under
`art/sprite-sheets/chroma/<collection>-animation/<bank>/`. Twelve visually
reviewed anchor masters cover all four new banks for Hazbin `core-a` and
Helluva `helluva-core`, taunt plus crouch for `hell-antagonists`, recoil for
`overlords`, and taunt for `hazbin-companions`. The remaining families are
deterministic, identity-preserving motion derivatives of the already reviewed
OpenAI base/combat art. This gives four Hazbin fighters fully redrawn
supplementary motion and twelve more fighters at least one original new bank,
while keeping all 208 identities complete without substituting a generic
silhouette. ImageGen candidates with visible cell-edge clipping are rejected
and remain on their validated derivatives.
Run `python -m scripts.generate_motion_bank_masters` to rebuild or validate all
289 motion masters. Then run `python -m scripts.prepare_hazbin_animations` and
`python -m scripts.prepare_helluva_animations` to key and atomically publish
all 364 supplementary files. Each module accepts `--check` to reopen and
validate every 6×4 RGBA output. The passes enforce a 6 px alpha gutter and
never extract supplementary portraits.

The live fight passes each sprite's `animationSetId` and the fighter-style
scaled `actionDurationMs` into the resolver. The resolver normalizes startup
and recovery around the rounded impact boundary, so rushdown, zoner, bruiser
and boss timing all enter column 4 on the same frame that damage is resolved.
Incoming light, heavy and special attacks then begin on reaction columns 2, 3
and 4 respectively before flowing through the six-frame recoil sequence.

## Hazbin three-bank cinematic contract

All 100 illustrated Hazbin identities also select
`three-bank-cinematics-v1`. The machine-readable contract is
[`hazbin-cinematic-banks-manifest.json`](./hazbin-cinematic-banks-manifest.json):
25 identity atlases multiplied by the `intro`, `victory`, and `draw` banks
produces 75 additional files and 1,800 genuinely new cells. No cinematic bank
falls back to or copies a base/combat pose. Each character therefore has 18
new cinematic poses and 66 published poses in total: 6 base, 42 supplementary
combat poses and 18 cinematic poses.

| Bank | Six authored columns |
| --- | --- |
| `intro` | Entrance; arrival; stance; signature flourish; challenge; ready pose |
| `victory` | Win reaction; confidence; celebration; peak triumph; flourish; winner pose |
| `draw` | Exhaustion; recovery; opponent check; acknowledgement; breath; unresolved pose |

ImageGen chroma masters live under
`art/sprite-sheets/chroma/hazbin-cinematics/<bank>/`. Run
`python scripts/prepare_hazbin_cinematics.py` to isolate, normalize, validate,
and atomically publish all 75 transparent atlases under
`/assets/sprites/hazbin/cinematics/v1/`. The `--check` pass reopens every
published RGBA atlas and validates all 1,800 cells.

`scripts/build_sprite_assets.py --check` validates the contract before it
extracts any portrait. In addition to dimensions, row maps, RGBA output,
visible-cell density and the stricter expanded-Hazbin gutters, it compares all
six alpha silhouettes in every character row. Any pair with less than 2%
meaningful alpha difference is rejected as a duplicated or mis-cut pose. The
Hazbin manifest is schema version 2 and must match the Python pipeline and
TypeScript animation registry exactly.

During Hazbin master preparation, nearby detached alpha components must contain
at least 24 pixels and 0.5% of the primary silhouette. This removes tiny chroma
or floor debris while retaining meaningful detached costume parts. Historical
portrait extraction and other collections keep their previous permissive
threshold.

| Final atlas | Rows, top to bottom (`id` — display name) |
| --- | --- |
| `hazbin-family-media.png` | `hz_lilith` — Lilith Morningstar; `hz_mimzy` — Mimzy; `hz_katie_killjoy` — Katie Killjoy; `hz_tom_trench` — Tom Trench |
| `hazbin-companions.png` | `hz_frank_egg_boi` — Frank; `hz_razzle` — Razzle; `hz_dazzle` — Dazzle; `hz_keekee` — KeeKee |
| `hazbin-heaven-pets.png` | `hz_fat_nuggets` — Fat Nuggets; `hz_st_peter` — St. Peter; `hz_speaker_of_god` — Speaker of God; `hz_molly` — Molly |
| `hazbin-carmine-overlords.png` | `hz_clara_carmine` — Clara Carmine; `hz_odette_carmine` — Odette Carmine; `hz_maestro` — Maestro; `hz_prick` — Prick |
| `hazbin-overlord-fringe.png` | `hz_hatchet` — Hatchet; `hz_shok_wav` — Shok.wav; `hz_susan` — Susan; `hz_rooster` — Rooster |
| `hazbin-season2-network.png` | `hz_ethan` — Ethan; `hz_melissa` — Melissa; `hz_salina` — Salina; `hz_zack_rabbit` — Zack Rabbit |
| `hazbin-city-names-a.png` | `hz_myk_mic_guy` — Myk the Mic Guy; `hz_man_meat` — Man Meat; `hz_buddy_mcsluggy` — Buddy McSluggy; `hz_bryrin` — Bryrin |
| `hazbin-city-names-b.png` | `hz_egg_boiz` — Egg Boiz; `hz_rocky` — Rocky; `hz_dia` — Dia; `hz_summer` — Summer |
| `hazbin-angel-family.png` | `hz_arackniss` — Arackniss; `hz_angel_father` — Angel Dust’s father; `hz_crymini` — Crymini; `hz_villa` — Villa |
| `hazbin-eldritch-legacy.png` | `hz_hellsa_von_eldritch` — Helsa von Eldritch; `hz_seviathan_von_eldritch` — Seviathan von Eldritch; `hz_frederick_von_eldritch` — Frederick von Eldritch; `hz_bethesda_von_eldritch` — Bethesda von Eldritch |
| `hazbin-legacy-history.png` | `hz_roo` — Roo; `hz_eve` — Eve; `hz_british_gentleman` — British Gentleman; `hz_female_victim` — Female Victim |
| `hazbin-human-history.png` | `hz_the_killer` — The Killer; `hz_human_hunter` — Human Hunter; `hz_harry` — Harry; `hz_carrie` — Carrie |
| `hazbin-human-crossovers.png` | `hz_larry` — Larry; `hz_robert_bob_sinclaire` — Robert “Bob” Sinclaire; `hz_crying_exorcist` — Crying Exorcist; `hz_travis` — Travis |
| `hazbin-hotel-patrons.png` | `hz_la_catrina_sinner` — La Catrina sinner; `hz_eel_sinner` — Eel sinner; `hz_egyptian_sinner` — Egyptian sinner; `hz_ant_sinner` — Ant sinner |
| `hazbin-vees-casino.png` | `hz_kitty` — Kitty; `hz_huskette_cat` — Huskette cat-like waitress; `hz_huskette_spider` — Huskette spider-like waitress; `hz_huskette_imp` — Huskette imp-like waitress |
| `hazbin-season2-voiced-locals.png` | `hz_reporter_demon` — Reporter demon; `hz_goldfish_sinner` — Goldfish sinner; `hz_fangirl_goat` — Goat-like fangirl sinner; `hz_fangirl_apple_tree` — Apple-tree fangirl sinner |
| `hazbin-recurring-patrons-ii.png` | `hz_conjoined_twins` — Conjoined Twin sinners; `hz_western_sinner` — Western sinner; `hz_goth_bird_sinner` — Goth bird-like sinner; `hz_rose_sinner` — Rose-like sinner |

Tiffany Titfucker remains a lore-only directory mention: no canon design has been published, so the atlas does not invent one. The collective Egg Boiz occupies the first `city-names-b` row using the verified standard design from their character page.

Before generation, retain a clean full-body reference for every ID under `art/sprite-sheets/references/hazbin/`. Do not infer a design from the display name alone. Masters containing green character details use a magenta chroma plate so those details survive keying intact. The preparation pass removes both the edge-connected screen and strongly plate-coloured pockets enclosed by limbs or hair. Each finished 6×4 atlas must keep meaningful alpha at least 6 px away from every cell edge; the build rejects chroma residue, grid-gutter spill, clipped primary poses, sparse/empty cells, duplicated silhouettes and portraits whose post-resize alpha margin falls below 16 px.

## Atlas catalogue and references

| Atlas | Rows, top to bottom | Reference pages |
| --- | --- | --- |
| `core-a.png` | Charlie, Vaggie, Angel Dust, Alastor | [Charlie](https://hazbinhotel.fandom.com/wiki/Charlie_Morningstar), [Vaggie](https://hazbinhotel.fandom.com/wiki/Vaggie), [Angel Dust](https://hazbinhotel.fandom.com/wiki/Angel_Dust), [Alastor](https://hazbinhotel.fandom.com/wiki/Alastor) |
| `core-b.png` | Husk, Niffty, Sir Pentious, Lucifer | [Husk](https://hazbinhotel.fandom.com/wiki/Husk), [Niffty](https://hazbinhotel.fandom.com/wiki/Niffty), [Sir Pentious](https://hazbinhotel.fandom.com/wiki/Sir_Pentious), [Lucifer](https://hazbinhotel.fandom.com/wiki/Lucifer_Morningstar) |
| `hell-antagonists.png` | Cherri Bomb, Vox, Valentino, Velvette | [Cherri Bomb](https://hazbinhotel.fandom.com/wiki/Cherri_Bomb), [Vox](https://hazbinhotel.fandom.com/wiki/Vox), [Valentino](https://hazbinhotel.fandom.com/wiki/Valentino), [Velvette](https://hazbinhotel.fandom.com/wiki/Velvette) |
| `heaven.png` | Adam, Emily, Sera, Lute | [Adam](https://hazbinhotel.fandom.com/wiki/Adam), [Emily](https://hazbinhotel.fandom.com/wiki/Emily), [Sera](https://hazbinhotel.fandom.com/wiki/Sera), [Lute](https://hazbinhotel.fandom.com/wiki/Lute) |
| `overlords.png` | Carmilla, Rosie, Zestial, Zeezi | [Carmilla](https://hazbinhotel.fandom.com/wiki/Carmilla_Carmine), [Rosie](https://hazbinhotel.fandom.com/wiki/Rosie), [Zestial](https://hazbinhotel.fandom.com/wiki/Zestial), [Zeezi](https://hazbinhotel.fandom.com/wiki/Zeezi) |
| `season2-au.png` | Baxter, Abel, Marlow Glass, Ember Vale | [Baxter](https://hazbinhotel.fandom.com/wiki/Baxter), [Abel](https://hazbinhotel.fandom.com/wiki/Abel); Marlow and Ember are original Simulation AU designs |
| `hazbin/hazbin-hotel-patrons.png` | La Catrina sinner, Eel sinner, Egyptian sinner, Ant sinner | [Hazbin Hotel sinners](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Hazbin_Hotel/Sinners) |
| `hazbin/hazbin-vees-casino.png` | Kitty, three Huskettes | [Robo Fizz / Kitty](https://hazbinhotel.fandom.com/wiki/Robo_Fizz), [minor Hazbin demons](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Hazbin_Hotel/Demons) |
| `hazbin/hazbin-season2-voiced-locals.png` | Reporter demon, Goldfish sinner, Goat-like fangirl, Apple-tree fangirl | [minor Hazbin sinners](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Hazbin_Hotel/Sinners) |
| `hazbin/hazbin-recurring-patrons-ii.png` | Conjoined Twins, Western sinner, Goth bird-like sinner, Rose-like sinner | [minor Hazbin sinners](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Hazbin_Hotel/Sinners) |
| `helluva/helluva-core.png` | Blitzø, Moxxie, Millie, Loona | [Blitzø](https://hazbinhotel.fandom.com/wiki/Blitzo), [Moxxie](https://hazbinhotel.fandom.com/wiki/Moxxie), [Millie](https://hazbinhotel.fandom.com/wiki/Millie), [Loona](https://hazbinhotel.fandom.com/wiki/Loona) |
| `helluva/helluva-allies.png` | Stolas, Octavia, Fizzarolli, Verosika Mayday | [Stolas](https://hazbinhotel.fandom.com/wiki/Stolas), [Octavia](https://hazbinhotel.fandom.com/wiki/Octavia), [Fizzarolli](https://hazbinhotel.fandom.com/wiki/Fizzarolli), [Verosika](https://hazbinhotel.fandom.com/wiki/Verosika_Mayday) |
| `helluva/helluva-powers.png` | Asmodeus, Beelzebub, Striker, Stella | [Asmodeus](https://hazbinhotel.fandom.com/wiki/Asmodeus), [Beelzebub](https://hazbinhotel.fandom.com/wiki/Beelzebub), [Striker](https://hazbinhotel.fandom.com/wiki/Striker), [Stella](https://hazbinhotel.fandom.com/wiki/Stella) |
| `helluva/helluva-extended.png` | Crimson, Vortex, Sallie May, Andrealphus | [Crimson](https://hazbinhotel.fandom.com/wiki/Crimson), [Vortex](https://hazbinhotel.fandom.com/wiki/Vortex), [Sallie May](https://hazbinhotel.fandom.com/wiki/Sallie_May), [Andrealphus](https://hazbinhotel.fandom.com/wiki/Andrealphus) |
| `helluva/helluva-origins.png` | Paimon, Barbie Wire, Cash Buckzo, Wally Wackford | [Paimon](https://hazbinhotel.fandom.com/wiki/Paimon), [Barbie Wire](https://hazbinhotel.fandom.com/wiki/Barbie_Wire), [Cash Buckzo](https://hazbinhotel.fandom.com/wiki/Cash_Buckzo), [Wally Wackford](https://hazbinhotel.fandom.com/wiki/Wally_Wackford) |
| `helluva/helluva-rivals.png` | Mammon, Chazwick Thurman, Glitz, Glam | [Mammon](https://hazbinhotel.fandom.com/wiki/Mammon), [Chazwick Thurman](https://hazbinhotel.fandom.com/wiki/Chazwick_Thurman), [Glitz and Glam](https://hazbinhotel.fandom.com/wiki/Glitz_and_Glam) |
| `helluva/helluva-celestial.png` | Cletus, Collin, Keenie, Vassago | [Cletus](https://hazbinhotel.fandom.com/wiki/Cletus), [Collin](https://hazbinhotel.fandom.com/wiki/Collin), [Keenie](https://hazbinhotel.fandom.com/wiki/Keenie), [Vassago](https://hazbinhotel.fandom.com/wiki/Vassago) |
| `helluva/helluva-operatives.png` | Robo Fizz, Agent One, Agent Two, Satan | [Robo Fizz](https://hazbinhotel.fandom.com/wiki/Robo_Fizz), [Agent One](https://hazbinhotel.fandom.com/wiki/Agent_One), [Agent Two](https://hazbinhotel.fandom.com/wiki/Agent_Two), [Satan](https://hazbinhotel.fandom.com/wiki/Satan) |
| `helluva/helluva-hauntings.png` | Rolando, Mrs. Mayberry, Martha, Tilla | [Rolando](https://hazbinhotel.fandom.com/wiki/Rolando), [Mrs. Mayberry](https://hazbinhotel.fandom.com/wiki/Mrs._Mayberry), [Martha](https://hazbinhotel.fandom.com/wiki/Martha), [Tilla](https://hazbinhotel.fandom.com/wiki/Tilla) |
| `helluva/helluva-legacies.png` | Moxxie's mother, Loopty Goopty, Lyle Lipton, Deerie | [Moxxie's mother](https://hazbinhotel.fandom.com/wiki/Moxxie%27s_mother), [Loopty Goopty](https://hazbinhotel.fandom.com/wiki/Loopty_Goopty), [Lyle Lipton](https://hazbinhotel.fandom.com/wiki/Lyle_Lipton), [Deerie](https://hazbinhotel.fandom.com/wiki/Deerie) |
| `helluva/helluva-powers-and-kin.png` | Joe, Lin, Leviathan, Belphegor | [Joe](https://hazbinhotel.fandom.com/wiki/Joe), [Lin](https://hazbinhotel.fandom.com/wiki/Lin), [Leviathan](https://hazbinhotel.fandom.com/wiki/Leviathan), [Belphegor](https://hazbinhotel.fandom.com/wiki/Belphegor) |
| `helluva/helluva-secondary-underworld.png` | Alessio, Arick “Burnie” Burnz, Counselor Jimmy, Yogirt | [Alessio](https://hazbinhotel.fandom.com/wiki/Alessio), [Arick Burnz](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Imps), [Counselor Jimmy](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Humans), [Yogirt](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Demons) |
| `helluva/helluva-secondary-humans.png` | Emberlynn Pinkle, Kendra, Rita, Better Than Blitzo Guy | [Emberlynn Pinkle](https://hazbinhotel.fandom.com/wiki/Emberlynn_Pinkle), [Kendra](https://hazbinhotel.fandom.com/wiki/Barbie%27s_Bad_Day/Gallery), [Rita](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Demons), [Better Than Blitzo Guy](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Succubi) |
| `helluva/helluva-secondary-rides.png` | Loo Loo, Jesse, Miles, Bombproof | [Loo Loo](https://hazbinhotel.fandom.com/wiki/Loo_Loo), [Jesse](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Succubi), [Miles](https://hazbinhotel.fandom.com/wiki/Miles), [Bombproof](https://hazbinhotel.fandom.com/wiki/Bombproof) |
| `helluva/helluva-secondary-nightlife.png` | Muffy, Dr. Somna, Vikki, Gigi | [Muffy](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Baphomets), [Dr. Somna](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Baphomets), [Vikki](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Hellhounds), [Gigi](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Hellhounds) |
| `helluva/helluva-friends-and-foes.png` | Russ, Dennis, Ralphie, Catfish Monster | [minor characters](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss) |
| `helluva/helluva-greed-and-ghosts.png` | Elder Jaws, Bethany Ghostfucker, Karen Client, Toledo the Igor | [minor characters](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss) |
| `helluva/helluva-stars-and-strays.png` | Brennon Ragers, Uggie, Skips, Queef | [minor characters](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss) |
| `helluva/helluva-shorts-targets-a.png` | Ace, Gerardo Velazquez, Frank McTickly Wrigglers, Driveso | [minor characters](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss) |
| `helluva/helluva-shorts-targets-b.png` | Joe Smoe, Paulie Paesano, Luigi Paesano, William Diddle | [minor humans](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Humans) |
| `helluva/helluva-shorts-locals.png` | Adrian, Mr. Mayor, Gerald, Rick | [minor characters](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss) |
| `helluva/helluva-verosika-crew-a.png` | Coco, Apple, Kat, Milky | [Verosika's crew](https://hazbinhotel.fandom.com/wiki/Verosika%27s_crew) |
| `helluva/helluva-verosika-crew-b.png` | Kiki, Josh, Stolas' Family Butler, Mister Butler | [Verosika's crew](https://hazbinhotel.fandom.com/wiki/Verosika%27s_crew), [minor imps](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Imps) |
| `helluva/helluva-family-fallout.png` | Martha's Daughter, Martha's Son, Harold, Dolores | [Martha and Ralphie's children](https://hazbinhotel.fandom.com/wiki/Martha_and_Ralphie%27s_children), [minor humans](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Humans) |
| `helluva/helluva-turning-points.png` | Hellhound Adoption Center Lady, Travis, Tour Guide Guy, Big Woobly | [minor hellhounds](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Hellhounds), [Travis](https://hazbinhotel.fandom.com/wiki/Travis), [minor humans](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Humans), [minor imps](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Imps) |
| `helluva/helluva-shorts-witnesses.png` | Gerardo's Wife, William Diddle's Secretary, Bigfoot Waiter, Gorilla Suit Guy | [minor humans](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Humans) |
| `helluva/helluva-cherub-staff.png` | Rachel, Bea, Beau, Honey | [C.H.E.R.U.B. employees](https://hazbinhotel.fandom.com/wiki/C.H.E.R.U.B._(group)), [minor characters](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss) |

## Rebuild portraits

From the repository root:

```powershell
python scripts\build_sprite_assets.py --require-helluva
python scripts\prepare_hazbin_expansion.py --check
python scripts\prepare_hazbin_expansion.py
python scripts\build_sprite_assets.py --require-hazbin-expansion
python -m scripts.prepare_hazbin_animations
python -m scripts.prepare_hazbin_animations --check
python -m scripts.prepare_helluva_animations
python -m scripts.prepare_helluva_animations --check
python -m scripts.generate_motion_bank_masters --check
python scripts\prepare_hazbin_cinematics.py
python scripts\prepare_hazbin_cinematics.py --check
```

The first command rebuilds the historical Hazbin and Helluva portraits. The preparation check requires all nineteen OpenAI chroma masters, removes each configured chroma plate, isolates every fixed cell and proves the 6 px gutter without publishing. The following preparation command atomically publishes the transparent atlases; the final strict build validates all 456 expanded-Hazbin cells and writes the 76 matching portraits. The portrait builder reads the neutral pose from column 1 of each 6×4 atlas, isolates the primary connected sprite from any neighbouring-cell spill, and writes a transparent 512×512 portrait for every configured character ID. Before replacing portraits it validates exact 1536×1024 dimensions, row maps, display-name coverage, safe public output paths and visible content in all cells. The expanded Hazbin collection also enforces per-cell alpha gutters and post-resize portrait margins.

Every Helluva sheet follows the same generation contract: four visual references in row order, six complete poses per row (idle, conversation, alert, action, recovery and victory), a removable chroma background, and no labels, grids, shadows or cross-row mixing. The optional collection remains atomic: `--require-helluva` rejects a partial publication.

## Expansion waves

- Wave 2: `helluva-origins`, `helluva-rivals`, and `helluva-celestial` (12 portraits).
- Wave 3: `helluva-operatives`, `helluva-hauntings`, `helluva-legacies`, and `helluva-powers-and-kin` (16 portraits).
- Wave 4: four `helluva-secondary-*` atlases (16 portraits), with Shorts-only profiles hidden behind the Shorts visibility scope.
- Wave 5: `helluva-friends-and-foes`, `helluva-greed-and-ghosts`, `helluva-stars-and-strays`, three Shorts atlases, and 24 portraits. Ace replaces non-canon pilot-only Eddie, Toledo replaces the Mr. Sudz mascot/location, and Queef uses the canon name rather than obsolete storyboard label Precious.
- Wave 6: the two Verosika crew atlases, `helluva-family-fallout`, `helluva-turning-points`, `helluva-shorts-witnesses`, `helluva-cherub-staff`, and 24 portraits. Stolas' Family Butler and Mister Butler remain distinct, Martha's children stay canonically unnamed, Chaz records the Zahc alias without a duplicate profile, and Travis is marked as a physical Hazbin crossover.

Jarold Mayberry remains a lore-only mention because no unobstructed official design exists. The unnamed Sinsmas family remains mission context rather than a fake single-character sprite.

The current strict published-art pass validates all 491 atlases, 11,784 animation cells and 208 portraits. Hazbin accounts for 275 atlases, 6,600 cells and 100 portraits; Helluva Boss accounts for 216 atlases, 5,184 cells and 108 portraits.
