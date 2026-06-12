/* Pricing — cross-system tier table + add-ons + custom. */

import Link from "next/link";
import { ArrowRight, BadgeCheck, Wrench } from "lucide-react";
import { SYSTEMS } from "@/suite/systems";
import { money } from "@/suite/lib/format";
import { Button, Card, SectionTitle, Table, Td, Th } from "@/suite/components/ui";

export const metadata = { title: "Pricing" };

const TIER_PERKS: Record<string, string[]> = {
  Starter: ["1 user", "Branded workspace + public website", "Bookings inbox + pipeline", "Invoices & customers", "Email support"],
  Pro: ["5 users", "Everything in Starter", "AI chatbot + voice agent", "Loyalty & campaigns", "Priority WhatsApp support"],
  Scale: ["Unlimited users", "Everything in Pro", "Custom domain (yourbrand.com)", "Done-for-you data migration", "Quarterly strategy call"],
};

export default function PricingPage() {
  return (
    <div className="container-x py-14 md:py-20">
      <SectionTitle
        align="center"
        eyebrow="Pricing"
        title="Simple pricing. Free for 3 days, always."
        sub="Every system starts with a full-featured 3-day trial — no card. Continue on the tier that fits. Prices in USD; JMD billing available for Jamaican businesses."
      />

      {/* Tier explainer */}
      <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
        {(["Starter", "Pro", "Scale"] as const).map((tier, i) => (
          <Card key={tier} className={i === 1 ? "border-ink p-6 shadow-pop" : "p-6"}>
            <p className="font-display text-lg font-semibold">{tier}</p>
            <p className="mt-1 text-xs text-muted">
              {i === 0 ? "Solo operators getting organized" : i === 1 ? "Growing teams that live in the pipeline" : "Multi-branch operations"}
            </p>
            <ul className="mt-4 space-y-2">
              {TIER_PERKS[tier]!.map((h) => (
                <li key={h} className="flex items-start gap-2 text-[13px] text-ink-3">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-ok" /> {h}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Per-system table */}
      <div className="mt-14">
        <SectionTitle eyebrow="Per system" title="Every system, every tier" sub="Pick a system to see its full detail page, or jump straight into the trial." />
        <div className="mt-6">
          <Table>
            <thead>
              <tr>
                <Th>System</Th>
                <Th>Category</Th>
                <Th>Starter</Th>
                <Th>Pro</Th>
                <Th>Scale</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {SYSTEMS.map((s) => (
                <tr key={s.slug} className="transition-colors hover:bg-surface-2">
                  <Td>
                    <Link href={`/systems/${s.slug}`} className="flex items-center gap-2 font-medium hover:underline">
                      <span className="size-2.5 rounded-full" style={{ background: s.accent }} />
                      {s.name}
                    </Link>
                  </Td>
                  <Td className="capitalize text-muted">{s.category}</Td>
                  {s.plans.map((p) => (
                    <Td key={p.tier} className="font-semibold">{money(p.monthly, p.currency)}<span className="text-xs font-normal text-muted">/mo</span></Td>
                  ))}
                  <Td>
                    <Link href={`/start?system=${s.slug}`}>
                      <Button size="sm" variant="outline">Try free</Button>
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Custom */}
      <div className="mt-14 grid items-center gap-6 rounded-3xl bg-ink p-10 text-white md:grid-cols-[1fr_auto]">
        <div>
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
            <Wrench className="size-3.5" /> Custom builds by J Supreme Tech
          </p>
          <h3 className="mt-2 font-display text-2xl font-bold">Need a CRM that doesn't exist yet?</h3>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            We build fully custom systems on the same engine — your pipeline, your fields, your rules. One-time build fee +
            your chosen tier. Most builds ship in days, not months.
          </p>
        </div>
        <Link href="/contact">
          <Button size="lg" className="bg-white text-ink hover:bg-white/90">
            Request a quote <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
