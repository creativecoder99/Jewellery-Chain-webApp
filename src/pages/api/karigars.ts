import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { KarigarMasterSchema } from "@/lib/validation";
import { Karigar } from "@/lib/types";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const karigars = db.getKarigars();
    return res.status(200).json({ success: true, karigars });
  }

  if (req.method === "POST") {
    try {
      const validated = KarigarMasterSchema.parse(req.body);
      const karigars = db.getKarigars();
      const newId = `KAR-0${karigars.length + 1}`;

      const newKarigar: Karigar = {
        id: newId,
        name: validated.name,
        tamilName: validated.tamilName || validated.name,
        phone: validated.phone,
        specialization: validated.specialization,
        status: "active",
        joinedDate: new Date().toISOString().split("T")[0],
        categoryWastage: validated.categoryWastage,
        currentFineBalanceG: 0.0,
        lifetimeIssuedG: 0.0,
        lifetimeReturnedG: 0.0,
        lifetimeUnexplainedLossG: 0.0,
        historicalMeanLossPct: 2.0,
        historicalLossStdDev: 0.15,
      };

      db.addKarigar(newKarigar);
      return res.status(201).json({ success: true, karigar: newKarigar });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.errors ? err.errors[0].message : "Validation failed",
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

