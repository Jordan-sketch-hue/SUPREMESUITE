/* Systems catalog — every sellable system, grouped by category. */

import Link from "next/link";
import { ArrowRight, PlayCircle, Wrench } from "lucide-react";
import { systemsByCategory } from "@/suite/systems";
import { CATEGORY_LABELS } from "@/suite/types";
import { money } from "@/suite/lib/format";
import { Badge, Button, SectionTitle } from "@/suite/components/ui";

export const metadata = { title: "Systems" };

export default function SystemsPage() {
  return (
    <div className="container-x py-14 md:py-20">
      <SectionTitle
        eyebrow="The catalog"
        title="Pick your industry. We built the rest."
        sub="Each system is a complete back office + branded website + AI staff, pre-configured for how your trade actually works. Try any of them free for 3 days — or open the live demo with one click."
      />

      <div className="mt-12 space-y-12">
        {systemsByCategory().map(({ category, systems }) => (
          <section key={category}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-display text-lg font-semibold">{CATEGORY_LABELS[category]}</h2>
              <span className="hairline flex-1" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{systems.length} systems</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {systems.map((s) => {
                const Icon = s.icon;
                const starter = s.plans[0];
                return (
                  <div key={s.slug} className="group relative flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-pop">
                    <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl opacity-80" style={{ background: s.accent }} />
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex size-12 items-center justify-center rounded-2xl" style={{ background: `${s.accent}14` }}>
                        <Icon className="size-6" style={{ color: s.accent }} />
                      </span>
                      {s.badge && <Badge tone={s.badge === "Flagship" ? "warn" : s.badge === "New" ? "info" : "progress"}>{s.badge}</Badge>}
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold leading-snug">{s.name}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">{s.tagline}</p>
                    <ul className="mt-4 space-y-1.5">
                      {s.features.slice(0, 3).map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[12px] text-ink-3">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-ink" /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 flex items-center justify-between border-t border-line-2 pt-4">
                      <p className="text-[12px] text-muted">
                        from <span className="font-display text-base font-bold text-ink">{money(starter?.monthly ?? 0)}</span>/mo
                      </p>
                      <div className="flex items-center gap-2">
                        <Link href={`/app/demo-${s.slug}`} title="Open live demo">
                          <Button variant="ghost" size="sm">
                            <PlayCircle className="size-4" /> Demo
                          </Button>
                        </Link>
                        <Link href={`/systems/${s.slug}`}>
                          <Button variant="dark" size="sm">
                            Details <ArrowRight className="size-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Custom */}
      <div className="mt-14 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-ink/30 bg-surface-2 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-ink text-white">
          <Wrench className="size-6" />
        </span>
        <h3 className="font-display text-xl font-semibold">Don't see your industry? We'll build it custom.</h3>
        <p className="max-w-lg text-sm text-muted">
          The same engine that powers these {/* count rendered above */}systems can be tailored to any business — custom pipelines, custom fields,
          custom website. J Supreme Tech builds it; you own it.
        </p>
        <Link href="/contact">
          <Button variant="dark">Request a custom CRM</Button>
        </Link>
      </div>
    </div>
  );
}
