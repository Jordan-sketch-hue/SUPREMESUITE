/* SYSTEM PACK — School & Academy Management
   Private academies, tutoring centres and prep schools. */

import { BookOpen, GraduationCap } from "lucide-react";
import type { SystemDef } from "../types";
import {
  bundle,
  makeBookings,
  makeCustomers,
  makeInvoices,
  makeMessages,
  makeRecords,
  personName,
  phoneJa,
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
  { id: "applied", label: "Applied", tone: "neutral" as const },
  { id: "assessed", label: "Assessed", tone: "info" as const },
  { id: "enrolled", label: "Enrolled", tone: "progress" as const },
  { id: "active", label: "Active", tone: "ok" as const },
  { id: "graduated", label: "Graduated", tone: "ok" as const, done: true },
  { id: "withdrawn", label: "Withdrawn", tone: "danger" as const, done: true },
];

const PROGRAMS = ["CSEC Math", "CSEC English", "SAT Prep", "Coding Club", "Music", "Summer Camp"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const SCHEDULES = ["Mon & Wed 4–6pm", "Tue & Thu 4–6pm", "Saturday 9am–12pm", "Saturday 1–4pm"];
const TUITION = [18000, 24000, 32000, 45000, 60000, 80000, 95000];

export const school: SystemDef = {
  slug: "school",
  name: "School & Academy Management",
  shortName: "School",
  category: "education",
  tagline: "Applications, tuition and timetables — sorted.",
  description:
    "Run admissions like a registrar: applications, assessments and enrollments in one pipeline, with guardian contacts, class schedules, tuition invoicing and a parent inbox — wrapped in your school's brand.",
  icon: GraduationCap,
  accent: "#1d4ed8",

  recordNoun: { singular: "Enrollment", plural: "Enrollments" },
  recordIcon: BookOpen,

  modules: [
    "dashboard", "records", "calendar", "bookings", "customers", "messages",
    "invoices", "reports", "chatbot", "website", "settings",
  ],

  pipeline: PIPELINE,

  fields: [
    { key: "student", label: "Student name", type: "text", group: "Student", showInTable: true, required: true },
    { key: "program", label: "Program", type: "select", options: PROGRAMS, group: "Student", showInTable: true },
    { key: "level", label: "Level", type: "select", options: LEVELS, group: "Student" },
    { key: "guardian", label: "Guardian", type: "text", group: "Guardian" },
    { key: "guardianPhone", label: "Guardian phone", type: "phone", group: "Guardian" },
    { key: "schedule", label: "Schedule", type: "text", group: "Enrollment" },
    { key: "tuition", label: "Tuition (J$)", type: "money", group: "Enrollment", showInTable: true },
  ],

  bookingFields: [
    { key: "service", label: "I'd like to book", type: "select", options: ["Enrollment application", "Campus tour", "Assessment", "Summer camp"], required: true },
    { key: "age", label: "Student age", type: "number" },
    { key: "date", label: "Preferred date", type: "date" },
    { key: "interest", label: "Program interest", type: "text", placeholder: "e.g. CSEC Math" },
  ],

  kpis: [
    kpiActive("Active enrollments", PIPELINE),
    kpiNewBookings("New applications"),
    kpiRevenue("Tuition collected"),
    kpiCustomers("Families"),
  ],
  charts: [
    chartVolume("Enrollments created", "enrollments"),
    chartRevenueTrend("Tuition collected"),
    chartPipelineSpread("Enrollment stages", PIPELINE),
  ],

  features: [
    "Admissions pipeline from application to active enrollment",
    "Student records with guardian contacts and class schedules",
    "Tuition invoicing with paid, sent and overdue states",
    "Term calendar for classes, assessments and open days",
    "Parent inbox for schedule and fee questions",
    "AI assistant that answers admissions questions 24/7",
  ],
  addOns: ["chatbot", "dashboards"],

  website: {
    style: "warm",
    heroEyebrow: "Private academy & tutoring",
    heroTitle: "Where bright futures begin.",
    heroSubtitle: "Small classes, teachers who notice, and results parents can see — CSEC prep, SAT coaching, coding and music in the heart of the community.",
    primaryCta: "Start an application",
    secondaryCta: "Book a campus tour",
    stats: [
      { value: "96%", label: "CSEC pass rate" },
      { value: "850+", label: "Students taught" },
      { value: "18", label: "Years of excellence" },
    ],
    servicesTitle: "Our programs",
    services: [
      { title: "CSEC Mathematics", description: "Past-paper drills, weekly diagnostics and the confidence to face paper two.", price: "$35,000 JMD / term" },
      { title: "CSEC English", description: "Comprehension, composition and exam technique taught by marking veterans.", price: "$35,000 JMD / term" },
      { title: "SAT Prep", description: "Score-focused coaching for students aiming at US college places and scholarships.", price: "$45,000 JMD / term" },
      { title: "Coding Club", description: "Real projects in Python and web — logic, creativity and a portfolio by term's end.", price: "$28,000 JMD / term" },
    ],
    valueProps: [
      { title: "Classes capped at 12", body: "Every student is seen. Teachers know names, gaps and goals by week two." },
      { title: "Reports parents actually read", body: "Plain-language progress updates each term — what's strong, what needs work, and what we're doing about it." },
      { title: "Exam-room ready", body: "Mock exams under real conditions, so the first time never feels like the first time." },
    ],
    testimonial: {
      quote: "My daughter went from dreading math to teaching it back to me at the dinner table. Grade one in CSEC — we cried.",
      name: "Karen Thompson",
      role: "Parent of a fifth former",
    },
    bookingTitle: "Apply or book a visit",
    bookingBlurb: "Tell us about your child and the program you're considering — we'll arrange an assessment and a campus tour.",
    heroImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=800&auto=format&fit=crop",
    ],
  },

  plans: STD_PLANS(59),

  seed(ctx) {
    const customers = makeCustomers(ctx, 16, ["parent", "alumni"]);
    const records = makeRecords(ctx, customers, {
      prefix: "ENR",
      count: 22,
      stages: PIPELINE,
      weights: [3, 2, 6, 7, 3, 1],
      titleFor: (rand) => `${pick(rand, PROGRAMS)} · ${pick(rand, LEVELS)}`,
      valueRange: [18000, 95000],
      fieldsFor: (rand) => ({
        student: personName(rand),
        program: pick(rand, PROGRAMS),
        level: pick(rand, LEVELS),
        guardian: personName(rand),
        guardianPhone: phoneJa(rand),
        schedule: pick(rand, SCHEDULES),
        tuition: pick(rand, TUITION),
      }),
    });
    return bundle({
      customers,
      records,
      bookings: makeBookings(ctx, 7, school.bookingFields, ["Enrollment application", "Campus tour", "Assessment"]),
      invoices: makeInvoices(ctx, customers, 14, [18000, 95000]),
      messages: makeMessages(ctx, customers, 10, [
        "What time does Saturday SAT prep start?",
        "Can I pay this term's fees in two parts?",
        "Is there space left in Coding Club this term?",
        "When do mid-term progress reports come home?",
      ]),
    });
  },
};
