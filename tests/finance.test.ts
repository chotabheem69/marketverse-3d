import { describe, it, expect } from 'vitest';
import {
  calculateCAGR,
  calculateVolatility,
  calculateMaxDrawdown,
  calculateSMA,
  calculateEMA,
  calculateXIRR,
  calculateTotalReturn,
  calculateSharpeRatio,
  calculateBeta,
} from '../src/utils/finance';

describe('calculateCAGR', () => {
  it('calculates CAGR correctly', () => {
    // ₹1,00,000 grows to ₹2,00,000 in 5 years = ~14.87% CAGR
    expect(calculateCAGR(100000, 200000, 5)).toBeCloseTo(14.87, 1);
  });

  it('handles 100% return over 1 year', () => {
    expect(calculateCAGR(100, 200, 1)).toBe(100);
  });

  it('handles zero return', () => {
    expect(calculateCAGR(100, 100, 5)).toBe(0);
  });

  it('handles negative returns', () => {
    // ₹1,00,000 shrinks to ₹50,000 in 5 years
    expect(calculateCAGR(100000, 50000, 5)).toBeCloseTo(-12.94, 1);
  });

  it('returns 0 for invalid inputs', () => {
    expect(calculateCAGR(0, 100, 5)).toBe(0);
    expect(calculateCAGR(100, 0, 5)).toBe(0);
    expect(calculateCAGR(100, 200, 0)).toBe(0);
  });
});

describe('calculateVolatility', () => {
  it('calculates volatility from prices', () => {
    const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];
    const vol = calculateVolatility(prices, 252);
    expect(vol).toBeGreaterThan(0);
    expect(vol).toBeLessThan(100); // Reasonable range
  });

  it('returns 0 for single price', () => {
    expect(calculateVolatility([100])).toBe(0);
  });

  it('returns 0 for empty array', () => {
    expect(calculateVolatility([])).toBe(0);
  });

  it('handles constant prices (zero volatility)', () => {
    const prices = [100, 100, 100, 100, 100];
    expect(calculateVolatility(prices)).toBe(0);
  });
});

describe('calculateMaxDrawdown', () => {
  it('calculates maximum drawdown correctly', () => {
    // Peak at 150, drops to 100 = 33.33% drawdown
    const prices = [100, 120, 150, 130, 100, 110, 120];
    expect(calculateMaxDrawdown(prices)).toBeCloseTo(-33.33, 1);
  });

  it('returns 0 for no drawdown (uptrend)', () => {
    const prices = [100, 110, 120, 130, 140];
    expect(calculateMaxDrawdown(prices)).toBe(0);
  });

  it('returns 0 for single price', () => {
    expect(calculateMaxDrawdown([100])).toBe(0);
  });

  it('handles empty array', () => {
    expect(calculateMaxDrawdown([])).toBe(0);
  });
});

describe('calculateSMA', () => {
  it('calculates simple moving average', () => {
    const prices = [10, 20, 30, 40, 50];
    const sma = calculateSMA(prices, 3);
    expect(sma[0]).toBeNull();
    expect(sma[1]).toBeNull();
    expect(sma[2]).toBe(20); // (10+20+30)/3
    expect(sma[3]).toBe(30); // (20+30+40)/3
    expect(sma[4]).toBe(40); // (30+40+50)/3
  });

  it('returns empty array if period > length', () => {
    const prices = [10, 20, 30];
    expect(calculateSMA(prices, 5)).toEqual([]);
  });
});

describe('calculateEMA', () => {
  it('calculates exponential moving average', () => {
    const prices = [10, 20, 30, 40, 50];
    const ema = calculateEMA(prices, 3);
    expect(ema[0]).toBe(10); // Starts with first price
    expect(ema.length).toBe(prices.length);
    // EMA should be more responsive than SMA
  });

  it('handles empty array', () => {
    expect(calculateEMA([], 3)).toEqual([]);
  });
});

describe('calculateXIRR', () => {
  it('calculates XIRR for SIP-like cashflows', () => {
    // Invest ₹10,000 monthly for 12 months, final value ₹1,30,000
    const startDate = new Date('2023-01-01');
    const cashflows = [];
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      cashflows.push({ date, amount: -10000 }); // Negative = outflow
    }
    
    // Final value
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 12);
    cashflows.push({ date: endDate, amount: 130000 }); // Positive = inflow
    
    const xirr = calculateXIRR(cashflows);
    expect(xirr).not.toBeNull();
    expect(xirr!).toBeGreaterThan(0);
    expect(xirr!).toBeLessThan(100); // Reasonable range
  });

  it('returns null for insufficient cashflows', () => {
    const cashflows = [{ date: new Date(), amount: -10000 }];
    expect(calculateXIRR(cashflows)).toBeNull();
  });

  it('handles simple investment', () => {
    const cashflows = [
      { date: new Date('2020-01-01'), amount: -100000 },
      { date: new Date('2025-01-01'), amount: 200000 },
    ];
    const xirr = calculateXIRR(cashflows);
    expect(xirr).not.toBeNull();
    expect(xirr!).toBeCloseTo(14.87, 0); // ~15% over 5 years
  });
});

describe('calculateTotalReturn', () => {
  it('calculates total return', () => {
    expect(calculateTotalReturn(100, 150)).toBe(50);
    expect(calculateTotalReturn(100, 80)).toBe(-20);
    expect(calculateTotalReturn(100, 100)).toBe(0);
  });

  it('handles zero start value', () => {
    expect(calculateTotalReturn(0, 100)).toBe(0);
  });
});

describe('calculateSharpeRatio', () => {
  it('calculates Sharpe ratio', () => {
    const returns = [1, 2, -1, 3, 2, -0.5, 1.5, 2, 0, 1];
    const sharpe = calculateSharpeRatio(returns, 6, 252);
    expect(sharpe).toBeGreaterThan(0); // Positive excess return
  });

  it('returns 0 for insufficient data', () => {
    expect(calculateSharpeRatio([1])).toBe(0);
  });
});

describe('calculateBeta', () => {
  it('calculates beta relative to benchmark', () => {
    const assetReturns = [2, 3, -1, 4, 2, 1];
    const benchmarkReturns = [1, 2, -0.5, 3, 1, 0.5];
    const beta = calculateBeta(assetReturns, benchmarkReturns);
    expect(beta).toBeGreaterThan(0);
    expect(beta).toBeCloseTo(1, 0); // Similar to benchmark
  });

  it('returns 0 for mismatched lengths', () => {
    const assetReturns = [1, 2, 3];
    const benchmarkReturns = [1, 2];
    expect(calculateBeta(assetReturns, benchmarkReturns)).toBe(0);
  });
});
