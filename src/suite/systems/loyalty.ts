/* SYSTEM PACK — Loyalty & Rewards (standalone or bolt-on to any system) */

import { Gift, Medal } from "lucide-react";
import type { SystemDef } from "../types";
import {
  bundle,
  makeBookings,
  makeCustomers,
  makeMessages,
  makeRecords,
  pick,
} from "../lib/seed-kit";
import {
  chartPipelineSpread,
  chartVolume,
  kpiActive,
  kpiCustomers,
  kpiNewBookings,
  STD_PLANS,
} from "../lib/pack-kit";
import { Users } from "lucide-react";
import type { KpiDef } from "../types";

const PIPELINE = [
  { id: "earned", label: "Reward earned", tone: "info" as const },
  { id: "notified", label: "Member notified", tone: "progress" as const },
  { id: "redeemed", label: "Redeemed", tone: "ok" as const, done: true },
  { id: "expired", label: "Expired", tone: "danger" as const, done: true },
];

const REWARDS = ["Free wash & vacuum", "10% off next order", "Free delivery", "Birthday treat", "Double-points weekend", "VIP early access"];

const kpiPointsIssued: KpiDef = {
  id: "points",
  label: "Points on books",
  icon: Medal,
  format: "number",
  compute: (ctx) => ctx.customers.reduce((s, c) => s + c.points, 0),
};
const kpiMembers: KpiDef = {
  id: "members",
  label: "Active members",
  icon: Users,
  format: "number",
  compute: (ctx) => ctx.customers.filter((c) => c.points > 0).length,
};

export const loyalty: SystemDef = {
  slug: "loyalty",
  name: "Loyalty & Rewards Platform",
  shortName: "Loyalty",
  category: "growth",
  tagline: "Turn one-time buyers into regulars on autopilot.",
  description:
    "Points, tiers and punch cards for any business — standalone, or bolted onto your Supreme Suite CRM. Issue points, run double-point campaigns, and watch repeat business climb.",
  icon: Gift,
  accent: "#ea580c",

  recordNoun: { singular: "Reward", plural: "Rewards" },
  recordIcon: Gift,

  modules: [
    "dashboard", "records", "customers", "messages", "loyalty", "reports", "chatbot", "website", "integrations", "settings",
  ],

  pipeline: PIPELINE,

  fields: [
    { key: "reward", label: "Reward", type: "select", options: REWARDS, required: true, showInTable: true, group: "Reward" },
    { key: "points-cost", label: "Points cost", type: "number", group: "Reward", showInTable: true },
    { key: "expiry", label: "Expires", type: "date", group: "Reward" },
    { key: "campaign", label: "Campaign", type: "text", group: "Campaign" },
    { key: "notes", label: "Notes", type: "textarea", group: "Campaign" },
  ],

  bookingFields: [
    { key: "service", label: "I want to", type: "select", options: ["Join the rewards club", "Check my points", "Redeem a reward"], required: true },
    { key: "memberId", label: "Member ID (if you have one)", type: "text" },
  ],

  kpis: [kpiMembers, kpiPointsIssued, kpiActive("Rewards in flight", PIPELINE), kpiNewBookings("Join requests")],
  charts: [
    chartVolume("Rewards issued", "rewards"),
    chartPipelineSpread("Reward status", PIPELINE),
  ],

  features: [
    "Points engine with automatic tier progression (Bronze → Silver → Gold)",
    "Digital punch cards — '10 visits, 1 free' without the soggy cardboard",
    "Campaigns: double-points weekends, birthday treats, win-backs",
    "Member messages on WhatsApp/SMS from templates",
    "Works standalone or as an add-on inside any Supreme Suite CRM",
    "Branded member sign-up page included",
  ],
  addOns: ["chatbot", "dashboards"],

  website: {
    style: "warm",
    heroEyebrow: "Rewards club",
    heroTitle: "Loyalty that actually pays.",
    heroSubtitle: "Earn points every visit, unlock tiers, and get treated like the regular you are.",
    primaryCta: "Join free",
    secondaryCta: "How it works",
    stats: [
      { value: "2,400+", label: "Members" },
      { value: "38%", label: "More repeat visits" },
      { value: "Free", label: "To join" },
    ],
    servicesTitle: "How members win",
    services: [
      { title: "Earn every visit", description: "Points land automatically on every purchase or booking.", price: "1 pt / $100" },
      { title: "Climb the tiers", description: "Bronze to Silver to Gold — each tier unlocks better perks.", price: "" },
      { title: "Punch-card treats", description: "Frequent services? Your 10th one is on the house.", price: "" },
      { title: "Birthday month", description: "A guaranteed treat every year, just for being you.", price: "" },
    ],
    valueProps: [
      { title: "Nothing to carry", body: "Your number is your card — points follow you automatically." },
      { title: "Real rewards", body: "Free services, discounts and early access — not junk coupons." },
      { title: "Fair and clear", body: "See your balance and history any time. No fine-print games." },
    ],
    testimonial: {
      quote: "I hit Gold in four months and now my car wash basically pays me back. Why doesn't every business do this?",
      name: "Devon Grant",
      role: "Gold member",
    },
    bookingTitle: "Join the club",
    bookingBlurb: "Sign up in 20 seconds — points start with your very next visit.",
    heroImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(29),

  seed(ctx) {
    const customers = makeCustomers(ctx, 20, ["gold", "silver", "bronze"]).map((c) => ({
      ...c,
      points: Math.floor(ctx.rand() * 620),
    }));
    const records = makeRecords(ctx, customers, {
      prefix: "RWD",
      count: 16,
      stages: PIPELINE,
      weights: [4, 3, 7, 1],
      titleFor: (rand) => pick(rand, REWARDS),
      valueRange: [500, 5000],
      fieldsFor: (rand) => ({
        reward: pick(rand, REWARDS),
        "points-cost": pick(rand, [100, 200, 350, 500]),
        campaign: pick(rand, ["Evergreen", "Birthday club", "Double-points weekend"]),
      }),
      withDue: false,
    });
    return bundle({
      customers,
      records,
      bookings: makeBookings(ctx, 6, loyalty.bookingFields, ["Join the rewards club"]),
      invoices: [],
      messages: makeMessages(ctx, customers, 8, [
        "How many points do I have?",
        "When does my reward expire?",
        "Can I gift my points to my sister?",
        "What does Gold tier get me?",
      ]),
    });
  },
};
