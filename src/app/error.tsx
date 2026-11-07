"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Slate Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg text-ink flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-2xl border border-line bg-surface shadow-2xl text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Something went wrong
          </h2>
          <p className="text-sm text-muted">
            The application encountered an error while rendering this page.
          </p>
          {error.digest && (
            <p className="font-mono text-[11px] text-muted/80 bg-bg py-1 px-2 rounded-md border border-line inline-block">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="p-4 rounded-xl bg-bg/50 border border-line/60 text-xs text-muted text-left space-y-1">
          <p className="font-semibold text-ink">Troubleshooting:</p>
          <p>• Verify <code className="text-accent font-mono">DATABASE_URL</code> is configured in your Vercel Project Settings &gt; Environment Variables.</p>
          <p>• Ensure your database provider (Neon) is reachable.</p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-surface text-ink font-semibold text-xs hover:bg-bg transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
