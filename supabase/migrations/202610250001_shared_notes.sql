create table if not exists public.shared_notes (
    id text primary key,
    title text not null default '',
    content text not null default '',
    created_by text not null check (created_by in ('Rin', 'Julius')),
    created_by_user_id uuid references auth.users(id),
    updated_by text not null check (updated_by in ('Rin', 'Julius')),
    updated_by_user_id uuid references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.shared_notes enable row level security;

revoke all on table public.shared_notes from anon;
grant select, insert, update, delete on table public.shared_notes to authenticated;

drop policy if exists "Members manage shared notes" on public.shared_notes;
create policy "Members manage shared notes" on public.shared_notes
for all to authenticated
using ((select public.is_mabestie_member()))
with check ((select public.is_mabestie_member()));

do $$
begin
    if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'shared_notes'
    ) then
        alter publication supabase_realtime add table public.shared_notes;
    end if;
end;
$$;
