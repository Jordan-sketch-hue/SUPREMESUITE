-- Supreme Suite — Neon DB Schema
-- Run this ONCE against your Neon project to create the tables.
-- Then add DATABASE_URL to both Vercel projects (supreme-suite + jst-website).

CREATE TABLE IF NOT EXISTS ss_tenants (
  id                TEXT PRIMARY KEY,
  slug              TEXT UNIQUE NOT NULL,
  business_name     TEXT NOT NULL,
  system_slug       TEXT NOT NULL DEFAULT 'courier',
  owner_name        TEXT,
  email             TEXT UNIQUE NOT NULL,
  phone             TEXT,
  plan              TEXT NOT NULL DEFAULT 'starter',
  plan_package      TEXT,
  password_hash     TEXT NOT NULL,
  brand_color       TEXT NOT NULL DEFAULT '#0f0f0f',
  activated_at      TIMESTAMPTZ,
  trial_started_at  BIGINT,
  add_ons           TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS ss_purchases (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL REFERENCES ss_tenants(id),
  order_id         TEXT NOT NULL,
  transaction_id   TEXT,
  service_slug     TEXT NOT NULL,
  package_slug     TEXT NOT NULL,
  plan_name        TEXT NOT NULL,
  amount_jmd       NUMERIC NOT NULL,
  payment_env      TEXT NOT NULL DEFAULT 'sandbox',
  customer_email   TEXT NOT NULL,
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ss_invoice_overrides (
  tenant_slug  TEXT NOT NULL,
  invoice_id   TEXT NOT NULL,
  status       TEXT NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_slug, invoice_id)
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS ss_tenants_email_idx ON ss_tenants (email);
CREATE INDEX IF NOT EXISTS ss_tenants_slug_idx  ON ss_tenants (slug);
CREATE INDEX IF NOT EXISTS ss_purchases_tenant_idx ON ss_purchases (tenant_id);
