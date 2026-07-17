/* SYSTEM PACK — AI Voice Agent (in-browser voice receptionist) */

import { Mic, AudioLines } from "lucide-react";
import type { KpiDef, SystemDef } from "../types";
import {
  bundle,
  makeBookings,
  makeCustomers,
  makeMessages,
  makeRecords,
  pick,
  int,
} from "../lib/seed-kit";
import { chartPipelineSpread, chartVolume, kpiCustomers, kpiNewBookings, STD_PLANS } from "../lib/pack-kit";
import { PhoneCall, Timer } from "lucide-react";

const PIPELINE = [
  { id: "ringing", label: "Incoming", tone: "info" as const },
  { id: "answered", label: "Agent answered", tone: "progress" as const },
  { id: "booked", label: "Booked / handled", tone: "ok" as const, done: true },
  { id: "voicemail", label: "Message taken", tone: "warn" as const, done: true },
  { id: "missed", label: "Missed", tone: "danger" as const, done: true },
];

const CALL_REASONS = ["Booking request", "Price check", "Opening hours", "Directions", "Reschedule", "General question"];

const kpiCalls: KpiDef = {
  id: "calls",
  label: "Calls this period",
  icon: PhoneCall,
  format: "number",
  compute: (ctx) => ctx.records.length,
};
const kpiAvgCall: KpiDef = {
  id: "avg-call",
  label: "Avg call length",
  icon: Timer,
  format: "duration",
  compute: (ctx) => {
    const secs = ctx.records.map((r) => Number(r.fields["duration-sec"] ?? 90));
    return secs.length ? Math.round(secs.reduce((a, b) => a + b, 0) / secs.length) : 0;
  },
};

export const voice: SystemDef = {
  slug: "voice",
  name: "AI Voice Agent",
  shortName: "Voice Agent",
  category: "intelligence",
  tagline: "Answers the phone, books the job, sends you the summary.",
  description:
    "A voice receptionist that greets callers, answers your common questions out loud and captures bookings — with every call logged and summarized in your CRM. Try it live in your browser right now.",
  icon: Mic,
  accent: "#16a34a",
  badge: "New",

  recordNoun: { singular: "Call", plural: "Calls" },
  recordIcon: AudioLines,

  modules: ["dashboard", "records", "customers", "messages", "bookings", "reports", "voice", "chatbot", "website", "integrations", "settings"],

  pipeline: PIPELINE,

  fields: [
    { key: "reason", label: "Call reason", type: "select", options: CALL_REASONS, showInTable: true, group: "Call" },
    { key: "duration-sec", label: "Duration (sec)", type: "number", showInTable: true, group: "Call" },
    { key: "summary", label: "AI summary", type: "textarea", group: "Call" },
    { key: "callback", label: "Needs callback", type: "boolean", group: "Follow-up" },
  ],

  bookingFields: [
    { key: "service", label: "I want the agent to", type: "select", options: ["Answer after-hours calls", "Be my full receptionist", "Overflow when we're busy"], required: true },
    { key: "volume", label: "Calls per day (roughly)", type: "number" },
  ],

  kpis: [kpiCalls, kpiNewBookings("Bookings from calls"), kpiAvgCall, kpiCustomers("Callers known")],
  charts: [
    chartVolume("Calls handled", "calls"),
    chartPipelineSpread("Call outcomes", PIPELINE),
  ],

  features: [
    "Natural voice conversations — try it in your browser, no install",
    "Answers prices, hours and FAQs out loud, in your brand voice",
    "Captures bookings mid-call straight into your pipeline",
    "Every call logged with an AI summary and follow-up flag",
    "Voicemail capture when a human is truly needed",
    "Upgrade path to real phone-line integration (Twilio) when ready",
  ],
  addOns: ["chatbot", "dashboards"],

  website: {
    style: "bold",
    heroEyebrow: "AI receptionist",
    heroTitle: "Never miss another call.",
    heroSubtitle: "Missed calls are missed money. Our AI voice agent answers every one — politely, instantly, in your brand's voice.",
    primaryCta: "Hear it live",
    secondaryCta: "How it works",
    stats: [
      { value: "100%", label: "Calls answered" },
      { value: "62%", label: "Of calls fully handled" },
      { value: "0", label: "Hold music, ever" },
    ],
    servicesTitle: "On every call, it can…",
    services: [
      { title: "Greet & answer", description: "Hours, prices, directions, availability — spoken naturally.", price: "" },
      { title: "Book appointments", description: "Name, number, service and time captured conversationally.", price: "" },
      { title: "Take messages", description: "Clean voicemail summaries delivered to your inbox, not a tape.", price: "" },
      { title: "Flag urgencies", description: "Emergencies and VIPs get routed to your cell immediately.", price: "" },
    ],
    valueProps: [
      { title: "Your voice, your rules", body: "Pick the voice, the greeting and exactly what it's allowed to promise." },
      { title: "See every conversation", body: "Calls become searchable summaries in your CRM — not memories." },
      { title: "Costs less than missed jobs", body: "One saved booking a week typically covers the subscription." },
    ],
    testimonial: {
      quote: "We're a two-man crew — we physically can't answer mid-job. Now every call gets answered and the bookings just appear.",
      name: "Kemar Stewart",
      role: "Plumbing contractor",
    },
    bookingTitle: "Set up my voice agent",
    bookingBlurb: "Tell us your call volume and what it should handle — demo within 48 hours.",
    heroImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(59),

  seed(ctx) {
    const customers = makeCustomers(ctx, 12, ["caller", "regular", "vip"]);
    const records = makeRecords(ctx, customers, {
      prefix: "CALL",
      count: 26,
      stages: PIPELINE,
      weights: [2, 4, 11, 5, 2],
      titleFor: (rand) => pick(rand, CALL_REASONS),
      fieldsFor: (rand) => ({
        reason: pick(rand, CALL_REASONS),
        "duration-sec": int(rand, 35, 320),
        summary: pick(rand, [
          "Caller asked about Saturday availability; agent offered 10am, caller confirmed.",
          "Price check on standard service; quoted from price list; caller will call back.",
          "Reschedule from Tuesday to Thursday; calendar updated.",
          "Asked for directions; sent SMS with map link.",
        ]),
        callback: rand() > 0.8,
      }),
      withDue: false,
    });
    return bundle({
      customers,
      records,
      bookings: makeBookings(ctx, 6, voice.bookingFields, ["Answer after-hours calls"]),
      invoices: [],
      messages: makeMessages(ctx, customers, 8, [
        "Voicemail: please call me back about a big job.",
        "Missed your call — what time suits?",
        "The agent booked me for Thursday, just confirming.",
        "Can the agent speak patois? Asking for my granny.",
      ]),
    });
  },
};
