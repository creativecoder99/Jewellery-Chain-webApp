import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { generateTallyXml, generateStockCsv } from "@/lib/tally-export";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const format = req.query.format || "xml";
  const stock = db.getStock();
  const transactions = db.getTransactions();

  if (format === "xml") {
    const xml = generateTallyXml({
      companyName: "Company A Coimbatore Jewellery Workshop",
      stock,
      transactions,
    });

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="tally-gold-stock-${stock.date}.xml"`
    );
    return res.status(200).send(xml);
  }

  if (format === "csv") {
    const csv = generateStockCsv({ stock, transactions });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="company-a-gold-stock-${stock.date}.csv"`
    );
    return res.status(200).send(csv);
  }

  return res.status(400).json({ error: "Invalid format requested. Use xml or csv." });
}
