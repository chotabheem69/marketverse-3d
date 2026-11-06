// Core data types for all market instruments

export type InstrumentType = 'stock' | 'index' | 'fund' | 'crypto' | 'commodity' | 'forex';

export type MarketRegion = 'IN' | 'US' | 'GLOBAL';

export interface Instrument {
  id: string;           // Unique identifier (e.g., "RELIANCE.NS")
  symbol: string;       // Display symbol
  name: string;
  type: InstrumentType;
  region: MarketRegion;
  sector?: string;      // For stocks
  category?: string;    // For funds
  currency: string;
}

export interface Quote {
  instrumentId: string;
  price: number;
  change: number;       // Absolute change
  changePercent: number;
  volume?: number;
  marketCap?: number;
  high?: number;
  low?: number;
  open?: number;
  prevClose?: number;
  timestamp: number;    // Unix timestamp in ms
  isLive: boolean;
  source: string;
}

export interface Candle {
  time: number;         // Unix timestamp in ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface NavPoint {
  date: string;         // YYYY-MM-DD
  nav: number;
}

export interface Fund extends Instrument {
  type: 'fund';
  amc: string;
  schemeCode: string;
  category: string;     // large-cap, flexi-cap, elss, debt, etc.
  inceptionDate: string;
  expenseRatio?: number;
  navHistory?: NavPoint[];
}

export interface DataStatus {
  lastUpdated: number;
  isLive: boolean;
  isDemo: boolean;
  source: string;
  error?: string;
}

export type TimeFrame = '1M' | '6M' | '1Y' | '3Y' | '5Y' | 'MAX';

export type WorldId = 'india-city' | 'terrain' | 'mf-galaxy' | 'crypto-reactor' | 'global-earth' | 'watchlist';

export type Currency = 'INR' | 'USD';

export type ThemeMode = 'light' | 'dark';
