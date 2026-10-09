-- MaBestie V2 shared data.
--
-- The app intentionally has no sign-in yet. These policies therefore allow the
-- unauthenticated client role to manage all rows. This enables Rin and Julius to
-- share data, but it is not a security boundary: anyone with the project URL and
-- publishable key can use the same API. Replace these policies when Auth is added.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
    name text primary key check (name in ('Rin', 'Julius')),
    theme text not null check (theme in ('mono', 'lilac')),
    status text not null default '' check (status in ('', 'At work', 'Studying', 'On my way', 'Resting', 'Need a hug')),
    status_message text not null default '' check (char_length(status_message) <= 80),
    status_updated_at timestamptz,
    updated_at timestamptz not null default now()
);

create table if not exists public.list_items (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(title) between 1 and 100),
    category text not null check (category in ('movies', 'places', 'food', 'wishlist')),
    description text not null default '' check (char_length(description) <= 500),
    created_by text references public.profiles(name),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.procedure_lists (
    id text primary key,
    archived boolean not null default false,
    archived_at timestamptz,
    updated_at timestamptz not null default now(),
    check ((archived and archived_at is not null) or (not archived and archived_at is null))
);

create table if not exists public.procedure_progress (
    list_id text not null references public.procedure_lists(id) on delete cascade,
    task_id text not null,
    completed boolean not null default false,
    completed_by text references public.profiles(name),
    updated_at timestamptz not null default now(),
    primary key (list_id, task_id)
);

create table if not exists public.errands (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(title) between 1 and 100),
    category text not null check (category in ('groceries', 'pickup', 'home', 'admin')),
    assignee text not null default 'unassigned' check (assignee in ('Rin', 'Julius', 'both', 'unassigned')),
    due_date date,
    recurrence text not null default '' check (recurrence in ('', 'weekly', 'monthly')),
    notes text not null default '' check (char_length(notes) <= 500),
    completed boolean not null default false,
    created_by text references public.profiles(name),
    completed_by text references public.profiles(name),
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check ((completed and completed_at is not null) or (not completed and completed_at is null))
);

insert into public.profiles (name, theme)
values ('Rin', 'lilac'), ('Julius', 'mono')
on conflict (name) do nothing;

insert into public.procedure_lists (id)
values ('japan-arrival')
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists list_items_set_updated_at on public.list_items;
create trigger list_items_set_updated_at before update on public.list_items
for each row execute function public.set_updated_at();

drop trigger if exists procedure_lists_set_updated_at on public.procedure_lists;
create trigger procedure_lists_set_updated_at before update on public.procedure_lists
for each row execute function public.set_updated_at();

drop trigger if exists procedure_progress_set_updated_at on public.procedure_progress;
create trigger procedure_progress_set_updated_at before update on public.procedure_progress
for each row execute function public.set_updated_at();

drop trigger if exists errands_set_updated_at on public.errands;
create trigger errands_set_updated_at before update on public.errands
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.list_items enable row level security;
alter table public.procedure_lists enable row level security;
alter table public.procedure_progress enable row level security;
alter table public.errands enable row level security;

revoke all on table public.profiles, public.list_items, public.procedure_lists, public.procedure_progress, public.errands from anon, authenticated;
grant select, insert, update on table public.profiles, public.procedure_progress to anon, authenticated;
grant select, update on table public.procedure_lists to anon, authenticated;
grant select, insert, update, delete on table public.list_items, public.errands to anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

drop policy if exists "MaBestie profiles are shared" on public.profiles;
create policy "MaBestie profiles are shared" on public.profiles for all to anon, authenticated using (true) with check (true);

drop policy if exists "MaBestie list is shared" on public.list_items;
create policy "MaBestie list is shared" on public.list_items for all to anon, authenticated using (true) with check (true);

drop policy if exists "MaBestie procedure lists are shared" on public.procedure_lists;
create policy "MaBestie procedure lists are shared" on public.procedure_lists for all to anon, authenticated using (true) with check (true);

drop policy if exists "MaBestie procedure progress is shared" on public.procedure_progress;
create policy "MaBestie procedure progress is shared" on public.procedure_progress for all to anon, authenticated using (true) with check (true);

drop policy if exists "MaBestie errands are shared" on public.errands;
create policy "MaBestie errands are shared" on public.errands for all to anon, authenticated using (true) with check (true);

do $$
declare
    table_name text;
begin
    foreach table_name in array array['profiles', 'list_items', 'procedure_lists', 'procedure_progress', 'errands']
    loop
        if not exists (
            select 1
            from pg_publication_tables
            where pubname = 'supabase_realtime'
              and schemaname = 'public'
              and tablename = table_name
        ) then
            execute format('alter publication supabase_realtime add table public.%I', table_name);
        end if;
    end loop;
end;
$$;
