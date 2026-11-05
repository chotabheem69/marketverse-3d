// Color scales and visualization utilities

import { scaleLinear, scaleLog, scaleOrdinal } from 'd3-scale';

/**
 * Color-blind-safe diverging color scale for price changes
 * Uses blue for negative, white for neutral, green for positive
 */
export function getChangeColor(changePercent: number): string {
  const scale = scaleLinear<string>()
    .domain([-3, 0, 3])
    .range(['#2563eb', '#94a3b8', '#10b981'])
    .clamp(true);
  
  return scale(changePercent);
}

/**
 * High-contrast color-blind-safe alternative palette
 */
export function getChangeColorAlt(changePercent: number): string {
  const scale = scaleLinear<string>()
    .domain([-5, 0, 5])
    .range(['#d55e00', '#cccccc', '#0072b2'])
    .clamp(true);
  
  return scale(changePercent);
}

/**
 * Scale for tower heights based on market cap
 * Uses log scale to handle wide range of values
 */
export function getTowerHeight(marketCap: number, min: number = 2, max: number = 20): number {
  if (marketCap <= 0) return min;
  
  // Market caps in INR: range from ~10,000 Cr to ~20,00,000 Cr
  const scale = scaleLog()
    .domain([1e11, 2e13]) // 10,000 Cr to 2,00,000 Cr
    .range([min, max])
    .clamp(true);
  
  return scale(marketCap);
}

/**
 * Scale for tower heights based on % change (absolute)
 */
export function getChangeHeight(changePercent: number, min: number = 1, max: number = 15): number {
  const scale = scaleLinear()
    .domain([0, 5])
    .range([min, max])
    .clamp(true);
  
  return scale(Math.abs(changePercent));
}

/**
 * Scale for tower heights based on volume
 */
export function getVolumeHeight(volume: number, min: number = 1, max: number = 15): number {
  if (volume <= 0) return min;
  
  const scale = scaleLog()
    .domain([1e5, 1e8])
    .range([min, max])
    .clamp(true);
  
  return scale(volume);
}

/**
 * Get sector color from ordinal scale
 */
export const SECTOR_SCALE = scaleOrdinal<string>()
  .domain([
    'Banking', 'IT', 'Energy', 'Auto', 'FMCG', 'Pharma', 
    'Metals', 'Power', 'Telecom', 'Construction', 'Consumer Goods',
    'Financial Services', 'Infrastructure', 'Mining', 'Healthcare',
    'Insurance', 'Cement', 'Conglomerate'
  ])
  .range([
    '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#06b6d4',
    '#64748b', '#eab308', '#ec4899', '#f97316', '#14b8a6',
    '#6366f1', '#84cc16', '#78716c', '#22d3ee',
    '#a78bfa', '#94a3b8', '#f472b6'
  ]);

/**
 * Get color for a sector
 */
export function getSectorColor(sector: string): string {
  return SECTOR_SCALE(sector);
}

/**
 * Generate grid positions for towers in a sector
 */
export function generateGridPositions(
  count: number,
  spacing: number = 2.5,
  offsetX: number = 0,
  offsetZ: number = 0
): Array<[number, number]> {
  const positions: Array<[number, number]> = [];
  const cols = Math.ceil(Math.sqrt(count));
  
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    positions.push([
      offsetX + col * spacing,
      offsetZ + row * spacing
    ]);
  }
  
  return positions;
}
