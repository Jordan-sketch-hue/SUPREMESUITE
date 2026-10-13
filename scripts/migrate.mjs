// Run: node scripts/migrate.mjs
// Requires DATABASE_URL in environment
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

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

console.log("Migration complete.");
