/* ============================================================================
   SELF-CHECK RUNNER — executes on /status in the browser.
   Three layers:
   1. Pages  — fetches every registered route, asserts markers in the HTML.
   2. Workflows — runs every business workflow through the REAL ops functions
      on a throwaway workspace (created → exercised → deleted).
   3. Platform — brand engine, PWA, AI brain, data round-trips.
   Result: clickable proof that every page, link and action works.
============================================================================ */

import type { CheckResult, CrmRecord, Tenant } from "../types";
import { ROUTES } from "./routes";
import {
  createTenant,
  convertBooking,
  createInvoice,
  createRecord,
  addPoints,
  invoiceTotal,
  sendMessage,
  setRecordStage,
  submitBooking,
  activatePlan,
} from "./ops";
import { deleteTenant, getCol, exportTenantJson, importTenantJson, getTenantBySlug } from "./store";
import { brandVars, readableOn } from "./brand";
import { trialExpired } from "./trial";
import { replyFor, initialChatState, defaultBotConfig, speechSupport, type ChatState } from "./ai";
import { getSystem, SYSTEMS } from "../systems";
import { toCsv, parseCsv } from "./csv";

type Push = (r: CheckResult) => void;

async function timed<T>(fn: () => Promise<T> | T): Promise<{ out?: T; err?: string; ms: number }> {
  const t0 = performance.now();
  try {
    const out = await fn();
    return { out, ms: Math.round(performance.now() - t0) };
  } catch (e: any) {
    return { err: e?.message ?? String(e), ms: Math.round(performance.now() - t0) };
  }
}

function result(id: string, label: string, group: string, ok: boolean, detail: string, ms: number, warn = false): CheckResult {
  return { id, label, group, status: ok ? "pass" : warn ? "warn" : "fail", detail, ms };
}

/* ---- layer 1: pages ------------------------------------------------------ */

export async function checkPages(push: Push): Promise<void> {
  for (const route of ROUTES) {
    const url = route.sample ?? route.path;
    const { out, err, ms } = await timed(async () => {
      const res = await fetch(url, { cache: "no-store" });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const missing = route.expects.filter((m) => !text.includes(m));
      if (missing.length) throw new Error(`missing marker: "${missing[0]}"`);
      return res.status;
    });
    push(
      result(
        `page:${route.path}`,
        `${route.title} (${route.path})`,
        "Pages & links",
        !err,
        err ?? `200 OK, markers present`,
        ms,
      ),
    );
  }
}

/* ---- layer 2: workflows --------------------------------------------------- */

export async function checkWorkflows(push: Push): Promise<void> {
  const SCRATCH = "check-scratch";
  // Clean slate
  const prev = getTenantBySlug(SCRATCH);
  if (prev) deleteTenant(prev.id);

  let tenant: Tenant | null = null;
  const system = getSystem("courier");

  // WF: launch a branded workspace
  {
    const { out, err, ms } = await timed(() =>
      createTenant({
        businessName: "Check Scratch Co",
        systemSlug: "courier",
        slugOverride: SCRATCH,
        brand: { color: "#1f56a8" },
      }),
    );
    tenant = out ?? null;
    const seeded = tenant ? getCol<CrmRecord>(tenant.id, "records").length : 0;
    push(
      result(
        "wf-launch",
        "Workflow: launch branded workspace (create + seed + trial)",
        "Workflows",
        !err && !!tenant && seeded > 0 && !trialExpired(tenant),
        err ?? `workspace '${SCRATCH}' created, ${seeded} records seeded, trial active`,
        ms,
      ),
    );
  }
  if (!tenant) return;
  const t = tenant;

  // WF: lead → cash
  {
    const { err, ms, out } = await timed(() => {
      const booking = submitBooking(t.id, system.slug, {
        customerName: "Test Lead",
        phone: "(876) 555-0100",
        email: "lead@example.com",
        fields: { service: "Same-day delivery", date: "2026-12-01" },
        source: "website",
      });
      const inboxed = getCol(t.id, "bookings").some((b: any) => b.id === booking.id && b.status === "new");
      if (!inboxed) throw new Error("booking did not reach inbox");
      const { record, customer } = convertBooking(t, system, booking);
      const lastStage = system.pipeline[system.pipeline.length - 1]!;
      setRecordStage(t, record.id, lastStage.id);
      const moved = getCol<CrmRecord>(t.id, "records").find((r) => r.id === record.id);
      if (moved?.status !== lastStage.id) throw new Error("stage move failed");
      const inv = createInvoice(t, {
        customerId: customer.id,
        customerName: customer.name,
        items: [
          { label: "Delivery", qty: 2, unit: 1500 },
          { label: "Fuel surcharge", qty: 1, unit: 300 },
        ],
        status: "paid",
      });
      if (inv.amount !== 3300 || invoiceTotal(inv.items) !== 3300) throw new Error("invoice math wrong");
      return `booking→record(${moved.ref})→invoice ${inv.number} paid ($3,300)`;
    });
    push(result("wf-lead-to-cash", "Workflow: lead → booking → job → invoice → paid", "Workflows", !err, err ?? out!, ms));
  }

  // WF: AI front desk books via chat
  {
    const { err, ms, out } = await timed(() => {
      const cfg = defaultBotConfig(t, system);
      const ctx = { tenant: t, system, cfg, services: system.website.services.map((s) => s.title) };
      let state: ChatState = initialChatState;
      let bookingOut: any = null;
      const say = (msg: string) => {
        const r = replyFor(state, msg, ctx);
        state = r.state;
        if (r.booking) bookingOut = r.booking;
        return r;
      };
      const priceReply = say("how much does it cost?");
      if (!/•/.test(priceReply.text)) throw new Error("price intent failed");
      say("I want to book");
      say("Jordan Tester");
      say("(876) 555-0123");
      say("Same-day delivery");
      say("tomorrow");
      say("yes");
      if (!bookingOut) throw new Error("slot-fill did not produce a booking");
      submitBooking(t.id, system.slug, { ...bookingOut, source: "widget" });
      const found = getCol(t.id, "bookings").some((b: any) => b.customerName === "Jordan Tester");
      if (!found) throw new Error("chat booking not persisted");
      return "price intent ✓, 6-turn slot-fill ✓, booking persisted ✓";
    });
    push(result("wf-ai-frontdesk", "Workflow: AI chatbot answers + captures booking", "Workflows", !err, err ?? out!, ms));
  }

  // WF: retention loop (points + message)
  {
    const { err, ms, out } = await timed(() => {
      const cust = getCol<any>(t.id, "customers")[0];
      if (!cust) throw new Error("no customer");
      const before = cust.points;
      const after = addPoints(t, cust.id, 50);
      if (!after || after.points !== before + 50) throw new Error("points did not apply");
      const msg = sendMessage(t, { customerId: cust.id, customerName: cust.name, body: "You earned 50 points!" });
      const persisted = getCol(t.id, "messages").some((m: any) => m.id === msg.id);
      if (!persisted) throw new Error("message not persisted");
      return `+50 pts (${before}→${after.points}) and WhatsApp-style message logged`;
    });
    push(result("wf-retention", "Workflow: loyalty points + outbound message", "Workflows", !err, err ?? out!, ms));
  }

  // WF: trial gate + sandbox checkout
  {
    const { err, ms, out } = await timed(() => {
      const expired: Tenant = { ...t, trialStartedAt: Date.now() - 4 * 86400000 };
      if (!trialExpired(expired)) throw new Error("expiry math wrong");
      const unlocked = activatePlan(expired, "Pro");
      if (trialExpired(unlocked)) throw new Error("plan did not unlock");
      activatePlan(t, "trial"); // restore scratch state
      return "expires after day 3 ✓, choosing a plan unlocks ✓";
    });
    push(result("wf-trial-convert", "Workflow: 3-day trial gate → continue (sandbox checkout)", "Workflows", !err, err ?? out!, ms));
  }

  // WF: data freedom (JSON + CSV round trips)
  {
    const { err, ms, out } = await timed(() => {
      const json = exportTenantJson(t.id);
      if (!json.includes(SCRATCH)) throw new Error("export missing tenant");
      const restored = importTenantJson(json);
      if (restored.slug !== SCRATCH) throw new Error("import failed");
      const rows = getCol<CrmRecord>(t.id, "records").map((r) => ({ ref: r.ref, title: r.title, status: r.status }));
      const csv = toCsv(rows);
      const back = parseCsv(csv);
      if (back.length !== rows.length) throw new Error("CSV round-trip lost rows");
      return `JSON export/import ✓, CSV ${rows.length} rows round-trip ✓`;
    });
    push(result("wf-data-freedom", "Workflow: export / import (JSON + CSV)", "Workflows", !err, err ?? out!, ms));
  }

  // record create direct (covers record-create/edit)
  {
    const { err, ms, out } = await timed(() => {
      const rec = createRecord(t, system, { title: "Direct create test", value: 1234 });
      const found = getCol<CrmRecord>(t.id, "records").find((r) => r.id === rec.id);
      if (!found) throw new Error("record not found after create");
      return `record ${rec.ref} created with auto-reference`;
    });
    push(result("wf-record-create", "Action: create record with auto reference", "Workflows", !err, err ?? out!, ms));
  }

  // cleanup
  deleteTenant(t.id);
}

/* ---- layer 3: platform ----------------------------------------------------- */

export async function checkPlatform(push: Push): Promise<void> {
  // Brand engine
  {
    const { err, ms, out } = await timed(() => {
      const vars = brandVars({ color: "#1f56a8", mode: "light", radius: "soft", font: "modern" });
      if (vars["--brand"] !== "#1f56a8") throw new Error("--brand not set");
      if (readableOn("#1f56a8") !== "#ffffff") throw new Error("contrast engine wrong (dark blue → white text)");
      if (readableOn("#f4f4f5") !== "#0a0a0b") throw new Error("contrast engine wrong (light → ink text)");
      const el = document.createElement("div");
      Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));
      document.body.appendChild(el);
      const applied = getComputedStyle(el).getPropertyValue("--brand").trim();
      el.remove();
      if (applied !== "#1f56a8") throw new Error("CSS var did not apply to DOM");
      return "vars computed, auto-contrast correct, applied to DOM";
    });
    push(result("plat-brand", "White-label engine: runtime CSS variables + auto contrast", "Platform", !err, err ?? out!, ms));
  }

  // All 13 systems seed deterministically
  {
    const { err, ms, out } = await timed(() => {
      const issues: string[] = [];
      SYSTEMS.forEach((sys) => {
        const mk = () =>
          sys.seed({
            tenantId: "det-test",
            now: 1765497600000,
            rand: (() => {
              let a = 42;
              return () => ((a = (a * 16807) % 2147483647) / 2147483647);
            })(),
          });
        const a = mk();
        const b = mk();
        if (!a.records.length && !a.customers.length) issues.push(`${sys.slug}: empty seed`);
        if (JSON.stringify(a.records.map((r) => r.title)) !== JSON.stringify(b.records.map((r) => r.title)))
          issues.push(`${sys.slug}: non-deterministic`);
        if (!sys.pipeline.length) issues.push(`${sys.slug}: no pipeline`);
        if (!sys.kpis.length) issues.push(`${sys.slug}: no KPIs`);
        if (!sys.website.services.length) issues.push(`${sys.slug}: website has no services`);
      });
      if (issues.length) throw new Error(issues.slice(0, 3).join("; "));
      return `${SYSTEMS.length} systems × (seed ✓ deterministic ✓ pipeline ✓ KPIs ✓ website ✓)`;
    });
    push(result("plat-systems", `All ${SYSTEMS.length} system packs valid + deterministic seeds`, "Platform", !err, err ?? out!, ms));
  }

  // PWA
  {
    const { err, ms, out } = await timed(async () => {
      const res = await fetch("/manifest.webmanifest", { cache: "no-store" });
      if (!res.ok) throw new Error(`manifest HTTP ${res.status}`);
      const man = await res.json();
      if (!man.icons?.length) throw new Error("manifest missing icons");
      return `manifest ok (${man.icons.length} icons), display=${man.display}`;
    });
    push(result("plat-pwa", "PWA: installable manifest reachable", "Platform", !err, err ?? out!, ms));
  }
  {
    const { ms, out } = await timed(async () => {
      if (!("serviceWorker" in navigator)) return "service workers unsupported in this browser";
      const reg = await navigator.serviceWorker.getRegistration();
      return reg ? "service worker registered (offline shell active)" : "not yet registered (registers on app visit)";
    });
    const ok = typeof out === "string" && out.includes("registered (offline");
    push({ id: "plat-sw", label: "PWA: offline service worker", group: "Platform", status: ok ? "pass" : "warn", detail: out as string, ms });
  }

  // Voice capability (environment-dependent → warn, not fail)
  {
    const s = speechSupport();
    push({
      id: "plat-voice",
      label: "Voice agent: speech engines available",
      group: "Platform",
      status: s.tts ? (s.stt ? "pass" : "warn") : "warn",
      detail: `speech-to-text: ${s.stt ? "yes" : "no (text fallback active)"} · text-to-speech: ${s.tts ? "yes" : "no"}`,
      ms: 0,
    });
  }
}

/* ---- runner ---------------------------------------------------------------- */

export async function runAllChecks(onResult: Push): Promise<CheckResult[]> {
  const all: CheckResult[] = [];
  const push: Push = (r) => {
    all.push(r);
    onResult(r);
  };
  console.log("[ss-checks] platform layer…");
  await checkPlatform(push);
  console.log("[ss-checks] workflows layer…", all.length);
  await checkWorkflows(push);
  console.log("[ss-checks] pages layer…", all.length);
  await checkPages(push);
  console.log("[ss-checks] done", all.length);
  return all;
}
