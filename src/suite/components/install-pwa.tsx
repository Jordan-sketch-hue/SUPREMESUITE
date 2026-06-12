"use client";

/* Install-as-desktop-app button.
   - Captures beforeinstallprompt and triggers it on click (never auto-opens).
   - Hides itself when already running installed (standalone display mode).
   - Falls back to clear instructions when the browser hides the prompt. */

import { MonitorDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui";
import { Modal } from "./overlays";

let deferredPrompt: any = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

export function InstallButton({ appName = "this app", size = "sm" as "sm" | "md" }) {
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
    setInstalled(standalone);
    const onInstalled = () => setInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  if (installed) return null;

  return (
    <>
      <Button
        variant="outline"
        size={size}
        onClick={async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
          } else {
            setHelp(true);
          }
        }}
      >
        <MonitorDown className="size-4" />
        Install app
      </Button>
      <Modal open={help} onClose={() => setHelp(false)} title="Install on your desktop">
        <div className="space-y-3 text-sm text-ink-3">
          <p>
            Install {appName} like a real desktop app — its own window, dock/taskbar icon, and it works offline.
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong>Chrome / Edge:</strong> click the <em>install icon</em> in the address bar (a screen with a ↓), or
              menu → <em>Cast, save and share</em> → <em>Install app</em>.
            </li>
            <li>
              <strong>Safari (Mac):</strong> File → <em>Add to Dock</em>.
            </li>
            <li>
              <strong>Phone:</strong> browser menu → <em>Add to Home Screen</em>.
            </li>
          </ol>
          <p className="text-xs text-muted">The install prompt appears once the app has fully loaded over HTTPS.</p>
        </div>
      </Modal>
    </>
  );
}
