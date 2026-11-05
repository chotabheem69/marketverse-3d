// URL hash state management for shareable links
// Format: #world=india-city&symbol=RELIANCE.NS&timeframe=1Y&currency=INR

import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import type { WorldId, Currency, TimeFrame } from '../data/types';
import { NIFTY_50 } from '../config/universe';

interface HashState {
  world?: WorldId;
  symbol?: string;
  timeframe?: TimeFrame;
  currency?: Currency;
}

function parseHash(): HashState {
  const hash = window.location.hash.slice(1);
  if (!hash) return {};

  const params = new URLSearchParams(hash);
  return {
    world: params.get('world') as WorldId | undefined,
    symbol: params.get('symbol') || undefined,
    timeframe: params.get('timeframe') as TimeFrame | undefined,
    currency: params.get('currency') as Currency | undefined,
  };
}

function buildHash(state: HashState): string {
  const params = new URLSearchParams();
  if (state.world) params.set('world', state.world);
  if (state.symbol) params.set('symbol', state.symbol);
  if (state.timeframe) params.set('timeframe', state.timeframe);
  if (state.currency) params.set('currency', state.currency);
  
  const str = params.toString();
  return str ? `#${str}` : '';
}

export function useURLHashState() {
  const { currentWorld, selectedInstrument, currency, setCurrentWorld, setCurrency, setSelectedInstrument } = useAppStore();

  // Restore from hash on mount
  useEffect(() => {
    const hashState = parseHash();
    
    if (hashState.world) {
      setCurrentWorld(hashState.world);
    }
    if (hashState.currency) {
      setCurrency(hashState.currency);
    }
    if (hashState.symbol) {
      // Find the instrument in universe
      const stock = NIFTY_50.find(s => s.symbol === hashState.symbol);
      if (stock) {
        setSelectedInstrument({
          id: stock.symbol,
          symbol: stock.symbol.replace('.NS', ''),
          name: stock.name,
          type: 'stock',
          region: 'IN',
          sector: stock.sector,
          currency: 'INR',
        });
      }
    }
  }, []); // Only on mount

  // Update hash when state changes
  useEffect(() => {
    const hashState: HashState = {
      world: currentWorld !== 'india-city' ? currentWorld : undefined,
      symbol: selectedInstrument?.id,
      currency: currency !== 'INR' ? currency : undefined,
    };

    const newHash = buildHash(hashState);
    if (window.location.hash !== newHash) {
      window.history.replaceState(null, '', newHash || window.location.pathname);
    }
  }, [currentWorld, selectedInstrument, currency]);

  // Listen for hash changes (back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      const hashState = parseHash();
      if (hashState.world) setCurrentWorld(hashState.world);
      if (hashState.currency) setCurrency(hashState.currency);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setCurrentWorld, setCurrency]);
}
