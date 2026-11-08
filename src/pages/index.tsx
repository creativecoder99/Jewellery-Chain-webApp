import React, { useEffect, useState } from "react";
import Link from "next/link";
import Shell from "@/components/layout/Shell";
import { StockSummary, Transaction, Karigar } from "@/lib/types";
import { formatWeight, formatPurity, formatCurrency } from "@/lib/math";
import { useApp } from "@/context/AppContext";
import DigitalSlipModal from "@/components/slips/DigitalSlipModal";

export default function DashboardPage() {
  const { role, t } = useApp();
  const [stock, setStock] = useState<StockSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [karigars, setKarigars] = useState<Karigar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSlipTxn, setActiveSlipTxn] = useState<Transaction | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStock, resTxns, resKarigars] = await Promise.all([
        fetch("/api/stock"),
        fetch("/api/transactions"),
        fetch("/api/karigars"),
      ]);
      const dataStock = await resStock.json();
      const dataTxns = await resTxns.json();
      const dataKarigars = await resKarigars.json();

      if (dataStock.success) setStock(dataStock.stock);
      if (dataTxns.success) setTransactions(dataTxns.transactions);
      if (dataKarigars.success) setKarigars(dataKarigars.karigars);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !stock) {
    return (
      <Shell title="Daily Stock Statement & Vault Custody">
        <div className="py-12 text-center text-ink-secondary">
          <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm">Loading workshop custody ledger...</p>
        </div>
      </Shell>
    );
  }

  const stockValuation = stock.totalWorkshopFineG * stock.goldRatePerGram24K;

  return (
    <Shell
      title="Daily Stock Statement & Vault Custody"
      subtitle={`Statement as of ${stock.date} • Current Rate: ₹${stock.goldRatePerGram24K.toLocaleString("en-IN")}/g (24K)`}
      actions={
        <div className="flex items-center gap-2">
          <a
            href="/api/export?format=xml"
            download
            className="px-3 py-1.5 text-xs font-semibold rounded border border-border bg-surface hover:bg-surface-subtle text-ink-primary shadow-sm flex items-center gap-1.5"
          >
            <span>📄</span> Export Tally XML
          </a>
          <a
            href="/api/export?format=csv"
            download
            className="px-3 py-1.5 text-xs font-semibold rounded border border-border bg-surface hover:bg-surface-subtle text-ink-primary shadow-sm flex items-center gap-1.5"
          >
            <span>📊</span> Export CSV
          </a>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Core Stock Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Vault Pure & Bullion */}
          <div className="bg-surface border border-border rounded-lg p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
              Vault Bullion &amp; Alloys
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold text-ink-primary tabular-numbers">
                {formatWeight(stock.vaultBullionFineG)}
              </span>
              <span className="text-xs font-semibold text-ink-secondary">g fine</span>
            </div>
            <p className="text-xs text-ink-muted">
              Valuation: {formatCurrency(stock.vaultBullionFineG * stock.goldRatePerGram24K)}
            </p>
          </div>

          {/* Card 2: Manufactured Stock in Vault */}
          <div className="bg-surface border border-border rounded-lg p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
              Finished Vault Stock
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold text-ink-primary tabular-numbers">
                {formatWeight(stock.vaultManufacturedFineG)}
              </span>
              <span className="text-xs font-semibold text-ink-secondary">g fine</span>
            </div>
            <p className="text-xs text-ink-muted">
              Ready for Showroom Dispatch
            </p>
          </div>

          {/* Card 3: With Karigars */}
          <div className="bg-[#FAF6EC] border border-[#E3D7BC] rounded-lg p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-accent-hover uppercase tracking-wider">
              With Karigars (Workshop)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold text-ink-primary tabular-numbers">
                {formatWeight(stock.withKarigarsFineG)}
              </span>
              <span className="text-xs font-semibold text-ink-secondary">g fine</span>
            </div>
            <p className="text-xs text-ink-secondary">
              Across {karigars.filter((k) => k.currentFineBalanceG > 0).length} active karigars
            </p>
          </div>

          {/* Card 4: In Refining Pipeline */}
          <div className="bg-surface border border-border rounded-lg p-5 shadow-sm space-y-2">
            <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
              At Refiner (Scrap &amp; Dust)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold text-ink-primary tabular-numbers">
                {formatWeight(stock.atRefinerFineG)}
              </span>
              <span className="text-xs font-semibold text-ink-secondary">g fine</span>
            </div>
            <p className="text-xs text-ink-muted">
              Pending pure gold recovery credit
            </p>
          </div>
        </div>

        {/* Total Workshop Custody Banner & Financial Impact */}
        <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider block">
                Total Workshop Custody (Company A)
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-mono text-3xl font-extrabold text-ink-primary tabular-numbers">
                  {formatWeight(stock.totalWorkshopFineG)}
                </span>
                <span className="text-base font-semibold text-ink-secondary">grams fine gold</span>
                <span className="text-xs text-ink-muted">
                  ({(stock.totalWorkshopFineG / 1000).toFixed(3)} kg)
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-1">
                Total Book Value:{" "}
                <strong className="text-ink-primary font-semibold">
                  {formatCurrency(stockValuation)}
                </strong>{" "}
                at current Coimbatore spot rate
              </p>
            </div>

            {/* Reconciliation Loss Meter */}
            <div className="border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 space-y-1.5">
              <span className="text-xs font-semibold text-ink-secondary block">
                Unexplained Loss (Month-to-Date)
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-bold text-status-valid tabular-numbers">
                  {stock.unexplainedLossMonthToDateG.toFixed(3)} g
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-status-valid-bg text-status-valid border border-status-valid-border">
                  {stock.lossPercentageMonthToDate}% (Target &lt;0.15%)
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                Down from 0.40% baseline prior to SwarnaTrack deployment.
              </p>
            </div>
          </div>
        </div>

        {/* Karigar Active Balances Summary Table */}
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-[#FBF9F4]">
            <div>
              <h2 className="text-sm font-semibold text-ink-primary">
                Karigar Fine Gold Custody Ledger
              </h2>
              <p className="text-xs text-ink-secondary">
                Running fine gold balances currently held by karigars
              </p>
            </div>
            <Link
              href="/karigars"
              className="text-xs font-semibold text-accent hover:text-accent-hover underline"
            >
              View Full Master &amp; Wastage Rates →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] border-b border-border text-ink-secondary font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Karigar ID</th>
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Specialization</th>
                  <th className="py-2.5 px-4 text-right">Agreed Necklace %</th>
                  <th className="py-2.5 px-4 text-right">Current Fine Balance</th>
                  <th className="py-2.5 px-4 text-right">Lifetime Issued</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {karigars.map((k) => (
                  <tr key={k.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-ink-secondary">
                      {k.id}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-ink-primary">
                      {k.name}
                      {k.tamilName && (
                        <span className="block text-[11px] text-ink-muted">
                          {k.tamilName}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-ink-secondary">{k.specialization}</td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-numbers">
                      {k.categoryWastage.necklace.toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-sm text-ink-primary tabular-numbers">
                      {formatWeight(k.currentFineBalanceG)} g
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-ink-secondary tabular-numbers">
                      {formatWeight(k.lifetimeIssuedG)} g
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {k.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link
                        href={`/issue?karigarId=${k.id}`}
                        className="px-2 py-1 rounded text-[11px] font-medium bg-surface border border-border hover:bg-surface-subtle text-accent-hover"
                      >
                        Issue Gold
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions Audit Table */}
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-[#FBF9F4]">
            <div>
              <h2 className="text-sm font-semibold text-ink-primary">
                Recent Gold Movement &amp; Weighment Audit
              </h2>
              <p className="text-xs text-ink-secondary">
                Exact fine weights, scale readings and verified vouchers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-secondary">
                Showing {transactions.length} records
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] border-b border-border text-ink-secondary font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Txn ID</th>
                  <th className="py-2.5 px-4">Time</th>
                  <th className="py-2.5 px-4">Karigar</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Job No</th>
                  <th className="py-2.5 px-4 text-right">Gross Wt</th>
                  <th className="py-2.5 px-4 text-right">Purity</th>
                  <th className="py-2.5 px-4 text-right">Fine Wt</th>
                  <th className="py-2.5 px-4 text-right">Running Balance</th>
                  <th className="py-2.5 px-4 text-center">Scale Proof</th>
                  <th className="py-2.5 px-4 text-right">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-ink-primary">
                      {txn.id}
                    </td>
                    <td className="py-2.5 px-4 text-ink-secondary">
                      {new Date(txn.date).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-ink-primary">
                      {txn.karigarName}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium ${
                          txn.type === "issue"
                            ? "bg-amber-50 text-amber-900 border border-amber-200"
                            : txn.type === "receipt_piece"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-stone-100 text-stone-800 border border-stone-200"
                        }`}
                      >
                        {txn.type === "issue"
                          ? "Issue"
                          : txn.type === "receipt_piece"
                          ? "Receipt (Piece)"
                          : "Receipt (Scrap)"}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-ink-secondary">
                      {txn.jobNumber || "-"}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-numbers">
                      {formatWeight(txn.grossWeightG)} g
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono tabular-numbers">
                      {formatPurity(txn.purityPct)} %
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-ink-primary tabular-numbers">
                      {formatWeight(txn.fineWeightG)} g
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-accent-hover tabular-numbers">
                      {formatWeight(txn.fineBalanceAfterG)} g
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {txn.scalePhotoUrl ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="text-ink-muted text-[11px]">Manual</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => setActiveSlipTxn(txn)}
                        className="text-xs font-semibold text-accent hover:text-accent-hover underline"
                      >
                        View Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slip Modal */}
      <DigitalSlipModal
        transaction={activeSlipTxn}
        onClose={() => setActiveSlipTxn(null)}
      />
    </Shell>
  );
}

