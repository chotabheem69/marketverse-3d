// Mutual Fund API provider using mfapi.in
// Free API for Indian mutual fund NAV data

import type { NavPoint } from '../types';

const MF_API_BASE = 'https://api.mfapi.in/mf';

interface MFAPIResponse {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
    isin_growth: string;
    isin_div_reinvestment: string;
  };
  data: Array<{
    date: string;
    nav: string;
  }>;
}

/**
 * Fetch NAV history for a mutual fund
 * @param schemeCode - MF API scheme code
 * @param useDemo - Whether to use demo data
 * @returns Array of NAV points
 */
export async function fetchNavHistory(
  schemeCode: string,
  useDemo: boolean = false
): Promise<{ navHistory: NavPoint[]; status: { isLive: boolean; isDemo: boolean; source: string; lastUpdated: number } }> {
  if (useDemo) {
    return getDemoNavHistory(schemeCode);
  }

  try {
    const response = await fetch(`${MF_API_BASE}/${schemeCode}`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: MFAPIResponse = await response.json();

    const navHistory: NavPoint[] = data.data
      .map(item => ({
        date: item.date, // Format: DD-MM-YYYY
        nav: parseFloat(item.nav),
      }))
      .reverse(); // Oldest first

    return {
      navHistory,
      status: {
        isLive: false, // NAV is end-of-day
        isDemo: false,
        source: 'mfapi.in',
        lastUpdated: Date.now(),
      },
    };
  } catch (error) {
    console.warn(`Failed to fetch NAV history for scheme ${schemeCode}, using demo data:`, error);
    return getDemoNavHistory(schemeCode);
  }
}

/**
 * Get latest NAV for a fund
 */
export async function fetchLatestNav(
  schemeCode: string,
  useDemo: boolean = false
): Promise<{ nav: number; date: string; status: { isLive: boolean; isDemo: boolean; source: string; lastUpdated: number } }> {
  if (useDemo) {
    const demo = getDemoNavHistory(schemeCode);
    const latest = demo.navHistory[demo.navHistory.length - 1];
    return {
      nav: latest.nav,
      date: latest.date,
      status: demo.status,
    };
  }

  try {
    const response = await fetch(`${MF_API_BASE}/${schemeCode}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: MFAPIResponse = await response.json();
    const latest = data.data[0]; // Most recent first

    return {
      nav: parseFloat(latest.nav),
      date: latest.date,
      status: {
        isLive: false,
        isDemo: false,
        source: 'mfapi.in',
        lastUpdated: Date.now(),
      },
    };
  } catch (error) {
    console.warn(`Failed to fetch latest NAV for scheme ${schemeCode}, using demo data:`, error);
    const demo = getDemoNavHistory(schemeCode);
    const latest = demo.navHistory[demo.navHistory.length - 1];
    return {
      nav: latest.nav,
      date: latest.date,
      status: demo.status,
    };
  }
}

/**
 * Search mutual funds by name
 */
export async function searchFunds(
  query: string,
  useDemo: boolean = false
): Promise<Array<{ schemeCode: string; schemeName: string; isinGrowth: string; isinDividend: string }>> {
  if (useDemo) {
    return getDemoSearchResults(query);
  }

  try {
    const response = await fetch(`${MF_API_BASE}?scheme_name=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    return data.map((item: any) => ({
      schemeCode: item.schemeCode,
      schemeName: item.schemeName,
      isinGrowth: item.ISINDividendPayOut || '',
      isinDividend: item.ISINGrowth || '',
    }));
  } catch (error) {
    console.warn('Failed to search funds:', error);
    return getDemoSearchResults(query);
  }
}

// Demo data generation
function getDemoNavHistory(schemeCode: string): { navHistory: NavPoint[]; status: { isLive: boolean; isDemo: boolean; source: string; lastUpdated: number } } {
  const baseNav = getBaseNavForScheme(schemeCode);
  const numDays = 365 * 5; // 5 years of data
  const navHistory: NavPoint[] = [];
  
  let nav = baseNav * 0.4; // Start at 40% of current for growth demo
  const now = new Date();
  
  for (let i = numDays; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const dailyChange = (Math.random() - 0.4) * 0.01; // Slight upward bias
    nav = nav * (1 + dailyChange);
    
    navHistory.push({
      date: formatDate(date),
      nav: Math.round(nav * 100) / 100,
    });
  }

  return {
    navHistory,
    status: {
      isLive: false,
      isDemo: true,
      source: 'Demo Data',
      lastUpdated: Date.now(),
    },
  };
}

function getDemoSearchResults(query: string): Array<{ schemeCode: string; schemeName: string; isinGrowth: string; isinDividend: string }> {
  const demoFunds = [
    { schemeCode: '119551', schemeName: 'UTI Nifty 50 Index Fund', isinGrowth: 'INF789FB1X58', isinDividend: '' },
    { schemeCode: '119387', schemeName: 'HDFC Index Fund - Nifty 50 Plan', isinGrowth: 'INF179KA1ZU6', isinDividend: '' },
    { schemeCode: '120283', schemeName: 'Axis Bluechip Fund', isinGrowth: 'INF846K01EW2', isinDividend: '' },
    { schemeCode: '118936', schemeName: 'Parag Parikh Flexi Cap Fund', isinGrowth: 'INF879O01018', isinDividend: '' },
  ];

  if (!query) return demoFunds;
  
  const lowerQuery = query.toLowerCase();
  return demoFunds.filter(f => f.schemeName.toLowerCase().includes(lowerQuery));
}

function getBaseNavForScheme(schemeCode: string): number {
  const navs: Record<string, number> = {
    '119551': 85.50,
    '119387': 142.30,
    '120283': 62.45,
    '118936': 78.90,
    '120503': 95.20,
    '119553': 112.80,
    '119554': 68.40,
    '120504': 82.15,
    '119555': 125.60,
    '120505': 58.75,
  };
  return navs[schemeCode] || 50;
}

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Convert NAV date string to Date object
 */
export function parseNavDate(dateStr: string): Date {
  // Format: DD-MM-YYYY
  const [dd, mm, yyyy] = dateStr.split('-').map(Number);
  return new Date(yyyy, mm - 1, dd);
}
