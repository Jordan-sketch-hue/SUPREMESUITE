/* ============================================================================
   SEED KIT — shared deterministic demo-data factory.
   Every system pack composes these helpers, so a full industry dataset is
   ~20 lines per pack instead of hundreds. Seeded PRNG ⇒ the same workspace
   slug always shows the same numbers (stable demos, stable screenshots).
============================================================================ */

import type {
  Booking,
  CrmRecord,
  Customer,
  FieldDef,
  Invoice,
  InventoryItem,
  Message,
  PipelineStage,
  SeedBundle,
  SeedContext,
} from "../types";
import { uid, refFor } from "./ids";

const FIRST = [
  "Andre", "Shanice", "Marlon", "Keisha", "Devon", "Alicia", "Ricardo", "Tamara",
  "Omar", "Natalie", "Kemar", "Simone", "Jordan", "Gabrielle", "Trevor", "Monique",
  "Damian", "Crystal", "Nicholas", "Latoya", "Shawn", "Amelia", "Chris", "Danielle",
];
const LAST = [
  "Brown", "Campbell", "Williams", "Clarke", "Thompson", "Reid", "Morris", "Gordon",
  "Henry", "Lewis", "Grant", "Palmer", "Stewart", "Bailey", "Wright", "Robinson",
  "Edwards", "Francis", "Bennett", "Samuels",
];
const CITIES = [
  "Kingston", "Montego Bay", "Ocho Rios", "Mandeville", "Spanish Town",
  "Portmore", "May Pen", "Negril", "Savanna-la-Mar", "Half Way Tree",
];
const STAFF = ["Alex", "Jay", "Renee", "Marcus", "Tia"];

export function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}
export function int(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
export function personName(rand: () => number): string {
  return `${pick(rand, FIRST)} ${pick(rand, LAST)}`;
}
export function phoneJa(rand: () => number): string {
  return `(876) ${int(rand, 200, 999)}-${String(int(rand, 0, 9999)).padStart(4, "0")}`;
}
export function emailFor(name: string, rand: () => number): string {
  return `${name.toLowerCase().replace(/[^a-z]+/g, ".")}${int(rand, 1, 99)}@gmail.com`;
}
export function city(rand: () => number): string {
  return pick(rand, CITIES);
}
export function staff(rand: () => number): string {
  return pick(rand, STAFF);
}
/** Timestamp within the trailing `days` window, weighted toward recent. */
export function recentTs(ctx: SeedContext, days = 14): number {
  const r = ctx.rand();
  const back = Math.floor(Math.pow(r, 1.6) * days * 86400000);
  return ctx.now - back - int(ctx.rand, 0, 86_000_000 / 4);
}
export function futureTs(ctx: SeedContext, days = 10): number {
  return ctx.now + int(ctx.rand, 1, days * 24) * 3600000;
}
export function isoIn(ctx: SeedContext, daysAhead: number): string {
  return new Date(ctx.now + daysAhead * 86400000).toISOString().slice(0, 10);
}

/* ---- factories --------------------------------------------------------- */

export function makeCustomers(ctx: SeedContext, n: number, tags: string[]): Customer[] {
  return Array.from({ length: n }, () => {
    const name = personName(ctx.rand);
    return {
      id: uid(),
      tenantId: ctx.tenantId,
      name,
      email: emailFor(name, ctx.rand),
      phone: phoneJa(ctx.rand),
      city: city(ctx.rand),
      tags: ctx.rand() > 0.5 ? [pick(ctx.rand, tags)] : [],
      points: int(ctx.rand, 0, 480),
      tier: undefined,
      createdAt: recentTs(ctx, 60),
    };
  });
}

export interface RecordPlan {
  prefix: string;
  count: number;
  stages: PipelineStage[];
  /** Weights matching stages order (unnormalized). */
  weights: number[];
  titleFor: (rand: () => number, i: number) => string;
  valueRange?: [number, number];
  fieldsFor?: (rand: () => number, i: number) => Record<string, any>;
  withDue?: boolean;
}

export function makeRecords(ctx: SeedContext, customers: Customer[], plan: RecordPlan): CrmRecord[] {
  const totalW = plan.weights.reduce((a, b) => a + b, 0);
  return Array.from({ length: plan.count }, (_, i) => {
    let r = ctx.rand() * totalW;
    let stageIdx = 0;
    for (let s = 0; s < plan.weights.length; s++) {
      r -= plan.weights[s]!;
      if (r <= 0) {
        stageIdx = s;
        break;
      }
    }
    const created = recentTs(ctx, 21);
    const cust = pick(ctx.rand, customers);
    return {
      id: uid(),
      tenantId: ctx.tenantId,
      system: "",
      ref: refFor(plan.prefix, i + 1),
      title: plan.titleFor(ctx.rand, i),
      status: plan.stages[stageIdx]!.id,
      customerId: cust.id,
      value: plan.valueRange ? int(ctx.rand, plan.valueRange[0], plan.valueRange[1]) : undefined,
      assignee: staff(ctx.rand),
      due: plan.withDue !== false ? isoIn(ctx, int(ctx.rand, -2, 9)) : undefined,
      fields: plan.fieldsFor ? plan.fieldsFor(ctx.rand, i) : {},
      createdAt: created,
      updatedAt: created + int(ctx.rand, 0, 48) * 3600000,
    };
  });
}

export function makeBookings(
  ctx: SeedContext,
  n: number,
  bookingFields: FieldDef[],
  serviceOptions: string[],
): Booking[] {
  const statuses: Booking["status"][] = ["new", "new", "confirmed", "confirmed", "converted", "declined"];
  return Array.from({ length: n }, () => {
    const name = personName(ctx.rand);
    const fields: Record<string, any> = {};
    bookingFields.forEach((f) => {
      if (f.type === "select" && f.options?.length) fields[f.key] = pick(ctx.rand, f.options);
      else if (f.type === "date") fields[f.key] = isoIn(ctx, int(ctx.rand, 1, 12));
      else if (f.type === "time") fields[f.key] = `${int(ctx.rand, 9, 17)}:00`;
      else if (f.type === "number") fields[f.key] = int(ctx.rand, 1, 6);
    });
    if (serviceOptions.length && !fields.service) fields.service = pick(ctx.rand, serviceOptions);
    return {
      id: uid(),
      tenantId: ctx.tenantId,
      system: "",
      customerName: name,
      email: emailFor(name, ctx.rand),
      phone: phoneJa(ctx.rand),
      fields,
      note: ctx.rand() > 0.7 ? "Found you on Instagram — looking forward!" : undefined,
      status: pick(ctx.rand, statuses),
      source: ctx.rand() > 0.3 ? "website" : "widget",
      requestedAt: recentTs(ctx, 7),
    };
  });
}

export function makeInvoices(ctx: SeedContext, customers: Customer[], n: number, range: [number, number], currency = "USD"): Invoice[] {
  const statuses: Invoice["status"][] = ["paid", "paid", "paid", "sent", "sent", "overdue", "draft"];
  return Array.from({ length: n }, (_, i) => {
    const cust = pick(ctx.rand, customers);
    const amount = int(ctx.rand, range[0], range[1]);
    const issued = recentTs(ctx, 30);
    return {
      id: uid(),
      tenantId: ctx.tenantId,
      number: refFor("INV", i + 1),
      customerId: cust.id,
      customerName: cust.name,
      amount,
      currency,
      status: pick(ctx.rand, statuses),
      issuedAt: issued,
      dueAt: issued + int(ctx.rand, 7, 21) * 86400000,
      items: [{ label: "Service", qty: 1, unit: amount }],
    };
  });
}

export function makeMessages(ctx: SeedContext, customers: Customer[], n: number, samples: string[]): Message[] {
  const channels: Message["channel"][] = ["web", "whatsapp", "whatsapp", "email", "sms"];
  return Array.from({ length: n }, () => {
    const cust = pick(ctx.rand, customers);
    const inbound = ctx.rand() > 0.45;
    return {
      id: uid(),
      tenantId: ctx.tenantId,
      customerId: cust.id,
      customerName: cust.name,
      direction: inbound ? "inbound" : "outbound",
      channel: pick(ctx.rand, channels),
      body: inbound ? pick(ctx.rand, samples) : "Thanks for reaching out — confirming the details now. We'll follow up shortly.",
      at: recentTs(ctx, 6),
      read: ctx.rand() > 0.35,
    };
  });
}

export function makeInventory(
  ctx: SeedContext,
  items: Array<{ name: string; category: string; unit: number }>,
): InventoryItem[] {
  return items.map((it, i) => ({
    id: uid(),
    tenantId: ctx.tenantId,
    sku: refFor("SKU", i + 1),
    name: it.name,
    category: it.category,
    qty: int(ctx.rand, 0, 140),
    reorderAt: int(ctx.rand, 8, 25),
    unit: it.unit,
    location: `Aisle ${int(ctx.rand, 1, 8)} · Bin ${int(ctx.rand, 1, 24)}`,
  }));
}

/** Convenience assembler with sensible defaults for most packs. */
export function bundle(parts: Partial<SeedBundle>): SeedBundle {
  return {
    customers: parts.customers ?? [],
    records: parts.records ?? [],
    bookings: parts.bookings ?? [],
    invoices: parts.invoices ?? [],
    messages: parts.messages ?? [],
    inventory: parts.inventory,
  };
}
