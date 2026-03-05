-- v2.28.16
-- Restore notifications table for client navigation panel.

create table if not exists public.notifications (
  id serial primary key,
  user_id integer not null references public.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamp without time zone not null default now()
);

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id)
  where is_read = false;

grant select, insert, update, delete on public.notifications to authenticated, service_role;
grant usage, select on sequence public.notifications_id_seq to authenticated, service_role;
