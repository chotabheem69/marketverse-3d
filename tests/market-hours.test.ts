import { describe, it, expect } from 'vitest';
import { getMarketStatus, getISTTime, getNextMarketOpen } from '../src/utils/market-hours';

describe('getMarketStatus', () => {
  it('returns a valid status object', () => {
    const status = getMarketStatus('NSE');
    expect(status).toHaveProperty('status');
    expect(status).toHaveProperty('message');
    expect(status).toHaveProperty('timeToChange');
    expect(['open', 'closed', 'pre-open', 'pre-close']).toContain(status.status);
  });

  it('handles unknown markets', () => {
    const status = getMarketStatus('UNKNOWN');
    expect(status.status).toBe('closed');
  });

  it('returns valid timeToChange', () => {
    const status = getMarketStatus('NSE');
    expect(status.timeToChange).toBeGreaterThanOrEqual(0);
  });
});

describe('getISTTime', () => {
  it('returns a valid time string', () => {
    const time = getISTTime();
    expect(time).toMatch(/\d{2}:\d{2}:\d{2}/);
  });
});

describe('getNextMarketOpen', () => {
  it('returns a Date or null', () => {
    const next = getNextMarketOpen('NSE');
    if (next !== null) {
      expect(next).toBeInstanceOf(Date);
    }
  });

  it('returns null for unknown markets', () => {
    const next = getNextMarketOpen('UNKNOWN');
    expect(next).toBeNull();
  });
});
