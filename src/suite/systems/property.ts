/* SYSTEM PACK — Property Management CRM
   Maintenance work orders, tenants & owners, and rent billing in one desk. */

import { Building2, Wrench } from "lucide-react";
import type { SystemDef } from "../types";
import {
  bundle,
  int,
  makeBookings,
  makeCustomers,
  makeInvoices,
  makeMessages,
  makeRecords,
  pick,
} from "../lib/seed-kit";
import {
  chartPipelineSpread,
  chartRevenueTrend,
  chartVolume,
  kpiActive,
  kpiCustomers,
  kpiNewBookings,
  kpiRevenue,
  STD_PLANS,
} from "../lib/pack-kit";

const PIPELINE = [
  { id: "reported", label: "Reported", tone: "neutral" as const },
  { id: "triaged", label: "Triaged", tone: "info" as const },
  { id: "vendor-assigned", label: "Vendor assigned", tone: "warn" as const },
  { id: "in-repair", label: "In repair", tone: "progress" as const },
  { id: "resolved", label: "Resolved", tone: "ok" as const, done: true },
  { id: "closed", label: "Closed", tone: "neutral" as const, done: true },
];

const CATEGORIES = ["Plumbing", "Electrical", "AC", "Roof", "Pest", "General"];
const PRIORITIES = ["Low", "Medium", "High", "Emergency"];
const PROPERTIES = ["Mona Heights #4", "Liguanea Court 2B", "Red Hills Rd #12", "Portmore Pines 7A", "Barbican Mews #3", "Constant Spring #9"];
const VENDORS = ["FixRight Plumbing", "Volt Electrical", "CoolBreeze AC", "Apex Roofing", "ProPest JA", "Handy Crew"];

export const property: SystemDef = {
  slug: "property",
  name: "Property Management CRM",
  shortName: "Property",
  category: "operations",
  tagline: "Rent in on time, repairs done right, owners kept happy.",
  description:
    "The property manager's back office: tenant maintenance requests become tracked work orders, vendors get assigned and chased, rent invoices go out on schedule, and owners see a portfolio that runs itself.",
  icon: Building2,
  accent: "#0d9488",

  recordNoun: { singular: "Work order", plural: "Work orders" },
  recordIcon: Wrench,

  modules: [
    "dashboard", "records", "calendar", "bookings", "customers", "messages",
    "invoices", "reports", "chatbot", "voice", "website", "integrations", "settings",
  ],

  pipeline: PIPELINE,

  fields: [
    { key: "unit", label: "Property / unit", type: "text", group: "Location", showInTable: true, required: true },
    { key: "category", label: "Category", type: "select", options: CATEGORIES, group: "Issue", showInTable: true },
    { key: "priority", label: "Priority", type: "select", options: PRIORITIES, group: "Issue", showInTable: true },
    { key: "vendor", label: "Vendor", type: "text", group: "Repair" },
    { key: "accessNotes", label: "Access notes", type: "textarea", group: "Repair", help: "Keys, alarm codes, tenant availability." },
    { key: "cost", label: "Repair cost (J$)", type: "money", group: "Billing" },
  ],

  bookingFields: [
    { key: "service", label: "Service", type: "select", options: ["Rental application", "Maintenance request", "Property viewing", "Management quote"], required: true },
    { key: "property", label: "Property", type: "text", required: true, placeholder: "e.g. Liguanea Court 2B" },
    { key: "preferredDate", label: "Preferred date", type: "date" },
    { key: "details", label: "Details", type: "textarea", placeholder: "Tell us what you need" },
  ],

  kpis: [
    kpiActive("Open work orders", PIPELINE),
    kpiNewBookings("New requests"),
    kpiRevenue("Rent collected"),
    kpiCustomers("Tenants & owners"),
  ],
  charts: [
    chartVolume("Work orders opened", "work orders"),
    chartRevenueTrend("Rent collected"),
    chartPipelineSpread("Work order status", PIPELINE),
  ],

  features: [
    "Maintenance pipeline from tenant report to vendor sign-off",
    "Tenant and owner profiles on one shared customer book",
    "Rent invoicing with paid and overdue states at a glance",
    "Priority flags so emergencies jump the queue",
    "Viewing and application requests straight from your website",
    "AI assistant that logs maintenance requests around the clock",
  ],
  addOns: ["chatbot", "voice", "dashboards"],

  website: {
    style: "clean",
    heroEyebrow: "Property management",
    heroTitle: "Your portfolio, professionally managed.",
    heroSubtitle: "Tenants placed, rent collected, repairs handled and owners reported to — across Kingston and beyond, without the 2am phone calls.",
    primaryCta: "Get a management quote",
    secondaryCta: "Our services",
    stats: [
      { value: "380+", label: "Units managed" },
      { value: "96%", label: "Occupancy" },
      { value: "6 hrs", label: "Avg maintenance response" },
    ],
    servicesTitle: "Management services",
    services: [
      { title: "Tenant placement", description: "Advertising, vetting, reference checks and lease signing — keys handed to tenants who pay.", price: "50% of first month's rent" },
      { title: "Rent collection", description: "Invoicing, reminders and receipts every month, with arrears chased professionally.", price: "8% of monthly rent" },
      { title: "Maintenance coordination", description: "Vetted plumbers, electricians and AC techs dispatched, supervised and signed off.", price: "from $6,500 JMD/call-out" },
      { title: "Inspections & reporting", description: "Quarterly walk-throughs with photo reports landing in every owner's inbox.", price: "from $8,000 JMD/quarter" },
    ],
    valueProps: [
      { title: "Owners stay informed", body: "Monthly statements and photo-backed inspection reports — you always know how your property is performing." },
      { title: "Vendors we'd use on our own homes", body: "A vetted trades bench with agreed rates, so repairs are fast, fair and done once." },
      { title: "Tenants who renew", body: "Responsive maintenance and clear communication keep good tenants in place for years." },
    ],
    testimonial: {
      quote: "I live overseas and own three units in Kingston. Rent lands on time, repairs are photographed, and I haven't taken a tenant call in two years.",
      name: "Andrea Gordon",
      role: "Owner, 3 units · Liguanea",
    },
    bookingTitle: "Request a quote or viewing",
    bookingBlurb: "Owners, tenants and applicants — tell us what you need and we'll respond within one business day.",
    heroImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(89),

  seed(ctx) {
    const customers = makeCustomers(ctx, 16, ["tenant", "owner"]);
    const records = makeRecords(ctx, customers, {
      prefix: "WO",
      count: 20,
      stages: PIPELINE,
      weights: [3, 2, 3, 3, 7, 2],
      titleFor: (rand) => `${pick(rand, CATEGORIES)} — ${pick(rand, PROPERTIES)}`,
      valueRange: [2500, 48000],
      fieldsFor: (rand) => ({
        unit: pick(rand, PROPERTIES),
        category: pick(rand, CATEGORIES),
        priority: pick(rand, PRIORITIES),
        vendor: rand() > 0.35 ? pick(rand, VENDORS) : "",
      }),
    });
    return bundle({
      customers,
      records,
      bookings: makeBookings(ctx, 6, property.bookingFields, ["Rental application", "Maintenance request", "Property viewing"]),
      invoices: makeInvoices(ctx, customers, 14, [45000, 220000]),
      messages: makeMessages(ctx, customers, 10, [
        "The AC in unit 2B stopped working last night — can someone come today?",
        "The kitchen tap is still dripping after the repair.",
        "When is the plumber coming? I'm home until 3pm.",
        "Do you have any 2-bedroom units available for July?",
        "Can I schedule a viewing for Saturday morning?",
        "My rent receipt for last month hasn't come through yet.",
      ]),
    });
  },
};
