"use client";

/* APP SHELL — the white-labeled workspace chrome.
   The sidebar renders ONLY the modules the active system pack declares, so a
   Courier CRM and a School CRM feel purpose-built while sharing one engine. */

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AudioLines,
  Bot,
  Boxes,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gift,
  Globe,
  Inbox,
  KanbanSquare,
  LayoutDashboard,
  LineChart,
  Menu,
  MessagesSquare,
  Plug,
  Settings,
  Users,
  X,
  ExternalLink,
} from "lucide-react";
import type { SystemDef, SystemModule, Tenant } from "../types";
import { cx } from "./ui";
import { TenantLogo } from "./brand-provider";
import { TrialBanner, Paywall } from "./trial-gate";
import { InstallButton } from "./install-pwa";

const MODULE_NAV: Partial<
  Record<SystemModule, { label: (sys: SystemDef) => string; icon: React.ComponentType<{ className?: string }>; path: string }>
> = {
  dashboard: { label: () => "Dashboard", icon: LayoutDashboard, path: "" },
  records: { label: (s) => s.recordNoun.plural, icon: KanbanSquare, path: "/records" },
  calendar: { label: () => "Calendar", icon: CalendarDays, path: "/calendar" },
  bookings: { label: () => "Bookings", icon: Inbox, path: "/bookings" },
  customers: { label: () => "Customers", icon: Users, path: "/customers" },
  messages: { label: () => "Messages", icon: MessagesSquare, path: "/messages" },
  inventory: { label: () => "Inventory", icon: Boxes, path: "/inventory" },
  invoices: { label: () => "Invoices", icon: FileText, path: "/invoices" },
  loyalty: { label: () => "Loyalty", icon: Gift, path: "/loyalty" },
  reports: { label: () => "Reports", icon: LineChart, path: "/reports" },
  chatbot: { label: () => "AI Chatbot", icon: Bot, path: "/chatbot" },
  voice: { label: () => "Voice Agent", icon: AudioLines, path: "/voice" },
  website: { label: () => "Website", icon: Globe, path: "/website" },
  integrations: { label: () => "Integrations", icon: Plug, path: "/integrations" },
  settings: { label: () => "Settings", icon: Settings, path: "/settings" },
};

const ORDER: SystemModule[] = [
  "dashboard", "records", "calendar", "bookings", "customers", "messages",
  "inventory", "invoices", "loyalty", "reports", "chatbot", "voice", "website", "integrations", "settings",
];

/* Safe label target while the tenant/system is still resolving (SSR pass). */
const FALLBACK_SYS = { recordNoun: { singular: "Record", plural: "Records" } } as SystemDef;

export function AppShell({
  tenant,
  system,
  children,
}: {
  tenant: Tenant | null;
  system: SystemDef | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("ss-sidebar") === "collapsed");
  }, []);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const routeParams = useParams<{ tenant: string }>();
  const urlSlug = typeof routeParams?.tenant === "string" ? routeParams.tenant : "";
  const base = urlSlug ? `/app/${urlSlug}` : (tenant ? `/app/${tenant.slug}` : "/app/_");
  const modules = (system?.modules ?? ORDER).filter((m) => MODULE_NAV[m]);
  const items = ORDER.filter((m) => modules.includes(m)).map((m) => ({ m, ...MODULE_NAV[m]! }));

  const nav = (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
      {items.map(({ m, label, icon: Icon, path }) => {
        const href = `${base}${path}`;
        const active = path === "" ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={m}
            href={href}
            title={collapsed ? label(system ?? FALLBACK_SYS) : undefined}
            className={cx(
              "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
              active
                ? "bg-brand text-brand-fg shadow-sm"
                : "text-ink-3 hover:bg-surface-3 hover:text-ink",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon className={cx("size-[18px] shrink-0", !active && "text-muted group-hover:text-ink")} />
            {!collapsed && <span className="truncate">{label(system ?? FALLBACK_SYS)}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarInner = (
    <>
      <div className={cx("flex items-center gap-3 border-b border-line px-4 py-4", collapsed && "justify-center px-2")}>
        <TenantLogo tenant={tenant} size={collapsed ? 32 : 38} />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold leading-tight">
              {tenant?.businessName ?? "Workspace"}
            </p>
            <p className="truncate text-[11px] text-muted">{system?.shortName ?? "Supreme Suite"} workspace</p>
          </div>
        )}
      </div>
      {nav}
      <div className={cx("space-y-2 border-t border-line p-3", collapsed && "px-2")}>
        {tenant && !collapsed && (
          <Link
            href={`/site/${tenant.slug}`}
            target="_blank"
            className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs font-medium text-ink-3 transition-colors hover:border-brand hover:text-brand-strong"
          >
            <ExternalLink className="size-3.5" />
            View public website
          </Link>
        )}
        {!collapsed && <InstallButton appName={tenant?.businessName ?? "this workspace"} />}
        <button
          onClick={() => {
            const next = !collapsed;
            setCollapsed(next);
            localStorage.setItem("ss-sidebar", next ? "collapsed" : "open");
          }}
          className="hidden w-full items-center justify-center gap-2 rounded-xl py-2 text-xs text-muted transition-colors hover:bg-surface-3 hover:text-ink lg:flex"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-surface-2">
      <span className="sr-only">Supreme Suite Workspace</span>

      {/* Desktop sidebar */}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-surface lg:flex",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        {sidebarInner}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface shadow-pop">
            <button
              className="absolute right-3 top-3 rounded-lg p-1.5 text-muted hover:bg-surface-3"
              onClick={() => setMobileOpen(false)}
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            {sidebarInner}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className={cx("flex min-h-dvh flex-col", collapsed ? "lg:pl-[68px]" : "lg:pl-64")}>
        {/* Topbar */}
        <header className="glass sticky top-0 z-30 border-b border-line">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
            <button
              className="rounded-lg p-2 text-ink-3 hover:bg-surface-3 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex-1">{tenant ? <TrialBanner tenant={tenant} /> : null}</div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>

        <footer className="border-t border-line px-4 py-4 text-center text-[11px] text-muted lg:px-8">
          Powered by <span className="font-semibold text-ink">Supreme Suite</span> · a J Supreme Tech product ·{" "}
          <Link href="/status" className="underline-offset-2 hover:underline">
            system status
          </Link>
        </footer>
      </div>

      {tenant ? <Paywall tenant={tenant} /> : null}
    </div>
  );
}

/** Standard page header inside the app. */
export function PageHead({
  title,
  sub,
  actions,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
