"use server"

import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getQuotes, getNews, getHistoricalData } from "@/lib/actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";

export default async function DashboardPage() {
  // Authenticated user
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";

  // Market overview symbols (ETFs representing indices)
  const overviewSymbols = ["SPY", "QQQ", "DIA", "IWM"]; // S&P 500, Nasdaq, Dow Jones, Russell 2000
  const overviewQuotes = await getQuotes(overviewSymbols);

  // Gather a broader set of symbols to compute gainers/losers
  const allSymbols = [...overviewSymbols, "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "TSLA", "META", "ORCL", "JPM", "V", "WMT", "AMD"];
  const allQuotes = await getQuotes(allSymbols);

  // Determine top gainers and losers based on percentage change (dp)
  const sorted = Object.entries(allQuotes).sort(([, a], [, b]) => (b.dp ?? 0) - (a.dp ?? 0));
  const topGainers = sorted.slice(0, 5).map(([sym, data]) => ({ symbol: sym, ...data }));
  const topLosers = sorted.slice(-5).reverse().map(([sym, data]) => ({ symbol: sym, ...data }));

// Fetch historical data for sparkline (if available)
  const overviewHistorical: Record<string, number[] | null> = {};
  await Promise.all(
    overviewSymbols.map(async (sym) => {
      try {
        // fetch last 6 hours of 5‑minute candles
        const now = Math.floor(Date.now() / 1000);
        const sixHoursAgo = now - 6 * 60 * 60;
        const hist = await getHistoricalData(sym, "5", sixHoursAgo, now);
        overviewHistorical[sym] = hist?.c ?? null;
      } catch (e) {
        console.error("Historical data error for", sym, e);
        overviewHistorical[sym] = null;
      }
    })
  );


  // News (general market news fallback)
  const news = await getNews();

  // User watchlist
  const watchlistSymbols = userEmail ? await getWatchlistSymbolsByEmail(userEmail) : [];
  const watchlistQuotes = watchlistSymbols.length ? await getQuotes(watchlistSymbols) : {};

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName} 👋</h1>
          <p className="mt-1 text-muted-foreground">Here's what's happening in the market today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Market Status</p>
          <div className="mt-1 flex items-center justify-end gap-2 text-sm font-medium text-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Market Open
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewSymbols.map((sym) => (
          <MarketIndexCard
            key={sym}
            title={sym}
            quote={overviewQuotes[sym]}
            history={overviewHistorical[sym]}
          />
        ))}
      </section>

      {/* Heatmap + Movers */}
      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr_1fr]">
        <DashboardCard title="Stock Heatmap">
          {/* Placeholder for heatmap widget */}
          <div className="h-[280px] bg-muted/20 rounded-xl" />
        </DashboardCard>
        <DashboardCard title="Top Gainers">
          <MoverList items={topGainers} positive />
        </DashboardCard>
        <DashboardCard title="Top Losers">
          <MoverList items={topLosers} />
        </DashboardCard>
      </section>

      {/* Stories + Watchlist */}
      <section className="grid gap-4 xl:grid-cols-2">
        <DashboardCard title="Top Stories">
          {news && news.length ? (
            news.map((article) => (
              <StoryItem key={article.id} title={article.headline} />
            ))
          ) : (
            <p className="text-muted-foreground">No market stories available yet.</p>
          )}
        </DashboardCard>
        <DashboardCard title="Your Watchlist">
          {watchlistSymbols.length ? (
            watchlistSymbols.map((sym) => {
              const q = watchlistQuotes[sym];
              return (
                <div key={sym} className="flex justify-between py-1 border-b border-border/40 last:border-0">
                  <span>{sym}</span>
                  <span>{q?.c ? `$${q.c.toFixed(2)}` : "-"}</span>
                  <span className={q?.dp && q.dp >= 0 ? "text-emerald-500" : "text-red-500"}>
                    {q?.dp ? `${q.dp.toFixed(2)}%` : "-"}
                  </span>
                </div>
              );
            })
          ) : (
            <EmptyState text="Your watchlist is empty. Search for a stock to start tracking it." />
          )}
        </DashboardCard>
      </section>

      {/* Portfolio + Paper Trading */}
      <section className="grid gap-4 xl:grid-cols-2">
        <DashboardCard title="Portfolio">
          <EmptyState text="Your portfolio is empty. Explore stocks to start investing." />
        </DashboardCard>
        <DashboardCard title="Paper Trading">
          <EmptyState text="Paper trading data is not available yet. Open Paper Trading to start simulating." />
        </DashboardCard>
      </section>
    </div>
  );
}

/* ------------------------------------------------ */
/* Market Card */
/* ------------------------------------------------ */
function MarketIndexCard({ title, quote, history }: { title: string; quote?: { c: number; d: number; dp: number }; history: number[] | null }) {
  // Determine sign
  const isPositive = (quote?.dp ?? 0) >= 0;
  // Format values
  const value = quote?.c ? `$${quote.c.toFixed(2)}` : "—";
  const change = quote
    ? `${quote.dp >= 0 ? "+" : ""}${quote.dp.toFixed(2)}% (${quote.d >= 0 ? "+" : ""}${quote.d.toFixed(2)})`
    : "Loading...";

  // Render sparkline if data available
  const sparkline = (() => {
    if (!history || history.length < 2) return null;
    const max = Math.max(...history);
    const min = Math.min(...history);
    const range = max - min || 1;
    const points = history.map((v, i) => {
      const x = (i / (history.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    });
    return (
      <svg viewBox="0 0 100 100" className="w-16 h-8">
        <polyline
          fill="none"
          stroke={isPositive ? "var(--color-teal-400)" : "var(--color-red-500)"}
          strokeWidth="4"
          points={points.join(" ")}
        />
      </svg>
    );
  })();

  return (
    <div className="rounded-lg border border-border bg-muted/10 p-4 shadow-sm flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <span className="text-xl font-bold text-foreground">{value}</span>
        <span className={isPositive ? "text-emerald-500" : "text-red-500"}>{change}</span>
      </div>
      {sparkline && <div className="ml-2">{sparkline}</div>}
    </div>
  );
}


/* ------------------------------------------------ */
/* Dashboard Card (wrapper) */
/* ------------------------------------------------ */
function DashboardCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/10 p-4 shadow-sm hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold text-foreground mb-3">{title}</h2>
      {children}
    </div>
  );
}


/* ------------------------------------------------ */
/* Movers list */
/* ------------------------------------------------ */
function MoverList({ items, positive }: { items: Array<{ symbol: string; dp: number }>; positive?: boolean }) {
  return (
    <div className="space-y-3">
      {items.map(({ symbol, dp }) => (
        <div key={symbol} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0">
          <span className="font-medium">{symbol}</span>
          <span className={positive ? "text-emerald-500" : "text-red-500"}>
            {dp >= 0 ? `+${dp.toFixed(2)}%` : `${dp.toFixed(2)}%`}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------ */
/* Story item */
/* ------------------------------------------------ */
function StoryItem({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-border/50 p-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">Market Intelligence</p>
    </div>
  );
}

/* ------------------------------------------------ */
/* Empty state component */
/* ------------------------------------------------ */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
