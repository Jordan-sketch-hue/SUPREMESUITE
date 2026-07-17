/* ============================================================================
   OPS — shared business operations.
   Every mutating action in the UI goes through these functions, and the
   /status self-check workflows execute these same functions. One code path,
   verified for real — not a parallel "test-only" implementation.
============================================================================ */

import type {
  Booking,
  BrandConfig,
  CrmRecord,
  Customer,
  Invoice,
  Message,
  SeedContext,
  SystemDef,
  Tenant,
} from "../types";
import { uid, slugify, hashSeed, mulberry32, refFor } from "./ids";
import {
  getCol,
  getTenantBySlug,
  saveTenant,
  setCol,
  slugExists,
  upsertRow,
} from "./store";
import { DEFAULT_BRAND } from "./brand";
import { getSystem } from "../systems";

/* ---- tenant lifecycle --------------------------------------------------- */

export interface CreateTenantInput {
  businessName: string;
  systemSlug: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  city?: string;
  brand?: Partial<BrandConfig>;
  slugOverride?: string;
  seed?: boolean;
  apiConnections?: import("../types").ApiConnection[];
}

export function createTenant(input: CreateTenantInput): Tenant {
  const system = getSystem(input.systemSlug);
  let slug = input.slugOverride ?? slugify(input.businessName);
  if (!input.slugOverride && slugExists(slug)) slug = `${slug}-${Math.floor(Math.random() * 900 + 100)}`;
  const tenant: Tenant = {
    id: uid(),
    slug,
    businessName: input.businessName.trim() || system.name,
    systemSlug: system.slug,
    brand: { ...DEFAULT_BRAND, color: system.accent, ...input.brand },
    contact: {
      ownerName: input.ownerName ?? "",
      email: input.email ?? "",
      phone: input.phone,
      city: input.city,
    },
    plan: "trial",
    trialStartedAt: Date.now(),
    createdAt: Date.now(),
    addOns: [],
    apiConnections: input.apiConnections ?? [],
  };
  saveTenant(tenant);
  // Seeding must never block workspace creation — a bug in one system's demo
  // data would otherwise throw here and hang the launch wizard. Degrade to an
  // empty (but fully usable) workspace instead of crashing.
  if (input.seed !== false) {
    try {
      seedTenant(tenant, system);
    } catch (err) {
      console.error(`seedTenant failed for ${system.slug}:`, err);
    }
  }
  return tenant;
}

export function seedTenant(tenant: Tenant, system?: SystemDef): void {
  const sys = system ?? getSystem(tenant.systemSlug);
  const ctx: SeedContext = {
    tenantId: tenant.id,
    now: Date.now(),
    rand: mulberry32(hashSeed(tenant.slug)),
  };
  const b = sys.seed(ctx);
  b.records.forEach((r) => (r.system = sys.slug));
  b.bookings.forEach((r) => (r.system = sys.slug));
  setCol(tenant.id, "customers", b.customers);
  setCol(tenant.id, "records", b.records);
  setCol(tenant.id, "bookings", b.bookings);
  setCol(tenant.id, "invoices", b.invoices);
  setCol(tenant.id, "messages", b.messages);
  if (b.inventory) setCol(tenant.id, "inventory", b.inventory);
}

/** demo-<system> workspaces self-create on first visit (zero-friction demos). */
export function ensureDemoTenant(slug: string): Tenant | null {
  const existing = getTenantBySlug(slug);
  if (existing) return existing;
  const m = /^demo-([a-z0-9-]+)$/.exec(slug);
  if (!m) return null;
  let system: SystemDef;
  try {
    system = getSystem(m[1]!);
  } catch {
    return null;
  }
  return createTenant({
    businessName: `${system.shortName} Demo Co.`,
    systemSlug: system.slug,
    ownerName: "Demo Owner",
    email: "demo@supremesuite.app",
    city: "Kingston",
    slugOverride: slug,
    brand: { color: system.accent },
  });
}

/* ---- records ------------------------------------------------------------ */

export function createRecord(
  tenant: Tenant,
  system: SystemDef,
  data: Partial<CrmRecord> & { title: string },
): CrmRecord {
  const existing = getCol<CrmRecord>(tenant.id, "records");
  const rec: CrmRecord = {
    id: uid(),
    tenantId: tenant.id,
    system: system.slug,
    ref: refFor(system.recordNoun.singular.slice(0, 3).toUpperCase(), existing.length + 1),
    title: data.title,
    status: data.status ?? system.pipeline[0]!.id,
    customerId: data.customerId,
    value: data.value,
    assignee: data.assignee,
    due: data.due,
    fields: data.fields ?? {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  upsertRow(tenant.id, "records", rec);
  return rec;
}

export function updateRecord(tenant: Tenant, rec: CrmRecord): void {
  upsertRow(tenant.id, "records", { ...rec, updatedAt: Date.now() });
}

export function setRecordStage(tenant: Tenant, recordId: string, stageId: string): CrmRecord | null {
  const rec = getCol<CrmRecord>(tenant.id, "records").find((r) => r.id === recordId);
  if (!rec) return null;
  const next = { ...rec, status: stageId, updatedAt: Date.now() };
  upsertRow(tenant.id, "records", next);
  return next;
}

/* ---- customers ----------------------------------------------------------- */

export function upsertCustomer(tenant: Tenant, data: Partial<Customer> & { name: string }): Customer {
  const cust: Customer = {
    id: data.id ?? uid(),
    tenantId: tenant.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    city: data.city,
    tags: data.tags ?? [],
    points: data.points ?? 0,
    tier: data.tier,
    notes: data.notes,
    createdAt: data.createdAt ?? Date.now(),
  };
  upsertRow(tenant.id, "customers", cust);
  return cust;
}

export function addPoints(tenant: Tenant, customerId: string, delta: number): Customer | null {
  const cust = getCol<Customer>(tenant.id, "customers").find((c) => c.id === customerId);
  if (!cust) return null;
  const next = { ...cust, points: Math.max(0, cust.points + delta) };
  upsertRow(tenant.id, "customers", next);
  return next;
}

export function loyaltyTier(points: number): { name: string; next: number | null } {
  if (points >= 500) return { name: "Gold", next: null };
  if (points >= 200) return { name: "Silver", next: 500 };
  return { name: "Bronze", next: 200 };
}

/* ---- bookings ------------------------------------------------------------ */

export function submitBooking(
  tenantId: string,
  systemSlug: string,
  data: Omit<Booking, "id" | "tenantId" | "system" | "status" | "requestedAt"> & Partial<Pick<Booking, "status" | "requestedAt">>,
): Booking {
  const booking: Booking = {
    id: uid(),
    tenantId,
    system: systemSlug,
    status: data.status ?? "new",
    requestedAt: data.requestedAt ?? Date.now(),
    customerName: data.customerName,
    email: data.email,
    phone: data.phone,
    fields: data.fields ?? {},
    note: data.note,
    source: data.source ?? "website",
  };
  upsertRow(tenantId, "bookings", booking);
  return booking;
}

export function setBookingStatus(tenant: Tenant, bookingId: string, status: Booking["status"]): void {
  const b = getCol<Booking>(tenant.id, "bookings").find((x) => x.id === bookingId);
  if (b) upsertRow(tenant.id, "bookings", { ...b, status });
}

/** Booking → customer (matched by phone/email or created) + pipeline record. */
export function convertBooking(tenant: Tenant, system: SystemDef, booking: Booking): { record: CrmRecord; customer: Customer } {
  const customers = getCol<Customer>(tenant.id, "customers");
  let customer = customers.find(
    (c) => (booking.email && c.email === booking.email) || (booking.phone && c.phone === booking.phone),
  );
  if (!customer) {
    customer = upsertCustomer(tenant, {
      name: booking.customerName,
      email: booking.email,
      phone: booking.phone,
      tags: ["from-booking"],
    });
  }
  const service = booking.fields.service ?? booking.fields[system.bookingFields[0]?.key ?? ""] ?? system.recordNoun.singular;
  const record = createRecord(tenant, system, {
    title: `${service} — ${booking.customerName}`,
    customerId: customer.id,
    fields: { ...booking.fields, source: booking.source },
    due: typeof booking.fields.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(booking.fields.date) ? booking.fields.date : undefined,
  });
  upsertRow(tenant.id, "bookings", { ...booking, status: "converted" });
  return { record, customer };
}

/* ---- invoices ------------------------------------------------------------ */

export function invoiceTotal(items: Invoice["items"]): number {
  return items.reduce((sum, it) => sum + it.qty * it.unit, 0);
}

export function createInvoice(
  tenant: Tenant,
  data: { customerId?: string; customerName: string; items: Invoice["items"]; currency?: string; status?: Invoice["status"] },
): Invoice {
  const existing = getCol<Invoice>(tenant.id, "invoices");
  const inv: Invoice = {
    id: uid(),
    tenantId: tenant.id,
    number: refFor("INV", existing.length + 1),
    customerId: data.customerId,
    customerName: data.customerName,
    amount: invoiceTotal(data.items),
    currency: data.currency ?? "USD",
    status: data.status ?? "draft",
    issuedAt: Date.now(),
    dueAt: Date.now() + 14 * 86400000,
    items: data.items,
  };
  upsertRow(tenant.id, "invoices", inv);
  return inv;
}

export function setInvoiceStatus(tenant: Tenant, invoiceId: string, status: Invoice["status"]): void {
  const inv = getCol<Invoice>(tenant.id, "invoices").find((x) => x.id === invoiceId);
  if (inv) upsertRow(tenant.id, "invoices", { ...inv, status });
}

/* ---- messages ------------------------------------------------------------ */

export function sendMessage(
  tenant: Tenant,
  data: { customerId?: string; customerName: string; body: string; channel?: Message["channel"]; direction?: Message["direction"] },
): Message {
  const msg: Message = {
    id: uid(),
    tenantId: tenant.id,
    customerId: data.customerId,
    customerName: data.customerName,
    direction: data.direction ?? "outbound",
    channel: data.channel ?? "whatsapp",
    body: data.body,
    at: Date.now(),
    read: true,
  };
  upsertRow(tenant.id, "messages", msg);
  return msg;
}

/* ---- billing (sandbox) ---------------------------------------------------- */

/** Sandbox checkout: records the chosen plan and unlocks the workspace.
    Production wiring point: Stripe Checkout / WiPay hosted page (GO-LIVE.md). */
export function activatePlan(tenant: Tenant, tier: string): Tenant {
  const next: Tenant = { ...tenant, plan: tier };
  saveTenant(next);
  return next;
}
