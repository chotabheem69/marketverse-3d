import { describe, it, expect } from 'vitest';
import { formatIndianNumber, formatCurrency, formatPercent, formatVolume } from '../src/utils/formatters';

describe('formatIndianNumber', () => {
  it('formats numbers in crores', () => {
    expect(formatIndianNumber(10000000)).toBe('1.00 Cr');
    expect(formatIndianNumber(50000000)).toBe('5.00 Cr');
    expect(formatIndianNumber(1234567890)).toBe('123.46 Cr');
  });

  it('formats numbers in lakhs', () => {
    expect(formatIndianNumber(100000)).toBe('1.00 L');
    expect(formatIndianNumber(500000)).toBe('5.00 L');
    expect(formatIndianNumber(9999999)).toBe('100.00 L'); // Rounds to 100 L
  });

  it('formats numbers in thousands', () => {
    expect(formatIndianNumber(1000)).toBe('1,000');
    expect(formatIndianNumber(99999)).toBe('99,999');
  });

  it('formats small numbers', () => {
    expect(formatIndianNumber(100)).toBe('100.00');
    expect(formatIndianNumber(0)).toBe('0.00');
  });

  it('handles negative numbers', () => {
    expect(formatIndianNumber(-10000000)).toBe('-1.00 Cr');
    expect(formatIndianNumber(-500000)).toBe('-5.00 L');
  });
});

describe('formatCurrency', () => {
  it('formats INR with Indian system', () => {
    expect(formatCurrency(10000000, 'INR', true)).toBe('₹1.00 Cr');
    expect(formatCurrency(500000, 'INR', true)).toBe('₹5.00 L');
  });

  it('formats INR without Indian system', () => {
    expect(formatCurrency(10000000, 'INR', false)).toBe('₹10,000,000.00');
  });

  it('formats USD', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
    expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
  });
});

describe('formatPercent', () => {
  it('formats positive percentages with + sign', () => {
    expect(formatPercent(5.5)).toBe('+5.50%');
    expect(formatPercent(0.123)).toBe('+0.12%');
  });

  it('formats negative percentages', () => {
    expect(formatPercent(-2.5)).toBe('-2.50%');
  });

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });
});

describe('formatVolume', () => {
  it('formats large volumes in crores', () => {
    expect(formatVolume(10000000)).toBe('1.00 Cr');
    expect(formatVolume(50000000)).toBe('5.00 Cr');
  });

  it('formats volumes in lakhs', () => {
    expect(formatVolume(100000)).toBe('1.00 L');
    expect(formatVolume(9999999)).toBe('100.00 L'); // Rounds to 100 L
  });

  it('formats volumes in thousands', () => {
    expect(formatVolume(1000)).toBe('1.0K');
    expect(formatVolume(99999)).toBe('100.0K');
  });
});
