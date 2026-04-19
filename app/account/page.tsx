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
import { isDemoMode, DEMO_ALERTS } from "@/lib/demo-data";

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
    if (isDemoMode()) {
      setAlerts(DEMO_ALERTS);
      return;
    }
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
    if (!isDemoMode()) await updateDoc(doc(db, "alerts", alertId), { read: true });
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
    if (!isDemoMode()) await refreshData();
  };

  const markAllRead = async () => {
    const unread = alerts.filter(a => !a.read);
    if (!isDemoMode()) await Promise.all(unread.map(a => updateDoc(doc(db, "alerts", a.id), { read: true })));
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    if (!isDemoMode()) await refreshData();
    toast.success("All alerts marked as read");
  };

  const kycBadge = {
    none:    { label: "Not Submitted", style: "underline" },
    pending: { label: "Under Review",  style: "italic" },
    approved:{ label: "Verified",      style: "font-bold" },
    rejected:{ label: "Rejected",      style: "underline" },
  }[profile?.kycStatus ?? "none"];

  const ALERT_COLORS = {
    info:    "",
    success: "text-up",
    warning: "text-[oklch(0.65_0.18_75)]",
    error:   "text-down",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px]">
      <section className="border-r border-border">
        {/* Profile */}
        <div className="px-4 py-6 md:px-10 md:py-10 border-b border-border">
          <div className="metric-label mb-6">Account</div>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {[
              { label: "Full Name",    value: profile?.fullName || user?.displayName || "—" },
              { label: "Email",        value: profile?.email || user?.email || "—" },
              { label: "Member Since", value: profile?.createdAt ? fmtDate(profile.createdAt) : "—" },
              { label: "Last Sign In", value: profile?.lastSignInAt ? fmtDateTime(profile.lastSignInAt) : "—" },
              { label: "KYC Status",   value: <span className={kycBadge?.style}>{kycBadge?.label}</span> },
              { label: "Last IP",      value: profile?.lastIp || "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="metric-label mb-1">{label}</div>
                <div className="text-[12px] break-all">{value}</div>
              </div>
            ))}
          </div>
          {profile?.kycStatus !== "approved" && (
            <Link
              href="/kyc"
              className="gb-btn gb-btn-primary mt-6 inline-block"
              style={{ padding: "12px 24px", textDecoration: "none" }}
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
            [...alerts]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(alert => (
                <div
                  key={alert.id}
                  className="gb-row flex flex-col gap-2"
                  style={{ cursor: "default", opacity: alert.read ? 0.5 : 1 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                        <span className={`uppercase font-bold text-[11px] ${ALERT_COLORS[alert.type]}`}>
                          {alert.title}
                        </span>
                        {alert.fromAdmin && (
                          <span className="metric-label text-[9px] border border-border px-1">Admin</span>
                        )}
                      </div>
                      <p className="text-[12px] leading-relaxed">{alert.message}</p>
                      <div className="metric-label mt-1">{fmtDateTime(alert.createdAt)}</div>
                    </div>
                    {!alert.read && (
                      <button
                        onClick={() => markRead(alert.id)}
                        className="gb-btn text-[10px] shrink-0"
                        style={{ padding: "4px 10px" }}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </section>

      {/* Quick links */}
      <aside className="px-4 py-6 md:px-10 md:py-10 border-t border-border lg:border-t-0">
        <div className="metric-label mb-6">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {[
            { href: "/funds",     label: "Deposit Funds" },
            { href: "/funds",     label: "Request Withdrawal" },
            { href: "/kyc",       label: "KYC Verification" },
            { href: "/dashboard", label: "Portfolio Dashboard" },
            { href: "/analytics", label: "Analytics" },
            { href: "/history",   label: "Transaction History" },
          ].map(({ href, label }) => (
            <Link key={label} href={href} className="gb-btn" style={{ display: "block", textAlign: "left" }}>
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
