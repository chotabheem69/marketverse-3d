# MarketVerse 3D 🌆

**Explore Indian stocks, mutual funds, crypto, and global markets as explorable 3D worlds.**

A production-quality 3D market data visualization platform built with React Three Fiber, designed as a portfolio-grade project for internships.

![MarketVerse 3D](https://img.shields.io/badge/3D-Market%20Data-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Tests](https://img.shields.io/badge/Tests-46%20passing-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

> **Built by Murali Kamalnath Mannem** — B.Tech CSE (AI & ML) student, Bengaluru, India

---

## 🏙️ The 6 Worlds

| # | World | Description |
|---|-------|-------------|
| 1 | **India Equity City** | Nifty 50 stocks as 3D towers grouped by sector. Tower height = market cap, color = % change. |
| 2 | **Terrain Mode** | Price history as flyable 3D terrain/ridge with SMA overlays. |
| 3 | **Mutual Fund Galaxy** | Funds as glowing orbs in 3D space with SIP simulator. |
| 4 | **Crypto Reactor** | Top 20 coins as pulsing pillars around a BTC dominance core. |
| 5 | **Global Earth** | 3D globe with exchange pins, day/night glow, world clock. |
| 6 | **Watchlist Skyline** | Personal 3D skyline of saved instruments. |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A modern browser with WebGL2 support

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/marketverse-3d.git
cd marketverse-3d

# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`.

### Deploy the Worker (for live data)

The Cloudflare Worker proxy is required for live market data (Yahoo Finance blocks CORS).

```bash
cd worker
npm install
npx wrangler login    # Authenticate with Cloudflare
npx wrangler deploy   # Deploy the worker
```

Update `VITE_WORKER_URL` in your `.env` with the deployed worker URL.

> Without the worker, the app gracefully falls back to demo data for all views.

## 🏗️ Architecture

```
marketverse-3d/
├── src/
│   ├── components/
│   │   ├── scene/          # 3D world components (R3F)
│   │   │   ├── IndiaEquityCity.tsx   # Nifty 50 towers
│   │   │   ├── TerrainMode.tsx       # Price terrain
│   │   │   ├── MFGalaxy.tsx          # Fund orbs
│   │   │   ├── CryptoReactor.tsx     # Crypto pillars
│   │   │   ├── GlobalEarth.tsx       # Globe with pins
│   │   │   └── WatchlistSkyline.tsx  # Personal towers
│   │   ├── ui/             # 2D UI overlays
│   │   │   ├── Header.tsx
│   │   │   ├── WorldNavigation.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── TableView.tsx
│   │   │   ├── Disclaimer.tsx
│   │   │   └── LoadingScreen.tsx
│   │   └── panels/
│   │       └── DetailPanel.tsx       # TradingView chart + stats
│   ├── data/
│   │   ├── providers/      # Data source adapters
│   │   │   ├── yahooFinance.ts  # Indian stocks/indices/US via worker
│   │   │   ├── mfapi.ts        # Indian mutual funds (mfapi.in)
│   │   │   └── coingecko.ts    # Crypto (CoinGecko)
│   │   ├── hooks.ts        # React Query hooks with caching
│   │   └── types.ts        # Normalized data types
│   ├── config/
│   │   └── universe.ts     # Instrument lists (easy to edit)
│   ├── store/
│   │   └── appStore.ts     # Zustand global state
│   ├── hooks/              # Custom hooks
│   │   ├── useStockColor.ts
│   │   ├── useURLHashState.ts
│   │   ├── usePerformanceConfig.ts
│   │   └── useCinematicTour.ts
│   └── utils/
│       ├── formatters.ts   # Indian number formatting (lakh/crore)
│       ├── finance.ts      # CAGR, XIRR, volatility, etc.
│       └── market-hours.ts # NSE/NYSE market status
├── worker/                 # Cloudflare Worker proxy
├── public/demo-data/       # Offline fallback JSON
└── tests/                  # Vitest unit tests
```

### Data Flow
```
User → React Query → Provider Adapter → Worker Proxy → API
                                         ↓ (fallback)
                                    Demo Data JSON
```

Every provider adapter returns normalized types (`Quote`, `Candle[]`, etc.) and falls back to demo data on error. The UI never knows which source supplied the data.

## 📊 Data Sources

| Source | Coverage | Rate Limit | Cache | Attribution |
|--------|----------|------------|-------|-------------|
| **Yahoo Finance** | Indian stocks, indices, US stocks | Via Worker | 60s (quotes), 1h (candles) | [Yahoo Finance](https://finance.yahoo.com) |
| **mfapi.in** | Indian mutual funds (NAV) | Free, no key | 1h | [mfapi.in](https://www.mfapi.in) |
| **CoinGecko** | Crypto market data | 10-30 req/min | 60s | [CoinGecko](https://www.coingecko.com) |

> **Data may be delayed or inaccurate. Not financial advice.**

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+K` / `Cmd+K` | Open command palette (fuzzy search) |
| `1`–`6` | Switch worlds |
| `T` | Toggle table view (accessible 2D fallback) |
| `Esc` | Close panels |

## 🔧 Configuration

### `src/config/universe.ts`
Edit this file to customize:
- Nifty 50 constituents and sectors
- Popular mutual funds (scheme codes from mfapi.in)
- Top cryptocurrencies (CoinGecko IDs)
- Global indices
- US stocks

### `.env.example`
```
VITE_WORKER_URL=http://localhost:8787  # Deploy Cloudflare Worker first
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests once (CI)
npm run test:run

# Build for production
npm run build
```

**46 unit tests** covering:
- Indian number formatting (lakh/crore)
- Finance utilities (CAGR, volatility, drawdown, XIRR, Sharpe ratio, beta)
- Market hours and status

## 📦 Deployment

### Frontend → GitHub Pages

1. Push code to GitHub
2. Enable GitHub Pages in repo settings (Source: GitHub Actions)
3. The included `.github/workflows/deploy.yml` auto-deploys on push to `main`

### Worker → Cloudflare

```bash
cd worker
npx wrangler deploy
```

Update `VITE_WORKER_URL` in your deployment environment.

## 🛡️ Performance

- **Adaptive quality**: Auto-detects GPU tier, memory, and cores
- **Reduced motion**: Respects `prefers-reduced-motion`
- **Lazy loading**: Each world is code-split
- **Caching**: React Query with stale-time / gc-time config
- **Throttled updates**: WebSocket messages batched at 4/second
- **InstancedMesh**: For repeated geometries
- **DPR capped**: [1, 2] range

## 📱 Accessibility

- **Table View** (`T` key): Full 2D sortable table fallback for every world
- **Keyboard navigation**: All worlds and panels reachable via keyboard
- **ARIA labels**: On interactive 3D elements
- **Screen reader**: Data conveyed in table view
- **Color-blind safe**: Diverging color ramp with shape alternatives

## 🔑 Things to Personalize

| Setting | Location | Notes |
|---------|----------|-------|
| App name | `index.html`, `Header.tsx` | Currently "MarketVerse 3D" |
| Worker URL | `.env` → `VITE_WORKER_URL` | Deploy worker first |
| GitHub repo | `vite.config.ts` → `base` | Change `/marketverse-3d/` to your repo name |
| Stock universe | `src/config/universe.ts` | Add/remove Nifty 50 stocks |
| Mutual funds | `src/config/universe.ts` | Add scheme codes from mfapi.in |
| Crypto coins | `src/config/universe.ts` | Add CoinGecko IDs |
| API keys | Worker secrets only | Never commit keys to frontend |

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

## 🙏 Attributions

- Market data: [Yahoo Finance](https://finance.yahoo.com), [mfapi.in](https://www.mfapi.in), [CoinGecko](https://www.coingecko.com)
- Charts: [lightweight-charts](https://github.com/nicehash/lightweight-charts) by TradingView
- 3D: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber), [drei](https://github.com/pmndrs/drei)
- Icons: Emoji (system fonts)

## ⚠️ Disclaimer

This is an **educational visualization tool only**.

- Data may be delayed or inaccurate
- **Not financial advice** — never make investment decisions based on this tool
- Always do your own research and consult a SEBI-registered advisor
- Past performance does not guarantee future results


---

<p align="center">
  Made with ❤️ in Bengaluru, India
</p>
