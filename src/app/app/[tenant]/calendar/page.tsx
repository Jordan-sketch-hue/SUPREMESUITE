"use client";

/* Calendar page — month grid fed by records, bookings and manual events. */

import type { Booking, CrmRecord } from "@/suite/types";
import { useCol } from "@/suite/lib/store";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { CalendarView } from "@/suite/components/calendar";
import { StatusDot } from "@/suite/components/ui";

export default function CalendarPage() {
  const { tenant, system } = useWorkspace();
  const records = useCol<CrmRecord>(tenant?.id, "records");
  const bookings = useCol<Booking>(tenant?.id, "bookings");

  return (
    <>
      <PageHead
        title="Calendar"
        sub={`Due ${system.recordNoun.plural.toLowerCase()}, confirmed bookings and your own events`}
        actions={
          <div className="flex items-center gap-4 text-[11px] text-muted">
            <span className="flex items-center gap-1.5"><StatusDot tone="progress" /> {system.recordNoun.plural}</span>
            <span className="flex items-center gap-1.5"><StatusDot tone="info" /> Bookings</span>
            <span className="flex items-center gap-1.5"><StatusDot tone="neutral" /> Events</span>
          </div>
        }
      />
      {tenant ? (
        <CalendarView tenant={tenant} system={system} records={records} bookings={bookings} />
      ) : (
        <div className="rounded-2xl border border-dashed border-line p-16 text-center text-sm text-muted">Loading calendar…</div>
      )}
    </>
  );
}
