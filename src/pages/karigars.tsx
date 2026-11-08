import React, { useState, useEffect } from "react";
import Shell from "@/components/layout/Shell";
import { Karigar, ItemCategory } from "@/lib/types";
import { formatWeight } from "@/lib/math";
import { useApp } from "@/context/AppContext";

export default function KarigarsPage() {
  const { role } = useApp();
  const [karigars, setKarigars] = useState<Karigar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Karigar form state
  const [name, setName] = useState<string>("");
  const [tamilName, setTamilName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [specialization, setSpecialization] = useState<string>("");
  const [categoryWastage, setCategoryWastage] = useState<Record<ItemCategory, number>>({
    necklace: 3.0,
    bangle: 2.2,
    chain: 2.2,
    ring: 1.6,
    earring: 1.8,
    custom_antique: 4.5,
    casting: 1.5,
  });
  const [addError, setAddError] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const fetchKarigars = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/karigars");
      const data = await res.json();
      if (data.success) setKarigars(data.karigars);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKarigars();
  }, []);

  const filteredKarigars = karigars.filter(
    (k) =>
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.phone.includes(searchQuery) ||
      (k.tamilName && k.tamilName.includes(searchQuery))
  );

  const handleAddKarigar = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setSaving(true);

    try {
      const res = await fetch("/api/karigars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tamilName,
          phone,
          specialization,
          categoryWastage,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAddError(data.error || "Failed to add karigar.");
        setSaving(false);
        return;
      }

      setShowAddModal(false);
      setName("");
      setTamilName("");
      setPhone("");
      setSpecialization("");
      fetchKarigars();
    } catch (err: any) {
      setAddError(err.message || "Network error.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell
      title="Karigar Master & Agreed Wastage Rates"
      subtitle="Workshop artisan records, category-specific wastage allowances, and running balances"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 text-xs font-semibold rounded bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm"
        >
          + Add New Karigar
        </button>
      }
    >
      <div className="space-y-6">
        {/* Search bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <input
              type="text"
              placeholder="Search by karigar name, Tamil name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs p-2.5 rounded border border-border bg-surface text-ink-primary focus:ring-1 focus:ring-accent"
            />
          </div>
          <span className="text-xs text-ink-secondary">
            Total Artisans: <strong className="text-ink-primary font-semibold">{karigars.length}</strong>
          </span>
        </div>

        {/* Karigars Table */}
        <div className="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F0] border-b border-border text-ink-secondary font-semibold">
                <tr>
                  <th className="py-3 px-4">Artisan</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Craft Specialization</th>
                  <th className="py-3 px-4 text-center">Necklace %</th>
                  <th className="py-3 px-4 text-center">Bangle %</th>
                  <th className="py-3 px-4 text-center">Chain %</th>
                  <th className="py-3 px-4 text-center">Antique %</th>
                  <th className="py-3 px-4 text-right">Running Fine Balance</th>
                  <th className="py-3 px-4 text-right">Lifetime Issued</th>
                  <th className="py-3 px-4 text-right">Unexplained Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredKarigars.map((k) => (
                  <tr key={k.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-ink-primary">{k.name}</div>
                      {k.tamilName && (
                        <div className="text-[11px] text-ink-muted">{k.tamilName}</div>
                      )}
                      <span className="text-[10px] font-mono text-ink-secondary">{k.id}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-ink-secondary">{k.phone}</td>
                    <td className="py-3 px-4 text-ink-secondary font-medium">
                      {k.specialization}
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-numbers">
                      {k.categoryWastage.necklace?.toFixed(2) || "3.00"}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-numbers">
                      {k.categoryWastage.bangle?.toFixed(2) || "2.00"}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-numbers">
                      {k.categoryWastage.chain?.toFixed(2) || "2.20"}%
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-numbers">
                      {k.categoryWastage.custom_antique?.toFixed(2) || "4.50"}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sm text-ink-primary tabular-numbers">
                      {formatWeight(k.currentFineBalanceG)} g
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-ink-secondary tabular-numbers">
                      {formatWeight(k.lifetimeIssuedG)} g
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-numbers">
                      <span
                        className={
                          k.lifetimeUnexplainedLossG > 15
                            ? "text-status-loss font-semibold"
                            : "text-ink-secondary"
                        }
                      >
                        {formatWeight(k.lifetimeUnexplainedLossG)} g
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Karigar Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-serif font-bold text-ink-primary">
                Add New Workshop Karigar
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-ink-muted hover:text-ink-primary"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded bg-status-loss-bg border border-status-loss-border text-xs text-status-loss">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddKarigar} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="artisan-name" className="block font-medium text-ink-primary">
                    Artisan Name (English) *
                  </label>
                  <input
                    id="artisan-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh V"
                    className="w-full p-2 rounded border border-border text-ink-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="artisan-tamil-name" className="block font-medium text-ink-primary">
                    Tamil Name (தமிழ்)
                  </label>
                  <input
                    id="artisan-tamil-name"
                    type="text"
                    value={tamilName}
                    onChange={(e) => setTamilName(e.target.value)}
                    placeholder="e.g. ரமேஷ் வி"
                    className="w-full p-2 rounded border border-border text-ink-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="artisan-phone" className="block font-medium text-ink-primary">
                    Phone (10 digits) *
                  </label>
                  <input
                    id="artisan-phone"
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9842100000"
                    className="w-full p-2 rounded border border-border font-mono text-ink-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="artisan-specialization" className="block font-medium text-ink-primary">
                    Craft Specialization *
                  </label>
                  <input
                    id="artisan-specialization"
                    type="text"
                    required
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Hollow Chains"
                    className="w-full p-2 rounded border border-border text-ink-primary"
                  />
                </div>
              </div>

              {/* Agreed Wastage Percentages */}
              <div className="p-3 bg-surface-subtle rounded border border-border space-y-2">
                <span className="font-semibold block text-ink-primary">
                  Agreed Wastage Allowances (%)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="wastage-necklace" className="block text-[10px] text-ink-secondary">
                      Necklace:
                    </label>
                    <input
                      id="wastage-necklace"
                      type="number"
                      step="0.1"
                      value={categoryWastage.necklace}
                      onChange={(e) =>
                        setCategoryWastage({
                          ...categoryWastage,
                          necklace: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-1 rounded border border-border font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="wastage-bangle" className="block text-[10px] text-ink-secondary">
                      Bangle:
                    </label>
                    <input
                      id="wastage-bangle"
                      type="number"
                      step="0.1"
                      value={categoryWastage.bangle}
                      onChange={(e) =>
                        setCategoryWastage({
                          ...categoryWastage,
                          bangle: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-1 rounded border border-border font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="wastage-chain" className="block text-[10px] text-ink-secondary">
                      Chain:
                    </label>
                    <input
                      id="wastage-chain"
                      type="number"
                      step="0.1"
                      value={categoryWastage.chain}
                      onChange={(e) =>
                        setCategoryWastage({
                          ...categoryWastage,
                          chain: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-1 rounded border border-border font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded border border-border hover:bg-surface-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded bg-accent text-white hover:bg-accent-hover font-semibold"
                >
                  {saving ? "Saving..." : "Save Karigar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}

