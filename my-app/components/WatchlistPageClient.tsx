"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Star,
  Trash2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Loader2,
  Plus
} from "lucide-react";
import {
  addToWatchlist,
  removeFromWatchlist
} from "@/lib/actions/watchlist.actions";
import {
  searchStocks,
  getQuotes
} from "@/lib/actions/finnhub.actions";

interface WatchlistItem {
  symbol: string;
  company: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  logo: string;
  companyName: string;
  marketCap: number | null;
  peRatio: number | null;
  addedAt: Date;
}

interface SearchResult {
  symbol: string;
  name: string;
  isInWatchlist: boolean;
  price?: number;
}

interface WatchlistPageClientProps {
  initialWatchlist: WatchlistItem[];
  userEmail: string;
}

export default function WatchlistPageClient({
  initialWatchlist,
  userEmail,
}: WatchlistPageClientProps) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(initialWatchlist);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Search for stocks to add
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchStocks(searchTerm.trim());
        const symbols = results.map(r => r.symbol);
        const quotes = await getQuotes(symbols);

        const finalResults = results.map(r => ({
          ...r,
          price: quotes[r.symbol]?.c,
          // Check if it's in current watchlist
          isInWatchlist: watchlist.some(item => item.symbol === r.symbol)
        }));

        setSearchResults(finalResults);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to search stocks");
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, watchlist]);

  const toggleWatchlist = async (symbol: string, name: string) => {
    const isInWatchlist = watchlist.some(item => item.symbol === symbol);
    setOperationLoading(symbol);
    setError(null);

    try {
      if (isInWatchlist) {
        const result = await removeFromWatchlist(symbol, userEmail);
        if (result.success) {
          setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
        } else {
          setError(result.error || "Failed to remove stock");
        }
      } else {
        const result = await addToWatchlist(symbol, name, userEmail);
        if (result.success) {
          // To avoid a full page refresh, we fetch the updated quote and profile
          // but for now, we can just add a placeholder and let the user know or
          // we can re-fetch the whole watchlist.
          // The most robust way is to re-fetch or manually add the item.
          const quote = await getQuotes([symbol]);
          const profile = await (await import("@/lib/actions/finnhub.actions")).getCompanyProfiles([symbol]);
          const p = profile[symbol];

          const newItem: WatchlistItem = {
            symbol,
            company: name,
            companyName: p?.name || name,
            logo: p?.logo || "",
            price: quote[symbol]?.c || null,
            change: quote[symbol]?.d || null,
            changePercent: quote[symbol]?.dp || null,
            marketCap: p?.marketCap || null,
            peRatio: p?.peRatio || null,
            addedAt: new Date(),
          };
          setWatchlist(prev => [newItem, ...prev]);
        } else {
          setError(result.error || "Failed to add stock");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setOperationLoading(null);
    }
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    if (watchlist.length === 0) return null;

    const validChanges = watchlist.filter(item => item.changePercent !== null);
    const avgChange = validChanges.length > 0
      ? validChanges.reduce((acc, item) => acc + (item.changePercent || 0), 0) / validChanges.length
      : 0;

    const topPerformer = [...watchlist].sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))[0];

    return {
      avgChange,
      topPerformer
    };
  }, [watchlist]);

  const formatNumber = (val: number | null, type: 'currency' | 'percent' | 'compact') => {
    if (val === null) return "—";
    if (type === 'currency') return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (type === 'percent') return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
    if (type === 'compact') {
      if (val >= 1e12) return `${(val / 1e12).toFixed(2)}T`;
      if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
      if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
      return val.toLocaleString();
    }
    return val.toString();
  };

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Star className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No stocks in your watchlist yet</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Search for a stock and add it to start tracking market movements and performance.
        </p>
        <button
          onClick={() => setIsSearchOpen(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" /> Add Stock
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Watchlist</h1>
          <p className="text-muted-foreground mt-1">Track your favorite stocks and never miss a move.</p>
        </div>
        <button
          onClick={() => setIsSearchOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 text-sm w-fit"
        >
          <Plus className="w-4 h-4" /> Add Stock
        </button>
      </div>

      {/* Main Watchlist Card */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Symbol</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">% Change</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Market Cap</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">P/E</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {watchlist.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                        {stock.logo ? (
                          <Image
                            src={stock.logo}
                            alt={stock.symbol}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {stock.symbol}
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/stocks/${stock.symbol.toLowerCase()}`}
                        className="font-bold text-foreground group-hover:text-blue-500 transition-colors"
                      >
                        {stock.symbol}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground truncate max-w-[200px]">
                    {stock.companyName}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-foreground">
                    {formatNumber(stock.price, 'currency')}
                  </td>
                  <td className={`px-6 py-4 text-right text-sm font-medium ${stock.change && stock.change > 0 ? 'text-emerald-500' : stock.change && stock.change < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {stock.change !== null ? `${stock.change > 0 ? '+' : ''}${stock.change.toFixed(2)}` : '—'}
                  </td>
                  <td className={`px-6 py-4 text-right text-sm font-bold ${stock.changePercent && stock.changePercent > 0 ? 'text-emerald-500' : stock.changePercent && stock.changePercent < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {formatNumber(stock.changePercent, 'percent')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                    {formatNumber(stock.marketCap, 'compact')}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-muted-foreground">
                    {stock.peRatio !== null ? stock.peRatio.toFixed(2) : '—'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleWatchlist(stock.symbol, stock.companyName)}
                      disabled={operationLoading === stock.symbol}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all disabled:opacity-50"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Section */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Aggregate Performance */}
          <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Watchlist Performance</h3>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${metrics.avgChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatNumber(metrics.avgChange, 'percent')}
              </span>
              <span className="text-xs text-muted-foreground">Avg Today</span>
            </div>
            <div className="mt-4 h-12 w-full bg-muted/20 rounded-lg flex items-center justify-center text-xs text-muted-foreground italic">
              Sparkline Visualization
            </div>
          </div>

          {/* Top Performer */}
          <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Top Performer</h3>
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-muted border border-border/50">
                {metrics.topPerformer?.logo && (
                  <Image src={metrics.topPerformer.logo} alt={metrics.topPerformer.symbol} fill className="object-cover" unoptimized />
                )}
              </div>
              <div>
                <div className="font-bold text-foreground leading-none">{metrics.topPerformer?.symbol}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[100px]">{metrics.topPerformer?.companyName}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-lg font-bold text-emerald-500">
                  {formatNumber(metrics.topPerformer?.changePercent, 'percent')}
                </div>
              </div>
            </div>
          </div>

          {/* Market Summary */}
          <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Market Movers</h3>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Assets</span>
                <span className="font-medium text-foreground">{watchlist.length} Stocks</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Top Gain</span>
                <span className="font-bold text-emerald-500">
                  {formatNumber(metrics.topPerformer?.changePercent, 'percent')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Search Popover */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-background/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus
                  className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                  placeholder="Search symbol or company name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <p className="text-sm">Searching market data...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  {searchTerm.trim() ? "No matching stocks found" : "Type a symbol to search"}
                </div>
              ) : (
                <ul className="space-y-1">
                  {searchResults.map((stock) => (
                    <li
                      key={stock.symbol}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer group"
                      onClick={() => {
                        // We can't easily get the company name for the action from the search result alone
                        // if it's not in the search result, but searchStocks returns 'name'.
                        toggleWatchlist(stock.symbol, stock.name);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                          {stock.symbol}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{stock.symbol}</div>
                          <div className="text-xs text-muted-foreground">{stock.name}</div>
                        </div>
                        {stock.price && (
                          <div className="ml-2 text-xs font-medium text-muted-foreground">
                            ${stock.price.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <button
                        className={`p-2 rounded-full transition-all ${
                          stock.isInWatchlist
                            ? 'text-yellow-500 bg-yellow-500/10'
                            : 'text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10'
                        }`}
                      >
                        <Star className={`w-5 h-5 ${stock.isInWatchlist ? 'fill-yellow-500' : ''}`} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="fixed inset-0 -z-10" onClick={() => setIsSearchOpen(false)} />
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 right-6 p-4 bg-red-500 text-white rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4 flex items-center gap-3">
          <X className="w-4 h-4" onClick={() => setError(null)} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
}
