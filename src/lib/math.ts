/**
 * SwarnaTrack Core Exact Math Engine
 * Precise 3-decimal fine gold calculations adhering to Indian Bureau of Indian Standards (BIS)
 * and Workshop Goldsmith Accounting standards.
 */

export function round3(val: number): number {
  return Math.round((val + Number.EPSILON) * 1000) / 1000;
}

export function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates fine gold weight in grams given gross weight and purity percentage.
 * Fine Wt = (Gross Wt * Purity / 100) rounded to 3 decimal places.
 */
export function calculateFineWeight(grossWeightG: number, purityPct: number): number {
  if (grossWeightG <= 0 || purityPct <= 0) return 0;
  return round3((grossWeightG * purityPct) / 100);
}

/**
 * Calculates allowed fine gold wastage for a given issued fine weight.
 */
export function calculateAllowedWastage(issuedFineG: number, allowedWastagePct: number): number {
  if (issuedFineG <= 0 || allowedWastagePct <= 0) return 0;
  return round3((issuedFineG * allowedWastagePct) / 100);
}

export interface JobSettlementMath {
  issuedFineG: number;
  returnedPiecesFineG: number;
  returnedScrapFineG: number;
  returnedFilingsFineG: number;
  totalReturnedFineG: number;
  allowedWastagePct: number;
  allowedWastageFineG: number;
  actualLossFineG: number;
  unexplainedLossFineG: number; // positive = excess loss (loss beyond agreed allowance); negative = gold recovery
  actualLossPct: number;
  financialImpactInr: number;
}

/**
 * Complete job settlement calculation comparing issued gold vs returned articles,
 * scrap, dust, and allowed category wastage.
 */
export function calculateJobSettlement(params: {
  issuedFineG: number;
  returnedPiecesFineG: number;
  returnedScrapFineG: number;
  returnedFilingsFineG: number;
  allowedWastagePct: number;
  goldRatePerGram?: number;
}): JobSettlementMath {
  const {
    issuedFineG,
    returnedPiecesFineG,
    returnedScrapFineG,
    returnedFilingsFineG,
    allowedWastagePct,
    goldRatePerGram = 12500,
  } = params;

  const totalReturnedFineG = round3(
    returnedPiecesFineG + returnedScrapFineG + returnedFilingsFineG
  );

  const allowedWastageFineG = calculateAllowedWastage(issuedFineG, allowedWastagePct);

  // Actual gold physically unreturned
  const actualLossFineG = round3(Math.max(0, issuedFineG - totalReturnedFineG));

  // Actual loss percentage of issued gold
  const actualLossPct = issuedFineG > 0 ? round2((actualLossFineG / issuedFineG) * 100) : 0;

  // Unexplained loss beyond agreed wastage allowance
  const unexplainedLossFineG = round3(actualLossFineG - allowedWastageFineG);

  // Financial impact in INR at current market gold rate
  const financialImpactInr = round2(unexplainedLossFineG * goldRatePerGram);

  return {
    issuedFineG,
    returnedPiecesFineG,
    returnedScrapFineG,
    returnedFilingsFineG,
    totalReturnedFineG,
    allowedWastagePct,
    allowedWastageFineG,
    actualLossFineG,
    unexplainedLossFineG,
    actualLossPct,
    financialImpactInr,
  };
}

/**
 * Old Gold valuation math:
 * Gross Wt -> Net Melt Wt (deducting stones and dirt allowance)
 * -> Tested Purity % -> Fine Weight -> Valuation at today's rate
 */
export interface OldGoldValuationMath {
  grossWeightG: number;
  stoneWeightG: number;
  dirtDeductionPct: number;
  dirtDeductionG: number;
  netMeltWeightG: number;
  testedPurityPct: number;
  fineWeightG: number;
  goldRatePerGram: number;
  grossValuationInr: number;
  meltingRefiningChargesInr: number;
  netPayableInr: number;
  panRequired: boolean;
  cashLimitExceeded: boolean;
}

export function calculateOldGoldValuation(params: {
  grossWeightG: number;
  stoneWeightG: number;
  dirtDeductionPct: number;
  testedPurityPct: number;
  goldRatePerGram: number;
  meltingChargePerGram?: number;
}): OldGoldValuationMath {
  const {
    grossWeightG,
    stoneWeightG,
    dirtDeductionPct,
    testedPurityPct,
    goldRatePerGram,
    meltingChargePerGram = 15,
  } = params;

  const weightAfterStone = Math.max(0, grossWeightG - stoneWeightG);
  const dirtDeductionG = round3((weightAfterStone * dirtDeductionPct) / 100);
  const netMeltWeightG = round3(Math.max(0, weightAfterStone - dirtDeductionG));

  const fineWeightG = calculateFineWeight(netMeltWeightG, testedPurityPct);

  const grossValuationInr = round2(fineWeightG * goldRatePerGram);
  const meltingRefiningChargesInr = round2(netMeltWeightG * meltingChargePerGram);
  const netPayableInr = round2(Math.max(0, grossValuationInr - meltingRefiningChargesInr));

  // Income Tax Act 1961: Rule 114B (PAN required for transactions >= Rs 2,00,000)
  // Section 269ST prohibits cash >= Rs 2,00,000
  const panRequired = netPayableInr >= 200000;
  const cashLimitExceeded = netPayableInr >= 200000;

  return {
    grossWeightG: round3(grossWeightG),
    stoneWeightG: round3(stoneWeightG),
    dirtDeductionPct: round2(dirtDeductionPct),
    dirtDeductionG,
    netMeltWeightG,
    testedPurityPct: round2(testedPurityPct),
    fineWeightG,
    goldRatePerGram: round2(goldRatePerGram),
    grossValuationInr,
    meltingRefiningChargesInr,
    netPayableInr,
    panRequired,
    cashLimitExceeded,
  };
}

/**
 * Format numbers cleanly with fixed decimals and tabular alignment.
 */
export function formatWeight(grams: number): string {
  return grams.toFixed(3);
}

export function formatPurity(pct: number): string {
  return pct.toFixed(2);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}
