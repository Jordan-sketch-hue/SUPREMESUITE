import { NextRequest, NextResponse } from "next/server";
import { getTenantByEmail, verifyPassword, signSession } from "@/suite/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let email: string, password: string;
  try {
    ({ email, password } = await req.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const tenant = await getTenantByEmail(email.trim().toLowerCase()).catch(() => null);
  if (!tenant) {
    // Constant-time response to avoid email enumeration
    await new Promise((r) => setTimeout(r, 200));
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const valid = verifyPassword(password, tenant.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const token = signSession({
    tid: tenant.id,
    slug: tenant.slug,
    email: tenant.email,
    plan: tenant.plan,
  });

  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true, slug: tenant.slug });
  res.cookies.set("ss_auth", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
  return res;
}
