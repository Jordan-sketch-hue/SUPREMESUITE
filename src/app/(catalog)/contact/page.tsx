"use client";

/* Contact / custom CRM requests — persists a platform lead + handoff links. */

import { useState } from "react";
import { Check, MessageCircle, Send, Wrench } from "lucide-react";
import { addPlatformRow } from "@/suite/lib/store";
import { uid } from "@/suite/lib/ids";
import { SYSTEMS } from "@/suite/systems";
import { Button, Card, Field, Input, SectionTitle, Select, Textarea } from "@/suite/components/ui";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  business: string;
  interest: string;
  message: string;
  at: number;
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", business: "", interest: "Custom CRM build", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlatformRow<Lead>("leads", { id: uid(), ...form, at: Date.now() });
    setSent(true);
  };

  const waText = encodeURIComponent(
    `Hi J Supreme Tech! I'm ${form.name || "interested"} — ${form.interest}. ${form.message || ""}`,
  );

  return (
    <div className="container-x grid max-w-5xl items-start gap-10 py-14 md:grid-cols-[1fr_1.1fr] md:py-20">
      <div>
        <SectionTitle
          eyebrow="Custom builds & contact"
          title="Tell us what you're running. We'll systemize it."
          sub="Custom CRMs, tailored websites, special workflows, data migrations — the catalog is the start, not the limit."
        />
        <div className="mt-6 space-y-3">
          {[
            "Custom pipeline, fields and automations for your exact trade",
            "Your existing data migrated in, cleaned and organized",
            "Brand-perfect website + AI staff trained on your business",
            "Most custom builds delivered in days",
          ].map((b) => (
            <p key={b} className="flex items-start gap-2.5 text-sm text-ink-3">
              <Wrench className="mt-0.5 size-4 shrink-0 text-ink" /> {b}
            </p>
          ))}
        </div>
        <a href={`https://wa.me/16582182282?text=${waText}`} target="_blank" rel="noreferrer" className="mt-7 inline-block">
          <Button variant="outline">
            <MessageCircle className="size-4" /> Prefer WhatsApp? (658) 218-2282
          </Button>
        </a>
      </div>

      <Card className="p-6 md:p-8">
        {sent ? (
          <div className="py-12 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ok-soft">
              <Check className="size-7 text-ok" />
            </span>
            <h3 className="mt-4 font-display text-xl font-semibold">Got it — we're on it.</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Your request is logged. The fastest way to move now is WhatsApp — tap below and it pre-fills your message.
            </p>
            <a href={`https://wa.me/16582182282?text=${waText}`} target="_blank" rel="noreferrer" className="mt-5 inline-block">
              <Button>
                <MessageCircle className="size-4" /> Continue on WhatsApp
              </Button>
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Your name" required>
                <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </Field>
              <Field label="Business name">
                <Input value={form.business} onChange={(e) => setForm((f) => ({ ...f, business: e.target.value }))} />
              </Field>
              <Field label="Email" required>
                <Input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </Field>
              <Field label="Phone / WhatsApp">
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </Field>
            </div>
            <Field label="I'm interested in">
              <Select value={form.interest} onChange={(e) => setForm((f) => ({ ...f, interest: e.target.value }))}>
                <option>Custom CRM build</option>
                <option>Custom website</option>
                <option>Data migration help</option>
                {SYSTEMS.map((s) => (
                  <option key={s.slug}>{s.name}</option>
                ))}
                <option>Something else</option>
              </Select>
            </Field>
            <Field label="Tell us about your business" required>
              <Textarea
                required
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="What do you do, what's chaotic right now, and what would 'organized' look like?"
                className="min-h-28"
              />
            </Field>
            <Button type="submit" size="lg" className="w-full" variant="dark">
              <Send className="size-4" /> Send request
            </Button>
            <p className="text-center text-[11px] text-muted">We reply within one business day — usually much faster.</p>
          </form>
        )}
      </Card>
    </div>
  );
}
