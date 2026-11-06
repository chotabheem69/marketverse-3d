import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { NIFTY_50, POPULAR_FUNDS, TOP_CRYPTO, GLOBAL_INDICES, US_STOCKS, INDIA_INDICES, COMMODITIES } from '../../config/universe';
import type { Instrument, WorldId } from '../../data/types';

interface SearchItem {
  id: string;
  name: string;
  symbol: string;
  type: string;
  world: WorldId;
  category?: string;
  region: string;
  group: string; // For grouping in results
}

// Build search index with all global markets
function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  // Indian indices (shown first)
  for (const idx of INDIA_INDICES) {
    items.push({
      id: idx.symbol,
      name: idx.name,
      symbol: idx.symbol,
      type: 'index',
      world: 'india-city',
      region: 'IN',
      group: '🇮🇳 Indian Indices',
    });
  }

  // Indian stocks
  for (const stock of NIFTY_50) {
    items.push({
      id: stock.symbol,
      name: stock.name,
      symbol: stock.symbol.replace('.NS', ''),
      type: 'stock',
      world: 'india-city',
      category: stock.sector,
      region: 'IN',
      group: '🇮🇳 Nifty 50 Stocks',
    });
  }

  // Global indices
  for (const idx of GLOBAL_INDICES) {
    items.push({
      id: idx.symbol,
      name: idx.name,
      symbol: idx.symbol,
      type: 'index',
      world: 'global-earth',
      region: idx.region,
      group: '🌍 Global Indices',
    });
  }

  // US stocks
  for (const stock of US_STOCKS) {
    items.push({
      id: stock.symbol,
      name: stock.name,
      symbol: stock.symbol,
      type: 'stock',
      world: 'global-earth',
      category: stock.sector,
      region: 'US',
      group: '🇺🇸 US Stocks',
    });
  }

  // Mutual funds
  for (const fund of POPULAR_FUNDS) {
    items.push({
      id: `MF-${fund.schemeCode}`,
      name: fund.name,
      symbol: fund.schemeCode,
      type: 'fund',
      world: 'mf-galaxy',
      category: fund.category,
      region: 'IN',
      group: '🏦 Mutual Funds',
    });
  }

  // Crypto
  for (const coin of TOP_CRYPTO) {
    items.push({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      type: 'crypto',
      world: 'crypto-reactor',
      region: 'GLOBAL',
      group: '₿ Cryptocurrencies',
    });
  }

  // Commodities
  for (const commodity of COMMODITIES) {
    items.push({
      id: commodity.symbol,
      name: commodity.name,
      symbol: commodity.symbol,
      type: 'commodity',
      world: 'global-earth',
      category: commodity.category,
      region: 'GLOBAL',
      group: '🥇 Commodities',
    });
  }

  return items;
}

// Simple fuzzy match
function fuzzyMatch(query: string, text: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  
  if (lowerText === lowerQuery) return 1000; // Exact match
  if (lowerText.startsWith(lowerQuery)) return 500; // Starts with
  if (lowerText.includes(lowerQuery)) return 200; // Contains
  
  let score = 0;
  let qi = 0;
  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) {
      score += 10;
      qi++;
    }
  }
  return qi === lowerQuery.length ? score : 0;
}

export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen, setSelectedInstrument, setCurrentWorld } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const searchIndex = useMemo(() => buildSearchIndex(), []);

  const results = useMemo(() => {
    if (!query.trim()) return searchIndex.slice(0, 50);
    
    return searchIndex
      .map(item => ({
        item,
        score: Math.max(
          fuzzyMatch(query, item.name),
          fuzzyMatch(query, item.symbol),
          fuzzyMatch(query, item.category || ''),
          fuzzyMatch(query, item.group),
        ),
      }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(r => r.item);
  }, [query, searchIndex]);

  // Group results by group
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    for (const item of results) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    return groups;
  }, [results]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selected = resultsRef.current.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (item: SearchItem) => {
    const instrument: Instrument = {
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      type: item.type as any,
      region: item.region as any,
      category: item.category,
      currency: item.region === 'US' || item.region === 'GLOBAL' ? 'USD' : 'INR',
    };
    setCurrentWorld(item.world);
    setSelectedInstrument(instrument);
    setCommandPaletteOpen(false);
  };

  const typeIcons: Record<string, string> = {
    stock: '📈',
    fund: '🏦',
    crypto: '₿',
    index: '📊',
    commodity: '🥇',
  };

  const worldLabels: Record<string, string> = {
    'india-city': 'India City',
    'mf-galaxy': 'MF Galaxy',
    'crypto-reactor': 'Crypto',
    'global-earth': 'Global',
    'terrain': 'Terrain',
    'watchlist': 'Watchlist',
  };

  // Flatten for keyboard navigation
  const flatResults = results;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      handleSelect(flatResults[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]"
          onClick={() => setCommandPaletteOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Palette */}
          <motion.div
            initial={{ scale: 0.95, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -10 }}
            className="relative glass rounded-2xl w-full max-w-2xl overflow-hidden max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="p-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-lg">🔍</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search stocks, indices, mutual funds, crypto..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-base"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                )}
                <kbd className="text-xs text-slate-500 border border-slate-600 rounded px-1.5 py-0.5">
                  ESC
                </kbd>
              </div>
              
              {/* Quick filters */}
              {!query && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  <button
                    onClick={() => setQuery('nifty')}
                    className="text-xs px-2 py-1 rounded bg-muted text-slate-400 hover:text-white"
                  >
                    Nifty 50
                  </button>
                  <button
                    onClick={() => setQuery('bitcoin')}
                    className="text-xs px-2 py-1 rounded bg-muted text-slate-400 hover:text-white"
                  >
                    Bitcoin
                  </button>
                  <button
                    onClick={() => setQuery('mutual fund')}
                    className="text-xs px-2 py-1 rounded bg-muted text-slate-400 hover:text-white"
                  >
                    Mutual Funds
                  </button>
                  <button
                    onClick={() => setQuery('S&P')}
                    className="text-xs px-2 py-1 rounded bg-muted text-slate-400 hover:text-white"
                  >
                    S&P 500
                  </button>
                  <button
                    onClick={() => setQuery('apple')}
                    className="text-xs px-2 py-1 rounded bg-muted text-slate-400 hover:text-white"
                  >
                    Apple
                  </button>
                </div>
              )}
            </div>

            {/* Results */}
            <div ref={resultsRef} className="flex-1 overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <p className="text-3xl mb-2">🔎</p>
                  <p>No results found for "{query}"</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Try searching by name, symbol, or category
                  </p>
                </div>
              ) : (
                Object.entries(groupedResults).map(([group, items]) => (
                  <div key={group}>
                    <div className="px-4 py-2 text-xs font-bold text-slate-500 bg-muted/30 sticky top-0">
                      {group}
                    </div>
                    {items.map((item) => {
                      const flatIdx = flatResults.indexOf(item);
                      return (
                        <button
                          key={item.id}
                          data-selected={flatIdx === selectedIndex}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(flatIdx)}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                            flatIdx === selectedIndex ? 'bg-primary/15' : 'hover:bg-white/5'
                          }`}
                        >
                          <span className="text-lg flex-shrink-0">{typeIcons[item.type] || '📄'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{item.name}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-2">
                              <span className="font-mono">{item.symbol}</span>
                              <span>·</span>
                              <span>{worldLabels[item.world]}</span>
                              {item.category && (
                                <>
                                  <span>·</span>
                                  <span className="text-slate-500">{item.category}</span>
                                </>
                              )}
                            </p>
                          </div>
                          {flatIdx === selectedIndex && (
                            <kbd className="text-xs text-slate-500 flex-shrink-0">↵</kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
              <div className="text-slate-600">
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
