import React, { useState, useEffect } from "react";
import Shell from "@/components/layout/Shell";
import { LossAlertItem } from "@/lib/types";
import { formatWeight, formatCurrency } from "@/lib/math";
import { useApp } from "@/context/AppContext";

export default function LossAlertsPage() {
  const { role, setRole } = useApp();
  const [alerts, setAlerts] = useState<LossAlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.success) setAlerts(data.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: "reviewed" | "dismissed",
    note?: string
  ) => {
    setSubmittingId(id);
    try {
      const res = await fetch("/api/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          notes: note || reviewNote[id],
          reviewedBy: role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  // Role restriction enforcement
  const isAuthorized = role === "finance_head" || role === "partner";

  if (!isAuthorized) {
    return (
      <Shell title="Confidential: Loss Drift Review Items">
        <div className="max-w-xl mx-auto py-12 px-6 bg-surface border border-border rounded-lg text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto text-xl font-bold">
            🔒
          </div>
          <h2 className="text-lg font-serif font-bold text-ink-primary">
            Restricted to Finance Head &amp; Managing Partner
          </h2>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Per company guidelines, loss drift alerts are strictly constructive review items
            monitored by senior leadership to investigate workshop variances without premature accusations.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setRole("finance_head")}
              className="px-4 py-2 rounded text-xs font-semibold bg-accent text-white hover:bg-accent-hover transition-colors"
            >
              Switch Role to Finance Head
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  const openAlerts = alerts.filter((a) => a.status === "open");
  const reviewedAlerts = alerts.filter((a) => a.status !== "open");

  return (
    <Shell
      title="Loss Drift & Anomaly Review Items"
      subtitle="Early detection of karigar loss trending upward before month-end reconciliation"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Leadership Philosophy Banner */}
        <div className="bg-[#FAF7F0] border border-[#DDD4C3] rounded-lg p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-hover">
              Executive Review Policy
            </span>
          </div>
          <p className="text-xs text-ink-primary leading-relaxed">
            These automated items highlight statistical drift beyond a karigar&apos;s personal historical baseline.
            They are intended strictly as constructive review prompts to inspect bench equipment,
            exhaust filters, casting sprues, and annealing chemical baths.
          </p>
        </div>

        {/* Open Review Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-primary">
              Active Items for Senior Review ({openAlerts.length})
            </h2>
            <span className="text-xs text-ink-secondary">
              Evaluated using rolling 3-job standard deviation
            </span>
          </div>

          {openAlerts.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-border rounded-lg text-ink-secondary text-xs">
              ✓ No abnormal loss drift detected across any of the 40 workshop karigars today.
            </div>
          ) : (
            <div className="space-y-4">
              {openAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-surface border border-border rounded-lg p-5 shadow-sm space-y-4 hover:border-border-strong transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                        {alert.severity === "attention_required"
                          ? "Attention Required"
                          : "Review Recommended"}
                      </span>
                      <h3 className="text-sm font-bold text-ink-primary">
                        {alert.karigarName} — Job #{alert.triggerJobNumber}
                      </h3>
                      <span className="text-xs text-ink-secondary capitalize">
                        ({alert.category})
                      </span>
                    </div>

                    <span className="text-xs font-mono text-ink-muted">
                      Detected: {new Date(alert.detectedAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  {/* Comparative Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="p-2.5 rounded bg-surface-subtle border border-border">
                      <span className="text-ink-secondary block">Actual Job Loss:</span>
                      <span className="font-mono text-base font-bold text-status-loss tabular-numbers">
                        {alert.actualLossPct.toFixed(2)} %
                      </span>
                      <span className="text-[10px] text-ink-muted block">
                        Agreed limit: {alert.agreedLossPct.toFixed(2)}%
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-surface-subtle border border-border">
                      <span className="text-ink-secondary block">Historical Mean:</span>
                      <span className="font-mono text-base font-semibold text-ink-primary tabular-numbers">
                        {alert.historicalMeanLossPct.toFixed(2)} %
                      </span>
                      <span className="text-[10px] text-ink-muted block">Personal baseline</span>
                    </div>

                    <div className="p-2.5 rounded bg-surface-subtle border border-border">
                      <span className="text-ink-secondary block">Excess Gold Variance:</span>
                      <span className="font-mono text-base font-bold text-accent-hover tabular-numbers">
                        {formatWeight(alert.excessLossFineG)} g fine
                      </span>
                      <span className="text-[10px] text-ink-muted block">Beyond allowance</span>
                    </div>

                    <div className="p-2.5 rounded bg-surface-subtle border border-border">
                      <span className="text-ink-secondary block">Financial Impact:</span>
                      <span className="font-mono text-base font-bold text-ink-primary tabular-numbers">
                        {formatCurrency(alert.financialImpactInr)}
                      </span>
                      <span className="text-[10px] text-ink-muted block">@ ₹12,500/g</span>
                    </div>
                  </div>

                  {/* Root Cause Hint */}
                  <div className="p-3 rounded bg-[#FAF8F2] border border-border text-xs space-y-1">
                    <span className="font-semibold text-ink-primary block">
                      Suggested Investigation Focus:
                    </span>
                    <p className="text-ink-secondary leading-relaxed">
                      {alert.suggestedReviewCause}
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <input
                      type="text"
                      placeholder="Add review findings (e.g. Crucible relined; filing vacuum filter replaced)..."
                      value={reviewNote[alert.id] || ""}
                      onChange={(e) =>
                        setReviewNote({ ...reviewNote, [alert.id]: e.target.value })
                      }
                      className="text-xs p-2 rounded border border-border flex-1 text-ink-primary bg-surface-subtle"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(alert.id, "dismissed")}
                        disabled={submittingId === alert.id}
                        className="px-3 py-1.5 text-xs font-medium rounded border border-border hover:bg-surface-subtle text-ink-secondary"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(alert.id, "reviewed")}
                        disabled={submittingId === alert.id}
                        className="px-4 py-1.5 text-xs font-semibold rounded bg-accent text-white hover:bg-accent-hover shadow-sm"
                      >
                        {submittingId === alert.id ? "Saving..." : "Mark as Reviewed"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolved Review History */}
        {reviewedAlerts.length > 0 && (
          <div className="bg-surface border border-border rounded-lg p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-ink-primary">
              Completed Review Audit Log
            </h3>
            <div className="divide-y divide-border text-xs">
              {reviewedAlerts.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-ink-primary">{item.karigarName}</span>{" "}
                    <span className="text-ink-secondary">
                      (Job #{item.triggerJobNumber}) — {formatWeight(item.excessLossFineG)}g variance
                    </span>
                    {item.reviewNotes && (
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        Finding: {item.reviewNotes}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Reviewed by {item.reviewedBy || "Senior Management"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

