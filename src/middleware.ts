/**
 * Auth guard for paid (non-demo) Supreme Suite workspaces.
 * Runs at Edge. Demo slugs (demo-*) pass through with no auth.
 * All other /app/[slug] routes require a valid ss_auth session cookie.
 *
 * Session token format: {base64url_payload}.{sha256_sig}
 *   payload  = base64url(JSON { tid, slug, email, plan, exp })
 *   sig      = SHA-256(payload + "." + SS_JWT_SECRET) → base64url
 *
 * Matches the signSession() / verifySession() logic in suite/lib/supabase.ts.
 * Uses Web Crypto (crypto.subtle) — no Node.js dep needed at Edge.
 */

import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/app/:slug/:path*"],
};

function tokenSecret(): string {
  // Must match the secret used in supabase.ts signSession()
  return process.env.SS_JWT_SECRET || "ss-dev-secret-change-me";
}

/** base64 standard → base64url */
function toB64url(b64: string): string {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function verifyToken(token: string, slug: string): Promise<boolean> {
  try {
    const dot = token.lastIndexOf(".");
    if (dot < 0) return false;

    const data = token.slice(0, dot);
    const sig = token.slice(dot + 1);

    // Recompute SHA-256(data + "." + secret) — same as supabase.ts signSession()
    const enc = new TextEncoder();
    const hashBuf = await crypto.subtle.digest(
      "SHA-256",
      enc.encode(`${data}.${tokenSecret()}`),
    );
    const expectedSig = toB64url(
      btoa(String.fromCharCode(...new Uint8Array(hashBuf))),
    );

    if (expectedSig !== sig) return false;

    // Decode payload
    const json = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { slug: string; exp: number };

    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
    if (payload.slug !== slug) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const match = pathname.match(/^\/app\/([^/]+)/);
  if (!match) return NextResponse.next();
  const slug = match[1]!;

  // Demo workspaces are public — no auth required
  if (slug.startsWith("demo-")) return NextResponse.next();

  const token = req.cookies.get("ss_auth")?.value ?? "";
  const valid = token ? await verifyToken(token, slug) : false;

  if (!valid) {
    const loginUrl = new URL("/app/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
