"use client";

/* Records — table + pipeline board views over the system's records. */

import { useMemo, useState } from "react";
import { KanbanSquare, Plus, Rows3, Search } from "lucide-react";
import type { CrmRecord, Customer } from "@/suite/types";
import { useCol } from "@/suite/lib/store";
import { money, dateShort, relTime } from "@/suite/lib/format";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Badge, Button, EmptyState, Input, Select, Table, Td, Th, TONE_STYLES } from "@/suite/components/ui";
import { Tabs } from "@/suite/components/overlays";
import { PipelineBoard } from "@/suite/components/pipeline-board";
import { RecordDrawer } from "@/suite/components/record-form";

export default function RecordsPage() {
  const { tenant, system } = useWorkspace();
  const records = useCol<CrmRecord>(tenant?.id, "records");
  const customers = useCol<Customer>(tenant?.id, "customers");
  const [view, setView] = useState<"board" | "table">("board");
  const [q, setQ] = useState("");
  const [stage, setStage] = useState("");
  const [editing, setEditing] = useState<CrmRecord | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return records
      .filter((r) => (stage ? r.status === stage : true))
      .filter((r) =>
        needle
          ? r.title.toLowerCase().includes(needle) ||
            r.ref.toLowerCase().includes(needle) ||
            (customers.find((c) => c.id === r.customerId)?.name.toLowerCase().includes(needle) ?? false)
          : true,
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [records, q, stage, customers]);

  const stageOf = (id: string) => system.pipeline.find((s) => s.id === id);
  const tableCols = system.fields.filter((f) => f.showInTable).slice(0, 3);

  return (
    <>
      <PageHead
        title={system.recordNoun.plural}
        sub={`Pipeline: ${system.pipeline.map((s) => s.label).join(" → ")}`}
        actions={
          <>
            <Tabs
              value={view}
              onChange={(v) => setView(v as "board" | "table")}
              tabs={[
                { id: "board", label: <span className="flex items-center gap-1.5"><KanbanSquare className="size-3.5" /> Board</span> },
                { id: "table", label: <span className="flex items-center gap-1.5"><Rows3 className="size-3.5" /> Table</span> },
              ]}
            />
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> New {system.recordNoun.singular.toLowerCase()}
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-2" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${system.recordNoun.plural.toLowerCase()}…`} className="w-64 pl-9" />
        </div>
        <Select value={stage} onChange={(e) => setStage(e.target.value)} className="w-48">
          <option value="">All stages</option>
          {system.pipeline.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
        <span className="ml-auto text-xs text-muted">
          {filtered.length} of {records.length}
        </span>
      </div>

      {tenant && records.length === 0 ? (
        <EmptyState
          title={`No ${system.recordNoun.plural.toLowerCase()} yet`}
          body="Create your first one, or share your website so bookings arrive on their own."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Create {system.recordNoun.singular.toLowerCase()}
            </Button>
          }
        />
      ) : view === "board" && tenant ? (
        <PipelineBoard tenant={tenant} system={system} records={filtered} customers={customers} onOpen={setEditing} />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Ref</Th>
              <Th>Title</Th>
              <Th>Stage</Th>
              <Th>Customer</Th>
              {tableCols.map((c) => (
                <Th key={c.key}>{c.label}</Th>
              ))}
              <Th>Value</Th>
              <Th>Due</Th>
              <Th>Updated</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const st = stageOf(r.status);
              return (
                <tr key={r.id} className="cursor-pointer transition-colors hover:bg-surface-2" onClick={() => setEditing(r)}>
                  <Td className="font-mono text-xs text-muted">{r.ref}</Td>
                  <Td className="max-w-56"><span className="block truncate font-medium">{r.title}</span></Td>
                  <Td><Badge tone={st?.tone ?? "neutral"}>{st?.label ?? r.status}</Badge></Td>
                  <Td className="text-muted">{customers.find((c) => c.id === r.customerId)?.name ?? "—"}</Td>
                  {tableCols.map((c) => (
                    <Td key={c.key} className="max-w-44 text-muted">
                      <span className="block truncate">{String(r.fields[c.key] ?? "—")}</span>
                    </Td>
                  ))}
                  <Td className="font-medium">{r.value ? money(r.value) : "—"}</Td>
                  <Td className="text-muted">{r.due ? dateShort(r.due) : "—"}</Td>
                  <Td className="text-xs text-muted">{relTime(r.updatedAt)}</Td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <Td colSpan={8 + tableCols.length} className="py-10 text-center text-sm text-muted">
                  Nothing matches that filter.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {tenant && (
        <RecordDrawer
          open={creating || !!editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          tenant={tenant}
          system={system}
          customers={customers}
          record={editing}
        />
      )}

      <p className="sr-only">Pipeline</p>
    </>
  );
}
