// Finance utility functions for calculations

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 * @param startValue - Initial investment value
 * @param endValue - Final value
 * @param years - Number of years
 * @returns CAGR as a percentage
 */
export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || endValue <= 0 || years <= 0) {
    return 0;
  }
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

/**
 * Calculate annualized volatility from returns
 * @param prices - Array of price points
 * @param periodsPerYear - Number of periods per year (252 for daily, 52 for weekly, 12 for monthly)
 * @returns Annualized volatility as a percentage
 */
export function calculateVolatility(prices: number[], periodsPerYear: number = 252): number {
  if (prices.length < 2) {
    return 0;
  }

  // Calculate returns
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] !== 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }

  if (returns.length === 0) {
    return 0;
  }

  // Calculate mean return
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Calculate variance
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;

  // Standard deviation (volatility)
  const stdDev = Math.sqrt(variance);

  // Annualize
  return stdDev * Math.sqrt(periodsPerYear) * 100;
}

/**
 * Calculate maximum drawdown from peak
 * @param prices - Array of price points
 * @returns Maximum drawdown as a negative percentage
 */
export function calculateMaxDrawdown(prices: number[]): number {
  if (prices.length < 2) {
    return 0;
  }

  let peak = prices[0];
  let maxDrawdown = 0;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
    }
    const drawdown = (prices[i] - peak) / peak;
    if (drawdown < maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown * 100;
}

/**
 * Calculate Simple Moving Average
 * @param prices - Array of price points
 * @param period - Number of periods for the average
 * @returns Array of SMA values (null for first period-1 values)
 */
export function calculateSMA(prices: number[], period: number): (number | null)[] {
  if (prices.length < period) {
    return [];
  }

  const sma: (number | null)[] = [];
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((s, p) => s + p, 0);
      sma.push(sum / period);
    }
  }

  return sma;
}

/**
 * Calculate Exponential Moving Average
 * @param prices - Array of price points
 * @param period - Number of periods for the average
 * @returns Array of EMA values
 */
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) {
    return [];
  }

  const multiplier = 2 / (period + 1);
  const ema: number[] = [prices[0]]; // Start with first price

  for (let i = 1; i < prices.length; i++) {
    ema.push((prices[i] - ema[i - 1]) * multiplier + ema[i - 1]);
  }

  return ema;
}

/**
 * Calculate XIRR (Extended Internal Rate of Return)
 * Uses Newton-Raphson method to find the rate that makes NPV = 0
 * @param cashflows - Array of {date, amount} objects
 * @param guess - Initial guess for the rate (default 0.1 = 10%)
 * @returns XIRR as a percentage, or null if calculation fails
 */
export function calculateXIRR(
  cashflows: { date: Date; amount: number }[],
  guess: number = 0.1
): number | null {
  if (cashflows.length < 2) {
    return null;
  }

  // Sort by date
  const sorted = [...cashflows].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Days from first cashflow
  const startDate = sorted[0].date;
  const days = sorted.map(cf => 
    (cf.date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Newton-Raphson iteration
  let rate = guess;
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let j = 0; j < sorted.length; j++) {
      const years = days[j] / 365;
      const discount = Math.pow(1 + rate, years);
      
      if (discount === 0) {
        return null; // Avoid division by zero
      }

      npv += sorted[j].amount / discount;
      dnpv -= (years * sorted[j].amount) / Math.pow(1 + rate, years + 1);
    }

    if (Math.abs(npv) < tolerance) {
      return rate * 100; // Return as percentage
    }

    if (dnpv === 0) {
      return null; // Derivative is zero, can't continue
    }

    rate = rate - npv / dnpv;

    // Prevent rate from going too negative
    if (rate < -0.99) {
      rate = -0.99;
    }
  }

  return null; // Did not converge
}

/**
 * Calculate total return
 * @param startValue - Initial value
 * @param endValue - Final value
 * @returns Total return as a percentage
 */
export function calculateTotalReturn(startValue: number, endValue: number): number {
  if (startValue === 0) {
    return 0;
  }
  return ((endValue - startValue) / startValue) * 100;
}

/**
 * Calculate Sharpe Ratio
 * @param returns - Array of returns
 * @param riskFreeRate - Annual risk-free rate (as percentage)
 * @param periodsPerYear - Number of periods per year
 * @returns Sharpe ratio
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate: number = 6, // Default 6% for India
  periodsPerYear: number = 252
): number {
  if (returns.length < 2) {
    return 0;
  }

  // Convert annual risk-free rate to period rate
  const periodRiskFreeRate = Math.pow(1 + riskFreeRate / 100, 1 / periodsPerYear) - 1;

  // Calculate excess returns
  const excessReturns = returns.map(r => r / 100 - periodRiskFreeRate);

  // Mean excess return
  const meanExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;

  // Standard deviation of excess returns
  const variance = excessReturns.reduce((sum, r) => sum + Math.pow(r - meanExcessReturn, 2), 0) / excessReturns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return 0;
  }

  // Annualize Sharpe ratio
  return (meanExcessReturn / stdDev) * Math.sqrt(periodsPerYear);
}

/**
 * Calculate beta relative to a benchmark
 * @param assetReturns - Array of asset returns
 * @param benchmarkReturns - Array of benchmark returns (same length)
 * @returns Beta coefficient
 */
export function calculateBeta(assetReturns: number[], benchmarkReturns: number[]): number {
  if (assetReturns.length !== benchmarkReturns.length || assetReturns.length < 2) {
    return 0;
  }

  const n = assetReturns.length;
  
  // Calculate means
  const assetMean = assetReturns.reduce((sum, r) => sum + r, 0) / n;
  const benchmarkMean = benchmarkReturns.reduce((sum, r) => sum + r, 0) / n;

  // Calculate covariance and variance
  let covariance = 0;
  let benchmarkVariance = 0;

  for (let i = 0; i < n; i++) {
    const assetDiff = assetReturns[i] - assetMean;
    const benchmarkDiff = benchmarkReturns[i] - benchmarkMean;
    covariance += assetDiff * benchmarkDiff;
    benchmarkVariance += benchmarkDiff * benchmarkDiff;
  }

  covariance /= n;
  benchmarkVariance /= n;

  if (benchmarkVariance === 0) {
    return 0;
  }

  return covariance / benchmarkVariance;
}
