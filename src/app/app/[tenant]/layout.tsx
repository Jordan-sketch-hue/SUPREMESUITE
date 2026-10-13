import { notFound, redirect } from "next/navigation";
import { getSession } from "@/suite/lib/auth";
import { seed, getWorkspace } from "@/suite/lib/seed";
import { getSystem, demoSlugToSystem } from "@/suite/systems";
import { AppShell } from "@/suite/components/AppShell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { tenant } = await params;
  if (tenant.startsWith("demo-")) {
    const system = demoSlugToSystem(tenant);
    return { title: system ? `Demo · ${system.name}` : "Demo" };
  }
  const ws = await getWorkspace(tenant);
  return { title: ws?.name ?? "Workspace" };
}

export default async function WorkspaceLayout({ children, params }: Props) {
  const { tenant } = await params;
  const isDemo = tenant.startsWith("demo-");

  let workspaceName: string;
  let systemSlug: string;

  if (isDemo) {
    // Demo workspaces — no auth required, seed on load (idempotent upsert)
    const system = demoSlugToSystem(tenant);
    if (!system) notFound();

    workspaceName = `${system.name} Demo`;
    systemSlug = system.slug;

    await seed({ tenantSlug: tenant, workspaceName });
  } else {
    // Paid workspaces — require valid ss_auth cookie
    // Middleware already verified the signature; here we check tenant ownership.
    const session = await getSession();
    if (!session) redirect(`/login?next=/app/${tenant}`);
    if (session.tenantSlug !== tenant) redirect(`/app/${session.tenantSlug}`);

    // Fetch workspace name from DB server-side (Bug 4 fix — no 'Workspace' placeholder)
    const ws = await getWorkspace(tenant);
    if (!ws) notFound();

    workspaceName = ws.name;
    systemSlug = ws.systemSlug;
  }

  const system = getSystem(systemSlug);
  if (!system) notFound();

  return (
    <AppShell
      tenantSlug={tenant}
      workspaceName={workspaceName}
      systemColor={system.color}
    >
      {children}
    </AppShell>
  );
}
