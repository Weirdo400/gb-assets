"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }

    const code = inviteCode.trim().toUpperCase();
    if (!code) { toast.error("An invite code is required to register"); return; }

    setLoading(true);

    // Validate invite code
    const codeRef = doc(db, "inviteCodes", code);
    const codeSnap = await getDoc(codeRef);
    if (!codeSnap.exists()) {
      toast.error("Invalid invite code");
      setLoading(false);
      return;
    }
    if (codeSnap.data()?.used) {
      toast.error("This invite code has already been used");
      setLoading(false);
      return;
    }

    const err = await signUp(email, password, fullName);
    if (err) {
      toast.error(err);
      setLoading(false);
      return;
    }

    // Mark code as used — fetch uid from auth after signup
    try {
      const { getAuth } = await import("firebase/auth");
      const uid = getAuth().currentUser?.uid ?? "unknown";
      await updateDoc(codeRef, {
        used: true,
        usedBy: uid,
        usedAt: new Date().toISOString(),
      });
    } catch {
      // Non-critical — account was already created
    }

    toast.success("Account created. Welcome to Global Assets.");
    setLoading(false);
    router.push("/dashboard");
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

        <div className="flex flex-col gap-6">
          <div className="border-t border-background/20 pt-6">
            <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--background)", opacity: 0.8 }}>
              &ldquo;Institutional-grade investment infrastructure — now accessible to every qualified investor.&rdquo;
            </p>
          </div>
          {[
            { label: "Managed Trading", body: "Our experts trade across all asset classes on your behalf." },
            { label: "Up to 400% Returns", body: "Target returns tiered by investment plan, managed professionally." },
            { label: "KYC & Compliance Ready", body: "Regulated onboarding built into the platform." },
          ].map(({ label, body }) => (
            <div key={label} className="border-t border-background/20 pt-4">
              <div className="text-[11px] uppercase tracking-widest font-bold mb-1" style={{ color: "var(--background)" }}>{label}</div>
              <div className="text-[11px]" style={{ color: "var(--background)", opacity: 0.6 }}>{body}</div>
            </div>
          ))}
        </div>

        <div className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "var(--background)", opacity: 0.4 }}>
          Global Assets Clearing Corp. — Est. 2019
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-col justify-between px-10 py-12 lg:px-20">
        <div className="lg:hidden mb-10">
          <Link href="/" className="text-2xl font-bold uppercase tracking-tight" style={{ textDecoration: "none", color: "inherit" }}>Global Assets</Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
          <div className="mb-10">
            <div className="metric-label mb-2">Get Started</div>
            <h1 className="text-3xl font-bold uppercase tracking-tight leading-none">Open Your<br />Account</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="metric-label">Invite Code</label>
              <input
                className="gb-input"
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                placeholder="Enter your invite code"
                required
                autoComplete="off"
                style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
              />
              <p className="metric-label text-[10px]">
                An invite code is required.{" "}
                <Link href="/plans" style={{ color: "inherit", textDecoration: "underline" }}>View plans →</Link>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="metric-label">Full Name</label>
              <input
                className="gb-input"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Smith"
                required
                autoComplete="name"
              />
            </div>
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
                placeholder="Min. 8 characters"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="gb-btn gb-btn-primary w-full mt-2"
              style={{ padding: "16px", fontSize: "12px" }}
              disabled={loading}
            >
              {loading ? "Verifying & Creating Account…" : "Create Account →"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border flex flex-col gap-3">
            <p className="metric-label">
              Already have an account?{" "}
              <Link href="/login" style={{ color: "inherit", textDecoration: "underline" }}>
                Sign in
              </Link>
            </p>
            <p className="metric-label text-[10px]">
              By registering you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        <footer className="metric-label text-[10px] mt-8">
          © {new Date().getFullYear()} Global Assets Clearing Corp. All investments involve risk.
        </footer>
      </div>
    </div>
  );
}
