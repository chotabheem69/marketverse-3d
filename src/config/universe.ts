// Universe of instruments to track
// Easy to edit - add/remove symbols here

export interface StockConfig {
  symbol: string;
  name: string;
  sector: string;
}

export interface IndexConfig {
  symbol: string;
  name: string;
  region: string;
}

export interface FundConfig {
  schemeCode: string;
  name: string;
  amc: string;
  category: string;
}

export interface CryptoConfig {
  id: string;       // CoinGecko ID
  symbol: string;
  name: string;
}

// Nifty 50 constituents with sectors
export const NIFTY_50: StockConfig[] = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Energy' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', sector: 'Banking' },
  { symbol: 'INFY.NS', name: 'Infosys', sector: 'IT' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', sector: 'Banking' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', sector: 'FMCG' },
  { symbol: 'ITC.NS', name: 'ITC Limited', sector: 'FMCG' },
  { symbol: 'SBIN.NS', name: 'State Bank of India', sector: 'Banking' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', sector: 'Telecom' },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', sector: 'Banking' },
  { symbol: 'LT.NS', name: 'Larsen & Toubro', sector: 'Construction' },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank', sector: 'Banking' },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints', sector: 'Consumer Goods' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki', sector: 'Auto' },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', sector: 'Pharma' },
  { symbol: 'TITAN.NS', name: 'Titan Company', sector: 'Consumer Goods' },
  { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement', sector: 'Cement' },
  { symbol: 'WIPRO.NS', name: 'Wipro', sector: 'IT' },
  { symbol: 'NESTLEIND.NS', name: 'Nestle India', sector: 'FMCG' },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', sector: 'Financial Services' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', sector: 'Auto' },
  { symbol: 'DRREDDY.NS', name: "Dr. Reddy's Laboratories", sector: 'Pharma' },
  { symbol: 'CIPLA.NS', name: 'Cipla', sector: 'Pharma' },
  { symbol: 'JSWSTEEL.NS', name: 'JSW Steel', sector: 'Metals' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel', sector: 'Metals' },
  { symbol: 'POWERGRID.NS', name: 'Power Grid Corporation', sector: 'Power' },
  { symbol: 'NTPC.NS', name: 'NTPC', sector: 'Power' },
  { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corp', sector: 'Energy' },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises', sector: 'Conglomerate' },
  { symbol: 'ADANIPORTS.NS', name: 'Adani Ports', sector: 'Infrastructure' },
  { symbol: 'COALINDIA.NS', name: 'Coal India', sector: 'Mining' },
  { symbol: 'HCLTECH.NS', name: 'HCL Technologies', sector: 'IT' },
  { symbol: 'TECHM.NS', name: 'Tech Mahindra', sector: 'IT' },
  { symbol: 'M&M.NS', name: 'Mahindra & Mahindra', sector: 'Auto' },
  { symbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv', sector: 'Financial Services' },
  { symbol: 'DIVISLAB.NS', name: "Divi's Laboratories", sector: 'Pharma' },
  { symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals', sector: 'Healthcare' },
  { symbol: 'TATACONSUM.NS', name: 'Tata Consumer Products', sector: 'FMCG' },
  { symbol: 'GRASIM.NS', name: 'Grasim Industries', sector: 'Cement' },
  { symbol: 'BPCL.NS', name: 'Bharat Petroleum', sector: 'Energy' },
  { symbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp', sector: 'Auto' },
  { symbol: 'EICHERMOT.NS', name: 'Eicher Motors', sector: 'Auto' },
  { symbol: 'INDUSINDBK.NS', name: 'IndusInd Bank', sector: 'Banking' },
  { symbol: 'HINDALCO.NS', name: 'Hindalco Industries', sector: 'Metals' },
  { symbol: 'BRITANNIA.NS', name: 'Britannia Industries', sector: 'FMCG' },
  { symbol: 'SBILIFE.NS', name: 'SBI Life Insurance', sector: 'Insurance' },
  { symbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance', sector: 'Insurance' },
  { symbol: 'DABUR.NS', name: 'Dabur India', sector: 'FMCG' },
  { symbol: 'VEDL.NS', name: 'Vedanta', sector: 'Metals' },
  { symbol: 'WIPRO.NS', name: 'Wipro', sector: 'IT' },
];

// Major Indian indices
export const INDIA_INDICES: IndexConfig[] = [
  { symbol: '^NSEI', name: 'Nifty 50', region: 'IN' },
  { symbol: '^BSESN', name: 'Sensex', region: 'IN' },
  { symbol: '^NSEBANK', name: 'Bank Nifty', region: 'IN' },
  { symbol: '^INDIAVIX', name: 'India VIX', region: 'IN' },
];

// Global indices
export const GLOBAL_INDICES: IndexConfig[] = [
  { symbol: '^GSPC', name: 'S&P 500', region: 'US' },
  { symbol: '^IXIC', name: 'NASDAQ', region: 'US' },
  { symbol: '^DJI', name: 'Dow Jones', region: 'US' },
  { symbol: '^N225', name: 'Nikkei 225', region: 'JP' },
  { symbol: '^FTSE', name: 'FTSE 100', region: 'UK' },
  { symbol: '^GDAXI', name: 'DAX', region: 'DE' },
  { symbol: '^HSI', name: 'Hang Seng', region: 'HK' },
  { symbol: '^STOXX50E', name: 'Euro Stoxx 50', region: 'EU' },
  { symbol: '^BVSP', name: 'Bovespa', region: 'BR' },
];

// Popular mutual funds (scheme codes from mfapi.in)
export const POPULAR_FUNDS: FundConfig[] = [
  { schemeCode: '119551', name: 'UTI Nifty 50 Index Fund', amc: 'UTI', category: 'large-cap' },
  { schemeCode: '119387', name: 'HDFC Index Fund - Nifty 50', amc: 'HDFC', category: 'large-cap' },
  { schemeCode: '120283', name: 'Axis Bluechip Fund', amc: 'Axis', category: 'large-cap' },
  { schemeCode: '118936', name: 'Parag Parikh Flexi Cap Fund', amc: 'PPFAS', category: 'flexi-cap' },
  { schemeCode: '120503', name: 'Mirae Asset Emerging Bluechip', amc: 'Mirae', category: 'mid-cap' },
  { schemeCode: '119553', name: 'SBI Small Cap Fund', amc: 'SBI', category: 'small-cap' },
  { schemeCode: '119554', name: 'Axis ELSS Tax Saver', amc: 'Axis', category: 'elss' },
  { schemeCode: '120504', name: 'Mirae Asset Tax Saver Fund', amc: 'Mirae', category: 'elss' },
  { schemeCode: '119555', name: 'HDFC Mid-Cap Opportunities', amc: 'HDFC', category: 'mid-cap' },
  { schemeCode: '120505', name: 'ICICI Prudential Bluechip Fund', amc: 'ICICI', category: 'large-cap' },
];

// Top cryptocurrencies (CoinGecko IDs)
export const TOP_CRYPTO: CryptoConfig[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'matic-network', symbol: 'MATIC', name: 'Polygon' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos' },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol' },
  { id: 'algorand', symbol: 'ALGO', name: 'Algorand' },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum' },
];

// Major US stocks
export const US_STOCKS: StockConfig[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'BRK-B', name: 'Berkshire Hathaway', sector: 'Financial' },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financial' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive' },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Defensive' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial' },
  { symbol: 'UNH', name: 'UnitedHealth Group', sector: 'Healthcare' },
  { symbol: 'HD', name: 'Home Depot', sector: 'Consumer Cyclical' },
  { symbol: 'DIS', name: 'Walt Disney Company', sector: 'Communication' },
  { symbol: 'BAC', name: 'Bank of America', sector: 'Financial' },
  { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare' },
];

// Sector colors for visualization
export const SECTOR_COLORS: Record<string, string> = {
  'Banking': '#3b82f6',
  'IT': '#8b5cf6',
  'Energy': '#f59e0b',
  'Auto': '#ef4444',
  'FMCG': '#10b981',
  'Pharma': '#06b6d4',
  'Metals': '#64748b',
  'Power': '#eab308',
  'Telecom': '#ec4899',
  'Construction': '#f97316',
  'Consumer Goods': '#14b8a6',
  'Financial Services': '#6366f1',
  'Infrastructure': '#84cc16',
  'Mining': '#78716c',
  'Healthcare': '#22d3ee',
  'Insurance': '#a78bfa',
  'Cement': '#94a3b8',
  'Conglomerate': '#f472b6',
  'Technology': '#3b82f6',
  'Consumer Cyclical': '#f59e0b',
  'Financial': '#6366f1',
  'Consumer Defensive': '#10b981',
  'Communication': '#ec4899',
};
