# Supreme Suite — by J Supreme Tech

**White-label vertical SaaS platform.** 13 ready-made business systems (CRMs, booking platforms, WMS, school management, AI chatbot & voice agents…), each shipping with a branded public website, an installable desktop app (PWA), AI staff, and a 3-day free trial. One engine, infinite industries.

| | |
|---|---|
| Stack | Next.js 16 (App Router) · React 19 · Tailwind v4 · Recharts · lucide-react |
| Location | `C:\Users\jader\J Supreme Tech\supreme-suite` |
| Trial data layer | localStorage repo (zero-cost, zero-friction sandbox) — table-shaped API, swap-ready for Supabase (see GO-LIVE.md) |
| Docs | This folder + the live, self-generated [/docs](https://localhost:3000/docs) page |
| Proof it works | [/status](https://localhost:3000/status) — live self-check portal · `npm run smoke` — CI route checks · DOCS/HEALTH-REPORT.md |

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run smoke        # boot prod build + check all 40 routes (exit 1 on failure)
npm run docs:health  # same + write DOCS/HEALTH-REPORT.md
```

## The 13 systems

Operations: **Courier & Delivery**, **Movers & Storage**, **Warehouse (WMS)**, **Property Management**, **Restaurant & Reservations**
Booking: **Beauty & Salon**, **Universal Appointments**, **Tours & Experiences**
Education: **School & Academy**
Growth: **Loyalty & Rewards**
Intelligence: **Analytics Dashboards**, **AI Chatbot Builder**, **AI Voice Agent**

Every system = one config file in `src/suite/systems/`. Adding a new vertical is ~200 lines of configuration, zero new components.

## Key flows

- **/start** — 4-step wizard: pick system → business info → upload logo + colors + style (live preview) → launch. Creates a seeded workspace on a 3-day trial.
- **/app/[tenant]** — the white-labeled workspace (14 modules, gated by the system pack).
- **/site/[tenant]** — the tenant's branded public website; booking form + AI chat bubble post straight into the workspace.
- **/app/demo-{system}** — zero-friction live demos; self-create with deterministic seed data on first visit.
- **/status** — runs every page check + business workflow live in the browser through the REAL ops code paths.
- **/api/health?deep=1** — server-side route sweep with CORS (consumed by the J Supreme conglomerate backoffice).

## Where things live

```
src/suite/types.ts          # the contract everything shares
src/suite/systems/          # 13 industry packs + registry
src/suite/lib/              # store, ops (ALL mutations), ai brain, brand engine,
                            # seed-kit, pack-kit, routes registry, checks runner
src/suite/components/       # ui kit, shells, board, calendar, charts, site template,
                            # chat widget, voice console, PWA install, trial gate
src/app/(catalog)/          # marketing site, /start, /status, /docs
src/app/app/[tenant]/       # the 15-route workspace engine
src/app/site/[tenant]/      # branded public website
src/app/api/                # health, registry, per-tenant manifest
_build/smoke.mjs            # CI smoke runner
```
