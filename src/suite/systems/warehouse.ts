/* SYSTEM PACK — Warehouse & Inventory (WMS)
   Receive → pick → pack → ship order flow for 3PL and wholesale operations. */

import { ClipboardList, Warehouse as WarehouseIcon } from "lucide-react";
import type { SystemDef } from "../types";
import {
  bundle,
  int,
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
  kpiCompleted,
  kpiPipelineValue,
  kpiRevenue,
  STD_PLANS,
} from "../lib/pack-kit";

const PIPELINE = [
  { id: "received", label: "Received", tone: "neutral" as const },
  { id: "picking", label: "Picking", tone: "info" as const },
  { id: "packing", label: "Packing", tone: "progress" as const },
  { id: "ready", label: "Ready to ship", tone: "warn" as const },
  { id: "shipped", label: "Shipped", tone: "ok" as const, done: true },
  { id: "returned", label: "Returned", tone: "danger" as const, done: true },
];

const CHANNELS = ["Phone", "WhatsApp", "Website", "Walk-in"];
const CARRIERS = ["In-house", "Knutsford", "Zipmail", "TARA"];
const GOODS = ["Rice 25kg", "Cooking oil case", "Tissue case", "Spring water case", "Flour 25kg", "Sugar 50kg", "Detergent case", "Canned mackerel case"];

export const warehouse: SystemDef = {
  slug: "warehouse",
  name: "Warehouse & Inventory (WMS)",
  shortName: "Warehouse",
  category: "operations",
  tagline: "Every pallet accounted for, every order out on time.",
  description:
    "A lean WMS for 3PL and wholesale floors: orders flow received → picking → packing → shipped, stock levels update as you work, carriers get assigned, and billing follows the pallet — all under your brand.",
  icon: WarehouseIcon,
  accent: "#475569",

  recordNoun: { singular: "Order", plural: "Orders" },
  recordIcon: ClipboardList,

  modules: [
    "dashboard", "records", "calendar", "bookings", "customers", "messages",
    "inventory", "invoices", "reports", "chatbot", "website", "settings",
  ],

  pipeline: PIPELINE,

  fields: [
    { key: "po", label: "Customer PO", type: "text", group: "Order", showInTable: true, required: true },
    { key: "channel", label: "Channel", type: "select", options: CHANNELS, group: "Order" },
    { key: "items", label: "Items summary", type: "textarea", group: "Order" },
    { key: "pallets", label: "Pallet count", type: "number", group: "Handling", showInTable: true },
    { key: "carrier", label: "Carrier", type: "select", options: CARRIERS, group: "Handling", showInTable: true },
    { key: "total", label: "Order total (J$)", type: "money", group: "Billing" },
  ],

  bookingFields: [
    { key: "service", label: "Service", type: "select", options: ["Storage space", "Pick & pack", "Fulfillment", "Cross-docking"], required: true },
    { key: "company", label: "Company", type: "text", required: true, placeholder: "e.g. Island Wholesale Ltd" },
    { key: "pallets", label: "Pallets (approx.)", type: "number" },
    { key: "startDate", label: "Start date", type: "date", required: true },
  ],

  kpis: [
    kpiActive("Open orders", PIPELINE),
    kpiCompleted("Shipped", PIPELINE),
    kpiRevenue("Billed (paid)"),
    kpiPipelineValue("Order value in pipeline"),
  ],
  charts: [
    chartVolume("Orders received", "orders"),
    chartRevenueTrend("Billing collected"),
    chartPipelineSpread("Order pipeline", PIPELINE),
  ],

  features: [
    "Received → picked → packed → shipped order pipeline",
    "Live SKU inventory with reorder points and bin locations",
    "Carrier assignment across in-house and courier partners",
    "B2B client accounts with PO references on every order",
    "Storage and fulfillment quote requests from your website",
    "Accuracy and throughput reports your clients can trust",
  ],
  addOns: ["chatbot", "dashboards"],

  website: {
    style: "tech",
    heroEyebrow: "3PL & fulfillment",
    heroTitle: "Your stock. Picked, packed, shipped.",
    heroSubtitle: "Racked storage, same-day pick & pack and islandwide distribution — a fulfillment floor that runs like software.",
    primaryCta: "Request space",
    secondaryCta: "See capabilities",
    stats: [
      { value: "42,000", label: "Sq ft of racking" },
      { value: "9,500+", label: "Orders / month" },
      { value: "99.6%", label: "Pick accuracy" },
    ],
    servicesTitle: "Warehouse services",
    services: [
      { title: "Palletized storage", description: "Clean, secure, camera-monitored racking with in/out logs on every pallet.", price: "from $4,500 JMD/pallet/mo" },
      { title: "Pick & pack", description: "Orders picked against your live stock and packed to your spec, same day.", price: "from $250 JMD/order" },
      { title: "E-commerce fulfillment", description: "Plug your store in — we hold the stock, pack the orders and hand them to the carrier.", price: "from $25,000 JMD/mo" },
      { title: "Islandwide distribution", description: "Scheduled runs to every parish via our fleet and courier partners.", price: "custom" },
    ],
    valueProps: [
      { title: "Stock you can see", body: "Live counts, reorder alerts and bin locations — no more 'let me check the floor and call you back'." },
      { title: "Cut-off you can plan around", body: "Orders in by 11am ship the same day. Your customers learn to rely on it." },
      { title: "One clean invoice", body: "Storage, handling and freight reconciled per pallet and per order — finance-team friendly." },
    ],
    testimonial: {
      quote: "We handed them our whole back room. Stock-outs stopped, our delivery complaints disappeared, and I got my Saturdays back.",
      name: "Damion Reid",
      role: "Director, Island Wholesale Ltd",
    },
    bookingTitle: "Request storage or fulfillment",
    bookingBlurb: "Tell us your volumes and start date — we'll respond with availability and a rate card within one business day.",
    heroImage: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(79),

  seed(ctx) {
    const customers = makeCustomers(ctx, 10, ["b2b", "distributor", "retail-chain"]);
    const records = makeRecords(ctx, customers, {
      prefix: "ORD",
      count: 22,
      stages: PIPELINE,
      weights: [4, 4, 3, 3, 7, 1],
      titleFor: (rand) => `${pick(rand, GOODS)} × ${int(rand, 5, 60)} cases`,
      valueRange: [8000, 250000],
      fieldsFor: (rand) => ({
        po: `PO-${int(rand, 1000, 9899)}`,
        channel: pick(rand, CHANNELS),
        items: `${pick(rand, GOODS)} × ${int(rand, 4, 40)}, ${pick(rand, GOODS)} × ${int(rand, 2, 20)}`,
        pallets: int(rand, 1, 8),
        carrier: pick(rand, CARRIERS),
      }),
    });
    return bundle({
      customers,
      records,
      bookings: makeBookings(ctx, 5, warehouse.bookingFields, ["Storage space", "Pick & pack", "Fulfillment"]),
      invoices: makeInvoices(ctx, customers, 12, [8000, 250000]),
      messages: makeMessages(ctx, customers, 8, [
        "Can you confirm stock on the rice 25kg before we send the PO?",
        "When will PO-4471 ship? Our Mandeville branch is waiting.",
        "What's the cut-off for same-day dispatch?",
        "Do you handle returns coming back from our retail locations?",
        "We need 6 more pallet spaces from the 1st — possible?",
      ]),
      inventory: makeInventory(ctx, [
        { name: "Rice 25kg", category: "Dry goods", unit: 5500 },
        { name: "Cooking oil case", category: "Dry goods", unit: 8200 },
        { name: "Flour 25kg", category: "Dry goods", unit: 4800 },
        { name: "Sugar 50kg", category: "Dry goods", unit: 7500 },
        { name: "Cornmeal 25kg", category: "Dry goods", unit: 3900 },
        { name: "Spring water case", category: "Beverages", unit: 1100 },
        { name: "Juice case", category: "Beverages", unit: 2600 },
        { name: "Tissue case", category: "Household", unit: 4200 },
        { name: "Detergent case", category: "Household", unit: 6400 },
        { name: "Canned mackerel case", category: "Canned", unit: 5200 },
        { name: "Canned beans case", category: "Canned", unit: 4900 },
        { name: "Corned beef case", category: "Canned", unit: 9800 },
      ]),
    });
  },
};
