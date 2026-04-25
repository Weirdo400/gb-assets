"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { PLANS } from "@/lib/types";
import { fmtCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import PublicNav from "@/components/PublicNav";

const PLAN_FEATURES = [
  "All asset classes",
  "Real-time portfolio tracking",
  "Admin-managed trading",
  "KYC & compliance support",
  "Dedicated client portal",
];

export default function PlansPage() {
  const plans = Object.entries(PLANS);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gb-theme");
    setDark(stored !== "light");
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("gb-theme", next ? "dark" : "light");
  };

  return (
    <div className="plans-bg min-h-screen text-foreground">

      <PublicNav dark={dark} toggleTheme={toggleTheme} />

      {/* Hero */}
      <section className="px-6 md:px-12 py-16 border-b border-border">
        <div className="metric-label mb-4 tracking-[0.2em]">Investment Plans</div>
        <h1 className="font-bold uppercase tracking-tight leading-none mb-6" style={{ fontSize: "clamp(40px, 7vw, 96px)", letterSpacing: "-0.03em" }}>
          Choose Your<br />Plan.
        </h1>
        <p className="text-muted-foreground max-w-xl leading-relaxed" style={{ fontSize: "14px" }}>
          Global Assets manages your portfolio across all asset classes — stocks, ETFs, crypto,
          forex, and commodities. Select the plan that matches your investment goals.
        </p>
      </section>

      {/* Plans grid */}
      <section className="px-6 md:px-12 py-16 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
          {plans.map(([key, plan], i) => {
            const isElite = key === "elite";
            return (
              <div
                key={key}
                className="flex flex-col p-8 md:p-10 border-b md:border-b-0 md:border-r border-border last:border-0"
                style={isElite ? { background: "var(--foreground)", color: "var(--background)" } : undefined}
              >
                <div className="mb-8">
                  <div
                    className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-3"
                    style={{ opacity: isElite ? 0.6 : undefined, color: isElite ? "var(--background)" : "var(--muted-foreground)" }}
                  >
                    Tier {i + 1}
                  </div>
                  <div className="text-2xl font-bold uppercase tracking-tight mb-6">{plan.name}</div>

                  <div className="mb-6">
                    <div
                      className="text-[10px] uppercase tracking-widest font-medium mb-1"
                      style={{ opacity: 0.6, color: isElite ? "var(--background)" : undefined }}
                    >
                      Minimum Investment
                    </div>
                    <div className="text-3xl font-bold tabular">{fmtCurrency(plan.minDeposit)}</div>
                    <div className="text-[11px] mt-1 tabular" style={{ opacity: 0.5 }}>{plan.range}</div>
                  </div>

                  <div className="mb-8">
                    <div
                      className="text-[10px] uppercase tracking-widest font-medium mb-1"
                      style={{ opacity: 0.6, color: isElite ? "var(--background)" : undefined }}
                    >
                      Target Return
                    </div>
                    <div className="text-4xl font-bold tabular" style={{ color: isElite ? "var(--background)" : "var(--color-up)" }}>
                      Up to {plan.maxReturn}%
                    </div>
                  </div>

                  <div className="mb-6">
                    <div
                      className="text-[10px] uppercase tracking-widest font-medium mb-1"
                      style={{ opacity: 0.6, color: isElite ? "var(--background)" : undefined }}
                    >
                      Reporting
                    </div>
                    <div className="text-sm font-semibold uppercase tracking-wide">{plan.reporting}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-10 flex-1">
                  {PLAN_FEATURES.map(f => (
                    <div key={f} className="flex items-center gap-3">
                      <span className="text-[10px]" style={{ opacity: 0.4 }}>—</span>
                      <span className="text-[12px]" style={{ opacity: isElite ? 0.85 : undefined }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/register"
                  className="gb-btn w-full text-center"
                  style={{
                    textDecoration: "none",
                    padding: "16px",
                    fontSize: "11px",
                    background: isElite ? "var(--background)" : "var(--foreground)",
                    color: isElite ? "var(--foreground)" : "var(--background)",
                    borderColor: isElite ? "var(--background)" : "var(--foreground)",
                    display: "block",
                    textAlign: "center",
                  }}
                >
                  Apply Now →
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-6 md:px-12 py-10 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Managed Trading", desc: "All trades are executed by Global Assets on your behalf. You do not place orders directly." },
            { label: "All Asset Classes", desc: "Stocks, ETFs, crypto, forex, and commodities — full diversification across global markets." },
            { label: "Risk Disclosure", desc: "All investments involve risk. Past performance does not guarantee future results. Capital may be at risk." },
          ].map(({ label, desc }) => (
            <div key={label}>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-2">{label}</div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="font-bold uppercase tracking-tight text-sm">Global Assets</div>
        <div className="metric-label text-[10px]">© {new Date().getFullYear()} Global Assets Clearing Corp. All investments involve risk.</div>
      </footer>
    </div>
  );
}
