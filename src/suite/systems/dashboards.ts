/* SYSTEM PACK — Analytics Dashboards (business intelligence workspace) */

import { LayoutDashboard, BarChart3 } from "lucide-react";
import type { KpiDef, SystemDef } from "../types";
import {
  bundle,
  makeCustomers,
  makeMessages,
  makeRecords,
  pick,
} from "../lib/seed-kit";
import {
  chartPipelineSpread,
  chartVolume,
  kpiActive,
  kpiCompleted,
  STD_PLANS,
} from "../lib/pack-kit";
import { Activity, TrendingUp } from "lucide-react";

const PIPELINE = [
  { id: "draft", label: "Draft", tone: "neutral" as const },
  { id: "connected", label: "Data connected", tone: "info" as const },
  { id: "review", label: "In review", tone: "progress" as const },
  { id: "published", label: "Published", tone: "ok" as const, done: true },
  { id: "archived", label: "Archived", tone: "danger" as const, done: true },
];

const BOARDS = [
  "Sales performance", "Cash-flow tracker", "Marketing funnel", "Fleet utilization",
  "Inventory turns", "Customer retention", "Staff productivity", "Branch comparison",
];

const kpiDataPoints: KpiDef = {
  id: "datapoints",
  label: "Data points tracked",
  icon: Activity,
  format: "number",
  compute: (ctx) => ctx.records.length * 124 + ctx.customers.length * 36,
};
const kpiInsights: KpiDef = {
  id: "insights",
  label: "Insights this month",
  icon: TrendingUp,
  format: "number",
  compute: (ctx) => Math.max(3, Math.round(ctx.records.length * 0.6)),
};

export const dashboards: SystemDef = {
  slug: "dashboards",
  name: "Analytics Dashboards",
  shortName: "Dashboards",
  category: "intelligence",
  tagline: "Every number that matters, on one branded screen.",
  description:
    "A BI workspace for operators: build KPI dashboards from your CSV exports or any Supreme Suite system, publish them to your team, and walk into Monday already knowing the answer.",
  icon: LayoutDashboard,
  accent: "#0891b2",

  recordNoun: { singular: "Dashboard", plural: "Dashboards" },
  recordIcon: BarChart3,

  modules: ["dashboard", "records", "customers", "messages", "reports", "chatbot", "website", "integrations", "settings"],

  pipeline: PIPELINE,

  fields: [
    { key: "board", label: "Dashboard name", type: "text", required: true, showInTable: true, group: "Board" },
    { key: "source", label: "Data source", type: "select", options: ["CSV upload", "Supreme Suite CRM", "Google Sheets", "Manual entry"], showInTable: true, group: "Board" },
    { key: "refresh", label: "Refresh cadence", type: "select", options: ["Live", "Daily", "Weekly", "Monthly"], group: "Board" },
    { key: "audience", label: "Shared with", type: "text", group: "Sharing", placeholder: "e.g. Management team" },
    { key: "notes", label: "Notes", type: "textarea", group: "Sharing" },
  ],

  bookingFields: [
    { key: "service", label: "I need", type: "select", options: ["Dashboard build", "Data clean-up", "Monthly reporting", "Training session"], required: true },
    { key: "datasource", label: "Where does your data live?", type: "text", placeholder: "Excel, QuickBooks, a CRM…" },
    { key: "date", label: "Ideal kickoff", type: "date" },
  ],

  kpis: [kpiActive("Boards in progress", PIPELINE), kpiCompleted("Published boards", PIPELINE), kpiDataPoints, kpiInsights],
  charts: [
    chartVolume("Boards created", "boards"),
    chartPipelineSpread("Board status", PIPELINE),
  ],

  features: [
    "KPI cards, trends, funnels and comparisons — drag-simple",
    "Feed it CSV exports from anything (POS, bank, Excel)",
    "Native hookup to every Supreme Suite CRM",
    "Publish read-only boards to staff or partners",
    "Weekly digest message with the numbers that moved",
    "An analyst-grade setup without hiring an analyst",
  ],
  addOns: ["chatbot"],

  website: {
    style: "tech",
    heroEyebrow: "Business intelligence",
    heroTitle: "Stop guessing. Start seeing.",
    heroSubtitle: "We turn your scattered spreadsheets into live dashboards your whole team can read at a glance.",
    primaryCta: "Get my dashboard",
    secondaryCta: "See examples",
    stats: [
      { value: "120+", label: "Dashboards shipped" },
      { value: "6 hrs", label: "Saved per week, avg" },
      { value: "1 screen", label: "For every metric" },
    ],
    servicesTitle: "What we build",
    services: [
      { title: "Sales dashboard", description: "Revenue, pipeline, conversion and rep performance — live.", price: "from $25,000 JMD" },
      { title: "Cash-flow tracker", description: "Money in, money out, runway — no accountant required to read it.", price: "from $30,000 JMD" },
      { title: "Operations board", description: "Jobs, fleet, staffing and SLAs in one operational picture.", price: "from $35,000 JMD" },
      { title: "Investor pack", description: "Board-ready monthly reporting on autopilot.", price: "custom" },
    ],
    valueProps: [
      { title: "Your data, readable", body: "We design for the glance test: if it takes more than 5 seconds to understand, we redesign it." },
      { title: "No new software to learn", body: "Keep working how you work — we connect to the exports you already have." },
      { title: "Decisions, faster", body: "Teams using dashboards make pricing and staffing calls in days, not quarters." },
    ],
    testimonial: {
      quote: "First time in 9 years of business I could see my real margin per service. Changed our pricing in a week.",
      name: "Marlon Reid",
      role: "Auto-detailing chain owner",
    },
    bookingTitle: "Request a dashboard",
    bookingBlurb: "Tell us what you're tracking (or wish you were) — we'll scope it within a day.",
    heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(45),

  seed(ctx) {
    const customers = makeCustomers(ctx, 8, ["team", "exec", "partner"]);
    const records = makeRecords(ctx, customers, {
      prefix: "DSH",
      count: 14,
      stages: PIPELINE,
      weights: [2, 3, 3, 7, 1],
      titleFor: (rand) => pick(rand, BOARDS),
      fieldsFor: (rand) => ({
        board: pick(rand, BOARDS),
        source: pick(rand, ["CSV upload", "Supreme Suite CRM", "Google Sheets"]),
        refresh: pick(rand, ["Live", "Daily", "Weekly"]),
        audience: pick(rand, ["Management team", "Owners", "Whole staff"]),
      }),
      withDue: false,
    });
    return bundle({
      customers,
      records,
      bookings: [],
      invoices: [],
      messages: makeMessages(ctx, customers, 6, [
        "Can we add a branch-comparison view?",
        "The Friday digest is gold — can sales get it too?",
        "How do I export last month's board?",
        "Can we track no-shows on the ops board?",
      ]),
    });
  },
};
