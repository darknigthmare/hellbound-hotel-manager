# Audit remediation — 13 July 2026

This document records the implementation pass performed after the read-only audit of commit `f8a3d26`.

## Resolved critical areas

- Strict schema-v3 backup validation, legacy-only migration defaults, 2 MiB input limit, confirmation before replacement, atomic rollback and raw recovery download.
- Exact four-key optional cloud scope, validated snapshots, safe session rotation/refresh/revocation, owner-only Supabase RLS migration and honest privacy wording.
- Durable campaign days, cooldowns, inventory/upkeep costs, staff fatigue, delayed tasks, threat thresholds, deterministic events and explicit victory/defeat/end states.
- Multi-day redemption requirements, exactly-once rewards, generic Simulation AU plan templates and trauma-informed Angel Dust dialogue.
- Enforced room capacity/restrictions, shared occupancy, incident/repair accounting and atomic database/inventory gameplay transactions.
- Timeline and spoiler filtering without destructive canon mutations; canon rank/species separation and expanded source-labelled roster/codex data.
- Responsive navigation, targeted global search, high-contrast theme, focus-contained dialogs, keyboard tabs and live error announcements.
- Removed the unused Prisma schema and unused repository surface; added actual ESLint, strict TypeScript, Vitest integrity/gameplay/accessibility tests and GitHub CI.
- Route-level code splitting reduced the main production JavaScript chunk from roughly 503 kB to 265 kB.

## Verification evidence

- `npm run qa`: passed (`typecheck`, ESLint, 41 tests, production build).
- `npm audit --audit-level=low`: 0 known vulnerabilities.
- Production preview smoke test: HTML, JavaScript and CSS returned HTTP 200; lazy Dashboard/Rehabilitation chunks and the cloud widget were present.
- `git diff --check`: passed; only the repository's existing Windows line-ending notices remain.

## Visual QA limitation

The selected in-app browser refused every local HTTP address with `ERR_BLOCKED_BY_CLIENT`, including loopback and the machine hostname. No unsupported browser was substituted. Responsive behavior is covered by the implemented CSS, DOM/accessibility tests and static review, but a fresh visual desktop/mobile screenshot comparison still requires opening the app from an HTTPS preview or an explicitly approved alternative browser.

## Git state

All remediation changes remain in the local `master` working tree. They were not committed, pushed or deployed during this pass.
