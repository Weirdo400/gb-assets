"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fmtCurrency, fmtDateTime } from "@/lib/utils";
import { Transaction, UserProfile } from "@/lib/types";
import { RefreshCw } from "lucide-react";

interface TxRow extends Transaction {
  userName?: string;
}

export default function AdminActivity() {
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const load = async () => {
    setLoading(true);
    const [txSnap, userSnap] = await Promise.all([
      getDocs(query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(200))),
      getDocs(collection(db, "users")),
    ]);
    const userMap: Record<string, string> = {};
    userSnap.docs.forEach(d => { userMap[d.id] = (d.data() as UserProfile).fullName || d.data().email; });
    const txns = txSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      userName: userMap[(d.data() as Transaction).uid] || "Unknown",
    } as TxRow));
    setRows(txns);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const types = ["All", "deposit", "withdrawal", "buy", "sell"];
  const filtered = filter === "All" ? rows : rows.filter(r => r.type === filter);

  const statusColor = (s: string) => s === "completed" || s === "approved" ? "" : s === "pending" ? "opacity-60" : "underline";

  return (
    <div>
      <div className="px-10 py-8 border-b border-border flex items-center justify-between">
        <div>
          <div className="metric-label mb-1">Activity Log</div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">All Transactions</h1>
        </div>
        <button onClick={load} className="gb-btn" style={{ display: "flex", alignItems: "center", gap: 6 }} disabled={loading}>
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="px-10 py-4 border-b border-border flex gap-2 flex-wrap">
        {types.map(t => (
          <button key={t} className={`gb-btn text-[10px] py-1 px-3 ${filter === t ? "gb-btn-primary" : ""}`} onClick={() => setFilter(t)}>
            {t === "All" ? `All (${rows.length})` : t}
          </button>
        ))}
      </div>

      <div className="gb-row-header grid" style={{ gridTemplateColumns: "1fr 100px 1fr 100px 120px 80px" }}>
        <div>User</div>
        <div>Type</div>
        <div>Details</div>
        <div className="text-right">Amount</div>
        <div>Date</div>
        <div>Status</div>
      </div>

      {filtered.map(row => (
        <div key={row.id} className="gb-row grid items-center" style={{ gridTemplateColumns: "1fr 100px 1fr 100px 120px 80px", cursor: "default" }}>
          <div className="text-[11px] font-medium truncate">{row.userName}</div>
          <div className="uppercase font-bold text-[10px]">{row.type}</div>
          <div className="text-[11px] text-muted-foreground truncate">
            {row.ticker ? `${row.ticker} · ${row.shares} shares` : row.adminNote || "—"}
          </div>
          <div className="text-right tabular text-[11px]">{fmtCurrency(row.amount)}</div>
          <div className="text-[10px] text-muted-foreground">{fmtDateTime(row.createdAt)}</div>
          <div className={`uppercase text-[10px] ${statusColor(row.status)}`}>{row.status}</div>
        </div>
      ))}

      {!loading && filtered.length === 0 && (
        <div className="px-10 py-8 metric-label">No transactions found.</div>
      )}
    </div>
  );
}
