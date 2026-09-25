"use client";

import React, { useState } from "react";
import StockTabs from "@/components/stocks/StockTabs";
import StockOverview from "@/components/stocks/StockOverview";
import ComprehensiveFinancialsDashboard from "@/components/stocks/ComprehensiveFinancialsDashboard";
import TradingViewWidget from "@/components/TradingView";
import {
  CANDLE_CHART_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
} from "@/lib/constants";

type Tab = "Overview" | "Chart" | "Financials" | "Technical Analysis" | "News" | "Profile";

interface StockDetailsClientProps {
  symbol: string;
  comprehensiveFinancials: ComprehensiveFinancialData;
  stockDetail: {
    marketCap: number | null;
    epsBasic: number | null;
    peRatio: number | null;
    dividendYield: number | null;
  };
}

export default function StockDetailsClient({ symbol, comprehensiveFinancials, stockDetail }: StockDetailsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  return (
    <StockTabs activeTab={activeTab} onChange={setActiveTab}>
      {activeTab === "Overview" && <StockOverview symbol={symbol} detail={stockDetail} comprehensiveFinancials={comprehensiveFinancials} />}

      {activeTab === "Chart" && (
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-4 shadow-sm">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
            className="custom-chart"
            height={600}
          />
        </div>
      )}

      {activeTab === "Financials" && (
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-6 shadow-sm">
          <ComprehensiveFinancialsDashboard data={comprehensiveFinancials} />
        </div>
      )}

      {activeTab === "Technical Analysis" && (
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-4 shadow-sm">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
            height={400}
          />
        </div>
      )}

      {activeTab === "Profile" && (
        <div className="rounded-2xl border border-border/50 bg-muted/10 p-4 shadow-sm">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}company-profile.js`}
            config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
            height={440}
          />
        </div>
      )}

      {activeTab === "News" && (
        <div className="text-center py-20 text-muted-foreground">
          Stock-specific news coming soon.
        </div>
      )}
    </StockTabs>
  );
}
