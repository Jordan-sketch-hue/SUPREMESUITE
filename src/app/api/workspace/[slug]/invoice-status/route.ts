import { NextRequest, NextResponse } from "next/server";
import { verifySession, base, headers } from "@/suite/lib/supabase";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = req.cookies.get("ss_auth")?.value ?? "";
  const session = verifySession(token);
  if (!session || session.slug !== slug) {
    return NextResponse.json({ overrides: [] }, { status: 401 });
  }
  try {
    const url = `${base()}/rest/v1/ss_invoice_overrides?tenant_slug=eq.${encodeURIComponent(slug)}&select=invoice_id,status`;
    const res = await fetch(url, { headers: headers(), cache: "no-store" });
    if (!res.ok) return NextResponse.json({ overrides: [] });
    const rows = await res.json() as { invoice_id: string; status: string }[];
    return NextResponse.json({ overrides: rows });
  } catch {
    return NextResponse.json({ overrides: [] });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const token = req.cookies.get("ss_auth")?.value ?? "";
  const session = verifySession(token);
  if (!session || session.slug !== slug) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body?.invoice_id || !body?.status) {
    return NextResponse.json({ error: "invoice_id and status required" }, { status: 400 });
  }
  try {
    const url = `${base()}/rest/v1/ss_invoice_overrides`;
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers(), Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        tenant_slug: slug,
        invoice_id: body.invoice_id,
        status: body.status,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}