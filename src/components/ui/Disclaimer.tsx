import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Disclaimer() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-md"
        >
          <div className="glass rounded-xl px-6 py-4 border border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <span className="text-yellow-500 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm text-yellow-200 font-medium">
                  Educational Tool Only
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Data may be delayed or inaccurate. Not financial advice. 
                  Always do your own research before making investment decisions.
                </p>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
