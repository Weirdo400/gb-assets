"use client";
export const dynamic = "force-dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";
import { usePortfolio } from "@/context/PortfolioContext";
import { ASSETS } from "@/lib/types";
import { fmtCurrency } from "@/lib/utils";
import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useLivePrices } from "@/hooks/useLivePrices";

export default function WatchlistPage() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <Watchlist />
      </DashboardShell>
    </ProtectedRoute>
  );
}

function Watchlist() {
  const { watchlist, removeFromWatchlist } = usePortfolio();
  const tickers = useMemo(() => watchlist.map(w => w.ticker), [watchlist]);
  const { prices } = useLivePrices(tickers);

  const rows = useMemo(() => {
    return watchlist.map(w => {
      const info = ASSETS[w.ticker];
      if (!info) return null;
      const live = prices[w.ticker];
      const price = live?.price ?? info.price;
      const change = live?.changePercent ?? 0;
      return { ...w, ...info, price, change };
    }).filter(Boolean) as (typeof watchlist[0] & { price: number; change: number; name: string; sector: string })[];
  }, [watchlist, prices]);

  const handleRemove = async (ticker: string) => {
    try {
      await removeFromWatchlist(ticker);
      toast.success(`Removed ${ticker}`);
    } catch {
      toast.error("Failed to remove — check Firestore rules");
    }
  };

  return (
    <div>
      <div className="px-10 py-8 border-b border-border">
        <div className="metric-label mb-1">Watchlist</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">{rows.length} Instruments Tracked</h1>
      </div>

      {rows.length === 0 ? (
        <div className="px-10 py-12 text-center">
          <p className="metric-label mb-4">Your watchlist is empty.</p>
          <Link href="/market" className="gb-btn gb-btn-primary" style={{ display: "inline-block", padding: "12px 24px" }}>
            Browse Market
          </Link>
        </div>
      ) : (
        <>
          <div className="gb-row-header grid" style={{ gridTemplateColumns: "90px 1fr 80px 120px 100px 40px" }}>
            <div>Symbol</div>
            <div>Name</div>
            <div>Sector</div>
            <div className="text-right">Price</div>
            <div className="text-right">24H Change</div>
            <div />
          </div>
          {rows.map(row => (
            <div
              key={row.ticker}
              className="gb-row grid items-center"
              style={{ gridTemplateColumns: "90px 1fr 80px 120px 100px 40px" }}
            >
              <div className="font-bold uppercase text-[12px]">{row.ticker}</div>
              <div className="text-[12px]">{row.name}</div>
              <div className="metric-label text-[10px]">{row.sector}</div>
              <div className="text-right tabular font-bold text-[12px]">{fmtCurrency(row.price)}</div>
              <div className={`text-right tabular text-[12px] ${row.change >= 0 ? "" : "underline"}`}>
                {row.change >= 0 ? "+" : ""}{row.change.toFixed(2)}%
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleRemove(row.ticker)}
                  className="gb-btn"
                  style={{ border: "none", background: "none", padding: "4px" }}
                  aria-label="Remove"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
