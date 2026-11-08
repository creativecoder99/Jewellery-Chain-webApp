import { describe, it, expect } from "vitest";
import { evaluateLossDrift } from "../lib/ai-anomaly";
import { Karigar } from "../lib/types";

describe("AI Anomaly Loss Drift Evaluator", () => {
  const mockKarigar: Karigar = {
    id: "KAR-01",
    name: "Murugesan S",
    phone: "9842156712",
    specialization: "Necklaces",
    status: "active",
    joinedDate: "2020-01-01",
    categoryWastage: {
      necklace: 3.0,
      bangle: 2.0,
      chain: 2.0,
      ring: 1.5,
      earring: 1.8,
      custom_antique: 4.0,
      casting: 1.5,
    },
    currentFineBalanceG: 50.0,
    lifetimeIssuedG: 5000.0,
    lifetimeReturnedG: 4850.0,
    lifetimeUnexplainedLossG: 5.0,
    historicalMeanLossPct: 2.5,
    historicalLossStdDev: 0.15,
  };

  it("detects no anomaly when karigar settles within expected baseline", () => {
    const result = evaluateLossDrift(mockKarigar, {
      jobNumber: "JOB-TEST-1",
      itemCategory: "necklace",
      issuedFineG: 100.0,
      actualLossFineG: 2.55,
      allowedLossFineG: 3.0,
      unexplainedLossFineG: -0.45,
    });

    expect(result.isAnomaly).toBe(false);
    expect(result.severity).toBe("info");
  });

  it("flags review item when loss drifts significantly above baseline", () => {
    // 3.6% loss when baseline is 2.5% with std dev 0.15 is > 7 std devs
    const result = evaluateLossDrift(mockKarigar, {
      jobNumber: "JOB-DRIFT-1",
      itemCategory: "necklace",
      issuedFineG: 100.0,
      actualLossFineG: 3.6,
      allowedLossFineG: 3.0,
      unexplainedLossFineG: 0.6,
    });

    expect(result.isAnomaly).toBe(true);
    expect(result.severity).toBe("attention_required");
    expect(result.driftStdDev).toBeGreaterThan(2.0);
    expect(result.suggestedCause).toBeTruthy();
  });
});

