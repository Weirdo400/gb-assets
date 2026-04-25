"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Eye, EyeOff, X } from "lucide-react";
import SnakeLine from "@/components/SnakeLine";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function passwordScore(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

async function isPwned(pw: string): Promise<boolean> {
  try {
    const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(pw));
    const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const res = await fetch(`https://api.pwnedpasswords.com/range/${hex.slice(0, 5)}`, { cache: "no-store" });
    if (!res.ok) return false;
    const text = await res.text();
    return text.split("\r\n").some(line => line.split(":")[0] === hex.slice(5));
  } catch {
    return false;
  }
}

const SCORE_LABEL = ["", "Weak", "Weak", "Fair", "Strong", "Strong"];
const SCORE_COLOR = ["", "oklch(0.65 0.22 27)", "oklch(0.65 0.22 27)", "oklch(0.75 0.18 75)", "var(--color-up)", "var(--color-up)"];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua & Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia & Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon",
  "Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt",
  "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon",
  "Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar",
  "Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia",
  "Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal",
  "Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan",
  "Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
  "Romania","Russia","Rwanda","Saint Kitts & Nevis","Saint Lucia","Saint Vincent & Grenadines","Samoa","San Marino","São Tomé & Príncipe","Saudi Arabia",
  "Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa",
  "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan",
  "Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad & Tobago","Tunisia","Turkey","Turkmenistan",
  "Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City",
  "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [modal, setModal] = useState<"terms" | "privacy" | null>(null);
  const [accessTab, setAccessTab] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName) { toast.error("First and last name are required"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (passwordScore(password) < 3) { toast.error("Password is too weak — add uppercase letters, numbers, or symbols"); return; }
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (!agreed) { toast.error("You must accept the Terms & Conditions to continue"); return; }
    if (!country) { toast.error("Please select your country"); return; }

    const code = inviteCode.trim().toUpperCase();
    if (!code) { toast.error("An access code is required to register"); return; }

    setLoading(true);

    const pwned = await isPwned(password);
    if (pwned) {
      toast.error("This password appeared in a known data breach — please choose a different one");
      setLoading(false);
      return;
    }

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

    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    const err = await signUp(email, password, fullName, { username, country });
    if (err) {
      toast.error(err);
      setLoading(false);
      return;
    }

    try {
      const { getAuth } = await import("firebase/auth");
      const uid = getAuth().currentUser?.uid ?? "unknown";
      await updateDoc(codeRef, { used: true, usedBy: uid, usedAt: new Date().toISOString() });
    } catch {
      // Non-critical
    }

    toast.success("Account created. Welcome to Global Assets.");
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <><div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
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
        className="flex flex-col justify-between px-8 py-4 lg:px-14 overflow-y-auto relative"
        style={{
          backgroundImage: "url('/signin-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
      >
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
        <div className="relative z-10 flex flex-col justify-between flex-1">
        <div className="lg:hidden mb-6">
          <Link href="/" className="text-2xl font-bold uppercase tracking-tight" style={{ textDecoration: "none", color: "inherit" }}>Global Assets</Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          <div className="mb-3">
            <div className="metric-label mb-1">Get Started</div>
            <h1 className="text-2xl font-bold uppercase tracking-tight leading-none">Get Access</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            {/* Access Code */}
            <div className="flex flex-col gap-1.5 border border-border p-3" style={{ borderLeft: "3px solid var(--foreground)" }}>
              <div className="flex items-center justify-between">
                <label className="font-bold uppercase tracking-widest text-[11px]">Access Code</label>
                <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5" style={{ background: "var(--foreground)", color: "var(--background)" }}>Required</span>
              </div>
              <input
                className="gb-input"
                type="password"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter your access code"
                required
                autoComplete="off"
                style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.15em", fontSize: "13px", padding: "7px 10px" }}
              />
              <p className="text-[10px]" style={{ color: "oklch(0.72 0.18 75)" }}>
                You must have a valid access code to open an account.{" "}
                <button type="button" onClick={() => setAccessTab(true)} style={{ color: "oklch(0.72 0.18 75)", textDecoration: "underline", fontWeight: 700, background: "none", border: "none", cursor: "pointer", font: "inherit", padding: 0 }}>Get access →</button>
              </p>
            </div>

            <input className="gb-input" type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Username" required autoComplete="username" style={{ padding: "8px 12px" }} />

            <div className="text-center text-[13px] leading-none tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>· · ·</div>

            <div className="grid grid-cols-2 gap-2">
              <input className="gb-input" type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="First Name" required autoComplete="given-name" style={{ padding: "8px 12px" }} />
              <input className="gb-input" type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Last Name" required autoComplete="family-name" style={{ padding: "8px 12px" }} />
            </div>

            <div className="text-center text-[13px] leading-none tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>· · ·</div>

            <input className="gb-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email Address" required autoComplete="email" style={{ padding: "8px 12px" }} />

            <div className="text-center text-[13px] leading-none tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>· · ·</div>

            <div className="flex flex-col gap-1">
              <div className="relative">
                <input className="gb-input w-full pr-10" type={showPassword ? "text" : "password"}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password (min. 8 characters)" required autoComplete="new-password" style={{ padding: "8px 12px" }} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {password && (() => {
                const s = passwordScore(password);
                return (
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-0.5 flex-1 transition-colors duration-300"
                          style={{ background: s >= i + 1 ? SCORE_COLOR[Math.min(s, 5)] : "rgba(255,255,255,0.15)" }} />
                      ))}
                    </div>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: SCORE_COLOR[Math.min(s, 5)] }}>
                      {SCORE_LABEL[Math.min(s, 5)]}
                      {s < 3 && " — add uppercase, numbers or symbols"}
                    </p>
                  </div>
                );
              })()}
            </div>

            <div className="text-center text-[13px] leading-none tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>· · ·</div>

            <div className="relative">
              <input className="gb-input w-full pr-10" type={showConfirm ? "text" : "password"}
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password" required autoComplete="new-password" style={{ padding: "8px 12px" }} />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity">
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[10px] text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="text-center text-[13px] leading-none tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>· · ·</div>

            <Select value={country} onValueChange={v => setCountry(v ?? "")} required>
              <SelectTrigger className="gb-input w-full text-left" style={{ padding: "8px 12px", height: "auto" }}>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="text-[10px] uppercase tracking-widest">Country</SelectLabel>
                  {COUNTRIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 shrink-0 accent-foreground"
                style={{ width: "14px", height: "14px" }}
              />
              <span className="text-[11px] text-muted-foreground leading-snug">
                I agree to the{" "}
                <button type="button" onClick={() => setModal("terms")} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", font: "inherit", padding: 0 }}>Terms & Conditions</button>
                {" "}and{" "}
                <button type="button" onClick={() => setModal("privacy")} style={{ color: "inherit", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", font: "inherit", padding: 0 }}>Privacy Policy</button>
              </span>
            </label>

            <button
              type="submit"
              className="gb-btn gb-btn-primary w-full mt-1"
              style={{ padding: "12px", fontSize: "12px", opacity: agreed ? 1 : 0.5 }}
              disabled={loading}
            >
              {loading ? "Verifying & Creating Account…" : "Create Account →"}
            </button>
          </form>

          <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
            <p className="metric-label">
              Already have an account?{" "}
              <Link href="/login" style={{ color: "inherit", textDecoration: "underline" }}>Sign in</Link>
            </p>
            <p className="metric-label text-[10px]">
              By registering you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        <footer className="metric-label text-[10px] mt-8" style={{ color: "rgba(255,255,255,0.5)" }}>
          © {new Date().getFullYear()} Global Assets Clearing Corp. All investments involve risk.
        </footer>
        </div>
      </div>
    </div>

    {/* Access code info tab */}
    <div
      className="fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out"
      style={{ transform: accessTab ? "translateY(0)" : "translateY(100%)" }}
    >
      <div
        className="max-w-md mx-auto border border-b-0 border-border"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        {/* Pull bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <span className="font-bold uppercase tracking-widest text-[11px]">How to Get Access</span>
          <button onClick={() => setAccessTab(false)} className="opacity-50 hover:opacity-100 transition-opacity" aria-label="Close">
            <X size={14} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-3">
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Global Assets is an <strong style={{ color: "var(--foreground)" }}>invite-only platform</strong>. To create an account, you must have a valid access code issued by a Global Assets representative.
          </p>
          <div className="border-l-2 border-border pl-4 py-1 flex flex-col gap-1.5">
            <p className="text-[11px] uppercase tracking-widest font-bold">How to get yours</p>
            <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
              Contact your <strong style={{ color: "var(--foreground)" }}>account officer</strong> or <strong style={{ color: "var(--foreground)" }}>portfolio manager</strong> directly — they will issue your personal access code and walk you through onboarding.
            </p>
          </div>
          <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            Don&apos;t have a contact yet?{" "}
            <Link href="/plans" className="underline" style={{ color: "var(--foreground)" }}>View our plans →</Link>
          </p>
        </div>
      </div>
    </div>

    {/* Legal modal */}

    {modal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={() => setModal(null)}
      >
        <div
          className="relative w-full max-w-lg max-h-[80vh] flex flex-col border border-border"
          style={{ background: "var(--background)" }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <span className="font-bold uppercase tracking-widest text-[11px]">
              {modal === "terms" ? "Terms & Conditions" : "Privacy Policy"}
            </span>
            <button onClick={() => setModal(null)} className="opacity-50 hover:opacity-100 transition-opacity" aria-label="Close">
              <X size={14} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4 text-[12px] leading-relaxed text-muted-foreground">
            {modal === "terms" ? (
              <>
                <p className="text-foreground font-semibold text-[13px]">Global Assets Clearing Corp. — Terms & Conditions</p>
                <p>Last updated: January 2025</p>
                {[
                  ["1. Acceptance of Terms", "By accessing or using the Global Assets platform, you agree to be bound by these Terms & Conditions. If you do not agree, you may not use our services."],
                  ["2. Eligibility", "You must be at least 18 years of age and legally permitted to invest in your jurisdiction. You represent that all information provided during registration is accurate and complete."],
                  ["3. Managed Investment Services", "Global Assets Clearing Corp. provides professionally managed investment services. All trading decisions are made on your behalf by our licensed trading desk. Past performance is not indicative of future results."],
                  ["4. Risk Disclosure", "All investments involve risk. The value of your portfolio can go down as well as up. You may receive back less than you invest. Global Assets does not guarantee any specific returns."],
                  ["5. Minimum Investment", "Minimum investment thresholds apply based on the plan selected. Funds must be deposited in full before portfolio management commences."],
                  ["6. Withdrawals", "Withdrawal requests are processed within the timeframes specified in your plan agreement. Early withdrawals may be subject to restrictions during active trading cycles."],
                  ["7. Account Security", "You are responsible for maintaining the confidentiality of your login credentials. Notify us immediately of any unauthorised access to your account."],
                  ["8. Termination", "We reserve the right to suspend or terminate your account if you breach these Terms, engage in fraudulent activity, or if required by law."],
                  ["9. Governing Law", "These Terms are governed by the laws of the jurisdiction in which Global Assets Clearing Corp. is registered. Disputes shall be resolved through binding arbitration."],
                  ["10. Amendments", "We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the revised Terms."],
                ].map(([title, body]) => (
                  <div key={title as string}>
                    <div className="font-bold uppercase text-[10px] tracking-widest text-foreground mb-1">{title}</div>
                    <p>{body}</p>
                  </div>
                ))}
              </>
            ) : (
              <>
                <p className="text-foreground font-semibold text-[13px]">Global Assets Clearing Corp. — Privacy Policy</p>
                <p>Last updated: January 2025</p>
                {[
                  ["1. Information We Collect", "We collect personal information you provide during registration (name, email, country), identity verification documents for KYC compliance, and usage data to improve our platform."],
                  ["2. How We Use Your Information", "Your information is used to manage your account, process transactions, comply with legal and regulatory obligations, communicate important updates, and improve our services."],
                  ["3. KYC & AML Compliance", "As a regulated investment platform, we are required to verify your identity in accordance with Know Your Customer (KYC) and Anti-Money Laundering (AML) regulations. Your documents are stored securely and used solely for compliance purposes."],
                  ["4. Data Sharing", "We do not sell your personal data. We may share information with regulated third-party service providers (payment processors, identity verification services) strictly necessary for platform operations, and with regulatory authorities when legally required."],
                  ["5. Data Security", "We implement industry-standard security measures including encryption, secure data centres, and access controls to protect your personal information from unauthorised access or disclosure."],
                  ["6. Data Retention", "We retain your data for as long as your account is active and for a minimum period required by applicable financial regulations after account closure."],
                  ["7. Your Rights", "You have the right to access, correct, or request deletion of your personal data, subject to our legal and regulatory obligations. Contact our compliance team to exercise your rights."],
                  ["8. Cookies", "Our platform uses essential cookies to maintain your session and preferences. We do not use advertising or tracking cookies."],
                  ["9. Changes to This Policy", "We may update this Privacy Policy periodically. Material changes will be communicated via email or platform notification."],
                  ["10. Contact", "For privacy-related queries, contact our Data Protection Officer at compliance@globalassets.com."],
                ].map(([title, body]) => (
                  <div key={title as string}>
                    <div className="font-bold uppercase text-[10px] tracking-widest text-foreground mb-1">{title}</div>
                    <p>{body}</p>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border shrink-0">
            <button
              onClick={() => { setAgreed(true); setModal(null); }}
              className="gb-btn gb-btn-primary w-full"
              style={{ padding: "10px", fontSize: "11px" }}
            >
              I Accept & Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
