-- Allow the additional playful pet mood without changing existing profile data.
alter table public.profiles drop constraint if exists profiles_pet_state_check;
alter table public.profiles add constraint profiles_pet_state_check
    check (pet_state in ('idle', 'hungry', 'busy', 'on_my_way', 'sleepy', 'need_a_hug', 'happy', 'naughty'));
