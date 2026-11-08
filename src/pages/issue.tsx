import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Shell from "@/components/layout/Shell";
import ScalePhotoReader from "@/components/scale-reader/ScalePhotoReader";
import DigitalSlipModal from "@/components/slips/DigitalSlipModal";
import { Karigar, ItemCategory, Transaction } from "@/lib/types";
import { calculateFineWeight, calculateAllowedWastage, formatWeight, formatPurity } from "@/lib/math";
import { useApp } from "@/context/AppContext";

export default function IssueGoldPage() {
  const router = useRouter();
  const { isOnline, addToOfflineQueue } = useApp();

  const [karigars, setKarigars] = useState<Karigar[]>([]);
  const [selectedKarigarId, setSelectedKarigarId] = useState<string>("");
  const [itemCategory, setItemCategory] = useState<ItemCategory>("necklace");
  const [grossWeightG, setGrossWeightG] = useState<number>(120.0);
  const [purityPct, setPurityPct] = useState<number>(91.6);
  const [allowedWastagePct, setAllowedWastagePct] = useState<number>(3.0);
  const [jobNumber, setJobNumber] = useState<string>("JOB-3045");
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>(
    new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");
  const [scalePhotoUrl, setScalePhotoUrl] = useState<string>("/sample-scales/scale-120.svg");
  const [scaleConfirmed, setScaleConfirmed] = useState<boolean>(true);
  const [scaleReason, setScaleReason] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [generatedTxn, setGeneratedTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    fetch("/api/karigars")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.karigars.length > 0) {
          setKarigars(data.karigars);
          const initialId = (router.query.karigarId as string) || data.karigars[0].id;
          setSelectedKarigarId(initialId);

          const k = data.karigars.find((item: Karigar) => item.id === initialId);
          if (k) {
            setAllowedWastagePct(k.categoryWastage[itemCategory] || 3.0);
          }
        }
      });
  }, [router.query.karigarId]);

  const selectedKarigar = karigars.find((k) => k.id === selectedKarigarId);

  const handleCategoryChange = (cat: ItemCategory) => {
    setItemCategory(cat);
    if (selectedKarigar && selectedKarigar.categoryWastage[cat] !== undefined) {
      setAllowedWastagePct(selectedKarigar.categoryWastage[cat]);
    }
  };

  const handleKarigarChange = (id: string) => {
    setSelectedKarigarId(id);
    const k = karigars.find((item) => item.id === id);
    if (k && k.categoryWastage[itemCategory] !== undefined) {
      setAllowedWastagePct(k.categoryWastage[itemCategory]);
    }
  };

  const fineWeightG = calculateFineWeight(grossWeightG, purityPct);
  const allowedWastageFineG = calculateAllowedWastage(fineWeightG, allowedWastagePct);
  const projectedBalance = selectedKarigar
    ? selectedKarigar.currentFineBalanceG + fineWeightG
    : fineWeightG;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedKarigarId) {
      setErrorMessage("Please select a karigar.");
      return;
    }
    if (grossWeightG <= 0) {
      setErrorMessage("Gross weight must be greater than 0.");
      return;
    }

    const payload = {
      action: "issue",
      karigarId: selectedKarigarId,
      itemCategory,
      grossWeightG: Number(grossWeightG),
      purityPct: Number(purityPct),
      allowedWastagePct: Number(allowedWastagePct),
      jobNumber,
      expectedReturnDate,
      notes,
      scalePhotoUrl,
      scaleReadingConfirmed: scaleConfirmed,
      scaleDiscrepancyReason: scaleReason,
    };

    setSubmitting(true);

    if (!isOnline) {
      // Offline mode handling
      addToOfflineQueue({ type: "issue", payload });
      alert("Offline Mode: Gold issue transaction queued locally. It will sync automatically when connected.");
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
        setErrorMessage(data.error || "Failed to record issue transaction.");
        setSubmitting(false);
        return;
      }

      setGeneratedTxn(data.transaction);
      // update local karigar balance
      if (selectedKarigar) {
        selectedKarigar.currentFineBalanceG = data.transaction.fineBalanceAfterG;
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell
      title="Gold Issue Entry & Slip Dispatch"
      subtitle="Vault pure bullion issuance with side-by-side scale reading verification"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Error alert */}
        {errorMessage && (
          <div className="p-4 rounded-lg bg-status-loss-bg border border-status-loss-border text-status-loss text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* AI Vision Scale Verification Component */}
        <ScalePhotoReader
          mode="scale"
          currentTypedWeight={grossWeightG}
          currentTypedPurity={purityPct}
          onApplyReading={(w, p, photoUrl) => {
            setGrossWeightG(w);
            if (p) setPurityPct(p);
            if (photoUrl) setScalePhotoUrl(photoUrl);
          }}
          onVerifyMismatch={(confirmed, reason) => {
            setScaleConfirmed(confirmed);
            if (reason) setScaleReason(reason);
          }}
        />

        {/* Issue Form */}
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-semibold text-ink-primary">
              Issue Parameters &amp; Fine Gold Accounting
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Exact fine gold calculated to 3 decimal places strictly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Karigar Selection */}
            <div className="space-y-1.5">
              <label htmlFor="karigar" className="block text-xs font-semibold text-ink-primary">
                Karigar (Goldsmith) *
              </label>
              <select
                id="karigar"
                value={selectedKarigarId}
                onChange={(e) => handleKarigarChange(e.target.value)}
                className="w-full text-xs p-2.5 rounded border border-border bg-surface text-ink-primary font-medium focus:ring-1 focus:ring-accent"
                required
              >
                {karigars.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} ({k.tamilName}) — Bal: {formatWeight(k.currentFineBalanceG)}g
                  </option>
                ))}
              </select>

              {selectedKarigar && (
                <div className="mt-2 p-2.5 rounded bg-surface-subtle border border-border text-xs flex justify-between items-center">
                  <span className="text-ink-secondary">Current Running Balance:</span>
                  <strong className="font-mono text-ink-primary tabular-numbers">
                    {formatWeight(selectedKarigar.currentFineBalanceG)} g fine
                  </strong>
                </div>
              )}
            </div>

            {/* Item Category */}
            <div className="space-y-1.5">
              <label htmlFor="category" className="block text-xs font-semibold text-ink-primary">
                Article Category *
              </label>
              <select
                id="category"
                value={itemCategory}
                onChange={(e) => handleCategoryChange(e.target.value as ItemCategory)}
                className="w-full text-xs p-2.5 rounded border border-border bg-surface text-ink-primary font-medium focus:ring-1 focus:ring-accent"
              >
                <option value="necklace">Necklace (ஆரம் / நெக்லஸ்)</option>
                <option value="bangle">Bangle (வளையல்)</option>
                <option value="chain">Chain (சங்கிலி)</option>
                <option value="ring">Ring (மோதிரம்)</option>
                <option value="earring">Earring (கம்மல்)</option>
                <option value="custom_antique">Custom Antique (பழங்கால நகை)</option>
                <option value="casting">Casting Piece (அச்சு வார்ப்பு)</option>
              </select>

              <p className="text-[11px] text-ink-muted">
                Agreed master wastage for this category:{" "}
                <strong className="text-ink-primary">{allowedWastagePct.toFixed(2)}%</strong>
              </p>
            </div>

            {/* Gross Weight */}
            <div className="space-y-1.5">
              <label htmlFor="gross-weight" className="block text-xs font-semibold text-ink-primary">
                Gross Weight (grams) *
              </label>
              <div className="relative">
                <input
                  id="gross-weight"
                  type="number"
                  step="0.001"
                  min="0.001"
                  max="5000"
                  value={grossWeightG || ""}
                  onChange={(e) => setGrossWeightG(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 pr-8 rounded border border-border bg-surface font-mono text-ink-primary font-bold focus:ring-1 focus:ring-accent tabular-numbers"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-ink-muted font-mono">
                  g
                </span>
              </div>
            </div>

            {/* Purity % */}
            <div className="space-y-1.5">
              <label htmlFor="purity" className="block text-xs font-semibold text-ink-primary">
                Purity Percentage (%) *
              </label>
              <div className="relative">
                <input
                  id="purity"
                  type="number"
                  step="0.01"
                  min="50"
                  max="100"
                  value={purityPct || ""}
                  onChange={(e) => setPurityPct(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 pr-8 rounded border border-border bg-surface font-mono text-ink-primary font-bold focus:ring-1 focus:ring-accent tabular-numbers"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-ink-muted font-mono">
                  %
                </span>
              </div>
              <span className="text-[11px] text-ink-muted">
                Standard 22 Karat (91.60) / 24 Karat (99.90)
              </span>
            </div>

            {/* Job Number */}
            <div className="space-y-1.5">
              <label htmlFor="job-number" className="block text-xs font-semibold text-ink-primary">
                Job Order Number *
              </label>
              <input
                id="job-number"
                type="text"
                value={jobNumber}
                onChange={(e) => setJobNumber(e.target.value.toUpperCase())}
                className="w-full text-xs p-2.5 rounded border border-border bg-surface font-mono text-ink-primary font-semibold focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            {/* Expected Return Date */}
            <div className="space-y-1.5">
              <label htmlFor="return-date" className="block text-xs font-semibold text-ink-primary">
                Expected Return Date *
              </label>
              <input
                id="return-date"
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded border border-border bg-surface text-ink-primary focus:ring-1 focus:ring-accent"
                required
              />
            </div>
          </div>

          {/* Issue Calculation Summary Box */}
          <div className="bg-[#FAF7F0] border border-[#DDD4C3] rounded-lg p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Computed Fine Gold Issue &amp; Running Ledger
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-surface p-3 rounded border border-border">
                <span className="text-ink-secondary block">Fine Gold to Issue:</span>
                <span className="font-mono text-xl font-bold text-accent-hover tabular-numbers">
                  {formatWeight(fineWeightG)} g
                </span>
                <span className="block text-[11px] text-ink-muted mt-0.5">
                  ({grossWeightG.toFixed(3)}g × {purityPct.toFixed(2)}%)
                </span>
              </div>

              <div className="bg-surface p-3 rounded border border-border">
                <span className="text-ink-secondary block">Allowed Wastage Allowance:</span>
                <span className="font-mono text-xl font-semibold text-ink-primary tabular-numbers">
                  {formatWeight(allowedWastageFineG)} g
                </span>
                <span className="block text-[11px] text-ink-muted mt-0.5">
                  {allowedWastagePct.toFixed(2)}% of fine weight
                </span>
              </div>

              <div className="bg-surface p-3 rounded border border-border">
                <span className="text-ink-secondary block">Karigar New Balance:</span>
                <span className="font-mono text-xl font-bold text-ink-primary tabular-numbers">
                  {formatWeight(projectedBalance)} g
                </span>
                <span className="block text-[11px] text-ink-muted mt-0.5">
                  Net fine gold in custody
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="block text-xs font-semibold text-ink-primary">
              Workshop Instructions / Notes:
            </label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Issue 22K pure cut bar for antique bridal necklace design"
              className="w-full text-xs p-2.5 rounded border border-border bg-surface text-ink-primary focus:ring-1 focus:ring-accent"
            />
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
              {submitting ? "Recording Issue..." : "Confirm & Generate Karigar Slip"}
            </button>
          </div>
        </form>
      </div>

      {/* Slip Modal Popup */}
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

