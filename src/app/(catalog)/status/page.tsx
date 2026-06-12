"use client";

/* /status — the public self-check portal.
   Runs every page check + every business workflow live in the visitor's
   browser, against the real code paths, and shows the receipts. */

import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  CircleSlash,
  Download,
  Loader2,
  PlayCircle,
  ShieldCheck,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import type { CheckResult } from "@/suite/types";
import { runAllChecks } from "@/suite/lib/checks";
import { ROUTES, ACTIONS, WORKFLOWS } from "@/suite/lib/routes";
import { SYSTEMS } from "@/suite/systems";
import { downloadText } from "@/suite/lib/csv";
import { Badge, Button, Card, cx, SectionTitle, Stat } from "@/suite/components/ui";

const STATUS_META = {
  pass: { icon: CheckCircle2, cls: "text-ok", badge: "ok" as const },
  fail: { icon: XCircle, cls: "text-danger", badge: "danger" as const },
  warn: { icon: TriangleAlert, cls: "text-warn", badge: "warn" as const },
  skip: { icon: CircleSlash, cls: "text-muted", badge: "neutral" as const },
};

export default function StatusPage() {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>("Workflows");

  const run = async () => {
    setResults([]);
    setDone(false);
    setRunning(true);
    try {
      await runAllChecks((r) => setResults((prev) => [...prev, r]));
    } catch (e) {
      console.error("[ss-checks] crashed:", e);
      setResults((prev) => [
        ...prev,
        { id: "runner-crash", label: "Check runner crashed", group: "Platform", status: "fail", detail: String((e as any)?.message ?? e) },
      ]);
    }
    setRunning(false);
    setDone(true);
  };

  const groups = useMemo(() => {
    const map = new Map<string, CheckResult[]>();
    results.forEach((r) => {
      if (!map.has(r.group)) map.set(r.group, []);
      map.get(r.group)!.push(r);
    });
    return Array.from(map.entries());
  }, [results]);

  const counts = useMemo(
    () => ({
      pass: results.filter((r) => r.status === "pass").length,
      fail: results.filter((r) => r.status === "fail").length,
      warn: results.filter((r) => r.status === "warn").length,
    }),
    [results],
  );

  const total = ROUTES.length /* page checks */ + 7 /* workflow checks */ + 5; /* platform checks */

  return (
    <div className="container-x max-w-5xl py-14 md:py-18">
      <SectionTitle
        align="center"
        eyebrow="System check"
        title="Don't trust us. Verify us."
        sub={`This portal executes the platform's real code paths — ${ROUTES.length} pages, ${WORKFLOWS.length} business workflows, ${ACTIONS.length} action contracts, ${SYSTEMS.length} system packs — live in your browser, right now.`}
      />

      <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-3">
        <Button size="lg" variant="dark" className="w-full" onClick={run} disabled={running}>
          {running ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Checking… {results.length}/{total}
            </>
          ) : (
            <>
              <PlayCircle className="size-5" /> {done ? "Run the full check again" : "Run the full system check"}
            </>
          )}
        </Button>
        {done && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              downloadText(
                `supreme-suite-health-${new Date().toISOString().slice(0, 10)}.json`,
                JSON.stringify({ at: new Date().toISOString(), counts, results }, null, 2),
                "application/json",
              )
            }
          >
            <Download className="size-4" /> Download the receipts (JSON)
          </Button>
        )}
      </div>

      {(running || done) && (
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Passed" value={counts.pass} icon={<CheckCircle2 />} sub={done ? "verified live" : "so far…"} />
          <Stat label="Warnings" value={counts.warn} icon={<TriangleAlert />} sub="environment-dependent" />
          <Stat label="Failures" value={counts.fail} icon={<Activity />} sub={counts.fail === 0 ? "clean run 🎉" : "needs attention"} />
        </div>
      )}

      {groups.length > 0 && (
        <div className="mt-6 space-y-4">
          {groups.map(([group, rows]) => {
            const failCount = rows.filter((r) => r.status === "fail").length;
            const open = openGroup === group;
            return (
              <Card key={group} className="overflow-hidden">
                <button className="flex w-full items-center gap-3 px-5 py-4 text-left" onClick={() => setOpenGroup(open ? null : group)}>
                  <ShieldCheck className={cx("size-5", failCount ? "text-danger" : "text-ok")} />
                  <span className="font-display text-sm font-semibold">{group}</span>
                  <Badge tone={failCount ? "danger" : "ok"}>
                    {rows.filter((r) => r.status === "pass").length}/{rows.length} pass
                  </Badge>
                  <ChevronDown className={cx("ml-auto size-4 text-muted transition-transform", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="divide-y divide-line-2 border-t border-line">
                    {rows.map((r) => {
                      const meta = STATUS_META[r.status];
                      const Icon = meta.icon;
                      return (
                        <div key={r.id} className="flex items-start gap-3 px-5 py-3">
                          <Icon className={cx("mt-0.5 size-4.5 shrink-0", meta.cls)} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium">{r.label}</p>
                            {r.detail && <p className="mt-0.5 break-words text-[12px] text-muted">{r.detail}</p>}
                          </div>
                          {typeof r.ms === "number" && <span className="shrink-0 font-mono text-[10px] text-muted">{r.ms}ms</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* What gets verified */}
      <div className="mt-12">
        <SectionTitle eyebrow="What this verifies" title="The workflows behind every promise" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {WORKFLOWS.map((w) => (
            <Card key={w.id} className="p-5">
              <p className="font-display text-sm font-semibold">{w.title}</p>
              <ol className="mt-3 space-y-1.5">
                {w.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-ink-3">
                    <span className="mt-0.5 font-mono text-[10px] text-muted">{i + 1}.</span> {s}
                  </li>
                ))}
              </ol>
              <p className="mt-3 flex flex-wrap gap-1.5">
                {w.covers.map((c) => (
                  <span key={c} className="rounded-full bg-surface-3 px-2 py-0.5 font-mono text-[9px] text-muted">{c}</span>
                ))}
              </p>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-muted">
          Same checks run headlessly in CI via <code className="rounded bg-surface-3 px-1.5 py-0.5 font-mono">npm run smoke</code> — results in DOCS/HEALTH-REPORT.md.
        </p>
      </div>
    </div>
  );
}
