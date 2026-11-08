import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const alerts = db.getAlerts();
    return res.status(200).json({ success: true, alerts });
  }

  if (req.method === "PUT") {
    const { id, status, notes, reviewedBy } = req.body;
    if (!id || !status) {
      return res.status(400).json({ success: false, error: "Alert ID and status required" });
    }

    db.updateAlertStatus(id, status, notes, reviewedBy || "finance_head");
    return res.status(200).json({ success: true, alerts: db.getAlerts() });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
