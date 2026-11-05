import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { getMarketStatus, getISTTime } from '../../utils/market-hours';
import { useEffect, useState } from 'react';

export function Header() {
  const { currency, setCurrency, theme, setTheme } = useAppStore();
  const [time, setTime] = useState(getISTTime());
  const marketStatus = getMarketStatus('NSE');

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getISTTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    open: 'bg-green-500',
    closed: 'bg-red-500',
    'pre-open': 'bg-yellow-500',
    'pre-close': 'bg-orange-500',
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
            MarketVerse 3D
          </h1>
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${statusColors[marketStatus.status]} animate-pulse`} />
            <span className="text-slate-400">{marketStatus.message}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Time */}
          <div className="text-sm text-slate-400 font-mono">
            {time} IST
          </div>

          {/* Currency toggle */}
          <button
            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
            className="glass glass-hover px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            {currency === 'INR' ? '₹ INR' : '$ USD'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="glass glass-hover px-3 py-1.5 rounded-lg text-sm"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </motion.header>
  );
}
