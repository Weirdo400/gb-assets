"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";

const SECTIONS = ["Cryptocurrency", "Forex", "Stocks", "Stablecoins"] as const;
type Section = typeof SECTIONS[number];

export default function MarketsPage() {
  const [active, setActive] = useState<Section>("Cryptocurrency");
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
        <div className="metric-label mb-4 tracking-[0.2em]">Asset Classes</div>
        <h1 className="font-bold uppercase tracking-tight leading-none mb-6" style={{ fontSize: "clamp(40px, 7vw, 96px)", letterSpacing: "-0.03em" }}>
          Markets We<br />Trade.
        </h1>
        <p className="text-muted-foreground max-w-xl leading-relaxed" style={{ fontSize: "14px" }}>
          Global Assets operates across all major financial markets on your behalf —
          crypto, forex, equities, and stablecoins — 24 hours a day, professionally managed.
        </p>
      </section>

      {/* Sticky tab nav */}
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

      {/* ── CRYPTOCURRENCY ── */}
      {active === "Cryptocurrency" && (
        <div className="px-6 md:px-12 py-14 max-w-4xl">
          <div className="metric-label mb-4 tracking-[0.2em]">Digital Assets</div>
          <h2 className="font-bold uppercase tracking-tight leading-none mb-8" style={{ fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-0.03em" }}>
            Cryptocurrency
          </h2>

          {/* Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border mb-12">
            {[
              { stat: "1,000+", label: "Cryptocurrencies in Circulation" },
              { stat: "$23K+", label: "Bitcoin Peak in Dec 2020" },
              { stat: "24/7", label: "Markets Never Close" },
            ].map(({ stat, label }) => (
              <div key={label} className="px-6 py-6" style={{ background: "var(--background)" }}>
                <div className="text-2xl font-bold tabular mb-1">{stat}</div>
                <div className="metric-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-8 text-[13px] leading-relaxed text-muted-foreground">
            <p>
              The first cryptocurrency, called Bit-Gold, was created by Nick Szabo — designed and based on an encrypted algorithm
              that draws its value from the number of transactions made on the asset. That currency never gained traction, until
              in 2009, Satoshi Nakamoto designed a superior algorithm that draws value from the entire cryptocurrency system
              collectively, making it a fully secure asset. To hack the new algorithm, you would need to hack every server
              containing the cryptocurrency around the world — virtually impossible. Nakamoto called it <strong className="text-foreground">Bitcoin</strong>.
            </p>
            <p>
              Today there are more than 1,000 different cryptocurrencies, and the blockchain technology they are based on is
              being implemented in almost every major bank around the world. The idea behind cryptocurrencies is to put financial
              power back in public hands. Some currencies have jumped from a few cents to thousands of dollars. This is the future — and it is already here.
            </p>

            <div className="border-l-2 border-border pl-6 py-2">
              <p className="text-foreground font-medium">
                At the start of 2020, as economies shut down from COVID-19 and investor portfolios suffered, Bitcoin surged from
                lows of $4,000 in Q1 2020 to over $23,000 by December — proving itself as digital gold. Global Assets offers
                you access to Bitcoin and leading cryptocurrencies, managed professionally on your behalf.
              </p>
            </div>

            <div>
              <h3 className="text-foreground font-bold uppercase tracking-wide text-[11px] mb-4">Key Factors Influencing Bitcoin Price</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
                {[
                  { label: "Supply & Demand", body: "Like gold, Bitcoin has a finite supply. Market participants determine fair value based on use cases and adoption." },
                  { label: "Media Coverage", body: "Positive media coverage of Bitcoin and blockchain technology provides favourable fundamentals and emboldens investors." },
                  { label: "Regulation", body: "Government regulation can both constrain and legitimise Bitcoin. Positive regulation drives increased institutional demand." },
                  { label: "Bitcoin Halving", body: "When mining rewards are halved, supply is theoretically limited. With supply reduced, demand and price tend to rise." },
                ].map(({ label, body }) => (
                  <div key={label} className="px-6 py-5" style={{ background: "var(--background)" }}>
                    <div className="font-bold uppercase text-[10px] tracking-widest text-foreground mb-2">{label}</div>
                    <p className="text-[12px]">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-foreground font-bold uppercase tracking-wide text-[11px] mb-4">Why Trade Crypto With Global Assets</h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: "Security", body: "We hold client funds in segregated accounts, complying with the highest standards of financial safety across multiple jurisdictions." },
                  { label: "Full Asset Coverage", body: "Alongside Bitcoin, we trade Ethereum, Solana, BNB, XRP, Cardano, Avalanche, Chainlink, Polygon, and more." },
                  { label: "24/7 Management", body: "Crypto markets never close. Our trading desk monitors your positions around the clock so you don't have to." },
                  { label: "Expert Execution", body: "We are backed by large liquidity providers, enabling fast and precise execution on all cryptocurrency trades." },
                ].map(({ label, body }) => (
                  <div key={label} className="flex gap-4">
                    <span className="metric-label shrink-0 mt-0.5">—</span>
                    <div>
                      <span className="font-bold uppercase text-[11px] tracking-wide text-foreground">{label} </span>
                      <span className="text-[12px]">{body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOREX ── */}
      {active === "Forex" && (
        <div className="px-6 md:px-12 py-14 max-w-4xl">
          <div className="metric-label mb-4 tracking-[0.2em]">Foreign Exchange</div>
          <h2 className="font-bold uppercase tracking-tight leading-none mb-8" style={{ fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-0.03em" }}>
            Forex
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border mb-12">
            {[
              { stat: "$7.5T", label: "Daily Forex Trading Volume" },
              { stat: "3", label: "Currency Pair Categories" },
              { stat: "24/5", label: "Market Hours" },
            ].map(({ stat, label }) => (
              <div key={label} className="px-6 py-6" style={{ background: "var(--background)" }}>
                <div className="text-2xl font-bold tabular mb-1">{stat}</div>
                <div className="metric-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-8 text-[13px] leading-relaxed text-muted-foreground">
            <p>
              Forex trading is the act of buying one currency while simultaneously selling another, with the aim of profiting
              from changes in exchange rates over time. The forex market is the largest and most liquid financial market in
              the world, with over $7.5 trillion traded daily — eliminating any liquidity concerns for major currency pairs.
            </p>
            <p>
              The knowledge and skill required to successfully navigate forex markets makes it anything but simple for individual
              investors. Global Assets removes that barrier — our professional traders manage your forex exposure with discipline,
              risk controls, and real-time market intelligence.
            </p>

            <div>
              <h3 className="text-foreground font-bold uppercase tracking-wide text-[11px] mb-4">Currency Pair Categories</h3>
              <div className="flex flex-col gap-px bg-border border border-border">
                {[
                  {
                    label: "Major Pairs",
                    body: "The most popular and liquid pairs — always include the US Dollar. Examples: EUR/USD, USD/JPY, GBP/USD.",
                  },
                  {
                    label: "Minor Pairs (Crosses)",
                    body: "Do not include the US Dollar, but contain other major currencies. Examples: EUR/CHF, EUR/GBP, GBP/JPY.",
                  },
                  {
                    label: "Exotic Pairs",
                    body: "A major currency paired with a developing economy currency. Examples: USD/HKD, USD/NOK, EUR/TRY.",
                  },
                ].map(({ label, body }) => (
                  <div key={label} className="flex gap-6 px-6 py-5" style={{ background: "var(--background)" }}>
                    <div className="w-40 shrink-0 font-bold uppercase text-[10px] tracking-widest text-foreground pt-0.5">{label}</div>
                    <p className="text-[12px]">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-l-2 border-border pl-6 py-2">
              <p className="text-foreground font-medium">
                Global Assets trades all three categories of currency pairs on your behalf, using sophisticated risk management
                to protect your capital while targeting consistent returns across the world's most liquid markets.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── STOCKS ── */}
      {active === "Stocks" && (
        <div className="px-6 md:px-12 py-14 max-w-4xl">
          <div className="metric-label mb-4 tracking-[0.2em]">Equities</div>
          <h2 className="font-bold uppercase tracking-tight leading-none mb-8" style={{ fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-0.03em" }}>
            Stocks
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border mb-12">
            {[
              { stat: "NYSE & NASDAQ", label: "Direct Exchange Access" },
              { stat: "50+", label: "Stocks in Our Portfolio" },
              { stat: "Real-Time", label: "Pricing & Execution" },
            ].map(({ stat, label }) => (
              <div key={label} className="px-6 py-6" style={{ background: "var(--background)" }}>
                <div className="text-xl font-bold tabular mb-1">{stat}</div>
                <div className="metric-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-8 text-[13px] leading-relaxed text-muted-foreground">
            <p>
              Stock trading allows investors to benefit from the growth of the world's leading companies over time.
              Global Assets provides access to direct liquidity pricing with real-time data straight from the two largest
              stock exchanges in the world — the NYSE and NASDAQ — managed entirely on your behalf.
            </p>
            <p>
              Our portfolio includes high-performing technology stocks such as Apple, Microsoft, NVIDIA, Alphabet, and Meta —
              historically known as growth stocks. The demand for technology and devices is expected to grow indefinitely,
              making these among the most compelling long-term holdings in any managed portfolio.
            </p>

            <div>
              <h3 className="text-foreground font-bold uppercase tracking-wide text-[11px] mb-4">Why Stocks in Your Portfolio</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border">
                {[
                  { label: "Diversification", body: "Stocks move independently of many other assets, providing a valuable buffer during downturns in other instruments." },
                  { label: "No Time Limits", body: "Unlike derivatives, stocks can be held for any duration — ideal for long-term growth strategies and compounding returns." },
                  { label: "Growth Potential", body: "Blue-chip and growth stocks offer exposure to the world's most innovative companies and their long-term value creation." },
                ].map(({ label, body }) => (
                  <div key={label} className="px-6 py-5" style={{ background: "var(--background)" }}>
                    <div className="font-bold uppercase text-[10px] tracking-widest text-foreground mb-2">{label}</div>
                    <p className="text-[12px]">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STABLECOINS ── */}
      {active === "Stablecoins" && (
        <div className="px-6 md:px-12 py-14 max-w-4xl">
          <div className="metric-label mb-4 tracking-[0.2em]">Stable Digital Assets</div>
          <h2 className="font-bold uppercase tracking-tight leading-none mb-8" style={{ fontSize: "clamp(32px, 5vw, 64px)", letterSpacing: "-0.03em" }}>
            Stablecoins
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border border border-border mb-12">
            {[
              { stat: "1:1", label: "USD-Pegged Stability" },
              { stat: "$150B+", label: "USDT Market Cap" },
              { stat: "Zero", label: "Volatility by Design" },
            ].map(({ stat, label }) => (
              <div key={label} className="px-6 py-6" style={{ background: "var(--background)" }}>
                <div className="text-2xl font-bold tabular mb-1">{stat}</div>
                <div className="metric-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-8 text-[13px] leading-relaxed text-muted-foreground">
            <p>
              Stablecoins are a class of digital assets designed to maintain a fixed value — typically pegged 1:1 to the
              US Dollar. Unlike Bitcoin or Ethereum, stablecoins do not fluctuate wildly in price, making them a critical
              component of any balanced digital asset portfolio. The most widely used stablecoin is <strong className="text-foreground">USDT (Tether)</strong>,
              with a market capitalisation exceeding $150 billion.
            </p>
            <p>
              Within a managed portfolio, stablecoins serve multiple strategic functions — they act as a safe harbour during
              periods of market volatility, enable rapid reallocation into other asset classes when opportunities arise, and
              generate yield through lending and liquidity protocols. Global Assets uses stablecoins as a core liquidity
              instrument within your managed portfolio.
            </p>

            <div>
              <h3 className="text-foreground font-bold uppercase tracking-wide text-[11px] mb-4">Role of Stablecoins in Your Portfolio</h3>
              <div className="flex flex-col gap-px bg-border border border-border">
                {[
                  { label: "Capital Preservation", body: "During periods of high volatility across crypto or equities, positions are moved into stablecoins to protect your capital without exiting the market." },
                  { label: "Liquidity Buffer", body: "Stablecoins allow our traders to move rapidly into new positions as opportunities emerge, without delays from fiat conversion." },
                  { label: "Yield Generation", body: "Idle stablecoin holdings can generate passive yield through institutional lending programmes and liquidity pools, adding returns beyond price appreciation." },
                  { label: "Settlement & Transfers", body: "Stablecoins enable instant, low-cost settlement between accounts and across borders — faster and cheaper than traditional wire transfers." },
                ].map(({ label, body }) => (
                  <div key={label} className="flex gap-6 px-6 py-5" style={{ background: "var(--background)" }}>
                    <div className="w-44 shrink-0 font-bold uppercase text-[10px] tracking-widest text-foreground pt-0.5">{label}</div>
                    <p className="text-[12px]">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-l-2 border-border pl-6 py-2">
              <p className="text-foreground font-medium">
                Global Assets actively uses USDT and other leading stablecoins as a strategic layer within every managed
                portfolio — balancing risk, preserving gains, and ensuring your capital is always working efficiently.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="px-6 md:px-12 py-20 border-t border-border flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div>
          <div className="metric-label mb-4">Ready to Invest?</div>
          <h2 className="font-bold uppercase tracking-tight leading-none" style={{ fontSize: "clamp(28px, 5vw, 64px)", letterSpacing: "-0.03em" }}>
            Let Us Trade<br />For You.
          </h2>
        </div>
        <div className="flex flex-col items-start md:items-end gap-4">
          <p className="text-muted-foreground text-[13px] leading-relaxed max-w-xs md:text-right">
            Get your invite code, open your account, and let Global Assets manage your portfolio across all markets.
          </p>
          <div className="flex gap-3">
            <Link href="/plans" className="gb-btn" style={{ textDecoration: "none", padding: "14px 24px", fontSize: "11px" }}>
              View Plans
            </Link>
            <Link href="/register" className="gb-btn gb-btn-primary" style={{ textDecoration: "none", padding: "14px 24px", fontSize: "11px" }}>
              Apply Now →
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-12 py-6 border-t border-border flex items-center justify-between">
        <div className="font-bold uppercase tracking-tight text-sm">Global Assets</div>
        <div className="metric-label text-[10px]">© {new Date().getFullYear()} Global Assets Clearing Corp. All investments involve risk.</div>
      </footer>
    </div>
  );
}
