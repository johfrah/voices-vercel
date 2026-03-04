-- Financial ledger foundation (phase 1)
-- Safe migration: creates new table + indexes only.

create table if not exists public.financial_ledger (
  id bigserial primary key,
  order_id integer not null references public.orders(id) on delete cascade,
  order_item_id integer references public.order_items(id) on delete set null,
  world_id integer references public.worlds(id) on delete set null,
  journey_id integer references public.journeys(id) on delete set null,
  entry_type text not null,
  source_system text not null default 'checkout_submit',
  amount_net numeric(12, 2) not null,
  currency_code text not null default 'EUR',
  idempotency_key text not null,
  meta_data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint financial_ledger_amount_net_non_negative check (amount_net >= 0)
);

create unique index if not exists financial_ledger_idempotency_key_idx
  on public.financial_ledger (idempotency_key);

create index if not exists financial_ledger_order_id_idx
  on public.financial_ledger (order_id);

create index if not exists financial_ledger_order_item_id_idx
  on public.financial_ledger (order_item_id);

create index if not exists financial_ledger_entry_type_idx
  on public.financial_ledger (entry_type);
