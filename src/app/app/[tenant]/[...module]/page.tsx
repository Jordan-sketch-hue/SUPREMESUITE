import { notFound } from "next/navigation";
import { getSystem, demoSlugToSystem } from "@/suite/systems";
import { getWorkspace } from "@/suite/lib/seed";
import { getSession } from "@/suite/lib/auth";

type Props = {
  params: Promise<{ tenant: string; module: string[] }>;
};

export async function generateMetadata({ params }: Props) {
  const { module } = await params;
  const label = moduleLabel(module[0] ?? "");
  return { title: label };
}

function moduleLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ModulePage({ params }: Props) {
  const { tenant, module } = await params;
  const isDemo = tenant.startsWith("demo-");
  const moduleSlug = module[0] ?? "";
  const label = moduleLabel(moduleSlug);

  let systemSlug: string;

  if (isDemo) {
    const system = demoSlugToSystem(tenant);
    if (!system) notFound();
    systemSlug = system.slug;
  } else {
    const session = await getSession();
    if (!session || session.tenantSlug !== tenant) notFound();
    const ws = await getWorkspace(tenant);
    if (!ws) notFound();
    systemSlug = ws.systemSlug;
  }

  const system = getSystem(systemSlug);
  if (!system) notFound();

  // Verify this module belongs to this system's nav
  const navItem = system.navItems.find(
    (n) => n.href === `/${moduleSlug}` || n.href === `/${module.join("/")}`,
  );
  if (!navItem) notFound();

  return (
    <div className="px-8 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: system.color }}
        />
        <h1 className="text-2xl font-bold text-slate-100">{navItem.label}</h1>
        {isDemo && (
          <span className="rounded-full bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-300">
            Demo
          </span>
        )}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-10 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${system.color}22` }}
        >
          <span
            className="text-2xl font-bold"
            style={{ color: system.color }}
          >
            {navItem.label.charAt(0)}
          </span>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-slate-100">
          {navItem.label}
        </h2>
        <p className="mx-auto max-w-sm text-sm text-slate-400">
          This module is part of the <strong className="text-slate-200">{system.name}</strong>{" "}
          workspace. Full data tables, filters, and actions will appear here once this workspace
          is connected to live operations.
        </p>
        {isDemo && (
          <div className="mt-6">
            <a
              href="/login"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
              style={{ backgroundColor: system.color }}
            >
              Try a different system &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
