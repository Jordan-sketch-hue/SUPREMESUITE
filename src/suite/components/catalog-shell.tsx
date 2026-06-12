"use client";

/* CATALOG SHELL — J Supreme Tech house brand (pure mono B&W) for the
   public marketplace: nav, mobile menu, footer. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button, cx } from "./ui";

const NAV = [
  { href: "/systems", label: "Systems" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
  { href: "/status", label: "Status" },
  { href: "/docs", label: "Docs" },
  { href: "/contact", label: "Custom builds" },
];

export function JsLogo({ className }: { className?: string }) {
  return (
    <span className={cx("flex size-9 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold text-white", className)}>
      JS
    </span>
  );
}

export function CatalogShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-dvh bg-surface">
      <header className="glass sticky top-0 z-50 border-b border-line">
        <div className="container-wide flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <JsLogo />
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-bold tracking-tight">Supreme Suite</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.18em] text-muted">by J Supreme Tech</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cx(
                  "text-[13px] font-medium transition-colors",
                  pathname?.startsWith(n.href) ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/start" className="hidden sm:block">
              <Button variant="dark" size="sm">
                Start free trial <ArrowRight className="size-3.5" />
              </Button>
            </Link>
            <button className="rounded-lg p-2 text-ink hover:bg-surface-3 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-72 flex-col bg-surface p-6 shadow-pop">
            <div className="mb-6 flex items-center justify-between">
              <JsLogo />
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted hover:bg-surface-3" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink-3 hover:bg-surface-3">
                  {n.label}
                </Link>
              ))}
            </nav>
            <Link href="/start" className="mt-auto">
              <Button variant="dark" className="w-full">
                Start free trial
              </Button>
            </Link>
          </div>
        </div>
      )}

      <main>{children}</main>

      <footer className="border-t border-line bg-surface-2">
        <div className="container-wide grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <JsLogo />
              <span className="font-display text-[15px] font-bold">Supreme Suite</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-muted">
              Ready-made CRMs, branded websites and AI staff for real businesses. Pick your industry, upload your logo,
              launch today — 3-day free trial on everything.
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
              A J Supreme Tech product · Kingston, JA
            </p>
          </div>
          <div>
            <p className="eyebrow mb-3">Platform</p>
            <ul className="space-y-2 text-[13px] text-muted">
              <li><Link href="/systems" className="hover:text-ink">All systems</Link></li>
              <li><Link href="/pricing" className="hover:text-ink">Pricing</Link></li>
              <li><Link href="/start" className="hover:text-ink">Start a trial</Link></li>
              <li><Link href="/contact" className="hover:text-ink">Custom CRM builds</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">Trust</p>
            <ul className="space-y-2 text-[13px] text-muted">
              <li><Link href="/status" className="hover:text-ink">Live system check</Link></li>
              <li><Link href="/docs" className="hover:text-ink">Documentation</Link></li>
              <li><Link href="/faq" className="hover:text-ink">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-3">Talk to us</p>
            <ul className="space-y-2 text-[13px] text-muted">
              <li>
                <a href="https://wa.me/16582182282" target="_blank" rel="noreferrer" className="hover:text-ink">
                  WhatsApp (658) 218-2282
                </a>
              </li>
              <li>
                <a href="mailto:global.jsuprememarketing@gmail.com" className="hover:text-ink">
                  global.jsuprememarketing@gmail.com
                </a>
              </li>
              <li>
                <a href="https://jsupremetech.online" target="_blank" rel="noreferrer" className="hover:text-ink">
                  jsupremetech.online
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line py-5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          © {new Date().getFullYear()} J Supreme Tech — every page on this platform is self-checked on{" "}
          <Link href="/status" className="text-ink underline-offset-2 hover:underline">/status</Link>
        </div>
      </footer>
    </div>
  );
}
