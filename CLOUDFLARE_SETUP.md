# Cloudflare Pages Setup — Agent Instructions

Your job: use the built-in Chrome browser to connect this repo to Cloudflare Pages and set all env vars.

## Repo
- GitHub: `Jordan-sketch-hue/SUPREMESUITE`
- Branch to deploy from: `main`
- Build command: `npm run pages:build`
- Build output: `.vercel/output/static`

## Required environment variables
Set these in Cloudflare Pages → Settings → Environment Variables for **both Production and Preview**:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → project connection string |
| `SS_JWT_SECRET` | Generate a random 32-char string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings → API |
| `RESEND_API_KEY` | Resend dashboard → API Keys |

## Steps

1. **Open** `https://dash.cloudflare.com` — sign in if needed.
2. Go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Authorize GitHub if prompted, then select repo `Jordan-sketch-hue/SUPREMESUITE`.
4. Set:
   - Production branch: `main`
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
5. Expand **Environment Variables** and add all 5 vars from the table above for Production.
6. Click **Save and Deploy**. Wait for the build to finish (≈2–3 min).
7. Go to the new project → **Custom domains → Add domain** → enter `suite.jsupremetech.online`.
   - If the domain is already on Cloudflare DNS it activates automatically.
8. Confirm the deployment is READY and `suite.jsupremetech.online` resolves.

## Verify
After deploy, visit each demo workspace and confirm:
- Correct industry labels (not "courier")
- KPI cards show real seeded numbers (not 0)
- Workspace name is correct (not "Workspace")
- Sidebar links include `/app/demo-{slug}/...` (not `/app/_/...`)

Demo URLs to check:
```
https://suite.jsupremetech.online/app/demo-fleet-run
https://suite.jsupremetech.online/app/demo-haul-base
https://suite.jsupremetech.online/app/demo-stock-ops
https://suite.jsupremetech.online/app/demo-dwell-desk
https://suite.jsupremetech.online/app/demo-table-flow
https://suite.jsupremetech.online/app/demo-glow-desk
https://suite.jsupremetech.online/app/demo-slot-iq
https://suite.jsupremetech.online/app/demo-tour-base
https://suite.jsupremetech.online/app/demo-enroll-iq
https://suite.jsupremetech.online/app/demo-punch-pro
https://suite.jsupremetech.online/app/demo-signal-board
https://suite.jsupremetech.online/app/demo-desk-bot
https://suite.jsupremetech.online/app/demo-ring-pilot
```

## Architecture notes
- Hosting: Cloudflare Pages (`@cloudflare/next-on-pages` adapter)
- Database: Neon (PostgreSQL, `DATABASE_URL`) — operational data
- Auth directory: Supabase (`SUPABASE_SERVICE_ROLE_KEY`)
- Auth cookie: `ss_auth` — HMAC-SHA256 signed, Edge-compatible
- All 13 systems defined in `src/suite/systems/index.ts`
- Demo workspaces seed their own KPI data on first load (idempotent)
