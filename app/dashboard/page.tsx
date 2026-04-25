"use client";
export const dynamic = "force-dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";
import { usePortfolio } from "@/context/PortfolioContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-[calc(100vh-200px)]">
      {/* Main content */}
      <section className="border-r border-border">
        {/* Hero metrics */}
        <div className="px-4 py-6 md:px-10 md:py-10 border-b border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 mb-6 md:mb-8">
            <div>
              <div className="metric-label mb-2">Total Equity</div>
              <div className="metric-value tabular">{fmtCurrency(totalBalance)}</div>
            </div>
            <div>
              <div className="metric-label mb-2">Available Cash</div>
              <div className="metric-value tabular">{fmtCurrency(availableBalance)}</div>
            </div>
            <div>
              <div className="metric-label mb-2">Today&apos;s Change</div>
              <div className={`metric-value tabular ${upChange ? "text-up" : "text-down"}`}>
                {upChange ? "+" : ""}{todayChangePercent.toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="metric-label mb-2">Total Return</div>
              <div className={`metric-value tabular ${totalReturn >= 0 ? "text-up" : "text-down"}`}>
                {totalReturn >= 0 ? "+" : ""}{fmtCurrency(totalReturn)}
              </div>
            </div>
          </div>
          {/* Mini portfolio chart — coloured by direction */}
          {portfolioHistory.length > 0 && (
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioHistory.slice(-30)}>
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={chartStroke} stopOpacity={0.12} />
                      <stop offset="95%" stopColor={chartStroke} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <Tooltip
                    contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 0, fontSize: 11 }}
                    formatter={(v: unknown) => fmtCurrency(Number(v))}
                    labelFormatter={() => ""}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartStroke}
                    strokeWidth={1.5}
                    fill="url(#chartFill)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Holdings table */}
        <div className="section-header flex justify-between items-center">
          <span>Holdings ({positions.length})</span>
          <div className="flex items-center gap-3">
            <span className="metric-label">Sorted by Value</span>
            <button
              onClick={handleRefresh}
              className="gb-btn p-1"
              style={{ padding: "4px 6px", display: "flex", alignItems: "center" }}
              disabled={refreshing}
              aria-label="Refresh"
            >
              <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div>
          {/* Desktop header */}
          <div className="gb-row-header hidden md:grid" style={{ gridTemplateColumns: "100px 1fr 110px 130px 140px" }}>
            <div>Symbol</div>
            <div>Asset Name</div>
            <div className="text-right">Shares</div>
            <div className="text-right">Market Value</div>
            <div className="text-right">P&amp;L</div>
          </div>
          {/* Mobile header */}
          <div className="gb-row-header grid md:hidden" style={{ gridTemplateColumns: "60px 1fr 120px" }}>
            <div>Sym</div>
            <div>Value</div>
            <div className="text-right">P&amp;L</div>
          </div>

          {positions.length === 0 ? (
            <div className="gb-row" style={{ cursor: "default" }}>
              <p className="metric-label">No holdings yet. Place your first order to get started.</p>
            </div>
          ) : (
            [...positions]
              .sort((a, b) => b.totalValue - a.totalValue)
              .map(pos => (
                <div key={pos.ticker}>
                  {/* Desktop row */}
                  <div
                    className="gb-row hidden md:grid"
                    style={{ gridTemplateColumns: "100px 1fr 110px 130px 140px" }}
                  >
                    <div className="font-bold uppercase text-[12px]">{pos.ticker}</div>
                    <div className="text-[12px]">{pos.assetName}</div>
                    <div className="text-right tabular text-[12px]">{pos.shares.toLocaleString()}</div>
                    <div className="text-right tabular text-[12px]">{fmtCurrency(pos.totalValue)}</div>
                    <div className={`text-right tabular text-[12px] ${pos.pnl >= 0 ? "text-up" : "text-down"}`}>
                      <span>{pos.pnl >= 0 ? "+" : ""}{fmtCurrency(pos.pnl)}</span>
                      <span className="block text-[10px] opacity-80">
                        {pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  {/* Mobile row */}
                  <div
                    className="gb-row grid md:hidden"
                    style={{ gridTemplateColumns: "60px 1fr 120px" }}
                  >
                    <div className="font-bold uppercase text-[12px]">{pos.ticker}</div>
                    <div className="tabular text-[12px]">{fmtCurrency(pos.totalValue)}</div>
                    <div className={`text-right tabular text-[12px] ${pos.pnl >= 0 ? "text-up" : "text-down"}`}>
                      <span>{pos.pnl >= 0 ? "+" : ""}{fmtCurrency(pos.pnl)}</span>
                      <span className="block text-[10px] opacity-80">
                        {pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Recent transactions */}
        <div className="section-header flex justify-between items-center mt-0 border-t border-border">
          <span>Recent Activity</span>
          <a href="/history" className="nav-link">View All →</a>
        </div>
        <div>
          <div className="gb-row-header grid" style={{ gridTemplateColumns: "60px 1fr 100px" }}>
            <div>Type</div>
            <div>Details</div>
            <div className="text-right">Amount</div>
          </div>
          {transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="gb-row grid" style={{ gridTemplateColumns: "60px 1fr 100px", cursor: "default" }}>
              <div className={`uppercase font-bold text-[11px] ${tx.type === "buy" ? "text-up" : tx.type === "sell" ? "text-down" : ""}`}>
                {tx.type}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {tx.ticker ? `${tx.ticker} — ${tx.assetName}` : "Funds Transfer"}
                <span className="block md:inline ml-0 md:ml-2 text-[10px]">{fmtDateTime(tx.createdAt)}</span>
              </div>
              <div className="text-right tabular text-[11px]">{fmtCurrency(tx.amount)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Your Plan sidebar */}
      <aside className="px-4 py-6 md:px-10 md:py-8 border-t border-border lg:border-t-0">
        <div className="flex flex-col gap-6">
          <div className="metric-label">Your Investment Plan</div>

          {plan ? (
            <>
              {/* Plan badge */}
              <div className="border border-border p-6" style={{ background: "var(--foreground)", color: "var(--background)" }}>
                <div className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-2" style={{ opacity: 0.5 }}>
                  Active Plan
                </div>
                <div className="text-2xl font-bold uppercase tracking-tight mb-5">{plan.name}</div>
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ opacity: 0.5 }}>Min. Investment</div>
                    <div className="tabular font-bold text-[18px]">{fmtCurrency(plan.minDeposit)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ opacity: 0.5 }}>Target Return</div>
                    <div className="tabular font-bold text-[22px]">Up to {plan.maxReturn}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ opacity: 0.5 }}>Asset Coverage</div>
                    <div className="text-[12px] font-semibold">All Asset Classes</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ opacity: 0.5 }}>Reporting</div>
                    <div className="text-[12px] font-semibold">{plan.reporting}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border border-border p-4">
                {[
                  "All trades executed by Global Assets",
                  "Real-time portfolio tracking",
                  "Admin-managed diversification",
                  "KYC & compliance included",
                ].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <span className="metric-label">—</span>
                    <span className="text-[11px]">{f}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="border border-border p-6 flex flex-col gap-4">
              <div className="metric-label">No plan assigned yet.</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your account officer will assign your investment plan after your KYC and
                initial deposit are confirmed. Contact support if you have questions.
              </p>
              <Link href="/plans" className="gb-btn gb-btn-primary w-full text-center" style={{ textDecoration: "none", padding: "14px", fontSize: "11px", display: "block", textAlign: "center" }}>
                View Plans →
              </Link>
            </div>
          )}

          <div className="metric-label" style={{ fontSize: "10px", lineHeight: "1.5" }}>
            All investments managed by Global Assets Clearing Corp. Investments involve risk. (Ref. GB-001)
          </div>
        </div>
      </aside>
    </div>
  );
}
