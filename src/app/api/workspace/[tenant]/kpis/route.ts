import { NextRequest, NextResponse } from "next/server";
import { getKpis } from "@/suite/lib/seed";
import { getSession } from "@/suite/lib/auth";

type Params = { params: Promise<{ tenant: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { tenant } = await params;

  const isDemo = tenant.startsWith("demo-");
  if (!isDemo) {
    const session = await getSession();
    if (!session || session.tenantSlug !== tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const kpis = await getKpis(tenant);
  return NextResponse.json({ kpis });
}
