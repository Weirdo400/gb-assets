"use client";
export const dynamic = "force-dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";
import { usePortfolio } from "@/context/PortfolioContext";
import { fmtCurrency, fmtDateTime } from "@/lib/utils";
import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <History />
      </DashboardShell>
    </ProtectedRoute>
  );
}

const TYPE_LABELS = ["All", "Buy", "Sell", "Deposit", "Withdrawal"];
const STATUS_LABELS = ["All", "Completed", "Pending", "Rejected"];

function History() {
  const { transactions } = usePortfolio();
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = transactions.filter(tx => {
    const matchType = typeFilter === "All" || tx.type.toLowerCase() === typeFilter.toLowerCase();
    const matchStatus = statusFilter === "All" || tx.status.toLowerCase() === statusFilter.toLowerCase();
    return matchType && matchStatus;
  });

  const exportCSV = () => {
    const rows = [
      ["Date", "Type", "Ticker", "Asset", "Shares", "Amount", "Status"],
      ...filtered.map(tx => [
        fmtDateTime(tx.createdAt),
        tx.type,
        tx.ticker || "-",
        tx.assetName || "Funds Transfer",
        tx.shares?.toString() || "-",
        tx.amount.toFixed(2),
        tx.status,
      ]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gb-assets-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  return (
    <div>
      <div className="px-10 py-8 border-b border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="metric-label mb-1">Transaction History</div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">{filtered.length} Records</h1>
        </div>
        <button onClick={exportCSV} className="gb-btn flex items-center gap-2">
          <Download size={11} />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="px-10 py-4 border-b border-border flex flex-wrap gap-6">
        <div className="flex gap-2 items-center">
          <span className="metric-label">Type:</span>
          {TYPE_LABELS.map(t => (
            <button
              key={t}
              className={`gb-btn text-[10px] py-1 px-2 ${typeFilter === t ? "gb-btn-primary" : ""}`}
              onClick={() => setTypeFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <span className="metric-label">Status:</span>
          {STATUS_LABELS.map(s => (
            <button
              key={s}
              className={`gb-btn text-[10px] py-1 px-2 ${statusFilter === s ? "gb-btn-primary" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="gb-row-header grid" style={{ gridTemplateColumns: "140px 70px 70px 1fr 110px 100px" }}>
        <div>Date</div>
        <div>Type</div>
        <div>Ticker</div>
        <div>Details</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Status</div>
      </div>

      {filtered.length === 0 ? (
        <div className="gb-row" style={{ cursor: "default" }}>
          <span className="metric-label">No transactions match the selected filters.</span>
        </div>
      ) : (
        filtered.map(tx => (
          <div
            key={tx.id}
            className="gb-row grid"
            style={{ gridTemplateColumns: "140px 70px 70px 1fr 110px 100px", cursor: "default" }}
          >
            <div className="text-[11px] tabular">{fmtDateTime(tx.createdAt)}</div>
            <div className="uppercase font-bold text-[11px]">{tx.type}</div>
            <div className="font-bold text-[11px]">{tx.ticker || "—"}</div>
            <div className="text-[11px] text-muted-foreground">
              {tx.assetName || "Funds Transfer"}
              {tx.adminNote && <span className="ml-2 italic">({tx.adminNote})</span>}
            </div>
            <div className="text-right tabular text-[11px]">{fmtCurrency(tx.amount)}</div>
            <div className={`text-right text-[11px] uppercase ${tx.status === "rejected" ? "underline" : ""}`}>
              {tx.status}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
