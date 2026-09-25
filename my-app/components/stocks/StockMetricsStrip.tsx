"use client";

interface StockMetricsStripProps {
  data: StockDetailData;
}

type MetricKey = keyof StockDetailData;

interface MetricCard {
  label: string;
  key: MetricKey;
  format?: (value: any) => string;
}

const METRIC_CARDS: MetricCard[] = [
  {
    label: "Market Cap",
    key: "marketCap",
    format: (val) => {
      if (!val) return "—";
      // Finnhub Market Cap is returned in Millions
      const valueInDollars = val * 1e6;
      if (valueInDollars >= 1e12) return `$${(valueInDollars / 1e12).toFixed(2)}T`;
      if (valueInDollars >= 1e9) return `$${(valueInDollars / 1e9).toFixed(2)}B`;
      if (valueInDollars >= 1e6) return `$${(valueInDollars / 1e6).toFixed(2)}M`;
      return `$${valueInDollars.toFixed(0)}`;
    },
  },
  {
    label: "EPS (TTM)",
    key: "epsBasic",
    format: (val) => (val !== null ? `$${val.toFixed(2)}` : "—"),
  },
  {
    label: "P/E Ratio",
    key: "peRatio",
    format: (val) => (val !== null ? `${val.toFixed(2)}` : "—"),
  },
  {
    label: "Dividend Yield",
    key: "dividendYield",
    format: (val) => (val !== null ? `${val.toFixed(2)}%` : "—"),
  },
  {
    label: "Upcoming Earnings",
    key: "ipoDate", // Placeholder key since real earnings date isn't available in current Finnhub action
    format: () => "Data unavailable",
  },
];

export default function StockMetricsStrip({ data }: StockMetricsStripProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
      {METRIC_CARDS.map((metric) => {
        const value = data[metric.key];
        const displayValue = metric.format ? metric.format(value) : String(value ?? "—");

        return (
          <div
            key={metric.label}
            className="rounded-lg border border-border/50 bg-muted/10 p-3 shadow-sm"
          >
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {metric.label}
            </div>
            <div className="text-base font-bold text-foreground mt-1 truncate">
              {displayValue}
            </div>
          </div>
        );
      })}
    </div>
  );
}
