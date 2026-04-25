"use client";
import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from "react";
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Investment, Transaction, Position, ASSETS, WatchlistItem } from "@/lib/types";
import { simulatePrice, generateHistory } from "@/lib/utils";
import { useLivePrices } from "@/hooks/useLivePrices";
import {
  isDemoMode,
  DEMO_PROFILE, DEMO_POSITIONS, DEMO_TRANSACTIONS, DEMO_WATCHLIST,
  DEMO_TOTAL_BALANCE, DEMO_HISTORY,
} from "@/lib/demo-data";

interface PortfolioState {
  totalBalance: number;
  availableBalance: number;
  investedFunds: number;
  profitLoss: number;
  profitLossPercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  todayChange: number;
  todayChangePercent: number;
  positions: Position[];
  transactions: Transaction[];
  portfolioHistory: { date: string; value: number }[];
  watchlist: WatchlistItem[];
  unreadAlerts: number;
}

interface RawData {
  investments: Investment[];
  transactions: Transaction[];
  watchlist: WatchlistItem[];
  unreadAlerts: number;
  availableBalance: number;
  investedBalanceFallback: number;
  overrideInvestedFunds: number | null;
  overrideTodaysPL: number | null;
  overrideTotalReturn: number | null;
}

interface PortfolioContextType extends PortfolioState {
  buyShares: (ticker: string, qty: number) => Promise<string | null>;
  sellShares: (ticker: string, qty: number) => Promise<string | null>;
  deposit: (amount: number, note?: string) => Promise<string | null>;
  withdraw: (amount: number, note?: string, details?: string) => Promise<string | null>;
  addToWatchlist: (ticker: string) => Promise<void>;
  removeFromWatchlist: (ticker: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const INITIAL_STATE: PortfolioState = {
  totalBalance: 0, availableBalance: 0, investedFunds: 0,
  profitLoss: 0, profitLossPercent: 0, totalReturn: 0, totalReturnPercent: 0,
  todayChange: 0, todayChangePercent: 0,
  positions: [], transactions: [], portfolioHistory: [], watchlist: [], unreadAlerts: 0,
};

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { user, profile, refreshProfile } = useAuth();

  // Demo mode — bypass all live data logic
  const [demoState, setDemoState] = useState<PortfolioState | null>(null);

  // Raw Firestore data, kept separate from computed state so live prices can recompute positions
  const [rawData, setRawData] = useState<RawData | null>(null);

  // Derive tickers from raw investments so useLivePrices can subscribe
  const tickers = useMemo(
    () => (rawData?.investments ?? []).filter(i => i.shares > 0).map(i => i.ticker),
    [rawData]
  );

  const { prices: livePrices } = useLivePrices(tickers);

  // Recompute positions whenever raw investments or live prices change
  const positions = useMemo<Position[]>(() => {
    if (!rawData) return [];
    return rawData.investments
      .filter(inv => inv.shares > 0)
      .map(inv => {
        const base = ASSETS[inv.ticker]?.price ?? inv.currentPrice;
        const live = livePrices[inv.ticker];
        // Use live price when available and non-zero, fall back to simulatePrice
        const currentPrice =
          live?.price && live.price > 0
            ? live.price
            : simulatePrice(base, Date.now() / 1000 + inv.ticker.charCodeAt(0));
        const totalValue = currentPrice * inv.shares;
        const pnl = totalValue - inv.purchasePrice * inv.shares;
        const pnlPercent = ((currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100;
        return {
          ticker: inv.ticker,
          assetName: inv.assetName,
          shares: inv.shares,
          purchasePrice: inv.purchasePrice,
          currentPrice,
          totalValue,
          pnl,
          pnlPercent,
          sparkData: Array.from({ length: 12 }, (_, i) =>
            simulatePrice(inv.purchasePrice, i * 80 + inv.ticker.charCodeAt(0))
          ),
        };
      });
  }, [rawData, livePrices]);

  // Derive portfolio totals from computed positions + raw data
  const computedState = useMemo<PortfolioState>(() => {
    if (!rawData) return INITIAL_STATE;

    const {
      transactions, watchlist, unreadAlerts, availableBalance,
      investedBalanceFallback, overrideInvestedFunds, overrideTodaysPL, overrideTotalReturn,
      investments,
    } = rawData;

    const computedInvested = positions.reduce((s, p) => s + p.totalValue, 0);
    const totalCost = investments.reduce((s, i) => s + i.purchasePrice * i.shares, 0);
    const computedReturn = computedInvested - totalCost;

    const investedFunds =
      overrideInvestedFunds != null
        ? overrideInvestedFunds
        : computedInvested || investedBalanceFallback;

    const totalReturn = overrideTotalReturn != null ? overrideTotalReturn : computedReturn;
    const profitLoss =
      overrideTodaysPL != null ? overrideTodaysPL : computedReturn * 0.04;

    const totalBalance = availableBalance + investedFunds;
    const totalReturnPercent = investedFunds > 0 ? (totalReturn / investedFunds) * 100 : 0;
    const profitLossPercent = totalBalance > 0 ? (profitLoss / totalBalance) * 100 : 0;

    return {
      totalBalance,
      availableBalance,
      investedFunds,
      profitLoss,
      profitLossPercent,
      totalReturn,
      totalReturnPercent,
      todayChange: profitLoss,
      todayChangePercent: profitLossPercent,
      positions,
      transactions,
      portfolioHistory: generateHistory(totalBalance || 1000),
      watchlist,
      unreadAlerts,
    };
  }, [rawData, positions]);

  const state = demoState ?? computedState;

  const loadData = useCallback(async () => {
    if (!user || !profile) return;

    const impersonateUid = typeof window !== "undefined" ? localStorage.getItem("gb_impersonate_uid") : null;
    const effectiveUid = impersonateUid || user.uid;

    if (isDemoMode()) {
      setDemoState({
        totalBalance: DEMO_TOTAL_BALANCE,
        availableBalance: DEMO_PROFILE.availableBalance,
        investedFunds: DEMO_TOTAL_BALANCE - DEMO_PROFILE.availableBalance,
        profitLoss: DEMO_PROFILE.overrideTodaysPL!,
        profitLossPercent: (DEMO_PROFILE.overrideTodaysPL! / DEMO_TOTAL_BALANCE) * 100,
        totalReturn: DEMO_PROFILE.overrideTotalReturn!,
        totalReturnPercent: (DEMO_PROFILE.overrideTotalReturn! / (DEMO_TOTAL_BALANCE - DEMO_PROFILE.overrideTotalReturn!)) * 100,
        todayChange: DEMO_PROFILE.overrideTodaysPL!,
        todayChangePercent: (DEMO_PROFILE.overrideTodaysPL! / DEMO_TOTAL_BALANCE) * 100,
        positions: DEMO_POSITIONS,
        transactions: DEMO_TRANSACTIONS,
        portfolioHistory: DEMO_HISTORY,
        watchlist: DEMO_WATCHLIST,
        unreadAlerts: 2,
      });
      return;
    }

    const [invSnap, txSnap, wlSnap, alertSnap] = await Promise.all([
      getDocs(query(collection(db, "investments"), where("uid", "==", effectiveUid))),
      getDocs(query(collection(db, "transactions"), where("uid", "==", effectiveUid), orderBy("createdAt", "desc"))),
      getDocs(query(collection(db, "watchlist"), where("uid", "==", effectiveUid))),
      getDocs(query(collection(db, "alerts"), where("uid", "==", effectiveUid), where("read", "==", false))),
    ]);

    setRawData({
      investments: invSnap.docs.map(d => ({ id: d.id, ...d.data() } as Investment)),
      transactions: txSnap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)),
      watchlist: wlSnap.docs.map(d => d.data() as WatchlistItem),
      unreadAlerts: alertSnap.size,
      availableBalance: profile.availableBalance ?? 0,
      investedBalanceFallback: profile.investedBalance ?? 0,
      overrideInvestedFunds: profile.overrideInvestedFunds ?? null,
      overrideTodaysPL: profile.overrideTodaysPL ?? null,
      overrideTotalReturn: profile.overrideTotalReturn ?? null,
    });
  }, [user, profile]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user, loadData]);

  const refreshData = useCallback(async () => {
    await refreshProfile();
    await loadData();
  }, [refreshProfile, loadData]);

  const buyShares = useCallback(async (ticker: string, qty: number): Promise<string | null> => {
    if (!user) return "Not authenticated";
    const asset = ASSETS[ticker.toUpperCase()];
    if (!asset) return "Invalid ticker";
    const cost = asset.price * qty;

    const freshSnap = await getDoc(doc(db, "users", user.uid));
    if (!freshSnap.exists()) return "Profile not found";
    const freshBalance = (freshSnap.data().availableBalance ?? 0) as number;
    if (cost > freshBalance) return "Insufficient funds";

    const invSnap = await getDocs(
      query(collection(db, "investments"), where("uid", "==", user.uid), where("ticker", "==", ticker.toUpperCase()))
    );

    if (!invSnap.empty) {
      const existing = invSnap.docs[0];
      await updateDoc(existing.ref, {
        shares: (existing.data().shares as number) + qty,
        currentPrice: asset.price,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await addDoc(collection(db, "investments"), {
        uid: user.uid,
        ticker: ticker.toUpperCase(),
        assetName: asset.name,
        shares: qty,
        purchasePrice: asset.price,
        currentPrice: asset.price,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    await updateDoc(doc(db, "users", user.uid), { availableBalance: freshBalance - cost });
    await addDoc(collection(db, "transactions"), {
      uid: user.uid,
      type: "buy",
      ticker: ticker.toUpperCase(),
      assetName: asset.name,
      shares: qty,
      amount: cost,
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await refreshData();
    return null;
  }, [user, refreshData]);

  const sellShares = useCallback(async (ticker: string, qty: number): Promise<string | null> => {
    if (!user) return "Not authenticated";
    const pos = state.positions.find(p => p.ticker === ticker.toUpperCase());
    if (!pos) return "You don't hold this asset";
    if (qty > pos.shares) return `You only own ${pos.shares} shares`;
    const proceeds = pos.currentPrice * qty;

    const invSnap = await getDocs(
      query(collection(db, "investments"), where("uid", "==", user.uid), where("ticker", "==", ticker.toUpperCase()))
    );
    if (invSnap.empty) return "Investment not found";
    const existing = invSnap.docs[0];
    const remaining = (existing.data().shares as number) - qty;
    if (remaining <= 0) {
      await deleteDoc(existing.ref);
    } else {
      await updateDoc(existing.ref, { shares: remaining, updatedAt: new Date().toISOString() });
    }

    const freshSnap = await getDoc(doc(db, "users", user.uid));
    const freshBalance = (freshSnap.data()?.availableBalance ?? 0) as number;
    await updateDoc(doc(db, "users", user.uid), { availableBalance: freshBalance + proceeds });

    await addDoc(collection(db, "transactions"), {
      uid: user.uid,
      type: "sell",
      ticker: ticker.toUpperCase(),
      assetName: pos.assetName,
      shares: qty,
      amount: proceeds,
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await refreshData();
    return null;
  }, [user, state.positions, refreshData]);

  const deposit = useCallback(async (amount: number, note?: string): Promise<string | null> => {
    if (!user) return "Not authenticated";
    if (amount <= 0) return "Enter a valid amount";
    await addDoc(collection(db, "transactions"), {
      uid: user.uid,
      type: "deposit",
      amount,
      status: "pending",
      adminNote: note || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await refreshData();
    return null;
  }, [user, refreshData]);

  const withdraw = useCallback(async (amount: number, note?: string, details?: string): Promise<string | null> => {
    if (!user) return "Not authenticated";
    if (amount <= 0) return "Enter a valid amount";
    if (amount > state.availableBalance) return "Insufficient available funds";
    await addDoc(collection(db, "transactions"), {
      uid: user.uid,
      type: "withdrawal",
      amount,
      status: "pending",
      adminNote: note || null,
      withdrawalDetails: details || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await refreshData();
    return null;
  }, [user, state.availableBalance, refreshData]);

  const addToWatchlist = useCallback(async (ticker: string) => {
    if (!user) return;
    const asset = ASSETS[ticker];
    if (!asset) return;
    const item: WatchlistItem = { uid: user.uid, ticker, assetName: asset.name, addedAt: new Date().toISOString() };
    setRawData(prev => {
      if (!prev) return prev;
      if (prev.watchlist.some(w => w.ticker === ticker)) return prev;
      return { ...prev, watchlist: [...prev.watchlist, item] };
    });
    try {
      const existing = await getDocs(
        query(collection(db, "watchlist"), where("uid", "==", user.uid), where("ticker", "==", ticker))
      );
      if (existing.empty) await addDoc(collection(db, "watchlist"), item);
    } catch { /* keep local state on Firestore failure */ }
  }, [user]);

  const removeFromWatchlist = useCallback(async (ticker: string) => {
    if (!user) return;
    setRawData(prev => {
      if (!prev) return prev;
      return { ...prev, watchlist: prev.watchlist.filter(w => w.ticker !== ticker) };
    });
    try {
      const snap = await getDocs(
        query(collection(db, "watchlist"), where("uid", "==", user.uid), where("ticker", "==", ticker))
      );
      for (const d of snap.docs) await deleteDoc(d.ref);
    } catch { /* ignore */ }
  }, [user]);

  return (
    <PortfolioContext.Provider value={{
      ...state,
      buyShares, sellShares, deposit, withdraw,
      addToWatchlist, removeFromWatchlist, refreshData,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
