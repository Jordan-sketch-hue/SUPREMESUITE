"use client";

/* Workspace dashboard — KPI row, charts, mini funnel, activity, quick actions. */

import Link from "next/link";
import { ArrowRight, ExternalLink, Inbox, Plus, Sparkles } from "lucide-react";
import type { Booking, CrmRecord, Customer, Invoice, Message, MetricContext } from "@/suite/types";
import { useCol } from "@/suite/lib/store";
import { trailingDays, money, compact, relTime, pct } from "@/suite/lib/format";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Badge, Button, Card, CardHeader, Stat, StatusDot } from "@/suite/components/ui";
import { ChartCard } from "@/suite/components/charts";

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m ? `${m}m ${s}s` : `${s}s`;
}

export default function DashboardPage() {
  const { tenant, system } = useWorkspace();
  const records = useCol<CrmRecord>(tenant?.id, "records");
  const customers = useCol<Customer>(tenant?.id, "customers");
  const bookings = useCol<Booking>(tenant?.id, "bookings");
  const invoices = useCol<Invoice>(tenant?.id, "invoices");
  const messages = useCol<Message>(tenant?.id, "messages");

  const ctx: MetricContext = {
    records,
    customers,
    bookings,
    invoices,
    system,
    days: trailingDays(14),
  };

  const base = tenant ? `/app/${tenant.slug}` : "#";
  const recent = [...messages].sort((a, b) => b.at - a.at).slice(0, 6);
  const newBookings = bookings.filter((b) => b.status === "new").slice(0, 4);

  return (
    <>
      <PageHead
        title="Dashboard"
        sub={tenant ? `${system.name} · everything ${tenant.businessName} has moving, right now` : "Loading workspace…"}
        actions={
          <>
            <Link href={`${base}/records`}>
              <Button variant="outline" size="sm">
                <Plus className="size-4" /> New {system.recordNoun.singular.toLowerCase()}
              </Button>
            </Link>
            {tenant && (
              <Link href={`/site/${tenant.slug}`} target="_blank">
                <Button size="sm">
                  <ExternalLink className="size-4" /> Open website
                </Button>
              </Link>
            )}
          </>
        }
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {system.kpis.slice(0, 4).map((k) => {
          const v = k.compute(ctx);
          const Icon = k.icon;
          return (
            <Stat
              key={k.id}
              label={k.label}
              icon={<Icon />}
              value={
                k.format === "money" ? money(v) : k.format === "percent" ? pct(v) : k.format === "duration" ? fmtDuration(v) : compact(v)
              }
              sub={k.sublabel ?? "last 14 days"}
            />
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {system.charts.slice(0, 2).map((c) => (
          <ChartCard key={c.id} def={c} ctx={ctx} className="lg:col-span-1" />
        ))}

        {/* Funnel */}
        <Card>
          <CardHeader title="Pipeline funnel" sub={`${records.length} ${system.recordNoun.plural.toLowerCase()} total`} />
          <div className="space-y-2.5 px-5 pb-5">
            {system.pipeline.map((s) => {
              const count = records.filter((r) => r.status === s.id).length;
              const w = records.length ? Math.max(4, (count / records.length) * 100) : 4;
              return (
                <Link key={s.id} href={`${base}/records`} className="group block">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-ink-3 group-hover:text-ink">
                      <StatusDot tone={s.tone} /> {s.label}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${w}%`, opacity: s.done ? 0.45 : 1 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="New booking requests"
            sub="Fresh from your website & AI assistant"
            action={
              <Link href={`${base}/bookings`} className="text-xs font-semibold text-brand-strong hover:underline">
                View all <ArrowRight className="inline size-3" />
              </Link>
            }
          />
          <div className="px-5 pb-5">
            {newBookings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-xs text-muted">
                No new requests right now — share your website link to get booked.
              </p>
            ) : (
              <ul className="divide-y divide-line-2">
                {newBookings.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 py-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-brand-soft">
                      <Inbox className="size-4 text-brand-strong" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{b.customerName}</p>
                      <p className="truncate text-[11px] text-muted">
                        {String(b.fields.service ?? "request")} · {relTime(b.requestedAt)}
                      </p>
                    </div>
                    <Badge tone={b.source === "widget" ? "progress" : "info"}>{b.source === "widget" ? "AI bot" : "website"}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Latest activity"
            sub="Messages across all channels"
            action={
              <Link href={`${base}/messages`} className="text-xs font-semibold text-brand-strong hover:underline">
                Open inbox <ArrowRight className="inline size-3" />
              </Link>
            }
          />
          <div className="px-5 pb-5">
            {recent.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-xs text-muted">
                Conversations will appear here.
              </p>
            ) : (
              <ul className="divide-y divide-line-2">
                {recent.map((m) => (
                  <li key={m.id} className="flex items-start gap-3 py-2.5">
                    <StatusDot tone={m.direction === "inbound" ? "info" : m.direction === "note" ? "warn" : "ok"} className="mt-1.5" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px]">
                        <span className="font-semibold">{m.customerName}</span>{" "}
                        <span className="text-muted">· {m.channel} · {relTime(m.at)}</span>
                      </p>
                      <p className="truncate text-[12px] text-ink-3">{m.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      {/* Demo hint */}
      {tenant?.slug.startsWith("demo-") && (
        <Card className="mt-4 border-brand-ring bg-brand-softer">
          <div className="flex flex-wrap items-center gap-3 px-5 py-4">
            <Sparkles className="size-5 text-brand" />
            <p className="flex-1 text-sm text-ink-3">
              You're exploring the <strong>{system.name}</strong> demo with realistic sample data. Like it? Make your own
              branded workspace in under a minute.
            </p>
            <Link href={`/start?system=${system.slug}`}>
              <Button size="sm">Start my 3-day trial</Button>
            </Link>
          </div>
        </Card>
      )}
    </>
  );
}
