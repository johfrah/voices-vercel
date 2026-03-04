-- v2.28.14
-- Workshop subtitle coverage + ID-based junction system

create table if not exists public.workshop_video_subtitle_links (
  id bigserial primary key,
  workshop_id bigint not null references public.workshops(id) on delete cascade,
  video_media_id integer not null references public.media(id) on delete cascade,
  video_role text not null default 'video' check (video_role in ('video', 'aftermovie')),
  language_code text not null default 'nl-BE',
  subtitle_media_id integer references public.media(id) on delete set null,
  subtitle_data jsonb,
  coverage_status text not null default 'missing' check (coverage_status in ('ready', 'missing', 'draft')),
  is_default boolean not null default false,
  is_enabled boolean not null default true,
  source_kind text not null default 'manual',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_wvsl_workshop_video_lang_role unique (workshop_id, video_media_id, language_code, video_role),
  constraint ck_wvsl_ready_payload check (
    coverage_status <> 'ready' or subtitle_media_id is not null or subtitle_data is not null
  )
);

create index if not exists idx_wvsl_workshop_video on public.workshop_video_subtitle_links (workshop_id, video_media_id);
create index if not exists idx_wvsl_status_enabled on public.workshop_video_subtitle_links (coverage_status, is_enabled);
create unique index if not exists uq_wvsl_default_per_video
  on public.workshop_video_subtitle_links (workshop_id, video_media_id, video_role)
  where is_default = true and is_enabled = true;

create or replace function public.set_updated_at_workshop_video_subtitle_links()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at_workshop_video_subtitle_links on public.workshop_video_subtitle_links;
create trigger trg_set_updated_at_workshop_video_subtitle_links
before update on public.workshop_video_subtitle_links
for each row
execute function public.set_updated_at_workshop_video_subtitle_links();

with source_workshops as (
  select id as workshop_id, meta
  from public.workshops
  where world_id = 2
    and status in ('live', 'publish')
),
video_candidates as (
  select
    workshop_id,
    case
      when coalesce(meta->>'video_id', '') ~ '^[0-9]+$' then (meta->>'video_id')::integer
      else null
    end as video_media_id,
    'video'::text as video_role,
    case
      when jsonb_typeof(meta->'subtitle_data') = 'object'
           and jsonb_typeof(meta->'subtitle_data'->'items') = 'array'
           and jsonb_array_length(meta->'subtitle_data'->'items') > 0
        then meta->'subtitle_data'
      else null
    end as subtitle_payload
  from source_workshops

  union all

  select
    workshop_id,
    case
      when coalesce(meta->>'aftermovie_video_id', '') ~ '^[0-9]+$' then (meta->>'aftermovie_video_id')::integer
      else null
    end as video_media_id,
    'aftermovie'::text as video_role,
    case
      when jsonb_typeof(meta->'aftermovie_subtitle_data') = 'object'
           and jsonb_typeof(meta->'aftermovie_subtitle_data'->'items') = 'array'
           and jsonb_array_length(meta->'aftermovie_subtitle_data'->'items') > 0
        then meta->'aftermovie_subtitle_data'
      else null
    end as subtitle_payload
  from source_workshops
),
normalized as (
  select
    workshop_id,
    video_media_id,
    video_role,
    case
      when lower(coalesce(subtitle_payload->>'lang', '')) in ('nl', 'nl-be') then 'nl-BE'
      when (subtitle_payload->>'lang') ~ '^[a-z]{2}-[A-Z]{2}$' then subtitle_payload->>'lang'
      else 'nl-BE'
    end as language_code,
    subtitle_payload as subtitle_data,
    case
      when subtitle_payload is not null then 'ready'
      else 'missing'
    end as coverage_status,
    case
      when subtitle_payload is not null then 'legacy_meta_subtitle_data'
      when video_role = 'aftermovie' then 'coverage_scan_aftermovie'
      else 'coverage_scan_video'
    end as source_kind
  from video_candidates
  where video_media_id is not null
)
insert into public.workshop_video_subtitle_links (
  workshop_id,
  video_media_id,
  video_role,
  language_code,
  subtitle_media_id,
  subtitle_data,
  coverage_status,
  is_default,
  is_enabled,
  source_kind,
  notes
)
select
  workshop_id,
  video_media_id,
  video_role,
  language_code,
  null as subtitle_media_id,
  subtitle_data,
  coverage_status,
  true as is_default,
  true as is_enabled,
  source_kind,
  case
    when coverage_status = 'missing' then 'Backfill placeholder: subtitle track ontbreekt nog'
    else 'Backfill from legacy workshop.meta subtitle_data'
  end as notes
from normalized
on conflict (workshop_id, video_media_id, language_code, video_role)
do update
set
  subtitle_data = coalesce(public.workshop_video_subtitle_links.subtitle_data, excluded.subtitle_data),
  coverage_status = case
    when public.workshop_video_subtitle_links.subtitle_media_id is not null
      or public.workshop_video_subtitle_links.subtitle_data is not null
      then 'ready'
    else excluded.coverage_status
  end,
  source_kind = public.workshop_video_subtitle_links.source_kind,
  is_enabled = true,
  updated_at = now();

create or replace view public.workshop_video_subtitle_coverage as
select
  l.id,
  l.workshop_id,
  w.slug as workshop_slug,
  l.video_media_id,
  l.video_role,
  l.language_code,
  l.coverage_status,
  l.subtitle_media_id,
  sm.file_path as subtitle_file_path,
  (l.subtitle_data is not null) as has_subtitle_data,
  l.is_default,
  l.is_enabled,
  l.source_kind,
  l.notes,
  l.created_at,
  l.updated_at
from public.workshop_video_subtitle_links l
join public.workshops w on w.id = l.workshop_id
left join public.media sm on sm.id = l.subtitle_media_id;
