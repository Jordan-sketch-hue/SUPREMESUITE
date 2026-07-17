import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/suite/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("ss_auth")?.value ?? "";
  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  return NextResponse.json({
    tenantId: session.tid,
    slug: session.slug,
    email: session.email,
    plan: session.plan,
  });
}
