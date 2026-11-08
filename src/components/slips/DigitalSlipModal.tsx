import React, { useState } from "react";
import { Transaction } from "@/lib/types";
import { formatWeight, formatPurity } from "@/lib/math";
import { useApp } from "@/context/AppContext";

interface DigitalSlipModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export default function DigitalSlipModal({ transaction, onClose }: DigitalSlipModalProps) {
  const { lang, t } = useApp();
  const [copied, setCopied] = useState<boolean>(false);

  if (!transaction) return null;

  const isIssue = transaction.type === "issue";
  const title = isIssue ? t.slips.issueSlip : t.slips.receiptSlip;

  const formattedSlipText = `*COMPANY A JEWELLERY — ${title.toUpperCase()}*
Slip No: ${transaction.id} | Job: ${transaction.jobNumber || "N/A"}
Date: ${new Date(transaction.date).toLocaleString("en-IN")}
Karigar: ${transaction.karigarName}
Category: ${transaction.itemCategory || transaction.type}
------------------------------
Gross Weight: ${formatWeight(transaction.grossWeightG)} g
Purity: ${formatPurity(transaction.purityPct)} %
Fine Gold Content: ${formatWeight(transaction.fineWeightG)} g fine
${transaction.allowedWastagePct ? `Allowed Wastage: ${formatPurity(transaction.allowedWastagePct)} %\n` : ""}${transaction.huid ? `BIS HUID: ${transaction.huid}\n` : ""}------------------------------
*Karigar Running Balance: ${formatWeight(transaction.fineBalanceAfterG)} g fine*
Scale Status: Verified by Workshop Clerk ✓
Coimbatore Workshop Custody`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(formattedSlipText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(formattedSlipText);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#F8F5EE] border-b border-border flex items-center justify-between no-print">
          <div>
            <h2 className="text-base font-serif font-bold text-ink-primary">{title}</h2>
            <p className="text-xs text-ink-secondary">Voucher: {transaction.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors flex items-center gap-1 shadow-sm"
              title="Share slip directly with Karigar on WhatsApp"
            >
              <span>💬</span> WhatsApp
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1 text-xs font-semibold rounded bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm"
            >
              Print Slip
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-ink-muted hover:text-ink-primary"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Slip Content */}
        <div className="p-6 space-y-5 bg-white text-ink-primary font-sans print:p-0">
          {/* Header */}
          <div className="text-center border-b border-border pb-4">
            <h1 className="text-lg font-serif font-bold tracking-tight text-ink-primary">
              COMPANY A JEWELLERY
            </h1>
            <p className="text-xs text-ink-secondary">
              Central Workshop &amp; Goldsmith Vault • Coimbatore, Tamil Nadu
            </p>
            <div className="mt-2 inline-block px-2.5 py-0.5 rounded bg-surface-subtle border border-border text-xs font-mono font-medium">
              {title} • {transaction.id}
            </div>
          </div>

          {/* Slip Details Grid */}
          <div className="grid grid-cols-2 gap-y-3 text-xs">
            <div>
              <span className="text-ink-secondary block">{t.slips.karigar}:</span>
              <strong className="text-sm font-semibold text-ink-primary">
                {transaction.karigarName}
              </strong>
            </div>

            <div className="text-right">
              <span className="text-ink-secondary block">{t.slips.date}:</span>
              <span className="font-mono text-ink-primary">
                {new Date(transaction.date).toLocaleString("en-IN")}
              </span>
            </div>

            <div>
              <span className="text-ink-secondary block">{t.slips.jobNo}:</span>
              <span className="font-mono font-bold text-ink-primary">
                {transaction.jobNumber || "N/A"}
              </span>
            </div>

            <div className="text-right">
              <span className="text-ink-secondary block">{t.slips.itemCategory}:</span>
              <span className="capitalize font-medium text-ink-primary">
                {transaction.itemCategory || transaction.type.replace("receipt_", "")}
              </span>
            </div>

            {transaction.huid && (
              <div className="col-span-2 bg-[#FBF9F2] p-2 rounded border border-border flex items-center justify-between">
                <span className="font-medium text-ink-secondary">BIS Hallmark HUID:</span>
                <span className="font-mono font-bold text-sm text-ink-primary">
                  {transaction.huid}
                </span>
              </div>
            )}
          </div>

          {/* Gold Weights Table */}
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F0] border-b border-border text-ink-secondary">
                <tr>
                  <th className="py-2 px-3 font-semibold">Specification</th>
                  <th className="py-2 px-3 font-semibold text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 px-3">{t.slips.grossWeight}</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold tabular-numbers">
                    {formatWeight(transaction.grossWeightG)} g
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3">{t.slips.purity}</td>
                  <td className="py-2 px-3 text-right font-mono tabular-numbers">
                    {formatPurity(transaction.purityPct)} %
                  </td>
                </tr>
                <tr className="bg-surface-subtle font-semibold">
                  <td className="py-2 px-3 text-ink-primary">{t.slips.fineGold}</td>
                  <td className="py-2 px-3 text-right font-mono text-sm text-accent-hover tabular-numbers font-bold">
                    {formatWeight(transaction.fineWeightG)} g fine
                  </td>
                </tr>
                {transaction.allowedWastagePct !== undefined && (
                  <tr>
                    <td className="py-2 px-3">{t.slips.allowedWastage}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-numbers">
                      {formatPurity(transaction.allowedWastagePct)} %
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Running Balance Banner */}
          <div className="bg-[#F5F1E6] border border-[#DDD4C3] rounded p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-ink-secondary block">
                {t.slips.runningBalance}
              </span>
              <span className="text-[11px] text-ink-muted">
                Net fine gold held by {transaction.karigarName}
              </span>
            </div>
            <div className="font-mono text-xl font-bold text-ink-primary tabular-numbers">
              {formatWeight(transaction.fineBalanceAfterG)}{" "}
              <span className="text-xs font-sans font-medium text-ink-secondary">g</span>
            </div>
          </div>

          {transaction.notes && (
            <div className="text-xs text-ink-secondary border-t border-border pt-2">
              <strong>Notes:</strong> {transaction.notes}
            </div>
          )}

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs border-t border-border">
            <div>
              <div className="border-b border-ink-muted w-3/4 mx-auto mb-1"></div>
              <span className="text-ink-secondary">{t.slips.clerkSignature}</span>
              <span className="block text-[10px] text-ink-muted">Authorized Issuer</span>
            </div>
            <div>
              <div className="border-b border-ink-muted w-3/4 mx-auto mb-1"></div>
              <span className="text-ink-secondary">{t.slips.karigarSignature}</span>
              <span className="block text-[10px] text-ink-muted">Receiver Acknowledgment</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-ink-muted pt-2 border-t border-border/50">
            {t.slips.printedAt} • Verified with Scale Image Proof
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#FAF8F3] border-t border-border flex items-center justify-between no-print">
          <button
            onClick={handleCopyText}
            className="text-xs text-ink-secondary hover:text-ink-primary underline flex items-center gap-1"
          >
            {copied ? "✓ Copied to Clipboard" : "📋 Copy Slip Text"}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded border border-border hover:bg-surface-subtle text-ink-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
