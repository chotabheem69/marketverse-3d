// Yahoo Finance provider for Indian stocks, indices, and US stocks
// Uses the Worker proxy to avoid CORS issues

import type { Quote, Candle, TimeFrame } from '../types';

const WORKER_BASE_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

interface YahooChartResponse {
  chart: {
    result: Array<{
      meta: {
        currency: string;
        symbol: string;
        regularMarketPrice: number;
        previousClose: number;
        chartPreviousClose: number;
        regularMarketTime: number;
      };
      timestamp: number[];
      indicators: {
        quote: Array<{
          open: number[];
          high: number[];
          low: number[];
          close: number[];
          volume: number[];
        }>;
      };
    }>;
  };
}

function timeframeToInterval(tf: TimeFrame): string {
  switch (tf) {
    case '1M': return '1d';
    case '6M': return '1d';
    case '1Y': return '1d';
    case '3Y': return '1wk';
    case '5Y': return '1wk';
    case 'MAX': return '1mo';
    default: return '1d';
  }
}

function timeframeToRange(tf: TimeFrame): string {
  switch (tf) {
    case '1M': return '1mo';
    case '6M': return '6mo';
    case '1Y': return '1y';
    case '3Y': return '3y';
    case '5Y': return '5y';
    case 'MAX': return 'max';
    default: return '1mo';
  }
}

export async function fetchQuote(
  symbol: string,
  useDemo: boolean = false
): Promise<{ quote: Quote | null; status: { isLive: boolean; isDemo: boolean; source: string; lastUpdated: number } }> {
  if (useDemo) {
    return getDemoQuote(symbol);
  }

  try {
    const response = await fetch(
      `${WORKER_BASE_URL}/yahoo/chart?symbol=${encodeURIComponent(symbol)}&interval=1d&range=1d`,
      { 
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: YahooChartResponse = await response.json();
    
    if (!data.chart.result || data.chart.result.length === 0) {
      throw new Error('No data returned');
    }

    const meta = data.chart.result[0].meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose;
    const change = price - prevClose;
    const changePercent = (change / prevClose) * 100;

    return {
      quote: {
        instrumentId: symbol,
        price,
        change,
        changePercent,
        timestamp: meta.regularMarketTime * 1000,
        isLive: true,
        source: 'Yahoo Finance',
      },
      status: {
        isLive: true,
        isDemo: false,
        source: 'Yahoo Finance',
        lastUpdated: Date.now(),
      },
    };
  } catch (error) {
    console.warn(`Failed to fetch quote for ${symbol}, using demo data:`, error);
    return getDemoQuote(symbol);
  }
}

export async function fetchCandles(
  symbol: string,
  timeframe: TimeFrame,
  useDemo: boolean = false
): Promise<{ candles: Candle[]; status: { isLive: boolean; isDemo: boolean; source: string; lastUpdated: number } }> {
  if (useDemo) {
    return getDemoCandles(symbol, timeframe);
  }

  try {
    const interval = timeframeToInterval(timeframe);
    const range = timeframeToRange(timeframe);

    const response = await fetch(
      `${WORKER_BASE_URL}/yahoo/chart?symbol=${encodeURIComponent(symbol)}&interval=${interval}&range=${range}`,
      {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(15000)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: YahooChartResponse = await response.json();
    
    if (!data.chart.result || data.chart.result.length === 0) {
      throw new Error('No data returned');
    }

    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quoteData = result.indicators.quote[0];

    const candles: Candle[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const close = quoteData.close[i];
      if (close === null || close === undefined) continue;

      candles.push({
        time: timestamps[i] * 1000,
        open: quoteData.open[i] || close,
        high: quoteData.high[i] || close,
        low: quoteData.low[i] || close,
        close,
        volume: quoteData.volume[i] || undefined,
      });
    }

    return {
      candles,
      status: {
        isLive: false, // Historical data
        isDemo: false,
        source: 'Yahoo Finance',
        lastUpdated: Date.now(),
      },
    };
  } catch (error) {
    console.warn(`Failed to fetch candles for ${symbol}, using demo data:`, error);
    return getDemoCandles(symbol, timeframe);
  }
}

export async function fetchMultipleQuotes(
  symbols: string[],
  useDemo: boolean = false
): Promise<Map<string, Quote>> {
  const quotes = new Map<string, Quote>();
  
  // Fetch in parallel with concurrency limit
  const concurrency = 5;
  for (let i = 0; i < symbols.length; i += concurrency) {
    const batch = symbols.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      batch.map(symbol => fetchQuote(symbol, useDemo))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.quote) {
        quotes.set(batch[index], result.value.quote);
      }
    });
  }

  return quotes;
}

// Demo data fallback
function getDemoQuote(symbol: string): { quote: Quote; status: { isLive: boolean; isDemo: boolean; source: string; lastUpdated: number } } {
  const basePrice = getBasePriceForSymbol(symbol);
  const change = (Math.random() - 0.5) * basePrice * 0.03; // ±1.5%
  const price = basePrice + change;

  return {
    quote: {
      instrumentId: symbol,
      price,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 10000000),
      timestamp: Date.now(),
      isLive: false,
      source: 'Demo Data',
    },
    status: {
      isLive: false,
      isDemo: true,
      source: 'Demo Data',
      lastUpdated: Date.now(),
    },
  };
}

function getDemoCandles(
  symbol: string,
  timeframe: TimeFrame
): { candles: Candle[]; status: { isLive: boolean; isDemo: boolean; source: string; lastUpdated: number } } {
  const basePrice = getBasePriceForSymbol(symbol);
  const numCandles = getTimeframeCandleCount(timeframe);
  const intervalMs = getTimeframeIntervalMs(timeframe);

  const candles: Candle[] = [];
  let price = basePrice * 0.85; // Start 15% lower for uptrend demo

  const now = Date.now();
  const startTime = now - (numCandles * intervalMs);

  for (let i = 0; i < numCandles; i++) {
    const time = startTime + (i * intervalMs);
    const dailyChange = (Math.random() - 0.45) * 0.03; // Slight upward bias
    price = price * (1 + dailyChange);
    
    const high = price * (1 + Math.random() * 0.02);
    const low = price * (1 - Math.random() * 0.02);
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000000),
    });
  }

  return {
    candles,
    status: {
      isLive: false,
      isDemo: true,
      source: 'Demo Data',
      lastUpdated: Date.now(),
    },
  };
}

function getBasePriceForSymbol(symbol: string): number {
  const prices: Record<string, number> = {
    'RELIANCE.NS': 2450,
    'TCS.NS': 3800,
    'HDFCBANK.NS': 1650,
    'INFY.NS': 1580,
    'ICICIBANK.NS': 1020,
    '^NSEI': 22500,
    '^BSESN': 74000,
    '^GSPC': 5200,
    'AAPL': 195,
    'MSFT': 420,
    'GOOGL': 175,
  };
  return prices[symbol] || 1000;
}

function getTimeframeCandleCount(timeframe: TimeFrame): number {
  switch (timeframe) {
    case '1M': return 22;
    case '6M': return 132;
    case '1Y': return 252;
    case '3Y': return 156;
    case '5Y': return 260;
    case 'MAX': return 120;
    default: return 252;
  }
}

function getTimeframeIntervalMs(timeframe: TimeFrame): number {
  switch (timeframe) {
    case '1M': return 86400000; // 1 day
    case '6M': return 86400000;
    case '1Y': return 86400000;
    case '3Y': return 604800000; // 1 week
    case '5Y': return 604800000;
    case 'MAX': return 2592000000; // ~1 month
    default: return 86400000;
  }
}
