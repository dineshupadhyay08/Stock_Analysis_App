"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import TradingViewWidget from "@/components/TradingView";
import {
  CANDLE_CHART_WIDGET_CONFIG,
} from "@/lib/constants";

interface StockOverviewProps {
  symbol: string;
  detail: {
    marketCap: number | null;
    epsBasic: number | null;
    peRatio: number | null;
    dividendYield: number | null;
  };
  comprehensiveFinancials?: any;
}

export default function StockOverview({ symbol, detail, comprehensiveFinancials }: StockOverviewProps) {
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme is loaded before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  // Map resolved theme to TradingView colorTheme
  // resolvedTheme accounts for system preference
  const colorTheme = resolvedTheme === "light" ? "light" : "dark";

  return (
    <div className="space-y-6">
      {/* Main Research Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Price Chart (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-border/50 bg-muted/10 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Price Action</h3>
              <div className="flex items-center gap-1">
                {["1D", "1W", "1M", "3M", "6M", "YTD", "1Y", "5Y", "ALL"].map((tf) => (
                  <button
                    key={tf}
                    className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
            <TradingViewWidget
              scriptUrl={`${scriptUrl}advanced-chart.js`}
              config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
              className="custom-chart"
              height={500}
            />
          </div>
        </div>

        {/* Right: Technical Analysis (1/3 width) */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border/50 bg-muted/10 p-4 shadow-sm h-full">
            <h3 className="font-bold text-foreground mb-4">Technical Analysis</h3>
            <TradingViewWidget
              scriptUrl={`${scriptUrl}technical-analysis.js`}
              config={{
                symbol: symbol.toUpperCase(),
                colorTheme: "dark",
                isTransparent: "true",
                locale: "en",
                width: "100%",
                height: 400,
                interval: "1h",
              }}
              height={450}
              key={`technical-${symbol}`}
            />
          </div>
        </div>
      </div>

      {/* Bottom Three Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Financials (TTM) */}
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Financials (TTM)</h3>
          <div className="space-y-3">
          <FinancialMetric label="Revenue" value={
            comprehensiveFinancials?.incomeStatementTrend?.[0]?.revenue !== undefined && comprehensiveFinancials?.incomeStatementTrend?.[0]?.revenue !== null
              ? `$${comprehensiveFinancials.incomeStatementTrend[0].revenue.toLocaleString()}`
              : "--"
          } />
          <FinancialMetric label="Net Income" value={
            comprehensiveFinancials?.incomeStatementTrend?.[0]?.netIncome !== undefined && comprehensiveFinancials?.incomeStatementTrend?.[0]?.netIncome !== null
              ? `$${comprehensiveFinancials.incomeStatementTrend[0].netIncome.toLocaleString()}`
              : "--"
          } />
            <FinancialMetric label="EPS" value={detail?.epsBasic != null ? `$${detail.epsBasic!.toFixed(2)}` : "--"} />
          </div>
        </div>

        {/* Valuation */}
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Valuation</h3>
          <div className="space-y-3">
            <FinancialMetric
              label="Market Cap"
              value={
                detail?.marketCap
                  ? (() => {
                      const valInDollars = detail.marketCap * 1e6;
                      if (valInDollars >= 1e12) return `$${(valInDollars / 1e12).toFixed(2)}T`;
                      if (valInDollars >= 1e9) return `$${(valInDollars / 1e9).toFixed(2)}B`;
                      if (valInDollars >= 1e6) return `$${(valInDollars / 1e6).toFixed(2)}M`;
                      return `$${valInDollars.toFixed(0)}`;
                    })()
                  : "--"
              }
            />
            <FinancialMetric
              label="P/E Ratio"
              value={detail?.peRatio !== null && detail?.peRatio !== undefined ? detail.peRatio.toFixed(2) : "--"}
            />
            <FinancialMetric label="P/S Ratio" value="--" />
          </div>
        </div>

        {/* Dividends */}
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-6 shadow-sm">
          <h3 className="font-bold text-foreground mb-4">Dividends</h3>
          <div className="space-y-3">
            <FinancialMetric
              label="Dividend Yield"
              value={detail?.dividendYield !== null ? `${detail.dividendYield.toFixed(2)}%` : "--"}
            />
            <FinancialMetric label="Div / Share" value="--" />
            <FinancialMetric label="Payout Ratio" value="--" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/20 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}
