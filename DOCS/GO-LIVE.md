# GO-LIVE — production wiring points

The trial product is fully functional client-side by design (zero cost, zero friction).
Going to production = wiring these five seams. Each is isolated to one file.

## 1. Database (Supabase) — `src/suite/lib/store.ts`
The repo API is already table-shaped (`getCol/setCol/upsertRow/removeRow/getDoc/setDoc` + tenant CRUD).
- Create tables: `ss_tenants`, `ss_records`, `ss_customers`, `ss_bookings`, `ss_invoices`, `ss_messages`, `ss_inventory`, `ss_events`, `ss_botcfg`, `ss_leads` (all with `tenant_id` FK + RLS by auth uid).
- Reimplement store.ts against `@supabase/supabase-js`; keep the same exports and every page/op keeps working.
- Existing shared project: `ibtadbwtrxglujkzqofs` (mobile auth) — prefer a NEW dedicated project for Suite client data (don't mix with `ciggiwpztuxkmbaccrlp` live client data).

## 2. Auth (Supabase Auth) — `src/app/app/[tenant]/layout.tsx`
- Email+password / magic link; `tenant.ownerUid` claim; staff invites = rows in `ss_members(tenant_id, uid, role)`.
- Gate: layout redirects unauthenticated users to /login except for `demo-*` workspaces.

## 3. Payments — `src/suite/lib/ops.ts → activatePlan()`
- **Stripe**: Checkout Session per plan (price IDs per tier), webhook → set `tenant.plan`, `paidAt`.
- **WiPay (JMD)**: hosted page request (account 1831565843 pattern from the-mover-guy; md5 hash = tx+origTotal+key), return URL → activatePlan.
- Keep the sandbox modal as the dev/test path.

## 4. Notifications (Resend + WhatsApp) — `src/suite/lib/ops.ts → submitBooking/sendMessage`
- Booking received → email tenant owner (Resend, key `re_NR8K…` on the shared J Supreme account; verified domains list in memory) + optional WhatsApp via Meta Cloud API.
- Trial day-2 nudge + expiry email: Vercel Cron `/api/cron/trial-nudge`.

## 5. Custom domains (Scale tier)
- `vercel domains add <domain>` on the suite project; middleware maps Host → tenant slug (`ss_domains` table) and rewrites `/` → `/site/<slug>`, `/app` → `/app/<slug>`.
- Namecheap flow documented in memory (A 76.76.21.21 + CNAME www).

## Pre-launch checklist
- [ ] `npm run build && npm run smoke` → 40/40
- [ ] /status in prod browser → all pass (voice may warn in Firefox — expected)
- [ ] Lighthouse PWA installable on /app/demo-courier
- [ ] OG image + analytics snippet on catalog layout
- [ ] Set NEXT_PUBLIC_* envs from .env.example
- [ ] Wire /api/health into the conglomerate Suite Control panel (CORS already open)
