/* Supreme Suite — catalog home. House brand: pure J Supreme mono. */

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Gauge,
  MonitorDown,
  Palette,
  Rocket,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";
import { SYSTEMS, systemsByCategory } from "@/suite/systems";
import { CATEGORY_LABELS } from "@/suite/types";
import { WORKFLOWS } from "@/suite/lib/routes";
import { Badge, Button, Card, SectionTitle } from "@/suite/components/ui";

export default function HomePage() {
  const featured = SYSTEMS.filter((s) => s.badge).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="grid-dots relative overflow-hidden border-b border-line">
        <div className="container-x py-20 text-center md:py-28">
          <p className="eyebrow mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5">
            <Sparkles className="size-3.5" /> {SYSTEMS.length} ready-made systems · 3-day free trial on everything
          </p>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-[1.04] tracking-tight sm:text-6xl">
            Your business, running like a <span className="underline decoration-4 underline-offset-8">machine</span> — by tonight.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Ready-made CRMs, booking systems, branded websites and AI staff for couriers, movers, salons, schools,
            restaurants and more. Upload your logo, pick your colors —{" "}
            <strong className="text-ink">it feels like yours because it is.</strong>
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/start">
              <Button variant="dark" size="lg">
                Start your free trial <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/systems">
              <Button variant="outline" size="lg">
                Browse all {SYSTEMS.length} systems
              </Button>
            </Link>
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            No card needed · works on desktop & phone · installable app
          </p>

          {/* Featured marquee row */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
            {featured.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.slug}
                  href={`/systems/${s.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-ink"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${s.accent}14` }}>
                    <Icon className="size-4.5" style={{ color: s.accent }} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold">{s.shortName}</span>
                    <span className="block truncate text-[10px] text-muted">{s.badge}</span>
                  </span>
                  <ArrowRight className="ml-auto size-3.5 shrink-0 text-muted-2 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-x py-16 md:py-24">
        <SectionTitle align="center" eyebrow="How it works" title="From zero to branded system in 4 steps" sub="Not weeks of meetings. Minutes of clicking." />
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { icon: Gauge, t: "Pick your industry", b: "Courier, movers, salon, school, restaurant… each system comes pre-built with the exact pipeline that trade runs on." },
            { icon: Palette, t: "Make it yours", b: "Upload your logo, choose your colors, corners and type. The whole app and website re-skin instantly." },
            { icon: Rocket, t: "Launch & share", b: "Your branded website goes live with a booking form wired into your CRM and an AI assistant answering 24/7." },
            { icon: MonitorDown, t: "Install & run", b: "Install it like a desktop app, run your day from the pipeline, and watch the dashboard do the math." },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <Card key={i} className="relative p-6">
                <span className="absolute right-5 top-5 font-display text-3xl font-bold text-line">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-ink text-white">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{s.b}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Catalog teaser by category */}
      <section className="border-y border-line bg-surface-2 py-16 md:py-24">
        <div className="container-x">
          <SectionTitle eyebrow="The catalog" title={`${SYSTEMS.length} systems. One supreme engine.`} sub="Every system shares the same battle-tested core — records, bookings, customers, money, AI — dressed for your industry." />
          <div className="mt-10 space-y-8">
            {systemsByCategory().map(({ category, systems }) => (
              <div key={category}>
                <p className="eyebrow mb-3">{CATEGORY_LABELS[category]}</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {systems.map((s) => {
                    const Icon = s.icon;
                    return (
                      <Link key={s.slug} href={`/systems/${s.slug}`} className="group flex items-start gap-3.5 rounded-2xl border border-line bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-ink hover:shadow-pop">
                        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${s.accent}14` }}>
                          <Icon className="size-5" style={{ color: s.accent }} />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold">{s.name}</span>
                            {s.badge && <Badge tone={s.badge === "Flagship" ? "warn" : s.badge === "New" ? "info" : "progress"}>{s.badge}</Badge>}
                          </span>
                          <span className="mt-1 block text-[12px] leading-relaxed text-muted">{s.tagline}</span>
                          <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-ink group-hover:underline">
                            Explore + live demo <ArrowRight className="size-3" />
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust: self-checked platform */}
      <section className="container-x py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle
              eyebrow="Engineering you can audit"
              title="Every page. Every link. Every action. Checked."
              sub="Most software promises it works. Ours proves it — publicly. The platform ships with a live self-check portal that runs every business workflow end-to-end and shows you the receipts."
            />
            <ul className="mt-6 space-y-3">
              {WORKFLOWS.slice(0, 5).map((w) => (
                <li key={w.id} className="flex items-start gap-3 text-sm">
                  <BadgeCheck className="mt-0.5 size-4.5 shrink-0 text-ok" />
                  <span>
                    <strong>{w.title}</strong>
                    <span className="text-muted"> — {w.steps.length} steps, verified live</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/status" className="mt-6 inline-block">
              <Button variant="dark">
                <ShieldCheck className="size-4" /> Run the system check yourself
              </Button>
            </Link>
          </div>
          <Card className="p-6">
            <p className="eyebrow mb-4">What "full stack" means here</p>
            <div className="space-y-3.5">
              {[
                { icon: Timer, t: "3-day free trial", b: "Full product, real data, no card. Continue only if it earns it." },
                { icon: Palette, t: "White-label branding", b: "Logo, colors, type, corners — yours everywhere, including the installed app icon." },
                { icon: Bot, t: "AI chatbot + voice agent", b: "Answer, quote and book customers around the clock — try them live in the demo." },
                { icon: MonitorDown, t: "Installable desktop app", b: "PWA install on Windows/Mac/phone. Own window, own icon, offline shell." },
                { icon: Rocket, t: "Branded public website", b: "Premium template with a booking form wired straight into your pipeline." },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.t} className="flex items-start gap-3 rounded-2xl bg-surface-2 p-3.5">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold">{f.t}</p>
                      <p className="text-[12px] text-muted">{f.b}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-ink py-16 text-white md:py-20">
        <div className="container-x text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Three days from now, you'll either have a system — or another excuse.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/70">
            Pick your industry. Brand it. Run it. If it doesn't pay for itself, walk away with your data.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/start">
              <Button size="lg" className="bg-white text-ink hover:bg-white/90">
                Start free — pick my system <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/25 bg-transparent text-white hover:border-white/60 hover:bg-white/10">
                I need something custom
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
