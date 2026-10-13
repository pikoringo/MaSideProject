-- The notification Edge Function uses the secret key as service_role.
-- This role bypasses RLS, but still needs ordinary table privileges when
-- these tables were created without default service_role grants.

grant select on table
    public.app_members,
    public.profiles,
    public.list_items,
    public.errands,
    public.notification_preferences
to service_role;

grant select, delete on table public.push_subscriptions to service_role;

grant select, insert on table public.notification_deliveries to service_role;
