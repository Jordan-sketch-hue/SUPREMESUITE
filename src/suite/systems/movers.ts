/* SYSTEM PACK — Movers & Storage CRM
   Quote-to-completion pipeline for moving crews, plus storage-unit upsell. */

import { Boxes, Truck } from "lucide-react";
import type { SystemDef } from "../types";
import {
  bundle,
  int,
  isoIn,
  makeBookings,
  makeCustomers,
  makeInventory,
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
  { id: "quote-requested", label: "Quote requested", tone: "neutral" as const },
  { id: "survey", label: "Survey", tone: "info" as const },
  { id: "quoted", label: "Quoted", tone: "info" as const },
  { id: "scheduled", label: "Scheduled", tone: "warn" as const },
  { id: "in-progress", label: "In progress", tone: "progress" as const },
  { id: "completed", label: "Completed", tone: "ok" as const, done: true },
  { id: "archived-storage", label: "In storage", tone: "neutral" as const, done: true },
];

const AREAS = ["Kingston", "Portmore", "Spanish Town", "Mandeville", "Montego Bay", "Ocho Rios", "May Pen"];
const TRUCKS = ["Box truck", "Flatbed", "Van"];
const HOME_SIZES = ["Studio", "1BR", "2BR", "3BR+", "Office"];

export const movers: SystemDef = {
  slug: "movers",
  name: "Movers & Storage CRM",
  shortName: "Movers",
  category: "operations",
  tagline: "From survey to settled-in — every move on one board.",
  description:
    "Run a moving company without the paper trail: quote requests land in your inbox, surveys turn into estimates, crews and trucks get scheduled, and storage units keep billing after the truck is parked.",
  icon: Boxes,
  accent: "#d97706",
  badge: "Popular",

  recordNoun: { singular: "Move", plural: "Moves" },
  recordIcon: Truck,

  modules: [
    "dashboard", "records", "calendar", "bookings", "customers", "messages",
    "inventory", "invoices", "loyalty", "reports", "chatbot", "voice", "website", "settings",
  ],

  pipeline: PIPELINE,

  fields: [
    { key: "origin", label: "Origin address", type: "address", group: "Route", showInTable: true, required: true },
    { key: "destination", label: "Destination address", type: "address", group: "Route", showInTable: true, required: true },
    { key: "moveDate", label: "Move date", type: "date", group: "Schedule", showInTable: true },
    { key: "crew", label: "Crew size", type: "number", group: "Schedule" },
    { key: "truck", label: "Truck", type: "select", options: TRUCKS, group: "Schedule" },
    { key: "storageUnit", label: "Storage unit", type: "text", group: "Storage", help: "Unit number if items are going into storage." },
    { key: "inventoryNotes", label: "Inventory notes", type: "textarea", group: "Details" },
    { key: "estimate", label: "Estimate (J$)", type: "money", group: "Pricing" },
  ],

  bookingFields: [
    { key: "service", label: "Service", type: "select", options: ["Local move", "Office relocation", "Islandwide move", "Storage unit"], required: true },
    { key: "from", label: "Moving from", type: "text", required: true, placeholder: "e.g. Mona, Kingston 6" },
    { key: "to", label: "Moving to", type: "text", required: true, placeholder: "e.g. Greater Portmore" },
    { key: "date", label: "Preferred date", type: "date", required: true },
    { key: "bedrooms", label: "Home size", type: "select", options: HOME_SIZES },
  ],

  kpis: [
    kpiActive("Active moves", PIPELINE),
    kpiNewBookings("New quote requests"),
    kpiRevenue("Collected (paid)"),
    kpiCustomers("Customers"),
  ],
  charts: [
    chartVolume("Moves booked", "moves"),
    chartRevenueTrend("Revenue collected"),
    chartPipelineSpread("Where moves are", PIPELINE),
  ],

  features: [
    "Quote-to-completion pipeline with survey and estimate stages",
    "Crew, truck and move-date scheduling on a shared calendar",
    "Storage-unit tracking that keeps billing after move day",
    "Packing-supply inventory with low-stock reorder alerts",
    "Public quote form wired straight into your inbox",
    "AI assistant that pre-quotes moves and books surveys 24/7",
  ],
  addOns: ["loyalty", "chatbot", "voice", "dashboards"],

  website: {
    style: "warm",
    heroEyebrow: "Movers & storage",
    heroTitle: "Moving day, minus the stress.",
    heroSubtitle: "Trained crews, padded trucks and climate storage — homes and offices moved across the island like the furniture is ours.",
    primaryCta: "Get a free quote",
    secondaryCta: "Our services",
    stats: [
      { value: "4,200+", label: "Moves completed" },
      { value: "4.9★", label: "Average rating" },
      { value: "120", label: "Storage units" },
    ],
    servicesTitle: "Moving & storage services",
    services: [
      { title: "Local moving", description: "Apartments and family homes moved within the parish — wrapped, lifted and set down where you point.", price: "from $18,000 JMD" },
      { title: "Office relocation", description: "Desks, servers and files moved over the weekend so Monday opens on time.", price: "from $60,000 JMD" },
      { title: "Packing service", description: "Our crew packs the whole house with boxes, wrap and labels included.", price: "from $12,000 JMD" },
      { title: "Climate storage", description: "Clean, dry, monitored units for a month or a year — short notice welcome.", price: "from $9,500 JMD/mo" },
    ],
    valueProps: [
      { title: "Survey first, surprise never", body: "We walk the property before we quote, so the price you accept is the price you pay." },
      { title: "Furniture treated like ours", body: "Blankets, shrink wrap and mattress covers on every job — beds disassembled and rebuilt." },
      { title: "Storage on your schedule", body: "Between leases or mid-renovation? Your things wait in a climate-controlled unit until you're ready." },
    ],
    testimonial: {
      quote: "Three bedrooms, two flights of stairs, zero scratches. They had us moved from Kingston to Mandeville and the beds rebuilt before dark.",
      name: "Karen Whyte",
      role: "Homeowner, Mandeville",
    },
    bookingTitle: "Get your free quote",
    bookingBlurb: "Tell us what's moving and where — we'll confirm a survey or send your estimate within one business day.",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(59),

  seed(ctx) {
    const customers = makeCustomers(ctx, 12, ["residential", "office", "storage"]);
    const records = makeRecords(ctx, customers, {
      prefix: "MOV",
      count: 18,
      stages: PIPELINE,
      weights: [2, 2, 2, 5, 2, 6, 1],
      titleFor: (rand) => `${pick(rand, HOME_SIZES)} move · ${pick(rand, AREAS)} → ${pick(rand, AREAS)}`,
      valueRange: [15000, 180000],
      fieldsFor: (rand) => ({
        origin: `${pick(rand, AREAS)}`,
        destination: `${pick(rand, AREAS)}`,
        moveDate: isoIn(ctx, int(rand, -3, 18)),
        crew: int(rand, 2, 6),
        truck: pick(rand, TRUCKS),
        storageUnit: rand() > 0.7 ? `Unit ${String.fromCharCode(65 + int(rand, 0, 3))}-${int(rand, 1, 40)}` : "",
      }),
    });
    return bundle({
      customers,
      records,
      bookings: makeBookings(ctx, 6, movers.bookingFields, ["Local move", "Office relocation", "Islandwide move", "Storage unit"]),
      invoices: makeInvoices(ctx, customers, 10, [15000, 180000]),
      messages: makeMessages(ctx, customers, 8, [
        "How much to move a 2-bedroom from Kingston to Portmore?",
        "Do you supply the boxes and bubble wrap, or do I buy them?",
        "Can the crew disassemble the beds and wardrobe?",
        "Is my move still confirmed for Saturday morning?",
        "Do you have climate-controlled storage for about three months?",
      ]),
      inventory: makeInventory(ctx, [
        { name: "Small moving box", category: "Boxes", unit: 220 },
        { name: "Medium moving box", category: "Boxes", unit: 350 },
        { name: "Large moving box", category: "Boxes", unit: 480 },
        { name: "Wardrobe box", category: "Boxes", unit: 1500 },
        { name: "Packing tape roll", category: "Packing", unit: 400 },
        { name: "Bubble wrap roll", category: "Packing", unit: 1200 },
        { name: "Mattress cover", category: "Protection", unit: 950 },
        { name: "Furniture blanket", category: "Protection", unit: 2500 },
      ]),
    });
  },
};
