import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { useQuote, useCandles } from '../../data/hooks';
import { formatCurrency, formatPercent, formatVolume, formatTimestamp } from '../../utils/formatters';
import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';

// Trading platforms for Indian stocks - add your preferred broker here
const TRADING_PLATFORMS = {
  'IN': [
    { name: 'Zerodha', url: (symbol: string) => `https://kite.zerodha.com/chart/NSE/${symbol}` },
    { name: 'Groww', url: (symbol: string) => `https://groww.in/stocks/${symbol.toLowerCase()}` },
    { name: 'Upstox', url: (symbol: string) => `https://upstox.com/market-details/stock-details/NSE/${symbol}` },
    { name: 'Angel One', url: (symbol: string) => `https://www.angelone.in/stock-details/${symbol.toLowerCase()}` },
  ],
  'US': [
    { name: 'Yahoo Finance', url: (symbol: string) => `https://finance.yahoo.com/quote/${symbol}` },
    { name: 'TradingView', url: (symbol: string) => `https://www.tradingview.com/symbols/${symbol}/` },
    { name: 'Robinhood', url: (symbol: string) => `https://robinhood.com/stocks/${symbol}` },
  ],
  'GLOBAL': [
    { name: 'Yahoo Finance', url: (symbol: string) => `https://finance.yahoo.com/quote/${symbol}` },
    { name: 'TradingView', url: (symbol: string) => `https://www.tradingview.com/symbols/${symbol}/` },
  ],
};

export function DetailPanel() {
  const { 
    selectedInstrument, 
    isDetailPanelOpen, 
    setDetailPanelOpen, 
    currency, 
    watchlist, 
    addToWatchlist, 
    removeFromWatchlist,
    addPortfolioEntry,
  } = useAppStore();
  const { data: quoteData } = useQuote(selectedInstrument?.id || '');
  const { data: candlesData } = useCandles(selectedInstrument?.id || '', '6M');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [showAddToPortfolio, setShowAddToPortfolio] = useState(false);
  const [portfolioBuyPrice, setPortfolioBuyPrice] = useState('');
  const [portfolioQty, setPortfolioQty] = useState('');

  const isWatchlisted = selectedInstrument ? watchlist.includes(selectedInstrument.id) : false;
  const quote = quoteData?.quote;
  const region = selectedInstrument?.region || 'GLOBAL';
  const platforms = TRADING_PLATFORMS[region as keyof typeof TRADING_PLATFORMS] || TRADING_PLATFORMS.GLOBAL;

  useEffect(() => {
    if (!chartContainerRef.current || !candlesData?.candles || !isDetailPanelOpen) return;
    
    // Wait a tick for container to render
    const timer = setTimeout(() => {
      if (!chartContainerRef.current) return;

      // Clear existing chart
      if (chartRef.current) {
        try { chartRef.current.remove(); } catch (e) {}
        chartRef.current = null;
      }

      try {
        const chart = createChart(chartContainerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#94a3b8',
            fontSize: 11,
          },
          grid: {
            vertLines: { color: '#1e293b' },
            horzLines: { color: '#1e293b' },
          },
          width: chartContainerRef.current.clientWidth || 350,
          height: 200,
          timeScale: {
            borderColor: '#334155',
            timeVisible: false,
          },
          rightPriceScale: {
            borderColor: '#334155',
          },
          crosshair: {
            mode: 0,
          },
        });

        const candleSeries = (chart as any).addCandlestickSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          borderUpColor: '#10b981',
          borderDownColor: '#ef4444',
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });

        const data = candlesData.candles
          .filter(c => c.close > 0)
          .map(c => ({
            time: Math.floor(c.time / 1000) as any,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
          }));

        if (data.length > 0) {
          candleSeries.setData(data);
          chart.timeScale().fitContent();
        }
        chartRef.current = chart;
      } catch (e) {
        console.warn('Chart failed to render:', e);
      }
    }, 50);

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        try {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        } catch (e) {}
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        try { chartRef.current.remove(); } catch (e) {}
        chartRef.current = null;
      }
    };
  }, [candlesData, isDetailPanelOpen]);

  // Close tooltip when panel opens (prevents z-fighting)
  useEffect(() => {
    if (isDetailPanelOpen) {
      document.body.style.cursor = 'auto';
    }
  }, [isDetailPanelOpen]);

  if (!selectedInstrument) return null;

  const handleAddToPortfolio = () => {
    const buyPrice = parseFloat(portfolioBuyPrice);
    const qty = parseFloat(portfolioQty);
    if (!buyPrice || !qty || buyPrice <= 0 || qty <= 0) return;
    
    addPortfolioEntry({
      instrumentId: selectedInstrument.id,
      symbol: selectedInstrument.symbol,
      name: selectedInstrument.name,
      buyPrice,
      quantity: qty,
      dateAdded: Date.now(),
    });
    
    setShowAddToPortfolio(false);
    setPortfolioBuyPrice('');
    setPortfolioQty('');
    alert(`✅ Added ${qty} shares of ${selectedInstrument.symbol} to your portfolio!`);
  };

  return (
    <AnimatePresence>
      {isDetailPanelOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed right-0 top-16 bottom-0 w-96 z-40 glass border-l border-border overflow-y-auto"
        >
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-white truncate">{selectedInstrument.symbol}</h2>
                <p className="text-sm text-slate-400 truncate">{selectedInstrument.name}</p>
                {selectedInstrument.sector && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-primary/20 text-primary">
                    {selectedInstrument.sector}
                  </span>
                )}
                {selectedInstrument.type === 'fund' && (
                  <span className="inline-block mt-1 ml-1 px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-300">
                    Mutual Fund
                  </span>
                )}
                {selectedInstrument.type === 'crypto' && (
                  <span className="inline-block mt-1 ml-1 px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-300">
                    Crypto
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setDetailPanelOpen(false);
                  setShowPlatforms(false);
                  setShowAddToPortfolio(false);
                }}
                className="text-slate-400 hover:text-white p-1 ml-2 flex-shrink-0"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            {/* Price */}
            {quote && (
              <div className="mt-3">
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(quote.price, currency)}
                </p>
                <p className={`text-lg font-medium ${quote.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(quote.changePercent)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {quote.isLive ? '🟢 Live' : '🟡 Delayed'} · {quote.source} · Updated {formatTimestamp(quote.timestamp)}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-3 space-y-2">
              {/* Watchlist button */}
              <button
                onClick={() => {
                  if (isWatchlisted) {
                    removeFromWatchlist(selectedInstrument.id);
                  } else {
                    addToWatchlist(selectedInstrument.id);
                  }
                }}
                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                  isWatchlisted 
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                }`}
              >
                {isWatchlisted ? '⭐ In Watchlist' : '☆ Add to Watchlist'}
              </button>

              {/* Trade button */}
              <button
                onClick={() => setShowPlatforms(!showPlatforms)}
                className="w-full py-2 rounded-lg text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-colors"
              >
                📈 Trade {showPlatforms ? '▲' : '▼'}
              </button>

              {/* Trading platform links */}
              {showPlatforms && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-1 overflow-hidden"
                >
                  {platforms.map(platform => {
                    const cleanSymbol = selectedInstrument.symbol.replace('.NS', '').replace('-EQ', '');
                    const url = platform.url(cleanSymbol);
                    return (
                      <a
                        key={platform.name}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2 px-3 rounded-lg text-sm text-slate-300 bg-muted/50 hover:bg-muted transition-colors text-left"
                      >
                        🔗 Open in {platform.name} →
                      </a>
                    );
                  })}
                </motion.div>
              )}

              {/* Add to Portfolio */}
              <button
                onClick={() => setShowAddToPortfolio(!showAddToPortfolio)}
                className="w-full py-2 rounded-lg text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
              >
                💼 Add to Portfolio {showAddToPortfolio ? '▲' : '▼'}
              </button>

              {showAddToPortfolio && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="space-y-2 overflow-hidden p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <label className="text-xs text-slate-400">Buy Price ({currency === 'INR' ? '₹' : '$'})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={portfolioBuyPrice}
                      onChange={(e) => setPortfolioBuyPrice(e.target.value)}
                      placeholder={quote ? String(quote.price.toFixed(2)) : '0.00'}
                      className="w-full mt-1 px-3 py-2 rounded bg-muted border border-border text-white text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Quantity</label>
                    <input
                      type="number"
                      step="1"
                      value={portfolioQty}
                      onChange={(e) => setPortfolioQty(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full mt-1 px-3 py-2 rounded bg-muted border border-border text-white text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    onClick={handleAddToPortfolio}
                    disabled={!portfolioBuyPrice || !portfolioQty}
                    className="w-full py-2 rounded-lg text-sm font-medium bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Portfolio
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {/* Chart */}
          {candlesData?.candles && candlesData.candles.length > 0 && (
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium text-slate-400 mb-2">6 Month Chart</h3>
              <div ref={chartContainerRef} className="w-full min-h-[200px]" />
            </div>
          )}

          {/* Stats */}
          {quote && (
            <div className="p-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-400">Key Stats</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Open" value={quote.open ? formatCurrency(quote.open, currency) : '—'} />
                <StatCard label="Prev Close" value={quote.prevClose ? formatCurrency(quote.prevClose, currency) : '—'} />
                <StatCard label="Day High" value={quote.high ? formatCurrency(quote.high, currency) : '—'} />
                <StatCard label="Day Low" value={quote.low ? formatCurrency(quote.low, currency) : '—'} />
                <StatCard label="Volume" value={quote.volume ? formatVolume(quote.volume) : '—'} />
                {quote.marketCap && (
                  <StatCard label="Market Cap" value={formatCurrency(quote.marketCap, currency)} />
                )}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-slate-500">
              ⚠️ Data may be delayed or inaccurate. Not financial advice.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 rounded-lg p-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}
