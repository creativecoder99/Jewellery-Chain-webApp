import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    db.resetSeedData();
    return res.status(200).json({ success: true, message: "Database reset to initial sample seed" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
