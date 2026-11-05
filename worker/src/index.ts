/**
 * Cloudflare Worker proxy for MarketVerse 3D
 * 
 * This worker:
 * - Proxies requests to allow-listed API hosts (Yahoo Finance, etc.)
 * - Adds CORS headers for browser requests
 * - Implements rate limiting per IP
 * - Caches responses to reduce API calls
 * - Never exposes API keys in the frontend
 * 
 * Deploy: cd worker && npx wrangler deploy
 */

interface Env {
  ALLOWED_HOSTS: string;
  RATE_LIMIT: string;
}

const ALLOWED_HOSTS_DEFAULT = [
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Max-Age': '86400',
};

// Simple in-memory rate limiting (per-worker instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Route: /yahoo/chart?symbol=X&interval=Y&range=Z
    if (path === '/yahoo/chart') {
      return handleYahooChart(request, env);
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  },
};

async function handleYahooChart(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol');
  const interval = url.searchParams.get('interval') || '1d';
  const range = url.searchParams.get('range') || '1mo';

  if (!symbol) {
    return new Response(JSON.stringify({ error: 'Missing symbol parameter' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Rate limiting check
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!checkRateLimit(ip, parseInt(env.RATE_LIMIT || '60'))) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  // Build Yahoo Finance URL
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;

  // Check cache first (using Cache API)
  const cache = caches.default;
  const cacheKey = new Request(yahooUrl, { method: 'GET' });
  const cachedResponse = await cache.match(cacheKey);

  if (cachedResponse) {
    return new Response(cachedResponse.body, {
      ...cachedResponse,
      headers: {
        ...Object.fromEntries(cachedResponse.headers),
        ...CORS_HEADERS,
        'X-Cache': 'HIT',
      },
    });
  }

  // Fetch from Yahoo Finance
  try {
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Upstream error: ${response.status}` }), {
        status: response.status,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();

    // Create response with caching
    const responseBody = JSON.stringify(data);
    const cacheTime = interval === '1m' ? 60 : (interval === '1d' ? 300 : 3600); // seconds

    const finalResponse = new Response(responseBody, {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${cacheTime}`,
        'X-Cache': 'MISS',
      },
    });

    // Store in cache
    const cacheResponse = new Response(responseBody, {
      headers: {
        'Cache-Control': `public, max-age=${cacheTime}`,
      },
    });
    await cache.put(cacheKey, cacheResponse);

    return finalResponse;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from Yahoo Finance' }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

function checkRateLimit(ip: string, limit: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }); // Reset after 1 minute
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}
