/* ============================================================================
   SUPREME SUITE — DATA LAYER (trial sandbox)
   localStorage-backed repository with a React subscription layer.
   Why localStorage: the 3-day trial is a zero-friction, zero-cost sandbox —
   no signup wall, no server. The repo interface below is intentionally shaped
   like a table API so production swaps to Supabase by reimplementing this one
   file (see DOCS/GO-LIVE.md).
============================================================================ */

"use client";

import { useSyncExternalStore, useCallback } from "react";
import type { Tenant } from "../types";

const NS = "ss.v1";
const TENANTS_KEY = `${NS}.tenants`;

export type CollectionName =
  | "records"
  | "customers"
  | "bookings"
  | "invoices"
  | "messages"
  | "inventory"
  | "events"
  | "botcfg"
  | "leads"; // platform-level: contact form / custom CRM requests

const isBrowser = typeof window !== "undefined";

/* ---- snapshot cache (stable refs for useSyncExternalStore) ------------ */

const cache = new Map<string, unknown>();
const EMPTY: never[] = [];

function readKey<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  if (cache.has(key)) return cache.get(key) as T;
  try {
    const raw = window.localStorage.getItem(key);
    const val = raw ? (JSON.parse(raw) as T) : fallback;
    cache.set(key, val);
    return val;
  } catch {
    return fallback;
  }
}

function writeKey(key: string, value: unknown): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota — soft-fail; UI still has in-memory cache */
  }
  cache.set(key, value);
  window.dispatchEvent(new CustomEvent("ss:change", { detail: { key } }));
}

function removeKey(key: string): void {
  if (!isBrowser) return;
  window.localStorage.removeItem(key);
  cache.delete(key);
  window.dispatchEvent(new CustomEvent("ss:change", { detail: { key } }));
}

function subscribe(cb: () => void): () => void {
  if (!isBrowser) return () => {};
  const onAny = () => {
    cb();
  };
  const onChange = (e: Event) => {
    // Invalidate the changed key (cross-tab 'storage' clears everything).
    const key = (e as CustomEvent).detail?.key as string | undefined;
    if (key) cache.delete(key);
    cb();
  };
  const onStorage = () => {
    cache.clear();
    cb();
  };
  window.addEventListener("ss:change", onChange);
  window.addEventListener("storage", onStorage);
  window.addEventListener("focus", onAny);
  return () => {
    window.removeEventListener("ss:change", onChange);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("focus", onAny);
  };
}

/* ---- key helpers ------------------------------------------------------- */

const colKey = (tenantId: string, name: CollectionName) => `${NS}.${tenantId}.${name}`;

/* ---- tenants ----------------------------------------------------------- */

export function listTenants(): Tenant[] {
  return readKey<Tenant[]>(TENANTS_KEY, EMPTY as unknown as Tenant[]);
}

export function getTenantBySlug(slug: string): Tenant | null {
  return listTenants().find((t) => t.slug === slug) ?? null;
}

export function saveTenant(tenant: Tenant): void {
  const all = [...listTenants()];
  const i = all.findIndex((t) => t.id === tenant.id);
  if (i >= 0) all[i] = tenant;
  else all.push(tenant);
  writeKey(TENANTS_KEY, all);
}

export function deleteTenant(tenantId: string): void {
  const all = listTenants();
  const t = all.find((x) => x.id === tenantId);
  writeKey(TENANTS_KEY, all.filter((x) => x.id !== tenantId));
  if (!t) return;
  (
    ["records", "customers", "bookings", "invoices", "messages", "inventory", "events", "botcfg"] as CollectionName[]
  ).forEach((c) => removeKey(colKey(tenantId, c)));
}

export function slugExists(slug: string): boolean {
  return listTenants().some((t) => t.slug === slug);
}

/* ---- collections -------------------------------------------------------- */

export function getCol<T>(tenantId: string, name: CollectionName): T[] {
  return readKey<T[]>(colKey(tenantId, name), EMPTY as unknown as T[]);
}

export function setCol<T>(tenantId: string, name: CollectionName, rows: T[]): void {
  writeKey(colKey(tenantId, name), rows);
}

export function upsertRow<T extends { id: string }>(tenantId: string, name: CollectionName, row: T): void {
  const rows = [...getCol<T>(tenantId, name)];
  const i = rows.findIndex((r) => r.id === row.id);
  if (i >= 0) rows[i] = row;
  else rows.unshift(row);
  setCol(tenantId, name, rows);
}

export function removeRow(tenantId: string, name: CollectionName, id: string): void {
  setCol(
    tenantId,
    name,
    getCol<{ id: string }>(tenantId, name).filter((r) => r.id !== id),
  );
}

/** Single-document collections (e.g. botcfg, site overrides). */
export function getDoc<T>(tenantId: string, name: CollectionName, fallback: T): T {
  return readKey<T>(colKey(tenantId, name), fallback);
}

export function setDoc<T>(tenantId: string, name: CollectionName, value: T): void {
  writeKey(colKey(tenantId, name), value);
}

/* ---- platform-level (no tenant) ---------------------------------------- */

export function getPlatformCol<T>(name: CollectionName): T[] {
  return readKey<T[]>(colKey("_platform", name), EMPTY as unknown as T[]);
}
export function addPlatformRow<T extends { id: string }>(name: CollectionName, row: T): void {
  const rows = [row, ...getPlatformCol<T>(name)];
  writeKey(colKey("_platform", name), rows);
}

/* ---- React hooks --------------------------------------------------------
   Server snapshots return stable empty values so pages SSR cleanly (headings
   + empty states), then hydrate with real data. This is what lets the smoke
   runner assert on server HTML while /status asserts live behavior. */

export function useTenant(slug: string | undefined): Tenant | null {
  const get = useCallback(() => (slug ? getTenantBySlug(slug) : null), [slug]);
  return useSyncExternalStore(subscribe, get, () => null);
}

export function useTenants(): Tenant[] {
  return useSyncExternalStore(subscribe, listTenants, () => EMPTY as unknown as Tenant[]);
}

export function useCol<T>(tenantId: string | undefined, name: CollectionName): T[] {
  const get = useCallback(
    () => (tenantId ? getCol<T>(tenantId, name) : (EMPTY as unknown as T[])),
    [tenantId, name],
  );
  return useSyncExternalStore(subscribe, get, () => EMPTY as unknown as T[]);
}

export function useDoc<T>(tenantId: string | undefined, name: CollectionName, fallback: T): T {
  const get = useCallback(
    () => (tenantId ? getDoc<T>(tenantId, name, fallback) : fallback),
    // fallback is expected to be a stable module-level constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tenantId, name],
  );
  return useSyncExternalStore(subscribe, get, () => fallback);
}

/* ---- bulk export/import (data freedom) --------------------------------- */

export function exportTenantJson(tenantId: string): string {
  const dump: Record<string, unknown> = { tenant: listTenants().find((t) => t.id === tenantId) };
  (["records", "customers", "bookings", "invoices", "messages", "inventory", "events", "botcfg"] as CollectionName[]).forEach(
    (c) => (dump[c] = readKey(colKey(tenantId, c), null)),
  );
  return JSON.stringify(dump, null, 2);
}

export function importTenantJson(json: string): Tenant {
  const dump = JSON.parse(json) as Record<string, any>;
  const tenant = dump.tenant as Tenant;
  if (!tenant?.id || !tenant?.slug) throw new Error("Invalid backup file: missing tenant");
  saveTenant(tenant);
  (["records", "customers", "bookings", "invoices", "messages", "inventory", "events", "botcfg"] as CollectionName[]).forEach(
    (c) => {
      if (dump[c] != null) writeKey(colKey(tenant.id, c), dump[c]);
    },
  );
  return tenant;
}
