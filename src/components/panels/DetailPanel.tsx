import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { useQuote, useCandles } from '../../data/hooks';
import { formatCurrency, formatPercent, formatVolume, formatTimestamp } from '../../utils/formatters';
import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';

export function DetailPanel() {
  const { selectedInstrument, isDetailPanelOpen, setDetailPanelOpen, currency, watchlist, addToWatchlist, removeFromWatchlist } = useAppStore();
  const { data: quoteData } = useQuote(selectedInstrument?.id || '');
  const { data: candlesData } = useCandles(selectedInstrument?.id || '', '6M');
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const isWatchlisted = selectedInstrument ? watchlist.includes(selectedInstrument.id) : false;

  useEffect(() => {
    if (!chartContainerRef.current || !candlesData?.candles || !isDetailPanelOpen) return;

    // Clear existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

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
      width: chartContainerRef.current.clientWidth,
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

    const data = candlesData.candles.map(c => ({
      time: Math.floor(c.time / 1000) as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candleSeries.setData(data);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candlesData, isDetailPanelOpen]);

  const quote = quoteData?.quote;

  return (
    <AnimatePresence>
      {isDetailPanelOpen && selectedInstrument && (
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
              <div>
                <h2 className="text-xl font-bold text-white">{selectedInstrument.symbol}</h2>
                <p className="text-sm text-slate-400">{selectedInstrument.name}</p>
                {selectedInstrument.sector && (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-primary/20 text-primary">
                    {selectedInstrument.sector}
                  </span>
                )}
              </div>
              <button
                onClick={() => setDetailPanelOpen(false)}
                className="text-slate-400 hover:text-white p-1"
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

            {/* Watchlist button */}
            <button
              onClick={() => {
                if (isWatchlisted) {
                  removeFromWatchlist(selectedInstrument.id);
                } else {
                  addToWatchlist(selectedInstrument.id);
                }
              }}
              className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                isWatchlisted 
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
              }`}
            >
              {isWatchlisted ? '⭐ In Watchlist' : '☆ Add to Watchlist'}
            </button>
          </div>

          {/* Chart */}
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-medium text-slate-400 mb-2">6 Month Chart</h3>
            <div ref={chartContainerRef} className="w-full" />
          </div>

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
