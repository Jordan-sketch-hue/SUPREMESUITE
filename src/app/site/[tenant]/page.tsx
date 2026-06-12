"use client";

/* Public branded website — the template every tenant ships with. */

import Link from "next/link";
import { BrandProvider } from "@/suite/components/brand-provider";
import { SiteTemplate } from "@/suite/components/site-template";
import { useWorkspace } from "@/suite/components/use-workspace";
import { Button } from "@/suite/components/ui";

export default function TenantSitePage() {
  const { slug, tenant, system } = useWorkspace();

  if (!tenant) {
    return (
      <div className="grid-dots flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Powered by Supreme Suite</p>
        <h1 className="font-display text-2xl font-semibold">Setting up this website…</h1>
        <p className="max-w-sm text-sm text-muted">
          If nothing loads, the workspace “{slug}” doesn't exist on this device — start a free trial and yours will live
          at this exact kind of link.
        </p>
        <Link href="/start">
          <Button>Create my website + CRM</Button>
        </Link>
      </div>
    );
  }

  return (
    <BrandProvider tenant={tenant}>
      <SiteTemplate tenant={tenant} system={system} />
    </BrandProvider>
  );
}
