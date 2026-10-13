import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "ss_auth";

async function verifyToken(token: string, secret: string): Promise<boolean> {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const sigBytes = new Uint8Array(sig.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
  return crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Demo workspaces (/app/demo-*) — no auth required
  if (pathname.match(/^\/app\/demo-[^/]+/)) {
    return NextResponse.next();
  }

  // Paid tenant workspaces (/app/<tenant>) — require valid ss_auth cookie
  if (pathname.match(/^\/app\/[^/]+/)) {
    const secret = process.env.SS_JWT_SECRET;
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!secret || !token || !(await verifyToken(token, secret))) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
