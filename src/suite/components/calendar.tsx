"use client";

/* CALENDAR — month grid + upcoming list, fed by records (due dates),
   confirmed bookings, and manual events. */

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Booking, CalendarEvent, CrmRecord, SystemDef, Tenant } from "../types";
import { useCol } from "../lib/store";
import { upsertRow } from "../lib/store";
import { uid } from "../lib/ids";
import { timeShort } from "../lib/format";
import { Button, Card, cx, Field, Input } from "./ui";
import { Modal, useToast } from "./overlays";

interface DayItem {
  id: string;
  label: string;
  kind: "record" | "booking" | "event";
  time?: string;
}

export function CalendarView({
  tenant,
  system,
  records,
  bookings,
}: {
  tenant: Tenant;
  system: SystemDef;
  records: CrmRecord[];
  bookings: Booking[];
}) {
  const toast = useToast();
  const events = useCol<CalendarEvent>(tenant.id, "events");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [adding, setAdding] = useState<string | null>(null); // ISO day
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("10:00");

  const byDay = useMemo(() => {
    const map = new Map<string, DayItem[]>();
    const push = (day: string, item: DayItem) => {
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(item);
    };
    records.forEach((r) => {
      if (r.due) push(r.due, { id: r.id, label: `${r.ref} · ${r.title}`, kind: "record" });
    });
    bookings
      .filter((b) => b.status === "confirmed" || b.status === "new")
      .forEach((b) => {
        const day = typeof b.fields.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.fields.date) ? b.fields.date : null;
        if (day)
          push(day, {
            id: b.id,
            label: `${b.customerName} · ${b.fields.service ?? "booking"}`,
            kind: "booking",
            time: typeof b.fields.time === "string" ? b.fields.time : undefined,
          });
      });
    events.forEach((e) => {
      const day = new Date(e.start).toISOString().slice(0, 10);
      push(day, { id: e.id, label: e.title, kind: "event", time: timeShort(e.start) });
    });
    return map;
  }, [records, bookings, events]);

  const first = new Date(cursor.y, cursor.m, 1);
  const startPad = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const todayIso = new Date().toISOString().slice(0, 10);
  const monthLabel = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cells: Array<{ iso: string; day: number } | null> = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const iso = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
      return { iso, day: i + 1 };
    }),
  ];

  const addEvent = () => {
    if (!adding || !title.trim()) return;
    const [h, min] = time.split(":").map(Number);
    const start = new Date(`${adding}T00:00:00`);
    start.setHours(h ?? 10, min ?? 0);
    const ev: CalendarEvent = {
      id: uid(),
      tenantId: tenant.id,
      title: title.trim(),
      start: start.getTime(),
      end: start.getTime() + 3600000,
      kind: "manual",
    };
    upsertRow(tenant.id, "events", ev);
    toast("Event added");
    setAdding(null);
    setTitle("");
  };

  const KIND_STYLE: Record<DayItem["kind"], string> = {
    record: "bg-brand-soft text-brand-strong",
    booking: "bg-info-soft text-info",
    event: "bg-surface-3 text-ink-3",
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h3 className="font-display text-sm font-semibold">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const d = new Date();
              setCursor({ y: d.getFullYear(), m: d.getMonth() });
            }}
          >
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-line bg-surface-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={cx(
              "group relative min-h-24 border-b border-r border-line-2 p-1.5",
              !cell && "bg-surface-2",
              cell?.iso === todayIso && "bg-brand-softer",
            )}
          >
            {cell && (
              <>
                <div className="flex items-center justify-between">
                  <span
                    className={cx(
                      "inline-flex size-6 items-center justify-center rounded-full text-[11px] font-semibold",
                      cell.iso === todayIso ? "bg-brand text-brand-fg" : "text-ink-3",
                    )}
                  >
                    {cell.day}
                  </span>
                  <button
                    className="hidden rounded-md p-0.5 text-muted hover:bg-surface-3 group-hover:block"
                    onClick={() => setAdding(cell.iso)}
                    aria-label={`Add event on ${cell.iso}`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <div className="mt-1 space-y-1">
                  {(byDay.get(cell.iso) ?? []).slice(0, 3).map((item) => (
                    <p key={item.id} className={cx("truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium", KIND_STYLE[item.kind])}>
                      {item.time ? `${item.time} · ` : ""}
                      {item.label}
                    </p>
                  ))}
                  {(byDay.get(cell.iso)?.length ?? 0) > 3 && (
                    <p className="px-1.5 text-[10px] text-muted">+{byDay.get(cell.iso)!.length - 3} more</p>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <Modal open={!!adding} onClose={() => setAdding(null)} title={`Add event — ${adding ?? ""}`}>
        <div className="space-y-4">
          <Field label="What's happening?" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`e.g. ${system.recordNoun.singular} follow-up`} autoFocus />
          </Field>
          <Field label="Time">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Button className="w-full" onClick={addEvent}>
            Add to calendar
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
