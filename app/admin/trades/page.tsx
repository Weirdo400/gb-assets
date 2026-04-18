"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, ASSETS } from "@/lib/types";
import { fmtCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminTrades() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUid, setSelectedUid] = useState("");
  const [ticker, setTicker] = useState("AAPL");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap => {
      const list = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
      setUsers(list);
      if (list.length) setSelectedUid(list[0].uid);
    });
  }, []);

  useEffect(() => {
    const asset = ASSETS[ticker];
    if (asset) setPrice(asset.price.toString());
  }, [ticker]);

  const execute = async () => {
    const user = users.find(u => u.uid === selectedUid);
    if (!user) return;
    const qty_ = parseFloat(qty);
    const price_ = parseFloat(price);
    if (!qty_ || qty_ <= 0 || !price_ || price_ <= 0) { toast.error("Enter valid qty and price"); return; }
    const asset = ASSETS[ticker];
    if (!asset) return;
    const cost = qty_ * price_;

    setExecuting(true);
    try {
      if (side === "buy") {
        const invSnap = await getDocs(query(collection(db, "investments"), where("uid", "==", selectedUid), where("ticker", "==", ticker)));
        if (!invSnap.empty) {
          await updateDoc(invSnap.docs[0].ref, {
            shares: invSnap.docs[0].data().shares + qty_,
            currentPrice: price_,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await addDoc(collection(db, "investments"), {
            uid: selectedUid, ticker, assetName: asset.name,
            shares: qty_, purchasePrice: price_, currentPrice: price_,
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          });
        }
        await updateDoc(doc(db, "users", selectedUid), {
          availableBalance: Math.max(0, user.availableBalance - cost),
          investedBalance: user.investedBalance + cost,
        });
      } else {
        const invSnap = await getDocs(query(collection(db, "investments"), where("uid", "==", selectedUid), where("ticker", "==", ticker)));
        if (invSnap.empty) { toast.error("User does not hold this asset"); setExecuting(false); return; }
        const existing = invSnap.docs[0];
        const remaining = existing.data().shares - qty_;
        if (remaining < 0) { toast.error("Insufficient shares"); setExecuting(false); return; }
        if (remaining === 0) {
          await updateDoc(existing.ref, { shares: 0, updatedAt: new Date().toISOString() });
        } else {
          await updateDoc(existing.ref, { shares: remaining, updatedAt: new Date().toISOString() });
        }
        await updateDoc(doc(db, "users", selectedUid), {
          availableBalance: user.availableBalance + cost,
          investedBalance: Math.max(0, user.investedBalance - cost),
        });
      }

      await addDoc(collection(db, "transactions"), {
        uid: selectedUid, type: side, ticker, assetName: asset.name,
        shares: qty_, amount: cost, status: "completed",
        adminNote: "Admin-executed trade",
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      });

      toast.success(`${side === "buy" ? "Bought" : "Sold"} ${qty_} ${ticker} for ${user.fullName}`);
      setQty("");
    } catch {
      toast.error("Trade execution failed");
    }
    setExecuting(false);
  };

  const asset = ASSETS[ticker];
  const estimatedTotal = qty && price ? (parseFloat(qty) || 0) * (parseFloat(price) || 0) : 0;

  return (
    <div>
      <div className="px-10 py-8 border-b border-border">
        <div className="metric-label mb-1">Trades</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Execute Trade on Behalf of User</h1>
      </div>

      <div className="px-10 py-8 max-w-xl flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="metric-label">User</label>
          <select className="gb-select" value={selectedUid} onChange={e => setSelectedUid(e.target.value)}>
            {users.map(u => <option key={u.uid} value={u.uid}>{u.fullName} — {u.email}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="metric-label">Side</label>
          <div className="grid grid-cols-2 gap-px bg-border border border-border">
            <button className={`gb-btn ${side === "buy" ? "gb-btn-primary" : ""}`} onClick={() => setSide("buy")}>Buy</button>
            <button className={`gb-btn ${side === "sell" ? "gb-btn-primary" : ""}`} onClick={() => setSide("sell")}>Sell</button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="metric-label">Asset</label>
          <select className="gb-select" value={ticker} onChange={e => setTicker(e.target.value)}>
            {Object.entries(ASSETS).map(([t, a]) => <option key={t} value={t}>{t} — {a.name}</option>)}
          </select>
        </div>

        {asset && (
          <div className="border border-border p-3">
            <div className="metric-label mb-1">Reference Price</div>
            <div className="font-bold tabular">{fmtCurrency(asset.price)}</div>
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label className="metric-label">Quantity</label>
            <input className="gb-input" type="number" placeholder="0" min="0" step="0.001" value={qty} onChange={e => setQty(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label className="metric-label">Price per Unit</label>
            <input className="gb-input" type="number" placeholder="0.00" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
        </div>

        {estimatedTotal > 0 && (
          <div className="metric-label">Total: {fmtCurrency(estimatedTotal)}</div>
        )}

        <button className="gb-btn gb-btn-primary" onClick={execute} disabled={executing}>
          {executing ? "Executing…" : `Execute ${side === "buy" ? "Buy" : "Sell"} →`}
        </button>
      </div>
    </div>
  );
}
