"use client";
export const dynamic = "force-dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";
import { usePortfolio } from "@/context/PortfolioContext";
import { fmtCurrency } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <Analytics />
      </DashboardShell>
    </ProtectedRoute>
  );
}

const GRAYS = ["#000", "#333", "#555", "#777", "#999", "#bbb", "#ddd", "#eee"];

function Analytics() {
  const {
    totalBalance, availableBalance, investedFunds,
    totalReturn, totalReturnPercent, profitLossPercent,
    positions, portfolioHistory, transactions,
  } = usePortfolio();

  const allocationData = positions.map(p => ({
    name: p.ticker,
    value: p.totalValue,
    pct: totalBalance > 0 ? (p.totalValue / totalBalance) * 100 : 0,
  }));

  const cashAlloc = { name: "CASH", value: availableBalance, pct: totalBalance > 0 ? (availableBalance / totalBalance) * 100 : 0 };
  const pieData = [...allocationData, cashAlloc].filter(d => d.value > 0);

  const monthlyVolume = (() => {
    const map: Record<string, number> = {};
    transactions.forEach(tx => {
      const d = new Date(tx.createdAt);
      const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      map[key] = (map[key] || 0) + tx.amount;
    });
    return Object.entries(map).slice(-6).map(([date, volume]) => ({ date, volume }));
  })();

  const winRate = (() => {
    const trades = transactions.filter(t => (t.type === "buy" || t.type === "sell") && t.status === "completed");
    if (!trades.length) return 0;
    const sells = trades.filter(t => t.type === "sell");
    return sells.length > 0 ? Math.round((sells.length / trades.length) * 100) : 0;
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      {/* Portfolio performance */}
      <div className="border-b border-r border-border p-10">
        <div className="metric-label mb-2">Portfolio Performance (90D)</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioHistory}>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={14} />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 0, fontSize: 10 }}
                formatter={(v: unknown) => [fmtCurrency(Number(v)), "Equity"]}
              />
              <Area type="monotone" dataKey="value" stroke="currentColor" strokeWidth={1.5} fill="transparent" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Allocation pie */}
      <div className="border-b border-border p-10">
        <div className="metric-label mb-2">Asset Allocation</div>
        {pieData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} strokeWidth={1} stroke="var(--background)">
                  {pieData.map((_, i) => <Cell key={i} fill={GRAYS[i % GRAYS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 0, fontSize: 10 }}
                  formatter={(v: unknown, name: unknown) => [`${fmtCurrency(Number(v))} (${pieData.find(d => d.name === name)?.pct.toFixed(1)}%)`, name as string]}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center metric-label">No positions yet</div>
        )}
      </div>

      {/* Key metrics */}
      <div className="border-b border-r border-border p-10">
        <div className="metric-label mb-6">Key Metrics</div>
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: "Total Return", value: `${totalReturn >= 0 ? "+" : ""}${fmtCurrency(totalReturn)}` },
            { label: "Return %", value: `${totalReturn >= 0 ? "+" : ""}${totalReturnPercent.toFixed(2)}%` },
            { label: "Today's P/L %", value: `${profitLossPercent >= 0 ? "+" : ""}${profitLossPercent.toFixed(2)}%` },
            { label: "Positions", value: positions.length.toString() },
            { label: "Win Rate", value: `${winRate}%` },
            { label: "Total Trades", value: transactions.filter(t => t.type === "buy" || t.type === "sell").length.toString() },
          ].map(m => (
            <div key={m.label}>
              <div className="metric-label mb-1">{m.label}</div>
              <div className="text-xl font-bold tabular">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly trading volume */}
      <div className="border-b border-border p-10">
        <div className="metric-label mb-2">Monthly Volume (USD)</div>
        {monthlyVolume.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyVolume}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 0, fontSize: 10 }}
                  formatter={(v: unknown) => [fmtCurrency(Number(v)), "Volume"]}
                />
                <Bar dataKey="volume" fill="currentColor" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center metric-label">No trade history</div>
        )}
      </div>

      {/* Top performers */}
      <div className="border-r border-border p-10 col-span-full lg:col-span-2">
        <div className="metric-label mb-4">Position Performance</div>
        <div className="gb-row-header grid" style={{ gridTemplateColumns: "80px 1fr 120px 120px 120px" }}>
          <div>Symbol</div>
          <div>Asset</div>
          <div className="text-right">Shares</div>
          <div className="text-right">Value</div>
          <div className="text-right">P&L</div>
        </div>
        {positions.length === 0 ? (
          <div className="gb-row" style={{ cursor: "default" }}>
            <span className="metric-label">No open positions</span>
          </div>
        ) : (
          [...positions].sort((a, b) => b.pnl - a.pnl).map(p => (
            <div
              key={p.ticker}
              className="gb-row grid"
              style={{ gridTemplateColumns: "80px 1fr 120px 120px 120px", cursor: "default" }}
            >
              <div className="font-bold uppercase text-[12px]">{p.ticker}</div>
              <div className="text-[12px]">{p.assetName}</div>
              <div className="text-right tabular text-[12px]">{p.shares}</div>
              <div className="text-right tabular text-[12px]">{fmtCurrency(p.totalValue)}</div>
              <div className={`text-right tabular text-[12px] ${p.pnl >= 0 ? "" : "underline"}`}>
                {p.pnl >= 0 ? "+" : ""}{fmtCurrency(p.pnl)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
