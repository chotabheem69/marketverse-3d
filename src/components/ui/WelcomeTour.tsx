import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';

interface TourStep {
  emoji: string;
  title: string;
  subtitle?: string;
  description: string;
  highlight?: string;
  cta?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    emoji: '🌆',
    title: 'Welcome to MarketVerse 3D',
    subtitle: 'Explore markets as explorable 3D worlds',
    description: 'This is not just another stock dashboard. Walk through a city where every tower is a stock, fly over price terrains, and orbit a globe showing live markets worldwide.',
    highlight: 'Built for learners, by a learner',
  },
  {
    emoji: '🏙️',
    title: 'India Equity City',
    subtitle: 'Your home base — Nifty 50 as a 3D city',
    description: 'Each tower is a stock from Nifty 50. Tower height = market cap. Color = today\'s performance (green up, red down). Grouped into sector districts like Banking, IT, Energy.',
    highlight: 'Click any tower to see live price + chart',
  },
  {
    emoji: '🎮',
    title: 'Game Mode — Walk Around',
    subtitle: 'Press G to explore like a video game',
    description: 'WASD to move, mouse to look around, Space/C to fly up/down, Shift to sprint. Point at any tower for 0.4 seconds and it auto-shows the details!',
    highlight: 'Try it now: Press G, then click the canvas',
    cta: 'W + A + S + D  |  Mouse to look  |  Click to select',
  },
  {
    emoji: '📈',
    title: 'Detail Panel — Deep Dive',
    subtitle: 'Charts, stats, and real trading links',
    description: 'Click any stock/fund/crypto to open the right panel with a live TradingView chart, key stats, and direct links to trade on Zerodha, Groww, Upstox, or other brokers.',
    highlight: 'One click takes you to your broker',
  },
  {
    emoji: '💼',
    title: 'Portfolio Tracker',
    subtitle: 'Press P to see your holdings',
    description: 'Add any stock with your buy price and quantity. See live profit/loss, total invested vs current value, and daily changes. All stored locally in your browser — no login needed.',
    highlight: 'Press P to open now',
  },
  {
    emoji: '🔍',
    title: 'Search Everything',
    subtitle: 'Press Ctrl+K (or Cmd+K on Mac)',
    description: 'Instantly search 300+ instruments: Indian stocks, US stocks, mutual funds, crypto, commodities (Gold, Crude Oil), and global indices. Fuzzy matching finds anything.',
    highlight: 'Try: "reliance", "bitcoin", "gold"',
  },
  {
    emoji: '🌍',
    title: 'Explore 5 More Worlds',
    subtitle: 'Switch worlds with keys 1-6',
    description: '🏔️ Terrain Mode — fly over price history as mountains.\n🌌 MF Galaxy — mutual funds as glowing orbs + SIP simulator.\n⚛️ Crypto Reactor — live Bitcoin core + 20 coins.\n🌍 Global Earth — world markets on a 3D globe.\n⭐ Watchlist — your personal skyline.',
    highlight: 'Each world has its own guide (❓ button)',
  },
  {
    emoji: '🚀',
    title: 'You\'re Ready!',
    subtitle: 'Start exploring MarketVerse 3D',
    description: 'Remember: Data is educational only — not financial advice. Always do your own research. Now go explore the city, walk around in game mode, and click anything that interests you!',
    highlight: 'Tip: Click the ❓ button anytime for world-specific help',
    cta: 'Have fun! 🎉',
  },
];

const STORAGE_KEY = 'marketverse-tour-completed';

export function WelcomeTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState<boolean | null>(null);
  const setCurrentWorld = useAppStore((state) => state.setCurrentWorld);

  // Check if tour was completed before
  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      setHasCompletedTour(completed === 'true');
      // Show tour on first visit (after a short delay)
      if (completed !== 'true') {
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      setHasCompletedTour(false);
    }
  }, []);

  // Expose replay function on window
  useEffect(() => {
    (window as any).__startWelcomeTour = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };
  }, []);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      finishTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishTour = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {}
    setHasCompletedTour(true);
    // Jump to India City when tour finishes
    setCurrentWorld('india-city');
  };

  const handleSkip = () => {
    finishTour();
  };

  if (hasCompletedTour === null) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const isFirst = currentStep === 0;

  return (
    <>
      {/* Replay tour button (small, top-right area) */}
      {hasCompletedTour && !isOpen && (
        <button
          onClick={() => {
            setCurrentStep(0);
            setIsOpen(true);
          }}
          className="fixed top-20 right-4 z-30 glass glass-hover px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
          title="Replay welcome tour"
        >
          🎓 Replay Tour
        </button>
      )}

      {/* Tour overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    opacity: 0,
                  }}
                  animate={{
                    y: [null, Math.random() * window.innerHeight],
                    opacity: [0, 0.3, 0],
                  }}
                  transition={{
                    duration: 5 + Math.random() * 5,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                  }}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                />
              ))}
            </div>

            {/* Modal */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="relative glass rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-cyan-500/20"
            >
              {/* Progress indicator */}
              <div className="absolute top-4 right-4 text-xs text-slate-500">
                {currentStep + 1} / {TOUR_STEPS.length}
              </div>

              {/* Progress bar */}
              <div className="mb-6 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-cyan-400 to-teal-400"
                />
              </div>

              {/* Emoji / Icon */}
              <motion.div
                key={`emoji-${currentStep}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="text-7xl mb-4"
              >
                {step.emoji}
              </motion.div>

              {/* Title */}
              <motion.h2
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent mb-2"
              >
                {step.title}
              </motion.h2>

              {/* Subtitle */}
              {step.subtitle && (
                <motion.p
                  key={`subtitle-${currentStep}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-400 text-sm mb-4"
                >
                  {step.subtitle}
                </motion.p>
              )}

              {/* Description */}
              <motion.p
                key={`desc-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-slate-200 leading-relaxed mb-4 whitespace-pre-line"
              >
                {step.description}
              </motion.p>

              {/* Highlight box */}
              {step.highlight && (
                <motion.div
                  key={`highlight-${currentStep}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-3 mb-3"
                >
                  <p className="text-cyan-300 text-sm font-medium flex items-center gap-2">
                    <span>💡</span>
                    {step.highlight}
                  </p>
                </motion.div>
              )}

              {/* CTA box (special callouts) */}
              {step.cta && (
                <motion.div
                  key={`cta-${currentStep}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="bg-muted/50 rounded-lg px-4 py-3 text-center"
                >
                  <p className="text-white text-sm font-mono">
                    {step.cta}
                  </p>
                </motion.div>
              )}

              {/* Navigation */}
              <div className="mt-6 flex items-center justify-between">
                <div>
                  {!isFirst && (
                    <button
                      onClick={handlePrev}
                      className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      ← Previous
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  {!isLast && (
                    <button
                      onClick={handleSkip}
                      className="px-4 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Skip tour
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/20"
                  >
                    {isLast ? '🚀 Start Exploring' : 'Next →'}
                  </button>
                </div>
              </div>

              {/* Step dots */}
              <div className="mt-4 flex justify-center gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStep
                        ? 'w-8 bg-cyan-400'
                        : i < currentStep
                        ? 'w-1.5 bg-cyan-400/50'
                        : 'w-1.5 bg-slate-600'
                    }`}
                    aria-label={`Go to step ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
