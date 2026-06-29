# Lore Governance and Timeline Configurations

This document establishes the editorial standards and data validation rules for managing facts, speculations, and season configurations in the **Hellbound Hotel Manager** application.

---

## 1. Lore Classification Schema

To prevent lore distortion while allowing private users to write their own notes, all profiles and codex logs MUST be classified under the following three-dimensional metadata matrix:

### A. Canon Verification Status (`canon_status`)
- `canon`: Authenticated facts shown in episodes. **Requires a valid source reference.**
- `semi_canon`: Public claims or statements made by creators/producers outside episodes. **Requires a valid source reference.**
- `headcanon`: Personal user speculations, theories, or logical inferences not confirmed in official media.
- `user_note`: Custom logs, narrative logs, or roleplaying logs written by the player.
- `unknown`: Unverified claims flagged for revision.

### B. Source Classification (`source_type`)
- `episode`: Official video episode (e.g. S1E04, S2E01).
- `official_page`: Official website details or licensed booklets.
- `creator_statement`: Confirmed interviews or producer comments.
- `user_manual_note`: Manual user log entries.
- `other`: Press releases, conventions details, or other references.

### C. Spoiler Alert Level (`spoiler_level`)
- `none`: Safe details available from the pilot or Episode 1.
- `season_1`: Details exposing events occurring in Season 1 (such as Vaggie's background, final battle, or Sir Pentious' death).
- `season_2`: Details exposing Season 2 narrative arcs.
- `future`: Speculations about future releases.

---

## 2. Core Validation Rule

The rules engine enforces a strict validation constraint:
> **A lore entry or character profile cannot be labeled as `canon` or `semi_canon` if the `source_ref` field is left blank.**

If a user attempts to classify an entry as canon without listing an episode code or interview reference, the form validator throws an error:
`Rule Violation: You cannot classify a lore entry as 'canon' without providing a Source Reference citation.`

This guarantees that personal headcanons are clearly demarcated from officially broadcasted facts.

---

## 3. Timeline-Driven State Changes

Choosing an active Timeline scope under **Timeline Settings** applies canonical state transitions across your database:

| Selected Season Timeline | Hotel Structural Condition | Sir Pentious' Profile configuration | Heaven & Vees Threat Baseline |
| :--- | :--- | :--- | :--- |
| **Pilot Legacy** | `original` (Intact) | **Role**: Antagonist<br>**Status**: External<br>**Rehab Progress**: 0% | **Heaven**: 20% attention<br>**Vees**: 30% influence |
| **Season 1 Start** | `original` (Intact) | **Role**: Resident<br>**Status**: Applicant<br>**Rehab Progress**: 10% | **Heaven**: 35% attention<br>**Vees**: 70% influence |
| **Season 1 End** | `damaged` (Turf Damage) | **Role**: Resident<br>**Status**: Resident<br>**Rehab Progress**: 70% | **Heaven**: 60% attention<br>**Vees**: 55% influence |
| **Season 2 Active** | `rebuilt` (Reconstructed) | **Role**: External (Heaven)<br>**Status**: Redeemed (Ascended)<br>**Rehab Progress**: 100% | **Heaven**: 90% attention<br>**Vees**: 85% influence |

Users can lock these seasons to automatically prevent spoilers from higher tiers from appearing on their dashboards or search lists.
