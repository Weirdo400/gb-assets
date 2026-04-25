"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import PublicNav from "@/components/PublicNav";

const SECTIONS = ["About Us", "Safety of Funds", "Terms & Conditions", "Privacy Policy", "FAQ"] as const;
type Section = typeof SECTIONS[number];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        className="w-full flex items-center justify-between px-0 py-5 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-bold uppercase text-[11px] tracking-wide pr-6">{q}</span>
        {open ? <ChevronUp size={14} className="shrink-0 opacity-50" /> : <ChevronDown size={14} className="shrink-0 opacity-50" />}
      </button>
      {open && <p className="text-[13px] text-muted-foreground leading-relaxed pb-5">{a}</p>}
    </div>
  );
}

export default function CompanyPage() {
  const [active, setActive] = useState<Section>("About Us");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gb-theme");
    setDark(stored !== "light");
    const tab = new URLSearchParams(window.location.search).get("tab") as Section | null;
    if (tab && (SECTIONS as readonly string[]).includes(tab)) setActive(tab);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("gb-theme", next ? "dark" : "light");
  };

  return (
    <div className="plans-bg min-h-screen text-foreground">

      <PublicNav dark={dark} toggleTheme={toggleTheme} />

      {/* Hero */}
      <section className="px-6 md:px-12 py-16 border-b border-border">
        <div className="metric-label mb-4 tracking-[0.2em]">Company Information</div>
        <h1 className="font-bold uppercase tracking-tight leading-none" style={{ fontSize: "clamp(40px, 7vw, 96px)", letterSpacing: "-0.03em" }}>
          Global Assets<br />Clearing Corp.
        </h1>
      </section>

      {/* Tab nav */}
      <div className="sticky top-0 z-10 border-b border-border" style={{ background: "var(--background)", backdropFilter: "blur(8px)" }}>
        <div className="px-6 md:px-12 flex gap-0 overflow-x-auto">
          {SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className="nav-link shrink-0 py-4 mr-6"
              style={{
                borderBottom: active === s ? "2px solid var(--foreground)" : "2px solid transparent",
                opacity: active === s ? 1 : 0.5,
                paddingBottom: "14px",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── ABOUT US ── */}
      {active === "About Us" && (
        <div className="px-6 md:px-12 py-14 max-w-4xl">
          <div className="metric-label mb-4 tracking-[0.2em]">Who We Are</div>
          <h2 className="font-bold uppercase tracking-tight leading-none mb-10" style={{ fontSize: "clamp(28px, 4vw, 56px)", letterSpacing: "-0.03em" }}>
            Putting Our<br />Clients First.
          </h2>

          <p className="text-[13px] text-muted-foreground leading-relaxed mb-12 max-w-2xl">
            For over five years, Global Assets Clearing Corp. has been empowering investors by managing their capital across the world's most dynamic financial markets. We exist to give every qualified investor access to institutional-grade trading — managed professionally, transparently, and with your financial goals at the centre of every decision.
          </p>

          {/* Philosophy / Mission / Vision */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border mb-14">
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22V12M12 12C12 12 7 9 7 5a5 5 0 0 1 10 0c0 4-5 7-5 7z"/>
                  </svg>
                ),
                label: "Philosophy",
                points: [
                  { word: "Simplify", body: "Focus on what matters in a complex global environment." },
                  { word: "Preserve", body: "Deliver superior performance with measured, controlled risk." },
                  { word: "Grow", body: "Target high-performance returns on invested capital." },
                ],
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                ),
                label: "Mission",
                body: "To deliver highly competitive and sustainable returns to investors — preserving and growing their wealth in today's rapidly evolving global marketplace. We provide safe, stable, and profitable management of your capital, serving as your bridge to financial freedom.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                ),
                label: "Vision",
                body: "To be recognised across the financial services industry as a benchmark firm — one that delivers sustainable returns, upheld by our core values of integrity, reliability, trust, and respect. We make your money work harder for you.",
              },
            ].map((item, i) => (
              <div key={i} className="px-8 py-8 flex flex-col gap-5" style={{ background: "var(--background)" }}>
                <div className="opacity-50">{item.icon}</div>
                <div className="font-bold uppercase tracking-widest text-[11px]">{item.label}</div>
                {"points" in item ? (
                  <div className="flex flex-col gap-3">
                    {(item as { points: { word: string; body: string }[] }).points.map(p => (
                      <div key={p.word} className="text-[12px] text-muted-foreground">
                        <span className="font-bold text-foreground">{p.word}: </span>{p.body}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{item.body}</p>
                )}
              </div>
            ))}
          </div>

          {/* What makes us stand out */}
          <div className="mb-12">
            <div className="font-bold uppercase text-[11px] tracking-widest mb-6">What Makes Us Stand Out</div>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
              Trading financial markets at a high level is not achieved overnight. It demands years of discipline, research, and refined execution. What sets Global Assets apart is our team of seasoned traders — professionals who have paid their dues, developed battle-tested systems, and consistently delivered results. We combine rigorous market research, disciplined risk management, and proven trading frameworks to offer you a service that is both safe and performance-driven.
            </p>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Our risk management framework is a cornerstone of everything we do. Every account is protected by structured position sizing, stop-loss protocols, and capital preservation rules that ensure your downside is always defined and controlled.
            </p>
          </div>

          {/* Strategy */}
          <div className="mb-12">
            <div className="font-bold uppercase text-[11px] tracking-widest mb-6">Our Strategy</div>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
              Global Assets employs a multi-layered trading approach combining manual, intraday, technical, fundamental, and price-action analysis. This integrated method gives us the clearest possible picture of market conditions and enables us to place high-probability trades with defined stop losses.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
              {[
                { label: "FIFO Compliant", body: "All trades follow first-in, first-out principles — no martingale, no grid, no averaging, no pyramiding." },
                { label: "Capital Preservation", body: "We cut losses early and ride trends — one trade per instrument, always within defined risk parameters." },
                { label: "Adaptive", body: "Our strategy is discretionary and adapts to any changing market condition — suitable for accounts of all sizes." },
                { label: "Integrated Analysis", body: "We combine intraday fundamental, technical, and valuation analysis for the most complete market view possible." },
              ].map(({ label, body }) => (
                <div key={label} className="px-6 py-5" style={{ background: "var(--background)" }}>
                  <div className="font-bold uppercase text-[10px] tracking-widest mb-2">{label}</div>
                  <p className="text-[12px] text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Our Clients */}
          <div>
            <div className="font-bold uppercase text-[11px] tracking-widest mb-6">Our Clients</div>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-6">
              Global Assets serves a diverse and growing base of investors across the globe — from first-time private investors to institutional fund managers and corporate entities.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Private Investors", "High Net-Worth Individuals", "Corporate Investors", "Fund Managers", "Financial Planners", "Professional Advisors", "Institutions", "Stockbrokers"].map(c => (
                <div key={c} className="border border-border px-4 py-2 text-[10px] uppercase font-semibold tracking-widest">{c}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SAFETY OF FUNDS ── */}
      {active === "Safety of Funds" && (
        <div className="px-6 md:px-12 py-14 max-w-4xl">
          <div className="metric-label mb-4 tracking-[0.2em]">Fund Security</div>
          <h2 className="font-bold uppercase tracking-tight leading-none mb-10" style={{ fontSize: "clamp(28px, 4vw, 56px)", letterSpacing: "-0.03em" }}>
            Safety of<br />Your Funds.
          </h2>

          <p className="text-[13px] text-muted-foreground leading-relaxed mb-12 max-w-2xl">
            At Global Assets, the safety of your capital is a fundamental pillar of our operation — not an afterthought. We take every necessary step to ensure your funds are protected to the highest possible standard at all times.
          </p>

          {/* Three pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border mb-14">
            {[
              { label: "Data Security", body: "We employ the highest standards of encryption technology across all client data and transactions. SSL certificates protect every deposit and personal data exchange." },
              { label: "Segregated Accounts", body: "All client funds are held in segregated accounts, completely separate from Global Assets' own operational funds at all times. Your money is never co-mingled with company funds." },
              { label: "Tier 1 Banks", body: "Client funds are held exclusively at world-class, Tier 1 international banking institutions that operate independently of Global Assets." },
            ].map(({ label, body }) => (
              <div key={label} className="px-6 py-8" style={{ background: "var(--background)" }}>
                <div className="font-bold uppercase text-[10px] tracking-widest mb-3">{label}</div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-10">
            <div>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-4">Segregation of Client Funds</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Client fund security is a cornerstone of the Global Assets philosophy. Every client account carries a unique reference code, ensuring funds are used solely for that client's purposes. All deposited funds are fully segregated in accordance with our strict internal policies and in compliance with applicable financial regulations. You can be assured that your funds are safe, accounted for, and accessible.
              </p>
            </div>

            <div>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-4">Insurance Coverage</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Global Assets has implemented an additional layer of protection for our clients through a comprehensive insurance arrangement. This coverage safeguards clients against errors, omissions, negligence, fraud, and other risks that may lead to financial loss — providing coverage of up to $5,000,000 per eligible client.
              </p>
            </div>

            <div>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-4">Anti-Money Laundering (AML)</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                Global Assets maintains a zero-tolerance policy toward money laundering. We have comprehensive AML procedures in place to prevent and detect any unlawful financial activity on our platform.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  "All clients must provide valid government-issued proof of identity",
                  "Proof of address via utility bill or official bank statement is required",
                  "Client names are screened against known terrorism and sanctions lists",
                  "Transaction patterns are continuously monitored for suspicious activity",
                  "We do not accept cash, money orders, or transfers from sanctioned jurisdictions",
                  "Countries subject to international sanctions (including Iran, North Korea, Yemen, and Syria) are not eligible",
                ].map((p, i) => (
                  <div key={i} className="flex items-start gap-3 text-[12px] text-muted-foreground">
                    <span className="metric-label shrink-0 mt-0.5">—</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-4">Risk Management</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Global Assets operates an automated risk management system across all managed accounts. This system is designed to ensure that client account balances never go negative. Our trading team applies strict position sizing, stop-loss protocols, and real-time account monitoring as standard practice for every portfolio under management.
              </p>
            </div>

            <div>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-4">Confidentiality</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                All client information — including account details, transaction history, and personal data — is treated as strictly confidential by every member of the Global Assets team. This information is never disclosed to any third party unless required by applicable law or a regulatory authority.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TERMS & CONDITIONS ── */}
      {active === "Terms & Conditions" && (
        <div className="px-6 md:px-12 py-14 max-w-4xl">
          <div className="metric-label mb-4 tracking-[0.2em]">Legal Agreement</div>
          <h2 className="font-bold uppercase tracking-tight leading-none mb-6" style={{ fontSize: "clamp(28px, 4vw, 56px)", letterSpacing: "-0.03em" }}>
            Terms &<br />Conditions.
          </h2>
          <p className="text-[12px] text-muted-foreground leading-relaxed mb-12">
            This agreement is between the client and Global Assets Clearing Corp. ("Global Assets"), operating the platform at globalassets.com. This agreement supersedes any prior agreement. Any perceived contradictions should be raised with Global Assets for clarification. Where translations differ from the English version, the English text shall prevail.
          </p>

          <div className="flex flex-col gap-12">
            <div>
              <div className="font-bold uppercase text-[12px] tracking-widest mb-6 pb-3 border-b border-border">A — General Definitions</div>
              <div className="flex flex-col gap-px bg-border border border-border">
                {[
                  { term: "Client", def: "Any counterparty to Global Assets, including subscribers and users of the platform — whether an individual or institution." },
                  { term: "Base Currency", def: "The United States Dollar (USD / $) is the base currency for all transactions with Global Assets." },
                  { term: "Business Day", def: "Any day on which the international banking system is open and operational." },
                  { term: "Products", def: "All investment products and services offered by Global Assets, including managed portfolio plans and the client portal." },
                  { term: "Trade", def: "Any execution of an investment decision made by the Global Assets trading desk on behalf of a client." },
                  { term: "Age Restriction", def: "Services are available exclusively to individuals aged 18 years and above." },
                  { term: "Completed Trade", def: "Any transaction for which a confirmation has been communicated to the client via the platform or by email." },
                ].map(({ term, def }) => (
                  <div key={term} className="flex gap-6 px-6 py-4" style={{ background: "var(--background)" }}>
                    <div className="w-40 shrink-0 font-bold uppercase text-[10px] tracking-widest pt-0.5">{term}</div>
                    <p className="text-[12px] text-muted-foreground">{def}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-bold uppercase text-[12px] tracking-widest mb-6 pb-3 border-b border-border">B — Overview of Terms</div>
              <div className="flex flex-col gap-6 text-[13px] text-muted-foreground leading-relaxed">
                <div><span className="font-bold uppercase text-[10px] tracking-widest text-foreground block mb-1">Legal Relationship</span>Global Assets acts as the counterparty and portfolio manager in all client investment arrangements. This is a consequence of the managed-investment nature of our services.</div>
                <div><span className="font-bold uppercase text-[10px] tracking-widest text-foreground block mb-1">Initiation of Agreement</span>The terms of this agreement become effective from the moment a client creates an account with Global Assets.</div>
                <div><span className="font-bold uppercase text-[10px] tracking-widest text-foreground block mb-1">Regulatory Compliance</span>Global Assets complies with generally accepted financial regulations and accounting standards. As an international entity, we adhere to the applicable laws of every jurisdiction in which we operate.</div>
                <div><span className="font-bold uppercase text-[10px] tracking-widest text-foreground block mb-1">Regulatory Inquiries</span>Global Assets will cooperate fully with any government or regulatory body requesting information about specific accounts or transactions. We do not disclose client information to private third parties.</div>
                <div><span className="font-bold uppercase text-[10px] tracking-widest text-foreground block mb-1">Inactivity</span>In the event of no activity on a client account for more than 3 consecutive months, a monthly inactivity fee of $99.90 may be applied from the third month onwards.</div>
                <div><span className="font-bold uppercase text-[10px] tracking-widest text-foreground block mb-1">Withdrawals & Reimbursements</span>Global Assets prioritises client reimbursements. Any balance not required to support open positions will be returned to the client as promptly as possible. Wire transfer withdrawals may incur a $40 bank handling fee in addition to any charges levied by the client's bank.</div>
              </div>
            </div>

            <div>
              <div className="font-bold uppercase text-[12px] tracking-widest mb-6 pb-3 border-b border-border">C — Duration of Agreement</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                This agreement remains in effect until either the client submits a written termination request to Global Assets, or Global Assets notifies the client of termination. Termination of the agreement does not release either party from obligations accumulated during the contract period. Global Assets reserves the right to modify these terms at any time. Clients are encouraged to review this agreement periodically.
              </p>
            </div>

            <div>
              <div className="font-bold uppercase text-[12px] tracking-widest mb-6 pb-3 border-b border-border">D — Client Suitability & Responsibility</div>
              <div className="flex flex-col gap-4 text-[13px] text-muted-foreground leading-relaxed">
                <p>All clients are assumed to be at least 18 years of age and of legal capacity to enter a binding financial agreement. Global Assets openly acknowledges that all investments carry inherent risk. It is presumed that each client invests in a manner suited to their personal risk tolerance. Global Assets bears no responsibility for losses arising from market movements or investment outcomes.</p>
                <p>Global Assets invests significant resources in providing accurate market analysis and reporting. However, any opinions shared by Global Assets staff are informational in nature and do not constitute financial advice. Clients are responsible for making their own rational investment decisions.</p>
              </div>
            </div>

            <div>
              <div className="font-bold uppercase text-[12px] tracking-widest mb-6 pb-3 border-b border-border">E — KYC & Data Collection</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                When registering with Global Assets, clients are required to provide personal and financial information for KYC (Know Your Client) compliance. This enables us to serve you appropriately and in accordance with regulatory obligations.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  "Government-issued photo ID (passport or national ID card)",
                  "Proof of address (utility bill or official bank statement dated within 3 months)",
                  "Financial background information to assess suitability",
                  "Personal data is retained for a minimum of 5 years following the end of a client relationship",
                ].map((p, i) => (
                  <div key={i} className="flex items-start gap-3 text-[12px] text-muted-foreground">
                    <span className="metric-label shrink-0 mt-0.5">—</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-bold uppercase text-[12px] tracking-widest mb-6 pb-3 border-b border-border">F — Legal Age</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Global Assets services are available only to individuals aged 18 or above, or the legal age of majority in your jurisdiction. By registering, you confirm that you meet this requirement and that all information submitted is accurate. Global Assets reserves the right to request proof of age and may suspend any account pending satisfactory verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── PRIVACY POLICY ── */}
      {active === "Privacy Policy" && (
        <div className="px-6 md:px-12 py-14 max-w-4xl">
          <div className="metric-label mb-4 tracking-[0.2em]">Data Protection</div>
          <h2 className="font-bold uppercase tracking-tight leading-none mb-6" style={{ fontSize: "clamp(28px, 4vw, 56px)", letterSpacing: "-0.03em" }}>
            Privacy<br />Policy.
          </h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-12">
            Global Assets is fully committed to protecting the privacy and confidentiality of all client personal and financial information. By opening an account, the client consents to the collection, processing, storage, and use of personal information as described in this policy.
          </p>

          <div className="flex flex-col gap-10">
            <div>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-4">Information We Collect</div>
              <div className="flex flex-col gap-px bg-border border border-border">
                {[
                  { label: "Application Information", body: "Name, address, date of birth, email address, and other registration details provided during account setup." },
                  { label: "Transaction Information", body: "Anticipated transaction volumes, financial background, and income details used to construct your economic profile." },
                  { label: "Verification Information", body: "Identity documents such as a passport, national ID, or driver's licence, as well as background information from public records where required." },
                ].map(({ label, body }) => (
                  <div key={label} className="flex gap-6 px-6 py-5" style={{ background: "var(--background)" }}>
                    <div className="w-48 shrink-0 font-bold uppercase text-[10px] tracking-widest pt-0.5">{label}</div>
                    <p className="text-[12px] text-muted-foreground">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-4">How We Use Your Information</div>
              <div className="flex flex-col gap-2">
                {[
                  "To verify your identity and confirm eligibility for our services",
                  "To manage your account and process transactions",
                  "To communicate updates, reports, and relevant platform information",
                  "To improve our services and customise your experience",
                  "For statistical analysis to enhance our product offering",
                  "To comply with legal and regulatory requirements",
                ].map((p, i) => (
                  <div key={i} className="flex items-start gap-3 text-[12px] text-muted-foreground">
                    <span className="metric-label shrink-0 mt-0.5">—</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-4">Protection of Personal Information</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                All personal information provided to Global Assets is treated as strictly confidential and shared only within Global Assets and its authorised affiliates. It will not be disclosed to any third party except as required by regulatory or legal proceedings. All data is stored on secure, encrypted servers accessible only to authorised personnel. Your account password is encrypted and is never accessible to any Global Assets employee.
              </p>
            </div>

            <div>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-4">Third Parties</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Global Assets does not sell, license, or lease personal information to third parties. Where third parties are engaged to assist with internal functions — such as account processing, compliance, or client satisfaction — their use of shared information is strictly limited to that purpose and governed by agreements equivalent to Global Assets' own data protection standards.
              </p>
            </div>

            <div>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-4">Regulatory Disclosure</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Global Assets reserves the right to disclose client information to regulatory bodies, law enforcement, or government authorities of competent jurisdiction when legally required. Such disclosures will occur on a strictly need-to-know basis, and the confidential nature of the information will be communicated to the receiving party.
              </p>
            </div>

            <div>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-4">Cookies</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Global Assets uses cookies to secure trading activity and enhance website performance. Cookies used by Global Assets do not contain personally identifiable information. We may share anonymised website usage statistics with reputable analytics providers to help improve the platform experience.
              </p>
            </div>

            <div>
              <div className="font-bold uppercase text-[11px] tracking-widest mb-4">Policy Updates</div>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Global Assets may update this Privacy Policy from time to time. Any material changes will be posted to this page. Continued use of the platform constitutes acceptance of the revised policy. Clients are encouraged to review this policy periodically.
              </p>
            </div>

            <div className="border border-border p-6">
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                By creating and maintaining an account with Global Assets Clearing Corp., you confirm that you have read, understood, and agreed to this Privacy Policy in full.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── FAQ ── */}
      {active === "FAQ" && (
        <div className="px-6 md:px-12 py-14 max-w-3xl">
          <div className="metric-label mb-4 tracking-[0.2em]">Frequently Asked Questions</div>
          <h2 className="font-bold uppercase tracking-tight leading-none mb-12" style={{ fontSize: "clamp(28px, 4vw, 56px)", letterSpacing: "-0.03em" }}>
            FAQ.
          </h2>

          <div className="border-t border-border">
            {[
              {
                q: "How do I open an account with Global Assets?",
                a: "To open an account you will need a valid invite code from a Global Assets account officer. Once you have your code, visit our registration page, enter the code, and complete the KYC verification process. Your account will be activated upon successful verification.",
              },
              {
                q: "How do I get an invite code?",
                a: "Invite codes are issued by Global Assets account officers. Contact us directly via our website or reach out to a representative to begin the process. Codes are single-use and tied to your registration.",
              },
              {
                q: "What is the minimum and maximum deposit into my account?",
                a: "The minimum deposit is $10,000, which qualifies you for the Foundation plan (up to 250% target return). The Growth plan requires a minimum of $100,000 and the Elite plan $250,000 or more. There is no fixed maximum — the Elite tier is designed for larger capital allocations. Your plan tier is assigned by your account officer based on your deposit amount.",
              },
              {
                q: "What returns can I expect?",
                a: "Target returns vary by plan — up to 250% for Foundation, up to 320% for Growth, and up to 400% for Elite. These are target figures and not guarantees. All investments carry inherent risk, and past performance does not guarantee future results.",
              },
              {
                q: "How much money can I make through Global Assets?",
                a: "The growth of your portfolio depends on your plan tier, the asset mix under management, and prevailing market conditions. Our target returns range from up to 250% (Foundation) to up to 400% (Elite). These are targets, not guaranteed figures — all investments carry inherent risk. Global Assets applies professional risk management and position sizing to protect your capital while pursuing growth on your behalf.",
              },
              {
                q: "Do I place trades myself?",
                a: "No. Global Assets is a fully managed investment platform. Our professional trading desk executes all trades on your behalf across all asset classes. You do not have direct trading access — your role is to monitor your portfolio through the client portal.",
              },
              {
                q: "What asset classes do you trade?",
                a: "Global Assets trades across all major asset classes — equities (stocks), ETFs, cryptocurrencies, forex (foreign exchange), commodities, and stablecoins. All plans include full asset class coverage.",
              },
              {
                q: "How are my funds protected?",
                a: "Client funds are held in segregated accounts at Tier 1 international banks, completely separate from Global Assets' operational funds. We maintain comprehensive insurance coverage of up to $5,000,000 per eligible client, and our risk management systems are designed to prevent negative account balances.",
              },
              {
                q: "How and when will I receive reports?",
                a: "Reporting frequency depends on your plan tier. Foundation clients receive monthly reports, Growth clients receive bi-weekly reports, and Elite clients receive weekly reports. All clients have real-time access to their portfolio through the client dashboard.",
              },
              {
                q: "How is my investment plan tier assigned?",
                a: "Your plan tier is assigned by your Global Assets account officer based on your deposit amount and investment objectives. You can view your assigned tier on your dashboard after account setup is complete.",
              },
              {
                q: "What is the withdrawal priority procedure?",
                a: "To protect all parties against fraud and minimise the risk of money laundering, Global Assets processes withdrawals in a structured order: (1) Credit/debit card withdrawals are processed first, up to the total amount deposited by that method. (2) E-wallet withdrawals are processed once all credit/debit card deposits have been fully refunded. (3) Bank wire and all other methods are used once the above channels have been exhausted. All requests are processed within 24 working hours and are immediately reflected as pending in your client account. Withdrawals are processed in the currency of the original deposit.",
              },
              {
                q: "How long does it take to receive my funds after a withdrawal request?",
                a: "Withdrawal requests are processed by our operations team within 24 working hours. E-wallet withdrawals are typically received on the same business day. Bank wire and credit/debit card withdrawals usually arrive within 2–5 business days, depending on your bank's processing times.",
              },
              {
                q: "What documents are required for account validation?",
                a: "A colour copy of a valid government-issued photo identification document is required — this may be a passport, driver's licence, or national identity card. The document must clearly show your full name, date of birth or tax identification number, an issue or expiry date, and your signature. In addition, proof of residential address is required: a residency certificate, tenancy agreement, or a recent utility bill (electricity, gas, water, telephone, internet, or cable TV) or official bank account statement dated within the last 6 months, confirming your registered address.",
              },
              {
                q: "Why do I need to submit documents for account validation?",
                a: "As a regulated company, Global Assets operates in full compliance with the requirements of our regulatory authorities. These obligations include the collection of adequate documentation as part of our KYC (Know Your Client) procedures — specifically a valid government-issued photo ID and a recent proof of address dated within the last 6 months. This process protects both you as the client and the integrity of the platform.",
              },
              {
                q: "Is my personal data safe?",
                a: "Yes. All personal and financial data is encrypted, stored on secure servers, and accessible only to authorised Global Assets personnel. We do not sell, share, or disclose client information to third parties except as required by law or regulation.",
              },
              {
                q: "What is the minimum age to invest?",
                a: "You must be at least 18 years of age, or the legal age of majority in your jurisdiction, to open an account with Global Assets.",
              },
              {
                q: "What happens if my account is inactive?",
                a: "If no activity is recorded on your account for more than 3 consecutive months, a monthly inactivity fee of $99.90 may be applied from the third month onwards.",
              },
            ].map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 md:px-12 py-6 border-t border-border flex items-center justify-between mt-8">
        <div className="font-bold uppercase tracking-tight text-sm">Global Assets</div>
        <div className="metric-label text-[10px]">© {new Date().getFullYear()} Global Assets Clearing Corp. All investments involve risk.</div>
      </footer>
    </div>
  );
}
