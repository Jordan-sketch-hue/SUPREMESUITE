/* ============================================================================
   UI KIT — Supreme Suite primitives.
   Brand-aware: anything using `brand` classes re-skins via CSS variables.
   Server-safe by default; interactive pieces are marked "use client" in their
   own files. Keep these primitives dependency-light and composable.
============================================================================ */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { StatusTone } from "../types";
import { initials } from "../lib/format";

export function cx(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/* ---- Button ---------------------------------------------------------------- */

type ButtonVariant = "brand" | "dark" | "outline" | "ghost" | "danger" | "soft";
type ButtonSize = "sm" | "md" | "lg";

const BTN_VARIANTS: Record<ButtonVariant, string> = {
  brand:
    "bg-brand text-brand-fg hover:bg-brand-strong shadow-sm",
  dark: "bg-ink text-white hover:bg-ink-2 shadow-sm",
  outline: "border border-line bg-surface text-ink hover:border-ink/40 hover:bg-surface-2",
  ghost: "text-ink hover:bg-surface-3",
  danger: "bg-danger text-white hover:opacity-90",
  soft: "bg-brand-soft text-brand-strong hover:bg-brand-ring",
};
const BTN_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-[15px] gap-2",
};

export function Button({
  variant = "brand",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center font-medium transition-all duration-150 select-none",
        "rounded-[var(--radius-brand,0.75rem)] disabled:opacity-50 disabled:pointer-events-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:scale-[0.98]",
        BTN_VARIANTS[variant],
        BTN_SIZES[size],
        className,
      )}
      {...props}
    />
  );
}

/* ---- Badge / status -------------------------------------------------------- */

export const TONE_STYLES: Record<StatusTone, string> = {
  neutral: "bg-surface-3 text-ink-3",
  info: "bg-info-soft text-info",
  progress: "bg-brand-soft text-brand-strong",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: StatusTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap",
        TONE_STYLES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone = "neutral", className }: { tone?: StatusTone; className?: string }) {
  const colors: Record<StatusTone, string> = {
    neutral: "bg-muted-2",
    info: "bg-info",
    progress: "bg-brand",
    ok: "bg-ok",
    warn: "bg-warn",
    danger: "bg-danger",
  };
  return <span className={cx("inline-block size-2 rounded-full", colors[tone], className)} />;
}

/* ---- Card ------------------------------------------------------------------- */

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cx("rounded-2xl border border-line bg-surface shadow-card", className)}>{children}</div>
  );
}

export function CardHeader({
  title,
  sub,
  action,
  className,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start justify-between gap-3 px-5 pt-4 pb-2", className)}>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {sub ? <p className="mt-0.5 text-xs text-muted">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ---- Stat (server-safe, used in admin/portal layouts) ----------------------- */

export function Stat({
  label,
  value,
  sub,
  icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cx("px-5 py-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted">{label}</p>
        {icon ? <span className="text-brand [&>svg]:size-4">{icon}</span> : null}
      </div>
      <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </Card>
  );
}

/* ---- Form fields -------------------------------------------------------------- */

const FIELD_BASE =
  "w-full rounded-[var(--radius-brand,0.75rem)] border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-2 transition-colors focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-ring disabled:opacity-50";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input className={cx(FIELD_BASE, className)} {...rest} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className, ...rest } = props;
  return <textarea className={cx(FIELD_BASE, "min-h-24 resize-y", className)} {...rest} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select className={cx(FIELD_BASE, "appearance-none bg-no-repeat pr-9", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.75rem center",
      }}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  help,
  required,
  children,
  className,
}: {
  label: string;
  help?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 flex items-baseline gap-1 text-xs font-semibold text-ink-3">
        {label}
        {required ? <span className="text-danger">*</span> : null}
      </span>
      {children}
      {help ? <span className="mt-1 block text-[11px] text-muted">{help}</span> : null}
    </label>
  );
}

/* ---- Table -------------------------------------------------------------------- */

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cx("table-scroll rounded-2xl border border-line bg-surface shadow-card", className)}>
      <table className="w-full min-w-[640px] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cx("border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className, colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cx("border-b border-line-2 px-4 py-3 align-middle", className)}>
      {children}
    </td>
  );
}

/* ---- Misc ----------------------------------------------------------------------- */

export function Avatar({ name, className, src }: { name: string; className?: string; src?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cx("size-8 rounded-full object-cover", className)} />;
  }
  return (
    <span
      className={cx(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand-strong",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("grid-dots flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-14 text-center", className)}>
      {icon ? <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand [&>svg]:size-6">{icon}</div> : null}
      <h3 className="font-display text-base font-semibold">{title}</h3>
      {body ? <p className="mt-1 max-w-sm text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cx("eyebrow", className)}>{children}</p>;
}

export function SectionTitle({
  eyebrow,
  title,
  sub,
  className,
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cx(align === "center" && "mx-auto max-w-2xl text-center", className)}>
      {eyebrow ? <Eyebrow className="mb-2">{eyebrow}</Eyebrow> : null}
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {sub ? <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{sub}</p> : null}
    </div>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <div className={cx("hairline", className)} />;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted">
      {children}
    </kbd>
  );
}
