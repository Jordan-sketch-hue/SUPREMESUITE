/* SYSTEM REGISTRY — every sellable product in Supreme Suite.
   Adding a vertical = drop a pack file here. The engine does the rest. */

import type { SystemCategory, SystemDef } from "../types";
import { courier } from "./courier";
import { movers } from "./movers";
import { warehouse } from "./warehouse";
import { property } from "./property";
import { restaurant } from "./restaurant";
import { salon } from "./salon";
import { appointments } from "./appointments";
import { tours } from "./tours";
import { school } from "./school";
import { loyalty } from "./loyalty";
import { dashboards } from "./dashboards";
import { chatbot } from "./chatbot";
import { voice } from "./voice";

export const SYSTEMS: SystemDef[] = [
  courier,
  movers,
  warehouse,
  property,
  restaurant,
  salon,
  appointments,
  tours,
  school,
  loyalty,
  dashboards,
  chatbot,
  voice,
];

const bySlug = new Map(SYSTEMS.map((s) => [s.slug, s]));

export function getSystem(slug: string): SystemDef {
  const sys = bySlug.get(slug);
  if (!sys) throw new Error(`Unknown system: ${slug}`);
  return sys;
}

export function trySystem(slug: string | undefined | null): SystemDef | null {
  return slug ? bySlug.get(slug) ?? null : null;
}

export function systemsByCategory(): Array<{ category: SystemCategory; systems: SystemDef[] }> {
  const order: SystemCategory[] = ["operations", "booking", "education", "growth", "intelligence"];
  return order
    .map((category) => ({ category, systems: SYSTEMS.filter((s) => s.category === category) }))
    .filter((g) => g.systems.length > 0);
}
