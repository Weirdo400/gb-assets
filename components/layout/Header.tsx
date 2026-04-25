"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { Bell, Moon, Sun, Check, CheckCheck, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "@/components/LoadingScreen";
import { collection, query, where, getDocs, updateDoc, doc, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Alert } from "@/lib/types";
import { fmtDateTime } from "@/lib/utils";
import { isDemoMode, DEMO_ALERTS } from "@/lib/demo-data";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Portfolio" },
  { href: "/market", label: "Market" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/analytics", label: "Analytics" },
  { href: "/history", label: "History" },
  { href: "/funds", label: "Transfers" },
  { href: "/account", label: "Account" },
];

const ALERT_COLORS: Record<Alert["type"], string> = {
  info:    "text-foreground",
  success: "text-up",
  warning: "text-[oklch(0.65_0.18_75)]",
  error:   "text-down",
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { unreadAlerts, refreshData } = usePortfolio();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Alerts popover
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("gb-theme");
    if (stored !== "light") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Close popover on outside click or scroll
  useEffect(() => {
    if (!alertsOpen) return;
    const close = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.closest("[data-alerts-root]")?.contains(e.target as Node)) {
        setAlertsOpen(false);
      }
    };
    const closeScroll = () => setAlertsOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", closeScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", closeScroll);
    };
  }, [alertsOpen]);

  const loadAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      if (isDemoMode()) {
        setAlerts(DEMO_ALERTS);
        return;
      }
      if (!user) return;
      const snap = await getDocs(
        query(collection(db, "alerts"), where("uid", "==", user.uid), orderBy("createdAt", "desc"), limit(8))
      );
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Alert)));
    } finally {
      setLoadingAlerts(false);
    }
  }, [user]);

  const calcPopoverStyle = (): React.CSSProperties => {
    if (!bellRef.current) return {};
    const rect = bellRef.current.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 32);
    const naturalRight = window.innerWidth - rect.right;
    // cap right so left edge stays ≥16px from viewport left
    const right = Math.min(Math.max(16, naturalRight), window.innerWidth - width - 16);
    return { position: "fixed", top: rect.bottom + 8, right, width, zIndex: 9999 };
  };

  const toggleAlerts = () => {
    if (!alertsOpen) {
      loadAlerts();
      setPopoverStyle(calcPopoverStyle());
    }
    setAlertsOpen(o => !o);
  };

  const markRead = async (alertId: string) => {
    if (!isDemoMode()) await updateDoc(doc(db, "alerts", alertId), { read: true });
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, read: true } : a));
    if (!isDemoMode()) refreshData();
  };

  const markAllRead = async () => {
    const unread = alerts.filter(a => !a.read);
    if (!isDemoMode()) await Promise.all(unread.map(a => updateDoc(doc(db, "alerts", a.id), { read: true })));
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    if (!isDemoMode()) refreshData();
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("gb-theme", next ? "dark" : "light");
  };

  const handleSignOut = async () => {
    setConfirmSignOut(false);
    setSigningOut(true);
    await signOut();
    router.push("/login");
  };

  const popoverPanel = alertsOpen && mounted ? (
    <div
      className="bg-background border border-border shadow-lg"
      style={popoverStyle}
      data-alerts-panel
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <span className="text-[10px] font-bold uppercase tracking-widest">Notifications</span>
        <div className="flex items-center gap-3">
          {alerts.some(a => !a.read) && (
            <button onClick={markAllRead} className="metric-label hover:opacity-70 flex items-center gap-1" style={{ color: "inherit" }}>
              <CheckCheck size={10} /><span>Mark all read</span>
            </button>
          )}
          <Link href="/account#alerts" onClick={() => setAlertsOpen(false)} className="metric-label flex items-center gap-1 hover:opacity-70" style={{ color: "inherit" }}>
            <ExternalLink size={10} /><span>All</span>
          </Link>
        </div>
      </div>
      {/* List */}
      <div className="max-h-72 overflow-y-auto">
        {loadingAlerts ? (
          <div className="px-4 py-6 metric-label text-center">Loading…</div>
        ) : alerts.length === 0 ? (
          <div className="px-4 py-6 metric-label text-center">No notifications</div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className="px-4 py-3 border-b border-border last:border-b-0 flex gap-3 items-start"
              style={{ background: alert.read ? undefined : "hsl(var(--muted) / 0.5)" }}
            >
              <div className="flex-1 min-w-0">
                <div className={`text-[11px] font-semibold truncate ${ALERT_COLORS[alert.type]}`}>{alert.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{alert.message}</div>
                <div className="metric-label mt-1">{fmtDateTime(alert.createdAt)}</div>
              </div>
              {!alert.read && (
                <button onClick={() => markRead(alert.id)} className="shrink-0 mt-0.5 opacity-50 hover:opacity-100" aria-label="Mark read">
                  <Check size={11} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  ) : null;

  return (
    <header className="border-b border-border">
      <div className="px-4 pt-5 pb-4 md:px-10 md:pt-8 md:pb-5">
        <div className="flex items-start justify-between mb-5">
          <Link href="/dashboard" className="site-title" style={{ textDecoration: "none", color: "inherit" }}>
            Global<br />Assets
          </Link>
          <div className="flex items-center gap-4 mt-1" data-alerts-root>
            <button onClick={toggleTheme} className="gb-btn" style={{ padding: "8px" }} aria-label="Toggle theme">
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Bell */}
            <button
              ref={bellRef}
              onClick={toggleAlerts}
              className="relative gb-btn"
              style={{ padding: "8px", border: alertsOpen ? "1px solid var(--foreground)" : undefined }}
              aria-label="Alerts"
            >
              <Bell size={14} />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-foreground text-background text-[8px] font-bold flex items-center justify-center">
                  {unreadAlerts > 9 ? "9+" : unreadAlerts}
                </span>
              )}
            </button>

            {profile?.isAdmin && (
              <Link href="/admin" className="nav-link text-[10px]">Admin</Link>
            )}
            <button onClick={() => setConfirmSignOut(true)} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}>
              Sign Out
            </button>

            {/* Animated hamburger — 21st.dev */}
            <button
              className="group md:hidden gb-btn"
              style={{ padding: "8px" }}
              onClick={() => setMenuOpen(o => !o)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <svg className="pointer-events-none" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12L20 12" className="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]" />
                <path d="M4 12H20" className="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45" />
                <path d="M4 12H20" className="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]" />
              </svg>
            </button>
          </div>
        </div>
        <nav className="hidden md:flex gap-6">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link key={href} href={href} className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile nav drawer */}
      <nav
        className="md:hidden flex flex-col border-t border-border overflow-hidden transition-all duration-300"
        style={{ maxHeight: menuOpen ? "400px" : "0", opacity: menuOpen ? 1 : 0 }}
      >
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`px-4 py-3 border-b border-border nav-link ${pathname.startsWith(href) ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Alerts portal — renders at body level, no clipping possible */}
      {mounted && createPortal(popoverPanel, document.body)}

      {/* Sign-out loading screen — portalled to body to escape header stacking context */}
      {mounted && signingOut && createPortal(<LoadingScreen message="Signing out…" />, document.body)}

      {/* Sign-out confirmation */}
      {mounted && createPortal(
        <AnimatePresence>
          {confirmSignOut && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.65)", zIndex: 9998 }}
              onClick={() => setConfirmSignOut(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onClick={e => e.stopPropagation()}
                style={{
                  background: "var(--background)", color: "var(--foreground)",
                  border: "1px solid var(--border)", borderTop: "2px solid var(--foreground)",
                  width: "min(380px, 90vw)",
                }}
              >
                <div className="px-8 pt-7 pb-5 border-b border-border">
                  <div className="metric-label mb-3" style={{ opacity: 0.4 }}>Global Assets</div>
                  <h2 className="text-xl font-bold uppercase tracking-tight leading-none">Sign Out</h2>
                </div>
                <div className="px-8 py-6">
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                    Are you sure you want to sign out of your account?
                  </p>
                </div>
                <div className="px-8 pb-7 flex gap-3">
                  <button
                    onClick={() => setConfirmSignOut(false)}
                    className="gb-btn flex-1" style={{ padding: "12px 0", fontSize: "11px" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="gb-btn gb-btn-primary flex-1" style={{ padding: "12px 0", fontSize: "11px" }}
                  >
                    Sign Out →
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}
