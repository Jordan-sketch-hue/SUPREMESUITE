/* /docs — self-documenting reference rendered from the live registry.
   If a page or action exists, it's because it's declared here — and vice versa. */

import Link from "next/link";
import { BookOpenText, ExternalLink } from "lucide-react";
import { ROUTES, ACTIONS, WORKFLOWS } from "@/suite/lib/routes";
import { SYSTEMS } from "@/suite/systems";
import { Badge, Card, SectionTitle, Table, Td, Th } from "@/suite/components/ui";

export const metadata = { title: "Documentation" };

export default function DocsPage() {
  const routeGroups = Array.from(new Set(ROUTES.map((r) => r.group)));
  const actionGroups = Array.from(new Set(ACTIONS.map((a) => a.group)));

  return (
    <div className="container-x max-w-5xl py-14 md:py-18">
      <SectionTitle
        eyebrow="Documentation"
        title="The platform, fully accounted for"
        sub="Generated from the same registry that powers the live self-check — pages, actions and workflows can't drift from these docs because they ARE these docs."
      />

      {/* Architecture summary */}
      <Card className="mt-8 p-6">
        <p className="eyebrow mb-3 flex items-center gap-2"><BookOpenText className="size-3.5" /> Architecture in one paragraph</p>
        <p className="text-sm leading-relaxed text-ink-3">
          Supreme Suite is <strong>one engine + {SYSTEMS.length} system packs</strong>. A pack is pure configuration (pipeline stages, fields,
          KPIs, website copy, seed data) — the engine renders whatever the active pack declares: dashboard, kanban records, calendar,
          bookings inbox, customers, messages, inventory, invoices, loyalty, reports, AI chatbot, voice agent, website manager and
          settings. Branding is runtime CSS variables (<code className="rounded bg-surface-3 px-1 py-0.5 font-mono text-xs">--brand*</code>) applied by
          BrandProvider, so a tenant's logo/colors re-skin the app, website, chat widget, favicon and installed PWA icon instantly.
          Trials run 100% client-side (localStorage repo with a table-shaped API); production swaps that one file for Supabase.
          Every mutation flows through <code className="rounded bg-surface-3 px-1 py-0.5 font-mono text-xs">lib/ops.ts</code> — the same functions the
          <Link href="/status" className="underline underline-offset-2"> /status</Link> portal executes to prove the platform works.
        </p>
      </Card>

      {/* Routes */}
      <section className="mt-10">
        <SectionTitle eyebrow={`${ROUTES.length} registered pages`} title="Every page & link" />
        {routeGroups.map((g) => (
          <div key={g} className="mt-5">
            <p className="eyebrow mb-2">{g}</p>
            <Table>
              <thead>
                <tr>
                  <Th>Path</Th>
                  <Th>Page</Th>
                  <Th>Health markers</Th>
                  <Th>Try it</Th>
                </tr>
              </thead>
              <tbody>
                {ROUTES.filter((r) => r.group === g).map((r) => (
                  <tr key={r.path}>
                    <Td className="font-mono text-xs">{r.path}</Td>
                    <Td className="font-medium">{r.title}</Td>
                    <Td className="text-xs text-muted">{r.expects.map((e) => `"${e}"`).join(", ")}</Td>
                    <Td>
                      <Link href={r.sample ?? r.path} className="inline-flex items-center gap-1 text-xs font-semibold text-ink underline-offset-2 hover:underline" target={r.path.startsWith("/api") ? "_blank" : undefined}>
                        open <ExternalLink className="size-3" />
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ))}
      </section>

      {/* Actions */}
      <section className="mt-12">
        <SectionTitle eyebrow={`${ACTIONS.length} action contracts`} title="Every action & its promise" sub="Each interactive feature declares a contract. The /status portal executes them; this table documents them." />
        {actionGroups.map((g) => (
          <div key={g} className="mt-5">
            <p className="eyebrow mb-2">{g}</p>
            <div className="grid gap-2.5 md:grid-cols-2">
              {ACTIONS.filter((a) => a.group === g).map((a) => (
                <Card key={a.id} className="p-4">
                  <p className="flex items-center gap-2 text-[13px] font-semibold">
                    {a.label} <span className="font-mono text-[9px] text-muted">{a.id}</span>
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{a.contract}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Workflows */}
      <section className="mt-12">
        <SectionTitle eyebrow={`${WORKFLOWS.length} verified workflows`} title="End-to-end journeys" />
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {WORKFLOWS.map((w) => (
            <Card key={w.id} className="p-5">
              <p className="flex items-center justify-between font-display text-sm font-semibold">
                {w.title} <Badge tone="ok">checked live</Badge>
              </p>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-[12px] text-ink-3">
                {w.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
      </section>

      {/* Systems */}
      <section className="mt-12">
        <SectionTitle eyebrow={`${SYSTEMS.length} system packs`} title="The catalog, technically" />
        <div className="mt-5">
          <Table>
            <thead>
              <tr>
                <Th>System</Th>
                <Th>Slug</Th>
                <Th>Category</Th>
                <Th>Pipeline stages</Th>
                <Th>Modules</Th>
                <Th>Demo</Th>
              </tr>
            </thead>
            <tbody>
              {SYSTEMS.map((s) => (
                <tr key={s.slug}>
                  <Td className="font-medium">{s.name}</Td>
                  <Td className="font-mono text-xs">{s.slug}</Td>
                  <Td className="capitalize text-muted">{s.category}</Td>
                  <Td className="text-xs text-muted">{s.pipeline.map((p) => p.label).join(" → ")}</Td>
                  <Td className="text-xs text-muted">{s.modules.length}</Td>
                  <Td>
                    <Link href={`/app/demo-${s.slug}`} className="text-xs font-semibold underline-offset-2 hover:underline">
                      /app/demo-{s.slug}
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>

      <p className="mt-10 text-center text-[11px] text-muted">
        Deeper docs live in the repo: DOCS/ARCHITECTURE.md · DOCS/GO-LIVE.md · DOCS/HEALTH-REPORT.md (generated by npm run smoke)
      </p>
    </div>
  );
}
