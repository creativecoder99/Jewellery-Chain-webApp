import { JobOrder, Karigar, LossAlertItem } from "./types";
import { round2, round3 } from "./math";

export interface AnomalyEvaluationResult {
  isAnomaly: boolean;
  driftStdDev: number; // number of std deviations from baseline
  actualLossPct: number;
  historicalMeanPct: number;
  suggestedCause: string;
  severity: "info" | "review_recommended" | "attention_required";
}

/**
 * Evaluates whether a karigar's job settlement represents an anomalous loss drift
 * compared to their personal historical track record.
 * Designed to be constructive and purely a "review item" for the Finance Head / Partner.
 */
export function evaluateLossDrift(
  karigar: Karigar,
  job: {
    jobNumber: string;
    itemCategory: string;
    issuedFineG: number;
    actualLossFineG: number;
    allowedLossFineG: number;
    unexplainedLossFineG: number;
  }
): AnomalyEvaluationResult {
  const actualLossPct =
    job.issuedFineG > 0 ? round2((job.actualLossFineG / job.issuedFineG) * 100) : 0;

  const baselineMean = karigar.historicalMeanLossPct || 2.4;
  const baselineStdDev = karigar.historicalLossStdDev || 0.25;

  // Number of standard deviations away from karigar's personal historical mean
  const driftStdDev =
    baselineStdDev > 0 ? round2((actualLossPct - baselineMean) / baselineStdDev) : 0;

  // Potential root cause diagnostic suggestions tailored to jewellery craftsmanship
  const causesByCategory: Record<string, string[]> = {
    necklace: [
      "Review filing tray collection around stone-prong grinding stations.",
      "Inspect ultrasonic wash bath sediment for microscopic gold dust accumulation.",
      "Check soldering flame blow-back and torch nozzle residue.",
    ],
    bangle: [
      "Verify die-punching border scrap collection in the pressing unit.",
      "Check polishing wheel buffing exhaust filter collection.",
      "Examine crucible slag after melting trimming segments.",
    ],
    chain: [
      "Examine wire-drawing lubricant bath and annealing oxide pickling acid.",
      "Inspect link-cutting bench brushings and magnet separation.",
      "Check diamond-cut faceting coolant tray residue.",
    ],
    ring: [
      "Review sizing cut-off scrap and laser-welding spatter recovery.",
      "Check inner-band engraving burr collection.",
    ],
    custom_antique: [
      "Review granulation and filigree wire annealing oxidation losses.",
      "Check nakshi chasing tar block / lac pitch burnout recovery.",
    ],
  };

  const candidateCauses = causesByCategory[job.itemCategory] || [
    "Check bench sweeps and polishing dust exhaust bags.",
    "Verify casting button sprue weight before remelting.",
  ];

  const suggestedCause =
    candidateCauses[Math.floor(Math.random() * candidateCauses.length)];

  // Thresholds:
  // > 2.5 std deviations: attention_required
  // > 1.8 std deviations: review_recommended
  // > 1.0 std dev and unexplainedLoss > 0.3g: info
  if (driftStdDev >= 2.2 && job.unexplainedLossFineG > 0.2) {
    return {
      isAnomaly: true,
      driftStdDev,
      actualLossPct,
      historicalMeanPct: baselineMean,
      suggestedCause,
      severity: "attention_required",
    };
  } else if (driftStdDev >= 1.6 && job.unexplainedLossFineG > 0.1) {
    return {
      isAnomaly: true,
      driftStdDev,
      actualLossPct,
      historicalMeanPct: baselineMean,
      suggestedCause,
      severity: "review_recommended",
    };
  }

  return {
    isAnomaly: false,
    driftStdDev,
    actualLossPct,
    historicalMeanPct: baselineMean,
    suggestedCause,
    severity: "info",
  };
}

/**
 * Scan all active karigars and their recent settlement history to generate current review items.
 */
export function generateActiveLossAlerts(
  karigars: Karigar[],
  recentSettledJobs: JobOrder[]
): LossAlertItem[] {
  const alerts: LossAlertItem[] = [];

  for (const job of recentSettledJobs) {
    if (job.status !== "settled") continue;
    const karigar = karigars.find((k) => k.id === job.karigarId);
    if (!karigar) continue;

    const evaluation = evaluateLossDrift(karigar, {
      jobNumber: job.jobNumber,
      itemCategory: job.itemCategory,
      issuedFineG: job.issuedFineG,
      actualLossFineG: job.actualLossFineG,
      allowedLossFineG: job.allowedLossFineG,
      unexplainedLossFineG: job.unexplainedLossFineG,
    });

    if (evaluation.isAnomaly) {
      alerts.push({
        id: `ALT-${job.jobNumber}-${alerts.length + 1}`,
        karigarId: karigar.id,
        karigarName: karigar.name,
        category: job.itemCategory,
        detectedAt: job.closedAt || new Date().toISOString(),
        triggerJobNumber: job.jobNumber,
        actualLossPct: evaluation.actualLossPct,
        agreedLossPct: job.allowedWastagePct,
        historicalMeanLossPct: evaluation.historicalMeanPct,
        excessLossFineG: round3(job.unexplainedLossFineG),
        financialImpactInr: round2(job.unexplainedLossFineG * 12500),
        severity: evaluation.severity,
        status: "open",
        suggestedReviewCause: evaluation.suggestedCause,
      });
    }
  }

  return alerts;
}
