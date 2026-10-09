-- Restrict MaBestie data to explicitly enrolled Supabase Auth users.
-- Apply only after Rin and Julius exist under Authentication > Users, then add
-- both user IDs to public.app_members in the same SQL session.

create table if not exists public.app_members (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email text not null unique,
    added_at timestamptz not null default now()
);

alter table public.app_members enable row level security;
revoke all on table public.app_members from anon, authenticated;

create or replace function public.is_mabestie_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.app_members
        where user_id = (select auth.uid())
    );
$$;

revoke execute on function public.is_mabestie_member() from public, anon;
grant execute on function public.is_mabestie_member() to authenticated;
