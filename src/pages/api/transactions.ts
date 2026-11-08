import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { IssueGoldSchema, ReceiptGoldSchema } from "@/lib/validation";
import { calculateFineWeight, calculateAllowedWastage, round3 } from "@/lib/math";
import { Transaction, JobOrder } from "@/lib/types";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const transactions = db.getTransactions();
    return res.status(200).json({ success: true, transactions });
  }

  if (req.method === "POST") {
    const action = req.body.action || "issue";

    if (action === "issue") {
      try {
        const body = IssueGoldSchema.parse(req.body);
        const karigar = db.getKarigarById(body.karigarId);
        if (!karigar) {
          return res.status(404).json({ success: false, error: "Karigar not found" });
        }

        const fineWeightG = calculateFineWeight(body.grossWeightG, body.purityPct);
        const allowedWastageFineG = calculateAllowedWastage(
          fineWeightG,
          body.allowedWastagePct
        );

        const txnId = `TX-${Math.floor(30400 + Math.random() * 900)}`;

        const newTxn: Transaction = {
          id: txnId,
          date: new Date().toISOString(),
          karigarId: karigar.id,
          karigarName: karigar.name,
          type: "issue",
          itemCategory: body.itemCategory,
          jobNumber: body.jobNumber,
          grossWeightG: round3(body.grossWeightG),
          purityPct: body.purityPct,
          fineWeightG,
          allowedWastagePct: body.allowedWastagePct,
          allowedWastageFineG,
          fineBalanceAfterG: round3(karigar.currentFineBalanceG + fineWeightG),
          scalePhotoUrl: body.scalePhotoUrl,
          clerkConfirmed: body.scaleReadingConfirmed,
          notes: body.notes,
          createdBy: "issue_clerk",
          syncStatus: "synced",
        };

        db.addTransaction(newTxn);

        // Create or link Job Order
        const newJob: JobOrder = {
          jobNumber: body.jobNumber,
          karigarId: karigar.id,
          karigarName: karigar.name,
          itemCategory: body.itemCategory,
          description: body.notes || `Production of ${body.itemCategory}`,
          issueTxnId: txnId,
          issuedFineG: fineWeightG,
          issuedGrossG: body.grossWeightG,
          purityPct: body.purityPct,
          allowedWastagePct: body.allowedWastagePct,
          expectedReturnDate: body.expectedReturnDate,
          status: "in_progress",
          createdAt: new Date().toISOString(),
          receivedPieces: [],
          receivedScrapFineG: 0,
          receivedFilingsFineG: 0,
          totalReturnedFineG: 0,
          actualLossFineG: fineWeightG,
          allowedLossFineG: allowedWastageFineG,
          unexplainedLossFineG: 0,
        };
        db.addJob(newJob);

        return res.status(201).json({ success: true, transaction: newTxn, job: newJob });
      } catch (err: any) {
        return res.status(400).json({
          success: false,
          error: err.errors ? err.errors[0].message : "Validation failed",
        });
      }
    }

    if (action === "receipt") {
      try {
        const body = ReceiptGoldSchema.parse(req.body);
        const karigar = db.getKarigarById(body.karigarId);
        if (!karigar) {
          return res.status(404).json({ success: false, error: "Karigar not found" });
        }

        const job = db.getJobByNumber(body.jobNumber);
        const createdTxns: Transaction[] = [];

        // 1. Process finished pieces
        for (const piece of body.finishedPieces) {
          const fineWt = calculateFineWeight(piece.grossWeightG, piece.purityPct);
          const txnId = `TX-${Math.floor(30400 + Math.random() * 900)}`;

          const pieceTxn: Transaction = {
            id: txnId,
            date: new Date().toISOString(),
            karigarId: karigar.id,
            karigarName: karigar.name,
            type: "receipt_piece",
            itemCategory: body.itemCategory,
            jobNumber: body.jobNumber,
            huid: piece.huid,
            grossWeightG: round3(piece.grossWeightG),
            purityPct: piece.purityPct,
            fineWeightG: fineWt,
            fineBalanceAfterG: round3(karigar.currentFineBalanceG - fineWt),
            scalePhotoUrl: body.scalePhotoUrl,
            clerkConfirmed: body.scaleReadingConfirmed,
            notes: body.notes,
            createdBy: "issue_clerk",
            syncStatus: "synced",
          };

          db.addTransaction(pieceTxn);
          createdTxns.push(pieceTxn);

          if (job) {
            job.receivedPieces.push({
              txnId,
              huid: piece.huid,
              grossWeightG: piece.grossWeightG,
              purityPct: piece.purityPct,
              fineWeightG: fineWt,
            });
          }
        }

        // 2. Process Scrap if provided
        if (body.scrapGrossG > 0) {
          const scrapFine = calculateFineWeight(body.scrapGrossG, body.scrapPurityPct);
          const scrapTxnId = `TX-${Math.floor(30400 + Math.random() * 900)}`;

          const scrapTxn: Transaction = {
            id: scrapTxnId,
            date: new Date().toISOString(),
            karigarId: karigar.id,
            karigarName: karigar.name,
            type: "receipt_scrap",
            itemCategory: body.itemCategory,
            jobNumber: body.jobNumber,
            grossWeightG: round3(body.scrapGrossG),
            purityPct: body.scrapPurityPct,
            fineWeightG: scrapFine,
            fineBalanceAfterG: round3(karigar.currentFineBalanceG - scrapFine),
            clerkConfirmed: true,
            createdBy: "issue_clerk",
            syncStatus: "synced",
          };

          db.addTransaction(scrapTxn);
          createdTxns.push(scrapTxn);
          if (job) job.receivedScrapFineG = round3(job.receivedScrapFineG + scrapFine);
        }

        // 3. Process Filings/Dust if provided
        if (body.filingsGrossG > 0) {
          const filingsFine = calculateFineWeight(body.filingsGrossG, body.filingsPurityPct);
          const filingsTxnId = `TX-${Math.floor(30400 + Math.random() * 900)}`;

          const filingsTxn: Transaction = {
            id: filingsTxnId,
            date: new Date().toISOString(),
            karigarId: karigar.id,
            karigarName: karigar.name,
            type: "receipt_filings",
            itemCategory: body.itemCategory,
            jobNumber: body.jobNumber,
            grossWeightG: round3(body.filingsGrossG),
            purityPct: body.filingsPurityPct,
            fineWeightG: filingsFine,
            fineBalanceAfterG: round3(karigar.currentFineBalanceG - filingsFine),
            clerkConfirmed: true,
            createdBy: "issue_clerk",
            syncStatus: "synced",
          };

          db.addTransaction(filingsTxn);
          createdTxns.push(filingsTxn);
          if (job) job.receivedFilingsFineG = round3(job.receivedFilingsFineG + filingsFine);
        }

        // Update Job totals
        if (job) {
          const totalPiecesFine = job.receivedPieces.reduce(
            (acc, p) => acc + p.fineWeightG,
            0
          );
          job.totalReturnedFineG = round3(
            totalPiecesFine + job.receivedScrapFineG + job.receivedFilingsFineG
          );
          job.actualLossFineG = round3(
            Math.max(0, job.issuedFineG - job.totalReturnedFineG)
          );
          job.unexplainedLossFineG = round3(
            job.actualLossFineG - job.allowedLossFineG
          );
          db.updateJob(job);
        }

        return res.status(201).json({ success: true, transactions: createdTxns, job });
      } catch (err: any) {
        return res.status(400).json({
          success: false,
          error: err.errors ? err.errors[0].message : "Validation failed",
        });
      }
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

