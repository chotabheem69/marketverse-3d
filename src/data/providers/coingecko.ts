// CoinGecko provider for cryptocurrency data
// Free API, no key required for basic endpoints

import type { Quote, Candle } from '../types';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

interface CoinGeckoChartData {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

/**
 * Fetch market data for top coins
 */
export async function fetchCoinMarketData(
  coinIds: string[],
  currency: 'usd' | 'inr' = 'usd',
  useDemo: boolean = false
): Promise<{ quotes: Map<string, Quote>; status: { isLive: boolean; isDemo: boolean; source: string; lastUpdated: number } }> {
  if (useDemo) {
    return getDemoCoinQuotes(coinIds, currency);
  }

  try {
    const ids = coinIds.join(',');
    const response = await fetch(
      `${COINGECKO_BASE}/coins/markets?vs_currency=${currency}&ids=${ids}&order=market_cap_desc&sparkline=false`,
      { signal: AbortSignal.timeout(15000) }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: CoinGeckoMarketData[] = await response.json();
    const quotes = new Map<string, Quote>();

    for (const coin of data) {
      quotes.set(coin.id, {
        instrumentId: coin.id,
        price: coin.current_price,
        change: coin.price_change_24h,
        changePercent: coin.price_change_percentage_24h || 0,
        volume: coin.total_volume,
        marketCap: coin.market_cap,
        high: coin.high_24h,
        low: coin.low_24h,
        timestamp: new Date(coin.last_updated).getTime(),
        isLive: true,
        source: 'CoinGecko',
      });
    }

    return {
      quotes,
      status: {
        isLive: true,
        isDemo: false,
        source: 'CoinGecko',
        lastUpdated: Date.now(),
      },
    };
  } catch (error) {
    console.warn('Failed to fetch coin market data, using demo data:', error);
    return getDemoCoinQuotes(coinIds, currency);
  }
}

/**
 * Fetch historical price data for a coin
 */
export async function fetchCoinHistory(
  coinId: string,
  days: number,
  currency: 'usd' | 'inr' = 'usd',
  useDemo: boolean = false
): Promise<{ candles: Candle[]; status: { isLive: boolean; isDemo: boolean; source: string; lastUpdated: number } }> {
  if (useDemo) {
    return getDemoCoinHistory(coinId, days);
  }

  try {
    const response = await fetch(
      `${COINGECKO_BASE}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`,
      { signal: AbortSignal.timeout(15000) }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: CoinGeckoChartData = await response.json();
    
    const candles: Candle[] = data.prices.map(([timestamp, price]) => ({
      time: timestamp,
      open: price,
      high: price,
      low: price,
      close: price,
    }));

    return {
      candles,
      status: {
        isLive: false,
        isDemo: false,
        source: 'CoinGecko',
        lastUpdated: Date.now(),
      },
    };
  } catch (error) {
    console.warn(`Failed to fetch history for ${coinId}, using demo data:`, error);
    return getDemoCoinHistory(coinId, days);
  }
}

/**
 * Fetch BTC dominance
 */
export async function fetchBTCdominance(useDemo: boolean = false): Promise<number> {
  if (useDemo) {
    return 52.5; // Demo value
  }

  try {
    const response = await fetch(`${COINGECKO_BASE}/global`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.data.market_cap_percentage.btc;
  } catch (error) {
    console.warn('Failed to fetch BTC dominance, using demo value:', error);
    return 52.5;
  }
}

// Demo data generation
function getDemoCoinQuotes(
  coinIds: string[],
  currency: 'usd' | 'inr'
): { quotes: Map<string, Quote>; status: { isLive: boolean; isDemo: boolean; source: string; lastUpdated: number } } {
  const quotes = new Map<string, Quote>();
  const usdToInr = 83.5;

  const basePrices: Record<string, number> = {
    'bitcoin': 67000,
    'ethereum': 3500,
    'tether': 1,
    'binancecoin': 580,
    'solana': 145,
    'ripple': 0.55,
    'cardano': 0.45,
    'dogecoin': 0.15,
    'polkadot': 7.2,
    'chainlink': 14.5,
    'avalanche-2': 35,
    'matic-network': 0.75,
    'litecoin': 82,
    'uniswap': 7.8,
    'stellar': 0.11,
    'cosmos': 8.5,
    'near': 5.2,
    'algorand': 0.18,
    'filecoin': 5.8,
    'arbitrum': 1.1,
  };

  for (const coinId of coinIds) {
    const basePrice = basePrices[coinId] || 100;
    const change = (Math.random() - 0.5) * basePrice * 0.06; // ±3%
    const price = basePrice + change;
    const finalPrice = currency === 'inr' ? price * usdToInr : price;

    quotes.set(coinId, {
      instrumentId: coinId,
      price: finalPrice,
      change: change * (currency === 'inr' ? usdToInr : 1),
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 1e10),
      marketCap: finalPrice * (Math.random() * 1e9 + 1e8),
      timestamp: Date.now(),
      isLive: false,
      source: 'Demo Data',
    });
  }

  return {
    quotes,
    status: {
      isLive: false,
      isDemo: true,
      source: 'Demo Data',
      lastUpdated: Date.now(),
    },
  };
}

function getDemoCoinHistory(
  coinId: string,
  days: number
): { candles: Candle[]; status: { isLive: boolean; isDemo: boolean; source: string; lastUpdated: number } } {
  const basePrices: Record<string, number> = {
    'bitcoin': 67000,
    'ethereum': 3500,
    'solana': 145,
  };
  
  const basePrice = basePrices[coinId] || 100;
  const candles: Candle[] = [];
  let price = basePrice * 0.7; // Start lower for growth demo
  
  const now = Date.now();
  const intervalMs = days > 90 ? 86400000 : (days > 30 ? 3600000 * 4 : 3600000);
  const numCandles = Math.ceil((days * 86400000) / intervalMs);
  const startTime = now - (days * 86400000);

  for (let i = 0; i < numCandles; i++) {
    const time = startTime + (i * intervalMs);
    const change = (Math.random() - 0.45) * 0.04; // Slight upward bias
    price = price * (1 + change);
    
    candles.push({
      time,
      open: price,
      high: price * (1 + Math.random() * 0.02),
      low: price * (1 - Math.random() * 0.02),
      close: price,
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
