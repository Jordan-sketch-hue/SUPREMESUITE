/* SYSTEM PACK — Restaurant & Reservations
   Kitchen order flow, table reservations and kitchen-stock inventory. */

import { ChefHat, UtensilsCrossed } from "lucide-react";
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
  kpiCustomers,
  kpiNewBookings,
  kpiRevenue,
  STD_PLANS,
} from "../lib/pack-kit";

const PIPELINE = [
  { id: "placed", label: "Placed", tone: "neutral" as const },
  { id: "preparing", label: "Preparing", tone: "progress" as const },
  { id: "ready", label: "Ready", tone: "warn" as const },
  { id: "served", label: "Served", tone: "ok" as const, done: true },
  { id: "delivered", label: "Delivered", tone: "ok" as const, done: true },
  { id: "cancelled", label: "Cancelled", tone: "danger" as const, done: true },
];

const ORDER_TYPES = ["Dine-in", "Takeout", "Delivery"];
const PAYMENTS = ["Cash", "Card", "Online"];
const DISHES = ["Escovitch snapper", "Oxtail & beans", "Jerk chicken plate", "Curry goat", "Brown stew fish", "Ackee & saltfish", "Lobster thermidor", "Rasta pasta"];

export const restaurant: SystemDef = {
  slug: "restaurant",
  name: "Restaurant & Reservations",
  shortName: "Restaurant",
  category: "operations",
  tagline: "Full tables, smooth service, a kitchen that never runs dry.",
  description:
    "Front-of-house and kitchen on one screen: reservations land in your inbox, orders move placed → preparing → served, kitchen stock counts itself down, and regulars earn their way to the chef's table.",
  icon: UtensilsCrossed,
  accent: "#dc2626",
  badge: "New",

  recordNoun: { singular: "Order", plural: "Orders" },
  recordIcon: ChefHat,

  modules: [
    "dashboard", "records", "calendar", "bookings", "customers", "messages",
    "inventory", "invoices", "loyalty", "reports", "chatbot", "voice", "website", "integrations", "settings",
  ],

  pipeline: PIPELINE,

  fields: [
    { key: "orderType", label: "Order type", type: "select", options: ORDER_TYPES, group: "Order", showInTable: true },
    { key: "table", label: "Table", type: "text", group: "Order" },
    { key: "items", label: "Items", type: "textarea", group: "Order", required: true },
    { key: "total", label: "Total (J$)", type: "money", group: "Payment", showInTable: true },
    { key: "payment", label: "Payment", type: "select", options: PAYMENTS, group: "Payment" },
  ],

  bookingFields: [
    { key: "service", label: "Service", type: "select", options: ["Table reservation", "Private event", "Catering quote"], required: true },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "time", label: "Time", type: "time", required: true },
    { key: "partySize", label: "Party size", type: "number", placeholder: "e.g. 4" },
  ],

  kpis: [
    kpiActive("Orders in play", PIPELINE),
    kpiNewBookings("New reservations"),
    kpiRevenue("Takings (paid)"),
    kpiCustomers("Guests"),
  ],
  charts: [
    chartVolume("Orders placed", "orders"),
    chartRevenueTrend("Daily takings"),
    chartPipelineSpread("Order flow", PIPELINE),
  ],

  features: [
    "Order pipeline from placed to served, takeout and delivery included",
    "Reservation requests from your website straight to the host stand",
    "Kitchen-stock inventory with low-level alerts before service",
    "Guest book with visit history and loyalty points",
    "Private-event and catering enquiries captured and tracked",
    "AI host that takes reservations and answers menu questions 24/7",
  ],
  addOns: ["loyalty", "chatbot", "voice", "dashboards"],

  website: {
    style: "luxe",
    heroEyebrow: "Island fine dining",
    heroTitle: "A table worth talking about.",
    heroSubtitle: "Modern Jamaican cooking — reef-fresh fish, slow oxtail and a cellar to match — served where the breeze finds the veranda.",
    primaryCta: "Reserve a table",
    secondaryCta: "Private dining",
    stats: [
      { value: "1,100+", label: "Covers / week" },
      { value: "7", label: "Chef awards" },
      { value: "12", label: "Years at the pass" },
    ],
    servicesTitle: "Dining experiences",
    services: [
      { title: "Dinner service", description: "An à la carte menu that moves with the catch and the season, Tuesday to Sunday.", price: "à la carte" },
      { title: "Private dining", description: "The glasshouse room seats fourteen — chef's menu, dedicated service, your wine list.", price: "from $9,500 JMD/head" },
      { title: "Catering", description: "Weddings, launches and villa dinners catered with the same kitchen standards.", price: "from $5,500 JMD/head" },
      { title: "Sunday brunch", description: "Ackee benedict, rum-spiked coffee and a steel-pan trio until mid-afternoon.", price: "$6,500 JMD/person" },
    ],
    valueProps: [
      { title: "The catch decides the menu", body: "Boats in the morning, blackboard by noon — what's fresh leads, everything else follows." },
      { title: "A room built for occasions", body: "Anniversaries, proposals and deals closed — tell us the moment and we'll set the stage." },
      { title: "Service that remembers you", body: "Your table, your bottle, how you take your fish — regulars are greeted by name." },
    ],
    testimonial: {
      quote: "We booked for a birthday and they treated it like a state visit — the escovitch alone is worth the drive from Kingston.",
      name: "Marcia Bennett",
      role: "Guest, celebrating 50th",
    },
    bookingTitle: "Reserve your table",
    bookingBlurb: "Tell us your date, time and party size — we'll confirm by message within the hour during service days.",
    heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(69),

  seed(ctx) {
    const customers = makeCustomers(ctx, 15, ["regular", "vip", "event"]);
    const records = makeRecords(ctx, customers, {
      prefix: "ORD",
      count: 24,
      stages: PIPELINE,
      weights: [3, 3, 2, 8, 6, 2],
      titleFor: (rand) => `${pick(rand, ORDER_TYPES)} · ${pick(rand, DISHES)}`,
      valueRange: [1500, 22000],
      fieldsFor: (rand) => {
        const orderType = pick(rand, ORDER_TYPES);
        return {
          orderType,
          table: orderType === "Dine-in" ? `Table ${int(rand, 1, 14)}` : "—",
          items: `${int(rand, 1, 3)}× ${pick(rand, DISHES)}, ${int(rand, 1, 2)}× ${pick(rand, DISHES)}`,
          total: int(rand, 1500, 22000),
          payment: pick(rand, PAYMENTS),
        };
      },
    });
    return bundle({
      customers,
      records,
      bookings: makeBookings(ctx, 8, restaurant.bookingFields, ["Table reservation", "Private event", "Catering quote"]),
      invoices: makeInvoices(ctx, customers, 10, [3500, 85000]),
      messages: makeMessages(ctx, customers, 10, [
        "Do you have a table for 6 this Friday around 7?",
        "Is the oxtail on tonight? We're driving in from Ocho Rios.",
        "Can I move my reservation from 6pm to 8pm?",
        "Do you have vegetarian options for one of our party?",
        "Can you cater a 40-person office lunch next month?",
        "Is the glasshouse room free for an anniversary on the 24th?",
      ]),
      inventory: makeInventory(ctx, [
        { name: "Whole snapper (kg)", category: "Protein", unit: 2800 },
        { name: "Oxtail (kg)", category: "Protein", unit: 3500 },
        { name: "Chicken case", category: "Protein", unit: 8500 },
        { name: "Scotch bonnet (kg)", category: "Produce", unit: 800 },
        { name: "Plantain (dozen)", category: "Produce", unit: 600 },
        { name: "Callaloo (bundle)", category: "Produce", unit: 300 },
        { name: "Rice 10kg", category: "Pantry", unit: 2400 },
        { name: "Jerk seasoning (gal)", category: "Pantry", unit: 4500 },
        { name: "Cooking oil 5L", category: "Pantry", unit: 3200 },
        { name: "Red Stripe case", category: "Beverage", unit: 6800 },
      ]),
    });
  },
};
