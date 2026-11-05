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
import { useURLHashState } from './hooks/useURLHashState';
import { useAppStore } from './store/appStore';

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const theme = useAppStore((state) => state.theme);

  // URL hash state for shareable links
  useURLHashState();

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
      const { setTableMode, setCurrentWorld } = useAppStore.getState();
      
      if (e.key === 'Escape') {
        useAppStore.getState().setDetailPanelOpen(false);
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
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          <CommandPalette />
          <TableView />
          <Disclaimer />

          {/* Footer */}
          <footer className="fixed bottom-0 left-0 right-0 z-10 px-4 py-1 text-center">
            <p className="text-xs text-slate-600">
              Data: Yahoo Finance · mfapi.in · CoinGecko · Not financial advice · Press <kbd className="text-slate-400">Ctrl+K</kbd> to search
            </p>
          </footer>
        </>
      )}
    </>
  );
}

export default App;
