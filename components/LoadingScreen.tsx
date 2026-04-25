"use client";
import { motion } from "framer-motion";

export default function LoadingScreen({ message = "Please wait…" }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "var(--background)", color: "var(--foreground)", zIndex: 9999 }}
    >
      <div
        className="font-bold uppercase tracking-tight text-center leading-none mb-10 select-none"
        style={{ fontSize: "clamp(40px, 6vw, 72px)", letterSpacing: "-0.04em" }}
      >
        Global<br />Assets
      </div>

      {/* Sweeping line */}
      <div className="relative overflow-hidden mb-6" style={{ width: "80px", height: "1px", background: "var(--border)" }}>
        <motion.div
          className="absolute inset-y-0"
          style={{ background: "var(--foreground)", width: "40px" }}
          animate={{ x: ["-40px", "80px"] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <p className="metric-label">{message}</p>
    </motion.div>
  );
}
