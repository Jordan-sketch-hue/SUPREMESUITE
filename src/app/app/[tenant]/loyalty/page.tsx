"use client";

/* Loyalty — points, tiers, punch cards and campaign ideas. */

import { useMemo, useState } from "react";
import { Gift, Medal, Search, Star } from "lucide-react";
import type { Customer } from "@/suite/types";
import { useCol } from "@/suite/lib/store";
import { addPoints, loyaltyTier, sendMessage } from "@/suite/lib/ops";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Avatar, Badge, Button, Card, CardHeader, cx, Input, Stat, Table, Td, Th } from "@/suite/components/ui";
import { useToast } from "@/suite/components/overlays";

const TIER_TONE = { Gold: "warn", Silver: "info", Bronze: "neutral" } as const;

export default function LoyaltyPage() {
  const { tenant } = useWorkspace();
  const toast = useToast();
  const customers = useCol<Customer>(tenant?.id, "customers");
  const [q, setQ] = useState("");

  const members = useMemo(
    () =>
      [...customers]
        .filter((c) => (q ? c.name.toLowerCase().includes(q.toLowerCase()) : true))
        .sort((a, b) => b.points - a.points),
    [customers, q],
  );

  const stats = useMemo(() => {
    const total = customers.reduce((s, c) => s + c.points, 0);
    const gold = customers.filter((c) => loyaltyTier(c.points).name === "Gold").length;
    return { total, gold, members: customers.filter((c) => c.points > 0).length };
  }, [customers]);

  const give = (c: Customer, pts: number) => {
    if (!tenant) return;
    addPoints(tenant, c.id, pts);
    if (pts > 0) sendMessage(tenant, { customerId: c.id, customerName: c.name, body: `You just earned ${pts} loyalty points — balance: ${c.points + pts}. 🎉`, channel: "whatsapp" });
    toast(pts > 0 ? `+${pts} pts → ${c.name}` : `Redeemed ${-pts} pts from ${c.name}`);
  };

  return (
    <>
      <PageHead title="Loyalty" sub="Points, tiers and punch cards — repeat business on autopilot" />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Stat label="Active members" value={stats.members} icon={<Gift />} />
        <Stat label="Points on books" value={stats.total} icon={<Medal />} sub="≈ liability to delight" />
        <Stat label="Gold members" value={stats.gold} icon={<Star />} sub="500+ points" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a member…" className="w-72 pl-9" />
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Member</Th>
                <Th>Tier</Th>
                <Th>Points</Th>
                <Th>Punch card</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {members.map((c) => {
                const tier = loyaltyTier(c.points);
                const punches = Math.min(10, Math.floor(c.points / 50));
                return (
                  <tr key={c.id} className="transition-colors hover:bg-surface-2">
                    <Td>
                      <span className="flex items-center gap-2.5">
                        <Avatar name={c.name} />
                        <span>
                          <span className="block font-medium">{c.name}</span>
                          <span className="block text-[11px] text-muted">{c.phone}</span>
                        </span>
                      </span>
                    </Td>
                    <Td><Badge tone={TIER_TONE[tier.name as keyof typeof TIER_TONE]}>{tier.name}</Badge></Td>
                    <Td>
                      <span className="font-display text-base font-bold">{c.points}</span>
                      {tier.next && <span className="block text-[10px] text-muted">{tier.next - c.points} to next tier</span>}
                    </Td>
                    <Td>
                      <span className="flex gap-1" aria-label={`${punches} of 10 punches`}>
                        {Array.from({ length: 10 }).map((_, i) => (
                          <span key={i} className={cx("size-3 rounded-full border", i < punches ? "border-brand bg-brand" : "border-line bg-surface")} />
                        ))}
                      </span>
                      {punches >= 10 && <span className="mt-1 block text-[10px] font-semibold text-ok">Reward unlocked!</span>}
                    </Td>
                    <Td>
                      <span className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => give(c, 50)}>+50</Button>
                        <Button variant="outline" size="sm" onClick={() => give(c, 100)}>+100</Button>
                        <Button variant="ghost" size="sm" disabled={c.points < 100} onClick={() => give(c, -100)}>
                          Redeem
                        </Button>
                      </span>
                    </Td>
                  </tr>
                );
              })}
              {members.length === 0 && (
                <tr><Td colSpan={5} className="py-10 text-center text-sm text-muted">No members match.</Td></tr>
              )}
            </tbody>
          </Table>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="How tiers work" />
            <div className="space-y-3 px-5 pb-5 text-sm">
              {[
                { name: "Bronze", range: "0 – 199 pts", perk: "Earning on every visit" },
                { name: "Silver", range: "200 – 499 pts", perk: "Priority booking + birthday treat" },
                { name: "Gold", range: "500+ pts", perk: "VIP perks + exclusive offers" },
              ].map((t) => (
                <div key={t.name} className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-2.5">
                  <Badge tone={TIER_TONE[t.name as keyof typeof TIER_TONE]}>{t.name}</Badge>
                  <span className="text-xs text-muted">{t.range}</span>
                  <span className="ml-auto text-right text-[11px] text-ink-3">{t.perk}</span>
                </div>
              ))}
              <p className="text-[11px] text-muted">Earning rule of thumb: ~1 point per $100 spent. +50/+100 buttons keep it simple at the counter.</p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Campaign ideas" sub="Proven plays for repeat business" />
            <ul className="space-y-2.5 px-5 pb-5 text-[13px] text-ink-3">
              <li className="rounded-xl bg-surface-2 px-3.5 py-2.5"><strong>Double-points weekend</strong> — slow Saturdays fix themselves.</li>
              <li className="rounded-xl bg-surface-2 px-3.5 py-2.5"><strong>Birthday month treat</strong> — a free add-on they'll post about.</li>
              <li className="rounded-xl bg-surface-2 px-3.5 py-2.5"><strong>Win-back</strong> — 100 bonus pts for anyone quiet 60+ days.</li>
              <li className="rounded-xl bg-surface-2 px-3.5 py-2.5"><strong>Referral</strong> — both sides get 150 pts when a friend books.</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
