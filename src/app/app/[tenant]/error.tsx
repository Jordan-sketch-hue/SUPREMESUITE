"use client";

/* Workspace error boundary — catches any render/runtime error inside a tenant
   workspace and offers recovery instead of a hard white-screen crash. */

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/suite/components/ui";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Workspace render error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-danger-soft">
        <AlertTriangle className="size-7 text-danger" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold">This screen hit a snag</h1>
      <p className="mt-2 text-sm text-muted">
        Your workspace and data are safe — this view just failed to render. Try again, or head back
        to your dashboard.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()}>
          <RefreshCw className="size-4" /> Try again
        </Button>
        <Link href="/">
          <Button variant="outline">Back to home</Button>
        </Link>
      </div>
      {error?.digest && (
        <p className="mt-4 text-[11px] text-muted">Ref: {error.digest}</p>
      )}
    </div>
  );
}
