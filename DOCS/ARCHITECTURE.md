# Architecture

## One engine, N packs

The central design decision: **a vertical SaaS product is data, not code.**

```
┌────────────────────────────────────────────────────────────┐
│  SYSTEM PACK (config)            ENGINE (shared, written once)
│  ──────────────────             ───────────────────────────
│  slug, name, accent      ───▶   AppShell (nav = pack.modules)
│  pipeline stages         ───▶   PipelineBoard / record table
│  field definitions       ───▶   RecordDrawer form renderer
│  booking fields          ───▶   Site booking form + AI slot-fill
│  KPIs + charts (fns)     ───▶   Dashboard / Reports (recharts)
│  website template        ───▶   SiteTemplate (5 archetypes)
│  plans                   ───▶   /continue + pricing pages
│  seed(ctx)               ───▶   Demo + trial starter data
└────────────────────────────────────────────────────────────┘
```

`src/suite/types.ts` is the contract. `src/suite/systems/index.ts` is the registry. The engine never knows industry names; the catalog, docs, status checks, smoke runner and conglomerate control panel all iterate the registry.

## White-labeling (make it feel like mine)

- `BrandConfig` → `brandVars()` (`src/suite/lib/brand.ts`) computes `--brand`, `--brand-strong/soft/ring/fg` (auto-contrast via WCAG luminance), radius and font variables.
- `globals.css` declares them via Tailwind v4 `@theme inline`, so `bg-brand` compiles to `var(--brand)` — utilities re-skin at runtime, no rebuild.
- `BrandProvider` applies the vars on a `[data-brand-scope]` wrapper + swaps favicon + injects the per-tenant PWA manifest (`/api/manifest/[tenant]?name&color`) so even the installed desktop app is theirs.
- Uploaded logos are data-URLs in the tenant record (trial); production moves them to storage.

## Data layer (deliberately swappable)

`src/suite/lib/store.ts` is the ONLY file that knows where data lives.
- Trial: localStorage, namespaced `ss.v1.<tenantId>.<collection>`, with `useSyncExternalStore` hooks (stable server snapshots → clean SSR of headings/empty states).
- Mutations NEVER touch the store from pages — they flow through `src/suite/lib/ops.ts` (createTenant, convertBooking, setRecordStage, createInvoice, addPoints, activatePlan…).
- **Verification leverage:** `/status` executes ops functions directly; UI buttons call the same functions. One code path, provable.

## AI layer

`src/suite/lib/ai.ts` — deterministic intent brain (prices/hours/location/FAQ/human-handoff) + slot-filling booking flow (name → phone → service → date → confirm). Pure functions: `replyFor(state, input, ctx) → {text, state, booking?}`.
- Chat widget (site + app test console) and Voice console share this brain.
- Voice: Web Speech API (`webkitSpeechRecognition` STT + `speechSynthesis` TTS), graceful text fallback, calls logged to Messages (`channel: "voice"`).
- Upgrade path: swap `replyFor` for a Vercel AI Gateway call (`anthropic/claude-…`) keeping the same state machine for slot-fill (GO-LIVE.md).

## Self-check system (every page, link, action)

Three layers, one registry (`src/suite/lib/routes.ts` = ROUTES + ACTIONS + WORKFLOWS):

1. **smoke.mjs (CI)** — boots the prod build, fetches every route's `sample`, asserts `expects[]` markers in SSR HTML → DOCS/HEALTH-REPORT.md.
2. **/status (browser)** — `lib/checks.ts` runs the 7 workflows through real ops on a scratch tenant (created → exercised → deleted), checks the brand engine, all 13 pack seeds (deterministic), PWA manifest/SW, voice support, plus refetches every route.
3. **/api/health?deep=1 (server)** — same route sweep server-side with CORS, consumed by the Supreme Suite Control panel in the conglomerate backoffice.

Rule: a new page/action MUST be added to the registry — /docs and /status are generated from it, so drift is visible immediately.

## Trial & billing

`lib/trial.ts`: 3 days from `trialStartedAt`; `demo-*` slugs and paid plans never expire. `TrialBanner` (countdown) + `Paywall` (hard overlay) + `/continue` (plan cards + sandbox checkout → `activatePlan`). Real processors are a one-function swap (GO-LIVE.md).

## PWA

`public/manifest.webmanifest` (suite) + `/api/manifest/[tenant]` (per-tenant identity, scope `/`, start_url `/app/<slug>`); `public/sw.js` network-first navigations / cache-first static; `InstallButton` captures `beforeinstallprompt`, never auto-opens, hides when standalone.
