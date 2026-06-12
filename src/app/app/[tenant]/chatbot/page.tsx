"use client";

/* AI Chatbot — train the assistant (greeting, FAQs, hours) + live test console. */

import { useEffect, useState } from "react";
import { Bot, Plus, Save, Trash2 } from "lucide-react";
import { defaultBotConfig, type BotConfig } from "@/suite/lib/ai";
import { setDoc, useDoc } from "@/suite/lib/store";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Button, Card, CardHeader, Field, Input, Textarea } from "@/suite/components/ui";
import { useToast } from "@/suite/components/overlays";
import { ChatPanel } from "@/suite/components/chat-widget";

export default function ChatbotPage() {
  const { tenant, system } = useWorkspace();
  const toast = useToast();
  const stored = useDoc<BotConfig | null>(tenant?.id, "botcfg", null);
  const [cfg, setCfg] = useState<BotConfig | null>(null);
  const [savedTick, setSavedTick] = useState(0);

  useEffect(() => {
    if (!tenant) return;
    setCfg(stored ?? defaultBotConfig(tenant, system));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant?.id, stored == null]);

  const save = () => {
    if (!tenant || !cfg) return;
    setDoc(tenant.id, "botcfg", cfg);
    setSavedTick((t) => t + 1);
    toast("Assistant updated — test it on the right");
  };

  return (
    <>
      <PageHead
        title="AI Chatbot"
        sub="Train your assistant once — it answers and books on your website 24/7"
        actions={
          <Button size="sm" onClick={save}>
            <Save className="size-4" /> Save & retrain
          </Button>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          {cfg && (
            <>
              <Card>
                <CardHeader title="Personality" sub="Who answers your customers" />
                <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
                  <Field label="Assistant name">
                    <Input value={cfg.assistantName} onChange={(e) => setCfg({ ...cfg, assistantName: e.target.value })} />
                  </Field>
                  <Field label="Opening hours (spoken in replies)">
                    <Input value={cfg.hours} onChange={(e) => setCfg({ ...cfg, hours: e.target.value })} />
                  </Field>
                  <Field label="Location" className="sm:col-span-2">
                    <Input value={cfg.location} onChange={(e) => setCfg({ ...cfg, location: e.target.value })} />
                  </Field>
                  <Field label="Greeting" className="sm:col-span-2">
                    <Textarea value={cfg.greeting} onChange={(e) => setCfg({ ...cfg, greeting: e.target.value })} />
                  </Field>
                </div>
              </Card>

              <Card>
                <CardHeader
                  title="Knowledge — FAQs"
                  sub="The assistant matches questions to these answers"
                  action={
                    <Button variant="outline" size="sm" onClick={() => setCfg({ ...cfg, faqs: [...cfg.faqs, { q: "", a: "" }] })}>
                      <Plus className="size-4" /> Add FAQ
                    </Button>
                  }
                />
                <div className="space-y-3 px-5 pb-5">
                  {cfg.faqs.map((f, i) => (
                    <div key={i} className="space-y-2 rounded-2xl border border-line bg-surface-2 p-3.5">
                      <div className="flex items-center gap-2">
                        <Input value={f.q} placeholder="Question customers ask…" onChange={(e) => setCfg({ ...cfg, faqs: cfg.faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) })} />
                        <button onClick={() => setCfg({ ...cfg, faqs: cfg.faqs.filter((_, j) => j !== i) })} className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger" aria-label="Remove FAQ">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <Textarea value={f.a} placeholder="The answer it should give…" className="min-h-16" onChange={(e) => setCfg({ ...cfg, faqs: cfg.faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) })} />
                    </div>
                  ))}
                  {cfg.faqs.length === 0 && <p className="py-4 text-center text-xs text-muted">No FAQs yet — add the questions you answer every day.</p>}
                </div>
              </Card>

              <Card>
                <CardHeader title="It already knows" sub="Pulled automatically from your workspace" />
                <div className="flex flex-wrap gap-2 px-5 pb-5">
                  {system.website.services.map((s) => (
                    <span key={s.title} className="rounded-full bg-brand-soft px-3 py-1 text-[11px] font-medium text-brand-strong">
                      {s.title}{s.price ? ` · ${s.price}` : ""}
                    </span>
                  ))}
                  <span className="rounded-full bg-surface-3 px-3 py-1 text-[11px] text-muted">+ booking capture (name → phone → service → date)</span>
                </div>
              </Card>
            </>
          )}
        </div>

        <div className="lg:sticky lg:top-20">
          <p className="eyebrow mb-2 flex items-center gap-2"><Bot className="size-3.5" /> Live test — talk to it</p>
          {tenant && <ChatPanel key={savedTick} tenant={tenant} system={system} tall />}
          <p className="mt-2 text-[11px] text-muted">
            This exact assistant runs on your public website's chat bubble. Bookings it captures land in your Bookings inbox.
          </p>
        </div>
      </div>
    </>
  );
}
