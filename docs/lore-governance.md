# Lore Governance and Timeline Rules

This project separates broadcast facts from gameplay. A sourced character identity can be canon while hotel risk, trust, room, budget and rehabilitation values remain **Simulation AU** data.

## 1. Verification status

- `canon`: a fact shown by the cited official episode or official pilot, within that source's continuity.
- `semi_canon`: an official creator statement that is not established on screen.
- `simulation_au`: manager gameplay state invented for this application. It must never be presented as an episode fact.
- `headcanon`: personal interpretation or theory.
- `user_note`: a player's administrative or roleplay note.
- `unknown`: an unresolved claim that requires review.

Canon and semi-canon records require a source. `simulation_au`, `headcanon` and `user_note` records use `user_manual_note`; attaching an official episode to them would blur the classification boundary.

## 2. Accepted source formats

| Source type | Accepted reference |
| --- | --- |
| `episode` | `S1E01`–`S1E08` or `S2E01`–`S2E08`; multiple codes separated by commas or semicolons |
| `official_pilot` | `PILOT-2019` or an official YouTube URL |
| `official_page` | HTTPS URL on Prime Video, About Amazon, A24 or official YouTube |
| `creator_statement` | HTTPS URL on one of those official domains |
| `user_manual_note` | Optional local reference |

Primary series indexes:

- [Hazbin Hotel — Season 1 on Prime Video](https://www.primevideo.com/detail/0HZWTBZYQQXYW48YBANMDM2MZE)
- [Hazbin Hotel — Season 2 on Prime Video](https://www.primevideo.com/region/na/detail/0K67FVL3VHXNTE3JST8GXWOOFG)
- [Prime Video official Season 2 overview and cast](https://www.aboutamazon.com/news/entertainment/where-to-watch-hazbin-hotel-prime-video)

## 3. Pilot and series continuity

`pilot_legacy` is an isolated 2019 reference scope. A pilot claim does not automatically become Prime Video series canon. If the series repeats a fact, create or cite a series-scoped record rather than using the pilot as sole evidence.

Timeline scopes mean:

| Scope | Meaning | Minimum spoiler tier |
| --- | --- | --- |
| `pilot_legacy` | Official 2019 pilot only | `none` |
| `season_1_start` | Season 1 Episodes 1–7 | `none` or `season_1` |
| `season_1_end` | State established by Episode 8 | `season_1` |
| `season_2` | Season 2 Episodes 1–8 | `season_2` |
| `custom` | User simulation | classification-dependent |

The finale state is explicit: the original hotel is destroyed, a replacement is completed during the closing reconstruction, Sir Pentious appears redeemed in Heaven, and Adam is deceased. Season 2 begins from the rebuilt hotel and Heaven's reaction to Pentious' redemption.

## 4. Non-destructive timeline selection

Changing the timeline is a view/filter operation. It may change `timeline.current` and its canonical building label, but it must not:

- rewrite saved character profiles;
- vacate or repair rooms;
- clear repair costs or create ledger income;
- complete rehabilitation plans;
- alter incidents, tasks or player-authored notes.

Character changes such as Pentious becoming redeemed or Adam becoming deceased are read-only `timelineStates` projections. Returning to another scope produces the earlier projection without data loss.

## 5. Species, rank and operational role

These are separate axes:

- Species/origin: sinner, hellborn, angel, fallen angel, redeemed soul or unknown.
- Rank: royalty, Overlord, former Overlord, Seraph, exorcist, former exorcist, commander or no confirmed rank.
- Operational role: founder, resident, staff role, ally, antagonist or external.

Therefore Charlie is stored as **hellborn + royalty**, while Alastor, Vox, Valentino, Velvette and Carmilla are **sinners + Overlord rank**. `overlord` remains accepted only as a legacy imported species value and is not offered by the editor.

Unknown is preferable to an invented taxonomy. For example, the registry can confirm Rosie's or Zestial's Overlord rank without pretending the series has established a more precise species.

## 6. Canon-sensitive data rules

- Niffty is summoned by Alastor to work at the hotel, but no episode confirms that he owns her soul. Do not create a `contract_bound` relationship without new official evidence.
- Rehabilitation percentages, Charlie trust, danger ratings, room numbers, budgets and staff workloads are gameplay metrics. Profiles mark them as `operationalDataStatus: simulation_au`.
- A non-participant uses `rehabTracked: false`; numeric `0` then means “not tracked,” not “canonically failed rehabilitation.”
- A sourced episode fact and an AU operational consequence belong in separate records.

## 7. Automated validation

The codex scanner reports:

- missing or malformed source references;
- official-source/status contradictions;
- duplicate IDs and duplicate title/entity pairs;
- empty descriptions and unknown verification status;
- Season 1 finale records below the Season 1 spoiler tier;
- Season 2 citations outside the Season 2 scope;
- pilot records mixed into the series timeline;
- future speculation labeled as canon.

Validation never silently rewrites a claim. The user must review and save the correction explicitly.

The scanner is a structural assistant, not a fact checker: it does not prove that a reference supports the prose, and it does not audit character, room, faction or relationship records. When spoiler filtering is enabled, it checks only the codex entries currently visible to avoid leaking hidden titles. Bundled entries use a deliberate unlock step against accidental edits; this is not an administrator or cryptographic lock.
