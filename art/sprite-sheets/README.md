# Character sprite atlases

Thirty-three OpenAI-generated animation atlases cover 24 seeded Hazbin profiles and 108 optional Helluva Boss profiles: 792 validated animation cells and 132 extracted portraits in total. Hazbin finals live in `public/assets/sprites/sheets/`; the twenty-seven isolated Helluva Boss finals live in `public/assets/sprites/helluva/sheets/`. Every final atlas is a transparent 1536×1024 PNG, and neutral poses extracted by `scripts/build_sprite_assets.py` are published in the matching `portraits/` directory.

The chroma-key generation masters are retained in `chroma/`. Full-body visual references used during generation are retained in `references/` for reproducibility.

## Continuity rules

- The app starts at `season_1_start`, so Charlie, Vaggie, Angel Dust, Alastor, Husk, Niffty, Sir Pentious, Lucifer, Adam, Emily, Sera and Lute use Season 1 continuity.
- Baxter and Abel use their official Season 2 designs and remain spoiler-scoped in the database.
- Marlow Glass and Ember Vale are original, non-canon `Simulation AU` applicants. Their designs must never be presented as series canon.
- Generated poses are original gameplay animation poses; the references anchor identity, silhouette, palette and costume.
- Helluva Boss profiles never enter the hotel resident database. Their twenty-seven atlases and 108 portraits belong only to the optional I.M.P. Simulation AU campaign.
- Helluva coverage stops at published Seasons 1–2 and released Shorts. Unreleased Season 3 material, pilot-only characters, artist personas and anonymous decorative crowds are excluded.

## Atlas catalogue and references

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
```

The script reads the neutral pose from column 1 of each 6×4 atlas, isolates the primary connected sprite from any neighbouring-cell spill, and writes a transparent 512×512 portrait for every seeded character ID. Before replacing portraits it validates exact 1536×1024 dimensions, row maps and visible content in all cells. Strict Helluva validation covers twenty-seven atlases and 648 animation cells; across both collections it covers thirty-three atlases and 792 cells.

Every Helluva sheet follows the same generation contract: four visual references in row order, six complete poses per row (idle, conversation, alert, action, recovery and victory), a removable chroma background, and no labels, grids, shadows or cross-row mixing. The optional collection remains atomic: `--require-helluva` rejects a partial publication.

## Expansion waves

- Wave 2: `helluva-origins`, `helluva-rivals`, and `helluva-celestial` (12 portraits).
- Wave 3: `helluva-operatives`, `helluva-hauntings`, `helluva-legacies`, and `helluva-powers-and-kin` (16 portraits).
- Wave 4: four `helluva-secondary-*` atlases (16 portraits), with Shorts-only profiles hidden behind the Shorts visibility scope.
- Wave 5: `helluva-friends-and-foes`, `helluva-greed-and-ghosts`, `helluva-stars-and-strays`, three Shorts atlases, and 24 portraits. Ace replaces non-canon pilot-only Eddie, Toledo replaces the Mr. Sudz mascot/location, and Queef uses the canon name rather than obsolete storyboard label Precious.
- Wave 6: the two Verosika crew atlases, `helluva-family-fallout`, `helluva-turning-points`, `helluva-shorts-witnesses`, `helluva-cherub-staff`, and 24 portraits. Stolas' Family Butler and Mister Butler remain distinct, Martha's children stay canonically unnamed, Chaz records the Zahc alias without a duplicate profile, and Travis is marked as a physical Hazbin crossover.

Jarold Mayberry remains a lore-only mention because no unobstructed official design exists. The unnamed Sinsmas family remains mission context rather than a fake single-character sprite.

The current strict pass validates all twenty-seven Helluva atlases and all 108 Helluva portraits. Across both collections, that is thirty-three atlases, 792 animation cells and 132 portraits.
