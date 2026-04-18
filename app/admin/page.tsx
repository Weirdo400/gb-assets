"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fmtCurrency } from "@/lib/utils";

interface Stats {
  totalUsers: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingKYC: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    pendingKYC: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [usersSnap, txSnap, kycSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "transactions")),
        getDocs(query(collection(db, "users"), where("kycStatus", "==", "pending"))),
      ]);

      const txns = txSnap.docs.map(d => d.data());
      const pendingDeposits = txns.filter(t => t.type === "deposit" && t.status === "pending").length;
      const pendingWithdrawals = txns.filter(t => t.type === "withdrawal" && t.status === "pending").length;
      const totalDeposited = txns
        .filter(t => t.type === "deposit" && (t.status === "completed" || t.status === "approved"))
        .reduce((s, t) => s + (t.amount || 0), 0);
      const totalWithdrawn = txns
        .filter(t => t.type === "withdrawal" && (t.status === "completed" || t.status === "approved"))
        .reduce((s, t) => s + (t.amount || 0), 0);

      setStats({
        totalUsers: usersSnap.size,
        pendingDeposits,
        pendingWithdrawals,
        pendingKYC: kycSnap.size,
        totalDeposited,
        totalWithdrawn,
      });
    };
    load();
  }, []);

  const metrics = [
    { label: "Total Users", value: stats.totalUsers.toString() },
    { label: "Pending Deposits", value: stats.pendingDeposits.toString() },
    { label: "Pending Withdrawals", value: stats.pendingWithdrawals.toString() },
    { label: "Pending KYC", value: stats.pendingKYC.toString() },
    { label: "Total Deposited", value: fmtCurrency(stats.totalDeposited) },
    { label: "Total Withdrawn", value: fmtCurrency(stats.totalWithdrawn) },
  ];

  return (
    <div>
      <div className="px-10 py-8 border-b border-border">
        <div className="metric-label mb-1">Admin Dashboard</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight">Platform Overview</h1>
      </div>
      <div className="px-10 py-8 grid grid-cols-2 md:grid-cols-3 gap-8 border-b border-border">
        {metrics.map(m => (
          <div key={m.label}>
            <div className="metric-label mb-2">{m.label}</div>
            <div className="metric-value tabular">{m.value}</div>
          </div>
        ))}
      </div>
      <div className="px-10 py-6">
        <div className="metric-label mb-4">Quick Access</div>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/admin/deposits", label: "Review Deposits" },
            { href: "/admin/withdrawals", label: "Review Withdrawals" },
            { href: "/admin/kyc", label: "Review KYC" },
            { href: "/admin/users", label: "Manage Users" },
          ].map(({ href, label }) => (
            <a key={label} href={href} className="gb-btn">
              {label} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
