import React, { useState, useEffect } from "react";
import Shell from "@/components/layout/Shell";
import { Karigar, Transaction, JobOrder } from "@/lib/types";
import { formatWeight, formatPurity } from "@/lib/math";
import { useApp } from "@/context/AppContext";
import DigitalSlipModal from "@/components/slips/DigitalSlipModal";

export default function KarigarPortalPage() {
  const { lang, setLang, t, selectedKarigarId, setSelectedKarigarId } = useApp();
  const [karigars, setKarigars] = useState<Karigar[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [jobs, setJobs] = useState<JobOrder[]>([]);
  const [activeSlip, setActiveSlip] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<"slips" | "jobs">("slips");

  useEffect(() => {
    Promise.all([
      fetch("/api/karigars"),
      fetch("/api/transactions"),
      fetch("/api/jobs"),
    ]).then(async ([resK, resT, resJ]) => {
      const dataK = await resK.json();
      const dataT = await resT.json();
      const dataJ = await resJ.json();
      if (dataK.success) setKarigars(dataK.karigars);
      if (dataT.success) setTransactions(dataT.transactions);
      if (dataJ.success) setJobs(dataJ.jobs);
    });
  }, []);

  const currentKarigar =
    karigars.find((k) => k.id === selectedKarigarId) || karigars[0];

  const karigarTxns = transactions.filter(
    (t) => t.karigarId === (currentKarigar ? currentKarigar.id : "KAR-01")
  );

  const karigarJobs = jobs.filter(
    (j) => j.karigarId === (currentKarigar ? currentKarigar.id : "KAR-01")
  );

  return (
    <Shell
      title={lang === "ta" ? "பொற்கொல்லர் தங்கம் பார்வை" : "Karigar Mobile Slip Portal"}
      subtitle={
        lang === "ta"
          ? "உங்கள் நிலுவை சுத்த தங்கம் மற்றும் பட்டறை சீட்டுகள்"
          : "Personal running fine-gold balance and digital workshop slips"
      }
      actions={
        <div className="flex items-center gap-2">
          {/* Quick Karigar Switcher for reviewer testing */}
          <select
            value={currentKarigar ? currentKarigar.id : "KAR-01"}
            onChange={(e) => setSelectedKarigarId(e.target.value)}
            className="text-xs py-1.5 px-2 rounded border border-border bg-surface text-ink-primary font-medium"
          >
            {karigars.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name} ({k.tamilName})
              </option>
            ))}
          </select>

          <button
            onClick={() => setLang(lang === "en" ? "ta" : "en")}
            className="px-2.5 py-1.5 rounded border border-border bg-surface text-xs font-semibold text-accent-hover hover:bg-surface-subtle"
          >
            {lang === "en" ? "தமிழ்" : "English"}
          </button>
        </div>
      }
    >
      <div className="max-w-lg mx-auto space-y-6">
        {/* Karigar Identity & Prominent Running Balance Card */}
        {currentKarigar && (
          <div className="bg-[#FAF6EC] border border-[#DDD3BA] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-accent-hover uppercase tracking-wider block">
                  {lang === "ta" ? "பொற்கொல்லர் விவரம்" : "Artisan Profile"}
                </span>
                <h2 className="text-xl font-bold font-serif text-ink-primary mt-0.5">
                  {lang === "ta" && currentKarigar.tamilName
                    ? currentKarigar.tamilName
                    : currentKarigar.name}
                </h2>
                <p className="text-xs text-ink-secondary mt-0.5">
                  {currentKarigar.specialization} • {currentKarigar.phone}
                </p>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-surface border border-border text-ink-secondary">
                {currentKarigar.id}
              </span>
            </div>

            {/* Big Standout Running Balance */}
            <div className="p-4 rounded-lg bg-surface border border-[#DDD3BA] space-y-1 text-center">
              <span className="text-xs font-semibold text-ink-secondary block">
                {lang === "ta" ? "உங்கள் கைவசம் உள்ள சுத்த தங்கம்" : "Current Fine Gold in Custody"}
              </span>
              <div className="font-mono text-3xl font-extrabold text-ink-primary tabular-numbers">
                {formatWeight(currentKarigar.currentFineBalanceG)}{" "}
                <span className="text-base font-sans font-semibold text-accent-hover">
                  {lang === "ta" ? "சுத்த கிராம்" : "g fine"}
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">
                {lang === "ta"
                  ? "வழங்கப்பட்ட தங்கம் கழித்து ஒப்படைத்த நகை மற்றும் கழிவு"
                  : "Net balance owed to workshop vault"}
              </p>
            </div>

            {/* Agreed Wastage Quick Strip */}
            <div className="pt-1 flex items-center justify-between text-xs text-ink-secondary border-t border-[#DDD3BA]/60">
              <span>{lang === "ta" ? "ஆரம் சேதாரம்:" : "Necklace Wastage:"}</span>
              <span className="font-mono font-bold text-ink-primary">
                {currentKarigar.categoryWastage.necklace?.toFixed(2)} %
              </span>

              <span className="text-border-strong">•</span>

              <span>{lang === "ta" ? "சங்கிலி சேதாரம்:" : "Chain Wastage:"}</span>
              <span className="font-mono font-bold text-ink-primary">
                {currentKarigar.categoryWastage.chain?.toFixed(2)} %
              </span>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-border text-xs font-semibold">
          <button
            onClick={() => setActiveTab("slips")}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === "slips"
                ? "border-accent text-accent-hover font-bold"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {lang === "ta" ? "சீட்டுகள் (Slips)" : "Transaction Slips"} ({karigarTxns.length})
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors ${
              activeTab === "jobs"
                ? "border-accent text-accent-hover font-bold"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {lang === "ta" ? "வேலை ஆணைகள் (Jobs)" : "Active Job Orders"} ({karigarJobs.length})
          </button>
        </div>

        {/* Slips List */}
        {activeTab === "slips" && (
          <div className="space-y-3">
            {karigarTxns.length === 0 ? (
              <div className="p-8 text-center bg-surface border border-border rounded-lg text-ink-secondary text-xs">
                {lang === "ta" ? "பதிவுகள் எதுவும் இல்லை" : "No transactions recorded yet."}
              </div>
            ) : (
              karigarTxns.map((txn) => {
                const isIssue = txn.type === "issue";
                return (
                  <div
                    key={txn.id}
                    onClick={() => setActiveSlip(txn)}
                    className="bg-surface border border-border rounded-lg p-4 shadow-sm space-y-3 cursor-pointer hover:border-accent transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isIssue ? "bg-amber-600" : "bg-emerald-600"
                          }`}
                        ></span>
                        <span className="font-mono font-bold text-xs text-ink-primary">
                          {txn.id}
                        </span>
                        <span className="text-[11px] text-ink-muted">
                          {txn.jobNumber ? `• ${txn.jobNumber}` : ""}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          isIssue
                            ? "bg-amber-50 text-amber-900 border border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {isIssue
                          ? lang === "ta"
                            ? "தங்கம் வழங்கல்"
                            : "Gold Issued"
                          : lang === "ta"
                          ? "நகை வரவு"
                          : "Article Receipt"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
                      <div>
                        <span className="text-ink-secondary block text-[11px]">
                          {lang === "ta" ? "மொத்த எடை (Gross):" : "Gross Weight:"}
                        </span>
                        <span className="font-mono font-semibold text-ink-primary tabular-numbers">
                          {formatWeight(txn.grossWeightG)} g
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-ink-secondary block text-[11px]">
                          {lang === "ta" ? "சுத்த தங்கம் (Fine):" : "Fine Weight:"}
                        </span>
                        <span className="font-mono font-bold text-accent-hover tabular-numbers">
                          {formatWeight(txn.fineWeightG)} g fine
                        </span>
                      </div>
                    </div>

                    <div className="bg-surface-subtle p-2 rounded border border-border/80 flex items-center justify-between text-xs">
                      <span className="text-ink-secondary text-[11px]">
                        {lang === "ta" ? "சீட்டுக்கு பின் இருப்பு:" : "Balance After Slip:"}
                      </span>
                      <span className="font-mono font-bold text-ink-primary tabular-numbers">
                        {formatWeight(txn.fineBalanceAfterG)} g
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1">
                      <span>{new Date(txn.date).toLocaleDateString("en-IN")}</span>
                      <span className="text-accent underline font-semibold">
                        {lang === "ta" ? "சீட்டைப் பார்க்க" : "View Digital Slip"} →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Jobs List */}
        {activeTab === "jobs" && (
          <div className="space-y-3">
            {karigarJobs.map((job) => (
              <div
                key={job.jobNumber}
                className="bg-surface border border-border rounded-lg p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-border/70 pb-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-ink-primary block">
                      {job.jobNumber}
                    </span>
                    <span className="text-xs text-ink-secondary capitalize">
                      {job.description}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      job.status === "in_progress"
                        ? "bg-amber-50 text-amber-900 border border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {job.status === "in_progress"
                      ? lang === "ta"
                        ? "நடைமுறையில்"
                        : "In Progress"
                      : lang === "ta"
                      ? "முடிந்தது"
                      : "Settled"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-ink-secondary block text-[11px]">
                      {lang === "ta" ? "வழங்கப்பட்ட சுத்த தங்கம்:" : "Issued Fine Gold:"}
                    </span>
                    <span className="font-mono font-bold text-ink-primary tabular-numbers">
                      {formatWeight(job.issuedFineG)} g
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-ink-secondary block text-[11px]">
                      {lang === "ta" ? "ஒப்படைத்த சுத்த தங்கம்:" : "Returned Fine Gold:"}
                    </span>
                    <span className="font-mono font-bold text-emerald-800 tabular-numbers">
                      {formatWeight(job.totalReturnedFineG)} g
                    </span>
                  </div>
                </div>

                {job.receivedPieces.length > 0 && (
                  <div className="p-2 bg-surface-subtle rounded border border-border text-[11px] space-y-1">
                    <span className="font-semibold text-ink-primary block">
                      {lang === "ta" ? "ஒப்படைக்கப்பட்ட நகைகள் (HUID):" : "Finished Articles Delivered:"}
                    </span>
                    {job.receivedPieces.map((p, idx) => (
                      <div key={idx} className="flex justify-between font-mono">
                        <span>HUID: {p.huid || "N/A"}</span>
                        <span>{formatWeight(p.fineWeightG)} g fine</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slip Modal Popup */}
      <DigitalSlipModal
        transaction={activeSlip}
        onClose={() => setActiveSlip(null)}
      />
    </Shell>
  );
}

