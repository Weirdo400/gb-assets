"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Clock, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import PublicNav from "@/components/PublicNav";

const DEPARTMENTS = [
  "General Support",
  "Investor Relations",
  "Public Relations",
  "Business Plan Submission",
  "Compliance & Regulatory",
  "Partnerships",
  "KYC / Verification",
  "Trading Desk",
];

const CONTACTS = [
  {
    label: "General Support",
    tag: "24 / 5 Availability",
    description:
      "For all account, platform, and general service inquiries. Our client support team is on hand around the clock.",
    email: "support@globalassets.com",
  },
  {
    label: "Investor Relations",
    tag: "Limited Partners",
    description:
      "For existing or prospective Limited Partner and institutional investor inquiries, fund performance, and reporting.",
    email: "investorrelations@globalassets.com",
  },
  {
    label: "Public Relations",
    tag: "Media & Press",
    description:
      "For press coverage, speaking engagements, interviews, sponsorships, and all marketing-related inquiries.",
    email: "publicrelations@globalassets.com",
  },
  {
    label: "Business Plan Submissions",
    tag: "Ventures",
    description:
      "Submit your business plan for review by our investment committee. Use the form below or email directly.",
    email: "businessplan@globalassets.com",
  },
  {
    label: "Compliance & Regulatory",
    tag: "KYC / AML",
    description:
      "For KYC verification, AML queries, regulatory documentation, and all compliance-related matters.",
    email: "compliance@globalassets.com",
  },
  {
    label: "Partnerships",
    tag: "Business Development",
    description:
      "For strategic partnerships, affiliate programmes, white-label solutions, and business development opportunities.",
    email: "partnerships@globalassets.com",
  },
  {
    label: "Trading Desk",
    tag: "Managed Accounts",
    description:
      "Direct line to our managed trading team for active account holders with questions about strategy or performance.",
    email: "trading@globalassets.com",
  },
  {
    label: "Withdrawals & Payments",
    tag: "Finance",
    description:
      "For withdrawal processing status, payment method queries, and fund settlement inquiries.",
    email: "payments@globalassets.com",
  },
];

const OFFICES = [
  { city: "London", address: "1 Canada Square, Canary Wharf, E14 5AB", tz: "GMT" },
  { city: "Dubai", address: "DIFC, Gate District, Level 3, Dubai", tz: "GST" },
  { city: "Singapore", address: "1 Marina Boulevard, One Raffles Place, 018989", tz: "SGT" },
];

export default function ContactPage() {
  const [dark, setDark] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", department: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gb-theme");
    setDark(stored !== "light");
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("gb-theme", next ? "dark" : "light");
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.department || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    toast.success("Message received — our team will be in touch within 24 hours");
    setForm({ name: "", email: "", department: "", subject: "", message: "" });
    setLoading(false);
  };

  return (
    <div className="plans-bg min-h-screen text-foreground">
      <PublicNav dark={dark} toggleTheme={toggleTheme} />

      {/* ── Hero ── */}
      <section className="px-6 md:px-12 py-16 border-b border-border">
        <div className="max-w-3xl">
          <div className="metric-label mb-4">Global Assets Clearing Corp. — Est. 2019</div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none mb-6">
            Contact Us
          </h1>
          <p className="text-[15px] leading-relaxed max-w-xl" style={{ color: "var(--muted-foreground)" }}>
            Looking for Help? At Global Assets, we are always here to assist and guide you — doing all we can to help you succeed.
          </p>
          <div className="mt-6 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Clock size={13} className="opacity-40" />
              <span className="text-[11px] uppercase tracking-widest font-medium">Client support 24hrs · 5 days a week</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={13} className="opacity-40" />
              <span className="text-[11px] uppercase tracking-widest font-medium">Average response under 2 hours</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact cards ── */}
      <section className="border-b border-border">
        <div className="section-header">Contact Departments</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {CONTACTS.map((c, i) => (
            <div
              key={c.label}
              className="p-6 border-b border-r-0 md:border-r border-border last:border-b-0 flex flex-col gap-3 group"
              style={{ borderRight: (i + 1) % 2 === 0 ? "none" : undefined }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold uppercase tracking-widest text-[11px]">{c.label}</span>
                <span
                  className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 shrink-0"
                  style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                >
                  {c.tag}
                </span>
              </div>
              <p className="text-[12px] leading-relaxed flex-1" style={{ color: "var(--muted-foreground)" }}>
                {c.description}
              </p>
              <a
                href={`mailto:${c.email}`}
                className="flex items-center gap-2 text-[11px] font-medium hover:opacity-70 transition-opacity"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <Mail size={11} className="opacity-50 shrink-0" />
                {c.email}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── Offices ── */}
      <section className="border-b border-border">
        <div className="section-header">Global Offices</div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          {OFFICES.map((o, i) => (
            <div
              key={o.city}
              className="p-6 border-b md:border-b-0 border-r-0 md:border-r border-border last:border-r-0"
            >
              <div className="flex items-center gap-3 mb-3">
                <MapPin size={12} className="opacity-40 shrink-0" />
                <span className="font-bold uppercase tracking-widest text-[11px]">{o.city}</span>
                <span className="text-[9px] uppercase tracking-widest font-medium opacity-40">{o.tz}</span>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {o.address}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Response commitment ── */}
      <section className="border-b border-border">
        <div className="section-header">Response Commitment</div>
        <div className="grid grid-cols-1 md:grid-cols-4">
          {[
            { label: "General Support",      sla: "Under 2 hrs",   note: "24 / 5" },
            { label: "Investor Relations",   sla: "Under 24 hrs",  note: "Business days" },
            { label: "Compliance / KYC",     sla: "Under 48 hrs",  note: "Regulatory SLA" },
            { label: "All Other Depts.",     sla: "Under 48 hrs",  note: "Business days" },
          ].map(r => (
            <div key={r.label} className="p-6 border-b md:border-b-0 md:border-r border-border last:border-r-0">
              <div className="metric-label mb-2">{r.label}</div>
              <div className="text-2xl font-bold uppercase tracking-tight leading-none mb-1">{r.sla}</div>
              <div className="text-[10px] uppercase tracking-widest opacity-40">{r.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact form ── */}
      <section className="border-b border-border">
        <div className="section-header">Send Us a Message</div>
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left — form */}
          <div className="p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-border">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="metric-label">Full Name *</label>
                  <input className="gb-input" type="text" placeholder="Your name" value={form.name} onChange={set("name")} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="metric-label">Email *</label>
                  <input className="gb-input" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="metric-label">Department *</label>
                <select className="gb-select" value={form.department} onChange={set("department")} required>
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="metric-label">Subject</label>
                <input className="gb-input" type="text" placeholder="Brief subject" value={form.subject} onChange={set("subject")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="metric-label">Message *</label>
                <textarea
                  className="gb-input resize-none"
                  placeholder="Describe your inquiry in detail…"
                  rows={5}
                  value={form.message}
                  onChange={set("message")}
                  required
                />
              </div>

              <button
                type="submit"
                className="gb-btn gb-btn-primary w-full mt-1"
                style={{ padding: "14px", fontSize: "12px" }}
                disabled={loading}
              >
                {loading ? "Sending…" : "Send Message →"}
              </button>

              <p className="text-[10px] uppercase tracking-widest opacity-40 text-center">
                All communications are encrypted and strictly confidential
              </p>
            </form>
          </div>

          {/* Right — info */}
          <div className="p-6 md:p-10 flex flex-col gap-8">
            <div>
              <div className="metric-label mb-3">Before You Write</div>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                For account-specific queries, please have your account number or registered email ready. For KYC issues, include your full legal name and date of birth in your message.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { q: "How long until I hear back?", a: "General support responds within 2 hours, 24/5. Other departments within 1–2 business days." },
                { q: "Can I request a call?", a: "Yes — mention \"callback requested\" in your message and include a preferred time and your timezone." },
                { q: "I have not received my withdrawal.", a: "Contact payments@globalassets.com directly with your transaction reference for fastest resolution." },
                { q: "I want to open a managed account.", a: "Reach out via Investor Relations or visit our Plans page to review tier requirements." },
              ].map(item => (
                <div key={item.q} className="border-t border-border pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-1">{item.q}</p>
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{item.a}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-6">
              <div className="metric-label mb-3">New to Global Assets?</div>
              <div className="flex gap-3">
                <Link href="/plans" className="gb-btn text-[10px]" style={{ textDecoration: "none" }}>View Plans</Link>
                <Link href="/register" className="gb-btn gb-btn-primary text-[10px]" style={{ textDecoration: "none" }}>Open Account</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-12 py-6">
        <p className="metric-label text-[10px]">© {new Date().getFullYear()} Global Assets Clearing Corp. All investments involve risk. Past performance is not indicative of future results.</p>
      </footer>
    </div>
  );
}
