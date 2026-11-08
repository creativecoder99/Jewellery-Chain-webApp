import { z } from "zod";

// PAN regex: 5 uppercase letters, 4 digits, 1 uppercase letter
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// HUID regex: 6 alphanumeric uppercase characters
export const HUID_REGEX = /^[A-Z0-9]{6}$/;

// Indian Mobile regex: 10 digits starting with 6, 7, 8, or 9
export const PHONE_REGEX = /^[6-9]\d{9}$/;

export const IssueGoldSchema = z.object({
  karigarId: z.string().min(1, "Please select a karigar"),
  itemCategory: z.enum([
    "necklace",
    "bangle",
    "chain",
    "ring",
    "earring",
    "custom_antique",
    "casting",
  ]),
  grossWeightG: z
    .number({ invalid_type_error: "Gross weight must be a number" })
    .positive("Gross weight must be greater than 0")
    .max(5000, "Single issue cannot exceed 5,000 grams"),
  purityPct: z
    .number({ invalid_type_error: "Purity must be a number" })
    .min(50, "Minimum purity is 50.00%")
    .max(100, "Maximum purity is 100.00%"),
  allowedWastagePct: z
    .number({ invalid_type_error: "Allowed wastage must be a number" })
    .min(0, "Wastage cannot be negative")
    .max(15, "Allowed wastage cannot exceed 15.00%"),
  jobNumber: z.string().min(2, "Job number is required"),
  expectedReturnDate: z.string().min(1, "Expected return date is required"),
  notes: z.string().max(250).optional(),
  scalePhotoUrl: z.string().optional(),
  scaleReadingConfirmed: z.boolean().default(false),
  scaleDiscrepancyReason: z.string().optional(),
});

export const ReceiptGoldSchema = z.object({
  karigarId: z.string().min(1, "Please select a karigar"),
  jobNumber: z.string().min(1, "Please select the job order to settle"),
  itemCategory: z.enum([
    "necklace",
    "bangle",
    "chain",
    "ring",
    "earring",
    "custom_antique",
    "casting",
  ]),
  finishedPieces: z
    .array(
      z.object({
        huid: z
          .string()
          .transform((v) => v.toUpperCase().trim())
          .refine((v) => !v || HUID_REGEX.test(v), {
            message: "HUID must be 6 alphanumeric characters (e.g., AB1234)",
          })
          .optional(),
        grossWeightG: z.number().positive("Finished weight must be greater than 0"),
        purityPct: z.number().min(50).max(100),
      })
    )
    .min(1, "At least one finished piece must be recorded"),
  scrapGrossG: z.number().min(0).default(0),
  scrapPurityPct: z.number().min(50).max(100).default(91.6),
  filingsGrossG: z.number().min(0).default(0),
  filingsPurityPct: z.number().min(50).max(100).default(91.6),
  scalePhotoUrl: z.string().optional(),
  notes: z.string().max(250).optional(),
  scaleReadingConfirmed: z.boolean().default(false),
  scaleDiscrepancyReason: z.string().optional(),
});

export const OldGoldSchema = z
  .object({
    showroomBillNo: z.string().min(1, "Showroom exchange bill number is required"),
    customerName: z.string().min(2, "Customer name is required"),
    customerPhone: z
      .string()
      .regex(PHONE_REGEX, "Enter a valid 10-digit Indian mobile number"),
    grossWeightG: z.number().positive("Gross weight must be greater than 0"),
    stoneWeightG: z.number().min(0).default(0),
    dirtDeductionPct: z.number().min(0).max(20).default(1.5),
    testedPurityPct: z.number().min(30).max(100),
    goldRatePerGram: z.number().positive("Current gold rate must be positive"),
    paymentMode: z.enum([
      "exchange_bill_adjustment",
      "bank_transfer",
      "cheque",
      "cash",
    ]),
    customerPan: z
      .string()
      .optional()
      .transform((val) => (val ? val.toUpperCase().trim() : "")),
    destination: z.enum(["vault", "refiner"]).default("vault"),
    notes: z.string().max(250).optional(),
  })
  .superRefine((data, ctx) => {
    // Calculate net payable
    const weightAfterStone = Math.max(0, data.grossWeightG - data.stoneWeightG);
    const dirtG = (weightAfterStone * data.dirtDeductionPct) / 100;
    const netMeltG = Math.max(0, weightAfterStone - dirtG);
    const fineG = (netMeltG * data.testedPurityPct) / 100;
    const valuation = fineG * data.goldRatePerGram;

    // High value rule: Section 269ST & Rule 114B of IT Act
    if (valuation >= 200000) {
      if (!data.customerPan || !PAN_REGEX.test(data.customerPan)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["customerPan"],
          message:
            "PAN is mandatory for old gold transactions >= ₹2,00,000 under Rule 114B",
        });
      }
      if (data.paymentMode === "cash") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["paymentMode"],
          message:
            "Cash payout of ₹2,00,000 or more is prohibited under Section 269ST. Select Bank Transfer or Exchange Bill Adjustment.",
        });
      }
    }
  });

export const KarigarMasterSchema = z.object({
  name: z.string().min(2, "Karigar name must be at least 2 characters"),
  tamilName: z.string().optional(),
  phone: z.string().regex(PHONE_REGEX, "Enter a valid 10-digit mobile number"),
  specialization: z.string().min(2, "Specialization is required"),
  categoryWastage: z.object({
    necklace: z.number().min(0).max(10),
    bangle: z.number().min(0).max(10),
    chain: z.number().min(0).max(10),
    ring: z.number().min(0).max(10),
    earring: z.number().min(0).max(10),
    custom_antique: z.number().min(0).max(15),
    casting: z.number().min(0).max(10),
  }),
});
