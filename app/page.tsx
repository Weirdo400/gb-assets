"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLivePrices } from "@/hooks/useLivePrices";
import { fmtCurrency } from "@/lib/utils";

const STRIP_TICKERS = ["BTC", "ETH", "AAPL", "NVDA", "MSFT", "TSLA", "SOL", "GOOGL", "META", "AMZN", "VOO", "BNB", "JPM", "NFLX", "GS", "AVAX", "SPY", "QQQ"];


const MARQUEE_ITEMS = [
  "Stocks", "ETFs", "Crypto", "Forex", "Commodities",
  "Real-Time Execution", "Portfolio Analytics", "KYC Compliant",
  "Admin-Managed Accounts", "Live WebSocket Prices", "Institutional Grade",
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const demoTaps = useRef(0);
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { prices, connected } = useLivePrices(STRIP_TICKERS);
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const handleDemoTap = () => {
    demoTaps.current += 1;
    if (demoTimer.current) clearTimeout(demoTimer.current);
    demoTimer.current = setTimeout(() => { demoTaps.current = 0; }, 2000);
    if (demoTaps.current >= 5) {
      demoTaps.current = 0;
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { enableDemo } = require("@/lib/demo-data");
      enableDemo();
      window.location.href = "/dashboard";
    }
  };

  if (loading || user) return null;

  return (
    <div className="home-bg min-h-screen flex flex-col text-foreground overflow-x-hidden">

      {/* Top bar */}
      <div className="px-6 md:px-12 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="metric-label tabular">{time}</span>
          <span className="metric-label">|</span>
          <span className="metric-label flex items-center gap-1.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${connected ? "bg-foreground" : "bg-muted-foreground"}`} style={{ borderRadius: 0 }} />
            {connected ? "Markets Open" : "Connecting…"}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login" className="nav-link">Sign In</Link>
          <Link href="/register" className="gb-btn gb-btn-primary text-[10px] py-1.5 px-4" style={{ textDecoration: "none" }}>Open Account</Link>
        </div>
      </div>

      {/* Scrolling ticker */}
      <div className="border-b border-border overflow-hidden py-2.5 bg-foreground text-background">
        <div
          className="flex gap-10 whitespace-nowrap"
          style={{
            animation: "ticker-scroll 40s linear infinite",
            width: "max-content",
          }}
        >
          {[...STRIP_TICKERS, ...STRIP_TICKERS].map((t, i) => {
            const p = prices[t];
            const change = p?.changePercent ?? 0;
            return (
              <span key={i} className="inline-flex items-center gap-2 text-[11px]">
                <span className="font-bold tracking-wide">{t}</span>
                <span className="tabular opacity-80">{fmtCurrency(p?.price ?? 0)}</span>
                <span className={`tabular text-[10px] ${change >= 0 ? "opacity-60" : "opacity-40 line-through"}`}>
                  {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-16 pb-0 border-b border-border grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0">
        <div className="lg:border-r border-border lg:pr-12 pb-12">
          <div className="metric-label mb-8 tracking-[0.2em]">EST. 2019 — CLEARING CORP.</div>
          <h1
            className="font-bold uppercase tracking-tight leading-none mb-10"
            style={{ fontSize: "clamp(52px, 9vw, 120px)", letterSpacing: "-0.03em" }}
          >
            Global<br />Assets.
          </h1>
          <p className="text-base text-muted-foreground mb-10 max-w-lg leading-relaxed" style={{ fontSize: "14px" }}>
            Institutional-grade investment infrastructure. Trade stocks, ETFs, and digital
            assets with real-time execution, full portfolio analytics, and admin-managed
            account options for qualified investors worldwide.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/register" className="gb-btn gb-btn-primary" style={{ textDecoration: "none", padding: "14px 28px", fontSize: "11px" }}>
              Open Account →
            </Link>
            <Link href="/login" className="gb-btn" style={{ textDecoration: "none", padding: "14px 28px", fontSize: "11px" }}>
              Sign In
            </Link>
          </div>
        </div>

        {/* Live price panel */}
        <div className="lg:pl-10 pb-12 hidden lg:block">
          <div className="metric-label mb-4">Live Prices</div>
          <div className="flex flex-col gap-0">
            {STRIP_TICKERS.slice(0, 10).map(t => {
              const p = prices[t];
              const change = p?.changePercent ?? 0;
              return (
                <div key={t} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <span className="font-bold text-[11px] uppercase w-14">{t}</span>
                  <span className="tabular text-[12px] font-medium">{fmtCurrency(p?.price ?? 0)}</span>
                  <span className={`tabular text-[11px] w-16 text-right ${change >= 0 ? "" : "underline"}`}>
                    {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <div className="border-b border-border overflow-hidden py-3">
        <div
          className="flex gap-12 whitespace-nowrap"
          style={{ animation: "ticker-scroll 30s linear infinite reverse", width: "max-content" }}
        >
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="metric-label tracking-[0.15em] inline-flex items-center gap-12">
              {item}
              <span className="inline-block w-1 h-1 bg-foreground opacity-30" />
            </span>
          ))}
        </div>
      </div>

      {/* Two-column feature */}
      <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-border">
        <div className="px-6 md:px-12 py-16 lg:border-r border-border">
          <div className="metric-label mb-6">Portfolio Management</div>
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight leading-tight mb-6">
            Every Position.<br />Every Movement.<br />In Real Time.
          </h2>
          <p className="text-muted-foreground text-[13px] leading-relaxed mb-8 max-w-sm">
            Track P&L, monitor allocations, and view 90-day historical performance
            across all your holdings from a single dashboard.
          </p>
          <div className="flex flex-col gap-0 border border-border">
            {[
              ["Portfolio Value", "$158,420.88"],
              ["Today's P/L", "+$1,842.33"],
              ["Total Return", "+$22,140.88"],
              ["Open Positions", "8"],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0">
                <span className="metric-label">{label}</span>
                <span className="tabular text-[12px] font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 md:px-12 py-16">
          <div className="metric-label mb-6">Asset Coverage</div>
          <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight leading-tight mb-6">
            50+ Instruments<br />Across 9<br />Asset Classes.
          </h2>
          <p className="text-muted-foreground text-[13px] leading-relaxed mb-8 max-w-sm">
            From blue-chip stocks and S&P 500 ETFs to Bitcoin and DeFi tokens —
            all in one account with live WebSocket pricing.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Technology", "Finance", "Healthcare", "Energy", "Consumer", "Automotive", "Media", "ETFs", "Crypto"].map(s => (
              <div key={s} className="border border-border px-4 py-2 text-[10px] uppercase font-semibold tracking-widest">{s}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width CTA */}
      <section className="px-6 md:px-12 py-24 border-b border-border flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div>
          <div className="metric-label mb-4">Qualified Investors Only</div>
          <h2 className="font-bold uppercase tracking-tight leading-none" style={{ fontSize: "clamp(36px, 6vw, 80px)", letterSpacing: "-0.03em" }}>
            Apply for<br />Access.
          </h2>
        </div>
        <div className="flex flex-col items-start md:items-end gap-4">
          <p className="text-muted-foreground text-[13px] leading-relaxed max-w-xs md:text-right">
            Complete our onboarding in minutes. KYC verification, account funding,
            and full platform access within 24 hours.
          </p>
          <Link href="/register" className="gb-btn gb-btn-primary" style={{ textDecoration: "none", padding: "16px 36px", fontSize: "12px" }}>
            Begin Application →
          </Link>
        </div>
      </section>

      {/* Compliance strip */}
      <section className="px-6 md:px-12 py-8 border-b border-border grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "KYC / AML", desc: "Full identity verification and anti-money laundering compliance built into onboarding." },
          { label: "Segregated Funds", desc: "Client funds held separately from operational accounts at all times." },
          { label: "Encrypted Infrastructure", desc: "End-to-end encryption on all data. Firebase-backed with role-based access control." },
        ].map(({ label, desc }) => (
          <div key={label} className="flex flex-col gap-2">
            <div className="font-bold uppercase text-[11px] tracking-widest">{label}</div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">{desc}</div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="font-bold uppercase tracking-tight text-sm">Global Assets</div>
        <div className="flex gap-6 items-center">
          <Link href="/login" className="nav-link">Client Portal</Link>
          <Link href="/register" className="nav-link">Register</Link>
        </div>
        <div className="metric-label text-[10px]" onClick={handleDemoTap} style={{ cursor: "default", userSelect: "none" }}>
          © {new Date().getFullYear()} Global Assets Clearing Corp. All investments involve risk.
        </div>
      </footer>

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
