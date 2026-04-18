"use client";
export const dynamic = "force-dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";
import { usePortfolio } from "@/context/PortfolioContext";
import { ASSETS } from "@/lib/types";
import { fmtCurrency } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Wifi, WifiOff, Search } from "lucide-react";
import { toast } from "sonner";
import { useLivePrices } from "@/hooks/useLivePrices";

export default function MarketPage() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <Market />
      </DashboardShell>
    </ProtectedRoute>
  );
}

const ALL_TICKERS = Object.keys(ASSETS);

function Market() {
  const { watchlist, addToWatchlist, removeFromWatchlist } = usePortfolio();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const { prices, connected } = useLivePrices(ALL_TICKERS);

  const sectors = ["All", ...Array.from(new Set(Object.values(ASSETS).map(a => a.sector)))];

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return Object.entries(ASSETS)
      .filter(([ticker, a]) => {
        const matchesSector = filter === "All" || a.sector === filter;
        const matchesSearch = !q || ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.sector.toLowerCase().includes(q);
        return matchesSector && matchesSearch;
      })
      .map(([ticker, info]) => {
        const live = prices[ticker];
        const price = live?.price ?? info.price;
        const change = live?.changePercent ?? 0;
        const prevPrice = live?.prevPrice ?? info.price;
        return { ticker, ...info, price, prevPrice, change };
      });
  }, [filter, search, prices]);

  const watchedTickers = new Set(watchlist.map(w => w.ticker));

  const toggleWatch = (ticker: string) => {
    if (watchedTickers.has(ticker)) {
      removeFromWatchlist(ticker);
      toast.success(`Removed ${ticker} from watchlist`);
    } else {
      addToWatchlist(ticker);
      toast.success(`Added ${ticker} to watchlist`);
    }
  };

  return (
    <div>
      <div className="px-10 py-8 border-b border-border">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="metric-label mb-1 flex items-center gap-2">
              Live Market
              <span className={`inline-flex items-center gap-1 text-[10px] ${connected ? "" : "opacity-40"}`}>
                {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
                {connected ? "Live" : "Connecting…"}
              </span>
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">{rows.length} Instruments</h1>
          </div>
          {/* Search */}
          <div className="relative w-full max-w-xs">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
            <input
              className="gb-input pl-8 w-full text-[12px]"
              placeholder="Search by symbol, name or sector…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        {/* Sector filters */}
        <div className="flex gap-2 flex-wrap">
          {sectors.map(s => (
            <button
              key={s}
              className={`gb-btn text-[10px] py-1.5 px-3 ${filter === s ? "gb-btn-primary" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

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
              onClick={(e) => { e.stopPropagation(); toggleWatch(row.ticker); }}
              style={{ border: "none", background: "none", padding: "8px", cursor: "pointer", display: "flex", alignItems: "center" }}
              aria-label={watchedTickers.has(row.ticker) ? "Remove from watchlist" : "Add to watchlist"}
            >
              {watchedTickers.has(row.ticker)
                ? <BookmarkCheck size={15} />
                : <Bookmark size={15} />
              }
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
