import React from "react";
import { formatWeight } from "@/lib/math";

interface GoldYieldBarProps {
  issuedFineG: number;
  finishedFineG: number;
  scrapFineG: number;
  filingsFineG: number;
  allowedWastageFineG: number;
  unexplainedLossFineG: number;
}

export default function GoldYieldBar({
  issuedFineG,
  finishedFineG,
  scrapFineG,
  filingsFineG,
  allowedWastageFineG,
  unexplainedLossFineG,
}: GoldYieldBarProps) {
  if (issuedFineG <= 0) return null;

  const finishedPct = Math.min(100, (finishedFineG / issuedFineG) * 100);
  const scrapPct = Math.min(100, (scrapFineG / issuedFineG) * 100);
  const filingsPct = Math.min(100, (filingsFineG / issuedFineG) * 100);
  const allowedPct = Math.min(100, (allowedWastageFineG / issuedFineG) * 100);

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-ink-primary uppercase tracking-wider text-[11px]">
          Physical Gold Yield Distribution (Where did every milligram go?)
        </h4>
        <span className="font-mono text-ink-secondary">
          Base: {formatWeight(issuedFineG)}g fine (100%)
        </span>
      </div>

      {/* Segmented Bar */}
      <div className="h-5 rounded bg-[#EDE8DC] overflow-hidden flex border border-border">
        {finishedPct > 0 && (
          <div
            style={{ width: `${finishedPct}%` }}
            title={`Finished Jewellery: ${finishedPct.toFixed(1)}% (${formatWeight(finishedFineG)}g)`}
            className="bg-[#2D6A4F] text-white flex items-center justify-center font-mono text-[10px] font-bold overflow-hidden"
          >
            {finishedPct > 15 ? `${finishedPct.toFixed(1)}%` : ""}
          </div>
        )}

        {scrapPct > 0 && (
          <div
            style={{ width: `${scrapPct}%` }}
            title={`Scrap Trimmings: ${scrapPct.toFixed(1)}% (${formatWeight(scrapFineG)}g)`}
            className="bg-[#8C6820] text-white flex items-center justify-center font-mono text-[10px] font-bold overflow-hidden"
          >
            {scrapPct > 6 ? `${scrapPct.toFixed(1)}%` : ""}
          </div>
        )}

        {filingsPct > 0 && (
          <div
            style={{ width: `${filingsPct}%` }}
            title={`Bench Filings: ${filingsPct.toFixed(1)}% (${formatWeight(filingsFineG)}g)`}
            className="bg-[#B58A38] text-white flex items-center justify-center font-mono text-[10px] font-bold overflow-hidden"
          >
            {filingsPct > 4 ? `${filingsPct.toFixed(1)}%` : ""}
          </div>
        )}

        {allowedPct > 0 && (
          <div
            style={{ width: `${allowedPct}%` }}
            title={`Allowed Wastage Allowance: ${allowedPct.toFixed(1)}% (${formatWeight(allowedWastageFineG)}g)`}
            className="bg-[#D4C39E] text-ink-primary flex items-center justify-center font-mono text-[10px] font-bold overflow-hidden"
          >
            {allowedPct > 5 ? `${allowedPct.toFixed(1)}%` : ""}
          </div>
        )}
      </div>

      {/* Legend & Gram Tags */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#2D6A4F] shrink-0"></span>
          <span className="text-ink-secondary truncate">
            Finished Pieces: <strong className="font-mono text-ink-primary">{formatWeight(finishedFineG)}g</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#8C6820] shrink-0"></span>
          <span className="text-ink-secondary truncate">
            Scrap Sprues: <strong className="font-mono text-ink-primary">{formatWeight(scrapFineG)}g</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#B58A38] shrink-0"></span>
          <span className="text-ink-secondary truncate">
            Filings / Sweeps: <strong className="font-mono text-ink-primary">{formatWeight(filingsFineG)}g</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#D4C39E] shrink-0"></span>
          <span className="text-ink-secondary truncate">
            Agreed Allowance: <strong className="font-mono text-ink-primary">{formatWeight(allowedWastageFineG)}g</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

