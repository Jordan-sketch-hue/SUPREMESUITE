/* SYSTEM PACK — AI Chatbot Builder (website assistant that answers & books) */

import { Bot, MessageSquare } from "lucide-react";
import type { KpiDef, SystemDef } from "../types";
import {
  bundle,
  makeBookings,
  makeCustomers,
  makeMessages,
  makeRecords,
  pick,
} from "../lib/seed-kit";
import { chartPipelineSpread, chartVolume, kpiCustomers, kpiNewBookings, STD_PLANS } from "../lib/pack-kit";
import { Inbox, Zap } from "lucide-react";

const PIPELINE = [
  { id: "open", label: "Open", tone: "info" as const },
  { id: "bot-handled", label: "Handled by bot", tone: "progress" as const },
  { id: "handed-off", label: "Handed to human", tone: "warn" as const },
  { id: "resolved", label: "Resolved", tone: "ok" as const, done: true },
  { id: "missed", label: "Missed", tone: "danger" as const, done: true },
];

const TOPICS = ["Price question", "Booking request", "Opening hours", "Delivery zones", "Complaint", "Product availability"];

const kpiDeflection: KpiDef = {
  id: "deflection",
  label: "Handled without staff",
  icon: Zap,
  format: "percent",
  compute: (ctx) => {
    const total = ctx.records.length || 1;
    const bot = ctx.records.filter((r) => r.status === "bot-handled" || r.status === "resolved").length;
    return Math.round((bot / total) * 100);
  },
};
const kpiConversations: KpiDef = {
  id: "conversations",
  label: "Conversations",
  icon: Inbox,
  format: "number",
  compute: (ctx) => ctx.records.length,
};

export const chatbot: SystemDef = {
  slug: "chatbot",
  name: "AI Chatbot Builder",
  shortName: "AI Chatbot",
  category: "intelligence",
  tagline: "A receptionist that never sleeps, sells while you do.",
  description:
    "Train a branded AI assistant on your prices, hours and services. It answers instantly on your website, captures bookings with a human touch, and hands off to you only when it should.",
  icon: Bot,
  accent: "#8b5cf6",
  badge: "New",

  recordNoun: { singular: "Conversation", plural: "Conversations" },
  recordIcon: MessageSquare,

  modules: ["dashboard", "records", "customers", "messages", "bookings", "reports", "chatbot", "website", "settings"],

  pipeline: PIPELINE,

  fields: [
    { key: "topic", label: "Topic", type: "select", options: TOPICS, showInTable: true, group: "Conversation" },
    { key: "channel", label: "Channel", type: "select", options: ["Website widget", "WhatsApp", "Instagram DM"], showInTable: true, group: "Conversation" },
    { key: "transcript", label: "Transcript snippet", type: "textarea", group: "Conversation" },
    { key: "sentiment", label: "Sentiment", type: "select", options: ["Positive", "Neutral", "Frustrated"], group: "Quality" },
  ],

  bookingFields: [
    { key: "service", label: "I want the bot to", type: "select", options: ["Answer FAQs", "Capture bookings", "Quote prices", "All of it"], required: true },
    { key: "website", label: "Your website (if any)", type: "text", placeholder: "https://…" },
  ],

  kpis: [kpiConversations, kpiDeflection, kpiNewBookings("Bookings captured"), kpiCustomers("Contacts learned")],
  charts: [
    chartVolume("Conversations", "conversations"),
    chartPipelineSpread("Conversation outcomes", PIPELINE),
  ],

  features: [
    "Trained on YOUR prices, services, hours and policies",
    "Slot-filling booking capture (name → phone → service → date)",
    "Smart hand-off to a human when conversations need one",
    "Works on your Supreme Suite website out of the box",
    "Full transcripts and sentiment in your CRM",
    "Upgrade path to premium LLM brains (Claude) when you want it",
  ],
  addOns: ["voice", "dashboards"],

  website: {
    style: "tech",
    heroEyebrow: "AI for business",
    heroTitle: "Your best hire doesn't take lunch.",
    heroSubtitle: "An AI assistant trained on your business — answering, quoting and booking customers 24/7 on your website.",
    primaryCta: "Get my assistant",
    secondaryCta: "Try the live demo",
    stats: [
      { value: "24/7", label: "Always on" },
      { value: "<2s", label: "Reply time" },
      { value: "70%+", label: "Questions handled solo" },
    ],
    servicesTitle: "What it does",
    services: [
      { title: "Answers instantly", description: "Prices, hours, availability, policies — without you touching your phone.", price: "" },
      { title: "Books customers", description: "Collects name, number, service and date — straight into your CRM.", price: "" },
      { title: "Qualifies leads", description: "Filters tyre-kickers and flags hot leads for follow-up.", price: "" },
      { title: "Hands off gracefully", description: "Complex situations get routed to you with the full transcript.", price: "" },
    ],
    valueProps: [
      { title: "Set up in an afternoon", body: "Fill in your services and FAQs — the assistant is live on your site the same day." },
      { title: "Sounds like your brand", body: "Name it, brand it, tone it. Customers feel cared for, not processed." },
      { title: "Never miss midnight money", body: "A third of bookings happen after hours. Now they happen for you." },
    ],
    testimonial: {
      quote: "It booked four appointments the first weekend — two of them at 1 a.m. It paid for the year in a month.",
      name: "Alicia Palmer",
      role: "Spa owner",
    },
    bookingTitle: "Request your assistant",
    bookingBlurb: "Tell us what you want it to handle — we'll have a trained demo for you within 48 hours.",
    heroImage: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(39),

  seed(ctx) {
    const customers = makeCustomers(ctx, 12, ["lead", "customer", "after-hours"]);
    const records = makeRecords(ctx, customers, {
      prefix: "CNV",
      count: 24,
      stages: PIPELINE,
      weights: [3, 8, 3, 9, 1],
      titleFor: (rand) => pick(rand, TOPICS),
      fieldsFor: (rand) => ({
        topic: pick(rand, TOPICS),
        channel: pick(rand, ["Website widget", "WhatsApp", "Instagram DM"]),
        sentiment: pick(rand, ["Positive", "Positive", "Neutral", "Frustrated"]),
      }),
      withDue: false,
    });
    return bundle({
      customers,
      records,
      bookings: makeBookings(ctx, 7, chatbot.bookingFields, ["All of it", "Capture bookings"]),
      invoices: [],
      messages: makeMessages(ctx, customers, 10, [
        "What time do you open tomorrow?",
        "How much is delivery to Portmore?",
        "Can I book for Saturday morning?",
        "Do you have this in stock?",
      ]),
    });
  },
};
