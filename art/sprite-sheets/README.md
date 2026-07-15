# Character sprite atlases

Twenty-one OpenAI-generated animation atlases cover 24 seeded Hazbin profiles and 60 optional Helluva Boss profiles: 504 validated animation cells and 84 extracted portraits in total. Hazbin finals live in `public/assets/sprites/sheets/`; the fifteen isolated Helluva Boss finals live in `public/assets/sprites/helluva/sheets/`. The three Wave 2 atlases, four Wave 3 atlases and four Wave 4 atlases are generated and validated. Every final atlas is a transparent 1536×1024 PNG, and neutral poses extracted by `scripts/build_sprite_assets.py` are published in the matching `portraits/` directory.

The chroma-key generation masters are retained in `chroma/`. Full-body visual references used during generation are retained in `references/` for reproducibility.

## Continuity rules

- The app starts at `season_1_start`, so Charlie, Vaggie, Angel Dust, Alastor, Husk, Niffty, Sir Pentious, Lucifer, Adam, Emily, Sera and Lute use Season 1 continuity.
- Baxter and Abel use their official Season 2 designs and remain spoiler-scoped in the database.
- Marlow Glass and Ember Vale are original, non-canon `Simulation AU` applicants. Their designs must never be presented as series canon.
- Generated poses are original gameplay animation poses; the references anchor identity, silhouette, palette and costume.
- Helluva Boss profiles never enter the hotel resident database. Their fifteen atlases and 60 portraits belong only to the optional I.M.P. Simulation AU campaign.

## Atlas order and references

| Atlas | Rows, top to bottom | Reference pages |
| --- | --- | --- |
| `core-a.png` | Charlie, Vaggie, Angel Dust, Alastor | [Charlie](https://hazbinhotel.fandom.com/wiki/Charlie_Morningstar), [Vaggie](https://hazbinhotel.fandom.com/wiki/Vaggie), [Angel Dust](https://hazbinhotel.fandom.com/wiki/Angel_Dust), [Alastor](https://hazbinhotel.fandom.com/wiki/Alastor) |
| `core-b.png` | Husk, Niffty, Sir Pentious, Lucifer | [Husk](https://hazbinhotel.fandom.com/wiki/Husk), [Niffty](https://hazbinhotel.fandom.com/wiki/Niffty), [Sir Pentious](https://hazbinhotel.fandom.com/wiki/Sir_Pentious), [Lucifer](https://hazbinhotel.fandom.com/wiki/Lucifer_Morningstar) |
| `hell-antagonists.png` | Cherri Bomb, Vox, Valentino, Velvette | [Cherri Bomb](https://hazbinhotel.fandom.com/wiki/Cherri_Bomb), [Vox](https://hazbinhotel.fandom.com/wiki/Vox), [Valentino](https://hazbinhotel.fandom.com/wiki/Valentino), [Velvette](https://hazbinhotel.fandom.com/wiki/Velvette) |
| `heaven.png` | Adam, Emily, Sera, Lute | [Adam](https://hazbinhotel.fandom.com/wiki/Adam), [Emily](https://hazbinhotel.fandom.com/wiki/Emily), [Sera](https://hazbinhotel.fandom.com/wiki/Sera), [Lute](https://hazbinhotel.fandom.com/wiki/Lute) |
| `overlords.png` | Carmilla, Rosie, Zestial, Zeezi | [Carmilla](https://hazbinhotel.fandom.com/wiki/Carmilla_Carmine), [Rosie](https://hazbinhotel.fandom.com/wiki/Rosie), [Zestial](https://hazbinhotel.fandom.com/wiki/Zestial), [Zeezi](https://hazbinhotel.fandom.com/wiki/Zeezi) |
| `season2-au.png` | Baxter, Abel, Marlow Glass, Ember Vale | [Baxter](https://hazbinhotel.fandom.com/wiki/Baxter), [Abel](https://hazbinhotel.fandom.com/wiki/Abel); Marlow and Ember are original Simulation AU designs |
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
| `helluva/helluva-secondary-underworld.png` | Alessio, Arick "Burnie" Burnz, Counselor Jimmy, Yogirt | [Alessio](https://hazbinhotel.fandom.com/wiki/Alessio), [Arick Burnz](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Imps), [Counselor Jimmy](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Humans), [Yogirt](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Demons) |
| `helluva/helluva-secondary-humans.png` | Emberlynn Pinkle, Kendra, Rita, Better Than Blitzo Guy | [Emberlynn Pinkle](https://hazbinhotel.fandom.com/wiki/Emberlynn_Pinkle), [Kendra](https://hazbinhotel.fandom.com/wiki/Barbie%27s_Bad_Day/Gallery), [Rita](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Demons), [Better Than Blitzo Guy](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Succubi) |
| `helluva/helluva-secondary-rides.png` | Loo Loo, Jesse, Miles, Bombproof | [Loo Loo](https://hazbinhotel.fandom.com/wiki/Loo_Loo), [Jesse](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Succubi), [Miles](https://hazbinhotel.fandom.com/wiki/Miles), [Bombproof](https://hazbinhotel.fandom.com/wiki/Bombproof) |
| `helluva/helluva-secondary-nightlife.png` | Muffy, Dr. Somna, Vikki, Gigi | [Muffy](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Baphomets), [Dr. Somna](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Baphomets), [Vikki](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Hellhounds), [Gigi](https://hazbinhotel.fandom.com/wiki/Minor_Characters/Helluva_Boss/Hellhounds) |

## Rebuild portraits

From the repository root:

```powershell
python scripts\build_sprite_assets.py --require-helluva
```

The script reads the neutral pose from column 1 of each 6×4 atlas, isolates the primary connected sprite from any neighbouring-cell spill, and writes a transparent 512×512 portrait for every seeded `Character.id`.

Before replacing any portrait, the rebuild validates all required Hazbin
atlases and every complete optional collection, including their exact 1536x1024
dimensions and the visible content of every 6×4 cell. Strict Helluva validation
covers all seventeen configured atlases (408 animation cells). The idle extractor includes limited
vertical bleed so tall silhouettes are not cut at row boundaries, while
rejecting components centred in neighbouring rows.

The `hell-antagonists` master received a second fidelity pass after validation
found three missing body poses in the first version. The current atlas contains
six complete poses for Cherri Bomb, Vox, Valentino, and Velvette.

The Helluva Boss sheets use the same generation contract: four reference images
in row order, exactly six complete poses per row (idle, conversation, alert,
action, recovery and victory), a flat removable chroma-key background, and no
labels or grid lines. The allies sheet received a targeted identity correction
after visual review found Octavia in Stolas's recovery cell.

Wave 2 publishes `helluva-origins.png`, `helluva-rivals.png`, and
`helluva-celestial.png`, plus their twelve `hb_*` portraits. The optional
collection remains atomic: a normal validation skips Helluva if any configured
atlas is absent, while `--require-helluva` rejects a partial publication. This
same atomic publication rule remains active for later waves.

Wave 3 publishes `helluva-operatives.png`, `helluva-hauntings.png`,
`helluva-legacies.png`, and `helluva-powers-and-kin.png`, plus sixteen new
`hb_*` portraits. The generation prompt supplied four full-body reference
images in exact row order and requested a faithful silhouette, face, palette,
costume and species read for each character. Each row contains six original
gameplay poses (idle, conversation, alert, action, recovery and victory) on a
perfectly flat chroma-key background, with no text, labels, grid, shadows or
cross-row character mixing. The references guide visual identity only; the
new animation poses remain original Simulation AU material.

Wave 4 publishes `helluva-secondary-underworld.png`,
`helluva-secondary-humans.png`, `helluva-secondary-rides.png`, and
`helluva-secondary-nightlife.png`, plus sixteen secondary-character portraits.
Emberlynn Pinkle and Kendra are scoped to the optional Helluva Shorts filter;
the mixed atlas that contains them is hidden unless Shorts are enabled.

The current strict pass validates all fifteen Helluva atlases and all 60
Helluva portraits. Across both collections, that is twenty-one atlases, 504
animation cells and 84 portraits.
