import { notFound } from "next/navigation";
import { getWorkspace, getKpis } from "@/suite/lib/seed";
import { getSystem, demoSlugToSystem } from "@/suite/systems";
import { KpiCard } from "@/suite/components/KpiCard";

type Props = {
  params: Promise<{ tenant: string }>;
};

export default async function WorkspaceDashboardPage({ params }: Props) {
  const { tenant } = await params;
  const isDemo = tenant.startsWith("demo-");

  let workspaceName: string;
  let systemSlug: string;

  if (isDemo) {
    const system = demoSlugToSystem(tenant);
    if (!system) notFound();
    workspaceName = `${system.name} Demo`;
    systemSlug = system.slug;
  } else {
    const ws = await getWorkspace(tenant);
    if (!ws) notFound();
    workspaceName = ws.name;
    systemSlug = ws.systemSlug;
  }

  const system = getSystem(systemSlug);
  if (!system) notFound();

  // KPIs seeded by layout for demo, or live from DB for paid workspaces
  const kpis = await getKpis(tenant);

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: system.color }}
          />
          <h1 className="text-2xl font-bold text-slate-100">{system.name} Dashboard</h1>
          {isDemo && (
            <span className="rounded-full bg-blue-900/40 px-2.5 py-0.5 text-xs font-medium text-blue-300">
              Demo
            </span>
          )}
        </div>
        <p className="mt-1 text-slate-400">{workspaceName}</p>
      </div>

      {kpis.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard
              key={kpi.key}
              label={kpi.label}
              value={kpi.value}
              unit={kpi.unit}
              color={system.color}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">
          <p>{isDemo ? "Seeding workspace data…" : "No KPI data available yet."}</p>
        </div>
      )}

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-200">Quick Access</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {system.navItems
            .filter((item) => item.href !== "")
            .map((item) => (
              <a
                key={item.href}
                href={`/app/${tenant}${item.href}`}
                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 hover:border-slate-500 hover:text-slate-100 transition"
              >
                <span>{item.label}</span>
                <span className="text-slate-500">→</span>
              </a>
            ))}
        </div>
      </div>
    </div>
  );
}
