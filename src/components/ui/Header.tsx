import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import { getMarketStatus, getISTTime } from '../../utils/market-hours';
import { useEffect, useState } from 'react';

function TableToggle() {
  const { isTableMode, setTableMode } = useAppStore();
  return (
    <button
      onClick={() => setTableMode(!isTableMode)}
      className={`glass glass-hover px-2 md:px-3 py-1.5 rounded-lg text-sm ${
        isTableMode ? 'text-primary border-primary/30' : 'text-slate-400'
      }`}
      title="Toggle Table View (T)"
    >
      <span className="hidden md:inline">{isTableMode ? '📊 3D' : '📋 Table'}</span>
      <span className="md:hidden">📋</span>
    </button>
  );
}

function PortfolioButton() {
  const { isPortfolioOpen, setPortfolioOpen, portfolio } = useAppStore();
  return (
    <button
      onClick={() => setPortfolioOpen(!isPortfolioOpen)}
      className={`glass glass-hover px-2 md:px-3 py-1.5 rounded-lg text-sm relative ${
        isPortfolioOpen ? 'text-purple-400 border-purple-500/30' : 'text-slate-400'
      }`}
      title="Open Portfolio (P)"
    >
      💼
      {portfolio.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {portfolio.length}
        </span>
      )}
    </button>
  );
}

function GameModeToggle() {
  const { gameMode, toggleGameMode } = useAppStore();
  return (
    <button
      onClick={toggleGameMode}
      className={`glass glass-hover px-2 md:px-3 py-1.5 rounded-lg text-sm ${
        gameMode ? 'text-cyan-400 border-cyan-500/30' : 'text-slate-400'
      }`}
      title="Game Mode: WASD to move, Mouse to look (G)"
    >
      🎮
    </button>
  );
}

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
        <div className="flex items-center gap-2 md:gap-3">
          {/* Time */}
          <div className="text-sm text-slate-400 font-mono hidden lg:block">
            {time} IST
          </div>

          {/* Game mode toggle */}
          <GameModeToggle />

          {/* Portfolio button */}
          <PortfolioButton />

          {/* Table view toggle */}
          <TableToggle />

          {/* Currency toggle */}
          <button
            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
            className="glass glass-hover px-2 md:px-3 py-1.5 rounded-lg text-sm font-medium"
          >
            {currency === 'INR' ? '₹ INR' : '$ USD'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="glass glass-hover px-2 md:px-3 py-1.5 rounded-lg text-sm"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </motion.header>
  );
}
