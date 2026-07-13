# Hellbound Hotel Manager

A local-first, fan-made Hazbin Hotel operations simulator built with React and TypeScript. It manages residents, rooms, rehabilitation, incidents, staff, reputation, resources, relationships and a source-labelled lore codex without bundling official artwork, audio, lyrics or transcripts.

The application deliberately separates two kinds of information:

- **Lore records** carry a source, timeline, spoiler level and canon classification.
- **Gameplay records** such as scores, risk levels, budgets and room assignments belong to the `simulation_au` layer; they are not presented as episode facts.

## Main features

- Strict schema-v3 local backups with validation, atomic database/inventory transactions, rollback and bounded recovery snapshots.
- Optional Supabase account backup, triggered only by explicit Sync/Load actions.
- Rehabilitation progression with session prerequisites, cooldowns and supply costs.
- A campaign-day loop with upkeep, fatigue, delayed staff work, cooldowns and escalating Heaven/Vees/Overlord pressure.
- Resource-constrained room, incident, rehabilitation, staff and public-relations actions with exactly-once rewards.
- Non-destructive timeline and spoiler filters.
- Global search, responsive navigation, keyboard-friendly dialogs and high-contrast mode.
- Lore metadata diagnostics and explicitly guarded edits for bundled canonical entries.

## Requirements and commands

- Node.js 22 LTS or newer.
- Install: `npm install`
- Development server: `npm run dev`, then open `http://localhost:3000`
- Type check: `npm run typecheck`
- ESLint: `npm run lint`
- Tests: `npm test`
- Production build: `npm run build`
- Full local quality gate: `npm run qa`

The same quality gate runs automatically for pushes and pull requests through `.github/workflows/quality.yml`.

## Persistence and privacy

The main database is stored in the browser under `hellbound_hotel_db_state`. Inventory uses `h_inv_*` keys. If persistent browser storage is unavailable, the Settings screen displays a session-only warning: changes then live only in memory and disappear on reload or tab close. Clearing site storage removes persistent local state, so use **Settings & Data > Export full backup** before clearing browser data.

Cloud backup is optional. When connected, the app sends only `hellbound_hotel_db_state` and the three `h_inv_*` inventory keys to the configured Supabase project after the user presses **Sync cloud**. Loading a cloud save replaces those same keys after validation and confirmation; sessions, recovery copies and unrelated browser storage are not included. See [docs/privacy.md](docs/privacy.md).

Full backups use schema version 3 and include every database section, durable `gameplayMeta` and all three inventory counters. Version-3 imports reject missing required fields; recognized unversioned/version-1/version-2 files alone receive legacy defaults and migration warnings. A validated file is not applied until the user confirms replacement. Invalid or migrated raw local data can be downloaded unchanged from the recovery panel before any restore attempt.

## Source layout

```text
src/
  components/       shared navigation, badges and dialogs
  db/               seed data and the local repository
  lib/              rules, lore validation and backup validation
  pages/            gameplay and administration screens
  tests/            gameplay and data-integrity tests
  types/            shared domain model
supabase/migrations/ cloud-save schema and owner-only RLS policies
docs/               data, privacy and lore-governance documentation
```

The runtime has no Prisma or SQLite layer. `src/db/localDb.ts` is the authoritative repository, and `supabase/migrations` contains only the optional cloud-backup schema.

The July 2026 audit correction record is available in [docs/audit-remediation-2026-07-13.md](docs/audit-remediation-2026-07-13.md).

## Editing seed data

Edit `src/db/seed.ts`, keep IDs and foreign-key references consistent, then use **Settings & Data > Reset local database** to reseed the current browser. The reset removes both database and inventory keys.

When adding lore, use `canon` only with a traceable official source. Use `official_pilot`/`pilot_legacy` for the 2019 pilot, `simulation_au` for mechanics invented by this manager, and `user_note` or `headcanon` for personal material. Full rules are in [docs/lore-governance.md](docs/lore-governance.md).

## Disclaimer

This is an unofficial, non-commercial fan project. Hazbin Hotel and its characters belong to their respective rights holders. The repository contains operational text and generic UI only; it does not include official character art, logos, episode transcripts, music, lyrics or audio.
