import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
} from 'recharts';
import { API_URL } from './config.ts';

type Holding = { ticker: string; shares: number; buyPrice: number };
type Summary = { totalInvested: number; currentValue: number; totalPL: number };

type PortfolioResponse = {
  holdings: Holding[];
  prices: Record<string, number>;
  summary: Summary;
};

type Theme = 'light' | 'dark';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function App() {
  // App state
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [summary, setSummary] = useState<Summary>({ totalInvested: 0, currentValue: 0, totalPL: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type Toast = { id: number; method: string; url: string; purpose?: string };
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const stored = window.localStorage.getItem('theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const isDark = theme === 'dark';

  // Form state
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  // Toast helper
  function addToast(toast: Omit<Toast, 'id'>, ttl = 2400) {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...toast }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, ttl);
  }

  // Small fetch wrapper to record backend calls
  async function api<T = any>(url: string, init?: RequestInit, purpose?: string): Promise<T> {
    const method = (init?.method || 'GET').toUpperCase();
    addToast({ method, url, purpose });
    const res = await fetch(url, init);
    return (await res.json()) as T;
  }

  // Fetch portfolio from backend
  async function fetchPortfolio() {
    setLoading(true);
    setError(null);
    try {
      const data = await api<PortfolioResponse>(`${API_URL}/portfolio`, undefined, 'Fetch portfolio');
      setHoldings(data.holdings || []);
      setPrices(data.prices || {});
      setSummary(data.summary || { totalInvested: 0, currentValue: 0, totalPL: 0 });
    } catch (e) {
      setError('Failed to load portfolio. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPortfolio();
  }, []);

  async function handleAddHolding(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      ticker: ticker.trim(),
      shares: Number(shares),
      buyPrice: Number(buyPrice),
    };

    if (!payload.ticker || !Number.isFinite(payload.shares) || !Number.isFinite(payload.buyPrice)) {
      setError('Please provide valid Ticker, Shares, and Buy Price.');
      return;
    }

    try {
      await api(`${API_URL}/portfolio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }, 'Add/Update holding');
      await fetchPortfolio();
      // Clear form
      setTicker('');
      setShares('');
      setBuyPrice('');
    } catch (e) {
      setError('Failed to add/update holding.');
    }
  }

  async function handleDelete(t: string) {
    setError(null);
    try {
      await api(`${API_URL}/portfolio/${encodeURIComponent(t)}`, { method: 'DELETE' }, `Delete ${t}`);
      await fetchPortfolio();
    } catch (e) {
      setError('Failed to delete holding.');
    }
  }

  const cards = useMemo(
    () => [
      {
        label: 'Total Invested',
        value: currency.format(summary.totalInvested),
        className: 'text-slate-900 dark:text-slate-100',
      },
      {
        label: 'Current Value',
        value: currency.format(summary.currentValue),
        className: 'text-slate-900 dark:text-slate-100',
      },
      {
        label: 'Total P/L',
        value: currency.format(summary.totalPL),
        className: summary.totalPL >= 0
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-rose-600 dark:text-rose-400',
      },
    ],
    [summary]
  );

  // Chart data
  const allocationData = useMemo(() => {
    return holdings.map((h) => {
      const current = prices[h.ticker] ?? h.buyPrice;
      const value = h.shares * current;
      return { name: h.ticker, value };
    });
  }, [holdings, prices]);

  const plData = useMemo(() => {
    return holdings.map((h) => {
      const current = prices[h.ticker] ?? h.buyPrice;
      const costBasis = h.shares * h.buyPrice;
      const positionValue = h.shares * current;
      const pl = positionValue - costBasis;
      return { name: h.ticker, pl };
    });
  }, [holdings, prices]);

  const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#ef4444', '#a78bfa', '#f97316', '#14b8a6'];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Header */}
      <header className="w-full border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800/40 dark:bg-gradient-to-r dark:from-indigo-700 dark:via-violet-700 dark:to-fuchsia-700">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500/20 flex items-center justify-center dark:bg-white/10 dark:ring-white/20">
              {/* simple spark icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-indigo-600 dark:text-white/90">
                <path d="M12 2l1.546 4.76h4.999l-4.043 2.938 1.546 4.76L12 11.52 7.952 14.46l1.546-4.76L5.455 6.76h4.999L12 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">OP Stock Portfolio Tracker</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 bg-white border border-slate-200 rounded px-2 py-0.5 font-medium shadow-sm dark:text-white/80 dark:bg-white/10 dark:border-white/20">
              Kamlesh Kumar
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow hover:border-indigo-400 hover:text-indigo-600 dark:border-white/30 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/20 transition-colors"
              aria-pressed={isDark}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              <span className="inline-flex h-4 w-4 items-center justify-center">
                {isDark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3a1 1 0 0 1 1 1v1.055a5.5 5.5 0 0 1 4.945 4.945H19a1 1 0 1 1 0 2h-1.055A5.5 5.5 0 0 1 13 16.945V18a1 1 0 1 1-2 0v-1.055A5.5 5.5 0 0 1 6.055 12H5a1 1 0 0 1 0-2h1.055A5.5 5.5 0 0 1 11 5.055V4a1 1 0 0 1 1-1Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm0-18a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Zm10 7h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2Zm-18 0H3a1 1 0 0 1 0-2h1a1 1 0 1 1 0 2Zm15.657 8.071-0.707-0.707a1 1 0 1 1 1.414-1.414l0.707 0.707a1 1 0 1 1-1.414 1.414ZM5.343 5.343 4.636 4.636a1 1 0 1 1 1.414-1.414l0.707 0.707A1 1 0 0 1 5.343 5.343Zm12.728-1.414 0.707-0.707a1 1 0 0 1 1.414 1.414l-0.707 0.707a1 1 0 1 1-1.414-1.414ZM4.636 19.364l0.707-0.707a1 1 0 0 1 1.414 1.414l-0.707 0.707a1 1 0 0 1-1.414-1.414Z" />
                  </svg>
                )}
              </span>
              <span>{isDark ? 'Light' : 'Dark'} mode</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto p-4 grid gap-4">
        {/* Errors */}
        {error && (
          <div className="rounded border border-red-200 bg-red-100 px-3 py-2 text-sm text-red-700 shadow-sm dark:border-red-700/60 dark:bg-red-900/40 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-lg transition-colors dark:border-transparent dark:bg-slate-800"
            >
              <div className="text-xs uppercase text-slate-500 dark:text-slate-400">{c.label}</div>
              <div className={`text-xl font-semibold ${c.className}`}>{c.value}</div>
            </div>
          ))}
        </section>

        {/* Holdings table */}
        <section className="rounded-xl border border-slate-200/70 bg-white/95 p-4 shadow-lg transition-colors dark:border-transparent dark:bg-slate-800/70 dark:ring-1 dark:ring-slate-700/60">
          <div className="mb-3 text-xs uppercase text-slate-500 dark:text-slate-400">Holdings</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-slate-700 dark:text-slate-200">
              <thead className="sticky top-0 bg-slate-100/95 backdrop-blur dark:bg-slate-800/80">
                <tr className="text-left text-xs uppercase text-slate-500 dark:text-slate-400">
                  <th className="py-2 pr-4">Ticker</th>
                  <th className="py-2 pr-4 text-right">Shares</th>
                  <th className="py-2 pr-4 text-right">Avg Buy Price</th>
                  <th className="py-2 pr-4 text-right">Current Price</th>
                  <th className="py-2 pr-4 text-right">Position Value</th>
                  <th className="py-2 pr-4 text-right">P/L</th>
                  <th className="py-2 pr-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.length === 0 && (
                  <tr>
                    <td className="py-3 text-center text-slate-500 dark:text-slate-400" colSpan={7}>
                      {loading ? 'Loading...' : 'No holdings yet. Add one below.'}
                    </td>
                  </tr>
                )}
                {holdings.map((h) => {
                  const current = prices[h.ticker] ?? h.buyPrice;
                  const costBasis = h.shares * h.buyPrice;
                  const positionValue = h.shares * current;
                  const rowPL = positionValue - costBasis;
                  return (
                    <tr
                      key={h.ticker}
                      className="border-t border-slate-200/70 hover:bg-slate-100 dark:border-slate-700/60 dark:hover:bg-slate-700/30"
                    >
                      <td className="py-2 pr-4 font-medium">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[holdings.indexOf(h) % COLORS.length] }} />
                          <span className="rounded px-2 py-0.5 text-xs font-semibold text-slate-700 bg-slate-200/80 dark:bg-slate-700/60 dark:text-slate-200">
                            {h.ticker}
                          </span>
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right">{h.shares}</td>
                      <td className="py-2 pr-4 text-right">{currency.format(h.buyPrice)}</td>
                      <td className="py-2 pr-4 text-right">{currency.format(current)}</td>
                      <td className="py-2 pr-4 text-right">{currency.format(positionValue)}</td>
                      <td
                        className={`py-2 pr-4 text-right ${
                          rowPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {currency.format(rowPL)}
                      </td>
                      <td className="py-2 pr-0">
                        <button
                          onClick={() => handleDelete(h.ticker)}
                          className="rounded bg-rose-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-rose-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Insights (Charts) */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200/70 bg-white/95 p-4 shadow-lg transition-colors dark:border-transparent dark:bg-slate-800/70 dark:ring-1 dark:ring-slate-700/60">
            <div className="mb-3 text-xs uppercase text-slate-500 dark:text-slate-400">Allocation by Value</div>
            <div className="h-64">
              {allocationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                      {allocationData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={24} />
                    <ReTooltip formatter={(v: number) => currency.format(v)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid h-full place-items-center text-sm text-slate-500 dark:text-slate-400">
                  Add holdings to see allocation
                </div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-white/95 p-4 shadow-lg transition-colors dark:border-transparent dark:bg-slate-800/70 dark:ring-1 dark:ring-slate-700/60">
            <div className="mb-3 text-xs uppercase text-slate-500 dark:text-slate-400">P/L by Ticker</div>
            <div className="h-64">
              {plData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={plData}>
                    <XAxis dataKey="name" stroke={isDark ? '#94a3b8' : '#475569'} />
                    <YAxis
                      stroke={isDark ? '#94a3b8' : '#475569'}
                      tickFormatter={(v: number) => (Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                    />
                    <ReTooltip formatter={(v: number) => currency.format(v)} />
                    <Bar dataKey="pl" radius={[4, 4, 0, 0]}>
                      {plData.map((d, idx) => (
                        <Cell key={`bar-${idx}`} fill={d.pl >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid h-full place-items-center text-sm text-slate-500 dark:text-slate-400">
                  Add holdings to see P/L
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Add / Update Holding form */}
        <section className="rounded-xl border border-slate-200/70 bg-white/95 p-4 shadow-lg transition-colors dark:border-transparent dark:bg-slate-800/70 dark:ring-1 dark:ring-slate-700/60">
          <div className="mb-3 text-xs uppercase text-slate-500 dark:text-slate-400">Add / Update Holding</div>
          <form onSubmit={handleAddHolding} className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="ticker">
                Ticker
              </label>
              <input
                id="ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="AAPL"
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="shares">
                Shares
              </label>
              <input
                id="shares"
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="10"
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="buyPrice">
                Buy Price
              </label>
              <input
                id="buyPrice"
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="180"
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded bg-indigo-600 py-2 font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Add / Update
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* Toasts (backend activity) */}
      <div className="pointer-events-none fixed bottom-4 left-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => {
          const accent =
            t.method === 'GET' ? 'border-l-sky-400' : t.method === 'POST' ? 'border-l-indigo-400' : 'border-l-rose-400';
          const badge =
            t.method === 'GET'
              ? 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300'
              : t.method === 'POST'
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'
                : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300';
          const iconColor =
            t.method === 'GET'
              ? 'text-sky-500 dark:text-sky-300'
              : t.method === 'POST'
                ? 'text-indigo-500 dark:text-indigo-300'
                : 'text-rose-500 dark:text-rose-300';
          return (
            <div
              key={t.id}
              className={`toast-enter relative flex w-[28rem] max-w-[92vw] items-start gap-3 rounded-md border border-slate-200 bg-white/95 px-3 py-2.5 text-sm text-slate-700 shadow-2xl ring-2 ring-indigo-200/40 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100 dark:ring-indigo-500/20 border-l-8 ${accent}`}
              role="status"
            >
              <div
                className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 ring-1 ring-slate-300 dark:bg-slate-800/80 dark:ring-white/10 ${iconColor}`}
              >
                {/* Activity icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M3 12h3l2-5 4 10 2-5h5" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <div className={`mt-0.5 text-[10px] px-1.5 py-0.5 rounded ${badge} font-semibold`}>{t.method}</div>
              <div className="flex-1 break-all leading-relaxed">
                <div className="font-semibold">{t.url}</div>
                {t.purpose && <div className="text-slate-500 dark:text-slate-400">{t.purpose}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
