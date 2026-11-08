import React, { useState } from "react";
import { round3, formatWeight } from "@/lib/math";

interface AlloyCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToIssue?: (grossWeight: number, purityPct: number, notes: string) => void;
}

export default function AlloyCalculatorModal({
  isOpen,
  onClose,
  onApplyToIssue,
}: AlloyCalculatorModalProps) {
  const [calculationMode, setCalculationMode] = useState<"dilute_24k" | "enrich_scrap">("dilute_24k");

  // Mode 1: Diluting 24K pure bar to target karat (e.g. 22K / 18K)
  const [pureGoldG, setPureGoldG] = useState<number>(100.0);
  const [targetPurityPct, setTargetPurityPct] = useState<number>(91.6); // 22K standard
  const [copperRatioPct, setCopperRatioPct] = useState<number>(60); // 60% copper, 40% silver alloy

  // Mode 2: Enriching lower karat scrap with 24K pure bar
  const [scrapWeightG, setScrapWeightG] = useState<number>(50.0);
  const [scrapPurityPct, setScrapPurityPct] = useState<number>(85.0);

  if (!isOpen) return null;

  // Maths for Mode 1: Dilution
  // Target Purity = (Pure Gold / Total Mixed) -> Total Mixed = Pure Gold / (Target Purity / 100)
  // Alloy to Add = Total Mixed - Pure Gold
  const targetPurityDec = targetPurityPct / 100;
  const totalMixed22KG = targetPurityDec > 0 ? round3(pureGoldG / targetPurityDec) : 0;
  const alloyRequiredG = round3(Math.max(0, totalMixed22KG - pureGoldG));
  const copperG = round3((alloyRequiredG * copperRatioPct) / 100);
  const silverG = round3(alloyRequiredG - copperG);

  // Maths for Mode 2: Enrichment
  // Current fine gold in scrap = scrapWeightG * (scrapPurityPct / 100)
  // Let X be pure 24K gold (99.90%) to add:
  // (ScrapFine + 0.999 * X) / (ScrapWeight + X) = targetPurityDec
  // ScrapFine + 0.999 * X = targetPurityDec * ScrapWeight + targetPurityDec * X
  // X * (0.999 - targetPurityDec) = targetPurityDec * ScrapWeight - ScrapFine
  const scrapFineG = round3((scrapWeightG * scrapPurityPct) / 100);
  const denominator = 0.999 - targetPurityDec;
  const numerator = targetPurityDec * scrapWeightG - scrapFineG;
  const pureGoldToEnrichG = denominator > 0 && numerator > 0 ? round3(numerator / denominator) : 0;
  const enrichedTotalGrossG = round3(scrapWeightG + pureGoldToEnrichG);

  const handleApply = () => {
    if (onApplyToIssue) {
      if (calculationMode === "dilute_24k") {
        onApplyToIssue(
          totalMixed22KG,
          targetPurityPct,
          `Converted from ${formatWeight(pureGoldG)}g of 24K bar + ${formatWeight(alloyRequiredG)}g copper/silver alloy`
        );
      } else {
        onApplyToIssue(
          enrichedTotalGrossG,
          targetPurityPct,
          `Enriched ${formatWeight(scrapWeightG)}g scrap (${scrapPurityPct}%) with ${formatWeight(pureGoldToEnrichG)}g of 24K pure bar`
        );
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg shadow-xl max-w-lg w-full overflow-hidden text-xs">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8F5EE] border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-ink-primary">
              Workshop Alloy &amp; Karat Mixing Calculator
            </h2>
            <p className="text-[11px] text-ink-secondary mt-0.5">
              Exact copper and silver addition formulas for Coimbatore goldsmith melting
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

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-border bg-surface-subtle font-semibold">
          <button
            type="button"
            onClick={() => setCalculationMode("dilute_24k")}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
              calculationMode === "dilute_24k"
                ? "border-accent text-accent-hover font-bold bg-surface"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            1. Dilute 24K Bar $\rightarrow$ 22K (916)
          </button>
          <button
            type="button"
            onClick={() => setCalculationMode("enrich_scrap")}
            className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
              calculationMode === "enrich_scrap"
                ? "border-accent text-accent-hover font-bold bg-surface"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            2. Enrich Lower Karat Scrap
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {calculationMode === "dilute_24k" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="pure-gold-weight" className="block font-semibold text-ink-primary">
                    24K Pure Bullion Bar (g)
                  </label>
                  <input
                    id="pure-gold-weight"
                    type="number"
                    step="0.001"
                    min="1"
                    value={pureGoldG || ""}
                    onChange={(e) => setPureGoldG(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded border border-border font-mono font-bold text-ink-primary tabular-numbers"
                  />
                  <span className="text-[10px] text-ink-muted">Standard 99.90% fine bar</span>
                </div>

                <div className="space-y-1">
                  <label htmlFor="target-purity-select" className="block font-semibold text-ink-primary">
                    Target Jewellery Standard
                  </label>
                  <select
                    id="target-purity-select"
                    value={targetPurityPct}
                    onChange={(e) => setTargetPurityPct(parseFloat(e.target.value))}
                    className="w-full p-2 rounded border border-border bg-surface font-medium text-ink-primary"
                  >
                    <option value={91.6}>22 Karat (91.60% BIS Hallmarked)</option>
                    <option value={75.0}>18 Karat (75.00% Diamond Studded)</option>
                    <option value={58.5}>14 Karat (58.50% Lightweight)</option>
                  </select>
                  <span className="text-[10px] text-ink-muted">Coimbatore standard</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-medium text-ink-secondary">Alloy Composition Mix:</span>
                  <span className="font-mono text-ink-primary">
                    {copperRatioPct}% Copper (செம்பு) / {100 - copperRatioPct}% Silver (வெள்ளி)
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="80"
                  value={copperRatioPct}
                  onChange={(e) => setCopperRatioPct(parseInt(e.target.value))}
                  className="w-full accent-[#8C6820]"
                />
              </div>

              {/* Result Box */}
              <div className="p-4 rounded-lg bg-[#FAF7F0] border border-[#DDD4C3] space-y-3">
                <span className="font-semibold text-xs text-ink-secondary uppercase tracking-wider block">
                  Crucible Melt Recipe Breakdown
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-2.5 rounded bg-surface border border-border">
                    <span className="text-ink-secondary block text-[10px]">Total Alloy to Add:</span>
                    <span className="font-mono text-base font-bold text-accent-hover tabular-numbers">
                      {formatWeight(alloyRequiredG)} g
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-surface border border-border">
                    <span className="text-ink-secondary block text-[10px]">Pure Copper (செம்பு):</span>
                    <span className="font-mono text-base font-bold text-ink-primary tabular-numbers">
                      {formatWeight(copperG)} g
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-surface border border-border">
                    <span className="text-ink-secondary block text-[10px]">Pure Silver (வெள்ளி):</span>
                    <span className="font-mono text-base font-bold text-ink-primary tabular-numbers">
                      {formatWeight(silverG)} g
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/80 flex items-center justify-between">
                  <span className="font-semibold text-ink-primary">
                    Total Resulting 22K Gold Output:
                  </span>
                  <span className="font-mono text-lg font-bold text-emerald-800 tabular-numbers">
                    {formatWeight(totalMixed22KG)} g gross
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="scrap-weight-input" className="block font-semibold text-ink-primary">
                    Existing Scrap Weight (g)
                  </label>
                  <input
                    id="scrap-weight-input"
                    type="number"
                    step="0.001"
                    min="1"
                    value={scrapWeightG || ""}
                    onChange={(e) => setScrapWeightG(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded border border-border font-mono font-bold text-ink-primary tabular-numbers"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="scrap-purity-input" className="block font-semibold text-ink-primary">
                    Tested Scrap Purity (%)
                  </label>
                  <input
                    id="scrap-purity-input"
                    type="number"
                    step="0.1"
                    min="40"
                    max="91.5"
                    value={scrapPurityPct || ""}
                    onChange={(e) => setScrapPurityPct(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded border border-border font-mono font-bold text-ink-primary tabular-numbers"
                  />
                  <span className="text-[10px] text-ink-muted">XRF Karat meter tested</span>
                </div>
              </div>

              {/* Enrichment Result Box */}
              <div className="p-4 rounded-lg bg-[#FAF7F0] border border-[#DDD4C3] space-y-3">
                <span className="font-semibold text-xs text-ink-secondary uppercase tracking-wider block">
                  Enrichment to 91.60% (22K Standard)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded bg-surface border border-border">
                    <span className="text-ink-secondary block text-[10px]">24K Pure Bar to Add:</span>
                    <span className="font-mono text-base font-bold text-accent-hover tabular-numbers">
                      {formatWeight(pureGoldToEnrichG)} g
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-surface border border-border">
                    <span className="text-ink-secondary block text-[10px]">Final 22K Batch Weight:</span>
                    <span className="font-mono text-base font-bold text-emerald-800 tabular-numbers">
                      {formatWeight(enrichedTotalGrossG)} g
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3 bg-[#FAF8F3] border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-border hover:bg-surface-subtle text-ink-primary font-medium"
          >
            Close
          </button>
          {onApplyToIssue && (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-1.5 rounded bg-accent text-white hover:bg-accent-hover font-semibold shadow-sm"
            >
              Apply Mixture to Issue Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

