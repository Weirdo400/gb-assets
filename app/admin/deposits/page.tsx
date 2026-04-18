"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Transaction } from "@/lib/types";
import { fmtCurrency, fmtDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<(Transaction & { userName?: string })[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const load = async () => {
    const snap = await getDocs(collection(db, "transactions"));
    const all = await Promise.all(
      snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Transaction))
        .filter(t => t.type === "deposit")
        .map(async t => {
          const userSnap = await getDoc(doc(db, "users", t.uid));
          return { ...t, userName: userSnap.data()?.fullName || t.uid };
        })
    );
    setDeposits(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => { load(); }, []);

  const approve = async (tx: Transaction & { userName?: string }) => {
    await updateDoc(doc(db, "transactions", tx.id), { status: "completed", updatedAt: new Date().toISOString() });
    const userSnap = await getDoc(doc(db, "users", tx.uid));
    const current = userSnap.data()?.availableBalance ?? 0;
    await updateDoc(doc(db, "users", tx.uid), { availableBalance: current + tx.amount });
    toast.success(`Approved deposit of ${fmtCurrency(tx.amount)} for ${tx.userName}`);
    await load();
  };

  const reject = async (tx: Transaction) => {
    await updateDoc(doc(db, "transactions", tx.id), { status: "rejected", updatedAt: new Date().toISOString() });
    toast.success("Deposit rejected");
    await load();
  };

  const filtered = deposits.filter(t => filter === "all" || t.status === filter);

  return (
    <div>
      <div className="px-10 py-8 border-b border-border flex items-center justify-between">
        <div>
          <div className="metric-label mb-1">Deposits</div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">{filtered.length} Records</h1>
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`gb-btn text-[10px] py-1 px-2 ${filter === f ? "gb-btn-primary" : ""}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="gb-row-header grid" style={{ gridTemplateColumns: "140px 1fr 120px 100px 80px 140px" }}>
        <div>Date</div>
        <div>User</div>
        <div className="text-right">Amount</div>
        <div>Status</div>
        <div>Note</div>
        <div />
      </div>

      {filtered.map(tx => (
        <div key={tx.id} className="gb-row grid items-center" style={{ gridTemplateColumns: "140px 1fr 120px 100px 80px 140px", cursor: "default" }}>
          <div className="text-[11px] tabular">{fmtDateTime(tx.createdAt)}</div>
          <div className="text-[12px]">{tx.userName || tx.uid}</div>
          <div className="text-right tabular text-[12px] font-bold">{fmtCurrency(tx.amount)}</div>
          <div className={`uppercase text-[11px] ${tx.status === "rejected" ? "underline" : ""}`}>{tx.status}</div>
          <div className="text-[10px] text-muted-foreground truncate">{tx.adminNote || "—"}</div>
          {tx.status === "pending" && (
            <div className="flex gap-1 justify-end">
              <button onClick={() => approve(tx)} className="gb-btn gb-btn-primary text-[10px] py-1 px-2">Approve</button>
              <button onClick={() => reject(tx)} className="gb-btn text-[10px] py-1 px-2">Reject</button>
            </div>
          )}
          {tx.status !== "pending" && <div />}
        </div>
      ))}
    </div>
  );
}
