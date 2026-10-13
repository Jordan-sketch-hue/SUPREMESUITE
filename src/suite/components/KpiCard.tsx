type Props = {
  label: string;
  value: string;
  unit?: string | null;
  color?: string;
};

export function KpiCard({ label, value, unit, color }: Props) {
  return (
    <div
      className="rounded-xl border border-slate-700 bg-slate-800 p-5"
      style={{ borderTopColor: color, borderTopWidth: color ? 3 : undefined }}
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-3xl font-bold text-slate-100">
        {unit === "$" && <span className="mr-0.5 text-xl text-slate-400">$</span>}
        {value}
        {unit && unit !== "$" && (
          <span className="ml-1 text-base font-normal text-slate-400">{unit}</span>
        )}
      </p>
    </div>
  );
}
