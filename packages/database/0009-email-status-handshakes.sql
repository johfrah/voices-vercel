-- 0009-email-status-handshakes.sql
-- Handshake status table for outbound transactional mail.

create table if not exists email_status_handshakes (
  id bigserial primary key,
  handshake_id text not null unique,
  approval_queue_id integer references approval_queue(id) on delete set null,
  mail_content_id integer references mail_content(id) on delete set null,
  template_key text not null,
  status text not null default 'queued',
  recipient_email text not null,
  subject text not null,
  market_code text,
  world_id integer,
  journey_code text,
  language_code text,
  source_host text,
  target_type text,
  target_id text,
  provider_message_id text unique,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  meta_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  failed_at timestamptz
);

create index if not exists email_status_handshakes_status_created_at_idx
  on email_status_handshakes (status, created_at desc);

create index if not exists email_status_handshakes_template_status_idx
  on email_status_handshakes (template_key, status, created_at desc);

create index if not exists email_status_handshakes_target_idx
  on email_status_handshakes (target_type, target_id);
