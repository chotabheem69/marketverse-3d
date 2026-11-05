import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorldId, Currency, ThemeMode, Instrument } from '../data/types';

interface AppState {
  // Current world/district
  currentWorld: WorldId;
  setCurrentWorld: (world: WorldId) => void;

  // Selected instrument
  selectedInstrument: Instrument | null;
  setSelectedInstrument: (instrument: Instrument | null) => void;

  // Currency preference
  currency: Currency;
  setCurrency: (currency: Currency) => void;

  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // UI state
  isDetailPanelOpen: boolean;
  setDetailPanelOpen: (open: boolean) => void;
  isTableMode: boolean;
  setTableMode: (mode: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Watchlist
  watchlist: string[]; // Array of instrument IDs
  addToWatchlist: (instrumentId: string) => void;
  removeFromWatchlist: (instrumentId: string) => void;

  // Data mode
  useDemoData: boolean;
  setUseDemoData: (useDemo: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // World state
      currentWorld: 'india-city',
      setCurrentWorld: (world) => set({ currentWorld: world }),

      // Selected instrument
      selectedInstrument: null,
      setSelectedInstrument: (instrument) => set({ 
        selectedInstrument: instrument,
        isDetailPanelOpen: instrument !== null 
      }),

      // Currency
      currency: 'INR',
      setCurrency: (currency) => set({ currency }),

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // UI state
      isDetailPanelOpen: false,
      setDetailPanelOpen: (open) => set({ isDetailPanelOpen: open }),
      isTableMode: false,
      setTableMode: (mode) => set({ isTableMode: mode }),
      isCommandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),

      // Watchlist
      watchlist: [],
      addToWatchlist: (instrumentId) => set((state) => ({
        watchlist: [...state.watchlist, instrumentId]
      })),
      removeFromWatchlist: (instrumentId) => set((state) => ({
        watchlist: state.watchlist.filter(id => id !== instrumentId)
      })),

      // Data mode
      useDemoData: false,
      setUseDemoData: (useDemo) => set({ useDemoData: useDemo }),
    }),
    {
      name: 'marketverse-storage',
      partialize: (state) => ({
        currency: state.currency,
        theme: state.theme,
        watchlist: state.watchlist,
        useDemoData: state.useDemoData,
      }),
    }
  )
);
