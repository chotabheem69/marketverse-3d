// React Query hooks for data fetching with caching

import { useQuery } from '@tanstack/react-query';
import { fetchQuote, fetchCandles, fetchMultipleQuotes } from './providers/yahooFinance';
import { fetchNavHistory, fetchLatestNav } from './providers/mfapi';
import { fetchCoinMarketData, fetchCoinHistory } from './providers/coingecko';
import { useAppStore } from '../store/appStore';
import type { TimeFrame } from './types';

// Cache times in milliseconds
const QUOTE_CACHE_TIME = 60 * 1000; // 1 minute
const QUOTE_STALE_TIME = 60 * 1000; // 1 minute
const CANDLE_CACHE_TIME = 60 * 60 * 1000; // 1 hour
const CANDLE_STALE_TIME = 60 * 60 * 1000; // 1 hour
const NAV_CACHE_TIME = 60 * 60 * 1000; // 1 hour
const NAV_STALE_TIME = 60 * 60 * 1000; // 1 hour

/**
 * Hook to fetch a single stock/index quote
 */
export function useQuote(symbol: string) {
  const useDemoData = useAppStore((state) => state.useDemoData);

  return useQuery({
    queryKey: ['quote', symbol, useDemoData],
    queryFn: () => fetchQuote(symbol, useDemoData),
    enabled: !!symbol,
    refetchInterval: QUOTE_CACHE_TIME,
    staleTime: QUOTE_STALE_TIME,
    gcTime: QUOTE_CACHE_TIME * 5,
    retry: 2,
  });
}

/**
 * Hook to fetch multiple quotes in parallel
 */
export function useMultipleQuotes(symbols: string[]) {
  const useDemoData = useAppStore((state) => state.useDemoData);

  return useQuery({
    queryKey: ['quotes', symbols, useDemoData],
    queryFn: () => fetchMultipleQuotes(symbols, useDemoData),
    enabled: symbols.length > 0,
    refetchInterval: QUOTE_CACHE_TIME,
    staleTime: QUOTE_STALE_TIME,
    gcTime: QUOTE_CACHE_TIME * 5,
  });
}

/**
 * Hook to fetch historical candle data
 */
export function useCandles(symbol: string, timeframe: TimeFrame) {
  const useDemoData = useAppStore((state) => state.useDemoData);

  return useQuery({
    queryKey: ['candles', symbol, timeframe, useDemoData],
    queryFn: () => fetchCandles(symbol, timeframe, useDemoData),
    enabled: !!symbol,
    staleTime: CANDLE_STALE_TIME,
    gcTime: CANDLE_CACHE_TIME,
    retry: 2,
  });
}

/**
 * Hook to fetch mutual fund NAV history
 */
export function useNavHistory(schemeCode: string) {
  const useDemoData = useAppStore((state) => state.useDemoData);

  return useQuery({
    queryKey: ['navHistory', schemeCode, useDemoData],
    queryFn: () => fetchNavHistory(schemeCode, useDemoData),
    enabled: !!schemeCode,
    staleTime: NAV_STALE_TIME,
    gcTime: NAV_CACHE_TIME,
    retry: 2,
  });
}

/**
 * Hook to fetch latest NAV for a mutual fund
 */
export function useLatestNav(schemeCode: string) {
  const useDemoData = useAppStore((state) => state.useDemoData);

  return useQuery({
    queryKey: ['latestNav', schemeCode, useDemoData],
    queryFn: () => fetchLatestNav(schemeCode, useDemoData),
    enabled: !!schemeCode,
    refetchInterval: NAV_CACHE_TIME,
    staleTime: NAV_STALE_TIME,
    gcTime: NAV_CACHE_TIME * 5,
    retry: 2,
  });
}

/**
 * Hook to fetch cryptocurrency market data
 */
export function useCoinMarketData(coinIds: string[], currency: 'usd' | 'inr' = 'usd') {
  const useDemoData = useAppStore((state) => state.useDemoData);

  return useQuery({
    queryKey: ['coinMarket', coinIds, currency, useDemoData],
    queryFn: () => fetchCoinMarketData(coinIds, currency, useDemoData),
    enabled: coinIds.length > 0,
    refetchInterval: QUOTE_CACHE_TIME,
    staleTime: QUOTE_STALE_TIME,
    gcTime: QUOTE_CACHE_TIME * 5,
  });
}

/**
 * Hook to fetch cryptocurrency history
 */
export function useCoinHistory(coinId: string, days: number, currency: 'usd' | 'inr' = 'usd') {
  const useDemoData = useAppStore((state) => state.useDemoData);

  return useQuery({
    queryKey: ['coinHistory', coinId, days, currency, useDemoData],
    queryFn: () => fetchCoinHistory(coinId, days, currency, useDemoData),
    enabled: !!coinId,
    staleTime: CANDLE_STALE_TIME,
    gcTime: CANDLE_CACHE_TIME,
    retry: 2,
  });
}
