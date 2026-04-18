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

// Finnhub symbol mapping
export const FINNHUB_SYMBOLS: Record<string, string> = {
  // Stocks & ETFs
  AAPL: "AAPL", NVDA: "NVDA", MSFT: "MSFT", GOOGL: "GOOGL", META: "META",
  AMD: "AMD", INTC: "INTC", CRM: "CRM", ORCL: "ORCL", ADBE: "ADBE", QCOM: "QCOM",
  AMZN: "AMZN", SHOP: "SHOP", BABA: "BABA", EBAY: "EBAY",
  TSLA: "TSLA", F: "F", GM: "GM", RIVN: "RIVN",
  JPM: "JPM", GS: "GS", BAC: "BAC", V: "V", MA: "MA", BRK: "BRK.B",
  JNJ: "JNJ", PFE: "PFE", UNH: "UNH", ABBV: "ABBV",
  XOM: "XOM", CVX: "CVX", BP: "BP",
  NFLX: "NFLX", DIS: "DIS", SPOT: "SPOT",
  VOO: "VOO", QQQ: "QQQ", SPY: "SPY", IWM: "IWM", GLD: "GLD",
  // Crypto (Binance pairs)
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

const BASE_PRICES: Record<string, number> = {
  AAPL: 175.43, NVDA: 432.9, MSFT: 415.6, GOOGL: 141.8, META: 502.3,
  AMD: 168.4, INTC: 31.2, CRM: 274.5, ORCL: 122.3, ADBE: 475.8, QCOM: 158.9,
  AMZN: 178.5, SHOP: 71.3, BABA: 74.2, EBAY: 47.6,
  TSLA: 241.3, F: 11.8, GM: 44.9, RIVN: 12.4,
  JPM: 195.2, GS: 392.1, BAC: 37.8, V: 271.4, MA: 453.7, BRK: 358.9,
  JNJ: 156.3, PFE: 27.4, UNH: 521.8, ABBV: 168.2,
  XOM: 104.7, CVX: 152.3, BP: 34.1,
  NFLX: 628.4, DIS: 91.2, SPOT: 314.6,
  VOO: 410.22, QQQ: 432.8, SPY: 487.3, IWM: 198.4, GLD: 218.7,
  BTC: 68200, ETH: 3520, SOL: 155.4, BNB: 412.0,
  XRP: 0.524, ADA: 0.448, AVAX: 36.8, DOT: 7.12, LINK: 14.6, MATIC: 0.712,
};

export function useLivePrices(tickers: string[]) {
  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const [prices, setPrices] = useState<LivePrices>(() => {
    const init: LivePrices = {};
    tickers.forEach(t => {
      init[t] = { price: BASE_PRICES[t] ?? 0, prevPrice: BASE_PRICES[t] ?? 0, change: 0, changePercent: 0, volume: 0, updatedAt: Date.now() };
    });
    return init;
  });
  const [connected, setConnected] = useState(false);

  // Fetch initial quotes via REST (fills in real open/close data)
  const fetchQuotes = useCallback(async () => {
    if (!apiKey) return;
    await Promise.allSettled(
      tickers.map(async ticker => {
        const symbol = FINNHUB_SYMBOLS[ticker];
        if (!symbol || symbol.includes(":")) return; // skip crypto for REST (use WS)
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

  const connect = useCallback(() => {
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
          // Find our ticker from the Finnhub symbol
          const ticker = Object.entries(FINNHUB_SYMBOLS).find(
            ([, s]) => s === trade.s
          )?.[0];
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
        reconnectRef.current = setTimeout(connect, 5000);
      }
    };
  }, [apiKey, tickers]);

  useEffect(() => {
    mountedRef.current = true;
    fetchQuotes();
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect, fetchQuotes]);

  return { prices, connected };
}
