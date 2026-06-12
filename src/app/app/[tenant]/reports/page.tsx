"use client";

/* Reports — full chart gallery + KPI grid + CSV export. */

import { Download } from "lucide-react";
import type { Booking, CrmRecord, Customer, Invoice, MetricContext } from "@/suite/types";
import { useCol } from "@/suite/lib/store";
import { trailingDays, money, compact, pct } from "@/suite/lib/format";
import { toCsv, downloadText } from "@/suite/lib/csv";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Button, Stat } from "@/suite/components/ui";
import { ChartCard } from "@/suite/components/charts";
import { useToast } from "@/suite/components/overlays";

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  return m ? `${m}m ${Math.round(sec % 60)}s` : `${Math.round(sec)}s`;
}

export default function ReportsPage() {
  const { tenant, system } = useWorkspace();
  const toast = useToast();
  const records = useCol<CrmRecord>(tenant?.id, "records");
  const customers = useCol<Customer>(tenant?.id, "customers");
  const bookings = useCol<Booking>(tenant?.id, "bookings");
  const invoices = useCol<Invoice>(tenant?.id, "invoices");

  const ctx: MetricContext = { records, customers, bookings, invoices, system, days: trailingDays(14) };

  const exportCsv = () => {
    const rows = records.map((r) => ({
      ref: r.ref,
      title: r.title,
      stage: system.pipeline.find((s) => s.id === r.status)?.label ?? r.status,
      customer: customers.find((c) => c.id === r.customerId)?.name ?? "",
      value: r.value ?? "",
      due: r.due ?? "",
      assignee: r.assignee ?? "",
      created: new Date(r.createdAt).toISOString(),
      ...r.fields,
    }));
    downloadText(`${tenant?.slug ?? "workspace"}-${system.recordNoun.plural.toLowerCase()}.csv`, toCsv(rows));
    toast(`Exported ${rows.length} rows`);
  };

  return (
    <>
      <PageHead
        title="Reports"
        sub="The numbers behind the work — last 14 days"
        actions={
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {system.kpis.map((k) => {
          const v = k.compute(ctx);
          const Icon = k.icon;
          return (
            <Stat
              key={k.id}
              label={k.label}
              icon={<Icon />}
              value={k.format === "money" ? money(v) : k.format === "percent" ? pct(v) : k.format === "duration" ? fmtDuration(v) : compact(v)}
            />
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {system.charts.map((c) => (
          <ChartCard key={c.id} def={c} ctx={ctx} />
        ))}
      </div>

      <p className="mt-6 text-center text-[11px] text-muted">
        Want cross-business BI? The <strong>Analytics Dashboards</strong> add-on unifies every workspace you run.
      </p>
    </>
  );
}
