"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";
import { fmtDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminKYC() {
  const [users, setUsers] = useState<(UserProfile & { kycData?: Record<string, string> })[]>([]);

  const load = async () => {
    const snap = await getDocs(collection(db, "users"));
    const all = snap.docs
      .map(d => ({ uid: d.id, ...d.data() } as UserProfile & { kycData?: Record<string, string> }))
      .filter(u => u.kycStatus === "pending" || u.kycStatus === "approved" || u.kycStatus === "rejected")
      .sort((a, b) => (a.kycStatus === "pending" ? -1 : 1));
    setUsers(all);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (uid: string, status: "approved" | "rejected", name: string) => {
    await updateDoc(doc(db, "users", uid), { kycStatus: status });
    await addDoc(collection(db, "alerts"), {
      uid,
      title: `KYC ${status === "approved" ? "Approved" : "Rejected"}`,
      message: status === "approved"
        ? "Your identity has been verified. You now have full account access."
        : "Your KYC application was not approved. Please contact support.",
      type: status === "approved" ? "success" : "error",
      read: false,
      fromAdmin: true,
      createdAt: new Date().toISOString(),
    });
    toast.success(`KYC ${status} for ${name}`);
    await load();
  };

  return (
    <div>
      <div className="px-10 py-8 border-b border-border">
        <div className="metric-label mb-1">KYC Review</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">{users.filter(u => u.kycStatus === "pending").length} Pending</h1>
      </div>

      <div className="gb-row-header grid" style={{ gridTemplateColumns: "1fr 1fr 100px 160px 140px" }}>
        <div>Name</div>
        <div>Email</div>
        <div>Status</div>
        <div>ID Type</div>
        <div />
      </div>

      {users.map(u => (
        <div key={u.uid} className="gb-row grid items-center" style={{ gridTemplateColumns: "1fr 1fr 100px 160px 140px", cursor: "default" }}>
          <div>
            <div className="text-[12px] font-medium">{u.fullName}</div>
            {u.kycData?.dob && <div className="metric-label text-[10px]">DOB: {u.kycData.dob} · {u.kycData.country}</div>}
          </div>
          <div className="text-[11px] text-muted-foreground">{u.email}</div>
          <div className={`uppercase text-[11px] ${u.kycStatus === "rejected" ? "underline" : u.kycStatus === "approved" ? "font-bold" : ""}`}>
            {u.kycStatus}
          </div>
          <div className="text-[11px]">{u.kycData?.idType || "—"}</div>
          {u.kycStatus === "pending" && (
            <div className="flex gap-1 justify-end">
              <button onClick={() => setStatus(u.uid, "approved", u.fullName)} className="gb-btn gb-btn-primary text-[10px] py-1 px-2">Approve</button>
              <button onClick={() => setStatus(u.uid, "rejected", u.fullName)} className="gb-btn text-[10px] py-1 px-2">Reject</button>
            </div>
          )}
          {u.kycStatus !== "pending" && <div />}
        </div>
      ))}
    </div>
  );
}
