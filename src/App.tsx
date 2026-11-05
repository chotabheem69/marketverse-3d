import { Suspense, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Scene } from './components/Scene';
import { Header } from './components/ui/Header';
import { WorldNavigation } from './components/ui/WorldNavigation';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Disclaimer } from './components/ui/Disclaimer';
import { DetailPanel } from './components/panels/DetailPanel';
import { useAppStore } from './store/appStore';

function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    // Simulate loading progress
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
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

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
          <Disclaimer />
        </>
      )}
    </>
  );
}

export default App;
