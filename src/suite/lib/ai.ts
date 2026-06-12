/* ============================================================================
   AI BRAIN — powers both the chatbot widget and the voice agent.
   A deterministic intent engine with slot-filling booking capture: it works
   offline, free, instantly — and can be upgraded to the Vercel AI Gateway by
   swapping `replyFor` (wiring point documented in DOCS/GO-LIVE.md).
   Pure functions ⇒ directly testable by the self-check workflows.
============================================================================ */

import type { SystemDef, Tenant, Booking } from "../types";
import { uid } from "./ids";

export interface BotFaq {
  q: string;
  a: string;
}

export interface BotConfig {
  assistantName: string;
  greeting: string;
  hours: string;
  location: string;
  faqs: BotFaq[];
  /** Extra knowledge the owner types in free-form. */
  notes: string;
}

export function defaultBotConfig(tenant: Tenant | null, system: SystemDef): BotConfig {
  const biz = tenant?.businessName ?? system.name;
  return {
    assistantName: "Ava",
    greeting: `Hi! I'm Ava, the virtual assistant for ${biz}. I can answer questions, share prices, and book you in — how can I help today?`,
    hours: "Mon–Sat, 9:00am – 6:00pm",
    location: tenant?.contact.city || "Kingston, Jamaica",
    faqs: [
      { q: "How do I pay?", a: "We accept card, bank transfer and cash on delivery where applicable." },
      { q: "How fast do you respond?", a: "We typically confirm requests within a business day — usually much faster." },
    ],
    notes: "",
  };
}

/* ---- conversation state ------------------------------------------------ */

export type BookingSlot = "name" | "phone" | "service" | "date" | "confirm";

export interface ChatState {
  mode: "idle" | "booking";
  slot?: BookingSlot;
  draft: { name?: string; phone?: string; service?: string; date?: string };
}

export const initialChatState: ChatState = { mode: "idle", draft: {} };

export interface BrainContext {
  tenant: Tenant | null;
  system: SystemDef;
  cfg: BotConfig;
  services: string[];
}

export interface BrainReply {
  text: string;
  state: ChatState;
  /** Set when the slot-filling flow completes — caller persists it. */
  booking?: Omit<Booking, "tenantId">;
  quickReplies?: string[];
}

const BOOK_WORDS = /\b(book|appointment|schedule|reserve|quote|pick ?up|order|sign ?up|enroll|deliver)\b/i;
const PRICE_WORDS = /\b(price|cost|how much|rate|fee|charge)\b/i;
const HOURS_WORDS = /\b(hours|open|close|when.*(open|available)|working)\b/i;
const WHERE_WORDS = /\b(where|location|address|located|find you)\b/i;
const HUMAN_WORDS = /\b(human|agent|person|someone|talk to|call me)\b/i;
const GREET_WORDS = /^(hi|hey|hello|good (morning|afternoon|evening)|yo|wha+'?g|whats? ?up)\b/i;

function looksLikePhone(s: string): boolean {
  return /(\d[\s\-.()]*){7,}/.test(s);
}
function looksLikeDate(s: string): boolean {
  return /\b(today|tomorrow|mon|tue|wed|thu|fri|sat|sun|next week|\d{1,2}(st|nd|rd|th)?|\d{4}-\d{2}-\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(s);
}

export function replyFor(state: ChatState, raw: string, ctx: BrainContext): BrainReply {
  const input = raw.trim();
  const biz = ctx.tenant?.businessName ?? ctx.system.name;

  /* --- slot-filling booking flow --- */
  if (state.mode === "booking") {
    const draft = { ...state.draft };
    switch (state.slot) {
      case "name":
        draft.name = input.replace(/^(i'?m|my name is|it'?s)\s+/i, "").trim() || "Guest";
        return {
          text: `Nice to meet you, ${draft.name.split(" ")[0]}! What's the best phone number to reach you on?`,
          state: { mode: "booking", slot: "phone", draft },
        };
      case "phone": {
        if (!looksLikePhone(input))
          return { text: "That doesn't look like a phone number — could you share digits like (876) 555-0123?", state };
        draft.phone = input;
        const opts = ctx.services.slice(0, 4);
        return {
          text: `Got it. Which service do you need?`,
          state: { mode: "booking", slot: "service", draft },
          quickReplies: opts,
        };
      }
      case "service":
        draft.service = input;
        return {
          text: `Great choice. What date works for you? (e.g. "tomorrow", "Friday", or 2026-06-20)`,
          state: { mode: "booking", slot: "date", draft },
        };
      case "date": {
        if (!looksLikeDate(input))
          return { text: `No rush — just tell me a day like "tomorrow" or "Friday".`, state };
        draft.date = input;
        return {
          text: `Perfect — booking ${draft.service} for ${draft.name}, ${draft.date}, phone ${draft.phone}. Shall I confirm? (yes/no)`,
          state: { mode: "booking", slot: "confirm", draft },
          quickReplies: ["Yes, confirm", "No, start over"],
        };
      }
      case "confirm": {
        if (/^(y|yes|yeah|yep|confirm|correct)/i.test(input)) {
          const booking: Omit<Booking, "tenantId"> = {
            id: uid(),
            system: ctx.system.slug,
            customerName: draft.name ?? "Guest",
            phone: draft.phone,
            fields: { service: draft.service, date: draft.date },
            note: "Captured by AI assistant",
            status: "new",
            source: "widget",
            requestedAt: Date.now(),
          };
          return {
            text: `You're booked in! 🎉 ${biz} will confirm shortly on ${draft.phone}. Anything else I can help with?`,
            state: initialChatState,
            booking,
          };
        }
        return { text: "No problem — let's scrap that. What would you like to do instead?", state: initialChatState };
      }
    }
  }

  /* --- intent routing --- */
  if (BOOK_WORDS.test(input)) {
    return {
      text: `I can set that up right now. What's your name?`,
      state: { mode: "booking", slot: "name", draft: {} },
    };
  }
  if (PRICE_WORDS.test(input)) {
    const lines = ctx.system.website.services
      .slice(0, 4)
      .map((s) => `• ${s.title}${s.price ? ` — ${s.price}` : ""}`)
      .join("\n");
    return {
      text: `Here's our line-up:\n${lines}\n\nWant me to book one of these for you?`,
      state,
      quickReplies: ["Book now", "Opening hours"],
    };
  }
  if (HOURS_WORDS.test(input)) return { text: `We're open ${ctx.cfg.hours}.`, state, quickReplies: ["Book now"] };
  if (WHERE_WORDS.test(input)) return { text: `You'll find us in ${ctx.cfg.location}. Need directions or a booking?`, state };
  if (HUMAN_WORDS.test(input))
    return {
      text: `Of course — I've flagged this conversation for the ${biz} team and someone will follow up. You can also leave your number and I'll pass it along.`,
      state,
    };

  const faq = ctx.cfg.faqs.find((f) => {
    const words = f.q.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const inp = input.toLowerCase();
    return words.some((w) => inp.includes(w));
  });
  if (faq) return { text: faq.a, state, quickReplies: ["Book now"] };

  if (GREET_WORDS.test(input))
    return { text: ctx.cfg.greeting, state, quickReplies: ["Prices", "Book now", "Opening hours"] };

  return {
    text: `Great question — I'll make sure the ${biz} team sees it. Meanwhile I can share prices, hours, or get you booked in. What would you like?`,
    state,
    quickReplies: ["Prices", "Book now", "Talk to a human"],
  };
}

/* ---- voice helpers ------------------------------------------------------ */

export function speechSupport(): { stt: boolean; tts: boolean } {
  if (typeof window === "undefined") return { stt: false, tts: false };
  const w = window as any;
  return {
    stt: !!(w.SpeechRecognition || w.webkitSpeechRecognition),
    tts: typeof window.speechSynthesis !== "undefined",
  };
}

export function speak(text: string, voiceName?: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[•*#_]/g, ""));
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find((x) => x.name === voiceName) ?? voices.find((x) => x.lang.startsWith("en"));
  if (v) u.voice = v;
  u.rate = 1.02;
  u.pitch = 1;
  window.speechSynthesis.speak(u);
}
