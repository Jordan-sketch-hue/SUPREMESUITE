"use client";

/* Inventory — stock levels, low-stock alerts, quick adjustments. */

import { useMemo, useState } from "react";
import { Boxes, Minus, PackagePlus, Plus, TriangleAlert } from "lucide-react";
import type { InventoryItem } from "@/suite/types";
import { upsertRow, useCol } from "@/suite/lib/store";
import { uid, refFor } from "@/suite/lib/ids";
import { money } from "@/suite/lib/format";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Badge, Button, EmptyState, Field, Input, Stat, Table, Td, Th } from "@/suite/components/ui";
import { Drawer, useToast } from "@/suite/components/overlays";

export default function InventoryPage() {
  const { tenant } = useWorkspace();
  const toast = useToast();
  const items = useCol<InventoryItem>(tenant?.id, "inventory");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", category: "", qty: "10", reorderAt: "5", unit: "" });

  const stats = useMemo(() => {
    const low = items.filter((i) => i.qty <= i.reorderAt);
    const value = items.reduce((s, i) => s + i.qty * i.unit, 0);
    return { low: low.length, value, skus: items.length };
  }, [items]);

  const adjust = (item: InventoryItem, delta: number) => {
    if (!tenant) return;
    upsertRow(tenant.id, "inventory", { ...item, qty: Math.max(0, item.qty + delta) });
  };

  const add = () => {
    if (!tenant || !draft.name.trim()) {
      toast("Item name required", "danger");
      return;
    }
    upsertRow(tenant.id, "inventory", {
      id: uid(),
      tenantId: tenant.id,
      sku: refFor("SKU", items.length + 1),
      name: draft.name.trim(),
      category: draft.category || "General",
      qty: Number(draft.qty) || 0,
      reorderAt: Number(draft.reorderAt) || 0,
      unit: Number(draft.unit) || 0,
    });
    toast("Item added");
    setAdding(false);
    setDraft({ name: "", category: "", qty: "10", reorderAt: "5", unit: "" });
  };

  return (
    <>
      <PageHead
        title="Inventory"
        sub="Stock on hand, reorder alerts and quick adjustments"
        actions={
          <Button size="sm" onClick={() => setAdding(true)}>
            <PackagePlus className="size-4" /> Add item
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Stat label="SKUs tracked" value={stats.skus} icon={<Boxes />} />
        <Stat label="Stock value" value={money(stats.value)} sub="qty × unit cost" />
        <Stat label="Low stock" value={stats.low} sub={stats.low ? "needs reorder" : "all healthy"} icon={<TriangleAlert />} />
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<Boxes />} title="No inventory yet" body="Track packing materials, kitchen stock, retail items — anything you count." action={<Button onClick={() => setAdding(true)}><PackagePlus className="size-4" /> Add first item</Button>} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>SKU</Th>
              <Th>Item</Th>
              <Th>Category</Th>
              <Th>Location</Th>
              <Th>Unit</Th>
              <Th>On hand</Th>
              <Th>Status</Th>
              <Th>Adjust</Th>
            </tr>
          </thead>
          <tbody>
            {[...items]
              .sort((a, b) => (a.qty <= a.reorderAt ? -1 : 1) - (b.qty <= b.reorderAt ? -1 : 1))
              .map((it) => {
                const low = it.qty <= it.reorderAt;
                return (
                  <tr key={it.id} className="transition-colors hover:bg-surface-2">
                    <Td className="font-mono text-xs text-muted">{it.sku}</Td>
                    <Td className="font-medium">{it.name}</Td>
                    <Td className="text-muted">{it.category}</Td>
                    <Td className="text-muted">{it.location ?? "—"}</Td>
                    <Td className="text-muted">{money(it.unit)}</Td>
                    <Td className="font-display text-base font-bold">{it.qty}</Td>
                    <Td>
                      {low ? <Badge tone="danger"><TriangleAlert className="size-3" /> reorder ≤ {it.reorderAt}</Badge> : <Badge tone="ok">healthy</Badge>}
                    </Td>
                    <Td>
                      <span className="flex items-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => adjust(it, -1)} aria-label={`Remove one ${it.name}`}>
                          <Minus className="size-3.5" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => adjust(it, +1)} aria-label={`Add one ${it.name}`}>
                          <Plus className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => adjust(it, +10)}>
                          +10
                        </Button>
                      </span>
                    </Td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
      )}

      <Drawer
        open={adding}
        onClose={() => setAdding(false)}
        title="Add inventory item"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            <Button onClick={add}>Add item</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Item name" required>
            <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Medium boxes" autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Input value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} placeholder="Packing" />
            </Field>
            <Field label="Unit cost ($)">
              <Input type="number" value={draft.unit} onChange={(e) => setDraft((d) => ({ ...d, unit: e.target.value }))} placeholder="0" />
            </Field>
            <Field label="Quantity on hand">
              <Input type="number" value={draft.qty} onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))} />
            </Field>
            <Field label="Reorder when ≤">
              <Input type="number" value={draft.reorderAt} onChange={(e) => setDraft((d) => ({ ...d, reorderAt: e.target.value }))} />
            </Field>
          </div>
        </div>
      </Drawer>
    </>
  );
}
