"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { fmtCurrency, fmtDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [availBal, setAvailBal] = useState("");
  const [investBal, setInvestBal] = useState("");
  const [overridePL, setOverridePL] = useState("");
  const [overrideReturn, setOverrideReturn] = useState("");
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
  };

  useEffect(() => { loadUsers(); }, []);

  const openUser = (u: UserProfile) => {
    setSelected(u);
    setAvailBal(u.availableBalance.toString());
    setInvestBal(u.investedBalance.toString());
    setOverridePL(u.overrideTodaysPL?.toString() ?? "");
    setOverrideReturn(u.overrideTotalReturn?.toString() ?? "");
  };

  const saveUser = async () => {
    if (!selected) return;
    setSaving(true);
    await updateDoc(doc(db, "users", selected.uid), {
      availableBalance: parseFloat(availBal) || 0,
      investedBalance: parseFloat(investBal) || 0,
      overrideTodaysPL: overridePL !== "" ? parseFloat(overridePL) : null,
      overrideTotalReturn: overrideReturn !== "" ? parseFloat(overrideReturn) : null,
    });
    setSaving(false);
    toast.success("User updated");
    setSelected(null);
    await loadUsers();
  };

  return (
    <div>
      <div className="px-10 py-8 border-b border-border">
        <div className="metric-label mb-1">Users</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">{users.length} Accounts</h1>
      </div>

      <div className="gb-row-header grid" style={{ gridTemplateColumns: "1fr 1fr 120px 120px 100px 80px" }}>
        <div>Name</div>
        <div>Email</div>
        <div className="text-right">Available</div>
        <div className="text-right">Invested</div>
        <div>KYC</div>
        <div />
      </div>

      {users.map(u => (
        <div key={u.uid} className="gb-row grid items-center" style={{ gridTemplateColumns: "1fr 1fr 120px 120px 100px 80px" }}>
          <div className="text-[12px] font-medium">{u.fullName || "—"}</div>
          <div className="text-[11px] text-muted-foreground">{u.email}</div>
          <div className="text-right tabular text-[12px]">{fmtCurrency(u.availableBalance)}</div>
          <div className="text-right tabular text-[12px]">{fmtCurrency(u.investedBalance)}</div>
          <div className="uppercase text-[10px]">{u.kycStatus}</div>
          <div className="flex justify-end">
            <button onClick={() => openUser(u)} className="gb-btn text-[10px] py-1 px-2">Edit</button>
          </div>
        </div>
      ))}

      {selected && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div
            className="bg-background border border-border p-8 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="metric-label mb-1">Edit User</div>
            <div className="font-bold text-lg mb-6">{selected.fullName}</div>
            <div className="flex flex-col gap-4">
              {[
                { label: "Available Balance", value: availBal, onChange: setAvailBal },
                { label: "Invested Balance", value: investBal, onChange: setInvestBal },
                { label: "Override Today's P/L (optional)", value: overridePL, onChange: setOverridePL },
                { label: "Override Total Return (optional)", value: overrideReturn, onChange: setOverrideReturn },
              ].map(({ label, value, onChange }) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="metric-label">{label}</label>
                  <input className="gb-input" type="number" value={value} onChange={e => onChange(e.target.value)} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={saveUser} disabled={saving} className="gb-btn gb-btn-primary flex-1">
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setSelected(null)} className="gb-btn flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
