"use client";

/* SITE TEMPLATE — the branded public website every system ships with.
   One renderer, five archetypes (bold / warm / clean / luxe / tech) driven by
   the pack's WebsiteTemplate + the tenant's brand + the owner's content edits.
   The booking form posts straight into the workspace inbox (ops.submitBooking),
   and the AI chat bubble rides along. */

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Check, MapPin, Phone, Quote, Star } from "lucide-react";
import type { FieldDef, SystemDef, Tenant } from "../types";
import { submitBooking } from "../lib/ops";
import { mix } from "../lib/brand";
import { Button, cx, Field, Input, Select, Textarea } from "./ui";
import { TenantLogo } from "./brand-provider";
import { ChatBubble } from "./chat-widget";

function BookingField({ def, value, onChange }: { def: FieldDef; value: any; onChange: (v: any) => void }) {
  if (def.type === "select")
    return (
      <Select required={def.required} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">{def.placeholder ?? "Choose…"}</option>
        {def.options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    );
  if (def.type === "textarea")
    return <Textarea required={def.required} value={value ?? ""} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} />;
  const type = def.type === "date" ? "date" : def.type === "time" ? "time" : def.type === "number" ? "number" : "text";
  return (
    <Input
      required={def.required}
      type={type}
      value={value ?? ""}
      placeholder={def.placeholder}
      onChange={(e) => onChange(def.type === "number" ? Number(e.target.value) : e.target.value)}
    />
  );
}

export function SiteTemplate({ tenant, system }: { tenant: Tenant; system: SystemDef }) {
  const t = system.website;
  const site = tenant.site ?? {};
  const w = {
    ...t,
    ...Object.fromEntries(Object.entries(site).filter(([, v]) => v != null && v !== "")),
    services: site.services?.length ? site.services : t.services,
  };
  const dark = t.style === "bold" || t.style === "luxe";
  const serif = t.style === "luxe";

  const [form, setForm] = useState<Record<string, any>>({});
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [sent, setSent] = useState(false);

  const heroBg = useMemo(
    () =>
      dark
        ? { backgroundImage: `linear-gradient(160deg, ${mix(tenant.brand.color, "#000", 0.78)} 0%, ${mix(tenant.brand.color, "#000", 0.62)} 100%)` }
        : { backgroundImage: `linear-gradient(160deg, ${mix(tenant.brand.color, "#fff", 0.94)} 0%, #ffffff 70%)` },
    [dark, tenant.brand.color],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    submitBooking(tenant.id, system.slug, {
      customerName: contact.name,
      phone: contact.phone,
      email: contact.email,
      fields: form,
      source: "website",
    });
    setSent(true);
  };

  const navItems = [
    { href: "#services", label: w.servicesTitle },
    { href: "#why", label: "Why us" },
    { href: "#reviews", label: "Reviews" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <div className={cx("min-h-dvh bg-surface", serif && "[--font-display:Georgia,serif]")}>
      {/* ---- Nav ---- */}
      <header className="glass sticky top-0 z-50 border-b border-line">
        <div className="container-x flex items-center justify-between py-3">
          <a href="#top" className="flex items-center gap-2.5">
            <TenantLogo tenant={tenant} size={34} />
            <span className="font-display text-[15px] font-bold tracking-tight">{tenant.businessName}</span>
          </a>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((n) => (
              <a key={n.href} href={n.href} className="text-[13px] font-medium text-ink-3 transition-colors hover:text-ink">
                {n.label}
              </a>
            ))}
          </nav>
          <a href="#book">
            <Button size="sm">{w.primaryCta}</Button>
          </a>
        </div>
      </header>

      {/* ---- Hero ---- */}
      <section id="top" style={heroBg} className={cx("relative overflow-hidden", dark && "text-white")}>
        {t.style === "tech" && <div className="grid-lines absolute inset-0" aria-hidden />}
        <div className="container-x relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-rise">
            <p className={cx("eyebrow mb-3", dark && "text-white/60")}>{w.heroEyebrow}</p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {w.heroTitle}
            </h1>
            <p className={cx("mt-4 max-w-md text-base leading-relaxed sm:text-lg", dark ? "text-white/75" : "text-muted")}>
              {w.heroSubtitle}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#book">
                <Button size="lg">
                  {w.primaryCta} <ArrowRight className="size-4" />
                </Button>
              </a>
              <a href="#services">
                <Button size="lg" variant={dark ? "outline" : "ghost"} className={cx(dark && "border-white/25 bg-transparent text-white hover:border-white/60 hover:bg-white/10")}>
                  {t.secondaryCta}
                </Button>
              </a>
            </div>
            <div className={cx("mt-10 grid max-w-md grid-cols-3 gap-4 border-t pt-6", dark ? "border-white/15" : "border-line")}>
              {t.stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                  <p className={cx("text-[11px]", dark ? "text-white/60" : "text-muted")}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-pop">
              <Image src={t.heroImage} alt={`${tenant.businessName} hero`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" priority unoptimized />
            </div>
            <div className={cx("absolute -bottom-5 -left-5 rounded-2xl px-5 py-3.5 shadow-pop", dark ? "bg-white text-ink" : "bg-ink text-white")}>
              <p className="flex items-center gap-1.5 text-sm font-bold">
                <Star className="size-4 fill-current" /> {t.testimonial.role.includes("client") || t.testimonial.role.includes("member") ? "Loved by clients" : "Trusted islandwide"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Services ---- */}
      <section id="services" className="container-x py-16 md:py-20">
        <div className="mb-10 max-w-xl">
          <p className="eyebrow mb-2">{w.servicesTitle}</p>
          <h2 className="font-display text-3xl font-bold tracking-tight">What we do, properly.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {w.services.map((s, i) => (
            <div key={i} className="group rounded-2xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-pop">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-soft font-display text-sm font-bold text-brand-strong">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-base font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{s.description}</p>
              {s.price ? <p className="mt-3 text-xs font-bold text-brand-strong">{s.price}</p> : null}
            </div>
          ))}
        </div>
      </section>

      {/* ---- Why us ---- */}
      <section id="why" className={cx("py-16 md:py-20", dark ? "bg-ink text-white" : "bg-surface-2")}>
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className={cx("eyebrow mb-2", dark && "text-white/60")}>Why {tenant.businessName}</p>
            <h2 className="font-display text-3xl font-bold tracking-tight">
              {site.about ?? "Built different, run properly."}
            </h2>
            <div className="mt-6 space-y-5">
              {t.valueProps.map((v) => (
                <div key={v.title} className="flex gap-3.5">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-fg">
                    <Check className="size-3.5" />
                  </span>
                  <div>
                    <p className="font-semibold">{v.title}</p>
                    <p className={cx("mt-0.5 text-sm leading-relaxed", dark ? "text-white/65" : "text-muted")}>{v.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {t.gallery.slice(0, 2).map((g, i) => (
              <div key={i} className={cx("relative overflow-hidden rounded-2xl", i === 0 ? "aspect-[3/4]" : "mt-8 aspect-[3/4]")}>
                <Image src={g} alt="" fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Testimonial ---- */}
      <section id="reviews" className="container-x py-16 md:py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-surface p-8 text-center shadow-card md:p-12">
          <Quote className="mx-auto size-8 text-brand" />
          <p className="mt-5 font-display text-xl font-medium leading-relaxed sm:text-2xl">“{t.testimonial.quote}”</p>
          <div className="mt-5 flex items-center justify-center gap-1 text-warn">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </div>
          <p className="mt-2 text-sm font-semibold">{t.testimonial.name}</p>
          <p className="text-xs text-muted">{t.testimonial.role}</p>
        </div>
      </section>

      {/* ---- Booking ---- */}
      <section id="book" className={cx("py-16 md:py-20", dark ? "brand-gradient text-white" : "bg-brand-softer")}>
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className={cx("eyebrow mb-2", dark && "text-white/70")}>{t.bookingTitle}</p>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{w.primaryCta} in under a minute.</h2>
            <p className={cx("mt-3 max-w-md text-sm leading-relaxed sm:text-base", dark ? "text-white/75" : "text-muted")}>
              {w.bookingBlurb}
            </p>
            <div className={cx("mt-6 space-y-2 text-sm", dark ? "text-white/80" : "text-ink-3")}>
              {site.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="size-4" /> {site.phone}
                </p>
              )}
              <p className="flex items-center gap-2">
                <MapPin className="size-4" /> {site.address ?? tenant.contact.city ?? "Kingston, Jamaica"}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-6 text-ink shadow-pop md:p-8">
            {sent ? (
              <div className="py-10 text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ok-soft">
                  <Check className="size-7 text-ok" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">Request received!</h3>
                <p className="mt-2 text-sm text-muted">
                  {tenant.businessName} has your request and will confirm shortly
                  {contact.phone ? ` on ${contact.phone}` : ""}.
                </p>
                <Button variant="outline" className="mt-6" onClick={() => { setSent(false); setForm({}); setContact({ name: "", phone: "", email: "" }); }}>
                  Send another request
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <h3 className="font-display text-lg font-semibold">{t.bookingTitle}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Your name" required>
                    <Input required value={contact.name} onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))} placeholder="Full name" />
                  </Field>
                  <Field label="Phone / WhatsApp" required>
                    <Input required value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} placeholder="(876) …" />
                  </Field>
                </div>
                <Field label="Email">
                  <Input type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} placeholder="you@email.com" />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  {system.bookingFields.map((def) => (
                    <Field key={def.key} label={def.label} required={def.required} className={def.type === "textarea" ? "sm:col-span-2" : undefined}>
                      <BookingField def={def} value={form[def.key]} onChange={(v) => setForm((f) => ({ ...f, [def.key]: v }))} />
                    </Field>
                  ))}
                </div>
                <Button type="submit" size="lg" className="w-full">
                  {w.primaryCta} <ArrowRight className="size-4" />
                </Button>
                <p className="text-center text-[11px] text-muted">Instant confirmation · no account needed</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer id="contact" className="border-t border-line bg-surface">
        <div className="container-x flex flex-col items-center gap-4 py-10 text-center">
          <TenantLogo tenant={tenant} size={40} />
          <p className="font-display text-sm font-bold">{tenant.businessName}</p>
          <nav className="flex flex-wrap justify-center gap-5">
            {navItems.map((n) => (
              <a key={n.href} href={n.href} className="text-xs text-muted transition-colors hover:text-ink">
                {n.label}
              </a>
            ))}
          </nav>
          <p className="text-[11px] text-muted">
            © {new Date().getFullYear()} {tenant.businessName} · Powered by{" "}
            <Link href="/" className="font-semibold text-ink underline-offset-2 hover:underline">
              Supreme Suite
            </Link>{" "}
            · a J Supreme Tech product
          </p>
        </div>
      </footer>

      <ChatBubble tenant={tenant} system={system} />
    </div>
  );
}
