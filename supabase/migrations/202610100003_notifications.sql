-- Notification preferences, device subscriptions, and errand priority.
-- Apply after 202610100001_two_person_auth.sql and before deploying notification code.

alter table public.profiles
    add column if not exists status_updated_by uuid references auth.users(id) on delete set null;

alter table public.list_items
    add column if not exists created_by_user_id uuid references auth.users(id) on delete set null;

alter table public.errands
    add column if not exists priority text not null default 'normal',
    add column if not exists created_by_user_id uuid references auth.users(id) on delete set null,
    add column if not exists updated_by_user_id uuid references auth.users(id) on delete set null;

alter table public.errands drop constraint if exists errands_priority_check;
alter table public.errands add constraint errands_priority_check
    check (priority in ('normal', 'urgent'));

create table if not exists public.notification_preferences (
    user_id uuid primary key references auth.users(id) on delete cascade,
    status_updates boolean not null default true,
    urgent_errands boolean not null default true,
    assigned_errands boolean not null default true,
    due_reminders boolean not null default true,
    recurring_reminders boolean not null default true,
    errand_completed boolean not null default false,
    list_additions boolean not null default false,
    updated_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    endpoint text not null unique,
    p256dh text not null,
    auth_secret text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    event_key text not null,
    delivered_at timestamptz not null default now(),
    unique (user_id, event_key)
);

drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at before update on public.notification_preferences
for each row execute function public.set_updated_at();

drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at before update on public.push_subscriptions
for each row execute function public.set_updated_at();

alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_deliveries enable row level security;

revoke all on table public.notification_preferences, public.push_subscriptions, public.notification_deliveries from anon, authenticated;
grant select, insert, update on table public.notification_preferences to authenticated;
grant select, insert, update, delete on table public.push_subscriptions to authenticated;

drop policy if exists "Members manage their notification preferences" on public.notification_preferences;
create policy "Members manage their notification preferences" on public.notification_preferences
for all to authenticated
using ((select public.is_mabestie_member()) and user_id = (select auth.uid()))
with check ((select public.is_mabestie_member()) and user_id = (select auth.uid()));

drop policy if exists "Members manage their device subscriptions" on public.push_subscriptions;
create policy "Members manage their device subscriptions" on public.push_subscriptions
for all to authenticated
using ((select public.is_mabestie_member()) and user_id = (select auth.uid()))
with check ((select public.is_mabestie_member()) and user_id = (select auth.uid()));

insert into public.notification_preferences (user_id)
select user_id from public.app_members
on conflict (user_id) do nothing;
