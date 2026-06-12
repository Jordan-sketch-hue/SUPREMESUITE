"use client";

/* Recharts wrappers themed via brand CSS variables.
   SVG inherits CSS custom properties, so charts re-skin with the brand. */

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDef, MetricContext } from "../types";
import { Card, CardHeader } from "./ui";
import { compact } from "../lib/format";

const AXIS = { fontSize: 11, fill: "#71717a" } as const;
const GRID = "#f0f0f1";
const DONUT_FALLBACK = ["var(--brand, #0a0a0b)", "#94a3b8", "#cbd5e1", "#e2e8f0", "#f1f5f9", "#fca5a5"];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <p className="mb-1 font-semibold">{label ?? payload[0]?.payload?.stage ?? ""}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted">
          {p.name}: <span className="font-semibold text-ink">{compact(Number(p.value))}</span>
        </p>
      ))}
    </div>
  );
}

export function ChartCard({ def, ctx, className }: { def: ChartDef; ctx: MetricContext; className?: string }) {
  const data = def.compute(ctx);
  const series = def.series ?? [];
  const labelKey = def.labelKey ?? "day";

  return (
    <Card className={className}>
      <CardHeader title={def.title} />
      <div className="h-56 px-2 pb-3">
        <ResponsiveContainer width="100%" height="100%">
          {def.kind === "area" ? (
            <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${def.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand, #0a0a0b)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--brand, #0a0a0b)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey={labelKey} tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} width={42} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              {series.map((s) => (
                <Area
                  key={s}
                  type="monotone"
                  dataKey={s}
                  stroke="var(--brand, #0a0a0b)"
                  strokeWidth={2}
                  fill={`url(#grad-${def.id})`}
                />
              ))}
            </AreaChart>
          ) : def.kind === "bar" ? (
            <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey={labelKey} tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} width={42} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(10,10,11,0.04)" }} />
              {series.map((s) => (
                <Bar key={s} dataKey={s} fill="var(--brand, #0a0a0b)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              ))}
            </BarChart>
          ) : def.kind === "line" ? (
            <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey={labelKey} tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={AXIS} tickLine={false} axisLine={false} width={42} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              {series.map((s) => (
                <Line key={s} type="monotone" dataKey={s} stroke="var(--brand, #0a0a0b)" strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip content={<ChartTooltip />} />
              <Pie
                data={data}
                dataKey={series[0] ?? "count"}
                nameKey={labelKey === "day" ? "stage" : labelKey}
                innerRadius="58%"
                outerRadius="86%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={DONUT_FALLBACK[i % DONUT_FALLBACK.length]} opacity={i === 0 ? 1 : 0.85} />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
      {def.kind === "donut" ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-5 pb-4">
          {data.map((d: any, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-[11px] text-muted">
              <span className="size-2 rounded-full" style={{ background: DONUT_FALLBACK[i % DONUT_FALLBACK.length] }} />
              {d[def.labelKey ?? "stage"]} · {d[series[0] ?? "count"]}
            </span>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
