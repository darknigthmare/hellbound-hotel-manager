# Local Privacy and Telemetry Notice

This document details the security and privacy protocols implemented in the **Hellbound Hotel Manager** application.

---

## 1. Zero Telemetry & Tracking
This application is completely free of any analytics frameworks, tracking pixels, cookies, or remote script requests.
- **No remote calls**: The frontend does not ping external servers or request assets from remote CDNs.
- **No dependency on the internet**: You can sever your internet connection completely; all modules (including the search engine, rules validations, and local database) remain 100% operational.
- **No cloud dependencies**: No cloud databases, APIs, or user login screens are used.

---

## 2. Local Storage Sandbox
All application data (characters, safety records, incident logs, financial ledgers, and audit logs) is stored client-side inside the browser's `localStorage` sandbox under the namespace `hellbound_hotel_db_state`.
- **No background uploads**: Data never leaves the browser environment.
- **Wiping Data**: Discarding browser cache or site storage clears the database. To persist logs, navigate to the **Settings & Data** section and download a local JSON backup.

---

## 3. SQLite Conversion Path
If you compile this application into a desktop environment using **Tauri** or **Electron**:
- The storage layer in `src/db/localDb.ts` can be mapped directly to a local SQLite database (using our provided `schema.prisma` file).
- The resulting database file (e.g. `dev.db`) will sit locally on your desktop machine (e.g., in `%APPDATA%` on Windows).
- All operations will continue running offline, with Tauri coordinating local file writes.
- Backup and JSON exports will write directly to your local file system via Tauri dialogs.
