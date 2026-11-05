import { motion } from 'framer-motion';
import { useAppStore } from '../../store/appStore';
import type { WorldId } from '../../data/types';

const WORLDS: { id: WorldId; label: string; icon: string }[] = [
  { id: 'india-city', label: 'India City', icon: '🏙️' },
  { id: 'terrain', label: 'Terrain', icon: '🏔️' },
  { id: 'mf-galaxy', label: 'MF Galaxy', icon: '🌌' },
  { id: 'crypto-reactor', label: 'Crypto', icon: '⚛️' },
  { id: 'global-earth', label: 'Global', icon: '🌍' },
  { id: 'watchlist', label: 'Watchlist', icon: '⭐' },
];

export function WorldNavigation() {
  const currentWorld = useAppStore((state) => state.currentWorld);
  const setCurrentWorld = useAppStore((state) => state.setCurrentWorld);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="glass rounded-2xl p-2 flex gap-2 shadow-2xl">
        {WORLDS.map((world) => (
          <button
            key={world.id}
            onClick={() => setCurrentWorld(world.id)}
            className={`
              relative px-4 py-3 rounded-xl transition-all duration-200
              flex flex-col items-center gap-1 min-w-[80px]
              ${currentWorld === world.id
                ? 'bg-primary/20 text-primary'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            <span className="text-2xl">{world.icon}</span>
            <span className="text-xs font-medium">{world.label}</span>
            
            {currentWorld === world.id && (
              <motion.div
                layoutId="activeWorld"
                className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/30"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
