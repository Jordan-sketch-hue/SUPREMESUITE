import { NextRequest, NextResponse } from "next/server";
import { verifySession, getSqlClient } from "@/suite/lib/supabase";

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
    const sql = getSqlClient();
    const rows = await sql`
      SELECT invoice_id, status FROM ss_invoice_overrides
      WHERE tenant_slug = ${slug}
    `;
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
    const sql = getSqlClient();
    await sql`
      INSERT INTO ss_invoice_overrides (tenant_slug, invoice_id, status, updated_at)
      VALUES (${slug}, ${body.invoice_id}, ${body.status}, ${new Date().toISOString()})
      ON CONFLICT (tenant_slug, invoice_id) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "db error" }, { status: 500 });
  }
}
