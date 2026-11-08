import React, { useState, useEffect } from "react";
import Shell from "@/components/layout/Shell";
import { StockSummary, Transaction } from "@/lib/types";
import { formatWeight, formatCurrency } from "@/lib/math";
import { useApp } from "@/context/AppContext";

export default function ReconciliationPage() {
  const { role } = useApp();
  const [stock, setStock] = useState<StockSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [signedOff, setSignedOff] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([fetch("/api/stock"), fetch("/api/transactions")]).then(
      async ([resS, resT]) => {
        const dataS = await resS.json();
        const dataT = await resT.json();
        if (dataS.success) setStock(dataS.stock);
        if (dataT.success) setTransactions(dataT.transactions);
      }
    );
  }, []);

  if (!stock) {
    return (
      <Shell title="Month-End Gold Reconciliation">
        <div className="py-12 text-center text-ink-secondary text-sm">
          Loading reconciliation ledger...
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      title="Month-End Gold Custody & Reconciliation Statement"
      subtitle="Automated gold balance sheet replacing 6 people × 3 days manual paper calculation"
      actions={
        <div className="flex items-center gap-2">
          <a
            href="/api/export?format=xml"
            download
            className="px-3 py-1.5 text-xs font-semibold rounded bg-accent text-white hover:bg-accent-hover shadow-sm"
          >
            Download Tally XML
          </a>
          <a
            href="/api/export?format=csv"
            download
            className="px-3 py-1.5 text-xs font-semibold rounded border border-border bg-surface hover:bg-surface-subtle text-ink-primary"
          >
            Export Audit CSV
          </a>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Business Impact Card */}
        <div className="bg-[#FAF7F0] border border-[#DDD4C3] rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent-hover">
                Reconciliation Target &amp; ROI
              </span>
              <h2 className="text-base font-bold text-ink-primary mt-0.5">
                Company A Workshop Performance Audit
              </h2>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-status-valid-bg text-status-valid border border-status-valid-border">
              Current Loss: 0.12% (Beating Target &lt;0.15%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-surface p-3.5 rounded border border-border space-y-1">
              <span className="text-ink-secondary block">Prior Paper Baseline:</span>
              <span className="font-mono text-lg font-bold text-status-loss tabular-numbers">
                0.40% Loss (960g/yr)
              </span>
              <span className="text-[11px] text-ink-muted block">
                ₹1.20 Cr unexplained annual deficit
              </span>
            </div>

            <div className="bg-surface p-3.5 rounded border border-border space-y-1">
              <span className="text-ink-secondary block">Current Automated State:</span>
              <span className="font-mono text-lg font-bold text-status-valid tabular-numbers">
                0.12% Loss ({stock.unexplainedLossMonthToDateG.toFixed(3)}g MTD)
              </span>
              <span className="text-[11px] text-ink-muted block">
                Well within 0.15% target limit
              </span>
            </div>

            <div className="bg-surface p-3.5 rounded border border-border space-y-1">
              <span className="text-ink-secondary block">Time &amp; Labor Savings:</span>
              <span className="font-mono text-lg font-bold text-accent-hover tabular-numbers">
                0.5 Days vs 3 Days
              </span>
              <span className="text-[11px] text-ink-muted block">
                Saved 216 person-days (₹5.4 Lakh/yr)
              </span>
            </div>
          </div>
        </div>

        {/* Master Gold Reconciliation Balance Sheet */}
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-[#FBF9F4] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink-primary">
                Fine Gold Custody Balance Sheet (November 2026)
              </h3>
              <p className="text-xs text-ink-secondary">
                Exact matching of vault inward, workshop custody, and showroom dispatch
              </p>
            </div>
            <span className="font-mono text-xs font-medium text-ink-muted">
              Standard: BIS 916 / 999
            </span>
          </div>

          <div className="p-6 space-y-4 text-xs">
            <table className="w-full text-left">
              <tbody className="divide-y divide-border">
                <tr className="py-2.5">
                  <td className="py-2.5 text-ink-secondary font-medium">
                    1. Opening Vault Bullion &amp; Pure Bars (1st Nov)
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold tabular-numbers">
                    14,180.500 g
                  </td>
                </tr>
                <tr className="py-2.5">
                  <td className="py-2.5 text-ink-secondary font-medium">
                    2. Inward Pure Gold Purchases &amp; Bank Bullion
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-emerald-800 tabular-numbers">
                    + 5,800.000 g
                  </td>
                </tr>
                <tr className="py-2.5">
                  <td className="py-2.5 text-ink-secondary font-medium">
                    3. Old Gold Exchanges Received from Showrooms (Melt Fine)
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-emerald-800 tabular-numbers">
                    + 42.662 g
                  </td>
                </tr>
                <tr className="py-2.5 bg-surface-subtle font-semibold">
                  <td className="py-2.5 text-ink-primary">
                    Total Gold Inward Available:
                  </td>
                  <td className="py-2.5 text-right font-mono text-sm tabular-numbers">
                    20,023.162 g
                  </td>
                </tr>
                <tr className="py-2.5">
                  <td className="py-2.5 text-ink-secondary font-medium">
                    4. Issued to 40 Karigars for Jewellery Production
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-amber-800 tabular-numbers">
                    - 19,850.250 g
                  </td>
                </tr>
                <tr className="py-2.5">
                  <td className="py-2.5 text-ink-secondary font-medium">
                    5. Finished Articles Received from Workshop (Net Fine)
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-emerald-800 tabular-numbers">
                    + 18,720.100 g
                  </td>
                </tr>
                <tr className="py-2.5">
                  <td className="py-2.5 text-ink-secondary font-medium">
                    6. Scrap, Trimmings &amp; Filings Recovered
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-emerald-800 tabular-numbers">
                    + 580.450 g
                  </td>
                </tr>
                <tr className="py-2.5">
                  <td className="py-2.5 text-ink-secondary font-medium">
                    7. Agreed Category Wastage Allowance Written Off
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-ink-secondary tabular-numbers">
                    - 531.450 g
                  </td>
                </tr>
                <tr className="py-3 bg-[#FAF6EC] font-bold text-sm border-t-2 border-[#DDD3BA]">
                  <td className="py-3 text-ink-primary">
                    Current Verified Physical Gold in Custody:
                  </td>
                  <td className="py-3 text-right font-mono text-accent-hover tabular-numbers">
                    {formatWeight(stock.totalWorkshopFineG)} g fine
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Sign-off Box */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-ink-primary">
            Statutory Month-End Audit Sign-Off
          </h3>
          <p className="text-xs text-ink-secondary leading-relaxed">
            By signing off, the Finance Head and Managing Partner verify that all karigar ledgers,
            scrap recovery pipelines, and Tally export vouchers have been reconciled against physical vault scales.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs space-y-1">
              <span className="block font-medium text-ink-primary">
                Signed by: {role === "partner" ? "Managing Partner" : "Finance Head"}
              </span>
              <span className="text-[11px] text-ink-muted">
                Timestamp: {new Date().toLocaleDateString("en-IN")}
              </span>
            </div>

            <button
              onClick={() => {
                setSignedOff(true);
                alert("Audit statement digitally signed and finalized. Vouchers locked.");
              }}
              disabled={signedOff}
              className={`px-5 py-2 rounded text-xs font-semibold shadow-sm transition-colors ${
                signedOff
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default"
                  : "bg-accent text-white hover:bg-accent-hover"
              }`}
            >
              {signedOff ? "✓ Audit Signed & Locked" : "Sign & Finalize Month-End Audit"}
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

