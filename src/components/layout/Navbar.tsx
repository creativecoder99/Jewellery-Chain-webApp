import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/lib/types";

export default function Navbar() {
  const router = useRouter();
  const { role, setRole, lang, setLang, t, isOnline, offlineQueue, syncOfflineQueue } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await syncOfflineQueue();
    setSyncing(false);
  };

  const resetData = async () => {
    if (confirm("Reset database to initial Coimbatore sample data?")) {
      await fetch("/api/seed", { method: "POST" });
      window.location.reload();
    }
  };

  const navLinks = [
    { href: "/", label: t.nav.dashboard, roles: ["finance_head", "partner", "issue_clerk"] },
    { href: "/issue", label: t.nav.issue, roles: ["issue_clerk", "finance_head"] },
    { href: "/receipt", label: t.nav.receipt, roles: ["issue_clerk", "finance_head"] },
    { href: "/karigars", label: t.nav.karigars, roles: ["issue_clerk", "finance_head", "partner"] },
    { href: "/old-gold", label: t.nav.oldGold, roles: ["issue_clerk", "finance_head", "partner"] },
    { href: "/alerts", label: t.nav.alerts, roles: ["finance_head", "partner"] },
    { href: "/karigar-portal", label: t.nav.karigarPortal, roles: ["karigar", "issue_clerk", "finance_head", "partner"] },
    { href: "/reconciliation", label: t.nav.reconciliation, roles: ["finance_head", "partner"] },
  ];

  const visibleLinks = navLinks.filter((link) => link.roles.includes(role));

  return (
    <header className="border-b border-border bg-[#FAF8F3] sticky top-0 z-40">
      {/* Top Banner with Company context, active role switcher, and language */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-border/60">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-ink-primary tracking-wide text-sm">
            Company A
          </span>
          <span className="text-border-strong">|</span>
          <span className="text-ink-secondary">Coimbatore Workshop Custody</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-surface border border-border text-ink-secondary">
            5 Showrooms • 40 Karigars
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Offline Sync Status */}
          {!isOnline || offlineQueue.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {offlineQueue.length > 0
                  ? `${offlineQueue.length} queued locally`
                  : t.labels.offlineMode}
              </span>
              {offlineQueue.length > 0 && isOnline && (
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="px-2 py-0.5 rounded bg-accent text-white hover:bg-accent-hover text-[11px] font-medium"
                >
                  {syncing ? "Syncing..." : t.labels.syncPending}
                </button>
              )}
            </div>
          ) : (
            <span className="text-emerald-800 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Live Synced
            </span>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === "en" ? "ta" : "en")}
            className="px-2 py-1 rounded border border-border bg-surface hover:bg-surface-subtle font-medium text-ink-primary transition-colors text-xs"
            title="Switch Language"
          >
            {lang === "en" ? "தமிழ் (Tamil)" : "English"}
          </button>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="role-select" className="text-ink-secondary">
              Role:
            </label>
            <select
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="py-1 px-2 rounded border border-border bg-surface text-ink-primary text-xs font-medium focus:ring-1 focus:ring-accent"
            >
              <option value="issue_clerk">Issue Clerk</option>
              <option value="finance_head">Finance Head</option>
              <option value="partner">Managing Partner</option>
              <option value="karigar">Karigar (Phone View)</option>
            </select>
          </div>

          <button
            onClick={resetData}
            title="Reset to sample data"
            className="text-ink-muted hover:text-ink-primary underline text-[11px]"
          >
            Reset Seed
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded bg-accent flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
                S
              </div>
              <div>
                <span className="font-serif font-semibold text-lg text-ink-primary tracking-tight block leading-tight">
                  SwarnaTrack
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleLinks.map((link) => {
                const isActive = router.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-accent-light text-accent-hover font-semibold"
                        : "text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Action for Issue Clerk */}
            {role === "issue_clerk" && (
              <Link
                href="/issue"
                className="hidden sm:inline-flex items-center justify-center px-3 py-1.5 rounded text-xs font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm"
              >
                + Issue Gold
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded border border-border text-ink-secondary hover:text-ink-primary focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-[#F5F2EA] px-4 pt-2 pb-4 space-y-1">
          {visibleLinks.map((link) => {
            const isActive = router.pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded text-base font-medium ${
                  isActive
                    ? "bg-accent-light text-accent-hover font-semibold"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

