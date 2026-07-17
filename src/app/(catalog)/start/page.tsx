"use client";

/* /start — 4-step onboarding wizard.
   Pick system → business details → brand it (logo/colors/style) → launch.
   Creates the tenant, seeds starter data, starts the 3-day trial. */

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Link2, Rocket, UploadCloud } from "lucide-react";
import type { ApiConnection, BrandConfig } from "@/suite/types";
import { SYSTEMS, getSystem } from "@/suite/systems";
import { createTenant } from "@/suite/lib/ops";
import { BRAND_PRESETS, DEFAULT_BRAND } from "@/suite/lib/brand";
import { Badge, Button, Card, cx, Field, Input } from "@/suite/components/ui";

const STEPS = ["Choose system", "Your business", "Make it yours", "Connect tools", "Launch"];

/* Quick-connect integrations shown during onboarding */
const QUICK_INTEGRATIONS = [
  { id: "whatsapp", name: "WhatsApp Business", logo: "💬", fields: ["phoneId", "token"] },
  { id: "stripe", name: "Stripe", logo: "💳", fields: ["publishable", "secret"] },
  { id: "wipay", name: "WiPay (JMD)", logo: "🇯🇲", fields: ["accountNumber", "apiKey"] },
  { id: "meta", name: "Meta / Instagram", logo: "📘", fields: ["pageToken", "pageId"] },
  { id: "mailchimp", name: "Mailchimp", logo: "📧", fields: ["apiKey", "listId"] },
  { id: "google-calendar", name: "Google Calendar", logo: "📅", fields: ["apiKey", "calendarId"] },
  { id: "slack", name: "Slack Alerts", logo: "💼", fields: ["webhookUrl"] },
  { id: "zapier", name: "Zapier", logo: "⚡", fields: ["webhookUrl"] },
];

function StartWizard() {
  const router = useRouter();
  const search = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [systemSlug, setSystemSlug] = useState<string>("");
  const [biz, setBiz] = useState({ businessName: "", ownerName: "", email: "", phone: "", city: "" });
  const [brand, setBrand] = useState<BrandConfig>({ ...DEFAULT_BRAND });
  const [apiConnections, setApiConnections] = useState<ApiConnection[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connFields, setConnFields] = useState<Record<string, string>>({});
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState("");
  const presetApplied = useRef(false);

  // Apply a ?system= preset exactly once. Without this guard the effect re-ran on
  // every render (useSearchParams returns a fresh identity each pass) and setBrand
  // created a new object each time → infinite render loop that froze the page.
  // Read the raw value so `search` doesn't need to be a reactive dependency.
  const presetSystem = search.get("system");
  useEffect(() => {
    if (presetApplied.current || !presetSystem) return;
    if (SYSTEMS.some((s) => s.slug === presetSystem)) {
      presetApplied.current = true;
      setSystemSlug(presetSystem);
      setBrand((b) => ({ ...b, color: getSystem(presetSystem).accent }));
      setStep(1);
    }
  }, [presetSystem]);

  const system = systemSlug ? getSystem(systemSlug) : null;

  const onLogo = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      setError("Logo too large — keep it under 1.5MB");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setBrand((b) => ({ ...b, logoDataUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const saveQuickConnect = () => {
    if (!connectingId) return;
    const conn: ApiConnection = {
      id: connectingId,
      connectedAt: Date.now(),
      status: "connected",
      fields: connFields,
    };
    setApiConnections((prev) => [...prev.filter((c) => c.id !== connectingId), conn]);
    setConnectingId(null);
    setConnFields({});
  };

  const launch = () => {
    if (!system) return;
    setLaunching(true);
    setError("");
    try {
      const tenant = createTenant({
        businessName: biz.businessName || `${system.shortName} Co.`,
        systemSlug: system.slug,
        ownerName: biz.ownerName,
        email: biz.email,
        phone: biz.phone || undefined,
        city: biz.city || undefined,
        brand,
        apiConnections,
      });
      setTimeout(() => router.push(`/app/${tenant.slug}`), 700);
    } catch (err) {
      console.error("Launch failed:", err);
      setError("Something went wrong building your workspace. Please try again.");
      setLaunching(false);
    }
  };

  const canNext =
    step === 0 ? !!systemSlug : step === 1 ? biz.businessName.trim().length > 1 && biz.ownerName.trim().length > 1 : true;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-10">
        <div className="mx-auto mt-2 flex max-w-lg items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <button
                onClick={() => i < step && setStep(i)}
                className={cx(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  i < step ? "bg-ok text-white" : i === step ? "bg-ink text-white" : "bg-surface-3 text-muted",
                )}
                aria-label={s}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </button>
              {i < STEPS.length - 1 && <span className={cx("mx-1 h-0.5 flex-1 rounded", i < step ? "bg-ok" : "bg-line")} />}
            </div>
          ))}
        </div>
        <div className="mx-auto mt-2 flex max-w-lg justify-between text-[10px] font-medium uppercase tracking-wider text-muted">
          {STEPS.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>

      {/* Step 0 — system */}
      {step === 0 && (
        <div className="animate-rise grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SYSTEMS.map((s) => {
            const Icon = s.icon;
            const active = systemSlug === s.slug;
            return (
              <button
                key={s.slug}
                onClick={() => {
                  setSystemSlug(s.slug);
                  setBrand((b) => ({ ...b, color: s.accent }));
                }}
                className={cx(
                  "flex items-start gap-3 rounded-2xl border-2 bg-surface p-4 text-left shadow-card transition-all hover:-translate-y-0.5",
                  active ? "border-ink shadow-pop" : "border-line hover:border-ink/40",
                )}
              >
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${s.accent}14` }}>
                  <Icon className="size-5" style={{ color: s.accent }} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[13px] font-semibold">{s.shortName}</span>
                    {active && <Check className="size-4 shrink-0 text-ok" />}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted">{s.tagline}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 1 — business */}
      {step === 1 && system && (
        <Card className="animate-rise mx-auto max-w-xl p-6 md:p-8">
          <div className="mb-5 flex items-center gap-3">
            <system.icon className="size-6" style={{ color: system.accent }} />
            <p className="text-sm font-semibold">{system.name}</p>
            <Badge tone="progress">3-day trial</Badge>
          </div>
          <div className="space-y-4">
            <Field label="Business name" required help="This becomes your workspace, website and app name">
              <Input value={biz.businessName} onChange={(e) => setBiz((b) => ({ ...b, businessName: e.target.value }))} placeholder="e.g. Island Express Couriers" autoFocus />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Your name" required>
                <Input value={biz.ownerName} onChange={(e) => setBiz((b) => ({ ...b, ownerName: e.target.value }))} placeholder="Owner / manager" />
              </Field>
              <Field label="City">
                <Input value={biz.city} onChange={(e) => setBiz((b) => ({ ...b, city: e.target.value }))} placeholder="Kingston" />
              </Field>
              <Field label="Email">
                <Input type="email" value={biz.email} onChange={(e) => setBiz((b) => ({ ...b, email: e.target.value }))} placeholder="you@business.com" />
              </Field>
              <Field label="Phone / WhatsApp">
                <Input value={biz.phone} onChange={(e) => setBiz((b) => ({ ...b, phone: e.target.value }))} placeholder="(876) …" />
              </Field>
            </div>
          </div>
        </Card>
      )}

      {/* Step 2 — brand */}
      {step === 2 && system && (
        <div className="animate-rise grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="p-6">
            <p className="eyebrow mb-4">Brand it</p>
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-semibold text-ink-3">Logo (optional, recommended)</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
                <div className="flex items-center gap-3">
                  {brand.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brand.logoDataUrl} alt="Your logo" className="size-14 rounded-xl border border-line object-contain" />
                  ) : (
                    <span className="flex size-14 items-center justify-center rounded-xl font-display text-lg font-bold text-white" style={{ background: brand.color }}>
                      {(biz.businessName || "S")[0]?.toUpperCase()}
                    </span>
                  )}
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <UploadCloud className="size-4" /> {brand.logoDataUrl ? "Replace logo" : "Upload logo"}
                  </Button>
                  {brand.logoDataUrl && (
                    <Button variant="ghost" size="sm" onClick={() => setBrand((b) => ({ ...b, logoDataUrl: undefined }))}>
                      Remove
                    </Button>
                  )}
                </div>
                {error && <p className="mt-1.5 text-[11px] text-danger">{error}</p>}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-ink-3">Brand color</p>
                <div className="flex flex-wrap items-center gap-2">
                  {BRAND_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      title={p.name}
                      onClick={() => setBrand((b) => ({ ...b, color: p.color, color2: p.color2 }))}
                      className={cx("size-9 rounded-xl border-2 transition-transform hover:scale-110", brand.color === p.color ? "border-ink" : "border-transparent")}
                      style={{ background: p.color }}
                      aria-label={p.name}
                    />
                  ))}
                  <label className="relative size-9 cursor-pointer overflow-hidden rounded-xl border border-dashed border-line bg-surface-2" title="Custom">
                    <input type="color" value={brand.color} onChange={(e) => setBrand((b) => ({ ...b, color: e.target.value }))} className="absolute inset-0 size-full cursor-pointer opacity-0" aria-label="Custom color" />
                    <span className="flex h-full items-center justify-center text-[10px] font-bold text-muted">+</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink-3">Corners</p>
                  <div className="flex gap-2">
                    {(["sharp", "soft", "round"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setBrand((b) => ({ ...b, radius: r }))}
                        className={cx(
                          "flex-1 border px-2 py-2 text-[11px] font-medium capitalize",
                          r === "sharp" ? "rounded-md" : r === "soft" ? "rounded-xl" : "rounded-3xl",
                          brand.radius === r ? "border-ink bg-ink text-white" : "border-line bg-surface",
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink-3">Type</p>
                  <div className="flex gap-2">
                    {(["modern", "grotesk", "classic"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setBrand((b) => ({ ...b, font: f }))}
                        className={cx(
                          "flex-1 rounded-xl border px-2 py-2 text-center text-[11px] font-medium capitalize",
                          brand.font === f ? "border-ink bg-ink text-white" : "border-line bg-surface",
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Live preview */}
          <div className="lg:sticky lg:top-24">
            <p className="eyebrow mb-2">Live preview — this is YOUR app</p>
            <div className="overflow-hidden rounded-3xl border border-line shadow-pop">
              <div className="flex items-center gap-2.5 px-5 py-4" style={{ background: brand.color }}>
                {brand.logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={brand.logoDataUrl} alt="" className="size-9 rounded-lg bg-white/90 object-contain p-0.5" />
                ) : (
                  <span className="flex size-9 items-center justify-center rounded-lg bg-white/20 font-display text-sm font-bold text-white">
                    {(biz.businessName || "S")[0]?.toUpperCase()}
                  </span>
                )}
                <div className="leading-tight text-white">
                  <p className={cx("text-sm font-bold", brand.font === "classic" && "font-serif")}>{biz.businessName || "Your Business"}</p>
                  <p className="text-[10px] opacity-75">{system.shortName} workspace</p>
                </div>
              </div>
              <div className="space-y-3 bg-surface-2 p-5">
                <div className="flex gap-2">
                  {system.pipeline.slice(0, 3).map((s) => (
                    <span key={s.id} className="rounded-full bg-surface px-3 py-1 text-[10px] font-semibold shadow-sm">{s.label}</span>
                  ))}
                </div>
                <div className={cx("bg-surface p-4 shadow-card", brand.radius === "sharp" ? "rounded-lg" : brand.radius === "round" ? "rounded-3xl" : "rounded-2xl")}>
                  <p className="text-[10px] uppercase tracking-wider text-muted">This week</p>
                  <p className={cx("font-display text-2xl font-bold", brand.font === "classic" && "font-serif")} style={{ color: brand.color }}>
                    +38% bookings
                  </p>
                </div>
                <span className={cx("inline-block px-5 py-2.5 text-xs font-semibold text-white", brand.radius === "sharp" ? "rounded-lg" : brand.radius === "round" ? "rounded-full" : "rounded-xl")} style={{ background: brand.color }}>
                  {system.website.primaryCta}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — connect tools */}
      {step === 3 && system && (
        <div className="animate-rise mx-auto max-w-2xl">
          <p className="mb-1 text-center text-sm font-medium">Connect your existing tools <span className="text-muted">(optional — skip if you want to add later)</span></p>
          <p className="mb-6 text-center text-[12px] text-muted">All credentials stay local during your trial. They move to an encrypted vault when you go live.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_INTEGRATIONS.map((qi) => {
              const connected = apiConnections.find((c) => c.id === qi.id);
              const isActive = connectingId === qi.id;
              return (
                <Card key={qi.id} className={cx("p-4", connected && "border-ok/40 bg-ok-soft")}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{qi.logo}</span>
                    <div className="flex-1 leading-tight">
                      <p className="text-[13px] font-semibold">{qi.name}</p>
                      {connected && <p className="flex items-center gap-1 text-[10px] text-ok"><CheckCircle2 className="size-3" /> Connected</p>}
                    </div>
                    {!isActive && (
                      <Button size="sm" variant={connected ? "outline" : "brand"}
                        onClick={() => { setConnectingId(qi.id); setConnFields(connected?.fields ?? {}); }}>
                        <Link2 className="size-3.5" /> {connected ? "Edit" : "Connect"}
                      </Button>
                    )}
                  </div>
                  {isActive && (
                    <div className="mt-3 space-y-2 border-t border-line pt-3">
                      {qi.fields.map((fk) => (
                        <Input key={fk} placeholder={fk} value={connFields[fk] ?? ""}
                          onChange={(e) => setConnFields((p) => ({ ...p, [fk]: e.target.value }))} />
                      ))}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveQuickConnect}><Check className="size-3.5" /> Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setConnectingId(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          <p className="mt-4 text-center text-[11px] text-muted">More integrations available inside Settings → Integrations after launch.</p>
        </div>
      )}

      {/* Step 4 — review & launch */}
      {step === 4 && system && (
        <Card className="animate-rise mx-auto max-w-xl p-8 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-3xl" style={{ background: `${brand.color}18` }}>
            <Rocket className="size-8" style={{ color: brand.color }} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold">Ready to launch {biz.businessName || "your workspace"}</h2>
          <div className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm">
            {[
              [`${system.name}`, "your full back office, pre-configured"],
              ["Branded public website", "with a booking form wired to your inbox"],
              ["AI chatbot + voice agent", "answering & booking 24/7"],
              ["Starter demo data", "so every screen makes sense (clear it anytime)"],
              ...(apiConnections.length > 0 ? [[`${apiConnections.length} integration${apiConnections.length > 1 ? "s" : ""} connected`, apiConnections.map(c => c.id).join(", ")]] : []),
              ["3-day free trial", "no card — continue only if you love it"],
            ].map(([t, b]) => (
              <p key={t} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4.5 shrink-0 text-ok" />
                <span>
                  <strong>{t}</strong> <span className="text-muted">— {b}</span>
                </span>
              </p>
            ))}
          </div>
          <Button size="lg" className="mt-7 w-full" style={{ background: brand.color, color: "#fff" }} disabled={launching} onClick={launch}>
            {launching ? "Building your workspace…" : "Launch my workspace 🚀"}
          </Button>
          {error && <p className="mt-3 text-xs text-danger">{error}</p>}
          <p className="mt-3 text-[11px] text-muted">Created instantly on this device. Cloud sync + team logins activate when you continue after the trial.</p>
        </Card>
      )}

      {/* Nav */}
      <div className="mx-auto mt-8 flex max-w-xl items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0 || launching}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        {step < 3 && (
          <Button variant="dark" onClick={() => canNext && setStep((s) => s + 1)} disabled={!canNext}>
            Continue <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function StartPage() {
  return (
    <div className="container-x py-12 md:py-16">
      <h1 className="text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">Launch your workspace</h1>
      <p className="mt-2 text-center text-sm text-muted">Free for 3 days. Branded in 60 seconds. Yours from the first click.</p>
      <Suspense fallback={<div className="py-20 text-center text-sm text-muted">Loading…</div>}>
        <StartWizard />
      </Suspense>
    </div>
  );
}
