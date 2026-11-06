import { Suspense, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Scene } from './components/Scene';
import { Header } from './components/ui/Header';
import { WorldNavigation } from './components/ui/WorldNavigation';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Disclaimer } from './components/ui/Disclaimer';
import { DetailPanel } from './components/panels/DetailPanel';
import { CommandPalette } from './components/ui/CommandPalette';
import { TableView } from './components/ui/TableView';
import { Portfolio } from './components/ui/Portfolio';
import { WorldInstructions } from './components/ui/WorldInstructions';
import { WelcomeTour } from './components/ui/WelcomeTour';
import { Crosshair, GameControlsHint } from './components/scene/GameControls';
import { useURLHashState } from './hooks/useURLHashState';
import { useAppStore } from './store/appStore';
import { registerInstruments } from './data/registry';
import { NIFTY_50, US_STOCKS, TOP_CRYPTO, POPULAR_FUNDS, GLOBAL_INDICES, INDIA_INDICES, COMMODITIES } from './config/universe';

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const theme = useAppStore((state) => state.theme);
  const gameMode = useAppStore((state) => state.gameMode);
  const toggleGameMode = useAppStore((state) => state.toggleGameMode);
  const setGameMode = useAppStore((state) => state.setGameMode);
  const gameHoveredId = useAppStore((state) => state.gameHoveredId);

  // URL hash state for shareable links
  useURLHashState();

  // Register all instruments globally for raycasting lookup
  useEffect(() => {
    const allInstruments: any[] = [];
    
    // Indian stocks
    NIFTY_50.forEach(s => allInstruments.push({
      id: s.symbol, symbol: s.symbol.replace('.NS', ''), name: s.name,
      type: 'stock', region: 'IN', sector: s.sector, currency: 'INR',
    }));
    
    // US stocks
    US_STOCKS.forEach(s => allInstruments.push({
      id: s.symbol, symbol: s.symbol, name: s.name,
      type: 'stock', region: 'US', sector: s.sector, currency: 'USD',
    }));
    
    // Indian indices
    INDIA_INDICES.forEach(i => allInstruments.push({
      id: i.symbol, symbol: i.symbol, name: i.name,
      type: 'index', region: 'IN', currency: 'INR',
    }));
    
    // Global indices
    GLOBAL_INDICES.forEach(i => allInstruments.push({
      id: i.symbol, symbol: i.symbol, name: i.name,
      type: 'index', region: 'GLOBAL', currency: 'USD',
    }));
    
    // Crypto
    TOP_CRYPTO.forEach(c => allInstruments.push({
      id: c.id, symbol: c.symbol, name: c.name,
      type: 'crypto', region: 'GLOBAL', currency: 'USD',
    }));
    
    // Mutual funds
    POPULAR_FUNDS.forEach(f => allInstruments.push({
      id: `MF-${f.schemeCode}`, symbol: f.schemeCode, name: f.name,
      type: 'fund', region: 'IN', category: f.category, currency: 'INR',
    }));
    
    // Commodities
    COMMODITIES.forEach(c => allInstruments.push({
      id: c.symbol, symbol: c.symbol, name: c.name,
      type: 'commodity', region: 'GLOBAL', category: c.category, currency: 'USD',
    }));
    
    registerInstruments(allInstruments);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { setTableMode, setCurrentWorld, setPortfolioOpen, setCommandPaletteOpen, isCommandPaletteOpen } = useAppStore.getState();
      
      // Don't handle shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      
      if (e.key === 'Escape') {
        // In game mode: first close panels, then exit game mode
        if (gameMode) {
          const { isDetailPanelOpen, isPortfolioOpen } = useAppStore.getState();
          if (isDetailPanelOpen || isPortfolioOpen) {
            // Close panels but stay in game mode
            useAppStore.getState().setDetailPanelOpen(false);
            useAppStore.getState().setPortfolioOpen(false);
            useAppStore.getState().setGameHoveredId(null);
          } else {
            // No panels open, exit game mode
            setGameMode(false);
          }
        } else {
          // Not in game mode - normal Esc behavior
          useAppStore.getState().setDetailPanelOpen(false);
          useAppStore.getState().setPortfolioOpen(false);
          if (isCommandPaletteOpen) setCommandPaletteOpen(false);
        }
      }
      
      // Number keys to switch worlds
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const worlds = ['india-city', 'terrain', 'mf-galaxy', 'crypto-reactor', 'global-earth', 'watchlist'] as const;
        const num = parseInt(e.key);
        if (num >= 1 && num <= 6) {
          setCurrentWorld(worlds[num - 1]);
        }
      }
      
      // T to toggle table view
      if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
        const { isTableMode } = useAppStore.getState();
        setTableMode(!isTableMode);
      }
      
      // P to toggle portfolio
      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
        const { isPortfolioOpen } = useAppStore.getState();
        setPortfolioOpen(!isPortfolioOpen);
      }
      
      // G to toggle game mode
      if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey) {
        toggleGameMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, toggleGameMode]);

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen progress={progress} />}
      </AnimatePresence>

      {!loading && (
        <>
          <Header />
          
          <div className="w-full h-full">
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </div>

          <WorldNavigation />
          <DetailPanel />
          <Portfolio />
          <CommandPalette />
          <TableView />
          <WorldInstructions />
          <WelcomeTour />
          <Disclaimer />
          <GameControlsHint active={gameMode} onToggle={toggleGameMode} />
          <Crosshair visible={gameMode} isHovering={!!gameHoveredId} />

          {/* Footer */}
          <footer className="fixed bottom-0 left-0 right-0 z-10 px-4 py-1 text-center">
            <p className="text-xs text-slate-600">
              <kbd className="text-slate-400">Ctrl+K</kbd> Search · <kbd className="text-slate-400">P</kbd> Portfolio · <kbd className="text-slate-400">G</kbd> Game Mode · <kbd className="text-slate-400">T</kbd> Table · <kbd className="text-slate-400">1-6</kbd> Worlds · WASD + Mouse to explore
            </p>
          </footer>
        </>
      )}
    </>
  );
}

export default App;
