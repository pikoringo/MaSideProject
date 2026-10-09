# Supabase shared-data setup

MaBestie V2 can synchronize The List, errands, Japan procedure progress, profile themes, and pet statuses through the project's Supabase database. Browser `localStorage` remains an offline cache.

## Apply the schema

1. Open the MaBestie project in Supabase.
2. Open **SQL Editor**.
3. Run [`supabase/migrations/202610080001_v2_shared_data.sql`](../supabase/migrations/202610080001_v2_shared_data.sql).
4. Complete the authentication setup below.
5. Reload the app on both devices. After sign-in, the sync message should change to **Shared & current**.

The migration creates the V2 tables, validation constraints, timestamp triggers, grants, Row Level Security policies, and Realtime publication entries. It is safe to rerun.

## How synchronization behaves

- The app renders its local cache immediately, then downloads the shared database state.
- An empty cloud collection is initialized from the first device's local cache. Existing cloud rows otherwise take precedence.
- Edits are saved locally first and sent to Supabase. If a request fails, the local edit remains and the app displays **Local changes pending**.
- Realtime database events trigger a fresh download, so an edit on one open device appears on the other.
- Archive is a state change on `procedure_lists`; archived procedure progress remains in `procedure_progress` and can be restored.

## Configure two-person authentication

1. In **Authentication → Users**, invite the two approved email addresses.
2. In **Authentication → Sign In / Providers → Email**, disable public user signups. Keep email sign-in enabled.
3. In **Authentication → URL Configuration**, set the deployed app URL as the Site URL and add local development URLs when needed.
4. Run [`supabase/migrations/202610090001_two_person_auth.sql`](../supabase/migrations/202610090001_two_person_auth.sql) to create the private membership list.
5. Enroll the two invited users, replacing the example addresses:

   ```sql
   insert into public.app_members (user_id, email)
   select id, email
   from auth.users
   where lower(email) in ('rin@example.com', 'julius@example.com')
   on conflict (user_id) do update set email = excluded.email;
   ```

6. Confirm that the insert reports two rows.
7. Run [`supabase/migrations/202610090002_enforce_member_rls.sql`](../supabase/migrations/202610090002_enforce_member_rls.sql). It refuses to change access policies unless exactly two members are enrolled.

The Rin/Julius picker is still not authentication. It sets the character used inside the app and can be changed in Settings. Supabase Auth and `app_members` form the actual access boundary.

The publishable key belongs in client code; a secret or service-role key never does.

## Free-tier expectations

This design uses Supabase features included in the Free plan: database, Auth, and Realtime. A two-person app is far below the published usage allowances. Free projects may pause after one week without activity, and the default email sender is intended for light testing rather than high-volume production delivery.
