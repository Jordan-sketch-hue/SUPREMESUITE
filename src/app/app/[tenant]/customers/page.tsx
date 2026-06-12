"use client";

/* Customers — directory + profile drawer (timeline, loyalty, notes). */

import { useMemo, useState } from "react";
import { Plus, Search, Star, UserPlus } from "lucide-react";
import type { CrmRecord, Customer, Invoice, Message } from "@/suite/types";
import { useCol } from "@/suite/lib/store";
import { addPoints, loyaltyTier, upsertCustomer } from "@/suite/lib/ops";
import { removeRow } from "@/suite/lib/store";
import { money, relTime } from "@/suite/lib/format";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Avatar, Badge, Button, EmptyState, Field, Input, Table, Td, Th, Textarea } from "@/suite/components/ui";
import { Drawer, ConfirmButton, useToast } from "@/suite/components/overlays";

export default function CustomersPage() {
  const { tenant, system } = useWorkspace();
  const toast = useToast();
  const customers = useCol<Customer>(tenant?.id, "customers");
  const records = useCol<CrmRecord>(tenant?.id, "records");
  const invoices = useCol<Invoice>(tenant?.id, "invoices");
  const messages = useCol<Message>(tenant?.id, "messages");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", phone: "", email: "", city: "", notes: "" });

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return [...customers]
      .filter((c) => (needle ? c.name.toLowerCase().includes(needle) || c.phone?.includes(needle) || c.email?.toLowerCase().includes(needle) : true))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [customers, q]);

  const open = customers.find((c) => c.id === openId) ?? null;
  const openRecords = records.filter((r) => r.customerId === openId);
  const openInvoices = invoices.filter((i) => i.customerId === openId);
  const openMessages = messages.filter((m) => m.customerId === openId).slice(0, 5);

  const create = () => {
    if (!tenant || !draft.name.trim()) {
      toast("Name is required", "danger");
      return;
    }
    upsertCustomer(tenant, { ...draft, name: draft.name.trim(), tags: [] });
    toast("Customer added");
    setCreating(false);
    setDraft({ name: "", phone: "", email: "", city: "", notes: "" });
  };

  return (
    <>
      <PageHead
        title="Customers"
        sub={`${customers.length} people in your book`}
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <UserPlus className="size-4" /> Add customer
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-2" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email…" className="w-72 pl-9" />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No customers yet" body="Add your first customer, or convert a booking — converted bookings create customers automatically." action={<Button onClick={() => setCreating(true)}><Plus className="size-4" /> Add customer</Button>} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Customer</Th>
              <Th>Contact</Th>
              <Th>City</Th>
              <Th>Tags</Th>
              <Th>Loyalty</Th>
              <Th>{system.recordNoun.plural}</Th>
              <Th>Lifetime value</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const recCount = records.filter((r) => r.customerId === c.id).length;
              const ltv = invoices.filter((i) => i.customerId === c.id && i.status === "paid").reduce((s, i) => s + i.amount, 0);
              const tier = loyaltyTier(c.points);
              return (
                <tr key={c.id} className="cursor-pointer transition-colors hover:bg-surface-2" onClick={() => setOpenId(c.id)}>
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <Avatar name={c.name} />
                      <span className="font-medium">{c.name}</span>
                    </span>
                  </Td>
                  <Td className="text-muted">
                    <span className="block text-xs">{c.phone ?? "—"}</span>
                    <span className="block truncate text-xs">{c.email ?? ""}</span>
                  </Td>
                  <Td className="text-muted">{c.city ?? "—"}</Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                    </span>
                  </Td>
                  <Td>
                    <Badge tone={tier.name === "Gold" ? "warn" : tier.name === "Silver" ? "info" : "neutral"}>
                      <Star className="size-3" /> {tier.name} · {c.points}
                    </Badge>
                  </Td>
                  <Td className="font-medium">{recCount}</Td>
                  <Td className="font-medium">{ltv ? money(ltv) : "—"}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {/* Profile drawer */}
      <Drawer
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.name}
        footer={
          open && tenant ? (
            <div className="flex items-center justify-between">
              <ConfirmButton
                label="Delete customer"
                onConfirm={() => {
                  removeRow(tenant.id, "customers", open.id);
                  setOpenId(null);
                  toast("Customer removed", "neutral");
                }}
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { addPoints(tenant, open.id, 25); toast("+25 points"); }}>
                  +25 pts
                </Button>
                <Button size="sm" onClick={() => { addPoints(tenant, open.id, 100); toast("+100 points"); }}>
                  +100 pts
                </Button>
              </div>
            </div>
          ) : undefined
        }
      >
        {open && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={open.name} className="size-14 text-base" />
              <div>
                <p className="font-display text-lg font-semibold">{open.name}</p>
                <p className="text-xs text-muted">{[open.phone, open.email, open.city].filter(Boolean).join(" · ")}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-surface-2 p-3">
                <p className="font-display text-xl font-bold">{openRecords.length}</p>
                <p className="text-[10px] text-muted">{system.recordNoun.plural}</p>
              </div>
              <div className="rounded-2xl bg-surface-2 p-3">
                <p className="font-display text-xl font-bold">{money(openInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0))}</p>
                <p className="text-[10px] text-muted">Paid to date</p>
              </div>
              <div className="rounded-2xl bg-brand-soft p-3">
                <p className="font-display text-xl font-bold text-brand-strong">{open.points}</p>
                <p className="text-[10px] text-brand-muted">{loyaltyTier(open.points).name} member</p>
              </div>
            </div>

            <div>
              <p className="eyebrow mb-2">{system.recordNoun.plural}</p>
              {openRecords.length === 0 ? (
                <p className="text-xs text-muted">None yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {openRecords.slice(0, 6).map((r) => (
                    <li key={r.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-xs">
                      <span className="truncate font-medium">{r.ref} · {r.title}</span>
                      <Badge tone={system.pipeline.find((s) => s.id === r.status)?.tone ?? "neutral"}>
                        {system.pipeline.find((s) => s.id === r.status)?.label ?? r.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="eyebrow mb-2">Recent messages</p>
              {openMessages.length === 0 ? (
                <p className="text-xs text-muted">No conversation history.</p>
              ) : (
                <ul className="space-y-1.5">
                  {openMessages.map((m) => (
                    <li key={m.id} className="rounded-xl bg-surface-2 px-3 py-2 text-xs">
                      <span className="font-semibold">{m.direction === "inbound" ? "Them" : "You"}</span>{" "}
                      <span className="text-muted">({m.channel}, {relTime(m.at)}):</span> {m.body}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {open.notes ? (
              <div>
                <p className="eyebrow mb-2">Notes</p>
                <p className="rounded-xl bg-surface-2 px-3 py-2 text-xs text-ink-3">{open.notes}</p>
              </div>
            ) : null}
          </div>
        )}
      </Drawer>

      {/* Create drawer */}
      <Drawer
        open={creating}
        onClose={() => setCreating(false)}
        title="Add customer"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={create}>Add customer</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Full name" required>
            <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Keisha Brown" autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <Input value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} placeholder="(876) …" />
            </Field>
            <Field label="City">
              <Input value={draft.city} onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))} placeholder="Kingston" />
            </Field>
          </div>
          <Field label="Email">
            <Input type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} placeholder="them@email.com" />
          </Field>
          <Field label="Notes">
            <Textarea value={draft.notes} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} placeholder="Preferences, history, anything useful…" />
          </Field>
        </div>
      </Drawer>
    </>
  );
}
