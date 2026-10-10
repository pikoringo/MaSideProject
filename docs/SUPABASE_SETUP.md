# Supabase shared-data setup

MaBestie V2 can synchronize The List, errands, Japan procedure progress, profile themes, and pet statuses through the project's Supabase database. Browser `localStorage` remains an offline cache.

## Apply the schema

1. Open the MaBestie project in Supabase.
2. Open **SQL Editor**.
3. Run [`supabase/migrations/202610080001_v2_shared_data.sql`](../supabase/migrations/202610080001_v2_shared_data.sql) for a new database. For an existing V2 database, run [`supabase/migrations/202610090001_pet_preferences.sql`](../supabase/migrations/202610090001_pet_preferences.sql). If the old `date_ideas` table exists, run [`supabase/migrations/202610090002_restore_legacy_date_ideas.sql`](../supabase/migrations/202610090002_restore_legacy_date_ideas.sql) to copy its entries into The List.
4. Complete the authentication setup below.
5. Reload the app on both devices. After sign-in, the sync message should change to **Shared & current**.

The migration creates the V2 tables, validation constraints, timestamp triggers, grants, Row Level Security policies, and Realtime publication entries. It is safe to rerun.

## How synchronization behaves

- The app renders its local cache immediately, then downloads the shared database state.
- An empty cloud collection is initialized from the first device's local cache. Existing cloud rows otherwise take precedence.
- Edits are saved locally first and sent to Supabase. If a request fails, the local edit remains and the app displays **Local changes pending**.
- Realtime database events trigger a fresh download, so profile theme, selected pet, pet mood, and shared-content edits on one open device appear on the other.
- Archive is a state change on `procedure_lists`; archived procedure progress remains in `procedure_progress` and can be restored.
- The legacy date-ideas migration preserves the original table, creator, and creation date. It is safe to rerun and does not overwrite edited V2 items. The six entries in the current project were recovered on October 9, 2026.

## Configure two-person authentication

The normal sign-in flow does not send email, so it does not depend on a paid custom SMTP service. Create the two accounts manually in the Supabase dashboard and share each password privately outside the repository.

1. In **Authentication → Users**, create one confirmed email-and-password user for Rin and one for Julius. Do not put either password in this repository.
2. In **Authentication → Sign In / Providers → Email**, disable public user signups. Keep email/password sign-in enabled.
3. Run [`supabase/migrations/202610100001_two_person_auth.sql`](../supabase/migrations/202610100001_two_person_auth.sql) to create the private membership list.
4. Enroll the two users, replacing the example addresses:

   ```sql
   insert into public.app_members (user_id, email)
   select id, email
   from auth.users
   where lower(email) in ('rin@example.com', 'julius@example.com')
   on conflict (user_id) do update set email = excluded.email;
   ```

5. Confirm that the insert reports two rows and that the membership table contains exactly two rows:

   ```sql
   select count(*) from public.app_members;
   ```

6. Publish the authentication-capable app and confirm both accounts can sign in. The Rin/Julius character picker should appear after account sign-in.
7. Run [`supabase/migrations/202610100002_enforce_member_rls.sql`](../supabase/migrations/202610100002_enforce_member_rls.sql). It refuses to change access policies unless exactly two members are enrolled. Run this immediately after verifying the new app so the older anonymous client is not locked out before deployment.
8. Reload both signed-in devices and confirm shared data and Realtime updates still work.

The Rin/Julius picker is still not authentication. It sets the character used inside the app and can be changed in Settings. Supabase Auth and `app_members` form the actual access boundary.

The publishable key belongs in client code; a secret or service-role key never does.

## Free-tier expectations

This design uses Supabase features included in the Free plan: database, Auth, and Realtime. A two-person app is far below the published usage allowances. Free projects may pause after one week without activity. Normal sign-in uses a password and sends no email; account recovery can be handled by an administrator resetting the user's password in the dashboard, so custom SMTP is not required for this private two-person setup.
