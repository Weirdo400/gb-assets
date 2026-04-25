"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export interface LivePrice {
  price: number;
  prevPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  updatedAt: number;
}

export type LivePrices = Record<string, LivePrice>;

// Finnhub symbol mapping (used when NEXT_PUBLIC_FINNHUB_API_KEY is set)
export const FINNHUB_SYMBOLS: Record<string, string> = {
  AAPL: "AAPL", NVDA: "NVDA", MSFT: "MSFT", GOOGL: "GOOGL", META: "META",
  AMD: "AMD", INTC: "INTC", CRM: "CRM", ORCL: "ORCL", ADBE: "ADBE", QCOM: "QCOM",
  AMZN: "AMZN", SHOP: "SHOP", BABA: "BABA", EBAY: "EBAY",
  TSLA: "TSLA", F: "F", GM: "GM", RIVN: "RIVN",
  JPM: "JPM", GS: "GS", BAC: "BAC", V: "V", MA: "MA", BRK: "BRK.B",
  JNJ: "JNJ", PFE: "PFE", UNH: "UNH", ABBV: "ABBV",
  XOM: "XOM", CVX: "CVX", BP: "BP",
  NFLX: "NFLX", DIS: "DIS", SPOT: "SPOT",
  VOO: "VOO", QQQ: "QQQ", SPY: "SPY", IWM: "IWM", GLD: "GLD",
  BTC:   "BINANCE:BTCUSDT",
  ETH:   "BINANCE:ETHUSDT",
  SOL:   "BINANCE:SOLUSDT",
  BNB:   "BINANCE:BNBUSDT",
  XRP:   "BINANCE:XRPUSDT",
  ADA:   "BINANCE:ADAUSDT",
  AVAX:  "BINANCE:AVAXUSDT",
  DOT:   "BINANCE:DOTUSDT",
  LINK:  "BINANCE:LINKUSDT",
  MATIC: "BINANCE:MATICUSDT",
};

// CoinGecko ID mapping for free crypto prices
const COINGECKO_IDS: Record<string, string> = {
  BTC:   "bitcoin",
  ETH:   "ethereum",
  SOL:   "solana",
  BNB:   "binancecoin",
  XRP:   "ripple",
  ADA:   "cardano",
  AVAX:  "avalanche-2",
  DOT:   "polkadot",
  LINK:  "chainlink",
  MATIC: "matic-network",
};

// Approximate stock fallback prices — used only before Finnhub data arrives
const BASE_PRICES: Record<string, number> = {
  AAPL: 202.0, NVDA: 105.0, MSFT: 388.0, GOOGL: 172.0, META: 562.0,
  AMD: 132.0, INTC: 20.5, CRM: 282.0, ORCL: 162.0, ADBE: 382.0, QCOM: 152.0,
  AMZN: 198.0, SHOP: 102.0, BABA: 92.0, EBAY: 56.0,
  TSLA: 268.0, F: 10.2, GM: 50.0, RIVN: 10.5,
  JPM: 252.0, GS: 552.0, BAC: 42.0, V: 338.0, MA: 542.0, BRK: 502.0,
  JNJ: 164.0, PFE: 25.5, UNH: 312.0, ABBV: 176.0,
  XOM: 116.0, CVX: 154.0, BP: 30.5,
  NFLX: 1005.0, DIS: 102.0, SPOT: 618.0,
  VOO: 538.0, QQQ: 488.0, SPY: 588.0, IWM: 196.0, GLD: 290.0,
  // Crypto base — overwritten immediately by CoinGecko fetch
  BTC: 94000, ETH: 1800, SOL: 148.0, BNB: 600.0,
  XRP: 2.20, ADA: 0.72, AVAX: 19.0, DOT: 4.1, LINK: 13.0, MATIC: 0.24,
};

const CRYPTO_TICKERS = Object.keys(COINGECKO_IDS);

export function useLivePrices(tickers: string[]) {
  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const [prices, setPrices] = useState<LivePrices>(() => {
    const init: LivePrices = {};
    tickers.forEach(t => {
      init[t] = { price: BASE_PRICES[t] ?? 0, prevPrice: BASE_PRICES[t] ?? 0, change: 0, changePercent: 0, volume: 0, updatedAt: Date.now() };
    });
    return init;
  });
  const [connected, setConnected] = useState(false);

  // CoinGecko: free, no key required — fetches real crypto prices
  const fetchCoinGecko = useCallback(async () => {
    const cryptoTickers = tickers.filter(t => CRYPTO_TICKERS.includes(t));
    if (cryptoTickers.length === 0) return;

    const ids = cryptoTickers.map(t => COINGECKO_IDS[t]).join(",");
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const data: Record<string, { usd: number; usd_24h_change: number }> = await res.json();

      setPrices(prev => {
        const next = { ...prev };
        for (const ticker of cryptoTickers) {
          const id = COINGECKO_IDS[ticker];
          const d = data[id];
          if (!d?.usd) continue;
          const prevPrice = prev[ticker]?.price ?? d.usd;
          const changePercent = d.usd_24h_change ?? 0;
          const change = d.usd * (changePercent / 100);
          next[ticker] = { price: d.usd, prevPrice, change, changePercent, volume: 0, updatedAt: Date.now() };
        }
        return next;
      });
    } catch {
      // keep existing prices on error
    }
  }, [tickers]);

  // Finnhub REST: fills stock open/close data when API key is present
  const fetchFinnhubQuotes = useCallback(async () => {
    if (!apiKey) return;
    const stockTickers = tickers.filter(t => !CRYPTO_TICKERS.includes(t));
    await Promise.allSettled(
      stockTickers.map(async ticker => {
        const symbol = FINNHUB_SYMBOLS[ticker];
        if (!symbol) return;
        try {
          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
          );
          if (!res.ok) return;
          const data = await res.json();
          if (!data.c || data.c === 0) return;
          setPrices(prev => ({
            ...prev,
            [ticker]: {
              price: data.c,
              prevPrice: data.pc || data.c,
              change: data.d ?? 0,
              changePercent: data.dp ?? 0,
              volume: 0,
              updatedAt: Date.now(),
            },
          }));
        } catch {
          // keep base price on error
        }
      })
    );
  }, [apiKey, tickers]);

  // Finnhub WebSocket: real-time trades when API key is present
  const connectFinnhub = useCallback(() => {
    if (!apiKey || !mountedRef.current) return;

    const ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      tickers.forEach(ticker => {
        const symbol = FINNHUB_SYMBOLS[ticker];
        if (symbol) ws.send(JSON.stringify({ type: "subscribe", symbol }));
      });
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type !== "trade" || !msg.data?.length) return;

        const updates: Record<string, { price: number; volume: number }> = {};
        for (const trade of msg.data) {
          const ticker = Object.entries(FINNHUB_SYMBOLS).find(([, s]) => s === trade.s)?.[0];
          if (!ticker) continue;
          if (!updates[ticker] || trade.p > 0) {
            updates[ticker] = { price: trade.p, volume: trade.v };
          }
        }

        if (Object.keys(updates).length === 0) return;

        setPrices(prev => {
          const next = { ...prev };
          for (const [ticker, { price, volume }] of Object.entries(updates)) {
            const base = BASE_PRICES[ticker] ?? prev[ticker]?.prevPrice ?? price;
            const prevPrice = prev[ticker]?.price ?? base;
            const change = price - base;
            const changePercent = base > 0 ? (change / base) * 100 : 0;
            next[ticker] = { price, prevPrice, change, changePercent, volume, updatedAt: Date.now() };
          }
          return next;
        });
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => setConnected(false);

    ws.onclose = () => {
      setConnected(false);
      if (mountedRef.current) {
        reconnectRef.current = setTimeout(connectFinnhub, 5000);
      }
    };
  }, [apiKey, tickers]);

  useEffect(() => {
    mountedRef.current = true;

    // Always fetch live crypto from CoinGecko (no key needed)
    fetchCoinGecko();
    cgIntervalRef.current = setInterval(fetchCoinGecko, 60_000);

    // Finnhub for stocks only when key is present
    fetchFinnhubQuotes();
    connectFinnhub();

    return () => {
      mountedRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (cgIntervalRef.current) clearInterval(cgIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connectFinnhub, fetchFinnhubQuotes, fetchCoinGecko]);

  return { prices, connected };
}
