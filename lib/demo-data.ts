import { UserProfile, Position, Transaction, WatchlistItem, Alert } from "./types";
import { generateHistory } from "./utils";

export const DEMO_KEY = "gb_demo_mode";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEMO_KEY) === "1";
}

export function enableDemo() {
  localStorage.setItem(DEMO_KEY, "1");
}

export function disableDemo() {
  localStorage.removeItem(DEMO_KEY);
}

export const DEMO_USER = {
  uid: "demo-user-001",
  email: "demo@globalassets.com",
  displayName: "Alex Morgan",
};

export const DEMO_PROFILE: UserProfile = {
  uid: "demo-user-001",
  email: "demo@globalassets.com",
  fullName: "Alex Morgan",
  availableBalance: 24830.55,
  investedBalance: 187420.00,
  isAdmin: false,
  kycStatus: "approved",
  createdAt: "2024-03-12T09:00:00.000Z",
  otpEnabled: false,
  withdrawalDetails: null,
  overrideInvestedFunds: null,
  overrideTodaysPL: 1842.33,
  overrideTotalReturn: 22140.88,
};

export const DEMO_POSITIONS: Position[] = [
  { ticker: "AAPL",  assetName: "Apple Inc.",        shares: 45,  purchasePrice: 152.10, currentPrice: 175.43, totalValue: 7894.35,  pnl: 1049.85, pnlPercent: 15.33, sparkData: [155,158,162,159,164,168,171,170,174,175,173,175] },
  { ticker: "NVDA",  assetName: "NVIDIA Corp.",       shares: 12,  purchasePrice: 310.00, currentPrice: 432.90, totalValue: 5194.80,  pnl: 1474.80, pnlPercent: 39.65, sparkData: [312,330,355,340,370,395,410,405,420,430,428,432] },
  { ticker: "MSFT",  assetName: "Microsoft Corp.",    shares: 20,  purchasePrice: 380.00, currentPrice: 415.60, totalValue: 8312.00,  pnl: 712.00,  pnlPercent: 9.37,  sparkData: [382,388,392,385,397,402,408,410,412,414,413,415] },
  { ticker: "BTC",   assetName: "Bitcoin",            shares: 0.8, purchasePrice: 52000,  currentPrice: 68200,  totalValue: 54560.00, pnl: 12960.00,pnlPercent: 31.15, sparkData: [52000,54000,58000,55000,60000,63000,65000,64000,67000,68000,67500,68200] },
  { ticker: "ETH",   assetName: "Ethereum",           shares: 6,   purchasePrice: 2800,   currentPrice: 3520,   totalValue: 21120.00, pnl: 4320.00, pnlPercent: 25.71, sparkData: [2810,2900,3050,2950,3100,3200,3300,3280,3400,3480,3510,3520] },
  { ticker: "VOO",   assetName: "Vanguard S&P 500 ETF", shares: 50, purchasePrice: 390.00, currentPrice: 410.22, totalValue: 20511.00, pnl: 1011.00, pnlPercent: 5.18, sparkData: [391,395,398,393,400,403,406,405,408,409,410,410] },
  { ticker: "TSLA",  assetName: "Tesla Inc.",         shares: 30,  purchasePrice: 220.00, currentPrice: 241.30, totalValue: 7239.00,  pnl: 639.00,  pnlPercent: 9.68,  sparkData: [222,228,235,230,238,242,245,240,243,241,239,241] },
  { ticker: "META",  assetName: "Meta Platforms Inc.", shares: 18, purchasePrice: 450.00, currentPrice: 502.30, totalValue: 9041.40,  pnl: 941.40,  pnlPercent: 11.60, sparkData: [452,460,468,462,475,482,490,488,496,500,501,502] },
];

const now = new Date();
const d = (daysAgo: number) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString();
};

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "dt1",  uid: "demo-user-001", type: "deposit",    amount: 50000,   status: "approved",  createdAt: d(90), updatedAt: d(90) },
  { id: "dt2",  uid: "demo-user-001", type: "buy",  ticker: "BTC",  assetName: "Bitcoin",        shares: 0.8,  amount: 41600,  status: "completed", createdAt: d(88), updatedAt: d(88) },
  { id: "dt3",  uid: "demo-user-001", type: "buy",  ticker: "AAPL", assetName: "Apple Inc.",      shares: 45,   amount: 6844.5, status: "completed", createdAt: d(80), updatedAt: d(80) },
  { id: "dt4",  uid: "demo-user-001", type: "deposit",    amount: 75000,   status: "approved",  createdAt: d(75), updatedAt: d(75) },
  { id: "dt5",  uid: "demo-user-001", type: "buy",  ticker: "ETH",  assetName: "Ethereum",        shares: 6,    amount: 16800,  status: "completed", createdAt: d(70), updatedAt: d(70) },
  { id: "dt6",  uid: "demo-user-001", type: "buy",  ticker: "NVDA", assetName: "NVIDIA Corp.",    shares: 12,   amount: 3720,   status: "completed", createdAt: d(60), updatedAt: d(60) },
  { id: "dt7",  uid: "demo-user-001", type: "buy",  ticker: "VOO",  assetName: "Vanguard S&P 500 ETF", shares: 50, amount: 19500, status: "completed", createdAt: d(55), updatedAt: d(55) },
  { id: "dt8",  uid: "demo-user-001", type: "deposit",    amount: 30000,   status: "approved",  createdAt: d(45), updatedAt: d(45) },
  { id: "dt9",  uid: "demo-user-001", type: "buy",  ticker: "MSFT", assetName: "Microsoft Corp.", shares: 20,   amount: 7600,   status: "completed", createdAt: d(40), updatedAt: d(40) },
  { id: "dt10", uid: "demo-user-001", type: "buy",  ticker: "TSLA", assetName: "Tesla Inc.",      shares: 30,   amount: 6600,   status: "completed", createdAt: d(35), updatedAt: d(35) },
  { id: "dt11", uid: "demo-user-001", type: "buy",  ticker: "META", assetName: "Meta Platforms Inc.", shares: 18, amount: 8100, status: "completed", createdAt: d(28), updatedAt: d(28) },
  { id: "dt12", uid: "demo-user-001", type: "withdrawal", amount: 5000,    status: "approved",  createdAt: d(20), updatedAt: d(20) },
  { id: "dt13", uid: "demo-user-001", type: "sell", ticker: "AAPL", assetName: "Apple Inc.",      shares: 5,    amount: 876.5,  status: "completed", createdAt: d(10), updatedAt: d(10) },
  { id: "dt14", uid: "demo-user-001", type: "deposit",    amount: 10000,   status: "approved",  createdAt: d(5),  updatedAt: d(5) },
];

export const DEMO_WATCHLIST: WatchlistItem[] = [
  { uid: "demo-user-001", ticker: "SOL",  assetName: "Solana",            addedAt: d(30) },
  { uid: "demo-user-001", ticker: "GOOGL",assetName: "Alphabet Inc.",      addedAt: d(25) },
  { uid: "demo-user-001", ticker: "JPM",  assetName: "JPMorgan Chase & Co.", addedAt: d(15) },
  { uid: "demo-user-001", ticker: "GLD",  assetName: "SPDR Gold Shares ETF", addedAt: d(8) },
];

export const DEMO_TOTAL_BALANCE = DEMO_PROFILE.availableBalance + 133872.55;
export const DEMO_HISTORY = generateHistory(DEMO_TOTAL_BALANCE);

export const DEMO_ALERTS: Alert[] = [
  { id: "da1", uid: "demo-user-001", title: "Portfolio up +1.2% today",     message: "Your portfolio gained $1,842.33 today. NVDA and BTC were top performers.", type: "success", read: false, fromAdmin: false, createdAt: d(0) },
  { id: "da2", uid: "demo-user-001", title: "Deposit confirmed",             message: "Your deposit of $10,000.00 has been approved and credited to your account.", type: "success", read: false, fromAdmin: true,  createdAt: d(5) },
  { id: "da3", uid: "demo-user-001", title: "KYC verification approved",     message: "Your identity has been verified. You now have full access to all platform features.", type: "info", read: true, fromAdmin: true, createdAt: d(12) },
  { id: "da4", uid: "demo-user-001", title: "BTC volatility alert",          message: "Bitcoin has moved more than 5% in the last 24 hours. Monitor your position closely.", type: "warning", read: true, fromAdmin: false, createdAt: d(18) },
  { id: "da5", uid: "demo-user-001", title: "Withdrawal processed",          message: "Your withdrawal of $5,000.00 has been processed and sent to your bank account.", type: "info", read: true, fromAdmin: true, createdAt: d(22) },
  { id: "da6", uid: "demo-user-001", title: "Market closed — weekend hours", message: "Equity markets are closed. Crypto trading remains available 24/7.", type: "info", read: true, fromAdmin: false, createdAt: d(30) },
];
