import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { useMultipleQuotes } from '../../data/hooks';
import { NIFTY_50, POPULAR_FUNDS, TOP_CRYPTO, GLOBAL_INDICES } from '../../config/universe';
import { formatCurrency, formatPercent, formatVolume, formatMarketCap } from '../../utils/formatters';

type SortKey = 'name' | 'price' | 'change' | 'volume' | 'marketCap';
type SortDir = 'asc' | 'desc';

export function TableView() {
  const { currentWorld, currency, setSelectedInstrument, isTableMode } = useAppStore();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Get data based on current world
  const symbols = useMemo(() => {
    switch (currentWorld) {
      case 'india-city':
        return NIFTY_50.map(s => ({ id: s.symbol, name: s.name, symbol: s.symbol.replace('.NS', ''), type: 'stock', sector: s.sector }));
      case 'mf-galaxy':
        return POPULAR_FUNDS.map(f => ({ id: `MF-${f.schemeCode}`, name: f.name, symbol: f.schemeCode, type: 'fund', category: f.category }));
      case 'crypto-reactor':
        return TOP_CRYPTO.map(c => ({ id: c.id, name: c.name, symbol: c.symbol, type: 'crypto' }));
      case 'global-earth':
        return GLOBAL_INDICES.map(i => ({ id: i.symbol, name: i.name, symbol: i.symbol, type: 'index' }));
      default:
        return NIFTY_50.map(s => ({ id: s.symbol, name: s.name, symbol: s.symbol.replace('.NS', ''), type: 'stock', sector: s.sector }));
    }
  }, [currentWorld]);

  const allSymbols = symbols.map(s => s.id);
  const { data } = useMultipleQuotes(allSymbols);

  const sortedItems = useMemo(() => {
    return [...symbols].sort((a, b) => {
      const aQuote = data?.get(a.id);
      const bQuote = data?.get(b.id);

      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'price':
          cmp = (aQuote?.price || 0) - (bQuote?.price || 0);
          break;
        case 'change':
          cmp = (aQuote?.changePercent || 0) - (bQuote?.changePercent || 0);
          break;
        case 'volume':
          cmp = (aQuote?.volume || 0) - (bQuote?.volume || 0);
          break;
        case 'marketCap':
          cmp = (aQuote?.marketCap || 0) - (bQuote?.marketCap || 0);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [symbols, data, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => (
    <span className="ml-1">
      {sortKey === column ? (sortDir === 'asc' ? '↑' : '↓') : '⇅'}
    </span>
  );

  if (!isTableMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-30 bg-background/95 backdrop-blur-md overflow-auto pt-20 pb-28 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          Table View — {currentWorld}
        </h2>

        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm" role="grid" aria-label="Market data table">
            <thead>
              <tr className="border-b border-border">
                <th 
                  className="text-left p-3 text-slate-400 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('name')}
                  aria-sort={sortKey === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Name <SortIcon column="name" />
                </th>
                <th 
                  className="text-right p-3 text-slate-400 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('price')}
                >
                  Price <SortIcon column="price" />
                </th>
                <th 
                  className="text-right p-3 text-slate-400 font-medium cursor-pointer hover:text-white"
                  onClick={() => handleSort('change')}
                >
                  Change <SortIcon column="change" />
                </th>
                <th 
                  className="text-right p-3 text-slate-400 font-medium cursor-pointer hover:text-white hidden md:table-cell"
                  onClick={() => handleSort('volume')}
                >
                  Volume <SortIcon column="volume" />
                </th>
                <th 
                  className="text-right p-3 text-slate-400 font-medium cursor-pointer hover:text-white hidden lg:table-cell"
                  onClick={() => handleSort('marketCap')}
                >
                  Market Cap <SortIcon column="marketCap" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => {
                const quote = data?.get(item.id);
                return (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 hover:bg-white/5 cursor-pointer transition-colors"
                    onClick={() => setSelectedInstrument({
                      id: item.id,
                      symbol: item.symbol,
                      name: item.name,
                      type: item.type as any,
                      region: 'IN',
                      currency: 'INR',
                    })}
                    role="row"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSelectedInstrument({
                          id: item.id,
                          symbol: item.symbol,
                          name: item.name,
                          type: item.type as any,
                          region: 'IN',
                          currency: 'INR',
                        });
                      }
                    }}
                  >
                    <td className="p-3">
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.symbol}</p>
                    </td>
                    <td className="p-3 text-right text-white font-mono">
                      {quote ? formatCurrency(quote.price, currency) : '—'}
                    </td>
                    <td className={`p-3 text-right font-mono ${
                      (quote?.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {quote ? formatPercent(quote.changePercent) : '—'}
                    </td>
                    <td className="p-3 text-right text-slate-300 font-mono hidden md:table-cell">
                      {quote?.volume ? formatVolume(quote.volume) : '—'}
                    </td>
                    <td className="p-3 text-right text-slate-300 font-mono hidden lg:table-cell">
                      {quote?.marketCap ? formatMarketCap(quote.marketCap, currency) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center">
          ⚠️ Data may be delayed or inaccurate. Not financial advice.
        </p>
      </div>
    </motion.div>
  );
}
