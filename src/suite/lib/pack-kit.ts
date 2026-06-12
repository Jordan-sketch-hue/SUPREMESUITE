/* ============================================================================
   PACK KIT — shared KPI & chart factories.
   System packs compose these instead of hand-writing analytics, so every
   industry gets premium dashboards from ~6 lines of config.
============================================================================ */

import {
  Activity,
  BadgeDollarSign,
  CalendarCheck,
  Inbox,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ChartDef, KpiDef, MetricContext, PipelineStage } from "../types";
import { dayLabel, isoDay } from "./format";

const doneIds = (stages: PipelineStage[]) => new Set(stages.filter((s) => s.done).map((s) => s.id));

/* ---- KPIs ---------------------------------------------------------------- */

export function kpiActive(label: string, stages: PipelineStage[]): KpiDef {
  const done = doneIds(stages);
  return {
    id: "active",
    label,
    icon: Activity,
    format: "number",
    compute: (ctx) => ctx.records.filter((r) => !done.has(r.status)).length,
  };
}

export function kpiCompleted(label: string, stages: PipelineStage[]): KpiDef {
  const done = doneIds(stages);
  return {
    id: "completed",
    label,
    icon: CalendarCheck,
    format: "number",
    compute: (ctx) => ctx.records.filter((r) => done.has(r.status)).length,
  };
}

export function kpiRevenue(label = "Revenue (paid)"): KpiDef {
  return {
    id: "revenue",
    label,
    icon: BadgeDollarSign,
    format: "money",
    compute: (ctx) => ctx.invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0),
  };
}

export function kpiNewBookings(label = "New requests"): KpiDef {
  return {
    id: "bookings",
    label,
    icon: Inbox,
    format: "number",
    compute: (ctx) => ctx.bookings.filter((b) => b.status === "new").length,
  };
}

export function kpiCustomers(label = "Customers"): KpiDef {
  return {
    id: "customers",
    label,
    icon: Users,
    format: "number",
    compute: (ctx) => ctx.customers.length,
  };
}

export function kpiPipelineValue(label = "Pipeline value"): KpiDef {
  return {
    id: "pipeline-value",
    label,
    icon: TrendingUp,
    format: "money",
    compute: (ctx) => ctx.records.reduce((s, r) => s + (r.value ?? 0), 0),
  };
}

/* ---- charts ---------------------------------------------------------------- */

export function chartVolume(title: string, seriesLabel: string): ChartDef {
  return {
    id: "volume",
    title,
    kind: "area",
    labelKey: "day",
    series: [seriesLabel],
    compute: (ctx) =>
      ctx.days.map((d) => ({
        day: dayLabel(d),
        [seriesLabel]: ctx.records.filter((r) => isoDay(r.createdAt) === d).length,
      })),
  };
}

export function chartRevenueTrend(title = "Revenue collected"): ChartDef {
  return {
    id: "revenue-trend",
    title,
    kind: "bar",
    labelKey: "day",
    series: ["revenue"],
    compute: (ctx) =>
      ctx.days.map((d) => ({
        day: dayLabel(d),
        revenue: ctx.invoices
          .filter((i) => i.status === "paid" && isoDay(i.issuedAt) === d)
          .reduce((s, i) => s + i.amount, 0),
      })),
  };
}

export function chartPipelineSpread(title: string, stages: PipelineStage[]): ChartDef {
  return {
    id: "pipeline-spread",
    title,
    kind: "donut",
    labelKey: "stage",
    series: ["count"],
    compute: (ctx) =>
      stages.map((s) => ({
        stage: s.label,
        count: ctx.records.filter((r) => r.status === s.id).length,
      })),
  };
}

export function chartBookingsTrend(title = "Requests received"): ChartDef {
  return {
    id: "bookings-trend",
    title,
    kind: "line",
    labelKey: "day",
    series: ["requests"],
    compute: (ctx) =>
      ctx.days.map((d) => ({
        day: dayLabel(d),
        requests: ctx.bookings.filter((b) => isoDay(b.requestedAt) === d).length,
      })),
  };
}

/* ---- common stage palettes -------------------------------------------------- */

export const STD_PLANS = (base: number, currency = "USD") => [
  {
    tier: "Starter" as const,
    monthly: base,
    currency,
    blurb: "Solo operators getting organized",
    highlights: ["1 user", "Branded workspace + website", "Bookings inbox", "Email support"],
  },
  {
    tier: "Pro" as const,
    monthly: Math.round(base * 2.2),
    currency,
    blurb: "Growing teams that live in the pipeline",
    highlights: ["5 users", "Everything in Starter", "AI chatbot + voice agent", "Loyalty & campaigns", "Priority WhatsApp support"],
  },
  {
    tier: "Scale" as const,
    monthly: Math.round(base * 4),
    currency,
    blurb: "Multi-branch operations",
    highlights: ["Unlimited users", "Everything in Pro", "Custom domain", "Data migration done for you", "Quarterly strategy call"],
  },
];
