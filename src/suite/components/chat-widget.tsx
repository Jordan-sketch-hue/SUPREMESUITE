"use client";

/* CHAT WIDGET — the tenant's branded AI assistant.
   Used on the public site (floating bubble) and inside the app (test console).
   Replies come from lib/ai replyFor(); completed slot-fills persist a real
   Booking through the same ops path the rest of the platform uses. */

import { Bot, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SystemDef, Tenant } from "../types";
import { defaultBotConfig, initialChatState, replyFor, type BotConfig, type ChatState } from "../lib/ai";
import { submitBooking, sendMessage } from "../lib/ops";
import { useDoc } from "../lib/store";
import { Button, cx, Input } from "./ui";

interface Bubble {
  from: "bot" | "user";
  text: string;
  quick?: string[];
}

export function ChatPanel({
  tenant,
  system,
  tall,
  onActivity,
}: {
  tenant: Tenant;
  system: SystemDef;
  tall?: boolean;
  onActivity?: () => void;
}) {
  const fallbackCfg = defaultBotConfig(tenant, system);
  const stored = useDoc<BotConfig | null>(tenant.id, "botcfg", null);
  const cfg = stored ?? fallbackCfg;
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [state, setState] = useState<ChatState>(initialChatState);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setBubbles([{ from: "bot", text: cfg.greeting, quick: ["Prices", "Book now", "Opening hours"] }]);
    setState(initialChatState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles, typing]);

  const say = (text: string) => {
    const msg = text.trim();
    if (!msg) return;
    onActivity?.();
    setBubbles((b) => [...b, { from: "user", text: msg }]);
    setInput("");
    setTyping(true);
    const ctx = { tenant, system, cfg, services: system.website.services.map((s) => s.title) };
    const r = replyFor(state, msg, ctx);
    setTimeout(() => {
      setState(r.state);
      setBubbles((b) => [...b, { from: "bot", text: r.text, quick: r.quickReplies }]);
      setTyping(false);
      if (r.booking) {
        submitBooking(tenant.id, system.slug, { ...r.booking, source: "widget" });
        sendMessage(tenant, {
          customerName: r.booking.customerName,
          body: `AI assistant captured a booking: ${r.booking.fields.service ?? ""} — ${r.booking.fields.date ?? ""}`,
          channel: "web",
          direction: "note",
        });
      }
    }, 420 + Math.random() * 380);
  };

  return (
    <div className={cx("flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-pop", tall ? "h-[560px]" : "h-[460px]")}>
      <div className="flex items-center gap-2.5 bg-brand px-4 py-3 text-brand-fg">
        <span className="flex size-8 items-center justify-center rounded-full bg-white/20">
          <Bot className="size-4" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">{cfg.assistantName} — {tenant.businessName}</p>
          <p className="text-[10px] opacity-80">AI assistant · replies instantly</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-surface-2 px-3 py-4">
        {bubbles.map((b, i) => (
          <div key={i} className={cx("flex flex-col", b.from === "user" ? "items-end" : "items-start")}>
            <div
              className={cx(
                "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                b.from === "user" ? "rounded-br-md bg-brand text-brand-fg" : "rounded-bl-md border border-line bg-surface",
              )}
            >
              {b.text}
            </div>
            {b.from === "bot" && b.quick?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {b.quick.map((q) => (
                  <button
                    key={q}
                    onClick={() => say(q)}
                    className="rounded-full border border-brand-ring bg-surface px-3 py-1 text-[11px] font-medium text-brand-strong transition-colors hover:bg-brand-soft"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {typing && (
          <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3 w-fit">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted-2" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
      </div>

      <form
        className="flex items-center gap-2 border-t border-line bg-surface p-3"
        onSubmit={(e) => {
          e.preventDefault();
          say(input);
        }}
      >
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" className="flex-1" aria-label="Chat message" />
        <Button type="submit" size="md" aria-label="Send">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}

/** Floating bubble for the public website. */
export function ChatBubble({ tenant, system }: { tenant: Tenant; system: SystemDef }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Chat with us"}
        className="fixed bottom-5 right-5 z-[70] flex size-14 items-center justify-center rounded-full bg-brand text-brand-fg shadow-pop transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
      {open && (
        <div className="fixed bottom-24 right-5 z-[70] w-[min(380px,calc(100vw-2.5rem))]">
          <ChatPanel tenant={tenant} system={system} />
        </div>
      )}
    </>
  );
}
