import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { NIFTY_50, POPULAR_FUNDS, TOP_CRYPTO, GLOBAL_INDICES, US_STOCKS } from '../../config/universe';
import type { Instrument, WorldId } from '../../data/types';

interface SearchItem {
  id: string;
  name: string;
  symbol: string;
  type: string;
  world: WorldId;
  category?: string;
}

// Build search index
function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  // Indian stocks
  for (const stock of NIFTY_50) {
    items.push({
      id: stock.symbol,
      name: stock.name,
      symbol: stock.symbol.replace('.NS', ''),
      type: 'stock',
      world: 'india-city',
      category: stock.sector,
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
    });
  }

  // Indices
  for (const idx of GLOBAL_INDICES) {
    items.push({
      id: idx.symbol,
      name: idx.name,
      symbol: idx.symbol,
      type: 'index',
      world: 'global-earth',
    });
  }

  return items;
}

// Simple fuzzy match
function fuzzyMatch(query: string, text: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes(lowerQuery)) return 100;
  
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

  const searchIndex = useMemo(() => buildSearchIndex(), []);

  const results = useMemo(() => {
    if (!query.trim()) return searchIndex.slice(0, 20);
    
    return searchIndex
      .map(item => ({
        item,
        score: Math.max(
          fuzzyMatch(query, item.name),
          fuzzyMatch(query, item.symbol),
          fuzzyMatch(query, item.category || ''),
        ),
      }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(r => r.item);
  }, [query, searchIndex]);

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

  const handleSelect = (item: SearchItem) => {
    const instrument: Instrument = {
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      type: item.type as any,
      region: item.world === 'india-city' ? 'IN' : 'GLOBAL',
      category: item.category,
      currency: 'INR',
    };
    setCurrentWorld(item.world);
    setSelectedInstrument(instrument);
    setCommandPaletteOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  const typeIcons: Record<string, string> = {
    stock: '📈',
    fund: '🏦',
    crypto: '⚡',
    index: '📊',
  };

  const worldLabels: Record<string, string> = {
    'india-city': 'India City',
    'mf-galaxy': 'MF Galaxy',
    'crypto-reactor': 'Crypto',
    'global-earth': 'Global',
    'terrain': 'Terrain',
    'watchlist': 'Watchlist',
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
          onClick={() => setCommandPaletteOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Palette */}
          <motion.div
            initial={{ scale: 0.95, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -10 }}
            className="relative glass rounded-2xl w-full max-w-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">🔍</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search stocks, funds, crypto..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
                />
                <kbd className="text-xs text-slate-500 border border-slate-600 rounded px-1.5 py-0.5">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No results found
                </div>
              ) : (
                results.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                      i === selectedIndex ? 'bg-primary/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{typeIcons[item.type] || '📄'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {item.symbol} · {worldLabels[item.world]}
                        {item.category && ` · ${item.category}`}
                      </p>
                    </div>
                    {i === selectedIndex && (
                      <kbd className="text-xs text-slate-500">↵</kbd>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border flex items-center gap-4 text-xs text-slate-500">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
