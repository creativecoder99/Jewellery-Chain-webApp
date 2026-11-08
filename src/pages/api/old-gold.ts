import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { OldGoldSchema } from "@/lib/validation";
import { calculateOldGoldValuation, round2, round3 } from "@/lib/math";
import { OldGoldEntry } from "@/lib/types";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const entries = db.getOldGoldEntries();
    return res.status(200).json({ success: true, entries });
  }

  if (req.method === "POST") {
    try {
      const body = OldGoldSchema.parse(req.body);

      const math = calculateOldGoldValuation({
        grossWeightG: body.grossWeightG,
        stoneWeightG: body.stoneWeightG,
        dirtDeductionPct: body.dirtDeductionPct,
        testedPurityPct: body.testedPurityPct,
        goldRatePerGram: body.goldRatePerGram,
      });

      const entryId = `OG-${Math.floor(7000 + Math.random() * 900)}`;

      const newEntry: OldGoldEntry = {
        id: entryId,
        date: new Date().toISOString(),
        showroomBillNo: body.showroomBillNo,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        grossWeightG: math.grossWeightG,
        stoneWeightG: math.stoneWeightG,
        dirtDeductionPct: math.dirtDeductionPct,
        netMeltWeightG: math.netMeltWeightG,
        testedPurityPct: math.testedPurityPct,
        fineWeightG: math.fineWeightG,
        goldRatePerGram: math.goldRatePerGram,
        grossValuationInr: math.grossValuationInr,
        deductionsInr: math.meltingRefiningChargesInr,
        netPayableInr: math.netPayableInr,
        paymentMode: body.paymentMode,
        customerPan: body.customerPan,
        panVerified: !!body.customerPan,
        cashLimitExceededWarning: math.cashLimitExceeded && body.paymentMode === "cash",
        status: "verified",
        destination: body.destination,
        recordedBy: "issue_clerk",
      };

      db.addOldGoldEntry(newEntry);
      return res.status(201).json({ success: true, entry: newEntry });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.errors ? err.errors[0].message : "Validation failed",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

