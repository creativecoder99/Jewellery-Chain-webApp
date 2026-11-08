import React from "react";
import Shell from "@/components/layout/Shell";

export default function PrivacyPage() {
  return (
    <Shell
      title="Privacy & Data Protection Policy"
      subtitle="Draft document for review • Operational handling of artisan data and customer compliance records"
    >
      <div className="max-w-3xl mx-auto bg-surface border border-border rounded-lg p-6 sm:p-8 space-y-6 text-xs text-ink-primary leading-relaxed">
        <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-900 font-medium">
          [Draft for Review]: This privacy document outlines how internal goldsmith records, scale photographs, and customer compliance data are stored, protected, and retained.
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink-primary">1. Information We Collect</h2>
          <p>
            SwarnaTrack collects operational workshop data, including karigar names, contact numbers, job assignments, weighment logs, and scale screen photographs. For old gold intake, customer names, contact numbers, showroom bill references, and mandatory PAN details (for transactions ≥ ₹2,00,000) are recorded.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink-primary">2. Purpose of Processing</h2>
          <p>
            Data is collected exclusively for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-ink-secondary">
            <li>Tracking workshop gold balances and calculating allowed vs actual manufacturing wastage.</li>
            <li>Generating official job order vouchers, receipt slips, and Tally accounting entries.</li>
            <li>Complying with statutory Income Tax reporting standards and BIS hallmarking traceability.</li>
            <li>Detecting abnormal loss drifts to identify machinery and recovery issues early.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink-primary">3. Access Controls &amp; Confidentiality</h2>
          <p>
            Role-based access control restricts sensitive financial stock totals and loss drift review items exclusively to the Finance Head and Managing Partner. Issue clerks have access to issuance, receipts, and scale inputs. Karigars have access solely to their personal job vouchers and running balances.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-ink-primary">4. Data Retention &amp; Local Storage</h2>
          <p>
            Vouchers and scale photographs are archived for the statutory period required under Indian commercial and tax law (minimum 8 assessment years). On-device offline queues are temporarily stored in local storage and encrypted or flushed immediately upon network reconnection.
          </p>
        </section>
      </div>
    </Shell>
  );
}

