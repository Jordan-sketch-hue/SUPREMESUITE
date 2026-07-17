/* SYSTEM PACK — Beauty, Nails & Salon Booking */

import { Sparkles, CalendarCheck } from "lucide-react";
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
  chartBookingsTrend,
  chartPipelineSpread,
  chartVolume,
  kpiActive,
  kpiCustomers,
  kpiNewBookings,
  kpiRevenue,
  STD_PLANS,
} from "../lib/pack-kit";

const PIPELINE = [
  { id: "requested", label: "Requested", tone: "neutral" as const },
  { id: "deposit", label: "Deposit paid", tone: "info" as const },
  { id: "confirmed", label: "Confirmed", tone: "progress" as const },
  { id: "done", label: "Done & gorgeous", tone: "ok" as const, done: true },
  { id: "no-show", label: "No-show", tone: "danger" as const, done: true },
];

const SERVICES = ["Gel full set", "Acrylic full set", "Refill", "Pedicure deluxe", "Lash set", "Brow lamination", "Silk press", "Loc retwist"];

export const salon: SystemDef = {
  slug: "salon",
  name: "Beauty & Salon Booking CRM",
  shortName: "Beauty",
  category: "booking",
  tagline: "Booked, deposited, and never ghosted again.",
  description:
    "Built for nail techs, lash artists, barbers and stylists: deposit-first booking, a no-show-proof pipeline, client history with photos of past sets, loyalty punch cards and an AI receptionist that books while you work.",
  icon: Sparkles,
  accent: "#db2777",
  badge: "Flagship",

  recordNoun: { singular: "Appointment", plural: "Appointments" },
  recordIcon: CalendarCheck,

  modules: [
    "dashboard", "records", "calendar", "bookings", "customers", "messages",
    "invoices", "loyalty", "reports", "chatbot", "voice", "website", "integrations", "settings",
  ],

  pipeline: PIPELINE,

  fields: [
    { key: "service", label: "Service", type: "select", options: SERVICES, required: true, showInTable: true, group: "Appointment" },
    { key: "date", label: "Date", type: "date", showInTable: true, group: "Appointment" },
    { key: "time", label: "Time", type: "time", group: "Appointment" },
    { key: "duration", label: "Duration (mins)", type: "number", group: "Appointment", default: 90 },
    { key: "deposit", label: "Deposit (J$)", type: "money", group: "Payment" },
    { key: "style-notes", label: "Style notes / inspo", type: "textarea", group: "Details", placeholder: "Length, shape, colors, reference pics…" },
    { key: "tech", label: "Tech / stylist", type: "text", group: "Details" },
  ],

  bookingFields: [
    { key: "service", label: "Service", type: "select", options: SERVICES, required: true },
    { key: "date", label: "Preferred date", type: "date", required: true },
    { key: "time", label: "Preferred time", type: "time" },
    { key: "inspo", label: "Style notes", type: "textarea", placeholder: "Tell us the look you want…" },
  ],

  kpis: [
    kpiActive("Upcoming appointments", PIPELINE),
    kpiNewBookings("New requests"),
    kpiRevenue("Collected"),
    kpiCustomers("Clients"),
  ],
  charts: [
    chartVolume("Appointments booked", "appointments"),
    chartBookingsTrend("Website requests"),
    chartPipelineSpread("Appointment status", PIPELINE),
  ],

  features: [
    "Deposit-first booking that kills no-shows",
    "Client cards with service history and style notes",
    "Loyalty punch cards — 'every 6th set free' built in",
    "Automatic confirmations and day-before reminders",
    "AI receptionist that books clients while your hands are busy",
    "A booking website that looks like a brand, not a link tree",
  ],
  addOns: ["loyalty", "chatbot", "voice", "dashboards"],

  website: {
    style: "luxe",
    heroEyebrow: "Luxury nail studio",
    heroTitle: "Hands that get noticed.",
    heroSubtitle: "Custom sets, flawless finishes and a chair that feels like self-care. Book your slot — deposits secure your time.",
    primaryCta: "Book my slot",
    secondaryCta: "View services",
    stats: [
      { value: "4.9★", label: "Client rating" },
      { value: "3,200+", label: "Sets completed" },
      { value: "6 yrs", label: "Perfecting the craft" },
    ],
    servicesTitle: "The menu",
    services: [
      { title: "Gel full set", description: "Sculpted, strengthened and styled exactly to your inspo.", price: "from $6,500 JMD" },
      { title: "Acrylic full set", description: "Length that lasts — any shape from coffin to stiletto.", price: "from $7,500 JMD" },
      { title: "Deluxe pedicure", description: "Hot towels, massage, perfect polish. Pure decompression.", price: "from $5,000 JMD" },
      { title: "Lash & brow", description: "Lash sets and brow lamination that frame everything.", price: "from $8,000 JMD" },
    ],
    valueProps: [
      { title: "Your time is protected", body: "Deposits lock your appointment — no double-booking, no waiting room pile-ups." },
      { title: "We remember your look", body: "Every set is on file: shape, length, colors — walk in and say 'same again, but red'." },
      { title: "Loyalty pays", body: "Punch-card rewards mean your 6th visit treats you." },
    ],
    testimonial: {
      quote: "Booked online at midnight, deposit done, reminder the day before — and the set? Flawless. Most professional nail experience on the island.",
      name: "Tamara Lewis",
      role: "Regular client",
    },
    bookingTitle: "Book your appointment",
    bookingBlurb: "Choose your service and time — we'll confirm and send the deposit link right away.",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(35),

  seed(ctx) {
    const customers = makeCustomers(ctx, 16, ["vip", "regular", "new"]);
    const records = makeRecords(ctx, customers, {
      prefix: "APT",
      count: 22,
      stages: PIPELINE,
      weights: [3, 4, 5, 9, 1],
      titleFor: (rand) => pick(rand, SERVICES),
      valueRange: [3500, 12000],
      fieldsFor: (rand) => ({
        service: pick(rand, SERVICES),
        duration: pick(rand, [60, 90, 120]),
        deposit: pick(rand, [1000, 1500, 2000]),
        tech: pick(rand, ["Asha", "Brittany", "Kerry-Ann"]),
      }),
    });
    return bundle({
      customers,
      records,
      bookings: makeBookings(ctx, 9, salon.bookingFields, SERVICES.slice(0, 5)),
      invoices: makeInvoices(ctx, customers, 12, [3500, 15000]),
      messages: makeMessages(ctx, customers, 12, [
        "Any openings this Saturday?",
        "How much for a refill with designs?",
        "Can I move my appointment to next week?",
        "Do you take walk-ins or appointment only?",
      ]),
    });
  },
};
