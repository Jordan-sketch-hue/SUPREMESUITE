"use client";

/* Invoices — list, builder with auto-totals, status flow, branded print view. */

import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeDollarSign, Plus, Printer, Trash2 } from "lucide-react";
import type { Customer, Invoice } from "@/suite/types";
import { useCol } from "@/suite/lib/store";
import { createInvoice, invoiceTotal, setInvoiceStatus } from "@/suite/lib/ops";
import { money, dateLong, dateShort } from "@/suite/lib/format";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Badge, Button, Card, EmptyState, Field, Input, Select, Stat, Table, Td, Th } from "@/suite/components/ui";
import { Drawer, Modal, useToast } from "@/suite/components/overlays";
import { TenantLogo } from "@/suite/components/brand-provider";

const STATUS_TONE = { draft: "neutral", sent: "info", paid: "ok", overdue: "danger" } as const;

async function persistStatus(slug: string, invoiceId: string, status: string) {
  await fetch(`/api/workspace/${encodeURIComponent(slug)}/invoice-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoice_id: invoiceId, status }),
  });
}

export default function InvoicesPage() {
  const { tenant, system } = useWorkspace();
  const toast = useToast();
  const invoices = useCol<Invoice>(tenant?.id, "invoices");
  const customers = useCol<Customer>(tenant?.id, "customers");
  const [building, setBuilding] = useState(false);
  const [printing, setPrinting] = useState<Invoice | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<Invoice["items"]>([{ label: "", qty: 1, unit: 0 }]);

  /* On mount: pull server-side overrides and apply them to localStorage so
     paid invoices survive browser data clears and cross-device sessions. */
  const applyOverrides = useCallback(async () => {
    if (!tenant) return;
    try {
      const res = await fetch(`/api/workspace/${encodeURIComponent(tenant.slug)}/invoice-status`);
      if (!res.ok) return;
      const { overrides } = await res.json() as { overrides: { invoice_id: string; status: string }[] };
      for (const { invoice_id, status } of overrides) {
        setInvoiceStatus(tenant, invoice_id, status as Invoice["status"]);
      }
    } catch {
      // silently ignore — localStorage data is still shown
    }
  }, [tenant]);

  useEffect(() => {
    applyOverrides();
  }, [applyOverrides]);

  const totals = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    const out = invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amount, 0);
    const overdue = invoices.filter((i) => i.status === "overdue").length;
    return { paid, out, overdue };
  }, [invoices]);

  const save = (status: Invoice["status"]) => {
    if (!tenant) return;
    const clean = items.filter((it) => it.label.trim() && it.unit > 0);
    if (!clean.length) {
      toast("Add at least one line item", "danger");
      return;
    }
    const cust = customers.find((c) => c.id === customerId);
    const inv = createInvoice(tenant, {
      customerId: cust?.id,
      customerName: cust?.name ?? "Walk-in customer",
      items: clean,
      status,
    });
    toast(`${inv.number} ${status === "draft" ? "saved" : "sent"} — ${money(inv.amount)}`);
    if (status !== "draft") {
      persistStatus(tenant.slug, inv.id, status).catch(() => {});
    }
    setBuilding(false);
    setItems([{ label: "", qty: 1, unit: 0 }]);
    setCustomerId("");
  };

  const markStatus = (inv: Invoice, status: Invoice["status"], label: string) => {
    if (!tenant) return;
    setInvoiceStatus(tenant, inv.id, status);
    toast(label);
    persistStatus(tenant.slug, inv.id, status).catch(() => {});
  };

  return (
    <>
      <PageHead
        title="Invoices"
        sub="Raise it, send it, get paid — revenue rolls into your dashboard"
        actions={
          <Button size="sm" onClick={() => setBuilding(true)}>
            <Plus className="size-4" /> New invoice
          </Button>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Stat label="Collected" value={money(totals.paid)} icon={<BadgeDollarSign />} sub="all time" />
        <Stat label="Outstanding" value={money(totals.out)} sub="sent + overdue" />
        <Stat label="Overdue invoices" value={totals.overdue} sub="need a nudge" />
      </div>

      {invoices.length === 0 ? (
        <EmptyState title="No invoices yet" body="Build your first invoice — line items auto-total and the paid ones feed your revenue charts." action={<Button onClick={() => setBuilding(true)}><Plus className="size-4" /> New invoice</Button>} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Invoice</Th>
              <Th>Customer</Th>
              <Th>Issued</Th>
              <Th>Due</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {[...invoices]
              .sort((a, b) => b.issuedAt - a.issuedAt)
              .map((inv) => (
                <tr key={inv.id} className="transition-colors hover:bg-surface-2">
                  <Td className="font-mono text-xs">{inv.number}</Td>
                  <Td className="font-medium">{inv.customerName}</Td>
                  <Td className="text-muted">{dateShort(inv.issuedAt)}</Td>
                  <Td className="text-muted">{dateShort(inv.dueAt)}</Td>
                  <Td className="font-semibold">{money(inv.amount, inv.currency)}</Td>
                  <Td>
                    <Badge tone={STATUS_TONE[inv.status]}>{inv.status}</Badge>
                  </Td>
                  <Td>
                    <span className="flex items-center gap-1.5">
                      {inv.status !== "paid" && tenant && (
                        <Button variant="outline" size="sm" onClick={() => markStatus(inv, "paid", `${inv.number} marked paid`)}>
                          Mark paid
                        </Button>
                      )}
                      {inv.status === "draft" && tenant && (
                        <Button variant="ghost" size="sm" onClick={() => markStatus(inv, "sent", "Sent")}>
                          Send
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setPrinting(inv)} aria-label="Print">
                        <Printer className="size-4" />
                      </Button>
                    </span>
                  </Td>
                </tr>
              ))}
          </tbody>
        </Table>
      )}

      {/* Builder */}
      <Drawer
        open={building}
        onClose={() => setBuilding(false)}
        title="New invoice"
        footer={
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-bold">{money(invoiceTotal(items.filter((i) => i.label && i.unit > 0)))}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => save("draft")}>Save draft</Button>
              <Button onClick={() => save("sent")}>Send invoice</Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Customer">
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Walk-in customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <div>
            <p className="eyebrow mb-2">Line items</p>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={it.label} onChange={(e) => setItems((arr) => arr.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder={`e.g. ${system.recordNoun.singular} service`} className="flex-1" />
                  <Input type="number" min={1} value={it.qty} onChange={(e) => setItems((arr) => arr.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value) || 1 } : x)))} className="w-16" aria-label="Quantity" />
                  <Input type="number" min={0} value={it.unit || ""} onChange={(e) => setItems((arr) => arr.map((x, j) => (j === i ? { ...x, unit: Number(e.target.value) || 0 } : x)))} className="w-28" placeholder="Unit $" aria-label="Unit price" />
                  <span className="w-20 text-right text-xs font-semibold">{money(it.qty * it.unit)}</span>
                  <button onClick={() => setItems((arr) => arr.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-muted hover:bg-danger-soft hover:text-danger" aria-label="Remove line">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setItems((arr) => [...arr, { label: "", qty: 1, unit: 0 }])}>
              <Plus className="size-4" /> Add line
            </Button>
          </div>
        </div>
      </Drawer>

      {/* Print view */}
      <Modal open={!!printing} onClose={() => setPrinting(null)} wide title="Invoice preview">
        {printing && tenant && (
          <div>
            <div id="print-area" className="rounded-2xl border border-line p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <TenantLogo tenant={tenant} size={48} />
                  <div>
                    <p className="font-display text-lg font-bold">{tenant.businessName}</p>
                    <p className="text-xs text-muted">{tenant.contact.city ?? "Kingston, Jamaica"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold">{printing.number}</p>
                  <p className="text-xs text-muted">Issued {dateLong(printing.issuedAt)}</p>
                  <p className="text-xs text-muted">Due {dateLong(printing.dueAt)}</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-xs text-muted">Billed to</p>
                <p className="font-semibold">{printing.customerName}</p>
              </div>
              <table className="mt-6 w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="py-2">Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {printing.items.map((it, i) => (
                    <tr key={i} className="border-b border-line-2">
                      <td className="py-2.5">{it.label}</td>
                      <td className="py-2.5 text-center">{it.qty}</td>
                      <td className="py-2.5 text-right">{money(it.unit, printing.currency)}</td>
                      <td className="py-2.5 text-right font-medium">{money(it.qty * it.unit, printing.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end">
                <div className="rounded-xl bg-surface-2 px-5 py-3 text-right">
                  <p className="text-xs text-muted">Amount due</p>
                  <p className="font-display text-2xl font-bold">{money(printing.amount, printing.currency)}</p>
                </div>
              </div>
              <p className="mt-6 text-center text-[10px] text-muted">
                Thank you for your business · {tenant.businessName} · Powered by Supreme Suite
              </p>
            </div>
            <Button className="mt-4 w-full" onClick={() => window.print()}>
              <Printer className="size-4" /> Print / save as PDF
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}