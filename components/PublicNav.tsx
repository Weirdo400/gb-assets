"use client";
import * as React from "react";
import Link from "next/link";
import { Sun, Moon, ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV = [
  {
    label: "Markets",
    href: "/markets",
    sub: [
      { label: "Cryptocurrency", href: "/markets?tab=Cryptocurrency" },
      { label: "Forex",          href: "/markets?tab=Forex" },
      { label: "Stocks",         href: "/markets?tab=Stocks" },
      { label: "Stablecoins",    href: "/markets?tab=Stablecoins" },
    ],
  },
  {
    label: "Plans",
    href: "/plans",
    sub: [
      { label: "Foundation — from $10k",  href: "/plans" },
      { label: "Growth — from $100k",     href: "/plans" },
      { label: "Elite — from $250k",      href: "/plans" },
    ],
  },
  {
    label: "Company",
    href: "/company",
    sub: [
      { label: "About Us",           href: "/company?tab=About+Us" },
      { label: "Safety of Funds",    href: "/company?tab=Safety+of+Funds" },
      { label: "Terms & Conditions", href: "/company?tab=Terms+%26+Conditions" },
      { label: "Privacy Policy",     href: "/company?tab=Privacy+Policy" },
      { label: "FAQ",                href: "/company?tab=FAQ" },
    ],
  },
];

export default function PublicNav({
  dark,
  toggleTheme,
  left,
}: {
  dark: boolean;
  toggleTheme: () => void;
  left?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="border-b border-border" style={{ position: "relative", zIndex: 40 }}>
      {/* Nav bar */}
      <div className="px-5 md:px-12 py-4 flex items-center justify-between md:grid md:grid-cols-3">

        {/* Logo */}
        <div>
          {left ?? (
            <Link
              href="/"
              className="font-bold uppercase tracking-tight text-sm whitespace-nowrap"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Global Assets
            </Link>
          )}
        </div>

        {/* Center — desktop dropdown nav */}
        <nav className="hidden md:flex items-center justify-center gap-1">
          {NAV.map(item => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setOpen(item.label)}
              onMouseLeave={() => setOpen(null)}
            >
              <Link
                href={item.href}
                className="relative inline-flex h-9 items-center justify-center gap-1 px-4 text-[11px] uppercase tracking-widest transition-colors hover:bg-accent hover:text-accent-foreground"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  background: open === item.label ? "var(--accent)" : "transparent",
                }}
              >
                {item.label}
                <ChevronDown
                  size={9}
                  style={{
                    opacity: 0.5,
                    transition: "transform 0.2s ease",
                    transform: open === item.label ? "rotate(-180deg)" : "rotate(0deg)",
                  }}
                />
              </Link>

              <AnimatePresence>
                {open === item.label && (
                  <div className="absolute left-0 top-full z-50 pt-2">
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderTop: "2px solid var(--foreground)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
                        minWidth: "200px",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "-5px",
                          left: "24px",
                          width: "8px",
                          height: "8px",
                          background: "var(--foreground)",
                          transform: "rotate(45deg)",
                        }}
                      />
                      <ul>
                        {item.sub.map((s, i) => (
                          <li key={s.label}>
                            <Link
                              href={s.href}
                              className="group flex items-center px-4 py-2.5 text-[10px] uppercase tracking-widest transition-colors hover:bg-accent hover:text-accent-foreground"
                              style={{
                                textDecoration: "none",
                                color: "var(--muted-foreground)",
                                borderBottom: i < item.sub.length - 1 ? "1px solid var(--border)" : "none",
                              }}
                            >
                              {s.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={toggleTheme}
            className="gb-btn"
            style={{ padding: "8px" }}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Desktop auth */}
          <Link href="/login" className="nav-link hidden md:block">Sign In</Link>
          <Link
            href="/register"
            className="gb-btn gb-btn-primary hidden md:inline-flex text-[10px] py-1.5 px-4"
            style={{ textDecoration: "none" }}
          >
            Open Account
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden gb-btn"
            style={{ padding: "8px" }}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="md:hidden border-t border-border"
            style={{ background: "var(--background)", color: "var(--foreground)" }}
          >
            {NAV.map(item => (
              <div key={item.label}>
                <div
                  className="px-5 py-2 text-[9px] uppercase tracking-widest font-bold border-b border-border"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {item.label}
                </div>
                {item.sub.map(s => (
                  <Link
                    key={s.label}
                    href={s.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-5 py-3 text-[11px] uppercase tracking-widest border-b border-border transition-colors hover:bg-accent"
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            ))}

            <div className="p-4 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="gb-btn w-full text-center"
                style={{ textDecoration: "none" }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="gb-btn gb-btn-primary w-full text-center"
                style={{ textDecoration: "none" }}
              >
                Open Account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
