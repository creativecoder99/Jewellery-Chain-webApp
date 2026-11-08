import type { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";
import { evaluateLossDrift } from "@/lib/ai-anomaly";
import { round2, round3 } from "@/lib/math";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const jobs = db.getJobs();
    return res.status(200).json({ success: true, jobs });
  }

  // Settle / Close a Job
  if (req.method === "PUT") {
    const { jobNumber, settlementNotes } = req.body;
    if (!jobNumber) {
      return res.status(400).json({ success: false, error: "Job number is required" });
    }

    const job = db.getJobByNumber(jobNumber);
    if (!job) {
      return res.status(404).json({ success: false, error: "Job not found" });
    }

    const karigar = db.getKarigarById(job.karigarId);
    if (!karigar) {
      return res.status(404).json({ success: false, error: "Karigar not found" });
    }

    // Mark job settled
    job.status = "settled";
    job.closedAt = new Date().toISOString();
    if (settlementNotes) job.settlementNotes = settlementNotes;

    // Settle the agreed allowed wastage allowance
    // The karigar is credited with the allowed wastage allowance against the job
    const wastageCreditFineG = round3(job.allowedLossFineG);
    karigar.currentFineBalanceG = round3(
      Math.max(0, karigar.currentFineBalanceG - wastageCreditFineG)
    );

    // If unexplained loss > 0, accumulate in karigar lifetime stats
    if (job.unexplainedLossFineG > 0) {
      karigar.lifetimeUnexplainedLossG = round3(
        karigar.lifetimeUnexplainedLossG + job.unexplainedLossFineG
      );
    }

    db.updateJob(job);
    db.updateKarigar(karigar);

    // Run AI Loss Drift Evaluation
    const drift = evaluateLossDrift(karigar, {
      jobNumber: job.jobNumber,
      itemCategory: job.itemCategory,
      issuedFineG: job.issuedFineG,
      actualLossFineG: job.actualLossFineG,
      allowedLossFineG: job.allowedLossFineG,
      unexplainedLossFineG: job.unexplainedLossFineG,
    });

    if (drift.isAnomaly) {
      db.addAlert({
        id: `ALT-${job.jobNumber}-${Date.now().toString().slice(-4)}`,
        karigarId: karigar.id,
        karigarName: karigar.name,
        category: job.itemCategory,
        detectedAt: new Date().toISOString(),
        triggerJobNumber: job.jobNumber,
        actualLossPct: drift.actualLossPct,
        agreedLossPct: job.allowedWastagePct,
        historicalMeanLossPct: drift.historicalMeanPct,
        excessLossFineG: round3(job.unexplainedLossFineG),
        financialImpactInr: round2(job.unexplainedLossFineG * 12500),
        severity: drift.severity,
        status: "open",
        suggestedReviewCause: drift.suggestedCause,
      });
    }

    return res.status(200).json({ success: true, job, driftAlert: drift.isAnomaly });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

