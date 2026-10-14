"use client";

/* useWorkspace — resolves the current tenant + its system pack from the URL.
   Falls back to the courier pack pre-hydration so SSR always renders a full
   page skeleton (headings, empty states) for smoke checks and fast paint. */

import { useParams } from "next/navigation";
import { useEffect } from "react";
import type { SystemDef, Tenant } from "../types";
import { useTenant } from "../lib/store";
import { ensureDemoTenant } from "../lib/ops";
import { getSystem, trySystem } from "../systems";

export function useWorkspace(): { slug: string; tenant: Tenant | null; system: SystemDef } {
  const params = useParams<{ tenant: string }>();
  const slug = typeof params?.tenant === "string" ? params.tenant : "";
  const tenant = useTenant(slug);

  // Self-provision demo workspaces on first visit.
  useEffect(() => {
    if (slug && !tenant) ensureDemoTenant(slug);
  }, [slug, tenant]);

  // For demo-<system> slugs, infer the system pack directly from the URL so
  // the shell and labels render correctly before the tenant is hydrated from
  // localStorage (first visit, before ensureDemoTenant fires).
  const demoSystem = slug.startsWith("demo-") ? trySystem(slug.slice(5)) : null;
  const system = trySystem(tenant?.systemSlug) ?? demoSystem ?? getSystem("courier");
  return { slug, tenant, system };
}
