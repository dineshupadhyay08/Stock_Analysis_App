"use server"

import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { getQuotes, getHistoricalData, getCompanyProfiles } from "@/lib/actions/finnhub.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getMarketStatus, getFormattedTodayDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import StockHeatmap from "@/components/dashboard/StockHeatmap";
import { MoverCard } from "@/components/dashboard/MoverCard";
import TopStories from "@/components/dashboard/TopStories";
import { Star } from "lucide-react";

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
  const topGainerSymbols = sorted.slice(0, 10).map(([sym]) => sym);
  const topLoserSymbols = sorted.slice(-10).reverse().map(([sym]) => sym);

  // Fetch company profiles for logos and names
  const allSymbolsForProfiles = [...new Set([...topGainerSymbols, ...topLoserSymbols])];
  const companyProfiles = await getCompanyProfiles(allSymbolsForProfiles);

  // Map data with company info
  const topGainers = topGainerSymbols.map((sym) => ({
    symbol: sym,
    ...(allQuotes[sym] || {}),
    name: companyProfiles[sym]?.name,
    logo: companyProfiles[sym]?.logo,
  }));

  const topLosers = topLoserSymbols.map((sym) => ({
    symbol: sym,
    ...(allQuotes[sym] || {}),
    name: companyProfiles[sym]?.name,
    logo: companyProfiles[sym]?.logo,
  }));

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
        // Silently handle historical data errors to avoid noisy overlays
        overviewHistorical[sym] = null;
      }
    })
  );


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
          {(() => {
            const status = getMarketStatus();
            return (
              <div className="flex flex-col items-end gap-1">
                <div className="text-sm text-muted-foreground">
                  {getFormattedTodayDate()}
                </div>
                <div className={`flex items-center justify-end gap-2 text-sm font-medium ${status.color}`}>
                  <span className={`h-2 w-2 rounded-full ${status.dotColor}`} /> {status.status}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Market Overview */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <section className="grid gap-4 grid-cols-1 lg:grid-cols-4">
        <DashboardCard title="Stock Heatmap" className="lg:col-span-2 h-full">
          <StockHeatmap />
        </DashboardCard>
        <MoverCard items={topGainers} positive title="Top Gainers" />
        <MoverCard items={topLosers} title="Top Losers" />
      </section>

      {/* Stories + Watchlist */}
      <section className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Top Stories">
          <TopStories />
        </DashboardCard>
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Your Watchlist</h2>
            <Link
              href="/watchlist"
              className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
            >
              View All
            </Link>
          </div>
          {watchlistSymbols.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pl-2">Symbol</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-right">Change</th>
                    <th className="pb-3 text-right pr-2">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {watchlistSymbols.slice(0, 5).map((sym) => {
                    const q = watchlistQuotes[sym];
                    return (
                      <tr key={sym} className="group hover:bg-muted/30 transition-colors">
                        <td className="py-2 pl-2">
                          <div className="flex items-center gap-2">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="font-bold text-sm text-foreground">{sym}</span>
                          </div>
                        </td>
                        <td className="py-2 text-right text-sm font-medium text-foreground">
                          {q?.c ? `$${q.c.toFixed(2)}` : "-"}
                        </td>
                        <td className={`py-2 text-right text-sm font-medium ${q?.d && q.d >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {q?.d ? `${q.d >= 0 ? "+" : ""}${q.d.toFixed(2)}` : "-"}
                        </td>
                        <td className={`py-2 text-right pr-2 text-sm font-bold ${q?.dp && q.dp >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {q?.dp ? `${q.dp >= 0 ? "+" : ""}${q.dp.toFixed(2)}%` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState text="No stocks in your watchlist. Add stocks to start tracking them." />
          )}
        </div>
      </section>

      {/* Portfolio + Paper Trading */}
      <section className="grid gap-4 lg:grid-cols-2">
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
      <svg viewBox="0 0 100 100" className="w-20 h-10">
        <polyline
          fill="none"
          stroke={isPositive ? "var(--color-teal-400)" : "var(--color-red-500)"}
          strokeWidth="2"
          points={points.join(" ")}
        />
      </svg>
    );
  })();

  return (
    <div className="rounded-2xl border border-border/50 bg-muted/10 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</span>
        <div>
          <span className="text-2xl font-bold text-foreground">{value}</span>
          <div className={`text-sm font-semibold mt-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>{change}</div>
        </div>
      </div>
      {sparkline && <div className="mt-3 flex justify-end">{sparkline}</div>}
    </div>
  );
}


/* ------------------------------------------------ */
/* Dashboard Card (wrapper) */
/* ------------------------------------------------ */
function DashboardCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-muted/10 p-6 shadow-sm hover:shadow-md transition-shadow", className)}>
      <h2 className="text-lg font-bold text-foreground mb-4">{title}</h2>
      {children}
    </div>
  );
}


/* ------------------------------------------------ */
/* Empty state component */
/* ------------------------------------------------ */
function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border/40 bg-muted/5 p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
