# Character sprite atlases

Six OpenAI-generated animation atlases cover all 24 seeded character profiles. Each final atlas is a transparent 1536×1024 PNG in `public/assets/sprites/sheets/`; neutral poses extracted by `scripts/build_sprite_assets.py` live in `public/assets/sprites/portraits/`.

The chroma-key generation masters are retained in `chroma/`. Full-body visual references used during generation are retained in `references/` for reproducibility.

## Continuity rules

- The app starts at `season_1_start`, so Charlie, Vaggie, Angel Dust, Alastor, Husk, Niffty, Sir Pentious, Lucifer, Adam, Emily, Sera and Lute use Season 1 continuity.
- Baxter and Abel use their official Season 2 designs and remain spoiler-scoped in the database.
- Marlow Glass and Ember Vale are original, non-canon `Simulation AU` applicants. Their designs must never be presented as series canon.
- Generated poses are original gameplay animation poses; the references anchor identity, silhouette, palette and costume.

## Atlas order and references

| Atlas | Rows, top to bottom | Reference pages |
| --- | --- | --- |
| `core-a.png` | Charlie, Vaggie, Angel Dust, Alastor | [Charlie](https://hazbinhotel.fandom.com/wiki/Charlie_Morningstar), [Vaggie](https://hazbinhotel.fandom.com/wiki/Vaggie), [Angel Dust](https://hazbinhotel.fandom.com/wiki/Angel_Dust), [Alastor](https://hazbinhotel.fandom.com/wiki/Alastor) |
| `core-b.png` | Husk, Niffty, Sir Pentious, Lucifer | [Husk](https://hazbinhotel.fandom.com/wiki/Husk), [Niffty](https://hazbinhotel.fandom.com/wiki/Niffty), [Sir Pentious](https://hazbinhotel.fandom.com/wiki/Sir_Pentious), [Lucifer](https://hazbinhotel.fandom.com/wiki/Lucifer_Morningstar) |
| `hell-antagonists.png` | Cherri Bomb, Vox, Valentino, Velvette | [Cherri Bomb](https://hazbinhotel.fandom.com/wiki/Cherri_Bomb), [Vox](https://hazbinhotel.fandom.com/wiki/Vox), [Valentino](https://hazbinhotel.fandom.com/wiki/Valentino), [Velvette](https://hazbinhotel.fandom.com/wiki/Velvette) |
| `heaven.png` | Adam, Emily, Sera, Lute | [Adam](https://hazbinhotel.fandom.com/wiki/Adam), [Emily](https://hazbinhotel.fandom.com/wiki/Emily), [Sera](https://hazbinhotel.fandom.com/wiki/Sera), [Lute](https://hazbinhotel.fandom.com/wiki/Lute) |
| `overlords.png` | Carmilla, Rosie, Zestial, Zeezi | [Carmilla](https://hazbinhotel.fandom.com/wiki/Carmilla_Carmine), [Rosie](https://hazbinhotel.fandom.com/wiki/Rosie), [Zestial](https://hazbinhotel.fandom.com/wiki/Zestial), [Zeezi](https://hazbinhotel.fandom.com/wiki/Zeezi) |
| `season2-au.png` | Baxter, Abel, Marlow Glass, Ember Vale | [Baxter](https://hazbinhotel.fandom.com/wiki/Baxter), [Abel](https://hazbinhotel.fandom.com/wiki/Abel); Marlow and Ember are original Simulation AU designs |

## Rebuild portraits

From the repository root:

```powershell
C:\Python314\python.exe scripts\build_sprite_assets.py
```

The script reads the neutral pose from column 1 of each 6×4 atlas, isolates the primary connected sprite from any neighbouring-cell spill, and writes a transparent 512×512 portrait for every seeded `Character.id`.
