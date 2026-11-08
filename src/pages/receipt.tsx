import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Shell from "@/components/layout/Shell";
import ScalePhotoReader from "@/components/scale-reader/ScalePhotoReader";
import DigitalSlipModal from "@/components/slips/DigitalSlipModal";
import { Karigar, JobOrder, Transaction } from "@/lib/types";
import {
  calculateFineWeight,
  calculateJobSettlement,
  formatWeight,
  formatPurity,
  formatCurrency,
} from "@/lib/math";
import { useApp } from "@/context/AppContext";

export default function ReceiptPage() {
  const router = useRouter();
  const { isOnline, addToOfflineQueue } = useApp();

  const [karigars, setKarigars] = useState<Karigar[]>([]);
  const [jobs, setJobs] = useState<JobOrder[]>([]);
  const [selectedKarigarId, setSelectedKarigarId] = useState<string>("");
  const [selectedJobNumber, setSelectedJobNumber] = useState<string>("");

  // Finished piece inputs
  const [finishedGrossG, setFinishedGrossG] = useState<number>(112.45);
  const [finishedPurityPct, setFinishedPurityPct] = useState<number>(91.6);
  const [huid, setHuid] = useState<string>("CB9421");

  // Scrap inputs
  const [scrapGrossG, setScrapGrossG] = useState<number>(3.3);
  const [scrapPurityPct, setScrapPurityPct] = useState<number>(91.6);

  // Filings / dust inputs
  const [filingsGrossG, setFilingsGrossG] = useState<number>(0.0);
  const [filingsPurityPct, setFilingsPurityPct] = useState<number>(91.6);

  const [closeJobAfterReceipt, setCloseJobAfterReceipt] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");

  // Scale OCR verification
  const [scalePhotoUrl, setScalePhotoUrl] = useState<string>("/sample-scales/scale-112-45.svg");
  const [scaleConfirmed, setScaleConfirmed] = useState<boolean>(true);
  const [scaleReason, setScaleReason] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [generatedTxn, setGeneratedTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/karigars"), fetch("/api/jobs")])
      .then(async ([resK, resJ]) => {
        const dataK = await resK.json();
        const dataJ = await resJ.json();
        if (dataK.success) setKarigars(dataK.karigars);
        if (dataJ.success) {
          setJobs(dataJ.jobs);
          if (dataJ.jobs.length > 0) {
            const initialJob = dataJ.jobs.find((j: JobOrder) => j.status === "in_progress") || dataJ.jobs[0];
            setSelectedJobNumber(initialJob.jobNumber);
            setSelectedKarigarId(initialJob.karigarId);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const selectedJob = jobs.find((j) => j.jobNumber === selectedJobNumber);
  const selectedKarigar = karigars.find((k) => k.id === selectedKarigarId);

  const handleJobSelect = (jobNum: string) => {
    setSelectedJobNumber(jobNum);
    const j = jobs.find((item) => item.jobNumber === jobNum);
    if (j) {
      setSelectedKarigarId(j.karigarId);
      setFinishedPurityPct(j.purityPct);
      setScrapPurityPct(j.purityPct);
      setFilingsPurityPct(j.purityPct);
    }
  };

  // Live Math calculations
  const finishedFineG = calculateFineWeight(finishedGrossG, finishedPurityPct);
  const scrapFineG = calculateFineWeight(scrapGrossG, scrapPurityPct);
  const filingsFineG = calculateFineWeight(filingsGrossG, filingsPurityPct);

  const settlementMath = selectedJob
    ? calculateJobSettlement({
        issuedFineG: selectedJob.issuedFineG,
        returnedPiecesFineG: finishedFineG + selectedJob.totalReturnedFineG,
        returnedScrapFineG: scrapFineG,
        returnedFilingsFineG: filingsFineG,
        allowedWastagePct: selectedJob.allowedWastagePct,
      })
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedKarigarId || !selectedJobNumber) {
      setErrorMessage("Please select a karigar and active job order.");
      return;
    }
    if (finishedGrossG <= 0 && scrapGrossG <= 0 && filingsGrossG <= 0) {
      setErrorMessage("At least one returned article or scrap weight must be entered.");
      return;
    }

    const payload = {
      action: "receipt",
      karigarId: selectedKarigarId,
      jobNumber: selectedJobNumber,
      itemCategory: selectedJob?.itemCategory || "necklace",
      finishedPieces:
        finishedGrossG > 0
          ? [
              {
                huid: huid || undefined,
                grossWeightG: Number(finishedGrossG),
                purityPct: Number(finishedPurityPct),
              },
            ]
          : [],
      scrapGrossG: Number(scrapGrossG),
      scrapPurityPct: Number(scrapPurityPct),
      filingsGrossG: Number(filingsGrossG),
      filingsPurityPct: Number(filingsPurityPct),
      notes,
      scalePhotoUrl,
      scaleReadingConfirmed: scaleConfirmed,
      scaleDiscrepancyReason: scaleReason,
    };

    setSubmitting(true);

    if (!isOnline) {
      addToOfflineQueue({ type: "receipt", payload });
      alert("Offline Mode: Receipt voucher queued locally.");
      setSubmitting(false);
      router.push("/");
      return;
    }

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to record receipt.");
        setSubmitting(false);
        return;
      }

      // If user also checked "Close & Settle Job Order", trigger settle API
      if (closeJobAfterReceipt) {
        await fetch("/api/jobs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobNumber: selectedJobNumber,
            settlementNotes: notes || "Final job settlement completed",
          }),
        });
      }

      setGeneratedTxn(data.transactions[0] || null);
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell
      title="Article Receipt & Wastage Settlement"
      subtitle="Weigh finished jewellery, scrap and filings against issued gold with allowed wastage maths"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {errorMessage && (
          <div className="p-4 rounded-lg bg-status-loss-bg border border-status-loss-border text-status-loss text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* AI Vision Scale Verification */}
        <ScalePhotoReader
          mode="scale"
          currentTypedWeight={finishedGrossG}
          currentTypedPurity={finishedPurityPct}
          onApplyReading={(w, p, photoUrl) => {
            setFinishedGrossG(w);
            if (p) setFinishedPurityPct(p);
            if (photoUrl) setScalePhotoUrl(photoUrl);
          }}
          onVerifyMismatch={(confirmed, reason) => {
            setScaleConfirmed(confirmed);
            if (reason) setScaleReason(reason);
          }}
        />

        {/* Receipt Form */}
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink-primary">
                Return Parameters &amp; Job Matching
              </h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                Matches returned articles and scrap against the original gold issue voucher
              </p>
            </div>
            {selectedJob && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-semibold bg-surface-subtle border border-border text-ink-primary">
                Issued Fine: {formatWeight(selectedJob.issuedFineG)}g
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Order Selection */}
            <div className="space-y-1.5">
              <label htmlFor="job-order" className="block text-xs font-semibold text-ink-primary">
                Select Active Job Order *
              </label>
              <select
                id="job-order"
                value={selectedJobNumber}
                onChange={(e) => handleJobSelect(e.target.value)}
                className="w-full text-xs p-2.5 rounded border border-border bg-surface text-ink-primary font-medium focus:ring-1 focus:ring-accent"
                required
              >
                {jobs.map((j) => (
                  <option key={j.jobNumber} value={j.jobNumber}>
                    {j.jobNumber} — {j.karigarName} ({j.itemCategory}, {formatWeight(j.issuedFineG)}g fine)
                  </option>
                ))}
              </select>

              {selectedJob && (
                <div className="mt-2 p-2.5 rounded bg-surface-subtle border border-border text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-ink-secondary">Category &amp; Wastage:</span>
                    <strong className="capitalize text-ink-primary">
                      {selectedJob.itemCategory} ({selectedJob.allowedWastagePct.toFixed(2)}% allowed)
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-secondary">Already Returned Fine:</span>
                    <span className="font-mono tabular-numbers text-ink-primary">
                      {formatWeight(selectedJob.totalReturnedFineG)} g
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Karigar (Read-only or confirmed) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-ink-primary">
                Karigar (Goldsmith)
              </label>
              <input
                type="text"
                disabled
                value={selectedKarigar ? `${selectedKarigar.name} (${selectedKarigar.tamilName || ""})` : ""}
                className="w-full text-xs p-2.5 rounded border border-border bg-surface-subtle text-ink-secondary font-medium"
              />
              {selectedKarigar && (
                <p className="text-[11px] text-ink-muted">
                  Current Fine Gold Balance:{" "}
                  <strong className="font-mono text-ink-primary tabular-numbers">
                    {formatWeight(selectedKarigar.currentFineBalanceG)}g
                  </strong>
                </p>
              )}
            </div>
          </div>

          {/* Section 1: Finished Articles */}
          <div className="bg-[#FAF8F2] border border-border rounded-lg p-4 space-y-4">
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              1. Finished Jewellery Articles (Net)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label htmlFor="finished-gross" className="block text-xs font-medium text-ink-secondary">
                  Gross Weight (g) *
                </label>
                <input
                  id="finished-gross"
                  type="number"
                  step="0.001"
                  min="0"
                  value={finishedGrossG || ""}
                  onChange={(e) => setFinishedGrossG(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2 rounded border border-border bg-surface font-mono font-bold text-ink-primary tabular-numbers"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="finished-purity" className="block text-xs font-medium text-ink-secondary">
                  Purity % *
                </label>
                <input
                  id="finished-purity"
                  type="number"
                  step="0.01"
                  min="50"
                  max="100"
                  value={finishedPurityPct || ""}
                  onChange={(e) => setFinishedPurityPct(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2 rounded border border-border bg-surface font-mono font-bold text-ink-primary tabular-numbers"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="huid" className="block text-xs font-medium text-ink-secondary">
                  BIS Hallmark HUID (6 alphanumeric)
                </label>
                <input
                  id="huid"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. CB9421"
                  value={huid}
                  onChange={(e) => setHuid(e.target.value.toUpperCase())}
                  className="w-full text-xs p-2 rounded border border-border bg-surface font-mono font-semibold text-ink-primary"
                />
              </div>
            </div>

            <div className="text-right text-xs text-ink-secondary">
              Calculated Fine Content:{" "}
              <strong className="font-mono text-sm text-ink-primary tabular-numbers">
                {formatWeight(finishedFineG)} g fine
              </strong>
            </div>
          </div>

          {/* Section 2: Scrap & Filings Returns */}
          <div className="bg-[#FAF8F2] border border-border rounded-lg p-4 space-y-4">
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wider">
              2. Scrap &amp; Dust Returns (Trimmings &amp; Filings)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Scrap */}
              <div className="p-3 bg-surface rounded border border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-ink-primary">
                    Clean Scrap &amp; Sprues
                  </span>
                  <span className="font-mono text-xs font-bold text-ink-primary tabular-numbers">
                    {formatWeight(scrapFineG)} g fine
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Gross (g)"
                    value={scrapGrossG || ""}
                    onChange={(e) => setScrapGrossG(parseFloat(e.target.value) || 0)}
                    className="text-xs p-1.5 rounded border border-border font-mono tabular-numbers"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="50"
                    max="100"
                    placeholder="Purity %"
                    value={scrapPurityPct || ""}
                    onChange={(e) => setScrapPurityPct(parseFloat(e.target.value) || 0)}
                    className="text-xs p-1.5 rounded border border-border font-mono tabular-numbers"
                  />
                </div>
              </div>

              {/* Filings */}
              <div className="p-3 bg-surface rounded border border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-ink-primary">
                    Bench Filings &amp; Sweeps
                  </span>
                  <span className="font-mono text-xs font-bold text-ink-primary tabular-numbers">
                    {formatWeight(filingsFineG)} g fine
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="Gross (g)"
                    value={filingsGrossG || ""}
                    onChange={(e) => setFilingsGrossG(parseFloat(e.target.value) || 0)}
                    className="text-xs p-1.5 rounded border border-border font-mono tabular-numbers"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="50"
                    max="100"
                    placeholder="Purity %"
                    value={filingsPurityPct || ""}
                    onChange={(e) => setFilingsPurityPct(parseFloat(e.target.value) || 0)}
                    className="text-xs p-1.5 rounded border border-border font-mono tabular-numbers"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Live Wastage Maths Breakdown */}
          {settlementMath && (
            <div className="bg-[#FAF7F0] border border-[#DDD4C3] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Settlement Maths &amp; Wastage Analysis
                </h3>
                <span className="text-xs font-mono text-ink-secondary">
                  Job #{selectedJobNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-surface p-3 rounded border border-border">
                  <span className="text-ink-secondary block">Total Issued:</span>
                  <span className="font-mono text-lg font-bold text-ink-primary tabular-numbers">
                    {formatWeight(settlementMath.issuedFineG)} g
                  </span>
                </div>

                <div className="bg-surface p-3 rounded border border-border">
                  <span className="text-ink-secondary block">Total Returned:</span>
                  <span className="font-mono text-lg font-bold text-ink-primary tabular-numbers">
                    {formatWeight(settlementMath.totalReturnedFineG)} g
                  </span>
                </div>

                <div className="bg-surface p-3 rounded border border-border">
                  <span className="text-ink-secondary block">Allowed Wastage ({settlementMath.allowedWastagePct}%):</span>
                  <span className="font-mono text-lg font-bold text-ink-primary tabular-numbers">
                    {formatWeight(settlementMath.allowedWastageFineG)} g
                  </span>
                </div>

                <div
                  className={`p-3 rounded border ${
                    settlementMath.unexplainedLossFineG > 0.05
                      ? "bg-status-loss-bg border-status-loss-border text-status-loss"
                      : "bg-status-valid-bg border-status-valid-border text-status-valid"
                  }`}
                >
                  <span className="block font-semibold">
                    {settlementMath.unexplainedLossFineG > 0
                      ? "Unaccounted Deficit:"
                      : "Gold Within Limit / Gain:"}
                  </span>
                  <span className="font-mono text-lg font-bold tabular-numbers block">
                    {formatWeight(settlementMath.unexplainedLossFineG)} g
                  </span>
                  {settlementMath.unexplainedLossFineG > 0 && (
                    <span className="text-[10px] block font-mono">
                      Impact: {formatCurrency(settlementMath.financialImpactInr)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Close Job Checkbox */}
          <div className="p-3 rounded bg-surface-subtle border border-border flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={closeJobAfterReceipt}
                onChange={(e) => setCloseJobAfterReceipt(e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-xs font-semibold text-ink-primary">
                Final Settlement: Close and settle Job #{selectedJobNumber} with karigar
              </span>
            </label>
            <span className="text-[11px] text-ink-muted">
              Applies allowed wastage credit to running balance
            </span>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-4 py-2 text-xs font-medium rounded border border-border bg-surface hover:bg-surface-subtle text-ink-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-xs font-semibold rounded bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? "Saving Receipt..." : "Record Receipt & Generate Slip"}
            </button>
          </div>
        </form>
      </div>

      {/* Slip Modal */}
      <DigitalSlipModal
        transaction={generatedTxn}
        onClose={() => {
          setGeneratedTxn(null);
          router.push("/");
        }}
      />
    </Shell>
  );
}

