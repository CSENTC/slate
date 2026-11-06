"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loadDemoData, clearAllMasterData } from "@/lib/actions/demo-actions";
import { Sparkles, Trash2, AlertTriangle, Check, Loader2 } from "lucide-react";

export function MasterDataToolbar() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLoadDemo = async () => {
    setLoading(true);
    try {
      await loadDemoData();
      triggerToast("Demo department data loaded successfully!");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to load demo data");
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    setLoading(true);
    try {
      await clearAllMasterData();
      setConfirmClear(false);
      triggerToast("All master data and timetable entries cleared.");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "Failed to clear data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={handleLoadDemo}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-all shadow-sm hover:shadow-accent/20 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span>Load demo data</span>
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => setConfirmClear(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-line bg-surface hover:border-conflict text-muted hover:text-conflict text-xs font-medium transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear all data</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface border border-line rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-conflict mb-4">
              <span className="p-2 rounded-xl bg-conflict/10">
                <AlertTriangle className="w-6 h-6" />
              </span>
              <h3 className="font-bold text-lg text-ink">Clear all master data?</h3>
            </div>

            <p className="text-xs text-muted leading-relaxed mb-6">
              This will permanently delete all subjects, faculty, rooms, class sections, allocations, and any placed timetable entries in this workspace. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-4 py-2 rounded-xl border border-line text-ink text-xs font-semibold hover:bg-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearData}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-conflict text-white text-xs font-semibold hover:bg-conflict/90 transition-colors shadow-sm"
              >
                {loading ? "Clearing..." : "Yes, clear everything"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-ink text-bg text-xs font-mono shadow-xl border border-line/40 animate-fade-in">
          <Check className="w-4 h-4 text-accent" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

