import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';

// Types
type Holding = { ticker: string; shares: number; buyPrice: number };
type Summary = { totalInvested: number; currentValue: number; totalPL: number };

// In-memory state (seed with some demo data for nicer first-load UX)
let portfolio: Holding[] = [
  { ticker: 'AAPL', shares: 12, buyPrice: 180 },
  { ticker: 'MSFT', shares: 8, buyPrice: 350 },
  { ticker: 'TSLA', shares: 5, buyPrice: 220 },
];
const mockPrices: Record<string, number> = { AAPL: 210, MSFT: 400, TSLA: 250 };

// Ensure a mock price exists for a ticker (so new tickers show non-zero P/L)
function ensureMockPrice(ticker: string, referenceBuy: number) {
  if (mockPrices[ticker] === undefined) {
    // Simple deterministic nudging based on ticker string for variety
    const codeSum = Array.from(ticker).reduce((s, ch) => s + ch.charCodeAt(0), 0);
    const sign = codeSum % 2 === 0 ? 1 : -1;
    const pct = (5 + (codeSum % 6)) / 100; // between 5% and 10%
    const price = referenceBuy * (1 + sign * pct);
    mockPrices[ticker] = Number(price.toFixed(2));
  }
}

// Helpers
function getSummary(): Summary {
  let totalInvested = 0;
  let currentValue = 0;
  for (const h of portfolio) {
    const current = mockPrices[h.ticker] ?? h.buyPrice;
    totalInvested += h.shares * h.buyPrice;
    currentValue += h.shares * current;
  }
  const totalPL = currentValue - totalInvested;
  return { totalInvested, currentValue, totalPL };
}

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

// Routes
// 1) Health
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 2) Get portfolio
app.get('/portfolio', (_req: Request, res: Response) => {
  res.json({ holdings: portfolio, prices: mockPrices, summary: getSummary() });
});

// 3) Add/Update holding
app.post('/portfolio', (req: Request, res: Response) => {
  const { ticker, shares, buyPrice } = req.body ?? {};

  const validTicker = typeof ticker === 'string' && ticker.trim().length > 0;
  const validShares = typeof shares === 'number' && Number.isFinite(shares) && shares > 0;
  const validBuyPrice = typeof buyPrice === 'number' && Number.isFinite(buyPrice) && buyPrice > 0;

  if (!validTicker || !validShares || !validBuyPrice) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const T = ticker.toUpperCase();
  const existing = portfolio.find((h) => h.ticker === T);
  if (existing) {
    const newTotalShares = existing.shares + shares;
    const newWeightedAvgBuyPrice =
      (existing.shares * existing.buyPrice + shares * buyPrice) / newTotalShares;
    existing.shares = newTotalShares;
    existing.buyPrice = Number(newWeightedAvgBuyPrice.toFixed(4));
  } else {
    portfolio.push({ ticker: T, shares, buyPrice });
  }

  // Make sure we have a mock current price for any newly seen ticker
  ensureMockPrice(T, existing ? existing.buyPrice : buyPrice);

  res.json({ ok: true, portfolio, summary: getSummary() });
});

// 4) Delete holding
app.delete('/portfolio/:ticker', (req: Request, res: Response) => {
  const t = String(req.params.ticker || '').toUpperCase();
  portfolio = portfolio.filter((h) => h.ticker !== t);
  res.json({ ok: true, portfolio, summary: getSummary() });
});

// Start server
const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
