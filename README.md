# Hellbound Hotel Manager — Local Safehouse Operations

An offline-first, private fan-made administration panel for managing the daily operations, rehabilitation logs, security incidents, and staff shifts at the Hazbin Hotel (styled as **Hellbound Hotel Manager**). It strictly respects the canon lore while ensuring that no copyrighted official media, protected logos, images, or lyrics are embedded. All lore information contains verification tags (canon status, source reference, timeline scope, and spoiler level).

---

## Technical Stack
- **Frontend**: React (18.3) + TypeScript + Vite
- **Styling**: Custom CSS (Vanilla theme variables, Cabernet/Gold Art Deco aesthetics)
- **Database (Local-First)**: TypeScript repository layer persisting fully typed models directly to the browser's `localStorage`.
- **Blueprints**: `schema.prisma` is provided in `src/db` to serve as a SQLite compile target if packaged with Tauri or Electron.
- **Tests**: Vitest for unit rules and validation validations.

---

## Getting Started

### 1. Installation
Ensure you have [Node.js](https://nodejs.org/) installed locally. Clone or locate the workspace directory and install dependencies:
```bash
npm install
```

### 2. Run Local Development Server
Launch the local dev server:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 3. Run Test Suite
Run the business rules test suite:
```bash
npm run test
```

### 4. Build Production Bundle
Build and compile the static bundle for browser deploy:
```bash
npm run build
```

---

## Project Structure
```text
/src
  /components
    Sidebar.tsx          # Navigation drawer (cabaret styled)
    Topbar.tsx           # Global search, resource status, and active timeline indicators
    RiskBadge.tsx        # Danger level chip (low, medium, high, catastrophic)
    CanonBadge.tsx       # Lore validation status (canon, semi-canon, headcanon)
    SpoilerBadge.tsx     # Spoiler safety chip (none, season_1, season_2, future)
    ConfirmDialog.tsx    # Modal for deletion alerts
  /pages
    Dashboard.tsx        # Stats overview, safety alerts, external threat meters, and narrative ticker
    Characters.tsx       # Resident and Staff registry with multi-metric filters and profiles editor
    Rooms.tsx            # Visual grid of rooms, occupancy assigner, and Niffty clean controls
    Rehabilitation.tsx   # Progress dials, goals notebooks, session logger, and redemption ascension
    Incidents.tsx        # Security logging, consequence alerts, and room damage connectors
    Staff.tsx            # Shift schedules, mental load meters, and tasks checklist dispatcher
    Reputation.tsx       # Public relations hub, Voxtek smearing logs, and public broadcast events
    Timeline.tsx         # Active timeline configuration (seasons toggle, spoiler boundaries)
    LoreCodex.tsx        # Knowledge base,locked entry triggers, and canon validation report scanner
    Relations.tsx        # Factions influence overview and social bonds contract alerts
    Resources.tsx        # Financial balance sheet ledger, bar inventories, and supply restock tools
    Settings.tsx         # JSON import/export, reset database triggers, and offline privacy panels
  /db
    schema.prisma        # Database blue-print schema for documentations & native SQLite wrapper
    localDb.ts           # Storage repository mapping database CRUD operations to localStorage
    seed.ts              # Seed database containing characters, rooms, factions, and initial lore
  /lib
    rules-engine.ts      # Rehabilitation, room safety, reputation adjustments, and spoiler logic
    lore-validation.ts   # Codex gaps checker (missing references, empty descriptors)
    export-import.ts     # JSON backup validations and parsing rules
  /styles
    theme.css            # Cabaret Art Deco global stylesheet containing variables and core layout
  /tests
    rules.test.ts        # Unit test suite verifying compliance rules
/docs
  privacy.md             # Detailed offline security notice
  data-model.md          # Entity relationship schema document
  lore-governance.md     # Lore classification and verification rules
```

---

## Customizing the Seed Data
To edit the initial guest roster, baseline rooms, or default codex logs:
1. Open the file [seed.ts](file:///C:/Users/chuck/Documents/antigravity/zealous-babbage/src/db/seed.ts).
2. Locate the arrays (`characters`, `rooms`, `rehabilitationPlans`, `loreCodex`, etc.).
3. Add or modify entries. Ensure all character ids and room numbers match references correctly.
4. Save the file and navigate to **Settings & Data** in the app.
5. Click **Reset Database State** to clear local storage and force a re-seed from the updated file.

---

## Adding Custom Lore References
This application is "lore-first". To register user notes or creator statements:
1. Navigate to **Lore Codex** -> **Add Lore Entry**.
2. Set the **Canon Status** to *User Log / Custom* or *Headcanon* if not verified.
3. If marking as *Canon*, ensure you provide a valid **Source Reference** (e.g. `S1E05` or `Creator Q&A Stream`). The rules engine blocks labeling claims as "canon" if source reference citations are left blank.

---

## Privacy & Telemetry
This manager works **100% offline** and runs entirely within your local browser sandbox.
- **No telemetry tracking**: No data, clicks, or settings are transmitted.
- **No cloud accounts required**: You do not need to register.
- **Local JSON backups**: Export and save your database to your local hard drive at any time.

---

## Disclaimer
*This is a fan-made, local-first utility built for educational and personal entertainment purposes in the universe of Hazbin Hotel. No copyrighted assets (such as official character drawings, logos, exact song lyrics, transcripts, audio files, or exact visual designs) are bundled inside this codebase. All graphics are initial-based avatars or generic SVG iconography.*
