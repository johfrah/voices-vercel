-- v2.28.15
-- Hardening rules for workshop_video_subtitle_links

alter table public.workshop_video_subtitle_links
  add constraint ck_wvsl_language_code_iso
  check (language_code ~ '^[a-z]{2}-[A-Z]{2}$') not valid;

alter table public.workshop_video_subtitle_links
  add constraint ck_wvsl_subtitle_not_same_media
  check (subtitle_media_id is null or subtitle_media_id <> video_media_id) not valid;

alter table public.workshop_video_subtitle_links
  add constraint ck_wvsl_subtitle_data_shape
  check (
    subtitle_data is null
    or (
      jsonb_typeof(subtitle_data) = 'object'
      and (subtitle_data ? 'items')
      and jsonb_typeof(subtitle_data->'items') = 'array'
    )
  ) not valid;

alter table public.workshop_video_subtitle_links validate constraint ck_wvsl_language_code_iso;
alter table public.workshop_video_subtitle_links validate constraint ck_wvsl_subtitle_not_same_media;
alter table public.workshop_video_subtitle_links validate constraint ck_wvsl_subtitle_data_shape;

create index if not exists idx_wvsl_lookup_enabled_sorted
  on public.workshop_video_subtitle_links (workshop_id, video_media_id, is_default desc, id)
  where is_enabled = true;

create or replace function public.wvsl_enforce_integrity()
returns trigger
language plpgsql
as $$
declare
  v_world_id integer;
  has_valid_data boolean;
begin
  select w.world_id into v_world_id
  from public.workshops w
  where w.id = new.workshop_id;

  if v_world_id is null then
    raise exception 'workshop_id % bestaat niet', new.workshop_id;
  end if;

  if v_world_id <> 2 then
    raise exception 'workshop_id % hoort niet bij world_id=2', new.workshop_id;
  end if;

  has_valid_data := (
    new.subtitle_data is not null
    and jsonb_typeof(new.subtitle_data) = 'object'
    and jsonb_typeof(new.subtitle_data->'items') = 'array'
    and jsonb_array_length(new.subtitle_data->'items') > 0
  );

  if new.coverage_status = 'ready' and new.subtitle_media_id is null and not has_valid_data then
    new.coverage_status := 'missing';
  end if;

  if new.coverage_status = 'missing' and (new.subtitle_media_id is not null or has_valid_data) then
    new.coverage_status := 'ready';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_wvsl_enforce_integrity on public.workshop_video_subtitle_links;
create trigger trg_wvsl_enforce_integrity
before insert or update on public.workshop_video_subtitle_links
for each row
execute function public.wvsl_enforce_integrity();
