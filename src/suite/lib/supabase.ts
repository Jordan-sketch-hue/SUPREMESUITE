/**
 * supabase.ts — Supabase REST client for paid tenant lookups. SERVER ONLY.
 * Uses the PostgREST HTTP API directly (no SDK — keeps supreme-suite dependency-free).
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL  — https://ciggiwpztuxkmbaccrlp.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (bypasses RLS)
 */

import { createHash, pbkdf2Sync, timingSafeEqual } from "node:crypto";

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

function headers() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

function base(): string {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!u) throw new Error("NEXT_PUBLIC_SUPABASE_URL not set");
  return u;
}

export async function getTenantByEmail(email: string): Promise<SsTenant | null> {
  const url = `${base()}/rest/v1/ss_tenants?email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`;
  const res = await fetch(url, { headers: headers(), cache: "no-store" });
  if (!res.ok) return null;
  const rows: SsTenant[] = await res.json();
  return rows[0] ?? null;
}

export async function getTenantBySlug(slug: string): Promise<SsTenant | null> {
  const url = `${base()}/rest/v1/ss_tenants?slug=eq.${encodeURIComponent(slug)}&limit=1`;
  const res = await fetch(url, { headers: headers(), cache: "no-store" });
  if (!res.ok) return null;
  const rows: SsTenant[] = await res.json();
  return rows[0] ?? null;
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

// ── Session token (HMAC-SHA256 signed, no JWT library) ─────────────────────

export interface SessionPayload {
  tid: string;   // tenant id
  slug: string;
  email: string;
  plan: string;
  exp: number;   // unix epoch seconds
}

const SESSION_TTL = 30 * 24 * 60 * 60; // 30 days

function tokenSecret(): string {
  return process.env.SS_JWT_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "ss-dev-secret-change-me";
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
