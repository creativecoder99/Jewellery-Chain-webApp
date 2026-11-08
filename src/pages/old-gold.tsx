import React, { useState, useEffect } from "react";
import Shell from "@/components/layout/Shell";
import ScalePhotoReader from "@/components/scale-reader/ScalePhotoReader";
import { OldGoldEntry } from "@/lib/types";
import { calculateOldGoldValuation, formatWeight, formatPurity, formatCurrency } from "@/lib/math";
import { PAN_REGEX } from "@/lib/validation";

export default function OldGoldPage() {
  const [entries, setEntries] = useState<OldGoldEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [showroomBillNo, setShowroomBillNo] = useState<string>("SH-COIM-9850");
  const [customerName, setCustomerName] = useState<string>("Lakshmi Narayanan");
  const [customerPhone, setCustomerPhone] = useState<string>("9842144556");
  const [grossWeightG, setGrossWeightG] = useState<number>(34.5);
  const [stoneWeightG, setStoneWeightG] = useState<number>(1.2);
  const [dirtDeductionPct, setDirtDeductionPct] = useState<number>(1.5);
  const [testedPurityPct, setTestedPurityPct] = useState<number>(91.6);
  const [goldRatePerGram, setGoldRatePerGram] = useState<number>(12500);
  const [paymentMode, setPaymentMode] = useState<
    "exchange_bill_adjustment" | "bank_transfer" | "cheque" | "cash"
  >("exchange_bill_adjustment");
  const [customerPan, setCustomerPan] = useState<string>("ABCDE1234F");
  const [destination, setDestination] = useState<"vault" | "refiner">("vault");

  const [scalePhotoUrl, setScalePhotoUrl] = useState<string>("/sample-scales/scale-oldgold.svg");
  const [scaleConfirmed, setScaleConfirmed] = useState<boolean>(true);
  const [scaleReason, setScaleReason] = useState<string>("");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/old-gold");
      const data = await res.json();
      if (data.success) setEntries(data.entries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const valuationMath = calculateOldGoldValuation({
    grossWeightG,
    stoneWeightG,
    dirtDeductionPct,
    testedPurityPct,
    goldRatePerGram,
  });

  const panFormatValid = !customerPan || PAN_REGEX.test(customerPan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (valuationMath.panRequired && (!customerPan || !panFormatValid)) {
      setErrorMessage("Valid 10-character PAN is legally required for transactions >= ₹2,00,000 (Income Tax Rule 114B).");
      return;
    }

    if (valuationMath.cashLimitExceeded && paymentMode === "cash") {
      setErrorMessage("Cash payout of ₹2,00,000 or more is strictly prohibited under Section 269ST. Select Bank Transfer or Exchange Bill Adjustment.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/old-gold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showroomBillNo,
          customerName,
          customerPhone,
          grossWeightG: Number(grossWeightG),
          stoneWeightG: Number(stoneWeightG),
          dirtDeductionPct: Number(dirtDeductionPct),
          testedPurityPct: Number(testedPurityPct),
          goldRatePerGram: Number(goldRatePerGram),
          paymentMode,
          customerPan: customerPan ? customerPan.toUpperCase() : undefined,
          destination,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to record old gold purchase.");
        setSubmitting(false);
        return;
      }

      setSuccessMessage(`Old gold entry ${data.entry.id} recorded and tied to Showroom Bill #${showroomBillNo}`);
      fetchEntries();
    } catch (err: any) {
      setErrorMessage(err.message || "Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Shell
      title="Old Gold Desk & Exchange Verification"
      subtitle="Customer scrap intake with karat meter testing, showroom bill linkage, and Income Tax cash limits"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {errorMessage && (
          <div className="p-4 rounded-lg bg-status-loss-bg border border-status-loss-border text-status-loss text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-lg bg-status-valid-bg border border-status-valid-border text-status-valid text-sm font-medium">
            {successMessage}
          </div>
        )}

        {/* AI Vision Scale & Karat Meter Reader */}
        <ScalePhotoReader
          mode="karat_meter"
          currentTypedWeight={grossWeightG}
          currentTypedPurity={testedPurityPct}
          onApplyReading={(w, p, photoUrl) => {
            setGrossWeightG(w);
            if (p) setTestedPurityPct(p);
            if (photoUrl) setScalePhotoUrl(photoUrl);
          }}
          onVerifyMismatch={(confirmed, reason) => {
            setScaleConfirmed(confirmed);
            if (reason) setScaleReason(reason);
          }}
        />

        {/* Old Gold Form */}
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-base font-semibold text-ink-primary">
              Showroom Exchange Intake &amp; Deductions
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5">
              Record once and link to showroom billing software voucher
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Showroom Bill No */}
            <div className="space-y-1">
              <label htmlFor="showroom-bill" className="block font-semibold text-ink-primary">
                Showroom Exchange Bill # *
              </label>
              <input
                id="showroom-bill"
                type="text"
                required
                value={showroomBillNo}
                onChange={(e) => setShowroomBillNo(e.target.value.toUpperCase())}
                placeholder="e.g. SH-COIM-9850"
                className="w-full p-2 rounded border border-border font-mono font-semibold text-ink-primary"
              />
            </div>

            {/* Customer Name */}
            <div className="space-y-1">
              <label htmlFor="customer-name" className="block font-semibold text-ink-primary">
                Customer Name *
              </label>
              <input
                id="customer-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 rounded border border-border text-ink-primary"
              />
            </div>

            {/* Customer Phone */}
            <div className="space-y-1">
              <label htmlFor="customer-phone" className="block font-semibold text-ink-primary">
                Customer Phone (10 digits) *
              </label>
              <input
                id="customer-phone"
                type="tel"
                required
                pattern="[6-9][0-9]{9}"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2 rounded border border-border font-mono text-ink-primary"
              />
            </div>
          </div>

          {/* Weight & Purity Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label htmlFor="old-gross" className="block font-semibold text-ink-primary">
                Gross Weight (g) *
              </label>
              <input
                id="old-gross"
                type="number"
                step="0.001"
                min="0.001"
                required
                value={grossWeightG || ""}
                onChange={(e) => setGrossWeightG(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded border border-border font-mono font-bold text-ink-primary tabular-numbers"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="stone-weight" className="block font-semibold text-ink-primary">
                Stone Weight (g)
              </label>
              <input
                id="stone-weight"
                type="number"
                step="0.001"
                min="0"
                value={stoneWeightG || ""}
                onChange={(e) => setStoneWeightG(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded border border-border font-mono text-ink-primary tabular-numbers"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="dirt-deduction" className="block font-semibold text-ink-primary">
                Dirt &amp; Melting %
              </label>
              <input
                id="dirt-deduction"
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={dirtDeductionPct || ""}
                onChange={(e) => setDirtDeductionPct(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded border border-border font-mono text-ink-primary tabular-numbers"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="tested-purity" className="block font-semibold text-ink-primary">
                Karat Meter Purity % *
              </label>
              <input
                id="tested-purity"
                type="number"
                step="0.01"
                min="30"
                max="100"
                required
                value={testedPurityPct || ""}
                onChange={(e) => setTestedPurityPct(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded border border-border font-mono font-bold text-ink-primary tabular-numbers"
              />
            </div>
          </div>

          {/* Computed Fine Gold & Valuation Box */}
          <div className="bg-[#FAF7F0] border border-[#DDD4C3] rounded-lg p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Valuation Breakdown &amp; Fine Gold Credit
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-surface p-3 rounded border border-border">
                <span className="text-ink-secondary block">Net Melt Weight:</span>
                <span className="font-mono text-lg font-bold text-ink-primary tabular-numbers">
                  {formatWeight(valuationMath.netMeltWeightG)} g
                </span>
                <span className="block text-[10px] text-ink-muted">
                  Gross less stones &amp; dirt
                </span>
              </div>

              <div className="bg-surface p-3 rounded border border-border">
                <span className="text-ink-secondary block">Fine Gold Content:</span>
                <span className="font-mono text-lg font-bold text-accent-hover tabular-numbers">
                  {formatWeight(valuationMath.fineWeightG)} g fine
                </span>
                <span className="block text-[10px] text-ink-muted">
                  @ {valuationMath.testedPurityPct.toFixed(2)}% Purity
                </span>
              </div>

              <div className="bg-surface p-3 rounded border border-border">
                <span className="text-ink-secondary block">Rate Applied:</span>
                <span className="font-mono text-lg font-bold text-ink-primary tabular-numbers">
                  ₹{valuationMath.goldRatePerGram.toLocaleString("en-IN")}/g
                </span>
                <span className="block text-[10px] text-ink-muted">Standard 24K spot</span>
              </div>

              <div className="bg-surface p-3 rounded border border-border">
                <span className="text-ink-secondary block">Net Payable / Adjustment:</span>
                <span className="font-mono text-lg font-bold text-emerald-800 tabular-numbers">
                  {formatCurrency(valuationMath.netPayableInr)}
                </span>
                <span className="block text-[10px] text-ink-muted">
                  Less ₹15/g melting charge
                </span>
              </div>
            </div>
          </div>

          {/* Statutory Income Tax PAN & Cash Limit Compliance Box */}
          <div
            className={`p-4 rounded-lg border space-y-3 text-xs ${
              valuationMath.panRequired
                ? "bg-amber-50/70 border-amber-300"
                : "bg-surface-subtle border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-ink-primary flex items-center gap-2">
                <span>⚖️</span> Statutory Compliance (Income Tax Act 1961)
              </h4>
              {valuationMath.panRequired ? (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Transaction ≥ ₹2,00,000 (PAN Mandatory)
                </span>
              ) : (
                <span className="text-[11px] text-ink-muted">Standard Retail Limit</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="customer-pan" className="block font-medium text-ink-primary">
                  Customer PAN Card {valuationMath.panRequired ? "(Mandatory)" : "(Optional)"}:
                </label>
                <input
                  id="customer-pan"
                  type="text"
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  value={customerPan}
                  onChange={(e) => setCustomerPan(e.target.value.toUpperCase())}
                  className={`w-full p-2 rounded border font-mono font-semibold uppercase ${
                    !panFormatValid
                      ? "border-status-loss text-status-loss bg-status-loss-bg"
                      : "border-border bg-surface text-ink-primary"
                  }`}
                  required={valuationMath.panRequired}
                />
                {!panFormatValid && (
                  <p className="text-[11px] text-status-loss">
                    Invalid PAN format. Must be 5 letters, 4 digits, 1 letter.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="payment-mode" className="block font-medium text-ink-primary">
                  Payment / Settlement Mode:
                </label>
                <select
                  id="payment-mode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full p-2 rounded border border-border bg-surface text-ink-primary font-medium"
                >
                  <option value="exchange_bill_adjustment">
                    Exchange Bill Invoice Adjustment (Recommended)
                  </option>
                  <option value="bank_transfer">Direct Bank Transfer / RTGS / NEFT</option>
                  <option value="cheque">Account Payee Cheque</option>
                  <option
                    value="cash"
                    disabled={valuationMath.cashLimitExceeded}
                  >
                    Cash Payout {valuationMath.cashLimitExceeded ? "(Prohibited ≥ ₹2 Lakhs)" : ""}
                  </option>
                </select>
                {valuationMath.cashLimitExceeded && (
                  <p className="text-[11px] text-status-loss">
                    Section 269ST prohibits cash transactions of ₹2,00,000 or more.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <label htmlFor="destination" className="block font-medium text-ink-primary mb-1">
                Gold Routing Destination:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="destination"
                    value="vault"
                    checked={destination === "vault"}
                    onChange={() => setDestination("vault")}
                  />
                  <span>Vault (Retained for in-house workshop remelting)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="destination"
                    value="refiner"
                    checked={destination === "refiner"}
                    onChange={() => setDestination("refiner")}
                  />
                  <span>Refiner (Dispatched to external refinery batch)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-xs font-semibold rounded bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? "Recording Old Gold..." : "Record Old Gold Intake"}
            </button>
          </div>
        </form>

        {/* Recent Old Gold Purchases Table */}
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-[#FBF9F4]">
            <h2 className="text-sm font-semibold text-ink-primary">
              Recent Old Gold Purchases &amp; Exchange Slips
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] border-b border-border text-ink-secondary font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Intake ID</th>
                  <th className="py-2.5 px-4">Showroom Bill</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4 text-right">Gross Wt</th>
                  <th className="py-2.5 px-4 text-right">Tested Purity</th>
                  <th className="py-2.5 px-4 text-right">Fine Gold</th>
                  <th className="py-2.5 px-4 text-right">Valuation</th>
                  <th className="py-2.5 px-4">PAN Verified</th>
                  <th className="py-2.5 px-4">Destination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-ink-primary">
                      {entry.id}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-ink-secondary">
                      {entry.showroomBillNo}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-ink-primary">
                      {entry.customerName}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-numbers">
                      {formatWeight(entry.grossWeightG)} g
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-numbers">
                      {formatPurity(entry.testedPurityPct)} %
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-accent-hover tabular-numbers">
                      {formatWeight(entry.fineWeightG)} g
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-numbers">
                      {formatCurrency(entry.netPayableInr)}
                    </td>
                    <td className="py-2.5 px-4">
                      {entry.customerPan ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {entry.customerPan}
                        </span>
                      ) : (
                        <span className="text-ink-muted text-[11px]">N/A (&lt;₹2L)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 capitalize">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-800 border border-stone-200">
                        {entry.destination}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}

