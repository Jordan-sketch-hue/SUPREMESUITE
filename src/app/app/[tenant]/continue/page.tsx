"use client";

/* Continue — plan selection + sandbox checkout (trial → paid). */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, CreditCard, Lock, ShieldCheck } from "lucide-react";
import { activatePlan } from "@/suite/lib/ops";
import { isPaid, trialLabel } from "@/suite/lib/trial";
import { money } from "@/suite/lib/format";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Badge, Button, Card, cx, Field, Input } from "@/suite/components/ui";
import { Modal, useToast } from "@/suite/components/overlays";

export default function ContinuePage() {
  const { tenant, system } = useWorkspace();
  const toast = useToast();
  const router = useRouter();
  const [choosing, setChoosing] = useState<string | null>(null);
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });
  const [paying, setPaying] = useState(false);

  const plan = system.plans.find((p) => p.tier === choosing);

  const checkout = () => {
    if (!tenant || !plan) return;
    if (card.number.replace(/\s/g, "").length < 12 || !card.name || !card.exp) {
      toast("Fill the card details (sandbox accepts any valid-looking card)", "danger");
      return;
    }
    setPaying(true);
    setTimeout(() => {
      activatePlan(tenant, plan.tier);
      setPaying(false);
      setChoosing(null);
      toast(`Welcome to ${plan.tier} — workspace unlocked! 🎉`);
      router.push(`/app/${tenant.slug}`);
    }, 900);
  };

  return (
    <>
      <PageHead
        title="Continue with your workspace"
        sub={tenant ? `${trialLabel(tenant)} · keep ${tenant.businessName} exactly as you built it` : ""}
      />

      {tenant && isPaid(tenant) && (
        <Card className="mb-4 border-ok/30 bg-ok-soft">
          <p className="flex items-center gap-2 px-5 py-4 text-sm font-medium text-ok">
            <BadgeCheck className="size-5" /> You're on the {tenant.plan} plan — everything is unlocked. Choose another tier below to switch.
          </p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {system.plans.map((p, i) => (
          <Card key={p.tier} className={cx("relative flex flex-col p-6", i === 1 && "border-brand shadow-pop")}>
            {i === 1 && (
              <Badge tone="progress" className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                Most popular
              </Badge>
            )}
            <p className="font-display text-lg font-semibold">{p.tier}</p>
            <p className="mt-1 text-xs text-muted">{p.blurb}</p>
            <p className="mt-4 font-display text-3xl font-bold">
              {money(p.monthly, p.currency)}
              <span className="text-sm font-normal text-muted">/mo</span>
            </p>
            <ul className="mt-4 flex-1 space-y-2">
              {p.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-[13px] text-ink-3">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand" /> {h}
                </li>
              ))}
            </ul>
            <Button className="mt-5 w-full" variant={i === 1 ? "brand" : "outline"} onClick={() => setChoosing(p.tier)}>
              Choose {p.tier}
            </Button>
          </Card>
        ))}
      </div>

      <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] text-muted">
        <ShieldCheck className="size-3.5" /> Sandbox checkout — live card processing (Stripe / WiPay JMD) is enabled on the production rollout. Cancel anytime; your data exports freely.
      </p>

      <Modal open={!!choosing} onClose={() => setChoosing(null)} title={`Checkout — ${choosing} plan`}>
        {plan && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3">
              <span className="text-sm font-medium">{plan.tier} · monthly</span>
              <span className="font-display text-lg font-bold">{money(plan.monthly, plan.currency)}</span>
            </div>
            <Field label="Card number" required>
              <Input
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={card.number}
                onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
              />
            </Field>
            <Field label="Name on card" required>
              <Input placeholder="As it appears on the card" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Expiry" required>
                <Input placeholder="MM/YY" value={card.exp} onChange={(e) => setCard((c) => ({ ...c, exp: e.target.value }))} />
              </Field>
              <Field label="CVC" required>
                <Input placeholder="123" value={card.cvc} onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))} />
              </Field>
            </div>
            <Button className="w-full" size="lg" disabled={paying} onClick={checkout}>
              {paying ? "Processing…" : (
                <>
                  <CreditCard className="size-4" /> Pay {money(plan.monthly, plan.currency)} & unlock
                </>
              )}
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
              <Lock className="size-3" /> Sandbox mode — no real charge happens here.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
