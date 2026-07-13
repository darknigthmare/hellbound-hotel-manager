# Privacy and storage notice

Hellbound Hotel Manager is **local-first**, not cloud-only and not “100% local” when its optional account feature is used.

## Local operation

- Core gameplay works without an account and stores its primary state in this browser.
- If the browser denies persistent storage, the app uses memory only for the current tab and shows a visible session-only warning. It never describes that fallback as a durable save.
- The app contains no analytics SDK, advertising tracker or telemetry pipeline.
- The local database key is `hellbound_hotel_db_state`; inventory keys start with `h_inv_`.
- Clearing this site's browser storage deletes the local save and stored cloud session. Export a JSON backup first if the data matters.
- The production bundle does not require remote fonts or images to render the interface.

## Optional Supabase account backup

The fixed **Compte local/cloud** control can create or connect an account with the configured Supabase project. Network requests occur only for authentication, session refresh, sign-out, explicit cloud save and explicit cloud load.

- The browser stores the Supabase access/refresh session locally so the account can remain connected.
- Only `hellbound_hotel_db_state` and the three inventory keys `h_inv_bar`, `h_inv_clean` and `h_inv_food` are captured. Recovery copies and the account session are excluded.
- Passwords are sent to Supabase Auth over HTTPS and are never written into the application database or backup payload.
- A cloud row is scoped by authenticated `user_id` and application key. Row Level Security allows a signed-in user to access only their own row.
- **Sync cloud** uploads the selected snapshot. **Charger** validates and, after confirmation, replaces only the same app-owned keys. Restoration rolls back if a write fails.
- **Déconnexion** revokes the session when possible and removes the local session copy.

The SQL definition and access policies are versioned in `supabase/migrations/20260713000000_app_cloud_saves.sql`.

## Backups and recovery

JSON exports use the strict schema-v3 envelope and include every database section, durable gameplay control state and all three inventory counters. Version-3 imports must contain all required fields; only recognized unversioned/version-1/version-2 payloads may receive migration defaults. Imports are rejected above 2 MiB and validate IDs, references, numeric ranges and supported schema version. After validation, a separate confirmation is still required before live data changes.

When corrupted or recognized legacy raw data must be repaired, the local repository keeps at most five recovery snapshots and displays an alert. Settings can download the untouched raw payload even if it is not valid JSON; validation is required only for restoring it. Recovery slots remain in the same browser and are not a substitute for an external backup. Inventory read failures or malformed stored counters are surfaced as storage errors instead of being silently replaced during an operation or export.
