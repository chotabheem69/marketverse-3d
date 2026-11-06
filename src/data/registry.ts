// Instrument registry for raycasting
// Each scene registers its instruments so GameControls can look them up

import type { Instrument } from '../data/types';

const registry = new Map<string, Instrument>();

export function registerInstrument(instrument: Instrument) {
  registry.set(instrument.id, instrument);
}

export function registerInstruments(instruments: Instrument[]) {
  for (const inst of instruments) {
    registry.set(inst.id, inst);
  }
}

export function findInstrumentById(id: string): Instrument | null {
  return registry.get(id) || null;
}

// Also expose on window for dynamic access
if (typeof window !== 'undefined') {
  (window as any).__findInstrument = findInstrumentById;
  (window as any).__registerInstrument = registerInstrument;
  (window as any).__registerInstruments = registerInstruments;
}
