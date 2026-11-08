import { describe, it, expect } from "vitest";
import {
  calculateFineWeight,
  calculateAllowedWastage,
  calculateJobSettlement,
  calculateOldGoldValuation,
  round3,
} from "../lib/math";

describe("Exact 3-Decimal Fine Gold Math Engine", () => {
  it("matches prompt sample data row TX-30411 (Issue)", () => {
    const grossWt = 120.0;
    const purity = 91.6;
    const fineWt = calculateFineWeight(grossWt, purity);
    expect(fineWt).toBe(109.92);
    expect(fineWt.toFixed(3)).toBe("109.920");

    const allowedWastagePct = 3.0;
    const allowedWastageFine = calculateAllowedWastage(fineWt, allowedWastagePct);
    expect(allowedWastageFine.toFixed(3)).toBe("3.298");
  });

  it("matches prompt sample data row TX-30437 (Receipt, necklace)", () => {
    const grossWt = 112.45;
    const purity = 91.6;
    const fineWt = calculateFineWeight(grossWt, purity);
    // 112.450 * 0.916 = 103.0042 -> 103.004
    expect(fineWt).toBe(103.004);
    expect(fineWt.toFixed(3)).toBe("103.004");

    // Running balance subtraction from previous 109.920
    const prevBalance = 109.92;
    const newBalance = round3(prevBalance - fineWt);
    expect(newBalance).toBe(6.916);
    expect(newBalance.toFixed(3)).toBe("6.916");
  });

  it("matches prompt sample data row TX-30438 (Receipt, scrap)", () => {
    const grossWt = 3.3;
    const purity = 91.6;
    const fineWt = calculateFineWeight(grossWt, purity);
    // 3.300 * 0.916 = 3.0228 -> 3.023
    expect(fineWt).toBe(3.023);
    expect(fineWt.toFixed(3)).toBe("3.023");

    // Running balance subtraction from previous 6.916
    const prevBalance = 6.916;
    const newBalance = round3(prevBalance - fineWt);
    expect(newBalance).toBe(3.893);
    expect(newBalance.toFixed(3)).toBe("3.893");
  });

  it("calculates job settlement and allowed vs actual wastage correctly", () => {
    const settlement = calculateJobSettlement({
      issuedFineG: 109.92,
      returnedPiecesFineG: 103.004,
      returnedScrapFineG: 3.023,
      returnedFilingsFineG: 0.65,
      allowedWastagePct: 3.0,
      goldRatePerGram: 12500,
    });

    // Total returned: 103.004 + 3.023 + 0.650 = 106.677 g
    expect(settlement.totalReturnedFineG).toBe(106.677);

    // Actual loss: 109.920 - 106.677 = 3.243 g
    expect(settlement.actualLossFineG).toBe(3.243);

    // Allowed wastage: 109.920 * 3% = 3.298 g
    expect(settlement.allowedWastageFineG).toBe(3.298);

    // Unexplained loss = 3.243 - 3.298 = -0.055 g (slight gain / within limit!)
    expect(settlement.unexplainedLossFineG).toBe(-0.055);
  });

  it("enforces Income Tax Act PAN and Cash limits on old gold purchases", () => {
    // Under 2 lakhs: PAN optional
    const smallPurchase = calculateOldGoldValuation({
      grossWeightG: 12.0,
      stoneWeightG: 0.5,
      dirtDeductionPct: 1.0,
      testedPurityPct: 88.0,
      goldRatePerGram: 12500,
    });
    expect(smallPurchase.panRequired).toBe(false);

    // High value purchase >= 2 lakhs: PAN mandatory
    const highValuePurchase = calculateOldGoldValuation({
      grossWeightG: 30.0,
      stoneWeightG: 0.0,
      dirtDeductionPct: 1.0,
      testedPurityPct: 91.6,
      goldRatePerGram: 12500,
    });
    // net melt ~ 29.7g * 0.916 = 27.205g * 12500 = ~3,40,000 INR
    expect(highValuePurchase.netPayableInr).toBeGreaterThan(200000);
    expect(highValuePurchase.panRequired).toBe(true);
    expect(highValuePurchase.cashLimitExceeded).toBe(true);
  });
});

