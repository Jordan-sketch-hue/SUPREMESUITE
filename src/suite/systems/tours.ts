/* SYSTEM PACK — Tours & Experiences CRM
   Tour operators, excursion desks and transfer drivers across the island. */

import { Compass, MapPin } from "lucide-react";
import type { SystemDef } from "../types";
import {
  bundle,
  isoIn,
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
  kpiNewBookings,
  kpiPipelineValue,
  kpiRevenue,
  STD_PLANS,
} from "../lib/pack-kit";

const PIPELINE = [
  { id: "inquiry", label: "Inquiry", tone: "neutral" as const },
  { id: "quoted", label: "Quoted", tone: "info" as const },
  { id: "deposit-paid", label: "Deposit paid", tone: "progress" as const },
  { id: "confirmed", label: "Confirmed", tone: "warn" as const },
  { id: "completed", label: "Completed", tone: "ok" as const, done: true },
  { id: "cancelled", label: "Cancelled", tone: "danger" as const, done: true },
];

const EXPERIENCES = ["Blue Hole adventure", "Bob Marley experience", "Dunn's River Falls", "Private island tour", "Airport transfer"];
const TRANSPORT = ["Private car", "Van", "Coach"];
const HOTELS = ["Riu Ocho Rios", "Secrets St. James", "Moon Palace", "Sandals Montego Bay", "Hyatt Zilara", "Royalton Negril"];

export const tours: SystemDef = {
  slug: "tours",
  name: "Tours & Experiences CRM",
  shortName: "Tours",
  category: "booking",
  tagline: "From first inquiry to five-star review.",
  description:
    "A tour desk that never drops a lead: inquiries become quotes, deposits and confirmed pickups — with hotels, guides, transport, balances due and guest messaging in one branded workspace.",
  icon: Compass,
  accent: "#059669",

  recordNoun: { singular: "Booking", plural: "Bookings" },
  recordIcon: MapPin,

  modules: [
    "dashboard", "records", "calendar", "bookings", "customers", "messages",
    "invoices", "loyalty", "reports", "chatbot", "voice", "website", "settings",
  ],

  pipeline: PIPELINE,

  fields: [
    { key: "experience", label: "Experience", type: "text", group: "Trip", showInTable: true, required: true },
    { key: "date", label: "Tour date", type: "date", group: "Trip", showInTable: true },
    { key: "guests", label: "Guests", type: "number", group: "Trip", showInTable: true },
    { key: "hotel", label: "Pickup hotel", type: "text", group: "Pickup" },
    { key: "transport", label: "Transport", type: "select", options: TRANSPORT, group: "Pickup" },
    { key: "guide", label: "Guide", type: "text", group: "Crew" },
    { key: "balance", label: "Balance due (J$)", type: "money", group: "Payment" },
  ],

  bookingFields: [
    { key: "service", label: "Experience", type: "select", options: EXPERIENCES, required: true },
    { key: "date", label: "Tour date", type: "date", required: true },
    { key: "guests", label: "Guests", type: "number" },
    { key: "hotel", label: "Hotel / pickup point", type: "text", placeholder: "e.g. Riu Ocho Rios" },
  ],

  kpis: [
    kpiActive("Active bookings", PIPELINE),
    kpiNewBookings("New inquiries"),
    kpiPipelineValue("Booked value"),
    kpiRevenue("Revenue (paid)"),
  ],
  charts: [
    chartVolume("Bookings created", "bookings"),
    chartRevenueTrend("Revenue collected"),
    chartPipelineSpread("Where bookings are", PIPELINE),
  ],

  features: [
    "Inquiry-to-confirmed pipeline with deposits tracked at every step",
    "Public booking page selling your signature experiences",
    "Pickup hotel, transport and guide on every booking card",
    "Balance-due tracking so nobody tours unpaid",
    "Guest messaging for pickup times and day-of updates",
    "AI concierge that quotes tours and checks dates 24/7",
  ],
  addOns: ["loyalty", "chatbot", "voice", "dashboards"],

  website: {
    style: "bold",
    heroEyebrow: "Jamaican tours & experiences",
    heroTitle: "See the island like family.",
    heroSubtitle: "Licensed guides, cold drinks in the cooler and the spots the brochures miss — private tours, excursions and airport transfers across Jamaica.",
    primaryCta: "Book an experience",
    secondaryCta: "Browse tours",
    stats: [
      { value: "1,400+", label: "5-star reviews" },
      { value: "30k+", label: "Guests hosted" },
      { value: "14", label: "Parishes explored" },
    ],
    servicesTitle: "Signature experiences",
    services: [
      { title: "Blue Hole adventure", description: "Climb, swim and jump the turquoise pools above Ocho Rios with guides who know every ledge.", price: "from $95 USD" },
      { title: "Bob Marley experience", description: "Nine Mile, the legend's birthplace — music, history and mountain views the whole way up.", price: "from $120 USD" },
      { title: "Dunn's River Falls", description: "Jamaica's most famous climb, timed to beat the cruise-ship crowds.", price: "from $85 USD" },
      { title: "Private island tour", description: "Your day, your route — beaches, jerk stops and rum bars with a dedicated driver-guide.", price: "from $250 USD" },
    ],
    valueProps: [
      { title: "Hotel pickup included", body: "We collect you from any resort or villa on time, in a clean, air-conditioned ride." },
      { title: "Licensed & insured", body: "JTB-licensed guides and properly insured vehicles — real adventure without the worry." },
      { title: "Deposits made easy", body: "Hold your date with a small deposit and settle the balance on tour day." },
    ],
    testimonial: {
      quote: "Our driver felt like a cousin by day two — he knew every shortcut, every jerk stop, and the kids still talk about the Blue Hole.",
      name: "Sarah Mitchell",
      role: "Guest from Toronto",
    },
    bookingTitle: "Book your experience",
    bookingBlurb: "Tell us your dates, hotel and party size — we'll confirm your guide and pickup time within the hour.",
    heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(49),

  seed(ctx) {
    const customers = makeCustomers(ctx, 14, ["tourist", "repeat", "hotel-partner"]);
    const records = makeRecords(ctx, customers, {
      prefix: "TUR",
      count: 18,
      stages: PIPELINE,
      weights: [2, 3, 3, 5, 4, 1],
      titleFor: (rand) => `${pick(rand, EXPERIENCES)} · party of ${Math.ceil(rand() * 8)}`,
      valueRange: [9000, 110000],
      fieldsFor: (rand) => ({
        experience: pick(rand, EXPERIENCES),
        date: isoIn(ctx, Math.floor(rand() * 14) - 2),
        guests: Math.ceil(rand() * 8),
        hotel: pick(rand, HOTELS),
        transport: pick(rand, TRANSPORT),
      }),
    });
    return bundle({
      customers,
      records,
      bookings: makeBookings(ctx, 8, tours.bookingFields, ["Blue Hole adventure", "Dunn's River Falls", "Airport transfer"]),
      invoices: makeInvoices(ctx, customers, 12, [9000, 120000]),
      messages: makeMessages(ctx, customers, 10, [
        "Is the Blue Hole tour running this Saturday?",
        "Can you pick us up from the Riu in Ocho Rios?",
        "How long is the drive to Nine Mile from Montego Bay?",
        "Do you do private tours for a group of eight?",
      ]),
    });
  },
};
