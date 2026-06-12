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

  const system = trySystem(tenant?.systemSlug) ?? getSystem("courier");
  return { slug, tenant, system };
}
