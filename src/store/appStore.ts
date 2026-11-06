import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorldId, Currency, ThemeMode, Instrument } from '../data/types';

export interface PortfolioEntry {
  id: string;
  instrumentId: string;
  symbol: string;
  name: string;
  buyPrice: number;
  quantity: number;
  dateAdded: number;
}

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
  isPortfolioOpen: boolean;
  setPortfolioOpen: (open: boolean) => void;

  // Game mode (WASD controls)
  gameMode: boolean;
  setGameMode: (enabled: boolean) => void;
  toggleGameMode: () => void;
  
  // Game mode hover target (what the crosshair is pointing at)
  gameHoveredId: string | null;
  setGameHoveredId: (id: string | null) => void;

  // Watchlist
  watchlist: string[];
  addToWatchlist: (instrumentId: string) => void;
  removeFromWatchlist: (instrumentId: string) => void;

  // Portfolio
  portfolio: PortfolioEntry[];
  addPortfolioEntry: (entry: Omit<PortfolioEntry, 'id'>) => void;
  removePortfolioEntry: (id: string) => void;

  // Data mode
  useDemoData: boolean;
  setUseDemoData: (useDemo: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      isPortfolioOpen: false,
      setPortfolioOpen: (open) => set({ isPortfolioOpen: open }),

      // Game mode
      gameMode: false,
      setGameMode: (enabled) => set({ gameMode: enabled }),
      toggleGameMode: () => set((state) => ({ gameMode: !state.gameMode })),
      
      // Game mode hover target
      gameHoveredId: null,
      setGameHoveredId: (id) => set({ gameHoveredId: id }),

      // Watchlist
      watchlist: [],
      addToWatchlist: (instrumentId) => set((state) => ({
        watchlist: state.watchlist.includes(instrumentId) 
          ? state.watchlist 
          : [...state.watchlist, instrumentId]
      })),
      removeFromWatchlist: (instrumentId) => set((state) => ({
        watchlist: state.watchlist.filter(id => id !== instrumentId)
      })),

      // Portfolio
      portfolio: [],
      addPortfolioEntry: (entry) => set((state) => ({
        portfolio: [...state.portfolio, { ...entry, id: crypto.randomUUID() }]
      })),
      removePortfolioEntry: (id) => set((state) => ({
        portfolio: state.portfolio.filter(p => p.id !== id)
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
        portfolio: state.portfolio,
        useDemoData: state.useDemoData,
      }),
    }
  )
);
