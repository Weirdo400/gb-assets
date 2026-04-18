"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { fmtCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminBalances() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [op, setOp] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
  };

  useEffect(() => { load(); }, []);

  const execute = async () => {
    if (!selected) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (op === "debit" && amt > selected.availableBalance) { toast.error("Amount exceeds available balance"); return; }
    setSaving(true);
    try {
      const newBal = op === "credit"
        ? selected.availableBalance + amt
        : selected.availableBalance - amt;
      await updateDoc(doc(db, "users", selected.uid), { availableBalance: newBal });
      await addDoc(collection(db, "transactions"), {
        uid: selected.uid,
        type: op === "credit" ? "deposit" : "withdrawal",
        amount: amt,
        status: "approved",
        adminNote: note || `Admin ${op}: ${note || "manual adjustment"}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success(`${op === "credit" ? "Credited" : "Debited"} ${fmtCurrency(amt)} ${op === "credit" ? "to" : "from"} ${selected.fullName}`);
      setSelected(null);
      setAmount("");
      setNote("");
      await load();
    } catch {
      toast.error("Operation failed");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="px-10 py-8 border-b border-border">
        <div className="metric-label mb-1">Balance Adjustment</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Credit / Debit Accounts</h1>
      </div>

      <div className="gb-row-header grid" style={{ gridTemplateColumns: "1fr 1fr 140px 140px 100px" }}>
        <div>Name</div>
        <div>Email</div>
        <div className="text-right">Available</div>
        <div className="text-right">Invested</div>
        <div />
      </div>

      {users.map(u => (
        <div key={u.uid} className="gb-row grid items-center" style={{ gridTemplateColumns: "1fr 1fr 140px 140px 100px" }}>
          <div className="text-[12px] font-medium">{u.fullName || "—"}</div>
          <div className="text-[11px] text-muted-foreground">{u.email}</div>
          <div className="text-right tabular text-[12px]">{fmtCurrency(u.availableBalance)}</div>
          <div className="text-right tabular text-[12px]">{fmtCurrency(u.investedBalance)}</div>
          <div className="flex justify-end">
            <button onClick={() => { setSelected(u); setAmount(""); setNote(""); setOp("credit"); }} className="gb-btn text-[10px] py-1 px-2">
              Adjust
            </button>
          </div>
        </div>
      ))}

      {selected && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-background border border-border p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="metric-label mb-1">Balance Adjustment</div>
            <div className="font-bold text-lg mb-1">{selected.fullName}</div>
            <div className="metric-label mb-6">Current available: {fmtCurrency(selected.availableBalance)}</div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="metric-label">Operation</label>
                <div className="grid grid-cols-2 gap-px bg-border border border-border">
                  <button className={`gb-btn ${op === "credit" ? "gb-btn-primary" : ""}`} onClick={() => setOp("credit")}>Credit</button>
                  <button className={`gb-btn ${op === "debit" ? "gb-btn-primary" : ""}`} onClick={() => setOp("debit")}>Debit</button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="metric-label">Amount (USD)</label>
                <input className="gb-input" type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="metric-label">Note (optional)</label>
                <input className="gb-input" placeholder="Reason for adjustment" value={note} onChange={e => setNote(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={execute} disabled={saving} className="gb-btn gb-btn-primary flex-1">
                {saving ? "Processing…" : `${op === "credit" ? "Credit" : "Debit"} Funds`}
              </button>
              <button onClick={() => setSelected(null)} className="gb-btn flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
