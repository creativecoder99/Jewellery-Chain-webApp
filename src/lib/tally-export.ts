import { StockSummary, Transaction } from "./types";
import { formatWeight } from "./math";

/**
 * Generates an XML envelope compatible with Tally Prime / Tally.ERP 9
 * for importing gold inventory stock vouchers and workshop ledger postings.
 */
export function generateTallyXml(params: {
  companyName: string;
  stock: StockSummary;
  transactions: Transaction[];
}): string {
  const { companyName, stock, transactions } = params;
  const dateFormatted = stock.date.replace(/-/g, ""); // YYYYMMDD for Tally

  const xmlTransactions = transactions
    .slice(0, 25)
    .map((txn) => {
      const isIssue = txn.type === "issue";
      const voucherType = isIssue ? "Material Out" : "Material In";
      const debitLedger = isIssue ? `Karigar - ${txn.karigarName}` : "Workshop Gold Stock";
      const creditLedger = isIssue ? "Workshop Gold Stock" : `Karigar - ${txn.karigarName}`;

      return `    <TALLYMESSAGE xmlns:UDF="TallyUDF">
      <VOUCHER VCHTYPE="${voucherType}" ACTION="Create">
        <DATE>${dateFormatted}</DATE>
        <VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME>
        <VOUCHERNUMBER>${txn.id}</VOUCHERNUMBER>
        <PARTYLEDGERNAME>${txn.karigarName}</PARTYLEDGERNAME>
        <NARRATION>${txn.type.toUpperCase()} Job: ${txn.jobNumber || "N/A"} - Gross: ${formatWeight(
        txn.grossWeightG
      )}g @ ${txn.purityPct}% Purity</NARRATION>
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${debitLedger}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>-${(txn.fineWeightG * 12500).toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${creditLedger}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${(txn.fineWeightG * 12500).toFixed(2)}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        <ALLINVENTORYENTRIES.LIST>
          <STOCKITEMNAME>22K Gold Alloy (916)</STOCKITEMNAME>
          <ISDEEMEDPOSITIVE>${isIssue ? "No" : "Yes"}</ISDEEMEDPOSITIVE>
          <RATE>12500.00/g</RATE>
          <ACTUALQTY>${formatWeight(txn.fineWeightG)} g</ACTUALQTY>
          <BILLEDQTY>${formatWeight(txn.fineWeightG)} g</BILLEDQTY>
          <AMOUNT>${(txn.fineWeightG * 12500).toFixed(2)}</AMOUNT>
        </ALLINVENTORYENTRIES.LIST>
      </VOUCHER>
    </TALLYMESSAGE>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
${xmlTransactions}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

/**
 * Generates CSV format for accounting import.
 */
export function generateStockCsv(params: {
  stock: StockSummary;
  transactions: Transaction[];
}): string {
  const { stock, transactions } = params;

  let csv = "COMPANY A COIMBATORE - WORKSHOP GOLD STOCK STATEMENT\n";
  csv += `Statement Date,${stock.date}\n`;
  csv += `Standard 24K Rate,INR ${stock.goldRatePerGram24K}/g\n\n`;

  csv += "LOCATION,FINE GOLD (GRAMS),VALUATION (INR)\n";
  csv += `Vault Bullion & Stock,${stock.vaultBullionFineG.toFixed(3)},${(stock.vaultBullionFineG * stock.goldRatePerGram24K).toFixed(2)}\n`;
  csv += `Manufactured Vault Stock,${stock.vaultManufacturedFineG.toFixed(3)},${(stock.vaultManufacturedFineG * stock.goldRatePerGram24K).toFixed(2)}\n`;
  csv += `With Karigars (Workshop),${stock.withKarigarsFineG.toFixed(3)},${(stock.withKarigarsFineG * stock.goldRatePerGram24K).toFixed(2)}\n`;
  csv += `At Refiner (Scrap pipeline),${stock.atRefinerFineG.toFixed(3)},${(stock.atRefinerFineG * stock.goldRatePerGram24K).toFixed(2)}\n`;
  csv += `TOTAL WORKSHOP CUSTODY,${stock.totalWorkshopFineG.toFixed(3)},${(stock.totalWorkshopFineG * stock.goldRatePerGram24K).toFixed(2)}\n\n`;

  csv += "TRANSACTION AUDIT LOG (RECENT)\n";
  csv += "Txn ID,Date,Karigar,Type,Job Number,Gross Wt (g),Purity (%),Fine Wt (g),Allowed Wastage (%),Fine Balance (g),Clerk Verified\n";

  for (const txn of transactions) {
    csv += `"${txn.id}","${txn.date}","${txn.karigarName}","${txn.type}","${txn.jobNumber || ""}","${txn.grossWeightG.toFixed(3)}","${txn.purityPct.toFixed(2)}","${txn.fineWeightG.toFixed(3)}","${(txn.allowedWastagePct || 0).toFixed(2)}","${txn.fineBalanceAfterG.toFixed(3)}","${txn.clerkConfirmed ? "YES" : "NO"}"\n`;
  }

  return csv;
}

