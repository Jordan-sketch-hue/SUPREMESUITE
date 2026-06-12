/* 3-day trial math + gating rules. Demo workspaces never expire. */

import type { Tenant } from "../types";

export const TRIAL_DAYS = 3;
const DAY = 86400000;

export function isDemo(tenant: Tenant | null | undefined): boolean {
  return !!tenant && tenant.slug.startsWith("demo-");
}

export function isPaid(tenant: Tenant | null | undefined): boolean {
  return !!tenant && tenant.plan !== "trial";
}

export function trialMsLeft(tenant: Tenant): number {
  return tenant.trialStartedAt + TRIAL_DAYS * DAY - Date.now();
}

export function trialExpired(tenant: Tenant | null | undefined): boolean {
  if (!tenant || isDemo(tenant) || isPaid(tenant)) return false;
  return trialMsLeft(tenant) <= 0;
}

export function trialLabel(tenant: Tenant): string {
  if (isDemo(tenant)) return "Live demo — explore freely";
  if (isPaid(tenant)) return `${tenant.plan} plan`;
  const ms = trialMsLeft(tenant);
  if (ms <= 0) return "Trial ended";
  const hours = Math.ceil(ms / 3600000);
  if (hours <= 24) return `Trial — ${hours}h left`;
  return `Trial — ${Math.ceil(ms / DAY)} day${Math.ceil(ms / DAY) === 1 ? "" : "s"} left`;
}

/** 0..1 progress through the trial window (for progress bars). */
export function trialProgress(tenant: Tenant): number {
  const used = Date.now() - tenant.trialStartedAt;
  return Math.min(1, Math.max(0, used / (TRIAL_DAYS * DAY)));
}
