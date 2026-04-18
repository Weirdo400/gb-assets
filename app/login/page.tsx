"use client";
export const dynamic = "force-dynamic";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { toast } from "sonner";
import { enableDemo } from "@/lib/demo-data";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const demoTaps = useRef(0);
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDemoTap = () => {
    demoTaps.current += 1;
    if (demoTimer.current) clearTimeout(demoTimer.current);
    demoTimer.current = setTimeout(() => { demoTaps.current = 0; }, 2000);
    if (demoTaps.current >= 5) {
      demoTaps.current = 0;
      enableDemo();
      window.location.href = "/dashboard";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const err = await signIn(email, password);
    setLoading(false);
    if (err) {
      toast.error(err);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between border-r border-border px-14 py-14 bg-foreground text-background">
        <div>
          <Link href="/" className="site-title" style={{ color: "var(--background)", textDecoration: "none" }}>
            Global<br />Assets
          </Link>
        </div>

        <div className="flex flex-col gap-10">
          {[
            { stat: "$2.4B+", label: "Assets Under Management" },
            { stat: "190+", label: "Countries Served" },
            { stat: "12", label: "Asset Classes" },
          ].map(({ stat, label }) => (
            <div key={label} className="border-t border-background/20 pt-6">
              <div className="text-4xl font-bold tracking-tight" style={{ color: "var(--background)" }}>{stat}</div>
              <div className="mt-1 text-[11px] uppercase tracking-widest font-medium" style={{ color: "var(--background)", opacity: 0.6 }}>{label}</div>
            </div>
          ))}
        </div>

        <div className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--background)", opacity: 0.4 }}>
          Global Assets Clearing Corp. — Est. 2019
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-col justify-between px-10 py-12 lg:px-20">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/" className="text-2xl font-bold uppercase tracking-tight" style={{ textDecoration: "none", color: "inherit" }}>Global Assets</Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
          <div className="mb-10">
            <div className="metric-label mb-2">Welcome Back</div>
            <h1 className="text-3xl font-bold uppercase tracking-tight leading-none">Sign In to<br />Your Account</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="metric-label">Email Address</label>
              <input
                className="gb-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="metric-label">Password</label>
              <input
                className="gb-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="gb-btn gb-btn-primary w-full mt-2"
              style={{ padding: "16px", fontSize: "12px" }}
              disabled={loading}
            >
              {loading ? "Signing In…" : "Sign In →"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border flex flex-col gap-3">
            <p className="metric-label">
              No account?{" "}
              <Link href="/register" style={{ color: "inherit", textDecoration: "underline" }}>
                Create one for free
              </Link>
            </p>
            <p className="metric-label text-[10px]">
              By signing in you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        <footer className="metric-label text-[10px] mt-8" onClick={handleDemoTap} style={{ cursor: "default", userSelect: "none" }}>
          © {new Date().getFullYear()} Global Assets Clearing Corp. All investments involve risk.
        </footer>
      </div>
    </div>
  );
}
