-- Run after exactly two invited Auth users have been enrolled in app_members.

do $$
begin
    if (select count(*) from public.app_members) <> 2 then
        raise exception 'Expected exactly two MaBestie members before enabling private RLS';
    end if;
end;
$$;

revoke all on table public.profiles, public.list_items, public.procedure_lists, public.procedure_progress, public.errands from anon;

grant select, insert, update on table public.profiles, public.procedure_progress to authenticated;
grant select, update on table public.procedure_lists to authenticated;
grant select, insert, update, delete on table public.list_items, public.errands to authenticated;

drop policy if exists "MaBestie profiles are shared" on public.profiles;
create policy "Members manage shared profiles" on public.profiles
for all to authenticated using ((select public.is_mabestie_member())) with check ((select public.is_mabestie_member()));

drop policy if exists "MaBestie list is shared" on public.list_items;
create policy "Members manage the shared list" on public.list_items
for all to authenticated using ((select public.is_mabestie_member())) with check ((select public.is_mabestie_member()));

drop policy if exists "MaBestie procedure lists are shared" on public.procedure_lists;
create policy "Members manage procedure lists" on public.procedure_lists
for all to authenticated using ((select public.is_mabestie_member())) with check ((select public.is_mabestie_member()));

drop policy if exists "MaBestie procedure progress is shared" on public.procedure_progress;
create policy "Members manage procedure progress" on public.procedure_progress
for all to authenticated using ((select public.is_mabestie_member())) with check ((select public.is_mabestie_member()));

drop policy if exists "MaBestie errands are shared" on public.errands;
create policy "Members manage shared errands" on public.errands
for all to authenticated using ((select public.is_mabestie_member())) with check ((select public.is_mabestie_member()));
