import { motion } from 'framer-motion';

interface LoadingScreenProps {
  progress: number;
  message?: string;
}

export function LoadingScreen({ progress, message = 'Loading market data...' }: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
          MarketVerse 3D
        </h1>
        <p className="text-slate-400 text-center mt-2">Explore markets in 3D</p>
      </motion.div>

      {/* Progress bar */}
      <div className="w-80 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          className="h-full bg-gradient-to-r from-cyan-400 to-teal-400"
        />
      </div>

      {/* Message */}
      <p className="text-sm text-slate-400 mt-4">{message}</p>

      {/* Disclaimer */}
      <div className="absolute bottom-8 text-center text-xs text-slate-500 max-w-md px-4">
        <p>
          Data may be delayed or inaccurate. Not financial advice.
        </p>
      </div>
    </motion.div>
  );
}
