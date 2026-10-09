-- Copy V1 date ideas into The List while keeping the original table intact.
-- Safe to rerun: stable IDs prevent duplicates, and existing V2 edits win.

do $migration$
begin
    if to_regclass('public.date_ideas') is not null then
        execute $query$
            insert into public.list_items (id, title, category, description, created_by, created_at)
            select
                md5('mabestie:date_ideas:' || legacy.id::text)::uuid,
                legacy.idea,
                case when legacy.idea ilike 'Watch %' then 'movies' else 'places' end,
                '',
                case when legacy.created_by in ('Rin', 'Julius') then legacy.created_by else null end,
                legacy.created_at
            from public.date_ideas as legacy
            where char_length(trim(legacy.idea)) between 1 and 100
            on conflict (id) do nothing
        $query$;
    end if;
end;
$migration$;
