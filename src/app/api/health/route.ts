/* Health endpoint — consumed by /status, smoke.mjs and the Supreme Suite
   Control panel in the J Supreme conglomerate backoffice (CORS open).
   ?deep=1 fetches every registered route server-side and reports per-route. */

import { NextRequest, NextResponse } from "next/server";
import { ROUTES, ACTIONS, WORKFLOWS } from "@/suite/lib/routes";
import { SYSTEMS } from "@/suite/systems";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  const base = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const deep = req.nextUrl.searchParams.get("deep") === "1";

  const body: Record<string, unknown> = {
    ok: true,
    service: "supreme-suite",
    version: "1.0.0",
    ts: Date.now(),
    systems: SYSTEMS.map((s) => ({ slug: s.slug, name: s.name, category: s.category })),
    counts: { systems: SYSTEMS.length, routes: ROUTES.length, actions: ACTIONS.length, workflows: WORKFLOWS.length },
  };

  if (deep) {
    const results = await Promise.all(
      ROUTES.filter((r) => !r.path.startsWith("/api/health")).map(async (r) => {
        const url = `${base}${r.sample ?? r.path}`;
        const t0 = Date.now();
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 9000);
          const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
          clearTimeout(timer);
          const text = await res.text();
          const missing = r.expects.filter((m) => !text.includes(m));
          return {
            path: r.path,
            title: r.title,
            group: r.group,
            status: res.status,
            ok: res.ok && missing.length === 0,
            ms: Date.now() - t0,
            detail: !res.ok ? `HTTP ${res.status}` : missing.length ? `missing "${missing[0]}"` : "markers present",
          };
        } catch (e: any) {
          return { path: r.path, title: r.title, group: r.group, status: 0, ok: false, ms: Date.now() - t0, detail: e?.name === "AbortError" ? "timeout" : String(e?.message ?? e) };
        }
      }),
    );
    body.deep = results;
    body.ok = results.every((r) => r.ok);
  }

  return NextResponse.json(body, { headers: CORS });
}
