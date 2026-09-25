import Image from "next/image";
import WatchlistButton from "./WatchlistButton";
import { getMarketStatus, getFormattedTodayDate } from "@/lib/utils";

interface StockDetailHeaderProps {
  data: StockDetailData;
  userEmail?: string;
  isInWatchlist: boolean;
}

export default function StockDetailHeader({
  data,
  userEmail,
  isInWatchlist,
}: StockDetailHeaderProps) {
  const { symbol, companyName, logo, exchange, currency, price, change, changePercent } = data;

  const isPositive = (changePercent ?? 0) >= 0;
  const changeColor = isPositive ? "text-emerald-500" : "text-red-500";

  const priceDisplay = price !== null ? `$${price.toFixed(2)}` : "—";
  const changeDisplay =
    change !== null && changePercent !== null
      ? `${change >= 0 ? "+" : ""}${change.toFixed(2)} (${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%)`
      : "—";

  const marketStatus = getMarketStatus();

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border/50 mb-6">
      <div className="flex items-center gap-4 overflow-hidden">
        {/* Logo */}
        {logo ? (
          <div className="relative w-12 h-12 flex-shrink-0 bg-muted rounded-full overflow-hidden border border-border/50">
            <Image
              src={logo}
              alt={companyName}
              fill
              className="object-contain p-1"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-12 h-12 flex-shrink-0 bg-muted rounded-full flex items-center justify-center border border-border/50">
            <span className="text-xs font-bold text-muted-foreground">{symbol.substring(0, 2)}</span>
          </div>
        )}

        {/* Company Info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground tracking-tight truncate">{symbol}</h1>
            <span className="text-sm text-muted-foreground truncate">{companyName}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {exchange} • {currency}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Price & Status */}
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground leading-none">{priceDisplay}</div>
          <div className={`text-sm font-semibold ${changeColor} leading-tight mt-1`}>
            {changeDisplay}
          </div>
          <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${marketStatus.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${marketStatus.dotColor}`} />
            {marketStatus.status}
          </div>
        </div>

        {/* Watchlist Button */}
        <div className="flex-shrink-0">
          <WatchlistButton
            symbol={symbol}
            company={companyName}
            isInWatchlist={isInWatchlist}
            userEmail={userEmail}
            type="icon"
          />
        </div>
      </div>
    </div>
  );
}
