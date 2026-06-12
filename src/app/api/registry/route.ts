/* Machine-readable registry — single source of truth for docs + smoke runner. */

import { NextResponse } from "next/server";
import { ROUTES, ACTIONS, WORKFLOWS } from "@/suite/lib/routes";
import { SYSTEMS } from "@/suite/systems";

export const dynamic = "force-dynamic";

export async function GET() {
  // Expand the dynamic /systems/:slug route into one sample per system so the
  // smoke runner exercises every catalog detail page.
  const expanded = ROUTES.flatMap((r) =>
    r.path === "/systems/:slug"
      ? SYSTEMS.map((s) => ({ ...r, sample: `/systems/${s.slug}`, title: `System detail — ${s.shortName}` }))
      : [r],
  );

  return NextResponse.json(
    {
      routes: expanded,
      actions: ACTIONS,
      workflows: WORKFLOWS,
      systems: SYSTEMS.map((s) => ({
        slug: s.slug,
        name: s.name,
        shortName: s.shortName,
        category: s.category,
        tagline: s.tagline,
        accent: s.accent,
        badge: s.badge ?? null,
        modules: s.modules,
        pipeline: s.pipeline.map((p) => ({ id: p.id, label: p.label })),
        plans: s.plans.map((p) => ({ tier: p.tier, monthly: p.monthly, currency: p.currency })),
        features: s.features,
        addOns: s.addOns,
      })),
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
}
