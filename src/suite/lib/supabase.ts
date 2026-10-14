/**
 * supabase.ts — Neon DB client for paid tenant lookups. SERVER ONLY.
 * Migrated from Supabase PostgREST → Neon DB (@neondatabase/serverless).
 *
 * Required env var:
 *   DATABASE_URL — Neon postgres connection string (pooled or direct)
 *
 * PBKDF2/HMAC-SHA256 auth helpers stay in this file (no DB dependency).
 */

import { createHash, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export interface SsTenant {
  id: string;
  slug: string;
  business_name: string;
  system_slug: string;
  owner_name: string | null;
  email: string;
  phone: string | null;
  plan: string;
  plan_package: string | null;
  password_hash: string;
  brand_color: string;
  activated_at: string | null;
  add_ons: string[];
}

export async function getTenantByEmail(email: string): Promise<SsTenant | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM ss_tenants WHERE email = ${email.toLowerCase()} LIMIT 1
  `;
  return (rows[0] as SsTenant) ?? null;
}

export async function getTenantBySlug(slug: string): Promise<SsTenant | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM ss_tenants WHERE slug = ${slug} LIMIT 1
  `;
  return (rows[0] as SsTenant) ?? null;
}

/** Run a raw parameterized query — use for tables not covered above. */
export function getSqlClient() {
  return getSql();
}

/**
 * Verify a PBKDF2-based password hash produced by provision.ts.
 * Format: pbkdf2v1:{hex_salt}:{hex_hash}
 */
export function verifyPassword(plain: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "pbkdf2v1") return false;
  const [, salt, expected] = parts;
  const actual = pbkdf2Sync(plain, salt!, 100_000, 32, "sha256").toString("hex");
  if (actual.length !== expected!.length) return false;
  return timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected!, "hex"));
}

// ── Session token (HMAC-SHA256 signed, no JWT library) ────────────────────────

export interface SessionPayload {
  tid: string;   // tenant id
  slug: string;
  email: string;
  plan: string;
  exp: number;   // unix epoch seconds
}

const SESSION_TTL = 30 * 24 * 60 * 60; // 30 days

function tokenSecret(): string {
  return process.env.SS_JWT_SECRET || "ss-dev-secret-change-me";
}

export function signSession(payload: Omit<SessionPayload, "exp">): string {
  const p: SessionPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + SESSION_TTL };
  const data = Buffer.from(JSON.stringify(p)).toString("base64url");
  const sig = createHash("sha256").update(`${data}.${tokenSecret()}`).digest("base64url");
  return `${data}.${sig}`;
}

export function verifySession(token: string): SessionPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = createHash("sha256").update(`${data}.${tokenSecret()}`).digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const p: SessionPayload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (p.exp < Math.floor(Date.now() / 1000)) return null;
    return p;
  } catch {
    return null;
  }
}
