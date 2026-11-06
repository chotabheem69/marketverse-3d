import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';

interface WorldGuide {
  title: string;
  emoji: string;
  tagline: string;
  sections: {
    heading: string;
    items: string[];
  }[];
  shortcuts?: { key: string; action: string }[];
}

const WORLD_GUIDES: Record<string, WorldGuide> = {
  'india-city': {
    title: 'India Equity City',
    emoji: '🏙️',
    tagline: 'Explore Nifty 50 stocks as a 3D city',
    sections: [
      {
        heading: 'What you see',
        items: [
          'Each tower = one Nifty 50 stock',
          'Tower height = market cap (bigger = larger company)',
          'Tower color = today\'s change (green = up, red = down)',
          'Towers grouped into sector districts (Banking, IT, Energy...)',
          'Floating banner shows Nifty 50, Sensex, Bank Nifty live',
        ],
      },
      {
        heading: 'How to interact',
        items: [
          '🖱️ Hover any tower → quick tooltip with price & change',
          '👆 Click a tower → opens detail panel (right side) with chart',
          '🔄 Drag to rotate view, scroll to zoom',
          '🎮 Press G for game mode: WASD to walk, mouse to look',
          '🎯 In game mode: look at a tower 0.4s → auto-opens details',
        ],
      },
    ],
    shortcuts: [
      { key: 'Ctrl+K', action: 'Search all stocks' },
      { key: 'G', action: 'Toggle game mode' },
      { key: 'Click', action: 'Open stock details' },
      { key: 'P', action: 'Open portfolio' },
    ],
  },
  'terrain': {
    title: 'Terrain Mode',
    emoji: '🏔️',
    tagline: 'See price history as a 3D landscape',
    sections: [
      {
        heading: 'What you see',
        items: [
          '3D ridge = price history of selected instrument',
          'X-axis = time, Y-axis = price level',
          'Green slopes = price went up, Red slopes = price went down',
          'Glowing lines = moving averages (SMA overlays)',
        ],
      },
      {
        heading: 'How to use',
        items: [
          'First: Select a stock from India City (click any tower)',
          'Then: Come here to see its price terrain',
          'Timeframe buttons: 1M, 6M, 1Y, 3Y, 5Y',
          'Toggle SMA 20/50/200 overlays on/off',
          '🎮 Press G for game mode to fly over the terrain',
        ],
      },
    ],
    shortcuts: [
      { key: '1M-5Y', action: 'Change timeframe' },
      { key: 'G', action: 'Fly over terrain' },
      { key: 'T', action: 'Table view of data' },
    ],
  },
  'mf-galaxy': {
    title: 'Mutual Fund Galaxy',
    emoji: '🌌',
    tagline: 'Mutual funds as orbs in 3D space',
    sections: [
      {
        heading: 'What you see',
        items: [
          'Each glowing orb = one mutual fund',
          'Orb color = fund category (blue = large-cap, purple = flexi-cap, etc.)',
          'Central nebula represents the mutual fund universe',
        ],
      },
      {
        heading: 'How to use',
        items: [
          '🖱️ Hover orb → shows NAV, 1Y return, 3Y CAGR',
          '👆 Click orb → opens detail panel with chart',
          '📊 SIP Simulator (right panel): Set monthly amount & years → see projected growth',
          '⭐ Add fund to watchlist from the detail panel',
        ],
      },
    ],
    shortcuts: [
      { key: 'Hover', action: 'See fund stats' },
      { key: 'Click', action: 'Open fund details' },
      { key: 'Ctrl+K', action: 'Search funds by name' },
    ],
  },
  'crypto-reactor': {
    title: 'Crypto Reactor',
    emoji: '⚛️',
    tagline: 'Live crypto prices in a reactor core',
    sections: [
      {
        heading: 'What you see',
        items: [
          '🟠 Central core = Bitcoin (size = BTC dominance %)',
          'Each pillar = one cryptocurrency',
          'Pillar height = market cap (bigger = larger coin)',
          'Pillar color = 24h change (green = up, red = down)',
          'Pillars pulse with live price updates',
        ],
      },
      {
        heading: 'How to use',
        items: [
          '🖱️ Hover pillar → shows current price & 24h % change',
          '👆 Click pillar → opens detail panel with chart',
          '💱 Toggle USD/INR button to switch currency',
          '🎮 Press G to walk around the reactor',
        ],
      },
    ],
    shortcuts: [
      { key: 'G', action: 'Walk around reactor' },
      { key: 'Hover', action: 'See live price' },
      { key: 'Click', action: 'Open crypto details' },
    ],
  },
  'global-earth': {
    title: 'Global Earth',
    emoji: '🌍',
    tagline: 'World markets on a rotating 3D globe',
    sections: [
      {
        heading: 'What you see',
        items: [
          '3D globe with 8 major exchanges pinned',
          'Each column = that exchange\'s main index',
          'Column height = daily % change',
          '🟢 Green glow = market is currently OPEN',
          '🔴 Red dot = market is CLOSED',
          'Arcs connect Mumbai (India) to other exchanges',
        ],
      },
      {
        heading: 'How to use',
        items: [
          '🖱️ Hover a column → shows index name, price, change',
          '👆 Click a column → opens detail panel with chart',
          '🕐 World Clock panel shows open/closed status of all markets',
          '🔄 Globe rotates automatically — drag to control',
        ],
      },
    ],
    shortcuts: [
      { key: 'Drag', action: 'Rotate globe' },
      { key: 'Scroll', action: 'Zoom in/out' },
      { key: 'Ctrl+K', action: 'Search global indices' },
    ],
  },
  'watchlist': {
    title: 'My Watchlist',
    emoji: '⭐',
    tagline: 'Your personal market skyline',
    sections: [
      {
        heading: 'What you see',
        items: [
          'Each tower = one instrument you\'ve added to watchlist',
          'Same color coding as India City (green = up, red = down)',
          'Tower height = market cap or price scale',
        ],
      },
      {
        heading: 'How to use',
        items: [
          '➕ Add any stock/fund/crypto to watchlist from its detail panel',
          '👆 Click a tower → opens detail panel',
          '❌ Hover for "Remove" option',
          '💼 Portfolio tab: Track buy price, quantity, P&L',
        ],
      },
    ],
    shortcuts: [
      { key: 'Ctrl+K', action: 'Search & add items' },
      { key: 'P', action: 'Open portfolio tracker' },
      { key: 'Click', action: 'View item details' },
    ],
  },
};

// Global keyboard shortcuts (shown on all worlds)
const GLOBAL_SHORTCUTS = [
  { key: 'Ctrl+K', action: 'Search all markets' },
  { key: 'G', action: 'Game mode (WASD + mouse)' },
  { key: 'P', action: 'Portfolio tracker' },
  { key: 'T', action: 'Table view' },
  { key: '1-6', action: 'Switch worlds' },
  { key: 'Esc', action: 'Close panels / Exit look' },
];

export function WorldInstructions() {
  const currentWorld = useAppStore((state) => state.currentWorld);
  const [isVisible, setIsVisible] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [seenWorlds, setSeenWorlds] = useState<Set<string>>(new Set());

  // Load seen worlds from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('marketverse-seen-worlds');
      if (stored) {
        setSeenWorlds(new Set(JSON.parse(stored)));
      }
    } catch (e) {}
  }, []);

  // Show instructions when entering a new world for the first time
  useEffect(() => {
    if (!seenWorlds.has(currentWorld)) {
      setIsVisible(true);
      const newSeen = new Set(seenWorlds);
      newSeen.add(currentWorld);
      setSeenWorlds(newSeen);
      try {
        localStorage.setItem('marketverse-seen-worlds', JSON.stringify([...newSeen]));
      } catch (e) {}
      
      // Auto-hide after 15 seconds
      const timer = setTimeout(() => setIsVisible(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [currentWorld]);

  const guide = WORLD_GUIDES[currentWorld];
  if (!guide) return null;

  return (
    <>
      {/* Help button (always visible) */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-20 left-4 z-40 glass glass-hover w-10 h-10 rounded-full flex items-center justify-center text-lg hover:scale-110 transition-transform"
        title="Show instructions"
      >
        {isVisible ? '✕' : '❓'}
      </button>

      {/* Keyboard shortcuts button */}
      <button
        onClick={() => setShowShortcuts(!showShortcuts)}
        className="fixed top-20 left-16 z-40 glass glass-hover px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white"
        title="Keyboard shortcuts"
      >
        ⌨️ Shortcuts
      </button>

      {/* Instructions panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="fixed top-32 left-4 z-30 w-80 max-h-[calc(100vh-10rem)] overflow-y-auto"
          >
            <div className="glass rounded-xl p-4 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{guide.emoji}</span>
                  <div>
                    <h3 className="text-white font-bold text-sm">{guide.title}</h3>
                    <p className="text-xs text-slate-400">{guide.tagline}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Sections */}
              <div className="space-y-3 mt-3">
                {guide.sections.map((section, idx) => (
                  <div key={idx}>
                    <p className="text-xs font-bold text-cyan-400 mb-1">
                      {section.heading}
                    </p>
                    <ul className="space-y-1">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-xs text-slate-300 flex gap-1.5">
                          <span className="text-slate-500 flex-shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* World-specific shortcuts */}
              {guide.shortcuts && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-bold text-cyan-400 mb-1">Quick keys</p>
                  <div className="grid grid-cols-2 gap-1">
                    {guide.shortcuts.map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs">
                        <kbd className="bg-muted px-1.5 py-0.5 rounded text-slate-300 font-mono text-[10px]">
                          {s.key}
                        </kbd>
                        <span className="text-slate-400 truncate">{s.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Don't show again button */}
              <button
                onClick={() => setIsVisible(false)}
                className="mt-3 w-full text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Got it, hide this
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts panel (modal) */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative glass rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  ⌨️ Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1.5">
                {GLOBAL_SHORTCUTS.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <kbd className="bg-muted px-2 py-1 rounded text-white font-mono text-xs">
                      {s.key}
                    </kbd>
                    <span className="text-slate-300 text-sm">{s.action}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-slate-500">
                  💡 <strong className="text-slate-400">Game Mode (G key):</strong> WASD to move, Mouse to look, 
                  Space/C to fly up/down, Shift to sprint. Click to select towers.
                </p>
              </div>

              <button
                onClick={() => setShowShortcuts(false)}
                className="mt-4 w-full py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
