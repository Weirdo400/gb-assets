"use client";
export const dynamic = "force-dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/context/AuthContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { fmtDate, fmtDateTime } from "@/lib/utils";
import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Alert } from "@/lib/types";
import { toast } from "sonner";

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <Account />
      </DashboardShell>
    </ProtectedRoute>
  );
}

function Account() {
  const { user, profile } = useAuth();
  const { refreshData } = usePortfolio();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!user) return;
    const loadAlerts = async () => {
      const snap = await getDocs(
        query(collection(db, "alerts"), where("uid", "==", user.uid))
      );
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert)));
    };
    loadAlerts();
  }, [user]);

  const markRead = async (alertId: string) => {
    await updateDoc(doc(db, "alerts", alertId), { read: true });
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
    await refreshData();
  };

  const markAllRead = async () => {
    const unread = alerts.filter(a => !a.read);
    await Promise.all(unread.map(a => updateDoc(doc(db, "alerts", a.id), { read: true })));
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    await refreshData();
    toast.success("All alerts marked as read");
  };

  const kycBadge = {
    none: { label: "Not Submitted", style: "underline" },
    pending: { label: "Under Review", style: "italic" },
    approved: { label: "Verified", style: "font-bold" },
    rejected: { label: "Rejected", style: "underline" },
  }[profile?.kycStatus ?? "none"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px]">
      <section className="border-r border-border">
        {/* Profile */}
        <div className="px-10 py-10 border-b border-border">
          <div className="metric-label mb-6">Account</div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "Full Name", value: profile?.fullName || user?.displayName || "—" },
              { label: "Email", value: profile?.email || user?.email || "—" },
              { label: "Member Since", value: profile?.createdAt ? fmtDate(profile.createdAt) : "—" },
              { label: "Last Sign In", value: profile?.lastSignInAt ? fmtDateTime(profile.lastSignInAt) : "—" },
              { label: "KYC Status", value: <span className={kycBadge?.style}>{kycBadge?.label}</span> },
              { label: "Last IP", value: profile?.lastIp || "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="metric-label mb-1">{label}</div>
                <div className="text-[13px]">{value}</div>
              </div>
            ))}
          </div>
          {profile?.kycStatus !== "approved" && (
            <Link
              href="/kyc"
              className="gb-btn gb-btn-primary inline-block mt-6"
              style={{ display: "inline-block", padding: "12px 24px", textDecoration: "none" }}
            >
              {profile?.kycStatus === "none" ? "Complete KYC Verification" : "Check KYC Status"}
            </Link>
          )}
        </div>

        {/* Alerts section */}
        <div id="alerts">
          <div className="section-header flex justify-between items-center">
            <span>Alerts &amp; Notifications ({alerts.filter(a => !a.read).length} unread)</span>
            {alerts.some(a => !a.read) && (
              <button onClick={markAllRead} className="nav-link text-[10px]" style={{ background: "none", border: "none", cursor: "pointer" }}>
                Mark All Read
              </button>
            )}
          </div>
          {alerts.length === 0 ? (
            <div className="gb-row" style={{ cursor: "default" }}>
              <span className="metric-label">No alerts</span>
            </div>
          ) : (
            [...alerts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(alert => (
              <div
                key={alert.id}
                className="gb-row flex items-start gap-4"
                style={{ cursor: "default", opacity: alert.read ? 0.5 : 1 }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="uppercase font-bold text-[11px]">{alert.title}</span>
                    <span className="metric-label text-[10px]">{fmtDateTime(alert.createdAt)}</span>
                    {alert.fromAdmin && <span className="metric-label text-[9px]">FROM ADMIN</span>}
                  </div>
                  <p className="text-[12px]">{alert.message}</p>
                </div>
                {!alert.read && (
                  <button onClick={() => markRead(alert.id)} className="gb-btn text-[10px] py-1 px-2 shrink-0">
                    Mark Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Quick links */}
      <aside className="px-10 py-10">
        <div className="metric-label mb-6">Quick Actions</div>
        <div className="flex flex-col gap-2">
          {[
            { href: "/funds", label: "Deposit Funds" },
            { href: "/funds", label: "Request Withdrawal" },
            { href: "/kyc", label: "KYC Verification" },
            { href: "/dashboard", label: "Portfolio Dashboard" },
            { href: "/analytics", label: "Analytics" },
            { href: "/history", label: "Transaction History" },
          ].map(({ href, label }) => (
            <Link key={label} href={href} className="gb-btn text-left" style={{ display: "block", textAlign: "left" }}>
              {label} →
            </Link>
          ))}
        </div>

        <div className="border-t border-border mt-8 pt-6">
          <div className="metric-label mb-3">Support</div>
          <p className="text-[11px] mb-3" style={{ lineHeight: "1.6" }}>
            For account queries, contact our operations team.
          </p>
          <div className="metric-label text-[10px]">support@globalassets.io</div>
          <div className="metric-label text-[10px] mt-1">Mon–Fri, 09:00–17:00 GMT</div>
        </div>
      </aside>
    </div>
  );
}
