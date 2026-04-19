"use client";
export const dynamic = "force-dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";
import { usePortfolio } from "@/context/PortfolioContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef, useMemo } from "react";
import { fmtCurrency, fmtDateTime } from "@/lib/utils";
import { ASSETS } from "@/lib/types";
import { toast } from "sonner";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { RefreshCw } from "lucide-react";
import { useLivePrices } from "@/hooks/useLivePrices";

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
  const { profile } = useAuth();
  const {
    totalBalance, availableBalance, investedFunds,
    todayChange, todayChangePercent,
    totalReturn, totalReturnPercent,
    positions, transactions, portfolioHistory,
    buyShares, sellShares, refreshData,
  } = usePortfolio();

  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState("");
  const [execType, setExecType] = useState("Market Price");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [flashClass, setFlashClass] = useState("");

  const { prices: livePrices } = useLivePrices(Object.keys(ASSETS));
  const asset = ASSETS[selectedTicker];
  const liveTick = livePrices[selectedTicker];
  const livePrice = liveTick?.price ?? asset?.price ?? 0;
  const estimatedTotal = qty ? (parseFloat(qty) || 0) * livePrice : 0;

  // Flash the price box when a live tick arrives
  const prevUpdatedAt = useRef(liveTick?.updatedAt ?? 0);
  useEffect(() => {
    const updated = liveTick?.updatedAt ?? 0;
    if (updated && updated !== prevUpdatedAt.current) {
      const cls = livePrice >= (liveTick?.prevPrice ?? livePrice)
        ? "price-flash-up"
        : "price-flash-down";
      setFlashClass(cls);
      const t = setTimeout(() => setFlashClass(""), 700);
      prevUpdatedAt.current = updated;
      return () => clearTimeout(t);
    }
  }, [liveTick?.updatedAt, livePrice, liveTick?.prevPrice]);

  // Stable bar chart data — regenerates only when ticker changes
  const contextBars = useMemo(
    () => Array.from({ length: 20 }, (_, i) => ({
      h: Math.max(15, 30 + Math.sin(i * 0.7 + Math.random()) * 20 + Math.random() * 25),
    })),
    [selectedTicker],
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleExecute = async () => {
    const amount = parseFloat(qty);
    if (!amount || amount <= 0) { toast.error("Enter a valid quantity"); return; }
    setLoading(true);
    const err = orderType === "buy"
      ? await buyShares(selectedTicker, amount)
      : await sellShares(selectedTicker, amount);
    setLoading(false);
    if (err) {
      toast.error(err);
    } else {
      toast.success(`${orderType === "buy" ? "Bought" : "Sold"} ${amount} ${selectedTicker}`);
      setQty("");
    }
  };

  const upChange = (todayChange ?? 0) >= 0;
  const chartStroke = upChange ? "var(--color-up)" : "var(--color-down)";

  // Live tick change display
  const tickChange = liveTick?.change ?? 0;
  const tickChangePct = liveTick?.changePercent ?? 0;
  const tickUp = tickChange >= 0;

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
                <div key={pos.ticker} onClick={() => setSelectedTicker(pos.ticker)}>
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

      {/* Order sidebar */}
      <aside className="px-4 py-6 md:px-10 md:py-8 border-t border-border lg:border-t-0">
        <div className="flex flex-col gap-6">
          <div className="metric-label">Place Order</div>

          {/* Buy/Sell toggle */}
          <div className="flex flex-col gap-2">
            <label className="metric-label">Transaction Type</label>
            <div className="grid grid-cols-2 gap-px bg-border border border-border">
              <button
                className={`gb-btn ${orderType === "buy" ? "gb-btn-primary" : ""}`}
                onClick={() => setOrderType("buy")}
              >
                Buy
              </button>
              <button
                className={`gb-btn ${orderType === "sell" ? "gb-btn-primary" : ""}`}
                onClick={() => setOrderType("sell")}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Asset selector */}
          <div className="flex flex-col gap-2">
            <label className="metric-label">Select Asset</label>
            <div className="relative">
              <select
                className="gb-select"
                value={selectedTicker}
                onChange={e => setSelectedTicker(e.target.value)}
              >
                {Object.entries(ASSETS).map(([ticker, info]) => (
                  <option key={ticker} value={ticker}>{ticker} — {info.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Live price with flash + change info */}
          {asset && (
            <div className={`border border-border p-3 transition-colors ${flashClass}`}>
              <div className="metric-label mb-1">Current Price</div>
              <div className="font-bold tabular text-lg">{fmtCurrency(livePrice)}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="metric-label">{asset.sector}</span>
                <span className={`text-[11px] tabular font-medium ${tickUp ? "text-up" : "text-down"}`}>
                  {tickUp ? "+" : ""}{tickChange.toFixed(2)} ({tickUp ? "+" : ""}{tickChangePct.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex flex-col gap-2">
            <label className="metric-label">Quantity (Shares)</label>
            <input
              className="gb-input"
              type="number"
              placeholder="0"
              min="0"
              step="0.001"
              value={qty}
              onChange={e => setQty(e.target.value)}
            />
            {estimatedTotal > 0 && (
              <span className="metric-label">≈ {fmtCurrency(estimatedTotal)}</span>
            )}
          </div>

          {/* Order type */}
          <div className="flex flex-col gap-2">
            <label className="metric-label">Order Type</label>
            <select
              className="gb-select"
              value={execType}
              onChange={e => setExecType(e.target.value)}
            >
              <option>Market Price</option>
              <option>Limit Order</option>
              <option>Stop Loss</option>
            </select>
          </div>

          <button
            className="gb-btn gb-btn-primary w-full"
            style={{ padding: "18px" }}
            onClick={handleExecute}
            disabled={loading}
          >
            {loading ? "Processing…" : `Execute ${orderType === "buy" ? "Buy" : "Sell"}`}
          </button>

          {/* Market context mini chart */}
          <div className="border-t border-border pt-6">
            <div className="metric-label mb-3">30D Context — {selectedTicker}</div>
            <div className="h-20 bg-muted flex items-end p-2 gap-0.5">
              {contextBars.map((bar, i) => (
                <div
                  key={i}
                  className="bg-foreground flex-1 opacity-70"
                  style={{ height: `${bar.h}%` }}
                />
              ))}
            </div>
            <p className="metric-label mt-2" style={{ fontSize: "10px", lineHeight: "1.5" }}>
              {asset?.name} — {asset?.sector} sector. All orders execute at best available market price.
            </p>
          </div>

          <div className="metric-label" style={{ fontSize: "10px", lineHeight: "1.5" }}>
            Brokerage services by Global Assets Clearing Corp. Investments involve risk. (Ref. GB-001)
          </div>
        </div>
      </aside>
    </div>
  );
}
