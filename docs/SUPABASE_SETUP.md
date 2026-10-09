# Supabase shared-data setup

MaBestie V2 can synchronize The List, errands, Japan procedure progress, profile themes, and pet statuses through the project's Supabase database. Browser `localStorage` remains an offline cache.

## Apply the schema

1. Open the MaBestie project in Supabase.
2. Open **SQL Editor**.
3. Run [`supabase/migrations/202610080001_v2_shared_data.sql`](../supabase/migrations/202610080001_v2_shared_data.sql) for a new database. For an existing V2 database, run [`supabase/migrations/202610090001_pet_preferences.sql`](../supabase/migrations/202610090001_pet_preferences.sql). If the old `date_ideas` table exists, run [`supabase/migrations/202610090002_restore_legacy_date_ideas.sql`](../supabase/migrations/202610090002_restore_legacy_date_ideas.sql) to copy its entries into The List.
4. Reload the app on both devices. The sync message should change from **Local only** to **Shared and up to date**.

The migration creates the V2 tables, validation constraints, timestamp triggers, grants, Row Level Security policies, and Realtime publication entries. It is safe to rerun.

## How synchronization behaves

- The app renders its local cache immediately, then downloads the shared database state.
- An empty cloud collection is initialized from the first device's local cache. Existing cloud rows otherwise take precedence.
- Edits are saved locally first and sent to Supabase. If a request fails, the local edit remains and the app displays **Local changes pending**.
- Realtime database events trigger a fresh download, so profile theme, selected pet, pet mood, and shared-content edits on one open device appear on the other.
- Archive is a state change on `procedure_lists`; archived procedure progress remains in `procedure_progress` and can be restored.
- The legacy date-ideas migration preserves the original table, creator, and creation date. It is safe to rerun and does not overwrite edited V2 items. The six entries in the current project were recovered on October 9, 2026.

## Privacy boundary

The Rin/Julius picker is not authentication. The current policies deliberately grant the Supabase unauthenticated client role access to all MaBestie rows. That keeps the private two-person prototype simple, but anyone who obtains the project URL and publishable key could read or change the data.

The publishable key belongs in client code; a secret or service-role key never does. Before treating MaBestie as securely private, add Supabase Auth (or another trusted access gate) and replace the permissive policies with authenticated-user policies.
