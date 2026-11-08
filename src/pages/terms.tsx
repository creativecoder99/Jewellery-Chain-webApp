import React from "react";
import Shell from "@/components/layout/Shell";

export default function TermsPage() {
  return (
    <Shell
      title="Terms of Service (Workshop Custody Operations)"
      subtitle="Draft document for legal review • Governs workshop gold custody and karigar master agreements"
    >
      <div className="max-w-3xl mx-auto bg-surface border border-border rounded-lg p-6 sm:p-8 space-y-6 text-xs text-ink-primary leading-relaxed">
        <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-900 font-medium">
          [Draft for Review]: This policy outlines the operational and accountability terms governing gold issuance, agreed wastage limits, and custody reconciliation for Company A (Coimbatore).
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink-primary">1. Gold Custody &amp; Ownership</h2>
          <p>
            All fine gold, bullion, alloys, trimmings, scrap, filings, and unfinished articles issued through SwarnaTrack remain the exclusive and unencumbered property of Company A, Coimbatore. Issuance to karigars constitutes temporary physical custody solely for authorized manufacturing job orders.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink-primary">2. Agreed Wastage Allowances</h2>
          <p>
            Wastage percentage allowances are determined per article category (e.g. 3.00% for bridal necklaces, 2.20% for plain chains) and recorded in the Karigar Master. Wastage is credited only upon physical receipt and verification of finished pieces, clean scrap, and bench sweeps. Unexplained loss exceeding the agreed allowance constitutes a variance subject to internal review.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink-primary">3. Weighment Standards &amp; Scale Proof</h2>
          <p>
            All weighments are conducted on calibrated Class I/II electronic precision scales to 3 decimal places (0.001g). Digital scale display photographs are retained alongside transaction vouchers. In cases of manual entry overrides, the authorizing clerk must record a verified business reason.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink-primary">4. Old Gold &amp; Statutory Compliance</h2>
          <p>
            Customer scrap purchases at the Old Gold Desk are governed by Section 269ST and Rule 114B of the Indian Income Tax Act 1961. Permanent Account Numbers (PAN) are mandatory for transactions of ₹2,00,000 or greater, and cash payouts exceeding legal thresholds are strictly barred.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink-primary">5. Loss Alerts &amp; Dispute Resolution</h2>
          <p>
            Statistical drift indicators are constructive tools for workshop supervision, equipment calibration, and chemical recovery inspection. They are not judicial accusations. Any material discrepancy will be resolved through physical re-weighment and joint melt verification in the workshop crucible.
          </p>
        </section>
      </div>
    </Shell>
  );
}

