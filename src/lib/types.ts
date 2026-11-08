export type UserRole = "issue_clerk" | "finance_head" | "partner" | "karigar";

export type ItemCategory =
  | "necklace"
  | "bangle"
  | "chain"
  | "ring"
  | "earring"
  | "custom_antique"
  | "casting";

export interface CategoryWastageConfig {
  category: ItemCategory;
  name: string;
  defaultAllowedWastagePct: number; // e.g. 3.00 % for necklace, 2.50 % for plain chain
}

export interface Karigar {
  id: string;
  name: string;
  phone: string;
  tamilName?: string;
  specialization: string;
  status: "active" | "inactive";
  joinedDate: string;
  categoryWastage: Record<ItemCategory, number>; // agreed wastage % per category
  currentFineBalanceG: number; // 3 decimals (grams)
  lifetimeIssuedG: number;
  lifetimeReturnedG: number;
  lifetimeUnexplainedLossG: number;
  historicalMeanLossPct: number; // baseline mean loss percentage
  historicalLossStdDev: number; // standard deviation of loss
}

export type TransactionType = "issue" | "receipt_piece" | "receipt_scrap" | "receipt_filings" | "wastage_settlement";

export interface Transaction {
  id: string; // e.g. TX-30411
  date: string; // ISO string
  karigarId: string;
  karigarName: string;
  type: TransactionType;
  itemCategory?: ItemCategory;
  jobNumber?: string;
  huid?: string; // 6-character Hallmark Unique ID for finished pieces
  grossWeightG: number; // 3 decimals
  purityPct: number; // 2 decimals (e.g. 91.60)
  fineWeightG: number; // 3 decimals = grossWeightG * (purityPct / 100)
  allowedWastagePct?: number; // agreed wastage % for this category/job
  allowedWastageFineG?: number; // allowed fine gold allowance
  actualWastageFineG?: number; // actual loss in fine gold
  varianceFineG?: number; // actual - allowed (+ve is excess loss, -ve is recovery/gain)
  fineBalanceAfterG: number; // running fine balance of karigar
  scalePhotoUrl?: string; // photo proof of scale reading
  scaleConfidencePct?: number; // AI OCR confidence
  clerkConfirmed: boolean;
  notes?: string;
  createdBy: string;
  syncStatus?: "synced" | "pending_sync";
}

export interface JobOrder {
  jobNumber: string; // e.g. JOB-8420
  karigarId: string;
  karigarName: string;
  itemCategory: ItemCategory;
  description: string;
  issueTxnId: string;
  issuedFineG: number;
  issuedGrossG: number;
  purityPct: number;
  allowedWastagePct: number;
  expectedReturnDate: string;
  status: "in_progress" | "settled" | "flagged";
  createdAt: string;
  closedAt?: string;
  receivedPieces: {
    txnId: string;
    huid?: string;
    grossWeightG: number;
    purityPct: number;
    fineWeightG: number;
  }[];
  receivedScrapFineG: number;
  receivedFilingsFineG: number;
  totalReturnedFineG: number;
  actualLossFineG: number;
  allowedLossFineG: number;
  unexplainedLossFineG: number;
  settlementNotes?: string;
}

export interface OldGoldEntry {
  id: string; // e.g. OG-7012
  date: string;
  showroomBillNo: string;
  customerName: string;
  customerPhone: string;
  grossWeightG: number;
  stoneWeightG: number;
  dirtDeductionPct: number; // e.g. 1.5%
  netMeltWeightG: number; // gross - stone - dirt
  testedPurityPct: number; // from karat meter reading (e.g. 88.50)
  fineWeightG: number; // netMeltWeight * testedPurityPct / 100
  goldRatePerGram: number; // current 24k/22k buying rate
  grossValuationInr: number;
  deductionsInr: number;
  netPayableInr: number;
  paymentMode: "exchange_bill_adjustment" | "bank_transfer" | "cheque" | "cash";
  customerPan?: string; // mandatory if netPayableInr >= 200,000
  panVerified?: boolean;
  scalePhotoUrl?: string;
  karatMeterSlipPhotoUrl?: string;
  cashLimitExceededWarning?: boolean;
  status: "verified" | "sent_to_refiner" | "melted_in_house";
  destination: "vault" | "refiner";
  recordedBy: string;
}

export interface StockSummary {
  date: string;
  goldRatePerGram24K: number;
  vaultBullionFineG: number; // Pure 24K bars and alloyed stock
  vaultManufacturedFineG: number; // Finished showroom ready stock in workshop vault
  withKarigarsFineG: number; // Sum of all active karigar running balances
  atRefinerFineG: number; // Scrap and filings currently in refining pipeline
  totalWorkshopFineG: number; // Grand total fine gold under workshop custody
  unexplainedLossMonthToDateG: number; // Month-to-date unexplained loss
  lossPercentageMonthToDate: number; // e.g. 0.28%
  reconciliationStatus: "balanced" | "discrepancy_detected";
  discrepancyFineG?: number;
}

export interface LossAlertItem {
  id: string;
  karigarId: string;
  karigarName: string;
  category: ItemCategory;
  detectedAt: string;
  triggerJobNumber: string;
  actualLossPct: number;
  agreedLossPct: number;
  historicalMeanLossPct: number;
  excessLossFineG: number;
  financialImpactInr: number;
  severity: "info" | "review_recommended" | "attention_required";
  status: "open" | "reviewed" | "dismissed";
  suggestedReviewCause: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface ScaleOcrResult {
  detectedWeightG: number;
  confidencePct: number;
  purityPct?: number;
  rawText: string;
  imageUrl: string;
  timestamp: string;
  suggestedAction: "match" | "review_clerk" | "rejected";
}

