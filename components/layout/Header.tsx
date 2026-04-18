"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePortfolio } from "@/context/PortfolioContext";
import { Bell, Moon, Sun, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Portfolio" },
  { href: "/market", label: "Market" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/analytics", label: "Analytics" },
  { href: "/history", label: "History" },
  { href: "/funds", label: "Transfers" },
  { href: "/account", label: "Account" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { unreadAlerts } = usePortfolio();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gb-theme");
    if (stored === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("gb-theme", next ? "dark" : "light");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="border-b border-border">
      <div className="px-10 pt-8 pb-5">
        <div className="flex items-start justify-between mb-5">
          <Link href="/dashboard" className="site-title" style={{ textDecoration: "none", color: "inherit" }}>
            Global<br />Assets
          </Link>
          <div className="flex items-center gap-4 mt-1">
            <button onClick={toggleTheme} className="gb-btn p-2" style={{ padding: "8px" }} aria-label="Toggle theme">
              {dark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <Link href="/account#alerts" className="relative" style={{ color: "inherit" }}>
              <Bell size={14} />
              {unreadAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-foreground text-background text-[8px] font-bold flex items-center justify-center">
                  {unreadAlerts > 9 ? "9+" : unreadAlerts}
                </span>
              )}
            </Link>
            {profile?.isAdmin && (
              <Link href="/admin" className="nav-link text-[10px]">Admin</Link>
            )}
            <button onClick={handleSignOut} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}>
              Sign Out
            </button>
            <button className="md:hidden" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
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
      {menuOpen && (
        <nav className="md:hidden flex flex-col border-t border-border">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-10 py-3 border-b border-border nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
