"use client";
export const dynamic = "force-dynamic";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/deposits", label: "Deposits" },
  { href: "/admin/withdrawals", label: "Withdrawals" },
  { href: "/admin/kyc", label: "KYC" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !profile?.isAdmin)) {
      router.push("/dashboard");
    }
  }, [user, profile, loading, router]);

  if (loading || !profile?.isAdmin) {
    return <div className="flex items-center justify-center min-h-screen metric-label">Loading…</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-10 pt-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <Link href="/admin" className="font-bold uppercase text-lg tracking-tight" style={{ textDecoration: "none", color: "inherit" }}>
            Global Assets — Admin
          </Link>
          <Link href="/dashboard" className="nav-link">← Client Portal</Link>
        </div>
        <nav className="flex gap-5 flex-wrap">
          {ADMIN_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
