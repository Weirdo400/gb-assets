"use client";
import * as React from "react";
import Link from "next/link";
import { Sun, Moon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Animated hamburger / close icon ── */
type MenuToggleProps = React.ComponentProps<"svg"> & { open: boolean; duration?: number };

function MenuToggleIcon({
  open, className, fill = "none", stroke = "currentColor",
  strokeWidth = 2.5, strokeLinecap = "round", strokeLinejoin = "round",
  duration = 500, ...props
}: MenuToggleProps) {
  return (
    <svg
      strokeWidth={strokeWidth} fill={fill} stroke={stroke}
      viewBox="0 0 32 32" strokeLinecap={strokeLinecap} strokeLinejoin={strokeLinejoin}
      className={cn("transition-transform ease-in-out", open && "-rotate-45", className)}
      style={{ transitionDuration: `${duration}ms` }}
      {...props}
    >
      <path
        className={cn(
          "transition-all ease-in-out",
          open
            ? "[stroke-dasharray:20_300] [stroke-dashoffset:-32.42px]"
            : "[stroke-dasharray:12_63]",
        )}
        style={{ transitionDuration: `${duration}ms` }}
        d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
      />
      <path d="M7 16 27 16" />
    </svg>
  );
}

/* ── Nav data ── */
const NAV = [
  {
    label: "Markets", href: "/markets",
    sub: [
      { label: "Cryptocurrency", href: "/markets?tab=Cryptocurrency" },
      { label: "Forex",          href: "/markets?tab=Forex" },
      { label: "Stocks",         href: "/markets?tab=Stocks" },
      { label: "Stablecoins",    href: "/markets?tab=Stablecoins" },
    ],
  },
  {
    label: "Plans", href: "/plans",
    sub: [
      { label: "Foundation — from $10k", href: "/plans" },
      { label: "Growth — from $100k",    href: "/plans" },
      { label: "Elite — from $250k",     href: "/plans" },
    ],
  },
  {
    label: "Company", href: "/company",
    sub: [
      { label: "About Us",           href: "/company?tab=About+Us" },
      { label: "Safety of Funds",    href: "/company?tab=Safety+of+Funds" },
      { label: "Terms & Conditions", href: "/company?tab=Terms+%26+Conditions" },
      { label: "Privacy Policy",     href: "/company?tab=Privacy+Policy" },
      { label: "FAQ",                href: "/company?tab=FAQ" },
      { label: "Contact Us",         href: "/contact" },
    ],
  },
];

/* ── Component ── */
export default function PublicNav({
  dark, toggleTheme, left,
}: {
  dark: boolean;
  toggleTheme: () => void;
  left?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const desktopNavRef = React.useRef<HTMLElement>(null);

  /* close desktop dropdown on outside click */
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeMobile = () => { setMobileOpen(false); setExpanded(null); };

  return (
    <div className="border-b border-border" style={{ position: "relative", zIndex: 40 }}>

      {/* ── Bar ── */}
      <div className="px-5 md:px-12 py-4 flex items-center justify-between md:grid md:grid-cols-3">

        {/* Logo */}
        <div>
          {left ?? (
            <Link href="/" className="font-bold uppercase tracking-tight text-sm whitespace-nowrap"
              style={{ textDecoration: "none", color: "inherit" }}>
              Global Assets
            </Link>
          )}
        </div>

        {/* Desktop nav — click-triggered */}
        <nav ref={desktopNavRef} className="hidden md:flex items-center justify-center gap-1">
          {NAV.map(item => (
            <div key={item.label} className="relative">
              <button
                onClick={() => setOpen(open === item.label ? null : item.label)}
                className="relative inline-flex h-9 items-center justify-center gap-1 px-4 text-[11px] uppercase tracking-widest transition-colors hover:bg-accent hover:text-accent-foreground"
                style={{
                  background: open === item.label ? "var(--accent)" : "transparent",
                  color: "inherit", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontWeight: 500, letterSpacing: "0.05em",
                }}
              >
                {item.label}
                <ChevronDown size={9} style={{
                  opacity: 0.5, transition: "transform 0.2s ease",
                  transform: open === item.label ? "rotate(-180deg)" : "rotate(0deg)",
                }} />
              </button>

              <AnimatePresence>
                {open === item.label && (
                  <div className="absolute left-0 top-full z-50 pt-2">
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15, ease: "easeOut" }}
                      style={{
                        background: "var(--background)", border: "1px solid var(--border)",
                        borderTop: "2px solid var(--foreground)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
                        minWidth: "200px",
                      }}
                    >
                      <div style={{
                        position: "absolute", top: "-5px", left: "24px",
                        width: "8px", height: "8px",
                        background: "var(--foreground)", transform: "rotate(45deg)",
                      }} />
                      <ul>
                        {item.sub.map((s, i) => (
                          <li key={s.label}>
                            <Link
                              href={s.href}
                              onClick={() => setOpen(null)}
                              className="group flex items-center px-4 py-2.5 text-[10px] uppercase tracking-widest transition-colors hover:bg-accent hover:text-accent-foreground"
                              style={{
                                textDecoration: "none", color: "var(--muted-foreground)",
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
          <button onClick={toggleTheme} className="gb-btn" style={{ padding: "8px" }} aria-label="Toggle theme">
            {dark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <Link href="/login" className="nav-link hidden md:block">Sign In</Link>
          <Link href="/register"
            className="gb-btn gb-btn-primary hidden md:inline-flex text-[10px] py-1.5 px-4"
            style={{ textDecoration: "none" }}>
            Open Account
          </Link>

          {/* Hamburger */}
          <button
            className="md:hidden"
            onClick={() => { setMobileOpen(v => !v); setExpanded(null); }}
            aria-label="Menu"
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}
          >
            <MenuToggleIcon open={mobileOpen} className="w-5 h-5" duration={400} />
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-border overflow-hidden"
            style={{ background: "var(--background)", color: "var(--foreground)" }}
          >
            {NAV.map((item, idx) => (
              <div key={item.label} className="border-b border-border">

                {/* Section header — click to expand */}
                <button
                  onClick={() => setExpanded(expanded === item.label ? null : item.label)}
                  className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-accent"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontFamily: "inherit" }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] tabular-nums font-mono opacity-25">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[13px] uppercase tracking-widest font-bold">
                      {item.label}
                    </span>
                  </div>
                  <ChevronDown size={13} style={{
                    opacity: 0.5, transition: "transform 0.25s ease",
                    transform: expanded === item.label ? "rotate(-180deg)" : "rotate(0deg)",
                  }} />
                </button>

                {/* Sub-items — accordion */}
                <AnimatePresence>
                  {expanded === item.label && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      {item.sub.map((s, i) => (
                        <Link
                          key={s.label}
                          href={s.href}
                          onClick={closeMobile}
                          className="flex items-center gap-3 py-3 text-[11px] uppercase tracking-widest transition-colors hover:bg-accent"
                          style={{
                            paddingLeft: "3.5rem", paddingRight: "1.25rem",
                            textDecoration: "none", color: "var(--muted-foreground)",
                            borderTop: "1px solid var(--border)",
                          }}
                        >
                          <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "var(--muted-foreground)", opacity: 0.5 }} />
                          {s.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Auth */}
            <div className="p-4 flex flex-col gap-2">
              <Link href="/login" onClick={closeMobile}
                className="gb-btn w-full text-center" style={{ textDecoration: "none" }}>
                Sign In
              </Link>
              <Link href="/register" onClick={closeMobile}
                className="gb-btn gb-btn-primary w-full text-center" style={{ textDecoration: "none" }}>
                Open Account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
