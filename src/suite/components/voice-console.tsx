"use client";

/* VOICE CONSOLE — in-browser voice receptionist.
   Real speech-to-text (webkitSpeechRecognition) + text-to-speech replies from
   the same AI brain as the chat widget. Calls are logged to Messages with the
   'voice' channel. Graceful text fallback where speech APIs are missing. */

import { AudioLines, Mic, MicOff, PhoneOff, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SystemDef, Tenant } from "../types";
import {
  defaultBotConfig,
  initialChatState,
  replyFor,
  speak,
  speechSupport,
  type BotConfig,
  type ChatState,
} from "../lib/ai";
import { sendMessage, submitBooking } from "../lib/ops";
import { useDoc } from "../lib/store";
import { Badge, Button, Card, cx, Input } from "./ui";
import { useToast } from "./overlays";

interface Turn {
  who: "caller" | "agent";
  text: string;
}

export function VoiceConsole({ tenant, system }: { tenant: Tenant; system: SystemDef }) {
  const toast = useToast();
  const stored = useDoc<BotConfig | null>(tenant.id, "botcfg", null);
  const cfg = stored ?? defaultBotConfig(tenant, system);
  const [support, setSupport] = useState({ stt: false, tts: false });
  const [live, setLive] = useState(false);
  const [listening, setListening] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [typed, setTyped] = useState("");
  const [voiceName, setVoiceName] = useState<string>("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const stateRef = useRef<ChatState>(initialChatState);
  const recRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSupport(speechSupport());
    const load = () => setVoices(window.speechSynthesis?.getVoices() ?? []);
    load();
    window.speechSynthesis?.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener("voiceschanged", load);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const handleCaller = (text: string) => {
    const msg = text.trim();
    if (!msg) return;
    setTurns((t) => [...t, { who: "caller", text: msg }]);
    const ctx = { tenant, system, cfg, services: system.website.services.map((s) => s.title) };
    const r = replyFor(stateRef.current, msg, ctx);
    stateRef.current = r.state;
    setTimeout(() => {
      setTurns((t) => [...t, { who: "agent", text: r.text }]);
      if (support.tts) speak(r.text, voiceName || undefined);
      if (r.booking) {
        submitBooking(tenant.id, system.slug, { ...r.booking, source: "widget" });
        toast("Booking captured from the call");
      }
    }, 350);
  };

  const startListening = () => {
    const W = window as any;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      setListening(false);
      handleCaller(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const startCall = () => {
    setLive(true);
    setTurns([{ who: "agent", text: cfg.greeting }]);
    stateRef.current = initialChatState;
    if (support.tts) speak(cfg.greeting, voiceName || undefined);
  };

  const endCall = () => {
    setLive(false);
    setListening(false);
    recRef.current?.stop?.();
    window.speechSynthesis?.cancel();
    if (turns.length > 1) {
      const callerLines = turns.filter((t) => t.who === "caller").length;
      sendMessage(tenant, {
        customerName: "Voice caller",
        body: `Voice call ended — ${turns.length} turns (${callerLines} from caller). Last: "${turns[turns.length - 1]?.text.slice(0, 120)}"`,
        channel: "voice",
        direction: "note",
      });
      toast("Call logged to Messages");
    }
    setTurns([]);
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line bg-surface-2 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={cx("flex size-10 items-center justify-center rounded-2xl", live ? "bg-brand text-brand-fg" : "bg-brand-soft text-brand")}>
              <AudioLines className={cx("size-5", live && "animate-pulse")} />
            </span>
            <div>
              <p className="text-sm font-semibold">{cfg.assistantName} — live voice line</p>
              <p className="text-[11px] text-muted">
                {support.stt ? "Microphone + voice replies ready" : support.tts ? "Voice replies ready (type to talk — mic unsupported here)" : "Text simulation (this browser has no speech APIs)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {voices.length > 0 && (
              <select
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                className="h-9 rounded-xl border border-line bg-surface px-2 text-xs"
                aria-label="Agent voice"
              >
                <option value="">Default voice</option>
                {voices
                  .filter((v) => v.lang.startsWith("en"))
                  .slice(0, 12)
                  .map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name.replace("Microsoft ", "").slice(0, 28)}
                    </option>
                  ))}
              </select>
            )}
            {live ? (
              <Button variant="danger" size="sm" onClick={endCall}>
                <PhoneOff className="size-4" /> End call
              </Button>
            ) : (
              <Button size="sm" onClick={startCall}>
                <Mic className="size-4" /> Start test call
              </Button>
            )}
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="h-72 space-y-3 overflow-y-auto bg-surface-2 px-5 py-4">
        {!live && turns.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-ink-3">Press “Start test call” to hear your agent answer.</p>
            <p className="mt-1 max-w-sm text-xs text-muted">
              It greets callers, answers prices and hours out loud, and books appointments mid-conversation.
            </p>
          </div>
        )}
        {turns.map((t, i) => (
          <div key={i} className={cx("flex", t.who === "caller" ? "justify-end" : "justify-start")}>
            <div
              className={cx(
                "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                t.who === "caller" ? "rounded-br-md bg-ink text-white" : "rounded-bl-md border border-line bg-surface",
              )}
            >
              <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider opacity-60">
                {t.who === "caller" ? "Caller" : cfg.assistantName}
              </p>
              {t.text}
            </div>
          </div>
        ))}
      </div>

      {live && (
        <div className="flex items-center gap-2 border-t border-line bg-surface p-3">
          {support.stt && (
            <Button variant={listening ? "danger" : "soft"} onClick={listening ? () => recRef.current?.stop?.() : startListening}>
              {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              {listening ? "Listening…" : "Speak"}
            </Button>
          )}
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleCaller(typed);
              setTyped("");
            }}
          >
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={support.stt ? "…or type what the caller says" : "Type what the caller says"} className="flex-1" />
            <Button type="submit" variant="outline" aria-label="Send as caller">
              <Send className="size-4" />
            </Button>
          </form>
          {listening && <Badge tone="danger">● rec</Badge>}
        </div>
      )}
    </Card>
  );
}
