"use client";

/* Integrations — connect third-party APIs, import data from external sources,
   export data with AI-powered analysis. All connection config lives on the
   Tenant record in localStorage (trial); moves to a server-side secrets vault
   at production rollout. */

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileUp,
  Link2,
  Link2Off,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
  Webhook,
  X,
} from "lucide-react";
import { saveTenant } from "@/suite/lib/store";
import { downloadText } from "@/suite/lib/csv";
import { useWorkspace } from "@/suite/components/use-workspace";
import { PageHead } from "@/suite/components/app-shell";
import { Badge, Button, Card, CardHeader, cx, Field, Input } from "@/suite/components/ui";
import { Modal, useToast } from "@/suite/components/overlays";
import type { ApiConnection } from "@/suite/types";

/* ── Integration catalog ─────────────────────────────────────────────────── */

interface IntegrationDef {
  id: string;
  name: string;
  category: string;
  description: string;
  logo: string; // emoji fallback
  docsUrl?: string;
  fields: { key: string; label: string; placeholder: string; secret?: boolean }[];
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    category: "Messaging",
    description: "Send booking confirmations, reminders, and invoice links via WhatsApp Cloud API.",
    logo: "💬",
    docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api",
    fields: [
      { key: "phoneId", label: "Phone Number ID", placeholder: "1234567890" },
      { key: "token", label: "Access Token", placeholder: "EAAx…", secret: true },
      { key: "wabaId", label: "WABA ID", placeholder: "9876543210" },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Payments",
    description: "Accept card payments for invoices, bookings, and subscriptions.",
    logo: "💳",
    docsUrl: "https://stripe.com/docs/keys",
    fields: [
      { key: "publishable", label: "Publishable Key", placeholder: "pk_live_…" },
      { key: "secret", label: "Secret Key", placeholder: "sk_live_…", secret: true },
      { key: "webhookSecret", label: "Webhook Secret", placeholder: "whsec_…", secret: true },
    ],
  },
  {
    id: "wipay",
    name: "WiPay (JMD)",
    category: "Payments",
    description: "Accept JMD payments via WiPay — Jamaica's leading payment gateway.",
    logo: "🇯🇲",
    docsUrl: "https://wipayfinancial.com",
    fields: [
      { key: "accountNumber", label: "WiPay Account Number", placeholder: "WP-…" },
      { key: "apiKey", label: "API Key", placeholder: "…", secret: true },
    ],
  },
  {
    id: "meta",
    name: "Meta (Facebook / Instagram)",
    category: "Social",
    description: "Auto-post content, read DMs, and run lead ad integrations via Meta Graph API.",
    logo: "📘",
    docsUrl: "https://developers.facebook.com/docs/graph-api",
    fields: [
      { key: "pageToken", label: "Page Access Token", placeholder: "EAAx…", secret: true },
      { key: "pageId", label: "Facebook Page ID", placeholder: "1234567890" },
      { key: "igId", label: "Instagram Account ID", placeholder: "9876543210" },
    ],
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    category: "Scheduling",
    description: "Sync bookings and appointments two-way with Google Calendar.",
    logo: "📅",
    docsUrl: "https://developers.google.com/calendar",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "AIza…", secret: true },
      { key: "calendarId", label: "Calendar ID", placeholder: "primary" },
    ],
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    category: "Email Marketing",
    description: "Sync customers to Mailchimp lists and trigger email sequences automatically.",
    logo: "📧",
    docsUrl: "https://mailchimp.com/developer",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "xxxxxxxx-us21", secret: true },
      { key: "listId", label: "Audience / List ID", placeholder: "abc12345" },
      { key: "server", label: "Server Prefix", placeholder: "us21" },
    ],
  },
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    category: "Accounting",
    description: "Push invoices and payments to QuickBooks for automatic bookkeeping.",
    logo: "📊",
    docsUrl: "https://developer.intuit.com",
    fields: [
      { key: "clientId", label: "Client ID", placeholder: "ABxxx…" },
      { key: "clientSecret", label: "Client Secret", placeholder: "…", secret: true },
      { key: "realmId", label: "Company ID (Realm)", placeholder: "123456789" },
    ],
  },
  {
    id: "shopify",
    name: "Shopify",
    category: "E-Commerce",
    description: "Pull orders and customer data from your Shopify store into the workspace.",
    logo: "🛍️",
    docsUrl: "https://shopify.dev/docs/api",
    fields: [
      { key: "store", label: "Store Handle", placeholder: "my-store" },
      { key: "apiKey", label: "Admin API Key", placeholder: "shpat_…", secret: true },
    ],
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    category: "Data",
    description: "Import and export data from Google Sheets — great for bulk customer uploads.",
    logo: "📋",
    docsUrl: "https://developers.google.com/sheets",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "AIza…", secret: true },
      { key: "sheetId", label: "Spreadsheet ID", placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    category: "Notifications",
    description: "Get real-time alerts for new bookings, invoices paid, and low inventory in Slack.",
    logo: "💼",
    docsUrl: "https://api.slack.com/messaging/webhooks",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", placeholder: "https://hooks.slack.com/services/…", secret: true },
    ],
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "Automation",
    description: "Trigger Zapier workflows on new records, bookings, or customer events.",
    logo: "⚡",
    docsUrl: "https://zapier.com/developer",
    fields: [
      { key: "webhookUrl", label: "Zapier Webhook URL", placeholder: "https://hooks.zapier.com/hooks/catch/…", secret: true },
    ],
  },
  {
    id: "custom-webhook",
    name: "Custom Webhook",
    category: "Developer",
    description: "POST events to your own endpoint — new records, status changes, payments, etc.",
    logo: "🔗",
    fields: [
      { key: "url", label: "Endpoint URL", placeholder: "https://your-api.com/webhook" },
      { key: "secret", label: "Secret Header Value (optional)", placeholder: "Bearer …", secret: true },
    ],
  },
];

const CATEGORIES = Array.from(new Set(INTEGRATIONS.map((i) => i.category)));

/* ── Component ──────────────────────────────────────────────────────────── */

export default function IntegrationsPage() {
  const { tenant } = useWorkspace();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [filter, setFilter] = useState("All");
  const [connecting, setConnecting] = useState<IntegrationDef | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);

  const connections: ApiConnection[] = tenant?.apiConnections ?? [];

  const getConn = (id: string) => connections.find((c) => c.id === id);

  /* ── connect / disconnect ──────────────────────────────────────────────── */

  const openConnect = (def: IntegrationDef) => {
    const existing = getConn(def.id);
    setFields(existing?.fields ?? {});
    setConnecting(def);
  };

  const saveConnection = () => {
    if (!tenant || !connecting) return;
    const required = connecting.fields.filter((f) => !f.secret || fields[f.key]);
    const missing = required.filter((f) => !fields[f.key]?.trim());
    if (missing.length > 0) {
      toast(`Fill in: ${missing.map((f) => f.label).join(", ")}`, "danger");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const existing = tenant.apiConnections ?? [];
      const next: ApiConnection = {
        id: connecting.id,
        connectedAt: Date.now(),
        status: "connected",
        fields,
      };
      saveTenant({
        ...tenant,
        apiConnections: [
          ...existing.filter((c) => c.id !== connecting.id),
          next,
        ],
      });
      setSaving(false);
      setConnecting(null);
      toast(`${connecting.name} connected ✓`);
    }, 600);
  };

  const disconnect = (id: string) => {
    if (!tenant) return;
    saveTenant({
      ...tenant,
      apiConnections: (tenant.apiConnections ?? []).filter((c) => c.id !== id),
    });
    toast("Integration disconnected");
  };

  /* ── data export + AI analysis ─────────────────────────────────────────── */

  const exportAll = () => {
    if (!tenant) return;
    const raw = localStorage.getItem(`ss.v1.t.${tenant.id}`) ?? "{}";
    downloadText(`${tenant.slug}-full-export.json`, raw, "application/json");
    toast("Full workspace exported as JSON");
  };

  const exportCSV = (collection: string) => {
    if (!tenant) return;
    const raw = localStorage.getItem(`ss.v1.${tenant.id}.${collection}`);
    if (!raw) { toast("No data in this module yet", "danger"); return; }
    const rows: Record<string, unknown>[] = JSON.parse(raw);
    if (!rows.length) { toast("No rows to export", "danger"); return; }
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
    downloadText(`${tenant.slug}-${collection}.csv`, csv, "text/csv");
    toast(`${collection} exported as CSV`);
  };

  const analyzeWithAI = async () => {
    if (!tenant) return;
    setAnalyzing(true);
    setAiAnalysis("");

    const summary: Record<string, number> = {};
    for (const col of ["records", "customers", "bookings", "invoices"]) {
      try {
        const raw = localStorage.getItem(`ss.v1.${tenant.id}.${col}`);
        summary[col] = raw ? JSON.parse(raw).length : 0;
      } catch { summary[col] = 0; }
    }

    const prompt = `You are a business analyst. Summarize this workspace data snapshot for a business owner in 3-4 sentences. Be direct and actionable. Business: "${tenant.businessName}" (${tenant.systemSlug} system). Data: ${JSON.stringify(summary)} records across modules. Connected integrations: ${(tenant.apiConnections ?? []).map(c => c.id).join(", ") || "none"}. Give a brief health check and 1-2 growth suggestions.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          system: "You are a concise business intelligence assistant. Answer in 3-4 sentences max.",
        }),
      });
      const data = await res.json();
      setAiAnalysis(data.reply ?? "Unable to generate analysis.");
    } catch {
      setAiAnalysis("AI analysis unavailable — check your connection.");
    } finally {
      setAnalyzing(false);
    }
  };

  /* ── CSV import ─────────────────────────────────────────────────────────── */

  const importCSV = (file: File) => {
    if (!tenant) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) { toast("CSV is empty or unreadable", "danger"); return; }
      const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
      const rows = lines.slice(1).map((l) => {
        const vals = l.split(",").map((v) => v.replace(/^"|"$/g, "").trim());
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
      });
      // Detect target collection from headers
      const hasCustomer = headers.some((h) => ["name", "email", "phone"].includes(h.toLowerCase()));
      const col = hasCustomer ? "customers" : "records";
      const key = `ss.v1.${tenant.id}.${col}`;
      const existing: unknown[] = JSON.parse(localStorage.getItem(key) ?? "[]");
      const merged = [
        ...existing,
        ...rows.map((r, i) => ({
          id: `import-${Date.now()}-${i}`,
          tenantId: tenant.id,
          createdAt: Date.now(),
          ...r,
        })),
      ];
      localStorage.setItem(key, JSON.stringify(merged));
      toast(`Imported ${rows.length} rows into ${col} ✓`);
    };
    reader.readAsText(file);
  };

  const visible = filter === "All" ? INTEGRATIONS : INTEGRATIONS.filter((i) => i.category === filter);
  const connectedCount = connections.length;

  return (
    <>
      <PageHead
        title="Integrations"
        sub="Connect your tools, import data, and export everything — it's always yours"
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={connectedCount > 0 ? "ok" : "neutral"}>
              {connectedCount} connected
            </Badge>
          </div>
        }
      />

      {/* ── Connected integrations summary ─────────────────────────────── */}
      {connectedCount > 0 && (
        <Card className="mb-6">
          <CardHeader title="Active connections" sub="Click to edit credentials or disconnect" />
          <div className="flex flex-wrap gap-3 px-5 pb-5">
            {connections.map((conn) => {
              const def = INTEGRATIONS.find((i) => i.id === conn.id);
              if (!def) return null;
              return (
                <div
                  key={conn.id}
                  className="flex items-center gap-2.5 rounded-xl border border-ok/30 bg-ok-soft px-3 py-2"
                >
                  <span className="text-lg">{def.logo}</span>
                  <div className="leading-tight">
                    <p className="text-[12px] font-semibold">{def.name}</p>
                    <p className="text-[10px] text-muted">
                      {conn.status === "connected" ? (
                        <span className="flex items-center gap-1 text-ok"><CheckCircle2 className="size-3" /> Connected</span>
                      ) : (
                        <span className="flex items-center gap-1 text-danger"><AlertCircle className="size-3" /> Error</span>
                      )}
                    </p>
                  </div>
                  <button onClick={() => openConnect(def)} className="ml-1 text-muted hover:text-ink" title="Edit">
                    <RefreshCw className="size-3.5" />
                  </button>
                  <button onClick={() => disconnect(conn.id)} className="text-muted hover:text-danger" title="Disconnect">
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── AI data analysis ─────────────────────────────────────────────── */}
      <Card className="mb-6">
        <CardHeader
          title="AI Data Analysis"
          sub="Get a Groq-powered snapshot of your workspace health and growth opportunities"
          action={<Sparkles className="size-4 text-muted" />}
        />
        <div className="px-5 pb-5">
          {aiAnalysis && (
            <div className="mb-4 rounded-xl bg-surface-2 p-4 text-[13px] leading-6 text-ink-3">
              <Bot className="mb-2 size-4 text-brand" />
              {aiAnalysis}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={analyzeWithAI} disabled={analyzing}>
              {analyzing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {analyzing ? "Analyzing…" : "Analyze my workspace"}
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Data import / export ─────────────────────────────────────────── */}
      <Card className="mb-8">
        <CardHeader title="Data import & export" sub="CSV per module or full JSON workspace backup" />
        <div className="px-5 pb-5">
          <div className="mb-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportAll}>
              <Download className="size-4" /> Export full workspace (JSON)
            </Button>
            {["records", "customers", "bookings", "invoices"].map((col) => (
              <Button key={col} variant="ghost" size="sm" onClick={() => exportCSV(col)}>
                <Download className="size-4" /> {col} CSV
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-line p-4">
            <FileUp className="size-5 shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium">Import CSV</p>
              <p className="text-[11px] text-muted">Headers auto-detected — maps to customers if name/email/phone columns found, otherwise records.</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importCSV(f); }} />
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> Choose file
            </Button>
          </div>
        </div>
      </Card>

      {/* ── Integration catalog ───────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cx(
              "rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors",
              filter === cat ? "border-ink bg-ink text-white" : "border-line bg-surface text-muted hover:border-ink/40",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((def) => {
          const conn = getConn(def.id);
          const isConnected = !!conn;
          const isExpanded = expanded === def.id;

          return (
            <Card key={def.id} className={cx("flex flex-col", isConnected && "border-ok/30")}>
              <div className="flex items-start gap-3 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-2xl">
                  {def.logo}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-semibold">{def.name}</p>
                    {isConnected && <CheckCircle2 className="size-4 shrink-0 text-ok" />}
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{def.category}</p>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : def.id)}
                    className="mt-1 flex items-center gap-1 text-[11px] text-muted hover:text-ink"
                  >
                    {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                    {isExpanded ? "Less" : "Details"}
                  </button>
                  {isExpanded && (
                    <p className="mt-1.5 text-[12px] leading-5 text-ink-3">{def.description}</p>
                  )}
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-line px-5 py-3">
                {def.docsUrl && (
                  <a href={def.docsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-muted hover:text-ink">
                    Docs <ArrowUpRight className="size-3" />
                  </a>
                )}
                <div className="ml-auto flex gap-2">
                  {isConnected && (
                    <Button size="sm" variant="ghost" onClick={() => disconnect(def.id)}>
                      <Link2Off className="size-3.5" /> Disconnect
                    </Button>
                  )}
                  <Button size="sm" variant={isConnected ? "outline" : "brand"} onClick={() => openConnect(def)}>
                    {isConnected ? (
                      <><RefreshCw className="size-3.5" /> Update</>
                    ) : (
                      <><Link2 className="size-3.5" /> Connect</>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Custom webhook add ─────────────────────────────────────────────── */}
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-line p-5">
        <Webhook className="size-5 shrink-0 text-muted" />
        <div className="flex-1">
          <p className="text-[13px] font-semibold">Need a different integration?</p>
          <p className="text-[11px] text-muted">Use the Custom Webhook connector above, or contact your J Supreme Tech account manager to build a native connector for your tool.</p>
        </div>
        <a href="https://wa.me/16582182282?text=Hi%20Jordan%2C%20I%20need%20a%20custom%20integration%20for%20Supreme%20Suite" target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline">
            <Plus className="size-4" /> Request connector
          </Button>
        </a>
      </div>

      {/* ── Connect modal ─────────────────────────────────────────────────── */}
      <Modal open={!!connecting} onClose={() => setConnecting(null)} title={`Connect ${connecting?.name}`}>
        {connecting && (
          <div className="space-y-4">
            <p className="text-[13px] text-muted">{connecting.description}</p>
            {connecting.docsUrl && (
              <a href={connecting.docsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[12px] text-brand hover:underline">
                View API docs <ArrowUpRight className="size-3" />
              </a>
            )}
            {connecting.fields.map((f) => (
              <Field key={f.key} label={f.label}>
                <Input
                  type={f.secret ? "password" : "text"}
                  placeholder={f.placeholder}
                  value={fields[f.key] ?? ""}
                  onChange={(e) => setFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                />
              </Field>
            ))}
            <p className="text-[11px] text-muted">
              Credentials are stored locally in your browser during the trial. On the production rollout, they move to an encrypted server-side vault.
            </p>
            <Button className="w-full" disabled={saving} onClick={saveConnection}>
              {saving ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : <><Link2 className="size-4" /> Save connection</>}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
