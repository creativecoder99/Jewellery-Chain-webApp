import React, { useState } from "react";
import { StockSummary } from "@/lib/types";
import { formatWeight, formatCurrency } from "@/lib/math";

interface EodLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: StockSummary;
}

export default function EodLockModal({ isOpen, onClose, stock }: EodLockModalProps) {
  const [step, setStep] = useState<number>(1);
  const [physicalVaultCountG, setPhysicalVaultCountG] = useState<number>(stock.vaultBullionFineG + stock.vaultManufacturedFineG);
  const [clerkName, setClerkName] = useState<string>("Anand S");
  const [locked, setLocked] = useState<boolean>(false);

  if (!isOpen) return null;

  const theoreticalVaultTotal = stock.vaultBullionFineG + stock.vaultManufacturedFineG;
  const varianceG = Math.abs(physicalVaultCountG - theoreticalVaultTotal);
  const isVaultMatched = varianceG < 0.005;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-xl max-w-lg w-full overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8F5EE] border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-ink-primary">
              End-of-Day Vault Locking &amp; Handover Ceremony
            </h2>
            <p className="text-[11px] text-ink-secondary mt-0.5">
              Daily 5-minute protocol replacing month-end 3-day manual reconciliation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-ink-muted hover:text-ink-primary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Steps Breadcrumb */}
        <div className="flex border-b border-border bg-surface-subtle font-semibold text-[11px]">
          <div className={`flex-1 py-2 text-center ${step === 1 ? "bg-surface text-accent-hover border-b-2 border-accent" : "text-ink-muted"}`}>
            1. Slips Verify
          </div>
          <div className={`flex-1 py-2 text-center ${step === 2 ? "bg-surface text-accent-hover border-b-2 border-accent" : "text-ink-muted"}`}>
            2. Safe Weighment
          </div>
          <div className={`flex-1 py-2 text-center ${step === 3 ? "bg-surface text-accent-hover border-b-2 border-accent" : "text-ink-muted"}`}>
            3. Lock &amp; Seal
          </div>
        </div>

        {/* Modal Content by Step */}
        <div className="p-6 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3 bg-surface-subtle rounded border border-border space-y-2">
                <span className="font-semibold text-ink-primary block">
                  Checklist: 40 Karigar Slips &amp; Workshop Custody
                </span>
                <div className="space-y-1.5 text-ink-secondary">
                  <div className="flex items-center gap-2">
                    <span className="text-status-valid font-bold">✓</span>
                    <span>All day issue slips generated and signed by artisans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-status-valid font-bold">✓</span>
                    <span>All returned finished pieces checked with BIS HUID codes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-status-valid font-bold">✓</span>
                    <span>Day scrap trimmings and bench sweep bags sealed for refining</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F0] border border-[#DDD4C3] rounded flex justify-between items-center">
                <span>Gold Currently with 40 Karigars:</span>
                <strong className="font-mono text-sm text-ink-primary tabular-numbers">
                  {formatWeight(stock.withKarigarsFineG)} g fine
                </strong>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-1.5 rounded bg-accent text-white hover:bg-accent-hover font-semibold"
                >
                  Proceed to Safe Weighment →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="safe-scale-count" className="block font-semibold text-ink-primary">
                  Physical Electronic Vault Safe Scale Count (g fine) *
                </label>
                <div className="relative">
                  <input
                    id="safe-scale-count"
                    type="number"
                    step="0.001"
                    value={physicalVaultCountG}
                    onChange={(e) => setPhysicalVaultCountG(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded border border-border font-mono font-bold text-sm text-ink-primary tabular-numbers"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-ink-muted font-mono">
                    g
                  </span>
                </div>
                <span className="text-[10px] text-ink-muted">
                  Theoretical System Balance: {formatWeight(theoreticalVaultTotal)}g
                </span>
              </div>

              <div
                className={`p-3 rounded border space-y-1 ${
                  isVaultMatched
                    ? "bg-status-valid-bg border-status-valid-border text-status-valid"
                    : "bg-status-loss-bg border-status-loss-border text-status-loss"
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{isVaultMatched ? "✓ Physical Scale Count Perfectly Matched" : "⚠️ Scale Discrepancy"}</span>
                  <span className="font-mono tabular-numbers">
                    Diff: {formatWeight(varianceG)} g
                  </span>
                </div>
                <p className="text-[11px]">
                  {isVaultMatched
                    ? "Vault bullion and manufactured stock match system records exactly."
                    : "Please recount bullion trays before proceeding."}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 rounded border border-border hover:bg-surface-subtle"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!isVaultMatched}
                  onClick={() => setStep(3)}
                  className="px-4 py-1.5 rounded bg-accent text-white hover:bg-accent-hover font-semibold disabled:opacity-50"
                >
                  Confirm &amp; Proceed to Lock →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-[#FAF7F0] border border-[#DDD4C3] rounded-lg space-y-2 text-center">
                <span className="text-xl">🔐</span>
                <h3 className="font-serif font-bold text-sm text-ink-primary">
                  Ready to Lock Workshop Day: {stock.date}
                </h3>
                <p className="text-[11px] text-ink-secondary">
                  Total Custody: <strong className="font-mono text-ink-primary">{formatWeight(stock.totalWorkshopFineG)}g fine</strong> ({formatCurrency(stock.totalWorkshopFineG * stock.goldRatePerGram24K)})
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="authorized-officer" className="block font-semibold text-ink-primary">
                  Authorizing Workshop Custody Officer:
                </label>
                <input
                  id="authorized-officer"
                  type="text"
                  value={clerkName}
                  onChange={(e) => setClerkName(e.target.value)}
                  className="w-full p-2 rounded border border-border text-ink-primary font-medium"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3 py-1.5 rounded border border-border hover:bg-surface-subtle"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLocked(true);
                    alert(`Vault Day ${stock.date} successfully sealed and signed by ${clerkName}. Daily Tally voucher locked.`);
                    onClose();
                  }}
                  className="px-5 py-2 rounded bg-emerald-800 text-white hover:bg-emerald-900 font-semibold shadow-sm"
                >
                  {locked ? "✓ Vault Locked" : "🔒 Seal Vault & Export Tally Day Journal"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

