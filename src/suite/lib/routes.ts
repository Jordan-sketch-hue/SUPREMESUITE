/* ============================================================================
   ROUTE + ACTION + WORKFLOW REGISTRY — the platform's single source of truth.
   Drives: /docs (documentation), /status (live self-check portal),
   /api/registry (machine-readable), _build/smoke.mjs (CI smoke), and the
   Supreme Suite Control panel in the J Supreme conglomerate backoffice.
   Rule: every page, link and action in the product MUST be declared here.
============================================================================ */

import type { RouteSpec, ActionSpec } from "../types";

export const DEMO_TENANT = "demo-courier";

/* ---- pages -------------------------------------------------------------- */

export const ROUTES: RouteSpec[] = [
  // Catalog (public marketing)
  { path: "/", group: "Catalog", title: "Home", expects: ["Supreme Suite", "free trial"] },
  { path: "/systems", group: "Catalog", title: "Systems catalog", expects: ["Pick your industry"] },
  {
    path: "/systems/:slug",
    sample: "/systems/courier",
    group: "Catalog",
    title: "System detail",
    expects: ["3-day free trial"],
    dynamic: true,
  },
  { path: "/pricing", group: "Catalog", title: "Pricing", expects: ["Simple pricing"] },
  { path: "/faq", group: "Catalog", title: "FAQ", expects: ["Questions"] },
  { path: "/contact", group: "Catalog", title: "Contact / custom builds", expects: ["custom"] },
  { path: "/start", group: "Catalog", title: "Onboarding wizard", expects: ["Launch your workspace"] },
  { path: "/status", group: "Platform", title: "Self-check portal", expects: ["System check"] },
  { path: "/docs", group: "Platform", title: "Documentation", expects: ["Documentation"] },
  { path: "/app/login", group: "Auth", title: "Tenant login", expects: ["Sign in", "Supreme Suite"] },

  // Tenant app engine (white-labeled)
  { path: "/app/:tenant", sample: `/app/${DEMO_TENANT}`, group: "App", title: "Dashboard", expects: ["Dashboard"], dynamic: true },
  { path: "/app/:tenant/records", sample: `/app/${DEMO_TENANT}/records`, group: "App", title: "Records & pipeline", expects: ["Pipeline"], dynamic: true },
  { path: "/app/:tenant/calendar", sample: `/app/${DEMO_TENANT}/calendar`, group: "App", title: "Calendar", expects: ["Calendar"], dynamic: true },
  { path: "/app/:tenant/bookings", sample: `/app/${DEMO_TENANT}/bookings`, group: "App", title: "Bookings inbox", expects: ["Bookings"], dynamic: true },
  { path: "/app/:tenant/customers", sample: `/app/${DEMO_TENANT}/customers`, group: "App", title: "Customers", expects: ["Customers"], dynamic: true },
  { path: "/app/:tenant/messages", sample: `/app/${DEMO_TENANT}/messages`, group: "App", title: "Messages", expects: ["Messages"], dynamic: true },
  { path: "/app/:tenant/inventory", sample: `/app/${DEMO_TENANT}/inventory`, group: "App", title: "Inventory", expects: ["Inventory"], dynamic: true },
  { path: "/app/:tenant/invoices", sample: `/app/${DEMO_TENANT}/invoices`, group: "App", title: "Invoices", expects: ["Invoices"], dynamic: true },
  { path: "/app/:tenant/loyalty", sample: `/app/${DEMO_TENANT}/loyalty`, group: "App", title: "Loyalty", expects: ["Loyalty"], dynamic: true },
  { path: "/app/:tenant/reports", sample: `/app/${DEMO_TENANT}/reports`, group: "App", title: "Reports", expects: ["Reports"], dynamic: true },
  { path: "/app/:tenant/chatbot", sample: `/app/${DEMO_TENANT}/chatbot`, group: "App", title: "AI chatbot", expects: ["Chatbot"], dynamic: true },
  { path: "/app/:tenant/voice", sample: `/app/${DEMO_TENANT}/voice`, group: "App", title: "AI voice agent", expects: ["Voice"], dynamic: true },
  { path: "/app/:tenant/website", sample: `/app/${DEMO_TENANT}/website`, group: "App", title: "Website manager", expects: ["Website"], dynamic: true },
  { path: "/app/:tenant/settings", sample: `/app/${DEMO_TENANT}/settings`, group: "App", title: "Settings & branding", expects: ["Settings"], dynamic: true },
  { path: "/app/:tenant/continue", sample: `/app/${DEMO_TENANT}/continue`, group: "App", title: "Plans / continue after trial", expects: ["Continue"], dynamic: true },

  // Branded public website template
  { path: "/site/:tenant", sample: `/site/${DEMO_TENANT}`, group: "Site", title: "Tenant public website", expects: ["Powered by"], dynamic: true },

  // APIs
  { path: "/api/health", group: "API", title: "Health JSON (+CORS, ?deep=1)", expects: ['"ok"'] },
  { path: "/api/registry", group: "API", title: "Routes/actions registry JSON", expects: ['"routes"'] },
  {
    path: "/api/manifest/:tenant",
    sample: `/api/manifest/${DEMO_TENANT}?name=Demo&color=%232563eb`,
    group: "API",
    title: "Per-tenant PWA manifest",
    expects: ['"start_url"'],
    dynamic: true,
  },
];

/* ---- actions (every interactive contract) -------------------------------- */

export const ACTIONS: ActionSpec[] = [
  { id: "tenant-create", group: "Onboarding", label: "Create workspace from wizard", contract: "Completing /start creates a tenant with brand config, seeds demo data, starts the 3-day trial and lands on the dashboard." },
  { id: "brand-apply", group: "Branding", label: "Apply brand color/logo/style", contract: "Saving brand settings updates CSS variables (--brand*) and the logo everywhere (app shell, site, widget) without reload." },
  { id: "logo-upload", group: "Branding", label: "Upload company logo", contract: "An uploaded image persists as a data URL and renders in the app sidebar, public site nav and browser favicon." },
  { id: "record-create", group: "Records", label: "Create record", contract: "New record appears in table and pipeline with auto reference, default stage, and updated KPI counts." },
  { id: "record-stage", group: "Records", label: "Move record across pipeline", contract: "Dragging (or arrow controls) updates status, column totals and dashboard funnel instantly." },
  { id: "record-edit", group: "Records", label: "Edit/delete record", contract: "Field edits persist; delete removes from all views." },
  { id: "booking-submit", group: "Bookings", label: "Public site booking → inbox", contract: "Submitting the website booking form creates a 'new' booking visible in the app inbox with all form fields." },
  { id: "booking-convert", group: "Bookings", label: "Convert booking", contract: "Convert creates a record (and customer if new), marks booking converted, links the customer." },
  { id: "customer-create", group: "Customers", label: "Add/edit customer", contract: "Customer persists with tags; profile shows linked records, invoices, messages and loyalty points." },
  { id: "message-send", group: "Messages", label: "Send message / template", contract: "Outbound message appends to the thread with channel + timestamp; unread counts update." },
  { id: "invoice-create", group: "Invoices", label: "Build invoice", contract: "Line items auto-total; invoice persists with status; mark-paid updates revenue KPIs." },
  { id: "invoice-print", group: "Invoices", label: "Print/PDF invoice", contract: "Print view renders a branded invoice via the browser print dialog." },
  { id: "inventory-adjust", group: "Inventory", label: "Adjust stock", contract: "Qty steppers persist; low-stock badge appears when qty ≤ reorder point." },
  { id: "loyalty-points", group: "Loyalty", label: "Add/redeem points", contract: "Point changes persist on the customer and move tier progress; punch card fills visually." },
  { id: "calendar-add", group: "Calendar", label: "Add calendar event", contract: "Event appears on the month grid and upcoming list." },
  { id: "report-export", group: "Reports", label: "Export CSV", contract: "Export downloads a CSV containing current records with headers." },
  { id: "chatbot-reply", group: "AI", label: "Chatbot answers & books", contract: "Widget answers price/hours intents and completes a slot-filled booking that lands in the inbox." },
  { id: "voice-call", group: "AI", label: "Voice agent conversation", contract: "Mic captures speech (where supported), agent replies aloud and logs the call to Messages; text fallback always works." },
  { id: "site-edit", group: "Website", label: "Edit website content", contract: "Hero/services edits save and the public site reflects them on reload of the preview." },
  { id: "pwa-install", group: "Platform", label: "Install desktop app", contract: "Install button triggers the browser PWA prompt (per-tenant name/color via dynamic manifest); hides when already installed." },
  { id: "trial-gate", group: "Billing", label: "3-day trial gate", contract: "Trial countdown shows in shell; after expiry the app locks behind /continue where choosing a plan unlocks (sandbox checkout)." },
  { id: "data-export", group: "Data", label: "Export/import workspace", contract: "JSON export downloads the full workspace; import restores it (data freedom)." },
  { id: "demo-seed", group: "Platform", label: "Deterministic demo seeding", contract: "demo-* workspaces self-create with stable, realistic data per system." },
  { id: "lead-capture", group: "Catalog", label: "Contact / custom CRM request", contract: "Contact form persists a platform lead and shows confirmation." },
];

/* ---- workflows (end-to-end journeys checked on /status) ------------------ */

export interface WorkflowSpec {
  id: string;
  title: string;
  steps: string[];
  covers: string[]; // action ids
}

export const WORKFLOWS: WorkflowSpec[] = [
  {
    id: "wf-launch",
    title: "Launch a branded workspace",
    steps: [
      "Pick a system in the catalog",
      "Enter business name + contact",
      "Upload logo, choose colors & style",
      "Workspace created, seeded, trial starts",
      "Dashboard renders with brand applied",
    ],
    covers: ["tenant-create", "brand-apply", "logo-upload", "demo-seed"],
  },
  {
    id: "wf-lead-to-cash",
    title: "Lead → booking → job → invoice → paid",
    steps: [
      "Visitor books on the public site",
      "Booking appears in inbox",
      "Convert to record + customer",
      "Advance through pipeline to done",
      "Invoice raised and marked paid",
      "Revenue KPI updates",
    ],
    covers: ["booking-submit", "booking-convert", "record-stage", "invoice-create"],
  },
  {
    id: "wf-ai-frontdesk",
    title: "AI front desk captures a booking",
    steps: [
      "Customer chats with the widget",
      "Bot answers prices/hours",
      "Bot slot-fills name → phone → service → date",
      "Confirmed booking lands in inbox",
    ],
    covers: ["chatbot-reply", "booking-submit"],
  },
  {
    id: "wf-retention",
    title: "Repeat-customer loyalty loop",
    steps: [
      "Customer completes a job",
      "Points added on profile",
      "Punch card fills toward reward",
      "Outbound message sent from template",
    ],
    covers: ["loyalty-points", "message-send", "customer-create"],
  },
  {
    id: "wf-own-it",
    title: "Make it feel like mine",
    steps: [
      "Change brand color → whole app re-skins live",
      "Upload logo → shell, site & favicon update",
      "Edit website hero/services → public site updates",
      "Install as desktop app",
    ],
    covers: ["brand-apply", "logo-upload", "site-edit", "pwa-install"],
  },
  {
    id: "wf-trial-convert",
    title: "Trial → paid continuation",
    steps: [
      "Trial banner counts down 3 days",
      "On expiry the workspace locks",
      "Choose a plan on /continue",
      "Sandbox checkout unlocks the workspace",
    ],
    covers: ["trial-gate"],
  },
  {
    id: "wf-data-freedom",
    title: "Data in / data out",
    steps: ["Export workspace JSON", "Export records CSV", "Import restores a workspace"],
    covers: ["data-export", "report-export"],
  },
];
