-- Completion history and creator-only content management for The List.

alter table public.list_items
    add column if not exists completed boolean not null default false,
    add column if not exists completed_by text references public.profiles(name),
    add column if not exists completed_by_user_id uuid references auth.users(id) on delete set null,
    add column if not exists completed_at timestamptz;

alter table public.list_items drop constraint if exists list_items_completion_check;
alter table public.list_items add constraint list_items_completion_check
    check (
        (completed and completed_at is not null and completed_by is not null and completed_by_user_id is not null)
        or
        (not completed and completed_at is null and completed_by is null and completed_by_user_id is null)
    );

-- Older imported items did not record an Auth owner. Recover ownership only when
-- newer rows establish one unambiguous account for that creator profile.
with owner_map as (
    select created_by, min(created_by_user_id::text)::uuid as user_id
    from public.list_items
    where created_by is not null and created_by_user_id is not null
    group by created_by
    having count(distinct created_by_user_id) = 1
)
update public.list_items as item
set created_by_user_id = owner_map.user_id
from owner_map
where item.created_by_user_id is null
  and item.created_by = owner_map.created_by;

drop policy if exists "Members manage the shared list" on public.list_items;
drop policy if exists "MaBestie list is shared" on public.list_items;
drop policy if exists "Members read the shared list" on public.list_items;
drop policy if exists "Members add their own list items" on public.list_items;
drop policy if exists "Creators edit their list items" on public.list_items;
drop policy if exists "Creators delete their list items" on public.list_items;

create policy "Members read the shared list" on public.list_items
for select to authenticated
using ((select public.is_mabestie_member()));

create policy "Members add their own list items" on public.list_items
for insert to authenticated
with check (
    (select public.is_mabestie_member())
    and created_by_user_id = (select auth.uid())
);

create policy "Creators edit their list items" on public.list_items
for update to authenticated
using (
    (select public.is_mabestie_member())
    and created_by_user_id = (select auth.uid())
)
with check (
    (select public.is_mabestie_member())
    and created_by_user_id = (select auth.uid())
);

create policy "Creators delete their list items" on public.list_items
for delete to authenticated
using (
    (select public.is_mabestie_member())
    and created_by_user_id = (select auth.uid())
);

create or replace function public.set_list_item_completion(
    p_item_id uuid,
    p_completed boolean,
    p_completed_by text default null
)
returns public.list_items
language plpgsql
security definer
set search_path = ''
as $$
declare
    updated_item public.list_items;
begin
    if not public.is_mabestie_member() then
        raise exception 'Only MaBestie members can update The List';
    end if;

    if p_completed and p_completed_by not in ('Rin', 'Julius') then
        raise exception 'A valid completing profile is required';
    end if;

    update public.list_items
    set
        completed = p_completed,
        completed_by = case when p_completed then p_completed_by else null end,
        completed_by_user_id = case when p_completed then (select auth.uid()) else null end,
        completed_at = case when p_completed then now() else null end
    where id = p_item_id
    returning * into updated_item;

    if updated_item.id is null then
        raise exception 'List item not found';
    end if;

    return updated_item;
end;
$$;

revoke execute on function public.set_list_item_completion(uuid, boolean, text) from public, anon;
grant execute on function public.set_list_item_completion(uuid, boolean, text) to authenticated;
