"use client";

/* Interactive overlay primitives — Modal, Drawer, Tabs, Toasts. */

import { X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cx, Button } from "./ui";

/* ---- Modal ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal>
      <button aria-label="Close" className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cx(
          "animate-rise relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-pop sm:rounded-3xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-md",
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          {title ? <h3 className="font-display text-lg font-semibold">{title}</h3> : <span />}
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-3" aria-label="Close dialog">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---- Drawer (right panel) ------------------------------------------------------ */

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90]">
      <button aria-label="Close" className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-surface shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          {title ? <h3 className="font-display text-base font-semibold">{title}</h3> : <span />}
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-surface-3" aria-label="Close drawer">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-line bg-surface-2 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

/* ---- Tabs ------------------------------------------------------------------------ */

export function Tabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: Array<{ id: string; label: React.ReactNode }>;
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cx("inline-flex rounded-xl border border-line bg-surface-2 p-1", className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors",
            value === t.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---- Toasts ------------------------------------------------------------------------ */

interface ToastItem {
  id: number;
  text: string;
  tone: "ok" | "danger" | "neutral";
}

const ToastCtx = createContext<(text: string, tone?: ToastItem["tone"]) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((text: string, tone: ToastItem["tone"] = "ok") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[120] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className={cx(
              "animate-rise pointer-events-auto w-full rounded-xl px-4 py-3 text-sm font-medium shadow-pop",
              t.tone === "ok" && "bg-ink text-white",
              t.tone === "danger" && "bg-danger text-white",
              t.tone === "neutral" && "bg-surface text-ink border border-line",
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---- Confirm helper ----------------------------------------------------------------- */

export function ConfirmButton({
  label,
  confirmLabel = "Are you sure?",
  onConfirm,
  variant = "danger",
  size = "sm",
}: {
  label: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  variant?: "danger" | "outline";
  size?: "sm" | "md";
}) {
  const [arming, setArming] = useState(false);
  useEffect(() => {
    if (!arming) return;
    const t = setTimeout(() => setArming(false), 2500);
    return () => clearTimeout(t);
  }, [arming]);
  return (
    <Button
      variant={arming ? "danger" : variant}
      size={size}
      onClick={() => {
        if (arming) {
          onConfirm();
          setArming(false);
        } else setArming(true);
      }}
    >
      {arming ? confirmLabel : label}
    </Button>
  );
}
