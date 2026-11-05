// Cinematic tour through all worlds

import { useCallback, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import type { WorldId } from '../data/types';

const TOUR_WORLDS: WorldId[] = [
  'india-city',
  'terrain',
  'mf-galaxy',
  'crypto-reactor',
  'global-earth',
  'watchlist',
];

const WORLD_DURATION = 6000; // 6 seconds per world

export function useCinematicTour() {
  const [isTouring, setIsTouring] = useState(false);
  const currentIndex = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setCurrentWorld = useAppStore((state) => state.setCurrentWorld);

  const startTour = useCallback(() => {
    setIsTouring(true);
    currentIndex.current = 0;
    
    const goToNext = () => {
      if (currentIndex.current >= TOUR_WORLDS.length) {
        setIsTouring(false);
        return;
      }
      
      setCurrentWorld(TOUR_WORLDS[currentIndex.current]);
      currentIndex.current++;
      
      timeoutRef.current = setTimeout(goToNext, WORLD_DURATION);
    };
    
    goToNext();
  }, [setCurrentWorld]);

  const stopTour = useCallback(() => {
    setIsTouring(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { isTouring, startTour, stopTour };
}
