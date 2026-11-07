"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { verifyPasscode } from "@/lib/actions/gate-actions";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

function GateForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || "/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await verifyPasscode(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8 text-center">
      {/* Brand Lockup */}
      <div className="flex flex-col items-center gap-3">
        <Logo variant="lockup" size={40} />
        <p className="text-xs font-mono uppercase tracking-widest text-muted">
          Protected Workspace
        </p>
      </div>

      {/* Card */}
      <div className="p-8 rounded-2xl border border-line bg-surface shadow-xl text-left space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">Passcode Required</h2>
            <p className="text-xs text-muted">
              Enter the access passcode to continue
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="returnTo" value={returnTo} />

          <div>
            <label
              htmlFor="passcode"
              className="block text-xs font-mono uppercase text-muted mb-1.5"
            >
              Access Passcode
            </label>
            <input
              id="passcode"
              name="passcode"
              type="password"
              required
              autoFocus
              placeholder="••••••••"
              className="w-full h-11 px-3.5 rounded-xl border border-line bg-bg text-ink text-sm font-mono tracking-wider focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-accent text-white text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            <span>{loading ? "Verifying..." : "Unlock Workspace"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted">
        <ShieldCheck className="w-3.5 h-3.5 text-accent" />
        <span>Slate Session Security</span>
      </div>
    </div>
  );
}

export default function GatePage() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center p-6 selection:bg-accent/20 selection:text-accent">
      <Suspense fallback={<div className="text-xs font-mono text-muted">Loading...</div>}>
        <GateForm />
      </Suspense>
    </div>
  );
}
