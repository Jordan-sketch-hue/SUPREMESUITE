/* Formatting helpers — money, dates, relative time, compact numbers. */

export function money(n: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(0)}`;
  }
}

export function compact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function pct(n: number): string {
  return `${Math.round(n)}%`;
}

export function dateShort(ts: number | string): string {
  const d = typeof ts === "string" ? new Date(ts) : new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function dateLong(ts: number | string): string {
  const d = typeof ts === "string" ? new Date(ts) : new Date(ts);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

export function timeShort(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return dateShort(ts);
}

export function isoDay(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/** Trailing N day ISO strings, oldest → newest, ending today. */
export function trailingDays(n: number, now = Date.now()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(isoDay(now - i * 86400000));
  return out;
}

export function dayLabel(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
