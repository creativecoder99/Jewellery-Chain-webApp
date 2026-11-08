import fs from "fs";
import path from "path";
import {
  Karigar,
  Transaction,
  JobOrder,
  OldGoldEntry,
  StockSummary,
  LossAlertItem,
} from "./types";
import { round3 } from "./math";

interface DatabaseSchema {
  karigars: Karigar[];
  transactions: Transaction[];
  jobs: JobOrder[];
  oldGoldEntries: OldGoldEntry[];
  stock: StockSummary;
  alerts: LossAlertItem[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "workshop_db.json");

// Initial Seed Data matching prompt requirements and Coimbatore workshop context
function getInitialSeedData(): DatabaseSchema {
  const karigars: Karigar[] = [
    {
      id: "KAR-01",
      name: "Murugesan S",
      tamilName: "முருகேசன் எஸ்",
      phone: "9842156712",
      specialization: "Antique Temple Necklaces & Bridal Chokers",
      status: "active",
      joinedDate: "2018-04-10",
      categoryWastage: {
        necklace: 3.0,
        bangle: 2.2,
        chain: 2.5,
        ring: 1.8,
        earring: 2.0,
        custom_antique: 4.5,
        casting: 1.5,
      },
      currentFineBalanceG: 3.893, // Matches state after TX-30438
      lifetimeIssuedG: 14850.25,
      lifetimeReturnedG: 14495.8,
      lifetimeUnexplainedLossG: 12.35,
      historicalMeanLossPct: 2.85,
      historicalLossStdDev: 0.18,
    },
    {
      id: "KAR-02",
      name: "Palanisamy K",
      tamilName: "பழனிசாமி கே",
      phone: "9443218765",
      specialization: "Machine Chains & Hollow Rope Chains",
      status: "active",
      joinedDate: "2019-08-15",
      categoryWastage: {
        necklace: 2.8,
        bangle: 2.0,
        chain: 2.2,
        ring: 1.6,
        earring: 1.8,
        custom_antique: 4.0,
        casting: 1.4,
      },
      currentFineBalanceG: 48.25,
      lifetimeIssuedG: 18200.0,
      lifetimeReturnedG: 17790.5,
      lifetimeUnexplainedLossG: 34.2, // Drifting - triggers review item
      historicalMeanLossPct: 2.15,
      historicalLossStdDev: 0.12,
    },
    {
      id: "KAR-03",
      name: "Senthil Nathan",
      tamilName: "செந்தில் நாதன்",
      phone: "9789012345",
      specialization: "Solid Bangles & Casting Bracelets",
      status: "active",
      joinedDate: "2020-01-20",
      categoryWastage: {
        necklace: 2.8,
        bangle: 2.0,
        chain: 2.2,
        ring: 1.5,
        earring: 1.8,
        custom_antique: 4.2,
        casting: 1.2,
      },
      currentFineBalanceG: 12.44,
      lifetimeIssuedG: 9650.0,
      lifetimeReturnedG: 9450.2,
      lifetimeUnexplainedLossG: 6.8,
      historicalMeanLossPct: 1.95,
      historicalLossStdDev: 0.15,
    },
    {
      id: "KAR-04",
      name: "Vigneshwaran R",
      tamilName: "விக்னேஸ்வரன் ஆர்",
      phone: "9894567890",
      specialization: "Solitaire Rings & Micro-pave Earrings",
      status: "active",
      joinedDate: "2021-06-01",
      categoryWastage: {
        necklace: 3.2,
        bangle: 2.5,
        chain: 2.5,
        ring: 1.8,
        earring: 2.2,
        custom_antique: 4.8,
        casting: 1.6,
      },
      currentFineBalanceG: 8.62,
      lifetimeIssuedG: 6420.0,
      lifetimeReturnedG: 6285.4,
      lifetimeUnexplainedLossG: 4.1,
      historicalMeanLossPct: 1.78,
      historicalLossStdDev: 0.14,
    },
    {
      id: "KAR-05",
      name: "Rajendran M",
      tamilName: "ராஜேந்திரன் எம்",
      phone: "9486123456",
      specialization: "Traditional Nagas Work & Chettinad Sets",
      status: "active",
      joinedDate: "2017-02-14",
      categoryWastage: {
        necklace: 3.5,
        bangle: 2.8,
        chain: 2.8,
        ring: 2.0,
        earring: 2.4,
        custom_antique: 5.0,
        casting: 1.8,
      },
      currentFineBalanceG: 22.15,
      lifetimeIssuedG: 22100.0,
      lifetimeReturnedG: 21530.0,
      lifetimeUnexplainedLossG: 14.8,
      historicalMeanLossPct: 2.42,
      historicalLossStdDev: 0.2,
    },
    {
      id: "KAR-06",
      name: "Selvaraj A",
      tamilName: "செல்வராஜ் ஏ",
      phone: "9944556677",
      specialization: "Die Casting & Precision Sizing",
      status: "active",
      joinedDate: "2022-09-10",
      categoryWastage: {
        necklace: 2.5,
        bangle: 1.8,
        chain: 2.0,
        ring: 1.4,
        earring: 1.6,
        custom_antique: 3.8,
        casting: 1.2,
      },
      currentFineBalanceG: 5.11,
      lifetimeIssuedG: 4100.0,
      lifetimeReturnedG: 4022.0,
      lifetimeUnexplainedLossG: 2.4,
      historicalMeanLossPct: 1.25,
      historicalLossStdDev: 0.1,
    },
  ];

  // Transactions including exact prompt rows
  const transactions: Transaction[] = [
    {
      id: "TX-30411",
      date: "2026-11-06T09:30:00.000Z",
      karigarId: "KAR-01",
      karigarName: "Murugesan S",
      type: "issue",
      itemCategory: "necklace",
      jobNumber: "JOB-3041",
      grossWeightG: 120.0,
      purityPct: 91.6,
      fineWeightG: 109.92,
      allowedWastagePct: 3.0,
      allowedWastageFineG: 3.298,
      fineBalanceAfterG: 109.92,
      scalePhotoUrl: "/sample-scales/scale-120.png",
      scaleConfidencePct: 99.4,
      clerkConfirmed: true,
      notes: "Issued 22K pure cut bar for antique bridal necklace design",
      createdBy: "clerk_anand",
      syncStatus: "synced",
    },
    {
      id: "TX-30437",
      date: "2026-11-07T16:15:00.000Z",
      karigarId: "KAR-01",
      karigarName: "Murugesan S",
      type: "receipt_piece",
      itemCategory: "necklace",
      jobNumber: "JOB-3041",
      huid: "CB9421",
      grossWeightG: 112.45,
      purityPct: 91.6,
      fineWeightG: 103.004,
      allowedWastagePct: 3.0,
      fineBalanceAfterG: 6.916,
      scalePhotoUrl: "/sample-scales/scale-112-45.png",
      scaleConfidencePct: 99.1,
      clerkConfirmed: true,
      notes: "Finished bridal necklace delivered with BIS HUID CB9421",
      createdBy: "clerk_anand",
      syncStatus: "synced",
    },
    {
      id: "TX-30438",
      date: "2026-11-07T17:00:00.000Z",
      karigarId: "KAR-01",
      karigarName: "Murugesan S",
      type: "receipt_scrap",
      itemCategory: "necklace",
      jobNumber: "JOB-3041",
      grossWeightG: 3.3,
      purityPct: 91.6,
      fineWeightG: 3.023,
      allowedWastagePct: 3.0,
      fineBalanceAfterG: 3.893,
      scalePhotoUrl: "/sample-scales/scale-3-30.png",
      scaleConfidencePct: 98.7,
      clerkConfirmed: true,
      notes: "Clean trimmed sprues and edge cuttings returned",
      createdBy: "clerk_anand",
      syncStatus: "synced",
    },
    {
      id: "TX-30402",
      date: "2026-11-05T11:00:00.000Z",
      karigarId: "KAR-02",
      karigarName: "Palanisamy K",
      type: "issue",
      itemCategory: "chain",
      jobNumber: "JOB-3038",
      grossWeightG: 85.0,
      purityPct: 91.6,
      fineWeightG: 77.86,
      allowedWastagePct: 2.2,
      fineBalanceAfterG: 77.86,
      scalePhotoUrl: "/sample-scales/scale-85.png",
      scaleConfidencePct: 99.5,
      clerkConfirmed: true,
      notes: "Issued for 4 hollow rope chains 22 inch",
      createdBy: "clerk_anand",
      syncStatus: "synced",
    },
    {
      id: "TX-30425",
      date: "2026-11-06T15:20:00.000Z",
      karigarId: "KAR-02",
      karigarName: "Palanisamy K",
      type: "receipt_piece",
      itemCategory: "chain",
      jobNumber: "JOB-3038",
      huid: "PL4419",
      grossWeightG: 32.32,
      purityPct: 91.6,
      fineWeightG: 29.605,
      allowedWastagePct: 2.2,
      fineBalanceAfterG: 48.255,
      clerkConfirmed: true,
      notes: "First 2 chains completed",
      createdBy: "clerk_anand",
      syncStatus: "synced",
    },
  ];

  const jobs: JobOrder[] = [
    {
      jobNumber: "JOB-3041",
      karigarId: "KAR-01",
      karigarName: "Murugesan S",
      itemCategory: "necklace",
      description: "Antique Bridal Choker with Peacock Motif",
      issueTxnId: "TX-30411",
      issuedFineG: 109.92,
      issuedGrossG: 120.0,
      purityPct: 91.6,
      allowedWastagePct: 3.0,
      expectedReturnDate: "2026-11-08",
      status: "in_progress",
      createdAt: "2026-11-06T09:30:00.000Z",
      receivedPieces: [
        {
          txnId: "TX-30437",
          huid: "CB9421",
          grossWeightG: 112.45,
          purityPct: 91.6,
          fineWeightG: 103.004,
        },
      ],
      receivedScrapFineG: 3.023,
      receivedFilingsFineG: 0.0,
      totalReturnedFineG: 106.027,
      actualLossFineG: 3.893,
      allowedLossFineG: 3.298,
      unexplainedLossFineG: 0.595,
    },
    {
      jobNumber: "JOB-3038",
      karigarId: "KAR-02",
      karigarName: "Palanisamy K",
      itemCategory: "chain",
      description: "Hollow Rope Chains 22kt",
      issueTxnId: "TX-30402",
      issuedFineG: 77.86,
      issuedGrossG: 85.0,
      purityPct: 91.6,
      allowedWastagePct: 2.2,
      expectedReturnDate: "2026-11-09",
      status: "in_progress",
      createdAt: "2026-11-05T11:00:00.000Z",
      receivedPieces: [
        {
          txnId: "TX-30425",
          huid: "PL4419",
          grossWeightG: 32.32,
          purityPct: 91.6,
          fineWeightG: 29.605,
        },
      ],
      receivedScrapFineG: 0.0,
      receivedFilingsFineG: 0.0,
      totalReturnedFineG: 29.605,
      actualLossFineG: 48.255,
      allowedLossFineG: 1.713,
      unexplainedLossFineG: 0.0,
    },
    {
      jobNumber: "JOB-3022",
      karigarId: "KAR-02",
      karigarName: "Palanisamy K",
      itemCategory: "chain",
      description: "Anchor link box chains",
      issueTxnId: "TX-30310",
      issuedFineG: 100.0,
      issuedGrossG: 109.17,
      purityPct: 91.6,
      allowedWastagePct: 2.2,
      expectedReturnDate: "2026-11-02",
      status: "settled",
      createdAt: "2026-10-28T10:00:00.000Z",
      closedAt: "2026-11-03T16:30:00.000Z",
      receivedPieces: [
        {
          txnId: "TX-30340",
          huid: "PL3810",
          grossWeightG: 103.2,
          purityPct: 91.6,
          fineWeightG: 94.531,
        },
      ],
      receivedScrapFineG: 2.45,
      receivedFilingsFineG: 0.35,
      totalReturnedFineG: 97.331,
      actualLossFineG: 2.669,
      allowedLossFineG: 2.2,
      unexplainedLossFineG: 0.469, // Significant loss drift triggers alert
      settlementNotes: "Wire drawing breakage required extra annealing",
    },
  ];

  const oldGoldEntries: OldGoldEntry[] = [
    {
      id: "OG-7012",
      date: "2026-11-07T14:10:00.000Z",
      showroomBillNo: "SH-COIM-9842",
      customerName: "Kavitha Rangarajan",
      customerPhone: "9843210987",
      grossWeightG: 34.5,
      stoneWeightG: 1.2,
      dirtDeductionPct: 1.5,
      netMeltWeightG: 32.8,
      testedPurityPct: 91.6,
      fineWeightG: 30.045,
      goldRatePerGram: 12500,
      grossValuationInr: 375562.5,
      deductionsInr: 492.0,
      netPayableInr: 375070.5,
      paymentMode: "exchange_bill_adjustment",
      customerPan: "ABCDE1234F",
      panVerified: true,
      scalePhotoUrl: "/sample-scales/scale-oldgold.png",
      karatMeterSlipPhotoUrl: "/sample-scales/karatmeter-printout.png",
      cashLimitExceededWarning: false,
      status: "verified",
      destination: "vault",
      recordedBy: "clerk_anand",
    },
    {
      id: "OG-7011",
      date: "2026-11-06T11:45:00.000Z",
      showroomBillNo: "SH-COIM-9810",
      customerName: "Balasubramaniam V",
      customerPhone: "9442112233",
      grossWeightG: 14.8,
      stoneWeightG: 0.4,
      dirtDeductionPct: 1.0,
      netMeltWeightG: 14.256,
      testedPurityPct: 88.5,
      fineWeightG: 12.617,
      goldRatePerGram: 12500,
      grossValuationInr: 157712.5,
      deductionsInr: 213.84,
      netPayableInr: 157498.66,
      paymentMode: "exchange_bill_adjustment",
      status: "sent_to_refiner",
      destination: "refiner",
      recordedBy: "clerk_anand",
    },
  ];

  const stock: StockSummary = {
    date: "2026-11-08",
    goldRatePerGram24K: 12500.0,
    vaultBullionFineG: 14250.65, // ~14.25 kg in vault
    vaultManufacturedFineG: 8420.12, // ~8.42 kg finished pieces awaiting dispatch
    withKarigarsFineG: 100.457, // Sum of active balances
    atRefinerFineG: 1845.3, // ~1.84 kg at refinery
    totalWorkshopFineG: 24616.527, // ~24.6 kg
    unexplainedLossMonthToDateG: 18.25, // 0.12% loss rate (within target < 0.15%!)
    lossPercentageMonthToDate: 0.12,
    reconciliationStatus: "balanced",
  };

  const alerts: LossAlertItem[] = [
    {
      id: "ALT-JOB-3022-1",
      karigarId: "KAR-02",
      karigarName: "Palanisamy K",
      category: "chain",
      detectedAt: "2026-11-03T16:30:00.000Z",
      triggerJobNumber: "JOB-3022",
      actualLossPct: 2.67,
      agreedLossPct: 2.2,
      historicalMeanLossPct: 2.15,
      excessLossFineG: 0.469,
      financialImpactInr: 5862.5,
      severity: "review_recommended",
      status: "open",
      suggestedReviewCause:
        "Examine wire-drawing lubricant bath and annealing oxide pickling acid. Palanisamy's loss jumped from 2.15% baseline to 2.67%.",
    },
  ];

  return {
    karigars,
    transactions,
    jobs,
    oldGoldEntries,
    stock,
    alerts,
  };
}

class WorkshopDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Could not read database file, initializing seed data:", err);
    }

    const seed = getInitialSeedData();
    this.saveData(seed);
    return seed;
  }

  private saveData(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist database file:", err);
    }
  }

  // Karigar operations
  getKarigars(): Karigar[] {
    return this.data.karigars;
  }

  getKarigarById(id: string): Karigar | undefined {
    return this.data.karigars.find((k) => k.id === id);
  }

  updateKarigar(karigar: Karigar): void {
    const idx = this.data.karigars.findIndex((k) => k.id === karigar.id);
    if (idx !== -1) {
      this.data.karigars[idx] = karigar;
      this.saveData(this.data);
    }
  }

  addKarigar(karigar: Karigar): void {
    this.data.karigars.push(karigar);
    this.saveData(this.data);
  }

  // Transactions
  getTransactions(): Transaction[] {
    return this.data.transactions;
  }

  addTransaction(txn: Transaction): void {
    this.data.transactions.unshift(txn);

    // Update karigar running balance
    const karigar = this.getKarigarById(txn.karigarId);
    if (karigar) {
      if (txn.type === "issue") {
        karigar.currentFineBalanceG = round3(karigar.currentFineBalanceG + txn.fineWeightG);
        karigar.lifetimeIssuedG = round3(karigar.lifetimeIssuedG + txn.fineWeightG);
        // deduct from vault bullion
        this.data.stock.vaultBullionFineG = round3(
          Math.max(0, this.data.stock.vaultBullionFineG - txn.fineWeightG)
        );
      } else {
        // receipt of piece, scrap or filings
        karigar.currentFineBalanceG = round3(
          Math.max(0, karigar.currentFineBalanceG - txn.fineWeightG)
        );
        karigar.lifetimeReturnedG = round3(karigar.lifetimeReturnedG + txn.fineWeightG);

        if (txn.type === "receipt_piece") {
          this.data.stock.vaultManufacturedFineG = round3(
            this.data.stock.vaultManufacturedFineG + txn.fineWeightG
          );
        } else {
          // scrap or filings sent to refining staging
          this.data.stock.atRefinerFineG = round3(
            this.data.stock.atRefinerFineG + txn.fineWeightG
          );
        }
      }
      txn.fineBalanceAfterG = karigar.currentFineBalanceG;
      this.updateKarigar(karigar);
    }

    this.recalculateStock();
    this.saveData(this.data);
  }

  // Job orders
  getJobs(): JobOrder[] {
    return this.data.jobs;
  }

  getJobByNumber(jobNumber: string): JobOrder | undefined {
    return this.data.jobs.find((j) => j.jobNumber === jobNumber);
  }

  addJob(job: JobOrder): void {
    this.data.jobs.unshift(job);
    this.saveData(this.data);
  }

  updateJob(job: JobOrder): void {
    const idx = this.data.jobs.findIndex((j) => j.jobNumber === job.jobNumber);
    if (idx !== -1) {
      this.data.jobs[idx] = job;
      this.saveData(this.data);
    }
  }

  // Old gold desk
  getOldGoldEntries(): OldGoldEntry[] {
    return this.data.oldGoldEntries;
  }

  addOldGoldEntry(entry: OldGoldEntry): void {
    this.data.oldGoldEntries.unshift(entry);
    if (entry.destination === "vault") {
      this.data.stock.vaultBullionFineG = round3(
        this.data.stock.vaultBullionFineG + entry.fineWeightG
      );
    } else {
      this.data.stock.atRefinerFineG = round3(
        this.data.stock.atRefinerFineG + entry.fineWeightG
      );
    }
    this.recalculateStock();
    this.saveData(this.data);
  }

  // Stock & Vault
  getStock(): StockSummary {
    this.recalculateStock();
    return this.data.stock;
  }

  private recalculateStock(): void {
    const withKarigars = round3(
      this.data.karigars.reduce((acc, k) => acc + k.currentFineBalanceG, 0)
    );
    this.data.stock.withKarigarsFineG = withKarigars;
    this.data.stock.totalWorkshopFineG = round3(
      this.data.stock.vaultBullionFineG +
        this.data.stock.vaultManufacturedFineG +
        this.data.stock.withKarigarsFineG +
        this.data.stock.atRefinerFineG
    );
  }

  // Loss drift alerts
  getAlerts(): LossAlertItem[] {
    return this.data.alerts;
  }

  addAlert(alert: LossAlertItem): void {
    this.data.alerts.unshift(alert);
    this.saveData(this.data);
  }

  updateAlertStatus(id: string, status: "reviewed" | "dismissed", notes?: string, by?: string): void {
    const item = this.data.alerts.find((a) => a.id === id);
    if (item) {
      item.status = status;
      if (notes) item.reviewNotes = notes;
      if (by) item.reviewedBy = by;
      this.saveData(this.data);
    }
  }

  resetSeedData(): void {
    this.data = getInitialSeedData();
    this.saveData(this.data);
  }
}

// Global singleton instance
const globalDb = new WorkshopDatabase();
export default globalDb;

