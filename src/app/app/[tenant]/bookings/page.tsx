"use client";

/* Bookings inbox — website/widget requests → confirm, convert, decline. */

import { useMemo, useState } from "react";
import { ArrowRightCircle, Check, Globe, Inbox as InboxIcon, Sparkles, X } from "lucide-react";
import type { Booking } from "@/suite/types";
import { useCol } from "@/suite/lib/store";
import { convertBooking, setBookingStatus } from "@/suite/lib/ops";
import { relTime } from "@/suite/lib/format";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Badge, Button, Card, EmptyState, cx } from "@/suite/components/ui";
import { Tabs, useToast } from "@/suite/components/overlays";

const STATUS_TONE = { new: "info", confirmed: "progress", converted: "ok", declined: "danger" } as const;

export default function BookingsPage() {
  const { tenant, system } = useWorkspace();
  const toast = useToast();
  const bookings = useCol<Booking>(tenant?.id, "bookings");
  const [tab, setTab] = useState<"new" | "all">("new");

  const rows = useMemo(
    () =>
      [...bookings]
        .filter((b) => (tab === "new" ? b.status === "new" || b.status === "confirmed" : true))
        .sort((a, b) => b.requestedAt - a.requestedAt),
    [bookings, tab],
  );

  return (
    <>
      <PageHead
        title="Bookings"
        sub="Requests from your public website and AI assistant land here instantly"
        actions={
          <Tabs
            value={tab}
            onChange={(v) => setTab(v as "new" | "all")}
            tabs={[
              { id: "new", label: `Needs action (${bookings.filter((b) => b.status === "new" || b.status === "confirmed").length})` },
              { id: "all", label: `All (${bookings.length})` },
            ]}
          />
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<InboxIcon />}
          title="Inbox zero — nice."
          body={`New requests from your website's "${system.website.primaryCta}" form appear here in real time.`}
        />
      ) : (
        <div className="grid gap-3">
          {rows.map((b) => (
            <Card key={b.id} className={cx("transition-colors", b.status === "new" && "border-brand-ring bg-brand-softer")}>
              <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
                  {b.source === "widget" ? <Sparkles className="size-4.5 text-brand-strong" /> : <Globe className="size-4.5 text-brand-strong" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {b.customerName}
                    <Badge tone={STATUS_TONE[b.status]}>{b.status}</Badge>
                    <span className="text-[11px] font-normal text-muted">{relTime(b.requestedAt)} · via {b.source === "widget" ? "AI assistant" : "website"}</span>
                  </p>
                  <p className="mt-1 truncate text-[13px] text-ink-3">
                    {Object.entries(b.fields)
                      .filter(([, v]) => v !== "" && v != null)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ") || "No details provided"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {[b.phone, b.email].filter(Boolean).join(" · ")}
                    {b.note ? ` · “${b.note}”` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {b.status === "new" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (tenant) setBookingStatus(tenant, b.id, "confirmed");
                        toast("Confirmed — customer expects you!");
                      }}
                    >
                      <Check className="size-4" /> Confirm
                    </Button>
                  )}
                  {(b.status === "new" || b.status === "confirmed") && tenant && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          const { record } = convertBooking(tenant, system, b);
                          toast(`Created ${record.ref} in your pipeline`);
                        }}
                      >
                        <ArrowRightCircle className="size-4" /> Convert to {system.recordNoun.singular.toLowerCase()}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setBookingStatus(tenant, b.id, "declined");
                          toast("Declined", "neutral");
                        }}
                        aria-label="Decline"
                      >
                        <X className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
