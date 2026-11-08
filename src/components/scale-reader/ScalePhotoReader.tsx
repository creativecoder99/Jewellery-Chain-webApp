import React, { useState, useEffect } from "react";
import { ScaleOcrResult } from "@/lib/types";
import { analyzeScaleImage } from "@/lib/tesseract-ocr";

interface ScalePhotoReaderProps {
  mode?: "scale" | "karat_meter";
  currentTypedWeight?: number;
  currentTypedPurity?: number;
  onApplyReading: (weight: number, purity?: number, photoUrl?: string) => void;
  onVerifyMismatch?: (confirmed: boolean, reason?: string) => void;
}

export default function ScalePhotoReader({
  mode = "scale",
  currentTypedWeight,
  currentTypedPurity,
  onApplyReading,
  onVerifyMismatch,
}: ScalePhotoReaderProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string>("/sample-scales/scale-120.svg");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<ScaleOcrResult | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [overrideConfirmed, setOverrideConfirmed] = useState<boolean>(false);

  const samplePresets = [
    { label: "120.000g (Issue Scale)", path: "/sample-scales/scale-120.svg" },
    { label: "112.450g (Finished Necklace)", path: "/sample-scales/scale-112-45.svg" },
    { label: "3.300g (Scrap Trimmings)", path: "/sample-scales/scale-3-30.svg" },
    { label: "34.500g (Old Gold Intake)", path: "/sample-scales/scale-oldgold.svg" },
    { label: "91.60% XRF Karat Meter Slip", path: "/sample-scales/karatmeter-printout.svg" },
  ];

  const handleSelectPreset = async (path: string) => {
    setSelectedPhoto(path);
    runAnalysis(path);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setSelectedPhoto(url);
        runAnalysis(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (imgUrl: string) => {
    setIsProcessing(true);
    try {
      const res = await analyzeScaleImage(imgUrl);
      setOcrResult(res);
      // Auto apply if user hasn't typed anything yet
      if (!currentTypedWeight || currentTypedWeight === 0) {
        onApplyReading(res.detectedWeightG, res.purityPct, imgUrl);
      }
    } catch (err) {
      console.error("Scale analysis error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    runAnalysis(selectedPhoto);
  }, []);

  // Check if typed weight differs from scale reading
  const hasWeightDiscrepancy =
    ocrResult &&
    ocrResult.detectedWeightG > 0 &&
    currentTypedWeight !== undefined &&
    currentTypedWeight > 0 &&
    Math.abs(currentTypedWeight - ocrResult.detectedWeightG) > 0.005;

  const handleConfirmOverride = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setOverrideConfirmed(checked);
    if (onVerifyMismatch) {
      onVerifyMismatch(checked, overrideReason);
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOverrideReason(val);
    if (onVerifyMismatch) {
      onVerifyMismatch(overrideConfirmed, val);
    }
  };

  return (
    <div className="border border-border rounded-lg bg-surface p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-semibold text-ink-primary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            Scale &amp; Karat Meter Vision Assistant
          </h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Side-by-side photo verification. Automatically parses weights to 3 decimals.
          </p>
        </div>

        {/* Sample Scale Selector for rapid testing */}
        <div className="flex items-center gap-2">
          <label htmlFor="preset-select" className="text-xs font-medium text-ink-secondary whitespace-nowrap">
            Test Photos:
          </label>
          <select
            id="preset-select"
            value={selectedPhoto}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="text-xs py-1 px-2 border border-border rounded bg-surface-subtle text-ink-primary"
          >
            {samplePresets.map((preset) => (
              <option key={preset.path} value={preset.path}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Side-by-Side Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Left: Scale Photo */}
        <div className="space-y-2">
          <div className="relative aspect-[5/3] w-full rounded border border-border bg-[#1E221E] overflow-hidden flex items-center justify-center p-2">
            <img
              src={selectedPhoto}
              alt="Workshop scale display"
              className="max-h-full max-w-full object-contain"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-medium">
                Analyzing scale display...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="cursor-pointer text-accent hover:text-accent-hover font-medium underline">
              Upload custom photo
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomUpload}
                className="hidden"
              />
            </label>
            <span className="text-ink-muted">Sartorius Precision 0.001g Standard</span>
          </div>
        </div>

        {/* Right: AI Extraction & Verification Panel */}
        <div className="space-y-3">
          <div className="bg-surface-subtle border border-border rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-ink-secondary">
                Detected Scale Reading:
              </span>
              {ocrResult && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {ocrResult.confidencePct}% Confidence
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-mono text-2xl font-bold text-ink-primary tabular-numbers">
                {ocrResult ? ocrResult.detectedWeightG.toFixed(3) : "---.---"}
              </span>
              <span className="text-sm font-semibold text-ink-secondary">grams (g)</span>

              {ocrResult?.purityPct && (
                <span className="ml-auto font-mono text-sm font-medium text-ink-primary">
                  {ocrResult.purityPct.toFixed(2)}% Purity
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (ocrResult) {
                  onApplyReading(ocrResult.detectedWeightG, ocrResult.purityPct, selectedPhoto);
                }
              }}
              className="w-full mt-2 py-1.5 px-3 rounded text-xs font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm"
            >
              Apply Scale Reading to Form
            </button>
          </div>

          {/* Mismatch & Fraud Protection Guard */}
          {hasWeightDiscrepancy ? (
            <div className="p-3 rounded border border-status-loss-border bg-status-loss-bg space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-status-loss font-bold text-sm">⚠️</span>
                <div>
                  <h4 className="text-xs font-bold text-status-loss">
                    Weight Discrepancy Detected
                  </h4>
                  <p className="text-xs text-ink-primary mt-0.5">
                    Scale display reads{" "}
                    <strong className="font-mono">{ocrResult.detectedWeightG.toFixed(3)}g</strong>,
                    but entered value is{" "}
                    <strong className="font-mono">{currentTypedWeight?.toFixed(3)}g</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label
                  htmlFor="override-reason"
                  className="block text-[11px] font-medium text-ink-primary"
                >
                  Clerk Verification Reason (Required to proceed):
                </label>
                <input
                  id="override-reason"
                  type="text"
                  placeholder="e.g. Tare paper weight offset of 2.500g accounted"
                  value={overrideReason}
                  onChange={handleReasonChange}
                  className="w-full text-xs p-1.5 rounded border border-status-loss-border bg-white text-ink-primary focus:ring-1 focus:ring-status-loss"
                />

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={overrideConfirmed}
                    onChange={handleConfirmOverride}
                    className="rounded border-status-loss-border text-status-loss focus:ring-status-loss"
                  />
                  <span className="text-xs font-medium text-status-loss">
                    I confirm this weight discrepancy is intentional and verified.
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded border border-status-valid-border bg-status-valid-bg flex items-center gap-2">
              <span className="text-status-valid font-bold text-xs">✓</span>
              <span className="text-xs text-status-valid font-medium">
                Entered weight aligns with scale photograph proof.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

