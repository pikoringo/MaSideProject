# Notification setup

MaBestie uses standards-based Web Push, Supabase Edge Functions, and Supabase Cron. It does not require an Apple Developer membership or a paid notification provider. In-app notifications continue to work if system notifications are unavailable.

The expected two-person traffic is far below the Supabase Free plan's current Edge Function and Realtime quotas. As with the rest of MaBestie, a Free project may pause after a week without activity.

## Requirements

- Complete the two-person authentication setup first.
- Apply [`202610100003_notifications.sql`](../supabase/migrations/202610100003_notifications.sql).
- Deploy the `push-notifications` Edge Function with JWT verification disabled. The function validates user tokens itself and separately validates the Cron secret.
- Keep all generated private values in Supabase Edge Function secrets, never in this repository.

## Create Web Push secrets

Run this locally:

```bash
node scripts/generate-vapid-keys.mjs
```

Copy `VAPID_KEYS`, `VAPID_CONTACT`, and `CRON_SECRET` into **Supabase → Edge Functions → Secrets**. Replace the contact placeholder with a monitored `mailto:` address. The private VAPID key and Cron secret must not be committed or pasted into issues or pull requests.

## Deploy the Edge Function

With the Supabase CLI linked to the MaBestie project:

```bash
supabase functions deploy push-notifications --no-verify-jwt --use-api
```

The function exposes authenticated actions for configuration and immediate partner notifications. The daily reminder action accepts only the `CRON_SECRET` header.

## Schedule due reminders

Enable the Supabase Cron and `pg_net` modules. Store the function URL and Cron secret in Supabase Vault, then schedule one request at 09:00 Japan time, which is 00:00 UTC while Japan remains UTC+9:

```sql
select vault.create_secret(
    'https://PROJECT_REF.supabase.co/functions/v1/push-notifications',
    'notification_function_url'
);
select vault.create_secret('YOUR_CRON_SECRET', 'notification_cron_secret');

select cron.schedule(
    'mabestie-due-reminders',
    '0 0 * * *',
    $$
    select net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'notification_function_url'),
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'notification_cron_secret')
        ),
        body := '{"action":"send_due_reminders"}'::jsonb
    );
    $$
);
```

## iPhone activation

1. Open the deployed MaBestie site in Safari.
2. Use **Share → Add to Home Screen**.
3. Open MaBestie from its Home Screen icon and sign in.
4. Go to **Settings → Notifications** and tap **Enable notifications**.
5. Approve the iOS permission prompt.

iOS and iPadOS require version 16.4 or newer for Home Screen Web Push. Notification preferences sync by account, while permission and the push subscription are stored per device.

## Test matrix

- Status update: the other account receives one immediate notification.
- Urgent errand: the other account receives one immediate notification.
- Assigned errand: notify when assigned to the partner character or both.
- Completed errand: silent by default; delivered only after the recipient enables it.
- The List addition: silent by default; delivered only after the recipient enables it.
- Due and recurring errands: one reminder per account, errand, and due date.
- Foreground app: show a Quiet Accent toast instead of a duplicate system banner.
