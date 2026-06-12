"use client";

/* Trial banner (countdown) + hard paywall overlay after day 3.
   Demo workspaces show an "explore freely" ribbon instead and never lock. */

import Link from "next/link";
import { Sparkles, Lock, Timer } from "lucide-react";
import type { Tenant } from "../types";
import { isDemo, isPaid, trialExpired, trialLabel, trialProgress } from "../lib/trial";
import { Button } from "./ui";

export function TrialBanner({ tenant }: { tenant: Tenant }) {
  if (isPaid(tenant)) return null;
  const demo = isDemo(tenant);
  const expired = trialExpired(tenant);
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-xs font-medium ${
        expired
          ? "border-danger/30 bg-danger-soft text-danger"
          : "border-brand-ring bg-brand-soft text-brand-strong"
      }`}
    >
      {demo ? <Sparkles className="size-3.5 shrink-0" /> : <Timer className="size-3.5 shrink-0" />}
      <span className="flex-1">{trialLabel(tenant)}</span>
      {!demo && (
        <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-white/60 sm:block">
          <span className="block h-full rounded-full bg-brand" style={{ width: `${trialProgress(tenant) * 100}%` }} />
        </span>
      )}
      <Link href={demo ? "/start" : `/app/${tenant.slug}/continue`}>
        <Button size="sm" variant={expired ? "danger" : "brand"}>
          {demo ? "Make it mine" : expired ? "Continue now" : "Continue"}
        </Button>
      </Link>
    </div>
  );
}

export function Paywall({ tenant }: { tenant: Tenant }) {
  if (!trialExpired(tenant)) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/55 backdrop-blur-sm p-4">
      <div className="animate-rise w-full max-w-md rounded-3xl bg-surface p-8 text-center shadow-pop">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-soft">
          <Lock className="size-6 text-brand" />
        </div>
        <h2 className="font-display text-xl font-semibold">Your 3-day trial has ended</h2>
        <p className="mt-2 text-sm text-muted">
          {tenant.businessName} is safe and exactly how you left it. Pick a plan to keep going — your data, branding
          and website unlock instantly.
        </p>
        <Link href={`/app/${tenant.slug}/continue`} className="mt-6 block">
          <Button size="lg" className="w-full">
            Choose a plan & continue
          </Button>
        </Link>
        <p className="mt-3 text-[11px] text-muted">Questions? hello@jsupremetech.online · WhatsApp (658) 218-2282</p>
      </div>
    </div>
  );
}
