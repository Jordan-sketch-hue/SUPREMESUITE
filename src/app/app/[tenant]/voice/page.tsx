"use client";

/* AI Voice Agent — live in-browser voice console + call log. */

import { AudioLines, PhoneCall } from "lucide-react";
import type { Message } from "@/suite/types";
import { useCol } from "@/suite/lib/store";
import { relTime } from "@/suite/lib/format";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Badge, Card, CardHeader, EmptyState } from "@/suite/components/ui";
import { VoiceConsole } from "@/suite/components/voice-console";

export default function VoicePage() {
  const { tenant, system } = useWorkspace();
  const messages = useCol<Message>(tenant?.id, "messages");
  const calls = messages.filter((m) => m.channel === "voice").sort((a, b) => b.at - a.at);

  return (
    <>
      <PageHead
        title="Voice Agent"
        sub="A receptionist that answers out loud — try a live call right now, in your browser"
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {tenant && <VoiceConsole tenant={tenant} system={system} />}
          <Card className="mt-4">
            <CardHeader title="How this becomes your real phone line" />
            <ol className="list-decimal space-y-2 px-5 pb-5 pl-10 text-[13px] text-ink-3">
              <li>This demo runs entirely in your browser — same brain as your chatbot, with real speech.</li>
              <li>On a paid plan we connect a real phone number (Twilio) so callers reach this agent.</li>
              <li>Every call is logged with an AI summary; bookings drop into your pipeline automatically.</li>
            </ol>
          </Card>
        </div>

        <Card>
          <CardHeader title="Call log" sub="Ended test calls + voicemail notes" />
          <div className="px-5 pb-5">
            {calls.length === 0 ? (
              <EmptyState icon={<PhoneCall />} title="No calls yet" body="Start a test call — when you end it, the summary logs here and in Messages." className="py-8" />
            ) : (
              <ul className="divide-y divide-line-2">
                {calls.map((c) => (
                  <li key={c.id} className="flex items-start gap-3 py-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft">
                      <AudioLines className="size-4 text-brand-strong" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[13px] font-semibold">
                        {c.customerName} <Badge tone="warn">voice</Badge>
                        <span className="text-[10px] font-normal text-muted">{relTime(c.at)}</span>
                      </p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{c.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
