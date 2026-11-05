// Formatters for numbers, currency, and market data

export const formatIndianNumber = (num: number): string => {
  if (num === undefined || num === null || isNaN(num)) return '—';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  // Indian number system
  if (absNum >= 1e7) {
    return sign + (absNum / 1e7).toFixed(2) + ' Cr';
  } else if (absNum >= 1e5) {
    return sign + (absNum / 1e5).toFixed(2) + ' L';
  } else if (absNum >= 1e3) {
    return sign + absNum.toLocaleString('en-IN');
  }
  
  return sign + absNum.toFixed(2);
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  if (num === undefined || num === null || isNaN(num)) return '—';
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
};

export const formatCurrency = (
  amount: number, 
  currency: 'INR' | 'USD' = 'INR',
  useIndianSystem: boolean = true
): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return '—';
  
  if (currency === 'INR') {
    const symbol = '₹';
    if (useIndianSystem) {
      return symbol + formatIndianNumber(amount);
    }
    return symbol + formatNumber(amount);
  } else {
    return '$' + formatNumber(amount);
  }
};

export const formatPercent = (percent: number, decimals: number = 2): string => {
  if (percent === undefined || percent === null || isNaN(percent)) return '—';
  const sign = percent > 0 ? '+' : '';
  return sign + percent.toFixed(decimals) + '%';
};

export const formatVolume = (volume: number): string => {
  if (volume === undefined || volume === null || isNaN(volume)) return '—';
  
  const absVol = Math.abs(volume);
  const sign = volume < 0 ? '-' : '';
  
  if (absVol >= 1e7) {
    return sign + (absVol / 1e7).toFixed(2) + ' Cr';
  } else if (absVol >= 1e5) {
    return sign + (absVol / 1e5).toFixed(2) + ' L';
  } else if (absVol >= 1e3) {
    return sign + (absVol / 1e3).toFixed(1) + 'K';
  }
  
  return sign + absVol.toFixed(0);
};

export const formatMarketCap = (marketCap: number, currency: 'INR' | 'USD' = 'INR'): string => {
  if (marketCap === undefined || marketCap === null || isNaN(marketCap)) return '—';
  
  if (currency === 'INR') {
    // Convert to lakhs/crores
    if (marketCap >= 1e12) {
      return '₹' + (marketCap / 1e12).toFixed(2) + ' L Cr';
    } else if (marketCap >= 1e9) {
      return '₹' + (marketCap / 1e9).toFixed(2) + ' Cr';
    } else if (marketCap >= 1e7) {
      return '₹' + (marketCap / 1e7).toFixed(2) + ' L';
    }
    return '₹' + formatNumber(marketCap);
  } else {
    // USD - use billions/millions
    if (marketCap >= 1e12) {
      return '$' + (marketCap / 1e12).toFixed(2) + 'T';
    } else if (marketCap >= 1e9) {
      return '$' + (marketCap / 1e9).toFixed(2) + 'B';
    } else if (marketCap >= 1e6) {
      return '$' + (marketCap / 1e6).toFixed(2) + 'M';
    }
    return '$' + formatNumber(marketCap);
  }
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatISTTime = (): string => {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
};
