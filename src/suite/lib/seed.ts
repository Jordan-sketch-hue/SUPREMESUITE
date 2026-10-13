import { getDb } from "./db";
import { demoSlugToSystem } from "../systems";

export type SeedCtx = {
  tenantSlug: string;
  workspaceName: string;
};

async function ensureSchema() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS workspaces (
      id          TEXT PRIMARY KEY,
      slug        TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      system_slug TEXT NOT NULL,
      is_demo     BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS workspace_kpis (
      id           BIGSERIAL PRIMARY KEY,
      workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      key          TEXT NOT NULL,
      label        TEXT NOT NULL,
      value        TEXT NOT NULL,
      unit         TEXT,
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (workspace_id, key)
    )
  `;
}

// Seed a demo workspace — idempotent (upsert). Only called for demo- tenants.
export async function seed(ctx: SeedCtx): Promise<void> {
  const system = demoSlugToSystem(ctx.tenantSlug);
  if (!system) return;

  const sql = getDb();

  await ensureSchema();

  await sql`
    INSERT INTO workspaces (id, slug, name, system_slug, is_demo)
    VALUES (${ctx.tenantSlug}, ${ctx.tenantSlug}, ${ctx.workspaceName}, ${system.slug}, TRUE)
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  `;

  for (const kpi of system.kpis) {
    await sql`
      INSERT INTO workspace_kpis (workspace_id, key, label, value, unit)
      VALUES (
        ${ctx.tenantSlug},
        ${kpi.key},
        ${kpi.label},
        ${String(kpi.seedValue)},
        ${kpi.unit ?? null}
      )
      ON CONFLICT (workspace_id, key) DO UPDATE
        SET label = EXCLUDED.label,
            value = EXCLUDED.value,
            unit  = EXCLUDED.unit,
            updated_at = NOW()
    `;
  }
}

// Fetch workspace metadata from DB
export async function getWorkspace(
  slug: string
): Promise<{ name: string; systemSlug: string; isDemo: boolean } | null> {
  const sql = getDb();
  const rows = await sql`
    SELECT name, system_slug, is_demo
    FROM workspaces
    WHERE slug = ${slug}
    LIMIT 1
  `;
  const row = rows[0] as { name: string; system_slug: string; is_demo: boolean } | undefined;
  if (!row) return null;
  return { name: row.name, systemSlug: row.system_slug, isDemo: row.is_demo };
}

export type KpiRow = { key: string; label: string; value: string; unit: string | null };

export async function getKpis(tenantSlug: string): Promise<KpiRow[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT key, label, value, unit
    FROM workspace_kpis
    WHERE workspace_id = ${tenantSlug}
    ORDER BY key
  `;
  return rows as KpiRow[];
}
