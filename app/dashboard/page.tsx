"use client";
export const dynamic = "force-dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";
import { usePortfolio } from "@/context/PortfolioContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useMemo } from "react";
import { fmtCurrency, fmtDateTime } from "@/lib/utils";
import { PLANS } from "@/lib/types";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { RefreshCw } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <Dashboard />
      </DashboardShell>
    </ProtectedRoute>
  );
}

const CRYPTO  = new Set(["BTC","ETH","SOL","BNB","XRP","ADA","AVAX","DOT","LINK","MATIC"]);
const ETFS    = new Set(["VOO","QQQ","SPY","IWM","GLD","VTI","TLT","HYG"]);
const FOREX   = new Set(["EURUSD","GBPUSD","USDJPY","AUDUSD","USDCAD","NZDUSD","USDCHF","EURGBP"]);

function assetClass(ticker: string) {
  if (CRYPTO.has(ticker))  return "Cryptocurrency";
  if (ETFS.has(ticker))    return "ETFs & Funds";
  if (FOREX.has(ticker) || ticker.includes("/")) return "Forex";
  return "Equities";
}

const CLASS_COLORS: Record<string, string> = {
  "Cryptocurrency":  "oklch(0.72 0.17 142)",
  "Equities":        "oklch(0.60 0.18 230)",
  "Forex":           "oklch(0.72 0.18 75)",
  "ETFs & Funds":    "oklch(0.65 0.16 300)",
  "Cash & Liquidity":"oklch(0.70 0.00 0)",
};

function Dashboard() {
  const {
    totalBalance, availableBalance,
    todayChange, todayChangePercent,
    totalReturn,
    positions, transactions, portfolioHistory,
    refreshData,
  } = usePortfolio();
  const { profile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const upChange = (todayChange ?? 0) >= 0;
  const chartStroke = upChange ? "var(--color-up)" : "var(--color-down)";

  const tierKey = profile?.tier ?? null;
  const plan = tierKey ? PLANS[tierKey] : null;

  /* ── Asset allocation grouped by class ── */
  const allocation = useMemo(() => {
    const groups: Record<string, number> = {};
    for (const pos of positions) {
      const cls = assetClass(pos.ticker);
      groups[cls] = (groups[cls] ?? 0) + pos.totalValue;
    }
    if (availableBalance > 0) groups["Cash & Liquidity"] = availableBalance;
    const total = Object.values(groups).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(groups)
      .map(([label, value]) => ({ label, value, pct: (value / total) * 100 }))
      .sort((a, b) => b.value - a.value);
  }, [positions, availableBalance]);

  const investedBalance = totalBalance - availableBalance;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] min-h-[calc(100vh-200px)]">

      {/* ── Main ── */}
      <section className="border-r border-border">

        {/* Hero metrics */}
        <div className="px-4 py-6 md:px-10 md:py-10 border-b border-border">
          {profile?.fullName && (
            <div className="mb-8 md:mb-10">
              <div className="text-[11px] uppercase tracking-[0.12em] font-medium mb-3" style={{ color: "var(--muted-foreground)" }}>
                {profile.fullName.split(" ")[0]}&apos;s Portfolio
              </div>
              <div className="text-[34px] md:text-[42px] font-bold tabular tracking-tight leading-none">
                {fmtCurrency(totalBalance)}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6 md:gap-10 mb-8 pt-6 border-t border-border">
            <div>
              <div className="metric-label mb-3">Invested</div>
              <div className="metric-value tabular">{fmtCurrency(investedBalance)}</div>
            </div>
            <div>
              <div className="metric-label mb-3">Today&apos;s Change</div>
              <div className={`metric-value tabular ${upChange ? "text-up" : "text-down"}`}>
                {upChange ? "+" : ""}{todayChangePercent.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="metric-label mb-3">Total Return</div>
              <div className={`metric-value tabular ${totalReturn >= 0 ? "text-up" : "text-down"}`}>
                {totalReturn >= 0 ? "+" : ""}{fmtCurrency(totalReturn)}
              </div>
            </div>
          </div>

          {/* Performance chart */}
          {portfolioHistory.length > 0 ? (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioHistory.slice(-60)}>
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={chartStroke} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={chartStroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <Tooltip
                    contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 0, fontSize: 11 }}
                    formatter={(v: unknown) => [fmtCurrency(Number(v)), "Portfolio Value"]}
                    labelFormatter={(l) => l}
                  />
                  <Area type="monotone" dataKey="value" stroke={chartStroke} strokeWidth={1.5} fill="url(#chartFill)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center border border-dashed border-border">
              <p className="metric-label">Performance chart will appear once your portfolio is active</p>
            </div>
          )}
        </div>

        {/* Asset allocation */}
        <div>
          <div className="section-header flex items-center justify-between">
            <span>Portfolio Allocation</span>
            <button
              onClick={handleRefresh}
              className="gb-btn"
              style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: 4 }}
              disabled={refreshing}
            >
              <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>

          {allocation.length === 0 ? (
            <div className="px-4 py-8 md:px-10 flex flex-col gap-2">
              <p className="metric-label">No allocation data yet.</p>
              <p className="text-[12px] text-muted-foreground leading-relaxed max-w-sm">
                Your portfolio allocation will be displayed here once your account officer begins managing your investments.
              </p>
            </div>
          ) : (
            <div className="px-4 py-6 md:px-10 flex flex-col gap-6">
              {allocation.map(({ label, value, pct }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-1.5 h-1.5 shrink-0 rounded-full"
                        style={{ background: CLASS_COLORS[label] ?? "var(--foreground)" }}
                      />
                      <span className="text-[11px] uppercase tracking-[0.1em] font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="tabular text-[12px]" style={{ color: "var(--muted-foreground)" }}>{fmtCurrency(value)}</span>
                      <span className="tabular text-[13px] font-bold w-10 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-[3px] w-full rounded-sm" style={{ background: "var(--border)" }}>
                    <div
                      className="h-full rounded-sm transition-all duration-700"
                      style={{ width: `${pct}%`, background: CLASS_COLORS[label] ?? "var(--foreground)" }}
                    />
                  </div>
                </div>
              ))}

              {/* Stacked colour bar */}
              <div className="flex h-[3px] w-full overflow-hidden mt-1">
                {allocation.map(({ label, pct }) => (
                  <div
                    key={label}
                    style={{ width: `${pct}%`, background: CLASS_COLORS[label] ?? "var(--foreground)" }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="border-t border-border">
          <div className="section-header flex justify-between items-center">
            <span>Recent Activity</span>
            <Link href="/history" className="nav-link">View All →</Link>
          </div>
          <div>
            <div className="gb-row-header grid" style={{ gridTemplateColumns: "60px 1fr 110px" }}>
              <div>Type</div>
              <div>Details</div>
              <div className="text-right">Amount</div>
            </div>
            {transactions.length === 0 ? (
              <div className="gb-row" style={{ cursor: "default" }}>
                <p className="metric-label">No transactions yet.</p>
              </div>
            ) : transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="gb-row grid" style={{ gridTemplateColumns: "60px 1fr 110px", cursor: "default" }}>
                <div className={`uppercase font-bold text-[11px] ${tx.type === "buy" ? "text-up" : tx.type === "sell" ? "text-down" : ""}`}>
                  {tx.type}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {tx.ticker ? `${tx.ticker} — ${tx.assetName}` : "Funds Transfer"}
                  <span className="block md:inline ml-0 md:ml-2 text-[10px]">{fmtDateTime(tx.createdAt)}</span>
                </div>
                <div className="text-right tabular text-[12px] font-medium">{fmtCurrency(tx.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sidebar ── */}
      <aside className="px-4 py-6 md:px-8 md:py-8 border-t border-border lg:border-t-0 flex flex-col gap-6">

          {plan ? (
            <>
              <div className="border border-border p-6" style={{ background: "var(--foreground)", color: "var(--background)" }}>
                <div className="text-[10px] uppercase tracking-[0.15em] font-semibold mb-3" style={{ opacity: 0.45 }}>Active Plan</div>
                <div className="text-[26px] font-bold uppercase tracking-tight leading-none mb-6">{plan.name}</div>
                <div className="flex flex-col gap-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.12em] font-medium mb-1.5" style={{ opacity: 0.45 }}>Target Return</div>
                    <div className="tabular font-bold text-[24px] leading-none">Up to {plan.maxReturn}%</div>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.12em] font-medium mb-1" style={{ opacity: 0.45 }}>Min. Investment</div>
                      <div className="tabular font-semibold text-[13px]">{fmtCurrency(plan.minDeposit)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.12em] font-medium mb-1" style={{ opacity: 0.45 }}>Reporting</div>
                      <div className="font-semibold text-[13px]">{plan.reporting}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  "All trades executed by Global Assets",
                  "Real-time portfolio tracking",
                  "Diversified across asset classes",
                  "KYC & compliance included",
                ].map(f => (
                  <div key={f} className="flex items-start gap-3">
                    <span className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>—</span>
                    <span className="text-[11px] leading-snug">{f}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="border border-border p-6 flex flex-col gap-4">
              <div className="metric-label">No plan assigned yet.</div>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                Your account officer will assign your investment plan after your KYC and initial deposit are confirmed.
              </p>
              <Link href="/plans" className="gb-btn gb-btn-primary w-full" style={{ textDecoration: "none", padding: "14px", fontSize: "11px", display: "block", textAlign: "center" }}>
                View Plans →
              </Link>
            </div>
          )}

          {/* Available cash */}
          <div className="border border-border p-5 flex flex-col gap-2">
            <div className="metric-label">Available Cash</div>
            <div className="text-[26px] font-bold tabular leading-none tracking-tight">{fmtCurrency(availableBalance)}</div>
            <p className="text-[11px] leading-snug" style={{ color: "var(--muted-foreground)" }}>Uninvested balance ready for deployment.</p>
            <Link href="/funds" className="gb-btn mt-2 text-center" style={{ textDecoration: "none", padding: "10px", fontSize: "11px", display: "block" }}>
              Manage Funds →
            </Link>
          </div>

          <p className="text-[10px] leading-relaxed" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>
            All investments managed by Global Assets Clearing Corp. Investments involve risk. (Ref. GB-001)
          </p>
      </aside>
    </div>
  );
}
