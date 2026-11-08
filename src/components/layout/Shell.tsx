import React from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "./Navbar";
import { useApp } from "@/context/AppContext";

interface ShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Shell({ children, title, subtitle, actions }: ShellProps) {
  const { t } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-page text-ink-primary">
      <Head>
        <title>{title ? `${title} | SwarnaTrack` : "SwarnaTrack - Coimbatore Gold Custody"}</title>
        <meta
          name="description"
          content="Workshop Gold Custody, Wastage Control & Anomaly Detection for Company A, Coimbatore"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Navbar />

      {/* Header section if title provided */}
      {title && (
        <div className="border-b border-border bg-[#F8F6F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-serif font-bold text-ink-primary tracking-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-ink-secondary leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-[#FAF8F3] py-6 text-xs text-ink-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-medium text-ink-primary">
              Company A • Coimbatore Jewellery Chain (5 Showrooms, Workshop)
            </p>
            <p className="text-ink-muted mt-0.5">
              Governed by Bureau of Indian Standards (BIS) Hallmarking & Income Tax Section 269ST / Rule 114B
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-ink-primary underline underline-offset-2">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-ink-primary underline underline-offset-2">
              Privacy Policy
            </Link>
            <span className="text-border-strong">•</span>
            <span className="font-mono text-[11px] text-ink-muted">v1.0.4-coimbatore</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

