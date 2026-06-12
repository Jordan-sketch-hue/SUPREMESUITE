/* ============================================================================
   SUPREME SUITE — CORE TYPE MODEL
   The single contract shared by every system pack and every engine component.
   A "system" (Courier, Salon, School…) is data, not code: it declares its
   record shape, pipeline, fields, KPIs, website copy and which engine modules
   to switch on. The engine renders whatever the active system declares.
============================================================================ */

import type { LucideIcon } from "lucide-react";

/* ---- Taxonomy --------------------------------------------------------- */

export type SystemCategory =
  | "operations"
  | "booking"
  | "education"
  | "growth"
  | "intelligence";

export const CATEGORY_LABELS: Record<SystemCategory, string> = {
  operations: "Operations & Logistics",
  booking: "Booking & Appointments",
  education: "Education",
  growth: "Growth & Retention",
  intelligence: "AI & Intelligence",
};

/** Engine surfaces a system can switch on. Keep in sync with the app shell. */
export type SystemModule =
  | "dashboard"
  | "records" // generic pipeline records (shipments, jobs, work orders…)
  | "calendar"
  | "bookings" // public intake → inbox
  | "customers"
  | "messages" // unified inbox / conversations
  | "inventory" // stock items (warehouse, restaurant, retail)
  | "invoices"
  | "loyalty"
  | "reports"
  | "chatbot"
  | "voice"
  | "website" // the branded public site template
  | "settings";

/* ---- Fields & pipeline ------------------------------------------------ */

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "multiselect"
  | "number"
  | "money"
  | "date"
  | "time"
  | "datetime"
  | "phone"
  | "email"
  | "address"
  | "boolean"
  | "status"
  | "tags";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  /** Show this field as a column in the records table. */
  showInTable?: boolean;
  /** Group header for the record form. */
  group?: string;
  /** Default value for new records / seed. */
  default?: string | number | boolean;
}

export type StatusTone =
  | "neutral"
  | "info"
  | "progress"
  | "ok"
  | "warn"
  | "danger";

export interface PipelineStage {
  id: string;
  label: string;
  tone: StatusTone;
  description?: string;
  /** Treated as a terminal/closed-won stage for KPIs. */
  done?: boolean;
}

/* ---- Analytics -------------------------------------------------------- */

export type MetricFormat = "number" | "money" | "percent" | "duration";

export interface KpiDef {
  id: string;
  label: string;
  icon: LucideIcon;
  format: MetricFormat;
  /** Compute the metric from the tenant's live data. */
  compute: (ctx: MetricContext) => number;
  /** Optional secondary line, e.g. "vs last week". */
  sublabel?: string;
}

export type ChartKind = "area" | "bar" | "line" | "donut";

export interface ChartDef {
  id: string;
  title: string;
  kind: ChartKind;
  /** Returns chart-ready rows. */
  compute: (ctx: MetricContext) => Array<Record<string, string | number>>;
  /** Keys to plot (besides the label key). */
  series?: string[];
  labelKey?: string;
}

export interface MetricContext {
  records: CrmRecord[];
  customers: Customer[];
  bookings: Booking[];
  invoices: Invoice[];
  system: SystemDef;
  /** ISO day strings for the trailing window, oldest→newest. */
  days: string[];
}

/* ---- Website template ------------------------------------------------- */

export interface WebsiteService {
  title: string;
  description: string;
  icon?: string;
  price?: string;
}

export interface WebsiteTemplate {
  /** Visual archetype used by the renderer. */
  style: "bold" | "warm" | "clean" | "luxe" | "tech";
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryCta: string;
  secondaryCta: string;
  /** Stat ribbon under the hero. */
  stats: Array<{ value: string; label: string }>;
  servicesTitle: string;
  services: WebsiteService[];
  /** Marketing bullet points / value props. */
  valueProps: Array<{ title: string; body: string }>;
  testimonial: { quote: string; name: string; role: string };
  /** Heading for the public booking/intake form. */
  bookingTitle: string;
  bookingBlurb: string;
  /** Stock imagery (Unsplash) used when the tenant hasn't uploaded their own. */
  heroImage: string;
  gallery: string[];
}

/* ---- The system pack -------------------------------------------------- */

export interface PricePlan {
  tier: "Starter" | "Pro" | "Scale";
  monthly: number;
  currency: string;
  setup?: number;
  blurb: string;
  highlights: string[];
}

export interface SystemDef {
  slug: string;
  name: string;
  shortName: string;
  category: SystemCategory;
  tagline: string;
  description: string;
  icon: LucideIcon;
  /** Default brand color a tenant inherits before customizing. */
  accent: string;
  badge?: "New" | "Popular" | "Flagship";

  recordNoun: { singular: string; plural: string };
  recordIcon: LucideIcon;

  modules: SystemModule[];
  pipeline: PipelineStage[];
  fields: FieldDef[];
  bookingFields: FieldDef[];

  kpis: KpiDef[];
  charts: ChartDef[];

  /** Selling points for the catalog detail page. */
  features: string[];
  /** Add-on system slugs that bolt onto this base (e.g. loyalty, chatbot). */
  addOns: string[];

  website: WebsiteTemplate;
  plans: PricePlan[];

  /** Demo data generator for the trial sandbox. */
  seed: (ctx: SeedContext) => SeedBundle;
}

export interface SeedContext {
  tenantId: string;
  now: number;
  /** Deterministic pseudo-random in [0,1); seeded so previews are stable. */
  rand: () => number;
}

export interface SeedBundle {
  customers: Customer[];
  records: CrmRecord[];
  bookings: Booking[];
  invoices: Invoice[];
  messages: Message[];
  inventory?: InventoryItem[];
}

/* ---- Runtime data entities ------------------------------------------- */

export interface BrandConfig {
  color: string; // primary brand color (hex)
  color2?: string; // optional secondary/accent
  logoDataUrl?: string; // uploaded logo (data URL, lives in localStorage)
  mode: "light" | "dark";
  radius: "sharp" | "soft" | "round";
  font: "modern" | "grotesk" | "classic";
}

export interface Tenant {
  id: string;
  slug: string;
  businessName: string;
  systemSlug: string;
  brand: BrandConfig;
  contact: {
    ownerName: string;
    email: string;
    phone?: string;
    city?: string;
  };
  plan: string; // tier name or "trial"
  trialStartedAt: number;
  createdAt: number;
  installedAt?: number;
  /** Enabled add-on slugs purchased on top of the base system. */
  addOns: string[];
  /** Owner edits to the public website (merged over the pack's template). */
  site?: Partial<
    Pick<
      WebsiteTemplate,
      "heroTitle" | "heroSubtitle" | "heroEyebrow" | "primaryCta" | "bookingBlurb" | "servicesTitle"
    >
  > & { services?: WebsiteService[]; about?: string; phone?: string; address?: string };
}

export interface CrmRecord {
  id: string;
  tenantId: string;
  system: string;
  ref: string; // human reference e.g. SHP-1042
  title: string;
  status: string; // pipeline stage id
  customerId?: string;
  value?: number; // money amount where relevant
  assignee?: string;
  due?: string; // ISO date
  fields: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  tags: string[];
  points: number; // loyalty
  tier?: string;
  notes?: string;
  createdAt: number;
}

export interface Booking {
  id: string;
  tenantId: string;
  system: string;
  customerName: string;
  email?: string;
  phone?: string;
  fields: Record<string, any>;
  note?: string;
  status: "new" | "confirmed" | "declined" | "converted";
  source: "website" | "manual" | "widget";
  requestedAt: number;
}

export interface Invoice {
  id: string;
  tenantId: string;
  number: string;
  customerId?: string;
  customerName: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue";
  issuedAt: number;
  dueAt: number;
  items: Array<{ label: string; qty: number; unit: number }>;
}

export interface Message {
  id: string;
  tenantId: string;
  customerId?: string;
  customerName: string;
  direction: "inbound" | "outbound" | "note";
  channel: "web" | "email" | "sms" | "whatsapp" | "voice";
  body: string;
  at: number;
  read: boolean;
}

export interface InventoryItem {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  category: string;
  qty: number;
  reorderAt: number;
  unit: number; // cost/price
  location?: string;
}

export interface CalendarEvent {
  id: string;
  tenantId: string;
  title: string;
  start: number;
  end: number;
  kind: string;
  customerName?: string;
  recordId?: string;
}

/* ---- Self-check / health --------------------------------------------- */

export type CheckStatus = "pass" | "fail" | "warn" | "skip";

export interface CheckResult {
  id: string;
  label: string;
  group: string;
  status: CheckStatus;
  detail?: string;
  ms?: number;
}

export interface RouteSpec {
  path: string; // may contain :params documented in `sample`
  sample?: string; // a concrete resolvable URL for smoke tests
  group: string;
  title: string;
  /** What the page must render to be considered healthy. */
  expects: string[];
  dynamic?: boolean;
}

export interface ActionSpec {
  id: string;
  label: string;
  group: string;
  /** Plain-English contract this action must satisfy. */
  contract: string;
}
