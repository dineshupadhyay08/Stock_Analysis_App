export function MarketTicker() {
  const tickers = [
    { name: "S&P 500", price: "5,283.76", change: "+0.82%", pos: true },
    { name: "NASDAQ", price: "16,387.31", change: "+1.24%", pos: true },
    { name: "DOW JONES", price: "39,142.23", change: "-0.21%", pos: false },
    { name: "VIX", price: "16.32", change: "-2.40%", pos: false },
    { name: "GOLD", price: "2,350.10", change: "+0.45%", pos: true },
  ];

  return (
    <div className="w-full border-y border-border/40 bg-muted/20 py-4 overflow-hidden">
      <div className="container mx-auto px-4 flex gap-12 whitespace-nowrap overflow-x-auto scrollbar-hide">
        {tickers.map((t) => (
          <div key={t.name} className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-muted-foreground">{t.name}</span>
            <span className="font-mono font-medium">{t.price}</span>
            <span className={`font-mono ${t.pos ? "text-green-500" : "text-red-500"}`}>
              {t.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
