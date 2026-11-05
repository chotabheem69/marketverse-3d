// Market hours utilities

export interface MarketHours {
  open: string;   // HH:MM in local time
  close: string;  // HH:MM in local time
  timezone: string;
  days: number[]; // 0 = Sunday, 6 = Saturday
}

export const MARKET_HOURS: Record<string, MarketHours> = {
  NSE: {
    open: '09:15',
    close: '15:30',
    timezone: 'Asia/Kolkata',
    days: [1, 2, 3, 4, 5], // Mon-Fri
  },
  BSE: {
    open: '09:15',
    close: '15:30',
    timezone: 'Asia/Kolkata',
    days: [1, 2, 3, 4, 5],
  },
  NYSE: {
    open: '09:30',
    close: '16:00',
    timezone: 'America/New_York',
    days: [1, 2, 3, 4, 5],
  },
  NASDAQ: {
    open: '09:30',
    close: '16:00',
    timezone: 'America/New_York',
    days: [1, 2, 3, 4, 5],
  },
  LSE: {
    open: '08:00',
    close: '16:30',
    timezone: 'Europe/London',
    days: [1, 2, 3, 4, 5],
  },
  TSE: {
    open: '09:00',
    close: '15:00',
    timezone: 'Asia/Tokyo',
    days: [1, 2, 3, 4, 5],
  },
};

export type MarketStatus = 'open' | 'closed' | 'pre-open' | 'pre-close';

export function getMarketStatus(market: string): {
  status: MarketStatus;
  message: string;
  timeToChange: number; // seconds
} {
  const hours = MARKET_HOURS[market];
  if (!hours) {
    return { status: 'closed', message: 'Market hours unknown', timeToChange: 0 };
  }

  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    timeZone: hours.timezone,
    hour: '2-digit',
    minute: '2-digit',
  });

  const currentDay = parseInt(now.toLocaleDateString('en-US', { 
    weekday: 'short',
    timeZone: hours.timezone 
  }).replace(/[^0-9]/g, '')) || new Date().getDay();

  // Check if it's a trading day
  if (!hours.days.includes(currentDay)) {
    return { status: 'closed', message: 'Market closed (weekend)', timeToChange: 0 };
  }

  const [openHour, openMin] = hours.open.split(':').map(Number);
  const [closeHour, closeMin] = hours.close.split(':').map(Number);
  const [currentHour, currentMin] = currentTime.split(':').map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  const currentMinutes = currentHour * 60 + currentMin;

  // Pre-open: 15 minutes before market opens
  const preOpenStart = openMinutes - 15;
  // Pre-close: 15 minutes before market closes
  const preCloseStart = closeMinutes - 15;

  if (currentMinutes >= preOpenStart && currentMinutes < openMinutes) {
    const minsToOpen = openMinutes - currentMinutes;
    return {
      status: 'pre-open',
      message: `Pre-open (${minsToOpen}m to open)`,
      timeToChange: minsToOpen * 60,
    };
  }

  if (currentMinutes >= openMinutes && currentMinutes < preCloseStart) {
    const minsToClose = closeMinutes - currentMinutes;
    return {
      status: 'open',
      message: `Market open (${minsToClose}m to close)`,
      timeToChange: minsToClose * 60,
    };
  }

  if (currentMinutes >= preCloseStart && currentMinutes < closeMinutes) {
    const minsToClose = closeMinutes - currentMinutes;
    return {
      status: 'pre-close',
      message: `Closing soon (${minsToClose}m)`,
      timeToChange: minsToClose * 60,
    };
  }

  return { status: 'closed', message: 'Market closed', timeToChange: 0 };
}

export function getISTTime(): string {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

export function getNextMarketOpen(market: string): Date | null {
  const hours = MARKET_HOURS[market];
  if (!hours) return null;

  const now = new Date();
  const { status } = getMarketStatus(market);

  if (status === 'open' || status === 'pre-open') {
    return null; // Already open
  }

  // Find next opening time
  const [openHour, openMin] = hours.open.split(':').map(Number);
  const nextOpen = new Date(now);
  nextOpen.setHours(openHour, openMin, 0, 0);

  if (nextOpen <= now) {
    // Move to next trading day
    nextOpen.setDate(nextOpen.getDate() + 1);
    while (!hours.days.includes(nextOpen.getDay())) {
      nextOpen.setDate(nextOpen.getDate() + 1);
    }
  }

  return nextOpen;
}
