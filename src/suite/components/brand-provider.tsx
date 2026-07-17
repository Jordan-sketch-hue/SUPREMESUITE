"use client";

/* BrandProvider — wraps a tenant surface (app or public site) and applies the
   tenant's brand as runtime CSS variables, favicon and per-tenant PWA manifest.
   This is the heart of "make it feel like mine". */

import { useEffect, useMemo } from "react";
import type { Tenant } from "../types";
import { brandVars } from "../lib/brand";
import { trySystem } from "../systems";

function setLink(rel: string, href: string, id: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[data-ss="${id}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    el.dataset.ss = id;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function BrandProvider({
  tenant,
  children,
  className,
}: {
  tenant: Tenant | null;
  children: React.ReactNode;
  className?: string;
}) {
  const vars = useMemo(
    () => (tenant ? brandVars(tenant.brand) : {}),
    [tenant],
  );

  // Favicon + per-tenant manifest + theme color follow the brand.
  useEffect(() => {
    if (!tenant) return;
    if (tenant.brand.logoDataUrl) setLink("icon", tenant.brand.logoDataUrl, "favicon");
    const manifestUrl = `/api/manifest/${tenant.slug}?name=${encodeURIComponent(
      tenant.businessName,
    )}&color=${encodeURIComponent(tenant.brand.color)}`;
    setLink("manifest", manifestUrl, "manifest");
    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = tenant.brand.color;
    document.title = `${tenant.businessName} — powered by Supreme Suite`;
  }, [tenant]);

  return (
    <div data-brand-scope style={vars as React.CSSProperties} className={className}>
      {children}
    </div>
  );
}

/** Tenant logo — shows uploaded logo, or the system icon, or a letter as last resort. */
export function TenantLogo({ tenant, size = 36, className }: { tenant: Tenant | null; size?: number; className?: string }) {
  if (tenant?.brand.logoDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={tenant.brand.logoDataUrl}
        alt={`${tenant.businessName} logo`}
        style={{ width: size, height: size }}
        className={`rounded-xl object-contain ${className ?? ""}`}
      />
    );
  }
  const sys = trySystem(tenant?.systemSlug);
  const Icon = sys?.icon;
  const iconPx = Math.round(size * 0.52);
  return (
    <span
      style={{ width: size, height: size }}
      className={`flex items-center justify-center rounded-xl bg-brand text-brand-fg ${className ?? ""}`}
    >
      {Icon ? (
        <Icon style={{ width: iconPx, height: iconPx }} />
      ) : (
        <span className="font-display font-bold" style={{ fontSize: Math.round(size * 0.42) }}>
          {(tenant?.businessName ?? "S")[0]?.toUpperCase()}
        </span>
      )}
    </span>
  );
}
