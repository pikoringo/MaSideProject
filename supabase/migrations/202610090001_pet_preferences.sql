-- Add synchronized pet selection and pet animation state to existing V2 databases.

do $$
declare
    pet_id_is_missing boolean;
begin
    select not exists (
        select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'profiles' and column_name = 'pet_id'
    ) into pet_id_is_missing;

    alter table public.profiles
        add column if not exists pet_id text not null default 'tiny_lemur',
        add column if not exists pet_state text not null default 'idle';

    if pet_id_is_missing then
        update public.profiles set pet_id = 'royal_lemur' where name = 'Julius';
        update public.profiles set pet_id = 'tiny_lemur' where name = 'Rin';
    end if;
end;
$$;

alter table public.profiles drop constraint if exists profiles_pet_id_check;
alter table public.profiles add constraint profiles_pet_id_check
    check (pet_id in ('royal_lemur', 'tiny_lemur'));

alter table public.profiles drop constraint if exists profiles_pet_state_check;
alter table public.profiles add constraint profiles_pet_state_check
    check (pet_state in ('idle', 'hungry', 'busy', 'on_my_way', 'sleepy', 'need_a_hug', 'happy'));
