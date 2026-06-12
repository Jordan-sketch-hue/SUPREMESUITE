"use client";

/* Messages — unified inbox grouped by customer, with templates + composer. */

import { useMemo, useState } from "react";
import { MessageSquarePlus, Send } from "lucide-react";
import type { Customer, Message } from "@/suite/types";
import { useCol } from "@/suite/lib/store";
import { sendMessage } from "@/suite/lib/ops";
import { relTime } from "@/suite/lib/format";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Avatar, Badge, Button, Card, cx, EmptyState, Select, Textarea } from "@/suite/components/ui";
import { useToast } from "@/suite/components/overlays";

const CHANNEL_TONE = { whatsapp: "ok", email: "info", sms: "progress", web: "neutral", voice: "warn" } as const;

export default function MessagesPage() {
  const { tenant, system } = useWorkspace();
  const toast = useToast();
  const messages = useCol<Message>(tenant?.id, "messages");
  const customers = useCol<Customer>(tenant?.id, "customers");
  const [activeName, setActiveName] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<Message["channel"]>("whatsapp");

  const threads = useMemo(() => {
    const map = new Map<string, Message[]>();
    [...messages]
      .sort((a, b) => a.at - b.at)
      .forEach((m) => {
        if (!map.has(m.customerName)) map.set(m.customerName, []);
        map.get(m.customerName)!.push(m);
      });
    return Array.from(map.entries()).sort((a, b) => (b[1].at(-1)?.at ?? 0) - (a[1].at(-1)?.at ?? 0));
  }, [messages]);

  const active = activeName ?? threads[0]?.[0] ?? null;
  const activeThread = threads.find(([name]) => name === active)?.[1] ?? [];
  const activeCustomer = customers.find((c) => c.name === active);

  const TEMPLATES = [
    `Hi! Confirming your ${system.recordNoun.singular.toLowerCase()} — see you soon. Reply here if anything changes.`,
    "Friendly reminder about your appointment tomorrow. Reply YES to confirm or call us to reschedule.",
    "Your invoice is ready. You can settle by card, transfer or cash — just let us know what works.",
    "Thanks for choosing us! You earned loyalty points on this visit — ask us your balance anytime.",
  ];

  const send = () => {
    if (!tenant || !active || !body.trim()) return;
    sendMessage(tenant, { customerId: activeCustomer?.id, customerName: active, body: body.trim(), channel });
    setBody("");
    toast(`Sent via ${channel}`);
  };

  return (
    <>
      <PageHead title="Messages" sub="WhatsApp, SMS, email and AI-assistant conversations in one inbox" />

      {threads.length === 0 ? (
        <EmptyState icon={<MessageSquarePlus />} title="No conversations yet" body="Messages from customers (and notes from your AI assistant) collect here." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          {/* Thread list */}
          <Card className="overflow-hidden">
            <div className="max-h-[70vh] divide-y divide-line-2 overflow-y-auto">
              {threads.map(([name, msgs]) => {
                const last = msgs[msgs.length - 1]!;
                const unread = msgs.filter((m) => !m.read && m.direction === "inbound").length;
                return (
                  <button
                    key={name}
                    onClick={() => setActiveName(name)}
                    className={cx("flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2", active === name && "bg-brand-softer")}
                  >
                    <Avatar name={name} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-semibold">{name}</span>
                        <span className="shrink-0 text-[10px] text-muted">{relTime(last.at)}</span>
                      </span>
                      <span className="block truncate text-[12px] text-muted">{last.body}</span>
                    </span>
                    {unread > 0 && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-fg">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Conversation */}
          <Card className="flex max-h-[70vh] flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
              {active && <Avatar name={active} />}
              <div>
                <p className="text-sm font-semibold">{active}</p>
                <p className="text-[11px] text-muted">{activeCustomer ? [activeCustomer.phone, activeCustomer.city].filter(Boolean).join(" · ") : "Contact"}</p>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-surface-2 px-5 py-4">
              {activeThread.map((m) => (
                <div key={m.id} className={cx("flex flex-col", m.direction === "outbound" ? "items-end" : m.direction === "note" ? "items-center" : "items-start")}>
                  {m.direction === "note" ? (
                    <p className="rounded-full bg-warn-soft px-3 py-1 text-[11px] text-warn">{m.body}</p>
                  ) : (
                    <div className={cx("max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed", m.direction === "outbound" ? "rounded-br-md bg-brand text-brand-fg" : "rounded-bl-md border border-line bg-surface")}>
                      {m.body}
                    </div>
                  )}
                  <span className="mt-1 flex items-center gap-1.5 text-[10px] text-muted">
                    <Badge tone={CHANNEL_TONE[m.channel]}>{m.channel}</Badge> {relTime(m.at)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-line bg-surface p-4">
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATES.map((t, i) => (
                  <button key={i} onClick={() => setBody(t)} className="rounded-full border border-line px-3 py-1 text-[11px] text-muted transition-colors hover:border-brand hover:text-brand-strong">
                    {["Confirmation", "Reminder", "Invoice", "Loyalty"][i]}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={`Message ${active ?? ""}…`} className="min-h-12 flex-1" />
                <Select value={channel} onChange={(e) => setChannel(e.target.value as Message["channel"])} className="w-32">
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </Select>
                <Button onClick={send} aria-label="Send message">
                  <Send className="size-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted">Sandbox sends are logged here; live WhatsApp/SMS/email delivery is a go-live wiring point (see /docs).</p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
