-- Invoice status overrides: persists paid/sent/overdue status changes
-- so they survive localStorage resets, device switches, and Safari eviction.
create table if not exists ss_invoice_overrides (
  tenant_slug  text        not null,
  invoice_id   text        not null,
  status       text        not null,
  updated_at   timestamptz not null default now(),
  primary key (tenant_slug, invoice_id)
);

-- Allow the service role to read/write; block anon
alter table ss_invoice_overrides enable row level security;

create policy "service role full access"
  on ss_invoice_overrides
  for all
  using (true)
  with check (true);