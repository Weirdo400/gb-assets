"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { fmtCurrency, fmtDate } from "@/lib/utils";

const IMPERSONATE_KEY = "gb_impersonate_uid";

export default function AdminImpersonate() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap =>
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)))
    );
    setActive(localStorage.getItem(IMPERSONATE_KEY));
  }, []);

  const start = (uid: string) => {
    localStorage.setItem(IMPERSONATE_KEY, uid);
    setActive(uid);
    window.open("/dashboard", "_blank");
  };

  const stop = () => {
    localStorage.removeItem(IMPERSONATE_KEY);
    setActive(null);
  };

  return (
    <div>
      <div className="px-10 py-8 border-b border-border">
        <div className="metric-label mb-1">Impersonation</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">View as User</h1>
      </div>

      {active && (
        <div className="px-10 py-4 border-b border-border flex items-center justify-between bg-muted">
          <span className="metric-label">Currently impersonating: <strong>{users.find(u => u.uid === active)?.fullName ?? active}</strong></span>
          <button className="gb-btn" onClick={stop}>Stop Impersonating</button>
        </div>
      )}

      <div className="gb-row-header grid" style={{ gridTemplateColumns: "1fr 1fr 130px 80px 100px" }}>
        <div>Name</div>
        <div>Email</div>
        <div className="text-right">Balance</div>
        <div>KYC</div>
        <div />
      </div>

      {users.map(u => (
        <div key={u.uid} className="gb-row grid items-center" style={{ gridTemplateColumns: "1fr 1fr 130px 80px 100px" }}>
          <div className="text-[12px] font-medium">{u.fullName || "—"}</div>
          <div className="text-[11px] text-muted-foreground">{u.email}</div>
          <div className="text-right tabular text-[12px]">{fmtCurrency(u.availableBalance + u.investedBalance)}</div>
          <div className="uppercase text-[10px]">{u.kycStatus}</div>
          <div className="flex justify-end">
            <button
              onClick={() => start(u.uid)}
              className={`gb-btn text-[10px] py-1 px-2 ${active === u.uid ? "gb-btn-primary" : ""}`}
            >
              {active === u.uid ? "Viewing" : "View →"}
            </button>
          </div>
        </div>
      ))}

      <div className="px-10 py-6 metric-label text-[10px]">
        Impersonation opens the client portal in a new tab using the selected user&apos;s data. No account changes are made.
      </div>
    </div>
  );
}
