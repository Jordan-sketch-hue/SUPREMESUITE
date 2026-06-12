"use client";

/* Settings — branding (the "make it feel like mine" panel), business info,
   plan & trial, data export/import, danger zone. */

import { useEffect, useRef, useState } from "react";
import { Download, Palette, Save, Upload, UploadCloud } from "lucide-react";
import type { BrandConfig } from "@/suite/types";
import { saveTenant, deleteTenant, exportTenantJson, importTenantJson } from "@/suite/lib/store";
import { BRAND_PRESETS } from "@/suite/lib/brand";
import { trialLabel } from "@/suite/lib/trial";
import { downloadText } from "@/suite/lib/csv";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Badge, Button, Card, CardHeader, cx, Field, Input } from "@/suite/components/ui";
import { ConfirmButton, useToast } from "@/suite/components/overlays";
import { TenantLogo } from "@/suite/components/brand-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const { tenant, system } = useWorkspace();
  const toast = useToast();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [brand, setBrand] = useState<BrandConfig | null>(null);

  useEffect(() => {
    if (!tenant) return;
    setName(tenant.businessName);
    setOwner(tenant.contact.ownerName);
    setEmail(tenant.contact.email);
    setPhone(tenant.contact.phone ?? "");
    setCity(tenant.contact.city ?? "");
    setBrand(tenant.brand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  const saveAll = () => {
    if (!tenant || !brand) return;
    saveTenant({
      ...tenant,
      businessName: name.trim() || tenant.businessName,
      brand,
      contact: { ownerName: owner, email, phone: phone || undefined, city: city || undefined },
    });
    toast("Saved — your whole workspace just re-skinned");
  };

  const onLogo = (file: File | undefined) => {
    if (!file || !brand) return;
    if (file.size > 1.5 * 1024 * 1024) {
      toast("Logo too large — keep it under 1.5MB", "danger");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setBrand({ ...brand, logoDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <>
      <PageHead
        title="Settings"
        sub="Branding, business details, plan and your data"
        actions={
          <Button size="sm" onClick={saveAll}>
            <Save className="size-4" /> Save changes
          </Button>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {/* Branding */}
        <Card>
          <CardHeader title="Branding" sub="Make it feel like yours — applies live, everywhere" action={<Palette className="size-4 text-muted" />} />
          {brand && tenant && (
            <div className="space-y-5 px-5 pb-5">
              <div className="flex items-center gap-4">
                <TenantLogo tenant={{ ...tenant, brand }} size={56} />
                <div className="flex-1">
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    <UploadCloud className="size-4" /> Upload logo
                  </Button>
                  {brand.logoDataUrl && (
                    <Button variant="ghost" size="sm" className="ml-2" onClick={() => setBrand({ ...brand, logoDataUrl: undefined })}>
                      Remove
                    </Button>
                  )}
                  <p className="mt-1.5 text-[11px] text-muted">PNG/JPG/SVG · shows in the app, website, favicon & installed icon</p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-ink-3">Brand color</p>
                <div className="flex flex-wrap items-center gap-2">
                  {BRAND_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      title={p.name}
                      onClick={() => setBrand({ ...brand, color: p.color, color2: p.color2 })}
                      className={cx(
                        "size-9 rounded-xl border-2 transition-transform hover:scale-110",
                        brand.color === p.color ? "border-ink" : "border-transparent",
                      )}
                      style={{ background: p.color }}
                      aria-label={`Use ${p.name}`}
                    />
                  ))}
                  <label className="relative size-9 cursor-pointer overflow-hidden rounded-xl border border-dashed border-line bg-surface-2" title="Custom color">
                    <input
                      type="color"
                      value={brand.color}
                      onChange={(e) => setBrand({ ...brand, color: e.target.value })}
                      className="absolute inset-0 size-full cursor-pointer opacity-0"
                      aria-label="Pick custom color"
                    />
                    <span className="flex h-full items-center justify-center text-[10px] font-bold text-muted">+</span>
                  </label>
                  <span className="ml-1 font-mono text-xs text-muted">{brand.color}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink-3">Corners</p>
                  <div className="flex gap-2">
                    {(["sharp", "soft", "round"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setBrand({ ...brand, radius: r })}
                        className={cx(
                          "flex-1 border px-2 py-2 text-[11px] font-medium capitalize transition-colors",
                          r === "sharp" ? "rounded-md" : r === "soft" ? "rounded-xl" : "rounded-3xl",
                          brand.radius === r ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink/40",
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-ink-3">Type style</p>
                  <div className="flex gap-2">
                    {(
                      [
                        ["modern", "Aa", "Inter"],
                        ["grotesk", "Aa", "Grotesk"],
                        ["classic", "Aa", "Serif"],
                      ] as const
                    ).map(([f, sample, label]) => (
                      <button
                        key={f}
                        onClick={() => setBrand({ ...brand, font: f })}
                        className={cx(
                          "flex-1 rounded-xl border px-2 py-1.5 text-center transition-colors",
                          brand.font === f ? "border-ink bg-ink text-white" : "border-line bg-surface hover:border-ink/40",
                        )}
                      >
                        <span className={cx("block text-base font-bold", f === "classic" && "font-serif", f === "grotesk" && "font-display")}>{sample}</span>
                        <span className="block text-[9px] opacity-70">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live mini-preview */}
              <div data-brand-scope style={{ "--brand": brand.color, "--brand-fg": "#fff" } as React.CSSProperties} className="rounded-2xl border border-line p-4">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-muted">Live preview</p>
                <div className="flex items-center gap-2">
                  <span className="rounded-[var(--radius-brand,0.75rem)] px-4 py-2 text-xs font-semibold text-white" style={{ background: brand.color }}>
                    {system.website.primaryCta}
                  </span>
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: `${brand.color}1a`, color: brand.color }}>
                    {system.shortName}
                  </span>
                  <span className="ml-auto font-display text-sm font-bold" style={{ color: brand.color }}>
                    {name || "Your brand"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          {/* Business info */}
          <Card>
            <CardHeader title="Business details" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <Field label="Business name" className="sm:col-span-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Owner">
                <Input value={owner} onChange={(e) => setOwner(e.target.value)} />
              </Field>
              <Field label="City">
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field label="Email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label="Phone / WhatsApp">
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
            </div>
          </Card>

          {/* Plan */}
          <Card>
            <CardHeader title="Plan & billing" action={tenant && <Badge tone={tenant.plan === "trial" ? "warn" : "ok"}>{tenant ? trialLabel(tenant) : ""}</Badge>} />
            <div className="px-5 pb-5">
              <p className="text-[13px] text-muted">
                {tenant?.plan === "trial"
                  ? "You're on the free 3-day trial — everything is unlocked. Continue any time and nothing changes except the lock never comes."
                  : `You're on the ${tenant?.plan} plan. Manage or change it below.`}
              </p>
              {tenant && (
                <Link href={`/app/${tenant.slug}/continue`}>
                  <Button className="mt-3" size="sm">
                    {tenant.plan === "trial" ? "View plans & continue" : "Manage plan"}
                  </Button>
                </Link>
              )}
            </div>
          </Card>

          {/* Data */}
          <Card>
            <CardHeader title="Your data" sub="It's yours — take it any time" />
            <div className="flex flex-wrap gap-2 px-5 pb-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!tenant) return;
                  downloadText(`${tenant.slug}-backup.json`, exportTenantJson(tenant.id), "application/json");
                  toast("Workspace exported");
                }}
              >
                <Download className="size-4" /> Export workspace (JSON)
              </Button>
              <input
                ref={importRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const t = importTenantJson(String(reader.result));
                      toast(`Restored "${t.businessName}"`);
                      router.push(`/app/${t.slug}`);
                    } catch {
                      toast("That file isn't a valid backup", "danger");
                    }
                  };
                  reader.readAsText(f);
                }}
              />
              <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
                <Upload className="size-4" /> Import backup
              </Button>
            </div>
          </Card>

          {/* Danger zone */}
          <Card className="border-danger/25">
            <CardHeader title="Danger zone" />
            <div className="flex items-center justify-between gap-3 px-5 pb-5">
              <p className="text-[12px] text-muted">Deletes this workspace and all its data from this device. No undo.</p>
              <ConfirmButton
                label="Delete workspace"
                confirmLabel="Click again to delete"
                onConfirm={() => {
                  if (!tenant) return;
                  deleteTenant(tenant.id);
                  router.push("/");
                }}
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
