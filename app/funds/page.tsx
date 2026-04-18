"use client";
export const dynamic = "force-dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardShell from "@/components/layout/DashboardShell";
import { usePortfolio } from "@/context/PortfolioContext";
import { fmtCurrency } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function FundsPage() {
  return (
    <ProtectedRoute>
      <DashboardShell>
        <Funds />
      </DashboardShell>
    </ProtectedRoute>
  );
}

function Funds() {
  const { availableBalance, deposit, withdraw } = usePortfolio();
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank Transfer");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setLoading(true);
    const err = mode === "deposit"
      ? await deposit(amt, note || undefined)
      : await withdraw(amt, note || undefined, method);
    setLoading(false);
    if (err) {
      toast.error(err);
    } else {
      toast.success(mode === "deposit"
        ? "Deposit request submitted. Pending admin approval."
        : "Withdrawal request submitted. Pending admin approval."
      );
      setAmount("");
      setNote("");
    }
  };

  const DEPOSIT_METHODS = ["Bank Transfer", "USDT (TRC20)", "USDT (ERC20)", "Bitcoin (BTC)", "Ethereum (ETH)"];
  const WITHDRAW_METHODS = ["Bank Transfer", "Crypto Wallet", "Wire Transfer"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-200px)]">
      <section className="border-r border-border px-10 py-10">
        <div className="metric-label mb-2">Funds Transfer</div>
        <h1 className="text-2xl font-bold uppercase tracking-tight mb-8">
          {mode === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
        </h1>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-px bg-border border border-border mb-8">
          <button className={`gb-btn ${mode === "deposit" ? "gb-btn-primary" : ""}`} onClick={() => setMode("deposit")}>
            Deposit
          </button>
          <button className={`gb-btn ${mode === "withdraw" ? "gb-btn-primary" : ""}`} onClick={() => setMode("withdraw")}>
            Withdraw
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="metric-label">Amount (USD)</label>
            <input
              className="gb-input"
              type="number"
              placeholder="0.00"
              min="1"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="metric-label">{mode === "deposit" ? "Deposit Method" : "Withdrawal Method"}</label>
            <select className="gb-select" value={method} onChange={e => setMethod(e.target.value)}>
              {(mode === "deposit" ? DEPOSIT_METHODS : WITHDRAW_METHODS).map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="metric-label">Note / Reference (optional)</label>
            <input
              className="gb-input"
              type="text"
              placeholder="e.g. transaction hash or bank reference"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="gb-btn gb-btn-primary"
            style={{ padding: "18px" }}
            disabled={loading}
          >
            {loading ? "Submitting…" : `Submit ${mode === "deposit" ? "Deposit" : "Withdrawal"} Request`}
          </button>
        </form>

        <p className="metric-label mt-6" style={{ lineHeight: "1.6" }}>
          All requests are reviewed by our operations team within 1–3 business days.
          You will receive a notification once your request is processed.
        </p>
      </section>

      {/* Info panel */}
      <aside className="px-10 py-10">
        <div className="metric-label mb-2">Account Balance</div>
        <div className="metric-value mb-8 tabular">{fmtCurrency(availableBalance)}</div>

        <div className="border-t border-border pt-6">
          <div className="metric-label mb-4">Payment Instructions</div>
          {mode === "deposit" ? (
            <div className="flex flex-col gap-5">
              {[
                { method: "Bank Transfer", detail: "Account: GB-001-CLEAR — Routing: 021000089 — Memo: your UID" },
                { method: "USDT (TRC20)", detail: "Wallet: TRx7...4bK2 — Network: TRON TRC20" },
                { method: "USDT (ERC20)", detail: "Wallet: 0x3f...a8d4 — Network: Ethereum ERC20" },
                { method: "Bitcoin (BTC)", detail: "Wallet: bc1q...x7kp — Network: Bitcoin Mainnet" },
              ].map(({ method: m, detail }) => (
                <div key={m} className="border border-border p-4">
                  <div className="metric-label mb-1">{m}</div>
                  <div className="text-[11px]" style={{ lineHeight: "1.6" }}>{detail}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="border border-border p-4">
                <div className="metric-label mb-1">Processing Time</div>
                <div className="text-[11px]">Bank transfers: 2–5 business days. Crypto: 24–48 hours.</div>
              </div>
              <div className="border border-border p-4">
                <div className="metric-label mb-1">Requirements</div>
                <div className="text-[11px]" style={{ lineHeight: "1.6" }}>
                  KYC verification required for withdrawals over $2,500.
                  Provide your wallet address or bank details in the note field.
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
