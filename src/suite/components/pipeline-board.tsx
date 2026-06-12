"use client";

/* PIPELINE BOARD — kanban over the system's stages.
   HTML5 drag & drop plus keyboard-accessible arrow controls (both call the
   same ops.setRecordStage path the self-checks verify). */

import { useState } from "react";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import type { CrmRecord, Customer, SystemDef, Tenant } from "../types";
import { setRecordStage } from "../lib/ops";
import { money, dateShort } from "../lib/format";
import { Avatar, Badge, cx, StatusDot } from "./ui";

export function PipelineBoard({
  tenant,
  system,
  records,
  customers,
  onOpen,
}: {
  tenant: Tenant;
  system: SystemDef;
  records: CrmRecord[];
  customers: Customer[];
  onOpen: (r: CrmRecord) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const custName = (id?: string) => customers.find((c) => c.id === id)?.name;

  const move = (rec: CrmRecord, dir: 1 | -1) => {
    const idx = system.pipeline.findIndex((s) => s.id === rec.status);
    const next = system.pipeline[idx + dir];
    if (next) setRecordStage(tenant, rec.id, next.id);
  };

  return (
    <div className="table-scroll -mx-1 flex gap-3 px-1 pb-2">
      {system.pipeline.map((stage) => {
        const rows = records.filter((r) => r.status === stage.id);
        const total = rows.reduce((s, r) => s + (r.value ?? 0), 0);
        return (
          <div
            key={stage.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage.id);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) setRecordStage(tenant, dragId, stage.id);
              setDragId(null);
              setOverStage(null);
            }}
            className={cx(
              "flex w-[270px] shrink-0 flex-col rounded-2xl border bg-surface-2 transition-colors",
              overStage === stage.id ? "border-brand bg-brand-softer" : "border-line",
            )}
          >
            <div className="flex items-center gap-2 px-3.5 pb-2 pt-3.5">
              <StatusDot tone={stage.tone} />
              <span className="text-xs font-semibold">{stage.label}</span>
              <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold text-muted">
                {rows.length}
              </span>
            </div>
            {total > 0 && (
              <p className="px-3.5 pb-2 text-[10px] font-medium text-muted">{money(total)} in stage</p>
            )}
            <div className="flex-1 space-y-2 overflow-y-auto px-2.5 pb-3" style={{ maxHeight: "60vh" }}>
              {rows.map((rec) => (
                <div
                  key={rec.id}
                  draggable
                  onDragStart={() => setDragId(rec.id)}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => onOpen(rec)}
                  className={cx(
                    "group cursor-pointer rounded-xl border border-line bg-surface p-3 shadow-sm transition-all hover:border-brand hover:shadow-card",
                    dragId === rec.id && "opacity-50",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-0.5 size-3.5 shrink-0 cursor-grab text-muted-2" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold leading-snug">{rec.title}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-muted">{rec.ref}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    {rec.assignee ? <Avatar name={rec.assignee} className="size-6 text-[9px]" /> : null}
                    <span className="truncate text-[11px] text-muted">{custName(rec.customerId) ?? "—"}</span>
                    <span className="ml-auto flex items-center gap-1.5">
                      {rec.value ? <Badge tone="progress">{money(rec.value)}</Badge> : null}
                      {rec.due ? <span className="text-[10px] text-muted">{dateShort(rec.due)}</span> : null}
                    </span>
                  </div>
                  <div className="mt-2 hidden items-center justify-between gap-1 group-hover:flex">
                    <button
                      className="rounded-md p-1 text-muted hover:bg-surface-3 hover:text-ink disabled:opacity-30"
                      disabled={system.pipeline[0]?.id === rec.status}
                      onClick={(e) => {
                        e.stopPropagation();
                        move(rec, -1);
                      }}
                      aria-label="Move to previous stage"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>
                    <span className="text-[9px] uppercase tracking-wide text-muted-2">move</span>
                    <button
                      className="rounded-md p-1 text-muted hover:bg-surface-3 hover:text-ink disabled:opacity-30"
                      disabled={system.pipeline[system.pipeline.length - 1]?.id === rec.status}
                      onClick={(e) => {
                        e.stopPropagation();
                        move(rec, 1);
                      }}
                      aria-label="Move to next stage"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-[11px] text-muted-2">
                  Drop {system.recordNoun.plural.toLowerCase()} here
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
