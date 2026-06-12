/* System detail — the sales page for one system. */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Globe,
  LayoutDashboard,
  PlayCircle,
  Puzzle,
  Timer,
} from "lucide-react";
import { SYSTEMS, trySystem } from "@/suite/systems";
import { money } from "@/suite/lib/format";
import { Badge, Button, Card, SectionTitle, StatusDot } from "@/suite/components/ui";

export function generateStaticParams() {
  return SYSTEMS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sys = trySystem(slug);
  return { title: sys ? sys.name : "System" };
}

export default async function SystemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sys = trySystem(slug);
  if (!sys) notFound();
  const Icon = sys.icon;
  const addOns = sys.addOns.map((a) => trySystem(a)).filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line" style={{ background: `linear-gradient(160deg, ${sys.accent}10, transparent 60%)` }}>
        <div className="container-x grid items-center gap-10 py-16 md:grid-cols-[1.2fr_1fr] md:py-20">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-14 items-center justify-center rounded-2xl" style={{ background: `${sys.accent}18` }}>
                <Icon className="size-7" style={{ color: sys.accent }} />
              </span>
              {sys.badge && <Badge tone={sys.badge === "Flagship" ? "warn" : sys.badge === "New" ? "info" : "progress"}>{sys.badge}</Badge>}
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">{sys.name}</h1>
            <p className="mt-2 font-display text-lg" style={{ color: sys.accent }}>{sys.tagline}</p>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{sys.description}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={`/start?system=${sys.slug}`}>
                <Button variant="dark" size="lg">
                  Start 3-day free trial <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href={`/app/demo-${sys.slug}`}>
                <Button variant="outline" size="lg">
                  <PlayCircle className="size-4" /> Open live demo
                </Button>
              </Link>
              <Link href={`/site/demo-${sys.slug}`}>
                <Button variant="ghost" size="lg">
                  <Globe className="size-4" /> Example website
                </Button>
              </Link>
            </div>
            <p className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              <Timer className="size-3" /> Full product, demo data included, no card required
            </p>
          </div>

          {/* Pipeline preview */}
          <Card className="p-6">
            <p className="eyebrow mb-4">The {sys.shortName.toLowerCase()} pipeline, pre-built</p>
            <div className="space-y-2.5">
              {sys.pipeline.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-2.5">
                  <span className="font-mono text-[10px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <StatusDot tone={s.tone} />
                  <span className="text-[13px] font-medium">{s.label}</span>
                  {s.done && <span className="ml-auto text-[10px] uppercase tracking-wide text-muted">closes</span>}
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-muted">
              Drag {sys.recordNoun.plural.toLowerCase()} across stages on a kanban board — totals, KPIs and the funnel update live.
            </p>
          </Card>
        </div>
      </section>

      {/* Everything included */}
      <section className="container-x py-16">
        <SectionTitle eyebrow="Everything included" title={`A complete ${sys.shortName.toLowerCase()} operation, day one`} />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sys.features.map((f) => (
            <div key={f} className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-5 shadow-card">
              <BadgeCheck className="mt-0.5 size-5 shrink-0" style={{ color: sys.accent }} />
              <p className="text-sm leading-relaxed">{f}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <p className="eyebrow mb-3 flex items-center gap-2"><LayoutDashboard className="size-3.5" /> Modules in this system</p>
            <div className="flex flex-wrap gap-2">
              {sys.modules.map((m) => (
                <span key={m} className="rounded-full border border-line bg-surface-2 px-3.5 py-1.5 text-[12px] font-medium capitalize">
                  {m === "records" ? sys.recordNoun.plural : m === "chatbot" ? "AI chatbot" : m === "voice" ? "AI voice agent" : m}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-muted">
              Plus: white-label branding, installable desktop app, branded public website, CSV/JSON export, and the live self-check portal.
            </p>
          </Card>
          <Card className="p-6">
            <p className="eyebrow mb-3 flex items-center gap-2"><Puzzle className="size-3.5" /> Stacks with</p>
            <div className="space-y-2.5">
              {addOns.map((a) => {
                const AIcon = a!.icon;
                return (
                  <Link key={a!.slug} href={`/systems/${a!.slug}`} className="flex items-center gap-3 rounded-xl border border-line px-4 py-2.5 transition-colors hover:border-ink">
                    <AIcon className="size-4" style={{ color: a!.accent }} />
                    <span className="text-[13px] font-medium">{a!.name}</span>
                    <ArrowRight className="ml-auto size-3.5 text-muted" />
                  </Link>
                );
              })}
              <p className="text-[11px] text-muted">Add-ons share your data and branding — one login, one bill.</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Plans */}
      <section className="border-t border-line bg-surface-2 py-16">
        <div className="container-x">
          <SectionTitle align="center" eyebrow="Pricing" title="Simple pricing — after your free 3 days" />
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            {sys.plans.map((p, i) => (
              <Card key={p.tier} className={i === 1 ? "border-ink p-6 shadow-pop" : "p-6"}>
                <p className="font-display text-base font-semibold">{p.tier}</p>
                <p className="mt-1 text-[12px] text-muted">{p.blurb}</p>
                <p className="mt-3 font-display text-3xl font-bold">
                  {money(p.monthly, p.currency)}<span className="text-sm font-normal text-muted">/mo</span>
                </p>
                <ul className="mt-4 space-y-1.5">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-[12px] text-ink-3">
                      <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-ok" /> {h}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href={`/start?system=${sys.slug}`}>
              <Button variant="dark" size="lg">
                Try {sys.shortName} free for 3 days <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
