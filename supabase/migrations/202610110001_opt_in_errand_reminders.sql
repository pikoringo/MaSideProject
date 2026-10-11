-- Scheduled errand reminders are optional. Status-change notifications remain on by default.

alter table public.notification_preferences
    alter column due_reminders set default false,
    alter column recurring_reminders set default false;

-- This migration ships before notification settings are released, so existing seeded
-- member rows can safely adopt the corrected opt-in defaults.
update public.notification_preferences
set due_reminders = false,
    recurring_reminders = false,
    updated_at = now();
