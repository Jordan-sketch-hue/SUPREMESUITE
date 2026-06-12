"use client";

/* Tenant workspace layout — brand scope + shell + toasts + service worker. */

import { useEffect } from "react";
import { ToastProvider } from "@/suite/components/overlays";
import { BrandProvider } from "@/suite/components/brand-provider";
import { AppShell } from "@/suite/components/app-shell";
import { useWorkspace } from "@/suite/components/use-workspace";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const { tenant, system } = useWorkspace();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <BrandProvider tenant={tenant}>
      <ToastProvider>
        <AppShell tenant={tenant} system={tenant ? system : null}>
          {children}
        </AppShell>
      </ToastProvider>
    </BrandProvider>
  );
}
