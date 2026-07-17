/* SYSTEM PACK — Universal Appointment CRM
   Booking-led practices of every kind: consultants, clinics, barbers, studios. */

import { CalendarCheck, CalendarDays } from "lucide-react";
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
  { id: "confirmed", label: "Confirmed", tone: "info" as const },
  { id: "reminded", label: "Reminded", tone: "progress" as const },
  { id: "completed", label: "Completed", tone: "ok" as const, done: true },
  { id: "no-show", label: "No-show", tone: "danger" as const, done: true },
  { id: "cancelled", label: "Cancelled", tone: "neutral" as const, done: true },
];

const SERVICES = ["Consultation", "Follow-up", "Assessment", "Strategy session"];
const LOCATIONS = ["In-person", "Phone", "Video"];
const DURATIONS = [30, 45, 60, 90];

export const appointments: SystemDef = {
  slug: "appointments",
  name: "Universal Appointment CRM",
  shortName: "Appointments",
  category: "booking",
  tagline: "Fill the calendar. Cut the no-shows.",
  description:
    "A complete front desk for any practice — consultants, clinics, barbers, studios: a public booking page, automatic confirmations and reminders, client history, fees and invoices, plus an AI receptionist — wrapped in your brand.",
  icon: CalendarCheck,
  accent: "#7c3aed",
  badge: "Popular",

  recordNoun: { singular: "Appointment", plural: "Appointments" },
  recordIcon: CalendarDays,

  modules: [
    "dashboard", "records", "calendar", "bookings", "customers", "messages",
    "invoices", "loyalty", "reports", "chatbot", "voice", "website", "integrations", "settings",
  ],

  pipeline: PIPELINE,

  fields: [
    { key: "service", label: "Service", type: "text", group: "Appointment", showInTable: true, required: true },
    { key: "date", label: "Date", type: "date", group: "Appointment", showInTable: true },
    { key: "time", label: "Time", type: "time", group: "Appointment" },
    { key: "duration", label: "Duration (mins)", type: "number", group: "Appointment" },
    { key: "location", label: "Location", type: "select", options: LOCATIONS, group: "Logistics" },
    { key: "prep", label: "Prep notes", type: "textarea", group: "Logistics" },
    { key: "fee", label: "Fee (J$)", type: "money", group: "Payment" },
  ],

  bookingFields: [
    { key: "service", label: "Service", type: "select", options: SERVICES, required: true },
    { key: "date", label: "Preferred date", type: "date", required: true },
    { key: "time", label: "Preferred time", type: "time" },
    { key: "location", label: "How would you like to meet?", type: "select", options: LOCATIONS },
  ],

  kpis: [
    kpiActive("Upcoming appointments", PIPELINE),
    kpiNewBookings("New requests"),
    kpiRevenue("Collected (paid)"),
    kpiCustomers("Clients"),
  ],
  charts: [
    chartVolume("Appointments created", "appointments"),
    chartBookingsTrend("Booking requests"),
    chartPipelineSpread("Appointment status", PIPELINE),
  ],

  features: [
    "Self-serve booking page wired straight to your calendar",
    "Automatic confirmations and reminders that crush no-shows",
    "Pipeline from requested to completed, no-show or cancelled",
    "Client cards with history, notes and visit counts",
    "Fees and invoices tied to every appointment",
    "AI receptionist that books and reschedules 24/7",
  ],
  addOns: ["loyalty", "chatbot", "voice", "dashboards"],

  website: {
    style: "clean",
    heroEyebrow: "Appointments without the back-and-forth",
    heroTitle: "Your calendar, finally under control.",
    heroSubtitle: "Online booking, automatic reminders and a calm day view — built for consultants, clinics, barbers and every professional who lives by the hour.",
    primaryCta: "Book an appointment",
    secondaryCta: "View services",
    stats: [
      { value: "12k+", label: "Appointments booked" },
      { value: "63%", label: "Fewer no-shows" },
      { value: "4.9★", label: "Average rating" },
    ],
    servicesTitle: "Book a session",
    services: [
      { title: "Consultation", description: "A focused first session to understand where you are and map what comes next.", price: "from $6,500 JMD" },
      { title: "Follow-up", description: "Keep the momentum with a structured check-in on progress and next steps.", price: "from $4,000 JMD" },
      { title: "Assessment", description: "A deep-dive review with a written summary and clear recommendations.", price: "from $9,500 JMD" },
      { title: "Strategy session", description: "Ninety minutes of undivided attention to plan the quarter properly.", price: "from $15,000 JMD" },
    ],
    valueProps: [
      { title: "Reminders that actually work", body: "Confirmations and nudges go out automatically, so clients show up — or reschedule before it costs you the slot." },
      { title: "Booked while you sleep", body: "Clients pick a time from your live availability and it lands on your calendar — no phone tag, no double-booking." },
      { title: "Every client, one card", body: "History, notes, fees and visits together, so you walk into every session already knowing the story." },
    ],
    testimonial: {
      quote: "I used to lose two slots a day to no-shows and phone tag. Now the calendar fills itself and the reminders do the chasing.",
      name: "Dr. Maxine Reid",
      role: "Clinic director, Kingston",
    },
    bookingTitle: "Book your appointment",
    bookingBlurb: "Pick a service and a time that suits you — we'll confirm right away and remind you before you're due.",
    heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(39),

  seed(ctx) {
    const customers = makeCustomers(ctx, 14, ["regular", "new", "referral"]);
    const records = makeRecords(ctx, customers, {
      prefix: "APT",
      count: 20,
      stages: PIPELINE,
      weights: [3, 6, 3, 6, 1, 1],
      titleFor: (rand) => `${pick(rand, SERVICES)} · ${pick(rand, LOCATIONS)}`,
      valueRange: [4000, 30000],
      fieldsFor: (rand) => ({
        service: pick(rand, SERVICES),
        date: isoIn(ctx, Math.floor(rand() * 10) - 2),
        time: `${9 + Math.floor(rand() * 8)}:${rand() > 0.5 ? "30" : "00"}`,
        duration: pick(rand, DURATIONS),
        location: pick(rand, LOCATIONS),
      }),
    });
    return bundle({
      customers,
      records,
      bookings: makeBookings(ctx, 8, appointments.bookingFields, ["Consultation", "Follow-up", "Strategy session"]),
      invoices: makeInvoices(ctx, customers, 10, [5000, 45000]),
      messages: makeMessages(ctx, customers, 10, [
        "Can I move my Thursday appointment to next week?",
        "Do you have anything earlier in the morning?",
        "Is video okay instead of in-person this time?",
        "What's your first free slot on Friday?",
      ]),
    });
  },
};
