# Supreme Suite — Agent Handoff Document

## What this is
13-system white-label SaaS platform at supreme-suite.vercel.app.
One Next.js app + 13 industry "pack" config files. Operator = J Supreme Conglomerate (/suite).

## Tech stack
- Next.js 15 / Tailwind 4
- Neon DB (`@neondatabase/serverless`) — tenant auth tables
- Resend — credential delivery emails
- WiPay — payment processing (webhook triggers provisioning)
- PBKDF2-HMAC-SHA256 — in-process password hashing (no auth SDK)

## Required env vars
| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | Neon postgres connection string (pooled preferred) |
| `SS_JWT_SECRET` | Session token signing secret (min 32 chars random) |
| `RESEND_API_KEY` | Email delivery |
| `NEXT_PUBLIC_SUPREME_SUITE_URL` | https://supreme-suite.vercel.app |

## DB tables (all on Neon)
- `ss_tenants` — paid tenant records (id, slug, email, password_hash, plan, system_slug, etc.)
- `ss_purchases` — WiPay payment audit log
- `ss_invoice_overrides` — per-tenant invoice status overrides

## Key files
| File | Purpose |
|------|---------|
| `src/suite/lib/supabase.ts` | Neon DB client + crypto auth helpers — SERVER ONLY |
| `src/middleware.ts` | Edge auth guard (no DB calls — JWT cookie only) |
| `src/app/api/auth/login/route.ts` | POST email+password → sets ss_auth cookie |
| `src/app/api/auth/me/route.ts` | GET current session |
| `src/app/api/workspace/[slug]/invoice-status/route.ts` | Invoice override CRUD |

## SOP for this project
1. Run Basis pre-check: `POST https://reality-encoder.vercel.app/api/encode` with observation
2. Make changes
3. `npx tsc --noEmit` — must be zero errors
4. Deploy: `vercel deploy --prod`
5. Confirm login flow live in Chrome

## Known gotchas
- `DATABASE_URL` must be set in Vercel env vars (not just .env.local) — it's a server-side only var
- Middleware runs at Edge — never add DB calls to src/middleware.ts
- `tokenSecret()` in middleware.ts and supabase.ts MUST use the same `SS_JWT_SECRET` — they're in sync
- Demo workspaces (slug starting `demo-`) bypass auth in middleware — intentional
- `brand_color` defaults to `#0f0f0f` if not set at provisioning time

## Migration history
- Oct 2026: Migrated ss_tenants/ss_purchases/ss_invoice_overrides from Supabase (ciggiwpztuxkmbaccrlp) to Neon DB
- NEVER use ciggiwpztuxkmbaccrlp again for this project
