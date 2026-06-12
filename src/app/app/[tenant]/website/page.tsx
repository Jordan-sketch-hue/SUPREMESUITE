"use client";

/* Website manager — live preview + content editor + share link. */

import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, Monitor, Save, Smartphone } from "lucide-react";
import { saveTenant } from "@/suite/lib/store";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Button, Card, CardHeader, cx, Field, Input, Textarea } from "@/suite/components/ui";
import { Tabs, useToast } from "@/suite/components/overlays";

export default function WebsitePage() {
  const { tenant, system } = useWorkspace();
  const toast = useToast();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [tick, setTick] = useState(0);
  const [form, setForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    primaryCta: "",
    about: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!tenant) return;
    setForm({
      heroTitle: tenant.site?.heroTitle ?? system.website.heroTitle,
      heroSubtitle: tenant.site?.heroSubtitle ?? system.website.heroSubtitle,
      primaryCta: tenant.site?.primaryCta ?? system.website.primaryCta,
      about: tenant.site?.about ?? "",
      phone: tenant.site?.phone ?? "",
      address: tenant.site?.address ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id]);

  const url = useMemo(() => (tenant ? `/site/${tenant.slug}` : "#"), [tenant]);
  const fullUrl = typeof window !== "undefined" && tenant ? `${window.location.origin}/site/${tenant.slug}` : "";

  const save = () => {
    if (!tenant) return;
    saveTenant({
      ...tenant,
      site: {
        ...tenant.site,
        heroTitle: form.heroTitle,
        heroSubtitle: form.heroSubtitle,
        primaryCta: form.primaryCta,
        about: form.about || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      },
    });
    setTick((t) => t + 1);
    toast("Website updated — preview refreshed");
  };

  return (
    <>
      <PageHead
        title="Website"
        sub="Your branded public site — every booking lands straight in your inbox"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(fullUrl);
                toast("Link copied — share it everywhere");
              }}
            >
              <Copy className="size-4" /> Copy link
            </Button>
            <a href={url} target="_blank" rel="noreferrer">
              <Button size="sm">
                <ExternalLink className="size-4" /> Open live
              </Button>
            </a>
          </>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader title="Edit content" sub="Changes go live on save" action={<Button size="sm" onClick={save}><Save className="size-4" /> Save</Button>} />
          <div className="space-y-4 px-5 pb-5">
            <Field label="Headline">
              <Input value={form.heroTitle} onChange={(e) => setForm((f) => ({ ...f, heroTitle: e.target.value }))} />
            </Field>
            <Field label="Sub-headline">
              <Textarea value={form.heroSubtitle} onChange={(e) => setForm((f) => ({ ...f, heroSubtitle: e.target.value }))} className="min-h-20" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Button text">
                <Input value={form.primaryCta} onChange={(e) => setForm((f) => ({ ...f, primaryCta: e.target.value }))} />
              </Field>
              <Field label="Phone (shown in booking section)">
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(876) …" />
              </Field>
            </div>
            <Field label="About line (replaces 'Built different, run properly.')">
              <Input value={form.about} onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))} placeholder="Optional" />
            </Field>
            <Field label="Address / area">
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="e.g. 12 Hope Rd, Kingston" />
            </Field>
            <div className="rounded-2xl bg-surface-2 p-4 text-[12px] leading-relaxed text-muted">
              <p className="font-semibold text-ink-3">Also on your site, automatically:</p>
              <p>• Your logo, colors and fonts (from Settings → Branding)</p>
              <p>• Services & prices from the {system.shortName} template</p>
              <p>• The booking form wired to your inbox</p>
              <p>• Your AI chat assistant, bottom-right</p>
              <p className="mt-2">Custom domain (yourbrand.com) — included on Scale plans.</p>
            </div>
          </div>
        </Card>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">Live preview</p>
            <Tabs
              value={device}
              onChange={(v) => setDevice(v as "desktop" | "mobile")}
              tabs={[
                { id: "desktop", label: <span className="flex items-center gap-1.5"><Monitor className="size-3.5" /> Desktop</span> },
                { id: "mobile", label: <span className="flex items-center gap-1.5"><Smartphone className="size-3.5" /> Mobile</span> },
              ]}
            />
          </div>
          <div className={cx("overflow-hidden rounded-2xl border border-line bg-surface-3 shadow-card transition-all", device === "mobile" ? "mx-auto w-[390px] max-w-full" : "w-full")}>
            <div className="flex items-center gap-1.5 border-b border-line bg-surface px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-danger/70" />
              <span className="size-2.5 rounded-full bg-warn/70" />
              <span className="size-2.5 rounded-full bg-ok/70" />
              <span className="ml-3 flex-1 truncate rounded-md bg-surface-2 px-3 py-1 font-mono text-[10px] text-muted">{fullUrl || url}</span>
            </div>
            <iframe key={tick} src={url} title="Website preview" className={cx("w-full bg-white", device === "mobile" ? "h-[640px]" : "h-[560px]")} />
          </div>
        </div>
      </div>
    </>
  );
}
