/* SYSTEM PACK — Courier & Delivery Management
   The exemplar pack: every other vertical follows this exact shape. */

import { Truck, Package } from "lucide-react";
import type { SystemDef } from "../types";
import {
  bundle,
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
  { id: "requested", label: "Requested", tone: "neutral" as const },
  { id: "pickup", label: "Pickup scheduled", tone: "info" as const },
  { id: "in-transit", label: "In transit", tone: "progress" as const },
  { id: "out-for-delivery", label: "Out for delivery", tone: "warn" as const },
  { id: "delivered", label: "Delivered", tone: "ok" as const, done: true },
  { id: "failed", label: "Failed / returned", tone: "danger" as const, done: true },
];

const ZONES = ["Kingston", "Portmore", "Spanish Town", "Montego Bay", "Ocho Rios", "Mandeville"];
const PARCELS = ["Documents", "Small box", "Medium box", "Large box", "Barrel", "Pallet"];

export const courier: SystemDef = {
  slug: "courier",
  name: "Courier & Delivery CRM",
  shortName: "Courier",
  category: "operations",
  tagline: "Dispatch, track and get paid — islandwide.",
  description:
    "A complete delivery back office: booking intake, dispatch pipeline, driver assignment, proof-of-delivery notes, COD tracking and customer notifications — wrapped in your brand.",
  icon: Truck,
  accent: "#2563eb",
  badge: "Popular",

  recordNoun: { singular: "Shipment", plural: "Shipments" },
  recordIcon: Package,

  modules: [
    "dashboard", "records", "calendar", "bookings", "customers", "messages",
    "invoices", "loyalty", "reports", "chatbot", "voice", "website", "settings",
  ],

  pipeline: PIPELINE,

  fields: [
    { key: "pickup", label: "Pickup address", type: "address", group: "Route", showInTable: true, required: true },
    { key: "dropoff", label: "Drop-off address", type: "address", group: "Route", showInTable: true, required: true },
    { key: "zone", label: "Zone", type: "select", options: ZONES, group: "Route" },
    { key: "parcel", label: "Parcel type", type: "select", options: PARCELS, group: "Package", showInTable: true },
    { key: "weight", label: "Weight (lb)", type: "number", group: "Package" },
    { key: "cod", label: "Cash on delivery (J$)", type: "money", group: "Payment" },
    { key: "driver", label: "Driver", type: "text", group: "Dispatch" },
    { key: "notes", label: "Delivery notes", type: "textarea", group: "Dispatch" },
  ],

  bookingFields: [
    { key: "service", label: "Service", type: "select", options: ["Same-day delivery", "Next-day delivery", "Bearer errand", "Bulk / barrels"], required: true },
    { key: "pickup", label: "Pickup location", type: "text", required: true, placeholder: "e.g. Half Way Tree" },
    { key: "dropoff", label: "Drop-off location", type: "text", required: true, placeholder: "e.g. Portmore" },
    { key: "date", label: "Pickup date", type: "date", required: true },
    { key: "parcel", label: "Package size", type: "select", options: PARCELS },
  ],

  kpis: [
    kpiActive("Active shipments", PIPELINE),
    kpiNewBookings("New requests"),
    kpiRevenue("Collected (paid)"),
    kpiCustomers("Customers"),
  ],
  charts: [
    chartVolume("Shipments created", "shipments"),
    chartRevenueTrend(),
    chartPipelineSpread("Where shipments are", PIPELINE),
  ],

  features: [
    "Dispatch pipeline from request to proof-of-delivery",
    "Public booking page wired straight into your inbox",
    "COD + invoice tracking with paid/overdue states",
    "Driver assignment and delivery-day calendar",
    "WhatsApp-style customer notifications",
    "AI assistant that quotes and books pickups 24/7",
  ],
  addOns: ["loyalty", "chatbot", "voice", "dashboards"],

  website: {
    style: "bold",
    heroEyebrow: "Islandwide courier",
    heroTitle: "Fast. Reliable. Delivered.",
    heroSubtitle: "Same-day and next-day delivery across the island — packages, documents and errands handled like they're ours.",
    primaryCta: "Book a pickup",
    secondaryCta: "View services",
    stats: [
      { value: "60k+", label: "Parcels delivered" },
      { value: "98.4%", label: "On-time rate" },
      { value: "14", label: "Parishes covered" },
    ],
    servicesTitle: "Delivery services",
    services: [
      { title: "Same-day delivery", description: "Booked before noon, delivered before dark — across the corporate area.", price: "from $800 JMD" },
      { title: "Next-day islandwide", description: "Anywhere on the island by tomorrow evening, fully tracked.", price: "from $1,200 JMD" },
      { title: "Bearer errands", description: "Bank runs, pharmacy pickups, paperwork drops — your bearer on demand.", price: "from $1,000 JMD" },
      { title: "Bulk & barrels", description: "Pallets, barrels and commercial runs with loading assistance.", price: "custom" },
    ],
    valueProps: [
      { title: "Live status updates", body: "Every shipment moves through a tracked pipeline — you and your customer always know where it is." },
      { title: "COD handled properly", body: "Cash-on-delivery is logged, reconciled and visible, so nothing slips." },
      { title: "A real dispatch desk", body: "Drivers, zones and delivery windows managed in one calm screen." },
    ],
    testimonial: {
      quote: "They run deliveries like clockwork — my customers stopped asking 'where's my package' because the updates beat them to it.",
      name: "Renee Campbell",
      role: "Online boutique owner",
    },
    bookingTitle: "Book a pickup",
    bookingBlurb: "Tell us what's moving and we'll confirm your pickup window within the hour.",
    heroImage: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1605732562742-3023a888e56e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(49),

  seed(ctx) {
    const customers = makeCustomers(ctx, 14, ["business", "regular", "cod"]);
    const records = makeRecords(ctx, customers, {
      prefix: "SHP",
      count: 26,
      stages: PIPELINE,
      weights: [3, 4, 5, 3, 8, 1],
      titleFor: (rand) => `${pick(rand, PARCELS)} → ${pick(rand, ZONES)}`,
      valueRange: [800, 6500],
      fieldsFor: (rand) => ({
        pickup: `${pick(rand, ZONES)} pickup point`,
        dropoff: pick(rand, ZONES),
        zone: pick(rand, ZONES),
        parcel: pick(rand, PARCELS),
        weight: Math.ceil(rand() * 40),
      }),
    });
    return bundle({
      customers,
      records,
      bookings: makeBookings(ctx, 7, courier.bookingFields, ["Same-day delivery", "Next-day delivery", "Bearer errand"]),
      invoices: makeInvoices(ctx, customers, 12, [800, 9500]),
      messages: makeMessages(ctx, customers, 10, [
        "Is my package out for delivery yet?",
        "Can the driver call when he's close?",
        "Do you deliver to Negril on Saturdays?",
        "How much to move a barrel from Kingston to MoBay?",
      ]),
    });
  },
};
