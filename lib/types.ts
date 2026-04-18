export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  availableBalance: number;
  investedBalance: number;
  isAdmin: boolean;
  kycStatus: "none" | "pending" | "approved" | "rejected";
  createdAt: string;
  lastSignInAt?: string;
  lastIp?: string;
  lastCountry?: string;
  otpEnabled?: boolean;
  withdrawalDetails?: Record<string, string> | null;
  overrideInvestedFunds?: number | null;
  overrideTodaysPL?: number | null;
  overrideTotalReturn?: number | null;
}

export interface Investment {
  id: string;
  uid: string;
  ticker: string;
  assetName: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  uid: string;
  type: "buy" | "sell" | "deposit" | "withdrawal";
  ticker?: string;
  assetName?: string;
  shares?: number;
  amount: number;
  status: "pending" | "completed" | "approved" | "rejected";
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  minDeposit: number;
  maxDeposit: number;
  returnRate: number;
  duration: number;
  enabled: boolean;
  sortOrder: number;
}

export interface Alert {
  id: string;
  uid: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  fromAdmin: boolean;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: "crypto" | "bank" | "card";
  details: Record<string, string>;
  enabled: boolean;
  sortOrder: number;
}

export interface WatchlistItem {
  uid: string;
  ticker: string;
  assetName: string;
  addedAt: string;
}

export interface Position {
  ticker: string;
  assetName: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  sparkData: number[];
}

export const ASSETS: Record<string, { name: string; price: number; sector: string }> = {
  // Technology
  AAPL:  { name: "Apple Inc.", price: 175.43, sector: "Technology" },
  NVDA:  { name: "NVIDIA Corp.", price: 432.9, sector: "Technology" },
  MSFT:  { name: "Microsoft Corp.", price: 415.6, sector: "Technology" },
  GOOGL: { name: "Alphabet Inc.", price: 141.8, sector: "Technology" },
  META:  { name: "Meta Platforms Inc.", price: 502.3, sector: "Technology" },
  AMD:   { name: "Advanced Micro Devices", price: 168.4, sector: "Technology" },
  INTC:  { name: "Intel Corp.", price: 31.2, sector: "Technology" },
  CRM:   { name: "Salesforce Inc.", price: 274.5, sector: "Technology" },
  ORCL:  { name: "Oracle Corp.", price: 122.3, sector: "Technology" },
  ADBE:  { name: "Adobe Inc.", price: 475.8, sector: "Technology" },
  QCOM:  { name: "Qualcomm Inc.", price: 158.9, sector: "Technology" },
  // E-Commerce & Consumer
  AMZN:  { name: "Amazon.com Inc.", price: 178.5, sector: "Consumer" },
  SHOP:  { name: "Shopify Inc.", price: 71.3, sector: "Consumer" },
  BABA:  { name: "Alibaba Group", price: 74.2, sector: "Consumer" },
  EBAY:  { name: "eBay Inc.", price: 47.6, sector: "Consumer" },
  // Automotive & EV
  TSLA:  { name: "Tesla Inc.", price: 241.3, sector: "Automotive" },
  F:     { name: "Ford Motor Co.", price: 11.8, sector: "Automotive" },
  GM:    { name: "General Motors Co.", price: 44.9, sector: "Automotive" },
  RIVN:  { name: "Rivian Automotive", price: 12.4, sector: "Automotive" },
  // Finance
  JPM:   { name: "JPMorgan Chase & Co.", price: 195.2, sector: "Finance" },
  GS:    { name: "Goldman Sachs Group", price: 392.1, sector: "Finance" },
  BAC:   { name: "Bank of America Corp.", price: 37.8, sector: "Finance" },
  V:     { name: "Visa Inc.", price: 271.4, sector: "Finance" },
  MA:    { name: "Mastercard Inc.", price: 453.7, sector: "Finance" },
  BRK:   { name: "Berkshire Hathaway B", price: 358.9, sector: "Finance" },
  // Healthcare
  JNJ:   { name: "Johnson & Johnson", price: 156.3, sector: "Healthcare" },
  PFE:   { name: "Pfizer Inc.", price: 27.4, sector: "Healthcare" },
  UNH:   { name: "UnitedHealth Group", price: 521.8, sector: "Healthcare" },
  ABBV:  { name: "AbbVie Inc.", price: 168.2, sector: "Healthcare" },
  // Energy
  XOM:   { name: "Exxon Mobil Corp.", price: 104.7, sector: "Energy" },
  CVX:   { name: "Chevron Corp.", price: 152.3, sector: "Energy" },
  BP:    { name: "BP plc", price: 34.1, sector: "Energy" },
  // Media & Entertainment
  NFLX:  { name: "Netflix Inc.", price: 628.4, sector: "Media" },
  DIS:   { name: "Walt Disney Co.", price: 91.2, sector: "Media" },
  SPOT:  { name: "Spotify Technology", price: 314.6, sector: "Media" },
  // ETFs
  VOO:   { name: "Vanguard S&P 500 ETF", price: 410.22, sector: "ETF" },
  QQQ:   { name: "Invesco QQQ Trust", price: 432.8, sector: "ETF" },
  SPY:   { name: "SPDR S&P 500 ETF", price: 487.3, sector: "ETF" },
  IWM:   { name: "iShares Russell 2000 ETF", price: 198.4, sector: "ETF" },
  GLD:   { name: "SPDR Gold Shares ETF", price: 218.7, sector: "ETF" },
  // Crypto
  BTC:   { name: "Bitcoin", price: 68200, sector: "Crypto" },
  ETH:   { name: "Ethereum", price: 3520, sector: "Crypto" },
  SOL:   { name: "Solana", price: 155.4, sector: "Crypto" },
  BNB:   { name: "BNB", price: 412.0, sector: "Crypto" },
  XRP:   { name: "XRP", price: 0.524, sector: "Crypto" },
  ADA:   { name: "Cardano", price: 0.448, sector: "Crypto" },
  AVAX:  { name: "Avalanche", price: 36.8, sector: "Crypto" },
  DOT:   { name: "Polkadot", price: 7.12, sector: "Crypto" },
  LINK:  { name: "Chainlink", price: 14.6, sector: "Crypto" },
  MATIC: { name: "Polygon", price: 0.712, sector: "Crypto" },
};
