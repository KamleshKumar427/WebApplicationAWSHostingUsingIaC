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
      setError('Failed to load portfolio. Is the backend running on http://localhost:4000?');
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
      { label: 'Total Invested', value: currency.format(summary.totalInvested), className: 'text-slate-100' },
      { label: 'Current Value', value: currency.format(summary.currentValue), className: 'text-slate-100' },
      {
        label: 'Total P/L',
        value: currency.format(summary.totalPL),
        className: summary.totalPL >= 0 ? 'text-green-400' : 'text-red-400',
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
    <div className="min-h-screen">
      {/* Header */}
      <header className="w-full bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 border-b border-slate-800/40">
        <div className="max-w-5xl mx-auto flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
              {/* simple spark icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white/90">
                <path d="M12 2l1.546 4.76h4.999l-4.043 2.938 1.546 4.76L12 11.52 7.952 14.46l1.546-4.76L5.455 6.76h4.999L12 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white">OP Stock Portfolio Tracker</h1>
          </div>
          <span className="text-xs text-white/80 bg-white/10 border border-white/20 rounded px-2 py-0.5">Kamlesh Kumar</span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto p-4 grid gap-4">
        {/* Errors */}
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-200 rounded p-3 text-sm">{error}</div>
        )}

        {/* Summary cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-slate-800 rounded-xl p-4 shadow-lg">
              <div className="text-slate-400 text-xs uppercase">{c.label}</div>
              <div className={`text-xl font-semibold ${c.className}`}>{c.value}</div>
            </div>
          ))}
        </section>

        {/* Holdings table */}
        <section className="bg-slate-800/70 backdrop-blur rounded-xl p-4 shadow-lg ring-1 ring-slate-700/60">
          <div className="text-slate-400 text-xs uppercase mb-3">Holdings</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-slate-200 text-sm">
              <thead className="sticky top-0 bg-slate-800/80 backdrop-blur">
                <tr className="text-slate-400 uppercase text-xs text-left">
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
                    <td className="py-3 text-slate-400" colSpan={7}>
                      {loading ? 'Loading…' : 'No holdings yet. Add one below.'}
                    </td>
                  </tr>
                )}
                {holdings.map((h) => {
                  const current = prices[h.ticker] ?? h.buyPrice;
                  const costBasis = h.shares * h.buyPrice;
                  const positionValue = h.shares * current;
                  const rowPL = positionValue - costBasis;
                  return (
                    <tr key={h.ticker} className="border-t border-slate-700/60 hover:bg-slate-700/30">
                      <td className="py-2 pr-4 font-medium">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[holdings.indexOf(h) % COLORS.length] }} />
                          <span className="px-2 py-0.5 rounded bg-slate-700/60 text-slate-200 text-xs font-semibold">
                            {h.ticker}
                          </span>
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right">{h.shares}</td>
                      <td className="py-2 pr-4 text-right">{currency.format(h.buyPrice)}</td>
                      <td className="py-2 pr-4 text-right">{currency.format(current)}</td>
                      <td className="py-2 pr-4 text-right">{currency.format(positionValue)}</td>
                      <td className={`py-2 pr-4 text-right ${rowPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {currency.format(rowPL)}
                      </td>
                      <td className="py-2 pr-0">
                        <button
                          onClick={() => handleDelete(h.ticker)}
                          className="rounded bg-red-600 hover:bg-red-500 text-white text-xs px-2 py-1"
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
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/70 backdrop-blur rounded-xl p-4 shadow-lg ring-1 ring-slate-700/60">
            <div className="text-slate-400 text-xs uppercase mb-3">Allocation by Value</div>
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
                <div className="h-full grid place-items-center text-slate-400 text-sm">Add holdings to see allocation</div>
              )}
            </div>
          </div>
          <div className="bg-slate-800/70 backdrop-blur rounded-xl p-4 shadow-lg ring-1 ring-slate-700/60">
            <div className="text-slate-400 text-xs uppercase mb-3">P/L by Ticker</div>
            <div className="h-64">
              {plData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={plData}>
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" tickFormatter={(v: number) => (Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} />
                    <ReTooltip formatter={(v: number) => currency.format(v)} />
                    <Bar dataKey="pl" radius={[4, 4, 0, 0]}>
                      {plData.map((d, idx) => (
                        <Cell key={`bar-${idx}`} fill={d.pl >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full grid place-items-center text-slate-400 text-sm">Add holdings to see P/L</div>
              )}
            </div>
          </div>
        </section>

        {/* Add / Update Holding form */}
        <section className="bg-slate-800/70 backdrop-blur rounded-xl p-4 shadow-lg ring-1 ring-slate-700/60">
          <div className="text-slate-400 text-xs uppercase mb-3">Add / Update Holding</div>
          <form onSubmit={handleAddHolding} className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 text-sm mb-1" htmlFor="ticker">
                Ticker
              </label>
              <input
                id="ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="AAPL"
                className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1" htmlFor="shares">
                Shares
              </label>
              <input
                id="shares"
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="10"
                className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1" htmlFor="buyPrice">
                Buy Price
              </label>
              <input
                id="buyPrice"
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="180"
                className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded"
              >
                Add / Update
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* Toasts (backend activity) */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const color = t.method === 'GET' ? 'border-sky-400' : t.method === 'POST' ? 'border-indigo-400' : 'border-rose-400';
          const badge = t.method === 'GET' ? 'bg-sky-500/20 text-sky-300' : t.method === 'POST' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-rose-500/20 text-rose-300';
          const iconColor = t.method === 'GET' ? 'text-sky-300' : t.method === 'POST' ? 'text-indigo-300' : 'text-rose-300';
          return (
            <div
              key={t.id}
              className={`toast-enter relative flex items-start gap-3 bg-slate-900/90 border border-slate-700 ${color} border-l-8 rounded-md px-3 py-2.5 text-sm shadow-2xl ring-2 ring-indigo-500/20 backdrop-blur-md w-[28rem] max-w-[92vw]`}
              role="status"
            >
              <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/80 ring-1 ring-white/10 ${iconColor}`}>
                {/* Activity icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M3 12h3l2-5 4 10 2-5h5" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <div className={`mt-0.5 text-[10px] px-1.5 py-0.5 rounded ${badge} font-semibold`}>{t.method}</div>
              <div className="flex-1 text-slate-100/90 break-all leading-relaxed">
                <div className="font-semibold">{t.url}</div>
                {t.purpose && <div className="text-slate-400">{t.purpose}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
