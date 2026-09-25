import StockDetailHeader from "@/components/stocks/StockDetailHeader";
import StockMetricsStrip from "@/components/stocks/StockMetricsStrip";
import StockDetailsClient from "@/components/stocks/StockDetailsClient";
import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { isStockInWatchlist } from "@/lib/actions/watchlist.actions";
import { getStockDetail } from "@/lib/actions/finnhub.actions";
import { getComprehensiveFinancials } from "@/lib/actions/comprehensive-financials.actions";

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;

  // Get current user (server-side only)
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  const userEmail = session?.user?.email || "";

  // Fetch stock detail data and comprehensive financial data in parallel
  const [stockDetail, comprehensiveFinancials] = await Promise.all([
    getStockDetail(symbol),
    getComprehensiveFinancials(symbol),
  ]);

  // Check if stock is in user's watchlist (server-side only)
  const inWatchlist = userEmail
    ? await isStockInWatchlist(symbol.toUpperCase(), userEmail)
    : false;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Compact Hero Header */}
        <StockDetailHeader
          data={stockDetail}
          userEmail={userEmail}
          isInWatchlist={inWatchlist}
        />

        {/* Quick Metrics Strip */}
        <StockMetricsStrip data={stockDetail} />

        {/* Research Interface with Tabs (client component) */}
        <StockDetailsClient symbol={symbol} stockDetail={stockDetail} comprehensiveFinancials={comprehensiveFinancials} />
      </div>
    </div>
  );
}


