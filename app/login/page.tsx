"use client";
export const dynamic = "force-dynamic";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { toast } from "sonner";
import { enableDemo } from "@/lib/demo-data";
import { Eye, EyeOff } from "lucide-react";
import SnakeLine from "@/components/SnakeLine";
import LoadingScreen from "@/components/LoadingScreen";

const EMAIL_PROVIDERS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com",
  "protonmail.com", "live.com", "aol.com", "msn.com", "me.com",
];

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const demoTaps = useRef(0);
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    const atIdx = val.indexOf("@");
    if (atIdx === -1) { setEmailSuggestions([]); return; }
    const domain = val.slice(atIdx + 1).toLowerCase();
    const filtered = EMAIL_PROVIDERS.filter(p => p.startsWith(domain)).slice(0, 5);
    setEmailSuggestions(domain === "" ? EMAIL_PROVIDERS.slice(0, 5) : filtered);
  };

  const pickSuggestion = (provider: string) => {
    const atIdx = email.indexOf("@");
    const local = atIdx === -1 ? email : email.slice(0, atIdx);
    setEmail(`${local}@${provider}`);
    setEmailSuggestions([]);
    emailRef.current?.focus();
  };

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Please enter a valid email address"); return; }
    setLoading(true);
    const err = await signIn(email, password);
    if (err) {
      setLoading(false);
      toast.error(err);
    } else {
      setSigningIn(true);
      router.push("/dashboard");
    }
  };

  return (
    <>
    {signingIn && <LoadingScreen message="Signing in…" />}
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between border-r border-border px-14 py-14 bg-foreground text-background relative overflow-hidden">
        <SnakeLine />
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

      {/* Right — form panel with background image */}
      <div
        className="flex flex-col justify-between px-10 py-12 lg:px-20 relative"
        style={{
          backgroundImage: "url('/signin-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
        {/* Dark overlay so form stays readable */}
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
        {/* Content sits above overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full flex-1">
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
              <div className="relative">
                <input
                  ref={emailRef}
                  className="gb-input"
                  type="text"
                  inputMode="email"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  onBlur={() => setTimeout(() => setEmailSuggestions([]), 150)}
                  placeholder="Email address"
                  required
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                  data-bwignore="true"
                  data-form-type="other"
                />
                {emailSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 border border-border border-t-0" style={{ background: "var(--background)", color: "var(--foreground)" }}>
                    {emailSuggestions.map(provider => {
                      const atIdx = email.indexOf("@");
                      const local = atIdx === -1 ? email : email.slice(0, atIdx);
                      return (
                        <button
                          key={provider}
                          type="button"
                          onMouseDown={() => pickSuggestion(provider)}
                          className="w-full text-left px-3 py-2 text-[12px] hover:bg-accent transition-colors flex items-center gap-1"
                        >
                          <span className="opacity-50">{local}</span>
                          <span className="font-medium">@{provider}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="text-center text-[13px] leading-none tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>· · ·</div>
            <div className="flex flex-col gap-2">
              <label className="metric-label">Password</label>
              <div className="relative">
                <input
                  className="gb-input w-full pr-10"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
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

        <footer className="metric-label text-[10px] mt-8" onClick={handleDemoTap} style={{ cursor: "default", userSelect: "none", color: "rgba(255,255,255,0.5)" }}>
          © {new Date().getFullYear()} Global Assets Clearing Corp. All investments involve risk.
        </footer>
        </div>
      </div>
    </div>
    </>
  );
}
