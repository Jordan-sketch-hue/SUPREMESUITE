/* Per-tenant PWA manifest — lets each workspace install as its OWN desktop
   app (own name, own theme color, scoped to /app/<slug>). */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, ctx: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await ctx.params;
  const name = req.nextUrl.searchParams.get("name") ?? "Supreme Suite Workspace";
  const color = req.nextUrl.searchParams.get("color") ?? "#0a0a0b";

  return NextResponse.json(
    {
      id: `/app/${tenant}`,
      name: `${name} — Workspace`,
      short_name: name.slice(0, 24),
      description: `${name} business workspace, powered by Supreme Suite (J Supreme Tech).`,
      start_url: `/app/${tenant}`,
      scope: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: color,
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json", "Access-Control-Allow-Origin": "*" } },
  );
}
