# Character sprite atlases

Ten OpenAI-generated animation atlases cover 24 seeded Hazbin profiles and 16 optional Helluva Boss profiles. Hazbin finals live in `public/assets/sprites/sheets/`; the four isolated Helluva Boss finals live in `public/assets/sprites/helluva/sheets/`. Every final atlas is a transparent 1536×1024 PNG, and neutral poses extracted by `scripts/build_sprite_assets.py` are published in the matching `portraits/` directory.

The chroma-key generation masters are retained in `chroma/`. Full-body visual references used during generation are retained in `references/` for reproducibility.

## Continuity rules

- The app starts at `season_1_start`, so Charlie, Vaggie, Angel Dust, Alastor, Husk, Niffty, Sir Pentious, Lucifer, Adam, Emily, Sera and Lute use Season 1 continuity.
- Baxter and Abel use their official Season 2 designs and remain spoiler-scoped in the database.
- Marlow Glass and Ember Vale are original, non-canon `Simulation AU` applicants. Their designs must never be presented as series canon.
- Generated poses are original gameplay animation poses; the references anchor identity, silhouette, palette and costume.
- Helluva Boss profiles never enter the hotel resident database. Their four atlases and portraits belong only to the optional I.M.P. Simulation AU campaign.

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

## Rebuild portraits

From the repository root:

```powershell
python scripts\build_sprite_assets.py --require-helluva
```

The script reads the neutral pose from column 1 of each 6×4 atlas, isolates the primary connected sprite from any neighbouring-cell spill, and writes a transparent 512×512 portrait for every seeded `Character.id`.

Before replacing any portrait, the rebuild validates all six atlases, their exact
1536x1024 dimensions, and the visible content of every 6×4 cell. The
idle extractor includes limited vertical bleed so tall silhouettes are not cut
at row boundaries, while rejecting components centred in neighbouring rows.

The `hell-antagonists` master received a second fidelity pass after validation
found three missing body poses in the first version. The current atlas contains
six complete poses for Cherri Bomb, Vox, Valentino, and Velvette.

The Helluva Boss sheets use the same generation contract: four reference images
in row order, exactly six complete poses per row (idle, conversation, alert,
action, recovery and victory), a flat removable chroma-key background, and no
labels or grid lines. The allies sheet received a targeted identity correction
after visual review found Octavia in Stolas's recovery cell.
