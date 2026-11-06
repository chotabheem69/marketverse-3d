import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { useMultipleQuotes } from '../../data/hooks';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { useMemo } from 'react';

export function Portfolio() {
  const { portfolio, isPortfolioOpen, setPortfolioOpen, removePortfolioEntry, currency } = useAppStore();
  
  const symbols = useMemo(() => portfolio.map(p => p.instrumentId), [portfolio]);
  const { data } = useMultipleQuotes(symbols);

  // Calculate totals
  const totals = useMemo(() => {
    let totalInvested = 0;
    let totalCurrentValue = 0;
    
    for (const entry of portfolio) {
      totalInvested += entry.buyPrice * entry.quantity;
      const quote = data?.get(entry.instrumentId);
      const currentPrice = quote?.price || entry.buyPrice;
      totalCurrentValue += currentPrice * entry.quantity;
    }
    
    const totalPnL = totalCurrentValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    
    return { totalInvested, totalCurrentValue, totalPnL, totalPnLPercent };
  }, [portfolio, data]);

  return (
    <AnimatePresence>
      {isPortfolioOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed right-0 top-16 bottom-0 w-[450px] z-40 glass border-l border-border overflow-y-auto"
        >
          {/* Header */}
          <div className="p-4 border-b border-border sticky top-0 bg-background/90 backdrop-blur-md z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">💼 My Portfolio</h2>
              <button
                onClick={() => setPortfolioOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Summary */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Invested</p>
                <p className="text-sm font-bold text-white">
                  {formatCurrency(totals.totalInvested, currency)}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-slate-400">Current</p>
                <p className="text-sm font-bold text-white">
                  {formatCurrency(totals.totalCurrentValue, currency)}
                </p>
              </div>
              <div className={`rounded-lg p-3 ${totals.totalPnL >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <p className="text-xs text-slate-400">P&L</p>
                <p className={`text-sm font-bold ${totals.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(Math.abs(totals.totalPnL), currency)}
                </p>
                <p className={`text-xs ${totals.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(totals.totalPnLPercent)}
                </p>
              </div>
            </div>
          </div>

          {/* Holdings */}
          <div className="p-4">
            {portfolio.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">💼</p>
                <p className="text-slate-400 text-sm">Your portfolio is empty</p>
                <p className="text-slate-500 text-xs mt-2">
                  Click on any stock tower, then use "Add to Portfolio" button
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {portfolio.map(entry => {
                  const quote = data?.get(entry.instrumentId);
                  const currentPrice = quote?.price || entry.buyPrice;
                  const investedValue = entry.buyPrice * entry.quantity;
                  const currentValue = currentPrice * entry.quantity;
                  const pnl = currentValue - investedValue;
                  const pnlPercent = (pnl / investedValue) * 100;
                  const changeFromPrevClose = quote?.changePercent || 0;

                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      className="bg-muted/30 rounded-lg p-3 border border-border"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-white">{entry.symbol}</p>
                            <span className="text-xs text-slate-400 bg-muted px-2 py-0.5 rounded">
                              {entry.quantity} qty
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{entry.name}</p>
                        </div>
                        <button
                          onClick={() => removePortfolioEntry(entry.id)}
                          className="text-slate-500 hover:text-red-400 text-xs ml-2"
                          title="Remove from portfolio"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Buy Price:</span>
                          <span className="ml-1 text-slate-300">
                            {formatCurrency(entry.buyPrice, currency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Current:</span>
                          <span className="ml-1 text-slate-300">
                            {formatCurrency(currentPrice, currency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Invested:</span>
                          <span className="ml-1 text-slate-300">
                            {formatCurrency(investedValue, currency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Value:</span>
                          <span className="ml-1 text-white font-medium">
                            {formatCurrency(currentValue, currency)}
                          </span>
                        </div>
                      </div>

                      <div className={`mt-2 flex items-center justify-between pt-2 border-t border-border/50 ${
                        pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <span className="text-xs font-medium">
                          {pnl >= 0 ? '📈 Profit:' : '📉 Loss:'} {formatCurrency(Math.abs(pnl), currency)}
                        </span>
                        <span className="text-xs font-bold">
                          {formatPercent(pnlPercent)}
                        </span>
                      </div>

                      {quote && (
                        <div className="mt-1 text-xs text-slate-500">
                          Today: <span className={changeFromPrevClose >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {formatPercent(changeFromPrevClose)}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-slate-500">
              💡 Portfolio is stored locally in your browser. Not connected to any broker.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ⚠️ P&L is approximate based on available data. Not financial advice.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
