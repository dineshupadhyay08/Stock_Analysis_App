import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getWatchlistWithQuotes } from "@/lib/actions/watchlist.actions";
import { getQuotes, getCompanyProfiles } from "@/lib/actions/finnhub.actions";
import WatchlistPageClient from "@/components/WatchlistPageClient";

export default async function WatchlistPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userEmail = session?.user?.email || "";

  if (!userEmail) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sign in required</h1>
          <p className="text-muted-foreground mt-2">Please sign in to view your watchlist.</p>
        </div>
      </div>
    );
  }

  // Fetch watchlist items
  const watchlistItems = await getWatchlistWithQuotes(userEmail);
  const symbols = watchlistItems.map((item) => item.symbol);

  // Fetch quotes and profiles for all symbols
  const [quotes, profiles] = await Promise.all([
    symbols.length > 0 ? getQuotes(symbols) : Promise.resolve({}),
    symbols.length > 0 ? getCompanyProfiles(symbols) : Promise.resolve({}),
  ]);

  // Combine watchlist items with quotes and profiles
  const watchlistWithData = watchlistItems.map((item) => {
    const quote = (quotes as Record<string, any>)[item.symbol];
    const profile = (profiles as Record<string, any>)[item.symbol];
    return {
      ...item,
      price: quote?.c || null,
      change: quote?.d || null,
      changePercent: quote?.dp || null,
      logo: profile?.logo || "",
      companyName: profile?.name || item.company,
      marketCap: profile?.marketCapitalization || null,
      peRatio: profile?.peBasic || null,
    };
  });

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <WatchlistPageClient
          initialWatchlist={watchlistWithData}
          userEmail={userEmail}
        />
      </div>
    </div>
  );
}
